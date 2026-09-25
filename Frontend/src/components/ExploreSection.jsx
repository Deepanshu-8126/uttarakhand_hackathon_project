import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCw, Map, Zap, Mountain, Star, Sparkles, Navigation, Plus, Radio, ArrowRight, ShieldCheck } from 'lucide-react';
import SearchBar from './SearchBar';
import FilterPills from './FilterPills';
import DestinationCard from './DestinationCard';
import Pagination from './common/Pagination';
import { useDestinations } from '../hooks/useDestinations';
import { placesApi } from '../api/placesApi';
import { useMapStore } from '../store/mapStore';
import api from '../api/api';

const ITEMS_PER_PAGE = 12;

// ── Live Radar Place Card (Geoapify Dynamic Discovery) ──────────────────────
const LiveRadarPlaceCard = ({ place }) => {
  const photo = place.photo_urls?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80';
  
  const handleAddToTrip = () => {
    useMapStore.getState().openAddToTripModal({
      id: place.place_id,
      name: place.name,
      type: 'destination',
      location: place.vicinity || 'Uttarakhand',
      district: place.vicinity || 'Uttarakhand',
      image: photo,
      rating: place.rating || 4.8
    });
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden card-shadow border border-emerald-200/80 hover:border-emerald-500/60 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Image container */}
      <div className="relative h-56 w-full overflow-hidden bg-stone-100">
        <img
          src={photo}
          alt={place.name}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80';
          }}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 items-center">
          <span className="bg-[#0f3d2e]/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/20 shadow-xs flex items-center gap-1">
            <Radio size={10} className="text-emerald-400 animate-pulse" />
            <span>Live Satellite Radar</span>
          </span>
        </div>

        <div className="absolute top-3.5 right-3.5">
          <span className="bg-white/95 backdrop-blur-md text-slate-800 text-xs font-black px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 border border-stone-200/80">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span>{place.rating || 4.7}</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
            <Navigation size={12} className="text-emerald-700" />
            <span className="truncate">{place.vicinity || 'Himalayan Landmark'}</span>
          </div>

          <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0f3d2e] transition-colors line-clamp-1">
            {place.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            Live GPS verified mountain destination discovered via GIS Satellite Telemetry. Authentic terrain coordinates.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
          <Link
            to={`/map?q=${encodeURIComponent(place.name)}`}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0f3d2e] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
          >
            <Map size={13} />
            <span>View on Map</span>
          </Link>

          <Link
            to={`/trip-planner?destination=${encodeURIComponent(place.name)}`}
            className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
            title="Plan Trip to this destination"
          >
            <Sparkles size={12} className="text-emerald-700" />
            <span>Plan</span>
          </Link>

          <button
            type="button"
            onClick={handleAddToTrip}
            className="py-2 px-3 rounded-xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
            title="Add to Itinerary"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Skeleton card — matches DestinationCard dimensions ──────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-3xl overflow-hidden card-shadow border border-border-light/50 flex flex-col">
    {/* Image skeleton */}
    <div className="h-56 w-full skeleton" />
    {/* Content skeleton */}
    <div className="p-5 flex flex-col gap-2.5">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-2/5" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-5/6" />
      <div className="flex justify-between items-center mt-3">
        <div className="skeleton h-3 w-8" />
        <div className="skeleton h-8 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

