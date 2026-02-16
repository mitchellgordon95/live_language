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
  languageSpecificInstructions: `HINDI-SPECIFIC TEACHING:

GENDER: Hindi nouns are either masculine or feminine, which affects verb conjugation and adjective agreement:
- Masculine: लड़का (ladka — boy), कमरा (kamra — room), बिस्तर (bistar — bed)
- Feminine: लड़की (ladki — girl), रसोई (rasoi — kitchen), मेज़ (mez — table)
- Adjectives change: अच्छा लड़का (achhcha ladka) vs अच्छी लड़की (achhchi ladki)
- When correcting gender errors, explain the rule simply

POSTPOSITIONS: Hindi uses postpositions (after the noun), not prepositions:
- में (mein) — in/inside: रसोई में (rasoi mein — in the kitchen)
- पर (par) — on: मेज़ पर (mez par — on the table)
- को (ko) — to (object marker): राज को (Raj ko — to Raj)
- से (se) — from/with: पानी से (paani se — with water)
- का/की/के (ka/ki/ke) — of/possessive (agrees with possessed noun's gender)

VERB CONJUGATION: Hindi verbs change based on gender, number, and tense:
- Present habitual: मैं खाता हूँ (main khaata hoon — I eat, male) / मैं खाती हूँ (main khaati hoon — I eat, female)
- Imperative (informal): खाओ (khao — eat!), जाओ (jao — go!)
- Imperative (formal): खाइए (khaiye — please eat), जाइए (jaiye — please go)
- Past: मैंने खाया (mainne khaaya — I ate, male) / मैंने खाई (mainne khaai — I ate, female for feminine object)

HONORIFICS: Hindi has three levels of "you":
- तू (tu) — very informal/intimate (avoid teaching this early)
- तुम (tum) — informal/friendly (use this for roommate/friends)
- आप (aap) — formal/respectful (use for strangers, elders)

COMMON PATTERNS TO TEACH:
- Subject + Object + Verb: मैं पानी पीता हूँ (main paani peeta hoon — I drink water)
- Location + में + Verb: रसोई में जाओ (rasoi mein jao — go to the kitchen)
- चाहना (want): मैं खाना चाहता हूँ (main khaana chaahta hoon — I want to eat)
- सकना (can): मैं जा सकता हूँ (main ja sakta hoon — I can go)

INPUT ACCEPTANCE:
- Accept Devanagari script input
- Accept romanized/transliterated Hindi (e.g., "main uthta hoon")
- Accept mixed Devanagari and English
- Show both Devanagari and romanization in all corrections and the hindiModel field`,
  npcResponseGuidance: 'simple Hindi with romanization in parentheses, appropriate for language learners (1-2 sentences)',
};

export const HINDI_PARSE_PROMPT = buildParsePrompt(hindiPromptConfig);
export const HINDI_NARRATE_PROMPT = buildNarratePrompt(hindiPromptConfig);
