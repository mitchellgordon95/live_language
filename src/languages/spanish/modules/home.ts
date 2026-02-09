import type { Location, Goal, VocabWord, GameState, NPC, Pet, ModuleDefinition } from '../../../engine/types.js';
import { getObjectState } from '../../../engine/game-state.js';

// ============================================================================
// LOCATIONS
// ============================================================================

export const bedroom: Location = {
  id: 'bedroom',
  name: { target: 'el dormitorio', native: 'bedroom' },
  objects: [
    {
      id: 'bed',
      name: { target: 'la cama', native: 'bed' },
      state: {},
      actions: [],
    },
    {
      id: 'alarm_clock',
      name: { target: 'el despertador', native: 'alarm clock' },
      state: { ringing: true, on: true },
      actions: ['TURN_OFF'],
    },
    {
      id: 'window',
      name: { target: 'la ventana', native: 'window' },
      state: { open: false },
      actions: ['OPEN', 'CLOSE'],
    },
    {
      id: 'lamp',
      name: { target: 'la lámpara', native: 'lamp' },
      state: { on: false },
      actions: ['TURN_ON', 'TURN_OFF'],
    },
    {
      id: 'closet',
      name: { target: 'el armario', native: 'closet' },
      state: { open: false },
      actions: ['OPEN', 'CLOSE'],
    },
  ],
  exits: [
    { to: 'bathroom', name: { target: 'el baño', native: 'bathroom' } },
    { to: 'kitchen', name: { target: 'la cocina', native: 'kitchen' } },
    { to: 'living_room', name: { target: 'la sala', native: 'living room' } },
  ],
};

