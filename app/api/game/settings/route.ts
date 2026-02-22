import { NextResponse } from 'next/server';
import { loadSettings, saveSettings } from '@/lib/db';
import { DEFAULT_SETTINGS } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profile = searchParams.get('profile');
  if (!profile) {
    return NextResponse.json({ error: 'Missing profile' }, { status: 400 });
  }

  const raw = await loadSettings(profile);
  return NextResponse.json({ ...DEFAULT_SETTINGS, ...raw });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { profile, settings } = body;
  if (!profile || !settings) {
    return NextResponse.json({ error: 'Missing profile or settings' }, { status: 400 });
  }

  await saveSettings(profile, settings);
  return NextResponse.json(settings);
}
