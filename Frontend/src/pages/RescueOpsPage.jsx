import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, AlertTriangle, MapPin, Clock, Users, Mountain,
  Battery, Signal, Wifi, WifiOff, Phone, MessageSquare,
  Radio, Navigation, ChevronRight, Zap, Eye, X
} from 'lucide-react';
import Navbar from '../components/Navbar';

// ─── Demo active treks across 13 districts ───────────────────────────────────
const ACTIVE_TREKS = [
  {
    id: 'TRK-78421', name: 'Kedarnath Yatra A', district: 'Rudraprayag',
    guide: 'Ramesh Negi', guidePhone: '+919871234567',
    trekkers: 3, lastPing: '14:30 IST', battery: 27, signal: 1, altitude: '2,740m',
    status: 'SOS', lat: 30.63, lng: 78.85, elapsed: '1h 25m',
    sosMsg: 'Lost trail near river, weather worsening, still moving south',
  },
  {
    id: 'TRK-82341', name: 'Valley of Flowers B', district: 'Chamoli',
    guide: 'Suresh Kumar', guidePhone: '+919876501234',
    trekkers: 5, lastPing: '14:22 IST', battery: 68, signal: 3, altitude: '3,200m',
    status: 'Active', lat: 30.72, lng: 79.61, elapsed: '2h 15m',
    sosMsg: null,
  },
  {
    id: 'TRK-91204', name: 'Auli Ski Expedition', district: 'Chamoli',
    guide: 'Deepak Rawat', guidePhone: '+919812398765',
    trekkers: 8, lastPing: '14:28 IST', battery: 84, signal: 4, altitude: '2,519m',
    status: 'Active', lat: 30.52, lng: 79.57, elapsed: '0h 42m',
    sosMsg: null,
  },
  {
    id: 'TRK-66510', name: 'Roopkund Trek C', district: 'Chamoli',
    guide: 'Mohan Bisht', guidePhone: '+919908123456',
    trekkers: 4, lastPing: '14:05 IST', battery: 45, signal: 2, altitude: '4,777m',
    status: 'Warning', lat: 30.24, lng: 79.73, elapsed: '4h 00m',
    sosMsg: 'Battery critical, requesting weather update',
  },
  {
    id: 'TRK-55219', name: 'Har Ki Doon D', district: 'Uttarkashi',
    guide: 'Anjali Rawat', guidePhone: '+919901122334',
    trekkers: 6, lastPing: '13:55 IST', battery: 72, signal: 3, altitude: '3,566m',
    status: 'Active', lat: 31.10, lng: 78.40, elapsed: '5h 10m',
    sosMsg: null,
  },
  {
    id: 'TRK-43801', name: 'Gangotri Glacier E', district: 'Uttarkashi',
    guide: 'Ravi Sharma', guidePhone: '+919871239900',
    trekkers: 2, lastPing: '14:15 IST', battery: 91, signal: 4, altitude: '3,048m',
    status: 'Active', lat: 30.99, lng: 78.94, elapsed: '3h 20m',
    sosMsg: null,
  },
];

const STATUS_CONFIG = {
  SOS: { bg: 'bg-rose-900/60', border: 'border-rose-600/60', badge: 'bg-rose-600 text-white', dot: 'bg-rose-500', label: '🚨 SOS' },
  Warning: { bg: 'bg-amber-900/40', border: 'border-amber-700/50', badge: 'bg-amber-500 text-black', dot: 'bg-amber-400', label: '⚠ Warning' },
  Active: { bg: 'bg-slate-900/60', border: 'border-slate-700/50', badge: 'bg-emerald-700 text-white', dot: 'bg-emerald-500', label: '● Active' },
};

function SignalBars({ bars }) {
  return (
    <div className="flex items-end gap-0.5 h-3">
      {[1, 2, 3, 4].map(b => (
        <div key={b} className={`w-1 rounded-sm ${b <= bars ? 'bg-emerald-400' : 'bg-slate-700'}`} style={{ height: `${b * 25}%` }} />
      ))}
    </div>
  );
}

