import type { Location, Goal, VocabWord, GameState, NPC, ModuleDefinition } from '../../../engine/types.js';

// ============================================================================
// PARK LOCATIONS
// ============================================================================

export const parkEntrance: Location = {
  id: 'park_entrance',
  name: { target: 'la entrada del parque', native: 'park entrance' },
  objects: [
    {
      id: 'park_gate',
      name: { target: 'la puerta del parque', native: 'park gate' },
      state: { open: true },
      actions: ['LOOK'],
    },
    {
      id: 'park_sign',
      name: { target: 'el letrero del parque', native: 'park sign' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'park_map',
      name: { target: 'el mapa del parque', native: 'park map' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'entrance_bench',
      name: { target: 'el banco', native: 'bench' },
      state: {},
      actions: [],
    },
    {
      id: 'trash_can',
      name: { target: 'el bote de basura', native: 'trash can' },
      state: {},
      actions: ['USE'],
    },
  ],
  exits: [
    { to: 'main_path', name: { target: 'el sendero principal', native: 'main path' } },
    { to: 'street', name: { target: 'la calle', native: 'street' } },
  ],
};

export const mainPath: Location = {
  id: 'main_path',
  name: { target: 'el sendero principal', native: 'main path' },
  objects: [
    {
      id: 'oak_tree',
      name: { target: 'el roble', native: 'oak tree' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'pine_tree',
      name: { target: 'el pino', native: 'pine tree' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'path_bench',
      name: { target: 'el banco', native: 'bench' },
      state: {},
      actions: [],
    },
    {
      id: 'squirrel',
      name: { target: 'la ardilla', native: 'squirrel' },
      state: { visible: true },
      actions: ['LOOK'],
    },
    {
      id: 'fallen_leaves',
      name: { target: 'las hojas caidas', native: 'fallen leaves' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'lamp_post',
      name: { target: 'el farol', native: 'lamp post' },
      state: { on: false },
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'park_entrance', name: { target: 'la entrada', native: 'entrance' } },
    { to: 'fountain_area', name: { target: 'la fuente', native: 'fountain' } },
    { to: 'garden', name: { target: 'el jardin', native: 'garden' } },
    { to: 'playground', name: { target: 'el area de juegos', native: 'playground' } },
  ],
};

export const fountainArea: Location = {
  id: 'fountain_area',
  name: { target: 'el area de la fuente', native: 'fountain area' },
  objects: [
    {
      id: 'fountain',
      name: { target: 'la fuente', native: 'fountain' },
      state: { on: true, hasWater: true },
      actions: ['LOOK'],
    },
    {
      id: 'fountain_bench',
      name: { target: 'el banco', native: 'bench' },
      state: { occupied: false },
      actions: [],
    },
    {
      id: 'pigeons',
      name: { target: 'las palomas', native: 'pigeons' },
      state: { count: 12 },
      actions: ['LOOK'],
    },
    {
      id: 'pigeon_feeder',
      name: { target: 'el senor con las palomas', native: 'man with pigeons' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'coins_in_fountain',
      name: { target: 'las monedas en la fuente', native: 'coins in fountain' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'statue',
      name: { target: 'la estatua', native: 'statue' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'main_path', name: { target: 'el sendero', native: 'path' } },
    { to: 'kiosk', name: { target: 'el quiosco', native: 'kiosk' } },
  ],
};

export const garden: Location = {
  id: 'garden',
  name: { target: 'el jardin', native: 'garden' },
  objects: [
    {
      id: 'roses',
      name: { target: 'las rosas', native: 'roses' },
      state: { blooming: true, color: 'red' },
      actions: ['LOOK'],
    },
    {
      id: 'tulips',
      name: { target: 'los tulipanes', native: 'tulips' },
      state: { blooming: true },
      actions: ['LOOK'],
    },
    {
      id: 'sunflowers',
      name: { target: 'los girasoles', native: 'sunflowers' },
      state: { blooming: true },
      actions: ['LOOK'],
    },
    {
      id: 'butterfly',
      name: { target: 'la mariposa', native: 'butterfly' },
      state: { visible: true },
      actions: ['LOOK'],
    },
    {
      id: 'bee',
      name: { target: 'la abeja', native: 'bee' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'garden_bench',
      name: { target: 'el banco del jardin', native: 'garden bench' },
      state: {},
      actions: [],
    },
    {
      id: 'flower_bed',
      name: { target: 'el macizo de flores', native: 'flower bed' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'watering_can',
      name: { target: 'la regadera', native: 'watering can' },
      state: { filled: true },
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
  ],
  exits: [
    { to: 'main_path', name: { target: 'el sendero', native: 'path' } },
  ],
};

export const playground: Location = {
  id: 'playground',
  name: { target: 'el area de juegos', native: 'playground' },
  objects: [
    {
      id: 'swings',
      name: { target: 'los columpios', native: 'swings' },
      state: { inUse: false },
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'slide',
      name: { target: 'el tobogan', native: 'slide' },
      state: {},
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'sandbox',
      name: { target: 'el arenero', native: 'sandbox' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'seesaw',
      name: { target: 'el sube y baja', native: 'seesaw' },
      state: {},
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'monkey_bars',
      name: { target: 'las barras', native: 'monkey bars' },
      state: {},
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'children_playing',
      name: { target: 'los ninos jugando', native: 'children playing' },
      state: { count: 5 },
      actions: ['LOOK'],
    },
    {
      id: 'ball',
      name: { target: 'la pelota', native: 'ball' },
      state: {},
      actions: ['TAKE', 'USE'],
      takeable: true,
    },
  ],
  exits: [
    { to: 'main_path', name: { target: 'el sendero', native: 'path' } },
  ],
};

export const kiosk: Location = {
  id: 'kiosk',
  name: { target: 'el quiosco', native: 'kiosk' },
  objects: [
    {
      id: 'ice_cream_cart',
      name: { target: 'el carrito de helados', native: 'ice cream cart' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'ice_cream_menu',
      name: { target: 'el menu de helados', native: 'ice cream menu' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'chocolate_ice_cream',
      name: { target: 'el helado de chocolate', native: 'chocolate ice cream' },
      state: { available: true },
      actions: ['TAKE', 'EAT'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 15 },
    },
    {
      id: 'vanilla_ice_cream',
      name: { target: 'el helado de vainilla', native: 'vanilla ice cream' },
      state: { available: true },
      actions: ['TAKE', 'EAT'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 15 },
    },
    {
      id: 'strawberry_ice_cream',
      name: { target: 'el helado de fresa', native: 'strawberry ice cream' },
      state: { available: true },
      actions: ['TAKE', 'EAT'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 15 },
    },
    {
      id: 'water_bottle',
      name: { target: 'la botella de agua', native: 'water bottle' },
      state: {},
      actions: ['TAKE', 'DRINK'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 5 },
    },
    {
      id: 'umbrella',
      name: { target: 'el paraguas', native: 'umbrella' },
      state: { open: false },
      actions: ['TAKE', 'OPEN', 'CLOSE'],
      takeable: true,
    },
    {
      id: 'kiosk_bench',
      name: { target: 'el banco', native: 'bench' },
      state: {},
      actions: [],
    },
  ],
  exits: [
    { to: 'fountain_area', name: { target: 'la fuente', native: 'fountain' } },
    { to: 'main_path', name: { target: 'el sendero', native: 'path' } },
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
    name: { target: 'Senor Gomez', native: 'Mr. Gomez' },
    location: 'kiosk',
    personality: 'Friendly elderly ice cream vendor. Talks about the weather constantly. Recommends flavors based on the temperature. Speaks slowly and clearly for learners.',
    gender: 'male',
  },
  {
    id: 'pigeon_feeder',
    name: { target: 'Don Ramon', native: 'Don Ramon' },
    location: 'fountain_area',
    personality: 'Quiet elderly man who feeds pigeons every day. Enjoys observing nature and commenting on what he sees. Uses present progressive to describe ongoing actions. Very patient and kind.',
    gender: 'male',
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
    checkComplete: (state: GameState) => state.completedGoals.includes('weather_changes'),
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
  { target: 'el parque', native: 'park', category: 'noun', gender: 'masculine' },
  { target: 'la entrada', native: 'entrance', category: 'noun', gender: 'feminine' },
  { target: 'el sendero', native: 'path', category: 'noun', gender: 'masculine' },
  { target: 'el camino', native: 'way/road', category: 'noun', gender: 'masculine' },
  { target: 'la fuente', native: 'fountain', category: 'noun', gender: 'feminine' },
  { target: 'el jardin', native: 'garden', category: 'noun', gender: 'masculine' },
  { target: 'el area de juegos', native: 'playground', category: 'noun', gender: 'feminine' },
  { target: 'el quiosco', native: 'kiosk', category: 'noun', gender: 'masculine' },

  // ==================== WEATHER - HACER EXPRESSIONS ====================
  { target: 'hace sol', native: 'it is sunny', category: 'other' },
  { target: 'hace calor', native: 'it is hot', category: 'other' },
  { target: 'hace frio', native: 'it is cold', category: 'other' },
  { target: 'hace viento', native: 'it is windy', category: 'other' },
  { target: 'hace buen tiempo', native: 'the weather is nice', category: 'other' },
  { target: 'hace mal tiempo', native: 'the weather is bad', category: 'other' },
  { target: 'hace fresco', native: 'it is cool', category: 'other' },

  // ==================== WEATHER - ESTAR EXPRESSIONS ====================
  { target: 'esta nublado', native: 'it is cloudy', category: 'other' },
  { target: 'esta lloviendo', native: 'it is raining', category: 'other' },
  { target: 'esta nevando', native: 'it is snowing', category: 'other' },
  { target: 'esta despejado', native: 'it is clear', category: 'other' },
  { target: 'esta humedo', native: 'it is humid', category: 'other' },
  { target: 'esta soleado', native: 'it is sunny', category: 'other' },

  // ==================== WEATHER NOUNS ====================
  { target: 'el sol', native: 'sun', category: 'noun', gender: 'masculine' },
  { target: 'la lluvia', native: 'rain', category: 'noun', gender: 'feminine' },
  { target: 'la nube', native: 'cloud', category: 'noun', gender: 'feminine' },
  { target: 'las nubes', native: 'clouds', category: 'noun', gender: 'feminine' },
  { target: 'el viento', native: 'wind', category: 'noun', gender: 'masculine' },
  { target: 'la tormenta', native: 'storm', category: 'noun', gender: 'feminine' },
  { target: 'el cielo', native: 'sky', category: 'noun', gender: 'masculine' },
  { target: 'el arcoiris', native: 'rainbow', category: 'noun', gender: 'masculine' },
  { target: 'la sombra', native: 'shade/shadow', category: 'noun', gender: 'feminine' },
  { target: 'el clima', native: 'climate/weather', category: 'noun', gender: 'masculine' },
  { target: 'el tiempo', native: 'weather/time', category: 'noun', gender: 'masculine' },
  { target: 'la temperatura', native: 'temperature', category: 'noun', gender: 'feminine' },

  // ==================== WEATHER ADJECTIVES ====================
  { target: 'caliente', native: 'hot', category: 'adjective' },
  { target: 'frio', native: 'cold', category: 'adjective' },
  { target: 'templado', native: 'mild/warm', category: 'adjective' },
  { target: 'humedo', native: 'humid', category: 'adjective' },
  { target: 'seco', native: 'dry', category: 'adjective' },
  { target: 'nublado', native: 'cloudy', category: 'adjective' },
  { target: 'despejado', native: 'clear', category: 'adjective' },
  { target: 'ventoso', native: 'windy', category: 'adjective' },
  { target: 'lluvioso', native: 'rainy', category: 'adjective' },
  { target: 'soleado', native: 'sunny', category: 'adjective' },

  // ==================== TREES ====================
  { target: 'el arbol', native: 'tree', category: 'noun', gender: 'masculine' },
  { target: 'los arboles', native: 'trees', category: 'noun', gender: 'masculine' },
  { target: 'el roble', native: 'oak tree', category: 'noun', gender: 'masculine' },
  { target: 'el pino', native: 'pine tree', category: 'noun', gender: 'masculine' },
  { target: 'la hoja', native: 'leaf', category: 'noun', gender: 'feminine' },
  { target: 'las hojas', native: 'leaves', category: 'noun', gender: 'feminine' },
  { target: 'la rama', native: 'branch', category: 'noun', gender: 'feminine' },
  { target: 'el tronco', native: 'trunk', category: 'noun', gender: 'masculine' },

  // ==================== FLOWERS ====================
  { target: 'la flor', native: 'flower', category: 'noun', gender: 'feminine' },
  { target: 'las flores', native: 'flowers', category: 'noun', gender: 'feminine' },
  { target: 'la rosa', native: 'rose', category: 'noun', gender: 'feminine' },
  { target: 'el tulipan', native: 'tulip', category: 'noun', gender: 'masculine' },
  { target: 'los tulipanes', native: 'tulips', category: 'noun', gender: 'masculine' },
  { target: 'el girasol', native: 'sunflower', category: 'noun', gender: 'masculine' },
  { target: 'los girasoles', native: 'sunflowers', category: 'noun', gender: 'masculine' },
  { target: 'la margarita', native: 'daisy', category: 'noun', gender: 'feminine' },
  { target: 'el cesped', native: 'grass/lawn', category: 'noun', gender: 'masculine' },
  { target: 'la hierba', native: 'grass', category: 'noun', gender: 'feminine' },

  // ==================== ANIMALS ====================
  { target: 'el pajaro', native: 'bird', category: 'noun', gender: 'masculine' },
  { target: 'los pajaros', native: 'birds', category: 'noun', gender: 'masculine' },
  { target: 'la paloma', native: 'pigeon', category: 'noun', gender: 'feminine' },
  { target: 'las palomas', native: 'pigeons', category: 'noun', gender: 'feminine' },
  { target: 'la ardilla', native: 'squirrel', category: 'noun', gender: 'feminine' },
  { target: 'la mariposa', native: 'butterfly', category: 'noun', gender: 'feminine' },
  { target: 'la abeja', native: 'bee', category: 'noun', gender: 'feminine' },
  { target: 'la hormiga', native: 'ant', category: 'noun', gender: 'feminine' },
  { target: 'el pato', native: 'duck', category: 'noun', gender: 'masculine' },
  { target: 'el insecto', native: 'insect', category: 'noun', gender: 'masculine' },

  // ==================== PARK OBJECTS ====================
  { target: 'el banco', native: 'bench', category: 'noun', gender: 'masculine' },
  { target: 'la estatua', native: 'statue', category: 'noun', gender: 'feminine' },
  { target: 'el farol', native: 'lamp post', category: 'noun', gender: 'masculine' },
  { target: 'el letrero', native: 'sign', category: 'noun', gender: 'masculine' },
  { target: 'el mapa', native: 'map', category: 'noun', gender: 'masculine' },
  { target: 'el bote de basura', native: 'trash can', category: 'noun', gender: 'masculine' },
  { target: 'la regadera', native: 'watering can', category: 'noun', gender: 'feminine' },
  { target: 'el paraguas', native: 'umbrella', category: 'noun', gender: 'masculine' },

  // ==================== PLAYGROUND ====================
  { target: 'el columpio', native: 'swing', category: 'noun', gender: 'masculine' },
  { target: 'los columpios', native: 'swings', category: 'noun', gender: 'masculine' },
  { target: 'el tobogan', native: 'slide', category: 'noun', gender: 'masculine' },
  { target: 'el arenero', native: 'sandbox', category: 'noun', gender: 'masculine' },
  { target: 'el sube y baja', native: 'seesaw', category: 'noun', gender: 'masculine' },
  { target: 'las barras', native: 'monkey bars', category: 'noun', gender: 'feminine' },
  { target: 'la pelota', native: 'ball', category: 'noun', gender: 'feminine' },

  // ==================== FOOD AND DRINKS ====================
  { target: 'el helado', native: 'ice cream', category: 'noun', gender: 'masculine' },
  { target: 'el helado de chocolate', native: 'chocolate ice cream', category: 'noun', gender: 'masculine' },
  { target: 'el helado de vainilla', native: 'vanilla ice cream', category: 'noun', gender: 'masculine' },
  { target: 'el helado de fresa', native: 'strawberry ice cream', category: 'noun', gender: 'masculine' },
  { target: 'la botella de agua', native: 'water bottle', category: 'noun', gender: 'feminine' },
  { target: 'el carrito', native: 'cart', category: 'noun', gender: 'masculine' },

  // ==================== PEOPLE ====================
  { target: 'el nino', native: 'boy/child', category: 'noun', gender: 'masculine' },
  { target: 'la nina', native: 'girl', category: 'noun', gender: 'feminine' },
  { target: 'los ninos', native: 'children', category: 'noun', gender: 'masculine' },
  { target: 'el senor', native: 'sir/Mr.', category: 'noun', gender: 'masculine' },
  { target: 'la senora', native: 'madam/Mrs.', category: 'noun', gender: 'feminine' },
  { target: 'el vendedor', native: 'vendor', category: 'noun', gender: 'masculine' },
  { target: 'la familia', native: 'family', category: 'noun', gender: 'feminine' },

  // ==================== PRESENT PROGRESSIVE - ESTAR + GERUND ====================
  { target: 'estoy caminando', native: 'I am walking', category: 'verb' },
  { target: 'estoy corriendo', native: 'I am running', category: 'verb' },
  { target: 'estoy sentado', native: 'I am sitting', category: 'verb' },
  { target: 'estoy mirando', native: 'I am looking/watching', category: 'verb' },
  { target: 'estoy comiendo', native: 'I am eating', category: 'verb' },
  { target: 'estoy bebiendo', native: 'I am drinking', category: 'verb' },
  { target: 'estoy descansando', native: 'I am resting', category: 'verb' },
  { target: 'estoy disfrutando', native: 'I am enjoying', category: 'verb' },
  { target: 'estoy esperando', native: 'I am waiting', category: 'verb' },
  { target: 'estoy paseando', native: 'I am strolling', category: 'verb' },

  // Third person singular progressive
  { target: 'esta caminando', native: 'he/she is walking', category: 'verb' },
  { target: 'esta corriendo', native: 'he/she is running', category: 'verb' },
  { target: 'esta volando', native: 'he/she is flying', category: 'verb' },
  { target: 'esta comiendo', native: 'he/she is eating', category: 'verb' },
  { target: 'esta jugando', native: 'he/she is playing', category: 'verb' },
  { target: 'esta nadando', native: 'he/she is swimming', category: 'verb' },
  { target: 'esta cantando', native: 'he/she is singing', category: 'verb' },
  { target: 'esta durmiendo', native: 'he/she is sleeping', category: 'verb' },

  // Third person plural progressive
  { target: 'estan caminando', native: 'they are walking', category: 'verb' },
  { target: 'estan corriendo', native: 'they are running', category: 'verb' },
  { target: 'estan volando', native: 'they are flying', category: 'verb' },
  { target: 'estan jugando', native: 'they are playing', category: 'verb' },
  { target: 'estan comiendo', native: 'they are eating', category: 'verb' },

  // ==================== ACTION VERBS (INFINITIVE) ====================
  { target: 'caminar', native: 'to walk', category: 'verb' },
  { target: 'correr', native: 'to run', category: 'verb' },
  { target: 'saltar', native: 'to jump', category: 'verb' },
  { target: 'volar', native: 'to fly', category: 'verb' },
  { target: 'nadar', native: 'to swim', category: 'verb' },
  { target: 'jugar', native: 'to play', category: 'verb' },
  { target: 'descansar', native: 'to rest', category: 'verb' },
  { target: 'pasear', native: 'to stroll', category: 'verb' },
  { target: 'sentarse', native: 'to sit down', category: 'verb' },
  { target: 'alimentar', native: 'to feed', category: 'verb' },
  { target: 'observar', native: 'to observe', category: 'verb' },
  { target: 'disfrutar', native: 'to enjoy', category: 'verb' },

  // ==================== SIMPLE PRESENT VERBS (YO FORM) ====================
  { target: 'camino', native: 'I walk', category: 'verb' },
  { target: 'corro', native: 'I run', category: 'verb' },
  { target: 'miro', native: 'I look/watch', category: 'verb' },
  { target: 'veo', native: 'I see', category: 'verb' },
  { target: 'quiero', native: 'I want', category: 'verb' },
  { target: 'compro', native: 'I buy', category: 'verb' },
  { target: 'pido', native: 'I ask for/order', category: 'verb' },
  { target: 'me siento', native: 'I sit down', category: 'verb' },
  { target: 'descanso', native: 'I rest', category: 'verb' },
  { target: 'paseo', native: 'I stroll', category: 'verb' },

  // ==================== QUESTION WORDS AND PHRASES ====================
  { target: 'que tiempo hace', native: 'what is the weather like', category: 'other' },
  { target: 'que esta haciendo', native: 'what is he/she doing', category: 'other' },
  { target: 'que estan haciendo', native: 'what are they doing', category: 'other' },
  { target: 'adonde vas', native: 'where are you going', category: 'other' },
  { target: 'cuanto cuesta', native: 'how much does it cost', category: 'other' },
  { target: 'que quieres', native: 'what do you want', category: 'other' },

  // ==================== PREPOSITIONS AND CONNECTORS ====================
  { target: 'por', native: 'through/along', category: 'other' },
  { target: 'hacia', native: 'toward', category: 'other' },
  { target: 'cerca de', native: 'near', category: 'other' },
  { target: 'lejos de', native: 'far from', category: 'other' },
  { target: 'al lado de', native: 'next to', category: 'other' },
  { target: 'debajo de', native: 'under', category: 'other' },
  { target: 'encima de', native: 'on top of', category: 'other' },
  { target: 'entre', native: 'between', category: 'other' },
  { target: 'alrededor de', native: 'around', category: 'other' },

  // ==================== USEFUL EXPRESSIONS ====================
  { target: 'que bonito', native: 'how beautiful', category: 'other' },
  { target: 'que lindo dia', native: 'what a nice day', category: 'other' },
  { target: 'me gusta', native: 'I like', category: 'verb' },
  { target: 'me encanta', native: 'I love', category: 'verb' },
  { target: 'tengo calor', native: 'I am hot', category: 'other' },
  { target: 'tengo frio', native: 'I am cold', category: 'other' },
  { target: 'tengo sed', native: 'I am thirsty', category: 'other' },
  { target: 'va a llover', native: 'it is going to rain', category: 'other' },
  { target: 'parece que', native: 'it seems that', category: 'other' },
  { target: 'por favor', native: 'please', category: 'other' },
  { target: 'gracias', native: 'thank you', category: 'other' },
  { target: 'buenos dias', native: 'good morning', category: 'other' },
  { target: 'buenas tardes', native: 'good afternoon', category: 'other' },

  // ==================== ADJECTIVES ====================
  { target: 'bonito', native: 'beautiful/pretty', category: 'adjective' },
  { target: 'hermoso', native: 'beautiful', category: 'adjective' },
  { target: 'grande', native: 'big', category: 'adjective' },
  { target: 'pequeno', native: 'small', category: 'adjective' },
  { target: 'alto', native: 'tall', category: 'adjective' },
  { target: 'bajo', native: 'short', category: 'adjective' },
  { target: 'verde', native: 'green', category: 'adjective' },
  { target: 'azul', native: 'blue', category: 'adjective' },
  { target: 'rojo', native: 'red', category: 'adjective' },
  { target: 'amarillo', native: 'yellow', category: 'adjective' },
  { target: 'blanco', native: 'white', category: 'adjective' },
  { target: 'rosado', native: 'pink', category: 'adjective' },
  { target: 'tranquilo', native: 'calm/peaceful', category: 'adjective' },
  { target: 'agradable', native: 'pleasant', category: 'adjective' },
  { target: 'fresco', native: 'fresh/cool', category: 'adjective' },
  { target: 'lleno', native: 'full', category: 'adjective' },
  { target: 'vacio', native: 'empty', category: 'adjective' },
];

import type { NPCDescription, ModuleInteraction, TeachingNotes } from '../../../engine/types.js';

const npcDescriptions: NPCDescription[] = [
  { id: 'ice_cream_vendor', personality: 'Friendly elderly ice cream vendor at the kiosk. Talks about weather constantly. Recommends flavors based on temperature. Speaks slowly and clearly.' },
  { id: 'pigeon_feeder', personality: 'Quiet elderly man at the fountain who feeds pigeons. Observes nature and uses present progressive to describe ongoing actions. Very patient and kind.' },
];

const interactions: ModuleInteraction[] = [
  { triggers: ['hace buen tiempo', 'hace sol'], goalComplete: ['commented_weather', 'check_weather'], note: 'present tense weather expressions' },
  { triggers: ['estoy caminando por el sendero'], goalComplete: ['walk_the_path'], note: 'practice present progressive' },
  { triggers: ['la ardilla esta corriendo', 'los pajaros estan volando'], goalComplete: ['observed_animals', 'observe_nature'], note: 'describe what animals are doing' },
  { triggers: ['hola senor, que esta haciendo?'], actions: [{ type: 'talk', npcId: 'pigeon_feeder' }], goalComplete: ['talked_to_ramon', 'talk_to_don_ramon'] },
  { triggers: ['quiero un helado de chocolate'], actions: [{ type: 'talk', npcId: 'ice_cream_vendor' }], goalComplete: ['got_ice_cream', 'buy_ice_cream'] },
  { triggers: ['esta nublado', 'va a llover'], goalComplete: ['weather_reaction', 'weather_changes'], note: 'react to weather' },
];

const teachingNotes: TeachingNotes = {
  title: 'KEY SPANISH FOR WEATHER (teach these patterns)',
  patterns: [
    '"Hace + noun" - Hace sol (it\'s sunny), Hace frio (it\'s cold), Hace calor (it\'s hot)',
    '"Esta + adjective" - Esta nublado (it\'s cloudy), Esta lloviendo (it\'s raining)',
    'Present progressive: "estar + gerund" - Estoy caminando (I am walking), Esta comiendo (he/she is eating)',
  ],
};

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
  promptInstructions: '',
  npcDescriptions,
  interactions,
  teachingNotes,
};
