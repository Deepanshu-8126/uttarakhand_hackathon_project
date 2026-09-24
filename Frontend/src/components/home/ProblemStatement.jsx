import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Radio, 
  Users, 
  ArrowRight,
  Sparkles,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * DevbhoomiTravelStandard / ProblemStatement
 * High-Impact, Side-by-Side Trust Infrastructure:
 * Explains clearly why standard platforms fail in mountains and how Discovery Uttarakhand protects travelers.
 */
export default function ProblemStatement() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 font-sans" id="why-us">
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-stone-200/90 shadow-sm flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">
        
        {/* ── Left Column: Clean Overview for Judge & Travelers ── */}
        <div className="lg:w-[38%] flex flex-col justify-between space-y-6">
          <div className="space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0f3d2e] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>The Devbhoomi Standard</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight leading-tight">
              Safer Mountain Travel. Zero Booking Fraud.
            </h2>

            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Standard booking apps fail in the Himalayas with fake photos, sudden pass closures, and advance payment scams. We built a 4-pillar trust standard designed for high-altitude travel.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100">
            <div className="p-3.5 bg-[#fdfbf7] rounded-2xl border border-stone-200/70">
              <div className="text-xl font-black text-[#0f3d2e]">100%</div>
              <div className="text-[11px] font-semibold text-stone-500">Escrow Protected</div>
            </div>
            <div className="p-3.5 bg-[#fdfbf7] rounded-2xl border border-stone-200/70">
              <div className="text-xl font-black text-[#0f3d2e]">3-Layer</div>
              <div className="text-[11px] font-semibold text-stone-500">GPS & Video KYC</div>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Link 
              to="/trip-planner"
              className="inline-flex items-center gap-2 bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-xs transition-all group"
            >
              <span>Plan Verified Journey</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ── Right Column: 4 Simple Standard Guarantee Cards (2x2 Grid) ── */}
        <div className="lg:w-[62%] grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Pillar 1: Escrow & OTP Handover */}
          <div className="p-4.5 rounded-2xl bg-[#fdfbf7] border border-stone-200/80 hover:border-emerald-600/40 hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-[#0f3d2e] flex items-center justify-center">
                <Lock size={18} />
              </div>
              <h3 className="font-bold text-sm text-stone-900">1. Escrow & OTP Handover</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Your payment stays safely in escrow. Hosts & bike rentals get paid only after you arrive and give OTP check-in.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-200/60 text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-700" /> Zero Advance Scam Risk
            </div>
          </div>

          {/* Pillar 2: 3-Layer Verified Stays */}
          <div className="p-4.5 rounded-2xl bg-[#fdfbf7] border border-stone-200/80 hover:border-cyan-600/40 hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-100/80 text-cyan-900 flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
              <h3 className="font-bold text-sm text-stone-900">2. 3-Layer Verified Stays</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Every homestay and camp is verified with EXIF GPS coordinates, 10s video KYC of rooms, and host verification.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-200/60 text-[10px] font-bold text-cyan-800 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 size={12} className="text-cyan-700" /> 100% Real Physical Stays
            </div>
          </div>

          {/* Pillar 3: Valley Weather & Pass Alerts */}
          <div className="p-4.5 rounded-2xl bg-[#fdfbf7] border border-stone-200/80 hover:border-amber-600/40 hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                <Radio size={18} />
              </div>
              <h3 className="font-bold text-sm text-stone-900">3. Real-Time Pass Advisories</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Hyper-local weather telemetry and ground reports for landslide-prone mountain routes before you step onto the trail.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-200/60 text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 size={12} className="text-amber-700" /> Ground-Truth Route Alerts
            </div>
          </div>

          {/* Pillar 4: Certified Native Guides */}
          <div className="p-4.5 rounded-2xl bg-[#fdfbf7] border border-stone-200/80 hover:border-rose-600/40 hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-rose-100/80 text-rose-900 flex items-center justify-center">
                <Users size={18} />
              </div>
              <h3 className="font-bold text-sm text-stone-900">4. Certified Native Guides</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Direct booking with certified Pahadi guides and local trek leaders with fair local pricing and zero middleman commissions.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-200/60 text-[10px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 size={12} className="text-rose-700" /> Direct Pahadi Community
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
