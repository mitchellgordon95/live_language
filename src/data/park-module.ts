import type { Location, Goal, VocabWord, GameState, NPC, ModuleDefinition } from '../engine/types.js';

// ============================================================================
// PARK LOCATIONS
// ============================================================================

export const parkEntrance: Location = {
  id: 'park_entrance',
  name: { spanish: 'la entrada del parque', english: 'park entrance' },
  objects: [
    {
      id: 'park_gate',
      name: { spanish: 'la puerta del parque', english: 'park gate' },
      state: { open: true },
      actions: ['LOOK'],
    },
    {
      id: 'park_sign',
      name: { spanish: 'el letrero del parque', english: 'park sign' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'park_map',
      name: { spanish: 'el mapa del parque', english: 'park map' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'entrance_bench',
      name: { spanish: 'el banco', english: 'bench' },
      state: {},
      actions: [],
    },
    {
      id: 'trash_can',
      name: { spanish: 'el bote de basura', english: 'trash can' },
      state: {},
      actions: ['USE'],
    },
  ],
  exits: [
    { to: 'main_path', name: { spanish: 'el sendero principal', english: 'main path' } },
    { to: 'street', name: { spanish: 'la calle', english: 'street' } },
  ],
};

export const mainPath: Location = {
  id: 'main_path',
  name: { spanish: 'el sendero principal', english: 'main path' },
  objects: [
    {
      id: 'oak_tree',
      name: { spanish: 'el roble', english: 'oak tree' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'pine_tree',
      name: { spanish: 'el pino', english: 'pine tree' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'path_bench',
      name: { spanish: 'el banco', english: 'bench' },
      state: {},
      actions: [],
    },
    {
      id: 'squirrel',
      name: { spanish: 'la ardilla', english: 'squirrel' },
      state: { visible: true },
      actions: ['LOOK'],
    },
    {
      id: 'fallen_leaves',
      name: { spanish: 'las hojas caidas', english: 'fallen leaves' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'lamp_post',
      name: { spanish: 'el farol', english: 'lamp post' },
      state: { on: false },
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'park_entrance', name: { spanish: 'la entrada', english: 'entrance' } },
    { to: 'fountain_area', name: { spanish: 'la fuente', english: 'fountain' } },
    { to: 'garden', name: { spanish: 'el jardin', english: 'garden' } },
    { to: 'playground', name: { spanish: 'el area de juegos', english: 'playground' } },
  ],
};

export const fountainArea: Location = {
  id: 'fountain_area',
  name: { spanish: 'el area de la fuente', english: 'fountain area' },
  objects: [
    {
      id: 'fountain',
      name: { spanish: 'la fuente', english: 'fountain' },
      state: { on: true, hasWater: true },
      actions: ['LOOK'],
    },
    {
      id: 'fountain_bench',
      name: { spanish: 'el banco', english: 'bench' },
      state: { occupied: false },
      actions: [],
    },
    {
      id: 'pigeons',
      name: { spanish: 'las palomas', english: 'pigeons' },
      state: { count: 12 },
      actions: ['LOOK'],
    },
    {
      id: 'pigeon_feeder',
      name: { spanish: 'el senor con las palomas', english: 'man with pigeons' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'coins_in_fountain',
      name: { spanish: 'las monedas en la fuente', english: 'coins in fountain' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'statue',
      name: { spanish: 'la estatua', english: 'statue' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'main_path', name: { spanish: 'el sendero', english: 'path' } },
    { to: 'kiosk', name: { spanish: 'el quiosco', english: 'kiosk' } },
  ],
};

export const garden: Location = {
  id: 'garden',
  name: { spanish: 'el jardin', english: 'garden' },
  objects: [
    {
      id: 'roses',
      name: { spanish: 'las rosas', english: 'roses' },
      state: { blooming: true, color: 'red' },
      actions: ['LOOK'],
    },
    {
      id: 'tulips',
      name: { spanish: 'los tulipanes', english: 'tulips' },
      state: { blooming: true },
      actions: ['LOOK'],
    },
    {
      id: 'sunflowers',
      name: { spanish: 'los girasoles', english: 'sunflowers' },
      state: { blooming: true },
      actions: ['LOOK'],
    },
    {
      id: 'butterfly',
      name: { spanish: 'la mariposa', english: 'butterfly' },
      state: { visible: true },
      actions: ['LOOK'],
    },
    {
      id: 'bee',
      name: { spanish: 'la abeja', english: 'bee' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'garden_bench',
      name: { spanish: 'el banco del jardin', english: 'garden bench' },
      state: {},
      actions: [],
    },
    {
      id: 'flower_bed',
      name: { spanish: 'el macizo de flores', english: 'flower bed' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'watering_can',
      name: { spanish: 'la regadera', english: 'watering can' },
      state: { filled: true },
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
  ],
  exits: [
    { to: 'main_path', name: { spanish: 'el sendero', english: 'path' } },
  ],
};

export const playground: Location = {
  id: 'playground',
  name: { spanish: 'el area de juegos', english: 'playground' },
  objects: [
    {
      id: 'swings',
      name: { spanish: 'los columpios', english: 'swings' },
      state: { inUse: false },
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'slide',
      name: { spanish: 'el tobogan', english: 'slide' },
      state: {},
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'sandbox',
      name: { spanish: 'el arenero', english: 'sandbox' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'seesaw',
      name: { spanish: 'el sube y baja', english: 'seesaw' },
      state: {},
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'monkey_bars',
      name: { spanish: 'las barras', english: 'monkey bars' },
      state: {},
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'children_playing',
      name: { spanish: 'los ninos jugando', english: 'children playing' },
      state: { count: 5 },
      actions: ['LOOK'],
    },
    {
      id: 'ball',
      name: { spanish: 'la pelota', english: 'ball' },
      state: {},
      actions: ['TAKE', 'USE'],
      takeable: true,
    },
  ],
  exits: [
    { to: 'main_path', name: { spanish: 'el sendero', english: 'path' } },
  ],
};

export const kiosk: Location = {
  id: 'kiosk',
  name: { spanish: 'el quiosco', english: 'kiosk' },
  objects: [
    {
      id: 'ice_cream_cart',
      name: { spanish: 'el carrito de helados', english: 'ice cream cart' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'ice_cream_menu',
      name: { spanish: 'el menu de helados', english: 'ice cream menu' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'chocolate_ice_cream',
      name: { spanish: 'el helado de chocolate', english: 'chocolate ice cream' },
      state: { available: true },
      actions: ['TAKE', 'EAT'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 15 },
    },
    {
      id: 'vanilla_ice_cream',
      name: { spanish: 'el helado de vainilla', english: 'vanilla ice cream' },
      state: { available: true },
      actions: ['TAKE', 'EAT'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 15 },
    },
    {
      id: 'strawberry_ice_cream',
      name: { spanish: 'el helado de fresa', english: 'strawberry ice cream' },
      state: { available: true },
      actions: ['TAKE', 'EAT'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 15 },
    },
    {
      id: 'water_bottle',
      name: { spanish: 'la botella de agua', english: 'water bottle' },
      state: {},
      actions: ['TAKE', 'DRINK'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 5 },
    },
    {
      id: 'umbrella',
      name: { spanish: 'el paraguas', english: 'umbrella' },
      state: { open: false },
      actions: ['TAKE', 'OPEN', 'CLOSE'],
      takeable: true,
    },
    {
      id: 'kiosk_bench',
      name: { spanish: 'el banco', english: 'bench' },
      state: {},
      actions: [],
    },
  ],
  exits: [
    { to: 'fountain_area', name: { spanish: 'la fuente', english: 'fountain' } },
    { to: 'main_path', name: { spanish: 'el sendero', english: 'path' } },
  ],
};

export const parkLocations: Record<string, Location> = {
  park_entrance: parkEntrance,
  main_path: mainPath,
  fountain_area: fountainArea,
  garden,
  playground,
  kiosk,
};

// ============================================================================
// PARK NPCS
// ============================================================================

export const parkNpcs: NPC[] = [
  {
    id: 'ice_cream_vendor',
    name: { spanish: 'Senor Gomez', english: 'Mr. Gomez' },
    location: 'kiosk',
    personality: 'Friendly elderly ice cream vendor. Talks about the weather constantly. Recommends flavors based on the temperature. Speaks slowly and clearly for learners.',
  },
  {
    id: 'pigeon_feeder',
    name: { spanish: 'Don Ramon', english: 'Don Ramon' },
    location: 'fountain_area',
    personality: 'Quiet elderly man who feeds pigeons every day. Enjoys observing nature and commenting on what he sees. Uses present progressive to describe ongoing actions. Very patient and kind.',
  },
];

export function getParkNPCsInLocation(locationId: string): NPC[] {
  return parkNpcs.filter(npc => npc.location === locationId);
}

// ============================================================================
// PARK GOALS - Weather and Present Progressive Focus
// ============================================================================

export const parkGoals: Goal[] = [
  // Goal 1: Arrive at the park and observe the weather
  {
    id: 'arrive_at_park',
    title: 'Arrive at the park',
    description: 'Walk to the park entrance and take in the scenery.',
    hint: 'Try "Voy al parque" (I go to the park)',
    checkComplete: (state: GameState) => state.location.id === 'park_entrance',
    nextGoalId: 'check_weather',
  },
  // Goal 2: Comment on the weather using hacer expressions
  {
    id: 'check_weather',
    title: 'Check the weather',
    description: 'Look around and comment on the weather. Is it nice out?',
    hint: 'Try "Hace buen tiempo" (The weather is nice) or "Hace sol" (It is sunny)',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('check_weather') ||
      state.completedGoals.includes('commented_weather'),
    nextGoalId: 'walk_the_path',
  },
  // Goal 3: Walk the path using present progressive
  {
    id: 'walk_the_path',
    title: 'Walk along the main path',
    description: 'Stroll through the park, describing what you are doing.',
    hint: 'Try "Estoy caminando por el sendero" (I am walking along the path)',
    checkComplete: (state: GameState) =>
      state.location.id === 'main_path' ||
      state.completedGoals.includes('walk_the_path'),
    nextGoalId: 'observe_nature',
  },
  // Goal 4: Observe nature using estar + gerund
  {
    id: 'observe_nature',
    title: 'Observe the animals',
    description: 'Watch the squirrels and birds. What are they doing?',
    hint: 'Try "La ardilla esta corriendo" (The squirrel is running) or "Los pajaros estan volando" (The birds are flying)',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('observe_nature') ||
      state.completedGoals.includes('observed_animals'),
    nextGoalId: 'visit_fountain',
  },
  // Goal 5: Visit the fountain and meet Don Ramon
  {
    id: 'visit_fountain',
    title: 'Go to the fountain',
    description: 'Walk to the fountain area and see who is there.',
    hint: 'Try "Voy a la fuente" (I go to the fountain)',
    checkComplete: (state: GameState) => state.location.id === 'fountain_area',
    nextGoalId: 'talk_to_don_ramon',
  },
  // Goal 6: Talk to Don Ramon about what he is doing
  {
    id: 'talk_to_don_ramon',
    title: 'Talk to Don Ramon',
    description: 'The elderly man is feeding pigeons. Ask what he is doing.',
    hint: 'Try "Hola, senor. Que esta haciendo?" (Hello sir. What are you doing?)',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('talk_to_don_ramon') ||
      state.completedGoals.includes('talked_to_ramon'),
    nextGoalId: 'buy_ice_cream',
  },
  // Goal 7: Buy ice cream from Senor Gomez
  {
    id: 'buy_ice_cream',
    title: 'Get some ice cream',
    description: 'Go to the kiosk and order ice cream from Senor Gomez.',
    hint: 'Try "Quiero un helado de chocolate" (I want a chocolate ice cream) or "Me da un helado, por favor"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('buy_ice_cream') ||
      state.completedGoals.includes('got_ice_cream') ||
      state.inventory.some(item => item.id.includes('ice_cream')),
    nextGoalId: 'weather_changes',
  },
  // Goal 8: React to weather change
  {
    id: 'weather_changes',
    title: 'React to the weather',
    description: 'The clouds are rolling in! Comment on the changing weather.',
    hint: 'Try "Esta nublado" (It is cloudy) or "Va a llover" (It is going to rain)',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('weather_changes') ||
      state.completedGoals.includes('weather_reaction'),
    nextGoalId: 'park_complete',
  },
  // Final goal
  {
    id: 'park_complete',
    title: 'Park visit complete!',
    description: 'Congratulations! You practiced weather expressions and the present progressive tense.',
    checkComplete: () => false, // Final goal, always shown
  },
];

export function getParkGoalById(id: string): Goal | undefined {
  return parkGoals.find((g) => g.id === id);
}

export function getParkStartGoal(): Goal {
  return parkGoals[0];
}

// ============================================================================
// PARK VOCABULARY - Weather, Nature, Present Progressive
// ============================================================================

export const parkVocabulary: VocabWord[] = [
  // ==================== LOCATIONS ====================
  { spanish: 'el parque', english: 'park', category: 'noun', gender: 'masculine' },
  { spanish: 'la entrada', english: 'entrance', category: 'noun', gender: 'feminine' },
  { spanish: 'el sendero', english: 'path', category: 'noun', gender: 'masculine' },
  { spanish: 'el camino', english: 'way/road', category: 'noun', gender: 'masculine' },
  { spanish: 'la fuente', english: 'fountain', category: 'noun', gender: 'feminine' },
  { spanish: 'el jardin', english: 'garden', category: 'noun', gender: 'masculine' },
  { spanish: 'el area de juegos', english: 'playground', category: 'noun', gender: 'feminine' },
  { spanish: 'el quiosco', english: 'kiosk', category: 'noun', gender: 'masculine' },

  // ==================== WEATHER - HACER EXPRESSIONS ====================
  { spanish: 'hace sol', english: 'it is sunny', category: 'other' },
  { spanish: 'hace calor', english: 'it is hot', category: 'other' },
  { spanish: 'hace frio', english: 'it is cold', category: 'other' },
  { spanish: 'hace viento', english: 'it is windy', category: 'other' },
  { spanish: 'hace buen tiempo', english: 'the weather is nice', category: 'other' },
  { spanish: 'hace mal tiempo', english: 'the weather is bad', category: 'other' },
  { spanish: 'hace fresco', english: 'it is cool', category: 'other' },

  // ==================== WEATHER - ESTAR EXPRESSIONS ====================
  { spanish: 'esta nublado', english: 'it is cloudy', category: 'other' },
  { spanish: 'esta lloviendo', english: 'it is raining', category: 'other' },
  { spanish: 'esta nevando', english: 'it is snowing', category: 'other' },
  { spanish: 'esta despejado', english: 'it is clear', category: 'other' },
  { spanish: 'esta humedo', english: 'it is humid', category: 'other' },
  { spanish: 'esta soleado', english: 'it is sunny', category: 'other' },

  // ==================== WEATHER NOUNS ====================
  { spanish: 'el sol', english: 'sun', category: 'noun', gender: 'masculine' },
  { spanish: 'la lluvia', english: 'rain', category: 'noun', gender: 'feminine' },
  { spanish: 'la nube', english: 'cloud', category: 'noun', gender: 'feminine' },
  { spanish: 'las nubes', english: 'clouds', category: 'noun', gender: 'feminine' },
  { spanish: 'el viento', english: 'wind', category: 'noun', gender: 'masculine' },
  { spanish: 'la tormenta', english: 'storm', category: 'noun', gender: 'feminine' },
  { spanish: 'el cielo', english: 'sky', category: 'noun', gender: 'masculine' },
  { spanish: 'el arcoiris', english: 'rainbow', category: 'noun', gender: 'masculine' },
  { spanish: 'la sombra', english: 'shade/shadow', category: 'noun', gender: 'feminine' },
  { spanish: 'el clima', english: 'climate/weather', category: 'noun', gender: 'masculine' },
  { spanish: 'el tiempo', english: 'weather/time', category: 'noun', gender: 'masculine' },
  { spanish: 'la temperatura', english: 'temperature', category: 'noun', gender: 'feminine' },

  // ==================== WEATHER ADJECTIVES ====================
  { spanish: 'caliente', english: 'hot', category: 'adjective' },
  { spanish: 'frio', english: 'cold', category: 'adjective' },
  { spanish: 'templado', english: 'mild/warm', category: 'adjective' },
  { spanish: 'humedo', english: 'humid', category: 'adjective' },
  { spanish: 'seco', english: 'dry', category: 'adjective' },
  { spanish: 'nublado', english: 'cloudy', category: 'adjective' },
  { spanish: 'despejado', english: 'clear', category: 'adjective' },
  { spanish: 'ventoso', english: 'windy', category: 'adjective' },
  { spanish: 'lluvioso', english: 'rainy', category: 'adjective' },
  { spanish: 'soleado', english: 'sunny', category: 'adjective' },

  // ==================== TREES ====================
  { spanish: 'el arbol', english: 'tree', category: 'noun', gender: 'masculine' },
  { spanish: 'los arboles', english: 'trees', category: 'noun', gender: 'masculine' },
  { spanish: 'el roble', english: 'oak tree', category: 'noun', gender: 'masculine' },
  { spanish: 'el pino', english: 'pine tree', category: 'noun', gender: 'masculine' },
  { spanish: 'la hoja', english: 'leaf', category: 'noun', gender: 'feminine' },
  { spanish: 'las hojas', english: 'leaves', category: 'noun', gender: 'feminine' },
  { spanish: 'la rama', english: 'branch', category: 'noun', gender: 'feminine' },
  { spanish: 'el tronco', english: 'trunk', category: 'noun', gender: 'masculine' },

  // ==================== FLOWERS ====================
  { spanish: 'la flor', english: 'flower', category: 'noun', gender: 'feminine' },
  { spanish: 'las flores', english: 'flowers', category: 'noun', gender: 'feminine' },
  { spanish: 'la rosa', english: 'rose', category: 'noun', gender: 'feminine' },
  { spanish: 'el tulipan', english: 'tulip', category: 'noun', gender: 'masculine' },
  { spanish: 'los tulipanes', english: 'tulips', category: 'noun', gender: 'masculine' },
  { spanish: 'el girasol', english: 'sunflower', category: 'noun', gender: 'masculine' },
  { spanish: 'los girasoles', english: 'sunflowers', category: 'noun', gender: 'masculine' },
  { spanish: 'la margarita', english: 'daisy', category: 'noun', gender: 'feminine' },
  { spanish: 'el cesped', english: 'grass/lawn', category: 'noun', gender: 'masculine' },
  { spanish: 'la hierba', english: 'grass', category: 'noun', gender: 'feminine' },

  // ==================== ANIMALS ====================
  { spanish: 'el pajaro', english: 'bird', category: 'noun', gender: 'masculine' },
  { spanish: 'los pajaros', english: 'birds', category: 'noun', gender: 'masculine' },
  { spanish: 'la paloma', english: 'pigeon', category: 'noun', gender: 'feminine' },
  { spanish: 'las palomas', english: 'pigeons', category: 'noun', gender: 'feminine' },
  { spanish: 'la ardilla', english: 'squirrel', category: 'noun', gender: 'feminine' },
  { spanish: 'la mariposa', english: 'butterfly', category: 'noun', gender: 'feminine' },
  { spanish: 'la abeja', english: 'bee', category: 'noun', gender: 'feminine' },
  { spanish: 'la hormiga', english: 'ant', category: 'noun', gender: 'feminine' },
  { spanish: 'el pato', english: 'duck', category: 'noun', gender: 'masculine' },
  { spanish: 'el insecto', english: 'insect', category: 'noun', gender: 'masculine' },

  // ==================== PARK OBJECTS ====================
  { spanish: 'el banco', english: 'bench', category: 'noun', gender: 'masculine' },
  { spanish: 'la estatua', english: 'statue', category: 'noun', gender: 'feminine' },
  { spanish: 'el farol', english: 'lamp post', category: 'noun', gender: 'masculine' },
  { spanish: 'el letrero', english: 'sign', category: 'noun', gender: 'masculine' },
  { spanish: 'el mapa', english: 'map', category: 'noun', gender: 'masculine' },
  { spanish: 'el bote de basura', english: 'trash can', category: 'noun', gender: 'masculine' },
  { spanish: 'la regadera', english: 'watering can', category: 'noun', gender: 'feminine' },
  { spanish: 'el paraguas', english: 'umbrella', category: 'noun', gender: 'masculine' },

  // ==================== PLAYGROUND ====================
  { spanish: 'el columpio', english: 'swing', category: 'noun', gender: 'masculine' },
  { spanish: 'los columpios', english: 'swings', category: 'noun', gender: 'masculine' },
  { spanish: 'el tobogan', english: 'slide', category: 'noun', gender: 'masculine' },
  { spanish: 'el arenero', english: 'sandbox', category: 'noun', gender: 'masculine' },
  { spanish: 'el sube y baja', english: 'seesaw', category: 'noun', gender: 'masculine' },
  { spanish: 'las barras', english: 'monkey bars', category: 'noun', gender: 'feminine' },
  { spanish: 'la pelota', english: 'ball', category: 'noun', gender: 'feminine' },

  // ==================== FOOD AND DRINKS ====================
  { spanish: 'el helado', english: 'ice cream', category: 'noun', gender: 'masculine' },
  { spanish: 'el helado de chocolate', english: 'chocolate ice cream', category: 'noun', gender: 'masculine' },
  { spanish: 'el helado de vainilla', english: 'vanilla ice cream', category: 'noun', gender: 'masculine' },
  { spanish: 'el helado de fresa', english: 'strawberry ice cream', category: 'noun', gender: 'masculine' },
  { spanish: 'la botella de agua', english: 'water bottle', category: 'noun', gender: 'feminine' },
  { spanish: 'el carrito', english: 'cart', category: 'noun', gender: 'masculine' },

  // ==================== PEOPLE ====================
  { spanish: 'el nino', english: 'boy/child', category: 'noun', gender: 'masculine' },
  { spanish: 'la nina', english: 'girl', category: 'noun', gender: 'feminine' },
  { spanish: 'los ninos', english: 'children', category: 'noun', gender: 'masculine' },
  { spanish: 'el senor', english: 'sir/Mr.', category: 'noun', gender: 'masculine' },
  { spanish: 'la senora', english: 'madam/Mrs.', category: 'noun', gender: 'feminine' },
  { spanish: 'el vendedor', english: 'vendor', category: 'noun', gender: 'masculine' },
  { spanish: 'la familia', english: 'family', category: 'noun', gender: 'feminine' },

  // ==================== PRESENT PROGRESSIVE - ESTAR + GERUND ====================
  { spanish: 'estoy caminando', english: 'I am walking', category: 'verb' },
  { spanish: 'estoy corriendo', english: 'I am running', category: 'verb' },
  { spanish: 'estoy sentado', english: 'I am sitting', category: 'verb' },
  { spanish: 'estoy mirando', english: 'I am looking/watching', category: 'verb' },
  { spanish: 'estoy comiendo', english: 'I am eating', category: 'verb' },
  { spanish: 'estoy bebiendo', english: 'I am drinking', category: 'verb' },
  { spanish: 'estoy descansando', english: 'I am resting', category: 'verb' },
  { spanish: 'estoy disfrutando', english: 'I am enjoying', category: 'verb' },
  { spanish: 'estoy esperando', english: 'I am waiting', category: 'verb' },
  { spanish: 'estoy paseando', english: 'I am strolling', category: 'verb' },

  // Third person singular progressive
  { spanish: 'esta caminando', english: 'he/she is walking', category: 'verb' },
  { spanish: 'esta corriendo', english: 'he/she is running', category: 'verb' },
  { spanish: 'esta volando', english: 'he/she is flying', category: 'verb' },
  { spanish: 'esta comiendo', english: 'he/she is eating', category: 'verb' },
  { spanish: 'esta jugando', english: 'he/she is playing', category: 'verb' },
  { spanish: 'esta nadando', english: 'he/she is swimming', category: 'verb' },
  { spanish: 'esta cantando', english: 'he/she is singing', category: 'verb' },
  { spanish: 'esta durmiendo', english: 'he/she is sleeping', category: 'verb' },

  // Third person plural progressive
  { spanish: 'estan caminando', english: 'they are walking', category: 'verb' },
  { spanish: 'estan corriendo', english: 'they are running', category: 'verb' },
  { spanish: 'estan volando', english: 'they are flying', category: 'verb' },
  { spanish: 'estan jugando', english: 'they are playing', category: 'verb' },
  { spanish: 'estan comiendo', english: 'they are eating', category: 'verb' },

  // ==================== ACTION VERBS (INFINITIVE) ====================
  { spanish: 'caminar', english: 'to walk', category: 'verb' },
  { spanish: 'correr', english: 'to run', category: 'verb' },
  { spanish: 'saltar', english: 'to jump', category: 'verb' },
  { spanish: 'volar', english: 'to fly', category: 'verb' },
  { spanish: 'nadar', english: 'to swim', category: 'verb' },
  { spanish: 'jugar', english: 'to play', category: 'verb' },
  { spanish: 'descansar', english: 'to rest', category: 'verb' },
  { spanish: 'pasear', english: 'to stroll', category: 'verb' },
  { spanish: 'sentarse', english: 'to sit down', category: 'verb' },
  { spanish: 'alimentar', english: 'to feed', category: 'verb' },
  { spanish: 'observar', english: 'to observe', category: 'verb' },
  { spanish: 'disfrutar', english: 'to enjoy', category: 'verb' },

  // ==================== SIMPLE PRESENT VERBS (YO FORM) ====================
  { spanish: 'camino', english: 'I walk', category: 'verb' },
  { spanish: 'corro', english: 'I run', category: 'verb' },
  { spanish: 'miro', english: 'I look/watch', category: 'verb' },
  { spanish: 'veo', english: 'I see', category: 'verb' },
  { spanish: 'quiero', english: 'I want', category: 'verb' },
  { spanish: 'compro', english: 'I buy', category: 'verb' },
  { spanish: 'pido', english: 'I ask for/order', category: 'verb' },
  { spanish: 'me siento', english: 'I sit down', category: 'verb' },
  { spanish: 'descanso', english: 'I rest', category: 'verb' },
  { spanish: 'paseo', english: 'I stroll', category: 'verb' },

  // ==================== QUESTION WORDS AND PHRASES ====================
  { spanish: 'que tiempo hace', english: 'what is the weather like', category: 'other' },
  { spanish: 'que esta haciendo', english: 'what is he/she doing', category: 'other' },
  { spanish: 'que estan haciendo', english: 'what are they doing', category: 'other' },
  { spanish: 'adonde vas', english: 'where are you going', category: 'other' },
  { spanish: 'cuanto cuesta', english: 'how much does it cost', category: 'other' },
  { spanish: 'que quieres', english: 'what do you want', category: 'other' },

  // ==================== PREPOSITIONS AND CONNECTORS ====================
  { spanish: 'por', english: 'through/along', category: 'other' },
  { spanish: 'hacia', english: 'toward', category: 'other' },
  { spanish: 'cerca de', english: 'near', category: 'other' },
  { spanish: 'lejos de', english: 'far from', category: 'other' },
  { spanish: 'al lado de', english: 'next to', category: 'other' },
  { spanish: 'debajo de', english: 'under', category: 'other' },
  { spanish: 'encima de', english: 'on top of', category: 'other' },
  { spanish: 'entre', english: 'between', category: 'other' },
  { spanish: 'alrededor de', english: 'around', category: 'other' },

  // ==================== USEFUL EXPRESSIONS ====================
  { spanish: 'que bonito', english: 'how beautiful', category: 'other' },
  { spanish: 'que lindo dia', english: 'what a nice day', category: 'other' },
  { spanish: 'me gusta', english: 'I like', category: 'verb' },
  { spanish: 'me encanta', english: 'I love', category: 'verb' },
  { spanish: 'tengo calor', english: 'I am hot', category: 'other' },
  { spanish: 'tengo frio', english: 'I am cold', category: 'other' },
  { spanish: 'tengo sed', english: 'I am thirsty', category: 'other' },
  { spanish: 'va a llover', english: 'it is going to rain', category: 'other' },
  { spanish: 'parece que', english: 'it seems that', category: 'other' },
  { spanish: 'por favor', english: 'please', category: 'other' },
  { spanish: 'gracias', english: 'thank you', category: 'other' },
  { spanish: 'buenos dias', english: 'good morning', category: 'other' },
  { spanish: 'buenas tardes', english: 'good afternoon', category: 'other' },

  // ==================== ADJECTIVES ====================
  { spanish: 'bonito', english: 'beautiful/pretty', category: 'adjective' },
  { spanish: 'hermoso', english: 'beautiful', category: 'adjective' },
  { spanish: 'grande', english: 'big', category: 'adjective' },
  { spanish: 'pequeno', english: 'small', category: 'adjective' },
  { spanish: 'alto', english: 'tall', category: 'adjective' },
  { spanish: 'bajo', english: 'short', category: 'adjective' },
  { spanish: 'verde', english: 'green', category: 'adjective' },
  { spanish: 'azul', english: 'blue', category: 'adjective' },
  { spanish: 'rojo', english: 'red', category: 'adjective' },
  { spanish: 'amarillo', english: 'yellow', category: 'adjective' },
  { spanish: 'blanco', english: 'white', category: 'adjective' },
  { spanish: 'rosado', english: 'pink', category: 'adjective' },
  { spanish: 'tranquilo', english: 'calm/peaceful', category: 'adjective' },
  { spanish: 'agradable', english: 'pleasant', category: 'adjective' },
  { spanish: 'fresco', english: 'fresh/cool', category: 'adjective' },
  { spanish: 'lleno', english: 'full', category: 'adjective' },
  { spanish: 'vacio', english: 'empty', category: 'adjective' },
];

export const promptInstructions = `PARK NPCs:
- Senor Gomez (ice_cream_vendor): Friendly elderly ice cream vendor at the kiosk. Talks about weather constantly. Recommends flavors based on temperature. Speaks slowly and clearly.
- Don Ramon (pigeon_feeder): Quiet elderly man at the fountain who feeds pigeons. Observes nature and uses present progressive to describe ongoing actions. Very patient and kind.

PARK INTERACTIONS (Weather and Present Progressive Focus):
- "hace buen tiempo" or "hace sol" → goalComplete: ["commented_weather", "check_weather"], present tense weather expressions
- "estoy caminando por el sendero" → goalComplete: ["walk_the_path"], practice present progressive
- "la ardilla esta corriendo" or "los pajaros estan volando" → goalComplete: ["observed_animals", "observe_nature"], describe what animals are doing
- "hola senor, que esta haciendo?" to Don Ramon → actions: [{ "type": "talk", "npcId": "pigeon_feeder" }], goalComplete: ["talked_to_ramon", "talk_to_don_ramon"]
- "quiero un helado de chocolate" to vendor → actions: [{ "type": "talk", "npcId": "ice_cream_vendor" }], goalComplete: ["got_ice_cream", "buy_ice_cream"]
- "esta nublado" or "va a llover" → goalComplete: ["weather_reaction", "weather_changes"], react to weather

KEY SPANISH FOR WEATHER (teach these patterns):
- "Hace + noun" - Hace sol (it's sunny), Hace frio (it's cold), Hace calor (it's hot)
- "Esta + adjective" - Esta nublado (it's cloudy), Esta lloviendo (it's raining)
- Present progressive: "estar + gerund" - Estoy caminando (I am walking), Esta comiendo (he/she is eating)`;

export const parkModule: ModuleDefinition = {
  name: 'park',
  displayName: 'Park',
  locations: parkLocations,
  npcs: parkNpcs,
  goals: parkGoals,
  vocabulary: parkVocabulary,
  startLocationId: 'park_entrance',
  startGoalId: 'arrive_at_park',
  locationIds: Object.keys(parkLocations),
  unlockLevel: 3,
  promptInstructions,
};
