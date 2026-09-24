import React, { useState, useMemo, useRef } from 'react';
import { 
  Navigation, 
  Train, 
  Bus, 
  Car, 
  Mountain, 
  ArrowLeftRight, 
  Clock, 
  MapPin, 
  Shield, 
  AlertTriangle, 
  ChevronRight, 
  Compass, 
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Share2,
  ExternalLink,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ─── 5 Himalayan Transit Corridors ───
const CORRIDORS = [
  {
    id: 'badrinath',
    code: 'L1',
    name: 'NH-07 Badrinath & Auli Corridor',
    color: '#10b981',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500',
    bgLight: 'bg-emerald-500/10',
    stations: [
      'Rishikesh Railhead Hub',
      'Devprayag Sangam',
      'Srinagar Garhwal',
      'Rudraprayag Junction',
      'Karnaprayag Sangam',
      'Chamoli District Base',
      'Joshimath (Auli Ropeway)',
      'Govindghat (Valley Base)',
      'Badrinath Dham & Mana'
    ],
    totalKm: '298 km',
    duration: '9.5 hrs'
  },
  {
    id: 'kedarnath',
    code: 'L2',
    name: 'Mandakini Kedarnath Express Line',
    color: '#a855f7',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500',
    bgLight: 'bg-purple-500/10',
    stations: [
      'Rudraprayag Junction',
      'Augustmuni Helipad',
      'Kund (Chopta Fork)',
      'Guptkashi Cultural Base',
      'Phata Heliport Hub',
      'Sonprayag Transit Barrier',
      'Gaurikund Trek Base',
      'Kedarnath Dham (3,583m)'
    ],
    totalKm: '228 km',
    duration: '7 hrs + 6 hrs Trek / 8m Heli'
  },
  {
    id: 'kumaon',
    code: 'L3',
    name: 'Kumaon Lakes & Heights Line',
    color: '#0284c7',
    textColor: 'text-sky-400',
    borderColor: 'border-sky-500',
    bgLight: 'bg-sky-500/10',
    stations: [
      'Kathgodam Railhead',
      'Bhimtal / Nainital Fork',
      'Bhowali Pine Junction',
      'Almora Cultural Hub',
      'Kausani Sunrise Vista',
      'Bageshwar Sangam',
      'Chaukori Tea Estate',
      'Thal Junction',
      'Munsiyari Panchachuli Base'
    ],
    totalKm: '280 km',
    duration: '10 hrs'
  },
  {
    id: 'glacier',
    code: 'L4',
    name: 'Yamunotri & Gangotri Glacier Line',
    color: '#f97316',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500',
    bgLight: 'bg-amber-500/10',
    stations: [
      'Dehradun Capital Hub',
      'Mussoorie Queen of Hills',
      'Naugaon / Barkot Fork',
      'Janki Chatti (Yamunotri Trek Base)',
      'Yamunotri Dham',
      'Uttarkashi Mountaineering Base',
      'Harsil Apple Valley',
      'Gangotri Dham'
    ],
    totalKm: '260 km',
    duration: '8.5 hrs'
  },
  {
    id: 'adikailash',
    code: 'L5',
    name: 'Adi Kailash & Om Parvat Border Line',
    color: '#eab308',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500',
    bgLight: 'bg-yellow-500/10',
    stations: [
      'Tanakpur Railhead',
      'Champawat Stop',
      'Pithoragarh District Hub',
      'Dharchula (ILP Permit Checkpost)',
      'Tawaghat River Confluence',
      'Budhi Darma Valley Base',
      'Gunji Village (Adi Kailash Junction)',
      'Nabidang (Om Parvat Viewpoint)',
      'Jolinkong (Adi Kailash Base)'
    ],
    totalKm: '325 km',
    duration: '14 hrs (Inner Line Permit Req.)'
  }
];

// ─── Multi-Modal Route Solutions Database ───
const ROUTE_SOLUTIONS = {
  'delhi-kedarnath': {
    fromName: 'New Delhi (NCR)',
    toName: 'Kedarnath Dham (3,583m)',
    totalDistance: '450 km',
    totalDuration: '14 - 16 hrs',
    estimatedCost: '₹1,180 - ₹2,550 (Budget) • ₹6,950 (with Heli)',
    roadStatus: 'NH-107 Open (Good Condition)',
    corridorId: 'kedarnath',
    corridorCode: 'L2 (Purple Line)',
    legs: [
      {
        step: 1,
        mode: 'train',
        badge: 'TRAIN / RAILWAY',
        title: 'New Delhi ➔ Rishikesh / Haridwar Railhead',
        duration: '4.5 hrs',
        cost: '₹280 (Sleeper) / ₹1,150 (Vande Bharat)',
        note: 'Board overnight train (Nanda Devi Exp) or early morning Vande Bharat to Haridwar/Rishikesh Yog Nagari.'
      },
      {
        step: 2,
        mode: 'bus',
        badge: 'MOUNTAIN HIGHWAY',
        title: 'Rishikesh ➔ Sonprayag (NH-107)',
        duration: '7.5 hrs',
        cost: '₹450 (UTC Govt Bus) / ₹900 (Shared Maxx Taxi)',
        note: 'Travel via Devprayag, Srinagar & Rudraprayag along the scenic Mandakini river.'
      },
      {
        step: 3,
        mode: 'car',
        badge: 'SHUTTLE JEEP',
        title: 'Sonprayag ➔ Gaurikund Base Gate',
        duration: '20 mins',
        cost: '₹50 (Local Taxi Union Jeep)',
        note: 'Private vehicles must park at Sonprayag. Take local shuttle jeep to trek starting point.'
      },
      {
        step: 4,
        mode: 'trek',
        badge: 'HIGH ALTITUDE TREK / HELI',
        title: 'Gaurikund ➔ Kedarnath Temple (16 km)',
        duration: '6-7 hrs (Trek) OR 8 mins (Heli from Phata)',
        cost: '₹0 (Trek) / ₹2,500 (Pony) / ₹4,900 (Heli Ticket)',
        note: 'Paved trail with medical posts at every 2km. Oxygen cylinders available at Bheembali & Lincholi.'
      }
    ],
    stationsPassed: [
      'New Delhi', 'Haridwar', 'Rishikesh Hub', 'Devprayag', 'Rudraprayag Junction', 'Guptkashi', 'Phata Heli Base', 'Sonprayag', 'Gaurikund', 'Kedarnath Dham'
    ],
    advisories: [
      'Biometric / QR Registration mandatory before Sonprayag barrier.',
      'AMS Warning: Altitude is 3,583m. Keep Diamox and hydration packs.',
      'Official helicopter booking is strictly through IRCTC HeliYatra portal.'
    ]
  },
  'haridwar-badrinath': {
    fromName: 'Haridwar Railhead',
    toName: 'Badrinath Dham & Mana Village',
    totalDistance: '320 km',
    totalDuration: '10 hrs road',
    estimatedCost: '₹640 - ₹1,450 (Bus/Shared Cab)',
    roadStatus: 'NH-07 All-Weather Highway Open',
    corridorId: 'badrinath',
    corridorCode: 'L1 (Green Line)',
    legs: [
      {
        step: 1,
        mode: 'bus',
        badge: 'ALL-WEATHER HIGHWAY',
        title: 'Haridwar / Rishikesh ➔ Joshimath Base',
        duration: '8.5 hrs',
        cost: '₹520 (UTC Govt Bus) / ₹1,200 (Shared Cab)',
        note: 'Drive along NH-07 Char Dham highway via Srinagar, Karnaprayag and Chamoli.'
      },
      {
        step: 2,
        mode: 'car',
        badge: 'MOUNTAIN ASCENT',
        title: 'Joshimath ➔ Badrinath Temple (45 km)',
        duration: '1.5 hrs',
        cost: '₹120 (Local Bus) / ₹250 (Shared Cab)',
        note: 'Ascent past Govindghat and Hanuman Chatti through the high Alaknanda gorge.'
      },
      {
        step: 3,
        mode: 'trek',
        badge: 'BORDER VILLAGE WALK',
        title: 'Badrinath ➔ Mana (First Indian Village) (3 km)',
        duration: '15 mins',
        cost: '₹30 (E-Rickshaw / Walking)',
        note: 'Explore Saraswati River origin, Bhim Pul, and Vyas Gufa.'
      }
    ],
    stationsPassed: [
      'Haridwar', 'Rishikesh Hub', 'Devprayag Sangam', 'Srinagar', 'Rudraprayag', 'Karnaprayag', 'Joshimath Base', 'Govindghat', 'Badrinath Dham'
    ],
    advisories: [
      'Night vehicle movement is prohibited past Joshimath gate after 8:00 PM.',
      'All-Weather Highway is double-laned and suitable for sedans and SUVs.'
    ]
  },
  'kathgodam-munsiyari': {
    fromName: 'Kathgodam Railhead',
    toName: 'Munsiyari (Panchachuli Base)',
    totalDistance: '280 km',
    totalDuration: '10 hrs drive',
    estimatedCost: '₹750 - ₹1,800',
    roadStatus: 'Kalamuni Pass (2,700m) Open',
    corridorId: 'kumaon',
    corridorCode: 'L3 (Blue Line)',
    legs: [
      {
        step: 1,
        mode: 'car',
        badge: 'KUMAON VISTA HIGHWAY',
        title: 'Kathgodam ➔ Almora ➔ Kausani',
        duration: '4.5 hrs',
        cost: '₹350 (Shared Cab) / ₹2,200 (Private Taxi)',
        note: 'Scenic winding road through pine forests and Bhowali fruit market.'
      },
      {
        step: 2,
        mode: 'bus',
        badge: 'RIDGE HIGHWAY',
        title: 'Kausani ➔ Bageshwar ➔ Chaukori ➔ Thal',
        duration: '3.5 hrs',
        cost: '₹280 (UTC Bus / Local Taxi)',
        note: 'Cross Saryu river valley to Chaukori tea gardens with 300km Himalayan range view.'
      },
      {
        step: 3,
        mode: 'car',
        badge: 'HIGH PASS CROSSING',
        title: 'Thal ➔ Kalamuni Pass (2,700m) ➔ Munsiyari',
        duration: '2 hrs',
        cost: '₹180 (Shared Maxx)',
        note: 'Ascend Kalamuni top past Birthi Falls and descend into Munsiyari facing the 5 Panchachuli peaks.'
      }
    ],
    stationsPassed: [
      'Kathgodam Railhead', 'Bhimtal Fork', 'Almora Hub', 'Kausani', 'Bageshwar', 'Chaukori', 'Thal', 'Munsiyari Base'
    ],
    advisories: [
      'Uninterrupted 180° view of Panchachuli I-V snow peaks from your stay.',
      'Carry motion sickness pills for winding mountain curves between Thal and Kalamuni.'
    ]
  },
  'dehradun-auli': {
    fromName: 'Dehradun (Airport/ISBT)',
    toName: 'Auli Himalayan Ski Resort',
    totalDistance: '290 km',
    totalDuration: '8.5 hrs road + Cable Car',
    estimatedCost: '₹950 - ₹2,100',
    roadStatus: 'NH-07 Clear',
    corridorId: 'badrinath',
    corridorCode: 'L1 (Green Line)',
    legs: [
      {
        step: 1,
        mode: 'bus',
        badge: 'VALLEY HIGHWAY',
        title: 'Dehradun / Rishikesh ➔ Joshimath Base',
        duration: '8 hrs',
        cost: '₹480 (UTC Deluxe Bus) / ₹1,100 (Shared Cab)',
        note: 'Direct morning deluxe bus from Dehradun ISBT or Rishikesh bus stand.'
      },
      {
        step: 2,
        mode: 'car',
        badge: 'AERIAL ROPEWAY / 4X4',
        title: 'Joshimath ➔ Auli Top (2,800m)',
        duration: '22 mins (Ropeway) OR 45 mins (4x4 Road)',
        cost: '₹1,000 (Ropeway Roundtrip) / ₹400 (4x4 Cab)',
        note: "Ride Asia's longest ropeway cable car floating directly over oak and pine canopies."
      }
    ],
    stationsPassed: [
      'Dehradun ISBT', 'Rishikesh Hub', 'Devprayag', 'Srinagar', 'Rudraprayag', 'Joshimath', 'Auli Top'
    ],
    advisories: [
      'Skiing season runs from January to March with snow-making machines.',
      '4x4 vehicles with tire chains required during heavy winter snowfall from Joshimath.'
    ]
  }
};

export default function TransitPage() {
  const [fromStation, setFromStation] = useState('delhi');
  const [toStation, setToStation] = useState('kedarnath');
  const [activeTab, setActiveTab] = useState('route'); // 'route' | 'lines' | 'fares'
  const [activeCorridorFilter, setActiveCorridorFilter] = useState('all');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef(null);

  // Look up selected route or fallback intelligently
  const currentRouteKey = `${fromStation}-${toStation}`;
  const routeData = useMemo(() => {
    if (ROUTE_SOLUTIONS[currentRouteKey]) return ROUTE_SOLUTIONS[currentRouteKey];

    // Generic fallback based on destination
    const genericDestMatch = Object.values(ROUTE_SOLUTIONS).find(r => r.toName.toLowerCase().includes(toStation.toLowerCase())) || ROUTE_SOLUTIONS['delhi-kedarnath'];
    return {
      ...genericDestMatch,
      fromName: fromStation === 'delhi' ? 'New Delhi (NCR)' : fromStation === 'haridwar' ? 'Haridwar Railhead' : fromStation === 'dehradun' ? 'Dehradun ISBT' : 'Kathgodam Railhead',
      toName: toStation === 'kedarnath' ? 'Kedarnath Dham (3,583m)' : toStation === 'badrinath' ? 'Badrinath Dham' : toStation === 'auli' ? 'Auli Ski Resort' : 'Munsiyari Panchachuli'
    };
  }, [currentRouteKey, fromStation, toStation]);

  const handleSwapStations = () => {
    const oldFrom = fromStation;
    setFromStation(toStation === 'kedarnath' ? 'haridwar' : 'delhi');
    setToStation(oldFrom === 'delhi' ? 'badrinath' : 'kedarnath');
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (mapContainerRef.current?.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b132b] text-slate-100 font-sans selection:bg-purple-600 selection:text-white antialiased">
      <Navbar />

      <main className="flex-grow pb-24">
        
        {/* ── 1. HERO SECTION & YOMETRO SEARCH CARD (Exact Image 1 Replica) ── */}
        <section className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#1c2541] via-[#0b132b] to-[#0b132b] border-b border-slate-800">
          
          {/* Subtle Metro Network Background SVG Grid */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="metroGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4f46e5" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#metroGrid)" />
              {/* Abstract Metro Tracks */}
              <line x1="0" y1="20%" x2="100%" y2="80%" stroke="#10b981" strokeWidth="3" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#a855f7" strokeWidth="3" />
              <line x1="20%" y1="0" x2="80%" y2="100%" stroke="#0284c7" strokeWidth="3" />
            </svg>
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            
            {/* Title Header */}
            <div className="text-center space-y-3 mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black border border-purple-500/30">
                <Sparkles size={14} className="text-purple-400" />
                <span>HIMALAYAN TRANSIT & PILGRIMAGE ROUTE NAVIGATOR</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-emerald-400 to-sky-400">Mountain Route</span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto font-medium">
                Step-by-step train connections, mountain bus schedules, shared taxi fares, ropeways & high-altitude Char Dham trek circuits across 13 districts.
              </p>
            </div>

            {/* ── The White Floating YoMetro Search Card (Exact Image 1 Design) ── */}
            <div className="bg-white text-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-w-2xl mx-auto">
              
              {/* Card Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Navigation size={17} className="rotate-45" />
                  </div>
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-purple-900">
                    FIND A HIMALAYAN ROUTE
                  </h2>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Live 2026 GIS
                </span>
              </div>

              {/* Card Body (Form) */}
              <div className="p-6 space-y-4">
                
                {/* From Station Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    FROM STATION / ORIGIN HUB
                  </label>
                  <div className="relative flex items-center bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/90 px-3.5 py-3 transition-colors">
                    <MapPin size={18} className="text-purple-600 mr-2.5 shrink-0" />
                    <select
                      value={fromStation}
                      onChange={(e) => setFromStation(e.target.value)}
                      className="w-full bg-transparent font-bold text-xs sm:text-sm text-slate-800 focus:outline-hidden cursor-pointer"
                    >
                      <option value="delhi">New Delhi / NCR (Air & Railhead Gateway)</option>
                      <option value="haridwar">Haridwar Railhead (Garhwal Entry)</option>
                      <option value="rishikesh">Rishikesh Yog Nagari (Char Dham Rail Terminal)</option>
                      <option value="dehradun">Dehradun Airport & ISBT</option>
                      <option value="kathgodam">Kathgodam Railhead (Kumaon Entry)</option>
                      <option value="ramnagar">Ramnagar / Jim Corbett Hub</option>
                    </select>
                  </div>
                </div>

                {/* Swap Button Divider */}
                <div className="relative flex justify-end pr-3 -my-2.5 z-10">
                  <button
                    type="button"
                    onClick={handleSwapStations}
                    className="w-9 h-9 rounded-full bg-white hover:bg-purple-50 text-purple-700 border border-slate-200 shadow-md flex items-center justify-center transition cursor-pointer hover:rotate-180 duration-300"
                    title="Swap Origin & Destination"
                  >
                    <ArrowLeftRight size={15} className="rotate-90" />
                  </button>
                </div>

                {/* To Station Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    TO MOUNTAIN DESTINATION / SHRINE
                  </label>
                  <div className="relative flex items-center bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/90 px-3.5 py-3 transition-colors">
                    <Mountain size={18} className="text-purple-600 mr-2.5 shrink-0" />
                    <select
                      value={toStation}
                      onChange={(e) => setToStation(e.target.value)}
                      className="w-full bg-transparent font-bold text-xs sm:text-sm text-slate-800 focus:outline-hidden cursor-pointer"
                    >
                      <option value="kedarnath">Kedarnath Dham (3,583m • High Altitude Shrine)</option>
                      <option value="badrinath">Badrinath Dham & Mana (First Indian Village)</option>
                      <option value="auli">Auli Himalayan Ski Resort & Ropeway</option>
                      <option value="munsiyari">Munsiyari (Panchachuli Snow Peaks Base)</option>
                      <option value="chopta">Chopta - Tungnath (World's Highest Shiva Temple)</option>
                      <option value="gangotri">Gangotri Glacier Source</option>
                      <option value="yamunotri">Yamunotri Dham & Surya Kund</option>
                      <option value="valley-of-flowers">Hemkund Sahib & Valley of Flowers</option>
                    </select>
                  </div>
                </div>

                {/* Main Find Route CTA Button (Exact YoMetro Purple Button) */}
                <a
                  href="#route-results"
                  className="w-full py-4 rounded-2xl bg-[#5d4da8] hover:bg-[#4d3d98] active:scale-[0.99] text-white font-extrabold text-sm shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Find Route</span>
                  <ChevronRight size={18} strokeWidth={3} />
                </a>

              </div>

              {/* Card Footer: Timings & Helpline (Exact Image 1 Details) */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-purple-600 shrink-0" />
                  <span>Mountain Transit Timings: <strong>04:30 AM / 08:30 PM</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall size={15} className="text-purple-600 shrink-0" />
                  <span>Helpline No.: <strong>1070 (Disaster) / 112</strong></span>
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* ── 2. ROUTE CALCULATION RESULTS (Multi-Modal Steps & Fare Breakdown) ── */}
        <section id="route-results" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 scroll-mt-20">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Detailed Multi-Modal Steps (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Route Summary Header Banner */}
              <div className="p-6 rounded-3xl bg-[#1c2541] border border-slate-700 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-400 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                      OPTIMAL MULTI-MODAL PATHWAY
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {routeData.corridorCode}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-lg sm:text-xl font-extrabold text-white">
                  <span>{routeData.fromName}</span>
                  <ArrowLeftRight size={18} className="text-purple-400" />
                  <span className="text-emerald-300">{routeData.toName}</span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-2xl bg-[#0b132b] border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Estimated Time</span>
                    <strong className="text-sm font-black text-white mt-0.5 block">⏱️ {routeData.totalDuration}</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#0b132b] border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Total Distance</span>
                    <strong className="text-sm font-black text-white mt-0.5 block">🛣️ {routeData.totalDistance}</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#0b132b] border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Road Status</span>
                    <strong className="text-xs font-black text-emerald-400 mt-0.5 block truncate">✓ {routeData.roadStatus}</strong>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Multi-Modal Legs */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                  Step-by-Step Journey Breakdown
                </h3>

                <div className="space-y-3 relative before:absolute before:top-4 before:bottom-4 before:left-5 before:w-0.5 before:bg-purple-500/40">
                  {routeData.legs.map((leg) => (
                    <div 
                      key={leg.step}
                      className="relative pl-12 p-4 rounded-2xl bg-[#1c2541]/90 border border-slate-700/80 shadow-md space-y-2 hover:border-purple-500/60 transition-all"
                    >
                      {/* Step Circle Badge */}
                      <div className="absolute left-3 top-4 w-5 h-5 rounded-full bg-purple-600 border-2 border-[#0b132b] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                        {leg.step}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {leg.badge}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {leg.cost}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-white">
                        {leg.title}
                      </h4>

                      <p className="text-xs text-slate-300 font-normal leading-relaxed">
                        {leg.note}
                      </p>

                      <div className="text-[11px] font-semibold text-slate-400 pt-1 border-t border-slate-700/50">
                        ⏱️ Duration: <span className="text-white">{leg.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advisories Card */}
              {routeData.advisories && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                    <AlertTriangle size={16} className="text-amber-400" />
                    <span>Active Road & High-Altitude Advisories</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 pl-5 list-disc font-medium">
                    {routeData.advisories.map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Right: 5 Mountain Lines & GIS Quick Access (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Lines Directory Box */}
              <div className="p-6 rounded-3xl bg-[#1c2541] border border-slate-700 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    5 Himalayan Transit Lines
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">2026 Grid</span>
                </div>

                <div className="space-y-2.5">
                  {CORRIDORS.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        c.id === routeData.corridorId
                          ? `${c.bgLight} ${c.borderColor} ring-2 ring-purple-500/50 shadow-md`
                          : 'bg-[#0b132b]/80 hover:bg-[#0b132b] border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                          <h4 className="text-xs font-extrabold text-white">{c.name}</h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {c.code}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80 font-medium">
                        <span>🛣️ {c.totalKm}</span>
                        <span>⏱️ {c.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Direct GIS Map Link CTA */}
                <Link
                  to="/map"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md"
                >
                  <Compass size={15} />
                  <span>Open Full Interactive GIS Map</span>
                </Link>
              </div>

            </div>

          </div>

        </section>


        {/* ── 3. OFFICIAL SCHEMATIC HIMALAYAN ROUTE MAP CANVAS (Exact Image 2 Replica) ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16" id="network-map">
          
          {/* Map Section Header & Controls */}
          <div className="p-6 rounded-3xl bg-[#1c2541] border border-slate-700 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-2xl font-black text-white">
                    Uttarakhand Himalayan Transit Route Map 2026
                  </h2>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Official
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  View and navigate the official multi-modal pilgrimage and mountain transit corridors.
                </p>
              </div>

              {/* Map Zoom & Action Controls (Exact Image 2 Buttons) */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2.0))}
                  className="w-8 h-8 rounded-lg bg-[#0b132b] hover:bg-slate-800 text-white flex items-center justify-center font-bold transition border border-slate-700 shadow-xs cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.6))}
                  className="w-8 h-8 rounded-lg bg-[#0b132b] hover:bg-slate-800 text-white flex items-center justify-center font-bold transition border border-slate-700 shadow-xs cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="w-8 h-8 rounded-lg bg-[#0b132b] hover:bg-slate-800 text-white flex items-center justify-center font-bold transition border border-slate-700 shadow-xs cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="w-8 h-8 rounded-lg bg-[#0b132b] hover:bg-slate-800 text-white flex items-center justify-center font-bold transition border border-slate-700 shadow-xs cursor-pointer"
                  title="Toggle Fullscreen"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>

            {/* Interactive Schematic SVG Transit Map Canvas (Clean YoMetro Style Vector) */}
            <div 
              ref={mapContainerRef}
              className="relative w-full h-[520px] sm:h-[620px] bg-white rounded-2xl overflow-hidden shadow-inner border border-slate-300 flex items-center justify-center p-4"
            >
              
              <div 
                className="w-full h-full transition-transform duration-200 origin-center flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <svg
                  viewBox="0 0 900 650"
                  className="w-full h-full max-w-full max-h-full select-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background Grid Pattern */}
                  <defs>
                    <pattern id="schematicDots" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="1" fill="#e2e8f0" />
                    </pattern>
                  </defs>
                  <rect width="900" height="650" fill="url(#schematicDots)" />

                  {/* ── 1. NH-07 Badrinath Line (Green Line L1) ── */}
                  <polyline
                    points="120,520 220,440 320,380 430,340 520,300 610,240 700,170 780,110"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* ── 2. Mandakini Kedarnath Line (Purple Line L2) ── */}
                  <polyline
                    points="430,340 450,280 470,220 490,160 510,100"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* ── 3. Kumaon Lakes & Heights Line (Blue Line L3) ── */}
                  <polyline
                    points="380,580 460,510 520,450 600,410 680,350 760,280 820,210"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* ── 4. Yamunotri & Gangotri Glacier Line (Orange Line L4) ── */}
                  <polyline
                    points="100,420 180,340 260,260 340,180 420,110"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* ── 5. Adi Kailash & Om Parvat Border Line (Gold Line L5) ── */}
                  <polyline
                    points="620,590 690,520 750,440 810,360 860,270 870,180"
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* ── Station Nodes & Labels (Subway Metro Style) ── */}
                  
                  {/* Rishikesh Hub (Interchange) */}
                  <circle cx="120" cy="520" r="10" fill="white" stroke="#10b981" strokeWidth="4" />
                  <text x="120" y="545" fontSize="11" fontWeight="bold" fill="#0f172a" textAnchor="middle">Rishikesh Hub (L1)</text>

                  {/* Devprayag Sangam */}
                  <circle cx="220" cy="440" r="7" fill="white" stroke="#10b981" strokeWidth="3" />
                  <text x="220" y="460" fontSize="10" fontWeight="600" fill="#334155" textAnchor="middle">Devprayag</text>

                  {/* Srinagar Garhwal */}
                  <circle cx="320" cy="380" r="7" fill="white" stroke="#10b981" strokeWidth="3" />
                  <text x="320" y="400" fontSize="10" fontWeight="600" fill="#334155" textAnchor="middle">Srinagar</text>

                  {/* Rudraprayag Major Interchange (L1 × L2) */}
                  <circle cx="430" cy="340" r="13" fill="white" stroke="#5d4da8" strokeWidth="4" />
                  <circle cx="430" cy="340" r="6" fill="#10b981" />
                  <text x="430" y="365" fontSize="12" fontWeight="bold" fill="#5d4da8" textAnchor="middle">Rudraprayag Jnc ⇄</text>

                  {/* Guptkashi / Phata Heli */}
                  <circle cx="470" cy="220" r="7" fill="white" stroke="#a855f7" strokeWidth="3" />
                  <text x="425" y="225" fontSize="10" fontWeight="600" fill="#334155" textAnchor="end">Phata (Heli Base)</text>

                  {/* Sonprayag Base */}
                  <circle cx="490" cy="160" r="8" fill="white" stroke="#a855f7" strokeWidth="3" />
                  <text x="445" y="165" fontSize="10" fontWeight="bold" fill="#334155" textAnchor="end">Sonprayag Gate</text>

                  {/* Kedarnath Dham (Terminus) */}
                  <circle cx="510" cy="100" r="11" fill="#a855f7" stroke="white" strokeWidth="3" />
                  <text x="510" y="80" fontSize="12" fontWeight="900" fill="#7e22ce" textAnchor="middle">Kedarnath Dham (3,583m)</text>

                  {/* Joshimath Base */}
                  <circle cx="610" cy="240" r="8" fill="white" stroke="#10b981" strokeWidth="3" />
                  <text x="610" y="260" fontSize="10" fontWeight="600" fill="#334155" textAnchor="middle">Joshimath (Auli Base)</text>

                  {/* Badrinath Dham (Terminus) */}
                  <circle cx="780" cy="110" r="11" fill="#10b981" stroke="white" strokeWidth="3" />
                  <text x="780" y="90" fontSize="12" fontWeight="900" fill="#047857" textAnchor="middle">Badrinath Dham</text>

                  {/* Kathgodam Railhead (L3 Entry) */}
                  <circle cx="380" cy="580" r="10" fill="white" stroke="#0284c7" strokeWidth="4" />
                  <text x="380" y="605" fontSize="11" fontWeight="bold" fill="#0369a1" textAnchor="middle">Kathgodam Railhead (L3)</text>

                  {/* Almora Heritage Hub */}
                  <circle cx="520" cy="450" r="7" fill="white" stroke="#0284c7" strokeWidth="3" />
                  <text x="520" y="470" fontSize="10" fontWeight="600" fill="#334155" textAnchor="middle">Almora Hub</text>

                  {/* Munsiyari (L3 Terminus) */}
                  <circle cx="820" cy="210" r="11" fill="#0284c7" stroke="white" strokeWidth="3" />
                  <text x="820" y="190" fontSize="12" fontWeight="900" fill="#0284c7" textAnchor="middle">Munsiyari Panchachuli</text>

                  {/* Dehradun Capital Hub (L4 Entry) */}
                  <circle cx="100" cy="420" r="10" fill="white" stroke="#f97316" strokeWidth="4" />
                  <text x="100" y="445" fontSize="11" fontWeight="bold" fill="#ea580c" textAnchor="middle">Dehradun ISBT (L4)</text>

                  {/* Gangotri Dham (L4 Terminus) */}
                  <circle cx="420" cy="110" r="11" fill="#f97316" stroke="white" strokeWidth="3" />
                  <text x="420" y="90" fontSize="12" fontWeight="900" fill="#c2410c" textAnchor="middle">Gangotri Dham</text>

                  {/* Adi Kailash (L5 Terminus) */}
                  <circle cx="870" cy="180" r="11" fill="#eab308" stroke="white" strokeWidth="3" />
                  <text x="870" y="160" fontSize="12" fontWeight="900" fill="#a16207" textAnchor="middle">Adi Kailash & Om Parvat</text>

                  {/* ── Official Legend Card (Corner Box like Image 2) ── */}
                  <g transform="translate(30, 40)">
                    <rect width="210" height="150" rx="12" fill="white" stroke="#cbd5e1" strokeWidth="1.5" opacity="0.95" />
                    <text x="15" y="24" fontSize="11" fontWeight="900" fill="#0f172a">HIMALAYAN TRANSIT LINES</text>
                    
                    <line x1="15" y1="42" x2="35" y2="42" stroke="#10b981" strokeWidth="4" />
                    <text x="45" y="46" fontSize="10" fontWeight="bold" fill="#334155">L1: Badrinath Line</text>

                    <line x1="15" y1="64" x2="35" y2="64" stroke="#a855f7" strokeWidth="4" />
                    <text x="45" y="68" fontSize="10" fontWeight="bold" fill="#334155">L2: Kedarnath Line</text>

                    <line x1="15" y1="86" x2="35" y2="86" stroke="#0284c7" strokeWidth="4" />
                    <text x="45" y="90" fontSize="10" fontWeight="bold" fill="#334155">L3: Kumaon Line</text>

                    <line x1="15" y1="108" x2="35" y2="108" stroke="#f97316" strokeWidth="4" />
                    <text x="45" y="112" fontSize="10" fontWeight="bold" fill="#334155">L4: Glacier Line</text>

                    <line x1="15" y1="130" x2="35" y2="130" stroke="#eab308" strokeWidth="4" />
                    <text x="45" y="134" fontSize="10" fontWeight="bold" fill="#334155">L5: Adi Kailash Line</text>
                  </g>
                </svg>
              </div>

              {/* Bottom Right Zoom Indicator */}
              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-mono font-bold shadow-md">
                {Math.round(zoomLevel * 100)}% Zoom
              </div>
            </div>

          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
