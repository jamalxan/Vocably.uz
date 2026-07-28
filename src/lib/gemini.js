import { GoogleGenerativeAI } from '@google/generative-ai';

let client = null;

export function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY sozlanmagan. .env.local faylida GEMINI_API_KEY ni to'ldiring.");
  }
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return client;
}

// data:image/png;base64,xxxx... ko'rinishidagi manzildan mimeType va sof base64 ni ajratib oladi
export function parseDataUrl(dataUrl) {
  const match = /^data:(.+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) {
    return { mimeType: 'image/png', data: (dataUrl || '').split(',').pop() };
  }
  return { mimeType: match[1], data: match[2] };
}
