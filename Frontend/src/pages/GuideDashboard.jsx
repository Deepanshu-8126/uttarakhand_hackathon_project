import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Mountain, Play, Square, Share2, Copy, CheckCheck,
  MapPin, Battery, Signal, Wifi, WifiOff, AlertTriangle,
  Users, Clock, Navigation, Phone, MessageSquare, Zap,
  ChevronRight, ArrowLeft, Shield, Radio
} from 'lucide-react';
import Navbar from '../components/Navbar';

// ─── Offline trail storage helpers ──────────────────────────────────────────
const TRAIL_DB_KEY = 'trek_trail_offline';
const ACTIVE_TREK_KEY = 'active_trek_session';

function saveTrailPoint(tripId, lat, lng, ts = Date.now()) {
  try {
    const raw = localStorage.getItem(TRAIL_DB_KEY);
    const store = raw ? JSON.parse(raw) : {};
    if (!store[tripId]) store[tripId] = [];
    store[tripId].push({ lat, lng, ts });
    if (store[tripId].length > 200) store[tripId] = store[tripId].slice(-200);
    localStorage.setItem(TRAIL_DB_KEY, JSON.stringify(store));
  } catch (_) {}
}

function generateTripId() {
  return 'TRK-' + Math.floor(10000 + Math.random() * 89999);
}

const DEMO_TREKS = [
  {
    id: 'KED-2025-A',
    name: 'Kedarnath Yatra — Batch A',
    route: 'Gaurikund → Kedarnath Dham (16 km)',
    district: 'Rudraprayag',
    altitude: '3,583m',
    trekkers: [
      { name: 'Rahul Sharma', phone: '+919876543210' },
      { name: 'Priya Mehta', phone: '+919123456789' },
      { name: 'Arjun Singh', phone: '+919988776655' },
    ],
    familyPhone: '+919876543211',
    guidePhone: '+919871234567',
    duration: '2 Days',
    difficulty: 'Moderate',
    color: '#d97706',
  },
  {
    id: 'VAL-2025-B',
    name: 'Valley of Flowers Trek',
    route: 'Govindghat → Valley of Flowers (16 km)',
    district: 'Chamoli',
    altitude: '3,658m',
    trekkers: [
      { name: 'Neha Gupta', phone: '+919812345678' },
      { name: 'Vikram Rao', phone: '+919765432109' },
    ],
    familyPhone: '+919812345679',
    guidePhone: '+919871234567',
    duration: '3 Days',
    difficulty: 'Easy-Moderate',
    color: '#059669',
  },
  {
    id: 'AUL-2025-C',
    name: 'Auli Ski & Trek Expedition',
    route: 'Joshimath → Auli Bugyal (4 km)',
    district: 'Chamoli',
    altitude: '2,519m',
    trekkers: [
      { name: 'Sanjay Patel', phone: '+919901234567' },
      { name: 'Kavya Nair', phone: '+919844321098' },
      { name: 'Rohit Verma', phone: '+919811223344' },
      { name: 'Anita Das', phone: '+919722334455' },
    ],
    familyPhone: '+919901234568',
    guidePhone: '+919871234567',
    duration: '1 Day',
    difficulty: 'Easy',
    color: '#0ea5e9',
  },
];

function triggerFreeSOS({ lat, lng, tripId, guidePhone, familyPhone, trekName, battery }) {
  const batStr = battery !== null ? ` | Battery: ${battery}%` : '';
  const msg =
    `[EMERGENCY SOS] Discovery Uttarakhand\n` +
    `Trek: ${trekName}\nTrip ID: ${tripId}${batStr}\n` +
    `Location: https://maps.google.com/?q=${lat},${lng}\n` +
    `Live Trail: https://discoveryuk.in/live/${tripId}\n` +
    `IMMEDIATE HELP REQUIRED. SDRF: 1070`;
  const phones = [guidePhone, familyPhone, '112'].filter(Boolean).join(',');
  window.location.href = `sms:${phones}?body=${encodeURIComponent(msg)}`;
}

