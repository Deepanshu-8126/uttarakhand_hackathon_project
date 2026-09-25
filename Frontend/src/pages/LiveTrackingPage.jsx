import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Battery, Wifi, WifiOff, Phone, MessageSquare,
  AlertTriangle, Navigation, Clock, Users, Mountain,
  Shield, Radio, Download, ExternalLink, ArrowLeft,
  ChevronRight, Thermometer, Signal, Flame, FileText, CheckCheck
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ─── Custom Leaflet Icons for Tactical Dark Map ─────────────────────────────
const createNumberIcon = (number, isLast = false) => {
  return L.divIcon({
    className: 'custom-trail-marker',
    html: `
      <div style="
        width: ${isLast ? '34px' : '26px'};
        height: ${isLast ? '34px' : '26px'};
        background-color: ${isLast ? '#FF2E2E' : '#1e293b'};
        color: #ffffff;
        border: 2px solid ${isLast ? '#ffffff' : '#38bdf8'};
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isLast ? '13px' : '10px'};
        font-weight: 900;
        box-shadow: ${isLast ? '0 0 20px rgba(255, 46, 46, 0.8)' : '0 2px 8px rgba(0,0,0,0.5)'};
        transform: translate(-50%, -50%);
        ${isLast ? 'animation: pulse 1.5s infinite;' : ''}
      ">
        ${isLast ? '📍' : number}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

function getMockSession(tripId) {
  const startTs = Date.now() - 87 * 60 * 1000;
  return {
    tripId: tripId || 'TRK-82341',
    trekName: 'Kedarnath Yatra Trail',
    district: 'Tehri Garhwal / Rudraprayag',
    currentTrekker: {
      name: 'Aryan Negi',
      age: 28,
      gender: 'Male',
      plannedTrek: 'Kedarnath Trail',
      status: 'MISSING - NO RESPONSE',
      lastPing: '14:30 IST (12m ago)',
      id: tripId || 'TRK-82341',
      groupSize: 'Solo',
      emergencyContactName: 'Kamla Devi (Mother)',
      emergencyContactPhone: '+91 98765 43211',
    },
    battery: 27,
    signal: 'Weak · 1 Bar',
    temperature: '6°C (Freezing)',
    elevation: '2,740 m',
    distanceTraveled: '8.4 km',
    estimatedRescueTime: '42 min',
    locationDescription: 'Near Ghuttu Gorge, Tehri Garhwal (30.63°N, 78.85°E)',
    trail: [
      { lat: 30.52, lng: 78.43, ts: startTs, label: '14:05 · Basecamp Start', point: 1 },
      { lat: 30.55, lng: 78.52, ts: startTs + 7 * 60000, label: '14:12 · Ridge Point 2', point: 2 },
      { lat: 30.58, lng: 78.60, ts: startTs + 17 * 60000, label: '14:22 · Stream Crossing 3', point: 3 },
      { lat: 30.61, lng: 78.70, ts: startTs + 19 * 60000, label: '14:24 · Forest Checkpoint 4', point: 4 },
      { lat: 30.63, lng: 78.85, ts: startTs + 25 * 60000, label: '14:30 · LAST LOCATION', point: 5 },
    ],
    smsLog: [
      { time: '14:30', sender: 'SYSTEM', msg: 'Trekker device sent SOS distress signal. GPS: 30.63°N, 78.85°E', sos: true },
      { time: '14:27', sender: 'TREKKER', msg: 'Lost trail near river, weather worsening, still moving south' },
      { time: '14:22', sender: 'TREKKER', msg: 'Battery low at 30%, cold, no shelter yet' },
      { time: '14:18', sender: 'TREKKER', msg: 'Made it to stream, following downhill path' },
      { time: '14:10', sender: 'TREKKER', msg: 'Reached checkpoint 3, weather clear' },
    ],
    emergencyContacts: [
      { label: 'Community Rescue Lead', name: 'Guide Ramesh Rawat', phone: '+919876511234', status: 'ON CALL', color: 'emerald' },
      { label: 'Mountain Police Post', name: 'Tehri Garhwal Outpost', phone: '+9101376232101', status: 'AVAILABLE', color: 'blue' },
      { label: 'Hill Clinic & Aid Post', name: 'Bhagirathipur Emergency Aid', phone: '+919876555678', status: 'STANDBY', color: 'amber' },
    ]
  };
}

export default function LiveTrackingPage() {
  const { tripId } = useParams();
  const [session] = useState(() => getMockSession(tripId));
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [reportCopied, setReportCopied] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Real-time synchronization with localStorage mock grid
  const [livePos, setLivePos] = useState(null);
  const [liveSos, setLiveSos] = useState(null);
  const [guideDispatch, setGuideDispatch] = useState(null);

  useEffect(() => {
    const syncGrid = () => {
      try {
        const storedSos = localStorage.getItem('sosActive');
        if (storedSos) setLiveSos(JSON.parse(storedSos));
        else setLiveSos(null);

        const storedTrek = localStorage.getItem('currentTrek');
        if (storedTrek) setLivePos(JSON.parse(storedTrek));

        const storedRescue = localStorage.getItem('rescueDispatched');
        if (storedRescue) setGuideDispatch(JSON.parse(storedRescue));
        else setGuideDispatch(null);
      } catch (_) {}
    };

    syncGrid();
    window.addEventListener('storage', syncGrid);
    const interval = setInterval(syncGrid, 1000);
    return () => {
      window.removeEventListener('storage', syncGrid);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const dynamicTrail = session.trail.map((p, idx) => {
    if (idx === session.trail.length - 1 && (livePos || liveSos)) {
      return {
        ...p,
        lat: liveSos?.lat || livePos?.lat || p.lat,
        lng: liveSos?.lng || livePos?.lng || p.lng,
        label: `LIVE BEACON · ${liveSos ? 'SOS SIGNAL' : 'TRAIL PING'}`
      };
    }
    return p;
  });

  const lastPoint = dynamicTrail[dynamicTrail.length - 1];
  const polylineCoords = dynamicTrail.map(p => [p.lat, p.lng]);

  const handleDownloadReport = () => {
    const reportText = `DISCOVERY UTTARAKHAND — RESCUE OPS INCIDENT REPORT
Trip ID: ${session.tripId}
Trekker: ${session.currentTrekker.name} (Age: ${session.currentTrekker.age}, ${session.currentTrekker.gender})
Trek: ${session.trekName} (${session.district})
Status: ${session.currentTrekker.status}
Last Coordinates: ${lastPoint.lat}°N, ${lastPoint.lng}°E
Elevation: ${session.elevation} | Temperature: ${session.temperature}
Battery: ${session.battery}%
Emergency SMS Broadcast: Dispatched to Family & SDRF 1070
Timestamp: ${new Date().toISOString()}`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rescue_Report_${session.tripId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 3000);
  };

  const handleSendBroadcastSms = () => {
    const phones = '1070,112,' + session.currentTrekker.emergencyContactPhone.replace(/\s/g, '');
    const msg = `[EMERGENCY SOS] Trekker ${session.currentTrekker.name} (${session.tripId}) in distress at ${lastPoint.lat},${lastPoint.lng} near Ghuttu. Bat: ${session.battery}%. Live Trail: https://discoveryuk.in/live/${session.tripId}`;
    window.location.href = `sms:${phones}?body=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="min-h-screen bg-[#0A0E14] text-white flex flex-col font-sans selection:bg-[#00FF88]/30">
      
      {/* ── TOP ALERT BANNER ─────────────────────────────────────────────── */}
      <div className="bg-[#FF2E2E] text-white px-4 py-2.5 shadow-lg border-b border-red-500 animate-pulse">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <AlertTriangle size={18} className="shrink-0" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
              SOS ALERT — TREKKER DISTRESS SIGNAL DETECTED
            </span>
          </div>
          <p className="text-xs text-red-100 font-semibold hidden md:block">
            Location: {session.locationDescription}
          </p>
          <a
            href="tel:1070"
            className="px-4 py-1.5 rounded-xl bg-white text-[#FF2E2E] hover:bg-red-50 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer ml-auto"
          >
            Initiate Rescue Team (1070)
          </a>
        </div>
      </div>

      {/* ── TOP MISSION CONTROL HEADER ───────────────────────────────────── */}
      <header className="bg-[#111722] border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/rescue-ops"
              className="w-8 h-8 rounded-xl bg-[#151A26] border border-slate-700/80 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition"
              title="Return to All Treks Command"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Radio size={16} className="text-[#00FF88]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black uppercase tracking-widest text-[#00FF88]">
                  Rescue Ops Command
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {session.tripId}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Live Field Incident Room · Uttarakhand State Disaster Response Link
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${
              isOnline ? 'bg-emerald-950/40 border-emerald-500/40 text-[#00FF88]' : 'bg-amber-950/40 border-amber-500/40 text-[#FFA500]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#00FF88] animate-pulse' : 'bg-[#FFA500]'}`} />
              <span>{isOnline ? 'Satellite Feed Live' : 'Cached Breadcrumb Buffer'}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              Updated: {new Date(now).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
            </span>
          </div>
        </div>
      </header>

      {/* ── MAIN 3-COLUMN COMMAND DASHBOARD ──────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ══════════════════════════════════════════════════════════════════
            COLUMN 1: TREKKER PROFILE & VITALS (25% -> 3 Cols on LG)
           ══════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Trekker Profile Card */}
          <div className="rounded-2xl bg-[#151A26] border border-slate-800/80 p-5 shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
              <span>Trekker Profile</span>
              <span className="text-slate-500 font-mono text-[9px]">SOLO-EXP</span>
            </p>

            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-800/60">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-slate-600 flex items-center justify-center text-2xl font-black text-white shadow-md shrink-0">
                {session.currentTrekker.name[0]}
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-base text-white truncate">
                  {session.currentTrekker.name}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {session.currentTrekker.age} Yrs · {session.currentTrekker.gender}
                </p>
                <p className="text-[11px] font-mono text-emerald-400 mt-0.5 truncate">
                  {session.currentTrekker.plannedTrek}
                </p>
              </div>
            </div>

            {/* Status Pill */}
            <div className="p-3 rounded-xl bg-red-950/40 border border-[#FF2E2E]/40 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF2E2E] animate-ping shrink-0" />
                <span className="text-xs font-black text-red-200 tracking-wider">
                  {session.currentTrekker.status}
                </span>
              </div>
              <p className="text-[10px] text-red-300/80 mt-1 pl-4.5">
                No beacon handshake since {session.currentTrekker.lastPing}
              </p>
            </div>

            {/* Quick Metadata */}
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Trip ID</span>
                <span className="font-mono font-bold text-white">{session.tripId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Group Type</span>
                <span className="font-bold text-white">{session.currentTrekker.groupSize} Expedition</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Emergency Kin</span>
                <span className="font-bold text-slate-200">{session.currentTrekker.emergencyContactName}</span>
              </div>
            </div>
          </div>

          {/* Battery Status Card */}
          <div className="rounded-2xl bg-[#151A26] border border-slate-800/80 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                <Battery size={15} className="text-[#FFA500]" />
                <span>Battery Status</span>
              </div>
              <span className="text-sm font-black text-[#FFA500] font-mono">
                {session.battery}%
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden mb-2.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 to-[#FFA500] transition-all duration-500 shadow-sm"
                style={{ width: `${session.battery}%` }}
              />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#FFA500]">
              <AlertTriangle size={12} />
              <span>Low Battery Critical Warning</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Device battery below 30%. Screen throttled to conserve beacon ping.
            </p>
          </div>

          {/* Mountain Essentials Card */}
          <div className="rounded-2xl bg-[#151A26] border border-slate-800/80 p-5 shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3.5">
              Mountain Essentials
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#1c2333] border border-slate-800">
                <span className="flex items-center gap-2 text-slate-400">
                  <Signal size={13} className="text-[#FFA500]" />
                  <span>Signal</span>
                </span>
                <span className="font-bold text-slate-200">{session.signal}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#1c2333] border border-slate-800">
                <span className="flex items-center gap-2 text-slate-400">
                  <Thermometer size={13} className="text-sky-400" />
                  <span>Ambient Temp</span>
                </span>
                <span className="font-bold text-sky-200">{session.temperature}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#1c2333] border border-slate-800">
                <span className="flex items-center gap-2 text-slate-400">
                  <Mountain size={13} className="text-emerald-400" />
                  <span>Elevation</span>
                </span>
                <span className="font-bold text-emerald-200">{session.elevation}</span>
              </div>
            </div>
          </div>

          {/* Download Report Button */}
          <button
            type="button"
            onClick={handleDownloadReport}
            className="w-full py-3 rounded-xl border border-slate-700 bg-[#151A26] hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
          >
            {reportCopied ? <CheckCheck size={14} className="text-[#00FF88]" /> : <Download size={14} />}
            <span>{reportCopied ? 'Report Saved to Device' : 'Download Trekker Report'}</span>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            COLUMN 2: MAP & LIVE TRACKING ENGINE (45% -> 6 Cols on LG)
           ══════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Top 3 Stats Tiles Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Stat 1 */}
            <div className="rounded-2xl bg-[#151A26] border border-slate-800/80 p-4 shadow-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Tracking Status
                </span>
                <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-ping" />
              </div>
              <p className="text-xl font-black text-[#00FF88]">LIVE ON</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Updated {session.currentTrekker.lastPing}
              </p>
            </div>

            {/* Stat 2 */}
            <div className="rounded-2xl bg-[#151A26] border border-slate-800/80 p-4 shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Distance Traveled
              </span>
              <p className="text-xl font-black text-white">{session.distanceTraveled}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                From Basecamp to Last Ping
              </p>
            </div>

            {/* Stat 3 */}
            <div className="rounded-2xl bg-[#151A26] border border-slate-800/80 p-4 shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Est. Rescue Time
              </span>
              <p className="text-xl font-black text-[#FFA500]">{guideDispatch?.eta || session.estimatedRescueTime}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Community Grid Response ETA
              </p>
            </div>

          </div>

          {/* Guide Dispatch Status Banner */}
          {guideDispatch && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in shadow-lg shadow-emerald-950/30">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] animate-ping shrink-0" />
                <div>
                  <span className="font-bold text-white">
                    Guide {guideDispatch.guide || 'Ramesh Rawat'} has accepted distress beacon!
                  </span>
                  <p className="text-[11px] text-emerald-300">
                    En route to coordinates ({lastPoint.lat.toFixed(4)}, {lastPoint.lng.toFixed(4)}) • Incoming ETA: {guideDispatch.eta || '18 mins'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-600/40 shrink-0">
                DISPATCHED
              </span>
            </div>
          )}

          {/* Interactive Dark Leaflet Terrain Map Card */}
          <div className="rounded-2xl bg-[#151A26] border border-slate-800/80 overflow-hidden shadow-2xl flex flex-col">
            
            {/* Map Header Strip */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-[#111722]">
              <div>
                <p className="text-xs font-black text-white uppercase tracking-wider">
                  Uttarakhand Field Tactical Map
                </p>
                <p className="text-[11px] text-slate-400">
                  Dotted Blue Trail with 5 Checkpoint Pings
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  Dark Satellite Radar
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#00FF88] text-slate-950">
                  FEED ACTIVE
                </span>
              </div>
            </div>

            {/* Real Interactive Leaflet Map Component */}
            <div className="h-[430px] w-full relative bg-[#0A0E14]">
              <MapContainer
                center={[lastPoint.lat, lastPoint.lng]}
                zoom={11}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
              >
                {/* CartoDB Dark Matter High-Tech Tile Layer */}
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Glowing Dotted Blue Trail Polyline */}
                <Polyline
                  positions={polylineCoords}
                  pathOptions={{
                    color: '#38bdf8',
                    weight: 3.5,
                    dashArray: '8, 8',
                    opacity: 0.85
                  }}
                />

                {/* Markers for Trail Points 1 to 4 */}
                {session.trail.slice(0, 4).map((p, idx) => (
                  <Marker
                    key={p.point}
                    position={[p.lat, p.lng]}
                    icon={createNumberIcon(p.point, false)}
                  >
                    <Popup className="tactical-popup">
                      <div className="text-xs text-slate-900 font-sans p-1">
                        <p className="font-black">{p.label}</p>
                        <p className="text-[10px] text-slate-600 font-mono">
                          {p.lat.toFixed(4)}°N, {p.lng.toFixed(4)}°E
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Distress Red Beacon Marker for Last Point */}
                <Marker
                  position={[lastPoint.lat, lastPoint.lng]}
                  icon={createNumberIcon(5, true)}
                >
                  <Popup className="tactical-popup">
                    <div className="text-xs text-slate-900 font-sans p-1">
                      <p className="font-black text-red-600 uppercase">🚨 DISTRESS BEACON ACTIVE</p>
                      <p className="font-bold">{lastPoint.label}</p>
                      <p className="text-[10px] font-mono text-slate-700">
                        Coords: {lastPoint.lat}°N, {lastPoint.lng}°E
                      </p>
                    </div>
                  </Popup>
                </Marker>

                {/* Pulse ring around last point */}
                <CircleMarker
                  center={[lastPoint.lat, lastPoint.lng]}
                  radius={28}
                  pathOptions={{
                    color: '#FF2E2E',
                    fillColor: '#FF2E2E',
                    fillOpacity: 0.15,
                    weight: 1.5,
                    dashArray: '4, 4'
                  }}
                />
              </MapContainer>

              {/* In-Map Floating Elevation Chip */}
              <div className="absolute bottom-4 left-4 z-[400] bg-[#151A26]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] font-bold text-slate-300 flex items-center gap-2 shadow-lg">
                <Mountain size={13} className="text-[#00FF88]" />
                <span>Elevation: 2,740m · Gorge Terrain</span>
              </div>
            </div>

            {/* Map Legend Footer */}
            <div className="px-5 py-3 border-t border-slate-800/80 bg-[#111722] flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-4 border-t-2 border-dashed border-sky-400" />
                  <span>Trail Path (5 Points)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF2E2E] shadow-[0_0_8px_#FF2E2E]" />
                  <span className="text-white font-bold">Current Distress Position</span>
                </span>
              </div>

              <a
                href={`https://www.google.com/maps?q=${lastPoint.lat},${lastPoint.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00FF88] hover:underline flex items-center gap-1 font-bold text-[11px]"
              >
                <span>Satellite Coordinates Link</span>
                <ExternalLink size={12} />
              </a>
            </div>

          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════════
            COLUMN 3: LIVE LOGS & EMERGENCY ACTION CONSOLE (30% -> 3 Cols)
           ══════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Card: SMS Log • Live */}
          <div className="rounded-2xl bg-[#151A26] border border-slate-800/80 p-5 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3.5">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-ping" />
                <span>SMS Log • Live</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">2-Way Relay</span>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {session.smsLog.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs leading-relaxed transition ${
                    log.sos
                      ? 'bg-red-950/40 border-red-500/50 text-red-100 shadow-[0_0_12px_rgba(255,46,46,0.15)]'
                      : 'bg-[#1a2233] border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span className="font-bold text-slate-300">{log.time} IST</span>
                    <span className={`px-1.5 py-0.2 rounded font-black uppercase text-[9px] ${
                      log.sos ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {log.sender}
                    </span>
                  </div>
                  <p className="font-medium text-[11px]">{log.msg}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Emergency Contacts */}
          <div className="rounded-2xl bg-[#151A26] border border-slate-800/80 p-5 shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3.5">
              Emergency Contacts
            </p>

            <div className="space-y-2.5">
              {session.emergencyContacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#1a2233] border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-white text-[11px] truncate">{contact.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{contact.phone}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      contact.status === 'ON CALL'
                        ? 'bg-emerald-950 text-[#00FF88] border border-emerald-500/40'
                        : contact.status === 'AVAILABLE'
                          ? 'bg-blue-950 text-sky-400 border border-sky-500/40'
                          : 'bg-amber-950 text-[#FFA500] border border-amber-500/40'
                    }`}>
                      {contact.status}
                    </span>
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, '')}`}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition"
                      title="Direct Call"
                    >
                      <Phone size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Action: Send Emergency SMS */}
          <button
            type="button"
            onClick={handleSendBroadcastSms}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-[0_0_25px_rgba(59,130,246,0.35)] cursor-pointer active:scale-95"
          >
            <MessageSquare size={17} />
            <span>SEND EMERGENCY SMS</span>
          </button>

          {/* Secondary Actions Row: 112 Police, 1070 SDRF, Guide Hub */}
          <div className="grid grid-cols-3 gap-2">
            <a
              href="tel:112"
              className="py-2.5 rounded-xl bg-[#1c2333] hover:bg-slate-700 border border-slate-700 text-center text-xs font-bold text-slate-200 transition cursor-pointer flex flex-col items-center justify-center gap-1"
            >
              <Phone size={13} className="text-sky-400" />
              <span>112 Police</span>
            </a>

            <a
              href="tel:1070"
              className="py-2.5 rounded-xl bg-[#1c2333] hover:bg-slate-700 border border-slate-700 text-center text-xs font-bold text-slate-200 transition cursor-pointer flex flex-col items-center justify-center gap-1"
            >
              <Shield size={13} className="text-red-400" />
              <span>Grid Line 1070</span>
            </a>

            <Link
              to="/guide"
              className="py-2.5 rounded-xl bg-[#1c2333] hover:bg-slate-700 border border-slate-700 text-center text-xs font-bold text-slate-200 transition cursor-pointer flex flex-col items-center justify-center gap-1"
            >
              <Radio size={13} className="text-[#00FF88]" />
              <span>Guide Hub</span>
            </Link>
          </div>

        </div>

      </main>

    </div>
  );
}
