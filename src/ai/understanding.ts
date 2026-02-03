import Anthropic from '@anthropic-ai/sdk';
import type { GameState, AIUnderstandingResult, Intent } from '../engine/types.js';

// Lazy init so env vars are loaded first
let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

function buildContextPrompt(state: GameState): string {
  const objectsDesc = state.location.objects
    .filter((obj) => {
      // Hide items in closed fridge
      if (obj.state.inFridge) {
        const fridge = state.location.objects.find((o) => o.id === 'refrigerator');
        return fridge?.state.open;
      }
      return true;
    })
    .map((obj) => {
      let desc = `${obj.name.spanish} (${obj.name.english})`;
      if (obj.state.open !== undefined) desc += obj.state.open ? ' - open' : ' - closed';
      if (obj.state.on !== undefined) desc += obj.state.on ? ' - on' : ' - off';
      if (obj.state.ringing) desc += ' - RINGING';
      return desc;
    })
    .join('\n  ');

  const exitsDesc = state.location.exits
    .map((exit) => `${exit.name.spanish} (${exit.name.english})`)
    .join(', ');

  const inventoryDesc =
    state.inventory.length > 0
      ? state.inventory.map((item) => item.name.spanish).join(', ')
      : 'empty';

  const position = state.playerPosition === 'in_bed' ? "Player is in bed" : "Player is standing";

  return `CURRENT CONTEXT:
- Location: ${state.location.name.english} (${state.location.name.spanish})
- ${position}
- Objects here:
  ${objectsDesc}
- Exits to: ${exitsDesc}
- Player inventory: ${inventoryDesc}
- Player is learning Spanish (beginner level)

Available actions:
- WAKE_UP / GET_UP: Get out of bed (me levanto, me despierto)
- GO: Move to another room (voy a...)
- OPEN/CLOSE: Open or close objects (abro, cierro)
- TURN_ON/TURN_OFF: Turn things on/off (enciendo, apago)
- TAKE: Pick up an item (tomo, agarro)
- EAT/DRINK: Consume food/drink (como, bebo, tomo)
- COOK: Cook food (cocino)
- SHOWER: Take a shower (me ducho)
- BRUSH_TEETH: Brush teeth (me cepillo los dientes)
- USE: Use an object`;
}

const SYSTEM_PROMPT = `You are interpreting Spanish language input for a language learning game.

Your job is to:
1. Determine what action(s) the player is trying to take - they may chain multiple actions
2. Identify any grammar issues (be generous - if a native speaker would understand, mark it as understood)
3. Provide helpful, encouraging feedback

Return ONLY valid JSON with this exact structure:
{
  "understood": boolean,
  "confidence": "high" | "medium" | "low",
  "intents": [
    {
      "action": "WAKE_UP" | "GO" | "OPEN" | "CLOSE" | "TURN_ON" | "TURN_OFF" | "TAKE" | "EAT" | "DRINK" | "COOK" | "SHOWER" | "BRUSH_TEETH" | "USE" | null,
      "target": "object_id" | null,
      "destination": "location_id" | null
    }
  ],
  "grammar": {
    "score": 0-100,
    "issues": [
      {
        "type": "conjugation" | "gender" | "article" | "word_order" | "contraction" | "other",
        "original": "what they said",
        "corrected": "correct form",
        "explanation": "brief, helpful explanation"
      }
    ]
  },
  "response": {
    "successMessage": "English message describing what happened",
    "spanishModel": "Natural Spanish way to say this"
  }
}

Important:
- The "intents" array can contain multiple actions if the player chains them (e.g., "go to bathroom and use toilet" = 2 intents)
- Return intents in the order they should be executed
- Be generous with understanding. "me levanto" and "levanto" should both be understood as WAKE_UP
- For GO actions, match destinations to location IDs: bedroom, bathroom, kitchen
- For object targets, use these IDs: bed, alarm_clock, window, lamp, closet, sink, mirror, toilet, shower, toothbrush, towel, soap, refrigerator, stove, table, chair, coffee_maker, cup, plate, pan, milk, eggs, bread, butter, coffee, water, juice
- Accept common variations: "la nevera" = "el refrigerador", "el despertador" = "la alarma"
- Focus corrections on ONE main issue, not every small error
- Keep explanations brief and encouraging`;

export async function understandInput(
  playerInput: string,
  state: GameState
): Promise<AIUnderstandingResult> {
  const contextPrompt = buildContextPrompt(state);

  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${contextPrompt}\n\nPLAYER INPUT: "${playerInput}"`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]) as AIUnderstandingResult;
    return result;
  } catch (error) {
    console.error('AI understanding error:', error);
    // Return a fallback "didn't understand" response
    return {
      understood: false,
      confidence: 'low',
      intents: [{ action: null, target: null, destination: null }],
      grammar: { score: 0, issues: [] },
      response: {
        successMessage: "I didn't quite understand that. Could you try again?",
        spanishModel: '',
      },
    };
  }
}

// For testing without API calls
export function createMockUnderstanding(
  action: Intent['action'],
  target?: string,
  destination?: string
): AIUnderstandingResult {
  return {
    understood: true,
    confidence: 'high',
    intents: [{ action, target: target || null, destination: destination || null }],
    grammar: { score: 100, issues: [] },
    response: {
      successMessage: 'Action completed.',
      spanishModel: '',
    },
  };
}
