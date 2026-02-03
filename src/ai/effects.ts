import Anthropic from '@anthropic-ai/sdk';
import type { GameState, Intent, Needs, ObjectState } from '../engine/types.js';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

export interface ActionEffects {
  valid: boolean;
  message: string;
  needsChanges?: Partial<Needs>;
  inventoryAdd?: string[];      // object IDs to add to inventory
  inventoryRemove?: string[];   // object IDs to remove from inventory
  objectChanges?: { objectId: string; changes: Partial<ObjectState> }[];
  moveToLocation?: string;      // location ID
}

function buildContextPrompt(state: GameState): string {
  const objects = state.location.objects
    .map(obj => {
      let desc = `${obj.id}: ${obj.name.spanish} (${obj.name.english})`;
      if (obj.state.open !== undefined) desc += `, open=${obj.state.open}`;
      if (obj.state.on !== undefined) desc += `, on=${obj.state.on}`;
      if (obj.takeable) desc += `, takeable`;
      if (obj.consumable) desc += `, consumable`;
      return desc;
    })
    .join('\n    ');

  const inventory = state.inventory.length > 0
    ? state.inventory.map(i => `${i.id}: ${i.name.spanish}`).join(', ')
    : 'empty';

  return `CURRENT GAME STATE:
  Location: ${state.location.id} (${state.location.name.english})
  Player position: ${state.playerPosition}

  Objects here:
    ${objects}

  Player inventory: ${inventory}

  Player needs (0-100 scale, higher is better):
    energy: ${state.needs.energy}
    hunger: ${state.needs.hunger}
    hygiene: ${state.needs.hygiene}
    bladder: ${state.needs.bladder}`;
}

const SYSTEM_PROMPT = `You are the physics/logic engine for a life simulation game. Given a player action and game state, determine:
1. Is this action valid/possible in context?
2. What effects should it have on the game state?

Return ONLY valid JSON:
{
  "valid": boolean,
  "message": "Brief description of what happens (in English, 1 sentence)",
  "reasoning": "Why this is/isn't valid (for debugging, not shown to player)",
  "effects": {
    "needsChanges": { "energy": number, "hunger": number, "hygiene": number, "bladder": number } | null,
    "inventoryAdd": ["object_id"] | null,
    "inventoryRemove": ["object_id"] | null,
    "objectChanges": [{ "objectId": "id", "changes": { "open": boolean, "on": boolean, ... } }] | null,
    "moveToLocation": "location_id" | null
  }
}

Guidelines:
- Be creative but realistic. Throwing soap is valid (it would fall). Using a pan as a weapon... maybe, depending on context.
- For needs changes, use small increments: -20 to +20 typically, max ±50 for major actions
- Only include effects that actually change (null or omit unchanged fields)
- If invalid, explain why in the message (e.g., "You can't eat the table.")
- Consider what the player is holding (inventory) and where they are
- Consumable items should be removed from inventory when eaten/drunk`;

export async function evaluateAction(
  intent: Intent,
  state: GameState
): Promise<ActionEffects> {
  const context = buildContextPrompt(state);

  const actionDesc = intent.action
    ? `Action: ${intent.action}${intent.target ? ` on ${intent.target}` : ''}${intent.destination ? ` to ${intent.destination}` : ''}`
    : 'Unknown action';

  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${context}\n\n${actionDesc}\n\nWhat happens?`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      valid: result.valid,
      message: result.message,
      needsChanges: result.effects?.needsChanges || undefined,
      inventoryAdd: result.effects?.inventoryAdd || undefined,
      inventoryRemove: result.effects?.inventoryRemove || undefined,
      objectChanges: result.effects?.objectChanges || undefined,
      moveToLocation: result.effects?.moveToLocation || undefined,
    };
  } catch (error) {
    console.error('AI effects evaluation error:', error);
    return {
      valid: false,
      message: "Something went wrong. Try a different action.",
    };
  }
}
