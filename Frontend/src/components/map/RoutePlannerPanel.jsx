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
            title="Clear"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
          <div className="px-3 py-1.5 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            <span>Known Uttarakhand Hubs</span>
            <span>{filtered.length} found</span>
          </div>

          <div className="max-h-52 overflow-y-auto p-1 divide-y divide-stone-50">
            {filtered.length === 0 ? (
              <div className="p-3 text-center text-xs text-stone-400 font-medium">
                No matching destination found. Press &ldquo;Find Route&rdquo; to query live road network.
              </div>
            ) : (
              filtered.map((hub) => (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => {
                    onSelectHub(hub);
                    setQuery(hub.name);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between hover:bg-emerald-50/70 text-stone-700 hover:text-[#0f3d2e] transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-900 group-hover:text-[#0f3d2e] truncate">
                        {hub.name}
                      </span>
                      <span className="text-[10px] text-stone-400">({hub.district})</span>
                    </div>
                    <p className="text-[10px] text-stone-400 truncate">{hub.category}</p>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 shrink-0">
                    ⛰️ {hub.altitude}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Main Google Maps / Delhi Metro Style Route Planner Panel
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
  onLocateOrigin,
  isLocating,
  hasGpsLocation,
  onSelectWaypoint,
  onFlyToStep,
}) {
  const [stepsOpen, setStepsOpen] = useState(true);
  const [advisoryOpen, setAdvisoryOpen] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

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
    <div
      className={`bg-white/95 backdrop-blur-xl border border-stone-200/90 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 font-sans ${
        isMobileExpanded ? 'max-h-[85vh]' : 'max-h-[82vh] md:max-h-[calc(100vh-100px)]'
      } flex flex-col`}
    >
      {/* ── 1. Top Header: Product Identity & Progress Indicator ── */}
      <div className="px-4 py-3 bg-gradient-to-r from-emerald-950 via-[#0f3d2e] to-emerald-950 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#00FF88] shrink-0 border border-white/15">
            <Navigation size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-black tracking-wider uppercase text-white truncate">
                Himalayan Route Planner
              </h2>
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30 shrink-0">
                Verified GIS
              </span>
            </div>
            <p className="text-[10px] text-emerald-200/80 truncate">
              {routeResult ? 'Real Road & Transit Waypoints' : 'How do I get from A to B?'}
            </p>
          </div>
        </div>

        {routeResult && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-bold text-emerald-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 transition cursor-pointer shrink-0"
            title="Start new route search"
          >
            New Search
          </button>
        )}
      </div>

      {/* ── 2. Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* ─── State 1: Primary Inputs (From 📍, To 🏔, Swap ↕, Mode) ─── */}
        <div className="bg-[#fcfbf9] rounded-2xl border border-stone-200/90 p-3 space-y-2.5 shadow-2xs">
          {/* FROM Input */}
          <RouteLocationInput
            label="From — Where are you starting?"
            value={origin}
            onChange={onOriginChange}
            onSelectHub={onOriginChange}
            placeholder="Delhi, Haridwar, Kathgodam, Haldwani..."
            icon={MapPin}
            onLocateMe={onLocateOrigin}
            isLocating={isLocating}
            hasGpsLocation={hasGpsLocation}
          />

          {/* Swap Button */}
          <div className="flex justify-center -my-1 relative z-10">
            <button
              type="button"
              onClick={onSwap}
              className="w-8 h-8 rounded-full bg-white border border-stone-200 shadow-xs hover:bg-emerald-50 hover:border-emerald-300 text-stone-600 hover:text-[#0f3d2e] flex items-center justify-center transition cursor-pointer active:scale-95"
              title="Swap From and To locations"
            >
              <ArrowUpDown size={13} className="text-[#0f3d2e]" />
            </button>
          </div>

          {/* TO Input */}
          <RouteLocationInput
            label="To — Where do you want to go?"
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
                <span>Calculating Real Route via OSRM...</span>
              </>
            ) : (
              <>
                <Navigation size={15} className="text-[#00FF88]" />
                <span>Find Route</span>
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

        {/* ─── State 2: Route Result Summary Card ─── */}
        {routeResult && (
          <div className="bg-gradient-to-br from-emerald-50/80 via-white to-stone-50 rounded-2xl border border-emerald-200 p-3.5 space-y-3 shadow-2xs animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Recommendation Tag & Route Name */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-stone-900">
                  Route 1 — {travelMode === 'transit' ? 'Verified Transit' : travelMode === 'trek' ? 'Alpine Trail' : 'Recommended Road'}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                {travelMode === 'transit' ? '🚌 Multimodal' : travelMode === 'trek' ? '🥾 Foot Trail' : '🚗 Real OSRM'}
              </span>
            </div>

            {/* From -> To Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-black text-stone-800 bg-white p-2.5 rounded-xl border border-stone-150">
              <span className="truncate">{origin?.name || 'Origin'}</span>
              <span className="text-[#0f3d2e] font-bold">→</span>
              <span className="truncate">{destination?.name || 'Destination'}</span>
            </div>

            {/* 3-4 Metric Badges */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded-xl border border-stone-150 shadow-2xs">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">Distance</span>
                <span className="text-xs font-black text-stone-900">
                  {routeResult.totalDistanceKm ? `${routeResult.totalDistanceKm} km` : '—'}
                </span>
              </div>

              <div className="bg-white p-2 rounded-xl border border-stone-150 shadow-2xs">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">Drive Time</span>
                <span className="text-xs font-black text-stone-900">
                  {routeResult.estimatedTime || '—'}
                </span>
              </div>

              <div className="bg-white p-2 rounded-xl border border-stone-150 shadow-2xs">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">Elevation</span>
                <span className="text-xs font-black text-emerald-800">
                  {routeResult.elevationGain ? `+${routeResult.elevationGain}m` : 'Himalayan'}
                </span>
              </div>
            </div>

            {/* Road / Route Status */}
            <div className="bg-white/90 border border-emerald-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span className="text-[11px] font-bold text-stone-700 truncate">
                  {routeResult.statusText || 'Road route verified via Himalayan OSRM engine'}
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

        {/* ─── State 3: Collapsible Journey Steps (Road or Transit Metro Style) ─── */}
        {routeResult && stepsOpen && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#0f3d2e]" />
                <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  {travelMode === 'transit' ? 'Transit Segments & Transfers' : 'Journey Milestones'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                {routeResult.steps ? routeResult.steps.length : 0} Steps
              </span>
            </div>

            {/* Transit Metro Planner Style Segmented Timeline */}
            {travelMode === 'transit' ? (
              <div className="relative pl-4 space-y-3 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-[2px] before:bg-emerald-300">
                {(routeResult.transitSegments || []).map((seg, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === (routeResult.transitSegments || []).length - 1;

                  return (
                    <div key={idx} className="relative flex items-start gap-3">
                      {/* Metro Stop Node */}
                      <div
                        className={`w-3.5 h-3.5 rounded-full mt-1.5 shrink-0 ring-4 ${
                          isLast
                            ? 'bg-rose-500 ring-rose-100'
                            : isFirst
                            ? 'bg-[#0f3d2e] ring-emerald-100'
                            : 'bg-emerald-600 ring-emerald-50'
                        }`}
                      />

                      {/* Segment Box */}
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

                        {/* From -> To */}
                        <div className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                          <span className="text-stone-900">{seg.from}</span>
                          <span className="text-stone-400">↓</span>
                          <span className="text-stone-900">{seg.to}</span>
                        </div>

                        {/* Truth in Transit Badges (Never fake live times) */}
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
                {(routeResult.steps || []).map((step, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === (routeResult.steps || []).length - 1;

                  return (
                    <div
                      key={idx}
                      className="relative flex items-start gap-3 group cursor-pointer"
                      onClick={() => onFlyToStep && onFlyToStep(step.coords)}
                    >
                      {/* Node Bullet */}
                      <div
                        className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ring-4 transition-all ${
                          isLast
                            ? 'bg-rose-500 ring-rose-100 group-hover:scale-125'
                            : isFirst
                            ? 'bg-[#0f3d2e] ring-emerald-100 group-hover:scale-125'
                            : 'bg-emerald-600 ring-emerald-50 group-hover:scale-125'
                        }`}
                      />

                      {/* Station Box */}
                      <div className="flex-1 bg-white p-2.5 rounded-xl border border-stone-200/80 hover:border-emerald-300 shadow-2xs transition-all flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-stone-900 group-hover:text-[#0f3d2e] truncate">
                              {step.name}
                            </span>
                            {step.distance && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 shrink-0">
                                {step.distance}
                              </span>
                            )}
                          </div>
                          {step.role && (
                            <p className="text-[10px] text-stone-400 mt-0.5 truncate">{step.role}</p>
                          )}
                        </div>

                        {step.altitude && (
                          <span className="text-[10px] font-bold text-[#0f3d2e] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
                            ⛰️ {step.altitude}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── State 4: Mountain Safety Guidelines & Advisories (Secondary) ─── */}
        <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setAdvisoryOpen((prev) => !prev)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-extrabold text-stone-800 hover:bg-stone-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-[#0f3d2e]" />
              <span>Mountain Safety &amp; Corridors</span>
            </div>
            {advisoryOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {advisoryOpen && (
            <div className="p-3 bg-amber-50/60 border-t border-amber-200/60 space-y-2 text-[11px] text-amber-950">
              <div className="flex items-center gap-1.5 font-extrabold text-amber-900">
                <AlertTriangle size={13} className="text-amber-700 shrink-0" />
                <span>Essential Mountain Travel Protocol:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[10.5px] text-amber-900/90 font-medium">
                <li>Mandatory Biometric Registration at <span className="underline font-bold">registrationandtouristcare.uk.gov.in</span></li>
                <li>No night highway driving on mountain passes past 8:00 PM</li>
                <li>Acclimatization: Drink 3L+ water above 2,500m elevation to prevent AMS</li>
                <li>Emergency Helplines: <span className="font-bold">1070</span> (State Disaster) | <span className="font-bold">112</span> (Police)</li>
              </ul>

              {routeResult?.corridorInfo && (
                <div className="mt-2 pt-2 border-t border-amber-200/80 text-[10.5px]">
                  <span className="font-bold text-stone-900 block">Active Mountain Highway:</span>
                  <span className="text-stone-600">{routeResult.corridorInfo}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
