'use client';

import type { GameView, GameObjectView, ExitView, NPCView } from '@/lib/types';

interface ScenePanelProps {
  game: GameView;
  hoveredObjId: string | null;
  onHoverObj: (id: string | null) => void;
}

export default function ScenePanel({ game, hoveredObjId, onHoverObj }: ScenePanelProps) {
  // No scene image available — show placeholder
  if (!game.scene) {
    return (
      <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-20" style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
        }} />
        <div className="relative text-center">
          <div className="text-gray-400 text-sm">{game.locationName.target}</div>
          <div className="text-gray-600 text-xs mt-1">No scene image available</div>
        </div>
      </div>
    );
  }

  const imageSrc = `/scenes/${game.scene.module}/${game.scene.image}`;

  // Only render labels for objects that have valid coordinates
  const labeledObjects = game.objects.filter(
    (obj) => obj.coords && (obj.coords.w > 0 || obj.coords.h > 0)
  );

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
      {/* Square container — matches 1024x1024 scene images */}
      <div className="relative aspect-square max-w-full max-h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={`${game.locationName.native} - ${game.locationName.target}`}
          className="w-full h-full object-cover rounded"
          draggable={false}
        />

        {/* Overlay layer */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Object labels (dots) */}
          {labeledObjects.map((obj) => (
            <ObjectLabel
              key={obj.id}
              obj={obj}
              isHighlighted={hoveredObjId === obj.id}
              onMouseEnter={() => onHoverObj(obj.id)}
              onMouseLeave={() => onHoverObj(null)}
            />
          ))}

          {/* NPC badges */}
          {game.npcs.map((npc, i) => (
            <NPCBadge
              key={npc.id}
              npc={npc}
              position={getNPCPosition(i, game.npcs.length)}
            />
          ))}

          {/* Exit indicators */}
          {game.exits.map((exit, i) => (
            <ExitIndicator
              key={exit.to}
              exit={exit}
              position={getExitPosition(i, game.exits.length)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Object Labels (dot-based) ---

interface ObjectLabelProps {
  obj: GameObjectView;
  isHighlighted: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function ObjectLabel({ obj, isHighlighted, onMouseEnter, onMouseLeave }: ObjectLabelProps) {
  if (!obj.coords) return null;

  const isKnown = obj.vocabStage === 'known';
  const isNew = obj.vocabStage === 'new';

  return (
    // Hover area covers the full bounding box
    <div
      className="absolute pointer-events-auto"
      style={{
        left: `${obj.coords.x}%`,
        top: `${obj.coords.y}%`,
        width: `${obj.coords.w}%`,
        height: `${obj.coords.h}%`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Label or dot, positioned at top-center of bounding box */}
      <div className="absolute left-1/2 top-0" style={{ transform: 'translate(-50%, -100%)' }}>
        {isHighlighted ? (
          // Expanded label
          <div className="px-2 py-0.5 rounded text-xs whitespace-nowrap shadow-lg backdrop-blur-sm bg-gray-900/85 text-white border border-gray-500/50 mb-1">
            <span className="font-medium">{obj.name.target}</span>
            {isNew && (
              <span className="text-blue-200 ml-1">({obj.name.native})</span>
            )}
          </div>
        ) : !isKnown ? (
          // Dot indicator
          <div
            className={`w-2 h-2 rounded-full mb-1 ${
              isNew
                ? 'bg-blue-400 shadow-blue-400/50 shadow-sm'
                : 'bg-yellow-400/70'
            }`}
            style={isNew ? { animation: 'gentle-pulse 2s ease-in-out infinite' } : undefined}
          />
        ) : null}
      </div>
    </div>
  );
}

// --- NPC Badges ---

function getNPCPosition(index: number, total: number): { x: number; y: number } {
  // Place NPCs in the lower-middle area, spread horizontally
  const spread = Math.min(40, total * 20);
  const startX = 50 - spread / 2;
  const x = total === 1 ? 50 : startX + (spread * index) / (total - 1);
  return { x, y: 78 };
}

function NPCBadge({ npc, position }: { npc: NPCView; position: { x: number; y: number } }) {
  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-8 h-8 rounded-full bg-cyan-900/70 border-2 border-cyan-500/60 backdrop-blur-sm flex items-center justify-center text-sm text-cyan-300 font-medium shadow-lg">
          {npc.name.native.charAt(0).toUpperCase()}
        </div>
        <div className="px-1.5 py-0.5 rounded text-[10px] bg-gray-900/70 text-cyan-300 border border-cyan-700/30 backdrop-blur-sm whitespace-nowrap">
          {npc.name.target}
        </div>
      </div>
    </div>
  );
}

// --- Exit Indicators ---

function getExitPosition(index: number, total: number): { x: number; y: number } {
  // Spread exits along the bottom edge
  const spread = Math.min(70, total * 25);
  const startX = 50 - spread / 2;
  const x = total === 1 ? 50 : startX + (spread * index) / (total - 1);
  return { x, y: 95 };
}

function ExitIndicator({ exit, position }: { exit: ExitView; position: { x: number; y: number } }) {
  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="px-2 py-1 rounded bg-gray-900/70 text-white/80 text-xs border border-gray-500/40 backdrop-blur-sm hover:bg-gray-700/90 hover:text-white transition-all cursor-default whitespace-nowrap">
        {exit.name.target} &rarr;
      </div>
    </div>
  );
}
