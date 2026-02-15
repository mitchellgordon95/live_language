import type { WorldObject, ModuleDefinition } from '../engine/types';

export interface PromptConfig {
  languageName: string;              // "Spanish", "Mandarin Chinese"
  inputDescription: string;          // "Spanish", "Mandarin (pinyin or characters)"
  targetModelField: string;          // "spanishModel", "mandarinModel" — AI output field name
  npcTargetField: string;            // "spanish", "mandarin" — NPC response field name
  grammarIssueTypes: string;         // "conjugation|gender|article|word_order|contraction|other"
  targetModelDescription: string;    // "Natural Spanish way to express what they meant"
  mixedInputExamples: {
    question: { english: string; suggestion: string };
    command: { english: string; suggestion: string };
    mixed: { attempt: string; correction: string };
  };
  npcExample: { target: string; english: string; actionText: string };
  npcActionExamples: string[];
  languageRules: string;             // "Only 'corrected' and 'spanishModel' fields should be in Spanish"
  languageSpecificInstructions: string;
  npcResponseGuidance: string;       // "simple Spanish appropriate for language learners (1-2 sentences)"
}

export interface LanguageConfig {
  id: string;                    // 'spanish', 'mandarin'
  displayName: string;           // 'Spanish', 'Mandarin Chinese'
  nativeLanguage: string;        // 'english'
  coreSystemPrompt: string;      // Pass 1: Parse prompt (target language → mutations)
  narrateSystemPrompt: string;   // Pass 2: Narrate prompt (mutations → story)
  ttsVoice: string;              // Gemini TTS voice name (e.g. 'Aoede', 'Kore')
  promptConfig: PromptConfig;    // Language-specific prompt configuration

  // Language-specific helpers
  stripArticles: (word: string) => string[];
  findObjectByName: (objects: WorldObject[], name: string) => WorldObject | undefined;

  // Help text shown when player clicks "?" button (language-specific examples)
  helpText: string;

  // All modules for this language
  modules: ModuleDefinition[];
}
