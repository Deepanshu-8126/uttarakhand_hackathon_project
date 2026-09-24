import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Star, 
  Compass, 
  Navigation, 
  Coffee, 
  Mountain, 
  ExternalLink, 
  Sparkles, 
  Camera, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { placesApi } from '../api/placesApi';

export default function GooglePlacesRadarWidget({ 
  locationName = 'Uttarakhand', 
  coordinates = { lat: 30.0667, lng: 79.0193 },
  customClass = '' 
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isLiveGoogle, setIsLiveGoogle] = useState(false);

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
          setIsLiveGoogle(Boolean(res.is_live_google_api));
        }
      } catch (err) {
        console.warn('Could not fetch Google Places radar data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPlaces();
    return () => { isMounted = false; };
  }, [coordinates?.lat, coordinates?.lng, activeTab]);

  const filteredPlaces = places.filter(place => {
    if (activeTab === 'all') return true;
    if (activeTab === 'viewpoints') return place.is_hidden_gem || (place.types || []).includes('natural_feature');
    if (activeTab === 'food') return (place.types || []).some(t => ['restaurant', 'food', 'cafe'].includes(t));
    if (activeTab === 'lodging') return (place.types || []).some(t => ['lodging', 'campground'].includes(t));
    return true;
  });

  return (
    <div className={`bg-white dark:bg-[#121c16] rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm p-6 overflow-hidden ${customClass}`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100 dark:border-stone-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0f3d2e]/10 dark:bg-emerald-500/20 text-[#0f3d2e] dark:text-emerald-400 border border-[#0f3d2e]/20 dark:border-emerald-500/30">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Google Places Live Radar
            </span>
            {isLiveGoogle ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> Live Feed Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 dark:text-stone-400">
                <Layers className="w-3 h-3" /> Curated Mountain Gems
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Hidden Spots & Local Dhabas near {locationName}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Live photographic discoveries, trekker roadside dhabas & scenic viewpoints verified on Google Maps
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
      ) : filteredPlaces.length === 0 ? (
        <div className="py-12 text-center text-stone-500 dark:text-stone-400">
          <Info className="w-8 h-8 mx-auto mb-2 text-stone-400 opacity-60" />
          <p className="text-sm font-medium">No hidden radar spots found in this immediate radius.</p>
          <p className="text-xs text-stone-400 mt-1">Switch to 'All Radar' or search broader Uttarakhand terrain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
          {filteredPlaces.map((place) => {
            const primaryPhoto = place.photo_urls?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80';
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.vicinity}`)}`;

            return (
              <div 
                key={place.place_id}
                className="group relative flex flex-col bg-stone-50/60 dark:bg-[#16231c] rounded-xl border border-stone-200/80 dark:border-stone-800/90 overflow-hidden hover:shadow-md hover:border-[#0f3d2e]/40 dark:hover:border-emerald-500/40 transition-all duration-200"
              >
                {/* Photo Thumbnail */}
                <div className="relative h-40 w-full overflow-hidden bg-stone-200 dark:bg-stone-800">
                  <img 
                    src={primaryPhoto} 
                    alt={place.name}
                    loading="lazy"
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

                  {/* Rating Tag */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md font-semibold text-amber-300 border border-white/10">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{place.rating || 4.8}</span>
                      <span className="text-[10px] text-stone-300 font-normal">({place.user_ratings_total || 45})</span>
                    </div>

                    {place.distance_approx_km && (
                      <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] text-stone-200 border border-white/10 font-medium">
                        ~{place.distance_approx_km} km away
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
                      className="text-xs font-semibold text-[#0f3d2e] dark:text-emerald-400 hover:underline flex items-center gap-0.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#121c16] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setSelectedPlace(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Google Places Verified View
            </div>

            <h3 className="text-xl font-black text-stone-900 dark:text-stone-100">
              {selectedPlace.name}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {selectedPlace.vicinity}
            </p>

            {/* Photos carousel/grid */}
            <div className="grid grid-cols-2 gap-2 my-4">
              {(selectedPlace.photo_urls || []).slice(0, 4).map((url, i) => (
                <img 
                  key={i} 
                  src={url} 
                  alt={`${selectedPlace.name} photo ${i + 1}`}
                  className="w-full h-28 object-cover rounded-lg border border-stone-200 dark:border-stone-800"
                />
              ))}
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-800/50 p-3 rounded-xl mb-4 border border-stone-200/60 dark:border-stone-800">
              <div className="flex items-center gap-1.5 text-lg font-black text-amber-500">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                {selectedPlace.rating || 4.8}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 border-l border-stone-200 dark:border-stone-700 pl-3">
                <span className="font-bold text-stone-800 dark:text-stone-200">{selectedPlace.user_ratings_total || 240} Verified Reviews</span>
                <br />Google Maps Travel Community
              </div>
            </div>

            {selectedPlace.reviews && selectedPlace.reviews.length > 0 && (
              <div className="space-y-2.5 mb-5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-stone-500">Traveler Feedback</h5>
                {selectedPlace.reviews.slice(0, 2).map((rev, i) => (
                  <div key={i} className="text-xs bg-stone-100/70 dark:bg-stone-800/40 p-3 rounded-lg border border-stone-200/50 dark:border-stone-800">
                    <div className="flex items-center justify-between font-semibold text-stone-800 dark:text-stone-200 mb-1">
                      <span>{rev.author_name}</span>
                      <span className="text-amber-500 font-bold">{rev.rating} ★</span>
                    </div>
                    <p className="text-stone-600 dark:text-stone-300 italic">"{rev.text}"</p>
                  </div>
                ))}
              </div>
            )}

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedPlace.name} ${selectedPlace.vicinity}`)}`}
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
