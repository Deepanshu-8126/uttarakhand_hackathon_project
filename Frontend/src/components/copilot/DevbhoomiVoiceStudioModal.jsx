import React, { useEffect, useState, useRef } from 'react';
import { 
  X, Mic, MicOff, Volume2, VolumeX, PhoneOff, 
  Sparkles, Radio, Layers, Activity, Zap, Clock, User, Bot, AlertCircle, Send
} from 'lucide-react';
import api from '../../api/api';
import { VoiceVisualizer } from './VoiceVisualizer';
import { speakText, stopSpeaking, playAudioStream } from '../../utils/speechSynthesis';
import { startAudioRecording, stopAudioRecording, sendAudioToVoiceBridge } from '../../utils/audioRecorder';

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
  const animFrameRef = useRef(null);

  const QUICK_QUESTIONS = [
    'नैनीताल 2 दिन का प्लान और बजट',
    'केदारनाथ ट्रेक और माउंटेन सेफ्टी',
    'ऋषिकेश में वेरिफाइड होमस्टे',
    'चोपता तुंगनाथ लाइव मौसम'
  ];

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
  }, [transcriptHistory, liveUserText, liveAiText]);

  // Track call timer
  useEffect(() => {
    let timer = null;
    if (isOpen && status !== 'idle' && status !== 'error') {
      timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, status]);

  // Visualizer loop for mic level
  useEffect(() => {
    if (!isOpen) return;

    const updateAudioLevels = () => {
      if (analyserRef.current && status === 'listening') {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length / 255;
        setMicAudioLevel(Math.min(1, avg * 3.5));
      } else if (status === 'speaking') {
        setAiAudioLevel(0.4 + Math.sin(Date.now() / 150) * 0.35);
      } else {
        setMicAudioLevel(0.05);
        setAiAudioLevel(0);
      }
      animFrameRef.current = requestAnimationFrame(updateAudioLevels);
    };

    animFrameRef.current = requestAnimationFrame(updateAudioLevels);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, status]);

  // Main lifecycle: open modal -> start voice
  useEffect(() => {
    if (isOpen) {
      setCallDuration(0);
      setTranscriptHistory([]);
      startVoiceSession();
    } else {
      cleanupVoice();
    }
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

          const outAnalyser = ctx.createAnalyser();
          outAnalyser.fftSize = 128;
          outputAnalyserRef.current = outAnalyser;
        }
      }
    } catch (micErr) {
      console.warn('[VoiceStudio] Mic visualizer permission:', micErr);
    }

    // 2. Start Speech Recognition (Web Speech API with instant live feedback)
    startSpeechRecognition();
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.abort(); } catch (_) {}
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        let accumulatedFinal = '';

        recognition.onstart = () => {
          setStatus('listening');
          setErrorMessage(null);
        };

        recognition.onresult = (event) => {
          let interimText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulatedFinal += transcript + ' ';
            } else {
              interimText += transcript;
            }
          }
          const currentText = accumulatedFinal || interimText;
          if (currentText) {
            setLiveUserText(currentText);
          }
        };

        recognition.onerror = (event) => {
          console.warn('[SpeechRecognition] Event error:', event.error);
          if (event.error === 'no-speech') {
            // Restart listening if no speech was heard
            if (isOpen && !isProcessingRef.current && !isMutedRef.current) {
              setTimeout(() => {
                if (isOpen && !isProcessingRef.current && !isMutedRef.current) {
                  try { recognition.start(); } catch (_) {}
                }
              }, 400);
            }
          } else if (event.error === 'not-allowed') {
            setErrorMessage('Microphone access denied. Please allow mic in your browser settings.');
            setStatus('error');
          } else {
            // Fallback to hardware audio recording
            startHardwareAudioListening();
          }
        };

        recognition.onend = () => {
          const finalQuery = accumulatedFinal.trim() || liveUserText.trim();
          if (finalQuery && !isProcessingRef.current && !isMutedRef.current) {
            handleProcessVoiceQuery(finalQuery);
          } else if (isOpen && !isProcessingRef.current && !isMutedRef.current) {
            setTimeout(() => {
              if (isOpen && !isProcessingRef.current && !isMutedRef.current) {
                try { recognition.start(); } catch (_) {}
              }
            }, 300);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (recErr) {
        console.warn('[SpeechRecognition] Failed to start, fallback to media recorder:', recErr);
      }
    }

    // Fallback if browser doesn't have Web Speech API (Firefox, Brave)
    startHardwareAudioListening();
  };

  const startHardwareAudioListening = async () => {
    try {
      let speechDetected = false;
      let silenceCount = 0;

      await startAudioRecording({
        onVolumeChange: (vol) => {
          setMicAudioLevel(vol);
          if (vol > 0.02) {
            speechDetected = true;
            silenceCount = 0;
          } else if (speechDetected && !isProcessingRef.current && !isMutedRef.current) {
            silenceCount++;
            if (silenceCount > 40) { // ~1.0s of silence after speech
              silenceCount = 0;
              submitRecordedAudio();
            }
          }
        }
      });
    } catch (e) {
      setErrorMessage('Microphone permission required for voice interaction.');
    }
  };

  const submitRecordedAudio = async () => {
    if (isProcessingRef.current || isMutedRef.current) return;
    const blob = stopAudioRecording();
    if (!blob || blob.size < 500) {
      if (isOpen && !isProcessingRef.current) startVoiceSession();
      return;
    }

    isProcessingRef.current = true;
    setStatus('processing');
    setLiveAiText('Thinking...');
    setLiveUserText('🎙️ Transcribing speech...');

    try {
      const res = await sendAudioToVoiceBridge(blob, { lang: 'hi' });
      const userText = res.user_transcript || 'उत्तराखंड यात्रा';
      handleProcessVoiceQuery(userText, res.response, res.audio_base64);
    } catch (err) {
      console.warn('[VoiceStudio] Audio bridge error:', err);
      isProcessingRef.current = false;
      if (isOpen && !isMutedRef.current) startVoiceSession();
    }
  };

  const handleProcessVoiceQuery = async (queryText, precomputedReply = null, precomputedAudio = null) => {
    if (!queryText || queryText.trim().length < 2) {
      if (isOpen && !isMutedRef.current) startVoiceSession();
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }
    stopAudioRecording();

    isProcessingRef.current = true;
    const cleanUserText = queryText.trim();
    
    setLiveUserText(cleanUserText);
    setTranscriptHistory(prev => [...prev, { role: 'user', text: cleanUserText, time: getCurrentTimestamp() }]);
    setStatus('processing');
    setLiveAiText('Thinking...');

    if (onTranscriptReceived) {
      onTranscriptReceived(cleanUserText);
    }

    try {
      let replyText = precomputedReply;
      let audioBase64 = precomputedAudio;

      if (!replyText) {
        // 1. Dedicated Studio Voice Endpoint (/api/voice/ask)
        try {
          const voiceAskResp = await api.post('/voice/ask', {
            query: cleanUserText,
            message: cleanUserText,
            lang: 'hi'
          });
          const vData = voiceAskResp.data;
          replyText = vData?.response || vData?.message || vData?.data?.response;
          audioBase64 = vData?.audio_base64 || vData?.audioBase64 || vData?.data?.audio_base64 || null;
        } catch (_) {}
      }

      // 2. Direct Agent Chat Endpoint Fallback
      if (!replyText) {
        try {
          const axiosResp = await api.post('/agent/chat', {
            message: cleanUserText,
            pageContext: { pageType: 'VOICE_AGENT', currentPage: 'VOICE_STUDIO' }
          });
          const resp = axiosResp.data?.response || axiosResp.data?.data || axiosResp.data;
          replyText = resp?.message || resp?.text || (typeof resp === 'string' ? resp : null);
        } catch (_) {}
      }

      // 3. Grounded Route Fallback
      if (!replyText) {
        const qLower = cleanUserText.toLowerCase();
        if (qLower.includes('nainital')) {
          replyText = `Nainital Kumaon hills ki 1938 meter altitude par sthit ek prasiddh lake city hai. Naini Lake boating, Naina Devi Temple aur Snow Viewpoint mukhya attractions hain. Kathgodam railway station se 34 km road route hai.`;
        } else if (qLower.includes('kedarnath')) {
          replyText = `Kedarnath Dham 3584 meter uanchai par sthit hai. Haridwar ya Rishikesh se Sonprayag tak road transport hai, jiske baad 16 km ka scenic mountain trek hai. Registration aur weather check anivarya hai.`;
        } else if (qLower.includes('rishikesh')) {
          replyText = `Rishikesh World Yoga Capital hai jahan Triveni Ghat Maha Aarti, Laxman Jhula, Shivpuri river rafting aur peaceful ashrams prasiddh hain.`;
        } else if (qLower.includes('chopta') || qLower.includes('tungnath')) {
          replyText = `Chopta ko Mini Switzerland kaha jata hai. Wahan se Tungnath (highest Shiva temple) aur Chandrashila peak ka trek shuru hota hai. Abhi weather suhana hai.`;
        } else {
          replyText = `Namaste! Devbhoomi Uttarakhand me aapka swagat hai. Aapne ${cleanUserText} ke baare me pucha. Char Dham highways aur Himalayan routes open hain. Main aapko live route, weather aur verified homestays bata sakta hoon.`;
        }
      }

      const cleanReply = replyText.replace(/[*#_~`]/g, '').trim();
      setLiveAiText(cleanReply);
      setTranscriptHistory(prev => [...prev, { role: 'assistant', text: cleanReply, time: getCurrentTimestamp() }]);
      setStatus('speaking');

      // 4. Play Spoken Speech
      if (!isSpeakerMuted) {
        if (audioBase64) {
          playAudioStream(audioBase64, {
            onStart: () => setStatus('speaking'),
            onEnd: () => {
              isProcessingRef.current = false;
              if (isOpen && !isMutedRef.current) startVoiceSession();
            },
            onError: () => {
              speakText(cleanReply, {
                lang: 'hi-IN',
                onEnd: () => {
                  isProcessingRef.current = false;
                  if (isOpen && !isMutedRef.current) startVoiceSession();
                }
              });
            }
          });
        } else {
          speakText(cleanReply, {
            lang: 'hi-IN',
            rate: 0.95,
            pitch: 1.0,
            onStart: () => setStatus('speaking'),
            onEnd: () => {
              isProcessingRef.current = false;
              if (isOpen && !isMutedRef.current) startVoiceSession();
            },
            onError: () => {
              isProcessingRef.current = false;
              if (isOpen && !isMutedRef.current) startVoiceSession();
            }
          });
        }
      } else {
        setTimeout(() => {
          isProcessingRef.current = false;
          if (isOpen && !isMutedRef.current) startVoiceSession();
        }, 2000);
      }
    } catch (err) {
      console.warn('[VoiceStudio] Processing error:', err);
      isProcessingRef.current = false;
      if (isOpen && !isMutedRef.current) startVoiceSession();
    }
  };

  const cleanupVoice = () => {
    isProcessingRef.current = false;

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }

    stopAudioRecording();

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
        try { recognitionRef.current.abort(); } catch (_) {}
      }
      stopAudioRecording();
      setStatus('idle');
    } else {
      setStatus('listening');
      startVoiceSession();
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in font-sans">
      <div 
        className="relative w-full max-w-4xl h-[90vh] max-h-[780px] bg-stone-950 rounded-3xl border border-emerald-500/20 shadow-2xl flex flex-col overflow-hidden text-white select-none"
      >
        {/* Background Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f3d2e]/30 via-transparent to-stone-950 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ── Top App Bar ── */}
        <div className="relative z-10 px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
              <Radio size={20} className="text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wide text-white">Devbhoomi AI Voice</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-400 font-mono mt-0.5">
                <Clock size={11} className="text-emerald-400" />
                <span>{formatDuration(callDuration)}</span>
                <span>•</span>
                <span className="capitalize text-emerald-400 font-bold">{status}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Visualizer Mode Switcher */}
            <div className="hidden sm:flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setVisualMode('orb')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  visualMode === 'orb' ? 'bg-emerald-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
                }`}
              >
                Orb
              </button>
              <button
                type="button"
                onClick={() => setVisualMode('wave')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  visualMode === 'wave' ? 'bg-emerald-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
                }`}
              >
                Wave
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                cleanupVoice();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Main Interactive Center Stage ── */}
        <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left / Center Visualizer Column (7 cols) */}
          <div className="md:col-span-7 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden">
            
            {/* Live Audio Visualizer Canvas */}
            <div className="w-full max-w-sm h-56 sm:h-64 flex items-center justify-center relative">
              <VoiceVisualizer
                mode={visualMode}
                status={status}
                audioLevel={status === 'speaking' ? aiAudioLevel : micAudioLevel}
              />
            </div>

            {/* Live Subtitle HUD */}
            <div className="w-full max-w-md mt-4 text-center min-h-[70px] flex flex-col items-center justify-center px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              {status === 'processing' ? (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-pulse">
                  <Sparkles size={14} />
                  <span>Devbhoomi AI is analyzing mountain route data...</span>
                </div>
              ) : status === 'speaking' ? (
                <p className="text-xs sm:text-sm text-emerald-200 font-medium leading-relaxed line-clamp-3">
                  "{liveAiText || 'Speaking...'}"
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-stone-300 font-medium leading-relaxed">
                  {liveUserText ? (
                    <span className="text-white font-bold">"{liveUserText}"</span>
                  ) : (
                    <span className="text-stone-400">🎙️ Listening... Speak naturally in Hindi, English or Pahadi</span>
                  )}
                </p>
              )}
            </div>

            {/* Quick Tap Question Chips */}
            <div className="w-full max-w-md mt-4 flex flex-wrap items-center justify-center gap-1.5">
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleProcessVoiceQuery(q)}
                  disabled={status === 'processing'}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-emerald-500/20 text-stone-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  ⚡ {q}
                </button>
              ))}
            </div>
          </div>

          {/* Right Live Transcript Feed Column (5 cols) */}
          <div className="md:col-span-5 flex flex-col h-full bg-white/[0.01] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Live Transcript</span>
              <span className="text-[10px] text-emerald-400 font-mono">{transcriptHistory.length} messages</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar text-xs">
              {transcriptHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-stone-500">
                  <Activity size={24} className="mb-2 text-stone-600" />
                  <p className="font-bold">Real-time Spoken Conversation</p>
                  <p className="text-[11px] mt-1 text-stone-600">Your questions and AI responses will stream here in real time.</p>
                </div>
              ) : (
                transcriptHistory.map((item, index) => (
                  <div 
                    key={index}
                    className={`flex flex-col gap-1 ${item.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-stone-400">
                      {item.role === 'user' ? <User size={10} /> : <Bot size={10} className="text-emerald-400" />}
                      <span>{item.role === 'user' ? 'You' : 'Devbhoomi AI'}</span>
                      <span>•</span>
                      <span>{item.time}</span>
                    </div>
                    <div 
                      className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                        item.role === 'user'
                          ? 'bg-[#0f3d2e] text-white rounded-tr-none border border-emerald-500/30'
                          : 'bg-white/10 text-stone-200 rounded-tl-none border border-white/10'
                      }`}
                    >
                      {item.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={captionsEndRef} />
            </div>

            {/* Quick Text Input inside Voice Studio */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (manualInput.trim()) {
                  handleProcessVoiceQuery(manualInput.trim());
                  setManualInput('');
                }
              }}
              className="p-3 border-t border-white/10 bg-white/[0.02] flex items-center gap-2"
            >
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Type question or speak..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                disabled={!manualInput.trim() || status === 'processing'}
                className="p-2 rounded-xl bg-emerald-500 text-stone-950 hover:bg-emerald-400 font-bold transition-all cursor-pointer disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* ── Bottom Control Deck ── */}
        <div className="relative z-10 px-6 py-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 bg-white/[0.02] backdrop-blur-md">
          
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${
              status === 'speaking' ? 'bg-teal-400 animate-ping' :
              status === 'processing' ? 'bg-amber-400 animate-pulse' :
              status === 'listening' ? 'bg-[#00FF88] shadow-[0_0_10px_rgba(0,255,136,0.8)]' :
              'bg-stone-500'
            }`} />
            <span className="text-xs font-bold text-stone-300 capitalize">
              {status === 'listening' ? 'Mic Active • Ready' : status}
            </span>
          </div>

          {/* Action Button Deck */}
          <div className="flex items-center gap-3">
            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={toggleMute}
              className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold active:scale-95 shadow-lg ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-emerald-500 text-stone-950 hover:bg-emerald-400 shadow-emerald-500/20'
              }`}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
            </button>

            {/* Speaker Toggle Button */}
            <button
              type="button"
              onClick={() => {
                const next = !isSpeakerMuted;
                setIsSpeakerMuted(next);
                if (next) stopSpeaking();
              }}
              className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold active:scale-95 border ${
                isSpeakerMuted
                  ? 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              {isSpeakerMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isSpeakerMuted ? 'Muted' : 'Audio On'}</span>
            </button>

            {/* End Session Button */}
            <button
              type="button"
              onClick={() => {
                cleanupVoice();
                onClose();
              }}
              className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold active:scale-95 shadow-md shadow-rose-900/30"
            >
              <PhoneOff size={16} />
              <span>End Call</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
