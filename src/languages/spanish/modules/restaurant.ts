import type { Location, TutorialStep, VocabWord, NPC, WorldObject, ModuleDefinition } from '../../../engine/types.js';

// ============================================================================
// LOCATIONS (exits only -- objects are in the flat list below)
// ============================================================================

const locations: Record<string, Location> = {
  restaurant_entrance: {
    id: 'restaurant_entrance',
    name: { target: 'la entrada del restaurante', native: 'restaurant entrance' },
    exits: [
      { to: 'restaurant_table', name: { target: 'las mesas', native: 'dining area' } },
      { to: 'street', name: { target: 'la calle', native: 'street' } },
    ],
    verbs: [
      { target: 'hablo con', native: 'I talk to' },
      { target: 'quiero', native: 'I want' },
      { target: 'me siento', native: 'I sit down' },
    ],
  },
  restaurant_table: {
    id: 'restaurant_table',
    name: { target: 'la mesa', native: 'your table' },
    exits: [
      { to: 'restaurant_entrance', name: { target: 'la entrada', native: 'entrance' } },
      { to: 'restaurant_kitchen', name: { target: 'la cocina', native: 'kitchen' } },
      { to: 'restaurant_cashier', name: { target: 'la caja', native: 'cashier' } },
      { to: 'restaurant_bathroom', name: { target: 'el bano', native: 'bathroom' } },
    ],
    verbs: [
      { target: 'pido', native: 'I order' },
      { target: 'como', native: 'I eat' },
      { target: 'bebo', native: 'I drink' },
      { target: 'le pido', native: 'I ask for' },
      { target: 'quiero', native: 'I want' },
    ],
  },
  restaurant_kitchen: {
    id: 'restaurant_kitchen',
    name: { target: 'la cocina', native: 'kitchen' },
    exits: [
      { to: 'restaurant_table', name: { target: 'el comedor', native: 'dining room' } },
    ],
    verbs: [
      { target: 'miro', native: 'I look at' },
      { target: 'hablo con', native: 'I talk to' },
    ],
  },
  restaurant_cashier: {
    id: 'restaurant_cashier',
    name: { target: 'la caja', native: 'cashier' },
    exits: [
      { to: 'restaurant_table', name: { target: 'el comedor', native: 'dining room' } },
      { to: 'restaurant_entrance', name: { target: 'la entrada', native: 'entrance' } },
    ],
    verbs: [
      { target: 'pago', native: 'I pay' },
      { target: 'dejo propina', native: 'I leave a tip' },
      { target: 'le pido', native: 'I ask for' },
    ],
  },
  restaurant_bathroom: {
    id: 'restaurant_bathroom',
    name: { target: 'el bano', native: 'bathroom' },
    exits: [
      { to: 'restaurant_table', name: { target: 'el comedor', native: 'dining room' } },
    ],
    verbs: [
      { target: 'me lavo', native: 'I wash' },
      { target: 'uso', native: 'I use' },
    ],
  },
};

// ============================================================================
// OBJECTS (flat list -- each knows its own location)
// ============================================================================

