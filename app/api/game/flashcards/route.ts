import { NextResponse } from 'next/server';
import { loadGame, saveGame } from '@/lib/db';
import { getLanguage } from '@/src/languages/index';
import { setActiveModules } from '@/src/data/module-registry';
import { getDueWords, reviewWord } from '@/src/engine/vocabulary';
import type { VocabularyProgress } from '@/src/engine/types';

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
  const vocab: VocabularyProgress = state.vocabulary || { words: {}, sessionCount: 0, lastSessionDate: 0 };

  // Backfill SRS fields for old saves
  for (const w of Object.values(vocab.words) as any[]) {
    if (w.srsInterval === undefined) w.srsInterval = 0;
    if (w.srsEase === undefined) w.srsEase = 2.5;
    if (w.srsNextReview === undefined) w.srsNextReview = 0;
    if (w.srsDueCount === undefined) w.srsDueCount = 0;
  }

  const dueWords = getDueWords(vocab);

  const cards = dueWords.map(w => ({
    wordId: w.wordId,
    targetForms: w.targetForms,
    nativeForm: w.nativeForm,
    stage: w.stage,
    lastUsed: w.lastUsed,
    srsInterval: w.srsInterval,
  }));

  // Count stats
  const allWords = Object.values(vocab.words);
  const encountered = allWords.filter(w => w.timesUsedCorrectly > 0 || w.timesSeenInContext > 0);

  return NextResponse.json({
    cards,
    stats: {
      due: cards.length,
      encountered: encountered.length,
      learning: encountered.filter(w => w.stage === 'learning').length,
      known: encountered.filter(w => w.stage === 'known').length,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { profile, language, wordId, quality } = body;

  if (!profile || !language || !wordId || quality === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
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

  // Backfill SRS fields
  if (state.vocabulary?.words) {
    for (const w of Object.values(state.vocabulary.words) as any[]) {
      if (w.srsInterval === undefined) w.srsInterval = 0;
      if (w.srsEase === undefined) w.srsEase = 2.5;
      if (w.srsNextReview === undefined) w.srsNextReview = 0;
      if (w.srsDueCount === undefined) w.srsDueCount = 0;
    }
  }

  const updatedVocab = reviewWord(state.vocabulary, wordId, quality);
  state.vocabulary = updatedVocab;

  await saveGame(profile, save.module || 'home', language, state);

  const reviewed = updatedVocab.words[wordId];
  return NextResponse.json({
    reviewed: reviewed ? {
      wordId: reviewed.wordId,
      srsInterval: reviewed.srsInterval,
      srsNextReview: reviewed.srsNextReview,
    } : null,
  });
}
