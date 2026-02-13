import type { Location, Goal, VocabWord, NPC, WorldObject, ModuleDefinition } from '../engine/types.js';

// Import home module (only module converted for this experiment)
import { homeModule } from '../languages/spanish/modules/home.js';

export type { ModuleDefinition };

// The registry: one entry per module
// NOTE: For this experiment, only home module is implemented. Others are stubbed.
const modules: ModuleDefinition[] = [
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

// All known goal IDs across all modules (for validation)
const _allGoalIds: Set<string> = new Set();
for (const mod of modules) {
  for (const goal of mod.goals) {
    _allGoalIds.add(goal.id);
  }
}

export function getAllKnownGoalIds(): Set<string> {
  return _allGoalIds;
}
