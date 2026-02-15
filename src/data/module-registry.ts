import type { Location, TutorialStep, Quest, VocabWord, NPC, WorldObject, ModuleDefinition } from '../engine/types';

export type { ModuleDefinition };
export type BuildingName = string;

// Active modules — set per request via setActiveModules()
let activeModules: ModuleDefinition[] = [];

export function setActiveModules(modules: ModuleDefinition[]): void {
  activeModules = modules;
}

// --- Derived lookups (recomputed from activeModules) ---

export function getAllLocations(): Record<string, Location> {
  const result: Record<string, Location> = {};
  for (const mod of activeModules) {
    Object.assign(result, mod.locations);
  }
  return result;
}

export function getAllNPCs(): NPC[] {
  return activeModules.flatMap(m => m.npcs);
}

export function getAllVocabulary(): VocabWord[] {
  return activeModules.flatMap(m => m.vocabulary);
}

export function getAllObjects(): WorldObject[] {
  return activeModules.flatMap(m => m.objects);
}

export function getBuildingForLocation(locationId: string): string {
  for (const mod of activeModules) {
    for (const locId of mod.locationIds) {
      if (locId === locationId) return mod.name;
    }
  }
  return 'home';
}

export function getBuildingUnlockLevels(): Record<string, number> {
  const result: Record<string, number> = {};
  for (const mod of activeModules) {
    result[mod.name] = mod.unlockLevel;
  }
  return result;
}

export function getModuleByName(name: string): ModuleDefinition | undefined {
  return activeModules.find(m => m.name === name);
}

export function getAllStepsForBuilding(building: string): TutorialStep[] {
  return getModuleByName(building)?.tutorial || [];
}

export function getModuleForLocation(locationId: string): ModuleDefinition | undefined {
  const building = getBuildingForLocation(locationId);
  return getModuleByName(building);
}

export function getStepById(id: string): TutorialStep | undefined {
  for (const mod of activeModules) {
    const step = mod.tutorial.find(g => g.id === id);
    if (step) return step;
  }
  return undefined;
}

export function getStartStepForBuilding(building: string): TutorialStep | null {
  const mod = getModuleByName(building);
  if (!mod || !mod.firstStepId) return null;
  return mod.tutorial.find(g => g.id === mod.firstStepId) || null;
}

export function getAllQuestsForModule(moduleName: string): Quest[] {
  return getModuleByName(moduleName)?.quests || [];
}

export function getQuestById(id: string): Quest | undefined {
  for (const mod of activeModules) {
    const quest = mod.quests.find(q => q.id === id);
    if (quest) return quest;
  }
  return undefined;
}

export function getNPCsInLocation(locationId: string): NPC[] {
  return getAllNPCs().filter(npc => npc.location === locationId);
}

export function getDisplayName(building: string): string {
  return getModuleByName(building)?.displayName || building;
}

export function getGuidanceForBuilding(building: string): string {
  return getModuleByName(building)?.guidance || '';
}

export function getModuleNames(): string[] {
  return activeModules.filter(m => m.name !== 'street' && m.name !== 'home').map(m => m.name);
}

export function getAllModules(): ModuleDefinition[] {
  return activeModules;
}

export function getAllKnownStepIds(): Set<string> {
  const ids = new Set<string>();
  for (const mod of activeModules) {
    for (const step of mod.tutorial) {
      ids.add(step.id);
    }
  }
  return ids;
}
