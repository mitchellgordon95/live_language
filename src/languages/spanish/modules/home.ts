import type { Location, Goal, VocabWord, GameState, NPC, WorldObject, ModuleDefinition } from '../../../engine/types.js';

// ============================================================================
// LOCATIONS (exits only — objects are in the flat list below)
// ============================================================================

const locations: Record<string, Location> = {
  bedroom: {
    id: 'bedroom',
    name: { target: 'el dormitorio', native: 'bedroom' },
    exits: [
      { to: 'bathroom', name: { target: 'el baño', native: 'bathroom' } },
      { to: 'kitchen', name: { target: 'la cocina', native: 'kitchen' } },
      { to: 'living_room', name: { target: 'la sala', native: 'living room' } },
    ],
  },
  bathroom: {
    id: 'bathroom',
    name: { target: 'el baño', native: 'bathroom' },
    exits: [
      { to: 'bedroom', name: { target: 'el dormitorio', native: 'bedroom' } },
      { to: 'kitchen', name: { target: 'la cocina', native: 'kitchen' } },
      { to: 'living_room', name: { target: 'la sala', native: 'living room' } },
    ],
  },
  kitchen: {
    id: 'kitchen',
    name: { target: 'la cocina', native: 'kitchen' },
    exits: [
      { to: 'bedroom', name: { target: 'el dormitorio', native: 'bedroom' } },
      { to: 'bathroom', name: { target: 'el baño', native: 'bathroom' } },
      { to: 'living_room', name: { target: 'la sala', native: 'living room' } },
    ],
  },
  living_room: {
    id: 'living_room',
    name: { target: 'la sala', native: 'living room' },
    exits: [
      { to: 'bedroom', name: { target: 'el dormitorio', native: 'bedroom' } },
      { to: 'kitchen', name: { target: 'la cocina', native: 'kitchen' } },
      { to: 'street', name: { target: 'la calle', native: 'street' } },
    ],
  },
  street: {
    id: 'street',
    name: { target: 'la calle', native: 'street' },
    exits: [
      { to: 'living_room', name: { target: 'la casa', native: 'home' } },
      { to: 'restaurant_entrance', name: { target: 'el restaurante', native: 'restaurant' } },
      { to: 'clinic_reception', name: { target: 'la clinica', native: 'clinic' } },
      { to: 'gym_entrance', name: { target: 'el gimnasio', native: 'gym' } },
      { to: 'market_entrance', name: { target: 'el mercado', native: 'market' } },
      { to: 'park_entrance', name: { target: 'el parque', native: 'park' } },
      { to: 'bank_entrance', name: { target: 'el banco', native: 'bank' } },
    ],
  },
};

// ============================================================================
// OBJECTS (flat list — each knows its own location)
// ============================================================================

