/**
 * Server-only bridge to the game engine.
 * Maps the engine's mutation-based state model to GameView types for the UI.
 */
import 'server-only';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import type { GameView, TurnResultView, QuestView, ObjectCoords, SceneInfo, ExitView, NPCView, TutorialStepView, VignetteHint } from './types';
import { getCachedVignette, getPlaceholderPath, isGenerationEnabled, isGenerating, triggerGeneration } from './vignette-generator';
import { saveGame, loadGame } from './db';

// Engine imports (compiled by Next.js directly from TypeScript source)
import { processTurn } from '../src/modes/unified';
import { createInitialState } from '../src/engine/game-state';
import {
  setActiveModules,
  getStepById,
  getStartStepForBuilding,
  getModuleByName,
  getAllLocations,
  getAllNPCs,
  getNPCsInLocation,
  getAllStepsForBuilding,
  getAllQuestsForModule,
  getBuildingForLocation,
} from '../src/data/module-registry';
import { getLanguage, getDefaultLanguage, getAvailableLanguages } from '../src/languages/index';
import Anthropic from '@anthropic-ai/sdk';

// --- Serialization (GameState ↔ DB) ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeState(state: any): object {
  return { ...state, currentStep: state.currentStep?.id ?? null };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deserializeState(raw: any): any {
  return {
    ...raw,
    currentStep: raw.currentStep ? getStepById(raw.currentStep) ?? null : null,
  };
}

// --- Public API ---

export async function initGame(options: {
  module?: string;
  language?: string;
  profile: string;
}): Promise<GameView & { resumed?: boolean }> {

  const languageId = options.language || getDefaultLanguage();
  const languageConfig = getLanguage(languageId);
  if (!languageConfig) {
    throw new Error(`Unknown language: ${languageId}. Available: ${getAvailableLanguages().join(', ')}`);
  }
  setActiveModules(languageConfig.modules);

  // Check DB for existing save when no specific module requested
  if (!options.module) {
    try {
      const save = await loadGame(options.profile);
      if (save) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const savedLangConfig = getLanguage(save.languageId) || languageConfig;
        setActiveModules(savedLangConfig.modules);
        const state = deserializeState(save.state);
        const view = buildGameView(options.profile, save.languageId, state, null, undefined, (savedLangConfig as any).helpText);
        return { ...view, resumed: true };
      }
    } catch (err) {
      console.error('Failed to load save, starting fresh:', err);
    }
  }

  // No save found (or specific module requested) — create fresh state
  let moduleName = 'home';
  if (options.module) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = getModuleByName(options.module) as any;
    if (mod) {
      moduleName = mod.name;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = getModuleByName(moduleName) as any;
  const startLocationId = mod?.startLocationId || 'bedroom';
  const firstStepId = mod?.firstStepId;
  const forceStanding = moduleName !== 'home';

  let startStep = getStartStepForBuilding('home');
  if (firstStepId) {
    startStep = getStepById(firstStepId) || startStep;
  }

  const objects = mod?.objects || [];
  const npcs = mod?.npcs || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let state = createInitialState(startLocationId, startStep, objects, npcs) as any;

  if (forceStanding) {
    state = {
      ...state,
      playerTags: state.playerTags.filter((t: string) => t !== 'in_bed').concat(
        state.playerTags.includes('standing') ? [] : ['standing']
      ),
    };
  }

  state = { ...state, audioEnabled: false };

  await saveGame(options.profile, moduleName, languageId, serializeState(state));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return buildGameView(options.profile, languageId, state, null, undefined, (languageConfig as any).helpText);
}

export async function playTurn(profile: string, input: string): Promise<GameView> {
  const save = await loadGame(profile);
  if (!save) {
    throw new Error('No saved game found. Start a new game.');
  }

  const state = deserializeState(save.state);
  const languageConfig = getLanguage(save.languageId);
  if (!languageConfig) {
    throw new Error(`Language config not found: ${save.languageId}`);
  }
  setActiveModules(languageConfig.modules);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await processTurn(input, state, languageConfig) as any;

  const newState = result.newState;
  const module = getModuleForLocation(newState.currentLocation);
  await saveGame(profile, module, save.languageId, serializeState(newState));

  const turnResult = buildTurnResultView(result, newState);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return buildGameView(profile, save.languageId, newState, turnResult, result, (languageConfig as any).helpText);
}

