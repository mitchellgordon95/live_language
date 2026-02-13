import type { Location, Goal, VocabWord, GameState, NPC, WorldObject, ModuleDefinition } from '../../../engine/types.js';

// ============================================================================
// LOCATIONS (exits only -- objects are in the flat list below)
// ============================================================================

const locations: Record<string, Location> = {
  clinic_reception: {
    id: 'clinic_reception',
    name: { target: 'la recepcion de la clinica', native: 'clinic reception' },
    exits: [
      { to: 'waiting_room', name: { target: 'la sala de espera', native: 'waiting room' } },
      { to: 'pharmacy', name: { target: 'la farmacia', native: 'pharmacy' } },
      { to: 'street', name: { target: 'la calle', native: 'street' } },
    ],
    verbs: [
      { target: 'hablo con', native: 'I talk to' },
      { target: 'tengo cita', native: 'I have an appointment' },
      { target: 'necesito', native: 'I need' },
    ],
  },
  waiting_room: {
    id: 'waiting_room',
    name: { target: 'la sala de espera', native: 'waiting room' },
    exits: [
      { to: 'clinic_reception', name: { target: 'la recepcion', native: 'reception' } },
      { to: 'exam_room', name: { target: 'el consultorio', native: 'exam room' } },
    ],
    verbs: [
      { target: 'espero', native: 'I wait' },
      { target: 'me siento', native: 'I sit down' },
      { target: 'leo', native: 'I read' },
    ],
  },
  exam_room: {
    id: 'exam_room',
    name: { target: 'el consultorio', native: 'exam room' },
    exits: [
      { to: 'waiting_room', name: { target: 'la sala de espera', native: 'waiting room' } },
    ],
    verbs: [
      { target: 'me duele', native: 'it hurts' },
      { target: 'me siento', native: 'I feel' },
      { target: 'respiro', native: 'I breathe' },
      { target: 'tengo', native: 'I have' },
    ],
  },
  pharmacy: {
    id: 'pharmacy',
    name: { target: 'la farmacia', native: 'pharmacy' },
    exits: [
      { to: 'clinic_reception', name: { target: 'la recepcion de la clinica', native: 'clinic reception' } },
      { to: 'street', name: { target: 'la calle', native: 'street' } },
    ],
    verbs: [
      { target: 'necesito', native: 'I need' },
      { target: 'compro', native: 'I buy' },
      { target: 'tomo', native: 'I take' },
      { target: 'pago', native: 'I pay' },
    ],
  },
};

// ============================================================================
// OBJECTS (flat list -- each knows its own location)
// ============================================================================

