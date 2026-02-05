import type { GameState, AIUnderstandingResult, ActionResult, Goal, Intent } from '../engine/types.js';
import { formatTime, getObjectState, getPointsForLevel } from '../engine/game-state.js';
import { getWordIdFromObject, getFamiliaritySummary, getObjectLabel } from '../engine/vocabulary.js';
import { getNPCsInLocation, getPetsInLocation } from '../data/home-basics.js';

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

export function clearScreen(): void {
  console.clear();
}

export function printHeader(): void {
  console.log(`
${COLORS.cyan}═══════════════════════════════════════════════════════${COLORS.reset}
${COLORS.bold}  LANGUAGE LIFE SIM - Home Basics${COLORS.reset}
${COLORS.cyan}═══════════════════════════════════════════════════════${COLORS.reset}
`);
}

export function printLocation(state: GameState): void {
  const loc = state.location;
  const position = state.playerPosition === 'in_bed' ? ' (in bed)' : '';

  console.log(`${COLORS.blue}📍 Location:${COLORS.reset} ${loc.name.english} - ${loc.name.spanish}${position}`);
  console.log(`${COLORS.dim}⏰ Time: ${formatTime(state.time)}${COLORS.reset}`);
  console.log();
}

export function printObjects(state: GameState): void {
  console.log(`${COLORS.bold}You see:${COLORS.reset}`);

  const visibleObjects = state.location.objects.filter((obj) => {
    const objState = getObjectState(state, obj);
    // Hide items in closed fridge
    if (objState.inFridge) {
      const fridge = state.location.objects.find((o) => o.id === 'refrigerator');
      const fridgeState = fridge ? getObjectState(state, fridge) : {};
      return fridgeState.open;
    }
    return true;
  });

  for (const obj of visibleObjects) {
    const objState = getObjectState(state, obj);
    let status = '';
    if (objState.ringing) status = ` ${COLORS.red}RINGING!${COLORS.reset}`;
    else if (objState.open === true) status = ` ${COLORS.dim}- open${COLORS.reset}`;
    else if (objState.open === false) status = ` ${COLORS.dim}- closed${COLORS.reset}`;
    else if (objState.on === true) status = ` ${COLORS.yellow}- on${COLORS.reset}`;
    else if (objState.on === false) status = ` ${COLORS.dim}- off${COLORS.reset}`;
    if (objState.inFridge) status += ` ${COLORS.dim}(from fridge)${COLORS.reset}`;

    // Use familiarity-aware label:
    // - new: "la nevera (refrigerator)"
    // - learning: "la nevera"
    // - known: "la nevera"
    const label = getObjectLabel(obj, state.vocabulary);
    const wordId = getWordIdFromObject(obj);
    const familiarity = state.vocabulary.words[wordId];

    // Add visual indicator for familiarity stage
    let stageIndicator = '';
    if (familiarity?.stage === 'learning') {
      stageIndicator = ` ${COLORS.cyan}◐${COLORS.reset}`;
    } else if (familiarity?.stage === 'known') {
      stageIndicator = ` ${COLORS.green}●${COLORS.reset}`;
    }

    console.log(`  • ${label}${stageIndicator}${status}`);
  }

  if (state.location.exits.length > 0) {
    console.log();
    console.log(`${COLORS.dim}Exits: ${state.location.exits.map((e) => e.name.spanish).join(', ')}${COLORS.reset}`);
  }
  console.log();
}

export function printNeeds(state: GameState): void {
  const energyBar = makeBar(state.needs.energy);
  const hungerBar = makeBar(state.needs.hunger);
  const hygieneBar = makeBar(state.needs.hygiene);
  const bladderBar = makeBar(state.needs.bladder);

  console.log(`${COLORS.bold}Needs:${COLORS.reset} ⚡ ${energyBar}  🍔 ${hungerBar}  🧼 ${hygieneBar}  🚽 ${bladderBar}`);
  console.log();
}

export function printLevel(state: GameState): void {
  const pointsToNext = getPointsForLevel(state.level);
  const progress = Math.min(100, Math.round((state.points / pointsToNext) * 100));
  const progressBar = makeBar(progress);

  console.log(`${COLORS.bold}Level ${state.level}${COLORS.reset} ${progressBar} ${COLORS.dim}${state.points}/${pointsToNext} pts${COLORS.reset}`);
  console.log();
}

