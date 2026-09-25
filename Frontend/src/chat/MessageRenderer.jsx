/**
 * Devbhoomi Conversational AI - Message Renderer
 * Inspired by langchain-ai/agent-chat-ui
 */

import React, { useState } from 'react';
import { Copy, Check, Sparkles, User, ShieldAlert, Compass, Calendar, DollarSign, Flame, Home, MapPin } from 'lucide-react';
import AgentThinking from './AgentThinking.jsx';

export default function MessageRenderer({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-3 px-2 sm:px-4">
        <div className="max-w-[85%] sm:max-w-xl rounded-2xl rounded-tr-sm bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-600 text-white p-3.5 sm:p-4 shadow-lg shadow-emerald-950/40 text-sm sm:text-base leading-relaxed break-words font-medium">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex justify-start my-3 px-2 sm:px-4">
      <div className="w-full max-w-[95%] sm:max-w-3xl rounded-2xl rounded-tl-sm bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-4 sm:p-5 shadow-2xl text-stone-200">
        
        {/* Agent Metadata Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles size={11} />
            </div>
            <span className="font-semibold text-emerald-300">
              {message.agent || 'Devbhoomi Companion'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy message"
            className="p-1 rounded hover:bg-white/5 text-stone-500 hover:text-stone-300 transition-colors"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>

        {/* Agent Thinking Accordion */}
        {message.thinking && message.thinking.length > 0 && (
          <AgentThinking agent={message.agent} steps={message.thinking} />
        )}

        {/* Formatted Markdown Message Content */}
        <div className="prose prose-invert prose-emerald max-w-none text-sm sm:text-base leading-relaxed space-y-2.5">
          {message.content.split('\n\n').map((paragraph, pIdx) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={pIdx} className="text-base sm:text-lg font-bold text-emerald-200 mt-3 mb-1.5 flex items-center gap-2">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('**Day ')) {
              return (
                <div key={pIdx} className="p-3 my-2 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-100">
                  <div className="font-bold text-emerald-300 text-sm mb-1">{paragraph.split('\n')[0]}</div>
                  <div className="text-xs text-stone-300 space-y-1">{paragraph.split('\n').slice(1).join('\n')}</div>
                </div>
              );
            }
            return (
              <p key={pIdx} className="text-stone-200 leading-relaxed font-normal">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Rich Entity Display (Stays, Itineraries, or Safety if present) */}
        {message.data?.stays?.stays && (
          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <Home size={13} /> Verified Mountain Stays
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {message.data.stays.stays.slice(0, 4).map((stay, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-1">
                  <div className="font-semibold text-emerald-200">{stay.name}</div>
                  <div className="text-stone-400 flex items-center gap-1"><MapPin size={10} /> {stay.location}</div>
                  <div className="text-emerald-400 font-bold">{stay.pricePerNight}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
