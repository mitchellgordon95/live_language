# Language Life Sim - UX Testing Notes

**Tester:** AI UX Tester (Claude)
**Date:** February 3, 2026
**Method:** Interactive testing via `expect` scripts simulating player behavior

---

## Executive Summary

The game has a compelling concept - learn Spanish by controlling a Sims-like character with daily activities. The vocabulary tracking and language feedback systems are excellent. However, there are critical input/output synchronization issues that severely impact playability.

---

## Critical Issues

### 1. Input Buffer Desynchronization (CRITICAL)

**Problem:** Commands queue up while the AI processes, causing responses to appear for previous commands while the user has already typed new ones.

**Observed Behavior:**
```
> apago el despertador
Thinking...me levanto          <- I typed this while waiting
Thinking...me acuesto          <- I typed this too
[DEBUG intent]: TURN_OFF...    <- This is for the first command!
```

**Impact:** The feedback loop is completely broken. Users can't tell which response goes with which command. This is the #1 issue to fix.

**Suggestion:**
- Block input while processing (show a clear "Processing..." state)
- OR queue commands visibly and process them one-by-one with clear delineation
- Consider debouncing input or showing "command received, please wait"

---

### 2. DEBUG Output Visible in Production

**Problem:** Internal debug JSON is displayed to users:
```
[DEBUG intent]: { "action": "TURN_OFF", "target": "alarm_clock"... }
[DEBUG result]: { "success": true, "message": "You turn off the alarm..."... }
```

**Impact:** Confusing for players, breaks immersion, reveals internal workings.

**Suggestion:** Add an environment flag to disable debug output (e.g., `DEBUG=false` or `NODE_ENV=production`).

---

### 3. "You said:" Feedback Mismatch

**Problem:** The "You said:" section sometimes shows Spanish sentences that don't correspond to what the user actually typed.

**Example:**
- User typed: `Quiero ir al baño porque necesito ducharme`
- Feedback showed: `You said: "Me levanto de la cama."`

**Impact:** Learners may be confused about what they actually communicated.

**Suggestion:** The "You said" should either:
- Echo back exactly what the user typed (with corrections noted separately)
- OR clearly label it as "A better way to say this:"

---

## Moderate Issues

### 4. Goal Completion Bug

**Observed:** In one test, "Turn off the alarm" was marked complete even though I left the room without actually turning it off.

**Suggestion:** Verify goal conditions are being checked correctly. Goals should only complete when their specific conditions are met.

---

### 5. Slow AI Response Time

**Problem:** The "Thinking..." phase has noticeable latency (2-5 seconds).

**Impact:** Combined with the input buffering issue, this creates confusion. On its own, it makes the game feel sluggish for simple commands.

**Suggestions:**
- Cache common command patterns for instant response
- Consider a simpler parser for obvious commands (e.g., exact matches for verbs + objects shown on screen)
- Use AI only for ambiguous or creative input

---

### 6. "Me levanto" Available After Already Standing

**Problem:** After getting out of bed, the verb "me levanto" briefly appeared as an option (before being removed on subsequent screens), but using it gave an error.

**Suggestion:** Ensure verb list updates immediately when actions become invalid.

---

## Minor Issues / Polish

### 7. Empty Input Handling

When pressing Enter with no input, nothing visible happens. Consider showing a gentle prompt like "Type a command in Spanish, or /help for assistance."

---

### 8. English Input

The game successfully interpreted "I wake up" (English) and executed the action, but gave no feedback that English was used or encouragement to use Spanish.

**Suggestion:** When English is detected, show: "I understood that! Try it in Spanish: 'me despierto'"

---

### 9. Gibberish Handling

Input like "asdfasdf" gets processed silently with no feedback.

**Suggestion:** Show "I didn't understand that. Try combining a verb with an object: 'abro la ventana'"

---

### 10. Creative Commands Not Recognized

Input like "miro el espejo" (I look at the mirror) was interpreted as WAKE_UP instead of being recognized as an unsupported action.

**Suggestion:** When the AI can't map input to a valid action, say "That's not something you can do right now" rather than executing a wrong action.

---

## What Works Well

### Vocabulary Progress System
The `/vocab` command shows excellent vocabulary tracking:
- New (○), Learning (◐), Known (●) indicators
- Progress tracking (3/5 uses)
- Words progress from learning to known through repeated use
- This is the core learning loop - well done!

### Spelling Correction
When I typed "me lebanto" (misspelled), the feedback helpfully noted:
> "levanto" is more natural - It's 'levanto' with a 'v' - from the verb 'levantarse'

This is excellent for language learners.

### Context-Aware Hints
The hint system is helpful without being intrusive:
> Hint: Try "Apago el despertador" (I turn off the alarm)

### Polite Form Tolerance
"Abro la ventana, por favor" was understood - the system handles extra words gracefully.

### Full Sentence Understanding
"Quiero ir al baño porque necesito ducharme" was parsed and the intent (go to bathroom/shower) was recognized, even though it's more complex than the suggested patterns.

### Needs Bars
The Sims-style needs (energy, hunger, hygiene, bladder) add game motivation beyond just learning. Seeing the bladder bar fill up creates urgency!

### Visual Object States
Clear indicators for object states: "la lámpara - off", "la ventana - closed", "RINGING!" for the alarm.

### Word Mastery Indicators in UI
The ◐ and ● symbols next to words/objects show vocabulary status at a glance - you can see which words you've mastered.

---

## Recommendations Summary

