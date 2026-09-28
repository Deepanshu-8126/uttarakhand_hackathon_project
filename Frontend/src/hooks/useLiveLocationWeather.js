import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getStoredUserLocation } from '../utils/geoHelpers';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Default fallback coordinates: Kichha, Uttarakhand
const DEFAULT_COORDS = {
  lat: 28.98,
  lon: 79.51,
  city: 'Kichha'
};

export function useLiveLocationWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState(DEFAULT_COORDS.city);
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [error, setError] = useState(null);

  const fetchWeatherForCoords = useCallback(async (latitude, longitude, cityName) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/live/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          name: cityName || 'Your Location'
        },
        timeout: 8000
      });

      if (res.data?.success && res.data?.data?.data) {
        const payload = res.data.data.data;
        const formatted = {
          city: cityName || res.data.data.location?.name || 'Your Location',
          temperature: payload.temperature !== null ? Math.round(payload.temperature) : 26,
          feelsLike: payload.feelsLike !== null ? Math.round(payload.feelsLike) : 27,
          condition: payload.weatherCondition || 'Clear Sky',
          humidity: payload.humidity !== null ? Math.round(payload.humidity) : 65,
          windSpeed: payload.windSpeedKmh !== null ? Math.round(payload.windSpeedKmh) : 8,
          wmoCode: payload.wmoCode,
          forecast: payload.forecast || []
        };
        setWeather(formatted);
        setLocationName(formatted.city);
      } else {
        // Safe fallback
        setWeather({
          city: cityName || DEFAULT_COORDS.city,
          temperature: 28,
          feelsLike: 29,
          condition: 'Clear Sky',
          humidity: 65,
          windSpeed: 8,
          wmoCode: 0,
          forecast: []
        });
      }
    } catch (err) {
      console.warn('[useLiveLocationWeather] Weather fetch fallback:', err.message);
      // Fallback state so UI is never broken
      setWeather({
        city: cityName || DEFAULT_COORDS.city,
        temperature: 28,
        feelsLike: 29,
        condition: 'Pleasant Mountain Air',
        humidity: 62,
        windSpeed: 7,
        wmoCode: 1,
        forecast: []
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const detectLocationAndFetch = useCallback(() => {
    // Check if user has a stored location first
    let stored = null;
    try {
      if (typeof getStoredUserLocation === 'function') {
        stored = getStoredUserLocation();
      } else if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem('discovery_user_location');
        stored = raw ? JSON.parse(raw) : null;
      }
    } catch (_) {
      stored = null;
    }
    if (stored && stored.coordinates && stored.coordinates.length === 2) {
      const [lat, lon] = stored.coordinates;
      const cityName = stored.city || stored.formatted || 'Your Location';
      setCoords({ lat, lon, city: cityName });
      setLocationName(cityName);
      fetchWeatherForCoords(lat, lon, cityName);
      return;
    }

    if (typeof window === 'undefined' || !navigator.geolocation) {
      fetchWeatherForCoords(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon, DEFAULT_COORDS.city);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon, city: 'Detected Location' });
        
        // Reverse geocode city name if possible via Nominatim OSM (free, zero billing)
        let resolvedCity = 'Your Location';
        try {
          const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
            headers: { 'Accept': 'application/json' }
          });
          if (revRes.ok) {
            const revData = await revRes.json();
            resolvedCity = revData.address?.city || revData.address?.town || revData.address?.village || revData.address?.county || 'Your Location';
          }
        } catch {
          // Keep default
        }
        setLocationName(resolvedCity);
        fetchWeatherForCoords(lat, lon, resolvedCity);
      },
      (err) => {
        // Location denied or timed out -> Gracefully use default coordinates without polluting console
        setCoords(DEFAULT_COORDS);
        setLocationName(DEFAULT_COORDS.city);
        fetchWeatherForCoords(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon, DEFAULT_COORDS.city);
      },
      { timeout: 7000, maximumAge: 300000 }
    );
  }, [fetchWeatherForCoords]);

  useEffect(() => {
    detectLocationAndFetch();

    const handleLocationUpdate = (e) => {
      if (e.detail && e.detail.coordinates) {
        const [lat, lon] = e.detail.coordinates;
        const cityName = e.detail.city || e.detail.formatted || 'Your Location';
        setCoords({ lat, lon, city: cityName });
        setLocationName(cityName);
        fetchWeatherForCoords(lat, lon, cityName);
      }
    };
    window.addEventListener('discovery_location_updated', handleLocationUpdate);
    return () => window.removeEventListener('discovery_location_updated', handleLocationUpdate);
  }, [detectLocationAndFetch, fetchWeatherForCoords]);

  return {
    weather,
    loading,
    locationName,
    coords,
    refreshWeather: detectLocationAndFetch,
    fetchForCustomCoords: fetchWeatherForCoords,
    error
  };
}

export default useLiveLocationWeather;
