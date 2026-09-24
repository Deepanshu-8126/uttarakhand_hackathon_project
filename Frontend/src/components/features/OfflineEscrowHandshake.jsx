import React, { useState } from 'react';
import { 
  QrCode, ShieldCheck, WifiOff, Smartphone, 
  RefreshCw, CheckCircle2, Lock, ArrowRight, Zap, Check 
} from 'lucide-react';

export default function OfflineEscrowHandshake() {
  const [simulatedScan, setSimulatedScan] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const handleSimulateHandshake = () => {
    setSimulatedScan(true);
    setTimeout(() => {
      setSyncDone(true);
    }, 1000);
  };

  const handleReset = () => {
    setSimulatedScan(false);
    setSyncDone(false);
  };

  return (
    <div className="w-full bg-[#fcfaf6] text-slate-900 rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.04)] relative overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-5 border-b border-stone-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <WifiOff size={14} className="text-emerald-700" />
            <span>Zero-Signal Mountain Escrow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display tracking-tight">
            Offline QR Handshake &amp; Rental Security
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Enables secure booking verification and key handover in deep mountain valleys with zero cellular connectivity.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-stone-200 px-3.5 py-1.5 rounded-full text-xs font-semibold text-stone-700 shadow-xs self-start sm:self-center">
          <ShieldCheck size={14} className="text-[#0f3d2e]" />
          <span>Offline Escrow Protected</span>
        </div>
      </div>

      {/* Main Grid: Left QR Voucher Card + Right Explanation Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left: Clean QR Voucher Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200/90 shadow-md flex flex-col items-center text-center">
          
          <div className="w-full flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Offline Digital Voucher
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Verified Offline
            </span>
          </div>

          {/* Visual QR Code Display */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 mb-4 flex flex-col items-center">
            <div className="w-40 h-40 bg-white rounded-xl p-3 border border-stone-200 shadow-2xs flex flex-col items-center justify-center relative">
              <QrCode size={120} className="text-[#0f3d2e]" />
              {syncDone && (
                <div className="absolute inset-0 bg-emerald-900/90 rounded-xl flex flex-col items-center justify-center text-white p-2 animate-fadeIn">
                  <CheckCircle2 size={36} className="text-emerald-300 mb-1" />
                  <span className="text-xs font-bold">Handshake Complete!</span>
                  <span className="text-[10px] text-emerald-100">Vehicle Released</span>
                </div>
              )}
            </div>
            <span className="text-[11px] font-mono text-stone-500 mt-2">
              OTP: <strong>782-910</strong> • Exp: 24h
            </span>
          </div>

          <div className="w-full">
            {!syncDone ? (
              <button
                type="button"
                onClick={handleSimulateHandshake}
                disabled={simulatedScan}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#0f3d2e] to-[#165a44] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {simulatedScan ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Verifying Offline Signature...</span>
                  </>
                ) : (
                  <>
                    <QrCode size={14} />
                    <span>Simulate Partner Scan</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 text-xs font-bold transition-all"
              >
                Reset Demonstration
              </button>
            )}
          </div>

        </div>

        {/* Right: How It Protects You (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#0f3d2e] flex items-center justify-center text-xs font-bold">1</span>
              <span>Encrypted Offline Key Generated</span>
            </h4>
            <p className="text-xs text-stone-500 pl-8 leading-relaxed">
              When booking online in Delhi/Dehradun, your phone stores a tamper-proof digital token with booking details and duration.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#0f3d2e] flex items-center justify-center text-xs font-bold">2</span>
              <span>Physical Handover in Remote Valley</span>
            </h4>
            <p className="text-xs text-stone-500 pl-8 leading-relaxed">
              Upon arrival in Chopta or Kedarnath base with 0 mobile network, the local partner scans your QR code offline to verify booking.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#0f3d2e] flex items-center justify-center text-xs font-bold">3</span>
              <span>Automatic Escrow Release</span>
            </h4>
            <p className="text-xs text-stone-500 pl-8 leading-relaxed">
              Payment is released to the local host only after physical key handover is verified by your personal 6-digit OTP.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
