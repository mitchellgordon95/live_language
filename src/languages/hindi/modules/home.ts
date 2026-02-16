import type { Location, TutorialStep, Quest, VocabWord, GameState, NPC, WorldObject, ModuleDefinition } from '../../../engine/types';

// ============================================================================
// LOCATIONS (exits only — objects are in the flat list below)
// ============================================================================

const locations: Record<string, Location> = {
  bedroom: {
    id: 'bedroom',
    name: { target: 'शयनकक्ष (shayanakaksh)', native: 'bedroom' },
    exits: [
      { to: 'bathroom', name: { target: 'बाथरूम (bathroom)', native: 'bathroom' } },
      { to: 'living_room', name: { target: 'बैठक (baithak)', native: 'living room' } },
    ],
    verbs: [
      { target: 'उठना (uthna)', native: 'I get up' },
      { target: 'बंद करना (band karna)', native: 'I turn off' },
      { target: 'चालू करना (chaalu karna)', native: 'I turn on' },
      { target: 'जाना (jaana)', native: 'I go to' },
    ],
  },
  bathroom: {
    id: 'bathroom',
    name: { target: 'बाथरूम (bathroom)', native: 'bathroom' },
    exits: [
      { to: 'bedroom', name: { target: 'शयनकक्ष (shayanakaksh)', native: 'bedroom' } },
      { to: 'living_room', name: { target: 'बैठक (baithak)', native: 'living room' } },
    ],
    verbs: [
      { target: 'नहाना (nahaana)', native: 'I shower' },
      { target: 'धोना (dhona)', native: 'I wash' },
      { target: 'ब्रश करना (brush karna)', native: 'I brush teeth' },
      { target: 'इस्तेमाल करना (istemaal karna)', native: 'I use' },
    ],
  },
  kitchen: {
    id: 'kitchen',
    name: { target: 'रसोई (rasoi)', native: 'kitchen' },
    exits: [
      { to: 'living_room', name: { target: 'बैठक (baithak)', native: 'living room' } },
    ],
    verbs: [
      { target: 'खोलना (kholna)', native: 'I open' },
      { target: 'पकाना (pakaana)', native: 'I cook' },
      { target: 'खाना (khaana)', native: 'I eat' },
      { target: 'पीना (peena)', native: 'I drink' },
      { target: 'देना (dena)', native: 'I give' },
      { target: 'सहलाना (sahlaana)', native: 'I pet' },
    ],
  },
  living_room: {
    id: 'living_room',
    name: { target: 'बैठक (baithak)', native: 'living room' },
    exits: [
      { to: 'bedroom', name: { target: 'शयनकक्ष (shayanakaksh)', native: 'bedroom' } },
      { to: 'bathroom', name: { target: 'बाथरूम (bathroom)', native: 'bathroom' } },
      { to: 'kitchen', name: { target: 'रसोई (rasoi)', native: 'kitchen' } },
      { to: 'street', name: { target: 'सड़क (sadak)', native: 'street' } },
    ],
    verbs: [
      { target: '...से बात करना (...se baat karna)', native: 'I talk to' },
      { target: 'बैठना (baithna)', native: 'I sit down' },
      { target: 'चालू करना (chaalu karna)', native: 'I turn on' },
      { target: 'देखना (dekhna)', native: 'I look at' },
    ],
  },
  street: {
    id: 'street',
    name: { target: 'सड़क (sadak)', native: 'street' },
    exits: [
      { to: 'living_room', name: { target: 'घर (ghar)', native: 'home' } },
    ],
    verbs: [
      { target: 'जाना (jaana)', native: 'I go to' },
      { target: 'चलना (chalna)', native: 'I walk' },
      { target: 'देखना (dekhna)', native: 'I look at' },
    ],
  },
};

// ============================================================================
// OBJECTS (flat list — each knows its own location)
// ============================================================================

