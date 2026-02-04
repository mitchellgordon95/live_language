import type { Location, Goal, VocabWord, GameState } from '../engine/types.js';

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
  ],
};

export const locations: Record<string, Location> = {
  bedroom,
  bathroom,
  kitchen,
};

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
      const alarm = state.location.objects.find((o) => o.id === 'alarm_clock');
      return alarm ? !alarm.state.ringing : true;
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
    nextGoalId: 'morning_complete',
  },
  {
    id: 'morning_complete',
    title: 'Morning routine complete!',
    description: 'Congratulations! You completed your morning routine.',
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

  // Other
  { spanish: 'a', english: 'to', category: 'other' },
  { spanish: 'de', english: 'of/from', category: 'other' },
  { spanish: 'el', english: 'the (masc.)', category: 'other' },
  { spanish: 'la', english: 'the (fem.)', category: 'other' },
  { spanish: 'y', english: 'and', category: 'other' },
  { spanish: 'con', english: 'with', category: 'other' },
];
