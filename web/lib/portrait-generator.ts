/**
 * On-the-fly portrait generation using Gemini image generation.
 *
 * When GENERATE_PORTRAITS=true in .env.local, generates portrait images
 * for object states that don't have pre-made portraits. Caches results
 * to web/public/scenes/portrait-cache/ with a JSON index.
 *
 * When GENERATE_PORTRAITS is not set or false, returns a placeholder.
 */
import 'server-only';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';

// --- Types ---

interface CacheEntry {
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

const CACHE_DIR = join(process.cwd(), 'public', 'scenes', 'portrait-cache');
const INDEX_PATH = join(CACHE_DIR, 'index.json');
const PLACEHOLDER_PATH = '/scenes/portrait-cache/unknown-object.svg';

export function isGenerationEnabled(): boolean {
  return process.env.GENERATE_PORTRAITS === 'true';
}

// --- Cache ---

let cacheIndex: CacheIndex | null = null;

function loadCacheIndex(): CacheIndex {
  if (cacheIndex) return cacheIndex;

  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }

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
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
  writeFileSync(INDEX_PATH, JSON.stringify(cacheIndex, null, 2));
}

function getCacheKey(module: string, objectId: string, tags: string[]): string {
  const sorted = [...tags].sort().join(',');
  return `${module}/${objectId}/${sorted}`;
}

function getFilename(module: string, objectId: string, tags: string[]): string {
  const sorted = [...tags].sort();
  const hash = createHash('md5').update(sorted.join(',')).digest('hex').substring(0, 8);
  return `${module}--${objectId}--${hash}.png`;
}

/**
 * Look up a cached portrait for the given object state.
 * Returns the relative URL path if found, null if not cached.
 */
export function getCachedPortrait(module: string, objectId: string, tags: string[]): string | null {
  const index = loadCacheIndex();
  const key = getCacheKey(module, objectId, tags);

  const entry = index.entries.find(e => getCacheKey(e.module, e.objectId, e.tags) === key);
  if (entry) {
    const filePath = join(CACHE_DIR, entry.filename);
    if (existsSync(filePath)) {
      return `/scenes/portrait-cache/${entry.filename}`;
    }
  }
  return null;
}

/**
 * Get the placeholder image path for objects without portraits.
 */
export function getPlaceholderPath(): string {
  // Ensure placeholder SVG exists
  const svgPath = join(CACHE_DIR, 'unknown-object.svg');
  if (!existsSync(svgPath)) {
    if (!existsSync(CACHE_DIR)) {
      mkdirSync(CACHE_DIR, { recursive: true });
    }
    writeFileSync(svgPath, PLACEHOLDER_SVG);
  }
  return PLACEHOLDER_PATH;
}

// --- Generation Queue ---

const pendingQueue = new Map<string, Promise<string>>();

/**
 * Check if a portrait is currently being generated.
 */
export function isGenerating(module: string, objectId: string, tags: string[]): boolean {
  return pendingQueue.has(getCacheKey(module, objectId, tags));
}

/**
 * Trigger background portrait generation for an object+tag combo.
 * Returns immediately. The portrait will be available on next cache check.
 */
export function triggerGeneration(
  module: string,
  objectId: string,
  objectName: string,
  tags: string[],
): void {
  const key = getCacheKey(module, objectId, tags);
  if (pendingQueue.has(key)) return; // Already generating

  const promise = generatePortrait(module, objectId, objectName, tags)
    .finally(() => pendingQueue.delete(key));

  pendingQueue.set(key, promise);
}

async function generatePortrait(
  module: string,
  objectId: string,
  objectName: string,
  tags: string[],
): Promise<string> {
  try {
    const { GoogleGenAI, Modality } = await import('@google/genai');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[portrait-generator] Missing GEMINI_API_KEY');
      return '';
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildPortraitPrompt(objectName, tags);

    console.log(`[portrait-generator] Generating: ${objectName} [${tags.join(', ')}]`);

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    // Extract image from response
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        const imageData = Buffer.from(part.inlineData.data!, 'base64');
        const filename = getFilename(module, objectId, tags);
        const filePath = join(CACHE_DIR, filename);

        if (!existsSync(CACHE_DIR)) {
          mkdirSync(CACHE_DIR, { recursive: true });
        }

        writeFileSync(filePath, imageData);

        // Update cache index
        const index = loadCacheIndex();
        index.entries.push({
          module,
          objectId,
          tags: [...tags].sort(),
          filename,
          generatedAt: Date.now(),
        });
        saveCacheIndex();

        console.log(`[portrait-generator] Saved: ${filename}`);
        return `/scenes/portrait-cache/${filename}`;
      }
    }

    console.error('[portrait-generator] No image in response');
    return '';
  } catch (err) {
    console.error('[portrait-generator] Generation failed:', err);
    return '';
  }
}

function buildPortraitPrompt(objectName: string, tags: string[]): string {
  // Filter out capability tags that don't affect visual appearance
  const visualTags = tags.filter(t =>
    !['takeable', 'consumable', 'container'].includes(t)
  );

  const stateDesc = visualTags.length > 0
    ? `that is ${visualTags.join(' and ')}`
    : '';

  return `Generate a portrait image of a ${objectName} ${stateDesc}.
Style: Isometric game art, cozy life simulation aesthetic, warm colors, detailed and charming.
The image should be a single object portrait suitable for a UI avatar/icon.
Clean background, centered composition, square aspect ratio.
No text or labels in the image.`;
}

// --- Placeholder SVG ---

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="12" fill="#1f2937" stroke="#374151" stroke-width="2"/>
  <text x="64" y="72" text-anchor="middle" font-size="48" font-family="sans-serif" fill="#6b7280">?</text>
</svg>`;
