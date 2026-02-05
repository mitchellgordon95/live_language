import type { Location, Goal, VocabWord, GameState, NPC } from '../engine/types.js';

// ============================================================================
// MARKET LOCATIONS
// ============================================================================

export const marketEntrance: Location = {
  id: 'market_entrance',
  name: { spanish: 'la entrada del mercado', english: 'market entrance' },
  objects: [
    {
      id: 'market_sign',
      name: { spanish: 'el letrero del mercado', english: 'market sign' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'shopping_basket',
      name: { spanish: 'la canasta', english: 'shopping basket' },
      state: {},
      actions: ['TAKE'],
      takeable: true,
    },
    {
      id: 'shopping_cart',
      name: { spanish: 'el carrito', english: 'shopping cart' },
      state: {},
      actions: ['TAKE', 'USE'],
    },
    {
      id: 'market_directory',
      name: { spanish: 'el directorio', english: 'directory' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'fruit_stand', name: { spanish: 'el puesto de frutas', english: 'fruit stand' } },
    { to: 'vegetable_stand', name: { spanish: 'el puesto de verduras', english: 'vegetable stand' } },
    { to: 'meat_counter', name: { spanish: 'la carniceria', english: 'meat counter' } },
    { to: 'market_checkout', name: { spanish: 'la caja', english: 'checkout' } },
    { to: 'street', name: { spanish: 'la calle', english: 'street' } },
  ],
};

export const fruitStand: Location = {
  id: 'fruit_stand',
  name: { spanish: 'el puesto de frutas', english: 'fruit stand' },
  objects: [
    // Fruits with prices (in pesos)
    {
      id: 'apples',
      name: { spanish: 'las manzanas', english: 'apples' },
      state: { price: 25, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'oranges',
      name: { spanish: 'las naranjas', english: 'oranges' },
      state: { price: 30, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'bananas',
      name: { spanish: 'los platanos', english: 'bananas' },
      state: { price: 20, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'strawberries',
      name: { spanish: 'las fresas', english: 'strawberries' },
      state: { price: 45, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'grapes',
      name: { spanish: 'las uvas', english: 'grapes' },
      state: { price: 50, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'lemons',
      name: { spanish: 'los limones', english: 'lemons' },
      state: { price: 15, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'watermelon',
      name: { spanish: 'la sandia', english: 'watermelon' },
      state: { price: 35, unit: 'piece', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'pineapple',
      name: { spanish: 'la pina', english: 'pineapple' },
      state: { price: 40, unit: 'piece', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'fruit_scale',
      name: { spanish: 'la balanza', english: 'scale' },
      state: {},
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'fruit_price_sign',
      name: { spanish: 'el letrero de precios', english: 'price sign' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'market_entrance', name: { spanish: 'la entrada', english: 'entrance' } },
    { to: 'vegetable_stand', name: { spanish: 'el puesto de verduras', english: 'vegetable stand' } },
    { to: 'meat_counter', name: { spanish: 'la carniceria', english: 'meat counter' } },
    { to: 'market_checkout', name: { spanish: 'la caja', english: 'checkout' } },
  ],
};

export const vegetableStand: Location = {
  id: 'vegetable_stand',
  name: { spanish: 'el puesto de verduras', english: 'vegetable stand' },
  objects: [
    {
      id: 'tomatoes',
      name: { spanish: 'los tomates', english: 'tomatoes' },
      state: { price: 22, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'onions',
      name: { spanish: 'las cebollas', english: 'onions' },
      state: { price: 18, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'potatoes',
      name: { spanish: 'las papas', english: 'potatoes' },
      state: { price: 20, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'carrots',
      name: { spanish: 'las zanahorias', english: 'carrots' },
      state: { price: 15, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'lettuce',
      name: { spanish: 'la lechuga', english: 'lettuce' },
      state: { price: 12, unit: 'piece', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'peppers',
      name: { spanish: 'los pimientos', english: 'peppers' },
      state: { price: 28, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'avocados',
      name: { spanish: 'los aguacates', english: 'avocados' },
      state: { price: 55, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'garlic',
      name: { spanish: 'el ajo', english: 'garlic' },
      state: { price: 8, unit: 'head', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'vegetable_scale',
      name: { spanish: 'la balanza', english: 'scale' },
      state: {},
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'vegetable_price_sign',
      name: { spanish: 'el letrero de precios', english: 'price sign' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'market_entrance', name: { spanish: 'la entrada', english: 'entrance' } },
    { to: 'fruit_stand', name: { spanish: 'el puesto de frutas', english: 'fruit stand' } },
    { to: 'meat_counter', name: { spanish: 'la carniceria', english: 'meat counter' } },
    { to: 'market_checkout', name: { spanish: 'la caja', english: 'checkout' } },
  ],
};

export const meatCounter: Location = {
  id: 'meat_counter',
  name: { spanish: 'la carniceria', english: 'meat counter' },
  objects: [
    {
      id: 'chicken',
      name: { spanish: 'el pollo', english: 'chicken' },
      state: { price: 75, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'beef',
      name: { spanish: 'la carne de res', english: 'beef' },
      state: { price: 120, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'pork',
      name: { spanish: 'la carne de cerdo', english: 'pork' },
      state: { price: 95, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'ground_beef',
      name: { spanish: 'la carne molida', english: 'ground beef' },
      state: { price: 85, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'chorizo',
      name: { spanish: 'el chorizo', english: 'chorizo' },
      state: { price: 65, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'ham',
      name: { spanish: 'el jamon', english: 'ham' },
      state: { price: 110, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'meat_display',
      name: { spanish: 'el mostrador', english: 'display counter' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'meat_scale',
      name: { spanish: 'la balanza', english: 'scale' },
      state: {},
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'meat_price_sign',
      name: { spanish: 'el letrero de precios', english: 'price sign' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'ticket_dispenser',
      name: { spanish: 'el dispensador de numeros', english: 'ticket dispenser' },
      state: { currentNumber: 45 },
      actions: ['USE', 'TAKE'],
    },
  ],
  exits: [
    { to: 'market_entrance', name: { spanish: 'la entrada', english: 'entrance' } },
    { to: 'fruit_stand', name: { spanish: 'el puesto de frutas', english: 'fruit stand' } },
    { to: 'vegetable_stand', name: { spanish: 'el puesto de verduras', english: 'vegetable stand' } },
    { to: 'market_checkout', name: { spanish: 'la caja', english: 'checkout' } },
  ],
};

export const marketCheckout: Location = {
  id: 'market_checkout',
  name: { spanish: 'la caja', english: 'checkout' },
  objects: [
    {
      id: 'cash_register',
      name: { spanish: 'la caja registradora', english: 'cash register' },
      state: {},
      actions: ['LOOK', 'USE'],
    },
    {
      id: 'conveyor_belt',
      name: { spanish: 'la cinta transportadora', english: 'conveyor belt' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'shopping_bags',
      name: { spanish: 'las bolsas', english: 'shopping bags' },
      state: { price: 2 },
      actions: ['TAKE'],
      takeable: true,
    },
    {
      id: 'receipt',
      name: { spanish: 'el recibo', english: 'receipt' },
      state: { printed: false, total: 0 },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'card_reader',
      name: { spanish: 'el lector de tarjetas', english: 'card reader' },
      state: {},
      actions: ['USE'],
    },
  ],
  exits: [
    { to: 'market_entrance', name: { spanish: 'la entrada', english: 'entrance' } },
    { to: 'street', name: { spanish: 'la calle', english: 'street' } },
  ],
};

export const marketLocations: Record<string, Location> = {
  market_entrance: marketEntrance,
  fruit_stand: fruitStand,
  vegetable_stand: vegetableStand,
  meat_counter: meatCounter,
  market_checkout: marketCheckout,
};

// ============================================================================
// MARKET NPCs
// ============================================================================

export const marketNPCs: NPC[] = [
  {
    id: 'dona_maria',
    name: { spanish: 'Dona Maria', english: 'Mrs. Maria' },
    location: 'fruit_stand',
    personality: `Friendly elderly fruit vendor who has worked at the market for 40 years. 
    Speaks warmly and uses diminutives (frutitas, manzanitas). Very patient with customers.
    Loves to give advice about picking ripe fruit. Will say things like:
    - "Buenos dias, mi amor! Que busca hoy?"
    - "Estas naranjas estan muy dulces!"
    - "Le doy un poquito de descuento"
    Uses demonstratives frequently: "Estas manzanas son las mejores" (these apples are the best).
    When asked prices, says things like "Las fresas cuestan cuarenta y cinco pesos el kilo."`,
  },
  {
    id: 'senor_pedro',
    name: { spanish: 'Senor Pedro', english: 'Mr. Pedro' },
    location: 'vegetable_stand',
    personality: `Middle-aged vegetable vendor, friendly but businesslike. 
    Speaks clearly and directly. Knows his vegetables well.
    Offers comparisons between products: "Esas papas son mas grandes, pero estas son mas frescas."
    Key phrases:
    - "Buenas tardes! En que le puedo ayudar?"
    - "Cuanto necesita? Medio kilo? Un kilo?"
    - "Aquellas zanahorias son de ayer, pero estas llegaron hoy"
    Uses demonstratives for near/far: este/ese/aquel and esto/eso/aquello.
    Patient when explaining weights and quantities.`,
  },
  {
    id: 'carlos_carnicero',
    name: { spanish: 'Carlos el Carnicero', english: 'Carlos the Butcher' },
    location: 'meat_counter',
    personality: `Burly, friendly butcher in his 30s. Proud of his quality meat.
    Speaks with authority about cuts and preparation. Uses formal language.
    Will ask about quantities: "Cuantos gramos quiere?" or "Cuantos kilos necesita?"
    Key phrases:
    - "Que numero tiene?" (What number do you have? - ticket system)
    - "Quiere que se lo corte?" (Want me to cut it for you?)
    - "Este chorizo es casero" (This chorizo is homemade)
    - "La carne de res cuesta ciento veinte el kilo"
    Likes to compare: "Este pollo es mas fresco que ese."`,
  },
];

// Extended NPC state for market interactions
export interface MarketNPCState {
  mood: string;
  lastResponse?: string;
  hasGreeted?: boolean;
  itemsDiscussed?: string[];
  currentTransaction?: {
    items: Array<{ id: string; quantity: number; unit: string; price: number }>;
    total: number;
  };
}

export function getMarketNPCsInLocation(locationId: string): NPC[] {
  return marketNPCs.filter((npc) => npc.location === locationId);
}

// ============================================================================
// MARKET ITEM DATA
// ============================================================================

export interface MarketItem {
  id: string;
  name: { spanish: string; english: string };
  price: number; // in pesos
  unit: 'kilo' | 'piece' | 'gram' | 'head' | 'bunch';
  category: 'fruit' | 'vegetable' | 'meat';
  location: string;
}

export const marketItems: MarketItem[] = [
  // FRUITS
  { id: 'apples', name: { spanish: 'las manzanas', english: 'apples' }, price: 25, unit: 'kilo', category: 'fruit', location: 'fruit_stand' },
  { id: 'oranges', name: { spanish: 'las naranjas', english: 'oranges' }, price: 30, unit: 'kilo', category: 'fruit', location: 'fruit_stand' },
  { id: 'bananas', name: { spanish: 'los platanos', english: 'bananas' }, price: 20, unit: 'kilo', category: 'fruit', location: 'fruit_stand' },
  { id: 'strawberries', name: { spanish: 'las fresas', english: 'strawberries' }, price: 45, unit: 'kilo', category: 'fruit', location: 'fruit_stand' },
  { id: 'grapes', name: { spanish: 'las uvas', english: 'grapes' }, price: 50, unit: 'kilo', category: 'fruit', location: 'fruit_stand' },
  { id: 'lemons', name: { spanish: 'los limones', english: 'lemons' }, price: 15, unit: 'kilo', category: 'fruit', location: 'fruit_stand' },
  { id: 'watermelon', name: { spanish: 'la sandia', english: 'watermelon' }, price: 35, unit: 'piece', category: 'fruit', location: 'fruit_stand' },
  { id: 'pineapple', name: { spanish: 'la pina', english: 'pineapple' }, price: 40, unit: 'piece', category: 'fruit', location: 'fruit_stand' },

  // VEGETABLES
  { id: 'tomatoes', name: { spanish: 'los tomates', english: 'tomatoes' }, price: 22, unit: 'kilo', category: 'vegetable', location: 'vegetable_stand' },
  { id: 'onions', name: { spanish: 'las cebollas', english: 'onions' }, price: 18, unit: 'kilo', category: 'vegetable', location: 'vegetable_stand' },
  { id: 'potatoes', name: { spanish: 'las papas', english: 'potatoes' }, price: 20, unit: 'kilo', category: 'vegetable', location: 'vegetable_stand' },
  { id: 'carrots', name: { spanish: 'las zanahorias', english: 'carrots' }, price: 15, unit: 'kilo', category: 'vegetable', location: 'vegetable_stand' },
  { id: 'lettuce', name: { spanish: 'la lechuga', english: 'lettuce' }, price: 12, unit: 'piece', category: 'vegetable', location: 'vegetable_stand' },
  { id: 'peppers', name: { spanish: 'los pimientos', english: 'peppers' }, price: 28, unit: 'kilo', category: 'vegetable', location: 'vegetable_stand' },
  { id: 'avocados', name: { spanish: 'los aguacates', english: 'avocados' }, price: 55, unit: 'kilo', category: 'vegetable', location: 'vegetable_stand' },
  { id: 'garlic', name: { spanish: 'el ajo', english: 'garlic' }, price: 8, unit: 'head', category: 'vegetable', location: 'vegetable_stand' },

  // MEAT
  { id: 'chicken', name: { spanish: 'el pollo', english: 'chicken' }, price: 75, unit: 'kilo', category: 'meat', location: 'meat_counter' },
  { id: 'beef', name: { spanish: 'la carne de res', english: 'beef' }, price: 120, unit: 'kilo', category: 'meat', location: 'meat_counter' },
  { id: 'pork', name: { spanish: 'la carne de cerdo', english: 'pork' }, price: 95, unit: 'kilo', category: 'meat', location: 'meat_counter' },
  { id: 'ground_beef', name: { spanish: 'la carne molida', english: 'ground beef' }, price: 85, unit: 'kilo', category: 'meat', location: 'meat_counter' },
  { id: 'chorizo', name: { spanish: 'el chorizo', english: 'chorizo' }, price: 65, unit: 'kilo', category: 'meat', location: 'meat_counter' },
  { id: 'ham', name: { spanish: 'el jamon', english: 'ham' }, price: 110, unit: 'kilo', category: 'meat', location: 'meat_counter' },
];

// Helper functions
export function getItemsByCategory(category: MarketItem['category']): MarketItem[] {
  return marketItems.filter((item) => item.category === category);
}

export function getItemPrice(itemId: string): number {
  return marketItems.find((item) => item.id === itemId)?.price ?? 0;
}

export function getItemsByLocation(locationId: string): MarketItem[] {
  return marketItems.filter((item) => item.location === locationId);
}

// ============================================================================
// MARKET GOALS
// ============================================================================

export const marketGoals: Goal[] = [
  {
    id: 'market_explore',
    title: 'Explore the market',
    description: 'You arrived at the market! Look around and visit the different stands.',
    hint: 'Try "Voy al puesto de frutas" (I go to the fruit stand) or "Miro el letrero" (I look at the sign)',
    checkComplete: (state: GameState) => {
      // Complete when player visits any market stand beyond the entrance
      return ['fruit_stand', 'vegetable_stand', 'meat_counter'].includes(state.location.id) ||
        state.completedGoals.includes('market_explore');
    },
    nextGoalId: 'market_ask_price',
  },
  {
    id: 'market_ask_price',
    title: 'Ask about prices',
    description: 'Practice asking how much things cost. Talk to a vendor about prices.',
    hint: 'Try "Cuanto cuestan las manzanas?" (How much do the apples cost?) or "Cuanto cuesta el kilo?"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('market_ask_price') ||
      state.completedGoals.includes('asked_price'),
    nextGoalId: 'market_demonstratives',
  },
  {
    id: 'market_demonstratives',
    title: 'Use demonstratives to point at items',
    description: 'Practice using "este/esta" (this), "ese/esa" (that), or "aquel/aquella" (that over there) to specify which item you want.',
    hint: 'Try "Quiero estas naranjas" (I want these oranges) or "Dame esos tomates" (Give me those tomatoes)',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('market_demonstratives') ||
      state.completedGoals.includes('used_demonstrative'),
    nextGoalId: 'market_compare',
  },
  {
    id: 'market_compare',
    title: 'Compare products',
    description: 'Ask the vendor to help you compare items. Which ones are fresher, bigger, or better?',
    hint: 'Try "Cuales son mas frescas?" (Which ones are fresher?) or "Estas manzanas son mas grandes que esas?"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('market_compare') ||
      state.completedGoals.includes('compared_items'),
    nextGoalId: 'market_purchase',
  },
  {
    id: 'market_purchase',
    title: 'Make a purchase',
    description: 'Buy something from a vendor. Specify the quantity you want.',
    hint: 'Try "Quiero un kilo de manzanas" or "Me da medio kilo de tomates, por favor"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('market_purchase') ||
      state.completedGoals.includes('made_purchase') ||
      state.inventory.some((item) =>
        marketItems.some((mi) => mi.id === item.id)
      ),
    nextGoalId: 'market_checkout_pay',
  },
  {
    id: 'market_checkout_pay',
    title: 'Pay at the checkout',
    description: 'Take your items to the checkout and pay for them.',
    hint: 'Go to "la caja" (checkout) and say "Pago con efectivo" (I pay with cash) or "Pago con tarjeta" (I pay with card)',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('market_checkout_pay') ||
      state.completedGoals.includes('paid_at_checkout'),
    nextGoalId: 'market_complete',
  },
  {
    id: 'market_complete',
    title: 'Market visit complete!',
    description: 'Felicidades! You successfully shopped at the market in Spanish. You learned demonstratives, numbers, prices, and how to compare items.',
    checkComplete: () => false, // Final goal
  },
];

export function getMarketGoalById(id: string): Goal | undefined {
  return marketGoals.find((g) => g.id === id);
}

export function getMarketStartGoal(): Goal {
  return marketGoals[0];
}

// ============================================================================
// MARKET VOCABULARY
// ============================================================================

export const marketVocabulary: VocabWord[] = [
  // ==================== LOCATIONS ====================
  { spanish: 'el mercado', english: 'market', category: 'noun', gender: 'masculine' },
  { spanish: 'el puesto', english: 'stand/stall', category: 'noun', gender: 'masculine' },
  { spanish: 'el puesto de frutas', english: 'fruit stand', category: 'noun', gender: 'masculine' },
  { spanish: 'el puesto de verduras', english: 'vegetable stand', category: 'noun', gender: 'masculine' },
  { spanish: 'la carniceria', english: 'butcher shop/meat counter', category: 'noun', gender: 'feminine' },
  { spanish: 'la caja', english: 'checkout/register', category: 'noun', gender: 'feminine' },
  { spanish: 'la entrada', english: 'entrance', category: 'noun', gender: 'feminine' },

  // ==================== FRUITS ====================
  { spanish: 'la fruta', english: 'fruit', category: 'noun', gender: 'feminine' },
  { spanish: 'las frutas', english: 'fruits', category: 'noun', gender: 'feminine' },
  { spanish: 'la manzana', english: 'apple', category: 'noun', gender: 'feminine' },
  { spanish: 'las manzanas', english: 'apples', category: 'noun', gender: 'feminine' },
  { spanish: 'la naranja', english: 'orange', category: 'noun', gender: 'feminine' },
  { spanish: 'las naranjas', english: 'oranges', category: 'noun', gender: 'feminine' },
  { spanish: 'el platano', english: 'banana', category: 'noun', gender: 'masculine' },
  { spanish: 'los platanos', english: 'bananas', category: 'noun', gender: 'masculine' },
  { spanish: 'la fresa', english: 'strawberry', category: 'noun', gender: 'feminine' },
  { spanish: 'las fresas', english: 'strawberries', category: 'noun', gender: 'feminine' },
  { spanish: 'la uva', english: 'grape', category: 'noun', gender: 'feminine' },
  { spanish: 'las uvas', english: 'grapes', category: 'noun', gender: 'feminine' },
  { spanish: 'el limon', english: 'lemon', category: 'noun', gender: 'masculine' },
  { spanish: 'los limones', english: 'lemons', category: 'noun', gender: 'masculine' },
  { spanish: 'la sandia', english: 'watermelon', category: 'noun', gender: 'feminine' },
  { spanish: 'la pina', english: 'pineapple', category: 'noun', gender: 'feminine' },

  // ==================== VEGETABLES ====================
  { spanish: 'la verdura', english: 'vegetable', category: 'noun', gender: 'feminine' },
  { spanish: 'las verduras', english: 'vegetables', category: 'noun', gender: 'feminine' },
  { spanish: 'el tomate', english: 'tomato', category: 'noun', gender: 'masculine' },
  { spanish: 'los tomates', english: 'tomatoes', category: 'noun', gender: 'masculine' },
  { spanish: 'la cebolla', english: 'onion', category: 'noun', gender: 'feminine' },
  { spanish: 'las cebollas', english: 'onions', category: 'noun', gender: 'feminine' },
  { spanish: 'la papa', english: 'potato', category: 'noun', gender: 'feminine' },
  { spanish: 'las papas', english: 'potatoes', category: 'noun', gender: 'feminine' },
  { spanish: 'la zanahoria', english: 'carrot', category: 'noun', gender: 'feminine' },
  { spanish: 'las zanahorias', english: 'carrots', category: 'noun', gender: 'feminine' },
  { spanish: 'la lechuga', english: 'lettuce', category: 'noun', gender: 'feminine' },
  { spanish: 'el pimiento', english: 'pepper', category: 'noun', gender: 'masculine' },
  { spanish: 'los pimientos', english: 'peppers', category: 'noun', gender: 'masculine' },
  { spanish: 'el aguacate', english: 'avocado', category: 'noun', gender: 'masculine' },
  { spanish: 'los aguacates', english: 'avocados', category: 'noun', gender: 'masculine' },
  { spanish: 'el ajo', english: 'garlic', category: 'noun', gender: 'masculine' },

  // ==================== MEAT ====================
  { spanish: 'la carne', english: 'meat', category: 'noun', gender: 'feminine' },
  { spanish: 'el pollo', english: 'chicken', category: 'noun', gender: 'masculine' },
  { spanish: 'la carne de res', english: 'beef', category: 'noun', gender: 'feminine' },
  { spanish: 'la carne de cerdo', english: 'pork', category: 'noun', gender: 'feminine' },
  { spanish: 'la carne molida', english: 'ground beef', category: 'noun', gender: 'feminine' },
  { spanish: 'el chorizo', english: 'chorizo', category: 'noun', gender: 'masculine' },
  { spanish: 'el jamon', english: 'ham', category: 'noun', gender: 'masculine' },

  // ==================== SHOPPING ITEMS ====================
  { spanish: 'la canasta', english: 'basket', category: 'noun', gender: 'feminine' },
  { spanish: 'el carrito', english: 'cart', category: 'noun', gender: 'masculine' },
  { spanish: 'la bolsa', english: 'bag', category: 'noun', gender: 'feminine' },
  { spanish: 'las bolsas', english: 'bags', category: 'noun', gender: 'feminine' },
  { spanish: 'la balanza', english: 'scale', category: 'noun', gender: 'feminine' },
  { spanish: 'el recibo', english: 'receipt', category: 'noun', gender: 'masculine' },
  { spanish: 'el letrero', english: 'sign', category: 'noun', gender: 'masculine' },

  // ==================== MONEY & PRICES ====================
  { spanish: 'el precio', english: 'price', category: 'noun', gender: 'masculine' },
  { spanish: 'el dinero', english: 'money', category: 'noun', gender: 'masculine' },
  { spanish: 'el peso', english: 'peso (currency)', category: 'noun', gender: 'masculine' },
  { spanish: 'los pesos', english: 'pesos', category: 'noun', gender: 'masculine' },
  { spanish: 'el efectivo', english: 'cash', category: 'noun', gender: 'masculine' },
  { spanish: 'la tarjeta', english: 'card', category: 'noun', gender: 'feminine' },
  { spanish: 'el cambio', english: 'change', category: 'noun', gender: 'masculine' },
  { spanish: 'el descuento', english: 'discount', category: 'noun', gender: 'masculine' },
  { spanish: 'el total', english: 'total', category: 'noun', gender: 'masculine' },

  // ==================== UNITS & QUANTITIES ====================
  { spanish: 'el kilo', english: 'kilogram', category: 'noun', gender: 'masculine' },
  { spanish: 'el kilogramo', english: 'kilogram', category: 'noun', gender: 'masculine' },
  { spanish: 'medio kilo', english: 'half kilo', category: 'noun', gender: 'masculine' },
  { spanish: 'el gramo', english: 'gram', category: 'noun', gender: 'masculine' },
  { spanish: 'cien gramos', english: 'hundred grams', category: 'noun', gender: 'masculine' },
  { spanish: 'doscientos gramos', english: 'two hundred grams', category: 'noun', gender: 'masculine' },
  { spanish: 'la docena', english: 'dozen', category: 'noun', gender: 'feminine' },
  { spanish: 'la pieza', english: 'piece', category: 'noun', gender: 'feminine' },

  // ==================== DEMONSTRATIVES (THIS/THAT) ====================
  // Near speaker (this)
  { spanish: 'este', english: 'this (masc)', category: 'adjective' },
  { spanish: 'esta', english: 'this (fem)', category: 'adjective' },
  { spanish: 'estos', english: 'these (masc)', category: 'adjective' },
  { spanish: 'estas', english: 'these (fem)', category: 'adjective' },
  { spanish: 'esto', english: 'this (neuter/abstract)', category: 'other' },
  
  // Near listener (that)
  { spanish: 'ese', english: 'that (masc)', category: 'adjective' },
  { spanish: 'esa', english: 'that (fem)', category: 'adjective' },
  { spanish: 'esos', english: 'those (masc)', category: 'adjective' },
  { spanish: 'esas', english: 'those (fem)', category: 'adjective' },
  { spanish: 'eso', english: 'that (neuter/abstract)', category: 'other' },
  
  // Far from both (that over there)
  { spanish: 'aquel', english: 'that over there (masc)', category: 'adjective' },
  { spanish: 'aquella', english: 'that over there (fem)', category: 'adjective' },
  { spanish: 'aquellos', english: 'those over there (masc)', category: 'adjective' },
  { spanish: 'aquellas', english: 'those over there (fem)', category: 'adjective' },
  { spanish: 'aquello', english: 'that over there (neuter)', category: 'other' },

  // ==================== NUMBERS 1-100 ====================
  // 1-20
  { spanish: 'uno', english: 'one', category: 'other' },
  { spanish: 'dos', english: 'two', category: 'other' },
  { spanish: 'tres', english: 'three', category: 'other' },
  { spanish: 'cuatro', english: 'four', category: 'other' },
  { spanish: 'cinco', english: 'five', category: 'other' },
  { spanish: 'seis', english: 'six', category: 'other' },
  { spanish: 'siete', english: 'seven', category: 'other' },
  { spanish: 'ocho', english: 'eight', category: 'other' },
  { spanish: 'nueve', english: 'nine', category: 'other' },
  { spanish: 'diez', english: 'ten', category: 'other' },
  { spanish: 'once', english: 'eleven', category: 'other' },
  { spanish: 'doce', english: 'twelve', category: 'other' },
  { spanish: 'trece', english: 'thirteen', category: 'other' },
  { spanish: 'catorce', english: 'fourteen', category: 'other' },
  { spanish: 'quince', english: 'fifteen', category: 'other' },
  { spanish: 'dieciseis', english: 'sixteen', category: 'other' },
  { spanish: 'diecisiete', english: 'seventeen', category: 'other' },
  { spanish: 'dieciocho', english: 'eighteen', category: 'other' },
  { spanish: 'diecinueve', english: 'nineteen', category: 'other' },
  { spanish: 'veinte', english: 'twenty', category: 'other' },
  
  // 21-29 (compound form)
  { spanish: 'veintiuno', english: 'twenty-one', category: 'other' },
  { spanish: 'veintidos', english: 'twenty-two', category: 'other' },
  { spanish: 'veintitres', english: 'twenty-three', category: 'other' },
  { spanish: 'veinticuatro', english: 'twenty-four', category: 'other' },
  { spanish: 'veinticinco', english: 'twenty-five', category: 'other' },
  { spanish: 'veintiseis', english: 'twenty-six', category: 'other' },
  { spanish: 'veintisiete', english: 'twenty-seven', category: 'other' },
  { spanish: 'veintiocho', english: 'twenty-eight', category: 'other' },
  { spanish: 'veintinueve', english: 'twenty-nine', category: 'other' },
  
  // Tens (30-90)
  { spanish: 'treinta', english: 'thirty', category: 'other' },
  { spanish: 'cuarenta', english: 'forty', category: 'other' },
  { spanish: 'cincuenta', english: 'fifty', category: 'other' },
  { spanish: 'sesenta', english: 'sixty', category: 'other' },
  { spanish: 'setenta', english: 'seventy', category: 'other' },
  { spanish: 'ochenta', english: 'eighty', category: 'other' },
  { spanish: 'noventa', english: 'ninety', category: 'other' },
  { spanish: 'cien', english: 'one hundred', category: 'other' },
  
  // Compound pattern for 31-99 uses "y" (e.g., treinta y uno)
  { spanish: 'y', english: 'and', category: 'other' },
  { spanish: 'treinta y cinco', english: 'thirty-five', category: 'other' },
  { spanish: 'cuarenta y cinco', english: 'forty-five', category: 'other' },
  { spanish: 'cincuenta y cinco', english: 'fifty-five', category: 'other' },
  { spanish: 'setenta y cinco', english: 'seventy-five', category: 'other' },
  { spanish: 'noventa y nueve', english: 'ninety-nine', category: 'other' },

  // ==================== VERBS - SHOPPING ====================
  { spanish: 'compro', english: 'I buy', category: 'verb' },
  { spanish: 'compras', english: 'you buy', category: 'verb' },
  { spanish: 'compra', english: 'he/she buys', category: 'verb' },
  { spanish: 'compramos', english: 'we buy', category: 'verb' },
  { spanish: 'vendo', english: 'I sell', category: 'verb' },
  { spanish: 'vendes', english: 'you sell', category: 'verb' },
  { spanish: 'vende', english: 'he/she sells', category: 'verb' },
  { spanish: 'pago', english: 'I pay', category: 'verb' },
  { spanish: 'pagas', english: 'you pay', category: 'verb' },
  { spanish: 'paga', english: 'he/she pays', category: 'verb' },
  
  // Wanting and needing
  { spanish: 'quiero', english: 'I want', category: 'verb' },
  { spanish: 'quieres', english: 'you want', category: 'verb' },
  { spanish: 'quiere', english: 'he/she wants', category: 'verb' },
  { spanish: 'necesito', english: 'I need', category: 'verb' },
  { spanish: 'necesitas', english: 'you need', category: 'verb' },
  { spanish: 'necesita', english: 'he/she needs', category: 'verb' },
  { spanish: 'busco', english: 'I look for', category: 'verb' },
  { spanish: 'buscas', english: 'you look for', category: 'verb' },
  { spanish: 'busca', english: 'he/she looks for', category: 'verb' },
  
  // Giving and receiving
  { spanish: 'me da', english: 'give me (formal)', category: 'verb' },
  { spanish: 'dame', english: 'give me (informal)', category: 'verb' },
  { spanish: 'le doy', english: 'I give you (formal)', category: 'verb' },
  
  // Cost verbs
  { spanish: 'cuesta', english: 'it costs', category: 'verb' },
  { spanish: 'cuestan', english: 'they cost', category: 'verb' },
  { spanish: 'vale', english: 'it is worth/costs', category: 'verb' },
  { spanish: 'valen', english: 'they are worth/cost', category: 'verb' },
  
  // Weighing
  { spanish: 'peso', english: 'I weigh', category: 'verb' },
  { spanish: 'pesa', english: 'it weighs', category: 'verb' },
  { spanish: 'pesan', english: 'they weigh', category: 'verb' },

  // ==================== QUESTION WORDS ====================
  { spanish: 'cuanto', english: 'how much (masc)', category: 'other' },
  { spanish: 'cuanta', english: 'how much (fem)', category: 'other' },
  { spanish: 'cuantos', english: 'how many (masc)', category: 'other' },
  { spanish: 'cuantas', english: 'how many (fem)', category: 'other' },
  { spanish: 'cual', english: 'which', category: 'other' },
  { spanish: 'cuales', english: 'which (plural)', category: 'other' },

  // ==================== ADJECTIVES - QUALITY ====================
  { spanish: 'fresco', english: 'fresh (masc)', category: 'adjective' },
  { spanish: 'fresca', english: 'fresh (fem)', category: 'adjective' },
  { spanish: 'frescos', english: 'fresh (masc pl)', category: 'adjective' },
  { spanish: 'frescas', english: 'fresh (fem pl)', category: 'adjective' },
  { spanish: 'maduro', english: 'ripe (masc)', category: 'adjective' },
  { spanish: 'madura', english: 'ripe (fem)', category: 'adjective' },
  { spanish: 'grande', english: 'big', category: 'adjective' },
  { spanish: 'grandes', english: 'big (plural)', category: 'adjective' },
  { spanish: 'pequeno', english: 'small (masc)', category: 'adjective' },
  { spanish: 'pequena', english: 'small (fem)', category: 'adjective' },
  { spanish: 'bueno', english: 'good (masc)', category: 'adjective' },
  { spanish: 'buena', english: 'good (fem)', category: 'adjective' },
  { spanish: 'mejor', english: 'better/best', category: 'adjective' },
  { spanish: 'barato', english: 'cheap (masc)', category: 'adjective' },
  { spanish: 'barata', english: 'cheap (fem)', category: 'adjective' },
  { spanish: 'caro', english: 'expensive (masc)', category: 'adjective' },
  { spanish: 'cara', english: 'expensive (fem)', category: 'adjective' },

  // ==================== COMPARATIVES ====================
  { spanish: 'mas', english: 'more', category: 'other' },
  { spanish: 'menos', english: 'less', category: 'other' },
  { spanish: 'que', english: 'than/that', category: 'other' },
  { spanish: 'mas grande que', english: 'bigger than', category: 'other' },
  { spanish: 'mas fresco que', english: 'fresher than', category: 'other' },
  { spanish: 'mas barato que', english: 'cheaper than', category: 'other' },
  { spanish: 'mas caro que', english: 'more expensive than', category: 'other' },

  // ==================== COMMON PHRASES ====================
  { spanish: 'cuanto cuesta?', english: 'how much does it cost?', category: 'other' },
  { spanish: 'cuanto cuestan?', english: 'how much do they cost?', category: 'other' },
  { spanish: 'cuanto es?', english: 'how much is it?', category: 'other' },
  { spanish: 'a cuanto esta?', english: 'how much is it? (prices)', category: 'other' },
  { spanish: 'a cuanto estan?', english: 'how much are they? (prices)', category: 'other' },
  { spanish: 'el kilo', english: 'per kilo', category: 'other' },
  { spanish: 'por kilo', english: 'per kilo', category: 'other' },
  { spanish: 'la pieza', english: 'per piece', category: 'other' },
  { spanish: 'por favor', english: 'please', category: 'other' },
  { spanish: 'gracias', english: 'thank you', category: 'other' },
  { spanish: 'algo mas?', english: 'anything else?', category: 'other' },
  { spanish: 'nada mas', english: 'nothing else', category: 'other' },
  { spanish: 'es todo', english: 'that is all', category: 'other' },
  { spanish: 'aqui tiene', english: 'here you go', category: 'other' },
  { spanish: 'con efectivo', english: 'with cash', category: 'other' },
  { spanish: 'con tarjeta', english: 'with card', category: 'other' },
  { spanish: 'tiene cambio?', english: 'do you have change?', category: 'other' },
  { spanish: 'el recibo', english: 'the receipt', category: 'noun', gender: 'masculine' },
];

// ============================================================================
// SAMPLE DIALOG FLOWS
// ============================================================================

/**
 * These are example conversation flows to guide the AI in generating
 * natural NPC responses. Not used directly in code, but helpful for
 * understanding the expected interactions.
 */

export const sampleDialogs = {
  askingPrice: {
    player: 'Cuanto cuestan las manzanas?',
    npc: 'Las manzanas cuestan veinticinco pesos el kilo. Estan muy frescas hoy!',
  },
  usingDemonstratives: {
    player: 'Quiero estas naranjas, no esas.',
    npc: 'Muy bien! Estas naranjas son las mas dulces. Cuantos kilos quiere?',
  },
  comparingItems: {
    player: 'Cuales tomates son mas frescos?',
    npc: 'Estos tomates llegaron esta manana. Esos de alla son de ayer, pero todavia estan buenos.',
  },
  specifyingQuantity: {
    player: 'Me da un kilo de papas, por favor.',
    npc: 'Claro! Un kilo de papas... son veinte pesos. Algo mas?',
  },
  atCheckout: {
    player: 'Cuanto es el total?',
    npc: 'El total es ochenta y cinco pesos. Paga con efectivo o tarjeta?',
  },
  payingCash: {
    player: 'Pago con efectivo. Aqui tiene cien pesos.',
    npc: 'Perfecto. Su cambio es quince pesos. Aqui tiene su recibo. Gracias!',
  },
};
