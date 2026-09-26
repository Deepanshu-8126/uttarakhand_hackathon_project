/**
 * Devbhoomi Conversational AI - ChatWindow
 * Slide-over Drawer Panel with Clean Alpine & Himalayan Emerald design
 */

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCw, Mic, X, Mountain, Route, CloudSun, Sparkles, ArrowRight } from 'lucide-react';
import { useChatState } from './ChatState.js';
import MessageRenderer from './MessageRenderer.jsx';
import SuggestedActions from './SuggestedActions.jsx';
import VoiceControls from './VoiceControls.jsx';

export default function ChatWindow({
  isOpen = true,
  onClose = () => {},
  initialQuery = '',
  embedded = false
}) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const {
    messages,
    isLoading,
    isStreaming,
    activeAgent,
    thinkingSteps,
    isVoiceOpen,
    setIsVoiceOpen,
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

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 overflow-hidden relative selection:bg-emerald-100">
      
      {/* ── Drawer Top Bar / Header ── */}
      <header className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0b533e] to-emerald-600 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-600/20 shrink-0">
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
          <button
            type="button"
            onClick={() => setIsVoiceOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
            title="Voice Mode"
          >
            <Mic size={14} className="text-emerald-700" />
            <span>Voice</span>
          </button>

          <button
            type="button"
            onClick={clearChat}
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

      {/* ── Drawer Scrollable Content Body ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 space-y-6 custom-copilot-scrollbar">
        
        {/* Welcome Empty State if no messages or only initial prompt */}
        {messages.length <= 1 && (
          <>
            {/* Welcome Card & Peak Icon */}
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

            {/* Quick Structured Action Cards (Grid 2 cols) */}
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

            {/* Suggested Queries / Sparkle Chips */}
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

      {/* ── Interactive Bottom Chat Input Area ── */}
      <footer className="p-4 sm:p-5 border-t border-slate-100 bg-white/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200/80 rounded-2xl focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 transition-all">
          <button
            type="button"
            onClick={() => setIsVoiceOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
            title="Voice dictation"
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

      {/* ── Fullscreen Live Voice Overlay ── */}
      <VoiceControls
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

    </div>
  );
}
