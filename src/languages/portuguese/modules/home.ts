import type { Location, TutorialStep, Quest, VocabWord, GameState, NPC, WorldObject, ModuleDefinition } from '../../../engine/types';

// ============================================================================
// LOCATIONS (exits only — objects are in the flat list below)
// ============================================================================

const locations: Record<string, Location> = {
  bedroom: {
    id: 'bedroom',
    name: { target: 'o quarto', native: 'bedroom' },
    exits: [
      { to: 'bathroom', name: { target: 'o banheiro', native: 'bathroom' } },
      { to: 'living_room', name: { target: 'a sala', native: 'living room' } },
    ],
    verbs: [
      { target: 'eu me levanto', native: 'I get up' },
      { target: 'desligo', native: 'I turn off' },
      { target: 'ligo', native: 'I turn on' },
      { target: 'vou para', native: 'I go to' },
    ],
  },
  bathroom: {
    id: 'bathroom',
    name: { target: 'o banheiro', native: 'bathroom' },
    exits: [
      { to: 'bedroom', name: { target: 'o quarto', native: 'bedroom' } },
      { to: 'living_room', name: { target: 'a sala', native: 'living room' } },
    ],
    verbs: [
      { target: 'tomo banho', native: 'I shower' },
      { target: 'lavo', native: 'I wash' },
      { target: 'escovo', native: 'I brush' },
      { target: 'uso', native: 'I use' },
    ],
  },
  kitchen: {
    id: 'kitchen',
    name: { target: 'a cozinha', native: 'kitchen' },
    exits: [
      { to: 'living_room', name: { target: 'a sala', native: 'living room' } },
    ],
    verbs: [
      { target: 'abro', native: 'I open' },
      { target: 'cozinho', native: 'I cook' },
      { target: 'como', native: 'I eat' },
      { target: 'bebo', native: 'I drink' },
      { target: 'dou', native: 'I give' },
      { target: 'acaricio', native: 'I pet' },
    ],
  },
  living_room: {
    id: 'living_room',
    name: { target: 'a sala', native: 'living room' },
    exits: [
      { to: 'bedroom', name: { target: 'o quarto', native: 'bedroom' } },
      { to: 'bathroom', name: { target: 'o banheiro', native: 'bathroom' } },
      { to: 'kitchen', name: { target: 'a cozinha', native: 'kitchen' } },
      { to: 'module_exit', name: { target: 'a saída', native: 'exit' } },
    ],
    verbs: [
      { target: 'falo com', native: 'I talk to' },
      { target: 'me sento', native: 'I sit down' },
      { target: 'ligo', native: 'I turn on' },
      { target: 'olho', native: 'I look at' },
    ],
  },
  module_exit: {
    id: 'module_exit',
    name: { target: 'a saída', native: 'exit' },
    exits: [],
    verbs: [],
  },
};

// ============================================================================
// OBJECTS (flat list — each knows its own location)
// ============================================================================

