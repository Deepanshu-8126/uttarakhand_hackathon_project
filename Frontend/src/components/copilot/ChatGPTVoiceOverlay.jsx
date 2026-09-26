import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Volume2, VolumeX, X, Sparkles, Languages, Radio, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// Downsample microphone Float32 buffer from source sampleRate (e.g. 48kHz/44.1kHz) to target (16kHz)
function downsampleBuffer(buffer, inputSampleRate, outputSampleRate = 16000) {
  if (inputSampleRate === outputSampleRate || inputSampleRate < outputSampleRate) return buffer;
  const sampleRateRatio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : buffer[offsetBuffer];
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

// Convert Float32Array [-1.0, 1.0] to 16-bit signed PCM Uint8Array
function floatTo16BitPCM(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); // true = Little-Endian
  }
  return new Uint8Array(buffer);
}

// Safe base64 encoding without exceeding stack limit
function uint8ToBase64(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const sub = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, sub);
  }
  return btoa(binary);
}

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
  const pingIntervalRef = useRef(null);

  // Real-time 24kHz PCM audio playback refs
  const playbackContextRef = useRef(null);
  const nextPlayTimeRef = useRef(0);
  const isPlayingChunksRef = useRef(false);
  const chunkSourcesRef = useRef([]);

  // Hardware microphone 16kHz PCM streaming refs
  const liveAudioCtxRef = useRef(null);
  const liveMediaStreamRef = useRef(null);
  const liveProcessorRef = useRef(null);
  const liveSilentGainRef = useRef(null);
  const isAgentSpeakingRef = useRef(false);

  // Base Bridge URL — local Python bridge (localhost) or env override
  const HTTP_BRIDGE_URL = import.meta.env.VITE_VOICE_BRIDGE_URL || 'http://127.0.0.1:8765';
  const WS_BRIDGE_URL = HTTP_BRIDGE_URL.replace(/^http/, 'ws');
  // Production Render backend — fallback for mobile/Vercel
  const RENDER_API = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://uttarakhand-hackathon-project.onrender.com/api';

  const updateVoiceStatus = (status) => {
    voiceStatusRef.current = status;
    setVoiceStatus(status);
  };

  // Play natural browser neural voice fallback
  const playGoogleNeuralTts = useCallback((text, onDone) => {
    if (!text || isMuted) {
      updateVoiceStatus('listening');
      onDone?.();
      return;
    }
    const cleanText = text.replace(/[*#_~`]/g, '').slice(0, 300);
    const targetLang = (lang && lang.startsWith('hi')) ? 'hi-IN' : 'en-IN';

    try {
      if (audioPlayerRef.current) {
        try { audioPlayerRef.current.pause(); } catch (e) {}
        audioPlayerRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = targetLang;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.name.includes('Natural') && (v.lang.startsWith(targetLang.slice(0, 2))))
          || voices.find(v => v.name.includes('Google') && (v.lang.startsWith(targetLang.slice(0, 2))))
          || voices.find(v => v.name.includes('Neerja') || v.name.includes('Swara') || v.name.includes('India'))
          || voices.find(v => v.lang.startsWith(targetLang.slice(0, 2)));
        if (preferred) utterance.voice = preferred;

        updateVoiceStatus('speaking');
        isAgentSpeakingRef.current = true;
        utterance.onend = () => {
          isAgentSpeakingRef.current = false;
          updateVoiceStatus('listening');
          onDone?.();
        };
        utterance.onerror = () => {
          isAgentSpeakingRef.current = false;
          updateVoiceStatus('listening');
          onDone?.();
        };
        window.speechSynthesis.speak(utterance);
      } else {
        updateVoiceStatus('listening');
        onDone?.();
      }
    } catch (e) {
      updateVoiceStatus('listening');
      onDone?.();
    }
  }, [isMuted, lang]);

  // Play real-time 24kHz raw PCM chunks from Gemini Live with zero latency & jitter cushion
  const playPcmChunk = useCallback((base64Chunk) => {
    if (isMuted || !base64Chunk) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
        playbackContextRef.current = new AudioCtx();
      }
      const ctx = playbackContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const binary = atob(base64Chunk);
      const len = binary.length;
      if (len === 0) return;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);

      const numSamples = Math.floor(len / 2);
      const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const float32 = new Float32Array(numSamples);
      for (let i = 0; i < numSamples; i++) {
        float32[i] = dataView.getInt16(i * 2, true) / 32768.0; // true = Little-Endian
      }

      const buffer = ctx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      // 50ms smooth jitter cushion
      if (nextPlayTimeRef.current < now) {
        nextPlayTimeRef.current = now + 0.05;
      }
      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += buffer.duration;
      chunkSourcesRef.current.push(source);

      isPlayingChunksRef.current = true;
      isAgentSpeakingRef.current = true;
      updateVoiceStatus('speaking');
    } catch (e) {
      console.warn('[VoiceOverlay] Error playing PCM chunk:', e);
    }
  }, [isMuted]);

  // Clean up all audio hardware streams and processors
  const stopVoiceLoop = useCallback(() => {
    updateVoiceStatus('idle');
    isAgentSpeakingRef.current = false;
    isPlayingChunksRef.current = false;
    nextPlayTimeRef.current = 0;

    if (liveProcessorRef.current) {
      try { liveProcessorRef.current.disconnect(); } catch (e) {}
      liveProcessorRef.current = null;
    }
    if (liveSilentGainRef.current) {
      try { liveSilentGainRef.current.disconnect(); } catch (e) {}
      liveSilentGainRef.current = null;
    }
    if (liveMediaStreamRef.current) {
      liveMediaStreamRef.current.getTracks().forEach((track) => track.stop());
      liveMediaStreamRef.current = null;
    }
    if (liveAudioCtxRef.current && liveAudioCtxRef.current.state !== 'closed') {
      try { liveAudioCtxRef.current.close(); } catch (e) {}
      liveAudioCtxRef.current = null;
    }

    chunkSourcesRef.current.forEach((src) => {
      try { src.stop(); } catch (e) {}
    });
    chunkSourcesRef.current = [];

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (audioPlayerRef.current) {
      try { audioPlayerRef.current.pause(); } catch (e) {}
      audioPlayerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Connect to WebSocket bridge for ultra-fast bidirectional audio streaming
  const connectBridgeWS = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) return;
    try {
      const ws = new WebSocket(`${WS_BRIDGE_URL}/ws/voice`);
      wsRef.current = ws;

      ws.onopen = () => {
        setVoiceDemoOnline(true);
        console.log(`[VoiceWS] Connected to Gemini Live stream at ${WS_BRIDGE_URL}`);
        
        // 25-second keep-alive ping to prevent Render WebSocket sleep
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'pong') return;

          // 1. Instant Real-time PCM audio chunk arrived! Play immediately!
          if (msg.type === 'audio_chunk' && msg.chunk) {
            playPcmChunk(msg.chunk);
          }
          // 2. User transcript arrived
          else if (msg.type === 'user_transcript' && msg.text) {
            setTranscript(msg.text);
          }
          // 3. Spoken text delta streaming
          else if (msg.type === 'transcript_delta' && msg.delta) {
            setLastAgentReply((prev) => (prev ? prev + msg.delta : msg.delta));
          }
          // 4. Turn complete from Gemini Live
          else if (msg.type === 'turn_complete') {
            const now = playbackContextRef.current?.currentTime || 0;
            const remainingSec = Math.max(0, nextPlayTimeRef.current - now);
            const remainingMs = Math.round(remainingSec * 1000);

            setTimeout(() => {
              isAgentSpeakingRef.current = false;
              isPlayingChunksRef.current = false;
              if (voiceStatusRef.current === 'speaking') {
                updateVoiceStatus('listening');
              }
            }, remainingMs + 100);
          }
          // 5. Welcome ready handshake — ready to listen immediately!
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
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        wsRef.current = null;
      };
    } catch (e) {
      console.warn('[VoiceWS] Connection error:', e.message);
    }
  }, [playPcmChunk, WS_BRIDGE_URL, lang]);

  // Ensure active WebSocket connection exists before sending
  const ensureWsConnected = useCallback(async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return wsRef.current;
    }
    connectBridgeWS();
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 60));
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        return wsRef.current;
      }
    }
    return wsRef.current && wsRef.current.readyState === WebSocket.OPEN ? wsRef.current : null;
  }, [connectBridgeWS]);

  // Start continuous 16kHz PCM streaming to Gemini Live + Parallel Visual Subtitle Recognition
  const startListening = useCallback(async () => {
    if (audioPlayerRef.current) {
      try { audioPlayerRef.current.pause(); } catch (e) {}
      audioPlayerRef.current = null;
    }
    setTranscript('');
    connectBridgeWS();

    // 1. Setup continuous hardware microphone PCM streaming (16kHz to Gemini Live)
    try {
      if (!liveMediaStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        liveMediaStreamRef.current = stream;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        liveAudioCtxRef.current = ctx;
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        const source = ctx.createMediaStreamSource(stream);
        const processor = ctx.createScriptProcessor(4096, 1, 1);
        liveProcessorRef.current = processor;

        const silentGain = ctx.createGain();
        silentGain.gain.value = 0.0;
        liveSilentGainRef.current = silentGain;

        source.connect(processor);
        processor.connect(silentGain);
        silentGain.connect(ctx.destination);

        const actualSampleRate = ctx.sampleRate;

        processor.onaudioprocess = (e) => {
          if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
          if (isAgentSpeakingRef.current) return; // Don't stream mic while agent is speaking!
          if (voiceStatusRef.current === 'idle') return;

          const inputData = e.inputBuffer.getChannelData(0);
          const downsampled = downsampleBuffer(inputData, actualSampleRate, 16000);
          const pcm16 = floatTo16BitPCM(downsampled);
          const b64 = uint8ToBase64(pcm16);
          wsRef.current.send(JSON.stringify({ type: 'pcm_chunk', chunk: b64 }));
        };
      }
      updateVoiceStatus('listening');
    } catch (micErr) {
      console.warn('[VoiceOverlay] Live mic streaming failed:', micErr);
    }
  }, [connectBridgeWS]);

  // Submit text query (from topic chips) — WS → local bridge → Render API
  const handleVoiceQuerySubmit = async (queryText) => {
    if (!queryText) return;
    updateVoiceStatus('processing');
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
        signal: AbortSignal.timeout(4000),
      });
      if (bridgeRes.ok) {
        const data = await bridgeRes.json();
        if (data?.response) {
          const reply = data.response.replace(/[*#_~`]/g, '').trim();
          setLastAgentReply(reply);
          if (data.audio_base64) {
            playPcmChunk(data.audio_base64);
          } else {
            playGoogleNeuralTts(reply, () => startListening());
          }
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
        const reply = (data.response?.message || data.data?.message || data.message || '').replace(/[*#_~`]/g, '').trim();
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
  }, [lang, connectBridgeWS, startListening]);

  useEffect(() => {
    if (!isOpen) {
      stopVoiceLoop();
    } else {
      initVoiceConnection();
    }
    return () => {
      stopVoiceLoop();
    };
  }, [isOpen, lang, initVoiceConnection, stopVoiceLoop]);

  if (!isOpen) return null;

  const statusColor = {
    listening: 'from-emerald-600 via-emerald-500 to-teal-400',
    speaking:  'from-teal-500 via-cyan-500 to-emerald-400',
    processing:'from-stone-900 via-emerald-950 to-stone-900',
    idle:      'from-emerald-950 via-[#0f3d2e] to-emerald-900',
  }[voiceStatus] || 'from-emerald-950 via-[#0f3d2e] to-emerald-900';

  const statusLabel = {
    listening:  lang === 'hi' ? '🎙 बोलिए, मैं सुन रहा हूँ…'       : '🎙 Listening… Speak now',
    speaking:   lang === 'hi' ? '🔊 AI बोल रहा है — Tap to stop' : '🔊 AI Speaking — Tap to stop',
    processing: lang === 'hi' ? '✦ सोच रहे हैं…'                   : '✦ Thinking…',
    idle:       lang === 'hi' ? 'ऑर्ब दबाएं'                        : 'Tap orb to speak',
  }[voiceStatus] || '';

  const topics = [
    lang === 'hi' ? 'केदारनाथ ट्रेक एल्टीट्यूड व सुरक्षा' : 'Kedarnath trek altitude & safety',
    lang === 'hi' ? 'बद्रीनाथ का मौसम कैसा है?'            : 'Weather in Badrinath',
    lang === 'hi' ? 'वैली ऑफ फ्लावर्स ट्रेक गाइड'          : 'Plan Valley of Flowers trek',
    lang === 'hi' ? 'चोपता में बेस्ट होमस्टे'               : 'Find best stays in Chopta',
  ];

  return (
    <div className="fixed inset-0 h-[100dvh] w-full z-[9999] flex flex-col overflow-hidden select-none"
      style={{
        background: 'linear-gradient(160deg, #020c07 0%, #040e09 40%, #071a0f 100%)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>

      {/* ── Ambient Radial Glow (status-reactive) ── */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: voiceStatus === 'speaking'
            ? 'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(20,184,166,0.22) 0%, transparent 70%)'
            : voiceStatus === 'listening'
            ? 'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(16,185,129,0.20) 0%, transparent 70%)'
            : voiceStatus === 'processing'
            ? 'radial-gradient(ellipse 60% 45% at 50% 40%, rgba(52,211,153,0.10) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 60% 45% at 50% 40%, rgba(15,61,46,0.35) 0%, transparent 70%)',
        }}
      />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(#10b98133 1px, transparent 1px), linear-gradient(90deg, #10b98133 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* ── Top Header ── */}
      <div className="relative z-10 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-white/[0.06] backdrop-blur-sm bg-black/25 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
          {/* Logo pill */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/15 border border-emerald-400/25 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)] shrink-0">
            <Sparkles size={16} className="text-emerald-300 sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-xs sm:text-base text-white tracking-tight leading-tight truncate">
              Devbhoomi AI Voice
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-500 ${
                voiceDemoOnline ? 'bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]' : 'bg-emerald-700'
              }`} />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest text-emerald-400/80 truncate">
                {voiceDemoOnline ? 'LIVE AOEDE VOICE' : 'CONNECTING…'}
              </span>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button type="button" onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-emerald-500/15 border border-white/[0.1] hover:border-emerald-400/30 text-[11px] font-semibold text-white/80 hover:text-white transition-all active:scale-95 cursor-pointer backdrop-blur-md">
            <Languages size={12} className="text-emerald-400 shrink-0" />
            <span className="text-[11px]">{lang === 'en' ? 'हि' : 'EN'}</span>
            <span className="hidden sm:inline text-[11px]">{lang === 'en' ? '(Hindi)' : '(English)'}</span>
          </button>

          <button type="button" title={isMuted ? 'Unmute' : 'Mute'}
            onClick={() => { if (!isMuted && audioPlayerRef.current) try { audioPlayerRef.current.pause(); } catch(e){} setIsMuted(!isMuted); }}
            className="p-1.5 sm:p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] transition-all active:scale-95 cursor-pointer">
            {isMuted ? <VolumeX size={15} className="text-rose-400" /> : <Volume2 size={15} className="text-emerald-400" />}
          </button>

          <button type="button" title="Close voice mode"
            onClick={() => { stopVoiceLoop(); onClose(); }}
            className="p-1.5 sm:p-2 rounded-xl bg-white/[0.06] hover:bg-rose-500/15 border border-white/[0.1] hover:border-rose-400/30 text-stone-400 hover:text-rose-300 transition-all active:scale-95 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Central Stage (Optimized for small mobile viewports) ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-3 sm:gap-4 px-3 sm:px-6 py-2 min-h-0 overflow-y-auto">

        {/* Orb + Ripple rings */}
        <div className="relative flex items-center justify-center shrink-0 my-1 sm:my-2">
          {/* Ripple rings */}
          {voiceStatus === 'listening' && (<>
            <div className="absolute w-44 h-44 sm:w-60 sm:h-60 rounded-full border border-emerald-400/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute w-36 h-36 sm:w-52 sm:h-52 rounded-full border border-emerald-400/15 animate-ping" style={{ animationDuration: '2.6s' }} />
            <div className="absolute w-52 h-52 sm:w-72 sm:h-72 rounded-full bg-emerald-500/[0.06] animate-pulse" />
          </>)}
          {voiceStatus === 'speaking' && (<>
            <div className="absolute w-44 h-44 sm:w-60 sm:h-60 rounded-full border border-teal-400/25 animate-ping" style={{ animationDuration: '1.6s' }} />
            <div className="absolute w-52 h-52 sm:w-72 sm:h-72 rounded-full bg-teal-400/[0.07] animate-pulse" />
          </>)}
          {voiceStatus === 'processing' && (
            <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-dashed border-emerald-500/40 animate-spin" style={{ animationDuration: '3s' }} />
          )}

          {/* Core orb button */}
          <button
            type="button"
            onClick={() => {
              if (voiceStatus === 'speaking') {
                // Barge-in: interrupt agent speech immediately and resume listening
                chunkSourcesRef.current.forEach((src) => { try { src.stop(); } catch(e){} });
                chunkSourcesRef.current = [];
                nextPlayTimeRef.current = 0;
                isAgentSpeakingRef.current = false;
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                updateVoiceStatus('listening');
              } else if (voiceStatus === 'listening') {
                if (transcript && transcript.trim()) {
                  handleVoiceQuerySubmit(transcript.trim());
                }
              } else {
                startListening();
              }
            }}
            className={`
              w-28 h-28 xs:w-32 xs:h-32 sm:w-36 sm:h-36 rounded-full
              bg-gradient-to-br ${statusColor}
              shadow-2xl flex items-center justify-center
              transition-all duration-500 active:scale-95 cursor-pointer relative z-20
              ${voiceStatus === 'listening' ? 'shadow-[0_0_50px_rgba(16,185,129,0.5)] ring-4 ring-emerald-400/30' : ''}
              ${voiceStatus === 'speaking'  ? 'shadow-[0_0_50px_rgba(20,184,166,0.5)] ring-4 ring-teal-400/30' : ''}
              ${voiceStatus === 'idle'      ? 'hover:shadow-[0_0_40px_rgba(16,185,129,0.35)] border border-emerald-500/30' : ''}
            `}
          >
            {voiceStatus === 'processing'
              ? <Loader2 size={36} className="animate-spin text-emerald-300 sm:w-11 sm:h-11" />
              : voiceStatus === 'speaking'
              ? <Volume2 size={36} className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.7)] animate-pulse sm:w-11 sm:h-11" />
              : <Mic size={36} className={`sm:w-11 sm:h-11 ${voiceStatus === 'listening' ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]' : 'text-emerald-200'}`} />
            }
          </button>
        </div>

        {/* Waveform bars */}
        <div className="flex items-end justify-center gap-[2.5px] sm:gap-[3px] h-6 sm:h-8 shrink-0">
          {[25,55,38,75,50,90,65,85,45,72,30,62,48,80,35].map((h, i) => (
            <span key={i}
              style={{ height: (voiceStatus === 'speaking' || voiceStatus === 'listening') ? `${h}%` : '15%', animationDelay: `${i * 0.07}s`, transition: 'height 0.3s ease' }}
              className={`w-[2.5px] sm:w-[3px] rounded-full ${
                voiceStatus === 'speaking'   ? 'bg-gradient-to-t from-teal-600 to-cyan-300 animate-pulse'
                : voiceStatus === 'listening'? 'bg-gradient-to-t from-emerald-700 via-emerald-400 to-teal-200 animate-pulse'
                : voiceStatus === 'processing'? 'bg-amber-500/50 animate-pulse'
                : 'bg-emerald-900/70'
              }`}
            />
          ))}
        </div>

        {/* Status pill */}
        <div className="shrink-0">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-xl shadow-lg">
            <Radio size={11} className={`shrink-0 ${voiceStatus !== 'idle' ? 'text-emerald-400 animate-pulse' : 'text-stone-500'}`} />
            <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-emerald-200">{statusLabel}</span>
          </div>
        </div>

        {/* Subtitle / reply card */}
        <div className="w-full max-w-sm sm:max-w-lg shrink-0 px-1">
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-xl px-4 sm:px-5 py-3 sm:py-4 min-h-[50px] max-h-[22dvh] sm:max-h-[120px] overflow-y-auto flex items-center justify-center text-center shadow-inner shadow-black/20">
            {transcript ? (
              <p className="text-xs sm:text-base font-semibold text-emerald-200 leading-relaxed break-words">"{transcript}"</p>
            ) : lastAgentReply ? (
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed break-words">{lastAgentReply}</p>
            ) : (
              <p className="text-[11px] sm:text-xs text-stone-500 font-medium italic leading-relaxed">
                {lang === 'hi'
                  ? '"केदारनाथ का मौसम कैसा है?" या "मुनस्यारी 3 दिन का प्लान"'
                  : '"Best time to visit Valley of Flowers?" or "Plan Kedarnath trek"'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom: Topic chips carousel + footer ── */}
      <div className="relative z-10 shrink-0 px-3 sm:px-4 pb-3 sm:pb-4 pt-2.5 sm:pt-3 border-t border-white/[0.05] bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5 max-w-2xl mx-auto overflow-x-auto no-scrollbar py-1 px-1 sm:flex-wrap sm:justify-center touch-pan-x">
          {topics.map((topic, idx) => (
            <button key={idx} type="button"
              onClick={() => { setTranscript(topic); handleVoiceQuerySubmit(topic); }}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-950/70 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-400/50 text-[11px] sm:text-xs font-medium text-emerald-300/90 hover:text-emerald-100 transition-all active:scale-95 cursor-pointer backdrop-blur-md shadow-sm whitespace-nowrap">
              {topic}
            </button>
          ))}
        </div>

        <p className="text-center text-[9px] sm:text-[10px] text-stone-500 font-medium tracking-wide">
          Powered by Gemini Live &amp; Devbhoomi Himalayan Engine
        </p>
      </div>

    </div>
  );
}
