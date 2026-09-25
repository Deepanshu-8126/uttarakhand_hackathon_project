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
      <div className="bg-white border border-stone-200/90 rounded-[28px] p-6 sm:p-10 shadow-lg shadow-emerald-950/5 relative overflow-hidden">
        {/* Soft emerald ambient accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#E8F5E9]/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Review Verification Architecture (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-[#E8F5E9] text-[#0f3d2e] border border-emerald-300 shadow-xs">
                  VISITOR FEEDBACK • WEB3 VERIFIED
                </span>
                <span className="text-xs text-stone-500 font-semibold flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-emerald-700" />
                  Zero Paid or Fake Reviews
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                How was your Uttarakhand experience?
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl font-normal">
                Unlike traditional travel sites where anyone can post unverified reviews, Discovery Uttarakhand uses a <strong>GPS Trail + Web3 Proof-of-Trek</strong> system. Only explorers who physically complete the trail unlock review privileges.
              </p>
            </div>

            {/* 3-Step Verification Pipeline Card */}
            <div className="bg-[#f8faf9] border border-emerald-100/90 p-5 sm:p-6 rounded-[22px] space-y-4 shadow-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block">
                Proof-of-Trek Verification Pipeline
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white border border-stone-200/80 p-4 rounded-2xl shadow-xs hover:border-emerald-300 transition-all">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#0f3d2e] flex items-center justify-center font-black text-[11px] mb-2 border border-emerald-300">
                    1
                  </span>
                  <p className="text-xs font-black text-slate-900">GPS Trail Check</p>
                  <span className="text-[11px] text-stone-500 mt-1 block leading-snug">
                    8.4km tracked + Waypoint photos
                  </span>
                </div>

                <div className="bg-white border border-stone-200/80 p-4 rounded-2xl shadow-xs hover:border-emerald-300 transition-all">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-black text-[11px] mb-2 border border-teal-300">
                    2
                  </span>
                  <p className="text-xs font-black text-slate-900">Authenticity Check</p>
                  <span className="text-[11px] text-stone-500 mt-1 block leading-snug">
                    On-trail physical presence verified
                  </span>
                </div>

                <div className="bg-white border border-stone-200/80 p-4 rounded-2xl shadow-xs hover:border-emerald-300 transition-all">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-black text-[11px] mb-2 border border-amber-300">
                    3
                  </span>
                  <p className="text-xs font-black text-slate-900">Verified Mint &amp; Coins</p>
                  <span className="text-[11px] text-stone-500 mt-1 block leading-snug">
                    +50 DevBhoomi Coins rewarded
                  </span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <Link
                to="/review/kedarnath-yatra-a"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0f3d2e] hover:bg-[#164e3c] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
              >
                <Sparkles size={16} className="text-emerald-300" />
                <span>Submit Verified Review (Web3) →</span>
              </Link>

              <Link
                to="/reviews"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-slate-800 border border-stone-200/90 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                <span>Browse All On-Chain Reviews</span>
                <ArrowRight size={14} className="text-stone-400" />
              </Link>
            </div>
          </div>

          {/* Right Column: Live Spotlight Verified Reviews (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Live Verified Feed
              </span>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
                Polygon Block #4829104
              </span>
            </div>

            <div className="space-y-3.5">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="bg-white border border-stone-200/90 hover:border-emerald-300 p-4 sm:p-5 rounded-2xl transition-all shadow-xs hover:shadow-md space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900">{rev.user.name}</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#E8F5E9] text-[#0f3d2e] border border-emerald-300">
                          <CheckCircle2 size={10} className="text-emerald-700" /> VERIFIED
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-stone-500 block mt-0.5">
                        {rev.tripName} • {rev.trailDist}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={11} className="fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-stone-500 border-t border-stone-100 pt-2.5">
                    <span className="font-mono text-emerald-800 flex items-center gap-1 font-semibold">
                      <MapPin size={11} className="text-emerald-700" />
                      {rev.coords}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Coins size={12} className="text-amber-600" /> +{rev.coins} Coins
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Small Trust Seal */}
            <div className="bg-[#f8faf9] border border-emerald-100/90 p-3.5 rounded-2xl flex items-center justify-between text-[11px] text-stone-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Award size={14} className="text-emerald-700" />
                <span>Smart Contract Address:</span>
              </span>
              <span className="font-mono text-emerald-800 font-bold bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                0x9320...4821
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
