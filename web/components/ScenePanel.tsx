'use client';

import { useState } from 'react';
import type { GameView, GameObjectView, ExitView } from '@/lib/types';

interface ScenePanelProps {
  game: GameView;
}

function distributeExits(exits: ExitView[]): { west: ExitView[]; east: ExitView[]; north: ExitView[] } {
  if (exits.length === 0) return { west: [], east: [], north: [] };
  if (exits.length === 1) return { west: [], east: [], north: exits };
  if (exits.length === 2) return { west: [exits[0]], east: [exits[1]], north: [] };
  return { west: [exits[0]], east: [exits[1]], north: exits.slice(2) };
}

export default function ScenePanel({ game }: ScenePanelProps) {
  const [hoveredObjId, setHoveredObjId] = useState<string | null>(null);
  const [goalsExpanded, setGoalsExpanded] = useState(false);

  const hasScene = !!game.scene;
  const imageSrc = hasScene ? `/scenes/${game.scene!.module}/${game.scene!.image}` : null;

  const labeledObjects = game.objects.filter(
    (obj) => obj.coords && (obj.coords.w > 0 || obj.coords.h > 0)
  );
  const objectPortraits = game.portraitHint?.objectChanges || [];
  const activePortraitIds = new Set(objectPortraits.map(p => p.objectId));

  const unlabeledObjects = game.objects.filter(
    (obj) => (!obj.coords || (obj.coords.w === 0 && obj.coords.h === 0))
      && !obj.containerId  // exclude container items (shown on portrait instead)
  );
  const hasPortraits = game.portraitHint?.player || game.npcs.length > 0 || objectPortraits.length > 0;

  const { west: westExits, east: eastExits, north: northExits } = distributeExits(game.exits);
  const visibleGoals = game.goals.filter(g => !g.id.endsWith('_complete'));
  const completedCount = visibleGoals.filter(g => g.completed).length;
  const allComplete = game.goals.some(g => g.id.endsWith('_complete') && g.completed);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Scene with exits and goals overlaid inside the image */}
      {hasScene && imageSrc && (
        <div className="flex-shrink-0 pt-4 pb-2 flex justify-center px-2">
          {/* Scene image container with overlays */}
          <div className="flex-shrink-0 relative" style={{ width: 'min(90%, 65vh)' }}>
            <div className="relative aspect-square overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt={`${game.locationName.native} - ${game.locationName.target}`}
                className="w-full h-full object-cover"
                draggable={false}
              />

              {/* Exit overlays inside the image */}
              {northExits.length > 0 && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {northExits.map(exit => (
                    <ExitPill key={exit.to} exit={exit} direction="north" />
                  ))}
                </div>
              )}
              {westExits.length > 0 && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
                  {westExits.map(exit => (
                    <ExitPill key={exit.to} exit={exit} direction="west" />
                  ))}
                </div>
              )}
              {eastExits.length > 0 && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
                  {eastExits.map(exit => (
                    <ExitPill key={exit.to} exit={exit} direction="east" />
                  ))}
                </div>
              )}

              {/* Goals overlay — top left of image, collapsible */}
              {visibleGoals.length > 0 && (
                <div
                  className="absolute top-2 left-2 z-10 bg-gray-900/70 backdrop-blur-sm rounded-lg p-2 max-w-[60%] cursor-pointer select-none"
                  onClick={() => setGoalsExpanded(!goalsExpanded)}
                >
                  {/* Header + current goal (always visible) */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-300">
                    <span className="text-gray-400">{goalsExpanded ? '\u25bc' : '\u25b6'}</span>
                    {allComplete ? (
                      <span className="text-green-400 font-medium">{'\u2713'} All goals complete!<span className="block text-gray-400 font-normal mt-0.5">Head outside to explore!</span></span>
                    ) : (
                      <span>Goals {completedCount}/{visibleGoals.length}</span>
                    )}
                  </div>
                  {!goalsExpanded && !allComplete && (() => {
                    const next = visibleGoals.find(g => g.suggested) || visibleGoals.find(g => !g.completed);
                    return next ? (
                      <div className="mt-1 flex items-start gap-1.5 text-xs leading-tight text-gray-100">
                        <span className="flex-shrink-0 w-3 text-center">{'\u25b8'}</span>
                        <span>{next.title}</span>
                      </div>
                    ) : null;
                  })()}

                  {/* Expanded: full checklist */}
                  {goalsExpanded && !allComplete && (
                    <div className="mt-1.5 space-y-0.5">
                      {visibleGoals.map(goal => (
                        <div key={goal.id} className={`flex items-start gap-1.5 text-xs leading-tight ${
                          goal.completed ? 'text-gray-500' : goal.suggested ? 'text-gray-100' : 'text-gray-400'
                        }`}>
                          <span className="flex-shrink-0 w-3 text-center">
                            {goal.completed ? '\u2713' : goal.suggested ? '\u25b8' : '\u25cb'}
                          </span>
                          <span className={goal.completed ? 'line-through' : ''}>
                            {goal.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Object label overlays */}
            <div className="absolute inset-0 pointer-events-none rounded-lg">
              {labeledObjects.map((obj) => (
                <ObjectLabel
                  key={obj.id}
                  obj={obj}
                  isHighlighted={hoveredObjId === obj.id}
                  onMouseEnter={() => setHoveredObjId(obj.id)}
                  onMouseLeave={() => setHoveredObjId(null)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Portrait tray — overlaps bottom of scene image */}
      {hasPortraits && hasScene && (
        <div className="-mt-14 flex justify-center items-end gap-4 z-10 pointer-events-none px-3 mb-1">
          {game.portraitHint?.player && (
            <PortraitAvatar
              src={`/scenes/${game.scene!.module}/portraits/${game.portraitHint.player}`}
              alt="You"
              size="lg"
            />
          )}
          {game.npcs.map((npc) => (
            <PortraitAvatar
              key={npc.id}
              src={npc.portrait ? `/scenes/${game.scene!.module}/portraits/${npc.portrait}` : undefined}
              alt={npc.name.native}
              label={npc.name.target}
              mood={npc.mood}
              fallbackLetter={npc.name.native.charAt(0).toUpperCase()}
              size="md"
            />
          ))}
          {objectPortraits.map((change) => {
            const obj = game.objects.find(o => o.id === change.objectId);
            const containedItems = game.objects.filter(o => o.containerId === change.objectId);
            // Cached portraits use full paths (starting with /), pre-generated use relative filenames
            const imgSrc = change.image.startsWith('/')
              ? change.image
              : `/scenes/${game.scene!.module}/portraits/${change.image}`;
            return (
              <PortraitWithItems
                key={`obj-${change.objectId}`}
                src={imgSrc}
                alt={obj?.name.native || change.objectId}
                label={obj?.name.target}
                items={containedItems}
                generating={change.generating}
              />
            );
          })}
        </div>
      )}

      {/* Below-scene info */}
      <div className="px-4 pb-4 space-y-2 flex-shrink-0">
        {/* No-scene fallback: full text layout */}
        {!hasScene && (
          <>
            <div>
              <h2 className="text-lg font-bold text-blue-400">{game.locationName.native}</h2>
              <p className="text-sm text-gray-400">{game.locationName.target}</p>
            </div>
            {game.npcs.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Who&apos;s here</div>
                <div className="space-y-1">
                  {game.npcs.map((npc) => (
                    <div key={npc.id} className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-cyan-900/50 border border-cyan-700/50 flex items-center justify-center text-xs text-cyan-400">
                        {npc.name.native.charAt(0).toUpperCase()}
                      </div>
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
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Objects</div>
              <div className="flex flex-wrap gap-1.5">
                {game.objects.map((obj) => (
                  <ObjectPill key={obj.id} obj={obj} />
                ))}
              </div>
            </div>
            {/* Goals as card when no scene */}
            {visibleGoals.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-3 border border-purple-900/50">
                <div
                  className="flex items-center gap-1.5 text-purple-400 text-xs font-medium uppercase tracking-wide cursor-pointer select-none"
                  onClick={() => setGoalsExpanded(!goalsExpanded)}
                >
                  <span>{goalsExpanded ? '\u25bc' : '\u25b6'}</span>
                  {allComplete ? (
                    <span className="text-green-400">All goals complete!<span className="block text-gray-400 text-xs font-normal mt-0.5">Head outside to explore!</span></span>
                  ) : (
                    <span>Goals {completedCount}/{visibleGoals.length}</span>
                  )}
                </div>
                {goalsExpanded && !allComplete && (
                  <div className="space-y-1 mt-2">
                    {visibleGoals.map((goal) => (
                      <div key={goal.id} className={`flex items-start gap-2 text-sm ${
                        goal.completed ? 'text-gray-600' : goal.suggested ? 'text-gray-200' : 'text-gray-500'
                      }`}>
                        <span className="mt-0.5 flex-shrink-0 text-xs w-3">
                          {goal.completed ? '\u2713' : goal.suggested ? '\u25b8' : '\u25cb'}
                        </span>
                        <div className="min-w-0">
                          <div className={goal.completed ? 'line-through' : ''}>{goal.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Exits as text when no scene */}
            {game.exits.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Exits</div>
                <div className="flex flex-wrap gap-1.5">
                  {game.exits.map((exit) => (
                    <span key={exit.to} className="text-xs px-2 py-1 rounded bg-gray-700/30 text-gray-300 border border-gray-600/30 cursor-default">
                      {exit.name.target} <span className="text-gray-500">({exit.name.native})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* "Also here" objects without coordinates */}
        {hasScene && unlabeledObjects.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Also here</div>
            <div className="flex flex-wrap gap-1.5">
              {unlabeledObjects.map((obj) => (
                <ObjectPill key={obj.id} obj={obj} />
              ))}
            </div>
          </div>
        )}

        {/* Inventory */}
        {game.inventory.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Inventory</div>
            <div className="flex flex-wrap gap-1.5">
              {game.inventory.map((item) => (
                <span key={item.id} className={`text-xs px-2 py-1 rounded border ${item.cooked ? 'bg-orange-900/30 text-orange-200 border-orange-600/50' : 'bg-gray-700/50 text-gray-300 border-gray-600/50'}`}>
                  {item.name.target}{item.cooked ? ' (cocinado)' : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Compact needs 2x2 */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 max-w-sm mx-auto">
          <CompactNeed icon={"\u26a1"} value={game.needs.energy} label="Energy" />
          <CompactNeed icon={"\ud83c\udf54"} value={game.needs.hunger} label="Hunger" />
          <CompactNeed icon={"\ud83e\uddfc"} value={game.needs.hygiene} label="Hygiene" />
          <CompactNeed icon={"\ud83d\udebb"} value={game.needs.bladder} label="Bladder" />
        </div>

        {/* Verb hints */}
        {game.verbs.length > 0 && (
          <div className="text-center text-xs text-gray-600 pt-1">
            {game.verbs.map((v, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1">&middot;</span>}
                <span className="text-gray-500">{v.target}</span>
                <span className="text-gray-700 ml-0.5">({v.native})</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Exit Pill (directional, inside image) ---

function ExitPill({ exit, direction }: { exit: ExitView; direction: 'north' | 'west' | 'east' }) {
  const arrow = direction === 'west' ? '\u2190' : direction === 'east' ? '\u2192' : '\u2191';
  return (
    <div className="text-xs px-2 py-0.5 rounded-full bg-gray-900/60 text-gray-200 border border-gray-500/30 backdrop-blur-sm whitespace-nowrap cursor-default">
      {direction === 'west' && <span className="text-gray-400 mr-1">{arrow}</span>}
      {exit.name.target}
      {direction !== 'west' && <span className="text-gray-400 ml-1">{arrow}</span>}
    </div>
  );
}

// --- Object Pill (text list item) ---

function ObjectPill({ obj }: { obj: GameObjectView }) {
  return (
    <span className={`text-xs px-2 py-1 rounded cursor-default ${
      obj.vocabStage === 'known'
      ? 'bg-green-900/30 text-green-400 border border-green-800/50'
      : obj.vocabStage === 'learning'
      ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50'
      : 'bg-gray-700/50 text-gray-300 border border-gray-600/50'
    }`}>
      {obj.vocabStage === 'known' ? obj.name.target : `${obj.name.target} (${obj.name.native})`}
    </span>
  );
}

// --- Compact Needs Bar ---

function CompactNeed({ icon, value, label }: { icon: string; value: number; label: string }) {
  const color = value > 60 ? 'bg-green-500' : value > 30 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-1 flex-1" title={`${label}: ${value}%`}>
      <span className="text-sm">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between text-[10px] text-gray-500 leading-none mb-0.5">
          <span>{label}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
        </div>
      </div>
    </div>
  );
}

// --- Object Labels (dot-based with vocab pip) ---

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
  const vocabColor = isKnown ? 'bg-green-400' : obj.vocabStage === 'learning' ? 'bg-yellow-400' : 'bg-blue-400';

  return (
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
      <div className="absolute left-1/2 top-0" style={{ transform: 'translate(-50%, -100%)' }}>
        {isHighlighted ? (
          <div className="px-2 py-0.5 rounded text-xs whitespace-nowrap shadow-lg backdrop-blur-sm bg-gray-900/85 text-white border border-gray-500/50 mb-1 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${vocabColor} flex-shrink-0`} />
            <span className="font-medium">{obj.name.target}</span>
            {!isKnown && (
              <span className="text-blue-200">({obj.name.native})</span>
            )}
          </div>
        ) : !isKnown ? (
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
  mood?: string;
  fallbackLetter?: string;
  size: 'lg' | 'md';
}

function PortraitAvatar({ src, alt, label, mood, fallbackLetter, size }: PortraitAvatarProps) {
  const sizeClasses = size === 'lg'
    ? 'w-40 h-40 border-2 border-gray-600'
    : 'w-32 h-32 border-2 border-cyan-500/60';

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
        <div className={`${sizeClasses} rounded-lg bg-cyan-900/70 backdrop-blur-sm flex items-center justify-center text-3xl text-cyan-300 font-medium shadow-lg`}>
          {fallbackLetter || alt.charAt(0).toUpperCase()}
        </div>
      )}
      {(label || mood) && (
        <div className="px-2 py-1 rounded text-xs bg-gray-900/80 backdrop-blur-sm whitespace-nowrap text-center">
          {label && <span className="text-gray-300">{label}</span>}
          {mood && <span className="text-gray-500 ml-1">- {mood}</span>}
        </div>
      )}
    </div>
  );
}

// --- Portrait with contained item dots (e.g. open fridge with food items) ---

function PortraitWithItems({ src, alt, label, items, generating }: {
  src: string;
  alt: string;
  label?: string;
  items: GameObjectView[];
  generating?: boolean;
}) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative w-32 h-32">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={`w-32 h-32 border-2 border-cyan-500/60 rounded-lg object-cover shadow-lg ${generating ? 'animate-pulse' : ''}`}
        />
        {/* Item dots overlaid on portrait */}
        {items.length > 0 && (
          <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-1.5 pointer-events-auto">
            {items.map((item) => {
              const isKnown = item.vocabStage === 'known';
              const vocabColor = isKnown ? 'bg-green-400' : item.vocabStage === 'learning' ? 'bg-yellow-400' : 'bg-blue-400';
              const isHovered = hoveredItem === item.id;
              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${vocabColor} border border-white/30 cursor-default ${
                      item.vocabStage === 'new' ? 'shadow-sm' : ''
                    }`}
                    style={item.vocabStage === 'new' ? { animation: 'gentle-pulse 2s ease-in-out infinite' } : undefined}
                  />
                  {isHovered && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded text-xs whitespace-nowrap shadow-lg backdrop-blur-sm bg-gray-900/90 text-white border border-gray-500/50 flex items-center gap-1.5 z-20">
                      <span className={`w-1.5 h-1.5 rounded-full ${vocabColor} flex-shrink-0`} />
                      <span className="font-medium">{item.name.target}</span>
                      {!isKnown && <span className="text-blue-200">({item.name.native})</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {label && (
        <div className="px-2 py-1 rounded text-xs bg-gray-900/80 backdrop-blur-sm whitespace-nowrap text-center">
          <span className="text-gray-300">{label}</span>
        </div>
      )}
    </div>
  );
}
