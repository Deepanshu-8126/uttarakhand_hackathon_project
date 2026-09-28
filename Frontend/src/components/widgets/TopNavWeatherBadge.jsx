import React, { useState, useRef, useEffect } from 'react';
import { 
  CloudSun, 
  Sun, 
  CloudRain, 
  Snowflake, 
  Wind, 
  Droplets, 
  RefreshCw, 
  MapPin, 
  ChevronDown,
  Navigation,
  LocateFixed
} from 'lucide-react';
import { useLiveLocationWeather } from '../../hooks/useLiveLocationWeather';
import { useLocationContext } from '../../context/LocationContext';

export default function TopNavWeatherBadge({ isDark = false, onOpenLocationModal, userLocation }) {
  const { weather, loading, locationName, refreshWeather } = useLiveLocationWeather();
  const { requestLocationPermission, isDetecting } = useLocationContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Weather icon selector
  const getWeatherIcon = (code) => {
    const iconColor = isDark ? "text-emerald-300" : "text-emerald-800";
    if (code >= 71) return <Snowflake size={13} className={iconColor} />;
    if (code >= 51) return <CloudRain size={13} className={iconColor} />;
    if (code >= 1 && code <= 3) return <CloudSun size={13} className={iconColor} />;
    return <Sun size={13} className={iconColor} />;
  };

  const temp = weather?.temperature !== undefined ? `${weather.temperature}°C` : '--';
  const condition = weather?.condition || 'Clear';
  const displayCity = userLocation?.city || weather?.city || locationName || 'Uttarakhand';

  return (
    <div className="relative inline-block shrink-0" ref={dropdownRef}>
      {/* 🌟 1. Single Unified Top Bar Weather & Location Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer shadow-2xs group shrink-0 ${
          isDark
            ? 'border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-stone-200'
            : 'border border-stone-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-stone-800'
        }`}
        title={`Live Weather & Location Details in ${displayCity}: ${temp} (${condition})`}
      >
        {/* Weather Icon */}
        <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100/70 text-emerald-800'}`}>
          {loading ? (
            <RefreshCw size={9} className={`${isDark ? 'text-emerald-300' : 'text-emerald-800'} animate-spin`} />
          ) : (
            getWeatherIcon(weather?.wmoCode)
          )}
        </span>

        {/* Temperature */}
        <span className={isDark ? "text-emerald-300 font-extrabold" : "text-emerald-900 font-extrabold"}>
          {temp}
        </span>

        {/* Subtle Separator Dot */}
        <span className={isDark ? "text-white/20 text-[10px]" : "text-stone-300 text-[10px]"}>•</span>

        {/* Location Pin & City Name */}
        <MapPin size={11} className={isDark ? "text-emerald-400 shrink-0" : "text-emerald-700 shrink-0"} />
        <span className={`font-semibold max-w-[80px] sm:max-w-[95px] truncate ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>
          {displayCity}
        </span>

        <ChevronDown size={11} className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 🌟 2. Unified Weather & Location Details Popup Card */}
      {isOpen && (
        <div 
          className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-[20px] p-4 z-50 text-left animate-in fade-in zoom-in-95 duration-150 ${
            isDark 
              ? 'bg-[#06140c] border border-emerald-500/30 text-white shadow-2xl shadow-emerald-950/80' 
              : 'bg-white border border-[#F0F0F0] shadow-[0_4px_20px_rgba(0,0,0,0.08)]'
          }`}
        >
          {/* Header with Location & Change Button */}
          <div className={`flex items-center justify-between border-b pb-3 mb-3 ${isDark ? 'border-white/10' : 'border-stone-100'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-[#E8F5E9]'}`}>
                <MapPin size={16} className={isDark ? "text-emerald-300" : "text-[#0F2B1F]"} />
              </div>
              <div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                  Current Location
                </div>
                <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {displayCity}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  requestLocationPermission();
                }}
                disabled={isDetecting}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer active:scale-95 ${
                  isDark 
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
                title="Detect Real-Time GPS Location"
              >
                <LocateFixed size={11} className={isDetecting ? 'animate-spin' : ''} />
                <span>{isDetecting ? 'Locating...' : 'GPS Live'}</span>
              </button>

              {onOpenLocationModal && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenLocationModal();
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                    isDark 
                      ? 'bg-white/10 hover:bg-white/20 text-stone-300' 
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                  title="Change Location Manually"
                >
                  <Navigation size={10} />
                  <span>Select</span>
                </button>
              )}

              <button
                type="button"
                onClick={refreshWeather}
                disabled={loading}
                className="p-1.5 rounded-full bg-stone-50 hover:bg-[#E8F5E9] text-[#0F2B1F] transition cursor-pointer"
                title="Refresh GPS & Weather"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Temperature & Condition Main Display */}
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                {temp}
              </div>
              <div className={`text-xs font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                Feels like {weather?.feelsLike ?? weather?.temperature ?? 26}°C
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-[#E8F5E9] text-[#0F2B1F]'
              }`}>
                {condition}
              </span>
            </div>
          </div>

          {/* Telemetry Grid (Humidity & Wind) */}
          <div className={`grid grid-cols-2 gap-2 pt-2 border-t text-xs ${isDark ? 'border-white/10' : 'border-stone-100'}`}>
            <div className={`flex items-center gap-2 p-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-stone-50'}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-[#E8F5E9] text-[#0F2B1F]'}`}>
                <Droplets size={14} />
              </div>
              <div>
                <div className={`text-[10px] font-bold ${isDark ? 'text-stone-400' : 'text-[#64748B]'}`}>Humidity</div>
                <div className={`font-extrabold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{weather?.humidity ?? 65}%</div>
              </div>
            </div>

            <div className={`flex items-center gap-2 p-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-stone-50'}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-[#E8F5E9] text-[#0F2B1F]'}`}>
                <Wind size={14} />
              </div>
              <div>
                <div className={`text-[10px] font-bold ${isDark ? 'text-stone-400' : 'text-[#64748B]'}`}>Wind Speed</div>
                <div className={`font-extrabold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{weather?.windSpeed ?? 5} km/h</div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className={`mt-3 pt-2 text-[10px] flex items-center justify-between border-t ${isDark ? 'border-white/10 text-stone-400' : 'border-stone-100 text-[#64748B]'}`}>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry Active
            </span>
            <span>Auto-synced</span>
          </div>
        </div>
      )}
    </div>
  );
}