const objects: WorldObject[] = [
  // Bedroom
  { id: 'bed', name: { target: 'बिस्तर (bistar)', native: 'bed' }, location: 'bedroom', tags: [] },
  { id: 'alarm_clock', name: { target: 'अलार्म घड़ी (alarm ghadi)', native: 'alarm clock' }, location: 'bedroom', tags: ['ringing', 'on'] },
  { id: 'window', name: { target: 'खिड़की (khidki)', native: 'window' }, location: 'bedroom', tags: ['closed'] },
  { id: 'lamp', name: { target: 'लैम्प (lamp)', native: 'lamp' }, location: 'bedroom', tags: ['off'] },
  { id: 'closet', name: { target: 'अलमारी (almaari)', native: 'closet' }, location: 'bedroom', tags: ['closed'] },

  // Bathroom
  { id: 'sink', name: { target: 'वॉशबेसिन (washbasin)', native: 'sink' }, location: 'bathroom', tags: [] },
  { id: 'mirror', name: { target: 'शीशा (sheesha)', native: 'mirror' }, location: 'bathroom', tags: [] },
  { id: 'toilet', name: { target: 'टॉयलेट (toilet)', native: 'toilet' }, location: 'bathroom', tags: [], needsEffect: { bladder: 100 } },
  { id: 'shower', name: { target: 'शावर (shower)', native: 'shower' }, location: 'bathroom', tags: ['off'] },
  { id: 'toothbrush', name: { target: 'टूथब्रश (toothbrush)', native: 'toothbrush' }, location: 'bathroom', tags: [] },
  { id: 'towel', name: { target: 'तौलिया (tauliya)', native: 'towel' }, location: 'bathroom', tags: ['takeable'] },
  { id: 'soap', name: { target: 'साबुन (saabun)', native: 'soap' }, location: 'bathroom', tags: [] },

  // Kitchen
  { id: 'refrigerator', name: { target: 'फ्रिज (fridge)', native: 'refrigerator' }, location: 'kitchen', tags: ['closed', 'container'] },
  { id: 'stove', name: { target: 'चूल्हा (chulha)', native: 'stove' }, location: 'kitchen', tags: ['off'] },
  { id: 'table', name: { target: 'मेज़ (mez)', native: 'table' }, location: 'kitchen', tags: [] },
  { id: 'chair', name: { target: 'कुर्सी (kursi)', native: 'chair' }, location: 'kitchen', tags: [] },
  { id: 'coffee_maker', name: { target: 'कॉफ़ी मशीन (coffee machine)', native: 'coffee maker' }, location: 'kitchen', tags: ['off'] },
  { id: 'kitchen_sink', name: { target: 'सिंक (sink)', native: 'kitchen sink' }, location: 'kitchen', tags: [] },
  { id: 'cup', name: { target: 'कप (cup)', native: 'cup' }, location: 'kitchen', tags: ['takeable'] },
  { id: 'plate', name: { target: 'थाली (thaali)', native: 'plate' }, location: 'kitchen', tags: ['takeable'] },
  { id: 'pan', name: { target: 'कड़ाही (kadaahi)', native: 'pan' }, location: 'kitchen', tags: ['takeable'] },
  { id: 'pet_food', name: { target: 'पालतू जानवर का खाना (paaltoo jaanvar ka khaana)', native: 'pet food' }, location: 'kitchen', tags: ['takeable'] },

  // Food (inside fridge)
  { id: 'milk', name: { target: 'दूध (doodh)', native: 'milk' }, location: 'refrigerator', tags: ['takeable', 'consumable'], needsEffect: { hunger: 10 } },
  { id: 'eggs', name: { target: 'अंडे (ande)', native: 'eggs' }, location: 'refrigerator', tags: ['takeable', 'consumable'], needsEffect: { hunger: 25 } },
  { id: 'butter', name: { target: 'मक्खन (makkhan)', native: 'butter' }, location: 'refrigerator', tags: ['takeable'] },
  { id: 'juice', name: { target: 'जूस (juice)', native: 'juice' }, location: 'refrigerator', tags: ['takeable', 'consumable'], needsEffect: { hunger: 10 } },

  // Food (on counter)
  { id: 'bread', name: { target: 'ब्रेड (bread)', native: 'bread' }, location: 'kitchen', tags: ['takeable', 'consumable'], needsEffect: { hunger: 15 } },
  { id: 'coffee', name: { target: 'कॉफ़ी (coffee)', native: 'coffee' }, location: 'kitchen', tags: ['takeable', 'consumable'], needsEffect: { energy: 20 } },
  { id: 'water', name: { target: 'पानी (paani)', native: 'water' }, location: 'kitchen', tags: ['consumable'], needsEffect: { hunger: 5 } },

  // Living room
  { id: 'couch', name: { target: 'सोफ़ा (sofa)', native: 'couch' }, location: 'living_room', tags: [] },
  { id: 'tv', name: { target: 'टीवी (TV)', native: 'TV' }, location: 'living_room', tags: ['off'] },
  { id: 'coffee_table', name: { target: 'छोटी मेज़ (chhoti mez)', native: 'coffee table' }, location: 'living_room', tags: [] },
  { id: 'bookshelf', name: { target: 'किताबों की अलमारी (kitaabon ki almaari)', native: 'bookshelf' }, location: 'living_room', tags: [] },
  { id: 'remote', name: { target: 'रिमोट (remote)', native: 'remote control' }, location: 'living_room', tags: ['takeable'] },

  // Street
  { id: 'streetlamp', name: { target: 'सड़क का लैम्प (sadak ka lamp)', native: 'streetlamp' }, location: 'street', tags: ['on'] },
  { id: 'bench', name: { target: 'बेंच (bench)', native: 'bench' }, location: 'street', tags: [] },
];

