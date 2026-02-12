# UX Playtest: Home -- Maria (Complete Beginner)

## Session Summary
- Turns played: 22 (26 counting retries and invalid turns)
- Goals completed: 12/12
- Time spent confused: roughly 4 turns
- Overall feeling: Surprisingly smooth for a total beginner; the hints made it possible to complete everything, but some inconsistencies in English handling and a navigation bug caused brief confusion.

## Experience Arc

### Turns 1-2: Hesitant Start
Maria typed "I get up" in English and was firmly told to use Spanish. The rejection message was clear and pointed her toward the hint. She then copied "Me levanto" verbatim from the hint and it worked perfectly -- first goal completed, 5 points earned. Felt like a small win right away.

### Turns 3-4: Building Confidence via Hints
Maria tried "help" in English and was rejected again (though the game helpfully suggested the next action in the response). She copied "Apago el despertador" from the hint and got a second goal done. The copy-the-hint loop was working well -- immediate gratification for following directions.

### Turns 5-8: Testing Boundaries
Maria typed "go to bathroom" in English and the game **accepted it**, moved her to the bathroom, and completed the goal with a grammar score of 80. This was surprising given the game had rejected "I get up" and "help" earlier. The inconsistency is notable -- a beginner would be confused about when English works and when it doesn't.

She then copied the brush teeth and shower hints, getting perfect or near-perfect scores. When she tried "Me ducha" instead of "Me ducho," the game accepted it with a 70 grammar score and a clear explanation about first-person reflexive verbs. This felt forgiving and educational -- a good experience.

She also tried "Voy a cocina" (missing the article "la") and the game still worked, with feedback about needing definite articles before feminine nouns.

### Turns 9-10: Multi-Step Goal Challenge
The breakfast goal was the first multi-step one. Maria opened the fridge ("Abro la nevera") successfully. Then she typed "cook eggs" in English and the game accepted it again, completing the whole breakfast goal in one go and awarding 130 points plus a level-up. This was exciting but also confusing -- it felt like the game rewarded English too easily here. A beginner might learn that English shortcuts work for hard steps.

### Turns 11-15: Social Interactions
Moving to the living room and greeting Carlos felt natural. "Hola Carlos" was simple enough that even a beginner could feel confident. The NPC response was charming -- Carlos complained about being sleepy in Spanish with an English translation.

Maria typed "Que quieres para desayunar" without accent marks or question marks, and the game accepted it with grammar feedback about Spanish punctuation. Carlos responded with context-aware dialog about scrambled eggs. This felt like a real conversation.

Feeding the cat ("Le doy comida al gato") completed the final two goals at once. The whole module was done. The rapid goal completion at the end felt like a satisfying cascade.

### Turns 16-22: Post-Completion Exploration
With all goals done, Maria explored freely. She chatted with Carlos ("como estas"), sat on the couch, tried to respond to Carlos in Spanish with a grammar error ("me gusta las noticias" instead of "me gustan"), looked at the bookshelf, and used the toilet. The grammar corrections during free play were excellent -- each one taught a specific concept (plural agreement with gustar, accent marks).

### Turns 23-25: Navigation Confusion
Maria went to the bedroom and tried "Voy al bano" (without tilde). The game said she needed to stand up from bed first, even though she had already gotten up much earlier in the session. This was confusing -- the game seemed to have reset her to a lying-down state when she entered the bedroom. She had to type "Me levanto y voy al bano" to escape, which worked but felt like a bug.

## Goal Flow Analysis

- **Wake up and start your day**: Clear -- 2 attempts (1 English rejection) -- Satisfying
  - Hint usefulness: Perfect. "Me levanto" is simple and clearly explained.
  - Notes: Good first goal. Fast win builds confidence.

- **Turn off the alarm**: Clear -- 1 attempt -- Satisfying
  - Hint usefulness: Perfect. Direct copy-paste worked.
  - Notes: The "help" response helpfully pointed toward this goal.

- **Go to the bathroom**: Clear -- 1 attempt -- Satisfying (but confusing that English worked)
  - Hint usefulness: Helpful, but Maria used English and it still worked.
  - Notes: Inconsistency with English acceptance is the issue here.

