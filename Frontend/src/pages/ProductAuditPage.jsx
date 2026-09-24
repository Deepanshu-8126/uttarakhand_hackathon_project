import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, ShieldAlert, AlertTriangle, CheckCircle2, TrendingUp, 
  ArrowRight, ArrowUpRight, Zap, RefreshCw, Layers, ShieldCheck, 
  Users, Building2, MapPin, Compass, DollarSign, Clock, Search, 
  SlidersHorizontal, Download, Sparkles, AlertCircle, FileText, 
  ExternalLink, BarChart3, PieChart, ChevronRight, Lock, Eye, Filter
} from 'lucide-react';
import Navbar from '../components/Navbar';

// Micro Sparkline Component (SVG)
function Sparkline({ data = [20, 40, 35, 50, 45, 60, 58], color = '#10B981', height = 24, width = 64 }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function ProductAuditPage() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'journey' | 'ops' | 'audit' | 'matrix'
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  // Simulated live telemetry tick
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setRefreshCount((c) => c + 1);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // User Journey Steps Data
  const userJourneySteps = [
    {
      id: 'landing',
      name: '1. Landing Experience',
      route: '/',
      status: 'optimized',
      conversionRate: '42.8%',
      dropOff: '12.4%',
      avgTime: '1m 45s',
      sparkline: [38, 42, 45, 41, 48, 52, 55],
      bottleneck: null,
      notes: 'Strong hero visual retention, dynamic seasonal banners, clear CTA hierarchy.',
      healthScore: 94
    },
    {
      id: 'explore',
      name: '2. Explore & Filter Matrix',
      route: '/stays',
      status: 'optimized',
      conversionRate: '58.2%',
      dropOff: '18.5%',
      avgTime: '3m 12s',
      sparkline: [48, 52, 50, 56, 54, 60, 62],
      bottleneck: null,
      notes: '105 seeded destinations, high engagement on offbeat Kumaon & Garhwal clusters.',
      healthScore: 91
    },
    {
      id: 'plan',
      name: '3. AI Copilot & Itinerary Planner',
      route: '/copilot',
      status: 'warning',
      conversionRate: '49.0%',
      dropOff: '22.1%',
      avgTime: '4m 30s',
      sparkline: [55, 52, 48, 50, 46, 49, 48],
      bottleneck: 'Elevation & AMS warnings missing for routes > 3,000m.',
      notes: 'High adoption rate, but needs topography & acclimatization indicators on Day 2/3.',
      healthScore: 78
    },
    {
      id: 'book',
      name: '4. Booking & Escrow Handshake',
      route: '/my-trip',
      status: 'critical',
      conversionRate: '26.4%',
      dropOff: '34.0%',
      avgTime: '2m 10s',
      sparkline: [45, 40, 36, 30, 28, 26, 25],
      bottleneck: 'High drop-off at Payment & Offline Handshake Step (34%).',
      notes: 'Zero-cellular trailheads cause OTP handshake stalls without SMS fallback.',
      healthScore: 61
    },
    {
      id: 'travel',
      name: '5. Live Corridor & Safety Radar',
      route: '/map',
      status: 'optimized',
      conversionRate: '92.4%',
      dropOff: '4.2%',
      avgTime: '18m/session',
      sparkline: [70, 75, 82, 88, 89, 92, 94],
      bottleneck: null,
      notes: 'Real-time road closure crowdsourcing and SOS relay working seamlessly.',
      healthScore: 96
    },
    {
      id: 'review',
      name: '6. Verified Review & Payout Release',
      route: '/profile',
      status: 'optimized',
      conversionRate: '78.2%',
      dropOff: '8.1%',
      avgTime: '1m 20s',
      sparkline: [60, 65, 70, 72, 75, 78, 80],
      bottleneck: null,
      notes: '100% automated escrow release to local hosts within 2.4 hrs of OTP checkout.',
      healthScore: 95
    }
  ];

  // Critical UI/UX Issues
  const criticalIssues = [
    {
      id: 1,
      title: 'Homepage Clutter & Drawer Collision',
      severity: '8/10',
      impact: 'High',
      tag: 'UI Clutter',
      desc: 'Floating emergency and copilot widgets collide with bottom mobile drawer on small screens (<400px).',
      recommendation: 'Dock floating widgets into unified bottom telemetry bar on mobile viewports.'
    },
    {
      id: 2,
      title: 'Trip Planner Lacks Elevation Context',
      severity: '9/10',
      impact: 'Critical',
      tag: 'Safety / UX',
      desc: 'Routes traversing high passes (>3,200m like Tungnath/Hemkund) lack gradual altitude warnings and acclimatization badges.',
      recommendation: 'Embed interactive 3D SVG elevation profile with AMS alerts into AI day cards.'
    },
    {
      id: 3,
      title: 'Escrow Handshake Offline Barrier',
      severity: '7/10',
      impact: 'High',
      tag: 'Payment / Trust',
      desc: 'Digital OTP verification fails when traveler and bike vendor are both in zero-signal valley zones.',
      recommendation: 'Implement cryptographically signed offline QR code and Bluetooth P2P verification.'
    },
    {
      id: 4,
      title: 'Vehicle Fleet KYC Lookup Latency',
      severity: '8/10',
      impact: 'Medium',
      tag: 'Performance',
      desc: 'RTO vehicle fitness & commercial permit check takes >4.2s over 3G mountain cellular bands.',
      recommendation: 'Pre-cache verified commercial license hashes in edge KV store for instant lookup.'
    },
    {
      id: 5,
      title: 'Hidden Local Cess & Permit Fees',
      severity: '7/10',
      impact: 'Medium',
      tag: 'Pricing UX',
      desc: 'Forest entry cess and green permits are only disclosed at final Razorpay modal, causing cart abandonment.',
      recommendation: 'Itemize green cess and eco-fees upfront inside the transparent day-wise cost breakdown.'
    }
  ];

  // Improvement Suggestions
  const improvementSuggestions = [
    {
      id: 1,
      title: 'Merge Culture & Spiritual Pages',
      effort: 'Low',
      expectedGain: '+18% Exploration Depth',
      desc: 'Unify Culture & Spiritual into a single multi-tag "Explore Devbhoomi" matrix to reduce navigation fragmentation.'
    },
    {
      id: 2,
      title: 'Contextual Safety Triggers vs Popups',
      effort: 'Medium',
      expectedGain: '-40% Annoyance Rate',
      desc: 'Replace full-screen roadblock warnings with inline corridor warning chips when planning specific highway routes.'
    },
    {
      id: 3,
      title: 'Offline SMS/QR Handshake Fallback',
      effort: 'Medium',
      expectedGain: '+28% Remote Checkout Success',
      desc: 'Allow vendors to confirm pickup via 6-digit cryptographic encrypted offline SMS or QR scan.'
    },
    {
      id: 4,
      title: '3D Elevation Profile in AI Copilot',
      effort: 'High',
      expectedGain: '+35% Adventure Safety Rating',
      desc: 'Render interactive mountain contour elevation graphs showing ascent gain (m/hr) for each day.'
    },
    {
      id: 5,
      title: 'Monsoon Surge-Protection Fleet Cap',
      effort: 'Low',
      expectedGain: '+4.9/5 Trust Sentiment',
      desc: 'Hardcode max tariff caps for local taxis during landslide detours to prevent traveler price gouging.'
    }
  ];

  // Success Metrics
  const successMetrics = [
    {
      id: 1,
      title: 'Verified Homestay Direct Conversion',
      value: '67.4%',
      trend: '+14.2% vs OTA avg',
      desc: 'Direct escrow trust badge drives 2.3x higher booking rate than traditional unverified listings.'
    },
    {
      id: 2,
      title: 'AI Copilot Daily Adoption',
      value: '4,200',
      trend: 'Itineraries generated / day',
      desc: 'Zero-prompt natural language trip generator is the highest engaged feature on the platform.'
    },
    {
      id: 3,
      title: 'Escrow Zero-Fraud Record',
      value: '100%',
      trend: '0 chargebacks recorded',
      desc: 'Two-party OTP physical handover protocol has eliminated phantom rental disputes completely.'
    },
    {
      id: 4,
      title: 'Local Partner Onboarding Speed',
      value: '< 14 mins',
      trend: 'Fast-track KYC',
      desc: 'Geo-selfie + Aadhaar document OCR enables remote homestay hosts to list within 15 minutes.'
    },
    {
      id: 5,
      title: 'Community Grid Accuracy',
      value: '94.2%',
      trend: 'Crowdsourced road intel',
      desc: 'Driver and local guide real-time roadblock reports verified within 6 minutes on average.'
    }
  ];

  // Function Health Matrix (12 cards)
  const functionMatrix = [
    {
      id: 'search',
      name: 'Search & Geo Indexer',
      category: 'Discovery',
      status: 'operational',
      uptime: '99.98%',
      latency: '18ms',
      load: '14.2k req/min',
      errorRate: '0.01%',
      sparkline: [20, 24, 22, 28, 30, 29, 32],
      lastUpdated: '10s ago'
    },
    {
      id: 'booking',
      name: 'Booking Engine & Escrow',
      category: 'Transactions',
      status: 'operational',
      uptime: '99.95%',
      latency: '38ms',
      load: '840 tx/hr',
      errorRate: '0.04%',
      sparkline: [40, 42, 45, 50, 48, 55, 58],
      lastUpdated: '2s ago'
    },
    {
      id: 'copilot',
      name: 'AI Copilot (Gemini Core)',
      category: 'Intelligence',
      status: 'warning',
      uptime: '97.40%',
      latency: '780ms',
      load: '4.2k calls/day',
      errorRate: '1.20%',
      sparkline: [60, 65, 78, 85, 92, 88, 82],
      lastUpdated: '5s ago'
    },
    {
      id: 'safety',
      name: 'Safety & Corridor Radar',
      category: 'Operations',
      status: 'operational',
      uptime: '99.99%',
      latency: '12ms',
      load: '1.2k pings/sec',
      errorRate: '0.00%',
      sparkline: [30, 32, 35, 34, 38, 40, 42],
      lastUpdated: 'Just now'
    },
    {
      id: 'partner',
      name: 'Partner Business Portal',
      category: 'B2B Hub',
      status: 'operational',
      uptime: '99.88%',
      latency: '24ms',
      load: '847 active hosts',
      errorRate: '0.05%',
      sparkline: [50, 52, 55, 58, 60, 64, 65],
      lastUpdated: '1m ago'
    },
    {
      id: 'payment',
      name: 'Payment Gateway (Razorpay/UPI)',
      category: 'Fintech',
      status: 'warning',
      uptime: '96.20%',
      latency: '1,240ms',
      load: '₹14.8L volume/day',
      errorRate: '3.80%',
      sparkline: [25, 30, 35, 28, 40, 32, 29],
      lastUpdated: '12s ago'
    },
    {
      id: 'map',
      name: 'MapLibre Topo Engine',
      category: 'GIS / Mapping',
      status: 'operational',
      uptime: '99.92%',
      latency: '22ms',
      load: '38k vector tiles/hr',
      errorRate: '0.02%',
      sparkline: [45, 48, 52, 56, 60, 62, 65],
      lastUpdated: '4s ago'
    },
    {
      id: 'reviews',
      name: 'Verified Review Ledger',
      category: 'Reputation',
      status: 'operational',
      uptime: '100.0%',
      latency: '15ms',
      load: '4.9k reviews',
      errorRate: '0.00%',
      sparkline: [10, 15, 18, 22, 25, 28, 30],
      lastUpdated: '2m ago'
    },
    {
      id: 'sos',
      name: 'SOS Emergency Relay',
      category: 'Safety',
      status: 'operational',
      uptime: '100.0%',
      latency: '8ms',
      load: '0 active distress',
      errorRate: '0.00%',
      sparkline: [5, 5, 5, 5, 5, 5, 5],
      lastUpdated: 'Real-time'
    },
    {
      id: 'carbon',
      name: 'Himalayan Carbon Tracker',
      category: 'Eco-System',
      status: 'operational',
      uptime: '99.70%',
      latency: '30ms',
      load: '12.4t offset calc',
      errorRate: '0.03%',
      sparkline: [15, 18, 22, 26, 30, 34, 38],
      lastUpdated: '5m ago'
    },
    {
      id: 'community',
      name: 'Community Grid Mesh',
      category: 'Crowdsource',
      status: 'operational',
      uptime: '98.90%',
      latency: '45ms',
      load: '2.1k daily reports',
      errorRate: '0.20%',
      sparkline: [35, 40, 48, 52, 58, 62, 68],
      lastUpdated: '20s ago'
    },
    {
      id: 'dialect',
      name: 'Garhwali/Kumaoni Engine',
      category: 'Localization',
      status: 'operational',
      uptime: '99.40%',
      latency: '110ms',
      load: '1.8k voice trans/day',
      errorRate: '0.15%',
      sparkline: [12, 16, 20, 24, 28, 32, 35],
      lastUpdated: '1m ago'
    }
  ];

  // Active Threats / Hazards Data
  const activeHazards = [
    {
      id: 'joshimath',
      location: 'Joshimath - Marwari Bypass (NH-58)',
      type: 'Landslide Clearance',
      severity: 'critical',
      coords: '30.55° N, 79.56° E',
      altitude: '1,875m',
      status: 'Single-Lane Convoy Open',
      eta: 'Full clearance ~18:00 IST'
    },
    {
      id: 'munsyari',
      location: 'Munsyari - Birthi Falls Stretch',
      type: 'Dense Fog & Rockfall Warning',
      severity: 'warning',
      coords: '30.06° N, 80.24° E',
      altitude: '2,290m',
      status: 'Caution Advised',
      eta: 'Visibility improving'
    },
    {
      id: 'kedarnath',
      location: 'Kedarnath Helipad - Lincholi Corridor',
      type: 'High Wind Velocity (>45 km/h)',
      severity: 'warning',
      coords: '30.73° N, 79.06° E',
      altitude: '3,583m',
      status: 'Heli sorties on standby',
      eta: 'Wind window check: 15:30'
    }
  ];

  return (
    <div className="min-h-screen bg-[#090e17] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-900">
      <Navbar />

      {/* Main Container */}
      <div className="pt-24 pb-20 px-3 sm:px-6 lg:px-8 max-w-[1720px] mx-auto">
        
        {/* Top Header & Mission Control Bar */}
        <div className="mb-6 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            
            {/* Left: Branding & Status */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>SYSTEM HEALTH: 98.4%</span>
                </div>
                <span className="text-xs font-mono text-slate-400">|</span>
                <span className="text-xs font-mono text-slate-400">CORE v2.4.0-PROD</span>
                <span className="text-xs font-mono text-slate-400">|</span>
                <span className="text-xs font-mono text-slate-400">NODE: DEVBHOOMI-CENTRAL-01</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2.5">
                <Activity className="text-emerald-400" size={28} />
                <span>Product Audit & Workflow Control Tower</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
                Comprehensive 360° health check across Traveler Journeys, Partner Operations, UX Audit Issues, and Function Micro-Services.
              </p>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                  autoRefresh 
                    ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300' 
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <RefreshCw size={14} className={autoRefresh ? 'animate-spin' : ''} />
                <span>{autoRefresh ? 'Live Sync (5s)' : 'Paused'}</span>
              </button>

              <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2">
                <Clock size={13} className="text-slate-400" />
                <span>Updated: {lastUpdated}</span>
              </div>

              <a
                href="#report-export"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Audit report snapshot generated! Ready for presentation.');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>Export Audit</span>
              </a>
            </div>
          </div>

          {/* Quick Metrics Ticker Bar */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            <div className="bg-slate-950/50 rounded-xl p-2.5 border border-slate-800/60">
              <div className="text-slate-400 text-[11px]">Active Travelers</div>
              <div className="text-sm font-black font-mono text-white mt-0.5">14,280</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">↑ 8.4% today</div>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-2.5 border border-slate-800/60">
              <div className="text-slate-400 text-[11px]">Verified Partners</div>
              <div className="text-sm font-black font-mono text-amber-400 mt-0.5">847 Hosts</div>
              <div className="text-[10px] text-amber-400/80 mt-0.5">12 awaiting KYC</div>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-2.5 border border-slate-800/60">
              <div className="text-slate-400 text-[11px]">Escrow Pool Lock</div>
              <div className="text-sm font-black font-mono text-emerald-400 mt-0.5">₹14.82 Lakh</div>
              <div className="text-[10px] text-slate-400 mt-0.5">0% chargeback</div>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-2.5 border border-slate-800/60">
              <div className="text-slate-400 text-[11px]">Active Hazards</div>
              <div className="text-sm font-black font-mono text-rose-400 mt-0.5">3 Corridors</div>
              <div className="text-[10px] text-rose-400/80 mt-0.5">Monitored 24/7</div>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-2.5 border border-slate-800/60">
              <div className="text-slate-400 text-[11px]">Avg API Latency</div>
              <div className="text-sm font-black font-mono text-white mt-0.5">32 ms</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">99.98% Uptime</div>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-2.5 border border-slate-800/60">
              <div className="text-slate-400 text-[11px]">Critical UI Fixes</div>
              <div className="text-sm font-black font-mono text-rose-400 mt-0.5">5 Items</div>
              <div className="text-[10px] text-rose-400/80 mt-0.5">Ready to deploy</div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800">
            {[
              { id: 'all', label: 'Ecosystem View', icon: <Layers size={14} /> },
              { id: 'journey', label: 'User Journey (Flow)', icon: <Users size={14} /> },
              { id: 'ops', label: 'Partner & Admin Ops', icon: <Building2 size={14} /> },
              { id: 'audit', label: 'UX/UI Audit Report', icon: <AlertTriangle size={14} /> },
              { id: 'matrix', label: 'Function Matrix (12)', icon: <Zap size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search components or nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* ─── MAIN 3-COLUMN GRID ─── */}
        {(activeTab === 'all' || activeTab === 'journey' || activeTab === 'ops' || activeTab === 'audit') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            
            {/* ═════════════════════════════════════════════════════════════════════
                LEFT COLUMN: User Journey Flow (Vertical Flowchart)
                ═════════════════════════════════════════════════════════════════════ */}
            {(activeTab === 'all' || activeTab === 'journey') && (
              <div className={`${activeTab === 'journey' ? 'lg:col-span-12 max-w-4xl mx-auto' : 'lg:col-span-4'} flex flex-col gap-4`}>
                
                {/* Column Card Header */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Users size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">1. User Journey Flow</h2>
                      <p className="text-[11px] text-slate-400">Vertical funnel & bottleneck telemetry</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
                    6 Nodes
                  </span>
                </div>

                {/* Vertical Flowchart Steps */}
                <div className="space-y-3 relative before:absolute before:left-6 before:top-6 before:bottom-6 before:w-0.5 before:bg-slate-800">
                  {userJourneySteps.map((step, idx) => {
                    const isOptimized = step.status === 'optimized';
                    const isWarning = step.status === 'warning';
                    const isCritical = step.status === 'critical';

                    return (
                      <div
                        key={step.id}
                        className={`relative z-10 bg-slate-900/90 border rounded-2xl p-4 transition-all hover:border-slate-700 ${
                          isCritical 
                            ? 'border-rose-900/70 bg-gradient-to-r from-rose-950/20 to-slate-900/90' 
                            : isWarning 
                            ? 'border-amber-900/50 bg-gradient-to-r from-amber-950/15 to-slate-900/90' 
                            : 'border-slate-800/90'
                        }`}
                      >
                        {/* Step Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            {/* Status Indicator Dot */}
                            <div className="relative">
                              <span
                                className={`w-3.5 h-3.5 rounded-full inline-block ${
                                  isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                                }`}
                              />
                              {isCritical && (
                                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping absolute inset-0 opacity-75" />
                              )}
                            </div>
                            <span className="font-bold text-xs text-white tracking-tight">{step.name}</span>
                          </div>

                          <Link
                            to={step.route}
                            className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-mono transition-colors"
                          >
                            <span>{step.route}</span>
                            <ArrowUpRight size={11} />
                          </Link>
                        </div>

                        {/* Micro-Metrics Bar */}
                        <div className="grid grid-cols-3 gap-2 bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/70 my-2.5 text-center">
                          <div>
                            <div className="text-[10px] text-slate-400">Conversion</div>
                            <div className="text-xs font-mono font-black text-emerald-400 mt-0.5">{step.conversionRate}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">Drop-Off</div>
                            <div className={`text-xs font-mono font-black mt-0.5 ${isCritical ? 'text-rose-400' : 'text-slate-300'}`}>
                              {step.dropOff}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">Avg Time</div>
                            <div className="text-xs font-mono font-bold text-slate-300 mt-0.5">{step.avgTime}</div>
                          </div>
                        </div>

                        {/* Sparkline & Score */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60">
                          <span className="text-[10px] text-slate-400">7-Day Retention Trend</span>
                          <Sparkline
                            data={step.sparkline}
                            color={isCritical ? '#F43F5E' : isWarning ? '#FBBF24' : '#10B981'}
                          />
                        </div>

                        {/* Bottleneck Warning Badge (if any) */}
                        {step.bottleneck && (
                          <div className={`mt-2.5 p-2 rounded-xl text-[11px] font-semibold flex items-start gap-1.5 ${
                            isCritical 
                              ? 'bg-rose-950/60 border border-rose-800/70 text-rose-300' 
                              : 'bg-amber-950/50 border border-amber-800/60 text-amber-300'
                          }`}>
                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                            <span>{step.bottleneck}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════════
                CENTER COLUMN: Partner & Admin Operations
                ═════════════════════════════════════════════════════════════════════ */}
            {(activeTab === 'all' || activeTab === 'ops') && (
              <div className={`${activeTab === 'ops' ? 'lg:col-span-12 max-w-5xl mx-auto' : 'lg:col-span-4'} flex flex-col gap-4`}>
                
                {/* Partner Hub Section */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">2. Partner Operations Hub</h2>
                      <p className="text-[11px] text-slate-400">Supply-side onboarding & verified inventory</p>
                    </div>
                  </div>
                  <Link to="/partner" className="text-[10px] font-mono text-amber-400 hover:underline">
                    Portal →
                  </Link>
                </div>

                {/* Partner Flow Steps */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Supply-Side Lifecycle
                  </div>

                  {[
                    { label: '1. Onboarding', sub: 'Aadhaar / GST / Identity', metric: '12 Pending Approvals', metricColor: 'text-amber-400' },
                    { label: '2. KYC Verification', sub: 'Geo-Selfie + Video Call', metric: '98.1% Pass Rate', metricColor: 'text-emerald-400' },
                    { label: '3. Inventory Upload', sub: 'Homestays, Fleet & Guides', metric: '847 Active Listings', metricColor: 'text-white' },
                    { label: '4. Live Bookings', sub: 'Direct Escrow Lock', metric: '₹2.4 Lakh Today', metricColor: 'text-emerald-400' },
                    { label: '5. Instant Payouts', sub: 'OTP Handover Triggered', metric: '₹8.9L Pool Released', metricColor: 'text-emerald-400' }
                  ].map((node, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div>
                        <div className="text-xs font-bold text-white">{node.label}</div>
                        <div className="text-[10px] text-slate-400">{node.sub}</div>
                      </div>
                      <div className={`text-xs font-mono font-bold ${node.metricColor}`}>
                        {node.metric}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Admin Command Panel & Live Telemetry */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Admin Control Radar</span>
                    </div>
                    <Link to="/admin" className="text-[10px] font-mono text-emerald-400 hover:underline">
                      Console →
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/70">
                      <div className="text-[10px] text-slate-400">Safety Alerts</div>
                      <div className="text-xs font-mono font-black text-rose-400 mt-0.5">3 Active</div>
                    </div>
                    <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/70">
                      <div className="text-[10px] text-slate-400">Dispute Queue</div>
                      <div className="text-xs font-mono font-black text-amber-400 mt-0.5">7 Tickets</div>
                    </div>
                    <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/70">
                      <div className="text-[10px] text-slate-400">System Health</div>
                      <div className="text-xs font-mono font-black text-emerald-400 mt-0.5">98.4%</div>
                    </div>
                  </div>
                </div>

                {/* Live Threat Map Mini-Widget */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-rose-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Active Hazard Corridors</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Real-Time GIS</span>
                  </div>

                  {/* Hazard Cards */}
                  <div className="space-y-2">
                    {activeHazards.map((hazard) => (
                      <div
                        key={hazard.id}
                        className={`p-3 rounded-xl border text-xs ${
                          hazard.severity === 'critical'
                            ? 'bg-rose-950/30 border-rose-900/60'
                            : 'bg-amber-950/20 border-amber-900/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-white">{hazard.location}</span>
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            hazard.severity === 'critical' ? 'bg-rose-900/60 text-rose-300' : 'bg-amber-900/60 text-amber-300'
                          }`}>
                            {hazard.altitude}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1 font-medium">{hazard.type}</div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/50 font-mono">
                          <span>{hazard.status}</span>
                          <span>{hazard.coords}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════════
                RIGHT COLUMN: UX/UI Audit Report
                ═════════════════════════════════════════════════════════════════════ */}
            {(activeTab === 'all' || activeTab === 'audit') && (
              <div className={`${activeTab === 'audit' ? 'lg:col-span-12 max-w-5xl mx-auto' : 'lg:col-span-4'} flex flex-col gap-4`}>
                
                {/* Column Card Header */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">3. UX/UI Audit Report</h2>
                      <p className="text-[11px] text-slate-400">Prioritized triage & architecture roadmap</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-950/70 border border-rose-800/80 text-[10px] font-mono text-rose-400">
                    5 Critical
                  </span>
                </div>

                {/* 1. Critical Issues Section (Red Cards) */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert size={13} />
                    <span>Critical UI Issues (To Fix)</span>
                  </div>

                  {criticalIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/30 to-slate-900 border border-rose-900/70 shadow-sm transition-all hover:border-rose-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-bold text-white">{issue.title}</div>
                        <span className="px-1.5 py-0.5 rounded bg-rose-900/60 border border-rose-700 text-rose-200 text-[10px] font-mono font-bold shrink-0">
                          Severity: {issue.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{issue.desc}</p>
                      <div className="mt-2 p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[10px] text-emerald-300 font-medium flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                        <span>Fix: {issue.recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. Improvement Suggestions Section (Yellow Cards) */}
                <div className="space-y-2.5 pt-2">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <span>Improvement Recommendations</span>
                  </div>

                  {improvementSuggestions.map((sug) => (
                    <div
                      key={sug.id}
                      className="p-3 rounded-2xl bg-amber-950/15 border border-amber-900/50 transition-all hover:border-amber-700"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">{sug.title}</span>
                        <span className="text-[10px] font-mono text-amber-400">{sug.expectedGain}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{sug.desc}</p>
                    </div>
                  ))}
                </div>

                {/* 3. Success Metrics Section (Green Cards) */}
                <div className="space-y-2.5 pt-2">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>What's Working Exceptionally Well</span>
                  </div>

                  {successMetrics.map((met) => (
                    <div
                      key={met.id}
                      className="p-3 rounded-2xl bg-emerald-950/15 border border-emerald-900/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{met.title}</span>
                        <span className="text-xs font-mono font-black text-emerald-400">{met.value}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">{met.desc}</p>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            BOTTOM SECTION: Function Health Matrix (12 Function Cards)
            ═════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'matrix') && (
          <div className="mt-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="text-emerald-400" size={20} />
                  <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                    Function Health Matrix (12 Core Subsystems)
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  Live operational statuses, request loads, uptime SLAs, and response latency across all Devbhoomi services.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                  10 Operational
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
                  2 Degraded
                </span>
                <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                  0 Down
                </span>
              </div>
            </div>

            {/* 12-Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {functionMatrix
                .filter(f => !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.category.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((func) => {
                  const isOp = func.status === 'operational';
                  const isWarn = func.status === 'warning';

                  return (
                    <div
                      key={func.id}
                      onClick={() => setSelectedFunction(func)}
                      className={`p-4 rounded-2xl bg-slate-950/60 border transition-all cursor-pointer hover:scale-[1.01] ${
                        isWarn 
                          ? 'border-amber-800/60 hover:border-amber-600' 
                          : 'border-slate-800/80 hover:border-emerald-700/80'
                      }`}
                    >
                      {/* Top Category & Status */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{func.category}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isWarn ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                          <span className={`text-[10px] font-mono font-bold uppercase ${isWarn ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {func.status}
                          </span>
                        </div>
                      </div>

                      {/* Function Name */}
                      <h3 className="text-sm font-bold text-white mb-2 tracking-tight">{func.name}</h3>

                      {/* Stats Matrix */}
                      <div className="grid grid-cols-2 gap-2 my-2.5 p-2 rounded-xl bg-slate-900/90 border border-slate-800/60 text-xs font-mono">
                        <div>
                          <div className="text-[10px] text-slate-500">Uptime</div>
                          <div className="text-slate-200 font-bold">{func.uptime}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Latency</div>
                          <div className={`font-bold ${isWarn ? 'text-amber-400' : 'text-emerald-400'}`}>{func.latency}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Load</div>
                          <div className="text-slate-300 text-[11px] truncate">{func.load}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Error Rate</div>
                          <div className={`font-bold ${isWarn ? 'text-amber-400' : 'text-slate-300'}`}>{func.errorRate}</div>
                        </div>
                      </div>

                      {/* Sparkline & Last Updated */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                        <span className="text-[10px] text-slate-500 font-mono">Updated: {func.lastUpdated}</span>
                        <Sparkline data={func.sparkline} color={isWarn ? '#FBBF24' : '#10B981'} width={50} height={18} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Selected Function Detail Drawer / Modal */}
        {selectedFunction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="text-emerald-400" size={20} />
                  <h3 className="text-lg font-bold text-white">{selectedFunction.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFunction(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 font-mono">
                  <div>
                    <span className="text-slate-500">Category:</span> <span className="text-slate-200">{selectedFunction.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Status:</span> <span className="text-emerald-400 font-bold">{selectedFunction.status.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Uptime:</span> <span className="text-slate-200">{selectedFunction.uptime}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Latency:</span> <span className="text-emerald-400">{selectedFunction.latency}</span>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  Active in production cluster with auto-scaling replicas across Uttarakhand cloud regions. Monitored under Mountain Trust Protocol telemetry standards.
                </p>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFunction(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-bold hover:bg-slate-700"
                  >
                    Close Inspector
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
