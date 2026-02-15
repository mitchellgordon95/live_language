#!/usr/bin/env npx tsx
/**
 * Validates all scene coordinate manifests for bounds errors.
 * Checks that no object's bounding box exceeds the 0-100% coordinate space.
 *
 * Usage:
 *   npx tsx scripts/validate-coordinates.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCENES_DIR = path.join(PROJECT_ROOT, 'public', 'scenes');

interface Coords {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Manifest {
  image: string;
  objects: Record<string, Coords>;
}

function findManifests(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findManifests(fullPath));
    } else if (entry.name.endsWith('.json')) {
      results.push(fullPath);
    }
  }
  return results;
}

function validate(): void {
  const manifests = findManifests(SCENES_DIR);
  const errors: string[] = [];
  let objectCount = 0;

  for (const filePath of manifests) {
    const relative = path.relative(SCENES_DIR, filePath);
    let manifest: Manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      errors.push(`${relative}: Invalid JSON`);
      continue;
    }

    if (!manifest.objects) continue;

    for (const [objectId, coords] of Object.entries(manifest.objects)) {
      objectCount++;

      if (coords.w <= 0 || coords.h <= 0) {
        errors.push(`${relative}: ${objectId} has zero/negative dimensions (w=${coords.w}, h=${coords.h})`);
      }

      // Bounding boxes use center-based coordinates: x,y is center, w,h is full size
      // Check that the box stays within 0-100%
      const left = coords.x - coords.w / 2;
      const right = coords.x + coords.w / 2;
      const top = coords.y - coords.h / 2;
      const bottom = coords.y + coords.h / 2;

      if (right > 100) {
        errors.push(`${relative}: ${objectId} right edge exceeds 100% (x=${coords.x}, w=${coords.w}, right=${right.toFixed(1)})`);
      }
      if (bottom > 100) {
        errors.push(`${relative}: ${objectId} bottom edge exceeds 100% (y=${coords.y}, h=${coords.h}, bottom=${bottom.toFixed(1)})`);
      }
      if (left < 0) {
        errors.push(`${relative}: ${objectId} left edge below 0% (x=${coords.x}, w=${coords.w}, left=${left.toFixed(1)})`);
      }
      if (top < 0) {
        errors.push(`${relative}: ${objectId} top edge below 0% (y=${coords.y}, h=${coords.h}, top=${top.toFixed(1)})`);
      }
    }
  }

  console.log(`Checked ${objectCount} objects across ${manifests.length} manifests.`);

  if (errors.length === 0) {
    console.log('All coordinates valid.');
  } else {
    console.error(`\n${errors.length} error(s) found:\n`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }
}

validate();
