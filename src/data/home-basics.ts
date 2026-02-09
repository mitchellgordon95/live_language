import type { Location, Goal, VocabWord, GameState, NPC, Pet } from '../engine/types.js';
import { getObjectState } from '../engine/game-state.js';

// ============================================================================
// LOCATIONS
// ============================================================================

export const bedroom: Location = {
  id: 'bedroom',
  name: { spanish: 'el dormitorio', english: 'bedroom' },
  objects: [
    {
      id: 'bed',
      name: { spanish: 'la cama', english: 'bed' },
      state: {},
      actions: [],
    },
    {
      id: 'alarm_clock',
      name: { spanish: 'el despertador', english: 'alarm clock' },
      state: { ringing: true, on: true },
      actions: ['TURN_OFF'],
    },
    {
      id: 'window',
      name: { spanish: 'la ventana', english: 'window' },
      state: { open: false },
      actions: ['OPEN', 'CLOSE'],
    },
    {
      id: 'lamp',
      name: { spanish: 'la lámpara', english: 'lamp' },
      state: { on: false },
      actions: ['TURN_ON', 'TURN_OFF'],
    },
    {
      id: 'closet',
      name: { spanish: 'el armario', english: 'closet' },
      state: { open: false },
      actions: ['OPEN', 'CLOSE'],
    },
  ],
  exits: [
    { to: 'bathroom', name: { spanish: 'el baño', english: 'bathroom' } },
    { to: 'kitchen', name: { spanish: 'la cocina', english: 'kitchen' } },
    { to: 'living_room', name: { spanish: 'la sala', english: 'living room' } },
  ],
};

