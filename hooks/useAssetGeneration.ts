'use client';

import { useState, useCallback, useRef } from 'react';

export type ItemStatus = 'pending' | 'generating' | 'done' | 'failed';
export type GenerationPhase = 'idle' | 'generating' | 'done';

const VISUAL_TAGS = new Set(['open', 'closed', 'on', 'off', 'ringing', 'cooked', 'lit', 'empty', 'full', 'broken']);
const TAG_COMPLEMENTS: Record<string, string> = { open: 'closed', closed: 'open', on: 'off', off: 'on' };

const CONCURRENCY = 4;

function countByStatus(progress: Record<string, ItemStatus>, status: ItemStatus): number {
  return Object.values(progress).filter(s => s === status).length;
}

async function runParallel<T>(items: T[], concurrency: number, fn: (item: T) => Promise<void>) {
  const queue = [...items];
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()!;
      await fn(item);
    }
  });
  await Promise.all(workers);
}

export interface AssetGenerationState {
  isGenerating: boolean;
  sceneProgress: Record<string, ItemStatus>;
  npcProgress: Record<string, ItemStatus>;
  objectProgress: Record<string, ItemStatus>;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  percentComplete: number;
  phase: GenerationPhase;
}

type AssetJob =
  | { type: 'scene'; locationId: string }
  | { type: 'portrait'; npcId: string }
  | { type: 'vignette'; objectId: string; variant: string; prompt: string };

export function useAssetGeneration(moduleId: string | null, moduleData: Record<string, unknown> | null) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sceneProgress, setSceneProgress] = useState<Record<string, ItemStatus>>({});
  const [npcProgress, setNpcProgress] = useState<Record<string, ItemStatus>>({});
  const [objectProgress, setObjectProgress] = useState<Record<string, ItemStatus>>({});
  const [phase, setPhase] = useState<GenerationPhase>('idle');
  const startedRef = useRef(false);

  // Use refs for mutable progress tracking (avoids stale closure issues in parallel workers)
  const spRef = useRef<Record<string, ItemStatus>>({});
  const npRef = useRef<Record<string, ItemStatus>>({});
  const opRef = useRef<Record<string, ItemStatus>>({});

  const totalItems = Object.keys(sceneProgress).length + Object.keys(npcProgress).length + Object.keys(objectProgress).length;
  const completedItems = countByStatus(sceneProgress, 'done') + countByStatus(npcProgress, 'done') + countByStatus(objectProgress, 'done');
  const failedItems = countByStatus(sceneProgress, 'failed') + countByStatus(npcProgress, 'failed') + countByStatus(objectProgress, 'failed');
  const percentComplete = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const initFromExistingAssets = useCallback((assets: Record<string, unknown>) => {
    if (!assets) return;
    const sp: Record<string, ItemStatus> = {};
    for (const locId of Object.keys(assets)) {
      if (locId === '_vignettes') continue;
      if ((assets[locId] as { imageUrl?: string })?.imageUrl) sp[locId] = 'done';
    }
    if (Object.keys(sp).length > 0) setSceneProgress(sp);

    const vignettes = assets._vignettes as { npcs?: Record<string, string>; objects?: Record<string, Record<string, string>> } | undefined;
    if (vignettes?.npcs) {
      const np: Record<string, ItemStatus> = {};
      for (const npcId of Object.keys(vignettes.npcs)) np[npcId] = 'done';
      setNpcProgress(np);
    }
    if (vignettes?.objects) {
      const op: Record<string, ItemStatus> = {};
      for (const [objId, variantMap] of Object.entries(vignettes.objects)) {
        for (const variant of Object.keys(variantMap as Record<string, string>)) {
          op[`${objId}:${variant}`] = 'done';
        }
      }
      if (Object.keys(op).length > 0) setObjectProgress(op);
    }
  }, []);

  const startGeneration = useCallback(async () => {
    if (!moduleId || !moduleData || startedRef.current) return;
    startedRef.current = true;

    const locs = moduleData.locations as Record<string, unknown> | undefined;
    if (!locs) return;
    const locationIds = Object.keys(locs);

    // Build full item lists upfront
    const npcsForGen = (moduleData.npcs || []) as Array<{ id: string; name: { native: string }; tags?: string[] }>;
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

    // Initialize all progress upfront via refs
    const sp: Record<string, ItemStatus> = {};
    locationIds.forEach(id => { sp[id] = 'pending'; });
    spRef.current = sp;
    setSceneProgress({ ...sp });

    const np: Record<string, ItemStatus> = {};
    npcsForGen.forEach(npc => { np[npc.id] = 'pending'; });
    npRef.current = np;
    setNpcProgress({ ...np });

    const op: Record<string, ItemStatus> = {};
    objVigDefs.forEach(d => { op[`${d.objectId}:${d.variant}`] = 'pending'; });
    opRef.current = op;
    setObjectProgress({ ...op });

    setIsGenerating(true);
    setPhase('generating');

    // Build flat job list — scenes first (most visible), then portraits, then vignettes
    const jobs: AssetJob[] = [
      ...locationIds.map(id => ({ type: 'scene' as const, locationId: id })),
      ...npcsForGen.map(npc => ({ type: 'portrait' as const, npcId: npc.id })),
      ...objVigDefs.map(d => ({ type: 'vignette' as const, objectId: d.objectId, variant: d.variant, prompt: d.prompt })),
    ];

    // Run all jobs in parallel with concurrency limit
    await runParallel(jobs, CONCURRENCY, async (job) => {
      switch (job.type) {
        case 'scene': {
          spRef.current[job.locationId] = 'generating';
          setSceneProgress({ ...spRef.current });
          try {
            const res = await fetch(`/api/modules/${moduleId}/assets`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ locationId: job.locationId }),
            });
            if (!res.ok) throw new Error('Generation failed');
            spRef.current[job.locationId] = 'done';
          } catch {
            spRef.current[job.locationId] = 'failed';
          }
          setSceneProgress({ ...spRef.current });
          break;
        }
        case 'portrait': {
          npRef.current[job.npcId] = 'generating';
          setNpcProgress({ ...npRef.current });
          try {
            const res = await fetch(`/api/modules/${moduleId}/assets`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'vignette', npcId: job.npcId }),
            });
            if (!res.ok) throw new Error('Portrait generation failed');
            npRef.current[job.npcId] = 'done';
          } catch {
            npRef.current[job.npcId] = 'failed';
          }
          setNpcProgress({ ...npRef.current });
          break;
        }
        case 'vignette': {
          const opKey = `${job.objectId}:${job.variant}`;
          opRef.current[opKey] = 'generating';
          setObjectProgress({ ...opRef.current });
          try {
            const res = await fetch(`/api/modules/${moduleId}/assets`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'object_vignette', objectId: job.objectId, variant: job.variant, prompt: job.prompt }),
            });
            if (!res.ok) throw new Error('Vignette generation failed');
            opRef.current[opKey] = 'done';
          } catch {
            opRef.current[opKey] = 'failed';
          }
          setObjectProgress({ ...opRef.current });
          break;
        }
      }
    });

    // Update asset status in DB
    const allScenesDone = Object.values(spRef.current).every(s => s === 'done');
    await fetch(`/api/modules/${moduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetStatus: allScenesDone ? 'ready' : 'partial' }),
    });

    setPhase('done');
    setIsGenerating(false);
    startedRef.current = false;
  }, [moduleId, moduleData]);

  return {
    isGenerating,
    sceneProgress,
    npcProgress,
    objectProgress,
    totalItems,
    completedItems,
    failedItems,
    percentComplete,
    phase,
    startGeneration,
    initFromExistingAssets,
  };
}
