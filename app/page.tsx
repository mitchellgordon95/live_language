'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameView } from '@/lib/types';
import ChatPanel from '@/components/ChatPanel';
import type { ChatEntry } from '@/components/ChatPanel';
import ScenePanel from '@/components/ScenePanel';
import InputBar from '@/components/InputBar';
import { SpeakerPopup } from '@/components/SpeakerPopup';
import { useTTS } from '@/hooks/useTTS';
import { useSTT } from '@/hooks/useSTT';
import { useTextSelection } from '@/hooks/useTextSelection';

const TTS_VOICES: Record<string, string> = {
  spanish: 'nova',
  mandarin: 'echo',
  hindi: 'nova',
  portuguese: 'nova',
};

const STT_LANGUAGES: Record<string, string> = {
  spanish: 'es',
  mandarin: 'zh',
  hindi: 'hi',
  portuguese: 'pt',
};

// Strip parenthetical annotations (pinyin, translations) so TTS gets clean text
function prepareTTSText(text: string, languageId?: string): string {
  // Remove all (...) groups: "起床 (qǐchuáng)" → "起床", "abrir (to open)" → "abrir"
  const cleaned = text.replace(/\s*\([^)]*\)/g, '').trim();
  const result = cleaned || text;
  // Gemini TTS fails on very short text (1-2 chars) — repeat for minimum length
  if (result.length <= 2 && languageId === 'mandarin') {
    return `${result}，${result}`;
  }
  return result;
}

type AppState = 'menu' | 'loading' | 'playing' | 'error';

const LANGUAGES = [
  { id: 'spanish', name: 'Spanish', flag: '\u{1F1EA}\u{1F1F8}', hint: 'Me levanto', hintDesc: 'to get out of bed' },
  { id: 'mandarin', name: 'Mandarin Chinese', flag: '\u{1F1E8}\u{1F1F3}', hint: '\u6211\u8D77\u5E8A (w\u01D2 q\u01D0chu\u00E1ng)', hintDesc: 'to get out of bed' },
  { id: 'hindi', name: 'Hindi', flag: '\u{1F1EE}\u{1F1F3}', hint: '\u092E\u0948\u0902 \u0909\u0920\u0924\u093E \u0939\u0942\u0901 (main uthta hoon)', hintDesc: 'to get out of bed' },
  { id: 'portuguese', name: 'Brazilian Portuguese', flag: '\u{1F1E7}\u{1F1F7}', hint: 'Eu me levanto', hintDesc: 'to get out of bed' },
] as const;

const PLACEHOLDERS: Record<string, string> = {
  spanish: "Type in Spanish... (e.g., 'abro la nevera')",
  mandarin: "Type in Mandarin... (e.g., '\u6253\u5F00\u51B0\u7BB1' or 'dakai bingxiang')",
  hindi: "Type in Hindi... (e.g., '\u092B\u094D\u0930\u093F\u091C \u0916\u094B\u0932\u094B' or 'fridge kholo')",
  portuguese: "Type in Portuguese... (e.g., 'abro a geladeira')",
};

