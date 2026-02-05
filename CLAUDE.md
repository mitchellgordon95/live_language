# Language Life Sim

A Spanish language learning game where you control a character by typing commands in Spanish. The game provides grammar feedback, tracks vocabulary progress, and guides players through goal-based scenarios in different locations (home, restaurant, gym, etc.).

## Development

```bash
npm run build    # Compile TypeScript
npm start        # Run the game
npm run dev      # Run without building (uses tsx)
```

Start in a specific module:
```bash
npm start -- --module restaurant   # restaurant, market, gym, park, clinic, bank
```

Run a test script:
```bash
npm start -- --script test-file.txt
DEBUG_UNIFIED=1 npm start -- --module gym --script test-gym.txt  # Show AI responses
```

Requires `ANTHROPIC_API_KEY` in `.env.local`.

## Architecture

```
src/
├── index.ts              # CLI entry point, argument parsing
├── modes/unified.ts      # Main game loop, AI integration, state management
├── engine/
│   ├── types.ts          # Core types: GameState, Location, Goal, NPC, etc.
│   ├── game-state.ts     # State helpers, points/levels, building transitions
│   └── vocabulary.ts     # Word tracking and familiarity system
├── data/
│   ├── home-basics.ts    # Home module: bedroom, bathroom, kitchen, NPCs
│   ├── restaurant-module.ts
│   ├── market-module.ts
│   ├── gym-module.ts
│   ├── park-module.ts
│   ├── clinic-module.ts
│   └── bank-module.ts
└── ui/terminal.ts        # All display/formatting functions
```

## Key Concepts

**Unified Mode** (`unified.ts`): The AI receives game state context and Spanish input, returns structured JSON with:
- Grammar feedback (score, corrections)
- Ordered actions to execute (go, take, open, talk, etc.)
- Goal completions, NPC responses, needs changes

**Modules**: Each location module exports:
- `Location` objects with objects, exits
- `Goal[]` chain with `checkComplete` functions
- `NPC[]` with personalities for AI to roleplay
- `VocabWord[]` for the vocabulary system

**State**: `GameState` tracks location, inventory, needs, goals, vocabulary progress, points/level, and per-building goal progress (paused when you leave a building).

## Adding a New Module

1. Create `src/data/{name}-module.ts` with locations, goals, NPCs, vocabulary
2. Add imports to `unified.ts` (locations, NPCs, goals)
3. Add to `getBuildingForLocation()` in `game-state.ts`
4. Add start goal case in `getStartGoalForBuilding()` in `unified.ts`
5. Add module option in `runUnifiedMode()` in `unified.ts`

See `.claude/agents/` for specialized agents: brainstormer, content-writer, implementer, QA, integrator, playtester.

## Code Style

- Prefer clear names over comments
- Keep functions small and focused
- Don't over-engineer - only add what's needed now
- State changes return new objects (immutable pattern)
