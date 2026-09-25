/**
 * Devbhoomi Conversational AI - Suggested Actions
 * Inspired by langchain-ai/agent-chat-ui
 */

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function SuggestedActions({ suggestions = [], onSelect = () => {}, disabled = false }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-2 px-1">
      {suggestions.map((action, idx) => (
        <button
          key={idx}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(action)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-400/40 text-emerald-200/90 hover:text-white text-xs font-medium transition-all active:scale-95 cursor-pointer backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          <Sparkles size={11} className="text-emerald-400 shrink-0" />
          <span className="truncate max-w-[280px] sm:max-w-md">{action}</span>
        </button>
      ))}
    </div>
  );
}
