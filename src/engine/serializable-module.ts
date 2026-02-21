/**
 * Serializable module format for storing user-generated modules in the database.
 * Mirrors ModuleDefinition but replaces runtime functions (checkComplete, triggerCondition)
 * with declarative CheckRule objects that can be JSON-serialized.
 *
 * IMPORTANT: User-generated modules use QUESTS only, NOT tutorials.
 * Tutorials are exclusive to the built-in home module — they are too linear for
 * freeform exploration. UGC modules guide players through quests instead.
 */
import type {
  GameState,
  Location,
  WorldObject,
  NPC,
  VocabWord,
  QuestReward,
  BilingualText,
  ModuleDefinition,
  TutorialStep,
  Quest,
} from './types';

// --- Serializable check rules ---

export type CheckRule =
  | { type: 'location'; locationId: string }
  | { type: 'playerTag'; tag: string; has: boolean }
  | { type: 'completedStep'; stepId: string }
  | { type: 'objectLocation'; objectId: string; location: string }
  | { type: 'objectTag'; objectId: string; tag: string; has: boolean }
  | { type: 'completedQuest'; questId: string }
  | { type: 'and'; rules: CheckRule[] };

export interface SerializableTutorialStep {
  id: string;
  title: string;
  description: string;
  hint?: string;
  completionRule: CheckRule;
  nextStepId?: string;
}

export interface SerializableQuest {
  id: string;
  title: BilingualText;
  description: string;
  completionHint: string;
  hint?: string;
  source: 'npc' | 'object' | 'event';
  sourceId?: string;
  module: string;
  triggerRule: CheckRule;
  reward: QuestReward;
  prereqs?: string[];
}

export interface SerializableModuleDefinition {
  name: string;
  displayName: string;
  locations: Record<string, Location>;
  objects: WorldObject[];
  npcs: NPC[];
  /** UGC modules should NOT have tutorials — tutorials are only for the built-in home module. */
  tutorial?: SerializableTutorialStep[];
  quests: SerializableQuest[];
  vocabulary: VocabWord[];
  guidance: string;
  startLocationId: string;
  /** Only set for modules with tutorials (i.e. built-in home module). */
  firstStepId?: string;
  locationIds: string[];
  unlockLevel: number;
}

// --- Rule evaluation ---

export function evaluateRule(rule: CheckRule, state: GameState): boolean {
  switch (rule.type) {
    case 'location':
      return state.currentLocation === rule.locationId;
    case 'playerTag':
      return rule.has === state.playerTags.includes(rule.tag);
    case 'completedStep':
      return state.completedSteps.includes(rule.stepId);
    case 'objectLocation': {
      const obj = state.objects.find(o => o.id === rule.objectId);
      return obj ? obj.location === rule.location : false;
    }
    case 'objectTag': {
      const obj = state.objects.find(o => o.id === rule.objectId);
      return obj ? rule.has === obj.tags.includes(rule.tag) : false;
    }
    case 'completedQuest':
      return state.completedQuests.includes(rule.questId);
    case 'and':
      return rule.rules.every(r => evaluateRule(r, state));
  }
}

// --- Hydration: SerializableModuleDefinition → ModuleDefinition ---

export function hydrateModule(serialized: SerializableModuleDefinition): ModuleDefinition {
  const tutorial: TutorialStep[] = (serialized.tutorial || []).map(step => ({
    id: step.id,
    title: step.title,
    description: step.description,
    hint: step.hint,
    checkComplete: (state: GameState) => evaluateRule(step.completionRule, state),
    nextStepId: step.nextStepId,
  }));

  const quests: Quest[] = serialized.quests.map(quest => ({
    id: quest.id,
    title: quest.title,
    description: quest.description,
    completionHint: quest.completionHint,
    hint: quest.hint,
    source: quest.source,
    sourceId: quest.sourceId,
    module: quest.module,
    triggerCondition: (state: GameState) => evaluateRule(quest.triggerRule, state),
    reward: quest.reward,
    prereqs: quest.prereqs,
  }));

  return {
    name: serialized.name,
    displayName: serialized.displayName,
    locations: serialized.locations,
    objects: serialized.objects,
    npcs: serialized.npcs,
    tutorial,
    quests,
    vocabulary: serialized.vocabulary,
    guidance: serialized.guidance,
    startLocationId: serialized.startLocationId,
    firstStepId: serialized.firstStepId || '',
    locationIds: Object.keys(serialized.locations),
    unlockLevel: serialized.unlockLevel,
  };
}
