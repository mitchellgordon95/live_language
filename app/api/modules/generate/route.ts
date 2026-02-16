import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const MODULE_SCHEMA = `
// IMPORTANT: User-generated modules use QUESTS only, NOT tutorials.
// Tutorials are too linear — they belong exclusively to the built-in home module.
// Guide players through quests instead, which are more open-ended.
interface SerializableModuleDefinition {
  name: string;           // lowercase_snake_case identifier
  displayName: string;    // Human-readable title
  locations: Record<string, Location>;
  objects: WorldObject[];
  npcs: NPC[];
  quests: SerializableQuest[];
  vocabulary: VocabWord[];
  guidance: string;       // AI system prompt for this module
  startLocationId: string;
  locationIds: string[];  // All location IDs
  unlockLevel: number;    // Always 1 for user modules
}

interface Location {
  id: string;
  name: { target: string; native: string };  // target = learning language, native = English
  exits: Array<{ to: string; name: { target: string; native: string } }>;
  verbs?: Array<{ target: string; native: string }>;  // Suggested actions
}

interface WorldObject {
  id: string;             // lowercase_snake_case
  name: { target: string; native: string };
  location: string;       // location ID, or container object ID for items inside containers
  tags: string[];         // State tags: 'open','closed','on','off','takeable','consumable','container','ringing'
  needsEffect?: { energy?: number; hunger?: number; hygiene?: number; bladder?: number };
}

interface NPC {
  id: string;
  name: { target: string; native: string };
  location: string;
  personality: string;    // Detailed personality for AI role-play
  gender?: 'male' | 'female';
  isPet?: boolean;
  appearance?: string;    // Visual description for portrait generation
}

// Quests are triggered by NPCs or events, completed by AI detection
interface SerializableQuest {
  id: string;
  title: { target: string; native: string };
  description: string;
  completionHint: string; // For AI: how to detect quest completion
  hint?: string;
  source: 'npc' | 'object' | 'event';
  sourceId?: string;      // NPC or object ID
  module: string;         // Same as module name
  triggerRule: CheckRule;
  reward: { points?: number; badge?: { id: string; name: string } };
  prereqs?: string[];     // Quest IDs that must complete first
  autoStart?: boolean;    // true = auto-triggers when rule passes
}

// CheckRule — declarative completion conditions
type CheckRule =
  | { type: 'location'; locationId: string }              // Player is at location
  | { type: 'playerTag'; tag: string; has: boolean }       // Player has/doesn't have tag
  | { type: 'objectLocation'; objectId: string; location: string }  // Object is at location/inventory
  | { type: 'objectTag'; objectId: string; tag: string; has: boolean }  // Object has/doesn't have tag
  | { type: 'completedQuest'; questId: string }            // Quest completed
  | { type: 'and'; rules: CheckRule[] }                    // All rules must pass

interface VocabWord {
  target: string;         // Word in learning language
  native: string;         // English translation
  category: 'noun' | 'verb' | 'adjective' | 'other';
  gender?: 'masculine' | 'feminine';  // For gendered languages
}
`;

export async function POST(request: Request) {
  try {
    const { direction, languageId, userDescription } = await request.json();
    if (!direction || !languageId) {
      return NextResponse.json({ error: 'Missing direction or languageId' }, { status: 400 });
    }

    const languageNames: Record<string, string> = {
      spanish: 'Spanish',
      mandarin: 'Mandarin Chinese',
      hindi: 'Hindi',
    };
    const langName = languageNames[languageId] || languageId;

    const client = new Anthropic();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: `You are an expert game designer creating a module for a language learning life simulation game. Players interact by typing in ${langName}.

Generate a complete SerializableModuleDefinition as JSON. Here are the types:
${MODULE_SCHEMA}

IMPORTANT RULES:
- All "target" text must be in ${langName}, all "native" text in English
- For ${languageId === 'mandarin' ? 'Mandarin, include pinyin in parentheses after characters: "冰箱 (bīngxiāng)"' : languageId === 'hindi' ? 'Hindi, include romanization in parentheses after Devanagari: "रसोई (rasoi)"' : 'Spanish, include articles with nouns: "la mesa", "el plato"'}
- Create 3-5 locations connected by exits forming a navigable graph
- Include 15-30 objects spread across locations (some in containers)
- Include 1-3 NPCs with detailed personalities
- Do NOT include a "tutorial" field — user modules use quests only, not tutorials
- Include 3-5 quests that guide the player through the module's learning goals
  - First quest should autoStart: true so the player has immediate direction
  - Chain quests via prereqs so completing one unlocks the next
  - Use descriptive completionHint so the AI knows when the player completes them
- Vocabulary should have 40-60 words covering nouns, verbs, and key phrases
- The "guidance" field should be a detailed AI system prompt describing:
  - Environment and atmosphere
  - How objects work (state changes, containers)
  - NPC personalities and dialogue patterns
  - The quest progression and how to detect quest completion
  - Teaching focus and correction style
- module name should be lowercase_snake_case, max 20 chars
- Container objects need 'container' tag; items inside have location set to container's ID

Respond with ONLY the JSON object, no other text or markdown fences.`,
      messages: [
        {
          role: 'user',
          content: `User's goal: ${userDescription || 'Learn through this theme'}

Selected direction:
- Title: ${direction.title}
- Setting: ${direction.setting}
- Vocabulary focus: ${direction.vocabFocus}
- Locations: ${direction.locations?.join(', ') || 'TBD'}
- NPCs: ${direction.npcIdeas?.join('; ') || 'TBD'}

Generate the complete module JSON.`,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const moduleData = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ moduleData });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate module' },
      { status: 500 },
    );
  }
}
