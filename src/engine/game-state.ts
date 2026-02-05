import type {
  GameState,
  Location,
  GameObject,
  Needs,
  Goal,
  Item,
  ObjectState,
  VocabularyProgress,
  LocationProgress,
} from './types.js';
import { createInitialVocabulary } from './vocabulary.js';

// Building names for location grouping
export type BuildingName = 'home' | 'street' | 'restaurant' | 'market' | 'gym' | 'park' | 'clinic' | 'bank';

// Map location IDs to their building
export function getBuildingForLocation(locationId: string): BuildingName {
  if (['bedroom', 'bathroom', 'kitchen', 'living_room'].includes(locationId)) return 'home';
  if (locationId === 'street') return 'street';
  if (locationId.startsWith('restaurant')) return 'restaurant';
  if (locationId.startsWith('market') || ['fruit_stand', 'vegetable_stand', 'meat_counter'].includes(locationId)) return 'market';
  if (locationId.startsWith('gym') || ['stretching_area', 'training_floor', 'weight_room', 'cardio_zone', 'locker_room'].includes(locationId)) return 'gym';
  if (locationId.startsWith('park') || ['main_path', 'fountain_area', 'garden', 'playground', 'kiosk'].includes(locationId)) return 'park';
  if (locationId.startsWith('clinic') || ['waiting_room', 'exam_room', 'pharmacy'].includes(locationId)) return 'clinic';
  if (locationId.startsWith('bank')) return 'bank';
  return 'home'; // Default fallback
}

// Level thresholds
export function getPointsForLevel(level: number): number {
  return level * 150;  // Level 1 = 150, Level 2 = 300, etc.
}

// Building unlock levels
export const BUILDING_UNLOCK_LEVELS: Record<BuildingName, number> = {
  home: 1,
  street: 1,
  restaurant: 2,
  market: 3,
  park: 3,
  gym: 5,
  clinic: 5,
  bank: 7,
};

// Point values for actions
export const ACTION_POINTS: Record<string, number> = {
  go: 5,
  talk: 10,
  greet: 10,
  open: 10,
  close: 10,
  use: 10,
  take: 15,
  give: 15,
  eat: 15,
  drink: 15,
  cook: 25,
  position: 5,
  turn_on: 10,
  turn_off: 10,
  pet: 10,
  feed: 15,
};

export function createInitialState(
  startLocation: Location,
  startGoal: Goal | null,
  existingVocabulary?: VocabularyProgress
): GameState {
  const building = getBuildingForLocation(startLocation.id);

  return {
    location: startLocation,
    playerPosition: 'in_bed',
    needs: {
      energy: 80,
      hunger: 60,
      hygiene: 70,
      bladder: 50,  // Morning urgency
    },
    inventory: [],
    time: { hour: 7, minute: 0 },
    currentGoal: startGoal,
    completedGoals: [],
    learnedWords: [],
    vocabulary: existingVocabulary || createInitialVocabulary(),
    failedCurrentGoal: false,
    petLocations: {
      cat: 'living_room',
      dog: 'living_room',
    },
    npcState: {
      roommate: { mood: 'sleepy' },
    },
    objectStates: {},

    // Progression system
    points: 0,
    level: 1,
    totalPointsEarned: 0,
    locationProgress: {
      [building]: {
        currentGoalId: startGoal?.id || null,
        completedGoals: [],
        difficulty: 1,
        chainComplete: false,
      },
    },

    // Learn command tracking
    learnCommandsUsedToday: 0,
    lastLearnCommandDay: 0,  // Will be set on first use

    // Audio
    audioEnabled: true,
  };
}

// Get effective object state by merging base definition with tracked changes
export function getObjectState(state: GameState, obj: GameObject): ObjectState {
  return { ...obj.state, ...state.objectStates[obj.id] };
}

export function findObject(
  state: GameState,
  objectId: string
): GameObject | undefined {
  return state.location.objects.find((obj) => obj.id === objectId);
}

export function findObjectBySpanishName(
  state: GameState,
  spanishName: string
): GameObject | undefined {
  const normalized = spanishName.toLowerCase().trim();
  return state.location.objects.find((obj) => {
    const objName = obj.name.spanish.toLowerCase();
    return objName === normalized || objName.includes(normalized) || normalized.includes(objName);
  });
}

