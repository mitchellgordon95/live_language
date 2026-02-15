/**
 * Unified Mode: Generic mutation-based game engine
 *
 * Two-pass AI architecture:
 *   Pass 1 (Parse): Spanish input → grammar feedback + ordered mutations
 *   Pass 2 (Narrate): Applied mutations + state → narrative + NPC dialogue + goals
 *
 * All state changes are expressed as generic mutations (go, move, tag, etc.).
 * No action-type-specific code — the AI decides what changes to make.
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  GameState,
  TutorialStep,
  Quest,
  NPCChatEntry,
  VocabularyProgress,
  Mutation,
  GrammarIssue,
  ParseResponse,
  NarrateResponse,
} from '../engine/types';
import {
  advanceTime,
  applyMutations,
  getBuildingForLocation,
  awardPoints,
  applyQuestReward,
  saveLocationProgress,
  loadLocationProgress,
  type BuildingName,
} from '../engine/game-state';
import {
  allLocations as locations,
  allNPCs,
  getStepById,
  getStartStepForBuilding,
  getAllStepsForBuilding,
  getGuidanceForBuilding,
  getAllKnownStepIds,
  getAllQuestsForModule,
  getQuestById,
} from '../data/module-registry';
import type { LanguageConfig } from '../languages/types';
import { createInitialVocabulary, recordWordUse, extractWordsFromText } from '../engine/vocabulary';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

const AI_MODEL = 'claude-opus-4-6';

// Active language config — set by processTurn
let activeLanguage: LanguageConfig;

// ============================================================================
// HELPERS
// ============================================================================

function extractJSON(text: string): Record<string, unknown> {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in response');
  return JSON.parse(jsonMatch[0]);
}

// ============================================================================
// CONTEXT BUILDING
// ============================================================================

function buildPrompt(state: GameState): string {
  // Objects in current location (not removed)
  const objectsHere = state.objects.filter(
    o => o.location === state.currentLocation && o.location !== 'removed'
  );

  // Objects inside open containers at current location
  const inOpenContainers = state.objects.filter(o => {
    if (o.location === 'removed') return false;
    const container = state.objects.find(c => c.id === o.location);
    return container?.location === state.currentLocation && container.tags.includes('open');
  });

  // Inventory
  const inventory = state.objects.filter(o => o.location === 'inventory');

  // All visible objects
  const visibleObjects = [...objectsHere, ...inOpenContainers];

  const objectsDesc = visibleObjects.length > 0
    ? visibleObjects.map(obj => {
        const tagsStr = obj.tags.length > 0 ? ` [${obj.tags.join(', ')}]` : '';
        const needsStr = obj.needsEffect ? ` {needsEffect: ${JSON.stringify(obj.needsEffect)}}` : '';
        const containerNote = obj.location !== state.currentLocation ? ` (inside ${obj.location})` : '';
        return `- ${obj.id}: "${obj.name.target}" (${obj.name.native})${tagsStr}${needsStr}${containerNote}`;
      }).join('\n')
    : '(none)';

  // Exits
  const currentLoc = locations[state.currentLocation];
  const exitsDesc = currentLoc
    ? currentLoc.exits.map(e => `- ${e.to}: "${e.name.target}" (${e.name.native})`).join('\n')
    : '(no exits)';

  // Inventory description
  const inventoryDesc = inventory.length > 0
    ? inventory.map(i => {
        const tagsStr = i.tags.length > 0 ? ` [${i.tags.join(', ')}]` : '';
        return `- ${i.id}: "${i.name.target}"${tagsStr}`;
      }).join('\n')
    : '(empty)';

  // NPCs in current location (check runtime state for location)
  const npcsHere = allNPCs.filter(npc => {
    const runtimeState = state.npcStates[npc.id];
    return runtimeState
      ? runtimeState.location === state.currentLocation
      : npc.location === state.currentLocation;
  });

  const npcsDesc = npcsHere.length > 0
    ? npcsHere.map(npc => {
        const runtimeState = state.npcStates[npc.id];
        let desc = `- ${npc.id}: ${npc.name.target} (${npc.name.native})`;
        if (npc.isPet) desc += ' [pet]';
        desc += ` - ${npc.personality}`;
        if (runtimeState?.mood) desc += ` [mood: ${runtimeState.mood}]`;
        if (runtimeState?.wantsItem) desc += ` [wants: ${runtimeState.wantsItem}]`;
        // Append chat history for this NPC
        const history = state.npcChatHistory[npc.id];
        if (history?.length) {
          desc += '\n  Recent interactions:';
          for (const entry of history) {
            if (entry.summary) {
              desc += `\n    [${entry.summary}]`;
            }
            if (entry.playerInput) {
              desc += `\n    Player: "${entry.playerInput}"`;
            }
            if (entry.npcResponse) {
              desc += `\n    ${npc.name.native}: "${entry.npcResponse}"`;
            }
            if (entry.npcAction) {
              desc += ` *${entry.npcAction}*`;
            }
            if (entry.questCompleted) {
              desc += ` [Quest completed: ${entry.questCompleted}]`;
            }
            if (entry.moodAfter) {
              desc += `\n    [mood changed to: ${entry.moodAfter}]`;
            }
          }
        }
        return desc;
      }).join('\n')
    : '(none)';

  // Player tags
  const playerTagsStr = state.playerTags.length > 0
    ? state.playerTags.join(', ')
    : '(none)';

  let prompt = `CURRENT GAME STATE:

Location: ${state.currentLocation} (${currentLoc?.name.native || state.currentLocation})
Player tags: [${playerTagsStr}]

Objects here:
${objectsDesc}

NPCs/Pets here:
${npcsDesc}

Exits to:
${exitsDesc}

Player inventory:
${inventoryDesc}

Needs (0-100, higher is better):
- energy: ${state.needs.energy}
- hunger: ${state.needs.hunger}
- hygiene: ${state.needs.hygiene}
- bladder: ${state.needs.bladder}`;

  // Tutorial section — only if tutorial is active
  const tutorialActive = state.currentStep && state.currentStep.id !== 'tutorial_complete';
  if (tutorialActive) {
    const currentBuilding = getBuildingForLocation(state.currentLocation);
    const buildingSteps = getAllStepsForBuilding(currentBuilding);
    const stepIdsDesc = buildingSteps.length > 0
      ? buildingSteps.map(g => `  - "${g.id}" - ${g.title}`).join('\n')
      : '  (none)';
    const completedStepsDesc = state.completedSteps.length > 0
      ? state.completedSteps.join(', ')
      : '(none)';

    prompt += `

Current step: ${state.currentStep!.title}
Step ID: ${state.currentStep!.id}
Completed steps: ${completedStepsDesc}

Available step IDs for this location:
${stepIdsDesc}`;
  }

  // Quest section — only if quests are active or completed
  const currentBuilding = getBuildingForLocation(state.currentLocation);
  const moduleQuests = getAllQuestsForModule(currentBuilding);
  const activeQuestDescs = moduleQuests
    .filter(q => state.activeQuests.includes(q.id))
    .map(q => `- "${q.id}": ${q.description}\n  COMPLETE WHEN: ${q.completionHint}`);

  if (activeQuestDescs.length > 0) {
    prompt += `

ACTIVE QUESTS:
${activeQuestDescs.join('\n')}`;
  }

  if (state.completedQuests.length > 0) {
    prompt += `\nCOMPLETED QUESTS: ${state.completedQuests.join(', ')}`;
  }

  // Available quests — eligible but not yet started, for NPCs to offer during dialog
  const availableQuests = moduleQuests.filter(q =>
    !q.autoStart &&
    !state.activeQuests.includes(q.id) &&
    !state.completedQuests.includes(q.id) &&
    !state.abandonedQuests.includes(q.id) &&
    (!q.prereqs || q.prereqs.every(p => state.completedQuests.includes(p))) &&
    q.triggerCondition(state)
  );

  if (availableQuests.length > 0) {
    const descs = availableQuests.map(q =>
      `- "${q.id}" (offered by ${q.sourceId || 'event'}): ${q.description}`
    );
    prompt += `

AVAILABLE QUESTS (start these via questsStarted when the NPC naturally offers them in conversation):
${descs.join('\n')}`;
  }

  return prompt;
}

// ============================================================================
// MUTATION VALIDATION
// ============================================================================

function validateMutations(mutations: Mutation[], state: GameState): Mutation[] {
  let effectiveLocation = state.currentLocation;

  return mutations.filter(mutation => {
    switch (mutation.type) {
      case 'go': {
        const loc = locations[effectiveLocation];
        if (!loc) return false;
        const validExits = loc.exits.map(e => e.to);
        if (!validExits.includes(mutation.locationId) && !locations[mutation.locationId]) {
          console.warn(`[validate] Invalid go target: ${mutation.locationId}`);
          return false;
        }
        effectiveLocation = mutation.locationId;
        return true;
      }

      case 'move': {
        const obj = state.objects.find(o => o.id === mutation.objectId);
        if (!obj) {
          console.warn(`[validate] Object not found: ${mutation.objectId}`);
          return false;
        }
        return true;
      }

      case 'tag': {
        const obj = state.objects.find(o => o.id === mutation.objectId);
        if (!obj) {
          console.warn(`[validate] Object not found: ${mutation.objectId}`);
          return false;
        }
        return true;
      }

      case 'remove': {
        const obj = state.objects.find(o => o.id === mutation.objectId);
        if (!obj) {
          console.warn(`[validate] Object not found: ${mutation.objectId}`);
          return false;
        }
        return true;
      }

      case 'playerTag':
      case 'needs':
        return true;

      case 'create': {
        const exists = state.objects.find(o => o.id === mutation.object.id);
        if (exists) {
          console.warn(`[validate] Object already exists: ${mutation.object.id}`);
          return false;
        }
        return true;
      }

      case 'npcMood': {
        if (!state.npcStates[mutation.npcId]) {
          console.warn(`[validate] NPC not found: ${mutation.npcId}`);
          return false;
        }
        return true;
      }
    }
  });
}

// ============================================================================
// TWO-PASS AI
// ============================================================================

/**
 * Pass 1: Parse target language input into grammar feedback + ordered mutations.
 */
