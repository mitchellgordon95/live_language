/**
 * Unified Mode: Structured game state + AI-generated effects
 *
 * Keeps: grammar feedback, goals, needs, object lists, vocabulary tracking
 * Removes: hardcoded action executors (executeOpen, executeCook, etc.)
 *
 * The AI directly decides what state changes to make based on Spanish input.
 */

import Anthropic from '@anthropic-ai/sdk';
import * as readline from 'readline';
import * as fs from 'fs';
import type { GameState, Goal, VocabularyProgress, Needs, ObjectState, GrammarIssue, NPCState } from '../engine/types.js';
import {
  createInitialState,
  advanceTime,
  getObjectState,
  getBuildingForLocation,
  awardPoints,
  awardGoalBonus,
  isBuildingUnlocked,
  saveLocationProgress,
  loadLocationProgress,
  markChainComplete,
  ACTION_POINTS,
  BUILDING_UNLOCK_LEVELS,
  type BuildingName,
} from '../engine/game-state.js';
import { bedroom, getStartGoal, getGoalById, locations as homeLocations, getNPCsInLocation as getHomeNPCsInLocation, getPetsInLocation, npcs, pets } from '../data/home-basics.js';
import { restaurantLocations, restaurantNPCs, getRestaurantNPCsInLocation, restaurantGoals, getRestaurantGoalById, getRestaurantStartGoal } from '../data/restaurant-module.js';
import { clinicLocations, clinicNPCs, getClinicNPCsInLocation, clinicGoals, getClinicGoalById, getClinicStartGoal, clinicVocabulary } from '../data/clinic-module.js';
import { gymLocations, gymNPCs, getGymNPCsInLocation, gymGoals, getGymGoalById, getGymStartGoal, gymVocabulary } from '../data/gym-module.js';
import { parkLocations, parkNpcs, getParkNPCsInLocation, parkGoals, getParkGoalById, getParkStartGoal, parkVocabulary } from '../data/park-module.js';
import { marketLocations, marketNPCs, getMarketNPCsInLocation, marketGoals, getMarketGoalById, getMarketStartGoal, marketVocabulary } from '../data/market-module.js';
import { bankLocations, bankNPCs, getBankNPCsInLocation, bankGoals, getBankGoalById, getBankStartGoal, bankVocabulary } from '../data/bank-module.js';

// Merge all locations from home, restaurant, clinic, gym, park, market, and bank modules
const locations: Record<string, typeof homeLocations[keyof typeof homeLocations]> = {
  ...homeLocations,
  ...restaurantLocations,
  ...clinicLocations,
  ...gymLocations,
  ...parkLocations,
  ...marketLocations,
  ...bankLocations,
};

// Merge all NPCs from home, restaurant, clinic, gym, park, market, and bank modules
const allNPCs = [...npcs, ...restaurantNPCs, ...clinicNPCs, ...gymNPCs, ...parkNpcs, ...marketNPCs, ...bankNPCs];

// Combined NPC lookup
function getNPCsInLocation(locationId: string) {
  return allNPCs.filter(npc => npc.location === locationId);
}

// Combined goal lookup
function getGoalByIdCombined(id: string) {
  return getGoalById(id) || getRestaurantGoalById(id) || getClinicGoalById(id) || getGymGoalById(id) || getParkGoalById(id) || getMarketGoalById(id) || getBankGoalById(id);
}

// Get start goal for a building
function getStartGoalForBuilding(building: BuildingName): Goal | null {
  switch (building) {
    case 'home': return getStartGoal();
    case 'restaurant': return getRestaurantStartGoal();
    case 'clinic': return getClinicStartGoal();
    case 'gym': return getGymStartGoal();
    case 'park': return getParkStartGoal();
    case 'market': return getMarketStartGoal();
    case 'bank': return getBankStartGoal();
    case 'street': return null; // Street uses mini-goals (TODO: add street goals)
    default: return null;
  }
}

// Handle transitioning to a new building - load goals and update state
function handleBuildingTransition(state: GameState, newBuilding: BuildingName): GameState {
  printBuildingEntered(newBuilding);

  // Load saved progress for this building
  const progress = loadLocationProgress(state, newBuilding);

  // Determine the goal to use
  let newGoal: Goal | null = null;

  if (progress.goalId) {
    // Resume saved goal
    newGoal = getGoalByIdCombined(progress.goalId) || null;
  }

  if (!newGoal) {
    // Start fresh with building's first goal
    newGoal = getStartGoalForBuilding(newBuilding);
  }

  return {
    ...state,
    currentGoal: newGoal,
    completedGoals: progress.completedGoals,
    failedCurrentGoal: false,
  };
}
import { createInitialVocabulary, recordWordUse, extractWordsFromText } from '../engine/vocabulary.js';
import {
  clearScreen,
  printHeader,
  printGameState,
  printGoalComplete,
  printWelcome,
  printHelp,
  printVocab,
  printPrompt,
  printError,
  printSeparator,
  printPointsAwarded,
  printBuildingLocked,
  printBuildingEntered,
} from '../ui/terminal.js';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

const SAVE_FILE = 'vocabulary-progress.json';

// Ordered action for compound commands
interface Action {
  type: 'open' | 'close' | 'turn_on' | 'turn_off' | 'take' | 'put' | 'go' | 'position' | 'eat' | 'drink' | 'use' | 'cook' | 'pet' | 'feed' | 'talk' | 'give';
  objectId?: string;
  locationId?: string;
  position?: 'standing' | 'in_bed';
  npcId?: string;
  petId?: string;
}

interface UnifiedAIResponse {
  // Language learning
  understood: boolean;
  grammar: {
    score: number;
    issues: GrammarIssue[];
  };
  spanishModel: string;

  // Validation
  valid: boolean;
  invalidReason?: string;

  // Ordered actions (processed in sequence)
  actions: Action[];

  // Summary/metadata (applied after all actions)
  message: string; // What happened, for display
  needsChanges?: Partial<Needs>;
  goalComplete?: string | string[];
  npcResponse?: {
    npcId: string;
    spanish: string;
    english: string;
    wantsItem?: string;
  };
  petResponse?: {
    petId: string;
    reaction: string;
  };
}

