'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface LocationAsset {
  imageUrl: string;
  coordinates: Record<string, { x: number; y: number; w: number; h: number }>;
}

interface ModuleRow {
  id: string;
  profile: string;
  languageId: string;
  title: string;
  description: string | null;
  moduleData: Record<string, unknown>;
  assetStatus: string;
  assets: Record<string, LocationAsset | { npcs: Record<string, string> }>;
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

interface ChatEntry {
  id: number;
  role: 'user' | 'assistant';
  content: string;
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

export default function ModuleEditor() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;

  // DB state
  const [mod, setMod] = useState<ModuleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  // Local editing state
  const [moduleData, setModuleData] = useState<Record<string, unknown> | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);

  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const chatIdRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Asset generation state
  type LocStatus = 'pending' | 'generating' | 'done' | 'failed';
  const [assetProgress, setAssetProgress] = useState<Record<string, LocStatus>>({});
  const [npcProgress, setNpcProgress] = useState<Record<string, LocStatus>>({});
  const [objVigProgress, setObjVigProgress] = useState<Record<string, LocStatus>>({});
  const [isGeneratingAssets, setIsGeneratingAssets] = useState(false);

  // Load module from DB
  useEffect(() => {
    fetch(`/api/modules/${moduleId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setMod(data);
          setModuleData(data.moduleData);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [moduleId]);

  // Scroll chat on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Warn on unsaved changes
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Cmd/Ctrl+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty && !isSaving) handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const handleSave = useCallback(async () => {
    if (!moduleData || !mod) return;
    setIsSaving(true);
    const data = moduleData as Record<string, unknown>;
    const title = (data.displayName as string) || (data.name as string) || mod.title;
    try {
      const res = await fetch(`/api/modules/${moduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleData, title }),
      });
      if (!res.ok) throw new Error('Save failed');
      setIsDirty(false);
      setMod(prev => prev ? { ...prev, moduleData, title } : prev);
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 2000);
    } catch {
      // Could show error toast, for now just let user retry
    } finally {
      setIsSaving(false);
    }
  }, [moduleData, mod, moduleId]);

  const handleRefine = useCallback(async () => {
    if (!chatInput.trim() || !moduleData || !mod) return;
    const userMessage = chatInput.trim();
    setChatInput('');
    chatIdRef.current += 1;
    setChatHistory(prev => [...prev, { id: chatIdRef.current, role: 'user', content: userMessage }]);
    setIsRefining(true);

    try {
      const res = await fetch('/api/modules/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleData,
          message: userMessage,
          languageId: mod.languageId,
          chatHistory: chatHistory.map(e => ({ role: e.role, content: e.content })),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to refine');
      const data = await res.json();
      setModuleData(data.moduleData);
      setIsDirty(true);
      chatIdRef.current += 1;
      setChatHistory(prev => [...prev, {
        id: chatIdRef.current,
        role: 'assistant',
        content: data.explanation || 'Module updated.',
      }]);
    } catch (err) {
      chatIdRef.current += 1;
      setChatHistory(prev => [...prev, {
        id: chatIdRef.current,
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to refine'}`,
      }]);
    } finally {
      setIsRefining(false);
    }
  }, [chatInput, moduleData, mod, chatHistory]);

  const handlePlay = useCallback(() => {
    if (!mod) return;
    const profile = localStorage.getItem('profile') || 'anon';
    const url = `/?play=${mod.id}&language=${mod.languageId}&profile=${encodeURIComponent(profile)}`;
    router.push(url);
  }, [mod, router]);

  // Initialize asset progress from loaded module
  useEffect(() => {
    if (!mod?.assets) return;
    const progress: Record<string, LocStatus> = {};
    for (const locId of Object.keys(mod.assets)) {
      if (locId === '_vignettes') continue;
      if ((mod.assets[locId] as { imageUrl?: string })?.imageUrl) progress[locId] = 'done';
    }
    if (Object.keys(progress).length > 0) setAssetProgress(progress);
    // NPC vignette progress
    const vignettes = (mod.assets as Record<string, unknown>)?._vignettes as { npcs?: Record<string, string>; objects?: Record<string, Record<string, string>> } | undefined;
    if (vignettes?.npcs) {
      const np: Record<string, LocStatus> = {};
      for (const npcId of Object.keys(vignettes.npcs)) {
        np[npcId] = 'done';
      }
      setNpcProgress(np);
    }
    // Object vignette progress (flat map: { objId: { variant: url } })
    if (vignettes?.objects) {
      const op: Record<string, LocStatus> = {};
      for (const [objId, variantMap] of Object.entries(vignettes.objects)) {
        for (const variant of Object.keys(variantMap as Record<string, string>)) {
          op[`${objId}:${variant}`] = 'done';
        }
      }
      if (Object.keys(op).length > 0) setObjVigProgress(op);
    }
  }, [mod?.assets]);

  const handleGenerateAssets = useCallback(async () => {
    if (!moduleData) return;
    const locs = moduleData.locations as Record<string, unknown> | undefined;
    if (!locs) return;
    const locationIds = Object.keys(locs);
    if (locationIds.length === 0) return;

    setIsGeneratingAssets(true);
    setNpcProgress({});
    setObjVigProgress({});
    const progress: Record<string, LocStatus> = {};
    locationIds.forEach(id => { progress[id] = 'pending'; });
    setAssetProgress({ ...progress });

    for (const locId of locationIds) {
      progress[locId] = 'generating';
      setAssetProgress({ ...progress });

      try {
        const res = await fetch(`/api/modules/${moduleId}/assets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locationId: locId }),
        });
        if (!res.ok) throw new Error('Generation failed');
        progress[locId] = 'done';
      } catch {
        progress[locId] = 'failed';
      }
      setAssetProgress({ ...progress });
    }

    const allDone = Object.values(progress).every(s => s === 'done');
    await fetch(`/api/modules/${moduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetStatus: allDone ? 'ready' : 'partial' }),
    });

    // Generate NPC vignettes
    const npcsForGen = (moduleData.npcs || []) as Array<{ id: string; name: { native: string } }>;
    if (npcsForGen.length > 0) {
      const np: Record<string, LocStatus> = {};
      npcsForGen.forEach(npc => { np[npc.id] = 'pending'; });
      setNpcProgress({ ...np });

      for (const npc of npcsForGen) {
        np[npc.id] = 'generating';
        setNpcProgress({ ...np });
        try {
          const res = await fetch(`/api/modules/${moduleId}/assets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'vignette', npcId: npc.id }),
          });
          if (!res.ok) throw new Error('Vignette generation failed');
          np[npc.id] = 'done';
        } catch {
          np[npc.id] = 'failed';
        }
        setNpcProgress({ ...np });
      }
    }

    // Generate object state vignettes
    const VISUAL_TAGS = new Set(['open', 'closed', 'on', 'off', 'ringing', 'cooked', 'lit', 'empty', 'full', 'broken']);
    const TAG_COMPLEMENTS: Record<string, string> = { open: 'closed', closed: 'open', on: 'off', off: 'on' };
    const objectsForVig = (moduleData.objects || []) as Array<{ id: string; name: { native: string }; tags: string[] }>;
    const objVigDefs: Array<{ objectId: string; variant: string; prompt: string }> = [];
    const seenObjVig = new Set<string>();
    for (const obj of objectsForVig) {
      const visualTags = (obj.tags || []).filter(t => VISUAL_TAGS.has(t));
      if (visualTags.length === 0) continue;
      for (const tag of visualTags) {
        const key = `${obj.id}:${tag}`;
        if (seenObjVig.has(key)) continue;
        seenObjVig.add(key);
        objVigDefs.push({ objectId: obj.id, variant: tag, prompt: `Close-up vignette of a ${obj.name.native} that is ${tag}.` });
        const complement = TAG_COMPLEMENTS[tag];
        if (complement && !visualTags.includes(complement)) {
          const compKey = `${obj.id}:${complement}`;
          if (!seenObjVig.has(compKey)) {
            seenObjVig.add(compKey);
            objVigDefs.push({ objectId: obj.id, variant: complement, prompt: `Close-up vignette of a ${obj.name.native} that is ${complement}.` });
          }
        }
      }
    }

    if (objVigDefs.length > 0) {
      const op: Record<string, LocStatus> = {};
      objVigDefs.forEach(d => { op[`${d.objectId}:${d.variant}`] = 'pending'; });
      setObjVigProgress({ ...op });

      for (const d of objVigDefs) {
        const opKey = `${d.objectId}:${d.variant}`;
        op[opKey] = 'generating';
        setObjVigProgress({ ...op });
        try {
          const res = await fetch(`/api/modules/${moduleId}/assets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'object_vignette', objectId: d.objectId, variant: d.variant, prompt: d.prompt }),
          });
          if (!res.ok) throw new Error('Object vignette generation failed');
          op[opKey] = 'done';
        } catch {
          op[opKey] = 'failed';
        }
        setObjVigProgress({ ...op });
      }
    }

    // Re-fetch module to get updated assets (fixes stale thumbnails)
    const updatedRes = await fetch(`/api/modules/${moduleId}`);
    if (updatedRes.ok) {
      const updatedMod = await updatedRes.json();
      setMod(updatedMod);
    } else {
      setMod(prev => prev ? { ...prev, assetStatus: allDone ? 'ready' : 'partial' } : prev);
    }

    setIsGeneratingAssets(false);
  }, [moduleData, moduleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading module...</div>
      </div>
    );
  }

  if (!mod || !moduleData) {
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

  // Derive tab data from local moduleData (reflects unsaved changes)
  const locations = (moduleData.locations || {}) as Record<string, LocationData>;
  const objects = (moduleData.objects || []) as ObjectData[];
  const npcs = (moduleData.npcs || []) as NPCData[];
  const quests = (moduleData.quests || []) as QuestData[];
  const vocabulary = (moduleData.vocabulary || []) as VocabData[];
  const guidance = (moduleData.guidance || '') as string;
  const displayTitle = (moduleData.displayName as string) || (moduleData.name as string) || mod.title;

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/create')} className="text-gray-500 hover:text-gray-300 text-sm">
            ← Back
          </button>
          <h1 className="text-lg font-semibold">{displayTitle}</h1>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{mod.languageId}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Save indicator */}
          {isDirty ? (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          ) : saveFlash ? (
            <span className="text-gray-500 text-sm">Saved</span>
          ) : null}
          {/* Chat toggle */}
          <button
            onClick={() => setChatOpen(prev => !prev)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
              chatOpen ? 'border-blue-500 text-blue-400' : 'border-gray-700 text-gray-500 hover:text-gray-300'
            }`}
          >
            Edit
          </button>
          <button
            onClick={handlePlay}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
          >
            Play
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 px-6 flex gap-1 overflow-x-auto shrink-0">
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

      {/* Main content: tabs + optional chat */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Tab content */}
        <div className={`overflow-y-auto p-6 ${chatOpen ? 'w-[55%]' : 'w-full'} transition-all`}>
          <div className="max-w-4xl">
            {tab === 'overview' && (
              <div className="space-y-6">
                {mod.description && <p className="text-gray-400">{mod.description}</p>}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Locations" value={Object.keys(locations).length} />
                  <StatCard label="Objects" value={objects.length} />
                  <StatCard label="NPCs" value={npcs.length} />
                  <StatCard label="Vocabulary" value={vocabulary.length} />
                </div>

                {/* Scene Images */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Scene Images</h3>
                  <div className="bg-gray-900 rounded-xl p-4">
                    {isGeneratingAssets ? (
                      <div className="space-y-2">
                        {/* Scene progress */}
                        <div className="text-sm text-gray-300 mb-3">
                          Generating scenes... ({Object.values(assetProgress).filter(s => s === 'done').length}/{Object.keys(assetProgress).length})
                        </div>
                        {Object.entries(assetProgress).map(([locId, status]) => (
                          <div key={locId} className="flex items-center gap-2 text-sm">
                            {status === 'done' && <span className="text-green-400 w-5 text-center">&#10003;</span>}
                            {status === 'generating' && <span className="text-blue-400 w-5 text-center animate-spin">&#9696;</span>}
                            {status === 'pending' && <span className="text-gray-600 w-5 text-center">&#9675;</span>}
                            {status === 'failed' && <span className="text-red-400 w-5 text-center">&#10007;</span>}
                            <span className={status === 'done' ? 'text-gray-300' : status === 'generating' ? 'text-blue-300' : 'text-gray-500'}>
                              {(locations[locId]?.name?.native) || locId}
                            </span>
                            {status === 'generating' && <span className="text-gray-600 text-xs ml-auto">generating...</span>}
                          </div>
                        ))}
                        {/* NPC portrait progress */}
                        {Object.keys(npcProgress).length > 0 && (
                          <>
                            <div className="text-sm text-gray-300 mt-4 mb-3">
                              Generating portraits... ({Object.values(npcProgress).filter(s => s === 'done').length}/{Object.keys(npcProgress).length})
                            </div>
                            {Object.entries(npcProgress).map(([npcId, status]) => {
                              const npc = npcs.find(n => n.id === npcId);
                              return (
                                <div key={npcId} className="flex items-center gap-2 text-sm">
                                  {status === 'done' && <span className="text-green-400 w-5 text-center">&#10003;</span>}
                                  {status === 'generating' && <span className="text-blue-400 w-5 text-center animate-spin">&#9696;</span>}
                                  {status === 'pending' && <span className="text-gray-600 w-5 text-center">&#9675;</span>}
                                  {status === 'failed' && <span className="text-red-400 w-5 text-center">&#10007;</span>}
                                  <span className={status === 'done' ? 'text-gray-300' : status === 'generating' ? 'text-blue-300' : 'text-gray-500'}>
                                    {npc?.name?.native || npcId}
                                  </span>
                                  {status === 'generating' && <span className="text-gray-600 text-xs ml-auto">generating...</span>}
                                </div>
                              );
                            })}
                          </>
                        )}
                        {Object.keys(objVigProgress).length > 0 && (
                          <>
                            <div className="text-sm text-gray-300 mt-4 mb-3">
                              Generating object vignettes... ({Object.values(objVigProgress).filter(s => s === 'done').length}/{Object.keys(objVigProgress).length})
                            </div>
                            {Object.entries(objVigProgress).map(([key, status]) => {
                              const [objId, variant] = key.split(':');
                              const obj = objects.find(o => o.id === objId);
                              return (
                                <div key={key} className="flex items-center gap-2 text-sm">
                                  {status === 'done' && <span className="text-green-400 w-5 text-center">&#10003;</span>}
                                  {status === 'generating' && <span className="text-blue-400 w-5 text-center animate-spin">&#9696;</span>}
                                  {status === 'pending' && <span className="text-gray-600 w-5 text-center">&#9675;</span>}
                                  {status === 'failed' && <span className="text-red-400 w-5 text-center">&#10007;</span>}
                                  <span className={status === 'done' ? 'text-gray-300' : status === 'generating' ? 'text-blue-300' : 'text-gray-500'}>
                                    {obj?.name?.native || objId} ({variant})
                                  </span>
                                  {status === 'generating' && <span className="text-gray-600 text-xs ml-auto">generating...</span>}
                                </div>
                              );
                            })}
                          </>
                        )}
                      </div>
                    ) : mod.assetStatus === 'ready' || Object.values(assetProgress).some(s => s === 'done') ? (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-green-400">&#10003;</span>
                          <span className="text-sm text-gray-300">
                            {Object.values(assetProgress).filter(s => s === 'done').length} of {Object.keys(locations).length} scenes generated
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Object.entries(assetProgress).filter(([, s]) => s === 'done').map(([locId]) => {
                            const asset = mod.assets?.[locId] as { imageUrl?: string } | undefined;
                            return (
                              <div key={locId} className="relative group">
                                {asset?.imageUrl && (
                                  <img
                                    src={asset.imageUrl}
                                    alt={locations[locId]?.name?.native || locId}
                                    className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                                  />
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-gray-300 text-center py-0.5 rounded-b-lg">
                                  {locations[locId]?.name?.native || locId}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* NPC portrait thumbnails */}
                        {Object.values(npcProgress).some(s => s === 'done') && (
                          <div className="mb-3">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Portraits</div>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(npcProgress).filter(([, s]) => s === 'done').map(([npcId]) => {
                                const vignettes = (mod.assets as Record<string, unknown>)?._vignettes as { npcs?: Record<string, string> } | undefined;
                                const url = vignettes?.npcs?.[npcId];
                                const npc = npcs.find(n => n.id === npcId);
                                return (
                                  <div key={npcId} className="relative group">
                                    {url ? (
                                      <img
                                        src={url}
                                        alt={npc?.name?.native || npcId}
                                        className="w-16 h-16 object-cover rounded-full border border-gray-700"
                                      />
                                    ) : (
                                      <div className="w-16 h-16 rounded-full bg-cyan-900/50 border border-gray-700 flex items-center justify-center text-lg text-cyan-400">
                                        {(npc?.name?.native || npcId).charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <div className="absolute -bottom-1 left-0 right-0 text-[10px] text-gray-300 text-center">
                                      {npc?.name?.native || npcId}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {/* Object vignette thumbnails */}
                        {Object.values(objVigProgress).some(s => s === 'done') && (
                          <div className="mb-3">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Object Vignettes</div>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(objVigProgress).filter(([, s]) => s === 'done').map(([key]) => {
                                const [objId, variant] = key.split(':');
                                const vigData = (mod.assets as Record<string, unknown>)?._vignettes as { objects?: Record<string, Record<string, string>> } | undefined;
                                const url = vigData?.objects?.[objId]?.[variant];
                                const obj = objects.find(o => o.id === objId);
                                return (
                                  <div key={key} className="relative group">
                                    {url ? (
                                      <img
                                        src={url}
                                        alt={`${obj?.name?.native || objId} (${variant})`}
                                        className="w-14 h-14 object-cover rounded-lg border border-gray-700"
                                      />
                                    ) : (
                                      <div className="w-14 h-14 rounded-lg bg-orange-900/30 border border-gray-700 flex items-center justify-center text-xs text-orange-400">
                                        {variant}
                                      </div>
                                    )}
                                    <div className="absolute -bottom-1 left-0 right-0 text-[9px] text-gray-400 text-center truncate">
                                      {obj?.name?.native || objId}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <button
                          onClick={handleGenerateAssets}
                          disabled={isGeneratingAssets}
                          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          Regenerate All
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">No scene images or portraits yet</span>
                        <button
                          onClick={handleGenerateAssets}
                          disabled={isGeneratingAssets}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                        >
                          Generate Assets
                        </button>
                      </div>
                    )}
                  </div>
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
                        <span className="text-gray-600">&rarr;</span>
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

        {/* Right: Chat panel */}
        {chatOpen && (
          <div className="w-[45%] border-l border-gray-800 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-gray-500 text-sm mb-4">
                Ask me to make changes to your module. Try things like &quot;add a quest about ordering dessert&quot; or &quot;rename the waiter to Carlos&quot;.
              </div>
              {chatHistory.map(entry => (
                <div key={entry.id} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    entry.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300'
                  }`}>
                    {entry.content}
                  </div>
                </div>
              ))}
              {isRefining && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-500 animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-gray-800 p-3 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRefine(); } }}
                  placeholder="Ask for changes..."
                  className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  disabled={isRefining}
                />
                <button
                  onClick={handleRefine}
                  disabled={isRefining || !chatInput.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
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