const objects: WorldObject[] = [
  // Bedroom
  { id: 'bed', name: { target: 'la cama', native: 'bed' }, location: 'bedroom', tags: [] },
  { id: 'alarm_clock', name: { target: 'el despertador', native: 'alarm clock' }, location: 'bedroom', tags: ['ringing', 'on'] },
  { id: 'window', name: { target: 'la ventana', native: 'window' }, location: 'bedroom', tags: ['closed'] },
  { id: 'lamp', name: { target: 'la lámpara', native: 'lamp' }, location: 'bedroom', tags: ['off'] },
  { id: 'closet', name: { target: 'el armario', native: 'closet' }, location: 'bedroom', tags: ['closed'] },

  // Bathroom
  { id: 'sink', name: { target: 'el lavabo', native: 'sink' }, location: 'bathroom', tags: [] },
  { id: 'mirror', name: { target: 'el espejo', native: 'mirror' }, location: 'bathroom', tags: [] },
  { id: 'toilet', name: { target: 'el inodoro', native: 'toilet' }, location: 'bathroom', tags: [] },
  { id: 'shower', name: { target: 'la ducha', native: 'shower' }, location: 'bathroom', tags: ['off'] },
  { id: 'toothbrush', name: { target: 'el cepillo de dientes', native: 'toothbrush' }, location: 'bathroom', tags: [] },
  { id: 'towel', name: { target: 'la toalla', native: 'towel' }, location: 'bathroom', tags: ['takeable'] },
  { id: 'soap', name: { target: 'el jabón', native: 'soap' }, location: 'bathroom', tags: [] },

  // Kitchen
  { id: 'refrigerator', name: { target: 'la nevera', native: 'refrigerator' }, location: 'kitchen', tags: ['closed', 'container'] },
  { id: 'stove', name: { target: 'la estufa', native: 'stove' }, location: 'kitchen', tags: ['off'] },
  { id: 'table', name: { target: 'la mesa', native: 'table' }, location: 'kitchen', tags: [] },
  { id: 'chair', name: { target: 'la silla', native: 'chair' }, location: 'kitchen', tags: [] },
  { id: 'coffee_maker', name: { target: 'la cafetera', native: 'coffee maker' }, location: 'kitchen', tags: ['off'] },
  { id: 'cup', name: { target: 'la taza', native: 'cup' }, location: 'kitchen', tags: ['takeable'] },
  { id: 'plate', name: { target: 'el plato', native: 'plate' }, location: 'kitchen', tags: ['takeable'] },
  { id: 'pan', name: { target: 'la sartén', native: 'pan' }, location: 'kitchen', tags: ['takeable'] },

  // Food (inside fridge — location is the container ID)
  { id: 'milk', name: { target: 'la leche', native: 'milk' }, location: 'refrigerator', tags: ['takeable', 'consumable'], needsEffect: { hunger: 10 } },
  { id: 'eggs', name: { target: 'los huevos', native: 'eggs' }, location: 'refrigerator', tags: ['takeable', 'consumable'], needsEffect: { hunger: 25 } },
  { id: 'butter', name: { target: 'la mantequilla', native: 'butter' }, location: 'refrigerator', tags: ['takeable'] },
  { id: 'juice', name: { target: 'el jugo', native: 'juice' }, location: 'refrigerator', tags: ['takeable', 'consumable'], needsEffect: { hunger: 10 } },

  // Food (on counter)
  { id: 'bread', name: { target: 'el pan', native: 'bread' }, location: 'kitchen', tags: ['takeable', 'consumable'], needsEffect: { hunger: 15 } },
  { id: 'coffee', name: { target: 'el café', native: 'coffee' }, location: 'kitchen', tags: ['consumable'], needsEffect: { energy: 20 } },
  { id: 'water', name: { target: 'el agua', native: 'water' }, location: 'kitchen', tags: ['consumable'], needsEffect: { hunger: 5 } },

  // Living room
  { id: 'couch', name: { target: 'el sofá', native: 'couch' }, location: 'living_room', tags: [] },
  { id: 'tv', name: { target: 'la televisión', native: 'TV' }, location: 'living_room', tags: ['off'] },
  { id: 'coffee_table', name: { target: 'la mesa de centro', native: 'coffee table' }, location: 'living_room', tags: [] },
  { id: 'bookshelf', name: { target: 'la estantería', native: 'bookshelf' }, location: 'living_room', tags: [] },
  { id: 'remote', name: { target: 'el control remoto', native: 'remote control' }, location: 'living_room', tags: ['takeable'] },
  { id: 'pet_food', name: { target: 'la comida para mascotas', native: 'pet food' }, location: 'living_room', tags: ['takeable'] },

  // Street
  { id: 'streetlamp', name: { target: 'la farola', native: 'streetlamp' }, location: 'street', tags: ['on'] },
  { id: 'bench', name: { target: 'el banco', native: 'bench' }, location: 'street', tags: [] },
];

// ============================================================================
// NPCs (pets are NPCs with isPet: true)
// ============================================================================

const npcs: NPC[] = [
  {
    id: 'roommate',
    name: { target: 'Carlos', native: 'Carlos' },
    location: 'living_room',
    personality: 'Sleepy but friendly roommate. Just woke up, sitting on the couch. Wants coffee or breakfast. Speaks casually.',
    gender: 'male',
  },
  {
    id: 'cat',
    name: { target: 'Luna', native: 'Luna (cat)' },
    location: 'living_room',
    personality: 'Independent and aloof cat. Occasionally affectionate. Purrs when petted, ignores most commands.',
    isPet: true,
  },
  {
    id: 'dog',
    name: { target: 'Max', native: 'Max (dog)' },
    location: 'living_room',
    personality: 'Excited and hungry dog. Always wants attention and food. Wags tail enthusiastically.',
    isPet: true,
  },
];

// ============================================================================
// GOALS (checkComplete uses new state model)
// ============================================================================

