import 'server-only';
import { GoogleGenAI, Modality } from '@google/genai';
import {
  getImagePrompt,
  getCoordinateExtractionPrompt,
  type ScenePromptContext,
} from '../scripts/image-prompts';

export type { ScenePromptContext };

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is required');
  return new GoogleGenAI({ apiKey });
}

export async function generateSceneImage(
  context: ScenePromptContext,
): Promise<{ buffer: Buffer; mimeType: string }> {
  const ai = getClient();
  const prompt = getImagePrompt(context);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: prompt,
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        return {
          buffer: Buffer.from(part.inlineData.data, 'base64'),
          mimeType: part.inlineData.mimeType || 'image/webp',
        };
      }
    }
  }

  throw new Error('No image data in Gemini response');
}

export async function extractCoordinates(
  imageBuffer: Buffer,
  mimeType: string,
  objectIds: string[],
  objectNames: string[],
): Promise<Record<string, { x: number; y: number; w: number; h: number }>> {
  if (objectIds.length === 0) return {};

  const ai = getClient();
  const prompt = getCoordinateExtractionPrompt(objectIds, objectNames);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: imageBuffer.toString('base64') } },
          { text: prompt },
        ],
      },
    ],
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.objects || parsed;
    }
  } catch {
    // Fall through to fallback
  }

  // Fallback: centered coordinates
  return Object.fromEntries(
    objectIds.map(id => [id, { x: 50, y: 50, w: 10, h: 10 }])
  );
}

interface LocationData {
  name: { target: string; native: string };
}

interface ObjectData {
  id: string;
  name: { target: string; native: string };
  location: string;
}

export function buildPromptContextForUGC(
  locationId: string,
  location: LocationData,
  moduleName: string,
  objects: ObjectData[],
): ScenePromptContext {
  const objectsHere = objects.filter(o => o.location === locationId);
  return {
    locationId,
    locationName: location.name.native,
    moduleName,
    objectNames: objectsHere.map(o => o.name.native),
  };
}
