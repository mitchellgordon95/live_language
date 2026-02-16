import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  try {
    const { description, languageId } = await request.json();
    if (!description || !languageId) {
      return NextResponse.json({ error: 'Missing description or languageId' }, { status: 400 });
    }

    const client = new Anthropic();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: `You are a creative game designer for a language learning life simulation game. The player controls a character by typing commands in their target language. Each "module" is a themed location with rooms, interactive objects, NPCs to talk to, tutorial quests, and vocabulary to learn.

Given a user's learning goal, propose exactly 3 distinct module concepts. Each should be a different setting/theme that could teach the requested content. Be creative but practical — the settings should have 3-5 rooms, interactive objects, at least 1 NPC, and quest-based progression (not tutorials).

Respond with a JSON array:
[
  {
    "title": "Short module title",
    "setting": "1-2 sentence description of the physical setting",
    "vocabFocus": "What vocabulary/grammar this teaches",
    "locationCount": 4,
    "locations": ["room1", "room2", "room3", "room4"],
    "npcIdeas": ["NPC name - brief role description"]
  }
]

Only output the JSON array, no other text.`,
      messages: [
        { role: 'user', content: `Language: ${languageId}\n\nWhat I want to learn: ${description}` },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const directions = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ directions });
  } catch (error) {
    console.error('Brainstorm error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to brainstorm' },
      { status: 500 },
    );
  }
}
