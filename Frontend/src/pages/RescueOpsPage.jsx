import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, AlertTriangle, MapPin, Clock, Users, Mountain,
  Battery, BatteryLow, BatteryMedium, Signal, Radio, Phone,
  ChevronRight, Thermometer, Wifi, Bell, Send, CheckCircle2,
  AlertCircle, Search, ExternalLink, Activity, ArrowUpRight,
  HeartHandshake, RadioTower
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { sosApi } from '../api/sosApi';

// ─── Initial Base Treks ────────────────────────────────────────────────────────
const BASE_TREKS = [
  {
    id: 'TRK-82341',
    name: 'Kedarnath Yatra A',
    district: 'Rudraprayag',
    trekkerName: 'Aryan Negi',
    groupSize: 'Solo (1 Trekker)',
    lastPing: '14:30 IST',
    battery: 27,
    batteryLabel: '27% Low',
    signal: 'Weak (1 Bar)',
    signalLevel: 1,
    temp: '6°C',
    altitude: '3,583m',
  },
  {
    id: 'TRK-72910',
    name: 'Valley of Flowers',
    district: 'Chamoli',
    trekkerName: 'Priya Sharma',
    groupSize: 'Group of 5',
    lastPing: '14:22 IST',
    battery: 54,
    batteryLabel: '54% Mid',
    signal: 'Fair (2 Bars)',
    signalLevel: 2,
    temp: '9°C',
    status: 'Warning',
    statusBadge: 'DELAYED',
    borderColor: '#FFA500',
    statusBg: 'bg-[#FFA500]/15 text-[#FFA500] border-[#FFA500]/40',
    dotColor: '#FFA500',
    lat: 30.72,
    lng: 79.61,
    altitude: '3,200m',
    alertMessage: 'Heavy fog on pass. Behind scheduled checkpoint arrival by 65 min.',
  },
  {
    id: 'TRK-55219',
    name: 'Har Ki Dun',
    district: 'Uttarkashi',
    trekkerName: 'Rohan Mehra',
    groupSize: '4 Trekkers',
    lastPing: '14:18 IST',
    battery: 82,
    batteryLabel: '82% Good',
    signal: 'Strong (4 Bars)',
    signalLevel: 4,
    temp: '12°C',
    status: 'Active',
    statusBadge: 'ON TRACK',
    borderColor: '#00FF88',
    statusBg: 'bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/40',
    dotColor: '#00FF88',
    lat: 31.10,
    lng: 78.40,
    altitude: '3,566m',
    alertMessage: null,
  },
  {
    id: 'TRK-91204',
    name: 'Chopta Tungnath',
    district: 'Rudraprayag',
    trekkerName: 'Amit Joshi',
    groupSize: '2 Trekkers',
    lastPing: '14:15 IST',
    battery: 76,
    batteryLabel: '76% Good',
    signal: 'Good (3 Bars)',
    signalLevel: 3,
    temp: '8°C',
    status: 'Active',
    statusBadge: 'ON TRACK',
    borderColor: '#00FF88',
    statusBg: 'bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/40',
    dotColor: '#00FF88',
    lat: 30.48,
    lng: 79.21,
    altitude: '2,680m',
    alertMessage: null,
  },
  {
    id: 'TRK-66510',
    name: 'Auli Ski Expedition',
    district: 'Chamoli',
    trekkerName: 'Vikram Sen',
    groupSize: '6 Trekkers',
    lastPing: '14:10 IST',
    battery: 64,
    batteryLabel: '64% Mid',
    signal: 'Strong (4 Bars)',
    signalLevel: 4,
    temp: '4°C',
    status: 'Active',
    statusBadge: 'ON TRACK',
    borderColor: '#00FF88',
    statusBg: 'bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/40',
    dotColor: '#00FF88',
    lat: 30.52,
    lng: 79.57,
    altitude: '2,800m',
    alertMessage: null,
  },
  {
    id: 'TRK-43801',
    name: 'Nag Tibba Summit',
    district: 'Tehri Garhwal',
    trekkerName: 'Neha Rawat',
    groupSize: '3 Trekkers',
    lastPing: '14:05 IST',
    battery: 89,
    batteryLabel: '89% Full',
    signal: 'Strong (4 Bars)',
    signalLevel: 4,
    temp: '14°C',
    status: 'Active',
    statusBadge: 'ON TRACK',
    borderColor: '#00FF88',
    statusBg: 'bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/40',
    dotColor: '#00FF88',
    lat: 30.58,
    lng: 78.15,
    altitude: '3,022m',
    alertMessage: null,
  },
];

