/**
 * Centralized visual style guide for all asset generation.
 * Single source of truth for illustration style, palettes, and character descriptions.
 * Used by both scene generation (image-prompts.ts) and vignette generation (vignette-prompts.ts).
 */

// Core editorial illustration style shared across all generated assets
export const EDITORIAL_STYLE = `Editorial illustration style, like a New Yorker or Monocle magazine illustration. Clean lines, slightly stylized but recognizable. DO NOT include any text, labels, or writing in the image.`;

// Scene-specific style (overhead view, no people)
export const SCENE_STYLE = `${EDITORIAL_STYLE}
Seen from a gentle overhead 3/4 angle (bird's eye view tilted about 30 degrees).
No people in the scene (characters are handled separately).
1024x1024 square format.`;

// Vignette-specific style (close-up, subject-focused)
export const VIGNETTE_STYLE = `${EDITORIAL_STYLE}
Close-up or medium shot, focused on the subject.
Simple background that suggests the location without distracting.
512x512 square format.`;

// Color palettes by module
export const PALETTES: Record<string, string> = {
  home: 'Warm yellows, soft oranges, cozy earth tones. Morning light.',
  restaurant: 'Rich warm reds, dark wood browns, candlelight amber.',
  market: 'Vibrant greens, fresh produce colors, rustic wood tones.',
  gym: 'Cool grays, energetic orange accents.',
  park: 'Natural greens, sky blues, dappled sunlight.',
  clinic: 'Clean whites, soft blues, sterile but reassuring.',
  bank: 'Navy blue, gold accents, marble gray.',
};

// Language-specific cultural/architectural style — gives each language its own visual identity
export const LANGUAGE_STYLES: Record<string, string> = {
  spanish: 'Latin American / Mexican aesthetic. Warm terracotta tiles, colorful painted walls, rustic wooden furniture, woven textiles, iron fixtures.',
  mandarin: 'Modern Chinese urban apartment aesthetic. Bamboo accents, red and gold decorative touches, compact efficient layout, warm wood tones.',
  hindi: 'Modern Indian urban home aesthetic. Bright colors, ornate patterns, brass accents, rangoli-inspired decor, cotton curtains.',
  portuguese: 'Brazilian apartment aesthetic. Tropical wood furniture, colorful azulejo tile accents, lush indoor plants, bright airy spaces with natural light.',
};

// NPC portrait constraint — neutral headshot, no activity or held items
export const NPC_PORTRAIT_STYLE = `Neutral portrait — head and upper body only, like a character select screen. No specific pose, activity, or held items. Friendly neutral expression.`;

// Consistent player character description used in all player vignettes
export const PLAYER_DESC = 'A gender-neutral young adult in their mid-20s with warm brown skin, short dark hair, and an expressive friendly face. Wearing casual home clothes (t-shirt and comfortable pants).';
