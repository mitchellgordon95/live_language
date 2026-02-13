import type { LanguageConfig } from '../types.js';
import { MANDARIN_SYSTEM_PROMPT } from './prompt.js';
import { stripArticles, findObjectByName } from './helpers.js';
import { homeModule } from './modules/home.js';

export const mandarinConfig: LanguageConfig = {
  id: 'mandarin',
  displayName: 'Mandarin Chinese',
  nativeLanguage: 'english',
  coreSystemPrompt: MANDARIN_SYSTEM_PROMPT,
  narrateSystemPrompt: MANDARIN_SYSTEM_PROMPT, // Mandarin uses single-pass for now
  ttsVoice: 'Ting-Ting',
  aiFields: {
    targetModel: 'mandarinModel',
    npcTargetField: 'mandarin',
    objectTargetName: 'mandarinName',
  },
  stripArticles,
  findObjectByName,
  helpText: 'Help text not yet written for Mandarin.',
  modules: [
    homeModule,
  ],
};
