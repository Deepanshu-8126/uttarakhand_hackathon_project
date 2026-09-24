import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Search,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';

// ─── Complete Mountain Stations & Gateways ────────────────────
export const ALL_STATIONS = [
  // Major Gateways & Railheads
  { id: 'haridwar', name: 'Haridwar Railhead', subtitle: 'Garhwal Entry Hub', category: 'Gateway Railhead', corridorId: 'badrinath', coords: [29.9457, 78.1642], altitude: '314m' },
  { id: 'rishikesh', name: 'Rishikesh Yog Nagari', subtitle: 'Char Dham Rail Terminal', category: 'Gateway Railhead', corridorId: 'badrinath', coords: [30.0869, 78.2676], altitude: '372m' },
  { id: 'delhi', name: 'New Delhi (NCR)', subtitle: 'National Air & Rail Gateway', category: 'Metropolitan Gateway', corridorId: 'kedarnath', coords: [28.6139, 77.2090], altitude: '216m' },
  { id: 'dehradun', name: 'Dehradun Capital Hub', subtitle: 'Airport & ISBT Terminal', category: 'Capital Gateway', corridorId: 'glacier', coords: [30.3165, 78.0322], altitude: '447m' },
  { id: 'kathgodam', name: 'Kathgodam Railhead', subtitle: 'Kumaon Entry Gateway', category: 'Gateway Railhead', corridorId: 'kumaon', coords: [29.2182, 79.5267], altitude: '554m' },
  { id: 'tanakpur', name: 'Tanakpur Railhead', subtitle: 'Eastern Border Gateway', category: 'Gateway Railhead', corridorId: 'adikailash', coords: [29.0700, 80.1100], altitude: '280m' },

  // Garhwal / Alaknanda Valley Stations (NH-07)
  { id: 'devprayag', name: 'Devprayag Sangam', subtitle: 'Bhagirathi & Alaknanda Meet', category: 'Garhwal Valley', corridorId: 'badrinath', coords: [30.1459, 78.5990], altitude: '618m' },
  { id: 'srinagar', name: 'Srinagar Garhwal Hub', subtitle: 'Regional Medical & Bus Base', category: 'Garhwal Valley', corridorId: 'badrinath', coords: [30.2227, 78.7844], altitude: '560m' },
  { id: 'rudraprayag', name: 'Rudraprayag Junction', subtitle: 'Kedarnath-Badrinath Fork', category: 'Major Interchange', corridorId: 'badrinath', coords: [30.2858, 78.9811], altitude: '895m' },
  { id: 'karnaprayag', name: 'Karnaprayag Sangam', subtitle: 'Pindar & Alaknanda Confluence', category: 'Garhwal Valley', corridorId: 'badrinath', coords: [30.2605, 79.2173], altitude: '1,451m' },
  { id: 'chamoli', name: 'Chamoli District Base', subtitle: 'Valley Transit Post', category: 'Garhwal Valley', corridorId: 'badrinath', coords: [30.4070, 79.3364], altitude: '1,150m' },
  { id: 'joshimath', name: 'Joshimath Auli Base', subtitle: 'Cable Car & Military Base', category: 'Alpine Gateway', corridorId: 'badrinath', coords: [30.5564, 79.5661], altitude: '1,890m' },
  { id: 'auli', name: 'Auli Ski Resort', subtitle: 'Himalayan Meadows & Ski Slopes', category: 'Alpine Resort', corridorId: 'badrinath', coords: [30.5312, 79.5670], altitude: '2,800m' },
  { id: 'govindghat', name: 'Govindghat Base', subtitle: 'Valley of Flowers / Hemkund Base', category: 'Trek Base', corridorId: 'badrinath', coords: [30.6250, 79.5480], altitude: '1,828m' },
  { id: 'badrinath', name: 'Badrinath Dham', subtitle: 'Sacred Alaknanda Shrine & Mana', category: 'Sacred Dham', corridorId: 'badrinath', coords: [30.7465, 79.4942], altitude: '3,300m' },

  // Mandakini / Kedarnath Highway (NH-107)
  { id: 'augustmuni', name: 'Augustmuni Helipad', subtitle: 'Heli Operations Base', category: 'Mandakini Valley', corridorId: 'kedarnath', coords: [30.3950, 79.0230], altitude: '920m' },
  { id: 'kund', name: 'Kund (Chopta Fork)', subtitle: 'Tungnath Trek Divergence', category: 'Mandakini Valley', corridorId: 'kedarnath', coords: [30.4900, 79.0600], altitude: '1,050m' },
  { id: 'chopta', name: 'Chopta & Tungnath', subtitle: 'Mini Switzerland & Highest Shiva Shrine', category: 'Alpine Trek', corridorId: 'kedarnath', coords: [30.4854, 79.1866], altitude: '2,680m' },
  { id: 'guptkashi', name: 'Guptkashi Cultural Base', subtitle: 'Transit & Temple Town', category: 'Mandakini Valley', corridorId: 'kedarnath', coords: [30.5200, 79.0800], altitude: '1,320m' },
  { id: 'phata', name: 'Phata Heliport Hub', subtitle: 'Major Kedarnath Heliport', category: 'Heli Base', corridorId: 'kedarnath', coords: [30.5560, 79.0960], altitude: '1,640m' },
  { id: 'sonprayag', name: 'Sonprayag Transit Gate', subtitle: 'Biometric Barrier & Taxi Stand', category: 'Transit Gate', corridorId: 'kedarnath', coords: [30.6040, 79.0990], altitude: '1,829m' },
  { id: 'gaurikund', name: 'Gaurikund Trek Base', subtitle: 'Hot Springs & Trek Starting Point', category: 'Trek Base', corridorId: 'kedarnath', coords: [30.6510, 79.1040], altitude: '1,982m' },
  { id: 'kedarnath', name: 'Kedarnath Dham', subtitle: 'High Himalayan Jyotirlinga', category: 'Sacred Dham', corridorId: 'kedarnath', coords: [30.7352, 79.0669], altitude: '3,583m' },

  // Kumaon Lakes & Heights Route (NH-309)
  { id: 'nainital', name: 'Nainital / Bhimtal', subtitle: 'Lake District Hub', category: 'Kumaon Lakes', corridorId: 'kumaon', coords: [29.3437, 79.5677], altitude: '1,370m' },
  { id: 'almora', name: 'Almora Cultural Hub', subtitle: 'Heritage Town & Ridge Vista', category: 'Kumaon Heights', corridorId: 'kumaon', coords: [29.5971, 79.6591], altitude: '1,638m' },
  { id: 'kausani', name: 'Kausani Sunrise Vista', subtitle: 'Trisul-Nanda Devi Panorama', category: 'Kumaon Heights', corridorId: 'kumaon', coords: [29.8390, 79.5970], altitude: '1,890m' },
  { id: 'bageshwar', name: 'Bageshwar Sangam', subtitle: 'Saryu-Gomti Sacred Junction', category: 'Kumaon Valley', corridorId: 'kumaon', coords: [29.8380, 79.7720], altitude: '960m' },
  { id: 'thal', name: 'Thal Junction', subtitle: 'Ramganga River Pass Base', category: 'Kumaon Valley', corridorId: 'kumaon', coords: [29.9630, 80.3750], altitude: '895m' },
  { id: 'munsiyari', name: 'Munsiyari Panchachuli', subtitle: '5 Peaks Vista & Milam Glacier Base', category: 'Alpine Frontier', corridorId: 'kumaon', coords: [30.0670, 80.2390], altitude: '2,200m' },

  // Glacier Corridor (NH-134 & NH-108)
  { id: 'mussoorie', name: 'Mussoorie Queen of Hills', subtitle: 'Mountain Ridge Gateway', category: 'Ridge Gateway', corridorId: 'glacier', coords: [30.4539, 78.0644], altitude: '2,000m' },
  { id: 'barkot', name: 'Barkot Yamuna Base', subtitle: 'Yamunotri Staging Station', category: 'Glacier Valley', corridorId: 'glacier', coords: [30.8120, 78.2080], altitude: '1,220m' },
  { id: 'yamunotri', name: 'Yamunotri Dham', subtitle: 'Sacred Source of Yamuna River', category: 'Sacred Dham', corridorId: 'glacier', coords: [31.0140, 78.4600], altitude: '3,293m' },
  { id: 'uttarkashi', name: 'Uttarkashi Mountaineering', subtitle: 'Nehru Institute of Mountaineering', category: 'Glacier Valley', corridorId: 'glacier', coords: [30.7248, 78.4464], altitude: '1,165m' },
  { id: 'harsil', name: 'Harsil Apple Valley', subtitle: 'Bhagirathi Alpine Pine Hamlet', category: 'Alpine Valley', corridorId: 'glacier', coords: [31.1400, 78.7200], altitude: '2,620m' },
  { id: 'gangotri', name: 'Gangotri Glacier Source', subtitle: 'Sacred Origin of River Ganga', category: 'Sacred Dham', corridorId: 'glacier', coords: [30.9940, 79.0706], altitude: '3,048m' },

  // Eastern Frontier / Adi Kailash (NH-9)
  { id: 'pithoragarh', name: 'Pithoragarh District Hub', subtitle: 'Saur Valley & Mini Kashmir', category: 'Border District', corridorId: 'adikailash', coords: [29.5820, 80.2180], altitude: '1,814m' },
  { id: 'dharchula', name: 'Dharchula ILP Checkpost', subtitle: 'Kali River Border & Permit Point', category: 'ILP Checkpoint', corridorId: 'adikailash', coords: [29.8570, 80.5280], altitude: '915m' },
  { id: 'gunji', name: 'Gunji Adi Kailash Jnc', subtitle: 'Om Parvat & Kailash Route Fork', category: 'High Border', corridorId: 'adikailash', coords: [30.2700, 80.9900], altitude: '3,050m' },
];

