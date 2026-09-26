/**
 * Devbhoomi Conversational AI - Chat Input
 * Master input bar with glowing focus states, voice trigger, and fluid touch handling
 */

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, Square, Sparkles, Send } from 'lucide-react';

export default function ChatInput({
  onSend = () => {},
  onOpenVoice = () => {},
  isLoading = false,
  isStreaming = false,
  onStop = () => {},
  placeholder = "Ask about mountain routes, high-altitude treks, AMS safety, or homestays..."
}) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea up to 130px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 130)}px`;
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
    <div 
      className="relative w-full max-w-4xl mx-auto px-3 sm:px-4 py-2.5"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="relative rounded-2xl bg-[#091810]/90 border border-emerald-500/25 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20 backdrop-blur-2xl shadow-xl shadow-black/60 transition-all duration-200">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading && !isStreaming}
          className="w-full bg-transparent text-xs sm:text-sm text-stone-100 placeholder:text-stone-500/90 px-3.5 sm:px-4 pt-3 sm:pt-3.5 pb-11 sm:pb-12 focus:outline-none resize-none leading-relaxed min-h-[44px] sm:min-h-[48px] max-h-[130px]"
        />

        {/* Action Toolbar Inside Input Container */}
        <div className="absolute left-2.5 right-2.5 bottom-2 sm:bottom-2.5 flex items-center justify-between pointer-events-none">
          {/* Left: Live Voice Trigger */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={onOpenVoice}
              title="Speak with Devbhoomi Live Voice"
              className="group px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/25 text-emerald-300 hover:text-emerald-100 flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <Mic size={13} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Voice</span>
            </button>
          </div>

          {/* Right: Submit or Stop Button */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="hidden sm:inline text-[10px] text-stone-500 font-mono">
              ↵ Enter
            </span>

            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                title="Stop response"
                className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <Square size={13} className="fill-current" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!text.trim() || isLoading}
                onClick={handleSend}
                title="Send query"
                className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center ${
                  text.trim() && !isLoading
                    ? 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-950/60 cursor-pointer hover:brightness-110 hover:shadow-emerald-900/80 border border-emerald-300/40'
                    : 'bg-white/[0.04] text-stone-600 cursor-not-allowed border border-white/[0.05]'
                }`}
              >
                <ArrowUp size={15} className={text.trim() ? "text-white" : "text-stone-600"} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
