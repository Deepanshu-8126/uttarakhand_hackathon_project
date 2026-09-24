import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, Radio } from 'lucide-react';

/**
 * Mountain Trust Protocol Section
 * Core Verification & Protection Engine
 */
export default function TrustProtocolStrip() {
  return (
    <section className="w-full flex justify-center py-6 px-4 font-sans bg-transparent">
      <div className="w-full max-w-[1280px] bg-[#0f2a22] rounded-[24px] p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center shadow-xl border border-white/5">

        {/* Left Title */}
        <div className="lg:w-[32%] space-y-2">
          <div className="flex items-center gap-2 text-[#7ec8a0] text-[11px] font-bold tracking-widest uppercase">
            <ShieldCheck size={16} /> Mountain Trust Protocol
          </div>
          <h3 className="text-white text-[22px] md:text-[26px] font-bold leading-tight">
            High-altitude trust infrastructure for Uttarakhand valleys.
          </h3>
          <p className="text-white/60 text-xs leading-relaxed">
            Eliminating booking fraud, phantom homestays, and unreliable road data across remote mountain corridors.
          </p>
        </div>

        {/* Right 3 White Faded Cards */}
        <div className="lg:w-[68%] grid grid-cols-1 md:grid-cols-3 gap-4 w-full">

          {/* Card 1: Escrow + OTP */}
          <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-bold text-sm flex items-center gap-1.5">
                  <Lock size={15} className="text-emerald-400" /> Escrow + OTP
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  100% Safe
                </span>
              </div>
              <p className="text-white/70 text-[12px] leading-relaxed">
                Money is held securely in escrow. Payout releases to local partners only after OTP confirmation at physical handover.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-white/10 text-[10px] font-bold text-emerald-300">
              Zero Advance Fraud
            </div>
          </div>

          {/* Card 2: 3-Layer Truth */}
          <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-bold text-sm flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-cyan-400" /> 3-Layer Truth
                </span>
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  Verified
                </span>
              </div>
              <p className="text-white/70 text-[12px] leading-relaxed">
                EXIF GPS metadata check + 10s video KYC of premises + Live geo-tagged host selfie. Phantom listings blocked.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-white/10 text-[10px] font-bold text-cyan-300">
              Verified Physical Stays
            </div>
          </div>

          {/* Card 3: Community Grid */}
          <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-bold text-sm flex items-center gap-1.5">
                  <Radio size={15} className="text-amber-400" /> Community Grid
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  Offline Sync
                </span>
              </div>
              <p className="text-white/70 text-[12px] leading-relaxed">
                When official weather APIs fail, 3 verified local partner reports trigger an active advisory with offline auto-sync.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-white/10 text-[10px] font-bold text-amber-300">
              Ground-Truth Consensus
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
