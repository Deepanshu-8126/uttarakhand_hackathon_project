import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Navigation,
  Mountain,
  MapPin,
  ArrowUpDown,
  Car,
  Bus,
  Footprints,
  Train,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Loader2,
  Compass,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';

import { CANONICAL_HUBS } from '../../data/canonicalHubs.js';
export { CANONICAL_HUBS };

/**
 * Autocomplete Input for Route Locations
 */
function RouteLocationInput({
  label,
  value,
  onChange,
  onSelectHub,
  placeholder,
  icon: IconComponent,
  onLocateMe,
  isLocating,
  hasGpsLocation,
}) {
  const [query, setQuery] = useState(value?.name || '');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value?.name || '');
  }, [value?.name]);

  const filtered = useMemo(() => {
    const q = (query || '').toLowerCase().trim();
    if (!q) return CANONICAL_HUBS.slice(0, 8);
    return CANONICAL_HUBS.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.fullName.toLowerCase().includes(q) ||
        h.district.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        if (value?.name) setQuery(value.name);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value?.name]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
          {label}
        </label>
        {onLocateMe && (
          <button
            type="button"
            onClick={onLocateMe}
            disabled={isLocating}
            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 transition flex items-center gap-1 cursor-pointer"
            title="Use current GPS location with permission"
          >
            {isLocating ? (
              <Loader2 size={11} className="animate-spin text-emerald-600" />
            ) : (
              <Compass size={11} className={hasGpsLocation ? 'text-emerald-600' : 'text-stone-400'} />
            )}
            <span>{hasGpsLocation ? 'Using My GPS' : 'Use Current Location'}</span>
          </button>
        )}
      </div>

      <div className="relative flex items-center bg-stone-50/80 hover:bg-stone-50 focus-within:bg-white rounded-2xl border border-stone-200 hover:border-[#0f3d2e]/40 focus-within:border-[#0f3d2e] focus-within:ring-2 focus-within:ring-[#0f3d2e]/10 transition-all shadow-2xs">
        <span className="pl-3.5 text-[#0f3d2e] shrink-0">
          <IconComponent size={16} />
        </span>
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            onChange({ name: e.target.value });
          }}
          placeholder={placeholder || 'Search city, town, station or dham...'}
          className="w-full pl-2.5 pr-8 py-2.5 text-xs font-bold text-stone-900 bg-transparent focus:outline-none placeholder:text-stone-400 placeholder:font-normal"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onChange({ name: '' });
              setIsOpen(true);
            }}
            className="absolute right-2.5 p-1 rounded-full hover:bg-stone-200/70 text-stone-400 hover:text-stone-700 transition cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-stone-200 z-[900] max-h-56 overflow-y-auto no-scrollbar py-1 divide-y divide-stone-100 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-stone-50/70">
            Suggested Himalayan Transport Hubs
          </div>
          {filtered.map((hub) => (
            <button
              key={hub.id}
              type="button"
              onMouseDown={() => {
                onSelectHub(hub);
                setQuery(hub.name);
                setIsOpen(false);
              }}
              className="w-full px-3.5 py-2 text-left hover:bg-emerald-50/70 transition flex items-center justify-between group cursor-pointer"
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-bold text-stone-900 group-hover:text-[#0f3d2e] truncate">
                  {hub.fullName || hub.name}
                </div>
                <div className="text-[10px] text-stone-500 truncate flex items-center gap-1.5 mt-0.5">
                  <span className="font-semibold text-emerald-800">{hub.district}</span>
                  <span>•</span>
                  <span>{hub.altitude}</span>
                </div>
              </div>
              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 group-hover:bg-emerald-100 group-hover:text-emerald-900">
                {hub.category}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Main Himalayan Route Planner Floating Control Panel
 */
export default function RoutePlannerPanel({
  origin,
  destination,
  travelMode,
  onOriginChange,
  onDestinationChange,
  onModeChange,
  onSwap,
  onFindRoute,
  onReset,
  isCalculating,
  routeResult,
  activeRouteIndex = 0,
  onSelectRouteIndex,
  onLocateOrigin,
  isLocating,
  hasGpsLocation,
  onSelectWaypoint,
  onFlyToStep,
}) {
  const [stepsOpen, setStepsOpen] = useState(true);
  const [advisoryOpen, setAdvisoryOpen] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // Derive active route from multi-route result
  const activeRoute = useMemo(() => {
    if (!routeResult) return null;
    if (routeResult.routes && routeResult.routes[activeRouteIndex]) {
      return routeResult.routes[activeRouteIndex];
    }
    return routeResult;
  }, [routeResult, activeRouteIndex]);

  // Shortcut pills
  const POPULAR_SHORTCUTS = [
    { label: 'Delhi → Badrinath', from: 'Delhi', to: 'Badrinath', mode: 'road' },
    { label: 'Haridwar → Kedarnath', from: 'Haridwar', to: 'Kedarnath', mode: 'road' },
    { label: 'Kathgodam → Binsar', from: 'Kathgodam', to: 'Binsar', mode: 'road' },
    { label: 'Haldwani → Munsiyari', from: 'Haldwani', to: 'Munsiyari', mode: 'road' },
    { label: 'Delhi → Badrinath (Transit)', from: 'Delhi', to: 'Badrinath', mode: 'transit' },
    { label: 'Rishikesh → Auli', from: 'Rishikesh', to: 'Auli', mode: 'road' },
  ];

  const handleShortcutClick = (sc) => {
    const fromHub = CANONICAL_HUBS.find((h) => h.name.toLowerCase() === sc.from.toLowerCase());
    const toHub = CANONICAL_HUBS.find((h) => h.name.toLowerCase() === sc.to.toLowerCase());

    if (fromHub) onOriginChange(fromHub);
    else onOriginChange({ name: sc.from });

    if (toHub) onDestinationChange(toHub);
    else onDestinationChange({ name: sc.to });

    if (sc.mode) onModeChange(sc.mode);
  };

  const googleMapsUrl = useMemo(() => {
    if (!origin || !destination) return '#';
    const oParam = origin.coords ? `${origin.coords[0]},${origin.coords[1]}` : encodeURIComponent(origin.name || 'Delhi');
    const dParam = destination.coords ? `${destination.coords[0]},${destination.coords[1]}` : encodeURIComponent(destination.name || 'Badrinath');
    return `https://www.google.com/maps/dir/?api=1&origin=${oParam}&destination=${dParam}&travelmode=driving`;
  }, [origin, destination]);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-stone-200/90 w-full max-w-sm md:max-w-md overflow-hidden transition-all duration-300 pointer-events-auto">
      {/* Panel Top Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#0f3d2e] to-emerald-950 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-xs">
            <Navigation size={17} className="text-[#00FF88]" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white">
              Himalayan Route Engine
            </h2>
            <p className="text-[10px] text-emerald-200/80 font-medium">
              Multi-Route • Highway vs Shortcut vs Alpine Trek
            </p>
          </div>
        </div>

        {routeResult && (
          <button
            type="button"
            onClick={onReset}
            className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <X size={11} />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="p-4 space-y-3.5 max-h-[calc(100vh-210px)] overflow-y-auto no-scrollbar">
        {/* State 1: Origin & Destination Inputs with Swap */}
        <div className="space-y-2 relative">
          {/* Origin Input */}
          <RouteLocationInput
            label="1. Starting Point / Origin"
            value={origin}
            onChange={onOriginChange}
            onSelectHub={onOriginChange}
            placeholder="Delhi, Dehradun, Haridwar, Rishikesh..."
            icon={MapPin}
            onLocateMe={onLocateOrigin}
            isLocating={isLocating}
            hasGpsLocation={hasGpsLocation}
          />

          {/* Swap Button (Floating vertically between inputs) */}
          <div className="absolute right-4 top-[56px] z-10">
            <button
              type="button"
              onClick={onSwap}
              className="w-7 h-7 rounded-full bg-white shadow-md border border-stone-200 hover:border-[#0f3d2e] text-stone-600 hover:text-[#0f3d2e] flex items-center justify-center transition active:scale-90 cursor-pointer"
              title="Swap Origin and Destination"
            >
              <ArrowUpDown size={13} />
            </button>
          </div>

          {/* Destination Input */}
          <RouteLocationInput
            label="2. Destination / Shrine"
            value={destination}
            onChange={onDestinationChange}
            onSelectHub={onDestinationChange}
            placeholder="Badrinath, Kedarnath, Auli, Binsar, Munsiyari..."
            icon={Mountain}
          />

          {/* Mode Selector */}
          <div className="pt-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
              Travel Mode:
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200/70">
              <button
                type="button"
                onClick={() => onModeChange('road')}
                className={`py-2 px-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  travelMode === 'road'
                    ? 'bg-[#0f3d2e] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                }`}
              >
                <Car size={13} className={travelMode === 'road' ? 'text-[#00FF88]' : 'text-stone-500'} />
                <span>Road</span>
              </button>

              <button
                type="button"
                onClick={() => onModeChange('transit')}
                className={`py-2 px-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  travelMode === 'transit'
                    ? 'bg-[#0f3d2e] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                }`}
              >
                <Bus size={13} className={travelMode === 'transit' ? 'text-[#00FF88]' : 'text-stone-500'} />
                <span>Transit</span>
              </button>

              <button
                type="button"
                onClick={() => onModeChange('trek')}
                className={`py-2 px-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  travelMode === 'trek'
                    ? 'bg-[#0f3d2e] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                }`}
              >
                <Footprints size={13} className={travelMode === 'trek' ? 'text-[#00FF88]' : 'text-stone-500'} />
                <span>Trek</span>
              </button>
            </div>
          </div>

          {/* Primary CTA: Find Route */}
          <button
            type="button"
            onClick={onFindRoute}
            disabled={isCalculating}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0f3d2e] via-[#14532d] to-[#0f3d2e] hover:brightness-110 active:scale-[0.98] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isCalculating ? (
              <>
                <Loader2 size={15} className="animate-spin text-[#00FF88]" />
                <span>Calculating Multi-Routes via OSRM...</span>
              </>
            ) : (
              <>
                <Navigation size={15} className="text-[#00FF88]" />
                <span>Find Routes & Compare</span>
              </>
            )}
          </button>
        </div>

        {/* ─── Popular 1-Tap Mountain Route Shortcuts (When no active route) ─── */}
        {!routeResult && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
              Popular Routes (1-Tap):
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {POPULAR_SHORTCUTS.map((sc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleShortcutClick(sc)}
                  className="shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full border border-stone-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-stone-700 hover:text-[#0f3d2e] transition cursor-pointer whitespace-nowrap shadow-2xs"
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── MULTI-ROUTE OPTIONS SELECTOR (Highway vs Shortcut vs Alpine Trek) ─── */}
        {routeResult && routeResult.routes && routeResult.routes.length > 1 && (
          <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <Layers size={11} className="text-[#0f3d2e]" />
                <span>Available Routes ({routeResult.routes.length})</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-800">
                Click tab or map line to switch
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {routeResult.routes.map((rt, idx) => {
                const isSelected = activeRouteIndex === idx;
                const isTrek = rt.id === 'trek' || rt.mode === 'trek';
                const isShortcut = rt.id === 'shortcut' || rt.isShortcut;

                return (
                  <button
                    key={rt.id || idx}
                    type="button"
                    onClick={() => onSelectRouteIndex && onSelectRouteIndex(idx)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? isTrek
                          ? 'bg-gradient-to-r from-purple-950 to-indigo-950 text-white border-purple-400 shadow-sm ring-2 ring-purple-400/30'
                          : isShortcut
                          ? 'bg-gradient-to-r from-amber-950 to-stone-900 text-white border-amber-400 shadow-sm ring-2 ring-amber-400/30'
                          : 'bg-gradient-to-r from-emerald-950 to-stone-900 text-white border-emerald-400 shadow-sm ring-2 ring-[#00FF88]/30'
                        : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : isTrek
                          ? 'bg-purple-100 text-purple-700'
                          : isShortcut
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-[#0f3d2e]'
                      }`}>
                        {isTrek ? '🥾' : isShortcut ? '⚡' : '🛣️'}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[11px] font-black truncate ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                            Route {idx + 1}: {rt.name}
                          </span>
                          {rt.tag && (
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-sm shrink-0 ${
                              isSelected
                                ? 'bg-white/20 text-emerald-200'
                                : isTrek
                                ? 'bg-purple-100 text-purple-800'
                                : isShortcut
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {rt.tag}
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                          {rt.roadType || rt.trailType || rt.corridorInfo}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-xs font-black block ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                        {rt.totalDistanceKm} km
                      </span>
                      <span className={`text-[10px] font-bold block ${isSelected ? 'text-emerald-300' : 'text-stone-500'}`}>
                        {rt.estimatedTime}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── State 2: Active Route Result Summary Card ─── */}
        {activeRoute && (
          <div className="bg-gradient-to-br from-emerald-50/80 via-white to-stone-50 rounded-2xl border border-emerald-200 p-3.5 space-y-3 shadow-2xs animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Recommendation Tag & Route Name */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-stone-900">
                  {activeRoute.name || 'Selected Route'}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                {activeRoute.badge || (travelMode === 'transit' ? '🚌 Multimodal' : travelMode === 'trek' ? '🥾 Alpine Trail' : '🛣️ Real OSRM')}
              </span>
            </div>

            {/* From -> To Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-black text-stone-800 bg-white p-2.5 rounded-xl border border-stone-150">
              <span className="truncate">{activeRoute.baseCamp?.name || origin?.name || 'Origin'}</span>
              <span className="text-[#0f3d2e] font-bold">→</span>
              <span className="truncate">{activeRoute.summit?.name || destination?.name || 'Destination'}</span>
            </div>

            {/* 3 Metric Badges */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded-xl border border-stone-150 shadow-2xs">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">
                  {activeRoute.isTrek ? 'Hike Dist' : 'Distance'}
                </span>
                <span className="text-xs font-black text-stone-900">
                  {activeRoute.totalDistanceKm ? `${activeRoute.totalDistanceKm} km` : '—'}
                </span>
              </div>

              <div className="bg-white p-2 rounded-xl border border-stone-150 shadow-2xs">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">
                  {activeRoute.isTrek ? 'Trek Time' : 'Drive Time'}
                </span>
                <span className="text-xs font-black text-stone-900">
                  {activeRoute.estimatedTime || '—'}
                </span>
              </div>

              <div className="bg-white p-2 rounded-xl border border-stone-150 shadow-2xs">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">Elevation</span>
                <span className="text-xs font-black text-emerald-800">
                  {activeRoute.elevationGain ? `+${activeRoute.elevationGain}m` : 'Himalayan'}
                </span>
              </div>
            </div>

            {/* Road / Route Status */}
            <div className="bg-white/90 border border-emerald-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span className="text-[11px] font-bold text-stone-700 truncate">
                  {activeRoute.statusText || 'Road route verified via Himalayan OSRM engine'}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-[#0f3d2e] hover:bg-[#15533f] text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-xs text-center cursor-pointer"
              >
                <Navigation size={13} className="text-[#00FF88]" />
                <span>Start Journey ↗</span>
              </a>

              <button
                type="button"
                onClick={() => setStepsOpen((prev) => !prev)}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>{stepsOpen ? 'Hide Steps' : 'View Steps'}</span>
                {stepsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          </div>
        )}

        {/* ─── State 3: Collapsible Journey Steps (Road, Transit, or Alpine Trek Trail) ─── */}
        {activeRoute && stepsOpen && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#0f3d2e]" />
                <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  {activeRoute.isTrek ? 'Trail Waypoints & Camps' : travelMode === 'transit' ? 'Transit Segments & Transfers' : 'Journey Milestones'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                {activeRoute.steps ? activeRoute.steps.length : 0} Steps
              </span>
            </div>

            {/* Transit Metro Planner Style Segmented Timeline */}
            {travelMode === 'transit' ? (
              <div className="relative pl-4 space-y-3 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-[2px] before:bg-emerald-300">
                {(activeRoute.transitSegments || []).map((seg, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === (activeRoute.transitSegments || []).length - 1;

                  return (
                    <div key={idx} className="relative flex items-start gap-3">
                      <div
                        className={`w-3.5 h-3.5 rounded-full mt-1.5 shrink-0 ring-4 ${
                          isLast
                            ? 'bg-rose-500 ring-rose-100'
                            : isFirst
                            ? 'bg-[#0f3d2e] ring-emerald-100'
                            : 'bg-emerald-600 ring-emerald-50'
                        }`}
                      />

                      <div className="flex-1 bg-white p-3 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            {seg.mode === 'Train' ? (
                              <Train size={14} className="text-sky-600 shrink-0" />
                            ) : seg.mode === 'Bus' ? (
                              <Bus size={14} className="text-emerald-700 shrink-0" />
                            ) : (
                              <Car size={14} className="text-amber-600 shrink-0" />
                            )}
                            <span className="text-xs font-black text-stone-900">{seg.mode} Connection</span>
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {seg.operator}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                          <span className="text-stone-900">{seg.from}</span>
                          <span className="text-stone-400">↓</span>
                          <span className="text-stone-900">{seg.to}</span>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-0.5 text-[9px] font-semibold text-stone-500">
                          <span className="bg-stone-100 px-2 py-0.5 rounded-md">
                            ⏱️ {seg.duration || 'Duration unverified'}
                          </span>
                          <span className="bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-md">
                            Schedule: {seg.scheduleNote || 'Timetable not verified'}
                          </span>
                          <span className="bg-stone-100 px-2 py-0.5 rounded-md">
                            Fare: {seg.fareNote || 'Counter / Portal regulated'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Road / Trek Step-by-Step Waypoints */
              <div className="relative pl-4 space-y-2.5 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-[2px] before:bg-emerald-200">
                {(activeRoute.steps || []).map((step, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === (activeRoute.steps || []).length - 1;

                  return (
                    <div
                      key={idx}
                      className="relative flex items-start gap-3 group cursor-pointer"
                      onClick={() => onFlyToStep && onFlyToStep(step.coords)}
                    >
                      <div
                        className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ring-4 transition-all ${
                          isLast
                            ? 'bg-rose-500 ring-rose-100 group-hover:scale-125'
                            : isFirst
                            ? 'bg-[#0f3d2e] ring-emerald-100 group-hover:scale-125'
                            : activeRoute.isTrek
                            ? 'bg-purple-600 ring-purple-100 group-hover:scale-125'
                            : 'bg-emerald-600 ring-emerald-50 group-hover:scale-125'
                        }`}
                      />

                      <div className="flex-1 bg-white p-2.5 rounded-xl border border-stone-200/80 hover:border-emerald-300 shadow-2xs transition-all flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-stone-900 truncate">
                            {step.name}
                          </div>
                          <div className="text-[10px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                            <span className="text-emerald-800 font-semibold">{step.role}</span>
                            <span>•</span>
                            <span>{step.altitude}</span>
                          </div>
                        </div>

                        <span className="shrink-0 text-[10px] font-mono font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                          {step.distance}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
