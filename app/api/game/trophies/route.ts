import { NextResponse } from 'next/server';
import { loadGame } from '@/lib/db';
import { getLanguage } from '@/src/languages/index';
import { setActiveModules } from '@/src/data/module-registry';

interface VocabModuleStats {
  moduleName: string;
  displayName: string;
  total: number;
  learning: number;
  known: number;
}

interface QuestBadge {
  id: string;
  name: string;
  questTitle: string;
  earned: boolean;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const profile = url.searchParams.get('profile');
  const language = url.searchParams.get('language');

  if (!profile || !language) {
    return NextResponse.json({ error: 'Missing profile or language' }, { status: 400 });
  }

  const languageConfig = getLanguage(language);
  if (!languageConfig) {
    return NextResponse.json({ error: 'Unknown language' }, { status: 400 });
  }
  setActiveModules(languageConfig.modules);

  const save = await loadGame(profile, language);
  if (!save) {
    return NextResponse.json({ error: 'No save found' }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const state = save.state as any;
  const vocabWords: Record<string, { stage: string }> = state.vocabulary?.words || {};

  // Vocab by module
  const vocabByModule: VocabModuleStats[] = [];
  for (const mod of languageConfig.modules) {
    if (mod.name === 'street' || mod.vocabulary.length === 0) continue;
    let learning = 0;
    let known = 0;
    for (const word of mod.vocabulary) {
      // Word IDs in the vocabulary tracker are the target form (stripped of articles)
      const wordId = word.target.replace(/^(el|la|los|las|un|una)\s+/i, '');
      const tracked = vocabWords[wordId] || vocabWords[word.target];
      if (tracked?.stage === 'known') known++;
      else if (tracked?.stage === 'learning') learning++;
    }
    vocabByModule.push({
      moduleName: mod.name,
      displayName: mod.displayName,
      total: mod.vocabulary.length,
      learning,
      known,
    });
  }

  // Grammar stats
  const grammarStats: Record<string, { correct: number; total: number }> = state.grammarStats || {};

  // Quest badges — collect all possible badges from all modules
  const questBadges: QuestBadge[] = [];
  const earnedBadges: string[] = state.badges || [];
  for (const mod of languageConfig.modules) {
    for (const quest of mod.quests) {
      if (quest.reward.badge) {
        questBadges.push({
          id: quest.reward.badge.id,
          name: quest.reward.badge.name,
          questTitle: quest.title.native,
          earned: earnedBadges.includes(quest.reward.badge.id),
        });
      }
    }
  }

  // Overall stats
  const totalVocabCounts = { new: 0, learning: 0, known: 0 };
  for (const w of Object.values(vocabWords)) {
    if (w.stage === 'known') totalVocabCounts.known++;
    else if (w.stage === 'learning') totalVocabCounts.learning++;
    else totalVocabCounts.new++;
  }

  return NextResponse.json({
    vocabByModule,
    vocabCounts: totalVocabCounts,
    grammarStats,
    questBadges,
    badges: earnedBadges,
    completedQuests: (state.completedQuests || []).length,
    level: state.level,
    totalPoints: state.totalPointsEarned || 0,
    locationsVisited: (state.visitedLocations || []).length,
  });
}
