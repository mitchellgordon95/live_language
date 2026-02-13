import type { Location, Goal, VocabWord, GameState, NPC, WorldObject, ModuleDefinition } from '../../../engine/types.js';

// ============================================================================
// LOCATIONS (exits only -- objects are in the flat list below)
// ============================================================================

const locations: Record<string, Location> = {
  park_entrance: {
    id: 'park_entrance',
    name: { target: 'la entrada del parque', native: 'park entrance' },
    exits: [
      { to: 'main_path', name: { target: 'el sendero principal', native: 'main path' } },
      { to: 'street', name: { target: 'la calle', native: 'street' } },
    ],
  },
  main_path: {
    id: 'main_path',
    name: { target: 'el sendero principal', native: 'main path' },
    exits: [
      { to: 'park_entrance', name: { target: 'la entrada', native: 'entrance' } },
      { to: 'fountain_area', name: { target: 'la fuente', native: 'fountain' } },
      { to: 'garden', name: { target: 'el jardin', native: 'garden' } },
      { to: 'playground', name: { target: 'el area de juegos', native: 'playground' } },
    ],
  },
  fountain_area: {
    id: 'fountain_area',
    name: { target: 'el area de la fuente', native: 'fountain area' },
    exits: [
      { to: 'main_path', name: { target: 'el sendero', native: 'path' } },
      { to: 'kiosk', name: { target: 'el quiosco', native: 'kiosk' } },
    ],
  },
  garden: {
    id: 'garden',
    name: { target: 'el jardin', native: 'garden' },
    exits: [
      { to: 'main_path', name: { target: 'el sendero', native: 'path' } },
    ],
  },
  playground: {
    id: 'playground',
    name: { target: 'el area de juegos', native: 'playground' },
    exits: [
      { to: 'main_path', name: { target: 'el sendero', native: 'path' } },
    ],
  },
  kiosk: {
    id: 'kiosk',
    name: { target: 'el quiosco', native: 'kiosk' },
    exits: [
      { to: 'fountain_area', name: { target: 'la fuente', native: 'fountain' } },
      { to: 'main_path', name: { target: 'el sendero', native: 'path' } },
    ],
  },
};

// ============================================================================
// OBJECTS (flat list -- each knows its own location)
// ============================================================================

