import type { Location, TutorialStep, VocabWord, NPC, WorldObject, ModuleDefinition } from '../engine/types.js';

import { homeModule } from '../languages/spanish/modules/home.js';
import { restaurantModule } from '../languages/spanish/modules/restaurant.js';

export type { ModuleDefinition };

const modules: ModuleDefinition[] = [
  homeModule,
  {
    name: 'street',
    displayName: 'Street',
    locations: { street: homeModule.locations.street },
    objects: [],
    npcs: [],
    tutorial: [],
    vocabulary: [],
    startLocationId: 'street',
    firstStepId: '',
    locationIds: ['street'],
    unlockLevel: 1,
    guidance: '',
  },
  restaurantModule,
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

// All objects merged
export const allObjects: WorldObject[] = modules.flatMap(m => m.objects);

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

export function getAllStepsForBuilding(building: string): TutorialStep[] {
  return modulesByName[building]?.tutorial || [];
}

export function getModuleForLocation(locationId: string): ModuleDefinition | undefined {
  const building = getBuildingForLocation(locationId);
  return modulesByName[building];
}

// Step lookup across all modules (generic - iterates registry)
export function getStepById(id: string): TutorialStep | undefined {
  for (const mod of modules) {
    const step = mod.tutorial.find(g => g.id === id);
    if (step) return step;
  }
  return undefined;
}

// Start step for a building (generic - uses registry)
export function getStartStepForBuilding(building: string): TutorialStep | null {
  const mod = modulesByName[building];
  if (!mod || !mod.firstStepId) return null;
  return mod.tutorial.find(g => g.id === mod.firstStepId) || null;
}

// NPCs in a specific location (from definitions — runtime locations are in npcStates)
export function getNPCsInLocation(locationId: string): NPC[] {
  return allNPCs.filter(npc => npc.location === locationId);
}

// Display name for a building
export function getDisplayName(building: string): string {
  return modulesByName[building]?.displayName || building;
}

// Guidance for current building (used by both AI passes)
export function getGuidanceForBuilding(building: string): string {
  return modulesByName[building]?.guidance || '';
}

// All registered module names (for help text, etc.)
export function getModuleNames(): string[] {
  return modules.filter(m => m.name !== 'street' && m.name !== 'home').map(m => m.name);
}

// All registered modules
export function getAllModules(): ModuleDefinition[] {
  return modules;
}

// All known step IDs across all modules (for validation)
const _allStepIds: Set<string> = new Set();
for (const mod of modules) {
  for (const step of mod.tutorial) {
    _allStepIds.add(step.id);
  }
}

export function getAllKnownStepIds(): Set<string> {
  return _allStepIds;
}
