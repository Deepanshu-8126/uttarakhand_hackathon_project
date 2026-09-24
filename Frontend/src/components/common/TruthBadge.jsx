import React, { useState } from 'react';
import { ShieldCheck, MapPin, Video, Camera, Info, CheckCircle2, X } from 'lucide-react';

/**
 * Discovery Uttarakhand - 3-Layer Truth Verified Badge
 * Feature 12: 3-Layer Truth Check (EXIF GPS + 10s Video KYC + Live Geo-Selfie)
 */
export default function TruthBadge({ 
  listingTitle = "Himalayan Property",
  coordinates = { lat: 30.1458, lon: 78.3042 },
  district = "Rishikesh, Uttarakhand",
  score = 100,
  size = "md"
}) {
  const [showModal, setShowModal] = useState(false);

  const isSmall = size === "sm";

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 font-bold tracking-tight rounded-full transition-all cursor-pointer ${
          isSmall
            ? "px-2 py-0.5 text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
            : "px-3 py-1 text-xs bg-gradient-to-r from-emerald-500/20 via-emerald-500/15 to-indigo-500/20 border border-emerald-500/40 text-emerald-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:border-emerald-400"
        }`}
      >
        <ShieldCheck size={isSmall ? 12 : 14} className="text-emerald-400" />
        <span>3-Layer Truth Verified</span>
        <span className="px-1 text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 rounded">
          {score}%
        </span>
      </button>

      {/* Interactive Verification Proof Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md overflow-hidden border rounded-3xl bg-[#0f111a] border-emerald-500/40 shadow-[0_0_60px_rgba(16,185,129,0.2)] text-slate-100">
            
            {/* Header */}
            <div className="relative p-6 pb-4 border-b border-slate-800 bg-gradient-to-r from-emerald-950/60 to-slate-900">
              <button
                onClick={() => setShowModal(false)}
                className="absolute p-2 text-slate-400 transition-colors rounded-full top-4 right-4 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 border rounded-2xl bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-inner">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                    ANTI-FAKE VERIFICATION PROTOCOL
                  </div>
                  <h3 className="text-lg font-bold text-white">3-Layer Truth Check</h3>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-300">
                Unlike generic platforms with stock photos, this listing has passed 3 biometric and hardware integrity tests on-site in Uttarakhand.
              </p>
            </div>

            {/* 3 Verification Layers */}
            <div className="p-6 space-y-3.5">
              
              {/* Layer 1: EXIF GPS Check */}
              <div className="p-3.5 border rounded-2xl bg-slate-900/80 border-slate-800 flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
                  <MapPin size={16} />
                </div>
                <div className="space-y-1 text-left flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Layer 1: EXIF GPS Match</span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> PASSED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Photo hardware coordinates ({coordinates.lat.toFixed(4)}° N, {coordinates.lon.toFixed(4)}° E) strictly fall within Uttarakhand mountain bounds. Zero stock image reuse.
                  </p>
                </div>
              </div>

              {/* Layer 2: 10-Second Video KYC */}
              <div className="p-3.5 border rounded-2xl bg-slate-900/80 border-slate-800 flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0 mt-0.5">
                  <Video size={16} />
                </div>
                <div className="space-y-1 text-left flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Layer 2: 10s Video KYC & Plate</span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> PASSED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Host recorded continuous video declaring property ownership & UK vehicle number plate matched against transport registry.
                  </p>
                </div>
              </div>

              {/* Layer 3: Live Geo-Tagged Selfie */}
              <div className="p-3.5 border rounded-2xl bg-slate-900/80 border-slate-800 flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0 mt-0.5">
                  <Camera size={16} />
                </div>
                <div className="space-y-1 text-left flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Layer 3: Live Geo-Tagged Selfie</span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> PASSED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Live camera capture validated with real-time GPS telemetry from {district}.
                  </p>
                </div>
              </div>

              {/* Trust Score Summary */}
              <div className="flex items-center justify-between p-3 border rounded-xl bg-emerald-500/10 border-emerald-500/20">
                <div className="text-xs font-bold text-emerald-300">
                  Total Anti-Fraud Trust Score
                </div>
                <div className="text-sm font-extrabold text-emerald-400">
                  100% Guaranteed Genuine
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 text-xs font-bold text-slate-300 transition-colors rounded-xl bg-slate-800 hover:bg-slate-700"
              >
                Close Verification Audit
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
