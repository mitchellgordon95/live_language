import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 60;

const LANGUAGE_NAMES: Record<string, string> = {
  spanish: 'Spanish',
  mandarin: 'Mandarin Chinese',
  hindi: 'Hindi',
  portuguese: 'Brazilian Portuguese',
};

function langTip(languageId: string): string {
  switch (languageId) {
    case 'mandarin':
      return 'For Mandarin, include pinyin in parentheses after characters: "冰箱 (bīngxiāng)"';
    case 'hindi':
      return 'For Hindi, include romanization in parentheses after Devanagari: "रसोई (rasoi)"';
    case 'portuguese':
      return 'For Portuguese, include articles with nouns: "a mesa", "o prato"';
    default:
      return 'For Spanish, include articles with nouns: "la mesa", "el plato"';
  }
}

// --- Phase-specific type schemas ---

const CURRICULUM_SCHEMA = `
interface Curriculum {
  learningObjectives: string[];  // 3-5 specific things the player will learn to do
  grammarFocus: string[];        // Specific grammar concepts to practice
  teachingApproach: string;      // How the module teaches (correction style, immersion level)
}

interface VocabWord {
  target: string;         // Word in learning language
  native: string;         // English translation
  category: 'noun' | 'verb' | 'adjective' | 'other';
  gender?: 'masculine' | 'feminine';  // For gendered languages
}

// Output format:
{
  "name": "lowercase_snake_case",     // max 20 chars
  "displayName": "Human-Readable Title",
  "curriculum": { ... },
  "vocabulary": [ ... ],              // 40-60 words
  "unlockLevel": 1
}`;

const WORLD_SCHEMA = `
interface Location {
  id: string;
  name: { target: string; native: string };  // target = learning language, native = English
  exits: Array<{ to: string; name: { target: string; native: string } }>;
  verbs?: Array<{ target: string; native: string }>;  // Suggested actions for this location
}

interface WorldObject {
  id: string;             // lowercase_snake_case
  name: { target: string; native: string };
  location: string;       // location ID, or container object ID for items inside containers
  tags: string[];         // State tags: 'open','closed','on','off','takeable','consumable','container','ringing'
}

// Output format:
{
  "locations": { "loc_id": { ... }, ... },  // 3-5 locations connected by exits
  "objects": [ ... ],                        // 15-30 objects spread across locations
  "startLocationId": "loc_id",
  "locationIds": ["loc_id", ...]
}`;

const CHARACTERS_SCHEMA = `
interface NPC {
  id: string;
  name: { target: string; native: string };
  location: string;       // Must be a valid location ID from the world
  personality: string;    // Detailed personality for AI role-play
  gender?: 'male' | 'female';
  isPet?: boolean;
  appearance?: string;    // Visual description for portrait generation
}

// Quests are offered by NPCs, completed by AI detection
interface SerializableQuest {
  id: string;
  title: { target: string; native: string };
  description: string;
  completionHint: string; // For AI: how to detect quest completion
  hint?: string;
  source: 'npc' | 'object' | 'event';
  sourceId?: string;      // NPC or object ID that offers this quest
  module: string;         // Same as module name
  triggerRule: CheckRule;
  reward: { points?: number; badge?: { id: string; name: string } };
  prereqs?: string[];     // Quest IDs that must complete first
}

type CheckRule =
  | { type: 'location'; locationId: string }
  | { type: 'playerTag'; tag: string; has: boolean }
  | { type: 'objectLocation'; objectId: string; location: string }
  | { type: 'objectTag'; objectId: string; tag: string; has: boolean }
  | { type: 'completedQuest'; questId: string }
  | { type: 'and'; rules: CheckRule[] }

// Output format:
{
  "npcs": [ ... ],    // 1-3 NPCs
  "quests": [ ... ]   // 3-5 quests, chained via prereqs
}`;

// --- Phase handler ---

type Phase = 'curriculum' | 'world' | 'characters' | 'guidance';

