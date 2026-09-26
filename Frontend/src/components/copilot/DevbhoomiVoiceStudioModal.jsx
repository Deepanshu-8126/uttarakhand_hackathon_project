import React, { useEffect, useState, useRef } from 'react';
import { 
  X, Mic, MicOff, Volume2, VolumeX, PhoneOff, 
  Sparkles, Radio, Layers, Activity, Zap, Clock, User, Bot
} from 'lucide-react';
import { VoiceVisualizer } from './VoiceVisualizer';
import { audioProcessor } from '../../services/audioProcessor';
import { liveClient } from '../../services/geminiLiveClient';

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

            if ('speechSynthesis' in window && !isSpeakerMuted) {
              window.speechSynthesis.cancel();
              const utt = new SpeechSynthesisUtterance(cleanReply);
              utt.lang = 'hi-IN';
              utt.rate = 1.0;
              utt.onend = () => setStatus('listening');
              utt.onerror = () => setStatus('listening');
              window.speechSynthesis.speak(utt);
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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-2xl animate-fade-in select-none overflow-y-auto">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/15 rounded-full blur-[130px] pointer-events-none animate-pulse" />

      {/* Main Studio Card Container */}
      <div className="relative flex flex-col w-full max-w-4xl max-h-[96dvh] my-auto p-3 sm:p-5 rounded-[2rem] bg-[#06120b]/95 border border-emerald-500/25 shadow-[0_0_80px_rgba(16,185,129,0.2)] backdrop-blur-3xl overflow-hidden text-white shrink-0">
        
        {/* ── Top Header Bar (Fixed at Top) ─────────────────────────── */}
        <div className="flex items-center justify-between w-full pb-2.5 sm:pb-3 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 pr-2">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 text-white shadow-lg shrink-0">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-base font-extrabold text-white tracking-tight truncate">
                  Devbhoomi Voice Studio
                </h2>
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="whitespace-nowrap">Live WS</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5 truncate">
                <span className="flex items-center gap-1 font-mono text-stone-300 shrink-0">
                  <Clock className="w-3 h-3 text-stone-400" />
                  {formatTime(callDuration)}
                </span>
                <span>•</span>
                <span className="capitalize font-semibold text-stone-200 truncate">
                  {status === 'speaking' ? '✨ Speaking...' :
                   status === 'listening' ? (isMuted ? '🔇 Muted' : (micVolume > 5 ? '🎙️ Hearing speech' : '👂 Listening...')) :
                   status === 'processing' ? '⚡ Connecting...' :
                   status === 'error' ? '⚠️ Error' : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="bg-[#0b1f14] text-stone-200 text-[11px] sm:text-xs font-semibold px-2 sm:px-3 py-1.5 rounded-xl border border-emerald-500/30 hover:border-emerald-400 focus:outline-none cursor-pointer transition-all shrink-0 max-w-[140px] sm:max-w-none truncate"
            >
              {voices.map(v => (
                <option key={v.id} value={v.id} className="bg-[#040e09] text-stone-200">
                  {v.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setVisualMode(visualMode === 'orb' ? 'wave' : 'orb')}
              title={`Switch to ${visualMode === 'orb' ? 'Spectrum Wave' : '3D Fluid Orb'}`}
              className="p-1.5 sm:p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white transition-colors border border-white/10 shrink-0 cursor-pointer"
            >
              {visualMode === 'orb' ? <Activity className="w-4 h-4 text-emerald-400" /> : <Layers className="w-4 h-4 text-teal-400" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-stone-400 hover:text-white transition-colors border border-white/10 shrink-0 cursor-pointer"
              aria-label="Close studio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body Area (Anti-Overflow & Anti-Squish) ─────── */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 my-2 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
          
          {/* VU Meters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 w-full px-3 sm:px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shrink-0">
            <div className="flex flex-wrap items-center gap-3 sm:gap-5">
              {/* Mic Input Meter */}
              <div className="flex items-center gap-1.5 text-xs">
                <Mic className={`w-3.5 h-3.5 ${micVolume > 5 ? 'text-emerald-400 animate-bounce' : 'text-stone-500'} shrink-0`} />
                <span className="text-stone-400 font-mono text-[10px] whitespace-nowrap">Mic:</span>
                <div className="w-16 sm:w-24 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-75 rounded-full"
                    style={{ width: `${micVolume}%` }}
                  />
                </div>
                <span className={`font-mono text-[10px] w-6 ${micVolume > 5 ? 'text-emerald-400 font-bold' : 'text-stone-500'}`}>
                  {micVolume}%
                </span>
              </div>

              <span className="hidden sm:inline text-stone-700">|</span>

              {/* AI Speaker Meter */}
              <div className="flex items-center gap-1.5 text-xs">
                <Volume2 className={`w-3.5 h-3.5 ${speakerVolume > 5 ? 'text-teal-400 animate-pulse' : 'text-stone-500'} shrink-0`} />
                <span className="text-stone-400 font-mono text-[10px] whitespace-nowrap">AI:</span>
                <div className="w-16 sm:w-24 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-75 rounded-full"
                    style={{ width: `${speakerVolume}%` }}
                  />
                </div>
                <span className={`font-mono text-[10px] w-6 ${speakerVolume > 5 ? 'text-teal-400 font-bold' : 'text-stone-500'}`}>
                  {speakerVolume}%
                </span>
              </div>
            </div>

            {/* Test Audio Button */}
            <button
              type="button"
              onClick={() => {
                const ctx = audioProcessor.initPlaybackContext();
                ctx.resume();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(520, ctx.currentTime);
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
              }}
              className="text-[10px] sm:text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              🔊 Test Speaker
            </button>
          </div>

          {/* Main Grid: Orb Visualizer + Live Captions Dialogue */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full items-center min-h-0">
            
            {/* Left: Responsive Visualizer Orb */}
            <div className="lg:col-span-6 flex items-center justify-center py-2 sm:py-4">
              <div className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center shrink-0">
                <VoiceVisualizer
                  analyser={analyser}
                  outputAnalyser={outputAnalyser}
                  isActive={status !== 'idle' && status !== 'error'}
                  status={status}
                  mode={visualMode}
                />
              </div>
            </div>

            {/* Right: Captions & Live Dialogue Box */}
            <div className="lg:col-span-6 flex flex-col h-full min-h-[160px] max-h-[220px] sm:max-h-[280px] lg:max-h-[340px] rounded-2xl bg-[#040e09]/90 border border-white/[0.08] backdrop-blur-xl p-3 shadow-xl overflow-hidden">
              
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">Live Captions</span>
                </div>
                <span className="text-[9px] text-emerald-400/80 font-mono">Real-time Stream</span>
              </div>

              {/* Dialogue Transcript Items */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin scrollbar-thumb-white/10">
                {transcriptHistory.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col p-2.5 rounded-xl transition-all ${
                      item.role === 'user' 
                        ? 'bg-emerald-950/30 border border-emerald-500/25 ml-3 text-emerald-100' 
                        : 'bg-white/[0.03] border border-white/[0.08] mr-3 text-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${item.role === 'user' ? 'text-emerald-300' : 'text-teal-300'}`}>
                        {item.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                        {item.role === 'user' ? 'You' : 'Devbhoomi AI'}
                      </span>
                      <span className="text-[9px] text-stone-500 font-mono">{item.time}</span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}

                {/* User Live Speech Delta */}
                {liveUserText && (
                  <div className="flex flex-col p-2.5 rounded-xl bg-emerald-900/30 border border-emerald-400/40 ml-3 animate-pulse">
                    <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1 mb-0.5">
                      <User className="w-3 h-3" /> You (Speaking...)
                    </span>
                    <p className="text-xs text-emerald-100 font-medium">
                      {liveUserText}
                    </p>
                  </div>
                )}

                {/* AI Live Speech Delta */}
                {liveAiText && (
                  <div className="flex flex-col p-2.5 rounded-xl bg-teal-950/40 border border-teal-500/40 mr-3 animate-pulse">
                    <span className="text-[10px] font-bold text-teal-300 flex items-center gap-1 mb-0.5">
                      <Bot className="w-3 h-3" /> Devbhoomi AI (Speaking...)
                    </span>
                    <p className="text-xs text-teal-100 font-medium">
                      {liveAiText}
                    </p>
                  </div>
                )}

                {/* Empty State Prompt */}
                {transcriptHistory.length === 0 && !liveUserText && !liveAiText && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-6 px-3 text-stone-400">
                    <Sparkles className="w-6 h-6 text-emerald-400/60 mb-1.5 animate-bounce" />
                    <p className="text-xs font-medium text-stone-200">Speak into your microphone</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">Ask about mountain routes, treks, weather, or homestays.</p>
                  </div>
                )}

                <div ref={captionsEndRef} />
              </div>

              {errorMessage && (
                <div className="mt-1.5 p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5 shrink-0">
                  <span>⚠️ {errorMessage}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Call Action Controls Bar (Fixed at Bottom) ─────── */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 w-full pt-2.5 pb-1 border-t border-white/[0.08] shrink-0 mt-auto">
          
          {/* Mute Mic Button */}
          <button
            type="button"
            onClick={toggleMute}
            className={`flex flex-col items-center justify-center gap-0.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all shadow-md cursor-pointer select-none shrink-0 ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-white/[0.05] hover:bg-white/[0.1] text-stone-200 border border-white/10'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />}
            <span className="text-[10px] font-semibold whitespace-nowrap">{isMuted ? 'Unmute' : 'Mute Mic'}</span>
          </button>

          {/* End Call Main Action Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-2xl shadow-rose-950/80 transition-all hover:scale-105 active:scale-95 border border-rose-400/30 cursor-pointer shrink-0"
            title="End Voice Session"
          >
            <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Speaker Mute Button */}
          <button
            type="button"
            onClick={toggleSpeaker}
            className={`flex flex-col items-center justify-center gap-0.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all shadow-md cursor-pointer select-none shrink-0 ${
              isSpeakerMuted
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-white/[0.05] hover:bg-white/[0.1] text-stone-200 border border-white/10'
            }`}
            title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
          >
            {isSpeakerMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />}
            <span className="text-[10px] font-semibold whitespace-nowrap">{isSpeakerMuted ? 'Muted' : 'Speaker'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
