import type { GameObject } from '../../engine/types.js';

/**
 * Mandarin has no articles to strip. Returns the word as-is.
 */
export function stripArticles(word: string): string[] {
  return [word];
}

/**
 * Find a game object by its Mandarin name.
 * Matches against both characters and pinyin (stored in target field).
 */
export function findObjectByName(objects: GameObject[], name: string): GameObject | undefined {
  const normalized = name.toLowerCase().trim();
  return objects.find((obj) => {
    const objName = obj.name.target.toLowerCase();
    return objName === normalized || objName.includes(normalized) || normalized.includes(objName);
  });
}