function makeBar(value: number): string {
  const filled = Math.round(value / 10);
  const empty = 10 - filled;
  const color = value >= 70 ? COLORS.green : value >= 40 ? COLORS.yellow : COLORS.red;
  return `${color}${'█'.repeat(filled)}${COLORS.dim}${'░'.repeat(empty)}${COLORS.reset}`;
}

export function printGoal(goal: Goal | null, showHint: boolean): void {
  if (!goal) return;

  console.log(`${COLORS.magenta}📋 Goal:${COLORS.reset} ${goal.title}`);
  if (goal.hint && showHint) {
    console.log(`   ${COLORS.dim}💡 Hint: ${goal.hint}${COLORS.reset}`);
  }
  console.log();
}

export function printAvailableVerbs(state: GameState): void {
  // Collect verbs relevant to current context
  const verbs: { spanish: string; english: string; wordId: string }[] = [];

  // Position-based verbs
  if (state.playerPosition === 'in_bed') {
    verbs.push({ spanish: 'me levanto', english: 'I get up', wordId: 'i_get_up' });
    verbs.push({ spanish: 'me despierto', english: 'I wake up', wordId: 'i_wake_up' });
  }

  // Location-based verbs
  verbs.push({ spanish: 'voy a...', english: 'I go to...', wordId: 'i_go' });

  // Object-based verbs
  const hasOpenable = state.location.objects.some(o => o.actions.includes('OPEN'));
  const hasToggleable = state.location.objects.some(o => o.actions.includes('TURN_ON'));
  const hasTakeable = state.location.objects.some(o => o.takeable);
  const hasEdible = state.location.objects.some(o => o.consumable);

  if (hasOpenable) {
    verbs.push({ spanish: 'abro', english: 'I open', wordId: 'i_open' });
    verbs.push({ spanish: 'cierro', english: 'I close', wordId: 'i_close' });
  }
  if (hasToggleable) {
    verbs.push({ spanish: 'enciendo', english: 'I turn on', wordId: 'i_turn_on' });
    verbs.push({ spanish: 'apago', english: 'I turn off', wordId: 'i_turn_off' });
  }
  if (hasTakeable) {
    verbs.push({ spanish: 'tomo', english: 'I take', wordId: 'i_take_drink' });
  }
  if (hasEdible) {
    verbs.push({ spanish: 'como', english: 'I eat', wordId: 'i_eat' });
    verbs.push({ spanish: 'bebo', english: 'I drink', wordId: 'i_drink' });
  }

  // Bathroom-specific
  if (state.location.id === 'bathroom') {
    verbs.push({ spanish: 'me ducho', english: 'I shower', wordId: 'i_shower' });
    verbs.push({ spanish: 'me cepillo', english: 'I brush', wordId: 'i_brush' });
    verbs.push({ spanish: 'uso', english: 'I use', wordId: 'i_use' });
  }

  // Kitchen-specific
  if (state.location.id === 'kitchen') {
    verbs.push({ spanish: 'cocino', english: 'I cook', wordId: 'i_cook' });
  }

  // NPC/Pet interactions
  const npcsHere = getNPCsInLocation(state.location.id);
  const petsHere = getPetsInLocation(state.location.id, state.petLocations);

  if (npcsHere.length > 0) {
    verbs.push({ spanish: 'hablo con', english: 'I talk to', wordId: 'i_talk_to' });
    verbs.push({ spanish: 'le doy', english: 'I give', wordId: 'i_give' });
  }

  if (petsHere.length > 0) {
    verbs.push({ spanish: 'acaricio', english: 'I pet', wordId: 'i_pet' });
    verbs.push({ spanish: 'le doy comida', english: 'I feed', wordId: 'i_feed' });
  }

  console.log(`${COLORS.dim}Verbs: ${verbs.map(v => {
    const word = state.vocabulary.words[v.wordId];
    const stage = word?.stage || 'new';

    if (stage === 'new') {
      return `${v.spanish} (${v.english})`;
    } else if (stage === 'learning') {
      return `${v.spanish}${COLORS.cyan}◐${COLORS.reset}${COLORS.dim}`;
    } else {
      return `${v.spanish}${COLORS.green}●${COLORS.reset}${COLORS.dim}`;
    }
  }).join(', ')}${COLORS.reset}`);
  console.log();
}

