// Core game types — Generic mutation-based engine

export interface GameState {
  currentLocation: string;        // location ID
  visitedLocations: string[];     // location IDs the player has been to
  playerTags: string[];           // ['standing'] or ['in_bed']
  statusEffects: string[];        // Active status effect IDs: ['hungry', 'needs_bathroom']
  turnCount: number;              // Total turns processed (for timer math)
  statusTimers: Record<string, number>; // category -> turn of last reset
  objects: WorldObject[];         // ALL objects in the world (flat list)
  npcStates: Record<string, NPCRuntimeState>;
  npcChatHistory: Record<string, NPCChatEntry[]>;
  time: GameTime;

  // Tutorial
  currentStep: TutorialStep | null;
  completedSteps: string[];

  // Quests
  activeQuests: string[];
  completedQuests: string[];
  badges: string[];

  // Progression
  points: number;
  level: number;
  totalPointsEarned: number;
  locationProgress: Record<string, LocationProgress>;

  // Vocabulary
  vocabulary: VocabularyProgress;
  learnedWords: string[];

  // Grammar tracking (cumulative accuracy per issue type)
  grammarStats: Record<string, { correct: number; total: number }>;

  // Turn history (for grammar context)
  turnHistory: TurnHistoryEntry[];

  profile?: string;
  audioEnabled: boolean;
  schemaVersion: number;
}

export interface TurnHistoryEntry {
  input: string;
  narration: string;
  grammarTip?: string;
}

export interface LocationProgress {
  currentStepId: string | null;
  completedSteps: string[];
  difficulty: number;
  chainComplete: boolean;
}

export interface NPCRuntimeState {
  mood: string;
  location: string;
  lastResponse?: string;
  wantsItem?: string;
}

export interface NPCChatEntry {
  playerInput: string;
  npcResponse?: string;
  npcAction?: string;
  questCompleted?: string;
  moodAfter?: string;
  summary?: string;
}

export interface BilingualText {
  target: string;
  native: string;
}

// Objects with tags — replaces GameObject + Item + ObjectState
export interface WorldObject {
  id: string;
  name: BilingualText;
  location: string;       // location ID, 'inventory', container ID, or 'removed'
  tags: string[];          // ALL state + capabilities: ['open', 'cooked', 'takeable', 'consumable', 'ringing']
}

// NPCs — pets are NPCs with isPet: true
export interface NPC {
  id: string;
  name: BilingualText;
  location: string;
  personality: string;
  gender?: 'male' | 'female';
  isPet?: boolean;
  appearance?: string;
}

// Status effects — replaces old numeric Needs system
export type StatusSeverity = 'mild' | 'moderate' | 'urgent';

export interface StatusEffectDef {
  id: string;               // 'hungry', 'very_hungry', 'starving'
  label: string;            // 'Very Hungry'
  severity: StatusSeverity;
  icon: string;             // '🍔'
  category: string;         // 'hunger' — groups related effects
}

export interface StatusTimerConfig {
  category: string;
  triggerEvery: number;     // Turns between escalations
  escalation: string[];     // Effect IDs in order: ['hungry', 'very_hungry', 'starving']
}

export interface GameTime {
  hour: number;
  minute: number;
}

export interface Location {
  id: string;
  name: BilingualText;
  exits: Exit[];
  verbs?: BilingualText[];
  sceneDescription?: string;
}

export interface Exit {
  to: string;
  name: BilingualText;
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  hint?: string;
  checkComplete: (state: GameState) => boolean;
  nextStepId?: string;
}

export interface Quest {
  id: string;
  title: BilingualText;
  description: string;
  completionHint: string;
  hint?: string;
  source: 'npc' | 'object' | 'event';
  sourceId?: string;
  module: string;
  triggerCondition: (state: GameState) => boolean;
  reward: QuestReward;
  prereqs?: string[];
}

export interface QuestReward {
  points?: number;
  badge?: { id: string; name: string };
  vocabBoost?: string[];
  npcMood?: { npcId: string; mood: string };
}

export interface VocabWord {
  target: string;
  native: string;
  category: 'noun' | 'verb' | 'adjective' | 'other';
  gender?: 'masculine' | 'feminine';
  pinyin?: string;
  tones?: number[];
}

// Generic mutations — the 7 ways state can change
export type Mutation =
  | { type: 'go'; locationId: string }
  | { type: 'move'; objectId: string; to: string }
  | { type: 'tag'; objectId: string; add?: string[]; remove?: string[] }
  | { type: 'playerTag'; add?: string[]; remove?: string[] }
  | { type: 'status'; add?: string[]; remove?: string[] }
  | { type: 'create'; object: WorldObject }
  | { type: 'remove'; objectId: string }
  | { type: 'npcMood'; npcId: string; mood: string };

// Pass 1: Parse target language input into grammar feedback + mutations
export interface ParseResponse {
  understood: boolean;
  grammar: {
    score: number;
    issues: GrammarIssue[];
  };
  targetModel: string;
  valid: boolean;
  invalidReason?: string;
  mutations: Mutation[];
}

// Pass 2: Narrate what happened given applied mutations
export interface NarrateResponse {
  message: string;
  stepsCompleted?: string[];
  questsStarted?: string[];
  questsCompleted?: string[];
  questsCancelled?: string[];
  npcResponse?: {
    npcId: string;
    target?: string;
    english: string;
    wantsItem?: string;
    actionText?: string;
  };
  mutations?: Mutation[];   // NPC-initiated mutations
}

export interface GrammarIssue {
  type: string;
  original: string;
  corrected: string;
  explanation: string;
}

// Module definition
export interface ModuleDefinition {
  name: string;
  displayName: string;
  locations: Record<string, Location>;
  objects: WorldObject[];
  npcs: NPC[];
  tutorial: TutorialStep[];
  quests: Quest[];
  vocabulary: VocabWord[];
  guidance: string;
  startLocationId: string;
  firstStepId: string;
  locationIds: string[];
  unlockLevel: number;
}

// Vocabulary familiarity tracking
export type FamiliarityStage = 'new' | 'learning' | 'known';

export interface WordFamiliarity {
  wordId: string;
  targetForms: string[];
  nativeForm: string;
  timesUsedCorrectly: number;
  timesSeenInContext: number;
  usesSinceLearning: number;
  consecutiveCorrect: number;
  lastUsed: number;
  stage: FamiliarityStage;
  srsInterval: number;    // days until next review
  srsEase: number;        // ease factor (SM-2, starts at 2.5)
  srsNextReview: number;  // timestamp when next review is due
  srsDueCount: number;    // times reviewed via flashcards
}

export interface VocabularyProgress {
  words: Record<string, WordFamiliarity>;
  sessionCount: number;
  lastSessionDate: number;
}
