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
} from 'lucide-react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';

// ─── 5 Himalayan Corridors & Highways ────────────────────────
export const HIMALAYAN_CORRIDORS = {
  badrinath: {
    id: 'badrinath',
    name: 'NH-07 Badrinath & Auli Line',
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
    name: 'Mandakini Kedarnath Express Line',
    code: 'L2',
    color: '#a855f7',
    badgeBg: 'bg-purple-500',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    lightBg: 'bg-purple-50',
    duration: '7 hrs road + 6 hrs trek / 8m heli',
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
    name: 'Kumaon Lakes & Heights Line',
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
      { name: 'Bhowali Pine Junction', coords: [29.3910, 79.5420], type: 'station', altitude: '1,706m', modes: ['Shared Cab', 'Fruit Market'] },
      { name: 'Almora Cultural Hub', coords: [29.5971, 79.6591], type: 'junction', altitude: '1,638m', modes: ['District HQ', 'Taxi'] },
      { name: 'Kausani Sunrise Vista', coords: [29.8390, 79.5970], type: 'station', altitude: '1,890m', modes: ['Bus', 'Hotel Stays'] },
      { name: 'Bageshwar Sangam', coords: [29.8380, 79.7720], type: 'station', altitude: '960m', modes: ['Bus', 'Shared Maxx'] },
      { name: 'Chaukori Tea Estate', coords: [29.8960, 80.2270], type: 'station', altitude: '2,010m', modes: ['Tea Estate Stay'] },
      { name: 'Thal Junction', coords: [29.9630, 80.3750], type: 'junction', altitude: '895m', modes: ['Shared Maxx', 'Local Bus'] },
      { name: 'Munsiyari Panchachuli', coords: [30.0670, 80.2390], type: 'terminus', altitude: '2,200m', modes: ['Trekking Base'] },
    ],
    polyline: [[29.2182, 79.5267],[29.3437, 79.5677],[29.3910, 79.5420],[29.5971, 79.6591],[29.8390, 79.5970],[29.8380, 79.7720],[29.8960, 80.2270],[29.9630, 80.3750],[30.0670, 80.2390]]
  },
  glacier: {
    id: 'glacier',
    name: 'Yamunotri & Gangotri Glacier Line',
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
      { name: 'Barkot/Naugaon Fork', coords: [30.7230, 78.1560], type: 'junction', altitude: '1,420m', modes: ['Yamunotri Fork'] },
      { name: 'Janki Chatti Base', coords: [30.9730, 78.2500], type: 'station', altitude: '2,650m', modes: ['Trek Base'] },
      { name: 'Yamunotri Dham', coords: [31.0140, 78.4600], type: 'terminus', altitude: '3,293m', modes: ['Shrine Trek'] },
      { name: 'Uttarkashi Mountaineering', coords: [30.7248, 78.4464], type: 'junction', altitude: '1,165m', modes: ['Mountaineering Base'] },
      { name: 'Harsil Apple Valley', coords: [31.1400, 78.7200], type: 'station', altitude: '2,620m', modes: ['Taxi', 'GMVN'] },
      { name: 'Gangotri Glacier Source', coords: [30.9940, 79.0706], type: 'terminus', altitude: '3,048m', modes: ['Shrine Entry'] },
    ],
    polyline: [[30.3165, 78.0322],[30.4539, 78.0644],[30.7230, 78.1560],[30.9730, 78.2500],[31.0140, 78.4600],[30.7248, 78.4464],[31.1400, 78.7200],[30.9940, 79.0706]]
  },
  adikailash: {
    id: 'adikailash',
    name: 'Adi Kailash & Om Parvat Border Line',
    code: 'L5',
    color: '#eab308',
    badgeBg: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    lightBg: 'bg-yellow-50',
    duration: '14 hrs (Inner Line Permit Req.)',
    totalKm: '325 km',
    highway: 'NH-9 Pithoragarh Corridor (ILP Zone)',
    description: 'Remote Himalayan kailash border zone requiring Inner Line Permit via Dharchula.',
    stations: [
      { name: 'Tanakpur Railhead', coords: [29.0700, 80.1100], type: 'interchange', altitude: '280m', modes: ['Train', 'Bus'] },
      { name: 'Champawat Stop', coords: [29.3310, 80.0860], type: 'station', altitude: '1,615m', modes: ['Bus'] },
      { name: 'Pithoragarh District Hub', coords: [29.5820, 80.2180], type: 'junction', altitude: '1,814m', modes: ['ILP Permit Office', 'Taxi'] },
      { name: 'Dharchula ILP Checkpost', coords: [29.8570, 80.5280], type: 'junction', altitude: '915m', modes: ['ILP Check', 'Jeep'] },
      { name: 'Tawaghat River Confluence', coords: [29.9400, 80.6400], type: 'station', altitude: '1,020m', modes: ['Jeep', '4x4'] },
      { name: 'Budhi Darma Valley', coords: [30.0700, 80.7900], type: 'station', altitude: '2,400m', modes: ['Jeep Track'] },
      { name: 'Gunji Adi Kailash Jnc', coords: [30.2700, 80.9900], type: 'interchange', altitude: '3,050m', modes: ['Trek Base'] },
    ],
    polyline: [[29.0700, 80.1100],[29.3310, 80.0860],[29.5820, 80.2180],[29.8570, 80.5280],[29.9400, 80.6400],[30.0700, 80.7900],[30.2700, 80.9900]]
  }
};

