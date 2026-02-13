import type { Location, Goal, VocabWord, GameState, NPC, WorldObject, ModuleDefinition } from '../../../engine/types.js';

// ============================================================================
// LOCATIONS (exits only -- objects are in the flat list below)
// ============================================================================

const locations: Record<string, Location> = {
  gym_entrance: {
    id: 'gym_entrance',
    name: { target: 'la entrada del gimnasio', native: 'gym entrance' },
    exits: [
      { to: 'stretching_area', name: { target: 'la zona de estiramiento', native: 'stretching area' } },
      { to: 'locker_room', name: { target: 'el vestuario', native: 'locker room' } },
      { to: 'street', name: { target: 'la calle', native: 'street' } },
    ],
  },
  stretching_area: {
    id: 'stretching_area',
    name: { target: 'la zona de estiramiento', native: 'stretching area' },
    exits: [
      { to: 'gym_entrance', name: { target: 'la entrada', native: 'entrance' } },
      { to: 'training_floor', name: { target: 'la zona de entrenamiento', native: 'training floor' } },
      { to: 'cardio_zone', name: { target: 'la zona de cardio', native: 'cardio zone' } },
    ],
  },
  training_floor: {
    id: 'training_floor',
    name: { target: 'la zona de entrenamiento', native: 'training floor' },
    exits: [
      { to: 'stretching_area', name: { target: 'la zona de estiramiento', native: 'stretching area' } },
      { to: 'weight_room', name: { target: 'la sala de pesas', native: 'weight room' } },
      { to: 'cardio_zone', name: { target: 'la zona de cardio', native: 'cardio zone' } },
    ],
  },
  weight_room: {
    id: 'weight_room',
    name: { target: 'la sala de pesas', native: 'weight room' },
    exits: [
      { to: 'training_floor', name: { target: 'la zona de entrenamiento', native: 'training floor' } },
      { to: 'cardio_zone', name: { target: 'la zona de cardio', native: 'cardio zone' } },
      { to: 'stretching_area', name: { target: 'la zona de estiramiento', native: 'stretching area' } },
      { to: 'locker_room', name: { target: 'el vestuario', native: 'locker room' } },
    ],
  },
  cardio_zone: {
    id: 'cardio_zone',
    name: { target: 'la zona de cardio', native: 'cardio zone' },
    exits: [
      { to: 'training_floor', name: { target: 'la zona de entrenamiento', native: 'training floor' } },
      { to: 'weight_room', name: { target: 'la sala de pesas', native: 'weight room' } },
      { to: 'stretching_area', name: { target: 'la zona de estiramiento', native: 'stretching area' } },
      { to: 'locker_room', name: { target: 'el vestuario', native: 'locker room' } },
    ],
  },
  locker_room: {
    id: 'locker_room',
    name: { target: 'el vestuario', native: 'locker room' },
    exits: [
      { to: 'gym_entrance', name: { target: 'la entrada', native: 'entrance' } },
      { to: 'weight_room', name: { target: 'la sala de pesas', native: 'weight room' } },
      { to: 'cardio_zone', name: { target: 'la zona de cardio', native: 'cardio zone' } },
    ],
  },
};

// ============================================================================
// OBJECTS (flat list -- each knows its own location)
// ============================================================================