// --- Scene Manifest Loading ---

interface SceneManifest {
  image: string;
  objects: Record<string, ObjectCoords>;
}

const manifestCache = new Map<string, SceneManifest | null>();

function loadManifest(languageId: string, module: string, locationId: string): SceneManifest | null {
  const key = `${languageId}/${module}/${locationId}`;
  const isDev = process.env.NODE_ENV !== 'production';
  if (!isDev && manifestCache.has(key)) return manifestCache.get(key)!;

  const scenesDir = join(process.cwd(), 'public', 'scenes', languageId, module);
  const manifestPath = join(scenesDir, `${locationId}.json`);

  if (!existsSync(manifestPath)) {
    if (!isDev) manifestCache.set(key, null);
    return null;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as SceneManifest;
    if (!isDev) manifestCache.set(key, manifest);
    return manifest;
  } catch {
    if (!isDev) manifestCache.set(key, null);
    return null;
  }
}

// --- Vignette Manifest Loading ---

interface VignetteManifest {
  player: {
    default: string;
    variants: Array<{ image: string; match: Record<string, unknown> }>;
  };
  npcs: Record<string, { default: string }>;
  pets: Record<string, { default: string }>;
  objects: Record<string, Array<{ image: string; match: Record<string, unknown> }>>;
}

const vignetteManifestCache = new Map<string, VignetteManifest | null>();

function loadVignetteManifest(languageId: string, module: string): VignetteManifest | null {
  const key = `${languageId}/${module}`;
  const isDev = process.env.NODE_ENV !== 'production';
  if (!isDev && vignetteManifestCache.has(key)) return vignetteManifestCache.get(key)!;

  const manifestPath = join(process.cwd(), 'public', 'scenes', languageId, module, 'vignettes', 'manifest.json');

  if (!existsSync(manifestPath)) {
    if (!isDev) vignetteManifestCache.set(key, null);
    return null;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as VignetteManifest;
    if (!isDev) vignetteManifestCache.set(key, manifest);
    return manifest;
  } catch {
    if (!isDev) vignetteManifestCache.set(key, null);
    return null;
  }
}

// Step IDs that map to specific player vignette actions
const STEP_TO_VIGNETTE_ACTION: Record<string, string> = {
  brush_teeth: 'brush_teeth',
  take_shower: 'shower',
};

// Convert tags array to a key-value state object for vignette matching
function tagsToStateObject(tags: string[]): Record<string, boolean> {
  const obj: Record<string, boolean> = {};
  for (const tag of tags) obj[tag] = true;
  return obj;
}

// Check if a vignette variant's match conditions are met by a state object
function matchesVignetteCondition(match: Record<string, unknown>, state: Record<string, unknown>): boolean {
  return Object.entries(match).every(([key, val]) => {
    if (val === true) return state[key] === true;
    if (val === false) return !state[key];
    return state[key] === val;
  });
}

