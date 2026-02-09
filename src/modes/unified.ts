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
import { getPetsInLocation } from '../data/home-basics.js';
import { allLocations as locations, allNPCs, getNPCsInLocation, getGoalById as getGoalByIdCombined, getStartGoalForBuilding, getModuleByName, getPromptInstructionsForBuilding } from '../data/module-registry.js';
import { speak } from '../audio/speak.js';

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

function getSaveFile(profile?: string): string {
  return profile ? `vocabulary-progress-${profile}.json` : 'vocabulary-progress.json';
}

// Ordered action for compound commands
interface Action {
  type: 'open' | 'close' | 'turn_on' | 'turn_off' | 'take' | 'put' | 'go' | 'position' | 'eat' | 'drink' | 'use' | 'cook' | 'pet' | 'feed' | 'talk' | 'give';
  objectId?: string;
  locationId?: string;
  position?: 'standing' | 'in_bed';
  npcId?: string;
  petId?: string;
}

// NPC-initiated actions that affect game state
interface NPCAction {
  npcId: string;
  type: 'add_object' | 'remove_object' | 'give_item' | 'take_item' | 'change_object' | 'move_player';
  objectId?: string;       // For change_object, remove_object
  itemId?: string;         // For give_item/take_item
  changes?: Record<string, unknown>;  // For change_object - state changes to apply
  locationId?: string;     // For move_player, add_object
  // For add_object - define the object to add:
  object?: {
    id: string;
    spanishName: string;
    englishName: string;
    actions?: string[];      // e.g., ["EAT", "TAKE"]
    consumable?: boolean;
    needsEffect?: { hunger?: number; energy?: number; hygiene?: number; bladder?: number };
  };
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
    actionText?: string; // Spanish description of NPC's physical action (e.g., "El mesero pone los tacos en la mesa")
  };
  petResponse?: {
    petId: string;
    reaction: string;
  };
  // NPC actions that affect game state (e.g., waiter delivers food)
  npcActions?: NPCAction[];
}

