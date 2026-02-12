# Home Module — Solutions Overview

Consolidated fix proposals for all CRITICAL and HIGH severity issues found during QA playtesting.

---

## CRITICAL Issues

### CRIT-001: ChatPanel crash on compound room-change + NPC reaction

**Problem**: `Cannot read properties of undefined (reading 'charAt')` at `ChatPanel.tsx:106`. When the AI returns an `npcResponse` without `npcId`, `npcName` becomes `undefined` and the UI crashes.

**Files**: `web/lib/game-bridge.ts`, `web/components/ChatPanel.tsx`

**Fix**:
1. Guard the npcResponse mapping in `game-bridge.ts:496` to require a truthy `npcId`:
```typescript
npcResponse: (response.npcResponse && response.npcResponse.npcId) ? {
  npcName: response.npcResponse.npcId,
  target: response.npcResponse.spanish || '',
  native: response.npcResponse.english || '',
  actionText: response.npcResponse.actionText,
  voice: npcVoice(response.npcResponse.npcId, state.location.id),
} : null,
```
2. Defensive fallback in `ChatPanel.tsx:106`:
```typescript
{(result.npcResponse.npcName || '?').charAt(0).toUpperCase()}
```

**Effort**: Small (2 one-line changes)

---

### CRIT-002: Compound move+interact checks preconditions before movement

**Problem**: AI validates actions against the current room before returning actions. "Voy a la sala y le doy comida a Luna" fails because Luna isn't in the current room. Engine is correct (processes actions sequentially), but the AI never emits the action sequence.

**Files**: `src/languages/spanish/prompt.ts`, `src/modes/unified.ts`

**Fix**:
1. Add explicit prompt instruction: "COMPOUND COMMAND VALIDATION: When a compound command includes a 'go' action followed by other actions, validate the LATER actions against the DESTINATION room, not the current room."
2. Add compound examples to ORDER MATTERS section.
3. In `buildPrompt()`, include NPCs/pets in adjacent rooms (similar to existing adjacent room objects):
```typescript
const adjacentNPCsDesc = state.location.exits
  .map(exit => {
    const npcsInRoom = getNPCsInLocation(exit.to);
    const petsInRoom = getPetsInLocation(exit.to, state.petLocations);
    const entities = [...npcsInRoom.map(n => n.id), ...petsInRoom.map(p => p.id)];
    if (entities.length === 0) return null;
    return `- ${exit.to}: ${entities.join(', ')}`;
  })
  .filter(Boolean)
  .join('\n');
```

**Effort**: Medium (prompt changes + one new context section in buildPrompt)

---

### CRIT-003: Closet describes clothes but no clothing objects exist

**Problem**: AI hallucinations clothing inside the closet. No actual clothing objects exist. Players waste 2-4 turns.

**Files**: `src/languages/spanish/modules/home.ts`, `src/modes/unified.ts`, `src/languages/spanish/prompt.ts`

**Fix**:
1. Add a `clothes` object to bedroom (contained in closet via `inCloset` flag, like fridge items):
```typescript
{ id: 'clothes', name: { target: 'la ropa', native: 'clothes' }, state: { inCloset: true }, actions: ['DRESS'] }
```
2. Add `inCloset` filtering logic to `buildPrompt()` (parallel to existing `inFridge` logic).
3. Add `dress` action type to `unified.ts` Action interface and applyEffects.
4. Add prompt instructions for the clothes object and dress action.
5. Add vocabulary entries for `la ropa` and `me visto`.

**Effort**: Medium (new object + filtering logic + action type + prompt instructions)

---

## HIGH Issues

### HIGH-001: Bedroom re-entry resets player to "in bed" state

**Problem**: The AI erroneously sends `position: "in_bed"` when the player enters the bedroom, even though they were standing.

**Files**: `src/languages/spanish/prompt.ts`

**Fix**: Add emphatic prompt instruction:
```
- BEDROOM RE-ENTRY: When the player walks to the bedroom, they are STILL STANDING.
  Do NOT include a position action setting "in_bed". The "in_bed" position is ONLY for
  the initial game start. Check the "Player position" field — if it says "standing",
  the player is standing.
```

**Effort**: Small (prompt text only)

---

### HIGH-002: NPC Carlos teleports/disappears between turns

**Problem**: AI generates npcResponse for Carlos when he's not in the current room. Carlos is statically defined at `living_room`.

