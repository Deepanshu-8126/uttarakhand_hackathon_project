import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, ShieldCheck, CheckCircle2, Sparkles, Award, Coins, 
  MapPin, ExternalLink, ArrowRight, Lock, Check
} from 'lucide-react';

const VERIFIED_SPOTLIGHT_REVIEWS = [
  {
    _id: 'v-1',
    user: { name: 'Rohan Sharma', wallet: '0x3F8a...92bC', role: 'Alpine Trekker' },
    tripName: 'Kedarnath High Trail',
    trailDist: '8.4 km GPS Tracked',
    rating: 5,
    ratingLabel: 'Divine 🙏',
    comment: 'Trek was genuinely verified on GPS. Early morning weather was clear near Bhairavnath. Our guide Sundar had emergency medical kit and oxygen canister. The trail is clean if you stick to the mule-free bypass path.',
    coins: 50,
    txHash: '0x8f2a...8234',
    coords: '30.7352° N, 79.0669° E'
  },
  {
    _id: 'v-2',
    user: { name: 'Dr. Ananya Joshi', wallet: '0x71Ce...B490', role: 'Family Pilgrim' },
    tripName: 'Tungnath - Chandrashila',
    trailDist: '5.2 km GPS Tracked',
    rating: 5,
    ratingLabel: 'Divine 🙏',
    comment: 'The offline trail tracking is a life saver because mobile network drops before Chopta meadow. AI route predicted cloud cover with 90% accuracy. The paved stone pathway is steep but well managed by local panchayat.',
    coins: 50,
    txHash: '0x3c71...4120',
    coords: '30.4889° N, 79.2173° E'
  }
];

export default function ReviewSection({ targetId = 'general', targetType = 'site' }) {
  const [reviews] = useState(VERIFIED_SPOTLIGHT_REVIEWS);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans" id="reviews">
      <div className="bg-[#0A0E14] border border-[#1F293D] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00FF88]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Web3 + AI Review Verification Architecture (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-950 text-[#00FF88] border border-[#00FF88]/40 shadow-[0_0_12px_rgba(0,255,136,0.25)]">
                  VISITOR FEEDBACK • WEB3 VERIFIED
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <ShieldCheck size={14} className="text-[#00FF88]" />
                  Zero Paid or Fake Reviews
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                How was your Uttarakhand experience?
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Unlike traditional travel sites where anyone can post fake reviews, Discovery Uttarakhand uses a <strong>GPS + AI + Web3 Proof-of-Trek</strong> system. Only explorers who physically complete the trail unlock review privileges.
              </p>
            </div>

            {/* 3-Step Verification Pipeline Card */}
            <div className="bg-[#151A26] border border-[#1F293D] p-5 sm:p-6 rounded-2xl space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Proof-of-Trek Verification Pipeline
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#0A0E14] border border-[#1F293D] p-3.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-[#00FF88]/20 text-[#00FF88] flex items-center justify-center font-bold text-[10px] mb-2 border border-[#00FF88]/40">
                    1
                  </span>
                  <p className="text-xs font-black text-white">GPS Trail Check</p>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    8.4km tracked + Waypoint photos
                  </span>
                </div>

                <div className="bg-[#0A0E14] border border-[#1F293D] p-3.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px] mb-2 border border-emerald-400/40">
                    2
                  </span>
                  <p className="text-xs font-black text-white">AI Spam Filter</p>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Semantic authenticity score &gt; 98%
                  </span>
                </div>

                <div className="bg-[#0A0E14] border border-[#1F293D] p-3.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] mb-2 border border-amber-400/40">
                    3
                  </span>
                  <p className="text-xs font-black text-white">NFT Mint &amp; Coins</p>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    +50 DevBhoomi Coins rewarded
                  </span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
              <Link
                to="/review/kedarnath-yatra-a"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-[#00FF88] to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all cursor-pointer active:scale-98"
              >
                <Sparkles size={16} className="text-slate-950" />
                <span>Submit Verified Review (Web3) →</span>
              </Link>

              <Link
                to="/reviews"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#151A26] hover:bg-[#1a2233] text-white border border-[#1F293D] font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <span>Browse All On-Chain Reviews</span>
                <ArrowRight size={14} className="text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Right Column: Live Spotlight Verified Reviews (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                Live Verified Feed
              </span>
              <span className="text-[11px] font-mono text-[#00FF88]">
                Polygon Block #4829104
              </span>
            </div>

            <div className="space-y-3.5">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="bg-[#151A26] border border-[#1F293D] hover:border-[#00FF88]/50 p-4 sm:p-5 rounded-2xl transition-all shadow-md space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-white">{rev.user.name}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/40">
                          <CheckCircle2 size={10} /> VERIFIED
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        {rev.tripName} • {rev.trailDist}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={11} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-[#1F293D]/80 pt-2.5">
                    <span className="font-mono text-[#00FF88] flex items-center gap-1">
                      <MapPin size={10} />
                      {rev.coords}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-400">
                      <Coins size={12} /> +{rev.coins} Coins
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Small Trust Seal */}
            <div className="bg-[#151A26]/60 border border-[#1F293D] p-3 rounded-xl flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Award size={14} className="text-[#00FF88]" />
                <span>Smart Contract Address:</span>
              </span>
              <span className="font-mono text-emerald-400">0x9320...4821</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
