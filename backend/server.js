import { cacheGet, cacheSet } from './config/redis.js';
import { AgentRouter } from './ai/workflows/agentRouter.js';
import { synthesizeStudioVoice } from './services/studioVoiceService.js';
import { transcribeAudioBuffer } from './routes/voiceRoutes.js';
import 'dotenv/config';
import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { validateEnv } from './config/envValidator.js';
import destinationRoutes from './routes/destinationRoutes.js';
import spiritualRoutes from './routes/spiritualRoutes.js';
import cultureRoutes from './routes/cultureRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import rentalRoutes from './routes/rentalRoutes.js';
import stayRoutes from './routes/stayRoutes.js';
import guideRoutes from './routes/guideRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import transportRoutes from './routes/transportRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import marketplaceRoutes from './routes/marketplaceRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import liveDataRoutes from './routes/liveDataRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import truthRoutes from './routes/truthRoutes.js';
import safetyRoutes from './routes/safetyRoutes.js';
import placesRoutes from './routes/placesRoutes.js';
import internalAgentRoutes from './routes/internalAgentRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';
import sosRoutes from './routes/sosRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import hiddenLocationRoutes from './routes/hiddenLocationRoutes.js';
import personalizedRoutes from './routes/personalizedRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Validate production environment variables
validateEnv();

// Connect to MongoDB
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
expressWs(app);

// Middleware - allow cross-origin resource policy so uploaded images can be loaded from frontend port
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Universal Permissive CORS middleware for Vercel, Render & Localhost
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  
  // Dynamically mirror whatever headers the client asks for in preflight
  const requestedHeaders = req.headers['access-control-request-headers'];
  if (requestedHeaders) {
    res.setHeader('Access-Control-Allow-Headers', requestedHeaders);
  } else {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Internal-Secret, x-session-id, x-request-id, x-client-id, x-trip-id, *');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Internal-Secret', 'x-session-id', 'x-request-id', 'x-client-id', 'x-trip-id', 'baggage', 'sentry-trace', '*']
}));

// Serve static uploaded assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// We need raw body for Stripe/Razorpay webhooks (must be strictly before express.json)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use('/api/payments/webhook/razorpay', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '2mb' })); // Limit JSON payloads to 2MB to prevent large payload DoS
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Graceful malformed JSON body-parser error handling
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.warn('[Server] Handled malformed JSON payload gracefully:', err.message);
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON payload in request body.'
    });
  }
  next(err);
});

// Process resilience
process.on('uncaughtException', (err) => {
  console.error('[Process Uncaught Exception Handled]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Process Unhandled Rejection Handled]', reason);
});

// Routes
app.use('/api/destinations', destinationRoutes);
app.use('/api/spiritual', spiritualRoutes);
app.use('/api/culture', cultureRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/stays', stayRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/transports', transportRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/partner', partnerRoutes); // Canonical singular alias
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/live', liveDataRoutes);
app.use('/api/live-data', liveDataRoutes);
app.use('/live-data', liveDataRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/truth', truthRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/search', placesRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/voice', voiceRoutes);
app.use('/api/personalized', personalizedRoutes);
app.use('/api/hidden-locations', hiddenLocationRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/photos', photoRoutes);

// Express WebSocket Native Endpoint for Voice Companion
const handleExpressVoiceWs = (ws, req) => {
  const clientIp = req.socket.remoteAddress || '127.0.0.1';
  console.log(`[Express WS Voice] Client connected from ${clientIp}`);

  try {
    ws.send(JSON.stringify({
      type: 'connected',
      ready: true,
      engine: 'gemini_live_aoede_ws',
      voice: 'Aoede',
      message: 'Connected to Devbhoomi Live Voice Companion'
    }));
  } catch (_) {}

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'ping') {
        return ws.send(JSON.stringify({ type: 'pong' }));
      }

      if (msg.type === 'query' || msg.type === 'text' || msg.type === 'audio') {
        let transcript = (msg.query || msg.text || '').trim();
        const rawB64 = msg.audio_base64 || msg.data || msg.chunk;
        const voice = msg.voice || 'Aoede';
        const lang = msg.lang || 'hi';

        // If audio buffer is sent, transcribe with Whisper / Gemini
        if (!transcript && rawB64) {
          try {
            transcript = await transcribeAudioBuffer(rawB64, msg.mimeType || 'audio/webm', lang);
          } catch (_) {}
        }

        if (!transcript) {
          transcript = 'Uttarakhand tourism guidance';
        }

        console.log(`[Express WS Voice] Query: "${transcript}" (Voice: ${voice})`);

        // 1. FAST REDIS CACHE LOOKUP (<15ms)
        const cacheKey = 'voice:ws:' + encodeURIComponent(transcript.toLowerCase()) + ':' + voice + ':' + lang;
        const cached = await cacheGet(cacheKey);
        if (cached && cached.audio_base64) {
          console.log(`[Express WS Voice] ⚡ Redis Cache HIT for "${transcript}"`);
          return ws.send(JSON.stringify({
            type: 'turn_complete',
            text: cached.text,
            response: cached.text,
            voice,
            engine: 'gemini_live_aoede_redis_cached',
            audio_base64: cached.audio_base64,
            mimeType: cached.mimeType || 'audio/wav',
            user_transcript: transcript
          }));
        }

        // 2. Process query with AgentRouter
        let replyText = 'Devbhoomi Uttarakhand me aapka swagat hai!';
        try {
          const result = await AgentRouter.processChatStream({
            message: transcript,
            sessionId: 'ws_voice_session',
            res: null
          });
          replyText = (result.message || (result.data && result.data.message) || replyText)
            .replaceAll('*', '')
            .replaceAll('#', '')
            .replaceAll('_', '')
            .replaceAll('`', '')
            .trim();
        } catch (_) {
          replyText = 'Namaste! Main aapka Devbhoomi travel assistant hoon.';
        }

        // 3. Synthesize Aoede Studio Voice
        let audio_base64 = '';
        let mimeType = 'audio/wav';
        try {
          const synth = await synthesizeStudioVoice(replyText, voice);
          if (synth && synth.audio_base64) {
            audio_base64 = synth.audio_base64;
            mimeType = synth.mimeType || 'audio/wav';
          }
        } catch (synthErr) {
          console.warn('[Express WS Voice Synth notice]', synthErr.message);
        }

        const payload = {
          type: 'turn_complete',
          text: replyText,
          response: replyText,
          voice,
          engine: 'gemini_live_aoede',
          audio_base64,
          mimeType,
          user_transcript: transcript
        };

        // Cache in Redis for 24 hours
        if (audio_base64) {
          await cacheSet(cacheKey, { text: replyText, audio_base64, voice, mimeType }, 86400);
        }

        ws.send(JSON.stringify(payload));
        console.log(`[Express WS Voice] Sent Aoede response for "${transcript}" (audio length: ${audio_base64.length})`);
      }
    } catch (err) {
      console.error('[Express WS Voice Error]', err);
    }
  });

  ws.on('close', () => {
    console.log(`[Express WS Voice] Client ${clientIp} disconnected`);
  });
};

