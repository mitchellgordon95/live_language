import type { Location, Goal, VocabWord, GameState, NPC, ModuleDefinition } from '../../../engine/types.js';

// ============================================================================
// CLINIC LOCATIONS
// ============================================================================

export const clinicReception: Location = {
  id: 'clinic_reception',
  name: { target: 'la recepcion de la clinica', native: 'clinic reception' },
  objects: [
    {
      id: 'reception_desk',
      name: { target: 'el escritorio de recepcion', native: 'reception desk' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'registration_form',
      name: { target: 'el formulario de registro', native: 'registration form' },
      state: { filled: false },
      actions: ['TAKE', 'USE', 'LOOK'],
      takeable: true,
    },
    {
      id: 'health_insurance_card',
      name: { target: 'la tarjeta de seguro medico', native: 'health insurance card' },
      state: {},
      actions: ['TAKE', 'USE'],
      takeable: true,
    },
    {
      id: 'pen',
      name: { target: 'el boligrafo', native: 'pen' },
      state: {},
      actions: ['TAKE', 'USE'],
      takeable: true,
    },
    {
      id: 'clinic_brochure',
      name: { target: 'el folleto de la clinica', native: 'clinic brochure' },
      state: {},
      actions: ['TAKE', 'LOOK'],
      takeable: true,
    },
    {
      id: 'appointment_sign',
      name: { target: 'el letrero de citas', native: 'appointment sign' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'waiting_room', name: { target: 'la sala de espera', native: 'waiting room' } },
    { to: 'pharmacy', name: { target: 'la farmacia', native: 'pharmacy' } },
    { to: 'street', name: { target: 'la calle', native: 'street' } },
  ],
};

export const waitingRoom: Location = {
  id: 'waiting_room',
  name: { target: 'la sala de espera', native: 'waiting room' },
  objects: [
    {
      id: 'waiting_chair',
      name: { target: 'la silla de espera', native: 'waiting chair' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'magazines',
      name: { target: 'las revistas', native: 'magazines' },
      state: {},
      actions: ['TAKE', 'LOOK'],
      takeable: true,
    },
    {
      id: 'water_cooler',
      name: { target: 'el dispensador de agua', native: 'water cooler' },
      state: {},
      actions: ['USE'],
      consumable: true,
      needsEffect: { hunger: 5 },
    },
    {
      id: 'tv_screen',
      name: { target: 'la pantalla de television', native: 'TV screen' },
      state: { on: true },
      actions: ['LOOK'],
    },
    {
      id: 'number_display',
      name: { target: 'la pantalla de turnos', native: 'number display' },
      state: { currentNumber: 15, yourNumber: 18 },
      actions: ['LOOK'],
    },
    {
      id: 'health_poster',
      name: { target: 'el cartel de salud', native: 'health poster' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'clinic_reception', name: { target: 'la recepcion', native: 'reception' } },
    { to: 'exam_room', name: { target: 'el consultorio', native: 'exam room' } },
  ],
};

export const examRoom: Location = {
  id: 'exam_room',
  name: { target: 'el consultorio', native: 'exam room' },
  objects: [
    {
      id: 'exam_table',
      name: { target: 'la camilla', native: 'exam table' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'blood_pressure_monitor',
      name: { target: 'el tensiometro', native: 'blood pressure monitor' },
      state: { lastReading: null },
      actions: ['LOOK'],
    },
    {
      id: 'stethoscope',
      name: { target: 'el estetoscopio', native: 'stethoscope' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'scale',
      name: { target: 'la bascula', native: 'scale' },
      state: {},
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'thermometer',
      name: { target: 'el termometro', native: 'thermometer' },
      state: { lastReading: null },
      actions: ['USE', 'LOOK'],
    },
    {
      id: 'tongue_depressor',
      name: { target: 'el depresor de lengua', native: 'tongue depressor' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'medical_chart',
      name: { target: 'el expediente medico', native: 'medical chart' },
      state: { symptomsRecorded: false },
      actions: ['LOOK'],
    },
    {
      id: 'prescription_pad',
      name: { target: 'el recetario', native: 'prescription pad' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'prescription',
      name: { target: 'la receta medica', native: 'prescription' },
      state: { written: false, received: false },
      actions: ['TAKE', 'LOOK'],
      takeable: true,
    },
    {
      id: 'anatomy_poster',
      name: { target: 'el cartel de anatomia', native: 'anatomy poster' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'waiting_room', name: { target: 'la sala de espera', native: 'waiting room' } },
  ],
};

export const pharmacy: Location = {
  id: 'pharmacy',
  name: { target: 'la farmacia', native: 'pharmacy' },
  objects: [
    {
      id: 'pharmacy_counter',
      name: { target: 'el mostrador de la farmacia', native: 'pharmacy counter' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'medicine_shelf',
      name: { target: 'el estante de medicinas', native: 'medicine shelf' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'pain_reliever',
      name: { target: 'el analgesico', native: 'pain reliever' },
      state: { purchased: false },
      actions: ['TAKE', 'LOOK'],
      takeable: true,
      consumable: true,
      needsEffect: { energy: 10 },
    },
    {
      id: 'antibiotic',
      name: { target: 'el antibiotico', native: 'antibiotic' },
      state: { purchased: false, requiresPrescription: true },
      actions: ['TAKE', 'LOOK'],
      takeable: true,
      consumable: true,
    },
    {
      id: 'cough_syrup',
      name: { target: 'el jarabe para la tos', native: 'cough syrup' },
      state: { purchased: false },
      actions: ['TAKE', 'LOOK'],
      takeable: true,
      consumable: true,
    },
    {
      id: 'bandages',
      name: { target: 'las vendas', native: 'bandages' },
      state: {},
      actions: ['TAKE', 'LOOK'],
      takeable: true,
    },
    {
      id: 'vitamins',
      name: { target: 'las vitaminas', native: 'vitamins' },
      state: {},
      actions: ['TAKE', 'LOOK'],
      takeable: true,
      consumable: true,
      needsEffect: { energy: 5 },
    },
    {
      id: 'pharmacy_receipt',
      name: { target: 'el recibo de la farmacia', native: 'pharmacy receipt' },
      state: { printed: false },
      actions: ['TAKE', 'LOOK'],
      takeable: true,
    },
  ],
  exits: [
    { to: 'clinic_reception', name: { target: 'la recepcion de la clinica', native: 'clinic reception' } },
    { to: 'street', name: { target: 'la calle', native: 'street' } },
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
    name: { target: 'Maria', native: 'Maria' },
    location: 'clinic_reception',
    personality: 'Professional and helpful receptionist named Maria. Speaks formally with "usted". Will ask for your name, insurance card, and reason for visit. Key phrases: "Tiene cita?" (Do you have an appointment?), "Cual es su nombre?" (What is your name?), "Por favor, llene este formulario" (Please fill out this form), "Tome asiento en la sala de espera" (Have a seat in the waiting room).',
    gender: 'female',
  },
  {
    id: 'doctor',
    name: { target: 'Doctor Garcia', native: 'Dr. Garcia' },
    location: 'exam_room',
    personality: 'Kind and thorough doctor named Dr. Garcia. Uses formal "usted". Asks about symptoms using "Que le pasa?" and "Donde le duele?". Gives commands: "Abra la boca", "Respire profundo", "Suba la manga". Explains diagnosis clearly and writes prescriptions. Reassuring but professional.',
    gender: 'male',
  },
  {
    id: 'pharmacist',
    name: { target: 'Roberto', native: 'Roberto' },
    location: 'pharmacy',
    personality: 'Friendly pharmacist named Roberto. Explains how to take medicine: "Tome una pastilla cada ocho horas" (Take one pill every eight hours), "Con comida" (With food), "Antes de acostarse" (Before bed). Will ask "Tiene la receta?" (Do you have the prescription?). Helpful with over-the-counter recommendations.',
    gender: 'male',
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
    checkComplete: (state: GameState) => state.completedGoals.includes('clinic_get_medicine'),
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
  name: { target: string; native: string };
  expression: string; // How to say it: "me duele..." or "tengo..."
  bodyPart?: string; // Related body part if applicable
}

export const symptoms: Symptom[] = [
  // "Me duele" expressions (body part pain)
  { id: 'headache', name: { target: 'dolor de cabeza', native: 'headache' }, expression: 'Me duele la cabeza', bodyPart: 'head' },
  { id: 'stomachache', name: { target: 'dolor de estomago', native: 'stomachache' }, expression: 'Me duele el estomago', bodyPart: 'stomach' },
  { id: 'backache', name: { target: 'dolor de espalda', native: 'backache' }, expression: 'Me duele la espalda', bodyPart: 'back' },
  { id: 'sore_throat', name: { target: 'dolor de garganta', native: 'sore throat' }, expression: 'Me duele la garganta', bodyPart: 'throat' },
  { id: 'earache', name: { target: 'dolor de oido', native: 'earache' }, expression: 'Me duele el oido', bodyPart: 'ear' },
  { id: 'toothache', name: { target: 'dolor de muelas', native: 'toothache' }, expression: 'Me duele la muela', bodyPart: 'tooth' },
  { id: 'chest_pain', name: { target: 'dolor de pecho', native: 'chest pain' }, expression: 'Me duele el pecho', bodyPart: 'chest' },
  { id: 'arm_pain', name: { target: 'dolor de brazo', native: 'arm pain' }, expression: 'Me duele el brazo', bodyPart: 'arm' },
  { id: 'leg_pain', name: { target: 'dolor de pierna', native: 'leg pain' }, expression: 'Me duele la pierna', bodyPart: 'leg' },

  // "Tengo" expressions (conditions)
  { id: 'fever', name: { target: 'fiebre', native: 'fever' }, expression: 'Tengo fiebre' },
  { id: 'cough', name: { target: 'tos', native: 'cough' }, expression: 'Tengo tos' },
  { id: 'cold', name: { target: 'resfriado', native: 'cold' }, expression: 'Tengo un resfriado' },
  { id: 'flu', name: { target: 'gripe', native: 'flu' }, expression: 'Tengo gripe' },
  { id: 'nausea', name: { target: 'nauseas', native: 'nausea' }, expression: 'Tengo nauseas' },
  { id: 'dizziness', name: { target: 'mareos', native: 'dizziness' }, expression: 'Tengo mareos' },
  { id: 'chills', name: { target: 'escalofrios', native: 'chills' }, expression: 'Tengo escalofrios' },
  { id: 'allergies', name: { target: 'alergias', native: 'allergies' }, expression: 'Tengo alergias' },

  // "Estoy" expressions (temporary states)
  { id: 'tired', name: { target: 'cansado/a', native: 'tired' }, expression: 'Estoy muy cansado/a' },
  { id: 'dizzy', name: { target: 'mareado/a', native: 'dizzy' }, expression: 'Estoy mareado/a' },
  { id: 'congested', name: { target: 'congestionado/a', native: 'congested' }, expression: 'Estoy congestionado/a' },
];

// ============================================================================
// DOCTOR COMMANDS
// ============================================================================

export interface DoctorCommand {
  target: string;
  native: string;
  formalCommand: string; // The usted command form
  action: string; // What the player should do/say
}

export const doctorCommands: DoctorCommand[] = [
  { target: 'Abra la boca', native: 'Open your mouth', formalCommand: 'abra', action: 'open_mouth' },
  { target: 'Saque la lengua', native: 'Stick out your tongue', formalCommand: 'saque', action: 'stick_out_tongue' },
  { target: 'Respire profundo', native: 'Breathe deeply', formalCommand: 'respire', action: 'breathe_deeply' },
  { target: 'Contenga la respiracion', native: 'Hold your breath', formalCommand: 'contenga', action: 'hold_breath' },
  { target: 'Tosa', native: 'Cough', formalCommand: 'tosa', action: 'cough' },
  { target: 'Subase la manga', native: 'Roll up your sleeve', formalCommand: 'subase', action: 'roll_up_sleeve' },
  { target: 'Sientese en la camilla', native: 'Sit on the exam table', formalCommand: 'sientese', action: 'sit_on_table' },
  { target: 'Acuestese', native: 'Lie down', formalCommand: 'acuestese', action: 'lie_down' },
  { target: 'Relajese', native: 'Relax', formalCommand: 'relajese', action: 'relax' },
  { target: 'Mire hacia arriba', native: 'Look up', formalCommand: 'mire', action: 'look_up' },
  { target: 'Diga "ah"', native: 'Say "ah"', formalCommand: 'diga', action: 'say_ah' },
];

// ============================================================================
// CLINIC VOCABULARY
// ============================================================================

export const clinicVocabulary: VocabWord[] = [
  // Locations
  { target: 'la clinica', native: 'clinic', category: 'noun', gender: 'feminine' },
  { target: 'el hospital', native: 'hospital', category: 'noun', gender: 'masculine' },
  { target: 'la recepcion', native: 'reception', category: 'noun', gender: 'feminine' },
  { target: 'la sala de espera', native: 'waiting room', category: 'noun', gender: 'feminine' },
  { target: 'el consultorio', native: 'exam room/office', category: 'noun', gender: 'masculine' },
  { target: 'la farmacia', native: 'pharmacy', category: 'noun', gender: 'feminine' },
  { target: 'la emergencia', native: 'emergency room', category: 'noun', gender: 'feminine' },

  // People
  { target: 'el doctor', native: 'doctor (male)', category: 'noun', gender: 'masculine' },
  { target: 'la doctora', native: 'doctor (female)', category: 'noun', gender: 'feminine' },
  { target: 'el medico', native: 'physician (male)', category: 'noun', gender: 'masculine' },
  { target: 'la medica', native: 'physician (female)', category: 'noun', gender: 'feminine' },
  { target: 'el/la paciente', native: 'patient', category: 'noun', gender: 'masculine' },
  { target: 'el enfermero', native: 'nurse (male)', category: 'noun', gender: 'masculine' },
  { target: 'la enfermera', native: 'nurse (female)', category: 'noun', gender: 'feminine' },
  { target: 'el/la recepcionista', native: 'receptionist', category: 'noun', gender: 'masculine' },
  { target: 'el farmaceutico', native: 'pharmacist (male)', category: 'noun', gender: 'masculine' },
  { target: 'la farmaceutica', native: 'pharmacist (female)', category: 'noun', gender: 'feminine' },

  // Body parts
  { target: 'la cabeza', native: 'head', category: 'noun', gender: 'feminine' },
  { target: 'el estomago', native: 'stomach', category: 'noun', gender: 'masculine' },
  { target: 'la espalda', native: 'back', category: 'noun', gender: 'feminine' },
  { target: 'la garganta', native: 'throat', category: 'noun', gender: 'feminine' },
  { target: 'el oido', native: 'ear (inner)', category: 'noun', gender: 'masculine' },
  { target: 'la oreja', native: 'ear (outer)', category: 'noun', gender: 'feminine' },
  { target: 'el ojo', native: 'eye', category: 'noun', gender: 'masculine' },
  { target: 'la nariz', native: 'nose', category: 'noun', gender: 'feminine' },
  { target: 'la boca', native: 'mouth', category: 'noun', gender: 'feminine' },
  { target: 'la lengua', native: 'tongue', category: 'noun', gender: 'feminine' },
  { target: 'el diente', native: 'tooth', category: 'noun', gender: 'masculine' },
  { target: 'la muela', native: 'molar', category: 'noun', gender: 'feminine' },
  { target: 'el pecho', native: 'chest', category: 'noun', gender: 'masculine' },
  { target: 'el corazon', native: 'heart', category: 'noun', gender: 'masculine' },
  { target: 'el pulmon', native: 'lung', category: 'noun', gender: 'masculine' },
  { target: 'el brazo', native: 'arm', category: 'noun', gender: 'masculine' },
  { target: 'la mano', native: 'hand', category: 'noun', gender: 'feminine' },
  { target: 'el dedo', native: 'finger', category: 'noun', gender: 'masculine' },
  { target: 'la pierna', native: 'leg', category: 'noun', gender: 'feminine' },
  { target: 'el pie', native: 'foot', category: 'noun', gender: 'masculine' },
  { target: 'la rodilla', native: 'knee', category: 'noun', gender: 'feminine' },
  { target: 'el cuello', native: 'neck', category: 'noun', gender: 'masculine' },
  { target: 'el hombro', native: 'shoulder', category: 'noun', gender: 'masculine' },

  // Symptoms & Conditions (nouns)
  { target: 'el dolor', native: 'pain', category: 'noun', gender: 'masculine' },
  { target: 'la fiebre', native: 'fever', category: 'noun', gender: 'feminine' },
  { target: 'la tos', native: 'cough', category: 'noun', gender: 'feminine' },
  { target: 'el resfriado', native: 'cold', category: 'noun', gender: 'masculine' },
  { target: 'la gripe', native: 'flu', category: 'noun', gender: 'feminine' },
  { target: 'las nauseas', native: 'nausea', category: 'noun', gender: 'feminine' },
  { target: 'el mareo', native: 'dizziness', category: 'noun', gender: 'masculine' },
  { target: 'la alergia', native: 'allergy', category: 'noun', gender: 'feminine' },
  { target: 'la infeccion', native: 'infection', category: 'noun', gender: 'feminine' },
  { target: 'la inflamacion', native: 'inflammation', category: 'noun', gender: 'feminine' },
  { target: 'el sintoma', native: 'symptom', category: 'noun', gender: 'masculine' },
  { target: 'la herida', native: 'wound', category: 'noun', gender: 'feminine' },

  // Medical equipment & items
  { target: 'la camilla', native: 'exam table', category: 'noun', gender: 'feminine' },
  { target: 'el tensiometro', native: 'blood pressure monitor', category: 'noun', gender: 'masculine' },
  { target: 'el estetoscopio', native: 'stethoscope', category: 'noun', gender: 'masculine' },
  { target: 'la bascula', native: 'scale', category: 'noun', gender: 'feminine' },
  { target: 'el termometro', native: 'thermometer', category: 'noun', gender: 'masculine' },
  { target: 'la jeringa', native: 'syringe', category: 'noun', gender: 'feminine' },
  { target: 'la receta', native: 'prescription', category: 'noun', gender: 'feminine' },
  { target: 'el formulario', native: 'form', category: 'noun', gender: 'masculine' },
  { target: 'la cita', native: 'appointment', category: 'noun', gender: 'feminine' },
  { target: 'el seguro medico', native: 'health insurance', category: 'noun', gender: 'masculine' },
  { target: 'la tarjeta de seguro', native: 'insurance card', category: 'noun', gender: 'feminine' },

  // Medicines
  { target: 'la medicina', native: 'medicine', category: 'noun', gender: 'feminine' },
  { target: 'el medicamento', native: 'medication', category: 'noun', gender: 'masculine' },
  { target: 'la pastilla', native: 'pill', category: 'noun', gender: 'feminine' },
  { target: 'el jarabe', native: 'syrup', category: 'noun', gender: 'masculine' },
  { target: 'el analgesico', native: 'pain reliever', category: 'noun', gender: 'masculine' },
  { target: 'el antibiotico', native: 'antibiotic', category: 'noun', gender: 'masculine' },
  { target: 'la aspirina', native: 'aspirin', category: 'noun', gender: 'feminine' },
  { target: 'las vitaminas', native: 'vitamins', category: 'noun', gender: 'feminine' },
  { target: 'las gotas', native: 'drops', category: 'noun', gender: 'feminine' },
  { target: 'la crema', native: 'cream/ointment', category: 'noun', gender: 'feminine' },
  { target: 'la venda', native: 'bandage', category: 'noun', gender: 'feminine' },
  { target: 'la inyeccion', native: 'injection/shot', category: 'noun', gender: 'feminine' },

  // KEY VERBS - "Doler" (to hurt)
  { target: 'me duele', native: 'it hurts me (singular)', category: 'verb' },
  { target: 'me duelen', native: 'they hurt me (plural)', category: 'verb' },
  { target: 'le duele', native: 'it hurts him/her/you(formal)', category: 'verb' },
  { target: 'te duele', native: 'it hurts you (informal)', category: 'verb' },

  // KEY VERBS - "Tener" expressions
  { target: 'tengo', native: 'I have', category: 'verb' },
  { target: 'tiene', native: 'he/she/you(formal) has', category: 'verb' },
  { target: 'tengo fiebre', native: 'I have a fever', category: 'verb' },
  { target: 'tengo tos', native: 'I have a cough', category: 'verb' },
  { target: 'tengo nauseas', native: 'I have nausea', category: 'verb' },
  { target: 'tengo escalofrios', native: 'I have chills', category: 'verb' },
  { target: 'tengo cita', native: 'I have an appointment', category: 'verb' },

  // KEY VERBS - "Estar" (temporary states)
  { target: 'estoy enfermo/a', native: 'I am sick', category: 'verb' },
  { target: 'estoy mareado/a', native: 'I am dizzy', category: 'verb' },
  { target: 'estoy cansado/a', native: 'I am tired', category: 'verb' },
  { target: 'estoy congestionado/a', native: 'I am congested', category: 'verb' },

  // KEY VERBS - "Sentirse" (to feel)
  { target: 'me siento mal', native: 'I feel bad/sick', category: 'verb' },
  { target: 'me siento mejor', native: 'I feel better', category: 'verb' },
  { target: 'no me siento bien', native: 'I don\'t feel well', category: 'verb' },

  // FORMAL COMMANDS (usted) - Doctor instructions
  { target: 'abra', native: 'open (formal command)', category: 'verb' },
  { target: 'cierre', native: 'close (formal command)', category: 'verb' },
  { target: 'saque', native: 'stick out/take out (formal command)', category: 'verb' },
  { target: 'respire', native: 'breathe (formal command)', category: 'verb' },
  { target: 'contenga', native: 'hold (formal command)', category: 'verb' },
  { target: 'tosa', native: 'cough (formal command)', category: 'verb' },
  { target: 'subase', native: 'roll up (formal command)', category: 'verb' },
  { target: 'sientese', native: 'sit down (formal command)', category: 'verb' },
  { target: 'acuestese', native: 'lie down (formal command)', category: 'verb' },
  { target: 'relajese', native: 'relax (formal command)', category: 'verb' },
  { target: 'mire', native: 'look (formal command)', category: 'verb' },
  { target: 'diga', native: 'say (formal command)', category: 'verb' },
  { target: 'tome', native: 'take (formal command)', category: 'verb' },
  { target: 'espere', native: 'wait (formal command)', category: 'verb' },

  // Other verbs
  { target: 'examinar', native: 'to examine', category: 'verb' },
  { target: 'recetar', native: 'to prescribe', category: 'verb' },
  { target: 'tomar', native: 'to take (medicine)', category: 'verb' },
  { target: 'llenar', native: 'to fill out', category: 'verb' },
  { target: 'lleno', native: 'I fill out', category: 'verb' },
  { target: 'necesitar', native: 'to need', category: 'verb' },
  { target: 'necesito', native: 'I need', category: 'verb' },
  { target: 'sentir', native: 'to feel', category: 'verb' },
  { target: 'doler', native: 'to hurt', category: 'verb' },
  { target: 'mejorar', native: 'to improve/get better', category: 'verb' },
  { target: 'empeorar', native: 'to get worse', category: 'verb' },

  // Useful phrases
  { target: 'que le pasa?', native: 'what\'s wrong with you?', category: 'other' },
  { target: 'donde le duele?', native: 'where does it hurt?', category: 'other' },
  { target: 'desde cuando?', native: 'since when?', category: 'other' },
  { target: 'tiene seguro?', native: 'do you have insurance?', category: 'other' },
  { target: 'tiene cita?', native: 'do you have an appointment?', category: 'other' },
  { target: 'tengo cita con...', native: 'I have an appointment with...', category: 'other' },
  { target: 'necesito ver a un medico', native: 'I need to see a doctor', category: 'other' },
  { target: 'no me siento bien', native: 'I don\'t feel well', category: 'other' },
  { target: 'desde ayer', native: 'since yesterday', category: 'other' },
  { target: 'desde hace tres dias', native: 'for three days', category: 'other' },
  { target: 'es urgente', native: 'it\'s urgent', category: 'other' },

  // Pharmacist instructions
  { target: 'tome una pastilla', native: 'take one pill', category: 'other' },
  { target: 'cada ocho horas', native: 'every eight hours', category: 'other' },
  { target: 'cada doce horas', native: 'every twelve hours', category: 'other' },
  { target: 'tres veces al dia', native: 'three times a day', category: 'other' },
  { target: 'con comida', native: 'with food', category: 'other' },
  { target: 'antes de comer', native: 'before eating', category: 'other' },
  { target: 'despues de comer', native: 'after eating', category: 'other' },
  { target: 'antes de acostarse', native: 'before bed', category: 'other' },
  { target: 'por una semana', native: 'for one week', category: 'other' },

  // Adjectives
  { target: 'enfermo/a', native: 'sick', category: 'adjective' },
  { target: 'sano/a', native: 'healthy', category: 'adjective' },
  { target: 'grave', native: 'serious', category: 'adjective' },
  { target: 'leve', native: 'mild', category: 'adjective' },
  { target: 'agudo/a', native: 'sharp (pain)', category: 'adjective' },
  { target: 'cronico/a', native: 'chronic', category: 'adjective' },
  { target: 'hinchado/a', native: 'swollen', category: 'adjective' },
  { target: 'inflamado/a', native: 'inflamed', category: 'adjective' },

  // Polite expressions
  { target: 'por favor', native: 'please', category: 'other' },
  { target: 'gracias', native: 'thank you', category: 'other' },
  { target: 'muchas gracias', native: 'thank you very much', category: 'other' },
  { target: 'si, doctor/a', native: 'yes, doctor', category: 'other' },
  { target: 'entiendo', native: 'I understand', category: 'other' },
  { target: 'que se mejore', native: 'get well soon', category: 'other' },
  { target: 'cuidese', native: 'take care (formal)', category: 'other' },
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
