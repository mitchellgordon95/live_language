import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const language = formData.get('language') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Missing audio file' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
    }

    const whisperForm = new FormData();
    whisperForm.append('file', file, 'audio.webm');
    whisperForm.append('model', 'whisper-1');
    if (language) {
      whisperForm.append('language', language);
    }

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: whisperForm,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('STT error:', err);
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const result = await res.json();
    return NextResponse.json({ text: result.text || '' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('STT error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