// ============================================================================
// NPCs (pets are NPCs with isPet: true)
// ============================================================================

const npcs: NPC[] = [
  {
    id: 'roommate',
    name: { target: 'राज (Raj)', native: 'Raj' },
    location: 'living_room',
    personality: 'Very sleepy roommate. Just woke up, sitting on the couch, barely awake. Will ask the player for coffee when they talk to him. After getting coffee, mentions being hungry. Grateful and casual. Speaks informal Hindi using तुम form.',
    gender: 'male',
    appearance: 'A friendly young man in his mid-20s with dark hair and a short beard. Wearing a kurta and pajamas, sitting on a couch with a sleepy half-smile, holding a coffee mug.',
  },
  {
    id: 'cat',
    name: { target: 'मिट्ठू (Mitthu)', native: 'Mitthu (cat)' },
    location: 'kitchen',
    personality: 'Independent and aloof cat. Occasionally affectionate. Purrs when petted, ignores most commands.',
    isPet: true,
    appearance: 'A sleek gray cat with bright green eyes. Slightly aloof with half-closed eyes. Elegant and independent.',
  },
  {
    id: 'dog',
    name: { target: 'मोती (Moti)', native: 'Moti (dog)' },
    location: 'kitchen',
    personality: 'Excited and hungry dog. Always wants attention and food. Wags tail enthusiastically.',
    isPet: true,
    appearance: 'A golden-brown Indian pariah dog with bright eyes and an eager expression. Tongue slightly out, tail always mid-wag. Joyful energy.',
  },
];

// ============================================================================
// TUTORIAL STEPS
// ============================================================================

