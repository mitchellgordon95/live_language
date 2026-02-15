import { NextResponse } from 'next/server';
import { playTurn, handleLearnCommand } from '@/lib/game-bridge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile, input } = body;

    if (!profile || !input) {
      return NextResponse.json(
        { error: 'Missing profile or input' },
        { status: 400 },
      );
    }

    // Handle /learn command
    if (input.trim().toLowerCase().startsWith('/learn')) {
      const topic = input.trim().slice(6).trim();
      if (!topic) {
        return NextResponse.json({ learn: { error: 'Usage: /learn <topic>\nExample: /learn ser vs estar' } });
      }
      const result = await handleLearnCommand(topic);
      return NextResponse.json({ learn: result });
    }

    const gameView = await playTurn(profile, input);
    return NextResponse.json(gameView);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process turn';
    console.error('Game turn error:', message);
    if (message.includes('No saved game found')) {
      return NextResponse.json(
        { error: 'No saved game found. Please start a new game.', sessionExpired: true },
        { status: 410 },
      );
    }
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