**Must Fix (P0):**
1. Fix input/output synchronization - this breaks the core experience
2. Hide DEBUG output in production

**Should Fix (P1):**
3. Align "You said:" feedback with actual user input
4. Verify goal completion logic
5. Improve AI response time for common commands

**Nice to Have (P2):**
6. Better handling of English input, gibberish, and unsupported commands
7. Empty input feedback
8. Immediate verb list updates when actions become invalid

---

## Test Files Created

- `ux-test.exp` - Basic gameplay flow
- `ux-test2.exp` - Edge cases and error handling
- `ux-test3.exp` - Controlled timing test
- `test.txt` through `test5.txt` - Script-based automated testing

---

## Session 2: Additional Testing (Feb 3, 2026)

### Additional Issues Found

#### 11. Inconsistent Error Messages for Location-Gated Actions

**Problem:** When attempting actions that require being in a different room, the error messages are inconsistent:
- "Me cepillo los dientes" → "You need to be in the bathroom to brush your teeth." (Good!)
- "Enciendo la cafetera" → "You don't see a coffee_maker here." (Less helpful)
- "Preparo café" → "The stove is off. Turn it on first with 'Enciendo la estufa'." (Wrong - player isn't even in kitchen!)

**Suggestion:** Prioritize location check first. If player is in bedroom trying to use kitchen items, say "You need to go to la cocina first" rather than checking stove state.

---

#### 12. "Tomo una taza de café" Not Recognized

**Problem:** "Tomo una taza de café" (I have a cup of coffee) returned "I couldn't understand what action you wanted to take" even though:
- "tomo" is listed in the verbs
- "la taza" is visible in the kitchen
- This is a very natural Spanish phrase

**Suggestion:** Improve intent recognition for common natural phrasings beyond the rigid verb + object pattern.

---

#### 13. Semantic Mismatch: "Me pongo la ropa" → Opens Closet

**Problem:** "Me pongo la ropa" (I put on clothes) was interpreted as opening the closet, not getting dressed. The action executed was different from the intent.

**Impact:** Player learns their Spanish was wrong when it was actually correct - the game just doesn't support that action yet.

**Suggestion:** If an action isn't supported, say "You can't do that right now" rather than executing a different action that happens to involve the same object.

---

#### 14. "Miro la ventana" Silent Failure

**Problem:** "Miro la ventana" (I look at the window) resulted in only "Try again, or use the hint above!" with no other feedback - not even spelling/grammar corrections.

Compare to: "Miro el espejo" which succeeded and gave feedback.

**Suggestion:** Provide consistent feedback whether the action succeeds or fails. The player wrote valid Spanish that should be acknowledged.

---

#### 15. Success Message Grammar Issue

**Minor:** "You walk to bathroom." should be "You walk to the bathroom."

---

#### 16. Needs Decay Not Obvious

**Observation:** During a full test session (10+ commands), the needs bars barely changed. For a Sims-style game, needs should decay more visibly to create urgency.

However, this might be intentional for early learning where you want players to explore freely without pressure.

---

### Confirming Previous Issues

These issues from Session 1 were confirmed in Session 2:

- **DEBUG output visible** (still showing `[DEBUG intent]:` and `[DEBUG result]:`)
- **"You said:" mismatch** - Multiple instances where feedback showed different Spanish than what was typed
- **Typo tolerance works well** - "Me levento" (wrong) was understood as "Me levanto" with helpful correction

---

### Additional Positive Observations

#### Article Correction Feedback
The game gives excellent feedback about Spanish articles:
- "Como pan" → Suggests "Como el pan" with explanation about definite articles
- "Apago despertador" → Suggests "Apago el despertador"

#### Preposition Correction
- "Voy para el baño" → Suggests "al baño" with explanation about a+el contraction

#### English Word Detection
- "apago el alarm" → Correctly identifies "alarm" as English and suggests "despertador"

#### Reflexive Verb Guidance
- "Yo levanto" → Explains reflexive verbs need "me"
- "despierto" (bare) → Suggests "me despierto" with reflexive explanation

---

### Vocabulary Tracking Observations

The `/vocab` output showed:
- Clear progression: New (31) → Learning (6) → Known (12)
- Learning words show progress (e.g., "la ventana - 4/5 uses")
- Common function words (el, la, a, de, y) marked as known

This is a solid spaced repetition foundation.

---

## Overall Impression

The core concept is excellent - combining a Sims-like life sim with language learning creates natural context for vocabulary. The vocabulary tracking and feedback systems show real pedagogical thought. Once the synchronization issues are fixed, this could be a very effective and engaging learning tool.

The biggest blocker is the input/response desynchronization. A player needs to see immediate, clear feedback for their commands to build the input-output association that language learning requires.

### Session 2 Summary

The script-based testing (using `--script` flag) provides a good way to test without the interactive input issues. Key findings:

**Strengths confirmed:**
- Grammar correction feedback is genuinely helpful for learners
- Typo tolerance is good - misspellings still work while teaching correct forms
- Vocabulary tracking creates a sense of progression
- The verb + object pattern is learnable once understood

**New concerns:**
- Intent recognition can be too rigid for natural Spanish phrasings
- Semantic mismatches (action X interpreted as action Y) could teach wrong lessons
- Error message priority should check location before object state
- Some failures give no feedback at all (silent failures)

**Recommendation:** Before adding more features, focus on:
1. Hiding debug output
2. Making error messages more consistent and helpful
3. Ensuring "action not supported" doesn't execute a different action
