import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Volume2, VolumeX, X, Sparkles, Languages, Radio, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ChatGPTVoiceOverlay({ isOpen, onClose }) {
  const { lang, setLang } = useLanguage();

  const [voiceStatus, setVoiceStatus] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'speaking'
  const [transcript, setTranscript] = useState('');
  const [lastAgentReply, setLastAgentReply] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [voiceDemoOnline, setVoiceDemoOnline] = useState(false);

  const voiceStatusRef = useRef('idle');
  const wsRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const hasPlayedGreetingRef = useRef(false);

  // Real-time PCM audio playback refs
  const playbackContextRef = useRef(null);
  const nextPlayTimeRef = useRef(0);
  const isPlayingChunksRef = useRef(false);
  const chunkSourcesRef = useRef([]);

  // Audio recording & silence detection refs
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingContextRef = useRef(null);
  const analyserRef = useRef(null);
  const vadIntervalRef = useRef(null);
  const hasSpokenRef = useRef(false);

  // Base Bridge URL — local Python bridge (localhost) or env override
  const HTTP_BRIDGE_URL = import.meta.env.VITE_VOICE_BRIDGE_URL || 'http://127.0.0.1:8765';
  const WS_BRIDGE_URL = HTTP_BRIDGE_URL.replace(/^http/, 'ws');
  // Production Render backend — always reachable from mobile/web
  const RENDER_API = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://uttarakhand-hackathon-project.onrender.com/api';

  const updateVoiceStatus = (status) => {
    voiceStatusRef.current = status;
    setVoiceStatus(status);
  };

  const GREETINGS = {
    hi: "नमस्ते! मैं आपका देवभूमि AI वॉइस साथी हूँ। आप मुझसे केदारनाथ, बद्रीनाथ, किसी भी ट्रेक के मौसम या होमस्टे के बारे में पूछ सकते हैं।",
    en: "Namaste! I am your Devbhoomi AI Voice Companion. Ask me anything about routes, high-altitude treks, mountain weather, or verified homestays across Uttarakhand."
  };

  // Play HD Google Neural Voice Stream (Zero robotic OS browser TTS!)
  const playGoogleNeuralTts = useCallback((text, onDone) => {
    if (!text || isMuted) {
      updateVoiceStatus('listening');
      onDone?.();
      return;
    }
    const cleanText = text.replace(/[*#_~`]/g, '').slice(0, 300);
    const targetLang = (lang && lang.startsWith('hi')) ? 'hi' : 'en';
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${targetLang}&client=tw-ob`;

    try {
      if (audioPlayerRef.current) {
        try { audioPlayerRef.current.pause(); } catch (e) {}
        audioPlayerRef.current = null;
      }
      updateVoiceStatus('speaking');
      const audio = new Audio(googleTtsUrl);
      audioPlayerRef.current = audio;
      audio.onended = () => {
        audioPlayerRef.current = null;
        updateVoiceStatus('listening');
        onDone?.();
      };
      audio.onerror = () => {
        audioPlayerRef.current = null;
        updateVoiceStatus('listening');
        onDone?.();
      };
      audio.play().catch(() => {
        audioPlayerRef.current = null;
        updateVoiceStatus('listening');
        onDone?.();
      });
    } catch (e) {
      updateVoiceStatus('listening');
      onDone?.();
    }
  }, [isMuted, lang]);

  // Play real-time 24kHz raw PCM chunks from Gemini Live with zero latency
  const playPcmChunk = useCallback((base64Chunk) => {
    if (isMuted || !base64Chunk) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
        playbackContextRef.current = new AudioCtx({ sampleRate: 24000 });
      }
      const ctx = playbackContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const binary = atob(base64Chunk);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const int16 = new Int16Array(bytes.buffer);

      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;

      const buffer = ctx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      if (nextPlayTimeRef.current < now) {
        nextPlayTimeRef.current = now + 0.03; // tiny 30ms jitter buffer
      }
      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += buffer.duration;
      chunkSourcesRef.current.push(source);

      isPlayingChunksRef.current = true;
      updateVoiceStatus('speaking');
    } catch (e) {
      console.warn('[VoiceOverlay] Error playing PCM chunk:', e);
    }
  }, [isMuted]);

  // Play pre-recorded WAV greeting audio
  const playVoiceAudio = useCallback((audioBase64, onFinish) => {
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
      } catch (e) {}
      audioPlayerRef.current = null;
    }

    if (isMuted || !audioBase64) {
      if (onFinish) onFinish();
      return;
    }

    updateVoiceStatus('speaking');

    try {
      const mime = audioBase64.startsWith('UklGR') ? 'audio/wav' : 'audio/mp3';
      const audio = new Audio(`data:${mime};base64,${audioBase64}`);
      audioPlayerRef.current = audio;
      audio.onended = () => {
        audioPlayerRef.current = null;
        if (onFinish) onFinish();
      };
      audio.onerror = (e) => {
        console.warn("[VoiceAudio] Error playing audio:", e);
        audioPlayerRef.current = null;
        if (onFinish) onFinish();
      };
      audio.play().catch((playErr) => {
        console.warn("[VoiceAudio] Autoplay blocked:", playErr);
        if (onFinish) onFinish();
      });
    } catch (e) {
      console.warn("[VoiceAudio] Exception playing audio:", e);
      if (onFinish) onFinish();
    }
  }, [isMuted]);

  // Clean up audio hardware streams
  const cleanupAudioNodes = useCallback(() => {
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (recordingContextRef.current && recordingContextRef.current.state !== 'closed') {
      try { recordingContextRef.current.close(); } catch (e) {}
      recordingContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  const stopVoiceLoop = useCallback(() => {
    updateVoiceStatus('idle');
    isPlayingChunksRef.current = false;
    nextPlayTimeRef.current = 0;

    // Stop chunk sources
    chunkSourcesRef.current.forEach((src) => {
      try { src.stop(); } catch (e) {}
    });
    chunkSourcesRef.current = [];

    if (audioPlayerRef.current) {
      try { audioPlayerRef.current.pause(); } catch (e) {}
      audioPlayerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    cleanupAudioNodes();
  }, [cleanupAudioNodes]);

  // Connect to WebSocket bridge for ultra-fast bidirectional audio streaming
  const connectBridgeWS = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
    try {
      const ws = new WebSocket(`${WS_BRIDGE_URL}/ws/voice`);
      wsRef.current = ws;

      ws.onopen = () => {
        setVoiceDemoOnline(true);
        console.log(`[VoiceWS] Connected to Gemini Live stream at ${WS_BRIDGE_URL}`);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          // 1. Instant Real-time PCM audio chunk arrived! Play immediately!
          if (msg.type === 'audio_chunk' && msg.chunk) {
            playPcmChunk(msg.chunk);
          }
          // 2. User transcript arrived (transcribed in 0.3s)
          else if (msg.type === 'user_transcript' && msg.text) {
            setTranscript(msg.text);
          }
          // 3. Spoken text delta streaming
          else if (msg.type === 'transcript_delta' && msg.delta) {
            setLastAgentReply((prev) => (prev ? prev + msg.delta : msg.delta));
          }
          // 4. Turn complete from Gemini Live
          else if (msg.type === 'turn_complete') {
            if (msg.text) setLastAgentReply(msg.text);

            // Wait until scheduled audio finishes playing before resuming listening
            const now = playbackContextRef.current?.currentTime || 0;
            const remainingSec = Math.max(0, nextPlayTimeRef.current - now);
            const remainingMs = Math.round(remainingSec * 1000);

            setTimeout(() => {
              isPlayingChunksRef.current = false;
              if (voiceStatusRef.current === 'speaking') {
                updateVoiceStatus('listening');
                startListening();
              }
            }, remainingMs + 350);
          }
          // 5. Processing status
          else if (msg.type === 'status') {
            if (msg.status === 'processing' && !isPlayingChunksRef.current) {
              updateVoiceStatus('processing');
            }
          }
          // 6. Welcome ready handshake — do NOT speak immediately; listen for user first!
          else if (msg.type === 'ready') {
            setVoiceDemoOnline(true);
            updateVoiceStatus('listening');
            startListening();
            setLastAgentReply(lang === 'hi' ? 'बोलिए, मैं सुन रहा हूँ…' : 'Listening... Speak now');
          }
        } catch (e) {
          console.warn("[VoiceWS] Message handling error:", e);
        }
      };


      ws.onerror = () => {
        setVoiceDemoOnline(false);
      };
      ws.onclose = () => {
        wsRef.current = null;
        // Auto-reconnect after brief pause to keep live socket warm
        if (isOpen) {
          setTimeout(() => {
            if (isOpen && (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)) {
              connectBridgeWS();
            }
          }, 800);
        }
      };
    } catch (e) {
      console.warn('[VoiceWS] Connection error:', e.message);
    }
  }, [lang, playPcmChunk, playVoiceAudio, WS_BRIDGE_URL, isOpen]);

  // Ensure active WebSocket connection exists before sending
  const ensureWsConnected = useCallback(async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return wsRef.current;
    }
    connectBridgeWS();
    for (let i = 0; i < 25; i++) {
      await new Promise((r) => setTimeout(r, 60));
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        return wsRef.current;
      }
    }
    return wsRef.current && wsRef.current.readyState === WebSocket.OPEN ? wsRef.current : null;
  }, [connectBridgeWS]);

  // Send raw recorded mic audio — WS → local bridge HTTP → Render API + browser TTS
  const sendAudioBlobToBridge = async (blob) => {
    updateVoiceStatus('processing');
    setLastAgentReply(lang === 'hi' ? 'सोच रहे हैं…' : 'Thinking…');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];
        if (!base64Audio) { updateVoiceStatus('listening'); startListening(); return; }

        // Tier 1: WebSocket → Gemini Live (local only, ultra-fast)
        const activeWs = await ensureWsConnected();
        if (activeWs && activeWs.readyState === WebSocket.OPEN) {
          nextPlayTimeRef.current = 0;
          activeWs.send(JSON.stringify({
            type: 'audio', audio_base64: base64Audio,
            mime_type: blob.type || 'audio/webm', lang,
          }));
          return;
        }

        // Tier 2: Local bridge HTTP audio transcription (4s hard timeout)
        try {
          const res = await fetch(`${HTTP_BRIDGE_URL}/api/voice/audio_query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio_base64: base64Audio, mime_type: blob.type || 'audio/webm', lang }),
            signal: AbortSignal.timeout(4000),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user_transcript) setTranscript(data.user_transcript);
            if (data.response) {
              const reply = data.response.replace(/[*#_~`]/g, '').trim();
              setLastAgentReply(reply);
              playVoiceAudio(data.audio_base64 || '', () => startListening());
              return;
            }
          }
        } catch (_) { /* bridge offline — escalate */ }

        // Tier 3: Render backend /api/agent/chat (always reachable on mobile/Vercel)
        const fallbackText = transcript || (lang === 'hi'
          ? 'उत्तराखंड यात्रा के बारे में बताओ'
          : 'Tell me about places to visit in Uttarakhand');
        try {
          const renderRes = await fetch(`${RENDER_API}/agent/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: fallbackText }),
            signal: AbortSignal.timeout(15000),
          });
          if (renderRes.ok) {
            const data = await renderRes.json();
            const reply = (data.data?.message || data.response?.message || data.message || '').replace(/[*#_~`]/g, '').trim();
            if (reply) {
              setLastAgentReply(reply);
              playGoogleNeuralTts(reply, () => startListening());
              return;
            }
          }
        } catch (err) {
          console.error('[VoiceOverlay] Render fallback failed:', err);
        }

        updateVoiceStatus('listening');
        startListening();
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.error('[VoiceOverlay] Blob read error:', e);
      updateVoiceStatus('listening');
      startListening();
    }
  };


  // Stop recording and send audio immediately
  const stopRecordingAndSend = () => {
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      updateVoiceStatus('processing');
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    cleanupAudioNodes();
  };

  // Start hardware microphone recording with fast 1.0s silence detector
  const startListening = async () => {
    if (audioPlayerRef.current) {
      try { audioPlayerRef.current.pause(); } catch (e) {}
      audioPlayerRef.current = null;
    }
    setTranscript('');
    hasSpokenRef.current = false;
    audioChunksRef.current = [];

    connectBridgeWS();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      recordingContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      analyserRef.current = analyser;

      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      }
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const chunks = audioChunksRef.current;
        if (chunks.length === 0) return;
        const recordedBlob = new Blob(chunks, { type: mimeType || 'audio/webm' });
        audioChunksRef.current = [];

        if (recordedBlob.size > 1200) {
          sendAudioBlobToBridge(recordedBlob);
        } else {
          if (voiceStatusRef.current === 'listening') {
            startListening();
          }
        }
      };

      recorder.start();
      updateVoiceStatus('listening');

      // Snappy 120ms VAD timer (1.0 second silence trigger for instant answers!)
      const dataArr = new Uint8Array(analyser.frequencyBinCount);
      let silenceSince = null;

      if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = setInterval(() => {
        if (voiceStatusRef.current !== 'listening' || !analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArr);
        let sum = 0;
        for (let i = 0; i < dataArr.length; i++) sum += dataArr[i];
        const avg = sum / dataArr.length;

        // When user speaks
        if (avg > 8) {
          hasSpokenRef.current = true;
          silenceSince = null;
        } else if (hasSpokenRef.current) {
          if (!silenceSince) silenceSince = Date.now();
          // After 750ms of silence post-speech, submit immediately!
          if (Date.now() - silenceSince > 750) {
            stopRecordingAndSend();
          }
        }
      }, 120);

    } catch (err) {
      console.warn('[VoiceOverlay] Mic stream failed:', err);
      updateVoiceStatus('idle');
    }
  };

  // Submit text query (from topic chips) — WS → local bridge → Render API
  const handleVoiceQuerySubmit = async (queryText) => {
    if (!queryText) return;
    updateVoiceStatus('processing');
    cleanupAudioNodes();
    setLastAgentReply(lang === 'hi' ? 'सोच रहे हैं…' : 'Thinking…');

    // Tier 1: WebSocket (local bridge — ultra-fast)
    const activeWs = await ensureWsConnected();
    if (activeWs && activeWs.readyState === WebSocket.OPEN) {
      nextPlayTimeRef.current = 0;
      activeWs.send(JSON.stringify({ type: 'query', query: queryText, lang }));
      return;
    }

    // Tier 2: Local bridge HTTP (same machine)
    try {
      const bridgeRes = await fetch(`${HTTP_BRIDGE_URL}/api/voice/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, lang }),
        signal: AbortSignal.timeout(4000), // short timeout — don't wait on dead localhost
      });
      if (bridgeRes.ok) {
        const data = await bridgeRes.json();
        if (data?.response) {
          const reply = data.response.replace(/[*#_~`]/g, '').trim();
          setLastAgentReply(reply);
          playVoiceAudio(data.audio_base64 || '', () => startListening());
          return;
        }
      }
    } catch (_) { /* bridge offline — fall to Render */ }

    // Tier 3: Render backend /api/agent/chat — always reachable from mobile/Vercel
    try {
      const renderRes = await fetch(`${RENDER_API}/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryText }),
        signal: AbortSignal.timeout(15000),
      });
      if (renderRes.ok) {
        const data = await renderRes.json();
        const reply = (data.data?.message || data.response?.message || data.message || '').replace(/[*#_~`]/g, '').trim();
        if (reply) {
          setLastAgentReply(reply);
          playGoogleNeuralTts(reply, () => startListening());
          return;
        }
      }
    } catch (err) {
      console.error('[VoiceOverlay] Render API failed:', err);
    }

    // Offline Grounded Pahadi Travel Guide Fallback
    const offlineReply = lang === 'hi'
      ? 'देवभूमि में आपका स्वागत है। आप नैनीताल, केदारनाथ, मसूरी, चोपता या ऋषिकेश के लिए राइड्स और होमस्टे बुक कर सकते हैं।'
      : 'Welcome to Devbhoomi Uttarakhand. You can explore Nainital, Kedarnath, Mussoorie, Chopta, or Rishikesh with verified stays and 4x4 rentals.';
    setLastAgentReply(offlineReply);
    playGoogleNeuralTts(offlineReply, () => startListening());
  };

  const initVoiceConnection = useCallback(async () => {
    setLastAgentReply(lang === 'hi' ? 'बोलिए, मैं सुन रहा हूँ…' : 'Listening... Speak now');
    connectBridgeWS();
    updateVoiceStatus('listening');
    startListening();
  }, [lang, connectBridgeWS]);


  useEffect(() => {
    if (!isOpen) {
      stopVoiceLoop();
    } else {
      initVoiceConnection();
    }
    return () => {
      stopVoiceLoop();
    };
  }, [isOpen, lang]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#040e09] flex flex-col justify-between p-4 sm:p-8 text-white animate-in fade-in duration-200 overflow-hidden select-none">

      {/* Ambient Radial Aura Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: voiceStatus === 'speaking'
            ? 'radial-gradient(circle at 50% 45%, rgba(6, 182, 212, 0.16) 0%, rgba(4, 14, 9, 0) 70%)'
            : voiceStatus === 'listening'
            ? 'radial-gradient(circle at 50% 45%, rgba(16, 185, 129, 0.18) 0%, rgba(4, 14, 9, 0) 70%)'
            : 'radial-gradient(circle at 50% 45%, rgba(16, 185, 129, 0.08) 0%, rgba(4, 14, 9, 0) 70%)',
        }}
      />

      {/* ── Top Header Controls ── */}
      <div className="relative z-10 flex items-center justify-between max-w-4xl mx-auto w-full shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Sparkles size={19} />
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight block text-white drop-shadow-sm">
              Devbhoomi AI Voice Companion
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${voiceDemoOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse' : 'bg-emerald-600'}`} />
              <span className="text-[10px] text-emerald-300/80 font-bold uppercase tracking-wider">
                {voiceDemoOnline ? 'GEMINI LIVE STREAM (AOEDE)' : 'CONNECTING LIVE ENGINE…'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => {
              setLang(lang === 'en' ? 'hi' : 'en');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <Languages size={13} className="text-emerald-400" />
            <span>{lang === 'en' ? '🇮🇳 हिन्दी' : '🇬🇧 English'}</span>
          </button>

          {/* Mute Toggle */}
          <button
            type="button"
            onClick={() => {
              if (!isMuted && audioPlayerRef.current) {
                try { audioPlayerRef.current.pause(); } catch (e) {}
              }
              setIsMuted(!isMuted);
            }}
            className="p-2 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-white transition-all active:scale-95 cursor-pointer backdrop-blur-md"
            title={isMuted ? "Unmute Voice Output" : "Mute Voice Output"}
          >
            {isMuted ? <VolumeX size={16} className="text-rose-400" /> : <Volume2 size={16} className="text-emerald-400" />}
          </button>

          {/* Close Voice Overlay */}
          <button
            type="button"
            onClick={() => {
              stopVoiceLoop();
              onClose();
            }}
            className="p-2 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-white transition-all active:scale-95 cursor-pointer backdrop-blur-md"
            title="Exit Voice Mode"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Central Animated Wave Visualizer / Hero Orb ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center my-auto min-h-0">

        {/* Multi-layered Hero Glowing Orb */}
        <div className="relative my-6 flex items-center justify-center shrink-0">

          {/* Outer Ripple Rings */}
          {voiceStatus === 'listening' && (
            <>
              <div className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-emerald-500/15 animate-ping opacity-60 pointer-events-none" />
              <div className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-emerald-400/[0.08] animate-pulse pointer-events-none" />
            </>
          )}

          {voiceStatus === 'speaking' && (
            <>
              <div className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-cyan-400/20 animate-ping opacity-70 pointer-events-none" />
              <div className="absolute w-68 h-68 sm:w-76 sm:h-76 rounded-full bg-teal-400/[0.1] animate-pulse pointer-events-none" />
            </>
          )}

          {/* Rotating celestial border for processing */}
          {voiceStatus === 'processing' && (
            <div className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border-2 border-dashed border-emerald-400/50 animate-spin pointer-events-none" />
          )}

          {/* The Hero Core Orb Button */}
          <button
            type="button"
            onClick={() => {
              if (voiceStatus === 'speaking') {
                stopVoiceLoop();
                updateVoiceStatus('listening');
                startListening();
              } else if (voiceStatus === 'listening') {
                // Instantly stop and send the recorded voice!
                stopRecordingAndSend();
              } else {
                startListening();
              }
            }}
            className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer relative z-20 ${
              voiceStatus === 'listening'
                ? 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white voice-orb-breathe ring-4 ring-emerald-400/30'
                : voiceStatus === 'speaking'
                ? 'bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 text-white voice-orb-speaking ring-4 ring-cyan-400/30'
                : voiceStatus === 'processing'
                ? 'bg-gradient-to-tr from-stone-900 via-emerald-950 to-stone-900 text-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-gradient-to-tr from-emerald-900/90 via-teal-900/80 to-emerald-800/90 hover:from-emerald-800 hover:to-teal-800 text-emerald-100 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
            }`}
          >
            {voiceStatus === 'processing' ? (
              <Loader2 size={42} className="animate-spin text-emerald-300" />
            ) : voiceStatus === 'speaking' ? (
              <Volume2 size={42} className="animate-pulse text-cyan-100 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            ) : (
              <Mic size={42} className={voiceStatus === 'listening' ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "text-emerald-200/90"} />
            )}
          </button>
        </div>

        {/* Harmonic Dynamic Sound Wave Bars */}
        <div className="flex items-center justify-center gap-1.5 h-9 my-3">
          {[30, 65, 45, 85, 60, 95, 75, 90, 50, 80, 40, 70, 35, 60].map((h, i) => (
            <span
              key={i}
              style={{
                height: voiceStatus === 'speaking' || voiceStatus === 'listening' ? `${h}%` : '20%',
                animationDelay: `${i * 0.08}s`
              }}
              className={`w-1 rounded-full transition-all duration-300 ${
                voiceStatus === 'speaking'
                  ? 'bg-gradient-to-t from-cyan-500 to-teal-200 animate-pulse'
                  : voiceStatus === 'listening'
                  ? 'bg-gradient-to-t from-emerald-600 via-emerald-400 to-teal-200 animate-pulse'
                  : voiceStatus === 'processing'
                  ? 'bg-amber-400/60 animate-pulse'
                  : 'bg-emerald-950/60'
              }`}
            />
          ))}
        </div>

        {/* Status Indicator Pill */}
        <div className="my-2 shrink-0">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-bold uppercase tracking-widest text-emerald-300 backdrop-blur-md shadow-sm">
            <Radio size={13} className={voiceStatus === 'listening' || voiceStatus === 'speaking' ? 'animate-pulse text-emerald-400' : 'text-stone-400'} />
            <span>
              {voiceStatus === 'listening'
                ? (lang === 'hi' ? 'बोलिए, मैं सुन रहा हूँ…' : 'Listening... Speak now')
                : voiceStatus === 'processing'
                ? (lang === 'hi' ? 'सोच रहे हैं…' : 'Thinking…')
                : voiceStatus === 'speaking'
                ? (lang === 'hi' ? 'AI गाइड बोल रहा है (Tap to interrupt)' : 'AI Speaking (Tap to interrupt)')
                : (lang === 'hi' ? 'बोलने के लिए ऑर्ब दबाएं' : 'Tap Orb to Speak')}
            </span>
          </span>
        </div>

        {/* Live Conversational Subtitles Card */}
        <div className="w-full max-w-lg mt-3 px-4">
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-4 min-h-[64px] max-h-36 overflow-y-auto flex items-center justify-center text-center shadow-inner">
            {transcript ? (
              <p className="text-sm sm:text-base font-semibold text-emerald-200 leading-relaxed animate-in fade-in">
                “{transcript}”
              </p>
            ) : lastAgentReply ? (
              <p className="text-xs sm:text-sm text-emerald-50/95 leading-relaxed font-normal">
                {lastAgentReply}
              </p>
            ) : (
              <p className="text-xs text-stone-400/90 font-medium">
                {lang === 'hi'
                  ? '“केदारनाथ जाने का सबसे अच्छा समय क्या है?” या “मुनस्यारी के लिए 3 दिन का प्लान बताओ”'
                  : '“What is the best route to Kedarnath?” or “Suggest a 4-day trek in Munsyari”'}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* ── Bottom Controls & Prompts ── */}
      <div className="relative z-10 max-w-2xl mx-auto w-full text-center shrink-0 mt-2">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {[
            lang === 'hi' ? 'केदारनाथ ट्रेक एल्टीट्यूड व सुरक्षा' : 'Kedarnath trek altitude & safety',
            lang === 'hi' ? 'बद्रीनाथ का मौसम कैसा है?' : 'Weather in Badrinath',
            lang === 'hi' ? 'वैली ऑफ फ्लावर्स ट्रेक गाइड' : 'Plan Valley of Flowers trek',
            lang === 'hi' ? 'चोपता में बेस्ट होमस्टे' : 'Find best stays in Chopta'
          ].map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTranscript(sample);
                handleVoiceQuerySubmit(sample);
              }}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-400/30 text-[11px] font-medium text-emerald-200/90 hover:text-white transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
            >
              {sample}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-stone-500 font-medium tracking-wide">
          Powered by langchain-ai/voice-demo &copy; Google Gemini Live &amp; Devbhoomi Engine
        </p>
      </div>

    </div>
  );
}
