import type { Location, Goal, VocabWord, GameState, NPC, ModuleDefinition } from '../../../engine/types.js';

// ============================================================================
// MARKET LOCATIONS
// ============================================================================

export const marketEntrance: Location = {
  id: 'market_entrance',
  name: { target: 'la entrada del mercado', native: 'market entrance' },
  objects: [
    {
      id: 'market_sign',
      name: { target: 'el letrero del mercado', native: 'market sign' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'shopping_basket',
      name: { target: 'la canasta', native: 'shopping basket' },
      state: {},
      actions: ['TAKE'],
      takeable: true,
    },
    {
      id: 'shopping_cart',
      name: { target: 'el carrito', native: 'shopping cart' },
      state: {},
      actions: ['TAKE', 'USE'],
    },
    {
      id: 'market_directory',
      name: { target: 'el directorio', native: 'directory' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'fruit_stand', name: { target: 'el puesto de frutas', native: 'fruit stand' } },
    { to: 'vegetable_stand', name: { target: 'el puesto de verduras', native: 'vegetable stand' } },
    { to: 'meat_counter', name: { target: 'la carniceria', native: 'meat counter' } },
    { to: 'market_checkout', name: { target: 'la caja', native: 'checkout' } },
    { to: 'street', name: { target: 'la calle', native: 'street' } },
  ],
};

export const fruitStand: Location = {
  id: 'fruit_stand',
  name: { target: 'el puesto de frutas', native: 'fruit stand' },
  objects: [
    // Fruits with prices (in pesos)
    {
      id: 'apples',
      name: { target: 'las manzanas', native: 'apples' },
      state: { price: 25, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'oranges',
      name: { target: 'las naranjas', native: 'oranges' },
      state: { price: 30, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'bananas',
      name: { target: 'los platanos', native: 'bananas' },
      state: { price: 20, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'strawberries',
      name: { target: 'las fresas', native: 'strawberries' },
      state: { price: 45, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'grapes',
      name: { target: 'las uvas', native: 'grapes' },
      state: { price: 50, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'lemons',
      name: { target: 'los limones', native: 'lemons' },
      state: { price: 15, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'watermelon',
      name: { target: 'la sandia', native: 'watermelon' },
      state: { price: 35, unit: 'piece', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'pineapple',
      name: { target: 'la pina', native: 'pineapple' },
      state: { price: 40, unit: 'piece', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'fruit_scale',
      name: { target: 'la balanza', native: 'scale' },
      state: {},
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'fruit_price_sign',
      name: { target: 'el letrero de precios', native: 'price sign' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'market_entrance', name: { target: 'la entrada', native: 'entrance' } },
    { to: 'vegetable_stand', name: { target: 'el puesto de verduras', native: 'vegetable stand' } },
    { to: 'meat_counter', name: { target: 'la carniceria', native: 'meat counter' } },
    { to: 'market_checkout', name: { target: 'la caja', native: 'checkout' } },
  ],
};

export const vegetableStand: Location = {
  id: 'vegetable_stand',
  name: { target: 'el puesto de verduras', native: 'vegetable stand' },
  objects: [
    {
      id: 'tomatoes',
      name: { target: 'los tomates', native: 'tomatoes' },
      state: { price: 22, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'onions',
      name: { target: 'las cebollas', native: 'onions' },
      state: { price: 18, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'potatoes',
      name: { target: 'las papas', native: 'potatoes' },
      state: { price: 20, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'carrots',
      name: { target: 'las zanahorias', native: 'carrots' },
      state: { price: 15, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'lettuce',
      name: { target: 'la lechuga', native: 'lettuce' },
      state: { price: 12, unit: 'piece', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'peppers',
      name: { target: 'los pimientos', native: 'peppers' },
      state: { price: 28, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'avocados',
      name: { target: 'los aguacates', native: 'avocados' },
      state: { price: 55, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'garlic',
      name: { target: 'el ajo', native: 'garlic' },
      state: { price: 8, unit: 'head', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'vegetable_scale',
      name: { target: 'la balanza', native: 'scale' },
      state: {},
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'vegetable_price_sign',
      name: { target: 'el letrero de precios', native: 'price sign' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'market_entrance', name: { target: 'la entrada', native: 'entrance' } },
    { to: 'fruit_stand', name: { target: 'el puesto de frutas', native: 'fruit stand' } },
    { to: 'meat_counter', name: { target: 'la carniceria', native: 'meat counter' } },
    { to: 'market_checkout', name: { target: 'la caja', native: 'checkout' } },
  ],
};

export const meatCounter: Location = {
  id: 'meat_counter',
  name: { target: 'la carniceria', native: 'meat counter' },
  objects: [
    {
      id: 'chicken',
      name: { target: 'el pollo', native: 'chicken' },
      state: { price: 75, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'beef',
      name: { target: 'la carne de res', native: 'beef' },
      state: { price: 120, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'pork',
      name: { target: 'la carne de cerdo', native: 'pork' },
      state: { price: 95, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'ground_beef',
      name: { target: 'la carne molida', native: 'ground beef' },
      state: { price: 85, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'chorizo',
      name: { target: 'el chorizo', native: 'chorizo' },
      state: { price: 65, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'ham',
      name: { target: 'el jamon', native: 'ham' },
      state: { price: 110, unit: 'kilo', fresh: true },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'meat_display',
      name: { target: 'el mostrador', native: 'display counter' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'meat_scale',
      name: { target: 'la balanza', native: 'scale' },
      state: {},
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'meat_price_sign',
      name: { target: 'el letrero de precios', native: 'price sign' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'ticket_dispenser',
      name: { target: 'el dispensador de numeros', native: 'ticket dispenser' },
      state: { currentNumber: 45 },
      actions: ['USE', 'TAKE'],
    },
  ],
  exits: [
    { to: 'market_entrance', name: { target: 'la entrada', native: 'entrance' } },
    { to: 'fruit_stand', name: { target: 'el puesto de frutas', native: 'fruit stand' } },
    { to: 'vegetable_stand', name: { target: 'el puesto de verduras', native: 'vegetable stand' } },
    { to: 'market_checkout', name: { target: 'la caja', native: 'checkout' } },
  ],
};

export const marketCheckout: Location = {
  id: 'market_checkout',
  name: { target: 'la caja', native: 'checkout' },
  objects: [
    {
      id: 'cash_register',
      name: { target: 'la caja registradora', native: 'cash register' },
      state: {},
      actions: ['LOOK', 'USE'],
    },
    {
      id: 'conveyor_belt',
      name: { target: 'la cinta transportadora', native: 'conveyor belt' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'shopping_bags',
      name: { target: 'las bolsas', native: 'shopping bags' },
      state: { price: 2 },
      actions: ['TAKE'],
      takeable: true,
    },
    {
      id: 'receipt',
      name: { target: 'el recibo', native: 'receipt' },
      state: { printed: false, total: 0 },
      actions: ['LOOK', 'TAKE'],
      takeable: true,
    },
    {
      id: 'card_reader',
      name: { target: 'el lector de tarjetas', native: 'card reader' },
      state: {},
      actions: ['USE'],
    },
  ],
  exits: [
    { to: 'market_entrance', name: { target: 'la entrada', native: 'entrance' } },
    { to: 'street', name: { target: 'la calle', native: 'street' } },
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
    name: { target: 'Dona Maria', native: 'Mrs. Maria' },
    location: 'fruit_stand',
    personality: `Friendly elderly fruit vendor who has worked at the market for 40 years. 
    Speaks warmly and uses diminutives (frutitas, manzanitas). Very patient with customers.
    Loves to give advice about picking ripe fruit. Will say things like:
    - "Buenos dias, mi amor! Que busca hoy?"
    - "Estas naranjas estan muy dulces!"
    - "Le doy un poquito de descuento"
    Uses demonstratives frequently: "Estas manzanas son las mejores" (these apples are the best).
    When asked prices, says things like "Las fresas cuestan cuarenta y cinco pesos el kilo."`,
    gender: 'female',
  },
  {
    id: 'senor_pedro',
    name: { target: 'Senor Pedro', native: 'Mr. Pedro' },
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
    gender: 'male',
  },
  {
    id: 'carlos_carnicero',
    name: { target: 'Carlos el Carnicero', native: 'Carlos the Butcher' },
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
    gender: 'male',
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
  name: { target: string; native: string };
  price: number; // in pesos
  unit: 'kilo' | 'piece' | 'gram' | 'head' | 'bunch';
  category: 'fruit' | 'vegetable' | 'meat';
  location: string;
}

export const marketItems: MarketItem[] = [
  // FRUITS
  { id: 'apples', name: { target: 'las manzanas', native: 'apples' }, price: 25, unit: 'kilo', category: 'fruit', location: 'fruit_stand' },
  { id: 'oranges', name: { target: 'las naranjas', native: 'oranges' }, price: 30, unit: 'kilo', category: 'fruit', location: 'fruit_stand' },
  { id: 'bananas', name: { target: 'los platanos', native: 'bananas' }, price: 20, unit: 'kilo', category: 'fruit', location: 'fruit_stand' },
  { id: 'strawberries', name: { target: 'las fresas', native: 'strawberries' }, price: 45, unit: 'kilo', category: 'fruit', location: 'fruit_stand' },
  { id: 'grapes', name: { target: 'las uvas', native: 'grapes' }, price: 50, unit: 'kilo', category: 'fruit', location: 'fruit_stand' },
  { id: 'lemons', name: { target: 'los limones', native: 'lemons' }, price: 15, unit: 'kilo', category: 'fruit', location: 'fruit_stand' },
  { id: 'watermelon', name: { target: 'la sandia', native: 'watermelon' }, price: 35, unit: 'piece', category: 'fruit', location: 'fruit_stand' },
  { id: 'pineapple', name: { target: 'la pina', native: 'pineapple' }, price: 40, unit: 'piece', category: 'fruit', location: 'fruit_stand' },

  // VEGETABLES
  { id: 'tomatoes', name: { target: 'los tomates', native: 'tomatoes' }, price: 22, unit: 'kilo', category: 'vegetable', location: 'vegetable_stand' },
  { id: 'onions', name: { target: 'las cebollas', native: 'onions' }, price: 18, unit: 'kilo', category: 'vegetable', location: 'vegetable_stand' },
  { id: 'potatoes', name: { target: 'las papas', native: 'potatoes' }, price: 20, unit: 'kilo', category: 'vegetable', location: 'vegetable_stand' },
  { id: 'carrots', name: { target: 'las zanahorias', native: 'carrots' }, price: 15, unit: 'kilo', category: 'vegetable', location: 'vegetable_stand' },
  { id: 'lettuce', name: { target: 'la lechuga', native: 'lettuce' }, price: 12, unit: 'piece', category: 'vegetable', location: 'vegetable_stand' },
  { id: 'peppers', name: { target: 'los pimientos', native: 'peppers' }, price: 28, unit: 'kilo', category: 'vegetable', location: 'vegetable_stand' },
  { id: 'avocados', name: { target: 'los aguacates', native: 'avocados' }, price: 55, unit: 'kilo', category: 'vegetable', location: 'vegetable_stand' },
  { id: 'garlic', name: { target: 'el ajo', native: 'garlic' }, price: 8, unit: 'head', category: 'vegetable', location: 'vegetable_stand' },

  // MEAT
  { id: 'chicken', name: { target: 'el pollo', native: 'chicken' }, price: 75, unit: 'kilo', category: 'meat', location: 'meat_counter' },
  { id: 'beef', name: { target: 'la carne de res', native: 'beef' }, price: 120, unit: 'kilo', category: 'meat', location: 'meat_counter' },
  { id: 'pork', name: { target: 'la carne de cerdo', native: 'pork' }, price: 95, unit: 'kilo', category: 'meat', location: 'meat_counter' },
  { id: 'ground_beef', name: { target: 'la carne molida', native: 'ground beef' }, price: 85, unit: 'kilo', category: 'meat', location: 'meat_counter' },
  { id: 'chorizo', name: { target: 'el chorizo', native: 'chorizo' }, price: 65, unit: 'kilo', category: 'meat', location: 'meat_counter' },
  { id: 'ham', name: { target: 'el jamon', native: 'ham' }, price: 110, unit: 'kilo', category: 'meat', location: 'meat_counter' },
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
  { target: 'el mercado', native: 'market', category: 'noun', gender: 'masculine' },
  { target: 'el puesto', native: 'stand/stall', category: 'noun', gender: 'masculine' },
  { target: 'el puesto de frutas', native: 'fruit stand', category: 'noun', gender: 'masculine' },
  { target: 'el puesto de verduras', native: 'vegetable stand', category: 'noun', gender: 'masculine' },
  { target: 'la carniceria', native: 'butcher shop/meat counter', category: 'noun', gender: 'feminine' },
  { target: 'la caja', native: 'checkout/register', category: 'noun', gender: 'feminine' },
  { target: 'la entrada', native: 'entrance', category: 'noun', gender: 'feminine' },

  // ==================== FRUITS ====================
  { target: 'la fruta', native: 'fruit', category: 'noun', gender: 'feminine' },
  { target: 'las frutas', native: 'fruits', category: 'noun', gender: 'feminine' },
  { target: 'la manzana', native: 'apple', category: 'noun', gender: 'feminine' },
  { target: 'las manzanas', native: 'apples', category: 'noun', gender: 'feminine' },
  { target: 'la naranja', native: 'orange', category: 'noun', gender: 'feminine' },
  { target: 'las naranjas', native: 'oranges', category: 'noun', gender: 'feminine' },
  { target: 'el platano', native: 'banana', category: 'noun', gender: 'masculine' },
  { target: 'los platanos', native: 'bananas', category: 'noun', gender: 'masculine' },
  { target: 'la fresa', native: 'strawberry', category: 'noun', gender: 'feminine' },
  { target: 'las fresas', native: 'strawberries', category: 'noun', gender: 'feminine' },
  { target: 'la uva', native: 'grape', category: 'noun', gender: 'feminine' },
  { target: 'las uvas', native: 'grapes', category: 'noun', gender: 'feminine' },
  { target: 'el limon', native: 'lemon', category: 'noun', gender: 'masculine' },
  { target: 'los limones', native: 'lemons', category: 'noun', gender: 'masculine' },
  { target: 'la sandia', native: 'watermelon', category: 'noun', gender: 'feminine' },
  { target: 'la pina', native: 'pineapple', category: 'noun', gender: 'feminine' },

  // ==================== VEGETABLES ====================
  { target: 'la verdura', native: 'vegetable', category: 'noun', gender: 'feminine' },
  { target: 'las verduras', native: 'vegetables', category: 'noun', gender: 'feminine' },
  { target: 'el tomate', native: 'tomato', category: 'noun', gender: 'masculine' },
  { target: 'los tomates', native: 'tomatoes', category: 'noun', gender: 'masculine' },
  { target: 'la cebolla', native: 'onion', category: 'noun', gender: 'feminine' },
  { target: 'las cebollas', native: 'onions', category: 'noun', gender: 'feminine' },
  { target: 'la papa', native: 'potato', category: 'noun', gender: 'feminine' },
  { target: 'las papas', native: 'potatoes', category: 'noun', gender: 'feminine' },
  { target: 'la zanahoria', native: 'carrot', category: 'noun', gender: 'feminine' },
  { target: 'las zanahorias', native: 'carrots', category: 'noun', gender: 'feminine' },
  { target: 'la lechuga', native: 'lettuce', category: 'noun', gender: 'feminine' },
  { target: 'el pimiento', native: 'pepper', category: 'noun', gender: 'masculine' },
  { target: 'los pimientos', native: 'peppers', category: 'noun', gender: 'masculine' },
  { target: 'el aguacate', native: 'avocado', category: 'noun', gender: 'masculine' },
  { target: 'los aguacates', native: 'avocados', category: 'noun', gender: 'masculine' },
  { target: 'el ajo', native: 'garlic', category: 'noun', gender: 'masculine' },

  // ==================== MEAT ====================
  { target: 'la carne', native: 'meat', category: 'noun', gender: 'feminine' },
  { target: 'el pollo', native: 'chicken', category: 'noun', gender: 'masculine' },
  { target: 'la carne de res', native: 'beef', category: 'noun', gender: 'feminine' },
  { target: 'la carne de cerdo', native: 'pork', category: 'noun', gender: 'feminine' },
  { target: 'la carne molida', native: 'ground beef', category: 'noun', gender: 'feminine' },
  { target: 'el chorizo', native: 'chorizo', category: 'noun', gender: 'masculine' },
  { target: 'el jamon', native: 'ham', category: 'noun', gender: 'masculine' },

  // ==================== SHOPPING ITEMS ====================
  { target: 'la canasta', native: 'basket', category: 'noun', gender: 'feminine' },
  { target: 'el carrito', native: 'cart', category: 'noun', gender: 'masculine' },
  { target: 'la bolsa', native: 'bag', category: 'noun', gender: 'feminine' },
  { target: 'las bolsas', native: 'bags', category: 'noun', gender: 'feminine' },
  { target: 'la balanza', native: 'scale', category: 'noun', gender: 'feminine' },
  { target: 'el recibo', native: 'receipt', category: 'noun', gender: 'masculine' },
  { target: 'el letrero', native: 'sign', category: 'noun', gender: 'masculine' },

  // ==================== MONEY & PRICES ====================
  { target: 'el precio', native: 'price', category: 'noun', gender: 'masculine' },
  { target: 'el dinero', native: 'money', category: 'noun', gender: 'masculine' },
  { target: 'el peso', native: 'peso (currency)', category: 'noun', gender: 'masculine' },
  { target: 'los pesos', native: 'pesos', category: 'noun', gender: 'masculine' },
  { target: 'el efectivo', native: 'cash', category: 'noun', gender: 'masculine' },
  { target: 'la tarjeta', native: 'card', category: 'noun', gender: 'feminine' },
  { target: 'el cambio', native: 'change', category: 'noun', gender: 'masculine' },
  { target: 'el descuento', native: 'discount', category: 'noun', gender: 'masculine' },
  { target: 'el total', native: 'total', category: 'noun', gender: 'masculine' },

  // ==================== UNITS & QUANTITIES ====================
  { target: 'el kilo', native: 'kilogram', category: 'noun', gender: 'masculine' },
  { target: 'el kilogramo', native: 'kilogram', category: 'noun', gender: 'masculine' },
  { target: 'medio kilo', native: 'half kilo', category: 'noun', gender: 'masculine' },
  { target: 'el gramo', native: 'gram', category: 'noun', gender: 'masculine' },
  { target: 'cien gramos', native: 'hundred grams', category: 'noun', gender: 'masculine' },
  { target: 'doscientos gramos', native: 'two hundred grams', category: 'noun', gender: 'masculine' },
  { target: 'la docena', native: 'dozen', category: 'noun', gender: 'feminine' },
  { target: 'la pieza', native: 'piece', category: 'noun', gender: 'feminine' },

  // ==================== DEMONSTRATIVES (THIS/THAT) ====================
  // Near speaker (this)
  { target: 'este', native: 'this (masc)', category: 'adjective' },
  { target: 'esta', native: 'this (fem)', category: 'adjective' },
  { target: 'estos', native: 'these (masc)', category: 'adjective' },
  { target: 'estas', native: 'these (fem)', category: 'adjective' },
  { target: 'esto', native: 'this (neuter/abstract)', category: 'other' },
  
  // Near listener (that)
  { target: 'ese', native: 'that (masc)', category: 'adjective' },
  { target: 'esa', native: 'that (fem)', category: 'adjective' },
  { target: 'esos', native: 'those (masc)', category: 'adjective' },
  { target: 'esas', native: 'those (fem)', category: 'adjective' },
  { target: 'eso', native: 'that (neuter/abstract)', category: 'other' },
  
  // Far from both (that over there)
  { target: 'aquel', native: 'that over there (masc)', category: 'adjective' },
  { target: 'aquella', native: 'that over there (fem)', category: 'adjective' },
  { target: 'aquellos', native: 'those over there (masc)', category: 'adjective' },
  { target: 'aquellas', native: 'those over there (fem)', category: 'adjective' },
  { target: 'aquello', native: 'that over there (neuter)', category: 'other' },

  // ==================== NUMBERS 1-100 ====================
  // 1-20
  { target: 'uno', native: 'one', category: 'other' },
  { target: 'dos', native: 'two', category: 'other' },
  { target: 'tres', native: 'three', category: 'other' },
  { target: 'cuatro', native: 'four', category: 'other' },
  { target: 'cinco', native: 'five', category: 'other' },
  { target: 'seis', native: 'six', category: 'other' },
  { target: 'siete', native: 'seven', category: 'other' },
  { target: 'ocho', native: 'eight', category: 'other' },
  { target: 'nueve', native: 'nine', category: 'other' },
  { target: 'diez', native: 'ten', category: 'other' },
  { target: 'once', native: 'eleven', category: 'other' },
  { target: 'doce', native: 'twelve', category: 'other' },
  { target: 'trece', native: 'thirteen', category: 'other' },
  { target: 'catorce', native: 'fourteen', category: 'other' },
  { target: 'quince', native: 'fifteen', category: 'other' },
  { target: 'dieciseis', native: 'sixteen', category: 'other' },
  { target: 'diecisiete', native: 'seventeen', category: 'other' },
  { target: 'dieciocho', native: 'eighteen', category: 'other' },
  { target: 'diecinueve', native: 'nineteen', category: 'other' },
  { target: 'veinte', native: 'twenty', category: 'other' },
  
  // 21-29 (compound form)
  { target: 'veintiuno', native: 'twenty-one', category: 'other' },
  { target: 'veintidos', native: 'twenty-two', category: 'other' },
  { target: 'veintitres', native: 'twenty-three', category: 'other' },
  { target: 'veinticuatro', native: 'twenty-four', category: 'other' },
  { target: 'veinticinco', native: 'twenty-five', category: 'other' },
  { target: 'veintiseis', native: 'twenty-six', category: 'other' },
  { target: 'veintisiete', native: 'twenty-seven', category: 'other' },
  { target: 'veintiocho', native: 'twenty-eight', category: 'other' },
  { target: 'veintinueve', native: 'twenty-nine', category: 'other' },
  
  // Tens (30-90)
  { target: 'treinta', native: 'thirty', category: 'other' },
  { target: 'cuarenta', native: 'forty', category: 'other' },
  { target: 'cincuenta', native: 'fifty', category: 'other' },
  { target: 'sesenta', native: 'sixty', category: 'other' },
  { target: 'setenta', native: 'seventy', category: 'other' },
  { target: 'ochenta', native: 'eighty', category: 'other' },
  { target: 'noventa', native: 'ninety', category: 'other' },
  { target: 'cien', native: 'one hundred', category: 'other' },
  
  // Compound pattern for 31-99 uses "y" (e.g., treinta y uno)
  { target: 'y', native: 'and', category: 'other' },
  { target: 'treinta y cinco', native: 'thirty-five', category: 'other' },
  { target: 'cuarenta y cinco', native: 'forty-five', category: 'other' },
  { target: 'cincuenta y cinco', native: 'fifty-five', category: 'other' },
  { target: 'setenta y cinco', native: 'seventy-five', category: 'other' },
  { target: 'noventa y nueve', native: 'ninety-nine', category: 'other' },

  // ==================== VERBS - SHOPPING ====================
  { target: 'compro', native: 'I buy', category: 'verb' },
  { target: 'compras', native: 'you buy', category: 'verb' },
  { target: 'compra', native: 'he/she buys', category: 'verb' },
  { target: 'compramos', native: 'we buy', category: 'verb' },
  { target: 'vendo', native: 'I sell', category: 'verb' },
  { target: 'vendes', native: 'you sell', category: 'verb' },
  { target: 'vende', native: 'he/she sells', category: 'verb' },
  { target: 'pago', native: 'I pay', category: 'verb' },
  { target: 'pagas', native: 'you pay', category: 'verb' },
  { target: 'paga', native: 'he/she pays', category: 'verb' },
  
  // Wanting and needing
  { target: 'quiero', native: 'I want', category: 'verb' },
  { target: 'quieres', native: 'you want', category: 'verb' },
  { target: 'quiere', native: 'he/she wants', category: 'verb' },
  { target: 'necesito', native: 'I need', category: 'verb' },
  { target: 'necesitas', native: 'you need', category: 'verb' },
  { target: 'necesita', native: 'he/she needs', category: 'verb' },
  { target: 'busco', native: 'I look for', category: 'verb' },
  { target: 'buscas', native: 'you look for', category: 'verb' },
  { target: 'busca', native: 'he/she looks for', category: 'verb' },
  
  // Giving and receiving
  { target: 'me da', native: 'give me (formal)', category: 'verb' },
  { target: 'dame', native: 'give me (informal)', category: 'verb' },
  { target: 'le doy', native: 'I give you (formal)', category: 'verb' },
  
  // Cost verbs
  { target: 'cuesta', native: 'it costs', category: 'verb' },
  { target: 'cuestan', native: 'they cost', category: 'verb' },
  { target: 'vale', native: 'it is worth/costs', category: 'verb' },
  { target: 'valen', native: 'they are worth/cost', category: 'verb' },
  
  // Weighing
  { target: 'peso', native: 'I weigh', category: 'verb' },
  { target: 'pesa', native: 'it weighs', category: 'verb' },
  { target: 'pesan', native: 'they weigh', category: 'verb' },

  // ==================== QUESTION WORDS ====================
  { target: 'cuanto', native: 'how much (masc)', category: 'other' },
  { target: 'cuanta', native: 'how much (fem)', category: 'other' },
  { target: 'cuantos', native: 'how many (masc)', category: 'other' },
  { target: 'cuantas', native: 'how many (fem)', category: 'other' },
  { target: 'cual', native: 'which', category: 'other' },
  { target: 'cuales', native: 'which (plural)', category: 'other' },

  // ==================== ADJECTIVES - QUALITY ====================
  { target: 'fresco', native: 'fresh (masc)', category: 'adjective' },
  { target: 'fresca', native: 'fresh (fem)', category: 'adjective' },
  { target: 'frescos', native: 'fresh (masc pl)', category: 'adjective' },
  { target: 'frescas', native: 'fresh (fem pl)', category: 'adjective' },
  { target: 'maduro', native: 'ripe (masc)', category: 'adjective' },
  { target: 'madura', native: 'ripe (fem)', category: 'adjective' },
  { target: 'grande', native: 'big', category: 'adjective' },
  { target: 'grandes', native: 'big (plural)', category: 'adjective' },
  { target: 'pequeno', native: 'small (masc)', category: 'adjective' },
  { target: 'pequena', native: 'small (fem)', category: 'adjective' },
  { target: 'bueno', native: 'good (masc)', category: 'adjective' },
  { target: 'buena', native: 'good (fem)', category: 'adjective' },
  { target: 'mejor', native: 'better/best', category: 'adjective' },
  { target: 'barato', native: 'cheap (masc)', category: 'adjective' },
  { target: 'barata', native: 'cheap (fem)', category: 'adjective' },
  { target: 'caro', native: 'expensive (masc)', category: 'adjective' },
  { target: 'cara', native: 'expensive (fem)', category: 'adjective' },

  // ==================== COMPARATIVES ====================
  { target: 'mas', native: 'more', category: 'other' },
  { target: 'menos', native: 'less', category: 'other' },
  { target: 'que', native: 'than/that', category: 'other' },
  { target: 'mas grande que', native: 'bigger than', category: 'other' },
  { target: 'mas fresco que', native: 'fresher than', category: 'other' },
  { target: 'mas barato que', native: 'cheaper than', category: 'other' },
  { target: 'mas caro que', native: 'more expensive than', category: 'other' },

  // ==================== COMMON PHRASES ====================
  { target: 'cuanto cuesta?', native: 'how much does it cost?', category: 'other' },
  { target: 'cuanto cuestan?', native: 'how much do they cost?', category: 'other' },
  { target: 'cuanto es?', native: 'how much is it?', category: 'other' },
  { target: 'a cuanto esta?', native: 'how much is it? (prices)', category: 'other' },
  { target: 'a cuanto estan?', native: 'how much are they? (prices)', category: 'other' },
  { target: 'el kilo', native: 'per kilo', category: 'other' },
  { target: 'por kilo', native: 'per kilo', category: 'other' },
  { target: 'la pieza', native: 'per piece', category: 'other' },
  { target: 'por favor', native: 'please', category: 'other' },
  { target: 'gracias', native: 'thank you', category: 'other' },
  { target: 'algo mas?', native: 'anything else?', category: 'other' },
  { target: 'nada mas', native: 'nothing else', category: 'other' },
  { target: 'es todo', native: 'that is all', category: 'other' },
  { target: 'aqui tiene', native: 'here you go', category: 'other' },
  { target: 'con efectivo', native: 'with cash', category: 'other' },
  { target: 'con tarjeta', native: 'with card', category: 'other' },
  { target: 'tiene cambio?', native: 'do you have change?', category: 'other' },
  { target: 'el recibo', native: 'the receipt', category: 'noun', gender: 'masculine' },
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

export const promptInstructions = `MARKET NPCs:
- Dona Maria (dona_maria): Elderly fruit vendor at fruit_stand. Friendly, uses diminutives (frutitas, manzanitas). Says "Buenos dias, mi amor! Que busca hoy?" and "Estas naranjas estan muy dulces!"
- Senor Pedro (senor_pedro): Vegetable vendor at vegetable_stand. Direct but friendly. Uses demonstratives for comparisons: "Esas papas son mas grandes, pero estas son mas frescas."
- Carlos el Carnicero (carlos_carnicero): Butcher at meat_counter. Uses ticket system. Asks "Que numero tiene?" and "Cuantos gramos quiere?"

MARKET INTERACTIONS:
- "cuanto cuestan las manzanas?" or asking prices → actions: [{ "type": "talk", "npcId": "dona_maria" }], goalComplete: ["asked_price"], npcResponse with price info
- "quiero estas naranjas" or using demonstratives → actions: [{ "type": "talk", "npcId": relevant vendor }], goalComplete: ["used_demonstrative"]
- "cuales son mas frescas?" or comparing items → actions: [{ "type": "talk", "npcId": relevant vendor }], goalComplete: ["compared_items"], npcResponse comparing
- "quiero un kilo de manzanas" or specifying quantity → actions: [{ "type": "talk", "npcId": relevant vendor }], goalComplete: ["made_purchase"], npcResponse confirming
- "pago con efectivo" or "pago con tarjeta" at checkout → actions: [{ "type": "use", "objectId": "cash_register" }], goalComplete: ["paid_at_checkout"]

KEY SPANISH FOR MARKET (teach these patterns):
- "Cuanto cuesta?" / "Cuanto cuestan?" (How much does it/they cost?)
- "Este/Esta/Estos/Estas" (This/These - near speaker)
- "Ese/Esa/Esos/Esas" (That/Those - near listener)
- "Aquel/Aquella" (That over there - far from both)
- "Un kilo de..." / "Medio kilo de..." (A kilo of... / Half kilo of...)
- "Mas fresco/grande/barato que..." (Fresher/bigger/cheaper than...)`;

export const marketModule: ModuleDefinition = {
  name: 'market',
  displayName: 'Market',
  locations: marketLocations,
  npcs: marketNPCs,
  goals: marketGoals,
  vocabulary: marketVocabulary,
  startLocationId: 'market_entrance',
  startGoalId: 'market_explore',
  locationIds: Object.keys(marketLocations),
  unlockLevel: 3,
  promptInstructions,
};