const tutorial: TutorialStep[] = [
  {
    id: 'wake_up',
    title: 'Get out of bed',
    description: 'You just woke up. Get out of bed to start your day.',
    hint: 'Say "मैं उठता हूँ (main uthta hoon)" — I get up',
    checkComplete: (state: GameState) => state.playerTags.includes('standing'),
    nextStepId: 'turn_off_alarm',
  },
  {
    id: 'turn_off_alarm',
    title: 'Turn off the alarm',
    description: 'The alarm clock is ringing! Turn it off.',
    hint: 'Say "अलार्म बंद करो (alarm band karo)" — turn off the alarm',
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
    hint: 'Say "बाथरूम जाओ (bathroom jao)" — go to the bathroom',
    checkComplete: (state: GameState) => state.currentLocation === 'bathroom',
    nextStepId: 'use_toilet',
  },
  {
    id: 'use_toilet',
    title: 'Use the toilet',
    description: 'You need to use the bathroom.',
    hint: 'Say "टॉयलेट इस्तेमाल करो (toilet istemaal karo)"',
    checkComplete: (state: GameState) =>
      state.completedSteps.includes('use_toilet'),
    nextStepId: 'take_shower',
  },
  {
    id: 'take_shower',
    title: 'Take a shower',
    description: 'Freshen up with a nice shower.',
    hint: 'Say "मैं नहाता हूँ (main nahaata hoon)" — I take a shower',
    checkComplete: (state: GameState) =>
      state.completedSteps.includes('take_shower'),
    nextStepId: 'go_to_living_room',
  },
  {
    id: 'go_to_living_room',
    title: 'Go to the living room',
    description: 'Head to the living room to see your roommate.',
    hint: 'Say "बैठक में जाओ (baithak mein jao)" — go to the living room',
    checkComplete: (state: GameState) => state.currentLocation === 'living_room',
    nextStepId: 'talk_to_raj',
  },
  {
    id: 'talk_to_raj',
    title: 'Talk to Raj',
    description: 'Your roommate Raj is on the couch. Say hi and chat with him.',
    hint: 'Say "नमस्ते राज (namaste Raj)" or "सुप्रभात (suprabhat)"',
    checkComplete: (state: GameState) =>
      state.completedSteps.includes('talk_to_raj'),
    nextStepId: 'go_to_kitchen',
  },
  {
    id: 'go_to_kitchen',
    title: 'Go to the kitchen',
    description: 'Raj asked for coffee. Head to the kitchen to grab one.',
    hint: 'Say "रसोई में जाओ (rasoi mein jao)" — go to the kitchen',
    checkComplete: (state: GameState) => state.currentLocation === 'kitchen',
    nextStepId: 'grab_coffee',
  },
  {
    id: 'grab_coffee',
    title: 'Grab a coffee',
    description: 'Pick up the coffee from the counter.',
    hint: 'Say "कॉफ़ी लो (coffee lo)" — take the coffee',
    checkComplete: (state: GameState) => {
      const coffee = state.objects.find(o => o.id === 'coffee');
      return coffee?.location === 'inventory';
    },
    nextStepId: 'give_raj_coffee',
  },
  {
    id: 'give_raj_coffee',
    title: 'Bring Raj his coffee',
    description: 'Bring the coffee to Raj in the living room.',
    hint: 'Go to the living room and say "राज को कॉफ़ी दो (Raj ko coffee do)"',
    checkComplete: (state: GameState) =>
      state.completedQuests.includes('raj_coffee'),
  },
];

// ============================================================================
// QUESTS
// ============================================================================

const quests: Quest[] = [
  {
    id: 'raj_coffee',
    title: { target: 'राज की कॉफ़ी (Raj ki coffee)', native: "Raj's Coffee" },
    description: 'Bring Raj a coffee so he can wake up.',
    completionHint: 'Player explicitly says they are giving coffee to Raj (e.g., "राज को कॉफ़ी दो"). Just being near Raj with coffee is NOT enough — the player must say it.',
    hint: 'Grab the coffee from the kitchen and give it to Raj.',
    source: 'npc',
    sourceId: 'roommate',
    module: 'home',
    triggerCondition: (state: GameState) =>
      state.completedSteps.includes('talk_to_raj'),
    reward: { points: 100 },
    autoStart: true,
  },
  {
    id: 'raj_breakfast',
    title: { target: 'राज का नाश्ता (Raj ka naashta)', native: "Raj's Breakfast" },
    description: 'Raj is hungry. Make him some breakfast — anything will do.',
    completionHint: 'Player explicitly says they are giving food to Raj. Just having food near him is NOT enough — the player must say it.',
    hint: 'Open the fridge, cook something, and bring it to Raj.',
    source: 'npc',
    sourceId: 'roommate',
    module: 'home',
    triggerCondition: (state: GameState) =>
      state.completedQuests.includes('raj_coffee'),
    reward: {
      points: 150,
      badge: { id: 'naya_rasiya', name: 'नया रसोइया (Beginner Chef)' },
    },
    prereqs: ['raj_coffee'],
  },
];

// ============================================================================
// VOCABULARY
// ============================================================================