const objects: WorldObject[] = [
  // Bedroom
  { id: 'bed', name: { target: 'a cama', native: 'bed' }, location: 'bedroom', tags: [] },
  { id: 'alarm_clock', name: { target: 'o despertador', native: 'alarm clock' }, location: 'bedroom', tags: ['ringing', 'on'] },
  { id: 'window', name: { target: 'a janela', native: 'window' }, location: 'bedroom', tags: ['closed'] },
  { id: 'lamp', name: { target: 'o abajur', native: 'lamp' }, location: 'bedroom', tags: ['off'] },
  { id: 'closet', name: { target: 'o armário', native: 'closet' }, location: 'bedroom', tags: ['closed'] },

  // Bathroom
  { id: 'sink', name: { target: 'a pia', native: 'sink' }, location: 'bathroom', tags: [] },
  { id: 'mirror', name: { target: 'o espelho', native: 'mirror' }, location: 'bathroom', tags: [] },
  { id: 'toilet', name: { target: 'o vaso sanitário', native: 'toilet' }, location: 'bathroom', tags: [] },
  { id: 'shower', name: { target: 'o chuveiro', native: 'shower' }, location: 'bathroom', tags: ['off'] },
  { id: 'toothbrush', name: { target: 'a escova de dentes', native: 'toothbrush' }, location: 'bathroom', tags: [] },
  { id: 'towel', name: { target: 'a toalha', native: 'towel' }, location: 'bathroom', tags: ['takeable'] },
  { id: 'soap', name: { target: 'o sabonete', native: 'soap' }, location: 'bathroom', tags: [] },

  // Kitchen
  { id: 'refrigerator', name: { target: 'a geladeira', native: 'refrigerator' }, location: 'kitchen', tags: ['closed', 'container'] },
  { id: 'stove', name: { target: 'o fogão', native: 'stove' }, location: 'kitchen', tags: ['off'] },
  { id: 'table', name: { target: 'a mesa', native: 'table' }, location: 'kitchen', tags: [] },
  { id: 'chair', name: { target: 'a cadeira', native: 'chair' }, location: 'kitchen', tags: [] },
  { id: 'coffee_maker', name: { target: 'a cafeteira', native: 'coffee maker' }, location: 'kitchen', tags: ['off'] },
  { id: 'kitchen_sink', name: { target: 'a pia da cozinha', native: 'kitchen sink' }, location: 'kitchen', tags: [] },
  { id: 'cup', name: { target: 'a xícara', native: 'cup' }, location: 'kitchen', tags: ['takeable'] },
  { id: 'plate', name: { target: 'o prato', native: 'plate' }, location: 'kitchen', tags: ['takeable'] },
  { id: 'pan', name: { target: 'a frigideira', native: 'pan' }, location: 'kitchen', tags: ['takeable'] },
  { id: 'pet_food', name: { target: 'a ração', native: 'pet food' }, location: 'kitchen', tags: ['takeable'] },

  // Food (inside fridge — location is the container ID)
  { id: 'milk', name: { target: 'o leite', native: 'milk' }, location: 'refrigerator', tags: ['takeable', 'consumable'] },
  { id: 'eggs', name: { target: 'os ovos', native: 'eggs' }, location: 'refrigerator', tags: ['takeable', 'consumable'] },
  { id: 'butter', name: { target: 'a manteiga', native: 'butter' }, location: 'refrigerator', tags: ['takeable'] },
  { id: 'juice', name: { target: 'o suco', native: 'juice' }, location: 'refrigerator', tags: ['takeable', 'consumable'] },

  // Food (on counter)
  { id: 'bread', name: { target: 'o pão', native: 'bread' }, location: 'kitchen', tags: ['takeable', 'consumable'] },
  { id: 'coffee', name: { target: 'o café', native: 'coffee' }, location: 'kitchen', tags: ['takeable', 'consumable'] },
  { id: 'water', name: { target: 'a água', native: 'water' }, location: 'kitchen', tags: ['consumable'] },

  // Living room
  { id: 'couch', name: { target: 'o sofá', native: 'couch' }, location: 'living_room', tags: [] },
  { id: 'tv', name: { target: 'a televisão', native: 'TV' }, location: 'living_room', tags: ['off'] },
  { id: 'coffee_table', name: { target: 'a mesa de centro', native: 'coffee table' }, location: 'living_room', tags: [] },
  { id: 'bookshelf', name: { target: 'a estante', native: 'bookshelf' }, location: 'living_room', tags: [] },
  { id: 'remote', name: { target: 'o controle remoto', native: 'remote control' }, location: 'living_room', tags: ['takeable'] },

  // Street
];

// ============================================================================
// NPCs (pets are NPCs with isPet: true)
// ============================================================================

