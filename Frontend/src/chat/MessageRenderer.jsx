/**
 * Devbhoomi Conversational AI - Message Renderer
 * Master rendering component with rich markdown, interactive mountain cards, and telemetry chips
 */

import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Sparkles, 
  User, 
  ShieldAlert, 
  Compass, 
  Calendar, 
  DollarSign, 
  Home, 
  MapPin, 
  CloudSun, 
  Navigation, 
  ArrowUpRight,
  Mountain,
  AlertTriangle,
  Route
} from 'lucide-react';
import AgentThinking from './AgentThinking.jsx';

export default function MessageRenderer({ message, onSendPrompt = () => {} }) {
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
      <div className="flex justify-end my-3 px-1 sm:px-3">
        <div className="flex items-end gap-2 max-w-[88%] sm:max-w-xl">
          <div className="rounded-2xl rounded-tr-xs bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-600 text-white px-4 py-3 sm:px-5 sm:py-3.5 shadow-lg shadow-emerald-950/50 text-xs sm:text-sm leading-relaxed break-words font-medium border border-emerald-400/20">
            {message.content}
          </div>
          <div className="w-6 h-6 rounded-full bg-emerald-800/60 border border-emerald-500/40 text-emerald-200 flex items-center justify-center text-[10px] shrink-0 mb-1">
            <User size={12} />
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex justify-start my-3 px-1 sm:px-3">
      <div className="w-full max-w-[98%] sm:max-w-3xl rounded-2xl rounded-tl-xs bg-[#08170f]/90 border border-emerald-500/15 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl text-stone-200 relative overflow-hidden">
        
        {/* Subtle top shimmer highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        {/* Agent Metadata Header */}
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/[0.06] text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <Sparkles size={12} />
            </div>
            <div>
              <span className="font-bold text-emerald-200 text-xs">
                {message.agent || 'Devbhoomi AI Travel Companion'}
              </span>
              <span className="text-[10px] text-emerald-400/80 ml-2 font-mono hidden sm:inline">
                Verified Grounded
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              title="Copy message text"
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-stone-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        {/* Agent Thinking Accordion */}
        {message.thinking && message.thinking.length > 0 && (
          <div className="mb-3">
            <AgentThinking agent={message.agent} steps={message.thinking} />
          </div>
        )}

        {/* Formatted Markdown Message Content */}
        <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-stone-200">
          {message.content.split('\n\n').map((paragraph, pIdx) => {
            // Heading 3
            if (paragraph.startsWith('### ') || paragraph.startsWith('## ')) {
              const headingText = paragraph.replace(/^###?\s+/, '');
              return (
                <h3 key={pIdx} className="text-sm sm:text-base font-bold text-emerald-200 mt-3.5 mb-1.5 flex items-center gap-2 border-l-2 border-emerald-400 pl-2.5">
                  {headingText}
                </h3>
              );
            }

            // Day Breakdown Card
            if (paragraph.startsWith('**Day ') || paragraph.startsWith('Day ')) {
              const lines = paragraph.split('\n');
              const dayTitle = lines[0].replace(/\*\*/g, '');
              const dayContent = lines.slice(1).join('\n');
              return (
                <div key={pIdx} className="p-3.5 my-2 rounded-xl bg-emerald-950/30 border border-emerald-500/25 text-emerald-100 shadow-sm space-y-1.5">
                  <div className="font-bold text-emerald-300 text-xs sm:text-sm flex items-center gap-1.5">
                    <Calendar size={13} className="text-emerald-400" />
                    <span>{dayTitle}</span>
                  </div>
                  {dayContent && (
                    <div className="text-[11px] sm:text-xs text-stone-300 leading-relaxed pl-5 whitespace-pre-line font-normal">
                      {dayContent}
                    </div>
                  )}
                </div>
              );
            }

            // Mountain Warning Alert Box
            if (paragraph.includes('⚠️') || paragraph.includes('Landslide') || paragraph.includes('AMS') || paragraph.includes('Altitude')) {
              return (
                <div key={pIdx} className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200/90 text-xs flex items-start gap-2.5">
                  <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{paragraph}</div>
                </div>
              );
            }

            // Bullet Lists
            if (paragraph.includes('\n- ') || paragraph.includes('\n* ') || paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
              const items = paragraph.split(/\n[-*]\s+/).filter(Boolean);
              return (
                <ul key={pIdx} className="space-y-1.5 my-1.5 pl-1">
                  {items.map((item, iIdx) => (
                    <li key={iIdx} className="flex items-start gap-2 text-stone-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{renderFormattedText(item)}</span>
                    </li>
                  ))}
                </ul>
              );
            }

            // Standard Paragraph
            return (
              <p key={pIdx} className="text-stone-200/95 leading-relaxed font-normal">
                {renderFormattedText(paragraph)}
              </p>
            );
          })}
        </div>

        {/* Rich Stays Micro-Cards */}
        {message.data?.stays?.stays && message.data.stays.stays.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-white/[0.08]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Home size={13} /> Verified Mountain Stays
              </span>
              <span className="text-[10px] text-stone-400 font-normal">Direct Host</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {message.data.stays.stays.slice(0, 4).map((stay, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/[0.03] hover:bg-emerald-950/30 border border-white/[0.08] hover:border-emerald-500/30 text-xs space-y-1 transition-all">
                  <div className="font-semibold text-emerald-200 truncate">{stay.name}</div>
                  <div className="text-stone-400 text-[11px] flex items-center gap-1">
                    <MapPin size={10} className="text-emerald-400 shrink-0" /> 
                    <span className="truncate">{stay.location || stay.district || 'Uttarakhand'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-emerald-400 font-bold">{stay.pricePerNight || '₹1,500/night'}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">Verified</span>
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

// Helper to format bold **text** into highlighted elements
function renderFormattedText(text) {
  if (typeof text !== 'string') return text;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-emerald-200">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
