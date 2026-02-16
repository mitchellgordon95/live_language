/**
 * Brazilian Portuguese language prompt configuration.
 * Uses shared prompt builders with Portuguese-specific grammar types, examples, and field names.
 */

import type { PromptConfig } from '../types';
import { buildParsePrompt, buildNarratePrompt } from '../shared-prompts';

export const portuguesePromptConfig: PromptConfig = {
  languageName: 'Brazilian Portuguese',
  inputDescription: 'Brazilian Portuguese',
  targetModelField: 'portugueseModel',
  npcTargetField: 'portuguese',
  grammarIssueTypes: 'conjugation|gender|article|contraction|word_order|other',
  targetModelDescription: 'Natural Brazilian Portuguese way to express what they meant',
  mixedInputExamples: {
    question: {
      english: 'How do I order food?',
      suggestion: "To order food, try saying: 'Quero pedir a comida, por favor'",
    },
    command: {
      english: 'I want to sit down',
      suggestion: "Try saying it in Portuguese: 'Quero me sentar'",
    },
    mixed: {
      attempt: 'Eu want ir to kitchen',
      correction: "Good start! Try: 'Quero ir para a cozinha'",
    },
  },
  npcExample: {
    target: 'Obrigado pelos ovos!',
    english: 'Thanks for the eggs!',
    actionText: 'Lucas te dá um tapinha no ombro',
  },
  npcActionExamples: [
    'Host seats player → actionText: "O anfitrião te leva a uma mesa perto da janela"',
    'Waiter brings food → actionText: "O garçom coloca os pratos na mesa"',
    'Doctor gives prescription → actionText: "O médico te entrega a receita"',
  ],
  languageRules: 'All grammar explanations and invalidReason messages MUST be in English. Only "corrected" and "portugueseModel" fields should be in Portuguese.',
  languageSpecificInstructions: `Brazilian Portuguese uses contractions extensively:
- em + o/a = no/na, em + os/as = nos/nas
- de + o/a = do/da, de + os/as = dos/das
- a + a = à (crase)
- por + o/a = pelo/pela
Accept both formal and informal register (você vs tu). Brazilian Portuguese prefers "você" in most regions.`,
  npcResponseGuidance: 'simple Brazilian Portuguese appropriate for language learners (1-2 sentences)',
};

export const PORTUGUESE_PARSE_PROMPT = buildParsePrompt(portuguesePromptConfig);
export const PORTUGUESE_NARRATE_PROMPT = buildNarratePrompt(portuguesePromptConfig);

// Legacy export — used by LanguageConfig.coreSystemPrompt
export const PORTUGUESE_SYSTEM_PROMPT = PORTUGUESE_PARSE_PROMPT;
