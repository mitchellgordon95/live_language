import { NextResponse } from 'next/server';
import { createModule, listModules } from '@/lib/db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const profile = url.searchParams.get('profile');
  const language = url.searchParams.get('language') || undefined;
  if (!profile) {
    return NextResponse.json({ modules: [] });
  }

  try {
    const modules = await listModules(profile, language);
    return NextResponse.json({ modules });
  } catch (error) {
    console.error('List modules error:', error);
    return NextResponse.json({ error: 'Failed to list modules' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id, profile, languageId, title, description, moduleData } = await request.json();
    if (!id || !profile || !languageId || !title || !moduleData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await createModule(id, profile, languageId, title, description || null, moduleData);
    return NextResponse.json({ id });
  } catch (error) {
    console.error('Create module error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create module' },
      { status: 500 },
    );
  }
}
