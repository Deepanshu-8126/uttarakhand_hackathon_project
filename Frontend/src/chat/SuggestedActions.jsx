import React from 'react';
import { useChatStore, QUICK_PROMPTS } from './ChatState';

export default function SuggestedActions({ onSelect }) {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);

  if (messages.length > 0 || isStreaming) return null;

  return (
    <div className="px-3 pb-2 pt-1">
      <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-2">Quick Prompts</p>
      <div className="flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p.label}
            onClick={() => onSelect(p.text)}
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-800 hover:bg-emerald-950 border border-stone-700 hover:border-emerald-700/50 text-stone-300 hover:text-emerald-300 transition cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
