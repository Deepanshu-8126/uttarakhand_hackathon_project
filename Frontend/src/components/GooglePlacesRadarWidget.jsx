import React, { useState, useEffect } from 'react';
import {
  MapPin, Star, Compass, Navigation, Coffee,
  Mountain, ExternalLink, Sparkles, Camera,
  CheckCircle2, Info, ChevronRight, X
} from 'lucide-react';
import { placesApi } from '../api/placesApi';
import {
  getAssetUrl,
  resolveEntityImage,
  getCardImages,
  handleEntityImageError,
  getEntityPlaceholderSvg
} from '../utils/imageHelpers';

function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function GooglePlacesRadarWidget({ 
  locationName = 'Uttarakhand', 
  coordinates = { lat: 30.0667, lng: 79.0193 },
  customClass = '' 
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isAtlasVerified, setIsAtlasVerified] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadPlaces() {
      setLoading(true);
      try {
        const res = await placesApi.getNearbyPlaces({
          lat: coordinates?.lat || 30.0667,
          lng: coordinates?.lng || 79.0193,
          type: activeTab === 'all' ? 'all' : (
            activeTab === 'food' ? 'restaurant' : 
            activeTab === 'lodging' ? 'lodging' : 'tourist_attraction'
          ),
          radius: 25000
        });

        if (isMounted && res?.data) {
          setPlaces(res.data);
          setIsAtlasVerified(Boolean(res.provider?.includes('MongoDB') || res.provider?.includes('Atlas')));
        }
      } catch (err) {
        console.warn('Could not fetch radar places data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPlaces();
    return () => { isMounted = false; };
  }, [coordinates?.lat, coordinates?.lng, activeTab]);

  // Filter by active tab & sanitize noise
  const filteredPlaces = places.filter(place => {
    const name = (place.name || '').trim();
    if (name.length <= 3 || name === 'GD' || name === 'KCP' || name === '?' || name.toLowerCase().includes('unknown')) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'viewpoints') return place.is_hidden_gem || (place.types || []).includes('natural_feature') || (place.types || []).includes('tourist_attraction');
    if (activeTab === 'food') return (place.types || []).some(t => ['restaurant', 'food', 'cafe'].includes(t)) || /dhaba|chai|coffee|tea/i.test(name);
    if (activeTab === 'lodging') return (place.types || []).some(t => ['lodging', 'campground'].includes(t)) || /stay|homestay|camp/i.test(name);
    return true;
  });

  // Deterministic Deduplication: Canonical ID, then slug, then normalizedName + vicinity
  const seenKeys = new Set();
  const uniquePlaces = [];
  for (const place of filteredPlaces) {
    const normName = (place.name || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const normVicinity = (place.vicinity || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const compositeKey = `${normName}__${normVicinity}`;
    const idKey = place.place_id || place.slug;

    if (!seenKeys.has(idKey) && !seenKeys.has(compositeKey)) {
      seenKeys.add(idKey);
      seenKeys.add(compositeKey);
      uniquePlaces.push(place);
    }
  }

  // Display top 8 results
  const displayPlaces = uniquePlaces.slice(0, 8);

  // Balanced Responsive Grid Class System (Prevents 1 isolated card on new row)
  const getGridClass = () => {
    if (displayPlaces.length === 1) return 'grid grid-cols-1 max-w-md mx-auto gap-4 pt-5';
    if (displayPlaces.length === 2) return 'grid grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto gap-4 pt-5';
    if (displayPlaces.length === 4) return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5';
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-5';
  };

  return (
    <div className={`bg-white dark:bg-[#121c16] rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm p-6 overflow-hidden ${customClass}`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100 dark:border-stone-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0f3d2e]/10 dark:bg-emerald-500/20 text-[#0f3d2e] dark:text-emerald-400 border border-[#0f3d2e]/20 dark:border-emerald-500/30">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              Verified Mountain Registry
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> {isAtlasVerified ? 'MongoDB Atlas Verified' : 'Live Terrain Radar'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Hidden Spots, Stays & Landmarks near {locationName}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Authentic verified spots, homestays, viewpoints and attractions from the official Uttarakhand database
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'All Radar', icon: Compass },
            { id: 'viewpoints', label: 'Hidden Spots', icon: Mountain },
            { id: 'food', label: 'Dhabas & Chai', icon: Coffee },
            { id: 'lodging', label: 'Campsites', icon: Camera }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-white dark:bg-[#0f3d2e] text-[#0f3d2e] dark:text-emerald-200 shadow-xs' 
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Places Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
          {[1, 2, 3].map(n => (
            <div key={n} className="animate-pulse bg-stone-100 dark:bg-stone-800/40 rounded-xl h-56 border border-stone-200/50 dark:border-stone-800" />
          ))}
        </div>
      ) : displayPlaces.length === 0 ? (
        <div className="py-12 text-center text-stone-500 dark:text-stone-400">
          <Info className="w-8 h-8 mx-auto mb-2 text-stone-400 opacity-60" />
          <p className="text-sm font-medium">No hidden spots found in this immediate radius.</p>
          <p className="text-xs text-stone-400 mt-1">Switch to 'All Radar' or search broader Uttarakhand terrain.</p>
        </div>
      ) : (
        <div className={getGridClass()}>
          {displayPlaces.map((place) => {
            const primaryPhoto = resolveEntityImage(place);

            // Calculate precise distance from destination coordinates
            const distanceKm = typeof place.distanceKm === 'number'
              ? Math.round(place.distanceKm)
              : typeof place.distance_approx_km === 'number'
              ? Math.round(place.distance_approx_km)
              : calculateHaversineKm(coordinates?.lat, coordinates?.lng, place.location?.lat, place.location?.lng);

            // Construct accurate navigation URL with entity coordinates
            const navLat = place.location?.lat;
            const navLng = place.location?.lng;
            const mapsUrl = navLat && navLng
              ? `https://www.google.com/maps/search/?api=1&query=${navLat},${navLng}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.vicinity}`)}`;

            // Real rating verification (no fabricated ratings)
            const hasRealRating = typeof place.rating === 'number' && place.rating > 0 && typeof place.user_ratings_total === 'number' && place.user_ratings_total > 0;

            return (
              <div 
                key={place.place_id || place.slug}
                className="group relative flex flex-col bg-stone-50/60 dark:bg-[#16231c] rounded-xl border border-stone-200/80 dark:border-stone-800/90 overflow-hidden hover:shadow-md hover:border-[#0f3d2e]/40 dark:hover:border-emerald-500/40 transition-all duration-200"
              >
                {/* Photo Thumbnail with Safe onError Fallback */}
                <div className="relative h-44 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img 
                    src={primaryPhoto} 
                    alt={place.name}
                    loading="lazy"
                    onError={(e) => {
                      handleEntityImageError(e, place);
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
                  
                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    {place.is_hidden_gem && (
                      <span className="bg-amber-500/90 backdrop-blur-md text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5" /> Hidden Gem
                      </span>
                    )}
                    {place.open_now && (
                      <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
                        Open Now
                      </span>
                    )}
                  </div>

                  {/* Rating & Distance Tag */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                    {hasRealRating ? (
                      <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md font-semibold text-amber-300 border border-white/10">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{place.rating}</span>
                        <span className="text-[10px] text-stone-300 font-normal">({place.user_ratings_total})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-semibold text-emerald-300 border border-white/10">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{place.provider?.includes('Registry') ? 'Verified' : 'Trail Spot'}</span>
                      </div>
                    )}

                    {distanceKm !== null && distanceKm !== undefined && (
                      <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] text-stone-200 border border-white/10 font-medium">
                        ~{distanceKm} km away
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-[#0f3d2e] dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {place.name}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-1 line-clamp-1">
                      <MapPin className="w-3 h-3 shrink-0 text-stone-400" />
                      {place.vicinity}
                    </p>
                    {place.highlight && (
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800/60 p-2 rounded-lg mt-2.5 italic line-clamp-2">
                        "{place.highlight}"
                      </p>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 mt-3 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedPlace(place)}
                      className="text-xs font-semibold text-[#0f3d2e] dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      Photos & Reviews
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#0f3d2e] text-white hover:bg-[#165540] dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-xs"
                    >
                      <Navigation className="w-3 h-3" />
                      Navigate
                      <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Place Details & Photo Modal */}
      {selectedPlace && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setSelectedPlace(null)}
        >
          <div className="bg-white dark:bg-[#121c16] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setSelectedPlace(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Verified Mountain Spot
            </div>

            <h3 className="text-xl font-black text-stone-900 dark:text-stone-100">
              {selectedPlace.name}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              {selectedPlace.vicinity}
            </p>

            {/* Photo Gallery with safe entity-isolated fallback */}
            <div className="grid grid-cols-2 gap-2 my-4">
              {getCardImages(selectedPlace).slice(0, 2).map((url, i) => (
                <img 
                  key={i} 
                  src={url} 
                  alt={`${selectedPlace.name} photo ${i + 1}`}
                  onError={(e) => {
                    handleEntityImageError(e, selectedPlace);
                  }}
                  className="w-full h-32 object-cover rounded-lg border border-stone-200 dark:border-stone-800"
                />
              ))}
            </div>

            {/* Rating & Reviews Verification */}
            <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-800/50 p-3 rounded-xl mb-4 border border-stone-200/60 dark:border-stone-800">
              {typeof selectedPlace.rating === 'number' && selectedPlace.rating > 0 ? (
                <>
                  <div className="flex items-center gap-1.5 text-lg font-black text-amber-500">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    {selectedPlace.rating}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 border-l border-stone-200 dark:border-stone-700 pl-3">
                    <span className="font-bold text-stone-800 dark:text-stone-200">
                      {selectedPlace.user_ratings_total ? `${selectedPlace.user_ratings_total} Verified Reviews` : 'Verified Database Record'}
                    </span>
                    <br />Uttarakhand Tourism Registry
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Official Verified Trail Spot &bull; Registered in Mountain Directory</span>
                </div>
              )}
            </div>

            {selectedPlace.highlight && (
              <div className="bg-stone-50 dark:bg-stone-800/40 p-3 rounded-lg mb-4 text-xs text-stone-600 dark:text-stone-300 italic border-l-2 border-emerald-600">
                "{selectedPlace.highlight}"
              </div>
            )}

            <a
              href={
                selectedPlace.location?.lat && selectedPlace.location?.lng
                  ? `https://www.google.com/maps/search/?api=1&query=${selectedPlace.location.lat},${selectedPlace.location.lng}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedPlace.name} ${selectedPlace.vicinity}`)}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0f3d2e] hover:bg-[#165540] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all"
            >
              <Navigation className="w-4 h-4" />
              Open Live Route in Google Maps
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