async function parseIntent(input: string, state: GameState): Promise<ParseResponse> {
  const contextPrompt = buildPrompt(state);

  const currentBuilding = getBuildingForLocation(state.currentLocation);
  const guidance = getGuidanceForBuilding(currentBuilding);
  const corePrompt = activeLanguage.coreSystemPrompt;
  const systemPrompt = guidance
    ? `${corePrompt}\n\n${guidance}`
    : corePrompt;

  try {
    const response = await getClient().messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: `${contextPrompt}\n\nPLAYER INPUT: "${input}"` },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    const raw = extractJSON(content.text) as Record<string, unknown>;
    // Map language-specific AI field name to generic internal name
    const targetField = activeLanguage.promptConfig.targetModelField;
    raw.targetModel = raw[targetField] ?? raw.targetModel ?? '';
    const parsed = raw as unknown as ParseResponse;

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
      targetModel: '',
      valid: false,
      invalidReason: 'Something went wrong. Try again.',
      mutations: [],
    };
  }
}

/**
 * Pass 2: Narrate what happened given applied mutations and post-mutation state.
 */
async function narrateTurn(
  parseResult: ParseResponse,
  postMutationState: GameState,
  input: string,
): Promise<NarrateResponse> {
  const currentBuilding = getBuildingForLocation(postMutationState.currentLocation);
  const guidance = getGuidanceForBuilding(currentBuilding);
  const narratePrompt = activeLanguage.narrateSystemPrompt;
  const systemPrompt = guidance
    ? `${narratePrompt}\n\n${guidance}`
    : narratePrompt;

  const stateContext = buildPrompt(postMutationState);
  const mutationsDesc = JSON.stringify(parseResult.mutations);

  const langName = activeLanguage.promptConfig.languageName;
  const userMessage = `PLAYER SAID (in ${langName}): "${input}"
CORRECTED ${langName.toUpperCase()}: "${parseResult.targetModel}"

APPLIED MUTATIONS: ${mutationsDesc}

${stateContext}

Generate the narrative response for these mutations.`;

  try {
    const response = await getClient().messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    const raw = extractJSON(content.text) as Record<string, unknown>;
    // Map language-specific NPC response field to generic internal name
    const npcField = activeLanguage.promptConfig.npcTargetField;
    if (raw.npcResponse && typeof raw.npcResponse === 'object') {
      const npc = raw.npcResponse as Record<string, unknown>;
      npc.target = npc[npcField] ?? npc.target ?? '';
    }
    const parsed = raw as unknown as NarrateResponse;

    if (process.env.DEBUG_UNIFIED) {
      console.log('\n\x1b[2m[DEBUG Pass 2 - Narrate]:\x1b[0m');
      console.log('\x1b[2m' + JSON.stringify(parsed, null, 2) + '\x1b[0m\n');
    }

    return parsed;
  } catch (error) {
    console.error('AI Narrate error:', error);
    return { message: 'You do that.' };
  }
}

