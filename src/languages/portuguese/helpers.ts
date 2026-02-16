import type { WorldObject } from '../../engine/types';

/**
 * Strip Portuguese articles (o, a, os, as) from a word.
 * Returns an array of possible forms for vocabulary matching.
 */
export function stripArticles(word: string): string[] {
  const stripped = word.replace(/^(o|a|os|as)\s+/i, '');
  if (stripped !== word) {
    return [word, stripped];
  }
  return [word];
}

/**
 * Find a game object by its Portuguese name, with fuzzy matching.
 */
export function findObjectByName(objects: WorldObject[], name: string): WorldObject | undefined {
  const normalized = name.toLowerCase().trim();
  return objects.find((obj) => {
    const objName = obj.name.target.toLowerCase();
    return objName === normalized || objName.includes(normalized) || normalized.includes(objName);
  });
}
