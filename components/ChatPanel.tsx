'use client';

import { useEffect, useRef } from 'react';
import type { TurnResultView } from '@/lib/types';

export interface LearnResult {
  lesson?: string;
  error?: string;
}

export interface ChatEntry {
  id: number;
  playerInput: string;
  turnResult?: TurnResultView;
  learnResult?: LearnResult;
  sayResult?: string;
  systemHint?: string;
  pending?: boolean;
}

interface ChatPanelProps {
  chatHistory: ChatEntry[];
  onSpeak?: (text: string, voice?: string) => void;
}

function LearnFeedback({ result }: { result: LearnResult }) {
  if (result.error) {
    return <div className="text-yellow-400 text-sm">{result.error}</div>;
  }
  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed prose prose-invert prose-sm max-w-none
        [&_strong]:text-blue-300 [&_em]:text-gray-400
        [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4
        [&_li]:text-gray-300 [&_code]:text-cyan-300 [&_code]:bg-gray-800 [&_code]:px-1 [&_code]:rounded"
        dangerouslySetInnerHTML={{ __html: simpleMarkdown(result.lesson || '') }}
      />
    </div>
  );
}

// Minimal markdown → HTML for lesson text
function simpleMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<div class="text-blue-400 font-medium mt-2">$1</div>')
    .replace(/^## (.+)$/gm, '<div class="text-blue-400 font-medium text-base mt-2">$1</div>')
    .replace(/^# (.+)$/gm, '<div class="text-blue-400 font-bold text-base mt-2">$1</div>')
    .replace(/^- (.+)$/gm, '<div class="pl-3">• $1</div>')
    .replace(/^\d+\. (.+)$/gm, '<div class="pl-3">$&</div>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

function SayFeedback({ text }: { text: string }) {
  return (
    <div className="text-sm text-gray-300">
      <span className="text-gray-500">Speaking:</span> &quot;{text}&quot;
    </div>
  );
}

function SpeakerIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function TurnFeedback({ result, onSpeak }: { result: TurnResultView; onSpeak?: (text: string, voice?: string) => void }) {
  return (
    <div className="space-y-1.5">
      {/* Action result */}
      <div className={`text-sm ${result.valid ? 'text-green-400' : 'text-yellow-400'}`}>
        {result.valid ? '\u2713' : '\u2717'} {result.valid ? result.message : (result.invalidReason || result.message)}
      </div>

      {/* Hint after failed action */}
      {!result.valid && result.hint && (
        <div className="text-xs text-blue-300/80 bg-blue-900/20 border border-blue-800/30 rounded px-2 py-1">
          Hint: {result.hint}
        </div>
      )}

      {/* NPC response */}
      {result.npcResponse && result.npcResponse.npcName && (
        <div className="flex gap-2 items-start">
          {result.npcResponse.portrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.npcResponse.portrait}
              alt={result.npcResponse.npcName}
              className="w-10 h-10 rounded-full object-cover border border-cyan-700/50 flex-shrink-0 mt-0.5"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-cyan-900/50 border border-cyan-700/50 flex items-center justify-center text-sm text-cyan-400 flex-shrink-0 mt-0.5">
              {result.npcResponse.npcName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="pl-2 border-l-2 border-cyan-600 flex-1">
            <div className="text-cyan-400 text-sm flex items-center gap-1">
              <span>{result.npcResponse.npcName}: &quot;{result.npcResponse.target}&quot;</span>
              {onSpeak && (
                <button
                  onClick={() => onSpeak(result.npcResponse!.target, result.npcResponse!.voice)}
                  className="text-gray-500 hover:text-cyan-400 transition-colors ml-1 pointer-events-auto"
                  title="Replay speech"
                >
                  <SpeakerIcon />
                </button>
              )}
            </div>
            {result.npcResponse.actionText && (
              <div className="text-gray-500 text-xs italic">*{result.npcResponse.actionText}*</div>
            )}
          </div>
        </div>
      )}

      {/* Grammar feedback */}
      {result.grammarScore === 100 && result.valid && result.understood && (
        <div className="text-green-400 text-sm">
          Perfect! <span className="text-gray-400">&quot;{result.targetModel}&quot;</span>
        </div>
      )}
      {result.understood && result.grammarIssues.length > 0 && result.grammarIssues[0].original.toLowerCase() !== result.grammarIssues[0].corrected.toLowerCase() && (
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

      {/* Steps completed */}
      {result.stepsCompleted.length > 0 && (
        <div className="text-green-400 text-sm">
          {result.stepsCompleted.map((g, i) => (
            <div key={i}>Tutorial step complete: {g}</div>
          ))}
        </div>
      )}

      {/* Quests started */}
      {result.questsStarted.length > 0 && (
        <div className="text-amber-300 text-sm">
          {result.questsStarted.map((q, i) => (
            <div key={i}>New quest: {q.title.native} &mdash; {q.description}</div>
          ))}
        </div>
      )}

      {/* Quests completed */}
      {result.questsCompleted.length > 0 && (
        <div className="text-amber-300 text-sm font-medium">
          {result.questsCompleted.map((q, i) => (
            <div key={i}>
              Quest complete: {q.title.native}!
              {q.points > 0 && ` +${q.points} pts`}
              {q.badge && ` — Badge: ${q.badge}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatPanel({ chatHistory, onSpeak }: ChatPanelProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll when new entries are added or when pending entries resolve
  const lastEntry = chatHistory[chatHistory.length - 1];
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory.length, lastEntry?.pending]);

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
            {/* System hint (no player input) */}
            {entry.systemHint && (
              <div className="text-xs text-blue-300/80 bg-blue-900/20 border border-blue-800/30 rounded px-3 py-2 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: simpleMarkdown(entry.systemHint) }}
              />
            )}
            {/* Player input */}
            {entry.playerInput && (
              <div className="flex justify-end">
                <span className="inline-block px-3 py-1.5 rounded-lg bg-blue-600/30 text-blue-200 text-sm border border-blue-700/30 max-w-[90%]">
                  {entry.playerInput}
                </span>
              </div>
            )}
            {/* Game response or learn lesson */}
            {(entry.turnResult || entry.learnResult || entry.sayResult) && (
              <div className="bg-gray-800/40 rounded-lg p-2.5 border border-gray-700/50">
                {entry.turnResult && <TurnFeedback result={entry.turnResult} onSpeak={onSpeak} />}
                {entry.learnResult && <LearnFeedback result={entry.learnResult} />}
                {entry.sayResult && <SayFeedback text={entry.sayResult} />}
              </div>
            )}
            {/* Pending response */}
            {entry.pending && (
              <div className="text-gray-500 text-xs animate-pulse pl-1">Thinking...</div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
