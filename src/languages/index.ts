import type { LanguageConfig } from './types';
import { spanishConfig } from './spanish/index';
import { mandarinConfig } from './mandarin/index';
import { hindiConfig } from './hindi/index';
import { portugueseConfig } from './portuguese/index';

const languages: Record<string, LanguageConfig> = {};

// Register built-in languages
registerLanguage(spanishConfig);
registerLanguage(mandarinConfig);
registerLanguage(hindiConfig);
registerLanguage(portugueseConfig);

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

export type { LanguageConfig } from './types';
