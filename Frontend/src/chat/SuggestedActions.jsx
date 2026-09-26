/**
 * Devbhoomi Conversational AI - Suggested Actions
 * Clean Alpine White suggestions with emerald hover states
 */

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function SuggestedActions({ suggestions = [], onSelect = () => {}, disabled = false }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex items-center gap-2 py-1.5 px-1 overflow-x-auto no-scrollbar sm:flex-wrap touch-pan-x">
      {suggestions.map((action, idx) => (
        <button
          key={idx}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(action)}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-stone-200/90 hover:border-emerald-300 text-stone-700 hover:text-[#0f3d2e] text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed text-left whitespace-nowrap"
        >
          <Sparkles size={12} className="text-emerald-700 shrink-0" />
          <span className="truncate max-w-[240px] sm:max-w-md">{action}</span>
        </button>
      ))}
    </div>
  );
}
