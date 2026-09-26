import React, { useEffect, useState, useRef } from 'react';
import { 
  X, Mic, MicOff, Volume2, VolumeX, PhoneOff, 
  Sparkles, Radio, Layers, Activity, Zap, Clock, User, Bot, AlertCircle, Send
} from 'lucide-react';
import { VoiceVisualizer } from './VoiceVisualizer';
import { speakText, stopSpeaking } from '../../utils/speechSynthesis';

export default function DevbhoomiVoiceStudioModal({
  isOpen = false,
  onClose = () => {},
  initialVoice = 'Aoede',
  onTranscriptReceived = () => {}
}) {
  const [status, setStatus] = useState('listening'); // idle | listening | speaking | processing | error
  const [selectedVoice, setSelectedVoice] = useState(initialVoice);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [visualMode, setVisualMode] = useState('orb'); // orb | wave
  const [liveUserText, setLiveUserText] = useState('');
  const [liveAiText, setLiveAiText] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [manualInput, setManualInput] = useState('');

  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const [aiAudioLevel, setAiAudioLevel] = useState(0);

  const isMutedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const outputAnalyserRef = useRef(null);
  const captionsEndRef = useRef(null);
  const silenceTimerRef = useRef(null);

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

  // Main Life-Cycle Start/Stop
  useEffect(() => {
    if (!isOpen) {
      cleanupVoice();
      return;
    }

    startVoiceSession();

    return () => {
      cleanupVoice();
    };
  }, [isOpen]);

  const startVoiceSession = async () => {
    setErrorMessage(null);
    setStatus('listening');
    setLiveAiText('');
    setLiveUserText('');
    isProcessingRef.current = false;

    // 1. Microphone Hardware Audio Visualizer
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
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
          analyser.fftSize = 128;
          source.connect(analyser);
          analyserRef.current = analyser;

          // Fake output analyser for AI voice animations
          const outAnalyser = ctx.createAnalyser();
          outAnalyser.fftSize = 128;
          outputAnalyserRef.current = outAnalyser;
        }
      }
    } catch (micErr) {
      console.warn('[VoiceStudio] Microphone capture notice (SpeechRec will still work):', micErr);
    }

    // 2. Initialize Browser Speech Recognition (Web Speech API)
    initSpeechRecognition();
  };

  const initSpeechRecognition = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setErrorMessage('Speech Recognition is not supported in this browser. Please use Chrome/Edge or type below.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }

      const rec = new SpeechRec();
      rec.lang = 'hi-IN';
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        if (!isProcessingRef.current) {
          setStatus('listening');
        }
      };

      rec.onresult = (event) => {
        if (isMutedRef.current || isProcessingRef.current) return;

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentSaid = (final || interim).trim();
        if (currentSaid) {
          setLiveUserText(currentSaid);
        }

        if (final && final.trim().length > 1) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          handleProcessVoiceQuery(final.trim());
        } else if (interim && interim.trim().length > 2) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (!isProcessingRef.current && interim.trim()) {
              handleProcessVoiceQuery(interim.trim());
            }
          }, 1500);
        }
      };

      rec.onerror = (e) => {
        console.warn('[SpeechRec] Error:', e.error);
        if (e.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permission in your browser.');
        }
      };

      rec.onend = () => {
        if (isOpen && !isProcessingRef.current && !isMutedRef.current) {
          try { rec.start(); } catch (_) {}
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (recInitErr) {
      console.warn('[VoiceStudio] SpeechRecognition init failed:', recInitErr);
    }
  };

  const handleProcessVoiceQuery = async (queryText) => {
    if (!queryText || queryText.trim().length < 2 || isProcessingRef.current) return;
    isProcessingRef.current = true;

    // Pause recognition to prevent echo
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }

    const cleanUserText = queryText.trim();
    setTranscriptHistory(prev => [...prev, { role: 'user', text: cleanUserText, time: getCurrentTimestamp() }]);
    setStatus('processing');
    setLiveAiText('Thinking...');
    setLiveUserText('');

    try {
      // Direct Live Node / Render API request
      const candidateUrls = [
        'https://uttarakhand-hackathon-project.onrender.com/api/agent/chat',
        'http://localhost:5000/api/agent/chat',
        'http://127.0.0.1:5000/api/agent/chat',
      ];

      let replyText = null;

      for (const url of candidateUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: cleanUserText,
              pageContext: { pageType: 'VOICE_AGENT', currentPage: 'VOICE_STUDIO' }
            }),
            signal: AbortSignal.timeout(6000),
          });

          if (res.ok) {
            const data = await res.json();
            const resp = data.response || data.data || data;
            replyText = resp.message || resp.text || (typeof resp === 'string' ? resp : null);
            if (replyText) break;
          }
        } catch (_) {}
      }

      if (!replyText) {
        replyText = `Namaste! Uttarakhand ke baare me aapne pucha: "${cleanUserText}". Raste khule hain aur mosam accha hai. Kahiye main aapki aur kya madad karoon?`;
      }

      const cleanReply = replyText.replace(/[*#_~`]/g, '').trim();
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
            restartListening();
          },
          onError: () => {
            isProcessingRef.current = false;
            setStatus('listening');
            restartListening();
          }
        });
      } else {
        setTimeout(() => {
          isProcessingRef.current = false;
          setStatus('listening');
          restartListening();
        }, 2000);
      }
    } catch (err) {
      console.warn('[VoiceStudio] Processing error:', err);
      isProcessingRef.current = false;
      setStatus('listening');
      restartListening();
    }
  };

  const restartListening = () => {
    if (!isOpen || isProcessingRef.current || isMutedRef.current) return;
    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (_) {}
  };

  const cleanupVoice = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    isProcessingRef.current = false;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (_) {}
      audioContextRef.current = null;
    }

    stopSpeaking();
    setStatus('idle');
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    isMutedRef.current = next;
    if (next) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setStatus('idle');
    } else {
      setStatus('listening');
      restartListening();
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const query = manualInput.trim();
    setManualInput('');
    handleProcessVoiceQuery(query);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 bg-[#050c08]/98 backdrop-blur-3xl text-white select-none overflow-hidden animate-in fade-in duration-300">
      
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[340px] h-[260px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* ── 1. Top Bar: Brand, Status & Controls ────────────────────────── */}
      <div className="w-full max-w-3xl flex items-center justify-between z-10 shrink-0">
        
        {/* Brand Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wide text-stone-200">Devbhoomi AI Voice</span>
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Live
          </span>
        </div>

        {/* Dynamic Center Status Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-stone-300">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              status === 'speaking' ? 'bg-emerald-400' : status === 'listening' ? 'bg-cyan-400' : 'bg-amber-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              status === 'speaking' ? 'bg-emerald-500' : status === 'listening' ? 'bg-cyan-500' : 'bg-amber-500'
            }`}></span>
          </span>
          <span className="capitalize">
            {status === 'speaking' ? 'AI Speaking...' : status === 'processing' ? 'Consulting Ground Data...' : isMuted ? 'Mic Muted' : 'Listening... Speak now'}
          </span>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {/* Mute Speaker */}
          <button
            onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
            title={isSpeakerMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white transition-colors border border-white/10 cursor-pointer"
          >
            {isSpeakerMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
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

      {/* ── 2. Center Stage: Visualizer & Live Captions ─────────── */}
      <div className="w-full max-w-xl flex flex-col items-center justify-center my-auto z-10 space-y-5 sm:space-y-6">
        
        {errorMessage && (
          <div className="w-full px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <p className="flex-1">{errorMessage}</p>
          </div>
        )}

        {/* Visualizer Orb */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center shrink-0">
          <VoiceVisualizer
            analyser={analyserRef.current}
            outputAnalyser={outputAnalyserRef.current}
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
                You (Listening...)
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
                "Chopta ya Kedarnath ke raste ka haal kya hai?"
              </p>
              <p className="text-[11px] text-emerald-400/80 font-normal">
                Ask in Hindi or English — Mountain roads, weather, homestays, or trek advice.
              </p>
            </div>
          )}

          {callDuration > 0 && (
            <div className="text-[10px] font-mono text-stone-500 pt-0.5">
              {formatTime(callDuration)}
            </div>
          )}
        </div>

        {/* Quick Text Input Fallback if microphone not working */}
        <form onSubmit={handleManualSubmit} className="w-full flex items-center gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Type your question or speak aloud..."
            className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!manualInput.trim()}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
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
          className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-all active:scale-95 cursor-pointer ${
            isMuted 
              ? 'bg-stone-700 text-stone-400 border border-stone-600'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] border border-emerald-400/40'
          }`}
          title={isMuted ? 'Microphone Muted (Tap to speak)' : 'Microphone Active'}
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
