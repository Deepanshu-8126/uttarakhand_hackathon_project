/**
 * Devbhoomi Conversational AI - ChatWindow
 * Master conversational container inspired by langchain-ai/agent-chat-ui & voice-demo
 */

import React, { useRef, useEffect } from 'react';
import { Sparkles, Trash2, Mic, X, Radio, Compass, ShieldAlert, Cpu } from 'lucide-react';
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

  return (
    <div className={`flex flex-col h-full bg-[#040e09] text-white overflow-hidden relative ${embedded ? 'rounded-2xl border border-white/10' : ''}`}>
      
      {/* ── Top Header ── */}
      <div className="shrink-0 px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-white/[0.08] bg-black/40 backdrop-blur-xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950/50 shrink-0">
            <Compass size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-xs sm:text-base font-bold text-emerald-100 truncate">
                Devbhoomi AI Travel Copilot
              </h2>
              <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/20 text-[9px] sm:text-[10px] font-bold text-emerald-300 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="truncate max-w-[70px] sm:max-w-none">{activeAgent}</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-stone-400 truncate">
              Himalayan trip planner, safety guide &amp; booking
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsVoiceOpen(true)}
            title="Open Gemini Live Voice Mode"
            className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/20 text-emerald-300 transition-all active:scale-95 cursor-pointer"
          >
            <Mic size={15} />
          </button>

          <button
            type="button"
            onClick={clearChat}
            title="Reset conversation"
            className="p-1.5 sm:p-2 rounded-xl hover:bg-white/5 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 size={15} />
          </button>

          {!embedded && (
            <button
              type="button"
              onClick={onClose}
              title="Close chat"
              className="p-1.5 sm:p-2 rounded-xl hover:bg-white/5 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={17} />
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable Messages Timeline ── */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2.5 sm:p-4 space-y-2 scroll-smooth">
        {messages.map((msg) => (
          <MessageRenderer key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested Prompts & Actions ── */}
      {latestSuggestions.length > 0 && !isStreaming && (
        <div className="shrink-0 px-2 sm:px-6 pt-1 bg-gradient-to-t from-black/50 to-transparent">
          <SuggestedActions
            suggestions={latestSuggestions}
            onSelect={(prompt) => sendMessage(prompt)}
            disabled={isLoading}
          />
        </div>
      )}

      {/* ── Bottom Input Bar ── */}
      <div className="shrink-0 bg-black/40 border-t border-white/[0.06] backdrop-blur-xl">
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
