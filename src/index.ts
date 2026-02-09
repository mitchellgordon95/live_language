import 'dotenv/config';
import * as dotenv from 'dotenv';

// Load .env.local (overrides .env)
dotenv.config({ path: '.env.local' });

import { runUnifiedMode } from './modes/unified.js';
import { getModuleNames } from './data/module-registry.js';
import { getLanguage, getAvailableLanguages, getDefaultLanguage } from './languages/index.js';

export interface GameOptions {
  scriptFile?: string;
  startLocation?: string;  // Start in a specific room (e.g., 'kitchen', 'bathroom')
  startGoal?: string;      // Start at a specific goal ID
  skipGoals?: boolean;     // Start with no goals
  standing?: boolean;      // Start standing (not in bed)
  module?: string;         // Start a specific module (e.g., 'restaurant')
  noAudio?: boolean;       // Disable text-to-speech
  profile?: string;        // Use a named profile for vocabulary tracking
  language?: string;       // Target language (e.g., 'spanish', 'mandarin')
}

// Parse command line args
function parseArgs(): GameOptions {
  const args = process.argv.slice(2);
  const result: GameOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === '--script' && next) {
      result.scriptFile = next;
      i++;
    } else if (arg === '--start-location' && next) {
      result.startLocation = next;
      i++;
    } else if (arg === '--start-goal' && next) {
      result.startGoal = next;
      i++;
    } else if (arg === '--skip-goals') {
      result.skipGoals = true;
    } else if (arg === '--standing') {
      result.standing = true;
    } else if (arg === '--module' && next) {
      result.module = next;
      i++;
    } else if (arg === '--no-audio') {
      result.noAudio = true;
    } else if (arg === '--language' && next) {
      result.language = next;
      i++;
    } else if (arg === '--profile' && next) {
      result.profile = next;
      i++;
    } else if (arg === '--help') {
      console.log(`
Usage: npm start -- [options]

Options:
  --script <file>          Run commands from a script file
  --start-location <id>    Start in a specific room (bedroom, bathroom, kitchen, living_room, street, restaurant_entrance, clinic_reception, bank_entrance, park_entrance, gym_entrance, market_entrance)
  --start-goal <id>        Start at a specific goal
  --skip-goals             Start with no goals
  --standing               Start standing (not in bed)
  --module <name>          Start a specific module (${getModuleNames().join(', ')})
  --no-audio               Disable text-to-speech
  --language <name>        Target language (${getAvailableLanguages().join(', ')}) [default: ${getDefaultLanguage()}]
  --profile <name>         Use a named profile for vocabulary tracking (e.g., 'friend' uses vocabulary-progress-friend.json)
  --help                   Show this help message

Examples:
  npm start -- --start-location kitchen --standing
  npm start -- --start-goal make_breakfast --standing
  npm start -- --script test.txt
${getModuleNames().map(m => `  npm start -- --module ${m}`).join('\n')}
`);
      process.exit(0);
    }
  }

  return result;
}

async function main(): Promise<void> {
  const options = parseArgs();

  // Resolve language config
  const languageId = options.language || getDefaultLanguage();
  const languageConfig = getLanguage(languageId);
  if (!languageConfig) {
    console.error(`Unknown language: ${languageId}. Available: ${getAvailableLanguages().join(', ')}`);
    process.exit(1);
  }

  await runUnifiedMode(options, languageConfig);
}

main().catch(console.error);
