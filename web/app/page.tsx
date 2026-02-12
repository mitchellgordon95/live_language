'use client';

import { useState, useCallback, useRef } from 'react';
import type { GameView } from '@/lib/types';
import ChatPanel from '@/components/ChatPanel';
import type { ChatEntry } from '@/components/ChatPanel';
import ScenePanel from '@/components/ScenePanel';
import InputBar from '@/components/InputBar';
import { useTTS } from '@/hooks/useTTS';

type AppState = 'menu' | 'loading' | 'playing' | 'error';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('menu');
  const [game, setGame] = useState<GameView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const chatIdRef = useRef(0);
  const { speak, isMuted, toggleMute } = useTTS();

  const startGame = useCallback(async (module?: string) => {
    setAppState('loading');
    setError(null);
    setChatHistory([]);
    chatIdRef.current = 0;
    try {
      const res = await fetch('/api/game/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, language: 'spanish' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to start game');
      }
      const gameView: GameView = await res.json();
      setGame(gameView);

      // Tutorial hints for home module
      if (gameView.module === 'home') {
        chatIdRef.current += 1;
        const hint1: ChatEntry = { id: chatIdRef.current, playerInput: '', systemHint: 'Try typing "Me levanto" to get out of bed' };
        chatIdRef.current += 1;
        const hint2: ChatEntry = { id: chatIdRef.current, playerInput: '', systemHint: 'You can type /learn [topic] to get a quick Spanish lesson on any topic' };
        setChatHistory([hint1, hint2]);
      }

      setAppState('playing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
      setAppState('error');
    }
  }, []);

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
      const suggestedGoal = game.goals.find(g => g.suggested) || game.goals.find(g => !g.completed);
      const lines: string[] = [];
      lines.push(`You are in: ${game.locationName.target} (${game.locationName.native})`);
      if (suggestedGoal) {
        lines.push(`Current goal: ${suggestedGoal.title}`);
        if (suggestedGoal.hint) lines.push(`Hint: ${suggestedGoal.hint}`);
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

    // Show player input immediately with pending state
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
        body: JSON.stringify({ sessionId: game.sessionId, input }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to process turn');
      }
      const data = await res.json();

      // Handle /learn response
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

      // Normal game turn
      const gameView = data as GameView;
      setGame(gameView);
      if (gameView.turnResult) {
        setChatHistory(prev => prev.map(e => e.id === entryId ? {
          ...e,
          pending: false,
          turnResult: gameView.turnResult!,
        } : e));
        // Auto-speak NPC dialog with gendered voice
        if (gameView.turnResult.npcResponse?.target) {
          speak(gameView.turnResult.npcResponse.target, gameView.turnResult.npcResponse.voice);
        }
      } else {
        // No turn result — just remove pending
        setChatHistory(prev => prev.map(e => e.id === entryId ? { ...e, pending: false } : e));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      // Remove pending on error
      setChatHistory(prev => prev.map(e => e.id === entryId ? { ...e, pending: false } : e));
    } finally {
      setIsProcessing(false);
    }
  }, [game, isProcessing, speak]);

  // --- Menu Screen ---
  if (appState === 'menu') {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="max-w-md w-full p-8">
          <h1 className="text-3xl font-bold mb-2 text-center">Language Life Sim</h1>
          <p className="text-gray-400 text-center mb-8">Learn Spanish through an interactive life simulation</p>

          <div className="space-y-3">
            <button
              onClick={() => startGame('home')}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors text-left"
            >
              <div>Home</div>
              <div className="text-blue-200 text-sm">Wake up, make breakfast, greet your roommate</div>
            </button>
            <button
              onClick={() => startGame('restaurant')}
              className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors text-left"
            >
              <div>Restaurant</div>
              <div className="text-gray-400 text-sm">Order food, talk to the waiter</div>
            </button>
            <button
              onClick={() => startGame('market')}
              className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors text-left"
            >
              <div>Market</div>
              <div className="text-gray-400 text-sm">Buy groceries, bargain with vendors</div>
            </button>
            <button
              onClick={() => startGame('gym')}
              className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors text-left"
            >
              <div>Gym</div>
              <div className="text-gray-400 text-sm">Work out, learn body vocabulary</div>
            </button>
            <button
              onClick={() => startGame('park')}
              className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors text-left"
            >
              <div>Park</div>
              <div className="text-gray-400 text-sm">Explore the park, feed the pigeons</div>
            </button>
            <button
              onClick={() => startGame('clinic')}
              className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors text-left"
            >
              <div>Clinic</div>
              <div className="text-gray-400 text-sm">Visit the doctor, pick up medicine</div>
            </button>
            <button
              onClick={() => startGame('bank')}
              className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors text-left"
            >
              <div>Bank</div>
              <div className="text-gray-400 text-sm">Open an account, exchange currency</div>
            </button>
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
          <ScenePanel game={game} />
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
              disabled={isProcessing}
              placeholder="Type in Spanish... (e.g., 'abro la nevera')"
            />
          </div>
        </div>
      </div>
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
