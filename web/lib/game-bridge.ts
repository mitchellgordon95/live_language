/**
 * Server-only bridge to the game engine.
 * Uses dynamic imports with webpackIgnore to load the compiled game engine
 * from the parent project's dist/ directory at runtime (Node.js resolves it).
 */
import 'server-only';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import type { GameView, TurnResultView, ObjectCoords, SceneInfo, ExitView, NPCView, GoalView, PortraitHint } from './types';

// Path to compiled game engine
const ENGINE_ROOT = join(process.cwd(), '..', 'dist');

// Cached engine modules
let engine: {
  processTurn: (...args: unknown[]) => Promise<unknown>;
  loadVocabulary: (profile?: string) => unknown;
  saveVocabulary: (vocab: unknown, profile?: string) => void;
  createInitialState: (...args: unknown[]) => unknown;
  getGoalByIdCombined: (id: string) => unknown;
  getStartGoalForBuilding: (building: string) => unknown;
  getModuleByName: (name: string) => unknown;
  allLocations: Record<string, unknown>;
  getLanguage: (id: string) => unknown;
  getDefaultLanguage: () => string;
  getAvailableLanguages: () => string[];
  getNPCsInLocation: (locationId: string) => unknown[];
  getVocabStage: (vocab: unknown, objectId: string) => string;
  getAllGoalsForBuilding: (building: string) => unknown[];
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
    getGoalByIdCombined: registryMod.getGoalById,
    getStartGoalForBuilding: registryMod.getStartGoalForBuilding,
    getModuleByName: registryMod.getModuleByName,
    allLocations: registryMod.allLocations,
    getNPCsInLocation: registryMod.getNPCsInLocation,
    getLanguage: languagesMod.getLanguage,
    getDefaultLanguage: languagesMod.getDefaultLanguage,
    getAvailableLanguages: languagesMod.getAvailableLanguages,
    getVocabStage: (vocab: unknown, objectId: string) => {
      const v = vocab as { words: Record<string, { stage: string }> };
      return v.words[objectId]?.stage || 'new';
    },
    getAllGoalsForBuilding: registryMod.getAllGoalsForBuilding,
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
}): Promise<GameView> {
  const eng = await getEngine();

  const languageId = options.language || eng.getDefaultLanguage();
  const languageConfig = eng.getLanguage(languageId);
  if (!languageConfig) {
    throw new Error(`Unknown language: ${languageId}. Available: ${eng.getAvailableLanguages().join(', ')}`);
  }

  const vocab = eng.loadVocabulary();

  // Determine start location and goal from module
  let startLocationId = 'bedroom';
  let startGoalId: string | undefined;
  let forceStanding = false;

  if (options.module) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = eng.getModuleByName(options.module) as any;
    if (mod) {
      startLocationId = mod.startLocationId;
      startGoalId = mod.startGoalId;
      forceStanding = mod.name !== 'home';
    }
  }

  const startLocation = eng.allLocations[startLocationId] || eng.allLocations['bedroom'];
  let startGoal = eng.getStartGoalForBuilding('home');
  if (startGoalId) {
    startGoal = eng.getGoalByIdCombined(startGoalId) || startGoal;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let state = eng.createInitialState(startLocation, startGoal, vocab) as any;

  if (forceStanding) {
    state = { ...state, playerPosition: 'standing' };
  }

  // Disable audio in web mode
  state = { ...state, audioEnabled: false };

  const sessionId = generateSessionId();
  sessions.set(sessionId, { state, languageId });

  return buildGameView(sessionId, state, null);
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
  return buildGameView(sessionId, session.state, turnResult, result.response);
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

// --- Portrait Manifest Loading ---

interface PortraitManifest {
  player: {
    default: string;
    variants: Array<{ image: string; match: Record<string, unknown> }>;
  };
  npcs: Record<string, { default: string }>;
  pets: Record<string, { default: string }>;
  objects: Record<string, Array<{ image: string; match: Record<string, unknown> }>>;
}

const portraitManifestCache = new Map<string, PortraitManifest | null>();

function loadPortraitManifest(module: string): PortraitManifest | null {
  if (portraitManifestCache.has(module)) return portraitManifestCache.get(module)!;

  const manifestPath = join(process.cwd(), 'public', 'scenes', module, 'portraits', 'manifest.json');

  if (!existsSync(manifestPath)) {
    portraitManifestCache.set(module, null);
    return null;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as PortraitManifest;
    portraitManifestCache.set(module, manifest);
    return manifest;
  } catch {
    portraitManifestCache.set(module, null);
    return null;
  }
}

// Action types that map to transient player portrait variants
const ACTION_TO_PORTRAIT: Record<string, string> = {
  eat: 'eat',
  drink: 'eat',       // eating portrait covers drinking too
  cook: 'cook',
  use: 'use',          // resolved further by goal context
};

// Goal IDs that map to specific player portrait actions
const GOAL_TO_PORTRAIT_ACTION: Record<string, string> = {
  brush_teeth: 'brush_teeth',
  take_shower: 'shower',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolvePortraits(state: any, response: any | null, module: string): PortraitHint | null {
  const manifest = loadPortraitManifest(module);
  if (!manifest) return null;

  const hint: PortraitHint = {};

  // 1. Player portrait — check transient actions first, fall back to persistent state
  if (response?.actions?.length) {
    // Check if a goal was just completed that maps to a portrait
    const completedGoals: string[] = response.goalComplete
      ? (Array.isArray(response.goalComplete) ? response.goalComplete : [response.goalComplete])
      : [];

    let lastAction: string | null = null;

    // Check goal-based portrait first (more specific)
    for (const goalId of completedGoals) {
      if (GOAL_TO_PORTRAIT_ACTION[goalId]) {
        lastAction = GOAL_TO_PORTRAIT_ACTION[goalId];
        break;
      }
    }

    // Fall back to action-type-based portrait
    if (!lastAction) {
      for (const action of response.actions) {
        const mapped = ACTION_TO_PORTRAIT[action.type];
        if (mapped) {
          lastAction = mapped;
        }
      }
    }

    if (lastAction) {
      const transientMatch = manifest.player.variants.find(
        v => v.match.lastAction === lastAction
      );
      if (transientMatch) {
        hint.player = transientMatch.image;
      }
    }
  }

  // Fall back to persistent state (playerPosition)
  if (!hint.player) {
    const persistentMatch = manifest.player.variants.find(
      v => v.match.playerPosition === state.playerPosition
    );
    hint.player = persistentMatch?.image || manifest.player.default;
  }

  // 2. Active NPC portrait (when NPC speaks this turn)
  if (response?.npcResponse?.npcId) {
    const npcId = response.npcResponse.npcId;
    const npcPortrait = manifest.npcs[npcId]?.default || manifest.pets[npcId]?.default;
    if (npcPortrait) {
      hint.activeNpc = npcPortrait;
    }
  }

  // 3. Object state portraits — show current state for all objects with portrait definitions
  const locationObjects = state.location?.objects || [];
  const objectChanges: Array<{ objectId: string; image: string }> = [];

  for (const obj of locationObjects) {
    const objectId = obj.id;
    if (!manifest.objects[objectId]) continue;

    // Merge base object state with any runtime overrides (same as engine's getObjectState)
    const effectiveState = { ...(obj.state || {}), ...(state.objectStates?.[objectId] || {}) };

    for (const variant of manifest.objects[objectId]) {
      const matches = Object.entries(variant.match).every(
        ([key, val]) => effectiveState[key] === val
      );
      if (matches) {
        objectChanges.push({ objectId, image: variant.image });
        break;
      }
    }
  }

  if (objectChanges.length > 0) {
    hint.objectChanges = objectChanges;
  }

  return hint;
}

// Map location IDs to their module name for scene lookup
const LOCATION_TO_MODULE: Record<string, string> = {
  bedroom: 'home', bathroom: 'home', kitchen: 'home', living_room: 'home', street: 'home',
  restaurant_entrance: 'restaurant', restaurant_table: 'restaurant', restaurant_kitchen: 'restaurant',
  restaurant_cashier: 'restaurant', restaurant_bathroom: 'restaurant',
  market_entrance: 'market', fruit_stand: 'market', vegetable_stand: 'market',
  meat_counter: 'market', market_checkout: 'market',
  gym_entrance: 'gym', stretching_area: 'gym', training_floor: 'gym',
  weight_room: 'gym', cardio_zone: 'gym', locker_room: 'gym',
  park_entrance: 'park', main_path: 'park', fountain_area: 'park',
  garden: 'park', playground: 'park', kiosk: 'park',
  clinic_reception: 'clinic', waiting_room: 'clinic', exam_room: 'clinic', pharmacy: 'clinic',
  bank_entrance: 'bank', bank_waiting_area: 'bank', bank_teller_window: 'bank', bank_manager_office: 'bank',
};

// --- View Model Builders ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildGameView(sessionId: string, state: any, turnResult: TurnResultView | null, response?: any): GameView {
  const locationId = state.location.id;
  const module = LOCATION_TO_MODULE[locationId] || 'home';
  const manifest = loadManifest(module, locationId);

  // Build objects list with vocab stages and coordinates
  // Filter out fridge items unless the fridge is open (same logic as CLI buildPrompt)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visibleObjects = (state.location.objects || []).filter((obj: any) => {
    const effectiveState = { ...(obj.state || {}), ...(state.objectStates?.[obj.id] || {}) };
    if (effectiveState.inFridge) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fridge = (state.location.objects || []).find((o: any) => o.id === 'refrigerator');
      if (!fridge) return false;
      const fridgeState = { ...(fridge.state || {}), ...(state.objectStates?.['refrigerator'] || {}) };
      return fridgeState.open;
    }
    return true;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objects = visibleObjects.map((obj: any) => {
    const effectiveState = { ...(obj.state || {}), ...(state.objectStates?.[obj.id] || {}) };
    return {
      id: obj.id,
      name: obj.name,
      vocabStage: getVocabStageForObject(state.vocabulary, obj.id),
      coords: manifest?.objects?.[obj.id] || undefined,
      containerId: effectiveState.inFridge ? 'refrigerator' : undefined,
    };
  });

  // Add dynamic objects (no coordinates — they weren't in the generated image)
  const dynamicObjs = state.dynamicObjects?.[locationId] || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const obj of dynamicObjs as any[]) {
    objects.push({
      id: obj.id,
      name: obj.name,
      vocabStage: 'new' as const,
    });
  }

  // Scene info
  const scene: SceneInfo | null = manifest
    ? { image: manifest.image, module }
    : null;

  // Exits
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exits: ExitView[] = (state.location.exits || []).map((exit: any) => ({
    to: exit.to,
    name: exit.name,
  }));

  // NPCs in this location
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const npcsHere = (engine as any).getNPCsInLocation(locationId) as any[];
  const portraitManifest = loadPortraitManifest(module);
  const npcs: NPCView[] = npcsHere.map((npc: { id: string; name: { target: string; native: string } }) => ({
    id: npc.id,
    name: npc.name,
    mood: state.npcState?.[npc.id]?.mood || '',
    portrait: portraitManifest?.npcs[npc.id]?.default || portraitManifest?.pets?.[npc.id]?.default || undefined,
  }));

  // Points to next level: 150 * level
  const pointsToNextLevel = 150 * state.level;

  // Resolve portraits for this turn
  const portraitHint = resolvePortraits(state, response || null, module);

  // Attach NPC portrait to turn result if applicable
  if (turnResult?.npcResponse && portraitHint?.activeNpc) {
    turnResult.npcResponse.portrait = `/scenes/${module}/portraits/${portraitHint.activeNpc}`;
  }

  return {
    sessionId,
    locationId,
    locationName: state.location.name,
    module,
    objects,
    npcs,
    exits,
    needs: state.needs,
    goals: buildGoalChecklist(state, module),
    inventory: state.inventory,
    level: state.level,
    points: state.points,
    pointsToNextLevel,
    completedGoals: state.completedGoals,
    scene,
    portraitHint,
    turnResult,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildGoalChecklist(state: any, module: string): GoalView[] {
  const building = (engine as any).getBuildingForLocation(state.location.id) as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allGoals = (engine as any).getAllGoalsForBuilding(building) as any[];
  const suggestedId = state.currentGoal?.id || null;

  return allGoals.map((g: { id: string; title: string; hint?: string; nextGoalId?: string }) => ({
    id: g.id,
    title: g.title,
    hint: g.hint || '',
    completed: state.completedGoals.includes(g.id),
    suggested: g.id === suggestedId,
  }));
}

function getVocabStageForObject(vocabulary: { words: Record<string, { stage: string }> }, objectId: string): 'new' | 'learning' | 'known' {
  const word = vocabulary?.words?.[objectId];
  if (!word) return 'new';
  return word.stage as 'new' | 'learning' | 'known';
}

// Map NPC gender to Gemini TTS voice
function npcVoice(npcId: string, locationId: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const npcsHere = (engine as any).getNPCsInLocation(locationId) as any[];
  const npc = npcsHere.find((n: { id: string }) => n.id === npcId);
  if (npc?.gender === 'female') return 'Leda';
  if (npc?.gender === 'male') return 'Charon';
  return 'Puck'; // default for pets, unknown
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTurnResultView(result: any, state: any): TurnResultView {
  const response = result.response;
  const view: TurnResultView = {
    valid: response.valid,
    understood: response.understood ?? true,
    message: response.message || '',
    invalidReason: response.invalidReason,
    grammarScore: response.grammar?.score ?? 0,
    grammarIssues: (response.grammar?.issues || []).map((issue: { type: string; original: string; corrected: string; explanation: string }) => ({
      type: issue.type,
      original: issue.original,
      corrected: issue.corrected,
      explanation: issue.explanation,
    })),
    targetModel: response.spanishModel || '',
    npcResponse: response.npcResponse?.npcId ? {
      npcName: response.npcResponse.npcId,
      target: response.npcResponse.spanish || '',
      native: response.npcResponse.english || '',
      actionText: response.npcResponse.actionText,
      voice: npcVoice(response.npcResponse.npcId, state.location.id),
    } : null,
    pointsAwarded: result.effectsResult?.pointsAwarded || 0,
    leveledUp: result.effectsResult?.leveledUp || false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    goalsCompleted: (result.goalsCompleted || []).map((g: any) => g.title || g.id),
  };

  // Include hint when action failed and there's a current goal with a hint
  if (!response.valid && state.currentGoal?.hint) {
    view.hint = state.currentGoal.hint;
  }

  return view;
}

export function getAvailableModules(): string[] {
  // Hard-coded for now; could load from engine
  return ['home', 'restaurant', 'market', 'gym', 'park', 'clinic', 'bank'];
}

// --- /learn Command ---

const MAX_LEARN_PER_DAY = 5;

export async function handleLearnCommand(sessionId: string, topic: string): Promise<{ lesson: string; remaining: number } | { error: string }> {
  const session = sessions.get(sessionId);
  if (!session) {
    return { error: 'Session not found. Start a new game.' };
  }

  const state = session.state;

  // Calculate current in-game day
  const currentDay = Math.floor((state.time.hour + state.time.minute / 60) / 24) + 1;

  // Reset counter if it's a new day
  if (state.lastLearnCommandDay !== currentDay) {
    state.learnCommandsUsedToday = 0;
    state.lastLearnCommandDay = currentDay;
  }

  // Check if limit reached
  if (state.learnCommandsUsedToday >= MAX_LEARN_PER_DAY) {
    return { error: `You've used all ${MAX_LEARN_PER_DAY} /learn commands for today. Keep playing to advance the day!` };
  }

  const remaining = MAX_LEARN_PER_DAY - state.learnCommandsUsedToday - 1;

  try {
    // Dynamic import of Anthropic client (already loaded by engine via dotenv)
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

    // Increment usage counter
    state.learnCommandsUsedToday += 1;
    sessions.set(sessionId, session);

    return { lesson, remaining };
  } catch {
    return { error: 'Could not generate lesson. Try again.' };
  }
}
