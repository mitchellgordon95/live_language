// /Users/mitchg/Desktop/language/src/data/gym-module.ts

import type { Location, Goal, VocabWord, GameState, NPC } from '../engine/types.js';

// ============================================================================
// GYM LOCATIONS
// ============================================================================

export const gymEntrance: Location = {
  id: 'gym_entrance',
  name: { spanish: 'la entrada del gimnasio', english: 'gym entrance' },
  objects: [
    {
      id: 'reception_desk',
      name: { spanish: 'el mostrador de recepcion', english: 'reception desk' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'membership_card_scanner',
      name: { spanish: 'el lector de tarjetas', english: 'card scanner' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'gym_rules_poster',
      name: { spanish: 'el cartel de reglas', english: 'rules poster' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'water_fountain',
      name: { spanish: 'la fuente de agua', english: 'water fountain' },
      state: {},
      actions: ['USE', 'DRINK'],
      consumable: true,
      needsEffect: { energy: 5 },
    },
    {
      id: 'gym_bag',
      name: { spanish: 'la bolsa de gimnasio', english: 'gym bag' },
      state: { packed: true },
      actions: ['TAKE', 'OPEN'],
      takeable: true,
    },
  ],
  exits: [
    { to: 'stretching_area', name: { spanish: 'la zona de estiramiento', english: 'stretching area' } },
    { to: 'locker_room', name: { spanish: 'el vestuario', english: 'locker room' } },
    { to: 'street', name: { spanish: 'la calle', english: 'street' } },
  ],
};

export const stretchingArea: Location = {
  id: 'stretching_area',
  name: { spanish: 'la zona de estiramiento', english: 'stretching area' },
  objects: [
    {
      id: 'yoga_mat',
      name: { spanish: 'la colchoneta de yoga', english: 'yoga mat' },
      state: { inUse: false },
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'foam_roller',
      name: { spanish: 'el rodillo de espuma', english: 'foam roller' },
      state: {},
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'resistance_bands',
      name: { spanish: 'las bandas elasticas', english: 'resistance bands' },
      state: {},
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'stretching_mirror',
      name: { spanish: 'el espejo', english: 'mirror' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'stability_ball',
      name: { spanish: 'la pelota de estabilidad', english: 'stability ball' },
      state: {},
      actions: ['USE'],
    },
  ],
  exits: [
    { to: 'gym_entrance', name: { spanish: 'la entrada', english: 'entrance' } },
    { to: 'training_floor', name: { spanish: 'la zona de entrenamiento', english: 'training floor' } },
    { to: 'cardio_zone', name: { spanish: 'la zona de cardio', english: 'cardio zone' } },
  ],
};

export const trainingFloor: Location = {
  id: 'training_floor',
  name: { spanish: 'la zona de entrenamiento', english: 'training floor' },
  objects: [
    {
      id: 'training_bench',
      name: { spanish: 'el banco de entrenamiento', english: 'training bench' },
      state: { inUse: false },
      actions: ['USE'],
    },
    {
      id: 'pull_up_bar',
      name: { spanish: 'la barra de dominadas', english: 'pull-up bar' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'kettlebells',
      name: { spanish: 'las pesas rusas', english: 'kettlebells' },
      state: {},
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'jump_rope',
      name: { spanish: 'la cuerda de saltar', english: 'jump rope' },
      state: {},
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'exercise_clock',
      name: { spanish: 'el reloj de ejercicios', english: 'exercise timer' },
      state: { running: false },
      actions: ['TURN_ON', 'TURN_OFF', 'LOOK'],
    },
  ],
  exits: [
    { to: 'stretching_area', name: { spanish: 'la zona de estiramiento', english: 'stretching area' } },
    { to: 'weight_room', name: { spanish: 'la sala de pesas', english: 'weight room' } },
    { to: 'cardio_zone', name: { spanish: 'la zona de cardio', english: 'cardio zone' } },
  ],
};

export const weightRoom: Location = {
  id: 'weight_room',
  name: { spanish: 'la sala de pesas', english: 'weight room' },
  objects: [
    {
      id: 'dumbbells',
      name: { spanish: 'las mancuernas', english: 'dumbbells' },
      state: { weight: 10 },
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'barbell',
      name: { spanish: 'la barra con pesas', english: 'barbell' },
      state: { weight: 20 },
      actions: ['USE'],
    },
    {
      id: 'weight_rack',
      name: { spanish: 'el estante de pesas', english: 'weight rack' },
      state: {},
      actions: ['LOOK'],
    },
    {
      id: 'bench_press',
      name: { spanish: 'el banco de press', english: 'bench press' },
      state: { inUse: false },
      actions: ['USE'],
    },
    {
      id: 'squat_rack',
      name: { spanish: 'el rack de sentadillas', english: 'squat rack' },
      state: { inUse: false },
      actions: ['USE'],
    },
    {
      id: 'leg_press_machine',
      name: { spanish: 'la maquina de prensa de piernas', english: 'leg press machine' },
      state: { inUse: false },
      actions: ['USE'],
    },
    {
      id: 'cable_machine',
      name: { spanish: 'la maquina de poleas', english: 'cable machine' },
      state: { inUse: false },
      actions: ['USE'],
    },
  ],
  exits: [
    { to: 'training_floor', name: { spanish: 'la zona de entrenamiento', english: 'training floor' } },
    { to: 'cardio_zone', name: { spanish: 'la zona de cardio', english: 'cardio zone' } },
    { to: 'stretching_area', name: { spanish: 'la zona de estiramiento', english: 'stretching area' } },
    { to: 'locker_room', name: { spanish: 'el vestuario', english: 'locker room' } },
  ],
};

export const cardioZone: Location = {
  id: 'cardio_zone',
  name: { spanish: 'la zona de cardio', english: 'cardio zone' },
  objects: [
    {
      id: 'treadmill',
      name: { spanish: 'la cinta de correr', english: 'treadmill' },
      state: { on: false, speed: 0, inUse: false },
      actions: ['USE', 'TURN_ON', 'TURN_OFF'],
    },
    {
      id: 'stationary_bike',
      name: { spanish: 'la bicicleta estatica', english: 'stationary bike' },
      state: { inUse: false },
      actions: ['USE'],
    },
    {
      id: 'elliptical',
      name: { spanish: 'la eliptica', english: 'elliptical' },
      state: { inUse: false },
      actions: ['USE'],
    },
    {
      id: 'rowing_machine',
      name: { spanish: 'la maquina de remo', english: 'rowing machine' },
      state: { inUse: false },
      actions: ['USE'],
    },
    {
      id: 'tv_screen',
      name: { spanish: 'la pantalla de television', english: 'TV screen' },
      state: { on: true },
      actions: ['LOOK'],
    },
    {
      id: 'fan',
      name: { spanish: 'el ventilador', english: 'fan' },
      state: { on: false },
      actions: ['TURN_ON', 'TURN_OFF'],
    },
  ],
  exits: [
    { to: 'training_floor', name: { spanish: 'la zona de entrenamiento', english: 'training floor' } },
    { to: 'weight_room', name: { spanish: 'la sala de pesas', english: 'weight room' } },
    { to: 'stretching_area', name: { spanish: 'la zona de estiramiento', english: 'stretching area' } },
    { to: 'locker_room', name: { spanish: 'el vestuario', english: 'locker room' } },
  ],
};

export const lockerRoom: Location = {
  id: 'locker_room',
  name: { spanish: 'el vestuario', english: 'locker room' },
  objects: [
    {
      id: 'locker',
      name: { spanish: 'el casillero', english: 'locker' },
      state: { open: false, locked: false },
      actions: ['OPEN', 'CLOSE', 'USE'],
    },
    {
      id: 'gym_shower',
      name: { spanish: 'la ducha', english: 'shower' },
      state: { on: false },
      actions: ['USE'],
    },
    {
      id: 'changing_bench',
      name: { spanish: 'el banco de vestidor', english: 'changing bench' },
      state: {},
      actions: [],
    },
    {
      id: 'gym_towel',
      name: { spanish: 'la toalla', english: 'towel' },
      state: {},
      actions: ['USE', 'TAKE'],
      takeable: true,
    },
    {
      id: 'water_bottle',
      name: { spanish: 'la botella de agua', english: 'water bottle' },
      state: { filled: true },
      actions: ['TAKE', 'DRINK'],
      takeable: true,
      consumable: true,
      needsEffect: { energy: 10 },
    },
    {
      id: 'scale',
      name: { spanish: 'la bascula', english: 'scale' },
      state: {},
      actions: ['USE'],
    },
    {
      id: 'gym_mirror',
      name: { spanish: 'el espejo', english: 'mirror' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'gym_entrance', name: { spanish: 'la entrada', english: 'entrance' } },
    { to: 'weight_room', name: { spanish: 'la sala de pesas', english: 'weight room' } },
    { to: 'cardio_zone', name: { spanish: 'la zona de cardio', english: 'cardio zone' } },
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
    name: { spanish: 'Ana', english: 'Ana' },
    location: 'gym_entrance',
    personality: 'Friendly and energetic receptionist. Greets members with enthusiasm. Checks membership cards and answers questions about classes and schedules. Uses informal "tu" with regulars. Key phrases: "Bienvenido al gimnasio!" (Welcome to the gym!), "Tu tarjeta, por favor" (Your card, please), "Hay una clase de yoga a las diez" (There is a yoga class at ten).',
  },
  {
    id: 'trainer_marco',
    name: { spanish: 'Marco', english: 'Marco' },
    location: 'training_floor',
    personality: 'Motivational and knowledgeable personal trainer. Uses imperative commands during training: "Levanta!" (Lift!), "Respira!" (Breathe!), "Descansa!" (Rest!). Counts reps in Spanish. Encourages proper form. Mix of formal and informal depending on context. Will demonstrate exercises and give tips. Enthusiastic about fitness.',
  },
  {
    id: 'member_sofia',
    name: { spanish: 'Sofia', english: 'Sofia' },
    location: 'cardio_zone',
    personality: 'Regular gym member, friendly and chatty. On the elliptical when you arrive. Happy to share gym tips and talk about her workout routine. Uses casual speech. Talks about frequency: "Vengo tres veces a la semana" (I come three times a week). Will ask about your fitness goals.',
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
    checkComplete: () => false, // Final goal
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
  { spanish: 'el gimnasio', english: 'gym', category: 'noun', gender: 'masculine' },
  { spanish: 'la entrada', english: 'entrance', category: 'noun', gender: 'feminine' },
  { spanish: 'la zona de estiramiento', english: 'stretching area', category: 'noun', gender: 'feminine' },
  { spanish: 'la zona de entrenamiento', english: 'training floor', category: 'noun', gender: 'feminine' },
  { spanish: 'la sala de pesas', english: 'weight room', category: 'noun', gender: 'feminine' },
  { spanish: 'la zona de cardio', english: 'cardio zone', category: 'noun', gender: 'feminine' },
  { spanish: 'el vestuario', english: 'locker room', category: 'noun', gender: 'masculine' },

  // ---- EQUIPMENT ----
  // Stretching equipment
  { spanish: 'la colchoneta', english: 'mat', category: 'noun', gender: 'feminine' },
  { spanish: 'la colchoneta de yoga', english: 'yoga mat', category: 'noun', gender: 'feminine' },
  { spanish: 'el rodillo de espuma', english: 'foam roller', category: 'noun', gender: 'masculine' },
  { spanish: 'las bandas elasticas', english: 'resistance bands', category: 'noun', gender: 'feminine' },
  { spanish: 'la pelota de estabilidad', english: 'stability ball', category: 'noun', gender: 'feminine' },
  { spanish: 'la cuerda de saltar', english: 'jump rope', category: 'noun', gender: 'feminine' },

  // Weights
  { spanish: 'las pesas', english: 'weights', category: 'noun', gender: 'feminine' },
  { spanish: 'las mancuernas', english: 'dumbbells', category: 'noun', gender: 'feminine' },
  { spanish: 'la barra', english: 'barbell', category: 'noun', gender: 'feminine' },
  { spanish: 'la barra con pesas', english: 'barbell with weights', category: 'noun', gender: 'feminine' },
  { spanish: 'las pesas rusas', english: 'kettlebells', category: 'noun', gender: 'feminine' },
  { spanish: 'el estante de pesas', english: 'weight rack', category: 'noun', gender: 'masculine' },
  { spanish: 'el banco de press', english: 'bench press', category: 'noun', gender: 'masculine' },
  { spanish: 'el rack de sentadillas', english: 'squat rack', category: 'noun', gender: 'masculine' },

  // Cardio machines
  { spanish: 'la cinta de correr', english: 'treadmill', category: 'noun', gender: 'feminine' },
  { spanish: 'la bicicleta estatica', english: 'stationary bike', category: 'noun', gender: 'feminine' },
  { spanish: 'la eliptica', english: 'elliptical', category: 'noun', gender: 'feminine' },
  { spanish: 'la maquina de remo', english: 'rowing machine', category: 'noun', gender: 'feminine' },

  // Other equipment
  { spanish: 'la maquina', english: 'machine', category: 'noun', gender: 'feminine' },
  { spanish: 'la maquina de poleas', english: 'cable machine', category: 'noun', gender: 'feminine' },
  { spanish: 'la maquina de prensa de piernas', english: 'leg press machine', category: 'noun', gender: 'feminine' },
  { spanish: 'la barra de dominadas', english: 'pull-up bar', category: 'noun', gender: 'feminine' },
  { spanish: 'el banco de entrenamiento', english: 'training bench', category: 'noun', gender: 'masculine' },

  // Locker room items
  { spanish: 'el casillero', english: 'locker', category: 'noun', gender: 'masculine' },
  { spanish: 'la ducha', english: 'shower', category: 'noun', gender: 'feminine' },
  { spanish: 'la toalla', english: 'towel', category: 'noun', gender: 'feminine' },
  { spanish: 'la botella de agua', english: 'water bottle', category: 'noun', gender: 'feminine' },
  { spanish: 'la bascula', english: 'scale', category: 'noun', gender: 'feminine' },
  { spanish: 'la bolsa de gimnasio', english: 'gym bag', category: 'noun', gender: 'feminine' },

  // ---- BODY PARTS ----
  { spanish: 'el cuerpo', english: 'body', category: 'noun', gender: 'masculine' },
  { spanish: 'la cabeza', english: 'head', category: 'noun', gender: 'feminine' },
  { spanish: 'el cuello', english: 'neck', category: 'noun', gender: 'masculine' },
  { spanish: 'los hombros', english: 'shoulders', category: 'noun', gender: 'masculine' },
  { spanish: 'el hombro', english: 'shoulder', category: 'noun', gender: 'masculine' },
  { spanish: 'los brazos', english: 'arms', category: 'noun', gender: 'masculine' },
  { spanish: 'el brazo', english: 'arm', category: 'noun', gender: 'masculine' },
  { spanish: 'el codo', english: 'elbow', category: 'noun', gender: 'masculine' },
  { spanish: 'las manos', english: 'hands', category: 'noun', gender: 'feminine' },
  { spanish: 'la mano', english: 'hand', category: 'noun', gender: 'feminine' },
  { spanish: 'los dedos', english: 'fingers', category: 'noun', gender: 'masculine' },
  { spanish: 'el pecho', english: 'chest', category: 'noun', gender: 'masculine' },
  { spanish: 'la espalda', english: 'back', category: 'noun', gender: 'feminine' },
  { spanish: 'el estomago', english: 'stomach', category: 'noun', gender: 'masculine' },
  { spanish: 'los abdominales', english: 'abs', category: 'noun', gender: 'masculine' },
  { spanish: 'la cintura', english: 'waist', category: 'noun', gender: 'feminine' },
  { spanish: 'las caderas', english: 'hips', category: 'noun', gender: 'feminine' },
  { spanish: 'las piernas', english: 'legs', category: 'noun', gender: 'feminine' },
  { spanish: 'la pierna', english: 'leg', category: 'noun', gender: 'feminine' },
  { spanish: 'el muslo', english: 'thigh', category: 'noun', gender: 'masculine' },
  { spanish: 'la rodilla', english: 'knee', category: 'noun', gender: 'feminine' },
  { spanish: 'la pantorrilla', english: 'calf', category: 'noun', gender: 'feminine' },
  { spanish: 'los pies', english: 'feet', category: 'noun', gender: 'masculine' },
  { spanish: 'el pie', english: 'foot', category: 'noun', gender: 'masculine' },
  { spanish: 'los musculos', english: 'muscles', category: 'noun', gender: 'masculine' },
  { spanish: 'el musculo', english: 'muscle', category: 'noun', gender: 'masculine' },
  { spanish: 'los biceps', english: 'biceps', category: 'noun', gender: 'masculine' },
  { spanish: 'los triceps', english: 'triceps', category: 'noun', gender: 'masculine' },
  { spanish: 'los gluteos', english: 'glutes', category: 'noun', gender: 'masculine' },

  // ---- EXERCISE VERBS (Infinitive + Yo forms) ----
  // Core exercise verbs
  { spanish: 'ejercitar', english: 'to exercise', category: 'verb' },
  { spanish: 'ejercito', english: 'I exercise', category: 'verb' },
  { spanish: 'entrenar', english: 'to train', category: 'verb' },
  { spanish: 'entreno', english: 'I train', category: 'verb' },
  { spanish: 'hacer ejercicio', english: 'to exercise/work out', category: 'verb' },
  { spanish: 'hago ejercicio', english: 'I exercise/work out', category: 'verb' },

  // Movement verbs
  { spanish: 'correr', english: 'to run', category: 'verb' },
  { spanish: 'corro', english: 'I run', category: 'verb' },
  { spanish: 'caminar', english: 'to walk', category: 'verb' },
  { spanish: 'camino', english: 'I walk', category: 'verb' },
  { spanish: 'saltar', english: 'to jump', category: 'verb' },
  { spanish: 'salto', english: 'I jump', category: 'verb' },
  { spanish: 'nadar', english: 'to swim', category: 'verb' },
  { spanish: 'nado', english: 'I swim', category: 'verb' },

  // Strength verbs
  { spanish: 'levantar', english: 'to lift', category: 'verb' },
  { spanish: 'levanto', english: 'I lift', category: 'verb' },
  { spanish: 'empujar', english: 'to push', category: 'verb' },
  { spanish: 'empujo', english: 'I push', category: 'verb' },
  { spanish: 'jalar', english: 'to pull', category: 'verb' },
  { spanish: 'jalo', english: 'I pull', category: 'verb' },
  { spanish: 'tirar', english: 'to pull', category: 'verb' },
  { spanish: 'tiro', english: 'I pull', category: 'verb' },
  { spanish: 'cargar', english: 'to carry/lift', category: 'verb' },
  { spanish: 'cargo', english: 'I carry/lift', category: 'verb' },

  // Position verbs
  { spanish: 'agachar', english: 'to squat/crouch', category: 'verb' },
  { spanish: 'me agacho', english: 'I squat/crouch', category: 'verb' },
  { spanish: 'doblar', english: 'to bend', category: 'verb' },
  { spanish: 'doblo', english: 'I bend', category: 'verb' },
  { spanish: 'girar', english: 'to rotate/turn', category: 'verb' },
  { spanish: 'giro', english: 'I rotate/turn', category: 'verb' },
  { spanish: 'inclinar', english: 'to lean/tilt', category: 'verb' },
  { spanish: 'me inclino', english: 'I lean/tilt', category: 'verb' },

  // ---- REFLEXIVE FITNESS VERBS ----
  { spanish: 'estirarse', english: 'to stretch', category: 'verb' },
  { spanish: 'me estiro', english: 'I stretch', category: 'verb' },
  { spanish: 'calentarse', english: 'to warm up', category: 'verb' },
  { spanish: 'me caliento', english: 'I warm up', category: 'verb' },
  { spanish: 'relajarse', english: 'to relax', category: 'verb' },
  { spanish: 'me relajo', english: 'I relax', category: 'verb' },
  { spanish: 'ducharse', english: 'to shower', category: 'verb' },
  { spanish: 'me ducho', english: 'I shower', category: 'verb' },
  { spanish: 'cambiarse', english: 'to change (clothes)', category: 'verb' },
  { spanish: 'me cambio', english: 'I change', category: 'verb' },
  { spanish: 'sentarse', english: 'to sit down', category: 'verb' },
  { spanish: 'me siento', english: 'I sit down', category: 'verb' },
  { spanish: 'pararse', english: 'to stand up', category: 'verb' },
  { spanish: 'me paro', english: 'I stand up', category: 'verb' },
  { spanish: 'acostarse', english: 'to lie down', category: 'verb' },
  { spanish: 'me acuesto', english: 'I lie down', category: 'verb' },
  { spanish: 'cansarse', english: 'to get tired', category: 'verb' },
  { spanish: 'me canso', english: 'I get tired', category: 'verb' },

  // ---- IMPERATIVE COMMANDS (Trainer uses these) ----
  // Informal tu imperatives
  { spanish: 'levanta', english: 'lift! (informal)', category: 'verb' },
  { spanish: 'baja', english: 'lower! (informal)', category: 'verb' },
  { spanish: 'empuja', english: 'push! (informal)', category: 'verb' },
  { spanish: 'jala', english: 'pull! (informal)', category: 'verb' },
  { spanish: 'corre', english: 'run! (informal)', category: 'verb' },
  { spanish: 'camina', english: 'walk! (informal)', category: 'verb' },
  { spanish: 'salta', english: 'jump! (informal)', category: 'verb' },
  { spanish: 'para', english: 'stop! (informal)', category: 'verb' },
  { spanish: 'respira', english: 'breathe! (informal)', category: 'verb' },
  { spanish: 'descansa', english: 'rest! (informal)', category: 'verb' },
  { spanish: 'estirate', english: 'stretch! (informal)', category: 'verb' },
  { spanish: 'dobla', english: 'bend! (informal)', category: 'verb' },
  { spanish: 'gira', english: 'turn! (informal)', category: 'verb' },
  { spanish: 'aguanta', english: 'hold! (informal)', category: 'verb' },
  { spanish: 'aprieta', english: 'squeeze! (informal)', category: 'verb' },
  { spanish: 'repite', english: 'repeat! (informal)', category: 'verb' },
  { spanish: 'continua', english: 'continue! (informal)', category: 'verb' },
  { spanish: 'mas rapido', english: 'faster!', category: 'other' },
  { spanish: 'mas lento', english: 'slower!', category: 'other' },
  { spanish: 'otra vez', english: 'again!', category: 'other' },

  // ---- FREQUENCY WORDS ----
  { spanish: 'siempre', english: 'always', category: 'other' },
  { spanish: 'nunca', english: 'never', category: 'other' },
  { spanish: 'a veces', english: 'sometimes', category: 'other' },
  { spanish: 'frecuentemente', english: 'frequently', category: 'other' },
  { spanish: 'a menudo', english: 'often', category: 'other' },
  { spanish: 'raramente', english: 'rarely', category: 'other' },
  { spanish: 'cada dia', english: 'every day', category: 'other' },
  { spanish: 'todos los dias', english: 'every day', category: 'other' },
  { spanish: 'una vez', english: 'once', category: 'other' },
  { spanish: 'dos veces', english: 'twice', category: 'other' },
  { spanish: 'tres veces', english: 'three times', category: 'other' },
  { spanish: 'una vez a la semana', english: 'once a week', category: 'other' },
  { spanish: 'dos veces a la semana', english: 'twice a week', category: 'other' },
  { spanish: 'tres veces a la semana', english: 'three times a week', category: 'other' },
  { spanish: 'por semana', english: 'per week', category: 'other' },
  { spanish: 'cada semana', english: 'every week', category: 'other' },
  { spanish: 'al dia', english: 'per day', category: 'other' },

  // ---- EXERCISE TERMINOLOGY ----
  { spanish: 'la repeticion', english: 'repetition', category: 'noun', gender: 'feminine' },
  { spanish: 'las repeticiones', english: 'repetitions/reps', category: 'noun', gender: 'feminine' },
  { spanish: 'la serie', english: 'set', category: 'noun', gender: 'feminine' },
  { spanish: 'las series', english: 'sets', category: 'noun', gender: 'feminine' },
  { spanish: 'el descanso', english: 'rest', category: 'noun', gender: 'masculine' },
  { spanish: 'el calentamiento', english: 'warm-up', category: 'noun', gender: 'masculine' },
  { spanish: 'el enfriamiento', english: 'cool-down', category: 'noun', gender: 'masculine' },
  { spanish: 'el entrenamiento', english: 'training/workout', category: 'noun', gender: 'masculine' },
  { spanish: 'el ejercicio', english: 'exercise', category: 'noun', gender: 'masculine' },
  { spanish: 'la rutina', english: 'routine', category: 'noun', gender: 'feminine' },
  { spanish: 'el peso', english: 'weight', category: 'noun', gender: 'masculine' },
  { spanish: 'la fuerza', english: 'strength', category: 'noun', gender: 'feminine' },
  { spanish: 'la resistencia', english: 'endurance/resistance', category: 'noun', gender: 'feminine' },
  { spanish: 'el cardio', english: 'cardio', category: 'noun', gender: 'masculine' },
  { spanish: 'la flexibilidad', english: 'flexibility', category: 'noun', gender: 'feminine' },
  { spanish: 'el equilibrio', english: 'balance', category: 'noun', gender: 'masculine' },
  { spanish: 'la postura', english: 'posture', category: 'noun', gender: 'feminine' },

  // ---- SPECIFIC EXERCISES ----
  { spanish: 'las sentadillas', english: 'squats', category: 'noun', gender: 'feminine' },
  { spanish: 'las flexiones', english: 'push-ups', category: 'noun', gender: 'feminine' },
  { spanish: 'los abdominales', english: 'crunches/sit-ups', category: 'noun', gender: 'masculine' },
  { spanish: 'las dominadas', english: 'pull-ups', category: 'noun', gender: 'feminine' },
  { spanish: 'las zancadas', english: 'lunges', category: 'noun', gender: 'feminine' },
  { spanish: 'la plancha', english: 'plank', category: 'noun', gender: 'feminine' },
  { spanish: 'el peso muerto', english: 'deadlift', category: 'noun', gender: 'masculine' },
  { spanish: 'el press de banca', english: 'bench press', category: 'noun', gender: 'masculine' },
  { spanish: 'el curl de biceps', english: 'bicep curl', category: 'noun', gender: 'masculine' },

  // ---- NUMBERS (for counting reps) ----
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
  { spanish: 'quince', english: 'fifteen', category: 'other' },
  { spanish: 'veinte', english: 'twenty', category: 'other' },

  // ---- PEOPLE ----
  { spanish: 'el entrenador', english: 'trainer (male)', category: 'noun', gender: 'masculine' },
  { spanish: 'la entrenadora', english: 'trainer (female)', category: 'noun', gender: 'feminine' },
  { spanish: 'el recepcionista', english: 'receptionist (male)', category: 'noun', gender: 'masculine' },
  { spanish: 'la recepcionista', english: 'receptionist (female)', category: 'noun', gender: 'feminine' },
  { spanish: 'el miembro', english: 'member', category: 'noun', gender: 'masculine' },
  { spanish: 'la miembro', english: 'member (female)', category: 'noun', gender: 'feminine' },
  { spanish: 'el socio', english: 'member/partner', category: 'noun', gender: 'masculine' },

  // ---- ADJECTIVES ----
  { spanish: 'fuerte', english: 'strong', category: 'adjective' },
  { spanish: 'debil', english: 'weak', category: 'adjective' },
  { spanish: 'cansado', english: 'tired (masc)', category: 'adjective' },
  { spanish: 'cansada', english: 'tired (fem)', category: 'adjective' },
  { spanish: 'energico', english: 'energetic (masc)', category: 'adjective' },
  { spanish: 'energica', english: 'energetic (fem)', category: 'adjective' },
  { spanish: 'rapido', english: 'fast (masc)', category: 'adjective' },
  { spanish: 'rapida', english: 'fast (fem)', category: 'adjective' },
  { spanish: 'lento', english: 'slow (masc)', category: 'adjective' },
  { spanish: 'lenta', english: 'slow (fem)', category: 'adjective' },
  { spanish: 'pesado', english: 'heavy (masc)', category: 'adjective' },
  { spanish: 'pesada', english: 'heavy (fem)', category: 'adjective' },
  { spanish: 'ligero', english: 'light (masc)', category: 'adjective' },
  { spanish: 'ligera', english: 'light (fem)', category: 'adjective' },
  { spanish: 'dificil', english: 'difficult', category: 'adjective' },
  { spanish: 'facil', english: 'easy', category: 'adjective' },
  { spanish: 'intenso', english: 'intense (masc)', category: 'adjective' },
  { spanish: 'intensa', english: 'intense (fem)', category: 'adjective' },
  { spanish: 'sudado', english: 'sweaty (masc)', category: 'adjective' },
  { spanish: 'sudada', english: 'sweaty (fem)', category: 'adjective' },

  // ---- COMMON PHRASES ----
  { spanish: 'bienvenido al gimnasio', english: 'welcome to the gym', category: 'other' },
  { spanish: 'tu tarjeta, por favor', english: 'your card, please', category: 'other' },
  { spanish: 'vamos!', english: 'let\'s go!', category: 'other' },
  { spanish: 'muy bien!', english: 'very good!', category: 'other' },
  { spanish: 'excelente!', english: 'excellent!', category: 'other' },
  { spanish: 'buen trabajo', english: 'good job', category: 'other' },
  { spanish: 'puedo usar...?', english: 'can I use...?', category: 'other' },
  { spanish: 'esta libre?', english: 'is this free/available?', category: 'other' },
  { spanish: 'cuantas repeticiones?', english: 'how many reps?', category: 'other' },
  { spanish: 'cuantas series?', english: 'how many sets?', category: 'other' },
  { spanish: 'con que frecuencia vienes?', english: 'how often do you come?', category: 'other' },
  { spanish: 'vengo tres veces a la semana', english: 'I come three times a week', category: 'other' },
  { spanish: 'necesito descansar', english: 'I need to rest', category: 'other' },
  { spanish: 'estoy cansado', english: 'I\'m tired (masc)', category: 'other' },
  { spanish: 'estoy cansada', english: 'I\'m tired (fem)', category: 'other' },
  { spanish: 'buena sesion!', english: 'good session!', category: 'other' },
];

export const promptInstructions = `GYM NPCs:
- Ana (receptionist_ana): Friendly, energetic receptionist at gym_entrance. Greets with "Bienvenido al gimnasio!" Asks for membership card: "Tu tarjeta, por favor". Uses informal "tu" with regulars.
- Marco (trainer_marco): Motivational personal trainer on training_floor. Uses imperative commands: "Levanta!" (Lift!), "Respira!" (Breathe!), "Descansa!" (Rest!). Counts reps in Spanish. Enthusiastic about fitness.
- Sofia (member_sofia): Regular gym member in cardio_zone. Chatty and friendly. Talks about frequency: "Vengo tres veces a la semana" (I come three times a week). Happy to share tips.

GYM INTERACTIONS:
- "hola" or "aqui esta mi tarjeta" at gym_entrance → actions: [{ "type": "talk", "npcId": "receptionist_ana" }], goalComplete: ["checked_in", "gym_check_in"], npcResponse from Ana
- "me estiro" or "uso la colchoneta" in stretching_area → actions: [{ "type": "use", "objectId": "yoga_mat" }], goalComplete: ["warmed_up", "stretched", "gym_warm_up"], needsChanges: { energy: -5 }
- Following trainer commands like "levanto los brazos" → actions: [{ "type": "use", "objectId": "training_bench" }], goalComplete: ["followed_trainer", "gym_follow_trainer"], needsChanges: { energy: -10 }
- "uso la cinta de correr" or "corro" in cardio_zone → actions: [{ "type": "use", "objectId": "treadmill" }], goalComplete: ["did_cardio", "gym_cardio"], needsChanges: { energy: -15 }
- "levanto las mancuernas" or "hago repeticiones" in weight_room → actions: [{ "type": "use", "objectId": "dumbbells" }], goalComplete: ["lifted_weights", "gym_weights"], needsChanges: { energy: -10 }
- "me ducho" in locker_room → actions: [{ "type": "use", "objectId": "gym_shower" }], goalComplete: ["showered", "gym_cool_down"], needsChanges: { hygiene: 30 }

KEY SPANISH FOR GYM (teach these patterns):
- Imperatives (trainer commands): "Levanta!" (Lift!), "Baja!" (Lower!), "Respira!" (Breathe!)
- Reflexive verbs: "Me estiro" (I stretch), "Me caliento" (I warm up), "Me ducho" (I shower)
- Frequency: "tres veces a la semana" (three times a week), "cada dia" (every day)
- Body parts: "los brazos" (arms), "las piernas" (legs), "el pecho" (chest)
- Exercise terms: "las repeticiones" (reps), "las series" (sets), "el descanso" (rest)`;