export function printInventory(state: GameState): void {
  if (state.inventory.length === 0) return;

  console.log(`${COLORS.dim}🎒 Inventory: ${state.inventory.map((i) => i.name.spanish).join(', ')}${COLORS.reset}`);
  console.log();
}

export function printSeparator(): void {
  console.log(`${COLORS.dim}───────────────────────────────────────────────────────${COLORS.reset}`);
}

export function printResults(
  understanding: AIUnderstandingResult,
  results: { intent: Intent; result: ActionResult }[]
): void {
  // Print each action result
  for (const { result } of results) {
    if (result.success) {
      console.log(`${COLORS.green}✓${COLORS.reset} ${result.message}`);
    } else {
      console.log(`${COLORS.yellow}✗${COLORS.reset} ${result.message}`);
    }
  }
  console.log();

  // Show grammar feedback
  if (understanding.understood) {
    if (understanding.grammar.score === 100) {
      console.log(`   ${COLORS.green}Perfect! ⭐${COLORS.reset} ${COLORS.dim}"${understanding.response.spanishModel}"${COLORS.reset}`);
    } else if (understanding.grammar.issues.length > 0) {
      const issue = understanding.grammar.issues[0];
      console.log(`   ${COLORS.yellow}📝 Tip:${COLORS.reset} "${issue.corrected}" is more natural`);
      console.log(`      ${COLORS.dim}${issue.explanation}${COLORS.reset}`);
    }
  } else {
    console.log(`   ${COLORS.dim}Try again, or type /hint for help!${COLORS.reset}`);
  }
  console.log();
}

export function printGoalComplete(goal: Goal): void {
  console.log(`${COLORS.green}🎉 Goal complete: ${goal.title}${COLORS.reset}`);
  console.log();
}

export function printPointsAwarded(points: number, leveledUp: boolean, newLevel: number): void {
  console.log(`   ${COLORS.cyan}+${points} points${COLORS.reset}`);

  if (leveledUp) {
    console.log(`   ${COLORS.green}🎊 LEVEL UP! Now level ${newLevel}${COLORS.reset}`);
  }
  console.log();
}

export function printBuildingLocked(building: string, requiredLevel: number): void {
  const buildingNames: Record<string, string> = {
    home: 'Home',
    street: 'Street',
    restaurant: 'Restaurant',
    market: 'Market',
    park: 'Park',
    gym: 'Gym',
    clinic: 'Clinic',
    bank: 'Bank',
  };
  const displayName = buildingNames[building] || building;
  console.log(`   ${COLORS.yellow}🔒 ${displayName} is locked! Reach level ${requiredLevel} to unlock.${COLORS.reset}`);
  console.log();
}

export function printBuildingEntered(building: string): void {
  const buildingNames: Record<string, string> = {
    home: 'Home',
    street: 'the Street',
    restaurant: 'the Restaurant',
    market: 'the Market',
    park: 'the Park',
    gym: 'the Gym',
    clinic: 'the Clinic',
    bank: 'the Bank',
  };
  const displayName = buildingNames[building] || building;
  console.log(`   ${COLORS.cyan}📍 Entering ${displayName}...${COLORS.reset}`);
  console.log();
}

export function printProgressStatus(points: number, level: number, pointsToNextLevel: number): void {
  console.log(`   ${COLORS.dim}Level ${level} | ${points} pts | Next: ${pointsToNextLevel}${COLORS.reset}`);
}

export function printWelcome(): void {
  console.log(`
${COLORS.cyan}Welcome to Language Life Sim!${COLORS.reset}

Control your character by typing commands in ${COLORS.bold}Spanish${COLORS.reset}.
Look at the objects and verbs shown - combine them to take action!

Type ${COLORS.bold}/help${COLORS.reset} for help, or ${COLORS.bold}/quit${COLORS.reset} to exit.
`);
}

