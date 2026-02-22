'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

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

interface TrophyData {
  vocabByModule: VocabModuleStats[];
  vocabCounts: { new: number; learning: number; known: number };
  grammarStats: Record<string, { correct: number; total: number }>;
  questBadges: QuestBadge[];
  badges: string[];
  completedQuests: number;
  level: number;
  totalPoints: number;
  locationsVisited: number;
}

const GRAMMAR_LABELS: Record<string, string> = {
  conjugation: 'Verb Conjugation',
  gender: 'Gender Agreement',
  article: 'Article Usage',
  word_order: 'Word Order',
  contraction: 'Contractions',
  spelling: 'Spelling',
  accent: 'Accent Marks',
  preposition: 'Prepositions',
  pronoun: 'Pronouns',
  tense: 'Verb Tense',
  other: 'Other',
};

function getTier(pct: number): { name: string; color: string; bg: string } {
  if (pct >= 100) return { name: 'Platinum', color: 'text-cyan-300', bg: 'bg-cyan-500/20' };
  if (pct >= 75) return { name: 'Gold', color: 'text-amber-300', bg: 'bg-amber-500/20' };
  if (pct >= 50) return { name: 'Silver', color: 'text-gray-300', bg: 'bg-gray-400/20' };
  if (pct >= 25) return { name: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-500/20' };
  return { name: '', color: 'text-gray-600', bg: 'bg-gray-800/50' };
}

function TrophiesContent() {
  const searchParams = useSearchParams();
  const profile = searchParams.get('profile');
  const language = searchParams.get('language');
  const module = searchParams.get('module');
  const backUrl = language && profile
    ? `/?resume=true&language=${encodeURIComponent(language)}&profile=${encodeURIComponent(profile)}`
    : '/';
  const [data, setData] = useState<TrophyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'vocab' | 'grammar' | 'quests'>('vocab');

  useEffect(() => {
    if (!profile || !language) return;
    fetch(`/api/game/trophies?profile=${encodeURIComponent(profile)}&language=${encodeURIComponent(language)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [profile, language]);

  if (!profile || !language) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-500">Missing profile or language parameters.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading trophies...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">No save data found. Play some turns first!</div>
          <a href={backUrl} className="text-blue-400 hover:text-blue-300">Back to game</a>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'vocab' as const, label: 'Vocabulary', count: data.vocabCounts.learning + data.vocabCounts.known },
    { id: 'grammar' as const, label: 'Grammar', count: Object.keys(data.grammarStats).length },
    { id: 'quests' as const, label: 'Quest Badges', count: data.questBadges.filter(b => b.earned).length },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href={backUrl} className="text-gray-500 hover:text-gray-300 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </a>
            <h1 className="text-lg font-bold text-amber-400">Trophies</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>Lvl {data.level}</span>
            <span>{data.totalPoints} pts</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 text-xs ${activeTab === tab.id ? 'text-amber-400/70' : 'text-gray-600'}`}>
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {activeTab === 'vocab' && <VocabSection data={data} />}
        {activeTab === 'grammar' && <GrammarSection data={data} />}
        {activeTab === 'quests' && <QuestsSection data={data} />}
      </div>
    </div>
  );
}

function VocabSection({ data }: { data: TrophyData }) {
  const totalLearned = data.vocabCounts.learning + data.vocabCounts.known;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{data.vocabCounts.new}</div>
          <div className="text-xs text-gray-500 mt-1">New</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{data.vocabCounts.learning}</div>
          <div className="text-xs text-gray-500 mt-1">Learning</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{data.vocabCounts.known}</div>
          <div className="text-xs text-gray-500 mt-1">Mastered</div>
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">Milestones</h3>
        <div className="space-y-2">
          {[
            { n: 5, label: 'First Words', icon: '\u{2B50}' },
            { n: 10, label: 'Getting There', icon: '\u{1F31F}' },
            { n: 25, label: 'Word Collector', icon: '\u{1F4DA}' },
            { n: 50, label: 'Vocabulary Builder', icon: '\u{1F3C6}' },
            { n: 100, label: 'Polyglot', icon: '\u{1F451}' },
          ].map(t => {
            const unlocked = totalLearned >= t.n;
            const pct = Math.min(100, Math.round((totalLearned / t.n) * 100));
            return (
              <div key={t.n} className={`flex items-center gap-3 p-3 rounded-lg ${unlocked ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-gray-900 border border-gray-800'}`}>
                <span className="text-xl w-8 text-center">{unlocked ? t.icon : '\u{1F512}'}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${unlocked ? 'text-amber-300' : 'text-gray-600'}`}>{t.label}</div>
                  <div className="mt-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${unlocked ? 'bg-amber-400' : 'bg-gray-700'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-500 tabular-nums">{Math.min(totalLearned, t.n)}/{t.n}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-module vocab */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">By Module</h3>
        <div className="space-y-3">
          {data.vocabByModule.map(mod => {
            const learned = mod.learning + mod.known;
            const pct = mod.total > 0 ? Math.round((learned / mod.total) * 100) : 0;
            const tier = getTier(pct);
            return (
              <div key={mod.moduleName} className={`rounded-lg p-4 border ${tier.bg} ${pct > 0 ? 'border-gray-700' : 'border-gray-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-200 capitalize">{mod.displayName}</span>
                    {tier.name && (
                      <span className={`ml-2 text-xs ${tier.color}`}>{tier.name}</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{learned}/{mod.total} words</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full flex">
                    {mod.known > 0 && (
                      <div
                        className="bg-green-500 h-full"
                        style={{ width: `${(mod.known / mod.total) * 100}%` }}
                      />
                    )}
                    {mod.learning > 0 && (
                      <div
                        className="bg-yellow-500 h-full"
                        style={{ width: `${(mod.learning / mod.total) * 100}%` }}
                      />
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Mastered: {mod.known}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />Learning: {mod.learning}</span>
                </div>
              </div>
            );
          })}
          {data.vocabByModule.length === 0 && (
            <div className="text-sm text-gray-600 text-center py-4">No vocabulary modules available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function GrammarSection({ data }: { data: TrophyData }) {
  const entries = Object.entries(data.grammarStats).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="space-y-6">
      {entries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">{'\u{1F4DD}'}</div>
          <div className="text-gray-500">No grammar data yet.</div>
          <div className="text-gray-600 text-sm mt-1">Play some turns and your grammar accuracy will be tracked here.</div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            Grammar accuracy is tracked each turn. When you use a concept correctly, your accuracy goes up.
            When the AI corrects you, it goes down.
          </p>
          <div className="space-y-3">
            {entries.map(([type, stats]) => {
              const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
              const tier = getTier(pct);
              const label = GRAMMAR_LABELS[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
              return (
                <div key={type} className={`rounded-lg p-4 border ${tier.bg} ${pct >= 25 ? 'border-gray-700' : 'border-gray-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-200">{label}</span>
                      {tier.name && (
                        <span className={`ml-2 text-xs ${tier.color}`}>{tier.name}</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{pct}% accuracy</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : pct >= 25 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{stats.correct} correct out of {stats.total} uses</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function QuestsSection({ data }: { data: TrophyData }) {
  const earned = data.questBadges.filter(b => b.earned);
  const locked = data.questBadges.filter(b => !b.earned);

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center flex-1">
          <div className="text-2xl font-bold text-purple-400">{data.completedQuests}</div>
          <div className="text-xs text-gray-500 mt-1">Quests Completed</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center flex-1">
          <div className="text-2xl font-bold text-pink-400">{earned.length}</div>
          <div className="text-xs text-gray-500 mt-1">Badges Earned</div>
        </div>
      </div>

      {/* Badge collection */}
      {data.questBadges.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">{'\u{1F3AB}'}</div>
          <div className="text-gray-500">No quest badges available yet.</div>
          <div className="text-gray-600 text-sm mt-1">Complete quests to earn badges and stickers!</div>
        </div>
      ) : (
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">Badge Collection</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {earned.map(badge => (
              <div key={badge.id} className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">{'\u{1F3C5}'}</div>
                <div className="font-medium text-purple-300 text-sm">{badge.name}</div>
                <div className="text-xs text-gray-500 mt-1">{badge.questTitle}</div>
              </div>
            ))}
            {locked.map(badge => (
              <div key={badge.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center opacity-50">
                <div className="text-3xl mb-2">{'\u{2753}'}</div>
                <div className="font-medium text-gray-600 text-sm">???</div>
                <div className="text-xs text-gray-700 mt-1">Complete a quest to unlock</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrophiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading trophies...</div>
      </div>
    }>
      <TrophiesContent />
    </Suspense>
  );
}
