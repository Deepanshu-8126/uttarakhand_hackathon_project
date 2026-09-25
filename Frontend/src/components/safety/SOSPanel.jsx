import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle, Radio, Shield, Battery, BatteryLow, Zap,
  Clock, MapPin, Compass, Flame, Volume2, VolumeX, EyeOff,
  RotateCcw, CheckCircle2, ChevronRight, Phone, Share2,
  Users, Mountain, Navigation, Sparkles, AlertOctagon, HeartHandshake
} from 'lucide-react';

export default function SOSPanel({
  trekkerId = 'TRK-82341',
  trekkerName = 'Aryan Negi',
  trekName = 'Kedarnath Yatra Trail',
  lat = 30.7346,
  lng = 79.0669,
  battery = 27,
  altitude = 3583,
  onSosTriggered = null,
  onSosCancelled = null
}) {
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'smart' | 'creative'
  const [activeSos, setActiveSos] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [powerTapCount, setPowerTapCount] = useState(0);
  const [silentModeActive, setSilentModeActive] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const holdTimerRef = useRef(null);
  const tapResetTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Sync initial SOS from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sosActive');
      if (stored) {
        setActiveSos(JSON.parse(stored));
      }
    } catch (_) {}

    const handleStorage = () => {
      try {
        const stored = localStorage.getItem('sosActive');
        if (stored) setActiveSos(JSON.parse(stored));
        else setActiveSos(null);
      } catch (_) {}
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // 10s Countdown Timer logic
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(null);
      dispatchFinalSos({
        type: 'COUNTDOWN_EXPIRED',
        title: 'SOS Beacon Activated (Countdown Elapsed)',
        message: 'Trekker distress beacon automatically confirmed after 10s window.',
        severity: 'HIGH'
      });
      return;
    }

    countdownTimerRef.current = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(countdownTimerRef.current);
  }, [countdown]);

  // Master SOS Dispatcher (Unified Local Mesh + Cloud API Sync)
  const dispatchFinalSos = ({ type, title, message, severity = 'CRITICAL', extra = {} }) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';
    const payload = {
      trekker: trekkerId,
      name: trekkerName,
      trekName,
      lat,
      lng,
      altitude: `${altitude}m`,
      time: nowTime,
      battery,
      triggerType: type,
      title: title || 'Emergency Distress Beacon',
      message: message || 'Injured on trail near Mandakini river. Need assistance!',
      severity,
      ...extra
    };

    // 1. Instant Local Mesh Storage (0ms)
    localStorage.setItem('sosActive', JSON.stringify(payload));
    setActiveSos(payload);
    window.dispatchEvent(new Event('storage'));

    // 2. Cloud API probe in background
    try {
      const apiEndpoint = import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/safety/trigger` 
        : '/api/safety/trigger';
      
      fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trekkerId,
          trekkerName,
          trekName,
          coordinates: { lat, lng },
          battery,
          message: payload.message,
          severity
        }),
        signal: AbortSignal.timeout(3000)
      }).catch(() => {});
    } catch (_) {}

    // Audio / Visual toast feedback
    setToastMessage(`🚨 ${title} Broadcasted to Grid!`);
    setTimeout(() => setToastMessage(null), 4000);

    if (onSosTriggered) onSosTriggered(payload);
  };

  // Cancel / Reset SOS
  const handleCancel = () => {
    localStorage.removeItem('sosActive');
    localStorage.removeItem('rescueDispatched');
    setActiveSos(null);
    setCountdown(null);
    setHoldProgress(0);
    setSilentModeActive(false);
    window.dispatchEvent(new Event('storage'));
    setToastMessage('✅ SOS Beacon Cancelled & Cleared.');
    setTimeout(() => setToastMessage(null), 3000);
    if (onSosCancelled) onSosCancelled();
  };

  // ── Mode Handlers ────────────────────────────────────────────────────────────

  // Long Press 3s
  const startHolding = () => {
    setIsHolding(true);
    setHoldProgress(0);
    const start = Date.now();
    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / 3000) * 100));
      setHoldProgress(pct);
      if (pct >= 100) {
        clearInterval(holdTimerRef.current);
        setIsHolding(false);
        dispatchFinalSos({
          type: 'LONG_PRESS_3S',
          title: 'Long-Press 3s SOS Verified',
          message: 'Trekker held emergency button for 3 continuous seconds.',
          severity: 'CRITICAL'
        });
      }
    }, 50);
  };

  const stopHolding = () => {
    clearInterval(holdTimerRef.current);
    setIsHolding(false);
    if (holdProgress < 100) setHoldProgress(0);
  };

  // Double Tap Handler
  const handleDoubleTap = () => {
    setTapCount((prev) => {
      const next = prev + 1;
      if (next >= 2) {
        dispatchFinalSos({
          type: 'DOUBLE_TAP',
          title: 'Double-Tap Quick SOS',
          message: 'Verified dual-tap emergency distress sequence.',
          severity: 'CRITICAL'
        });
        return 0;
      }
      clearTimeout(tapResetTimerRef.current);
      tapResetTimerRef.current = setTimeout(() => setTapCount(0), 400);
      return next;
    });
  };

  // Power Button 5x Simulation
  const handlePowerTap = () => {
    setPowerTapCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        dispatchFinalSos({
          type: 'POWER_5X',
          title: '5x Power Hardware Emergency Sequence',
          message: 'Hardware emergency trigger shortcut executed 5 times.',
          severity: 'CRITICAL'
        });
        return 0;
      }
      clearTimeout(tapResetTimerRef.current);
      tapResetTimerRef.current = setTimeout(() => setPowerTapCount(0), 1200);
      return next;
    });
  };

  // Shake Device Simulation
  const handleSimulateShake = () => {
    dispatchFinalSos({
      type: 'SHAKE_FALL',
      title: 'Sudden Fall / Impact Detected (Shake Event)',
      message: 'Accelerometer detected sudden abnormal vertical shock on mountain slope.',
      severity: 'CRITICAL'
    });
  };

  return (
    <div className="rounded-[20px] border border-[#2A3343] bg-[#151A26] overflow-hidden shadow-2xl relative text-slate-100">
      
      {/* ── Active Toast ── */}
      {toastMessage && (
        <div className="absolute top-3 left-4 right-4 z-40 p-3 rounded-xl bg-red-600 text-white text-xs font-bold shadow-lg flex items-center justify-between animate-in fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* ── Silent Stealth Overlay ── */}
      {silentModeActive && activeSos && (
        <div 
          onClick={() => setSilentModeActive(false)}
          className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none"
        >
          <EyeOff size={32} className="text-stone-800 mb-3" />
          <p className="text-stone-600 font-mono text-xs">Silent Stealth SOS Active</p>
          <p className="text-stone-800 text-[10px] mt-1">Screen disguised. Tap anywhere to reveal controls.</p>
        </div>
      )}

      {/* ── Header ── */}
      <div className="p-4 sm:p-5 border-b border-[#2A3343] bg-[#0A0E14]/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Radio size={16} className={activeSos ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span>30+ Multi-Trigger SOS Matrix</span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/50">
                P2P Mesh
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Simulate diverse mountain emergencies — all syncing to Guide & Admin tabs in 0ms.
            </p>
          </div>
        </div>

        {activeSos && (
          <button
            type="button"
            onClick={handleCancel}
            className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Cancel Active SOS</span>
          </button>
        )}
      </div>

      {/* ── Active SOS Banner (If any SOS is firing) ── */}
      {activeSos && (
        <div className="p-4 bg-red-950/50 border-b border-red-500/40 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping shrink-0 mt-1" />
            <div>
              <p className="text-xs font-black text-red-300 uppercase tracking-wide">
                ACTIVE DISTRESS: {activeSos.title}
              </p>
              <p className="text-xs text-white mt-0.5 font-medium leading-snug">
                "{activeSos.message}"
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                Trigger: <strong>{activeSos.triggerType}</strong> • Severity: <strong>{activeSos.severity}</strong> • Time: {activeSos.time}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-red-300 bg-red-900/60 px-2 py-0.5 rounded border border-red-700/50 shrink-0">
            TRANSMITTING
          </span>
        </div>
      )}

      {/* ── 10s Countdown Active Box ── */}
      {countdown !== null && (
        <div className="p-4 bg-amber-950/50 border-b border-amber-500/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Clock size={18} className="text-amber-400 animate-spin" />
            <div>
              <p className="text-xs font-black text-amber-300">Countdown Active: Sending in {countdown}s...</p>
              <p className="text-[11px] text-slate-300">Click cancel if this was an accidental trigger.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCountdown(null)}
            className="py-1 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition cursor-pointer"
          >
            Cancel False Alarm
          </button>
        </div>
      )}

      {/* ── 3 Tabs Switcher ── */}
      <div className="p-2.5 bg-[#0A0E14] border-b border-[#2A3343] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('quick')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'quick'
              ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
              : 'text-slate-400 hover:text-white hover:bg-[#151A26]'
          }`}
        >
          ⚡ 1-Click Quick SOS (5 Modes)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('smart')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'smart'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
              : 'text-slate-400 hover:text-white hover:bg-[#151A26]'
          }`}
        >
          🤖 Smart Auto SOS (7 Modes)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('creative')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'creative'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
              : 'text-slate-400 hover:text-white hover:bg-[#151A26]'
          }`}
        >
          🎯 Creative & Story Tests (10+ Modes)
        </button>
      </div>

      {/* ── TAB 1: 1-CLICK QUICK SOS ── */}
      {activeTab === 'quick' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Mode 1: Panic SOS */}
            <button
              type="button"
              onClick={() => dispatchFinalSos({
                type: 'PANIC_1CLICK',
                title: 'Instant Panic SOS',
                message: 'Immediate distress alert pressed by trekker on trail.',
                severity: 'CRITICAL'
              })}
              className="p-4 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black uppercase text-red-400 flex items-center gap-1.5">
                  <Zap size={14} />
                  <span>1. Panic SOS (1-Tap)</span>
                </span>
                <span className="text-[10px] font-mono text-red-300">Instant</span>
              </div>
              <p className="text-[11px] text-slate-300">Directly broadcasts high-priority emergency beacon to all nearby devices.</p>
            </button>

            {/* Mode 2: Long Press 3s SOS */}
            <div
              onMouseDown={startHolding}
              onMouseUp={stopHolding}
              onMouseLeave={stopHolding}
              onTouchStart={startHolding}
              onTouchEnd={stopHolding}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-left transition-all relative overflow-hidden select-none cursor-pointer"
            >
              <div 
                className="absolute left-0 bottom-0 top-0 bg-red-600/30 transition-all duration-75"
                style={{ width: `${holdProgress}%` }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>2. Hold 3s (Pocket-Safe)</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-300">{holdProgress}%</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {isHolding ? 'Holding... Keep pressed!' : 'Press & hold 3s to prevent accidental false alarms.'}
                </p>
              </div>
            </div>

            {/* Mode 3: Double Tap SOS */}
            <button
              type="button"
              onClick={handleDoubleTap}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black uppercase text-sky-400 flex items-center gap-1.5">
                  <Flame size={14} />
                  <span>3. Double Tap SOS</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">{tapCount > 0 ? 'Tap 1 more!' : '2x Tap'}</span>
              </div>
              <p className="text-[11px] text-slate-300">Requires 2 fast taps within 400ms to confirm distress.</p>
            </button>

            {/* Mode 4: Shake to SOS */}
            <button
              type="button"
              onClick={handleSimulateShake}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                  <Navigation size={14} />
                  <span>4. Shake to SOS (Fall Simulation)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-300">Motion Sensor</span>
              </div>
              <p className="text-[11px] text-slate-300">Simulates phone shaking violently when a trekker slips or falls on steep ice.</p>
            </button>

            {/* Mode 5: Power Button 5x */}
            <button
              type="button"
              onClick={handlePowerTap}
              className="sm:col-span-2 p-4 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black uppercase text-purple-400 flex items-center gap-1.5">
                  <Shield size={14} />
                  <span>5. Power Button 5x Fast-Tap Shortcut</span>
                </span>
                <span className="text-[10px] font-mono text-purple-300">{powerTapCount}/5 Taps</span>
              </div>
              <p className="text-[11px] text-slate-300">Tap this button 5 times quickly to mimic hardware emergency button shortcuts.</p>
            </button>

          </div>
        </div>
      )}

      {/* ── TAB 2: SMART AUTO SOS ── */}
      {activeTab === 'smart' && (
        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Autonomous sensors detect danger even if the trekker is unconscious or incapacitated.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Mode 6: Stationary 30m */}
            <button
              type="button"
              onClick={() => dispatchFinalSos({
                type: 'NO_MOVEMENT_30M',
                title: 'Stationary Inactivity Trigger (30 Min)',
                message: 'No movement registered for 30 minutes on active mountain route.',
                severity: 'HIGH'
              })}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-left transition cursor-pointer"
            >
              <p className="text-xs font-bold text-amber-400">6. No Movement for 30 Min</p>
              <p className="text-[11px] text-slate-400 mt-1">Triggers when hiker is stuck in place without GPS progress.</p>
            </button>

            {/* Mode 7: Battery Dead 5% */}
            <button
              type="button"
              onClick={() => dispatchFinalSos({
                type: 'BATTERY_CRITICAL_5PCT',
                title: 'Battery Critical Shutdown Beacon (5%)',
                message: 'Device battery depleted to 5%. Final high-accuracy coordinate packet dispatched.',
                severity: 'CRITICAL',
                extra: { battery: 5 }
              })}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-left transition cursor-pointer"
            >
              <p className="text-xs font-bold text-red-400">7. Battery Dead SOS (5%)</p>
              <p className="text-[11px] text-slate-400 mt-1">Sends last known coordinates before device shuts down completely.</p>
            </button>

            {/* Mode 8: Altitude Drop Fall */}
            <button
              type="button"
              onClick={() => dispatchFinalSos({
                type: 'ALTITUDE_DROP_FALL',
                title: 'Rapid Vertical Drop / Fall Detected (-20m)',
                message: 'Altimeter registered sudden 24m vertical drop in 2 seconds. Possible ravine fall.',
                severity: 'CRITICAL'
              })}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-left transition cursor-pointer"
            >
              <p className="text-xs font-bold text-cyan-400">8. Sudden 20m Altitude Drop</p>
              <p className="text-[11px] text-slate-400 mt-1">Detects vertical drops mimicking crevasse or ridge slips.</p>
            </button>

            {/* Mode 9: Off-Route 500m */}
            <button
              type="button"
              onClick={() => dispatchFinalSos({
                type: 'OFF_ROUTE_DEVIATION',
                title: 'Off-Route Trail Deviation (500m+)',
                message: 'Hiker drifted 580m outside safe marked corridor towards Mandakini gorge.',
                severity: 'MEDIUM'
              })}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-left transition cursor-pointer"
            >
              <p className="text-xs font-bold text-emerald-400">9. Off-Track Deviation (500m)</p>
              <p className="text-[11px] text-slate-400 mt-1">Alerts when path exits safe surveyed mountain corridors.</p>
            </button>

            {/* Mode 10: Night Haze past 9PM */}
            <button
              type="button"
              onClick={() => dispatchFinalSos({
                type: 'NIGHT_TREK_DANGER',
                title: 'Sub-Zero Night Trek Advisory (Past 9 PM)',
                message: 'Trekker still on high-altitude trail after 21:00 IST in sub-zero freezing conditions.',
                severity: 'HIGH'
              })}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-left transition cursor-pointer"
            >
              <p className="text-xs font-bold text-indigo-400">10. Night Trek Risk (Past 9 PM)</p>
              <p className="text-[11px] text-slate-400 mt-1">Flags night ascents prone to freezing hypothermia.</p>
            </button>

            {/* Mode 11 & 12: Weather Storm & 10s Countdown */}
            <button
              type="button"
              onClick={() => setCountdown(10)}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-left transition cursor-pointer"
            >
              <p className="text-xs font-bold text-amber-400">11. 10-Second Countdown SOS</p>
              <p className="text-[11px] text-slate-400 mt-1">Starts an audible 10-second countdown with cancel window.</p>
            </button>

          </div>
        </div>
      )}

      {/* ── TAB 3: CREATIVE & STORY TESTS ── */}
      {activeTab === 'creative' && (
        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Real mountain problem situations — from animal encounters to mesh tea-stall alerts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Wild Animal Spotted */}
            <button
              type="button"
              onClick={() => dispatchFinalSos({
                type: 'WILD_ANIMAL_SPOTTED',
                title: '🐻 Wild Animal Sighting Advisory',
                message: 'Black Bear / Leopard spotted near ridge checkpoint. Guides alerted to bypass trail.',
                severity: 'HIGH'
              })}
              className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/40 hover:border-amber-500 text-left transition cursor-pointer"
            >
              <p className="text-xs font-bold text-amber-300">🐻 Wild Animal Spotted</p>
              <p className="text-[11px] text-slate-400 mt-1">Informs guides to avoid panic while alerting nearby groups.</p>
            </button>

            {/* Chai & Hot Ration SOS */}
            <button
              type="button"
              onClick={() => dispatchFinalSos({
                type: 'CHAI_RATION_ASSISTANCE',
                title: '☕ Exhaustion & Shelter Request',
                message: 'Trekker severely fatigued and cold; requesting shelter and warm ration at nearest tea camp.',
                severity: 'LOW'
              })}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-left transition cursor-pointer"
            >
              <p className="text-xs font-bold text-emerald-400">☕ Chai & Shelter Request</p>
              <p className="text-[11px] text-slate-400 mt-1">Human-friendly custom beacon for exhaustion & warm hydration.</p>
            </button>

            {/* Silent Stealth SOS */}
            <button
              type="button"
              onClick={() => {
                dispatchFinalSos({
                  type: 'SILENT_STEALTH_SOS',
                  title: 'Silent Covert SOS Dispatched',
                  message: 'Covert distress beacon initiated with darkened screen disguise.',
                  severity: 'CRITICAL'
                });
                setSilentModeActive(true);
              }}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-left transition cursor-pointer"
            >
              <p className="text-xs font-bold text-purple-400">🕶️ Silent Stealth Mode</p>
              <p className="text-[11px] text-slate-400 mt-1">Disguises screen black while silently streaming coordinates.</p>
            </button>

            {/* Multi-language Hindi SOS */}
            <button
              type="button"
              onClick={() => dispatchFinalSos({
                type: 'HINDI_DISTRESS',
                title: '🚨 आपातकालीन संदेश: मदद चाहिए (Need Urgent Help)',
                message: 'केदारनाथ मार्ग पर रास्ता भटक गए हैं, तुरंत सहायता भेजें।',
                severity: 'CRITICAL'
              })}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-left transition cursor-pointer"
            >
              <p className="text-xs font-bold text-orange-400">🇮🇳 Hindi: मदद चाहिए</p>
              <p className="text-[11px] text-slate-400 mt-1">Native Devanagari broadcast displaying bilingual context.</p>
            </button>

            {/* WhatsApp Family Share */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`[EMERGENCY SOS] Discovery Uttarakhand\nTrekker: ${trekkerName} (${trekkerId})\nLocation: https://maps.google.com/?q=${lat},${lng}\nTrail: ${trekName}\nNeed assistance!`)}`}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40 hover:border-emerald-500 text-left transition flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-emerald-300">📲 WhatsApp Family SOS Relay</p>
                <p className="text-[11px] text-slate-400 mt-1">Generates pre-formatted WhatsApp SOS message.</p>
              </div>
              <Share2 size={15} className="text-emerald-400 shrink-0 ml-2" />
            </a>

            {/* 3-Tier Severity Level Tester */}
            <button
              type="button"
              onClick={() => dispatchFinalSos({
                type: 'LEVEL_3_LIFE_THREAT',
                title: '🔴 Level 3 Life Threat (Critical Code Red)',
                message: 'Multiple casualties or serious mountain injury requiring immediate stretcher evacuation.',
                severity: 'CRITICAL'
              })}
              className="p-3.5 rounded-xl bg-red-950/40 border border-red-600/40 hover:border-red-500 text-left transition cursor-pointer"
            >
              <p className="text-xs font-bold text-red-400">🔴 Level 3 Code Red (Evacuation)</p>
              <p className="text-[11px] text-slate-400 mt-1">Highest priority distress requiring full team dispatch.</p>
            </button>

          </div>
        </div>
      )}

      {/* ── Footer Info ── */}
      <div className="p-3 border-t border-[#2A3343] bg-[#0A0E14]/60 flex items-center justify-between text-[10px] text-slate-400">
        <span>Active Coordinates: <strong className="text-emerald-400 font-mono">{lat}, {lng}</strong></span>
        <span>Mesh Relay: <strong className="text-blue-400">Channel 4 Standby</strong></span>
      </div>

    </div>
  );
}
