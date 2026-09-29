import express from 'express';
import { AgentRouter } from '../ai/workflows/agentRouter.js';
import { cacheGet, cacheSet } from '../config/redis.js';
import { synthesizeElevenLabsVoice, getElevenLabsVoices } from '../services/elevenLabsService.js';
import { synthesizeStudioVoice, getStudioVoices } from '../services/studioVoiceService.js';

const router = express.Router();

const GREETINGS = {
  hi: "नमस्ते! मैं आपका देवभूमि AI वॉइस साथी हूँ। आप मुझसे केदारनाथ, बद्रीनाथ, किसी भी ट्रेक के मौसम या होमस्टे के बारे में पूछ सकते हैं।",
  en: "Namaste! I am your Devbhoomi AI Voice Companion. Ask me anything about routes, high-altitude treks, mountain weather, or verified homestays across Uttarakhand."
};

/**
 * Transcribe raw audio buffer/base64 into text using Groq Whisper, Gemini Audio, or Python Bridge.
 */
export async function transcribeAudioBuffer(audioBase64, mimeType = 'audio/webm', lang = 'hi') {
  if (!audioBase64) return '';

  const cleanB64 = audioBase64.replace(/^data:audio\/[a-z0-9]+;base64,/, '');
  const buffer = Buffer.from(cleanB64, 'base64');

  // 1. Groq Whisper Large v3 (Fastest: ~120ms)
  const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_BACKUP || '';
  if (groqKey) {
    try {
      const formData = new FormData();
      const ext = mimeType.includes('wav') ? 'wav' : mimeType.includes('mp4') ? 'mp4' : 'webm';
      const fileBlob = new Blob([buffer], { type: mimeType });
      formData.append('file', fileBlob, `speech.${ext}`);
      formData.append('model', 'whisper-large-v3-turbo');
      formData.append('response_format', 'json');
      if (lang && !lang.includes('Garhwali') && !lang.includes('Kumaoni')) {
        formData.append('language', lang.startsWith('hi') ? 'hi' : 'en');
      }

      const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`
        },
        body: formData,
        signal: AbortSignal.timeout(6000)
      });

      if (groqRes.ok) {
        const data = await groqRes.json();
        if (data.text && data.text.trim()) {
          console.log(`[Whisper Transcribed]: "${data.text.trim()}"`);
          return data.text.trim();
        }
      }
    } catch (groqErr) {
      console.warn('[Whisper Transcribe Fallback]', groqErr.message);
    }
  }

  // 2. Google Gemini Audio Direct API
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    try {
      const gRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || 'audio/webm',
                    data: cleanB64
                  }
                },
                {
                  text: 'Transcribe this voice audio accurately in the exact language spoken (Hindi, English, or Pahadi/Hinglish). Return ONLY the clean transcribed words. Do not add quotes, notes, or explanations.'
                }
              ]
            }],
            generationConfig: { temperature: 0.1 }
          }),
          signal: AbortSignal.timeout(6000)
        }
      );

      if (gRes.ok) {
        const gData = await gRes.json();
        const text = gData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text && !text.toUpperCase().includes('SILENT')) {
          console.log(`[Gemini Transcribed]: "${text}"`);
          return text;
        }
      }
    } catch (gErr) {
      console.warn('[Gemini Transcribe Fallback]', gErr.message);
    }
  }

  // 3. Local Python AI Bridge if running
  const bridgeUrls = [process.env.PYTHON_AI_URL, 'http://127.0.0.1:8765', 'http://localhost:8765'].filter(Boolean);
  for (const bUrl of bridgeUrls) {
    try {
      const pyRes = await fetch(`${bUrl}/api/voice/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_base64: cleanB64, mimeType, lang }),
        signal: AbortSignal.timeout(3000)
      });
      if (pyRes.ok) {
        const pyData = await pyRes.json();
        if (pyData.transcript) return pyData.transcript;
      }
    } catch (_) {}
  }

  return '';
}

