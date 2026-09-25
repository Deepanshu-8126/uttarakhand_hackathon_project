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
      <div className="shrink-0 px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-black/40 backdrop-blur-xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950/50 shrink-0">
            <Compass size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-emerald-100 truncate">
                Devbhoomi AI Travel Copilot
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/20 text-[10px] font-bold text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {activeAgent}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate">
              Intelligent Himalayan trip planner, safety guide &amp; booking assistant
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsVoiceOpen(true)}
            title="Open Gemini Live Voice Mode"
            className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/20 text-emerald-300 transition-all active:scale-95 cursor-pointer"
          >
            <Mic size={15} />
          </button>

          <button
            type="button"
            onClick={clearChat}
            title="Reset conversation"
            className="p-2 rounded-xl hover:bg-white/5 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 size={15} />
          </button>

          {!embedded && (
            <button
              type="button"
              onClick={onClose}
              title="Close chat"
              className="p-2 rounded-xl hover:bg-white/5 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={17} />
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable Messages Timeline ── */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-1 scroll-smooth">
        {messages.map((msg) => (
          <MessageRenderer key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested Prompts & Actions ── */}
      {latestSuggestions.length > 0 && !isStreaming && (
        <div className="shrink-0 px-3 sm:px-6 pt-1 bg-gradient-to-t from-black/50 to-transparent">
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
