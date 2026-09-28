/**
 * Studio Voice Synthesis Service
 * Provides authentic Gemini Live voices from langchain-ai/voice-demo:
 * - Aoede (Default, warm, expressive female voice)
 * - Puck (Conversational, natural male voice)
 * - Charon (Deep, calm guide voice)
 * - Kore (Gentle, soothing female voice)
 * - Fenrir (Energetic male voice)
 */

export const AVAILABLE_VOICES = [
  { id: 'Aoede', name: 'Aoede (Gemini Live Studio)', gender: 'female', description: 'Warm, natural, expressive voice from langchain-ai/voice-demo (Default)', default: true },
  { id: 'Puck', name: 'Puck (Gemini Live Studio)', gender: 'male', description: 'Friendly, conversational natural male voice' },
  { id: 'Charon', name: 'Charon (Gemini Live Studio)', gender: 'male', description: 'Calm, deep mountain guide voice' },
  { id: 'Kore', name: 'Kore (Gemini Live Studio)', gender: 'female', description: 'Soothing, gentle valley voice' },
  { id: 'Fenrir', name: 'Fenrir (Gemini Live Studio)', gender: 'male', description: 'Authoritative, clear mountain voice' }
];

// In-memory cache for ultra-low latency response (<10ms for repeated/greeting phrases)
const memoryAudioCache = new Map();

/**
 * Synthesize speech using the official Gemini Live voice models
 * Returns base64-encoded WAV audio
 */
export async function synthesizeStudioVoice(text, voiceName = 'Aoede') {
  if (!text || !text.trim()) return null;

  const cleanText = text
    .replace(/[*#_~`]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .trim();

  if (!cleanText) return null;

  // Spoken text brevity (1-3 sentences max for fast interactive voice calls)
  const spokenText = cleanText.length > 360 ? cleanText.slice(0, 357) + '...' : cleanText;

  const validVoice = AVAILABLE_VOICES.some(v => v.id.toLowerCase() === (voiceName || '').toLowerCase())
    ? voiceName
    : 'Aoede';

  const cacheKey = `gemini_voice:${validVoice}:${spokenText}`;
  if (memoryAudioCache.has(cacheKey)) {
    return memoryAudioCache.get(cacheKey);
  }

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[StudioVoice] GOOGLE_API_KEY or GEMINI_API_KEY not found in environment');
    return null;
  }

  // Fast models with fallback
  const models = [
    'models/gemini-3.8-flash-lite-tts',
    'models/gemini-3.8-flash-tts',
    'models/gemini-2.5-flash-preview-tts'
  ];

  for (const model of models) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: spokenText }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: validVoice
                }
              }
            }
          }
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (res.ok) {
        const data = await res.json();
        const part = data.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData?.data) {
          const result = {
            audio_base64: part.inlineData.data,
            mimeType: part.inlineData.mimeType || 'audio/wav',
            voice: validVoice,
            engine: 'gemini_live_aoede'
          };

          // Cache common phrases (keep max 100 entries)
          if (memoryAudioCache.size > 100) {
            const firstKey = memoryAudioCache.keys().next().value;
            memoryAudioCache.delete(firstKey);
          }
          memoryAudioCache.set(cacheKey, result);

          return result;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn(`[StudioVoice ${model}] status ${res.status}:`, errData.error?.message || res.statusText);
      }
    } catch (err) {
      console.warn(`[StudioVoice ${model}] error:`, err.message);
    }
  }

  return null;
}

export function getStudioVoices() {
  return AVAILABLE_VOICES;
}