const objects: WorldObject[] = [
  // Park entrance
  { id: 'park_gate', name: { target: 'la puerta del parque', native: 'park gate' }, location: 'park_entrance', tags: ['open'] },
  { id: 'park_sign', name: { target: 'el letrero del parque', native: 'park sign' }, location: 'park_entrance', tags: [] },
  { id: 'park_map', name: { target: 'el mapa del parque', native: 'park map' }, location: 'park_entrance', tags: [] },
  { id: 'entrance_bench', name: { target: 'el banco', native: 'bench' }, location: 'park_entrance', tags: [] },
  { id: 'trash_can', name: { target: 'el bote de basura', native: 'trash can' }, location: 'park_entrance', tags: [] },

  // Main path
  { id: 'oak_tree', name: { target: 'el roble', native: 'oak tree' }, location: 'main_path', tags: [] },
  { id: 'pine_tree', name: { target: 'el pino', native: 'pine tree' }, location: 'main_path', tags: [] },
  { id: 'path_bench', name: { target: 'el banco', native: 'bench' }, location: 'main_path', tags: [] },
  { id: 'squirrel', name: { target: 'la ardilla', native: 'squirrel' }, location: 'main_path', tags: [] },
  { id: 'fallen_leaves', name: { target: 'las hojas caidas', native: 'fallen leaves' }, location: 'main_path', tags: [] },
  { id: 'lamp_post', name: { target: 'el farol', native: 'lamp post' }, location: 'main_path', tags: ['off'] },

  // Fountain area
  { id: 'fountain', name: { target: 'la fuente', native: 'fountain' }, location: 'fountain_area', tags: ['on'] },
  { id: 'fountain_bench', name: { target: 'el banco', native: 'bench' }, location: 'fountain_area', tags: [] },
  { id: 'pigeons', name: { target: 'las palomas', native: 'pigeons' }, location: 'fountain_area', tags: [] },
  { id: 'coins_in_fountain', name: { target: 'las monedas en la fuente', native: 'coins in fountain' }, location: 'fountain_area', tags: [] },
  { id: 'statue', name: { target: 'la estatua', native: 'statue' }, location: 'fountain_area', tags: [] },

  // Garden
  { id: 'roses', name: { target: 'las rosas', native: 'roses' }, location: 'garden', tags: ['blooming', 'red'] },
  { id: 'tulips', name: { target: 'los tulipanes', native: 'tulips' }, location: 'garden', tags: ['blooming'] },
  { id: 'sunflowers', name: { target: 'los girasoles', native: 'sunflowers' }, location: 'garden', tags: ['blooming'] },
  { id: 'butterfly', name: { target: 'la mariposa', native: 'butterfly' }, location: 'garden', tags: [] },
  { id: 'bee', name: { target: 'la abeja', native: 'bee' }, location: 'garden', tags: [] },
  { id: 'garden_bench', name: { target: 'el banco del jardin', native: 'garden bench' }, location: 'garden', tags: [] },
  { id: 'flower_bed', name: { target: 'el macizo de flores', native: 'flower bed' }, location: 'garden', tags: [] },
  { id: 'watering_can', name: { target: 'la regadera', native: 'watering can' }, location: 'garden', tags: ['takeable'] },

  // Playground
  { id: 'swings', name: { target: 'los columpios', native: 'swings' }, location: 'playground', tags: [] },
  { id: 'slide', name: { target: 'el tobogan', native: 'slide' }, location: 'playground', tags: [] },
  { id: 'sandbox', name: { target: 'el arenero', native: 'sandbox' }, location: 'playground', tags: [] },
  { id: 'seesaw', name: { target: 'el sube y baja', native: 'seesaw' }, location: 'playground', tags: [] },
  { id: 'monkey_bars', name: { target: 'las barras', native: 'monkey bars' }, location: 'playground', tags: [] },
  { id: 'children_playing', name: { target: 'los ninos jugando', native: 'children playing' }, location: 'playground', tags: [] },
  { id: 'ball', name: { target: 'la pelota', native: 'ball' }, location: 'playground', tags: ['takeable'] },

  // Kiosk
  { id: 'ice_cream_cart', name: { target: 'el carrito de helados', native: 'ice cream cart' }, location: 'kiosk', tags: [] },
  { id: 'ice_cream_menu', name: { target: 'el menu de helados', native: 'ice cream menu' }, location: 'kiosk', tags: [] },
  { id: 'chocolate_ice_cream', name: { target: 'el helado de chocolate', native: 'chocolate ice cream' }, location: 'kiosk', tags: ['takeable', 'consumable'], needsEffect: { hunger: 15 } },
  { id: 'vanilla_ice_cream', name: { target: 'el helado de vainilla', native: 'vanilla ice cream' }, location: 'kiosk', tags: ['takeable', 'consumable'], needsEffect: { hunger: 15 } },
  { id: 'strawberry_ice_cream', name: { target: 'el helado de fresa', native: 'strawberry ice cream' }, location: 'kiosk', tags: ['takeable', 'consumable'], needsEffect: { hunger: 15 } },
  { id: 'water_bottle', name: { target: 'la botella de agua', native: 'water bottle' }, location: 'kiosk', tags: ['takeable', 'consumable'], needsEffect: { hunger: 5 } },
  { id: 'umbrella', name: { target: 'el paraguas', native: 'umbrella' }, location: 'kiosk', tags: ['takeable', 'closed'] },
  { id: 'kiosk_bench', name: { target: 'el banco', native: 'bench' }, location: 'kiosk', tags: [] },
];

// ============================================================================
// NPCs
// ============================================================================

