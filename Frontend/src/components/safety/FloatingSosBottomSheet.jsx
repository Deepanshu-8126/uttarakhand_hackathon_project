import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Radio, 
  WifiOff, 
  Wifi, 
  Users, 
  PhoneCall, 
  MapPin, 
  X, 
  AlertOctagon, 
  CheckCircle2, 
  BellRing,
  Compass
} from 'lucide-react';

export default function FloatingSosBottomSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(true);
  const [sosStatus, setSosStatus] = useState('IDLE'); // 'IDLE' | 'BROADCASTING' | 'SENT'
  const [countdown, setCountdown] = useState(5);

  const localBuddies = [
    { name: 'Ramesh Singh Rawat', role: 'Certified Trek Guide', distance: '1.2 km away', signal: 'Radio CH-4 / Mesh', verified: true },
    { name: 'SDRF Mountain Post (Guptkashi)', role: 'Disaster Relief & Oxygen', distance: '3.4 km away', signal: 'Satellite Link', verified: true },
    { name: 'GMVN Eco Base Station', role: 'Shelter & Medical Post', distance: '4.8 km away', signal: 'VHF Emergency', verified: true },
  ];

  const handleTriggerSos = () => {
    setSosStatus('BROADCASTING');
    setCountdown(5);
  };

  useEffect(() => {
    let timer;
    if (sosStatus === 'BROADCASTING' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (sosStatus === 'BROADCASTING' && countdown === 0) {
      setSosStatus('SENT');
    }
    return () => clearTimeout(timer);
  }, [sosStatus, countdown]);

  const handleCancelSos = () => {
    setSosStatus('IDLE');
  };

  return (
    <>
      {/* ── Floating Safety & SOS Trigger Button ── */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-[#d97706] hover:bg-[#b45309] active:scale-95 text-white font-bold rounded-full shadow-xl border-2 border-amber-300/40 backdrop-blur-md transition-all duration-200 cursor-pointer"
          title="Open Safety & Offline SOS Grid"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <ShieldAlert size={18} className="text-white shrink-0" />
          <span className="text-xs font-black tracking-wide uppercase">Safety & SOS</span>
        </button>
      </div>

      {/* ── Bottom Sheet & Backdrop ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          {/* Sheet Container */}
          <div className="relative w-full max-w-lg bg-[#fdfbf7] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Sheet Handle for Mobile */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-3 sm:hidden" />

            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-stone-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <ShieldAlert size={18} className="text-[#d97706]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900 tracking-tight">
                    Mountain Safety & SOS Grid
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium">
                    Offline Mesh & Community Assistance Network
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-200/60 hover:bg-stone-300 flex items-center justify-center text-stone-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-5 overflow-y-auto">

              {/* 1. TOP: Network Status Badge */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isOfflineMode ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {isOfflineMode ? <WifiOff size={18} /> : <Wifi size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">
                        {isOfflineMode ? 'Network Status: Low / Offline Mesh' : 'Network Status: Online 4G'}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Auto-mesh protocol active via P2P Bluetooth & SMS Gateway
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOfflineMode(!isOfflineMode)}
                  className="text-[10px] font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {isOfflineMode ? 'Simulate Online' : 'Simulate Offline'}
                </button>
              </div>

              {/* GPS Coordinates Bar */}
              <div className="bg-[#0f3d2e]/5 rounded-xl px-3.5 py-2.5 border border-[#0f3d2e]/15 flex items-center justify-between text-xs">
                <span className="font-bold text-[#0f3d2e] flex items-center gap-1.5">
                  <Compass size={14} />
                  GPS Beacon Locked: 30.7346° N, 79.0669° E
                </span>
                <span className="text-[11px] font-semibold text-stone-600">Alt: 3,583m</span>
              </div>

              {/* 2. MIDDLE: Community SOS Grid */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Users size={14} className="text-[#0f3d2e]" />
                    Community SOS Grid Active: 3 Local Buddies nearby
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Within 5 km
                  </span>
                </div>

                <div className="space-y-2">
                  {localBuddies.map((buddy, idx) => (
                    <div 
                      key={idx}
                      className="bg-white rounded-xl p-3 border border-stone-200 flex items-center justify-between hover:border-stone-300 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-stone-100 text-[#0f3d2e] flex items-center justify-center font-bold text-xs border border-stone-200">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-stone-900 leading-tight flex items-center gap-1">
                            {buddy.name}
                            <CheckCircle2 size={12} className="text-emerald-600" />
                          </h4>
                          <p className="text-[10.5px] text-stone-500">
                            {buddy.role} • <strong className="text-stone-700">{buddy.distance}</strong>
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                        {buddy.signal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. BOTTOM: Broadcast SOS Button / Active State */}
              <div className="pt-2">
                {sosStatus === 'IDLE' && (
                  <div>
                    <button
                      type="button"
                      onClick={handleTriggerSos}
                      className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                    >
                      <AlertOctagon size={20} className="animate-bounce" />
                      <span>Broadcast SOS to Grid</span>
                    </button>
                    <p className="text-center text-[11px] text-stone-500 mt-2 font-medium">
                      Will auto-sync via SMS/Mesh when offline. Transmits emergency coordinates to all nearby guides & SDRF.
                    </p>
                  </div>
                )}

                {sosStatus === 'BROADCASTING' && (
                  <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 text-center animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto mb-2 text-lg font-black">
                      {countdown}
                    </div>
                    <h4 className="text-sm font-black text-red-900">
                      Broadcasting Distress Beacon in {countdown}s...
                    </h4>
                    <p className="text-xs text-red-700 mt-1 mb-3">
                      Sending GPS packet to 3 Local Buddies & Uttarakhand SDRF command.
                    </p>
                    <button
                      type="button"
                      onClick={handleCancelSos}
                      className="px-4 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-lg hover:bg-black"
                    >
                      Cancel SOS
                    </button>
                  </div>
                )}

                {sosStatus === 'SENT' && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 size={24} />
                    </div>
                    <h4 className="text-sm font-black text-emerald-900">
                      SOS Beacon Broadcasted!
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1 mb-3">
                      Ramesh Singh Rawat (1.2 km) and Guptkashi SDRF Post have acknowledged your coordinates. Stay at your current shelter.
                    </p>
                    <button
                      type="button"
                      onClick={handleCancelSos}
                      className="px-4 py-1.5 bg-emerald-800 text-white text-xs font-bold rounded-lg hover:bg-emerald-900"
                    >
                      Reset Grid Status
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Dial Helplines */}
              <div className="pt-3 border-t border-stone-200">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2 text-center">
                  Official Uttarakhand Emergency Hotlines
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <a 
                    href="tel:112"
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 flex flex-col items-center transition-colors"
                  >
                    <PhoneCall size={14} className="text-[#0f3d2e] mb-1" />
                    <span className="text-xs font-bold">112</span>
                    <span className="text-[9px] text-stone-500">State Helpline</span>
                  </a>

                  <a 
                    href="tel:1070"
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 flex flex-col items-center transition-colors"
                  >
                    <PhoneCall size={14} className="text-[#d97706] mb-1" />
                    <span className="text-xs font-bold">1070</span>
                    <span className="text-[9px] text-stone-500">Disaster Room</span>
                  </a>

                  <a 
                    href="tel:108"
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 flex flex-col items-center transition-colors"
                  >
                    <PhoneCall size={14} className="text-red-600 mb-1" />
                    <span className="text-xs font-bold">108</span>
                    <span className="text-[9px] text-stone-500">Mountain Med</span>
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
