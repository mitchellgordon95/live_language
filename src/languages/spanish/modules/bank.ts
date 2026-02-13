import type { Location, Goal, VocabWord, GameState, NPC, WorldObject, ModuleDefinition } from '../../../engine/types.js';

// ============================================================================
// LOCATIONS (exits only — objects are in the flat list below)
// ============================================================================

const locations: Record<string, Location> = {
  bank_entrance: {
    id: 'bank_entrance',
    name: { target: 'la entrada del banco', native: 'bank entrance' },
    exits: [
      { to: 'bank_waiting_area', name: { target: 'la sala de espera', native: 'waiting area' } },
      { to: 'street', name: { target: 'la calle', native: 'street' } },
    ],
  },
  bank_waiting_area: {
    id: 'bank_waiting_area',
    name: { target: 'la sala de espera', native: 'waiting area' },
    exits: [
      { to: 'bank_entrance', name: { target: 'la entrada', native: 'entrance' } },
      { to: 'bank_teller_window', name: { target: 'la ventanilla', native: 'teller window' } },
      { to: 'bank_manager_office', name: { target: 'la oficina del gerente', native: 'manager office' } },
    ],
  },
  bank_teller_window: {
    id: 'bank_teller_window',
    name: { target: 'la ventanilla', native: 'teller window' },
    exits: [
      { to: 'bank_waiting_area', name: { target: 'la sala de espera', native: 'waiting area' } },
    ],
  },
  bank_manager_office: {
    id: 'bank_manager_office',
    name: { target: 'la oficina del gerente', native: 'manager office' },
    exits: [
      { to: 'bank_waiting_area', name: { target: 'la sala de espera', native: 'waiting area' } },
    ],
  },
};

// ============================================================================
// OBJECTS (flat list — each knows its own location)
// ============================================================================

const objects: WorldObject[] = [
  // Bank entrance
  { id: 'bank_door', name: { target: 'la puerta del banco', native: 'bank door' }, location: 'bank_entrance', tags: ['open'] },
  { id: 'bank_hours_sign', name: { target: 'el horario', native: 'hours sign' }, location: 'bank_entrance', tags: [] },
  { id: 'atm_machine', name: { target: 'el cajero automatico', native: 'ATM machine' }, location: 'bank_entrance', tags: ['working'] },
  { id: 'security_camera', name: { target: 'la camara de seguridad', native: 'security camera' }, location: 'bank_entrance', tags: ['on'] },

  // Waiting area
  { id: 'number_dispenser', name: { target: 'el dispensador de turnos', native: 'number dispenser' }, location: 'bank_waiting_area', tags: [] },
  { id: 'waiting_chairs', name: { target: 'las sillas de espera', native: 'waiting chairs' }, location: 'bank_waiting_area', tags: [] },
  { id: 'queue_display', name: { target: 'la pantalla de turnos', native: 'queue display' }, location: 'bank_waiting_area', tags: [] },
  { id: 'bank_brochures', name: { target: 'los folletos', native: 'brochures' }, location: 'bank_waiting_area', tags: ['takeable'] },
  { id: 'water_cooler', name: { target: 'el dispensador de agua', native: 'water cooler' }, location: 'bank_waiting_area', tags: [] },
  { id: 'deposit_forms', name: { target: 'los formularios de deposito', native: 'deposit forms' }, location: 'bank_waiting_area', tags: ['takeable'] },
  { id: 'withdrawal_forms', name: { target: 'los formularios de retiro', native: 'withdrawal forms' }, location: 'bank_waiting_area', tags: ['takeable'] },
  { id: 'pens', name: { target: 'los boligrafos', native: 'pens' }, location: 'bank_waiting_area', tags: ['takeable'] },

  // Teller window
  { id: 'teller_counter', name: { target: 'el mostrador', native: 'counter' }, location: 'bank_teller_window', tags: [] },
  { id: 'receipt_printer', name: { target: 'la impresora de recibos', native: 'receipt printer' }, location: 'bank_teller_window', tags: [] },
  { id: 'cash_drawer', name: { target: 'la caja de dinero', native: 'cash drawer' }, location: 'bank_teller_window', tags: ['closed'] },
  { id: 'transaction_receipt', name: { target: 'el recibo', native: 'receipt' }, location: 'bank_teller_window', tags: ['takeable'] },
  { id: 'id_scanner', name: { target: 'el escaner de identificacion', native: 'ID scanner' }, location: 'bank_teller_window', tags: [] },
  { id: 'customer_screen', name: { target: 'la pantalla del cliente', native: 'customer screen' }, location: 'bank_teller_window', tags: [] },

  // Manager office
  { id: 'manager_desk', name: { target: 'el escritorio', native: 'desk' }, location: 'bank_manager_office', tags: [] },
  { id: 'visitor_chairs', name: { target: 'las sillas para visitantes', native: 'visitor chairs' }, location: 'bank_manager_office', tags: [] },
  { id: 'account_documents', name: { target: 'los documentos de cuenta', native: 'account documents' }, location: 'bank_manager_office', tags: [] },
  { id: 'loan_application', name: { target: 'la solicitud de prestamo', native: 'loan application' }, location: 'bank_manager_office', tags: ['takeable'] },
  { id: 'business_cards', name: { target: 'las tarjetas de presentacion', native: 'business cards' }, location: 'bank_manager_office', tags: ['takeable'] },
  { id: 'office_plant', name: { target: 'la planta de oficina', native: 'office plant' }, location: 'bank_manager_office', tags: [] },
];

