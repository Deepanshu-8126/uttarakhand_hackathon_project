import React, { useState, useMemo } from 'react';
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
  X, 
  Layers, 
  Compass, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  PhoneCall,
  ExternalLink
} from 'lucide-react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';

// ─── 5 Himalayan Corridors & Highways (YoMetro Style) ───
export const HIMALAYAN_CORRIDORS = {
  badrinath: {
    id: 'badrinath',
    name: 'NH-07 Badrinath & Auli Line',
    code: 'L1',
    color: '#10b981', // Green Line
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
    polyline: [
      [30.0869, 78.2676],
      [30.1459, 78.5990],
      [30.2227, 78.7844],
      [30.2858, 78.9811],
      [30.2605, 79.2173],
      [30.4070, 79.3364],
      [30.5564, 79.5661],
      [30.6250, 79.5480],
      [30.7465, 79.4942],
    ]
  },
  kedarnath: {
    id: 'kedarnath',
    name: 'Mandakini Kedarnath Express Line',
    code: 'L2',
    color: '#a855f7', // Purple Line
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
      { name: 'Guptkashi Cultural Base', coords: [30.5228, 79.0772], type: 'junction', altitude: '1,319m', modes: ['Homestays', 'Helipad'] },
      { name: 'Phata Heliport Hub', coords: [30.5750, 79.0430], type: 'junction', altitude: '1,500m', modes: ['Direct Kedarnath Heli'] },
      { name: 'Sonprayag Transit Gate', coords: [30.6300, 78.9980], type: 'interchange', altitude: '1,829m', modes: ['UTC Bus Stop', 'Local Shuttle Jeep'] },
      { name: 'Gaurikund Trek Base', coords: [30.6540, 79.0250], type: 'junction', altitude: '1,982m', modes: ['16km Trek Start', 'Hot Spring'] },
      { name: 'Kedarnath Dham (3,583m)', coords: [30.7333, 79.0667], type: 'terminus', altitude: '3,583m', modes: ['High-Altitude Shrine', 'Camps'] },
    ],
    polyline: [
      [30.2858, 78.9811],
      [30.3950, 79.0230],
      [30.4900, 79.0600],
      [30.5228, 79.0772],
      [30.5750, 79.0430],
      [30.6300, 78.9980],
      [30.6540, 79.0250],
      [30.7333, 79.0667],
    ]
  },
  kumaon: {
    id: 'kumaon',
    name: 'Kumaon Lakes & Heights Line',
    code: 'L3',
    color: '#0284c7', // Blue Line
    badgeBg: 'bg-sky-500',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-300',
    lightBg: 'bg-sky-50',
    duration: '10 hrs scenic drive',
    totalKm: '280 km',
    highway: 'NH-109 / SH-37 Himalayan Vista Highway',
    description: 'Scenic gateway corridor connecting Kathgodam railhead with Nainital, Almora, and Munsiyari.',
    stations: [
      { name: 'Kathgodam Railhead', coords: [29.2730, 79.5390], type: 'interchange', altitude: '554m', modes: ['Train Hub', 'UTC Bus'] },
      { name: 'Bhimtal / Nainital Fork', coords: [29.3500, 79.5500], type: 'junction', altitude: '1,370m', modes: ['Lake Tourism', 'Shared Cab'] },
      { name: 'Bhowali Pine Junction', coords: [29.3800, 79.5200], type: 'station', altitude: '1,706m', modes: ['Fruit Market', 'Taxi'] },
      { name: 'Almora Cultural Hub', coords: [29.5971, 79.6591], type: 'junction', altitude: '1,638m', modes: ['Bal Mithai', 'Heritage TRH'] },
      { name: 'Kausani Sunrise Vista', coords: [29.8450, 79.5960], type: 'station', altitude: '1,890m', modes: ['Tea Gardens', 'Resorts'] },
      { name: 'Bageshwar Sangam', coords: [29.8400, 79.7700], type: 'junction', altitude: '1,004m', modes: ['Bagnath Temple', 'Maxx Taxi'] },
      { name: 'Chaukori Tea Estate', coords: [29.8700, 80.0200], type: 'station', altitude: '2,010m', modes: ['KMVN TRH', 'Nanda Devi View'] },
      { name: 'Thal Junction', coords: [29.8200, 80.1400], type: 'station', altitude: '1,200m', modes: ['Ramganga Bridge'] },
      { name: 'Munsiyari Panchachuli Base', coords: [30.0645, 80.2372], type: 'terminus', altitude: '2,200m', modes: ['Panchachuli Peaks', 'Milam Trek'] },
    ],
    polyline: [
      [29.2730, 79.5390],
      [29.3500, 79.5500],
      [29.3800, 79.5200],
      [29.5971, 79.6591],
      [29.8450, 79.5960],
      [29.8400, 79.7700],
      [29.8700, 80.0200],
      [29.8200, 80.1400],
      [30.0645, 80.2372],
    ]
  },
  glacier: {
    id: 'glacier',
    name: 'Yamunotri & Gangotri Glacier Line',
    code: 'L4',
    color: '#f97316', // Orange Line
    badgeBg: 'bg-amber-500',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
    lightBg: 'bg-amber-50',
    duration: '8-9 hrs road',
    totalKm: '260 km',
    highway: 'NH-34 Bhagirathi & Yamuna Highway',
    description: 'High glacier source corridor linking Dehradun to Mussoorie, Uttarkashi, and Gangotri/Yamunotri.',
    stations: [
      { name: 'Dehradun Capital Hub', coords: [30.3165, 78.0322], type: 'interchange', altitude: '640m', modes: ['Jolly Grant Airport', 'Train', 'ISBT'] },
      { name: 'Mussoorie Queen of Hills', coords: [30.4598, 78.0644], type: 'station', altitude: '2,005m', modes: ['Hill Station', 'Taxi'] },
      { name: 'Naugaon / Barkot Fork', coords: [30.8100, 78.2000], type: 'junction', altitude: '1,220m', modes: ['Yamunotri Base', 'Jeeps'] },
      { name: 'Janki Chatti Trek Base', coords: [30.9800, 78.4300], type: 'junction', altitude: '2,650m', modes: ['6km Trek', 'Pony Base'] },
      { name: 'Yamunotri Dham', coords: [31.0140, 78.4600], type: 'terminus', altitude: '3,291m', modes: ['Surya Kund', 'Shrine'] },
      { name: 'Uttarkashi Mountaineering Hub', coords: [30.7268, 78.4354], type: 'junction', altitude: '1,158m', modes: ['NIM Base', 'Bus Terminal'] },
      { name: 'Harsil Valley (Mini Switzerland)', coords: [31.0370, 78.7360], type: 'station', altitude: '2,620m', modes: ['Apple Orchards', 'Wooden Stays'] },
      { name: 'Gangotri Dham', coords: [30.9947, 78.9398], type: 'terminus', altitude: '3,100m', modes: ['Bhagirathi Origin', 'Gaumukh Trek Base'] },
    ],
    polyline: [
      [30.3165, 78.0322],
      [30.4598, 78.0644],
      [30.8100, 78.2000],
      [30.9800, 78.4300],
      [31.0140, 78.4600],
      [30.7268, 78.4354],
      [31.0370, 78.7360],
      [30.9947, 78.9398],
    ]
  },
  adikailash: {
    id: 'adikailash',
    name: 'Adi Kailash & Om Parvat Border Line',
    code: 'L5',
    color: '#eab308', // Gold Line
    badgeBg: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    lightBg: 'bg-yellow-50',
    duration: '14 hrs (Inner Line Permit Req.)',
    totalKm: '325 km',
    highway: 'BRO Kailash-Mansarovar Road',
    description: 'High-altitude Himalayan border frontier leading to Gunji village, Om Parvat and Adi Kailash.',
    stations: [
      { name: 'Tanakpur Railhead', coords: [29.0720, 80.1110], type: 'interchange', altitude: '255m', modes: ['Train', 'UTC Bus'] },
      { name: 'Champawat Cultural Stop', coords: [29.3300, 80.0900], type: 'station', altitude: '1,610m', modes: ['Golju Temple', 'Taxi'] },
      { name: 'Pithoragarh District Hub', coords: [29.5800, 80.2100], type: 'junction', altitude: '1,627m', modes: ['Naini Saini Airport', 'Maxx Cabs'] },
      { name: 'Dharchula (ILP Permit Checkpost)', coords: [29.8500, 80.5400], type: 'junction', altitude: '915m', modes: ['SDM Permit Office', '4x4 Jeeps'] },
      { name: 'Tawaghat River Confluence', coords: [29.9800, 80.6000], type: 'station', altitude: '1,100m', modes: ['Kali-Darma Sangam'] },
      { name: 'Budhi Darma Valley Base', coords: [30.1021, 80.8278], type: 'station', altitude: '2,740m', modes: ['KMVN Eco Camp'] },
      { name: 'Gunji Village (Adi Kailash Hub)', coords: [30.1800, 80.8500], type: 'junction', altitude: '3,200m', modes: ['Medical Acclimatization', 'Homestays'] },
      { name: 'Nabidang (Om Parvat Viewpoint)', coords: [30.2700, 80.9900], type: 'terminus', altitude: '4,246m', modes: ['Om Parvat Snow View'] },
      { name: 'Jolinkong (Adi Kailash Base)', coords: [30.3200, 80.7000], type: 'terminus', altitude: '4,497m', modes: ['Parvati Sarovar', 'Holy Peak'] },
    ],
    polyline: [
      [29.0720, 80.1110],
      [29.3300, 80.0900],
      [29.5800, 80.2100],
      [29.8500, 80.5400],
      [29.9800, 80.6000],
      [30.1021, 80.8278],
      [30.1800, 80.8500],
      [30.2700, 80.9900],
    ]
  }
};