export const bathroom: Location = {
  id: 'bathroom',
  name: { spanish: 'el baño', english: 'bathroom' },
  objects: [
    {
      id: 'sink',
      name: { spanish: 'el lavabo', english: 'sink' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'mirror',
      name: { spanish: 'el espejo', english: 'mirror' },
      state: {},
      actions: [],
    },
    {
      id: 'toilet',
      name: { spanish: 'el inodoro', english: 'toilet' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'shower',
      name: { spanish: 'la ducha', english: 'shower' },
      state: { on: false },
      actions: ['USE'],
    },
    {
      id: 'toothbrush',
      name: { spanish: 'el cepillo de dientes', english: 'toothbrush' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'towel',
      name: { spanish: 'la toalla', english: 'towel' },
      state: {},
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'soap',
      name: { spanish: 'el jabón', english: 'soap' },
      state: {},
      actions: ['USE'],
    },
  ],
  exits: [
    { to: 'bedroom', name: { spanish: 'el dormitorio', english: 'bedroom' } },
    { to: 'kitchen', name: { spanish: 'la cocina', english: 'kitchen' } },
    { to: 'living_room', name: { spanish: 'la sala', english: 'living room' } },
  ],
};

export const kitchen: Location = {
  id: 'kitchen',
  name: { spanish: 'la cocina', english: 'kitchen' },
  objects: [
    {
      id: 'refrigerator',
      name: { spanish: 'la nevera', english: 'refrigerator' },
      state: { open: false, contains: ['milk', 'eggs', 'butter', 'juice'] },
      actions: ['OPEN', 'CLOSE'],
    },
    {
      id: 'stove',
      name: { spanish: 'la estufa', english: 'stove' },
      state: { on: false },
      actions: ['TURN_ON', 'TURN_OFF', 'COOK'],
    },
    {
      id: 'table',
      name: { spanish: 'la mesa', english: 'table' },
      state: {},
      actions: [],
    },
    {
      id: 'chair',
      name: { spanish: 'la silla', english: 'chair' },
      state: {},
      actions: [],
    },
    {
      id: 'coffee_maker',
      name: { spanish: 'la cafetera', english: 'coffee maker' },
      state: { on: false },
      actions: ['TURN_ON', 'TURN_OFF'],
    },
    {
      id: 'cup',
      name: { spanish: 'la taza', english: 'cup' },
      state: {},
      actions: ['TAKE'],
      takeable: true,
    },
    {
      id: 'plate',
      name: { spanish: 'el plato', english: 'plate' },
      state: {},
      actions: ['TAKE'],
      takeable: true,
    },
    {
      id: 'pan',
      name: { spanish: 'la sartén', english: 'pan' },
      state: {},
      actions: ['TAKE', 'USE'],
      takeable: true,
    },
    // Food items (inside fridge, shown when fridge is open)
    {
      id: 'milk',
      name: { spanish: 'la leche', english: 'milk' },
      state: { inFridge: true },
      actions: ['TAKE', 'DRINK'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 10 },
    },
    {
      id: 'eggs',
      name: { spanish: 'los huevos', english: 'eggs' },
      state: { inFridge: true },
      actions: ['TAKE', 'COOK'],
      takeable: true,
    },
    {
      id: 'bread',
      name: { spanish: 'el pan', english: 'bread' },
      state: {},
      actions: ['TAKE', 'EAT'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 15 },
    },
    {
      id: 'butter',
      name: { spanish: 'la mantequilla', english: 'butter' },
      state: { inFridge: true },
      actions: ['TAKE', 'USE'],
      takeable: true,
    },
    {
      id: 'coffee',
      name: { spanish: 'el café', english: 'coffee' },
      state: {},
      actions: ['DRINK'],
      consumable: true,
      needsEffect: { energy: 20 },
    },
    {
      id: 'water',
      name: { spanish: 'el agua', english: 'water' },
      state: {},
      actions: ['DRINK'],
      consumable: true,
      needsEffect: { hunger: 5 },
    },
    {
      id: 'juice',
      name: { spanish: 'el jugo', english: 'juice' },
      state: { inFridge: true },
      actions: ['TAKE', 'DRINK'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 10 },
    },
  ],
  exits: [
    { to: 'bedroom', name: { spanish: 'el dormitorio', english: 'bedroom' } },
    { to: 'bathroom', name: { spanish: 'el baño', english: 'bathroom' } },
    { to: 'living_room', name: { spanish: 'la sala', english: 'living room' } },
  ],
};

export const livingRoom: Location = {
  id: 'living_room',
  name: { spanish: 'la sala', english: 'living room' },
  objects: [
    {
      id: 'couch',
      name: { spanish: 'el sofá', english: 'couch' },
      state: {},
      actions: [],
    },
    {
      id: 'tv',
      name: { spanish: 'la televisión', english: 'TV' },
      state: { on: false },
      actions: ['TURN_ON', 'TURN_OFF'],
    },
    {
      id: 'coffee_table',
      name: { spanish: 'la mesa de centro', english: 'coffee table' },
      state: {},
      actions: [],
    },
    {
      id: 'bookshelf',
      name: { spanish: 'la estantería', english: 'bookshelf' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'remote',
      name: { spanish: 'el control remoto', english: 'remote control' },
      state: {},
      actions: ['TAKE', 'USE'],
      takeable: true,
    },
    {
      id: 'pet_food',
      name: { spanish: 'la comida para mascotas', english: 'pet food' },
      state: {},
      actions: ['TAKE'],
      takeable: true,
    },
  ],
  exits: [
    { to: 'bedroom', name: { spanish: 'el dormitorio', english: 'bedroom' } },
    { to: 'kitchen', name: { spanish: 'la cocina', english: 'kitchen' } },
    { to: 'street', name: { spanish: 'la calle', english: 'street' } },
  ],
};

export const street: Location = {
  id: 'street',
  name: { spanish: 'la calle', english: 'street' },
  objects: [
    {
      id: 'streetlamp',
      name: { spanish: 'la farola', english: 'streetlamp' },
      state: { on: true },
      actions: ['LOOK'],
    },
    {
      id: 'bench',
      name: { spanish: 'el banco', english: 'bench' },
      state: {},
      actions: [],
    },
  ],
  exits: [
    { to: 'living_room', name: { spanish: 'la casa', english: 'home' } },
    { to: 'restaurant_entrance', name: { spanish: 'el restaurante', english: 'restaurant' } },
    { to: 'clinic_reception', name: { spanish: 'la clinica', english: 'clinic' } },
    { to: 'gym_entrance', name: { spanish: 'el gimnasio', english: 'gym' } },
    { to: 'market_entrance', name: { spanish: 'el mercado', english: 'market' } },
    { to: 'park_entrance', name: { spanish: 'el parque', english: 'park' } },
    { to: 'bank_entrance', name: { spanish: 'el banco', english: 'bank' } },
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
    name: { spanish: 'Carlos', english: 'Carlos' },
    location: 'living_room',
    personality: 'Sleepy but friendly roommate. Just woke up, sitting on the couch. Wants coffee or breakfast. Speaks casually.',
  },
];

export const pets: Pet[] = [
  {
    id: 'cat',
    name: { spanish: 'el gato', english: 'cat' },
    defaultLocation: 'living_room',
    personality: 'Independent and aloof. Occasionally affectionate. Named Luna.',
  },
  {
    id: 'dog',
    name: { spanish: 'el perro', english: 'dog' },
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
  { spanish: 'el dormitorio', english: 'bedroom', category: 'noun', gender: 'masculine' },
  { spanish: 'el baño', english: 'bathroom', category: 'noun', gender: 'masculine' },
  { spanish: 'la cocina', english: 'kitchen', category: 'noun', gender: 'feminine' },

  // Bedroom objects
  { spanish: 'la cama', english: 'bed', category: 'noun', gender: 'feminine' },
  { spanish: 'la ventana', english: 'window', category: 'noun', gender: 'feminine' },
  { spanish: 'la lámpara', english: 'lamp', category: 'noun', gender: 'feminine' },
  { spanish: 'el armario', english: 'closet', category: 'noun', gender: 'masculine' },
  { spanish: 'el despertador', english: 'alarm clock', category: 'noun', gender: 'masculine' },

  // Bathroom objects
  { spanish: 'el lavabo', english: 'sink', category: 'noun', gender: 'masculine' },
  { spanish: 'el espejo', english: 'mirror', category: 'noun', gender: 'masculine' },
  { spanish: 'la ducha', english: 'shower', category: 'noun', gender: 'feminine' },
  { spanish: 'el cepillo de dientes', english: 'toothbrush', category: 'noun', gender: 'masculine' },
  { spanish: 'la toalla', english: 'towel', category: 'noun', gender: 'feminine' },
  { spanish: 'el jabón', english: 'soap', category: 'noun', gender: 'masculine' },

  // Kitchen objects
  { spanish: 'la nevera', english: 'refrigerator', category: 'noun', gender: 'feminine' },
  { spanish: 'la estufa', english: 'stove', category: 'noun', gender: 'feminine' },
  { spanish: 'la mesa', english: 'table', category: 'noun', gender: 'feminine' },
  { spanish: 'la silla', english: 'chair', category: 'noun', gender: 'feminine' },
  { spanish: 'la taza', english: 'cup', category: 'noun', gender: 'feminine' },
  { spanish: 'el plato', english: 'plate', category: 'noun', gender: 'masculine' },
  { spanish: 'la sartén', english: 'pan', category: 'noun', gender: 'feminine' },

  // Food
  { spanish: 'la leche', english: 'milk', category: 'noun', gender: 'feminine' },
  { spanish: 'los huevos', english: 'eggs', category: 'noun', gender: 'masculine' },
  { spanish: 'el pan', english: 'bread', category: 'noun', gender: 'masculine' },
  { spanish: 'la mantequilla', english: 'butter', category: 'noun', gender: 'feminine' },
  { spanish: 'el café', english: 'coffee', category: 'noun', gender: 'masculine' },
  { spanish: 'el agua', english: 'water', category: 'noun', gender: 'feminine' }, // feminine despite el
  { spanish: 'el jugo', english: 'juice', category: 'noun', gender: 'masculine' },

  // Verbs (yo form)
  { spanish: 'me despierto', english: 'I wake up', category: 'verb' },
  { spanish: 'me levanto', english: 'I get up', category: 'verb' },
  { spanish: 'abro', english: 'I open', category: 'verb' },
  { spanish: 'cierro', english: 'I close', category: 'verb' },
  { spanish: 'enciendo', english: 'I turn on', category: 'verb' },
  { spanish: 'apago', english: 'I turn off', category: 'verb' },
  { spanish: 'tomo', english: 'I take/drink', category: 'verb' },
  { spanish: 'como', english: 'I eat', category: 'verb' },
  { spanish: 'cocino', english: 'I cook', category: 'verb' },
  { spanish: 'me lavo', english: 'I wash myself', category: 'verb' },
  { spanish: 'me cepillo', english: 'I brush', category: 'verb' },
  { spanish: 'me ducho', english: 'I shower', category: 'verb' },
  { spanish: 'pongo', english: 'I put', category: 'verb' },
  { spanish: 'voy', english: 'I go', category: 'verb' },
  { spanish: 'uso', english: 'I use', category: 'verb' },

  // Living room
  { spanish: 'la sala', english: 'living room', category: 'noun', gender: 'feminine' },
  { spanish: 'el sofá', english: 'couch', category: 'noun', gender: 'masculine' },
  { spanish: 'la televisión', english: 'TV', category: 'noun', gender: 'feminine' },
  { spanish: 'la mesa de centro', english: 'coffee table', category: 'noun', gender: 'feminine' },
  { spanish: 'la estantería', english: 'bookshelf', category: 'noun', gender: 'feminine' },
  { spanish: 'el control remoto', english: 'remote control', category: 'noun', gender: 'masculine' },

  // Pets
  { spanish: 'el gato', english: 'cat', category: 'noun', gender: 'masculine' },
  { spanish: 'el perro', english: 'dog', category: 'noun', gender: 'masculine' },
  { spanish: 'la mascota', english: 'pet', category: 'noun', gender: 'feminine' },
  { spanish: 'la comida para mascotas', english: 'pet food', category: 'noun', gender: 'feminine' },

  // Conversation verbs
  { spanish: 'hablo con', english: 'I talk to', category: 'verb' },
  { spanish: 'le pregunto', english: 'I ask him/her', category: 'verb' },
  { spanish: 'le doy', english: 'I give him/her', category: 'verb' },
  { spanish: 'acaricio', english: 'I pet/stroke', category: 'verb' },
  { spanish: 'juego con', english: 'I play with', category: 'verb' },

  // Greetings
  { spanish: 'hola', english: 'hello', category: 'other' },
  { spanish: 'buenos días', english: 'good morning', category: 'other' },
  { spanish: '¿qué quieres?', english: 'what do you want?', category: 'other' },

  // Other
  { spanish: 'a', english: 'to', category: 'other' },
  { spanish: 'de', english: 'of/from', category: 'other' },
  { spanish: 'el', english: 'the (masc.)', category: 'other' },
  { spanish: 'la', english: 'the (fem.)', category: 'other' },
  { spanish: 'y', english: 'and', category: 'other' },
  { spanish: 'con', english: 'with', category: 'other' },
  { spanish: 'para', english: 'for', category: 'other' },
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
