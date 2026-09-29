import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  PhoneCall, 
  Sparkles, 
  Volume2, 
  MessageSquare, 
  Send, 
  X, 
  Headphones, 
  Zap,
  ShieldCheck
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const QUICK_PROMPTS = [
  "Nainital ka 2-day plan bataiye",
  "Kedarnath trek ki mountain safety kya hai?",
  "Rishikesh verified homestays & rafting",
  "Dehradun se Himalayan bike rent karni hai"
];

const STUDIO_VOICES = [
  { id: 'Aoede', name: 'Aoede', tag: 'langchain-ai/voice-demo Default', desc: 'Warm, natural studio female voice' },
  { id: 'Puck', name: 'Puck', tag: 'Conversational', desc: 'Friendly, natural male voice' },
  { id: 'Charon', name: 'Charon', tag: 'Mountain Guide', desc: 'Calm, deep guide voice' },
  { id: 'Kore', name: 'Kore', tag: 'Gentle Valley', desc: 'Soothing valley female voice' },
  { id: 'Fenrir', name: 'Fenrir', tag: 'High Resonance', desc: 'Crisp mountain male voice' }
];

export default function VoiceCallAgent({ isOpen: propIsOpen = false, onClose: propOnClose = null }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = propOnClose ? propIsOpen : internalIsOpen;

  const [callState, setCallState] = useState('idle'); // 'idle' | 'calling' | 'connected' | 'listening' | 'thinking' | 'speaking'
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Aoede');
  const [showVoiceSelect, setShowVoiceSelect] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [agentReply, setAgentReply] = useState('Namaste! Main Devbhoomi AI Voice Companion hoon. Boliye, main aapki kya madad kar sakta hoon?');
  const [conversation, setConversation] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [showTextPad, setShowTextPad] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);

  // Audio & WebSocket references
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const recognitionRef = useRef(null);
  const currentAudioRef = useRef(null);
  const timerRef = useRef(null);
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // STRICT SINGLE-VOICE AND ECHO PREVENTION LOCKS
  const isPlayingAudioRef = useRef(false);
  const isAgentSpeakingRef = useRef(false);
  const queryInFlightRef = useRef(false);
  const selectedVoiceRef = useRef('Aoede');
  selectedVoiceRef.current = selectedVoice;

  // Global event listener: Allows any button to trigger the single voice agent instance
  useEffect(() => {
    const handleOpenEvent = () => {
      setInternalIsOpen(true);
      setTimeout(() => {
        // Auto-start call when opened if not already started
        startCall();
      }, 150);
    };
    window.addEventListener('open-voice-call', handleOpenEvent);
    return () => window.removeEventListener('open-voice-call', handleOpenEvent);
  }, []);

  // Call duration counter
  useEffect(() => {
    if (callState !== 'idle' && callState !== 'calling') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Format timer MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Connect WebSocket to /api/voice/live
  const connectWebSocket = () => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        return;
      }

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      let wsHost = 'localhost:5000';
      try {
        const parsed = new URL(API_BASE);
        wsHost = parsed.host;
      } catch (_) {}

      const wsUrl = `${wsProtocol}//${wsHost}/api/voice/live`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[VoiceAgent] WebSocket Connected (Redis Accelerated)');
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'connected') {
            console.log('[VoiceAgent WS ready]');
          }
          if (data.type === 'turn_complete') {
            queryInFlightRef.current = false;
            const reply = data.response || data.text || 'Devbhoomi Uttarakhand me aapka swagat hai!';
            
            setConversation((prev) => [
              ...prev,
              { role: 'user', text: data.user_transcript || userTranscript },
              { role: 'agent', text: reply, voice: data.voice || selectedVoiceRef.current }
            ]);

            speakResponse(reply, data.audio_base64);
          }
        } catch (err) {
          console.warn('[VoiceAgent WS Parse Error]', err);
        }
      };

      ws.onerror = () => {
        setWsConnected(false);
      };

      ws.onclose = () => {
        setWsConnected(false);
      };

      wsRef.current = ws;
    } catch (e) {
      setWsConnected(false);
    }
  };

  // Start Call and Initialize Audio
  const startCall = async () => {
    // Stop all prior audio
    stopAudio();
    isAgentSpeakingRef.current = false;
    isPlayingAudioRef.current = false;
    queryInFlightRef.current = false;

    setCallState('calling');
    setCallDuration(0);
    setConversation([]);
    setUserTranscript('');
    setAgentReply(`Connecting to Devbhoomi Live Voice Companion (${selectedVoice} studio voice)...`);

    try {
      // 1. Microphone & Analyser
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      // Volume monitoring for visualizer & Brave VAD
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let silenceTimer = null;
      let userIsSpeaking = false;

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolume(avg);

        // VAD for Brave & Shielded Browsers: Only listen when agent is NOT speaking
        if (!isAgentSpeakingRef.current && !isPlayingAudioRef.current && !isMuted) {
          if (avg > 25) {
            userIsSpeaking = true;
            if (silenceTimer) clearTimeout(silenceTimer);
          } else if (userIsSpeaking && avg < 14) {
            if (!silenceTimer) {
              silenceTimer = setTimeout(() => {
                userIsSpeaking = false;
                silenceTimer = null;
                flushRecordedAudio();
              }, 750);
            }
          }
        }

        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // 2. Setup MediaRecorder for Brave
      setupMediaRecorder(stream);

      // 3. Setup Speech Recognition
      setupSpeechRecognition();

      // 4. Connect WebSocket
      connectWebSocket();

      // 5. Fetch Aoede Studio Greeting Audio (Cached in Redis)
      try {
        const gRes = await fetch(`${API_BASE}/voice/greeting?voice=${selectedVoice}&lang=hi`);
        if (gRes.ok) {
          const gData = await gRes.json();
          setCallState('connected');
          speakResponse(gData.greeting, gData.audio_base64);
        } else {
          setCallState('connected');
          speakResponse('Namaste! Main aapka Devbhoomi AI Voice Companion hoon. Boliye, main aapki kya madad kar sakta hoon?');
        }
      } catch (_) {
        setCallState('connected');
        speakResponse('Namaste! Main aapka Devbhoomi AI Voice Companion hoon. Boliye, main aapki kya madad kar sakta hoon?');
      }

    } catch (err) {
      console.warn('[VoiceCall] Mic permission or setup notice:', err.message);
      setCallState('connected');
      speakResponse('Namaste! Microphone permissions allow karein ya text se sawaal poochein.');
    }
  };

  const setupMediaRecorder = (stream) => {
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0 && !isAgentSpeakingRef.current) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(400);
      mediaRecorderRef.current = recorder;
    } catch (_) {}
  };

  const flushRecordedAudio = async () => {
    if (isAgentSpeakingRef.current || isPlayingAudioRef.current || queryInFlightRef.current) {
      audioChunksRef.current = [];
      return;
    }

    if (!audioChunksRef.current || audioChunksRef.current.length < 2) return;

    const chunks = [...audioChunksRef.current];
    audioChunksRef.current = [];

    const blob = new Blob(chunks, { type: 'audio/webm' });
    if (blob.size < 4000) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result.split(',')[1];
      if (b64 && !queryInFlightRef.current && !isAgentSpeakingRef.current) {
        queryInFlightRef.current = true;
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'audio',
            audio_base64: b64,
            mimeType: 'audio/webm',
            voice: selectedVoiceRef.current,
            lang: 'hi'
          }));
        } else {
          sendAudioQueryHttp(b64);
        }
      }
    };
    reader.readAsDataURL(blob);
  };

  const sendAudioQueryHttp = async (base64Audio) => {
    try {
      setCallState('thinking');
      const res = await fetch(`${API_BASE}/voice/audio_query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_base64: base64Audio,
          mimeType: 'audio/webm',
          voice: selectedVoiceRef.current,
          lang: 'hi'
        })
      });
      const data = await res.json();
      queryInFlightRef.current = false;
      if (data.response) {
        setConversation((prev) => [
          ...prev,
          { role: 'user', text: data.user_transcript || 'Voice Question' },
          { role: 'agent', text: data.response, voice: selectedVoiceRef.current }
        ]);
        speakResponse(data.response, data.audio_base64);
      }
    } catch (_) {
      queryInFlightRef.current = false;
    }
  };

  // Browser Speech Recognition with Strict Voice Block
  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN';

      recognition.onstart = () => {
        if (!isAgentSpeakingRef.current) {
          setCallState((prev) => (prev === 'speaking' ? 'speaking' : 'listening'));
        }
      };

      recognition.onresult = (event) => {
        // STRICT ECHO BLOCK: Block microphone while agent is speaking
        if (isAgentSpeakingRef.current || isPlayingAudioRef.current) {
          return;
        }

        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += text;
          } else {
            interim += text;
          }
        }

        const spoken = final || interim;
        if (spoken && !isAgentSpeakingRef.current) {
          setUserTranscript(spoken);
        }

        if (final && final.trim().length > 1 && !isAgentSpeakingRef.current && !queryInFlightRef.current) {
          handleUserQuery(final.trim());
        }
      };

      recognition.onerror = () => {};

      recognition.onend = () => {
        if (callState !== 'idle' && !isMuted) {
          try {
            recognition.start();
          } catch (_) {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (_) {}
  };

  // Send User Query
  const handleUserQuery = async (queryText) => {
    if (!queryText || !queryText.trim() || queryInFlightRef.current || isAgentSpeakingRef.current) {
      return;
    }

    stopAudio();
    queryInFlightRef.current = true;
    setCallState('thinking');
    setUserTranscript(queryText);

    // 1. WebSocket Send (<30ms Redis Cache)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'query',
        text: queryText,
        voice: selectedVoiceRef.current,
        lang: 'hi'
      }));
      return;
    }

    // 2. HTTP Fallback
    try {
      const res = await fetch(`${API_BASE}/voice/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          lang: 'hi',
          voice: selectedVoiceRef.current
        }),
        signal: AbortSignal.timeout(15000)
      });

      queryInFlightRef.current = false;

      if (res.ok) {
        const data = await res.json();
        const reply = data.response || data.message || 'Main Devbhoomi Uttarakhand me aapko guide karne ke liye taiyar hoon.';
        
        setConversation((prev) => [
          ...prev,
          { role: 'user', text: queryText },
          { role: 'agent', text: reply, tools: data.toolsUsed, voice: data.voice }
        ]);

        speakResponse(reply, data.audio_base64);
      } else {
        fallbackLocalAnswer(queryText);
      }
    } catch (_) {
      queryInFlightRef.current = false;
      fallbackLocalAnswer(queryText);
    }
  };

  const fallbackLocalAnswer = (query) => {
    const q = query.toLowerCase();
    let reply = 'Devbhoomi Uttarakhand me aapka swagat hai! Char Dham, treks aur homestays ke bare me pooch sakte hain.';
    if (q.includes('nainital')) {
      reply = 'Nainital me Naini Lake boating, Naina Devi Mandir aur Mall Road zaroor visit karein.';
    } else if (q.includes('kedarnath') || q.includes('badrinath')) {
      reply = 'Kedarnath yatra ke liye biometric registration zaroori hai. Gaurikund se subah jaldi trek shuru karein.';
    }

    setConversation((prev) => [
      ...prev,
      { role: 'user', text: query },
      { role: 'agent', text: reply }
    ]);
    speakResponse(reply);
  };

  // SINGLE-VOICE ENGINE (Only ONE voice plays, microphone completely blocked)
  const speakResponse = (text, audioBase64 = null) => {
    // 1. HARD STOP previous audio
    stopAudio();

    // 2. ENGAGE LOCKS
    isAgentSpeakingRef.current = true;
    isPlayingAudioRef.current = true;
    setCallState('speaking');
    setAgentReply(text);

    // 3. Play Studio Audio (Aoede WAV)
    if (audioBase64) {
      try {
        const audioUrl = audioBase64.startsWith('data:') 
          ? audioBase64 
          : `data:audio/wav;base64,${audioBase64}`;

        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.onended = () => {
          currentAudioRef.current = null;
          isPlayingAudioRef.current = false;
          // Grace period: Wait 500ms before re-arming mic
          setTimeout(() => {
            isAgentSpeakingRef.current = false;
            setCallState('listening');
          }, 500);
        };

        audio.onerror = () => {
          currentAudioRef.current = null;
          speakWithBrowserSpeechSingle(text);
        };

        audio.play().catch(() => {
          currentAudioRef.current = null;
          speakWithBrowserSpeechSingle(text);
        });
        return;
      } catch (_) {
        currentAudioRef.current = null;
        speakWithBrowserSpeechSingle(text);
        return;
      }
    }

    speakWithBrowserSpeechSingle(text);
  };

  const speakWithBrowserSpeechSingle = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      isPlayingAudioRef.current = false;
      isAgentSpeakingRef.current = false;
      setCallState('listening');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_~`]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);

      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.name.includes('Hindi') || v.lang.includes('IN'));
      if (hindiVoice) utterance.voice = hindiVoice;

      utterance.rate = 1.02;

      utterance.onend = () => {
        isPlayingAudioRef.current = false;
        setTimeout(() => {
          isAgentSpeakingRef.current = false;
          setCallState('listening');
        }, 500);
      };

      utterance.onerror = () => {
        isPlayingAudioRef.current = false;
        isAgentSpeakingRef.current = false;
        setCallState('listening');
      };

      window.speechSynthesis.speak(utterance);
    } catch (_) {
      isPlayingAudioRef.current = false;
      isAgentSpeakingRef.current = false;
      setCallState('listening');
    }
  };

  const stopAudio = () => {
    isPlayingAudioRef.current = false;

    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current.src = '';
      } catch (_) {}
      currentAudioRef.current = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
  };

  const handleInterrupt = () => {
    stopAudio();
    isAgentSpeakingRef.current = false;
    queryInFlightRef.current = false;
    setCallState('listening');
  };

  const endCall = () => {
    stopAudio();
    isAgentSpeakingRef.current = false;
    isPlayingAudioRef.current = false;
    queryInFlightRef.current = false;

    if (wsRef.current) {
      try { wsRef.current.close(); } catch (_) {}
      wsRef.current = null;
    }

    if (mediaRecorderRef.current) {
      try { mediaRecorderRef.current.stop(); } catch (_) {}
      mediaRecorderRef.current = null;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (_) {}
      audioContextRef.current = null;
    }

    setCallState('idle');
    setMicVolume(0);
    setUserTranscript('');

    if (propOnClose) {
      propOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const toggleMute = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Sleek, Non-Cutting Modal Container (Fixed max-h with smooth inner scrolling) */}
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col text-white h-[90vh] max-h-[660px] overflow-hidden">
        
        {/* Pinned Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                Devbhoomi Voice Agent
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {selectedVoice}
                </span>
                {wsConnected && (
                  <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    <Zap size={9} className="text-sky-400" />
                    Redis WS
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-stone-400 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${callState === 'idle' ? 'bg-stone-500' : 'bg-emerald-400 animate-pulse'}`} />
                {callState === 'idle' ? 'Ready to Call' : callState === 'calling' ? 'Calling...' : `Live Call • ${formatTime(callDuration)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVoiceSelect(!showVoiceSelect)}
              className="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 flex items-center gap-1 transition cursor-pointer"
              title="Change Voice Model"
            >
              <Headphones size={12} className="text-emerald-400" />
              <span>{selectedVoice}</span>
            </button>

            <button
              onClick={endCall}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Voice Selection Drawer */}
        {showVoiceSelect && (
          <div className="flex-shrink-0 px-5 py-2.5 bg-stone-950/95 border-b border-stone-800 animate-in slide-in-from-top-2 duration-150">
            <div className="text-[10px] font-bold text-stone-400 mb-2 flex items-center justify-between">
              <span>SELECT STUDIO VOICE (langchain-ai/voice-demo)</span>
              <span className="text-emerald-400 text-[10px]">Gemini Live 24kHz</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {STUDIO_VOICES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVoice(v.id);
                    setShowVoiceSelect(false);
                  }}
                  className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col ${
                    selectedVoice === v.id
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                      : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{v.name}</span>
                    {v.id === 'Aoede' && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-black">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 mt-0.5">{v.tag}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable Center Body (Never cuts off) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col items-center justify-start space-y-3">
          {callState === 'idle' ? (
            <div className="my-auto py-4 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600/30 to-emerald-400/20 border-2 border-emerald-500/40 flex items-center justify-center mb-4 shadow-xl shadow-emerald-950">
                <PhoneCall size={38} className="text-emerald-400" />
              </div>
              <h2 className="text-lg font-black mb-1.5">Start Real-time Voice Call</h2>
              <p className="text-xs text-stone-400 max-w-sm mb-4">
                Powered by official Gemini Live studio voice <strong className="text-emerald-400">Aoede</strong> with Redis WS caching. Single-voice locked.
              </p>
              <button
                onClick={startCall}
                className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs tracking-wide flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition cursor-pointer hover:scale-105 active:scale-95"
              >
                <PhoneCall size={16} />
                Connect Voice Agent
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              {/* Dynamic Animated Voice Orb */}
              <div 
                onClick={() => {
                  if (callState === 'speaking') handleInterrupt();
                }}
                className="relative my-3 flex items-center justify-center cursor-pointer"
                title={callState === 'speaking' ? 'Click to interrupt' : 'Voice Orb'}
              >
                <div 
                  className={`absolute rounded-full transition-all duration-300 ${
                    callState === 'speaking' 
                      ? 'w-36 h-36 bg-purple-500/20 border border-purple-500/40 animate-ping'
                      : callState === 'thinking'
                      ? 'w-32 h-32 bg-amber-500/20 border border-amber-500/40 animate-pulse'
                      : 'w-28 h-28 bg-emerald-500/20 border border-emerald-500/30 animate-pulse'
                  }`}
                  style={{ transform: `scale(${1 + Math.min(micVolume / 100, 0.3)})` }}
                />

                <div 
                  className={`w-24 h-24 sm:w-26 sm:h-26 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-xl ${
                    callState === 'speaking'
                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 border-purple-300 shadow-purple-900/60'
                      : callState === 'thinking'
                      ? 'bg-gradient-to-tr from-amber-600 to-orange-500 border-amber-300 shadow-amber-900/60'
                      : 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-300 shadow-emerald-900/60'
                  }`}
                  style={{ transform: `scale(${1 + Math.min(micVolume / 120, 0.25)})` }}
                >
                  {callState === 'speaking' ? (
                    <Volume2 size={30} className="text-white animate-bounce" />
                  ) : callState === 'thinking' ? (
                    <Sparkles size={30} className="text-white animate-spin" />
                  ) : isMuted ? (
                    <MicOff size={30} className="text-stone-300" />
                  ) : (
                    <Mic size={30} className="text-white" />
                  )}
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mb-2 flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  callState === 'speaking'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : callState === 'thinking'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : callState === 'listening'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-stone-800 text-stone-300'
                }`}>
                  {callState === 'speaking' && `Aoede Speaking (Mic Auto-Blocked)`}
                  {callState === 'thinking' && 'Agent Thinking (Redis WS)...'}
                  {callState === 'listening' && (isMuted ? 'Muted' : 'Listening... Speak Now')}
                  {callState === 'connected' && 'Call Connected'}
                </span>

                {callState === 'speaking' && (
                  <button
                    onClick={handleInterrupt}
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition cursor-pointer"
                  >
                    Interrupt
                  </button>
                )}
              </div>

              {/* Subtitles & Transcripts Box */}
              <div className="w-full bg-stone-950/70 border border-stone-800 rounded-2xl p-3 text-left max-h-24 sm:max-h-28 overflow-y-auto space-y-1 mb-2">
                {userTranscript && (
                  <div className="text-[11px]">
                    <span className="font-bold text-emerald-400">You: </span>
                    <span className="text-stone-200">{userTranscript}</span>
                  </div>
                )}
                <div className="text-[11px]">
                  <span className="font-bold text-purple-400">{selectedVoice}: </span>
                  <span className="text-stone-200">{agentReply}</span>
                </div>
              </div>

              {/* Quick Topics */}
              <div className="w-full">
                <div className="text-[10px] font-bold text-stone-400 mb-1 text-left">Quick Topics:</div>
                <div className="flex flex-wrap gap-1">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleUserQuery(prompt)}
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-800 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-700/50 border border-stone-700 text-stone-300 transition cursor-pointer text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input Drawer */}
              {showTextPad && (
                <div className="w-full flex items-center gap-2 mt-2 pt-2 border-t border-stone-800">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && textInput.trim()) {
                        handleUserQuery(textInput.trim());
                        setTextInput('');
                      }
                    }}
                    placeholder="Type travel question..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => {
                      if (textInput.trim()) {
                        handleUserQuery(textInput.trim());
                        setTextInput('');
                      }
                    }}
                    className="p-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold transition"
                  >
                    <Send size={13} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pinned Bottom Call Controls */}
        {callState !== 'idle' && (
          <div className="flex-shrink-0 px-6 py-3 bg-stone-950 border-t border-stone-800/80 flex items-center justify-around">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition cursor-pointer ${
                isMuted 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                  : 'bg-stone-800 hover:bg-stone-700 text-white'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <button
              onClick={() => setShowTextPad(!showTextPad)}
              className={`p-3 rounded-full transition cursor-pointer ${
                showTextPad 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'bg-stone-800 hover:bg-stone-700 text-white'
              }`}
              title="Type question"
            >
              <MessageSquare size={18} />
            </button>

            <button
              onClick={endCall}
              className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/60 transition cursor-pointer hover:scale-105 active:scale-95"
              title="End Voice Call"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
