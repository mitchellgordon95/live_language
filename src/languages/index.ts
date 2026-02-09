import type { LanguageConfig } from './types.js';
import { spanishConfig } from './spanish/index.js';
import { mandarinConfig } from './mandarin/index.js';

const languages: Record<string, LanguageConfig> = {};

// Register built-in languages
registerLanguage(spanishConfig);
registerLanguage(mandarinConfig);

export function registerLanguage(config: LanguageConfig): void {
  languages[config.id] = config;
}

export function getLanguage(id: string): LanguageConfig | undefined {
  return languages[id];
}

export function getAvailableLanguages(): string[] {
  return Object.keys(languages);
}

export function getDefaultLanguage(): string {
  return 'spanish';
}

export type { LanguageConfig } from './types.js';