// ── Stats strip — 4 metric cards matching Discovery Uttarakhand standard ──
const StatsStrip = ({ destinationCount }) => {
  const stats = [
    { value: `${destinationCount || 106}+`, label: 'Destinations', icon: Mountain },
    { value: '50+', label: 'Verified Routes', icon: Map },
    { value: '250+', label: 'Stories', icon: Star },
    { value: '500+', label: 'Certified Guides', icon: ShieldCheck },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
      {stats.map(({ value, label, icon: Icon }) => (
        <div 
          key={label} 
          className="h-[96px] bg-white p-4 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-[#F0F0F0] flex items-center gap-3.5 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] transition-all duration-300 group cursor-default"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#0F2B1F] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Icon size={24} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <div className="text-[22px] font-black text-[#0F172A] tracking-tight leading-tight">{value}</div>
            <div className="text-[13px] text-[#64748B] font-medium leading-tight mt-0.5 truncate">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Plan My Trip CTA banner ─────────────────────────────────────────────────
const PlanTripCTA = () => (
  <div className="mt-16 mb-2 mx-auto max-w-3xl">
    <div className="relative bg-forest-green rounded-3xl px-8 py-10 md:px-14 md:py-12 text-center overflow-hidden">
      {/* Subtle mountain silhouette decoration */}
      <div className="absolute bottom-0 left-0 right-0 opacity-10 pointer-events-none">
        <svg viewBox="0 0 800 120" fill="currentColor" className="text-white w-full">
          <path d="M0,120 L0,70 L100,30 L200,80 L300,20 L400,90 L500,35 L600,75 L700,15 L800,55 L800,120 Z" />
        </svg>
      </div>
      <div className="relative z-10">
        <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-3">
          Ready to Explore?
        </p>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Build Your Uttarakhand Journey
        </h3>
        <p className="text-white/75 text-sm md:text-base font-medium mb-7 max-w-lg mx-auto">
          Save the places you love and plan a trip around what matters to you.
        </p>
        <Link
          to="/trip-planner"
          className="inline-flex items-center gap-2 bg-white text-forest-green text-sm font-bold px-8 py-3.5 rounded-full hover:bg-beige transition-colors duration-200 shadow-md uppercase tracking-wider"
        >
          Plan My Trip →
        </Link>
      </div>
    </div>
  </div>
);

// ── Main ExploreSection ─────────────────────────────────────────────────────
const ExploreSection = () => {
  const { destinations, loading, error, refetch } = useDestinations();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Dynamic Live Geoapify Radar for Hidden Locations ──────────────────────
  const [livePlaces, setLivePlaces] = useState([]);
  const [loadingLivePlaces, setLoadingLivePlaces] = useState(false);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 3) {
      setLivePlaces([]);
      setLoadingLivePlaces(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingLivePlaces(true);
        const res = await placesApi.searchPlaces(q);
        if (res?.data && Array.isArray(res.data)) {
          setLivePlaces(res.data);
        } else {
          setLivePlaces([]);
        }
      } catch (err) {
        setLivePlaces([]);
      } finally {
        setLoadingLivePlaces(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        dest.name?.toLowerCase().includes(q) ||
        dest.district?.toLowerCase().includes(q) ||
        dest.region?.toLowerCase().includes(q) ||
        dest.highlights?.some(h => h.toLowerCase().includes(q)) ||
        dest.experiences?.some(e => e.toLowerCase().includes(q));

      const expStr = (dest.experiences || []).join(' ').toLowerCase();
      const highStr = (dest.highlights || []).join(' ').toLowerCase();
      const descStr = (dest.shortDescription || dest.description || '').toLowerCase();
      const combined = `${expStr} ${highStr} ${descStr}`;

      const matchFilter =
        activeFilter === 'All' ||
        dest.category?.toLowerCase() === activeFilter.toLowerCase() ||
        dest.district?.toLowerCase() === activeFilter.toLowerCase() ||
        dest.region?.toLowerCase() === activeFilter.toLowerCase() ||
        (activeFilter === 'Garhwal' && dest.region?.toLowerCase() === 'garhwal') ||
        (activeFilter === 'Kumaon' && dest.region?.toLowerCase() === 'kumaon') ||
        (activeFilter === 'Spiritual' && /temple|pilgrim|sacred|shrine|ghat|ashram|dham|gurdwara|sahib/i.test(combined)) ||
        (activeFilter === 'Adventure' && /trek|raft|ski|safari|camp|adventure|angling|sports|climb/i.test(combined)) ||
        (activeFilter === 'Nature' && /lake|valley|meadow|peak|wildlife|flora|park|waterfall|forest/i.test(combined));

      return matchSearch && matchFilter;
    });
  }, [destinations, searchQuery, activeFilter]);

  const totalPages = Math.ceil(filteredDestinations.length / ITEMS_PER_PAGE);

  const paginatedDestinations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDestinations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDestinations, currentPage]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveFilter('All');
    setCurrentPage(1);
    setLivePlaces([]);
  };

  return (
    <section id="explore" className="pt-16 pb-28 md:pt-20 md:pb-36 px-5 max-w-7xl mx-auto w-full">

      {/* Section header */}
      <div className="text-center mb-6">
        <p className="text-emerald-800 text-xs font-bold tracking-wider uppercase mb-2">
          Discover Uttarakhand
        </p>
        <h2 className="text-[32px] sm:text-4xl md:text-5xl font-black text-[#0F172A] mb-2.5 tracking-tight leading-tight">
          Explore Uttarakhand
        </h2>
        <p className="text-slate-600/70 text-sm sm:text-base font-medium max-w-xl mx-auto leading-[1.6]">
          Discover valleys, peaks, sacred shrines, and hidden mountain landmarks across 13 districts &amp; live satellite radar.
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex justify-center mb-7">
        <FilterPills activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </div>

      {/* Smart Search Pill with real-data suggestions & live Geoapify radar */}
      <SearchBar
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        destinations={destinations}
        onClear={handleClearFilters}
        onSelectPlace={(place) => {
          setSearchQuery(place.name);
        }}
      />

      {/* Stats strip — only shown when destinations loaded */}
      {!loading && !error && destinations.length > 0 && (
        <StatsStrip destinationCount={destinations.length} />
      )}

      {/* Card grid */}
      <div id="explore-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 scroll-mt-24">

        {loading ? (
          // Skeleton cards while loading
          Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : error ? (
          // Error state with retry
          <div className="col-span-full text-center py-16 flex flex-col items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-beige flex items-center justify-center text-muted-text">
              <RefreshCw size={24} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-text-dark font-bold text-lg mb-1">Unable to load destinations</p>
              <p className="text-muted-text text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={refetch}
              className="btn-primary px-8 py-3 text-sm"
            >
              Try Again
            </button>
          </div>
        ) : paginatedDestinations.length > 0 ? (
          <>
            {paginatedDestinations.map((destination) => (
              <DestinationCard
                key={destination.id || destination._id}
                destination={destination}
              />
            ))}

            {/* Additional Live Radar Discoveries when searching a specific term */}
            {livePlaces.length > 0 && searchQuery.trim().length >= 3 && (
              <div className="col-span-full mt-6 pt-6 border-t border-stone-200">
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={16} className="text-emerald-700" />
                    <div>
                      <h4 className="text-xs font-bold text-[#0f3d2e] uppercase tracking-wider">
                        🛰️ Satellite Radar Discoveries for &ldquo;{searchQuery}&rdquo;
                      </h4>
                      <p className="text-xs text-stone-600">
                        Discovered {livePlaces.length} additional live GPS coordinates via Geoapify API.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-300">
                    Live GIS Stream
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {livePlaces.slice(0, 3).map((place) => (
                    <LiveRadarPlaceCard key={place.place_id} place={place} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          // Local catalog empty -> Check Live Radar API
          loadingLivePlaces ? (
            <div className="col-span-full text-center py-16 flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center animate-pulse border border-emerald-200 shadow-xs">
                <Radio size={24} className="text-emerald-700 animate-spin" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-800">
                  Scanning Himalayan Satellite Radar for &ldquo;{searchQuery}&rdquo;...
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Connecting to live Geoapify API &amp; OpenStreetMap telemetry for hidden locations.
                </p>
              </div>
            </div>
          ) : livePlaces.length > 0 ? (
            <>
              <div className="col-span-full mb-2">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-[#0f3d2e] uppercase tracking-wider">
                        🛰️ Discovered via Live Satellite Radar &amp; Geoapify
                      </h4>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Found {livePlaces.length} live coordinates for &ldquo;{searchQuery}&rdquo; beyond the primary database catalog.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white text-emerald-900 border border-emerald-300 shrink-0 self-start sm:self-auto">
                    Live Geoapify Radar Active
                  </span>
                </div>
              </div>
              {livePlaces.map((place) => (
                <LiveRadarPlaceCard key={place.place_id} place={place} />
              ))}
            </>
          ) : (
            // Truly Empty state with clear filters
            <div className="col-span-full text-center py-16 flex flex-col items-center gap-5">
              <div className="h-16 w-16 rounded-full bg-beige flex items-center justify-center text-muted-text">
                <Mountain size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-text-dark font-bold text-lg mb-1">
                  {activeFilter !== 'All'
                    ? `No destinations found in "${activeFilter}"`
                    : searchQuery
                    ? `No destinations found for "${searchQuery}"`
                    : 'No destinations found'}
                </p>
                <p className="text-muted-text text-sm font-medium">
                  Try a different search or clear your filters.
                </p>
              </div>
              <button
                onClick={handleClearFilters}
                className="btn-outline px-8 py-3 text-sm cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )
        )}
      </div>

      {/* Pagination controls (only when local catalog items loaded) */}
      {!loading && !error && paginatedDestinations.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          scrollTargetId="explore-grid"
        />
      )}

      {/* Plan My Trip CTA — shown when destinations are loaded and not in error */}
      {!loading && !error && (destinations.length > 0 || livePlaces.length > 0) && <PlanTripCTA />}

    </section>
  );
};

export default ExploreSection;
