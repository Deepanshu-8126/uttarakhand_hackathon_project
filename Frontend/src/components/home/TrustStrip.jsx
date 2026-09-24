import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * Mountain Trust Protocol Section
 * Clean, high-contrast, zero-MMT negative tags.
 */
export default function TrustStrip() {
  return (
    <section className="w-full flex justify-center py-4 font-sans">
      <div className="w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] max-w-[1280px] bg-[#0f2a22] rounded-[24px] p-6 md:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center shadow-xl">

        {/* Left Title */}
        <div className="lg:w-[30%]">
          <div className="flex items-center gap-2 text-[#7ec8a0] text-[11px] font-bold tracking-widest uppercase mb-3">
            <ShieldCheck size={16}/> Mountain Trust Protocol
          </div>
          <h3 className="text-white text-[22px] md:text-[26px] font-bold leading-tight">
            High-altitude trust infrastructure for Uttarakhand valleys.
          </h3>
        </div>

        {/* 3 Cards */}
        <div className="lg:w-[70%] grid md:grid-cols-3 gap-4 w-full">

          <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-4.5 hover:border-white/20 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-bold text-sm flex gap-2 items-center">🔒 Escrow + OTP Check-In</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold">100% Protected</span>
            </div>
            <p className="text-white/70 text-[12.5px] leading-relaxed">Funds are securely escrowed. Payout is released to local hosts only upon physical OTP confirmation at check-in.</p>
          </div>

          <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-4.5 hover:border-white/20 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-bold text-sm">✓ 3-Layer Truth Check</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Verified</span>
            </div>
            <p className="text-white/70 text-[12.5px] leading-relaxed">EXIF GPS metadata, 10-second video KYC, and live geotagging eliminate fake and unverified mountain stays.</p>
          </div>

          <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-4.5 hover:border-white/20 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-bold text-sm">📡 Community Ground Grid</span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Offline Resilient</span>
            </div>
            <p className="text-white/70 text-[12.5px] leading-relaxed">Real-time trail and route consensus reported by verified valley sentinels with automatic offline background sync.</p>
          </div>

        </div>
      </div>
    </section>
  );
}