const npcs: NPC[] = [
  {
    id: 'roommate',
    name: { target: 'Lucas', native: 'Lucas' },
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
    hint: 'Try "Eu me levanto" (I get up)',
    checkComplete: (state: GameState) => state.playerTags.includes('standing'),
    nextStepId: 'turn_off_alarm',
  },
  {
    id: 'turn_off_alarm',
    title: 'Turn off the alarm',
    description: 'The alarm clock is ringing! Turn it off.',
    hint: 'Try "Desligo o despertador" (I turn off the alarm)',
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
    hint: 'Try "Vou para o banheiro" (I go to the bathroom)',
    checkComplete: (state: GameState) => state.currentLocation === 'bathroom',
    nextStepId: 'use_toilet',
  },
  {
    id: 'use_toilet',
    title: 'Use the toilet',
    description: 'You need to use the bathroom.',
    hint: 'Try "Uso o vaso" (I use the toilet)',
    checkComplete: (state: GameState) =>
      state.completedSteps.includes('use_toilet'),
    nextStepId: 'take_shower',
  },
  {
    id: 'take_shower',
    title: 'Take a shower',
    description: 'Freshen up with a nice shower.',
    hint: 'Try "Tomo banho" (I take a shower)',
    checkComplete: (state: GameState) =>
      state.completedSteps.includes('take_shower'),
    nextStepId: 'go_to_living_room',
  },
  {
    id: 'go_to_living_room',
    title: 'Go to the living room',
    description: 'Head to the living room to see your roommate.',
    hint: 'Try "Vou para a sala" (I go to the living room)',
    checkComplete: (state: GameState) => state.currentLocation === 'living_room',
    nextStepId: 'talk_to_lucas',
  },
  {
    id: 'talk_to_lucas',
    title: 'Talk to Lucas',
    description: 'Your roommate Lucas is on the couch. Say hi and chat with him.',
    hint: 'Try "Oi Lucas" or "Bom dia, Lucas"',
    checkComplete: (state: GameState) =>
      state.completedSteps.includes('talk_to_lucas'),
    nextStepId: 'go_to_kitchen',
  },
  {
    id: 'go_to_kitchen',
    title: 'Go to the kitchen',
    description: 'Lucas asked for coffee. Head to the kitchen to grab one.',
    hint: 'Try "Vou para a cozinha" (I go to the kitchen)',
    checkComplete: (state: GameState) => state.currentLocation === 'kitchen',
    nextStepId: 'grab_coffee',
  },
  {
    id: 'grab_coffee',
    title: 'Grab a coffee',
    description: 'Pick up the coffee from the counter.',
    hint: 'Try "Pego o café" (I take the coffee)',
    checkComplete: (state: GameState) => {
      const coffee = state.objects.find(o => o.id === 'coffee');
      return coffee?.location === 'inventory';
    },
    nextStepId: 'give_lucas_coffee',
  },
  {
    id: 'give_lucas_coffee',
    title: 'Bring Lucas his coffee',
    description: 'Bring the coffee to Lucas in the living room.',
    hint: 'Go to the living room and try "Dou o café para o Lucas"',
    checkComplete: (state: GameState) =>
      state.completedQuests.includes('lucas_coffee'),
  },
];

// ============================================================================
// QUESTS
// ============================================================================

const quests: Quest[] = [
  {
    id: 'lucas_coffee',
    title: { target: 'O café do Lucas', native: "Lucas's Coffee" },
    description: 'Bring Lucas a coffee so he can wake up.',
    completionHint: 'Player explicitly says they are giving coffee to Lucas (e.g., "Dou o café para o Lucas"). Just being near Lucas with coffee is NOT enough — the player must say it.',
    hint: 'Grab the coffee from the kitchen and give it to Lucas.',
    source: 'npc',
    sourceId: 'roommate',
    module: 'home',
    triggerCondition: (state: GameState) =>
      state.completedSteps.includes('talk_to_lucas'),
    reward: { points: 100 },
  },
  {
    id: 'lucas_breakfast',
    title: { target: 'O café da manhã do Lucas', native: "Lucas's Breakfast" },
    description: 'Lucas is hungry. Make him some breakfast — anything will do.',
    completionHint: 'Player explicitly says they are giving food to Lucas. Just having food near him is NOT enough — the player must say it.',
    hint: 'Open the fridge, cook something, and bring it to Lucas.',
    source: 'npc',
    sourceId: 'roommate',
    module: 'home',
    triggerCondition: (state: GameState) =>
      state.completedQuests.includes('lucas_coffee'),
    reward: {
      points: 150,
      badge: { id: 'chef_iniciante', name: 'Chef Iniciante' },
    },
    prereqs: ['lucas_coffee'],
  },
];

// ============================================================================
// VOCABULARY
// ============================================================================

