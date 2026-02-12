import type { Location, Goal, VocabWord, GameState, NPC, ModuleDefinition } from '../../../engine/types.js';

// ============================================================================
// RESTAURANT LOCATIONS
// ============================================================================

export const restaurantEntrance: Location = {
  id: 'restaurant_entrance',
  name: { target: 'la entrada del restaurante', native: 'restaurant entrance' },
  objects: [
    {
      id: 'host_stand',
      name: { target: 'el podio del anfitrion', native: 'host stand' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'waiting_bench',
      name: { target: 'el banco de espera', native: 'waiting bench' },
      state: {},
      actions: [],
    },
    {
      id: 'restaurant_menu_display',
      name: { target: 'el menu en la vitrina', native: 'menu display' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'coat_rack',
      name: { target: 'el perchero', native: 'coat rack' },
      state: {},
      actions: ['USE'],
    },
  ],
  exits: [
    { to: 'restaurant_table', name: { target: 'las mesas', native: 'dining area' } },
    { to: 'street', name: { target: 'la calle', native: 'street' } },
  ],
};

export const restaurantTable: Location = {
  id: 'restaurant_table',
  name: { target: 'la mesa', native: 'your table' },
  objects: [
    {
      id: 'menu',
      name: { target: 'el menu', native: 'menu' },
      state: { open: false, read: false },
      actions: ['OPEN', 'CLOSE', 'LOOK'],
    },
    {
      id: 'table_plate',
      name: { target: 'el plato', native: 'plate' },
      state: { hasFood: false, foodItem: null },
      actions: ['LOOK'],
    },
    {
      id: 'water_glass',
      name: { target: 'el vaso de agua', native: 'water glass' },
      state: { filled: true },
      actions: ['DRINK'],
      consumable: true,
    },
    {
      id: 'wine_glass',
      name: { target: 'la copa de vino', native: 'wine glass' },
      state: { filled: false },
      actions: ['DRINK'],
      consumable: true,
    },
    {
      id: 'napkin',
      name: { target: 'la servilleta', native: 'napkin' },
      state: {},
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'silverware',
      name: { target: 'los cubiertos', native: 'silverware' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'bread_basket',
      name: { target: 'la cesta de pan', native: 'bread basket' },
      state: { hasBread: true },
      actions: ['TAKE', 'EAT'],
      consumable: true,
      needsEffect: { hunger: 10 },
    },
    // Orderable food items - initially not present, appear when delivered
    {
      id: 'ordered_food',
      name: { target: 'la comida', native: 'food' },
      state: { ordered: false, delivered: false, eaten: false, itemName: null },
      actions: ['EAT'],
      consumable: true,
      needsEffect: { hunger: 40 },
    },
    {
      id: 'ordered_drink',
      name: { target: 'la bebida', native: 'drink' },
      state: { ordered: false, delivered: false, drunk: false, itemName: null },
      actions: ['DRINK'],
      consumable: true,
      needsEffect: { hunger: 10 },
    },
    {
      id: 'bill',
      name: { target: 'la cuenta', native: 'the bill' },
      state: { requested: false, delivered: false, paid: false, total: 0 },
      actions: ['LOOK', 'USE'],
    },
  ],
  exits: [
    { to: 'restaurant_entrance', name: { target: 'la entrada', native: 'entrance' } },
    { to: 'restaurant_kitchen', name: { target: 'la cocina', native: 'kitchen' } },
    { to: 'restaurant_cashier', name: { target: 'la caja', native: 'cashier' } },
    { to: 'restaurant_bathroom', name: { target: 'el bano', native: 'bathroom' } },
  ],
};

export const restaurantKitchen: Location = {
  id: 'restaurant_kitchen',
  name: { target: 'la cocina', native: 'kitchen' },
  objects: [
    {
      id: 'kitchen_stove',
      name: { target: 'la estufa', native: 'stove' },
      state: { on: true },
      actions: ['LOOK'],
    },
    {
      id: 'prep_counter',
      name: { target: 'el mostrador', native: 'prep counter' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'order_tickets',
      name: { target: 'los pedidos', native: 'order tickets' },
      state: { count: 3 },
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'restaurant_table', name: { target: 'el comedor', native: 'dining room' } },
  ],
};

export const restaurantCashier: Location = {
  id: 'restaurant_cashier',
  name: { target: 'la caja', native: 'cashier' },
  objects: [
    {
      id: 'cash_register',
      name: { target: 'la caja registradora', native: 'cash register' },
      state: {},
      actions: ['LOOK', 'USE'],
    },
    {
      id: 'card_reader',
      name: { target: 'el lector de tarjetas', native: 'card reader' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'tip_jar',
      name: { target: 'el frasco de propinas', native: 'tip jar' },
      state: {},
      actions: ['USE'],
    },
  ],
  exits: [
    { to: 'restaurant_table', name: { target: 'el comedor', native: 'dining room' } },
    { to: 'restaurant_entrance', name: { target: 'la entrada', native: 'entrance' } },
  ],
};

export const restaurantBathroom: Location = {
  id: 'restaurant_bathroom',
  name: { target: 'el bano', native: 'bathroom' },
  objects: [
    {
      id: 'restaurant_toilet',
      name: { target: 'el inodoro', native: 'toilet' },
      state: {},
      actions: ['USE'],
      needsEffect: { bladder: 50 },
    },
    {
      id: 'restaurant_sink',
      name: { target: 'el lavabo', native: 'sink' },
      state: { on: false },
      actions: ['USE', 'TURN_ON', 'TURN_OFF'],
      needsEffect: { hygiene: 10 },
    },
    {
      id: 'restaurant_mirror',
      name: { target: 'el espejo', native: 'mirror' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'paper_towels',
      name: { target: 'las toallas de papel', native: 'paper towels' },
      state: {},
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'hand_dryer',
      name: { target: 'el secador de manos', native: 'hand dryer' },
      state: { on: false },
      actions: ['USE', 'TURN_ON'],
    },
    {
      id: 'soap_dispenser',
      name: { target: 'el dispensador de jabon', native: 'soap dispenser' },
      state: {},
      actions: ['USE'],
      needsEffect: { hygiene: 5 },
    },
  ],
  exits: [
    { to: 'restaurant_table', name: { target: 'el comedor', native: 'dining room' } },
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
  name: { target: string; native: string };
  price: number;  // in "pesos" or generic currency
  category: 'appetizer' | 'main' | 'dessert' | 'drink' | 'side';
  description?: { target: string; native: string };
}

export const menuItems: MenuItem[] = [
  // DRINKS (Bebidas)
  { id: 'agua', name: { target: 'el agua', native: 'water' }, price: 0, category: 'drink' },
  { id: 'refresco', name: { target: 'el refresco', native: 'soda' }, price: 25, category: 'drink' },
  { id: 'limonada', name: { target: 'la limonada', native: 'lemonade' }, price: 30, category: 'drink' },
  { id: 'cerveza', name: { target: 'la cerveza', native: 'beer' }, price: 45, category: 'drink' },
  { id: 'vino_tinto', name: { target: 'el vino tinto', native: 'red wine' }, price: 65, category: 'drink' },
  { id: 'vino_blanco', name: { target: 'el vino blanco', native: 'white wine' }, price: 65, category: 'drink' },
  { id: 'cafe', name: { target: 'el cafe', native: 'coffee' }, price: 35, category: 'drink' },

  // APPETIZERS (Entradas)
  { id: 'sopa', name: { target: 'la sopa del dia', native: 'soup of the day' }, price: 55, category: 'appetizer' },
  { id: 'ensalada', name: { target: 'la ensalada', native: 'salad' }, price: 50, category: 'appetizer' },
  { id: 'guacamole', name: { target: 'el guacamole', native: 'guacamole' }, price: 60, category: 'appetizer' },
  { id: 'nachos', name: { target: 'los nachos', native: 'nachos' }, price: 70, category: 'appetizer' },

  // MAIN COURSES (Platos principales)
  { id: 'pollo', name: { target: 'el pollo asado', native: 'roasted chicken' }, price: 120, category: 'main' },
  { id: 'carne', name: { target: 'la carne asada', native: 'grilled beef' }, price: 150, category: 'main' },
  { id: 'pescado', name: { target: 'el pescado', native: 'fish' }, price: 140, category: 'main' },
  { id: 'tacos', name: { target: 'los tacos', native: 'tacos' }, price: 95, category: 'main' },
  { id: 'enchiladas', name: { target: 'las enchiladas', native: 'enchiladas' }, price: 105, category: 'main' },
  { id: 'arroz_con_pollo', name: { target: 'el arroz con pollo', native: 'rice with chicken' }, price: 110, category: 'main' },
  { id: 'hamburguesa', name: { target: 'la hamburguesa', native: 'hamburger' }, price: 100, category: 'main' },

  // SIDES (Acompañamientos)
  { id: 'arroz', name: { target: 'el arroz', native: 'rice' }, price: 25, category: 'side' },
  { id: 'frijoles', name: { target: 'los frijoles', native: 'beans' }, price: 25, category: 'side' },
  { id: 'papas_fritas', name: { target: 'las papas fritas', native: 'french fries' }, price: 35, category: 'side' },

  // DESSERTS (Postres)
  { id: 'flan', name: { target: 'el flan', native: 'flan' }, price: 50, category: 'dessert' },
  { id: 'helado', name: { target: 'el helado', native: 'ice cream' }, price: 45, category: 'dessert' },
  { id: 'pastel', name: { target: 'el pastel de chocolate', native: 'chocolate cake' }, price: 55, category: 'dessert' },
  { id: 'churros', name: { target: 'los churros', native: 'churros' }, price: 40, category: 'dessert' },
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
      // Complete if player reached table, was seated, or AI explicitly completed it via greeting
      return state.location.id === 'restaurant_table' ||
             state.completedGoals.includes('seated_by_host') ||
             state.completedGoals.includes('restaurant_enter');
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
    checkComplete: (state: GameState) => state.completedGoals.includes('restaurant_pay'),
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

export const promptInstructions = `RESTAURANT NPCs:
- Host (anfitrion): Professional, welcoming. Greets with "Buenas noches" or "Buenas tardes". Asks "Mesa para cuantos?" (Table for how many?). Uses formal "usted".
- Waiter (mesero, Diego): Friendly, attentive. Takes drink orders first with "Que desea tomar?", then food with "Ya decidio?". Says "Enseguida" (right away) and "Algo mas?" (anything else?).
- Chef (Rosa): Busy, passionate about food. Occasionally checks on diners. Speaks quickly.

RESTAURANT INTERACTIONS:
- When player greets the host with ANY Spanish greeting ("hola", "buenas noches", "buenas tardes"), emit goalComplete: ["restaurant_enter"] along with the host greeting response. This confirms arrival.
- "buenas noches" or "una mesa para uno, por favor" at entrance → actions: [{ "type": "talk", "npcId": "host" }], goalComplete: ["restaurant_enter", "seated_by_host"], npcResponse from host, npcActions: [{ "npcId": "host", "type": "move_player", "locationId": "restaurant_table" }]
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

export const restaurantModule: ModuleDefinition = {
  name: 'restaurant',
  displayName: 'Restaurant',
  locations: restaurantLocations,
  npcs: restaurantNPCs,
  goals: restaurantGoals,
  vocabulary: restaurantVocabulary,
  startLocationId: 'restaurant_entrance',
  startGoalId: 'restaurant_enter',
  locationIds: Object.keys(restaurantLocations),
  unlockLevel: 2,
  promptInstructions,
};
