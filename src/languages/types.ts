import type { GameObject, ModuleDefinition } from '../engine/types.js';

export interface LanguageConfig {
  id: string;                    // 'spanish', 'mandarin'
  displayName: string;           // 'Spanish', 'Mandarin Chinese'
  nativeLanguage: string;        // 'english'
  coreSystemPrompt: string;      // Full CORE_SYSTEM_PROMPT for this language
  ttsVoice: string;              // 'Paulina' for Spanish, 'Ting-Ting' for Mandarin

  // AI response field mapping (language-specific field names → generic)
  aiFields: {
    targetModel: string;         // 'spanishModel' | 'mandarinModel'
    npcTargetField: string;      // 'spanish' | 'mandarin' (in npcResponse)
    objectTargetName: string;    // 'spanishName' | 'mandarinName' (in NPCAction.object)
  };

  // Language-specific helpers
  stripArticles: (word: string) => string[];
  findObjectByName: (objects: GameObject[], name: string) => GameObject | undefined;

  // All modules for this language
  modules: ModuleDefinition[];
}