const goals: Goal[] = [
  {
    id: 'wake_up',
    title: 'Wake up and start your day',
    description: 'Get out of bed to begin your morning.',
    hint: 'Try "Me levanto" (I get up)',
    checkComplete: (state: GameState) => state.playerTags.includes('standing'),
    nextGoalId: 'turn_off_alarm',
  },
  {
    id: 'turn_off_alarm',
    title: 'Turn off the alarm',
    description: 'The alarm is still ringing! Turn it off.',
    hint: 'Try "Apago el despertador" (I turn off the alarm)',
    checkComplete: (state: GameState) => {
      const alarm = state.objects.find(o => o.id === 'alarm_clock');
      return alarm ? !alarm.tags.includes('ringing') : false;
    },
    nextGoalId: 'go_to_bathroom',
  },
  {
    id: 'go_to_bathroom',
    title: 'Go to the bathroom',
    description: 'Time to get ready. Head to the bathroom.',
    hint: 'Try "Voy al baño" (I go to the bathroom)',
    checkComplete: (state: GameState) => state.currentLocation === 'bathroom',
    nextGoalId: 'brush_teeth',
  },
  {
    id: 'brush_teeth',
    title: 'Brush your teeth',
    description: 'Good hygiene is important!',
    hint: 'Try "Me cepillo los dientes" (I brush my teeth)',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('brush_teeth'),
    nextGoalId: 'take_shower',
  },
  {
    id: 'take_shower',
    title: 'Take a shower',
    description: 'A shower will help you feel fresh.',
    hint: 'Try "Me ducho" (I shower)',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('take_shower'),
    nextGoalId: 'go_to_kitchen',
  },
  {
    id: 'go_to_kitchen',
    title: 'Go to the kitchen',
    description: "Your stomach is growling. Time for breakfast!",
    hint: 'Try "Voy a la cocina" (I go to the kitchen)',
    checkComplete: (state: GameState) => state.currentLocation === 'kitchen',
    nextGoalId: 'make_breakfast',
  },
  {
    id: 'make_breakfast',
    title: 'Make breakfast',
    description: 'Prepare something to eat. Maybe some eggs?',
    hint: 'Try "Abro la nevera" to open the fridge, then "Cocino los huevos"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('make_breakfast'),
    nextGoalId: 'go_to_living_room',
  },
  {
    id: 'go_to_living_room',
    title: 'Go to the living room',
    description: 'Time to check on your roommate and the pets.',
    hint: 'Try "Voy a la sala" (I go to the living room)',
    checkComplete: (state: GameState) => state.currentLocation === 'living_room',
    nextGoalId: 'greet_roommate',
  },
  {
    id: 'greet_roommate',
    title: 'Say good morning to Carlos',
    description: 'Your roommate Carlos is on the couch. Say hi!',
    hint: 'Try "Hola Carlos" or "Buenos días, Carlos"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('greet_roommate'),
    nextGoalId: 'ask_roommate_breakfast',
  },
  {
    id: 'ask_roommate_breakfast',
    title: 'Ask Carlos what he wants for breakfast',
    description: 'Carlos looks hungry. Ask what he wants!',
    hint: 'Try "¿Qué quieres para desayunar?" or "¿Tienes hambre?"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('ask_roommate_breakfast'),
    nextGoalId: 'feed_pets',
  },
  {
    id: 'feed_pets',
    title: 'Feed the pets',
    description: 'Luna the cat and Max the dog are hungry!',
    hint: 'Try "Le doy comida al gato" or "Le doy comida al perro"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('feed_pets'),
    nextGoalId: 'morning_complete',
  },
  {
    id: 'morning_complete',
    title: 'Morning routine complete!',
    description: 'Congratulations! You completed your morning routine.',
    checkComplete: (state: GameState) => state.completedGoals.includes('feed_pets'),
  },
];

// ============================================================================
// VOCABULARY (unchanged)
// ============================================================================