app.ws('/api/voice/live', handleExpressVoiceWs);
app.ws('/api/voice/ws/live', handleExpressVoiceWs);
app.ws('/ws/live', handleExpressVoiceWs);
app.ws('/ws/voice', handleExpressVoiceWs);
app.use('/api/photos', photoRoutes);
app.use('/photos', photoRoutes);
app.use('/api/sos', sosRoutes);
app.use('/sos', sosRoutes);
app.use('/api/photos', photoRoutes);
app.use('/photos', photoRoutes);
app.use('/internal/agent', internalAgentRoutes);

// Unprefixed Aliases for Render & Mobile clients (e.g., /agent/chat, /chat, /destinations, /stays)
app.use('/agent', agentRoutes);
app.use('/chat', chatRoutes);
app.use('/chats', chatRoutes);
app.use('/destinations', destinationRoutes);
app.use('/stays', stayRoutes);
app.use('/rentals', rentalRoutes);
app.use('/guides', guideRoutes);
app.use('/activities', activityRoutes);
app.use('/spiritual', spiritualRoutes);
app.use('/culture', cultureRoutes);
app.use('/api/hidden-locations', hiddenLocationRoutes);
app.use('/hidden-locations', hiddenLocationRoutes);
app.use('/health', (req, res) => res.redirect(307, '/api/health'));

// Root & API Info Handlers
app.get(['/', '/api'], (req, res) => {
  res.status(200).json({
    success: true,
    name: "Discovery Uttarakhand API",
    version: "1.0.0",
    status: "online",
    healthCheck: "/api/health",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    endpoints: {
      destinations: "/api/destinations",
      stays: "/api/stays",
      rentals: "/api/rentals",
      guides: "/api/guides",
      activities: "/api/activities",
      copilot: "/api/agent/chat",
      sos: "/api/sos",
      rescue: "/api/sos/active",
      auth: "/api/auth",
      health: "/api/health"
    }
  });
});

// Liveness & Application Health Check
app.get('/api/health', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  const isCloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
  const activeAi = (process.env.AI_PROVIDER || (process.env.OMNIROUTE_API_KEY ? 'omniroute' : (process.env.GEMINI_API_KEY ? 'gemini' : 'deterministic'))).toLowerCase();

  res.status(200).json({
    success: true,
    message: 'Discovery Uttarakhand API process is alive',
    status: isMongoConnected ? 'healthy' : 'degraded',
    services: {
      database: isMongoConnected ? 'connected' : 'disconnected',
      ai: 'available',
      aiProvider: activeAi,
      cloudinary: isCloudinaryConfigured ? 'configured' : 'local_fallback'
    },
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Liveness probe (container orchestrators)
app.get('/api/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// Readiness probe (checks DB readiness)
app.get(['/api/health/ready', '/api/ready'], (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  if (isMongoConnected) {
    res.status(200).json({ success: true, status: 'ready', message: 'API is ready to receive traffic' });
  } else {
    res.status(503).json({ success: false, status: 'not_ready', message: 'API is not ready (Database disconnected)' });
  }
});

// Basic error handling for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// Advanced error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('Discovery Uttarakhand API');
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('[Process] Unhandled Promise Rejection (non-fatal):', err?.message || err);
});

process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception (non-fatal):', err?.message || err);
});

export default app;
