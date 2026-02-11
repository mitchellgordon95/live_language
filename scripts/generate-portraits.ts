#!/usr/bin/env npx tsx
/**
 * Generate portrait images for NPCs, player states, and dynamic objects via Gemini.
 *
 * Usage:
 *   npx tsx scripts/generate-portraits.ts --module home              # all home portraits
 *   npx tsx scripts/generate-portraits.ts --module home --id player --variant cooking  # single
 *
 * Requires GEMINI_API_KEY in .env.local
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Modality } from '@google/genai';
import {
  getPortraitsForModule,
  getPortrait,
  getPortraitPrompt,
  buildManifest,
  portraitKey,
  type PortraitDef,
} from './portrait-prompts.ts';

// Resolve paths relative to the project root (parent of scripts/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// --- Parse CLI args ---
function parseArgs() {
  const args = process.argv.slice(2);
  const result: { module?: string; id?: string; variant?: string } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === '--module' && next) { result.module = next; i++; }
    else if (arg === '--id' && next) { result.id = next; i++; }
    else if (arg === '--variant' && next) { result.variant = next; i++; }
  }

  if (!result.module) {
    console.error('Usage: npx tsx scripts/generate-portraits.ts --module <name> [--id <id> --variant <variant>]');
    console.error('  --module <name>     Module to generate portraits for (e.g., home)');
    console.error('  --id <id>           Specific portrait ID (e.g., player, roommate, alarm_clock)');
    console.error('  --variant <variant> Specific variant (e.g., standing, default, ringing)');
    process.exit(1);
  }

  return result as { module: string; id?: string; variant?: string };
}

// --- Generate a single portrait ---
async function generatePortrait(
  ai: GoogleGenAI,
  portrait: PortraitDef,
  moduleName: string,
  outputDir: string,
): Promise<string> {
  const prompt = getPortraitPrompt(portrait, moduleName);

  console.log(`  Generating ${portrait.category}/${portrait.id}/${portrait.variant}...`);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: prompt,
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  // Extract image data
  let imageData: Buffer | null = null;
  let mimeType = 'image/png';

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        imageData = Buffer.from(part.inlineData.data, 'base64');
        mimeType = part.inlineData.mimeType || 'image/png';
        break;
      }
    }
  }

  if (!imageData) {
    const textParts = response.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean);
    console.error(`    ERROR: No image data. Text response: ${textParts?.join(' ') || 'none'}`);
    throw new Error(`No image generated for ${portraitKey(portrait)}`);
  }

  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
  const filename = `${portrait.category}-${portrait.id}-${portrait.variant}.${ext}`;
  const filePath = path.join(outputDir, filename);

  fs.writeFileSync(filePath, imageData);
  console.log(`    Saved: ${filename} (${Math.round(imageData.length / 1024)}KB)`);

  return filename;
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

  // Determine which portraits to generate
  let portraits: PortraitDef[];

  if (opts.id && opts.variant) {
    // Single portrait mode
    const p = getPortrait(opts.module, '', opts.id, opts.variant)
      || getPortraitsForModule(opts.module).find(p => p.id === opts.id && p.variant === opts.variant);
    if (!p) {
      console.error(`Portrait not found: ${opts.module}/${opts.id}/${opts.variant}`);
      console.error('Available portraits:');
      for (const def of getPortraitsForModule(opts.module)) {
        console.error(`  ${def.category}/${def.id}/${def.variant}`);
      }
      process.exit(1);
    }
    portraits = [p];
  } else {
    // All portraits for module
    portraits = getPortraitsForModule(opts.module);
    if (portraits.length === 0) {
      console.error(`No portraits defined for module "${opts.module}"`);
      process.exit(1);
    }
  }

  console.log(`\nGenerating ${portraits.length} portrait(s) for module "${opts.module}"...\n`);

  // Output directory
  const outputDir = path.join(PROJECT_ROOT, 'web', 'public', 'scenes', opts.module, 'portraits');
  fs.mkdirSync(outputDir, { recursive: true });

  // Generate each portrait
  const generatedFiles = new Map<string, string>();
  let succeeded = 0;
  let failed = 0;

  for (const portrait of portraits) {
    try {
      const filename = await generatePortrait(ai, portrait, opts.module, outputDir);
      generatedFiles.set(portraitKey(portrait), filename);
      succeeded++;
    } catch (err) {
      console.error(`    FAILED: ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  // Generate/update manifest
  console.log('\n  Writing manifest...');

  // Load existing manifest to preserve filenames of previously generated portraits
  const manifestPath = path.join(outputDir, 'manifest.json');
  let existingFiles = new Map<string, string>();
  if (fs.existsSync(manifestPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      // Extract filenames from existing manifest
      if (existing.player?.variants) {
        for (const v of existing.player.variants) {
          // Try to reverse-map filename to key
          existingFiles.set(`player-player-${v.image.replace('player-', '').replace(/\.\w+$/, '')}`, v.image);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Merge: new generation overrides existing
  const allFiles = new Map([...existingFiles, ...generatedFiles]);
  const manifest = buildManifest(opts.module, allFiles);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`  Manifest saved: ${manifestPath}`);

  // Summary
  console.log(`\nDone! ${succeeded} succeeded, ${failed} failed out of ${portraits.length} total.\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
