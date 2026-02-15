'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameView } from '@/lib/types';
import ChatPanel from '@/components/ChatPanel';
import type { ChatEntry } from '@/components/ChatPanel';
import ScenePanel from '@/components/ScenePanel';
import InputBar from '@/components/InputBar';
import { SpeakerPopup } from '@/components/SpeakerPopup';
import { useTTS } from '@/hooks/useTTS';
import { useTextSelection } from '@/hooks/useTextSelection';

const TTS_VOICES: Record<string, string> = {
  spanish: 'Aoede',
  mandarin: 'Kore',
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
] as const;

const PLACEHOLDERS: Record<string, string> = {
  spanish: "Type in Spanish... (e.g., 'abro la nevera')",
  mandarin: "Type in Mandarin... (e.g., '\u6253\u5F00\u51B0\u7BB1' or 'dakai bingxiang')",
};

export default function Home() {
  const [appState, setAppState] = useState<AppState>('menu');
  const [game, setGame] = useState<GameView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [profile, setProfile] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('spanish');
  const [savedGame, setSavedGame] = useState<{ module: string; languageId: string } | null>(null);
  const chatIdRef = useRef(0);
  const { speak, isMuted, toggleMute } = useTTS();
  const { selectedText, position, isVisible, dismiss, popupRef } = useTextSelection();

  // Restore profile from localStorage and check for saved game
  useEffect(() => {
    const saved = localStorage.getItem('profile');
    if (saved) {
      setProfile(saved);
      fetch(`/api/game/check?profile=${encodeURIComponent(saved)}`)
        .then(r => r.json())
        .then(data => {
          if (data.hasSave) {
            setSavedGame({ module: data.module, languageId: data.languageId || 'spanish' });
          }
        })
        .catch(() => {});
    }
  }, []);

  // Re-check for saved game when profile changes
  useEffect(() => {
    if (!profile) { setSavedGame(null); return; }
    fetch(`/api/game/check?profile=${encodeURIComponent(profile)}`)
      .then(r => r.json())
      .then(data => {
        if (data.hasSave) {
          setSavedGame({ module: data.module, languageId: data.languageId || 'spanish' });
        } else {
          setSavedGame(null);
        }
      })
      .catch(() => setSavedGame(null));
  }, [profile]);

  const startGame = useCallback(async (module?: string) => {
    setAppState('loading');
    setError(null);
    setChatHistory([]);
    chatIdRef.current = 0;
    const activeProfile = profile || ('anon_' + Math.random().toString(36).substring(2, 10));
    if (!profile) setProfile(activeProfile);
    localStorage.setItem('profile', activeProfile);

    // For continue, don't pass language (server uses saved language)
    // For new game, pass selected language
    const language = module ? selectedLanguage : undefined;

    try {
      const res = await fetch('/api/game/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, language, profile: activeProfile }),
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
    if (lower === 'help' || lower === 'ayuda' || lower === '/help') {
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
      lines.push('Commands: /learn [topic], /say [text], /help');
      chatIdRef.current += 1;
      setChatHistory(prev => [...prev, {
        id: chatIdRef.current,
        playerInput: input,
        systemHint: lines.join('\n'),
      }]);
      return;
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
        body: JSON.stringify({ profile: game.profile, input }),
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
          <h1 className="text-3xl font-bold mb-2 text-center">Language Life Sim</h1>
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
                const isSavedLang = savedGame?.languageId === lang.id;
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
                    {isSavedLang && profile && (
                      <div className="text-xs text-green-400 mt-1">Saved game</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {savedGame && profile && (
              <button
                onClick={() => startGame()}
                className="w-full py-3 px-4 bg-green-700 hover:bg-green-600 rounded-lg font-medium transition-colors text-left"
              >
                <div>Continue</div>
                <div className="text-green-200 text-sm">
                  Resume {LANGUAGES.find(l => l.id === savedGame.languageId)?.name || savedGame.languageId} game
                </div>
              </button>
            )}
            <button
              onClick={() => startGame('home')}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors text-left"
            >
              <div>{savedGame && profile ? 'New Game' : 'Start Game'}</div>
              <div className="text-blue-200 text-sm">
                Begin learning {LANGUAGES.find(l => l.id === selectedLanguage)?.name}
              </div>
            </button>
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://discord.gg/gBKykJc4MW"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
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
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <h1 className="text-sm font-medium text-gray-400">Language Life Sim</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            Lvl {game.level} &middot; {game.points}/{game.pointsToNextLevel} pts
          </span>
          <button
            onClick={toggleMute}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            title={isMuted ? 'Unmute TTS' : 'Mute TTS'}
          >
            {isMuted ? <SpeakerOffIcon /> : <SpeakerOnIcon />}
          </button>
          <button
            onClick={() => { setAppState('menu'); setGame(null); }}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>

      {/* Main content: world (left) + chat+input (right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* World panel */}
        <div className="w-[55%] border-r border-gray-800">
          <ScenePanel game={game} onSpeak={(text) => speak(prepareTTSText(text, game.languageId), TTS_VOICES[game.languageId] || 'Puck')} />
        </div>

        {/* Chat + Input column */}
        <div className="w-[45%] flex flex-col">
          <ChatPanel chatHistory={chatHistory} onSpeak={speak} />
          <div className="p-3 border-t border-gray-800">
            {error && (
              <div className="text-red-400 text-xs mb-2">{error}</div>
            )}
            <InputBar
              onSubmit={handleInput}
              onHelp={handleHelp}
              disabled={isProcessing}
              placeholder={placeholder}
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
          onSpeak={(text) => speak(prepareTTSText(text, game.languageId), TTS_VOICES[game.languageId] || 'Puck')}
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