// ─── 5 Himalayan Corridors & Highways ────────────────────────
export const HIMALAYAN_CORRIDORS = {
  badrinath: {
    id: 'badrinath',
    name: 'NH-07 Badrinath & Auli Corridor',
    code: 'L1',
    color: '#0f3d2e',
    badgeBg: 'bg-[#0f3d2e]',
    textColor: 'text-[#0f3d2e]',
    borderColor: 'border-emerald-300',
    lightBg: 'bg-emerald-50',
    duration: '9-10 hrs road',
    totalKm: '298 km',
    highway: 'NH-07 (All-Weather Char Dham Highway)',
    description: 'The great Alaknanda valley artery connecting Haridwar/Rishikesh railheads to Badrinath & Auli.',
    stations: [
      { name: 'Haridwar Railhead Hub', coords: [29.9457, 78.1642], type: 'interchange', altitude: '314m', modes: ['Train', 'UTC Bus', 'Taxi'] },
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
    polyline: [[29.9457, 78.1642],[30.0869, 78.2676],[30.1459, 78.5990],[30.2227, 78.7844],[30.2858, 78.9811],[30.2605, 79.2173],[30.4070, 79.3364],[30.5564, 79.5661],[30.6250, 79.5480],[30.7465, 79.4942]]
  },
  kedarnath: {
    id: 'kedarnath',
    name: 'Mandakini Kedarnath Highway',
    code: 'L2',
    color: '#8b5cf6',
    badgeBg: 'bg-purple-600',
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
    badgeBg: 'bg-sky-600',
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
    color: '#ea580c',
    badgeBg: 'bg-orange-600',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
    lightBg: 'bg-orange-50',
    duration: '8-9 hrs road',
    totalKm: '260 km',
    highway: 'NH-134 Yamuna Valley / NH-108 Ganga Corridor',
    description: 'Twin glacier dhams — Yamunotri source and Gangotri origin — via Dehradun capital.',
    stations: [
      { name: 'Dehradun Capital Hub', coords: [30.3165, 78.0322], type: 'interchange', altitude: '447m', modes: ['Airport', 'ISBT', 'Train'] },
      { name: 'Mussoorie Queen of Hills', coords: [30.4539, 78.0644], type: 'junction', altitude: '2,000m', modes: ['Bus', 'Cable Car'] },
      { name: 'Barkot Yamuna Base', coords: [30.8120, 78.2080], type: 'junction', altitude: '1,220m', modes: ['Yamunotri Base', 'Bus'] },
      { name: 'Uttarkashi Mountaineering', coords: [30.7248, 78.4464], type: 'junction', altitude: '1,165m', modes: ['Mountaineering Base'] },
      { name: 'Harsil Apple Valley', coords: [31.1400, 78.7200], type: 'station', altitude: '2,620m', modes: ['Taxi', 'GMVN'] },
      { name: 'Gangotri Glacier Source', coords: [30.9940, 79.0706], type: 'terminus', altitude: '3,048m', modes: ['Shrine Entry'] },
    ],
    polyline: [[30.3165, 78.0322],[30.4539, 78.0644],[30.8120, 78.2080],[30.7248, 78.4464],[31.1400, 78.7200],[30.9940, 79.0706]]
  },
  adikailash: {
    id: 'adikailash',
    name: 'Adi Kailash & Om Parvat Border Route',
    code: 'L5',
    color: '#ca8a04',
    badgeBg: 'bg-yellow-600',
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

const MODE_ICONS = {
  TRAIN: Train,
  BUS: Bus,
  'MOUNTAIN BUS': Bus,
  'UTC DELUXE': Bus,
  'LOCAL BUS': Bus,
  CAR: Car,
  SHUTTLE: Car,
  'SHARED CAB': Car,
  ROPEWAY: Navigation,
  WALK: Footprints,
  TREK: Mountain,
  'TREK / HELI': Mountain,
  MOUNTAIN: Mountain
};

// ─── Searchable Station Select Dropdown ─────────────────────────
function SearchableStationSelect({ label, value, onChange, placeholder, icon: IconComponent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const selectedStation = ALL_STATIONS.find((s) => s.id === value) || ALL_STATIONS[0];

  const filteredStations = useMemo(() => {
    if (!search.trim()) return ALL_STATIONS;
    const q = search.toLowerCase().trim();
    return ALL_STATIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.subtitle.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white rounded-xl border border-stone-200 px-3 py-2.5 text-left hover:border-[#0f3d2e]/50 focus:ring-2 focus:ring-[#0f3d2e]/20 transition-all shadow-2xs group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#0f3d2e] flex items-center justify-center shrink-0 border border-emerald-100">
            <IconComponent size={13} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-stone-900 truncate">{selectedStation.name}</p>
            <p className="text-[10px] text-stone-400 truncate">{selectedStation.subtitle} • {selectedStation.altitude}</p>
          </div>
        </div>
        <ChevronDown size={14} className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
          {/* Search Box with Icon */}
          <div className="p-2 border-b border-stone-100 bg-stone-50/70">
            <div className="relative flex items-center">
              <Search size={13} className="absolute left-2.5 text-[#0f3d2e] pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder={placeholder || 'Search stations, railheads, shrines...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs font-medium bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/30 text-stone-900 placeholder:text-stone-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 text-stone-400 hover:text-stone-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Station List */}
          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-stone-50">
            {filteredStations.length === 0 ? (
              <div className="p-3 text-center text-xs text-stone-400">
                No mountain stations found matching &ldquo;{search}&rdquo;
              </div>
            ) : (
              filteredStations.map((station) => {
                const isSelected = station.id === value;
                return (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => {
                      onChange(station.id);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-[#0f3d2e] font-bold'
                        : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate">{station.name}</span>
                        {isSelected && <CheckCircle2 size={12} className="text-[#0f3d2e] shrink-0" />}
                      </div>
                      <p className="text-[10px] text-stone-400 truncate">{station.subtitle} • {station.altitude}</p>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 shrink-0">
                      {station.category}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * TransitRouteDrawer — Himalayan Route Finder inside /map
 * Features:
 * - Searchable origin & destination with search icon & autocomplete for all stations
 * - Haridwar Railhead (Garhwal Entry Hub) explicitly included & highlighted
 * - Multi-modal mountain journey breakdown (Train, Mountain Bus, Shared Cab, Trek/Heli)
 * - Road highway condition & high altitude advisory
 * - Mobile responsive drawer / bottom-sheet with backdrop
 * - "Show Route on Map" button that triggers smooth Leaflet bounds fitting
 */
export default function TransitRouteDrawer({
  isOpen,
  onClose,
  activeCorridorId,
  onSelectCorridor,
  onFlyToCorridor,
}) {
  const [fromLocation, setFromLocation] = useState('haridwar');
  const [toLocation, setToLocation] = useState('kedarnath');
  const [selectedTab, setSelectedTab] = useState('route');

  // Quick route presets
  const handleQuickPreset = (from, to) => {
    setFromLocation(from);
    setToLocation(to);
    setSelectedTab('route');
  };

  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  // Determine destination station & matched corridor
  const destStation = useMemo(() => {
    return ALL_STATIONS.find((s) => s.id === toLocation) || ALL_STATIONS.find((s) => s.id === 'kedarnath');
  }, [toLocation]);

  const originStation = useMemo(() => {
    return ALL_STATIONS.find((s) => s.id === fromLocation) || ALL_STATIONS.find((s) => s.id === 'haridwar');
  }, [fromLocation]);

  const activeCorridor = useMemo(() => {
    const corridorKey = destStation.corridorId || originStation.corridorId || 'badrinath';
    return HIMALAYAN_CORRIDORS[corridorKey] || HIMALAYAN_CORRIDORS.badrinath;
  }, [destStation, originStation]);

  // Compute multi-modal route details dynamically
  const routeAnalysis = useMemo(() => {
    const isDelhiOrigin = fromLocation === 'delhi';
    const isKathgodamCorridor = activeCorridor.id === 'kumaon';
    const isBorderCorridor = activeCorridor.id === 'adikailash';
    const isGlacierCorridor = activeCorridor.id === 'glacier';
    const isKedarnathCorridor = activeCorridor.id === 'kedarnath';

    let distance = '240 km';
    let duration = '8-10 hrs';
    let highway = activeCorridor.highway;
    let status = 'Open — Normal Traffic';
    let legs = [];
    let advisories = [
      'Carry valid Government ID (Aadhaar/Passport)',
      'Night driving across high passes restricted after 8:00 PM',
      'All-Weather mountain road monitored by BRO / PWD',
    ];

    if (isKedarnathCorridor) {
      distance = isDelhiOrigin ? '450 km' : '235 km';
      duration = isDelhiOrigin ? '14-16 hrs' : '8 hrs road + 6 hrs trek';
      status = 'NH-107 Open — Sonprayag gate operating normally';
      legs = [
        ...(isDelhiOrigin
          ? [{ mode: 'TRAIN', title: 'Express Train to Railhead', route: 'New Delhi → Haridwar Railhead / Yog Nagari Rishikesh', time: '4.5 hrs', cost: '₹280 – ₹1,150' }]
          : []),
        { mode: 'MOUNTAIN BUS', title: 'Mandakini Valley Highway Bus / Maxx', route: `${originStation.name} → Rudraprayag → Guptkashi → Sonprayag`, time: '7.5 hrs', cost: '₹450 – ₹900' },
        { mode: 'SHUTTLE', title: 'Local Shuttle Jeep', route: 'Sonprayag Barrier → Gaurikund Base Gate', time: '20 mins', cost: '₹50' },
        { mode: 'TREK / HELI', title: 'Mountain Trek or Heli', route: 'Gaurikund → Kedarnath Dham (16 km)', time: '6-7 hrs Trek / 8 min Heli', cost: '₹0 (Trek) – ₹4,900 (Heli)' },
      ];
      advisories = [
        'Sonprayag Biometric Registration required before ascent',
        'AMS risk above 3,200m — keep hydrated & carry warm thermals',
        'IRCTC HeliYatra booking only through official government portal',
      ];
    } else if (activeCorridor.id === 'badrinath') {
      distance = isDelhiOrigin ? '510 km' : '298 km';
      duration = isDelhiOrigin ? '15 hrs' : '9-10 hrs';
      status = 'NH-07 All-Weather Highway clear';
      legs = [
        ...(isDelhiOrigin
          ? [{ mode: 'TRAIN', title: 'Express Train to Haridwar Railhead', route: 'New Delhi → Haridwar / Rishikesh Terminal', time: '4.5 hrs', cost: '₹280 – ₹1,150' }]
          : []),
        { mode: 'MOUNTAIN BUS', title: 'Alaknanda Valley Highway Drive', route: `${originStation.name} → Devprayag → Srinagar → Joshimath Base`, time: '8 hrs', cost: '₹520 – ₹1,200' },
        { mode: 'LOCAL BUS', title: 'Alpine Valley Ascent', route: 'Joshimath → Badrinath Dham (45 km)', time: '1.5 hrs', cost: '₹120 – ₹250' },
        { mode: 'WALK', title: "Mana Village & Saraswati Udgam", route: 'Badrinath → Mana (India\'s First Village)', time: '15 mins', cost: 'Free / ₹30 E-Rickshaw' },
      ];
      advisories = [
        'NH-07 All-Weather Highway allows smooth transit with twin lanes',
        'Gate timings active between Joshimath and Badrinath',
        'Mana pass excursion requires border check at ITBP post',
      ];
    } else if (isKathgodamCorridor) {
      distance = isDelhiOrigin ? '480 km' : '280 km';
      duration = isDelhiOrigin ? '14 hrs' : '10 hrs';
      status = 'NH-309 Kumaon Ridge clear';
      legs = [
        ...(isDelhiOrigin
          ? [{ mode: 'TRAIN', title: 'Kathgodam Shatabdi / Express', route: 'New Delhi → Kathgodam Railhead', time: '5.5 hrs', cost: '₹320 – ₹1,200' }]
          : []),
        { mode: 'SHARED CAB', title: 'Kumaon Pine Ridge Drive', route: `${originStation.name} → Almora → Kausani Vista`, time: '4.5 hrs', cost: '₹350 – ₹1,800' },
        { mode: 'BUS', title: 'Ramganga River Pass', route: 'Kausani → Bageshwar → Thal', time: '3 hrs', cost: '₹240' },
        { mode: 'MOUNTAIN PASS', title: 'Kalamuni Pass Crossing (2,700m)', route: 'Thal → Kalamuni Top → Munsiyari Base', time: '2 hrs', cost: '₹180' },
      ];
      advisories = [
        'Panoramic views of Panchachuli Peaks from Kausani & Munsiyari',
        'Carry light woolens in summer, heavy winter gear from Nov-March',
      ];
    } else if (isGlacierCorridor) {
      distance = '260 km';
      duration = '8-9 hrs';
      status = 'NH-108 Bhagirathi Valley clear';
      legs = [
        { mode: 'UTC DELUXE', title: 'Capital Highway Service', route: `${originStation.name} → Mussoorie / Chamba → Uttarkashi Hub`, time: '5 hrs', cost: '₹380 – ₹850' },
        { mode: 'SHARED CAB', title: 'Bhagirathi Gorge Ascent', route: 'Uttarkashi → Harsil Apple Valley', time: '2.5 hrs', cost: '₹220 – ₹450' },
        { mode: 'LOCAL BUS', title: 'Glacier Shrine Terminal', route: 'Harsil → Gangotri Dham (3,048m)', time: '1.5 hrs', cost: '₹120' },
      ];
      advisories = [
        'Gaumukh glacier trek past Gangotri requires Forest Dept permit',
        'Harsil apple orchards peak during August - October',
      ];
    } else if (isBorderCorridor) {
      distance = '325 km';
      duration = '14 hrs (Multi-Day Recommended)';
      status = 'NH-9 Pithoragarh Border Highway (ILP Mandatory)';
      legs = [
        { mode: 'BUS', title: 'Border Valley Transport', route: `${originStation.name} → Pithoragarh District Hub`, time: '6 hrs', cost: '₹400' },
        { mode: 'SHARED CAB', title: 'Kali River Border Jeep', route: 'Pithoragarh → Dharchula ILP Checkpost', time: '3.5 hrs', cost: '₹300' },
        { mode: '4X4 JEEP', title: 'High Altitude Border Track', route: 'Dharchula → Gunji → Adi Kailash Base', time: '4.5 hrs', cost: '₹800 (Shared 4x4)' },
      ];
      advisories = [
        'Inner Line Permit (ILP) & Medical Fitness Certificate mandatory',
        'Altitude exceeds 3,000m — proper acclimatization essential',
      ];
    }

    return {
      distance,
      duration,
      highway,
      status,
      legs,
      advisories,
      corridorId: activeCorridor.id,
    };
  }, [activeCorridor, fromLocation, originStation, destStation]);

  const handleShowOnMap = (corridorIdToFly) => {
    const cId = corridorIdToFly || activeCorridor.id;
    if (cId) {
      onSelectCorridor(cId);
      if (onFlyToCorridor) onFlyToCorridor(cId);
      // On mobile screens (< 768px), auto close drawer so user sees the map
      if (window.innerWidth < 768) {
        onClose();
      }
    }
  };

  const getModeIcon = (mode) => {
    const key = (mode || '').toUpperCase();
    return MODE_ICONS[key] || Navigation;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[1090] md:hidden animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer / Bottom-Sheet Container */}
      <aside
        className="fixed inset-x-0 bottom-0 md:bottom-auto md:top-0 md:right-0 md:left-auto z-[1100] w-full md:max-w-[420px] max-h-[90vh] md:max-h-full h-auto md:h-full bg-white shadow-2xl border-t md:border-t-0 md:border-l border-stone-200 flex flex-col font-sans text-stone-900 rounded-t-3xl md:rounded-none animate-in slide-in-from-bottom md:slide-in-from-right duration-250 select-none overflow-hidden"
        aria-label="Himalayan Routes Navigator"
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-2.5 mb-1 md:hidden" />

        {/* ── Header ── */}
        <div className="px-5 py-3.5 bg-white border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0f3d2e] flex items-center justify-center shadow-sm shrink-0">
              <Navigation size={18} className="text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black tracking-tight text-[#0f3d2e]">Himalayan Routes Finder</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#0f3d2e]">
                  GIS 2026
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">Garhwal &amp; Kumaon Mountain Corridors</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Drawer"
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Tabs: Find Route vs 5 Corridors ── */}
        <div className="flex border-b border-stone-200 bg-stone-50/80 px-4 pt-1.5 gap-1 shrink-0">
          {[
            { key: 'route', label: 'Route Finder & Steps', icon: Compass },
            { key: 'lines', label: '5 Mountain Corridors', icon: Layers },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = selectedTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedTab(tab.key)}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#0f3d2e] text-[#0f3d2e]'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
              >
                <TabIcon size={13} className={isActive ? 'text-[#0f3d2e]' : 'text-stone-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Body Content ── */}
        <div className="flex-1 overflow-y-auto">
          {selectedTab === 'route' ? (
            <div className="p-4 space-y-4">
              {/* Quick Popular Presets Chips */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                  Popular Pilgrimage &amp; Valley Routes:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { label: 'Haridwar → Kedarnath', from: 'haridwar', to: 'kedarnath' },
                    { label: 'Haridwar → Badrinath', from: 'haridwar', to: 'badrinath' },
                    { label: 'Rishikesh → Auli', from: 'rishikesh', to: 'auli' },
                    { label: 'Kathgodam → Munsiyari', from: 'kathgodam', to: 'munsiyari' },
                    { label: 'Dehradun → Gangotri', from: 'dehradun', to: 'gangotri' },
                  ].map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickPreset(p.from, p.to)}
                      className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border transition cursor-pointer ${
                        fromLocation === p.from && toLocation === p.to
                          ? 'bg-[#0f3d2e] text-white border-[#0f3d2e]'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ─── Searchable Origin & Destination Card ─── */}
              <div className="bg-[#fdfbf7] rounded-2xl border border-stone-200 shadow-xs p-3.5 space-y-3">
                {/* FROM Input */}
                <SearchableStationSelect
                  label="From — Origin / Railhead"
                  value={fromLocation}
                  onChange={setFromLocation}
                  placeholder="Search origin, railhead, town..."
                  icon={MapPin}
                />

                {/* Swap Button */}
                <div className="flex justify-center -my-1 relative z-10">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="w-7 h-7 rounded-full bg-white border border-stone-200 shadow-xs hover:bg-emerald-50 hover:border-emerald-300 text-stone-500 hover:text-[#0f3d2e] flex items-center justify-center transition cursor-pointer"
                    title="Swap Origin & Destination"
                  >
                    <ArrowLeftRight size={12} className="rotate-90" />
                  </button>
                </div>

                {/* TO Input */}
                <SearchableStationSelect
                  label="To — Mountain Destination / Shrine"
                  value={toLocation}
                  onChange={setToLocation}
                  placeholder="Search shrine, peak, destination..."
                  icon={Mountain}
                />

                {/* Corridor Match Indicator */}
                <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: activeCorridor.color }}
                    />
                    <span className="font-bold text-stone-800 truncate">{activeCorridor.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 shrink-0">
                    {activeCorridor.code}
                  </span>
                </div>
              </div>

              {/* ─── Primary CTA: Show Route on Map ─── */}
              <button
                type="button"
                onClick={() => handleShowOnMap(activeCorridor.id)}
                className="w-full py-3 px-4 rounded-xl bg-[#0f3d2e] hover:bg-[#185340] text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-[0.99]"
              >
                <Compass size={15} className="text-emerald-300 group-hover:rotate-45 transition-transform" />
                <span>Show Route on Map</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>

              {/* ─── Route Key Metrics ─── */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-1.5 text-stone-500 text-[10px] font-extrabold uppercase">
                    <Clock size={12} className="text-[#0f3d2e]" />
                    <span>Est. Travel Time</span>
                  </div>
                  <p className="text-xs font-black text-stone-900 mt-1">{routeAnalysis.duration}</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-1.5 text-stone-500 text-[10px] font-extrabold uppercase">
                    <Navigation size={12} className="text-[#0f3d2e]" />
                    <span>Distance &amp; Highway</span>
                  </div>
                  <p className="text-xs font-black text-stone-900 mt-1">{routeAnalysis.distance}</p>
                </div>
              </div>

              {/* Road Condition Banner */}
              <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs">
                <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                <span className="font-semibold text-emerald-900 leading-tight text-[11px]">
                  {routeAnalysis.status}
                </span>
              </div>

              {/* ─── Multi-Modal Step-by-Step Breakdown ─── */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={13} className="text-[#0f3d2e]" />
                  <span>Step-by-Step Mountain Transit</span>
                </h4>

                <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {routeAnalysis.legs.map((leg, idx) => {
                    const LegIcon = getModeIcon(leg.mode);
                    return (
                      <div key={idx} className="relative group">
                        {/* Bullet Icon */}
                        <div className="absolute -left-5 top-0.5 w-4 h-4 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                          {idx + 1}
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs hover:border-[#0f3d2e]/30 transition-colors">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <LegIcon size={13} className="text-[#0f3d2e]" />
                              <span className="text-xs font-bold text-stone-900">{leg.title}</span>
                            </div>
                            <span className="text-[10px] font-extrabold text-[#0f3d2e] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                              {leg.cost}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-1">{leg.route}</p>
                          <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-stone-100 text-[10px] text-stone-400 font-semibold">
                            <Clock size={10} />
                            <span>{leg.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ─── Mountain Travel Advisories ─── */}
              <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                  <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                  <span>Mountain Safety &amp; Travel Advisories</span>
                </div>
                <ul className="space-y-1 text-[11px] text-amber-950 font-medium list-disc list-inside">
                  {routeAnalysis.advisories.map((adv, idx) => (
                    <li key={idx} className="leading-relaxed">{adv}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            /* ─── 5 Corridors Tab ─── */
            <div className="p-4 space-y-3">
              <p className="text-xs text-stone-500 font-medium">
                Uttarakhand state transport GIS divides mountain movement into 5 primary highway corridors:
              </p>

              <div className="space-y-2.5">
                {Object.values(HIMALAYAN_CORRIDORS).map((line) => {
                  const isActive = activeCorridorId === line.id;
                  return (
                    <div
                      key={line.id}
                      onClick={() => handleShowOnMap(line.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-emerald-50 border-[#0f3d2e]/40 ring-2 ring-[#0f3d2e]/20 shadow-sm'
                          : 'bg-white hover:bg-stone-50 border-stone-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: line.color }}
                          />
                          <span className="text-xs font-black text-stone-900">{line.name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                          {line.code}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">{line.description}</p>

                      <div className="flex items-center gap-4 mt-2.5 pt-2.5 border-t border-stone-100 text-[10px] font-bold text-stone-400">
                        <span>⏱️ {line.duration}</span>
                        <span>🛣️ {line.totalKm}</span>
                        <span className={`ml-auto font-black ${isActive ? 'text-[#0f3d2e]' : 'text-stone-400 group-hover:text-[#0f3d2e]'}`}>
                          {isActive ? '✓ Active on Map' : 'View on Map →'}
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
        <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Shield size={12} className="text-[#0f3d2e]" />
            <span className="font-semibold text-stone-600">Verified Uttarakhand GIS</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs cursor-pointer transition shadow-2xs"
          >
            Close
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Leaflet Corridor & Station Layer ─────────────────────────
export function HimalayanCorridorsLayer({ activeCorridorId }) {
  if (!activeCorridorId) return null;
  const corridor = HIMALAYAN_CORRIDORS[activeCorridorId];
  if (!corridor) return null;

  return (
    <>
      {/* Outer Glow Halo Polyline */}
      <Polyline
        positions={corridor.polyline}
        pathOptions={{
          color: corridor.color,
          weight: 16,
          opacity: 0.22,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />

      {/* Main Corridor Polyline */}
      <Polyline
        positions={corridor.polyline}
        pathOptions={{
          color: corridor.color,
          weight: 6,
          opacity: 0.95,
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
            <span className="text-slate-500 block text-[10px] mt-0.5">
              ⏱️ {corridor.duration} • 🛣️ {corridor.totalKm}
            </span>
          </div>
        </Tooltip>
      </Polyline>

      {/* Interactive Station Markers */}
      {corridor.stations.map((st, idx) => (
        <CircleMarker
          key={`station-${idx}`}
          center={st.coords}
          radius={st.type === 'terminus' ? 9 : st.type === 'interchange' ? 8 : 6}
          pathOptions={{
            color: '#ffffff',
            weight: 2.5,
            fillColor:
              st.type === 'terminus'
                ? '#e11d48'
                : st.type === 'interchange'
                ? '#0f3d2e'
                : corridor.color,
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
                ⛰️ {st.altitude} • <span className="uppercase font-semibold">{st.type}</span>
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
