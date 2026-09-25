import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Battery, Wifi, WifiOff, Phone, MessageSquare,
  AlertTriangle, Navigation, Clock, Users, Mountain,
  Shield, Radio, ChevronUp, ChevronDown, Zap, Signal
} from 'lucide-react';

// ─── Simulated demo data ─────────────────────────────────────────────────────
// In production, this would fetch from your backend via /api/live/:tripId
function getMockSession(tripId) {
  const startTs = Date.now() - 87 * 60 * 1000; // 87 min ago
  return {
    tripId,
    trekName: 'Kedarnath Yatra — Batch A',
    guide: { name: 'Ramesh Negi', phone: '+919871234567', photo: null },
    trekkers: [
      { name: 'Rahul Sharma', age: 28, status: 'MISSING', lastPing: '14:30 IST', id: 'TRK-78421' },
      { name: 'Priya Mehta', age: 26, status: 'Active', lastPing: '14:28 IST', id: 'TRK-78422' },
      { name: 'Arjun Singh', age: 32, status: 'Active', lastPing: '14:29 IST', id: 'TRK-78423' },
    ],
    district: 'Rudraprayag',
    currentTrekker: {
      name: 'Aryan Negi',
      age: 28,
      gender: 'Male',
      plannedTrek: 'Kedarnatha Trail',
      status: 'MISSING',
      lastPing: '14:30 IST',
      id: tripId,
      groupSize: 'Solo',
    },
    trail: [
      { lat: 30.52, lng: 78.43, ts: startTs, label: '14:05 · Basecamp Start', point: 1 },
      { lat: 30.55, lng: 78.52, ts: startTs + 7*60000, label: '14:12 · Point 2', point: 2 },
      { lat: 30.58, lng: 78.60, ts: startTs + 17*60000, label: '14:22 · Point 3', point: 3 },
      { lat: 30.61, lng: 78.70, ts: startTs + 19*60000, label: '14:24 · Point 4', point: 4 },
      { lat: 30.63, lng: 78.85, ts: startTs + 25*60000, label: '14:30 · LAST LOCATION', point: 5 },
    ],
    battery: 27,
    signal: 'Weak · 1 bar',
    temperature: '6°C',
    elevation: '2,740 m',
    distanceTraveled: '8.4 km',
    estimatedRescueTime: '42 min',
    startTs,
    sosActive: true,
    smsLog: [
      { time: '14:30', sender: 'SYSTEM', msg: 'Trekker device sent SOS signal. Coordinates: 30.52°N, 78.43°E', sos: true },
      { time: '14:27', sender: 'TREKKER', msg: 'Lost trail near river, weather worsening, still moving south' },
      { time: '14:22', sender: 'TREKKER', msg: 'Battery low at 30%, cold, no shelter yet' },
      { time: '14:18', sender: 'TREKKER', msg: 'Made it to stream, following downhill path' },
      { time: '14:10', sender: 'TREKKER', msg: 'Reached checkpoint 3, weather clear' },
    ],
  };
}

const EMERGENCY_CONTACTS = [
  { label: 'Rescue Team Lead', name: 'Capt. R. Singh', phone: '+91 98765 11234', status: 'ON CALL', color: 'emerald', icon: Shield },
  { label: 'Local Police', name: 'Tehri Garhwal', phone: '+91 01376-232101', status: 'AVAILABLE', color: 'blue', icon: Shield },
  { label: 'District Hospital', name: 'Bhagirathibur', phone: '+91 98765 55678', status: 'STANDBY', color: 'amber', icon: Shield },
];

function formatElapsed(startTs) {
  const secs = Math.floor((Date.now() - startTs) / 1000);
  const h = Math.floor(secs / 3600).toString().padStart(2, '0');
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  return `${h}h ${m}m`;
}