/**
 * GET /api/voice/greeting
 * Returns greeting text + pre-synthesized Aoede audio
 */
router.get('/greeting', async (req, res) => {
  const lang = (req.query.lang || 'hi').startsWith('hi') ? 'hi' : 'en';
  const voice = req.query.voice || 'Aoede';
  const greetingText = GREETINGS[lang] || GREETINGS.hi;

  let audio_base64 = '';
  let mimeType = 'audio/wav';

  try {
    const synth = await synthesizeStudioVoice(greetingText, voice);
    if (synth && synth.audio_base64) {
      audio_base64 = synth.audio_base64;
      mimeType = synth.mimeType;
    }
  } catch (err) {
    console.warn('[Greeting Synth notice]', err.message);
  }

  res.status(200).json({
    success: true,
    greeting: greetingText,
    voice,
    engine: 'gemini_live_aoede',
    mimeType,
    audio_base64
  });
});

/**
 * GET /api/voice/health
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'devbhoomi_voice_service',
    voice: 'Aoede (Gemini Live Studio - langchain-ai/voice-demo)',
    voices: getStudioVoices(),
    elevenlabs_configured: Boolean(process.env.ELEVENLABS_API_KEY),
    google_configured: Boolean(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/voice/voices
 * Lists available studio voices (Aoede, Puck, Charon, Kore, Fenrir)
 */
router.get('/voices', (req, res) => {
  res.status(200).json({
    success: true,
    defaultVoice: 'Aoede',
    voices: getStudioVoices()
  });
});

/**
 * POST /api/voice/transcribe
 * Universal speech-to-text endpoint for Brave, Safari, Firefox & Mobile
 */
router.post('/transcribe', async (req, res) => {
  try {
    const { audio_base64, audio, mimeType, mime_type, lang } = req.body;
    const b64 = audio_base64 || audio;
    if (!b64) {
      return res.status(400).json({ success: false, message: 'audio_base64 payload is required' });
    }

    const transcript = await transcribeAudioBuffer(b64, mimeType || mime_type || 'audio/webm', lang || 'hi');
    return res.status(200).json({
      success: Boolean(transcript),
      transcript: transcript || '',
      engine: 'whisper_gemini_hybrid'
    });
  } catch (err) {
    console.error('[Transcribe Route Error]', err);
    return res.status(500).json({ success: false, error: err.message, transcript: '' });
  }
});

/**
 * POST /api/voice/elevenlabs/tts
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
 * POST /api/voice/synthesize
 * Direct Studio TTS endpoint for any text using Aoede / Puck / Charon
 */
