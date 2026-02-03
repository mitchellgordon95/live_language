import 'dotenv/config';
import * as dotenv from 'dotenv';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local (overrides .env)
dotenv.config({ path: '.env.local' });

import { createInitialState, learnWord } from './engine/game-state.js';
import { executeIntent, applyActionResult } from './engine/action-executor.js';
import { understandInput } from './ai/understanding.js';
import { bedroom, getStartGoal, getGoalById } from './data/home-basics.js';
import type { GameState, Goal, VocabularyProgress } from './engine/types.js';
import {
  recordWordUse,
  recordWordSeen,
  extractWordsFromText,
  getWordIdFromObject,
  createInitialVocabulary,
} from './engine/vocabulary.js';
import {
  clearScreen,
  printHeader,
  printGameState,
  printResults,
  printGoalComplete,
  printWelcome,
  printHelp,
  printVocab,
  printPrompt,
  printError,
  printThinking,
  clearThinking,
  printSeparator,
} from './ui/terminal.js';

const SAVE_FILE = 'vocabulary-progress.json';

let gameState: GameState;

function loadVocabularyProgress(): VocabularyProgress | undefined {
  try {
    if (fs.existsSync(SAVE_FILE)) {
      const data = fs.readFileSync(SAVE_FILE, 'utf-8');
      return JSON.parse(data) as VocabularyProgress;
    }
  } catch (error) {
    console.error('Could not load vocabulary progress:', error);
  }
  return undefined;
}

function saveVocabularyProgress(vocab: VocabularyProgress): void {
  try {
    fs.writeFileSync(SAVE_FILE, JSON.stringify(vocab, null, 2));
  } catch (error) {
    console.error('Could not save vocabulary progress:', error);
  }
}

async function main(): Promise<void> {
  // Load existing vocabulary progress or create new
  const existingVocab = loadVocabularyProgress();

  // Initialize game state
  gameState = createInitialState(bedroom, getStartGoal(), existingVocab);

  // Set up readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Initial display
  clearScreen();
  printHeader();
  printWelcome();
  printSeparator();
  printGameState(gameState);
  printPrompt();

  // Main game loop
  rl.on('line', async (input) => {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      printPrompt();
      return;
    }

    // Handle special commands
    if (trimmedInput.startsWith('/')) {
      handleCommand(trimmedInput);
      printPrompt();
      return;
    }

    // Process Spanish input
    await processInput(trimmedInput);
    printPrompt();
  });

  rl.on('close', () => {
    saveVocabularyProgress(gameState.vocabulary);
    console.log('\n¡Hasta luego! (See you later!)');
    console.log('Vocabulary progress saved.');
    process.exit(0);
  });
}

function handleCommand(command: string): void {
  switch (command.toLowerCase()) {
    case '/help':
      printHelp();
      break;
    case '/quit':
    case '/exit':
      saveVocabularyProgress(gameState.vocabulary);
      console.log('\n¡Hasta luego! (See you later!)');
      console.log('Vocabulary progress saved.');
      process.exit(0);
      break;
    case '/vocab':
      printVocab(gameState);
      break;
    case '/hint':
      if (gameState.currentGoal?.hint) {
        console.log(`💡 Hint: ${gameState.currentGoal.hint}`);
      } else {
        console.log('No hint available for current goal.');
      }
      console.log();
      break;
    case '/status':
      clearScreen();
      printHeader();
      printGameState(gameState);
      break;
    default:
      console.log(`Unknown command: ${command}`);
      console.log('Type /help for available commands.');
      console.log();
  }
}

async function processInput(input: string): Promise<void> {
  console.log();
  printThinking();

  try {
    // Get AI understanding of input
    const understanding = await understandInput(input, gameState);
    clearThinking();

    // Execute all intents sequentially
    const results: { intent: typeof understanding.intents[0]; result: Awaited<ReturnType<typeof executeIntent>> }[] = [];
    let allSucceeded = true;

    for (const intent of understanding.intents) {
      const result = await executeIntent(intent, gameState);
      results.push({ intent, result });

      if (result.success) {
        gameState = applyActionResult(gameState, result);
      } else {
        allSucceeded = false;
        // Stop executing further intents if one fails
        break;
      }
    }

    // Track vocabulary usage
    if (allSucceeded && understanding.understood) {
      if (understanding.grammar.score >= 80) {
        const wordsUsed = extractWordsFromText(input, gameState.vocabulary);
        for (const wordId of wordsUsed) {
          gameState = {
            ...gameState,
            vocabulary: recordWordUse(gameState.vocabulary, wordId, true),
          };
        }
      } else {
        // Understood but grammar issues - still counts as exposure but not "correct"
        const wordsUsed = extractWordsFromText(input, gameState.vocabulary);
        for (const wordId of wordsUsed) {
          gameState = {
            ...gameState,
            vocabulary: recordWordSeen(gameState.vocabulary, wordId),
          };
        }
      }

      // Also record words from AI's model response as exposure
      if (understanding.response.spanishModel) {
        const modelWords = extractWordsFromText(
          understanding.response.spanishModel,
          gameState.vocabulary
        );
        for (const wordId of modelWords) {
          gameState = {
            ...gameState,
            vocabulary: recordWordSeen(gameState.vocabulary, wordId),
          };
        }
      }
    } else if (!allSucceeded) {
      // Player failed - show hint next time
      gameState = { ...gameState, failedCurrentGoal: true };
    }

    // Display results and feedback
    printResults(understanding, results);

    // Check goal completion - keep advancing while goals are already satisfied
    while (gameState.currentGoal && gameState.currentGoal.checkComplete(gameState)) {
      const completedGoal = gameState.currentGoal;
      printGoalComplete(completedGoal);

      // Advance to next goal
      if (completedGoal.nextGoalId) {
        const nextGoal = getGoalById(completedGoal.nextGoalId);
        gameState = {
          ...gameState,
          completedGoals: [...gameState.completedGoals, completedGoal.id],
          currentGoal: nextGoal || null,
          failedCurrentGoal: false,  // Reset hint visibility for new goal
        };
      } else {
        break;
      }
    }

    // Show updated game state
    printSeparator();
    printGameState(gameState);
  } catch (error) {
    clearThinking();
    printError(error instanceof Error ? error.message : 'An error occurred');
    console.log();
  }
}

// Run the game
main().catch(console.error);
