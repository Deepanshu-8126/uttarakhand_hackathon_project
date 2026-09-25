/**
 * Devbhoomi Conversational AI - Agent Thinking Timeline
 * Inspired by langchain-ai/agent-chat-ui
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Cpu, Sparkles, CheckCircle2, ShieldAlert, Compass, DollarSign, Calendar, Flame } from 'lucide-react';

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
    <div className="my-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 backdrop-blur-md overflow-hidden text-xs transition-all duration-200">
      {/* Header / Summary Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2 flex items-center justify-between text-left hover:bg-emerald-500/10 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-300">
            <Icon size={13} className={isStreaming ? 'animate-pulse' : ''} />
          </div>
          <span className="font-semibold text-emerald-300 shrink-0">
            {agent}
          </span>
          <span className="text-stone-400 font-normal truncate max-w-[200px] sm:max-w-xs">
            {isStreaming ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                {latestThought}
              </span>
            ) : (
              `Thought process (${steps.length} steps)`
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-stone-400 shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400/80">
            {isOpen ? 'Hide' : 'Inspect'}
          </span>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </button>

      {/* Expandable Step-by-Step Timeline */}
      {isOpen && (
        <div className="px-3.5 py-2.5 border-t border-emerald-500/10 bg-black/30 space-y-2 animate-in fade-in duration-150">
          {steps.map((st, idx) => {
            const thoughtText = typeof st === 'string' ? st : st.thought;
            return (
              <div key={idx} className="flex items-start gap-2.5 text-stone-300">
                <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                <span className="leading-relaxed font-mono text-[11px] text-emerald-100/90">
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
