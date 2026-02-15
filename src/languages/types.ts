import type { WorldObject, ModuleDefinition } from '../engine/types';

export interface LanguageConfig {
  id: string;                    // 'spanish', 'mandarin'
  displayName: string;           // 'Spanish', 'Mandarin Chinese'
  nativeLanguage: string;        // 'english'
  coreSystemPrompt: string;      // Pass 1: Parse prompt (Spanish → mutations)
  narrateSystemPrompt: string;   // Pass 2: Narrate prompt (mutations → story)
  ttsVoice: string;              // 'Paulina' for Spanish, 'Ting-Ting' for Mandarin

  // AI response field mapping (language-specific field names → generic)
  aiFields: {
    targetModel: string;         // 'spanishModel' | 'mandarinModel'
    npcTargetField: string;      // 'spanish' | 'mandarin' (in npcResponse)
    objectTargetName: string;    // 'spanishName' | 'mandarinName' (in NPCAction.object)
  };

  // Language-specific helpers
  stripArticles: (word: string) => string[];
  findObjectByName: (objects: WorldObject[], name: string) => WorldObject | undefined;

  // Help text shown when player clicks "?" button (language-specific examples)
  helpText: string;

  // All modules for this language
  modules: ModuleDefinition[];
}
