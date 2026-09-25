import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Compass, 
  Search, 
  MapPin, 
  Calendar, 
  Mountain, 
  Clock, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useActivities } from '../hooks/useActivities';
import { useMapStore } from '../store/mapStore';
import { getCardImages } from '../utils/imageHelpers';

const ITEMS_PER_PAGE = 6;

export default function Activities() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const regionParam = searchParams.get('region') || searchParams.get('location') || searchParams.get('destination') || searchParams.get('q');

  const { activities, loading, error, refetch } = useActivities();
  const { openAddToTripModal } = useMapStore();

  // Search & Filter State
  const [searchKeyword, setSearchKeyword] = useState(regionParam || '');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedSeason, setSelectedSeason] = useState('Any Season');
  const [sortBy, setSortBy] = useState('Recommended Matches');
  const [currentPage, setCurrentPage] = useState(1);

  // Active filter pills state
  const [activeFilters, setActiveFilters] = useState([
    { id: 'region', label: 'Region: Garhwal & Kumaon' },
    { id: 'altitude', label: 'Altitude: High Altitude (>3500m)' },
    { id: 'type', label: 'Type: Fully Guided' }
  ]);

  // Dynamically extract distinct regions/districts from database activities
  const regions = useMemo(() => {
    const set = new Set();
    activities.forEach(a => {
      if (a.district) set.add(a.district);
      if (a.region) set.add(a.region);
    });
    return ['All Regions', ...Array.from(set).sort()];
  }, [activities]);

  const removeFilter = (filterId) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchKeyword('');
    setSelectedRegion('All Regions');
    setSelectedSeason('Any Season');
    setCurrentPage(1);
  };

  // Sync region/location URL parameter
  useEffect(() => {
    if (regionParam) {
      setSearchKeyword(regionParam);
      const matched = regions.find(r => r.toLowerCase().includes(regionParam.toLowerCase()));
      if (matched) {
        setSelectedRegion(matched);
      }
    }
  }, [regionParam, regions]);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, selectedRegion, selectedSeason, sortBy]);

  // Filter and sort real database activities
  const filteredActivities = useMemo(() => {
    return activities.filter(item => {
      const q = searchKeyword.toLowerCase().trim();
      const name = (item.name || '').toLowerCase();
      const region = (item.region || '').toLowerCase();
      const district = (item.district || '').toLowerCase();
      const desc = (item.shortDescription || item.description || '').toLowerCase();

      const matchKeyword = !q || name.includes(q) || region.includes(q) || district.includes(q) || desc.includes(q);

      const matchRegion = selectedRegion === 'All Regions' ||
        district.includes(selectedRegion.toLowerCase()) ||
        region.includes(selectedRegion.toLowerCase());

      const bestTime = (item.bestTimeToVisit || '').toLowerCase();
      const matchSeason = selectedSeason === 'Any Season' ||
        bestTime.includes(selectedSeason.split(' ')[0].toLowerCase());

      return matchKeyword && matchRegion && matchSeason;
    }).sort((a, b) => {
      if (sortBy === 'Price: Low to High') {
        const pA = a.budgetLevel === 'Luxury' ? 18500 : a.budgetLevel === 'Mid-range' ? 12400 : 9500;
        const pB = b.budgetLevel === 'Luxury' ? 18500 : b.budgetLevel === 'Mid-range' ? 12400 : 9500;
        return pA - pB;
      }
      if (sortBy === 'Duration: Shortest') {
        return (a.idealDuration || '').localeCompare(b.idealDuration || '');
      }
      return 0; // Default: Recommended
    });
  }, [activities, searchKeyword, selectedRegion, selectedSeason, sortBy]);

  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = filteredActivities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-grow flex flex-col pb-28 md:pb-36">
        
        {/* ── Top Section: Filter Header & Search Bar ─────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold tracking-widest uppercase mb-2">
                <Compass size={16} className="text-emerald-600" />
                <span>Expedition Explorer</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                Filtered Himalayan Treks & Adventures
              </h1>
              <p className="text-slate-600 text-sm mt-1.5 max-w-xl leading-relaxed">
                Showing curated trails and expeditions matching your criteria across Garhwal & Kumaon ranges from our verified database.
              </p>
            </div>

            {/* Sorting Options Dropdown */}
            <div className="flex items-center gap-3 self-start md:self-auto">
              <span className="text-xs text-slate-500 font-semibold">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-stone-200 text-slate-800 text-xs font-bold rounded-xl px-4 py-2.5 pr-8 focus:outline-hidden focus:border-emerald-600 transition-colors appearance-none cursor-pointer shadow-xs"
                >
                  <option>Recommended Matches</option>
                  <option>Price: Low to High</option>
                  <option>Duration: Shortest</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Row */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 bg-stone-100/70 p-3.5 rounded-2xl border border-stone-200/70 mb-7">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mr-1">
                Active Filters:
              </span>
              {activeFilters.map(f => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full shadow-2xs"
                >
                  <span>{f.label}</span>
                  <button
                    onClick={() => removeFilter(f.id)}
                    className="hover:text-emerald-700 cursor-pointer p-0.5 rounded-full hover:bg-emerald-200/50 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-xs text-emerald-800 hover:text-emerald-950 hover:underline font-bold ml-auto cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Interactive Multi-Facet Search Bar */}
          <div className="bg-white p-3 rounded-2xl border border-stone-200/90 shadow-lg flex flex-col md:flex-row items-center gap-3">
            
            {/* Search Input */}
            <div className="flex items-center gap-3 px-3 w-full md:w-1/3">
              <Search size={17} className="text-emerald-700 shrink-0" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search peaks, valleys, or activities..."
                className="bg-transparent border-none text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm w-full focus:outline-hidden p-0"
              />
            </div>

            <div className="h-7 w-px bg-stone-200 hidden md:block"></div>

            {/* Region Dropdown */}
            <div className="flex items-center gap-2.5 px-3 w-full md:w-1/4">
              <MapPin size={17} className="text-emerald-700 shrink-0" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-transparent border-none text-slate-800 text-xs sm:text-sm font-medium w-full focus:outline-hidden p-0 cursor-pointer"
              >
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="h-7 w-px bg-stone-200 hidden md:block"></div>

            {/* Season Dropdown */}
            <div className="flex items-center gap-2.5 px-3 w-full md:w-1/4">
              <Calendar size={17} className="text-emerald-700 shrink-0" />
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="bg-transparent border-none text-slate-800 text-xs sm:text-sm font-medium w-full focus:outline-hidden p-0 cursor-pointer"
              >
                <option>Any Season</option>
                <option>Spring (May - Jun)</option>
                <option>Autumn (Sep - Nov)</option>
                <option>Winter (Dec - Feb)</option>
              </select>
            </div>

            {/* Search Trigger CTA */}
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className="w-full md:w-auto bg-[#0f2a22] hover:bg-[#184236] text-white font-bold px-7 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer shrink-0"
            >
              Apply Search
            </button>
          </div>

        </section>

        {/* ── Main Grid Section (Real Database Activities in Copied UI) ── */}
        <section className="px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md animate-pulse flex flex-col h-96">
                  <div className="h-64 bg-stone-200 w-full" />
                  <div className="p-6 space-y-3 flex-1">
                    <div className="h-4 bg-stone-200 rounded w-3/4" />
                    <div className="h-3 bg-stone-100 rounded w-1/2" />
                    <div className="h-3 bg-stone-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 my-8 space-y-4">
              <Mountain size={40} className="text-stone-300 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Failed to load expeditions from database</h3>
              <p className="text-xs text-slate-500">{error}</p>
              <button
                onClick={refetch}
                className="px-5 py-2.5 rounded-xl bg-[#0f2a22] text-white text-xs font-bold shadow-sm inline-flex items-center gap-2"
              >
                <RefreshCw size={14} /> Try Again
              </button>
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 my-8 space-y-4">
              <Mountain size={40} className="text-stone-300 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">No matching expeditions found</h3>
              <p className="text-xs text-slate-500">Try loosening your search terms or clearing active filters.</p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedItems.map((act) => {
                const actId = act.id || act._id || act.slug;
                const images = getCardImages(act);
                const displayImage = images[0] || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800';
                
                const regionName = act.region ? `${act.region}${act.district ? ` • ${act.district}` : ''}` : (act.district || 'Garhwal & Kumaon');
                const categoryTag = act.category || 'High Altitude';
                const duration = act.idealDuration || '6 Days';
                const altitude = act.highlights?.find(h => h.includes('m') || h.includes('ft')) || '3,800m / 12,500ft';
                const price = act.budgetLevel === 'Luxury' ? 18500 : act.budgetLevel === 'Mid-range' ? 12400 : 9500;

                return (
                  <div
                    key={actId}
                    className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-md hover:shadow-xl hover:border-emerald-600/40 transition-all duration-300 flex flex-col group"
                  >
                    {/* Card Image Banner */}
                    <div className="relative h-64 w-full bg-cover bg-center overflow-hidden bg-stone-100">
                      <img
                        src={displayImage}
                        alt={act.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="bg-white/90 backdrop-blur-md text-[#0f2a22] font-black text-[11px] px-3 py-1 rounded-full border border-emerald-600/20 shadow-xs">
                          {categoryTag}
                        </span>
                        <span className="bg-emerald-600/90 text-white backdrop-blur-md font-black text-[11px] px-3 py-1 rounded-full shadow-xs">
                          {act.budgetLevel || 'Moderate'}
                        </span>
                      </div>

                      {/* Bottom Metadata Badges */}
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-bold">
                        <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                          <Mountain size={13} className="text-emerald-300" />
                          <span>{altitude}</span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                          <Clock size={13} className="text-emerald-300" />
                          <span>{duration}</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                      <div>
                        <div className="text-[11px] text-emerald-800 font-bold tracking-wider uppercase mb-1">
                          {regionName}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug line-clamp-1">
                          {act.name}
                        </h3>
                        <p className="text-slate-600 text-xs mt-2 line-clamp-2 leading-relaxed">
                          {act.shortDescription || act.description || 'Experience authentic high altitude mountain trails across Devbhoomi.'}
                        </p>
                      </div>

                      {/* Footer Row */}
                      <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">
                            Starting from
                          </span>
                          <span className="text-lg font-extrabold text-slate-900">
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => openAddToTripModal({
                              id: actId,
                              _id: actId,
                              name: act.name,
                              title: act.name,
                              itemType: 'activity',
                              type: 'Trek / Activity',
                              location: regionName,
                              price: price,
                              image: displayImage
                            })}
                            className="p-2 rounded-xl border border-emerald-700/30 text-[#0f2a22] hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Add to Trip Day"
                          >
                            <Plus size={15} />
                          </button>

                          <Link
                            to={`/activities/${act.slug || actId}`}
                            className="bg-emerald-50 hover:bg-[#0f2a22] text-[#0f2a22] hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs group/btn"
                          >
                            <span>Details</span>
                            <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Pagination Controls ───────────────────────────────────────── */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-slate-700 hover:bg-emerald-700 hover:text-white transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                    currentPage === idx + 1
                      ? 'bg-[#0f2a22] text-white'
                      : 'bg-white border border-stone-200 text-slate-700 hover:bg-stone-50'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-slate-700 hover:bg-emerald-700 hover:text-white transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

        </section>

      </main>

      <Footer />
    </div>
  );
}
