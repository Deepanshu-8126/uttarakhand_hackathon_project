import React from 'react';
import { PhoneCall, PhoneOff } from 'lucide-react';

const ORB_STATES = {
  idle: { bg: 'from-stone-700 to-stone-600', border: 'border-stone-500', shadow: 'shadow-stone-900/40', pulse: false },
  calling: { bg: 'from-amber-700 to-amber-600', border: 'border-amber-400', shadow: 'shadow-amber-900/40', pulse: true },
  connected: { bg: 'from-emerald-700 to-teal-600', border: 'border-emerald-400', shadow: 'shadow-emerald-900/60', pulse: false },
  listening: { bg: 'from-sky-700 to-cyan-600', border: 'border-cyan-400', shadow: 'shadow-cyan-900/60', pulse: true },
  thinking: { bg: 'from-violet-700 to-purple-600', border: 'border-violet-400', shadow: 'shadow-violet-900/60', pulse: true },
  speaking: { bg: 'from-emerald-600 to-teal-500', border: 'border-emerald-300', shadow: 'shadow-emerald-900/60', pulse: true },
};

export default function VoiceControls({ onOpenVoice }) {
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <button
        onClick={onOpenVoice}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition cursor-pointer hover:scale-105 active:scale-95"
      >
        <PhoneCall size={13} />
        Switch to Voice Call
      </button>
      <p className="text-[9px] text-stone-600">Aoede Studio Voice · Real-time</p>
    </div>
  );
}
