# UX Playtest: Home -- Jake (Impatient Gamer)

## Session Summary
- Turns played: 30
- Goals completed: ~4 observed (Turn off alarm, Brush teeth/shower, Feed the pets, Go to bathroom)
- Time spent confused: ~8 turns (turns 1-2 blocked from acting while in bed, turns 22-24 chasing the cat between rooms, turn 20 stuck in bathroom)
- Overall feeling: Compound commands work sometimes but fail unpredictably. The game frequently blocks actions with "you need to do X first" barriers that feel arbitrary. Room connectivity is frustrating -- getting from bathroom to street requires multiple hops. NPC (Carlos) appeared and disappeared inconsistently.

## Experience Arc

### Turns 1-2: Blocked From the Start
Tried to chain "Me levanto y me visto y salgo" right away -- the game told me I need to specify where to go. Second attempt "Abro el armario y tomo la ropa y me visto" was rejected because I was still in bed. The game's response was reasonable (can't interact with objects while in bed), but the first hint says "try Me levanto" which is exactly what I started with. The compound version of it was partially rejected.

### Turn 3: Finally Standing
Had to issue a standalone "Me levanto de la cama" to get out of bed. Game accepted it and I was standing. Wasted 2 turns before this because compound commands didn't work from the bed state.

### Turn 4: The Clothing Confusion
Tried "Abro el armario y me visto rapido" -- the game says "there's no clothing system in this game - you're already dressed!" This is deeply confusing because:
- The goal list says "Wake up and get dressed"
- The wardrobe is a clickable/interactive object in the scene
- The hint suggested getting dressed as part of the morning routine

If there's no clothing system, the goal text and wardrobe interactions create false expectations.

### Turn 5: First Compound Win
"Apago el despertador y voy a la cocina" worked perfectly -- turned off alarm (Goal complete! +10 pts) AND moved to kitchen. This felt great. Compound commands shine when they chain movement with simple interactions.

### Turns 6-9: Kitchen Solo Breakfast
Carlos wasn't in the kitchen ("Your roommate Carlos is still in the bedroom"). Opened fridge, took milk, eggs, and juice. Cooked eggs on stove. Ate eggs and drank juice. All compound commands worked. Hunger bar improved. But no goal completions triggered for breakfast.

### Turn 10-11: Carlos Disappearing Act
Went to bedroom to find Carlos. He greeted me! But on the VERY NEXT TURN when I tried to respond "Hola Carlos, que necesitas", the game said "Carlos is not in the bedroom with you." He was there one turn ago and literally spoke to me. This is a clear state inconsistency bug.

### Turns 12-13: Finding Carlos Again
Searched for Carlos. Went to living room, found him there. Had a conversation. He responded naturally. Grammar corrections were helpful (accent marks on "que" and "como").

### Turns 14-15: Living Room Activities
Turned on TV, petted the cat -- both worked in one compound command. Fun and satisfying. Grammar correction on "television" -> "television" (accent).

### Turns 16-20: Room Connectivity Frustration
Tried to go to bathroom from living room: "There is no bathroom accessible from the living room." Had to go bedroom -> bathroom. Then from bathroom, tried to go to street: "There is no exit to the street from the bathroom." Tried "Voy a la sala y salgo a la calle" from bathroom -- still stuck. Had to issue separate "Voy a la cocina" command to leave bathroom.

This room connectivity model is very frustrating for an impatient player. There's no map, no indication of which rooms connect, and the error messages don't tell you the valid route -- just that you can't go directly.

### Turns 22-24: The Cat Chase
Tried to feed Luna in the kitchen: "Luna is not in the kitchen. Go to the living room." Went to living room AND tried to feed in one command: "Luna the cat is not in the living room right now." Had to go to living room in a separate turn, THEN feed. The cat's location was inconsistent between turns -- told to go to the living room but cat wasn't there when I arrived with a compound command.

### Turn 25: Finally Fed the Cat
Simple "Le doy comida a Luna" worked after arriving in the living room on a separate turn. Goal complete! But it took 4 turns to accomplish what should have been 1.

### Turns 26-30: Winding Down
Talked more with Carlos, tried to clean/tidy (no cleaning system), tried to read books (just scenery), went to the street. The post-goal experience felt empty -- no clear direction after completing available goals.

## Confusion Points

1. **Turn 1-2**: Compound commands from bed are rejected without clear feedback on what to do. The game should either accept "me levanto y [action]" as a chain, or explicitly say "you must get out of bed first with 'me levanto' before doing anything else."

2. **Turn 4**: "Wake up and get dressed" goal but no clothing system. Wardrobe opens but has no clothes to take. Extremely misleading goal + object combination.

3. **Turn 10-11**: Carlos present and speaking on turn 10, then "not in the bedroom" on turn 11. NPC teleported between turns with no explanation.

4. **Turns 16-20**: Room connectivity completely opaque. No way to know bathroom connects to bedroom/kitchen but not living room/street. Error messages say what you CAN'T do but not what you SHOULD do (no routing hint like "try going through the bedroom first").

5. **Turns 22-24**: Cat location contradicted across turns. Game said "go to living room to feed cat" but cat wasn't there when I went via compound command. Only worked when I went to the room FIRST in a separate turn, then interacted. The compound command "go to X and do Y there" seems to have a sequencing problem where it checks for Y's preconditions before executing the movement to X.

