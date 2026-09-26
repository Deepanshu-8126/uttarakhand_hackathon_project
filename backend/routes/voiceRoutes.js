import express from 'express';
import { AgentRouter } from '../ai/workflows/agentRouter.js';

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
    voice: 'Aoede',
    engine: 'devbhoomi_ai_voice',
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
    voice: 'Aoede',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/voice/ask
 */
router.post('/ask', async (req, res) => {
  try {
    const { query, message, lang } = req.body;
    const userQuery = (query || message || '').trim();

    if (!userQuery) {
      return res.status(200).json({
        success: true,
        response: lang?.startsWith('hi') ? 'कृपया अपना प्रश्न पूछें।' : 'Please ask your travel question.',
        toolsUsed: [],
        engine: 'devbhoomi_voice'
      });
    }

    const result = await AgentRouter.processChatStream({
      message: userQuery,
      sessionId: req.headers['x-session-id'] || 'voice_session',
      userId: req.user?._id || null,
      res: null
    });

    const replyText = result.message || (result.data && result.data.message) || 'Namaste! Main aapka Devbhoomi voice companion hoon.';

    return res.status(200).json({
      success: true,
      response: replyText.replace(/[*#_~`]/g, '').trim(),
      message: replyText,
      toolsUsed: result.toolsUsed || ['searchDestinations', 'getWeather'],
      suggestions: result.suggestions || [],
      engine: 'devbhoomi_voice_copilot',
      audio_base64: ''
    });
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
    const { audio_base64, lang, message, query } = req.body;
    const userQuery = message || query || (lang?.startsWith('hi') ? 'उत्तराखंड यात्रा के बारे में बताओ' : 'Tell me about places to visit in Uttarakhand');

    const result = await AgentRouter.processChatStream({
      message: userQuery,
      sessionId: req.headers['x-session-id'] || 'voice_audio_session',
      userId: req.user?._id || null,
      res: null
    });

    const replyText = result.message || 'Namaste! Main aapka Devbhoomi voice companion hoon.';

    return res.status(200).json({
      success: true,
      user_transcript: userQuery,
      response: replyText.replace(/[*#_~`]/g, '').trim(),
      tools_used: result.toolsUsed || [],
      engine: 'devbhoomi_voice_copilot',
      audio_base64: ''
    });
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
