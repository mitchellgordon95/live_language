# UX Playtest: Home -- Jake (Impatient Gamer)

## Session Summary
- Turns played: 25
- Goals completed: 12/12
- Time spent confused: ~7 turns (turns 4-9 on breakfast goal, turn 11 on greeting)
- Overall feeling: The first 3 turns felt incredible -- compound commands let me blaze through goals at double speed. Then the breakfast goal became a brick wall that nearly made me quit.

## Experience Arc

### Turns 1-3: Speedrunner's Paradise
Compound commands worked beautifully. "Me levanto y voy al bano" completed 2 goals in one turn. "Me ducho y me cepillo los dientes" got 2 more. "Voy a la cocina y abro la nevera" got another. Five goals in 3 turns felt incredibly satisfying. Grammar score of 85-100 on most turns, and I leveled up. The game rewarded my impatience.

### Turns 4-9: The Breakfast Brick Wall
This is where the session fell apart. I spent **6 turns** trying to complete "Make breakfast" and could not figure out what the game wanted:
- Turn 4: "cocino los huevos y hago cafe" -- rejected because eggs are "in the fridge" (even though fridge was open)
- Turn 5: "tomo los huevos y los cocino en la estufa" -- accepted, 100 points, but goal didn't complete
- Turn 6: "como los huevos" -- rejected, says they're raw (but turn 5 said I cooked them!)
- Turn 7: "cocino los huevos en la sarten" -- accepted, but goal still didn't complete
- Turn 8: "como los huevos y bebo cafe" -- accepted, hunger went up, but goal STILL didn't complete
- Turn 9: "preparo el desayuno" -- accepted as cooking eggs again, goal still didn't complete

The state was deeply confused: eggs kept reappearing in inventory after I ate them, the AI alternated between saying they were cooked and raw, and the goal stubbornly refused to check off despite me performing every variant of the action.

### Turns 10-13: Skip Ahead and Recover
Abandoned breakfast out of frustration. Went to the living room, greeted Carlos, asked about breakfast, fed both pets in one command. This phase felt good again -- feeding both pets at once was satisfying, and it triggered "morning_complete" even though breakfast was incomplete. Points kept flowing.

### Turn 14-19: Mopping Up
Went back for the alarm (easy, one-shot with compound command). Then returned to kitchen for one final attempt at breakfast. **Turn 19 finally cracked it**: "saco los huevos de la nevera y los cocino" -- the magic incantation was mentioning "de la nevera" in the same sentence as cooking. All previous attempts that didn't explicitly reference removing eggs from the fridge in one sentence failed silently.

### Turns 20-25: Victory Lap and Exploration
Explored post-completion. Told Carlos he was boring (got a funny response). Left the house, went to the gym. Still carrying a frying pan, eggs, and pet food in my inventory on the way to the gym, which is comedic.

## Goal Flow Analysis

- **Wake up and start your day**: Clear -- 1 attempt -- Satisfying
  - Hint usefulness: Perfect
  - Notes: Combined with going to bathroom, 2 goals in 1 turn

- **Turn off the alarm**: Clear -- 1 attempt -- Fine
  - Hint usefulness: Perfect
  - Notes: Completed out of order (turn 14) with no issues. But the "suggested" flag stuck on this goal even when I was in the kitchen, which was misleading.

- **Go to the bathroom**: Clear -- 0 attempts (combined with wake up) -- Satisfying
  - Hint usefulness: N/A (never read it)
  - Notes: Compound command automatically completed this

- **Brush your teeth**: Clear -- 1 attempt -- Satisfying
  - Hint usefulness: Perfect
  - Notes: Combined with shower

- **Take a shower**: Clear -- 1 attempt -- Satisfying
  - Hint usefulness: N/A
  - Notes: Combined with teeth brushing

- **Go to the kitchen**: Clear -- 0 attempts (combined) -- Satisfying
  - Notes: Knocked out with opening the fridge

- **Make breakfast**: EXTREMELY Confusing -- 7+ attempts -- Infuriating
  - Hint usefulness: Misleading. Hint says "Abro la nevera" then "Cocino los huevos" but doing exactly that didn't work. The actual requirement was combining fridge-retrieval AND cooking in a single sentence.
  - Notes: This is the single biggest UX issue in the module. The AI accepted cooking actions, gave points, showed cooking animations, changed stove state, but never triggered the goal completion. The state tracking for eggs was broken (eggs respawned in inventory after being eaten).

- **Go to the living room**: Clear -- 1 attempt -- Fine
  - Notes: Simple movement

- **Greet Carlos**: Slightly Confusing -- 2 attempts -- Mildly Frustrating
  - Hint usefulness: Helpful
  - Notes: Said "hola carlos" as part of a compound sentence that ALSO asked about breakfast. The breakfast question completed but the greeting did not. Had to greet separately. A compound greeting+question should count for both.

