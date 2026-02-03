# Language Life Sim - Vision Document

**Status**: UX Design Phase
**Target Language (MVP)**: Spanish
**Primary Input**: Voice-first

## Core Concept
A life simulation game where the player controls a character by describing actions in their target language. Survival mechanics (hunger, hygiene, finances) create natural motivation to communicate.

---

## 1. Visual Perspective & World View

### Recommendation: Isometric 2.5D
- Familiar from classic life sims (The Sims, Stardew Valley)
- Shows enough context to understand the environment
- Works across platforms (mobile, desktop, web)
- Allows clear visual distinction between interactable objects/NPCs

### Screen Layout
```
┌─────────────────────────────────────────────────────┐
│  [Location: Apartment]           [Time: 8:45 AM]    │  <- Top bar
├─────────────────────────────────────────────────────┤
│                                                     │
│                                                     │
│              ┌─────────┐                            │
│              │   🛏️    │     ┌──────┐              │
│              └─────────┘     │ 🚿   │              │
│                              └──────┘              │
│                    👤                               │  <- Game world
│                   (sim)                             │
│                                                     │
│         ┌─────────┐    ┌─────────┐                 │
│         │  🍳     │    │   🚪    │                 │
│         │ kitchen │    │  door   │                 │
│         └─────────┘    └─────────┘                 │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ⚡ Energy: ████████░░   🍔 Hunger: ██████░░░░     │  <- Needs bar
│  🧼 Hygiene: █████░░░░░  💰 Money: $247            │
├─────────────────────────────────────────────────────┤
│  📋 Current Goal: "Buy groceries for breakfast"    │  <- Goal bar
└─────────────────────────────────────────────────────┘
```

---

## 2. Navigation & Movement

### How the Player Moves

**Option A: Click-to-Move (Recommended for MVP)**
- Player clicks on a location/object/door
- Sim walks there automatically
- Arriving at interactable triggers the language input

**Option B: Text-Command Movement**
- Player types "I go to the kitchen"
- Could be added later as advanced mode
- More immersive but higher friction

### Traveling Between Locations
- Click on doors/exits to see available destinations
- A simple **location menu** appears:
  ```
  ┌─────────────────────────┐
  │ Where do you want to go?│
  │                         │
  │  🏠 Home               │
  │  🛒 Grocery Store      │
  │  🏦 Bank               │
  │  🍽️ Restaurant (locked)│
  │                         │
  └─────────────────────────┘
  ```
- Locked locations unlock as modules progress
- Travel takes "game time" (simulates real-world time passing)

---

## 3. The Language Input Interface

### Core Interaction Flow
1. Player clicks on object/NPC
2. **Context panel** slides up with mic auto-listening
3. Player speaks their command in target language
4. Transcription shown for confirmation
5. Sim attempts to perform action based on input

### The Input Modal (Voice-First)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│     [Image of refrigerator]                         │
│                                                     │
│     You're at the refrigerator.                     │
│     It contains: milk, eggs, bread, cheese          │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │              🎤 Listening...                  │  │
│  │                                               │  │
│  │         ◉ ◉ ◉ ◉ ◉  (audio waveform)         │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ⌨️ Type instead    💡 Hint (3 left)               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Key UX Elements

**Context Panel** (top of modal)
- Shows what the player is interacting with
- Lists relevant objects/options in target language (optional setting)
- Provides environmental context

**Voice Input Area** (center)
- Mic auto-activates when modal opens
- Visual waveform shows it's listening
- Clear "listening" state indicator

**Confirmation Step** (after speaking)
- Always shows transcription before acting
- "That's right" / "Try again" / "Edit" buttons
- Prevents frustration from STT errors

**Hint System** (bottom)
- Limited hints per day (mode-dependent)
- Hints reveal vocabulary or sentence structure
- Progressive hints: word → phrase → full sentence

**Text Fallback**
- Always visible "⌨️ Type instead" option
- No penalty for using text
- Switches modal to text input mode

---

## 4. Response & Feedback System

### How the Sim Responds

**Success States:**
```
┌─────────────────────────────────────────────────────┐
│  ✓ Your sim takes the milk from the refrigerator.  │
│                                                     │
│  [Animation: sim grabs milk]                        │
│                                                     │
│  +5 XP  •  New word learned: leche                 │
└─────────────────────────────────────────────────────┘
```

