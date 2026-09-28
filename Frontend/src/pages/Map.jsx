import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Polyline,
  Polygon,
  Circle,
  CircleMarker,
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
  X,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Shield,
  AlertTriangle,
  Navigation,
  Compass,
  Zap,
  CheckCircle2,
  ExternalLink,
  Car,
  Loader2,
  Globe,
  Bus,
  Footprints,
} from 'lucide-react';
import { getDestinations } from '../api/destinationApi';
import { getSpiritualPlaces } from '../api/spiritualApi';
import { getActivities } from '../api/activityApi';
import { getStays } from '../api/stayApi';
import { getRentals } from '../api/rentalApi';
import { useMapStore } from '../store/mapStore';
import TransitRouteDrawer, {
  HimalayanCorridorsLayer,
  HIMALAYAN_CORRIDORS,
} from '../components/map/TransitRouteDrawer';
import RoutePlannerPanel, {
  CANONICAL_HUBS,
} from '../components/map/RoutePlannerPanel';
import {
  resolveLocationHub,
  calculateRoadRoute,
  calculateTransitRoute,
  calculateTrekRoute,
} from '../utils/travelRouterService';
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
  const size = isSelected ? 38 : 30;

  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:${style.color};
        border:${isSelected ? '3px solid #00FF88' : '2px solid #ffffff'};
        box-shadow:0 4px 12px rgba(15, 23, 42, 0.35);
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

// ─── Route Endpoint Marker Icons (From = Green, To = Rose) ─────
const createRouteEndpointIcon = (isOrigin = true) => {
  const color = isOrigin ? '#10b981' : '#e11d48';
  const label = isOrigin ? 'FROM' : 'TO';
  const icon = isOrigin ? '📍' : '🏔️';

  const html = `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
      <div style="
        background:${color};
        color:#ffffff;
        font-family:Inter,system-ui,sans-serif;
        font-size:10px;
        font-weight:900;
        padding:2px 8px;
        border-radius:12px;
        box-shadow:0 3px 10px rgba(0,0,0,0.3);
        border:2px solid #ffffff;
        white-space:nowrap;
        margin-bottom:2px;
        display:flex;
        align-items:center;
        gap:3px;
      ">
        <span>${icon}</span>
        <span>${label}</span>
      </div>
      <div style="
        width:12px;
        height:12px;
        background:${color};
        border:2px solid #ffffff;
        border-radius:50%;
        box-shadow:0 2px 6px rgba(0,0,0,0.4);
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'route-endpoint-marker',
    iconSize: [60, 42],
    iconAnchor: [30, 40],
    popupAnchor: [0, -42],
  });
};

// ─── Cluster Custom Icon ─────────────────────────────────────
const createClusterIcon = (cluster) => {
  const count = cluster.getChildCount();
  const size = count > 50 ? 44 : count > 20 ? 38 : 32;
  return L.divIcon({
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        background:#0f3d2e;
        color:#ffffff;
        border:2.5px solid #00FF88;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-family:Inter, system-ui, sans-serif;
        font-weight:800;
        font-size:${size > 36 ? 12 : 11}px;
        box-shadow:0 4px 14px rgba(15,61,46,0.5);
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
        map.fitBounds(coords.bounds, { padding: [60, 60], maxZoom: 12, duration: 1.2 });
      } else if (coords.coords && isValidCoord(coords.coords)) {
        map.flyTo(coords.coords, coords.zoom || 9, { duration: 1.2, easeLinearity: 0.25 });
      }
    }
  }, [coords, map]);

  return null;
}

// ─── Map Navigation Action Tools (GPS Locate + Recenter) ──────
function MapNavigationTools({ onRecenter, onLocateMe, isLocating, userLocation }) {
  const map = useMap();

  return (
    <div className="flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-xl border border-stone-200/90 text-slate-800">
      <button
        type="button"
        onClick={onLocateMe}
        aria-label="My Live Location"
        title="Find My Location (GPS)"
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
          isLocating
            ? 'bg-blue-50 text-blue-600 border border-blue-300'
            : userLocation
            ? 'bg-[#0f3d2e] text-[#00FF88] hover:bg-[#15533f]'
            : 'text-stone-700 hover:bg-stone-100 hover:text-blue-600'
        }`}
      >
        {isLocating ? (
          <Loader2 size={16} className="animate-spin text-blue-600" />
        ) : (
          <Compass size={17} className={userLocation ? 'text-[#00FF88] animate-pulse' : 'text-stone-700'} />
        )}
      </button>

      <div className="h-px bg-stone-200 my-0.5" />

      <button
        type="button"
        onClick={() => map.zoomIn()}
        aria-label="Zoom In"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors font-bold text-base cursor-pointer"
      >
        +
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        aria-label="Zoom Out"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors font-bold text-base cursor-pointer"
      >
        −
      </button>

      <div className="h-px bg-stone-200 my-0.5" />

      <button
        type="button"
        onClick={() => {
          map.flyTo(MAP_CENTER, MAP_ZOOM, { duration: 1.0 });
          if (onRecenter) onRecenter();
        }}
        aria-label="Recenter Map"
        title="Recenter to Central Uttarakhand"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#0f3d2e] hover:bg-stone-100 transition-colors cursor-pointer"
      >
        <Navigation size={16} className="text-[#0f3d2e]" />
      </button>
    </div>
  );
}

