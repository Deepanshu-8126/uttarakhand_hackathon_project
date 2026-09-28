import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Navigation, 
  Home, 
  Car, 
  Compass, 
  Users, 
  Sparkles, 
  RefreshCw, 
  Map, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  ChevronRight,
  AlertCircle,
  Crosshair,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPersonalizedHome, updateUserLocation } from '../../api/personalizedApi';
import { useMapStore } from '../../store/mapStore';

const POPULAR_TOWNS = [
  'Nainital',
  'Haldwani',
  'Dehradun',
  'Rishikesh',
  'Mussoorie',
  'Haridwar',
  'Almora',
  'Bhimtal',
  'Ramnagar',
  'Pithoragarh',
  'Uttarkashi',
  'Joshimath'
];

export default function PersonalizedNearYouSection() {
  const { currentUser, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('destinations');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [selectedTown, setSelectedTown] = useState('');
  const [isSavingPermanent, setIsSavingPermanent] = useState(false);

  // Active location context
  const activeLocation = useMemo(() => {
    if (selectedTown) {
      return { city: selectedTown };
    }
    if (currentUser?.location?.city || currentUser?.location?.district) {
      return currentUser.location;
    }
    return null;
  }, [selectedTown, currentUser]);

  // Fetch personalized items
  const fetchPersonalizedData = useCallback(async (refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedTown) {
        params.city = selectedTown;
      }
      if (refresh) {
        params.refresh = 'true';
      }

      const res = await getPersonalizedHome(params);
      if (res?.success) {
        setData(res);
      } else {
        setError(res?.message || 'Could not load nearby places');
      }
    } catch (err) {
      console.error('[PersonalizedNearYou] Fetch error:', err);
      setError('Nearby recommendations unavailable. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedTown]);

  useEffect(() => {
    fetchPersonalizedData();
  }, [fetchPersonalizedData]);

  // Handle browser GPS detection
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsDetectingGps(false);
        const { latitude, longitude } = pos.coords;
        try {
          setLoading(true);
          const res = await getPersonalizedHome({
            lat: latitude,
            lng: longitude,
            refresh: 'true'
          });
          if (res?.success) {
            setData(res);
            if (res.userLocation?.city) {
              setSelectedTown(res.userLocation.city);
            }
            setShowLocationPicker(false);
          }
        } catch (e) {
          setError('Could not resolve recommendations for GPS location.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setIsDetectingGps(false);
        console.warn('Geolocation denied or timed out:', err.message);
        alert('Could not access device location. Please select a city manually.');
      },
      { timeout: 8000 }
    );
  };

  // Switch city handler
  const handleSelectTown = async (town) => {
    setSelectedTown(town);
    setShowLocationPicker(false);

    // If user is authenticated, optionally persist or let them choose
    if (currentUser) {
      try {
        await updateUserLocation({ city: town });
        updateUser({
          location: {
            ...currentUser.location,
            city: town,
            district: town
          }
        });
      } catch (e) {
        console.warn('Could not auto-save location to user profile:', e.message);
      }
    }
  };

  const userCity = data?.userLocation?.city || activeLocation?.city || 'Your Area';
  const hasUserLocation = !!data?.userLocation;

  // Filter tabs with counts
  const tabCounts = useMemo(() => {
    if (!data) return { destinations: 0, stays: 0, rentals: 0, activities: 0, guides: 0, spiritual: 0 };
    return {
      destinations: (data.nearbyDestinations || []).length,
      stays: (data.nearbyStays || []).length,
      rentals: (data.nearbyRentals || []).length,
      activities: (data.nearbyActivities || []).length,
      guides: (data.nearbyGuides || []).length,
      spiritual: (data.nearbySpiritual || []).length,
    };
  }, [data]);

  // Tab configurations
  const TABS = [
    { id: 'destinations', label: 'Places to Visit', icon: Navigation, count: tabCounts.destinations },
    { id: 'stays', label: 'Nearby Stays', icon: Home, count: tabCounts.stays },
    { id: 'rentals', label: 'Vehicle Rentals', icon: Car, count: tabCounts.rentals },
    { id: 'activities', label: 'Activities & Treks', icon: Compass, count: tabCounts.activities },
    { id: 'guides', label: 'Local Guides', icon: Users, count: tabCounts.guides },
    { id: 'spiritual', label: 'Spiritual', icon: Sparkles, count: tabCounts.spiritual },
  ].filter(t => t.count > 0 || t.id === 'destinations');

  // Handle Add to Trip planner
  const handleAddToTrip = (item, type) => {
    useMapStore.getState().openAddToTripModal({
      id: item._id || item.id,
      name: item.name || item.title,
      type: type || 'destination',
      location: item.city || item.district || 'Uttarakhand',
      district: item.district || 'Uttarakhand',
      image: item.coverImage?.url || item.image?.url || item.images?.[0]?.url || '/assets/fallback.svg',
      rating: item.rating || 4.8
    });
  };

  return (
    <section className="pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full transition-all duration-300">
      
      {/* ── Banner for Guest users who have not set a town yet ── */}
      {!hasUserLocation && !loading && (
        <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-[#0f3d2e] to-stone-950 text-white shadow-xl border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <MapPin size={22} className="text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Personalize Your View
                </span>
                <span className="text-xs text-emerald-200/80 font-medium">Local Uttarakhand Radar</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                Want to see verified stays, rentals and treks near your town?
              </h3>
              <p className="text-xs text-stone-300">
                Select your base city to prioritize real nearby entities closest to you.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={handleDetectGps}
              disabled={isDetectingGps}
              className="py-2 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Crosshair size={14} className={isDetectingGps ? 'animate-spin' : 'text-emerald-400'} />
              <span>{isDetectingGps ? 'Detecting GPS...' : 'Use My GPS'}</span>
            </button>
            <button
              onClick={() => setShowLocationPicker(true)}
              className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <span>Choose City</span>
              <ArrowRight size={13} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}

      {/* ── Main Personalized Header (When Location is active) ── */}
      {hasUserLocation && (
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-200/80">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0f3d2e] text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                <span>Near You • Personalized Discovery</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
                <span>Explore Around</span>
                <span className="text-[#0f3d2e] underline decoration-emerald-400 decoration-wavy decoration-2">
                  {userCity}
                </span>
                {data?.userLocation?.district && data.userLocation.district !== userCity && (
                  <span className="text-sm font-semibold text-slate-500">
                    ({data.userLocation.district} District)
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Real database records ranked by geospatial proximity to your location. Verified mountain data only.
              </p>
            </div>

            {/* Location Switcher Trigger */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className="py-2 px-3 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 hover:text-[#0f3d2e] text-xs font-bold border border-stone-200 shadow-2xs hover:border-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Change discovery location"
              >
                <SlidersHorizontal size={13} className="text-emerald-700" />
                <span>Change Town ({userCity})</span>
              </button>

              <button
                type="button"
                onClick={() => fetchPersonalizedData(true)}
                disabled={loading}
                className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#0f3d2e] border border-stone-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer"
                title="Refresh nearby data"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-600' : ''} />
              </button>
            </div>
          </div>

          {/* ── Category Tabs ── */}
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#0f3d2e] text-white shadow-md shadow-emerald-950/10'
                      : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-emerald-300' : 'text-stone-500'} />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-emerald-400 text-emerald-950' : 'bg-stone-200 text-stone-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Content View ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-3xl overflow-hidden border border-stone-200/70 p-4 shadow-sm animate-pulse flex flex-col gap-3">
              <div className="h-44 w-full bg-stone-200 rounded-2xl" />
              <div className="h-4 bg-stone-200 rounded w-3/4" />
              <div className="h-3 bg-stone-200 rounded w-1/2" />
              <div className="h-8 bg-stone-200 rounded-xl mt-2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">Nearby recommendations unavailable</div>
              <div className="text-xs text-amber-800">{error}</div>
            </div>
          </div>
          <button
            onClick={() => fetchPersonalizedData(true)}
            className="py-1.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            Retry Nearby
          </button>
        </div>
      ) : hasUserLocation ? (
        <div>
          {/* 1. DESTINATIONS TAB */}
          {activeTab === 'destinations' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {(data?.nearbyDestinations || []).length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-slate-500 font-medium">
                  No destinations found within {userCity} radius. Explore wider Uttarakhand below.
                </div>
              ) : (
                data.nearbyDestinations.map((dest) => (
                  <div key={dest._id || dest.slug} className="bg-white rounded-3xl overflow-hidden border border-emerald-100 hover:border-emerald-400 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
                    <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                      <img
                        src={dest.coverImage?.url || dest.image?.url || dest.images?.[0]?.url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'}
                        alt={dest.name}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      {/* Genuine Distance Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-[#0f3d2e]/90 backdrop-blur-md text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-400/20 shadow-xs flex items-center gap-1">
                          <MapPin size={10} className="text-emerald-400" />
                          <span>{dest.distanceText || 'Nearby'}</span>
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="bg-white/95 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                          <Star size={11} className="text-amber-500 fill-amber-500" />
                          <span>{dest.rating || 4.8}</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          {dest.district || 'Himalayan District'}
                        </div>
                        <h3 className="text-base font-black text-slate-900 group-hover:text-[#0f3d2e] transition-colors line-clamp-1 mt-0.5">
                          {dest.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {dest.shortDescription || dest.description || 'Authentic Himalayan landmark in Uttarakhand.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                        <Link
                          to={`/destinations/${dest.slug}`}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0f3d2e] font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>Explore</span>
                          <ArrowRight size={12} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleAddToTrip(dest, 'destination')}
                          className="py-1.5 px-2.5 rounded-xl bg-[#0f3d2e] text-white hover:bg-[#144c3a] font-bold text-xs cursor-pointer active:scale-95"
                          title="Add to Itinerary"
                        >
                          + Trip
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 2. STAYS TAB */}
          {activeTab === 'stays' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {(data?.nearbyStays || []).length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-slate-500 font-medium">
                  No verified stays found within {userCity} proximity.
                </div>
              ) : (
                data.nearbyStays.map((stay) => {
                  const price = stay.price?.amount || stay.pricePerNight;
                  const isKMVN = stay.name?.includes('KMVN') || stay.name?.includes('GMVN') || stay.category?.includes('Government');
                  return (
                    <div key={stay._id || stay.slug} className="bg-white rounded-3xl overflow-hidden border border-emerald-100 hover:border-emerald-400 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
                      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                        <img
                          src={stay.images?.[0]?.url || stay.image?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                          alt={stay.name}
                          loading="lazy"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-[#0f3d2e]/90 backdrop-blur-md text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-400/20 shadow-xs flex items-center gap-1">
                            <MapPin size={10} className="text-emerald-400" />
                            <span>{stay.distanceText || 'Nearby'}</span>
                          </span>
                        </div>
                        {isKMVN && (
                          <div className="absolute bottom-3 left-3">
                            <span className="bg-emerald-950 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-emerald-400/30">
                              Verified Govt TRH
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                            {stay.city || stay.district || 'Himalayan Stay'}
                          </div>
                          <h3 className="text-base font-black text-slate-900 group-hover:text-[#0f3d2e] transition-colors line-clamp-1 mt-0.5">
                            {stay.name}
                          </h3>
                          <div className="text-xs font-bold text-emerald-900 mt-1">
                            {price ? `₹${price} / night` : 'Price on request'}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                          <Link
                            to={`/stays/${stay.slug || stay._id}`}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0f3d2e] font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                          >
                            <span>View Stay</span>
                            <ArrowRight size={12} />
                          </Link>
                          <Link
                            to={`/checkout/stay/${stay._id}`}
                            className="py-1.5 px-3 rounded-xl bg-[#0f3d2e] text-white hover:bg-[#144c3a] font-bold text-xs"
                          >
                            Book
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 3. RENTALS TAB */}
          {activeTab === 'rentals' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {(data?.nearbyRentals || []).length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-slate-500 font-medium">
                  No vehicle rental fleets found within {userCity} proximity.
                </div>
              ) : (
                data.nearbyRentals.map((rental) => {
                  const vehiclesCount = rental.vehicles?.length || 0;
                  return (
                    <div key={rental._id || rental.slug} className="bg-white rounded-3xl overflow-hidden border border-emerald-100 hover:border-emerald-400 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
                      <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                        <img
                          src={rental.images?.[0]?.url || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'}
                          alt={rental.name}
                          loading="lazy"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-[#0f3d2e]/90 backdrop-blur-md text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-400/20 shadow-xs flex items-center gap-1">
                            <MapPin size={10} className="text-emerald-400" />
                            <span>{rental.distanceText || 'Nearby'}</span>
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                            {rental.city || rental.district || 'Himalayan Fleet'}
                          </div>
                          <h3 className="text-base font-black text-slate-900 group-hover:text-[#0f3d2e] transition-colors line-clamp-1 mt-0.5">
                            {rental.name}
                          </h3>
                          <div className="text-xs text-slate-600 font-medium mt-1">
                            {vehiclesCount > 0 ? `${vehiclesCount} vehicles available (Bikes & SUVs)` : 'Bikes & Himalayan 450s'}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-100">
                          <Link
                            to="/rentals"
                            className="w-full py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0f3d2e] font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                          >
                            <span>Browse Fleet</span>
                            <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 4. ACTIVITIES TAB */}
          {activeTab === 'activities' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {(data?.nearbyActivities || []).length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-slate-500 font-medium">
                  No activities cataloged within {userCity} proximity yet.
                </div>
              ) : (
                data.nearbyActivities.map((act) => (
                  <div key={act._id || act.slug} className="bg-white rounded-3xl overflow-hidden border border-emerald-100 hover:border-emerald-400 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
                    <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                      <img
                        src={act.coverImage?.url || act.images?.[0]?.url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}
                        alt={act.name}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-[#0f3d2e]/90 backdrop-blur-md text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-400/20 shadow-xs flex items-center gap-1">
                          <MapPin size={10} className="text-emerald-400" />
                          <span>{act.distanceText || 'Nearby'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          {act.category || 'Adventure'}
                        </div>
                        <h3 className="text-base font-black text-slate-900 group-hover:text-[#0f3d2e] transition-colors line-clamp-1 mt-0.5">
                          {act.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {act.shortDescription || act.description || 'Himalayan outdoor experience.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                        <Link
                          to={`/activities/${act.slug || act._id}`}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0f3d2e] font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>Details</span>
                          <ArrowRight size={12} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleAddToTrip(act, 'activity')}
                          className="py-1.5 px-2.5 rounded-xl bg-[#0f3d2e] text-white hover:bg-[#144c3a] font-bold text-xs cursor-pointer active:scale-95"
                          title="Add to Itinerary"
                        >
                          + Trip
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 5. GUIDES TAB */}
          {activeTab === 'guides' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {(data?.nearbyGuides || []).length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-slate-500 font-medium">
                  No local guides listed for {userCity} yet.
                </div>
              ) : (
                data.nearbyGuides.map((guide) => (
                  <div key={guide._id || guide.slug} className="bg-white rounded-3xl overflow-hidden border border-emerald-100 hover:border-emerald-400 shadow-sm hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0f3d2e] font-black text-lg flex items-center justify-center shrink-0 border border-emerald-200">
                        {guide.name?.charAt(0) || 'G'}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{guide.name}</h3>
                        <div className="text-[11px] text-emerald-800 font-semibold">{guide.distanceText || 'Local Guide'}</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                      {guide.specialties && guide.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {guide.specialties.slice(0, 2).map((s, idx) => (
                            <span key={idx} className="bg-stone-100 text-stone-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500 truncate">
                        Languages: {(guide.languages || ['Hindi', 'English']).join(', ')}
                      </div>
                    </div>

                    <Link
                      to={`/guides/${guide.slug || guide._id}`}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0f3d2e] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
                    >
                      <ShieldCheck size={13} className="text-emerald-700" />
                      <span>Contact Guide</span>
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 6. SPIRITUAL TAB */}
          {activeTab === 'spiritual' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {(data?.nearbySpiritual || []).length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-slate-500 font-medium">
                  No sacred shrines cataloged near {userCity}.
                </div>
              ) : (
                data.nearbySpiritual.map((spirit) => (
                  <div key={spirit._id || spirit.slug} className="bg-white rounded-3xl overflow-hidden border border-emerald-100 hover:border-emerald-400 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
                    <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                      <img
                        src={spirit.coverImage?.url || spirit.images?.[0]?.url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'}
                        alt={spirit.name}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-[#0f3d2e]/90 backdrop-blur-md text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-400/20 shadow-xs flex items-center gap-1">
                          <MapPin size={10} className="text-emerald-400" />
                          <span>{spirit.distanceText || 'Nearby'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                          Sacred Shrine • {spirit.district}
                        </div>
                        <h3 className="text-base font-black text-slate-900 group-hover:text-[#0f3d2e] transition-colors line-clamp-1 mt-0.5">
                          {spirit.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {spirit.shortDescription || spirit.description || 'Revered Devbhoomi temple.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                        <Link
                          to={`/spiritual/${spirit.slug || spirit._id}`}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0f3d2e] font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>Explore Shrine</span>
                          <ArrowRight size={12} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleAddToTrip(spirit, 'spiritual')}
                          className="py-1.5 px-2.5 rounded-xl bg-[#0f3d2e] text-white hover:bg-[#144c3a] font-bold text-xs cursor-pointer active:scale-95"
                          title="Add to Itinerary"
                        >
                          + Trip
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* ── Location Switcher Modal ── */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[#0f3d2e]" />
                <h3 className="font-black text-lg text-slate-900">Select Your Location</h3>
              </div>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Personalize Discovery Uttarakhand for your town or travel origin. All recommendations update in real time.
            </p>

            <button
              onClick={handleDetectGps}
              disabled={isDetectingGps}
              className="py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#0f3d2e] text-xs font-bold border border-emerald-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Crosshair size={15} className={isDetectingGps ? 'animate-spin' : ''} />
              <span>{isDetectingGps ? 'Detecting device GPS...' : 'Use My Exact Device GPS'}</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-stone-400 bg-white px-2">
                <span>Or select a Uttarakhand hub</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {POPULAR_TOWNS.map((town) => {
                const isSelected = (selectedTown || userCity).toLowerCase() === town.toLowerCase();
                return (
                  <button
                    key={town}
                    type="button"
                    onClick={() => handleSelectTown(town)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#0f3d2e] text-white border-[#0f3d2e]'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>{town}</span>
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
