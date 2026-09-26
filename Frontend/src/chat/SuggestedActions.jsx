/**
 * Devbhoomi Conversational AI - Suggested Actions
 * Inspired by langchain-ai/agent-chat-ui
 */

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function SuggestedActions({ suggestions = [], onSelect = () => {}, disabled = false }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 py-1.5 px-1 overflow-x-auto no-scrollbar sm:flex-wrap touch-pan-x">
      {suggestions.map((action, idx) => (
        <button
          key={idx}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(action)}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-400/40 text-emerald-200/90 hover:text-white text-xs font-medium transition-all active:scale-95 cursor-pointer backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed text-left whitespace-nowrap"
        >
          <Sparkles size={11} className="text-emerald-400 shrink-0" />
          <span className="truncate max-w-[240px] sm:max-w-md">{action}</span>
        </button>
      ))}
    </div>
  );
}
