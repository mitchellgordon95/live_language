#!/usr/bin/env npx tsx
/**
 * Generate a single scene image + extract object coordinates via Gemini 2.5 Flash.
 *
 * Usage:
 *   npx tsx scripts/generate-scene.ts --module home --location kitchen
 *   npx tsx scripts/generate-scene.ts --module restaurant --location restaurant_table --skip-coordinates
 *
 * Requires GEMINI_API_KEY in .env.local
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Modality } from '@google/genai';
import { getImagePrompt, getCoordinateExtractionPrompt } from './image-prompts.ts';

// Resolve paths relative to the project root (parent of scripts/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// --- Parse CLI args ---
function parseArgs() {
  const args = process.argv.slice(2);
  const result: { module?: string; location?: string; skipCoordinates?: boolean; outputDir?: string } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === '--module' && next) { result.module = next; i++; }
    else if (arg === '--location' && next) { result.location = next; i++; }
    else if (arg === '--output-dir' && next) { result.outputDir = next; i++; }
    else if (arg === '--skip-coordinates') { result.skipCoordinates = true; }
  }

  if (!result.module || !result.location) {
    console.error('Usage: npx tsx scripts/generate-scene.ts --module <name> --location <id>');
    console.error('  --skip-coordinates  Skip coordinate extraction step');
    console.error('  --output-dir <dir>  Custom output directory (default: web/public/scenes)');
    process.exit(1);
  }

  return result as { module: string; location: string; skipCoordinates: boolean; outputDir: string };
}

// --- Load location data from the game engine ---
async function loadLocationData(moduleName: string, locationId: string) {
  const engineRoot = path.join(PROJECT_ROOT, 'src');

  // Import the module registry to get location data
  const registry = await import(path.join(engineRoot, 'data', 'module-registry.ts'));
  const location = registry.allLocations[locationId];

  if (!location) {
    console.error(`Location "${locationId}" not found. Available locations:`);
    console.error(Object.keys(registry.allLocations).join(', '));
    process.exit(1);
  }

  return {
    locationId: location.id,
    locationName: location.name.native,
    objects: location.objects.map((obj: { id: string; name: { native: string } }) => ({
      id: obj.id,
      name: obj.name.native,
    })),
  };
}

// --- Main ---
async function main() {
  const opts = parseArgs();

  // Load env
  const dotenv = await import('dotenv');
  dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local') });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY in .env.local');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  // Load location data from game engine
  const locationData = await loadLocationData(opts.module, opts.location);
  console.log(`\nGenerating scene: ${opts.module}/${locationData.locationId}`);
  console.log(`  Objects: ${locationData.objects.map((o: { name: string }) => o.name).join(', ')}`);

  // Output directory
  const outputDir = opts.outputDir || path.join(PROJECT_ROOT, 'public', 'scenes', opts.module);
  fs.mkdirSync(outputDir, { recursive: true });

  // --- Step 1: Generate the scene image ---
  console.log('\n  Step 1: Generating scene image...');

  const imagePrompt = getImagePrompt({
    locationId: locationData.locationId,
    locationName: locationData.locationName,
    moduleName: opts.module,
    objectNames: locationData.objects.map((o: { name: string }) => o.name),
  });

  const imageResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: imagePrompt,
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  // Extract the image from the response
  let imageData: Buffer | null = null;
  let mimeType = 'image/webp';

  if (imageResponse.candidates?.[0]?.content?.parts) {
    for (const part of imageResponse.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        imageData = Buffer.from(part.inlineData.data, 'base64');
        mimeType = part.inlineData.mimeType || 'image/webp';
        break;
      }
    }
  }

  if (!imageData) {
    console.error('  ERROR: No image data in Gemini response');
    console.error('  Response:', JSON.stringify(imageResponse.candidates?.[0]?.content?.parts?.map(p => p.text || '[image]'), null, 2));
    process.exit(1);
  }

  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
  const imageFile = path.join(outputDir, `${locationData.locationId}.${ext}`);
  fs.writeFileSync(imageFile, imageData);
  console.log(`  Saved: ${imageFile} (${Math.round(imageData.length / 1024)}KB)`);

  // --- Step 2: Extract object coordinates ---
  const manifestFile = path.join(outputDir, `${locationData.locationId}.json`);

  if (opts.skipCoordinates) {
    // Write manifest without coordinates
    const manifest = {
      image: `${locationData.locationId}.${ext}`,
      width: 1024,
      height: 1024,
      objects: Object.fromEntries(
        locationData.objects.map((o: { id: string }) => [o.id, { x: 50, y: 50, w: 10, h: 10 }])
      ),
    };
    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
    console.log(`  Saved manifest (no coordinates): ${manifestFile}`);
  } else {
    console.log('\n  Step 2: Extracting object coordinates...');

    const coordPrompt = getCoordinateExtractionPrompt(
      locationData.objects.map((o: { id: string }) => o.id),
      locationData.objects.map((o: { name: string }) => o.name),
    );

    const coordResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageData.toString('base64'),
              },
            },
            { text: coordPrompt },
          ],
        },
      ],
    });

    const coordText = coordResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let coordinates: Record<string, { x: number; y: number; w: number; h: number }> = {};

    try {
      const jsonMatch = coordText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        coordinates = parsed.objects || parsed;
      }
    } catch (err) {
      console.error('  WARNING: Could not parse coordinate response:', coordText.slice(0, 200));
      // Fall back to centered coordinates
      coordinates = Object.fromEntries(
        locationData.objects.map((o: { id: string }) => [o.id, { x: 50, y: 50, w: 10, h: 10 }])
      );
    }

    const manifest = {
      image: `${locationData.locationId}.${ext}`,
      width: 1024,
      height: 1024,
      objects: coordinates,
    };

    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
    console.log(`  Saved manifest: ${manifestFile}`);
    console.log(`  Coordinates for ${Object.keys(coordinates).length} objects`);
  }

  console.log('\nDone!\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
