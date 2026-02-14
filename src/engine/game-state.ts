import type {
  GameState,
  Location,
  TutorialStep,
  Quest,
  QuestReward,
  Needs,
  WorldObject,
  Mutation,
  VocabularyProgress,
  LocationProgress,
  NPCRuntimeState,
  NPC,
} from './types.js';
import { createInitialVocabulary } from './vocabulary.js';
import { type BuildingName, getBuildingForLocation, BUILDING_UNLOCK_LEVELS } from '../data/module-registry.js';
export { type BuildingName, getBuildingForLocation, BUILDING_UNLOCK_LEVELS };

// Level thresholds
export function getPointsForLevel(level: number): number {
  return level * 150;
}

// ============================================================================
// GENERIC MUTATION APPLIER
// ============================================================================

export function applyMutation(state: GameState, mutation: Mutation): GameState {
  switch (mutation.type) {
    case 'go': {
      const visited = state.visitedLocations.includes(mutation.locationId)
        ? state.visitedLocations
        : [...state.visitedLocations, mutation.locationId];
      return { ...state, currentLocation: mutation.locationId, visitedLocations: visited };
    }

    case 'move':
      return {
        ...state,
        objects: state.objects.map(o =>
          o.id === mutation.objectId ? { ...o, location: mutation.to } : o
        ),
      };

    case 'tag':
      return {
        ...state,
        objects: state.objects.map(o => {
          if (o.id !== mutation.objectId) return o;
          let tags = [...o.tags];
          if (mutation.remove) tags = tags.filter(t => !mutation.remove!.includes(t));
          if (mutation.add) tags = [...tags, ...mutation.add.filter(t => !tags.includes(t))];
          return { ...o, tags };
        }),
      };

    case 'playerTag': {
      let tags = [...state.playerTags];
      if (mutation.remove) tags = tags.filter(t => !mutation.remove!.includes(t));
      if (mutation.add) tags = [...tags, ...mutation.add.filter(t => !tags.includes(t))];
      return { ...state, playerTags: tags };
    }

    case 'needs':
      return updateNeeds(state, mutation.changes);

    case 'create':
      return { ...state, objects: [...state.objects, mutation.object] };

    case 'remove':
      return {
        ...state,
        objects: state.objects.map(o =>
          o.id === mutation.objectId ? { ...o, location: 'removed' } : o
        ),
      };

    case 'npcMood':
      return {
        ...state,
        npcStates: {
          ...state.npcStates,
          [mutation.npcId]: { ...state.npcStates[mutation.npcId], mood: mutation.mood },
        },
      };
  }
}

export function applyMutations(state: GameState, mutations: Mutation[]): GameState {
  return mutations.reduce((s, m) => applyMutation(s, m), state);
}

// ============================================================================
// STATE HELPERS
// ============================================================================

export function createInitialState(
  startLocationId: string,
  startStep: TutorialStep | null,
  objects: WorldObject[],
  npcs: NPC[],
  existingVocabulary?: VocabularyProgress
): GameState {
  const building = getBuildingForLocation(startLocationId);

  // Build NPC runtime states from definitions
  const npcStates: Record<string, NPCRuntimeState> = {};
  for (const npc of npcs) {
    npcStates[npc.id] = {
      mood: npc.isPet ? 'calm' : 'sleepy',
      location: npc.location,
    };
  }

  return {
    currentLocation: startLocationId,
    visitedLocations: [startLocationId],
    playerTags: ['in_bed'],
    needs: {
      energy: 80,
      hunger: 60,
      hygiene: 70,
      bladder: 50,
    },
    objects: objects.map(o => ({ ...o })),  // deep copy
    npcStates,
    npcChatHistory: {},
    time: { hour: 7, minute: 0 },
    currentStep: startStep,
    completedSteps: [],
    activeQuests: [],
    completedQuests: [],
    abandonedQuests: [],
    badges: [],
    learnedWords: [],
    vocabulary: existingVocabulary || createInitialVocabulary(),
    points: 0,
    level: 1,
    totalPointsEarned: 0,
    locationProgress: {
      [building]: {
        currentStepId: startStep?.id || null,
        completedSteps: [],
        difficulty: 1,
        chainComplete: false,
      },
    },
    audioEnabled: true,
  };
}

export function updateNeeds(state: GameState, changes: Partial<Needs>): GameState {
  return {
    ...state,
    needs: {
      energy: clamp(state.needs.energy + (changes.energy || 0), 0, 100),
      hunger: clamp(state.needs.hunger + (changes.hunger || 0), 0, 100),
      hygiene: clamp(state.needs.hygiene + (changes.hygiene || 0), 0, 100),
      bladder: clamp(state.needs.bladder + (changes.bladder || 0), 0, 100),
    },
  };
}

