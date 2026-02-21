'use client';

import { useState, useRef, useEffect } from 'react';

interface InputBarProps {
  onSubmit: (input: string) => void;
  onHelp: () => void;
  disabled: boolean;
  placeholder?: string;
  isRecording?: boolean;
  isTranscribing?: boolean;
  onMicToggle?: () => void;
  sttResult?: string;
}

export default function InputBar({ onSubmit, onHelp, disabled, placeholder, isRecording, isTranscribing, onMicToggle, sttResult }: InputBarProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  // When STT produces a result, populate the input field
  useEffect(() => {
    if (sttResult) {
      setInput(sttResult);
      inputRef.current?.focus();
    }
  }, [sttResult]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        placeholder={isRecording ? 'Listening...' : isTranscribing ? 'Transcribing...' : (placeholder || 'Type something...')}
        className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        autoComplete="off"
        spellCheck={false}
      />
      {onMicToggle && (
        <button
          type="button"
          onClick={onMicToggle}
          disabled={disabled || isTranscribing}
          className={`px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-medium transition-colors ${
            isRecording
              ? 'bg-red-600 text-white hover:bg-red-500 animate-pulse'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          } disabled:opacity-50`}
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isTranscribing ? '...' : isRecording ? '⏹' : '🎤'}
        </button>
      )}
      <button
        type="button"
        onClick={onHelp}
        className="px-3 md:px-4 py-2.5 md:py-3 bg-amber-500 text-gray-900 rounded-lg font-bold text-lg hover:bg-amber-400 transition-colors"
        title="Help — what can I do?"
      >
        ?
      </button>
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
      >
        {disabled ? '...' : 'Send'}
      </button>
    </form>
  );
}
