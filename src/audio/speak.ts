import { spawn } from 'child_process';

/**
 * Speak text using macOS say command with Spanish voice.
 * Audio plays asynchronously (non-blocking).
 */
export function speak(text: string, options?: { voice?: string; rate?: number }): void {
  const voice = options?.voice ?? 'Paulina'; // Mexican Spanish
  const rate = options?.rate ?? 180;

  // Clean text for shell safety and better pronunciation
  const cleanText = text
    .replace(/["""]/g, '') // Remove quotes
    .replace(/\n/g, ' ');   // Replace newlines with spaces

  spawn('say', ['-v', voice, '-r', String(rate), cleanText], {
    stdio: 'ignore', // Don't capture output
    detached: true,  // Don't block
  }).unref(); // Allow Node to exit even if say is still running
}
