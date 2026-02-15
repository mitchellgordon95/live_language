'use client';

import { forwardRef } from 'react';

interface SpeakerPopupProps {
  text: string;
  position: { x: number; y: number };
  onSpeak: (text: string) => void;
  onDismiss: () => void;
}

export const SpeakerPopup = forwardRef<HTMLDivElement, SpeakerPopupProps>(
  function SpeakerPopup({ text, position, onSpeak, onDismiss }, ref) {
    return (
      <div
        ref={ref}
        className="fixed z-50 animate-in fade-in zoom-in-95 duration-150"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -120%)',
        }}
      >
        <button
          onMouseDown={e => e.preventDefault()}
          onClick={() => { onSpeak(text); onDismiss(); }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-full shadow-lg transition-colors"
          title="Listen"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-cyan-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          <span className="text-xs text-gray-300 max-w-[120px] truncate">{text}</span>
        </button>
      </div>
    );
  }
);
