/**
 * Portrait definitions and prompt templates for Gemini image generation.
 * Each module defines portraits for player states, NPCs, pets, and dynamic objects.
 */

export interface PortraitDef {
  category: 'player' | 'npc' | 'pet' | 'object';
  id: string;
  variant: string;
  prompt: string;
}

// Consistent player character description used in all player portraits
const PLAYER_DESC = 'A gender-neutral young adult in their mid-20s with warm brown skin, short dark hair, and an expressive friendly face. Wearing casual home clothes (t-shirt and comfortable pants).';

// Shared art style (matches scene generation style)
const PORTRAIT_STYLE = `STYLE:
- Editorial illustration style, like a New Yorker or Monocle magazine illustration
- Close-up or medium shot, focused on the subject
- Clean lines, slightly stylized but recognizable
- Simple background that suggests the location without distracting
- DO NOT include any text, labels, or writing in the image
- 512x512 square format`;

// Color palettes by module (same as scene generation)
const PALETTES: Record<string, string> = {
  home: 'Warm yellows, soft oranges, cozy earth tones. Morning light.',
  restaurant: 'Rich warm reds, dark wood browns, candlelight amber.',
  market: 'Vibrant greens, fresh produce colors, rustic wood tones.',
  gym: 'Cool grays, energetic orange accents.',
  park: 'Natural greens, sky blues, dappled sunlight.',
  clinic: 'Clean whites, soft blues, sterile but reassuring.',
  bank: 'Navy blue, gold accents, marble gray.',
};

// --- Portrait definitions by module ---

const HOME_PORTRAITS: PortraitDef[] = [
  // Player states
  {
    category: 'player', id: 'player', variant: 'in-bed',
    prompt: `${PLAYER_DESC} Lying in bed with eyes half-open, looking sleepy. Rumpled sheets and pillow. An alarm clock ringing on the nightstand. Morning light filtering through curtains. Warm bedroom tones.`,
  },
  {
    category: 'player', id: 'player', variant: 'standing',
    prompt: `${PLAYER_DESC} Standing upright, looking alert and ready for the day. Arms relaxed at sides. Neutral pleasant expression. Soft warm background.`,
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

  // NPCs
  {
    category: 'npc', id: 'roommate', variant: 'default',
    prompt: `Carlos, a friendly young man in his mid-20s with light skin and messy brown hair. Wearing a gray hoodie, sitting on a couch. Sleepy half-smile, holding a coffee mug. Cozy living room background with warm tones.`,
  },

  // Pets
  {
    category: 'pet', id: 'cat', variant: 'default',
    prompt: `Luna, a calico cat with patches of orange, black, and white. Sitting elegantly on a couch armrest, looking slightly aloof with half-closed eyes. Warm living room setting. Soft, cozy lighting.`,
  },
  {
    category: 'pet', id: 'dog', variant: 'default',
    prompt: `Max, a golden retriever sitting eagerly on the floor, tail mid-wag. Happy expression, tongue slightly out, bright eyes looking up. Warm living room setting. Joyful energy.`,
  },

  // Object states
  {
    category: 'object', id: 'alarm_clock', variant: 'ringing',
    prompt: `Close-up vignette of a digital alarm clock on a wooden nightstand, actively ringing. Red glowing numbers showing 7:00. Motion lines around it suggesting vibration. Morning light. Urgent, energetic feel.`,
  },
  {
    category: 'object', id: 'alarm_clock', variant: 'off',
    prompt: `Close-up vignette of a digital alarm clock on a wooden nightstand, quiet and still. Dim numbers showing the time. Peaceful morning light. Calm, serene atmosphere.`,
  },
  {
    category: 'object', id: 'refrigerator', variant: 'open',
    prompt: `An open refrigerator seen from the front. Interior light illuminating shelves with milk, eggs, butter, juice, and vegetables. Cool blue-white glow spilling out. Warm kitchen background.`,
  },
  {
    category: 'object', id: 'stove', variant: 'on',
    prompt: `Close-up of a gas stove burner with blue flames lit under a frying pan. Steam and warmth rising. Warm orange kitchen lighting. Cooking in progress, inviting atmosphere.`,
  },
  {
    category: 'object', id: 'coffee_maker', variant: 'on',
    prompt: `Close-up of a coffee maker actively brewing. Dark coffee dripping into a glass carafe. Steam rising from the top. Small red power indicator light glowing. Kitchen counter setting.`,
  },
];

// Map module names to their portrait definitions
const MODULE_PORTRAITS: Record<string, PortraitDef[]> = {
  home: HOME_PORTRAITS,
};

/**
 * Get all portrait definitions for a module.
 */
export function getPortraitsForModule(moduleName: string): PortraitDef[] {
  return MODULE_PORTRAITS[moduleName] || [];
}

/**
 * Get a specific portrait definition.
 */
export function getPortrait(moduleName: string, category: string, id: string, variant: string): PortraitDef | undefined {
  const portraits = MODULE_PORTRAITS[moduleName] || [];
  return portraits.find(p => p.category === category && p.id === id && p.variant === variant);
}

/**
 * Build the full Gemini prompt for a portrait.
 */
export function getPortraitPrompt(portrait: PortraitDef, moduleName: string): string {
  const palette = PALETTES[moduleName] || PALETTES.home;

  return `Generate a warm, stylized editorial illustration portrait.

${portrait.prompt}

${PORTRAIT_STYLE}
- ${palette}`;
}

/**
 * Build the portrait manifest for a module from its definitions.
 * This defines the matching rules for portrait resolution at runtime.
 */
export function buildManifest(moduleName: string, generatedFiles: Map<string, string>): PortraitManifest {
  const portraits = getPortraitsForModule(moduleName);
  const manifest: PortraitManifest = {
    player: { default: 'player-standing.png', variants: [] },
    npcs: {},
    pets: {},
    objects: {},
  };

  for (const p of portraits) {
    const filename = generatedFiles.get(portraitKey(p)) || `${p.category}-${p.id}-${p.variant}.png`;

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
      if (!manifest.objects[p.id]) manifest.objects[p.id] = [];
      const matchRule = getObjectMatchRule(p.id, p.variant);
      manifest.objects[p.id].push({ image: filename, match: matchRule });
    }
  }

  return manifest;
}

export function portraitKey(p: PortraitDef): string {
  return `${p.category}-${p.id}-${p.variant}`;
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

function getObjectMatchRule(objectId: string, variant: string): Record<string, unknown> {
  switch (`${objectId}:${variant}`) {
    case 'alarm_clock:ringing': return { ringing: true };
    case 'alarm_clock:off': return { ringing: false };
    case 'refrigerator:open': return { open: true };
    case 'stove:on': return { on: true };
    case 'coffee_maker:on': return { on: true };
    default: return {};
  }
}

// --- Manifest types ---

export interface PortraitManifest {
  player: {
    default: string;
    variants: Array<{ image: string; match: Record<string, unknown> }>;
  };
  npcs: Record<string, { default: string }>;
  pets: Record<string, { default: string }>;
  objects: Record<string, Array<{ image: string; match: Record<string, unknown> }>>;
}
