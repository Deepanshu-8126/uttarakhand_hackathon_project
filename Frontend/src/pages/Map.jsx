import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Polyline,
  Polygon,
  Circle,
  useMap,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Navbar from '../components/Navbar';
import {
  Search,
  MapPin,
  Mountain,
  Sparkles,
  Hotel,
  Activity as ActivityIcon,
  Plus,
  Check,
  X,
  Layers,
  ArrowRight,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CloudRain,
  Radio,
  Navigation,
  Compass,
  ArrowUpDown,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Home,
  Briefcase,
  ExternalLink,
  Car,
  Loader2,
  Globe,
} from 'lucide-react';
import { getDestinations } from '../api/destinationApi';
import { getSpiritualPlaces } from '../api/spiritualApi';
import { getActivities } from '../api/activityApi';
import { getStays } from '../api/stayApi';
import { getRentals } from '../api/rentalApi';
import { placesApi } from '../api/placesApi';
import { useMapStore } from '../store/mapStore';
import TransitRouteDrawer, {
  HimalayanCorridorsLayer,
  HIMALAYAN_CORRIDORS,
} from '../components/map/TransitRouteDrawer';
import {
  TILE_PRESETS,
  MAP_CENTER,
  MAP_ZOOM,
  MAP_MIN_ZOOM,
  MAP_MAX_ZOOM,
  isValidCoord,
} from '../utils/mapConfig';

// ─── Leaflet Default Marker Icon Fix ─────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Category Visual Styling ─────────────────────────────────
const CATEGORY_STYLES = {
  destination: {
    color: '#0f3d2e',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-[#0f3d2e]',
    badgeText: 'DESTINATION',
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`,
  },
  spiritual: {
    color: '#d97706',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    badgeText: 'SPIRITUAL',
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/></svg>`,
  },
  activity: {
    color: '#2563eb',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    badgeText: 'ADVENTURE',
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
  },
  stay: {
    color: '#0f3d2e',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-[#0f3d2e]',
    badgeText: '🏡 PARTNER STAY',
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M9 3h6v4H9z"/></svg>`,
  },
  radar: {
    color: '#059669',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-800',
    badgeText: '🌟 GOOGLE RADAR',
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  },
  rental: {
    color: '#0284c7',
    bg: 'bg-sky-50',
    border: 'border-sky-300',
    text: 'text-sky-800',
    badgeText: '🚗 VEHICLE FLEET',
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`,
  },
};

// ─── Custom Category SVG Marker ──────────────────────────────
const createCustomMarkerIcon = (type, isSelected = false) => {
  const style = CATEGORY_STYLES[type] || CATEGORY_STYLES.destination;
  const size = isSelected ? 40 : 32;
  const pulseHtml = isSelected
    ? `<div style="position:absolute;inset:-8px;border-radius:50%;background:${style.color};opacity:0.35;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>`
    : '';

  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
      ${pulseHtml}
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:${style.color};
        border:${isSelected ? '3px solid #ffffff' : '2px solid #ffffff'};
        box-shadow:0 4px 12px rgba(15, 23, 42, 0.35), 0 0 10px ${style.color}60;
        display:flex;
        align-items:center;
        justify-content:center;
        transition:transform 0.2s ease;
      ">
        ${style.iconSvg}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-map-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 6)],
  });
};

// ─── Cluster Custom Icon ─────────────────────────────────────
const createClusterIcon = (cluster) => {
  const count = cluster.getChildCount();
  const size = count > 50 ? 46 : count > 20 ? 40 : 34;
  return L.divIcon({
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        background:#1b4332;
        color:#ffffff;
        border:2.5px solid #ffffff;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-family:Inter, system-ui, sans-serif;
        font-weight:800;
        font-size:${size > 38 ? 13 : 11}px;
        box-shadow:0 4px 14px rgba(27,67,50,0.45);
        cursor:pointer;
      ">
        ${count}
      </div>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// ─── Map Controller (Fly To & Invalidate Size) ─────────────────
function MapResizerAndFlyTo({ coords, selectedTile }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map, selectedTile]);

  useEffect(() => {
    if (!coords) return;
    if (Array.isArray(coords) && isValidCoord(coords)) {
      map.flyTo(coords, 13, { duration: 1.2, easeLinearity: 0.25 });
    } else if (typeof coords === 'object') {
      if (coords.bounds && Array.isArray(coords.bounds)) {
        map.fitBounds(coords.bounds, { padding: [50, 50], maxZoom: 11, duration: 1.2 });
      } else if (coords.coords && isValidCoord(coords.coords)) {
        map.flyTo(coords.coords, coords.zoom || 9, { duration: 1.2, easeLinearity: 0.25 });
      }
    }
  }, [coords, map]);

  return null;
}

// ─── Map Navigation Action Tools Helper ────────────────────────
function MapNavigationTools({ onRecenter }) {
  const map = useMap();

  return (
    <div className="flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-200/90">
      {/* Zoom In */}
      <button
        type="button"
        onClick={() => map.zoomIn()}
        aria-label="Zoom In"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
      >
        <span className="text-base font-bold leading-none">+</span>
      </button>
      {/* Zoom Out */}
      <button
        type="button"
        onClick={() => map.zoomOut()}
        aria-label="Zoom Out"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
      >
        <span className="text-base font-bold leading-none">−</span>
      </button>
      <div className="h-px bg-slate-200 my-0.5" />
      {/* Recenter / Compass */}
      <button
        type="button"
        onClick={() => {
          map.flyTo(MAP_CENTER, MAP_ZOOM, { duration: 1.0 });
          if (onRecenter) onRecenter();
        }}
        aria-label="Recenter Map"
        title="Recenter to Central Uttarakhand"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1b4332] hover:bg-slate-100 transition-colors"
      >
        <Compass size={16} />
      </button>
    </div>
  );
}

// ─── Mountain Trust & Safety Overlay Data ─────────────────────
const SAFETY_DATA = {
  landslideCorridors: [
    {
      name: 'Joshimath - Badrinath Corridor (NH-58)',
      risk: 'High Hazard - Monsoon Advisory',
      reroute: 'Auto-Reroute via Tharali Valley (+34km)',
      coordinates: [
        [30.556, 79.566],
        [30.620, 79.530],
        [30.690, 79.510],
        [30.746, 79.494],
      ],
    },
    {
      name: 'Dharchula - Tawaghat Mountain Pass',
      risk: 'Active Landslide Slip - Single Lane',
      reroute: 'Caution: 4x4 vehicles only',
      coordinates: [
        [29.850, 80.540],
        [29.980, 80.600],
        [30.100, 80.680],
      ],
    },
  ],
  altitudeZones: [
    {
      name: 'Kedarnath High-Altitude Sanctuary',
      elevation: '3,583m - 4,200m',
      advisory: 'AMS Warning: 24h Acclimatization Required',
      polygon: [
        [30.680, 78.980],
        [30.780, 79.010],
        [30.760, 79.140],
        [30.660, 79.110],
      ],
    },
    {
      name: 'Nanda Devi & Valley of Flowers High Ridge',
      elevation: '3,850m - 5,400m',
      advisory: 'Severe Altitude & Wilderness Escrow Zone',
      polygon: [
        [30.620, 79.520],
        [30.780, 79.580],
        [30.750, 79.750],
        [30.550, 79.700],
      ],
    },
  ],
  weatherAreas: [
    {
      name: 'Chamoli Upper Basin',
      center: [30.410, 79.330],
      radius: 22000,
      alert: 'Flash Flood & Cloudburst Watch (24h Alert)',
    },
    {
      name: 'Pithoragarh High Pass Cloud Grid',
      center: [29.750, 80.250],
      radius: 20000,
      alert: 'Heavy Precipitation Radar Alert',
    },
  ],
  sentinelBeacons: [
    { name: 'Joshimath Valley Sentinel Hub', coords: [30.556, 79.566], responseTime: '12 min' },
    { name: 'Guptkashi Mountain SOS Post', coords: [30.522, 79.077], responseTime: '8 min' },
    { name: 'Almora Community Grid Station', coords: [29.597, 79.659], responseTime: '15 min' },
    { name: 'Rishikesh Rapid Evacuation Base', coords: [30.086, 78.267], responseTime: '5 min' },
    { name: 'Munsiyari Panchachuli Sentinel Post', coords: [30.064, 80.237], responseTime: '18 min' },
  ],
};

