/**
 * Devbhoomi Conversational AI - Chat Input
 * Master white input bar with emerald focus states, voice trigger, and fluid touch handling
 */

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, Square } from 'lucide-react';

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
      className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 py-3"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="relative rounded-2xl bg-white border border-stone-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 shadow-xs transition-all duration-200">
        <textarea
          ref={textareaRef}
          id="du-ai-copilot-input"
          name="copilotMessage"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading && !isStreaming}
          className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-stone-400 px-3.5 sm:px-4 pt-3 sm:pt-3.5 pb-11 sm:pb-12 focus:outline-none resize-none leading-relaxed min-h-[44px] sm:min-h-[48px] max-h-[130px]"
        />

        {/* Action Toolbar Inside Input Container */}
        <div className="absolute left-2.5 right-2.5 bottom-2 sm:bottom-2.5 flex items-center justify-between pointer-events-none">
          {/* Left: Live Voice Trigger */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={onOpenVoice}
              title="Speak with Devbhoomi Live Voice"
              className="group px-3 py-1 rounded-full bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <Mic size={13} className="text-emerald-700 group-hover:scale-110 transition-transform" />
              <span>Voice</span>
            </button>
          </div>

          {/* Right: Submit or Stop Button */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="hidden sm:inline text-[11px] text-stone-400 font-sans">
              ↵ Enter
            </span>

            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                title="Stop response"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-2xs"
              >
                <Square size={12} className="fill-current" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!text.trim() || isLoading}
                onClick={handleSend}
                title="Send query"
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center ${
                  text.trim() && !isLoading
                    ? 'bg-[#0a3e2b] hover:bg-[#12583e] text-white shadow-xs cursor-pointer'
                    : 'bg-stone-100 text-stone-300 cursor-not-allowed border border-stone-200/80'
                }`}
              >
                <ArrowUp size={14} className={text.trim() ? "text-white" : "text-stone-300"} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Suggestion Chips matching Image 2 */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2.5 px-0.5">
        {[
          { icon: '🌸', label: '3-Day Rishikesh spiritual retreat', prompt: 'Suggest a 3-day spiritual retreat in Rishikesh with Ganga Aarti & meditation ashrams' },
          { icon: '🏔️', label: '4×4 Offbeat road trip to Munsiyari', prompt: 'Suggest a 4-day scenic road trip from Dehradun to Munsiyari with verified 4x4 Thar rental and boutique homestays.' },
          { icon: '🏡', label: 'Verified Homestays in Chopta', prompt: 'Find verified budget Pahadi homestays near Chopta & Tungnath under ₹2,000' }
        ].map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSend(chip.prompt)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-50 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200 border border-stone-200/80 text-[11px] sm:text-xs font-medium text-stone-600 transition-all shrink-0 cursor-pointer active:scale-95 shadow-2xs whitespace-nowrap"
          >
            <span>{chip.icon}</span>
            <span>{chip.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