export function updateObjectState(
  state: GameState,
  objectId: string,
  changes: Partial<ObjectState>
): GameState {
  return {
    ...state,
    location: {
      ...state.location,
      objects: state.location.objects.map((obj) =>
        obj.id === objectId
          ? { ...obj, state: { ...obj.state, ...changes } }
          : obj
      ),
    },
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

export function addToInventory(state: GameState, item: Item): GameState {
  return {
    ...state,
    inventory: [...state.inventory, item],
  };
}

export function removeFromInventory(state: GameState, itemId: string): GameState {
  return {
    ...state,
    inventory: state.inventory.filter((item) => item.id !== itemId),
  };
}

export function changeLocation(state: GameState, newLocation: Location): GameState {
  return {
    ...state,
    location: newLocation,
    playerPosition: 'standing',
  };
}

export function advanceTime(state: GameState, minutes: number): GameState {
  let newMinute = state.time.minute + minutes;
  let newHour = state.time.hour;

  while (newMinute >= 60) {
    newMinute -= 60;
    newHour = (newHour + 1) % 24;
  }

  return {
    ...state,
    time: { hour: newHour, minute: newMinute },
  };
}

export function completeGoal(state: GameState, nextGoal: Goal | null): GameState {
  if (!state.currentGoal) return state;

  return {
    ...state,
    completedGoals: [...state.completedGoals, state.currentGoal.id],
    currentGoal: nextGoal,
  };
}

export function learnWord(state: GameState, word: string): GameState {
  if (state.learnedWords.includes(word)) return state;
  return {
    ...state,
    learnedWords: [...state.learnedWords, word],
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function formatTime(time: { hour: number; minute: number }): string {
  const h = time.hour.toString().padStart(2, '0');
  const m = time.minute.toString().padStart(2, '0');
  const period = time.hour < 12 ? 'AM' : 'PM';
  const displayHour = time.hour % 12 || 12;
  return `${displayHour}:${m} ${period}`;
}

// ============================================================================
// PROGRESSION SYSTEM HELPERS
// ============================================================================

// Grammar multiplier - disabled per user request
export function getGrammarMultiplier(_grammarScore: number): number {
  return 1.0;  // No grammar bonus
}

// Award points and check for level up
export function awardPoints(state: GameState, basePoints: number, grammarScore: number = 100): { state: GameState; pointsAwarded: number; leveledUp: boolean } {
  const multiplier = getGrammarMultiplier(grammarScore);
  const pointsAwarded = Math.round(basePoints * multiplier);

  const newPoints = state.points + pointsAwarded;
  const newTotal = state.totalPointsEarned + pointsAwarded;

  let newLevel = state.level;
  let leveledUp = false;

  // Check for level up
  while (newPoints >= getPointsForLevel(newLevel)) {
    newLevel++;
    leveledUp = true;
  }

  return {
    state: {
      ...state,
      points: newPoints,
      totalPointsEarned: newTotal,
      level: newLevel,
    },
    pointsAwarded,
    leveledUp,
  };
}

// Award goal completion bonus
export function awardGoalBonus(state: GameState, isChainComplete: boolean, isFirstTime: boolean): { state: GameState; pointsAwarded: number; leveledUp: boolean } {
  let basePoints = 100; // Regular goal bonus

  if (isChainComplete) {
    basePoints = 500; // Chain complete bonus
  }

  if (isFirstTime) {
    basePoints = Math.round(basePoints * 1.5); // First time bonus
  }

  return awardPoints(state, basePoints, 100); // No grammar multiplier for goal bonuses
}

// Check if a building is unlocked for the player
export function isBuildingUnlocked(state: GameState, building: BuildingName): boolean {
  return state.level >= BUILDING_UNLOCK_LEVELS[building];
}

// Save current building's goal progress
export function saveLocationProgress(state: GameState, building: BuildingName): GameState {
  const progress: LocationProgress = {
    currentGoalId: state.currentGoal?.id || null,
    completedGoals: [...state.completedGoals],
    difficulty: state.locationProgress[building]?.difficulty || 1,
    chainComplete: state.locationProgress[building]?.chainComplete || false,
  };

  return {
    ...state,
    locationProgress: {
      ...state.locationProgress,
      [building]: progress,
    },
  };
}

// Load a building's goal progress (returns new goal ID and completedGoals)
export function loadLocationProgress(state: GameState, building: BuildingName): { goalId: string | null; completedGoals: string[]; difficulty: number } {
  const progress = state.locationProgress[building];

  if (progress) {
    return {
      goalId: progress.currentGoalId,
      completedGoals: progress.completedGoals,
      difficulty: progress.difficulty,
    };
  }

  // No progress yet - return defaults
  return {
    goalId: null,
    completedGoals: [],
    difficulty: 1,
  };
}

// Mark a building's goal chain as complete and increment difficulty for next visit
export function markChainComplete(state: GameState, building: BuildingName): GameState {
  const currentProgress = state.locationProgress[building] || {
    currentGoalId: null,
    completedGoals: [],
    difficulty: 1,
    chainComplete: false,
  };

  return {
    ...state,
    locationProgress: {
      ...state.locationProgress,
      [building]: {
        ...currentProgress,
        chainComplete: true,
        difficulty: currentProgress.difficulty + 1, // Harder next time
      },
    },
  };
}
