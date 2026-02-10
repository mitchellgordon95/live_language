'use client';

import { useEffect, useRef } from 'react';
import type { TurnResultView } from '@/lib/types';

export interface ChatEntry {
  id: number;
  playerInput: string;
  turnResult: TurnResultView;
}

interface ChatPanelProps {
  chatHistory: ChatEntry[];
}

function TurnFeedback({ result }: { result: TurnResultView }) {
  return (
    <div className="space-y-1.5">
      {/* Action result */}
      <div className={`text-sm ${result.valid ? 'text-green-400' : 'text-yellow-400'}`}>
        {result.valid ? '\u2713' : '\u2717'} {result.valid ? result.message : (result.invalidReason || result.message)}
      </div>

      {/* NPC response */}
      {result.npcResponse && (
        <div className="pl-3 border-l-2 border-cyan-600">
          <div className="text-cyan-400 text-sm">
            {result.npcResponse.npcName}: &quot;{result.npcResponse.target}&quot;
          </div>
          {result.npcResponse.actionText && (
            <div className="text-gray-500 text-xs italic">*{result.npcResponse.actionText}*</div>
          )}
        </div>
      )}

      {/* Grammar feedback */}
      {result.grammarScore === 100 && result.valid && (
        <div className="text-green-400 text-sm">
          Perfect! <span className="text-gray-400">&quot;{result.targetModel}&quot;</span>
        </div>
      )}
      {result.grammarIssues.length > 0 && result.grammarIssues[0].original.toLowerCase() !== result.grammarIssues[0].corrected.toLowerCase() && (
        <div className="text-sm">
          <span className="text-yellow-400">Tip:</span>{' '}
          <span className="text-gray-300">&quot;{result.grammarIssues[0].corrected}&quot; is more natural</span>
          <div className="text-gray-500 text-xs mt-0.5">{result.grammarIssues[0].explanation}</div>
        </div>
      )}

      {/* Points */}
      {result.pointsAwarded > 0 && (
        <div className="text-yellow-400 text-xs">
          +{result.pointsAwarded} pts{result.leveledUp ? ' - LEVEL UP!' : ''}
        </div>
      )}

      {/* Goals completed */}
      {result.goalsCompleted.length > 0 && (
        <div className="text-green-400 text-sm">
          {result.goalsCompleted.map((g, i) => (
            <div key={i}>Goal complete: {g}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatPanel({ chatHistory }: ChatPanelProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory.length]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatHistory.length === 0 && (
          <div className="text-gray-600 text-sm text-center py-8">
            Type something in Spanish to begin...
          </div>
        )}
        {chatHistory.map((entry) => (
          <div key={entry.id} className="space-y-1.5">
            {/* Player input */}
            <div className="flex justify-end">
              <span className="inline-block px-3 py-1.5 rounded-lg bg-blue-600/30 text-blue-200 text-sm border border-blue-700/30 max-w-[90%]">
                {entry.playerInput}
              </span>
            </div>
            {/* Game response */}
            <div className="bg-gray-800/40 rounded-lg p-2.5 border border-gray-700/50">
              <TurnFeedback result={entry.turnResult} />
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
