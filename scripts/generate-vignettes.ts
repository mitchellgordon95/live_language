#!/usr/bin/env npx tsx
/**
 * Generate vignette images for NPCs, player states, and dynamic objects via Gemini.
 *
 * Auto-derives vignette needs from compiled module data. Supports base-then-variant
 * generation for visual consistency.
 *
 * Usage:
 *   npx tsx scripts/generate-vignettes.ts --module home              # all home vignettes
 *   npx tsx scripts/generate-vignettes.ts --module home --id player --variant cooking  # single
 *   npx tsx scripts/generate-vignettes.ts --module home --id roommate --all-variants   # base + all variants
 *
 * Requires: GEMINI_API_KEY in .env.local
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Modality } from '@google/genai';
import {
  deriveVignetteDefs,
  getVignettePrompt,
  getVariantPrompt,
  getBaseVignette,
  buildManifest,
  vignetteKey,
  sortBasesFirst,
  type VignetteDef,
  type ModuleData,
} from './vignette-prompts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  const result: { language?: string; module?: string; id?: string; variant?: string; allVariants?: boolean; force?: boolean } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === '--language' && next) { result.language = next; i++; }
    else if (arg === '--module' && next) { result.module = next; i++; }
    else if (arg === '--id' && next) { result.id = next; i++; }
    else if (arg === '--variant' && next) { result.variant = next; i++; }
    else if (arg === '--all-variants') { result.allVariants = true; }
    else if (arg === '--force') { result.force = true; }
  }

  if (!result.module) {
    console.error('Usage: npx tsx scripts/generate-vignettes.ts --module <name> [options]');
    console.error('  --language <lang>   Language (default: spanish)');
    console.error('  --module <name>     Module (e.g., home, restaurant)');
    console.error('  --id <id>           Specific vignette ID');
    console.error('  --variant <variant> Specific variant');
    console.error('  --all-variants      Regenerate base + all variants for --id');
    console.error('  --force             Regenerate even if files exist');
    process.exit(1);
  }

  return result as { language?: string; module: string; id?: string; variant?: string; allVariants?: boolean; force?: boolean };
}

async function loadModuleData(languageId: string, moduleName: string): Promise<ModuleData> {
  const engineRoot = path.join(PROJECT_ROOT, 'src');
  const languages = await import(path.join(engineRoot, 'languages', 'index.ts'));
  const config = languages.getLanguage(languageId);
  if (!config) {
    const available = languages.getAvailableLanguages().join(', ');
    throw new Error(`Language "${languageId}" not found. Available: ${available}`);
  }

  const mod = config.modules.find((m: { name: string }) => m.name === moduleName);
  if (!mod) throw new Error(`Module "${moduleName}" not found. Available: ${config.modules.map((m: { name: string }) => m.name).join(', ')}`);

  return { name: mod.name, npcs: mod.npcs || [], objects: mod.objects || [] };
}

function getVignetteFilename(vignette: VignetteDef, ext: string = 'png'): string {
  return `${vignette.category}-${vignette.id}-${vignette.variant}.${ext}`;
}

async function generateBaseVignette(
  ai: GoogleGenAI, vignette: VignetteDef, moduleName: string, outputDir: string, languageId?: string,
): Promise<string> {
  const prompt = getVignettePrompt(vignette, moduleName, languageId);
  console.log(`  [base] Generating ${vignette.category}/${vignette.id}/${vignette.variant}...`);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: prompt,
    config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
  });
  return saveGeneratedImage(response, vignette, outputDir);
}

async function generateVariantVignette(
  ai: GoogleGenAI, vignette: VignetteDef, moduleName: string, outputDir: string, baseImagePath: string, languageId?: string,
): Promise<string> {
  const variantPromptText = getVariantPrompt(vignette, moduleName, languageId);
  console.log(`  [variant] Generating ${vignette.category}/${vignette.id}/${vignette.variant} (with base reference)...`);

  const baseImageData = fs.readFileSync(baseImagePath);
  const baseImageBase64 = baseImageData.toString('base64');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      { role: 'user', parts: [
        { text: 'Here is the base character/object design for reference:' },
        { inlineData: { mimeType: 'image/png', data: baseImageBase64 } },
        { text: variantPromptText },
      ]},
    ],
    config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
  });
  return saveGeneratedImage(response, vignette, outputDir);
}

function saveGeneratedImage(
  response: { candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string }; text?: string }> } }> },
  vignette: VignetteDef, outputDir: string,
): string {
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
    console.error(`    ERROR: No image data. Text: ${textParts?.join(' ') || 'none'}`);
    throw new Error(`No image generated for ${vignetteKey(vignette)}`);
  }

  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
  const filename = getVignetteFilename(vignette, ext);
  fs.writeFileSync(path.join(outputDir, filename), imageData);
  console.log(`    Saved: ${filename} (${Math.round(imageData.length / 1024)}KB)`);
  return filename;
}

async function main() {
  const opts = parseArgs();

  const dotenv = await import('dotenv');
  dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local') });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { console.error('Missing GEMINI_API_KEY in .env.local'); process.exit(1); }

  const ai = new GoogleGenAI({ apiKey });

  const language = opts.language || 'spanish';

  // Load module data and derive vignettes
  const moduleData = await loadModuleData(language, opts.module);
  let allVignettes = deriveVignetteDefs(moduleData);

  // Filter to requested subset
  let vignettes: VignetteDef[];
  if (opts.id && opts.allVariants) {
    vignettes = allVignettes.filter(p => p.id === opts.id);
  } else if (opts.id && opts.variant) {
    const p = allVignettes.find(p => p.id === opts.id && p.variant === opts.variant);
    if (!p) {
      console.error(`Vignette not found: ${opts.id}/${opts.variant}`);
      console.error('Available:', allVignettes.map(v => `${v.id}/${v.variant}`).join(', '));
      process.exit(1);
    }
    vignettes = [p];
  } else {
    vignettes = allVignettes;
  }

  if (vignettes.length === 0) {
    console.error(`No vignettes found for module "${opts.module}"`);
    process.exit(1);
  }

  vignettes = sortBasesFirst(vignettes);
  console.log(`\nGenerating ${vignettes.length} vignette(s) for module "${opts.module}"...\n`);

  const outputDir = path.join(PROJECT_ROOT, 'public', 'scenes', language, opts.module, 'vignettes');
  fs.mkdirSync(outputDir, { recursive: true });

  const generatedFiles = new Map<string, string>();
  let succeeded = 0, failed = 0;

  for (const vignette of vignettes) {
    // Skip existing unless --force
    const existingPath = path.join(outputDir, getVignetteFilename(vignette));
    if (!opts.force && fs.existsSync(existingPath)) {
      console.log(`  [skip] ${vignette.category}/${vignette.id}/${vignette.variant} (exists)`);
      generatedFiles.set(vignetteKey(vignette), getVignetteFilename(vignette));
      continue;
    }

    try {
      let filename: string;
      const baseDef = getBaseVignette(vignette, allVignettes);
      if (baseDef) {
        const baseFilename = generatedFiles.get(vignetteKey(baseDef)) || getVignetteFilename(baseDef);
        const baseImagePath = path.join(outputDir, baseFilename);
        if (fs.existsSync(baseImagePath)) {
          filename = await generateVariantVignette(ai, vignette, opts.module, outputDir, baseImagePath, language);
        } else {
          console.log(`    (base not found, generating without reference)`);
          filename = await generateBaseVignette(ai, vignette, opts.module, outputDir, language);
        }
      } else {
        filename = await generateBaseVignette(ai, vignette, opts.module, outputDir, language);
      }
      generatedFiles.set(vignetteKey(vignette), filename);
      succeeded++;
    } catch (err) {
      console.error(`    FAILED: ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  // Write manifest
  console.log('\n  Writing manifest...');
  const manifestPath = path.join(outputDir, 'manifest.json');

  // Include existing files not regenerated this run
  for (const v of allVignettes) {
    const key = vignetteKey(v);
    if (!generatedFiles.has(key)) {
      const existing = path.join(outputDir, getVignetteFilename(v));
      if (fs.existsSync(existing)) {
        generatedFiles.set(key, getVignetteFilename(v));
      }
    }
  }

  const manifest = buildManifest(allVignettes, generatedFiles);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`  Manifest saved: ${manifestPath}`);
  console.log(`\nDone! ${succeeded} generated, ${failed} failed, ${vignettes.length - succeeded - failed} skipped.\n`);

  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
