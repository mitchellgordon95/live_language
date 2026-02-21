'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export function useSTT() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const callbackRef = useRef<((text: string) => void) | null>(null);
  const languageRef = useRef<string>('');

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    recorderRef.current = null;
    chunksRef.current = [];
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startRecording = useCallback(async (languageCode: string, onResult: (text: string) => void) => {
    if (isRecording || isTranscribing) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      callbackRef.current = onResult;
      languageRef.current = languageCode;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setIsRecording(false);
        setIsTranscribing(true);

        try {
          const formData = new FormData();
          formData.append('file', blob, `audio.${mimeType === 'audio/webm' ? 'webm' : 'mp4'}`);
          formData.append('language', languageRef.current);

          const res = await fetch('/api/stt', { method: 'POST', body: formData });
          if (res.ok) {
            const { text } = await res.json();
            if (text && callbackRef.current) {
              callbackRef.current(text);
            }
          }
        } catch (err) {
          console.error('STT transcription error:', err);
        } finally {
          setIsTranscribing(false);
          cleanup();
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access error:', err);
      cleanup();
    }
  }, [isRecording, isTranscribing, cleanup]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
  }, []);

  return { isRecording, isTranscribing, startRecording, stopRecording };
}