router.post('/synthesize', async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }

    const synth = await synthesizeStudioVoice(text, voice || 'Aoede');
    if (synth && synth.audio_base64) {
      return res.status(200).json({
        success: true,
        ...synth
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Studio voice synthesis could not generate audio'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/voice/ask
 * Main Voice Agent query handler:
 * Evaluates user question via AgentRouter + synthesizes authentic Aoede studio voice!
 */
router.post('/ask', async (req, res) => {
  try {
    const { query, message, lang, voice, voiceId } = req.body;
    const userQuery = (query || message || '').trim();
    const selectedVoice = voice || voiceId || 'Aoede';

    if (!userQuery) {
      return res.status(200).json({
        success: true,
        response: lang?.startsWith('hi') ? 'कृपया अपना प्रश्न पूछें।' : 'Please ask your travel question.',
        toolsUsed: [],
        engine: 'devbhoomi_voice',
        audio_base64: ''
      });
    }

    // 1. Check Redis Cache
    const cacheKey = `voice:ask:${encodeURIComponent(userQuery.toLowerCase())}:${lang || 'en'}:${selectedVoice}`;
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
    let mimeType = 'audio/wav';
    let engine = 'gemini_live_aoede';

    // 3. Synthesize speech using authentic Gemini Aoede voice (langchain-ai/voice-demo)
    try {
      const synth = await synthesizeStudioVoice(cleanReply, selectedVoice);
      if (synth && synth.audio_base64) {
        audio_base64 = synth.audio_base64;
        mimeType = synth.mimeType || 'audio/wav';
        engine = synth.engine || 'gemini_live_aoede';
      }
    } catch (synthErr) {
      console.warn('[Aoede Voice Synth]', synthErr.message);
    }

    // 4. ElevenLabs fallback if configured and Gemini synth did not fire
    if (!audio_base64 && process.env.ELEVENLABS_API_KEY) {
      const elevenRes = await synthesizeElevenLabsVoice(cleanReply, voiceId);
      if (elevenRes.success && elevenRes.audio_base64) {
        audio_base64 = elevenRes.audio_base64;
        mimeType = 'audio/mp3';
        engine = 'elevenlabs';
      }
    }

    const responsePayload = {
      success: true,
      response: cleanReply,
      message: replyText,
      toolsUsed: result.toolsUsed || ['searchDestinations', 'getWeather'],
      suggestions: result.suggestions || [],
      voice: selectedVoice,
      engine,
      mimeType,
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
      voice: 'Aoede',
      engine: 'devbhoomi_voice_fallback',
      audio_base64: ''
    });
  }
});

/**
 * POST /api/voice/audio_query
 * Accepts audio blob from Brave / mobile / browser, transcribes it, answers it, and returns both text and audio!
 */
router.post('/audio_query', async (req, res) => {
  try {
    const { audio_base64, audio, mimeType, mime_type, lang, message, query, voice, voiceId } = req.body;
    let userQuery = (message || query || '').trim();
    const selectedVoice = voice || voiceId || 'Aoede';

    // If audio is provided but no text, transcribe with Whisper / Gemini
    const b64 = audio_base64 || audio;
    if (!userQuery && b64) {
      userQuery = await transcribeAudioBuffer(b64, mimeType || mime_type || 'audio/webm', lang || 'hi');
    }

    if (!userQuery) {
      userQuery = (lang?.startsWith('hi') ? 'उत्तराखंड में घूमने की जगह बताओ' : 'Tell me about places to visit in Uttarakhand');
    }

    const cacheKey = `voice:audio_query:${encodeURIComponent(userQuery.toLowerCase())}:${lang || 'en'}:${selectedVoice}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({ ...cached, user_transcript: userQuery });
    }

    const result = await AgentRouter.processChatStream({
      message: userQuery,
      sessionId: req.headers['x-session-id'] || 'voice_audio_session',
      userId: req.user?._id || null,
      pageContext: { pageType: 'VOICE_AGENT', currentPage: 'COPILOT_VOICE' },
      res: null
    });

    const replyText = result.message || (result.data && result.data.message) || 'Namaste! Main aapka Devbhoomi voice companion hoon.';
    const cleanReply = replyText.replace(/[*#_~`]/g, '').trim();

    let out_audio = '';
    let outMime = 'audio/wav';
    let engine = 'gemini_live_aoede';

    // Studio voice synthesis with Aoede
    try {
      const synth = await synthesizeStudioVoice(cleanReply, selectedVoice);
      if (synth && synth.audio_base64) {
        out_audio = synth.audio_base64;
        outMime = synth.mimeType || 'audio/wav';
        engine = synth.engine || 'gemini_live_aoede';
      }
    } catch (_) {}

    if (!out_audio && process.env.ELEVENLABS_API_KEY) {
      const elevenRes = await synthesizeElevenLabsVoice(cleanReply, voiceId);
      if (elevenRes.success && elevenRes.audio_base64) {
        out_audio = elevenRes.audio_base64;
        outMime = 'audio/mp3';
        engine = 'elevenlabs';
      }
    }

    const responsePayload = {
      success: true,
      user_transcript: userQuery,
      response: cleanReply,
      tools_used: result.toolsUsed || [],
      voice: selectedVoice,
      engine,
      mimeType: outMime,
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
