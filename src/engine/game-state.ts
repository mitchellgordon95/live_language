import type {
  GameState,
  Location,
  GameObject,
  Needs,
  Goal,
  Item,
  ObjectState,
  VocabularyProgress,
} from './types.js';
import { createInitialVocabulary } from './vocabulary.js';

export function createInitialState(
  startLocation: Location,
  startGoal: Goal | null,
  existingVocabulary?: VocabularyProgress
): GameState {
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
