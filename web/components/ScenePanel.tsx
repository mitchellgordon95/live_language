'use client';

import type { GameView, GameObjectView } from '@/lib/types';

interface ScenePanelProps {
  game: GameView;
  hoveredObjId: string | null;
  onHoverObj: (id: string | null) => void;
}

export default function ScenePanel({ game, hoveredObjId, onHoverObj }: ScenePanelProps) {
  // No scene image available — show placeholder
  if (!game.scene) {
    return (
      <div className="relative w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 rounded-lg" style={{
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

  const hasPortraits = game.portraitHint?.player || game.npcs.length > 0;

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg flex flex-col items-center">
      {/* Square container — matches 1024x1024 scene images */}
      <div className="relative aspect-square max-w-full max-h-[calc(100%-2rem)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={`${game.locationName.native} - ${game.locationName.target}`}
          className="w-full h-full object-cover rounded"
          draggable={false}
        />

        {/* Overlay layer — object labels and vignettes only */}
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

          {/* Object state vignettes */}
          {game.portraitHint?.objectChanges?.map((change) => {
            const obj = game.objects.find(o => o.id === change.objectId);
            if (!obj?.coords) return null;
            return (
              <div
                key={`vignette-${change.objectId}`}
                className="absolute pointer-events-none"
                style={{
                  left: `${obj.coords.x}%`,
                  top: `${obj.coords.y}%`,
                  transform: 'translate(-50%, -50%)',
                  animation: 'portrait-fade-in 0.4s ease-out',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/scenes/${game.scene!.module}/portraits/${change.image}`}
                  alt={obj.name.native}
                  className="w-24 h-24 rounded-lg border-2 border-white/30 shadow-lg"
                />
              </div>
            );
          })}
        </div>

        {/* Portrait tray — overlaps bottom edge of scene */}
        {hasPortraits && (
          <div className="absolute -bottom-8 left-0 right-0 flex justify-center items-end gap-3 z-10 pointer-events-none">
            {/* Player portrait */}
            {game.portraitHint?.player && (
              <PortraitAvatar
                src={`/scenes/${game.scene.module}/portraits/${game.portraitHint.player}`}
                alt="You"
                size="lg"
              />
            )}
            {/* NPC portraits */}
            {game.npcs.map((npc) => (
              <PortraitAvatar
                key={npc.id}
                src={npc.portrait ? `/scenes/${game.scene!.module}/portraits/${npc.portrait}` : undefined}
                alt={npc.name.native}
                label={npc.name.target}
                fallbackLetter={npc.name.native.charAt(0).toUpperCase()}
                size="md"
              />
            ))}
          </div>
        )}
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

// --- Portrait Avatar (used in tray below scene) ---

interface PortraitAvatarProps {
  src?: string;
  alt: string;
  label?: string;
  fallbackLetter?: string;
  size: 'lg' | 'md';
}

function PortraitAvatar({ src, alt, label, fallbackLetter, size }: PortraitAvatarProps) {
  const sizeClasses = size === 'lg'
    ? 'w-20 h-20 border-2 border-gray-600'
    : 'w-16 h-16 border-2 border-cyan-500/60';

  return (
    <div className="flex flex-col items-center gap-0.5">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={`${sizeClasses} rounded-lg object-cover shadow-lg`}
        />
      ) : (
        <div className={`${sizeClasses} rounded-lg bg-cyan-900/70 backdrop-blur-sm flex items-center justify-center text-lg text-cyan-300 font-medium shadow-lg`}>
          {fallbackLetter || alt.charAt(0).toUpperCase()}
        </div>
      )}
      {label && (
        <div className="px-1.5 py-0.5 rounded text-[10px] bg-gray-900/80 text-gray-300 backdrop-blur-sm whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  );
}