const vocabulary: VocabWord[] = [
  // Rooms
  { target: 'o quarto', native: 'bedroom', category: 'noun', gender: 'masculine' },
  { target: 'o banheiro', native: 'bathroom', category: 'noun', gender: 'masculine' },
  { target: 'a cozinha', native: 'kitchen', category: 'noun', gender: 'feminine' },
  // Bedroom objects
  { target: 'a cama', native: 'bed', category: 'noun', gender: 'feminine' },
  { target: 'a janela', native: 'window', category: 'noun', gender: 'feminine' },
  { target: 'o abajur', native: 'lamp', category: 'noun', gender: 'masculine' },
  { target: 'o armário', native: 'closet', category: 'noun', gender: 'masculine' },
  { target: 'o despertador', native: 'alarm clock', category: 'noun', gender: 'masculine' },
  // Bathroom objects
  { target: 'a pia', native: 'sink', category: 'noun', gender: 'feminine' },
  { target: 'o espelho', native: 'mirror', category: 'noun', gender: 'masculine' },
  { target: 'o chuveiro', native: 'shower', category: 'noun', gender: 'masculine' },
  { target: 'a escova de dentes', native: 'toothbrush', category: 'noun', gender: 'feminine' },
  { target: 'a toalha', native: 'towel', category: 'noun', gender: 'feminine' },
  { target: 'o sabonete', native: 'soap', category: 'noun', gender: 'masculine' },
  { target: 'o vaso sanitário', native: 'toilet', category: 'noun', gender: 'masculine' },
  // Kitchen objects
  { target: 'a geladeira', native: 'refrigerator', category: 'noun', gender: 'feminine' },
  { target: 'o fogão', native: 'stove', category: 'noun', gender: 'masculine' },
  { target: 'a mesa', native: 'table', category: 'noun', gender: 'feminine' },
  { target: 'a cadeira', native: 'chair', category: 'noun', gender: 'feminine' },
  { target: 'a xícara', native: 'cup', category: 'noun', gender: 'feminine' },
  { target: 'o prato', native: 'plate', category: 'noun', gender: 'masculine' },
  { target: 'a frigideira', native: 'pan', category: 'noun', gender: 'feminine' },
  { target: 'a cafeteira', native: 'coffee maker', category: 'noun', gender: 'feminine' },
  { target: 'a pia da cozinha', native: 'kitchen sink', category: 'noun', gender: 'feminine' },
  { target: 'a ração', native: 'pet food', category: 'noun', gender: 'feminine' },
  // Food
  { target: 'o leite', native: 'milk', category: 'noun', gender: 'masculine' },
  { target: 'os ovos', native: 'eggs', category: 'noun', gender: 'masculine' },
  { target: 'o pão', native: 'bread', category: 'noun', gender: 'masculine' },
  { target: 'a manteiga', native: 'butter', category: 'noun', gender: 'feminine' },
  { target: 'o café', native: 'coffee', category: 'noun', gender: 'masculine' },
  { target: 'a água', native: 'water', category: 'noun', gender: 'feminine' },
  { target: 'o suco', native: 'juice', category: 'noun', gender: 'masculine' },
  // Verbs
  { target: 'eu acordo', native: 'I wake up', category: 'verb' },
  { target: 'eu me levanto', native: 'I get up', category: 'verb' },
  { target: 'abro', native: 'I open', category: 'verb' },
  { target: 'fecho', native: 'I close', category: 'verb' },
  { target: 'ligo', native: 'I turn on', category: 'verb' },
  { target: 'desligo', native: 'I turn off', category: 'verb' },
  { target: 'pego', native: 'I take/grab', category: 'verb' },
  { target: 'como', native: 'I eat', category: 'verb' },
  { target: 'cozinho', native: 'I cook', category: 'verb' },
  { target: 'lavo', native: 'I wash', category: 'verb' },
  { target: 'escovo', native: 'I brush', category: 'verb' },
  { target: 'tomo banho', native: 'I shower', category: 'verb' },
  { target: 'coloco', native: 'I put', category: 'verb' },
  { target: 'vou', native: 'I go', category: 'verb' },
  { target: 'uso', native: 'I use', category: 'verb' },
  // Living room
  { target: 'a sala', native: 'living room', category: 'noun', gender: 'feminine' },
  { target: 'o sofá', native: 'couch', category: 'noun', gender: 'masculine' },
  { target: 'a televisão', native: 'TV', category: 'noun', gender: 'feminine' },
  { target: 'a mesa de centro', native: 'coffee table', category: 'noun', gender: 'feminine' },
  { target: 'a estante', native: 'bookshelf', category: 'noun', gender: 'feminine' },
  { target: 'o controle remoto', native: 'remote control', category: 'noun', gender: 'masculine' },
  // Pets
  { target: 'o gato', native: 'cat', category: 'noun', gender: 'masculine' },
  { target: 'o cachorro', native: 'dog', category: 'noun', gender: 'masculine' },
  { target: 'o animal de estimação', native: 'pet', category: 'noun', gender: 'masculine' },
  { target: 'a ração', native: 'pet food', category: 'noun', gender: 'feminine' },
  // Conversation
  { target: 'falo com', native: 'I talk to', category: 'verb' },
  { target: 'pergunto', native: 'I ask', category: 'verb' },
  { target: 'dou', native: 'I give', category: 'verb' },
  { target: 'acaricio', native: 'I pet/stroke', category: 'verb' },
  { target: 'brinco com', native: 'I play with', category: 'verb' },
  // Greetings
  { target: 'oi', native: 'hi', category: 'other' },
  { target: 'bom dia', native: 'good morning', category: 'other' },
  { target: 'o que você quer?', native: 'what do you want?', category: 'other' },
  // Other
  { target: 'para', native: 'to/for', category: 'other' },
  { target: 'de', native: 'of/from', category: 'other' },
  { target: 'o', native: 'the (masc.)', category: 'other' },
  { target: 'a', native: 'the (fem.)', category: 'other' },
  { target: 'e', native: 'and', category: 'other' },
  { target: 'com', native: 'with', category: 'other' },
  { target: 'no/na', native: 'in the', category: 'other' },
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
  locationIds: Object.keys(locations).filter(id => id !== 'module_exit'),
  unlockLevel: 1,

  guidance: `HOME ENVIRONMENT:
A cozy apartment shared with roommate Lucas and two pets (Luna the cat, Max the dog).
The player is learning daily routine vocabulary in Brazilian Portuguese.

OBJECTS:
- alarm_clock: Digital alarm in bedroom, starts ringing. Turn off = remove "ringing" and "on" tags.
- bed: Player starts here in_bed. Getting up = playerTag add "standing", remove "in_bed".
- window, lamp, closet: Can be opened/closed or turned on/off via tag changes.
- refrigerator: Container in kitchen. Must have "open" tag (remove "closed") to access items inside.
  Items inside have location="refrigerator". When fridge is open, they're accessible.
- eggs: In fridge. Can be cooked (add "cooked" tag), taken to inventory, eaten, or given to Lucas.
- milk, butter, juice: In fridge. Takeable, some consumable.
- bread, coffee, water: On counter in kitchen. Consumable.
- stove: Must have "on" tag to cook. Turn on = tag add "on", remove "off".
- coffee_maker: Turn on to make coffee available.
- kitchen_sink: Kitchen sink. Can be used to wash dishes or hands.
- toilet: Using it relieves the player. Emit status mutation: { "type": "status", "remove": ["needs_bathroom", "urgent_bathroom", "desperate_bathroom"] }
- shower: Using it cleans the player. Emit status mutation: { "type": "status", "remove": ["needs_shower", "dirty", "very_dirty"] }
- toothbrush, sink: Bathroom fixtures. Using them improves hygiene slightly.
- tv: Living room. Can be turned on/off.
- pet_food: In kitchen. Takeable, used to feed pets.

COOKING FLOW:
When the player cooks something, add "cooked" tag to the food item. The stove should get "on" tag.
If the player wants to take cooked food elsewhere, they move it to "inventory" after cooking.
Consuming food = "remove" mutation + status mutation: { "type": "status", "remove": ["hungry", "very_hungry", "starving"] }. Coffee also removes tiredness: { "type": "status", "remove": ["tired", "very_tired", "exhausted"] }

NPCs:
- Lucas (roommate): In living_room. Very sleepy, barely awake. Casual Brazilian Portuguese.
  When the player first talks to him, he asks for coffee ("Preciso de café..." / "Você me traz um café?").
  Giving coffee to Lucas = move coffee to "removed" (he drinks it). He wakes up and thanks them.
  After coffee, if the player talks to him again, he mentions being hungry.
  Giving food to Lucas = move food to "removed" (he eats it). He thanks them warmly.
- Luna (cat, isPet): In kitchen. Independent, aloof. Purrs when petted, ignores commands.
  Responds in English (no Portuguese dialogue). Use npcResponse with just english field.
- Max (dog, isPet): In kitchen. Excited, eager. Wags tail, barks happily.
  Responds in English. Loves pet_food. Use npcResponse with just english field.

STEP COMPLETION (lax — complete as soon as the intent is clear):
- wake_up: Player has "standing" in playerTags
- turn_off_alarm: alarm_clock no longer has "ringing" tag
- go_to_bathroom: Player is in bathroom
- use_toilet: Player uses the toilet
- take_shower: Player takes a shower
- go_to_living_room: Player is in living_room
- talk_to_lucas: Player talks to Lucas. Lucas should ask for coffee (he's very sleepy).
- go_to_kitchen: Player is in kitchen
- grab_coffee: Player takes coffee to inventory
- give_lucas_coffee: Completed when lucas_coffee quest completes (player must explicitly give coffee)`,
};