function shareWhatsApp(tripId, trekName) {
  const text =
    `🏔️ *LIVE TREK TRACKING*\nTrek: *${trekName}*\nTrip ID: \`${tripId}\`\n\n` +
    `📍 Live location trail:\n*https://discoveryuk.in/live/${tripId}*\n\n` +
    `_Discovery Uttarakhand Safety System_`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

export default function GuideDashboard() {
  const [selectedTrek, setSelectedTrek] = useState(null);
  const [activeTripId, setActiveTripId] = useState(null);
  const [trekActive, setTrekActive] = useState(false);
  const [currentPos, setCurrentPos] = useState(null);
  const [posError, setPosError] = useState(null);
  const [battery, setBattery] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [trailPoints, setTrailPoints] = useState([]);
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [sosCountdown, setSosCountdown] = useState(null);
  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const sosTimerRef = useRef(null);

  // SOS Countdown logic with False Alarm cancellation
  useEffect(() => {
    if (sosCountdown === null) return;
    if (sosCountdown <= 0) {
      setSosCountdown(null);
      if (currentPos && selectedTrek) {
        triggerFreeSOS({
          lat: currentPos.lat,
          lng: currentPos.lng,
          tripId: activeTripId,
          guidePhone: selectedTrek.guidePhone,
          familyPhone: selectedTrek.familyPhone,
          trekName: selectedTrek.name,
          battery
        });
      }
      return;
    }
    sosTimerRef.current = setTimeout(() => {
      setSosCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(sosTimerRef.current);
  }, [sosCountdown, currentPos, selectedTrek, activeTripId, battery]);

  const cancelSos = () => {
    if (sosTimerRef.current) clearTimeout(sosTimerRef.current);
    setSosCountdown(null);
  };

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem(ACTIVE_TREK_KEY);
    if (stored) {
      const session = JSON.parse(stored);
      setActiveTripId(session.tripId);
      setTrekActive(true);
      const trek = DEMO_TREKS.find(t => t.id === session.trekId);
      if (trek) setSelectedTrek(trek);
      setStartTime(session.startTime);
      const raw = localStorage.getItem(TRAIL_DB_KEY);
      if (raw) {
        const store = JSON.parse(raw);
        setTrailPoints(store[session.tripId] || []);
      }
    }
  }, []);

  // Battery API
  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(b => {
        setBattery(Math.round(b.level * 100));
        b.addEventListener('levelchange', () => setBattery(Math.round(b.level * 100)));
      });
    }
  }, []);

  // Online status
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Elapsed timer
  useEffect(() => {
    if (trekActive && startTime) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [trekActive, startTime]);

  // Geolocation watcher
  const startGeolocation = useCallback((tripId) => {
    if (!navigator.geolocation) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        setCurrentPos({ lat, lng, accuracy });
        setPosError(null);
        saveTrailPoint(tripId, lat, lng);
        setTrailPoints(prev => [...prev.slice(-199), { lat, lng, ts: Date.now() }]);
      },
      (err) => setPosError(err.message),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
    );
  }, []);

  const stopGeolocation = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const handleStartTrek = () => {
    if (!selectedTrek) return;
    const tripId = generateTripId();
    const session = { tripId, trekId: selectedTrek.id, startTime: Date.now() };
    localStorage.setItem(ACTIVE_TREK_KEY, JSON.stringify(session));
    setActiveTripId(tripId);
    setTrekActive(true);
    setStartTime(Date.now());
    setTrailPoints([]);
    startGeolocation(tripId);
  };

  const handleStopTrek = () => {
    stopGeolocation();
    localStorage.removeItem(ACTIVE_TREK_KEY);
    setTrekActive(false);
    setActiveTripId(null);
    setElapsed(0);
    setStartTime(null);
  };

  const formatElapsed = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const liveLink = activeTripId ? `https://discoveryuk.in/live/${activeTripId}` : null;

  const handleCopy = () => {
    if (!liveLink) return;
    navigator.clipboard.writeText(liveLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#0a1a0f]">
      <Navbar />

      {/* Sticky header */}
      <div className="sticky top-16 sm:top-20 z-30 bg-[#0f3d2e]/95 backdrop-blur-md border-b border-emerald-800/40 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Mountain size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-black tracking-widest uppercase text-emerald-400">Guide Cockpit</p>
              <p className="text-[10px] text-emerald-200/60 font-medium">Discovery Uttarakhand Safety</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${isOnline ? 'bg-emerald-900/60 border-emerald-600/50 text-emerald-300' : 'bg-amber-900/60 border-amber-600/50 text-amber-300'}`}>
              {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
              {isOnline ? 'Online' : 'Offline Cache'}
            </span>
            {battery !== null && (
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${battery < 25 ? 'bg-red-900/60 border-red-600/50 text-red-300' : 'bg-slate-800/80 border-slate-600/50 text-slate-300'}`}>
                <Battery size={10} />
                {battery}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-28">

        {/* Active beacon live status */}
        {trekActive && activeTripId && (
          <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/80 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-300">Trek Active · Beacon On</span>
              <span className="ml-auto text-xs font-mono text-emerald-400 font-bold">{formatElapsed(elapsed)}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-200/70 mb-1">
              <MapPin size={11} />
              {currentPos
                ? <span>{currentPos.lat.toFixed(5)}°N, {currentPos.lng.toFixed(5)}°E (±{Math.round(currentPos.accuracy)}m)</span>
                : <span className="italic">Acquiring GPS…</span>}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-200/60">
              <Navigation size={11} />
              <span>{trailPoints.length} trail points logged (offline-safe)</span>
            </div>
            {posError && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-400">
                <AlertTriangle size={11} />
                <span>{posError}</span>
              </div>
            )}
          </div>
        )}

        {/* Trek batch selector */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-3">Select Trek Batch</p>
          <div className="space-y-2.5">
            {DEMO_TREKS.map((trek) => {
              const isSelected = selectedTrek?.id === trek.id;
              const isRunning = trekActive && selectedTrek?.id === trek.id;
              return (
                <button
                  key={trek.id}
                  type="button"
                  disabled={trekActive && selectedTrek?.id !== trek.id}
                  onClick={() => !trekActive && setSelectedTrek(isSelected ? null : trek)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isRunning
                      ? 'border-emerald-500 bg-emerald-950/80 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : isSelected
                      ? 'border-emerald-700/80 bg-[#0f3d2e]/50 cursor-pointer'
                      : 'border-slate-700/50 bg-slate-900/60 hover:border-slate-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-black text-white truncate">{trek.name}</span>
                        {isRunning && (
                          <span className="shrink-0 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-black">Live</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2 truncate">{trek.route}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] text-slate-500"><Users size={10} /> {trek.trekkers.length} trekkers</span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-500"><Mountain size={10} /> {trek.altitude}</span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-500"><Clock size={10} /> {trek.duration}</span>
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: trek.color + '22', color: trek.color, border: `1px solid ${trek.color}55` }}
                        >
                          {trek.difficulty}
                        </span>
                      </div>
                    </div>
                    {isSelected && !isRunning && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCheck size={11} className="text-black" />
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1.5">
                      {trek.trekkers.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px]">
                          <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-300">{t.name[0]}</div>
                          <span className="text-slate-300 font-medium">{t.name}</span>
                          <span className="ml-auto text-slate-500">{t.phone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* START / STOP */}
        {selectedTrek && (
          !trekActive ? (
            <button
              type="button"
              onClick={handleStartTrek}
              className="w-full py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-black text-base uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] cursor-pointer"
            >
              <Play size={20} fill="currentColor" />
              Start Trek · Activate Beacon
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopTrek}
              className="w-full py-5 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-black text-base uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-[0_0_25px_rgba(225,29,72,0.3)] cursor-pointer"
            >
              <Square size={18} fill="currentColor" />
              Stop Trek · End Session
            </button>
          )
        )}

        {/* Live share box */}
        {trekActive && activeTripId && selectedTrek && (
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Share Live Tracking Link</p>
            <div className="flex items-center gap-2 bg-slate-800/80 rounded-xl px-3 py-2.5 border border-slate-700/60">
              <span className="text-[11px] text-emerald-400 font-mono flex-1 truncate">discoveryuk.in/live/{activeTripId}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors cursor-pointer"
              >
                {copied ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => shareWhatsApp(activeTripId, selectedTrek.name)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] text-xs font-bold transition-all cursor-pointer"
              >
                <MessageSquare size={14} />
                WhatsApp Family
              </button>
              <Link
                to={`/live/${activeTripId}`}
                target="_blank"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600/60 text-slate-300 text-xs font-bold transition-all"
              >
                <Radio size={14} />
                Open Live View
              </Link>
            </div>

            {sosCountdown !== null ? (
              <div className="w-full p-4 rounded-xl bg-rose-950/95 border border-rose-500 flex items-center justify-between animate-pulse shadow-[0_0_25px_rgba(225,29,72,0.4)]">
                <div className="flex items-center gap-2 text-rose-200 text-xs font-black">
                  <AlertTriangle size={18} className="text-rose-400 animate-spin" />
                  <span>DISPATCHING SOS IN {sosCountdown}s...</span>
                </div>
                <button
                  type="button"
                  onClick={cancelSos}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-rose-100 text-rose-900 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-xs"
                >
                  Cancel (False Alarm)
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSosCountdown(5)}
                disabled={!currentPos}
                className="w-full py-3.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 border border-rose-500/60 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-[0.98] shadow-[0_0_20px_rgba(225,29,72,0.25)]"
              >
                <AlertTriangle size={16} />
                🚨 SOS — Send Emergency SMS (Free)
              </button>
            )}
            {!currentPos && (
              <p className="text-center text-[10px] text-slate-500">Waiting for GPS fix before SOS is enabled…</p>
            )}
          </div>
        )}

        {/* Rescue ops shortcut */}
        <Link
          to="/rescue-ops"
          className="flex items-center justify-between p-4 rounded-2xl border border-slate-700/50 bg-slate-900/60 hover:border-slate-600 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-900/40 border border-rose-700/40 flex items-center justify-center">
              <Shield size={16} className="text-rose-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Rescue Ops Command</p>
              <p className="text-[10px] text-slate-500">13 districts · live SOS monitoring</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
        </Link>

      </div>
    </div>
  );
}