- **Brush your teeth**: Clear -- 1 attempt -- Satisfying
  - Hint usefulness: Perfect. Long phrase but easy to copy.
  - Notes: Good vocabulary learning moment with "cepillo de dientes."

- **Take a shower**: Clear -- 1 attempt -- Satisfying
  - Hint usefulness: Perfect. Short and memorable.
  - Notes: Grammar feedback on "-o" endings for reflexive verbs was excellent.

- **Go to the kitchen**: Clear -- 1 attempt -- Satisfying
  - Hint usefulness: Perfect.
  - Notes: Maria omitted "la" and the game corrected it gracefully.

- **Make breakfast**: Somewhat Confusing -- 2 attempts (open fridge + cook) -- Satisfying
  - Hint usefulness: Helpful but the two-step nature could confuse beginners.
  - Notes: This is the hardest goal. The hint says to open the fridge "then" cook eggs, but a beginner might not realize both steps are needed. The English "cook eggs" being accepted undermines the learning. Consider breaking this into two separate goals.

- **Go to the living room**: Clear -- 1 attempt -- Satisfying
  - Hint usefulness: Perfect.
  - Notes: By this point Maria had learned the "Voy a..." pattern.

- **Greet Carlos**: Clear -- 1 attempt -- Satisfying
  - Hint usefulness: Perfect. "Hola Carlos" is universally known.
  - Notes: Carlos's response added personality. The English translation was helpful.

- **Ask Carlos about breakfast**: Clear -- 1 attempt -- Satisfying
  - Hint usefulness: Helpful. The accent marks and inverted question mark were intimidating but the game accepted the input without them.
  - Notes: Carlos's context-aware response about scrambled eggs was a highlight.

- **Feed the pets**: Clear -- 1 attempt -- Satisfying
  - Hint usefulness: Helpful. The hint gives both cat and dog options.
  - Notes: The "pet_food" object in the scene provided context. Completing this also triggered "Morning routine complete!" which felt like a bonus.

- **Morning routine complete!**: Auto-completed -- Satisfying
  - Hint usefulness: No hint needed.
  - Notes: Good cascade effect after feeding pets. Felt like a proper ending.

## Confusion Points

1. **Turn 1**: Typed "I get up" -- Expected it to work somehow, got "Please try again in Spanish!" Recovered by reading the hint. The rejection was clear and helpful.

2. **Turn 3**: Typed "help" -- Expected a help menu or guide, got rejected with a suggestion. A beginner might want a dedicated help command that works in English.

3. **Turn 5**: Typed "go to bathroom" in English -- Expected rejection (based on turns 1 and 3), got acceptance with grammar correction. The inconsistency is confusing. Sometimes English works, sometimes it does not. It appears action-oriented English ("go to bathroom", "cook eggs", "turn on tv") gets accepted while conversational English ("I get up", "help", "what do I do now") gets rejected. This distinction is not obvious to a beginner.

4. **Turn 24**: Typed "Voy al bano" in the bedroom -- Got told "You need to stand up first before you can leave the bedroom." This was confusing because Maria had already woken up 20+ turns ago. The game appears to have reset the player's posture to "in bed" when entering the bedroom. This is a UX issue: visiting your own bedroom should not put you back in bed.

5. **Turn 14**: Typed "what do I do now" -- Got rejected. This is a natural thing for a confused beginner to type. The game did provide the Spanish equivalent ("Que hago ahora?") which was educational, but a beginner at this stage would rather have guidance than a language lesson.

## Motivation Analysis

### What felt rewarding?
- Goal completion checkmarks and point awards created a satisfying feedback loop.
- Leveling up (happened twice!) felt like genuine progression.
- Grammar corrections that taught one specific thing (reflexive verb endings, plural agreement with gustar, article usage) were educational without being punishing.
- Carlos's context-aware responses made the world feel alive.
- The moment where Maria typed "Me siento en el sofa" (her own sentence, not from a hint) and it worked was the peak moment of the session.

### What felt like a chore?
- Nothing felt like a chore, actually. The pacing was good. Each goal took 1-2 turns maximum, which kept momentum.
- The only tedious moment was the bedroom re-entry issue (turns 23-25) where Maria was stuck for 2 turns.

