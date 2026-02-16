'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type WizardStep = 'describe' | 'directions' | 'generating' | 'refine';

interface Direction {
  title: string;
  setting: string;
  vocabFocus: string;
  locationCount: number;
  locations: string[];
  npcIdeas: string[];
}

interface ChatEntry {
  id: number;
  role: 'user' | 'assistant';
  content: string;
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
  const [moduleData, setModuleData] = useState<Record<string, unknown> | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  const chatIdRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

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
      setModuleData(data.moduleData);
      setStep('refine');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate module');
      setStep('directions');
    } finally {
      setIsLoading(false);
    }
  }, [languageId, description]);

  const handleRefine = useCallback(async () => {
    if (!chatInput.trim() || !moduleData) return;
    const userMessage = chatInput.trim();
    setChatInput('');
    chatIdRef.current += 1;
    const userEntry: ChatEntry = { id: chatIdRef.current, role: 'user', content: userMessage };
    setChatHistory(prev => [...prev, userEntry]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/modules/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleData,
          message: userMessage,
          languageId,
          chatHistory: chatHistory.map(e => ({ role: e.role, content: e.content })),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to refine');
      const data = await res.json();
      setModuleData(data.moduleData);
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
      setIsLoading(false);
    }
  }, [chatInput, moduleData, languageId, chatHistory]);

  const handleSave = useCallback(async () => {
    if (!moduleData) return;
    setIsLoading(true);
    setError(null);
    const profile = localStorage.getItem('profile') || ('anon_' + Math.random().toString(36).substring(2, 10));
    localStorage.setItem('profile', profile);
    const id = 'ugc_' + Math.random().toString(36).substring(2, 12);
    const mod = moduleData as Record<string, unknown>;
    const title = (mod.displayName as string) || (mod.name as string) || 'Untitled Module';

    try {
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          profile,
          languageId,
          title,
          description,
          moduleData,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save');
      router.push(`/create/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save module');
    } finally {
      setIsLoading(false);
    }
  }, [moduleData, languageId, description, router]);

  // --- Module Preview (left panel in refine step) ---
  const renderModulePreview = () => {
    if (!moduleData) return null;
    const mod = moduleData as Record<string, unknown>;
    const locations = mod.locations as Record<string, { id: string; name: { target: string; native: string }; exits: Array<{ to: string; name: { target: string; native: string } }> }> | undefined;
    const objects = mod.objects as Array<{ id: string; name: { target: string; native: string }; location: string; tags: string[] }> | undefined;
    const npcs = mod.npcs as Array<{ id: string; name: { target: string; native: string }; personality: string; isPet?: boolean }> | undefined;
    const quests = mod.quests as Array<{ id: string; title: { target: string; native: string }; description: string }> | undefined;
    const vocabulary = mod.vocabulary as Array<{ target: string; native: string; category: string }> | undefined;

    return (
      <div className="space-y-4 text-sm overflow-y-auto max-h-[calc(100vh-120px)] pr-2">
        <h3 className="text-lg font-bold text-white">{(mod.displayName as string) || (mod.name as string)}</h3>

        {/* Locations */}
        {locations && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Locations ({Object.keys(locations).length})</h4>
            <div className="space-y-1.5">
              {Object.values(locations).map(loc => (
                <div key={loc.id} className="bg-gray-800/50 rounded px-2.5 py-1.5">
                  <span className="text-cyan-400">{loc.name.target}</span>
                  <span className="text-gray-500 ml-1.5">({loc.name.native})</span>
                  <span className="text-gray-600 ml-2 text-xs">
                    → {loc.exits.map(e => e.name.native).join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NPCs */}
        {npcs && npcs.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">NPCs ({npcs.length})</h4>
            <div className="space-y-1.5">
              {npcs.map(npc => (
                <div key={npc.id} className="bg-gray-800/50 rounded px-2.5 py-1.5">
                  <span className="text-yellow-400">{npc.name.target}</span>
                  <span className="text-gray-500 ml-1.5">({npc.name.native})</span>
                  {npc.isPet && <span className="text-xs text-purple-400 ml-1.5">pet</span>}
                  <div className="text-gray-500 text-xs mt-0.5 line-clamp-1">{npc.personality}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Objects */}
        {objects && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Objects ({objects.length})</h4>
            <div className="flex flex-wrap gap-1">
              {objects.map(obj => (
                <span key={obj.id} className="bg-gray-800/50 rounded px-2 py-0.5 text-xs">
                  <span className="text-gray-300">{obj.name.native}</span>
                  {obj.tags.length > 0 && (
                    <span className="text-gray-600 ml-1">[{obj.tags.join(',')}]</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quests */}
        {quests && quests.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quests ({quests.length})</h4>
            <div className="space-y-1">
              {quests.map(q => (
                <div key={q.id} className="bg-gray-800/50 rounded px-2.5 py-1.5 text-xs">
                  <span className="text-green-400">{q.title.native}</span>
                  <div className="text-gray-500 mt-0.5 line-clamp-1">{q.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vocabulary count */}
        {vocabulary && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Vocabulary ({vocabulary.length} words)</h4>
            <div className="text-xs text-gray-500">
              {vocabulary.filter(v => v.category === 'noun').length} nouns,{' '}
              {vocabulary.filter(v => v.category === 'verb').length} verbs,{' '}
              {vocabulary.filter(v => v.category === 'adjective').length} adjectives,{' '}
              {vocabulary.filter(v => v.category === 'other').length} other
            </div>
          </div>
        )}
      </div>
    );
  };

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
        {step === 'refine' && moduleData && (
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
          >
            Save & Explore
          </button>
        )}
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

      {/* Step 4: Refine */}
      {step === 'refine' && moduleData && (
        <div className="flex h-[calc(100vh-57px)]">
          {/* Left: Module Preview */}
          <div className="w-[45%] border-r border-gray-800 p-4 overflow-hidden">
            {renderModulePreview()}
          </div>

          {/* Right: Chat */}
          <div className="w-[55%] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-gray-500 text-sm mb-4">
                Module generated! Review the preview on the left. Ask me to make changes, or click &quot;Save &amp; Explore&quot; when you&apos;re happy.
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
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-500 animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-gray-800 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRefine(); } }}
                  placeholder="Ask for changes... e.g., 'Add a quest about ordering dessert'"
                  className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleRefine}
                  disabled={isLoading || !chatInput.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
