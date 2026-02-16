'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface ModuleRow {
  id: string;
  profile: string;
  languageId: string;
  title: string;
  description: string | null;
  moduleData: Record<string, unknown>;
  assetStatus: string;
  status: string;
}

interface LocationData {
  id: string;
  name: { target: string; native: string };
  exits: Array<{ to: string; name: { target: string; native: string } }>;
  verbs?: Array<{ target: string; native: string }>;
}

interface ObjectData {
  id: string;
  name: { target: string; native: string };
  location: string;
  tags: string[];
  needsEffect?: Record<string, number>;
}

interface NPCData {
  id: string;
  name: { target: string; native: string };
  location: string;
  personality: string;
  gender?: string;
  isPet?: boolean;
  appearance?: string;
}

interface QuestData {
  id: string;
  title: { target: string; native: string };
  description: string;
  completionHint: string;
  reward: { points?: number; badge?: { id: string; name: string } };
  prereqs?: string[];
}

interface VocabData {
  target: string;
  native: string;
  category: string;
  gender?: string;
}

type Tab = 'overview' | 'locations' | 'objects' | 'npcs' | 'quests' | 'vocabulary' | 'guidance';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'locations', label: 'Locations' },
  { id: 'objects', label: 'Objects' },
  { id: 'npcs', label: 'NPCs' },
  { id: 'quests', label: 'Quests' },
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'guidance', label: 'AI Prompt' },
];