const objects: WorldObject[] = [
  // Entrance
  { id: 'host_stand', name: { target: 'el podio del anfitrion', native: 'host stand' }, location: 'restaurant_entrance', tags: [] },
  { id: 'waiting_bench', name: { target: 'el banco de espera', native: 'waiting bench' }, location: 'restaurant_entrance', tags: [] },
  { id: 'restaurant_menu_display', name: { target: 'el menu en la vitrina', native: 'menu display' }, location: 'restaurant_entrance', tags: [] },
  { id: 'coat_rack', name: { target: 'el perchero', native: 'coat rack' }, location: 'restaurant_entrance', tags: [] },

  // Table
  { id: 'menu', name: { target: 'el menu', native: 'menu' }, location: 'restaurant_table', tags: ['closed'] },
  { id: 'table_plate', name: { target: 'el plato', native: 'plate' }, location: 'restaurant_table', tags: [] },
  { id: 'water_glass', name: { target: 'el vaso de agua', native: 'water glass' }, location: 'restaurant_table', tags: ['filled', 'consumable'], needsEffect: { hunger: 5 } },
  { id: 'wine_glass', name: { target: 'la copa de vino', native: 'wine glass' }, location: 'restaurant_table', tags: ['consumable'] },
  { id: 'napkin', name: { target: 'la servilleta', native: 'napkin' }, location: 'restaurant_table', tags: ['takeable'] },
  { id: 'silverware', name: { target: 'los cubiertos', native: 'silverware' }, location: 'restaurant_table', tags: [] },
  { id: 'bread_basket', name: { target: 'la cesta de pan', native: 'bread basket' }, location: 'restaurant_table', tags: ['consumable'], needsEffect: { hunger: 10 } },
  { id: 'bill', name: { target: 'la cuenta', native: 'the bill' }, location: 'restaurant_table', tags: [] },

  // Kitchen
  { id: 'kitchen_stove', name: { target: 'la estufa', native: 'stove' }, location: 'restaurant_kitchen', tags: ['on'] },
  { id: 'prep_counter', name: { target: 'el mostrador', native: 'prep counter' }, location: 'restaurant_kitchen', tags: [] },
  { id: 'order_tickets', name: { target: 'los pedidos', native: 'order tickets' }, location: 'restaurant_kitchen', tags: [] },

  // Cashier
  { id: 'cash_register', name: { target: 'la caja registradora', native: 'cash register' }, location: 'restaurant_cashier', tags: [] },
  { id: 'card_reader', name: { target: 'el lector de tarjetas', native: 'card reader' }, location: 'restaurant_cashier', tags: [] },
  { id: 'tip_jar', name: { target: 'el frasco de propinas', native: 'tip jar' }, location: 'restaurant_cashier', tags: [] },

  // Bathroom
  { id: 'restaurant_toilet', name: { target: 'el inodoro', native: 'toilet' }, location: 'restaurant_bathroom', tags: [], needsEffect: { bladder: 50 } },
  { id: 'restaurant_sink', name: { target: 'el lavabo', native: 'sink' }, location: 'restaurant_bathroom', tags: [], needsEffect: { hygiene: 10 } },
  { id: 'restaurant_mirror', name: { target: 'el espejo', native: 'mirror' }, location: 'restaurant_bathroom', tags: [] },
  { id: 'paper_towels', name: { target: 'las toallas de papel', native: 'paper towels' }, location: 'restaurant_bathroom', tags: ['takeable'] },
  { id: 'hand_dryer', name: { target: 'el secador de manos', native: 'hand dryer' }, location: 'restaurant_bathroom', tags: ['off'] },
  { id: 'soap_dispenser', name: { target: 'el dispensador de jabon', native: 'soap dispenser' }, location: 'restaurant_bathroom', tags: [], needsEffect: { hygiene: 5 } },
];

// ============================================================================
// NPCs
// ============================================================================

const npcs: NPC[] = [
  {
    id: 'host',
    name: { target: 'el anfitrion', native: 'host' },
    location: 'restaurant_entrance',
    personality: 'Professional and welcoming. Greets customers and seats them. Speaks formally with "usted". Will ask "Mesa para cuantos?" (Table for how many?) and guide player to their table.',
    gender: 'male',
  },
  {
    id: 'waiter',
    name: { target: 'el mesero', native: 'waiter' },
    location: 'restaurant_table',
    personality: 'Friendly and attentive waiter named Diego. Takes orders politely. Uses both formal "usted" and friendly tone. Will suggest specials, ask about drinks first, then food. Key phrases: "Que desea tomar?" (What would you like to drink?), "Ya decidio?" (Have you decided?), "Algo mas?" (Anything else?), "Enseguida" (Right away).',
    gender: 'male',
  },
  {
    id: 'chef',
    name: { target: 'el chef', native: 'chef' },
    location: 'restaurant_kitchen',
    personality: 'Busy and passionate chef named Rosa. Speaks quickly and uses cooking terms. Can be seen through kitchen window. Occasionally comes out to check on diners. Proud of the food.',
    gender: 'female',
  },
];

// ============================================================================
// GOALS (checkComplete uses new state model)
// ============================================================================

const tutorial: TutorialStep[] = [];

// ============================================================================
// VOCABULARY
// ============================================================================

