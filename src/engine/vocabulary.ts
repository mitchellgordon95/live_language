import type {
  WordFamiliarity,
  VocabularyProgress,
  FamiliarityStage,
  WorldObject,
} from './types';
import { getAllVocabulary } from '../data/module-registry';

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
  for (const word of getAllVocabulary()) {
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
      srsInterval: 0,
      srsEase: 2.5,
      srsNextReview: 0,
      srsDueCount: 0,
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
    // Advance SRS schedule (in-game use counts as a "Good" review)
    const srs = advanceSrs(updatedWord, 3);
    updatedWord.srsInterval = srs.srsInterval;
    updatedWord.srsEase = srs.srsEase;
    updatedWord.srsNextReview = srs.srsNextReview;
    updatedWord.srsDueCount = (updatedWord.srsDueCount || 0) + 1;
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

// --- Spaced Repetition (SM-2) ---

const DAY_MS = 86400000;

function advanceSrs(word: WordFamiliarity, quality: number): { srsInterval: number; srsEase: number; srsNextReview: number } {
  let interval = word.srsInterval || 0;
  let ease = word.srsEase || 2.5;

  if (quality <= 1) {
    // Again: reset to 1 day
    interval = 1;
    ease = Math.max(1.3, ease - 0.2);
  } else if (quality === 2) {
    // Hard
    interval = Math.max(1, Math.round((interval || 1) * 1.2));
    ease = Math.max(1.3, ease - 0.15);
  } else if (quality === 3) {
    // Good
    interval = interval === 0 ? 1 : Math.round(interval * ease);
  } else {
    // Easy (quality >= 4)
    interval = interval === 0 ? 4 : Math.round(interval * ease * 1.3);
    ease = ease + 0.15;
  }

  return {
    srsInterval: interval,
    srsEase: ease,
    srsNextReview: Date.now() + interval * DAY_MS,
  };
}

export function getDueWords(vocab: VocabularyProgress): WordFamiliarity[] {
  const now = Date.now();
  return Object.values(vocab.words)
    .filter(w => {
      // Skip words never encountered in-game
      if (w.timesUsedCorrectly === 0 && w.timesSeenInContext === 0) return false;
      // Due if never reviewed or past due date
      return w.srsNextReview === 0 || !w.srsNextReview || w.srsNextReview <= now;
    })
    .sort((a, b) => (a.srsNextReview || 0) - (b.srsNextReview || 0));
}

export function reviewWord(
  vocab: VocabularyProgress,
  wordId: string,
  quality: number
): VocabularyProgress {
  const word = vocab.words[wordId];
  if (!word) return vocab;

  const srs = advanceSrs(word, quality);
  const updatedWord: WordFamiliarity = {
    ...word,
    lastUsed: Date.now(),
    srsInterval: srs.srsInterval,
    srsEase: srs.srsEase,
    srsNextReview: srs.srsNextReview,
    srsDueCount: (word.srsDueCount || 0) + 1,
  };

  return {
    ...vocab,
    words: {
      ...vocab.words,
      [wordId]: updatedWord,
    },
  };
}