// ─── Multi-Modal Route Catalog ────────────────────────────────
export const TRANSIT_CATALOG = [
  {
    from: 'delhi', fromLabel: 'New Delhi (NCR)',
    to: 'kedarnath', toLabel: 'Kedarnath Dham (3,583m)',
    corridorId: 'kedarnath', duration: '14-16 hrs total', totalDistance: '450 km',
    roadStatus: 'NH-107 Open',
    legs: [
      { mode: 'TRAIN', title: 'Leg 1: Express Train to Railhead', route: 'New Delhi → Rishikesh / Haridwar', time: '4.5 hrs', cost: '₹280 (Sleeper) / ₹1,150 (Vande Bharat)' },
      { mode: 'MOUNTAIN BUS', title: 'Leg 2: Highway Bus / Shared Maxx', route: 'Rishikesh → Sonprayag via NH-107', time: '7.5 hrs', cost: '₹450 (UTC Bus) / ₹900 (Cab)' },
      { mode: 'SHUTTLE', title: 'Leg 3: Local Shuttle Jeep', route: 'Sonprayag → Gaurikund Base Gate', time: '20 mins', cost: '₹50' },
      { mode: 'TREK / HELI', title: 'Leg 4: Himalayan Trek or Helicopter', route: 'Gaurikund → Kedarnath (16 km)', time: '6-7 hrs Trek OR 8 mins Heli', cost: '₹0 (Trek) / ₹4,900 (Heli)' }
    ],
    advisories: ['Sonprayag Biometric Registration required', 'AMS risk above 3,000m — carry Diamox', 'Official Heli tickets via IRCTC HeliYatra only']
  },
  {
    from: 'haridwar', fromLabel: 'Haridwar (Railhead)',
    to: 'badrinath', toLabel: 'Badrinath Dham & Mana Village',
    corridorId: 'badrinath', duration: '10 hrs road', totalDistance: '320 km',
    roadStatus: 'NH-07 All-Weather Road Clear',
    legs: [
      { mode: 'MOUNTAIN BUS', title: 'Leg 1: Direct UTC Bus / Shared Maxx', route: 'Haridwar / Rishikesh → Joshimath Base', time: '8.5 hrs', cost: '₹520 (UTC Bus) / ₹1,200 (Cab)' },
      { mode: 'LOCAL BUS', title: 'Leg 2: High Mountain Ascent', route: 'Joshimath → Badrinath Temple (45 km)', time: '1.5 hrs', cost: '₹120 (Local Bus) / ₹250 (Cab)' },
      { mode: 'WALK', title: 'Leg 3: India\'s Last Village Walk', route: 'Badrinath → Mana Village & Saraswati River', time: '15 mins', cost: '₹30 (E-Rickshaw)' }
    ],
    advisories: ['Night driving prohibited past Joshimath after 8:00 PM', 'NH-07 All-Weather Highway open 24x7']
  },
  {
    from: 'kathgodam', fromLabel: 'Kathgodam (Kumaon Railhead)',
    to: 'munsiyari', toLabel: 'Munsiyari (Panchachuli Base)',
    corridorId: 'kumaon', duration: '10 hrs scenic', totalDistance: '280 km',
    roadStatus: 'Kalamuni Pass Open',
    legs: [
      { mode: 'SHARED CAB', title: 'Leg 1: Kumaon Vista Drive', route: 'Kathgodam → Almora → Kausani', time: '4.5 hrs', cost: '₹350 (Shared Cab) / ₹2,200 (Private)' },
      { mode: 'BUS', title: 'Leg 2: Ridge Highway', route: 'Kausani → Bageshwar → Chaukori → Thal', time: '3.5 hrs', cost: '₹280 (Local Bus)' },
      { mode: 'MOUNTAIN PASS', title: 'Leg 3: Kalamuni Pass Crossing (2,700m)', route: 'Thal → Kalamuni Top → Munsiyari', time: '2 hrs', cost: '₹180 (Shared Maxx)' }
    ],
    advisories: ['Spectacular close-up view of Panchachuli Peaks', 'Carry snow chains in peak winter (Nov–Mar)']
  },
  {
    from: 'dehradun', fromLabel: 'Dehradun (Airport/ISBT)',
    to: 'auli', toLabel: 'Auli Himalayan Ski Resort',
    corridorId: 'badrinath', duration: '8.5 hrs + Cable Car', totalDistance: '290 km',
    roadStatus: 'NH-07 Clear',
    legs: [
      { mode: 'UTC DELUXE', title: 'Leg 1: Capital to Joshimath Drive', route: 'Dehradun → Rishikesh → Srinagar → Joshimath', time: '8 hrs', cost: '₹480 (UTC Deluxe) / ₹1,100 (Cab)' },
      { mode: 'ROPEWAY', title: 'Leg 2: Asia\'s Longest Aerial Ropeway', route: 'Joshimath → Auli Top (2,800m)', time: '22 mins', cost: '₹1,000 (Roundtrip)' }
    ],
    advisories: ['Ski Season: January – March', '4x4 with snow chains required in heavy winter snowfall']
  }
];

