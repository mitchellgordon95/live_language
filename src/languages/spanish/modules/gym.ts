// /Users/mitchg/Desktop/language/src/data/gym-module.ts

import type { Location, Goal, VocabWord, GameState, NPC, ModuleDefinition } from '../../../engine/types.js';

// ============================================================================
// GYM LOCATIONS
// ============================================================================

export const gymEntrance: Location = {
  id: 'gym_entrance',
  name: { target: 'la entrada del gimnasio', native: 'gym entrance' },
  objects: [
    {
      id: 'reception_desk',
      name: { target: 'el mostrador de recepcion', native: 'reception desk' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'membership_card_scanner',
      name: { target: 'el lector de tarjetas', native: 'card scanner' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'gym_rules_poster',
      name: { target: 'el cartel de reglas', native: 'rules poster' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'water_fountain',
      name: { target: 'la fuente de agua', native: 'water fountain' },
      state: {},
      actions: ['USE', 'DRINK'],
      consumable: true,
      needsEffect: { energy: 5 },
    },
    {
      id: 'gym_bag',
      name: { target: 'la bolsa de gimnasio', native: 'gym bag' },
      state: { packed: true },
      actions: ['TAKE', 'OPEN'],
      takeable: true,
    },
  ],
  exits: [
    { to: 'stretching_area', name: { target: 'la zona de estiramiento', native: 'stretching area' } },
    { to: 'locker_room', name: { target: 'el vestuario', native: 'locker room' } },
    { to: 'street', name: { target: 'la calle', native: 'street' } },
  ],
};

export const stretchingArea: Location = {
  id: 'stretching_area',
  name: { target: 'la zona de estiramiento', native: 'stretching area' },
  objects: [
    {
      id: 'yoga_mat',
      name: { target: 'la colchoneta de yoga', native: 'yoga mat' },
      state: { inUse: false },
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'foam_roller',
      name: { target: 'el rodillo de espuma', native: 'foam roller' },
      state: {},
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'resistance_bands',
      name: { target: 'las bandas elasticas', native: 'resistance bands' },
      state: {},
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'stretching_mirror',
      name: { target: 'el espejo', native: 'mirror' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'stability_ball',
      name: { target: 'la pelota de estabilidad', native: 'stability ball' },
      state: {},
      actions: ['USE'],
    },
  ],
  exits: [
    { to: 'gym_entrance', name: { target: 'la entrada', native: 'entrance' } },
    { to: 'training_floor', name: { target: 'la zona de entrenamiento', native: 'training floor' } },
    { to: 'cardio_zone', name: { target: 'la zona de cardio', native: 'cardio zone' } },
  ],
};

export const trainingFloor: Location = {
  id: 'training_floor',
  name: { target: 'la zona de entrenamiento', native: 'training floor' },
  objects: [
    {
      id: 'training_bench',
      name: { target: 'el banco de entrenamiento', native: 'training bench' },
      state: { inUse: false },
      actions: ['USE'],
    },
    {
      id: 'pull_up_bar',
      name: { target: 'la barra de dominadas', native: 'pull-up bar' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'kettlebells',
      name: { target: 'las pesas rusas', native: 'kettlebells' },
      state: {},
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'jump_rope',
      name: { target: 'la cuerda de saltar', native: 'jump rope' },
      state: {},
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'exercise_clock',
      name: { target: 'el reloj de ejercicios', native: 'exercise timer' },
      state: { running: false },
      actions: ['TURN_ON', 'TURN_OFF', 'LOOK'],
    },
  ],
  exits: [
    { to: 'stretching_area', name: { target: 'la zona de estiramiento', native: 'stretching area' } },
    { to: 'weight_room', name: { target: 'la sala de pesas', native: 'weight room' } },
    { to: 'cardio_zone', name: { target: 'la zona de cardio', native: 'cardio zone' } },
  ],
};

export const weightRoom: Location = {
  id: 'weight_room',
  name: { target: 'la sala de pesas', native: 'weight room' },
  objects: [
    {
      id: 'dumbbells',
      name: { target: 'las mancuernas', native: 'dumbbells' },
      state: { weight: 10 },
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'barbell',
      name: { target: 'la barra con pesas', native: 'barbell' },
      state: { weight: 20 },
      actions: ['USE'],
    },
    {
      id: 'weight_rack',
      name: { target: 'el estante de pesas', native: 'weight rack' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'bench_press',
      name: { target: 'el banco de press', native: 'bench press' },
      state: { inUse: false },
      actions: ['USE'],
    },
    {
      id: 'squat_rack',
      name: { target: 'el rack de sentadillas', native: 'squat rack' },
      state: { inUse: false },
      actions: ['USE'],
    },
    {
      id: 'leg_press_machine',
      name: { target: 'la maquina de prensa de piernas', native: 'leg press machine' },
      state: { inUse: false },
      actions: ['USE'],
    },
    {
      id: 'cable_machine',
      name: { target: 'la maquina de poleas', native: 'cable machine' },
      state: { inUse: false },
      actions: ['USE'],
    },
  ],
  exits: [
    { to: 'training_floor', name: { target: 'la zona de entrenamiento', native: 'training floor' } },
    { to: 'cardio_zone', name: { target: 'la zona de cardio', native: 'cardio zone' } },
    { to: 'stretching_area', name: { target: 'la zona de estiramiento', native: 'stretching area' } },
    { to: 'locker_room', name: { target: 'el vestuario', native: 'locker room' } },
  ],
};

export const cardioZone: Location = {
  id: 'cardio_zone',
  name: { target: 'la zona de cardio', native: 'cardio zone' },
  objects: [
    {
      id: 'treadmill',
      name: { target: 'la cinta de correr', native: 'treadmill' },
      state: { on: false, speed: 0, inUse: false },
      actions: ['USE', 'TURN_ON', 'TURN_OFF'],
    },
    {
      id: 'stationary_bike',
      name: { target: 'la bicicleta estatica', native: 'stationary bike' },
      state: { inUse: false },
      actions: ['USE'],
    },
    {
      id: 'elliptical',
      name: { target: 'la eliptica', native: 'elliptical' },
      state: { inUse: false },
      actions: ['USE'],
    },
    {
      id: 'rowing_machine',
      name: { target: 'la maquina de remo', native: 'rowing machine' },
      state: { inUse: false },
      actions: ['USE'],
    },
    {
      id: 'tv_screen',
      name: { target: 'la pantalla de television', native: 'TV screen' },
      state: { on: true },
      actions: ['LOOK'],
    },
    {
      id: 'fan',
      name: { target: 'el ventilador', native: 'fan' },
      state: { on: false },
      actions: ['TURN_ON', 'TURN_OFF'],
    },
  ],
  exits: [
    { to: 'training_floor', name: { target: 'la zona de entrenamiento', native: 'training floor' } },
    { to: 'weight_room', name: { target: 'la sala de pesas', native: 'weight room' } },
    { to: 'stretching_area', name: { target: 'la zona de estiramiento', native: 'stretching area' } },
    { to: 'locker_room', name: { target: 'el vestuario', native: 'locker room' } },
  ],
};

export const lockerRoom: Location = {
  id: 'locker_room',
  name: { target: 'el vestuario', native: 'locker room' },
  objects: [
    {
      id: 'locker',
      name: { target: 'el casillero', native: 'locker' },
      state: { open: false, locked: false },
      actions: ['OPEN', 'CLOSE', 'USE'],
    },
    {
      id: 'gym_shower',
      name: { target: 'la ducha', native: 'shower' },
      state: { on: false },
      actions: ['USE'],
    },
    {
      id: 'changing_bench',
      name: { target: 'el banco de vestidor', native: 'changing bench' },
      state: {},
      actions: [],
    },
    {
      id: 'gym_towel',
      name: { target: 'la toalla', native: 'towel' },
      state: {},
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'water_bottle',
      name: { target: 'la botella de agua', native: 'water bottle' },
      state: { filled: true },
      actions: ['TAKE', 'DRINK'],
      takeable: true,
      consumable: true,
      needsEffect: { energy: 10 },
    },
    {
      id: 'scale',
      name: { target: 'la bascula', native: 'scale' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'gym_mirror',
      name: { target: 'el espejo', native: 'mirror' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'gym_entrance', name: { target: 'la entrada', native: 'entrance' } },
    { to: 'weight_room', name: { target: 'la sala de pesas', native: 'weight room' } },
    { to: 'cardio_zone', name: { target: 'la zona de cardio', native: 'cardio zone' } },
  ],
};

export const gymLocations: Record<string, Location> = {
  gym_entrance: gymEntrance,
  stretching_area: stretchingArea,
  training_floor: trainingFloor,
  weight_room: weightRoom,
  cardio_zone: cardioZone,
  locker_room: lockerRoom,
};

// ============================================================================
// GYM NPCs
// ============================================================================

export const gymNPCs: NPC[] = [
  {
    id: 'receptionist_ana',
    name: { target: 'Ana', native: 'Ana' },
    location: 'gym_entrance',
    personality: 'Friendly and energetic receptionist. Greets members with enthusiasm. Checks membership cards and answers questions about classes and schedules. Uses informal "tu" with regulars. Key phrases: "Bienvenido al gimnasio!" (Welcome to the gym!), "Tu tarjeta, por favor" (Your card, please), "Hay una clase de yoga a las diez" (There is a yoga class at ten).',
    gender: 'female',
  },
  {
    id: 'trainer_marco',
    name: { target: 'Marco', native: 'Marco' },
    location: 'training_floor',
    personality: 'Motivational and knowledgeable personal trainer. Uses imperative commands during training: "Levanta!" (Lift!), "Respira!" (Breathe!), "Descansa!" (Rest!). Counts reps in Spanish. Encourages proper form. Mix of formal and informal depending on context. Will demonstrate exercises and give tips. Enthusiastic about fitness.',
    gender: 'male',
  },
  {
    id: 'member_sofia',
    name: { target: 'Sofia', native: 'Sofia' },
    location: 'cardio_zone',
    personality: 'Regular gym member, friendly and chatty. On the elliptical when you arrive. Happy to share gym tips and talk about her workout routine. Uses casual speech. Talks about frequency: "Vengo tres veces a la semana" (I come three times a week). Will ask about your fitness goals.',
    gender: 'female',
  },
];

// Extended NPC state for gym interactions
export interface GymNPCState {
  mood: string;
  lastResponse?: string;
  // Receptionist-specific
  hasCheckedIn?: boolean;
  hasGivenTour?: boolean;
  // Trainer-specific
  isTraining?: boolean;
  currentExercise?: string;
  repCount?: number;
  setCount?: number;
  // Member-specific
  hasIntroduced?: boolean;
  sharedTips?: boolean;
}

export function getGymNPCsInLocation(locationId: string): NPC[] {
  return gymNPCs.filter(npc => npc.location === locationId);
}

// ============================================================================
// GYM GOALS
// ============================================================================

export const gymGoals: Goal[] = [
  {
    id: 'gym_check_in',
    title: 'Check in at the gym',
    description: 'You\'ve arrived at the gym! Check in with Ana at the reception desk.',
    hint: 'Try "Hola, buenos dias" to greet Ana, then show your card: "Aqui esta mi tarjeta"',
    checkComplete: (state: GameState) =>
      state.location.id === 'gym_entrance' &&
      (state.completedGoals.includes('checked_in') ||
       state.completedGoals.includes('gym_check_in')),
    nextGoalId: 'gym_warm_up',
  },
  {
    id: 'gym_warm_up',
    title: 'Warm up in the stretching area',
    description: 'Before exercising, you need to warm up. Go to the stretching area and do some stretches.',
    hint: 'Try "Voy a la zona de estiramiento" then "Me estiro" (I stretch) or "Uso la colchoneta"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('warmed_up') ||
      state.completedGoals.includes('stretched') ||
      state.completedGoals.includes('gym_warm_up'),
    nextGoalId: 'gym_follow_trainer',
  },
  {
    id: 'gym_follow_trainer',
    title: 'Train with Marco',
    description: 'Find trainer Marco on the training floor and follow his exercise commands. Listen for imperatives!',
    hint: 'Go to training floor with "Voy a la zona de entrenamiento". Follow commands like "Levanta los brazos!" (Raise your arms!). Respond with "Levanto los brazos"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('followed_trainer') ||
      state.completedGoals.includes('completed_exercise') ||
      state.completedGoals.includes('gym_follow_trainer'),
    nextGoalId: 'gym_cardio',
  },
  {
    id: 'gym_cardio',
    title: 'Do cardio exercise',
    description: 'Get your heart pumping! Use the treadmill or bike in the cardio zone. Chat with Sofia about her routine.',
    hint: 'Try "Uso la cinta de correr" (I use the treadmill) or "Corro en la cinta" (I run on the treadmill). Ask Sofia "Con que frecuencia vienes?" (How often do you come?)',
    checkComplete: (state: GameState) => {
      const treadmill = state.location.objects.find(o => o.id === 'treadmill');
      const bike = state.location.objects.find(o => o.id === 'stationary_bike');
      return treadmill?.state.inUse === true ||
             bike?.state.inUse === true ||
             state.completedGoals.includes('did_cardio') ||
             state.completedGoals.includes('gym_cardio');
    },
    nextGoalId: 'gym_weights',
  },
  {
    id: 'gym_weights',
    title: 'Lift weights',
    description: 'Build strength in the weight room. Use the dumbbells or machines.',
    hint: 'Try "Levanto las mancuernas" (I lift the dumbbells) or "Hago diez repeticiones" (I do ten repetitions)',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('lifted_weights') ||
      state.completedGoals.includes('used_weights') ||
      state.completedGoals.includes('gym_weights'),
    nextGoalId: 'gym_cool_down',
  },
  {
    id: 'gym_cool_down',
    title: 'Cool down and finish',
    description: 'Great workout! Cool down with stretches, then shower and change in the locker room.',
    hint: 'Try "Me estiro" to stretch, then "Voy al vestuario" and "Me ducho" (I shower)',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('cooled_down') ||
      state.completedGoals.includes('showered') ||
      state.completedGoals.includes('gym_cool_down'),
    nextGoalId: 'gym_complete',
  },
  {
    id: 'gym_complete',
    title: 'Workout complete!',
    description: 'Felicidades! You completed a full workout in Spanish. You learned body parts, exercise verbs, imperatives, and how to talk about frequency.',
    checkComplete: (state: GameState) => state.completedGoals.includes('gym_cool_down'),
  },
];

export function getGymGoalById(id: string): Goal | undefined {
  return gymGoals.find(g => g.id === id);
}

export function getGymStartGoal(): Goal {
  return gymGoals[0];
}

// ============================================================================
// GYM VOCABULARY
// ============================================================================

export const gymVocabulary: VocabWord[] = [
  // ---- GYM LOCATIONS ----
  { target: 'el gimnasio', native: 'gym', category: 'noun', gender: 'masculine' },
  { target: 'la entrada', native: 'entrance', category: 'noun', gender: 'feminine' },
  { target: 'la zona de estiramiento', native: 'stretching area', category: 'noun', gender: 'feminine' },
  { target: 'la zona de entrenamiento', native: 'training floor', category: 'noun', gender: 'feminine' },
  { target: 'la sala de pesas', native: 'weight room', category: 'noun', gender: 'feminine' },
  { target: 'la zona de cardio', native: 'cardio zone', category: 'noun', gender: 'feminine' },
  { target: 'el vestuario', native: 'locker room', category: 'noun', gender: 'masculine' },

  // ---- EQUIPMENT ----
  // Stretching equipment
  { target: 'la colchoneta', native: 'mat', category: 'noun', gender: 'feminine' },
  { target: 'la colchoneta de yoga', native: 'yoga mat', category: 'noun', gender: 'feminine' },
  { target: 'el rodillo de espuma', native: 'foam roller', category: 'noun', gender: 'masculine' },
  { target: 'las bandas elasticas', native: 'resistance bands', category: 'noun', gender: 'feminine' },
  { target: 'la pelota de estabilidad', native: 'stability ball', category: 'noun', gender: 'feminine' },
  { target: 'la cuerda de saltar', native: 'jump rope', category: 'noun', gender: 'feminine' },

  // Weights
  { target: 'las pesas', native: 'weights', category: 'noun', gender: 'feminine' },
  { target: 'las mancuernas', native: 'dumbbells', category: 'noun', gender: 'feminine' },
  { target: 'la barra', native: 'barbell', category: 'noun', gender: 'feminine' },
  { target: 'la barra con pesas', native: 'barbell with weights', category: 'noun', gender: 'feminine' },
  { target: 'las pesas rusas', native: 'kettlebells', category: 'noun', gender: 'feminine' },
  { target: 'el estante de pesas', native: 'weight rack', category: 'noun', gender: 'masculine' },
  { target: 'el banco de press', native: 'bench press', category: 'noun', gender: 'masculine' },
  { target: 'el rack de sentadillas', native: 'squat rack', category: 'noun', gender: 'masculine' },

  // Cardio machines
  { target: 'la cinta de correr', native: 'treadmill', category: 'noun', gender: 'feminine' },
  { target: 'la bicicleta estatica', native: 'stationary bike', category: 'noun', gender: 'feminine' },
  { target: 'la eliptica', native: 'elliptical', category: 'noun', gender: 'feminine' },
  { target: 'la maquina de remo', native: 'rowing machine', category: 'noun', gender: 'feminine' },

  // Other equipment
  { target: 'la maquina', native: 'machine', category: 'noun', gender: 'feminine' },
  { target: 'la maquina de poleas', native: 'cable machine', category: 'noun', gender: 'feminine' },
  { target: 'la maquina de prensa de piernas', native: 'leg press machine', category: 'noun', gender: 'feminine' },
  { target: 'la barra de dominadas', native: 'pull-up bar', category: 'noun', gender: 'feminine' },
  { target: 'el banco de entrenamiento', native: 'training bench', category: 'noun', gender: 'masculine' },

  // Locker room items
  { target: 'el casillero', native: 'locker', category: 'noun', gender: 'masculine' },
  { target: 'la ducha', native: 'shower', category: 'noun', gender: 'feminine' },
  { target: 'la toalla', native: 'towel', category: 'noun', gender: 'feminine' },
  { target: 'la botella de agua', native: 'water bottle', category: 'noun', gender: 'feminine' },
  { target: 'la bascula', native: 'scale', category: 'noun', gender: 'feminine' },
  { target: 'la bolsa de gimnasio', native: 'gym bag', category: 'noun', gender: 'feminine' },

  // ---- BODY PARTS ----
  { target: 'el cuerpo', native: 'body', category: 'noun', gender: 'masculine' },
  { target: 'la cabeza', native: 'head', category: 'noun', gender: 'feminine' },
  { target: 'el cuello', native: 'neck', category: 'noun', gender: 'masculine' },
  { target: 'los hombros', native: 'shoulders', category: 'noun', gender: 'masculine' },
  { target: 'el hombro', native: 'shoulder', category: 'noun', gender: 'masculine' },
  { target: 'los brazos', native: 'arms', category: 'noun', gender: 'masculine' },
  { target: 'el brazo', native: 'arm', category: 'noun', gender: 'masculine' },
  { target: 'el codo', native: 'elbow', category: 'noun', gender: 'masculine' },
  { target: 'las manos', native: 'hands', category: 'noun', gender: 'feminine' },
  { target: 'la mano', native: 'hand', category: 'noun', gender: 'feminine' },
  { target: 'los dedos', native: 'fingers', category: 'noun', gender: 'masculine' },
  { target: 'el pecho', native: 'chest', category: 'noun', gender: 'masculine' },
  { target: 'la espalda', native: 'back', category: 'noun', gender: 'feminine' },
  { target: 'el estomago', native: 'stomach', category: 'noun', gender: 'masculine' },
  { target: 'los abdominales', native: 'abs', category: 'noun', gender: 'masculine' },
  { target: 'la cintura', native: 'waist', category: 'noun', gender: 'feminine' },
  { target: 'las caderas', native: 'hips', category: 'noun', gender: 'feminine' },
  { target: 'las piernas', native: 'legs', category: 'noun', gender: 'feminine' },
  { target: 'la pierna', native: 'leg', category: 'noun', gender: 'feminine' },
  { target: 'el muslo', native: 'thigh', category: 'noun', gender: 'masculine' },
  { target: 'la rodilla', native: 'knee', category: 'noun', gender: 'feminine' },
  { target: 'la pantorrilla', native: 'calf', category: 'noun', gender: 'feminine' },
  { target: 'los pies', native: 'feet', category: 'noun', gender: 'masculine' },
  { target: 'el pie', native: 'foot', category: 'noun', gender: 'masculine' },
  { target: 'los musculos', native: 'muscles', category: 'noun', gender: 'masculine' },
  { target: 'el musculo', native: 'muscle', category: 'noun', gender: 'masculine' },
  { target: 'los biceps', native: 'biceps', category: 'noun', gender: 'masculine' },
  { target: 'los triceps', native: 'triceps', category: 'noun', gender: 'masculine' },
  { target: 'los gluteos', native: 'glutes', category: 'noun', gender: 'masculine' },

  // ---- EXERCISE VERBS (Infinitive + Yo forms) ----
  // Core exercise verbs
  { target: 'ejercitar', native: 'to exercise', category: 'verb' },
  { target: 'ejercito', native: 'I exercise', category: 'verb' },
  { target: 'entrenar', native: 'to train', category: 'verb' },
  { target: 'entreno', native: 'I train', category: 'verb' },
  { target: 'hacer ejercicio', native: 'to exercise/work out', category: 'verb' },
  { target: 'hago ejercicio', native: 'I exercise/work out', category: 'verb' },

  // Movement verbs
  { target: 'correr', native: 'to run', category: 'verb' },
  { target: 'corro', native: 'I run', category: 'verb' },
  { target: 'caminar', native: 'to walk', category: 'verb' },
  { target: 'camino', native: 'I walk', category: 'verb' },
  { target: 'saltar', native: 'to jump', category: 'verb' },
  { target: 'salto', native: 'I jump', category: 'verb' },
  { target: 'nadar', native: 'to swim', category: 'verb' },
  { target: 'nado', native: 'I swim', category: 'verb' },

  // Strength verbs
  { target: 'levantar', native: 'to lift', category: 'verb' },
  { target: 'levanto', native: 'I lift', category: 'verb' },
  { target: 'empujar', native: 'to push', category: 'verb' },
  { target: 'empujo', native: 'I push', category: 'verb' },
  { target: 'jalar', native: 'to pull', category: 'verb' },
  { target: 'jalo', native: 'I pull', category: 'verb' },
  { target: 'tirar', native: 'to pull', category: 'verb' },
  { target: 'tiro', native: 'I pull', category: 'verb' },
  { target: 'cargar', native: 'to carry/lift', category: 'verb' },
  { target: 'cargo', native: 'I carry/lift', category: 'verb' },

  // Position verbs
  { target: 'agachar', native: 'to squat/crouch', category: 'verb' },
  { target: 'me agacho', native: 'I squat/crouch', category: 'verb' },
  { target: 'doblar', native: 'to bend', category: 'verb' },
  { target: 'doblo', native: 'I bend', category: 'verb' },
  { target: 'girar', native: 'to rotate/turn', category: 'verb' },
  { target: 'giro', native: 'I rotate/turn', category: 'verb' },
  { target: 'inclinar', native: 'to lean/tilt', category: 'verb' },
  { target: 'me inclino', native: 'I lean/tilt', category: 'verb' },

  // ---- REFLEXIVE FITNESS VERBS ----
  { target: 'estirarse', native: 'to stretch', category: 'verb' },
  { target: 'me estiro', native: 'I stretch', category: 'verb' },
  { target: 'calentarse', native: 'to warm up', category: 'verb' },
  { target: 'me caliento', native: 'I warm up', category: 'verb' },
  { target: 'relajarse', native: 'to relax', category: 'verb' },
  { target: 'me relajo', native: 'I relax', category: 'verb' },
  { target: 'ducharse', native: 'to shower', category: 'verb' },
  { target: 'me ducho', native: 'I shower', category: 'verb' },
  { target: 'cambiarse', native: 'to change (clothes)', category: 'verb' },
  { target: 'me cambio', native: 'I change', category: 'verb' },
  { target: 'sentarse', native: 'to sit down', category: 'verb' },
  { target: 'me siento', native: 'I sit down', category: 'verb' },
  { target: 'pararse', native: 'to stand up', category: 'verb' },
  { target: 'me paro', native: 'I stand up', category: 'verb' },
  { target: 'acostarse', native: 'to lie down', category: 'verb' },
  { target: 'me acuesto', native: 'I lie down', category: 'verb' },
  { target: 'cansarse', native: 'to get tired', category: 'verb' },
  { target: 'me canso', native: 'I get tired', category: 'verb' },

  // ---- IMPERATIVE COMMANDS (Trainer uses these) ----
  // Informal tu imperatives
  { target: 'levanta', native: 'lift! (informal)', category: 'verb' },
  { target: 'baja', native: 'lower! (informal)', category: 'verb' },
  { target: 'empuja', native: 'push! (informal)', category: 'verb' },
  { target: 'jala', native: 'pull! (informal)', category: 'verb' },
  { target: 'corre', native: 'run! (informal)', category: 'verb' },
  { target: 'camina', native: 'walk! (informal)', category: 'verb' },
  { target: 'salta', native: 'jump! (informal)', category: 'verb' },
  { target: 'para', native: 'stop! (informal)', category: 'verb' },
  { target: 'respira', native: 'breathe! (informal)', category: 'verb' },
  { target: 'descansa', native: 'rest! (informal)', category: 'verb' },
  { target: 'estirate', native: 'stretch! (informal)', category: 'verb' },
  { target: 'dobla', native: 'bend! (informal)', category: 'verb' },
  { target: 'gira', native: 'turn! (informal)', category: 'verb' },
  { target: 'aguanta', native: 'hold! (informal)', category: 'verb' },
  { target: 'aprieta', native: 'squeeze! (informal)', category: 'verb' },
  { target: 'repite', native: 'repeat! (informal)', category: 'verb' },
  { target: 'continua', native: 'continue! (informal)', category: 'verb' },
  { target: 'mas rapido', native: 'faster!', category: 'other' },
  { target: 'mas lento', native: 'slower!', category: 'other' },
  { target: 'otra vez', native: 'again!', category: 'other' },

  // ---- FREQUENCY WORDS ----
  { target: 'siempre', native: 'always', category: 'other' },
  { target: 'nunca', native: 'never', category: 'other' },
  { target: 'a veces', native: 'sometimes', category: 'other' },
  { target: 'frecuentemente', native: 'frequently', category: 'other' },
  { target: 'a menudo', native: 'often', category: 'other' },
  { target: 'raramente', native: 'rarely', category: 'other' },
  { target: 'cada dia', native: 'every day', category: 'other' },
  { target: 'todos los dias', native: 'every day', category: 'other' },
  { target: 'una vez', native: 'once', category: 'other' },
  { target: 'dos veces', native: 'twice', category: 'other' },
  { target: 'tres veces', native: 'three times', category: 'other' },
  { target: 'una vez a la semana', native: 'once a week', category: 'other' },
  { target: 'dos veces a la semana', native: 'twice a week', category: 'other' },
  { target: 'tres veces a la semana', native: 'three times a week', category: 'other' },
  { target: 'por semana', native: 'per week', category: 'other' },
  { target: 'cada semana', native: 'every week', category: 'other' },
  { target: 'al dia', native: 'per day', category: 'other' },

  // ---- EXERCISE TERMINOLOGY ----
  { target: 'la repeticion', native: 'repetition', category: 'noun', gender: 'feminine' },
  { target: 'las repeticiones', native: 'repetitions/reps', category: 'noun', gender: 'feminine' },
  { target: 'la serie', native: 'set', category: 'noun', gender: 'feminine' },
  { target: 'las series', native: 'sets', category: 'noun', gender: 'feminine' },
  { target: 'el descanso', native: 'rest', category: 'noun', gender: 'masculine' },
  { target: 'el calentamiento', native: 'warm-up', category: 'noun', gender: 'masculine' },
  { target: 'el enfriamiento', native: 'cool-down', category: 'noun', gender: 'masculine' },
  { target: 'el entrenamiento', native: 'training/workout', category: 'noun', gender: 'masculine' },
  { target: 'el ejercicio', native: 'exercise', category: 'noun', gender: 'masculine' },
  { target: 'la rutina', native: 'routine', category: 'noun', gender: 'feminine' },
  { target: 'el peso', native: 'weight', category: 'noun', gender: 'masculine' },
  { target: 'la fuerza', native: 'strength', category: 'noun', gender: 'feminine' },
  { target: 'la resistencia', native: 'endurance/resistance', category: 'noun', gender: 'feminine' },
  { target: 'el cardio', native: 'cardio', category: 'noun', gender: 'masculine' },
  { target: 'la flexibilidad', native: 'flexibility', category: 'noun', gender: 'feminine' },
  { target: 'el equilibrio', native: 'balance', category: 'noun', gender: 'masculine' },
  { target: 'la postura', native: 'posture', category: 'noun', gender: 'feminine' },

  // ---- SPECIFIC EXERCISES ----
  { target: 'las sentadillas', native: 'squats', category: 'noun', gender: 'feminine' },
  { target: 'las flexiones', native: 'push-ups', category: 'noun', gender: 'feminine' },
  { target: 'los abdominales', native: 'crunches/sit-ups', category: 'noun', gender: 'masculine' },
  { target: 'las dominadas', native: 'pull-ups', category: 'noun', gender: 'feminine' },
  { target: 'las zancadas', native: 'lunges', category: 'noun', gender: 'feminine' },
  { target: 'la plancha', native: 'plank', category: 'noun', gender: 'feminine' },
  { target: 'el peso muerto', native: 'deadlift', category: 'noun', gender: 'masculine' },
  { target: 'el press de banca', native: 'bench press', category: 'noun', gender: 'masculine' },
  { target: 'el curl de biceps', native: 'bicep curl', category: 'noun', gender: 'masculine' },

  // ---- NUMBERS (for counting reps) ----
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
  { target: 'quince', native: 'fifteen', category: 'other' },
  { target: 'veinte', native: 'twenty', category: 'other' },

  // ---- PEOPLE ----
  { target: 'el entrenador', native: 'trainer (male)', category: 'noun', gender: 'masculine' },
  { target: 'la entrenadora', native: 'trainer (female)', category: 'noun', gender: 'feminine' },
  { target: 'el recepcionista', native: 'receptionist (male)', category: 'noun', gender: 'masculine' },
  { target: 'la recepcionista', native: 'receptionist (female)', category: 'noun', gender: 'feminine' },
  { target: 'el miembro', native: 'member', category: 'noun', gender: 'masculine' },
  { target: 'la miembro', native: 'member (female)', category: 'noun', gender: 'feminine' },
  { target: 'el socio', native: 'member/partner', category: 'noun', gender: 'masculine' },

  // ---- ADJECTIVES ----
  { target: 'fuerte', native: 'strong', category: 'adjective' },
  { target: 'debil', native: 'weak', category: 'adjective' },
  { target: 'cansado', native: 'tired (masc)', category: 'adjective' },
  { target: 'cansada', native: 'tired (fem)', category: 'adjective' },
  { target: 'energico', native: 'energetic (masc)', category: 'adjective' },
  { target: 'energica', native: 'energetic (fem)', category: 'adjective' },
  { target: 'rapido', native: 'fast (masc)', category: 'adjective' },
  { target: 'rapida', native: 'fast (fem)', category: 'adjective' },
  { target: 'lento', native: 'slow (masc)', category: 'adjective' },
  { target: 'lenta', native: 'slow (fem)', category: 'adjective' },
  { target: 'pesado', native: 'heavy (masc)', category: 'adjective' },
  { target: 'pesada', native: 'heavy (fem)', category: 'adjective' },
  { target: 'ligero', native: 'light (masc)', category: 'adjective' },
  { target: 'ligera', native: 'light (fem)', category: 'adjective' },
  { target: 'dificil', native: 'difficult', category: 'adjective' },
  { target: 'facil', native: 'easy', category: 'adjective' },
  { target: 'intenso', native: 'intense (masc)', category: 'adjective' },
  { target: 'intensa', native: 'intense (fem)', category: 'adjective' },
  { target: 'sudado', native: 'sweaty (masc)', category: 'adjective' },
  { target: 'sudada', native: 'sweaty (fem)', category: 'adjective' },

  // ---- COMMON PHRASES ----
  { target: 'bienvenido al gimnasio', native: 'welcome to the gym', category: 'other' },
  { target: 'tu tarjeta, por favor', native: 'your card, please', category: 'other' },
  { target: 'vamos!', native: 'let\'s go!', category: 'other' },
  { target: 'muy bien!', native: 'very good!', category: 'other' },
  { target: 'excelente!', native: 'excellent!', category: 'other' },
  { target: 'buen trabajo', native: 'good job', category: 'other' },
  { target: 'puedo usar...?', native: 'can I use...?', category: 'other' },
  { target: 'esta libre?', native: 'is this free/available?', category: 'other' },
  { target: 'cuantas repeticiones?', native: 'how many reps?', category: 'other' },
  { target: 'cuantas series?', native: 'how many sets?', category: 'other' },
  { target: 'con que frecuencia vienes?', native: 'how often do you come?', category: 'other' },
  { target: 'vengo tres veces a la semana', native: 'I come three times a week', category: 'other' },
  { target: 'necesito descansar', native: 'I need to rest', category: 'other' },
  { target: 'estoy cansado', native: 'I\'m tired (masc)', category: 'other' },
  { target: 'estoy cansada', native: 'I\'m tired (fem)', category: 'other' },
  { target: 'buena sesion!', native: 'good session!', category: 'other' },
];

import type { NPCDescription, ModuleInteraction, TeachingNotes } from '../../../engine/types.js';

const npcDescriptions: NPCDescription[] = [
  { id: 'receptionist_ana', personality: 'Friendly, energetic receptionist at gym_entrance. Uses informal "tu" with regulars.', keyPhrases: ['Bienvenido al gimnasio!', 'Tu tarjeta, por favor'] },
  { id: 'trainer_marco', personality: 'Motivational personal trainer on training_floor. Counts reps in Spanish. Enthusiastic about fitness.', keyPhrases: ['Levanta!', 'Respira!', 'Descansa!'] },
  { id: 'member_sofia', personality: 'Regular gym member in cardio_zone. Chatty and friendly. Happy to share tips.', keyPhrases: ['Vengo tres veces a la semana'] },
];

const interactions: ModuleInteraction[] = [
  { triggers: ['hola', 'aqui esta mi tarjeta'], location: 'gym_entrance', actions: [{ type: 'talk', npcId: 'receptionist_ana' }], goalComplete: ['checked_in', 'gym_check_in'] },
  { triggers: ['me estiro', 'uso la colchoneta'], location: 'stretching_area', actions: [{ type: 'use', objectId: 'yoga_mat' }], goalComplete: ['warmed_up', 'stretched', 'gym_warm_up'], needsChanges: { energy: -5 } },
  { triggers: ['levanto los brazos'], actions: [{ type: 'use', objectId: 'training_bench' }], goalComplete: ['followed_trainer', 'gym_follow_trainer'], needsChanges: { energy: -10 }, note: 'Following trainer commands' },
  { triggers: ['uso la cinta de correr', 'corro'], location: 'cardio_zone', actions: [{ type: 'use', objectId: 'treadmill' }], goalComplete: ['did_cardio', 'gym_cardio'], needsChanges: { energy: -15 } },
  { triggers: ['levanto las mancuernas', 'hago repeticiones'], location: 'weight_room', actions: [{ type: 'use', objectId: 'dumbbells' }], goalComplete: ['lifted_weights', 'gym_weights'], needsChanges: { energy: -10 } },
  { triggers: ['me ducho'], location: 'locker_room', actions: [{ type: 'use', objectId: 'gym_shower' }], goalComplete: ['showered', 'gym_cool_down'], needsChanges: { hygiene: 30 } },
];

const teachingNotes: TeachingNotes = {
  title: 'KEY SPANISH FOR GYM (teach these patterns)',
  patterns: [
    'Imperatives (trainer commands): "Levanta!" (Lift!), "Baja!" (Lower!), "Respira!" (Breathe!)',
    'Reflexive verbs: "Me estiro" (I stretch), "Me caliento" (I warm up), "Me ducho" (I shower)',
    'Frequency: "tres veces a la semana" (three times a week), "cada dia" (every day)',
    'Body parts: "los brazos" (arms), "las piernas" (legs), "el pecho" (chest)',
    'Exercise terms: "las repeticiones" (reps), "las series" (sets), "el descanso" (rest)',
  ],
};

export const gymModule: ModuleDefinition = {
  name: 'gym',
  displayName: 'Gym',
  locations: gymLocations,
  npcs: gymNPCs,
  goals: gymGoals,
  vocabulary: gymVocabulary,
  startLocationId: 'gym_entrance',
  startGoalId: 'gym_check_in',
  locationIds: Object.keys(gymLocations),
  unlockLevel: 5,
  promptInstructions: '',
  npcDescriptions,
  interactions,
  teachingNotes,
};
