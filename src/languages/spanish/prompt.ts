/**
 * Spanish language prompt configuration.
 * Uses shared prompt builders with Spanish-specific grammar types, examples, and field names.
 */

import type { PromptConfig } from '../types';
import { buildParsePrompt, buildNarratePrompt } from '../shared-prompts';

export const spanishPromptConfig: PromptConfig = {
  languageName: 'Spanish',
  inputDescription: 'Spanish',
  targetModelField: 'spanishModel',
  npcTargetField: 'spanish',
  grammarIssueTypes: 'conjugation|gender|article|word_order|contraction|other',
  targetModelDescription: 'Natural Spanish way to express what they meant',
  mixedInputExamples: {
    question: {
      english: 'How do I order food?',
      suggestion: "To order food, try saying: 'Quiero pedir la comida, por favor'",
    },
    command: {
      english: 'I want to sit down',
      suggestion: "Try saying it in Spanish: 'Quiero sentarme'",
    },
    mixed: {
      attempt: 'Yo want ir a kitchen',
      correction: "Good start! Try: 'Quiero ir a la cocina'",
    },
  },
  npcExample: {
    target: '¡Gracias por los huevos!',
    english: 'Thanks for the eggs!',
    actionText: 'Carlos te da una palmada en el hombro',
  },
  npcActionExamples: [
    'Host seats player → actionText: "El anfitrión te lleva a una mesa junto a la ventana"',
    'Waiter brings food → actionText: "El mesero pone los tacos en la mesa"',
    'Doctor gives prescription → actionText: "El doctor te entrega la receta"',
  ],
  languageRules: 'All grammar explanations and invalidReason messages MUST be in English. Only "corrected" and "spanishModel" fields should be in Spanish.',
  languageSpecificInstructions: '',
  npcResponseGuidance: 'simple Spanish appropriate for language learners (1-2 sentences)',
};

export const SPANISH_PARSE_PROMPT = buildParsePrompt(spanishPromptConfig);
export const SPANISH_NARRATE_PROMPT = buildNarratePrompt(spanishPromptConfig);

// Legacy export — used by LanguageConfig.coreSystemPrompt
export const SPANISH_SYSTEM_PROMPT = SPANISH_PARSE_PROMPT;
