import type { LanguageConfig } from '../types.js';
import { SPANISH_SYSTEM_PROMPT, SPANISH_NARRATE_PROMPT } from './prompt.js';
import { stripArticles, findObjectByName } from './helpers.js';
import { homeModule } from './modules/home.js';
import { restaurantModule } from './modules/restaurant.js';

export const spanishConfig: LanguageConfig = {
  id: 'spanish',
  displayName: 'Spanish',
  nativeLanguage: 'english',
  coreSystemPrompt: SPANISH_SYSTEM_PROMPT,
  narrateSystemPrompt: SPANISH_NARRATE_PROMPT,
  ttsVoice: 'Paulina',
  aiFields: {
    targetModel: 'spanishModel',
    npcTargetField: 'spanish',
    objectTargetName: 'spanishName',
  },
  stripArticles,
  findObjectByName,
  helpText: `Stuck? Here's what you can do:

1. **Try in Spanish** — Even broken Spanish works! "Yo quiero ir cocina" will be understood and corrected.
2. **Say it in English** — "I want to go to the kitchen" or even "Yo quiero go to the cocina" and the AI will show you how to say it in Spanish.
3. **Ask a question in English** — "How do I order food?" and the AI will guide you in Spanish.
4. **/learn [topic]** — Get a quick Spanish lesson. Try: /learn greetings, /learn past tense, /learn food vocabulary
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
    restaurantModule,
  ],
};
