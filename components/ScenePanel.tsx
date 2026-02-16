'use client';

import { useState } from 'react';
import type { GameView, GameObjectView, ExitView } from '@/lib/types';

interface ScenePanelProps {
  game: GameView;
  onSpeak?: (text: string) => void;
}

function distributeExits(exits: ExitView[]): { west: ExitView[]; east: ExitView[]; north: ExitView[] } {
  if (exits.length === 0) return { west: [], east: [], north: [] };
  if (exits.length === 1) return { west: [], east: [], north: exits };
  if (exits.length === 2) return { west: [exits[0]], east: [exits[1]], north: [] };
  return { west: [exits[0]], east: [exits[1]], north: exits.slice(2) };
}

function resolveVignetteUrl(path: string, sceneBase: string): string {
  if (path.startsWith('/') || path.startsWith('http')) return path;
  return `${sceneBase}/vignettes/${path}`;
}

export default function ScenePanel({ game, onSpeak }: ScenePanelProps) {
  const [hoveredObjId, setHoveredObjId] = useState<string | null>(null);
  const [tutorialExpanded, setTutorialExpanded] = useState(false);

  const hasScene = !!game.scene;
  const sceneBase = hasScene ? `/scenes/${game.scene!.languageId}/${game.scene!.module}` : '';
  const imageSrc = hasScene
    ? (game.scene!.imageUrl || `${sceneBase}/${game.scene!.image}`)
    : null;

  const labeledObjects = game.objects.filter(
    (obj) => obj.coords && (obj.coords.w > 0 || obj.coords.h > 0)
  );
  const objectVignettes = game.vignetteHint?.objectChanges || [];
  const activeVignetteIds = new Set(objectVignettes.map(p => p.objectId));

  const unlabeledObjects = game.objects.filter(
    (obj) => (!obj.coords || (obj.coords.w === 0 && obj.coords.h === 0))
      && !obj.containerId  // exclude container items (shown on vignette instead)
  );
  const hasVignettes = game.vignetteHint?.player || game.npcs.length > 0 || objectVignettes.length > 0;

  const { west: westExits, east: eastExits, north: northExits } = distributeExits(game.exits);
  const [questsExpanded, setQuestsExpanded] = useState(false);

  const visibleSteps = game.tutorial;
  const completedCount = visibleSteps.filter(g => g.completed).length;
  const tutorialComplete = game.tutorialComplete;
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const activeQuests = game.quests.filter(q => q.active);
  const hasQuests = activeQuests.length > 0;

  const [infoExpanded, setInfoExpanded] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-y-auto md:overflow-y-auto overflow-y-hidden">
      {/* Scene with exits and goals overlaid inside the image */}
      {hasScene && imageSrc && (
        <div className="flex-shrink-0 pt-2 md:pt-4 pb-1 md:pb-2 flex justify-center px-2">
          {/* Scene image container with overlays */}
          <div className="flex-shrink-0 relative max-h-[35vh] md:max-h-none" style={{ width: 'min(90%, 65vh)' }}>
            <div className="relative aspect-square overflow-hidden rounded-lg max-h-[35vh] md:max-h-none">
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

              {/* Tutorial + Quest overlays — stacked vertically, top left of image */}
              <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5 max-w-[60%]">
                {/* Tutorial Complete Banner */}
                {tutorialComplete && !bannerDismissed && (
                  <div
                    className="bg-gradient-to-br from-amber-900/80 to-yellow-900/70 backdrop-blur-sm rounded-lg p-3 cursor-pointer select-none border border-amber-500/40"
                    onClick={() => setBannerDismissed(true)}
                  >
                    <div className="text-sm font-semibold text-amber-200">Tutorial Complete!</div>
                    <div className="mt-1 text-xs text-amber-100/80 leading-relaxed">
                      You&apos;ve got the basics down. Explore new rooms, go outside, meet people, and complete quests!
                    </div>
                    <div className="mt-1.5 text-[10px] text-amber-300/50">click to dismiss</div>
                  </div>
                )}

                {/* Tutorial */}
                {visibleSteps.length > 0 && !tutorialComplete && (
                  <div
                    className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-2 cursor-pointer select-none"
                    onClick={() => setTutorialExpanded(!tutorialExpanded)}
                  >
                    <div className="flex items-center gap-1.5 text-xs text-gray-300">
                      <span className="text-gray-400">{tutorialExpanded ? '\u25bc' : '\u25b6'}</span>
                      <span>Tutorial {completedCount}/{visibleSteps.length}</span>
                    </div>
                    {!tutorialExpanded && (() => {
                      const next = visibleSteps.find(g => g.suggested) || visibleSteps.find(g => !g.completed);
                      return next ? (
                        <div className="mt-1 flex items-start gap-1.5 text-xs leading-tight text-gray-100">
                          <span className="flex-shrink-0 w-3 text-center">{'\u25b8'}</span>
                          <span>{next.title}</span>
                        </div>
                      ) : null;
                    })()}
                    {tutorialExpanded && (
                      <div className="mt-1.5 space-y-0.5">
                        {visibleSteps.map(step => (
                          <div key={step.id} className={`flex items-start gap-1.5 text-xs leading-tight ${
                            step.completed ? 'text-gray-500' : step.suggested ? 'text-gray-100' : 'text-gray-400'
                          }`}>
                            <span className="flex-shrink-0 w-3 text-center">
                              {step.completed ? '\u2713' : step.suggested ? '\u25b8' : '\u25cb'}
                            </span>
                            <span className={step.completed ? 'line-through' : ''}>
                              {step.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Quests */}
                {hasQuests && (
                  <div
                    className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-2 cursor-pointer select-none"
                    onClick={() => setQuestsExpanded(!questsExpanded)}
                  >
                    <div className="flex items-center gap-1.5 text-xs text-amber-300">
                      <span className="text-amber-400">{questsExpanded ? '\u25bc' : '\u25b6'}</span>
                      <span>Quests ({activeQuests.length})</span>
                    </div>
                    {!questsExpanded && activeQuests.length > 0 && (
                      <div className="mt-1 flex items-start gap-1.5 text-xs leading-tight text-gray-100">
                        <span className="flex-shrink-0 w-3 text-center text-amber-400">{'\u25b8'}</span>
                        <span>{activeQuests[0].title.native}</span>
                      </div>
                    )}
                    {questsExpanded && (
                      <div className="mt-1.5 space-y-1">
                        {activeQuests.map(quest => (
                          <div key={quest.id} className="text-xs leading-tight">
                            <div className="flex items-start gap-1.5 text-amber-200">
                              <span className="flex-shrink-0 w-3 text-center text-amber-400">{'\u25b8'}</span>
                              <span>{quest.title.native}</span>
                            </div>
                            <div className="ml-[1.125rem] text-gray-400">{quest.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                  onSpeak={onSpeak}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vignette tray — overlaps bottom of scene image */}
      {hasVignettes && hasScene && (
        <div className="-mt-8 md:-mt-14 flex justify-center items-end gap-2 md:gap-4 z-10 pointer-events-none px-2 md:px-3 mb-1">
          {game.vignetteHint?.player && (
            <VignetteAvatar
              src={resolveVignetteUrl(game.vignetteHint.player, sceneBase)}
              alt="You"
              size="lg"
            />
          )}
          {game.npcs.map((npc) => (
            <VignetteAvatar
              key={npc.id}
              src={npc.portrait ? resolveVignetteUrl(npc.portrait, sceneBase) : undefined}
              alt={npc.name.native}
              label={npc.name.target}
              mood={npc.mood}
              fallbackLetter={npc.name.native.charAt(0).toUpperCase()}
              size="md"
            />
          ))}
          {objectVignettes.map((change) => {
            const obj = game.objects.find(o => o.id === change.objectId);
            const containedItems = game.objects.filter(o => o.containerId === change.objectId);
            // Cached vignettes use full paths (starting with /), pre-generated use relative filenames
            const imgSrc = change.image.startsWith('/')
              ? change.image
              : `${sceneBase}/vignettes/${change.image}`;
            return (
              <VignetteWithItems
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

      {/* Below-scene info — collapsible on mobile, always visible on desktop */}
      {/* Mobile: compact needs bar + expandable drawer */}
      <div className="md:hidden flex-shrink-0">
        <button
          onClick={() => setInfoExpanded(!infoExpanded)}
          className="w-full flex items-center gap-2 px-3 py-1.5 bg-gray-900/80 border-y border-gray-800"
        >
          <NeedDot value={game.needs.energy} label="Energy" />
          <NeedDot value={game.needs.hunger} label="Hunger" />
          <NeedDot value={game.needs.hygiene} label="Hygiene" />
          <NeedDot value={game.needs.bladder} label="Bladder" />
          {game.inventory.length > 0 && (
            <span className="text-[10px] text-gray-500 ml-1">{game.inventory.length} item{game.inventory.length !== 1 ? 's' : ''}</span>
          )}
          <span className="ml-auto text-gray-600 text-xs">{infoExpanded ? '\u25b2' : '\u25bc'}</span>
        </button>
        {infoExpanded && (
          <InfoContent
            game={game}
            hasScene={hasScene}
            unlabeledObjects={unlabeledObjects}
            visibleSteps={visibleSteps}
            completedCount={completedCount}
            tutorialComplete={tutorialComplete}
            tutorialExpanded={tutorialExpanded}
            setTutorialExpanded={setTutorialExpanded}
            hasQuests={hasQuests}
            activeQuests={activeQuests}
            questsExpanded={questsExpanded}
            setQuestsExpanded={setQuestsExpanded}
          />
        )}
      </div>

      {/* Desktop: always visible */}
      <div className="hidden md:block">
        <InfoContent
          game={game}
          hasScene={hasScene}
          unlabeledObjects={unlabeledObjects}
          visibleSteps={visibleSteps}
          completedCount={completedCount}
          tutorialComplete={tutorialComplete}
          tutorialExpanded={tutorialExpanded}
          setTutorialExpanded={setTutorialExpanded}
          hasQuests={hasQuests}
          activeQuests={activeQuests}
          questsExpanded={questsExpanded}
          setQuestsExpanded={setQuestsExpanded}
        />
      </div>
    </div>
  );
}

// --- Info Content (shared between mobile drawer and desktop) ---

function InfoContent({ game, hasScene, unlabeledObjects, visibleSteps, completedCount, tutorialComplete, tutorialExpanded, setTutorialExpanded, hasQuests, activeQuests, questsExpanded, setQuestsExpanded }: {
  game: GameView;
  hasScene: boolean;
  unlabeledObjects: GameObjectView[];
  visibleSteps: { id: string; title: string; hint: string; completed: boolean; suggested: boolean }[];
  completedCount: number;
  tutorialComplete: boolean;
  tutorialExpanded: boolean;
  setTutorialExpanded: (v: boolean) => void;
  hasQuests: boolean;
  activeQuests: { id: string; title: { target: string; native: string }; description: string }[];
  questsExpanded: boolean;
  setQuestsExpanded: (v: boolean) => void;
}) {
  return (
    <div className="px-4 pb-3 md:pb-4 space-y-2 flex-shrink-0">
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
          {/* Tutorial as card when no scene */}
          {visibleSteps.length > 0 && !tutorialComplete && (
            <div className="bg-gray-800/50 rounded-lg p-3 border border-purple-900/50">
              <div
                className="flex items-center gap-1.5 text-purple-400 text-xs font-medium uppercase tracking-wide cursor-pointer select-none"
                onClick={() => setTutorialExpanded(!tutorialExpanded)}
              >
                <span>{tutorialExpanded ? '\u25bc' : '\u25b6'}</span>
                <span>Tutorial {completedCount}/{visibleSteps.length}</span>
              </div>
              {tutorialExpanded && (
                <div className="space-y-1 mt-2">
                  {visibleSteps.map((step) => (
                    <div key={step.id} className={`flex items-start gap-2 text-sm ${
                      step.completed ? 'text-gray-600' : step.suggested ? 'text-gray-200' : 'text-gray-500'
                    }`}>
                      <span className="mt-0.5 flex-shrink-0 text-xs w-3">
                        {step.completed ? '\u2713' : step.suggested ? '\u25b8' : '\u25cb'}
                      </span>
                      <div className="min-w-0">
                        <div className={step.completed ? 'line-through' : ''}>{step.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Quest card when no scene */}
          {hasQuests && (
            <div className="bg-gray-800/50 rounded-lg p-3 border border-amber-900/50">
              <div
                className="flex items-center gap-1.5 text-amber-400 text-xs font-medium uppercase tracking-wide cursor-pointer select-none"
                onClick={() => setQuestsExpanded(!questsExpanded)}
              >
                <span>{questsExpanded ? '\u25bc' : '\u25b6'}</span>
                <span>Quests ({activeQuests.length})</span>
              </div>
              {questsExpanded && (
                <div className="space-y-2 mt-2">
                  {activeQuests.map((quest) => (
                    <div key={quest.id} className="text-sm">
                      <div className="text-amber-200">{quest.title.native}</div>
                      <div className="text-gray-400 text-xs">{quest.description}</div>
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
  );
}

// --- Need Dot (tiny mobile indicator) ---

function NeedDot({ value, label }: { value: number; label: string }) {
  const color = value > 60 ? 'bg-green-500' : value > 30 ? 'bg-yellow-500' : 'bg-red-500';
  return <div className={`w-2.5 h-2.5 rounded-full ${color}`} title={`${label}: ${value}%`} />;
}

// --- Exit Pill (directional, inside image) ---

function ExitPill({ exit, direction }: { exit: ExitView; direction: 'north' | 'west' | 'east' }) {
  const arrow = direction === 'west' ? '\u2190' : direction === 'east' ? '\u2192' : '\u2191';
  const unvisited = exit.visited === false;
  return (
    <div
      className={`text-xs px-2 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap cursor-default ${
        unvisited
          ? 'bg-indigo-900/60 text-indigo-100 border border-indigo-400/50'
          : 'bg-gray-900/60 text-gray-200 border border-gray-500/30'
      }`}
      style={unvisited ? { animation: 'exit-glow 2s ease-in-out infinite' } : undefined}
    >
      {direction === 'west' && <span className={`${unvisited ? 'text-indigo-300' : 'text-gray-400'} mr-1`}>{arrow}</span>}
      {exit.name.target}
      {direction !== 'west' && <span className={`${unvisited ? 'text-indigo-300' : 'text-gray-400'} ml-1`}>{arrow}</span>}
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
  onSpeak?: (text: string) => void;
}

function ObjectLabel({ obj, isHighlighted, onMouseEnter, onMouseLeave, onSpeak }: ObjectLabelProps) {
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
            {onSpeak && (
              <button
                onClick={(e) => { e.stopPropagation(); onSpeak(obj.name.target); }}
                className="ml-0.5 text-cyan-400 hover:text-cyan-300 transition-colors flex-shrink-0"
                title="Listen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              </button>
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

// --- Vignette Avatar (used in tray below scene) ---

interface VignetteAvatarProps {
  src?: string;
  alt: string;
  label?: string;
  mood?: string;
  fallbackLetter?: string;
  size: 'lg' | 'md';
}

function VignetteAvatar({ src, alt, label, mood, fallbackLetter, size }: VignetteAvatarProps) {
  const sizeClasses = size === 'lg'
    ? 'w-20 h-20 md:w-40 md:h-40 border-2 border-gray-600'
    : 'w-16 h-16 md:w-32 md:h-32 border-2 border-cyan-500/60';

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
        <div className={`${sizeClasses} rounded-lg bg-cyan-900/70 backdrop-blur-sm flex items-center justify-center text-xl md:text-3xl text-cyan-300 font-medium shadow-lg`}>
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

// --- Vignette with contained item dots (e.g. open fridge with food items) ---

function VignetteWithItems({ src, alt, label, items, generating }: {
  src: string;
  alt: string;
  label?: string;
  items: GameObjectView[];
  generating?: boolean;
}) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative w-16 h-16 md:w-32 md:h-32">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={`w-16 h-16 md:w-32 md:h-32 border-2 border-cyan-500/60 rounded-lg object-cover shadow-lg ${generating ? 'animate-pulse' : ''}`}
        />
        {/* Item dots overlaid on vignette */}
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
