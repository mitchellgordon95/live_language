'use client';

import { useState } from 'react';
import type { GameView, GameObjectView } from '@/lib/types';

interface ScenePanelProps {
  game: GameView;
}

export default function ScenePanel({ game }: ScenePanelProps) {
  const [hoveredObj, setHoveredObj] = useState<string | null>(null);

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

        {/* Label overlay — matches image bounds exactly */}
        <div className="absolute inset-0 pointer-events-none">
          {labeledObjects.map((obj) => (
            <ObjectLabel
              key={obj.id}
              obj={obj}
              isHovered={hoveredObj === obj.id}
              onMouseEnter={() => setHoveredObj(obj.id)}
              onMouseLeave={() => setHoveredObj(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ObjectLabelProps {
  obj: GameObjectView;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function ObjectLabel({ obj, isHovered, onMouseEnter, onMouseLeave }: ObjectLabelProps) {
  if (!obj.coords) return null;

  // Position label at the top-center of the bounding box
  const centerX = obj.coords.x + obj.coords.w / 2;
  const topY = obj.coords.y;

  // Determine visibility and content based on vocab stage
  const isKnown = obj.vocabStage === 'known';
  const isLearning = obj.vocabStage === 'learning';
  const isNew = obj.vocabStage === 'new';

  // Known words: invisible until hover
  const opacity = isKnown ? (isHovered ? 0.7 : 0) : 1;

  return (
    <div
      className="absolute pointer-events-auto cursor-default"
      style={{
        left: `${centerX}%`,
        top: `${topY}%`,
        transform: 'translate(-50%, -100%)',
        opacity,
        transition: 'opacity 0.3s ease',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={`
          px-2 py-0.5 rounded text-xs whitespace-nowrap
          shadow-lg backdrop-blur-sm
          transition-all duration-300
          ${isNew
            ? 'bg-blue-600/90 text-white border border-blue-400/50'
            : isLearning
            ? 'bg-gray-800/90 text-yellow-300 border border-yellow-600/40'
            : 'bg-gray-800/70 text-green-300/70 border border-green-700/30'
          }
        `}
      >
        <span className="font-medium">{obj.name.target}</span>
        {isNew && (
          <span className="text-blue-200 ml-1">({obj.name.native})</span>
        )}
      </div>
    </div>
  );
}
