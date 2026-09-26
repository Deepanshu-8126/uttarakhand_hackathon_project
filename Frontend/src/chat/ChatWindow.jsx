/**
 * Devbhoomi Conversational AI - ChatWindow
 * Master conversational container with Clean Alpine White & Himalayan Emerald theme
 */

import React, { useRef, useEffect } from 'react';
import { Sparkles, Trash2, Mic, X, Compass, Shield, Mountain, Hotel, Route, ArrowRight, Check } from 'lucide-react';
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
      desc: "Valley of Flowers & Hemkund Sahib itinerary...",
      prompt: "Mujhe Valley of Flowers aur Hemkund Sahib ka 4-day trek plan bana do Delhi se start karke"
    },
    {
      icon: Shield,
      title: "Live Road & Weather",
      desc: "Current monsoon advisories, landslides and...",
      prompt: "Kedarnath aur Badrinath route ka live weather aur road safety status kaisa hai?"
    }
  ];

  const quickPills = [
    { label: "Kedarnath Dham Route & Acclimatization", prompt: "Kedarnath Dham route, biometric yatra registration and altitude acclimatization guide" },
    { label: "Auli Skiing & Cable Car Guide", prompt: "Auli skiing season, ropeway cable car timings and best slope viewpoints" },
    { label: "3-Day Rishikesh & Chopta Trip", prompt: "3-Day itinerary for Rishikesh river rafting and Chopta Tungnath Chandrashila summit" },
    { label: "Check Live Himalayan Weather", prompt: "Live mountain weather and road conditions for high altitude passes in Uttarakhand" }
  ];

  return (
    <div className={`flex flex-col h-full bg-white text-slate-800 overflow-hidden relative selection:bg-emerald-100 ${embedded ? 'border-t sm:border-t-0 sm:border-l border-stone-200/80' : ''}`}>
      
      {/* ── Top Vibrant Gradient Accent Bar (Matching Image 2) ── */}
      <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-emerald-600 via-teal-400 to-amber-400" />

      {/* ── Ambient Alpine Glows ── */}
      <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-16 left-0 w-60 sm:w-80 h-60 sm:h-80 bg-teal-500/5 rounded-full blur-[80px] pointer-events-none -ml-20" />

      {/* ── Top Header (Matching Image 2) ── */}
      <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-stone-100 bg-white/95 backdrop-blur-xl flex items-center justify-between z-10 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs">
            <Compass size={19} className="text-emerald-800" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-[#0a3e2b] whitespace-nowrap tracking-tight">
                Devbhoomi AI
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] sm:text-[11px] font-semibold text-emerald-800 whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>Devbhoomi Companion</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-0.5">
              <Check size={12} className="text-emerald-600 stroke-[3]" />
              <span>100% Grounded</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsVoiceOpen(true)}
            title="Open Live Voice Companion"
            className="group px-3.5 sm:px-4 py-1.5 rounded-full bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 transition-all duration-200 active:scale-95 flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer shrink-0"
          >
            <Mic size={13} className="text-emerald-700 group-hover:scale-110 transition-transform shrink-0" />
            <span className="whitespace-nowrap">Voice Mode</span>
          </button>

          <button
            type="button"
            onClick={clearChat}
            title="Reset conversation"
            className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-stone-50 transition-colors cursor-pointer shrink-0"
          >
            <Trash2 size={16} />
          </button>

          {!embedded && (
            <button
              type="button"
              onClick={onClose}
              title="Close chat"
              className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-50 transition-colors cursor-pointer shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable Messages Timeline ── */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 scroll-smooth z-0 custom-copilot-scrollbar">
        
        {/* Welcome Empty State if only 0 or 1 message */}
        {messages.length <= 1 && (
          <div className="py-2 sm:py-4 px-2 max-w-xl mx-auto text-center space-y-4 sm:space-y-5">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-xs text-emerald-700 mx-auto">
              <Mountain size={28} className="text-emerald-700" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-[#0a3e2b] tracking-tight">
                Welcome to Devbhoomi AI
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-md mx-auto">
                Ask anything about mountain routes, high-altitude acclimatization, live road safety alerts, or verified local homestays.
              </p>
            </div>

            {/* Quick Starter Cards (2 Columns matching Image 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-left">
              {starterCards.map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(card.prompt)}
                    disabled={isLoading}
                    className="group p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-emerald-50/40 border border-stone-200/90 hover:border-emerald-300 transition-all duration-200 active:scale-[0.98] text-left flex items-start gap-3 cursor-pointer shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 group-hover:bg-emerald-100 flex items-center justify-center shrink-0 transition-colors">
                      <IconComponent size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#0a3e2b] flex items-center justify-between">
                        <span className="truncate">{card.title}</span>
                        <ArrowRight size={13} className="text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                      </div>
                      <div className="text-[11px] sm:text-xs text-stone-500 line-clamp-2 mt-0.5 leading-snug">
                        {card.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 4 Prompt Pills (Arranged in 2 balanced rows matching Image 2) */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {quickPills.map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(pill.prompt)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-xs font-medium text-stone-700 shadow-2xs hover:border-stone-300 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <Sparkles size={11} className="text-emerald-600 shrink-0" />
                  <span>{pill.label}</span>
                </button>
              ))}
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
