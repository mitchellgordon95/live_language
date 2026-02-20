/**
 * Mandarin Chinese language prompt configuration.
 * Uses shared prompt builders with Mandarin-specific tone, measure word, and particle teaching.
 */

import type { PromptConfig } from '../types';
import { buildParsePrompt, buildNarratePrompt } from '../shared-prompts';

export const mandarinPromptConfig: PromptConfig = {
  languageName: 'Mandarin Chinese',
  inputDescription: 'Mandarin (pinyin with or without tone marks, or simplified characters)',
  targetModelField: 'mandarinModel',
  npcTargetField: 'mandarin',
  grammarIssueTypes: 'tone|measure_word|word_order|particle|vocabulary|other',
  targetModelDescription: 'Natural Mandarin way to express what they meant (characters with pinyin in parentheses)',
  mixedInputExamples: {
    question: {
      english: 'How do I open the fridge?',
      suggestion: "To open the fridge, try saying: '打开冰箱 (dakai bingxiang)'",
    },
    command: {
      english: 'go to kitchen',
      suggestion: "Try saying it in Mandarin: '去厨房 (qu chufang)'",
    },
    mixed: {
      attempt: '我 want 去 kitchen',
      correction: "Good start! Try: '我想去厨房 (wo xiang qu chufang)'",
    },
  },
  npcExample: {
    target: '谢谢你！(Xiexie ni!)',
    english: 'Thank you!',
    actionText: '室友给你倒了一杯水 (Shiyou gei ni dao le yi bei shui)',
  },
  npcActionExamples: [
    'Roommate pours water → actionText: "室友给你倒了一杯水 (Shiyou gei ni dao le yi bei shui)"',
    'Shopkeeper hands item → actionText: "店员把东西递给你 (Dianyuan ba dongxi di gei ni)"',
    'Doctor writes prescription → actionText: "医生给你开了药方 (Yisheng gei ni kai le yaofang)"',
  ],
  languageRules: 'All grammar explanations and invalidReason messages MUST be in English. Only "corrected" and "mandarinModel" fields should be in Mandarin. Always show both characters and pinyin: 打开 (dakai).',
  languageSpecificInstructions: `INPUT ACCEPTANCE:
- Accept pinyin input with or without tones
- Accept simplified Chinese characters
- Show both characters and pinyin in all corrections and the mandarinModel field`,
  npcResponseGuidance: 'simple Mandarin with pinyin in parentheses, appropriate for language learners (1-2 sentences)',
};

export const MANDARIN_PARSE_PROMPT = buildParsePrompt(mandarinPromptConfig);
export const MANDARIN_NARRATE_PROMPT = buildNarratePrompt(mandarinPromptConfig);

// Legacy export
export const MANDARIN_SYSTEM_PROMPT = MANDARIN_PARSE_PROMPT;