**Partial Understanding:**
```
┌─────────────────────────────────────────────────────┐
│  🤔 Your sim understood most of that but seems     │
│     confused...                                     │
│                                                     │
│  You said: "Yo tomar leche"                        │
│  Did you mean: "Yo tomo la leche"?                 │
│                                                     │
│  [Yes, do that] [Let me try again]                 │
└─────────────────────────────────────────────────────┘
```

**Failure/Confusion:**
```
┌─────────────────────────────────────────────────────┐
│  😕 Your sim doesn't understand.                   │
│                                                     │
│  You said: "Leche dar yo"                          │
│                                                     │
│  💡 Hint: Try "Yo [verb] [object]"                 │
│                                                     │
│  [Try again] [Use hint]                            │
└─────────────────────────────────────────────────────┘
```

### Feedback Philosophy
- **Never punitive** - confusion is learning
- **Always constructive** - show what went wrong
- **Graduated assistance** - don't give away answers immediately
- **Reward attempts** - partial XP for trying

---

## 5. NPC Conversations

### Conversation Interface (Voice-First)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         👨‍💼 Grocery Store Clerk                    │
│                                                     │
│    ┌─────────────────────────────────────┐         │
│    │ "¡Hola! ¿En qué puedo ayudarle?"   │         │
│    └─────────────────────────────────────┘         │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │              🎤 Respond...                    │  │
│  │                                               │  │
│  │         ◉ ◉ ◉ ◉ ◉  (audio waveform)         │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  🔊 Hear again    ⌨️ Type    💡 Hint    📖 Vocab   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### NPC Behavior (AI-Powered)

**NPCs are fully AI-driven conversations**, not scripted dialogue trees. Each NPC has:
- A personality prompt (friendly clerk, grumpy neighbor, helpful librarian)
- Knowledge of their domain (grocery items, bank services, etc.)
- Awareness of current game state (what player needs to accomplish)
- Configurable patience level (mode-dependent)

The LLM plays the NPC role, responding naturally to whatever the player says. This means:
- Conversations feel real, not canned
- Players can ask clarifying questions
- NPCs can guide struggling players naturally
- No need to script every possible dialogue path

**NPC System Prompt Example:**
```
You are Maria, a friendly grocery store clerk in a small Spanish town.
You speak only Spanish. You are patient with language learners.
The customer (player) is trying to buy groceries.
Available items: milk ($2), bread ($1.50), eggs ($3), cheese ($4)
The player currently has $10.

Respond naturally. If they make grammar mistakes, gently model
the correct form in your response without being condescending.
Keep responses short (1-2 sentences).
```

### Conversation Goals
- Each NPC interaction has implicit goals provided in context
- "Buy bread" → LLM knows to guide toward completing transaction
- Conversation ends when goal achieved or player exits
- LLM can detect when transaction is complete

---

## 6. Needs System UX

### Visual Display
```
Needs Bar (always visible):
┌────────────────────────────────────────┐
│ ⚡ ████████░░  🍔 ██████░░░░  🧼 █████░░░░░ │
│ Energy: OK    Hunger: Low   Hygiene: Low    │
└────────────────────────────────────────┘
```

### Need States
- **Green (80-100%)**: No visual warning
- **Yellow (40-79%)**: Gentle pulse, icon dims
- **Red (0-39%)**: Urgent pulse, affects sim behavior
- **Critical (0%)**: Sim can't perform complex actions

### Consequences (Gentle, Not Punishing)
- Low hunger → sim moves slower, makes mistakes
- Low hygiene → NPCs react differently
- Low energy → sim needs sleep, limited actions
- No money → can't buy things (forces problem-solving)

---

## 7. Goal & Task System

### Goal Display
```
┌─────────────────────────────────────────┐
│ 📋 CURRENT GOAL                        │
│                                         │
│ "Make breakfast"                        │
│                                         │
│ Tasks:                                  │
│ ✓ Wake up                              │
│ ✓ Go to kitchen                        │
│ ○ Get eggs from refrigerator           │
│ ○ Cook eggs                            │
│ ○ Eat breakfast                        │
│                                         │
│ 💬 Suggested phrases:                   │
│    • "Abro la nevera"                  │
│    • "Tomo los huevos"                 │
└─────────────────────────────────────────┘
```

### Goal Progression
- Start with explicit step-by-step tasks
- Gradually become more open-ended:
  - Early: "Take milk from refrigerator"
  - Later: "Make breakfast" (player decides how)
  - Advanced: "Prepare for work" (multi-step, player plans)

---

## 8. Module System (Content Expansion)

