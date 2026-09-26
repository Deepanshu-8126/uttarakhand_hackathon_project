import React, { useEffect, useState, useRef } from 'react';
import { 
  X, Mic, MicOff, Volume2, VolumeX, PhoneOff, 
  Sparkles, Radio, Layers, Activity, Zap, Clock, User, Bot
} from 'lucide-react';
import { VoiceVisualizer } from './VoiceVisualizer';
import { audioProcessor } from '../../services/audioProcessor';
import { liveClient } from '../../services/geminiLiveClient';
import { speakText, stopSpeaking } from '../../utils/speechSynthesis';

export default function DevbhoomiVoiceStudioModal({
  isOpen = false,
  onClose = () => {},
  initialVoice = 'Aoede',
  onTranscriptReceived = () => {}
}) {
  const [status, setStatus] = useState('idle'); // idle | listening | speaking | processing | error
  const [selectedVoice, setSelectedVoice] = useState(initialVoice);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [visualMode, setVisualMode] = useState('orb'); // orb | wave
  const [liveUserText, setLiveUserText] = useState('');
  const [liveAiText, setLiveAiText] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [micVolume, setMicVolume] = useState(0);
  const [speakerVolume, setSpeakerVolume] = useState(0);

  const [analyser, setAnalyser] = useState(null);
  const [outputAnalyser, setOutputAnalyser] = useState(null);

  const isMutedRef = useRef(false);
  const currentAiTextRef = useRef('');
  const currentUserTextRef = useRef('');
  const captionsEndRef = useRef(null);

  const voices = [
    { id: 'Aoede', name: 'Aoede (Warm & Authentic, Female)' },
    { id: 'Puck', name: 'Puck (Energetic & Quick, Male)' },
    { id: 'Charon', name: 'Charon (Deep Mountain Tone, Male)' },
    { id: 'Kore', name: 'Kore (Gentle & Calm, Female)' },
    { id: 'Fenrir', name: 'Fenrir (Direct Guide, Male)' }
  ];

  // Auto scroll captions
  useEffect(() => {
    captionsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveUserText, liveAiText, transcriptHistory]);

  // Duration timer
  useEffect(() => {
    let timer;
    if (isOpen) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getCurrentTimestamp = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Real-time VU meter listener
  useEffect(() => {
    let animId;
    const updateLevels = () => {
      const dataArr = new Uint8Array(128);

      if (analyser && !isMutedRef.current) {
        analyser.getByteFrequencyData(dataArr);
        let sum = 0;
        for (let i = 0; i < dataArr.length; i++) {
          sum += dataArr[i];
        }
        const avg = sum / dataArr.length;
        const pct = Math.min(100, Math.round((avg / 128) * 100));
        setMicVolume(pct);
      } else {
        setMicVolume(0);
      }

      if (outputAnalyser) {
        outputAnalyser.getByteFrequencyData(dataArr);
        let sum = 0;
        for (let i = 0; i < dataArr.length; i++) {
          sum += dataArr[i];
        }
        const avg = sum / dataArr.length;
        const pct = Math.min(100, Math.round((avg / 128) * 100));
        setSpeakerVolume(pct);
      } else {
        setSpeakerVolume(0);
      }

      animId = requestAnimationFrame(updateLevels);
    };

    if (isOpen) {
      animId = requestAnimationFrame(updateLevels);
    }

    return () => cancelAnimationFrame(animId);
  }, [analyser, outputAnalyser, isOpen]);

  // Start voice session when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopVoiceSession();
      return;
    }

    startVoiceSession();

    return () => {
      stopVoiceSession();
    };
  }, [isOpen, selectedVoice]);

  const startVoiceSession = async () => {
    setErrorMessage(null);
    setStatus('listening');
    setLiveAiText('');
    setLiveUserText('');
    currentAiTextRef.current = '';
    currentUserTextRef.current = '';
    isProcessingRef.current = false;

    // Direct Browser Web Speech Recognition for guaranteed zero-friction voice
    try {
      const audioCtx = audioProcessor.initContext();
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      audioProcessor.startMicCapture(() => {}).then((micAnalyser) => {
        setAnalyser(micAnalyser);
        setOutputAnalyser(audioProcessor.getOutputAnalyser());
      }).catch((e) => console.warn('[AudioProcessor] Mic visualizer notice:', e));
    } catch (err) {
      console.warn('[DevbhoomiVoiceStudio] Audio capture notice:', err);
    }

    startUniversalSpeechFallback();
  };

  const webSpeechRecRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isProcessingRef = useRef(false);

  const handleProcessVoiceInput = async (userSaid) => {
    if (!userSaid || userSaid.trim().length < 2 || isProcessingRef.current) return;
    isProcessingRef.current = true;

    // Stop recognition while AI is thinking and speaking to prevent feedback loop
    if (webSpeechRecRef.current) {
      try { webSpeechRecRef.current.stop(); } catch (e) {}
    }

    const cleanUser = userSaid.trim();
    setTranscriptHistory(prev => [...prev, { role: 'user', text: cleanUser, time: getCurrentTimestamp() }]);
    setStatus('processing');
    setLiveAiText('Thinking...');
    setLiveUserText('');

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://uttarakhand-hackathon-project.onrender.com/api';
      const res = await fetch(`${apiBase}/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: cleanUser })
      });

      const data = await res.json();
      const reply = data.data?.message || data.response?.message || data.data?.text || data.message || data.response || 'Namaste! Main aapka Devbhoomi travel assistant hoon. Kahiye main aapki kya madad kar sakta hoon?';
      const cleanReply = reply.replace(/[*#_~`]/g, '').trim();

      setLiveAiText(cleanReply);
      setTranscriptHistory(prev => [...prev, { role: 'assistant', text: cleanReply, time: getCurrentTimestamp() }]);
      setStatus('speaking');

      if (!isSpeakerMuted) {
        speakText(cleanReply, {
          lang: 'hi-IN',
          rate: 1.05,
          pitch: 1.0,
          onStart: () => setStatus('speaking'),
          onEnd: () => {
            isProcessingRef.current = false;
            setStatus('listening');
            restartRecognition();
          },
          onError: () => {
            isProcessingRef.current = false;
            setStatus('listening');
            restartRecognition();
          }
        });
      } else {
        setTimeout(() => {
          isProcessingRef.current = false;
          setStatus('listening');
          restartRecognition();
        }, 2000);
      }
    } catch (apiErr) {
      console.warn('[UniversalVoice] API error, using local fallback:', apiErr);
      const fallbackReply = `Namaste! Uttarakhand ke baare mein aapne poochha: "${cleanUser}". Weather suhana hai aur Char Dham highways open hain.`;
      setLiveAiText(fallbackReply);
      setTranscriptHistory(prev => [...prev, { role: 'assistant', text: fallbackReply, time: getCurrentTimestamp() }]);
      setStatus('speaking');
      
      speakText(fallbackReply, {
        lang: 'hi-IN',
        onEnd: () => {
          isProcessingRef.current = false;
          setStatus('listening');
          restartRecognition();
        },
        onError: () => {
          isProcessingRef.current = false;
          setStatus('listening');
          restartRecognition();
        }
      });
    }
  };

  const restartRecognition = () => {
    if (!isOpen || isProcessingRef.current) return;
    try {
      if (webSpeechRecRef.current) {
        webSpeechRecRef.current.start();
      }
    } catch (e) {}
  };

  const startUniversalSpeechFallback = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setStatus('listening');
      return;
    }

    try {
      if (webSpeechRecRef.current) {
        try { webSpeechRecRef.current.stop(); } catch (e) {}
      }

      const rec = new SpeechRec();
      rec.lang = 'hi-IN';
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
          else interim += event.results[i][0].transcript;
        }

        const currentText = (final || interim).trim();
        if (currentText) {
          setLiveUserText(currentText);
        }

        if (final && final.trim().length > 1) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          handleProcessVoiceInput(final.trim());
        } else if (interim && interim.trim().length > 2) {
          // Debounce silence timer so pause after speech immediately triggers reply
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (!isProcessingRef.current && interim.trim()) {
              handleProcessVoiceInput(interim.trim());
            }
          }, 1400);
        }
      };

      rec.onerror = (e) => {
        if (!isProcessingRef.current) {
          setStatus('listening');
        }
      };

      rec.onend = () => {
        if (isOpen && !isProcessingRef.current) {
          try { rec.start(); } catch (e) {}
        }
      };

      webSpeechRecRef.current = rec;
      rec.start();
    } catch (e) {
      console.warn('[UniversalVoice] Speech recognition init error:', e);
    }
  };

  const stopVoiceSession = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    isProcessingRef.current = false;
    if (webSpeechRecRef.current) {
      try { webSpeechRecRef.current.stop(); } catch (e) {}
      webSpeechRecRef.current = null;
    }
    stopSpeaking();
    liveClient.disconnect();
    audioProcessor.destroy();
    setAnalyser(null);
    setOutputAnalyser(null);
    setStatus('idle');
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    isMutedRef.current = next;
  };

  const toggleSpeaker = () => {
    setIsSpeakerMuted(!isSpeakerMuted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 bg-[#050c08]/98 backdrop-blur-3xl text-white select-none overflow-hidden animate-in fade-in duration-300">
      
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[340px] h-[260px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* ── 1. Top Bar: Minimal Brand, Status & Controls ────────────────────────── */}
      <div className="w-full max-w-3xl flex items-center justify-between z-10 shrink-0">
        
        {/* Brand Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wide text-stone-200">Devbhoomi AI</span>
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Live
          </span>
        </div>

        {/* Dynamic Center Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-stone-300">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              status === 'speaking' ? 'bg-emerald-400' : status === 'listening' ? 'bg-cyan-400' : 'bg-amber-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              status === 'speaking' ? 'bg-emerald-500' : status === 'listening' ? 'bg-cyan-500' : 'bg-amber-500'
            }`}></span>
          </span>
          <span>
            {status === 'speaking' ? 'Speaking...' :
             status === 'listening' ? (isMuted ? 'Muted' : (micVolume > 5 ? 'Hearing you...' : 'Listening...')) :
             status === 'processing' ? 'Connecting...' :
             status === 'error' ? 'Notice' : 'Ready'}
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Voice Selector */}
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs font-medium px-2.5 py-1 rounded-xl border border-white/10 focus:outline-none cursor-pointer transition-all shrink-0 max-w-[120px] sm:max-w-none truncate"
          >
            {voices.map(v => (
              <option key={v.id} value={v.id} className="bg-[#0b1a10] text-stone-200">
                {v.name.split(' ')[0]}
              </option>
            ))}
          </select>

          {/* Mode Switcher */}
          <button
            onClick={() => setVisualMode(visualMode === 'orb' ? 'wave' : 'orb')}
            title={`Switch to ${visualMode === 'orb' ? 'Spectrum Wave' : 'Fluid Orb'}`}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-stone-400 hover:text-white transition-colors border border-white/10 cursor-pointer"
          >
            {visualMode === 'orb' ? <Activity className="w-4 h-4 text-emerald-400" /> : <Layers className="w-4 h-4 text-teal-400" />}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-stone-400 hover:text-white transition-colors border border-white/10 cursor-pointer"
            aria-label="Close studio"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 2. Center Stage: Gemini Glowing Orb & Subtitle Typography ─────────── */}
      <div className="w-full max-w-xl flex flex-col items-center justify-center my-auto z-10 space-y-6 sm:space-y-8">
        
        {/* Gemini Visualizer Orb */}
        <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center shrink-0">
          <VoiceVisualizer
            analyser={analyser}
            outputAnalyser={outputAnalyser}
            isActive={status !== 'idle' && status !== 'error'}
            status={status}
            mode={visualMode}
          />
        </div>

        {/* Live Subtitle Transcript Banner */}
        <div className="w-full px-4 sm:px-6 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl text-center space-y-1.5 min-h-[85px] flex flex-col justify-center">
          {liveUserText ? (
            <div className="animate-in fade-in duration-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-0.5">
                You
              </span>
              <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                "{liveUserText}"
              </p>
            </div>
          ) : liveAiText ? (
            <div className="animate-in fade-in duration-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                Devbhoomi AI
              </span>
              <p className="text-sm sm:text-base font-semibold text-emerald-100 leading-relaxed">
                {liveAiText}
              </p>
            </div>
          ) : transcriptHistory.length > 0 ? (
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-0.5 ${
                transcriptHistory[transcriptHistory.length - 1].role === 'user' ? 'text-cyan-400' : 'text-emerald-400'
              }`}>
                {transcriptHistory[transcriptHistory.length - 1].role === 'user' ? 'You' : 'Devbhoomi AI'}
              </span>
              <p className="text-xs sm:text-sm font-medium text-stone-200 leading-relaxed line-clamp-2">
                {transcriptHistory[transcriptHistory.length - 1].text}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-medium text-stone-300">
                "What is the best trek route to Chopta &amp; Tungnath?"
              </p>
              <p className="text-[11px] text-emerald-400/80 font-normal">
                Ask anything about mountain passes, weather, homestays, or pilgrim routes.
              </p>
            </div>
          )}

          {callDuration > 0 && (
            <div className="text-[10px] font-mono text-stone-500 pt-0.5">
              {formatTime(callDuration)}
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Bottom Action Controls Bar ─────────────────────────────────────── */}
      <div className="w-full max-w-sm flex items-center justify-center gap-6 px-6 py-3 z-10 shrink-0">
        
        {/* Mute Mic */}
        <button
          type="button"
          onClick={toggleMute}
          className={`flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all border cursor-pointer active:scale-95 ${
            isMuted
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
              : 'bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white border-white/10'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Center Main Action (Clean Emerald Mic / Status) */}
        <button
          type="button"
          onClick={toggleMute}
          className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] border border-emerald-400/40 transition-all active:scale-95 cursor-pointer"
          title="Microphone Active"
        >
          <Mic className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </button>

        {/* End Call Button */}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/60 border border-rose-400/30 transition-all active:scale-95 cursor-pointer"
          title="End Voice Session"
        >
          <PhoneOff className="w-5 h-5 text-white" />
        </button>

      </div>

    </div>
  );
}
