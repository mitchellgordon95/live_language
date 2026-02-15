import { NextResponse } from 'next/server';
import { hasSave } from '@/lib/db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const profile = url.searchParams.get('profile');

  if (!profile) {
    return NextResponse.json({ hasSave: false });
  }

  try {
    const result = await hasSave(profile);
    return NextResponse.json({ hasSave: result.exists, module: result.module, languageId: result.languageId });
  } catch (error) {
    console.error('Error checking save:', error);
    return NextResponse.json({ hasSave: false });
  }
}
