import { NextResponse } from 'next/server';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getModule, updateModuleAssets } from '@/lib/db';
import {
  generateSceneImage,
  extractCoordinates,
  buildPromptContextForUGC,
} from '@/lib/asset-generator';

export const maxDuration = 300;

interface ModuleLocation {
  name: { target: string; native: string };
  exits: Array<{ to: string; name: { target: string; native: string } }>;
}

interface ModuleObject {
  id: string;
  name: { target: string; native: string };
  location: string;
}

interface ModuleData {
  name: string;
  locations: Record<string, ModuleLocation>;
  objects: ModuleObject[];
}

async function uploadImage(
  buffer: Buffer,
  mimeType: string,
  moduleId: string,
  locationId: string,
): Promise<string> {
  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';

  // Use Vercel Blob if token is available, otherwise write to public/
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const { url } = await put(`scenes/${moduleId}/${locationId}.${ext}`, buffer, {
      access: 'public',
      contentType: mimeType,
    });
    return url;
  }

  // Local fallback: write to public/scenes/{moduleId}/{locationId}.{ext}
  const dir = join(process.cwd(), 'public', 'scenes', moduleId);
  mkdirSync(dir, { recursive: true });
  const filePath = join(dir, `${locationId}.${ext}`);
  writeFileSync(filePath, buffer);
  return `/scenes/${moduleId}/${locationId}.${ext}`;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { locationId } = body;

    if (!locationId) {
      return NextResponse.json({ error: 'locationId is required' }, { status: 400 });
    }

    const mod = await getModule(id);
    if (!mod) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const moduleData = mod.moduleData as ModuleData;
    const location = moduleData.locations?.[locationId];
    if (!location) {
      return NextResponse.json({ error: `Location "${locationId}" not found in module` }, { status: 400 });
    }

    const objects = (moduleData.objects || []) as ModuleObject[];

    // Build prompt context using shared infrastructure
    const context = buildPromptContextForUGC(locationId, location, moduleData.name, objects);

    // Generate scene image
    const { buffer, mimeType } = await generateSceneImage(context);

    // Upload (blob or local)
    const imageUrl = await uploadImage(buffer, mimeType, id, locationId);

    // Extract object coordinates
    const objectsHere = objects.filter(o => o.location === locationId);
    const coordinates = await extractCoordinates(
      buffer,
      mimeType,
      objectsHere.map(o => o.id),
      objectsHere.map(o => o.name.native),
    );

    // Save to DB
    await updateModuleAssets(id, locationId, imageUrl, coordinates);

    return NextResponse.json({ locationId, imageUrl, coordinates });
  } catch (error) {
    console.error('Asset generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate assets' },
      { status: 500 },
    );
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const mod = await getModule(id);
    if (!mod) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    return NextResponse.json({
      assetStatus: mod.assetStatus,
      assets: mod.assets,
    });
  } catch (error) {
    console.error('Get assets error:', error);
    return NextResponse.json({ error: 'Failed to get asset status' }, { status: 500 });
  }
}
