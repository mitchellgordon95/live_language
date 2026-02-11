import type { Location, Goal, VocabWord, NPC, Pet, ModuleDefinition } from '../engine/types.js';

// Import self-describing module definitions from Spanish language
import { homeModule } from '../languages/spanish/modules/home.js';
import { restaurantModule } from '../languages/spanish/modules/restaurant.js';
import { clinicModule } from '../languages/spanish/modules/clinic.js';
import { gymModule } from '../languages/spanish/modules/gym.js';
import { parkModule } from '../languages/spanish/modules/park.js';
import { marketModule } from '../languages/spanish/modules/market.js';
import { bankModule } from '../languages/spanish/modules/bank.js';
import { street } from '../languages/spanish/modules/home.js';

export type { ModuleDefinition };

// The registry: one entry per module
const modules: ModuleDefinition[] = [
  homeModule,
  {
    name: 'street',
    displayName: 'Street',
    locations: { street },
    npcs: [],
    goals: [],
    vocabulary: [],
    startLocationId: 'street',
    startGoalId: '',
    locationIds: ['street'],
    unlockLevel: 1,
    promptInstructions: '',
  },
  restaurantModule,
  marketModule,
  parkModule,
  gymModule,
  clinicModule,
  bankModule,
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

export function getAllGoalsForBuilding(building: string): Goal[] {
  return modulesByName[building]?.goals || [];
}

export function getModuleForLocation(locationId: string): ModuleDefinition | undefined {
  const building = getBuildingForLocation(locationId);
  return modulesByName[building];
}

// Goal lookup across all modules (generic - iterates registry)
export function getGoalById(id: string): Goal | undefined {
  for (const mod of modules) {
    const goal = mod.goals.find(g => g.id === id);
    if (goal) return goal;
  }
  return undefined;
}

// Start goal for a building (generic - uses registry)
export function getStartGoalForBuilding(building: string): Goal | null {
  const mod = modulesByName[building];
  if (!mod || !mod.startGoalId) return null;
  return mod.goals.find(g => g.id === mod.startGoalId) || null;
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
