import React, { useState, useMemo } from 'react';
import {
  Navigation,
  Mountain,
  ArrowLeftRight,
  Clock,
  MapPin,
  AlertTriangle,
  ChevronRight,
  X,
  Compass,
  PhoneCall,
  Train,
  Bus,
  Car,
  Footprints,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';

// ─── 5 Himalayan Corridors & Highways ────────────────────────
export const HIMALAYAN_CORRIDORS = {
  badrinath: {
    id: 'badrinath',
    name: 'NH-07 Badrinath & Auli Corridor',
    code: 'L1',
    color: '#10b981',
    badgeBg: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-300',
    lightBg: 'bg-emerald-50',
    duration: '9-10 hrs road',
    totalKm: '298 km',
    highway: 'NH-07 (All-Weather Char Dham Highway)',
    description: 'The great Alaknanda valley artery connecting Rishikesh railhead to Badrinath & Auli.',
    stations: [
      { name: 'Rishikesh Railhead Hub', coords: [30.0869, 78.2676], type: 'interchange', altitude: '372m', modes: ['Train', 'UTC Bus', 'Taxi'] },
      { name: 'Devprayag Sangam', coords: [30.1459, 78.5990], type: 'junction', altitude: '618m', modes: ['Bus', 'Shared Taxi'] },
      { name: 'Srinagar Garhwal Hub', coords: [30.2227, 78.7844], type: 'station', altitude: '560m', modes: ['Bus', 'Medical Base'] },
      { name: 'Rudraprayag Junction', coords: [30.2858, 78.9811], type: 'interchange', altitude: '895m', modes: ['Kedarnath Interchange', 'Bus'] },
      { name: 'Karnaprayag Sangam', coords: [30.2605, 79.2173], type: 'station', altitude: '1,451m', modes: ['Bus', 'Shared Maxx'] },
      { name: 'Chamoli District Base', coords: [30.4070, 79.3364], type: 'station', altitude: '1,150m', modes: ['Bus', 'Taxi'] },
      { name: 'Joshimath Auli Base', coords: [30.5564, 79.5661], type: 'junction', altitude: '1,890m', modes: ['Cable Car', 'Taxi', 'Helipad'] },
      { name: 'Govindghat (Valley Base)', coords: [30.6250, 79.5480], type: 'junction', altitude: '1,828m', modes: ['Trek Base', 'Pony', 'Jeep'] },
      { name: 'Badrinath Dham', coords: [30.7465, 79.4942], type: 'terminus', altitude: '3,300m', modes: ['Shrine Town', 'GMVN Stays'] },
    ],
    polyline: [[30.0869, 78.2676],[30.1459, 78.5990],[30.2227, 78.7844],[30.2858, 78.9811],[30.2605, 79.2173],[30.4070, 79.3364],[30.5564, 79.5661],[30.6250, 79.5480],[30.7465, 79.4942]]
  },
  kedarnath: {
    id: 'kedarnath',
    name: 'Mandakini Kedarnath Highway',
    code: 'L2',
    color: '#a855f7',
    badgeBg: 'bg-purple-500',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    lightBg: 'bg-purple-50',
    duration: '7 hrs road + 6 hrs trek',
    totalKm: '228 km',
    highway: 'NH-107 Mandakini River Corridor',
    description: 'The sacred Mandakini river highway to Guptkashi, Phata heli bases, and Kedarnath shrine.',
    stations: [
      { name: 'Rudraprayag Junction', coords: [30.2858, 78.9811], type: 'interchange', altitude: '895m', modes: ['NH-07 Interchange', 'Bus'] },
      { name: 'Augustmuni Helipad', coords: [30.3950, 79.0230], type: 'station', altitude: '920m', modes: ['Heli Services', 'Taxi'] },
      { name: 'Kund (Chopta Fork)', coords: [30.4900, 79.0600], type: 'junction', altitude: '1,050m', modes: ['Chopta-Tungnath Interchange'] },
      { name: 'Guptkashi Cultural Base', coords: [30.5200, 79.0800], type: 'station', altitude: '1,320m', modes: ['Bus', 'Taxi', 'Medical'] },
      { name: 'Phata Heliport Hub', coords: [30.5560, 79.0960], type: 'junction', altitude: '1,640m', modes: ['Heli Booking', 'Taxi', 'Shuttle'] },
      { name: 'Sonprayag Transit Gate', coords: [30.6040, 79.0990], type: 'station', altitude: '1,829m', modes: ['Barrier', 'Local Shuttle Only'] },
      { name: 'Gaurikund Trek Base', coords: [30.6510, 79.1040], type: 'junction', altitude: '1,982m', modes: ['Trek', 'Pony', 'Palanquin'] },
      { name: 'Kedarnath Dham', coords: [30.7352, 79.0669], type: 'terminus', altitude: '3,583m', modes: ['Trek End', 'GMVN Camps'] },
    ],
    polyline: [[30.2858, 78.9811],[30.3950, 79.0230],[30.4900, 79.0600],[30.5200, 79.0800],[30.5560, 79.0960],[30.6040, 79.0990],[30.6510, 79.1040],[30.7352, 79.0669]]
  },
  kumaon: {
    id: 'kumaon',
    name: 'Kumaon Lakes & Heights Route',
    code: 'L3',
    color: '#0284c7',
    badgeBg: 'bg-sky-500',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-300',
    lightBg: 'bg-sky-50',
    duration: '10 hrs scenic drive',
    totalKm: '280 km',
    highway: 'NH-309 Kumaon Ridge Highways',
    description: 'Pine ridges, tea estates, and 5-peak Himalayan views from Kathgodam to Munsiyari.',
    stations: [
      { name: 'Kathgodam Railhead', coords: [29.2182, 79.5267], type: 'interchange', altitude: '554m', modes: ['Train', 'UTC Bus', 'Taxi'] },
      { name: 'Bhimtal/Nainital', coords: [29.3437, 79.5677], type: 'junction', altitude: '1,370m', modes: ['Lake Hub', 'Local Bus'] },
      { name: 'Almora Cultural Hub', coords: [29.5971, 79.6591], type: 'junction', altitude: '1,638m', modes: ['District HQ', 'Taxi'] },
      { name: 'Kausani Sunrise Vista', coords: [29.8390, 79.5970], type: 'station', altitude: '1,890m', modes: ['Bus', 'Hotel Stays'] },
      { name: 'Bageshwar Sangam', coords: [29.8380, 79.7720], type: 'station', altitude: '960m', modes: ['Bus', 'Shared Maxx'] },
      { name: 'Thal Junction', coords: [29.9630, 80.3750], type: 'junction', altitude: '895m', modes: ['Shared Maxx', 'Local Bus'] },
      { name: 'Munsiyari Panchachuli', coords: [30.0670, 80.2390], type: 'terminus', altitude: '2,200m', modes: ['Trekking Base'] },
    ],
    polyline: [[29.2182, 79.5267],[29.3437, 79.5677],[29.5971, 79.6591],[29.8390, 79.5970],[29.8380, 79.7720],[29.9630, 80.3750],[30.0670, 80.2390]]
  },
  glacier: {
    id: 'glacier',
    name: 'Yamunotri & Gangotri Glacier Route',
    code: 'L4',
    color: '#f97316',
    badgeBg: 'bg-amber-500',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
    lightBg: 'bg-amber-50',
    duration: '8-9 hrs road',
    totalKm: '260 km',
    highway: 'NH-134 Yamuna Valley / NH-108 Ganga Corridor',
    description: 'Twin glacier dhams — Yamunotri source and Gangotri origin — via Dehradun capital.',
    stations: [
      { name: 'Dehradun Capital Hub', coords: [30.3165, 78.0322], type: 'interchange', altitude: '447m', modes: ['Airport', 'ISBT', 'Train'] },
      { name: 'Mussoorie Queen of Hills', coords: [30.4539, 78.0644], type: 'junction', altitude: '2,000m', modes: ['Bus', 'Cable Car'] },
      { name: 'Uttarkashi Mountaineering', coords: [30.7248, 78.4464], type: 'junction', altitude: '1,165m', modes: ['Mountaineering Base'] },
      { name: 'Harsil Apple Valley', coords: [31.1400, 78.7200], type: 'station', altitude: '2,620m', modes: ['Taxi', 'GMVN'] },
      { name: 'Gangotri Glacier Source', coords: [30.9940, 79.0706], type: 'terminus', altitude: '3,048m', modes: ['Shrine Entry'] },
    ],
    polyline: [[30.3165, 78.0322],[30.4539, 78.0644],[30.7248, 78.4464],[31.1400, 78.7200],[30.9940, 79.0706]]
  },
  adikailash: {
    id: 'adikailash',
    name: 'Adi Kailash & Om Parvat Border Route',
    code: 'L5',
    color: '#eab308',
    badgeBg: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    lightBg: 'bg-yellow-50',
    duration: '14 hrs (Inner Line Permit Req.)',
    totalKm: '325 km',
    highway: 'NH-9 Pithoragarh Corridor (ILP Zone)',
    description: 'Remote Himalayan border zone requiring Inner Line Permit via Dharchula.',
    stations: [
      { name: 'Tanakpur Railhead', coords: [29.0700, 80.1100], type: 'interchange', altitude: '280m', modes: ['Train', 'Bus'] },
      { name: 'Pithoragarh District Hub', coords: [29.5820, 80.2180], type: 'junction', altitude: '1,814m', modes: ['ILP Permit Office', 'Taxi'] },
      { name: 'Dharchula ILP Checkpost', coords: [29.8570, 80.5280], type: 'junction', altitude: '915m', modes: ['ILP Check', 'Jeep'] },
      { name: 'Gunji Adi Kailash Jnc', coords: [30.2700, 80.9900], type: 'interchange', altitude: '3,050m', modes: ['Trek Base'] },
    ],
    polyline: [[29.0700, 80.1100],[29.5820, 80.2180],[29.8570, 80.5280],[30.0700, 80.7900],[30.2700, 80.9900]]
  }
};

// ─── Transport mode icon helper ───────────────────────────────
const MODE_ICONS = { TRAIN: Train, 'MOUNTAIN BUS': Bus, BUS: Bus, 'UTC DELUXE': Bus, 'LOCAL BUS': Bus, SHUTTLE: Car, SHARED_CAB: Car, 'SHARED CAB': Car, 'MOUNTAIN PASS': Mountain, ROPEWAY: Navigation, WALK: Footprints, 'TREK / HELI': Mountain, trek: Mountain };

// ─── Multi-Modal Route Catalog ────────────────────────────────
export const TRANSIT_CATALOG = [
  {
    from: 'delhi', fromLabel: 'New Delhi (NCR)',
    to: 'kedarnath', toLabel: 'Kedarnath Dham (3,583m)',
    corridorId: 'kedarnath', duration: '14-16 hrs total', totalDistance: '450 km',
    roadStatus: 'NH-107 Open — Good Condition',
    legs: [
      { mode: 'TRAIN', title: 'Express Train to Railhead', route: 'New Delhi → Rishikesh / Haridwar', time: '4.5 hrs', cost: '₹280 – ₹1,150' },
      { mode: 'MOUNTAIN BUS', title: 'Highway Bus / Shared Cab', route: 'Rishikesh → Sonprayag via NH-107', time: '7.5 hrs', cost: '₹450 – ₹900' },
      { mode: 'SHUTTLE', title: 'Local Shuttle Jeep', route: 'Sonprayag → Gaurikund Base Gate', time: '20 mins', cost: '₹50' },
      { mode: 'TREK / HELI', title: 'Mountain Trek or Helicopter', route: 'Gaurikund → Kedarnath (16 km)', time: '6-7 hrs Trek / 8 min Heli', cost: '₹0 (Trek) – ₹4,900 (Heli)' }
    ],
    advisories: ['Sonprayag Biometric Registration required', 'AMS risk above 3,000m — carry Diamox', 'Official Heli tickets via IRCTC HeliYatra only']
  },
  {
    from: 'haridwar', fromLabel: 'Haridwar (Railhead)',
    to: 'badrinath', toLabel: 'Badrinath Dham & Mana Village',
    corridorId: 'badrinath', duration: '10 hrs road', totalDistance: '320 km',
    roadStatus: 'NH-07 All-Weather Road Clear',
    legs: [
      { mode: 'MOUNTAIN BUS', title: 'UTC Bus / Shared Cab', route: 'Haridwar / Rishikesh → Joshimath Base', time: '8.5 hrs', cost: '₹520 – ₹1,200' },
      { mode: 'LOCAL BUS', title: 'Mountain Ascent', route: 'Joshimath → Badrinath Temple (45 km)', time: '1.5 hrs', cost: '₹120 – ₹250' },
      { mode: 'WALK', title: "India's Last Village Walk", route: 'Badrinath → Mana Village & Saraswati River', time: '15 mins', cost: '₹30 (E-Rickshaw)' }
    ],
    advisories: ['Night driving prohibited past Joshimath after 8:00 PM', 'NH-07 All-Weather Highway open 24x7']
  },
  {
    from: 'kathgodam', fromLabel: 'Kathgodam (Kumaon Railhead)',
    to: 'munsiyari', toLabel: 'Munsiyari (Panchachuli Base)',
    corridorId: 'kumaon', duration: '10 hrs scenic', totalDistance: '280 km',
    roadStatus: 'Kalamuni Pass Open',
    legs: [
      { mode: 'SHARED CAB', title: 'Kumaon Vista Drive', route: 'Kathgodam → Almora → Kausani', time: '4.5 hrs', cost: '₹350 – ₹2,200' },
      { mode: 'BUS', title: 'Ridge Highway', route: 'Kausani → Bageshwar → Thal', time: '3.5 hrs', cost: '₹280' },
      { mode: 'MOUNTAIN PASS', title: 'Kalamuni Pass Crossing (2,700m)', route: 'Thal → Kalamuni Top → Munsiyari', time: '2 hrs', cost: '₹180' }
    ],
    advisories: ['Spectacular close-up view of Panchachuli Peaks', 'Carry snow chains in peak winter (Nov–Mar)']
  },
  {
    from: 'dehradun', fromLabel: 'Dehradun (Airport/ISBT)',
    to: 'auli', toLabel: 'Auli Himalayan Ski Resort',
    corridorId: 'badrinath', duration: '8.5 hrs + Cable Car', totalDistance: '290 km',
    roadStatus: 'NH-07 Clear',
    legs: [
      { mode: 'UTC DELUXE', title: 'Capital to Joshimath Drive', route: 'Dehradun → Rishikesh → Srinagar → Joshimath', time: '8 hrs', cost: '₹480 – ₹1,100' },
      { mode: 'ROPEWAY', title: "Asia's Longest Aerial Ropeway", route: 'Joshimath → Auli Top (2,800m)', time: '22 mins', cost: '₹1,000 Roundtrip' }
    ],
    advisories: ['Ski Season: January – March', '4x4 with snow chains required in heavy winter snowfall']
  }
];

/**
 * TransitRouteDrawer — Himalayan Route Finder panel inside /map
 * Design: matches Discovery Uttarakhand global UI (white, emerald, stone)
 */
export default function TransitRouteDrawer({ isOpen, onClose, activeCorridorId, onSelectCorridor, onFlyToCorridor }) {
  const [fromLocation, setFromLocation] = useState('delhi');
  const [toLocation, setToLocation] = useState('kedarnath');
  const [selectedTab, setSelectedTab] = useState('route');

  const calculatedRoute = useMemo(() => {
    const match = TRANSIT_CATALOG.find(r => r.from === fromLocation && r.to === toLocation);
    if (match) return match;
    const fallback = TRANSIT_CATALOG.find(r => r.to === toLocation) || TRANSIT_CATALOG[0];
    return {
      ...fallback,
      fromLabel: fromLocation === 'delhi' ? 'New Delhi (NCR)' : fromLocation === 'haridwar' ? 'Haridwar Railhead' : fromLocation === 'dehradun' ? 'Dehradun ISBT' : 'Kathgodam Railhead',
    };
  }, [fromLocation, toLocation]);

  const handleSwap = () => {
    const old = fromLocation;
    setFromLocation(toLocation === 'kedarnath' ? 'haridwar' : 'delhi');
    setToLocation(old === 'delhi' ? 'badrinath' : 'kedarnath');
  };

  const handleShowOnMap = (corridorId) => {
    const cId = corridorId || calculatedRoute.corridorId;
    if (cId) {
      onSelectCorridor(cId);
      if (onFlyToCorridor) onFlyToCorridor(cId);
    }
  };

  const getModeIcon = (mode) => {
    const key = (mode || '').toUpperCase();
    const Icon = MODE_ICONS[key] || Navigation;
    return Icon;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[1100] w-full max-w-[400px] bg-white shadow-2xl border-l border-stone-200 flex flex-col font-sans text-stone-900 animate-in slide-in-from-right duration-250">

      {/* ── Header ── */}
      <div className="px-5 py-4 bg-white border-b border-stone-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0f3d2e] flex items-center justify-center shadow-sm">
            <Navigation size={18} className="text-emerald-300" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight text-[#0f3d2e]">Himalayan Route Finder</h3>
            <p className="text-[11px] text-stone-400 font-medium">Step-by-step • Fares • 5 Corridors</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-stone-200 bg-stone-50/80 px-4 pt-2 gap-1 shrink-0">
        {[
          { key: 'route', label: 'Find Route' },
          { key: 'lines', label: '5 Corridors' },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedTab(tab.key)}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              selectedTab === tab.key
                ? 'border-[#0f3d2e] text-[#0f3d2e]'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto">
        {selectedTab === 'route' ? (
          <div className="p-4 space-y-4">

            {/* ─── Search Card ─── */}
            <div className="bg-[#fdfbf7] rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
              {/* Card Header */}
              <div className="px-4 py-3 bg-white border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass size={15} className="text-[#0f3d2e]" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#0f3d2e]">Plan Your Mountain Journey</span>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Live 2026
                </span>
              </div>

              <div className="p-4 space-y-3">
                {/* FROM */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block mb-1.5">
                    From — Origin / Railhead
                  </label>
                  <div className="flex items-center bg-white rounded-xl border border-stone-200 px-3 py-2.5 gap-2 hover:border-[#0f3d2e]/40 transition-colors shadow-2xs">
                    <MapPin size={14} className="text-[#0f3d2e] shrink-0" />
                    <select
                      value={fromLocation}
                      onChange={e => setFromLocation(e.target.value)}
                      className="w-full bg-transparent font-semibold text-xs text-stone-800 focus:outline-none cursor-pointer"
                    >
                      <option value="delhi">New Delhi / NCR (Air &amp; Rail Gateway)</option>
                      <option value="haridwar">Haridwar Railhead (Garhwal Entry)</option>
                      <option value="rishikesh">Rishikesh Yog Nagari (Char Dham Terminal)</option>
                      <option value="dehradun">Dehradun Airport &amp; ISBT</option>
                      <option value="kathgodam">Kathgodam Railhead (Kumaon Entry)</option>
                    </select>
                  </div>
                </div>

                {/* Swap */}
                <div className="flex justify-center -my-1 relative z-10">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="w-8 h-8 rounded-full bg-white border border-stone-200 shadow-sm hover:bg-emerald-50 hover:border-emerald-300 text-stone-500 hover:text-[#0f3d2e] flex items-center justify-center transition cursor-pointer duration-200"
                    title="Swap Origin & Destination"
                  >
                    <ArrowLeftRight size={13} className="rotate-90" />
                  </button>
                </div>

                {/* TO */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block mb-1.5">
                    To — Mountain Destination / Shrine
                  </label>
                  <div className="flex items-center bg-white rounded-xl border border-stone-200 px-3 py-2.5 gap-2 hover:border-[#0f3d2e]/40 transition-colors shadow-2xs">
                    <Mountain size={14} className="text-[#0f3d2e] shrink-0" />
                    <select
                      value={toLocation}
                      onChange={e => setToLocation(e.target.value)}
                      className="w-full bg-transparent font-semibold text-xs text-stone-800 focus:outline-none cursor-pointer"
                    >
                      <option value="kedarnath">Kedarnath Dham (3,583m • High Altitude Shrine)</option>
                      <option value="badrinath">Badrinath Dham &amp; Mana Village</option>
                      <option value="auli">Auli Himalayan Ski Resort &amp; Ropeway</option>
                      <option value="munsiyari">Munsiyari (Panchachuli Snow Peaks Base)</option>
                    </select>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => handleShowOnMap(calculatedRoute.corridorId)}
                  className="w-full py-3 rounded-xl bg-[#0f3d2e] hover:bg-[#185340] active:scale-[0.99] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Compass size={15} />
                  <span>Show Route on Map</span>
                </button>
              </div>

              {/* Footer: timings & helpline */}
              <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex flex-col gap-1.5 text-[11px] text-stone-500 font-medium">
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-[#0f3d2e] shrink-0" />
                  <span>Mountain Timings: <strong className="text-stone-700">04:30 AM – 08:30 PM</strong> (Night travel restricted)</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall size={12} className="text-[#0f3d2e] shrink-0" />
                  <span>Highway Helpline: <strong className="text-stone-700">1070 (Disaster) / 112</strong></span>
                </div>
              </div>
            </div>

            {/* ─── Route Result ─── */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              {/* Result Header */}
              <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">Optimal Route Found</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#0f3d2e]/10 text-[#0f3d2e] border border-[#0f3d2e]/20">
                  {(calculatedRoute.corridorId || '').toUpperCase()}
                </span>
              </div>

              <div className="p-4 space-y-3">
                {/* From → To */}
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800 flex-wrap">
                  <span className="text-stone-500">{calculatedRoute.fromLabel}</span>
                  <ArrowLeftRight size={12} className="text-[#0f3d2e] shrink-0" />
                  <span className="text-[#0f3d2e]">{calculatedRoute.toLabel}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-center">
                    <div className="text-[9px] uppercase text-stone-400 font-bold">Time</div>
                    <div className="text-[11px] font-black text-stone-800 mt-0.5 leading-tight">{calculatedRoute.duration}</div>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-center">
                    <div className="text-[9px] uppercase text-stone-400 font-bold">Distance</div>
                    <div className="text-[11px] font-black text-stone-800 mt-0.5">{calculatedRoute.totalDistance}</div>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                    <div className="text-[9px] uppercase text-emerald-600 font-bold">Road</div>
                    <div className="text-[10px] font-black text-emerald-800 mt-0.5 leading-tight truncate">✓ Open</div>
                  </div>
                </div>

                {/* Journey Legs */}
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-2">Step-by-step Journey</div>
                  <div className="space-y-2 relative before:absolute before:top-4 before:bottom-4 before:left-[14px] before:w-px before:bg-stone-200">
                    {calculatedRoute.legs.map((leg, i) => {
                      const Icon = getModeIcon(leg.mode);
                      return (
                        <div key={i} className="relative pl-9 p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-0.5 hover:border-stone-300 transition-colors">
                          <div className="absolute left-1.5 top-3 w-6 h-6 rounded-full bg-[#0f3d2e] border-2 border-white shadow-sm flex items-center justify-center">
                            <Icon size={11} className="text-emerald-300" />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-black uppercase tracking-wide text-stone-400">{leg.mode}</span>
                            <span className="text-[10px] font-bold text-[#0f3d2e]">{leg.cost}</span>
                          </div>
                          <div className="text-xs font-bold text-stone-800">{leg.title}</div>
                          <div className="text-[10px] text-stone-500">{leg.route}</div>
                          <div className="text-[10px] text-stone-400 font-medium">Duration: {leg.time}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Advisories */}
                {calculatedRoute.advisories?.length > 0 && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                      <Shield size={11} />
                      Safety Advisories
                    </div>
                    {calculatedRoute.advisories.map((adv, i) => (
                      <div key={i} className="flex items-start gap-2 text-[10px] text-amber-800 font-medium">
                        <AlertTriangle size={10} className="text-amber-500 shrink-0 mt-0.5" />
                        {adv}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        ) : (
          /* ── 5 Corridors Tab ── */
          <div className="p-4 space-y-4">
            <p className="text-xs text-stone-500 font-medium leading-relaxed">
              Tap any corridor to highlight its highway polyline and interchange points on the live GIS map:
            </p>

            {/* Schematic SVG Corridor Map */}
            <div className="bg-[#fdfbf7] rounded-2xl border border-stone-200 p-3 overflow-hidden">
              <div className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-2">
                Uttarakhand Corridor Map 2026
              </div>
              <svg viewBox="0 0 380 220" className="w-full h-auto" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {/* Background */}
                <rect width="380" height="220" fill="#fdfbf7" rx="8"/>
                {/* Corridor Lines */}
                <polyline points="30,170 90,140 150,120 210,105 270,90 330,75" fill="none" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="210,105 235,78 255,52 268,28" fill="none" stroke="#a855f7" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="100,188 160,172 220,157 285,142 342,128" fill="none" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="28,140 78,112 128,93 178,73 218,48" fill="none" stroke="#f97316" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="278,198 310,165 334,130 355,90 368,44" fill="none" stroke="#eab308" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>

                {/* Key Nodes */}
                <circle cx="30" cy="170" r="6" fill="white" stroke="#10b981" strokeWidth="2.5"/>
                <text x="30" y="185" fontSize="7" fontWeight="700" fill="#6b7280" textAnchor="middle">Rishikesh</text>

                <circle cx="210" cy="105" r="9" fill="white" stroke="#6d28d9" strokeWidth="2.5"/>
                <circle cx="210" cy="105" r="4" fill="#10b981"/>
                <text x="222" y="118" fontSize="7" fontWeight="800" fill="#6d28d9" textAnchor="start">Rudraprayag ⇄</text>

                <circle cx="330" cy="75" r="7" fill="#10b981" stroke="white" strokeWidth="2"/>
                <text x="330" y="63" fontSize="7" fontWeight="800" fill="#065f46" textAnchor="middle">Badrinath</text>

                <circle cx="268" cy="28" r="7" fill="#a855f7" stroke="white" strokeWidth="2"/>
                <text x="268" y="20" fontSize="6.5" fontWeight="800" fill="#7e22ce" textAnchor="middle">Kedarnath 3583m</text>

                <circle cx="100" cy="188" r="6" fill="white" stroke="#0284c7" strokeWidth="2.5"/>
                <text x="100" y="202" fontSize="7" fontWeight="700" fill="#0369a1" textAnchor="middle">Kathgodam</text>

                <circle cx="342" cy="128" r="7" fill="#0284c7" stroke="white" strokeWidth="2"/>
                <text x="342" y="116" fontSize="7" fontWeight="800" fill="#075985" textAnchor="middle">Munsiyari</text>

                <circle cx="28" cy="140" r="6" fill="white" stroke="#f97316" strokeWidth="2.5"/>
                <text x="28" y="128" fontSize="7" fontWeight="700" fill="#c2410c" textAnchor="middle">Dehradun</text>

                <circle cx="218" cy="48" r="7" fill="#f97316" stroke="white" strokeWidth="2"/>
                <text x="218" y="40" fontSize="7" fontWeight="800" fill="#c2410c" textAnchor="middle">Gangotri</text>

                <circle cx="368" cy="44" r="7" fill="#eab308" stroke="white" strokeWidth="2"/>
                <text x="362" y="36" fontSize="7" fontWeight="800" fill="#854d0e" textAnchor="end">Adi Kailash</text>

                {/* Legend */}
                <rect x="4" y="4" width="136" height="94" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1" opacity="0.96"/>
                <text x="12" y="18" fontSize="6.5" fontWeight="900" fill="#1c1917">HIMALAYAN CORRIDORS</text>
                <line x1="12" y1="28" x2="30" y2="28" stroke="#10b981" strokeWidth="3"/>
                <text x="35" y="32" fontSize="6.5" fontWeight="700" fill="#57534e">L1: Badrinath</text>
                <line x1="12" y1="43" x2="30" y2="43" stroke="#a855f7" strokeWidth="3"/>
                <text x="35" y="47" fontSize="6.5" fontWeight="700" fill="#57534e">L2: Kedarnath</text>
                <line x1="12" y1="58" x2="30" y2="58" stroke="#0284c7" strokeWidth="3"/>
                <text x="35" y="62" fontSize="6.5" fontWeight="700" fill="#57534e">L3: Kumaon</text>
                <line x1="12" y1="73" x2="30" y2="73" stroke="#f97316" strokeWidth="3"/>
                <text x="35" y="77" fontSize="6.5" fontWeight="700" fill="#57534e">L4: Glacier</text>
                <line x1="12" y1="88" x2="30" y2="88" stroke="#eab308" strokeWidth="3"/>
                <text x="35" y="92" fontSize="6.5" fontWeight="700" fill="#57534e">L5: Adi Kailash</text>
              </svg>
            </div>

            {/* Corridor Cards */}
            <div className="space-y-2">
              {Object.values(HIMALAYAN_CORRIDORS).map(line => {
                const isActive = activeCorridorId === line.id;
                return (
                  <div
                    key={line.id}
                    onClick={() => { const next = isActive ? null : line.id; onSelectCorridor(next); if (next && onFlyToCorridor) onFlyToCorridor(next); }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-emerald-50 border-[#0f3d2e]/40 ring-1 ring-[#0f3d2e]/20 shadow-sm'
                        : 'bg-white hover:bg-stone-50 border-stone-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: line.color }} />
                        <span className="text-xs font-black text-stone-900">{line.name}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">{line.code}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">{line.description}</p>
                    <div className="flex items-center gap-4 mt-2.5 pt-2.5 border-t border-stone-100 text-[10px] font-bold text-stone-400">
                      <span>⏱️ {line.duration}</span>
                      <span>🛣️ {line.totalKm}</span>
                      <span className={`ml-auto font-black ${isActive ? 'text-[#0f3d2e]' : 'text-stone-300 group-hover:text-stone-500'}`}>
                        {isActive ? '✓ Active on Map' : 'Tap to View →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-400 shrink-0">
        <span className="font-medium">Uttarakhand Highway & Pilgrimage GIS</span>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs cursor-pointer transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Leaflet Corridor Layer ───────────────────────────────────
export function HimalayanCorridorsLayer({ activeCorridorId }) {
  if (!activeCorridorId) return null;
  const corridor = HIMALAYAN_CORRIDORS[activeCorridorId];
  if (!corridor) return null;
  return (
    <>
      <Polyline
        positions={corridor.polyline}
        pathOptions={{ color: corridor.color, weight: 6, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
      >
        <Tooltip sticky>
          <div className="p-1 font-sans text-xs">
            <strong style={{ color: corridor.color }} className="block font-bold">{corridor.name} ({corridor.code})</strong>
            <span className="text-slate-700 block text-[11px]">{corridor.highway}</span>
            <span className="text-slate-500 block text-[10px] mt-0.5">⏱️ {corridor.duration} • 🛣️ {corridor.totalKm}</span>
          </div>
        </Tooltip>
      </Polyline>
      <Polyline
        positions={corridor.polyline}
        pathOptions={{ color: corridor.color, weight: 14, opacity: 0.15, lineCap: 'round', lineJoin: 'round' }}
      />
      {corridor.stations.map((st, idx) => (
        <CircleMarker
          key={`st-${idx}`}
          center={st.coords}
          radius={st.type === 'interchange' ? 8 : st.type === 'terminus' ? 9 : 6}
          pathOptions={{
            color: '#ffffff',
            weight: 2.5,
            fillColor: st.type === 'terminus' ? '#e11d48' : st.type === 'interchange' ? '#0f3d2e' : corridor.color,
            fillOpacity: 1,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <div className="p-1 font-sans text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: corridor.color }} />
                <strong className="text-slate-900 font-bold">{st.name}</strong>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">⛰️ {st.altitude} • <span className="uppercase font-semibold">{st.type}</span></div>
              <div className="text-[10px] text-emerald-800 font-medium mt-0.5">Modes: {st.modes.join(' • ')}</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
