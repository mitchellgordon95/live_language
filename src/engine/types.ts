// Core game types

export interface GameState {
  location: Location;
  playerPosition: 'in_bed' | 'standing';
  needs: Needs;
  inventory: Item[];
  time: GameTime;
  currentGoal: Goal | null;
  completedGoals: string[];
  learnedWords: string[];
  vocabulary: VocabularyProgress;
  failedCurrentGoal: boolean;  // Show hint only after failing
  petLocations: Record<string, string>;  // { cat: 'living_room', dog: 'kitchen' }
  npcState: Record<string, NPCState>;
  objectStates: Record<string, ObjectState>;  // Persists object state across location changes
  dynamicObjects: Record<string, GameObject[]>;  // locationId -> objects added by NPCs

  // Progression system
  points: number;
  level: number;
  totalPointsEarned: number;
  locationProgress: Record<string, LocationProgress>;  // Per-building goal tracking

  // Learn command tracking (5 per in-game day)
  learnCommandsUsedToday: number;
  lastLearnCommandDay: number;  // In-game day (hour / 24)

  // Audio
  audioEnabled: boolean;

  // Profile for vocabulary tracking
  profile?: string;
}

export interface LocationProgress {
  currentGoalId: string | null;
  completedGoals: string[];
  difficulty: number;  // 1, 2, 3... for harder goal versions on return visits
  chainComplete: boolean;  // true when all goals in building done
}

export interface NPCState {
  mood: string;
  lastResponse?: string;
  wantsItem?: string;  // What they asked for (e.g., 'eggs', 'coffee')
}

export interface BilingualText {
  target: string;   // Target language (e.g., Spanish, Mandarin)
  native: string;   // Native language (e.g., English)
}

export interface NPC {
  id: string;
  name: BilingualText;
  location: string;
  personality: string;
  gender?: 'male' | 'female';
}

export interface Pet {
  id: string;
  name: BilingualText;
  defaultLocation: string;
  personality: string;
}

export interface Needs {
  energy: number;    // 0-100
  hunger: number;    // 0-100
  hygiene: number;   // 0-100
  bladder: number;   // 0-100 (100 = fine, 0 = urgent)
}

export interface GameTime {
  hour: number;      // 0-23
  minute: number;    // 0-59
}

export interface Location {
  id: string;
  name: BilingualText;
  objects: GameObject[];
  exits: Exit[];
}

export interface Exit {
  to: string;        // location id
  name: BilingualText;
}

export interface GameObject {
  id: string;
  name: BilingualText;
  state: ObjectState;
  actions: ActionType[];
  takeable?: boolean;
  consumable?: boolean;
  needsEffect?: Partial<Needs>;
}

export interface ObjectState {
  open?: boolean;
  on?: boolean;
  ringing?: boolean;
  contains?: string[];  // item ids
  [key: string]: unknown;
}

export type ActionType =
  | 'OPEN'
  | 'CLOSE'
  | 'TAKE'
  | 'PUT'
  | 'TURN_ON'
  | 'TURN_OFF'
  | 'EAT'
  | 'DRINK'
  | 'USE'
  | 'COOK'
  | 'LOOK'
  | 'DRESS'
  | 'PREPARE';

export interface Item {
  id: string;
  name: BilingualText;
  consumable?: boolean;
  needsEffect?: Partial<Needs>;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  hint?: string;
  checkComplete: (state: GameState) => boolean;
  nextGoalId?: string;
}

export interface VocabWord {
  target: string;
  native: string;
  category: 'noun' | 'verb' | 'adjective' | 'other';
  gender?: 'masculine' | 'feminine';
  // Mandarin-specific
  pinyin?: string;
  tones?: number[];
}

// AI Understanding types

export interface AIUnderstandingResult {
  understood: boolean;
  confidence: 'high' | 'medium' | 'low';
  intents: Intent[];  // Multiple intents for compound commands
  grammar: GrammarAnalysis;
  response: AIResponse;
}

export interface Intent {
  action: ActionType | 'GO' | 'WAKE_UP' | 'SHOWER' | 'BRUSH_TEETH' | 'LOOK' | 'DRESS' | 'PREPARE' | null;
  target: string | null;       // object id
  destination: string | null;  // location id for GO
}

