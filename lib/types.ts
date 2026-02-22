// View model types sent from server to client each turn.
// These are the minimal types the web UI needs — not the full GameState.

export interface UserSettings {
  showPinyin: boolean;      // Show romanization for Mandarin (default true)
  hideNpcDialogue: boolean; // Hide NPC text for listening practice (default false)
}

export const DEFAULT_SETTINGS: UserSettings = {
  showPinyin: true,
  hideNpcDialogue: false,
};

export interface BilingualText {
  target: string;
  native: string;
}

export interface ObjectCoords {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GameObjectView {
  id: string;
  name: BilingualText;
  vocabStage: 'new' | 'learning' | 'known';
  coords?: ObjectCoords;
  containerId?: string;
}

export interface NPCView {
  id: string;
  name: BilingualText;
  mood: string;
  portrait?: string;  // relative path, e.g. "vignettes/npc-roommate-default.png"
}

export interface ExitView {
  to: string;
  name: BilingualText;
  visited?: boolean;
}

export interface NeedsView {
  energy: number;
  hunger: number;
  hygiene: number;
  bladder: number;
}

export interface TutorialStepView {
  id: string;
  title: string;
  hint: string;
  completed: boolean;
  suggested: boolean;
}

export interface QuestView {
  id: string;
  title: BilingualText;
  description: string;
  hint?: string;
  active: boolean;
  completed: boolean;
}

export interface GrammarIssueView {
  type: string;
  original: string;
  corrected: string;
  explanation: string;
}

export interface NPCResponseView {
  npcName: string;
  target: string;
  native: string;
  actionText?: string;
  portrait?: string;  // full src path, e.g. "/scenes/home/vignettes/npc-roommate-default.png"
  voice?: string;     // OpenAI TTS voice name, e.g. "onyx"
}

export interface ItemView {
  id: string;
  name: BilingualText;
  cooked?: boolean;
}

export interface SceneInfo {
  image: string;       // filename, e.g. "kitchen.png"
  module: string;      // e.g. "home"
  languageId: string;  // e.g. "spanish"
  imageUrl?: string;   // Full blob URL for UGC modules
}

export interface VignetteHint {
  player?: string;         // vignette filename, e.g. "player-player-cooking.png"
  activeNpc?: string;      // NPC vignette filename when NPC speaks this turn
  objectChanges?: Array<{ objectId: string; image: string; generating?: boolean }>;
}

export interface TrophyData {
  vocabCounts: { new: number; learning: number; known: number };
  questsCompleted: number;
  badges: string[];
  level: number;
  totalPoints: number;
  locationsVisited: number;
  buildingsCompleted: string[];
}

export interface GameView {
  profile: string;
  languageId: string;
  locationId: string;
  locationName: BilingualText;
  module: string;
  objects: GameObjectView[];
  npcs: NPCView[];
  exits: ExitView[];
  needs: NeedsView;
  tutorial: TutorialStepView[];
  quests: QuestView[];
  inventory: ItemView[];
  level: number;
  points: number;
  pointsToNextLevel: number;
  completedSteps: string[];
  badges: string[];
  scene: SceneInfo | null;
  vignetteHint: VignetteHint | null;
  tutorialComplete: boolean;
  helpText: string;
  verbs: BilingualText[];

  // Set when the player moves to module_exit — frontend should redirect to /create
  redirectToModules?: boolean;

  trophies: TrophyData;

  settings: UserSettings;

  // Last turn results (null on init)
  turnResult: TurnResultView | null;
}

export interface TurnResultView {
  valid: boolean;
  understood: boolean;
  message: string;
  invalidReason?: string;
  grammarScore: number;
  grammarIssues: GrammarIssueView[];
  targetModel: string;
  npcResponse: NPCResponseView | null;
  pointsAwarded: number;
  leveledUp: boolean;
  stepsCompleted: string[];
  questsStarted: { title: BilingualText; description: string }[];
  questsCompleted: { title: BilingualText; points: number; badge?: string }[];
  questsCancelled: { title: BilingualText }[];
  hint?: string;
}