const objects: WorldObject[] = [
  // Reception
  { id: 'reception_desk', name: { target: 'el escritorio de recepcion', native: 'reception desk' }, location: 'clinic_reception', tags: [] },
  { id: 'registration_form', name: { target: 'el formulario de registro', native: 'registration form' }, location: 'clinic_reception', tags: ['takeable'] },
  { id: 'health_insurance_card', name: { target: 'la tarjeta de seguro medico', native: 'health insurance card' }, location: 'clinic_reception', tags: ['takeable'] },
  { id: 'pen', name: { target: 'el boligrafo', native: 'pen' }, location: 'clinic_reception', tags: ['takeable'] },
  { id: 'clinic_brochure', name: { target: 'el folleto de la clinica', native: 'clinic brochure' }, location: 'clinic_reception', tags: ['takeable'] },
  { id: 'appointment_sign', name: { target: 'el letrero de citas', native: 'appointment sign' }, location: 'clinic_reception', tags: [] },

  // Waiting room
  { id: 'waiting_chair', name: { target: 'la silla de espera', native: 'waiting chair' }, location: 'waiting_room', tags: [] },
  { id: 'magazines', name: { target: 'las revistas', native: 'magazines' }, location: 'waiting_room', tags: ['takeable'] },
  { id: 'water_cooler', name: { target: 'el dispensador de agua', native: 'water cooler' }, location: 'waiting_room', tags: ['consumable'], needsEffect: { hunger: 5 } },
  { id: 'tv_screen', name: { target: 'la pantalla de television', native: 'TV screen' }, location: 'waiting_room', tags: ['on'] },
  { id: 'number_display', name: { target: 'la pantalla de turnos', native: 'number display' }, location: 'waiting_room', tags: [] },
  { id: 'health_poster', name: { target: 'el cartel de salud', native: 'health poster' }, location: 'waiting_room', tags: [] },

  // Exam room
  { id: 'exam_table', name: { target: 'la camilla', native: 'exam table' }, location: 'exam_room', tags: [] },
  { id: 'blood_pressure_monitor', name: { target: 'el tensiometro', native: 'blood pressure monitor' }, location: 'exam_room', tags: [] },
  { id: 'stethoscope', name: { target: 'el estetoscopio', native: 'stethoscope' }, location: 'exam_room', tags: [] },
  { id: 'scale', name: { target: 'la bascula', native: 'scale' }, location: 'exam_room', tags: [] },
  { id: 'thermometer', name: { target: 'el termometro', native: 'thermometer' }, location: 'exam_room', tags: [] },
  { id: 'tongue_depressor', name: { target: 'el depresor de lengua', native: 'tongue depressor' }, location: 'exam_room', tags: [] },
  { id: 'medical_chart', name: { target: 'el expediente medico', native: 'medical chart' }, location: 'exam_room', tags: [] },
  { id: 'prescription_pad', name: { target: 'el recetario', native: 'prescription pad' }, location: 'exam_room', tags: [] },
  { id: 'prescription', name: { target: 'la receta medica', native: 'prescription' }, location: 'exam_room', tags: ['takeable'] },
  { id: 'anatomy_poster', name: { target: 'el cartel de anatomia', native: 'anatomy poster' }, location: 'exam_room', tags: [] },

  // Pharmacy
  { id: 'pharmacy_counter', name: { target: 'el mostrador de la farmacia', native: 'pharmacy counter' }, location: 'pharmacy', tags: [] },
  { id: 'medicine_shelf', name: { target: 'el estante de medicinas', native: 'medicine shelf' }, location: 'pharmacy', tags: [] },
  { id: 'pain_reliever', name: { target: 'el analgesico', native: 'pain reliever' }, location: 'pharmacy', tags: ['takeable', 'consumable'], needsEffect: { energy: 10 } },
  { id: 'antibiotic', name: { target: 'el antibiotico', native: 'antibiotic' }, location: 'pharmacy', tags: ['takeable', 'consumable', 'requires-prescription'] },
  { id: 'cough_syrup', name: { target: 'el jarabe para la tos', native: 'cough syrup' }, location: 'pharmacy', tags: ['takeable', 'consumable'] },
  { id: 'bandages', name: { target: 'las vendas', native: 'bandages' }, location: 'pharmacy', tags: ['takeable'] },
  { id: 'vitamins', name: { target: 'las vitaminas', native: 'vitamins' }, location: 'pharmacy', tags: ['takeable', 'consumable'], needsEffect: { energy: 5 } },
  { id: 'pharmacy_receipt', name: { target: 'el recibo de la farmacia', native: 'pharmacy receipt' }, location: 'pharmacy', tags: ['takeable'] },
];

// ============================================================================
// NPCs
// ============================================================================

