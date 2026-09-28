import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getStoredUserLocation, 
  setStoredUserLocation, 
  reverseGeocodeCoords, 
  detectBrowserLocation 
} from '../utils/geoHelpers';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(getStoredUserLocation());
  const [isDetecting, setIsDetecting] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [isWatching, setIsWatching] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Sync state if localStorage changes elsewhere
  useEffect(() => {
    const handleLocationUpdate = (e) => {
      if (e.detail) {
        setLocation(e.detail);
      }
    };
    window.addEventListener('discovery_location_updated', handleLocationUpdate);
    return () => window.removeEventListener('discovery_location_updated', handleLocationUpdate);
  }, []);

  // Check initial browser permission status if supported
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((result) => {
          setPermissionState(result.state);
          result.onchange = () => {
            setPermissionState(result.state);
          };

          // If permission was already granted previously, auto-fetch real-time location
          if (result.state === 'granted') {
            requestLocationPermission({ silent: true });
          }
        })
        .catch(() => {
          // Ignore permission query errors in browsers with strict security policies
        });
    }
  }, []);

  /**
   * Primary function to request real-time location access from the user's browser.
   */
  const requestLocationPermission = useCallback(async (options = { silent: false }) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      const err = 'Geolocation is not supported by your browser.';
      if (!options.silent) setErrorMsg(err);
      return { success: false, error: err };
    }

    if (!options.silent) setIsDetecting(true);
    setErrorMsg(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy || 0);

          let locationName = 'Current Location';
          try {
            locationName = await reverseGeocodeCoords(lat, lng);
          } catch (e) {
            console.warn('[LocationContext] Reverse geocode fallback:', e);
          }

          const cityName = locationName.split(',')[0].trim();
          const locationObj = {
            city: cityName || 'Detected Location',
            formatted: locationName,
            detectedName: locationName,
            coordinates: [lat, lng],
            accuracy,
            isGps: true,
            updatedAt: Date.now()
          };

          setLocation(locationObj);
          setStoredUserLocation(locationObj);
          setPermissionState('granted');
          setIsDetecting(false);
          setErrorMsg(null);

          resolve({ success: true, location: locationObj });
        },
        (err) => {
          setIsDetecting(false);
          let userMsg = 'Unable to fetch your location.';
          if (err.code === 1) {
            setPermissionState('denied');
            userMsg = 'Location access was denied. Please allow location permissions in your browser bar.';
          } else if (err.code === 2) {
            userMsg = 'Position unavailable. Please check your network or GPS signal.';
          } else if (err.code === 3) {
            userMsg = 'Location request timed out. Retrying...';
          }

          if (!options.silent) setErrorMsg(userMsg);
          resolve({ success: false, error: userMsg, code: err.code });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  /**
   * Start continuous real-time live GPS location watching (e.g., during active tracking/navigation/SOS).
   */
  const startLiveTracking = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    if (watchId !== null) return; // Already watching

    setIsWatching(true);
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 0);

        setLocation((prev) => {
          const updated = {
            ...(prev || {}),
            coordinates: [lat, lng],
            accuracy,
            isGps: true,
            updatedAt: Date.now()
          };
          setStoredUserLocation(updated);
          return updated;
        });
      },
      (err) => {
        console.warn('[LocationContext] Watch position error:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000
      }
    );

    setWatchId(id);
  }, [watchId]);

  /**
   * Stop continuous live tracking.
   */
  const stopLiveTracking = useCallback(() => {
    if (watchId !== null && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsWatching(false);
    }
  }, [watchId]);

  /**
   * Manually select a starting hub or city without GPS.
   */
  const setManualCity = useCallback((cityData) => {
    setLocation(cityData);
    setStoredUserLocation(cityData);
    setErrorMsg(null);
  }, []);

  const value = {
    location,
    isDetecting,
    isWatching,
    permissionState,
    errorMsg,
    requestLocationPermission,
    startLiveTracking,
    stopLiveTracking,
    setManualCity
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return ctx;
}
