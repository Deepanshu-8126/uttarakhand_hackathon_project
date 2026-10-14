import React from 'react';
import { ChevronDown, ChevronRight, Zap, MapPin, Shield, Clock } from 'lucide-react';

const AGENT_ICONS = {
  planner: <MapPin size={12} />,
  safety: <Shield size={12} />,
  budget: <Zap size={12} />,
  default: <Clock size={12} />,
};

export default function AgentThinking({ steps = [], activeAgent }) {
  const [expanded, setExpanded] = React.useState(false);

  if (!activeAgent && steps.length === 0) return null;

  return (
    <div className="my-2 mx-1">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-1.5 text-[11px] text-stone-400 hover:text-stone-200 transition group"
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {activeAgent ? (
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {activeAgent} thinking…
          </span>
        ) : (
          <span>{steps.length} reasoning step{steps.length !== 1 ? 's' : ''}</span>
        )}
      </button>

      {expanded && steps.length > 0 && (
        <div className="mt-1.5 ml-3 border-l border-stone-700 pl-3 space-y-1">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[10px] text-stone-400">
              <span className="mt-0.5 text-emerald-500 flex-shrink-0">
                {AGENT_ICONS[step.agent] || AGENT_ICONS.default}
              </span>
              <span>{step.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