const npcs: NPC[] = [
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

// ============================================================================
// GOALS (checkComplete uses new state model)
// ============================================================================

const goals: Goal[] = [
  {
    id: 'arrive_at_park',
    title: 'Arrive at the park',
    description: 'Walk to the park entrance and take in the scenery.',
    hint: 'Try "Voy al parque" (I go to the park)',
    checkComplete: (state: GameState) => state.currentLocation === 'park_entrance',
    nextGoalId: 'check_weather',
  },
  {
    id: 'check_weather',
    title: 'Check the weather',
    description: 'Look around and comment on the weather. Is it nice out?',
    hint: 'Try "Hace buen tiempo" (The weather is nice) or "Hace sol" (It is sunny)',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('check_weather'),
    nextGoalId: 'walk_the_path',
  },
  {
    id: 'walk_the_path',
    title: 'Walk along the main path',
    description: 'Stroll through the park, describing what you are doing.',
    hint: 'Try "Estoy caminando por el sendero" (I am walking along the path)',
    checkComplete: (state: GameState) =>
      state.currentLocation === 'main_path' ||
      state.completedGoals.includes('walk_the_path'),
    nextGoalId: 'observe_nature',
  },
  {
    id: 'observe_nature',
    title: 'Observe the animals',
    description: 'Watch the squirrels and birds. What are they doing?',
    hint: 'Try "La ardilla esta corriendo" (The squirrel is running) or "Los pajaros estan volando" (The birds are flying)',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('observe_nature'),
    nextGoalId: 'visit_fountain',
  },
  {
    id: 'visit_fountain',
    title: 'Go to the fountain',
    description: 'Walk to the fountain area and see who is there.',
    hint: 'Try "Voy a la fuente" (I go to the fountain)',
    checkComplete: (state: GameState) => state.currentLocation === 'fountain_area',
    nextGoalId: 'talk_to_don_ramon',
  },
  {
    id: 'talk_to_don_ramon',
    title: 'Talk to Don Ramon',
    description: 'The elderly man is feeding pigeons. Ask what he is doing.',
    hint: 'Try "Hola, senor. Que esta haciendo?" (Hello sir. What are you doing?)',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('talk_to_don_ramon'),
    nextGoalId: 'buy_ice_cream',
  },
  {
    id: 'buy_ice_cream',
    title: 'Get some ice cream',
    description: 'Go to the kiosk and order ice cream from Senor Gomez.',
    hint: 'Try "Quiero un helado de chocolate" (I want a chocolate ice cream) or "Me da un helado, por favor"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('buy_ice_cream') ||
      state.objects.some(o => o.id.includes('ice_cream') && o.location === 'inventory'),
    nextGoalId: 'weather_changes',
  },
  {
    id: 'weather_changes',
    title: 'React to the weather',
    description: 'The clouds are rolling in! Comment on the changing weather.',
    hint: 'Try "Esta nublado" (It is cloudy) or "Va a llover" (It is going to rain)',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('weather_changes'),
    nextGoalId: 'park_complete',
  },
  {
    id: 'park_complete',
    title: 'Park visit complete!',
    description: 'Congratulations! You practiced weather expressions and the present progressive tense.',
    checkComplete: (state: GameState) => state.completedGoals.includes('weather_changes'),
  },
];

// ============================================================================
// VOCABULARY
// ============================================================================

const vocabulary: VocabWord[] = [
  // Locations
  { target: 'el parque', native: 'park', category: 'noun', gender: 'masculine' },
  { target: 'la entrada', native: 'entrance', category: 'noun', gender: 'feminine' },
  { target: 'el sendero', native: 'path', category: 'noun', gender: 'masculine' },
  { target: 'el camino', native: 'way/road', category: 'noun', gender: 'masculine' },
  { target: 'la fuente', native: 'fountain', category: 'noun', gender: 'feminine' },
  { target: 'el jardin', native: 'garden', category: 'noun', gender: 'masculine' },
  { target: 'el area de juegos', native: 'playground', category: 'noun', gender: 'feminine' },
  { target: 'el quiosco', native: 'kiosk', category: 'noun', gender: 'masculine' },

  // Weather - hacer expressions
  { target: 'hace sol', native: 'it is sunny', category: 'other' },
  { target: 'hace calor', native: 'it is hot', category: 'other' },
  { target: 'hace frio', native: 'it is cold', category: 'other' },
  { target: 'hace viento', native: 'it is windy', category: 'other' },
  { target: 'hace buen tiempo', native: 'the weather is nice', category: 'other' },
  { target: 'hace mal tiempo', native: 'the weather is bad', category: 'other' },
  { target: 'hace fresco', native: 'it is cool', category: 'other' },

  // Weather - estar expressions
  { target: 'esta nublado', native: 'it is cloudy', category: 'other' },
  { target: 'esta lloviendo', native: 'it is raining', category: 'other' },
  { target: 'esta nevando', native: 'it is snowing', category: 'other' },
  { target: 'esta despejado', native: 'it is clear', category: 'other' },
  { target: 'esta humedo', native: 'it is humid', category: 'other' },
  { target: 'esta soleado', native: 'it is sunny', category: 'other' },

  // Weather nouns
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

  // Weather adjectives
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

  // Trees
  { target: 'el arbol', native: 'tree', category: 'noun', gender: 'masculine' },
  { target: 'los arboles', native: 'trees', category: 'noun', gender: 'masculine' },
  { target: 'el roble', native: 'oak tree', category: 'noun', gender: 'masculine' },
  { target: 'el pino', native: 'pine tree', category: 'noun', gender: 'masculine' },
  { target: 'la hoja', native: 'leaf', category: 'noun', gender: 'feminine' },
  { target: 'las hojas', native: 'leaves', category: 'noun', gender: 'feminine' },
  { target: 'la rama', native: 'branch', category: 'noun', gender: 'feminine' },
  { target: 'el tronco', native: 'trunk', category: 'noun', gender: 'masculine' },

  // Flowers
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

  // Animals
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

  // Park objects
  { target: 'el banco', native: 'bench', category: 'noun', gender: 'masculine' },
  { target: 'la estatua', native: 'statue', category: 'noun', gender: 'feminine' },
  { target: 'el farol', native: 'lamp post', category: 'noun', gender: 'masculine' },
  { target: 'el letrero', native: 'sign', category: 'noun', gender: 'masculine' },
  { target: 'el mapa', native: 'map', category: 'noun', gender: 'masculine' },
  { target: 'el bote de basura', native: 'trash can', category: 'noun', gender: 'masculine' },
  { target: 'la regadera', native: 'watering can', category: 'noun', gender: 'feminine' },
  { target: 'el paraguas', native: 'umbrella', category: 'noun', gender: 'masculine' },

  // Playground
  { target: 'el columpio', native: 'swing', category: 'noun', gender: 'masculine' },
  { target: 'los columpios', native: 'swings', category: 'noun', gender: 'masculine' },
  { target: 'el tobogan', native: 'slide', category: 'noun', gender: 'masculine' },
  { target: 'el arenero', native: 'sandbox', category: 'noun', gender: 'masculine' },
  { target: 'el sube y baja', native: 'seesaw', category: 'noun', gender: 'masculine' },
  { target: 'las barras', native: 'monkey bars', category: 'noun', gender: 'feminine' },
  { target: 'la pelota', native: 'ball', category: 'noun', gender: 'feminine' },

  // Food and drinks
  { target: 'el helado', native: 'ice cream', category: 'noun', gender: 'masculine' },
  { target: 'el helado de chocolate', native: 'chocolate ice cream', category: 'noun', gender: 'masculine' },
  { target: 'el helado de vainilla', native: 'vanilla ice cream', category: 'noun', gender: 'masculine' },
  { target: 'el helado de fresa', native: 'strawberry ice cream', category: 'noun', gender: 'masculine' },
  { target: 'la botella de agua', native: 'water bottle', category: 'noun', gender: 'feminine' },
  { target: 'el carrito', native: 'cart', category: 'noun', gender: 'masculine' },

  // People
  { target: 'el nino', native: 'boy/child', category: 'noun', gender: 'masculine' },
  { target: 'la nina', native: 'girl', category: 'noun', gender: 'feminine' },
  { target: 'los ninos', native: 'children', category: 'noun', gender: 'masculine' },
  { target: 'el senor', native: 'sir/Mr.', category: 'noun', gender: 'masculine' },
  { target: 'la senora', native: 'madam/Mrs.', category: 'noun', gender: 'feminine' },
  { target: 'el vendedor', native: 'vendor', category: 'noun', gender: 'masculine' },
  { target: 'la familia', native: 'family', category: 'noun', gender: 'feminine' },

  // Present progressive - estar + gerund
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

  // Action verbs (infinitive)
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

  // Simple present verbs (yo form)
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

  // Question words and phrases
  { target: 'que tiempo hace', native: 'what is the weather like', category: 'other' },
  { target: 'que esta haciendo', native: 'what is he/she doing', category: 'other' },
  { target: 'que estan haciendo', native: 'what are they doing', category: 'other' },
  { target: 'adonde vas', native: 'where are you going', category: 'other' },
  { target: 'cuanto cuesta', native: 'how much does it cost', category: 'other' },
  { target: 'que quieres', native: 'what do you want', category: 'other' },

  // Prepositions and connectors
  { target: 'por', native: 'through/along', category: 'other' },
  { target: 'hacia', native: 'toward', category: 'other' },
  { target: 'cerca de', native: 'near', category: 'other' },
  { target: 'lejos de', native: 'far from', category: 'other' },
  { target: 'al lado de', native: 'next to', category: 'other' },
  { target: 'debajo de', native: 'under', category: 'other' },
  { target: 'encima de', native: 'on top of', category: 'other' },
  { target: 'entre', native: 'between', category: 'other' },
  { target: 'alrededor de', native: 'around', category: 'other' },

  // Useful expressions
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

  // Adjectives
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

// ============================================================================
// MODULE EXPORT
// ============================================================================

export const parkModule: ModuleDefinition = {
  name: 'park',
  displayName: 'Park',
  locations,
  objects,
  npcs,
  goals,
  vocabulary,
  startLocationId: 'park_entrance',
  startGoalId: 'arrive_at_park',
  locationIds: Object.keys(locations),
  unlockLevel: 3,

  guidance: `PARK ENVIRONMENT:
A sunny public park with tree-lined paths, a fountain plaza, flower garden, playground, and ice cream kiosk.
The player is learning weather expressions (hacer/estar) and present progressive tense (estar + gerund).

TEACHING FOCUS:
- "Hace + noun" for weather: Hace sol (sunny), Hace frio (cold), Hace calor (hot), Hace viento (windy), Hace buen tiempo (nice weather)
- "Esta + adjective" for weather: Esta nublado (cloudy), Esta lloviendo (raining), Esta despejado (clear)
- Present progressive "estar + gerund": Estoy caminando (I am walking), Esta comiendo (he/she is eating), Estan jugando (they are playing)
- Weather comments and nature observations are valid even without object/NPC actions. Set valid=true with empty mutations array -- these are speech-only interactions.

OBJECTS:
- park_gate: Entrance gate, starts open. Can be opened/closed via tag changes.
- park_sign, park_map: Informational objects at entrance. Look only.
- fountain: In fountain_area, starts "on". Water feature the player can observe and describe.
- roses: In garden, tags "blooming" and "red". Describe with colors and adjectives.
- tulips, sunflowers: In garden, tag "blooming". Nature description targets.
- squirrel, butterfly, bee, pigeons: Animals to observe. Practice present progressive ("la ardilla esta corriendo").
- watering_can: In garden, takeable. Can be picked up and used on flowers.
- ball: In playground, takeable. Can be picked up and played with.
- swings, slide, sandbox, seesaw, monkey_bars: Playground equipment the player can use and describe.
- ice_cream_cart, ice_cream_menu: At kiosk. Look to see available flavors.
- chocolate_ice_cream, vanilla_ice_cream, strawberry_ice_cream: Takeable and consumable. Buying = talk to ice_cream_vendor, then move ice cream to inventory. Eating = remove mutation + needs mutation (hunger: 15).
- water_bottle: Takeable and consumable at kiosk (hunger: 5).
- umbrella: Takeable at kiosk, starts "closed". Can add "open" tag / remove "closed" tag if it rains.
- lamp_post: On main path, starts "off". Scenery item.

NPCs:
- Senor Gomez (ice_cream_vendor): At kiosk. Friendly elderly vendor, male.
  Talks about the weather constantly. Recommends flavors based on temperature ("Hace calor, le recomiendo el helado de fresa").
  Speaks slowly and clearly for learners. When player orders ice cream, respond warmly and move the chosen ice cream to inventory.
  Buying ice cream = talking to this NPC, not a direct take action.
- Don Ramon (pigeon_feeder): At fountain_area. Quiet elderly man, male.
  Feeds pigeons every day. Observes nature and describes what he sees using present progressive ("Las palomas estan comiendo", "El agua esta cayendo").
  Very patient and kind. Encourages the player to describe what they see too.

GOAL COMPLETION:
- arrive_at_park: Player is in park_entrance
- check_weather: Player makes any weather comment (hacer or estar expression)
- walk_the_path: Player is in main_path or describes walking
- observe_nature: Player describes animal actions using present progressive
- visit_fountain: Player is in fountain_area
- talk_to_don_ramon: Player talks to Don Ramon (pigeon_feeder)
- buy_ice_cream: Player orders/gets ice cream from Senor Gomez, or has ice cream in inventory
- weather_changes: Player reacts to weather change (cloudy, rain, etc.)
- park_complete: Automatically completes when weather_changes is done`,
};
