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
import { createInitialState, advanceTime } from '../engine/game-state.js';
import { bedroom, getStartGoal, getGoalById, locations, getNPCsInLocation, getPetsInLocation, npcs, pets } from '../data/home-basics.js';
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
} from '../ui/terminal.js';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

const SAVE_FILE = 'vocabulary-progress.json';

interface UnifiedAIResponse {
  // Language learning
  understood: boolean;
  grammar: {
    score: number;
    issues: GrammarIssue[];
  };
  spanishModel: string;

  // Effects (replaces hardcoded executors)
  valid: boolean;
  invalidReason?: string;
  effects: {
    message: string;
    objectChanges?: { objectId: string; changes: Partial<ObjectState> }[];
    needsChanges?: Partial<Needs>;
    locationChange?: string; // location ID
    positionChange?: 'in_bed' | 'standing';
    inventoryAdd?: string[]; // object IDs
    inventoryRemove?: string[]; // object IDs
    goalComplete?: string | string[]; // goal IDs this action completes
    npcResponse?: {
      npcId: string;
      spanish: string;
      english: string;
      wantsItem?: string; // What they asked for (for breakfast requests)
    };
    petLocationChange?: { petId: string; newLocation: string };
  };
}

function buildPrompt(state: GameState): string {
  const objectsDesc = state.location.objects
    .filter(obj => {
      if (obj.state.inFridge) {
        const fridge = state.location.objects.find(o => o.id === 'refrigerator');
        return fridge?.state.open;
      }
      return true;
    })
    .map(obj => {
      let desc = `- ${obj.id}: "${obj.name.spanish}" (${obj.name.english})`;
      if (obj.state.open === true) desc += ' [OPEN]';
      if (obj.state.open === false) desc += ' [CLOSED]';
      if (obj.state.on === true) desc += ' [ON]';
      if (obj.state.on === false) desc += ' [OFF]';
      if (obj.state.ringing) desc += ' [RINGING]';
      if (obj.takeable) desc += ' [takeable]';
      if (obj.consumable) desc += ' [consumable]';
      if (obj.state.inFridge) desc += ' [in fridge]';
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

Player inventory:
${inventoryDesc}

Needs (0-100, higher is better):
- energy: ${state.needs.energy}
- hunger: ${state.needs.hunger}
- hygiene: ${state.needs.hygiene}
- bladder: ${state.needs.bladder}

${goalDesc}`;
}

const SYSTEM_PROMPT = `You are the game engine for a Spanish language learning life simulation. The player types commands in Spanish to control their character.

Your job:
1. Understand their Spanish input (be generous - if a native speaker would understand, accept it)
2. Provide grammar feedback to help them learn
3. Decide if the action is valid in the current context
4. Specify exactly what game state changes should occur

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

  "effects": {
    "message": "What happened, in English (e.g., 'You open the refrigerator.')",
    "objectChanges": [{ "objectId": "object_id", "changes": { "open": true } }],
    "needsChanges": { "hunger": 10, "energy": -5 },
    "locationChange": "location_id",
    "positionChange": "standing",
    "inventoryAdd": ["object_id"],
    "inventoryRemove": ["object_id"],
    "goalComplete": ["goal_id"],
    "npcResponse": { "npcId": "roommate", "spanish": "...", "english": "...", "wantsItem": "eggs" }
  }
}

RULES FOR EFFECTS:
- objectChanges: Only change properties that exist (open, on, ringing). Use the object's ID.
- needsChanges: Use small increments (-20 to +20). Positive = better.
- locationChange: Only to valid exits from current location.
- positionChange: "standing" or "in_bed". Player must be standing to leave bedroom.
- inventoryAdd/Remove: Only for takeable/consumable items.
- goalComplete: Array of goal IDs this action completes. Include ANY matching goal, not just the current one:
  - "brush_teeth" - when player brushes teeth
  - "take_shower" - when player showers
  - "make_breakfast" - when player eats food
  - "greet_roommate" - when player greets the roommate (hola, buenos días, etc.)
  - "ask_roommate_breakfast" - when player asks roommate what they want to eat
  - "feed_pets" - when player feeds a pet
- npcResponse: When player talks to an NPC, include their response in Spanish and English. For breakfast questions, include wantsItem (eggs, toast, coffee, etc.)

VALIDATION RULES:
- Can't interact with objects not in current location
- Can't go to locations not in exits list
- Can't open something already open (or close something already closed)
- Must be in kitchen to cook, bathroom to shower/brush teeth
- Can't take items from closed fridge
- Player must get out of bed (positionChange: "standing") before moving to other rooms
- Can only talk to NPCs in the current location
- Can only interact with pets in the current location

IMPORTANT: Let the player do whatever valid action they want, even if it doesn't match the current goal. Don't refuse actions just because there's a "better" thing to do. The player is in control.

COMMON ACTIONS:
- "me levanto" / "me despierto" → positionChange: "standing"
- "voy a/al [place]" → locationChange
- "abro/cierro [object]" → objectChanges with open: true/false
- "enciendo/apago [object]" → objectChanges with on: true/false, ringing: false for alarm
- "tomo/agarro [object]" → inventoryAdd (if takeable)
- "como [food]" → inventoryRemove + needsChanges (hunger +20-30), goalComplete: ["make_breakfast"]
- "bebo [drink]" → needsChanges (hunger +5-10)
- "me ducho" → needsChanges (hygiene +50), goalComplete: ["take_shower"], must be in bathroom
- "uso el inodoro" → needsChanges (bladder +100), must be in bathroom
- "me cepillo los dientes" → needsChanges (hygiene +10), goalComplete: ["brush_teeth"], must be in bathroom
- "miro [object]" → just describe it, no state changes needed
- "me visto" → requires closet open, in bedroom

NPC INTERACTIONS:
- "hola [name]" / "buenos días" → greet NPC, they respond, goalComplete: ["greet_roommate"]
- "hablo con [name]" → start conversation, NPC responds based on personality
- "¿qué quieres?" / "¿qué quieres para desayunar?" → NPC says what food they want (use wantsItem), goalComplete: ["ask_roommate_breakfast"]
- "le doy [food] a [name]" → give food to NPC, they thank you

PET INTERACTIONS:
- "acaricio al [gato/perro]" → pet the animal, it reacts happily
- "le doy comida al [gato/perro]" → feed the pet, goalComplete: ["feed_pets"]
- "juego con el [perro]" → play with dog, it gets excited

NPC PERSONALITIES:
- Carlos (roommate): Sleepy, friendly, casual speech. In the morning, wants coffee or breakfast (eggs, toast).
- Luna (cat): Independent, aloof. Responds with purring or ignoring.
- Max (dog): Excited, eager. Responds with tail wagging and barking.

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
      effects: { message: 'Error processing input.' },
    };
  }
}

