---
name: upgrade-schema
description: Upgrade the GameState schema version. Use when adding, renaming, or restructuring fields on GameState that need migration logic for existing saves.
---

# Upgrade GameState Schema

GameState is stored as JSONB in Postgres (`game_saves` table). Existing user saves must be migrated when the schema changes. Follow these steps:

## Steps

1. **Update the type** — Add/change fields on `GameState` in `src/engine/types.ts`

2. **Set defaults for new games** — Update `createInitialState()` in `src/engine/game-state.ts` to include the new field with its default value

3. **Write a migration** — In `lib/game-bridge.ts`, add a migration block inside `migrateState()`:
   ```ts
   if (raw.schemaVersion < N) {
     // Transform old data → new shape
     raw.newField = raw.newField ?? defaultValue;
     raw.schemaVersion = N;
   }
   ```
   Migrations run sequentially (v0→v1→v2→...) so each block only handles one version jump.

4. **Bump `CURRENT_SCHEMA_VERSION`** — Update the constant at the top of `lib/game-bridge.ts` to match the new version number

5. **Check serialization** — If the new field needs special handling (like `currentStep` which stores an ID instead of the full object), update `serializeState()` and `deserializeState()` in the same file

## Key files
- `src/engine/types.ts` — GameState interface
- `src/engine/game-state.ts` — `createInitialState()`
- `lib/game-bridge.ts` — `CURRENT_SCHEMA_VERSION`, `migrateState()`, `serializeState()`, `deserializeState()`

## Notes
- Migrations run automatically on load — no manual DB scripts needed
- Always provide defaults for new fields so old saves don't break
- The `schemaVersion` field was added in v1; saves without it are treated as v0