function buildSystemPrompt(phase: Phase, langName: string, languageId: string): string {
  const base = `You are an expert game designer and language educator creating a module for a language learning life simulation game. Players interact by typing commands in ${langName}.`;
  const tip = langTip(languageId);

  switch (phase) {
    case 'curriculum':
      return `${base}

Your job: Design the LEARNING PLAN for this module. Think deeply about what the player should learn and what vocabulary supports those goals.

Types:
${CURRICULUM_SCHEMA}

Rules:
- All "target" text must be in ${langName}, all "native" text in English
- ${tip}
- Vocabulary should have 40-60 words covering nouns, verbs, and key phrases relevant to the learning objectives
- The curriculum should identify specific, actionable grammar concepts (not vague goals)
- module name should be lowercase_snake_case, max 20 chars

Respond with ONLY the JSON object, no other text or markdown fences.`;

    case 'world':
      return `${base}

Your job: Design the PHYSICAL WORLD — locations and objects. The vocabulary from the curriculum phase should naturally appear as interactable objects in the world.

Types:
${WORLD_SCHEMA}

Rules:
- All "target" text must be in ${langName}, all "native" text in English
- ${tip}
- Create 3-5 locations connected by exits forming a navigable graph (every location reachable)
- Include 15-30 objects spread across locations
- Container objects need 'container' tag; items inside have location set to container's ID
- Objects should represent vocabulary words from the curriculum — the world IS the vocabulary
- Include some objects with state tags (open/closed, on/off) for interactive gameplay

Respond with ONLY the JSON object, no other text or markdown fences.`;

    case 'characters':
      return `${base}

Your job: Create CHARACTERS (NPCs) and QUESTS. NPCs should use the grammar concepts from the curriculum in their dialogue. Quests should exercise those grammar concepts.

Types:
${CHARACTERS_SCHEMA}

Rules:
- All "target" text must be in ${langName}, all "native" text in English
- ${tip}
- Include 1-3 NPCs with detailed personalities that guide their dialogue style
- Include 3-5 quests that progress the player through the learning objectives
- Chain quests via prereqs so completing one unlocks the next
- Use descriptive completionHint so the AI knows when the player completes them
- Each NPC should have an appearance description for portrait generation
- Quest triggerRules should reference valid location/object/NPC IDs from the world

Respond with ONLY the JSON object, no other text or markdown fences.`;

    case 'guidance':
      return `${base}

Your job: Write the AI TEACHING GUIDE — a detailed system prompt that will be given to the AI during gameplay. This prompt should make the AI an effective language teacher within this module's theme.

Output format:
{
  "guidance": "Your detailed prompt text here..."
}

The guidance should cover:
- Environment and atmosphere description
- How objects work (state changes, containers, interactions)
- NPC personalities and dialogue patterns
- Quest progression and how to detect quest completion
- Teaching focus based on the curriculum's grammar concepts
- Correction style (gentle, encouraging, immersive)
- How to naturally introduce and reinforce vocabulary

Respond with ONLY the JSON object, no other text or markdown fences.`;
  }
}

function buildUserMessage(
  phase: Phase,
  direction: { title: string; setting: string; vocabFocus: string; locations?: string[]; npcIdeas?: string[] },
  userDescription: string,
  previousData: Record<string, unknown>,
): string {
  const directionContext = `User's goal: ${userDescription || 'Learn through this theme'}

Selected direction:
- Title: ${direction.title}
- Setting: ${direction.setting}
- Vocabulary focus: ${direction.vocabFocus}
- Location ideas: ${direction.locations?.join(', ') || 'TBD'}
- NPC ideas: ${direction.npcIdeas?.join('; ') || 'TBD'}`;

  switch (phase) {
    case 'curriculum':
      return `${directionContext}

Design the learning plan and vocabulary for this module.`;

    case 'world':
      return `${directionContext}

Here is the curriculum and vocabulary already designed:
${JSON.stringify(previousData, null, 2)}

Now design the locations and objects. The vocabulary words should appear as interactable objects in the world.`;

    case 'characters':
      return `${directionContext}

Here is the module so far (curriculum, vocabulary, locations, objects):
${JSON.stringify(previousData, null, 2)}

Now create the NPCs and quests. NPCs should use the grammar from the curriculum. Quests should exercise those concepts. Use the module name "${previousData.name}" for the quest module field.`;

    case 'guidance':
      return `${directionContext}

Here is the complete module data:
${JSON.stringify(previousData, null, 2)}

Now write the AI teaching guide for this module.`;
  }
}

export async function POST(request: Request) {
  try {
    const { phase, direction, languageId, userDescription, previousData } = await request.json();

    if (!phase || !direction || !languageId) {
      return NextResponse.json({ error: 'Missing phase, direction, or languageId' }, { status: 400 });
    }

    const validPhases: Phase[] = ['curriculum', 'world', 'characters', 'guidance'];
    if (!validPhases.includes(phase)) {
      return NextResponse.json({ error: `Invalid phase: ${phase}` }, { status: 400 });
    }

    const langName = LANGUAGE_NAMES[languageId] || languageId;
    const client = new Anthropic();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: phase === 'guidance' ? 4096 : 3000,
      system: buildSystemPrompt(phase as Phase, langName, languageId),
      messages: [
        {
          role: 'user',
          content: buildUserMessage(phase as Phase, direction, userDescription || '', previousData || {}),
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: `Failed to parse AI response for phase: ${phase}` }, { status: 500 });
    }

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Generate phase error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate module phase' },
      { status: 500 },
    );
  }
}