### Module Structure
Each module contains:
- **Location(s)**: New places to visit
- **NPCs**: Characters with dialogue trees
- **Vocabulary Set**: Words/phrases to learn
- **Needs Integration**: Which needs this module addresses
- **Goals/Tasks**: Progressive challenges
- **Unlocks**: What completing this module opens

### Future Modules (Examples)
- **Grocery Store**: Shopping, money, quantities
- **Restaurant**: Ordering, preferences, complaints
- **Bank**: Accounts, transactions, appointments
- **Doctor's Office**: Body parts, symptoms, appointments
- **Airport**: Travel, documents, navigation
- **Workplace**: Professional language, meetings

---

## 9. MVP Module: "Home Basics" (Detailed)

### Overview
The player wakes up in their apartment and must complete a morning routine. No NPCs yet—this is solo practice with objects and actions. Teaches basic verbs, household objects, and simple sentence construction.

### Locations

**Bedroom**
- Objects: bed (la cama), window (la ventana), lamp (la lámpara), closet (el armario), alarm clock (el despertador)
- Actions: wake up, get up, turn on/off, open/close

**Bathroom**
- Objects: sink (el lavabo), mirror (el espejo), toilet (el inodoro), shower (la ducha), toothbrush (el cepillo de dientes), towel (la toalla), soap (el jabón)
- Actions: wash, brush teeth, shower, dry off

**Kitchen**
- Objects: refrigerator (el refrigerador/la nevera), stove (la estufa), table (la mesa), chair (la silla), cup (la taza), plate (el plato), pan (la sartén)
- Food: milk (la leche), eggs (los huevos), bread (el pan), butter (la mantequilla), coffee (el café), water (el agua), juice (el jugo)
- Actions: open, take, cook, eat, drink, put

### Vocabulary List (~60 words)

**Nouns - Rooms & Furniture**
| Spanish | English |
|---------|---------|
| la cama | bed |
| la ventana | window |
| la lámpara | lamp |
| el armario | closet |
| el despertador | alarm clock |
| el lavabo | sink |
| el espejo | mirror |
| la ducha | shower |
| el cepillo de dientes | toothbrush |
| la toalla | towel |
| el jabón | soap |
| la nevera | refrigerator |
| la estufa | stove |
| la mesa | table |
| la silla | chair |
| la taza | cup |
| el plato | plate |
| la sartén | pan |

**Nouns - Food**
| Spanish | English |
|---------|---------|
| la leche | milk |
| los huevos | eggs |
| el pan | bread |
| la mantequilla | butter |
| el café | coffee |
| el agua | water |
| el jugo | juice |

**Verbs (present tense, yo form)**
| Spanish | English |
|---------|---------|
| me despierto | I wake up |
| me levanto | I get up |
| abro | I open |
| cierro | I close |
| enciendo | I turn on |
| apago | I turn off |
| tomo | I take/drink |
| como | I eat |
| cocino | I cook |
| me lavo | I wash (myself) |
| me cepillo | I brush |
| me ducho | I shower |
| pongo | I put |
| voy | I go |

**Other**
| Spanish | English |
|---------|---------|
| a | to |
| de | of/from |
| el/la | the |
| y | and |
| con | with |

### Goal Sequence

#### Goal 1: Wake Up (Tutorial)
**Objective**: Get out of bed
**Teaches**: Basic commands, "me levanto"

```
[Screen shows: Bedroom, player in bed, alarm ringing]

System: "Your alarm is ringing. What do you do?"

Acceptable inputs:
- "Me levanto" ✓
- "Me despierto" ✓ (close enough)
- "Levanto" ✓ (acceptable, will note reflexive)
- "I get up" ✗ (wrong language, gentle redirect)

Success: Sim gets out of bed
System: "¡Muy bien! Te levantaste de la cama."
```

#### Goal 2: Turn Off the Alarm
**Objective**: Silence the alarm
**Teaches**: "apagar", object targeting

```
[Alarm still ringing]

System: "The alarm is still ringing..."

Acceptable inputs:
- "Apago el despertador" ✓
- "Apago la alarma" ✓
- "Apagar alarma" ~ (will accept, note conjugation)

Success: Alarm stops
System: "Silence. Much better."
```

#### Goal 3: Go to the Bathroom
**Objective**: Navigate to bathroom
**Teaches**: "voy a", room names

