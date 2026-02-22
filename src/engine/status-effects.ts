// Status effect definitions and timer logic
import type { StatusEffectDef, StatusTimerConfig } from './types';

// Core effect definitions (shared across all modules)
export const CORE_EFFECTS: StatusEffectDef[] = [
  // Hunger
  { id: 'hungry', label: 'Hungry', severity: 'mild', icon: '🍔', category: 'hunger' },
  { id: 'very_hungry', label: 'Very Hungry', severity: 'moderate', icon: '🍔', category: 'hunger' },
  { id: 'starving', label: 'Starving', severity: 'urgent', icon: '🍔', category: 'hunger' },
  // Bladder
  { id: 'needs_bathroom', label: 'Needs Bathroom', severity: 'mild', icon: '🚻', category: 'bladder' },
  { id: 'urgent_bathroom', label: 'Urgent!', severity: 'moderate', icon: '🚻', category: 'bladder' },
  { id: 'desperate_bathroom', label: 'Desperate!', severity: 'urgent', icon: '🚻', category: 'bladder' },
  // Energy
  { id: 'tired', label: 'Tired', severity: 'mild', icon: '⚡', category: 'energy' },
  { id: 'very_tired', label: 'Very Tired', severity: 'moderate', icon: '⚡', category: 'energy' },
  { id: 'exhausted', label: 'Exhausted', severity: 'urgent', icon: '⚡', category: 'energy' },
  // Hygiene
  { id: 'needs_shower', label: 'Needs Shower', severity: 'mild', icon: '🧼', category: 'hygiene' },
  { id: 'dirty', label: 'Dirty', severity: 'moderate', icon: '🧼', category: 'hygiene' },
  { id: 'very_dirty', label: 'Very Dirty', severity: 'urgent', icon: '🧼', category: 'hygiene' },
];

// Core timer configurations
export const CORE_STATUS_TIMERS: StatusTimerConfig[] = [
  { category: 'hunger', triggerEvery: 15, escalation: ['hungry', 'very_hungry', 'starving'] },
  { category: 'bladder', triggerEvery: 18, escalation: ['needs_bathroom', 'urgent_bathroom', 'desperate_bathroom'] },
  { category: 'energy', triggerEvery: 20, escalation: ['tired', 'very_tired', 'exhausted'] },
  { category: 'hygiene', triggerEvery: 25, escalation: ['needs_shower', 'dirty', 'very_dirty'] },
];

// Lookup effect definition by ID
const effectMap = new Map(CORE_EFFECTS.map(e => [e.id, e]));

export function getEffectDef(id: string): StatusEffectDef | null {
  return effectMap.get(id) ?? null;
}

// Get the category for an effect ID (null if unknown)
export function getEffectCategory(id: string): string | null {
  return effectMap.get(id)?.category ?? null;
}

// Apply timer escalation logic after a turn
export function tickStatusTimers(
  effects: string[],
  timers: Record<string, number>,
  turnCount: number,
  timerConfigs: StatusTimerConfig[] = CORE_STATUS_TIMERS,
): { effects: string[]; timers: Record<string, number> } {
  let newEffects = [...effects];
  const newTimers = { ...timers };

  for (const config of timerConfigs) {
    const lastReset = newTimers[config.category] ?? 0;
    const turnsSinceReset = turnCount - lastReset;

    // How many escalation levels should we be at?
    const targetLevel = Math.min(
      Math.floor(turnsSinceReset / config.triggerEvery),
      config.escalation.length,
    );

    if (targetLevel <= 0) continue;

    // What's the current level in this category?
    const currentLevel = config.escalation.findIndex(id => newEffects.includes(id));

    // Escalate if needed (targetLevel is 1-indexed, currentLevel is 0-indexed or -1)
    if (targetLevel > currentLevel + 1) {
      const targetEffectId = config.escalation[targetLevel - 1];
      // Remove any existing effect in this category
      newEffects = newEffects.filter(id => !config.escalation.includes(id));
      newEffects.push(targetEffectId);
    }
  }

  return { effects: newEffects, timers: newTimers };
}

// Remove all effects in a category and reset its timer
export function clearCategory(
  effects: string[],
  timers: Record<string, number>,
  category: string,
  turnCount: number,
): { effects: string[]; timers: Record<string, number> } {
  // Find all effect IDs in this category
  const categoryIds = CORE_EFFECTS
    .filter(e => e.category === category)
    .map(e => e.id);

  return {
    effects: effects.filter(id => !categoryIds.includes(id)),
    timers: { ...timers, [category]: turnCount },
  };
}
