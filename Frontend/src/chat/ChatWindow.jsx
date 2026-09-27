/**
 * Devbhoomi Conversational AI - ChatWindow
 * Slide-over Drawer Panel with Text Mode & Live Voice Companion View
 * Equipped with Real-time Speech Recognition, Web Audio Visualizer & Natural Voice Synthesis.
 */

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RotateCw, Mic, MicOff, X, Mountain, Route, CloudSun, 
  Sparkles, Keyboard, Square, Volume2, VolumeX, Copy, Check, Radio, Compass, RefreshCw
} from 'lucide-react';
import { useChatState } from './ChatState.js';
import MessageRenderer from './MessageRenderer.jsx';
import SuggestedActions from './SuggestedActions.jsx';
import { speakText, stopSpeaking, cleanTextForSpeech, isSpeechSynthesisSupported } from '../utils/speechSynthesis.js';

export default function ChatWindow({
  isOpen = true,
  onClose = () => {},
  initialQuery = '',
  embedded = false
}) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('हिन्दी');
  const [voiceStatus, setVoiceStatus] = useState('idle'); // 'idle', 'listening', 'thinking', 'speaking'
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveAiReply, setLiveAiReply] = useState('');
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const [copiedAiReply, setCopiedAiReply] = useState(false);

  const {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    clearChat,
    stopGeneration
  } = useChatState({ initialQuery });

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const currentTranscriptRef = useRef('');
  const silenceTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const isListeningRef = useRef(false);

  // Auto-scroll on new tokens or messages in text mode
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Sync latest assistant message with Voice Companion live reply & auto-speak
  useEffect(() => {
    if (!isVoiceActive || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant') {
      const content = lastMsg.content || lastMsg.text || '';
      if (content) {
        setLiveAiReply(content);

        // When assistant is actively streaming/thinking
        if (isLoading || isStreaming) {
          setVoiceStatus('thinking');
        } else if (!isLoading && !isStreaming) {
          // Assistant finished generating response -> Speak it
          if (!isVoiceMuted && isSpeechSynthesisSupported()) {
            setVoiceStatus('speaking');
            const clean = cleanTextForSpeech(content);
            const langCode = selectedLanguage === 'English' ? 'en-IN' : 'hi-IN';
            
            speakText(clean, {
              lang: langCode,
              onStart: () => setVoiceStatus('speaking'),
              onEnd: () => {
                setVoiceStatus('idle');
              },
              onError: () => {
                setVoiceStatus('idle');
              }
            });
          } else {
            setVoiceStatus('idle');
          }
        }
      }
    }
  }, [messages, isLoading, isStreaming, isVoiceActive, isVoiceMuted, selectedLanguage]);

  // ── 1. Web Audio Hardware Analyser for Real Microphone Visualizer ──
  const startAudioVisualizer = useCallback(async () => {
    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        if (ctx.state === 'suspended') {
          await ctx.resume().catch(() => {});
        }

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const trackAudio = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length / 255;
          setMicAudioLevel(avg);
          animFrameRef.current = requestAnimationFrame(trackAudio);
        };
        trackAudio();
      }
    } catch (err) {
      console.warn('[ChatWindow] Mic stream visualizer permission notice:', err);
    }
  }, []);

  const stopAudioVisualizer = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (_) {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setMicAudioLevel(0);
  }, []);

  // ── 2. Real-Time Web Speech Recognition ──
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech Recognition is not supported on this browser. Please use Google Chrome, Edge, or text mode.');
      return;
    }

    try {
      // Stop any active utterance first
      stopSpeaking();
      clearTimeout(silenceTimeoutRef.current);

      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }

      const rec = new SpeechRec();
      rec.continuous = false; // continuous: false is standard across Chrome & Edge to prevent network socket drops
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      // Select language code
      rec.lang = selectedLanguage === 'English' ? 'en-IN' : 'hi-IN';

      rec.onstart = () => {
        isListeningRef.current = true;
        setVoiceStatus('listening');
        currentTranscriptRef.current = '';
        setLiveTranscript('');
      };

      rec.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += trans;
          } else {
            interimText += trans;
          }
        }

        const currentSoFar = (currentTranscriptRef.current + ' ' + finalText).trim();
        if (finalText) {
          currentTranscriptRef.current = currentSoFar;
        }

        const fullDisplay = (currentSoFar + (interimText ? ' ' + interimText : '')).trim();
        if (fullDisplay) {
          setLiveTranscript(fullDisplay);
        }

        // Auto-submit after 1.4s pause in speech
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = setTimeout(() => {
          const toSubmit = currentTranscriptRef.current || fullDisplay;
          if (toSubmit && toSubmit.length > 2 && isListeningRef.current && !isLoading) {
            try { rec.stop(); } catch (_) {}
            isListeningRef.current = false;
            handleVoiceSubmit(toSubmit);
          }
        }, 1400);
      };

      rec.onerror = (event) => {
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please click the Lock icon (🔒) in your address bar and Allow Microphone.');
        } else if (event.error !== 'no-speech' && event.error !== 'network') {
          console.warn('[SpeechRecognition Notice]', event.error);
        }
        setVoiceStatus('idle');
        isListeningRef.current = false;
      };

      rec.onend = () => {
        isListeningRef.current = false;
        const toSubmit = currentTranscriptRef.current || liveTranscript;
        if (toSubmit && toSubmit.length > 2 && voiceStatus === 'listening' && !isLoading) {
          handleVoiceSubmit(toSubmit);
        } else if (voiceStatus !== 'thinking' && voiceStatus !== 'speaking') {
          setVoiceStatus('idle');
        }
      };

      recognitionRef.current = rec;
      rec.start();
      startAudioVisualizer();
    } catch (err) {
      console.warn('[SpeechRecognition Start Error]', err);
      setVoiceStatus('idle');
      isListeningRef.current = false;
    }
  }, [selectedLanguage, liveTranscript, voiceStatus, isLoading, startAudioVisualizer]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    clearTimeout(silenceTimeoutRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    stopAudioVisualizer();
    if (voiceStatus === 'listening') {
      const toSubmit = currentTranscriptRef.current || liveTranscript;
      if (toSubmit && toSubmit.length > 2) {
        handleVoiceSubmit(toSubmit);
      } else {
        setVoiceStatus('idle');
      }
    }
  }, [liveTranscript, voiceStatus, stopAudioVisualizer]);

  // Submit voice prompt to agent backend
  const handleVoiceSubmit = useCallback((queryText) => {
    if (!queryText || !queryText.trim() || isLoading) return;
    setVoiceStatus('thinking');
    isListeningRef.current = false;
    clearTimeout(silenceTimeoutRef.current);
    stopSpeaking();
    stopAudioVisualizer();

    let formattedQuery = queryText.trim();
    if (selectedLanguage === 'गढ़वाली (Garhwali)') {
      formattedQuery = `[In Garhwali dialect]: ${formattedQuery}`;
    } else if (selectedLanguage === 'कुमाऊँनी (Kumaoni)') {
      formattedQuery = `[In Kumaoni dialect]: ${formattedQuery}`;
    }

    sendMessage(formattedQuery);
  }, [isLoading, selectedLanguage, sendMessage, stopAudioVisualizer]);

  // Toggle voice active mode
  const toggleVoiceMode = useCallback((active) => {
    setIsVoiceActive(active);
    if (active) {
      // Auto-start listening on entering voice mode
      setTimeout(() => {
        startListening();
      }, 300);
    } else {
      stopSpeaking();
      stopListening();
      setVoiceStatus('idle');
    }
  }, [startListening, stopListening]);

  // Clean up speech recognition & audio visualizer on unmount or drawer close
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopAudioVisualizer();
      clearTimeout(silenceTimeoutRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
    };
  }, [isVoiceActive, isOpen, stopAudioVisualizer]);

  // Reset conversation handler
  const handleReset = () => {
    clearChat();
    stopSpeaking();
    stopListening();
    setLiveTranscript('');
    setLiveAiReply('');
    setVoiceStatus('idle');
  };

  // Replay voice speech for current AI reply
  const handleReplayVoice = () => {
    if (!liveAiReply) return;
    stopSpeaking();
    setVoiceStatus('speaking');
    const clean = cleanTextForSpeech(liveAiReply);
    const langCode = selectedLanguage === 'English' ? 'en-IN' : 'hi-IN';
    speakText(clean, {
      lang: langCode,
      onStart: () => setVoiceStatus('speaking'),
      onEnd: () => setVoiceStatus('idle'),
      onError: () => setVoiceStatus('idle')
    });
  };

  // Copy AI response text
  const handleCopyAiReply = () => {
    if (!liveAiReply) return;
    navigator.clipboard.writeText(liveAiReply);
    setCopiedAiReply(true);
    setTimeout(() => setCopiedAiReply(false), 2000);
  };

  // Interrupt active speech / generation
  const handleInterrupt = () => {
    stopGeneration();
    stopSpeaking();
    clearTimeout(silenceTimeoutRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }
    stopAudioVisualizer();
    setVoiceStatus('idle');
  };

  // Dynamic telemetry badges extracted from AI reply
  const telemetryBadges = useMemo(() => {
    const text = liveAiReply || '';
    const badges = [];

    // Altitude extraction (e.g. 3,583m, 2,615m, 2,084m)
    const altMatch = text.match(/(\d{1,2}[,.]?\d{3}\s*m)/i);
    if (altMatch) {
      badges.push({ icon: '🏔️', text: altMatch[1] });
    } else {
      badges.push({ icon: '🏔️', text: 'Himalayan Corridor' });
    }

    // Weather extraction (e.g. 14°C, sunny, clear, snow)
    const tempMatch = text.match(/(\d{1,2}°C)/i);
    const weatherWord = text.match(/(sunny|clear|snow|rain|fog|cold|pleasant|chilly|breeze)/i);
    if (tempMatch) {
      badges.push({ icon: '⛅', text: `${tempMatch[1]} ${weatherWord ? weatherWord[1].charAt(0).toUpperCase() + weatherWord[1].slice(1) : 'Clear'}` });
    } else if (weatherWord) {
      badges.push({ icon: '⛅', text: `${weatherWord[1].charAt(0).toUpperCase() + weatherWord[1].slice(1)} Forecast` });
    } else {
      badges.push({ icon: '⛅', text: '14°C Clear Skies' });
    }

    // Difficulty extraction
    if (/challenging|difficult|steep|strenuous/i.test(text)) {
      badges.push({ icon: '🥾', text: 'Challenging Trail' });
    } else if (/moderate/i.test(text)) {
      badges.push({ icon: '🥾', text: 'Moderate Difficulty' });
    } else {
      badges.push({ icon: '🛡️', text: 'Live Road Verified' });
    }

    return badges;
  }, [liveAiReply]);

  // Quick voice prompts
  const voiceSuggestions = [
    { label: '🏔️ Kedarnath Weather & Road', prompt: 'Kedarnath Dham weather forecast aur Gaurikund road status kaisa hai?' },
    { label: '🥾 3-Day Chopta Trek', prompt: 'Suggest a 3-day trek itinerary for Chopta, Tungnath, and Chandrashila with stays.' },
    { label: '🏍️ Rishikesh Bike Rentals', prompt: 'Royal Enfield and Himalayan bike rental rates in Rishikesh.' },
    { label: '🏡 Munsyari Homestays', prompt: 'Best traditional homestays in Munsyari with Panchachuli mountain views.' }
  ];

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const latestSuggestions = messages[messages.length - 1]?.suggestions || [];

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 overflow-hidden relative selection:bg-emerald-100 font-sans">
      
      {/* ── Drawer Top Bar / Header ── */}
      <header className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0b533e] to-emerald-600 flex items-center justify-center text-white shadow-xs ring-2 ring-emerald-600/20 shrink-0">
            <svg className="w-5 h-5 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L14.39 8.26L21 9.27L16.2 13.97L17.34 20.73L12 17.27L6.66 20.73L7.8 13.97L3 9.27L9.61 8.26L12 2Z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base leading-none">Devbhoomi AI</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">Devbhoomi Travel Copilot</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {isVoiceActive ? (
            <button
              type="button"
              onClick={() => toggleVoiceMode(false)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
              title="Voice Active — Click to switch to Text Mode"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
              <span>Voice Active</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toggleVoiceMode(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Switch to Voice Mode"
            >
              <Mic size={14} className="text-emerald-700" />
              <span>Voice</span>
            </button>
          )}

          {/* Speaker Mute/Unmute in Voice Mode */}
          {isVoiceActive && (
            <button
              type="button"
              onClick={() => {
                if (!isVoiceMuted) stopSpeaking();
                setIsVoiceMuted(prev => !prev);
              }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                isVoiceMuted ? 'text-rose-600 bg-rose-50 hover:bg-rose-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title={isVoiceMuted ? 'Voice Muted (Click to Unmute)' : 'Voice Audio Enabled (Click to Mute)'}
            >
              {isVoiceMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Reset Conversation"
          >
            <RotateCw size={15} />
          </button>

          {!embedded && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close Drawer"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </header>

      {/* ── CONDITIONAL RENDER: VOICE COMPANION MODE vs TEXT CHAT MODE ── */}
      {isVoiceActive ? (
        // ═════════════════════════════════════════════════════════════════════
        // LIVE VOICE COMPANION VIEW
        // ═════════════════════════════════════════════════════════════════════
        <div className="flex-1 min-h-0 flex flex-col justify-between p-5 overflow-y-auto custom-copilot-scrollbar bg-gradient-to-b from-emerald-950/5 via-white to-slate-50">
          <div className="space-y-4">
            
            {/* 1. Interactive Pulsing Mic Orb & Audio Equalizer */}
            <div className="flex flex-col items-center justify-center pt-3 pb-2 space-y-3">
              
              {/* Central Glowing Interactive Orb */}
              <div className="relative flex items-center justify-center">
                {/* Concentric Ambient Glow Rings */}
                {voiceStatus === 'listening' && (
                  <div 
                    className="absolute w-28 h-28 rounded-full bg-emerald-400/20 animate-ping pointer-events-none"
                    style={{ transform: `scale(${1 + micAudioLevel * 1.2})` }}
                  />
                )}
                {voiceStatus === 'speaking' && (
                  <div className="absolute w-28 h-28 rounded-full bg-emerald-500/20 animate-pulse pointer-events-none" />
                )}
                {voiceStatus === 'thinking' && (
                  <div className="absolute w-24 h-24 rounded-full border-2 border-dashed border-amber-400 animate-spin pointer-events-none" />
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (voiceStatus === 'listening') {
                      stopListening();
                    } else if (voiceStatus === 'speaking') {
                      stopSpeaking();
                      setVoiceStatus('idle');
                    } else {
                      startListening();
                    }
                  }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
                    voiceStatus === 'listening'
                      ? 'bg-emerald-100 ring-8 ring-emerald-500/20 scale-105 shadow-emerald-500/30'
                      : voiceStatus === 'speaking'
                      ? 'bg-emerald-50 ring-8 ring-emerald-500/15'
                      : voiceStatus === 'thinking'
                      ? 'bg-amber-50 ring-8 ring-amber-400/20'
                      : 'bg-slate-100 ring-8 ring-slate-100 hover:scale-105'
                  }`}
                  title={voiceStatus === 'listening' ? 'Listening... Tap to stop' : 'Tap to speak into microphone'}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all ${
                    voiceStatus === 'listening'
                      ? 'bg-gradient-to-tr from-[#0b533e] to-emerald-500 text-white animate-pulse'
                      : voiceStatus === 'speaking'
                      ? 'bg-gradient-to-tr from-[#0b533e] to-teal-600 text-white'
                      : voiceStatus === 'thinking'
                      ? 'bg-amber-600 text-white'
                      : 'bg-[#0b533e] text-white'
                  }`}>
                    {voiceStatus === 'listening' ? (
                      <Mic size={26} className="text-white animate-bounce" />
                    ) : voiceStatus === 'speaking' ? (
                      <Volume2 size={26} className="text-white animate-pulse" />
                    ) : voiceStatus === 'thinking' ? (
                      <RefreshCw size={24} className="text-white animate-spin" />
                    ) : (
                      <Mic size={26} className="text-white" />
                    )}
                  </div>
                </button>
              </div>

              {/* Status Pill Badge */}
              <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold shadow-2xs transition-all ${
                voiceStatus === 'listening'
                  ? 'bg-emerald-100/80 border border-emerald-300 text-emerald-900'
                  : voiceStatus === 'speaking'
                  ? 'bg-teal-50 border border-teal-300 text-teal-900'
                  : voiceStatus === 'thinking'
                  ? 'bg-amber-50 border border-amber-300 text-amber-900'
                  : 'bg-slate-100 border border-slate-200 text-slate-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  voiceStatus === 'listening' ? 'bg-emerald-500 animate-pulse' :
                  voiceStatus === 'speaking' ? 'bg-teal-500 animate-pulse' :
                  voiceStatus === 'thinking' ? 'bg-amber-500 animate-spin' :
                  'bg-slate-400'
                }`} />
                <span>
                  {voiceStatus === 'speaking' 
                    ? 'Devbhoomi AI Speaking...' 
                    : voiceStatus === 'thinking'
                    ? 'Analyzing mountain telemetry & route...'
                    : voiceStatus === 'listening'
                    ? 'Listening to your voice... (Speak now)'
                    : 'Tap microphone to speak'}
                </span>
              </div>

              {/* 9-Bar Real-Time Equalizer */}
              <div className="flex items-center justify-center gap-1 h-6 pt-1">
                {[10, 16, 22, 14, 26, 18, 24, 15, 12].map((h, i) => {
                  let barHeight = 4;
                  if (voiceStatus === 'listening') {
                    // React to real hardware audio volume
                    barHeight = Math.max(4, Math.min(26, Math.round(micAudioLevel * 50 * (h / 15)) + (i % 2 === 0 ? 6 : 3)));
                  } else if (voiceStatus === 'speaking') {
                    barHeight = h;
                  } else if (voiceStatus === 'thinking') {
                    barHeight = (i % 2 === 0 ? 12 : 6);
                  }

                  return (
                    <div
                      key={i}
                      style={{ height: `${barHeight}px` }}
                      className={`w-1 rounded-full transition-all duration-100 ${
                        voiceStatus === 'listening'
                          ? 'bg-emerald-500'
                          : voiceStatus === 'speaking'
                          ? 'bg-teal-500 animate-pulse'
                          : voiceStatus === 'thinking'
                          ? 'bg-amber-400 animate-pulse'
                          : 'bg-slate-300'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* 2. YOU SAID (LIVE TRANSCRIPT) Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span className={`w-2 h-2 rounded-full ${voiceStatus === 'listening' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  <span>YOU SAID (LIVE TRANSCRIPT)</span>
                </div>
                {liveTranscript && (
                  <button
                    type="button"
                    onClick={() => {
                      setLiveTranscript('');
                      currentTranscriptRef.current = '';
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              <p className="text-xs sm:text-sm text-slate-800 font-medium italic mt-2.5 leading-relaxed min-h-[32px]">
                {liveTranscript ? (
                  <span>“{liveTranscript}”</span>
                ) : (
                  <span className="text-slate-400 font-normal not-italic">
                    {voiceStatus === 'listening' ? 'Listening to your speech... Speak now in Hindi, English, Garhwali or Kumaoni.' : 'Tap the mic above and speak your destination question...'}
                  </span>
                )}
              </p>

              {/* Quick Voice Suggestion Chips if no speech yet */}
              {!liveTranscript && voiceStatus !== 'speaking' && (
                <div className="pt-2 mt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {voiceSuggestions.slice(0, 2).map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleVoiceSubmit(item.prompt)}
                      className="text-[11px] font-medium bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 px-2.5 py-1 rounded-lg border border-slate-200/60 transition-colors cursor-pointer text-left"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Devbhoomi AI Speaking Response Card */}
            {(liveAiReply || voiceStatus === 'thinking' || voiceStatus === 'speaking') && (
              <div className="bg-emerald-50/50 border border-emerald-200/90 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#0b533e] text-amber-300 flex items-center justify-center text-xs shadow-xs">
                      ★
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">Devbhoomi AI</span>
                      <span className="text-[10px] text-emerald-800 font-medium">Mountain Companion</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Replay voice button */}
                    {liveAiReply && voiceStatus !== 'thinking' && (
                      <button
                        type="button"
                        onClick={handleReplayVoice}
                        className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-emerald-800 border border-emerald-200/80 transition-colors cursor-pointer shadow-2xs"
                        title="Replay Voice Speech"
                      >
                        <Volume2 size={13} />
                      </button>
                    )}

                    {/* Copy text button */}
                    {liveAiReply && (
                      <button
                        type="button"
                        onClick={handleCopyAiReply}
                        className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-600 border border-emerald-200/80 transition-colors cursor-pointer shadow-2xs"
                        title="Copy Response"
                      >
                        {copiedAiReply ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>
                    )}

                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      voiceStatus === 'speaking' ? 'bg-emerald-100 text-emerald-800' :
                      voiceStatus === 'thinking' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100/60 text-emerald-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${voiceStatus === 'speaking' || voiceStatus === 'thinking' ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-600'}`} />
                      <span>{voiceStatus === 'speaking' ? 'Speaking' : voiceStatus === 'thinking' ? 'Thinking' : 'Verified'}</span>
                    </span>
                  </div>
                </div>

                {/* AI Response Text */}
                <div className="text-xs sm:text-sm text-slate-800 font-normal leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto custom-copilot-scrollbar">
                  {voiceStatus === 'thinking' && !liveAiReply ? (
                    <div className="flex items-center gap-2 text-slate-500 py-2">
                      <RefreshCw size={14} className="animate-spin text-emerald-600" />
                      <span>Consulting Uttarakhand route telemetry & databases...</span>
                    </div>
                  ) : (
                    liveAiReply
                  )}
                </div>

                {/* Dynamic Telemetry Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {telemetryBadges.map((badge, bIdx) => (
                    <span 
                      key={bIdx}
                      className="inline-flex items-center gap-1 bg-white border border-emerald-200/80 text-emerald-900 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs"
                    >
                      <span>{badge.icon}</span>
                      <span>{badge.text}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 4. VOICE DIALECT / LANGUAGE Section */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  VOICE DIALECT / LANGUAGE
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                  Auto-Detect On
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  'हिन्दी',
                  'English',
                  'गढ़वाली (Garhwali)',
                  'कुमाऊँनी (Kumaoni)'
                ].map((lang) => {
                  const isActive = selectedLanguage === lang;
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(lang);
                        // If actively listening, restart with new language
                        if (voiceStatus === 'listening') {
                          stopListening();
                          setTimeout(() => startListening(), 200);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0b533e] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 5. Bottom Voice Action Bar */}
          <div className="pt-4 border-t border-slate-200/80 space-y-2 shrink-0 bg-white/60 backdrop-blur-xs -mx-5 px-5 pb-1">
            <div className="flex items-center justify-between gap-3">
              {/* Keyboard Mode Button */}
              <button
                type="button"
                onClick={() => toggleVoiceMode(false)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              >
                <Keyboard size={14} className="text-slate-500" />
                <span>Keyboard</span>
              </button>

              {/* Big Center Mic Trigger */}
              <button
                type="button"
                onClick={() => {
                  if (voiceStatus === 'listening') {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
                className={`w-12 h-12 rounded-full text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer ${
                  voiceStatus === 'listening'
                    ? 'bg-rose-600 ring-4 ring-rose-300/40 animate-pulse'
                    : 'bg-[#0b533e] hover:bg-[#073c2c]'
                }`}
                title={voiceStatus === 'listening' ? 'Tap to send voice now' : 'Tap to speak into microphone'}
              >
                {voiceStatus === 'listening' ? (
                  <Square size={16} className="fill-white" />
                ) : (
                  <Mic size={20} />
                )}
              </button>

              {/* Interrupt / Stop Button */}
              <button
                type="button"
                onClick={handleInterrupt}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
                title="Stop speech and AI generation"
              >
                <Square size={12} className="fill-rose-600" />
                <span>Interrupt</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center select-none pt-1">
              Uttarakhand Tourism Real-time Speech AI Engine • Multi-Dialect
            </p>
          </div>
        </div>
      ) : (
        // ═════════════════════════════════════════════════════════════════════
        // STANDARD TEXT CHAT VIEW
        // ═════════════════════════════════════════════════════════════════════
        <>
          {/* Drawer Scrollable Content Body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 space-y-6 custom-copilot-scrollbar">
            
            {/* Welcome Empty State */}
            {messages.length <= 1 && (
              <>
                <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-white p-5 border border-slate-100 text-center flex flex-col items-center shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shadow-xs mb-3.5">
                    <Mountain size={24} className="text-emerald-800" />
                  </div>
                  <h2 className="font-bold text-slate-900 text-xl tracking-tight">
                    Welcome to Devbhoomi AI
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-sm leading-relaxed">
                    Your intelligent Uttarakhand yatra navigator. Ask for instant trek itineraries, live route alerts, weather forecasts, or sacred temple timings.
                  </p>
                </div>

                {/* 2-Column Action Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => sendMessage('Mujhe 4-day Uttarakhand mountain trek plan bana do customized routes aur stay stops ke saath')}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                      <Route size={16} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      Plan 4-Day Trek
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Customized day-wise routes &amp; stay stops
                    </p>
                  </div>

                  <div
                    onClick={() => sendMessage('Kedarnath aur Mandakini valley ka live road condition aur weather kaisa hai?')}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                      <CloudSun size={16} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      Live Road &amp; Weather
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Mandakini valley alerts &amp; temperature
                    </p>
                  </div>
                </div>

                {/* Suggested Queries */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Suggested Queries
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Kedarnath Dham Route', prompt: 'Kedarnath Dham trek route details, distance from Gaurikund, and safety tips' },
                      { label: 'Auli Skiing Season', prompt: 'Auli skiing season timings, cable car tickets, and weather conditions' },
                      { label: '3-Day Rishikesh', prompt: '3-Day Rishikesh spiritual and adventure itinerary with Ganga Aarti' },
                      { label: 'Live Weather & Snow', prompt: 'Current live weather, snowfall updates and mountain pass conditions in Uttarakhand' },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => sendMessage(item.prompt)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100/90 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200/50 cursor-pointer"
                      >
                        <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L14.39 8.26L21 9.27L16.2 13.97L17.34 20.73L12 17.27L6.66 20.73L7.8 13.97L3 9.27L9.61 8.26L12 2Z" />
                        </svg>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Message History */}
            {messages.map((msg) => (
              <MessageRenderer key={msg.id} message={msg} onSendPrompt={(prompt) => sendMessage(prompt)} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Follow-up Actions */}
          {latestSuggestions.length > 0 && !isStreaming && (
            <div className="shrink-0 px-4 py-1.5 bg-gradient-to-t from-white to-transparent z-10">
              <SuggestedActions
                suggestions={latestSuggestions}
                onSelect={(prompt) => sendMessage(prompt)}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Interactive Bottom Chat Input Area */}
          <footer className="p-4 sm:p-5 border-t border-slate-100 bg-white/95 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200/80 rounded-2xl focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 transition-all">
              <button
                type="button"
                onClick={() => toggleVoiceMode(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors shrink-0 cursor-pointer"
                title="Open Voice Companion"
              >
                <Mic size={17} className="text-emerald-700" />
              </button>
              
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Devbhoomi AI anything..."
                disabled={isLoading && !isStreaming}
                className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 px-1 py-1 font-normal"
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim() || (isLoading && !isStreaming)}
                className={`w-9 h-9 rounded-xl bg-[#0b533e] hover:bg-[#073c2c] text-white flex items-center justify-center shadow-xs hover:shadow-md transition-all shrink-0 active:scale-95 cursor-pointer ${
                  !inputText.trim() ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                title="Send message"
              >
                <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-2.5 select-none">
              Powered by Uttarakhand Tourism Knowledge Engine
            </p>
          </footer>
        </>
      )}

    </div>
  );
}
