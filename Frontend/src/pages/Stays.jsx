import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Shield, 
  Check, 
  Search, 
  MapPin, 
  AlertTriangle, 
  Route, 
  Heart, 
  Star, 
  Mountain, 
  Camera, 
  Video, 
  Crosshair, 
  HeartHandshake, 
  PhoneCall,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useStays } from '../hooks/useStays';
import { useFavorites } from '../context/FavoritesContext';
import { useMapStore } from '../store/mapStore';
import { getCardImages } from '../utils/imageHelpers';
import AltitudeGuardModal from '../components/safety/AltitudeGuardModal';
import WomenSosModal from '../components/safety/WomenSosModal';

const ITEMS_PER_PAGE = 8;

export default function Stays() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locationParam = searchParams.get('location') || searchParams.get('city') || searchParams.get('q');

  const { stays, loading, error, refetch } = useStays();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openAddToTripModal } = useMapStore();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(locationParam || '');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxBudget, setMaxBudget] = useState('Any');
  const [minRating, setMinRating] = useState('Any');
  const [currentPage, setCurrentPage] = useState(1);

  // Safety Modals State
  const [altitudeModalOpen, setAltitudeModalOpen] = useState(false);
  const [womenSosOpen, setWomenSosOpen] = useState(false);

  // Dynamically extract distinct cities and categories directly from real database items
  const cities = useMemo(() => {
    const set = new Set();
    stays.forEach(s => {
      if (s.district) set.add(s.district);
      if (s.city) set.add(s.city);
    });
    return ['All', ...Array.from(set).sort()];
  }, [stays]);

  const categories = useMemo(() => {
    const set = new Set();
    stays.forEach(s => {
      const cat = s.category || s.type;
      if (cat) set.add(cat);
    });
    return ['All', ...Array.from(set).sort()];
  }, [stays]);

  // Sync location/city URL search parameters automatically
  useEffect(() => {
    if (locationParam) {
      setSearchQuery(locationParam);
      const matched = cities.find(c => c.toLowerCase() === locationParam.toLowerCase());
      if (matched) {
        setSelectedCity(matched);
      }
    }
  }, [locationParam, cities]);

  // Reset pagination whenever filters or search terms change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity, selectedCategory, maxBudget, minRating]);

  // Filter real database stays
  const filteredStays = useMemo(() => {
    return stays.filter(stay => {
      const q = searchQuery.toLowerCase().trim();
      const name = (stay.name || '').toLowerCase();
      const locStr = typeof stay.location === 'string'
        ? stay.location
        : (stay.city ? `${stay.city}, ${stay.district || ''}` : (stay.district || ''));
      const loc = locStr.toLowerCase();
      const desc = (stay.shortDescription || stay.description || '').toLowerCase();

      const matchSearch = !q || name.includes(q) || loc.includes(q) || desc.includes(q);
      const matchCity = selectedCity === 'All' || 
        (stay.city && stay.city.toLowerCase() === selectedCity.toLowerCase()) ||
        (stay.district && stay.district.toLowerCase() === selectedCity.toLowerCase()) ||
        loc.includes(selectedCity.toLowerCase());

      const stayCat = (stay.category || stay.type || '').toLowerCase();
      const matchCategory = selectedCategory === 'All' || stayCat.includes(selectedCategory.toLowerCase());

      let matchBudget = true;
      const price = stay.price?.amount || stay.pricePerNight || (typeof stay.price === 'number' ? stay.price : 0);
      if (maxBudget === 'Under ₹800 (Budget Dorms)') matchBudget = price > 0 && price <= 800;
      else if (maxBudget === 'Under ₹1,500 (Homestays)') matchBudget = price > 0 && price <= 1500;
      else if (maxBudget === 'Under ₹3,000 (Comfort)') matchBudget = price > 0 && price <= 3000;
      else if (maxBudget === '₹3,000+ (Luxury)') matchBudget = price >= 3000;

      let matchRating = true;
      const rate = stay.rating || 4.8;
      if (minRating === '4.5 & above') matchRating = rate >= 4.5;
      else if (minRating === '4.0 & above') matchRating = rate >= 4.0;

      return matchSearch && matchCity && matchCategory && matchBudget && matchRating;
    });
  }, [stays, searchQuery, selectedCity, selectedCategory, maxBudget, minRating]);

  const totalPages = Math.ceil(filteredStays.length / ITEMS_PER_PAGE) || 1;
  const paginatedStays = filteredStays.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCity('All');
    setSelectedCategory('All');
    setMaxBudget('Any');
    setMinRating('Any');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-[#1a4331] font-sans antialiased selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-grow flex flex-col pb-28 md:pb-36">
        
        {/* ── 1. Hero Section (Design Matching UI Copy with Live Database Count) ── */}
        <section className="relative overflow-hidden pt-8 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1a4331]/10 to-transparent" id="hero">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#1a4331]/10 text-[#1a4331] text-xs font-bold border border-[#1a4331]/15">
                  <Shield size={14} className="text-emerald-600" />
                  <span>100% ESCROW & GPS-VERIFIED MOUNTAIN STAYS</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1a4331] leading-tight">
                  Stay in the <span className="text-emerald-600">Mountains</span>
                </h1>

                <p className="text-[#1a4331]/80 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                  From cozy cedar-wood homestays to high-altitude mountain retreats with snow-capped Himalayan views. Experience authentic Kumaoni & Garhwali hospitality with guaranteed escrow protection.
                </p>

                {/* Search Bar Box */}
                <div className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-[#1a4331]/10 flex flex-col sm:flex-row gap-3 max-w-xl">
                  <div className="flex-1 flex items-center px-4 py-2.5 bg-[#fdfbf7] rounded-xl border border-[#1a4331]/10">
                    <MapPin size={16} className="text-[#1a4331]/40 mr-2.5 shrink-0" />
                    <input
                      type="text"
                      placeholder="Where in Uttarakhand? (e.g. Munsiyari, Chopta, Almora)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm text-[#1a4331] placeholder:text-[#1a4331]/40 focus:outline-hidden font-medium"
                    />
                  </div>
                  <a
                    href="#stays-grid"
                    className="px-6 py-3 rounded-xl bg-[#1a4331] hover:bg-[#245a43] text-[#fdfbf7] font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center space-x-2 whitespace-nowrap cursor-pointer"
                  >
                    <span>Search {stays.length > 0 ? `${stays.length} Stays` : '142 Stays'}</span>
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-medium text-[#1a4331]/75">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span>{stays.length > 0 ? `${stays.length} GPS-Verified` : '142 GPS-Verified'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span>Escrow Protected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span>Video KYC Verified</span>
                  </div>
                </div>
              </div>

              {/* Right Visual Card */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#1a4331]/10 group">
                  <div 
                    className="w-full h-80 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-700" 
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBuHaOS-NtEfCcrj-hssENWdc7eu9tV6sCv19L-WdK6Gi3q36Zav6RO352bow2cdlgbTL-5LKEou5iKyCJCM2QWnQ1eDv2QwtOzZp4GQNPGxL3NIPR1KdM2wVL-1m2SIqZUn67gu-1ynBSpANpKYzUEz2HmXl77HIIrIHDkIPVR7xkkFEUB4fnYag7-letO0dcSIkuKcsGV480Dk1HV457QHZzBfYM9D5t53HIZCOBhX8MG4QwUgu20XQ')" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#123023]/95 via-transparent to-transparent flex flex-col justify-end p-6 text-[#fdfbf7]">
                    <div className="absolute top-4 right-4 bg-emerald-500 text-[#123023] px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      Escrow Ready
                    </div>
                    <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Featured Property</span>
                    <h3 className="text-lg font-bold text-white mt-0.5">Pahadi Eco-Lodge, Munsiyari</h3>
                    <p className="text-xs text-[#fdfbf7]/80">Panchachuli Snow View • GPS EXIF ✓</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                      <span className="text-sm font-bold text-emerald-400">
                        ₹2,400 <span className="text-[10px] text-[#fdfbf7]/70 font-normal">/night</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/20 text-[10px] font-bold backdrop-blur-sm text-white">
                        100% Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 2. Route Alert Bar ─────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-8 font-sans">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Active Road Advisory</span>
                  <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">Verified by 5 Valley Sentinels</span>
                </div>
                <p className="text-xs text-[#1a4331]/80 mt-0.5 leading-relaxed">
                  <strong className="text-[#1a4331]">Joshimath Corridor (NH-58) BLOCKED</strong> — Auto-reroute via Tharali Valley Bypass (+34km). BRO clearance team active on site.
                </p>
              </div>
            </div>
            
            <button 
              type="button"
              onClick={() => navigate('/map')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shrink-0 shadow-sm flex items-center space-x-2 cursor-pointer"
            >
              <Route size={14} />
              <span>1-Tap Auto-Reroute</span>
            </button>
          </div>
        </section>

        {/* ── 3. Advanced Filters Bar ────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-10 font-sans">
          <div className="p-4 rounded-2xl bg-white shadow-md border border-[#1a4331]/10 flex flex-wrap items-center gap-3.5">
            
            {/* Search Input */}
            <div className="flex-1 min-w-[180px] flex items-center px-3.5 py-2.5 rounded-xl bg-[#fdfbf7] border border-[#1a4331]/10">
              <Search size={14} className="text-[#1a4331]/40 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name or location..."
                className="w-full bg-transparent text-xs text-[#1a4331] placeholder:text-[#1a4331]/40 focus:outline-hidden font-medium"
              />
            </div>

            {/* Location / City Select */}
            <div className="w-auto">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#fdfbf7] border border-[#1a4331]/10 text-xs text-[#1a4331] font-semibold focus:outline-hidden cursor-pointer"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city === 'All' ? 'Location / City: All' : city}
                  </option>
                ))}
              </select>
            </div>

            {/* Stay Type Select */}
            <div className="w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#fdfbf7] border border-[#1a4331]/10 text-xs text-[#1a4331] font-semibold focus:outline-hidden cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'Stay Type: All' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Budget Select */}
            <div className="w-auto">
              <select
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#fdfbf7] border border-[#1a4331]/10 text-xs text-[#1a4331] font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="Any">Budget / Night: All Budgets</option>
                <option value="Under ₹800 (Budget Dorms)">Under ₹800 (Budget Camps / Dorms)</option>
                <option value="Under ₹1,500 (Homestays)">Under ₹1,500 (Pahadi Homestays)</option>
                <option value="Under ₹3,000 (Comfort)">Under ₹3,000 (Comfort Stays)</option>
                <option value="₹3,000+ (Luxury)">₹3,000+ (Luxury Resorts)</option>
              </select>
            </div>

            {/* Min Rating Select */}
            <div className="w-auto">
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#fdfbf7] border border-[#1a4331]/10 text-xs text-[#1a4331] font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="Any">Min Rating: Any</option>
                <option value="4.5 & above">4.5 & above</option>
                <option value="4.0 & above">4.0 & above</option>
              </select>
            </div>

            {/* Apply & Reset Buttons */}
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </section>

        {/* ── 4. Homestays & Camps Grid (Real Database Records Styled in Copy UI) ── */}
        <section id="stays-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-16 font-sans scroll-mt-24">
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 animate-pulse flex flex-col h-80">
                  <div className="h-48 bg-stone-200 w-full" />
                  <div className="p-4 space-y-3 flex-1">
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
              <h3 className="text-xl font-bold text-slate-900">Failed to load stays from database</h3>
              <p className="text-xs text-slate-500">{error}</p>
              <button
                onClick={refetch}
                className="px-5 py-2.5 rounded-xl bg-[#1a4331] text-white text-xs font-bold shadow-sm inline-flex items-center gap-2"
              >
                <RefreshCw size={14} /> Try Again
              </button>
            </div>
          ) : paginatedStays.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 my-8 space-y-4">
              <Mountain size={40} className="text-stone-300 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">No matching stays found</h3>
              <p className="text-xs text-slate-500">Try adjusting your budget or search filter to see more homestays.</p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {paginatedStays.map((stay) => {
                const stayId = stay.id || stay._id;
                const isFav = isFavorite ? isFavorite(stayId) : false;
                const cardImages = getCardImages(stay);
                const displayImage = cardImages[0] || 'https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=800';

                const locDisplay = typeof stay.location === 'string'
                  ? stay.location
                  : (stay.city ? `${stay.city}${stay.district ? `, ${stay.district}` : ''}` : (stay.district || 'Uttarakhand'));

                const priceNum = stay.price?.amount || stay.pricePerNight || (typeof stay.price === 'number' ? stay.price : 1200);
                const ratingNum = stay.rating || 4.8;
                const facilitiesList = stay.facilities || stay.amenities || ['Pets not allowed'];

                return (
                  <div 
                    key={stayId}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg border border-[#1a4331]/10 flex flex-col justify-between group hover:shadow-xl transition-all"
                  >
                    <div>
                      {/* Card Image Banner */}
                      <div className="relative h-48 overflow-hidden bg-stone-100">
                        <img
                          src={displayImage}
                          alt={stay.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Escrow Protected Ribbon */}
                        <div className="absolute top-3 left-3 bg-[#1a4331]/90 backdrop-blur-md text-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm flex items-center space-x-1 border border-white/10">
                          <Shield size={11} className="text-emerald-400" />
                          <span>ESCROW PROTECTED</span>
                        </div>

                        {/* Heart Wishlist Button */}
                        <button
                          type="button"
                          onClick={() => toggleFavorite && toggleFavorite({ ...stay, itemType: 'stay' })}
                          className={`absolute top-3 right-3 w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer shadow-sm ${
                            isFav ? 'bg-rose-50 text-rose-600' : 'bg-white/80 text-[#1a4331] hover:bg-white'
                          }`}
                          aria-label="Save to Wishlist"
                        >
                          <Heart size={13} className={isFav ? 'fill-rose-600' : ''} />
                        </button>

                        {/* Bottom Micro Trust Bar */}
                        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] bg-[#1a4331]/85 backdrop-blur-md text-[#fdfbf7] px-2.5 py-1 rounded-lg border border-white/10">
                          <span className="flex items-center space-x-1"><Crosshair size={11} className="text-emerald-400" /> <span>GPS</span></span>
                          <span className="flex items-center space-x-1"><Video size={11} className="text-emerald-400" /> <span>Video</span></span>
                          <span className="flex items-center space-x-1"><Camera size={11} className="text-emerald-400" /> <span>Selfie</span></span>
                          <span className="flex items-center space-x-1"><Check size={11} className="text-emerald-400" /> <span>Verified</span></span>
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-bold text-sm text-[#1a4331] group-hover:text-emerald-600 transition-colors leading-snug line-clamp-1">
                            {stay.name}
                          </h3>
                          <p className="text-[11px] text-[#1a4331]/70 flex items-center mt-1">
                            <MapPin size={11} className="text-emerald-600 mr-1 shrink-0" />
                            <span className="truncate">{locDisplay}</span>
                          </p>
                          <p className="text-[10px] text-[#1a4331]/50 mt-0.5">Location approximate — town/village centre</p>
                        </div>

                        {/* Facility Tags */}
                        {facilitiesList.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {facilitiesList.slice(0, 4).map((f) => (
                              <span key={f} className="px-2 py-0.5 rounded-md bg-[#1a4331]/5 text-[10px] text-[#1a4331]/80 font-medium">
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Row */}
                    <div className="p-4 pt-0 border-t border-[#1a4331]/5 mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-[#1a4331]/50 block">Price</span>
                        <span className="text-sm font-extrabold text-[#1a4331]">
                          ₹{priceNum.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-[#1a4331]/70">/night</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openAddToTripModal({
                            id: stayId,
                            _id: stayId,
                            name: stay.name,
                            title: stay.name,
                            itemType: 'stay',
                            type: 'Homestay / Stay',
                            location: locDisplay,
                            price: priceNum,
                            image: displayImage
                          })}
                          className="p-1.5 rounded-xl border border-emerald-600/30 text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Add to Trip Day"
                        >
                          <Plus size={15} />
                        </button>
                        <Link 
                          to={`/stays/${stay.slug || stayId}`}
                          className="px-2.5 py-1.5 rounded-xl border border-[#1a4331]/20 text-xs font-semibold text-[#1a4331] hover:bg-[#1a4331]/5 transition-colors cursor-pointer"
                        >
                          Details
                        </Link>
                        <button 
                          type="button"
                          onClick={() => navigate(`/trip-planner?destination=${encodeURIComponent(stay.district || stay.city || stay.name)}`)}
                          className="px-3 py-1.5 rounded-xl bg-[#1a4331] text-[#fdfbf7] text-xs font-semibold hover:bg-[#245a43] transition-colors cursor-pointer shadow-xs"
                        >
                          Plan
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* ── 5. Pagination Controls ─────────────────────────────────── */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-12 font-sans">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-[#1a4331]/20 text-xs font-semibold text-[#1a4331]/70 hover:bg-[#1a4331]/5 transition-colors disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx + 1}
                  type="button"
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPage === idx + 1
                      ? 'bg-[#1a4331] text-[#fdfbf7] shadow-sm'
                      : 'border border-[#1a4331]/20 text-[#1a4331] hover:bg-[#1a4331]/5'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-[#1a4331]/20 text-xs font-semibold text-[#1a4331] hover:bg-[#1a4331]/5 transition-colors disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </section>

      </main>

      {/* Mountain Safety Modals */}
      <AltitudeGuardModal 
        isOpen={altitudeModalOpen} 
        onClose={() => setAltitudeModalOpen(false)} 
        destination="Kedarnath"
      />

      <WomenSosModal 
        isOpen={womenSosOpen} 
        onClose={() => setWomenSosOpen(false)} 
      />

      <Footer />
    </div>
  );
}