// ============================================================================
// BUILDING TRANSITIONS
// ============================================================================

function handleBuildingTransition(state: GameState, newBuilding: BuildingName): GameState {
  const progress = loadLocationProgress(state, newBuilding);

  let newStep: TutorialStep | null = null;
  if (progress.stepId) {
    newStep = getStepById(progress.stepId) || null;
  }
  if (!newStep) {
    newStep = getStartStepForBuilding(newBuilding);
  }

  return {
    ...state,
    currentStep: newStep,
    completedSteps: progress.completedSteps,
  };
}

// ============================================================================
// EXPORTED TYPES
// ============================================================================

export interface TurnResult {
  newState: GameState;

  // Parse results
  understood: boolean;
  grammar: { score: number; issues: GrammarIssue[] };
  targetModel: string;
  valid: boolean;
  invalidReason?: string;
  mutations: Mutation[];

  // Narrate results
  message: string;
  npcResponse?: NarrateResponse['npcResponse'];

  // Progression
  pointsAwarded: number;
  leveledUp: boolean;
  stepsCompleted: TutorialStep[];
  questsStarted: Quest[];
  questsCompleted: Quest[];
  badgesEarned: string[];
  buildingChanged: boolean;
  newBuilding?: string;
}

// ============================================================================
// MAIN TURN PROCESSING
// ============================================================================