export function printHelp(): void {
  console.log(`
${COLORS.bold}Commands:${COLORS.reset}
  /help     - Show this help
  /quit     - Exit the game
  /vocab    - Show vocabulary progress
  /hint     - Show current goal hint (if stuck)

${COLORS.bold}How to play:${COLORS.reset}
  Combine verbs with objects to take action.
  Example: verb + object → "abro la nevera"

${COLORS.bold}Sentence patterns:${COLORS.reset}
  [verb] [object]           → abro la ventana
  [verb] a [place]          → voy al baño
  me [reflexive verb]       → me levanto, me ducho
`);
}

export function printVocab(state: GameState): void {
  const summary = getFamiliaritySummary(state.vocabulary);
  console.log(`${COLORS.bold}Vocabulary Progress:${COLORS.reset}`);
  console.log(`  ${COLORS.dim}○${COLORS.reset} New: ${summary.new}`);
  console.log(`  ${COLORS.cyan}◐${COLORS.reset} Learning: ${summary.learning}`);
  console.log(`  ${COLORS.green}●${COLORS.reset} Known: ${summary.known}`);
  console.log();

  // Show words in learning/known stages
  const learningWords = Object.values(state.vocabulary.words).filter(w => w.stage === 'learning');
  const knownWords = Object.values(state.vocabulary.words).filter(w => w.stage === 'known');

  if (knownWords.length > 0) {
    console.log(`${COLORS.green}Known words:${COLORS.reset}`);
    for (const word of knownWords) {
      console.log(`  ${COLORS.green}●${COLORS.reset} ${word.spanishForms[0]}`);
    }
    console.log();
  }

  if (learningWords.length > 0) {
    console.log(`${COLORS.cyan}Learning:${COLORS.reset}`);
    for (const word of learningWords) {
      const progress = `${word.timesUsedCorrectly}/${THRESHOLDS.totalUsesToKnow} uses`;
      console.log(`  ${COLORS.cyan}◐${COLORS.reset} ${word.spanishForms[0]} (${word.englishForm}) - ${progress}`);
    }
    console.log();
  }
}

// Thresholds for display (import from vocabulary would create circular dep)
const THRESHOLDS = { totalUsesToKnow: 5 };

export function printNPCsAndPets(state: GameState): void {
  const npcsHere = getNPCsInLocation(state.location.id);
  const petsHere = getPetsInLocation(state.location.id, state.petLocations);

  if (npcsHere.length > 0 || petsHere.length > 0) {
    console.log(`${COLORS.bold}Who's here:${COLORS.reset}`);

    for (const npc of npcsHere) {
      const npcState = state.npcState[npc.id];
      let status = '';
      if (npcState?.mood) status = ` ${COLORS.dim}(${npcState.mood})${COLORS.reset}`;
      console.log(`  • ${COLORS.cyan}${npc.name.spanish}${COLORS.reset} ${COLORS.dim}(${npc.name.english})${COLORS.reset}${status}`);
    }

    for (const pet of petsHere) {
      console.log(`  • ${pet.name.spanish} ${COLORS.dim}(${pet.name.english})${COLORS.reset}`);
    }

    console.log();
  }
}

export function printGameState(state: GameState): void {
  printLocation(state);
  printObjects(state);
  printNPCsAndPets(state);
  printAvailableVerbs(state);
  printNeeds(state);
  printLevel(state);
  printGoal(state.currentGoal, state.failedCurrentGoal);
  printInventory(state);
  printSeparator();
}

export function printPrompt(): void {
  process.stdout.write(`${COLORS.cyan}>${COLORS.reset} `);
}

export function printError(message: string): void {
  console.log(`${COLORS.red}Error:${COLORS.reset} ${message}`);
}

export function printDebugStateChange(label: string, data: unknown): void {
  console.log(`${COLORS.dim}[DEBUG ${label}]: ${JSON.stringify(data, null, 2)}${COLORS.reset}`);
}

export function printThinking(): void {
  process.stdout.write(`${COLORS.dim}Thinking...${COLORS.reset}`);
}

export function clearThinking(): void {
  process.stdout.write('\r' + ' '.repeat(20) + '\r');
}
