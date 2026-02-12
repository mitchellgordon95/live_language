# UX Playtest: Home -- Sofia (Explorer)

## Session Summary
- Turns played: 31
- Goals completed: 5/12 (wake_up, go_to_living_room, go_to_kitchen, go_to_bathroom, greet_roommate -- all incidental)
- Time spent confused: roughly 2 turns (chained movement failure, greet goal not triggering)
- Overall feeling: The world is responsive and immersive; exploring feels rewarding even when ignoring goals entirely.

## Experience Arc

### Turns 1-4: Bedroom Discovery -- Curious and Delighted
Sofia woke up in the bedroom and immediately started poking around instead of following the suggested goal. Looking at the window produced a lovely descriptive response about sunrise and joggers. Opening the closet revealed clothes. Touching the lamp was reinterpreted as turning it on, with a helpful grammar note about "tocar" vs "encender." Looking under the bed returned "nothing there" -- valid=false but still felt responsive. The game handles off-script exploration gracefully from the very first moment.

### Turns 5-9: Living Room Social -- Peak Immersion
Sofia skipped straight to the living room, accidentally completing "wake up" and "go to living room" goals. Carlos the roommate is the highlight of the home module -- he responded naturally when greeted ("Hola... *bosteza* I'm very tired"), gave a charming answer about cats vs dogs (mentioning Luna and Max by name), and the cat Luna responded with perfect feline indifference ("*te mira con indiferencia y se lame la pata*"). Petting Max produced tail wagging. This stretch felt like the game was truly alive.

### Turns 10-13: Object Interactions -- Consistent but Shallow
Turning on the TV made Carlos react organically ("not too loud, I'm still sleepy"). Looking at books on the bookshelf was generic ("various novels, textbooks, and magazines"). Sitting on the couch actually restored energy (80 -> 81) and prompted Carlos to ask how you slept. Asking Carlos about his favorite movie got a real answer PLUS a natural goal nudge about the alarm. The NPC naturally weaves goal hints into conversation without breaking character.

### Turns 14-19: Kitchen Exploration -- Rich Object Density
The kitchen has 11+ objects, and opening the fridge reveals hidden items (milk, eggs, butter, juice). Using the coffee maker worked smoothly. Drinking juice "directly from the bottle" was accepted without judgment and boosted hunger from 60 to 75. Trying to put the pan on her head was gently refused. Looking for a kitchen window correctly identified it only exists in the bedroom. The kitchen feels like the most interactive room.

### Turns 20-24: Bathroom -- Functional but Quieter
The bathroom has all expected objects. Looking in the mirror was generic ("you see your reflection"). Washing hands with soap correctly increased hygiene (70 -> 75). Trying to sing in the shower without turning it on was logically refused. The bathroom feels functional but lacks the personality that NPCs and pets bring to other rooms.

### Turns 25-31: Street and Return -- World Boundaries
Attempting a chained movement ("voy a la sala y luego salgo a la calle") failed entirely -- Sofia didn't even move to the intermediate room. This was the most confusing moment. Going step by step worked fine. The street has exits to all other modules, which is exciting for an explorer. Sitting on the bench restored energy. Intentionally bad grammar ("yo ir a la casa") still allowed the action but gave a clear conjugation correction with a score of 40. Telling Max he's a good boy produced a delightful "Guau guau!" response.

## Goal Flow Analysis

Sofia was not attempting goals, but several completed incidentally:

- **Wake up and start your day**: Clear -- 1 attempt (part of chained action) -- Satisfying
  - Completed as a side effect of "me levanto y voy a la sala." Natural and frictionless.

- **Go to the living room / bathroom / kitchen**: Clear -- 1 attempt each -- Neutral
  - These are trivially completed by movement. Not really "goals" so much as breadcrumbs.

- **Say good morning to Carlos**: Confusing -- 2 attempts -- Frustrating
  - "Hola Carlos, que estas haciendo?" on turn 6 did NOT complete this goal. "Buenos dias Carlos" on turn 31 DID complete it. The hint says 'Try "Hola Carlos"' but a more natural greeting that included "Hola Carlos" as a substring did not trigger completion. This is the biggest goal-detection issue found.
  - Hint usefulness: Misleading -- the hint says "Hola Carlos" works, but it apparently requires the greeting to be the primary/sole action, not part of a larger sentence.

- **Turn off the alarm**: Not attempted
  - The "suggested" marker stayed on this goal the entire session even after Sofia left the bedroom. This feels odd -- the suggestion should perhaps adapt to the current room.

## Confusion Points

