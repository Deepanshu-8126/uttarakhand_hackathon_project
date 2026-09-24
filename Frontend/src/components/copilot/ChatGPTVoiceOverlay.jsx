import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Languages, Radio, RefreshCw, Loader2 } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import { useMapStore } from '../../store/mapStore';
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
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const voiceStatusRef = useRef('idle');

  const updateVoiceStatus = (status) => {
    voiceStatusRef.current = status;
    setVoiceStatus(status);
  };

  // Stop TTS and speech recognition on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopVoiceLoop();
    } else {
      setMicErrorMessage('');
      startListening();
    }
    return () => {
      stopVoiceLoop();
    };
  }, [isOpen, lang]);

  const stopVoiceLoop = () => {
    updateVoiceStatus('idle');
    stopSpeaking();
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

  const startListening = async () => {
    stopSpeaking();
    setMicErrorMessage('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicErrorMessage("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    // Explicitly verify / request mic permission
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Close stream tracks once permission is verified so SpeechRecognition can access mic cleanly
        stream.getTracks().forEach(track => track.stop());
      } catch (micErr) {
        console.warn("[VoiceAgent] Mic access denied:", micErr);
        setMicErrorMessage("Microphone access was denied. Please click the lock/settings icon in your browser address bar and allow Microphone.");
        updateVoiceStatus('idle');
        return;
      }
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        updateVoiceStatus('listening');
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
          } else {
            interimText += event.results[i][0].transcript;
          }
        }

        const currentText = finalText || interimText;
        if (currentText) {
          setTranscript(currentText);

          // Debounce auto-send after user stops talking for 1.8s
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (currentText.trim().length > 2) {
              handleVoiceQuerySubmit(currentText.trim());
            }
          }, 1800);
        }
      };

      recognition.onerror = (e) => {
        console.warn("[VoiceAgent] Recognition error:", e.error);
        if (e.error === 'not-allowed') {
          setMicErrorMessage("Microphone permission blocked. Please allow microphone access in your browser settings.");
          updateVoiceStatus('idle');
        } else if (e.error === 'network') {
          setMicErrorMessage("Network issue with speech service. Check your internet connection.");
          updateVoiceStatus('idle');
        } else if (e.error === 'no-speech') {
          // Normal timeout when quiet — do not abort if still supposed to listen
          if (voiceStatusRef.current === 'listening') {
            try { recognition.start(); } catch (err) {}
          }
        } else {
          updateVoiceStatus('idle');
        }
      };

      recognition.onend = () => {
        // If not speaking or processing, keep listening active
        if (voiceStatusRef.current === 'listening') {
          try {
            recognition.start();
          } catch (e) {
            console.warn('[VoiceAgent] onend restart error:', e);
          }
        }
      };

      recognition.start();
    } catch (err) {
      console.error("[VoiceAgent] Start error:", err);
      setMicErrorMessage(err.message || "Failed to start microphone.");
      updateVoiceStatus('idle');
    }
  };

  const handleVoiceQuerySubmit = async (queryText) => {
    if (!queryText || sending) return;
    
    // Stop listening while AI thinks
    updateVoiceStatus('processing');
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    setVoiceStatus('processing');

    const pageContext = {
      currentRoute: window.location?.pathname || '/copilot',
      currentPage: 'COPILOT_VOICE',
      pageType: 'VOICE_AGENT',
      tripId: activeChat?.tripId || tripIdContext,
      plannerForm: useMapStore.getState().plannerForm,
      language: lang
    };

    try {
      const response = await sendMessage(activeChat?._id, queryText, activeChat?.tripId || tripIdContext, pageContext);
      
      const replyContent = response?.data?.reply || response?.data?.message || (typeof response === 'string' ? response : '');
      const cleanReply = typeof replyContent === 'string' ? replyContent : (replyContent?.text || replyContent?.response || '');

      setLastAgentReply(cleanReply);

      if (!isMuted && cleanReply) {
        setVoiceStatus('speaking');
        speakText(cleanReply, {
          lang: lang === 'hi' ? 'hi-IN' : 'en-IN',
          rate: 1.05,
          onStart: () => setVoiceStatus('speaking'),
          onEnd: () => {
            setVoiceStatus('listening');
            startListening();
          },
          onError: () => {
            setVoiceStatus('listening');
            startListening();
          }
        });
      } else {
        setVoiceStatus('listening');
        startListening();
      }
    } catch (err) {
      console.error("[VoiceAgent] Query failed:", err);
      setVoiceStatus('idle');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#091e16]/95 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-10 text-white animate-in fade-in duration-200">
      
      {/* ── Top Header Controls ── */}
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight block">ChatGPT Himalayan Voice</span>
            <span className="text-[10px] text-emerald-300/80 font-medium">Real-time Conversational Agent</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher in Voice Mode */}
          <button
            type="button"
            onClick={() => {
              setLang(lang === 'en' ? 'hi' : 'en');
              stopSpeaking();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all cursor-pointer"
          >
            <Languages size={13} className="text-emerald-300" />
            <span>{lang === 'en' ? 'हिन्दी (Hindi)' : 'English'}</span>
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
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center my-6">
        
        {/* Glowing Orb Animation */}
        <div className="relative mb-8 flex items-center justify-center">
          
          {/* Pulse Ripple Rings */}
          {voiceStatus === 'listening' && (
            <>
              <div className="absolute w-44 h-44 rounded-full bg-emerald-500/20 animate-ping opacity-60 pointer-events-none" />
              <div className="absolute w-56 h-56 rounded-full bg-emerald-400/10 animate-pulse pointer-events-none" />
            </>
          )}

          {voiceStatus === 'speaking' && (
            <>
              <div className="absolute w-48 h-48 rounded-full bg-teal-400/25 animate-ping opacity-80 pointer-events-none" />
              <div className="absolute w-60 h-60 rounded-full bg-cyan-400/15 animate-pulse pointer-events-none" />
            </>
          )}

          {voiceStatus === 'processing' && (
            <div className="absolute w-40 h-40 rounded-full border-2 border-dashed border-emerald-400/40 animate-spin pointer-events-none" />
          )}

          {/* Central Main Button */}
          <button
            type="button"
            onClick={() => {
              if (voiceStatus === 'listening') {
                stopVoiceLoop();
              } else {
                startListening();
              }
            }}
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
              voiceStatus === 'listening'
                ? 'bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white scale-105 shadow-emerald-500/40'
                : voiceStatus === 'speaking'
                ? 'bg-gradient-to-tr from-teal-600 to-cyan-400 text-white scale-105 shadow-cyan-500/40'
                : voiceStatus === 'processing'
                ? 'bg-gradient-to-tr from-slate-800 to-emerald-900 text-emerald-300'
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

        {/* Status Indicator Pill */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest text-emerald-300 backdrop-blur-md">
            <Radio size={13} className={voiceStatus === 'listening' ? 'animate-pulse text-emerald-400' : 'text-slate-400'} />
            <span>
              {voiceStatus === 'listening'
                ? (lang === 'hi' ? 'आपकी आवाज़ सुन रहे हैं…' : 'Listening to you…')
                : voiceStatus === 'processing'
                ? (lang === 'hi' ? 'उत्तर तैयार किया जा रहा है…' : 'Generating response…')
                : voiceStatus === 'speaking'
                ? (lang === 'hi' ? 'AI साथी बोल रहा है…' : 'AI Copilot Speaking…')
                : (lang === 'hi' ? 'बोलने के लिए माइक दबाएं' : 'Tap Mic to Start')}
            </span>
          </span>
        </div>

        {/* Microphone Error Alert */}
        {micErrorMessage && (
          <div className="mb-4 px-4 py-2.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-medium max-w-md mx-auto animate-in fade-in">
            ⚠️ {micErrorMessage}
          </div>
        )}

        {/* Live Spoken Transcript */}
        <div className="min-h-[60px] max-h-36 overflow-y-auto w-full px-4 text-center">
          {transcript ? (
            <p className="text-base sm:text-lg font-medium text-emerald-100 leading-relaxed drop-shadow-sm">
              “{transcript}”
            </p>
          ) : lastAgentReply ? (
            <p className="text-xs sm:text-sm text-emerald-200/80 line-clamp-3 leading-relaxed">
              {lastAgentReply}
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-slate-400">
              {lang === 'hi'
                ? '“केदारनाथ जाने का सबसे अच्छा समय क्या है?” या “मुनस्यारी के लिए 3 दिन का प्लान बताओ”'
                : '“What is the best route to Kedarnath?” or “Suggest a 4-day trek in Munsyari”'}
            </p>
          )}
        </div>

      </div>

      {/* ── Bottom Controls & Prompts ── */}
      <div className="max-w-xl mx-auto w-full text-center">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {[
            lang === 'hi' ? 'बद्रीनाथ का मौसम कैसा है?' : 'Weather in Badrinath',
            lang === 'hi' ? 'वैली ऑफ फ्लावर्स ट्रेक प्लान' : 'Plan Valley of Flowers trek',
            lang === 'hi' ? 'औली में बेस्ट होमस्टे' : 'Find best stays in Auli'
          ].map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTranscript(sample);
                handleVoiceQuerySubmit(sample);
              }}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-medium text-emerald-200 transition-all cursor-pointer"
            >
              {sample}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-slate-400">
          Powered by Himalayan Multi-Agent Reasoning Engine · Speech recognition &amp; TTS active
        </p>
      </div>

    </div>
  );
}
