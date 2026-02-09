'use client';

import type { GameView, TurnResultView } from '@/lib/types';

interface GamePanelProps {
  game: GameView;
}

function NeedsBar({ label, value, icon }: { label: string; value: number; icon: string }) {
  const color = value > 60 ? 'bg-green-500' : value > 30 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between text-xs text-gray-400 mb-0.5">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
        </div>
      </div>
    </div>
  );
}

function TurnFeedback({ result }: { result: TurnResultView }) {
  return (
    <div className="space-y-2">
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

export default function GamePanel({ game }: GamePanelProps) {
  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">
      {/* Location header */}
      <div>
        <h2 className="text-lg font-bold text-blue-400">
          {game.locationName.native}
        </h2>
        <p className="text-sm text-gray-400">{game.locationName.target}</p>
      </div>

      {/* Current goal */}
      {game.goal && (
        <div className="bg-gray-800/50 rounded-lg p-3 border border-purple-900/50">
          <div className="text-purple-400 text-xs font-medium uppercase tracking-wide mb-1">Goal</div>
          <div className="text-sm text-gray-200">{game.goal.title}</div>
          <div className="text-xs text-gray-500 mt-1">Hint: {game.goal.hint}</div>
        </div>
      )}

      {/* Turn result */}
      {game.turnResult && (
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <TurnFeedback result={game.turnResult} />
        </div>
      )}

      {/* Objects in location */}
      <div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Objects</div>
        <div className="flex flex-wrap gap-1.5">
          {game.objects.map((obj) => (
            <span
              key={obj.id}
              className={`text-xs px-2 py-1 rounded ${
                obj.vocabStage === 'known'
                  ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                  : obj.vocabStage === 'learning'
                  ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50'
                  : 'bg-gray-700/50 text-gray-300 border border-gray-600/50'
              }`}
            >
              {obj.vocabStage === 'known' ? obj.name.target : `${obj.name.target} (${obj.name.native})`}
            </span>
          ))}
        </div>
      </div>

      {/* Inventory */}
      {game.inventory.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Inventory</div>
          <div className="flex flex-wrap gap-1.5">
            {game.inventory.map((item) => (
              <span key={item.id} className="text-xs px-2 py-1 bg-gray-700/50 text-gray-300 rounded border border-gray-600/50">
                {item.name.target}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Needs bars */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Needs</div>
        <NeedsBar label="Energy" value={game.needs.energy} icon={"\u26a1"} />
        <NeedsBar label="Hunger" value={game.needs.hunger} icon={"\ud83c\udf54"} />
        <NeedsBar label="Hygiene" value={game.needs.hygiene} icon={"\ud83e\uddfc"} />
        <NeedsBar label="Bladder" value={game.needs.bladder} icon={"\ud83d\udebb"} />
      </div>

      {/* Level / Points */}
      <div className="text-xs text-gray-500">
        Level {game.level} &middot; {game.points}/{game.pointsToNextLevel} pts
      </div>
    </div>
  );
}
