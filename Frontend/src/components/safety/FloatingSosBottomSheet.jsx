import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  WifiOff, 
  Wifi, 
  Users, 
  PhoneCall, 
  X, 
  AlertOctagon, 
  CheckCircle2, 
  Compass
} from 'lucide-react';

export default function FloatingSosBottomSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(true);
  const [sosStatus, setSosStatus] = useState('IDLE'); // 'IDLE' | 'BROADCASTING' | 'SENT'
  const [countdown, setCountdown] = useState(5);

  const localBuddies = [
    { 
      name: 'Ramesh Singh Rawat', 
      role: 'Certified Trek Guide', 
      distance: '1.2 km away', 
      walkTime: '~18 min', 
      signal: 'Radio CH-4 / Mesh', 
      verified: true 
    },
    { 
      name: 'SDRF Mountain Post (Guptkashi)', 
      role: 'Disaster Relief & Oxygen', 
      distance: '3.4 km away', 
      walkTime: '~45 min', 
      signal: 'Satellite Link', 
      verified: true 
    },
    { 
      name: 'GMVN Eco Base Station', 
      role: 'Shelter & Medical Post', 
      distance: '4.8 km away', 
      walkTime: '~60 min', 
      signal: 'VHF Emergency', 
      verified: true 
    },
  ];

  // Sound + Haptic Vibration Mock
  const playSosBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([150, 75, 150, 75, 300]);
      } catch (err) {}
    }
  };

  const handleTriggerSos = () => {
    playSosBeep();
    setSosStatus('BROADCASTING');
    setCountdown(5);
  };

  useEffect(() => {
    let timer;
    if (sosStatus === 'BROADCASTING' && countdown > 0) {
      timer = setTimeout(() => {
        playSosBeep();
        setCountdown(countdown - 1);
      }, 1000);
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
      {/* ── Floating Safety & SOS Trigger Button (Positioned safely above BottomNavBar on mobile) ── */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 pointer-events-auto">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 active:scale-95 text-white font-bold rounded-full shadow-[0_8px_25px_rgba(217,119,6,0.4)] border border-amber-300/40 backdrop-blur-md transition-all duration-200 cursor-pointer"
          title="Open Safety & Offline SOS Grid"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <ShieldAlert size={16} className="text-white shrink-0" />
          <span className="text-[11px] font-black tracking-wider uppercase whitespace-nowrap">SOS Mesh</span>
        </button>
      </div>

      {/* ── Bottom Sheet & Backdrop ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
          
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          {/* Sheet Container */}
          <div className="relative w-full max-w-lg bg-[#fdfbf7] rounded-t-[28px] sm:rounded-[28px] shadow-2xl border border-stone-200/90 overflow-hidden z-10 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            
            {/* Top Handle Bar */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-3 shrink-0" />

            {/* Header */}
            <div className="px-5 sm:px-6 pt-1 pb-4 border-b border-stone-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF7ED] text-[#F59E0B] border border-amber-200/70 flex items-center justify-center font-bold shadow-2xs shrink-0">
                  <ShieldAlert size={20} className="text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                    Mountain Safety &amp; SOS Grid
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Offline Mesh &amp; Community Assistance Network
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">

              {/* 1. Network Status Card */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isOfflineMode ? 'bg-[#FFF7ED] text-[#F59E0B] border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {isOfflineMode ? <WifiOff size={19} /> : <Wifi size={19} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {isOfflineMode ? 'Network Status: Low / Offline Mesh' : 'Network Status: Online 4G'}
                      </span>
                      {isOfflineMode && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      Auto-mesh via P2P Bluetooth &amp; SMS Gateway
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsOfflineMode(!isOfflineMode)}
                    className="text-[11px] font-bold text-slate-700 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-full transition-colors border border-stone-200/80 cursor-pointer shadow-2xs"
                  >
                    {isOfflineMode ? 'Simulate Online' : 'Simulate Offline'}
                  </button>
                </div>
              </div>

              {/* 2. GPS Card */}
              <div className="bg-[#F0F5F0] rounded-xl px-4 py-3 border border-emerald-900/10 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2 text-[#0F2B1F] font-bold truncate">
                  <Compass size={16} className="text-[#0F2B1F] shrink-0" />
                  <span className="truncate">
                    GPS Beacon Locked: <strong className="font-mono text-emerald-950">30.7346° N, 79.0669° E</strong>
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-emerald-900 block leading-tight">
                    Alt: 3,583m
                  </span>
                  <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-300/50 inline-block mt-0.5">
                    Accuracy: 3m
                  </span>
                </div>
              </div>

              {/* 3. Community Grid Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Users size={14} className="text-[#0F2B1F]" />
                    <span>COMMUNITY SOS GRID ACTIVE: 3 LOCAL BUDDIES NEARBY</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-emerald-200/80 shadow-2xs">
                    Within 5km
                  </span>
                </div>

                {/* 3 Buddy Cards */}
                <div className="space-y-2">
                  {localBuddies.map((buddy, idx) => (
                    <div 
                      key={idx}
                      className="bg-white rounded-xl p-3 sm:p-3.5 border border-stone-200/90 flex items-center justify-between hover:border-emerald-300/80 transition-all shadow-xs gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-[#E8F5E9] text-[#0F2B1F] flex items-center justify-center font-black text-xs border border-emerald-200/70 shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight flex items-center gap-1 truncate">
                            <span>{buddy.name}</span>
                            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {buddy.role} • <strong className="text-slate-900 font-bold">{buddy.distance}</strong>{' '}
                            <span className="text-slate-400 font-medium">({buddy.walkTime})</span>
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold bg-stone-100 text-slate-600 px-2.5 py-1 rounded-lg border border-stone-200 shrink-0">
                        {buddy.signal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Main Action Button: Broadcast SOS to Grid */}
              <div className="pt-2">
                {sosStatus === 'IDLE' && (
                  <div>
                    <button
                      type="button"
                      onClick={handleTriggerSos}
                      className="w-full h-[56px] px-6 rounded-2xl bg-[#DC2626] hover:bg-[#b91c1c] active:scale-[0.99] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-600/25 flex items-center justify-center gap-3 transition-all cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <AlertOctagon size={18} className="text-white" />
                      </div>
                      <span>BROADCAST SOS TO GRID</span>
                    </button>
                    <p className="text-center text-[11px] text-slate-500 mt-2 font-medium max-w-sm mx-auto leading-relaxed">
                      Will auto-sync via SMS/Mesh when offline. Transmits emergency coordinates to all nearby guides &amp; SDRF.
                    </p>
                  </div>
                )}

                {sosStatus === 'BROADCASTING' && (
                  <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-5 text-center animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-[#DC2626] text-white flex items-center justify-center mx-auto mb-2 text-xl font-black shadow-md">
                      {countdown}
                    </div>
                    <h4 className="text-sm font-black text-red-950">
                      Broadcasting Distress Beacon in {countdown}s...
                    </h4>
                    <p className="text-xs text-red-800 mt-1 mb-3">
                      Sending GPS packet to 3 Local Buddies &amp; Uttarakhand SDRF command.
                    </p>
                    <button
                      type="button"
                      onClick={handleCancelSos}
                      className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors cursor-pointer shadow-xs"
                    >
                      Cancel SOS
                    </button>
                  </div>
                )}

                {sosStatus === 'SENT' && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 text-center">
                    <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                      <CheckCircle2 size={24} />
                    </div>
                    <h4 className="text-sm font-black text-emerald-950">
                      SOS Beacon Broadcasted!
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1 mb-3">
                      Ramesh Singh Rawat (1.2 km) and Guptkashi SDRF Post have acknowledged your coordinates. Stay at your current shelter.
                    </p>
                    <button
                      type="button"
                      onClick={handleCancelSos}
                      className="px-5 py-2 bg-[#0F2B1F] text-white text-xs font-bold rounded-xl hover:bg-[#153e2d] transition-colors cursor-pointer shadow-xs"
                    >
                      Reset Grid Status
                    </button>
                  </div>
                )}
              </div>

              {/* 5. Quick Dial Helplines */}
              <div className="pt-2 border-t border-stone-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                  Official Uttarakhand Emergency Hotlines
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <a 
                    href="tel:112"
                    className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-slate-900 border border-stone-200/80 flex flex-col items-center transition-colors shadow-2xs"
                  >
                    <PhoneCall size={14} className="text-[#0F2B1F] mb-1" />
                    <span className="text-xs font-black">112</span>
                    <span className="text-[9px] text-slate-500 font-medium">State Helpline</span>
                  </a>

                  <a 
                    href="tel:1070"
                    className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-slate-900 border border-stone-200/80 flex flex-col items-center transition-colors shadow-2xs"
                  >
                    <PhoneCall size={14} className="text-[#F59E0B] mb-1" />
                    <span className="text-xs font-black">1070</span>
                    <span className="text-[9px] text-slate-500 font-medium">Disaster Room</span>
                  </a>

                  <a 
                    href="tel:108"
                    className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-slate-900 border border-stone-200/80 flex flex-col items-center transition-colors shadow-2xs"
                  >
                    <PhoneCall size={14} className="text-[#DC2626] mb-1" />
                    <span className="text-xs font-black">108</span>
                    <span className="text-[9px] text-slate-500 font-medium">Mountain Med</span>
                  </a>
                </div>
              </div>

              {/* 6. Footer */}
              <div className="text-center pt-1 pb-1">
                <span className="text-[10px] text-slate-400 font-semibold inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Powered by Mesh Protocol • Works without Internet</span>
                </span>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