// ─── Main MapPage Component ──────────────────────────────────
export default function MapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // All catalog locations loaded in background for optional filters
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Active Category Filter for markers (Default: null = clean uncluttered map!)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);
  const [activeLocation, setActiveLocation] = useState(null);

  // Base Tile Layer (Default: Geoapify HD)
  const [activeTile, setActiveTile] = useState('geoapify');
  const currentTile = TILE_PRESETS[activeTile] || TILE_PRESETS.geoapify;

  // Viewport / FlyTo controller
  const [flyCoords, setFlyCoords] = useState(null);

  // Live GPS user location state (requested only with user permission)
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Mobile Bottom Sheet state for route planner
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Himalayan Transit Route Drawer (right-side slide-over)
  const [transitDrawerOpen, setTransitDrawerOpen] = useState(false);
  const [activeCorridorId, setActiveCorridorId] = useState(null);
  const [routeTarget, setRouteTarget] = useState(null);

  // ── Route Planner Primary State ──
  const [origin, setOrigin] = useState(() => CANONICAL_HUBS.find((h) => h.id === 'delhi'));
  const [destination, setDestination] = useState(() => CANONICAL_HUBS.find((h) => h.id === 'badrinath'));
  const [travelMode, setTravelMode] = useState('road'); // 'road' | 'transit' | 'trek'
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeResult, setRouteResult] = useState(null);

  // ── 1. Handle URL Query Parameters (AI Agent Integration: OPEN_MAP) ──
  useEffect(() => {
    const qDest = searchParams.get('destination');
    const qOrig = searchParams.get('origin');
    const qMode = searchParams.get('mode');

    let updated = false;
    let targetDest = destination;
    let targetOrig = origin;
    let targetMode = travelMode;

    if (qDest) {
      const resolved = resolveLocationHub(qDest);
      if (resolved) {
        setDestination(resolved);
        targetDest = resolved;
        updated = true;
      }
    }

    if (qOrig) {
      const resolved = resolveLocationHub(qOrig);
      if (resolved) {
        setOrigin(resolved);
        targetOrig = resolved;
        updated = true;
      }
    }

    if (qMode && ['road', 'transit', 'trek'].includes(qMode.toLowerCase())) {
      setTravelMode(qMode.toLowerCase());
      targetMode = qMode.toLowerCase();
      updated = true;
    }

    // Auto-calculate route if query was provided
    if (updated && targetDest && targetOrig) {
      executeRouteCalculation(targetOrig, targetDest, targetMode);
    }
  }, [searchParams]);

  // ── 2. Route Calculation Engine (OSRM Road, Transit Stepper, Alpine Trek) ──
  const executeRouteCalculation = useCallback(async (startHub, endHub, mode) => {
    if (!startHub || !endHub) return;
    setIsCalculating(true);

    try {
      let res;
      if (mode === 'transit') {
        res = calculateTransitRoute(startHub, endHub);
      } else if (mode === 'trek') {
        res = calculateTrekRoute(startHub, endHub);
      } else {
        res = await calculateRoadRoute(startHub, endHub);
      }

      if (res && res.success) {
        setRouteResult(res);

        // Auto-fit map to route bounds
        if (res.geometry && Array.isArray(res.geometry) && res.geometry.length > 0) {
          const lats = res.geometry.map((pt) => pt[0]);
          const lngs = res.geometry.map((pt) => pt[1]);
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
      } else {
        alert(res?.error || 'Road route unavailable right now. Mountain passes or road servers may be temporarily unreachable.');
      }
    } catch (err) {
      console.error('Route calculation error:', err);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  // ── handleFlyToCorridor — flies map to the midpoint of a Himalayan corridor ──
  const handleFlyToCorridor = useCallback((corridorIdOrCoords) => {
    if (!corridorIdOrCoords) return;
    if (typeof corridorIdOrCoords === 'string') {
      const corridor = HIMALAYAN_CORRIDORS[corridorIdOrCoords];
      if (corridor && corridor.stations && corridor.stations.length > 0) {
        const midIdx = Math.floor(corridor.stations.length / 2);
        const centerCoords = corridor.stations[midIdx]?.coords;
        if (centerCoords) setFlyCoords({ coords: centerCoords, zoom: 10 });
      }
    } else if (Array.isArray(corridorIdOrCoords)) {
      setFlyCoords({ coords: corridorIdOrCoords, zoom: 12 });
    }
  }, []);

  const handleFindRoute = useCallback(() => {
    executeRouteCalculation(origin, destination, travelMode);
  }, [origin, destination, travelMode, executeRouteCalculation]);

  const handleSwapLocations = useCallback(() => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    if (routeResult) {
      executeRouteCalculation(destination, temp, travelMode);
    }
  }, [origin, destination, travelMode, routeResult, executeRouteCalculation]);

  const handleResetRoute = useCallback(() => {
    setRouteResult(null);
  }, []);

  // ── 3. GPS Geolocation Handler (Requires User Permission) ──
  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        const accuracy = pos.coords.accuracy || 100;
        setUserLocation({ coords, accuracy });

        const gpsHub = {
          id: 'user-gps',
          name: 'My Current Location (GPS)',
          fullName: 'Live GPS Location Locked',
          coords,
          altitudeM: 350,
          altitude: '350m',
          district: 'Current GPS',
        };
        setOrigin(gpsHub);
        setFlyCoords({ coords, zoom: 14 });
        setIsLocating(false);
      },
      (err) => {
        console.warn('[MapPage] Geolocation error:', err);
        setIsLocating(false);
        alert('Location permission was not granted. Please select a starting city manually.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }, []);

  // ── 4. Background Load Catalog Data for Optional Category Filters ──
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [destRes, spirRes, actRes, stayRes, rentalRes] = await Promise.allSettled([
          getDestinations(),
          getSpiritualPlaces(),
          getActivities(),
          getStays(),
          getRentals(),
        ]);

        const all = [];
        const process = (res, type, label) => {
          if (res.status === 'fulfilled') {
            const arr = Array.isArray(res.value?.data) ? res.value.data : Array.isArray(res.value) ? res.value : [];
            arr.forEach((item) => {
              const coords = item.location?.coordinates
                ? [item.location.coordinates[1], item.location.coordinates[0]]
                : item.latitude && item.longitude
                ? [Number(item.latitude), Number(item.longitude)]
                : null;

              if (coords && isValidCoord(coords)) {
                all.push({
                  id: item._id || item.slug || `${type}-${Math.random()}`,
                  name: item.name || 'Himalayan Spot',
                  slug: item.slug || item._id,
                  type,
                  categoryLabel: label,
                  district: item.district || 'Uttarakhand',
                  coordinates: coords,
                  altitude: item.altitude || '1,800m',
                  image: item.coverImage?.url || item.image || 'https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=800&auto=format&fit=crop',
                  link: `/${type === 'stay' ? 'stays' : type === 'rental' ? 'rentals' : 'destinations'}/${item.slug || item._id}`,
                });
              }
            });
          }
        };

        process(destRes, 'destination', 'Destinations');
        process(spirRes, 'spiritual', 'Spiritual Shrines');
        process(actRes, 'activity', 'Adventures');
        process(stayRes, 'stay', 'Partner Stays');
        process(rentalRes, 'rental', 'Vehicle Fleets');

        setLocations(all);
      } catch (err) {
        console.warn('Background catalog load notice:', err);
      }
    };

    loadCatalog();
  }, []);

  // Filtered markers based on optional secondary toggle
  const visibleCategoryLocations = useMemo(() => {
    if (!activeCategoryFilter) return [];
    return locations.filter((l) => l.type === activeCategoryFilter);
  }, [locations, activeCategoryFilter]);

  // Route Waypoints for road route
  const intermediateWaypoints = useMemo(() => {
    if (!routeResult || !Array.isArray(routeResult.steps) || routeResult.steps.length <= 2) return [];
    return routeResult.steps.slice(1, -1);
  }, [routeResult]);

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#fdfbf7] overflow-hidden select-none font-sans">
      {/* ── 1. Top Navbar ── */}
      <Navbar />

      {/* ── 2. Full-Bleed Map Canvas with Floating Controls ── */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-[700]">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-xl border border-stone-200 text-xs font-bold text-[#0f3d2e]">
              <Loader2 size={16} className="animate-spin text-emerald-600" />
              <span>Loading Himalayan Map GIS...</span>
            </div>
          </div>
        )}

        {/* ── Floating Route Planner Card (Desktop: Top-Left, 390px Google Maps Style) ── */}
        <div className="hidden md:block absolute top-4 left-4 z-[500] w-[390px] max-w-[calc(100vw-32px)]">
          <RoutePlannerPanel
            origin={origin}
            destination={destination}
            travelMode={travelMode}
            onOriginChange={setOrigin}
            onDestinationChange={setDestination}
            onModeChange={setTravelMode}
            onSwap={handleSwapLocations}
            onFindRoute={handleFindRoute}
            onReset={handleResetRoute}
            isCalculating={isCalculating}
            routeResult={routeResult}
            onLocateOrigin={handleLocateUser}
            isLocating={isLocating}
            hasGpsLocation={!!userLocation}
            onFlyToStep={(coords) => setFlyCoords({ coords, zoom: 14 })}
          />
        </div>

        {/* ── Floating Secondary Explore Filter Chips (Top-Center / Minimal) ── */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-full shadow-lg border border-stone-200/90 text-xs font-bold max-w-[calc(100vw-24px)] overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 font-extrabold px-2 shrink-0 hidden sm:inline">
            Explore Pins:
          </span>

          <button
            type="button"
            onClick={() => setActiveCategoryFilter((prev) => (prev === 'destination' ? null : 'destination'))}
            className={`px-3 py-1 rounded-full transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategoryFilter === 'destination'
                ? 'bg-[#0f3d2e] text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Mountain size={12} className={activeCategoryFilter === 'destination' ? 'text-[#00FF88]' : 'text-emerald-700'} />
            <span>Places</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategoryFilter((prev) => (prev === 'stay' ? null : 'stay'))}
            className={`px-3 py-1 rounded-full transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategoryFilter === 'stay'
                ? 'bg-[#0f3d2e] text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Hotel size={12} className={activeCategoryFilter === 'stay' ? 'text-[#00FF88]' : 'text-emerald-700'} />
            <span>Stays</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategoryFilter((prev) => (prev === 'rental' ? null : 'rental'))}
            className={`px-3 py-1 rounded-full transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategoryFilter === 'rental'
                ? 'bg-[#0f3d2e] text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Car size={12} className={activeCategoryFilter === 'rental' ? 'text-[#00FF88]' : 'text-sky-600'} />
            <span>Rentals</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategoryFilter((prev) => (prev === 'activity' ? null : 'activity'))}
            className={`px-3 py-1 rounded-full transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategoryFilter === 'activity'
                ? 'bg-[#0f3d2e] text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <ActivityIcon size={12} className={activeCategoryFilter === 'activity' ? 'text-[#00FF88]' : 'text-blue-600'} />
            <span>Activities</span>
          </button>

          {activeCategoryFilter && (
            <button
              type="button"
              onClick={() => setActiveCategoryFilter(null)}
              className="p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
              title="Clear Pins (Unclutter Map)"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* ── Himalayan Route Navigator Trigger (Top-Right, icon-only on sm/md, full label on lg+) ── */}
        <div className="absolute top-3 right-3 z-[400] hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTransitDrawerOpen((o) => !o)}
            className={`inline-flex items-center gap-1.5 rounded-2xl text-xs font-black shadow-lg border transition-all cursor-pointer
              px-2.5 py-2 lg:px-3.5 lg:py-2 ${
              transitDrawerOpen
                ? 'bg-[#0f3d2e] text-emerald-300 border-emerald-500/50 ring-2 ring-emerald-400/40'
                : 'bg-[#0f3d2e] hover:bg-[#144d3b] text-white border-emerald-600/30'
            }`}
            title="Himalayan Route Navigator"
          >
            <Navigation size={15} className="text-emerald-400 shrink-0" />
            <span className="hidden lg:inline whitespace-nowrap">Himalayan Route Navigator</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </button>

          {/* ── Tile Switcher ── */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-stone-200/90 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTile('geoapify')}
            className={`px-2.5 py-1 rounded-xl transition ${
              activeTile === 'geoapify'
                ? 'bg-[#0f3d2e] text-white font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Geoapify HD
          </button>
          <button
            type="button"
            onClick={() => setActiveTile('voyager')}
            className={`px-2.5 py-1 rounded-xl transition ${
              activeTile === 'voyager'
                ? 'bg-[#0f3d2e] text-white font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Highways
          </button>
          <button
            type="button"
            onClick={() => setActiveTile('satellite')}
            className={`px-2.5 py-1 rounded-xl transition ${
              activeTile === 'satellite'
                ? 'bg-[#0f3d2e] text-white font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Satellite
          </button>
          </div>
        </div>

        {/* ── Real Leaflet Map Canvas ── */}
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

          {/* ── 0. Live GPS User Dot (When Explicitly Allowed) ── */}
          {userLocation && userLocation.coords && (
            <>
              <Circle
                center={userLocation.coords}
                radius={Math.min(userLocation.accuracy || 200, 1500)}
                pathOptions={{
                  color: '#2563eb',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.15,
                  weight: 1.5,
                  dashArray: '4, 4',
                }}
              />
              <Marker
                position={userLocation.coords}
                icon={L.divIcon({
                  html: `
                    <div class="relative flex items-center justify-center">
                      <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
                      <div class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
                    </div>
                  `,
                  className: 'user-live-gps-dot',
                  iconSize: [32, 32],
                  iconAnchor: [16, 16],
                })}
              >
                <Popup>
                  <div className="p-2 text-center font-sans">
                    <p className="text-xs font-black text-stone-900 m-0">You Are Here (GPS)</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">Accurate to ~{Math.round(userLocation.accuracy || 50)}m</p>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* ── 1. ACTIVE ROUTE RENDERING (From Marker, To Marker, Polyline Geometry) ── */}
          {routeResult && (
            <>
              {/* Origin Marker */}
              {origin?.coords && (
                <Marker position={origin.coords} icon={createRouteEndpointIcon(true)}>
                  <Popup>
                    <div className="p-2 font-sans text-xs">
                      <span className="text-[10px] font-black uppercase text-emerald-700 block">Starting Point</span>
                      <strong className="text-stone-900 block text-sm">{origin.fullName || origin.name}</strong>
                      <span className="text-stone-500 text-[11px]">⛰️ {origin.altitude || `${origin.altitudeM}m`}</span>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Destination Marker */}
              {destination?.coords && (
                <Marker position={destination.coords} icon={createRouteEndpointIcon(false)}>
                  <Popup>
                    <div className="p-2 font-sans text-xs">
                      <span className="text-[10px] font-black uppercase text-rose-700 block">Destination</span>
                      <strong className="text-stone-900 block text-sm">{destination.fullName || destination.name}</strong>
                      <span className="text-stone-500 text-[11px]">⛰️ {destination.altitude || `${destination.altitudeM}m`}</span>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Real Road / Route Polyline Geometry */}
              {routeResult.geometry && (
                <>
                  {/* Outer Ambient Glow Halo */}
                  <Polyline
                    positions={routeResult.geometry}
                    pathOptions={{
                      color: travelMode === 'transit' ? '#0284c7' : travelMode === 'trek' ? '#ca8a04' : '#00FF88',
                      weight: 12,
                      opacity: 0.35,
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />

                  {/* Main Route Core Polyline */}
                  <Polyline
                    positions={routeResult.geometry}
                    pathOptions={{
                      color: travelMode === 'transit' ? '#0369a1' : travelMode === 'trek' ? '#a16207' : '#0f3d2e',
                      weight: 5,
                      opacity: 0.95,
                      dashArray: travelMode === 'transit' ? '10, 8' : travelMode === 'trek' ? '6, 6' : undefined,
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  >
                    <Tooltip sticky>
                      <div className="p-1 font-sans text-xs">
                        <strong className="text-[#0f3d2e] block font-bold">
                          {origin.name} → {destination.name}
                        </strong>
                        <span className="text-slate-700 block text-[11px]">
                          {routeResult.totalDistanceKm ? `${routeResult.totalDistanceKm} km` : ''} • {routeResult.estimatedTime}
                        </span>
                      </div>
                    </Tooltip>
                  </Polyline>
                </>
              )}

              {/* Intermediate Milestone Dots */}
              {intermediateWaypoints.map((st, idx) => (
                st.coords && (
                  <CircleMarker
                    key={`step-dot-${idx}`}
                    center={st.coords}
                    radius={5}
                    pathOptions={{
                      color: '#ffffff',
                      weight: 2,
                      fillColor: '#0f3d2e',
                      fillOpacity: 1,
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -6]}>
                      <div className="p-1 font-sans text-xs">
                        <strong className="text-stone-900 block">{st.name}</strong>
                        <span className="text-stone-500 text-[10px]">{st.distance} • ⛰️ {st.altitude}</span>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                )
              ))}
            </>
          )}

          {/* ── 2. OPTIONAL CATEGORY MARKERS (Clustered & Clean) ── */}
          {activeCategoryFilter && visibleCategoryLocations.length > 0 && (
            <MarkerClusterGroup
              chunkedLoading
              iconCreateFunction={createClusterIcon}
              spiderfyOnMaxZoom
              showCoverageOnHover={false}
              zoomToBoundsOnClick
              maxClusterRadius={50}
              disableClusteringAtZoom={13}
            >
              {visibleCategoryLocations.map((loc) => (
                <Marker
                  key={loc.id}
                  position={loc.coordinates}
                  icon={createCustomMarkerIcon(loc.type, activeLocation?.id === loc.id)}
                  eventHandlers={{
                    click: () => setActiveLocation(loc),
                  }}
                >
                  <Popup minWidth={240}>
                    <div className="p-1 font-sans">
                      <div className="h-24 w-full rounded-xl overflow-hidden bg-stone-100 mb-1.5">
                        <img
                          src={loc.image}
                          alt={loc.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=800&auto=format&fit=crop';
                          }}
                        />
                      </div>
                      <h4 className="font-black text-stone-900 text-xs mb-0.5">{loc.name}</h4>
                      <p className="text-[10px] text-stone-500 mb-2">📍 {loc.district} • ⛰️ {loc.altitude}</p>
                      
                      <div className="grid grid-cols-2 gap-1 pt-1 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => {
                            setDestination(loc);
                            executeRouteCalculation(origin, loc, travelMode);
                          }}
                          className="px-2 py-1.5 bg-[#0f3d2e] text-white rounded-lg text-[10px] font-bold text-center cursor-pointer hover:bg-[#15533f]"
                        >
                          Route Here
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOrigin(loc);
                          }}
                          className="px-2 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[10px] font-bold text-center cursor-pointer"
                        >
                          Start Here
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          )}

          {/* Bottom Navigation Tools inside Leaflet */}
          <div className="absolute bottom-20 md:bottom-6 left-3 sm:left-4 z-[400]">
            <MapNavigationTools
              onRecenter={() => setFlyCoords({ coords: MAP_CENTER, zoom: MAP_ZOOM })}
              onLocateMe={handleLocateUser}
              isLocating={isLocating}
              userLocation={userLocation}
            />
          </div>
        </MapContainer>

        {/* ── 3. Mobile Floating Route Button & Bottom Sheet ── */}
        <div className="md:hidden fixed bottom-4 inset-x-4 z-[500] pointer-events-auto">
          {!mobileSheetOpen ? (
            <button
              type="button"
              onClick={() => setMobileSheetOpen(true)}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#0f3d2e] to-emerald-950 text-white font-black text-xs shadow-2xl flex items-center justify-between border border-emerald-500/40 cursor-pointer active:scale-95"
            >
              <div className="flex items-center gap-2">
                <Navigation size={15} className="text-[#00FF88]" />
                <span>
                  {routeResult ? `${origin.name} → ${destination.name}` : 'Plan Your Journey (A to B)'}
                </span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-emerald-200 font-bold">
                {routeResult ? routeResult.estimatedTime : 'Tap to Plan'}
              </span>
            </button>
          ) : (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[600] flex flex-col justify-end" onClick={() => setMobileSheetOpen(false)}>
              <div
                className="bg-white rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-250"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2 shrink-0 cursor-pointer" onClick={() => setMobileSheetOpen(false)} />
                <RoutePlannerPanel
                  origin={origin}
                  destination={destination}
                  travelMode={travelMode}
                  onOriginChange={setOrigin}
                  onDestinationChange={setDestination}
                  onModeChange={setTravelMode}
                  onSwap={handleSwapLocations}
                  onFindRoute={() => {
                    handleFindRoute();
                  }}
                  onReset={handleResetRoute}
                  isCalculating={isCalculating}
                  routeResult={routeResult}
                  onLocateOrigin={handleLocateUser}
                  isLocating={isLocating}
                  hasGpsLocation={!!userLocation}
                  onFlyToStep={(coords) => {
                    setFlyCoords({ coords, zoom: 14 });
                    setMobileSheetOpen(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Himalayan Transit & Route Finder Right Slide-Over Drawer ── */}
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
