/**
 * Devbhoomi Conversational AI - Agent Thinking Timeline
 * Inspired by langchain-ai/agent-chat-ui
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Cpu, CheckCircle2, ShieldAlert, Compass, DollarSign, Calendar, Flame } from 'lucide-react';

const AGENT_ICONS = {
  PlannerAgent: Calendar,
  DestinationAgent: Compass,
  BudgetAgent: DollarSign,
  SafetyAgent: ShieldAlert,
  RentalAgent: Compass,
  FestivalAgent: Flame,
  default: Cpu
};

export default function AgentThinking({ agent = 'Devbhoomi Companion', steps = [], isStreaming = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = AGENT_ICONS[agent] || AGENT_ICONS.default;

  if (!steps || steps.length === 0) return null;
  const latestThought = steps[steps.length - 1]?.thought || steps[steps.length - 1];

  return (
    <div className="my-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/50 overflow-hidden text-xs transition-all duration-200 shadow-2xs">
      {/* Header / Summary Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2 flex items-center justify-between text-left hover:bg-emerald-100/40 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-md bg-emerald-100 text-emerald-800">
            <Icon size={13} />
          </div>
          <span className="font-bold text-[#0f3d2e] shrink-0">
            {agent}
          </span>
          <span className="text-stone-500 font-normal truncate max-w-[200px] sm:max-w-xs">
            {isStreaming ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                {latestThought}
              </span>
            ) : (
              `Thought process (${steps.length} steps)`
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-stone-400 shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
            {isOpen ? 'Hide' : 'Inspect'}
          </span>
          {isOpen ? <ChevronDown size={14} className="text-stone-600" /> : <ChevronRight size={14} className="text-stone-600" />}
        </div>
      </button>

      {/* Expandable Step-by-Step Timeline */}
      {isOpen && (
        <div className="px-3.5 py-2.5 border-t border-emerald-200/60 bg-white/70 space-y-2 animate-in fade-in duration-150">
          {steps.map((st, idx) => {
            const thoughtText = typeof st === 'string' ? st : st.thought;
            return (
              <div key={idx} className="flex items-start gap-2.5 text-slate-700">
                <CheckCircle2 size={13} className="text-emerald-700 mt-0.5 shrink-0" />
                <span className="leading-relaxed font-mono text-[11px] text-slate-800">
                  {thoughtText}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
