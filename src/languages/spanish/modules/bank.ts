import type { Location, Goal, VocabWord, GameState, NPC, ModuleDefinition } from '../../../engine/types.js';

// ============================================================================
// BANK LOCATIONS
// ============================================================================

export const bankEntrance: Location = {
  id: 'bank_entrance',
  name: { target: 'la entrada del banco', native: 'bank entrance' },
  objects: [
    {
      id: 'bank_door',
      name: { target: 'la puerta del banco', native: 'bank door' },
      state: { open: true },
      actions: ['OPEN', 'CLOSE'],
    },
    {
      id: 'bank_hours_sign',
      name: { target: 'el horario', native: 'hours sign' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'atm_machine',
      name: { target: 'el cajero automatico', native: 'ATM machine' },
      state: { working: true },
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'security_camera',
      name: { target: 'la camara de seguridad', native: 'security camera' },
      state: { on: true },
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'bank_waiting_area', name: { target: 'la sala de espera', native: 'waiting area' } },
    { to: 'street', name: { target: 'la calle', native: 'street' } },
  ],
};

export const bankWaitingArea: Location = {
  id: 'bank_waiting_area',
  name: { target: 'la sala de espera', native: 'waiting area' },
  objects: [
    {
      id: 'number_dispenser',
      name: { target: 'el dispensador de turnos', native: 'number dispenser' },
      state: { hasTicket: true, currentNumber: 42 },
      actions: ['USE', 'TAKE'],
    },
    {
      id: 'waiting_chairs',
      name: { target: 'las sillas de espera', native: 'waiting chairs' },
      state: {},
      actions: [],
    },
    {
      id: 'queue_display',
      name: { target: 'la pantalla de turnos', native: 'queue display' },
      state: { currentlyServing: 41 },
      actions: ['LOOK'],
    },
    {
      id: 'bank_brochures',
      name: { target: 'los folletos', native: 'brochures' },
      state: {},
      actions: ['TAKE', 'LOOK'],
      takeable: true,
    },
    {
      id: 'water_cooler',
      name: { target: 'el dispensador de agua', native: 'water cooler' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'deposit_forms',
      name: { target: 'los formularios de deposito', native: 'deposit forms' },
      state: { filled: false },
      actions: ['TAKE', 'LOOK', 'USE'],
      takeable: true,
    },
    {
      id: 'withdrawal_forms',
      name: { target: 'los formularios de retiro', native: 'withdrawal forms' },
      state: { filled: false },
      actions: ['TAKE', 'LOOK', 'USE'],
      takeable: true,
    },
    {
      id: 'pens',
      name: { target: 'los boligrafos', native: 'pens' },
      state: {},
      actions: ['TAKE', 'USE'],
      takeable: true,
    },
  ],
  exits: [
    { to: 'bank_entrance', name: { target: 'la entrada', native: 'entrance' } },
    { to: 'bank_teller_window', name: { target: 'la ventanilla', native: 'teller window' } },
    { to: 'bank_manager_office', name: { target: 'la oficina del gerente', native: 'manager office' } },
  ],
};

export const bankTellerWindow: Location = {
  id: 'bank_teller_window',
  name: { target: 'la ventanilla', native: 'teller window' },
  objects: [
    {
      id: 'teller_counter',
      name: { target: 'el mostrador', native: 'counter' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'receipt_printer',
      name: { target: 'la impresora de recibos', native: 'receipt printer' },
      state: { hasPaper: true },
      actions: ['LOOK'],
    },
    {
      id: 'cash_drawer',
      name: { target: 'la caja de dinero', native: 'cash drawer' },
      state: { open: false },
      actions: ['LOOK'],
    },
    {
      id: 'transaction_receipt',
      name: { target: 'el recibo', native: 'receipt' },
      state: { printed: false, transactionType: null, amount: 0 },
      actions: ['TAKE', 'LOOK'],
      takeable: true,
    },
    {
      id: 'id_scanner',
      name: { target: 'el escaner de identificacion', native: 'ID scanner' },
      state: {},
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'customer_screen',
      name: { target: 'la pantalla del cliente', native: 'customer screen' },
      state: { showing: 'balance', balance: 5750.00 },
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'bank_waiting_area', name: { target: 'la sala de espera', native: 'waiting area' } },
  ],
};

export const bankManagerOffice: Location = {
  id: 'bank_manager_office',
  name: { target: 'la oficina del gerente', native: 'manager office' },
  objects: [
    {
      id: 'manager_desk',
      name: { target: 'el escritorio', native: 'desk' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'visitor_chairs',
      name: { target: 'las sillas para visitantes', native: 'visitor chairs' },
      state: {},
      actions: [],
    },
    {
      id: 'account_documents',
      name: { target: 'los documentos de cuenta', native: 'account documents' },
      state: { signed: false },
      actions: ['LOOK', 'USE'],
    },
    {
      id: 'loan_application',
      name: { target: 'la solicitud de prestamo', native: 'loan application' },
      state: { filled: false, approved: false },
      actions: ['TAKE', 'LOOK', 'USE'],
      takeable: true,
    },
    {
      id: 'business_cards',
      name: { target: 'las tarjetas de presentacion', native: 'business cards' },
      state: {},
      actions: ['TAKE', 'LOOK'],
      takeable: true,
    },
    {
      id: 'office_plant',
      name: { target: 'la planta de oficina', native: 'office plant' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'bank_waiting_area', name: { target: 'la sala de espera', native: 'waiting area' } },
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
    name: { target: 'Roberto', native: 'Roberto' },
    location: 'bank_entrance',
    personality: 'Professional security guard named Roberto. Greets customers formally with "Buenos dias" or "Buenas tardes". Uses "usted" exclusively. Helpful but watchful. Will direct customers inside and explain they need to take a number. Key phrases: "Bienvenido al banco" (Welcome to the bank), "Pase adelante" (Go ahead), "Tome un numero, por favor" (Take a number, please).',
    gender: 'male',
  },
  {
    id: 'bank_teller',
    name: { target: 'Maria Elena', native: 'Maria Elena' },
    location: 'bank_teller_window',
    personality: 'Friendly and efficient bank teller named Maria Elena. Always uses formal "usted" and polite conditionals. Patient with customers. Explains transactions clearly. Key phrases: "En que le puedo ayudar?" (How may I help you?), "Me permite su identificacion?" (May I see your ID?), "Cuanto desea depositar/retirar?" (How much would you like to deposit/withdraw?), "Algo mas en lo que le pueda servir?" (Anything else I can help you with?), "Que tenga buen dia" (Have a nice day).',
    gender: 'female',
  },
  {
    id: 'bank_manager',
    name: { target: 'el senor Mendoza', native: 'Mr. Mendoza' },
    location: 'bank_manager_office',
    personality: 'Distinguished bank manager named Senor Mendoza. Very formal and professional. Uses elaborate courtesy phrases and conditional tense. Handles special accounts, loans, and complaints. Key phrases: "Tome asiento, por favor" (Please have a seat), "En que podria ayudarle hoy?" (How might I help you today?), "Permitame revisar su cuenta" (Allow me to review your account), "Tendria que llenar esta solicitud" (You would need to fill out this application).',
    gender: 'male',
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
    checkComplete: (state: GameState) => state.completedGoals.includes('bank_polite_farewell'),
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
  { target: 'el banco', native: 'bank', category: 'noun', gender: 'masculine' },
  { target: 'la entrada', native: 'entrance', category: 'noun', gender: 'feminine' },
  { target: 'la sala de espera', native: 'waiting area', category: 'noun', gender: 'feminine' },
  { target: 'la ventanilla', native: 'teller window', category: 'noun', gender: 'feminine' },
  { target: 'la oficina', native: 'office', category: 'noun', gender: 'feminine' },
  { target: 'el cajero automatico', native: 'ATM', category: 'noun', gender: 'masculine' },

  // ==================== BANK OBJECTS ====================
  { target: 'el dispensador de turnos', native: 'number dispenser', category: 'noun', gender: 'masculine' },
  { target: 'el turno', native: 'turn/number', category: 'noun', gender: 'masculine' },
  { target: 'el numero', native: 'number', category: 'noun', gender: 'masculine' },
  { target: 'el formulario', native: 'form', category: 'noun', gender: 'masculine' },
  { target: 'el formulario de deposito', native: 'deposit form', category: 'noun', gender: 'masculine' },
  { target: 'el formulario de retiro', native: 'withdrawal form', category: 'noun', gender: 'masculine' },
  { target: 'el recibo', native: 'receipt', category: 'noun', gender: 'masculine' },
  { target: 'el comprobante', native: 'receipt/proof', category: 'noun', gender: 'masculine' },
  { target: 'el boligrafo', native: 'pen', category: 'noun', gender: 'masculine' },
  { target: 'la identificacion', native: 'ID', category: 'noun', gender: 'feminine' },
  { target: 'el pasaporte', native: 'passport', category: 'noun', gender: 'masculine' },
  { target: 'la tarjeta de debito', native: 'debit card', category: 'noun', gender: 'feminine' },
  { target: 'la tarjeta de credito', native: 'credit card', category: 'noun', gender: 'feminine' },
  { target: 'el mostrador', native: 'counter', category: 'noun', gender: 'masculine' },
  { target: 'la pantalla', native: 'screen', category: 'noun', gender: 'feminine' },

  // ==================== PEOPLE ====================
  { target: 'el cajero', native: 'teller (male)', category: 'noun', gender: 'masculine' },
  { target: 'la cajera', native: 'teller (female)', category: 'noun', gender: 'feminine' },
  { target: 'el gerente', native: 'manager (male)', category: 'noun', gender: 'masculine' },
  { target: 'la gerente', native: 'manager (female)', category: 'noun', gender: 'feminine' },
  { target: 'el guardia', native: 'guard', category: 'noun', gender: 'masculine' },
  { target: 'el cliente', native: 'customer (male)', category: 'noun', gender: 'masculine' },
  { target: 'la cliente', native: 'customer (female)', category: 'noun', gender: 'feminine' },
  { target: 'el senor', native: 'sir/Mr.', category: 'noun', gender: 'masculine' },
  { target: 'la senora', native: 'madam/Mrs.', category: 'noun', gender: 'feminine' },
  { target: 'la senorita', native: 'miss', category: 'noun', gender: 'feminine' },

  // ==================== FINANCIAL TERMS ====================
  { target: 'la cuenta', native: 'account', category: 'noun', gender: 'feminine' },
  { target: 'la cuenta de ahorros', native: 'savings account', category: 'noun', gender: 'feminine' },
  { target: 'la cuenta corriente', native: 'checking account', category: 'noun', gender: 'feminine' },
  { target: 'el saldo', native: 'balance', category: 'noun', gender: 'masculine' },
  { target: 'el deposito', native: 'deposit', category: 'noun', gender: 'masculine' },
  { target: 'el retiro', native: 'withdrawal', category: 'noun', gender: 'masculine' },
  { target: 'la transferencia', native: 'transfer', category: 'noun', gender: 'feminine' },
  { target: 'el prestamo', native: 'loan', category: 'noun', gender: 'masculine' },
  { target: 'los intereses', native: 'interest', category: 'noun', gender: 'masculine' },
  { target: 'la comision', native: 'fee/commission', category: 'noun', gender: 'feminine' },
  { target: 'el efectivo', native: 'cash', category: 'noun', gender: 'masculine' },
  { target: 'el dinero', native: 'money', category: 'noun', gender: 'masculine' },
  { target: 'los billetes', native: 'bills (money)', category: 'noun', gender: 'masculine' },
  { target: 'las monedas', native: 'coins', category: 'noun', gender: 'feminine' },
  { target: 'el cheque', native: 'check', category: 'noun', gender: 'masculine' },
  { target: 'la firma', native: 'signature', category: 'noun', gender: 'feminine' },

  // ==================== LARGE NUMBERS (100-10000) ====================
  { target: 'cien', native: 'one hundred', category: 'other' },
  { target: 'ciento uno', native: 'one hundred one', category: 'other' },
  { target: 'ciento cincuenta', native: 'one hundred fifty', category: 'other' },
  { target: 'doscientos', native: 'two hundred', category: 'other' },
  { target: 'trescientos', native: 'three hundred', category: 'other' },
  { target: 'cuatrocientos', native: 'four hundred', category: 'other' },
  { target: 'quinientos', native: 'five hundred', category: 'other' },
  { target: 'seiscientos', native: 'six hundred', category: 'other' },
  { target: 'setecientos', native: 'seven hundred', category: 'other' },
  { target: 'ochocientos', native: 'eight hundred', category: 'other' },
  { target: 'novecientos', native: 'nine hundred', category: 'other' },
  { target: 'mil', native: 'one thousand', category: 'other' },
  { target: 'dos mil', native: 'two thousand', category: 'other' },
  { target: 'tres mil', native: 'three thousand', category: 'other' },
  { target: 'cinco mil', native: 'five thousand', category: 'other' },
  { target: 'diez mil', native: 'ten thousand', category: 'other' },
  { target: 'el peso', native: 'peso (currency)', category: 'noun', gender: 'masculine' },
  { target: 'los pesos', native: 'pesos', category: 'noun', gender: 'masculine' },

  // ==================== FORMAL USTED VERB FORMS ====================
  // Present tense - formal "usted" forms
  { target: 'tiene', native: 'you have (formal)', category: 'verb' },
  { target: 'necesita', native: 'you need (formal)', category: 'verb' },
  { target: 'desea', native: 'you wish/want (formal)', category: 'verb' },
  { target: 'puede', native: 'you can (formal)', category: 'verb' },
  { target: 'quiere', native: 'you want (formal)', category: 'verb' },
  { target: 'prefiere', native: 'you prefer (formal)', category: 'verb' },

  // First person banking verbs
  { target: 'deposito', native: 'I deposit', category: 'verb' },
  { target: 'retiro', native: 'I withdraw', category: 'verb' },
  { target: 'transfiero', native: 'I transfer', category: 'verb' },
  { target: 'consulto', native: 'I check/consult', category: 'verb' },
  { target: 'firmo', native: 'I sign', category: 'verb' },
  { target: 'lleno', native: 'I fill out', category: 'verb' },
  { target: 'espero', native: 'I wait', category: 'verb' },

  // ==================== POLITE CONDITIONALS ====================
  { target: 'quisiera', native: 'I would like', category: 'verb' },
  { target: 'querria', native: 'I would want', category: 'verb' },
  { target: 'podria', native: 'could you/I could', category: 'verb' },
  { target: 'me gustaria', native: 'I would like', category: 'verb' },
  { target: 'seria', native: 'it would be', category: 'verb' },
  { target: 'tendria', native: 'I/you would have', category: 'verb' },
  { target: 'deberia', native: 'I/you should', category: 'verb' },

  // Polite request structures
  { target: 'podria...?', native: 'could you...?', category: 'verb' },
  { target: 'me podria...?', native: 'could you... for me?', category: 'verb' },
  { target: 'seria posible...?', native: 'would it be possible...?', category: 'verb' },
  { target: 'tendria la bondad de...?', native: 'would you be so kind as to...?', category: 'verb' },

  // ==================== FORMAL PHRASES & EXPRESSIONS ====================
  // Greetings (formal)
  { target: 'buenos dias', native: 'good morning', category: 'other' },
  { target: 'buenas tardes', native: 'good afternoon', category: 'other' },
  { target: 'buenas noches', native: 'good evening', category: 'other' },
  { target: 'bienvenido', native: 'welcome (to male)', category: 'other' },
  { target: 'bienvenida', native: 'welcome (to female)', category: 'other' },

  // Polite expressions
  { target: 'por favor', native: 'please', category: 'other' },
  { target: 'gracias', native: 'thank you', category: 'other' },
  { target: 'muchas gracias', native: 'thank you very much', category: 'other' },
  { target: 'muy amable', native: 'very kind (of you)', category: 'other' },
  { target: 'de nada', native: "you're welcome", category: 'other' },
  { target: 'con mucho gusto', native: 'with pleasure', category: 'other' },
  { target: 'a sus ordenes', native: 'at your service', category: 'other' },
  { target: 'disculpe', native: 'excuse me (formal)', category: 'other' },
  { target: 'perdone', native: 'pardon me (formal)', category: 'other' },
  { target: 'con permiso', native: 'excuse me (passing by)', category: 'other' },

  // Farewells (formal)
  { target: 'hasta luego', native: 'see you later', category: 'other' },
  { target: 'que tenga buen dia', native: 'have a good day', category: 'other' },
  { target: 'que le vaya bien', native: 'may it go well for you', category: 'other' },
  { target: 'ha sido un placer', native: 'it has been a pleasure', category: 'other' },

  // ==================== BANKING PHRASES ====================
  // Common requests
  { target: 'en que le puedo ayudar?', native: 'how may I help you?', category: 'other' },
  { target: 'quisiera consultar mi saldo', native: 'I would like to check my balance', category: 'other' },
  { target: 'quisiera hacer un deposito', native: 'I would like to make a deposit', category: 'other' },
  { target: 'quisiera hacer un retiro', native: 'I would like to make a withdrawal', category: 'other' },
  { target: 'quisiera abrir una cuenta', native: 'I would like to open an account', category: 'other' },
  { target: 'cuanto desea depositar?', native: 'how much would you like to deposit?', category: 'other' },
  { target: 'cuanto desea retirar?', native: 'how much would you like to withdraw?', category: 'other' },
  { target: 'me permite su identificacion?', native: 'may I see your ID?', category: 'other' },
  { target: 'aqui tiene', native: 'here you go', category: 'other' },
  { target: 'firme aqui, por favor', native: 'sign here, please', category: 'other' },
  { target: 'algo mas?', native: 'anything else?', category: 'other' },
  { target: 'algo mas en lo que le pueda servir?', native: 'anything else I can help you with?', category: 'other' },
  { target: 'tome asiento, por favor', native: 'please have a seat', category: 'other' },
  { target: 'pase adelante', native: 'go ahead/come forward', category: 'other' },
  { target: 'un momento, por favor', native: 'one moment, please', category: 'other' },

  // Queue/waiting
  { target: 'tome un numero', native: 'take a number', category: 'other' },
  { target: 'es mi turno', native: "it's my turn", category: 'other' },
  { target: 'quien sigue?', native: "who's next?", category: 'other' },
  { target: 'el siguiente', native: 'the next one', category: 'other' },

  // ==================== ADJECTIVES ====================
  { target: 'disponible', native: 'available', category: 'adjective' },
  { target: 'correcto', native: 'correct', category: 'adjective' },
  { target: 'seguro', native: 'safe/secure', category: 'adjective' },
  { target: 'urgente', native: 'urgent', category: 'adjective' },
  { target: 'suficiente', native: 'sufficient', category: 'adjective' },
  { target: 'mensual', native: 'monthly', category: 'adjective' },
  { target: 'anual', native: 'annual', category: 'adjective' },
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

export const bankModule: ModuleDefinition = {
  name: 'bank',
  displayName: 'Bank',
  locations: bankLocations,
  npcs: bankNPCs,
  goals: bankGoals,
  vocabulary: bankVocabulary,
  startLocationId: 'bank_entrance',
  startGoalId: 'bank_enter_greet',
  locationIds: Object.keys(bankLocations),
  unlockLevel: 7,
  promptInstructions,
};
