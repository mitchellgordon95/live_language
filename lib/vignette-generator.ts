/**
 * On-the-fly vignette generation using Gemini image generation.
 *
 * When GENERATE_VIGNETTES=true in .env.local, generates vignette images
 * for object states that don't have pre-made vignettes. Caches results
 * to web/public/scenes/vignette-cache/ with a JSON index.
 *
 * When GENERATE_VIGNETTES is not set or false, returns a placeholder.
 */
import 'server-only';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';

// --- Types ---

interface CacheEntry {
  languageId?: string;
  module: string;
  objectId: string;
  tags: string[];
  filename: string;
  generatedAt: number;
}

interface CacheIndex {
  entries: CacheEntry[];
}

// --- Configuration ---

const CACHE_DIR = join(process.cwd(), 'public', 'scenes', 'vignette-cache');
const INDEX_PATH = join(CACHE_DIR, 'index.json');
const PLACEHOLDER_PATH = '/scenes/vignette-cache/unknown-object.svg';

// Style constants matching the centralized style guide (scripts/style-guide.ts)
const VIGNETTE_STYLE = `Editorial illustration style, like a New Yorker or Monocle magazine illustration. Clean lines, slightly stylized but recognizable. Close-up or medium shot, focused on the subject. Simple background that suggests the location without distracting. DO NOT include any text, labels, or writing in the image. 512x512 square format.`;

const PALETTES: Record<string, string> = {
  home: 'Warm yellows, soft oranges, cozy earth tones. Morning light.',
  market: 'Vibrant greens, fresh produce colors, rustic wood tones.',
  gym: 'Cool grays, energetic orange accents.',
  park: 'Natural greens, sky blues, dappled sunlight.',
  clinic: 'Clean whites, soft blues, sterile but reassuring.',
  bank: 'Navy blue, gold accents, marble gray.',
};

export function isGenerationEnabled(): boolean {
  return process.env.GENERATE_VIGNETTES === 'true';
}

// --- Cache ---

let cacheIndex: CacheIndex | null = null;

function ensureCacheDir(): void {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function loadCacheIndex(): CacheIndex {
  if (cacheIndex) return cacheIndex;

  ensureCacheDir();

  if (existsSync(INDEX_PATH)) {
    try {
      cacheIndex = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
      return cacheIndex!;
    } catch {
      // Corrupt index, start fresh
    }
  }

  cacheIndex = { entries: [] };
  return cacheIndex;
}

function saveCacheIndex(): void {
  if (!cacheIndex) return;
  ensureCacheDir();
  writeFileSync(INDEX_PATH, JSON.stringify(cacheIndex, null, 2));
}

function getCacheKey(languageId: string, module: string, objectId: string, tags: string[]): string {
  const sorted = [...tags].sort().join(',');
  return `${languageId}/${module}/${objectId}/${sorted}`;
}

function getFilename(languageId: string, module: string, objectId: string, tags: string[]): string {
  const sorted = [...tags].sort();
  const hash = createHash('md5').update(sorted.join(',')).digest('hex').substring(0, 8);
  return `${languageId}--${module}--${objectId}--${hash}.png`;
}

/**
 * Look up a cached vignette for the given object state.
 * Returns the relative URL path if found, null if not cached.
 */
export function getCachedVignette(languageId: string, module: string, objectId: string, tags: string[]): string | null {
  const index = loadCacheIndex();
  const key = getCacheKey(languageId, module, objectId, tags);

  const entry = index.entries.find(e => getCacheKey(e.languageId || 'spanish', e.module, e.objectId, e.tags) === key);
  if (entry) {
    const filePath = join(CACHE_DIR, entry.filename);
    if (existsSync(filePath)) {
      return `/scenes/vignette-cache/${entry.filename}`;
    }
  }
  return null;
}

/**
 * Get the placeholder image path for objects without vignettes.
 */
export function getPlaceholderPath(): string {
  return PLACEHOLDER_PATH;
}

// --- Generation Queue ---

const pendingQueue = new Map<string, Promise<string>>();

/**
 * Check if a vignette is currently being generated.
 */
export function isGenerating(languageId: string, module: string, objectId: string, tags: string[]): boolean {
  return pendingQueue.has(getCacheKey(languageId, module, objectId, tags));
}

/**
 * Trigger background vignette generation for an object+tag combo.
 * Returns immediately. The vignette will be available on next cache check.
 */
export function triggerGeneration(
  languageId: string,
  module: string,
  objectId: string,
  objectName: string,
  tags: string[],
): void {
  const key = getCacheKey(languageId, module, objectId, tags);
  if (pendingQueue.has(key)) return; // Already generating

  const promise = generateVignette(languageId, module, objectId, objectName, tags)
    .finally(() => pendingQueue.delete(key));

  pendingQueue.set(key, promise);
}

async function generateVignette(
  languageId: string,
  module: string,
  objectId: string,
  objectName: string,
  tags: string[],
): Promise<string> {
  try {
    const { GoogleGenAI, Modality } = await import('@google/genai');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[vignette-generator] Missing GEMINI_API_KEY');
      return '';
    }

    const ai = new GoogleGenAI({ apiKey });

    // Try to load a base vignette image for reference
    const baseImagePath = findBaseVignette(languageId, module, objectId);
    let contents: Parameters<typeof ai.models.generateContent>[0]['contents'];

    if (baseImagePath) {
      // Generate variant with base reference
      const baseImageData = readFileSync(baseImagePath);
      const baseImageBase64 = baseImageData.toString('base64');
      const variantPrompt = buildVariantVignettePrompt(module, objectName, tags);

      console.log(`[vignette-generator] Generating with base reference: ${objectName} [${tags.join(', ')}]`);

      contents = [
        { role: 'user', parts: [
          { text: 'Here is the base character/object design for reference:' },
          { inlineData: { mimeType: 'image/png', data: baseImageBase64 } },
          { text: variantPrompt },
        ]},
      ];
    } else {
      // Generate from text only
      const prompt = buildVignettePrompt(module, objectName, tags);
      console.log(`[vignette-generator] Generating: ${objectName} [${tags.join(', ')}]`);
      contents = prompt;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents,
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    // Extract image from response
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        const imageData = Buffer.from(part.inlineData.data!, 'base64');
        const filename = getFilename(languageId, module, objectId, tags);
        const filePath = join(CACHE_DIR, filename);

        ensureCacheDir();
        writeFileSync(filePath, imageData);

        // Update cache index
        const index = loadCacheIndex();
        index.entries.push({
          languageId,
          module,
          objectId,
          tags: [...tags].sort(),
          filename,
          generatedAt: Date.now(),
        });
        saveCacheIndex();

        console.log(`[vignette-generator] Saved: ${filename}`);
        return `/scenes/vignette-cache/${filename}`;
      }
    }

    console.error('[vignette-generator] No image in response');
    return '';
  } catch (err) {
    console.error('[vignette-generator] Generation failed:', err);
    return '';
  }
}