function buildPrompt(state: GameState): string {
  const objectsDesc = state.location.objects
    .filter(obj => {
      const objState = getObjectState(state, obj);
      if (objState.inFridge) {
        const fridge = state.location.objects.find(o => o.id === 'refrigerator');
        const fridgeState = fridge ? getObjectState(state, fridge) : {};
        return fridgeState.open;
      }
      return true;
    })
    .map(obj => {
      const objState = getObjectState(state, obj);
      let desc = `- ${obj.id}: "${obj.name.spanish}" (${obj.name.english})`;
      if (objState.open === true) desc += ' [OPEN]';
      if (objState.open === false) desc += ' [CLOSED]';
      if (objState.on === true) desc += ' [ON]';
      if (objState.on === false) desc += ' [OFF]';
      if (objState.ringing) desc += ' [RINGING]';
      if (obj.takeable) desc += ' [takeable]';
      if (obj.consumable) desc += ' [consumable]';
      if (objState.inFridge) desc += ' [in fridge]';
      return desc;
    })
    .join('\n');

  const exitsDesc = state.location.exits
    .map(e => `- ${e.to}: "${e.name.spanish}" (${e.name.english})`)
    .join('\n');

  const inventoryDesc = state.inventory.length > 0
    ? state.inventory.map(i => `- ${i.id}: "${i.name.spanish}"`).join('\n')
    : '(empty)';

  const goalDesc = state.currentGoal
    ? `Current goal: ${state.currentGoal.title}\nGoal ID: ${state.currentGoal.id}`
    : 'No current goal';

  const completedGoalsDesc = state.completedGoals.length > 0
    ? state.completedGoals.join(', ')
    : '(none)';

  // NPCs in current location
  const npcsHere = getNPCsInLocation(state.location.id);
  const npcsDesc = npcsHere.length > 0
    ? npcsHere.map(npc => {
        const npcState = state.npcState[npc.id];
        let desc = `- ${npc.id}: ${npc.name.spanish} (${npc.name.english}) - ${npc.personality}`;
        if (npcState?.mood) desc += ` [mood: ${npcState.mood}]`;
        if (npcState?.wantsItem) desc += ` [wants: ${npcState.wantsItem}]`;
        return desc;
      }).join('\n')
    : '(none)';

  // Pets in current location
  const petsHere = getPetsInLocation(state.location.id, state.petLocations);
  const petsDesc = petsHere.length > 0
    ? petsHere.map(pet => `- ${pet.id}: "${pet.name.spanish}" (${pet.name.english}) - ${pet.personality}`).join('\n')
    : '(none)';

  // Adjacent room objects (for compound commands)
  const adjacentRoomsDesc = state.location.exits
    .map(exit => {
      const room = locations[exit.to];
      if (!room) return null;
      const objIds = room.objects.map(o => o.id).join(', ');
      return `- ${exit.to}: ${objIds}`;
    })
    .filter(Boolean)
    .join('\n');

  return `CURRENT GAME STATE:

Location: ${state.location.id} (${state.location.name.english})
Player position: ${state.playerPosition}

Objects here:
${objectsDesc}

People here:
${npcsDesc}

Pets here:
${petsDesc}

Exits to:
${exitsDesc}

Objects in adjacent rooms (use these IDs for compound commands):
${adjacentRoomsDesc}

Player inventory:
${inventoryDesc}

Needs (0-100, higher is better):
- energy: ${state.needs.energy}
- hunger: ${state.needs.hunger}
- hygiene: ${state.needs.hygiene}
- bladder: ${state.needs.bladder}

${goalDesc}
Completed goals: ${completedGoalsDesc}`;
}

