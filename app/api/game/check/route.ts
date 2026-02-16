import { NextResponse } from 'next/server';
import { listSaves } from '@/lib/db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const profile = url.searchParams.get('profile');

  if (!profile) {
    return NextResponse.json({ saves: [] });
  }

  try {
    const saves = await listSaves(profile);
    return NextResponse.json({ saves });
  } catch (error) {
    console.error('Error checking saves:', error);
    return NextResponse.json({ saves: [] });
  }
}
