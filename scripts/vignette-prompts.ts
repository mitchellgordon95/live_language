/**
 * Vignette definitions, auto-derivation from module data, and manifest building.
 *
 * Instead of hardcoding vignette lists per module, `deriveVignetteDefs()` reads
 * the module's NPCs, pets, and objects to determine what vignettes are needed.
 * Prompts are built from NPC appearance/personality and object names/tags.
 */

import { PALETTES, VIGNETTE_STYLE, PLAYER_DESC } from './style-guide';

// --- Types ---

export interface VignetteDef {
  category: 'player' | 'npc' | 'pet' | 'object';
  id: string;
  variant: string;
  prompt: string;
  isBase?: boolean;
  baseRef?: string;
}

/** Minimal module data needed for vignette derivation (matches compiled ModuleDefinition shape) */
export interface ModuleData {
  name: string;
  npcs: Array<{
    id: string;
    name: { native: string };
    location: string;
    personality: string;
    gender?: string;
    isPet?: boolean;
    appearance?: string;
  }>;
  objects: Array<{
    id: string;
    name: { native: string };
    location: string;
    tags: string[];
  }>;
}

// --- Visual tag classification ---

const VISUAL_TAGS = new Set([
  'open', 'closed', 'on', 'off', 'ringing', 'cooked',
  'lit', 'empty', 'full', 'broken',
]);

// Explicit toggle pairs — when one is present, generate the other too
const TAG_COMPLEMENTS: Record<string, string> = {
  open: 'closed',
  closed: 'open',
  on: 'off',
  off: 'on',
};

// --- Standard player vignettes (cross-module) ---

const PLAYER_VIGNETTES: VignetteDef[] = [
  {
    category: 'player', id: 'player', variant: 'standing', isBase: true,
    prompt: `${PLAYER_DESC} Standing upright, looking alert and ready for the day. Arms relaxed at sides. Neutral pleasant expression. Soft warm background.`,
  },
  {
    category: 'player', id: 'player', variant: 'in-bed',
    prompt: `${PLAYER_DESC} Lying in bed with eyes half-open, looking sleepy. Rumpled sheets and pillow. Morning light filtering through curtains. Warm bedroom tones.`,
  },
  {
    category: 'player', id: 'player', variant: 'brushing-teeth',
    prompt: `${PLAYER_DESC} Standing at a bathroom sink, brushing teeth with a toothbrush. Looking in the mirror. White bathroom tiles in background. Fresh morning feel.`,
  },
  {
    category: 'player', id: 'player', variant: 'showering',
    prompt: `A bathroom scene: a running shower head with water streaming down, steam filling the room. White tiles glistening with water droplets. A towel hanging on a hook nearby. Fresh, clean, refreshing atmosphere. No people visible.`,
  },
  {
    category: 'player', id: 'player', variant: 'cooking',
    prompt: `${PLAYER_DESC} Standing at a kitchen stove, cooking eggs in a frying pan. Steam rising from the pan. Focused, happy expression. Warm kitchen with wooden cabinets in background.`,
  },
  {
    category: 'player', id: 'player', variant: 'eating',
    prompt: `${PLAYER_DESC} Sitting at a small kitchen table, eating breakfast. Plate of food and a cup of coffee on the table. Satisfied, content expression. Warm morning light.`,
  },
];

// --- Auto-derivation ---

/**
 * Derive vignette definitions from module data.
 * Reads NPCs, pets, and objects to determine what vignettes are needed.
 */
