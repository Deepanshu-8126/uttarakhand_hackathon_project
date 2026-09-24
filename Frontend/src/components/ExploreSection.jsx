import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Map, Zap, Mountain, Star } from 'lucide-react';
import SearchBar from './SearchBar';
import FilterPills from './FilterPills';
import DestinationCard from './DestinationCard';
import Pagination from './common/Pagination';
import { useDestinations } from '../hooks/useDestinations';
import api from '../api/api';

const ITEMS_PER_PAGE = 12;

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
    { value: `${destinationCount || 100}+`, label: 'Destinations', icon: Mountain },
    { value: '50+', label: 'Verified Routes', icon: Map },
    { value: '250+', label: 'Stays & Camps', icon: Star },
    { value: '500+', label: 'Certified Guides', icon: Zap },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      {stats.map(({ value, label, icon: Icon }) => (
        <div key={label} className="bg-white p-4 rounded-2xl border border-stone-200/80 flex items-center space-x-3.5 shadow-sm hover:border-emerald-500/30 transition-all">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <Icon size={20} />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 tracking-tight">{value}</div>
            <div className="text-xs text-slate-500 font-medium">{label}</div>
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
        (activeFilter === 'Spiritual' && /temple|pilgrim|sacred|shrine|ghat|ashram|dham/i.test(combined)) ||
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
  };

  return (
    <section id="explore" className="pt-20 pb-28 md:pt-24 md:pb-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

      {/* Section header */}
      <div className="text-center mb-8">
        <p className="text-forest-green text-xs font-bold uppercase tracking-widest mb-2.5">
          Discover Uttarakhand
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-text-dark mb-3 tracking-tight">
          Explore Uttarakhand
        </h2>
        <p className="text-muted-text text-base md:text-lg font-medium max-w-2xl mx-auto">
          Discover valleys, peaks, sacred shrines and quiet mountain homestays across 13 districts.
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex justify-center mb-4">
        <FilterPills activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </div>

      {/* Smart Search Pill with real-data suggestions & date/group selectors */}
      <SearchBar
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        destinations={destinations}
        onClear={handleClearFilters}
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
          paginatedDestinations.map((destination) => (
            <DestinationCard
              key={destination.id || destination._id}
              destination={destination}
            />
          ))
        ) : (
          // Empty state with clear filters
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
              className="btn-outline px-8 py-3 text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {!loading && !error && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          scrollTargetId="explore-grid"
        />
      )}

      {/* Plan My Trip CTA — shown when destinations are loaded and not in error */}
      {!loading && !error && destinations.length > 0 && <PlanTripCTA />}

    </section>
  );
};

export default ExploreSection;
