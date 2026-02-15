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
  languageSpecificInstructions: `MANDARIN-SPECIFIC TEACHING:

TONES: Always note tone errors. The four tones change meaning:
- mā (妈 mother), má (麻 hemp), mǎ (马 horse), mà (骂 scold)
- When correcting, show pinyin with tone marks or numbers

MEASURE WORDS (量词): Correct missing or wrong measure words:
- 一个人 (yī gè rén) — general measure word 个
- 一杯水 (yī bēi shuǐ) — cup measure word 杯
- 一张床 (yī zhāng chuáng) — flat things 张
- 一把椅子 (yī bǎ yǐzi) — things with handles 把
- 一件衣服 (yī jiàn yīfu) — clothing 件

SENTENCE PARTICLES:
- 了 (le) — completed action or change of state
- 吗 (ma) — yes/no question
- 吧 (ba) — suggestion or assumption
- 呢 (ne) — follow-up question or "what about...?"

COMMON PATTERNS TO TEACH:
- Subject + Verb + Object: 我吃饭 (wǒ chī fàn — I eat)
- 在 + location: 我在厨房 (wǒ zài chúfáng — I'm in the kitchen)
- 去 + place: 我去厨房 (wǒ qù chúfáng — I go to the kitchen)
- 想 + verb: 我想吃 (wǒ xiǎng chī — I want to eat)
- 可以 + verb: 可以吗？(kěyǐ ma? — May I?)

INPUT ACCEPTANCE:
- Accept pinyin input with or without tones
- Accept simplified Chinese characters
- Show both characters and pinyin in all corrections and the mandarinModel field`,
  npcResponseGuidance: 'simple Mandarin with pinyin in parentheses, appropriate for language learners (1-2 sentences)',
};

export const MANDARIN_PARSE_PROMPT = buildParsePrompt(mandarinPromptConfig);
export const MANDARIN_NARRATE_PROMPT = buildNarratePrompt(mandarinPromptConfig);

// Legacy export
export const MANDARIN_SYSTEM_PROMPT = MANDARIN_PARSE_PROMPT;
