import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useMapStore } from '../store/mapStore';
import { getDestinations } from '../api/destinationApi';
import { getSpiritualPlaces } from '../api/spiritualApi';
import { getStays } from '../api/stayApi';
import { getActivities } from '../api/activityApi';
import { detectBrowserLocation, geocodeCityName, POPULAR_START_HUBS } from '../utils/geoHelpers';
import { generatePersonalizedTripPlan } from '../utils/itineraryGenerator';
import { fetchOSRMRoute } from '../utils/routeHelpers';
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  Users,
  Compass,
  Sparkles,
  Search,
  Check,
  AlertCircle,
  RotateCcw,
  Navigation,
  Loader2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Mountain,
  Landmark,
  Trees,
  Coffee,
  Flame,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Bike,
  Sun,
  Moon,
  Sunset
} from 'lucide-react';

const normaliseEntity = (raw, type) => {
  const c = raw.location?.coordinates;
  const coords =
    Array.isArray(c) && c.length === 2
      ? [c[1], c[0]]
      : Array.isArray(raw.coordinates) && raw.coordinates.length === 2
      ? raw.coordinates
      : null;

  const image =
    raw.coverImage?.url ||
    (typeof raw.coverImage === 'string' ? raw.coverImage : null) ||
    raw.image?.url ||
    (typeof raw.image === 'string' ? raw.image : null) ||
    (Array.isArray(raw.images) && raw.images[0]?.url) ||
    '/assets/fallback.svg';

  return {
    ...raw,
    id: raw._id || raw.slug,
    type,
    coordinates: coords,
    image,
    district: raw.district || 'Uttarakhand',
    region: raw.region || raw.area || '',
    shortDesc: raw.shortDescription || raw.shortDesc || raw.description || '',
    category: raw.category || type,
  };
};

const VIBE_OPTIONS = [
  { id: 'Adventure', label: 'Adventure & Rafting', icon: Compass, desc: 'Thrilling rapids, cliff jumps & outdoors' },
  { id: 'Spiritual', label: 'Spiritual & Yatras', icon: Landmark, desc: 'Sacred shrines, temples & holy rivers' },
  { id: 'Peaceful', label: 'Peaceful Nature & Retreats', icon: Trees, desc: 'Quiet pine forests, sunrise viewpoints' },
  { id: 'Trekking', label: 'High Altitude Treks', icon: Mountain, desc: 'Alpine meadows, ridges & Himalayan peaks' },
  { id: 'Culture', label: 'Local Culture & Food', icon: Flame, desc: 'Pahari heritage, local homestays & craft' },
  { id: 'Relaxation', label: 'Slow Mountain Workcation', icon: Coffee, desc: 'Cozy cafes, mountain wi-fi & chill vibes' },
  { id: 'Road Trip', label: 'Mountain Road Trip', icon: Car, desc: 'Curving ghat passes, scenic vistas' }
];

const POPULAR_DESTINATIONS = [
  { name: 'Kedarnath & Chopta', district: 'Rudraprayag', vibe: 'Spiritual' },
  { name: 'Rishikesh & Shivpuri', district: 'Dehradun', vibe: 'Adventure' },
  { name: 'Nainital & Mukteshwar', district: 'Nainital', vibe: 'Peaceful' },
  { name: 'Auli & Joshimath', district: 'Chamoli', vibe: 'Trekking' },
  { name: 'Kanatal & Dhanaulti', district: 'Tehri Garhwal', vibe: 'Peaceful' },
  { name: 'Adi Kailash & Om Parvat', district: 'Pithoragarh', vibe: 'Spiritual' }
];

