import React from 'react';
import { PhoneCall, Sparkles } from 'lucide-react';

export default function FloatingCallButton() {
  const handleOpenCall = () => {
    window.dispatchEvent(new CustomEvent('open-voice-call'));
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={handleOpenCall}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs tracking-wide shadow-xl shadow-emerald-900/40 border border-emerald-400/30 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        title="Start Live Voice Call with Devbhoomi AI"
      >
        {/* Subtle Ping Animation */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
        </span>

        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <PhoneCall size={13} className="text-white group-hover:rotate-12 transition-transform" />
        </div>
        <span>AI Voice Call</span>
        <Sparkles size={13} className="text-emerald-200" />
      </button>
    </div>
  );
}
