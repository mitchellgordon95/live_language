import type { LanguageConfig } from '../types';
import { MANDARIN_PARSE_PROMPT, MANDARIN_NARRATE_PROMPT, mandarinPromptConfig } from './prompt';
import { stripArticles, findObjectByName } from './helpers';
import { homeModule } from './modules/home';

export const mandarinConfig: LanguageConfig = {
  id: 'mandarin',
  displayName: 'Mandarin Chinese',
  nativeLanguage: 'english',
  coreSystemPrompt: MANDARIN_PARSE_PROMPT,
  narrateSystemPrompt: MANDARIN_NARRATE_PROMPT,
  ttsVoice: 'Ting-Ting',
  promptConfig: mandarinPromptConfig,
  stripArticles,
  findObjectByName,
  helpText: 'Help text not yet written for Mandarin.',
  modules: [
    homeModule,
  ],
};