const vocabulary: VocabWord[] = [
  // Rooms
  { target: 'शयनकक्ष', native: 'bedroom', category: 'noun' },
  { target: 'बाथरूम', native: 'bathroom', category: 'noun' },
  { target: 'रसोई', native: 'kitchen', category: 'noun' },
  { target: 'बैठक', native: 'living room', category: 'noun' },
  { target: 'सड़क', native: 'street', category: 'noun' },

  // Bedroom objects
  { target: 'बिस्तर', native: 'bed', category: 'noun' },
  { target: 'खिड़की', native: 'window', category: 'noun' },
  { target: 'लैम्प', native: 'lamp', category: 'noun' },
  { target: 'अलमारी', native: 'closet', category: 'noun' },
  { target: 'अलार्म घड़ी', native: 'alarm clock', category: 'noun' },

  // Bathroom objects
  { target: 'वॉशबेसिन', native: 'sink', category: 'noun' },
  { target: 'शीशा', native: 'mirror', category: 'noun' },
  { target: 'शावर', native: 'shower', category: 'noun' },
  { target: 'टूथब्रश', native: 'toothbrush', category: 'noun' },
  { target: 'तौलिया', native: 'towel', category: 'noun' },
  { target: 'साबुन', native: 'soap', category: 'noun' },
  { target: 'टॉयलेट', native: 'toilet', category: 'noun' },

  // Kitchen objects
  { target: 'फ्रिज', native: 'refrigerator', category: 'noun' },
  { target: 'चूल्हा', native: 'stove', category: 'noun' },
  { target: 'मेज़', native: 'table', category: 'noun' },
  { target: 'कुर्सी', native: 'chair', category: 'noun' },
  { target: 'कप', native: 'cup', category: 'noun' },
  { target: 'थाली', native: 'plate', category: 'noun' },
  { target: 'कड़ाही', native: 'pan', category: 'noun' },
  { target: 'कॉफ़ी मशीन', native: 'coffee maker', category: 'noun' },
  { target: 'सिंक', native: 'kitchen sink', category: 'noun' },

  // Food
  { target: 'दूध', native: 'milk', category: 'noun' },
  { target: 'अंडे', native: 'eggs', category: 'noun' },
  { target: 'ब्रेड', native: 'bread', category: 'noun' },
  { target: 'मक्खन', native: 'butter', category: 'noun' },
  { target: 'कॉफ़ी', native: 'coffee', category: 'noun' },
  { target: 'पानी', native: 'water', category: 'noun' },
  { target: 'जूस', native: 'juice', category: 'noun' },

  // Verbs
  { target: 'उठना', native: 'get up', category: 'verb' },
  { target: 'ब्रश करना', native: 'brush teeth', category: 'verb' },
  { target: 'नहाना', native: 'take a shower', category: 'verb' },
  { target: 'खाना', native: 'eat', category: 'verb' },
  { target: 'पीना', native: 'drink', category: 'verb' },
  { target: 'खोलना', native: 'open', category: 'verb' },
  { target: 'बंद करना', native: 'close/turn off', category: 'verb' },
  { target: 'चालू करना', native: 'turn on', category: 'verb' },
  { target: 'जाना', native: 'go', category: 'verb' },
  { target: 'लेना', native: 'take/pick up', category: 'verb' },
  { target: 'पकाना', native: 'cook', category: 'verb' },
  { target: 'धोना', native: 'wash', category: 'verb' },
  { target: 'रखना', native: 'put/place', category: 'verb' },
  { target: 'इस्तेमाल करना', native: 'use', category: 'verb' },

  // Living room
  { target: 'सोफ़ा', native: 'couch', category: 'noun' },
  { target: 'टीवी', native: 'TV', category: 'noun' },
  { target: 'छोटी मेज़', native: 'coffee table', category: 'noun' },
  { target: 'किताबों की अलमारी', native: 'bookshelf', category: 'noun' },
  { target: 'रिमोट', native: 'remote control', category: 'noun' },

  // Street
  { target: 'सड़क का लैम्प', native: 'streetlamp', category: 'noun' },
  { target: 'बेंच', native: 'bench', category: 'noun' },

  // Pets
  { target: 'बिल्ली', native: 'cat', category: 'noun' },
  { target: 'कुत्ता', native: 'dog', category: 'noun' },
  { target: 'पालतू जानवर', native: 'pet', category: 'noun' },

  // Conversation verbs
  { target: 'बात करना', native: 'talk/speak', category: 'verb' },
  { target: 'पूछना', native: 'ask', category: 'verb' },
  { target: 'देना', native: 'give', category: 'verb' },
  { target: 'सहलाना', native: 'pet/stroke', category: 'verb' },
  { target: 'खेलना', native: 'play', category: 'verb' },
  { target: 'देखना', native: 'look at', category: 'verb' },
  { target: 'बैठना', native: 'sit', category: 'verb' },

  // Greetings
  { target: 'नमस्ते', native: 'hello', category: 'other' },
  { target: 'सुप्रभात', native: 'good morning', category: 'other' },
  { target: 'तुम्हें क्या चाहिए', native: 'what do you want?', category: 'other' },

  // Common words
  { target: 'मैं', native: 'I/me', category: 'other' },
  { target: 'तुम', native: 'you (informal)', category: 'other' },
  { target: 'का', native: 'of/possessive (masc.)', category: 'other' },
  { target: 'में', native: 'in/inside', category: 'other' },
  { target: 'और', native: 'and', category: 'other' },
  { target: 'चाहना', native: 'to want', category: 'other' },
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
A cozy apartment shared with roommate Raj (राज) and two pets (Mitthu the cat मिट्ठू, Moti the dog मोती).
The player is learning daily routine vocabulary in Hindi.

OBJECTS:
- alarm_clock: Digital alarm in bedroom, starts ringing. Turn off = remove "ringing" and "on" tags.
- bed: Player starts here in_bed. Getting up = playerTag add "standing", remove "in_bed".
- window, lamp, closet: Can be opened/closed or turned on/off via tag changes.
- refrigerator: Container in kitchen. Must have "open" tag (remove "closed") to access items inside.
  Items inside have location="refrigerator". When fridge is open, they're accessible.
- eggs: In fridge. Can be cooked (add "cooked" tag), taken to inventory, eaten, or given to Raj.
- milk, butter, juice: In fridge. Takeable, some consumable.
- bread, coffee, water: On counter in kitchen. Consumable.
- stove: Must have "on" tag to cook. Turn on = tag add "on", remove "off".
- coffee_maker: Turn on to make coffee available.
- kitchen_sink: Kitchen sink. Can be used to wash dishes or hands.
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
- Raj राज (roommate): In living_room. Very sleepy, barely awake. Simple Hindi using तुम form.
  When the player first talks to him, he asks for coffee ("मुझे कॉफ़ी चाहिए..." / "कॉफ़ी ला दो ना?").
  Giving coffee to Raj = move coffee to "removed" (he drinks it). He wakes up and thanks them.
  After coffee, if the player talks to him again, he mentions being hungry.
  Giving food to Raj = move food to "removed" (he eats it). He thanks them warmly.
- Mitthu मिट्ठू (cat, isPet): In kitchen. Independent, aloof. Purrs when petted, ignores commands.
  Responds in English (no Hindi dialogue). Use npcResponse with just english field.
- Moti मोती (dog, isPet): In kitchen. Excited, eager. Wags tail, barks happily.
  Responds in English. Loves pet_food. Use npcResponse with just english field.

STEP COMPLETION (lax — complete as soon as the intent is clear):
- wake_up: Player has "standing" in playerTags
- turn_off_alarm: alarm_clock no longer has "ringing" tag
- go_to_bathroom: Player is in bathroom
- use_toilet: Player uses the toilet
- take_shower: Player takes a shower
- go_to_living_room: Player is in living_room
- talk_to_raj: Player talks to Raj. Raj should ask for coffee (he's very sleepy).
- go_to_kitchen: Player is in kitchen
- grab_coffee: Player takes coffee to inventory
- give_raj_coffee: Completed when raj_coffee quest completes (player must explicitly give coffee)`,
};