function applyEffects(state: GameState, effects: UnifiedAIResponse['effects']): GameState {
  let newState = { ...state };

  // Apply object changes
  if (effects.objectChanges) {
    for (const change of effects.objectChanges) {
      const objIndex = newState.location.objects.findIndex(o => o.id === change.objectId);
      if (objIndex !== -1) {
        newState = {
          ...newState,
          location: {
            ...newState.location,
            objects: newState.location.objects.map((obj, i) =>
              i === objIndex
                ? { ...obj, state: { ...obj.state, ...change.changes } }
                : obj
            ),
          },
        };
      }
    }
  }

  // Apply needs changes
  if (effects.needsChanges) {
    newState = {
      ...newState,
      needs: {
        energy: Math.max(0, Math.min(100, newState.needs.energy + (effects.needsChanges.energy || 0))),
        hunger: Math.max(0, Math.min(100, newState.needs.hunger + (effects.needsChanges.hunger || 0))),
        hygiene: Math.max(0, Math.min(100, newState.needs.hygiene + (effects.needsChanges.hygiene || 0))),
        bladder: Math.max(0, Math.min(100, newState.needs.bladder + (effects.needsChanges.bladder || 0))),
      },
    };
  }

  // Apply location change
  if (effects.locationChange && locations[effects.locationChange]) {
    newState = {
      ...newState,
      location: locations[effects.locationChange],
    };
  }

  // Apply position change
  if (effects.positionChange) {
    newState = {
      ...newState,
      playerPosition: effects.positionChange,
    };
  }

  // Apply inventory changes
  if (effects.inventoryAdd) {
    for (const objId of effects.inventoryAdd) {
      const obj = state.location.objects.find(o => o.id === objId);
      if (obj) {
        newState = {
          ...newState,
          inventory: [...newState.inventory, { id: obj.id, name: obj.name }],
        };
      }
    }
  }

  if (effects.inventoryRemove) {
    newState = {
      ...newState,
      inventory: newState.inventory.filter(item => !effects.inventoryRemove!.includes(item.id)),
    };
  }

  // Track goal-completing actions (so checkComplete can find them)
  if (effects.goalComplete) {
    const goals = Array.isArray(effects.goalComplete)
      ? effects.goalComplete
      : [effects.goalComplete];
    if (goals.length > 0) {
      newState = {
        ...newState,
        completedGoals: [...newState.completedGoals, ...goals],
      };
    }
  }

  // Track NPC responses and state
  if (effects.npcResponse) {
    const npcId = effects.npcResponse.npcId;
    const currentNpcState = newState.npcState[npcId] || { mood: 'neutral' };
    newState = {
      ...newState,
      npcState: {
        ...newState.npcState,
        [npcId]: {
          ...currentNpcState,
          lastResponse: effects.npcResponse.spanish,
          wantsItem: effects.npcResponse.wantsItem || currentNpcState.wantsItem,
        },
      },
    };
  }

  // Handle pet location changes
  if (effects.petLocationChange) {
    newState = {
      ...newState,
      petLocations: {
        ...newState.petLocations,
        [effects.petLocationChange.petId]: effects.petLocationChange.newLocation,
      },
    };
  }

  // Advance time
  newState = advanceTime(newState, 5);

  return newState;
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
    console.log(`${COLORS.green}✓${COLORS.reset} ${response.effects.message}`);
  } else {
    console.log(`${COLORS.yellow}✗${COLORS.reset} ${response.invalidReason || response.effects.message}`);
  }
  console.log();

  // Show NPC response if present and valid
  if (response.effects.npcResponse?.spanish && response.effects.npcResponse?.npcId) {
    const npc = response.effects.npcResponse;
    console.log(`   ${COLORS.cyan}💬 ${npc.npcId}:${COLORS.reset} "${npc.spanish}"`);
    console.log(`      ${COLORS.dim}(${npc.english})${COLORS.reset}`);
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

export async function runUnifiedMode(scriptFile?: string): Promise<void> {
  const existingVocab = loadVocabulary();
  let gameState = createInitialState(bedroom, getStartGoal(), existingVocab);

  clearScreen();
  printHeader();
  printWelcome();
  printSeparator();
  printGameState(gameState);

  if (scriptFile) {
    await runScriptMode(scriptFile, gameState);
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
        printHeader();
        printGameState(gameState);
      }
      continue;
    }

    console.log(`> ${command}\n`);
    process.stdout.write('\x1b[2mThinking...\x1b[0m');

    const response = await processInput(command, gameState);

    process.stdout.write('\r' + ' '.repeat(20) + '\r');

    if (response.valid) {
      gameState = applyEffects(gameState, response.effects);

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

    // Track goals we've already shown completion for (to avoid double-printing)
    const alreadyPrinted = new Set<string>();

    // Show immediate feedback for goals completed out of order
    if (response.effects.goalComplete) {
      const completedIds = Array.isArray(response.effects.goalComplete)
        ? response.effects.goalComplete
        : [response.effects.goalComplete];
      for (const goalId of completedIds) {
        const goal = getGoalById(goalId);
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
        const nextGoal = getGoalById(completedGoal.nextGoalId);
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
          printHeader();
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

    if (response.valid) {
      gameState = applyEffects(gameState, response.effects);

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

    // Track goals we've already shown completion for (to avoid double-printing)
    const alreadyPrinted = new Set<string>();

    // Show immediate feedback for goals completed
    if (response.effects.goalComplete) {
      const completedIds = Array.isArray(response.effects.goalComplete)
        ? response.effects.goalComplete
        : [response.effects.goalComplete];
      for (const goalId of completedIds) {
        const goal = getGoalById(goalId);
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
        const nextGoal = getGoalById(completedGoal.nextGoalId);
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
