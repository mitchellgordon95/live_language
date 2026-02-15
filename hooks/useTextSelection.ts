'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SelectionState {
  selectedText: string;
  position: { x: number; y: number };
  isVisible: boolean;
}

export function useTextSelection() {
  const [state, setState] = useState<SelectionState>({
    selectedText: '',
    position: { x: 0, y: 0 },
    isVisible: false,
  });
  const popupRef = useRef<HTMLDivElement>(null);

  const dismiss = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: false }));
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      // Small delay to let the browser finalize the selection
      requestAnimationFrame(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();
        if (!text || !selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        setState({
          selectedText: text,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top,
          },
          isVisible: true,
        });
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Don't dismiss if clicking within the popup
      if (popupRef.current?.contains(e.target as Node)) return;
      setState(prev => ({ ...prev, isVisible: false }));
    };

    const handleScroll = () => {
      setState(prev => ({ ...prev, isVisible: false }));
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  return { ...state, dismiss, popupRef };
}
