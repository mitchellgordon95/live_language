import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { moduleData, message, languageId, chatHistory } = await request.json();
    if (!moduleData || !message || !languageId) {
      return NextResponse.json({ error: 'Missing moduleData, message, or languageId' }, { status: 400 });
    }

    const client = new Anthropic();

    // Build conversation history for multi-turn refinement
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    if (chatHistory && Array.isArray(chatHistory)) {
      for (const entry of chatHistory) {
        if (entry.role && entry.content) {
          messages.push({ role: entry.role, content: entry.content });
        }
      }
    }

    messages.push({
      role: 'user',
      content: `Current module JSON:
\`\`\`json
${JSON.stringify(moduleData, null, 2)}
\`\`\`

User request: ${message}

Apply the requested changes and return the COMPLETE updated module JSON. After the JSON, add a brief explanation of what you changed (1-2 sentences).

Format your response as:
\`\`\`json
{ ... complete module ... }
\`\`\`

**Changes:** brief explanation here`,
    });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: `You are a game designer refining a language learning module. The module is a SerializableModuleDefinition JSON object for a ${languageId} language learning game.

When the user asks to modify the module, apply their changes carefully:
- Keep all existing content unless explicitly asked to remove it
- Maintain consistency (if adding a location, add exits to/from it; if adding objects, include vocab)
- User modules use quests only, NOT tutorials — do not add tutorial steps
- Quest triggerRules should reference valid quests; chain quests via prereqs
- All target text must be in the target language, native text in English

Return the COMPLETE updated module JSON (not just the changed parts).`,
      messages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const updatedModule = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    // Extract explanation
    const explanationMatch = text.match(/\*\*Changes?:\*\*\s*([\s\S]*?)$/)
      || text.match(/```\s*\n+([\s\S]*?)$/);
    const explanation = explanationMatch ? explanationMatch[1].trim() : 'Module updated.';

    return NextResponse.json({ moduleData: updatedModule, explanation });
  } catch (error) {
    console.error('Refine error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refine module' },
      { status: 500 },
    );
  }
}
