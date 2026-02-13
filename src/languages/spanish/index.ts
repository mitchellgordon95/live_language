import type { LanguageConfig } from '../types.js';
import { SPANISH_SYSTEM_PROMPT, SPANISH_NARRATE_PROMPT } from './prompt.js';
import { stripArticles, findObjectByName } from './helpers.js';
import { homeModule } from './modules/home.js';
import { restaurantModule } from './modules/restaurant.js';
import { bankModule } from './modules/bank.js';
import { clinicModule } from './modules/clinic.js';
import { gymModule } from './modules/gym.js';
import { parkModule } from './modules/park.js';
import { marketModule } from './modules/market.js';

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
  modules: [
    homeModule,
    {
      name: 'street',
      displayName: 'Street',
      locations: { street: homeModule.locations.street },
      objects: [],
      npcs: [],
      goals: [],
      vocabulary: [],
      startLocationId: 'street',
      startGoalId: '',
      locationIds: ['street'],
      unlockLevel: 1,
      guidance: '',
    },
    restaurantModule,
    bankModule,
    clinicModule,
    gymModule,
    parkModule,
    marketModule,
  ],
};
