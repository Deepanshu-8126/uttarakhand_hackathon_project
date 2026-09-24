import React from 'react';
import { useMapStore } from '../../store/mapStore';
import { CheckCircle2, X, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GlobalToast() {
  const { globalToast, clearToast } = useMapStore();

  if (!globalToast) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
      <div className="bg-[#0f3d2e] text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center justify-between gap-3 backdrop-blur-md">
        
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
            <CheckCircle2 size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
              {globalToast.message}
            </p>
            {globalToast.actionLink && (
              <Link
                to={globalToast.actionLink}
                onClick={clearToast}
                className="text-[11px] font-bold text-emerald-300 hover:text-white inline-flex items-center gap-1 mt-0.5 underline underline-offset-2"
              >
                <span>{globalToast.actionText || 'View Details'}</span>
                <ArrowRight size={11} />
              </Link>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={clearToast}
          className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition shrink-0 cursor-pointer"
          aria-label="Close notification"
        >
          <X size={14} />
        </button>

      </div>
    </div>
  );
}