export default function RescueOpsPage() {
  const [selectedTrek, setSelectedTrek] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [now, setNow] = useState(Date.now());

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

  const sosTreks = ACTIVE_TREKS.filter(t => t.status === 'SOS');
  const warningTreks = ACTIVE_TREKS.filter(t => t.status === 'Warning');
  const activeTreks = ACTIVE_TREKS.filter(t => t.status === 'Active');

  const sendEmergencySMS = (trek) => {
    const msg = encodeURIComponent(
      `[SDRF RESCUE REQUEST] Discovery Uttarakhand\n` +
      `Trek: ${trek.name}\nTrip ID: ${trek.id}\nDistrict: ${trek.district}\n` +
      `Guide: ${trek.guide} (${trek.guidePhone})\n` +
      `Last Location: https://maps.google.com/?q=${trek.lat},${trek.lng}\n` +
      `Live Tracking: https://discoveryuk.in/live/${trek.id}\n` +
      `Battery: ${trek.battery}% | Signal: ${trek.signal}/4\n` +
      `Immediate dispatch required.`
    );
    window.location.href = `sms:1070,112?body=${msg}`;
  };

  return (
    <div className="min-h-screen bg-[#080d09]">
      <Navbar />

      {/* Header */}
      <div className="sticky top-16 sm:top-20 z-30 bg-[#0a1a0f]/97 backdrop-blur-md border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-900/40 border border-rose-700/40 flex items-center justify-center">
              <Shield size={17} className="text-rose-400" />
            </div>
            <div>
              <p className="text-xs font-black tracking-widest uppercase text-rose-400">Rescue Ops</p>
              <p className="text-[10px] text-slate-500 font-medium">Uttarakhand Response Command Center · 13 Districts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {sosTreks.length > 0 && (
              <span className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full border border-rose-600/60 bg-rose-900/50 text-rose-300 animate-pulse">
                <AlertTriangle size={11} />
                {sosTreks.length} Active SOS
              </span>
            )}
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${isOnline ? 'bg-emerald-900/50 border-emerald-700/40 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
              {isOnline ? 'Live Feed' : 'Cached Mode'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Summary tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-2xl border border-rose-700/50 bg-rose-950/40 p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-1">Active SOS</p>
            <p className="text-3xl font-black text-rose-400">{sosTreks.length}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Immediate response needed</p>
          </div>
          <div className="rounded-2xl border border-amber-700/50 bg-amber-950/40 p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-1">Warnings</p>
            <p className="text-3xl font-black text-amber-400">{warningTreks.length}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Monitor closely</p>
          </div>
          <div className="rounded-2xl border border-emerald-700/50 bg-emerald-950/30 p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-1">Active Treks</p>
            <p className="text-3xl font-black text-emerald-400">{ACTIVE_TREKS.length}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Across 13 districts</p>
          </div>
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Trekkers</p>
            <p className="text-3xl font-black text-white">{ACTIVE_TREKS.reduce((a, t) => a + t.trekkers, 0)}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Currently on mountain</p>
          </div>
        </div>

        {/* Trek list */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

          {/* Left: Trek cards (sorted SOS → Warning → Active) */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Trek Feed</p>
            {[...sosTreks, ...warningTreks, ...activeTreks].map((trek) => {
              const cfg = STATUS_CONFIG[trek.status];
              const isSelected = selectedTrek?.id === trek.id;
              return (
                <div
                  key={trek.id}
                  onClick={() => setSelectedTrek(isSelected ? null : trek)}
                  className={`rounded-2xl border p-4 cursor-pointer transition-all ${cfg.bg} ${cfg.border} ${isSelected ? 'ring-2 ring-emerald-500/50' : 'hover:ring-1 hover:ring-slate-600/60'}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot} ${trek.status === 'SOS' ? 'animate-ping' : ''}`} />
                        <span className="text-sm font-black text-white truncate">{trek.name}</span>
                        <span className={`shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">{trek.id} · {trek.district}</p>
                      {trek.sosMsg && (
                        <div className="flex items-start gap-1.5 text-[11px] text-rose-300 mb-2 bg-rose-900/30 rounded-lg p-2">
                          <AlertTriangle size={10} className="mt-0.5 shrink-0" />
                          <span>"{trek.sosMsg}"</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 flex-wrap text-[10px] text-slate-500">
                        <span className="flex items-center gap-1"><Users size={9} /> {trek.trekkers}</span>
                        <span className="flex items-center gap-1"><Mountain size={9} /> {trek.altitude}</span>
                        <span className="flex items-center gap-1"><Clock size={9} /> {trek.elapsed}</span>
                        <span className="flex items-center gap-1"><Battery size={9} className={trek.battery < 30 ? 'text-amber-400' : ''} /> {trek.battery}%</span>
                        <SignalBars bars={trek.signal} />
                      </div>
                    </div>
                    <ChevronRight size={15} className={`text-slate-600 shrink-0 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </div>

                  {isSelected && (
                    <div className="border-t border-slate-700/40 pt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                      <Link
                        to={`/live/${trek.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 border border-emerald-600/40 text-emerald-200 text-[10px] font-bold transition-all"
                      >
                        <Eye size={12} />
                        Live View
                      </Link>
                      <a
                        href={`tel:${trek.guidePhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600/60 text-slate-300 text-[10px] font-bold transition-all"
                      >
                        <Phone size={12} />
                        Call Guide
                      </a>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); sendEmergencySMS(trek); }}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-700/60 hover:bg-rose-700 border border-rose-600/40 text-rose-200 text-[10px] font-bold transition-all cursor-pointer"
                      >
                        <MessageSquare size={12} />
                        SMS SDRF
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: SVG District Map schematic */}
          <div className="rounded-2xl border border-slate-700/50 bg-[#0d1f14]/80 overflow-hidden h-fit sticky top-36">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/40">
              <p className="text-[10px] font-black uppercase tracking-widest text-white">Uttarakhand Live Map</p>
              <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Clusters
              </span>
            </div>
            <div className="bg-[#080d09] p-3">
              <svg viewBox="0 0 400 320" className="w-full h-auto">
                {/* Background district outlines (simplified) */}
                <rect x={20} y={20} width={360} height={280} rx={8} fill="#0a1a0f" stroke="#1a2e1f" strokeWidth={1} />
                <text x={200} y={55} textAnchor="middle" fill="#1e3a2a" fontSize={30} fontWeight="bold" opacity={0.3}>UTTARAKHAND</text>

                {/* Faint grid */}
                {[80, 140, 200, 260, 320].map(x => (
                  <line key={x} x1={x} y1={25} x2={x} y2={295} stroke="#1a2e1f" strokeWidth={0.5} />
                ))}
                {[80, 140, 200, 260].map(y => (
                  <line key={y} x1={25} y1={y} x2={375} y2={y} stroke="#1a2e1f" strokeWidth={0.5} />
                ))}

                {/* Trek markers */}
                {ACTIVE_TREKS.map((trek) => {
                  const cfg = STATUS_CONFIG[trek.status];
                  // Map lat/lng to SVG (rough normalized)
                  const lats = ACTIVE_TREKS.map(t => t.lat);
                  const lngs = ACTIVE_TREKS.map(t => t.lng);
                  const x = ((trek.lng - Math.min(...lngs)) / (Math.max(...lngs) - Math.min(...lngs))) * 320 + 40;
                  const y = (1 - (trek.lat - Math.min(...lats)) / (Math.max(...lats) - Math.min(...lats))) * 240 + 40;
                  const dotColor = trek.status === 'SOS' ? '#ef4444' : trek.status === 'Warning' ? '#f59e0b' : '#10b981';
                  return (
                    <g key={trek.id}>
                      {trek.status === 'SOS' && (
                        <circle cx={x} cy={y} r={16} fill={dotColor} opacity={0.15} />
                      )}
                      <circle cx={x} cy={y} r={trek.status === 'SOS' ? 8 : 5} fill={dotColor} opacity={0.9} />
                      <text x={x} y={y - 12} textAnchor="middle" fill={dotColor} fontSize={7.5} fontWeight="bold">
                        {trek.id}
                      </text>
                      <text x={x} y={y + 16} textAnchor="middle" fill="#64748b" fontSize={6.5}>
                        {trek.district}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="flex items-center gap-4 px-1 py-1 text-[9px] text-slate-500 flex-wrap">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> SOS Active</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Warning</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Normal</span>
              </div>
            </div>

            {/* Quick links */}
            <div className="px-4 py-3 border-t border-slate-700/40 space-y-2">
              <Link to="/guide" className="flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 transition-colors group py-1">
                <span className="flex items-center gap-2"><Radio size={12} /> Guide Cockpit</span>
                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a href="tel:1070" className="flex items-center justify-between text-[11px] text-slate-400 hover:text-amber-300 transition-colors group py-1">
                <span className="flex items-center gap-2"><Phone size={12} /> SDRF Helpline · 1070</span>
                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a href="tel:112" className="flex items-center justify-between text-[11px] text-slate-400 hover:text-rose-300 transition-colors group py-1">
                <span className="flex items-center gap-2"><Shield size={12} /> Emergency · 112</span>
                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
