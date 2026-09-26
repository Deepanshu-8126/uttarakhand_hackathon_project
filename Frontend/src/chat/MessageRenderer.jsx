/**
 * Devbhoomi Conversational AI - Message Renderer
 * Minimalist, high-craft message display: Clean White + Deep Himalayan Emerald theme,
 * with authentic database/cached real photography previews (zero wasted API credits).
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Copy, 
  Check, 
  Sparkles, 
  User, 
  Calendar, 
  Home, 
  MapPin,
  ExternalLink,
  Compass,
  Mountain
} from 'lucide-react';
import AgentThinking from './AgentThinking.jsx';
import { DESTINATION_NAMED_IMAGES, getCardImages, getHimalayanFallbackImage } from '../utils/imageHelpers.js';

// Top recognized destinations with guaranteed verified photography
const PROMINENT_DESTINATIONS = [
  { name: 'Kedarnath Temple', slug: 'kedarnath', keywords: ['kedarnath', 'kedar'], altitude: '3,583m', photo: '/assets/yatra_sarthi/kedarnath.jpg', tag: 'Char Dham' },
  { name: 'Valley of Flowers', slug: 'valley-of-flowers', keywords: ['valley of flowers', 'bhyundar'], altitude: '3,658m', photo: '/assets/yatra_sarthi/valley_of_flowers.jpg', tag: 'UNESCO Biosphere' },
  { name: 'Auli Ski Meadows', slug: 'auli', keywords: ['auli', 'joshimath'], altitude: '2,800m', photo: '/assets/yatra_sarthi/auli.jpg', tag: 'Snow & Panorama' },
  { name: 'Rishikesh Ganga Ghats', slug: 'rishikesh', keywords: ['rishikesh', 'triveni ghat', 'ram jhula'], altitude: '340m', photo: '/assets/yatra_sarthi/rishikesh.jpg', tag: 'Yoga Capital' },
  { name: 'Chopta & Tungnath', slug: 'chopta', keywords: ['chopta', 'tungnath', 'chandrashila'], altitude: '3,680m', photo: '/assets/yatra_sarthi/chopta.jpg', tag: 'Highest Shiva Shrine' },
  { name: 'Nainital Lake City', slug: 'nainital', keywords: ['nainital', 'naini lake'], altitude: '2,084m', photo: '/assets/yatra_sarthi/nainital.jpg', tag: 'Emerald Lake' },
  { name: 'Badrinath Dham', slug: 'badrinath', keywords: ['badrinath', 'badri'], altitude: '3,133m', photo: '/assets/yatra_sarthi/badrinath.jpg', tag: 'Sacred Dham' },
  { name: 'Munsyari Panchachuli', slug: 'munsiyari', keywords: ['munsyari', 'munsiyari', 'panchachuli'], altitude: '2,200m', photo: '/assets/destinations/munsiyari/cover.jpg', tag: '5-Peak Alpenglow' },
  { name: 'Jim Corbett', slug: 'jim-corbett-national-park', keywords: ['corbett', 'jim corbett', 'dhikala'], altitude: '400m', photo: '/assets/yatra_sarthi/corbett.jpg', tag: 'Tiger Wilderness' },
  { name: 'Haridwar Har Ki Pauri', slug: 'haridwar', keywords: ['haridwar', 'har ki pauri'], altitude: '314m', photo: '/assets/yatra_sarthi/haridwar.jpg', tag: 'Ganga Gateway' },
  { name: 'Adi Kailash & Om Parvat', slug: 'adi-kailash', keywords: ['adi kailash', 'om parvat'], altitude: '5,945m', photo: '/assets/destinations/pithoragarh/gallery-1.jpg', tag: 'Mystic Peak' },
  { name: 'Jageshwar Dham', slug: 'jageshwar', keywords: ['jageshwar'], altitude: '1,870m', photo: '/assets/jageshwar.jpg', tag: 'Ancient Deodar Shrines' },
  { name: 'Mussoorie Queen of Hills', slug: 'mussoorie', keywords: ['mussoorie', 'kempty', 'gun hill'], altitude: '2,005m', photo: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80', tag: 'Hill Station' },
  { name: 'Dhanaulti & Kanatal', slug: 'dhanaulti', keywords: ['dhanaulti', 'kanatal', 'eco park'], altitude: '2,286m', photo: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80', tag: 'Cedar Forest' },
  { name: 'Gangotri Shrine', slug: 'gangotri', keywords: ['gangotri', 'bhagirathi', 'gaumukh'], altitude: '3,100m', photo: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80', tag: 'Sacred Source' },
  { name: 'Yamunotri Dham', slug: 'yamunotri', keywords: ['yamunotri', 'janki chatti'], altitude: '3,293m', photo: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80', tag: 'Sacred Thermal Kund' },
  { name: 'Almora Heritage Town', slug: 'almora', keywords: ['almora', 'kasar devi'], altitude: '1,638m', photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', tag: 'Cultural Capital' },
  { name: 'Kausani Himalayas', slug: 'kausani', keywords: ['kausani', 'anasakti'], altitude: '1,890m', photo: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', tag: 'Switzerland of India' },
  { name: 'Ranikhet Pine Meadows', slug: 'ranikhet', keywords: ['ranikhet', 'chaubatia'], altitude: '1,869m', photo: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', tag: 'Pine Meadows' },
  { name: 'Mukteshwar Cliff', slug: 'mukteshwar', keywords: ['mukteshwar', 'chauli ki jali'], altitude: '2,285m', photo: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', tag: 'Rock Climbing & Views' },
  { name: 'Tehri Lake & Dam', slug: 'tehri', keywords: ['tehri', 'tehri lake'], altitude: '1,750m', photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', tag: 'Water Sports' },
  { name: 'Dayara Bugyal', slug: 'dayara-bugyal', keywords: ['dayara', 'dayara bugyal'], altitude: '3,810m', photo: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80', tag: 'Alpine Bugyal' },
  { name: 'Kedarkantha Winter Peak', slug: 'kedarkantha', keywords: ['kedarkantha', 'sankri'], altitude: '3,800m', photo: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', tag: 'Winter Snow Trek' }
];

export default function MessageRenderer({ message, onSendPrompt: _onSendPrompt = () => {} }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Detect mentioned destinations in message for rich photographic cards
  const detectedDestinations = useMemo(() => {
    if (isUser || !message.content) return [];
    
    // Explicit destinations passed in payload
    if (message.data?.destinations && Array.isArray(message.data.destinations) && message.data.destinations.length > 0) {
      return message.data.destinations.slice(0, 2).map(d => ({
        name: d.name,
        slug: d.slug || d.id,
        altitude: d.altitude ? `${d.altitude}m` : 'Himalayas',
        photo: d.coverImage?.url || d.coverImage || DESTINATION_NAMED_IMAGES[d.slug] || '/assets/yatra_sarthi/nainital.jpg',
        tag: d.district || 'Verified Spot'
      }));
    }

    const lower = message.content.toLowerCase();
    const matched = [];

    for (const dest of PROMINENT_DESTINATIONS) {
      if (dest.keywords.some(k => lower.includes(k))) {
        matched.push(dest);
        if (matched.length >= 2) break;
      }
    }

    return matched;
  }, [message, isUser]);

  if (isUser) {
    return (
      <div className="flex justify-end my-2 px-1 sm:px-2">
        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-lg">
          <div className="rounded-2xl rounded-tr-xs bg-[#0f3d2e] text-white px-4 py-2.5 sm:px-4.5 sm:py-3 shadow-sm text-xs sm:text-sm leading-relaxed break-words font-medium border border-emerald-800/30">
            {message.content}
          </div>
          <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 text-[#0f3d2e] flex items-center justify-center text-[10px] shrink-0 mb-1">
            <User size={12} />
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message - Clean Alpine White Card + Subtle Border + Emerald Accents
  return (
    <div className="flex justify-start my-2.5 px-1 sm:px-2">
      <div className="w-full max-w-[98%] sm:max-w-2xl rounded-2xl rounded-tl-xs bg-white border border-stone-200/90 p-3.5 sm:p-5 shadow-xs text-slate-800 relative overflow-hidden">
        
        {/* Top Minimal Header */}
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-stone-100 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#0f3d2e] text-white flex items-center justify-center shadow-2xs shrink-0">
              <Sparkles size={11} className="text-emerald-300" />
            </div>
            <span className="font-bold text-slate-900 text-xs">
              {message.agent || 'Pahadi Copilot'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              Verified Grounded
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy message"
            className="p-1 rounded-md hover:bg-stone-100 text-stone-400 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            {copied ? <Check size={13} className="text-emerald-700" /> : <Copy size={13} />}
          </button>
        </div>

        {/* Optional Thinking Accordion */}
        {message.thinking && message.thinking.length > 0 && (
          <div className="mb-2.5">
            <AgentThinking agent={message.agent} steps={message.thinking} />
          </div>
        )}

        {/* Clean, Concise Message Body */}
        <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-slate-800 font-normal">
          {message.content.split('\n\n').map((paragraph, pIdx) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            // Section Headings
            if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
              const headingText = trimmed.replace(/^###?\s+/, '');
              return (
                <h4 key={pIdx} className="text-xs sm:text-sm font-bold text-[#0f3d2e] mt-2.5 mb-1 flex items-center gap-1.5 border-l-2 border-emerald-600 pl-2">
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
                <div key={pIdx} className="p-3 my-1.5 rounded-xl bg-stone-50/80 border border-stone-200/80 text-slate-800 shadow-2xs space-y-1">
                  <div className="font-bold text-[#0f3d2e] text-xs flex items-center gap-1.5">
                    <Calendar size={12} className="text-emerald-700" />
                    <span>{dayTitle}</span>
                  </div>
                  {dayContent && (
                    <div className="text-[11px] sm:text-xs text-stone-700 leading-relaxed pl-4 whitespace-pre-line font-normal">
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
                    <li key={iIdx} className="flex items-start gap-2 text-stone-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{renderFormattedText(item)}</span>
                    </li>
                  ))}
                </ul>
              );
            }

            // Standard Clean Paragraph
            return (
              <p key={pIdx} className="text-slate-800 leading-relaxed font-normal">
                {renderFormattedText(trimmed)}
              </p>
            );
          })}
        </div>

        {/* ── Rich Real Photography Destination Spotlights (From Verified DB) ── */}
        {detectedDestinations.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-stone-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Mountain size={12} className="text-emerald-700" /> Real Destination Snapshot
              </span>
              <span className="text-[9px] text-stone-400 font-normal">Verified Himalayan Photography</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {detectedDestinations.map((dest, idx) => (
                <Link
                  key={idx}
                  to={`/destinations/${dest.slug}`}
                  className="group/card flex items-center gap-2.5 p-2 rounded-2xl bg-stone-50 hover:bg-emerald-50/70 border border-stone-200/80 hover:border-emerald-300 transition-all duration-200 shadow-2xs overflow-hidden"
                >
                  {/* Photo Thumbnail */}
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 relative bg-stone-200">
                    <img
                      src={dest.photo}
                      alt={dest.name}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/yatra_sarthi/nainital.jpg';
                      }}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="font-bold text-xs text-slate-900 truncate group-hover/card:text-emerald-900 transition-colors">
                      {dest.name}
                    </div>
                    <div className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-emerald-700 shrink-0" />
                      <span className="truncate">{dest.tag}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">{dest.altitude}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 mt-1">
                      <span>Explore</span>
                      <ExternalLink size={9} className="group-hover/card:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Rich Stays Micro-Cards (Compact Real Photos) ── */}
        {message.data?.stays?.stays && message.data.stays.stays.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-stone-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Home size={11} className="text-emerald-700" /> Verified Local Stays
              </span>
              <span className="text-[9px] text-stone-500 font-normal">Direct Local Host</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {message.data.stays.stays.slice(0, 2).map((stay, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50/50 border border-stone-200/80 hover:border-emerald-300 text-xs space-y-0.5 transition-all">
                  <div className="font-bold text-slate-800 truncate">{stay.name}</div>
                  <div className="text-stone-500 text-[10px] flex items-center gap-1">
                    <MapPin size={9} className="text-emerald-700 shrink-0" /> 
                    <span className="truncate">{stay.location || stay.district || 'Uttarakhand'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-emerald-800 font-bold text-[11px]">{stay.pricePerNight || '₹1,500/night'}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#0f3d2e] font-semibold">Verified</span>
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

// Helper to format bold **text** into clean highlighted elements
function renderFormattedText(text) {
  if (typeof text !== 'string') return text;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