1. **Turn 6**: Tried "Hola Carlos, que estas haciendo?" -- Expected the greet_roommate goal to complete (the hint literally says "Hola Carlos"), but it did not trigger. Carlos responded as if greeted, but the goal system disagreed. Recovered by trying exact hint phrasing much later (turn 31).

2. **Turn 25**: Tried "voy a la sala y luego salgo a la calle" -- Expected to move through the living room to the street (chained actions worked for "me levanto y voy a la sala" earlier). Instead, the game rejected the entire action and Sofia stayed in the bathroom. The error message claimed "there's no exit to the street from your apartment" which is false -- the street IS an exit from the living room. Recovered by doing it in two separate turns.

3. **Turn 17**: Tried "pongo la sarten en mi cabeza" -- Expected either a funny response or a flat rejection. Got a gentle but bland refusal. Not really confusing, but a missed opportunity for humor that would delight an explorer persona.

## Motivation Analysis

- **What felt rewarding?** NPC and pet interactions were the highlight. Carlos has personality, Luna is perfectly catlike, and Max is endearing. Every interaction with them felt like discovering something new. The game also rewards exploration with points even for non-goal actions (10 points for opening a closet, petting a dog, etc.).

- **What felt like a chore?** Nothing felt like a chore because Sofia was exploring freely. However, the "turn off the alarm" goal staying suggested the entire session was mildly annoying -- it felt like the game kept nagging about something in a room she had already left.

- **When did you want to keep playing?** Whenever an NPC responded with personality. Carlos reacting to the TV being turned on, Luna ignoring you, Max wagging his tail -- these moments created a "what else can I discover?" feeling.

- **When did you want to stop?** When getting generic responses to object interactions (bookshelf: "various novels, textbooks, and magazines"; mirror: "you see your reflection"). These feel like placeholder text that doesn't reward the explorer's curiosity.

- **Do goals feel too rigid, or appropriately guided?** For an explorer, goals feel irrelevant but not intrusive. The goal sidebar is easy to ignore. However, the greet_roommate detection being too strict is a problem for any player type.

- **Should later goals be more open-ended/abstract?** Yes. "Feed the pets" is a nice open-ended goal. More goals like "Have a conversation with Carlos" (that trigger on any 3+ exchanges) or "Explore every room" would reward the explorer playstyle.

## Immersion Details

**Things that enhanced immersion:**
- Carlos mentioning pets by name when asked about cats vs dogs
- Carlos asking "how did you sleep?" when you sit on the couch
- Carlos naturally mentioning the alarm in conversation about movies
- Luna's indifference (perfect cat behavior)
- Energy restoring when sitting on the couch or bench
- Hunger improving when drinking juice
- Hygiene improving when washing hands
- Fridge revealing hidden items when opened
- Coffee maker portrait changing when turned on

**Things that broke immersion:**
- Generic object descriptions (bookshelf, mirror)
- "You look under the bed but there's nothing there" -- could at least mention dust bunnies
- The chained movement failure that contradicted earlier success
- The alarm goal staying suggested when Sofia was nowhere near the bedroom

## Recommendations

1. **Fix greet_roommate goal detection**: "Hola Carlos" embedded in a longer sentence (like "Hola Carlos, que estas haciendo?") should trigger the goal. The current behavior contradicts the hint text.

2. **Make the "suggested" goal context-aware**: If the player leaves the bedroom, stop suggesting "turn off the alarm." Suggest the next achievable goal for the current room, or show no suggestion if no goals apply.

3. **Enrich generic object descriptions**: The bookshelf could mention specific book titles (in Spanish!). The mirror could describe what the character looks like. The bed could mention if it's made or unmade. These small details hugely reward explorer behavior.

4. **Fix chained cross-room movement**: "Voy a la sala y luego salgo a la calle" should either work (since "me levanto y voy a la sala" worked) or at least execute the first action. Currently the entire command fails and the player doesn't move at all.

5. **Add more "Easter egg" responses for silly actions**: Putting a pan on your head, singing in the shower, looking under the bed -- these are exactly what explorers try. Even a brief humorous response ("You consider it briefly, then think better of it") would feel more rewarding than a flat refusal.

6. **Add explorer-friendly goals**: "Explore every room," "Talk to every pet," or "Discover 10 objects" would give explorers a sense of progress without constraining their wandering style.

7. **Consider having Carlos react to the player leaving and returning**: After Sofia left and came back from the street, Carlos didn't acknowledge her absence. A "Where did you go?" would add life.

8. **Pet interactions could be richer**: Max and Luna respond well but could have more varied reactions to repeated interactions (Luna eventually warming up, Max bringing a toy, etc.).
