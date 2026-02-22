'use client';

import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAssetGeneration, type ItemStatus } from '@/hooks/useAssetGeneration';

type View = 'listing' | 'wizard';
type WizardStep = 'describe' | 'directions' | 'generating';

// Module generation phases (sequential)
type ModulePhase = 'curriculum' | 'world' | 'characters' | 'guidance';
type PhaseStatus = 'pending' | 'generating' | 'done' | 'failed';

const MODULE_PHASES: Array<{ id: ModulePhase; label: string }> = [
  { id: 'curriculum', label: 'Curriculum & Vocabulary' },
  { id: 'world', label: 'Locations & Objects' },
  { id: 'characters', label: 'Characters & Quests' },
  { id: 'guidance', label: 'AI Teaching Guide' },
];

interface Direction {
  title: string;
  setting: string;
  vocabFocus: string;
  locationCount: number;
  locations: string[];
  npcIdeas: string[];
}

interface ModuleEntry {
  id: string;
  languageId: string;
  title: string;
  description: string | null;
  moduleData: {
    locations?: Record<string, unknown>;
    npcs?: unknown[];
    objects?: unknown[];
    vocabulary?: unknown[];
    quests?: unknown[];
  };
  updatedAt: string;
}

const LANGUAGES = [
  { id: 'spanish', name: 'Spanish', flag: '\u{1F1EA}\u{1F1F8}' },
  { id: 'mandarin', name: 'Mandarin Chinese', flag: '\u{1F1E8}\u{1F1F3}' },
  { id: 'hindi', name: 'Hindi', flag: '\u{1F1EE}\u{1F1F3}' },
  { id: 'portuguese', name: 'Brazilian Portuguese', flag: '\u{1F1E7}\u{1F1F7}' },
];

const BUILT_IN_MODULES = [
  {
    id: 'home',
    title: 'Home',
    description: 'Wake up, explore your apartment, interact with your roommate and pets. Learn daily routine vocabulary.',
    thumbnail: (lang: string) => `/scenes/${lang}/home/living_room.png`,
  },
];

function StatusIcon({ status }: { status: ItemStatus | PhaseStatus }) {
  switch (status) {
    case 'pending':
      return <span className="text-gray-600">&#9675;</span>;
    case 'generating':
      return <span className="text-blue-400 animate-spin inline-block">&#9696;</span>;
    case 'done':
      return <span className="text-green-400">&#10003;</span>;
    case 'failed':
      return <span className="text-red-400">&#10007;</span>;
  }
}