const SYSTEM_PROMPT = `You are the game engine for a Spanish language learning life simulation. The player types commands in Spanish to control their character.

Your job:
1. Understand their Spanish input (be generous - if a native speaker would understand, accept it)
2. Provide grammar feedback to help them learn
3. Decide if the action is valid in the current context
4. Specify exactly what game state changes should occur, IN ORDER

RESPOND WITH ONLY VALID JSON:
{
  "understood": boolean,
  "grammar": {
    "score": 0-100,
    "issues": [
      {
        "type": "conjugation|gender|article|word_order|contraction|other",
        "original": "what they wrote",
        "corrected": "correct form",
        "explanation": "brief helpful explanation"
      }
    ]
  },
  "spanishModel": "Natural Spanish way to express what they meant",

  "valid": boolean,
  "invalidReason": "Why the action can't be done (only if valid=false)",

  "actions": [
    { "type": "position", "position": "standing" },
    { "type": "go", "locationId": "kitchen" },
    { "type": "open", "objectId": "refrigerator" },
    { "type": "take", "objectId": "milk" }
  ],

  "message": "What happened, in English (e.g., 'You get up, go to the kitchen, and open the refrigerator.')",
  "needsChanges": { "hunger": 10, "energy": -5 },
  "goalComplete": ["goal_id"],
  "npcResponse": { "npcId": "roommate", "spanish": "...", "english": "...", "wantsItem": "eggs" }
}

ACTIONS (put them in the order they should happen):
- { "type": "position", "position": "standing" } - get up from bed
- { "type": "go", "locationId": "kitchen" } - move to another room
- { "type": "open", "objectId": "refrigerator" } - open something
- { "type": "close", "objectId": "refrigerator" } - close something
- { "type": "turn_on", "objectId": "stove" } - turn on
- { "type": "turn_off", "objectId": "alarm_clock" } - turn off (also stops ringing)
- { "type": "take", "objectId": "milk" } - pick up an item
- { "type": "eat", "objectId": "eggs" } - eat food
- { "type": "drink", "objectId": "milk" } - drink something
- { "type": "use", "objectId": "toilet" } - use toilet, brush teeth, shower
- { "type": "cook", "objectId": "eggs" } - cook food
- { "type": "pet", "petId": "cat" } - pet an animal
- { "type": "feed", "petId": "dog" } - feed a pet
- { "type": "talk", "npcId": "roommate" } - talk to someone
- { "type": "give", "objectId": "eggs", "npcId": "roommate" } - give item to NPC

ORDER MATTERS! Put actions in the sequence they should execute:
- "me levanto y apago el despertador" → position first, then turn_off
- "voy a la cocina y abro la nevera" → go first, then open
- "abro la nevera y tomo la leche" → open first (so milk is accessible), then take
- "hago la cama, voy a la cocina" → first action in bedroom, then go to kitchen

For compound commands, the "Objects in adjacent rooms" list shows object IDs in rooms you can reach.

IMPORTANT RULES:
- Use EXACT object IDs from the lists (e.g., "refrigerator" not "fridge", "alarm_clock" not "alarm")
- locationId must be a valid exit from current location
- Can only interact with objects/NPCs/pets in current location (or destination after a "go" action)
- Player must be standing to leave bedroom
- Can't take items from closed fridge
- needsChanges: Use small increments (-20 to +20). Positive = better.
- goalComplete: Array of goal IDs this action completes:
  - "brush_teeth" - when player brushes teeth
  - "take_shower" - when player showers
  - "make_breakfast" - when player eats food
  - "greet_roommate" - when player greets the roommate
  - "ask_roommate_breakfast" - when player asks roommate what they want to eat
  - "feed_pets" - when player feeds a pet
  - "seated_by_host" - when player asks host for a table at restaurant
  - "ordered_drink" - when player orders a drink at restaurant
  - "read_menu" - when player reads/looks at the menu
  - "ordered_food" - when player orders food at restaurant
  - "ate_meal" - when player eats their meal at restaurant
  - "asked_for_bill" - when player asks for the bill
  - "paid_bill" - when player pays the bill
  - "checked_in" or "gym_check_in" - when player checks in at gym reception
  - "warmed_up" or "stretched" or "gym_warm_up" - when player stretches/warms up
  - "followed_trainer" or "completed_exercise" or "gym_follow_trainer" - when player follows trainer's commands
  - "did_cardio" or "gym_cardio" - when player uses cardio equipment
  - "lifted_weights" or "used_weights" or "gym_weights" - when player uses weight equipment
  - "cooled_down" or "showered" or "gym_cool_down" - when player cools down or showers
  - "clinic_check_in" or "checked_in" - when player checks in at clinic reception
  - "filled_form" - when player fills out registration form at clinic
  - "waited" - when player waits in clinic waiting room
  - "described_symptoms" - when player describes symptoms to doctor
  - "followed_commands" - when player follows doctor's examination commands
  - "got_prescription" - when player gets prescription from doctor
  - "got_medicine" - when player gets medicine from pharmacist
  - "greeted_guard" or "bank_enter_greet" - when player greets the bank guard
  - "took_number" or "bank_take_number" - when player takes a number from dispenser
  - "greeted_teller" or "bank_approach_teller" - when player greets the bank teller
  - "checked_balance" or "bank_check_balance" - when player checks account balance
  - "made_deposit" or "bank_make_deposit" - when player makes a deposit
  - "made_withdrawal" or "bank_withdraw_cash" - when player makes a withdrawal
  - "got_receipt" or "bank_get_receipt" - when player gets a receipt
  - "said_goodbye" or "bank_polite_farewell" - when player says goodbye to teller
  - "commented_weather" or "check_weather" - when player comments on weather at park (hacer expressions)
  - "walk_the_path" - when player walks along the park path
  - "observed_animals" or "observe_nature" - when player observes animals/nature in the park
  - "talked_to_ramon" or "talk_to_don_ramon" - when player talks to Don Ramon at fountain
  - "got_ice_cream" or "buy_ice_cream" - when player buys ice cream at the kiosk
  - "weather_reaction" or "weather_changes" - when player reacts to weather changes

IMPORTANT: Let the player do whatever valid action they want, even if it doesn't match the current goal. The player is in control.

COMMON ACTIONS:
- "me levanto" → actions: [{ "type": "position", "position": "standing" }]
- "voy al baño" → actions: [{ "type": "go", "locationId": "bathroom" }]
- "abro la nevera" → actions: [{ "type": "open", "objectId": "refrigerator" }]
- "apago el despertador" → actions: [{ "type": "turn_off", "objectId": "alarm_clock" }]
- "tomo la leche" → actions: [{ "type": "take", "objectId": "milk" }]
- "como los huevos" → actions: [{ "type": "eat", "objectId": "eggs" }], needsChanges: { hunger: 25 }
- "me ducho" → actions: [{ "type": "use", "objectId": "shower" }], needsChanges: { hygiene: 50 }, goalComplete: ["take_shower"]
- "me cepillo los dientes" → actions: [{ "type": "use", "objectId": "toothbrush" }], needsChanges: { hygiene: 10 }, goalComplete: ["brush_teeth"]

NPC INTERACTIONS:
- "hola carlos" → actions: [{ "type": "talk", "npcId": "roommate" }], goalComplete: ["greet_roommate"]
- "¿qué quieres para desayunar?" → actions: [{ "type": "talk", "npcId": "roommate" }], goalComplete: ["ask_roommate_breakfast"], npcResponse with wantsItem
- "le doy los huevos a carlos" → actions: [{ "type": "give", "objectId": "eggs", "npcId": "roommate" }]

PET INTERACTIONS:
- "acaricio al gato" → actions: [{ "type": "pet", "petId": "cat" }]
- "le doy comida al perro" → actions: [{ "type": "feed", "petId": "dog" }], goalComplete: ["feed_pets"]

NPC PERSONALITIES:
- Carlos (roommate): Sleepy, friendly, casual speech. In the morning, wants coffee or breakfast (eggs, toast).
- Luna (cat): Independent, aloof. Responds with purring or ignoring.
- Max (dog): Excited, eager. Responds with tail wagging and barking.

RESTAURANT NPCs:
- Host (anfitrion): Professional, welcoming. Greets with "Buenas noches" or "Buenas tardes". Asks "Mesa para cuantos?" (Table for how many?). Uses formal "usted".
- Waiter (mesero, Diego): Friendly, attentive. Takes drink orders first with "Que desea tomar?", then food with "Ya decidio?". Says "Enseguida" (right away) and "Algo mas?" (anything else?).
- Chef (Rosa): Busy, passionate about food. Occasionally checks on diners. Speaks quickly.

RESTAURANT INTERACTIONS:
- "buenas noches" or "una mesa para uno, por favor" at entrance → actions: [{ "type": "talk", "npcId": "host" }], goalComplete: ["seated_by_host"], npcResponse from host
- "quiero una limonada" or "quisiera agua" → actions: [{ "type": "talk", "npcId": "waiter" }], goalComplete: ["ordered_drink"], npcResponse from waiter
- "abro el menu" or "miro el menu" → actions: [{ "type": "open", "objectId": "menu" }], goalComplete: ["read_menu"]
- "quiero el pollo" or "quisiera los tacos" → actions: [{ "type": "talk", "npcId": "waiter" }], goalComplete: ["ordered_food"], npcResponse from waiter
- "como el pollo" or "como la comida" → actions: [{ "type": "eat", "objectId": "ordered_food" }], goalComplete: ["ate_meal"], needsChanges: { hunger: 40 }
- "la cuenta, por favor" → actions: [{ "type": "talk", "npcId": "waiter" }], goalComplete: ["asked_for_bill"], npcResponse from waiter
- "pago la cuenta" → actions: [{ "type": "use", "objectId": "bill" }], goalComplete: ["paid_bill"]

KEY SPANISH FOR ORDERING (teach these patterns):
- "Quiero..." (I want...) - direct but acceptable
- "Quisiera..." (I would like...) - more polite
- "Me trae...?" (Can you bring me...?)
- "sin" (without) - "sin cebolla" (without onion)
- "con" (with) - "con arroz" (with rice)

CLINIC NPCs:
- Receptionist (Maria): Professional and helpful. Uses formal "usted". Asks "Tiene cita?" (Do you have an appointment?), "Cual es su nombre?" (What is your name?), "Por favor, llene este formulario" (Please fill out this form).
- Doctor (Dr. Garcia): Kind and thorough. Uses formal "usted". Asks "Que le pasa?" and "Donde le duele?". Gives commands: "Abra la boca", "Respire profundo", "Suba la manga". Explains diagnosis and writes prescriptions.
- Pharmacist (Roberto): Friendly. Explains dosage: "Tome una pastilla cada ocho horas" (Take one pill every eight hours), "Con comida" (With food). Asks "Tiene la receta?" (Do you have the prescription?).

CLINIC INTERACTIONS:
- "Buenos dias" or "Tengo cita" at reception → actions: [{ "type": "talk", "npcId": "receptionist" }], goalComplete: ["clinic_check_in"], npcResponse from receptionist
- "Lleno el formulario" → actions: [{ "type": "use", "objectId": "registration_form" }], goalComplete: ["filled_form"]
- "Me siento" in waiting room → goalComplete: ["waited"]
- "Me duele la cabeza" or "Tengo fiebre" to doctor → actions: [{ "type": "talk", "npcId": "doctor" }], goalComplete: ["described_symptoms"], npcResponse from doctor
- "Si, doctor" or "Abro la boca" (following commands) → actions: [{ "type": "talk", "npcId": "doctor" }], goalComplete: ["followed_commands"]
- "Tomo la receta" → actions: [{ "type": "take", "objectId": "prescription" }], goalComplete: ["got_prescription"]
- "Aqui esta mi receta" to pharmacist → actions: [{ "type": "talk", "npcId": "pharmacist" }], goalComplete: ["got_medicine"], npcResponse from pharmacist

KEY SPANISH FOR MEDICAL VISITS (teach these patterns):
- "Me duele..." (My ... hurts) - "Me duele la cabeza" (My head hurts)
- "Tengo..." (I have...) - "Tengo fiebre" (I have a fever), "Tengo tos" (I have a cough)
- "No me siento bien" (I don't feel well)
- Formal commands (usted): "Abra" (Open), "Respire" (Breathe), "Saque" (Stick out)

GYM NPCs:
- Ana (receptionist_ana): Friendly, energetic receptionist at gym_entrance. Greets with "Bienvenido al gimnasio!" Asks for membership card: "Tu tarjeta, por favor". Uses informal "tu" with regulars.
- Marco (trainer_marco): Motivational personal trainer on training_floor. Uses imperative commands: "Levanta!" (Lift!), "Respira!" (Breathe!), "Descansa!" (Rest!). Counts reps in Spanish. Enthusiastic about fitness.
- Sofia (member_sofia): Regular gym member in cardio_zone. Chatty and friendly. Talks about frequency: "Vengo tres veces a la semana" (I come three times a week). Happy to share tips.

GYM INTERACTIONS:
- "hola" or "aqui esta mi tarjeta" at gym_entrance → actions: [{ "type": "talk", "npcId": "receptionist_ana" }], goalComplete: ["checked_in", "gym_check_in"], npcResponse from Ana
- "me estiro" or "uso la colchoneta" in stretching_area → actions: [{ "type": "use", "objectId": "yoga_mat" }], goalComplete: ["warmed_up", "stretched", "gym_warm_up"], needsChanges: { energy: -5 }
- Following trainer commands like "levanto los brazos" → actions: [{ "type": "use", "objectId": "training_bench" }], goalComplete: ["followed_trainer", "gym_follow_trainer"], needsChanges: { energy: -10 }
- "uso la cinta de correr" or "corro" in cardio_zone → actions: [{ "type": "use", "objectId": "treadmill" }], goalComplete: ["did_cardio", "gym_cardio"], needsChanges: { energy: -15 }
- "levanto las mancuernas" or "hago repeticiones" in weight_room → actions: [{ "type": "use", "objectId": "dumbbells" }], goalComplete: ["lifted_weights", "gym_weights"], needsChanges: { energy: -10 }
- "me ducho" in locker_room → actions: [{ "type": "use", "objectId": "gym_shower" }], goalComplete: ["showered", "gym_cool_down"], needsChanges: { hygiene: 30 }

KEY SPANISH FOR GYM (teach these patterns):
- Imperatives (trainer commands): "Levanta!" (Lift!), "Baja!" (Lower!), "Respira!" (Breathe!)
- Reflexive verbs: "Me estiro" (I stretch), "Me caliento" (I warm up), "Me ducho" (I shower)
- Frequency: "tres veces a la semana" (three times a week), "cada dia" (every day)
- Body parts: "los brazos" (arms), "las piernas" (legs), "el pecho" (chest)
- Exercise terms: "las repeticiones" (reps), "las series" (sets), "el descanso" (rest)

BANK NPCs:
- Security Guard (Roberto): Professional security guard. Greets customers formally with "Buenos dias" or "Buenas tardes". Uses "usted" exclusively. Will direct customers inside and explain they need to take a number. Key phrases: "Bienvenido al banco" (Welcome to the bank), "Pase adelante" (Go ahead), "Tome un numero, por favor" (Take a number, please).
- Bank Teller (Maria Elena): Friendly and efficient bank teller. Always uses formal "usted" and polite conditionals. Patient with customers. Key phrases: "En que le puedo ayudar?" (How may I help you?), "Me permite su identificacion?" (May I see your ID?), "Cuanto desea depositar/retirar?" (How much would you like to deposit/withdraw?), "Algo mas en lo que le pueda servir?" (Anything else I can help you with?).
- Bank Manager (Senor Mendoza): Distinguished bank manager. Very formal and professional. Uses elaborate courtesy phrases and conditional tense. Handles special accounts, loans, and complaints. Key phrases: "Tome asiento, por favor" (Please have a seat), "En que podria ayudarle hoy?" (How might I help you today?).

BANK INTERACTIONS:
- "Buenos dias" or "Buenas tardes" at entrance → actions: [{ "type": "talk", "npcId": "bank_guard" }], goalComplete: ["greeted_guard"], npcResponse from bank_guard
- "Tomo un numero" or "Uso el dispensador" → actions: [{ "type": "use", "objectId": "number_dispenser" }], goalComplete: ["took_number"]
- Greet teller at window → actions: [{ "type": "talk", "npcId": "bank_teller" }], goalComplete: ["greeted_teller"]
- "Quisiera consultar mi saldo" → actions: [{ "type": "talk", "npcId": "bank_teller" }], goalComplete: ["checked_balance"], npcResponse from bank_teller
- "Quisiera depositar quinientos pesos" → actions: [{ "type": "talk", "npcId": "bank_teller" }], goalComplete: ["made_deposit"], npcResponse from bank_teller
- "Quisiera retirar doscientos pesos" → actions: [{ "type": "talk", "npcId": "bank_teller" }], goalComplete: ["made_withdrawal"], npcResponse from bank_teller
- "Me puede dar un recibo?" → actions: [{ "type": "talk", "npcId": "bank_teller" }], goalComplete: ["got_receipt"], npcResponse from bank_teller
- "Muchas gracias" or "Hasta luego" to teller → actions: [{ "type": "talk", "npcId": "bank_teller" }], goalComplete: ["said_goodbye"], npcResponse from bank_teller

KEY SPANISH FOR BANKING (teach these patterns):
- "Quisiera..." (I would like...) - very polite conditional form
- "Podria...?" (Could you...?) - polite requests
- Large numbers: "cien" (100), "doscientos" (200), "quinientos" (500), "mil" (1000)
- "El saldo" (balance), "El deposito" (deposit), "El retiro" (withdrawal)
- "El recibo" / "El comprobante" (receipt)
- Formal "usted" forms: "tiene", "desea", "puede"

PARK NPCs:
- Senor Gomez (ice_cream_vendor): Friendly elderly ice cream vendor at the kiosk. Talks about weather constantly. Recommends flavors based on temperature. Speaks slowly and clearly.
- Don Ramon (pigeon_feeder): Quiet elderly man at the fountain who feeds pigeons. Observes nature and uses present progressive to describe ongoing actions. Very patient and kind.

PARK INTERACTIONS (Weather and Present Progressive Focus):
- "hace buen tiempo" or "hace sol" → goalComplete: ["commented_weather", "check_weather"], present tense weather expressions
- "estoy caminando por el sendero" → goalComplete: ["walk_the_path"], practice present progressive
- "la ardilla esta corriendo" or "los pajaros estan volando" → goalComplete: ["observed_animals", "observe_nature"], describe what animals are doing
- "hola senor, que esta haciendo?" to Don Ramon → actions: [{ "type": "talk", "npcId": "pigeon_feeder" }], goalComplete: ["talked_to_ramon", "talk_to_don_ramon"]
- "quiero un helado de chocolate" to vendor → actions: [{ "type": "talk", "npcId": "ice_cream_vendor" }], goalComplete: ["got_ice_cream", "buy_ice_cream"]
- "esta nublado" or "va a llover" → goalComplete: ["weather_reaction", "weather_changes"], react to weather

KEY SPANISH FOR WEATHER (teach these patterns):
- "Hace + noun" - Hace sol (it's sunny), Hace frio (it's cold), Hace calor (it's hot)
- "Esta + adjective" - Esta nublado (it's cloudy), Esta lloviendo (it's raining)
- Present progressive: "estar + gerund" - Estoy caminando (I am walking), Esta comiendo (he/she is eating)

MARKET NPCs:
- Dona Maria (dona_maria): Elderly fruit vendor at fruit_stand. Friendly, uses diminutives (frutitas, manzanitas). Says "Buenos dias, mi amor! Que busca hoy?" and "Estas naranjas estan muy dulces!"
- Senor Pedro (senor_pedro): Vegetable vendor at vegetable_stand. Direct but friendly. Uses demonstratives for comparisons: "Esas papas son mas grandes, pero estas son mas frescas."
- Carlos el Carnicero (carlos_carnicero): Butcher at meat_counter. Uses ticket system. Asks "Que numero tiene?" and "Cuantos gramos quiere?"

MARKET INTERACTIONS:
- "cuanto cuestan las manzanas?" or asking prices → actions: [{ "type": "talk", "npcId": "dona_maria" }], goalComplete: ["asked_price"], npcResponse with price info
- "quiero estas naranjas" or using demonstratives → actions: [{ "type": "talk", "npcId": relevant vendor }], goalComplete: ["used_demonstrative"]
- "cuales son mas frescas?" or comparing items → actions: [{ "type": "talk", "npcId": relevant vendor }], goalComplete: ["compared_items"], npcResponse comparing
- "quiero un kilo de manzanas" or specifying quantity → actions: [{ "type": "talk", "npcId": relevant vendor }], goalComplete: ["made_purchase"], npcResponse confirming
- "pago con efectivo" or "pago con tarjeta" at checkout → actions: [{ "type": "use", "objectId": "cash_register" }], goalComplete: ["paid_at_checkout"]

KEY SPANISH FOR MARKET (teach these patterns):
- "Cuanto cuesta?" / "Cuanto cuestan?" (How much does it/they cost?)
- "Este/Esta/Estos/Estas" (This/These - near speaker)
- "Ese/Esa/Esos/Esas" (That/Those - near listener)
- "Aquel/Aquella" (That over there - far from both)
- "Un kilo de..." / "Medio kilo de..." (A kilo of... / Half kilo of...)
- "Mas fresco/grande/barato que..." (Fresher/bigger/cheaper than...)

When generating NPC responses, use simple Spanish appropriate for language learners. Keep responses short (1-2 sentences).

Be encouraging! Focus grammar corrections on one main issue, not every small error.`;

