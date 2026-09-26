/**
 * Devbhoomi Conversational AI - ChatWindow
 * Master conversational container with rich Himalayan glassmorphism and real-time state
 */

import React, { useRef, useEffect } from 'react';
import { Trash2, Mic, X, Compass, Shield, Mountain, Hotel, Route, ArrowRight } from 'lucide-react';
import { useChatState } from './ChatState.js';
import MessageRenderer from './MessageRenderer.jsx';
import ChatInput from './ChatInput.jsx';
import SuggestedActions from './SuggestedActions.jsx';
import VoiceControls from './VoiceControls.jsx';

export default function ChatWindow({
  isOpen: _isOpen = true,
  onClose = () => {},
  initialQuery = '',
  embedded = false
}) {
  const {
    messages,
    isLoading,
    isStreaming,
    activeAgent,
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

  const starterCards = [
    {
      icon: Mountain,
      title: "Plan 4-Day Trek",
      desc: "Valley of Flowers & Hemkund Sahib itinerary with safety checks",
      prompt: "Mujhe Valley of Flowers aur Hemkund Sahib ka 4-day trek plan bana do Delhi se start karke"
    },
    {
      icon: Shield,
      title: "Live Road & Weather",
      desc: "Current monsoon advisories, landslides and mountain forecast",
      prompt: "Kedarnath aur Badrinath route ka live weather aur road safety status kaisa hai?"
    },
    {
      icon: Hotel,
      title: "Pahadi Homestays",
      desc: "Verified local mountain stays with direct host booking",
      prompt: "Rishikesh aur Chopta ke paas verified Pahadi homestays dikhao under 2000 per night"
    },
    {
      icon: Route,
      title: "Budget Trip Planner",
      desc: "Custom cost breakdown for solo or family travel",
      prompt: "2 logon ke liye 5 din ka Uttarakhand trip plan under ₹20,000"
    }
  ];

  return (
    <div className={`flex flex-col h-full bg-[#040d08] text-white overflow-hidden relative selection:bg-emerald-500/30 ${embedded ? 'rounded-2xl border border-white/10' : ''}`}>
      
      {/* ── Ambient Background Glows ── */}
      <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-16 left-0 w-60 sm:w-80 h-60 sm:h-80 bg-teal-500/5 rounded-full blur-[90px] pointer-events-none -ml-20" />

      {/* ── Top Header ── */}
      <div className="shrink-0 px-3.5 sm:px-6 py-3 border-b border-white/[0.08] bg-[#06120b]/80 backdrop-blur-2xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-[1px] shadow-lg shadow-emerald-950/60 shrink-0">
            <div className="w-full h-full bg-[#040e09] rounded-[15px] flex items-center justify-center">
              <Compass size={18} className="text-emerald-300 animate-spin-slow" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#040e09] animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-100 via-white to-teal-200 bg-clip-text text-transparent truncate">
                Devbhoomi AI Travel Copilot
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/25 text-[9px] sm:text-[10px] font-bold text-emerald-300 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="truncate max-w-[80px] sm:max-w-none">{activeAgent}</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-stone-400 truncate flex items-center gap-1">
              <span>Himalayan terrain intelligence</span>
              <span className="text-emerald-500/60">•</span>
              <span className="text-emerald-400/90 font-medium">100% Grounded</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsVoiceOpen(true)}
            title="Open Live Voice Companion"
            className="group relative px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/10 hover:from-emerald-500/30 hover:to-teal-500/20 border border-emerald-400/30 text-emerald-200 hover:text-white transition-all duration-200 active:scale-95 flex items-center gap-1.5 text-xs font-semibold shadow-sm cursor-pointer"
          >
            <Mic size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Voice Mode</span>
          </button>

          <button
            type="button"
            onClick={clearChat}
            title="Reset conversation"
            className="p-2 rounded-xl hover:bg-white/[0.06] text-stone-400 hover:text-rose-300 border border-transparent hover:border-white/10 transition-all cursor-pointer"
          >
            <Trash2 size={15} />
          </button>

          {!embedded && (
            <button
              type="button"
              onClick={onClose}
              title="Close chat"
              className="p-2 rounded-xl hover:bg-white/[0.06] text-stone-400 hover:text-white border border-transparent hover:border-white/10 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable Messages Timeline ── */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-5 space-y-3.5 scroll-smooth z-0">
        
        {/* Welcome Empty State if only 0 or 1 message */}
        {messages.length <= 1 && (
          <div className="py-4 sm:py-6 px-2 max-w-xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-emerald-400/10 border border-emerald-500/30 shadow-xl shadow-emerald-950/60 text-emerald-300">
              <Mountain size={28} className="text-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-emerald-100">
                Welcome to Devbhoomi AI
              </h3>
              <p className="text-xs sm:text-sm text-stone-300/90 leading-relaxed max-w-md mx-auto">
                Ask anything about mountain routes, high-altitude acclimatization, live road safety alerts, or verified local homestays.
              </p>
            </div>

            {/* Quick Starter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 text-left pt-1">
              {starterCards.map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(card.prompt)}
                    disabled={isLoading}
                    className="group p-3 sm:p-3.5 rounded-2xl bg-white/[0.02] hover:bg-emerald-950/40 border border-white/[0.07] hover:border-emerald-500/30 transition-all duration-200 active:scale-[0.98] text-left flex items-start gap-2.5 cursor-pointer shadow-sm"
                  >
                    <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-400/20 group-hover:bg-emerald-500/25 shrink-0 transition-colors">
                      <IconComponent size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-emerald-200 group-hover:text-white flex items-center justify-between">
                        <span className="truncate">{card.title}</span>
                        <ArrowRight size={12} className="text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                      </div>
                      <div className="text-[11px] text-stone-400 line-clamp-2 mt-0.5 leading-snug">
                        {card.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageRenderer key={msg.id} message={msg} onSendPrompt={(prompt) => sendMessage(prompt)} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested Prompts & Actions ── */}
      {latestSuggestions.length > 0 && !isStreaming && (
        <div className="shrink-0 px-3 sm:px-6 pt-1 pb-0.5 bg-gradient-to-t from-black/60 to-transparent z-10">
          <SuggestedActions
            suggestions={latestSuggestions}
            onSelect={(prompt) => sendMessage(prompt)}
            disabled={isLoading}
          />
        </div>
      )}

      {/* ── Bottom Input Bar ── */}
      <div className="shrink-0 bg-[#06120b]/90 border-t border-white/[0.08] backdrop-blur-2xl z-10">
        <ChatInput
          onSend={(text) => sendMessage(text)}
          onOpenVoice={() => setIsVoiceOpen(true)}
          isLoading={isLoading}
          isStreaming={isStreaming}
          onStop={stopGeneration}
        />
      </div>

      {/* ── Fullscreen Live Aoede Voice Overlay ── */}
      <VoiceControls
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

    </div>
  );
}
