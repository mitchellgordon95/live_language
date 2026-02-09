#!/usr/bin/env npx tsx
/**
 * Generate scene images for ALL locations across all modules.
 * Iterates every module + location and calls generate-scene.ts for each.
 *
 * Usage:
 *   npx tsx scripts/generate-all-scenes.ts
 *   npx tsx scripts/generate-all-scenes.ts --skip-coordinates
 *   npx tsx scripts/generate-all-scenes.ts --module restaurant   # Only one module
 *
 * For parallel generation via agent swarm, use generate-scene.ts directly
 * with --module and --location flags for each scene.
 */

import { execSync } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  const result: { module?: string; skipCoordinates?: boolean } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === '--module' && next) { result.module = next; i++; }
    else if (arg === '--skip-coordinates') { result.skipCoordinates = true; }
  }

  return result;
}

async function main() {
  const opts = parseArgs();

  // Load the module registry to enumerate all locations
  const dotenv = await import('dotenv');
  dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local') });

  const engineRoot = path.join(PROJECT_ROOT, 'dist');
  const registry = await import(path.join(engineRoot, 'data', 'module-registry.js'));
  const languages = await import(path.join(engineRoot, 'languages', 'index.js'));

  // Get Spanish modules (primary language for scene generation)
  const spanishConfig = languages.getLanguage('spanish');
  if (!spanishConfig) {
    console.error('Spanish language config not found');
    process.exit(1);
  }

  // Build module→locations map
  const moduleLocations: Map<string, string[]> = new Map();
  for (const mod of spanishConfig.modules) {
    if (opts.module && mod.name !== opts.module) continue;
    moduleLocations.set(mod.name, mod.locationIds || Object.keys(mod.locations));
  }

  // Also include "street" which is a pseudo-location
  // (defined inline in Spanish config, not a module)
  if (!opts.module && registry.allLocations['street']) {
    const homeLocations = moduleLocations.get('home') || [];
    if (!homeLocations.includes('street')) {
      moduleLocations.set('home', [...homeLocations, 'street']);
    }
  }

  // Count total scenes
  let total = 0;
  for (const locations of moduleLocations.values()) {
    total += locations.length;
  }

  console.log(`\nGenerating ${total} scene images across ${moduleLocations.size} modules\n`);

  let completed = 0;
  const failed: string[] = [];

  for (const [moduleName, locationIds] of moduleLocations) {
    console.log(`\n--- Module: ${moduleName} (${locationIds.length} locations) ---`);

    for (const locationId of locationIds) {
      completed++;
      console.log(`\n[${completed}/${total}] ${moduleName}/${locationId}`);

      try {
        const skipFlag = opts.skipCoordinates ? ' --skip-coordinates' : '';
        execSync(
          `npx tsx scripts/generate-scene.ts --module ${moduleName} --location ${locationId}${skipFlag}`,
          { stdio: 'inherit', cwd: PROJECT_ROOT }
        );
      } catch (err) {
        console.error(`  FAILED: ${moduleName}/${locationId}`);
        failed.push(`${moduleName}/${locationId}`);
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Complete! ${completed - failed.length}/${total} scenes generated.`);
  if (failed.length > 0) {
    console.log(`\nFailed scenes:`);
    failed.forEach(f => console.log(`  - ${f}`));
  }
  console.log();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
