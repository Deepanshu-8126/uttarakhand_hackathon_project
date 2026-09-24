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
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Polyline, CircleMarker, Tooltip, Popup } from 'react-leaflet';

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
    description: 'The great Alaknanda valley artery connecting Rishikesh railhead to the holy shrine of Badrinath and Auli ski resort.',
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
    description: 'The sacred Mandakini river highway connecting Rudraprayag interchange with Guptkashi, heli bases, and the high-altitude shrine.',
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
    description: 'Scenic gateway corridor connecting Kathgodam railhead with Nainital, Almora heritage town, Kausani, and Munsiyari Panchachuli.',
    stations: [
      { name: 'Kathgodam Railhead', coords: [29.2730, 79.5390], type: 'interchange', altitude: '554m', modes: ['Shatabdi/Ranikhet Exp', 'UTC Bus'] },
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
    description: 'High glacier source corridor linking Dehradun capital to Mussoorie, Uttarkashi, and the twin holy origins Gangotri and Yamunotri.',
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
    description: 'High-altitude Himalayan border frontier leading past Dharchula to Gunji village, Nabidang (Om Parvat) and Jolinkong (Adi Kailash).',
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

// ─── Preset Multi-Modal Transit Routes (YoMetro Style) ───
export const TRANSIT_CATALOG = [
  {
    from: 'delhi',
    fromLabel: 'New Delhi (NCR)',
    to: 'kedarnath',
    toLabel: 'Kedarnath Dham (3,583m)',
    corridorId: 'kedarnath',
    duration: '14-16 hrs total',
    totalDistance: '450 km',
    bestSeason: 'May - Jun & Sep - Oct',
    roadStatus: 'NH-107 Open (Good Condition)',
    legs: [
      { mode: 'train', title: 'Leg 1: Train / Express Bus to Railhead', route: 'New Delhi ➔ Rishikesh / Haridwar', time: '4.5 hrs', cost: '₹280 (Sleeper) - ₹1,150 (Vande Bharat)' },
      { mode: 'bus', title: 'Leg 2: Mountain Highway Bus / Shared Maxx', route: 'Rishikesh ➔ Sonprayag via NH-107', time: '7.5 hrs', cost: '₹450 (UTC Govt Bus) / ₹900 (Shared Cab)' },
      { mode: 'car', title: 'Leg 3: Local Shuttle Jeep', route: 'Sonprayag ➔ Gaurikund Base Gate', time: '20 mins', cost: '₹50 (Standard Jeep Ticket)' },
      { mode: 'trek', title: 'Leg 4: Himalayan Mountain Trek / Heli', route: 'Gaurikund ➔ Kedarnath Temple (16 km)', time: '6-7 hrs Trek OR 8 mins Heli from Phata', cost: '₹0 (Trek) / ₹2,500 (Pony) / ₹4,900 (Heli)' }
    ],
    advisories: ['Biometric Registration mandatory at Sonprayag', 'AMS risk above 3,000m (Carry Diamox & warm layers)', 'Helicopter booking requires official IRCTC HeliYatra ticket']
  },
  {
    from: 'haridwar',
    fromLabel: 'Haridwar (Railhead)',
    to: 'badrinath',
    toLabel: 'Badrinath Dham & Mana Village',
    corridorId: 'badrinath',
    duration: '10 hrs road',
    totalDistance: '320 km',
    bestSeason: 'May - Oct',
    roadStatus: 'NH-07 All-Weather Road Open',
    legs: [
      { mode: 'bus', title: 'Leg 1: Direct UTC Mountain Bus / Taxi', route: 'Haridwar / Rishikesh ➔ Joshimath Base', time: '8.5 hrs', cost: '₹520 (UTC Bus) / ₹1,200 (Shared Maxx)' },
      { mode: 'car', title: 'Leg 2: High Mountain Ascent', route: 'Joshimath ➔ Badrinath Temple (45 km)', time: '1.5 hrs', cost: '₹120 (Local Bus) / ₹250 (Shared Cab)' },
      { mode: 'trek', title: 'Leg 3: India\'s Last Village Excursion', route: 'Badrinath ➔ Mana Village & Saraswati River (3 km)', time: '15 mins', cost: '₹30 (E-Rickshaw/Jeep)' }
    ],
    advisories: ['Night driving prohibited past Joshimath gate after 8:00 PM', 'All-Weather Road double-laned with smooth driving conditions']
  },
  {
    from: 'kathgodam',
    fromLabel: 'Kathgodam (Kumaon Railhead)',
    to: 'munsiyari',
    toLabel: 'Munsiyari (Panchachuli Base)',
    corridorId: 'kumaon',
    duration: '10 hrs scenic drive',
    totalKm: '280 km',
    bestSeason: 'All Year (Snow in Dec-Feb)',
    roadStatus: 'Kalamuni Pass Open',
    legs: [
      { mode: 'car', title: 'Leg 1: Kumaon Vista Highway', route: 'Kathgodam ➔ Almora ➔ Kausani', time: '4.5 hrs', cost: '₹350 (Shared Cab) / ₹2,200 (Private Taxi)' },
      { mode: 'bus', title: 'Leg 2: Mountain Ridge Crossing', route: 'Kausani ➔ Bageshwar ➔ Chaukori ➔ Thal', time: '3.5 hrs', cost: '₹280 (Local Bus)' },
      { mode: 'car', title: 'Leg 3: Kalamuni Pass Ascent to Valley', route: 'Thal ➔ Kalamuni Top (2,700m) ➔ Munsiyari', time: '2 hrs', cost: '₹180 (Shared Maxx)' }
    ],
    advisories: ['Spectacular close-up views of Panchachuli Peaks', 'Carry snow chains in winter between Birthi and Kalamuni']
  },
  {
    from: 'dehradun',
    fromLabel: 'Dehradun (Airport/ISBT)',
    to: 'auli',
    toLabel: 'Auli Himalayan Ski Resort',
    corridorId: 'badrinath',
    duration: '8.5 hrs road + Cable Car',
    totalDistance: '290 km',
    bestSeason: 'Jan - Mar (Skiing) / May - Nov (Lush Meadows)',
    roadStatus: 'Rishikesh-Joshimath Highway Clear',
    legs: [
      { mode: 'bus', title: 'Leg 1: Highway Drive', route: 'Dehradun ➔ Rishikesh ➔ Srinagar ➔ Joshimath', time: '8 hrs', cost: '₹480 (UTC Deluxe) / ₹1,100 (Shared Cab)' },
      { mode: 'car', title: 'Leg 2: Asia\'s Longest Ropeway / 4x4 Mountain Road', route: 'Joshimath ➔ Auli Top (4 km Cable Car or 14 km Road)', time: '22 mins (Cable Car)', cost: '₹1,000 (Roundtrip Ropeway) / ₹400 (4x4 Taxi)' }
    ],
    advisories: ['Asia\'s highest artificial lake and Nanda Devi 7,816m panoramic viewpoint', 'In peak winter, 4x4 vehicles with tire chains required from Joshimath']
  },
  {
    from: 'haridwar',
    fromLabel: 'Haridwar / Rishikesh',
    to: 'chopta',
    toLabel: 'Chopta - Tungnath & Chandrashila',
    corridorId: 'kedarnath',
    duration: '6.5 hrs road + 3.5 km trek',
    totalDistance: '205 km',
    bestSeason: 'Apr - Jun & Sep - Dec',
    roadStatus: 'Kund-Ukhimath-Chopta Road Open',
    legs: [
      { mode: 'bus', title: 'Leg 1: Valley Transit', route: 'Rishikesh ➔ Devprayag ➔ Rudraprayag ➔ Kund', time: '5 hrs', cost: '₹380 (UTC Bus)' },
      { mode: 'car', title: 'Leg 2: Pine & Rhododendron Forest Drive', route: 'Kund ➔ Ukhimath ➔ Chopta Meadow', time: '1.5 hrs', cost: '₹150 (Shared Cab) / ₹900 (Taxi)' },
      { mode: 'trek', title: 'Leg 3: World\'s Highest Shiva Temple Trek', route: 'Chopta Base ➔ Tungnath Temple (3,680m) ➔ Chandrashila Peak (4,000m)', time: '3.5 km (3 hrs hike)', cost: '₹0 (Paved Trail) / ₹1,200 (Pony)' }
    ],
    advisories: ['Known as the "Mini Switzerland of Uttarakhand"', 'Trek is paved with stone steps and accessible for beginners']
  }
];

export default function HimalayanTransitCorridors({
  activeCorridorId,
  onSelectCorridor,
  onFlyToCorridor
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [fromLocation, setFromLocation] = useState('delhi');
  const [toLocation, setToLocation] = useState('kedarnath');
  const [activeTab, setActiveTab] = useState('navigator'); // 'navigator' | 'corridors'

  // Selected corridor object
  const activeCorridor = useMemo(() => {
    return activeCorridorId ? HIMALAYAN_CORRIDORS[activeCorridorId] : null;
  }, [activeCorridorId]);

  // Matching transit route result
  const calculatedRoute = useMemo(() => {
    const directMatch = TRANSIT_CATALOG.find(
      r => r.from === fromLocation && r.to === toLocation
    );
    if (directMatch) return directMatch;

    // Smart fallback generation based on destination
    const fallbackTemplate = TRANSIT_CATALOG.find(r => r.to === toLocation) || TRANSIT_CATALOG[0];
    return {
      ...fallbackTemplate,
      from: fromLocation,
      fromLabel: fromLocation === 'delhi' ? 'Delhi NCR' : fromLocation === 'haridwar' ? 'Haridwar / Rishikesh' : fromLocation === 'dehradun' ? 'Dehradun ISBT' : 'Kathgodam Railhead',
      toLabel: fallbackTemplate.toLabel
    };
  }, [fromLocation, toLocation]);

  const handleSwap = () => {
    // Quick flip animation
    const oldFrom = fromLocation;
    setFromLocation(toLocation === 'kedarnath' ? 'haridwar' : 'delhi');
    setToLocation(oldFrom === 'delhi' ? 'badrinath' : 'kedarnath');
  };

  const handleFocusRoute = () => {
    if (calculatedRoute.corridorId) {
      onSelectCorridor(calculatedRoute.corridorId);
      if (onFlyToCorridor) {
        onFlyToCorridor(calculatedRoute.corridorId);
      }
    }
    setModalOpen(false);
  };

  return (
    <>
      {/* ── 1. Top Ribbon: YoMetro Style Mountain Lines Layer Controller ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        
        {/* Transit Navigator Launch Pill */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-[#0f3d2e] to-emerald-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer border border-emerald-500/30 group"
          title="Open Himalayan Transit Route Calculator"
        >
          <Navigation size={13} className="text-emerald-300 animate-pulse group-hover:rotate-45 transition-transform" />
          <span>Kaise Pahunche?</span>
          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full font-black bg-emerald-400/30 text-emerald-100">
            YoMetro
          </span>
        </button>

        {/* Corridor Line Pills (Metro Line Badges) */}
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

        {/* Clear corridor selection button if active */}
        {activeCorridorId && (
          <button
            type="button"
            onClick={() => onSelectCorridor(null)}
            className="shrink-0 p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition"
            title="Clear active corridor highlight"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* ── 2. Interactive Route & Transit Navigator Modal (YoMetro Style) ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div 
            className="bg-[#fdfbf7] rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-[#1a4331] font-sans"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#0f3d2e] via-[#1a4331] to-[#123023] text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                  <Navigation size={20} className="text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black tracking-tight">Himalayan Transit Navigator</h3>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full font-black bg-emerald-400 text-[#0f3d2e]">
                      Live Routes
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/80 font-normal">
                    Step-by-step train, mountain bus, shared taxi, & high-altitude trek circuits
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Search Controls Box */}
            <div className="p-5 bg-white border-b border-stone-200/80 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-11 gap-2.5 items-center">
                
                {/* From Station */}
                <div className="sm:col-span-5 bg-[#fdfbf7] p-2.5 rounded-2xl border border-stone-200 shadow-2xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    From Station / Origin Hub
                  </label>
                  <div className="flex items-center gap-2">
                    <Train size={15} className="text-emerald-700 shrink-0" />
                    <select
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                      className="w-full bg-transparent font-bold text-xs sm:text-sm text-stone-900 focus:outline-hidden cursor-pointer"
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
                <div className="sm:col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="w-8 h-8 rounded-full bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-800 flex items-center justify-center transition shadow-2xs border border-stone-200 cursor-pointer"
                    title="Swap Origin & Destination"
                  >
                    <ArrowLeftRight size={14} />
                  </button>
                </div>

                {/* To Destination */}
                <div className="sm:col-span-5 bg-[#fdfbf7] p-2.5 rounded-2xl border border-stone-200 shadow-2xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    To Mountain Destination
                  </label>
                  <div className="flex items-center gap-2">
                    <Mountain size={15} className="text-emerald-700 shrink-0" />
                    <select
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value)}
                      className="w-full bg-transparent font-bold text-xs sm:text-sm text-stone-900 focus:outline-hidden cursor-pointer"
                    >
                      <option value="kedarnath">Kedarnath Dham (3,583m)</option>
                      <option value="badrinath">Badrinath Dham & Mana</option>
                      <option value="auli">Auli Himalayan Ski Resort</option>
                      <option value="chopta">Chopta - Tungnath (Mini Switzerland)</option>
                      <option value="munsiyari">Munsiyari (Panchachuli Base)</option>
                      <option value="gangotri">Gangotri Glacier Source</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Quick Info Ribbon */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-emerald-50/80 p-3 rounded-xl border border-emerald-200/80">
                <div className="flex items-center gap-2 font-bold text-[#0f3d2e]">
                  <Clock size={14} className="text-emerald-700" />
                  <span>Total Duration: {calculatedRoute.duration}</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <MapPin size={14} className="text-emerald-700" />
                  <span>Distance: {calculatedRoute.totalDistance || calculatedRoute.totalKm}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <Shield size={14} className="text-emerald-600" />
                  <span>{calculatedRoute.roadStatus}</span>
                </div>
              </div>
            </div>

            {/* Modal Body: Multi-Modal Steps */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-500">
                Multi-Modal Transit Breakdown (Step-by-Step)
              </h4>

              <div className="space-y-3 relative before:absolute before:top-3 before:bottom-3 before:left-4 before:w-0.5 before:bg-emerald-200">
                {calculatedRoute.legs.map((leg, idx) => (
                  <div 
                    key={idx} 
                    className="relative pl-9 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs hover:shadow-xs transition"
                  >
                    <div className="absolute left-2.5 top-4 w-3.5 h-3.5 rounded-full bg-[#0f3d2e] border-2 border-white ring-2 ring-emerald-300 flex items-center justify-center text-[8px] text-white font-bold">
                      {idx + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-[#0f3d2e]">
                          {leg.mode}
                        </span>
                        <h5 className="text-xs sm:text-sm font-bold text-stone-900">{leg.title}</h5>
                      </div>
                      <p className="text-xs font-semibold text-emerald-800">{leg.route}</p>
                    </div>

                    <div className="text-left sm:text-right shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      <div className="text-xs font-bold text-stone-800">{leg.cost}</div>
                      <div className="text-[11px] text-stone-500 font-medium">⏱️ {leg.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Safety & Permit Advisories */}
              {calculatedRoute.advisories && calculatedRoute.advisories.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle size={15} className="text-amber-600" />
                    <span>Important Travel Advisories</span>
                  </div>
                  <ul className="text-xs text-amber-900/90 space-y-1 pl-5 list-disc font-medium">
                    {calculatedRoute.advisories.map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer CTA */}
            <div className="px-6 py-4 bg-white border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-stone-500 font-medium">
                Corridor: <strong className="text-stone-800">{HIMALAYAN_CORRIDORS[calculatedRoute.corridorId]?.name}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleFocusRoute}
                  className="px-5 py-2.5 rounded-xl bg-[#0f3d2e] hover:bg-[#1b4332] text-white text-xs font-bold shadow-md inline-flex items-center gap-2 transition cursor-pointer"
                >
                  <Compass size={14} />
                  <span>Highlight Route on Map</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

// ─── Leaflet Corridors & Stations Map Layers Component ───
export function HimalayanCorridorsLayer({ activeCorridorId }) {
  if (!activeCorridorId) return null;

  const corridor = HIMALAYAN_CORRIDORS[activeCorridorId];
  if (!corridor) return null;

  return (
    <>
      {/* 1. Main Glowing Highway Polyline */}
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

      {/* 2. Corridor Glow Background Polyline */}
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

      {/* 3. Station Nodes (Subway-style Dots on Map) */}
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