// ============================================================================
// NPCs
// ============================================================================

const npcs: NPC[] = [
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

// ============================================================================
// GOALS (checkComplete uses new state model)
// ============================================================================

const goals: Goal[] = [
  {
    id: 'bank_enter_greet',
    title: 'Enter the bank and greet the guard',
    description: 'You need to visit the bank today. Enter and greet the security guard politely.',
    hint: 'Try "Buenos dias" or "Buenas tardes, senor" to greet formally',
    checkComplete: (state: GameState) => {
      return state.currentLocation === 'bank_entrance' &&
             state.completedGoals.includes('bank_enter_greet');
    },
    nextGoalId: 'bank_take_number',
  },
  {
    id: 'bank_take_number',
    title: 'Take a number and wait',
    description: 'Go to the waiting area and take a number from the dispenser. Banks in Spanish-speaking countries use a queue system.',
    hint: 'Go to the waiting area with "Voy a la sala de espera" then "Tomo un numero" or "Uso el dispensador"',
    checkComplete: (state: GameState) => {
      return state.completedGoals.includes('bank_take_number') ||
             state.objects.some(o => o.id === 'queue_ticket' && o.location === 'inventory');
    },
    nextGoalId: 'bank_approach_teller',
  },
  {
    id: 'bank_approach_teller',
    title: 'Approach the teller window',
    description: 'Your number has been called! Go to the teller window and greet Maria Elena formally.',
    hint: 'Try "Voy a la ventanilla" then greet with "Buenos dias, quisiera hacer una consulta"',
    checkComplete: (state: GameState) => {
      return state.currentLocation === 'bank_teller_window' &&
             state.completedGoals.includes('bank_approach_teller');
    },
    nextGoalId: 'bank_check_balance',
  },
  {
    id: 'bank_check_balance',
    title: 'Check your account balance',
    description: 'Ask the teller to check your account balance. Use polite conditional forms!',
    hint: 'Try "Quisiera consultar mi saldo, por favor" or "Podria decirme cuanto tengo en mi cuenta?"',
    checkComplete: (state: GameState) => {
      return state.completedGoals.includes('bank_check_balance');
    },
    nextGoalId: 'bank_make_deposit',
  },
  {
    id: 'bank_make_deposit',
    title: 'Make a deposit',
    description: 'You want to deposit 500 pesos into your account. Tell the teller how much you want to deposit.',
    hint: 'Try "Quisiera depositar quinientos pesos" or "Me gustaria hacer un deposito de quinientos pesos"',
    checkComplete: (state: GameState) => {
      return state.completedGoals.includes('bank_make_deposit');
    },
    nextGoalId: 'bank_withdraw_cash',
  },
  {
    id: 'bank_withdraw_cash',
    title: 'Withdraw cash',
    description: 'Now withdraw 200 pesos for the week. Practice saying larger numbers!',
    hint: 'Try "Quisiera retirar doscientos pesos" or "Podria sacar doscientos pesos, por favor?"',
    checkComplete: (state: GameState) => {
      return state.completedGoals.includes('bank_withdraw_cash');
    },
    nextGoalId: 'bank_get_receipt',
  },
  {
    id: 'bank_get_receipt',
    title: 'Request a receipt',
    description: 'Ask for a receipt of your transactions. This is important documentation!',
    hint: 'Try "Me puede dar un recibo, por favor?" or "Quisiera un comprobante"',
    checkComplete: (state: GameState) => {
      const receipt = state.objects.find(o => o.id === 'transaction_receipt');
      return (receipt !== undefined && receipt.tags.includes('printed')) ||
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
      return state.completedGoals.includes('bank_polite_farewell');
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

// ============================================================================
// VOCABULARY
// ============================================================================

const vocabulary: VocabWord[] = [
  // Locations
  { target: 'el banco', native: 'bank', category: 'noun', gender: 'masculine' },
  { target: 'la entrada', native: 'entrance', category: 'noun', gender: 'feminine' },
  { target: 'la sala de espera', native: 'waiting area', category: 'noun', gender: 'feminine' },
  { target: 'la ventanilla', native: 'teller window', category: 'noun', gender: 'feminine' },
  { target: 'la oficina', native: 'office', category: 'noun', gender: 'feminine' },
  { target: 'el cajero automatico', native: 'ATM', category: 'noun', gender: 'masculine' },

  // Bank objects
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

  // People
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

  // Financial terms
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

  // Large numbers (100-10000)
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

  // Formal usted verb forms
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

  // Polite conditionals
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

  // Formal greetings
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

  // Formal farewells
  { target: 'hasta luego', native: 'see you later', category: 'other' },
  { target: 'que tenga buen dia', native: 'have a good day', category: 'other' },
  { target: 'que le vaya bien', native: 'may it go well for you', category: 'other' },
  { target: 'ha sido un placer', native: 'it has been a pleasure', category: 'other' },

  // Banking phrases
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

  // Adjectives
  { target: 'disponible', native: 'available', category: 'adjective' },
  { target: 'correcto', native: 'correct', category: 'adjective' },
  { target: 'seguro', native: 'safe/secure', category: 'adjective' },
  { target: 'urgente', native: 'urgent', category: 'adjective' },
  { target: 'suficiente', native: 'sufficient', category: 'adjective' },
  { target: 'mensual', native: 'monthly', category: 'adjective' },
  { target: 'anual', native: 'annual', category: 'adjective' },
];

// ============================================================================
// MODULE EXPORT
// ============================================================================

export const bankModule: ModuleDefinition = {
  name: 'bank',
  displayName: 'Bank',
  locations,
  objects,
  npcs,
  goals,
  vocabulary,
  startLocationId: 'bank_entrance',
  startGoalId: 'bank_enter_greet',
  locationIds: Object.keys(locations),
  unlockLevel: 7,

  guidance: `BANK ENVIRONMENT:
A formal Mexican bank with entrance, waiting area, teller window, and manager office.
The player is learning formal Spanish (usted), polite conditionals, and large numbers.

QUEUE SYSTEM:
The bank uses a turno (queue number) system. The number_dispenser gives tickets.
The queue_display shows the currently-served number. When the player takes a number
(use number_dispenser), create a queue_ticket object in inventory. The display currently
serves turno 41; the player's ticket is turno 42. After taking a number, the player
can proceed to the teller window (their number is called shortly).

ACCOUNT DATA:
The player's account has a balance of 5,750.00 pesos. When checking balance, the
customer_screen shows this. After depositing 500 pesos, the balance becomes 6,250.00.
After withdrawing 200 pesos, the balance becomes 6,050.00.

OBJECTS:
- bank_door: Entrance door. Starts open. Can be opened/closed via tag changes.
- atm_machine: ATM at entrance. Has "working" tag. Player can look at it.
- number_dispenser: In waiting area. Using it creates a queue_ticket in inventory.
- queue_display: Shows currently serving turno 41. Look at it to see the number.
- deposit_forms, withdrawal_forms: Takeable forms in waiting area. Can be filled out (add "filled" tag).
- pens: Takeable, used for filling forms.
- bank_brochures: Takeable informational brochures.
- teller_counter: The counter at the teller window.
- cash_drawer: Behind the counter. Starts closed. Teller opens it during transactions.
- transaction_receipt: Takeable receipt. Add "printed" tag when teller prints it.
- customer_screen: Shows balance and transaction info. No tags needed, data is in narration.
- id_scanner: Teller uses to verify ID during transactions.
- account_documents: In manager office. Can be signed (add "signed" tag).
- loan_application: Takeable. Can be filled out (add "filled" tag) and approved (add "approved" tag).
- business_cards: Manager's cards, takeable.

TRANSACTION FLOW:
1. Player greets teller formally
2. Teller asks "En que le puedo ayudar?"
3. Player states what they want (check balance, deposit, withdraw)
4. Teller may ask for ID: "Me permite su identificacion?"
5. Teller processes the transaction
6. Teller asks "Algo mas en lo que le pueda servir?"
7. Player requests receipt or says goodbye

NPCs:
- Roberto (bank_guard): At bank_entrance. Professional security guard. Uses "usted" exclusively.
  Greets with "Bienvenido al banco", directs customers with "Pase adelante", reminds to take a
  number with "Tome un numero, por favor". Watchful but helpful.
- Maria Elena (bank_teller): At bank_teller_window. Friendly and efficient. Always formal.
  Uses polite conditionals. Key phrases: "En que le puedo ayudar?", "Me permite su identificacion?",
  "Cuanto desea depositar/retirar?", "Algo mas en lo que le pueda servir?", "Que tenga buen dia".
  Processes all transactions: balance checks, deposits, withdrawals, receipts.
- Senor Mendoza (bank_manager): At bank_manager_office. Distinguished, very formal. Uses
  elaborate courtesy phrases and conditional tense. Handles loans, special accounts, complaints.
  Says "Tome asiento, por favor", "En que podria ayudarle hoy?", "Permitame revisar su cuenta",
  "Tendria que llenar esta solicitud".

FORMAL LANGUAGE RULES:
All NPCs use "usted" (never "tu"). Encourage the player to use:
- "Quisiera..." (I would like...) for polite requests
- "Podria...?" (Could you...?) for polite questions
- "Me gustaria..." (I would like...) as an alternative
- "Por favor" and "Gracias" frequently
- Formal greetings: "Buenos dias", "Buenas tardes"
- Formal farewells: "Que tenga buen dia", "Hasta luego"

GOAL COMPLETION:
- bank_enter_greet: Player greets the guard at the entrance (talk to bank_guard with a greeting)
- bank_take_number: Player uses the number_dispenser or takes a number
- bank_approach_teller: Player goes to teller window and greets Maria Elena
- bank_check_balance: Player asks teller about their balance
- bank_make_deposit: Player tells teller to deposit 500 pesos
- bank_withdraw_cash: Player tells teller to withdraw 200 pesos
- bank_get_receipt: Player asks for a receipt (add "printed" tag to transaction_receipt)
- bank_polite_farewell: Player thanks teller and says goodbye

TEACHING FOCUS:
- "Quisiera..." (I would like...) -- very polite conditional form
- "Podria...?" (Could you...?) -- polite requests
- Large numbers: "cien" (100), "doscientos" (200), "quinientos" (500), "mil" (1000)
- Banking terms: "el saldo" (balance), "el deposito" (deposit), "el retiro" (withdrawal), "el recibo" (receipt)
- Formal "usted" forms: "tiene", "desea", "puede"`,
};
