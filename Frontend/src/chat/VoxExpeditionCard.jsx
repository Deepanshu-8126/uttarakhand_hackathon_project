import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Sparkles, Mountain, Shield, ShieldCheck, 
  Car, Home, Navigation, Share2, ArrowRight, ExternalLink, Star, Check 
} from 'lucide-react';

export default function VoxExpeditionCard({ data, content }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: data?.title || '4-Day Panchachuli Vista Expedition',
        text: content || 'Discover Uttarakhand Curated Expedition',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(content || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const title = data?.title || '4-Day Panchachuli Vista Expedition (Dehradun to Munsiyari)';
  const narrative = data?.narrative || "I've crafted an offbeat, high-altitude itinerary crossing the Kumaon ridge. This route combines scenic mountain passes, verified 4x4 Thar with certified local chauffeur, and quiet mountain homestays overlooking the five peaks of Panchachuli.";
  
  const metrics = data?.metrics || [
    { label: 'Total Distance', val: '585 km', sub: 'Scenic Ridge Route' },
    { label: 'Est. All-Inclusive Budget', val: '₹24,800', sub: 'Vehicle + 3 Stays + Fuel', highlight: true },
    { label: 'Terrain & Elevation', val: '2,748m peak', sub: 'Kalamuni Pass (Snow Ready)' }
  ];

  const waypoints = data?.waypoints || [
    {
      day: 'D1',
      title: 'Dehradun to Kausani via Almora Pine Forests',
      metric: '280 km • 8h',
      desc: 'Pass through Mohan tea gardens, Binsar wildlife ridge, and catch the sunset over Trishul peak.'
    },
    {
      day: 'D2',
      title: 'Kausani to Birthi Falls & Munsiyari',
      metric: '165 km • 6h',
      desc: 'Ascend Kalamuni Pass (2,748m) with panoramic views into Johar Valley and frozen Birthi water cascade.'
    },
    {
      day: 'D3',
      title: 'Khaliya Top Trek & Panchachuli Sunset',
      metric: 'Alpine Day',
      desc: 'Gentle 6 km rhododendron trail to Khaliya ridge with 360° Great Himalayan snow range vantage point.'
    }
  ];

  const fleet = data?.fleet || {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJMJEgm2IA0tZhGP9KQXyqq-DkNQEfn62QUdcW7oH0cN3jEaYnpVhKLUiGI-Pz3FKSJEaFv7YK7tZoF8YQq8mvx6JAvI3UdDNgeEcV1YmPXfkIUwJdAcib9eEmbpr_wJit-iYGV9xE0_Q2s4NtoFoaK1vScD9tpk04_-DQWQ-LtmYj-ABcaY8bM5bvfxCWGHOV6FSNglf5hG4I6Z_0g6ccplxGLvkBCDsH-R2BApnLKsVanvov6eBp',
    badge: 'Verified Fleet',
    price: '₹4,500 / day',
    title: 'Mahindra Thar 4x4 (Hard Top)',
    desc: 'Includes certified mountain chauffeur Rawat Ji (12 yrs experience on Kumaon passes) and snow chains.'
  };

  const stay = data?.stay || {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyUA786yYnyIa2PN_m9vXt0lyz9Zrxzv9nXkTI5E1Lh0nq1gunfrfn1WK5veEGfFOW1D0zaoQa0zMgX0Iwi7gjpFKNBPhCUfX8u2YL9wF2cRXxCbUlPYagETi2t3iVTxLfvx81YJH27SsJetV3xkIxb8dbF-Y_W6zMOtnimWAzs_dRHLw0UDr1Shb1sGaN9gaOqUouY_VvNgCKVB2AJV6I3_2rFZadqqqM9x8QFxS6anj_ns7GESAq',
    badge: 'Curated Homestay',
    rating: '4.9',
    price: '₹3,800 / night',
    title: 'Panchachuli Eco Stone Lodge',
    desc: 'Handcrafted mud-and-slate cottage with wood fire heating, hot water, and authentic Kumaoni farm meals.'
  };

  return (
    <div className="space-y-4 my-2 text-stone-900">
      
      {/* ── Title & Intro Narrative ── */}
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight leading-snug">
          {title}
        </h3>
        <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed font-normal">
          {narrative}
        </p>
      </div>

      {/* ── 3 Metrics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
        {metrics.map((m, idx) => (
          <div 
            key={idx} 
            className="bg-stone-50/90 rounded-xl p-3 border border-stone-200/80 shadow-2xs space-y-0.5"
          >
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              {m.label}
            </div>
            <div className={`text-base font-black tracking-tight ${m.highlight ? 'text-emerald-800' : 'text-stone-900'}`}>
              {m.val}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Curated Daily Waypoints ── */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">
          Curated Daily Waypoints
        </div>

        <div className="space-y-2">
          {waypoints.map((wp, idx) => (
            <div 
              key={idx}
              className="bg-stone-50/80 hover:bg-stone-100/80 rounded-xl p-3 sm:p-3.5 border border-stone-200/80 transition-colors flex items-start gap-3 shadow-2xs"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100/90 border border-emerald-300/80 flex items-center justify-center font-bold text-xs text-emerald-950 shrink-0 mt-0.5 shadow-2xs">
                {wp.day}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                    {wp.title}
                  </h4>
                  <span className="text-[11px] font-mono text-stone-500 shrink-0">
                    {wp.metric}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-600 font-normal leading-relaxed mt-1">
                  {wp.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Curated Fleet & Stay Cards (2 Columns) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        
        {/* Fleet Card */}
        <div className="bg-stone-50/90 rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs flex flex-col justify-between">
          <div className="relative h-32 w-full bg-stone-200 overflow-hidden">
            <img 
              src={fleet.img} 
              alt={fleet.title}
              onError={(e) => { e.currentTarget.src = '/assets/destinations/munsiyari/cover.jpg'; }}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-300 border border-white/20">
              {fleet.badge}
            </div>
            <div className="absolute bottom-2 right-2 bg-[#0f3d2e] px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white shadow-xs">
              {fleet.price}
            </div>
          </div>
          <div className="p-3 space-y-1">
            <div className="font-bold text-xs sm:text-sm text-stone-900">
              {fleet.title}
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              {fleet.desc}
            </p>
          </div>
        </div>

        {/* Stay Card */}
        <div className="bg-stone-50/90 rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs flex flex-col justify-between">
          <div className="relative h-32 w-full bg-stone-200 overflow-hidden">
            <img 
              src={stay.img} 
              alt={stay.title}
              onError={(e) => { e.currentTarget.src = '/assets/destinations/munsiyari/cover.jpg'; }}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-300 border border-white/20">
              {stay.badge}
            </div>
            <div className="absolute bottom-2 right-2 bg-[#0f3d2e] px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white shadow-xs">
              {stay.price}
            </div>
          </div>
          <div className="p-3 space-y-1">
            <div className="flex items-center justify-between">
              <div className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                {stay.title}
              </div>
              <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5 shrink-0">
                <Star size={11} className="fill-amber-500 text-amber-500" />
                <span>{stay.rating}</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              {stay.desc}
            </p>
          </div>
        </div>

      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap items-center gap-2 pt-1.5">
        <Link
          to="/planner"
          className="bg-[#0f3d2e] hover:bg-[#15543f] text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Calendar size={14} />
          <span>Reserve Expedition</span>
        </Link>

        <Link
          to="/map"
          className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border border-stone-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Navigation size={14} className="text-emerald-800" />
          <span>Open Route Map</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 px-3 py-2 rounded-xl text-xs transition-all border border-stone-200 flex items-center gap-1 cursor-pointer active:scale-95"
        >
          {copied ? <Check size={13} className="text-emerald-700" /> : <Share2 size={13} />}
          <span>{copied ? 'Copied' : 'Share'}</span>
        </button>
      </div>

    </div>
  );
}