export function advanceTime(state: GameState, minutes: number): GameState {
  let newMinute = state.time.minute + minutes;
  let newHour = state.time.hour;
  while (newMinute >= 60) {
    newMinute -= 60;
    newHour = (newHour + 1) % 24;
  }
  return { ...state, time: { hour: newHour, minute: newMinute } };
}

export function completeStep(state: GameState, nextStep: TutorialStep | null): GameState {
  if (!state.currentStep) return state;
  return {
    ...state,
    completedSteps: [...state.completedSteps, state.currentStep.id],
    currentStep: nextStep,
  };
}

export function formatTime(time: { hour: number; minute: number }): string {
  const m = time.minute.toString().padStart(2, '0');
  const period = time.hour < 12 ? 'AM' : 'PM';
  const displayHour = time.hour % 12 || 12;
  return `${displayHour}:${m} ${period}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ============================================================================
// PROGRESSION SYSTEM
// ============================================================================

export function getGrammarMultiplier(_grammarScore: number): number {
  return 1.0;
}

export function awardPoints(state: GameState, basePoints: number, grammarScore: number = 100): { state: GameState; pointsAwarded: number; leveledUp: boolean } {
  const multiplier = getGrammarMultiplier(grammarScore);
  const pointsAwarded = Math.round(basePoints * multiplier);
  const newPoints = state.points + pointsAwarded;
  const newTotal = state.totalPointsEarned + pointsAwarded;
  let newLevel = state.level;
  let leveledUp = false;
  while (newPoints >= getPointsForLevel(newLevel)) {
    newLevel++;
    leveledUp = true;
  }
  return {
    state: { ...state, points: newPoints, totalPointsEarned: newTotal, level: newLevel },
    pointsAwarded,
    leveledUp,
  };
}

export function awardStepBonus(state: GameState, isChainComplete: boolean, isFirstTime: boolean): { state: GameState; pointsAwarded: number; leveledUp: boolean } {
  let basePoints = isChainComplete ? 500 : 100;
  if (isFirstTime) basePoints = Math.round(basePoints * 1.5);
  return awardPoints(state, basePoints, 100);
}

export function applyQuestReward(state: GameState, quest: Quest): { state: GameState; pointsAwarded: number; leveledUp: boolean } {
  let newState = state;
  let pointsAwarded = 0;
  let leveledUp = false;

  if (quest.reward.points) {
    const result = awardPoints(newState, quest.reward.points);
    newState = result.state;
    pointsAwarded = result.pointsAwarded;
    leveledUp = result.leveledUp;
  }

  if (quest.reward.badge) {
    newState = { ...newState, badges: [...newState.badges, quest.reward.badge.id] };
  }

  if (quest.reward.npcMood) {
    const { npcId, mood } = quest.reward.npcMood;
    newState = {
      ...newState,
      npcStates: {
        ...newState.npcStates,
        [npcId]: { ...newState.npcStates[npcId], mood },
      },
    };
  }

  return { state: newState, pointsAwarded, leveledUp };
}

export function isBuildingUnlocked(state: GameState, building: BuildingName): boolean {
  return state.level >= BUILDING_UNLOCK_LEVELS[building];
}

export function saveLocationProgress(state: GameState, building: BuildingName): GameState {
  const progress: LocationProgress = {
    currentStepId: state.currentStep?.id || null,
    completedSteps: [...state.completedSteps],
    difficulty: state.locationProgress[building]?.difficulty || 1,
    chainComplete: state.locationProgress[building]?.chainComplete || false,
  };
  return {
    ...state,
    locationProgress: { ...state.locationProgress, [building]: progress },
  };
}

export function loadLocationProgress(state: GameState, building: BuildingName): { stepId: string | null; completedSteps: string[]; difficulty: number } {
  const progress = state.locationProgress[building];
  if (progress) {
    return { stepId: progress.currentStepId, completedSteps: progress.completedSteps, difficulty: progress.difficulty };
  }
  return { stepId: null, completedSteps: [], difficulty: 1 };
}

export function markChainComplete(state: GameState, building: BuildingName): GameState {
  const currentProgress = state.locationProgress[building] || {
    currentStepId: null,
    completedSteps: [],
    difficulty: 1,
    chainComplete: false,
  };
  return {
    ...state,
    locationProgress: {
      ...state.locationProgress,
      [building]: { ...currentProgress, chainComplete: true, difficulty: currentProgress.difficulty + 1 },
    },
  };
}
