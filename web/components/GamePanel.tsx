'use client';

import type { GameView } from '@/lib/types';

interface GamePanelProps {
  game: GameView;
  hoveredObjId: string | null;
  onHoverObj: (id: string | null) => void;
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

export default function GamePanel({ game, hoveredObjId, onHoverObj }: GamePanelProps) {
  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto p-4">
      {/* Location header */}
      <div>
        <h2 className="text-lg font-bold text-blue-400">
          {game.locationName.native}
        </h2>
        <p className="text-sm text-gray-400">{game.locationName.target}</p>
      </div>

      {/* Player portrait */}
      {game.portraitHint?.player && game.scene && (
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/scenes/${game.scene.module}/portraits/${game.portraitHint.player}`}
            alt="You"
            className="w-24 h-24 rounded-lg object-cover border-2 border-gray-700 transition-all duration-300"
          />
        </div>
      )}

      {/* Current goal */}
      {game.goal && (
        <div className="bg-gray-800/50 rounded-lg p-3 border border-purple-900/50">
          <div className="text-purple-400 text-xs font-medium uppercase tracking-wide mb-1">Goal</div>
          <div className="text-sm text-gray-200">{game.goal.title}</div>
          <div className="text-xs text-gray-500 mt-1">Hint: {game.goal.hint}</div>
        </div>
      )}

      {/* Exits */}
      {game.exits.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Exits</div>
          <div className="flex flex-wrap gap-1.5">
            {game.exits.map((exit) => (
              <span
                key={exit.to}
                className="text-xs px-2 py-1 rounded bg-gray-700/30 text-gray-300 border border-gray-600/30 cursor-default"
              >
                {exit.name.target} <span className="text-gray-500">({exit.name.native})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* NPCs here */}
      {game.npcs.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Who&apos;s here</div>
          <div className="space-y-1">
            {game.npcs.map((npc) => (
              <div key={npc.id} className="flex items-center gap-2 text-sm">
                {npc.portrait && game.scene ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/scenes/${game.scene.module}/portraits/${npc.portrait}`}
                    alt={npc.name.native}
                    className="w-7 h-7 rounded-full object-cover border border-cyan-700/50"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-cyan-900/50 border border-cyan-700/50 flex items-center justify-center text-xs text-cyan-400">
                    {npc.name.native.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="text-cyan-400">{npc.name.target}</span>
                  <span className="text-gray-500 ml-1">({npc.name.native})</span>
                  {npc.mood && <span className="text-gray-600 text-xs ml-1">- {npc.mood}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Objects in location */}
      <div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Objects</div>
        <div className="flex flex-wrap gap-1.5">
          {game.objects.map((obj) => (
            <span
              key={obj.id}
              className={`text-xs px-2 py-1 rounded cursor-default transition-all ${
                hoveredObjId === obj.id
                  ? 'bg-white/20 text-white border border-white/40 ring-1 ring-white/20'
                  : obj.vocabStage === 'known'
                  ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                  : obj.vocabStage === 'learning'
                  ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50'
                  : 'bg-gray-700/50 text-gray-300 border border-gray-600/50'
              }`}
              onMouseEnter={() => onHoverObj(obj.id)}
              onMouseLeave={() => onHoverObj(null)}
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
