import { NextResponse } from 'next/server';
import { initGame } from '@/lib/game-bridge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const gameView = await initGame({
      module: body.module,
      language: body.language,
      profile: body.profile,
    });
    return NextResponse.json(gameView);
  } catch (error) {
    console.error('Game init error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initialize game' },
      { status: 500 },
    );
  }
}
