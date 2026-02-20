/**
 * Hindi language prompt configuration.
 * Uses shared prompt builders with Hindi-specific gender, postposition, and conjugation teaching.
 */

import type { PromptConfig } from '../types';
import { buildParsePrompt, buildNarratePrompt } from '../shared-prompts';

export const hindiPromptConfig: PromptConfig = {
  languageName: 'Hindi',
  inputDescription: 'Hindi (Devanagari script or romanized transliteration)',
  targetModelField: 'hindiModel',
  npcTargetField: 'hindi',
  grammarIssueTypes: 'gender|postposition|verb_conjugation|tense|agreement|word_order|other',
  targetModelDescription: 'Natural Hindi way to express what they meant (Devanagari with romanization in parentheses)',
  mixedInputExamples: {
    question: {
      english: 'How do I open the fridge?',
      suggestion: "To open the fridge, try saying: 'फ्रिज खोलो (fridge kholo)'",
    },
    command: {
      english: 'go to kitchen',
      suggestion: "Try saying it in Hindi: 'रसोई में जाओ (rasoi mein jao)'",
    },
    mixed: {
      attempt: 'मैं want जाना kitchen',
      correction: "Good start! Try: 'मैं रसोई में जाना चाहता हूँ (main rasoi mein jaana chaahta hoon)'",
    },
  },
  npcExample: {
    target: 'धन्यवाद! (Dhanyavaad!)',
    english: 'Thank you!',
    actionText: 'रूममेट ने तुम्हें एक गिलास पानी दिया (Roommate ne tumhein ek gilaas paani diya)',
  },
  npcActionExamples: [
    'Roommate pours water → actionText: "रूममेट ने तुम्हें पानी दिया (Roommate ne tumhein paani diya)"',
    'Shopkeeper hands item → actionText: "दुकानदार ने सामान दिया (Dukaandaar ne saamaan diya)"',
    'Doctor writes prescription → actionText: "डॉक्टर ने दवाई लिखी (Doctor ne davaai likhi)"',
  ],
  languageRules: 'All grammar explanations and invalidReason messages MUST be in English. Only "corrected" and "hindiModel" fields should be in Hindi. Always show both Devanagari and romanization: खोलो (kholo).',
  languageSpecificInstructions: `INPUT ACCEPTANCE:
- Accept Devanagari script input
- Accept romanized/transliterated Hindi (e.g., "main uthta hoon")
- Accept mixed Devanagari and English
- Show both Devanagari and romanization in all corrections and the hindiModel field`,
  npcResponseGuidance: 'simple Hindi with romanization in parentheses, appropriate for language learners (1-2 sentences)',
};

export const HINDI_PARSE_PROMPT = buildParsePrompt(hindiPromptConfig);
export const HINDI_NARRATE_PROMPT = buildNarratePrompt(hindiPromptConfig);
