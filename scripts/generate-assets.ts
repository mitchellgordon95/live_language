#!/usr/bin/env npx tsx
/**
 * Module-driven asset generation orchestrator.
 *
 * Loads compiled module data to auto-discover what scenes and vignettes are needed,
 * checks what already exists on disk, and generates only what's missing.
 *
 * This is the main agent-facing tool — run it after implementing a module to
 * generate all required assets.
 *
 * Usage:
 *   npx tsx scripts/generate-assets.ts --module home                  # generate all missing assets
 *   npx tsx scripts/generate-assets.ts --module home --dry-run        # audit: list missing assets
 *   npx tsx scripts/generate-assets.ts --module home --force          # regenerate everything
 *   npx tsx scripts/generate-assets.ts --module home --scenes-only    # only scenes
 *   npx tsx scripts/generate-assets.ts --module home --vignettes-only # only vignettes
 *
 * Requires: GEMINI_API_KEY in .env.local
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import {
  deriveVignetteDefs,
  type VignetteDef,
  type ModuleData,
} from './vignette-prompts.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCENES_ROOT = path.join(PROJECT_ROOT, 'public', 'scenes');

// --- Types ---

interface AssetAudit {
  scenes: {
    locationId: string;
    locationName: string;
    hasImage: boolean;
    hasManifest: boolean;
    imagePath: string;
    manifestPath: string;
  }[];
  vignettes: {
    def: VignetteDef;
    exists: boolean;
    filePath: string;
  }[];
  hasVignetteManifest: boolean;
}

// --- CLI ---

function parseArgs() {
  const args = process.argv.slice(2);
  const result: {
    language?: string;
    module?: string;
    dryRun?: boolean;
    force?: boolean;
    scenesOnly?: boolean;
    vignettesOnly?: boolean;
  } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === '--language' && next) { result.language = next; i++; }
    else if (arg === '--module' && next) { result.module = next; i++; }
    else if (arg === '--dry-run') { result.dryRun = true; }
    else if (arg === '--force') { result.force = true; }
    else if (arg === '--scenes-only') { result.scenesOnly = true; }
    else if (arg === '--vignettes-only') { result.vignettesOnly = true; }
  }

  if (!result.module) {
    console.error('Module Asset Generator');
    console.error('');
    console.error('Loads module data to discover what assets are needed, checks what');
    console.error('exists on disk, and generates only missing assets.');
    console.error('');
    console.error('Usage: npx tsx scripts/generate-assets.ts --module <name> [options]');
    console.error('');
    console.error('Options:');
    console.error('  --language <lang>    Language (default: spanish)');
    console.error('  --module <name>      Module to audit/generate (required)');
    console.error('  --dry-run            List missing assets without generating');
    console.error('  --force              Regenerate all assets even if they exist');
    console.error('  --scenes-only        Only process scene images');
    console.error('  --vignettes-only     Only process vignettes');
    process.exit(1);
  }

  return result as { language?: string; module: string } & typeof result;
}

// --- Module data loading ---

interface ModuleLocations {
  locations: Array<{
    id: string;
    name: { native: string };
    objects: Array<{ id: string; name: { native: string } }>;
  }>;
}

async function loadModuleInfo(languageId: string, moduleName: string): Promise<{ moduleData: ModuleData; locations: ModuleLocations }> {
  const engineRoot = path.join(PROJECT_ROOT, 'src');
  const languages = await import(path.join(engineRoot, 'languages', 'index.ts'));
  const config = languages.getLanguage(languageId);
  if (!config) {
    const available = languages.getAvailableLanguages().join(', ');
    throw new Error(`Language "${languageId}" not found. Available: ${available}`);
  }

  const mod = config.modules.find((m: { name: string }) => m.name === moduleName);
  if (!mod) {
    const available = config.modules.map((m: { name: string }) => m.name).join(', ');
    throw new Error(`Module "${moduleName}" not found. Available: ${available}`);
  }

  const moduleData: ModuleData = {
    name: mod.name,
    npcs: mod.npcs || [],
    objects: mod.objects || [],
  };

  // Get locations for scene audit
  const locationIds: string[] = mod.locationIds || Object.keys(mod.locations || {});
  const registry = await import(path.join(engineRoot, 'data', 'module-registry.ts'));
  registry.setActiveModules(config.modules);

  const allLocs = registry.getAllLocations();
  const locations: ModuleLocations = {
    locations: locationIds.map((id: string) => {
      const loc = allLocs[id];
      if (!loc) return { id, name: { native: id }, objects: [] };
      return {
        id: loc.id,
        name: loc.name,
        objects: (loc.objects || []).map((o: { id: string; name: { native: string } }) => ({
          id: o.id,
          name: o.name,
        })),
      };
    }),
  };

  return { moduleData, locations };
}

// --- Asset audit ---

function findExistingImage(dir: string, baseName: string): string | null {
  for (const ext of ['png', 'webp', 'jpg']) {
    const p = path.join(dir, `${baseName}.${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function auditAssets(
  languageId: string,
  moduleName: string,
  locations: ModuleLocations,
  vignetteDefs: VignetteDef[],
): AssetAudit {
  const moduleDir = path.join(SCENES_ROOT, languageId, moduleName);
  const vignetteDir = path.join(moduleDir, 'vignettes');

  // Audit scenes
  const scenes = locations.locations.map(loc => {
    const existing = findExistingImage(moduleDir, loc.id);
    const manifestPath = path.join(moduleDir, `${loc.id}.json`);
    return {
      locationId: loc.id,
      locationName: loc.name.native,
      hasImage: existing !== null,
      hasManifest: fs.existsSync(manifestPath),
      imagePath: existing || path.join(moduleDir, `${loc.id}.png`),
      manifestPath,
    };
  });

  // Audit vignettes
  const vignettes = vignetteDefs.map(def => {
    const filename = `${def.category}-${def.id}-${def.variant}.png`;
    const filePath = path.join(vignetteDir, filename);
    return {
      def,
      exists: fs.existsSync(filePath),
      filePath,
    };
  });

  const vignetteManifestPath = path.join(vignetteDir, 'manifest.json');
  const hasVignetteManifest = fs.existsSync(vignetteManifestPath);

  return { scenes, vignettes, hasVignetteManifest };
}

// --- Report ---

function printAudit(audit: AssetAudit, moduleName: string, force: boolean) {
  console.log(`\n=== Asset Audit: ${moduleName} ===\n`);

  // Scenes
  console.log(`Scenes (${audit.scenes.length} locations):`);
  for (const s of audit.scenes) {
    const imgStatus = s.hasImage ? 'OK' : 'MISSING';
    const jsonStatus = s.hasManifest ? 'OK' : 'MISSING';
    const marker = (!s.hasImage || !s.hasManifest || force) ? '  >>>' : '     ';
    console.log(`${marker} ${s.locationId}: image=${imgStatus}, manifest=${jsonStatus}`);
  }

  // Vignettes
  const existingCount = audit.vignettes.filter(v => v.exists).length;
  const missingCount = audit.vignettes.length - existingCount;
  console.log(`\nVignettes (${audit.vignettes.length} total, ${existingCount} exist, ${missingCount} missing):`);
  console.log(`  Manifest: ${audit.hasVignetteManifest ? 'OK' : 'MISSING'}`);

  // Group by category for display
  const byCategory = new Map<string, typeof audit.vignettes>();
  for (const v of audit.vignettes) {
    const cat = v.def.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(v);
  }

  for (const [category, items] of byCategory) {
    console.log(`\n  ${category}:`);
    for (const item of items) {
      const status = item.exists ? 'OK' : 'MISSING';
      const marker = (!item.exists || force) ? '  >>>' : '     ';
      const baseTag = item.def.isBase ? ' [base]' : '';
      console.log(`${marker}   ${item.def.id}/${item.def.variant}: ${status}${baseTag}`);
    }
  }

  // Summary
  const missingScenesImg = audit.scenes.filter(s => !s.hasImage).length;
  const missingScenesMfst = audit.scenes.filter(s => !s.hasManifest).length;
  const toGenerate = force
    ? { scenes: audit.scenes.length, vignettes: audit.vignettes.length }
    : { scenes: missingScenesImg, vignettes: missingCount };

  console.log(`\n--- Summary ---`);
  console.log(`  Scenes to generate: ${toGenerate.scenes}${force ? ' (--force)' : ''}`);
  console.log(`  Vignettes to generate: ${toGenerate.vignettes}${force ? ' (--force)' : ''}`);
  if (!audit.hasVignetteManifest || force) {
    console.log(`  Vignette manifest: needs update`);
  }

  return toGenerate;
}

// --- Generation (delegates to sub-scripts) ---

function runScript(cmd: string) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit', cwd: PROJECT_ROOT });
}

function generateMissingScenes(audit: AssetAudit, languageId: string, moduleName: string, force: boolean) {
  const toGenerate = force
    ? audit.scenes
    : audit.scenes.filter(s => !s.hasImage || !s.hasManifest);

  if (toGenerate.length === 0) {
    console.log('\nAll scenes exist, nothing to generate.');
    return;
  }

  console.log(`\n=== Generating ${toGenerate.length} Scene(s) ===`);

  for (const scene of toGenerate) {
    try {
      runScript(`npx tsx scripts/generate-scene.ts --language ${languageId} --module ${moduleName} --location ${scene.locationId}`);
    } catch (err) {
      console.error(`  FAILED: ${scene.locationId}`);
    }
  }
}

function generateMissingVignettes(languageId: string, moduleName: string, force: boolean) {
  // Delegate to generate-vignettes.ts which handles its own skip/force logic
  console.log(`\n=== Generating Vignettes ===`);
  const forceFlag = force ? ' --force' : '';
  try {
    runScript(`npx tsx scripts/generate-vignettes.ts --language ${languageId} --module ${moduleName}${forceFlag}`);
  } catch (err) {
    console.error('  Vignette generation failed');
  }
}

// --- Main ---

async function main() {
  const opts = parseArgs();

  // Load env for GEMINI_API_KEY availability check
  const dotenv = await import('dotenv');
  dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local') });

  if (!opts.dryRun && !process.env.GEMINI_API_KEY) {
    console.error('Missing GEMINI_API_KEY in .env.local (required for generation, not for --dry-run)');
    process.exit(1);
  }

  const language = opts.language || 'spanish';

  // Load module data from compiled engine
  console.log(`Loading module data for "${language}/${opts.module}"...`);
  const { moduleData, locations } = await loadModuleInfo(language, opts.module);

  // Derive vignette needs
  const vignetteDefs = deriveVignetteDefs(moduleData);

  // Audit existing assets
  const audit = auditAssets(language, opts.module, locations, vignetteDefs);
  const toGenerate = printAudit(audit, opts.module, !!opts.force);

  if (opts.dryRun) {
    if (toGenerate.scenes === 0 && toGenerate.vignettes === 0 && audit.hasVignetteManifest) {
      console.log('\nAll assets present! Nothing to generate.');
    } else {
      console.log('\nRun without --dry-run to generate missing assets.');
    }
    return;
  }

  // Generate missing assets
  if (toGenerate.scenes === 0 && toGenerate.vignettes === 0 && audit.hasVignetteManifest) {
    console.log('\nAll assets present! Nothing to generate.');
    return;
  }

  if (!opts.vignettesOnly && toGenerate.scenes > 0) {
    generateMissingScenes(audit, language, opts.module, !!opts.force);
  }

  if (!opts.scenesOnly && (toGenerate.vignettes > 0 || !audit.hasVignetteManifest)) {
    generateMissingVignettes(language, opts.module, !!opts.force);
  }

  console.log('\nAsset generation complete!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