### When did you want to keep playing?
- After each goal completion. The dopamine hit of seeing a checkmark was immediate.
- During the Carlos conversation. NPC dialog was engaging and made Maria want to chat more.
- After all goals were done, the free exploration felt open and inviting.

### When did you want to stop?
- During the bedroom navigation confusion (turns 23-25).
- Mildly during the "help"/"what do I do now" rejections -- a true beginner might rage-quit here.

### Do goals feel too rigid, or appropriately guided?
- Appropriately guided for a beginner. The linear progression (wake up -> bathroom -> kitchen -> living room) felt like a natural morning routine.
- The "suggested" goal highlighting was very helpful for knowing what to do next.
- Post-completion, there is nothing to do except free-explore. A beginner might feel lost. Consider adding "bonus" goals or a prompt to visit another module.

### Should later goals be more open-ended/abstract?
- For the HOME module specifically, the linear structure works well as a tutorial. It teaches the basic patterns: "Voy a...", "Me...", NPC interaction.
- An intermediate follow-up could have more open goals like "Make Carlos happy" or "Clean the house" that require figuring out the steps.

## Recommendations

1. **Fix English handling inconsistency**: Either always accept English with a grammar penalty (and always show the Spanish correction), or always reject it. The current behavior where some English works and some does not is confusing. Recommendation: Always accept English for actions but with a low grammar score (50 or below) and a prominent "Try it in Spanish!" prompt. This keeps beginners moving forward while incentivizing Spanish.

2. **Fix bedroom re-entry posture bug**: Entering the bedroom should not reset the player to "in bed." If the player has already completed the "wake up" goal, they should remain standing when they return to the bedroom. This caused 2 wasted turns and real confusion.

3. **Add a working /help or "ayuda" command**: Beginners need a safety net. A brief help response (in English) showing: current suggested goal, its hint, and a reminder to type in Spanish would prevent the "what do I do" confusion moments.

4. **Break the breakfast goal into two goals**: "Open the fridge" and "Cook something" as separate goals would reduce the multi-step confusion. The current hint tries to explain both steps but a beginner might only do one and wonder why the goal did not complete.

5. **Add post-completion guidance**: After "Morning routine complete!", show a message like "Great job! You can keep exploring, or try visiting el restaurante or el mercado for new challenges." Currently the goal list just shows all checkmarks with no next step, which could leave beginners feeling aimless.

6. **Add a "bonus" or "explore" goal tier**: After core goals, offer optional goals like "Watch TV with Carlos" or "Look out the window" to keep engagement without making them mandatory. These could teach vocabulary for entertainment, weather, etc.

7. **Consider accent-mark leniency messaging**: The game already accepts "bano" for "bano" and "sofa" for "sofa," which is great. But the correction messaging could be warmer: "Nice try! Just add the accent: bano -> bano" rather than a clinical grammar issue. For true beginners, accent marks are scary.

8. **Needs bars feel invisible**: Bladder was at 50 the entire session and nothing happened. Hunger stayed at 60. If needs never create urgency, beginners will ignore them. Consider having Carlos mention them ("Oye, tienes que comer algo" when hunger drops) to teach vocabulary AND create motivation.

---

## Supplementary Playtest (Maria #2 -- different approach)

A second beginner playtest was conducted with a slightly different approach: Maria started with English commands, gradually transitioned to copying Spanish hints, and explored clothing interactions more thoroughly. 33 turns played.

### Additional Issues Found

#### CRITICAL: Closet clothing items are not interactable
The closet can be opened ("Abro el armario" or "open the closet"), and when Maria looked at the clothes inside ("miro la ropa" / "look at clothes"), the game described "various shirts, pants, and dress clothing hanging inside." However, when Maria tried to take or wear any of these items:
- "put on shirt and pants" -> "There are no clothes or clothing items available in this location"
- "me pongo la camisa y los pantalones" -> "There are no clothes visible in the bedroom"
- "Me visto" -> "There are no visible clothes to put on"
- "Tomo la camisa del armario" -> "There is no shirt visible in the closet. The closet is open but appears to be empty or doesn't contain a shirt"