const objects: WorldObject[] = [
  // Gym entrance
  { id: 'reception_desk', name: { target: 'el mostrador de recepcion', native: 'reception desk' }, location: 'gym_entrance', tags: [] },
  { id: 'membership_card_scanner', name: { target: 'el lector de tarjetas', native: 'card scanner' }, location: 'gym_entrance', tags: [] },
  { id: 'gym_rules_poster', name: { target: 'el cartel de reglas', native: 'rules poster' }, location: 'gym_entrance', tags: [] },
  { id: 'water_fountain', name: { target: 'la fuente de agua', native: 'water fountain' }, location: 'gym_entrance', tags: ['consumable'], needsEffect: { energy: 5 } },
  { id: 'gym_bag', name: { target: 'la bolsa de gimnasio', native: 'gym bag' }, location: 'gym_entrance', tags: ['takeable', 'closed'] },

  // Stretching area
  { id: 'yoga_mat', name: { target: 'la colchoneta de yoga', native: 'yoga mat' }, location: 'stretching_area', tags: ['takeable'] },
  { id: 'foam_roller', name: { target: 'el rodillo de espuma', native: 'foam roller' }, location: 'stretching_area', tags: ['takeable'] },
  { id: 'resistance_bands', name: { target: 'las bandas elasticas', native: 'resistance bands' }, location: 'stretching_area', tags: ['takeable'] },
  { id: 'stretching_mirror', name: { target: 'el espejo', native: 'mirror' }, location: 'stretching_area', tags: [] },
  { id: 'stability_ball', name: { target: 'la pelota de estabilidad', native: 'stability ball' }, location: 'stretching_area', tags: [] },

  // Training floor
  { id: 'training_bench', name: { target: 'el banco de entrenamiento', native: 'training bench' }, location: 'training_floor', tags: [] },
  { id: 'pull_up_bar', name: { target: 'la barra de dominadas', native: 'pull-up bar' }, location: 'training_floor', tags: [] },
  { id: 'kettlebells', name: { target: 'las pesas rusas', native: 'kettlebells' }, location: 'training_floor', tags: ['takeable'] },
  { id: 'jump_rope', name: { target: 'la cuerda de saltar', native: 'jump rope' }, location: 'training_floor', tags: ['takeable'] },
  { id: 'exercise_clock', name: { target: 'el reloj de ejercicios', native: 'exercise timer' }, location: 'training_floor', tags: ['off'] },

  // Weight room
  { id: 'dumbbells', name: { target: 'las mancuernas', native: 'dumbbells' }, location: 'weight_room', tags: ['takeable'] },
  { id: 'barbell', name: { target: 'la barra con pesas', native: 'barbell' }, location: 'weight_room', tags: [] },
  { id: 'weight_rack', name: { target: 'el estante de pesas', native: 'weight rack' }, location: 'weight_room', tags: [] },
  { id: 'bench_press', name: { target: 'el banco de press', native: 'bench press' }, location: 'weight_room', tags: [] },
  { id: 'squat_rack', name: { target: 'el rack de sentadillas', native: 'squat rack' }, location: 'weight_room', tags: [] },
  { id: 'leg_press_machine', name: { target: 'la maquina de prensa de piernas', native: 'leg press machine' }, location: 'weight_room', tags: [] },
  { id: 'cable_machine', name: { target: 'la maquina de poleas', native: 'cable machine' }, location: 'weight_room', tags: [] },

  // Cardio zone
  { id: 'treadmill', name: { target: 'la cinta de correr', native: 'treadmill' }, location: 'cardio_zone', tags: ['off'] },
  { id: 'stationary_bike', name: { target: 'la bicicleta estatica', native: 'stationary bike' }, location: 'cardio_zone', tags: [] },
  { id: 'elliptical', name: { target: 'la eliptica', native: 'elliptical' }, location: 'cardio_zone', tags: [] },
  { id: 'rowing_machine', name: { target: 'la maquina de remo', native: 'rowing machine' }, location: 'cardio_zone', tags: [] },
  { id: 'tv_screen', name: { target: 'la pantalla de television', native: 'TV screen' }, location: 'cardio_zone', tags: ['on'] },
  { id: 'fan', name: { target: 'el ventilador', native: 'fan' }, location: 'cardio_zone', tags: ['off'] },

  // Locker room
  { id: 'locker', name: { target: 'el casillero', native: 'locker' }, location: 'locker_room', tags: ['closed'] },
  { id: 'gym_shower', name: { target: 'la ducha', native: 'shower' }, location: 'locker_room', tags: ['off'] },
  { id: 'changing_bench', name: { target: 'el banco de vestidor', native: 'changing bench' }, location: 'locker_room', tags: [] },
  { id: 'gym_towel', name: { target: 'la toalla', native: 'towel' }, location: 'locker_room', tags: ['takeable'] },
  { id: 'water_bottle', name: { target: 'la botella de agua', native: 'water bottle' }, location: 'locker_room', tags: ['takeable', 'consumable'], needsEffect: { energy: 10 } },
  { id: 'scale', name: { target: 'la bascula', native: 'scale' }, location: 'locker_room', tags: [] },
  { id: 'gym_mirror', name: { target: 'el espejo', native: 'mirror' }, location: 'locker_room', tags: [] },
];

// ============================================================================
// NPCs
// ============================================================================

