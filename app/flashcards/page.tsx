'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface FlashcardView {
  wordId: string;
  targetForms: string[];
  nativeForm: string;
  stage: 'new' | 'learning' | 'known';
  lastUsed: number;
  srsInterval: number;
}

interface FlashcardStats {
  due: number;
  encountered: number;
  learning: number;
  known: number;
}

function SpeakerIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const colors = {
    new: 'bg-gray-700 text-gray-300',
    learning: 'bg-blue-900/50 text-blue-300',
    known: 'bg-green-900/50 text-green-300',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colors[stage as keyof typeof colors] || colors.new}`}>
      {stage}
    </span>
  );
}

function timeAgo(timestamp: number): string {
  if (!timestamp) return 'never';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function FlashcardsContent() {
  const searchParams = useSearchParams();
  const profile = searchParams.get('profile') || '';
  const language = searchParams.get('language') || '';
  const module = searchParams.get('module') || '';

  const [cards, setCards] = useState<FlashcardView[]>([]);
  const [stats, setStats] = useState<FlashcardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [started, setStarted] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const backUrl = language && profile
    ? `/?resume=true&language=${encodeURIComponent(language)}&profile=${encodeURIComponent(profile)}`
    : '/';

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch(`/api/game/flashcards?profile=${encodeURIComponent(profile)}&language=${encodeURIComponent(language)}`);
      if (!res.ok) return;
      const data = await res.json();
      setCards(data.cards);
      setStats(data.stats);
    } finally {
      setLoading(false);
    }
  }, [profile, language]);

  useEffect(() => {
    if (profile && language) fetchCards();
  }, [profile, language, fetchCards]);

  const speak = useCallback(async (text: string) => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'alloy', language }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => URL.revokeObjectURL(url);
    } catch { /* ignore TTS errors */ }
  }, [language]);

  const handleRate = async (quality: number) => {
    const card = cards[currentIndex];
    if (!card || reviewing) return;
    setReviewing(true);

    try {
      await fetch('/api/game/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, language, wordId: card.wordId, quality }),
      });
    } catch { /* ignore */ }

    setReviewing(false);
    setRevealed(false);

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All done
      setCards([]);
      setStarted(false);
      fetchCards();
    }
  };

  const currentCard = cards[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-200 flex items-center justify-center">
        <div className="text-gray-500 animate-pulse">Loading flashcards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <a href={backUrl} className="text-gray-400 hover:text-gray-200 transition-colors text-sm flex items-center gap-1">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to game
        </a>
        <h1 className="text-lg font-bold text-violet-400">Flashcards</h1>
        <div className="w-20" />
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Not started: summary */}
        {!started && stats && (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <div className="text-6xl font-bold text-violet-400">{stats.due}</div>
              <div className="text-gray-400">cards due for review</div>
            </div>

            <div className="flex justify-center gap-6 text-sm">
              <div>
                <div className="text-blue-400 font-medium">{stats.learning}</div>
                <div className="text-gray-500">learning</div>
              </div>
              <div>
                <div className="text-green-400 font-medium">{stats.known}</div>
                <div className="text-gray-500">known</div>
              </div>
              <div>
                <div className="text-gray-300 font-medium">{stats.encountered}</div>
                <div className="text-gray-500">encountered</div>
              </div>
            </div>

            {stats.due > 0 ? (
              <button
                onClick={() => { setStarted(true); setCurrentIndex(0); setRevealed(false); }}
                className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors"
              >
                Start Review
              </button>
            ) : (
              <div className="text-gray-500 mt-4">
                No cards due right now. Keep playing to discover new words!
              </div>
            )}
          </div>
        )}

        {/* Reviewing */}
        {started && currentCard && (
          <div className="space-y-6">
            {/* Progress */}
            <div className="text-center text-sm text-gray-500">
              Card {currentIndex + 1} of {cards.length}
            </div>

            {/* Card */}
            <div
              className="bg-gray-900 border border-gray-700 rounded-xl p-8 min-h-[250px] flex flex-col items-center justify-center cursor-pointer select-none"
              onClick={() => { if (!revealed) { setRevealed(true); speak(currentCard.targetForms[0]); } }}
            >
              {/* Front: target word */}
              <div className="text-3xl font-bold text-white mb-4">
                {currentCard.targetForms[0]}
              </div>

              {currentCard.targetForms.length > 1 && (
                <div className="text-sm text-gray-500 mb-4">
                  {currentCard.targetForms.slice(1).join(', ')}
                </div>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); speak(currentCard.targetForms[0]); }}
                className="text-gray-500 hover:text-violet-400 transition-colors mb-4"
                title="Hear pronunciation"
              >
                <SpeakerIcon />
              </button>

              {!revealed && (
                <div className="text-gray-600 text-sm">Tap to reveal</div>
              )}

              {/* Back: native meaning */}
              {revealed && (
                <div className="border-t border-gray-700 pt-4 mt-2 w-full text-center space-y-2">
                  <div className="text-xl text-gray-200">{currentCard.nativeForm}</div>
                  <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                    <StageBadge stage={currentCard.stage} />
                    <span>Last used: {timeAgo(currentCard.lastUsed)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Rating buttons */}
            {revealed && (
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleRate(1)}
                  disabled={reviewing}
                  className="py-3 rounded-lg bg-red-900/40 hover:bg-red-900/60 text-red-300 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Again
                  <div className="text-xs text-red-400/60 mt-0.5">1d</div>
                </button>
                <button
                  onClick={() => handleRate(2)}
                  disabled={reviewing}
                  className="py-3 rounded-lg bg-orange-900/40 hover:bg-orange-900/60 text-orange-300 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Hard
                  <div className="text-xs text-orange-400/60 mt-0.5">
                    {Math.max(1, Math.round((currentCard.srsInterval || 1) * 1.2))}d
                  </div>
                </button>
                <button
                  onClick={() => handleRate(3)}
                  disabled={reviewing}
                  className="py-3 rounded-lg bg-green-900/40 hover:bg-green-900/60 text-green-300 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Good
                  <div className="text-xs text-green-400/60 mt-0.5">
                    {currentCard.srsInterval === 0 ? 1 : Math.round(currentCard.srsInterval * 2.5)}d
                  </div>
                </button>
                <button
                  onClick={() => handleRate(5)}
                  disabled={reviewing}
                  className="py-3 rounded-lg bg-blue-900/40 hover:bg-blue-900/60 text-blue-300 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Easy
                  <div className="text-xs text-blue-400/60 mt-0.5">
                    {currentCard.srsInterval === 0 ? 4 : Math.round(currentCard.srsInterval * 2.5 * 1.3)}d
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* All done */}
        {started && !currentCard && (
          <div className="text-center space-y-4">
            <div className="text-4xl">&#127881;</div>
            <div className="text-xl font-bold text-green-400">All done!</div>
            <div className="text-gray-400">You&apos;ve reviewed all due cards.</div>
            <a
              href={backUrl}
              className="inline-block px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors"
            >
              Back to game
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FlashcardsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 text-gray-200 flex items-center justify-center">
        <div className="text-gray-500 animate-pulse">Loading...</div>
      </div>
    }>
      <FlashcardsContent />
    </Suspense>
  );
}
