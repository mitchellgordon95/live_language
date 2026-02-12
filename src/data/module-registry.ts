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

// Generate prompt text from structured module data
export function generatePromptInstructions(mod: ModuleDefinition): string {
  if (!mod.npcDescriptions && !mod.interactions) {
    return mod.promptInstructions;
  }

  const parts: string[] = [];

  if (mod.npcDescriptions?.length) {
    parts.push(`${mod.displayName.toUpperCase()} NPCs:`);
    for (const npc of mod.npcDescriptions) {
      const phrases = npc.keyPhrases?.length
        ? ` Key phrases: ${npc.keyPhrases.map(p => `"${p}"`).join(', ')}.`
        : '';
      parts.push(`- ${npc.id}: ${npc.personality}${phrases}`);
    }
  }

  if (mod.interactions?.length) {
    parts.push('');
    parts.push(`${mod.displayName.toUpperCase()} INTERACTIONS:`);
    for (const inter of mod.interactions) {
      const triggers = inter.triggers.map(t => `"${t}"`).join(' or ');
      const loc = inter.location ? ` at ${inter.location}` : '';
      const lineParts: string[] = [];
      if (inter.actions?.length) lineParts.push(`actions: ${JSON.stringify(inter.actions)}`);
      if (inter.goalComplete) lineParts.push(`goalComplete: ${JSON.stringify(inter.goalComplete)}`);
      if (inter.needsChanges) lineParts.push(`needsChanges: ${JSON.stringify(inter.needsChanges)}`);
      if (inter.npcActions) lineParts.push(`npcActions: ${JSON.stringify(inter.npcActions)}`);
      const details = lineParts.length ? ` ${lineParts.join(', ')}` : '';
      parts.push(`- ${triggers}${loc} →${details}`);
      if (inter.note) parts.push(`  ${inter.note}`);
    }
  }

  // Append any extra notes from promptInstructions
  if (mod.promptInstructions) {
    parts.push('');
    parts.push(mod.promptInstructions);
  }

  if (mod.teachingNotes) {
    parts.push('');
    parts.push(`${mod.teachingNotes.title}:`);
    for (const pattern of mod.teachingNotes.patterns) {
      parts.push(`- ${pattern}`);
    }
  }

  return parts.join('\n');
}

// Prompt instructions for current building
export function getPromptInstructionsForBuilding(building: string): string {
  const mod = modulesByName[building];
  if (!mod) return '';
  return generatePromptInstructions(mod);
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

// Validate structured interaction data against module definitions
// Note: goalComplete IDs are NOT validated here — they include informal completion
// markers (like "seated_by_host") that goal.checkComplete() checks via
// state.completedGoals.includes(). Runtime validation in unified.ts handles AI output.
function validateModuleInteractions(mod: ModuleDefinition): string[] {
  const errors: string[] = [];
  if (!mod.interactions) return errors;

  const objectIds = new Set(
    Object.values(mod.locations).flatMap(loc => loc.objects.map(o => o.id))
  );
  const npcIds = new Set(mod.npcs.map(n => n.id));
  const petIds = new Set((mod.pets || []).map(p => p.id));
  const locationIds = new Set(mod.locationIds);

  for (const inter of mod.interactions) {
    for (const action of inter.actions || []) {
      if (action.objectId && !objectIds.has(action.objectId))
        errors.push(`${mod.name}: unknown objectId "${action.objectId}"`);
      if (action.npcId && !npcIds.has(action.npcId))
        errors.push(`${mod.name}: unknown npcId "${action.npcId}"`);
      if (action.petId && !petIds.has(action.petId))
        errors.push(`${mod.name}: unknown petId "${action.petId}"`);
      if (action.locationId && !locationIds.has(action.locationId))
        errors.push(`${mod.name}: unknown locationId "${action.locationId}"`);
    }
  }
  return errors;
}

// Run validation on all modules at load time
for (const mod of modules) {
  const errors = validateModuleInteractions(mod);
  for (const err of errors) {
    console.warn(`[module-validation] ${err}`);
  }
}