6. **Turn 27**: Tried to clean the living room -- told there are no cleaning supplies. Tried to read a book -- told to interact with bookshelf first. Interacted with bookshelf -- just got a description, no books to take. Multiple dead ends with no clear reason.

## Goal Flow Analysis

- **Wake up and start your day**: Confusing -- The goal text includes "get dressed" but there's no clothing mechanic. 3 turns to complete what should be 1.
- **Turn off the alarm**: Clear -- Completed easily in a compound command with movement. Satisfying.
- **Brush your teeth / Take a shower**: Clear -- Compound command "me lavo, me cepillo, me ducho" worked in one turn. Very satisfying.
- **Go to the kitchen**: Clear -- Auto-completed with movement.
- **Make breakfast**: Unclear completion -- Cooked and ate eggs, hunger went up, no explicit goal completion notification observed. State tracking for food items may be fragile.
- **Feed the pets**: Frustrating setup, satisfying payoff -- Took 4 turns due to cat location inconsistency. The actual feeding command worked great once preconditions were met.
- **Greet/Talk to Carlos**: Inconsistent -- Carlos's location changed unpredictably between turns. Conversation itself was natural once you found him.

## Key Issues by Severity

### CRITICAL
1. **Compound commands with movement + interaction fail silently**: "Voy a la sala y le doy comida a Luna" fails because the game checks Luna's presence BEFORE executing the movement. This makes compound move+act commands unreliable, which directly undermines the impatient player's core playstyle.

2. **NPC location inconsistency**: Carlos appeared in the bedroom on turn 10 (greeted me with dialogue) then vanished on turn 11. No movement, no explanation. Breaks trust in game state.

### HIGH
3. **"Get dressed" goal with no clothing system**: The goal text, the wardrobe object, and the hints all suggest dressing is a mechanic. It isn't. This wastes turns and creates confusion. Either add a minimal clothing interaction or reword the goal.

4. **Room connectivity is opaque**: No map, no route hints. Error messages only say "you can't go there from here" without suggesting the correct path. An impatient player will try 3-4 wrong routes before finding the right one.

5. **Cat location contradictions**: Game says "go to the living room to find the cat" but cat isn't there when you arrive. Seems like a timing/state issue with compound commands.

### MEDIUM
6. **No feedback on goal progress for multi-step goals**: After cooking and eating, no indication of whether the breakfast goal progressed or what's still needed.

7. **Post-completion emptiness**: After completing most goals, there's nothing guiding the player to the next activity. A "go outside" or "explore the neighborhood" prompt would help.

8. **Bookshelf/books are a dead end**: The object exists in the scene, the game tells you to interact with it, but there's nothing to do. Wasted turn.

### LOW
9. **Accent corrections are helpful but frequent**: Almost every turn got an accent correction (mama, rapido, tambien, que, dia, television). For an intermediate player this is useful but at high frequency it can feel nagging.

10. **Inventory doesn't clear when leaving building**: Carrying kitchen items to the street is funny but unrealistic.

## Motivation Analysis

- **What felt rewarding?** When compound commands worked (turns 5, 9, 15, 18). Getting grammar scores of 85-100. NPC conversations feeling natural. Feeding the cat successfully.

- **What felt like a chore?** Being forced to do single actions when compound ones should work. Navigating between rooms with no map. Chasing Carlos and Luna across rooms.

- **When did I want to keep playing?** Turns 5-9 (rapid breakfast cooking), turns 13-15 (Carlos + TV + cat). Momentum was high when commands worked.

- **When did I want to stop?** Turn 20 (stuck in bathroom, couldn't reach street). Turns 22-24 (cat chase across rooms). Turn 11 (Carlos vanished).

- **Do goals feel too rigid?** Yes, especially the multi-step ones where the exact sequence matters more than the intent. "Get dressed" being impossible is the worst example.

## Recommendations

1. **Fix compound move+interact sequencing**: When a player says "Voy a X y hago Y", execute the movement FIRST, update state, THEN evaluate Y. This is the #1 quality-of-life fix for impatient players.

2. **Remove or rework "get dressed" goal**: Either add a 1-action clothing interaction ("me visto" succeeds when standing near wardrobe) or change goal text to just "Wake up and start your day" without the dressing implication.

3. **Add room connectivity hints**: When movement fails, say "You can't reach the street from the bathroom. Try going to the kitchen first (voy a la cocina)." Give the player the actual route.

4. **Stabilize NPC locations**: If Carlos greets the player on turn N, he must still be there on turn N+1. NPC movement should only happen when the player leaves and returns to a room, not between consecutive turns in the same room.

5. **Stabilize pet locations**: Luna should have a fixed location, or her location should be consistent within compound commands. If the game says "go to the living room to find Luna," she MUST be there when the player arrives.

6. **Add goal progress indicators**: For multi-step goals, show partial completion ("Breakfast: opened fridge [x] cooked food [x] ate food [ ]").

7. **Add post-completion direction**: When all home goals are done, show a clear prompt: "Your morning routine is complete! Head outside to explore."

8. **Consider a simple room map**: Even a text list of "Connected rooms: bedroom, kitchen" in each location would prevent navigation frustration.
