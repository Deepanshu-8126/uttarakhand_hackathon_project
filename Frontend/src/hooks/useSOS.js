import { useState, useEffect, useRef, useCallback } from 'react';
import { sosApi } from '../api/sosApi';

const STORAGE_ACTIVE_SOS_KEY = 'devbhoomi_active_sos_v1';
const STORAGE_CONTACTS_KEY = 'devbhoomi_emergency_contacts_v1';
const STORAGE_OFFLINE_QUEUE_KEY = 'devbhoomi_offline_sos_queue_v1';

export function useSOS() {
  const [location, setLocation] = useState({
    lat: 30.7346,
    lng: 79.0669,
    altitude: 0,
    accuracy: 15,
    isLive: false
  });
  const [battery, setBattery] = useState({ level: 100, isCharging: false });
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [activeAlert, setActiveAlert] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_SOS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isTriggering, setIsTriggering] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONTACTS_KEY);
      return saved ? JSON.parse(saved) : [
        { name: 'Family / Guardian', phone: '', relation: 'Family' },
        { name: 'Trip Leader / Trek Guide', phone: '', relation: 'Guide' }
      ];
    } catch {
      return [];
    }
  });

  const holdIntervalRef = useRef(null);
  const holdStartTimeRef = useRef(null);
  const audioContextRef = useRef(null);
  const sirenOscillatorRef = useRef(null);
  const sirenGainRef = useRef(null);
  const sirenIntervalRef = useRef(null);

  // 1. Live Geolocation Tracker
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    const updatePos = (pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        altitude: Math.round(pos.coords.altitude || 0),
        accuracy: Math.round(pos.coords.accuracy || 10),
        isLive: true
      });
    };

    navigator.geolocation.getCurrentPosition(updatePos, () => {}, {
      enableHighAccuracy: true,
      timeout: 10000
    });

    const watchId = navigator.geolocation.watchPosition(updatePos, () => {}, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 2. Battery Telemetry Monitor
  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then((batt) => {
        const updateBatt = () => {
          setBattery({
            level: Math.round(batt.level * 100),
            isCharging: batt.charging
          });
        };
        updateBatt();
        batt.addEventListener('levelchange', updateBatt);
        batt.addEventListener('chargingchange', updateBatt);
      }).catch(() => {});
    }
  }, []);

  // 3. Online/Offline & Auto-sync queue
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      // Process offline queue if any
      try {
        const queued = localStorage.getItem(STORAGE_OFFLINE_QUEUE_KEY);
        if (queued) {
          const payload = JSON.parse(queued);
          const res = await sosApi.trigger(payload);
          if (res.success) {
            localStorage.removeItem(STORAGE_OFFLINE_QUEUE_KEY);
            setActiveAlert(res.data);
            localStorage.setItem(STORAGE_ACTIVE_SOS_KEY, JSON.stringify(res.data));
          }
        }
      } catch (err) {
        console.warn('[useSOS] Failed to sync offline queue:', err);
      }
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save emergency contacts
  const saveEmergencyContacts = useCallback((contacts) => {
    setEmergencyContacts(contacts);
    try {
      localStorage.setItem(STORAGE_CONTACTS_KEY, JSON.stringify(contacts));
    } catch {}
  }, []);

  // Web Audio Synthesizer Distress Siren (zero external dependencies)
  const startSiren = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.value = 0.3; // Safe audible volume

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      sirenOscillatorRef.current = osc;
      sirenGainRef.current = gain;
      setIsSirenPlaying(true);

      // Modulate frequency between 600Hz and 1400Hz (European / Mountain Siren standard)
      let high = false;
      sirenIntervalRef.current = setInterval(() => {
        if (!sirenOscillatorRef.current) return;
        const targetFreq = high ? 1400 : 700;
        sirenOscillatorRef.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.15);
        high = !high;
      }, 400);
    } catch (e) {
      console.warn('[useSOS] Web Audio Siren error:', e);
    }
  }, []);

  const stopSiren = useCallback(() => {
    try {
      if (sirenIntervalRef.current) {
        clearInterval(sirenIntervalRef.current);
        sirenIntervalRef.current = null;
      }
      if (sirenOscillatorRef.current) {
        sirenOscillatorRef.current.stop();
        sirenOscillatorRef.current.disconnect();
        sirenOscillatorRef.current = null;
      }
      setIsSirenPlaying(false);
    } catch {}
  }, []);

  const toggleSiren = useCallback(() => {
    if (isSirenPlaying) {
      stopSiren();
    } else {
      startSiren();
    }
  }, [isSirenPlaying, startSiren, stopSiren]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopSiren();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stopSiren]);

  // Execute actual SOS trigger API call
  const triggerSOS = useCallback(async ({ incidentType = 'GENERAL_SOS', message = '', travelerName = '', travelerPhone = '' } = {}) => {
    setIsTriggering(true);

    // Haptic vibration feedback if mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 600]);
    }

    const payload = {
      travelerName: travelerName || 'Uttarakhand Traveler',
      travelerPhone: travelerPhone || '',
      incidentType,
      severity: 'CRITICAL',
      message: message || `🚨 EMERGENCY DISTRESS BEACON: ${incidentType.replace(/_/g, ' ')} at coordinates ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}.`,
      location: {
        lat: location.lat,
        lng: location.lng,
        altitude: location.altitude,
        accuracy: location.accuracy,
        district: 'Uttarakhand Mountain Trail'
      },
      deviceTelemetry: {
        batteryLevel: battery.level,
        isCharging: battery.isCharging,
        networkStatus: isOnline ? 'ONLINE' : 'OFFLINE_QUEUED'
      },
      emergencyContacts: emergencyContacts.filter(c => c.phone)
    };

    if (!isOnline) {
      // Queue locally
      payload.offlineQueuedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_OFFLINE_QUEUE_KEY, JSON.stringify(payload));
      const localAlert = {
        alertCode: `OFFLINE-SOS-${Date.now().toString().slice(-4)}`,
        status: 'OFFLINE_QUEUED',
        incidentType,
        location: payload.location,
        deviceTelemetry: payload.deviceTelemetry,
        createdAt: new Date().toISOString()
      };
      setActiveAlert(localAlert);
      localStorage.setItem(STORAGE_ACTIVE_SOS_KEY, JSON.stringify(localAlert));
      setIsTriggering(false);
      return { success: true, offline: true, data: localAlert };
    }

    try {
      const res = await sosApi.trigger(payload);
      if (res.success) {
        setActiveAlert(res.data);
        localStorage.setItem(STORAGE_ACTIVE_SOS_KEY, JSON.stringify(res.data));
      }
      setIsTriggering(false);
      return res;
    } catch (err) {
      console.error('[useSOS] triggerSOS error:', err);
      // Fallback offline queue
      payload.offlineQueuedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_OFFLINE_QUEUE_KEY, JSON.stringify(payload));
      const localAlert = {
        alertCode: `PENDING-SOS-${Date.now().toString().slice(-4)}`,
        status: 'ACTIVE',
        incidentType,
        location: payload.location,
        createdAt: new Date().toISOString()
      };
      setActiveAlert(localAlert);
      localStorage.setItem(STORAGE_ACTIVE_SOS_KEY, JSON.stringify(localAlert));
      setIsTriggering(false);
      return { success: true, offline: true, data: localAlert };
    }
  }, [location, battery, isOnline, emergencyContacts]);

  // Hold-to-trigger timer (2000ms duration)
  const startHold = useCallback((params = {}) => {
    if (activeAlert?.status === 'ACTIVE') return;

    // Small initial haptic tap
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }

    holdStartTimeRef.current = Date.now();
    const duration = 2000; // 2.0s hold

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartTimeRef.current;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setHoldProgress(progress);

      if (progress >= 100) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
        setHoldProgress(0);
        triggerSOS(params);
      }
    }, 40);
  }, [activeAlert, triggerSOS]);

  const cancelHold = useCallback(() => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHoldProgress(0);
  }, []);

  // Cancel existing active SOS
  const cancelSOS = useCallback(async (reason = 'Tourist reached safety') => {
    if (!activeAlert?.alertCode) {
      setActiveAlert(null);
      localStorage.removeItem(STORAGE_ACTIVE_SOS_KEY);
      stopSiren();
      return;
    }

    try {
      await sosApi.cancel(activeAlert.alertCode, reason);
    } catch (err) {
      console.warn('[useSOS] cancelSOS remote warning:', err);
    }

    setActiveAlert(null);
    localStorage.removeItem(STORAGE_ACTIVE_SOS_KEY);
    stopSiren();
  }, [activeAlert, stopSiren]);

  return {
    location,
    battery,
    isOnline,
    activeAlert,
    isTriggering,
    holdProgress,
    isSirenPlaying,
    emergencyContacts,
    saveEmergencyContacts,
    startHold,
    cancelHold,
    triggerSOS,
    cancelSOS,
    toggleSiren,
    startSiren,
    stopSiren
  };
}

export default useSOS;