// ─── Preset Coordinates for Fallbacks ────────────────────────
const FALLBACK_COORDS = {
  kedarnath: [30.7333, 79.0667],
  badrinath: [30.7465, 79.4942],
  gangotri: [30.9947, 78.9398],
  yamunotri: [31.0140, 78.4600],
  nainital: [29.3919, 79.4542],
  auli: [30.5189, 79.5674],
  rishikesh: [30.0869, 78.2676],
  munsiyari: [30.0645, 80.2372],
  chopta: [30.4856, 79.1764],
  'valley-of-flowers': [30.7280, 79.5960],
  almora: [29.5971, 79.6591],
  mussoorie: [30.4598, 78.0644],
  ranikhet: [29.6434, 79.4322],
  kausani: [29.8447, 79.5969],
  'hemkund-sahib': [30.7000, 79.5800],
  tungnath: [30.4889, 79.2172],
  'adi-kailash': [30.3167, 80.6333],
};

// ─── Normalise Records ───────────────────────────────────────
const normaliseRecord = (raw, type, linkPrefix, labelFn) => {
  let coords = null;
  const c = raw.location?.coordinates;
  if (Array.isArray(c) && c.length === 2) {
    coords = [c[1], c[0]]; // [lat, lng]
  }

  if (!isValidCoord(coords)) {
    const slugKey = (raw.slug || raw.name || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
    for (const [key, val] of Object.entries(FALLBACK_COORDS)) {
      if (slugKey.includes(key)) {
        coords = val;
        break;
      }
    }
  }

  if (!isValidCoord(coords)) return null;

  const altitude =
    raw.altitude ||
    (raw.elevation ? `${raw.elevation}m` : null) ||
    (raw.name?.includes('Kedarnath') ? '3,583m' : raw.name?.includes('Badrinath') ? '3,300m' : raw.name?.includes('Auli') ? '2,800m' : '1,850m');

  return {
    id: raw._id || raw.slug || raw.id,
    name: raw.name || 'Himalayan Spot',
    slug: raw.slug || raw._id,
    type,
    categoryLabel: labelFn ? labelFn(raw) : type,
    district: raw.district || 'Uttarakhand',
    region: raw.region || '',
    coordinates: coords,
    altitude: typeof altitude === 'number' ? `${altitude.toLocaleString()}m` : altitude,
    altitudeNum: parseInt(String(altitude).replace(/[^0-9]/g, ''), 10) || 1850,
    image:
      raw.coverImage?.url ||
      (typeof raw.coverImage === 'string' ? raw.coverImage : null) ||
      raw.image?.url ||
      (typeof raw.image === 'string' ? raw.image : null) ||
      (Array.isArray(raw.images) && raw.images[0]?.url) ||
      'https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=800&auto=format&fit=crop',
    description: raw.shortDescription || raw.description || 'Authentic Himalayan experience in Uttarakhand.',
    link: `${linkPrefix}/${raw.slug || raw._id}`,
    _raw: raw,
  };
};

export default function MapPage() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeLocation, setActiveLocation] = useState(null);
  const [flyCoords, setFlyCoords] = useState(null);
  const [activeTile, setActiveTile] = useState('geoapify'); // Default to Geoapify HD
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'altitude'
  const searchContainerRef = useRef(null);

  // Live Map & Satellite GIS Search State (Geoapify / Google Places Fallback)
  const [apiSearchResults, setApiSearchResults] = useState([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const searchDebounceRef = useRef(null);

  // Search places via Geoapify / Places API
  const searchMapPlacesApi = useCallback(async (queryText) => {
    const q = (queryText || '').trim();
    if (!q || q.length < 2) {
      setApiSearchResults([]);
      setIsSearchingApi(false);
      return [];
    }

    setIsSearchingApi(true);
    try {
      const res = await placesApi.searchPlaces(q);
      const items = Array.isArray(res?.data) ? res.data : [];

      const formatted = items
        .filter((p) => p.location?.lat && p.location?.lng)
        .map((p, idx) => {
          const lat = Number(p.location.lat);
          const lng = Number(p.location.lng);
          return {
            id: p.place_id || `api-spot-${lat}-${lng}-${idx}`,
            name: p.name && p.name !== '?' && p.name.trim() !== '' ? p.name : p.vicinity || q,
            slug: `api-${p.place_id || `${lat}-${lng}`}`,
            type: 'radar',
            category: 'radar',
            categoryLabel: 'Live GIS Landmark',
            badgeText: p.provider?.includes('Geoapify') ? 'Geoapify HD GIS' : 'Live Map Radar',
            district: p.vicinity || 'Uttarakhand',
            region: 'Himalayan Radar',
            coordinates: [lat, lng],
            altitude: '1,950m',
            altitudeNum: 1950,
            image:
              p.photo_urls?.[0] ||
              'https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=800&auto=format&fit=crop',
            description: p.vicinity ? `${p.name} in ${p.vicinity}.` : 'Verified geographic location in Uttarakhand.',
            link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${p.vicinity || ''}`)}`,
            isExternal: true,
            rating: p.rating || 4.8,
            user_ratings_total: p.user_ratings_total || 30,
            _raw: p,
            isLiveApi: true,
          };
        });

      setApiSearchResults(formatted);
      return formatted;
    } catch (err) {
      console.warn('[MapPage] Live API place search error:', err);
      return [];
    } finally {
      setIsSearchingApi(false);
    }
  }, []);

  // Select search result (DB or Live API spot)
  const handleSelectSearchResult = useCallback((loc) => {
    if (!loc) return;
    if (loc.isLiveApi) {
      setLocations((prev) => {
        const exists = prev.some(
          (l) =>
            l.id === loc.id ||
            (Math.abs(l.coordinates[0] - loc.coordinates[0]) < 0.0001 &&
              Math.abs(l.coordinates[1] - loc.coordinates[1]) < 0.0001)
        );
        return exists ? prev : [loc, ...prev];
      });
    }

    setActiveLocation(loc);
    setFlyCoords({ coords: loc.coordinates, zoom: 14 });
    setSearchFocused(false);
  }, []);

  // Execute full search on Enter or clicking Search button
  const handleExecuteSearch = useCallback(
    async (queryText) => {
      const q = (queryText || searchQuery || '').trim();
      if (!q) return;

      setSearchFocused(true);

      const qLower = q.toLowerCase();
      const dbMatches = locations.filter(
        (l) =>
          l.name.toLowerCase().includes(qLower) ||
          l.district.toLowerCase().includes(qLower) ||
          (l.region && l.region.toLowerCase().includes(qLower))
      );

      const apiResults = await searchMapPlacesApi(q);

      if (dbMatches.length > 0) {
        handleSelectSearchResult(dbMatches[0]);
      } else if (apiResults && apiResults.length > 0) {
        handleSelectSearchResult(apiResults[0]);
      }
    },
    [searchQuery, locations, searchMapPlacesApi, handleSelectSearchResult]
  );

  // Debounced API search when typing
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setApiSearchResults([]);
      setIsSearchingApi(false);
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      searchMapPlacesApi(q);
    }, 450);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery, searchMapPlacesApi]);

  // Safety Overlays State (Mountain Trust Protocol)
  const [safetyLayers, setSafetyLayers] = useState({
    landslideRisk: false,
    altitudeWarning: false,
    weatherAlert: false,
    safetyGrid: false,
  });
  const [safetyPanelOpen, setSafetyPanelOpen] = useState(false);

  // Himalayan Route Drawer State
  const [moreDropdownOpen, setMoreDropdownOpen] = React.useState(false);
  const moreDropdownRef = React.useRef(null);
  React.useEffect(() => {
    if (!moreDropdownOpen) return;
    const handler = (e) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreDropdownOpen]);
  const [transitDrawerOpen, setTransitDrawerOpen] = useState(false);
  const [activeCorridorId, setActiveCorridorId] = useState(null);
  const [routeTarget, setRouteTarget] = useState(null);

  const handleOpenRouteForPlace = useCallback((place, direction = 'to') => {
    if (!place) return;
    setRouteTarget({ place, direction, timestamp: Date.now() });
    setTransitDrawerOpen(true);
  }, []);

  const handleFlyToCorridor = useCallback((target) => {
    if (!target) return;
    if (typeof target === 'string') {
      const corridor = HIMALAYAN_CORRIDORS[target];
      if (corridor && corridor.stations.length > 0) {
        const lats = corridor.stations.map((s) => s.coords[0]);
        const lngs = corridor.stations.map((s) => s.coords[1]);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        setFlyCoords({
          bounds: [
            [minLat, minLng],
            [maxLat, maxLng],
          ],
        });
      }
    } else if (Array.isArray(target) && target.length === 2) {
      setFlyCoords({ coords: target, zoom: 14 });
    } else if (typeof target === 'object' && target?.coords) {
      setFlyCoords({ coords: target.coords, zoom: target.zoom || 15 });
    }
  }, []);

  const { addTripDestination, tripDestinations, removeTripDestination } = useMapStore();
  const tripIds = useMemo(
    () => new Set(tripDestinations.map((d) => d._id || d.id || d.slug)),
    [tripDestinations]
  );

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('map-search-input');
        if (input) {
          input.focus();
          setSearchFocused(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Load Real Data from APIs ────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [destRes, spirRes, actRes, stayRes, rentalRes, placesRes] = await Promise.allSettled([
          getDestinations(),
          getSpiritualPlaces(),
          getActivities(),
          getStays(),
          getRentals(),
          placesApi.getNearbyPlaces({ lat: 30.0667, lng: 79.0193, radius: 50000 })
        ]);

        const all = [];

        if (destRes.status === 'fulfilled') {
          const arr = Array.isArray(destRes.value?.data) ? destRes.value.data
                    : Array.isArray(destRes.value) ? destRes.value : [];
          arr.forEach((d) => {
            const n = normaliseRecord(d, 'destination', '/destinations', () => 'Destination');
            if (n) all.push(n);
          });
        }

        if (spirRes.status === 'fulfilled') {
          const arr = Array.isArray(spirRes.value?.data) ? spirRes.value.data
                    : Array.isArray(spirRes.value) ? spirRes.value : [];
          arr.forEach((s) => {
            const n = normaliseRecord(s, 'spiritual', '/spiritual', (r) => r.category || 'Spiritual');
            if (n) all.push(n);
          });
        }

        if (actRes.status === 'fulfilled') {
          const arr = Array.isArray(actRes.value?.data) ? actRes.value.data
                    : Array.isArray(actRes.value) ? actRes.value : [];
          arr.forEach((a) => {
            const n = normaliseRecord(a, 'activity', '/activities', (r) => r.category || 'Adventure');
            if (n) all.push(n);
          });
        }

        if (stayRes.status === 'fulfilled') {
          const arr = Array.isArray(stayRes.value?.data) ? stayRes.value.data
                    : Array.isArray(stayRes.value) ? stayRes.value : [];
          arr.forEach((st) => {
            const n = normaliseRecord(st, 'stay', '/stays', (r) => r.category || 'Stay');
            if (n) all.push(n);
          });
        }

        if (rentalRes.status === 'fulfilled') {
          const arr = Array.isArray(rentalRes.value?.data) ? rentalRes.value.data
                    : Array.isArray(rentalRes.value) ? rentalRes.value : [];
          arr.forEach((rt) => {
            const n = normaliseRecord(rt, 'rental', '/rentals', (r) => r.type || 'Vehicle Rental');
            if (n) all.push(n);
          });
        }

        if (placesRes.status === 'fulfilled') {
          const arr = Array.isArray(placesRes.value?.data) ? placesRes.value.data : [];
          arr.forEach((p, idx) => {
            if (p.location?.lat && p.location?.lng) {
              all.push({
                id: p.place_id || `radar-gem-${idx}`,
                name: (p.name && p.name !== '?' && p.name.trim() !== '') ? p.name : (p.vicinity || 'Himalayan Radar Gem'),
                slug: `radar-${p.place_id || idx}`,
                type: 'radar',
                category: 'radar',
                categoryLabel: p.is_hidden_gem ? 'Hidden Gem' : 'Google Radar',
                badgeText: p.is_hidden_gem ? 'Hidden Gem' : 'Google Radar',
                district: p.vicinity || 'Uttarakhand',
                region: 'Himalayan Radar',
                coordinates: [p.location.lat, p.location.lng],
                altitude: '2,200m',
                altitudeNum: 2200,
                image: p.photo_urls?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
                description: p.highlight || p.vicinity || 'Verified Google Places spot in Uttarakhand.',
                link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${p.vicinity}`)}`,
                isExternal: true,
                rating: p.rating || 4.8,
                user_ratings_total: p.user_ratings_total || 50,
                _raw: p
              });
            }
          });
        }

        // Always ensure comprehensive set of iconic Uttarakhand destinations exist
        const defaults = [
          { name: 'Kedarnath Temple', category: 'spiritual', district: 'Rudraprayag', coords: [30.7333, 79.0667], altitude: '3,583m' },
          { name: 'Adi Kailash', category: 'destination', district: 'Pithoragarh', coords: [30.3167, 80.6333], altitude: '5,945m' },
          { name: 'Badrinath Dham', category: 'spiritual', district: 'Chamoli', coords: [30.7465, 79.4942], altitude: '3,300m' },
          { name: 'Auli Ski Meadow', category: 'activity', district: 'Chamoli', coords: [30.5189, 79.5674], altitude: '2,800m' },
          { name: 'Rishikesh & Ganga Ghats', category: 'destination', district: 'Dehradun', coords: [30.0869, 78.2676], altitude: '372m' },
          { name: 'Valley of Flowers', category: 'destination', district: 'Chamoli', coords: [30.7280, 79.5960], altitude: '3,658m' },
          { name: 'Mussoorie Queen of Hills', category: 'destination', district: 'Dehradun', coords: [30.4598, 78.0644], altitude: '2,005m' },
          { name: 'Lansdowne Hill Cantonment', category: 'destination', district: 'Pauri Garhwal', coords: [29.8378, 78.6818], altitude: '1,706m' },
          { name: 'Nainital Lake City', category: 'destination', district: 'Nainital', coords: [29.3919, 79.4542], altitude: '2,084m' },
          { name: 'Haridwar Railhead Hub', category: 'destination', district: 'Haridwar', coords: [29.9457, 78.1642], altitude: '314m' },
          { name: 'Chopta & Tungnath Meadow', category: 'activity', district: 'Rudraprayag', coords: [30.4889, 79.2172], altitude: '3,680m' },
          { name: 'Ranikhet Pine Ridge', category: 'destination', district: 'Almora', coords: [29.6434, 79.4322], altitude: '1,869m' },
          { name: 'Kausani Himalayan View', category: 'destination', district: 'Bageshwar', coords: [29.8447, 79.5969], altitude: '1,890m' },
          { name: 'Dayara Bugyal High Alpine', category: 'activity', district: 'Uttarkashi', coords: [30.8520, 78.5410], altitude: '3,650m' },
          { name: 'Gangotri Dham Glacier', category: 'spiritual', district: 'Uttarkashi', coords: [30.9940, 79.0706], altitude: '3,048m' },
          { name: 'Yamunotri Dham Source', category: 'spiritual', district: 'Uttarkashi', coords: [31.0140, 78.4600], altitude: '3,291m' },
          { name: 'Hemkund Sahib Gurudwara', category: 'spiritual', district: 'Chamoli', coords: [30.7000, 79.5800], altitude: '4,160m' },
          { name: 'Munsiyari Panchachuli Base', category: 'destination', district: 'Pithoragarh', coords: [30.0667, 80.2333], altitude: '2,200m' },
          { name: 'Joshimath Himalayan Gateway', category: 'destination', district: 'Chamoli', coords: [30.5560, 79.5660], altitude: '1,890m' },
          { name: 'Uttarkashi Bhagirathi Valley', category: 'destination', district: 'Uttarkashi', coords: [30.7248, 78.4464], altitude: '1,158m' },
          { name: 'Dhanaulti Eco Park', category: 'destination', district: 'Tehri Garhwal', coords: [30.4500, 78.2300], altitude: '2,286m' },
          { name: 'Chakrata Tiger Falls', category: 'destination', district: 'Dehradun', coords: [30.7016, 77.8696], altitude: '2,118m' },
          { name: 'Almora Cultural Hub', category: 'destination', district: 'Almora', coords: [29.5971, 79.6591], altitude: '1,638m' },
          { name: 'Askot Musk Deer Sanctuary', category: 'destination', district: 'Pithoragarh', coords: [29.7600, 80.3500], altitude: '2,150m' },
        ];

        defaults.forEach((df, i) => {
          const exists = all.some(
            (item) => item.name.toLowerCase().includes(df.name.toLowerCase().slice(0, 8))
          );
          if (!exists) {
            all.push({
              id: `default-${i}`,
              name: df.name,
              slug: df.name.toLowerCase().replace(/\s+/g, '-'),
              type: df.category,
              categoryLabel: df.category.toUpperCase(),
              district: df.district,
              coordinates: df.coords,
              altitude: df.altitude,
              altitudeNum: parseInt(df.altitude.replace(/[^0-9]/g, ''), 10) || 2000,
              image: 'https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=800&auto=format&fit=crop',
              description: `Iconic Himalayan landmark in ${df.district}, Uttarakhand.`,
              link: `/${df.category === 'stay' ? 'stays' : df.category === 'spiritual' ? 'spiritual' : 'destinations'}/${df.name.toLowerCase().replace(/\s+/g, '-')}`,
            });
          }
        });

        setLocations(all);
        if (all.length > 0) {
          setActiveLocation(all[0]);
        }
      } catch (err) {
        console.error('[MapPage] Error loading records:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: locations.length, destination: 0, spiritual: 0, activity: 0, stay: 0, rental: 0, radar: 0 };
    locations.forEach((l) => {
      if (counts[l.type] !== undefined) counts[l.type]++;
    });
    return counts;
  }, [locations]);

  // Filtered locations for Map & Sidebar
  const filteredLocations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const sq = sidebarSearch.toLowerCase().trim();

    let list = locations.filter((loc) => {
      const catMatch = selectedCategory === 'All' || loc.type === selectedCategory;
      const qMatch =
        !q ||
        loc.name.toLowerCase().includes(q) ||
        loc.district.toLowerCase().includes(q) ||
        (loc.region && loc.region.toLowerCase().includes(q));
      const sqMatch =
        !sq ||
        loc.name.toLowerCase().includes(sq) ||
        loc.district.toLowerCase().includes(sq);

      return catMatch && qMatch && sqMatch;
    });

    if (sortBy === 'altitude') {
      list.sort((a, b) => b.altitudeNum - a.altitudeNum);
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [locations, selectedCategory, searchQuery, sidebarSearch, sortBy]);

  // Select location & center map
  const handleSelectLocation = useCallback((loc) => {
    setActiveLocation(loc);
    setFlyCoords([...loc.coordinates]);
  }, []);

  // Toggle Trip Cart
  const handleToggleTrip = useCallback(
    (loc) => {
      const isAdded = tripIds.has(loc.id);
      if (isAdded) {
        removeTripDestination(loc.id);
      } else {
        addTripDestination({
          ...(loc._raw || {}),
          id: loc.id,
          _id: loc.id,
          name: loc.name,
          slug: loc.slug,
          district: loc.district,
          image: loc.image,
          coordinates: loc.coordinates,
          category: loc.type,
          altitude: loc.altitude,
          altitudeNum: loc.altitudeNum,
        });
      }
    },
    [tripIds, addTripDestination, removeTripDestination]
  );

  const currentTile = TILE_PRESETS[activeTile] || TILE_PRESETS.terrain;

  // Popular landmarks for quick search popup
  const popularSuggestions = useMemo(() => {
    const popularKeys = ['kedarnath', 'adi-kailash', 'auli', 'rishikesh', 'badrinath', 'valley-of-flowers', 'nainital'];
    const matches = [];
    popularKeys.forEach((key) => {
      const found = locations.find((l) => (l.slug || l.name || '').toLowerCase().includes(key));
      if (found) matches.push(found);
    });
    return matches.length > 0 ? matches.slice(0, 4) : locations.slice(0, 4);
  }, [locations]);

  // Live local DB search matches
  const dbSearchMatches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return locations
      .filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          loc.district.toLowerCase().includes(q) ||
          (loc.region && loc.region.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [locations, searchQuery]);

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] text-slate-800 font-sans overflow-hidden antialiased select-none">
      
      {/* ── 1. Top Navbar (Consistent Brand Standard) ───────────── */}
      <Navbar />

      {/* ── 2. SubHeader Filters & Search Bar ─────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-6 py-2.5 shrink-0 z-20 shadow-xs" data-purpose="filter-bar">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-full">
          
          {/* Search Input & Category Filter Chips */}
          <div className="flex items-center flex-1 min-w-0 gap-2.5 overflow-x-auto no-scrollbar py-0.5">
            
            {/* Search Bar with Popular Destinations & Live GIS Popup */}
            <div className="relative min-w-[260px] sm:min-w-[300px] lg:min-w-[360px] shrink-0 z-30" ref={searchContainerRef}>
              <div className="relative flex items-center">
                {/* Clickable Search / Spinner Button */}
                <button
                  type="button"
                  onClick={() => handleExecuteSearch(searchQuery)}
                  className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#0f3d2e] hover:text-emerald-700 transition cursor-pointer z-10"
                  title="Search places, shrines & Live Map API (Enter)"
                >
                  {isSearchingApi ? (
                    <Loader2 size={16} className="animate-spin text-[#0f3d2e]" />
                  ) : (
                    <Search size={16} className="hover:scale-110 transition-transform" />
                  )}
                </button>

                <input
                  id="map-search-input"
                  type="text"
                  placeholder="Search places, towns, live map GIS..."
                  value={searchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleExecuteSearch(searchQuery);
                    }
                  }}
                  className="w-full pl-9 pr-18 py-2 text-xs font-semibold bg-stone-50/80 border border-stone-200 rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/30 focus:border-[#0f3d2e] focus:bg-white text-stone-900 placeholder:text-stone-400 placeholder:font-normal transition-all"
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1 z-10">
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setApiSearchResults([]);
                      }}
                      className="p-1 text-stone-400 hover:text-stone-600 rounded-full cursor-pointer"
                      title="Clear search"
                    >
                      <X size={13} />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => handleExecuteSearch(searchQuery)}
                    className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-50 hover:bg-[#0f3d2e] text-[#0f3d2e] hover:text-white border border-emerald-200 rounded-lg transition shadow-2xs cursor-pointer"
                    title="Run live search"
                  >
                    Go
                  </button>
                </div>
              </div>

              {/* Comprehensive Dropdown: Local DB Matches + Live Satellite/GIS API */}
              {searchFocused && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/98 backdrop-blur-md border border-stone-200 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-stone-100 animate-in fade-in slide-in-from-top-1 duration-150 max-h-[440px] flex flex-col">
                  
                  {/* If user hasn't typed anything yet: Show Popular Destinations */}
                  {!searchQuery.trim() ? (
                    <div>
                      <div className="px-3.5 py-2 bg-stone-50/90 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        <span>Popular Destinations (1-Tap Explore)</span>
                        <span className="text-[9px] font-normal lowercase text-stone-400">click to view</span>
                      </div>
                      <div className="p-1.5 max-h-64 overflow-y-auto">
                        {popularSuggestions.map((pop) => (
                          <button
                            key={pop.id}
                            type="button"
                            onClick={() => handleSelectSearchResult(pop)}
                            className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-stone-50 flex items-center justify-between group/item transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 text-[#0f3d2e] flex items-center justify-center shrink-0">
                                <Mountain size={12} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-stone-900 truncate">{pop.name}</p>
                                <p className="text-[10px] text-stone-500 truncate">{pop.district} • {pop.altitude}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-[#0f3d2e] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {pop.categoryLabel}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* User is actively searching */
                    <div className="overflow-y-auto flex-1 divide-y divide-stone-100">
                      
                      {/* Section 1: Matching Database Locations */}
                      {dbSearchMatches.length > 0 && (
                        <div>
                          <div className="px-3.5 py-1.5 bg-stone-50/90 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-500">
                            <span>Database Locations ({dbSearchMatches.length})</span>
                            <span className="text-[9px] font-semibold text-emerald-800">Verified</span>
                          </div>
                          <div className="p-1 space-y-0.5">
                            {dbSearchMatches.map((loc) => (
                              <button
                                key={loc.id}
                                type="button"
                                onClick={() => handleSelectSearchResult(loc)}
                                className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-emerald-50/60 flex items-center justify-between transition-colors cursor-pointer group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-6 h-6 rounded-lg bg-emerald-100/70 text-[#0f3d2e] flex items-center justify-center shrink-0 border border-emerald-200">
                                    <MapPin size={12} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-stone-900 truncate group-hover:text-[#0f3d2e]">{loc.name}</p>
                                    <p className="text-[10px] text-stone-500 truncate">{loc.district} • {loc.altitude}</p>
                                  </div>
                                </div>
                                <span className="text-[9px] font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                                  {loc.categoryLabel}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 2: Live GIS & Satellite Map API Results */}
                      <div>
                        <div className="px-3.5 py-1.5 bg-emerald-50/60 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#0f3d2e] border-y border-emerald-100">
                          <span className="flex items-center gap-1.5">
                            <Compass size={11} className="text-[#0f3d2e]" />
                            <span>Live GIS &amp; Satellite Map Results</span>
                          </span>
                          {isSearchingApi ? (
                            <span className="flex items-center gap-1 text-[9px] text-[#0f3d2e]">
                              <Loader2 size={10} className="animate-spin" /> Searching...
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-emerald-700">{apiSearchResults.length} found</span>
                          )}
                        </div>

                        {isSearchingApi && apiSearchResults.length === 0 ? (
                          <div className="p-3.5 flex items-center gap-2.5 text-xs text-stone-500">
                            <Loader2 size={13} className="animate-spin text-[#0f3d2e] shrink-0" />
                            <span>Querying Geoapify &amp; Map Satellite GIS across Uttarakhand...</span>
                          </div>
                        ) : apiSearchResults.length > 0 ? (
                          <div className="p-1 space-y-0.5">
                            {apiSearchResults.map((place) => (
                              <button
                                key={place.id}
                                type="button"
                                onClick={() => handleSelectSearchResult(place)}
                                className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-emerald-50/70 flex items-center justify-between transition-colors cursor-pointer group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-6 h-6 rounded-lg bg-[#0f3d2e] text-emerald-300 flex items-center justify-center shrink-0">
                                    <Globe size={12} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-stone-900 truncate group-hover:text-[#0f3d2e]">{place.name}</p>
                                    <p className="text-[10px] text-stone-500 truncate">{place.district}</p>
                                  </div>
                                </div>
                                <span className="text-[9px] font-black text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                                  Live Pin 📍
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : !isSearchingApi && dbSearchMatches.length === 0 ? (
                          <div className="p-4 text-center space-y-2">
                            <p className="text-xs text-stone-500">
                              No places found matching &ldquo;{searchQuery}&rdquo;.
                            </p>
                            <button
                              type="button"
                              onClick={() => handleExecuteSearch(searchQuery)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0f3d2e] hover:bg-[#15533f] rounded-xl shadow-xs transition cursor-pointer"
                            >
                              <Search size={12} />
                              <span>Search Live Uttarakhand GIS</span>
                            </button>
                          </div>
                        ) : null}
                      </div>

                    </div>
                  )}

                  {/* Bottom Instant API Query Button */}
                  {searchQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => handleExecuteSearch(searchQuery)}
                      className="w-full text-left p-2.5 bg-stone-50 hover:bg-emerald-50 text-[#0f3d2e] flex items-center justify-between text-xs font-bold transition border-t border-stone-200 cursor-pointer shrink-0"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <Globe size={13} className="text-[#0f3d2e] shrink-0" />
                        <span className="truncate">Search entire Uttarakhand via Live Map GIS for &ldquo;{searchQuery}&rdquo;</span>
                      </span>
                      <ArrowRight size={13} className="shrink-0" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Category Filter Chip: All */}
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-[#0f3d2e] text-white shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              <Compass size={13} />
              <span>All</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ml-0.5 ${
                selectedCategory === 'All' ? 'bg-[#09261c] text-emerald-200' : 'bg-stone-200 text-stone-600'
              }`}>
                {categoryCounts.All}
              </span>
            </button>

            {/* Category Filter Chip: Destinations */}
            <button
              type="button"
              onClick={() => setSelectedCategory('destination')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedCategory === 'destination'
                  ? 'bg-[#0f3d2e] text-white shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              <Mountain size={13} className={selectedCategory === 'destination' ? 'text-emerald-300' : 'text-stone-500'} />
              <span>Destinations</span>
              <span className={`text-[11px] font-semibold ${selectedCategory === 'destination' ? 'text-emerald-200' : 'text-stone-400'}`}>
                {categoryCounts.destination}
              </span>
            </button>

            {/* Category Filter Chip: Spiritual */}
            <button
              type="button"
              onClick={() => setSelectedCategory('spiritual')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedCategory === 'spiritual'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              <Sparkles size={13} className={selectedCategory === 'spiritual' ? 'text-amber-200' : 'text-amber-500'} />
              <span>Spiritual</span>
              <span className={`text-[11px] font-semibold ${selectedCategory === 'spiritual' ? 'text-amber-200' : 'text-stone-400'}`}>
                {categoryCounts.spiritual}
              </span>
            </button>

            {/* Category Filter Chip: Adventures */}
            <button
              type="button"
              onClick={() => setSelectedCategory('activity')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedCategory === 'activity'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              <ActivityIcon size={13} className={selectedCategory === 'activity' ? 'text-blue-200' : 'text-blue-500'} />
              <span>Adventures</span>
              <span className={`text-[11px] font-semibold ${selectedCategory === 'activity' ? 'text-blue-200' : 'text-stone-400'}`}>
                {categoryCounts.activity}
              </span>
            </button>

            {/* Category Filter Chip: Partner Stays & Homestays */}
            <button
              type="button"
              onClick={() => setSelectedCategory('stay')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedCategory === 'stay'
                  ? 'bg-[#0f3d2e] text-white shadow-xs ring-2 ring-emerald-400/50'
                  : 'bg-emerald-50/70 hover:bg-emerald-100/80 text-[#0f3d2e] border border-emerald-200'
              }`}
            >
              <Hotel size={13} className={selectedCategory === 'stay' ? 'text-emerald-300' : 'text-[#0f3d2e]'} />
              <span>Stays & Lodges</span>
              <span className={`text-[11px] font-semibold ${selectedCategory === 'stay' ? 'text-emerald-200' : 'text-[#0f3d2e]'}`}>
                {categoryCounts.stay || 0}
              </span>
            </button>

            {/* Category Filter Chip: Rentals & Vehicle Fleets */}
            <button
              type="button"
              onClick={() => setSelectedCategory('rental')}
       
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedCategory === 'rental'
                  ? 'bg-sky-700 text-white shadow-xs ring-2 ring-sky-400/50'
                  : 'bg-sky-50/70 hover:bg-sky-100 text-sky-800 border border-sky-200'
              }`}
            >
              <Car size={13} className={selectedCategory === 'rental' ? 'text-sky-200' : 'text-sky-600'} />
              <span>Rentals & Fleets</span>
              <span className={`text-[11px] font-semibold ${selectedCategory === 'rental' ? 'text-sky-200' : 'text-sky-700'}`}>
                {categoryCounts.rental || 0}
              </span>
            </button>

            {/* ── TOOLS dropdown: Google Places + Himalayan Routes ── */}
            <div className="relative shrink-0" ref={moreDropdownRef}>
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(o => !o)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                  moreDropdownOpen
                    ? 'bg-[#0f3d2e] text-white border-[#0f3d2e]'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
                title="More map tools"
              >
                <Zap size={12} className={moreDropdownOpen ? 'text-emerald-300' : 'text-stone-500'} />
                <span>Tools</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Map Tools</p>
                  </div>

                  {/* Google Places Finder */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(selectedCategory === 'radar' ? 'All' : 'radar');
                      setMoreDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left cursor-pointer ${
                      selectedCategory === 'radar'
                        ? 'bg-emerald-50 text-[#0f3d2e]'
                        : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedCategory === 'radar' ? 'bg-[#0f3d2e]' : 'bg-stone-100'
                    }`}>
                      <Sparkles size={14} className={selectedCategory === 'radar' ? 'text-emerald-300' : 'text-emerald-600'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold">Google Places Finder</p>
                      <p className="text-[10px] text-stone-500">Live satellite search across Uttarakhand</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      selectedCategory === 'radar' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                    }`}>{categoryCounts.radar || 0}</span>
                  </button>

                  {/* Himalayan Routes Finder */}
                  <button
                    type="button"
                    onClick={() => {
                      setTransitDrawerOpen(true);
                      setMoreDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left cursor-pointer group border-t border-stone-100"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#0f3d2e] flex items-center justify-center shrink-0">
                      <Navigation size={14} className="text-emerald-300 group-hover:rotate-12 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0f3d2e]">Himalayan Routes Finder</p>
                      <p className="text-[10px] text-stone-500">Corridors, transit, altitude waypoints</p>
                    </div>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Open →</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Right Count Indicator & Sidebar Toggle */}
          <div className="flex items-center gap-2.5 text-xs font-medium text-stone-500 shrink-0">

            <span className="hidden xl:inline-block text-stone-400 font-medium">
              {filteredLocations.length} of {locations.length} places
            </span>
            
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              {sidebarOpen ? 'Hide List' : 'Show List'}
            </button>
          </div>

        </div>
      </div>

      {/* ── 3. Main Content: Map (Left 75%) + Sidebar (Right 25%) ── */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0 relative overflow-hidden" data-purpose="viewport-container">
        
        {/* ── Left Map Canvas (75% / flex-1) ────────────────────── */}
        <section className="flex-1 relative bg-[#e7edee] overflow-hidden select-none" data-purpose="topographic-map">
          
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-[600]">
              <div className="w-10 h-10 border-3 border-[#1b4332]/20 border-t-[#1b4332] rounded-full animate-spin" />
              <span className="text-xs font-bold text-[#1b4332] uppercase tracking-wider">
                Loading Verified Uttarakhand Map GIS…
              </span>
            </div>
          )}

          {/* Top Left: Unified Premium Glassmorphic Map Control Dock */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-[400] flex items-center gap-1.5 select-none">
            <div className="flex items-center bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-md border border-stone-200/90 text-xs font-medium">
              {/* Map Tile Switchers */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTile('geoapify')}
                  className={`px-3 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1.5 ${
                    activeTile === 'geoapify'
                      ? 'bg-[#0f3d2e] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Compass size={13} className={activeTile === 'geoapify' ? 'text-emerald-300' : 'text-stone-400'} />
                  <span>Geoapify HD</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTile('voyager')}
                  className={`px-3 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1.5 ${
                    activeTile === 'voyager'
                      ? 'bg-[#0f3d2e] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Navigation size={13} className={activeTile === 'voyager' ? 'text-emerald-300' : 'text-stone-400'} />
                  <span>Highways</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTile('satellite')}
                  className={`px-3 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1.5 ${
                    activeTile === 'satellite'
                      ? 'bg-[#0f3d2e] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Layers size={13} className={activeTile === 'satellite' ? 'text-emerald-300' : 'text-stone-400'} />
                  <span>Satellite 3D</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTile('dark')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1.5 ${
                    activeTile === 'dark'
                      ? 'bg-[#0f3d2e] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <span>🌙</span>
                  <span className="hidden sm:inline">Night</span>
                </button>
              </div>

              {/* Vertical Divider */}
              <div className="h-5 w-px bg-stone-200 mx-1 shrink-0" />

              {/* Safety Radar Dropdown Trigger in Same Dock */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSafetyPanelOpen(!safetyPanelOpen)}
                  className={`px-3 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1.5 cursor-pointer ${
                    safetyPanelOpen || Object.values(safetyLayers).some(Boolean)
                      ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <ShieldAlert size={14} className="text-amber-600 shrink-0" />
                  <span className="text-xs">Safety Radar</span>
                  {safetyPanelOpen ? (
                    <ChevronUp size={13} className="text-stone-400" />
                  ) : (
                    <ChevronDown size={13} className="text-stone-400" />
                  )}
                </button>

                {/* Safety Radar Dropdown Popover */}
                {safetyPanelOpen && (
                  <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200/90 p-3 space-y-2 text-xs animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                    <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                      <span className="font-extrabold text-stone-800 text-[11px] uppercase tracking-wider">
                        Mountain Safety GIS
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        Live Sentinel
                      </span>
                    </div>

                    <label className="flex items-center justify-between gap-2 cursor-pointer hover:bg-stone-50 p-1.5 rounded-xl transition">
                      <div className="flex items-center gap-2 min-w-0">
                        <AlertTriangle size={13} className="text-rose-600 shrink-0" />
                        <span className="font-semibold text-stone-700 truncate text-[11px]">Landslide Risk Corridors</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={safetyLayers.landslideRisk}
                        onChange={(e) => setSafetyLayers((s) => ({ ...s, landslideRisk: e.target.checked }))}
                        className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer shrink-0"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-2 cursor-pointer hover:bg-stone-50 p-1.5 rounded-xl transition">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mountain size={13} className="text-amber-600 shrink-0" />
                        <span className="font-semibold text-stone-700 truncate text-[11px]">Altitude Zones (&gt;3,000m)</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={safetyLayers.altitudeWarning}
                        onChange={(e) => setSafetyLayers((s) => ({ ...s, altitudeWarning: e.target.checked }))}
                        className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer shrink-0"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-2 cursor-pointer hover:bg-stone-50 p-1.5 rounded-xl transition">
                      <div className="flex items-center gap-2 min-w-0">
                        <CloudRain size={13} className="text-blue-600 shrink-0" />
                        <span className="font-semibold text-stone-700 truncate text-[11px]">Weather Alert Areas</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={safetyLayers.weatherAlert}
                        onChange={(e) => setSafetyLayers((s) => ({ ...s, weatherAlert: e.target.checked }))}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer shrink-0"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-2 cursor-pointer hover:bg-stone-50 p-1.5 rounded-xl transition">
                      <div className="flex items-center gap-2 min-w-0">
                        <Radio size={13} className="text-emerald-600 shrink-0" />
                        <span className="font-semibold text-stone-700 truncate text-[11px]">Sentinel SOS Beacons</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={safetyLayers.safetyGrid}
                        onChange={(e) => setSafetyLayers((s) => ({ ...s, safetyGrid: e.target.checked }))}
                        className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer shrink-0"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Himalayan Corridor Floating Status Pill with Start & Real Google Maps Actions */}
          {activeCorridorId && !transitDrawerOpen && HIMALAYAN_CORRIDORS[activeCorridorId] && (() => {
            const corr = HIMALAYAN_CORRIDORS[activeCorridorId];
            const firstSt = corr.stations[0];
            const lastSt = corr.stations[corr.stations.length - 1];
            const gMapsUrl = firstSt && lastSt
              ? `https://www.google.com/maps/dir/?api=1&origin=${firstSt.coords[0]},${firstSt.coords[1]}&destination=${lastSt.coords[0]},${lastSt.coords[1]}&travelmode=driving`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(corr.name + ' Uttarakhand')}`;

            return (
              <div className="absolute top-4 right-4 z-[400] flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-emerald-200 animate-in fade-in slide-in-from-top-2 duration-200 max-w-[calc(100vw-2rem)]">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: corr.color }}
                  />
                  <div className="text-left">
                    <p className="text-xs font-black text-stone-900 leading-tight">
                      {corr.name}
                    </p>
                    <p className="text-[10px] text-stone-500 font-semibold">
                      {corr.totalKm} • {corr.duration}
                    </p>
                  </div>
                </div>
                <div className="h-5 w-px bg-stone-200 shrink-0 hidden sm:block" />

                {/* Start Navigation on Map Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (firstSt?.coords) {
                      setFlyCoords({ coords: firstSt.coords, zoom: 15 });
                    }
                  }}
                  className="text-xs font-bold text-white bg-[#0f3d2e] hover:bg-[#185340] px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Start journey from first corridor stop on map"
                >
                  <Navigation size={11} className="text-emerald-300" />
                  <span>Start Here</span>
                </button>

                {/* Real Google Maps Button */}
                <a
                  href={gMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#0f3d2e] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Open turn-by-turn navigation in official Google Maps app"
                >
                  <ExternalLink size={11} />
                  <span>Google Maps ↗</span>
                </a>

                {/* Details Drawer Button */}
                <button
                  type="button"
                  onClick={() => setTransitDrawerOpen(true)}
                  className="text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <span>Details</span>
                  <ChevronRight size={12} />
                </button>

                {/* Clear Button */}
                <button
                  type="button"
                  onClick={() => setActiveCorridorId(null)}
                  className="w-6 h-6 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 flex items-center justify-center transition cursor-pointer"
                  title="Clear Corridor Layer"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })()}

          {/* Leaflet Map Engine */}
          <MapContainer
            center={MAP_CENTER}
            zoom={MAP_ZOOM}
            minZoom={MAP_MIN_ZOOM}
            maxZoom={MAP_MAX_ZOOM}
            zoomControl={false}
            scrollWheelZoom
            className="w-full h-full"
          >
            <TileLayer
              url={currentTile.url}
              attribution={currentTile.attribution}
              subdomains={currentTile.subdomains || 'abcd'}
              maxZoom={currentTile.maxZoom || 19}
            />

            <MapResizerAndFlyTo coords={flyCoords} selectedTile={activeTile} />

            {/* ── 0. Himalayan Transit Corridors & Subway Stations Layer (YoMetro Style) ── */}
            <HimalayanCorridorsLayer activeCorridorId={activeCorridorId} />

            {/* Bottom-Left Navigation Tools inside Leaflet Context */}
            <div className="absolute bottom-20 left-4 z-[400]">
              <MapNavigationTools onRecenter={() => setActiveLocation(null)} />
            </div>

            {/* ── Safety Overlays ── */}
            {safetyLayers.landslideRisk &&
              SAFETY_DATA.landslideCorridors.map((c, i) => (
                <Polyline
                  key={`landslide-${i}`}
                  positions={c.coordinates}
                  pathOptions={{ color: '#e11d48', weight: 5, opacity: 0.85, dashArray: '8, 6' }}
                >
                  <Tooltip sticky>
                    <div className="p-1 font-sans text-xs">
                      <strong className="text-rose-600 block">⚠️ {c.name}</strong>
                      <span className="text-slate-700 block text-[11px]">{c.risk}</span>
                      <span className="text-emerald-700 font-bold block text-[10px] mt-0.5">{c.reroute}</span>
                    </div>
                  </Tooltip>
                </Polyline>
              ))}

            {safetyLayers.altitudeWarning &&
              SAFETY_DATA.altitudeZones.map((z, i) => (
                <Polygon
                  key={`alt-${i}`}
                  positions={z.polygon}
                  pathOptions={{ color: '#d97706', fillColor: '#f59e0b', fillOpacity: 0.2, weight: 2, dashArray: '4, 4' }}
                >
                  <Tooltip sticky>
                    <div className="p-1 font-sans text-xs">
                      <strong className="text-amber-700 block">⛰️ {z.name}</strong>
                      <span className="text-slate-700 text-[11px]">{z.elevation}</span>
                      <span className="text-rose-600 font-bold block text-[10px]">{z.advisory}</span>
                    </div>
                  </Tooltip>
                </Polygon>
              ))}

            {safetyLayers.weatherAlert &&
              SAFETY_DATA.weatherAreas.map((w, i) => (
                <Circle
                  key={`weather-${i}`}
                  center={w.center}
                  radius={w.radius}
                  pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.16, weight: 2 }}
                >
                  <Tooltip sticky>
                    <div className="p-1 font-sans text-xs">
                      <strong className="text-blue-700 block">🌧️ {w.name}</strong>
                      <span className="text-slate-600 text-[10px]">{w.alert}</span>
                    </div>
                  </Tooltip>
                </Circle>
              ))}

            {safetyLayers.safetyGrid &&
              SAFETY_DATA.sentinelBeacons.map((b, i) => (
                <Marker
                  key={`sentinel-${i}`}
                  position={b.coords}
                  icon={L.divIcon({
                    className: '',
                    html: `
                      <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
                        <div style="position:absolute;inset:-4px;border-radius:50%;background:#10b981;opacity:0.4;animation:ping 2s infinite;"></div>
                        <div style="width:16px;height:16px;border-radius:50%;background:#1b4332;border:2px solid #ffffff;box-shadow:0 0 10px #10b981;"></div>
                      </div>
                    `,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                  })}
                >
                  <Popup>
                    <div className="p-2 font-sans text-xs">
                      <div className="font-bold text-emerald-900 flex items-center gap-1 mb-0.5">
                        <span>🛡️ {b.name}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] m-0">24/7 Verified Sentinel SOS Beacon</p>
                      <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Response: &lt;{b.responseTime}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              ))}

            {/* ── Category Location Markers (Clustered) ── */}
            <MarkerClusterGroup
              chunkedLoading
              iconCreateFunction={createClusterIcon}
              spiderfyOnMaxZoom
              showCoverageOnHover={false}
              zoomToBoundsOnClick
              maxClusterRadius={50}
              disableClusteringAtZoom={13}
            >
              {filteredLocations.map((loc) => {
                const isSelected = activeLocation?.id === loc.id;
                const isInTrip = tripIds.has(loc.id);

                return (
                  <Marker
                    key={loc.id}
                    position={loc.coordinates}
                    icon={createCustomMarkerIcon(loc.type, isSelected)}
                    eventHandlers={{
                      click: () => setActiveLocation(loc),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -16]} opacity={0.95}>
                      <div className="font-sans text-xs font-bold text-slate-900">
                        {loc.name} <span className="font-normal text-slate-500">• {loc.district}</span>
                      </div>
                    </Tooltip>

                    {/* Rich Interactive Popup */}
                    <Popup minWidth={260} maxWidth={300}>
                      <div className="p-1 font-sans">
                        <div className="relative h-28 w-full rounded-xl overflow-hidden bg-stone-100 mb-2">
                          <img
                            src={loc.image}
                            alt={loc.name}
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=800&auto=format&fit=crop';
                            }}
                            className="w-full h-full object-cover"
                          />
                          {loc.type === 'stay' && (
                            <span className="absolute top-2 left-2 bg-[#0f3d2e]/90 backdrop-blur-xs text-emerald-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-400/30">
                              🏡 0% Direct Host
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="inline-block text-[9px] font-black uppercase tracking-wider text-[#0f3d2e] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {loc.type === 'stay' ? '🏡 Verified Partner Stay' : loc.categoryLabel}
                          </span>
                          {loc._raw?.pricePerNight && (
                            <span className="text-[11px] font-extrabold text-[#0f3d2e]">
                              ₹{loc._raw.pricePerNight.toLocaleString()}/nt
                            </span>
                          )}
                        </div>

                        <h4 className="font-black text-stone-900 text-sm leading-tight m-0 mb-0.5">
                          {loc.name}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-stone-500 mb-2">
                          <span>📍 {loc.district}</span>
                          <span className="font-bold text-[#0f3d2e]">⛰️ {loc.altitude}</span>
                        </div>

                        {/* Quick Mountain Connectivity Pill */}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 mb-2">
                          <Compass size={11} className="text-[#0f3d2e] shrink-0" />
                          <span className="truncate">Himalayan Route Connected</span>
                        </div>

                        {/* Primary Route Actions (Route To Here & Start From Here) */}
                        <div className="grid grid-cols-2 gap-1.5 mb-1.5 pt-1.5 border-t border-stone-200">
                          <button
                            type="button"
                            onClick={() => handleOpenRouteForPlace(loc, 'to')}
                            className="bg-[#0f3d2e] hover:bg-[#185340] text-white text-xs font-black py-2 px-2 rounded-xl text-center shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-[0.98]"
                            title={`Calculate Himalayan Route to ${loc.name}`}
                          >
                            <Navigation size={12} className="text-emerald-300" />
                            <span>Route To Here</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenRouteForPlace(loc, 'from')}
                            className="bg-emerald-50 hover:bg-emerald-100 text-[#0f3d2e] border border-emerald-300 text-xs font-black py-2 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-[0.98]"
                            title={`Start journey from ${loc.name}`}
                          >
                            <MapPin size={12} />
                            <span>Start From Here</span>
                          </button>
                        </div>

                        {/* Secondary Actions (Guide & Trip Planner) */}
                        <div className="flex items-center gap-1.5">
                          {loc.isExternal ? (
                            <a
                              href={loc.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold py-1.5 px-2.5 rounded-xl text-center border border-stone-200 transition-colors inline-flex items-center justify-center gap-1"
                            >
                              <span>Google Maps</span>
                              <ExternalLink size={11} />
                            </a>
                          ) : (
                            <Link
                              to={loc.link}
                              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold py-1.5 px-2.5 rounded-xl text-center border border-stone-200 transition-colors"
                            >
                              {loc.type === 'stay' ? 'Book Direct →' : 'Explore Guide →'}
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleTrip(loc)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              isInTrip
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
                            }`}
                          >
                            {isInTrip ? <Check size={12} /> : <Plus size={12} />}
                            <span>{isInTrip ? 'In Trip' : '+ Trip'}</span>
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          </MapContainer>

          {/* ── Floating Bottom Toolbar (Corridor Radar, Plan Trip, AI Copilot) ── */}
          <div className="absolute bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto" data-purpose="floating-quick-actions">
            <nav className="flex items-center gap-1 bg-[#0d281e]/95 backdrop-blur-xl px-2 py-1.5 rounded-full shadow-2xl border border-emerald-900/60 text-xs font-semibold text-white">
              {/* Action 1: Corridor Radar */}
              <button
                type="button"
                onClick={() => {
                  setSafetyLayers((s) => ({
                    ...s,
                    landslideRisk: !s.landslideRisk,
                    altitudeWarning: !s.altitudeWarning,
                    weatherAlert: !s.weatherAlert,
                    safetyGrid: !s.safetyGrid,
                  }));
                }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border shadow-xs cursor-pointer ${
                  safetyLayers.landslideRisk || safetyLayers.altitudeWarning
                    ? 'bg-amber-500/25 text-amber-300 border-amber-400/50'
                    : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-amber-300 border-amber-400/20'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <Shield size={14} />
                <span className="tracking-wide">Corridor Radar</span>
              </button>

              {/* Action 2: Plan Your Trip */}
              <Link
                to="/trip-planner"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 text-stone-200 hover:text-white transition-colors"
              >
                <Navigation size={14} className="text-emerald-400" />
                <span className="tracking-wide">Plan Trip</span>
              </Link>

              {/* Action 3: AI Copilot */}
              <Link
                to="/copilot"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 text-emerald-300 hover:text-emerald-200 transition-colors"
              >
                <Zap size={14} className="fill-current text-emerald-400" />
                <span className="tracking-wide">AI Copilot</span>
              </Link>
            </nav>
          </div>

        </section>

        {/* ── Right Location List Sidebar (25% / 360px - 410px) ───── */}
        <aside
          className={`${
            sidebarOpen ? 'flex' : 'hidden'
          } w-full md:w-[360px] lg:w-[410px] bg-stone-50 border-l border-stone-200 flex flex-col h-full z-20 shadow-lg md:shadow-none shrink-0`}
          data-purpose="locations-sidebar"
        >
          {/* Sidebar Header */}
          <div className="px-4 py-3.5 border-b border-stone-200 bg-white flex flex-col gap-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black tracking-wider text-stone-900 uppercase">
                    LOCATIONS
                  </h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#0f3d2e] text-white">
                    {filteredLocations.length}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5 font-medium">
                  {filteredLocations.length} verified places available
                </p>
              </div>

              {/* Sort Toggle Button */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSortBy(sortBy === 'name' ? 'altitude' : 'name')}
                  className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 transition cursor-pointer"
                  title={`Sorted by ${sortBy === 'name' ? 'Name (A-Z)' : 'Altitude (High-Low)'}`}
                >
                  <ArrowUpDown size={15} />
                </button>
              </div>
            </div>

            {/* Quick sidebar filter input */}
            <div className="relative flex items-center">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-stone-400">
                <Search size={13} />
              </span>
              <input
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Filter sidebar locations..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#0f3d2e] transition"
              />
              {sidebarSearch && (
                <button
                  type="button"
                  onClick={() => setSidebarSearch('')}
                  className="absolute right-2 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Partner Hub Quick Access Banner */}
          <div className="px-3 pt-2.5 shrink-0">
            <div className="p-2.5 bg-gradient-to-r from-emerald-50 to-stone-100 rounded-2xl border border-emerald-200/80 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#0f3d2e] text-emerald-200 flex items-center justify-center shrink-0">
                  <ShieldCheck size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-stone-900 leading-tight truncate">
                    0% Commission Partner Hub
                  </p>
                  <p className="text-[10px] text-stone-600 truncate">
                    Direct local homestays & mountain guides
                  </p>
                </div>
              </div>
              <Link
                to="/login?role=partner"
                className="shrink-0 px-2 py-1 rounded-lg bg-[#0f3d2e] text-white hover:bg-[#144c3a] text-[10px] font-bold tracking-tight shadow-xs transition-colors"
              >
                Join / Login ↗
              </Link>
            </div>
          </div>

          {/* Scrollable Location Cards List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5 pb-32 md:pb-6" data-purpose="scrollable-cards">
            {loading ? (
              <div className="text-center py-12 text-stone-400 text-xs font-medium">
                Loading locations…
              </div>
            ) : filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => {
                const isActive = activeLocation?.id === loc.id;
                const style = CATEGORY_STYLES[loc.type] || CATEGORY_STYLES.destination;
                const isStay = loc.type === 'stay';
                const price = loc._raw?.pricePerNight || (typeof loc._raw?.price === 'number' ? loc._raw.price : null);

                return (
                  <article
                    key={loc.id}
                    onClick={() => handleSelectLocation(loc)}
                    className={`p-2.5 bg-white rounded-2xl transition-all flex items-center gap-3.5 group cursor-pointer ${
                      isActive
                        ? 'border-2 border-[#0f3d2e] shadow-sm ring-2 ring-[#0f3d2e]/10'
                        : 'border border-stone-200/90 hover:border-[#0f3d2e]/40 shadow-2xs hover:shadow-md'
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                      <img
                        src={loc.image}
                        alt={loc.name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=800&auto=format&fit=crop';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isStay && (
                        <div className="absolute bottom-0 inset-x-0 bg-[#0f3d2e]/90 text-[8px] font-black text-emerald-200 text-center py-0.5 uppercase tracking-tighter">
                          Verified Host
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border ${style.bg} ${style.border} ${style.text}`}>
                          {style.badgeText}
                        </span>
                        {price && (
                          <span className="text-[10px] font-black text-[#0f3d2e]">
                            ₹{price.toLocaleString()}/nt
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-stone-900 truncate mt-1 group-hover:text-[#0f3d2e] transition-colors">
                        {loc.name}
                      </h3>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-stone-400 shrink-0" />
                        <span className="truncate">{loc.district}</span>
                        <span className="text-stone-300">•</span>
                        <span className="text-[11px] font-medium text-stone-400">{loc.altitude}</span>
                      </p>
                    </div>

                    {/* Right Indicator / Quick Route Action */}
                    <div className="flex items-center gap-1.5 pr-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenRouteForPlace(loc, 'to');
                        }}
                        className="w-7 h-7 rounded-xl bg-emerald-50 hover:bg-[#0f3d2e] text-[#0f3d2e] hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                        title={`Find Himalayan Route to ${loc.name}`}
                      >
                        <Navigation size={12} />
                      </button>
                      <div className="text-stone-400 group-hover:text-[#0f3d2e] group-hover:translate-x-0.5 transition-all">
                        <ArrowRight size={15} />
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="text-center py-12 text-stone-400 text-xs">
                No locations match your filter.
              </div>
            )}
          </div>
        </aside>

      </main>

      {/* ── 4. Himalayan Route Finder Slide-Over Drawer ── */}
      <TransitRouteDrawer
        isOpen={transitDrawerOpen}
        onClose={() => setTransitDrawerOpen(false)}
        activeCorridorId={activeCorridorId}
        onSelectCorridor={setActiveCorridorId}
        onFlyToCorridor={handleFlyToCorridor}
        routeTarget={routeTarget}
      />

    </div>
  );
}