function ProgressSection({ title, progress }: { title: string; progress: Record<string, ItemStatus> }) {
  const entries = Object.entries(progress);
  if (entries.length === 0) return null;
  const done = entries.filter(([, s]) => s === 'done').length;
  return (
    <div className="mb-4">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
        {title} ({done}/{entries.length})
      </div>
      <div className="space-y-1">
        {entries.map(([id, status]) => (
          <div key={id} className="flex items-center gap-2 text-sm">
            <StatusIcon status={status} />
            <span className={status === 'generating' ? 'text-blue-300' : status === 'done' ? 'text-gray-400' : 'text-gray-600'}>
              {id.includes(':') ? `${id.split(':')[0]} (${id.split(':')[1]})` : id}
            </span>
            {status === 'generating' && <span className="text-blue-400/60 text-xs">generating...</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ModulesPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <ModulesPage />
    </Suspense>
  );
}

function ModulesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>('listing');

  // Listing state
  const [modules, setModules] = useState<ModuleEntry[]>([]);
  const [listLoading, setListLoading] = useState(true);

  // Wizard state
  const [step, setStep] = useState<WizardStep>('describe');
  const initialLang = searchParams.get('language') || 'spanish';
  const [languageId, setLanguageId] = useState(initialLang);
  const returnModule = searchParams.get('module');
  const returnProfile = searchParams.get('profile');
  const backUrl = initialLang && returnProfile
    ? `/?resume=true&language=${encodeURIComponent(initialLang)}&profile=${encodeURIComponent(returnProfile)}`
    : '/';
  const [description, setDescription] = useState('');
  const [directions, setDirections] = useState<Direction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);

  // Module generation phases
  const [phaseStatus, setPhaseStatus] = useState<Record<ModulePhase, PhaseStatus>>({
    curriculum: 'pending',
    world: 'pending',
    characters: 'pending',
    guidance: 'pending',
  });
  const [generationStage, setGenerationStage] = useState<'module' | 'assets'>('module');

  // Created module (for assets stage)
  const [createdModuleId, setCreatedModuleId] = useState<string | null>(null);
  const [createdModuleData, setCreatedModuleData] = useState<Record<string, unknown> | null>(null);
  const [createdTitle, setCreatedTitle] = useState('');

  // Asset generation hook
  const assetGen = useAssetGeneration(createdModuleId, createdModuleData);
  const assetStartedRef = useRef(false);

  // Load modules on mount and when language changes
  useEffect(() => {
    const profile = localStorage.getItem('profile');
    if (!profile) { setListLoading(false); return; }
    setListLoading(true);
    fetch(`/api/modules?profile=${encodeURIComponent(profile)}&language=${encodeURIComponent(languageId)}`)
      .then(r => r.ok ? r.json() : { modules: [] })
      .then(data => setModules(data.modules || []))
      .catch(() => {})
      .finally(() => setListLoading(false));
  }, [languageId]);

  // Auto-start asset generation when module design is done
  useEffect(() => {
    if (generationStage === 'assets' && createdModuleId && createdModuleData && !assetStartedRef.current) {
      assetStartedRef.current = true;
      assetGen.startGeneration();
    }
  }, [generationStage, createdModuleId, createdModuleData, assetGen]);

  // Auto-redirect to gameplay when assets are done
  useEffect(() => {
    if (step !== 'generating' || generationStage !== 'assets' || assetGen.phase !== 'done' || !createdModuleId) return;
    const profile = localStorage.getItem('profile') || 'anon';
    const url = `/?play=${createdModuleId}&language=${encodeURIComponent(languageId)}&profile=${encodeURIComponent(profile)}`;
    const timer = setTimeout(() => router.push(url), 800);
    return () => clearTimeout(timer);
  }, [assetGen.phase, step, generationStage, createdModuleId, languageId, router]);

  // Warn before leaving during generation
  useEffect(() => {
    if (step !== 'generating') return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [step]);

  const handleBrainstorm = useCallback(async () => {
    if (!description.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/modules/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, languageId }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to brainstorm');
      const data = await res.json();
      setDirections(data.directions);
      setStep('directions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to brainstorm');
    } finally {
      setIsLoading(false);
    }
  }, [description, languageId]);

  const handleGenerate = useCallback(async (direction: Direction) => {
    setSelectedDirection(direction);
    setStep('generating');
    setGenerationStage('module');
    setIsLoading(true);
    setError(null);

    // Reset phase statuses
    setPhaseStatus({
      curriculum: 'pending',
      world: 'pending',
      characters: 'pending',
      guidance: 'pending',
    });

    try {
      // Run 4 module generation phases sequentially
      const phases: ModulePhase[] = ['curriculum', 'world', 'characters', 'guidance'];
      let accumulated: Record<string, unknown> = {};

      for (const phase of phases) {
        setPhaseStatus(prev => ({ ...prev, [phase]: 'generating' }));

        const res = await fetch('/api/modules/generate-phase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phase,
            direction,
            languageId,
            userDescription: description,
            previousData: accumulated,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Failed to generate ${phase}`);
        }

        const { data } = await res.json();
        accumulated = { ...accumulated, ...data };
        setPhaseStatus(prev => ({ ...prev, [phase]: 'done' }));
      }

      // Save assembled module to DB
      const profile = localStorage.getItem('profile') || ('anon_' + Math.random().toString(36).substring(2, 10));
      localStorage.setItem('profile', profile);
      const id = 'ugc_' + Math.random().toString(36).substring(2, 12);
      const title = (accumulated.displayName as string) || (accumulated.name as string) || 'Untitled Module';

      const saveRes = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, profile, languageId, title, description, moduleData: accumulated }),
      });
      if (!saveRes.ok) throw new Error((await saveRes.json()).error || 'Failed to save');

      // Transition to asset generation stage
      setCreatedModuleId(id);
      setCreatedModuleData(accumulated);
      setCreatedTitle(title);
      assetStartedRef.current = false;
      setGenerationStage('assets');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate module');
      setStep('directions');
    } finally {
      setIsLoading(false);
    }
  }, [languageId, description]);

  const startWizard = useCallback(() => {
    setView('wizard');
    setStep('describe');
    setDescription('');
    setDirections([]);
    setError(null);
    setSelectedDirection(null);
    setCreatedModuleId(null);
    setCreatedModuleData(null);
    setGenerationStage('module');
    assetStartedRef.current = false;
  }, []);

  const handlePlayAnyway = useCallback(() => {
    if (!createdModuleId) return;
    const profile = localStorage.getItem('profile') || 'anon';
    const url = `/?play=${createdModuleId}&language=${encodeURIComponent(languageId)}&profile=${encodeURIComponent(profile)}`;
    router.push(url);
  }, [createdModuleId, languageId, router]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => view === 'wizard' ? setView('listing') : router.push(backUrl)} className="text-gray-500 hover:text-gray-300 text-sm">
            &larr; {view === 'wizard' ? 'Back' : backUrl === '/' ? 'Home' : 'Back to Game'}
          </button>
          <h1 className="text-lg font-semibold">{view === 'wizard' ? 'New Module' : 'Modules'}</h1>
        </div>
        {view === 'listing' && (
          <button
            onClick={startWizard}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
          >
            + New Module
          </button>
        )}
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Listing View */}
      {view === 'listing' && (
        <div className="max-w-3xl mx-auto px-6 pt-8">
          {/* Built-in Modules */}
          <div className="mb-8">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Built-in</h2>
            <div className="space-y-3">
              {BUILT_IN_MODULES.map(mod => {
                const profile = typeof window !== 'undefined' ? localStorage.getItem('profile') || '' : '';
                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      const url = `/?play=${mod.id}&language=${encodeURIComponent(languageId)}${profile ? `&profile=${encodeURIComponent(profile)}` : ''}`;
                      window.location.href = url;
                    }}
                    className="w-full text-left p-4 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors flex gap-4 items-center"
                  >
                    <img
                      src={mod.thumbnail(languageId)}
                      alt={mod.title}
                      className="w-20 h-14 object-cover rounded-lg shrink-0"
                    />
                    <div>
                      <h3 className="font-semibold text-white">{mod.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-1">{mod.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* UGC Modules */}
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Custom Modules</h2>
          {listLoading ? (
            <div className="text-gray-400 animate-pulse text-center pt-8">Loading modules...</div>
          ) : modules.length === 0 ? (
            <div className="text-center pt-8 pb-8">
              <div className="text-gray-600 text-sm mb-3">No custom modules yet</div>
              <button
                onClick={startWizard}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
              >
                Create your first module
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map(mod => {
                const locs = mod.moduleData.locations ? Object.keys(mod.moduleData.locations).length : 0;
                const npcs = mod.moduleData.npcs ? (mod.moduleData.npcs as unknown[]).length : 0;
                const vocab = mod.moduleData.vocabulary ? (mod.moduleData.vocabulary as unknown[]).length : 0;
                const quests = mod.moduleData.quests ? (mod.moduleData.quests as unknown[]).length : 0;
                const lang = LANGUAGES.find(l => l.id === mod.languageId);
                const profile = typeof window !== 'undefined' ? localStorage.getItem('profile') || '' : '';
                return (
                  <div
                    key={mod.id}
                    className="flex items-center gap-2"
                  >
                    <button
                      onClick={() => {
                        const url = `/?play=${mod.id}&language=${encodeURIComponent(mod.languageId)}${profile ? `&profile=${encodeURIComponent(profile)}` : ''}`;
                        window.location.href = url;
                      }}
                      className="flex-1 text-left p-4 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{mod.title}</h3>
                        {lang && <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{lang.flag} {lang.name}</span>}
                      </div>
                      {mod.description && (
                        <p className="text-gray-500 text-sm mb-2 line-clamp-1">{mod.description}</p>
                      )}
                      <div className="flex gap-3 text-xs text-gray-600">
                        <span>{locs} locations</span>
                        <span>{npcs} NPCs</span>
                        <span>{quests} quests</span>
                        <span>{vocab} vocab</span>
                      </div>
                    </button>
                    <button
                      onClick={() => router.push(`/create/${mod.id}`)}
                      className="shrink-0 p-3 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors text-gray-400 hover:text-blue-400"
                      title="Edit module"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Wizard: Describe */}
      {view === 'wizard' && step === 'describe' && (
        <div className="max-w-lg mx-auto px-6 pt-16">
          <h2 className="text-2xl font-bold mb-2">What do you want to learn?</h2>
          <p className="text-gray-400 mb-6">Describe the vocabulary, grammar, or situations you want to practice.</p>

          <div className="mb-5">
            <label className="text-gray-500 text-xs block mb-2">Language</label>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setLanguageId(lang.id)}
                  className={`py-2 px-3 rounded-lg text-sm transition-colors border ${
                    languageId === lang.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                  }`}
                >
                  {lang.flag} {lang.name}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g., 'I want to learn how to order food at a restaurant' or 'Practice travel vocabulary at an airport'"
            className="w-full h-32 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
          />

          <button
            onClick={handleBrainstorm}
            disabled={isLoading || !description.trim()}
            className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Thinking...' : 'Generate Ideas'}
          </button>
        </div>
      )}

      {/* Wizard: Directions */}
      {view === 'wizard' && step === 'directions' && (
        <div className="max-w-2xl mx-auto px-6 pt-8">
          <h2 className="text-xl font-bold mb-1">Pick a direction</h2>
          <p className="text-gray-400 text-sm mb-6">Choose which module concept to build out.</p>

          <div className="space-y-4">
            {directions.map((dir, i) => (
              <button
                key={i}
                onClick={() => handleGenerate(dir)}
                disabled={isLoading}
                className="w-full text-left p-5 bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-xl transition-colors"
              >
                <h3 className="text-lg font-semibold text-white mb-1">{dir.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{dir.setting}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded">{dir.vocabFocus}</span>
                  <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{dir.locationCount} locations</span>
                  {dir.npcIdeas?.map((npc, j) => (
                    <span key={j} className="bg-yellow-900/30 text-yellow-300 px-2 py-0.5 rounded">{npc}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep('describe')}
            className="mt-4 text-gray-500 hover:text-gray-300 text-sm"
          >
            &larr; Try different description
          </button>
        </div>
      )}

      {/* Wizard: Generating (module design + assets in one view) */}
      {view === 'wizard' && step === 'generating' && (
        <div className="max-w-lg mx-auto px-6 pt-16">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-1">
              {createdTitle || selectedDirection?.title || 'New Module'}
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              {generationStage === 'module' ? 'Designing your module...' : 'Generating artwork...'}
              <span className="text-gray-600 ml-1">Usually takes about 2 minutes</span>
            </p>

            {/* Module design phases */}
            <div className="mb-5">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Module Design</div>
              <div className="space-y-1.5">
                {MODULE_PHASES.map(({ id, label }) => (
                  <div key={id} className="flex items-center gap-2 text-sm">
                    <StatusIcon status={phaseStatus[id]} />
                    <span className={
                      phaseStatus[id] === 'done' ? 'text-gray-400'
                        : phaseStatus[id] === 'generating' ? 'text-blue-300'
                        : 'text-gray-600'
                    }>
                      {label}
                    </span>
                    {phaseStatus[id] === 'generating' && (
                      <span className="text-blue-400/60 text-xs">generating...</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Asset generation (appears after module design completes) */}
            {generationStage === 'assets' && (
              <>
                {/* Progress bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>{assetGen.completedItems} of {assetGen.totalItems} assets</span>
                    <span>{assetGen.percentComplete}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${assetGen.percentComplete}%` }}
                    />
                  </div>
                </div>

                <ProgressSection title="Scenes" progress={assetGen.sceneProgress} />
                <ProgressSection title="Portraits" progress={assetGen.npcProgress} />
                <ProgressSection title="Object Vignettes" progress={assetGen.objectProgress} />
              </>
            )}

            {/* Done state with failures */}
            {assetGen.phase === 'done' && assetGen.failedItems > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="text-yellow-400 text-sm mb-3">
                  {assetGen.completedItems} of {assetGen.totalItems} assets generated. {assetGen.failedItems} failed.
                </div>
                <button
                  onClick={handlePlayAnyway}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
                >
                  Play anyway
                </button>
              </div>
            )}

            {/* Done — no failures (auto-redirects) */}
            {assetGen.phase === 'done' && assetGen.failedItems === 0 && (
              <div className="text-green-400 text-sm text-center mt-2">
                Ready! Starting game...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
