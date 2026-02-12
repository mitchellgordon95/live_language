# Home Module QA Synthesis

## Sources
- `home-completeness.md` -- Asset checker report
- `home-beginner.md` -- Maria (complete beginner), 2 sessions (22 + 33 turns)
- `home-impatient.md` -- Jake (impatient gamer), 1 session (30 turns)
- `home-explorer.md` -- Sofia (explorer), 2 sessions (31 + ~30 turns, 1 crash)

## Overall Assessment

The home module is **functional and engaging** -- all three personas completed goals and reported positive moments, especially around NPC/pet interactions and grammar feedback. However, compound command handling has two serious bugs (one crash, one silent failure), and a narrative-vs-engine mismatch around clothing creates confusion across all player types.

**Goals completed across testers**: Maria 12/12, Jake ~4/12, Sofia 5/12 (incidental). The linear goal chain works well for beginners but is ignored by explorers and partially blocked for impatient players.

---

## Issue Summary by Severity

### CRITICAL (3 issues) -- Crashes or blocked gameplay

| ID | Issue | Testers | Impact |
|----|-------|---------|--------|
| HOME-CRIT-001 | ChatPanel crash on compound room-change + NPC reaction | Sofia | Unrecoverable crash, session lost |
| HOME-CRIT-002 | Compound move+interact checks preconditions before executing movement | Jake, Sofia | Silent failure, ~8 wasted turns |
| HOME-CRIT-003 | Closet describes clothes but no clothing objects exist | Maria, Jake, Sofia | 2-4 wasted turns per player, goal text compounds confusion |

### HIGH (6 issues) -- >3 turns wasted or trust-breaking

| ID | Issue | Testers | Impact |
|----|-------|---------|--------|
| HOME-HIGH-001 | Bedroom re-entry resets player to "in bed" state | Maria | 2 wasted turns, player wanted to stop |
| HOME-HIGH-002 | NPC Carlos teleports between consecutive turns | Jake | 2 turns searching, breaks state trust |
| HOME-HIGH-003 | Greet roommate goal requires exact phrasing, contradicts hint | Sofia | 25 turns of unresolved confusion |
| HOME-HIGH-004 | Room connectivity opaque, no routing hints | Jake | ~4 turns of trial-and-error navigation |
| HOME-HIGH-005 | English acceptance inconsistent and unpredictable | Maria (x2) | Beginners can't predict what works |
| HOME-HIGH-006 | Kitchen has no sink | Sofia | Immersion-breaking |

### MEDIUM (6 issues) -- Minor confusion or polish

| ID | Issue | Testers | Impact |
|----|-------|---------|--------|
| HOME-MED-001 | Pets not rendered in web UI scene tray | Asset checker | Pets invisible despite being central to module |
| HOME-MED-002 | Goal says "bano caliente" but only shower exists | Sofia | Text/object mismatch |
| HOME-MED-003 | Suggested goal doesn't adapt to current room | Sofia | Persistent nagging |
| HOME-MED-004 | Fridge description mentions items that don't exist | Sofia | Narrative/content mismatch |
| HOME-MED-005 | No feedback on multi-step goal progress | Jake, Maria | Players don't know what counts |
| HOME-MED-006 | Post-completion has no guidance to next module | Maria, Jake, Sofia | All testers felt aimless |

### LOW (5 issues) -- Nice-to-have

| ID | Issue | Testers | Impact |
|----|-------|---------|--------|
| HOME-LOW-001 | Missing state portraits for TV, lamp, window, closet, shower | Asset checker | No visual state change in tray |
| HOME-LOW-002 | Juice has zero coordinates in kitchen JSON | Asset checker | Benign due to containerId system |
| HOME-LOW-003 | Generic object descriptions don't reward exploration | Sofia | Explorers feel unrewarded |
| HOME-LOW-004 | Needs bars never create urgency | Maria | System exists but has no effect |
| HOME-LOW-005 | Slippers in scene art but not interactable | Maria | Minor art/object mismatch |

---

## Cross-Tester Patterns

### 1. Compound Commands Are the #1 Pain Point
All three testers attempted compound commands. Jake relied on them heavily (his core playstyle). Two distinct failures exist: (a) a web UI crash when compound actions trigger NPC reactions during room changes, and (b) the engine checking preconditions before executing the movement portion. Fixing compound command sequencing would resolve the most frustration across all player types.

### 2. Narrative-Engine Mismatch (Closet/Clothes)
All three testers tried to interact with clothes in the closet. The AI describes clothes, the goal text implies dressing, but no clothing objects exist. This is uniquely frustrating because players can't distinguish "I'm using wrong Spanish" from "the game is broken." Either add a minimal clothing interaction or remove clothing references from both AI descriptions and goal text.

### 3. NPC/Pet Interactions Are the Highlight
Carlos, Luna, and Max were universally praised. Carlos's context-aware responses, Luna's feline indifference, and Max's enthusiasm created moments all testers wanted to extend. The home module's personality lives in its characters, not its objects.

### 4. Grammar Feedback Is Working Well
All testers received helpful, specific grammar corrections (reflexive verb endings, plural agreement, accent marks, article usage). The feedback is educational without being punishing. Even the 40-score response to intentionally bad grammar ("yo ir a la casa") was constructive.

### 5. Post-Completion Is a Dead End
All three testers noted feeling aimless after goals were done. The game provides no nudge toward other modules or optional activities. This is especially problematic for beginners who need direction.

---

## Recommended Fix Priority

**Phase 1 -- Fix Blockers (CRITICAL)**
1. HOME-CRIT-001: Add null check for `npcResponse.npcName` in ChatPanel
2. HOME-CRIT-002: Fix compound action sequencing to execute movement before checking subsequent action preconditions
3. HOME-CRIT-003: Either add clothing objects or remove all clothing references from AI prompt, goal text, and closet description

**Phase 2 -- Fix Confusion (HIGH)**
4. HOME-HIGH-001: Don't reset player position to "in bed" when re-entering bedroom after wake_up goal is complete
5. HOME-HIGH-002: Stabilize NPC location persistence between consecutive turns
6. HOME-HIGH-003: Loosen greet_roommate goal detection to accept embedded greetings
7. HOME-HIGH-004: Add connected-room info to movement failure messages
8. HOME-HIGH-005: Establish consistent English policy in AI prompt (accept with low score, or always reject)
9. HOME-HIGH-006: Add sink to kitchen objects

**Phase 3 -- Polish (MEDIUM + LOW)**
10. HOME-MED-001 through HOME-LOW-005 as capacity allows

---

## Positive Highlights

These strengths should be preserved during fixes:
- Carlos's personality and context-aware dialogue
- Pet interactions (Luna's indifference, Max's enthusiasm)
- Grammar feedback that teaches one concept per correction
- Goal completion cascade at the end of the routine
- Fridge container system working correctly
- Coffee maker portrait state changes
- Energy/hunger/hygiene responding to actions (sit on couch, drink juice, wash hands)
- The /learn command (Maria session 2 found it excellent)
- Street boundary handling ("nobody is around, try visiting...")