export function deriveVignetteDefs(module: ModuleData): VignetteDef[] {
  const defs: VignetteDef[] = [];
  const palette = PALETTES[module.name] || PALETTES.home;

  // Player vignettes (standard cross-module set)
  defs.push(...PLAYER_VIGNETTES);

  // NPCs
  for (const npc of module.npcs.filter(n => !n.isPet)) {
    const desc = npc.appearance || npc.personality;
    defs.push({
      category: 'npc', id: npc.id, variant: 'default', isBase: true,
      prompt: `${npc.name.native}, ${desc} ${palette}`,
    });
  }

  // Pets
  for (const pet of module.npcs.filter(n => n.isPet)) {
    const desc = pet.appearance || pet.personality;
    defs.push({
      category: 'pet', id: pet.id, variant: 'default', isBase: true,
      prompt: `${pet.name.native}, ${desc} ${palette}`,
    });
  }

  // Objects with visual state tags
  const seen = new Set<string>(); // Track generated object+variant combos
  for (const obj of module.objects) {
    const visualTags = obj.tags.filter(t => VISUAL_TAGS.has(t));
    if (visualTags.length === 0) continue;

    // Generate vignette for each visual tag
    for (const tag of visualTags) {
      const key = `${obj.id}:${tag}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const isFirst = !defs.some(d => d.category === 'object' && d.id === obj.id);
      defs.push({
        category: 'object', id: obj.id, variant: tag, isBase: isFirst,
        prompt: `Close-up vignette of a ${obj.name.native} that is ${tag}. ${palette}`,
      });

      // Generate complement variant if it has a toggle pair
      const complement = TAG_COMPLEMENTS[tag];
      if (complement && !visualTags.includes(complement)) {
        const compKey = `${obj.id}:${complement}`;
        if (!seen.has(compKey)) {
          seen.add(compKey);
          defs.push({
            category: 'object', id: obj.id, variant: complement,
            prompt: `Close-up vignette of a ${obj.name.native} that is ${complement}. ${palette}`,
          });
        }
      }
    }
  }

  return defs;
}

// --- Prompt builders ---

/**
 * Build the full Gemini prompt for a vignette (text-only, no base image reference).
 */
export function getVignettePrompt(vignette: VignetteDef, moduleName: string): string {
  const palette = PALETTES[moduleName] || PALETTES.home;

  return `Generate a warm, stylized editorial illustration vignette.

${vignette.prompt}

STYLE:
${VIGNETTE_STYLE}
- ${palette}`;
}

/**
 * Build the variant prompt to use with a base reference image.
 */
export function getVariantPrompt(vignette: VignetteDef, moduleName: string): string {
  const palette = PALETTES[moduleName] || PALETTES.home;

  return `Generate a variant of this SAME character/object. The subject must look identical to the reference image — same face, same build, same style, same colors. Only change what the prompt specifies (pose, expression, activity, setting).

${vignette.prompt}

STYLE:
${VIGNETTE_STYLE}
- ${palette}`;
}

// --- Base/variant helpers ---

/**
 * Get the base vignette for a given variant from a list of vignettes.
 */
export function getBaseVignette(vignette: VignetteDef, allVignettes: VignetteDef[]): VignetteDef | undefined {
  if (vignette.isBase) return undefined;

  if (vignette.baseRef) {
    return allVignettes.find(p => vignetteKey(p) === vignette.baseRef);
  }

  return allVignettes.find(p => p.id === vignette.id && p.isBase)
    || allVignettes.find(p => p.id === vignette.id && p.variant === 'default');
}

/**
 * Sort vignettes so bases come before their variants.
 */
export function sortBasesFirst(vignettes: VignetteDef[]): VignetteDef[] {
  const bases = vignettes.filter(v => v.isBase);
  const variants = vignettes.filter(v => !v.isBase);
  return [...bases, ...variants];
}

export function vignetteKey(p: VignetteDef): string {
  return `${p.category}-${p.id}-${p.variant}`;
}

// --- Manifest building ---

/**
 * Build a vignette manifest from vignette definitions and generated files.
 */
export function buildManifest(vignettes: VignetteDef[], generatedFiles: Map<string, string>): VignetteManifest {
  const manifest: VignetteManifest = {
    player: { default: 'player-standing.png', variants: [] },
    npcs: {},
    pets: {},
    objects: {},
  };

  for (const p of vignettes) {
    const filename = generatedFiles.get(vignetteKey(p)) || `${p.category}-${p.id}-${p.variant}.png`;

    if (p.category === 'player') {
      const matchRule = getPlayerMatchRule(p.variant);
      manifest.player.variants.push({ image: filename, ...matchRule });
      if (p.variant === 'standing') {
        manifest.player.default = filename;
      }
    } else if (p.category === 'npc') {
      manifest.npcs[p.id] = manifest.npcs[p.id] || { default: filename };
      if (p.variant === 'default') manifest.npcs[p.id].default = filename;
    } else if (p.category === 'pet') {
      manifest.pets[p.id] = manifest.pets[p.id] || { default: filename };
      if (p.variant === 'default') manifest.pets[p.id].default = filename;
    } else if (p.category === 'object') {
      // Skip base/default-state vignettes — they exist for generation reference only
      if (p.isBase) continue;
      if (!manifest.objects[p.id]) manifest.objects[p.id] = [];
      const matchRule = getObjectMatchRule(p.variant);
      manifest.objects[p.id].push({ image: filename, match: matchRule });
    }
  }

  return manifest;
}

// --- Match rule helpers ---

function getPlayerMatchRule(variant: string): { match: Record<string, unknown> } {
  switch (variant) {
    case 'in-bed': return { match: { playerPosition: 'in_bed' } };
    case 'standing': return { match: { playerPosition: 'standing' } };
    case 'brushing-teeth': return { match: { lastAction: 'brush_teeth' } };
    case 'showering': return { match: { lastAction: 'shower' } };
    case 'cooking': return { match: { lastAction: 'cook' } };
    case 'eating': return { match: { lastAction: 'eat' } };
    default: return { match: {} };
  }
}

/**
 * Build match rule for an object variant.
 * For toggle pairs (open/closed, on/off), match the variant tag being present.
 * For non-paired tags like 'ringing', the complement uses tag absence.
 */
function getObjectMatchRule(variant: string): Record<string, unknown> {
  // If this variant has a complement, check if it's the "absence" side
  // e.g., "ringing" → { ringing: true }, complement "off" with no pair → { ringing: false }
  if (VISUAL_TAGS.has(variant)) {
    return { [variant]: true };
  }
  // Fallback for unknown variants
  return {};
}

// --- Manifest types ---

export interface VignetteManifest {
  player: {
    default: string;
    variants: Array<{ image: string; match: Record<string, unknown> }>;
  };
  npcs: Record<string, { default: string }>;
  pets: Record<string, { default: string }>;
  objects: Record<string, Array<{ image: string; match: Record<string, unknown> }>>;
}
