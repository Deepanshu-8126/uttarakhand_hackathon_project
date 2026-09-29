import React from 'react';
import { PhoneCall, Sparkles, Compass, Shield, MapPin, MessageSquare } from 'lucide-react';

export default function CopilotPage() {
  const handleStartCall = () => {
    window.dispatchEvent(new CustomEvent('open-voice-call'));
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black uppercase tracking-wider mb-6">
        <Sparkles size={14} className="text-emerald-700" />
        Aoede Studio Real-Time Voice Agent
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight mb-4">
        Talk to Devbhoomi AI
      </h1>
      <p className="text-base text-stone-600 max-w-lg mb-8 leading-relaxed">
        Full-duplex real-time voice call agent powered by official Gemini Live studio voice <strong className="text-emerald-700">Aoede</strong> with ultra-fast Redis streaming.
      </p>

      {/* Primary Call Action */}
      <div className="p-8 bg-white border border-stone-200 rounded-3xl shadow-xl flex flex-col items-center max-w-md w-full mb-10">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-900/30 mb-5 animate-pulse">
          <PhoneCall size={40} />
        </div>

        <button
          onClick={handleStartCall}
          className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base tracking-wide flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/30 transition cursor-pointer hover:scale-102 active:scale-98"
        >
          <PhoneCall size={20} />
          Start Live Voice Call
        </button>
        <p className="text-[11px] text-stone-400 mt-3">
          Aoede Studio Voice â€¢ Redis WS Acceleration â€¢ Brave & Chrome
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full text-left">
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
          <Compass size={20} className="text-emerald-700 mb-2" />
          <h4 className="font-bold text-sm text-stone-900 mb-1">Trip Itineraries</h4>
          <p className="text-xs text-stone-500">Instant personalized 2 to 5-day mountain plans in Hindi & English.</p>
        </div>
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
          <Shield size={20} className="text-emerald-700 mb-2" />
          <h4 className="font-bold text-sm text-stone-900 mb-1">Mountain Safety</h4>
          <p className="text-xs text-stone-500">Live altitude safety, acclimatization radar, and weather alerts.</p>
        </div>
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
          <MapPin size={20} className="text-emerald-700 mb-2" />
          <h4 className="font-bold text-sm text-stone-900 mb-1">Verified Fleets & Stays</h4>
          <p className="text-xs text-stone-500">Rental bikes and verified homestay recommendations on the go.</p>
        </div>
      </div>
    </div>
  );
}