// Online Certified Mountain Guides (Community Network)
const REGISTERED_GUIDES = [
  { name: 'Ramesh Rawat', district: 'Rudraprayag', location: 'Kedarnath Base Camp Checkpost', phone: '+919871234567', status: 'On Standby' },
  { name: 'Suresh Kumar', district: 'Chamoli', location: 'Ghangaria Pass Checkpost', phone: '+919876501234', status: 'Patrolling' },
  { name: 'Deepak Rawat', district: 'Chamoli', location: 'Joshimath Relay Station', phone: '+919812398765', status: 'Ready Deploy' },
];

export default function RescueOpsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL'); // ALL | SOS | WARNING | ACTIVE
  const [searchQuery, setSearchQuery] = useState('');
  const [broadcastAlertActive, setBroadcastAlertActive] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [alertSuccessToast, setAlertSuccessToast] = useState(false);

  // Live state synchronized with backend MongoDB & local mesh storage
  const [liveSos, setLiveSos] = useState(null);
  const [liveTrekPos, setLiveTrekPos] = useState(null);
  const [rescueDispatchInfo, setRescueDispatchInfo] = useState(null);
  const [dbSosAlerts, setDbSosAlerts] = useState([]);

  useEffect(() => {
    const fetchDbAlerts = async () => {
      try {
        const res = await sosApi.getActiveAlerts();
        if (res.success && Array.isArray(res.data)) {
          setDbSosAlerts(res.data);
        }
      } catch (e) {
        // Fallback gracefully
      }
    };

    fetchDbAlerts();
    const dbInterval = setInterval(fetchDbAlerts, 4000);

    const syncGrid = () => {
      try {
        const storedSos = localStorage.getItem('devbhoomi_active_sos_v1') || localStorage.getItem('sosActive');
        if (storedSos) {
          setLiveSos(JSON.parse(storedSos));
        } else {
          setLiveSos(null);
        }

        const storedTrek = localStorage.getItem('currentTrek');
        if (storedTrek) {
          setLiveTrekPos(JSON.parse(storedTrek));
        }

        const storedRescue = localStorage.getItem('rescueDispatched');
        if (storedRescue) {
          setRescueDispatchInfo(JSON.parse(storedRescue));
        } else {
          setRescueDispatchInfo(null);
        }
      } catch (_) {}
    };

    syncGrid();
    window.addEventListener('storage', syncGrid);
    const interval = setInterval(syncGrid, 1000);
    return () => {
      window.removeEventListener('storage', syncGrid);
      clearInterval(interval);
      clearInterval(dbInterval);
    };
  }, []);

  // Format real DB alerts into trek telemetry objects
  const convertedDbAlerts = dbSosAlerts.map((alert) => ({
    id: alert.alertCode,
    name: `${alert.incidentType.replace(/_/g, ' ')} (${alert.location?.nearestLandmark || 'Mountain Trail'})`,
    district: alert.location?.district || 'Uttarakhand',
    trekkerName: alert.travelerName || 'Tourist in Distress',
    groupSize: 'Distress Beacon',
    lastPing: 'LIVE SIGNAL',
    battery: alert.deviceTelemetry?.batteryLevel ?? 50,
    batteryLabel: `${alert.deviceTelemetry?.batteryLevel ?? 50}%`,
    signal: alert.deviceTelemetry?.networkStatus || 'Online',
    signalLevel: 3,
    temp: '4°C',
    altitude: `${alert.location?.altitude || 3200}m`,
    status: alert.status === 'DISPATCHED' ? 'Warning' : 'SOS',
    statusBadge: alert.status === 'DISPATCHED' ? 'DISPATCHED' : 'CRITICAL SOS',
    borderColor: '#FF2E2E',
    statusBg: 'bg-[#FF2E2E]/15 text-[#FF2E2E] border-[#FF2E2E]/40',
    dotColor: '#FF2E2E',
    lat: alert.location?.lat || 30.7346,
    lng: alert.location?.lng || 79.0669,
    alertMessage: `${alert.message} · Assigned: ${alert.rescueDetails?.assignedTeam || 'SDRF Rapid Team'}`
  }));

  // Construct dynamic trek list with live telemetry + real database alerts
  const treks = [
    ...convertedDbAlerts,
    ...BASE_TREKS.map((trek) => {
    if (trek.id === 'TRK-82341') {
      const isSos = Boolean(liveSos) && !convertedDbAlerts.some(a => a.id === liveSos.alertCode);
      return {
        ...trek,
        status: isSos ? 'SOS' : 'Active',
        statusBadge: isSos ? 'MISSING' : 'ON TRACK',
        borderColor: isSos ? '#FF2E2E' : '#00FF88',
        statusBg: isSos
          ? 'bg-[#FF2E2E]/15 text-[#FF2E2E] border-[#FF2E2E]/40'
          : 'bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/40',
        dotColor: isSos ? '#FF2E2E' : '#00FF88',
        lat: liveSos?.location?.lat || liveSos?.lat || liveTrekPos?.lat || 30.7346,
        lng: liveSos?.location?.lng || liveSos?.lng || liveTrekPos?.lng || 79.0669,
        battery: liveSos?.deviceTelemetry?.batteryLevel || liveSos?.battery || liveTrekPos?.battery || 27,
        lastPing: liveSos?.createdAt ? new Date(liveSos.createdAt).toLocaleTimeString() : (liveSos?.time || liveTrekPos?.lastPing || '14:30 IST'),
        alertMessage: isSos
          ? (liveSos?.message || 'SOS distress beacon active. No heartbeat ping received for 42 minutes.')
          : null,
      };
    }
    return trek;
  })];

  const activeSosCount = treks.filter(t => t.status === 'SOS').length;
  const warningsCount = treks.filter(t => t.status === 'Warning').length;
  const activeCount = treks.filter(t => t.status === 'Active').length;

  // Filter logic
  const filteredTreks = treks.filter((trek) => {
    const matchesFilter =
      filter === 'ALL' ? true :
      filter === 'SOS' ? trek.status === 'SOS' :
      filter === 'WARNING' ? trek.status === 'Warning' :
      filter === 'ACTIVE' ? trek.status === 'Active' : true;

    const matchesSearch =
      trek.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trek.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trek.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trek.trekkerName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastAlertActive(false);
    setAlertSuccessToast(true);
    setTimeout(() => setAlertSuccessToast(false), 4500);
    setBroadcastMessage('');
  };

  return (
    <div className="min-h-screen bg-[#0A0E14] text-slate-100 font-sans antialiased selection:bg-[#3B82F6]/30">
      <Navbar />

      {/* ─── Toast Notification for Broadcast ─────────────────────────────────── */}
      {alertSuccessToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#151A26] border border-[#00FF88]/50 text-white px-5 py-3 rounded-xl shadow-2xl shadow-[#00FF88]/10 flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={18} className="text-[#00FF88]" />
          <div>
            <p className="text-xs font-black text-[#00FF88]">COMMUNITY BROADCAST TRANSMITTED</p>
            <p className="text-[11px] text-slate-300">P2P mesh advisory dispatched to all 13 mountain district relay posts.</p>
          </div>
        </div>
      )}

      {/* ─── HEADER SECTION ──────────────────────────────────────────────────── */}
      <div className="border-b border-[#2A3343] bg-[#0A0E14]/95 backdrop-blur-md sticky top-16 sm:top-20 z-30 px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-full max-w-[1800px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${activeSosCount > 0 ? 'bg-[#FF2E2E]' : 'bg-[#00FF88]'} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${activeSosCount > 0 ? 'bg-[#FF2E2E]' : 'bg-[#00FF88]'}`} />
              </span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                activeSosCount > 0
                  ? 'bg-[#FF2E2E]/20 text-[#FF2E2E] border-[#FF2E2E]/30'
                  : 'bg-emerald-950/60 text-[#00FF88] border-[#00FF88]/30'
              }`}>
                {activeSosCount > 0 ? 'LIVE COMMAND · DISTRESS BEACON' : 'LIVE COMMAND · ALL SECURE'}
              </span>
              <h1 className="text-base sm:text-xl font-black tracking-tight text-white">
                RESCUE OPS — Uttarakhand Community Rescue Grid
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>13 Districts Monitoring</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Decentralized Mountain Safety & Buddy Network</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-medium">Last updated: Just now</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/trekker"
              className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-[#3B82F6]/50 bg-[#3B82F6]/10 text-blue-300 hover:text-white hover:bg-[#3B82F6]/20 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Users size={14} className="text-[#3B82F6]" />
              <span>Trekker Simulator</span>
            </Link>
            <Link
              to="/guide"
              className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-[#2A3343] bg-[#151A26] text-slate-300 hover:text-white hover:border-slate-500 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Radio size={14} className="text-emerald-400" />
              <span>Guide Cockpit</span>
            </Link>
          </div>
        </div>
      </div>

      <main className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ─── STATS ROW (4 Cards) ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          {/* Card 1: Active SOS */}
          <div className={`rounded-xl border p-4 transition-all ${
            activeSosCount > 0
              ? 'border-[#FF2E2E]/60 bg-[#FF2E2E]/15 shadow-lg shadow-red-950/40'
              : 'border-[#2A3343] bg-[#151A26]'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-black uppercase tracking-wider ${activeSosCount > 0 ? 'text-[#FF2E2E]' : 'text-slate-400'}`}>
                Active SOS
              </span>
              <AlertTriangle size={15} className={activeSosCount > 0 ? 'text-[#FF2E2E] animate-pulse' : 'text-slate-500'} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{activeSosCount}</span>
              <span className={`text-[11px] font-medium ${activeSosCount > 0 ? 'text-[#FF2E2E]' : 'text-slate-400'}`}>
                {activeSosCount > 0 ? 'Immediate grid action' : 'Zero active distress'}
              </span>
            </div>
          </div>

          {/* Card 2: Warnings */}
          <div className="rounded-xl border border-[#FFA500]/50 bg-[#FFA500]/10 p-4 transition-all hover:bg-[#FFA500]/15">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FFA500]">Warnings</span>
              <AlertCircle size={15} className="text-[#FFA500]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{warningsCount}</span>
              <span className="text-[11px] text-[#FFA500] font-medium">Delayed / Weather hold</span>
            </div>
          </div>

          {/* Card 3: Active Treks */}
          <div className="rounded-xl border border-[#3B82F6]/50 bg-[#3B82F6]/10 p-4 transition-all hover:bg-[#3B82F6]/15">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3B82F6]">Active Treks</span>
              <Activity size={15} className="text-[#3B82F6]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{treks.length}</span>
              <span className="text-[11px] text-blue-300 font-medium">13 High-altitude passes</span>
            </div>
          </div>

          {/* Card 4: Total Trekkers */}
          <div className="rounded-xl border border-[#2A3343] bg-[#151A26] p-4 transition-all hover:border-slate-500">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Trekkers</span>
              <Users size={15} className="text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">28</span>
              <span className="text-[11px] text-slate-400 font-medium">On-mountain explorers</span>
            </div>
          </div>
        </div>

        {/* ─── MAIN CONTENT GRID (2 COLUMNS) ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ════════ LEFT COLUMN: Trek List (60% ~ 7 cols) ═════════════════════ */}
          <div className="lg:col-span-7 space-y-4">

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#151A26] border border-[#2A3343] p-2 rounded-xl">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setFilter('ALL')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                    filter === 'ALL'
                      ? 'bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/20'
                      : 'text-slate-400 hover:text-white hover:bg-[#2A3343]/60'
                  }`}
                >
                  All Treks ({treks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('SOS')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    filter === 'SOS'
                      ? 'bg-[#FF2E2E] text-white shadow-md shadow-[#FF2E2E]/20'
                      : 'text-slate-400 hover:text-[#FF2E2E] hover:bg-[#FF2E2E]/10'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF2E2E]" />
                  SOS Alerts ({activeSosCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('WARNING')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    filter === 'WARNING'
                      ? 'bg-[#FFA500] text-black shadow-md shadow-[#FFA500]/20'
                      : 'text-slate-400 hover:text-[#FFA500] hover:bg-[#FFA500]/10'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFA500]" />
                  Warnings ({warningsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('ACTIVE')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    filter === 'ACTIVE'
                      ? 'bg-[#00FF88] text-black shadow-md shadow-[#00FF88]/20'
                      : 'text-slate-400 hover:text-[#00FF88] hover:bg-[#00FF88]/10'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />
                  Active ({activeCount})
                </button>
              </div>

              {/* Quick Search Input */}
              <div className="relative min-w-[140px] sm:w-44">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search trek / ID..."
                  className="w-full bg-[#0A0E14] border border-[#2A3343] rounded-lg pl-7 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                />
              </div>
            </div>

            {/* Trek Cards List */}
            <div className="space-y-3">
              {filteredTreks.map((trek) => {
                const isSOS = trek.status === 'SOS';

                return (
                  <div
                    key={trek.id}
                    onClick={() => navigate(`/live/${trek.id}`)}
                    style={{ borderLeftColor: trek.borderColor }}
                    className={`group relative rounded-xl border border-[#2A3343] border-l-4 bg-[#151A26] p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-slate-500/80 ${
                      isSOS ? 'shadow-red-950/30 hover:shadow-[#FF2E2E]/20 bg-red-950/20' : ''
                    }`}
                  >
                    {/* Top Row: Trek Name, ID, District & Right Status Badge */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-black text-white group-hover:text-[#3B82F6] transition-colors truncate">
                            {trek.name}
                          </h3>
                          <span className="text-[11px] font-mono font-bold text-slate-400 bg-[#0A0E14] px-2 py-0.5 rounded border border-[#2A3343]">
                            {trek.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <MapPin size={11} className="text-slate-500 shrink-0" />
                          <span>District: <strong className="text-slate-300 font-semibold">{trek.district}</strong></span>
                          <span className="text-slate-600">•</span>
                          <span>Alt: {trek.altitude}</span>
                        </p>
                      </div>

                      {/* Right Status Badge */}
                      <div className="shrink-0 flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${trek.statusBg}`}>
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: trek.dotColor }}
                          />
                          {trek.statusBadge}
                        </span>
                        <ArrowUpRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>

                    {/* Middle Row: Trekker Name, Group, Last Ping */}
                    <div className="bg-[#0A0E14]/70 rounded-lg p-2.5 mb-3 border border-[#2A3343]/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-300">
                          {trek.trekkerName[0]}
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px]">Trekker: </span>
                          <span className="font-bold text-white text-xs">{trek.trekkerName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                        <span>Group: <strong className="text-slate-200">{trek.groupSize}</strong></span>
                        <span className="text-slate-700">|</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-slate-500" />
                          <span>Last Ping: <strong className="text-slate-200">{trek.lastPing}</strong></span>
                        </span>
                      </div>
                    </div>

                    {/* SOS Alert Banner inside card if active */}
                    {trek.alertMessage && (
                      <div className={`mb-3 p-2.5 rounded-lg text-xs flex items-center gap-2 border ${
                        isSOS
                          ? 'bg-[#FF2E2E]/15 border-[#FF2E2E]/40 text-red-200'
                          : 'bg-[#FFA500]/10 border-[#FFA500]/30 text-amber-200'
                      }`}>
                        <AlertTriangle size={14} className={`shrink-0 ${isSOS ? 'text-[#FF2E2E] animate-bounce' : 'text-[#FFA500]'}`} />
                        <span className="text-[11px] font-semibold">{trek.alertMessage}</span>
                      </div>
                    )}

                    {/* Guide Rescue Dispatch Banner (If Guide Ramesh Rawat clicked Rescue) */}
                    {isSOS && rescueDispatchInfo && (
                      <div className="mb-3 p-2.5 rounded-lg text-xs flex items-center justify-between bg-emerald-950/60 border border-emerald-600/50 text-emerald-200">
                        <div className="flex items-center gap-2">
                          <HeartHandshake size={14} className="text-[#00FF88]" />
                          <span className="text-[11px] font-bold">
                            Guide {rescueDispatchInfo.guide || 'Ramesh Rawat'} dispatched for rescue (ETA {rescueDispatchInfo.eta || '18m'})
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded">
                          ACTIVE
                        </span>
                      </div>
                    )}

                    {/* Bottom Row: Battery, Signal, Temp & Quick CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#2A3343]/60 text-[11px] text-slate-400">
                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Battery */}
                        <span className="flex items-center gap-1.5">
                          {trek.battery < 30 ? (
                            <BatteryLow size={13} className="text-[#FF2E2E]" />
                          ) : (
                            <Battery size={13} className="text-emerald-400" />
                          )}
                          <span className={trek.battery < 30 ? 'text-[#FF2E2E] font-bold' : 'text-slate-300'}>
                            {trek.battery}%
                          </span>
                        </span>

                        {/* Signal */}
                        <span className="flex items-center gap-1.5">
                          <Signal size={12} className={trek.signalLevel <= 1 ? 'text-[#FF2E2E]' : 'text-slate-400'} />
                          <span className="text-slate-300">{trek.signal}</span>
                        </span>

                        {/* Temp */}
                        <span className="flex items-center gap-1.5">
                          <Thermometer size={12} className="text-cyan-400" />
                          <span className="text-slate-300">{trek.temp}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#3B82F6] group-hover:translate-x-0.5 transition-transform">
                        <span>Open Live Monitor</span>
                        <ChevronRight size={13} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ════════ RIGHT COLUMN: Map Overview + Quick Actions (40% ~ 5 cols) ═ */}
          <div className="lg:col-span-5 space-y-4">

            {/* ─── Top: Mini Map of Uttarakhand (Static Dark Map Schematic) ──── */}
            <div className="rounded-xl border border-[#2A3343] bg-[#151A26] overflow-hidden shadow-lg">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A3343] bg-[#0A0E14]/70">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Uttarakhand Surveillance Radar
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-[#151A26] px-2 py-0.5 rounded border border-[#2A3343]">
                  13 Districts Online
                </span>
              </div>

              {/* Tactical Vector Map Canvas */}
              <div className="p-3 bg-[#0A0E14] relative">
                <svg viewBox="0 0 420 300" className="w-full h-auto select-none">
                  <defs>
                    <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1A2230" strokeWidth="0.8" />
                    </pattern>
                  </defs>

                  {/* Grid background */}
                  <rect x="0" y="0" width="420" height="300" fill="url(#gridPattern)" />

                  {/* Simplified boundary of Uttarakhand state */}
                  <polygon
                    points="60,90 120,40 210,35 320,60 380,120 370,220 280,270 170,260 80,210 50,150"
                    fill="#151A26"
                    stroke="#2A3343"
                    strokeWidth="1.8"
                    opacity="0.85"
                  />

                  {/* Background Text */}
                  <text x="210" y="155" textAnchor="middle" fill="#2A3343" fontSize="18" fontWeight="900" letterSpacing="5" opacity="0.5">
                    COMMUNITY RADAR
                  </text>

                  {/* Plot Kedarnath (TRK-82341) */}
                  <g
                    className="cursor-pointer"
                    onClick={() => navigate('/live/TRK-82341')}
                  >
                    {activeSosCount > 0 ? (
                      <>
                        <circle cx="160" cy="110" r="24" fill="#FF2E2E" opacity="0.25">
                          <animate attributeName="r" values="10;30;10" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.4;0.05;0.4" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="160" cy="110" r="7" fill="#FF2E2E" stroke="#FFFFFF" strokeWidth="1.5" />
                        <text x="160" y="94" textAnchor="middle" fill="#FF2E2E" fontSize="9" fontWeight="900">
                          🚨 KEDARNATH (SOS)
                        </text>
                      </>
                    ) : (
                      <>
                        <circle cx="160" cy="110" r="5" fill="#00FF88" stroke="#FFFFFF" strokeWidth="1" />
                        <text x="160" y="96" textAnchor="middle" fill="#00FF88" fontSize="8" fontWeight="bold">
                          Kedarnath (Safe)
                        </text>
                      </>
                    )}
                  </g>

                  {/* 2. Valley of Flowers */}
                  <g className="cursor-pointer" onClick={() => navigate('/live/TRK-72910')}>
                    <circle cx="270" cy="100" r="5" fill="#FFA500" stroke="#FFFFFF" strokeWidth="1" />
                    <text x="270" y="88" textAnchor="middle" fill="#FFA500" fontSize="8" fontWeight="bold">
                      VoF (Warning)
                    </text>
                  </g>

                  {/* 3. Har Ki Dun */}
                  <g className="cursor-pointer" onClick={() => navigate('/live/TRK-55219')}>
                    <circle cx="95" cy="80" r="4.5" fill="#00FF88" />
                    <text x="95" y="70" textAnchor="middle" fill="#94A3B8" fontSize="7.5">
                      Har Ki Dun
                    </text>
                  </g>

                  {/* 4. Chopta */}
                  <g className="cursor-pointer" onClick={() => navigate('/live/TRK-91204')}>
                    <circle cx="210" cy="130" r="4.5" fill="#00FF88" />
                    <text x="210" y="145" textAnchor="middle" fill="#94A3B8" fontSize="7.5">
                      Chopta
                    </text>
                  </g>

                  {/* 5. Auli */}
                  <g className="cursor-pointer" onClick={() => navigate('/live/TRK-66510')}>
                    <circle cx="250" cy="140" r="4.5" fill="#00FF88" />
                    <text x="250" y="155" textAnchor="middle" fill="#94A3B8" fontSize="7.5">
                      Auli Ski
                    </text>
                  </g>

                  {/* 6. Nag Tibba */}
                  <g className="cursor-pointer" onClick={() => navigate('/live/TRK-43801')}>
                    <circle cx="110" cy="140" r="4.5" fill="#00FF88" />
                    <text x="110" y="155" textAnchor="middle" fill="#94A3B8" fontSize="7.5">
                      Nag Tibba
                    </text>
                  </g>
                </svg>

                {/* Map legend */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-[#2A3343]/60 px-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FF2E2E]" />
                      <span>SOS Distress</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FFA500]" />
                      <span>Warning</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00FF88]" />
                      <span>Normal</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">Click marker to inspect</span>
                </div>
              </div>
            </div>

            {/* ─── Card: Emergency Grid Control ──────────────────────────────── */}
            <div className="rounded-xl border border-[#2A3343] bg-[#151A26] p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2A3343]">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-[#FF2E2E]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Emergency Grid Control</h3>
                </div>
                <span className="text-[10px] text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                  GRID PROTOCOL
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <a
                  href="tel:1070"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#FFA500]/15 hover:bg-[#FFA500]/25 text-[#FFA500] border border-[#FFA500]/40 font-bold text-xs transition-all"
                >
                  <Phone size={13} />
                  <span>Grid Line 1070</span>
                </a>

                <a
                  href="tel:112"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#FF2E2E]/15 hover:bg-[#FF2E2E]/25 text-[#FF2E2E] border border-[#FF2E2E]/40 font-bold text-xs transition-all"
                >
                  <Shield size={13} />
                  <span>Helpline 112</span>
                </a>

                <button
                  type="button"
                  onClick={() => setBroadcastAlertActive(true)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#3B82F6]/15 hover:bg-[#3B82F6]/25 text-[#3B82F6] border border-[#3B82F6]/40 font-bold text-xs transition-all cursor-pointer"
                >
                  <Bell size={13} />
                  <span>Broadcast Mesh</span>
                </button>
              </div>

              {/* Broadcast Alert Modal / Drawer Form */}
              {broadcastAlertActive && (
                <form onSubmit={handleBroadcast} className="mt-3.5 pt-3 border-t border-[#2A3343] space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-amber-300">Transmit Advisory to Community Mesh</p>
                    <button
                      type="button"
                      onClick={() => setBroadcastAlertActive(false)}
                      className="text-slate-500 hover:text-white text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                  <input
                    type="text"
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="e.g. Fog warning on Kedarnath pass, hold ascent at checkpost..."
                    className="w-full bg-[#0A0E14] border border-[#2A3343] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send size={12} />
                    <span>Send Mesh Broadcast</span>
                  </button>
                </form>
              )}
            </div>

            {/* ─── Card: Guide Cockpit ───────────────────────────────────────── */}
            <div className="rounded-xl border border-[#2A3343] bg-[#151A26] p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2A3343]">
                <div className="flex items-center gap-2">
                  <Radio size={15} className="text-[#00FF88]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Guide Cockpit</h3>
                </div>
                <span className="text-[10px] text-[#00FF88] font-bold bg-[#00FF88]/10 px-2 py-0.5 rounded border border-[#00FF88]/30">
                  3 Guides Online
                </span>
              </div>

              <div className="space-y-2.5">
                {REGISTERED_GUIDES.map((guide, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[#0A0E14] border border-[#2A3343] hover:border-slate-500 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />
                        <p className="text-xs font-bold text-white truncate">{guide.name}</p>
                        <span className="text-[9px] font-semibold text-slate-400 bg-[#151A26] px-1.5 py-0.5 rounded">
                          {guide.district}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{guide.location}</p>
                    </div>

                    <a
                      href={`tel:${guide.phone}`}
                      className="shrink-0 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/60 transition-colors"
                    >
                      <Phone size={11} />
                      <span>Contact</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Card: Recent SOS Log ───────────────────────────────────────── */}
            <div className="rounded-xl border border-[#2A3343] bg-[#151A26] p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2A3343]">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-slate-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Recent SOS Log</h3>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Mesh Audit</span>
              </div>

              <div className="relative pl-4 space-y-3.5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2A3343]">
                {liveSos ? (
                  <div className="relative group">
                    <span className="absolute -left-[14px] top-1 w-2 h-2 rounded-full border-2 border-[#151A26] bg-[#FF2E2E]" />
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-bold text-red-300">Kedarnath ({liveSos.trekker || 'TRK-82341'})</p>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{liveSos.time || 'Just now'}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                      Beacon triggered: Lat {liveSos.lat}°N, Lng {liveSos.lng}°E. {liveSos.message}
                    </p>
                  </div>
                ) : (
                  <div className="relative group">
                    <span className="absolute -left-[14px] top-1 w-2 h-2 rounded-full border-2 border-[#151A26] bg-[#00FF88]" />
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-bold text-emerald-300">Kedarnath Trail Checkpoint</p>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">14:00 IST</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      All beacons cleared. Normal routine grid pings acknowledged.
                    </p>
                  </div>
                )}

                <div className="relative group">
                  <span className="absolute -left-[14px] top-1 w-2 h-2 rounded-full border-2 border-[#151A26] bg-[#FFA500]" />
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-bold text-slate-200">Valley of Flowers (TRK-72910)</p>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">13:45 IST</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Fog delay reported. Checkpoint ping pending from Guide Suresh Kumar.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
