import React, { useState } from 'react';
import { 
  ShieldAlert, MapPin, PhoneCall, Radio, 
  Users, CheckCircle2, Navigation, AlertCircle, Heart, ShieldCheck 
} from 'lucide-react';

export default function CommunitySafetyGrid() {
  const [sosActive, setSosActive] = useState(false);
  const [calledHelper, setCalledHelper] = useState(null);

  const helpers = [
    {
      id: 1,
      name: 'Ramesh Negi (Homestay Host)',
      distance: '1.2 km',
      eta: '8 mins',
      role: 'Local Homestay Host & First Responder',
      phone: '+91 98765 43210',
      status: 'Ready on Standby',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 2,
      name: 'Suresh Rawat (Bike Fleet Operator)',
      distance: '2.1 km',
      eta: '15 mins',
      role: '4x4 Rescue Vehicle & Mechanics',
      phone: '+91 98765 12345',
      status: 'Ready on Standby',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 3,
      name: 'Govindghat Certified Guide Team',
      distance: '3.5 km',
      eta: '22 mins',
      role: 'SDRF Certified Mountaineers with Medical Kit',
      phone: '+91 98765 67890',
      status: 'Active Patrol',
      color: 'bg-blue-50 text-blue-800 border-blue-200'
    }
  ];

  return (
    <div className="w-full bg-[#fcfaf6] text-slate-900 rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.04)] relative overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-5 border-b border-stone-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Radio size={14} className="text-rose-600" />
            <span>Community Mountain Safety Mesh</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display tracking-tight">
            Community Safety Grid &amp; SOS Network
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Connects travelers in emergency situations with verified local homestay owners, drivers, and SDRF mountain rescue teams.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-stone-200 px-3.5 py-1.5 rounded-full text-xs font-semibold text-stone-700 shadow-xs self-start sm:self-center">
          <ShieldCheck size={14} className="text-[#0f3d2e]" />
          <span>3 Responders Nearby</span>
        </div>
      </div>

      {/* Grid: Left SOS Simulator + Right Nearby Responders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: SOS Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Emergency Beacon
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                sosActive ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}>
                {sosActive ? '🚨 Beacon Transmitting' : 'Standby Mode'}
              </span>
            </div>

            <div className={`p-5 rounded-2xl border mb-4 text-center ${
              sosActive ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-stone-50 border-stone-200 text-stone-800'
            }`}>
              <ShieldAlert size={36} className={`mx-auto mb-2 ${sosActive ? 'text-rose-600' : 'text-stone-400'}`} />
              <h4 className="text-base font-bold">
                {sosActive ? 'Emergency Signal Broadcasting' : 'Instant Help Button'}
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                {sosActive
                  ? 'Transmitting GPS coordinates (30.7346° N, 79.0669° E) to 3 closest community responders.'
                  : 'Press to broadcast your location to certified local hosts and first responders.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSosActive(!sosActive)}
            className={`w-full py-3 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
              sosActive
                ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
            }`}
          >
            {sosActive ? 'Cancel Test Broadcast' : 'Simulate Emergency SOS'}
          </button>
        </div>

        {/* Right: Responders List (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            <span>Nearby Verified First Responders</span>
            <span className="text-emerald-700">Within 5 km radius</span>
          </div>

          {helpers.map((h) => (
            <div
              key={h.id}
              className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-stone-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold text-sm shrink-0">
                  {h.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-stone-900">{h.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${h.color}`}>
                      {h.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {h.role} • <strong>{h.distance}</strong> (~{h.eta})
                  </p>
                </div>
              </div>

              <a
                href={`tel:${h.phone}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCalledHelper(h.name);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0f3d2e] hover:bg-[#165a44] text-white text-xs font-bold transition-all shadow-2xs shrink-0 self-start sm:self-center"
              >
                <PhoneCall size={13} />
                <span>Call Responder</span>
              </a>
            </div>
          ))}

          {calledHelper && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium flex items-center justify-between animate-fadeIn">
              <span>Connecting directly with <strong>{calledHelper}</strong>...</span>
              <button
                type="button"
                onClick={() => setCalledHelper(null)}
                className="text-emerald-800 font-bold underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
