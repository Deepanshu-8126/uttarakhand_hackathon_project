import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navigation,
  Mountain,
  ArrowLeftRight,
  Clock,
  MapPin,
  X,
  Compass,
  Train,
  Bus,
  Car,
  Footprints,
  Shield,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
  Share2,
  ExternalLink,
  PhoneCall,
  Activity,
  AlertTriangle,
  Fuel,
  Hotel,
} from 'lucide-react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';

// ─── Complete Mountain Stations & Gateways ────────────────────
export const ALL_STATIONS = [
  // Major Gateways & Railheads
  { id: 'haridwar', name: 'Haridwar Railhead', subtitle: 'Garhwal Entry Hub', category: 'Gateway Railhead', corridorId: 'badrinath', coords: [29.9457, 78.1642], altitudeM: 314, altitude: '314m', amenities: ['fuel', 'medical', 'stay'] },
  { id: 'rishikesh', name: 'Rishikesh Yog Nagari', subtitle: 'Char Dham Rail Terminal', category: 'Gateway Railhead', corridorId: 'badrinath', coords: [30.0869, 78.2676], altitudeM: 372, altitude: '372m', amenities: ['fuel', 'medical', 'stay'] },
  { id: 'delhi', name: 'New Delhi (NCR)', subtitle: 'National Air & Rail Gateway', category: 'Metropolitan Gateway', corridorId: 'kedarnath', coords: [28.6139, 77.2090], altitudeM: 216, altitude: '216m', amenities: ['fuel', 'medical', 'stay'] },
  { id: 'dehradun', name: 'Dehradun Capital Hub', subtitle: 'Airport & ISBT Terminal', category: 'Capital Gateway', corridorId: 'glacier', coords: [30.3165, 78.0322], altitudeM: 447, altitude: '447m', amenities: ['fuel', 'medical', 'stay'] },
  { id: 'kathgodam', name: 'Kathgodam Railhead', subtitle: 'Kumaon Entry Gateway', category: 'Gateway Railhead', corridorId: 'kumaon', coords: [29.2182, 79.5267], altitudeM: 554, altitude: '554m', amenities: ['fuel', 'medical', 'stay'] },
  { id: 'tanakpur', name: 'Tanakpur Railhead', subtitle: 'Eastern Border Gateway', category: 'Gateway Railhead', corridorId: 'adikailash', coords: [29.0700, 80.1100], altitudeM: 280, altitude: '280m', amenities: ['fuel', 'medical', 'stay'] },

  // Garhwal / Alaknanda Valley Stations (NH-07)
  { id: 'devprayag', name: 'Devprayag Sangam', subtitle: 'Bhagirathi & Alaknanda Meet', category: 'Garhwal Valley', corridorId: 'badrinath', coords: [30.1459, 78.5990], altitudeM: 618, altitude: '618m', amenities: ['fuel', 'stay'] },
  { id: 'srinagar', name: 'Srinagar Garhwal Hub', subtitle: 'Regional Medical & Bus Base', category: 'Garhwal Valley', corridorId: 'badrinath', coords: [30.2227, 78.7844], altitudeM: 560, altitude: '560m', amenities: ['fuel', 'medical', 'stay'] },
  { id: 'rudraprayag', name: 'Rudraprayag Junction', subtitle: 'Kedarnath-Badrinath Fork', category: 'Major Interchange', corridorId: 'badrinath', coords: [30.2858, 78.9811], altitudeM: 895, altitude: '895m', amenities: ['fuel', 'medical', 'stay'] },
  { id: 'karnaprayag', name: 'Karnaprayag Sangam', subtitle: 'Pindar & Alaknanda Confluence', category: 'Garhwal Valley', corridorId: 'badrinath', coords: [30.2605, 79.2173], altitudeM: 1451, altitude: '1,451m', amenities: ['fuel', 'stay'] },
  { id: 'chamoli', name: 'Chamoli District Base', subtitle: 'Valley Transit Post', category: 'Garhwal Valley', corridorId: 'badrinath', coords: [30.4070, 79.3364], altitudeM: 1150, altitude: '1,150m', amenities: ['fuel', 'medical', 'stay'] },
  { id: 'joshimath', name: 'Joshimath Auli Base', subtitle: 'Cable Car & Military Base', category: 'Alpine Gateway', corridorId: 'badrinath', coords: [30.5564, 79.5661], altitudeM: 1890, altitude: '1,890m', amenities: ['fuel', 'medical', 'stay'] },
  { id: 'auli', name: 'Auli Ski Resort', subtitle: 'Himalayan Meadows & Ski Slopes', category: 'Alpine Resort', corridorId: 'badrinath', coords: [30.5312, 79.5670], altitudeM: 2800, altitude: '2,800m', amenities: ['stay'] },
  { id: 'govindghat', name: 'Govindghat Base', subtitle: 'Valley of Flowers / Hemkund Base', category: 'Trek Base', corridorId: 'badrinath', coords: [30.6250, 79.5480], altitudeM: 1828, altitude: '1,828m', amenities: ['fuel', 'stay'] },
  { id: 'badrinath', name: 'Badrinath Dham', subtitle: 'Sacred Alaknanda Shrine & Mana', category: 'Sacred Dham', corridorId: 'badrinath', coords: [30.7465, 79.4942], altitudeM: 3300, altitude: '3,300m', amenities: ['medical', 'stay'] },

  // Mandakini / Kedarnath Highway (NH-107)
  { id: 'augustmuni', name: 'Augustmuni Helipad', subtitle: 'Heli Operations Base', category: 'Mandakini Valley', corridorId: 'kedarnath', coords: [30.3950, 79.0230], altitudeM: 920, altitude: '920m', amenities: ['fuel', 'stay'] },
  { id: 'kund', name: 'Kund (Chopta Fork)', subtitle: 'Tungnath Trek Divergence', category: 'Mandakini Valley', corridorId: 'kedarnath', coords: [30.4900, 79.0600], altitudeM: 1050, altitude: '1,050m', amenities: ['fuel', 'stay'] },
  { id: 'chopta', name: 'Chopta & Tungnath', subtitle: 'Mini Switzerland & Highest Shiva Shrine', category: 'Alpine Trek', corridorId: 'kedarnath', coords: [30.4854, 79.1866], altitudeM: 2680, altitude: '2,680m', amenities: ['stay'] },
  { id: 'guptkashi', name: 'Guptkashi Base', subtitle: 'Transit & Temple Town', category: 'Mandakini Valley', corridorId: 'kedarnath', coords: [30.5200, 79.0800], altitudeM: 1320, altitude: '1,320m', amenities: ['fuel', 'medical', 'stay'] },
  { id: 'phata', name: 'Phata Heliport Hub', subtitle: 'Major Kedarnath Heliport', category: 'Heli Base', corridorId: 'kedarnath', coords: [30.5560, 79.0960], altitudeM: 1640, altitude: '1,640m', amenities: ['stay'] },
  { id: 'sonprayag', name: 'Sonprayag Barrier', subtitle: 'Biometric Checkpost & Taxi Stand', category: 'Transit Gate', corridorId: 'kedarnath', coords: [30.6040, 79.0990], altitudeM: 1829, altitude: '1,829m', amenities: ['medical', 'stay'] },
  { id: 'gaurikund', name: 'Gaurikund Trek Gate', subtitle: 'Hot Springs & 16km Trek Start', category: 'Trek Base', corridorId: 'kedarnath', coords: [30.6510, 79.1040], altitudeM: 1982, altitude: '1,982m', amenities: ['medical', 'stay'] },
  { id: 'kedarnath', name: 'Kedarnath Dham', subtitle: 'High Himalayan Jyotirlinga Shrine', category: 'Sacred Dham', corridorId: 'kedarnath', coords: [30.7352, 79.0669], altitudeM: 3583, altitude: '3,583m', amenities: ['medical', 'stay'] },

  // Kumaon Lakes & Heights Route (NH-309)
  { id: 'nainital', name: 'Nainital / Bhimtal', subtitle: 'Lake District Hub', category: 'Kumaon Lakes', corridorId: 'kumaon', coords: [29.3437, 79.5677], altitudeM: 1370, altitude: '1,370m', amenities: ['fuel', 'medical', 'stay'] },
  { id: 'almora', name: 'Almora Cultural Hub', subtitle: 'Heritage Town & Ridge Vista', category: 'Kumaon Heights', corridorId: 'kumaon', coords: [29.5971, 79.6591], altitudeM: 1638, altitude: '1,638m', amenities: ['fuel', 'medical', 'stay'] },
  { id: 'kausani', name: 'Kausani Sunrise Vista', subtitle: 'Trisul-Nanda Devi Panorama', category: 'Kumaon Heights', corridorId: 'kumaon', coords: [29.8390, 79.5970], altitudeM: 1890, altitude: '1,890m', amenities: ['fuel', 'stay'] },
  { id: 'bageshwar', name: 'Bageshwar Sangam', subtitle: 'Saryu-Gomti Sacred Junction', category: 'Kumaon Valley', corridorId: 'kumaon', coords: [29.8380, 79.7720], altitudeM: 960, altitude: '960m', amenities: ['fuel', 'medical', 'stay'] },
  { id: 'munsiyari', name: 'Munsiyari Panchachuli', subtitle: '5 Peaks Vista & Milam Glacier Base', category: 'Alpine Frontier', corridorId: 'kumaon', coords: [30.0670, 80.2390], altitudeM: 2200, altitude: '2,200m', amenities: ['fuel', 'medical', 'stay'] },

  // Glacier Corridor (NH-134 & NH-108)
  { id: 'mussoorie', name: 'Mussoorie Queen of Hills', subtitle: 'Mountain Ridge Gateway', category: 'Ridge Gateway', corridorId: 'glacier', coords: [30.4539, 78.0644], altitudeM: 2000, altitude: '2,000m', amenities: ['fuel', 'medical', 'stay'] },
  { id: 'barkot', name: 'Barkot Yamuna Base', subtitle: 'Yamunotri Staging Station', category: 'Glacier Valley', corridorId: 'glacier', coords: [30.8120, 78.2080], altitudeM: 1220, altitude: '1,220m', amenities: ['fuel', 'stay'] },
  { id: 'yamunotri', name: 'Yamunotri Dham', subtitle: 'Sacred Source of Yamuna River', category: 'Sacred Dham', corridorId: 'glacier', coords: [31.0140, 78.4600], altitudeM: 3293, altitude: '3,293m', amenities: ['medical', 'stay'] },
  { id: 'uttarkashi', name: 'Uttarkashi Mountaineering', subtitle: 'Nehru Institute of Mountaineering', category: 'Glacier Valley', corridorId: 'glacier', coords: [30.7248, 78.4464], altitudeM: 1165, altitude: '1,165m', amenities: ['fuel', 'medical', 'stay'] },
  { id: 'harsil', name: 'Harsil Apple Valley', subtitle: 'Bhagirathi Alpine Pine Hamlet', category: 'Alpine Valley', corridorId: 'glacier', coords: [31.1400, 78.7200], altitudeM: 2620, altitude: '2,620m', amenities: ['stay'] },
  { id: 'gangotri', name: 'Gangotri Glacier Source', subtitle: 'Sacred Origin of River Ganga', category: 'Sacred Dham', corridorId: 'glacier', coords: [30.9940, 79.0706], altitudeM: 3048, altitude: '3,048m', amenities: ['medical', 'stay'] },

  // Eastern Frontier / Adi Kailash (NH-9)
  { id: 'pithoragarh', name: 'Pithoragarh District Hub', subtitle: 'Saur Valley & Mini Kashmir', category: 'Border District', corridorId: 'adikailash', coords: [29.5820, 80.2180], altitudeM: 1814, altitude: '1,814m', amenities: ['fuel', 'medical', 'stay'] },
  { id: 'dharchula', name: 'Dharchula ILP Checkpost', subtitle: 'Kali River Border & Permit Point', category: 'ILP Checkpoint', corridorId: 'adikailash', coords: [29.8570, 80.5280], altitudeM: 915, altitude: '915m', amenities: ['fuel', 'medical', 'stay'] },
  { id: 'gunji', name: 'Gunji Adi Kailash Jnc', subtitle: 'Om Parvat & Kailash Route Fork', category: 'High Border', corridorId: 'adikailash', coords: [30.2700, 80.9900], altitudeM: 3050, altitude: '3,050m', amenities: ['medical', 'stay'] },
  { id: 'valleyofflowers', name: 'Valley of Flowers', subtitle: 'UNESCO Floral Valley & Hemkund', category: 'Floral Valley', corridorId: 'badrinath', coords: [30.7280, 79.6053], altitudeM: 3658, altitude: '3,658m', amenities: ['stay'] },
];

