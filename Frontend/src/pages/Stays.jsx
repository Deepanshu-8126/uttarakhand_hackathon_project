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

const ITEMS_PER_PAGE = 9;

// ── Curated Real Unsplash High-Res Fallback Photo Collections for Stays ──────────
const REAL_STAY_PHOTO_BANKS = [
  [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1000&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1542157675-99d949ad5f23?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=80'
  ]
];

// Interactive Stay Card with Story-Style (- - -) Photo Cycling & Escrow Protection
function InteractiveStayCard({ stay, index, isFav, onToggleFav, onAddToTrip, onPlan }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const stayId = stay.id || stay._id;

  const cardImages = getCardImages(stay);
  const fallbackSet = REAL_STAY_PHOTO_BANKS[index % REAL_STAY_PHOTO_BANKS.length];
  const images = useMemo(() => {
    const raw = cardImages.filter(img => typeof img === 'string' && img.length > 5 && !img.includes('placeholder'));
    if (raw.length >= 2) return raw;
    if (raw.length === 1) return [raw[0], ...fallbackSet.slice(1)];
    return fallbackSet;
  }, [cardImages, fallbackSet]);

  // Auto-advance photos inside the card
  useEffect(() => {
    const timer = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % images.length);
    }, 4200 + (index % 4) * 500);

    return () => clearInterval(timer);
  }, [images.length, index]);

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % images.length);
  };

  const locDisplay = typeof stay.location === 'string'
    ? stay.location
    : (stay.city ? `${stay.city}${stay.district ? `, ${stay.district}` : ''}` : (stay.district || 'Uttarakhand'));

  const priceNum = stay.price?.amount || stay.pricePerNight || (typeof stay.price === 'number' ? stay.price : 1200);
  const facilitiesList = stay.facilities || stay.amenities || ['Mountain View', 'Hot Water', 'Homestyle Food'];

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-stone-200/80 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Card Image Banner with Multi-Photo Carousel */}
        <div className="relative h-52 sm:h-56 overflow-hidden bg-stone-900 select-none">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={stay.name}
              onError={(e) => {
                e.currentTarget.src = fallbackSet[idx % fallbackSet.length];
              }}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${
                idx === photoIndex ? 'opacity-100 scale-100 group-hover:scale-105 transition-transform duration-700' : 'opacity-0 pointer-events-none'
              }`}
            />
          ))}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/35 pointer-events-none" />

          {/* Top Story Dash Indicators */}
          <div className="absolute top-2.5 inset-x-3 z-10 flex items-center gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPhotoIndex(idx);
                }}
                className={`h-1 flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === photoIndex ? 'bg-white shadow-xs' : 'bg-white/40 hover:bg-white/70'
                }`}
                title={`Photo ${idx + 1}`}
              />
            ))}
          </div>

          {/* Escrow Protected Ribbon */}
          <div className="absolute top-6 left-3 z-10 bg-black/60 backdrop-blur-md text-emerald-300 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs flex items-center gap-1 border border-white/15">
            <Shield size={11} className="text-emerald-400" />
            <span>VERIFIED HOST</span>
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFav(stay);
            }}
            className={`absolute top-6 right-3 z-10 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-md ${
              isFav ? 'bg-rose-500 text-white' : 'bg-black/50 hover:bg-black/80 text-white border border-white/20'
            }`}
            aria-label="Save to Wishlist"
          >
            <Heart size={14} className={isFav ? 'fill-white' : ''} />
          </button>

          {/* Hover Next/Prev Chevrons */}
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <button
              type="button"
              onClick={handlePrev}
              className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center pointer-events-auto transition-transform active:scale-95 cursor-pointer border border-white/20"
              aria-label="Previous photo"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center pointer-events-auto transition-transform active:scale-95 cursor-pointer border border-white/20"
              aria-label="Next photo"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Bottom Micro Trust Bar */}
          <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-center justify-between text-[10px] bg-black/60 backdrop-blur-md text-stone-100 px-3 py-1 rounded-full border border-white/15">
            <span className="flex items-center gap-1"><Crosshair size={10} className="text-emerald-400" /> GPS</span>
            <span className="flex items-center gap-1"><Video size={10} className="text-emerald-400" /> Tour</span>
            <span className="flex items-center gap-1"><Camera size={10} className="text-emerald-400" /> Host</span>
            <span className="flex items-center gap-1 text-emerald-300 font-semibold"><Check size={10} className="text-emerald-400" /> Verified</span>
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-4 sm:p-5 space-y-2.5">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-stone-900 group-hover:text-emerald-800 transition-colors leading-snug line-clamp-1">
              {stay.name}
            </h3>
            <p className="text-xs text-stone-500 flex items-center mt-1">
              <MapPin size={12} className="text-emerald-700 mr-1 shrink-0" />
              <span className="truncate font-medium">{locDisplay}</span>
            </p>
          </div>

          {/* Facility Chips */}
          {facilitiesList.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {facilitiesList.slice(0, 3).map((f) => (
                <span key={f} className="px-2.5 py-0.5 rounded-md bg-stone-100 text-[10px] text-stone-600 font-medium border border-stone-200/60">
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">Tariff</span>
          <span className="text-sm sm:text-base font-black text-stone-900">
            ₹{priceNum.toLocaleString('en-IN')} <span className="text-[11px] font-normal text-stone-500">/night</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onAddToTrip(stay, priceNum, locDisplay, images[0])}
            className="p-2 rounded-xl border border-emerald-700/30 text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer shadow-2xs"
            title="Add to Trip Day"
          >
            <Plus size={15} />
          </button>
          <Link 
            to={`/stays/${stay.slug || stayId}`}
            className="px-3 py-1.5 rounded-xl border border-stone-200 hover:border-emerald-700/40 text-xs font-bold text-stone-700 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            Details
          </Link>
          <button 
            type="button"
            onClick={() => onPlan(stay)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-98"
          >
            Plan
          </button>
        </div>
      </div>
    </div>
  );
}

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
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542157675-99d949ad5f23?auto=format&fit=crop&w=1200&q=80')" }}
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
              {paginatedStays.map((stay, idx) => {
                const stayId = stay.id || stay._id;
                const isFav = isFavorite ? isFavorite(stayId) : false;

                return (
                  <InteractiveStayCard
                    key={stayId}
                    stay={stay}
                    index={idx}
                    isFav={isFav}
                    onToggleFav={(s) => toggleFavorite && toggleFavorite({ ...s, itemType: 'stay' })}
                    onAddToTrip={(s, price, loc, img) => openAddToTripModal({
                      id: stayId,
                      _id: stayId,
                      name: s.name,
                      title: s.name,
                      itemType: 'stay',
                      type: 'Homestay / Stay',
                      location: loc,
                      price: price,
                      image: img
                    })}
                    onPlan={(s) => navigate(`/trip-planner?destination=${encodeURIComponent(s.district || s.city || s.name)}`)}
                  />
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
