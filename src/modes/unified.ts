/**
 * Unified Mode: Structured game state + AI-generated effects
 *
 * Keeps: grammar feedback, goals, needs, object lists, vocabulary tracking
 * Removes: hardcoded action executors (executeOpen, executeCook, etc.)
 *
 * The AI directly decides what state changes to make based on Spanish input.
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import type { GameState, Goal, VocabularyProgress, Needs, ObjectState, GrammarIssue } from '../engine/types.js';
import {
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
  type BuildingName,
} from '../engine/game-state.js';
import { getPetsInLocation } from '../languages/spanish/modules/home.js';
import { allLocations as locations, getNPCsInLocation, getGoalById as getGoalByIdCombined, getStartGoalForBuilding, getAllGoalsForBuilding, getPromptInstructionsForBuilding } from '../data/module-registry.js';
import type { LanguageConfig } from '../languages/types.js';

// Handle transitioning to a new building - load goals and update state
function handleBuildingTransition(state: GameState, newBuilding: BuildingName): GameState {
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

export interface UnifiedAIResponse {
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
      let desc = `- ${obj.id}: "${obj.name.target}" (${obj.name.native})`;
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
    .map(e => `- ${e.to}: "${e.name.target}" (${e.name.native})`)
    .join('\n');

  const inventoryDesc = state.inventory.length > 0
    ? state.inventory.map(i => `- ${i.id}: "${i.name.target}"`).join('\n')
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
        let desc = `- ${npc.id}: ${npc.name.target} (${npc.name.native}) - ${npc.personality}`;
        if (npcState?.mood) desc += ` [mood: ${npcState.mood}]`;
        if (npcState?.wantsItem) desc += ` [wants: ${npcState.wantsItem}]`;
        return desc;
      }).join('\n')
    : '(none)';

  // Pets in current location
  const petsHere = getPetsInLocation(state.location.id, state.petLocations);
  const petsDesc = petsHere.length > 0
    ? petsHere.map(pet => `- ${pet.id}: "${pet.name.target}" (${pet.name.native}) - ${pet.personality}`).join('\n')
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

Location: ${state.location.id} (${state.location.name.native})
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

// Active language config - set by runUnifiedMode
let activeLanguage: LanguageConfig;

async function processInput(input: string, state: GameState): Promise<UnifiedAIResponse> {
  const contextPrompt = buildPrompt(state);

  // Compose system prompt: core rules + current building's module instructions
  const currentBuilding = getBuildingForLocation(state.location.id);
  const moduleInstructions = getPromptInstructionsForBuilding(currentBuilding);
  const corePrompt = activeLanguage.coreSystemPrompt;
  const systemPrompt = moduleInstructions
    ? `${corePrompt}\n\n${moduleInstructions}`
    : corePrompt;

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
                { id: action.itemId, name: { target: action.itemId, native: action.itemId } },
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
            name: { target: action.object.spanishName, native: action.object.englishName },
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
export interface ApplyEffectsResult {
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

// --- Exported turn processing for web server and terminal ---

export interface TurnResult {
  newState: GameState;
  response: UnifiedAIResponse;
  effectsResult: ApplyEffectsResult | null;
  goalsCompleted: Goal[];
}

/**
 * Process a single game turn: AI input → effects → vocabulary → goals.
 * Used by both terminal mode and the web server.
 */
export async function processTurn(
  input: string,
  state: GameState,
  languageConfig: LanguageConfig,
): Promise<TurnResult> {
  // Set active language for processInput's system prompt
  activeLanguage = languageConfig;

  const response = await processInput(input, state);

  let newState = state;
  let effectsResult: ApplyEffectsResult | null = null;
  const goalsCompleted: Goal[] = [];

  if (response.valid) {
    effectsResult = applyEffects(newState, response);
    newState = effectsResult.state;

    // Track vocabulary
    if (response.understood && response.grammar.score >= 80) {
      const wordsUsed = extractWordsFromText(input, newState.vocabulary);
      for (const wordId of wordsUsed) {
        newState = {
          ...newState,
          vocabulary: recordWordUse(newState.vocabulary, wordId, true),
        };
      }
    }
  } else {
    newState = { ...newState, failedCurrentGoal: true };
  }

  // Handle building transition
  if (effectsResult?.buildingChanged && effectsResult.newBuilding) {
    newState = handleBuildingTransition(newState, effectsResult.newBuilding);
  }

  // Collect goals completed by AI response
  if (response.goalComplete) {
    const completedIds = Array.isArray(response.goalComplete)
      ? response.goalComplete
      : [response.goalComplete];
    for (const goalId of completedIds) {
      const goal = getGoalByIdCombined(goalId);
      if (goal) goalsCompleted.push(goal);
    }
  }

  // Check ALL goals in current building for completion (not just the chain)
  const currentBuilding = getBuildingForLocation(newState.location.id);
  const allBuildingGoals = getAllGoalsForBuilding(currentBuilding);

  for (const goal of allBuildingGoals) {
    if (!newState.completedGoals.includes(goal.id) && goal.checkComplete(newState)) {
      if (!goalsCompleted.some(g => g.id === goal.id)) {
        goalsCompleted.push(goal);
      }
      newState = {
        ...newState,
        completedGoals: [...newState.completedGoals, goal.id],
      };
    }
  }

  // Update suggested goal: first uncompleted goal in chain order
  let suggestedGoal = getStartGoalForBuilding(currentBuilding);
  while (suggestedGoal && newState.completedGoals.includes(suggestedGoal.id)) {
    suggestedGoal = suggestedGoal.nextGoalId
      ? getGoalByIdCombined(suggestedGoal.nextGoalId) || null
      : null;
  }
  newState = {
    ...newState,
    currentGoal: suggestedGoal,
    failedCurrentGoal: false,
  };

  return { newState, response, effectsResult, goalsCompleted };
}

export function loadVocabulary(profile?: string): VocabularyProgress {
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

export function saveVocabulary(vocab: VocabularyProgress, profile?: string): void {
  const saveFile = getSaveFile(profile);
  try {
    fs.writeFileSync(saveFile, JSON.stringify(vocab, null, 2));
  } catch (error) {
    console.error('Could not save vocabulary:', error);
  }
}
