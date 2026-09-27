import express from 'express';
import { AgentRouter } from '../ai/workflows/agentRouter.js';
import { cacheGet, cacheSet } from '../config/redis.js';
import { synthesizeElevenLabsVoice, getElevenLabsVoices } from '../services/elevenLabsService.js';

const router = express.Router();

const GREETINGS = {
  hi: "नमस्ते! मैं आपका देवभूमि AI वॉइस साथी हूँ। आप मुझसे केदारनाथ, बद्रीनाथ, किसी भी ट्रेक के मौसम या होमस्टे के बारे में पूछ सकते हैं।",
  en: "Namaste! I am your Devbhoomi AI Voice Companion. Ask me anything about routes, high-altitude treks, mountain weather, or verified homestays across Uttarakhand."
};

/**
 * GET /api/voice/greeting
 */
router.get('/greeting', (req, res) => {
  const lang = (req.query.lang || 'en').startsWith('hi') ? 'hi' : 'en';
  res.status(200).json({
    success: true,
    greeting: GREETINGS[lang],
    voice: process.env.ELEVENLABS_API_KEY ? 'ElevenLabs-Multilingual' : 'Aoede',
    engine: process.env.ELEVENLABS_API_KEY ? 'elevenlabs' : 'devbhoomi_ai_voice',
    audio_base64: ''
  });
});

/**
 * GET /api/voice/health
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'devbhoomi_voice_service',
    voice: process.env.ELEVENLABS_API_KEY ? 'ElevenLabs Studio Voice' : 'Aoede',
    elevenlabs_configured: Boolean(process.env.ELEVENLABS_API_KEY),
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/voice/elevenlabs/tts
 * Directly synthesize any text into ElevenLabs base64 audio stream
 */
router.post('/elevenlabs/tts', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text payload is required.' });
    }

    const ttsRes = await synthesizeElevenLabsVoice(text, voiceId);
    return res.status(200).json(ttsRes);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/voice/elevenlabs/voices
 * Get list of available ElevenLabs voices
 */
router.get('/elevenlabs/voices', async (req, res) => {
  try {
    const voices = await getElevenLabsVoices();
    return res.status(200).json({ success: true, voices });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/voice/ask
 */
router.post('/ask', async (req, res) => {
  try {
    const { query, message, lang, voiceId } = req.body;
    const userQuery = (query || message || '').trim();

    if (!userQuery) {
      return res.status(200).json({
        success: true,
        response: lang?.startsWith('hi') ? 'कृपया अपना प्रश्न पूछें।' : 'Please ask your travel question.',
        toolsUsed: [],
        engine: 'devbhoomi_voice'
      });
    }

    // 1. Check Redis Cache
    const cacheKey = `voice:ask:${encodeURIComponent(userQuery.toLowerCase())}:${lang || 'en'}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    // 2. Process query via AgentRouter for grounded travel response
    const result = await AgentRouter.processChatStream({
      message: userQuery,
      sessionId: req.headers['x-session-id'] || 'voice_session',
      userId: req.user?._id || null,
      pageContext: { pageType: 'VOICE_AGENT', currentPage: 'COPILOT_VOICE' },
      res: null
    });

    const replyText = result.message || (result.data && result.data.message) || 'Namaste! Main aapka Devbhoomi voice companion hoon.';
    const cleanReply = replyText.replace(/[*#_~`]/g, '').trim();

    let audio_base64 = '';
    let engine = 'devbhoomi_voice_copilot';

    // 3. Synthesize speech using ElevenLabs if key is configured
    if (process.env.ELEVENLABS_API_KEY) {
      const elevenRes = await synthesizeElevenLabsVoice(cleanReply, voiceId);
      if (elevenRes.success && elevenRes.audio_base64) {
        audio_base64 = elevenRes.audio_base64;
        engine = 'elevenlabs';
      }
    }

    // 4. Fallback to Python AI Studio Voice Bridge if ElevenLabs is not set or failed
    if (!audio_base64) {
      const candidates = [
        process.env.PYTHON_AI_URL,
        'http://127.0.0.1:8765',
        'http://localhost:8765',
        'http://127.0.0.1:8000'
      ].filter(Boolean);

      for (const pythonUrl of candidates) {
        try {
          const pyRes = await fetch(`${pythonUrl}/api/voice/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: userQuery, lang: lang || 'hi' }),
            signal: AbortSignal.timeout(4000)
          });
          if (pyRes.ok) {
            const pyData = await pyRes.json();
            if (pyData.audio_base64) {
              audio_base64 = pyData.audio_base64;
              engine = pyData.engine || 'gemini_live_aoede';
              break;
            }
          }
        } catch (_) {}
      }
    }


    const responsePayload = {
      success: true,
      response: cleanReply,
      message: replyText,
      toolsUsed: result.toolsUsed || ['searchDestinations', 'getWeather'],
      suggestions: result.suggestions || [],
      engine,
      audio_base64,
      cached: false
    };

    // Cache for 12 hours
    await cacheSet(cacheKey, { ...responsePayload, cached: true }, 43200);

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('[VoiceAsk Error]', error);
    res.status(200).json({
      success: true,
      response: 'Namaste! Main aapka Devbhoomi voice companion hoon. Kripya apna prashna dobara poochein.',
      toolsUsed: [],
      engine: 'devbhoomi_voice_fallback'
    });
  }
});

/**
 * POST /api/voice/audio_query
 */
router.post('/audio_query', async (req, res) => {
  try {
    const { audio_base64, lang, message, query, voiceId } = req.body;
    const userQuery = (message || query || (lang?.startsWith('hi') ? 'उत्तराखंड यात्रा के बारे में बताओ' : 'Tell me about places to visit in Uttarakhand')).trim();

    const cacheKey = `voice:audio_query:${encodeURIComponent(userQuery.toLowerCase())}:${lang || 'en'}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const result = await AgentRouter.processChatStream({
      message: userQuery,
      sessionId: req.headers['x-session-id'] || 'voice_audio_session',
      userId: req.user?._id || null,
      res: null
    });

    const replyText = result.message || 'Namaste! Main aapka Devbhoomi voice companion hoon.';
    const cleanReply = replyText.replace(/[*#_~`]/g, '').trim();

    let out_audio = '';
    let engine = 'devbhoomi_voice_copilot';

    if (process.env.ELEVENLABS_API_KEY) {
      const elevenRes = await synthesizeElevenLabsVoice(cleanReply, voiceId);
      if (elevenRes.success && elevenRes.audio_base64) {
        out_audio = elevenRes.audio_base64;
        engine = 'elevenlabs';
      }
    }

    const responsePayload = {
      success: true,
      user_transcript: userQuery,
      response: cleanReply,
      tools_used: result.toolsUsed || [],
      engine,
      audio_base64: out_audio
    };

    await cacheSet(cacheKey, responsePayload, 43200);

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('[VoiceAudioQuery Error]', error);
    res.status(200).json({
      success: true,
      user_transcript: '',
      response: 'Namaste! Main aapka Devbhoomi travel assistant hoon.',
      tools_used: [],
      audio_base64: ''
    });
  }
});

export default router;