const npcs: NPC[] = [
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

// ============================================================================
// GOALS (checkComplete uses new state model)
// ============================================================================

const goals: Goal[] = [
  {
    id: 'gym_check_in',
    title: 'Check in at the gym',
    description: 'You\'ve arrived at the gym! Check in with Ana at the reception desk.',
    hint: 'Try "Hola, buenos dias" to greet Ana, then show your card: "Aqui esta mi tarjeta"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('gym_check_in'),
    nextGoalId: 'gym_warm_up',
  },
  {
    id: 'gym_warm_up',
    title: 'Warm up in the stretching area',
    description: 'Before exercising, you need to warm up. Go to the stretching area and do some stretches.',
    hint: 'Try "Voy a la zona de estiramiento" then "Me estiro" (I stretch) or "Uso la colchoneta"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('gym_warm_up'),
    nextGoalId: 'gym_follow_trainer',
  },
  {
    id: 'gym_follow_trainer',
    title: 'Train with Marco',
    description: 'Find trainer Marco on the training floor and follow his exercise commands. Listen for imperatives!',
    hint: 'Go to training floor with "Voy a la zona de entrenamiento". Follow commands like "Levanta los brazos!" (Raise your arms!). Respond with "Levanto los brazos"',
    checkComplete: (state: GameState) =>
      state.completedGoals.includes('gym_follow_trainer'),
    nextGoalId: 'gym_cardio',
  },
  {
    id: 'gym_cardio',
    title: 'Do cardio exercise',
    description: 'Get your heart pumping! Use the treadmill or bike in the cardio zone. Chat with Sofia about her routine.',
    hint: 'Try "Uso la cinta de correr" (I use the treadmill) or "Corro en la cinta" (I run on the treadmill). Ask Sofia "Con que frecuencia vienes?" (How often do you come?)',
    checkComplete: (state: GameState) => {
      const treadmill = state.objects.find(o => o.id === 'treadmill');
      const bike = state.objects.find(o => o.id === 'stationary_bike');
      return (treadmill?.tags.includes('inUse') === true) ||
             (bike?.tags.includes('inUse') === true) ||
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
      state.completedGoals.includes('gym_weights'),
    nextGoalId: 'gym_cool_down',
  },
  {
    id: 'gym_cool_down',
    title: 'Cool down and finish',
    description: 'Great workout! Cool down with stretches, then shower and change in the locker room.',
    hint: 'Try "Me estiro" to stretch, then "Voy al vestuario" and "Me ducho" (I shower)',
    checkComplete: (state: GameState) =>
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

// ============================================================================
// VOCABULARY (unchanged)
// ============================================================================

const vocabulary: VocabWord[] = [
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

// ============================================================================
// MODULE EXPORT
// ============================================================================

export const gymModule: ModuleDefinition = {
  name: 'gym',
  displayName: 'Gym',
  locations,
  objects,
  npcs,
  goals,
  vocabulary,
  startLocationId: 'gym_entrance',
  startGoalId: 'gym_check_in',
  locationIds: Object.keys(locations),
  unlockLevel: 5,

  guidance: `GYM ENVIRONMENT:
A modern gym with six areas: entrance, stretching area, training floor, weight room, cardio zone, and locker room.
The player is learning exercise vocabulary, body parts, imperatives, reflexive verbs, and frequency expressions.

OBJECTS:
- reception_desk: Fixed desk at entrance. Ana stands behind it.
- membership_card_scanner: Player scans card to check in. No state changes needed.
- gym_rules_poster: Can be looked at for flavor text.
- water_fountain: Consumable at entrance. Drinking gives energy +5 via needsEffect.
- gym_bag: Takeable, starts "closed". Can be opened (tag remove "closed", add "open") to access contents.
- yoga_mat: In stretching_area. Takeable. Using it = stretching/warming up.
- foam_roller, resistance_bands: Takeable stretching equipment. Using = warming up.
- stability_ball: In stretching_area. Can be used for exercises.
- stretching_mirror, gym_mirror: Mirrors for looking at form. No state changes.
- training_bench: On training_floor. Used for bench exercises with Marco.
- pull_up_bar: On training_floor. Used for pull-ups/dominadas.
- kettlebells: Takeable on training_floor. Used for strength exercises.
- jump_rope: Takeable on training_floor. Used for cardio warm-up.
- exercise_clock: Timer on training_floor. Starts "off". Turn on = tag add "on", remove "off".
- dumbbells: Takeable in weight_room. Core weight-lifting equipment.
- barbell: In weight_room. Heavy, not takeable. Used in place.
- weight_rack: In weight_room. Look at to see available weights.
- bench_press, squat_rack: In weight_room. Used for specific lifts.
- leg_press_machine, cable_machine: Machines in weight_room. Used for exercises.
- treadmill: In cardio_zone. Starts "off". Using = tag add "on" + "inUse", remove "off". Needs: energy -15.
- stationary_bike: In cardio_zone. Using = tag add "inUse". Needs: energy -10.
- elliptical: In cardio_zone. Sofia is on this one. Using = tag add "inUse". Needs: energy -10.
- rowing_machine: In cardio_zone. Using = tag add "inUse". Needs: energy -10.
- tv_screen: In cardio_zone. Starts "on". Background entertainment.
- fan: In cardio_zone. Starts "off". Turn on = tag add "on", remove "off".
- locker: In locker_room. Starts "closed". Open = tag remove "closed", add "open".
- gym_shower: In locker_room. Starts "off". Using = tag add "on", remove "off". Needs: hygiene +30.
- changing_bench: In locker_room. Decorative.
- gym_towel: Takeable in locker_room. Useful after shower.
- water_bottle: Takeable, consumable in locker_room. Drinking gives energy +10.
- scale: In locker_room. Can be used to weigh yourself.

EXERCISE FLOW:
When the player exercises (stretches, lifts, runs, etc.), apply energy cost via needs mutation:
- Stretching/warming up: needs { energy: -5 }
- Training floor exercises with Marco: needs { energy: -10 }
- Cardio (treadmill, bike, elliptical, rowing): needs { energy: -15 }
- Weight lifting (dumbbells, barbell, machines): needs { energy: -10 }
- Showering: needs { hygiene: 30 }
- Drinking water/using fountain: use the object's needsEffect

TRAINER COMMANDS (Marco):
Marco gives imperative commands the player should follow. When Marco says an imperative like
"Levanta los brazos!" the player responds with the yo-form "Levanto los brazos".
Common trainer imperatives: levanta (lift), baja (lower), empuja (push), jala (pull),
corre (run), salta (jump), para (stop), respira (breathe), descansa (rest),
estirate (stretch), dobla (bend), gira (turn), aguanta (hold), aprieta (squeeze),
repite (repeat), continua (continue).
Marco counts reps in Spanish: uno, dos, tres... diez.
Marco tracks sets: "Primera serie!" (First set!), "Segunda serie!" (Second set!).

NPCs:
- Ana (receptionist_ana): At gym_entrance. Friendly, energetic. Uses informal "tu".
  Greets with "Bienvenido al gimnasio!" and asks for membership card.
  Answers questions about classes, schedules, equipment.
  After check-in greeting, complete gym_check_in goal.
- Marco (trainer_marco): On training_floor. Motivational personal trainer.
  Issues imperative commands for exercises. Counts reps in Spanish.
  Encourages proper form: "Buena postura!" (Good posture!), "Mas bajo!" (Lower!).
  After the player follows at least 2-3 commands or completes an exercise set, complete gym_follow_trainer.
- Sofia (member_sofia): In cardio_zone. Regular member on the elliptical.
  Chatty, shares workout tips. Talks about frequency: "Vengo tres veces a la semana".
  Asks about player's fitness goals. Uses casual speech.

GOAL COMPLETION:
- gym_check_in: Player greets Ana or shows card at entrance
- gym_warm_up: Player stretches or uses equipment in stretching_area (uses mat, bands, roller, or says "me estiro"/"me caliento")
- gym_follow_trainer: Player follows Marco's commands on training_floor (responds to imperatives, does exercises)
- gym_cardio: Player uses treadmill, bike, elliptical, or rowing_machine (any gets "inUse" tag) OR talks to Sofia about exercise
- gym_weights: Player lifts dumbbells, uses barbell, bench_press, squat_rack, or any machine in weight_room
- gym_cool_down: Player stretches to cool down OR showers in locker_room (gym_shower gets "on" tag)

TEACHING FOCUS:
- Imperatives (trainer commands): "Levanta!" (Lift!), "Baja!" (Lower!), "Respira!" (Breathe!)
- Reflexive verbs: "Me estiro" (I stretch), "Me caliento" (I warm up), "Me ducho" (I shower)
- Frequency expressions: "tres veces a la semana" (three times a week), "cada dia" (every day)
- Body parts: "los brazos" (arms), "las piernas" (legs), "el pecho" (chest)
- Numbers for counting reps: "uno, dos, tres..." up to "veinte"`,
};
