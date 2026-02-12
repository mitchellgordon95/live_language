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
  isBuildingUnlocked,
  saveLocationProgress,
  loadLocationProgress,
  ACTION_POINTS,
  type BuildingName,
} from '../engine/game-state.js';
import { getPetsInLocation } from '../languages/spanish/modules/home.js';
import { allLocations as locations, getNPCsInLocation, getGoalById as getGoalByIdCombined, getStartGoalForBuilding, getAllGoalsForBuilding, getParseGuidanceForBuilding, getNarrateGuidanceForBuilding, getAllKnownGoalIds } from '../data/module-registry.js';
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

// --- Action Validation Layer ---

const VALID_ACTION_TYPES = new Set([
  'open', 'close', 'turn_on', 'turn_off', 'take', 'put', 'go',
  'position', 'eat', 'drink', 'use', 'cook', 'pet', 'feed', 'talk', 'give',
]);

function getAllObjectsInScope(state: GameState, effectiveLocationId: string): string[] {
  const loc = locations[effectiveLocationId];
  if (!loc) return [];

  const staticIds = loc.objects.map(o => o.id);
  const dynamicIds = (state.dynamicObjects?.[effectiveLocationId] || []).map(o => o.id);
  const inventoryIds = state.inventory.map(i => i.id);
  return [...staticIds, ...dynamicIds, ...inventoryIds];
}

