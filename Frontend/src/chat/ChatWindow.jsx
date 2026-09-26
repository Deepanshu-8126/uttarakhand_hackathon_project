/**
 * Devbhoomi Conversational AI - ChatWindow
 * Slide-over Drawer Panel with Text Mode & Live Voice Companion View
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCw, Mic, X, Mountain, Route, CloudSun, Sparkles, Keyboard, Square, Volume2 } from 'lucide-react';
import { useChatState } from './ChatState.js';
import MessageRenderer from './MessageRenderer.jsx';
import SuggestedActions from './SuggestedActions.jsx';

export default function ChatWindow({
  isOpen = true,
  onClose = () => {},
  initialQuery = '',
  embedded = false
}) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [voiceStatus, setVoiceStatus] = useState('listening'); // 'listening', 'thinking', 'speaking'
  const [liveTranscript, setLiveTranscript] = useState('Can you suggest the best 3-day trek itinerary starting from Rishikesh with live weather updates?');
  const [liveAiReply, setLiveAiReply] = useState('I recommend the Chopta – Tungnath – Chandrashila circuit. Current passes are sunny and clear at 14°C. Day 1: Rishikesh to Sari Village base. Day 2: Summit Tungnath & Chandrashila at sunrise. Day 3: Scenic return via Deoriatal lake.');

  const {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    clearChat,
    stopGeneration
  } = useChatState({ initialQuery });

  const messagesEndRef = useRef(null);

  // Auto-scroll on new tokens or messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Last assistant message suggestions
  const latestSuggestions = messages[messages.length - 1]?.suggestions || [];

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

  // Trigger speech synthesis or live mock test in voice mode
  const handleVoiceQuery = async (queryText) => {
    setLiveTranscript(queryText);
    setVoiceStatus('thinking');
    try {
      setVoiceStatus('speaking');
      sendMessage(queryText);
      setLiveAiReply('I recommend the Chopta – Tungnath – Chandrashila circuit. Current passes are sunny and clear at 14°C. Day 1: Rishikesh to Sari Village base. Day 2: Summit Tungnath & Chandrashila at sunrise. Day 3: Scenic return via Deoriatal lake.');
    } catch (_) {
      setVoiceStatus('listening');
    }
  };

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
              onClick={() => setIsVoiceActive(false)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
              title="Voice Active — Click to switch to Text Mode"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
              <span>Voice Active</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsVoiceActive(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Voice Mode"
            >
              <Mic size={14} className="text-emerald-700" />
              <span>Voice</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              clearChat();
              setLiveTranscript('Can you suggest the best 3-day trek itinerary starting from Rishikesh with live weather updates?');
            }}
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
        // LIVE VOICE COMPANION VIEW (MATCHING USER SCREENSHOT EXACTLY)
        // ═════════════════════════════════════════════════════════════════════
        <div className="flex-1 min-h-0 flex flex-col justify-between p-5 overflow-y-auto custom-copilot-scrollbar bg-white">
          <div className="space-y-4">
            
            {/* 1. Circular Glowing Mic Orb & Pulsing Waveform */}
            <div className="flex flex-col items-center justify-center pt-2 pb-1 space-y-3">
              <div className="w-20 h-20 rounded-full bg-emerald-100/70 ring-8 ring-emerald-50 flex items-center justify-center shadow-xs transition-transform duration-500 hover:scale-105">
                <div className="w-14 h-14 rounded-full bg-[#0b533e] text-white flex items-center justify-center shadow-md">
                  <Mic size={26} className="text-white" />
                </div>
              </div>

              {/* Status Pill */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-emerald-800 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{voiceStatus === 'speaking' ? 'Speaking ground intelligence...' : 'Listening to your voice...'}</span>
              </div>

              {/* 7-Bar Animated Equalizer */}
              <div className="flex items-center justify-center gap-1 h-5 pt-1">
                {[12, 18, 14, 20, 16, 10, 15].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}px` }}
                    className="w-1 bg-emerald-500 rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* 2. YOU SAID (LIVE TRANSCRIPT) Card */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>YOU SAID (LIVE TRANSCRIPT)</span>
              </div>
              <p className="text-xs text-slate-800 font-medium italic mt-2 leading-relaxed">
                “{liveTranscript}”
              </p>
            </div>

            {/* 3. Devbhoomi AI Speaking Response Card */}
            <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#0b533e] text-amber-300 flex items-center justify-center text-[10px]">
                    ★
                  </div>
                  <span className="text-xs font-bold text-slate-900">Devbhoomi AI</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Speaking</span>
                </span>
              </div>

              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {liveAiReply}
              </p>

              {/* Info Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="bg-white border border-emerald-200 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs">
                  14°C Clear Skies
                </span>
                <span className="bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-2xs">
                  Moderate Difficulty
                </span>
              </div>
            </div>

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

              <div className="flex flex-wrap gap-2">
                {[
                  'English',
                  'हिन्दी',
                  'गढ़वाली (Garhwali)',
                  'कुमाऊँनी (Kumaoni)'
                ].map((lang) => {
                  const isActive = selectedLanguage === lang;
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLanguage(lang)}
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
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between gap-3">
              {/* Keyboard Mode Button */}
              <button
                type="button"
                onClick={() => setIsVoiceActive(false)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              >
                <Keyboard size={14} className="text-slate-500" />
                <span>Keyboard</span>
              </button>

              {/* Big Center Mic Trigger */}
              <button
                type="button"
                onClick={() => handleVoiceQuery('Badrinath weather forecast and Chopta snow status for this week')}
                className="w-11 h-11 rounded-full bg-[#0b533e] hover:bg-[#073c2c] text-white flex items-center justify-center shadow-md transition-transform active:scale-90 cursor-pointer"
                title="Tap to speak"
              >
                <Mic size={20} />
              </button>

              {/* Interrupt Button */}
              <button
                type="button"
                onClick={() => {
                  stopGeneration();
                  setVoiceStatus('listening');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
              >
                <Square size={12} className="fill-rose-600" />
                <span>Interrupt</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center select-none pt-1">
              Uttarakhand Tourism Real-time Speech AI Engine
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
                onClick={() => setIsVoiceActive(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
                title="Open Voice Companion"
              >
                <Mic size={17} />
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