export default function Home() {
  const [appState, setAppState] = useState<AppState>('menu');
  const [game, setGame] = useState<GameView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [profile, setProfile] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('spanish');
  const [saves, setSaves] = useState<Array<{ languageId: string; module: string }>>([]);
  const chatIdRef = useRef(0);
  const autoPlayRef = useRef(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const { speak, isMuted, toggleMute } = useTTS();
  const { isRecording, isTranscribing, startRecording, stopRecording } = useSTT();
  const [sttResult, setSttResult] = useState('');
  const { selectedText, position, isVisible, dismiss, popupRef } = useTextSelection();

  // Restore profile from localStorage and check for saves
  useEffect(() => {
    const saved = localStorage.getItem('profile');
    if (saved) {
      setProfile(saved);
      fetch(`/api/game/check?profile=${encodeURIComponent(saved)}`)
        .then(r => r.json())
        .then(data => setSaves(data.saves || []))
        .catch(() => {});
    }
  }, []);

  // Re-check for saves when profile changes
  useEffect(() => {
    if (!profile) { setSaves([]); return; }
    fetch(`/api/game/check?profile=${encodeURIComponent(profile)}`)
      .then(r => r.json())
      .then(data => setSaves(data.saves || []))
      .catch(() => setSaves([]));
  }, [profile]);

  const startGame = useCallback(async (module?: string, overrides?: { language?: string; profile?: string }) => {
    setAppState('loading');
    setError(null);
    setChatHistory([]);
    chatIdRef.current = 0;
    const activeLang = overrides?.language || selectedLanguage;
    const activeProfile = overrides?.profile || profile || ('anon_' + Math.random().toString(36).substring(2, 10));
    if (!profile) setProfile(activeProfile);
    localStorage.setItem('profile', activeProfile);

    try {
      const res = await fetch('/api/game/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, language: activeLang, profile: activeProfile }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to start game');
      }
      const gameView = await res.json();
      setGame(gameView);

      // Tutorial hint for fresh home module games (not resumed)
      if (gameView.module === 'home' && !gameView.resumed) {
        const lang = LANGUAGES.find(l => l.id === (gameView.languageId || selectedLanguage));
        const hintText = lang ? `Try typing "${lang.hint}" ${lang.hintDesc}` : 'Try typing a command to get started';
        chatIdRef.current += 1;
        const hint1: ChatEntry = { id: chatIdRef.current, playerInput: '', systemHint: hintText };
        setChatHistory([hint1]);
      }

      setAppState('playing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
      setAppState('error');
    }
  }, [profile, selectedLanguage]);

  const switchLanguage = useCallback(async (langId: string) => {
    setLangPickerOpen(false);
    setMobileMenuOpen(false);
    if (langId === game?.languageId) return;
    setSelectedLanguage(langId);
    // Refresh saves list after switching
    startGame(undefined, { language: langId }).then(() => {
      fetch(`/api/game/check?profile=${encodeURIComponent(profile)}`)
        .then(r => r.json())
        .then(data => setSaves(data.saves || []))
        .catch(() => {});
    });
  }, [game?.languageId, profile, startGame]);

  // Auto-start game when navigated from module explorer with ?play=ugc_xxx
  useEffect(() => {
    if (autoPlayRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const playModule = params.get('play');
    const lang = params.get('language');
    const prof = params.get('profile');
    if (playModule && lang) {
      autoPlayRef.current = true;
      if (prof) {
        setProfile(prof);
        localStorage.setItem('profile', prof);
      }
      setSelectedLanguage(lang);
      // Clean URL without reloading
      window.history.replaceState({}, '', '/');
      startGame(playModule, { language: lang, profile: prof || undefined });
    }
  }, [startGame]);

  const handleInput = useCallback(async (input: string) => {
    // /say command: entirely client-side TTS
    if (input.trim().toLowerCase().startsWith('/say ')) {
      const textToSpeak = input.trim().slice(5).trim();
      if (textToSpeak) {
        speak(textToSpeak);
        chatIdRef.current += 1;
        setChatHistory(prev => [...prev, {
          id: chatIdRef.current,
          playerInput: input,
          sayResult: textToSpeak,
        }]);
      }
      return;
    }

    const lower = input.trim().toLowerCase();
    if (lower === 'help' || lower === 'ayuda' || lower === '/help' || lower.startsWith('/help ')) {
      if (!game) return;
      const suggestedStep = game.tutorial.find(g => g.suggested) || game.tutorial.find(g => !g.completed);
      const lines: string[] = [];
      lines.push(`You are in: ${game.locationName.target} (${game.locationName.native})`);
      if (suggestedStep) {
        lines.push(`Current step: ${suggestedStep.title}`);
        if (suggestedStep.hint) lines.push(`Hint: ${suggestedStep.hint}`);
      }
      const exitNames = game.exits.map(e => `${e.name.target} (${e.name.native})`).join(', ');
      if (exitNames) lines.push(`Exits: ${exitNames}`);
      const objNames = game.objects.slice(0, 5).map(o => `${o.name.target} (${o.name.native})`).join(', ');
      if (objNames) lines.push(`Objects: ${objNames}${game.objects.length > 5 ? '...' : ''}`);
      lines.push('');
      lines.push('Ask a question in English or use /learn [topic] for a lesson');
      chatIdRef.current += 1;
      setChatHistory(prev => [...prev, {
        id: chatIdRef.current,
        playerInput: input,
        systemHint: lines.join('\n'),
      }]);
      // Plain /help stops here; /help [topic] strips prefix and continues as normal input
      if (!lower.startsWith('/help ')) return;
      input = input.trim().slice(6);
    }

    if (!game || isProcessing) return;
    setIsProcessing(true);
    setError(null);

    chatIdRef.current += 1;
    const entryId = chatIdRef.current;
    setChatHistory(prev => [...prev, {
      id: entryId,
      playerInput: input,
      pending: true,
    }]);

    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: game.profile, languageId: game.languageId, input }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.sessionExpired) {
          setChatHistory(prev => prev.map(e => e.id === entryId ? { ...e, pending: false } : e));
          setIsProcessing(false);
          setAppState('menu');
          setGame(null);
          return;
        }
        throw new Error(data.error || 'Failed to process turn');
      }
      const data = await res.json();

      if (data.learn) {
        setChatHistory(prev => prev.map(e => e.id === entryId ? {
          ...e,
          pending: false,
          learnResult: data.learn.error
            ? { error: data.learn.error }
            : { lesson: data.learn.lesson, remaining: data.learn.remaining },
        } : e));
        return;
      }

      const gameView = data as GameView;

      if (gameView.redirectToModules) {
        setChatHistory(prev => prev.map(e => e.id === entryId ? { ...e, pending: false } : e));
        setIsProcessing(false);
        window.location.href = `/create?language=${encodeURIComponent(game.languageId)}`;
        return;
      }

      setGame(gameView);
      if (gameView.turnResult) {
        setChatHistory(prev => prev.map(e => e.id === entryId ? {
          ...e,
          pending: false,
          turnResult: gameView.turnResult!,
        } : e));
        if (gameView.turnResult.npcResponse?.target) {
          speak(gameView.turnResult.npcResponse.target, gameView.turnResult.npcResponse.voice);
        }
        if (gameView.turnResult.valid && !chatHistory.some(e => e.turnResult?.valid)) {
          chatIdRef.current += 1;
          const tipId = chatIdRef.current;
          setChatHistory(prev => [...prev, {
            id: tipId,
            playerInput: '',
            systemHint: '**Tip:** Highlight any text and click the 🔊 icon to hear it pronounced!',
          }]);
        }
      } else {
        setChatHistory(prev => prev.map(e => e.id === entryId ? { ...e, pending: false } : e));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      setChatHistory(prev => prev.map(e => e.id === entryId ? { ...e, pending: false } : e));
    } finally {
      setIsProcessing(false);
    }
  }, [game, isProcessing, speak, profile, startGame]);

  const handleHelp = useCallback(() => {
    if (!game) return;
    chatIdRef.current += 1;
    setChatHistory(prev => [...prev, {
      id: chatIdRef.current,
      playerInput: '',
      systemHint: game.helpText,
    }]);
  }, [game]);

  // --- Menu Screen ---
  if (appState === 'menu') {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="max-w-md w-full p-8">
          <h1 className="text-3xl font-bold mb-2 text-center">Language Life Sim <span className="text-lg text-gray-500">(Alpha)</span></h1>
          <p className="text-gray-400 text-center mb-6">Learn a language through an interactive life simulation</p>

          <div className="mb-5">
            <label className="text-gray-500 text-xs block mb-1">Profile</label>
            <input
              type="text"
              value={profile}
              onChange={(e) => setProfile(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
              placeholder="default"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-5">
            <label className="text-gray-500 text-xs block mb-2">Language</label>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map(lang => {
                const isSelected = selectedLanguage === lang.id;
                const hasSave = profile && saves.some(s => s.languageId === lang.id);
                return (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`py-3 px-4 rounded-lg text-left transition-colors border-2 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium">{lang.flag} {lang.name}</div>
                    {hasSave && (
                      <div className="text-xs text-green-400 mt-1">Saved game</div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 rounded-lg overflow-hidden border border-gray-700">
              <img
                src={`/scenes/${selectedLanguage}/home/living_room.png`}
                alt="Living room preview"
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            {profile && saves.some(s => s.languageId === selectedLanguage) && (
              <button
                onClick={() => startGame()}
                className="w-full py-3 px-4 bg-green-700 hover:bg-green-600 rounded-lg font-medium transition-colors text-left"
              >
                <div>Continue</div>
                <div className="text-green-200 text-sm">
                  Resume {LANGUAGES.find(l => l.id === selectedLanguage)?.name} game
                </div>
              </button>
            )}
            <button
              onClick={() => startGame('home')}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors text-left"
            >
              <div>{profile && saves.some(s => s.languageId === selectedLanguage) ? 'New Game' : 'Start Game'}</div>
              <div className="text-blue-200 text-sm">
                {profile && saves.some(s => s.languageId === selectedLanguage)
                  ? `Start over in ${LANGUAGES.find(l => l.id === selectedLanguage)?.name}`
                  : `Begin learning ${LANGUAGES.find(l => l.id === selectedLanguage)?.name}`}
              </div>
            </button>
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://discord.gg/gBKykJc4MW"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              Join our Discord
            </a>
          </div>
        </div>
      </div>
    );
  }

  // --- Loading Screen ---
  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Starting game...</div>
      </div>
    );
  }

  // --- Error Screen ---
  if (appState === 'error') {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <button onClick={() => setAppState('menu')} className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // --- Game Screen ---
  if (!game) return null;

  const placeholder = PLACEHOLDERS[game.languageId] || PLACEHOLDERS.spanish;

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 md:px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-medium text-gray-400 truncate">Language Life Sim <span className="text-gray-600 hidden sm:inline">(Alpha)</span></h1>
          {/* Language picker */}
          <div className="relative">
            <button
              onClick={() => setLangPickerOpen(prev => !prev)}
              className="text-sm px-2 py-0.5 rounded hover:bg-gray-800 transition-colors"
              title="Switch language"
            >
              {LANGUAGES.find(l => l.id === game.languageId)?.flag || '🌐'}
            </button>
            {langPickerOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangPickerOpen(false)} />
                <div className="absolute left-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 z-50 min-w-[200px]">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => switchLanguage(lang.id)}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-700 ${
                        lang.id === game.languageId ? 'text-blue-400' : 'text-gray-300'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                      {lang.id === game.languageId && <span className="text-xs text-blue-500 ml-auto">Playing</span>}
                      {lang.id !== game.languageId && saves.some(s => s.languageId === lang.id) && (
                        <span className="text-xs text-gray-500 ml-auto">Saved</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-xs text-gray-500 whitespace-nowrap">
            Lvl {game.level} &middot; {game.points}/{game.pointsToNextLevel}
          </span>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title={isMuted ? 'Unmute TTS' : 'Mute TTS'}
            >
              {isMuted ? <SpeakerOffIcon /> : <SpeakerOnIcon />}
            </button>
            <a href="/create" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Modules
            </a>
            <a href="https://discord.gg/gBKykJc4MW" target="_blank" rel="noopener noreferrer" className="text-xs text-[#5865F2] hover:text-[#7983F5] transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              Discord
            </a>
            <a
              href={`/trophies?profile=${encodeURIComponent(game.profile)}&language=${encodeURIComponent(game.languageId)}`}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0019.875 10.875 3.375 3.375 0 0016.5 7.5h0V3.75m-9 15v-4.5A3.375 3.375 0 014.125 10.875 3.375 3.375 0 017.5 7.5h0V3.75m0 0h9" />
              </svg>
              Trophies
            </a>
            <button
              onClick={() => { setAppState('menu'); setGame(null); }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Back to Menu
            </button>
          </div>
          {/* Mobile hamburger */}
          <div className="relative md:hidden">
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="text-gray-400 hover:text-gray-200 p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {mobileMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 z-50 min-w-[200px]">
                <div className="px-4 py-1.5 text-xs text-gray-500 font-medium">Switch Language</div>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => switchLanguage(lang.id)}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-700 ${
                      lang.id === game.languageId ? 'text-blue-400' : 'text-gray-300'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                    {lang.id === game.languageId && <span className="text-xs text-blue-500 ml-auto">Playing</span>}
                    {lang.id !== game.languageId && saves.some(s => s.languageId === lang.id) && (
                      <span className="text-xs text-gray-500 ml-auto">Saved</span>
                    )}
                  </button>
                ))}
                <div className="border-t border-gray-700 my-1" />
                <button
                  onClick={() => { toggleMute(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                >
                  {isMuted ? <SpeakerOffIcon /> : <SpeakerOnIcon />}
                  {isMuted ? 'Unmute TTS' : 'Mute TTS'}
                </button>
                <a
                  href="/create"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-400 hover:bg-gray-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                  Modules
                </a>
                <a
                  href="https://discord.gg/gBKykJc4MW"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[#5865F2] hover:bg-gray-700"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                  Discord
                </a>
                <a
                  href={`/trophies?profile=${encodeURIComponent(game.profile)}&language=${encodeURIComponent(game.languageId)}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:bg-gray-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0019.875 10.875 3.375 3.375 0 0016.5 7.5h0V3.75m-9 15v-4.5A3.375 3.375 0 014.125 10.875 3.375 3.375 0 017.5 7.5h0V3.75m0 0h9" />
                  </svg>
                  Trophies
                </a>
                <button
                  onClick={() => { setAppState('menu'); setGame(null); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  Back to Menu
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content: stacked on mobile, side-by-side on desktop */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* World panel */}
        <div className="shrink-0 md:w-[55%] md:border-r border-gray-800">
          <ScenePanel game={game} onSpeak={(text) => speak(prepareTTSText(text, game.languageId), TTS_VOICES[game.languageId] || 'alloy')} />
        </div>

        {/* Chat + Input column */}
        <div className="flex-1 min-h-0 md:w-[45%] flex flex-col">
          <ChatPanel chatHistory={chatHistory} onSpeak={speak} languageName={LANGUAGES.find(l => l.id === game.languageId)?.name} />
          <div className="p-2 md:p-3 border-t border-gray-800 shrink-0">
            {error && (
              <div className="text-red-400 text-xs mb-2">{error}</div>
            )}
            <InputBar
              onSubmit={handleInput}
              onHelp={handleHelp}
              disabled={isProcessing}
              placeholder={placeholder}
              isRecording={isRecording}
              isTranscribing={isTranscribing}
              onMicToggle={() => {
                if (isRecording) {
                  stopRecording();
                } else {
                  setSttResult('');
                  const lang = STT_LANGUAGES[game.languageId] || 'es';
                  startRecording(lang, (text) => setSttResult(text));
                }
              }}
              sttResult={sttResult}
            />
          </div>
        </div>
      </div>

      {/* Text selection speaker popup */}
      {isVisible && selectedText && (
        <SpeakerPopup
          ref={popupRef}
          text={selectedText}
          position={position}
          onSpeak={(text) => speak(prepareTTSText(text, game.languageId), TTS_VOICES[game.languageId] || 'alloy')}
          onDismiss={dismiss}
        />
      )}

    </div>
  );
}

function SpeakerOnIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function SpeakerOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}
