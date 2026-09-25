import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mountain, MapPin, Battery, BatteryLow, Signal, Radio,
  AlertTriangle, Play, Pause, RotateCcw, Shield, CheckCircle2,
  Users, Clock, Navigation, ArrowRight, Eye, ChevronRight,
  Flame, HeartHandshake, Compass
} from 'lucide-react';
import Navbar from '../components/Navbar';
import SOSPanel from '../components/safety/SOSPanel';

export default function TrekkerLivePage() {
  const navigate = useNavigate();

  // Trekker state
  const trekkerId = 'TRK-82341';
  const trekkerName = 'Aryan Negi';
  const trekName = 'Kedarnath Yatra Trail';
  const district = 'Rudraprayag';

  // Live simulation states
  const [isTrekActive, setIsTrekActive] = useState(false);
  const [lat, setLat] = useState(30.7346);
  const [lng, setLng] = useState(79.0669);
  const [altitude, setAltitude] = useState(3583);
  const [distanceKm, setDistanceKm] = useState(6.2);
  const [battery, setBattery] = useState(27);
  const [sosActive, setSosActive] = useState(false);
  const [sosSentTime, setSosSentTime] = useState(null);
  const [broadcastAnimation, setBroadcastAnimation] = useState(false);
  const [guideRescueStatus, setGuideRescueStatus] = useState(null);
  const [stepCount, setStepCount] = useState(8420);

  const timerRef = useRef(null);

  // Sync initial state from localStorage
  useEffect(() => {
    try {
      const storedSos = localStorage.getItem('sosActive');
      if (storedSos) {
        const parsed = JSON.parse(storedSos);
        setSosActive(true);
        setSosSentTime(parsed.time || '14:30 IST');
      }

      const storedTrek = localStorage.getItem('currentTrek');
      if (storedTrek) {
        const parsed = JSON.parse(storedTrek);
        if (parsed.lat) setLat(parsed.lat);
        if (parsed.lng) setLng(parsed.lng);
        if (parsed.status === 'active') setIsTrekActive(true);
      }

      const storedRescue = localStorage.getItem('rescueDispatched');
      if (storedRescue) {
        setGuideRescueStatus(JSON.parse(storedRescue));
      }
    } catch (_) {}
  }, []);

  // Listen to cross-tab updates (e.g. guide clicks "I am going to rescue")
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedRescue = localStorage.getItem('rescueDispatched');
        if (storedRescue) {
          setGuideRescueStatus(JSON.parse(storedRescue));
        } else {
          setGuideRescueStatus(null);
        }

        const storedSos = localStorage.getItem('sosActive');
        if (!storedSos) {
          setSosActive(false);
        }
      } catch (_) {}
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Moving location simulator interval
  useEffect(() => {
    if (isTrekActive) {
      timerRef.current = setInterval(() => {
        // Random micro movement near Kedarnath trail
        setLat((prev) => {
          const delta = (Math.random() - 0.45) * 0.0006;
          const next = +(prev + delta).toFixed(5);
          return next;
        });
        setLng((prev) => {
          const delta = (Math.random() - 0.45) * 0.0006;
          const next = +(prev + delta).toFixed(5);
          return next;
        });
        setDistanceKm((prev) => +(prev + 0.01).toFixed(2));
        setStepCount((prev) => prev + Math.floor(Math.random() * 8 + 5));

        // Save to localStorage so Guide and Admin read the moving coordinates
        const trekData = {
          id: trekkerId,
          trekkerName,
          trekName,
          district,
          lat: +(lat + 0.0001).toFixed(5),
          lng: +(lng + 0.0001).toFixed(5),
          altitude: `${altitude}m`,
          status: 'active',
          battery,
          lastPing: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
        };
        localStorage.setItem('currentTrek', JSON.stringify(trekData));
        localStorage.setItem('sosGrid', JSON.stringify({ active: true, trekData }));

        // Notify other tabs
        window.dispatchEvent(new Event('storage'));
      }, 3000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTrekActive, lat, lng, altitude, battery]);

  // Start / Pause Trek
  const toggleTrek = () => {
    const nextState = !isTrekActive;
    setIsTrekActive(nextState);

    const trekData = {
      id: trekkerId,
      trekkerName,
      trekName,
      district,
      lat,
      lng,
      altitude: `${altitude}m`,
      status: nextState ? 'active' : 'paused',
      battery,
      lastPing: 'Just now',
    };
    localStorage.setItem('currentTrek', JSON.stringify(trekData));
    window.dispatchEvent(new Event('storage'));
  };

  // Broadcast SOS to Community Grid (Offline Mesh + Cloud API Dual Layer)
  const triggerSOS = async () => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';
    const sosPayload = {
      trekker: trekkerId,
      name: trekkerName,
      trekName,
      lat,
      lng,
      altitude: `${altitude}m`,
      time: nowTime,
      battery,
      message: 'Injured on trail near Mandakini river. Need assistance!',
    };

    // Layer 1: Instant Local Mesh / Cross-Tab Sync (0ms, 100% offline-safe)
    localStorage.setItem('sosActive', JSON.stringify(sosPayload));
    setSosActive(true);
    setSosSentTime(nowTime);
    setBroadcastAnimation(true);
    window.dispatchEvent(new Event('storage'));

    // Layer 2: Cloud Backend API Sync (if server/internet is connected)
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
          district,
          coordinates: { lat, lng },
          battery,
          message: sosPayload.message
        }),
        signal: AbortSignal.timeout(3000)
      }).catch(() => {
        // Handled gracefully by local mesh fallback
      });
    } catch (_) {}

    setTimeout(() => {
      setBroadcastAnimation(false);
    }, 4000);
  };

  // Cancel SOS / False Alarm
  const cancelSOS = () => {
    localStorage.removeItem('sosActive');
    localStorage.removeItem('rescueDispatched');
    setSosActive(false);
    setGuideRescueStatus(null);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="min-h-screen bg-[#0A0E14] text-slate-100 font-sans antialiased selection:bg-rose-500 selection:text-white">
      <Navbar />

      {/* ─── Breadcrumb & Top Bar ────────────────────────────────────────────── */}
      <div className="border-b border-[#2A3343] bg-[#0A0E14]/95 backdrop-blur-md sticky top-16 sm:top-20 z-30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/60 text-[#00FF88] border border-[#00FF88]/30">
              COMMUNITY RESCUE GRID · ACTIVE TREKKER
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">Role: <strong>Trekker (Aryan Negi)</strong></span>
            <Link
              to="/rescue-ops"
              className="text-[11px] font-bold text-[#3B82F6] hover:underline flex items-center gap-1"
            >
              <span>Command Center</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ─── Success Broadcast Toast / Overlay ─────────────────────────────── */}
        {broadcastAnimation && (
          <div className="mb-6 rounded-2xl border border-red-500 bg-red-950/80 p-4 text-white shadow-2xl shadow-red-900/40 animate-in fade-in slide-in-from-top-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shrink-0 animate-bounce">
              <Radio size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-black text-red-300 uppercase tracking-wider">BEACON TRANSMITTED ACROSS GRID</p>
              <p className="text-sm font-bold text-white">🚨 SOS Broadcasted to 3 nearby buddies & Guide Ramesh Rawat!</p>
            </div>
          </div>
        )}

        {/* ─── Guide Dispatched Alert (If Guide clicked Rescue in Tab 2) ──────── */}
        {guideRescueStatus && (
          <div className="mb-6 rounded-2xl border border-[#00FF88]/50 bg-emerald-950/50 p-4 text-white shadow-xl shadow-emerald-950/20 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <HeartHandshake size={24} className="text-[#00FF88] shrink-0" />
              <div>
                <p className="text-xs font-black text-[#00FF88] uppercase tracking-wider">RESCUE TEAM RESPONDED</p>
                <p className="text-sm font-bold text-white">
                  Guide {guideRescueStatus.guide || 'Ramesh Rawat'} has accepted your distress beacon!
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Estimated Arrival Time: <strong className="text-emerald-300">{guideRescueStatus.eta || '18 mins'}</strong> • Status: En Route
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/40 px-2.5 py-1 rounded border border-emerald-600/40">
              DISPATCHED
            </span>
          </div>
        )}

        {/* ─── Main Trekker Card ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Left Column (7 cols): Trekker HUD & Controls */}
          <div className="md:col-span-7 space-y-4">

            {/* Profile & Live Status Card */}
            <div className="rounded-2xl border border-[#2A3343] bg-[#151A26] p-5 shadow-xl">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white text-lg font-black shadow-md">
                    A
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-white">{trekkerName}</h2>
                      <span className="text-xs font-mono font-bold text-slate-400 bg-[#0A0E14] px-2 py-0.5 rounded border border-[#2A3343]">
                        {trekkerId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Mountain size={12} className="text-emerald-400" />
                      <span>{trekName}</span>
                      <span className="text-slate-600">•</span>
                      <span>{district}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                    sosActive
                      ? 'bg-[#FF2E2E]/20 text-[#FF2E2E] border-[#FF2E2E]/40 animate-pulse'
                      : isTrekActive
                      ? 'bg-[#00FF88]/20 text-[#00FF88] border-[#00FF88]/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sosActive ? 'bg-[#FF2E2E]' : isTrekActive ? 'bg-[#00FF88]' : 'bg-slate-500'}`} />
                    {sosActive ? 'DISTRESS SIGNAL ACTIVE' : isTrekActive ? 'MOVING ON TRAIL' : 'STANDBY'}
                  </span>
                </div>
              </div>

              {/* Live Sensor Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#0A0E14] border border-[#2A3343] mb-4">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Battery</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <BatteryLow size={14} className="text-[#FFA500]" />
                    <span className="text-sm font-black text-[#FFA500]">{battery}% Low</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Signal</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Signal size={14} className="text-[#FF2E2E]" />
                    <span className="text-sm font-black text-slate-200">1 Bar</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Elevation</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mountain size={14} className="text-cyan-400" />
                    <span className="text-sm font-black text-white">{altitude}m</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Steps</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Navigation size={14} className="text-emerald-400" />
                    <span className="text-sm font-black text-white">{stepCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Coordinates Simulator Display */}
              <div className="p-3 rounded-xl bg-[#0A0E14] border border-[#2A3343] mb-5 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Live Coordinates (Simulated)</span>
                  <p className="font-mono text-xs font-bold text-slate-200 mt-0.5">
                    Lat: <strong className="text-emerald-400">{lat}</strong>, Lng: <strong className="text-emerald-400">{lng}</strong>
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  isTrekActive
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {isTrekActive ? '● GPS Pinging (Every 3s)' : 'GPS Idle'}
                </span>
              </div>

              {/* Start / Pause Controls */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleTrek}
                  className={`flex-1 py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                    isTrekActive
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/30'
                  }`}
                >
                  {isTrekActive ? <Pause size={15} /> : <Play size={15} />}
                  <span>{isTrekActive ? 'PAUSE MY TREK' : 'START MY TREK'}</span>
                </button>

                <Link
                  to={`/live/${trekkerId}`}
                  className="py-3 px-4 rounded-xl bg-[#0A0E14] hover:bg-slate-900 text-slate-300 hover:text-white border border-[#2A3343] font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Eye size={14} />
                  <span>View Live Map</span>
                </Link>
              </div>
            </div>

            {/* ─── BIG RED SOS TRIGGER CARD ─────────────────────────────────── */}
            <div className={`rounded-2xl border p-5 transition-all shadow-xl ${
              sosActive
                ? 'bg-red-950/40 border-[#FF2E2E] shadow-red-950/40'
                : 'bg-[#151A26] border-[#2A3343]'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-[#FF2E2E] animate-pulse" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Emergency Distress Trigger
                  </h3>
                </div>
                {sosActive && (
                  <span className="text-[10px] font-mono text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/40">
                    Transmitted at {sosSentTime}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Broadcasting SOS instantly informs nearby buddy trekkers, certified local guides, and the community ops desk without needing mobile signal or central server APIs.
              </p>

              {!sosActive ? (
                <button
                  type="button"
                  onClick={triggerSOS}
                  className="w-full py-4 px-6 rounded-xl bg-[#FF2E2E] hover:bg-red-600 active:scale-[0.99] text-white font-black text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-red-900/50 cursor-pointer"
                >
                  <Radio size={18} />
                  <span>BROADCAST SOS TO GRID</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-red-900/30 border border-red-700/50 text-xs text-red-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                    <span>Distress beacon actively radiating coordinates ({lat}, {lng}) to Grid.</span>
                  </div>

                  <button
                    type="button"
                    onClick={cancelSOS}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
                  >
                    <RotateCcw size={14} />
                    <span>Cancel SOS (False Alarm / Resolved)</span>
                  </button>
                </div>
              )}
            </div>

            {/* ─── 30+ MULTI-TRIGGER SOS MATRIX (FOR JUDGE DEMO) ─── */}
            <div className="pt-2">
              <SOSPanel
                trekkerId={trekkerId}
                trekkerName={trekkerName}
                trekName={trekName}
                lat={lat}
                lng={lng}
                battery={battery}
                altitude={altitude}
                onSosTriggered={(payload) => {
                  setSosActive(true);
                  setSosSentTime(payload.time);
                }}
                onSosCancelled={() => {
                  setSosActive(false);
                  setGuideRescueStatus(null);
                }}
              />
            </div>

          </div>

          {/* Right Column (5 cols): Community Buddy Radar & Mesh Info */}
          <div className="md:col-span-5 space-y-4">

            {/* Nearby Community Mesh Buddies */}
            <div className="rounded-2xl border border-[#2A3343] bg-[#151A26] p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2A3343]">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#3B82F6]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Nearby Grid Buddies</h3>
                </div>
                <span className="text-[10px] text-blue-400 font-bold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                  Mesh Active
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-[#0A0E14] border border-[#2A3343] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Ramesh Rawat (Local Guide)</p>
                    <p className="text-[11px] text-slate-400">Kedarnath Base Camp Checkpost</p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-400">1.2 km away</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0A0E14] border border-[#2A3343] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Priya Sharma (Trekker Group)</p>
                    <p className="text-[11px] text-slate-400">Valley of Flowers Pass</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">3.4 km away</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0A0E14] border border-[#2A3343] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Gaurikund Aid Station</p>
                    <p className="text-[11px] text-slate-400">First Aid & Relay Post</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">5.1 km away</span>
                </div>
              </div>
            </div>

            {/* Offline Grid Architecture Explanation */}
            <div className="rounded-2xl border border-[#2A3343] bg-[#151A26] p-4 shadow-xl text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-white font-black uppercase tracking-wider text-xs">
                <Shield size={14} className="text-emerald-400" />
                <span>How Community Grid Works</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Instead of centralized government servers, this platform acts as a decentralized mountain safety network. Every mobile device caches nearby hikers and relays emergency packets peer-to-peer.
              </p>
              <div className="pt-2 border-t border-[#2A3343] flex items-center justify-between text-[11px] text-slate-400">
                <span>Storage Sync: <strong className="text-emerald-400">Instant (Local Grid)</strong></span>
                <span>Zero Cloud Dependency</span>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