const vocabulary: VocabWord[] = [
  // Restaurant locations
  { target: 'el restaurante', native: 'restaurant', category: 'noun', gender: 'masculine' },
  { target: 'la entrada', native: 'entrance', category: 'noun', gender: 'feminine' },
  { target: 'la mesa', native: 'table', category: 'noun', gender: 'feminine' },
  { target: 'la caja', native: 'cashier/register', category: 'noun', gender: 'feminine' },
  { target: 'el comedor', native: 'dining room', category: 'noun', gender: 'masculine' },

  // Table items
  { target: 'el menu', native: 'menu', category: 'noun', gender: 'masculine' },
  { target: 'el plato', native: 'plate', category: 'noun', gender: 'masculine' },
  { target: 'el vaso', native: 'glass', category: 'noun', gender: 'masculine' },
  { target: 'la copa', native: 'wine glass', category: 'noun', gender: 'feminine' },
  { target: 'la servilleta', native: 'napkin', category: 'noun', gender: 'feminine' },
  { target: 'los cubiertos', native: 'silverware', category: 'noun', gender: 'masculine' },
  { target: 'el tenedor', native: 'fork', category: 'noun', gender: 'masculine' },
  { target: 'el cuchillo', native: 'knife', category: 'noun', gender: 'masculine' },
  { target: 'la cuchara', native: 'spoon', category: 'noun', gender: 'feminine' },
  { target: 'la cuenta', native: 'bill/check', category: 'noun', gender: 'feminine' },
  { target: 'la propina', native: 'tip', category: 'noun', gender: 'feminine' },

  // People
  { target: 'el mesero', native: 'waiter', category: 'noun', gender: 'masculine' },
  { target: 'la mesera', native: 'waitress', category: 'noun', gender: 'feminine' },
  { target: 'el camarero', native: 'waiter (Spain)', category: 'noun', gender: 'masculine' },
  { target: 'el anfitrion', native: 'host', category: 'noun', gender: 'masculine' },
  { target: 'el chef', native: 'chef', category: 'noun', gender: 'masculine' },

  // Drinks
  { target: 'el agua', native: 'water', category: 'noun', gender: 'feminine' },
  { target: 'el refresco', native: 'soda', category: 'noun', gender: 'masculine' },
  { target: 'la limonada', native: 'lemonade', category: 'noun', gender: 'feminine' },
  { target: 'la cerveza', native: 'beer', category: 'noun', gender: 'feminine' },
  { target: 'el vino', native: 'wine', category: 'noun', gender: 'masculine' },
  { target: 'el vino tinto', native: 'red wine', category: 'noun', gender: 'masculine' },
  { target: 'el vino blanco', native: 'white wine', category: 'noun', gender: 'masculine' },
  { target: 'el cafe', native: 'coffee', category: 'noun', gender: 'masculine' },

  // Food categories
  { target: 'las bebidas', native: 'drinks', category: 'noun', gender: 'feminine' },
  { target: 'las entradas', native: 'appetizers', category: 'noun', gender: 'feminine' },
  { target: 'los platos principales', native: 'main courses', category: 'noun', gender: 'masculine' },
  { target: 'los postres', native: 'desserts', category: 'noun', gender: 'masculine' },

  // Food items
  { target: 'la sopa', native: 'soup', category: 'noun', gender: 'feminine' },
  { target: 'la ensalada', native: 'salad', category: 'noun', gender: 'feminine' },
  { target: 'el guacamole', native: 'guacamole', category: 'noun', gender: 'masculine' },
  { target: 'los nachos', native: 'nachos', category: 'noun', gender: 'masculine' },
  { target: 'el pollo', native: 'chicken', category: 'noun', gender: 'masculine' },
  { target: 'la carne', native: 'beef/meat', category: 'noun', gender: 'feminine' },
  { target: 'el pescado', native: 'fish', category: 'noun', gender: 'masculine' },
  { target: 'los tacos', native: 'tacos', category: 'noun', gender: 'masculine' },
  { target: 'las enchiladas', native: 'enchiladas', category: 'noun', gender: 'feminine' },
  { target: 'el arroz', native: 'rice', category: 'noun', gender: 'masculine' },
  { target: 'los frijoles', native: 'beans', category: 'noun', gender: 'masculine' },
  { target: 'las papas fritas', native: 'french fries', category: 'noun', gender: 'feminine' },
  { target: 'la hamburguesa', native: 'hamburger', category: 'noun', gender: 'feminine' },
  { target: 'el flan', native: 'flan', category: 'noun', gender: 'masculine' },
  { target: 'el helado', native: 'ice cream', category: 'noun', gender: 'masculine' },
  { target: 'el pastel', native: 'cake', category: 'noun', gender: 'masculine' },
  { target: 'los churros', native: 'churros', category: 'noun', gender: 'masculine' },

  // KEY VERBS - Ordering & Requesting
  { target: 'quiero', native: 'I want', category: 'verb' },
  { target: 'quieres', native: 'you want (informal)', category: 'verb' },
  { target: 'quiere', native: 'he/she/you(formal) wants', category: 'verb' },
  { target: 'queremos', native: 'we want', category: 'verb' },
  { target: 'quisiera', native: 'I would like (polite)', category: 'verb' },
  { target: 'pido', native: 'I order/ask for', category: 'verb' },
  { target: 'pides', native: 'you order (informal)', category: 'verb' },
  { target: 'pide', native: 'he/she orders', category: 'verb' },
  { target: 'pedimos', native: 'we order', category: 'verb' },

  // Payment & Service verbs
  { target: 'pago', native: 'I pay', category: 'verb' },
  { target: 'pagas', native: 'you pay', category: 'verb' },
  { target: 'paga', native: 'he/she pays', category: 'verb' },
  { target: 'traigo', native: 'I bring', category: 'verb' },
  { target: 'traes', native: 'you bring', category: 'verb' },
  { target: 'trae', native: 'he/she brings', category: 'verb' },
  { target: 'dejo', native: 'I leave (tip)', category: 'verb' },

  // Request structures
  { target: 'me trae...?', native: 'can you bring me...?', category: 'verb' },
  { target: 'me puede traer...?', native: 'can you bring me...?', category: 'verb' },
  { target: 'podria traerme...?', native: 'could you bring me...? (formal)', category: 'verb' },

  // Polite phrases
  { target: 'por favor', native: 'please', category: 'other' },
  { target: 'gracias', native: 'thank you', category: 'other' },
  { target: 'muchas gracias', native: 'thank you very much', category: 'other' },
  { target: 'de nada', native: 'you\'re welcome', category: 'other' },
  { target: 'disculpe', native: 'excuse me (formal)', category: 'other' },
  { target: 'perdon', native: 'sorry/pardon', category: 'other' },
  { target: 'buenas noches', native: 'good evening', category: 'other' },
  { target: 'buenas tardes', native: 'good afternoon', category: 'other' },

  // Restaurant phrases
  { target: 'una mesa para uno', native: 'a table for one', category: 'other' },
  { target: 'una mesa para dos', native: 'a table for two', category: 'other' },
  { target: 'la cuenta, por favor', native: 'the bill, please', category: 'other' },
  { target: 'que recomienda?', native: 'what do you recommend?', category: 'other' },
  { target: 'que tiene...?', native: 'what does ... have?', category: 'other' },
  { target: 'cuanto cuesta?', native: 'how much does it cost?', category: 'other' },
  { target: 'cuanto es?', native: 'how much is it?', category: 'other' },
  { target: 'esta delicioso!', native: 'it\'s delicious!', category: 'other' },
  { target: 'muy rico!', native: 'very tasty!', category: 'other' },

  // Modifiers
  { target: 'sin', native: 'without', category: 'other' },
  { target: 'con', native: 'with', category: 'other' },
  { target: 'mas', native: 'more', category: 'other' },
  { target: 'menos', native: 'less', category: 'other' },
  { target: 'otro', native: 'another (masc)', category: 'adjective' },
  { target: 'otra', native: 'another (fem)', category: 'adjective' },

  // Common modifications
  { target: 'sin cebolla', native: 'without onion', category: 'other' },
  { target: 'sin picante', native: 'not spicy', category: 'other' },
  { target: 'bien cocido', native: 'well done', category: 'adjective' },
  { target: 'termino medio', native: 'medium', category: 'other' },

  // Numbers for prices (key ones)
  { target: 'cien', native: 'one hundred', category: 'other' },
  { target: 'cincuenta', native: 'fifty', category: 'other' },
  { target: 'veinticinco', native: 'twenty-five', category: 'other' },

  // Objects missing vocab entries
  { target: 'la cesta de pan', native: 'bread basket', category: 'noun', gender: 'feminine' },
  { target: 'el perchero', native: 'coat rack', category: 'noun', gender: 'masculine' },
  { target: 'el banco de espera', native: 'waiting bench', category: 'noun', gender: 'masculine' },
  { target: 'el dispensador de jabon', native: 'soap dispenser', category: 'noun', gender: 'masculine' },
  { target: 'el lector de tarjetas', native: 'card reader', category: 'noun', gender: 'masculine' },
  { target: 'la caja registradora', native: 'cash register', category: 'noun', gender: 'feminine' },
  { target: 'el frasco de propinas', native: 'tip jar', category: 'noun', gender: 'masculine' },

  // Adjectives
  { target: 'delicioso', native: 'delicious', category: 'adjective' },
  { target: 'rico', native: 'tasty/rich', category: 'adjective' },
  { target: 'caliente', native: 'hot', category: 'adjective' },
  { target: 'frio', native: 'cold', category: 'adjective' },
  { target: 'picante', native: 'spicy', category: 'adjective' },

  // Bathroom vocabulary
  { target: 'el bano', native: 'bathroom', category: 'noun', gender: 'masculine' },
  { target: 'el inodoro', native: 'toilet', category: 'noun', gender: 'masculine' },
  { target: 'el lavabo', native: 'sink', category: 'noun', gender: 'masculine' },
  { target: 'el espejo', native: 'mirror', category: 'noun', gender: 'masculine' },
  { target: 'el jabon', native: 'soap', category: 'noun', gender: 'masculine' },
  { target: 'las toallas', native: 'towels', category: 'noun', gender: 'feminine' },
  { target: 'las toallas de papel', native: 'paper towels', category: 'noun', gender: 'feminine' },
  { target: 'el secador de manos', native: 'hand dryer', category: 'noun', gender: 'masculine' },
  { target: 'donde esta el bano?', native: 'where is the bathroom?', category: 'other' },
];

