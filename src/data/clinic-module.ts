import type { Location, Goal, VocabWord, GameState, NPC, ModuleDefinition } from '../engine/types.js';

// ============================================================================
// CLINIC LOCATIONS
// ============================================================================

export const clinicReception: Location = {
  id: 'clinic_reception',
  name: { spanish: 'la recepcion de la clinica', english: 'clinic reception' },
  objects: [
    {
      id: 'reception_desk',
      name: { spanish: 'el escritorio de recepcion', english: 'reception desk' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'registration_form',
      name: { spanish: 'el formulario de registro', english: 'registration form' },
      state: { filled: false },
      actions: ['TAKE', 'USE', 'LOOK'],
      takeable: true,
    },
    {
      id: 'health_insurance_card',
      name: { spanish: 'la tarjeta de seguro medico', english: 'health insurance card' },
      state: {},
      actions: ['TAKE', 'USE'],
      takeable: true,
    },
    {
      id: 'pen',
      name: { spanish: 'el boligrafo', english: 'pen' },
      state: {},
      actions: ['TAKE', 'USE'],
      takeable: true,
    },
    {
      id: 'clinic_brochure',
      name: { spanish: 'el folleto de la clinica', english: 'clinic brochure' },
      state: {},
      actions: ['TAKE', 'LOOK'],
      takeable: true,
    },
    {
      id: 'appointment_sign',
      name: { spanish: 'el letrero de citas', english: 'appointment sign' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'waiting_room', name: { spanish: 'la sala de espera', english: 'waiting room' } },
    { to: 'pharmacy', name: { spanish: 'la farmacia', english: 'pharmacy' } },
    { to: 'street', name: { spanish: 'la calle', english: 'street' } },
  ],
};

export const waitingRoom: Location = {
  id: 'waiting_room',
  name: { spanish: 'la sala de espera', english: 'waiting room' },
  objects: [
    {
      id: 'waiting_chair',
      name: { spanish: 'la silla de espera', english: 'waiting chair' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'magazines',
      name: { spanish: 'las revistas', english: 'magazines' },
      state: {},
      actions: ['TAKE', 'LOOK'],
      takeable: true,
    },
    {
      id: 'water_cooler',
      name: { spanish: 'el dispensador de agua', english: 'water cooler' },
      state: {},
      actions: ['USE'],
      consumable: true,
      needsEffect: { hunger: 5 },
    },
    {
      id: 'tv_screen',
      name: { spanish: 'la pantalla de television', english: 'TV screen' },
      state: { on: true },
      actions: ['LOOK'],
    },
    {
      id: 'number_display',
      name: { spanish: 'la pantalla de turnos', english: 'number display' },
      state: { currentNumber: 15, yourNumber: 18 },
      actions: ['LOOK'],
    },
    {
      id: 'health_poster',
      name: { spanish: 'el cartel de salud', english: 'health poster' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'clinic_reception', name: { spanish: 'la recepcion', english: 'reception' } },
    { to: 'exam_room', name: { spanish: 'el consultorio', english: 'exam room' } },
  ],
};

export const examRoom: Location = {
  id: 'exam_room',
  name: { spanish: 'el consultorio', english: 'exam room' },
  objects: [
    {
      id: 'exam_table',
      name: { spanish: 'la camilla', english: 'exam table' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'blood_pressure_monitor',
      name: { spanish: 'el tensiometro', english: 'blood pressure monitor' },
      state: { lastReading: null },
      actions: ['LOOK'],
    },
    {
      id: 'stethoscope',
      name: { spanish: 'el estetoscopio', english: 'stethoscope' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'scale',
      name: { spanish: 'la bascula', english: 'scale' },
      state: {},
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'thermometer',
      name: { spanish: 'el termometro', english: 'thermometer' },
      state: { lastReading: null },
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'tongue_depressor',
      name: { spanish: 'el depresor de lengua', english: 'tongue depressor' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'medical_chart',
      name: { spanish: 'el expediente medico', english: 'medical chart' },
      state: { symptomsRecorded: false },
      actions: ['LOOK'],
    },
    {
      id: 'prescription_pad',
      name: { spanish: 'el recetario', english: 'prescription pad' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'prescription',
      name: { spanish: 'la receta medica', english: 'prescription' },
      state: { written: false, received: false },
      actions: ['TAKE', 'LOOK'],
      takeable: true,
    },
    {
      id: 'anatomy_poster',
      name: { spanish: 'el cartel de anatomia', english: 'anatomy poster' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'waiting_room', name: { spanish: 'la sala de espera', english: 'waiting room' } },
  ],
};

export const pharmacy: Location = {
  id: 'pharmacy',
  name: { spanish: 'la farmacia', english: 'pharmacy' },
  objects: [
    {
      id: 'pharmacy_counter',
      name: { spanish: 'el mostrador de la farmacia', english: 'pharmacy counter' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'medicine_shelf',
      name: { spanish: 'el estante de medicinas', english: 'medicine shelf' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'pain_reliever',
      name: { spanish: 'el analgesico', english: 'pain reliever' },
      state: { purchased: false },
      actions: ['TAKE', 'LOOK'],
      takeable: true,
      consumable: true,
      needsEffect: { energy: 10 },
    },
    {
      id: 'antibiotic',
      name: { spanish: 'el antibiotico', english: 'antibiotic' },
      state: { purchased: false, requiresPrescription: true },
      actions: ['TAKE', 'LOOK'],
      takeable: true,
      consumable: true,
    },
    {
      id: 'cough_syrup',
      name: { spanish: 'el jarabe para la tos', english: 'cough syrup' },
      state: { purchased: false },
      actions: ['TAKE', 'LOOK'],
      takeable: true,
      consumable: true,
    },
    {
      id: 'bandages',
      name: { spanish: 'las vendas', english: 'bandages' },
      state: {},
      actions: ['TAKE', 'LOOK'],
      takeable: true,
    },
    {
      id: 'vitamins',
      name: { spanish: 'las vitaminas', english: 'vitamins' },
      state: {},
      actions: ['TAKE', 'LOOK'],
      takeable: true,
      consumable: true,
      needsEffect: { energy: 5 },
    },
    {
      id: 'pharmacy_receipt',
      name: { spanish: 'el recibo de la farmacia', english: 'pharmacy receipt' },
      state: { printed: false },
      actions: ['TAKE', 'LOOK'],
      takeable: true,
    },
  ],
  exits: [
    { to: 'clinic_reception', name: { spanish: 'la recepcion de la clinica', english: 'clinic reception' } },
    { to: 'street', name: { spanish: 'la calle', english: 'street' } },
  ],
};

export const clinicLocations: Record<string, Location> = {
  clinic_reception: clinicReception,
  waiting_room: waitingRoom,
  exam_room: examRoom,
  pharmacy: pharmacy,
};

// ============================================================================
// CLINIC NPCs
// ============================================================================

export const clinicNPCs: NPC[] = [
  {
    id: 'receptionist',
    name: { spanish: 'Maria', english: 'Maria' },
    location: 'clinic_reception',
    personality: 'Professional and helpful receptionist named Maria. Speaks formally with "usted". Will ask for your name, insurance card, and reason for visit. Key phrases: "Tiene cita?" (Do you have an appointment?), "Cual es su nombre?" (What is your name?), "Por favor, llene este formulario" (Please fill out this form), "Tome asiento en la sala de espera" (Have a seat in the waiting room).',
  },
  {
    id: 'doctor',
    name: { spanish: 'Doctor Garcia', english: 'Dr. Garcia' },
    location: 'exam_room',
    personality: 'Kind and thorough doctor named Dr. Garcia. Uses formal "usted". Asks about symptoms using "Que le pasa?" and "Donde le duele?". Gives commands: "Abra la boca", "Respire profundo", "Suba la manga". Explains diagnosis clearly and writes prescriptions. Reassuring but professional.',
  },
  {
    id: 'pharmacist',
    name: { spanish: 'Roberto', english: 'Roberto' },
    location: 'pharmacy',
    personality: 'Friendly pharmacist named Roberto. Explains how to take medicine: "Tome una pastilla cada ocho horas" (Take one pill every eight hours), "Con comida" (With food), "Antes de acostarse" (Before bed). Will ask "Tiene la receta?" (Do you have the prescription?). Helpful with over-the-counter recommendations.',
  },
];

// Extended NPC state for clinic interactions
export interface ClinicNPCState {
  mood: string;
  lastResponse?: string;
  // Receptionist-specific
  hasCheckedIn?: boolean;
  hasReceivedForm?: boolean;
  hasGivenNumber?: boolean;
  // Doctor-specific
  hasExaminedPatient?: boolean;
  symptomsDescribed?: string[];
  diagnosisMade?: boolean;
  prescriptionWritten?: boolean;
  commandsGiven?: string[];
  // Pharmacist-specific
  hasReceivedPrescription?: boolean;
  medicineDispensed?: boolean;
  instructionsGiven?: boolean;
}

export function getClinicNPCsInLocation(locationId: string): NPC[] {
  return clinicNPCs.filter(npc => npc.location === locationId);
}

// ============================================================================
// CLINIC GOALS
// ============================================================================

export const clinicGoals: Goal[] = [
  {
    id: 'clinic_arrive',
    title: 'Arrive at the clinic',
    description: 'You are not feeling well. Go to the clinic to see a doctor.',
    hint: 'Try "Voy a la clinica" (I go to the clinic)',
    checkComplete: (state: GameState) => state.location.id === 'clinic_reception',
    nextGoalId: 'clinic_check_in',
  },
  {
    id: 'clinic_check_in',
    title: 'Check in at reception',
    description: 'Talk to the receptionist Maria and check in for your appointment. Give her your information.',
    hint: 'Try "Buenos dias" to greet, then "Tengo cita con el doctor" (I have an appointment with the doctor) or "Necesito ver a un medico" (I need to see a doctor)',
    checkComplete: (state: GameState) => {
      return state.completedGoals.includes('checked_in') ||
             state.completedGoals.includes('clinic_check_in');
    },
    nextGoalId: 'clinic_fill_form',
  },
  {
    id: 'clinic_fill_form',
    title: 'Fill out the registration form',
    description: 'Maria gave you a form. Fill it out with your information.',
    hint: 'Try "Lleno el formulario" (I fill out the form) or "Completo el formulario"',
    checkComplete: (state: GameState) => {
      const form = state.location.objects.find(o => o.id === 'registration_form');
      return form?.state.filled === true ||
             state.completedGoals.includes('filled_form');
    },
    nextGoalId: 'clinic_wait',
  },
  {
    id: 'clinic_wait',
    title: 'Wait in the waiting room',
    description: 'Go to the waiting room and wait for your turn. Check the number display.',
    hint: 'Try "Voy a la sala de espera" (I go to the waiting room) and "Me siento" (I sit down)',
    checkComplete: (state: GameState) => {
      return state.location.id === 'waiting_room' ||
             state.completedGoals.includes('waited');
    },
    nextGoalId: 'clinic_enter_exam',
  },
  {
    id: 'clinic_enter_exam',
    title: 'Enter the exam room',
    description: 'Your number is called! Go to the exam room to see Dr. Garcia.',
    hint: 'Try "Voy al consultorio" (I go to the exam room) or "Entro al consultorio"',
    checkComplete: (state: GameState) => state.location.id === 'exam_room',
    nextGoalId: 'clinic_describe_symptoms',
  },
  {
    id: 'clinic_describe_symptoms',
    title: 'Describe your symptoms to the doctor',
    description: 'Tell Dr. Garcia what hurts. Use "me duele" (it hurts me) or "tengo" expressions.',
    hint: 'Try "Me duele la cabeza" (My head hurts), "Tengo fiebre" (I have a fever), or "Me duele el estomago" (My stomach hurts)',
    checkComplete: (state: GameState) => {
      return state.completedGoals.includes('described_symptoms') ||
             state.completedGoals.includes('clinic_describe_symptoms');
    },
    nextGoalId: 'clinic_follow_commands',
  },
  {
    id: 'clinic_follow_commands',
    title: 'Follow the doctor\'s commands',
    description: 'Dr. Garcia needs to examine you. Follow his instructions carefully.',
    hint: 'The doctor may say "Abra la boca" (Open your mouth), "Respire profundo" (Breathe deeply), "Saque la lengua" (Stick out your tongue). Respond with "Si, doctor" or perform the action.',
    checkComplete: (state: GameState) => {
      return state.completedGoals.includes('followed_commands') ||
             state.completedGoals.includes('clinic_follow_commands');
    },
    nextGoalId: 'clinic_get_prescription',
  },
  {
    id: 'clinic_get_prescription',
    title: 'Get your prescription',
    description: 'The doctor has diagnosed you. Take the prescription he writes for you.',
    hint: 'Try "Tomo la receta" (I take the prescription) or wait for the doctor to give it to you',
    checkComplete: (state: GameState) => {
      const prescription = state.location.objects.find(o => o.id === 'prescription');
      return prescription?.state.received === true ||
             state.inventory.some(item => item.id === 'prescription') ||
             state.completedGoals.includes('got_prescription');
    },
    nextGoalId: 'clinic_go_pharmacy',
  },
  {
    id: 'clinic_go_pharmacy',
    title: 'Go to the pharmacy',
    description: 'Take your prescription to the pharmacy to get your medicine.',
    hint: 'Try "Voy a la farmacia" (I go to the pharmacy)',
    checkComplete: (state: GameState) => state.location.id === 'pharmacy',
    nextGoalId: 'clinic_get_medicine',
  },
  {
    id: 'clinic_get_medicine',
    title: 'Get your medicine',
    description: 'Give your prescription to Roberto the pharmacist and get your medicine. Ask about how to take it.',
    hint: 'Try "Aqui esta mi receta" (Here is my prescription) or "Necesito esta medicina" (I need this medicine). Ask "Como lo tomo?" (How do I take it?)',
    checkComplete: (state: GameState) => {
      return state.completedGoals.includes('got_medicine') ||
             state.completedGoals.includes('clinic_get_medicine') ||
             state.inventory.some(item =>
               item.id === 'pain_reliever' ||
               item.id === 'antibiotic' ||
               item.id === 'cough_syrup'
             );
    },
    nextGoalId: 'clinic_complete',
  },
  {
    id: 'clinic_complete',
    title: 'Clinic visit complete!',
    description: 'Felicidades! You successfully visited the doctor and got your medicine. You learned how to describe symptoms with "me duele" and "tengo", and how to follow medical commands.',
    checkComplete: () => false, // Final goal
  },
];

export function getClinicGoalById(id: string): Goal | undefined {
  return clinicGoals.find(g => g.id === id);
}

export function getClinicStartGoal(): Goal {
  return clinicGoals[0];
}

// ============================================================================
// SYMPTOM DATA
// ============================================================================

export interface Symptom {
  id: string;
  name: { spanish: string; english: string };
  expression: string; // How to say it: "me duele..." or "tengo..."
  bodyPart?: string; // Related body part if applicable
}

export const symptoms: Symptom[] = [
  // "Me duele" expressions (body part pain)
  { id: 'headache', name: { spanish: 'dolor de cabeza', english: 'headache' }, expression: 'Me duele la cabeza', bodyPart: 'head' },
  { id: 'stomachache', name: { spanish: 'dolor de estomago', english: 'stomachache' }, expression: 'Me duele el estomago', bodyPart: 'stomach' },
  { id: 'backache', name: { spanish: 'dolor de espalda', english: 'backache' }, expression: 'Me duele la espalda', bodyPart: 'back' },
  { id: 'sore_throat', name: { spanish: 'dolor de garganta', english: 'sore throat' }, expression: 'Me duele la garganta', bodyPart: 'throat' },
  { id: 'earache', name: { spanish: 'dolor de oido', english: 'earache' }, expression: 'Me duele el oido', bodyPart: 'ear' },
  { id: 'toothache', name: { spanish: 'dolor de muelas', english: 'toothache' }, expression: 'Me duele la muela', bodyPart: 'tooth' },
  { id: 'chest_pain', name: { spanish: 'dolor de pecho', english: 'chest pain' }, expression: 'Me duele el pecho', bodyPart: 'chest' },
  { id: 'arm_pain', name: { spanish: 'dolor de brazo', english: 'arm pain' }, expression: 'Me duele el brazo', bodyPart: 'arm' },
  { id: 'leg_pain', name: { spanish: 'dolor de pierna', english: 'leg pain' }, expression: 'Me duele la pierna', bodyPart: 'leg' },

  // "Tengo" expressions (conditions)
  { id: 'fever', name: { spanish: 'fiebre', english: 'fever' }, expression: 'Tengo fiebre' },
  { id: 'cough', name: { spanish: 'tos', english: 'cough' }, expression: 'Tengo tos' },
  { id: 'cold', name: { spanish: 'resfriado', english: 'cold' }, expression: 'Tengo un resfriado' },
  { id: 'flu', name: { spanish: 'gripe', english: 'flu' }, expression: 'Tengo gripe' },
  { id: 'nausea', name: { spanish: 'nauseas', english: 'nausea' }, expression: 'Tengo nauseas' },
  { id: 'dizziness', name: { spanish: 'mareos', english: 'dizziness' }, expression: 'Tengo mareos' },
  { id: 'chills', name: { spanish: 'escalofrios', english: 'chills' }, expression: 'Tengo escalofrios' },
  { id: 'allergies', name: { spanish: 'alergias', english: 'allergies' }, expression: 'Tengo alergias' },

  // "Estoy" expressions (temporary states)
  { id: 'tired', name: { spanish: 'cansado/a', english: 'tired' }, expression: 'Estoy muy cansado/a' },
  { id: 'dizzy', name: { spanish: 'mareado/a', english: 'dizzy' }, expression: 'Estoy mareado/a' },
  { id: 'congested', name: { spanish: 'congestionado/a', english: 'congested' }, expression: 'Estoy congestionado/a' },
];

// ============================================================================
// DOCTOR COMMANDS
// ============================================================================

export interface DoctorCommand {
  spanish: string;
  english: string;
  formalCommand: string; // The usted command form
  action: string; // What the player should do/say
}

export const doctorCommands: DoctorCommand[] = [
  { spanish: 'Abra la boca', english: 'Open your mouth', formalCommand: 'abra', action: 'open_mouth' },
  { spanish: 'Saque la lengua', english: 'Stick out your tongue', formalCommand: 'saque', action: 'stick_out_tongue' },
  { spanish: 'Respire profundo', english: 'Breathe deeply', formalCommand: 'respire', action: 'breathe_deeply' },
  { spanish: 'Contenga la respiracion', english: 'Hold your breath', formalCommand: 'contenga', action: 'hold_breath' },
  { spanish: 'Tosa', english: 'Cough', formalCommand: 'tosa', action: 'cough' },
  { spanish: 'Subase la manga', english: 'Roll up your sleeve', formalCommand: 'subase', action: 'roll_up_sleeve' },
  { spanish: 'Sientese en la camilla', english: 'Sit on the exam table', formalCommand: 'sientese', action: 'sit_on_table' },
  { spanish: 'Acuestese', english: 'Lie down', formalCommand: 'acuestese', action: 'lie_down' },
  { spanish: 'Relajese', english: 'Relax', formalCommand: 'relajese', action: 'relax' },
  { spanish: 'Mire hacia arriba', english: 'Look up', formalCommand: 'mire', action: 'look_up' },
  { spanish: 'Diga "ah"', english: 'Say "ah"', formalCommand: 'diga', action: 'say_ah' },
];

// ============================================================================
// CLINIC VOCABULARY
// ============================================================================

export const clinicVocabulary: VocabWord[] = [
  // Locations
  { spanish: 'la clinica', english: 'clinic', category: 'noun', gender: 'feminine' },
  { spanish: 'el hospital', english: 'hospital', category: 'noun', gender: 'masculine' },
  { spanish: 'la recepcion', english: 'reception', category: 'noun', gender: 'feminine' },
  { spanish: 'la sala de espera', english: 'waiting room', category: 'noun', gender: 'feminine' },
  { spanish: 'el consultorio', english: 'exam room/office', category: 'noun', gender: 'masculine' },
  { spanish: 'la farmacia', english: 'pharmacy', category: 'noun', gender: 'feminine' },
  { spanish: 'la emergencia', english: 'emergency room', category: 'noun', gender: 'feminine' },

  // People
  { spanish: 'el doctor', english: 'doctor (male)', category: 'noun', gender: 'masculine' },
  { spanish: 'la doctora', english: 'doctor (female)', category: 'noun', gender: 'feminine' },
  { spanish: 'el medico', english: 'physician (male)', category: 'noun', gender: 'masculine' },
  { spanish: 'la medica', english: 'physician (female)', category: 'noun', gender: 'feminine' },
  { spanish: 'el/la paciente', english: 'patient', category: 'noun', gender: 'masculine' },
  { spanish: 'el enfermero', english: 'nurse (male)', category: 'noun', gender: 'masculine' },
  { spanish: 'la enfermera', english: 'nurse (female)', category: 'noun', gender: 'feminine' },
  { spanish: 'el/la recepcionista', english: 'receptionist', category: 'noun', gender: 'masculine' },
  { spanish: 'el farmaceutico', english: 'pharmacist (male)', category: 'noun', gender: 'masculine' },
  { spanish: 'la farmaceutica', english: 'pharmacist (female)', category: 'noun', gender: 'feminine' },

  // Body parts
  { spanish: 'la cabeza', english: 'head', category: 'noun', gender: 'feminine' },
  { spanish: 'el estomago', english: 'stomach', category: 'noun', gender: 'masculine' },
  { spanish: 'la espalda', english: 'back', category: 'noun', gender: 'feminine' },
  { spanish: 'la garganta', english: 'throat', category: 'noun', gender: 'feminine' },
  { spanish: 'el oido', english: 'ear (inner)', category: 'noun', gender: 'masculine' },
  { spanish: 'la oreja', english: 'ear (outer)', category: 'noun', gender: 'feminine' },
  { spanish: 'el ojo', english: 'eye', category: 'noun', gender: 'masculine' },
  { spanish: 'la nariz', english: 'nose', category: 'noun', gender: 'feminine' },
  { spanish: 'la boca', english: 'mouth', category: 'noun', gender: 'feminine' },
  { spanish: 'la lengua', english: 'tongue', category: 'noun', gender: 'feminine' },
  { spanish: 'el diente', english: 'tooth', category: 'noun', gender: 'masculine' },
  { spanish: 'la muela', english: 'molar', category: 'noun', gender: 'feminine' },
  { spanish: 'el pecho', english: 'chest', category: 'noun', gender: 'masculine' },
  { spanish: 'el corazon', english: 'heart', category: 'noun', gender: 'masculine' },
  { spanish: 'el pulmon', english: 'lung', category: 'noun', gender: 'masculine' },
  { spanish: 'el brazo', english: 'arm', category: 'noun', gender: 'masculine' },
  { spanish: 'la mano', english: 'hand', category: 'noun', gender: 'feminine' },
  { spanish: 'el dedo', english: 'finger', category: 'noun', gender: 'masculine' },
  { spanish: 'la pierna', english: 'leg', category: 'noun', gender: 'feminine' },
  { spanish: 'el pie', english: 'foot', category: 'noun', gender: 'masculine' },
  { spanish: 'la rodilla', english: 'knee', category: 'noun', gender: 'feminine' },
  { spanish: 'el cuello', english: 'neck', category: 'noun', gender: 'masculine' },
  { spanish: 'el hombro', english: 'shoulder', category: 'noun', gender: 'masculine' },

  // Symptoms & Conditions (nouns)
  { spanish: 'el dolor', english: 'pain', category: 'noun', gender: 'masculine' },
  { spanish: 'la fiebre', english: 'fever', category: 'noun', gender: 'feminine' },
  { spanish: 'la tos', english: 'cough', category: 'noun', gender: 'feminine' },
  { spanish: 'el resfriado', english: 'cold', category: 'noun', gender: 'masculine' },
  { spanish: 'la gripe', english: 'flu', category: 'noun', gender: 'feminine' },
  { spanish: 'las nauseas', english: 'nausea', category: 'noun', gender: 'feminine' },
  { spanish: 'el mareo', english: 'dizziness', category: 'noun', gender: 'masculine' },
  { spanish: 'la alergia', english: 'allergy', category: 'noun', gender: 'feminine' },
  { spanish: 'la infeccion', english: 'infection', category: 'noun', gender: 'feminine' },
  { spanish: 'la inflamacion', english: 'inflammation', category: 'noun', gender: 'feminine' },
  { spanish: 'el sintoma', english: 'symptom', category: 'noun', gender: 'masculine' },
  { spanish: 'la herida', english: 'wound', category: 'noun', gender: 'feminine' },

  // Medical equipment & items
  { spanish: 'la camilla', english: 'exam table', category: 'noun', gender: 'feminine' },
  { spanish: 'el tensiometro', english: 'blood pressure monitor', category: 'noun', gender: 'masculine' },
  { spanish: 'el estetoscopio', english: 'stethoscope', category: 'noun', gender: 'masculine' },
  { spanish: 'la bascula', english: 'scale', category: 'noun', gender: 'feminine' },
  { spanish: 'el termometro', english: 'thermometer', category: 'noun', gender: 'masculine' },
  { spanish: 'la jeringa', english: 'syringe', category: 'noun', gender: 'feminine' },
  { spanish: 'la receta', english: 'prescription', category: 'noun', gender: 'feminine' },
  { spanish: 'el formulario', english: 'form', category: 'noun', gender: 'masculine' },
  { spanish: 'la cita', english: 'appointment', category: 'noun', gender: 'feminine' },
  { spanish: 'el seguro medico', english: 'health insurance', category: 'noun', gender: 'masculine' },
  { spanish: 'la tarjeta de seguro', english: 'insurance card', category: 'noun', gender: 'feminine' },

  // Medicines
  { spanish: 'la medicina', english: 'medicine', category: 'noun', gender: 'feminine' },
  { spanish: 'el medicamento', english: 'medication', category: 'noun', gender: 'masculine' },
  { spanish: 'la pastilla', english: 'pill', category: 'noun', gender: 'feminine' },
  { spanish: 'el jarabe', english: 'syrup', category: 'noun', gender: 'masculine' },
  { spanish: 'el analgesico', english: 'pain reliever', category: 'noun', gender: 'masculine' },
  { spanish: 'el antibiotico', english: 'antibiotic', category: 'noun', gender: 'masculine' },
  { spanish: 'la aspirina', english: 'aspirin', category: 'noun', gender: 'feminine' },
  { spanish: 'las vitaminas', english: 'vitamins', category: 'noun', gender: 'feminine' },
  { spanish: 'las gotas', english: 'drops', category: 'noun', gender: 'feminine' },
  { spanish: 'la crema', english: 'cream/ointment', category: 'noun', gender: 'feminine' },
  { spanish: 'la venda', english: 'bandage', category: 'noun', gender: 'feminine' },
  { spanish: 'la inyeccion', english: 'injection/shot', category: 'noun', gender: 'feminine' },

  // KEY VERBS - "Doler" (to hurt)
  { spanish: 'me duele', english: 'it hurts me (singular)', category: 'verb' },
  { spanish: 'me duelen', english: 'they hurt me (plural)', category: 'verb' },
  { spanish: 'le duele', english: 'it hurts him/her/you(formal)', category: 'verb' },
  { spanish: 'te duele', english: 'it hurts you (informal)', category: 'verb' },

  // KEY VERBS - "Tener" expressions
  { spanish: 'tengo', english: 'I have', category: 'verb' },
  { spanish: 'tiene', english: 'he/she/you(formal) has', category: 'verb' },
  { spanish: 'tengo fiebre', english: 'I have a fever', category: 'verb' },
  { spanish: 'tengo tos', english: 'I have a cough', category: 'verb' },
  { spanish: 'tengo nauseas', english: 'I have nausea', category: 'verb' },
  { spanish: 'tengo escalofrios', english: 'I have chills', category: 'verb' },
  { spanish: 'tengo cita', english: 'I have an appointment', category: 'verb' },

  // KEY VERBS - "Estar" (temporary states)
  { spanish: 'estoy enfermo/a', english: 'I am sick', category: 'verb' },
  { spanish: 'estoy mareado/a', english: 'I am dizzy', category: 'verb' },
  { spanish: 'estoy cansado/a', english: 'I am tired', category: 'verb' },
  { spanish: 'estoy congestionado/a', english: 'I am congested', category: 'verb' },

  // KEY VERBS - "Sentirse" (to feel)
  { spanish: 'me siento mal', english: 'I feel bad/sick', category: 'verb' },
  { spanish: 'me siento mejor', english: 'I feel better', category: 'verb' },
  { spanish: 'no me siento bien', english: 'I don\'t feel well', category: 'verb' },

  // FORMAL COMMANDS (usted) - Doctor instructions
  { spanish: 'abra', english: 'open (formal command)', category: 'verb' },
  { spanish: 'cierre', english: 'close (formal command)', category: 'verb' },
  { spanish: 'saque', english: 'stick out/take out (formal command)', category: 'verb' },
  { spanish: 'respire', english: 'breathe (formal command)', category: 'verb' },
  { spanish: 'contenga', english: 'hold (formal command)', category: 'verb' },
  { spanish: 'tosa', english: 'cough (formal command)', category: 'verb' },
  { spanish: 'subase', english: 'roll up (formal command)', category: 'verb' },
  { spanish: 'sientese', english: 'sit down (formal command)', category: 'verb' },
  { spanish: 'acuestese', english: 'lie down (formal command)', category: 'verb' },
  { spanish: 'relajese', english: 'relax (formal command)', category: 'verb' },
  { spanish: 'mire', english: 'look (formal command)', category: 'verb' },
  { spanish: 'diga', english: 'say (formal command)', category: 'verb' },
  { spanish: 'tome', english: 'take (formal command)', category: 'verb' },
  { spanish: 'espere', english: 'wait (formal command)', category: 'verb' },

  // Other verbs
  { spanish: 'examinar', english: 'to examine', category: 'verb' },
  { spanish: 'recetar', english: 'to prescribe', category: 'verb' },
  { spanish: 'tomar', english: 'to take (medicine)', category: 'verb' },
  { spanish: 'llenar', english: 'to fill out', category: 'verb' },
  { spanish: 'lleno', english: 'I fill out', category: 'verb' },
  { spanish: 'necesitar', english: 'to need', category: 'verb' },
  { spanish: 'necesito', english: 'I need', category: 'verb' },
  { spanish: 'sentir', english: 'to feel', category: 'verb' },
  { spanish: 'doler', english: 'to hurt', category: 'verb' },
  { spanish: 'mejorar', english: 'to improve/get better', category: 'verb' },
  { spanish: 'empeorar', english: 'to get worse', category: 'verb' },

  // Useful phrases
  { spanish: 'que le pasa?', english: 'what\'s wrong with you?', category: 'other' },
  { spanish: 'donde le duele?', english: 'where does it hurt?', category: 'other' },
  { spanish: 'desde cuando?', english: 'since when?', category: 'other' },
  { spanish: 'tiene seguro?', english: 'do you have insurance?', category: 'other' },
  { spanish: 'tiene cita?', english: 'do you have an appointment?', category: 'other' },
  { spanish: 'tengo cita con...', english: 'I have an appointment with...', category: 'other' },
  { spanish: 'necesito ver a un medico', english: 'I need to see a doctor', category: 'other' },
  { spanish: 'no me siento bien', english: 'I don\'t feel well', category: 'other' },
  { spanish: 'desde ayer', english: 'since yesterday', category: 'other' },
  { spanish: 'desde hace tres dias', english: 'for three days', category: 'other' },
  { spanish: 'es urgente', english: 'it\'s urgent', category: 'other' },

  // Pharmacist instructions
  { spanish: 'tome una pastilla', english: 'take one pill', category: 'other' },
  { spanish: 'cada ocho horas', english: 'every eight hours', category: 'other' },
  { spanish: 'cada doce horas', english: 'every twelve hours', category: 'other' },
  { spanish: 'tres veces al dia', english: 'three times a day', category: 'other' },
  { spanish: 'con comida', english: 'with food', category: 'other' },
  { spanish: 'antes de comer', english: 'before eating', category: 'other' },
  { spanish: 'despues de comer', english: 'after eating', category: 'other' },
  { spanish: 'antes de acostarse', english: 'before bed', category: 'other' },
  { spanish: 'por una semana', english: 'for one week', category: 'other' },

  // Adjectives
  { spanish: 'enfermo/a', english: 'sick', category: 'adjective' },
  { spanish: 'sano/a', english: 'healthy', category: 'adjective' },
  { spanish: 'grave', english: 'serious', category: 'adjective' },
  { spanish: 'leve', english: 'mild', category: 'adjective' },
  { spanish: 'agudo/a', english: 'sharp (pain)', category: 'adjective' },
  { spanish: 'cronico/a', english: 'chronic', category: 'adjective' },
  { spanish: 'hinchado/a', english: 'swollen', category: 'adjective' },
  { spanish: 'inflamado/a', english: 'inflamed', category: 'adjective' },

  // Polite expressions
  { spanish: 'por favor', english: 'please', category: 'other' },
  { spanish: 'gracias', english: 'thank you', category: 'other' },
  { spanish: 'muchas gracias', english: 'thank you very much', category: 'other' },
  { spanish: 'si, doctor/a', english: 'yes, doctor', category: 'other' },
  { spanish: 'entiendo', english: 'I understand', category: 'other' },
  { spanish: 'que se mejore', english: 'get well soon', category: 'other' },
  { spanish: 'cuidese', english: 'take care (formal)', category: 'other' },
];

export const promptInstructions = `CLINIC NPCs:
- Receptionist (Maria): Professional and helpful. Uses formal "usted". Asks "Tiene cita?" (Do you have an appointment?), "Cual es su nombre?" (What is your name?), "Por favor, llene este formulario" (Please fill out this form).
- Doctor (Dr. Garcia): Kind and thorough. Uses formal "usted". Asks "Que le pasa?" and "Donde le duele?". Gives commands: "Abra la boca", "Respire profundo", "Suba la manga". Explains diagnosis and writes prescriptions.
- Pharmacist (Roberto): Friendly. Explains dosage: "Tome una pastilla cada ocho horas" (Take one pill every eight hours), "Con comida" (With food). Asks "Tiene la receta?" (Do you have the prescription?).

CLINIC INTERACTIONS:
- "Buenos dias" or "Tengo cita" at reception → actions: [{ "type": "talk", "npcId": "receptionist" }], goalComplete: ["clinic_check_in"], npcResponse from receptionist
- "Lleno el formulario" → actions: [{ "type": "use", "objectId": "registration_form" }], goalComplete: ["filled_form"]
- "Me siento" in waiting room → goalComplete: ["waited"]
- "Me duele la cabeza" or "Tengo fiebre" to doctor → actions: [{ "type": "talk", "npcId": "doctor" }], goalComplete: ["described_symptoms"], npcResponse from doctor
- "Si, doctor" or "Abro la boca" (following commands) → actions: [{ "type": "talk", "npcId": "doctor" }], goalComplete: ["followed_commands"]
- "Tomo la receta" → actions: [{ "type": "take", "objectId": "prescription" }], goalComplete: ["got_prescription"]
- "Aqui esta mi receta" to pharmacist → actions: [{ "type": "talk", "npcId": "pharmacist" }], goalComplete: ["got_medicine"], npcResponse from pharmacist

KEY SPANISH FOR MEDICAL VISITS (teach these patterns):
- "Me duele..." (My ... hurts) - "Me duele la cabeza" (My head hurts)
- "Tengo..." (I have...) - "Tengo fiebre" (I have a fever), "Tengo tos" (I have a cough)
- "No me siento bien" (I don't feel well)
- Formal commands (usted): "Abra" (Open), "Respire" (Breathe), "Saque" (Stick out)`;

export const clinicModule: ModuleDefinition = {
  name: 'clinic',
  displayName: 'Clinic',
  locations: clinicLocations,
  npcs: clinicNPCs,
  goals: clinicGoals,
  vocabulary: clinicVocabulary,
  startLocationId: 'clinic_reception',
  startGoalId: 'clinic_arrive',
  locationIds: Object.keys(clinicLocations),
  unlockLevel: 5,
  promptInstructions,
};
