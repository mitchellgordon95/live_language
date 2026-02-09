// View model types sent from server to client each turn.
// These are the minimal types the web UI needs — not the full GameState.

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
}

export interface NPCView {
  id: string;
  name: BilingualText;
}

export interface NeedsView {
  energy: number;
  hunger: number;
  hygiene: number;
  bladder: number;
}

export interface GoalView {
  id: string;
  title: string;
  hint: string;
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
}

export interface ItemView {
  id: string;
  name: BilingualText;
}

export interface SceneInfo {
  image: string;       // filename, e.g. "kitchen.png"
  module: string;      // e.g. "home"
}

export interface GameView {
  sessionId: string;
  locationId: string;
  locationName: BilingualText;
  objects: GameObjectView[];
  npcs: NPCView[];
  needs: NeedsView;
  goal: GoalView | null;
  inventory: ItemView[];
  level: number;
  points: number;
  pointsToNextLevel: number;
  completedGoals: string[];
  scene: SceneInfo | null;

  // Last turn results (null on init)
  turnResult: TurnResultView | null;
}

export interface TurnResultView {
  valid: boolean;
  message: string;
  invalidReason?: string;
  grammarScore: number;
  grammarIssues: GrammarIssueView[];
  targetModel: string;
  npcResponse: NPCResponseView | null;
  pointsAwarded: number;
  leveledUp: boolean;
  goalsCompleted: string[];
}
