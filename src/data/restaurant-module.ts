import type { Location, Goal, VocabWord, GameState, NPC } from '../engine/types.js';

// ============================================================================
// RESTAURANT LOCATIONS
// ============================================================================

export const restaurantEntrance: Location = {
  id: 'restaurant_entrance',
  name: { spanish: 'la entrada del restaurante', english: 'restaurant entrance' },
  objects: [
    {
      id: 'host_stand',
      name: { spanish: 'el podio del anfitrion', english: 'host stand' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'waiting_bench',
      name: { spanish: 'el banco de espera', english: 'waiting bench' },
      state: {},
      actions: [],
    },
    {
      id: 'restaurant_menu_display',
      name: { spanish: 'el menu en la vitrina', english: 'menu display' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'coat_rack',
      name: { spanish: 'el perchero', english: 'coat rack' },
      state: {},
      actions: ['USE'],
    },
  ],
  exits: [
    { to: 'restaurant_table', name: { spanish: 'las mesas', english: 'dining area' } },
    { to: 'street', name: { spanish: 'la calle', english: 'street' } },
  ],
};

export const restaurantTable: Location = {
  id: 'restaurant_table',
  name: { spanish: 'la mesa', english: 'your table' },
  objects: [
    {
      id: 'menu',
      name: { spanish: 'el menu', english: 'menu' },
      state: { open: false, read: false },
      actions: ['OPEN', 'CLOSE', 'LOOK'],
    },
    {
      id: 'table_plate',
      name: { spanish: 'el plato', english: 'plate' },
      state: { hasFood: false, foodItem: null },
      actions: ['LOOK'],
    },
    {
      id: 'water_glass',
      name: { spanish: 'el vaso de agua', english: 'water glass' },
      state: { filled: true },
      actions: ['DRINK'],
      consumable: true,
    },
    {
      id: 'wine_glass',
      name: { spanish: 'la copa de vino', english: 'wine glass' },
      state: { filled: false },
      actions: ['DRINK'],
      consumable: true,
    },
    {
      id: 'napkin',
      name: { spanish: 'la servilleta', english: 'napkin' },
      state: {},
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'silverware',
      name: { spanish: 'los cubiertos', english: 'silverware' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'bread_basket',
      name: { spanish: 'la cesta de pan', english: 'bread basket' },
      state: { hasBread: true },
      actions: ['TAKE', 'EAT'],
      consumable: true,
      needsEffect: { hunger: 10 },
    },
    // Orderable food items - initially not present, appear when delivered
    {
      id: 'ordered_food',
      name: { spanish: 'la comida', english: 'food' },
      state: { ordered: false, delivered: false, eaten: false, itemName: null },
      actions: ['EAT'],
      consumable: true,
      needsEffect: { hunger: 40 },
    },
    {
      id: 'ordered_drink',
      name: { spanish: 'la bebida', english: 'drink' },
      state: { ordered: false, delivered: false, drunk: false, itemName: null },
      actions: ['DRINK'],
      consumable: true,
      needsEffect: { hunger: 10 },
    },
    {
      id: 'bill',
      name: { spanish: 'la cuenta', english: 'the bill' },
      state: { requested: false, delivered: false, paid: false, total: 0 },
      actions: ['LOOK', 'USE'],
    },
  ],
  exits: [
    { to: 'restaurant_entrance', name: { spanish: 'la entrada', english: 'entrance' } },
    { to: 'restaurant_kitchen', name: { spanish: 'la cocina', english: 'kitchen' } },
    { to: 'restaurant_cashier', name: { spanish: 'la caja', english: 'cashier' } },
    { to: 'restaurant_bathroom', name: { spanish: 'el bano', english: 'bathroom' } },
  ],
};

export const restaurantKitchen: Location = {
  id: 'restaurant_kitchen',
  name: { spanish: 'la cocina', english: 'kitchen' },
  objects: [
    {
      id: 'kitchen_stove',
      name: { spanish: 'la estufa', english: 'stove' },
      state: { on: true },
      actions: ['LOOK'],
    },
    {
      id: 'prep_counter',
      name: { spanish: 'el mostrador', english: 'prep counter' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'order_tickets',
      name: { spanish: 'los pedidos', english: 'order tickets' },
      state: { count: 3 },
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'restaurant_table', name: { spanish: 'el comedor', english: 'dining room' } },
  ],
};

export const restaurantCashier: Location = {
  id: 'restaurant_cashier',
  name: { spanish: 'la caja', english: 'cashier' },
  objects: [
    {
      id: 'cash_register',
      name: { spanish: 'la caja registradora', english: 'cash register' },
      state: {},
      actions: ['LOOK', 'USE'],
    },
    {
      id: 'card_reader',
      name: { spanish: 'el lector de tarjetas', english: 'card reader' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'tip_jar',
      name: { spanish: 'el frasco de propinas', english: 'tip jar' },
      state: {},
      actions: ['USE'],
    },
  ],
  exits: [
    { to: 'restaurant_table', name: { spanish: 'el comedor', english: 'dining room' } },
    { to: 'restaurant_entrance', name: { spanish: 'la entrada', english: 'entrance' } },
  ],
};

export const restaurantBathroom: Location = {
  id: 'restaurant_bathroom',
  name: { spanish: 'el bano', english: 'bathroom' },
  objects: [
    {
      id: 'restaurant_toilet',
      name: { spanish: 'el inodoro', english: 'toilet' },
      state: {},
      actions: ['USE'],
      needsEffect: { bladder: 50 },
    },
    {
      id: 'restaurant_sink',
      name: { spanish: 'el lavabo', english: 'sink' },
      state: { on: false },
      actions: ['USE', 'TURN_ON', 'TURN_OFF'],
      needsEffect: { hygiene: 10 },
    },
    {
      id: 'restaurant_mirror',
      name: { spanish: 'el espejo', english: 'mirror' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'paper_towels',
      name: { spanish: 'las toallas de papel', english: 'paper towels' },
      state: {},
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'hand_dryer',
      name: { spanish: 'el secador de manos', english: 'hand dryer' },
      state: { on: false },
      actions: ['USE', 'TURN_ON'],
    },
    {
      id: 'soap_dispenser',
      name: { spanish: 'el dispensador de jabon', english: 'soap dispenser' },
      state: {},
      actions: ['USE'],
      needsEffect: { hygiene: 5 },
    },
  ],
  exits: [
    { to: 'restaurant_table', name: { spanish: 'el comedor', english: 'dining room' } },
  ],
};

export const restaurantLocations: Record<string, Location> = {
  restaurant_entrance: restaurantEntrance,
  restaurant_table: restaurantTable,
  restaurant_kitchen: restaurantKitchen,
  restaurant_cashier: restaurantCashier,
  restaurant_bathroom: restaurantBathroom,
};

// ============================================================================
// RESTAURANT MENU DATA
// ============================================================================

export interface MenuItem {
  id: string;
  name: { spanish: string; english: string };
  price: number;  // in "pesos" or generic currency
  category: 'appetizer' | 'main' | 'dessert' | 'drink' | 'side';
  description?: { spanish: string; english: string };
}

export const menuItems: MenuItem[] = [
  // DRINKS (Bebidas)
  { id: 'agua', name: { spanish: 'el agua', english: 'water' }, price: 0, category: 'drink' },
  { id: 'refresco', name: { spanish: 'el refresco', english: 'soda' }, price: 25, category: 'drink' },
  { id: 'limonada', name: { spanish: 'la limonada', english: 'lemonade' }, price: 30, category: 'drink' },
  { id: 'cerveza', name: { spanish: 'la cerveza', english: 'beer' }, price: 45, category: 'drink' },
  { id: 'vino_tinto', name: { spanish: 'el vino tinto', english: 'red wine' }, price: 65, category: 'drink' },
  { id: 'vino_blanco', name: { spanish: 'el vino blanco', english: 'white wine' }, price: 65, category: 'drink' },
  { id: 'cafe', name: { spanish: 'el cafe', english: 'coffee' }, price: 35, category: 'drink' },

  // APPETIZERS (Entradas)
  { id: 'sopa', name: { spanish: 'la sopa del dia', english: 'soup of the day' }, price: 55, category: 'appetizer' },
  { id: 'ensalada', name: { spanish: 'la ensalada', english: 'salad' }, price: 50, category: 'appetizer' },
  { id: 'guacamole', name: { spanish: 'el guacamole', english: 'guacamole' }, price: 60, category: 'appetizer' },
  { id: 'nachos', name: { spanish: 'los nachos', english: 'nachos' }, price: 70, category: 'appetizer' },

  // MAIN COURSES (Platos principales)
  { id: 'pollo', name: { spanish: 'el pollo asado', english: 'roasted chicken' }, price: 120, category: 'main' },
  { id: 'carne', name: { spanish: 'la carne asada', english: 'grilled beef' }, price: 150, category: 'main' },
  { id: 'pescado', name: { spanish: 'el pescado', english: 'fish' }, price: 140, category: 'main' },
  { id: 'tacos', name: { spanish: 'los tacos', english: 'tacos' }, price: 95, category: 'main' },
  { id: 'enchiladas', name: { spanish: 'las enchiladas', english: 'enchiladas' }, price: 105, category: 'main' },
  { id: 'arroz_con_pollo', name: { spanish: 'el arroz con pollo', english: 'rice with chicken' }, price: 110, category: 'main' },
  { id: 'hamburguesa', name: { spanish: 'la hamburguesa', english: 'hamburger' }, price: 100, category: 'main' },

  // SIDES (Acompañamientos)
  { id: 'arroz', name: { spanish: 'el arroz', english: 'rice' }, price: 25, category: 'side' },
  { id: 'frijoles', name: { spanish: 'los frijoles', english: 'beans' }, price: 25, category: 'side' },
  { id: 'papas_fritas', name: { spanish: 'las papas fritas', english: 'french fries' }, price: 35, category: 'side' },

  // DESSERTS (Postres)
  { id: 'flan', name: { spanish: 'el flan', english: 'flan' }, price: 50, category: 'dessert' },
  { id: 'helado', name: { spanish: 'el helado', english: 'ice cream' }, price: 45, category: 'dessert' },
  { id: 'pastel', name: { spanish: 'el pastel de chocolate', english: 'chocolate cake' }, price: 55, category: 'dessert' },
  { id: 'churros', name: { spanish: 'los churros', english: 'churros' }, price: 40, category: 'dessert' },
];

// Helper to get menu by category
export function getMenuByCategory(category: MenuItem['category']): MenuItem[] {
  return menuItems.filter(item => item.category === category);
}

// Helper to get item price
export function getItemPrice(itemId: string): number {
  return menuItems.find(item => item.id === itemId)?.price ?? 0;
}

// ============================================================================
// RESTAURANT NPCs
// ============================================================================

export const restaurantNPCs: NPC[] = [
  {
    id: 'host',
    name: { spanish: 'el anfitrion', english: 'host' },
    location: 'restaurant_entrance',
    personality: 'Professional and welcoming. Greets customers and seats them. Speaks formally with "usted". Will ask "Mesa para cuantos?" (Table for how many?) and guide player to their table.',
  },
  {
    id: 'waiter',
    name: { spanish: 'el mesero', english: 'waiter' },
    location: 'restaurant_table',
    personality: 'Friendly and attentive waiter named Diego. Takes orders politely. Uses both formal "usted" and friendly tone. Will suggest specials, ask about drinks first, then food. Key phrases: "Que desea tomar?" (What would you like to drink?), "Ya decidio?" (Have you decided?), "Algo mas?" (Anything else?), "Enseguida" (Right away).',
  },
  {
    id: 'chef',
    name: { spanish: 'el chef', english: 'chef' },
    location: 'restaurant_kitchen',
    personality: 'Busy and passionate chef named Rosa. Speaks quickly and uses cooking terms. Can be seen through kitchen window. Occasionally comes out to check on diners. Proud of the food.',
  },
];

// Extended NPC state for restaurant interactions
export interface RestaurantNPCState {
  mood: string;
  lastResponse?: string;
  // Host-specific
  hasGreeted?: boolean;
  hasSeated?: boolean;
  // Waiter-specific
  hasTakenDrinkOrder?: boolean;
  hasTakenFoodOrder?: boolean;
  hasDeliveredFood?: boolean;
  hasDeliveredBill?: boolean;
  currentOrder?: {
    drinks: string[];
    food: string[];
    total: number;
  };
}

export function getRestaurantNPCsInLocation(locationId: string): NPC[] {
  return restaurantNPCs.filter(npc => npc.location === locationId);
}

// ============================================================================
// RESTAURANT GOALS
// ============================================================================

export const restaurantGoals: Goal[] = [
  {
    id: 'restaurant_enter',
    title: 'Enter the restaurant',
    description: 'You\'ve arrived at a restaurant. Go inside and get a table.',
    hint: 'Try "Entro en el restaurante" (I enter the restaurant)',
    checkComplete: (state: GameState) => {
      // Complete if at entrance, table, or already seated (NPC action may move player before this check)
      return state.location.id === 'restaurant_entrance' ||
             state.location.id === 'restaurant_table' ||
             state.completedGoals.includes('seated_by_host');
    },
    nextGoalId: 'restaurant_get_seated',
  },
  {
    id: 'restaurant_get_seated',
    title: 'Get seated at a table',
    description: 'Talk to the host and ask for a table. Use polite language!',
    hint: 'Try "Buenas noches" to greet, then "Una mesa para uno, por favor" (A table for one, please)',
    checkComplete: (state: GameState) => {
      // Player is seated when they reach the table (either by asking host or going directly)
      return state.location.id === 'restaurant_table' ||
             state.completedGoals.includes('seated_by_host');
    },
    nextGoalId: 'restaurant_order_drink',
  },
  {
    id: 'restaurant_order_drink',
    title: 'Order a drink',
    description: 'The waiter is ready to take your drink order. Use "quiero" or "quisiera" to order.',
    hint: 'Try "Quiero una limonada, por favor" or "Quisiera un vaso de agua" (I would like a glass of water)',
    checkComplete: (state: GameState) => {
      const drinkObj = state.location.objects.find(o => o.id === 'ordered_drink');
      return drinkObj?.state.ordered === true ||
             state.completedGoals.includes('ordered_drink');
    },
    nextGoalId: 'restaurant_read_menu',
  },
  {
    id: 'restaurant_read_menu',
    title: 'Read the menu and ask questions',
    description: 'Look at the menu and ask the waiter about the food. Try asking "Que recomienda?"',
    hint: 'Try "Abro el menu" (I open the menu) and "Que tiene la ensalada?" (What does the salad have?)',
    checkComplete: (state: GameState) => {
      const menu = state.location.objects.find(o => o.id === 'menu');
      return menu?.state.read === true ||
             state.completedGoals.includes('read_menu');
    },
    nextGoalId: 'restaurant_order_food',
  },
  {
    id: 'restaurant_order_food',
    title: 'Order your meal',
    description: 'Decide what you want and order from the waiter. You can modify your order with "sin" (without) or "con" (with).',
    hint: 'Try "Quiero el pollo asado, por favor" or "Quisiera los tacos sin cebolla" (I would like tacos without onion)',
    checkComplete: (state: GameState) => {
      const foodObj = state.location.objects.find(o => o.id === 'ordered_food');
      return foodObj?.state.ordered === true ||
             state.completedGoals.includes('ordered_food');
    },
    nextGoalId: 'restaurant_eat_meal',
  },
  {
    id: 'restaurant_eat_meal',
    title: 'Enjoy your meal',
    description: 'Your food has arrived! Eat and maybe compliment the chef.',
    hint: 'Try "Como el pollo" (I eat the chicken) or "Esta delicioso!" (It\'s delicious!)',
    checkComplete: (state: GameState) => {
      const foodObj = state.location.objects.find(o => o.id === 'ordered_food');
      return foodObj?.state.eaten === true ||
             state.completedGoals.includes('ate_meal');
    },
    nextGoalId: 'restaurant_ask_bill',
  },
  {
    id: 'restaurant_ask_bill',
    title: 'Ask for the bill',
    description: 'You\'re finished eating. Ask the waiter for the check.',
    hint: 'Try "La cuenta, por favor" (The bill, please) or "Me trae la cuenta?" (Can you bring me the bill?)',
    checkComplete: (state: GameState) => {
      const bill = state.location.objects.find(o => o.id === 'bill');
      return bill?.state.delivered === true ||
             state.completedGoals.includes('asked_for_bill');
    },
    nextGoalId: 'restaurant_pay',
  },
  {
    id: 'restaurant_pay',
    title: 'Pay the bill and leave a tip',
    description: 'Look at the total and pay. Don\'t forget to thank the waiter!',
    hint: 'Try "Pago la cuenta" (I pay the bill) and "Gracias por todo" (Thank you for everything). For tip: "Dejo una propina"',
    checkComplete: (state: GameState) => {
      const bill = state.location.objects.find(o => o.id === 'bill');
      return bill?.state.paid === true ||
             state.completedGoals.includes('paid_bill');
    },
    nextGoalId: 'restaurant_complete',
  },
  {
    id: 'restaurant_complete',
    title: 'Restaurant visit complete!',
    description: 'Felicidades! You successfully ordered and paid for a meal in Spanish. You learned how to use "quiero" and "quisiera" for polite requests.',
    checkComplete: () => false, // Final goal
  },
];

export function getRestaurantGoalById(id: string): Goal | undefined {
  return restaurantGoals.find(g => g.id === id);
}

export function getRestaurantStartGoal(): Goal {
  return restaurantGoals[0];
}

// ============================================================================
// RESTAURANT VOCABULARY
// ============================================================================

export const restaurantVocabulary: VocabWord[] = [
  // Restaurant locations
  { spanish: 'el restaurante', english: 'restaurant', category: 'noun', gender: 'masculine' },
  { spanish: 'la entrada', english: 'entrance', category: 'noun', gender: 'feminine' },
  { spanish: 'la mesa', english: 'table', category: 'noun', gender: 'feminine' },
  { spanish: 'la caja', english: 'cashier/register', category: 'noun', gender: 'feminine' },
  { spanish: 'el comedor', english: 'dining room', category: 'noun', gender: 'masculine' },

  // Table items
  { spanish: 'el menu', english: 'menu', category: 'noun', gender: 'masculine' },
  { spanish: 'el plato', english: 'plate', category: 'noun', gender: 'masculine' },
  { spanish: 'el vaso', english: 'glass', category: 'noun', gender: 'masculine' },
  { spanish: 'la copa', english: 'wine glass', category: 'noun', gender: 'feminine' },
  { spanish: 'la servilleta', english: 'napkin', category: 'noun', gender: 'feminine' },
  { spanish: 'los cubiertos', english: 'silverware', category: 'noun', gender: 'masculine' },
  { spanish: 'el tenedor', english: 'fork', category: 'noun', gender: 'masculine' },
  { spanish: 'el cuchillo', english: 'knife', category: 'noun', gender: 'masculine' },
  { spanish: 'la cuchara', english: 'spoon', category: 'noun', gender: 'feminine' },
  { spanish: 'la cuenta', english: 'bill/check', category: 'noun', gender: 'feminine' },
  { spanish: 'la propina', english: 'tip', category: 'noun', gender: 'feminine' },

  // People
  { spanish: 'el mesero', english: 'waiter', category: 'noun', gender: 'masculine' },
  { spanish: 'la mesera', english: 'waitress', category: 'noun', gender: 'feminine' },
  { spanish: 'el camarero', english: 'waiter (Spain)', category: 'noun', gender: 'masculine' },
  { spanish: 'el anfitrion', english: 'host', category: 'noun', gender: 'masculine' },
  { spanish: 'el chef', english: 'chef', category: 'noun', gender: 'masculine' },

  // Drinks
  { spanish: 'el agua', english: 'water', category: 'noun', gender: 'feminine' },
  { spanish: 'el refresco', english: 'soda', category: 'noun', gender: 'masculine' },
  { spanish: 'la limonada', english: 'lemonade', category: 'noun', gender: 'feminine' },
  { spanish: 'la cerveza', english: 'beer', category: 'noun', gender: 'feminine' },
  { spanish: 'el vino', english: 'wine', category: 'noun', gender: 'masculine' },
  { spanish: 'el vino tinto', english: 'red wine', category: 'noun', gender: 'masculine' },
  { spanish: 'el vino blanco', english: 'white wine', category: 'noun', gender: 'masculine' },
  { spanish: 'el cafe', english: 'coffee', category: 'noun', gender: 'masculine' },

  // Food categories
  { spanish: 'las bebidas', english: 'drinks', category: 'noun', gender: 'feminine' },
  { spanish: 'las entradas', english: 'appetizers', category: 'noun', gender: 'feminine' },
  { spanish: 'los platos principales', english: 'main courses', category: 'noun', gender: 'masculine' },
  { spanish: 'los postres', english: 'desserts', category: 'noun', gender: 'masculine' },

  // Food items
  { spanish: 'la sopa', english: 'soup', category: 'noun', gender: 'feminine' },
  { spanish: 'la ensalada', english: 'salad', category: 'noun', gender: 'feminine' },
  { spanish: 'el guacamole', english: 'guacamole', category: 'noun', gender: 'masculine' },
  { spanish: 'los nachos', english: 'nachos', category: 'noun', gender: 'masculine' },
  { spanish: 'el pollo', english: 'chicken', category: 'noun', gender: 'masculine' },
  { spanish: 'la carne', english: 'beef/meat', category: 'noun', gender: 'feminine' },
  { spanish: 'el pescado', english: 'fish', category: 'noun', gender: 'masculine' },
  { spanish: 'los tacos', english: 'tacos', category: 'noun', gender: 'masculine' },
  { spanish: 'las enchiladas', english: 'enchiladas', category: 'noun', gender: 'feminine' },
  { spanish: 'el arroz', english: 'rice', category: 'noun', gender: 'masculine' },
  { spanish: 'los frijoles', english: 'beans', category: 'noun', gender: 'masculine' },
  { spanish: 'las papas fritas', english: 'french fries', category: 'noun', gender: 'feminine' },
  { spanish: 'la hamburguesa', english: 'hamburger', category: 'noun', gender: 'feminine' },
  { spanish: 'el flan', english: 'flan', category: 'noun', gender: 'masculine' },
  { spanish: 'el helado', english: 'ice cream', category: 'noun', gender: 'masculine' },
  { spanish: 'el pastel', english: 'cake', category: 'noun', gender: 'masculine' },
  { spanish: 'los churros', english: 'churros', category: 'noun', gender: 'masculine' },

  // KEY VERBS - Ordering & Requesting
  { spanish: 'quiero', english: 'I want', category: 'verb' },
  { spanish: 'quieres', english: 'you want (informal)', category: 'verb' },
  { spanish: 'quiere', english: 'he/she/you(formal) wants', category: 'verb' },
  { spanish: 'queremos', english: 'we want', category: 'verb' },
  { spanish: 'quisiera', english: 'I would like (polite)', category: 'verb' },
  { spanish: 'pido', english: 'I order/ask for', category: 'verb' },
  { spanish: 'pides', english: 'you order (informal)', category: 'verb' },
  { spanish: 'pide', english: 'he/she orders', category: 'verb' },
  { spanish: 'pedimos', english: 'we order', category: 'verb' },

  // Payment & Service verbs
  { spanish: 'pago', english: 'I pay', category: 'verb' },
  { spanish: 'pagas', english: 'you pay', category: 'verb' },
  { spanish: 'paga', english: 'he/she pays', category: 'verb' },
  { spanish: 'traigo', english: 'I bring', category: 'verb' },
  { spanish: 'traes', english: 'you bring', category: 'verb' },
  { spanish: 'trae', english: 'he/she brings', category: 'verb' },
  { spanish: 'dejo', english: 'I leave (tip)', category: 'verb' },

  // Request structures
  { spanish: 'me trae...?', english: 'can you bring me...?', category: 'verb' },
  { spanish: 'me puede traer...?', english: 'can you bring me...?', category: 'verb' },
  { spanish: 'podria traerme...?', english: 'could you bring me...? (formal)', category: 'verb' },

  // Polite phrases
  { spanish: 'por favor', english: 'please', category: 'other' },
  { spanish: 'gracias', english: 'thank you', category: 'other' },
  { spanish: 'muchas gracias', english: 'thank you very much', category: 'other' },
  { spanish: 'de nada', english: 'you\'re welcome', category: 'other' },
  { spanish: 'disculpe', english: 'excuse me (formal)', category: 'other' },
  { spanish: 'perdon', english: 'sorry/pardon', category: 'other' },
  { spanish: 'buenas noches', english: 'good evening', category: 'other' },
  { spanish: 'buenas tardes', english: 'good afternoon', category: 'other' },

  // Restaurant phrases
  { spanish: 'una mesa para uno', english: 'a table for one', category: 'other' },
  { spanish: 'una mesa para dos', english: 'a table for two', category: 'other' },
  { spanish: 'la cuenta, por favor', english: 'the bill, please', category: 'other' },
  { spanish: 'que recomienda?', english: 'what do you recommend?', category: 'other' },
  { spanish: 'que tiene...?', english: 'what does ... have?', category: 'other' },
  { spanish: 'cuanto cuesta?', english: 'how much does it cost?', category: 'other' },
  { spanish: 'cuanto es?', english: 'how much is it?', category: 'other' },
  { spanish: 'esta delicioso!', english: 'it\'s delicious!', category: 'other' },
  { spanish: 'muy rico!', english: 'very tasty!', category: 'other' },

  // Modifiers
  { spanish: 'sin', english: 'without', category: 'other' },
  { spanish: 'con', english: 'with', category: 'other' },
  { spanish: 'mas', english: 'more', category: 'other' },
  { spanish: 'menos', english: 'less', category: 'other' },
  { spanish: 'otro', english: 'another (masc)', category: 'adjective' },
  { spanish: 'otra', english: 'another (fem)', category: 'adjective' },

  // Common modifications
  { spanish: 'sin cebolla', english: 'without onion', category: 'other' },
  { spanish: 'sin picante', english: 'not spicy', category: 'other' },
  { spanish: 'bien cocido', english: 'well done', category: 'adjective' },
  { spanish: 'termino medio', english: 'medium', category: 'other' },

  // Numbers for prices (key ones)
  { spanish: 'cien', english: 'one hundred', category: 'other' },
  { spanish: 'cincuenta', english: 'fifty', category: 'other' },
  { spanish: 'veinticinco', english: 'twenty-five', category: 'other' },

  // Adjectives
  { spanish: 'delicioso', english: 'delicious', category: 'adjective' },
  { spanish: 'rico', english: 'tasty/rich', category: 'adjective' },
  { spanish: 'caliente', english: 'hot', category: 'adjective' },
  { spanish: 'frio', english: 'cold', category: 'adjective' },
  { spanish: 'picante', english: 'spicy', category: 'adjective' },

  // Bathroom vocabulary
  { spanish: 'el bano', english: 'bathroom', category: 'noun', gender: 'masculine' },
  { spanish: 'el inodoro', english: 'toilet', category: 'noun', gender: 'masculine' },
  { spanish: 'el lavabo', english: 'sink', category: 'noun', gender: 'masculine' },
  { spanish: 'el espejo', english: 'mirror', category: 'noun', gender: 'masculine' },
  { spanish: 'el jabon', english: 'soap', category: 'noun', gender: 'masculine' },
  { spanish: 'las toallas', english: 'towels', category: 'noun', gender: 'feminine' },
  { spanish: 'las toallas de papel', english: 'paper towels', category: 'noun', gender: 'feminine' },
  { spanish: 'el secador de manos', english: 'hand dryer', category: 'noun', gender: 'masculine' },
  { spanish: 'donde esta el bano?', english: 'where is the bathroom?', category: 'other' },
];

export const promptInstructions = `RESTAURANT NPCs:
- Host (anfitrion): Professional, welcoming. Greets with "Buenas noches" or "Buenas tardes". Asks "Mesa para cuantos?" (Table for how many?). Uses formal "usted".
- Waiter (mesero, Diego): Friendly, attentive. Takes drink orders first with "Que desea tomar?", then food with "Ya decidio?". Says "Enseguida" (right away) and "Algo mas?" (anything else?).
- Chef (Rosa): Busy, passionate about food. Occasionally checks on diners. Speaks quickly.

RESTAURANT INTERACTIONS:
- "buenas noches" or "una mesa para uno, por favor" at entrance → actions: [{ "type": "talk", "npcId": "host" }], goalComplete: ["seated_by_host"], npcResponse from host, npcActions: [{ "npcId": "host", "type": "move_player", "locationId": "restaurant_table" }]
- "quiero una limonada" → actions: [{ "type": "talk", "npcId": "waiter" }], goalComplete: ["ordered_drink"], npcResponse from waiter, npcActions: [{ "npcId": "waiter", "type": "add_object", "locationId": "restaurant_table", "object": { "id": "my_limonada", "spanishName": "la limonada", "englishName": "lemonade", "actions": ["DRINK"], "consumable": true, "needsEffect": { "hunger": 5 } } }]
- "quisiera agua" → actions: [{ "type": "talk", "npcId": "waiter" }], goalComplete: ["ordered_drink"], npcResponse from waiter, npcActions: [{ "npcId": "waiter", "type": "add_object", "locationId": "restaurant_table", "object": { "id": "my_agua", "spanishName": "el agua", "englishName": "water", "actions": ["DRINK"], "consumable": true } }]
- "abro el menu" or "miro el menu" or "leo el menu" → actions: [{ "type": "open", "objectId": "menu" }], goalComplete: ["read_menu"]
  IMPORTANT: When player opens/reads the menu, your message MUST include the menu contents:
  "You open the menu and see: BEBIDAS: agua (gratis), refresco ($25), limonada ($30), cerveza ($45), vino ($65), cafe ($35). ENTRADAS: sopa del dia ($55), ensalada ($50), guacamole ($60). PLATOS: pollo asado ($120), carne asada ($150), pescado ($140), tacos ($95), enchiladas ($105), hamburguesa ($100). POSTRES: flan ($50), helado ($45), churros ($40)."
- "quiero el pollo asado" → actions: [{ "type": "talk", "npcId": "waiter" }], goalComplete: ["ordered_food"], npcResponse from waiter, npcActions: [{ "npcId": "waiter", "type": "add_object", "locationId": "restaurant_table", "object": { "id": "my_pollo", "spanishName": "el pollo asado", "englishName": "grilled chicken", "actions": ["EAT"], "consumable": true, "needsEffect": { "hunger": 40 } } }]
- "quisiera los tacos" → actions: [{ "type": "talk", "npcId": "waiter" }], goalComplete: ["ordered_food"], npcResponse from waiter, npcActions: [{ "npcId": "waiter", "type": "add_object", "locationId": "restaurant_table", "object": { "id": "my_tacos", "spanishName": "los tacos", "englishName": "tacos", "actions": ["EAT"], "consumable": true, "needsEffect": { "hunger": 35 } } }]
- "como el pollo" or "como los tacos" → actions: [{ "type": "eat", "objectId": "my_pollo" or "my_tacos" (use the actual delivered food ID) }], goalComplete: ["ate_meal"], needsChanges: { hunger: 40 }
- "la cuenta, por favor" → actions: [{ "type": "talk", "npcId": "waiter" }], goalComplete: ["asked_for_bill"], npcResponse from waiter, npcActions: [{ "npcId": "waiter", "type": "change_object", "objectId": "bill", "changes": { "delivered": true, "total": 150 } }]
- "pago la cuenta" → actions: [{ "type": "use", "objectId": "bill" }], goalComplete: ["paid_bill"]
- "donde esta el bano?" or "voy al bano" → Player can go to restaurant_bathroom
NOTE: When player orders food/drink, use add_object with an ID like "my_pollo", "my_tacos", "my_limonada", etc. The ID should match what they ordered!

KEY SPANISH FOR ORDERING (teach these patterns):
- "Quiero..." (I want...) - direct but acceptable
- "Quisiera..." (I would like...) - more polite
- "Me trae...?" (Can you bring me...?)
- "sin" (without) - "sin cebolla" (without onion)
- "con" (with) - "con arroz" (with rice)`;