// ─── 5 Himalayan Corridors & Highways ────────────────────────
export const HIMALAYAN_CORRIDORS = {
  badrinath: {
    id: 'badrinath',
    name: 'NH-07 Badrinath & Auli Corridor',
    code: 'L1',
    color: '#0f3d2e',
    duration: '9-10 hrs drive',
    totalKm: '298 km',
    highway: 'NH-07 (All-Weather Highway)',
    description: 'Haridwar/Rishikesh railheads to Devprayag, Joshimath, Auli & Badrinath.',
    altitudeRange: '314m → 3,300m',
    status: '🟢 Open & Clear',
    stations: [
      { name: 'Haridwar Railhead Hub', coords: [29.9457, 78.1642], role: 'Entry Railhead & UTC Bus Base', distance: '0 km', altitude: '314m', amenities: ['fuel', 'medical', 'stay'] },
      { name: 'Rishikesh Yog Nagari', coords: [30.0869, 78.2676], role: 'Gateway Hub & Taxi Stand', distance: '24 km', altitude: '372m', amenities: ['fuel', 'medical', 'stay'] },
      { name: 'Devprayag Sangam', coords: [30.1459, 78.5990], role: 'Bhagirathi & Alaknanda Meet', distance: '70 km', altitude: '618m', amenities: ['fuel', 'stay'] },
      { name: 'Srinagar Garhwal', coords: [30.2227, 78.7844], role: 'Regional Hospital & Fuel Stop', distance: '105 km', altitude: '560m', amenities: ['fuel', 'medical', 'stay'] },
      { name: 'Rudraprayag Junction', coords: [30.2858, 78.9811], role: 'Kedarnath / Badrinath Fork', distance: '140 km', altitude: '895m', amenities: ['fuel', 'stay'] },
      { name: 'Karnaprayag & Chamoli', coords: [30.4070, 79.3364], role: 'Mid-Valley Transit Station', distance: '190 km', altitude: '1,150m', amenities: ['fuel', 'medical'] },
      { name: 'Joshimath & Auli Base', coords: [30.5564, 79.5661], role: 'Cable Car & Military Base', distance: '253 km', altitude: '1,890m', amenities: ['fuel', 'medical', 'stay'] },
      { name: 'Govindghat (Valley Base)', coords: [30.6250, 79.5480], role: 'Valley of Flowers Trek Gate', distance: '272 km', altitude: '1,828m', amenities: ['stay'] },
      { name: 'Badrinath Dham', coords: [30.7465, 79.4942], role: 'Sacred Alaknanda Shrine & Mana', distance: '298 km', altitude: '3,300m', amenities: ['medical', 'stay'] },
    ],
    polyline: [[29.9457, 78.1642],[30.0869, 78.2676],[30.1459, 78.5990],[30.2227, 78.7844],[30.2858, 78.9811],[30.2605, 79.2173],[30.4070, 79.3364],[30.5564, 79.5661],[30.6250, 79.5480],[30.7465, 79.4942]]
  },
  kedarnath: {
    id: 'kedarnath',
    name: 'NH-107 Mandakini Kedarnath Highway',
    code: 'L2',
    color: '#0f3d2e',
    duration: '8 hrs drive + 6 hrs trek',
    totalKm: '235 km',
    highway: 'NH-107 Mandakini River Corridor',
    description: 'Haridwar to Rudraprayag, Guptkashi, Sonprayag checkpost & Kedarnath.',
    altitudeRange: '314m → 3,583m',
    status: '🟢 Open — Sonprayag gate operating normally',
    stations: [
      { name: 'Haridwar / Rishikesh', coords: [29.9457, 78.1642], role: 'Base Entry Railhead', distance: '0 km', altitude: '314m', amenities: ['fuel', 'medical', 'stay'] },
      { name: 'Devprayag Sangam', coords: [30.1459, 78.5990], role: 'Sacred River Confluence', distance: '70 km', altitude: '618m', amenities: ['fuel', 'stay'] },
      { name: 'Rudraprayag Junction', coords: [30.2858, 78.9811], role: 'Turn onto NH-107 Mandakini', distance: '140 km', altitude: '895m', amenities: ['fuel', 'stay'] },
      { name: 'Guptkashi & Phata', coords: [30.5200, 79.0800], role: 'Helipads, Homestays & Fuel', distance: '180 km', altitude: '1,320m', amenities: ['fuel', 'medical', 'stay'] },
      { name: 'Sonprayag Barrier', coords: [30.6040, 79.0990], role: 'Biometric Checkpost & Shuttle Terminus', distance: '210 km', altitude: '1,829m', amenities: ['medical', 'stay'] },
      { name: 'Gaurikund Trek Base', coords: [30.6510, 79.1040], role: 'Hot Springs & 16km Trek Start', distance: '215 km', altitude: '1,982m', amenities: ['medical', 'stay'] },
      { name: 'Kedarnath Dham', coords: [30.7352, 79.0669], role: 'Sacred Jyotirlinga Shrine & Camps', distance: '231 km', altitude: '3,583m', amenities: ['medical', 'stay'] },
    ],
    polyline: [[29.9457, 78.1642],[30.1459, 78.5990],[30.2858, 78.9811],[30.3950, 79.0230],[30.4900, 79.0600],[30.5200, 79.0800],[30.5560, 79.0960],[30.6040, 79.0990],[30.6510, 79.1040],[30.7352, 79.0669]]
  },
  kumaon: {
    id: 'kumaon',
    name: 'NH-309 Kumaon Lakes & Heights Route',
    code: 'L3',
    color: '#0284c7',
    duration: '10 hrs scenic drive',
    totalKm: '280 km',
    highway: 'NH-309 Kumaon Ridge Highway',
    description: 'Kathgodam railhead to Nainital, Almora, Kausani and Munsiyari.',
    altitudeRange: '554m → 2,200m',
    status: '🟢 All Routes Clear & Scenic',
    stations: [
      { name: 'Kathgodam Railhead', coords: [29.2182, 79.5267], role: 'Kumaon Entry Railhead', distance: '0 km', altitude: '554m', amenities: ['fuel', 'medical', 'stay'] },
      { name: 'Nainital / Bhimtal', coords: [29.3437, 79.5677], role: 'Lake District Hub', distance: '34 km', altitude: '1,370m', amenities: ['fuel', 'medical', 'stay'] },
      { name: 'Almora Cultural Hub', coords: [29.5971, 79.6591], role: 'Heritage Ridge & Crafts', distance: '90 km', altitude: '1,638m', amenities: ['fuel', 'medical', 'stay'] },
      { name: 'Kausani Sunrise Vista', coords: [29.8390, 79.5970], role: 'Panoramic Himalayan Vista', distance: '142 km', altitude: '1,890m', amenities: ['stay'] },
      { name: 'Bageshwar Sangam', coords: [29.8380, 79.7720], role: 'Saryu-Gomti Sacred Junction', distance: '180 km', altitude: '960m', amenities: ['fuel', 'stay'] },
      { name: 'Munsiyari Panchachuli', coords: [30.0670, 80.2390], role: '5 Peaks Vista & Trek Base', distance: '280 km', altitude: '2,200m', amenities: ['fuel', 'medical', 'stay'] },
    ],
    polyline: [[29.2182, 79.5267],[29.3437, 79.5677],[29.5971, 79.6591],[29.8390, 79.5970],[29.8380, 79.7720],[30.0670, 80.2390]]
  },
  glacier: {
    id: 'glacier',
    name: 'NH-108 Gangotri & Yamunotri Glacier Route',
    code: 'L4',
    color: '#d97706',
    duration: '8-9 hrs mountain drive',
    totalKm: '260 km',
    highway: 'NH-108 Bhagirathi Valley Corridor',
    description: 'Dehradun capital to Mussoorie, Uttarkashi, Harsil and Gangotri origin.',
    altitudeRange: '447m → 3,048m',
    status: '🟢 Open — Normal Traffic',
    stations: [
      { name: 'Dehradun Capital Hub', coords: [30.3165, 78.0322], role: 'ISBT & Airport Gateway', distance: '0 km', altitude: '447m', amenities: ['fuel', 'medical', 'stay'] },
      { name: 'Mussoorie Queen of Hills', coords: [30.4539, 78.0644], role: 'Mountain Ridge Gateway', distance: '35 km', altitude: '2,000m', amenities: ['fuel', 'medical', 'stay'] },
      { name: 'Uttarkashi Base', coords: [30.7248, 78.4464], role: 'District HQ & NIM Base', distance: '145 km', altitude: '1,165m', amenities: ['fuel', 'medical', 'stay'] },
      { name: 'Harsil Apple Valley', coords: [31.1400, 78.7200], role: 'Alpine Hamlet & Pine Forest', distance: '215 km', altitude: '2,620m', amenities: ['stay'] },
      { name: 'Gangotri Glacier Source', coords: [30.9940, 79.0706], role: 'Sacred Origin of River Ganga', distance: '260 km', altitude: '3,048m', amenities: ['medical', 'stay'] },
    ],
    polyline: [[30.3165, 78.0322],[30.4539, 78.0644],[30.7248, 78.4464],[31.1400, 78.7200],[30.9940, 79.0706]]
  },
  adikailash: {
    id: 'adikailash',
    name: 'NH-9 Adi Kailash & Om Parvat Border Route',
    code: 'L5',
    color: '#ca8a04',
    duration: '14 hrs (Inner Line Permit Req.)',
    totalKm: '325 km',
    highway: 'NH-9 Pithoragarh Border Highway',
    description: 'Tanakpur to Pithoragarh, Dharchula ILP checkpost and Gunji.',
    altitudeRange: '280m → 3,050m',
    status: '🟡 Open (ILP Permit Required)',
    stations: [
      { name: 'Tanakpur Railhead', coords: [29.0700, 80.1100], role: 'Eastern Railhead Gateway', distance: '0 km', altitude: '280m', amenities: ['fuel', 'medical', 'stay'] },
      { name: 'Pithoragarh District Hub', coords: [29.5820, 80.2180], role: 'Permit Office & Base', distance: '150 km', altitude: '1,814m', amenities: ['fuel', 'medical', 'stay'] },
      { name: 'Dharchula ILP Checkpost', coords: [29.8570, 80.5280], role: 'Border Verification Gate', distance: '240 km', altitude: '915m', amenities: ['medical', 'stay'] },
      { name: 'Gunji Adi Kailash Jnc', coords: [30.2700, 80.9900], role: 'Om Parvat & Sacred Base', distance: '325 km', altitude: '3,050m', amenities: ['medical', 'stay'] },
    ],
    polyline: [[29.0700, 80.1100],[29.5820, 80.2180],[29.8570, 80.5280],[30.2700, 80.9900]]
  }
};