**Files**: `src/languages/spanish/prompt.ts`, `src/modes/unified.ts`

**Fix**:
1. Add prompt rule: "NPCs can ONLY speak if they appear in the 'People here' list."
2. Server-side validation in `processTurn()`: after getting the AI response, check if the npcResponse's npcId is actually present in the final location. If not, strip the npcResponse:
```typescript
if (response.npcResponse?.npcId) {
  const finalLocation = effectsResult ? effectsResult.state.location.id : state.location.id;
  const npcsInFinalLocation = getNPCsInLocation(finalLocation);
  if (!npcsInFinalLocation.some(n => n.id === response.npcResponse!.npcId)) {
    response.npcResponse = undefined;
  }
}
```

**Effort**: Small-Medium (prompt rule + validation guard)

---

### HIGH-003: Greet roommate goal requires exact phrasing

**Problem**: "Hola Carlos, que estas haciendo?" doesn't complete the goal because the AI only triggers goalComplete on pure greetings.

**Files**: `src/languages/spanish/modules/home.ts`, `src/languages/spanish/prompt.ts`

**Fix**:
1. Update `promptInstructions` in `home.ts` to accept any greeting embedded in a longer sentence.
2. Add general prompt rule: "Goal completion should be GENEROUS. If the player's input accomplishes the spirit of the goal, complete the goal. Don't require exact phrasing."

**Effort**: Small (prompt text only)

---

### HIGH-004: Room connectivity is opaque with no routing hints

**Problem**: Failed movement gives no hint about which rooms connect or how to reach the destination.

**Files**: `src/languages/spanish/prompt.ts`, `src/modes/unified.ts`

**Fix**:
1. Add prompt instruction: "NAVIGATION FAILURE: When movement fails, list available exits AND suggest the first step toward the destination with Spanish phrasing."
2. In `buildPrompt()`, add a room connectivity map hint:
```
Room connections: bedroom <-> bathroom, bedroom <-> kitchen, bedroom <-> living_room,
bathroom <-> kitchen, bathroom <-> living_room, kitchen <-> living_room,
living_room <-> street.
```

**Effort**: Small (prompt text + one line in buildPrompt)

---

### HIGH-005: English acceptance is inconsistent

**Problem**: Some English input accepted, some rejected, with no clear pattern. Confuses beginners.

**Files**: `src/languages/spanish/prompt.ts`

**Fix**: Add explicit ENGLISH INPUT POLICY section:
- Always accept English, set grammar score to 20
- Show the Spanish translation in `spanishModel` and grammar issues
- For meta-questions ("help", "what do I do"), treat as valid and describe available actions
- Consistent policy: English works but teaches Spanish by example

**Effort**: Small (prompt text only)

---

### HIGH-006: Kitchen has no sink

**Problem**: No sink object in the kitchen. "Wash hands" rejected. Immersion-breaking.

**Files**: `src/languages/spanish/modules/home.ts`, `src/languages/spanish/prompt.ts`

**Fix**: Add `kitchen_sink` object to kitchen:
```typescript
{ id: 'kitchen_sink', name: { target: 'el fregadero', native: 'kitchen sink' }, state: {}, actions: ['USE'] }
```
Add vocabulary entry and prompt example.

**Effort**: Small (one object + one vocab entry)

---

## Summary by Fix Type

| Type | Issues |
|------|--------|
| **Prompt-only fixes** | HIGH-001, HIGH-003, HIGH-005 |
| **Prompt + engine guard** | CRIT-002, HIGH-002 |
| **Client code fix** | CRIT-001 |
| **Content addition** | CRIT-003, HIGH-006 |
| **Prompt + context enrichment** | HIGH-004 |

## Implementation Priority

1. **CRIT-001** (ChatPanel crash) — Fix first, unblocks all sessions
2. **CRIT-002** (Compound commands) — Major gameplay improvement
3. **CRIT-003** (Closet/clothes) — Blocks expected gameplay
4. **HIGH-001** (Bedroom re-entry) — Quick prompt fix, high impact
5. **HIGH-002** (Carlos teleport) — Server-side guard prevents AI hallucination
6. **HIGH-003** (Greeting goal) — Quick prompt fix, high frustration reduction
7. **HIGH-005** (English policy) — Quick prompt fix, beginner experience
8. **HIGH-004** (Navigation hints) — Moderate prompt change, good UX improvement
9. **HIGH-006** (Kitchen sink) — Simple content addition