The AI describes clothes inside the open closet, but the game engine has no actual clothing game objects to interact with. This creates a frustrating contradiction: the game tells you clothes are there, then tells you they don't exist. For a beginner, this is especially confusing because they can't tell if they're doing something wrong in Spanish or if the game is broken. **Getting dressed should be part of the morning routine but currently cannot be completed.**

#### MEDIUM: English acceptance inconsistency (confirms other report)
Confirmed the same inconsistency the first playtest found. In this session:
- "get out of bed" -> Accepted (grammar feedback given)
- "put on slippers" -> Accepted but told no slippers exist
- "open the closet" -> Accepted
- "take a shower" -> Accepted
- "make omelette" -> Rejected ("Please speak in Spanish to practice the language!")
- "eat breakfast" -> Rejected ("Please speak in Spanish - this is a Spanish learning game!")
- "hello" -> Rejected ("Please use Spanish! Try 'hola' instead of 'hello'")

The pattern seems to be: English is accepted early in the session but rejected after several turns. This might be the AI gradually becoming stricter, but it feels arbitrary to the player. A beginner has no way to know when English will stop working.

#### LOW: Slippers mentioned in scene art but not as game objects
The bedroom scene image shows slippers on the floor, but "put on slippers" returns "There are no slippers visible in this room. You can see a bed, alarm clock, window, lamp, and closet." Scene art should match interactable objects to avoid confusion.

#### POSITIVE: /learn command is excellent for beginners
The "/learn greetings" command provided a comprehensive lesson with 6 greeting phrases, formality tips, and quick reference. This feature would be very valuable if surfaced earlier -- a beginner would benefit from being told about /learn during the intro text.

### Turn-by-Turn Log Summary (33 turns)

| Turn | Input | Language | Result | Grammar Score |
|------|-------|----------|--------|---------------|
| 1 | get out of bed | EN | Got out of bed, goal complete | Low |
| 2 | put on slippers | EN | No slippers exist | Low |
| 3 | open the closet | EN | Closet opened | Low |
| 4 | Abro el armario | ES | Already open | Perfect |
| 5 | look at clothes | EN | Described clothes in closet | Low |
| 6 | miro la ropa | ES | Described clothes again | Perfect |
| 7 | put on shirt and pants | EN | No clothes available (BUG) | Low |
| 8 | me pongo la camisa y los pantalones | ES | No clothes visible (BUG) | N/A |
| 9 | go to bathroom | EN | Moved to bathroom | Low |
| 10 | take a shower | EN | Showered, goal complete | Low |
| 11 | brush my teeth | EN | Brushed teeth, goal complete | Low |
| 12 | Voy a la cocina | ES | Moved to kitchen | Perfect |
| 13 | make coffee | EN | Made coffee | Low |
| 14 | make omelette | EN | Rejected - speak Spanish | N/A |
| 15 | Hago una tortilla | ES | Need eggs from fridge first | Perfect |
| 16 | Abro el refrigerador | ES | Opened fridge | Perfect |
| 17 | take eggs | EN | Took eggs | Low |
| 18 | Hago una tortilla | ES | Made omelette | Perfect |
| 19 | eat breakfast | EN | Rejected - speak Spanish | N/A |
| 20 | Desayuno | ES | Ate eggs | Perfect |
| 21 | Bebo el cafe | ES | Drank coffee | Perfect |
| 22 | go to living room | EN | Moved to living room | Low |
| 23 | hello | EN | Rejected - use hola | N/A |
| 24 | Hola | ES | Carlos greeted back | Perfect |
| 25 | where is the cat? | EN | Found Luna the cat | Low |
| 26 | Acaricio al gato | ES | Pet the cat, fun increased | Perfect |
| 27 | Hablo con Carlos | ES | Carlos responded | Perfect |
| 28 | watch TV | EN | Watched TV | Low |
| 29 | Voy al dormitorio | ES | Moved to bedroom | Perfect |
| 30 | Me visto | ES | No clothes available (BUG) | N/A |
| 31 | Tomo la camisa del armario | ES | No shirt in closet (BUG) | N/A |
| 32 | /learn | -- | Usage hint shown | N/A |
| 33 | /learn greetings | -- | Full greetings lesson | N/A |