export interface GrammarAnalysis {
  score: number;  // 0-100
  issues: GrammarIssue[];
}

export interface GrammarIssue {
  type: 'conjugation' | 'gender' | 'article' | 'word_order' | 'contraction' | 'other';
  original: string;
  corrected: string;
  explanation: string;
}

export interface AIResponse {
  successMessage: string;
  targetModel: string;
}

// Action execution types

export interface ActionResult {
  success: boolean;
  message: string;
  stateChanges?: Partial<GameState>;
  objectChanges?: { objectId: string; changes: Partial<ObjectState> }[];
  needsChanges?: Partial<Needs>;
  wordsUsed?: string[];  // Words the player successfully used in this action
}

// Structured module interaction data

export interface NPCDescription {
  id: string;
  personality: string;
  keyPhrases?: string[];
}

export interface ModuleInteraction {
  triggers: string[];
  location?: string;
  actions?: GameAction[];
  goalComplete?: string[];
  needsChanges?: Partial<Needs>;
  npcActions?: NPCActionData[];
  note?: string;
}

export interface TeachingNotes {
  title: string;
  patterns: string[];
}

// Module definition - each module exports one of these
export interface ModuleDefinition {
  name: string;
  displayName: string;
  locations: Record<string, Location>;
  npcs: NPC[];
  goals: Goal[];
  vocabulary: VocabWord[];
  startLocationId: string;
  startGoalId: string;
  locationIds: string[];
  unlockLevel: number;
  promptInstructions: string;
  pets?: Pet[];
  getPetsInLocation?: (locationId: string, petLocations: Record<string, string>) => Pet[];
  npcDescriptions?: NPCDescription[];
  interactions?: ModuleInteraction[];
  teachingNotes?: TeachingNotes;
}

// Two-pass AI types

export type ActionTypeLower = 'open' | 'close' | 'turn_on' | 'turn_off' | 'take' | 'put' | 'go' | 'position' | 'eat' | 'drink' | 'use' | 'cook' | 'pet' | 'feed' | 'talk' | 'give';

export interface GameAction {
  type: ActionTypeLower;
  objectId?: string;
  locationId?: string;
  position?: 'standing' | 'in_bed';
  npcId?: string;
  petId?: string;
}

// Pass 1: Parse Spanish input into validated actions
export interface ParseResponse {
  understood: boolean;
  grammar: {
    score: number;
    issues: GrammarIssue[];
  };
  spanishModel: string;
  valid: boolean;
  invalidReason?: string;
  actions: GameAction[];
  needsChanges?: Partial<Needs>;
}

// NPC-initiated actions that affect game state
export interface NPCActionData {
  npcId: string;
  type: 'add_object' | 'remove_object' | 'give_item' | 'take_item' | 'change_object' | 'move_player';
  objectId?: string;
  itemId?: string;
  changes?: Record<string, unknown>;
  locationId?: string;
  object?: {
    id: string;
    spanishName: string;
    englishName: string;
    actions?: string[];
    consumable?: boolean;
    needsEffect?: { hunger?: number; energy?: number; hygiene?: number; bladder?: number };
  };
}

// Pass 2: Narrate what happened given validated actions
export interface NarrateResponse {
  message: string;
  goalComplete?: string[];
  npcResponse?: {
    npcId: string;
    spanish: string;
    english: string;
    wantsItem?: string;
    actionText?: string;
  };
  npcActions?: NPCActionData[];
  petResponse?: {
    petId: string;
    reaction: string;
  };
}

// Vocabulary familiarity tracking

export type FamiliarityStage = 'new' | 'learning' | 'known';

export interface WordFamiliarity {
  wordId: string;              // Base word identifier (e.g., "refrigerator", "open")
  targetForms: string[];       // Target language forms ("nevera", "la nevera")
  nativeForm: string;          // Native language translation

  timesUsedCorrectly: number;  // Player used this word successfully
  timesSeenInContext: number;  // Word appeared in scene/response
  usesSinceLearning: number;   // Correct uses since reaching "learning" stage
  consecutiveCorrect: number;  // Streak of correct uses (resets on hint/error)
  lastUsed: number;            // Timestamp

  stage: FamiliarityStage;
}

export interface VocabularyProgress {
  words: Record<string, WordFamiliarity>;
  sessionCount: number;
  lastSessionDate: number;
}