/**
 * TransitRouteDrawer — YoMetro style slide-over panel inside /map
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[1100] w-full max-w-[420px] bg-[#0b132b] shadow-2xl border-l border-slate-700/60 flex flex-col font-sans text-slate-100 animate-in slide-in-from-right duration-300">

      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#1c2541] to-[#0b132b] border-b border-slate-700/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <Navigation size={18} className="text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight text-white">Himalayan Transit Navigator</h3>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full font-black bg-emerald-400 text-[#0f3d2e]">YoMetro</span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">Route finder • Fares • Corridors</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer">
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/60 bg-[#111827] px-4 pt-2 gap-1 shrink-0">
        {[{ key: 'route', label: '🚇 Route Finder' }, { key: 'lines', label: '🗺️ 5 Mountain Lines' }].map(tab => (
          <button key={tab.key} type="button" onClick={() => setSelectedTab(tab.key)}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${selectedTab === tab.key ? 'border-purple-500 text-purple-300' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {selectedTab === 'route' ? (
          <div className="p-4 space-y-4">

            {/* === WHITE YOMETRO SEARCH CARD === */}
            <div className="bg-white text-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200">
              {/* Card Header */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Navigation size={14} className="text-purple-700 rotate-45" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-900">FIND A HIMALAYAN ROUTE</span>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Live 2026 GIS</span>
              </div>
              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* FROM */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">FROM STATION / ORIGIN HUB</label>
                  <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 px-3 py-2.5 gap-2">
                    <MapPin size={15} className="text-purple-600 shrink-0" />
                    <select value={fromLocation} onChange={e => setFromLocation(e.target.value)}
                      className="w-full bg-transparent font-bold text-xs text-slate-800 focus:outline-none cursor-pointer">
                      <option value="delhi">New Delhi / NCR (Air &amp; Railhead Gateway)</option>
                      <option value="haridwar">Haridwar Railhead (Garhwal Entry)</option>
                      <option value="rishikesh">Rishikesh Yog Nagari (Char Dham Terminal)</option>
                      <option value="dehradun">Dehradun Airport &amp; ISBT</option>
                      <option value="kathgodam">Kathgodam Railhead (Kumaon Entry)</option>
                    </select>
                  </div>
                </div>
                {/* Swap */}
                <div className="flex justify-end pr-1 -my-1 relative z-10">
                  <button type="button" onClick={handleSwap}
                    className="w-8 h-8 rounded-full bg-white hover:bg-purple-50 text-purple-700 border border-slate-200 shadow-md flex items-center justify-center transition cursor-pointer hover:rotate-180 duration-300">
                    <ArrowLeftRight size={13} className="rotate-90" />
                  </button>
                </div>
                {/* TO */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">TO MOUNTAIN DESTINATION / SHRINE</label>
                  <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 px-3 py-2.5 gap-2">
                    <Mountain size={15} className="text-purple-600 shrink-0" />
                    <select value={toLocation} onChange={e => setToLocation(e.target.value)}
                      className="w-full bg-transparent font-bold text-xs text-slate-800 focus:outline-none cursor-pointer">
                      <option value="kedarnath">Kedarnath Dham (3,583m • High Altitude Shrine)</option>
                      <option value="badrinath">Badrinath Dham &amp; Mana Village</option>
                      <option value="auli">Auli Himalayan Ski Resort &amp; Ropeway</option>
                      <option value="munsiyari">Munsiyari (Panchachuli Snow Peaks Base)</option>
                    </select>
                  </div>
                </div>
                {/* Purple CTA */}
                <button type="button" onClick={() => handleShowOnMap(calculatedRoute.corridorId)}
                  className="w-full py-3 rounded-xl bg-[#5d4da8] hover:bg-[#4d3d98] active:scale-[0.99] text-white font-extrabold text-sm shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer">
                  <span>Find Route</span>
                  <ChevronRight size={16} strokeWidth={3} />
                </button>
              </div>
              {/* Card Footer: timings & helpline */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-col gap-1.5 text-[11px] text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-purple-600 shrink-0" />
                  <span>Mountain Timings: <strong>04:30 AM / 08:30 PM</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall size={13} className="text-purple-600 shrink-0" />
                  <span>Helpline: <strong>1070 (Disaster) / 112</strong></span>
                </div>
              </div>
            </div>

            {/* === ROUTE RESULT === */}
            <div className="bg-[#1c2541] rounded-2xl border border-slate-700 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">OPTIMAL MULTI-MODAL ROUTE</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {(calculatedRoute.corridorId || '').toUpperCase()}
                </span>
              </div>
              <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                <span className="text-slate-300">{calculatedRoute.fromLabel}</span>
                <ArrowLeftRight size={12} className="text-purple-400 shrink-0" />
                <span className="text-emerald-300">{calculatedRoute.toLabel}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-[#0b132b] rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Est. Time</div>
                  <div className="text-xs font-black text-white mt-0.5">⏱️ {calculatedRoute.duration}</div>
                </div>
                <div className="p-2.5 bg-[#0b132b] rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Distance</div>
                  <div className="text-xs font-black text-white mt-0.5">🛣️ {calculatedRoute.totalDistance}</div>
                </div>
              </div>
              {/* Legs */}
              <div className="space-y-2 relative before:absolute before:top-4 before:bottom-4 before:left-3.5 before:w-0.5 before:bg-purple-500/30">
                {calculatedRoute.legs.map((leg, i) => (
                  <div key={i} className="relative pl-8 p-3 bg-[#0b132b] rounded-xl border border-slate-800 space-y-0.5">
                    <div className="absolute left-2 top-3.5 w-3.5 h-3.5 rounded-full bg-purple-600 border-2 border-[#0b132b] text-white flex items-center justify-center text-[8px] font-bold">{i + 1}</div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-purple-300">{leg.mode}</span>
                      <span className="text-[10px] font-mono text-emerald-400">{leg.cost}</span>
                    </div>
                    <div className="text-xs font-bold text-white">{leg.title}</div>
                    <div className="text-[11px] text-slate-400">{leg.route} • {leg.time}</div>
                  </div>
                ))}
              </div>
              {/* Show on map */}
              <button type="button" onClick={() => handleShowOnMap(calculatedRoute.corridorId)}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer">
                <Compass size={13} />
                <span>Show Corridor on Live Map</span>
              </button>
              {/* Advisories */}
              {calculatedRoute.advisories?.length > 0 && (
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 space-y-1">
                  {calculatedRoute.advisories.map((adv, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px] text-amber-200 font-medium">
                      <AlertTriangle size={11} className="text-amber-400 shrink-0 mt-0.5" />
                      {adv}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        ) : (
          /* === 5 MOUNTAIN LINES TAB === */
          <div className="p-4 space-y-4">
            <p className="text-xs text-slate-400 font-medium">Tap any corridor to highlight its highway route &amp; stations on the live GIS map:</p>

            {/* Schematic SVG Diagram */}
            <div className="bg-[#111827] rounded-2xl border border-slate-700 p-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Official Himalayan Transit Lines 2026</div>
              <svg viewBox="0 0 380 220" className="w-full h-auto" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {/* Lines */}
                <polyline points="30,170 90,140 150,120 210,105 270,90 330,75" fill="none" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="210,105 230,80 250,55 265,30" fill="none" stroke="#a855f7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="100,185 160,170 220,155 280,140 340,125" fill="none" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="30,140 80,115 130,95 180,75 220,50" fill="none" stroke="#f97316" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="280,195 310,165 335,130 355,90 365,45" fill="none" stroke="#eab308" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Nodes */}
                <circle cx="30" cy="170" r="7" fill="white" stroke="#10b981" strokeWidth="3"/>
                <text x="30" y="185" fontSize="7.5" fontWeight="700" fill="#94a3b8" textAnchor="middle">Rishikesh</text>
                <circle cx="210" cy="105" r="9" fill="white" stroke="#5d4da8" strokeWidth="3"/>
                <circle cx="210" cy="105" r="4" fill="#10b981"/>
                <text x="210" y="120" fontSize="7.5" fontWeight="800" fill="#c4b5fd" textAnchor="middle">Rudraprayag ⇄</text>
                <circle cx="330" cy="75" r="8" fill="#10b981" stroke="white" strokeWidth="2.5"/>
                <text x="330" y="63" fontSize="7.5" fontWeight="800" fill="#6ee7b7" textAnchor="middle">Badrinath</text>
                <circle cx="265" cy="30" r="8" fill="#a855f7" stroke="white" strokeWidth="2.5"/>
                <text x="265" y="22" fontSize="7.5" fontWeight="800" fill="#d8b4fe" textAnchor="middle">Kedarnath 3583m</text>
                <circle cx="100" cy="185" r="7" fill="white" stroke="#0284c7" strokeWidth="3"/>
                <text x="100" y="200" fontSize="7.5" fontWeight="700" fill="#7dd3fc" textAnchor="middle">Kathgodam</text>
                <circle cx="340" cy="125" r="8" fill="#0284c7" stroke="white" strokeWidth="2.5"/>
                <text x="340" y="113" fontSize="7.5" fontWeight="800" fill="#7dd3fc" textAnchor="middle">Munsiyari</text>
                <circle cx="30" cy="140" r="7" fill="white" stroke="#f97316" strokeWidth="3"/>
                <text x="30" y="130" fontSize="7.5" fontWeight="700" fill="#fdba74" textAnchor="middle">Dehradun</text>
                <circle cx="220" cy="50" r="8" fill="#f97316" stroke="white" strokeWidth="2.5"/>
                <text x="220" y="42" fontSize="7.5" fontWeight="800" fill="#fdba74" textAnchor="middle">Gangotri</text>
                <circle cx="365" cy="45" r="8" fill="#eab308" stroke="white" strokeWidth="2.5"/>
                <text x="365" y="37" fontSize="7.5" fontWeight="800" fill="#fef08a" textAnchor="middle">Adi Kailash</text>
                {/* Legend Box */}
                <rect x="4" y="4" width="132" height="90" rx="7" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
                <text x="12" y="17" fontSize="7" fontWeight="900" fill="#f1f5f9">HIMALAYAN TRANSIT LINES</text>
                <line x1="12" y1="27" x2="30" y2="27" stroke="#10b981" strokeWidth="3"/>
                <text x="35" y="31" fontSize="7" fontWeight="600" fill="#cbd5e1">L1: Badrinath Line</text>
                <line x1="12" y1="42" x2="30" y2="42" stroke="#a855f7" strokeWidth="3"/>
                <text x="35" y="46" fontSize="7" fontWeight="600" fill="#cbd5e1">L2: Kedarnath Line</text>
                <line x1="12" y1="57" x2="30" y2="57" stroke="#0284c7" strokeWidth="3"/>
                <text x="35" y="61" fontSize="7" fontWeight="600" fill="#cbd5e1">L3: Kumaon Line</text>
                <line x1="12" y1="72" x2="30" y2="72" stroke="#f97316" strokeWidth="3"/>
                <text x="35" y="76" fontSize="7" fontWeight="600" fill="#cbd5e1">L4: Glacier Line</text>
                <line x1="12" y1="87" x2="30" y2="87" stroke="#eab308" strokeWidth="3"/>
                <text x="35" y="91" fontSize="7" fontWeight="600" fill="#cbd5e1">L5: Adi Kailash Line</text>
              </svg>
            </div>

            {/* Corridor Cards */}
            <div className="space-y-2.5">
              {Object.values(HIMALAYAN_CORRIDORS).map(line => {
                const isActive = activeCorridorId === line.id;
                return (
                  <div key={line.id}
                    onClick={() => { const next = isActive ? null : line.id; onSelectCorridor(next); if (next && onFlyToCorridor) onFlyToCorridor(next); }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${isActive ? 'bg-slate-700/60 border-purple-500/60 ring-1 ring-purple-500/30' : 'bg-[#1c2541] hover:bg-[#212d47] border-slate-700'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: line.color }} />
                        <span className="text-xs font-black text-white">{line.name}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{line.code}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{line.description}</p>
                    <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-700 text-[10px] font-bold text-slate-500">
                      <span>⏱️ {line.duration}</span>
                      <span>🛣️ {line.totalKm}</span>
                      <span className={isActive ? 'text-emerald-400' : 'text-purple-400'}>{isActive ? '✓ Active on Map' : 'Tap to View'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-[#111827] border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <span>Uttarakhand Char Dham &amp; Kumaon Transit GIS</span>
        <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs cursor-pointer">Close</button>
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
      <Polyline positions={corridor.polyline} pathOptions={{ color: corridor.color, weight: 6, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}>
        <Tooltip sticky>
          <div className="p-1 font-sans text-xs">
            <strong style={{ color: corridor.color }} className="block font-bold">{corridor.name} ({corridor.code})</strong>
            <span className="text-slate-700 block text-[11px]">{corridor.highway}</span>
            <span className="text-slate-500 block text-[10px] mt-0.5">⏱️ {corridor.duration} • 🛣️ {corridor.totalKm}</span>
          </div>
        </Tooltip>
      </Polyline>
      <Polyline positions={corridor.polyline} pathOptions={{ color: corridor.color, weight: 12, opacity: 0.2, lineCap: 'round', lineJoin: 'round' }} />
      {corridor.stations.map((st, idx) => (
        <CircleMarker key={`st-${idx}`} center={st.coords}
          radius={st.type === 'interchange' ? 8 : st.type === 'terminus' ? 9 : 6}
          pathOptions={{ color: '#ffffff', weight: 2.5, fillColor: st.type === 'terminus' ? '#e11d48' : st.type === 'interchange' ? '#0f3d2e' : corridor.color, fillOpacity: 1 }}>
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
