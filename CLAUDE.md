# Language Life Sim

A Spanish language learning game where you control a character by typing commands in Spanish. The game provides grammar feedback, tracks vocabulary progress, and guides players through goal-based scenarios in different locations (home, restaurant, gym, etc.).

## Development

```bash
npm install    # Install dependencies
npm run dev    # Start the Next.js dev server
```

Requires `ANTHROPIC_API_KEY` and `DATABASE_URL` in `.env.local`.

## Architecture

This is a standard Next.js project. The game engine lives in `src/` and is imported directly by the server-side bridge code — no separate build step.

```
app/                      # Next.js pages and API routes
components/               # ScenePanel, ChatPanel, InputBar
lib/
├── game-bridge.ts        # Server-side bridge: sessions, view models, engine imports
├── types.ts              # View model types (GameView, TurnResultView)
├── db.ts                 # Postgres persistence
└── vignette-generator.ts # Dynamic portrait generation
src/                      # Game engine (pure TypeScript, no Node.js file APIs)
├── modes/unified.ts      # AI integration, state management, turn processing
├── engine/
│   ├── types.ts          # Core types: GameState, Location, Goal, NPC, etc.
│   ├── game-state.ts     # State helpers, points/levels, building transitions
│   └── vocabulary.ts     # Word tracking and familiarity system
├── data/
│   └── module-registry.ts # Module registry: ModuleDefinition, merged lookups
└── languages/
    ├── types.ts, index.ts # Language config registry
    ├── spanish/           # Spanish config, prompt, helpers, modules/
    └── mandarin/          # Mandarin config (stub)
scripts/                  # Scene/vignette generation (npx tsx)
public/scenes/            # Generated scene images and portraits
```

## Key Concepts

**Game Engine** (`src/modes/unified.ts`): The AI receives game state context and Spanish input, returns structured JSON with grammar feedback, ordered mutations, goal completions, NPC responses, and needs changes.

**Web UI**: Next.js app with API routes (`app/api/game/`). `game-bridge.ts` imports the engine directly and maps its internal state to `GameView` types for the client. Session state is in-memory + persisted to Postgres.

**Modules**: Each location module exports locations, NPCs, goals, vocabulary, and `promptInstructions`. All modules are registered in `module-registry.ts`. The AI system prompt is composed dynamically: core rules + current building's module instructions.

**State**: `GameState` tracks location, inventory, needs, goals, vocabulary progress, points/level, and per-building goal progress (paused when you leave a building). Persisted to Postgres as JSONB per profile.

## Adding a New Module

1. Create `src/languages/spanish/modules/{name}.ts` with locations, goals, NPCs, vocabulary, and `promptInstructions`
2. Register it in the Spanish language config (`src/languages/spanish/index.ts`)

See `.claude/agents/` for specialized agents: brainstormer, content-writer, implementer, QA, integrator, playtester.

## Code Style

- Prefer clear names over comments
- Keep functions small and focused
- Don't over-engineer - only add what's needed now
- State changes return new objects (immutable pattern)
