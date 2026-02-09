import type { Location, Goal, VocabWord, NPC, Pet } from '../engine/types.js';

// Module imports
import { locations as homeLocations, npcs as homeNPCs, pets as homePets, goals as homeGoals, vocabulary as homeVocabulary, getGoalById as getHomeGoalById, getStartGoal as getHomeStartGoal, getPetsInLocation, promptInstructions as homePrompt } from './home-basics.js';
import { restaurantLocations, restaurantNPCs, restaurantGoals, restaurantVocabulary, getRestaurantGoalById, getRestaurantStartGoal, promptInstructions as restaurantPrompt } from './restaurant-module.js';
import { clinicLocations, clinicNPCs, clinicGoals, clinicVocabulary, getClinicGoalById, getClinicStartGoal, promptInstructions as clinicPrompt } from './clinic-module.js';
import { gymLocations, gymNPCs, gymGoals, gymVocabulary, getGymGoalById, getGymStartGoal, promptInstructions as gymPrompt } from './gym-module.js';
import { parkLocations, parkNpcs, parkGoals, parkVocabulary, getParkGoalById, getParkStartGoal, promptInstructions as parkPrompt } from './park-module.js';
import { marketLocations, marketNPCs, marketGoals, marketVocabulary, getMarketGoalById, getMarketStartGoal, promptInstructions as marketPrompt } from './market-module.js';
import { bankLocations, bankNPCs, bankGoals, bankVocabulary, getBankGoalById, getBankStartGoal, promptInstructions as bankPrompt } from './bank-module.js';

export interface ModuleDefinition {
  name: string;
  displayName: string;
  locations: Record<string, Location>;
  npcs: NPC[];
  goals: Goal[];
  vocabulary: VocabWord[];
  startLocationId: string;
  startGoalId: string;
  locationIds: string[];
  unlockLevel: number;
  promptInstructions: string;
  pets?: Pet[];
  getPetsInLocation?: (locationId: string, petLocations: Record<string, string>) => Pet[];
}

// The registry: one entry per module
const modules: ModuleDefinition[] = [
  {
    name: 'home',
    displayName: 'Home',
    locations: homeLocations,
    npcs: homeNPCs,
    goals: homeGoals,
    vocabulary: homeVocabulary,
    startLocationId: 'bedroom',
    startGoalId: 'wake_up',
    locationIds: ['bedroom', 'bathroom', 'kitchen', 'living_room'],
    unlockLevel: 1,
    promptInstructions: homePrompt,
    pets: homePets,
    getPetsInLocation,
  },
  {
    name: 'street',
    displayName: 'Street',
    locations: { street: homeLocations['street'] },
    npcs: [],
    goals: [],
    vocabulary: [],
    startLocationId: 'street',
    startGoalId: '',
    locationIds: ['street'],
    unlockLevel: 1,
    promptInstructions: '',
  },
  {
    name: 'restaurant',
    displayName: 'Restaurant',
    locations: restaurantLocations,
    npcs: restaurantNPCs,
    goals: restaurantGoals,
    vocabulary: restaurantVocabulary,
    startLocationId: 'restaurant_entrance',
    startGoalId: 'restaurant_enter',
    locationIds: ['restaurant_entrance', 'restaurant_table', 'restaurant_kitchen', 'restaurant_cashier', 'restaurant_bathroom'],
    unlockLevel: 2,
    promptInstructions: restaurantPrompt,
  },
  {
    name: 'market',
    displayName: 'Market',
    locations: marketLocations,
    npcs: marketNPCs,
    goals: marketGoals,
    vocabulary: marketVocabulary,
    startLocationId: 'market_entrance',
    startGoalId: 'market_explore',
    locationIds: ['market_entrance', 'fruit_stand', 'vegetable_stand', 'meat_counter', 'market_checkout'],
    unlockLevel: 3,
    promptInstructions: marketPrompt,
  },
  {
    name: 'park',
    displayName: 'Park',
    locations: parkLocations,
    npcs: parkNpcs,
    goals: parkGoals,
    vocabulary: parkVocabulary,
    startLocationId: 'park_entrance',
    startGoalId: 'arrive_at_park',
    locationIds: ['park_entrance', 'main_path', 'fountain_area', 'garden', 'playground', 'kiosk'],
    unlockLevel: 3,
    promptInstructions: parkPrompt,
  },
  {
    name: 'gym',
    displayName: 'Gym',
    locations: gymLocations,
    npcs: gymNPCs,
    goals: gymGoals,
    vocabulary: gymVocabulary,
    startLocationId: 'gym_entrance',
    startGoalId: 'gym_check_in',
    locationIds: ['gym_entrance', 'stretching_area', 'training_floor', 'weight_room', 'cardio_zone', 'locker_room'],
    unlockLevel: 5,
    promptInstructions: gymPrompt,
  },
  {
    name: 'clinic',
    displayName: 'Clinic',
    locations: clinicLocations,
    npcs: clinicNPCs,
    goals: clinicGoals,
    vocabulary: clinicVocabulary,
    startLocationId: 'clinic_reception',
    startGoalId: 'clinic_arrive',
    locationIds: ['clinic_reception', 'waiting_room', 'exam_room', 'pharmacy'],
    unlockLevel: 5,
    promptInstructions: clinicPrompt,
  },
  {
    name: 'bank',
    displayName: 'Bank',
    locations: bankLocations,
    npcs: bankNPCs,
    goals: bankGoals,
    vocabulary: bankVocabulary,
    startLocationId: 'bank_entrance',
    startGoalId: 'bank_enter_greet',
    locationIds: ['bank_entrance', 'bank_waiting_area', 'bank_teller_window', 'bank_manager_office'],
    unlockLevel: 7,
    promptInstructions: bankPrompt,
  },
];

