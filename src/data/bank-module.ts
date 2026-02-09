import type { Location, Goal, VocabWord, GameState, NPC } from '../engine/types.js';

// ============================================================================
// BANK LOCATIONS
// ============================================================================

export const bankEntrance: Location = {
  id: 'bank_entrance',
  name: { spanish: 'la entrada del banco', english: 'bank entrance' },
  objects: [
    {
      id: 'bank_door',
      name: { spanish: 'la puerta del banco', english: 'bank door' },
      state: { open: true },
      actions: ['OPEN', 'CLOSE'],
    },
    {
      id: 'bank_hours_sign',
      name: { spanish: 'el horario', english: 'hours sign' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'atm_machine',
      name: { spanish: 'el cajero automatico', english: 'ATM machine' },
      state: { working: true },
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'security_camera',
      name: { spanish: 'la camara de seguridad', english: 'security camera' },
      state: { on: true },
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'bank_waiting_area', name: { spanish: 'la sala de espera', english: 'waiting area' } },
    { to: 'street', name: { spanish: 'la calle', english: 'street' } },
  ],
};

export const bankWaitingArea: Location = {
  id: 'bank_waiting_area',
  name: { spanish: 'la sala de espera', english: 'waiting area' },
  objects: [
    {
      id: 'number_dispenser',
      name: { spanish: 'el dispensador de turnos', english: 'number dispenser' },
      state: { hasTicket: true, currentNumber: 42 },
      actions: ['USE', 'TAKE'],
    },
    {
      id: 'waiting_chairs',
      name: { spanish: 'las sillas de espera', english: 'waiting chairs' },
      state: {},
      actions: [],
    },
    {
      id: 'queue_display',
      name: { spanish: 'la pantalla de turnos', english: 'queue display' },
      state: { currentlyServing: 41 },
      actions: ['LOOK'],
    },
    {
      id: 'bank_brochures',
      name: { spanish: 'los folletos', english: 'brochures' },
      state: {},
      actions: ['TAKE', 'LOOK'],
      takeable: true,
    },
    {
      id: 'water_cooler',
      name: { spanish: 'el dispensador de agua', english: 'water cooler' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'deposit_forms',
      name: { spanish: 'los formularios de deposito', english: 'deposit forms' },
      state: { filled: false },
      actions: ['TAKE', 'LOOK', 'USE'],
      takeable: true,
    },
    {
      id: 'withdrawal_forms',
      name: { spanish: 'los formularios de retiro', english: 'withdrawal forms' },
      state: { filled: false },
      actions: ['TAKE', 'LOOK', 'USE'],
      takeable: true,
    },
    {
      id: 'pens',
      name: { spanish: 'los boligrafos', english: 'pens' },
      state: {},
      actions: ['TAKE', 'USE'],
      takeable: true,
    },
  ],
  exits: [
    { to: 'bank_entrance', name: { spanish: 'la entrada', english: 'entrance' } },
    { to: 'bank_teller_window', name: { spanish: 'la ventanilla', english: 'teller window' } },
    { to: 'bank_manager_office', name: { spanish: 'la oficina del gerente', english: 'manager office' } },
  ],
};

export const bankTellerWindow: Location = {
  id: 'bank_teller_window',
  name: { spanish: 'la ventanilla', english: 'teller window' },
  objects: [
    {
      id: 'teller_counter',
      name: { spanish: 'el mostrador', english: 'counter' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'receipt_printer',
      name: { spanish: 'la impresora de recibos', english: 'receipt printer' },
      state: { hasPaper: true },
      actions: ['LOOK'],
    },
    {
      id: 'cash_drawer',
      name: { spanish: 'la caja de dinero', english: 'cash drawer' },
      state: { open: false },
      actions: ['LOOK'],
    },
    {
      id: 'transaction_receipt',
      name: { spanish: 'el recibo', english: 'receipt' },
      state: { printed: false, transactionType: null, amount: 0 },
      actions: ['TAKE', 'LOOK'],
      takeable: true,
    },
    {
      id: 'id_scanner',
      name: { spanish: 'el escaner de identificacion', english: 'ID scanner' },
      state: {},
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'customer_screen',
      name: { spanish: 'la pantalla del cliente', english: 'customer screen' },
      state: { showing: 'balance', balance: 5750.00 },
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'bank_waiting_area', name: { spanish: 'la sala de espera', english: 'waiting area' } },
  ],
};

export const bankManagerOffice: Location = {
  id: 'bank_manager_office',
  name: { spanish: 'la oficina del gerente', english: 'manager office' },
  objects: [
    {
      id: 'manager_desk',
      name: { spanish: 'el escritorio', english: 'desk' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'visitor_chairs',
      name: { spanish: 'las sillas para visitantes', english: 'visitor chairs' },
      state: {},
      actions: [],
    },
    {
      id: 'account_documents',
      name: { spanish: 'los documentos de cuenta', english: 'account documents' },
      state: { signed: false },
      actions: ['LOOK', 'USE'],
    },
    {
      id: 'loan_application',
      name: { spanish: 'la solicitud de prestamo', english: 'loan application' },
      state: { filled: false, approved: false },
      actions: ['TAKE', 'LOOK', 'USE'],
      takeable: true,
    },
    {
      id: 'business_cards',
      name: { spanish: 'las tarjetas de presentacion', english: 'business cards' },
      state: {},
      actions: ['TAKE', 'LOOK'],
      takeable: true,
    },
    {
      id: 'office_plant',
      name: { spanish: 'la planta de oficina', english: 'office plant' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'bank_waiting_area', name: { spanish: 'la sala de espera', english: 'waiting area' } },
  ],
};

export const bankLocations: Record<string, Location> = {
  bank_entrance: bankEntrance,
  bank_waiting_area: bankWaitingArea,
  bank_teller_window: bankTellerWindow,
  bank_manager_office: bankManagerOffice,
};

// ============================================================================
// BANK NPCs
// ============================================================================

export const bankNPCs: NPC[] = [
  {
    id: 'bank_guard',
    name: { spanish: 'Roberto', english: 'Roberto' },
    location: 'bank_entrance',
    personality: 'Professional security guard named Roberto. Greets customers formally with "Buenos dias" or "Buenas tardes". Uses "usted" exclusively. Helpful but watchful. Will direct customers inside and explain they need to take a number. Key phrases: "Bienvenido al banco" (Welcome to the bank), "Pase adelante" (Go ahead), "Tome un numero, por favor" (Take a number, please).',
  },
  {
    id: 'bank_teller',
    name: { spanish: 'Maria Elena', english: 'Maria Elena' },
    location: 'bank_teller_window',
    personality: 'Friendly and efficient bank teller named Maria Elena. Always uses formal "usted" and polite conditionals. Patient with customers. Explains transactions clearly. Key phrases: "En que le puedo ayudar?" (How may I help you?), "Me permite su identificacion?" (May I see your ID?), "Cuanto desea depositar/retirar?" (How much would you like to deposit/withdraw?), "Algo mas en lo que le pueda servir?" (Anything else I can help you with?), "Que tenga buen dia" (Have a nice day).',
  },
  {
    id: 'bank_manager',
    name: { spanish: 'el senor Mendoza', english: 'Mr. Mendoza' },
    location: 'bank_manager_office',
    personality: 'Distinguished bank manager named Senor Mendoza. Very formal and professional. Uses elaborate courtesy phrases and conditional tense. Handles special accounts, loans, and complaints. Key phrases: "Tome asiento, por favor" (Please have a seat), "En que podria ayudarle hoy?" (How might I help you today?), "Permitame revisar su cuenta" (Allow me to review your account), "Tendria que llenar esta solicitud" (You would need to fill out this application).',
  },
];

// Extended NPC state for bank interactions
export interface BankNPCState {
  mood: string;
  lastResponse?: string;
  // Guard-specific
  hasGreeted?: boolean;
  hasDirectedInside?: boolean;
  // Teller-specific
  hasAskedForID?: boolean;
  hasCheckedBalance?: boolean;
  hasProcessedDeposit?: boolean;
  hasProcessedWithdrawal?: boolean;
  currentTransaction?: {
    type: 'deposit' | 'withdrawal' | 'balance' | null;
    amount: number;
    completed: boolean;
  };
  // Manager-specific
  hasOfferedSeat?: boolean;
  isDiscussingLoan?: boolean;
}

export function getBankNPCsInLocation(locationId: string): NPC[] {
  return bankNPCs.filter(npc => npc.location === locationId);
}

// ============================================================================
// BANK GOALS
// ============================================================================

export const bankGoals: Goal[] = [
  {
    id: 'bank_enter_greet',
    title: 'Enter the bank and greet the guard',
    description: 'You need to visit the bank today. Enter and greet the security guard politely.',
    hint: 'Try "Buenos dias" or "Buenas tardes, senor" to greet formally',
    checkComplete: (state: GameState) => {
      return state.location.id === 'bank_entrance' &&
             (state.completedGoals.includes('greeted_guard') ||
              state.completedGoals.includes('bank_enter_greet'));
    },
    nextGoalId: 'bank_take_number',
  },
  {
    id: 'bank_take_number',
    title: 'Take a number and wait',
    description: 'Go to the waiting area and take a number from the dispenser. Banks in Spanish-speaking countries use a queue system.',
    hint: 'Go to the waiting area with "Voy a la sala de espera" then "Tomo un numero" or "Uso el dispensador"',
    checkComplete: (state: GameState) => {
      return state.completedGoals.includes('took_number') ||
             state.completedGoals.includes('bank_take_number') ||
             state.inventory.some(item => item.id === 'queue_ticket');
    },
    nextGoalId: 'bank_approach_teller',
  },
  {
    id: 'bank_approach_teller',
    title: 'Approach the teller window',
    description: 'Your number has been called! Go to the teller window and greet Maria Elena formally.',
    hint: 'Try "Voy a la ventanilla" then greet with "Buenos dias, quisiera hacer una consulta"',
    checkComplete: (state: GameState) => {
      return state.location.id === 'bank_teller_window' &&
             (state.completedGoals.includes('greeted_teller') ||
              state.completedGoals.includes('bank_approach_teller'));
    },
    nextGoalId: 'bank_check_balance',
  },
  {
    id: 'bank_check_balance',
    title: 'Check your account balance',
    description: 'Ask the teller to check your account balance. Use polite conditional forms!',
    hint: 'Try "Quisiera consultar mi saldo, por favor" or "Podria decirme cuanto tengo en mi cuenta?"',
    checkComplete: (state: GameState) => {
      return state.completedGoals.includes('checked_balance') ||
             state.completedGoals.includes('bank_check_balance');
    },
    nextGoalId: 'bank_make_deposit',
  },
  {
    id: 'bank_make_deposit',
    title: 'Make a deposit',
    description: 'You want to deposit 500 pesos into your account. Tell the teller how much you want to deposit.',
    hint: 'Try "Quisiera depositar quinientos pesos" or "Me gustaria hacer un deposito de quinientos pesos"',
    checkComplete: (state: GameState) => {
      return state.completedGoals.includes('made_deposit') ||
             state.completedGoals.includes('bank_make_deposit');
    },
    nextGoalId: 'bank_withdraw_cash',
  },
  {
    id: 'bank_withdraw_cash',
    title: 'Withdraw cash',
    description: 'Now withdraw 200 pesos for the week. Practice saying larger numbers!',
    hint: 'Try "Quisiera retirar doscientos pesos" or "Podria sacar doscientos pesos, por favor?"',
    checkComplete: (state: GameState) => {
      return state.completedGoals.includes('made_withdrawal') ||
             state.completedGoals.includes('bank_withdraw_cash');
    },
    nextGoalId: 'bank_get_receipt',
  },
  {
    id: 'bank_get_receipt',
    title: 'Request a receipt',
    description: 'Ask for a receipt of your transactions. This is important documentation!',
    hint: 'Try "Me puede dar un recibo, por favor?" or "Quisiera un comprobante"',
    checkComplete: (state: GameState) => {
      const receipt = state.location.objects.find(o => o.id === 'transaction_receipt');
      return receipt?.state.printed === true ||
             state.completedGoals.includes('got_receipt') ||
             state.completedGoals.includes('bank_get_receipt');
    },
    nextGoalId: 'bank_polite_farewell',
  },
  {
    id: 'bank_polite_farewell',
    title: 'Say goodbye politely',
    description: 'Thank the teller for her help and say goodbye formally. Good manners are very important!',
    hint: 'Try "Muchas gracias por su ayuda" and "Que tenga un buen dia" or "Hasta luego"',
    checkComplete: (state: GameState) => {
      return state.completedGoals.includes('said_goodbye') ||
             state.completedGoals.includes('bank_polite_farewell');
    },
    nextGoalId: 'bank_complete',
  },
  {
    id: 'bank_complete',
    title: 'Bank visit complete!',
    description: 'Felicidades! You successfully completed banking transactions in Spanish. You learned formal "usted" forms, polite conditionals like "quisiera" and "podria", and large numbers.',
    checkComplete: () => false, // Final goal
  },
];

export function getBankGoalById(id: string): Goal | undefined {
  return bankGoals.find(g => g.id === id);
}

export function getBankStartGoal(): Goal {
  return bankGoals[0];
}

// ============================================================================
// BANK VOCABULARY
// ============================================================================

export const bankVocabulary: VocabWord[] = [
  // ==================== LOCATIONS ====================
  { spanish: 'el banco', english: 'bank', category: 'noun', gender: 'masculine' },
  { spanish: 'la entrada', english: 'entrance', category: 'noun', gender: 'feminine' },
  { spanish: 'la sala de espera', english: 'waiting area', category: 'noun', gender: 'feminine' },
  { spanish: 'la ventanilla', english: 'teller window', category: 'noun', gender: 'feminine' },
  { spanish: 'la oficina', english: 'office', category: 'noun', gender: 'feminine' },
  { spanish: 'el cajero automatico', english: 'ATM', category: 'noun', gender: 'masculine' },

  // ==================== BANK OBJECTS ====================
  { spanish: 'el dispensador de turnos', english: 'number dispenser', category: 'noun', gender: 'masculine' },
  { spanish: 'el turno', english: 'turn/number', category: 'noun', gender: 'masculine' },
  { spanish: 'el numero', english: 'number', category: 'noun', gender: 'masculine' },
  { spanish: 'el formulario', english: 'form', category: 'noun', gender: 'masculine' },
  { spanish: 'el formulario de deposito', english: 'deposit form', category: 'noun', gender: 'masculine' },
  { spanish: 'el formulario de retiro', english: 'withdrawal form', category: 'noun', gender: 'masculine' },
  { spanish: 'el recibo', english: 'receipt', category: 'noun', gender: 'masculine' },
  { spanish: 'el comprobante', english: 'receipt/proof', category: 'noun', gender: 'masculine' },
  { spanish: 'el boligrafo', english: 'pen', category: 'noun', gender: 'masculine' },
  { spanish: 'la identificacion', english: 'ID', category: 'noun', gender: 'feminine' },
  { spanish: 'el pasaporte', english: 'passport', category: 'noun', gender: 'masculine' },
  { spanish: 'la tarjeta de debito', english: 'debit card', category: 'noun', gender: 'feminine' },
  { spanish: 'la tarjeta de credito', english: 'credit card', category: 'noun', gender: 'feminine' },
  { spanish: 'el mostrador', english: 'counter', category: 'noun', gender: 'masculine' },
  { spanish: 'la pantalla', english: 'screen', category: 'noun', gender: 'feminine' },

  // ==================== PEOPLE ====================
  { spanish: 'el cajero', english: 'teller (male)', category: 'noun', gender: 'masculine' },
  { spanish: 'la cajera', english: 'teller (female)', category: 'noun', gender: 'feminine' },
  { spanish: 'el gerente', english: 'manager (male)', category: 'noun', gender: 'masculine' },
  { spanish: 'la gerente', english: 'manager (female)', category: 'noun', gender: 'feminine' },
  { spanish: 'el guardia', english: 'guard', category: 'noun', gender: 'masculine' },
  { spanish: 'el cliente', english: 'customer (male)', category: 'noun', gender: 'masculine' },
  { spanish: 'la cliente', english: 'customer (female)', category: 'noun', gender: 'feminine' },
  { spanish: 'el senor', english: 'sir/Mr.', category: 'noun', gender: 'masculine' },
  { spanish: 'la senora', english: 'madam/Mrs.', category: 'noun', gender: 'feminine' },
  { spanish: 'la senorita', english: 'miss', category: 'noun', gender: 'feminine' },

  // ==================== FINANCIAL TERMS ====================
  { spanish: 'la cuenta', english: 'account', category: 'noun', gender: 'feminine' },
  { spanish: 'la cuenta de ahorros', english: 'savings account', category: 'noun', gender: 'feminine' },
  { spanish: 'la cuenta corriente', english: 'checking account', category: 'noun', gender: 'feminine' },
  { spanish: 'el saldo', english: 'balance', category: 'noun', gender: 'masculine' },
  { spanish: 'el deposito', english: 'deposit', category: 'noun', gender: 'masculine' },
  { spanish: 'el retiro', english: 'withdrawal', category: 'noun', gender: 'masculine' },
  { spanish: 'la transferencia', english: 'transfer', category: 'noun', gender: 'feminine' },
  { spanish: 'el prestamo', english: 'loan', category: 'noun', gender: 'masculine' },
  { spanish: 'los intereses', english: 'interest', category: 'noun', gender: 'masculine' },
  { spanish: 'la comision', english: 'fee/commission', category: 'noun', gender: 'feminine' },
  { spanish: 'el efectivo', english: 'cash', category: 'noun', gender: 'masculine' },
  { spanish: 'el dinero', english: 'money', category: 'noun', gender: 'masculine' },
  { spanish: 'los billetes', english: 'bills (money)', category: 'noun', gender: 'masculine' },
  { spanish: 'las monedas', english: 'coins', category: 'noun', gender: 'feminine' },
  { spanish: 'el cheque', english: 'check', category: 'noun', gender: 'masculine' },
  { spanish: 'la firma', english: 'signature', category: 'noun', gender: 'feminine' },

  // ==================== LARGE NUMBERS (100-10000) ====================
  { spanish: 'cien', english: 'one hundred', category: 'other' },
  { spanish: 'ciento uno', english: 'one hundred one', category: 'other' },
  { spanish: 'ciento cincuenta', english: 'one hundred fifty', category: 'other' },
  { spanish: 'doscientos', english: 'two hundred', category: 'other' },
  { spanish: 'trescientos', english: 'three hundred', category: 'other' },
  { spanish: 'cuatrocientos', english: 'four hundred', category: 'other' },
  { spanish: 'quinientos', english: 'five hundred', category: 'other' },
  { spanish: 'seiscientos', english: 'six hundred', category: 'other' },
  { spanish: 'setecientos', english: 'seven hundred', category: 'other' },
  { spanish: 'ochocientos', english: 'eight hundred', category: 'other' },
  { spanish: 'novecientos', english: 'nine hundred', category: 'other' },
  { spanish: 'mil', english: 'one thousand', category: 'other' },
  { spanish: 'dos mil', english: 'two thousand', category: 'other' },
  { spanish: 'tres mil', english: 'three thousand', category: 'other' },
  { spanish: 'cinco mil', english: 'five thousand', category: 'other' },
  { spanish: 'diez mil', english: 'ten thousand', category: 'other' },
  { spanish: 'el peso', english: 'peso (currency)', category: 'noun', gender: 'masculine' },
  { spanish: 'los pesos', english: 'pesos', category: 'noun', gender: 'masculine' },

  // ==================== FORMAL USTED VERB FORMS ====================
  // Present tense - formal "usted" forms
  { spanish: 'tiene', english: 'you have (formal)', category: 'verb' },
  { spanish: 'necesita', english: 'you need (formal)', category: 'verb' },
  { spanish: 'desea', english: 'you wish/want (formal)', category: 'verb' },
  { spanish: 'puede', english: 'you can (formal)', category: 'verb' },
  { spanish: 'quiere', english: 'you want (formal)', category: 'verb' },
  { spanish: 'prefiere', english: 'you prefer (formal)', category: 'verb' },

  // First person banking verbs
  { spanish: 'deposito', english: 'I deposit', category: 'verb' },
  { spanish: 'retiro', english: 'I withdraw', category: 'verb' },
  { spanish: 'transfiero', english: 'I transfer', category: 'verb' },
  { spanish: 'consulto', english: 'I check/consult', category: 'verb' },
  { spanish: 'firmo', english: 'I sign', category: 'verb' },
  { spanish: 'lleno', english: 'I fill out', category: 'verb' },
  { spanish: 'espero', english: 'I wait', category: 'verb' },

  // ==================== POLITE CONDITIONALS ====================
  { spanish: 'quisiera', english: 'I would like', category: 'verb' },
  { spanish: 'querria', english: 'I would want', category: 'verb' },
  { spanish: 'podria', english: 'could you/I could', category: 'verb' },
  { spanish: 'me gustaria', english: 'I would like', category: 'verb' },
  { spanish: 'seria', english: 'it would be', category: 'verb' },
  { spanish: 'tendria', english: 'I/you would have', category: 'verb' },
  { spanish: 'deberia', english: 'I/you should', category: 'verb' },

  // Polite request structures
  { spanish: 'podria...?', english: 'could you...?', category: 'verb' },
  { spanish: 'me podria...?', english: 'could you... for me?', category: 'verb' },
  { spanish: 'seria posible...?', english: 'would it be possible...?', category: 'verb' },
  { spanish: 'tendria la bondad de...?', english: 'would you be so kind as to...?', category: 'verb' },

  // ==================== FORMAL PHRASES & EXPRESSIONS ====================
  // Greetings (formal)
  { spanish: 'buenos dias', english: 'good morning', category: 'other' },
  { spanish: 'buenas tardes', english: 'good afternoon', category: 'other' },
  { spanish: 'buenas noches', english: 'good evening', category: 'other' },
  { spanish: 'bienvenido', english: 'welcome (to male)', category: 'other' },
  { spanish: 'bienvenida', english: 'welcome (to female)', category: 'other' },

  // Polite expressions
  { spanish: 'por favor', english: 'please', category: 'other' },
  { spanish: 'gracias', english: 'thank you', category: 'other' },
  { spanish: 'muchas gracias', english: 'thank you very much', category: 'other' },
  { spanish: 'muy amable', english: 'very kind (of you)', category: 'other' },
  { spanish: 'de nada', english: "you're welcome", category: 'other' },
  { spanish: 'con mucho gusto', english: 'with pleasure', category: 'other' },
  { spanish: 'a sus ordenes', english: 'at your service', category: 'other' },
  { spanish: 'disculpe', english: 'excuse me (formal)', category: 'other' },
  { spanish: 'perdone', english: 'pardon me (formal)', category: 'other' },
  { spanish: 'con permiso', english: 'excuse me (passing by)', category: 'other' },

  // Farewells (formal)
  { spanish: 'hasta luego', english: 'see you later', category: 'other' },
  { spanish: 'que tenga buen dia', english: 'have a good day', category: 'other' },
  { spanish: 'que le vaya bien', english: 'may it go well for you', category: 'other' },
  { spanish: 'ha sido un placer', english: 'it has been a pleasure', category: 'other' },

  // ==================== BANKING PHRASES ====================
  // Common requests
  { spanish: 'en que le puedo ayudar?', english: 'how may I help you?', category: 'other' },
  { spanish: 'quisiera consultar mi saldo', english: 'I would like to check my balance', category: 'other' },
  { spanish: 'quisiera hacer un deposito', english: 'I would like to make a deposit', category: 'other' },
  { spanish: 'quisiera hacer un retiro', english: 'I would like to make a withdrawal', category: 'other' },
  { spanish: 'quisiera abrir una cuenta', english: 'I would like to open an account', category: 'other' },
  { spanish: 'cuanto desea depositar?', english: 'how much would you like to deposit?', category: 'other' },
  { spanish: 'cuanto desea retirar?', english: 'how much would you like to withdraw?', category: 'other' },
  { spanish: 'me permite su identificacion?', english: 'may I see your ID?', category: 'other' },
  { spanish: 'aqui tiene', english: 'here you go', category: 'other' },
  { spanish: 'firme aqui, por favor', english: 'sign here, please', category: 'other' },
  { spanish: 'algo mas?', english: 'anything else?', category: 'other' },
  { spanish: 'algo mas en lo que le pueda servir?', english: 'anything else I can help you with?', category: 'other' },
  { spanish: 'tome asiento, por favor', english: 'please have a seat', category: 'other' },
  { spanish: 'pase adelante', english: 'go ahead/come forward', category: 'other' },
  { spanish: 'un momento, por favor', english: 'one moment, please', category: 'other' },

  // Queue/waiting
  { spanish: 'tome un numero', english: 'take a number', category: 'other' },
  { spanish: 'es mi turno', english: "it's my turn", category: 'other' },
  { spanish: 'quien sigue?', english: "who's next?", category: 'other' },
  { spanish: 'el siguiente', english: 'the next one', category: 'other' },

  // ==================== ADJECTIVES ====================
  { spanish: 'disponible', english: 'available', category: 'adjective' },
  { spanish: 'correcto', english: 'correct', category: 'adjective' },
  { spanish: 'seguro', english: 'safe/secure', category: 'adjective' },
  { spanish: 'urgente', english: 'urgent', category: 'adjective' },
  { spanish: 'suficiente', english: 'sufficient', category: 'adjective' },
  { spanish: 'mensual', english: 'monthly', category: 'adjective' },
  { spanish: 'anual', english: 'annual', category: 'adjective' },
];

export const promptInstructions = `BANK NPCs:
- Security Guard (Roberto): Professional security guard. Greets customers formally with "Buenos dias" or "Buenas tardes". Uses "usted" exclusively. Will direct customers inside and explain they need to take a number. Key phrases: "Bienvenido al banco" (Welcome to the bank), "Pase adelante" (Go ahead), "Tome un numero, por favor" (Take a number, please).
- Bank Teller (Maria Elena): Friendly and efficient bank teller. Always uses formal "usted" and polite conditionals. Patient with customers. Key phrases: "En que le puedo ayudar?" (How may I help you?), "Me permite su identificacion?" (May I see your ID?), "Cuanto desea depositar/retirar?" (How much would you like to deposit/withdraw?), "Algo mas en lo que le pueda servir?" (Anything else I can help you with?).
- Bank Manager (Senor Mendoza): Distinguished bank manager. Very formal and professional. Uses elaborate courtesy phrases and conditional tense. Handles special accounts, loans, and complaints. Key phrases: "Tome asiento, por favor" (Please have a seat), "En que podria ayudarle hoy?" (How might I help you today?).

BANK INTERACTIONS:
- "Buenos dias" or "Buenas tardes" at entrance → actions: [{ "type": "talk", "npcId": "bank_guard" }], goalComplete: ["greeted_guard"], npcResponse from bank_guard
- "Tomo un numero" or "Uso el dispensador" → actions: [{ "type": "use", "objectId": "number_dispenser" }], goalComplete: ["took_number"]
- Greet teller at window → actions: [{ "type": "talk", "npcId": "bank_teller" }], goalComplete: ["greeted_teller"]
- "Quisiera consultar mi saldo" → actions: [{ "type": "talk", "npcId": "bank_teller" }], goalComplete: ["checked_balance"], npcResponse from bank_teller
- "Quisiera depositar quinientos pesos" → actions: [{ "type": "talk", "npcId": "bank_teller" }], goalComplete: ["made_deposit"], npcResponse from bank_teller
- "Quisiera retirar doscientos pesos" → actions: [{ "type": "talk", "npcId": "bank_teller" }], goalComplete: ["made_withdrawal"], npcResponse from bank_teller
- "Me puede dar un recibo?" → actions: [{ "type": "talk", "npcId": "bank_teller" }], goalComplete: ["got_receipt"], npcResponse from bank_teller
- "Muchas gracias" or "Hasta luego" to teller → actions: [{ "type": "talk", "npcId": "bank_teller" }], goalComplete: ["said_goodbye"], npcResponse from bank_teller

KEY SPANISH FOR BANKING (teach these patterns):
- "Quisiera..." (I would like...) - very polite conditional form
- "Podria...?" (Could you...?) - polite requests
- Large numbers: "cien" (100), "doscientos" (200), "quinientos" (500), "mil" (1000)
- "El saldo" (balance), "El deposito" (deposit), "El retiro" (withdrawal)
- "El recibo" / "El comprobante" (receipt)
- Formal "usted" forms: "tiene", "desea", "puede"`;
