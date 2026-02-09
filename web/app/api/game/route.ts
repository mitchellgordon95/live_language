import { NextResponse } from 'next/server';
import { playTurn } from '@/lib/game-bridge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, input } = body;

    if (!sessionId || !input) {
      return NextResponse.json(
        { error: 'Missing sessionId or input' },
        { status: 400 },
      );
    }

    const gameView = await playTurn(sessionId, input);
    return NextResponse.json(gameView);
  } catch (error) {
    console.error('Game turn error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process turn' },
      { status: 500 },
    );
  }
}
