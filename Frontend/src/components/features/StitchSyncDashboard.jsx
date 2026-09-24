import React, { useState } from 'react';
import { 
  Layers, RefreshCw, CheckCircle2, User, Building2, 
  ArrowRight, ShieldCheck, Smartphone, Sparkles, Zap 
} from 'lucide-react';

export default function StitchSyncDashboard() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCount, setSyncCount] = useState(148);

  const triggerManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncCount(prev => prev + 1);
    }, 1000);
  };

  return (
    <div className="w-full bg-[#fcfaf6] text-slate-900 rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.04)] relative overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-5 border-b border-stone-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Layers size={14} className="text-emerald-700" />
            <span>Real-Time Inventory Synchronization</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display tracking-tight">
            Live Tourist &amp; Homestay Partner Sync
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Instant bi-directional state synchronization between traveler bookings and remote mountain homestay inventories.
          </p>
        </div>

        <button
          type="button"
          onClick={triggerManualSync}
          disabled={isSyncing}
          className="flex items-center gap-2 bg-white hover:bg-stone-50 border border-stone-200 px-4 py-2 rounded-full text-xs font-bold text-stone-800 shadow-xs transition-all cursor-pointer self-start sm:self-center"
        >
          <RefreshCw size={14} className={`text-[#0f3d2e] ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Simulate Live Sync'}</span>
        </button>
      </div>

      {/* Visual Sync Architecture Graphic */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Step 1: Traveler Client */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0f3d2e] flex items-center justify-center mb-3 shadow-xs">
              <Smartphone size={24} />
            </div>
            <h4 className="text-sm font-bold text-stone-900">Traveler Booking App</h4>
            <p className="text-xs text-stone-500 mt-1">
              Selects boutique stay & vehicle in Chopta / Kedarnath corridor.
            </p>
            <span className="mt-3 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Booking ID #UK-8921
            </span>
          </div>

          {/* Middle: Cloud Synchronization Hub */}
          <div className="flex flex-col items-center justify-center text-center px-2">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0f3d2e] to-[#1b5c47] text-white flex items-center justify-center shadow-md mb-2">
              <Zap size={24} className="text-emerald-300 animate-pulse" />
            </div>
            <span className="text-xs font-bold text-stone-800">Ultra-Low Latency Sync</span>
            <span className="text-[11px] text-stone-500 mt-0.5">Average ~24ms response</span>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>{syncCount} Instant Syncs Completed</span>
            </div>
          </div>

          {/* Step 3: Local Partner Homestay */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-3 shadow-xs">
              <Building2 size={24} />
            </div>
            <h4 className="text-sm font-bold text-stone-900">Pahadi Homestay Host</h4>
            <p className="text-xs text-stone-500 mt-1">
              Instant SMS & WhatsApp confirmation + Room lock without double booking.
            </p>
            <span className="mt-3 text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Room Locked: Apple Orchard Suite
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}
