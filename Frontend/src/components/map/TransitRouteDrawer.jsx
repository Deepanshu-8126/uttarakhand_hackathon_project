import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navigation,
  Mountain,
  ArrowLeftRight,
  Clock,
  MapPin,
  X,
  Compass,
  PhoneCall,
  Train,
  Bus,
  Car,
  Footprints,
  Shield,
  CheckCircle2,
  Layers,
  ChevronDown,
  Copy,
  Check,
  Fuel,
  CreditCard,
  Building2,
  Activity,
  Wind,
  Sun,
  Share2,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';

// ─── Complete Mountain Stations & Gateways ────────────────────
export const ALL_STATIONS = [
  // Major Gateways & Railheads
  { id: 'haridwar', name: 'Haridwar Railhead', subtitle: 'Garhwal Entry Hub', category: 'Gateway Railhead', corridorId: 'badrinath', coords: [29.9457, 78.1642], altitudeM: 314, altitude: '314m', amenities: ['fuel', 'atm', 'medical', 'stay'] },
  { id: 'rishikesh', name: 'Rishikesh Yog Nagari', subtitle: 'Char Dham Rail Terminal', category: 'Gateway Railhead', corridorId: 'badrinath', coords: [30.0869, 78.2676], altitudeM: 372, altitude: '372m', amenities: ['fuel', 'atm', 'medical', 'stay'] },
  { id: 'delhi', name: 'New Delhi (NCR)', subtitle: 'National Air & Rail Gateway', category: 'Metropolitan Gateway', corridorId: 'kedarnath', coords: [28.6139, 77.2090], altitudeM: 216, altitude: '216m', amenities: ['fuel', 'atm', 'medical', 'stay'] },
  { id: 'dehradun', name: 'Dehradun Capital Hub', subtitle: 'Airport & ISBT Terminal', category: 'Capital Gateway', corridorId: 'glacier', coords: [30.3165, 78.0322], altitudeM: 447, altitude: '447m', amenities: ['fuel', 'atm', 'medical', 'stay'] },
  { id: 'kathgodam', name: 'Kathgodam Railhead', subtitle: 'Kumaon Entry Gateway', category: 'Gateway Railhead', corridorId: 'kumaon', coords: [29.2182, 79.5267], altitudeM: 554, altitude: '554m', amenities: ['fuel', 'atm', 'medical', 'stay'] },
  { id: 'tanakpur', name: 'Tanakpur Railhead', subtitle: 'Eastern Border Gateway', category: 'Gateway Railhead', corridorId: 'adikailash', coords: [29.0700, 80.1100], altitudeM: 280, altitude: '280m', amenities: ['fuel', 'atm', 'medical', 'stay'] },

  // Garhwal / Alaknanda Valley Stations (NH-07)
  { id: 'devprayag', name: 'Devprayag Sangam', subtitle: 'Bhagirathi & Alaknanda Meet', category: 'Garhwal Valley', corridorId: 'badrinath', coords: [30.1459, 78.5990], altitudeM: 618, altitude: '618m', amenities: ['fuel', 'atm', 'stay'] },
  { id: 'srinagar', name: 'Srinagar Garhwal Hub', subtitle: 'Regional Medical & Bus Base', category: 'Garhwal Valley', corridorId: 'badrinath', coords: [30.2227, 78.7844], altitudeM: 560, altitude: '560m', amenities: ['fuel', 'atm', 'medical', 'stay'] },
  { id: 'rudraprayag', name: 'Rudraprayag Junction', subtitle: 'Kedarnath-Badrinath Fork', category: 'Major Interchange', corridorId: 'badrinath', coords: [30.2858, 78.9811], altitudeM: 895, altitude: '895m', amenities: ['fuel', 'atm', 'medical', 'stay'] },
  { id: 'karnaprayag', name: 'Karnaprayag Sangam', subtitle: 'Pindar & Alaknanda Confluence', category: 'Garhwal Valley', corridorId: 'badrinath', coords: [30.2605, 79.2173], altitudeM: 1451, altitude: '1,451m', amenities: ['fuel', 'atm', 'stay'] },
  { id: 'chamoli', name: 'Chamoli District Base', subtitle: 'Valley Transit Post', category: 'Garhwal Valley', corridorId: 'badrinath', coords: [30.4070, 79.3364], altitudeM: 1150, altitude: '1,150m', amenities: ['fuel', 'atm', 'medical', 'stay'] },
  { id: 'joshimath', name: 'Joshimath Auli Base', subtitle: 'Cable Car & Military Base', category: 'Alpine Gateway', corridorId: 'badrinath', coords: [30.5564, 79.5661], altitudeM: 1890, altitude: '1,890m', amenities: ['fuel', 'atm', 'medical', 'stay'] },
  { id: 'auli', name: 'Auli Ski Resort', subtitle: 'Himalayan Meadows & Ski Slopes', category: 'Alpine Resort', corridorId: 'badrinath', coords: [30.5312, 79.5670], altitudeM: 2800, altitude: '2,800m', amenities: ['stay'] },
  { id: 'govindghat', name: 'Govindghat Base', subtitle: 'Valley of Flowers / Hemkund Base', category: 'Trek Base', corridorId: 'badrinath', coords: [30.6250, 79.5480], altitudeM: 1828, altitude: '1,828m', amenities: ['fuel', 'atm', 'stay'] },
  { id: 'badrinath', name: 'Badrinath Dham', subtitle: 'Sacred Alaknanda Shrine & Mana', category: 'Sacred Dham', corridorId: 'badrinath', coords: [30.7465, 79.4942], altitudeM: 3300, altitude: '3,300m', amenities: ['atm', 'medical', 'stay'] },

  // Mandakini / Kedarnath Highway (NH-107)
  { id: 'augustmuni', name: 'Augustmuni Helipad', subtitle: 'Heli Operations Base', category: 'Mandakini Valley', corridorId: 'kedarnath', coords: [30.3950, 79.0230], altitudeM: 920, altitude: '920m', amenities: ['fuel', 'atm', 'stay'] },
  { id: 'kund', name: 'Kund (Chopta Fork)', subtitle: 'Tungnath Trek Divergence', category: 'Mandakini Valley', corridorId: 'kedarnath', coords: [30.4900, 79.0600], altitudeM: 1050, altitude: '1,050m', amenities: ['fuel', 'stay'] },
  { id: 'chopta', name: 'Chopta & Tungnath', subtitle: 'Mini Switzerland & Highest Shiva Shrine', category: 'Alpine Trek', corridorId: 'kedarnath', coords: [30.4854, 79.1866], altitudeM: 2680, altitude: '2,680m', amenities: ['stay'] },
  { id: 'guptkashi', name: 'Guptkashi Cultural Base', subtitle: 'Transit & Temple Town', category: 'Mandakini Valley', corridorId: 'kedarnath', coords: [30.5200, 79.0800], altitudeM: 1320, altitude: '1,320m', amenities: ['fuel', 'atm', 'medical', 'stay'] },
  { id: 'phata', name: 'Phata Heliport Hub', subtitle: 'Major Kedarnath Heliport', category: 'Heli Base', corridorId: 'kedarnath', coords: [30.5560, 79.0960], altitudeM: 1640, altitude: '1,640m', amenities: ['atm', 'stay'] },
  { id: 'sonprayag', name: 'Sonprayag Transit Gate', subtitle: 'Biometric Barrier & Taxi Stand', category: 'Transit Gate', corridorId: 'kedarnath', coords: [30.6040, 79.0990], altitudeM: 1829, altitude: '1,829m', amenities: ['atm', 'medical', 'stay'] },
  { id: 'gaurikund', name: 'Gaurikund Trek Base', subtitle: 'Hot Springs & Trek Starting Point', category: 'Trek Base', corridorId: 'kedarnath', coords: [30.6510, 79.1040], altitudeM: 1982, altitude: '1,982m', amenities: ['medical', 'stay'] },
  { id: 'kedarnath', name: 'Kedarnath Dham', subtitle: 'High Himalayan Jyotirlinga', category: 'Sacred Dham', corridorId: 'kedarnath', coords: [30.7352, 79.0669], altitudeM: 3583, altitude: '3,583m', amenities: ['medical', 'stay'] },

  // Kumaon Lakes & Heights Route (NH-309)
  { id: 'nainital', name: 'Nainital / Bhimtal', subtitle: 'Lake District Hub', category: 'Kumaon Lakes', corridorId: 'kumaon', coords: [29.3437, 79.5677], altitudeM: 1370, altitude: '1,370m', amenities: ['fuel', 'atm', 'medical', 'stay'] },
  { id: 'almora', name: 'Almora Cultural Hub', subtitle: 'Heritage Town & Ridge Vista', category: 'Kumaon Heights', corridorId: 'kumaon', coords: [29.5971, 79.6591], altitudeM: 1638, altitude: '1,638m', amenities: ['fuel', 'atm', 'medical', 'stay'] },
  { id: 'kausani', name: 'Kausani Sunrise Vista', subtitle: 'Trisul-Nanda Devi Panorama', category: 'Kumaon Heights', corridorId: 'kumaon', coords: [29.8390, 79.5970], altitudeM: 1890, altitude: '1,890m', amenities: ['fuel', 'stay'] },
  { id: 'bageshwar', name: 'Bageshwar Sangam', subtitle: 'Saryu-Gomti Sacred Junction', category: 'Kumaon Valley', corridorId: 'kumaon', coords: [29.8380, 79.7720], altitudeM: 960, altitude: '960m', amenities: ['fuel', 'atm', 'medical', 'stay'] },
  { id: 'thal', name: 'Thal Junction', subtitle: 'Ramganga River Pass Base', category: 'Kumaon Valley', corridorId: 'kumaon', coords: [29.9630, 80.3750], altitudeM: 895, altitude: '895m', amenities: ['stay'] },
  { id: 'munsiyari', name: 'Munsiyari Panchachuli', subtitle: '5 Peaks Vista & Milam Glacier Base', category: 'Alpine Frontier', corridorId: 'kumaon', coords: [30.0670, 80.2390], altitudeM: 2200, altitude: '2,200m', amenities: ['fuel', 'atm', 'medical', 'stay'] },

  // Glacier Corridor (NH-134 & NH-108)
  { id: 'mussoorie', name: 'Mussoorie Queen of Hills', subtitle: 'Mountain Ridge Gateway', category: 'Ridge Gateway', corridorId: 'glacier', coords: [30.4539, 78.0644], altitudeM: 2000, altitude: '2,000m', amenities: ['fuel', 'atm', 'medical', 'stay'] },
  { id: 'barkot', name: 'Barkot Yamuna Base', subtitle: 'Yamunotri Staging Station', category: 'Glacier Valley', corridorId: 'glacier', coords: [30.8120, 78.2080], altitudeM: 1220, altitude: '1,220m', amenities: ['fuel', 'atm', 'stay'] },
  { id: 'yamunotri', name: 'Yamunotri Dham', subtitle: 'Sacred Source of Yamuna River', category: 'Sacred Dham', corridorId: 'glacier', coords: [31.0140, 78.4600], altitudeM: 3293, altitude: '3,293m', amenities: ['medical', 'stay'] },
  { id: 'uttarkashi', name: 'Uttarkashi Mountaineering', subtitle: 'Nehru Institute of Mountaineering', category: 'Glacier Valley', corridorId: 'glacier', coords: [30.7248, 78.4464], altitudeM: 1165, altitude: '1,165m', amenities: ['fuel', 'atm', 'medical', 'stay'] },
  { id: 'harsil', name: 'Harsil Apple Valley', subtitle: 'Bhagirathi Alpine Pine Hamlet', category: 'Alpine Valley', corridorId: 'glacier', coords: [31.1400, 78.7200], altitudeM: 2620, altitude: '2,620m', amenities: ['atm', 'stay'] },
  { id: 'gangotri', name: 'Gangotri Glacier Source', subtitle: 'Sacred Origin of River Ganga', category: 'Sacred Dham', corridorId: 'glacier', coords: [30.9940, 79.0706], altitudeM: 3048, altitude: '3,048m', amenities: ['medical', 'stay'] },

  // Eastern Frontier / Adi Kailash (NH-9)
  { id: 'pithoragarh', name: 'Pithoragarh District Hub', subtitle: 'Saur Valley & Mini Kashmir', category: 'Border District', corridorId: 'adikailash', coords: [29.5820, 80.2180], altitudeM: 1814, altitude: '1,814m', amenities: ['fuel', 'atm', 'medical', 'stay'] },
  { id: 'dharchula', name: 'Dharchula ILP Checkpost', subtitle: 'Kali River Border & Permit Point', category: 'ILP Checkpoint', corridorId: 'adikailash', coords: [29.8570, 80.5280], altitudeM: 915, altitude: '915m', amenities: ['fuel', 'atm', 'medical', 'stay'] },
  { id: 'gunji', name: 'Gunji Adi Kailash Jnc', subtitle: 'Om Parvat & Kailash Route Fork', category: 'High Border', corridorId: 'adikailash', coords: [30.2700, 80.9900], altitudeM: 3050, altitude: '3,050m', amenities: ['medical', 'stay'] },

  // Famous Trek & Alpine Destinations
  { id: 'dayarabugyal', name: 'Dayara Bugyal Trek', subtitle: 'Alpine Meadow & Barnala (Uttarkashi)', category: 'Alpine Meadow', corridorId: 'glacier', coords: [30.8400, 78.5300], altitudeM: 3048, altitude: '3,048m', amenities: ['stay'] },
  { id: 'valleyofflowers', name: 'Valley of Flowers', subtitle: 'UNESCO Floral Valley & Hemkund', category: 'Floral Valley', corridorId: 'badrinath', coords: [30.7280, 79.6053], altitudeM: 3658, altitude: '3,658m', amenities: ['stay'] },
  { id: 'hemkund', name: 'Hemkund Sahib', subtitle: 'High Glacial Lake Gurudwara', category: 'Sacred Shrine', corridorId: 'badrinath', coords: [30.7000, 79.5800], altitudeM: 4329, altitude: '4,329m', amenities: ['stay'] },
  { id: 'lansdowne', name: 'Lansdowne Cantonment', subtitle: 'Garhwal Pine Hill Station', category: 'Hill Station', corridorId: 'badrinath', coords: [29.8377, 78.6873], altitudeM: 1706, altitude: '1,706m', amenities: ['fuel', 'atm', 'stay'] },
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
    altitudeRange: '314m → 3,300m',
    weather: 'Clear • 8°C to 16°C at base / 2°C at shrine',
    stations: [
      { name: 'Haridwar Railhead Hub', coords: [29.9457, 78.1642], type: 'interchange', altitude: '314m', altitudeM: 314, modes: ['Train', 'UTC Bus', 'Taxi'] },
      { name: 'Rishikesh Railhead Hub', coords: [30.0869, 78.2676], type: 'interchange', altitude: '372m', altitudeM: 372, modes: ['Train', 'UTC Bus', 'Taxi'] },
      { name: 'Devprayag Sangam', coords: [30.1459, 78.5990], type: 'junction', altitude: '618m', altitudeM: 618, modes: ['Bus', 'Shared Taxi'] },
      { name: 'Srinagar Garhwal Hub', coords: [30.2227, 78.7844], type: 'station', altitude: '560m', altitudeM: 560, modes: ['Bus', 'Medical Base'] },
      { name: 'Rudraprayag Junction', coords: [30.2858, 78.9811], type: 'interchange', altitude: '895m', altitudeM: 895, modes: ['Kedarnath Interchange', 'Bus'] },
      { name: 'Karnaprayag Sangam', coords: [30.2605, 79.2173], type: 'station', altitude: '1,451m', altitudeM: 1451, modes: ['Bus', 'Shared Maxx'] },
      { name: 'Chamoli District Base', coords: [30.4070, 79.3364], type: 'station', altitude: '1,150m', altitudeM: 1150, modes: ['Bus', 'Taxi'] },
      { name: 'Joshimath Auli Base', coords: [30.5564, 79.5661], type: 'junction', altitude: '1,890m', altitudeM: 1890, modes: ['Cable Car', 'Taxi', 'Helipad'] },
      { name: 'Govindghat (Valley Base)', coords: [30.6250, 79.5480], type: 'junction', altitude: '1,828m', altitudeM: 1828, modes: ['Trek Base', 'Pony', 'Jeep'] },
      { name: 'Badrinath Dham', coords: [30.7465, 79.4942], type: 'terminus', altitude: '3,300m', altitudeM: 3300, modes: ['Shrine Town', 'GMVN Stays'] },
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
    altitudeRange: '314m → 3,583m',
    weather: 'Clear / Mountain Chill • 6°C at base / -2°C at shrine',
    stations: [
      { name: 'Rudraprayag Junction', coords: [30.2858, 78.9811], type: 'interchange', altitude: '895m', altitudeM: 895, modes: ['NH-07 Interchange', 'Bus'] },
      { name: 'Augustmuni Helipad', coords: [30.3950, 79.0230], type: 'station', altitude: '920m', altitudeM: 920, modes: ['Heli Services', 'Taxi'] },
      { name: 'Kund (Chopta Fork)', coords: [30.4900, 79.0600], type: 'junction', altitude: '1,050m', altitudeM: 1050, modes: ['Chopta-Tungnath Interchange'] },
      { name: 'Guptkashi Cultural Base', coords: [30.5200, 79.0800], type: 'station', altitude: '1,320m', altitudeM: 1320, modes: ['Bus', 'Taxi', 'Medical'] },
      { name: 'Phata Heliport Hub', coords: [30.5560, 79.0960], type: 'junction', altitude: '1,640m', altitudeM: 1640, modes: ['Heli Booking', 'Taxi', 'Shuttle'] },
      { name: 'Sonprayag Transit Gate', coords: [30.6040, 79.0990], type: 'station', altitude: '1,829m', altitudeM: 1829, modes: ['Barrier', 'Local Shuttle Only'] },
      { name: 'Gaurikund Trek Base', coords: [30.6510, 79.1040], type: 'junction', altitude: '1,982m', altitudeM: 1982, modes: ['Trek', 'Pony', 'Palanquin'] },
      { name: 'Kedarnath Dham', coords: [30.7352, 79.0669], type: 'terminus', altitude: '3,583m', altitudeM: 3583, modes: ['Trek End', 'GMVN Camps'] },
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
    altitudeRange: '554m → 2,200m',
    weather: 'Pleasant Alpine • 14°C to 22°C',
    stations: [
      { name: 'Kathgodam Railhead', coords: [29.2182, 79.5267], type: 'interchange', altitude: '554m', altitudeM: 554, modes: ['Train', 'UTC Bus', 'Taxi'] },
      { name: 'Bhimtal/Nainital', coords: [29.3437, 79.5677], type: 'junction', altitude: '1,370m', altitudeM: 1370, modes: ['Lake Hub', 'Local Bus'] },
      { name: 'Almora Cultural Hub', coords: [29.5971, 79.6591], type: 'junction', altitude: '1,638m', altitudeM: 1638, modes: ['District HQ', 'Taxi'] },
      { name: 'Kausani Sunrise Vista', coords: [29.8390, 79.5970], type: 'station', altitude: '1,890m', altitudeM: 1890, modes: ['Bus', 'Hotel Stays'] },
      { name: 'Bageshwar Sangam', coords: [29.8380, 79.7720], type: 'station', altitude: '960m', altitudeM: 960, modes: ['Bus', 'Shared Maxx'] },
      { name: 'Thal Junction', coords: [29.9630, 80.3750], type: 'junction', altitude: '895m', altitudeM: 895, modes: ['Shared Maxx', 'Local Bus'] },
      { name: 'Munsiyari Panchachuli', coords: [30.0670, 80.2390], type: 'terminus', altitude: '2,200m', altitudeM: 2200, modes: ['Trekking Base'] },
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
    altitudeRange: '447m → 3,293m',
    weather: 'Clear Mountain Air • 5°C to 18°C',
    stations: [
      { name: 'Dehradun Capital Hub', coords: [30.3165, 78.0322], type: 'interchange', altitude: '447m', altitudeM: 447, modes: ['Airport', 'ISBT', 'Train'] },
      { name: 'Mussoorie Queen of Hills', coords: [30.4539, 78.0644], type: 'junction', altitude: '2,000m', altitudeM: 2000, modes: ['Bus', 'Cable Car'] },
      { name: 'Barkot Yamuna Base', coords: [30.8120, 78.2080], type: 'junction', altitude: '1,220m', altitudeM: 1220, modes: ['Yamunotri Base', 'Bus'] },
      { name: 'Uttarkashi Mountaineering', coords: [30.7248, 78.4464], type: 'junction', altitude: '1,165m', altitudeM: 1165, modes: ['Mountaineering Base'] },
      { name: 'Harsil Apple Valley', coords: [31.1400, 78.7200], type: 'station', altitude: '2,620m', altitudeM: 2620, modes: ['Taxi', 'GMVN'] },
      { name: 'Gangotri Glacier Source', coords: [30.9940, 79.0706], type: 'terminus', altitude: '3,048m', altitudeM: 3048, modes: ['Shrine Entry'] },
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
    altitudeRange: '280m → 3,050m',
    weather: 'High Alpine • 0°C to 11°C',
    stations: [
      { name: 'Tanakpur Railhead', coords: [29.0700, 80.1100], type: 'interchange', altitude: '280m', altitudeM: 280, modes: ['Train', 'Bus'] },
      { name: 'Pithoragarh District Hub', coords: [29.5820, 80.2180], type: 'junction', altitude: '1,814m', altitudeM: 1814, modes: ['ILP Permit Office', 'Taxi'] },
      { name: 'Dharchula ILP Checkpost', coords: [29.8570, 80.5280], type: 'junction', altitude: '915m', altitudeM: 915, modes: ['ILP Check', 'Jeep'] },
      { name: 'Gunji Adi Kailash Jnc', coords: [30.2700, 80.9900], type: 'interchange', altitude: '3,050m', altitudeM: 3050, modes: ['Trek Base'] },
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
  '4X4 JEEP': Car,
  ROPEWAY: Navigation,
  WALK: Footprints,
  TREK: Mountain,
  'TREK / HELI': Mountain,
  MOUNTAIN: Mountain
};

// ─── Direct Searchable Station Input with Autocomplete ─────────
function SearchableStationSelect({ label, value, onChange, placeholder, icon: IconComponent }) {
  const selectedStation = ALL_STATIONS.find((s) => s.id === value) || ALL_STATIONS[0];
  const [query, setQuery] = useState(selectedStation.name);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);

  // Sync with value prop updates
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
      <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1">
        {label}
      </label>

      {/* Direct Search Input Container */}
      <div className="relative flex items-center bg-white rounded-xl border border-stone-200 hover:border-[#0f3d2e]/50 focus-within:border-[#0f3d2e] focus-within:ring-2 focus-within:ring-[#0f3d2e]/20 transition-all shadow-2xs">
        <span className="pl-3 text-[#0f3d2e] shrink-0">
          <IconComponent size={14} />
        </span>
        <input
          type="text"
          value={query}
          onFocus={() => {
            setIsFocused(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsFocused(true);
          }}
          placeholder={placeholder || 'Type station, town or shrine name...'}
          className="w-full pl-2.5 pr-8 py-2.5 text-xs font-bold text-stone-900 bg-transparent focus:outline-none placeholder:text-stone-400 placeholder:font-normal"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsFocused(true);
            }}
            className="absolute right-2.5 p-0.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition"
            title="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Selected Station Subtitle Pill */}
      <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400 px-1">
        <span className="truncate">
          📍 {selectedStation.subtitle} • {selectedStation.altitude}
        </span>
        <span className="font-bold text-[#0f3d2e] uppercase text-[9px] shrink-0 ml-1">
          {selectedStation.category}
        </span>
      </div>

      {/* Autocomplete Dropdown List */}
      {isFocused && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            <span>Mountain Stations &amp; Hubs</span>
            <span>{filteredStations.length} results</span>
          </div>

          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-stone-50">
            {filteredStations.length === 0 ? (
              <div className="p-3.5 text-center text-xs text-stone-400">
                No mountain stations found matching &ldquo;{query}&rdquo;
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
                    className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
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
                      <p className="text-[10px] text-stone-400 truncate">
                        {station.subtitle} • {station.altitude}
                      </p>
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
 * Multi-functional:
 * - Searchable stations with Haridwar Railhead prominently included
 * - Dynamic Elevation Profile with Altitude Gain & Oxygen Saturation Gauge
 * - Multi-Mode Transport Comparison (Bus vs Cab vs Heli vs Trek)
 * - Interactive Corridor Station Inspector (Zoom to stop on map + view amenities)
 * - 1-Click Itinerary Copier & Mountain Emergency Contacts (1070, 112, 108)
 * - 100% Mobile responsive bottom-sheet & desktop slide-over
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
  const [selectedTab, setSelectedTab] = useState('route'); // 'route' | 'stops' | 'lines'
  const [transportMode, setTransportMode] = useState('bus'); // 'bus' | 'cab' | 'heli' | 'trek'
  const [copiedToast, setCopiedToast] = useState(false);
  const [customDestinationNotice, setCustomDestinationNotice] = useState(null);

  const handleJumpToTripPlanner = () => {
    const destName = destStation.name;
    const originName = originStation.name;
    navigate(`/trip-planner?dest=${encodeURIComponent(destName)}&origin=${encodeURIComponent(originName)}`, {
      state: {
        destination: destName,
        origin: originName,
        corridor: activeCorridor.name,
        distance: routeAnalysis.distance,
        duration: routeAnalysis.duration,
      }
    });
  };

  // Sync routeTarget when user clicks Route from any map popup or location card
  useEffect(() => {
    if (routeTarget?.place) {
      const pl = routeTarget.place;
      const plName = (pl.name || '').toLowerCase();
      const plDist = (pl.district || '').toLowerCase();

      // Find direct or district match
      const directMatch = ALL_STATIONS.find(
        (s) => plName.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(plName)
      );

      const districtMatch = ALL_STATIONS.find(
        (s) => s.subtitle.toLowerCase().includes(plDist) || s.name.toLowerCase().includes(plDist)
      );

      let matchedId = 'kedarnath';
      if (directMatch) {
        matchedId = directMatch.id;
      } else if (districtMatch) {
        matchedId = districtMatch.id;
      } else if (plDist.includes('uttarkashi')) {
        matchedId = 'uttarkashi';
      } else if (plDist.includes('chamoli')) {
        matchedId = 'joshimath';
      } else if (plDist.includes('rudraprayag')) {
        matchedId = 'kedarnath';
      } else if (plDist.includes('nainital')) {
        matchedId = 'nainital';
      } else if (plDist.includes('pithoragarh')) {
        matchedId = 'munsiyari';
      } else if (plDist.includes('dehradun')) {
        matchedId = 'dehradun';
      } else if (plDist.includes('haridwar')) {
        matchedId = 'haridwar';
      }

      if (routeTarget.direction === 'from') {
        setFromLocation(matchedId);
        setToLocation(matchedId === 'kedarnath' ? 'haridwar' : 'kedarnath');
      } else {
        setToLocation(matchedId);
        setFromLocation(matchedId === 'haridwar' ? 'delhi' : 'haridwar');
      }

      setCustomDestinationNotice({
        name: pl.name,
        district: pl.district,
        direction: routeTarget.direction || 'to',
        hubName: ALL_STATIONS.find((s) => s.id === matchedId)?.name || 'Mountain Gateway',
      });
      setSelectedTab('route');
    }
  }, [routeTarget]);

  // Quick route presets
  const handleQuickPreset = (from, to) => {
    setFromLocation(from);
    setToLocation(to);
    setSelectedTab('route');
    setCustomDestinationNotice(null);
  };

  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  // Determine stations & matched corridor
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

  // Elevation Profile Computation
  const elevationStats = useMemo(() => {
    const startAlt = originStation.altitudeM || 314;
    const endAlt = destStation.altitudeM || 3583;
    const gain = Math.abs(endAlt - startAlt);
    // Estimated oxygen saturation relative to sea level
    let o2Pct = '95%';
    let risk = 'Normal';
    if (endAlt > 3200) {
      o2Pct = '~68%';
      risk = 'High AMS Risk';
    } else if (endAlt > 2200) {
      o2Pct = '~78%';
      risk = 'Moderate Elevation';
    }

    return {
      startAlt,
      endAlt,
      gain,
      o2Pct,
      risk,
    };
  }, [originStation, destStation]);

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
        { mode: 'WALK', title: "Mana Village & Saraswati Udgam", route: "Badrinath → Mana (India's First Village)", time: '15 mins', cost: 'Free / ₹30 E-Rickshaw' },
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

  const handleShowOnMap = (target) => {
    const cId = typeof target === 'string' ? target : activeCorridor.id;
    if (cId) {
      onSelectCorridor(cId);
      if (onFlyToCorridor) onFlyToCorridor(target || cId);
      // On mobile screens (< 768px), auto dock drawer so user sees map
      if (window.innerWidth < 768) {
        onClose();
      }
    }
  };

  // Real Google Maps Directions URL (Coordinates first, place names fallback)
  const googleMapsDirectionsUrl = useMemo(() => {
    const origParam = originStation.coords
      ? `${originStation.coords[0]},${originStation.coords[1]}`
      : encodeURIComponent(`${originStation.name}, Uttarakhand`);
    const destParam = destStation.coords
      ? `${destStation.coords[0]},${destStation.coords[1]}`
      : encodeURIComponent(`${destStation.name}, Uttarakhand`);

    return `https://www.google.com/maps/dir/?api=1&origin=${origParam}&destination=${destParam}&travelmode=driving`;
  }, [originStation, destStation]);

  const handleStartJourney = () => {
    onSelectCorridor(activeCorridor.id);
    if (onFlyToCorridor) {
      if (originStation.coords) {
        onFlyToCorridor({ coords: originStation.coords, zoom: 15, isStartingJourney: true });
      } else {
        onFlyToCorridor(activeCorridor.id);
      }
    }
    // Auto-dock drawer so user sees live starting map and highway
    onClose();
  };

  const handleCopyItinerary = () => {
    const text = `🏔️ Himalayan Route Plan: ${originStation.name} ➔ ${destStation.name}
🛣️ Corridor: ${activeCorridor.name} (${activeCorridor.highway})
⏱️ Estimated Time: ${routeAnalysis.duration} | 📏 Distance: ${routeAnalysis.distance}
⛰️ Elevation Gain: +${elevationStats.gain}m (${elevationStats.startAlt}m to ${elevationStats.endAlt}m)
🚏 Steps:
${routeAnalysis.legs.map((l, i) => `${i + 1}. [${l.mode}] ${l.title}: ${l.route} (${l.time}, ${l.cost})`).join('\n')}
🚨 Mountain Helpline: 1070 (Disaster) / 112 (Police)
Generated via Discovery Uttarakhand GIS.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
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
        className="fixed inset-x-0 bottom-0 md:bottom-auto md:top-0 md:right-0 md:left-auto z-[1100] w-full md:max-w-[440px] max-h-[92vh] md:max-h-full h-auto md:h-full bg-white shadow-2xl border-t md:border-t-0 md:border-l border-stone-200 flex flex-col font-sans text-stone-900 rounded-t-3xl md:rounded-none animate-in slide-in-from-bottom md:slide-in-from-right duration-250 select-none overflow-hidden"
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
                <h3 className="text-sm font-black tracking-tight text-[#0f3d2e]">Himalayan Routes Navigator</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#0f3d2e]">
                  GIS 2026
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">Multi-Modal Alpine Highway &amp; Pilgrimage GIS</p>
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

        {/* ── Tabs (3-Way): Route & Steps | Stops Inspector | 5 Corridors ── */}
        <div className="flex border-b border-stone-200 bg-stone-50/80 px-3 pt-1.5 gap-1 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { key: 'route', label: 'Route & Steps', icon: Compass },
            { key: 'stops', label: 'Corridor Stops & Amenities', icon: MapPin },
            { key: 'lines', label: '5 Corridors', icon: Layers },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = selectedTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedTab(tab.key)}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 inline-flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
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
              {/* Custom Destination Routing Alert from Map Popup */}
              {customDestinationNotice && (
                <div className="p-3 bg-gradient-to-r from-emerald-800 to-[#0f3d2e] rounded-2xl text-white text-xs flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                      <Compass size={15} className="text-emerald-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold truncate text-white leading-tight">
                        {customDestinationNotice.direction === 'from' ? 'Starting Point' : 'Destination'}: {customDestinationNotice.name}
                      </p>
                      <p className="text-[10px] text-emerald-200/90 truncate">
                        {customDestinationNotice.direction === 'from' ? 'Starting journey via' : 'Linked via'}{' '}
                        {customDestinationNotice.hubName} ({customDestinationNotice.district})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomDestinationNotice(null)}
                    className="w-6 h-6 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
                    title="Dismiss"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Quick Popular Presets Chips */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                  1-Tap Popular Mountain Routes:
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
                  label="From — Origin / Railhead Hub"
                  value={fromLocation}
                  onChange={setFromLocation}
                  placeholder="Type to search Haridwar, Rishikesh, Delhi..."
                  icon={MapPin}
                />

                {/* Swap Button */}
                <div className="flex justify-center -my-1 relative z-10">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="w-7 h-7 rounded-full bg-white border border-stone-200 shadow-xs hover:bg-emerald-50 hover:border-emerald-300 text-stone-500 hover:text-[#0f3d2e] flex items-center justify-center transition cursor-pointer"
                    title="Swap Origin & Destination (Return Journey)"
                  >
                    <ArrowLeftRight size={12} className="rotate-90" />
                  </button>
                </div>

                {/* TO Input */}
                <SearchableStationSelect
                  label="To — Mountain Destination / Shrine"
                  value={toLocation}
                  onChange={setToLocation}
                  placeholder="Type to search Kedarnath, Badrinath, Auli..."
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

              {/* ─── Elevation & Oxygen Saturation Gauge ─── */}
              <div className="p-3.5 bg-gradient-to-br from-emerald-50/60 to-stone-50 rounded-2xl border border-emerald-100/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Activity size={13} className="text-[#0f3d2e]" />
                    <span className="text-xs font-black text-stone-800 uppercase tracking-wider">
                      Elevation Ascent Profile
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-600">
                    +{elevationStats.gain}m Climb
                  </span>
                </div>

                {/* Visual Elevation Gradient Bar */}
                <div className="space-y-1">
                  <div className="h-2.5 w-full bg-stone-200 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full w-[35%]" title="Low Valley Base" />
                    <div className="bg-amber-400 h-full w-[35%]" title="Sub-Alpine Zone" />
                    <div className="bg-rose-500 h-full w-[30%]" title="High Altitude AMS Zone" />
                  </div>
                  <div className="flex justify-between text-[10px] font-semibold text-stone-400 px-0.5">
                    <span>{originStation.name} ({elevationStats.startAlt}m)</span>
                    <span className="text-stone-700 font-bold">{destStation.name} ({elevationStats.endAlt}m)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="bg-white/80 p-2 rounded-xl border border-stone-200">
                    <span className="text-stone-400 block text-[10px] font-bold">Estimated Oxygen Sat.</span>
                    <span className="font-black text-stone-800">{elevationStats.o2Pct} of Sea Level</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-stone-200">
                    <span className="text-stone-400 block text-[10px] font-bold">Acclimatization</span>
                    <span className={`font-black ${elevationStats.endAlt > 3000 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {elevationStats.endAlt > 3000 ? '1 Night Rest Needed' : 'Smooth Transit'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ─── Primary Route Actions: Ja Trip Planner + Start Here + Real Google Maps + Fit Corridor ─── */}
              <div className="space-y-2">
                {/* 1-Click Action: Transfer to Trip Planner */}
                <button
                  type="button"
                  onClick={handleJumpToTripPlanner}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800 via-[#0f3d2e] to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-between gap-2 cursor-pointer group active:scale-[0.98] border border-emerald-500/30"
                  title={`Auto-generate tailored multi-day itinerary from ${originStation.name} to ${destStation.name}`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-emerald-300 animate-pulse shrink-0" />
                    <span>Ja Trip Planner → Auto-Generate Itinerary</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-200 font-bold">
                    <span>{originStation.name.split(' ')[0]} → {destStation.name.split(' ')[0]}</span>
                    <ArrowRight size={13} className="text-emerald-300 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Action 1: Start Navigation / Journey from Here */}
                  <button
                    type="button"
                    onClick={handleStartJourney}
                    className="py-3 px-3.5 rounded-xl bg-[#0f3d2e] hover:bg-[#185340] text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-[0.98]"
                    title={`Start live mountain journey from ${originStation.name} on map`}
                  >
                    <Navigation size={15} className="text-emerald-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    <span className="truncate">Start From Here (Map)</span>
                  </button>

                  {/* Action 2: Open in Real Google Maps */}
                  <a
                    href={googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-3.5 rounded-xl bg-white hover:bg-emerald-50 text-[#0f3d2e] border-2 border-[#0f3d2e] font-black text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-[0.98] text-center"
                    title="Open turn-by-turn navigation in official Google Maps app"
                  >
                    <ExternalLink size={14} className="text-[#0f3d2e] group-hover:scale-110 transition-transform shrink-0" />
                    <span className="truncate">Real Google Maps ↗</span>
                  </a>
                </div>

                {/* Action 3: Fit Complete Corridor on Map */}
                <button
                  type="button"
                  onClick={() => handleShowOnMap(activeCorridor.id)}
                  className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Compass size={13} className="text-emerald-700" />
                  <span>Fit Entire Corridor Bounds on Map</span>
                </button>
              </div>

              {/* ─── Multi-Mode Transport Matrix Selector ─── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Car size={13} className="text-[#0f3d2e]" />
                    <span>Transport Modes &amp; Fares</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-semibold">Live comparison</span>
                </div>

                <div className="grid grid-cols-4 gap-1 p-1 bg-stone-100 rounded-xl">
                  {[
                    { id: 'bus', label: 'Bus / Maxx', icon: Bus },
                    { id: 'cab', label: 'Private Cab', icon: Car },
                    { id: 'heli', label: 'Helicopter', icon: Wind },
                    { id: 'trek', label: 'Trek / Mule', icon: Footprints },
                  ].map((m) => {
                    const MIcon = m.icon;
                    const isCur = transportMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setTransportMode(m.id)}
                        className={`py-2 px-1 rounded-lg text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                          isCur
                            ? 'bg-white text-[#0f3d2e] shadow-xs font-black'
                            : 'text-stone-500 hover:text-stone-800 font-medium'
                        }`}
                      >
                        <MIcon size={13} />
                        <span className="text-[10px] leading-tight">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Mode Detail Card */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                  {transportMode === 'bus' && (
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>UTC Mountain Express / Shared Maxx</span>
                        <span className="text-emerald-700">₹450 – ₹900</span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Government &amp; shared operators run continuously from Haridwar &amp; Rishikesh hubs. Budget-friendly and scenic.
                      </p>
                    </div>
                  )}
                  {transportMode === 'cab' && (
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>Private Taxi / 4x4 Bolero / Innova</span>
                        <span className="text-emerald-700">₹3,200 – ₹4,800</span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Dedicated point-to-point drop. Saves 2-3 hours. Can stop at Devprayag &amp; scenic river confluence viewpoints.
                      </p>
                    </div>
                  )}
                  {transportMode === 'heli' && (
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>Helicopter Shuttle Service</span>
                        <span className="text-emerald-700">₹4,900 official roundtrip</span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Departs from Phata, Guptkashi, or Sersi helipads. 8-minute flight directly to the shrine helipad. Booking via IRCTC HeliYatra.
                      </p>
                    </div>
                  )}
                  {transportMode === 'trek' && (
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>Pilgrimage Trek / Mule / Kandi</span>
                        <span className="text-emerald-700">₹0 Trek / ₹2,400 Mule</span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Gaurikund to Kedarnath (16 km). Fully paved with medical posts, water filtration, and sheds every 500m.
                      </p>
                    </div>
                  )}
                </div>
              </div>

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

              {/* Road Condition & Weather Banner */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
                  <span className="font-bold text-emerald-950 text-[11px]">
                    {routeAnalysis.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-emerald-800 font-semibold pl-5">
                  <Sun size={11} className="text-amber-500 shrink-0" />
                  <span>{activeCorridor.weather}</span>
                </div>
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

              {/* ─── Share, Google Maps & Copy Itinerary Action ─── */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyItinerary}
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  {copiedToast ? <Check size={14} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedToast ? 'Copied to Clipboard!' : 'Copy Route Plan'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleJumpToTripPlanner}
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0f3d2e] border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs shrink-0"
                  title="Plan in AI Trip Planner"
                >
                  <Sparkles size={13} className="text-emerald-700" />
                  <span>Ja Trip Planner</span>
                </button>

                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs shrink-0"
                  title="Open live directions in Google Maps"
                >
                  <ExternalLink size={13} />
                  <span>Google Maps ↗</span>
                </a>
              </div>

              {/* ─── Emergency Mountain Hotline Card ─── */}
              <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-rose-900 font-black text-xs">
                    <PhoneCall size={13} className="text-rose-600" />
                    <span>Emergency Mountain Helplines (24x7)</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-200 text-rose-900">SDRF Active</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                  <a href="tel:1070" className="p-2 bg-white rounded-xl border border-rose-200 hover:bg-rose-100 text-rose-900 font-black block">
                    <span className="text-[10px] block text-stone-400 font-bold">Disaster</span>
                    1070
                  </a>
                  <a href="tel:112" className="p-2 bg-white rounded-xl border border-rose-200 hover:bg-rose-100 text-rose-900 font-black block">
                    <span className="text-[10px] block text-stone-400 font-bold">Police</span>
                    112
                  </a>
                  <a href="tel:108" className="p-2 bg-white rounded-xl border border-rose-200 hover:bg-rose-100 text-rose-900 font-black block">
                    <span className="text-[10px] block text-stone-400 font-bold">Medical</span>
                    108
                  </a>
                </div>
              </div>
            </div>
          ) : selectedTab === 'stops' ? (
            /* ─── Corridor Stops & Amenities Inspector ─── */
            <div className="p-4 space-y-3">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#0f3d2e]">{activeCorridor.name}</h4>
                  <p className="text-[10px] text-emerald-800 font-medium">Click any stop to zoom directly on map</p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white text-[#0f3d2e] shadow-2xs">
                  {activeCorridor.stations.length} Stops
                </span>
              </div>

              <div className="space-y-2">
                {activeCorridor.stations.map((st, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white rounded-xl border border-stone-200 hover:border-[#0f3d2e]/40 shadow-2xs transition-all flex items-center justify-between gap-2 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-stone-900 truncate">{st.name}</p>
                          <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-stone-100 text-stone-500 font-bold">
                            {st.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-400">⛰️ Altitude: {st.altitude}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleShowOnMap(st.coords)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-[#0f3d2e] text-[#0f3d2e] hover:text-white font-bold text-[10px] transition cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs"
                      title={`Zoom map to ${st.name}`}
                    >
                      <MapPin size={10} />
                      <span>Zoom</span>
                    </button>
                  </div>
                ))}
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
                        <span>⛰️ {line.altitudeRange}</span>
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
              ⏱️ {corridor.duration} • 🛣️ {corridor.totalKm} • ⛰️ {corridor.altitudeRange}
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
