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

  // Web Speech API ref — browser-native, zero-server transcription
  const recognitionRef = useRef(null);
  const recognitionActiveRef = useRef(false);

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
        nextPlayTimeRef.current = now + 0.12; // 120ms adaptive jitter cushion for smooth mobile playback
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

    // Stop SpeechRecognition
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }
    recognitionActiveRef.current = false;

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

            if (msg.audio_base64 && !isPlayingChunksRef.current) {
              playVoiceAudio(msg.audio_base64, () => {
                updateVoiceStatus('listening');
                startListening();
              });
              return;
            }

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
        const textToSend = (transcript && transcript.trim()) || (lang === 'hi'
          ? 'उत्तराखंड यात्रा के बारे में बताओ'
          : 'Tell me about places to visit in Uttarakhand');
        try {
          const renderRes = await fetch(`${RENDER_API}/agent/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: textToSend }),
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

  // Start listening using Web Speech API — browser-native, no server needed
  const startListening = () => {
    if (audioPlayerRef.current) {
      try { audioPlayerRef.current.pause(); } catch (e) {}
      audioPlayerRef.current = null;
    }
    setTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback: MediaRecorder + Render API with generic prompt
      startListeningLegacy();
      return;
    }

    // Stop any previous recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    recognitionActiveRef.current = false;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = (lang && lang.startsWith('hi')) ? 'hi-IN' : 'en-IN';
    recognition.maxAlternatives = 1;

    let finalText = '';

    recognition.onstart = () => {
      recognitionActiveRef.current = true;
      updateVoiceStatus('listening');
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += t;
        else interim += t;
      }
      setTranscript(finalText || interim);
    };

    recognition.onend = () => {
      recognitionActiveRef.current = false;
      const query = finalText.trim();
      if (query && voiceStatusRef.current !== 'idle') {
        handleVoiceQuerySubmit(query);
      } else if (voiceStatusRef.current === 'listening') {
        // Nothing heard — restart loop
        setTimeout(() => startListening(), 300);
      }
    };

    recognition.onerror = (e) => {
      recognitionActiveRef.current = false;
      console.warn('[VoiceOverlay] SpeechRecognition error:', e.error);
      if (e.error === 'not-allowed') {
        updateVoiceStatus('idle');
      } else if (voiceStatusRef.current === 'listening') {
        setTimeout(() => startListening(), 500);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn('[VoiceOverlay] Recognition start failed, using legacy:', e);
      startListeningLegacy();
    }
  };

  // Legacy MediaRecorder fallback (for browsers without SpeechRecognition)
  const startListeningLegacy = async () => {
    setTranscript('');
    hasSpokenRef.current = false;
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      mediaStreamRef.current = stream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      recordingContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data?.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        if (blob.size > 300) sendAudioBlobToBridge(blob);
        else if (voiceStatusRef.current === 'listening') startListening();
      };
      recorder.start();
      updateVoiceStatus('listening');
      const dataArr = new Uint8Array(analyser.frequencyBinCount);
      let silenceSince = null;
      if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = setInterval(() => {
        if (voiceStatusRef.current !== 'listening' || !analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArr);
        let sum = 0;
        for (let i = 0; i < dataArr.length; i++) sum += dataArr[i];
        const avg = sum / dataArr.length;
        if (avg > 1.5) { hasSpokenRef.current = true; silenceSince = null; }
        else if (hasSpokenRef.current) {
          if (!silenceSince) silenceSince = Date.now();
          if (Date.now() - silenceSince > 700) stopRecordingAndSend();
        }
      }, 100);
    } catch (err) {
      console.warn('[VoiceOverlay] Legacy mic failed:', err);
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
        const reply = (data.response?.message || data.data?.message || data.message || '').replace(/[*#_~`]/g, '').trim();
        const suggestions = (data.response?.suggestedActions || []).map(a => a.label || a).filter(Boolean);
        if (reply) {
          setLastAgentReply(reply);
          if (suggestions.length) setTranscript(''); // clear so chips don't interfere
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
              if (voiceStatus === 'speaking') { stopVoiceLoop(); updateVoiceStatus('listening'); startListening(); }
              else if (voiceStatus === 'listening') { stopRecordingAndSend(); }
              else { startListening(); }
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
