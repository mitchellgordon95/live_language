import type { LanguageConfig } from '../types';
import { PORTUGUESE_SYSTEM_PROMPT, PORTUGUESE_NARRATE_PROMPT, portuguesePromptConfig } from './prompt';
import { stripArticles, findObjectByName } from './helpers';
import { homeModule } from './modules/home';

export const portugueseConfig: LanguageConfig = {
  id: 'portuguese',
  displayName: 'Brazilian Portuguese',
  nativeLanguage: 'english',
  coreSystemPrompt: PORTUGUESE_SYSTEM_PROMPT,
  narrateSystemPrompt: PORTUGUESE_NARRATE_PROMPT,
  ttsVoice: 'Aoede',
  promptConfig: portuguesePromptConfig,
  stripArticles,
  findObjectByName,
  helpText: `Stuck? Here's what you can do:

1. **Try in Portuguese** — Even broken Portuguese works! "Eu quero ir cozinha" will be understood and corrected.
2. **Say it in English** — "I want to go to the kitchen" or even "Eu quero go to the cozinha" and the AI will show you how to say it in Portuguese.
3. **Ask a question in English** — "How do I order food?" and the AI will guide you in Portuguese.
4. **/learn [topic]** — Get a quick Portuguese lesson. Try: /learn greetings, /learn past tense, /learn food vocabulary
5. **/help** — See your current location, goal, and nearby objects.`,
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
