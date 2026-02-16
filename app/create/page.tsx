'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type WizardStep = 'describe' | 'directions' | 'generating';

interface Direction {
  title: string;
  setting: string;
  vocabFocus: string;
  locationCount: number;
  locations: string[];
  npcIdeas: string[];
}

const LANGUAGES = [
  { id: 'spanish', name: 'Spanish', flag: '\u{1F1EA}\u{1F1F8}' },
  { id: 'mandarin', name: 'Mandarin Chinese', flag: '\u{1F1E8}\u{1F1F3}' },
  { id: 'hindi', name: 'Hindi', flag: '\u{1F1EE}\u{1F1F3}' },
];

export default function CreateModule() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>('describe');
  const [languageId, setLanguageId] = useState('spanish');
  const [description, setDescription] = useState('');
  const [directions, setDirections] = useState<Direction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);

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
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/modules/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, languageId, userDescription: description }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to generate');
      const data = await res.json();

      // Save immediately and redirect to editor
      const profile = localStorage.getItem('profile') || ('anon_' + Math.random().toString(36).substring(2, 10));
      localStorage.setItem('profile', profile);
      const id = 'ugc_' + Math.random().toString(36).substring(2, 12);
      const mod = data.moduleData as Record<string, unknown>;
      const title = (mod.displayName as string) || (mod.name as string) || 'Untitled Module';

      const saveRes = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, profile, languageId, title, description, moduleData: data.moduleData }),
      });
      if (!saveRes.ok) throw new Error((await saveRes.json()).error || 'Failed to save');
      router.push(`/create/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate module');
      setStep('directions');
    } finally {
      setIsLoading(false);
    }
  }, [languageId, description, router]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="text-gray-500 hover:text-gray-300 text-sm">
            ← Back
          </button>
          <h1 className="text-lg font-semibold">Create Module</h1>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Describe */}
      {step === 'describe' && (
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

      {/* Step 2: Directions */}
      {step === 'directions' && (
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
            ← Try different description
          </button>
        </div>
      )}

      {/* Step 3: Generating */}
      {step === 'generating' && (
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="text-gray-400 animate-pulse text-lg mb-2">Building module...</div>
            {selectedDirection && (
              <div className="text-gray-600 text-sm">{selectedDirection.title}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