function buildPrompt(state: GameState): string {
  // Combine static location objects with dynamically added objects (from NPCs)
  const staticObjects = state.location.objects.filter(obj => {
    // Hide generic placeholder objects - they're replaced by actual delivered items
    if (obj.id === 'ordered_food' || obj.id === 'ordered_drink') {
      return false;
    }
    const objState = getObjectState(state, obj);
    if (objState.inFridge) {
      const fridge = state.location.objects.find(o => o.id === 'refrigerator');
      const fridgeState = fridge ? getObjectState(state, fridge) : {};
      return fridgeState.open;
    }
    return true;
  });
  const dynamicObjects = state.dynamicObjects?.[state.location.id] || [];
  const allObjects = [...staticObjects, ...dynamicObjects];

  const objectsDesc = allObjects
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

const CORE_SYSTEM_PROMPT = `You are the game engine for a Spanish language learning life simulation. The player types commands in Spanish to control their character.

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
  "npcResponse": { "npcId": "roommate", "spanish": "...", "english": "...", "wantsItem": "eggs", "actionText": "Carlos te da una palmada en el hombro" },
  "npcActions": [
    { "npcId": "waiter", "type": "add_object", "locationId": "restaurant_table", "object": { "id": "my_sopa", "spanishName": "la sopa", "englishName": "soup", "actions": ["EAT"], "consumable": true, "needsEffect": { "hunger": 30 } } }
  ]
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

NPC ACTIONS - NPCs can add/remove objects, give items, or move the player:
- { "npcId": "waiter", "type": "add_object", "locationId": "restaurant_table", "object": { "id": "my_sopa", "spanishName": "la sopa del día", "englishName": "soup of the day", "actions": ["EAT"], "consumable": true, "needsEffect": { "hunger": 30 } } } - waiter brings food
- { "npcId": "waiter", "type": "add_object", "locationId": "restaurant_table", "object": { "id": "my_drink", "spanishName": "el agua", "englishName": "water", "actions": ["DRINK"], "consumable": true } } - waiter brings drink
- { "npcId": "waiter", "type": "change_object", "objectId": "bill", "changes": { "delivered": true, "total": 150 } } - waiter brings bill
- { "npcId": "host", "type": "move_player", "locationId": "restaurant_table" } - host seats player
- { "npcId": "vendor", "type": "give_item", "itemId": "manzanas" } - vendor gives item to player inventory
- { "npcId": "waiter", "type": "remove_object", "objectId": "my_sopa" } - waiter clears empty plate

WHEN TO USE npcActions:
- Waiter takes drink order → add_object with the drink (agua, limonada, cerveza, etc.)
- Waiter takes food order → add_object with the food (pollo asado, tacos, enchiladas, etc.)
- Waiter brings bill → change_object on bill with delivered=true
- Host seats player → move_player to restaurant_table
- Vendor sells item → give_item to add to player inventory
- Doctor gives prescription → give_item or add_object
IMPORTANT: When an NPC brings something to the player, use add_object to make it appear!

NPC ACTION TEXT: When an NPC performs a physical action (seating, delivering food, giving items, etc.), include "actionText" in npcResponse describing what they do in Spanish. Examples:
- Host seats player → actionText: "El anfitrión te lleva a una mesa junto a la ventana"
- Waiter brings food → actionText: "El mesero pone los tacos en la mesa"
- Doctor gives prescription → actionText: "El doctor te entrega la receta"
- Vendor hands over items → actionText: "Doña María te da las manzanas"
Only include actionText when the NPC does something physical, not for pure dialogue.

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

ADDRESSING NPCs (Spanish patterns to teach):
Players can address NPCs by name, title, or role. These are natural Spanish patterns:
- "Carlos, buenos días" (name first, with comma)
- "Oye mesero, la cuenta" (calling by role: "Hey waiter")
- "Señor, una mesa por favor" (formal title)
- "Disculpe señora, ¿cuánto cuesta?" (polite attention-getter)
- "Doctor, me duele la cabeza" (professional title)

If multiple NPCs are present and the player doesn't specify who they're talking to, either:
1. Use context (ordering food → waiter, not chef)
2. Have the closest/most relevant NPC respond
3. If truly ambiguous, have an NPC ask "¿Me habla a mí?" (Are you talking to me?)

The UI shows NPCs with both their role and name - players can use either.

When generating NPC responses, use simple Spanish appropriate for language learners. Keep responses short (1-2 sentences).

Be encouraging! Focus grammar corrections on one main issue, not every small error.`;

async function processInput(input: string, state: GameState): Promise<UnifiedAIResponse> {
  const contextPrompt = buildPrompt(state);

  // Compose system prompt: core rules + current building's module instructions
  const currentBuilding = getBuildingForLocation(state.location.id);
  const moduleInstructions = getPromptInstructionsForBuilding(currentBuilding);
  const systemPrompt = moduleInstructions
    ? `${CORE_SYSTEM_PROMPT}\n\n${moduleInstructions}`
    : CORE_SYSTEM_PROMPT;

  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
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

// Apply NPC-initiated actions (e.g., waiter delivers food, host seats player)
function applyNPCActions(state: GameState, actions: NPCAction[]): GameState {
  let newState = state;

  for (const action of actions) {
    switch (action.type) {
      case 'change_object':
        // NPC changes an object's state (e.g., waiter sets food.delivered = true)
        if (action.objectId && action.changes) {
          newState = {
            ...newState,
            objectStates: {
              ...newState.objectStates,
              [action.objectId]: {
                ...newState.objectStates[action.objectId],
                ...action.changes,
              },
            },
          };
        }
        break;

      case 'move_player':
        // NPC moves the player (e.g., host seats player at table)
        if (action.locationId && locations[action.locationId]) {
          newState = {
            ...newState,
            location: locations[action.locationId],
            playerPosition: 'standing',
          };
        }
        break;

      case 'give_item':
        // NPC gives item to player (e.g., vendor gives purchase)
        if (action.itemId) {
          // Check if player already has this item
          const alreadyHave = newState.inventory.some(i => i.id === action.itemId);
          if (!alreadyHave) {
            newState = {
              ...newState,
              inventory: [
                ...newState.inventory,
                { id: action.itemId, name: { spanish: action.itemId, english: action.itemId } },
              ],
            };
          }
        }
        break;

      case 'take_item':
        // NPC takes item from player
        if (action.itemId) {
          newState = {
            ...newState,
            inventory: newState.inventory.filter(i => i.id !== action.itemId),
          };
        }
        break;

      case 'add_object':
        // NPC adds an object to a location (e.g., waiter brings food to table)
        if (action.locationId && action.object) {
          const newObj = {
            id: action.object.id,
            name: { spanish: action.object.spanishName, english: action.object.englishName },
            state: {},
            actions: (action.object.actions || ['LOOK']) as ('OPEN' | 'CLOSE' | 'TAKE' | 'PUT' | 'TURN_ON' | 'TURN_OFF' | 'EAT' | 'DRINK' | 'USE' | 'COOK' | 'LOOK' | 'DRESS' | 'PREPARE')[],
            consumable: action.object.consumable,
            needsEffect: action.object.needsEffect,
          };
          const existing = newState.dynamicObjects[action.locationId] || [];
          newState = {
            ...newState,
            dynamicObjects: {
              ...newState.dynamicObjects,
              [action.locationId]: [...existing, newObj],
            },
          };
        }
        break;

      case 'remove_object':
        // NPC removes an object from current location (e.g., waiter clears plates)
        if (action.objectId) {
          const locationId = newState.location.id;
          const existing = newState.dynamicObjects[locationId] || [];
          newState = {
            ...newState,
            dynamicObjects: {
              ...newState.dynamicObjects,
              [locationId]: existing.filter(obj => obj.id !== action.objectId),
            },
          };
        }
        break;
    }
  }

  return newState;
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
          // Only add if not already in inventory (prevent duplicates)
          const alreadyHave = newState.inventory.some(i => i.id === action.objectId);
          if (obj && !alreadyHave) {
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
          // Also remove from dynamic objects if it's a delivered item (food/drink from waiter)
          const locationId = newState.location.id;
          const dynamicObjs = newState.dynamicObjects?.[locationId] || [];
          if (dynamicObjs.some(obj => obj.id === action.objectId)) {
            newState = {
              ...newState,
              dynamicObjects: {
                ...newState.dynamicObjects,
                [locationId]: dynamicObjs.filter(obj => obj.id !== action.objectId),
              },
            };
          }
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

  // Apply NPC actions (waiter delivers food, host seats player, etc.)
  if (response.npcActions && response.npcActions.length > 0) {
    newState = applyNPCActions(newState, response.npcActions);
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

function printResults(response: UnifiedAIResponse, state: GameState): void {
  const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m',
  };

  // Track what to speak (only speak one thing per turn)
  let textToSpeak: string | null = null;

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
    if (npc.actionText) {
      console.log(`   ${COLORS.dim}*${npc.actionText}*${COLORS.reset}`);
    }
    // NPC response takes priority for TTS
    textToSpeak = npc.spanish;
    console.log();
  }

  if (response.understood) {
    if (response.grammar.score === 100) {
      console.log(`   ${COLORS.green}Perfect! ⭐${COLORS.reset} ${COLORS.dim}"${response.spanishModel}"${COLORS.reset}`);
      // Speak Spanish model only if no NPC response
      if (!textToSpeak && response.spanishModel) {
        textToSpeak = response.spanishModel;
      }
    } else if (response.grammar.issues.length > 0) {
      const issue = response.grammar.issues[0];
      // Only show tip if the correction is actually different
      if (issue.original.toLowerCase().trim() !== issue.corrected.toLowerCase().trim()) {
        console.log(`   ${COLORS.yellow}📝 Tip:${COLORS.reset} "${issue.corrected}" is more natural`);
        console.log(`      ${COLORS.dim}${issue.explanation}${COLORS.reset}`);
        // Speak correction only if no NPC response
        if (!textToSpeak) {
          textToSpeak = issue.corrected;
        }
      }
    }
  } else {
    console.log(`   ${COLORS.dim}Try again! Type /hint for help.${COLORS.reset}`);
  }

  // Speak once at the end
  if (state.audioEnabled && textToSpeak) {
    speak(textToSpeak);
  }

  console.log();
}

function loadVocabulary(profile?: string): VocabularyProgress {
  const saveFile = getSaveFile(profile);
  try {
    if (fs.existsSync(saveFile)) {
      return JSON.parse(fs.readFileSync(saveFile, 'utf-8'));
    }
  } catch (error) {
    console.error('Could not load vocabulary:', error);
  }
  return createInitialVocabulary();
}

function saveVocabulary(vocab: VocabularyProgress, profile?: string): void {
  const saveFile = getSaveFile(profile);
  try {
    fs.writeFileSync(saveFile, JSON.stringify(vocab, null, 2));
  } catch (error) {
    console.error('Could not save vocabulary:', error);
  }
}

const MAX_LEARN_PER_DAY = 5;

async function handleLearnCommand(state: GameState, topic: string): Promise<{ state: GameState }> {
  const COLORS = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
  };

  // Calculate current in-game day
  const currentDay = Math.floor((state.time.hour + state.time.minute / 60) / 24) + 1;

  // Reset counter if it's a new day
  let newState = state;
  if (state.lastLearnCommandDay !== currentDay) {
    newState = {
      ...state,
      learnCommandsUsedToday: 0,
      lastLearnCommandDay: currentDay,
    };
  }

  // Check if limit reached
  if (newState.learnCommandsUsedToday >= MAX_LEARN_PER_DAY) {
    console.log(`\n${COLORS.yellow}📚 You've used all ${MAX_LEARN_PER_DAY} /learn commands for today.${COLORS.reset}`);
    console.log(`${COLORS.dim}Come back tomorrow (advance time by playing the game)!${COLORS.reset}\n`);
    return { state: newState };
  }

  console.log(`\n${COLORS.cyan}📚 Learning about: ${topic}${COLORS.reset}`);
  console.log(`${COLORS.dim}(${MAX_LEARN_PER_DAY - newState.learnCommandsUsedToday - 1} /learn uses remaining today)${COLORS.reset}\n`);
  process.stdout.write(`${COLORS.dim}Generating lesson...${COLORS.reset}`);

  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are a friendly Spanish language tutor. Give a brief, helpful lesson on the requested topic.

Guidelines:
- Keep it concise (under 300 words)
- Use simple explanations with clear examples
- Include 3-5 example sentences in Spanish with English translations
- Focus on practical usage, not linguistic theory
- If the topic is vague, pick a common interpretation
- Use markdown formatting for clarity`,
      messages: [
        {
          role: 'user',
          content: `Teach me about: ${topic}`,
        },
      ],
    });

    process.stdout.write('\r' + ' '.repeat(30) + '\r');

    const content = response.content[0];
    if (content.type === 'text') {
      console.log(`${COLORS.green}${COLORS.bold}📖 Lesson: ${topic}${COLORS.reset}\n`);
      console.log(content.text);
      console.log();
    }

    // Increment usage counter
    newState = {
      ...newState,
      learnCommandsUsedToday: newState.learnCommandsUsedToday + 1,
    };

  } catch (error) {
    process.stdout.write('\r' + ' '.repeat(30) + '\r');
    console.log(`${COLORS.yellow}Could not generate lesson. Try again.${COLORS.reset}\n`);
  }

  return { state: newState };
}

export interface GameOptions {
  scriptFile?: string;
  startLocation?: string;
  startGoal?: string;
  skipGoals?: boolean;
  standing?: boolean;
  module?: string;  // 'restaurant' starts at restaurant_entrance with restaurant goals
  noAudio?: boolean;  // Disable text-to-speech
  profile?: string;   // Use a named profile for vocabulary tracking
}

export async function runUnifiedMode(options: GameOptions = {}): Promise<void> {
  const profile = options.profile;
  const existingVocab = loadVocabulary(profile);

  // Handle module selection (overrides startLocation and startGoal)
  let effectiveStartLocation = options.startLocation;
  let effectiveStartGoal = options.startGoal;
  let forceStanding = options.standing || false;

  if (options.module) {
    const mod = getModuleByName(options.module);
    if (mod) {
      effectiveStartLocation = mod.startLocationId;
      effectiveStartGoal = mod.startGoalId;
      forceStanding = mod.name !== 'home';
    }
  }

  // Determine starting location
  const startLocation = effectiveStartLocation && locations[effectiveStartLocation]
    ? locations[effectiveStartLocation]
    : locations['bedroom'];

  // Determine starting goal
  let startGoal: Goal | null = getStartGoalForBuilding('home');
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

  // Disable audio if requested
  if (options.noAudio) {
    gameState = { ...gameState, audioEnabled: false };
  }

  // Store profile in game state for vocabulary saving
  if (profile) {
    gameState = { ...gameState, profile };
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
      if (command.toLowerCase().startsWith('/learn ')) {
        const topic = command.slice(7).trim();
        if (topic) {
          const result = await handleLearnCommand(gameState, topic);
          gameState = result.state;
        }
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

    printResults(response, gameState);

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

  saveVocabulary(gameState.vocabulary, gameState.profile);
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
      // Handle /learn with argument
      if (trimmedInput.toLowerCase().startsWith('/learn ')) {
        const topic = trimmedInput.slice(7).trim();
        if (!topic) {
          console.log('Usage: /learn <topic>\nExample: /learn ser vs estar\n');
        } else {
          const result = await handleLearnCommand(gameState, topic);
          gameState = result.state;
        }
        printPrompt();
        return;
      }

      // Handle /say with argument
      if (trimmedInput.toLowerCase().startsWith('/say ')) {
        const text = trimmedInput.slice(5).trim();
        if (!text) {
          console.log('Usage: /say <spanish text>\nExample: /say buenos días\n');
        } else if (!gameState.audioEnabled) {
          console.log('Audio is off. Use /audio to turn it on.\n');
        } else {
          speak(text);
          console.log(`🔊 "${text}"\n`);
        }
        printPrompt();
        return;
      }

      switch (trimmedInput.toLowerCase()) {
        case '/quit':
        case '/exit':
          saveVocabulary(gameState.vocabulary, gameState.profile);
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
        case '/learn':
          console.log('Usage: /learn <topic>\nExample: /learn ser vs estar\n');
          break;
        case '/audio':
          gameState = { ...gameState, audioEnabled: !gameState.audioEnabled };
          console.log(`🔊 Audio ${gameState.audioEnabled ? 'ON' : 'OFF'}\n`);
          break;
        case '/say':
          console.log('Usage: /say <spanish text>\nExample: /say buenos días\n');
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

    printResults(response, gameState);

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
    saveVocabulary(gameState.vocabulary, gameState.profile);
    console.log('\n¡Hasta luego! Vocabulary saved.');
    process.exit(0);
  });
}
