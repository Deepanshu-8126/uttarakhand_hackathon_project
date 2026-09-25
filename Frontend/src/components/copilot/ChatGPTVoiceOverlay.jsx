import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Languages, Radio, RefreshCw, Loader2 } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import { useMapStore } from '../../store/mapStore';
import { sendAgentMessage } from '../../api/agentApi';
import { speakText, stopSpeaking, isSpeechSynthesisSupported } from '../../utils/speechSynthesis';
import { useLanguage } from '../../context/LanguageContext';

export default function ChatGPTVoiceOverlay({ isOpen, onClose, tripIdContext }) {
  const { lang, setLang } = useLanguage();
  const { sendMessage, sending, agentStatus } = useChatStore();
  const activeChat = useChatStore((state) => state.activeChat);

  const [voiceStatus, setVoiceStatus] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'speaking'
  const [transcript, setTranscript] = useState('');
  const [lastAgentReply, setLastAgentReply] = useState('');
  const [micErrorMessage, setMicErrorMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [voiceDemoOnline, setVoiceDemoOnline] = useState(false);
  const [typedInput, setTypedInput] = useState('');
  const [micFailed, setMicFailed] = useState(false);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const voiceStatusRef = useRef('idle');
  const wsRef = useRef(null);

  const updateVoiceStatus = (status) => {
    voiceStatusRef.current = status;
    setVoiceStatus(status);
  };

  // Check langchain-ai/voice-demo local bridge connection on open
  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:8765/health')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.status === 'online') {
            setVoiceDemoOnline(true);
          }
        })
        .catch(() => {
          setVoiceDemoOnline(false);
        });
    }
  }, [isOpen]);

  const audioPlayerRef = useRef(null);

  const playVoiceAudio = useCallback((audioBase64, fallbackText, onFinish) => {
    stopSpeaking();
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
      } catch (e) {}
      audioPlayerRef.current = null;
    }

    if (isMuted) {
      if (onFinish) onFinish();
      return;
    }

    updateVoiceStatus('speaking');

    if (audioBase64) {
      try {
        const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
        audioPlayerRef.current = audio;
        audio.onended = () => {
          audioPlayerRef.current = null;
          if (onFinish) onFinish();
        };
        audio.onerror = (e) => {
          console.warn("[VoiceAudio] Error playing base64 audio, fallback to TTS:", e);
          audioPlayerRef.current = null;
          if (fallbackText) {
            speakText(fallbackText, {
              lang: lang === 'hi' ? 'hi-IN' : 'en-IN',
              rate: 1.05,
              onEnd: onFinish,
              onError: onFinish
            });
          } else if (onFinish) onFinish();
        };
        audio.play().catch((playErr) => {
          console.warn("[VoiceAudio] Autoplay blocked, falling back to TTS:", playErr);
          if (fallbackText) {
            speakText(fallbackText, {
              lang: lang === 'hi' ? 'hi-IN' : 'en-IN',
              rate: 1.05,
              onEnd: onFinish,
              onError: onFinish
            });
          } else if (onFinish) onFinish();
        });
        return;
      } catch (e) {
        console.warn("[VoiceAudio] Exception playing audio:", e);
      }
    }

    // Fallback to Web Speech Synthesis if no base64 audio
    if (fallbackText) {
      speakText(fallbackText, {
        lang: lang === 'hi' ? 'hi-IN' : 'en-IN',
        rate: 1.05,
        onEnd: onFinish,
        onError: onFinish
      });
    } else if (onFinish) onFinish();
  }, [isMuted, lang]);

  const GREETINGS = {
    hi: "नमस्ते! मैं आपका देवभूमि AI वॉइस साथी हूँ। आप मुझसे केदारनाथ, बद्रीनाथ, किसी भी ट्रेक के मौसम या होमस्टे के बारे में पूछ सकते हैं।",
    en: "Namaste! I am your Devbhoomi AI Voice Companion. Ask me anything about routes, high-altitude treks, mountain weather, or verified homestays across Uttarakhand."
  };

  const playGreetingAndListen = useCallback(() => {
    const greetingText = GREETINGS[lang] || GREETINGS.en;
    setLastAgentReply(greetingText);
    
    // Connect to WS bridge immediately
    connectBridgeWS();

    if (!isMuted) {
      playVoiceAudio(null, greetingText, () => {
        updateVoiceStatus('listening');
        startListening();
      });
    } else {
      updateVoiceStatus('listening');
      startListening();
    }
  }, [lang, isMuted]);

  // Stop TTS, audio player and speech recognition on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopVoiceLoop();
    } else {
      setMicErrorMessage('');
      playGreetingAndListen();
    }
    return () => {
      stopVoiceLoop();
    };
  }, [isOpen, lang]);

  const stopVoiceLoop = () => {
    updateVoiceStatus('idle');
    stopSpeaking();
    if (audioPlayerRef.current) {
      try { audioPlayerRef.current.pause(); } catch (e) {}
      audioPlayerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.warn(e);
      }
      recognitionRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  // Connect to bridge WebSocket for real-time voice query processing
  const connectBridgeWS = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
    try {
      const ws = new WebSocket('ws://localhost:8765/ws/voice');
      wsRef.current = ws;
      ws.onopen = () => {
        setVoiceDemoOnline(true);
        console.log('[VoiceWS] Connected to langchain-ai/voice-demo bridge');
      };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'response' && msg.text) {
            const cleanSpoken = msg.text.replace(/[*#_~`]/g, '').replace(/\b(http|https):\/\/\S+/gi, '').replace(/\s+/g, ' ').trim();
            setLastAgentReply(cleanSpoken);
            setTranscript('');
            playVoiceAudio(msg.audio_base64, cleanSpoken, () => {
              updateVoiceStatus('listening');
              startListening();
            });
          } else if (msg.type === 'status') {
            if (msg.status === 'processing') updateVoiceStatus('processing');
          } else if (msg.type === 'ready') {
            setVoiceDemoOnline(true);
            if (msg.audio_base64) {
              setLastAgentReply(msg.greeting || GREETINGS[lang] || GREETINGS.en);
              playVoiceAudio(msg.audio_base64, msg.greeting, () => {
                updateVoiceStatus('listening');
                startListening();
              });
            }
          }
        } catch (e) {}
      };
      ws.onerror = () => { setVoiceDemoOnline(false); };
      ws.onclose = () => { wsRef.current = null; };
    } catch (e) {
      console.warn('[VoiceWS] Could not connect to bridge:', e.message);
    }
  }, [lang, isMuted, playVoiceAudio]);

  // Send query through WS bridge (preferred) or HTTP fallback
  const sendToBridge = useCallback((queryText) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'query', query: queryText, lang }));
      updateVoiceStatus('processing');
    } else {
      // HTTP fallback
      handleVoiceQuerySubmit(queryText);
    }
  }, [lang]);

  const startListening = async () => {
    stopSpeaking();
    setMicErrorMessage('');

    // Ensure WS bridge is connected
    connectBridgeWS();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicFailed(true);
      updateVoiceStatus('idle');
      return;
    }

    // Verify mic permission
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      } catch (micErr) {
        setMicErrorMessage('Microphone access denied. Use the text box below to type your question.');
        setMicFailed(true);
        updateVoiceStatus('idle');
        return;
      }
    }

    try {
      if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch (e) {} }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => { updateVoiceStatus('listening'); setTranscript(''); };

      recognition.onresult = (event) => {
        let finalText = '', interimText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
          else interimText += event.results[i][0].transcript;
        }
        const currentText = finalText || interimText;
        if (currentText) {
          setTranscript(currentText);
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (currentText.trim().length > 2) sendToBridge(currentText.trim());
          }, 1800);
        }
      };

      recognition.onerror = (e) => {
        console.warn('[VoiceAgent] STT error:', e.error);
        if (e.error === 'network' || e.error === 'not-allowed') {
          // STT unavailable → switch to type-to-ask mode
          setMicFailed(true);
          setMicErrorMessage(e.error === 'network'
            ? '🎙️ Mic STT offline. Use text below or tap a topic chip.'
            : 'Microphone blocked. Type your question below.');
          updateVoiceStatus('idle');
        } else if (e.error === 'no-speech') {
          if (voiceStatusRef.current === 'listening') { try { recognition.start(); } catch (err) {} }
        } else {
          updateVoiceStatus('idle');
        }
      };

      recognition.onend = () => {
        if (voiceStatusRef.current === 'listening') { try { recognition.start(); } catch (e) {} }
      };

      recognition.start();
    } catch (err) {
      setMicFailed(true);
      setMicErrorMessage('Failed to start microphone. Type your question below.');
      updateVoiceStatus('idle');
    }
  };

  const handleVoiceQuerySubmit = async (queryText) => {
    if (!queryText) return;
    
    // Stop listening while AI processes
    updateVoiceStatus('processing');
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    const pageContext = {
      currentRoute: window.location?.pathname || '/copilot',
      currentPage: 'COPILOT_VOICE',
      pageType: 'VOICE_AGENT',
      tripId: activeChat?.tripId || tripIdContext,
      plannerForm: useMapStore.getState().plannerForm,
      language: lang
    };

    let cleanReply = '';
    let neuralAudioB64 = '';

    // Direct to local langchain-ai/voice-demo bridge
    try {
      const bridgeRes = await fetch('http://localhost:8765/api/voice/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, lang }),
        signal: AbortSignal.timeout(1200)
      });
      if (bridgeRes.ok) {
        const data = await bridgeRes.json();
        if (data && data.response) {
          cleanReply = data.response;
          neuralAudioB64 = data.audio_base64 || '';
          setVoiceDemoOnline(true);
        }
      }
    } catch (bridgeErr) {
      console.log("[VoiceAgent] Voice-demo bridge error:", bridgeErr?.message);
    }

    if (!cleanReply) {
      try {
        const res = await sendAgentMessage({
          message: queryText,
          chatId: activeChat?._id || null,
          tripId: activeChat?.tripId || tripIdContext,
          pageContext
        });

        const replyContent = res?.response?.message || res?.message || (typeof res === 'string' ? res : '');
        cleanReply = typeof replyContent === 'string' ? replyContent : (replyContent?.text || replyContent?.response || '');
      } catch (err) {
        console.error("[VoiceAgent] Query failed:", err);
      }
    }

    // Clean any accidental markdown symbols (like **, *, #, _) from the spoken voice output
    const cleanSpoken = (cleanReply || (lang === 'hi' ? 'उत्तर तैयार है।' : 'I have analyzed your request.'))
      .replace(/[*#_~`]/g, '')
      .replace(/\b(http|https):\/\/\S+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    setLastAgentReply(cleanSpoken);

    playVoiceAudio(neuralAudioB64, cleanSpoken, () => {
      updateVoiceStatus('listening');
      startListening();
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#061911] flex flex-col justify-between p-5 sm:p-10 text-white animate-in fade-in duration-200 overflow-hidden">
      
      {/* ── Top Header Controls ── */}
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-sm shadow-emerald-950">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="font-black text-sm sm:text-base tracking-tight block text-white">Devbhoomi AI Voice Companion</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${voiceDemoOnline ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-[10px] text-emerald-300/90 font-semibold uppercase tracking-wider">
                {voiceDemoOnline ? 'langchain-ai/voice-demo · Live' : 'Interactive Live Voice Guide'}
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
              stopSpeaking();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all cursor-pointer"
          >
            <Languages size={13} className="text-emerald-300" />
            <span>{lang === 'en' ? '🇮🇳 हिन्दी (Hindi)' : '🇬🇧 English'}</span>
          </button>

          {/* Mute Toggle */}
          <button
            type="button"
            onClick={() => {
              if (!isMuted) stopSpeaking();
              setIsMuted(!isMuted);
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer"
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
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer"
            title="Exit Voice Mode"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Central Animated Wave Visualizer / Orb ── */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center my-4 min-h-0">
        
        {/* Glowing Orb Animation */}
        <div className="relative mb-6 flex items-center justify-center shrink-0">
          
          {/* Pulse Ripple Rings */}
          {voiceStatus === 'listening' && (
            <>
              <div className="absolute w-44 h-44 rounded-full bg-emerald-500/25 animate-ping opacity-75 pointer-events-none" />
              <div className="absolute w-56 h-56 rounded-full bg-emerald-400/15 animate-pulse pointer-events-none" />
            </>
          )}

          {voiceStatus === 'speaking' && (
            <>
              <div className="absolute w-48 h-48 rounded-full bg-teal-400/30 animate-ping opacity-85 pointer-events-none" />
              <div className="absolute w-60 h-60 rounded-full bg-cyan-400/20 animate-pulse pointer-events-none" />
            </>
          )}

          {voiceStatus === 'processing' && (
            <div className="absolute w-40 h-40 rounded-full border-3 border-dashed border-emerald-400/50 animate-spin pointer-events-none" />
          )}

          {/* Central Main Orb Button */}
          <button
            type="button"
            onClick={() => {
              if (voiceStatus === 'speaking') {
                stopSpeaking();
                updateVoiceStatus('listening');
                startListening();
              } else if (voiceStatus === 'listening') {
                stopVoiceLoop();
              } else {
                startListening();
              }
            }}
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
              voiceStatus === 'listening'
                ? 'bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white scale-105 shadow-emerald-500/50 ring-4 ring-emerald-400/30'
                : voiceStatus === 'speaking'
                ? 'bg-gradient-to-tr from-teal-600 to-cyan-400 text-white scale-105 shadow-cyan-500/50 ring-4 ring-cyan-400/30'
                : voiceStatus === 'processing'
                ? 'bg-gradient-to-tr from-stone-800 to-emerald-950 text-emerald-300'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            {voiceStatus === 'processing' ? (
              <Loader2 size={38} className="animate-spin" />
            ) : voiceStatus === 'speaking' ? (
              <Volume2 size={38} className="animate-bounce" />
            ) : voiceStatus === 'listening' ? (
              <Mic size={38} className="animate-pulse" />
            ) : (
              <MicOff size={38} className="opacity-70" />
            )}
          </button>
        </div>

        {/* Dynamic Sound Wave Bars */}
        <div className="flex items-center justify-center gap-1.5 h-8 my-2">
          {[35, 70, 50, 90, 65, 85, 45, 95, 60, 40].map((h, i) => (
            <span
              key={i}
              style={{
                height: voiceStatus === 'speaking' || voiceStatus === 'listening' ? `${h}%` : '20%',
                animationDelay: `${i * 0.12}s`
              }}
              className={`w-1 rounded-full transition-all duration-300 ${
                voiceStatus === 'speaking'
                  ? 'bg-gradient-to-t from-teal-500 to-cyan-300 animate-pulse'
                  : voiceStatus === 'listening'
                  ? 'bg-gradient-to-t from-emerald-600 to-emerald-300 animate-pulse'
                  : voiceStatus === 'processing'
                  ? 'bg-amber-400/80 animate-ping'
                  : 'bg-stone-700'
              }`}
            />
          ))}
        </div>

        {/* Status Indicator Pill */}
        <div className="my-2 shrink-0">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest text-emerald-300 backdrop-blur-md">
            <Radio size={13} className={voiceStatus === 'listening' || voiceStatus === 'speaking' ? 'animate-pulse text-emerald-400' : 'text-stone-400'} />
            <span>
              {voiceStatus === 'listening'
                ? (lang === 'hi' ? 'आपकी आवाज़ सुन रहे हैं…' : 'Listening to you…')
                : voiceStatus === 'processing'
                ? (lang === 'hi' ? 'उत्तर तैयार किया जा रहा है…' : 'Thinking & fetching facts…')
                : voiceStatus === 'speaking'
                ? (lang === 'hi' ? 'AI गाइड बोल रहा है (Tap to interrupt)' : 'AI Copilot Speaking (Tap to stop)')
                : (lang === 'hi' ? 'बोलने के लिए माइक दबाएं' : 'Tap Mic to Start')}
            </span>
          </span>
        </div>

        {/* Microphone Error Alert */}
        {micErrorMessage && (
          <div className="mb-3 px-4 py-2 rounded-2xl bg-rose-500/25 border border-rose-400/40 text-rose-200 text-xs font-medium max-w-md mx-auto animate-in fade-in">
            ⚠️ {micErrorMessage}
          </div>
        )}

        {/* Live Spoken Transcript or Last AI Reply */}
        <div className="min-h-[50px] max-h-32 overflow-y-auto w-full px-4 text-center">
          {transcript ? (
            <p className="text-base sm:text-lg font-bold text-emerald-200 leading-relaxed drop-shadow-sm animate-in fade-in">
              “{transcript}”
            </p>
          ) : lastAgentReply ? (
            <p className="text-xs sm:text-sm text-emerald-100/90 line-clamp-3 leading-relaxed font-medium">
              {lastAgentReply}
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-stone-400 font-medium">
              {lang === 'hi'
                ? '“केदारनाथ जाने का सबसे अच्छा समय क्या है?” या “मुनस्यारी के लिए 3 दिन का प्लान बताओ”'
                : '“What is the best route to Kedarnath?” or “Suggest a 4-day trek in Munsyari”'}
            </p>
          )}
        </div>

      </div>

      {/* ── Bottom Controls & Prompts ── */}
      <div className="max-w-xl mx-auto w-full text-center shrink-0">
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
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-bold text-emerald-200 hover:text-white transition-all cursor-pointer shadow-2xs"
            >
              {sample}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-stone-400 font-medium">
          Powered by langchain-ai/voice-demo · Google Gemini Live &amp; Devbhoomi Knowledge Engine
        </p>
      </div>

    </div>
  );
}
