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
    setStatus('processing');
    setLiveAiText('');
    setLiveUserText('');
    currentAiTextRef.current = '';
    currentUserTextRef.current = '';

    try {
      const audioCtx = audioProcessor.initContext();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const micAnalyser = await audioProcessor.startMicCapture((base64Pcm) => {
        if (!isMutedRef.current && liveClient.active()) {
          liveClient.sendAudioChunk(base64Pcm);
        }
      });
      setAnalyser(micAnalyser);
      setOutputAnalyser(audioProcessor.getOutputAnalyser());

      liveClient.connect(
        {
          voice: selectedVoice,
          model: 'models/gemini-3.1-flash-live-preview',
          systemPrompt: 'You are Devbhoomi AI, an intelligent, low-latency, warm Himalayan mountain guide for Uttarakhand. Keep spoken replies natural, authentic, and concise in Hindi, English, or friendly Hinglish.'
        },
        {
          onConnected: () => {
            setStatus('listening');
          },
          onAudioData: (base64Audio) => {
            setStatus('speaking');
            audioProcessor.playPcmChunk(base64Audio);
          },
          onTextData: (text) => {
            currentAiTextRef.current += text;
            setLiveAiText(currentAiTextRef.current);
          },
          onUserTextData: (text) => {
            currentUserTextRef.current += text;
            setLiveUserText(currentUserTextRef.current);
          },
          onTurnComplete: () => {
            const finalAi = currentAiTextRef.current.trim();
            const finalUser = currentUserTextRef.current.trim();

            if (finalUser) {
              setTranscriptHistory(prev => [...prev, { role: 'user', text: finalUser, time: getCurrentTimestamp() }]);
            }
            if (finalAi) {
              setTranscriptHistory(prev => [...prev, { role: 'assistant', text: finalAi, time: getCurrentTimestamp() }]);
            }

            if (onTranscriptReceived && (finalUser || finalAi)) {
              onTranscriptReceived(finalUser, finalAi);
            }

            currentAiTextRef.current = '';
            currentUserTextRef.current = '';
            setLiveAiText('');
            setLiveUserText('');
            setStatus('listening');
          },
          onInterrupted: () => {
            audioProcessor.resetPlayback();
            currentAiTextRef.current = '';
            currentUserTextRef.current = '';
            setLiveAiText('');
            setLiveUserText('');
            setStatus('listening');
          },
          onFallbackReady: () => {
            console.log('[DevbhoomiVoiceStudio] Initializing Web Speech & Universal Live Voice Engine');
            setStatus('listening');
            startUniversalSpeechFallback();
          },
          onError: (err) => {
            console.log('[DevbhoomiVoiceStudio] WebSocket notice:', err);
            setStatus('listening');
            startUniversalSpeechFallback();
          },
          onDisconnected: () => {
            setStatus('idle');
          }
        }
      );

    } catch (err) {
      console.error('[DevbhoomiVoiceStudio] Starting Universal Voice Assistant:', err);
      setStatus('listening');
      startUniversalSpeechFallback();
    }
  };

  const webSpeechRecRef = useRef(null);

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

      rec.onresult = async (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
          else interim += event.results[i][0].transcript;
        }

        const currentText = (final || interim).trim();
        setLiveUserText(currentText);

        if (final && final.trim().length > 2) {
          const userSaid = final.trim();
          setTranscriptHistory(prev => [...prev, { role: 'user', text: userSaid, time: getCurrentTimestamp() }]);
          setStatus('processing');
          setLiveAiText('Thinking...');

          try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://uttarakhand-hackathon-project.onrender.com/api';
            const res = await fetch(`${apiBase}/agent/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: userSaid })
            });

            const data = await res.json();
            const reply = data.response?.message || data.message || data.response || 'Namaste! Main aapka Devbhoomi travel assistant hoon.';
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
                onEnd: () => setStatus('listening'),
                onError: () => setStatus('listening')
              });
            } else {
              setTimeout(() => setStatus('listening'), 2000);
            }
          } catch (apiErr) {
            console.warn('[UniversalVoice] API error, using local reply:', apiErr);
            setStatus('listening');
          }
        }
      };

      rec.onerror = () => {
        setStatus('listening');
      };

      rec.onend = () => {
        if (isOpen && status !== 'speaking' && status !== 'processing') {
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
    <div className="fixed inset-0 z-[10000] flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 bg-[#030906] backdrop-blur-3xl text-white select-none overflow-hidden animate-in fade-in duration-300">
      
      {/* Background Ambient Radial Glowing Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ── 1. Top Bar: Brand, Status Pill & Settings ────────────────────────────────── */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10 shrink-0">
        
        {/* Brand Pill */}
        <div className="flex items-center gap-2.5 bg-white/[0.05] border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-xl shadow-md">
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <span className="text-xs font-black tracking-wider text-white uppercase">Devbhoomi Voice AI</span>
        </div>

        {/* Dynamic Center Status Pill (Matches Reference Image Screen 2) */}
        <div className={`hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-2xl text-xs font-extrabold tracking-wide transition-all shadow-xl ${
          status === 'speaking' 
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.35)] animate-pulse' 
            : status === 'listening' 
              ? (micVolume > 5 ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.4)]' : 'bg-teal-500/20 text-teal-300 border border-teal-400/40 shadow-[0_0_20px_rgba(20,184,166,0.3)]')
              : status === 'processing'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.35)] animate-pulse'
                : 'bg-white/[0.06] text-stone-300 border border-white/10'
        }`}>
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              status === 'speaking' ? 'bg-emerald-400' : status === 'listening' ? 'bg-cyan-400' : 'bg-amber-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              status === 'speaking' ? 'bg-emerald-500' : status === 'listening' ? 'bg-cyan-500' : 'bg-amber-500'
            }`}></span>
          </span>
          <span>
            {status === 'speaking' ? 'Devbhoomi AI is Speaking 🔊' :
             status === 'listening' ? (isMuted ? 'Microphone Muted 🔇' : (micVolume > 5 ? 'Hearing your voice 🎙️' : "Go ahead, I'm listening 🎙️")) :
             status === 'processing' ? 'Connecting Telemetry... ⚡' :
             status === 'error' ? '⚠️ Network Notice' : 'Ready'}
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Voice Selector Pill */}
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="bg-white/[0.06] hover:bg-white/[0.12] text-stone-200 text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 hover:border-emerald-400/50 focus:outline-none cursor-pointer transition-all shrink-0 max-w-[130px] sm:max-w-none truncate backdrop-blur-md"
          >
            {voices.map(v => (
              <option key={v.id} value={v.id} className="bg-[#06120b] text-stone-200 font-semibold">
                {v.name.split(' ')[0]} Voice
              </option>
            ))}
          </select>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-stone-300 hover:text-white transition-colors border border-white/10 cursor-pointer shadow-md active:scale-95"
            aria-label="Close studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── 2. Center Stage: Glowing 3D Fluid Orb Visualizer & Real-time Subtitles ─────── */}
      <div className="w-full max-w-2xl flex flex-col items-center justify-center my-auto z-10 space-y-6 sm:space-y-8">
        
        {/* Mobile Status Pill (Visible on small screens) */}
        <div className="sm:hidden flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-2xl text-xs font-extrabold tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {status === 'speaking' ? 'Devbhoomi AI Speaking 🔊' :
             status === 'listening' ? "I'm listening 🎙️" : 'Processing ⚡'}
          </span>
        </div>

        {/* Glowing Orb Stage Container */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[380px] md:h-[380px] flex items-center justify-center shrink-0">
          
          {/* Concentric Pulsing Aura Rings */}
          <div className={`absolute inset-0 rounded-full border transition-all duration-700 ${
            status === 'speaking'
              ? 'border-emerald-400/30 scale-105 animate-ping'
              : status === 'listening' && micVolume > 5
                ? 'border-cyan-400/30 scale-105 animate-ping'
                : 'border-white/5 scale-100'
          }`} />

          <VoiceVisualizer
            analyser={analyser}
            outputAnalyser={outputAnalyser}
            isActive={status !== 'idle' && status !== 'error'}
            status={status}
            mode={visualMode}
          />
        </div>

        {/* Live Subtitle Transcript Banner (Centered Typography as in Reference Photo) */}
        <div className="w-full px-4 sm:px-6 py-4 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center space-y-2 min-h-[100px] justify-center">
          
          {liveUserText ? (
            <div className="animate-in fade-in duration-200">
              <span className="text-[10px] font-black tracking-widest uppercase text-cyan-400 block mb-1">
                You are saying:
              </span>
              <p className="text-base sm:text-xl md:text-2xl font-black text-white leading-relaxed tracking-tight">
                "{liveUserText}"
              </p>
            </div>
          ) : liveAiText ? (
            <div className="animate-in fade-in duration-200">
              <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400 block mb-1">
                Devbhoomi AI:
              </span>
              <p className="text-base sm:text-xl md:text-2xl font-black text-emerald-100 leading-relaxed tracking-tight">
                {liveAiText}
              </p>
            </div>
          ) : transcriptHistory.length > 0 ? (
            <div>
              <span className={`text-[10px] font-black tracking-widest uppercase block mb-1 ${
                transcriptHistory[transcriptHistory.length - 1].role === 'user' ? 'text-cyan-400' : 'text-emerald-400'
              }`}>
                {transcriptHistory[transcriptHistory.length - 1].role === 'user' ? 'You said:' : 'Devbhoomi AI:'}
              </span>
              <p className="text-sm sm:text-lg font-bold text-stone-200 leading-relaxed line-clamp-2">
                {transcriptHistory[transcriptHistory.length - 1].text}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm sm:text-lg font-bold text-stone-300 tracking-tight">
                "What are some quick, effective mountain itineraries in Uttarakhand?"
              </p>
              <p className="text-xs text-emerald-400 font-medium">
                Try asking about Kedarnath yatra, Auli skiing weather, or Rishikesh stay options.
              </p>
            </div>
          )}

          {callDuration > 0 && (
            <div className="text-[10px] font-mono text-stone-400 pt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400 inline" />
              <span>Session Duration: {formatTime(callDuration)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Bottom Action Controls Area (Elevated Center Mic Button like Reference) ── */}
      <div className="w-full max-w-md flex items-center justify-between px-6 py-4 z-10 shrink-0">
        
        {/* Left Control: Mute / Pause Button */}
        <button
          type="button"
          onClick={toggleMute}
          className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all shadow-xl border cursor-pointer active:scale-95 ${
            isMuted
              ? 'bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-rose-950/60'
              : 'bg-white/[0.08] hover:bg-white/[0.16] text-stone-200 border-white/15'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5 text-emerald-400" />}
        </button>

        {/* Center Control: ELEVATED GLOWING MIC BUTTON (Matches Vox AI Gradient Sphere) */}
        <button
          type="button"
          onClick={toggleMute}
          className="relative group flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-cyan-400 text-white shadow-[0_0_55px_rgba(217,70,239,0.7)] hover:shadow-[0_0_75px_rgba(217,70,239,0.9)] border-4 border-white/40 transition-all transform active:scale-95 cursor-pointer"
          title="Voice Command Active"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-40"></span>
          <Mic className="w-7 h-7 sm:w-9 sm:h-9 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
        </button>

        {/* Right Control: End Session / Close */}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 shadow-xl transition-all active:scale-95 cursor-pointer"
          title="End Voice Session"
        >
          <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6 text-rose-300" />
        </button>

      </div>

    </div>
  );
}