export default function TripPlanner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destinationParam = searchParams.get('destination') || searchParams.get('dest') || '';
  const queryParam = searchParams.get('query') || destinationParam || '';
  const rentalNameParam = searchParams.get('rental_name') || searchParams.get('rentalName');
  const rentalLocationParam = searchParams.get('location') || searchParams.get('city');
  const rentalPriceParam = searchParams.get('price');
  const rentalTypeParam = searchParams.get('type') || 'Bike';

  // Smart initial state parsing from AI prompt query
  const initialVibes = useMemo(() => {
    const q = queryParam.toLowerCase();
    if (q.includes('snow') || q.includes('trek')) return ['Adventure', 'Trekking'];
    if (q.includes('char dham') || q.includes('dham') || q.includes('yatra') || q.includes('shiva') || q.includes('temple')) return ['Spiritual'];
    if (q.includes('village') || q.includes('food') || q.includes('culture') || q.includes('homestay')) return ['Culture', 'Peaceful'];
    return ['Adventure', 'Peaceful'];
  }, [queryParam]);

  const initialDays = useMemo(() => {
    const match = queryParam.match(/(\d+)\s*(din|day|days)/i);
    return match ? Math.min(Math.max(parseInt(match[1], 10), 1), 14) : 5;
  }, [queryParam]);

  const initialBudget = useMemo(() => {
    const q = queryParam.toLowerCase();
    if (q.includes('5k') || q.includes('5000')) return 5000;
    if (q.includes('10k') || q.includes('10000')) return 10000;
    if (q.includes('15k') || q.includes('15000')) return 15000;
    if (q.includes('20k') || q.includes('20000')) return 20000;
    return 15000;
  }, [queryParam]);

  const {
    allDestinations,
    allSpiritual,
    allActivities,
    allStays,
    setDestinations,
    setSpiritual,
    setStays,
    setActivities,
    setActiveTripSession,
    tripDestinations,
  } = useMapStore();

  const [loadingData, setLoadingData] = useState(true);

  // Conversational 3-Step Wizard State (1: Vibe, 2: Constraints, 3: Travelers, 4: Result Timeline)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Vibe
  const [selectedVibes, setSelectedVibes] = useState(initialVibes);

  // Step 2: Constraints (Days, Budget, Origin, Destination)
  const [numDays, setNumDays] = useState(initialDays);
  const [budgetPerPerson, setBudgetPerPerson] = useState(initialBudget);
  const [startingLocation, setStartingLocation] = useState({
    name: rentalLocationParam ? `${rentalLocationParam}, Uttarakhand` : 'Dehradun, Uttarakhand',
    coordinates: [30.3165, 78.0322],
  });
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [destSearchQuery, setDestSearchQuery] = useState(queryParam ? queryParam.replace(/(\d+)\s*(din|days?)/gi, '').replace(/budget\s*<*\s*\d+k*/gi, '').trim() : '');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Step 3: Travelers & Transport
  const [travelerType, setTravelerType] = useState('couple'); // 'solo' | 'couple' | 'family' | 'group'
  const [travelerCount, setTravelerCount] = useState(2);
  const [transportMode, setTransportMode] = useState(rentalNameParam ? (rentalTypeParam.toLowerCase().includes('car') ? 'Car' : 'Bike') : 'Car'); // 'Car' | 'Bike' | 'Taxi' | 'Bus'
  const [pace, setPace] = useState('Balanced'); // 'Relaxed' | 'Balanced' | 'Fast'

  // Generated Result State
  const [isPlanning, setIsPlanning] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [generatedItinerary, setGeneratedItinerary] = useState(null);

  // Load backend datasets
  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const [destRes, spirRes, stayRes, actRes] = await Promise.allSettled([
          getDestinations(),
          getSpiritualPlaces(),
          getStays(),
          getActivities(),
        ]);

        if (destRes.status === 'fulfilled') {
          const arr = destRes.value?.data || destRes.value || [];
          if (Array.isArray(arr)) setDestinations(arr.map((d) => normaliseEntity(d, 'destination')));
        }
        if (spirRes.status === 'fulfilled') {
          const arr = spirRes.value?.data || spirRes.value || [];
          if (Array.isArray(arr)) setSpiritual(arr.map((s) => normaliseEntity(s, 'spiritual')));
        }
        if (stayRes.status === 'fulfilled') {
          const arr = stayRes.value?.data || stayRes.value || [];
          if (Array.isArray(arr)) setStays(arr.map((st) => normaliseEntity(st, 'stay')));
        }
        if (actRes.status === 'fulfilled') {
          const arr = actRes.value?.data || actRes.value || [];
          if (Array.isArray(arr)) setActivities(arr.map((a) => normaliseEntity(a, 'activity')));
        }
      } catch (err) {
        console.error('Failed to load datasets:', err);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [setDestinations, setSpiritual, setStays, setActivities]);

  // Combined searchable destinations
  const searchableDestinations = useMemo(() => {
    return [...allDestinations, ...allSpiritual];
  }, [allDestinations, allSpiritual]);

  const filteredDestinations = useMemo(() => {
    if (!destSearchQuery.trim()) return searchableDestinations.slice(0, 6);
    const q = destSearchQuery.toLowerCase();
    return searchableDestinations
      .filter((d) => (d.name?.toLowerCase().includes(q) || d.title?.toLowerCase().includes(q) || d.district?.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [searchableDestinations, destSearchQuery]);

  // Context-Aware synchronization: auto-fill destination if passed via URL
  useEffect(() => {
    if (destinationParam) {
      setDestSearchQuery(destinationParam);
      const matched = searchableDestinations.find(d => 
        (d.name && d.name.toLowerCase().includes(destinationParam.toLowerCase())) ||
        (d.title && d.title.toLowerCase().includes(destinationParam.toLowerCase())) ||
        (d.slug && d.slug.toLowerCase().includes(destinationParam.toLowerCase()))
      );
      if (matched) {
        setSelectedDestination(matched);
      } else {
        setSelectedDestination({
          name: destinationParam,
          district: 'Uttarakhand',
          title: destinationParam,
          shortDesc: `Tailored mountain itinerary for ${destinationParam}`
        });
      }
    }
  }, [destinationParam, searchableDestinations]);

  // Toggle Vibe Chips
  const toggleVibe = (id) => {
    if (selectedVibes.includes(id)) {
      if (selectedVibes.length > 1) {
        setSelectedVibes(selectedVibes.filter(v => v !== id));
      }
    } else {
      setSelectedVibes([...selectedVibes, id]);
    }
  };

  // Set Traveler Persona
  const handleSelectPersona = (type, count) => {
    setTravelerType(type);
    setTravelerCount(count);
  };

  // Live Budget Calculations
  const liveBudgetBreakdown = useMemo(() => {
    const nights = Math.max(1, numDays - 1);
    const roomsNeeded = Math.ceil(travelerCount / 2);

    let stayPerNight = 2600;
    let foodPerDay = 800;
    let activitiesCost = 1200;
    let transportTotal = 2500 * numDays;

    if (budgetPerPerson < 8000) {
      stayPerNight = 1200;
      foodPerDay = 500;
      activitiesCost = 600;
    } else if (budgetPerPerson > 25000) {
      stayPerNight = 5500;
      foodPerDay = 1800;
      activitiesCost = 3000;
    }

    if (transportMode === 'Bike') transportTotal = 1200 * numDays;
    else if (transportMode === 'Taxi') transportTotal = 4000 * numDays;
    else if (transportMode === 'Bus') transportTotal = 500 * numDays * travelerCount;

    const stayTotal = roomsNeeded * stayPerNight * nights;
    const foodTotal = travelerCount * foodPerDay * numDays;
    const actTotal = travelerCount * activitiesCost;
    const subtotal = stayTotal + foodTotal + actTotal + transportTotal;
    const escrowProtectionFee = 0; // 100% Free
    const totalEstimated = subtotal;

    return {
      stayTotal,
      foodTotal,
      actTotal,
      transportTotal,
      escrowProtectionFee,
      totalEstimated,
      perPersonCost: Math.round(totalEstimated / travelerCount)
    };
  }, [numDays, budgetPerPerson, travelerCount, transportMode]);

  // Handle Location Detection
  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    const res = await detectBrowserLocation();
    setIsDetectingLocation(false);
    if (res.success) {
      setStartingLocation({
        name: res.name,
        coordinates: res.coordinates,
      });
    }
  };

  // Generate Itinerary
  const handleGenerateItinerary = async () => {
    setValidationError('');
    setIsPlanning(true);

    try {
      const primaryDest = selectedDestination || (allDestinations.length > 0 ? allDestinations[0] : {
        name: 'Chopta & Tungnath',
        district: 'Rudraprayag',
        coordinates: [30.4854, 79.1869]
      });

      let routeData = { totalDistanceKm: 240, estimatedTime: '6h 30m', geometry: null, legs: [] };
      if (startingLocation.coordinates && primaryDest.coordinates) {
        try {
          const waypoints = [
            { coordinates: startingLocation.coordinates, name: startingLocation.name },
            { coordinates: primaryDest.coordinates, name: primaryDest.name },
          ];
          routeData = await fetchOSRMRoute(waypoints);
        } catch (e) {
          console.warn('OSRM Route fallback:', e);
        }
      }

      const preferences = {
        duration: `${numDays} Days`,
        pace,
        travelMode: `By ${transportMode}`,
        transport: `By ${transportMode}`,
        travelers: `${travelerCount} Travelers (${travelerType})`,
        tripType: selectedVibes,
        budget: budgetPerPerson < 10000 ? 'Budget' : budgetPerPerson > 25000 ? 'Premium' : 'Comfort',
      };

      const dayPlans = generatePersonalizedTripPlan({
        startingLocation,
        destination: primaryDest,
        preferences,
        routeData,
        allActivities,
        allSpiritual,
        allStays,
      });

      const tripId = `trip_${Date.now()}`;
      const tripSession = {
        tripId,
        title: `My ${primaryDest.name} Journey`,
        startingLocation,
        destination: primaryDest,
        duration: `${numDays} Days`,
        travelers: `${travelerCount} Travelers`,
        transport: `By ${transportMode}`,
        tripType: selectedVibes,
        pace,
        budget: preferences.budget,
        routeData,
        dayPlans,
        budgetBreakdown: liveBudgetBreakdown,
        status: 'Planning',
      };

      setActiveTripSession(tripSession);
      try {
        localStorage.setItem('discovery_active_trip', JSON.stringify(tripSession));
      } catch (e) {
        console.warn(e);
      }

      setGeneratedItinerary(tripSession);
      setCurrentStep(4); // Move to result view
    } catch (err) {
      console.error('Failed to generate trip:', err);
      setValidationError('Could not generate itinerary. Please verify your inputs.');
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-24">
        
        {/* Step Progress Bar (1 -> 2 -> 3) */}
        {currentStep <= 3 && (
          <div className="mb-10 max-w-xl mx-auto text-center">
            
            {/* The Anchor Card (When triggered from Rental Bridge) */}
            {rentalNameParam && (
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-emerald-50/95 border-2 border-emerald-500/40 shadow-xs flex items-start sm:items-center justify-between gap-4 text-left animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#0f3d2e] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Bike size={22} className="text-emerald-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0f3d2e] text-white flex items-center gap-1">
                        <Lock size={10} /> Trip Anchor
                      </span>
                      <span className="text-xs font-bold text-emerald-800">
                        {rentalLocationParam || 'Haldwani'} Pickup
                      </span>
                    </div>
                    <h3 className="font-black text-sm sm:text-base text-emerald-950 mt-0.5">
                      Your trip will start with: {rentalNameParam}
                    </h3>
                    <p className="text-xs text-emerald-700 font-medium">
                      Route, mileage &amp; fuel costs will be calculated around this ride {rentalPriceParam ? `(₹${rentalPriceParam}/day)` : ''}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {queryParam && (
              <div className="mb-4 p-3 sm:p-3.5 rounded-2xl bg-[#0F2B1F] text-white border border-emerald-700/60 shadow-md flex items-center justify-between gap-3 text-left animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
                    <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                        AI Concierge Prompt
                      </span>
                      <span className="text-[11px] text-emerald-300/80 font-medium hidden sm:inline">Preferences Synced</span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                      &ldquo;{queryParam}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0f3d2e] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={13} className="text-emerald-700" />
              <span>AI Mountain Trip Planner</span>
            </div>

            {selectedDestination && (
              <div className="mb-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-300/80 text-[#0f3d2e] text-xs font-bold shadow-xs">
                <MapPin size={13} className="text-emerald-800 shrink-0" />
                <span>Trip Destination: <strong className="text-emerald-950 font-black">{selectedDestination.name}</strong></span>
              </div>
            )}

            <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
              {currentStep === 1 && "1. Pick Your Travel Vibe"}
              {currentStep === 2 && "2. Set Your Constraints"}
              {currentStep === 3 && "3. Who Is Traveling?"}
            </h1>
            
            <p className="text-stone-600 text-xs sm:text-sm mt-1.5 max-w-md mx-auto">
              {currentStep === 1 && "Select the moods and experiences you want for your Himalayan adventure."}
              {currentStep === 2 && "Tell us your preferred trip length, budget limit, and starting point."}
              {currentStep === 3 && "Pick your travel group size and transportation style."}
            </p>

            {/* Stepper Dots */}
            <div className="flex items-center justify-center gap-2 mt-5">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s}
                  onClick={() => s < currentStep && setCurrentStep(s)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === currentStep 
                      ? 'w-10 bg-[#0f3d2e]' 
                      : s < currentStep 
                      ? 'w-4 bg-emerald-700 cursor-pointer' 
                      : 'w-4 bg-stone-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {validationError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 max-w-xl mx-auto">
            <AlertCircle size={16} className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* ── STEP 1: PICK YOUR VIBE ── */}
        {currentStep === 1 && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {VIBE_OPTIONS.map((vibe) => {
                const IconComponent = vibe.icon;
                const isSelected = selectedVibes.includes(vibe.id);
                return (
                  <button
                    key={vibe.id}
                    type="button"
                    onClick={() => toggleVibe(vibe.id)}
                    className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between h-36 cursor-pointer ${
                      isSelected
                        ? 'bg-[#0f3d2e] text-white border-[#0f3d2e] shadow-lg shadow-emerald-950/15 scale-[1.02]'
                        : 'bg-white text-stone-800 border-stone-200 hover:border-stone-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-white/15 text-emerald-300' : 'bg-stone-100 text-[#0f3d2e]'
                      }`}>
                        <IconComponent size={20} />
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-sm sm:text-base leading-tight">
                        {vibe.label}
                      </h3>
                      <p className={`text-xs mt-1 line-clamp-1 ${isSelected ? 'text-emerald-100/80' : 'text-stone-500'}`}>
                        {vibe.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Step Nav */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition-all flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
              >
                <span>Continue to Constraints</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: SET YOUR CONSTRAINTS ── */}
        {currentStep === 2 && (
          <div className="space-y-6 max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm animate-in fade-in duration-300">
            
            {/* 1. Duration Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#0f3d2e]" />
                  Trip Duration
                </label>
                <span className="text-base font-black text-[#0f3d2e]">
                  {numDays} Days / {Math.max(1, numDays - 1)} Nights
                </span>
              </div>
              <input 
                type="range"
                min="2"
                max="12"
                step="1"
                value={numDays}
                onChange={(e) => setNumDays(Number(e.target.value))}
                className="w-full accent-[#0f3d2e] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-semibold text-stone-400 mt-1">
                <span>Weekend (2D)</span>
                <span>Classic (5D)</span>
                <span>Explorer (7D)</span>
                <span>Grand Expedition (12D)</span>
              </div>
            </div>

            {/* 2. Budget Slider */}
            <div className="pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Wallet size={14} className="text-[#0f3d2e]" />
                  Budget Limit (Per Person)
                </label>
                <span className="text-base font-black text-[#0f3d2e]">
                  ₹{budgetPerPerson.toLocaleString('en-IN')}
                </span>
              </div>
              <input 
                type="range"
                min="4000"
                max="40000"
                step="1000"
                value={budgetPerPerson}
                onChange={(e) => setBudgetPerPerson(Number(e.target.value))}
                className="w-full accent-[#0f3d2e] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-semibold text-stone-400 mt-1">
                <span>🎒 Backpacker (₹4K)</span>
                <span>🌿 Balanced (₹15K)</span>
                <span>⭐ Luxury (₹40K)</span>
              </div>
            </div>

            {/* 3. Starting Hub */}
            <div className="pt-4 border-t border-stone-100">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Navigation size={14} className="text-[#0f3d2e]" />
                  Starting Point
                </span>
                <button 
                  type="button" 
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  {isDetectingLocation ? 'Detecting...' : 'Use My GPS'}
                </button>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Dehradun', 'Rishikesh', 'Haridwar', 'Delhi NCR'].map((hub) => (
                  <button
                    key={hub}
                    type="button"
                    onClick={() => setStartingLocation({ name: `${hub}, Uttarakhand`, coordinates: [30.3165, 78.0322] })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      startingLocation.name.includes(hub) 
                        ? 'bg-[#0f3d2e] text-white border-[#0f3d2e]' 
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {hub}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Target Destination */}
            <div className="pt-4 border-t border-stone-100">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#0f3d2e]" />
                  Preferred Uttarakhand Destination
                </span>
                {selectedDestination && (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Selected: {selectedDestination.name}
                  </span>
                )}
              </label>

              {/* Selected Destination Highlight Banner */}
              {selectedDestination && (
                <div className="mb-3 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#0f3d2e] text-white flex items-center justify-center shrink-0">
                      <MapPin size={15} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-950">{selectedDestination.name}</div>
                      <div className="text-[10px] text-emerald-700">{selectedDestination.district || 'Uttarakhand'}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDestination(null);
                      setDestSearchQuery('');
                    }}
                    className="text-[11px] font-bold text-stone-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="relative mb-3">
                <Search size={14} className="absolute left-3.5 top-3.5 text-stone-400" />
                <input 
                  type="text"
                  value={destSearchQuery}
                  onChange={(e) => setDestSearchQuery(e.target.value)}
                  placeholder="Search destination (e.g. Chopta, Kedarnath, Auli, Nainital)..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/30 focus:border-[#0f3d2e]"
                />
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredDestinations.map((d) => (
                  <button
                    key={d.name || d.title}
                    type="button"
                    onClick={() => {
                      setSelectedDestination(d);
                      setDestSearchQuery(d.name || d.title || '');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      selectedDestination?.name === (d.name || d.title) 
                        ? 'bg-[#0f3d2e] text-white border-[#0f3d2e] shadow-xs' 
                        : 'bg-[#fdfbf7] text-stone-800 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="font-bold truncate">{d.name || d.title}</div>
                    <div className={`text-[10px] ${selectedDestination?.name === (d.name || d.title) ? 'text-emerald-200' : 'text-stone-500'}`}>
                      {d.district || 'Uttarakhand'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between pt-6 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-stone-600 hover:text-stone-900 font-bold text-xs flex items-center gap-1.5 py-2"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition-all flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
              >
                <span>Continue to Travelers</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        )}

        {/* ── STEP 3: WHO IS TRAVELING? ── */}
        {currentStep === 3 && (
          <div className="space-y-6 max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm animate-in fade-in duration-300">
            
            {/* Personas */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-3 flex items-center gap-1.5">
                <Users size={14} className="text-[#0f3d2e]" />
                Select Group Size
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'solo', label: 'Solo Explorer', count: 1, icon: '🚶' },
                  { id: 'couple', label: 'Couple / Duo', count: 2, icon: '👫' },
                  { id: 'family', label: 'Family (3-4)', count: 3, icon: '👨‍👩‍👧' },
                  { id: 'group', label: 'Group (5+)', count: 5, icon: '👥' },
                ].map((persona) => (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => handleSelectPersona(persona.id, persona.count)}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      travelerType === persona.id 
                        ? 'bg-[#0f3d2e] text-white border-[#0f3d2e] shadow-md scale-102' 
                        : 'bg-stone-50 text-stone-800 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{persona.icon}</div>
                    <div className="text-xs font-bold leading-tight">{persona.label}</div>
                    <div className={`text-[10px] mt-0.5 ${travelerType === persona.id ? 'text-emerald-200' : 'text-stone-500'}`}>
                      {persona.count} {persona.count === 1 ? 'Person' : 'People'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Transport Mode */}
            <div className="pt-4 border-t border-stone-100">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-3 flex items-center gap-1.5">
                <Car size={14} className="text-[#0f3d2e]" />
                Preferred Travel Mode
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'Car', label: 'Self-Drive Car / SUV', icon: Car },
                  { id: 'Bike', label: 'Himalayan Bike', icon: Bike },
                  { id: 'Taxi', label: 'Private Chauffeur', icon: Users },
                  { id: 'Bus', label: 'Scenic Bus', icon: Navigation }
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setTransportMode(mode.id)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        transportMode === mode.id 
                          ? 'bg-emerald-50 border-[#0f3d2e] text-[#0f3d2e] font-bold ring-1 ring-[#0f3d2e]' 
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-xs font-medium">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pace */}
            <div className="pt-4 border-t border-stone-100">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2 flex items-center gap-1.5">
                <Clock size={14} className="text-[#0f3d2e]" />
                Itinerary Pace
              </label>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                {['Relaxed', 'Balanced', 'Fast-Paced'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPace(p)}
                    className={`py-2 px-3 rounded-xl border transition-all ${
                      pace === p 
                        ? 'bg-[#0f3d2e] text-white border-[#0f3d2e]' 
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between pt-6 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-stone-600 hover:text-stone-900 font-bold text-xs flex items-center gap-1.5 py-2"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <button
                type="button"
                onClick={handleGenerateItinerary}
                disabled={isPlanning}
                className="bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-emerald-950/20 transition-all flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer disabled:opacity-75"
              >
                {isPlanning ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Crafting Day-by-Day Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} className="text-emerald-300" />
                    <span>Generate AI Itinerary</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* ── STEP 4: RESULT SCREEN (SCROLLABLE TIMELINE + BUDGET BREAKDOWN PIE) ── */}
        {currentStep === 4 && generatedItinerary && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Header Result */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0f3d2e] border border-emerald-200">
                    Itinerary Ready
                  </span>
                  <span className="text-xs font-semibold text-stone-500">
                    {generatedItinerary.duration} • {generatedItinerary.travelers} • {generatedItinerary.transport}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-stone-900">
                  {generatedItinerary.title}
                </h2>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw size={13} />
                  <span>Edit Preferences</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/checkout/trip/${generatedItinerary.tripId}`)}
                  className="px-5 py-2.5 rounded-xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Lock size={14} className="text-emerald-300" />
                  <span>Book via Escrow</span>
                </button>
              </div>
            </div>

            {/* 2-Column Result Layout: Left Timeline, Right Budget Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (7 Cols): Scrollable Day-by-Day Timeline */}
              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <Calendar size={18} className="text-[#0f3d2e]" />
                  <span>Daily Schedule & Mountain Route</span>
                </h3>

                <div className="space-y-4">
                  {generatedItinerary.dayPlans?.map((day, idx) => (
                    <div 
                      key={idx}
                      className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:border-stone-300 transition-all relative overflow-hidden"
                    >
                      {/* Day Header */}
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center font-black text-xs">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-stone-900 leading-tight">
                              Day {idx + 1}: {day.title || day.theme || `Explore ${day.where || 'Devbhoomi'}`}
                            </h4>
                            <span className="text-[11px] font-semibold text-stone-500">
                              📍 {day.where || 'Mountain Valley'} • {day.activities?.length || 2} Activities
                            </span>
                          </div>
                        </div>

                        {day.driveInfo && (
                          <span className="text-[11px] font-semibold bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md">
                            {day.driveInfo}
                          </span>
                        )}
                      </div>

                      {/* Day Activities Slots */}
                      <div className="space-y-3 text-xs">
                        <div className="flex items-start gap-3 bg-[#fdfbf7] p-3 rounded-xl border border-stone-100">
                          <Sun size={15} className="text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-stone-800 block text-xs font-bold">Morning Exploration</strong>
                            <p className="text-stone-600 text-[11px] mt-0.5">
                              {day.morningActivity || 'Scenic sunrise drive and temple darshan with mountain vista view.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 bg-[#fdfbf7] p-3 rounded-xl border border-stone-100">
                          <Sunset size={15} className="text-[#d97706] shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-stone-800 block text-xs font-bold">Afternoon Adventure & Cafe</strong>
                            <p className="text-stone-600 text-[11px] mt-0.5">
                              {day.afternoonActivity || 'Local valley trek or riverside cafe relaxation with local organic food.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 bg-[#fdfbf7] p-3 rounded-xl border border-stone-100">
                          <Moon size={15} className="text-indigo-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-stone-800 block text-xs font-bold">Overnight Stay</strong>
                            <p className="text-stone-600 text-[11px] mt-0.5">
                              {day.stay?.name || 'Verified Mountain Homestay / Eco Retreat (3-Layer Verified)'}
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column (5 Cols): Clean Budget Breakdown Card & Checkout CTA */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
                
                <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                    <h3 className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                      <Wallet size={16} className="text-[#0f3d2e]" />
                      <span>Budget Breakdown</span>
                    </h3>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Transparent
                    </span>
                  </div>

                  {/* Clean Visual Progress Distribution */}
                  <div className="space-y-3 text-xs text-stone-600">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>🏡 Stays ({Math.max(1, numDays - 1)} Nights)</span>
                        <strong className="text-stone-900">₹{liveBudgetBreakdown.stayTotal.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#0f3d2e] h-full" style={{ width: '45%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>🚗 Transport ({transportMode})</span>
                        <strong className="text-stone-900">₹{liveBudgetBreakdown.transportTotal.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full" style={{ width: '30%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>🍲 Food & Meals</span>
                        <strong className="text-stone-900">₹{liveBudgetBreakdown.foodTotal.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: '15%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>🎟️ Activities & Permits</span>
                        <strong className="text-stone-900">₹{liveBudgetBreakdown.actTotal.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: '10%' }} />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-sm font-bold text-stone-900">
                      <span>Total Estimated</span>
                      <span className="text-xl font-black text-[#0f3d2e]">
                        ₹{liveBudgetBreakdown.totalEstimated.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-500 text-right">
                      ~₹{liveBudgetBreakdown.perPersonCost.toLocaleString('en-IN')} per traveler
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    type="button"
                    onClick={() => navigate(`/checkout/trip/${generatedItinerary.tripId}`)}
                    className="w-full mt-6 bg-[#0f3d2e] hover:bg-[#144c3a] active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <Lock size={15} className="text-emerald-300" />
                    <span>Lock Itinerary in Escrow</span>
                  </button>

                  <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px] text-stone-500 text-center">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    <span>Protected by 4-Digit Handshake OTP Escrow</span>
                  </div>
                </div>

                {/* Direct link to Full Live Workspace */}
                <div className="bg-[#fdfbf7] p-4 rounded-2xl border border-stone-200 text-center">
                  <Link 
                    to={`/my-trip/${generatedItinerary.tripId}`}
                    className="text-xs font-bold text-[#0f3d2e] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Open in Full On-Trip Workspace Map</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