const npcs: NPC[] = [
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

// ============================================================================
// GOALS (checkComplete uses new state model)
// ============================================================================

const goals: Goal[] = [
  {
    id: 'clinic_arrive',
    title: 'Arrive at the clinic',
    description: 'You are not feeling well. Go to the clinic to see a doctor.',
    hint: 'Try "Voy a la clinica" (I go to the clinic)',
    checkComplete: (state: GameState) => state.currentLocation === 'clinic_reception',
    nextGoalId: 'clinic_check_in',
  },
  {
    id: 'clinic_check_in',
    title: 'Check in at reception',
    description: 'Talk to the receptionist Maria and check in for your appointment. Give her your information.',
    hint: 'Try "Buenos dias" to greet, then "Tengo cita con el doctor" (I have an appointment with the doctor) or "Necesito ver a un medico" (I need to see a doctor)',
    checkComplete: (state: GameState) => state.completedGoals.includes('clinic_check_in'),
    nextGoalId: 'clinic_fill_form',
  },
  {
    id: 'clinic_fill_form',
    title: 'Fill out the registration form',
    description: 'Maria gave you a form. Fill it out with your information.',
    hint: 'Try "Lleno el formulario" (I fill out the form) or "Completo el formulario"',
    checkComplete: (state: GameState) => {
      const form = state.objects.find(o => o.id === 'registration_form');
      return (form !== undefined && form.tags.includes('filled')) ||
             state.completedGoals.includes('clinic_fill_form');
    },
    nextGoalId: 'clinic_wait',
  },
  {
    id: 'clinic_wait',
    title: 'Wait in the waiting room',
    description: 'Go to the waiting room and wait for your turn. Check the number display.',
    hint: 'Try "Voy a la sala de espera" (I go to the waiting room) and "Me siento" (I sit down)',
    checkComplete: (state: GameState) => {
      return state.currentLocation === 'waiting_room' ||
             state.completedGoals.includes('clinic_wait');
    },
    nextGoalId: 'clinic_enter_exam',
  },
  {
    id: 'clinic_enter_exam',
    title: 'Enter the exam room',
    description: 'Your number is called! Go to the exam room to see Dr. Garcia.',
    hint: 'Try "Voy al consultorio" (I go to the exam room) or "Entro al consultorio"',
    checkComplete: (state: GameState) => state.currentLocation === 'exam_room',
    nextGoalId: 'clinic_describe_symptoms',
  },
  {
    id: 'clinic_describe_symptoms',
    title: 'Describe your symptoms to the doctor',
    description: 'Tell Dr. Garcia what hurts. Use "me duele" (it hurts me) or "tengo" expressions.',
    hint: 'Try "Me duele la cabeza" (My head hurts), "Tengo fiebre" (I have a fever), or "Me duele el estomago" (My stomach hurts)',
    checkComplete: (state: GameState) => state.completedGoals.includes('clinic_describe_symptoms'),
    nextGoalId: 'clinic_follow_commands',
  },
  {
    id: 'clinic_follow_commands',
    title: 'Follow the doctor\'s commands',
    description: 'Dr. Garcia needs to examine you. Follow his instructions carefully.',
    hint: 'The doctor may say "Abra la boca" (Open your mouth), "Respire profundo" (Breathe deeply), "Saque la lengua" (Stick out your tongue). Respond with "Si, doctor" or perform the action.',
    checkComplete: (state: GameState) => state.completedGoals.includes('clinic_follow_commands'),
    nextGoalId: 'clinic_get_prescription',
  },
  {
    id: 'clinic_get_prescription',
    title: 'Get your prescription',
    description: 'The doctor has diagnosed you. Take the prescription he writes for you.',
    hint: 'Try "Tomo la receta" (I take the prescription) or wait for the doctor to give it to you',
    checkComplete: (state: GameState) => {
      const prescription = state.objects.find(o => o.id === 'prescription');
      return (prescription !== undefined && prescription.location === 'inventory') ||
             state.completedGoals.includes('clinic_get_prescription');
    },
    nextGoalId: 'clinic_go_pharmacy',
  },
  {
    id: 'clinic_go_pharmacy',
    title: 'Go to the pharmacy',
    description: 'Take your prescription to the pharmacy to get your medicine.',
    hint: 'Try "Voy a la farmacia" (I go to the pharmacy)',
    checkComplete: (state: GameState) => state.currentLocation === 'pharmacy',
    nextGoalId: 'clinic_get_medicine',
  },
  {
    id: 'clinic_get_medicine',
    title: 'Get your medicine',
    description: 'Give your prescription to Roberto the pharmacist and get your medicine. Ask about how to take it.',
    hint: 'Try "Aqui esta mi receta" (Here is my prescription) or "Necesito esta medicina" (I need this medicine). Ask "Como lo tomo?" (How do I take it?)',
    checkComplete: (state: GameState) => {
      return state.completedGoals.includes('clinic_get_medicine') ||
             state.objects.some(o =>
               (o.id === 'pain_reliever' || o.id === 'antibiotic' || o.id === 'cough_syrup') &&
               o.location === 'inventory'
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

// ============================================================================
// VOCABULARY
// ============================================================================

const vocabulary: VocabWord[] = [
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

// ============================================================================
// MODULE EXPORT
// ============================================================================

export const clinicModule: ModuleDefinition = {
  name: 'clinic',
  displayName: 'Clinic',
  locations,
  objects,
  npcs,
  goals,
  vocabulary,
  startLocationId: 'clinic_reception',
  startGoalId: 'clinic_arrive',
  locationIds: Object.keys(locations),
  unlockLevel: 5,

  guidance: `CLINIC ENVIRONMENT:
A small medical clinic with reception, waiting room, exam room, and pharmacy.
The player is feeling unwell and learning medical vocabulary, symptom descriptions,
and formal "usted" commands used in medical settings.

LANGUAGE FOCUS:
All NPCs use formal "usted" register. This is a key teaching opportunity.
- "Me duele..." (My ... hurts) -- "Me duele la cabeza" (My head hurts)
- "Me duelen..." (plural) -- "Me duelen los ojos" (My eyes hurt)
- "Tengo..." (I have...) -- "Tengo fiebre" (fever), "Tengo tos" (cough), "Tengo nauseas" (nausea)
- "Estoy..." (I am...) -- "Estoy enfermo/a" (sick), "Estoy mareado/a" (dizzy)
- "No me siento bien" (I don't feel well), "Me siento mal" (I feel bad)
- Formal commands (usted): "Abra" (Open), "Respire" (Breathe), "Saque" (Stick out)

SYMPTOM EXPRESSIONS the player may use:
Body pain ("me duele"): la cabeza (head), el estomago (stomach), la espalda (back),
la garganta (throat), el oido (ear), la muela (tooth), el pecho (chest), el brazo (arm), la pierna (leg).
Conditions ("tengo"): fiebre (fever), tos (cough), un resfriado (cold), gripe (flu),
nauseas (nausea), mareos (dizziness), escalofrios (chills), alergias (allergies).
States ("estoy"): enfermo/a (sick), mareado/a (dizzy), cansado/a (tired), congestionado/a (congested).

DOCTOR COMMANDS the AI should use during examination:
"Abra la boca" (Open your mouth), "Saque la lengua" (Stick out your tongue),
"Respire profundo" (Breathe deeply), "Contenga la respiracion" (Hold your breath),
"Tosa" (Cough), "Subase la manga" (Roll up your sleeve),
"Sientese en la camilla" (Sit on the exam table), "Acuestese" (Lie down),
"Relajese" (Relax), "Mire hacia arriba" (Look up), "Diga ah" (Say ah).

OBJECTS:
- registration_form: In reception. Filling it out = add "filled" tag. Player uses pen to complete it.
- health_insurance_card: In reception. Takeable. Given to receptionist during check-in.
- pen: In reception. Used to fill out form.
- clinic_brochure: In reception. Readable for flavor.
- waiting_chair: In waiting room. Player sits here while waiting.
- water_cooler: In waiting room. Consumable, gives small hunger relief.
- number_display: In waiting room. Shows turn numbers. Flavor object.
- exam_table (la camilla): In exam room. Player sits/lies on it during examination.
- blood_pressure_monitor, stethoscope, thermometer, scale: Medical equipment in exam room.
  These are used by the doctor during examination -- flavor objects the player can look at.
- medical_chart: In exam room. Doctor records symptoms here.
- prescription: In exam room. Takeable. Doctor writes it after diagnosis. Move to "inventory" when taken.
- pain_reliever: In pharmacy. Takeable, consumable. Gives energy +10.
- antibiotic: In pharmacy. Has "requires-prescription" tag. Only dispensed with prescription.
- cough_syrup: In pharmacy. Takeable, consumable.
- vitamins: In pharmacy. Takeable, consumable. Gives energy +5.
- bandages: In pharmacy. Takeable.

NPCs:
- Maria (receptionist): In clinic_reception. Professional, formal "usted".
  Asks "Tiene cita?", "Cual es su nombre?", "Tiene seguro medico?".
  Gives registration form. Tells player to wait: "Tome asiento en la sala de espera."
  Checking in = talk to her and provide information. Complete goal "clinic_check_in" after successful check-in.
- Dr. Garcia (doctor): In exam_room. Kind and thorough, formal "usted".
  Asks "Que le pasa?", "Donde le duele?", "Desde cuando tiene estos sintomas?".
  Gives examination commands (see DOCTOR COMMANDS above).
  After examination, explains diagnosis and writes prescription.
  Complete "clinic_describe_symptoms" when player describes at least one symptom.
  Complete "clinic_follow_commands" when player follows at least 2 examination commands.
  Complete "clinic_get_prescription" when prescription moves to inventory.
- Roberto (pharmacist): In pharmacy. Friendly, explains dosage instructions.
  Asks "Tiene la receta?" (Do you have the prescription?).
  Explains: "Tome una pastilla cada ocho horas", "Con comida", "Antes de acostarse".
  Dispenses medicine after seeing prescription. Move medicine to inventory.
  Complete "clinic_get_medicine" when player receives medicine in inventory.

PRESCRIPTION FLOW:
1. Doctor diagnoses patient and writes prescription (tag add "written" to prescription)
2. Player takes prescription (move prescription to "inventory")
3. Player goes to pharmacy and shows prescription to Roberto
4. Roberto dispenses appropriate medicine (move medicine to "inventory")
5. Roberto explains dosage instructions

GOAL COMPLETION:
- clinic_arrive: Player is in clinic_reception
- clinic_check_in: Player talks to Maria and checks in
- clinic_fill_form: registration_form has "filled" tag
- clinic_wait: Player is in waiting_room
- clinic_enter_exam: Player is in exam_room
- clinic_describe_symptoms: Player describes symptoms to Dr. Garcia
- clinic_follow_commands: Player follows doctor examination commands
- clinic_get_prescription: prescription is in inventory
- clinic_go_pharmacy: Player is in pharmacy
- clinic_get_medicine: Medicine (pain_reliever, antibiotic, or cough_syrup) is in inventory`,
};