```
System: "You need to get ready. Where do you go?"

Acceptable inputs:
- "Voy al baño" ✓
- "Voy a el baño" ~ (accept, note contraction al)
- "Baño" ~ (accept for now, model full sentence in response)

Success: Sim walks to bathroom
System: "You're now in the bathroom."
```

#### Goal 4: Brush Your Teeth
**Objective**: Complete tooth brushing
**Teaches**: Reflexive verbs, "me cepillo los dientes"

```
[Bathroom view, sink, toothbrush visible]

System: "Time for hygiene. What do you do?"

Acceptable inputs:
- "Me cepillo los dientes" ✓
- "Cepillo los dientes" ~ (missing reflexive)
- "Me cepillo" ~ (missing object, will clarify)

Success: Tooth brushing animation
System: "¡Dientes limpios!" (Clean teeth!)
Hygiene bar increases
```

#### Goal 5: Take a Shower
**Objective**: Shower
**Teaches**: "me ducho", more reflexive practice

```
System: "You should probably shower too."

Acceptable inputs:
- "Me ducho" ✓
- "Tomo una ducha" ✓ (alternate phrasing)

Success: Shower animation
Hygiene bar fills
System: "Fresh and clean!"
```

#### Goal 6: Go to the Kitchen
**Objective**: Navigate to kitchen
**Teaches**: "la cocina"

```
System: "Your stomach is growling. Time for breakfast."

Acceptable inputs:
- "Voy a la cocina" ✓

Success: Sim walks to kitchen
```

#### Goal 7: Make Coffee (Optional)
**Objective**: Prepare coffee
**Teaches**: Multi-step actions, appliance use

```
[Kitchen view, coffee maker, cups visible]

System: "A coffee would be nice."

This requires a sequence:
1. "Tomo una taza" (take a cup)
2. "Enciendo la cafetera" (turn on coffee maker)
3. "Pongo el café en la taza" (pour coffee in cup)
4. "Bebo el café" (drink the coffee)

Or player might say:
- "Hago café" (I make coffee) - acceptable shorthand, sim does full sequence

Energy bar increases
```

#### Goal 8: Make Breakfast
**Objective**: Prepare and eat eggs
**Teaches**: Cooking verbs, ingredients

```
System: "You're hungry. How about some eggs?"

Possible sequence:
1. "Abro la nevera" (open refrigerator)
2. "Tomo los huevos" (take the eggs)
3. "Cierro la nevera" (close refrigerator)
4. "Enciendo la estufa" (turn on stove)
5. "Cocino los huevos" (cook the eggs)
6. "Como los huevos" (eat the eggs)

Shorthand accepted:
- "Hago huevos" → sim does cooking sequence
- "Cocino y como huevos" → sequence plays

Hunger bar fills
System: "¡Delicioso! A good breakfast."
```

#### Goal 9: Complete Morning Routine (Challenge)
**Objective**: Do everything in order efficiently
**Teaches**: Planning, combining sentences

```
System: "Complete your entire morning routine."

No step-by-step guidance. Player must:
- Get up
- Bathroom tasks
- Get dressed (from closet)
- Eat breakfast

Bonus for:
- Doing things in logical order
- Using compound sentences ("Me levanto y voy al baño")
- Completing under a time limit (optional)
```

### Grammar Focus for This Module

**Present Tense (Yo Form)**
- Regular -ar: levanto, cocino, tomo
- Regular -er: como, bebo
- Regular -ir: abro
- Irregular: voy, pongo, enciendo

**Reflexive Verbs**
- me levanto, me lavo, me cepillo, me ducho
- Pattern: me + verb

**Articles & Gender**
- el/la with nouns
- Contractions: a + el = al, de + el = del

**Simple Sentence Structure**
- Verb + Object: "Abro la nevera"
- Subject + Verb + Object: "Yo tomo la leche"
- Reflexive: "Me cepillo los dientes"

### Needs Mechanics in This Module

| Need | Drain Rate | Restored By |
|------|-----------|-------------|
| Energy | -5/hour | Sleep (full), Coffee (+20) |
| Hunger | -10/hour | Eating (+30-50 depending on food) |
| Hygiene | -3/hour | Shower (+50), Brush teeth (+10), Wash hands (+5) |

### Unlocks After Completion
- **Grocery Store module**: Player runs out of food, must go shopping
- New vocabulary: numbers, money, quantities
- First NPC interactions

---

## 10. Learning Integration (Non-Intrusive)

### Passive Learning Elements
- **Word highlighting**: New words glow briefly
- **Vocab journal**: Auto-collected words (accessible anytime)
- **Pattern recognition**: "You've used 'Yo tomo...' 5 times!"