/**
 * Find a base vignette image on disk for the given object.
 * Looks in the module's vignettes directory for an image matching the object id.
 */
function findBaseVignette(languageId: string, module: string, objectId: string): string | null {
  const vignetteDir = join(process.cwd(), 'public', 'scenes', languageId, module, 'vignettes');
  if (!existsSync(vignetteDir)) return null;

  // Try common base filename patterns
  const patterns = [
    `object-${objectId}-default.png`,
    `object-${objectId}-ringing.png`, // alarm clock base
    `object-${objectId}-open.png`,    // refrigerator base
    `object-${objectId}-on.png`,      // stove/coffee maker base
    `npc-${objectId}-default.png`,
    `pet-${objectId}-default.png`,
  ];

  for (const pattern of patterns) {
    const filePath = join(vignetteDir, pattern);
    if (existsSync(filePath)) return filePath;
  }

  return null;
}

function buildVignettePrompt(module: string, objectName: string, tags: string[]): string {
  const palette = PALETTES[module] || PALETTES.home;
  const visualTags = tags.filter(t =>
    !['takeable', 'consumable', 'container'].includes(t)
  );

  const stateDesc = visualTags.length > 0
    ? `that is ${visualTags.join(' and ')}`
    : '';

  return `Generate a warm, stylized editorial illustration vignette of a ${objectName} ${stateDesc}.

STYLE:
${VIGNETTE_STYLE}
- ${palette}`;
}

function buildVariantVignettePrompt(module: string, objectName: string, tags: string[]): string {
  const palette = PALETTES[module] || PALETTES.home;
  const visualTags = tags.filter(t =>
    !['takeable', 'consumable', 'container'].includes(t)
  );

  const stateDesc = visualTags.length > 0
    ? `that is ${visualTags.join(' and ')}`
    : '';

  return `Generate a variant of this SAME object. It must look identical to the reference image — same design, same style, same colors. Only change what the prompt specifies.

Show the ${objectName} ${stateDesc}.

STYLE:
${VIGNETTE_STYLE}
- ${palette}`;
}

