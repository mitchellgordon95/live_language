'use client';

import { useState, useCallback, useRef } from 'react';
import type { GameView } from '@/lib/types';
import GamePanel from '@/components/GamePanel';
import ChatPanel from '@/components/ChatPanel';
import type { ChatEntry } from '@/components/ChatPanel';
import ScenePanel from '@/components/ScenePanel';
import InputBar from '@/components/InputBar';

type AppState = 'menu' | 'loading' | 'playing' | 'error';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('menu');
  const [game, setGame] = useState<GameView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [hoveredObjId, setHoveredObjId] = useState<string | null>(null);
  const chatIdRef = useRef(0);

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
      setAppState('playing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
      setAppState('error');
    }
  }, []);

  const handleInput = useCallback(async (input: string) => {
    if (!game || isProcessing) return;
    setIsProcessing(true);
    setError(null);
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
        chatIdRef.current += 1;
        setChatHistory(prev => [...prev, {
          id: chatIdRef.current,
          playerInput: input,
          learnResult: data.learn.error
            ? { error: data.learn.error }
            : { lesson: data.learn.lesson, remaining: data.learn.remaining },
        }]);
        return;
      }

      // Normal game turn
      const gameView = data as GameView;
      setGame(gameView);
      if (gameView.turnResult) {
        chatIdRef.current += 1;
        setChatHistory(prev => [...prev, {
          id: chatIdRef.current,
          playerInput: input,
          turnResult: gameView.turnResult!,
        }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsProcessing(false);
    }
  }, [game, isProcessing]);

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
        <button
          onClick={() => { setAppState('menu'); setGame(null); }}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Back to Menu
        </button>
      </div>

      {/* Main content: scene (left) + game info (center) + chat (right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Scene panel */}
        <div className="w-[40%] p-3">
          <ScenePanel game={game} hoveredObjId={hoveredObjId} onHoverObj={setHoveredObjId} />
        </div>

        {/* Game info panel */}
        <div className="w-[30%] pt-3 border-l border-gray-800">
          <GamePanel game={game} hoveredObjId={hoveredObjId} onHoverObj={setHoveredObjId} />
        </div>

        {/* Chat panel */}
        <div className="w-[30%] pt-3 border-l border-gray-800">
          <ChatPanel chatHistory={chatHistory} />
        </div>
      </div>

      {/* Input bar */}
      <div className="p-3 bg-gray-900 border-t border-gray-800">
        {error && (
          <div className="text-red-400 text-xs mb-2">{error}</div>
        )}
        <InputBar
          onSubmit={handleInput}
          disabled={isProcessing}
          placeholder="Type in Spanish... (e.g., 'abro la nevera')"
        />
        {isProcessing && (
          <div className="text-gray-500 text-xs mt-1 animate-pulse">Thinking...</div>
        )}
      </div>
    </div>
  );
}
