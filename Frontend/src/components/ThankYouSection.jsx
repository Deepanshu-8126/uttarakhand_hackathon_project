import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShieldCheck, Compass, Sparkles } from 'lucide-react';

/**
 * JourneyPlannerSection / ThankYouSection
 * High-impact trip planning banner matching Discovery Uttarakhand theme
 */
export default function ThankYouSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 font-sans" id="planner">
      <div className="bg-[#0f2a22] text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10 border border-emerald-900/50">
        
        {/* Glow backdrop decoration */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-xl space-y-5 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-3.5 py-1 rounded-full border border-emerald-500/30 inline-flex items-center gap-1.5">
            <Sparkles size={13} className="text-emerald-400" />
            Ready To Explore
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Build Your Uttarakhand Journey
          </h2>

          <p className="text-white/80 text-sm sm:text-base font-normal leading-relaxed">
            Save time & stress with our smart itinerary builder. Get custom permits, curated stays, and verified mountain guides instantly.
          </p>

          <div className="flex flex-wrap items-center gap-5 pt-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-emerald-100">Instant Permit Approval</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-emerald-100">24/7 Rescue Desk</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full lg:w-auto flex-shrink-0">
          <Link
            to="/trip-planner"
            className="w-full lg:w-auto px-8 py-4.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#0f2a22] font-black text-center shadow-xl hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-3 text-base group"
          >
            <span>Plan My Trip</span>
            <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