const vocabulary: VocabWord[] = [
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
  { target: 'el inodoro', native: 'toilet', category: 'noun', gender: 'masculine' },
  // Kitchen objects
  { target: 'la nevera', native: 'refrigerator', category: 'noun', gender: 'feminine' },
  { target: 'la estufa', native: 'stove', category: 'noun', gender: 'feminine' },
  { target: 'la mesa', native: 'table', category: 'noun', gender: 'feminine' },
  { target: 'la silla', native: 'chair', category: 'noun', gender: 'feminine' },
  { target: 'la taza', native: 'cup', category: 'noun', gender: 'feminine' },
  { target: 'el plato', native: 'plate', category: 'noun', gender: 'masculine' },
  { target: 'la sartén', native: 'pan', category: 'noun', gender: 'feminine' },
  { target: 'la cafetera', native: 'coffee maker', category: 'noun', gender: 'feminine' },
  // Food
  { target: 'la leche', native: 'milk', category: 'noun', gender: 'feminine' },
  { target: 'los huevos', native: 'eggs', category: 'noun', gender: 'masculine' },
  { target: 'el pan', native: 'bread', category: 'noun', gender: 'masculine' },
  { target: 'la mantequilla', native: 'butter', category: 'noun', gender: 'feminine' },
  { target: 'el café', native: 'coffee', category: 'noun', gender: 'masculine' },
  { target: 'el agua', native: 'water', category: 'noun', gender: 'feminine' },
  { target: 'el jugo', native: 'juice', category: 'noun', gender: 'masculine' },
  // Verbs
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
  // Conversation
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

// ============================================================================
// MODULE EXPORT
// ============================================================================

export const homeModule: ModuleDefinition = {
  name: 'home',
  displayName: 'Home',
  locations,
  objects,
  npcs,
  goals,
  vocabulary,
  startLocationId: 'bedroom',
  startGoalId: 'wake_up',
  locationIds: Object.keys(locations).filter(id => id !== 'street'),
  unlockLevel: 1,

  guidance: `HOME ENVIRONMENT:
A cozy apartment shared with roommate Carlos and two pets (Luna the cat, Max the dog).
The player is learning daily routine vocabulary.

OBJECTS:
- alarm_clock: Digital alarm in bedroom, starts ringing. Turn off = remove "ringing" and "on" tags.
- bed: Player starts here in_bed. Getting up = playerTag add "standing", remove "in_bed".
- window, lamp, closet: Can be opened/closed or turned on/off via tag changes.
- refrigerator: Container in kitchen. Must have "open" tag (remove "closed") to access items inside.
  Items inside have location="refrigerator". When fridge is open, they're accessible.
- eggs: In fridge. Can be cooked (add "cooked" tag), taken to inventory, eaten, or given to Carlos.
- milk, butter, juice: In fridge. Takeable, some consumable.
- bread, coffee, water: On counter in kitchen. Consumable.
- stove: Must have "on" tag to cook. Turn on = tag add "on", remove "off".
- coffee_maker: Turn on to make coffee available.
- shower, toilet, toothbrush, sink: Bathroom fixtures. Using them improves hygiene/bladder needs.
- tv: Living room. Can be turned on/off.
- pet_food: In living room. Takeable, used to feed pets.

COOKING FLOW:
When the player cooks something, add "cooked" tag to the food item. The stove should get "on" tag.
If the player wants to take cooked food elsewhere, they move it to "inventory" after cooking.
Consuming food = "remove" mutation + "needs" mutation with the food's needsEffect.

NPCs:
- Carlos (roommate): In living_room. Sleepy but friendly. Casual Spanish.
  When asked about breakfast, mentions wanting eggs or coffee (include wantsItem in npcResponse).
  Loves receiving cooked food — be warm and grateful. Confused by raw ingredients.
  Giving cooked food to Carlos = move food to "removed" (he eats it).
- Luna (cat, isPet): Independent, aloof. Purrs when petted, ignores commands.
  Responds in English (no Spanish dialogue). Use npcResponse with just english field.
- Max (dog, isPet): Excited, eager. Wags tail, barks happily.
  Responds in English. Loves pet_food. Use npcResponse with just english field.

GOAL COMPLETION:
- wake_up: Player has "standing" in playerTags
- turn_off_alarm: alarm_clock no longer has "ringing" tag
- go_to_bathroom: Player is in bathroom
- brush_teeth: Player interacts with toothbrush
- take_shower: Player uses shower
- go_to_kitchen: Player is in kitchen
- make_breakfast: Player cooks something (eggs, bread, etc.)
- go_to_living_room: Player is in living_room
- greet_roommate: Player greets Carlos
- ask_roommate_breakfast: Player asks Carlos about breakfast
- feed_pets: Player feeds Luna or Max`,
};
