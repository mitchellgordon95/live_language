import { NextResponse } from 'next/server';

const ttsCache = new Map<string, Buffer>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, voice } = body;

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const cacheKey = `${voice || 'alloy'}:${text}`;
    const cached = ttsCache.get(cacheKey);
    if (cached) {
      return new Response(new Uint8Array(cached), {
        headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(cached.byteLength) },
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
    }

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: voice || 'alloy',
        input: text,
      }),
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
    const buffer = Buffer.from(audioBuffer);
    ttsCache.set(cacheKey, buffer);

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
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
// To switch back, replace the POST handler above with the Gemini implementation below.
//
// import { GoogleGenAI } from '@google/genai';
//
// function pcmToWav(pcmData: Buffer): Buffer {
//   const sampleRate = 24000;
//   const numChannels = 1;
//   const bitsPerSample = 16;
//   const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
//   const blockAlign = numChannels * (bitsPerSample / 8);
//   const dataSize = pcmData.length;
//   const headerSize = 44;
//   const header = Buffer.alloc(headerSize);
//   header.write('RIFF', 0);
//   header.writeUInt32LE(dataSize + headerSize - 8, 4);
//   header.write('WAVE', 8);
//   header.write('fmt ', 12);
//   header.writeUInt32LE(16, 16);
//   header.writeUInt16LE(1, 20);
//   header.writeUInt16LE(numChannels, 22);
//   header.writeUInt32LE(sampleRate, 24);
//   header.writeUInt32LE(byteRate, 28);
//   header.writeUInt16LE(blockAlign, 32);
//   header.writeUInt16LE(bitsPerSample, 34);
//   header.write('data', 36);
//   header.writeUInt32LE(dataSize, 40);
//   return Buffer.concat([header, pcmData]);
// }
//
// Gemini POST handler:
//   const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
//   Retry up to 3 times, model: 'gemini-2.5-flash-preview-tts'
//   Voice names: Aoede (default), Kore (Mandarin), Charon (male NPC), Leda (female NPC), Puck (pets)
//   Returns PCM → needs pcmToWav() → audio/wav