// ============================================================================
// MODULE EXPORT
// ============================================================================

export const restaurantModule: ModuleDefinition = {
  name: 'restaurant',
  displayName: 'Restaurant',
  locations,
  objects,
  npcs,
  tutorial,
  quests: [],
  vocabulary,
  startLocationId: 'restaurant_entrance',
  firstStepId: '',
  locationIds: ['restaurant_entrance', 'restaurant_table', 'restaurant_kitchen', 'restaurant_cashier', 'restaurant_bathroom'],
  unlockLevel: 2,

  guidance: `RESTAURANT ENVIRONMENT:
A casual Mexican restaurant. The player enters, gets seated, orders food and drinks, eats, pays the bill, and leaves.

MENU (include prices when player reads the menu or asks):
BEBIDAS (Drinks): agua/water (gratis), refresco/soda ($25), limonada/lemonade ($30), cerveza/beer ($45), vino tinto/red wine ($65), vino blanco/white wine ($65), cafe/coffee ($35).
ENTRADAS (Appetizers): sopa del dia/soup of the day ($55), ensalada/salad ($50), guacamole ($60), nachos ($70).
PLATOS PRINCIPALES (Main Courses): pollo asado/roasted chicken ($120), carne asada/grilled beef ($150), pescado/fish ($140), tacos ($95), enchiladas ($105), arroz con pollo/rice with chicken ($110), hamburguesa/hamburger ($100).
ACOMPANAMIENTOS (Sides): arroz/rice ($25), frijoles/beans ($25), papas fritas/french fries ($35).
POSTRES (Desserts): flan ($50), helado/ice cream ($45), pastel de chocolate/chocolate cake ($55), churros ($40).

OBJECTS:
- menu: Starts "closed". Opening it = tag add "open", remove "closed". When the player opens or reads the menu, include the full menu (above) in the narration message.
- water_glass: Pre-filled on the table. Drinking it = remove mutation + needs {hunger: 5}.
- wine_glass: Empty until ordered. When wine is ordered, tag add "filled".
- bread_basket: Complimentary bread. Eating = remove mutation + needs {hunger: 10}.
- bill: Starts with no tags. When player asks for the bill, tag add "delivered". When player pays, tag add "paid".
- hand_dryer: Starts "off". Using it = tag add "on", remove "off".

ORDERING FLOW:
When the player orders food or drinks, the waiter (Diego) acknowledges the order.
Use "create" mutation to add the delivered item to restaurant_table with id "my_[itemname]" (e.g., my_pollo, my_limonada).
Food items: tags=["consumable"], needsEffect={hunger: 30-40}
Drink items: tags=["consumable"], needsEffect={hunger: 5-10}
When player eats/drinks a delivered item: "remove" mutation + "needs" mutation with the item's needsEffect.

BILL & PAYMENT FLOW:
When the player asks for the bill ("La cuenta, por favor"), add "delivered" tag to the bill object.
Mention the total in the narration based on what was ordered (sum up menu prices).
When the player pays ("Pago la cuenta"), add "paid" tag to the bill object.
The player can also leave a tip ("Dejo una propina") -- acknowledge it warmly.

NPCs:
- Host (anfitrion, male): At restaurant_entrance. Professional, formal "usted". Greets with "Buenas noches/tardes", asks "Mesa para cuantos?", offers to lead player to table. When player asks for a table or follows the host, the parser should emit a "go" mutation to restaurant_table.
- Waiter (mesero, Diego, male): At restaurant_table. Friendly, attentive. Service flow: greets when player sits down, asks "Que desea tomar?" for drinks, "Ya decidio?" for food, brings items, asks "Algo mas?", delivers bill. Says "Enseguida" (right away) when taking orders.
- Chef (Rosa, female): At restaurant_kitchen. Busy, passionate about food. Speaks quickly using cooking terms. Proud of the food. Occasionally comes out to check on diners.

TEACHING FOCUS: "Quiero..." (direct request) vs "Quisiera..." (polite conditional), "Me trae...?" (can you bring me?), "sin"/"con" modifiers for food customization, polite phrases (por favor, gracias, disculpe).`,
};