async function processInput(input: string, state: GameState): Promise<UnifiedAIResponse> {
  const contextPrompt = buildPrompt(state);

  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${contextPrompt}\n\nPLAYER INPUT: "${input}"`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as UnifiedAIResponse;

    // Debug: show raw AI response
    if (process.env.DEBUG_UNIFIED) {
      console.log('\n\x1b[2m[DEBUG AI Response]:\x1b[0m');
      console.log('\x1b[2m' + JSON.stringify(parsed, null, 2) + '\x1b[0m\n');
    }

    return parsed;
  } catch (error) {
    console.error('AI error:', error);
    return {
      understood: false,
      grammar: { score: 0, issues: [] },
      spanishModel: '',
      valid: false,
      invalidReason: 'Something went wrong. Try again.',
      actions: [],
      message: 'Error processing input.',
    };
  }
}

function applyObjectChange(state: GameState, objectId: string, changes: Partial<ObjectState>): GameState {
  // Store object state changes globally so they persist across location changes
  return {
    ...state,
    objectStates: {
      ...state.objectStates,
      [objectId]: { ...state.objectStates[objectId], ...changes }
    }
  };
}

// Result of applying effects, including progression info
interface ApplyEffectsResult {
  state: GameState;
  pointsAwarded: number;
  leveledUp: boolean;
  buildingChanged: boolean;
  newBuilding?: BuildingName;
  buildingBlocked?: BuildingName;  // If tried to enter locked building
}

function applyEffects(state: GameState, response: UnifiedAIResponse): ApplyEffectsResult {
  let newState = { ...state };
  let totalActionPoints = 0;
  let buildingChanged = false;
  let newBuilding: BuildingName | undefined;
  let buildingBlocked: BuildingName | undefined;

  const grammarScore = response.grammar?.score ?? 100;
  const oldBuilding = getBuildingForLocation(state.location.id);

  // Process actions in order - this is the key to handling compound commands correctly
  for (const action of response.actions || []) {
    // Award points for valid actions
    const actionPoints = ACTION_POINTS[action.type] || 5;
    totalActionPoints += actionPoints;

    switch (action.type) {
      case 'go':
        if (action.locationId && locations[action.locationId]) {
          const targetBuilding = getBuildingForLocation(action.locationId);

          // Check if building is unlocked - only when ENTERING a new building from outside
          if (targetBuilding !== oldBuilding && !isBuildingUnlocked(newState, targetBuilding)) {
            buildingBlocked = targetBuilding;
            // Don't award points for blocked action
            totalActionPoints -= actionPoints;
            // Don't move - building is locked
            break;
          }

          // Handle building transition
          if (targetBuilding !== oldBuilding) {
            buildingChanged = true;
            newBuilding = targetBuilding;

            // Save current building's goal progress
            newState = saveLocationProgress(newState, oldBuilding);
          }

          newState = { ...newState, location: locations[action.locationId] };
        }
        break;

      case 'position':
        if (action.position) {
          newState = { ...newState, playerPosition: action.position };
        }
        break;

      case 'open':
        if (action.objectId) {
          newState = applyObjectChange(newState, action.objectId, { open: true });
        }
        break;

      case 'close':
        if (action.objectId) {
          newState = applyObjectChange(newState, action.objectId, { open: false });
        }
        break;

      case 'turn_on':
        if (action.objectId) {
          newState = applyObjectChange(newState, action.objectId, { on: true });
        }
        break;

      case 'turn_off':
        if (action.objectId) {
          // Turn off also stops ringing (for alarm clock)
          newState = applyObjectChange(newState, action.objectId, { on: false, ringing: false });
        }
        break;

      case 'take':
        if (action.objectId) {
          const obj = newState.location.objects.find(o => o.id === action.objectId);
          if (obj) {
            newState = {
              ...newState,
              inventory: [...newState.inventory, { id: obj.id, name: obj.name }],
            };
          }
        }
        break;

      case 'eat':
      case 'drink':
        if (action.objectId) {
          // Remove from inventory if present
          newState = {
            ...newState,
            inventory: newState.inventory.filter(i => i.id !== action.objectId),
          };
        }
        break;

      case 'use':
      case 'cook':
      case 'pet':
      case 'feed':
      case 'talk':
      case 'give':
        // These actions don't have direct state changes beyond needs/goals
        // which are handled below
        if (action.type === 'give' && action.objectId) {
          // Remove item from inventory when giving
          newState = {
            ...newState,
            inventory: newState.inventory.filter(i => i.id !== action.objectId),
          };
        }
        break;
    }
  }

  // Apply needs changes (summarized across all actions)
  if (response.needsChanges) {
    newState = {
      ...newState,
      needs: {
        energy: Math.max(0, Math.min(100, newState.needs.energy + (response.needsChanges.energy || 0))),
        hunger: Math.max(0, Math.min(100, newState.needs.hunger + (response.needsChanges.hunger || 0))),
        hygiene: Math.max(0, Math.min(100, newState.needs.hygiene + (response.needsChanges.hygiene || 0))),
        bladder: Math.max(0, Math.min(100, newState.needs.bladder + (response.needsChanges.bladder || 0))),
      },
    };
  }

  // Track goal-completing actions
  if (response.goalComplete) {
    const goals = Array.isArray(response.goalComplete)
      ? response.goalComplete
      : [response.goalComplete];
    if (goals.length > 0) {
      newState = {
        ...newState,
        completedGoals: [...newState.completedGoals, ...goals],
      };

      // Handle goals that should automatically move the player
      for (const goalId of goals) {
        if (goalId === 'seated_by_host' && locations['restaurant_table']) {
          // Host seats player at table
          newState = { ...newState, location: locations['restaurant_table'] };
        }
      }
    }
  }

  // Track NPC responses and state
  if (response.npcResponse) {
    const npcId = response.npcResponse.npcId;
    const currentNpcState = newState.npcState[npcId] || { mood: 'neutral' };
    newState = {
      ...newState,
      npcState: {
        ...newState.npcState,
        [npcId]: {
          ...currentNpcState,
          lastResponse: response.npcResponse.spanish,
          wantsItem: response.npcResponse.wantsItem || currentNpcState.wantsItem,
        },
      },
    };
  }

  // Advance time
  newState = advanceTime(newState, 5);

  // Award points for actions (with grammar multiplier)
  let pointsAwarded = 0;
  let leveledUp = false;

  if (response.valid && totalActionPoints > 0) {
    // Compound commands get bonus multiplier
    const compoundBonus = (response.actions?.length || 1) > 1 ? 2 : 1;
    const basePoints = totalActionPoints * compoundBonus;

    const result = awardPoints(newState, basePoints, grammarScore);
    newState = result.state;
    pointsAwarded = result.pointsAwarded;
    leveledUp = result.leveledUp;
  }

  return {
    state: newState,
    pointsAwarded,
    leveledUp,
    buildingChanged,
    newBuilding,
    buildingBlocked,
  };
}

function printResults(response: UnifiedAIResponse): void {
  const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m',
  };

  if (response.valid) {
    console.log(`${COLORS.green}✓${COLORS.reset} ${response.message}`);
  } else {
    console.log(`${COLORS.yellow}✗${COLORS.reset} ${response.invalidReason || response.message}`);
  }
  console.log();

  // Show NPC response if present and valid
  if (response.npcResponse?.spanish && response.npcResponse?.npcId) {
    const npc = response.npcResponse;
    console.log(`   ${COLORS.cyan}💬 ${npc.npcId}:${COLORS.reset} "${npc.spanish}"`);
    console.log();
  }

  if (response.understood) {
    if (response.grammar.score === 100) {
      console.log(`   ${COLORS.green}Perfect! ⭐${COLORS.reset} ${COLORS.dim}"${response.spanishModel}"${COLORS.reset}`);
    } else if (response.grammar.issues.length > 0) {
      const issue = response.grammar.issues[0];
      console.log(`   ${COLORS.yellow}📝 Tip:${COLORS.reset} "${issue.corrected}" is more natural`);
      console.log(`      ${COLORS.dim}${issue.explanation}${COLORS.reset}`);
    }
  } else {
    console.log(`   ${COLORS.dim}Try again! Type /hint for help.${COLORS.reset}`);
  }
  console.log();
}

function loadVocabulary(): VocabularyProgress {
  try {
    if (fs.existsSync(SAVE_FILE)) {
      return JSON.parse(fs.readFileSync(SAVE_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Could not load vocabulary:', error);
  }
  return createInitialVocabulary();
}

function saveVocabulary(vocab: VocabularyProgress): void {
  try {
    fs.writeFileSync(SAVE_FILE, JSON.stringify(vocab, null, 2));
  } catch (error) {
    console.error('Could not save vocabulary:', error);
  }
}

export interface GameOptions {
  scriptFile?: string;
  startLocation?: string;
  startGoal?: string;
  skipGoals?: boolean;
  standing?: boolean;
  module?: string;  // 'restaurant' starts at restaurant_entrance with restaurant goals
}

export async function runUnifiedMode(options: GameOptions = {}): Promise<void> {
  const existingVocab = loadVocabulary();

  // Handle module selection (overrides startLocation and startGoal)
  let effectiveStartLocation = options.startLocation;
  let effectiveStartGoal = options.startGoal;
  let forceStanding = options.standing || false;

  if (options.module === 'restaurant') {
    effectiveStartLocation = 'restaurant_entrance';
    effectiveStartGoal = 'restaurant_enter';
    forceStanding = true;  // Start standing when at restaurant
  } else if (options.module === 'clinic') {
    effectiveStartLocation = 'clinic_reception';
    effectiveStartGoal = 'clinic_arrive';
    forceStanding = true;  // Start standing when at clinic
  } else if (options.module === 'gym') {
    effectiveStartLocation = 'gym_entrance';
    effectiveStartGoal = 'gym_check_in';
    forceStanding = true;  // Start standing when at gym
  } else if (options.module === 'park') {
    effectiveStartLocation = 'park_entrance';
    effectiveStartGoal = 'arrive_at_park';
    forceStanding = true;  // Start standing when at park
  } else if (options.module === 'market') {
    effectiveStartLocation = 'market_entrance';
    effectiveStartGoal = 'market_explore';
    forceStanding = true;  // Start standing when at market
  } else if (options.module === 'bank') {
    effectiveStartLocation = 'bank_entrance';
    effectiveStartGoal = 'bank_enter_greet';
    forceStanding = true;  // Start standing when at bank
  }

  // Determine starting location
  const startLocation = effectiveStartLocation && locations[effectiveStartLocation]
    ? locations[effectiveStartLocation]
    : bedroom;

  // Determine starting goal
  let startGoal: Goal | null = getStartGoal();
  if (options.skipGoals) {
    startGoal = null;
  } else if (effectiveStartGoal) {
    startGoal = getGoalByIdCombined(effectiveStartGoal) || startGoal;
  }

  let gameState = createInitialState(startLocation, startGoal, existingVocab);

  // Override starting position if requested
  if (forceStanding || options.startLocation) {
    gameState = { ...gameState, playerPosition: 'standing' };
  }

  clearScreen();
  printHeader(gameState);
  printWelcome();
  printSeparator();
  printGameState(gameState);

  if (options.scriptFile) {
    await runScriptMode(options.scriptFile, gameState);
    return;
  }

  await runInteractiveMode(gameState);
}

async function runScriptMode(scriptFile: string, initialState: GameState): Promise<void> {
  let gameState = initialState;

  if (!fs.existsSync(scriptFile)) {
    printError(`Script file not found: ${scriptFile}`);
    process.exit(1);
  }

  const commands = fs.readFileSync(scriptFile, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

  console.log(`\n📜 Running script: ${scriptFile} (${commands.length} commands)\n`);

  for (const command of commands) {
    if (command.startsWith('/')) {
      if (command === '/quit' || command === '/exit') break;
      if (command === '/status') {
        clearScreen();
        printHeader(gameState);
        printGameState(gameState);
      }
      continue;
    }

    console.log(`> ${command}\n`);
    process.stdout.write('\x1b[2mThinking...\x1b[0m');

    const response = await processInput(command, gameState);

    process.stdout.write('\r' + ' '.repeat(20) + '\r');

    let effectsResult: ApplyEffectsResult | null = null;

    if (response.valid) {
      effectsResult = applyEffects(gameState, response);
      gameState = effectsResult.state;

      // Track vocabulary
      if (response.understood && response.grammar.score >= 80) {
        const wordsUsed = extractWordsFromText(command, gameState.vocabulary);
        for (const wordId of wordsUsed) {
          gameState = {
            ...gameState,
            vocabulary: recordWordUse(gameState.vocabulary, wordId, true),
          };
        }
      }
    }

    printResults(response);

    // Show points awarded
    if (effectsResult && effectsResult.pointsAwarded > 0) {
      printPointsAwarded(effectsResult.pointsAwarded, effectsResult.leveledUp, gameState.level);
    }

    // Handle building transition
    if (effectsResult?.buildingChanged && effectsResult.newBuilding) {
      gameState = handleBuildingTransition(gameState, effectsResult.newBuilding);
    }

    // Show if building was blocked
    if (effectsResult?.buildingBlocked) {
      printBuildingLocked(effectsResult.buildingBlocked, BUILDING_UNLOCK_LEVELS[effectsResult.buildingBlocked]);
    }

    // Track goals we've already shown completion for (to avoid double-printing)
    const alreadyPrinted = new Set<string>();

    // Show immediate feedback for goals completed out of order
    if (response.goalComplete) {
      const completedIds = Array.isArray(response.goalComplete)
        ? response.goalComplete
        : [response.goalComplete];
      for (const goalId of completedIds) {
        const goal = getGoalByIdCombined(goalId);
        if (goal) {
          printGoalComplete(goal);
          alreadyPrinted.add(goalId);
        }
      }
    }

    // Advance through satisfied goals (only print if newly completed, not previously)
    while (gameState.currentGoal && gameState.currentGoal.checkComplete(gameState)) {
      const completedGoal = gameState.currentGoal;
      const wasAlreadyComplete = gameState.completedGoals.includes(completedGoal.id);
      if (!alreadyPrinted.has(completedGoal.id) && !wasAlreadyComplete) {
        printGoalComplete(completedGoal);
      }
      if (completedGoal.nextGoalId) {
        const nextGoal = getGoalByIdCombined(completedGoal.nextGoalId);
        gameState = {
          ...gameState,
          completedGoals: wasAlreadyComplete
            ? gameState.completedGoals
            : [...gameState.completedGoals, completedGoal.id],
          currentGoal: nextGoal || null,
          failedCurrentGoal: false,
        };
      } else {
        break;
      }
    }

    printSeparator();
    printGameState(gameState);

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  saveVocabulary(gameState.vocabulary);
  console.log('\n📜 Script complete! Vocabulary saved.');
}

async function runInteractiveMode(initialState: GameState): Promise<void> {
  let gameState = initialState;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  printPrompt();

  rl.on('line', async (input) => {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      printPrompt();
      return;
    }

    if (trimmedInput.startsWith('/')) {
      switch (trimmedInput.toLowerCase()) {
        case '/quit':
        case '/exit':
          saveVocabulary(gameState.vocabulary);
          console.log('\n¡Hasta luego! Vocabulary saved.');
          process.exit(0);
        case '/help':
          printHelp();
          break;
        case '/vocab':
          printVocab(gameState);
          break;
        case '/hint':
          if (gameState.currentGoal?.hint) {
            console.log(`💡 Hint: ${gameState.currentGoal.hint}\n`);
          } else {
            console.log('No hint available.\n');
          }
          break;
        case '/status':
          clearScreen();
          printHeader(gameState);
          printGameState(gameState);
          break;
        default:
          console.log(`Unknown command: ${trimmedInput}\n`);
      }
      printPrompt();
      return;
    }

    console.log();
    process.stdout.write('\x1b[2mThinking...\x1b[0m');

    const response = await processInput(trimmedInput, gameState);

    process.stdout.write('\r' + ' '.repeat(20) + '\r');

    let effectsResult: ApplyEffectsResult | null = null;

    if (response.valid) {
      effectsResult = applyEffects(gameState, response);
      gameState = effectsResult.state;

      if (response.understood && response.grammar.score >= 80) {
        const wordsUsed = extractWordsFromText(trimmedInput, gameState.vocabulary);
        for (const wordId of wordsUsed) {
          gameState = {
            ...gameState,
            vocabulary: recordWordUse(gameState.vocabulary, wordId, true),
          };
        }
      }
    } else {
      gameState = { ...gameState, failedCurrentGoal: true };
    }

    printResults(response);

    // Show points awarded
    if (effectsResult && effectsResult.pointsAwarded > 0) {
      printPointsAwarded(effectsResult.pointsAwarded, effectsResult.leveledUp, gameState.level);
    }

    // Handle building transition
    if (effectsResult?.buildingChanged && effectsResult.newBuilding) {
      gameState = handleBuildingTransition(gameState, effectsResult.newBuilding);
    }

    // Show if building was blocked
    if (effectsResult?.buildingBlocked) {
      printBuildingLocked(effectsResult.buildingBlocked, BUILDING_UNLOCK_LEVELS[effectsResult.buildingBlocked]);
    }

    // Track goals we've already shown completion for (to avoid double-printing)
    const alreadyPrinted = new Set<string>();

    // Show immediate feedback for goals completed
    if (response.goalComplete) {
      const completedIds = Array.isArray(response.goalComplete)
        ? response.goalComplete
        : [response.goalComplete];
      for (const goalId of completedIds) {
        const goal = getGoalByIdCombined(goalId);
        if (goal) {
          printGoalComplete(goal);
          alreadyPrinted.add(goalId);
        }
      }
    }

    // Advance through satisfied goals (only print if newly completed, not previously)
    while (gameState.currentGoal && gameState.currentGoal.checkComplete(gameState)) {
      const completedGoal = gameState.currentGoal;
      const wasAlreadyComplete = gameState.completedGoals.includes(completedGoal.id);
      if (!alreadyPrinted.has(completedGoal.id) && !wasAlreadyComplete) {
        printGoalComplete(completedGoal);
      }
      if (completedGoal.nextGoalId) {
        const nextGoal = getGoalByIdCombined(completedGoal.nextGoalId);
        gameState = {
          ...gameState,
          completedGoals: wasAlreadyComplete
            ? gameState.completedGoals
            : [...gameState.completedGoals, completedGoal.id],
          currentGoal: nextGoal || null,
          failedCurrentGoal: false,
        };
      } else {
        break;
      }
    }

    printSeparator();
    printGameState(gameState);
    printPrompt();
  });

  rl.on('close', () => {
    saveVocabulary(gameState.vocabulary);
    console.log('\n¡Hasta luego! Vocabulary saved.');
    process.exit(0);
  });
}
