# Vocabulary Label Fading System

## Concept
Objects start with full labels, then progressively fade as the player demonstrates familiarity:

```
Stage 1 (New):      "la nevera (refrigerator)"
Stage 2 (Learning): "la nevera"
Stage 3 (Known):    [no label, just visual/icon]
```

## Tracking Structure

```typescript
interface WordFamiliarity {
  wordId: string;           // e.g., "refrigerator", "milk", "open"
  spanishForm: string;      // "la nevera", "la leche", "abro"

  // Interaction tracking
  timesUsedCorrectly: number;   // Player used this word successfully
  timesSeenInContext: number;   // Word appeared in scene/response
  lastUsed: Date;

  // Computed stage
  stage: 'new' | 'learning' | 'known';
}
```

## Stage Transitions

### New → Learning (hide English)
Trigger when ANY of:
- Used correctly 3+ times
- Seen in context 5+ times
- Combination: (uses * 2) + sees >= 6

### Learning → Known (hide Spanish label)
Trigger when ALL of:
- Used correctly 5+ times total
- Used correctly 2+ times since reaching "learning"
- Last 3 uses were all correct (no hints needed)

### Regression (Known → Learning, Learning → New)
If player:
- Asks for hint on this word
- Makes grammar error involving this word
- Hasn't used it in 5+ game sessions

→ Drop back one stage

## What Counts as "Using"

**Correct use:**
- Player types the word and AI marks grammar score >= 80
- Player successfully completes action involving the object

**Seeing in context:**
- Word appears in current location's object list
- Word appears in AI's model response ("Abres la nevera")
- Word appears in goal hints

## Display Logic

```typescript
function getObjectLabel(obj: GameObject, familiarity: WordFamiliarity): string {
  switch (familiarity.stage) {
    case 'new':
      return `${obj.name.spanish} (${obj.name.english})`;
    case 'learning':
      return obj.name.spanish;
    case 'known':
      return ''; // Just show the object visually
  }
}
```

## Storage

Add to GameState:
```typescript
interface GameState {
  // ... existing fields
  vocabulary: Map<string, WordFamiliarity>;
}
```

Or keep separate for persistence across sessions:
```typescript
// Saved to localStorage/file separately from game state
interface PlayerProgress {
  odocabularyFamiliarity: Record<string, WordFamiliarity>;
  totalPlayTime: number;
  sessionsPlayed: number;
}
```

## Questions

1. **Scope**: Track individual words or whole phrases?
   - "la nevera" vs "abro la nevera"
   - Probably: track base words, recognize them in phrases

2. **Verbs**: Track infinitive or conjugated forms?
   - Probably: track the infinitive ("abrir"), count any conjugation as use

3. **Known stage display**: What shows when label is gone?
   - In terminal: maybe just a bullet point or icon
   - In visual game: the object itself with subtle highlight

4. **Session persistence**: Save progress between runs?
   - Yes, should save to .json file or similar

## Implementation Steps

1. Add `WordFamiliarity` type and initial data structure
2. Add `vocabulary` tracking to game state
3. Create functions: `recordWordUse()`, `recordWordSeen()`, `calculateStage()`
4. Update `terminal.ts` display to use familiarity stages
5. Hook into action execution to record uses
6. Hook into AI response parsing to record correct uses
7. Add persistence (save/load vocabulary progress)
