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
  helpText: `Stuck? Here's what you can do:

1. **Try in Mandarin** — Even broken Mandarin works! "我 want 去 kitchen" will be understood and corrected.
2. **Use pinyin** — Type pinyin without tones: "wo qichuang" works just as well as "我起床".
3. **Say it in English** — "I want to go to the kitchen" and the AI will show you how to say it in Mandarin.
4. **Ask a question in English** — "How do I open the fridge?" and the AI will guide you in Mandarin.
5. **/learn [topic]** — Get a quick Mandarin lesson. Try: /learn greetings, /learn measure words, /learn food vocabulary
6. **/help** — See your current location, goal, and nearby objects.`,
  modules: [
    homeModule,
    {
      name: 'street',
      displayName: 'Street',
      locations: { street: homeModule.locations.street },
      objects: [],
      npcs: [],
      tutorial: [],
      quests: [],
      vocabulary: [],
      startLocationId: 'street',
      firstStepId: '',
      locationIds: ['street'],
      unlockLevel: 1,
      guidance: '',
    },
  ],
};