// ─── Multi-Modal Route Catalog ───
export const TRANSIT_CATALOG = [
  {
    from: 'delhi',
    fromLabel: 'New Delhi (NCR)',
    to: 'kedarnath',
    toLabel: 'Kedarnath Dham (3,583m)',
    corridorId: 'kedarnath',
    duration: '14-16 hrs total',
    totalDistance: '450 km',
    roadStatus: 'NH-107 Open (Good Condition)',
    legs: [
      { mode: 'train', title: 'Leg 1: Train / Express Bus to Railhead', route: 'New Delhi ➔ Rishikesh / Haridwar', time: '4.5 hrs', cost: '₹280 (Sleeper) - ₹1,150 (Vande Bharat)' },
      { mode: 'bus', title: 'Leg 2: Mountain Highway Bus / Shared Maxx', route: 'Rishikesh ➔ Sonprayag via NH-107', time: '7.5 hrs', cost: '₹450 (UTC Bus) / ₹900 (Shared Cab)' },
      { mode: 'car', title: 'Leg 3: Local Shuttle Jeep', route: 'Sonprayag ➔ Gaurikund Base Gate', time: '20 mins', cost: '₹50 (Jeep Ticket)' },
      { mode: 'trek', title: 'Leg 4: Himalayan Mountain Trek / Heli', route: 'Gaurikund ➔ Kedarnath Temple (16 km)', time: '6-7 hrs Trek OR 8 mins Heli', cost: '₹0 (Trek) / ₹2,500 (Pony) / ₹4,900 (Heli)' }
    ],
    advisories: ['Sonprayag Biometric Registration required', 'AMS risk above 3,000m (carry Diamox)', 'Official Heli tickets via IRCTC HeliYatra']
  },
  {
    from: 'haridwar',
    fromLabel: 'Haridwar (Railhead)',
    to: 'badrinath',
    toLabel: 'Badrinath Dham & Mana Village',
    corridorId: 'badrinath',
    duration: '10 hrs road',
    totalDistance: '320 km',
    roadStatus: 'NH-07 All-Weather Road Clear',
    legs: [
      { mode: 'bus', title: 'Leg 1: Direct UTC Mountain Bus / Shared Maxx', route: 'Haridwar / Rishikesh ➔ Joshimath Base', time: '8.5 hrs', cost: '₹520 (UTC Bus) / ₹1,200 (Shared Cab)' },
      { mode: 'car', title: 'Leg 2: High Mountain Ascent', route: 'Joshimath ➔ Badrinath Temple (45 km)', time: '1.5 hrs', cost: '₹120 (Local Bus) / ₹250 (Shared Cab)' },
      { mode: 'trek', title: 'Leg 3: India\'s Last Village Excursion', route: 'Badrinath ➔ Mana Village & Saraswati River (3 km)', time: '15 mins', cost: '₹30 (E-Rickshaw)' }
    ],
    advisories: ['Night driving prohibited past Joshimath after 8:00 PM', 'NH-07 All-Weather Highway open 24x7']
  },
  {
    from: 'kathgodam',
    fromLabel: 'Kathgodam (Kumaon Railhead)',
    to: 'munsiyari',
    toLabel: 'Munsiyari (Panchachuli Base)',
    corridorId: 'kumaon',
    duration: '10 hrs scenic drive',
    totalDistance: '280 km',
    roadStatus: 'Kalamuni Pass Open',
    legs: [
      { mode: 'car', title: 'Leg 1: Kumaon Vista Drive', route: 'Kathgodam ➔ Almora ➔ Kausani', time: '4.5 hrs', cost: '₹350 (Shared Cab) / ₹2,200 (Private Taxi)' },
      { mode: 'bus', title: 'Leg 2: Ridge Highway', route: 'Kausani ➔ Bageshwar ➔ Chaukori ➔ Thal', time: '3.5 hrs', cost: '₹280 (Local Bus)' },
      { mode: 'car', title: 'Leg 3: Kalamuni Pass Ascent to Valley', route: 'Thal ➔ Kalamuni Top (2,700m) ➔ Munsiyari', time: '2 hrs', cost: '₹180 (Shared Maxx)' }
    ],
    advisories: ['Spectacular close-up views of Panchachuli Peaks', 'Carry snow chains in peak winter']
  },
  {
    from: 'dehradun',
    fromLabel: 'Dehradun (Airport/ISBT)',
    to: 'auli',
    toLabel: 'Auli Himalayan Ski Resort',
    corridorId: 'badrinath',
    duration: '8.5 hrs road + Cable Car',
    totalDistance: '290 km',
    roadStatus: 'Highway Clear',
    legs: [
      { mode: 'bus', title: 'Leg 1: Highway Drive', route: 'Dehradun ➔ Rishikesh ➔ Srinagar ➔ Joshimath', time: '8 hrs', cost: '₹480 (UTC Deluxe) / ₹1,100 (Shared Cab)' },
      { mode: 'car', title: 'Leg 2: Asia\'s Longest Ropeway', route: 'Joshimath ➔ Auli Top (Cable Car)', time: '22 mins', cost: '₹1,000 (Ropeway Roundtrip)' }
    ],
    advisories: ['Asia\'s highest artificial lake & Nanda Devi panoramic view']
  }
];

