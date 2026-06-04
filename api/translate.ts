import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, content, targetLanguage } = req.body;

  if (!targetLanguage) {
    return res.status(400).json({ error: 'Target language is required.' });
  }

  try {
    const prompt = `You are a professional literary translator. Translate the following book chapter into ${targetLanguage}.
You must preserve ALL HTML tags, inline style classes, block indentations, and tag attributes exactly as they exist in the input content. Translate ONLY the actual user-readable words.

Original Title: "${title || ''}"
Original Content (with HTML):
${content || ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Translate the literary content accurately. Output an object containing both the translated title and the translated HTML content.',
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedTitle: { type: Type.STRING },
            translatedContent: { type: Type.STRING },
          },
          required: ['translatedTitle', 'translatedContent'],
        },
      },
    });

    const results = JSON.parse(response.text?.trim() || '{}');
    res.json({
      translatedTitle: results.translatedTitle || title,
      translatedContent: results.translatedContent || content,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Translation error.' });
  }
}