/**
 * Process a single game turn using two-pass AI:
 *   Pass 1 (Parse): Spanish input → grammar + validated mutations
 *   Apply mutations → new state
 *   Pass 2 (Narrate): Mutations + state → message + NPC dialogue + goals
 *   Apply narrative effects → final state
 */
export async function processTurn(
  input: string,
  state: GameState,
  languageConfig: LanguageConfig,
): Promise<TurnResult> {
  activeLanguage = languageConfig;

  // --- Pass 1: Parse input into mutations ---
  const parseResult = await parseIntent(input, state);

  // If not understood or invalid, return early (no Pass 2)
  if (!parseResult.valid) {
    return {
      newState: state,
      understood: parseResult.understood,
      grammar: parseResult.grammar,
      targetModel: parseResult.targetModel,
      valid: false,
      invalidReason: parseResult.invalidReason,
      mutations: [],
      message: parseResult.invalidReason || "I didn't understand that.",
      pointsAwarded: 0,
      leveledUp: false,
      stepsCompleted: [],
      questsStarted: [],
      questsCompleted: [],
      badgesEarned: [],
      buildingChanged: false,
    };
  }

  // --- Validate and apply mutations ---
  const validatedMutations = validateMutations(parseResult.mutations || [], state);
  let newState = applyMutations(state, validatedMutations);

  // Detect building change
  const oldBuilding = getBuildingForLocation(state.currentLocation);
  const currentBuilding = getBuildingForLocation(newState.currentLocation);
  const buildingChanged = currentBuilding !== oldBuilding;

  if (buildingChanged) {
    newState = saveLocationProgress(newState, oldBuilding);
    newState = handleBuildingTransition(newState, currentBuilding);
  }

  // Advance time
  newState = advanceTime(newState, 5);

  // Award points
  let pointsAwarded = 0;
  let leveledUp = false;
  if (validatedMutations.length > 0) {
    const basePoints = validatedMutations.length * 5;
    const compoundBonus = validatedMutations.length > 1 ? 2 : 1;
    const result = awardPoints(newState, basePoints * compoundBonus, parseResult.grammar?.score ?? 100);
    newState = result.state;
    pointsAwarded = result.pointsAwarded;
    leveledUp = result.leveledUp;
  }

  // Track vocabulary
  if (parseResult.understood && parseResult.grammar.score >= 80) {
    const wordsUsed = extractWordsFromText(input, newState.vocabulary);
    for (const wordId of wordsUsed) {
      newState = { ...newState, vocabulary: recordWordUse(newState.vocabulary, wordId, true) };
    }
  }

  // --- Check quest triggers (only autoStart quests — others are AI-driven) ---
  const questsStarted: Quest[] = [];
  const finalBuilding = getBuildingForLocation(newState.currentLocation);
  const moduleQuests = getAllQuestsForModule(finalBuilding);
  for (const quest of moduleQuests) {
    if (
      quest.autoStart &&
      !newState.activeQuests.includes(quest.id) &&
      !newState.completedQuests.includes(quest.id) &&
      !newState.abandonedQuests.includes(quest.id) &&
      (!quest.prereqs || quest.prereqs.every(p => newState.completedQuests.includes(p))) &&
      quest.triggerCondition(newState)
    ) {
      newState = { ...newState, activeQuests: [...newState.activeQuests, quest.id] };
      questsStarted.push(quest);
    }
  }

  // --- Pass 2: Narrate what happened ---
  const narrateResult = await narrateTurn(parseResult, newState, input);

  // Validate step IDs from narration
  if (narrateResult.stepsCompleted) {
    const knownStepIds = getAllKnownStepIds();
    narrateResult.stepsCompleted = narrateResult.stepsCompleted.filter(id => {
      if (!knownStepIds.has(id)) {
        console.warn(`[validate] Narrate returned unknown step ID: ${id}`);
        return false;
      }
      return true;
    });
    if (narrateResult.stepsCompleted.length === 0) {
      narrateResult.stepsCompleted = undefined;
    }
  }

  // Apply narrative step completions
  if (narrateResult.stepsCompleted?.length) {
    newState = {
      ...newState,
      completedSteps: [...newState.completedSteps, ...narrateResult.stepsCompleted],
    };
  }

  // Apply NPC response state
  if (narrateResult.npcResponse) {
    const npcId = narrateResult.npcResponse.npcId;
    const currentNpcState = newState.npcStates[npcId] || { mood: 'neutral', location: state.currentLocation };
    newState = {
      ...newState,
      npcStates: {
        ...newState.npcStates,
        [npcId]: {
          ...currentNpcState,
          lastResponse: narrateResult.npcResponse.target,
          wantsItem: narrateResult.npcResponse.wantsItem || currentNpcState.wantsItem,
        },
      },
    };
  }

  // Log NPC chat history
  if (narrateResult.npcResponse) {
    const npcId = narrateResult.npcResponse.npcId;
    const entry: NPCChatEntry = {
      playerInput: input,
      npcResponse: narrateResult.npcResponse.target,
      npcAction: narrateResult.npcResponse.actionText,
    };
    const existing = newState.npcChatHistory[npcId] || [];
    newState = {
      ...newState,
      npcChatHistory: {
        ...newState.npcChatHistory,
        [npcId]: [...existing, entry],
      },
    };
  }

  // Apply NPC-initiated mutations
  if (narrateResult.mutations?.length) {
    newState = applyMutations(newState, narrateResult.mutations);
  }

  // --- Check tutorial steps (engine-driven) ---
  const stepsCompleted: TutorialStep[] = [];

  // Steps the AI flagged
  if (narrateResult.stepsCompleted) {
    for (const stepId of narrateResult.stepsCompleted) {
      const step = getStepById(stepId);
      if (step) stepsCompleted.push(step);
    }
  }

  // Also check all building steps via checkComplete functions
  const allBuildingSteps = getAllStepsForBuilding(finalBuilding);
  for (const step of allBuildingSteps) {
    if (!newState.completedSteps.includes(step.id) && step.checkComplete(newState)) {
      if (!stepsCompleted.some(g => g.id === step.id)) {
        stepsCompleted.push(step);
      }
      newState = { ...newState, completedSteps: [...newState.completedSteps, step.id] };
    }
  }

  // --- Process quest completions from AI ---
  const questsCompleted: Quest[] = [];
  const badgesEarned: string[] = [];
  if (narrateResult.questsCompleted?.length) {
    for (const questId of narrateResult.questsCompleted) {
      if (!newState.activeQuests.includes(questId)) {
        console.warn(`[validate] Narrate returned non-active quest ID: ${questId}`);
        continue;
      }
      const quest = getQuestById(questId);
      if (!quest) {
        console.warn(`[validate] Narrate returned unknown quest ID: ${questId}`);
        continue;
      }
      // Move from active to completed
      newState = {
        ...newState,
        activeQuests: newState.activeQuests.filter(id => id !== questId),
        completedQuests: [...newState.completedQuests, questId],
      };
      // Apply reward
      const rewardResult = applyQuestReward(newState, quest);
      newState = rewardResult.state;
      pointsAwarded += rewardResult.pointsAwarded;
      if (rewardResult.leveledUp) leveledUp = true;
      if (quest.reward.badge) badgesEarned.push(quest.reward.badge.name);
      questsCompleted.push(quest);
    }
  }

  // Enrich NPC chat history with quest completions and mood changes
  if (narrateResult.npcResponse && questsCompleted.length > 0) {
    const npcId = narrateResult.npcResponse.npcId;
    const history = newState.npcChatHistory[npcId];
    if (history?.length) {
      const lastEntry = history[history.length - 1];
      const relevantQuest = questsCompleted.find(q => q.sourceId === npcId);
      const newMood = newState.npcStates[npcId]?.mood;
      const oldMood = state.npcStates[npcId]?.mood;
      const updated = {
        ...lastEntry,
        ...(relevantQuest ? { questCompleted: relevantQuest.title.native } : {}),
        ...(newMood && newMood !== oldMood ? { moodAfter: newMood } : {}),
      };
      newState = {
        ...newState,
        npcChatHistory: {
          ...newState.npcChatHistory,
          [npcId]: [...history.slice(0, -1), updated],
        },
      };
    }
  }

  // Re-check autoStart quest triggers after completions
  for (const quest of moduleQuests) {
    if (
      quest.autoStart &&
      !newState.activeQuests.includes(quest.id) &&
      !newState.completedQuests.includes(quest.id) &&
      !newState.abandonedQuests.includes(quest.id) &&
      (!quest.prereqs || quest.prereqs.every(p => newState.completedQuests.includes(p))) &&
      quest.triggerCondition(newState)
    ) {
      newState = { ...newState, activeQuests: [...newState.activeQuests, quest.id] };
      questsStarted.push(quest);
    }
  }

  // Process AI-started quests (NPC offered a quest during dialog)
  if (narrateResult.questsStarted?.length) {
    for (const questId of narrateResult.questsStarted) {
      if (newState.activeQuests.includes(questId) || newState.completedQuests.includes(questId)) continue;
      const quest = getQuestById(questId);
      if (!quest) {
        console.warn(`[validate] Narrate returned unknown quest ID for start: ${questId}`);
        continue;
      }
      newState = { ...newState, activeQuests: [...newState.activeQuests, questId] };
      questsStarted.push(quest);
    }
  }

  // Re-check tutorial steps (quest completion may satisfy step checkComplete)
  for (const step of allBuildingSteps) {
    if (!newState.completedSteps.includes(step.id) && step.checkComplete(newState)) {
      if (!stepsCompleted.some(g => g.id === step.id)) {
        stepsCompleted.push(step);
      }
      newState = { ...newState, completedSteps: [...newState.completedSteps, step.id] };
    }
  }

  // Update suggested step (first uncompleted in chain)
  let suggestedStep = getStartStepForBuilding(finalBuilding);
  while (suggestedStep && newState.completedSteps.includes(suggestedStep.id)) {
    suggestedStep = suggestedStep.nextStepId
      ? getStepById(suggestedStep.nextStepId) || null
      : null;
  }
  newState = { ...newState, currentStep: suggestedStep };

  return {
    newState,
    understood: parseResult.understood,
    grammar: parseResult.grammar,
    targetModel: parseResult.targetModel,
    valid: true,
    mutations: validatedMutations,
    message: narrateResult.message,
    npcResponse: narrateResult.npcResponse,
    pointsAwarded,
    leveledUp,
    stepsCompleted,
    questsStarted,
    questsCompleted,
    badgesEarned,
    buildingChanged,
    newBuilding: buildingChanged ? currentBuilding : undefined,
  };
}