export default function ModuleExplorer() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;
  const [mod, setMod] = useState<ModuleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    fetch(`/api/modules/${moduleId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setMod(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [moduleId]);

  const handlePlay = useCallback(() => {
    if (!mod) return;
    // Navigate to game with this module
    const profile = localStorage.getItem('profile') || 'anon';
    const url = `/?play=${mod.id}&language=${mod.languageId}&profile=${encodeURIComponent(profile)}`;
    router.push(url);
  }, [mod, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading module...</div>
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">Module not found</div>
          <button onClick={() => router.push('/create')} className="text-blue-400 hover:text-blue-300">
            Create a new module
          </button>
        </div>
      </div>
    );
  }

  const data = mod.moduleData;
  const locations = (data.locations || {}) as Record<string, LocationData>;
  const objects = (data.objects || []) as ObjectData[];
  const npcs = (data.npcs || []) as NPCData[];
  const quests = (data.quests || []) as QuestData[];
  const vocabulary = (data.vocabulary || []) as VocabData[];
  const guidance = (data.guidance || '') as string;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/create')} className="text-gray-500 hover:text-gray-300 text-sm">
            ← Back
          </button>
          <h1 className="text-lg font-semibold">{mod.title}</h1>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{mod.languageId}</span>
        </div>
        <button
          onClick={handlePlay}
          className="px-4 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
        >
          Play Module
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 px-6 flex gap-1 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm transition-colors border-b-2 ${
              tab === t.id
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 max-w-5xl mx-auto">
        {tab === 'overview' && (
          <div className="space-y-6">
            {mod.description && <p className="text-gray-400">{mod.description}</p>}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Locations" value={Object.keys(locations).length} />
              <StatCard label="Objects" value={objects.length} />
              <StatCard label="NPCs" value={npcs.length} />
              <StatCard label="Vocabulary" value={vocabulary.length} />
            </div>

            {/* Location Graph */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Location Map</h3>
              <div className="bg-gray-900 rounded-xl p-4">
                {Object.values(locations).map(loc => (
                  <div key={loc.id} className="flex items-center gap-3 py-2">
                    <div className="bg-cyan-900/30 text-cyan-300 px-3 py-1 rounded text-sm font-medium min-w-[140px]">
                      {loc.name.native}
                    </div>
                    <span className="text-gray-600">→</span>
                    <div className="flex flex-wrap gap-1.5">
                      {loc.exits.map(exit => (
                        <span key={exit.to} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                          {exit.name.native}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick NPC list */}
            {npcs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Characters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {npcs.map(npc => (
                    <div key={npc.id} className="bg-gray-900 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-medium">{npc.name.target}</span>
                        <span className="text-gray-500 text-sm">({npc.name.native})</span>
                        {npc.isPet && <span className="text-xs bg-purple-900/30 text-purple-300 px-1.5 py-0.5 rounded">pet</span>}
                      </div>
                      <div className="text-gray-500 text-sm mt-1 line-clamp-2">{npc.personality}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'locations' && (
          <div className="space-y-4">
            {Object.values(locations).map(loc => (
              <div key={loc.id} className="bg-gray-900 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-cyan-400 font-semibold">{loc.name.target}</h3>
                  <span className="text-gray-500">({loc.name.native})</span>
                  <span className="text-xs text-gray-600 ml-auto">{loc.id}</span>
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  <span className="text-gray-600">Exits:</span>{' '}
                  {loc.exits.map(e => e.name.native).join(', ')}
                </div>
                <div className="text-sm text-gray-400">
                  <span className="text-gray-600">Objects:</span>{' '}
                  {objects.filter(o => o.location === loc.id).map(o => o.name.native).join(', ') || 'none'}
                </div>
                {loc.verbs && loc.verbs.length > 0 && (
                  <div className="text-sm text-gray-400 mt-1">
                    <span className="text-gray-600">Verbs:</span>{' '}
                    {loc.verbs.map(v => `${v.target} (${v.native})`).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'objects' && (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
              {objects.map(obj => (
                <div key={obj.id} className="bg-gray-900 rounded-lg px-4 py-2.5 flex items-center gap-3">
                  <div className="min-w-[200px]">
                    <span className="text-gray-200">{obj.name.target}</span>
                    <span className="text-gray-500 ml-1.5 text-sm">({obj.name.native})</span>
                  </div>
                  <span className="text-xs text-gray-600">@{obj.location}</span>
                  {obj.tags.length > 0 && (
                    <div className="flex gap-1 ml-auto">
                      {obj.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  )}
                  {obj.needsEffect && (
                    <span className="text-xs text-green-400 ml-2">
                      {Object.entries(obj.needsEffect).map(([k, v]) => `${k}+${v}`).join(' ')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'npcs' && (
          <div className="space-y-4">
            {npcs.map(npc => (
              <div key={npc.id} className="bg-gray-900 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-yellow-400 font-semibold">{npc.name.target}</h3>
                  <span className="text-gray-500">({npc.name.native})</span>
                  {npc.gender && <span className="text-xs text-gray-600">{npc.gender}</span>}
                  {npc.isPet && <span className="text-xs bg-purple-900/30 text-purple-300 px-1.5 py-0.5 rounded">pet</span>}
                  <span className="text-xs text-gray-600 ml-auto">@{npc.location}</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{npc.personality}</p>
                {npc.appearance && (
                  <p className="text-gray-600 text-xs">Appearance: {npc.appearance}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'quests' && (
          <div className="space-y-4">
            {quests.length === 0 && <div className="text-gray-500">No quests defined.</div>}
            {quests.map(q => (
              <div key={q.id} className="bg-gray-900 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-green-400 font-semibold">{q.title.target}</h3>
                  <span className="text-gray-500">({q.title.native})</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{q.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                  {q.reward.points && <span>Reward: {q.reward.points} pts</span>}
                  {q.reward.badge && <span>Badge: {q.reward.badge.name}</span>}
                  {q.prereqs && q.prereqs.length > 0 && <span>Requires: {q.prereqs.join(', ')}</span>}
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  AI hint: {q.completionHint}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'vocabulary' && (
          <div>
            <div className="grid grid-cols-1 gap-0.5">
              <div className="grid grid-cols-4 gap-4 px-4 py-2 text-xs text-gray-600 uppercase tracking-wider font-semibold">
                <div>Target</div>
                <div>English</div>
                <div>Category</div>
                <div>Gender</div>
              </div>
              {vocabulary.map((v, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 px-4 py-1.5 bg-gray-900/50 rounded text-sm">
                  <div className="text-gray-200">{v.target}</div>
                  <div className="text-gray-400">{v.native}</div>
                  <div className="text-gray-500">{v.category}</div>
                  <div className="text-gray-600">{v.gender || '-'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'guidance' && (
          <div className="bg-gray-900 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">AI System Prompt</h3>
            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">{guidance}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-900 rounded-lg p-3 text-center">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}
