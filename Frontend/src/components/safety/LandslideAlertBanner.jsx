import React, { useState } from 'react';
import { 
  AlertTriangle, Navigation, CheckCircle2, 
  ChevronUp, ChevronDown, ShieldCheck 
} from 'lucide-react';

/**
 * Discovery Uttarakhand - Mountain Safety & Real-Time Hazard Sentinel (Prompt 2 Redesign)
 * Critical safety alerts are non-dismissible for traveler safety, but can be minimized into a thin HUD strip.
 */
export default function LandslideAlertBanner({ 
  location = "Joshimath Corridor (NH-58)", 
  alternateRoute = "Tharali Valley Bypass (+34km)",
  onRerouteActivated
}) {
  const [isRerouted, setIsRerouted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const locStr = typeof location === 'string' ? location : (location?.name || location?.address || 'Joshimath Corridor (NH-58)');
  const routeStr = typeof alternateRoute === 'string' ? alternateRoute : (alternateRoute?.name || 'Tharali Valley Bypass (+34km)');

  const handleActivateReroute = () => {
    setIsRerouted(true);
    if (onRerouteActivated) onRerouteActivated();
  };

  // Minimized Thin HUD Strip
  if (isMinimized) {
    return (
      <div className="w-full my-3 px-4 py-2 rounded-xl bg-slate-900/90 border-l-4 border-l-amber-500 border border-slate-800 text-xs text-white shadow-md flex items-center justify-between gap-3 font-sans animate-fadeIn">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <AlertTriangle size={14} className="text-amber-400" />
          <span className="font-bold text-amber-300">⚠️ Active Hazard:</span>
          <span className="text-slate-300 truncate max-w-sm sm:max-w-md">
            {locStr} BLOCKED → Auto-reroute via {routeStr}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="text-[11px] font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700"
        >
          <span>Expand Alert</span>
          <ChevronDown size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full my-4 rounded-2xl overflow-hidden border-l-4 border-l-amber-500 border border-slate-800 bg-slate-900/95 p-4 sm:p-5 text-white shadow-xl animate-fadeIn font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Alert Description & Verification */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
            <AlertTriangle size={20} className="animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-300">
                Active Road Advisory
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>Verified by 5 Valley Sentinels</span>
              </span>
            </div>
            
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
              ⚠️ {locStr} BLOCKED → Auto-reroute via {routeStr}
            </h4>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              {isRerouted ? (
                <span className="text-emerald-300 font-medium flex items-center gap-1">
                  <CheckCircle2 size={13} /> 100% Free homestay re-allocation and zero-delay detour active.
                </span>
              ) : (
                <>BRO clearance team active on site. Safe all-weather bypass recommended via <strong className="text-amber-300">{routeStr}</strong>.</>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          {!isRerouted ? (
            <button
              type="button"
              onClick={handleActivateReroute}
              className="px-3.5 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/80 text-amber-300 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Navigation size={13} />
              <span>1-Tap Auto-Reroute</span>
            </button>
          ) : (
            <div className="px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              <span>Rerouted via Safe Valley</span>
            </div>
          )}

          {/* Minimize Button (Safety alert cannot be dismissed, only minimized) */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            title="Minimize to thin alert strip"
            className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px] font-mono cursor-pointer"
          >
            <ChevronUp size={15} />
            <span className="hidden sm:inline">Minimize</span>
          </button>
        </div>

      </div>
    </div>
  );
}
