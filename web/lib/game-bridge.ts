/**
 * Server-only bridge to the game engine.
 * Uses dynamic imports with webpackIgnore to load the compiled game engine
 * from the parent project's dist/ directory at runtime (Node.js resolves it).
 *
 * Maps the engine's mutation-based state model to GameView types for the UI.
 */
import 'server-only';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import type { GameView, TurnResultView, QuestView, ObjectCoords, SceneInfo, ExitView, NPCView, TutorialStepView, VignetteHint } from './types';
import { getCachedVignette, getPlaceholderPath, isGenerationEnabled, isGenerating, triggerGeneration } from './vignette-generator';

// Path to compiled game engine
const ENGINE_ROOT = join(process.cwd(), '..', 'dist');

// Cached engine modules
let engine: {
  processTurn: (...args: unknown[]) => Promise<unknown>;
  loadVocabulary: (profile?: string) => unknown;
  saveVocabulary: (vocab: unknown, profile?: string) => void;
  createInitialState: (...args: unknown[]) => unknown;
  getStepById: (id: string) => unknown;
  getStartStepForBuilding: (building: string) => unknown;
  getModuleByName: (name: string) => unknown;
  allLocations: Record<string, unknown>;
  allNPCs: unknown[];
  getLanguage: (id: string) => unknown;
  getDefaultLanguage: () => string;
  getAvailableLanguages: () => string[];
  getNPCsInLocation: (locationId: string) => unknown[];
  getVocabStage: (vocab: unknown, objectId: string) => string;
  getAllStepsForBuilding: (building: string) => unknown[];
  getAllQuestsForModule: (moduleName: string) => unknown[];
  getBuildingForLocation: (locationId: string) => string;
} | null = null;

async function getEngine() {
  if (engine) return engine;

  // Load dotenv from parent project
  const dotenvPath = join(process.cwd(), '..', '.env.local');
  const dotenv = await import(/* webpackIgnore: true */ 'dotenv');
  dotenv.config({ path: dotenvPath });

  const [unified, gameStateMod, registryMod, languagesMod, vocabMod] = await Promise.all([
    import(/* webpackIgnore: true */ join(ENGINE_ROOT, 'modes', 'unified.js')),
    import(/* webpackIgnore: true */ join(ENGINE_ROOT, 'engine', 'game-state.js')),
    import(/* webpackIgnore: true */ join(ENGINE_ROOT, 'data', 'module-registry.js')),
    import(/* webpackIgnore: true */ join(ENGINE_ROOT, 'languages', 'index.js')),
    import(/* webpackIgnore: true */ join(ENGINE_ROOT, 'engine', 'vocabulary.js')),
  ]);

  engine = {
    processTurn: unified.processTurn,
    loadVocabulary: unified.loadVocabulary,
    saveVocabulary: unified.saveVocabulary,
    createInitialState: gameStateMod.createInitialState,
    getStepById: registryMod.getStepById,
    getStartStepForBuilding: registryMod.getStartStepForBuilding,
    getModuleByName: registryMod.getModuleByName,
    allLocations: registryMod.allLocations,
    allNPCs: registryMod.allNPCs,
    getNPCsInLocation: registryMod.getNPCsInLocation,
    getLanguage: languagesMod.getLanguage,
    getDefaultLanguage: languagesMod.getDefaultLanguage,
    getAvailableLanguages: languagesMod.getAvailableLanguages,
    getVocabStage: (vocab: unknown, objectId: string) => {
      const v = vocab as { words: Record<string, { stage: string }> };
      return v.words[objectId]?.stage || 'new';
    },
    getAllStepsForBuilding: registryMod.getAllStepsForBuilding,
    getAllQuestsForModule: registryMod.getAllQuestsForModule,
    getBuildingForLocation: registryMod.getBuildingForLocation,
  };

  return engine;
}

// --- Session Management ---

interface GameSession {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any; // GameState from engine
  languageId: string;
}

const sessions = new Map<string, GameSession>();

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// --- Public API ---