// --- Derived lookups (computed once at import time) ---

export type BuildingName = string;

// All locations merged
export const allLocations: Record<string, Location> = {};
for (const mod of modules) {
  Object.assign(allLocations, mod.locations);
}

// All NPCs merged
export const allNPCs: NPC[] = modules.flatMap(m => m.npcs);

// All vocabulary merged
export const allVocabulary: VocabWord[] = modules.flatMap(m => m.vocabulary);

// Location ID -> building name mapping
const locationToBuildingMap: Record<string, string> = {};
for (const mod of modules) {
  for (const locId of mod.locationIds) {
    locationToBuildingMap[locId] = mod.name;
  }
}

export function getBuildingForLocation(locationId: string): string {
  return locationToBuildingMap[locationId] || 'home';
}

// Building unlock levels
export const BUILDING_UNLOCK_LEVELS: Record<string, number> = {};
for (const mod of modules) {
  BUILDING_UNLOCK_LEVELS[mod.name] = mod.unlockLevel;
}

// Module lookup by name
const modulesByName: Record<string, ModuleDefinition> = {};
for (const mod of modules) {
  modulesByName[mod.name] = mod;
}

export function getModuleByName(name: string): ModuleDefinition | undefined {
  return modulesByName[name];
}

export function getModuleForLocation(locationId: string): ModuleDefinition | undefined {
  const building = getBuildingForLocation(locationId);
  return modulesByName[building];
}

// Goal lookup across all modules
export function getGoalById(id: string): Goal | undefined {
  return getHomeGoalById(id)
    || getRestaurantGoalById(id)
    || getClinicGoalById(id)
    || getGymGoalById(id)
    || getParkGoalById(id)
    || getMarketGoalById(id)
    || getBankGoalById(id);
}

// Start goal for a building
export function getStartGoalForBuilding(building: string): Goal | null {
  switch (building) {
    case 'home': return getHomeStartGoal();
    case 'restaurant': return getRestaurantStartGoal();
    case 'clinic': return getClinicStartGoal();
    case 'gym': return getGymStartGoal();
    case 'park': return getParkStartGoal();
    case 'market': return getMarketStartGoal();
    case 'bank': return getBankStartGoal();
    default: return null;
  }
}

// NPCs in a specific location
export function getNPCsInLocation(locationId: string): NPC[] {
  return allNPCs.filter(npc => npc.location === locationId);
}

// Display name for a building
export function getDisplayName(building: string): string {
  return modulesByName[building]?.displayName || building;
}

// Prompt instructions for current building
export function getPromptInstructionsForBuilding(building: string): string {
  return modulesByName[building]?.promptInstructions || '';
}

// All registered module names (for help text, etc.)
export function getModuleNames(): string[] {
  return modules.filter(m => m.name !== 'street' && m.name !== 'home').map(m => m.name);
}

// All registered modules
export function getAllModules(): ModuleDefinition[] {
  return modules;
}
