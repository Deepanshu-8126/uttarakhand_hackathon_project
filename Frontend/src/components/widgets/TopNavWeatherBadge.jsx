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
  Compass
} from 'lucide-react';
import { useLiveLocationWeather } from '../../hooks/useLiveLocationWeather';

export default function TopNavWeatherBadge() {
  const { weather, loading, locationName, refreshWeather } = useLiveLocationWeather();
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
    if (code >= 71) return <Snowflake size={14} className="text-[#0F2B1F]" />;
    if (code >= 51) return <CloudRain size={14} className="text-[#0F2B1F]" />;
    if (code >= 1 && code <= 3) return <CloudSun size={14} className="text-[#0F2B1F]" />;
    return <Sun size={14} className="text-[#0F2B1F]" />;
  };

  const temp = weather?.temperature !== undefined ? `${weather.temperature}°C` : '--';
  const condition = weather?.condition || 'Clear';
  const displayCity = weather?.city || locationName || 'Kichha';

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* ── 1. Top Bar Weather Badge (Always Visible) ───────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-stone-200/90 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-[10px] sm:text-[11px] font-bold text-slate-800 transition cursor-pointer shadow-2xs group shrink-0"
        title="Live Weather for your location"
      >
        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
          {loading ? (
            <RefreshCw size={10} className="text-[#0F2B1F] animate-spin" />
          ) : (
            getWeatherIcon(weather?.wmoCode)
          )}
        </span>
        <span className="text-[#0F2B1F] font-black">{temp}</span>
        <span className="hidden md:inline text-stone-500 font-semibold max-w-[70px] truncate">
          {displayCity}
        </span>
        <ChevronDown size={11} className={`text-stone-400 transition-transform hidden sm:inline-block ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* ── 2. Weather Details Popup Card (Global Design System Card) ── */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-72 sm:w-80 rounded-[20px] bg-white border border-[#F0F0F0] shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-4 z-50 text-left animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                <MapPin size={16} className="text-[#0F2B1F]" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Your Location
                </div>
                <div className="text-sm font-black text-[#0F172A]">
                  {displayCity}
                </div>
              </div>
            </div>

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

          {/* Temperature & Condition Main Display */}
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="text-3xl font-black text-[#0F172A] tracking-tight">
                {temp}
              </div>
              <div className="text-xs font-semibold text-emerald-800">
                Feels like {weather?.feelsLike ?? weather?.temperature ?? 26}°C
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[11px] font-bold text-[#0F2B1F]">
                {condition}
              </span>
            </div>
          </div>

          {/* Telemetry Grid (Humidity & Wind) */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50">
              <div className="w-7 h-7 rounded-lg bg-[#E8F5E9] flex items-center justify-center shrink-0">
                <Droplets size={14} className="text-[#0F2B1F]" />
              </div>
              <div>
                <div className="text-[10px] text-[#64748B] font-bold">Humidity</div>
                <div className="font-extrabold text-[#0F172A]">{weather?.humidity ?? 65}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50">
              <div className="w-7 h-7 rounded-lg bg-[#E8F5E9] flex items-center justify-center shrink-0">
                <Wind size={14} className="text-[#0F2B1F]" />
              </div>
              <div>
                <div className="text-[10px] text-[#64748B] font-bold">Wind Speed</div>
                <div className="font-extrabold text-[#0F172A]">{weather?.windSpeed ?? 5} km/h</div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-2 text-[10px] text-[#64748B] flex items-center justify-between border-t border-stone-100">
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
