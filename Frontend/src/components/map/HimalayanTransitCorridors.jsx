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
  Sparkles
} from 'lucide-react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';

// ─── 5 Himalayan Pilgrimage & Transit Corridors (YoMetro Style) ───
export const HIMALAYAN_CORRIDORS = {
  badrinath: {
    id: 'badrinath',
    name: 'NH-07 Badrinath & Auli Corridor',
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

// ─── Preset Multi-Modal Transit Routes ───
export const TRANSIT_CATALOG = [
  {
    from: 'delhi',
    fromLabel: 'New Delhi (NCR)',
    to: 'kedarnath',
    toLabel: 'Kedarnath Dham (3,583m)',
    corridorId: 'kedarnath',
    duration: '14-16 hrs total',
    totalDistance: '450 km',
    roadStatus: 'NH-107 Open',
    legs: [
      { mode: 'train', title: 'Leg 1: Train to Railhead', route: 'New Delhi ➔ Rishikesh / Haridwar', time: '4.5 hrs', cost: '₹280 - ₹1,150' },
      { mode: 'bus', title: 'Leg 2: Mountain Highway Bus', route: 'Rishikesh ➔ Sonprayag via NH-107', time: '7.5 hrs', cost: '₹450 (UTC) / ₹900 (Cab)' },
      { mode: 'car', title: 'Leg 3: Shuttle Jeep', route: 'Sonprayag ➔ Gaurikund Gate', time: '20 mins', cost: '₹50' },
      { mode: 'trek', title: 'Leg 4: Mountain Trek / Heli', route: 'Gaurikund ➔ Kedarnath (16 km)', time: '6-7 hrs / 8m Heli', cost: '₹0 / ₹4,900 Heli' }
    ],
  },
  {
    from: 'haridwar',
    fromLabel: 'Haridwar (Railhead)',
    to: 'badrinath',
    toLabel: 'Badrinath Dham & Mana',
    corridorId: 'badrinath',
    duration: '10 hrs road',
    totalDistance: '320 km',
    roadStatus: 'NH-07 All-Weather Road Clear',
    legs: [
      { mode: 'bus', title: 'Leg 1: Highway Bus / Maxx', route: 'Haridwar ➔ Joshimath Base', time: '8.5 hrs', cost: '₹520 (UTC Bus)' },
      { mode: 'car', title: 'Leg 2: High Mountain Ascent', route: 'Joshimath ➔ Badrinath Dham (45 km)', time: '1.5 hrs', cost: '₹120 (Bus)' },
    ],
  },
  {
    from: 'kathgodam',
    fromLabel: 'Kathgodam (Railhead)',
    to: 'munsiyari',
    toLabel: 'Munsiyari (Panchachuli Base)',
    corridorId: 'kumaon',
    duration: '10 hrs drive',
    totalDistance: '280 km',
    roadStatus: 'Kalamuni Pass Open',
    legs: [
      { mode: 'car', title: 'Leg 1: Kumaon Vista Drive', route: 'Kathgodam ➔ Almora ➔ Kausani', time: '4.5 hrs', cost: '₹350 (Shared Cab)' },
      { mode: 'bus', title: 'Leg 2: Ridge Highway', route: 'Kausani ➔ Bageshwar ➔ Thal ➔ Munsiyari', time: '5.5 hrs', cost: '₹400' },
    ],
  },
  {
    from: 'dehradun',
    fromLabel: 'Dehradun (Airport)',
    to: 'auli',
    toLabel: 'Auli Ski Resort',
    corridorId: 'badrinath',
    duration: '8.5 hrs + Ropeway',
    totalDistance: '290 km',
    roadStatus: 'Highway Clear',
    legs: [
      { mode: 'bus', title: 'Leg 1: Valley Transit', route: 'Dehradun ➔ Srinagar ➔ Joshimath', time: '8 hrs', cost: '₹480' },
      { mode: 'car', title: 'Leg 2: Ropeway / 4x4', route: 'Joshimath ➔ Auli Top (Cable Car)', time: '22 mins', cost: '₹1,000 Ropeway' },
    ],
  }
];

/**
 * Clean, Compact Floating Transit Navigator Card (YoMetro Style)
 * Sits gracefully on top of the Leaflet Map without pushing layout down!
 */
export default function HimalayanTransitCorridors({
  activeCorridorId,
  onSelectCorridor,
  onFlyToCorridor
}) {
  const [expanded, setExpanded] = useState(false);
  const [fromLocation, setFromLocation] = useState('delhi');
  const [toLocation, setToLocation] = useState('kedarnath');

  const calculatedRoute = useMemo(() => {
    const match = TRANSIT_CATALOG.find(r => r.from === fromLocation && r.to === toLocation);
    if (match) return match;
    const fallback = TRANSIT_CATALOG.find(r => r.to === toLocation) || TRANSIT_CATALOG[0];
    return {
      ...fallback,
      from: fromLocation,
      fromLabel: fromLocation === 'delhi' ? 'Delhi NCR' : fromLocation === 'haridwar' ? 'Haridwar' : fromLocation === 'dehradun' ? 'Dehradun' : 'Kathgodam',
    };
  }, [fromLocation, toLocation]);

  const handleSwap = () => {
    const old = fromLocation;
    setFromLocation(toLocation === 'kedarnath' ? 'haridwar' : 'delhi');
    setToLocation(old === 'delhi' ? 'badrinath' : 'kedarnath');
  };

  const handleHighlight = () => {
    if (calculatedRoute.corridorId) {
      onSelectCorridor(calculatedRoute.corridorId);
      if (onFlyToCorridor) onFlyToCorridor(calculatedRoute.corridorId);
    }
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
      
      {/* 1. YoMetro Floating Route Calculator Pill */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-[#0f3d2e] hover:bg-[#185340] text-white shadow-sm transition cursor-pointer border border-emerald-500/40"
        >
          <Navigation size={13} className="text-emerald-300 animate-pulse" />
          <span>Kaise Pahunche?</span>
          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full font-black bg-emerald-400 text-[#0f3d2e]">
            Route
          </span>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {/* Floating Dropdown Card (Sits on top with high z-index) */}
        {expanded && (
          <div className="absolute top-10 left-0 z-[1000] w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-stone-200/90 p-4 space-y-3 font-sans text-stone-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <Navigation size={15} className="text-emerald-700" />
                <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">Himalayan Route Finder</h4>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="w-6 h-6 rounded-full hover:bg-stone-100 text-stone-500 flex items-center justify-center cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-2">
              <div className="p-2 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2">
                <Train size={14} className="text-emerald-700 shrink-0" />
                <select
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-stone-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="delhi">New Delhi / NCR</option>
                  <option value="haridwar">Haridwar Railhead</option>
                  <option value="rishikesh">Rishikesh Gateway</option>
                  <option value="dehradun">Dehradun ISBT</option>
                  <option value="kathgodam">Kathgodam Railhead</option>
                </select>
              </div>

              <div className="flex justify-center -my-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="p-1 rounded-full bg-white border border-stone-200 shadow-2xs hover:bg-emerald-50 text-stone-600"
                >
                  <ArrowLeftRight size={12} />
                </button>
              </div>

              <div className="p-2 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2">
                <Mountain size={14} className="text-emerald-700 shrink-0" />
                <select
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-stone-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="kedarnath">Kedarnath Dham (3,583m)</option>
                  <option value="badrinath">Badrinath Dham & Mana</option>
                  <option value="auli">Auli Ski Resort</option>
                  <option value="munsiyari">Munsiyari (Panchachuli)</option>
                </select>
              </div>
            </div>

            {/* Quick Result */}
            <div className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-[#0f3d2e]">
                <span>⏱️ {calculatedRoute.duration}</span>
                <span>🛣️ {calculatedRoute.totalDistance}</span>
              </div>
              <div className="text-[11px] text-emerald-800 font-semibold">
                Status: {calculatedRoute.roadStatus}
              </div>
            </div>

            {/* Step-by-Step Mini Legs */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {calculatedRoute.legs.map((leg, i) => (
                <div key={i} className="p-2 bg-white rounded-lg border border-stone-200/70 text-[11px] space-y-0.5 shadow-2xs">
                  <div className="flex items-center justify-between font-bold text-stone-800">
                    <span>{leg.title}</span>
                    <span className="text-emerald-700">{leg.cost}</span>
                  </div>
                  <div className="text-stone-500 font-medium truncate">{leg.route}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={handleHighlight}
              className="w-full py-2 rounded-xl bg-[#0f3d2e] hover:bg-[#185340] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Compass size={13} />
              <span>Show Corridor on Map</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Corridor Line Pills (L1, L2, L3, L4, L5) */}
      {Object.values(HIMALAYAN_CORRIDORS).map((line) => {
        const isActive = activeCorridorId === line.id;
        return (
          <button
            key={line.id}
            type="button"
            onClick={() => {
              const next = isActive ? null : line.id;
              onSelectCorridor(next);
              if (next && onFlyToCorridor) onFlyToCorridor(next);
            }}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer border ${
              isActive
                ? `${line.lightBg} ${line.textColor} ${line.borderColor} ring-2 ring-emerald-500/40 shadow-xs font-black`
                : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${line.badgeBg} shrink-0 shadow-xs`} />
            <span className="whitespace-nowrap">{line.name}</span>
            <span className={`text-[10px] font-mono px-1 rounded ${isActive ? 'bg-black/10' : 'bg-stone-100 text-stone-500'}`}>
              {line.code}
            </span>
          </button>
        );
      })}

      {activeCorridorId && (
        <button
          type="button"
          onClick={() => onSelectCorridor(null)}
          className="shrink-0 p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition"
          title="Clear active line highlight"
        >
          <X size={13} />
        </button>
      )}

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
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
