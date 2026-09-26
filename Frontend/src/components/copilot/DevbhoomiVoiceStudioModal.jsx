import React, { useEffect, useState, useRef } from 'react';
import { 
  X, Mic, MicOff, Volume2, VolumeX, PhoneOff, 
  Sparkles, Radio, Layers, Activity, Zap, Clock, User, Bot, Volume1
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
          onError: (err) => {
            setErrorMessage(err);
            setStatus('error');
          },
          onDisconnected: () => {
            setStatus('idle');
          }
        }
      );

    } catch (err) {
      console.error('[DevbhoomiVoiceStudio] Failed to start voice session:', err);
      setErrorMessage(err?.message || 'Microphone access denied or audio device not ready');
      setStatus('error');
    }
  };

  const stopVoiceSession = () => {
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-fade-in select-none">
      
      {/* ── Background Ambient Himalayan Glows ── */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/15 rounded-full blur-[130px] pointer-events-none animate-pulse" />

      {/* ── Main Glass Studio Card ── */}
      <div className="relative flex flex-col items-center justify-between w-full max-w-5xl h-[92vh] max-h-[900px] p-4 sm:p-6 rounded-[2.5rem] bg-[#06120b]/90 border border-emerald-500/20 shadow-[0_0_80px_rgba(16,185,129,0.15)] backdrop-blur-3xl overflow-hidden text-white">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between w-full pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3.5 min-w-0 pr-2">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 text-white shadow-lg shadow-emerald-950/60 shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  Devbhoomi Live Voice Studio
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  Live WS
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-stone-400 mt-0.5 truncate">
                <span className="flex items-center gap-1 font-mono text-stone-300 shrink-0">
                  <Clock className="w-3 h-3 text-stone-400" />
                  {formatTime(callDuration)}
                </span>
                <span>•</span>
                <span className="capitalize font-semibold text-stone-200 truncate">
                  {status === 'speaking' ? '✨ Devbhoomi AI is Speaking...' :
                   status === 'listening' ? (isMuted ? '🔇 Microphone Muted' : (micVolume > 5 ? '🎙️ Hearing your Voice!' : '👂 Listening for speech...')) :
                   status === 'processing' ? '⚡ Connecting Voice WebSocket...' :
                   status === 'error' ? '⚠️ Audio Error' : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Voice Preset Selector */}
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="bg-[#0b1f14] text-stone-200 text-xs font-semibold px-3 py-2 rounded-xl border border-emerald-500/30 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer shadow-sm transition-all"
            >
              {voices.map(v => (
                <option key={v.id} value={v.id} className="bg-[#040e09] text-stone-200">
                  {v.name}
                </option>
              ))}
            </select>

            {/* Visualizer Mode Switch */}
            <button
              onClick={() => setVisualMode(visualMode === 'orb' ? 'wave' : 'orb')}
              title={`Switch to ${visualMode === 'orb' ? 'Spectrum Wave' : '3D Fluid Orb'} visualizer`}
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-300 hover:text-white transition-colors border border-white/10 shadow-sm cursor-pointer"
            >
              {visualMode === 'orb' ? <Activity className="w-4 h-4 text-emerald-400" /> : <Layers className="w-4 h-4 text-teal-400" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-400 hover:text-white transition-colors border border-white/10 shadow-sm cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Mic & Speaker VU Meters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 w-full mt-3 px-4 sm:px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* User Mic Live Meter */}
            <div className="flex items-center gap-2 text-xs">
              <Mic className={`w-3.5 h-3.5 ${micVolume > 5 ? 'text-emerald-400 animate-bounce' : 'text-stone-500'}`} />
              <span className="text-stone-400 font-mono text-[11px]">Mic Input:</span>
              <div className="w-20 sm:w-28 h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-75 rounded-full"
                  style={{ width: `${micVolume}%` }}
                />
              </div>
              <span className={`font-mono text-[10px] w-7 ${micVolume > 5 ? 'text-emerald-400 font-bold' : 'text-stone-500'}`}>
                {micVolume}%
              </span>
            </div>

            <span className="hidden sm:inline text-stone-700">|</span>

            {/* AI Speaker Live Meter */}
            <div className="flex items-center gap-2 text-xs">
              <Volume2 className={`w-3.5 h-3.5 ${speakerVolume > 5 ? 'text-teal-400 animate-pulse' : 'text-stone-500'}`} />
              <span className="text-stone-400 font-mono text-[11px]">AI Speaker:</span>
              <div className="w-20 sm:w-28 h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-75 rounded-full"
                  style={{ width: `${speakerVolume}%` }}
                />
              </div>
              <span className={`font-mono text-[10px] w-7 ${speakerVolume > 5 ? 'text-teal-400 font-bold' : 'text-stone-500'}`}>
                {speakerVolume}%
              </span>
            </div>
          </div>

          {/* Test Audio Output */}
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
            className="text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-500/30 transition-all shadow-sm cursor-pointer"
          >
            🔊 Test Speaker
          </button>
        </div>

        {/* Center Studio View: 3D Orb Visualizer + Live Captions Dialogue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full flex-1 min-h-0 my-3 items-center">
          
          {/* Left: 3D Organic Visualizer */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center h-full">
            <div className="relative w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center">
              <VoiceVisualizer
                analyser={analyser}
                outputAnalyser={outputAnalyser}
                isActive={status !== 'idle' && status !== 'error'}
                status={status}
                mode={visualMode}
              />
            </div>
          </div>

          {/* Right: Live Interactive Subtitle & Captions Container */}
          <div className="lg:col-span-6 flex flex-col h-full max-h-[340px] sm:max-h-[380px] md:max-h-[420px] rounded-3xl bg-[#040e09]/80 border border-white/[0.08] backdrop-blur-xl p-4 shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">Live Captions & Dialogue</span>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono">Real-time Stream</span>
            </div>

            {/* Scrollable Transcript Dialogue Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
              {transcriptHistory.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col p-3 rounded-2xl transition-all ${
                    item.role === 'user' 
                      ? 'bg-emerald-950/30 border border-emerald-500/25 ml-4 text-emerald-100' 
                      : 'bg-white/[0.03] border border-white/[0.08] mr-4 text-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-bold flex items-center gap-1.5 ${item.role === 'user' ? 'text-emerald-300' : 'text-teal-300'}`}>
                      {item.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                      {item.role === 'user' ? 'You' : 'Devbhoomi AI'}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">{item.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}

              {/* Live Streaming User Speech Delta */}
              {liveUserText && (
                <div className="flex flex-col p-3 rounded-2xl bg-emerald-900/30 border border-emerald-400/40 ml-4 animate-pulse">
                  <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                    <User className="w-3 h-3" /> You (Speaking...)
                  </span>
                  <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                    {liveUserText}
                  </p>
                </div>
              )}

              {/* Live Streaming AI Speech Delta */}
              {liveAiText && (
                <div className="flex flex-col p-3 rounded-2xl bg-teal-950/40 border border-teal-500/40 mr-4 animate-pulse">
                  <span className="text-[11px] font-bold text-teal-300 flex items-center gap-1.5 mb-1">
                    <Bot className="w-3 h-3" /> Devbhoomi AI (Speaking...)
                  </span>
                  <p className="text-xs sm:text-sm text-teal-100 font-medium">
                    {liveAiText}
                  </p>
                </div>
              )}

              {/* Empty State Prompt */}
              {transcriptHistory.length === 0 && !liveUserText && !liveAiText && (
                <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4 text-stone-400">
                  <Sparkles className="w-7 h-7 text-emerald-400/60 mb-2 animate-bounce" />
                  <p className="text-xs sm:text-sm font-medium text-stone-200">Start talking into your microphone</p>
                  <p className="text-[11px] text-stone-400 mt-1">Ask about mountain routes, Char Dham, high-altitude treks, weather, or Pahadi homestays.</p>
                </div>
              )}

              <div ref={captionsEndRef} />
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="mt-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span>⚠️ {errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Call Controls Bar */}
        <div className="flex items-center justify-center gap-6 w-full pt-3 border-t border-white/[0.08]">
          {/* Mute Mic Button */}
          <button
            type="button"
            onClick={toggleMute}
            className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl transition-all duration-200 shadow-xl cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-stone-200 border border-white/10 hover:border-white/20'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5 text-emerald-400" />}
            <span className="text-[10px] font-semibold">{isMuted ? 'Unmute' : 'Mute Mic'}</span>
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-2xl shadow-rose-950/80 transition-all hover:scale-105 active:scale-95 border border-rose-400/30 cursor-pointer"
            title="End Voice Session"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Speaker Mute Button */}
          <button
            type="button"
            onClick={toggleSpeaker}
            className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl transition-all duration-200 shadow-xl cursor-pointer ${
              isSpeakerMuted
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-stone-200 border border-white/10 hover:border-white/20'
            }`}
            title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
          >
            {isSpeakerMuted ? <VolumeX className="w-5 h-5 text-amber-400" /> : <Volume2 className="w-5 h-5 text-teal-400" />}
            <span className="text-[10px] font-semibold">{isSpeakerMuted ? 'Unmuted' : 'Speaker'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
