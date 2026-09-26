/**
 * Devbhoomi Conversational AI - ChatWindow
 * Master conversational container with Clean Alpine White & Himalayan Emerald theme
 */

import React, { useRef, useEffect } from 'react';
import { Sparkles, Trash2, Mic, X, Compass, Shield, MapPin, Mountain, Hotel, Route, ArrowRight } from 'lucide-react';
import { useChatState } from './ChatState.js';
import MessageRenderer from './MessageRenderer.jsx';
import ChatInput from './ChatInput.jsx';
import SuggestedActions from './SuggestedActions.jsx';
import VoiceControls from './VoiceControls.jsx';

export default function ChatWindow({
  isOpen = true,
  onClose = () => {},
  initialQuery = '',
  embedded = false
}) {
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
    <div className={`flex flex-col h-full bg-[#fcfbfa] text-slate-800 overflow-hidden relative selection:bg-emerald-100 ${embedded ? 'border-t sm:border-t-0 sm:border-l border-stone-200/80' : ''}`}>
      
      {/* ── Ambient Alpine Glows ── */}
      <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-16 left-0 w-60 sm:w-80 h-60 sm:h-80 bg-teal-500/5 rounded-full blur-[80px] pointer-events-none -ml-20" />

      {/* ── Top Header ── */}
      <div className="shrink-0 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-stone-200/80 bg-white/95 backdrop-blur-xl flex items-center justify-between z-10 shadow-2xs gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-600 p-[1px] shadow-sm shrink-0">
            <div className="w-full h-full bg-white rounded-[15px] flex items-center justify-center">
              <Compass size={17} className="text-emerald-800" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-xs sm:text-sm font-black text-[#0f3d2e] whitespace-nowrap shrink-0 tracking-tight">
                Devbhoomi AI
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-[9px] sm:text-[10px] font-bold text-emerald-800 whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                <span className="truncate max-w-[110px] sm:max-w-none">{activeAgent || 'Copilot'}</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-stone-500 flex items-center gap-1 whitespace-nowrap mt-0.5">
              <span className="hidden xs:inline">Himalayan terrain intelligence</span>
              <span className="hidden xs:inline text-emerald-600/60">•</span>
              <span className="text-emerald-700 font-bold">100% Grounded</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsVoiceOpen(true)}
            title="Open Live Voice Companion"
            className="group relative px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 text-emerald-900 transition-all duration-200 active:scale-95 flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer shrink-0"
          >
            <Mic size={13} className="text-emerald-700 group-hover:scale-110 transition-transform shrink-0" />
            <span className="whitespace-nowrap">Voice Mode</span>
          </button>

          <button
            type="button"
            onClick={clearChat}
            title="Reset conversation"
            className="p-1.5 sm:p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-rose-600 border border-transparent hover:border-stone-200 transition-all cursor-pointer shrink-0"
          >
            <Trash2 size={15} />
          </button>

          {!embedded && (
            <button
              type="button"
              onClick={onClose}
              title="Close chat"
              className="p-1.5 sm:p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-slate-900 border border-transparent hover:border-stone-200 transition-all cursor-pointer shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable Messages Timeline ── */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-5 space-y-3.5 scroll-smooth z-0 custom-copilot-scrollbar">
        
        {/* Welcome Empty State if only 0 or 1 message */}
        {messages.length <= 1 && (
          <div className="py-4 sm:py-6 px-2 max-w-xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-emerald-50 border border-emerald-200/80 shadow-sm text-emerald-700">
              <Mountain size={28} className="text-emerald-700 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-extrabold text-[#0f3d2e] tracking-tight">
                Welcome to Devbhoomi AI
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
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
                    className="group p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-emerald-50/70 border border-stone-200/80 hover:border-emerald-400 transition-all duration-200 active:scale-[0.98] text-left flex items-start gap-2.5 cursor-pointer shadow-xs"
                  >
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:bg-emerald-100 shrink-0 transition-colors">
                      <IconComponent size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-[#0f3d2e] flex items-center justify-between">
                        <span className="truncate">{card.title}</span>
                        <ArrowRight size={12} className="text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                      </div>
                      <div className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-snug">
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
        <div className="shrink-0 px-3 sm:px-6 pt-1 pb-1 bg-gradient-to-t from-white to-transparent z-10">
          <SuggestedActions
            suggestions={latestSuggestions}
            onSelect={(prompt) => sendMessage(prompt)}
            disabled={isLoading}
          />
        </div>
      )}

      {/* ── Bottom Input Bar ── */}
      <div className="shrink-0 bg-white/95 border-t border-stone-200/80 backdrop-blur-xl z-10">
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
