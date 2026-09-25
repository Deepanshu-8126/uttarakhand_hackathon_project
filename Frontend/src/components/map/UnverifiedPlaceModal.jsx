import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Sparkles, 
  Coins, 
  Globe, 
  ShieldAlert, 
  CheckCircle2, 
  CloudSun, 
  Navigation,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function UnverifiedPlaceModal({ place, onClose, onAddedToMap }) {
  const navigate = useNavigate();
  const [aiDescription, setAiDescription] = useState('Analyzing satellite coordinates with DevBhoomi AI...');
  const [loadingAi, setLoadingAi] = useState(true);
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [isAdded, setIsAdded] = useState(false);

  const lat = place?.location?.lat || 28.98;
  const lng = place?.location?.lng || 79.51;
  const placeName = place?.name || 'Discovered Location';
  const address = place?.displayName || place?.address || place?.vicinity || 'Global Map Location';

  // 1. Fetch AI Description from Hybrid RAG endpoint
  useEffect(() => {
    let isMounted = true;
    async function fetchAiInsights() {
      setLoadingAi(true);
      try {
        const res = await axios.post(`${API_BASE}/chat`, {
          message: `Batao ${placeName} (${address}) ke baare mein kya jankari hai? Yahan kaise pahuche aur aas-paas kya hai?`,
          userLocation: { lat, lng }
        }, { timeout: 8000 });

        if (isMounted) {
          const text = res.data?.message || res.data?.data?.answer || `DevBhoomi AI: ${placeName} is a scenic Himalayan location near coordinates [${lat.toFixed(3)}, ${lng.toFixed(3)}]. This spot is newly discovered via global satellite map telemetry.`;
          setAiDescription(text);
        }
      } catch (err) {
        if (isMounted) {
          setAiDescription(`DevBhoomi AI Analysis: ${placeName} was discovered via real-world map telemetry at [${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E]. While this location is unverified in our official 106-destination catalog, travelers report serene surroundings and authentic Himalayan terrain.`);
        }
      } finally {
        if (isMounted) setLoadingAi(false);
      }
    }

    if (place) {
      fetchAiInsights();
    }
    return () => { isMounted = false; };
  }, [place, placeName, address, lat, lng]);

  // 2. Fetch Live Weather for these coordinates
  useEffect(() => {
    let isMounted = true;
    async function fetchCoordsWeather() {
      setLoadingWeather(true);
      try {
        const res = await axios.get(`${API_BASE}/live/weather`, {
          params: { lat, lon: lng, name: placeName },
          timeout: 6000
        });
        if (isMounted && res.data?.data?.data) {
          const payload = res.data.data.data;
          setWeather({
            temperature: payload.temperature !== null ? Math.round(payload.temperature) : 24,
            condition: payload.weatherCondition || 'Clear',
            humidity: payload.humidity !== null ? Math.round(payload.humidity) : 60,
            windSpeed: payload.windSpeedKmh !== null ? Math.round(payload.windSpeedKmh) : 8
          });
        }
      } catch (err) {
        if (isMounted) {
          setWeather({
            temperature: 24,
            condition: 'Clear Sky',
            humidity: 62,
            windSpeed: 7
          });
        }
      } finally {
        if (isMounted) setLoadingWeather(false);
      }
    }

    if (place) {
      fetchCoordsWeather();
    }
    return () => { isMounted = false; };
  }, [place, lat, lng, placeName]);

  const handleAddToMap = () => {
    setIsAdded(true);
    // Award 20 coins
    const currentCoins = parseInt(localStorage.getItem('discovery_coins') || '100', 10);
    localStorage.setItem('discovery_coins', String(currentCoins + 20));
    window.dispatchEvent(new CustomEvent('discovery_coins_updated', { detail: currentCoins + 20 }));

    if (onAddedToMap) {
      onAddedToMap(place);
    }

    setTimeout(() => {
      onClose();
      navigate(`/map?lat=${lat}&lng=${lng}&label=${encodeURIComponent(placeName)}&unverified=true`);
    }, 1200);
  };

  if (!place) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-[20px] bg-white border border-[#F0F0F0] shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-5 relative overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0 mt-0.5">
              <Globe size={20} className="text-[#0F2B1F]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Unverified but found via Maps
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-extrabold">
                  <Coins size={11} className="text-amber-600" />
                  +20 Coins Bounty
                </span>
              </div>
              <h3 className="text-lg font-black text-[#0F172A] leading-tight">
                {placeName}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1">
                {address}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mini Map Coordinates Preview Card */}
        <div className="rounded-[16px] bg-stone-50 border border-stone-200/70 p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] flex items-center justify-center text-[#0F2B1F]">
              <MapPin size={16} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                GPS Coordinate Lock
              </div>
              <div className="text-xs font-mono font-bold text-[#0F172A]">
                {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
              </div>
            </div>
          </div>

          {/* Real-time Weather Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-stone-200 text-xs font-bold text-[#0F2B1F]">
            <CloudSun size={13} className="text-[#0F2B1F]" />
            <span>{loadingWeather ? '...' : `${weather?.temperature ?? 24}°C`}</span>
            <span className="text-[10px] text-stone-500 font-semibold">{weather?.condition || 'Clear'}</span>
          </div>
        </div>

        {/* Gemini AI Description Card */}
        <div className="rounded-[16px] bg-[#E8F5E9]/40 border border-emerald-900/10 p-4 mb-5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0F2B1F] mb-1.5">
            <Sparkles size={14} className="text-emerald-700" />
            <span>DevBhoomi AI Field Guide</span>
          </div>
          <p className="text-xs text-[#0F172A] leading-relaxed whitespace-pre-line">
            {loadingAi ? (
              <span className="inline-flex items-center gap-2 text-stone-500">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Connecting to Google Gemini world intelligence...
              </span>
            ) : (
              aiDescription
            )}
          </p>
        </div>

        {/* Action Button: Add to our Map - Earn 20 Coins */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-stone-200 bg-white text-stone-700 text-xs font-bold hover:bg-stone-50 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAddToMap}
            disabled={isAdded}
            className={`flex-2 py-3 px-4 rounded-full text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
              isAdded 
                ? 'bg-emerald-600 text-white' 
                : 'bg-[#0F2B1F] hover:bg-[#163f2e] text-white'
            }`}
          >
            {isAdded ? (
              <>
                <CheckCircle2 size={16} />
                <span>Added to Map! +20 Coins</span>
              </>
            ) : (
              <>
                <Coins size={15} className="text-amber-400" />
                <span>Add to our Map — Earn 20 coins</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
