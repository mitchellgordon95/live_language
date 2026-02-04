import 'dotenv/config';
import * as dotenv from 'dotenv';

// Load .env.local (overrides .env)
dotenv.config({ path: '.env.local' });

import { runUnifiedMode } from './modes/unified.js';

// Parse command line args
function parseArgs(): { scriptFile?: string } {
  const args = process.argv.slice(2);
  const result: { scriptFile?: string } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--script' && args[i + 1]) {
      result.scriptFile = args[i + 1];
      i++;
    }
  }

  return result;
}

async function main(): Promise<void> {
  const args = parseArgs();
  await runUnifiedMode(args.scriptFile);
}

main().catch(console.error);