/**
 * Slide-Over Drawer: Himalayan Transit & Route Navigator (YoMetro Style)
 * Renders in a dedicated high-craft panel without squishing or shifting the map canvas!
 */
export default function TransitRouteDrawer({
  isOpen,
  onClose,
  activeCorridorId,
  onSelectCorridor,
  onFlyToCorridor
}) {
  const [fromLocation, setFromLocation] = useState('delhi');
  const [toLocation, setToLocation] = useState('kedarnath');
  const [selectedTab, setSelectedTab] = useState('route'); // 'route' | 'lines'

  const calculatedRoute = useMemo(() => {
    const match = TRANSIT_CATALOG.find(r => r.from === fromLocation && r.to === toLocation);
    if (match) return match;
    const fallback = TRANSIT_CATALOG.find(r => r.to === toLocation) || TRANSIT_CATALOG[0];
    return {
      ...fallback,
      from: fromLocation,
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
    <div className="fixed inset-y-0 right-0 z-[1100] w-full max-w-md sm:max-w-lg bg-white shadow-2xl border-l border-stone-200 flex flex-col font-sans text-stone-900 animate-in slide-in-from-right duration-300">
      
      {/* ── 1. Drawer Header ── */}
      <div className="p-4 bg-gradient-to-r from-[#0f3d2e] via-[#1a4331] to-[#123023] text-white flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
            <Navigation size={18} className="text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black tracking-tight">Himalayan Transit Navigator</h3>
              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full font-black bg-emerald-400 text-[#0f3d2e]">
                YoMetro
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 font-normal">
              From & To mountain route finder, fares, & corridors
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          aria-label="Close Drawer"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── 2. Top Tabs (Find Route vs Metro Lines) ── */}
      <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-2 gap-2 text-xs font-bold shrink-0">
        <button
          type="button"
          onClick={() => setSelectedTab('route')}
          className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
            selectedTab === 'route'
              ? 'border-[#0f3d2e] text-[#0f3d2e]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          🚇 Route Finder
        </button>
        <button
          type="button"
          onClick={() => setSelectedTab('lines')}
          className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
            selectedTab === 'lines'
              ? 'border-[#0f3d2e] text-[#0f3d2e]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          🗺️ 5 Mountain Lines
        </button>
      </div>

      {/* ── 3. Drawer Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {selectedTab === 'route' ? (
          <>
            {/* YoMetro Style Search Card */}
            <div className="p-4 bg-[#fdfbf7] rounded-2xl border border-stone-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  Select Origin & Destination
                </span>
                <span className="text-[10px] text-stone-500 font-medium">Step-by-step circuit</span>
              </div>

              {/* From Select */}
              <div className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center gap-2 shadow-2xs">
                <Train size={16} className="text-emerald-700 shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-[9px] font-bold uppercase text-stone-400 block leading-none">From Station</label>
                  <select
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-stone-800 focus:outline-hidden cursor-pointer"
                  >
                    <option value="delhi">New Delhi / NCR (Air / Train Hub)</option>
                    <option value="haridwar">Haridwar (Garhwal Railhead)</option>
                    <option value="rishikesh">Rishikesh Yog Nagari (Gateway)</option>
                    <option value="dehradun">Dehradun (Airport / ISBT)</option>
                    <option value="kathgodam">Kathgodam (Kumaon Railhead)</option>
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="p-1.5 rounded-full bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-800 flex items-center justify-center transition border border-stone-200 shadow-2xs cursor-pointer"
                  title="Swap Origin & Destination"
                >
                  <ArrowLeftRight size={13} />
                </button>
              </div>

              {/* To Select */}
              <div className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center gap-2 shadow-2xs">
                <Mountain size={16} className="text-emerald-700 shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-[9px] font-bold uppercase text-stone-400 block leading-none">To Mountain Destination</label>
                  <select
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-stone-800 focus:outline-hidden cursor-pointer"
                  >
                    <option value="kedarnath">Kedarnath Dham (3,583m)</option>
                    <option value="badrinath">Badrinath Dham & Mana</option>
                    <option value="auli">Auli Himalayan Ski Resort</option>
                    <option value="munsiyari">Munsiyari (Panchachuli Base)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Metrics Banner */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Estimated Travel Time</div>
                <div className="text-sm font-black text-[#0f3d2e] mt-0.5">⏱️ {calculatedRoute.duration}</div>
              </div>
              <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
                <div className="text-[10px] font-bold text-stone-500 uppercase">Total Road Distance</div>
                <div className="text-sm font-black text-stone-800 mt-0.5">🛣️ {calculatedRoute.totalDistance}</div>
              </div>
            </div>

            {/* Step-by-Step Multi-Modal Legs */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-500">
                Multi-Modal Journey Legs
              </h4>

              <div className="space-y-2 relative before:absolute before:top-3 before:bottom-3 before:left-3.5 before:w-0.5 before:bg-emerald-200">
                {calculatedRoute.legs.map((leg, i) => (
                  <div key={i} className="relative pl-8 p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs space-y-1">
                    <div className="absolute left-2 top-3.5 w-3 h-3 rounded-full bg-[#0f3d2e] border-2 border-white ring-1 ring-emerald-300 flex items-center justify-center text-[7px] text-white font-bold">
                      {i + 1}
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-stone-900">{leg.title}</span>
                      <span className="text-emerald-700 text-[11px]">{leg.cost}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-emerald-800">{leg.route}</p>
                    <div className="text-[10px] text-stone-400 font-medium">Duration: {leg.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlight on Map Button */}
            <button
              type="button"
              onClick={() => handleShowOnMap(calculatedRoute.corridorId)}
              className="w-full py-2.5 rounded-xl bg-[#0f3d2e] hover:bg-[#185340] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Compass size={14} />
              <span>Show Corridor & Stations on Map</span>
            </button>

            {/* Travel Helpline & Timings */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1 text-stone-600">
              <div className="flex items-center gap-2 font-bold text-stone-800">
                <Clock size={13} className="text-emerald-700" />
                <span>Mountain Timings: 04:30 AM – 08:30 PM (Night Travel Restricted)</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-stone-800">
                <PhoneCall size={13} className="text-emerald-700" />
                <span>Disaster / Highway Helpline: 1070 / 112</span>
              </div>
            </div>
          </>
        ) : (
          /* 5 Mountain Lines Overview */
          <div className="space-y-3">
            <p className="text-xs text-stone-500 font-medium">
              Click any mountain corridor to highlight its highway polyline and interchange stations on the live GIS map:
            </p>

            {Object.values(HIMALAYAN_CORRIDORS).map((line) => {
              const isActive = activeCorridorId === line.id;
              return (
                <div
                  key={line.id}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? `${line.lightBg} ${line.borderColor} ring-2 ring-emerald-500/40 shadow-sm`
                      : 'bg-white hover:bg-stone-50 border-stone-200 shadow-2xs'
                  }`}
                  onClick={() => {
                    const next = isActive ? null : line.id;
                    onSelectCorridor(next);
                    if (next && onFlyToCorridor) onFlyToCorridor(next);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${line.badgeBg} shrink-0`} />
                      <h4 className="text-xs font-black text-stone-900">{line.name}</h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                      {line.code}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 mt-1 font-medium">{line.description}</p>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-[10px] font-bold text-stone-500">
                    <span>⏱️ {line.duration}</span>
                    <span>🛣️ {line.totalKm}</span>
                    <span className="text-emerald-700 font-bold">
                      {isActive ? '✓ Active on Map' : 'Click to View'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── 4. Drawer Footer ── */}
      <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
        <span>Uttarakhand Char Dham & Kumaon Transit GIS</span>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs cursor-pointer"
        >
          Close
        </button>
      </div>

    </div>
  );
}

// ─── Leaflet Corridors & Stations Map Layers Component ───
export function HimalayanCorridorsLayer({ activeCorridorId }) {
  if (!activeCorridorId) return null;

  const corridor = HIMALAYAN_CORRIDORS[activeCorridorId];
  if (!corridor) return null;

  return (
    <>
      <Polyline
        positions={corridor.polyline}
        pathOptions={{
          color: corridor.color,
          weight: 6,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      >
        <Tooltip sticky>
          <div className="p-1 font-sans text-xs">
            <strong style={{ color: corridor.color }} className="block font-bold">
              {corridor.name} ({corridor.code})
            </strong>
            <span className="text-slate-700 block text-[11px]">{corridor.highway}</span>
            <span className="text-slate-500 block text-[10px] mt-0.5">⏱️ {corridor.duration} • 🛣️ {corridor.totalKm}</span>
          </div>
        </Tooltip>
      </Polyline>

      <Polyline
        positions={corridor.polyline}
        pathOptions={{
          color: corridor.color,
          weight: 12,
          opacity: 0.25,
          lineCap: 'round',
          lineJoin: 'round',
        }}
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
              <div className="text-[10px] text-slate-500 mt-0.5">
                ⛰️ Altitude: <strong>{st.altitude}</strong> • Type: <span className="uppercase font-semibold">{st.type}</span>
              </div>
              <div className="text-[10px] text-emerald-800 font-medium mt-0.5">
                Modes: {st.modes.join(' • ')}
              </div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