export default function LiveTrackingPage() {
  const { tripId } = useParams();
  const [session] = useState(() => getMockSession(tripId || 'TRK-78421'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const lastPoint = session.trail[session.trail.length - 1];
  const minsAgo = Math.floor((now - lastPoint.ts) / 60000);

  const dialPhone = (phone) => { window.location.href = `tel:${phone.replace(/\s/g, '')}`; };
  const sendSMS = () => {
    const msg = encodeURIComponent(
      `[RECOVERY UPDATE] Trek: ${session.trekName}\nTrip: ${session.tripId}\n` +
      `Last Location: https://maps.google.com/?q=${lastPoint.lat},${lastPoint.lng}\n` +
      `Live Trail: https://discoveryuk.in/live/${session.tripId}`
    );
    window.location.href = `sms:1070?body=${msg}`;
  };

  // Build simple SVG map from trail points (normalized to viewBox 0 0 400 260)
  const minLat = Math.min(...session.trail.map(p => p.lat));
  const maxLat = Math.max(...session.trail.map(p => p.lat));
  const minLng = Math.min(...session.trail.map(p => p.lng));
  const maxLng = Math.max(...session.trail.map(p => p.lng));
  const normX = (lng) => ((lng - minLng) / (maxLng - minLng || 1)) * 340 + 30;
  const normY = (lat) => (1 - (lat - minLat) / (maxLat - minLat || 1)) * 200 + 30;
  const pathD = session.trail.map((p, i) => `${i === 0 ? 'M' : 'L'} ${normX(p.lng)} ${normY(p.lat)}`).join(' ');

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white flex flex-col">

      {/* SOS Alert Banner */}
      {session.sosActive && (
        <div className="bg-rose-700 border-b border-rose-600 px-4 py-2.5 animate-pulse">
          <div className="max-w-5xl mx-auto flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-white shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider text-white">SOS Alert — Trekker Distress Signal Detected |</span>
            </div>
            <span className="text-xs text-rose-100">Location: near Ghuttu, Tehri Garhwal | Action Required: Immediate Dispatch</span>
            <a
              href="tel:1070"
              className="ml-auto shrink-0 px-4 py-1.5 rounded-lg bg-white text-rose-700 text-xs font-black uppercase tracking-wider hover:bg-rose-50 transition-colors"
            >
              Initiate Rescue
            </a>
          </div>
        </div>
      )}

      {/* Top status bar */}
      <div className="bg-[#0d1f14] border-b border-slate-800/60 px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <Radio size={12} className="text-emerald-400" />
            </div>
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Rescue Ops</span>
            <span className="text-[10px] text-slate-500">Response Command Center</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span className={`flex items-center gap-1 ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
              {isOnline ? 'Live' : 'Cached'}
            </span>
            <span>Updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST · 25 Sep 2026</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5 flex-1 grid grid-cols-1 lg:grid-cols-[260px_1fr_240px] gap-5 w-full">

        {/* LEFT: Trekker profile */}
        <div className="space-y-4">
          {/* Profile card */}
          <div className="rounded-2xl border border-slate-700/60 bg-[#0d1f14]/80 p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Trekker Profile</p>
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-2xl font-black text-slate-300">
                {session.currentTrekker.name[0]}
              </div>
              <p className="font-black text-base text-white">{session.currentTrekker.name}</p>
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-slate-600">ID:</span>
                <span className="font-mono text-slate-300">{session.currentTrekker.id}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Users size={10} />
                <span>{session.currentTrekker.age} · {session.currentTrekker.gender}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin size={10} />
                <span>{session.currentTrekker.plannedTrek}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-400 font-bold uppercase text-[10px] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  {session.currentTrekker.status} · No Response
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock size={10} />
                <span>Last Ping: {session.currentTrekker.lastPing}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Users size={10} />
                <span>Group: {session.currentTrekker.groupSize}</span>
              </div>
            </div>
          </div>

          {/* Battery */}
          <div className="rounded-2xl border border-slate-700/60 bg-[#0d1f14]/80 p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Battery Status</p>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${session.battery < 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${session.battery}%` }}
                />
              </div>
              <span className={`text-xs font-black ${session.battery < 30 ? 'text-amber-400' : 'text-emerald-400'}`}>{session.battery}%</span>
            </div>
            <p className={`text-[10px] font-bold ${session.battery < 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {session.battery < 30 ? '⚠ Low Battery' : 'Normal'}
            </p>
          </div>

          {/* Essentials */}
          <div className="rounded-2xl border border-slate-700/60 bg-[#0d1f14]/80 p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Essentials</p>
            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2"><Signal size={11} /> {session.signal}</div>
              <div className="flex items-center gap-2"><span className="text-base">🌡️</span> {session.temperature}</div>
              <div className="flex items-center gap-2"><Mountain size={11} /> {session.elevation}</div>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full py-2.5 rounded-xl border border-slate-600/60 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            Download Trekker Report
          </button>
        </div>

        {/* CENTER: Map + stats */}
        <div className="space-y-4">
          {/* Stat tiles */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-700/60 bg-[#0d1f14]/80 p-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Tracking
              </p>
              <p className="text-sm font-black text-emerald-400">ON</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Real-time GPS · Updated {session.currentTrekker.lastPing}</p>
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-[#0d1f14]/80 p-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                <Navigation size={9} /> Distance Traveled
              </p>
              <p className="text-sm font-black text-white">{session.distanceTraveled}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">From basecamp to last location</p>
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-[#0d1f14]/80 p-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                <Clock size={9} /> Est. Rescue Time
              </p>
              <p className="text-sm font-black text-amber-400">{session.estimatedRescueTime}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">ETA for team arrival</p>
            </div>
          </div>

          {/* Trail Map (SVG Schematic) */}
          <div className="rounded-2xl border border-slate-700/60 bg-[#0d1f14]/80 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/40">
              <div>
                <p className="text-xs font-black text-white">Map · Uttarakhand —</p>
                <p className="text-[10px] text-slate-500">Trekker Trail Path</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-2 py-1 rounded-lg border border-slate-600 text-slate-400">Map Layer: Terrain · Satellite</span>
                <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-emerald-600 text-white">Live</span>
              </div>
            </div>
            <div className="bg-[#0a1a0f] p-2">
              <svg viewBox="0 0 400 260" className="w-full h-auto" style={{ minHeight: 200 }}>
                {/* Faint grid */}
                {[0,1,2,3,4].map(i => (
                  <line key={i} x1={i*80+40} y1={20} x2={i*80+40} y2={240} stroke="#1a2e1f" strokeWidth="0.5" />
                ))}
                {[0,1,2,3].map(i => (
                  <line key={i} x1={20} y1={i*60+30} x2={380} y2={i*60+30} stroke="#1a2e1f" strokeWidth="0.5" />
                ))}

                {/* Trail path */}
                <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />

                {/* Trail points */}
                {session.trail.map((p, i) => {
                  const x = normX(p.lng);
                  const y = normY(p.lat);
                  const isLast = i === session.trail.length - 1;
                  return (
                    <g key={i}>
                      {isLast ? (
                        <>
                          <circle cx={x} cy={y} r={14} fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.4" />
                          <circle cx={x} cy={y} r={8} fill="#ef4444" opacity="0.9" />
                          <text x={x + 12} y={y + 4} fill="#ef4444" fontSize="7" fontWeight="bold">{p.label}</text>
                        </>
                      ) : (
                        <>
                          <circle cx={x} cy={y} r={5} fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                          <text x={x} y={y - 8} textAnchor="middle" fill="#64748b" fontSize="6.5">{p.label}</text>
                          <text x={x} y={y + 4} textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold">{p.point}</text>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Legend */}
              <div className="flex items-center gap-4 px-2 pb-2 text-[9px] text-slate-500 flex-wrap">
                <span className="flex items-center gap-1.5"><span className="inline-block w-4 border-t-2 border-dashed border-blue-500" /> Trail Path (Last 5 locations)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Current Position</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Responder Teams</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: SMS Log + Emergency contacts */}
        <div className="space-y-4">
          {/* SMS Log */}
          <div className="rounded-2xl border border-slate-700/60 bg-[#0d1f14]/80 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white">SMS Log · Live</p>
            </div>
            <div className="p-3 space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar">
              {session.smsLog.map((entry, i) => (
                <div
                  key={i}
                  className={`text-[10px] rounded-lg p-2 border ${
                    entry.sos
                      ? 'bg-rose-900/40 border-rose-700/50 text-rose-200'
                      : 'bg-slate-800/40 border-slate-700/30 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-mono text-[9px] text-slate-500">{entry.time}</span>
                    <span className={`text-[9px] font-black uppercase ${entry.sos ? 'text-rose-400' : 'text-slate-500'}`}>| {entry.sender} →</span>
                  </div>
                  <p className="leading-relaxed">{entry.msg}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency contacts */}
          <div className="rounded-2xl border border-slate-700/60 bg-[#0d1f14]/80 p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Emergency Contacts</p>
            <div className="space-y-2.5">
              {EMERGENCY_CONTACTS.map((c, i) => {
                const statusColors = { 'ON CALL': 'bg-emerald-600 text-white', 'AVAILABLE': 'bg-blue-600 text-white', 'STANDBY': 'bg-amber-500 text-black' };
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => dialPhone(c.phone)}
                      className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                    >
                      <Phone size={13} className="text-slate-300" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-white truncate">{c.label}</p>
                      <p className="text-[9px] text-slate-500">{c.name}</p>
                      <p className="text-[9px] text-slate-500 font-mono">{c.phone}</p>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md shrink-0 ${statusColors[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Send emergency SMS */}
          <button
            type="button"
            onClick={sendSMS}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            <MessageSquare size={14} />
            Send Emergency SMS
          </button>

          {/* Quick dial row */}
          <div className="grid grid-cols-3 gap-2">
            <a href="tel:112" className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-rose-900/40 border border-rose-700/40 hover:bg-rose-900/70 transition-colors cursor-pointer">
              <Phone size={14} className="text-rose-400" />
              <span className="text-[9px] font-black text-rose-300">112</span>
              <span className="text-[8px] text-slate-500">Police</span>
            </a>
            <a href="tel:1070" className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-amber-900/40 border border-amber-700/40 hover:bg-amber-900/70 transition-colors cursor-pointer">
              <Shield size={14} className="text-amber-400" />
              <span className="text-[9px] font-black text-amber-300">1070</span>
              <span className="text-[8px] text-slate-500">SDRF</span>
            </a>
            <Link to="/guide" className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 hover:bg-slate-700/60 transition-colors">
              <Radio size={14} className="text-slate-400" />
              <span className="text-[9px] font-black text-slate-300">Guide</span>
              <span className="text-[8px] text-slate-500">Dashboard</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Mobile bottom drawer for Emergency Actions */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d1f14]/97 border-t border-slate-700/60 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-slate-400 cursor-pointer"
        >
          {drawerOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          Emergency Actions
        </button>
        {drawerOpen && (
          <div className="px-4 pb-4 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <a href="tel:112" className="flex flex-col items-center gap-1 py-3 rounded-xl bg-rose-900/40 border border-rose-700/40">
                <Phone size={16} className="text-rose-400" />
                <span className="text-xs font-black text-rose-300">Police · 112</span>
              </a>
              <a href="tel:1070" className="flex flex-col items-center gap-1 py-3 rounded-xl bg-amber-900/40 border border-amber-700/40">
                <Shield size={16} className="text-amber-400" />
                <span className="text-xs font-black text-amber-300">SDRF · 1070</span>
              </a>
              <button type="button" onClick={sendSMS} className="flex flex-col items-center gap-1 py-3 rounded-xl bg-blue-900/40 border border-blue-700/40 cursor-pointer">
                <MessageSquare size={16} className="text-blue-400" />
                <span className="text-xs font-black text-blue-300">SMS Rescue</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
