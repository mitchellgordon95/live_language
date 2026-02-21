import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, voice, language } = body;

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
    }

    const langName = language || 'Spanish';
    const payload: Record<string, string> = {
      model: 'gpt-4o-mini-tts',
      voice: voice || 'alloy',
      input: text,
      response_format: 'wav',
      instructions: `Speak in ${langName}. Pronounce naturally as a native ${langName} speaker.`,
    };
    console.log('[TTS] Request:', JSON.stringify(payload));

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      const isRateLimit = res.status === 429;
      console.error('TTS error:', isRateLimit ? '429 rate limited' : err);
      return NextResponse.json(
        { error: isRateLimit ? 'Rate limited — try again shortly' : err },
        { status: isRateLimit ? 429 : 500 },
      );
    }

    const audioBuffer = await res.arrayBuffer();
    console.log('[TTS] Response: %d bytes, status %d', audioBuffer.byteLength, res.status);

    return new Response(new Uint8Array(audioBuffer), {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': String(audioBuffer.byteLength),
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('TTS error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// --- Gemini TTS (backup) ---
// import { GoogleGenAI } from '@google/genai';
// Model: 'gemini-2.5-flash-preview-tts', returns PCM → pcmToWav() → audio/wav
// Voice names: Aoede (default), Kore (Mandarin), Charon (male), Leda (female), Puck (pets)
// Better quality but harsh rate limits. See git history (793e634^) for full implementation.
