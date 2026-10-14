import React, { useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';
import { useChatStore } from './ChatState';

export default function ChatInput({ onSend, onVoice }) {
  const inputText = useChatStore((s) => s.inputText);
  const setInputText = useChatStore((s) => s.setInputText);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 96) + 'px';
    }
  }, [inputText]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || isStreaming) return;
    setInputText('');
    onSend(text);
  };

  return (
    <div className="flex-shrink-0 px-3 pb-3 pt-2 border-t border-stone-800/80 bg-stone-950">
      <div className="flex items-end gap-2 bg-stone-800/60 border border-stone-700/60 rounded-2xl px-3 py-2">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about treks, stays, safety, routes…"
          rows={1}
          disabled={isStreaming}
          className="flex-1 bg-transparent text-[12px] text-stone-200 placeholder:text-stone-500 resize-none outline-none leading-relaxed max-h-24 disabled:opacity-50"
        />
        <div className="flex items-center gap-1.5 flex-shrink-0 pb-0.5">
          {onVoice && (
            <button
              onClick={onVoice}
              className="p-1.5 rounded-full hover:bg-stone-700 text-stone-400 hover:text-emerald-300 transition cursor-pointer"
              title="Switch to voice"
            >
              <Mic size={14} />
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isStreaming}
            className="p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition cursor-pointer disabled:cursor-not-allowed"
            title="Send"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
      <p className="text-center text-[9px] text-stone-600 mt-1.5">Shift+Enter for new line · Enter to send</p>
    </div>
  );
}
