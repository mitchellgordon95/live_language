import type { LanguageConfig } from '../types';
import { HINDI_PARSE_PROMPT, HINDI_NARRATE_PROMPT, hindiPromptConfig } from './prompt';
import { stripArticles, findObjectByName } from './helpers';
import { homeModule } from './modules/home';

export const hindiConfig: LanguageConfig = {
  id: 'hindi',
  displayName: 'Hindi',
  nativeLanguage: 'english',
  coreSystemPrompt: HINDI_PARSE_PROMPT,
  narrateSystemPrompt: HINDI_NARRATE_PROMPT,
  ttsVoice: 'Aoede',
  promptConfig: hindiPromptConfig,
  stripArticles,
  findObjectByName,
  helpText: `Stuck? Here's what you can do:

1. **Try in Hindi** — Even broken Hindi works! "मैं want जाना kitchen" will be understood and corrected.
2. **Use romanization** — Type romanized Hindi: "main uthta hoon" works just as well as "मैं उठता हूँ".
3. **Say it in English** — "I want to go to the kitchen" and the AI will show you how to say it in Hindi.
4. **Ask a question in English** — "How do I open the fridge?" and the AI will guide you in Hindi.
5. **/learn [topic]** — Get a quick Hindi lesson. Try: /learn greetings, /learn postpositions, /learn food vocabulary
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
