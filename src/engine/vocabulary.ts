import type {
  WordFamiliarity,
  VocabularyProgress,
  FamiliarityStage,
  WorldObject,
} from './types';
import { allVocabulary } from '../data/module-registry';

// Stage transition thresholds
const THRESHOLDS = {
  // New → Learning
  usesToLearn: 3,
  seesToLearn: 5,
  combinedToLearn: 6, // (uses * 2) + sees >= 6

  // Learning → Known
  totalUsesToKnow: 5,
  usesSinceLearningToKnow: 2,
  consecutiveCorrectToKnow: 3,
};

export function createInitialVocabulary(): VocabularyProgress {
  const words: Record<string, WordFamiliarity> = {};

  // Initialize from all registered vocabulary
  for (const word of allVocabulary) {
    const wordId = word.native.toLowerCase().replace(/[^a-z0-9]/g, '_');
    words[wordId] = {
      wordId,
      targetForms: [word.target, word.target.replace(/^(el|la|los|las)\s+/, '')],
      nativeForm: word.native,
      timesUsedCorrectly: 0,
      timesSeenInContext: 0,
      usesSinceLearning: 0,
      consecutiveCorrect: 0,
      lastUsed: 0,
      stage: 'new',
    };
  }

  return {
    words,
    sessionCount: 1,
    lastSessionDate: Date.now(),
  };
}

export function calculateStage(word: WordFamiliarity): FamiliarityStage {
  const { timesUsedCorrectly, timesSeenInContext, usesSinceLearning, consecutiveCorrect } = word;

  // Check for Known stage
  if (
    word.stage === 'learning' &&
    timesUsedCorrectly >= THRESHOLDS.totalUsesToKnow &&
    usesSinceLearning >= THRESHOLDS.usesSinceLearningToKnow &&
    consecutiveCorrect >= THRESHOLDS.consecutiveCorrectToKnow
  ) {
    return 'known';
  }

  // Check for Learning stage
  if (
    word.stage === 'new' &&
    (timesUsedCorrectly >= THRESHOLDS.usesToLearn ||
      timesSeenInContext >= THRESHOLDS.seesToLearn ||
      timesUsedCorrectly * 2 + timesSeenInContext >= THRESHOLDS.combinedToLearn)
  ) {
    return 'learning';
  }

  return word.stage;
}

export function recordWordUse(
  vocab: VocabularyProgress,
  wordId: string,
  correct: boolean
): VocabularyProgress {
  const word = vocab.words[wordId];
  if (!word) return vocab;

  const updatedWord: WordFamiliarity = {
    ...word,
    lastUsed: Date.now(),
  };

  if (correct) {
    updatedWord.timesUsedCorrectly = word.timesUsedCorrectly + 1;
    updatedWord.consecutiveCorrect = word.consecutiveCorrect + 1;
    if (word.stage === 'learning') {
      updatedWord.usesSinceLearning = word.usesSinceLearning + 1;
    }
  } else {
    // Reset consecutive streak on error
    updatedWord.consecutiveCorrect = 0;
  }

  // Recalculate stage
  const newStage = calculateStage(updatedWord);
  if (newStage !== updatedWord.stage) {
    updatedWord.stage = newStage;
    // Reset usesSinceLearning when advancing to learning
    if (newStage === 'learning') {
      updatedWord.usesSinceLearning = 0;
    }
  }

  return {
    ...vocab,
    words: {
      ...vocab.words,
      [wordId]: updatedWord,
    },
  };
}

export function recordWordSeen(
  vocab: VocabularyProgress,
  wordId: string
): VocabularyProgress {
  const word = vocab.words[wordId];
  if (!word) return vocab;

  const updatedWord: WordFamiliarity = {
    ...word,
    timesSeenInContext: word.timesSeenInContext + 1,
  };

  // Recalculate stage
  const newStage = calculateStage(updatedWord);
  if (newStage !== updatedWord.stage) {
    updatedWord.stage = newStage;
    if (newStage === 'learning') {
      updatedWord.usesSinceLearning = 0;
    }
  }

  return {
    ...vocab,
    words: {
      ...vocab.words,
      [wordId]: updatedWord,
    },
  };
}

export function recordHintUsed(
  vocab: VocabularyProgress,
  wordId: string
): VocabularyProgress {
  const word = vocab.words[wordId];
  if (!word) return vocab;

  // Using a hint resets consecutive streak and can cause regression
  const updatedWord: WordFamiliarity = {
    ...word,
    consecutiveCorrect: 0,
  };

  // Regress from known to learning
  if (word.stage === 'known') {
    updatedWord.stage = 'learning';
    updatedWord.usesSinceLearning = 0;
  }

  return {
    ...vocab,
    words: {
      ...vocab.words,
      [wordId]: updatedWord,
    },
  };
}

export function getWordIdFromObject(obj: WorldObject): string {
  return obj.name.native.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

export function getWordIdFromTarget(
  targetText: string,
  vocab: VocabularyProgress
): string | null {
  const normalized = targetText.toLowerCase().trim();

  for (const [wordId, word] of Object.entries(vocab.words)) {
    for (const form of word.targetForms) {
      if (form.toLowerCase() === normalized || normalized.includes(form.toLowerCase())) {
        return wordId;
      }
    }
  }

  return null;
}

export function getObjectLabel(
  obj: WorldObject,
  vocab: VocabularyProgress
): string {
  const wordId = getWordIdFromObject(obj);
  const word = vocab.words[wordId];

  if (!word || word.stage === 'new') {
    return `${obj.name.target} (${obj.name.native})`;
  } else if (word.stage === 'learning') {
    return obj.name.target;
  } else {
    return obj.name.target;
  }
}

export function getFamiliaritySummary(vocab: VocabularyProgress): {
  new: number;
  learning: number;
  known: number;
} {
  let newCount = 0;
  let learning = 0;
  let known = 0;

  for (const word of Object.values(vocab.words)) {
    switch (word.stage) {
      case 'new':
        newCount++;
        break;
      case 'learning':
        learning++;
        break;
      case 'known':
        known++;
        break;
    }
  }

  return { new: newCount, learning, known };
}

// Extract word IDs from player input and AI response
export function extractWordsFromText(
  text: string,
  vocab: VocabularyProgress
): string[] {
  const foundWords: string[] = [];
  const normalized = text.toLowerCase();

  for (const [wordId, word] of Object.entries(vocab.words)) {
    for (const form of word.targetForms) {
      if (normalized.includes(form.toLowerCase())) {
        if (!foundWords.includes(wordId)) {
          foundWords.push(wordId);
        }
        break;
      }
    }
  }

  return foundWords;
}