function validateResponse(response: UnifiedAIResponse, state: GameState): UnifiedAIResponse {
  if (!response.valid || !response.actions?.length) return response;

  // Track effective location as we walk through actions (for compound commands)
  let effectiveLocationId = state.location.id;

  const validatedActions = (response.actions || []).filter(action => {
    // Check action type
    if (!VALID_ACTION_TYPES.has(action.type)) {
      console.warn(`[validate] Unknown action type: ${action.type}`);
      return false;
    }

    // Validate 'go' — target must be a valid exit from effective location
    if (action.type === 'go' && action.locationId) {
      const effectiveLoc = locations[effectiveLocationId];
      if (!effectiveLoc) {
        console.warn(`[validate] Cannot resolve effective location: ${effectiveLocationId}`);
        return false;
      }
      const validExits = effectiveLoc.exits.map(e => e.to);
      if (!validExits.includes(action.locationId) && !locations[action.locationId]) {
        console.warn(`[validate] Unknown location: ${action.locationId}`);
        return false;
      }
      // Update effective location for subsequent actions
      effectiveLocationId = action.locationId;
      return true;
    }

    // Validate objectId for actions that use it
    if (action.objectId && !['go', 'position'].includes(action.type)) {
      const objectsInScope = getAllObjectsInScope(state, effectiveLocationId);
      if (!objectsInScope.includes(action.objectId)) {
        console.warn(`[validate] Object not found in scope: ${action.objectId} (location: ${effectiveLocationId})`);
        return false;
      }
    }

    return true;
  });

  // Validate goalComplete IDs
  let validatedGoals = response.goalComplete;
  if (validatedGoals) {
    const goalIds = Array.isArray(validatedGoals) ? validatedGoals : [validatedGoals];
    const knownGoalIds = getAllKnownGoalIds();
    const filtered = goalIds.filter(id => {
      if (!knownGoalIds.has(id)) {
        console.warn(`[validate] Unknown goal ID: ${id}`);
        return false;
      }
      return true;
    });
    validatedGoals = filtered.length > 0 ? filtered : undefined;
  }

  return { ...response, actions: validatedActions, goalComplete: validatedGoals };
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

  // Dynamic goal IDs for current building
  const currentBuilding = getBuildingForLocation(state.location.id);
  const buildingGoals = getAllGoalsForBuilding(currentBuilding);
  const goalIdsDesc = buildingGoals.length > 0
    ? buildingGoals.map(g => `  - "${g.id}" - ${g.title}`).join('\n')
    : '  (none)';

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
Completed goals: ${completedGoalsDesc}

Available goal IDs for this location:
${goalIdsDesc}`;
}

// Active language config - set by runUnifiedMode
let activeLanguage: LanguageConfig;

// --- Two-Pass AI ---

const AI_MODEL = 'claude-opus-4-6';

// Helper to extract JSON from AI response text
function extractJSON(text: string): Record<string, unknown> {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in response');
  return JSON.parse(jsonMatch[0]);
}

// Parse result from Pass 1 (before narration)
interface ParseResult {
  understood: boolean;
  grammar: { score: number; issues: GrammarIssue[] };
  spanishModel: string;
  valid: boolean;
  invalidReason?: string;
  actions: Action[];
  needsChanges?: Partial<Needs>;
}

// Narrate result from Pass 2
interface NarrateResult {
  message: string;
  goalComplete?: string[];
  npcResponse?: {
    npcId: string;
    spanish: string;
    english: string;
    wantsItem?: string;
    actionText?: string;
  };
  npcActions?: NPCAction[];
  petResponse?: {
    petId: string;
    reaction: string;
  };
}

/**
 * Pass 1: Parse Spanish input into grammar feedback + ordered actions.
 * Does NOT narrate or generate NPC dialogue.
 */
async function parseIntent(input: string, state: GameState): Promise<ParseResult> {
  const contextPrompt = buildPrompt(state);

  // Compose system prompt: core parse rules + module-specific parse guidance
  const currentBuilding = getBuildingForLocation(state.location.id);
  const parseGuidance = getParseGuidanceForBuilding(currentBuilding);
  const corePrompt = activeLanguage.coreSystemPrompt;
  const systemPrompt = parseGuidance
    ? `${corePrompt}\n\n${parseGuidance}`
    : corePrompt;

  try {
    const response = await getClient().messages.create({
      model: AI_MODEL,
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
    if (content.type !== 'text') throw new Error('Unexpected response type');

    const parsed = extractJSON(content.text) as unknown as ParseResult;

    if (process.env.DEBUG_UNIFIED) {
      console.log('\n\x1b[2m[DEBUG Pass 1 - Parse]:\x1b[0m');
      console.log('\x1b[2m' + JSON.stringify(parsed, null, 2) + '\x1b[0m\n');
    }

    return parsed;
  } catch (error) {
    console.error('AI Parse error:', error);
    return {
      understood: false,
      grammar: { score: 0, issues: [] },
      spanishModel: '',
      valid: false,
      invalidReason: 'Something went wrong. Try again.',
      actions: [],
    };
  }
}

/**
 * Pass 2: Narrate what happened given validated actions and post-action state.
 * Generates English message, NPC dialogue, goal completions, and NPC actions.
 */
async function narrateTurn(
  parseResult: ParseResult,
  postActionState: GameState,
  input: string,
): Promise<NarrateResult> {
  const currentBuilding = getBuildingForLocation(postActionState.location.id);
  const narrateGuidance = getNarrateGuidanceForBuilding(currentBuilding);
  const narratePrompt = activeLanguage.narrateSystemPrompt;
  const systemPrompt = narrateGuidance
    ? `${narratePrompt}\n\n${narrateGuidance}`
    : narratePrompt;

  // Build context for the narrator
  const stateContext = buildPrompt(postActionState);
  const actionsDesc = parseResult.actions.map(a => {
    const parts = [`type: "${a.type}"`];
    if (a.objectId) parts.push(`objectId: "${a.objectId}"`);
    if (a.locationId) parts.push(`locationId: "${a.locationId}"`);
    if (a.npcId) parts.push(`npcId: "${a.npcId}"`);
    if (a.petId) parts.push(`petId: "${a.petId}"`);
    if (a.position) parts.push(`position: "${a.position}"`);
    return `{ ${parts.join(', ')} }`;
  }).join(', ');

  const userMessage = `PLAYER SAID (in Spanish): "${input}"
CORRECTED SPANISH: "${parseResult.spanishModel}"

VALIDATED ACTIONS: [${actionsDesc}]
NEEDS CHANGES: ${JSON.stringify(parseResult.needsChanges || {})}

${stateContext}

Generate the narrative response for these actions.`;

  try {
    const response = await getClient().messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    const parsed = extractJSON(content.text) as unknown as NarrateResult;

    if (process.env.DEBUG_UNIFIED) {
      console.log('\n\x1b[2m[DEBUG Pass 2 - Narrate]:\x1b[0m');
      console.log('\x1b[2m' + JSON.stringify(parsed, null, 2) + '\x1b[0m\n');
    }

    return parsed;
  } catch (error) {
    console.error('AI Narrate error:', error);
    return {
      message: 'You do that.',
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

/**
 * Apply mechanical effects from Parse (actions + needs + time + points).
 * Does NOT handle goalComplete, npcResponse, or npcActions — those come from Narrate.
 */
function applyMechanicalEffects(state: GameState, parseResult: ParseResult): ApplyEffectsResult {
  let newState = { ...state };
  let totalActionPoints = 0;
  let buildingChanged = false;
  let newBuilding: BuildingName | undefined;
  let buildingBlocked: BuildingName | undefined;

  const grammarScore = parseResult.grammar?.score ?? 100;
  const oldBuilding = getBuildingForLocation(state.location.id);

  // Process actions in order - this is the key to handling compound commands correctly
  for (const action of parseResult.actions || []) {
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
            totalActionPoints -= actionPoints;
            break;
          }

          // Handle building transition
          if (targetBuilding !== oldBuilding) {
            buildingChanged = true;
            newBuilding = targetBuilding;
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
          newState = applyObjectChange(newState, action.objectId, { on: false, ringing: false });
        }
        break;

      case 'take':
        if (action.objectId) {
          const obj = newState.location.objects.find(o => o.id === action.objectId);
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
          newState = {
            ...newState,
            inventory: newState.inventory.filter(i => i.id !== action.objectId),
          };
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
        if (action.type === 'give' && action.objectId) {
          newState = {
            ...newState,
            inventory: newState.inventory.filter(i => i.id !== action.objectId),
          };
        }
        break;
    }
  }

  // Apply needs changes from Parse
  if (parseResult.needsChanges) {
    newState = {
      ...newState,
      needs: {
        energy: Math.max(0, Math.min(100, newState.needs.energy + (parseResult.needsChanges.energy || 0))),
        hunger: Math.max(0, Math.min(100, newState.needs.hunger + (parseResult.needsChanges.hunger || 0))),
        hygiene: Math.max(0, Math.min(100, newState.needs.hygiene + (parseResult.needsChanges.hygiene || 0))),
        bladder: Math.max(0, Math.min(100, newState.needs.bladder + (parseResult.needsChanges.bladder || 0))),
      },
    };
  }

  // Advance time
  newState = advanceTime(newState, 5);

  // Award points for actions (with grammar multiplier)
  let pointsAwarded = 0;
  let leveledUp = false;

  if (parseResult.valid && totalActionPoints > 0) {
    const compoundBonus = (parseResult.actions?.length || 1) > 1 ? 2 : 1;
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

/**
 * Apply narrative effects from Narrate (goalComplete + npcResponse + npcActions).
 */
function applyNarrativeEffects(state: GameState, narrateResult: NarrateResult): GameState {
  let newState = state;

  // Track goal-completing actions
  if (narrateResult.goalComplete && narrateResult.goalComplete.length > 0) {
    newState = {
      ...newState,
      completedGoals: [...newState.completedGoals, ...narrateResult.goalComplete],
    };
  }

  // Track NPC responses and state
  if (narrateResult.npcResponse) {
    const npcId = narrateResult.npcResponse.npcId;
    const currentNpcState = newState.npcState[npcId] || { mood: 'neutral' };
    newState = {
      ...newState,
      npcState: {
        ...newState.npcState,
        [npcId]: {
          ...currentNpcState,
          lastResponse: narrateResult.npcResponse.spanish,
          wantsItem: narrateResult.npcResponse.wantsItem || currentNpcState.wantsItem,
        },
      },
    };
  }

  // Apply NPC actions (waiter delivers food, host seats player, etc.)
  if (narrateResult.npcActions && narrateResult.npcActions.length > 0) {
    newState = applyNPCActions(newState, narrateResult.npcActions);
  }

  return newState;
}

// --- Exported turn processing for web server and terminal ---

export interface TurnResult {
  newState: GameState;
  response: UnifiedAIResponse;
  effectsResult: ApplyEffectsResult | null;
  goalsCompleted: Goal[];
}

/**
 * Process a single game turn using two-pass AI:
 *   Pass 1 (Parse): Spanish input → grammar + validated actions
 *   Pass 2 (Narrate): Actions + state → message + NPC dialogue + goals
 *
 * Used by both terminal mode and the web server.
 */
export async function processTurn(
  input: string,
  state: GameState,
  languageConfig: LanguageConfig,
): Promise<TurnResult> {
  activeLanguage = languageConfig;

  // --- Pass 1: Parse Spanish into actions ---
  const parseResult = await parseIntent(input, state);

  // Validate the parse result
  const parseAsUnified = { ...parseResult, message: '', goalComplete: undefined, npcResponse: undefined, npcActions: undefined } as UnifiedAIResponse;
  const validated = validateResponse(parseAsUnified, state);
  const validatedParse: ParseResult = {
    understood: validated.understood,
    grammar: validated.grammar,
    spanishModel: validated.spanishModel,
    valid: validated.valid,
    invalidReason: validated.invalidReason,
    actions: validated.actions,
    needsChanges: validated.needsChanges,
  };

  // If not understood or invalid, return early (no Pass 2 needed)
  if (!validatedParse.valid) {
    const errorResponse: UnifiedAIResponse = {
      ...validatedParse,
      message: validatedParse.invalidReason || "I didn't understand that.",
      actions: validatedParse.actions || [],
    };
    return {
      newState: { ...state, failedCurrentGoal: true },
      response: errorResponse,
      effectsResult: null,
      goalsCompleted: [],
    };
  }

  // --- Apply mechanical effects (go, open, take, etc.) ---
  const effectsResult = applyMechanicalEffects(state, validatedParse);
  let newState = effectsResult.state;

  // Track vocabulary
  if (validatedParse.understood && validatedParse.grammar.score >= 80) {
    const wordsUsed = extractWordsFromText(input, newState.vocabulary);
    for (const wordId of wordsUsed) {
      newState = {
        ...newState,
        vocabulary: recordWordUse(newState.vocabulary, wordId, true),
      };
    }
  }

  // Handle building transition before narration (so narrator sees correct building)
  if (effectsResult.buildingChanged && effectsResult.newBuilding) {
    newState = handleBuildingTransition(newState, effectsResult.newBuilding);
  }

  // --- Pass 2: Narrate what happened ---
  const narrateResult = await narrateTurn(validatedParse, newState, input);

  // Validate goal IDs from narration
  if (narrateResult.goalComplete) {
    const knownGoalIds = getAllKnownGoalIds();
    narrateResult.goalComplete = narrateResult.goalComplete.filter(id => {
      if (!knownGoalIds.has(id)) {
        console.warn(`[validate] Narrate returned unknown goal ID: ${id}`);
        return false;
      }
      return true;
    });
    if (narrateResult.goalComplete.length === 0) {
      narrateResult.goalComplete = undefined;
    }
  }

  // Apply narrative effects (goals, NPC state, NPC actions)
  newState = applyNarrativeEffects(newState, narrateResult);

  // Build combined response for backward compatibility
  const response: UnifiedAIResponse = {
    understood: validatedParse.understood,
    grammar: validatedParse.grammar,
    spanishModel: validatedParse.spanishModel,
    valid: validatedParse.valid,
    invalidReason: validatedParse.invalidReason,
    actions: validatedParse.actions,
    needsChanges: validatedParse.needsChanges,
    message: narrateResult.message,
    goalComplete: narrateResult.goalComplete,
    npcResponse: narrateResult.npcResponse,
    npcActions: narrateResult.npcActions,
    petResponse: narrateResult.petResponse,
  };

  // Collect goals completed by AI narration
  const goalsCompleted: Goal[] = [];
  if (narrateResult.goalComplete) {
    for (const goalId of narrateResult.goalComplete) {
      const goal = getGoalByIdCombined(goalId);
      if (goal) goalsCompleted.push(goal);
    }
  }

  // Check ALL goals in current building for completion (engine-driven)
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

  // Update effectsResult with final state (includes narrative effects)
  const finalEffectsResult = { ...effectsResult, state: newState };

  return { newState, response, effectsResult: finalEffectsResult, goalsCompleted };
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