export async function initGame(options: {
  module?: string;
  language?: string;
  profile?: string;
}): Promise<GameView> {
  const eng = await getEngine();

  const languageId = options.language || eng.getDefaultLanguage();
  const languageConfig = eng.getLanguage(languageId);
  if (!languageConfig) {
    throw new Error(`Unknown language: ${languageId}. Available: ${eng.getAvailableLanguages().join(', ')}`);
  }

  const vocab = eng.loadVocabulary(options.profile || undefined);

  // Determine start location and goal from module
  let moduleName = 'home';
  if (options.module) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = eng.getModuleByName(options.module) as any;
    if (mod) {
      moduleName = mod.name;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = eng.getModuleByName(moduleName) as any;
  const startLocationId = mod?.startLocationId || 'bedroom';
  const firstStepId = mod?.firstStepId;
  const forceStanding = moduleName !== 'home';

  let startStep = eng.getStartStepForBuilding('home');
  if (firstStepId) {
    startStep = eng.getStepById(firstStepId) || startStep;
  }

  // New createInitialState takes (startLocationId, startStep, objects, npcs, existingVocabulary)
  const objects = mod?.objects || [];
  const npcs = mod?.npcs || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let state = eng.createInitialState(startLocationId, startStep, objects, npcs, vocab) as any;

  if (forceStanding) {
    state = {
      ...state,
      playerTags: state.playerTags.filter((t: string) => t !== 'in_bed').concat(
        state.playerTags.includes('standing') ? [] : ['standing']
      ),
    };
  }

  // Disable audio in web mode, set vocab profile
  state = { ...state, audioEnabled: false, profile: options.profile || undefined };

  const sessionId = generateSessionId();
  sessions.set(sessionId, { state, languageId });

  return buildGameView(sessionId, state, null, undefined, (languageConfig as any).helpText);
}

export async function playTurn(sessionId: string, input: string): Promise<GameView> {
  const eng = await getEngine();
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error('Session not found. Start a new game.');
  }

  const languageConfig = eng.getLanguage(session.languageId);
  if (!languageConfig) {
    throw new Error(`Language config not found: ${session.languageId}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await eng.processTurn(input, session.state, languageConfig) as any;

  session.state = result.newState;
  sessions.set(sessionId, session);

  // Save vocabulary periodically
  eng.saveVocabulary(session.state.vocabulary, session.state.profile);

  const turnResult = buildTurnResultView(result, session.state);
  return buildGameView(sessionId, session.state, turnResult, result, (languageConfig as any).helpText);
}

// --- Scene Manifest Loading ---

interface SceneManifest {
  image: string;
  objects: Record<string, ObjectCoords>;
}

const manifestCache = new Map<string, SceneManifest | null>();

function loadManifest(module: string, locationId: string): SceneManifest | null {
  const key = `${module}/${locationId}`;
  if (manifestCache.has(key)) return manifestCache.get(key)!;

  const scenesDir = join(process.cwd(), 'public', 'scenes', module);
  const manifestPath = join(scenesDir, `${locationId}.json`);

  if (!existsSync(manifestPath)) {
    manifestCache.set(key, null);
    return null;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as SceneManifest;
    manifestCache.set(key, manifest);
    return manifest;
  } catch {
    manifestCache.set(key, null);
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

function loadVignetteManifest(module: string): VignetteManifest | null {
  if (vignetteManifestCache.has(module)) return vignetteManifestCache.get(module)!;

  const manifestPath = join(process.cwd(), 'public', 'scenes', module, 'vignettes', 'manifest.json');

  if (!existsSync(manifestPath)) {
    vignetteManifestCache.set(module, null);
    return null;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as VignetteManifest;
    vignetteManifestCache.set(module, manifest);
    return manifest;
  } catch {
    vignetteManifestCache.set(module, null);
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
function resolveVignettes(state: any, result: any | null, module: string): VignetteHint | null {
  const manifest = loadVignetteManifest(module);

  // Even without a manifest, we may have cached/generated vignettes
  const hint: VignetteHint = {};

  if (!manifest) {
    // No pre-generated vignettes — still check cache for object vignettes
    const objectChanges: Array<{ objectId: string; image: string; generating?: boolean }> = [];
    const allObjects: Array<{ id: string; name: { native: string }; tags: string[]; location: string }> = state.objects || [];
    const objectsInLocation = allObjects.filter(
      (o: { location: string }) => o.location === state.currentLocation
    );

    for (const obj of objectsInLocation) {
      const tags = obj.tags || [];
      const visualTags = tags.filter(t => !['takeable', 'consumable', 'container'].includes(t));
      if (visualTags.length === 0) continue;

      const cached = getCachedVignette(module, obj.id, visualTags);
      if (cached) {
        objectChanges.push({ objectId: obj.id, image: cached });
        continue;
      }

      if (isGenerationEnabled()) {
        if (!isGenerating(module, obj.id, visualTags)) {
          triggerGeneration(module, obj.id, obj.name.native, visualTags);
        }
        objectChanges.push({ objectId: obj.id, image: getPlaceholderPath(), generating: true });
      }
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
  const allObjects: Array<{ id: string; name: { native: string }; tags: string[]; location: string }> = state.objects || [];

  // Get objects in current location (including containers)
  const objectsInLocation = allObjects.filter(
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

    // Skip objects with no meaningful visual state tags
    const visualTags = tags.filter(t => !['takeable', 'consumable', 'container'].includes(t));
    if (visualTags.length === 0) continue;

    // Check vignette cache
    const cached = getCachedVignette(module, obj.id, visualTags);
    if (cached) {
      // Cached vignette found — image is a full URL path, extract just the filename portion
      objectChanges.push({ objectId: obj.id, image: cached });
      continue;
    }

    // Cache miss — trigger generation or show placeholder
    if (isGenerationEnabled()) {
      if (isGenerating(module, obj.id, visualTags)) {
        objectChanges.push({ objectId: obj.id, image: getPlaceholderPath(), generating: true });
      } else {
        triggerGeneration(module, obj.id, obj.name.native, visualTags);
        objectChanges.push({ objectId: obj.id, image: getPlaceholderPath(), generating: true });
      }
    }
    // When generation is disabled and no cached vignette, don't show anything
  }

  if (objectChanges.length > 0) {
    hint.objectChanges = objectChanges;
  }

  return hint;
}

// Dynamic module lookup for any location (no more hardcoded map)
function getModuleForLocation(locationId: string): string {
  if (!engine) return 'home';
  try {
    return engine.getBuildingForLocation(locationId) || 'home';
  } catch {
    return 'home';
  }
}

// --- View Model Builders ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildGameView(sessionId: string, state: any, turnResult: TurnResultView | null, result?: any, helpText?: string): GameView {
  const locationId = state.currentLocation;
  const module = getModuleForLocation(locationId) || 'home';
  const manifest = loadManifest(module, locationId);

  // Objects in current location from flat list
  const allObjects: Array<{ id: string; name: { target: string; native: string }; location: string; tags: string[] }> = state.objects || [];

  // Visible objects: in current location + in open containers at current location
  const objectsHere = allObjects.filter(o => o.location === locationId);
  const inOpenContainers = allObjects.filter(o => {
    if (o.location === 'removed') return false;
    const container = allObjects.find(c => c.id === o.location);
    return container !== undefined && container.location === locationId && container.tags.includes('open');
  });
  const visibleObjects = [...objectsHere, ...inOpenContainers];

  const objects = visibleObjects.map(obj => {
    // Determine containerId: if object's location is another object (not a location ID and not 'inventory')
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
    ? { image: manifest.image, module }
    : null;

  // Exits from allLocations lookup
  const currentLoc = (engine as NonNullable<typeof engine>).allLocations[locationId] as { exits: Array<{ to: string; name: { target: string; native: string } }>; name: { target: string; native: string }; verbs?: Array<{ target: string; native: string }> } | undefined;
  const visitedLocations: string[] = state.visitedLocations || [];
  const exits: ExitView[] = (currentLoc?.exits || []).map(exit => ({
    to: exit.to,
    name: exit.name,
    visited: visitedLocations.includes(exit.to),
  }));

  // NPCs in this location (check runtime npcStates for current location)
  const vignetteManifest = loadVignetteManifest(module);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allNPCsDef = (engine as any).allNPCs as Array<{ id: string; name: { target: string; native: string }; location: string; isPet?: boolean; gender?: string }>;
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
  const inventory = allObjects
    .filter(o => o.location === 'inventory')
    .map(o => ({
      id: o.id,
      name: o.name,
      cooked: (o.tags || []).includes('cooked'),
    }));

  // Points to next level: 150 * level
  const pointsToNextLevel = 150 * state.level;

  // Resolve vignettes for this turn
  const vignetteHint = resolveVignettes(state, result || null, module);

  // Attach NPC portrait to turn result if applicable
  if (turnResult?.npcResponse && vignetteHint?.activeNpc) {
    turnResult.npcResponse.portrait = `/scenes/${module}/vignettes/${vignetteHint.activeNpc}`;
  }

  // Location name from allLocations
  const locationName = currentLoc?.name || { target: locationId, native: locationId };

  // Tutorial is complete when all steps for this building are done
  const tutorialSteps = buildTutorialChecklist(state);
  const tutorialComplete = tutorialSteps.length > 0 && tutorialSteps.every(s => s.completed);

  return {
    sessionId,
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
  const building = (engine as NonNullable<typeof engine>).getBuildingForLocation(state.currentLocation);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allSteps = (engine as NonNullable<typeof engine>).getAllStepsForBuilding(building) as any[];
  const suggestedId = state.currentStep?.id || null;

  return allSteps.map((g: { id: string; title: string; hint?: string }) => ({
    id: g.id,
    title: g.title,
    hint: g.hint || '',
    completed: state.completedSteps.includes(g.id),
    suggested: g.id === suggestedId,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildQuestList(state: any, module: string): QuestView[] {
  const building = (engine as NonNullable<typeof engine>).getBuildingForLocation(state.currentLocation);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allQuests = (engine as NonNullable<typeof engine>).getAllQuestsForModule(building) as any[];
  const activeIds: string[] = state.activeQuests || [];
  const completedIds: string[] = state.completedQuests || [];

  // Show active quests + recently completed quests
  return allQuests
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allNPCsDef = (engine as any).allNPCs as Array<{ id: string; gender?: string; isPet?: boolean }>;
  const npc = allNPCsDef.find(n => n.id === npcId);
  if (npc?.gender === 'female') return 'Leda';
  if (npc?.gender === 'male') return 'Charon';
  return 'Puck'; // default for pets, unknown
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTurnResultView(result: any, state: any): TurnResultView {
  // TurnResult fields are now flat (no more result.response wrapper)
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
    targetModel: result.spanishModel || '',
    npcResponse: result.npcResponse?.npcId ? {
      npcName: result.npcResponse.npcId,
      target: result.npcResponse.spanish || '',
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

export async function handleLearnCommand(sessionId: string, topic: string): Promise<{ lesson: string } | { error: string }> {
  const session = sessions.get(sessionId);
  if (!session) {
    return { error: 'Session not found. Start a new game.' };
  }

  try {
    const Anthropic = (await import(/* webpackIgnore: true */ '@anthropic-ai/sdk')).default;
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