### Active Learning (Optional)
- **Review mode**: Quick vocab quiz before bed (in-game)
- **Phrase book**: Player can browse learned phrases
- **Pronunciation practice**: Replay NPC audio, record yourself

### Progress Tracking
```
┌─────────────────────────────────────────┐
│ 📊 YOUR PROGRESS                       │
│                                         │
│ Words Learned: 47                       │
│ Phrases Used: 23                        │
│ Conversations: 12                       │
│ Goals Completed: 8                      │
│                                         │
│ Current Level: Beginner II              │
│ ████████░░░░░░░░░░░░ 40%               │
└─────────────────────────────────────────┘
```

---

## 11. Game Mode Selection (Start of Game)

### Mode Choice Screen
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         🌍 Choose Your Experience                  │
│                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │                     │  │                     │  │
│  │    🌱 Explorer      │  │    🎯 Immersive     │  │
│  │                     │  │                     │  │
│  │  • Generous hints   │  │  • Hints cost more  │  │
│  │  • NPCs very patient│  │  • NPCs realistic   │  │
│  │  • Needs drain slow │  │  • Needs drain      │  │
│  │  • No fail states   │  │    normally         │  │
│  │                     │  │  • Day resets on    │  │
│  │  Best for: first    │  │    critical failure │  │
│  │  time learners      │  │                     │  │
│  │                     │  │  Best for: challenge│  │
│  │                     │  │  seekers            │  │
│  └─────────────────────┘  └─────────────────────┘  │
│                                                     │
│          (You can change this anytime)             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Mode Differences Summary
| Aspect | Explorer | Immersive |
|--------|----------|-----------|
| Hints per day | Unlimited | 5 |
| NPC patience | Very high | Moderate |
| Need drain rate | 50% | 100% |
| Critical failure | Sim sluggish, nudged | Day resets |
| Word translations | Tap to reveal | Must use hint |

---

## 12. Voice-First Input Design

### Primary Input Method: Voice
Voice is the default and encouraged method. Text is always available as fallback.

### Voice Input Flow
```
1. Player clicks object/NPC
2. Context panel appears
3. Microphone auto-activates (with visual indicator)
4. Player speaks command/response
5. Speech-to-text processes
6. Transcription shown for confirmation
7. Sim acts on understood input
```