// Derive the "last action" from mutations for vignette selection
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deriveLastAction(result: any): string | null {
  const mutations = result?.mutations || [];
  const stepsCompleted: string[] = (result?.stepsCompleted || []).map((g: { id?: string; title?: string }) => g.id || '');

  // Check step-based vignette first (more specific)
  for (const stepId of stepsCompleted) {
    if (STEP_TO_VIGNETTE_ACTION[stepId]) {
      return STEP_TO_VIGNETTE_ACTION[stepId];
    }
  }

  // Derive from mutations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const m of mutations as any[]) {
    if (m.type === 'tag' && m.add?.includes('cooked')) return 'cook';
    if (m.type === 'remove') return 'eat';
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveVignettes(state: any, result: any | null, languageId: string, module: string): VignetteHint | null {
  const manifest = loadVignetteManifest(languageId, module);

  // Even without a manifest, we may have cached/generated vignettes
  const hint: VignetteHint = {};

  if (!manifest) {
    // No pre-generated vignettes — check cache only when generation is enabled
    if (!isGenerationEnabled()) return null;

    const objectChanges: Array<{ objectId: string; image: string; generating?: boolean }> = [];
    const allObjectsState: Array<{ id: string; name: { native: string }; tags: string[]; location: string }> = state.objects || [];
    const objectsInLocation = allObjectsState.filter(
      (o: { location: string }) => o.location === state.currentLocation
    );

    for (const obj of objectsInLocation) {
      const tags = obj.tags || [];
      const visualTags = tags.filter(t => !['takeable', 'consumable', 'container'].includes(t));
      if (visualTags.length === 0) continue;

      const cached = getCachedVignette(languageId, module, obj.id, visualTags);
      if (cached) {
        objectChanges.push({ objectId: obj.id, image: cached });
        continue;
      }

      if (!isGenerating(languageId, module, obj.id, visualTags)) {
        triggerGeneration(languageId, module, obj.id, obj.name.native, visualTags);
      }
      objectChanges.push({ objectId: obj.id, image: getPlaceholderPath(), generating: true });
    }

    if (objectChanges.length > 0) {
      hint.objectChanges = objectChanges;
      return hint;
    }
    return null;
  }

  // 1. Player vignette — check transient actions first, fall back to persistent state
  if (result?.mutations?.length) {
    const lastAction = deriveLastAction(result);
    if (lastAction) {
      const transientMatch = manifest.player.variants.find(
        v => v.match.lastAction === lastAction
      );
      if (transientMatch) {
        hint.player = transientMatch.image;
      }
    }
  }

  // Fall back to persistent state (playerTags → playerPosition mapping for manifest compat)
  if (!hint.player) {
    const playerTags: string[] = state.playerTags || [];
    // Map playerTags to a playerPosition value for manifest compatibility
    const playerPosition = playerTags.includes('in_bed') ? 'in_bed' : 'standing';
    const persistentMatch = manifest.player.variants.find(
      v => v.match.playerPosition === playerPosition
    );
    hint.player = persistentMatch?.image || manifest.player.default;
  }

  // 2. Active NPC vignette (when NPC speaks this turn)
  if (result?.npcResponse?.npcId) {
    const npcId = result.npcResponse.npcId;
    const npcVignette = manifest.npcs[npcId]?.default || manifest.pets[npcId]?.default;
    if (npcVignette) {
      hint.activeNpc = npcVignette;
    }
  }

  // 3. Object state vignettes — match tags against vignette manifest conditions
  const objectChanges: Array<{ objectId: string; image: string; generating?: boolean }> = [];
  const allObjectsState: Array<{ id: string; name: { native: string }; tags: string[]; location: string }> = state.objects || [];

  // Get objects in current location (including containers)
  const objectsInLocation = allObjectsState.filter(
    (o: { location: string }) => o.location === state.currentLocation
  );

  for (const obj of objectsInLocation) {
    const tags = obj.tags || [];

    // First try pre-generated manifest
    if (manifest?.objects[obj.id]) {
      const effectiveState = tagsToStateObject(tags);
      let found = false;
      for (const variant of manifest.objects[obj.id]) {
        if (matchesVignetteCondition(variant.match, effectiveState)) {
          objectChanges.push({ objectId: obj.id, image: variant.image });
          found = true;
          break;
        }
      }
      if (found) continue;
    }

    // Fall back to dynamic vignette cache/generation (dev only)
    if (isGenerationEnabled()) {
      const visualTags = tags.filter(t => !['takeable', 'consumable', 'container'].includes(t));
      if (visualTags.length === 0) continue;

      const cached = getCachedVignette(languageId, module, obj.id, visualTags);
      if (cached) {
        objectChanges.push({ objectId: obj.id, image: cached });
        continue;
      }

      if (!isGenerating(languageId, module, obj.id, visualTags)) {
        triggerGeneration(languageId, module, obj.id, obj.name.native, visualTags);
      }
      objectChanges.push({ objectId: obj.id, image: getPlaceholderPath(), generating: true });
    }
  }

  if (objectChanges.length > 0) {
    hint.objectChanges = objectChanges;
  }

  return hint;
}

// Dynamic module lookup for any location
function getModuleForLocation(locationId: string): string {
  try {
    return getBuildingForLocation(locationId) || 'home';
  } catch {
    return 'home';
  }
}

// --- View Model Builders ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildGameView(profile: string, langId: string, state: any, turnResult: TurnResultView | null, result?: any, helpText?: string): GameView {
  const locationId = state.currentLocation;
  const module = getModuleForLocation(locationId) || 'home';
  const manifest = loadManifest(langId, module, locationId);

  // Objects in current location from flat list
  const allObjectsState: Array<{ id: string; name: { target: string; native: string }; location: string; tags: string[] }> = state.objects || [];

  // Visible objects: in current location + in open containers at current location
  const objectsHere = allObjectsState.filter(o => o.location === locationId);
  const inOpenContainers = allObjectsState.filter(o => {
    if (o.location === 'removed') return false;
    const container = allObjectsState.find(c => c.id === o.location);
    return container !== undefined && container.location === locationId && container.tags.includes('open');
  });
  const visibleObjects = [...objectsHere, ...inOpenContainers];

  const objects = visibleObjects.map(obj => {
    const isInContainer = obj.location !== locationId && obj.location !== 'inventory' && obj.location !== 'removed';
    return {
      id: obj.id,
      name: obj.name,
      vocabStage: getVocabStageForObject(state.vocabulary, obj.id),
      coords: manifest?.objects?.[obj.id] || undefined,
      containerId: isInContainer ? obj.location : undefined,
    };
  });

  // Scene info
  const scene: SceneInfo | null = manifest
    ? { image: manifest.image, module, languageId: langId }
    : null;

  // Exits from locations lookup
  const allLocs = getAllLocations();
  const currentLoc = allLocs[locationId] as { exits: Array<{ to: string; name: { target: string; native: string } }>; name: { target: string; native: string }; verbs?: Array<{ target: string; native: string }> } | undefined;
  const visitedLocations: string[] = state.visitedLocations || [];
  const exits: ExitView[] = (currentLoc?.exits || []).map(exit => ({
    to: exit.to,
    name: exit.name,
    visited: visitedLocations.includes(exit.to),
  }));

  // NPCs in this location (check runtime npcStates for current location)
  const vignetteManifest = loadVignetteManifest(langId, module);
  const allNPCsDef = getAllNPCs() as Array<{ id: string; name: { target: string; native: string }; location: string; isPet?: boolean; gender?: string }>;
  const npcsHere = allNPCsDef.filter(npc => {
    const runtimeState = state.npcStates?.[npc.id];
    return runtimeState
      ? runtimeState.location === locationId
      : npc.location === locationId;
  });
  const npcs: NPCView[] = npcsHere.map(npc => ({
    id: npc.id,
    name: npc.name,
    mood: state.npcStates?.[npc.id]?.mood || '',
    portrait: vignetteManifest?.npcs[npc.id]?.default || vignetteManifest?.pets?.[npc.id]?.default || undefined,
  }));

  // Inventory from flat object list
  const inventory = allObjectsState
    .filter(o => o.location === 'inventory')
    .map(o => ({
      id: o.id,
      name: o.name,
      cooked: (o.tags || []).includes('cooked'),
    }));

  // Points to next level: 150 * level
  const pointsToNextLevel = 150 * state.level;

  // Resolve vignettes for this turn
  const vignetteHint = resolveVignettes(state, result || null, langId, module);

  // Attach NPC portrait to turn result if applicable
  if (turnResult?.npcResponse && vignetteHint?.activeNpc) {
    turnResult.npcResponse.portrait = `/scenes/${langId}/${module}/vignettes/${vignetteHint.activeNpc}`;
  }

  // Location name from allLocations
  const locationName = currentLoc?.name || { target: locationId, native: locationId };

  // Tutorial is complete when all steps for this building are done
  const tutorialSteps = buildTutorialChecklist(state);
  const tutorialComplete = tutorialSteps.length > 0 && tutorialSteps.every(s => s.completed);

  return {
    profile,
    languageId: langId,
    locationId,
    locationName,
    module,
    objects,
    npcs,
    exits,
    needs: state.needs,
    tutorial: tutorialSteps,
    quests: buildQuestList(state, module),
    inventory,
    level: state.level,
    points: state.points,
    pointsToNextLevel,
    completedSteps: state.completedSteps,
    badges: state.badges || [],
    scene,
    vignetteHint,
    tutorialComplete,
    helpText: helpText || '',
    verbs: currentLoc?.verbs || [],
    turnResult,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTutorialChecklist(state: any): TutorialStepView[] {
  const building = getBuildingForLocation(state.currentLocation);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const steps = getAllStepsForBuilding(building) as any[];
  const suggestedId = state.currentStep?.id || null;

  return steps.map((g: { id: string; title: string; hint?: string }) => ({
    id: g.id,
    title: g.title,
    hint: g.hint || '',
    completed: state.completedSteps.includes(g.id),
    suggested: g.id === suggestedId,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildQuestList(state: any, module: string): QuestView[] {
  const building = getBuildingForLocation(state.currentLocation);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quests = getAllQuestsForModule(building) as any[];
  const activeIds: string[] = state.activeQuests || [];
  const completedIds: string[] = state.completedQuests || [];

  return quests
    .filter(q => activeIds.includes(q.id) || completedIds.includes(q.id))
    .map(q => ({
      id: q.id,
      title: q.title,
      description: q.description,
      hint: q.hint,
      active: activeIds.includes(q.id),
      completed: completedIds.includes(q.id),
    }));
}

function getVocabStageForObject(vocabulary: { words: Record<string, { stage: string }> }, objectId: string): 'new' | 'learning' | 'known' {
  const word = vocabulary?.words?.[objectId];
  if (!word) return 'new';
  return word.stage as 'new' | 'learning' | 'known';
}

// Map NPC gender to Gemini TTS voice
function npcVoice(npcId: string): string {
  const allNPCsDef = getAllNPCs() as Array<{ id: string; gender?: string; isPet?: boolean }>;
  const npc = allNPCsDef.find(n => n.id === npcId);
  if (npc?.gender === 'female') return 'Leda';
  if (npc?.gender === 'male') return 'Charon';
  return 'Puck'; // default for pets, unknown
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTurnResultView(result: any, state: any): TurnResultView {
  const view: TurnResultView = {
    valid: result.valid,
    understood: result.understood ?? true,
    message: result.message || '',
    invalidReason: result.invalidReason,
    grammarScore: result.grammar?.score ?? 0,
    grammarIssues: (result.grammar?.issues || []).map((issue: { type: string; original: string; corrected: string; explanation: string }) => ({
      type: issue.type,
      original: issue.original,
      corrected: issue.corrected,
      explanation: issue.explanation,
    })),
    targetModel: result.targetModel || '',
    npcResponse: result.npcResponse?.npcId ? {
      npcName: result.npcResponse.npcId,
      target: result.npcResponse.target || '',
      native: result.npcResponse.english || '',
      actionText: result.npcResponse.actionText,
      voice: npcVoice(result.npcResponse.npcId),
    } : null,
    pointsAwarded: result.pointsAwarded || 0,
    leveledUp: result.leveledUp || false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stepsCompleted: (result.stepsCompleted || []).map((g: any) => g.title || g.id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    questsStarted: (result.questsStarted || []).map((q: any) => ({
      title: q.title,
      description: q.description,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    questsCompleted: (result.questsCompleted || []).map((q: any) => ({
      title: q.title,
      points: q.reward?.points || 0,
      badge: q.reward?.badge?.name,
    })),
  };

  // Include hint when action failed and there's a current goal with a hint
  if (!result.valid && state.currentStep?.hint) {
    view.hint = state.currentStep.hint;
  }

  return view;
}

export function getAvailableModules(): string[] {
  return ['home', 'restaurant'];
}

// --- /learn Command ---

export async function handleLearnCommand(topic: string): Promise<{ lesson: string } | { error: string }> {
  try {
    const client = new Anthropic();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are a friendly Spanish language tutor. Give a brief, helpful lesson on the requested topic.

Guidelines:
- Keep it concise (under 300 words)
- Use simple explanations with clear examples
- Include 3-5 example sentences in Spanish with English translations
- Focus on practical usage, not linguistic theory
- If the topic is vague, pick a common interpretation
- Use markdown formatting for clarity`,
      messages: [
        { role: 'user', content: `Teach me about: ${topic}` },
      ],
    });

    const content = response.content[0];
    const lesson = content.type === 'text' ? content.text : 'Could not generate lesson.';

    return { lesson };
  } catch {
    return { error: 'Could not generate lesson. Try again.' };
  }
}
