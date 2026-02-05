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

  // Progression system
  points: number;
  level: number;
  totalPointsEarned: number;
  locationProgress: Record<string, LocationProgress>;  // Per-building goal tracking

  // Learn command tracking (5 per in-game day)
  learnCommandsUsedToday: number;
  lastLearnCommandDay: number;  // In-game day (hour / 24)
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

export interface NPC {
  id: string;
  name: { spanish: string; english: string };
  location: string;
  personality: string;
}

export interface Pet {
  id: string;
  name: { spanish: string; english: string };
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
  name: { spanish: string; english: string };
  objects: GameObject[];
  exits: Exit[];
}

export interface Exit {
  to: string;        // location id
  name: { spanish: string; english: string };
}

export interface GameObject {
  id: string;
  name: { spanish: string; english: string };
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
  name: { spanish: string; english: string };
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
  spanish: string;
  english: string;
  category: 'noun' | 'verb' | 'adjective' | 'other';
  gender?: 'masculine' | 'feminine';
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
  spanishModel: string;
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

// Vocabulary familiarity tracking

export type FamiliarityStage = 'new' | 'learning' | 'known';

export interface WordFamiliarity {
  wordId: string;              // Base word identifier (e.g., "refrigerator", "open")
  spanishForms: string[];      // All Spanish forms ("nevera", "la nevera", "refrigerador")
  englishForm: string;         // English translation

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