// ─── Direct Searchable Station Input with Autocomplete ─────────
function SearchableStationSelect({ label, value, onChange, placeholder, icon: IconComponent }) {
  const selectedStation = ALL_STATIONS.find((s) => s.id === value) || ALL_STATIONS[0];
  const [query, setQuery] = useState(selectedStation.name);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(selectedStation.name);
  }, [selectedStation.id, selectedStation.name]);

  const filteredStations = useMemo(() => {
    if (!query.trim()) return ALL_STATIONS;
    const q = query.toLowerCase().trim();
    return ALL_STATIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.subtitle.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
        setQuery(selectedStation.name);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedStation.name]);

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
        {label}
      </label>

      <div className="relative flex items-center bg-white rounded-xl border border-stone-200 hover:border-[#0f3d2e]/50 focus-within:border-[#0f3d2e] focus-within:ring-2 focus-within:ring-[#0f3d2e]/15 transition-all shadow-2xs">
        <span className="pl-3 text-[#0f3d2e] shrink-0">
          <IconComponent size={15} />
        </span>
        <input
          type="text"
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsFocused(true);
          }}
          placeholder={placeholder || 'Search place or station...'}
          className="w-full pl-2.5 pr-8 py-2.5 text-xs font-bold text-stone-900 bg-transparent focus:outline-none placeholder:text-stone-400 placeholder:font-normal"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsFocused(true);
            }}
            className="absolute right-2.5 p-0.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition cursor-pointer"
            title="Clear"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between text-[10px] text-stone-500 px-1">
        <span className="truncate">📍 {selectedStation.subtitle}</span>
        <span className="font-bold text-[#0f3d2e] shrink-0 ml-1">{selectedStation.altitude}</span>
      </div>

      {isFocused && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            <span>Select Mountain Station</span>
            <span>{filteredStations.length} found</span>
          </div>

          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-stone-50">
            {filteredStations.length === 0 ? (
              <div className="p-3 text-center text-xs text-stone-400">
                No matching places found
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
                      setQuery(station.name);
                      setIsFocused(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
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
                      <p className="text-[10px] text-stone-400 truncate">{station.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 shrink-0">
                      {station.altitude}
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
 * Redesigned TransitRouteDrawer — Clean, Thoughtful Mountain Route Navigator
 */
export default function TransitRouteDrawer({
  isOpen,
  onClose,
  activeCorridorId,
  onSelectCorridor,
  onFlyToCorridor,
  routeTarget,
}) {
  const navigate = useNavigate();
  const [fromLocation, setFromLocation] = useState('haridwar');
  const [toLocation, setToLocation] = useState('kedarnath');
  const [selectedTab, setSelectedTab] = useState('route'); // 'route' | 'corridors'

  // Handle routeTarget from Map Marker popup click
  useEffect(() => {
    if (routeTarget?.place) {
      const plName = (routeTarget.place.name || '').toLowerCase();
      const match = ALL_STATIONS.find(
        (s) => plName.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(plName)
      );
      if (match) {
        if (routeTarget.direction === 'from') {
          setFromLocation(match.id);
        } else {
          setToLocation(match.id);
        }
      }
      setSelectedTab('route');
    }
  }, [routeTarget]);

  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const destStation = useMemo(() => {
    return ALL_STATIONS.find((s) => s.id === toLocation) || ALL_STATIONS.find((s) => s.id === 'kedarnath');
  }, [toLocation]);

  const originStation = useMemo(() => {
    return ALL_STATIONS.find((s) => s.id === fromLocation) || ALL_STATIONS.find((s) => s.id === 'haridwar');
  }, [fromLocation]);

  const activeCorridor = useMemo(() => {
    const corridorKey = destStation.corridorId || originStation.corridorId || 'kedarnath';
    return HIMALAYAN_CORRIDORS[corridorKey] || HIMALAYAN_CORRIDORS.kedarnath;
  }, [destStation, originStation]);

  const elevationGain = useMemo(() => {
    const start = originStation.altitudeM || 314;
    const end = destStation.altitudeM || 3583;
    return end - start;
  }, [originStation, destStation]);

  const handleShowOnMap = (targetCoords) => {
    onSelectCorridor(activeCorridor.id);
    if (onFlyToCorridor) {
      if (targetCoords) {
        onFlyToCorridor(targetCoords);
      } else {
        onFlyToCorridor(activeCorridor.id);
      }
    }
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleOpenTripPlanner = () => {
    navigate(`/trip-planner?dest=${encodeURIComponent(destStation.name)}&origin=${encodeURIComponent(originStation.name)}`, {
      state: {
        destination: destStation.name,
        origin: originStation.name,
        corridor: activeCorridor.name,
      }
    });
  };

  const googleMapsUrl = useMemo(() => {
    const origParam = originStation.coords
      ? `${originStation.coords[0]},${originStation.coords[1]}`
      : encodeURIComponent(`${originStation.name}, Uttarakhand`);
    const destParam = destStation.coords
      ? `${destStation.coords[0]},${destStation.coords[1]}`
      : encodeURIComponent(`${destStation.name}, Uttarakhand`);

    return `https://www.google.com/maps/dir/?api=1&origin=${origParam}&destination=${destParam}&travelmode=driving`;
  }, [originStation, destStation]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[1090] md:hidden"
        onClick={onClose}
      />

      {/* Right Slide-over Panel */}
      <aside
        className="fixed inset-x-0 bottom-0 md:bottom-0 md:top-16 lg:top-20 md:right-0 md:left-auto z-[1100] w-full md:max-w-[460px] max-h-[88vh] md:max-h-[calc(100vh-64px)] lg:max-h-[calc(100vh-80px)] h-auto md:h-full bg-white shadow-2xl border-t md:border-t-0 md:border-l border-stone-200 flex flex-col font-sans text-stone-900 rounded-t-3xl md:rounded-none select-none overflow-hidden"
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-2.5 mb-1 md:hidden" />

        {/* ── Top Header ── */}
        <div className="px-5 py-3.5 bg-white border-b border-stone-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#0f3d2e] flex items-center justify-center text-white shadow-xs shrink-0">
              <Navigation size={18} className="text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-stone-900 truncate">Himalayan Route Navigator</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Routes
                </span>
              </div>
              <p className="text-[11px] text-stone-500">Pick starting point &amp; destination for live waypoints</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Tab Switcher: Route & Waypoints vs 5 Corridors ── */}
        <div className="grid grid-cols-2 border-b border-stone-100 bg-stone-50/60 p-1.5 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setSelectedTab('route')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedTab === 'route'
                ? 'bg-white text-[#0f3d2e] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Compass size={14} className={selectedTab === 'route' ? 'text-[#0f3d2e]' : 'text-stone-400'} />
            <span>Route &amp; Waypoints</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('corridors')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedTab === 'corridors'
                ? 'bg-white text-[#0f3d2e] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers size={14} className={selectedTab === 'corridors' ? 'text-[#0f3d2e]' : 'text-stone-400'} />
            <span>5 Mountain Corridors</span>
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedTab === 'route' ? (
            <>
              {/* 1. Popular 1-Tap Mountain Routes */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                  Popular Route Shortcuts:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { label: 'Kedarnath', from: 'haridwar', to: 'kedarnath' },
                    { label: 'Badrinath & Auli', from: 'haridwar', to: 'badrinath' },
                    { label: 'Chopta & Tungnath', from: 'rishikesh', to: 'chopta' },
                    { label: 'Valley of Flowers', from: 'rishikesh', to: 'valleyofflowers' },
                    { label: 'Nainital & Kumaon', from: 'kathgodam', to: 'nainital' },
                    { label: 'Munsiyari 5 Peaks', from: 'kathgodam', to: 'munsiyari' },
                    { label: 'Gangotri Glacier', from: 'dehradun', to: 'gangotri' },
                  ].map((p, i) => {
                    const isSelected = fromLocation === p.from && toLocation === p.to;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setFromLocation(p.from);
                          setToLocation(p.to);
                        }}
                        className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full border transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#0f3d2e] text-white border-[#0f3d2e] shadow-xs'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. From -> To Journey Selector Card */}
              <div className="bg-[#fcfbf9] rounded-2xl border border-stone-200/90 p-4 space-y-3 shadow-2xs">
                {/* FROM Input */}
                <SearchableStationSelect
                  label="From — Starting Point / Railhead"
                  value={fromLocation}
                  onChange={setFromLocation}
                  placeholder="Haridwar, Rishikesh, Dehradun, Delhi..."
                  icon={MapPin}
                />

                {/* Central Swap Button */}
                <div className="flex justify-center -my-1 relative z-10">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="w-8 h-8 rounded-full bg-white border border-stone-200 shadow-xs hover:bg-emerald-50 hover:border-emerald-300 text-stone-500 hover:text-[#0f3d2e] flex items-center justify-center transition cursor-pointer"
                    title="Swap Origin & Destination (Return Trip)"
                  >
                    <ArrowLeftRight size={13} className="rotate-90" />
                  </button>
                </div>

                {/* TO Input */}
                <SearchableStationSelect
                  label="To — Mountain Destination / Shrine"
                  value={toLocation}
                  onChange={setToLocation}
                  placeholder="Kedarnath, Badrinath, Auli, Chopta..."
                  icon={Mountain}
                />
              </div>

              {/* 3. High-Value Route Summary Hero Card */}
              <div className="bg-gradient-to-br from-emerald-50/70 via-white to-stone-50 rounded-2xl border border-emerald-200/70 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                    <span className="text-xs font-extrabold text-stone-900">{activeCorridor.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                    {activeCorridor.highway}
                  </span>
                </div>

                {/* 3 Key Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-stone-150 shadow-2xs">
                    <span className="text-[10px] font-bold text-stone-400 block">Distance</span>
                    <span className="text-xs font-black text-stone-900">{activeCorridor.totalKm}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-stone-150 shadow-2xs">
                    <span className="text-[10px] font-bold text-stone-400 block">Travel Time</span>
                    <span className="text-xs font-black text-stone-900">{activeCorridor.duration}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-stone-150 shadow-2xs">
                    <span className="text-[10px] font-bold text-stone-400 block">Altitude Gain</span>
                    <span className="text-xs font-black text-emerald-800">
                      {elevationGain >= 0 ? `+${elevationGain}m` : `${elevationGain}m`}
                    </span>
                  </div>
                </div>

                {/* Live Road Status Banner */}
                <div className="bg-white/90 border border-emerald-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-bold text-stone-700 truncate">{activeCorridor.status}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleShowOnMap()}
                    className="text-[11px] font-bold text-[#0f3d2e] hover:underline shrink-0 cursor-pointer"
                  >
                    View Corridor →
                  </button>
                </div>
              </div>

              {/* 4. Step-by-Step Waypoint Stops (Vertical Journey Timeline) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#0f3d2e]" />
                    <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
                      Journey Waypoints &amp; Stops
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                    {activeCorridor.stations.length} Key Stops
                  </span>
                </div>

                {/* Timeline Container */}
                <div className="relative pl-4 space-y-3 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-[2px] before:bg-emerald-200">
                  {activeCorridor.stations.map((station, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === activeCorridor.stations.length - 1;
                    return (
                      <div
                        key={idx}
                        className="relative flex items-start gap-3 group"
                      >
                        {/* Bullet Circle */}
                        <div
                          className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ring-4 ${
                            isLast
                              ? 'bg-rose-500 ring-rose-100'
                              : isFirst
                              ? 'bg-[#0f3d2e] ring-emerald-100'
                              : 'bg-emerald-600 ring-emerald-50'
                          }`}
                        />

                        {/* Station Info Box */}
                        <div className="flex-1 bg-white p-3 rounded-xl border border-stone-200/80 hover:border-emerald-300 shadow-2xs transition-all flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-900 truncate">{station.name}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 shrink-0">
                                {station.distance}
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-500 mt-0.5 truncate">{station.role}</p>
                            <div className="flex items-center gap-2 mt-1 text-[9px] text-stone-400 font-medium">
                              <span>⛰️ {station.altitude}</span>
                              {station.amenities && (
                                <span>• {station.amenities.join(', ')}</span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleShowOnMap(station.coords)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-[#0f3d2e] text-[#0f3d2e] hover:text-white text-[10px] font-bold transition cursor-pointer shrink-0 shadow-2xs"
                            title={`Focus ${station.name} on map`}
                          >
                            Zoom
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. Essential Mountain Travel Advisories */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl space-y-1.5 text-[11px] text-amber-900">
                <div className="flex items-center gap-1.5 font-extrabold">
                  <AlertTriangle size={13} className="text-amber-700" />
                  <span>Important Mountain Travel Guidelines:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-amber-800 font-medium">
                  <li>Mandatory Biometric Registration at <span className="underline font-bold">registrationandtouristcare.uk.gov.in</span></li>
                  <li>No night highway driving across high passes after 8:00 PM</li>
                  <li>Emergency Helplines: <span className="font-bold">1070</span> (Disaster) | <span className="font-bold">112</span> (Police)</li>
                </ul>
              </div>

              {/* 6. Primary Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleShowOnMap()}
                  className="w-full py-3 px-4 rounded-xl bg-[#0f3d2e] hover:bg-[#15543f] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Navigation size={15} className="text-emerald-400" />
                  <span>Highlight Complete Route on Map</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleOpenTripPlanner}
                    className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0f3d2e] border border-emerald-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={13} className="text-emerald-700" />
                    <span>Trip Planner</span>
                  </button>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <ExternalLink size={13} className="text-stone-500" />
                    <span>Google Maps</span>
                  </a>
                </div>
              </div>
            </>
          ) : (
            /* ─── 5 Mountain Corridors Tab ─── */
            <div className="space-y-3">
              <p className="text-xs text-stone-500 font-medium">
                Uttarakhand state transport divides mountain movement into 5 primary highway corridors:
              </p>

              <div className="space-y-2.5">
                {Object.values(HIMALAYAN_CORRIDORS).map((line) => {
                  const isActive = activeCorridor.id === line.id;
                  return (
                    <div
                      key={line.id}
                      onClick={() => handleShowOnMap(line.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50/80 border-[#0f3d2e]/40 ring-2 ring-[#0f3d2e]/20 shadow-xs'
                          : 'bg-white hover:bg-stone-50 border-stone-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: line.color }}
                          />
                          <span className="text-xs font-black text-stone-900">{line.name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                          {line.code}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">{line.description}</p>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-100 text-[10px] font-bold text-stone-500">
                        <span>⏱️ {line.duration}</span>
                        <span>🛣️ {line.totalKm}</span>
                        <span className={`font-black ${isActive ? 'text-[#0f3d2e]' : 'text-stone-400'}`}>
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
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Shield size={13} className="text-[#0f3d2e]" />
            <span className="font-semibold text-stone-600">Verified Uttarakhand GIS</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs cursor-pointer transition shadow-2xs"
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
          weight: 14,
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
          weight: 5,
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
          radius={idx === 0 || idx === corridor.stations.length - 1 ? 8 : 6}
          pathOptions={{
            color: '#ffffff',
            weight: 2,
            fillColor:
              idx === corridor.stations.length - 1
                ? '#e11d48'
                : idx === 0
                ? '#0f3d2e'
                : '#059669',
            fillOpacity: 1,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <div className="p-1 font-sans text-xs">
              <strong className="text-slate-900 font-bold">{st.name}</strong>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {st.role} • ⛰️ {st.altitude}
              </div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