### Voice Input Interface
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│     [Image of refrigerator]                         │
│     You're at the refrigerator.                     │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │              🎤 Listening...                  │  │
│  │                                               │  │
│  │         ◉ ◉ ◉ ◉ ◉  (audio waveform)         │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ⌨️ Type instead    💡 Hint    🔇 Mute           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### After Speaking
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│     You said:                                       │
│     ┌─────────────────────────────────────────┐    │
│     │ "Yo tomo la leche"                      │    │
│     └─────────────────────────────────────────┘    │
│                                                     │
│     [✓ That's right]  [🎤 Try again]  [✏️ Edit]   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Voice UX Considerations
- **Always show transcription** before acting (catch STT errors)
- **Allow quick retry** without penalty
- **Edit fallback** for STT mistakes (not player mistakes)
- **Pronunciation feedback** (optional): "Good! Your 'ch' sound is improving"
- **Background noise handling**: Pause prompt if audio unclear

### Text Fallback
- Always visible "⌨️ Type instead" option
- No judgment/penalty for using text
- Useful for: noisy environments, accessibility, preference

---

## 13. Settings & Accessibility

### Accessibility
- Text size options
- High contrast mode
- Screen reader support for menus
- Voice input with visual feedback
- Subtitles for all NPC audio (always on)
- Adjustable speaking speed for NPC audio

---

## 14. Language Understanding System (AI-Powered)

This is the core "brain" of the game - how we interpret what the player says/types and decide if it's correct, close, or wrong.

**Key Design Decision: This entire system is powered by AI (LLM).** We don't build a rule-based parser. Instead, we prompt an LLM with context and ask it to interpret player input. This gives us:
- Natural handling of variations, slang, typos
- Easy multi-language support (change the system prompt)
- Nuanced grammar feedback that sounds human
- Flexible intent recognition without rigid patterns

### The Challenge
Players won't produce perfect textbook sentences. They'll say:
- "Yo tomo leche" (correct)
- "Tomo la leche" (correct, different)
- "Tomo leche" (acceptable, less formal)
- "Yo tomar leche" (wrong conjugation but understandable)
- "Leche tomo yo" (weird word order but technically understandable)

### Understanding Levels

| Level | Description | Game Response |
|-------|-------------|---------------|
| **Perfect** | Grammatically correct, natural | Sim acts, +full XP, optional praise |
| **Acceptable** | Minor issues, native would understand | Sim acts, +XP, gentle note |
| **Understandable** | Errors but intent clear | Sim hesitates, shows correction, asks confirm |
| **Confused** | Can't determine intent | Sim confused, offers hints |
| **Gibberish** | No meaningful parse | "I don't understand", encourage retry |

### AI-Powered Architecture

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  PLAYER INPUT: "yo tomo la leche del refrigerador" │
│                                                     │
└───────────────────────┬─────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│  LLM UNDERSTANDING ENGINE                          │
│                                                     │
│  System prompt includes:                            │
│  • Current game context (location, objects)        │
│  • Available actions in this context               │
│  • Target language (Spanish)                       │
│  • Player's current level/known vocab              │
│                                                     │
│  LLM returns structured JSON:                      │
│  {                                                  │
│    "understood": true,                             │
│    "intent": { "action": "TAKE", "object": "MILK" }│
│    "grammar_score": 95,                            │
│    "grammar_issues": [],                           │
│    "natural_response": "Tomas la leche del..."     │
│    "correction": null                              │
│  }                                                  │
└───────────────────────┬─────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│  GAME ENGINE                                        │
│                                                     │
│  Executes intent, shows feedback, updates state    │
└─────────────────────────────────────────────────────┘
```

### Why AI Over Rules

| Approach | Pros | Cons |
|----------|------|------|
| Rule-based parser | Fast, predictable, offline | Rigid, breaks on variations, massive effort per language |
| **AI-powered** | Flexible, handles anything, easy to add languages | Needs API calls, latency, cost |

For a language learning game, flexibility is critical. A rule-based system would reject valid sentences it doesn't recognize. An LLM understands intent even through mistakes—which is exactly what a patient native speaker would do.

### Spanish-Specific Considerations (MVP)

**Verb Conjugation**
- Present tense focus for MVP (yo/tú/él forms)
- Common irregular verbs: ir, ser, estar, tener, querer
- Accept infinitive with gentle correction

**Gender Agreement**
- Nouns have gender: el/la, un/una
- Adjective agreement: agua fría, pan fresco
- Start forgiving, increase strictness with progress

**Pronouns**
- Often dropped in Spanish ("Tomo leche" = "Yo tomo leche")
- Both should be accepted equally

**Regional Variations**
- Accept both "tú" and "usted" forms
- Accept common Latin American vs Spain differences
- Don't penalize for accent marks initially (cafe = café)

### Grammar Feedback UX

When grammar is wrong but intent is understood:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ✓ Your sim takes the milk.                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 📝 Small note:                              │   │
│  │                                              │   │
│  │ You said: "Yo tomar la leche"               │   │
│  │ Better:   "Yo tomo la leche"                │   │
│  │           ────                               │   │
│  │ "Tomar" is infinitive. With "yo", use       │   │
│  │ "tomo" (present tense, first person)        │   │
│  │                                              │   │
│  │              [Got it]  [Tell me more]       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Scope for Each Module

Each module defines:
- **Required vocabulary** (nouns, verbs, adjectives)
- **Grammar patterns** to introduce/reinforce
- **Acceptable simplifications** for beginners

Example for "Home Basics" module:
```
Grammar Focus:
├── Present tense (yo form only initially)
├── Basic articles (el, la, un, una)
├── Simple commands (abre, cierra, toma)
└── Basic prepositions (en, de, del)

Accept without penalty:
├── Missing articles ("tomo leche" ok)
├── Missing accent marks ("cafe" = "café")
└── Dropped pronouns (always ok in Spanish)

Gently correct:
├── Wrong conjugation (tomar → tomo)
├── Wrong gender (el leche → la leche)
└── Word order oddities
```

---

## 15. Decisions Made

| Decision | Choice |
|----------|--------|
| Target language (MVP) | Spanish |
| Primary input | Voice (text fallback) |
| Visual perspective | Isometric 2.5D |
| Game modes | Explorer (forgiving) + Immersive (challenging) |
| Failure handling | Mode-dependent (soft limits vs day reset) |
| Language understanding | AI-powered (LLM), not rule-based |
| NPC conversations | AI-powered (LLM), not scripted |
