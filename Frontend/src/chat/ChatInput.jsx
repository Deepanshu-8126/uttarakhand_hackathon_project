/**
 * Devbhoomi Conversational AI - Chat Input
 * Inspired by langchain-ai/agent-chat-ui
 */

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, Square, Sparkles } from 'lucide-react';

export default function ChatInput({
  onSend = () => {},
  onOpenVoice = () => {},
  isLoading = false,
  isStreaming = false,
  onStop = () => {},
  placeholder = "Ask about Kedarnath, treks, AMS safety, homestays, or budget..."
}) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea up to 140px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto p-2 sm:p-3">
      <div className="relative rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-emerald-500/50 backdrop-blur-xl shadow-2xl transition-all duration-200">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading && !isStreaming}
          className="w-full bg-transparent text-sm sm:text-base text-stone-100 placeholder:text-stone-500 px-4 pt-3.5 pb-12 focus:outline-none resize-none leading-relaxed min-h-[48px] max-h-[140px]"
        />

        {/* Action Toolbar Inside Input Container */}
        <div className="absolute left-3 right-3 bottom-2.5 flex items-center justify-between pointer-events-none">
          {/* Left: Voice Trigger Button */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={onOpenVoice}
              title="Speak with Devbhoomi Live Voice"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/20 text-emerald-300 hover:text-emerald-100 flex items-center gap-1.5 text-xs font-medium transition-all active:scale-95 cursor-pointer"
            >
              <Mic size={14} className="text-emerald-400" />
              <span className="hidden sm:inline">Voice Mode</span>
            </button>
          </div>

          {/* Right: Submit or Stop Button */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                title="Stop response"
                className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all active:scale-95 cursor-pointer"
              >
                <Square size={15} className="fill-current" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!text.trim() || isLoading}
                onClick={handleSend}
                title="Send query"
                className={`p-2 rounded-xl transition-all active:scale-95 flex items-center justify-center ${
                  text.trim() && !isLoading
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-900/40 cursor-pointer hover:opacity-95'
                    : 'bg-white/5 text-stone-600 cursor-not-allowed border border-white/5'
                }`}
              >
                <ArrowUp size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
