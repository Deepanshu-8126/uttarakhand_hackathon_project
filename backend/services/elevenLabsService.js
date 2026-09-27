import crypto from 'crypto';
import { cacheGet, cacheSet } from '../config/redis.js';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Default Voice: Premade Adam / Multilingual (Compatible with ElevenLabs Free & Paid tiers)
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

/**
 * Synthesize text into high-definition base64 audio via ElevenLabs
 * Powered by Upstash Redis Cache Layer for sub-10ms instant response
 * @param {string} text Text to convert into speech
 * @param {string} [voiceId] Optional custom voice ID
 * @returns {Promise<{ success: boolean, audio_base64?: string, engine: string, error?: string, cached?: boolean }>}
 */
export async function synthesizeElevenLabsVoice(text, voiceId = DEFAULT_VOICE_ID) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      engine: 'elevenlabs',
      error: 'ELEVENLABS_API_KEY is not configured in .env'
    };
  }

  const cleanText = String(text || '')
    .replace(/[*#_~`]/g, '') // Strip markdown formatting
    .replace(/https?:\/\/\S+/g, '') // Strip URLs
    .replace(/→/g, ' se ')
    .trim();

  if (!cleanText) {
    return {
      success: false,
      engine: 'elevenlabs',
      error: 'Empty text payload'
    };
  }

  // 1. Check Ultra-Fast Upstash Redis & Memory Cache Layer (0ms to 15ms)
  const textHash = crypto.createHash('md5').update(`${voiceId}:${cleanText}`).digest('hex');
  const cacheKey = `voice:elevenlabs:${textHash}`;

  try {
    const cachedAudio = await cacheGet(cacheKey);
    if (cachedAudio) {
      return {
        success: true,
        audio_base64: cachedAudio,
        engine: 'elevenlabs',
        voiceId,
        cached: true
      };
    }
  } catch (cErr) {
    console.warn('[Cache Notice] Redis check bypassed:', cErr.message);
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: cleanText.slice(0, 1000), // ElevenLabs max chunk recommendation
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn(`[ElevenLabs API Error] ${response.status}: ${errText}`);
      let userFriendlyError = `ElevenLabs API returned HTTP ${response.status}`;
      if (response.status === 401 || errText.includes('invalid_api_key')) {
        userFriendlyError = 'Invalid ElevenLabs API Key provided in .env (HTTP 401 Unauthorized)';
      }
      return {
        success: false,
        engine: 'elevenlabs',
        error: userFriendlyError,
        rawDetails: errText
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const audio_base64 = buffer.toString('base64');

    // 2. Cache Synthesized Audio in Upstash Redis (TTL: 24 Hours)
    await cacheSet(cacheKey, audio_base64, 86400).catch(() => {});

    return {
      success: true,
      audio_base64,
      engine: 'elevenlabs',
      voiceId,
      cached: false
    };
  } catch (err) {
    console.error('[ElevenLabs Exception]', err.message);
    return {
      success: false,
      engine: 'elevenlabs',
      error: err.message
    };
  }
}

/**
 * Fetch available ElevenLabs voices from account
 */
export async function getElevenLabsVoices() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: { 'xi-api-key': apiKey },
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const data = await res.json();
      return data.voices || [];
    }
  } catch {
    return [];
  }
  return [];
}
