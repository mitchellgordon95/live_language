import type { Location, TutorialStep, Quest, VocabWord, GameState, NPC, WorldObject, ModuleDefinition } from '../../../engine/types.js';

// ============================================================================
// LOCATIONS (exits only — objects are in the flat list below)
// ============================================================================

const locations: Record<string, Location> = {
  bedroom: {
    id: 'bedroom',
    name: { target: 'el dormitorio', native: 'bedroom' },
    exits: [
      { to: 'bathroom', name: { target: 'el baño', native: 'bathroom' } },
      { to: 'living_room', name: { target: 'la sala', native: 'living room' } },
    ],
    verbs: [
      { target: 'me levanto', native: 'I get up' },
      { target: 'apago', native: 'I turn off' },
      { target: 'enciendo', native: 'I turn on' },
      { target: 'voy a', native: 'I go to' },
    ],
  },
  bathroom: {
    id: 'bathroom',
    name: { target: 'el baño', native: 'bathroom' },
    exits: [
      { to: 'bedroom', name: { target: 'el dormitorio', native: 'bedroom' } },
      { to: 'living_room', name: { target: 'la sala', native: 'living room' } },
    ],
    verbs: [
      { target: 'me ducho', native: 'I shower' },
      { target: 'me lavo', native: 'I wash' },
      { target: 'me cepillo', native: 'I brush' },
      { target: 'uso', native: 'I use' },
    ],
  },
  kitchen: {
    id: 'kitchen',
    name: { target: 'la cocina', native: 'kitchen' },
    exits: [
      { to: 'living_room', name: { target: 'la sala', native: 'living room' } },
    ],
    verbs: [
      { target: 'abro', native: 'I open' },
      { target: 'cocino', native: 'I cook' },
      { target: 'como', native: 'I eat' },
      { target: 'tomo', native: 'I drink' },
      { target: 'le doy', native: 'I give' },
      { target: 'acaricio', native: 'I pet' },
    ],
  },
  living_room: {
    id: 'living_room',
    name: { target: 'la sala', native: 'living room' },
    exits: [
      { to: 'bedroom', name: { target: 'el dormitorio', native: 'bedroom' } },
      { to: 'bathroom', name: { target: 'el baño', native: 'bathroom' } },
      { to: 'kitchen', name: { target: 'la cocina', native: 'kitchen' } },
      { to: 'street', name: { target: 'la calle', native: 'street' } },
    ],
    verbs: [
      { target: 'hablo con', native: 'I talk to' },
      { target: 'me siento', native: 'I sit down' },
      { target: 'enciendo', native: 'I turn on' },
      { target: 'miro', native: 'I look at' },
    ],
  },
  street: {
    id: 'street',
    name: { target: 'la calle', native: 'street' },
    exits: [
      { to: 'living_room', name: { target: 'la casa', native: 'home' } },
      { to: 'restaurant_entrance', name: { target: 'el restaurante', native: 'restaurant' } },
    ],
    verbs: [
      { target: 'voy a', native: 'I go to' },
      { target: 'camino', native: 'I walk' },
      { target: 'miro', native: 'I look at' },
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
  { id: 'toilet', name: { target: 'el inodoro', native: 'toilet' }, location: 'bathroom', tags: [], needsEffect: { bladder: 100 } },
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
  { id: 'coffee', name: { target: 'el café', native: 'coffee' }, location: 'kitchen', tags: ['takeable', 'consumable'], needsEffect: { energy: 20 } },
  { id: 'water', name: { target: 'el agua', native: 'water' }, location: 'kitchen', tags: ['consumable'], needsEffect: { hunger: 5 } },

  // Living room
  { id: 'couch', name: { target: 'el sofá', native: 'couch' }, location: 'living_room', tags: [] },
  { id: 'tv', name: { target: 'la televisión', native: 'TV' }, location: 'living_room', tags: ['off'] },
  { id: 'coffee_table', name: { target: 'la mesa de centro', native: 'coffee table' }, location: 'living_room', tags: [] },
  { id: 'bookshelf', name: { target: 'la estantería', native: 'bookshelf' }, location: 'living_room', tags: [] },
  { id: 'remote', name: { target: 'el control remoto', native: 'remote control' }, location: 'living_room', tags: ['takeable'] },
  { id: 'pet_food', name: { target: 'la comida para mascotas', native: 'pet food' }, location: 'kitchen', tags: ['takeable'] },

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
    personality: 'Very sleepy roommate. Just woke up, sitting on the couch, barely awake. Will ask the player for coffee when they talk to him. After getting coffee, mentions being hungry. Grateful and casual.',
    gender: 'male',
    appearance: 'A friendly young man in his mid-20s with light skin and messy brown hair. Wearing a gray hoodie, sitting on a couch with a sleepy half-smile, holding a coffee mug.',
  },
  {
    id: 'cat',
    name: { target: 'Luna', native: 'Luna (cat)' },
    location: 'kitchen',
    personality: 'Independent and aloof cat. Occasionally affectionate. Purrs when petted, ignores most commands.',
    isPet: true,
    appearance: 'A calico cat with patches of orange, black, and white. Slightly aloof with half-closed eyes. Elegant and independent.',
  },
  {
    id: 'dog',
    name: { target: 'Max', native: 'Max (dog)' },
    location: 'kitchen',
    personality: 'Excited and hungry dog. Always wants attention and food. Wags tail enthusiastically.',
    isPet: true,
    appearance: 'A golden retriever with bright eyes and an eager expression. Tongue slightly out, tail always mid-wag. Joyful energy.',
  },
];

// ============================================================================
// GOALS (checkComplete uses new state model)
// ============================================================================

const tutorial: TutorialStep[] = [
  {
    id: 'wake_up',
    title: 'Get out of bed',
    description: 'You just woke up. Get out of bed to start your day.',
    hint: 'Try "Me levanto" (I get up)',
    checkComplete: (state: GameState) => state.playerTags.includes('standing'),
    nextStepId: 'turn_off_alarm',
  },
  {
    id: 'turn_off_alarm',
    title: 'Turn off the alarm',
    description: 'The alarm clock is ringing! Turn it off.',
    hint: 'Try "Apago el despertador" (I turn off the alarm)',
    checkComplete: (state: GameState) => {
      const alarm = state.objects.find(o => o.id === 'alarm_clock');
      return alarm ? !alarm.tags.includes('ringing') : false;
    },
    nextStepId: 'go_to_bathroom',
  },
  {
    id: 'go_to_bathroom',
    title: 'Go to the bathroom',
    description: 'Time to get ready for the day.',
    hint: 'Try "Voy al baño" (I go to the bathroom)',
    checkComplete: (state: GameState) => state.currentLocation === 'bathroom',
    nextStepId: 'use_toilet',
  },
  {
    id: 'use_toilet',
    title: 'Use the toilet',
    description: 'You need to use the bathroom.',
    hint: 'Try "Uso el inodoro" (I use the toilet)',
    checkComplete: (state: GameState) =>
      state.completedSteps.includes('use_toilet'),
    nextStepId: 'take_shower',
  },
  {
    id: 'take_shower',
    title: 'Take a shower',
    description: 'Freshen up with a nice shower.',
    hint: 'Try "Me ducho" (I shower)',
    checkComplete: (state: GameState) =>
      state.completedSteps.includes('take_shower'),
    nextStepId: 'go_to_living_room',
  },
  {
    id: 'go_to_living_room',
    title: 'Go to the living room',
    description: 'Head to the living room to see your roommate.',
    hint: 'Try "Voy a la sala" (I go to the living room)',
    checkComplete: (state: GameState) => state.currentLocation === 'living_room',
    nextStepId: 'talk_to_carlos',
  },
  {
    id: 'talk_to_carlos',
    title: 'Talk to Carlos',
    description: 'Your roommate Carlos is on the couch. Say hi and chat with him.',
    hint: 'Try "Hola Carlos" or "Buenos días, Carlos"',
    checkComplete: (state: GameState) =>
      state.completedSteps.includes('talk_to_carlos'),
    nextStepId: 'go_to_kitchen',
  },
  {
    id: 'go_to_kitchen',
    title: 'Go to the kitchen',
    description: 'Carlos asked for coffee. Head to the kitchen to grab one.',
    hint: 'Try "Voy a la cocina" (I go to the kitchen)',
    checkComplete: (state: GameState) => state.currentLocation === 'kitchen',
    nextStepId: 'grab_coffee',
  },
  {
    id: 'grab_coffee',
    title: 'Grab a coffee',
    description: 'Pick up the coffee from the counter.',
    hint: 'Try "Tomo el café" (I take the coffee)',
    checkComplete: (state: GameState) => {
      const coffee = state.objects.find(o => o.id === 'coffee');
      return coffee?.location === 'inventory';
    },
    nextStepId: 'give_carlos_coffee',
  },
  {
    id: 'give_carlos_coffee',
    title: 'Bring Carlos his coffee',
    description: 'Bring the coffee to Carlos in the living room.',
    hint: 'Go to the living room and try "Le doy el café a Carlos"',
    checkComplete: (state: GameState) =>
      state.completedQuests.includes('carlos_coffee'),
  },
];

// ============================================================================
// QUESTS
// ============================================================================

const quests: Quest[] = [
  {
    id: 'carlos_coffee',
    title: { target: 'El café de Carlos', native: "Carlos's Coffee" },
    description: 'Bring Carlos a coffee so he can wake up.',
    completionHint: 'Player explicitly says they are giving coffee to Carlos (e.g., "Le doy el café a Carlos"). Just being near Carlos with coffee is NOT enough — the player must say it.',
    hint: 'Grab the coffee from the kitchen and give it to Carlos.',
    source: 'npc',
    sourceId: 'roommate',
    module: 'home',
    triggerCondition: (state: GameState) =>
      state.completedSteps.includes('talk_to_carlos'),
    reward: { points: 100 },
  },
  {
    id: 'carlos_breakfast',
    title: { target: 'El desayuno de Carlos', native: "Carlos's Breakfast" },
    description: 'Carlos is hungry. Make him some breakfast — anything will do.',
    completionHint: 'Player explicitly says they are giving food to Carlos. Just having food near him is NOT enough — the player must say it.',
    hint: 'Open the fridge, cook something, and bring it to Carlos.',
    source: 'npc',
    sourceId: 'roommate',
    module: 'home',
    triggerCondition: (state: GameState) =>
      state.completedQuests.includes('carlos_coffee'),
    reward: {
      points: 150,
      badge: { id: 'chef_novato', name: 'Chef Novato' },
    },
    prereqs: ['carlos_coffee'],
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
  tutorial,
  quests,
  vocabulary,
  startLocationId: 'bedroom',
  firstStepId: 'wake_up',
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
- toilet: Using it ALWAYS sets bladder to full. Emit needs mutation { bladder: 100 } (additive, clamped to 100).
- shower: Using it improves hygiene significantly. Emit needs mutation { hygiene: 40 }.
- toothbrush, sink: Bathroom fixtures. Using them improves hygiene slightly.
- tv: Living room. Can be turned on/off.
- pet_food: In kitchen. Takeable, used to feed pets.

COOKING FLOW:
When the player cooks something, add "cooked" tag to the food item. The stove should get "on" tag.
If the player wants to take cooked food elsewhere, they move it to "inventory" after cooking.
Consuming food = "remove" mutation + "needs" mutation with the food's needsEffect.

NPCs:
- Carlos (roommate): In living_room. Very sleepy, barely awake. Casual Spanish.
  When the player first talks to him, he asks for coffee ("Necesito café..." / "¿Me traes un café?").
  Giving coffee to Carlos = move coffee to "removed" (he drinks it). He wakes up and thanks them.
  After coffee, if the player talks to him again, he mentions being hungry.
  Giving food to Carlos = move food to "removed" (he eats it). He thanks them warmly.
- Luna (cat, isPet): In kitchen. Independent, aloof. Purrs when petted, ignores commands.
  Responds in English (no Spanish dialogue). Use npcResponse with just english field.
- Max (dog, isPet): In kitchen. Excited, eager. Wags tail, barks happily.
  Responds in English. Loves pet_food. Use npcResponse with just english field.

STEP COMPLETION (lax — complete as soon as the intent is clear):
- wake_up: Player has "standing" in playerTags
- turn_off_alarm: alarm_clock no longer has "ringing" tag
- go_to_bathroom: Player is in bathroom
- use_toilet: Player uses the toilet
- take_shower: Player takes a shower
- go_to_living_room: Player is in living_room
- talk_to_carlos: Player talks to Carlos. Carlos should ask for coffee (he's very sleepy).
- go_to_kitchen: Player is in kitchen
- grab_coffee: Player takes coffee to inventory
- give_carlos_coffee: Completed when carlos_coffee quest completes (player must explicitly give coffee)`,
};
