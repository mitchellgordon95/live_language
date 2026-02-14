# Language Life Sim

A Spanish language learning game where you control a character by typing commands in Spanish. The game provides grammar feedback, tracks vocabulary progress, and guides players through goal-based scenarios in different locations (home, restaurant, gym, etc.).

## Development

```bash
npm run build    # Compile TypeScript engine (required before running web UI)
cd web && npm run dev   # Start the Next.js web UI
```

Requires `ANTHROPIC_API_KEY` in `.env.local`.

**IMPORTANT**: Running `npm run build` while the dev server is running will break it — the dev server imports from `dist/` and the build overwrites those files mid-run. Always kill the dev server before building, then restart it after:
```bash
# Kill dev server → build → restart
lsof -ti:3000 | xargs kill -9; sleep 2; npm run build && cd web && npm run dev
```

## Architecture

```
src/
├── modes/unified.ts      # Game engine: AI integration, state management, turn processing
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
web/
├── app/                  # Next.js pages and API routes
├── components/           # ScenePanel, ChatPanel, InputBar
├── lib/
│   ├── game-bridge.ts    # Server-side bridge to compiled engine (dist/)
│   └── types.ts          # View model types (GameView, TurnResultView)
└── public/scenes/        # Generated scene images and portraits
```

## Key Concepts

**Game Engine** (`unified.ts`): The AI receives game state context and Spanish input, returns structured JSON with:
- Grammar feedback (score, corrections)
- Ordered actions to execute (go, take, open, talk, etc.)
- Goal completions, NPC responses, needs changes

**Web UI** (`web/`): Next.js app that calls the compiled engine via `game-bridge.ts`. Session state is kept in-memory on the server. The client receives `GameView` objects with scene images, object coordinates, and turn results.

**Modules**: Each location module exports locations, NPCs, goals, vocabulary, and `promptInstructions` (AI prompt text for that module's NPC interactions). All modules are registered in `module-registry.ts` which provides merged lookups. The AI system prompt is composed dynamically: core rules + current building's module instructions.

**State**: `GameState` tracks location, inventory, needs, goals, vocabulary progress, points/level, and per-building goal progress (paused when you leave a building).

## Adding a New Module

1. Create `src/languages/spanish/modules/{name}.ts` with locations, goals, NPCs, vocabulary, and `promptInstructions`
2. Register it in the Spanish language config (`src/languages/spanish/index.ts`)

See `.claude/agents/` for specialized agents: brainstormer, content-writer, implementer, QA, integrator, playtester.

## Code Style

- Prefer clear names over comments
- Keep functions small and focused
- Don't over-engineer - only add what's needed now
- State changes return new objects (immutable pattern)
