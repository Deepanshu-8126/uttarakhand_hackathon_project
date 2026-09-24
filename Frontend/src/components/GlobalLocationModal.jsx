import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  LocateFixed, 
  Search, 
  X, 
  Check, 
  Compass, 
  ArrowRight, 
  Navigation, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { 
  detectBrowserLocation, 
  geocodeCityName, 
  getStoredUserLocation, 
  setStoredUserLocation,
  POPULAR_START_HUBS,
  calculateDistanceKm,
  UTTARAKHAND_CITY_COORDINATES
} from '../utils/geoHelpers';

// Major Uttarakhand Gateway Hubs
const GATEWAY_HUBS = [
  { name: 'Haldwani / Kathgodam Gateway', city: 'Haldwani', desc: 'Gateway to Kumaon (Nainital, Almora, Ranikhet, Mukteshwar)', coords: [29.2183, 79.5130] },
  { name: 'Rudrapur / Pantnagar Gateway', city: 'Rudrapur', desc: 'Gateway to Tarai, Airport & Kumaon South (Bareilly/Delhi route)', coords: [28.9800, 79.4000] },
  { name: 'Dehradun / Rishikesh Gateway', city: 'Dehradun', desc: 'Gateway to Garhwal, Mussoorie, Char Dham & Rishikesh', coords: [30.3165, 78.0322] },
  { name: 'Haridwar Gateway', city: 'Haridwar', desc: 'Spiritual Railway Gateway & Char Dham entry point', coords: [29.9457, 78.1642] }
];

export default function GlobalLocationModal({ isOpen, onClose }) {
  const [currentLoc, setCurrentLoc] = useState(getStoredUserLocation());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [gatewayAdvice, setGatewayAdvice] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const loc = getStoredUserLocation();
      setCurrentLoc(loc);
      if (loc?.coordinates) {
        computeGatewayAdvice(loc.coordinates[0], loc.coordinates[1], loc.city || loc.detectedName);
      }
    }
  }, [isOpen]);

  const computeGatewayAdvice = (lat, lng, cityName) => {
    if (!lat || !lng) return;

    // Find closest Uttarakhand gateway
    let minDistance = Infinity;
    let closestGateway = null;

    GATEWAY_HUBS.forEach((hub) => {
      const dist = calculateDistanceKm(lat, lng, hub.coords[0], hub.coords[1]);
      if (dist !== null && dist < minDistance) {
        minDistance = dist;
        closestGateway = { ...hub, distanceKm: dist };
      }
    });

    // Check if user is already inside Uttarakhand
    const isInsideUttarakhand = minDistance <= 40;

    setGatewayAdvice({
      isInsideUttarakhand,
      closestGateway,
      userCity: cityName || 'Your Location',
      distanceKm: minDistance
    });
  };

  const handleSelectLocation = (locationData) => {
    setCurrentLoc(locationData);
    setStoredUserLocation(locationData);
    computeGatewayAdvice(locationData.coordinates[0], locationData.coordinates[1], locationData.city);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleGpsDetect = async () => {
    setIsDetecting(true);
    try {
      const res = await detectBrowserLocation();
      if (res.success && res.coordinates) {
        const cityName = res.name.split(',')[0].trim();
        const loc = {
          city: cityName,
          formatted: res.name,
          detectedName: res.name,
          coordinates: res.coordinates,
          isGps: true
        };
        handleSelectLocation(loc);
      } else {
        alert(res.error || 'Could not detect location automatically. Please type your city name below.');
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await geocodeCityName(searchQuery.trim());
      if (res && res.coordinates) {
        const cityName = res.name.split(',')[0].trim();
        const loc = {
          city: cityName,
          formatted: res.name,
          detectedName: res.name,
          coordinates: res.coordinates,
          isGps: false
        };
        handleSelectLocation(loc);
      } else {
        alert(`Could not find coordinates for "${searchQuery}". Please select a nearby major city.`);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#fdfbf7] rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0f3d2e] text-emerald-300 flex items-center justify-center shadow-xs">
              <Compass size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                Global Location & Gateway Matcher
              </h3>
              <p className="text-xs text-stone-500">
                Where are you starting your journey from?
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Current Active Location Display */}
        <div className="mt-4 p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Active Location
              </span>
              <strong className="text-xs sm:text-sm font-bold text-stone-900">
                {currentLoc?.formatted || currentLoc?.city || 'No Location Set (Defaulting to Uttarakhand)'}
              </strong>
            </div>
          </div>
          {currentLoc && (
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active
            </span>
          )}
        </div>

        {/* 1. Primary GPS Detect Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleGpsDetect}
            disabled={isDetecting}
            className="w-full py-3.5 px-4 bg-[#0f3d2e] hover:bg-[#144c3a] text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isDetecting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Locating via GPS Satellite...</span>
              </>
            ) : (
              <>
                <LocateFixed size={16} className="text-emerald-300" />
                <span>Auto-Detect My Current GPS Location</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#fdfbf7] px-3 font-semibold text-stone-400 uppercase tracking-wider text-[10px]">
              Or Search Any City / Town Worldwide
            </span>
          </div>
        </div>

        {/* 2. Manual Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type any city (e.g. Bareilly, Delhi, Lucknow, Moradabad, Mumbai)..."
            className="w-full pl-10 pr-24 py-3 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#0f3d2e] shadow-2xs"
          />
          <Search size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-emerald-800 text-white font-bold text-xs hover:bg-[#0f3d2e] transition cursor-pointer disabled:opacity-50"
          >
            {isSearching ? 'Finding...' : 'Set City'}
          </button>
        </form>

        {/* 3. Popular Hub Quick Pills */}
        <div className="mt-5">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
            Popular Departure & Gateway Hubs:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_START_HUBS.map((hub) => {
              const isSelected = currentLoc?.city?.toLowerCase() === hub.city.toLowerCase();
              return (
                <button
                  key={hub.city}
                  type="button"
                  onClick={() => {
                    handleSelectLocation({
                      city: hub.city,
                      formatted: `${hub.city}, ${hub.state}`,
                      coordinates: hub.coordinates,
                      isGps: false
                    });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                    isSelected
                      ? 'bg-[#0f3d2e] text-white border-[#0f3d2e] shadow-xs'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {hub.city}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Intelligent Gateway Recommendation */}
        {gatewayAdvice && gatewayAdvice.closestGateway && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-stone-700">
            <div className="flex items-center gap-1.5 text-emerald-900 font-bold mb-1">
              <Sparkles size={14} className="text-emerald-700" />
              <span>Smart Gateway Route Recommendation:</span>
            </div>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              {gatewayAdvice.isInsideUttarakhand ? (
                <>
                  You are inside Uttarakhand near <strong className="text-stone-900">{gatewayAdvice.userCity}</strong>. Local mountain rental fleets &amp; homestays are sorted by direct proximity to you!
                </>
              ) : (
                <>
                  From <strong className="text-stone-900">{gatewayAdvice.userCity}</strong> (~{gatewayAdvice.distanceKm} km away), your optimal Uttarakhand entry hub is <strong className="text-[#0f3d2e]">{gatewayAdvice.closestGateway.name}</strong>. ({gatewayAdvice.closestGateway.desc}).
                </>
              )}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