export const bathroom: Location = {
  id: 'bathroom',
  name: { target: 'el baño', native: 'bathroom' },
  objects: [
    {
      id: 'sink',
      name: { target: 'el lavabo', native: 'sink' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'mirror',
      name: { target: 'el espejo', native: 'mirror' },
      state: {},
      actions: [],
    },
    {
      id: 'toilet',
      name: { target: 'el inodoro', native: 'toilet' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'shower',
      name: { target: 'la ducha', native: 'shower' },
      state: { on: false },
      actions: ['USE'],
    },
    {
      id: 'toothbrush',
      name: { target: 'el cepillo de dientes', native: 'toothbrush' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'towel',
      name: { target: 'la toalla', native: 'towel' },
      state: {},
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'soap',
      name: { target: 'el jabón', native: 'soap' },
      state: {},
      actions: ['USE'],
    },
  ],
  exits: [
    { to: 'bedroom', name: { target: 'el dormitorio', native: 'bedroom' } },
    { to: 'kitchen', name: { target: 'la cocina', native: 'kitchen' } },
    { to: 'living_room', name: { target: 'la sala', native: 'living room' } },
  ],
};

export const kitchen: Location = {
  id: 'kitchen',
  name: { target: 'la cocina', native: 'kitchen' },
  objects: [
    {
      id: 'refrigerator',
      name: { target: 'la nevera', native: 'refrigerator' },
      state: { open: false, contains: ['milk', 'eggs', 'butter', 'juice'] },
      actions: ['OPEN', 'CLOSE'],
    },
    {
      id: 'stove',
      name: { target: 'la estufa', native: 'stove' },
      state: { on: false },
      actions: ['TURN_ON', 'TURN_OFF', 'COOK'],
    },
    {
      id: 'table',
      name: { target: 'la mesa', native: 'table' },
      state: {},
      actions: [],
    },
    {
      id: 'chair',
      name: { target: 'la silla', native: 'chair' },
      state: {},
      actions: [],
    },
    {
      id: 'coffee_maker',
      name: { target: 'la cafetera', native: 'coffee maker' },
      state: { on: false },
      actions: ['TURN_ON', 'TURN_OFF'],
    },
    {
      id: 'cup',
      name: { target: 'la taza', native: 'cup' },
      state: {},
      actions: ['TAKE'],
      takeable: true,
    },
    {
      id: 'plate',
      name: { target: 'el plato', native: 'plate' },
      state: {},
      actions: ['TAKE'],
      takeable: true,
    },
    {
      id: 'pan',
      name: { target: 'la sartén', native: 'pan' },
      state: {},
      actions: ['TAKE', 'USE'],
      takeable: true,
    },
    // Food items (inside fridge, shown when fridge is open)
    {
      id: 'milk',
      name: { target: 'la leche', native: 'milk' },
      state: { inFridge: true },
      actions: ['TAKE', 'DRINK'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 10 },
    },
    {
      id: 'eggs',
      name: { target: 'los huevos', native: 'eggs' },
      state: { inFridge: true },
      actions: ['TAKE', 'COOK'],
      takeable: true,
    },
    {
      id: 'bread',
      name: { target: 'el pan', native: 'bread' },
      state: {},
      actions: ['TAKE', 'EAT'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 15 },
    },
    {
      id: 'butter',
      name: { target: 'la mantequilla', native: 'butter' },
      state: { inFridge: true },
      actions: ['TAKE', 'USE'],
      takeable: true,
    },
    {
      id: 'coffee',
      name: { target: 'el café', native: 'coffee' },
      state: {},
      actions: ['DRINK'],
      consumable: true,
      needsEffect: { energy: 20 },
    },
    {
      id: 'water',
      name: { target: 'el agua', native: 'water' },
      state: {},
      actions: ['DRINK'],
      consumable: true,
      needsEffect: { hunger: 5 },
    },
    {
      id: 'juice',
      name: { target: 'el jugo', native: 'juice' },
      state: { inFridge: true },
      actions: ['TAKE', 'DRINK'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 10 },
    },
  ],
  exits: [
    { to: 'bedroom', name: { target: 'el dormitorio', native: 'bedroom' } },
    { to: 'bathroom', name: { target: 'el baño', native: 'bathroom' } },
    { to: 'living_room', name: { target: 'la sala', native: 'living room' } },
  ],
};

export const livingRoom: Location = {
  id: 'living_room',
  name: { target: 'la sala', native: 'living room' },
  objects: [
    {
      id: 'couch',
      name: { target: 'el sofá', native: 'couch' },
      state: {},
      actions: [],
    },
    {
      id: 'tv',
      name: { target: 'la televisión', native: 'TV' },
      state: { on: false },
      actions: ['TURN_ON', 'TURN_OFF'],
    },
    {
      id: 'coffee_table',
      name: { target: 'la mesa de centro', native: 'coffee table' },
      state: {},
      actions: [],
    },
    {
      id: 'bookshelf',
      name: { target: 'la estantería', native: 'bookshelf' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'remote',
      name: { target: 'el control remoto', native: 'remote control' },
      state: {},
      actions: ['TAKE', 'USE'],
      takeable: true,
    },
    {
      id: 'pet_food',
      name: { target: 'la comida para mascotas', native: 'pet food' },
      state: {},
      actions: ['TAKE'],
      takeable: true,
    },
  ],
  exits: [
    { to: 'bedroom', name: { target: 'el dormitorio', native: 'bedroom' } },
    { to: 'kitchen', name: { target: 'la cocina', native: 'kitchen' } },
    { to: 'street', name: { target: 'la calle', native: 'street' } },
  ],
};

export const street: Location = {
  id: 'street',
  name: { target: 'la calle', native: 'street' },
  objects: [
    {
      id: 'streetlamp',
      name: { target: 'la farola', native: 'streetlamp' },
      state: { on: true },
      actions: ['LOOK'],
    },
    {
      id: 'bench',
      name: { target: 'el banco', native: 'bench' },
      state: {},
      actions: [],
    },
  ],
  exits: [
    { to: 'living_room', name: { target: 'la casa', native: 'home' } },
    { to: 'restaurant_entrance', name: { target: 'el restaurante', native: 'restaurant' } },
    { to: 'clinic_reception', name: { target: 'la clinica', native: 'clinic' } },
    { to: 'gym_entrance', name: { target: 'el gimnasio', native: 'gym' } },
    { to: 'market_entrance', name: { target: 'el mercado', native: 'market' } },
    { to: 'park_entrance', name: { target: 'el parque', native: 'park' } },
    { to: 'bank_entrance', name: { target: 'el banco', native: 'bank' } },
  ],
};

export const locations: Record<string, Location> = {
  bedroom,
  bathroom,
  kitchen,
  living_room: livingRoom,
  street,
};

// ============================================================================
// NPCS AND PETS
// ============================================================================

export const npcs: NPC[] = [
  {
    id: 'roommate',
    name: { target: 'Carlos', native: 'Carlos' },
    location: 'living_room',
    personality: 'Sleepy but friendly roommate. Just woke up, sitting on the couch. Wants coffee or breakfast. Speaks casually.',
  },
];

export const pets: Pet[] = [
  {
    id: 'cat',
    name: { target: 'el gato', native: 'cat' },
    defaultLocation: 'living_room',
    personality: 'Independent and aloof. Occasionally affectionate. Named Luna.',
  },
  {
    id: 'dog',
    name: { target: 'el perro', native: 'dog' },
    defaultLocation: 'living_room',
    personality: 'Excited and hungry. Always wants attention and food. Named Max.',
  },
];

export function getNPCsInLocation(locationId: string): NPC[] {
  return npcs.filter(npc => npc.location === locationId);
}

export function getPetsInLocation(locationId: string, petLocations: Record<string, string>): Pet[] {
  return pets.filter(pet => petLocations[pet.id] === locationId);
}

// ============================================================================
// GOALS
// ============================================================================

export const goals: Goal[] = [
  {
    id: 'wake_up',
    title: 'Wake up and start your day',
    description: 'Get out of bed to begin your morning.',
    hint: 'Try "Me levanto" (I get up)',
    checkComplete: (state: GameState) => state.playerPosition === 'standing',
    nextGoalId: 'turn_off_alarm',
  },
  {
    id: 'turn_off_alarm',
    title: 'Turn off the alarm',
    description: 'The alarm is still ringing! Turn it off.',
    hint: 'Try "Apago el despertador" (I turn off the alarm)',
    checkComplete: (state: GameState) => {
      // Check objectStates directly - don't rely on being in bedroom
      const alarmState = state.objectStates['alarm_clock'];
      // Alarm starts ringing, so if we've set ringing to false, it's off
      return alarmState?.ringing === false;
    },
    nextGoalId: 'go_to_bathroom',
  },
  {
    id: 'go_to_bathroom',
    title: 'Go to the bathroom',
    description: 'Time to get ready. Head to the bathroom.',
    hint: 'Try "Voy al baño" (I go to the bathroom)',
    checkComplete: (state: GameState) => state.location.id === 'bathroom',
    nextGoalId: 'brush_teeth',
  },
  {
    id: 'brush_teeth',
    title: 'Brush your teeth',
    description: 'Good hygiene is important!',
    hint: 'Try "Me cepillo los dientes" (I brush my teeth)',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('brush_teeth') ||
      state.completedGoals.includes('brush_teeth_action'),
    nextGoalId: 'take_shower',
  },
  {
    id: 'take_shower',
    title: 'Take a shower',
    description: 'A shower will help you feel fresh.',
    hint: 'Try "Me ducho" (I shower)',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('take_shower') ||
      state.completedGoals.includes('shower_action'),
    nextGoalId: 'go_to_kitchen',
  },
  {
    id: 'go_to_kitchen',
    title: 'Go to the kitchen',
    description: "Your stomach is growling. Time for breakfast!",
    hint: 'Try "Voy a la cocina" (I go to the kitchen)',
    checkComplete: (state: GameState) => state.location.id === 'kitchen',
    nextGoalId: 'make_breakfast',
  },
  {
    id: 'make_breakfast',
    title: 'Make breakfast',
    description: 'Prepare something to eat. Maybe some eggs?',
    hint: 'Try "Abro la nevera" to open the fridge, then "Cocino los huevos"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('make_breakfast') ||
      state.completedGoals.includes('ate_food'),
    nextGoalId: 'go_to_living_room',
  },
  {
    id: 'go_to_living_room',
    title: 'Go to the living room',
    description: 'Time to check on your roommate and the pets.',
    hint: 'Try "Voy a la sala" (I go to the living room)',
    checkComplete: (state: GameState) => state.location.id === 'living_room',
    nextGoalId: 'greet_roommate',
  },
  {
    id: 'greet_roommate',
    title: 'Say good morning to Carlos',
    description: 'Your roommate Carlos is on the couch. Say hi!',
    hint: 'Try "Hola Carlos" or "Buenos días, Carlos"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('greet_roommate') ||
      state.completedGoals.includes('greeted_roommate'),
    nextGoalId: 'ask_roommate_breakfast',
  },
  {
    id: 'ask_roommate_breakfast',
    title: 'Ask Carlos what he wants for breakfast',
    description: 'Carlos looks hungry. Ask what he wants!',
    hint: 'Try "¿Qué quieres para desayunar?" or "¿Tienes hambre?"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('ask_roommate_breakfast') ||
      state.completedGoals.includes('asked_breakfast'),
    nextGoalId: 'feed_pets',
  },
  {
    id: 'feed_pets',
    title: 'Feed the pets',
    description: 'Luna the cat and Max the dog are hungry!',
    hint: 'Try "Le doy comida al gato" or "Le doy comida al perro"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('fed_cat') ||
      state.completedGoals.includes('fed_dog') ||
      state.completedGoals.includes('feed_pets'),
    nextGoalId: 'morning_complete',
  },
  {
    id: 'morning_complete',
    title: 'Morning routine complete!',
    description: 'Congratulations! You completed your morning routine with your roommate and pets.',
    checkComplete: () => false, // Final goal, always shown
  },
];

export function getGoalById(id: string): Goal | undefined {
  return goals.find((g) => g.id === id);
}

export function getStartGoal(): Goal {
  return goals[0];
}

// ============================================================================
// VOCABULARY
// ============================================================================

export const vocabulary: VocabWord[] = [
  // Rooms
  { target: 'el dormitorio', native: 'bedroom', category: 'noun', gender: 'masculine' },
  { target: 'el baño', native: 'bathroom', category: 'noun', gender: 'masculine' },
  { target: 'la cocina', native: 'kitchen', category: 'noun', gender: 'feminine' },

  // Bedroom objects
  { target: 'la cama', native: 'bed', category: 'noun', gender: 'feminine' },
  { target: 'la ventana', native: 'window', category: 'noun', gender: 'feminine' },
  { target: 'la lámpara', native: 'lamp', category: 'noun', gender: 'feminine' },
  { target: 'el armario', native: 'closet', category: 'noun', gender: 'masculine' },
  { target: 'el despertador', native: 'alarm clock', category: 'noun', gender: 'masculine' },

  // Bathroom objects
  { target: 'el lavabo', native: 'sink', category: 'noun', gender: 'masculine' },
  { target: 'el espejo', native: 'mirror', category: 'noun', gender: 'masculine' },
  { target: 'la ducha', native: 'shower', category: 'noun', gender: 'feminine' },
  { target: 'el cepillo de dientes', native: 'toothbrush', category: 'noun', gender: 'masculine' },
  { target: 'la toalla', native: 'towel', category: 'noun', gender: 'feminine' },
  { target: 'el jabón', native: 'soap', category: 'noun', gender: 'masculine' },

  // Kitchen objects
  { target: 'la nevera', native: 'refrigerator', category: 'noun', gender: 'feminine' },
  { target: 'la estufa', native: 'stove', category: 'noun', gender: 'feminine' },
  { target: 'la mesa', native: 'table', category: 'noun', gender: 'feminine' },
  { target: 'la silla', native: 'chair', category: 'noun', gender: 'feminine' },
  { target: 'la taza', native: 'cup', category: 'noun', gender: 'feminine' },
  { target: 'el plato', native: 'plate', category: 'noun', gender: 'masculine' },
  { target: 'la sartén', native: 'pan', category: 'noun', gender: 'feminine' },

  // Food
  { target: 'la leche', native: 'milk', category: 'noun', gender: 'feminine' },
  { target: 'los huevos', native: 'eggs', category: 'noun', gender: 'masculine' },
  { target: 'el pan', native: 'bread', category: 'noun', gender: 'masculine' },
  { target: 'la mantequilla', native: 'butter', category: 'noun', gender: 'feminine' },
  { target: 'el café', native: 'coffee', category: 'noun', gender: 'masculine' },
  { target: 'el agua', native: 'water', category: 'noun', gender: 'feminine' }, // feminine despite el
  { target: 'el jugo', native: 'juice', category: 'noun', gender: 'masculine' },

  // Verbs (yo form)
  { target: 'me despierto', native: 'I wake up', category: 'verb' },
  { target: 'me levanto', native: 'I get up', category: 'verb' },
  { target: 'abro', native: 'I open', category: 'verb' },
  { target: 'cierro', native: 'I close', category: 'verb' },
  { target: 'enciendo', native: 'I turn on', category: 'verb' },
  { target: 'apago', native: 'I turn off', category: 'verb' },
  { target: 'tomo', native: 'I take/drink', category: 'verb' },
  { target: 'como', native: 'I eat', category: 'verb' },
  { target: 'cocino', native: 'I cook', category: 'verb' },
  { target: 'me lavo', native: 'I wash myself', category: 'verb' },
  { target: 'me cepillo', native: 'I brush', category: 'verb' },
  { target: 'me ducho', native: 'I shower', category: 'verb' },
  { target: 'pongo', native: 'I put', category: 'verb' },
  { target: 'voy', native: 'I go', category: 'verb' },
  { target: 'uso', native: 'I use', category: 'verb' },

  // Living room
  { target: 'la sala', native: 'living room', category: 'noun', gender: 'feminine' },
  { target: 'el sofá', native: 'couch', category: 'noun', gender: 'masculine' },
  { target: 'la televisión', native: 'TV', category: 'noun', gender: 'feminine' },
  { target: 'la mesa de centro', native: 'coffee table', category: 'noun', gender: 'feminine' },
  { target: 'la estantería', native: 'bookshelf', category: 'noun', gender: 'feminine' },
  { target: 'el control remoto', native: 'remote control', category: 'noun', gender: 'masculine' },

  // Pets
  { target: 'el gato', native: 'cat', category: 'noun', gender: 'masculine' },
  { target: 'el perro', native: 'dog', category: 'noun', gender: 'masculine' },
  { target: 'la mascota', native: 'pet', category: 'noun', gender: 'feminine' },
  { target: 'la comida para mascotas', native: 'pet food', category: 'noun', gender: 'feminine' },

  // Conversation verbs
  { target: 'hablo con', native: 'I talk to', category: 'verb' },
  { target: 'le pregunto', native: 'I ask him/her', category: 'verb' },
  { target: 'le doy', native: 'I give him/her', category: 'verb' },
  { target: 'acaricio', native: 'I pet/stroke', category: 'verb' },
  { target: 'juego con', native: 'I play with', category: 'verb' },

  // Greetings
  { target: 'hola', native: 'hello', category: 'other' },
  { target: 'buenos días', native: 'good morning', category: 'other' },
  { target: '¿qué quieres?', native: 'what do you want?', category: 'other' },

  // Other
  { target: 'a', native: 'to', category: 'other' },
  { target: 'de', native: 'of/from', category: 'other' },
  { target: 'el', native: 'the (masc.)', category: 'other' },
  { target: 'la', native: 'the (fem.)', category: 'other' },
  { target: 'y', native: 'and', category: 'other' },
  { target: 'con', native: 'with', category: 'other' },
  { target: 'para', native: 'for', category: 'other' },
];

export const promptInstructions = `NPC INTERACTIONS:
- "hola carlos" → actions: [{ "type": "talk", "npcId": "roommate" }], goalComplete: ["greet_roommate"]
- "¿qué quieres para desayunar?" → actions: [{ "type": "talk", "npcId": "roommate" }], goalComplete: ["ask_roommate_breakfast"], npcResponse with wantsItem
- "le doy los huevos a carlos" → actions: [{ "type": "give", "objectId": "eggs", "npcId": "roommate" }]

PET INTERACTIONS:
- "acaricio al gato" → actions: [{ "type": "pet", "petId": "cat" }]
- "le doy comida al perro" → actions: [{ "type": "feed", "petId": "dog" }], goalComplete: ["feed_pets"]

NPC PERSONALITIES:
- Carlos (roommate): Sleepy, friendly, casual speech. In the morning, wants coffee or breakfast (eggs, toast).
- Luna (cat): Independent, aloof. Responds with purring or ignoring.
- Max (dog): Excited, eager. Responds with tail wagging and barking.`;

export const homeModule: ModuleDefinition = {
  name: 'home',
  displayName: 'Home',
  locations,
  npcs,
  goals,
  vocabulary,
  startLocationId: 'bedroom',
  startGoalId: 'wake_up',
  locationIds: Object.keys(locations).filter(id => id !== 'street'),
  unlockLevel: 1,
  promptInstructions,
  pets,
  getPetsInLocation,
};
