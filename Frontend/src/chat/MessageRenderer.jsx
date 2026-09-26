/**
 * Devbhoomi Conversational AI - Message Renderer
 * Minimalist, high-craft message display: White + Emerald Green theme,
 * crisp markdown, zero clutter, concise structured cards.
 */

import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Sparkles, 
  User, 
  Calendar, 
  Home, 
  MapPin
} from 'lucide-react';
import AgentThinking from './AgentThinking.jsx';

export default function MessageRenderer({ message, onSendPrompt: _onSendPrompt = () => {} }) {
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
      <div className="flex justify-end my-2 px-1 sm:px-2">
        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-lg">
          <div className="rounded-2xl rounded-tr-xs bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white px-4 py-2.5 sm:px-4.5 sm:py-3 shadow-md shadow-emerald-950/40 text-xs sm:text-sm leading-relaxed break-words font-medium border border-emerald-400/30">
            {message.content}
          </div>
          <div className="w-5 h-5 rounded-full bg-emerald-800/70 border border-emerald-400/30 text-emerald-200 flex items-center justify-center text-[10px] shrink-0 mb-1">
            <User size={11} />
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message - Minimalist Himalayan Slate + Emerald Glass
  return (
    <div className="flex justify-start my-2.5 px-1 sm:px-2">
      <div className="w-full max-w-[98%] sm:max-w-2xl rounded-2xl rounded-tl-xs bg-[#08150d]/90 border border-emerald-500/20 backdrop-blur-xl p-3.5 sm:p-4.5 shadow-xl text-stone-100 relative overflow-hidden">
        
        {/* Top Minimal Header */}
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.06] text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles size={11} />
            </div>
            <span className="font-semibold text-white text-xs">
              {message.agent || 'Pahadi Copilot'}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/20 font-medium">
              Verified Grounded
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy message"
            className="p-1 rounded-md hover:bg-white/[0.08] text-stone-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>
        </div>

        {/* Optional Thinking Accordion */}
        {message.thinking && message.thinking.length > 0 && (
          <div className="mb-2.5">
            <AgentThinking agent={message.agent} steps={message.thinking} />
          </div>
        )}

        {/* Clean, Concise Message Body */}
        <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-stone-100 font-normal">
          {message.content.split('\n\n').map((paragraph, pIdx) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            // Section Headings
            if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
              const headingText = trimmed.replace(/^###?\s+/, '');
              return (
                <h4 key={pIdx} className="text-xs sm:text-sm font-bold text-emerald-300 mt-2.5 mb-1 flex items-center gap-1.5 border-l-2 border-emerald-400 pl-2">
                  {headingText}
                </h4>
              );
            }

            // Day Plan Summary Cards
            if (trimmed.startsWith('**Day ') || trimmed.startsWith('Day ')) {
              const lines = trimmed.split('\n');
              const dayTitle = lines[0].replace(/\*\*/g, '');
              const dayContent = lines.slice(1).join('\n');
              return (
                <div key={pIdx} className="p-3 my-1.5 rounded-xl bg-white/[0.03] border border-emerald-500/20 text-stone-100 shadow-xs space-y-1">
                  <div className="font-semibold text-emerald-300 text-xs flex items-center gap-1.5">
                    <Calendar size={12} className="text-emerald-400" />
                    <span>{dayTitle}</span>
                  </div>
                  {dayContent && (
                    <div className="text-[11px] sm:text-xs text-stone-300 leading-relaxed pl-4 whitespace-pre-line font-normal">
                      {renderFormattedText(dayContent)}
                    </div>
                  )}
                </div>
              );
            }

            // Clean Bullet Lists
            if (trimmed.includes('\n- ') || trimmed.includes('\n* ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              const items = trimmed.split(/\n[-*]\s+/).filter(Boolean);
              return (
                <ul key={pIdx} className="space-y-1 my-1 pl-1">
                  {items.map((item, iIdx) => (
                    <li key={iIdx} className="flex items-start gap-2 text-stone-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{renderFormattedText(item)}</span>
                    </li>
                  ))}
                </ul>
              );
            }

            // Standard Clean Paragraph
            return (
              <p key={pIdx} className="text-stone-100 leading-relaxed font-normal">
                {renderFormattedText(trimmed)}
              </p>
            );
          })}
        </div>

        {/* Rich Stays Micro-Cards (Compact) */}
        {message.data?.stays?.stays && message.data.stays.stays.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-white/[0.08]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Home size={11} /> Verified Local Stays
              </span>
              <span className="text-[9px] text-stone-400 font-normal">Direct Local Host</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {message.data.stays.stays.slice(0, 2).map((stay, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-white/[0.02] hover:bg-emerald-950/20 border border-white/[0.07] hover:border-emerald-500/30 text-xs space-y-0.5 transition-all">
                  <div className="font-medium text-white truncate">{stay.name}</div>
                  <div className="text-stone-400 text-[10px] flex items-center gap-1">
                    <MapPin size={9} className="text-emerald-400 shrink-0" /> 
                    <span className="truncate">{stay.location || stay.district || 'Uttarakhand'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-emerald-400 font-semibold text-[11px]">{stay.pricePerNight || '₹1,500/night'}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Helper to format bold **text** into clean highlighted white/emerald elements
function renderFormattedText(text) {
  if (typeof text !== 'string') return text;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
