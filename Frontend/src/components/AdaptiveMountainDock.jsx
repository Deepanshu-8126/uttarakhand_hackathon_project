import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, Sparkles, Compass, MapPin, 
  ChevronUp, AlertCircle, ArrowUpRight, Activity 
} from 'lucide-react';
import AICopilotDrawer from './copilot/AICopilotDrawer';
import { useMapStore } from '../store/mapStore';

/**
 * AdaptiveMountainDock (Audit E-04 Fix):
 * Replaces stacked floating widgets with a consolidated 3-slot bottom dock.
 * [Slot 1: Contextual Hazard Alert] [Slot 2: Active Trip Status / Nav] [Slot 3: AI Copilot Trigger]
 */
export default function AdaptiveMountainDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const { plannerForm } = useMapStore();

  const [copilotOpen, setCopilotOpen] = useState(false);
  const [alertExpanded, setAlertExpanded] = useState(false);

  // Hidden on full-screen admin or copilot standalone views to avoid interference
  const isHiddenRoute = location.pathname.startsWith('/admin') || location.pathname === '/copilot';

  if (isHiddenRoute) return null;

  const currentDest = plannerForm?.destination || 'Uttarakhand';

  return (
    <>
      {/* ─── Unified Global Fixed Bottom Mountain Dock (Compact & Sleek) ─── */}
      <aside 
        aria-label="Mountain Navigation and Safety Dock"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90%] sm:w-auto px-3 sm:px-4 py-1.5 rounded-2xl backdrop-blur-xl bg-slate-900/90 border border-slate-700/70 shadow-2xl flex items-center justify-between sm:justify-center gap-2 sm:gap-3 transition-all duration-300 font-sans"
      >
        
        {/* ── Slot 1: Left Contextual Hazard Alert Badge ── */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setAlertExpanded(!alertExpanded)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-all cursor-pointer"
            title="View live mountain corridor safety status"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
            <ShieldAlert size={13} className="text-amber-400" />
            <span>Corridor Radar</span>
          </button>

          {/* Alert Popover */}
          {alertExpanded && (
            <div className="absolute bottom-11 left-0 w-64 p-3.5 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl text-xs z-50 animate-fadeIn">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Activity size={13} className="text-emerald-400" />
                  Live Corridor Radar
                </span>
                <span className="text-[10px] text-slate-400 font-mono">24/7 Monitored</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Char Dham & Kumaon corridors monitored under Mountain Trust Protocol.
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex justify-between">
                <Link 
                  to="/map" 
                  onClick={() => setAlertExpanded(false)}
                  className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-0.5"
                >
                  Open Live Map <ArrowUpRight size={10} />
                </Link>
                <Link 
                  to="/audit" 
                  onClick={() => setAlertExpanded(false)}
                  className="text-[10px] font-mono text-slate-400 hover:underline"
                >
                  System Health →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Slot 2: Center Active Trip / Route Status ── */}
        <Link
          to="/trip-planner"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 text-[11px] font-bold transition-all"
        >
          <Compass size={13} className="text-emerald-400" />
          <span className="truncate max-w-[110px] sm:max-w-[140px]">
            {plannerForm?.destination ? `Trip to ${plannerForm.destination}` : 'Plan Trip'}
          </span>
        </Link>

        {/* ── Slot 3: Right AI Copilot Launcher ── */}
        <button
          type="button"
          onClick={() => setCopilotOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold shadow-md transition-all cursor-pointer"
        >
          <Sparkles size={13} className="text-amber-300 animate-pulse" />
          <span>AI Copilot</span>
        </button>

      </aside>

      {/* Embedded Copilot Drawer */}
      <AICopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        pageContext={{
          currentRoute: location.pathname,
          destinationName: currentDest,
          destinationSlug: null,
          pageType: location.pathname === '/' ? 'HOME' : 'GENERAL',
          tripId: null
        }}
      />
    </>
  );
}