- **Ask Carlos about breakfast**: Clear -- 1 attempt -- Satisfying
  - Hint usefulness: Perfect
  - Notes: NPC response was natural and fun ("Could you make me scrambled eggs?")

- **Feed the pets**: Clear -- 1 attempt -- Very Satisfying
  - Hint usefulness: Helpful (showed the pattern "le doy comida al gato")
  - Notes: Feeding both pets at once with "doy comida al gato y al perro" worked perfectly. Grammar correction about "les" was useful.

- **Morning routine complete**: Auto-completed -- Satisfying
  - Notes: Completed when feeding pets, even though make_breakfast was still incomplete. This is either a bug or a nice mercy feature.

## Confusion Points

1. **Turn 4**: Tried "cocino los huevos y hago cafe" -- Expected cooking to work since I already opened the fridge. Got told eggs are "still in the refrigerator." The fridge was open. Fridge items were visible. Why can't I cook them?

2. **Turn 5-6**: Tried "tomo los huevos y los cocino en la estufa" (worked, 100 points, showed cooking animation) then "como los huevos" (rejected -- "can't eat raw eggs"). The AI said I cooked them on turn 5 but on turn 6 decided they were raw. State inconsistency.

3. **Turn 7-8**: Cooked eggs AGAIN in the pan (accepted), then ate them (accepted, hunger increased). But breakfast goal still didn't complete. No feedback on what was missing.

4. **Turn 9**: "preparo el desayuno" was accepted as yet another round of cooking the same eggs. Still no goal completion. The game gave me 80 points for an action that accomplished nothing toward the actual goal.

5. **Turn 11**: "hola carlos que quieres para desayunar" -- greeting + breakfast question in one sentence. Only the breakfast question goal completed. Expected both to register.

6. **Turns 4-19 (overall)**: The "turn_off_alarm" goal stayed as "suggested: true" even when I was in the kitchen, living room, etc. The suggested indicator should update to reflect what's achievable in the current location.

## Motivation Analysis

- **What felt rewarding?** Compound commands completing 2 goals at once. Leveling up. Getting 95-100 grammar scores. NPC conversations feeling natural. Feeding both pets in one command.

- **What felt like a chore?** The entire breakfast sequence. Being forced to greet Carlos separately after already saying "hola" in a compound sentence. Going back to the bedroom for the alarm after already being in the living room.

- **When did I want to keep playing?** Turns 1-3 (speedrunning goals) and turns 10-13 (social interactions, pet feeding). Also turn 23 (telling Carlos he's boring -- the NPC had a funny response).

- **When did I want to stop?** Turn 8-9 when I'd cooked and eaten eggs twice and the breakfast goal still wouldn't complete. This was the closest to rage-quitting.

- **Do goals feel too rigid?** Yes, especially the breakfast goal. The state conditions for goal completion are too specific and don't match the hint text. Movement goals are appropriately flexible.

- **Should later goals be more open-ended?** The social goals (greet Carlos, ask about breakfast) were nicely open-ended. The breakfast goal should be similarly flexible -- any reasonable "I cooked food" sequence should count.

## Recommendations

1. **Fix the breakfast goal state tracking (Critical)**: The make_breakfast goal needs to complete when the player has cooked any food item, not just when a very specific sequence of AI-recognized actions occurs. Cooking eggs + eating them should definitely count. The current implementation seems to require mentioning the fridge explicitly in the cooking sentence, which is not intuitive.

2. **Compound commands should complete multiple goals**: When "hola carlos, que quieres para desayunar?" is accepted as valid, both the greeting goal AND the breakfast-question goal should complete. The AI clearly understood both actions happened.

3. **Make the "suggested" goal context-aware**: The alarm goal stayed "suggested" even in the kitchen and living room. The suggested indicator should either (a) only highlight goals achievable in the current location, or (b) change to the nearest relevant uncompleted goal.

4. **Prevent state inconsistency with food items**: Eggs should not reappear in inventory after being eaten. The AI told me eggs were raw on turn 6 after telling me I cooked them on turn 5. There needs to be persistent state for "this item has been cooked" that the AI respects.

5. **Give clearer feedback when a goal is partially done**: When I cooked eggs but the goal didn't complete, there was no indication of what was missing. A message like "You cooked the eggs! Now sit down and eat breakfast to complete this goal" would have saved 5 turns of frustration.

6. **Inventory should clear contextually**: Walking to the gym with a frying pan, raw eggs, and pet food is funny but suggests items never get cleaned up. Consider auto-dropping location-specific items when leaving a building.

7. **Add a "skip goal" or "next location" prompt after completion**: After all goals are done, there's no clear signal of what to do next. Jake figured it out by going to the street, but a prompt like "Morning complete! Go outside to explore more of the neighborhood" would help.

8. **Grammar corrections on abbreviations are overly strict**: Marking "tele" (extremely common Spanish abbreviation for television) as needing correction to "television" feels like a false correction. Native speakers say "tele" constantly.
