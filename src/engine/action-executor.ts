import type { GameState, Intent, ActionResult, ActionType } from './types.js';
import {
  findObject,
  updateObjectState,
  updateNeeds,
  addToInventory,
  removeFromInventory,
  changeLocation,
  advanceTime,
} from './game-state.js';
import { locations } from '../data/home-basics.js';
import { evaluateAction, type ActionEffects } from '../ai/effects.js';

export async function executeIntent(intent: Intent, state: GameState): Promise<ActionResult> {
  if (!intent.action) {
    return {
      success: false,
      message: "I couldn't understand what action you wanted to take.",
    };
  }

  // Try hardcoded handlers first
  const hardcodedResult = executeHardcodedAction(intent, state);
  if (hardcodedResult !== null) {
    return hardcodedResult;
  }

  // Fallback to AI for unknown/creative actions
  return executeWithAI(intent, state);
}

function executeHardcodedAction(intent: Intent, state: GameState): ActionResult | null {
  switch (intent.action) {
    case 'WAKE_UP':
      return executeWakeUp(state);
    case 'GO':
      return executeGo(intent.destination, state);
    case 'OPEN':
      return executeOpen(intent.target, state);
    case 'CLOSE':
      return executeClose(intent.target, state);
    case 'TURN_ON':
      return executeTurnOn(intent.target, state);
    case 'TURN_OFF':
      return executeTurnOff(intent.target, state);
    case 'TAKE':
      return executeTake(intent.target, state);
    case 'EAT':
      return executeEat(intent.target, state);
    case 'DRINK':
      return executeDrink(intent.target, state);
    case 'COOK':
      return executeCook(intent.target, state);
    case 'SHOWER':
      return executeShower(state);
    case 'BRUSH_TEETH':
      return executeBrushTeeth(state);
    case 'USE':
      return executeUse(intent.target, state);
    default:
      // Return null to indicate AI fallback needed
      return null;
  }
}

async function executeWithAI(intent: Intent, state: GameState): Promise<ActionResult> {
  const effects = await evaluateAction(intent, state);

  if (!effects.valid) {
    return {
      success: false,
      message: effects.message,
    };
  }

  return {
    success: true,
    message: effects.message,
    needsChanges: effects.needsChanges,
    objectChanges: effects.objectChanges,
    stateChanges: buildStateChanges(effects, state),
  };
}

function buildStateChanges(effects: ActionEffects, state: GameState): Partial<GameState> | undefined {
  const changes: Partial<GameState> = {};
  let hasChanges = false;

  // Handle inventory additions
  if (effects.inventoryAdd && effects.inventoryAdd.length > 0) {
    const newItems = effects.inventoryAdd
      .map(id => {
        const obj = state.location.objects.find(o => o.id === id);
        return obj ? { id: obj.id, name: obj.name } : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (newItems.length > 0) {
      changes.inventory = [...state.inventory, ...newItems];
      hasChanges = true;
    }
  }

  // Handle inventory removals
  if (effects.inventoryRemove && effects.inventoryRemove.length > 0) {
    changes.inventory = (changes.inventory || state.inventory)
      .filter(item => !effects.inventoryRemove!.includes(item.id));
    hasChanges = true;
  }

  // Handle location change
  if (effects.moveToLocation && locations[effects.moveToLocation]) {
    changes.location = locations[effects.moveToLocation];
    hasChanges = true;
  }

  return hasChanges ? changes : undefined;
}

function executeWakeUp(state: GameState): ActionResult {
  if (state.playerPosition === 'standing') {
    return {
      success: false,
      message: "You're already up!",
    };
  }

  return {
    success: true,
    message: 'You get out of bed and stretch.',
    stateChanges: { playerPosition: 'standing' },
  };
}

function executeGo(destination: string | null, state: GameState): ActionResult {
  if (!destination) {
    return {
      success: false,
      message: "Where do you want to go? Try 'Voy al baño' or 'Voy a la cocina'.",
    };
  }

  if (state.playerPosition === 'in_bed') {
    return {
      success: false,
      message: "You need to get out of bed first! Try 'Me levanto'.",
    };
  }

  // Check if destination is a valid exit
  const exit = state.location.exits.find(
    (e) => e.to === destination || e.name.spanish.toLowerCase().includes(destination.toLowerCase())
  );

  if (!exit) {
    const availableExits = state.location.exits
      .map((e) => e.name.spanish)
      .join(', ');
    return {
      success: false,
      message: `You can't go there from here. Available exits: ${availableExits}`,
    };
  }

  const newLocation = locations[exit.to];
  if (!newLocation) {
    return {
      success: false,
      message: "That location doesn't exist.",
    };
  }

  return {
    success: true,
    message: `You walk to ${newLocation.name.english}.`,
    stateChanges: { location: newLocation },
  };
}

function executeOpen(target: string | null, state: GameState): ActionResult {
  if (!target) {
    return { success: false, message: "What do you want to open?" };
  }

  const obj = findObject(state, target);
  if (!obj) {
    return { success: false, message: `You don't see a ${target} here.` };
  }

  if (obj.state.open === undefined) {
    return { success: false, message: `You can't open the ${obj.name.english}.` };
  }

  if (obj.state.open) {
    return { success: false, message: `The ${obj.name.english} is already open.` };
  }

  return {
    success: true,
    message: `You open the ${obj.name.english}.`,
    objectChanges: [{ objectId: target, changes: { open: true } }],
  };
}

function executeClose(target: string | null, state: GameState): ActionResult {
  if (!target) {
    return { success: false, message: "What do you want to close?" };
  }

  const obj = findObject(state, target);
  if (!obj) {
    return { success: false, message: `You don't see a ${target} here.` };
  }

  if (obj.state.open === undefined) {
    return { success: false, message: `You can't close the ${obj.name.english}.` };
  }

  if (!obj.state.open) {
    return { success: false, message: `The ${obj.name.english} is already closed.` };
  }

  return {
    success: true,
    message: `You close the ${obj.name.english}.`,
    objectChanges: [{ objectId: target, changes: { open: false } }],
  };
}

function executeTurnOn(target: string | null, state: GameState): ActionResult {
  if (!target) {
    return { success: false, message: "What do you want to turn on?" };
  }

  const obj = findObject(state, target);
  if (!obj) {
    return { success: false, message: `You don't see a ${target} here.` };
  }

  if (obj.state.on === undefined) {
    return { success: false, message: `You can't turn on the ${obj.name.english}.` };
  }

  if (obj.state.on) {
    return { success: false, message: `The ${obj.name.english} is already on.` };
  }

  return {
    success: true,
    message: `You turn on the ${obj.name.english}.`,
    objectChanges: [{ objectId: target, changes: { on: true } }],
  };
}

function executeTurnOff(target: string | null, state: GameState): ActionResult {
  if (!target) {
    return { success: false, message: "What do you want to turn off?" };
  }

  const obj = findObject(state, target);
  if (!obj) {
    return { success: false, message: `You don't see a ${target} here.` };
  }

  // Special handling for alarm clock
  if (obj.id === 'alarm_clock') {
    return {
      success: true,
      message: 'You turn off the alarm. Silence at last!',
      objectChanges: [{ objectId: target, changes: { on: false, ringing: false } }],
    };
  }

  if (obj.state.on === undefined) {
    return { success: false, message: `You can't turn off the ${obj.name.english}.` };
  }

  if (!obj.state.on) {
    return { success: false, message: `The ${obj.name.english} is already off.` };
  }

  return {
    success: true,
    message: `You turn off the ${obj.name.english}.`,
    objectChanges: [{ objectId: target, changes: { on: false } }],
  };
}

function executeTake(target: string | null, state: GameState): ActionResult {
  if (!target) {
    return { success: false, message: "What do you want to take?" };
  }

  const obj = findObject(state, target);
  if (!obj) {
    return { success: false, message: `You don't see a ${target} here.` };
  }

  if (!obj.takeable) {
    return { success: false, message: `You can't take the ${obj.name.english}.` };
  }

  // Check if item is in fridge and fridge is closed
  if (obj.state.inFridge) {
    const fridge = findObject(state, 'refrigerator');
    if (fridge && !fridge.state.open) {
      return {
        success: false,
        message: `The ${obj.name.english} is in the refrigerator. Open it first!`,
      };
    }
  }

  return {
    success: true,
    message: `You take the ${obj.name.english}.`,
    stateChanges: {
      inventory: [...state.inventory, { id: obj.id, name: obj.name }],
    },
  };
}

function executeEat(target: string | null, state: GameState): ActionResult {
  if (!target) {
    return { success: false, message: "What do you want to eat?" };
  }

  const obj = findObject(state, target);
  const inInventory = state.inventory.find((i) => i.id === target);

  if (!obj && !inInventory) {
    return { success: false, message: `You don't have any ${target} to eat.` };
  }

  const item = obj || inInventory;
  if (!item) {
    return { success: false, message: "You don't have that." };
  }

  // Check if it's the eggs - need to be cooked first
  if (target === 'eggs') {
    return {
      success: false,
      message: "You should cook the eggs first! Try 'Cocino los huevos'.",
    };
  }

  const needsEffect = obj?.needsEffect || { hunger: 20 };

  return {
    success: true,
    message: `You eat the ${item.name.english}. Delicious!`,
    needsChanges: needsEffect,
    stateChanges: {
      completedGoals: [...state.completedGoals, 'ate_food'],
    },
  };
}

function executeDrink(target: string | null, state: GameState): ActionResult {
  if (!target) {
    return { success: false, message: "What do you want to drink?" };
  }

  const obj = findObject(state, target);
  if (!obj) {
    return { success: false, message: `You don't see any ${target} here.` };
  }

  if (!obj.consumable && target !== 'water' && target !== 'coffee') {
    return { success: false, message: `You can't drink the ${obj.name.english}.` };
  }

  const needsEffect = obj.needsEffect || { hunger: 5 };

  return {
    success: true,
    message: `You drink the ${obj.name.english}. Refreshing!`,
    needsChanges: needsEffect,
  };
}

function executeCook(target: string | null, state: GameState): ActionResult {
  if (!target) {
    return { success: false, message: "What do you want to cook?" };
  }

  // Check if stove is on
  const stove = findObject(state, 'stove');
  if (!stove?.state.on) {
    return {
      success: false,
      message: "The stove is off. Turn it on first with 'Enciendo la estufa'.",
    };
  }

  if (target === 'eggs') {
    return {
      success: true,
      message: 'You cook the eggs in the pan. They smell delicious!',
      stateChanges: {
        completedGoals: [...state.completedGoals, 'cooked_eggs'],
      },
    };
  }

  return {
    success: false,
    message: `You're not sure how to cook ${target}.`,
  };
}

function executeShower(state: GameState): ActionResult {
  if (state.location.id !== 'bathroom') {
    return {
      success: false,
      message: "You need to be in the bathroom to shower.",
    };
  }

  return {
    success: true,
    message: 'You take a refreshing shower. Clean and fresh!',
    needsChanges: { hygiene: 50 },
    stateChanges: {
      completedGoals: [...state.completedGoals, 'shower_action'],
    },
  };
}

function executeBrushTeeth(state: GameState): ActionResult {
  if (state.location.id !== 'bathroom') {
    return {
      success: false,
      message: "You need to be in the bathroom to brush your teeth.",
    };
  }

  return {
    success: true,
    message: 'You brush your teeth thoroughly. Minty fresh!',
    needsChanges: { hygiene: 10 },
    stateChanges: {
      completedGoals: [...state.completedGoals, 'brush_teeth_action'],
    },
  };
}

function executeUse(target: string | null, state: GameState): ActionResult | null {
  if (!target) {
    return { success: false, message: "What do you want to use?" };
  }

  const obj = findObject(state, target);
  if (!obj) {
    return { success: false, message: `You don't see a ${target} here.` };
  }

  // Handle specific objects with known behaviors
  if (target === 'toothbrush') {
    return executeBrushTeeth(state);
  }
  if (target === 'shower') {
    return executeShower(state);
  }
  if (target === 'sink') {
    return {
      success: true,
      message: 'You wash your hands in the sink.',
      needsChanges: { hygiene: 5 },
    };
  }
  if (target === 'toilet') {
    return executeUseToilet(state);
  }

  // For unknown objects, return null to trigger AI fallback
  return null;
}

function executeUseToilet(state: GameState): ActionResult {
  if (state.location.id !== 'bathroom') {
    return {
      success: false,
      message: "You need to be in the bathroom.",
    };
  }

  return {
    success: true,
    message: 'You use the toilet. Much better!',
    needsChanges: { bladder: 100 },  // Fully restored
  };
}

export function applyActionResult(state: GameState, result: ActionResult): GameState {
  let newState = { ...state };

  if (result.stateChanges) {
    newState = { ...newState, ...result.stateChanges };
  }

  if (result.objectChanges) {
    for (const change of result.objectChanges) {
      newState = updateObjectState(newState, change.objectId, change.changes);
    }
  }

  if (result.needsChanges) {
    newState = updateNeeds(newState, result.needsChanges);
  }

  // Advance time for successful actions
  if (result.success) {
    newState = advanceTime(newState, 5);
  }

  return newState;
}
