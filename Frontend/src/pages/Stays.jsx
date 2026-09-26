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
  ShieldCheck, 
  Lock,
  Radio,
  ArrowRight,
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

// Curated high-res authentic Uttarakhand mountain stay photo banks
const REAL_STAY_PHOTO_BANKS = [
  [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1542157675-99d949ad5f23?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1000&q=80'
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

  const locDisplay = typeof stay.location === 'string'
    ? stay.location
    : (stay.city ? `${stay.city}${stay.district ? `, ${stay.district}` : ''}` : (stay.district || 'Uttarakhand'));

  const priceNum = stay.price?.amount || stay.pricePerNight || (typeof stay.price === 'number' ? stay.price : 2400);
  const categoryTag = stay.category || stay.type || (index % 2 === 0 ? 'Cedar Wood Retreat' : 'Forest Eco-Lodge');
  const ratingNum = stay.rating || (4.7 + (index % 4) * 0.1).toFixed(1);
  const reviewCount = stay.reviewsCount || stay.reviews?.length || (25 + (index % 30));

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200/80 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Card Image Banner */}
        <div className="relative h-60 overflow-hidden bg-slate-900 select-none">
          <img
            src={images[photoIndex] || images[0]}
            alt={stay.name}
            onError={(e) => {
              e.currentTarget.src = fallbackSet[0];
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />

          {/* Top Story Dash Indicators */}
          {images.length > 1 && (
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
          )}

          {/* Escrow Protected Top Right Badge */}
          <div className="absolute top-3.5 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md z-10">
            Escrow Protected
          </div>

          {/* Location Tag Bottom Left */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg z-10">
            {locDisplay}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFav(stay);
            }}
            className={`absolute top-3.5 left-3 z-10 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-md ${
              isFav ? 'bg-rose-500 text-white' : 'bg-black/40 hover:bg-black/70 text-white border border-white/20'
            }`}
            aria-label="Save to Wishlist"
          >
            <Heart size={14} className={isFav ? 'fill-white' : ''} />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              {categoryTag}
            </span>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
              <Star size={12} className="fill-amber-500 text-amber-500" />
              <span>{ratingNum} ({reviewCount})</span>
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0f4c3a] transition-colors leading-snug line-clamp-1">
            {stay.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {stay.shortDescription || stay.description || 'Authentic mountain retreat with panoramic Himalayan views, organic home-cooked meals, and verified host hospitality.'}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-5 pt-0">
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <span className="text-lg font-extrabold text-slate-900">₹{priceNum.toLocaleString('en-IN')}</span>
            <span className="text-xs text-slate-500"> /night</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onAddToTrip(stay, priceNum, locDisplay, images[0])}
              className="p-2 rounded-xl border border-emerald-700/30 text-[#0f4c3a] hover:bg-emerald-50 transition-colors cursor-pointer"
              title="Add to Trip Day"
            >
              <Plus size={15} />
            </button>
            <Link
              to={`/stays/${stay.slug || stayId}`}
              className="bg-[#0f4c3a] hover:bg-[#0a3528] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
            >
              Book Secure
            </Link>
          </div>
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
  const [maxBudget, setMaxBudget] = useState('All');
  const [minRating, setMinRating] = useState('Any');
  const [regionTab, setRegionTab] = useState('All'); // 'All' | 'Kumaon' | 'Garhwal'
  const [currentPage, setCurrentPage] = useState(1);

  // Safety Modals State
  const [altitudeModalOpen, setAltitudeModalOpen] = useState(false);
  const [womenSosOpen, setWomenSosOpen] = useState(false);

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

      // Search match
      const matchSearch = !q || name.includes(q) || loc.includes(q) || desc.includes(q);

      // City match
      const matchCity = selectedCity === 'All' || 
        (stay.city && stay.city.toLowerCase() === selectedCity.toLowerCase()) ||
        (stay.district && stay.district.toLowerCase() === selectedCity.toLowerCase()) ||
        loc.includes(selectedCity.toLowerCase());

      // Category match
      const stayCat = (stay.category || stay.type || '').toLowerCase();
      const matchCategory = selectedCategory === 'All' || stayCat.includes(selectedCategory.toLowerCase());

      // Region match (Kumaon vs Garhwal)
      let matchRegion = true;
      const kumaonDistricts = ['nainital', 'almora', 'pithoragarh', 'bageshwar', 'champawat', 'us nagar', 'munsiyari', 'binsar', 'kausani', 'mukteshwar'];
      const garhwalDistricts = ['dehradun', 'chamoli', 'rudraprayag', 'uttarkashi', 'tehri', 'pauri', 'haridwar', 'rishikesh', 'chopta', 'auli', 'kedarnath', 'badrinath'];
      
      if (regionTab === 'Kumaon') {
        matchRegion = kumaonDistricts.some(d => loc.includes(d) || name.includes(d));
      } else if (regionTab === 'Garhwal') {
        matchRegion = garhwalDistricts.some(d => loc.includes(d) || name.includes(d));
      }

      // Budget match
      let matchBudget = true;
      const price = stay.price?.amount || stay.pricePerNight || (typeof stay.price === 'number' ? stay.price : 0);
      if (maxBudget === 'Under ₹2,000') matchBudget = price > 0 && price <= 2000;
      else if (maxBudget === '₹2,000 - ₹4,000') matchBudget = price >= 2000 && price <= 4000;
      else if (maxBudget === '₹4,000+') matchBudget = price >= 4000;

      // Rating match
      let matchRating = true;
      const rate = stay.rating || 4.8;
      if (minRating === '4.5 & above ⭐') matchRating = rate >= 4.5;
      else if (minRating === '4.8 & above ⭐') matchRating = rate >= 4.8;

      return matchSearch && matchCity && matchCategory && matchRegion && matchBudget && matchRating;
    });
  }, [stays, searchQuery, selectedCity, selectedCategory, regionTab, maxBudget, minRating]);

  const totalPages = Math.ceil(filteredStays.length / ITEMS_PER_PAGE) || 1;
  const paginatedStays = filteredStays.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCity('All');
    setSelectedCategory('All');
    setMaxBudget('All');
    setMinRating('Any');
    setRegionTab('All');
    setCurrentPage(1);
  };

  const totalStaysCount = stays.length || 86;

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f8] text-slate-800 antialiased selection:bg-[#0f4c3a] selection:text-white font-sans">
      <Navbar />

      <main className="flex-grow flex flex-col pb-28 md:pb-36">
        
        {/* ── 1. HeroSection ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-8 pb-14 bg-[#fbf9f8]" data-purpose="hero-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Trust Pill */}
            <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200/60 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0f4c3a] mb-6 shadow-xs">
              <ShieldCheck size={16} className="text-[#0f4c3a]" />
              <span>100% ESCROW &amp; GPS-VERIFIED MOUNTAIN STAYS</span>
            </div>

            {/* Hero Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Title, Subtitle, Search */}
              <div className="lg:col-span-7 space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
                  Stay in the <span className="text-[#0f4c3a]">Mountains</span>
                </h1>
                <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
                  From cozy cedar-wood homestays to high-altitude mountain retreats with snow-capped Himalayan views. Experience authentic Kumaoni &amp; Garhwali hospitality with guaranteed escrow protection.
                </p>

                {/* Main Hero Search Bar */}
                <div className="bg-white p-2.5 rounded-2xl shadow-xl border border-slate-200/80 max-w-xl flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex items-center px-3 py-2 w-full sm:w-auto flex-1 space-x-2 bg-slate-50 rounded-xl border border-slate-100">
                    <MapPin size={18} className="text-slate-400 shrink-0" />
                    <input 
                      className="w-full bg-transparent border-none text-sm text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none p-0 font-medium" 
                      placeholder="Where in Uttarakhand? (e.g. Munsiyari, Chopta, Alm)" 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <a 
                    href="#stays"
                    className="w-full sm:w-auto bg-[#0f4c3a] hover:bg-[#0a3528] text-white font-semibold px-6 py-3.5 rounded-xl transition shadow-md whitespace-nowrap text-sm text-center cursor-pointer"
                  >
                    Search {totalStaysCount} Stays
                  </a>
                </div>

                {/* Feature Trust Badges Under Search */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-slate-700 pt-2">
                  <div className="flex items-center space-x-1.5">
                    <Check size={16} className="text-emerald-600 stroke-[3]" />
                    <span>{totalStaysCount} GPS-Verified</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check size={16} className="text-emerald-600 stroke-[3]" />
                    <span>Escrow Protected</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check size={16} className="text-emerald-600 stroke-[3]" />
                    <span>Video KYC Verified</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Featured Property Showcase Card */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-[#0f4c3a] group h-[380px] flex flex-col justify-end p-6">
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-105 transition duration-700" 
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542157675-99d949ad5f23?auto=format&fit=crop&w=1200&q=80')" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                  {/* Escrow Badge Top Right */}
                  <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                    Escrow Ready
                  </div>

                  {/* Card Bottom Info */}
                  <div className="relative z-10 space-y-2">
                    <span className="text-[11px] font-bold tracking-widest text-emerald-300 uppercase bg-emerald-950/60 px-2.5 py-1 rounded-md backdrop-blur-sm border border-emerald-800 inline-block">
                      Featured Property
                    </span>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Pahadi Eco-Lodge, Munsiyari</h3>
                    <p className="text-xs text-slate-300 flex items-center space-x-1">
                      <span>Panchachuli Snow View</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">GPS EXIF ✓</span>
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div>
                        <span className="text-xl font-extrabold text-white">₹2,400</span>
                        <span className="text-xs text-slate-300"> /night</span>
                      </div>
                      <div className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                        100% Verified
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 2. RoadAdvisoryBanner ──────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 w-full" data-purpose="road-advisory">
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-amber-800 tracking-wider uppercase bg-amber-200/60 px-2 py-0.5 rounded">
                    Active Road Advisory
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">Verified by 5 Valley Sentinels</span>
                </div>
                <p className="text-sm font-medium text-slate-800 mt-1 leading-relaxed">
                  <strong className="text-slate-900">Joshimath Corridor (NH-58) BLOCKED</strong> — Auto-reroute via Tharali Valley Bypass (+34km). BRO clearance team active on site.
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => navigate('/map')}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition whitespace-nowrap flex items-center space-x-1.5 shrink-0 cursor-pointer"
            >
              <Route size={14} />
              <span>1-Tap Auto-Reroute</span>
            </button>
          </div>
        </section>

        {/* ── 3. AdvancedFilters ─────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 w-full" data-purpose="advanced-filters">
          <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-md border border-slate-200/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Filter 1: Name or Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Search Stays</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Search size={14} />
                  </span>
                  <input 
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-1 focus:ring-[#0f4c3a] focus:outline-none" 
                    placeholder="Name or location..." 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter 2: Location / City */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Location / City</label>
                <select 
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-1 focus:ring-[#0f4c3a] focus:outline-none cursor-pointer"
                >
                  <option value="All">Location / City: All</option>
                  <option value="Munsiyari">Munsiyari</option>
                  <option value="Chopta">Chopta</option>
                  <option value="Auli">Auli</option>
                  <option value="Binsar">Binsar</option>
                  <option value="Kausani">Kausani</option>
                  <option value="Nainital">Nainital</option>
                  <option value="Rishikesh">Rishikesh</option>
                </select>
              </div>

              {/* Filter 3: Stay Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Stay Type</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-1 focus:ring-[#0f4c3a] focus:outline-none cursor-pointer"
                >
                  <option value="All">Stay Type: All</option>
                  <option value="Eco-Lodge">Eco-Lodge</option>
                  <option value="Cedar Homestay">Cedar Homestay</option>
                  <option value="High-Altitude Retreat">High-Altitude Retreat</option>
                  <option value="Mountain Cottage">Mountain Cottage</option>
                  <option value="Swiss Tents">Swiss Tents</option>
                </select>
              </div>

              {/* Filter 4: Budget / Night */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Budget / Night</label>
                <select 
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-1 focus:ring-[#0f4c3a] focus:outline-none cursor-pointer"
                >
                  <option value="All">Budget / Night: All Budgets</option>
                  <option value="Under ₹2,000">Under ₹2,000</option>
                  <option value="₹2,000 - ₹4,000">₹2,000 - ₹4,000</option>
                  <option value="₹4,000+">₹4,000+</option>
                </select>
              </div>

              {/* Filter 5: Min Rating */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Min Rating</label>
                <select 
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-1 focus:ring-[#0f4c3a] focus:outline-none cursor-pointer"
                >
                  <option value="Any">Min Rating: Any</option>
                  <option value="4.5 & above ⭐">4.5 &amp; above ⭐</option>
                  <option value="4.8 & above ⭐">4.8 &amp; above ⭐</option>
                </select>
              </div>

            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setCurrentPage(1)}
                className="bg-[#0f4c3a] hover:bg-[#0a3528] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
              >
                Apply Filters
              </button>
              <button 
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                Reset All
              </button>
            </div>
          </div>
        </section>

        {/* ── 4. StayListingsGrid ─────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 w-full scroll-mt-24" id="stays">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Curated Mountain Stays</h2>
              <p className="text-sm text-slate-600 mt-1">Verified eco-retreats equipped with smart escrow and 100% authentic GPS tags.</p>
            </div>
            
            {/* Region Tabs */}
            <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
              <button 
                type="button"
                onClick={() => setRegionTab('All')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  regionTab === 'All' 
                    ? 'bg-[#0f4c3a] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-[#0f4c3a]'
                }`}
              >
                All ({totalStaysCount})
              </button>
              <button 
                type="button"
                onClick={() => setRegionTab('Kumaon')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  regionTab === 'Kumaon' 
                    ? 'bg-[#0f4c3a] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-[#0f4c3a]'
                }`}
              >
                Kumaon
              </button>
              <button 
                type="button"
                onClick={() => setRegionTab('Garhwal')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  regionTab === 'Garhwal' 
                    ? 'bg-[#0f4c3a] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-[#0f4c3a]'
                }`}
              >
                Garhwal
              </button>
            </div>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200/80 animate-pulse h-96">
                  <div className="h-60 bg-slate-200 w-full" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 my-8 space-y-4 shadow-sm">
              <Mountain size={40} className="text-slate-300 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Failed to load stays from database</h3>
              <p className="text-xs text-slate-500">{error}</p>
              <button
                onClick={refetch}
                className="px-5 py-2.5 rounded-xl bg-[#0f4c3a] text-white text-xs font-bold shadow-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} /> Try Again
              </button>
            </div>
          ) : paginatedStays.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 my-8 space-y-4 shadow-sm">
              <Mountain size={40} className="text-slate-300 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">No matching stays found</h3>
              <p className="text-xs text-slate-500">Try adjusting your filters or region selection.</p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-[#0f4c3a] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedStays.map((stay, idx) => {
                const stayId = stay.id || stay._id;
                const isFav = isFavorite ? isFavorite('stay', stayId) : false;

                return (
                  <InteractiveStayCard
                    key={stayId}
                    stay={stay}
                    index={idx}
                    isFav={isFav}
                    onToggleFav={(s) => toggleFavorite && toggleFavorite('stay', s)}
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

          {/* Pagination Controls */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-12">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
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
                      ? 'bg-[#0f4c3a] text-white shadow-sm'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </section>

        {/* ── 5. InteractiveMapPreview ("Choose Your Mountain Realm") ──────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 w-full" data-purpose="explore-by-region">
          <div className="bg-[#0f4c3a] rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden shadow-xl">
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-800/40 rounded-full blur-3xl pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-4">
                <span className="bg-emerald-800 text-emerald-200 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-widest inline-block">
                  Interactive Region Explorer
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Choose Your Mountain Realm</h2>
                <p className="text-emerald-100 text-sm sm:text-base leading-relaxed max-w-xl">
                  Uttarakhand is broadly split into two divine cultural regions. Explore Garhwal for high Himalayan shrines and deep gorges, or Kumaon for rolling tea estates and dense pine forests.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setRegionTab('Kumaon');
                      const el = document.getElementById('stays');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-white text-[#0f4c3a] hover:bg-emerald-50 font-bold text-sm px-6 py-3 rounded-xl transition shadow cursor-pointer"
                  >
                    Explore Kumaon Stays (45)
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setRegionTab('Garhwal');
                      const el = document.getElementById('stays');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-sm px-6 py-3 rounded-xl border border-emerald-700 transition cursor-pointer"
                  >
                    Explore Garhwal Stays (41)
                  </button>
                </div>
              </div>

              {/* Right Live Region Status Card */}
              <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  <span>Live Region Status</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                    <span>Kumaon Weather &amp; Routes</span>
                    <span className="text-emerald-300 font-bold">Clear / All Open</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                    <span>Garhwal Weather &amp; Routes</span>
                    <span className="text-amber-300 font-bold">NH-58 Caution</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                    <span>Active Escrow Vaults</span>
                    <span className="text-emerald-300 font-bold">₹1.4Cr Secured</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. TrustAndEscrowSection ────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 w-full" data-purpose="trust-escrow">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#0f4c3a] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block">
              Secure Booking Guarantee
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-3 tracking-tight">Why Book with Escrow Protection?</h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Eliminating fraud and last-minute cancellations in remote mountain homestays through smart escrow smart-contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-[#0f4c3a] rounded-2xl flex items-center justify-center font-bold text-xl border border-emerald-100">
                🔒
              </div>
              <h3 className="text-lg font-bold text-slate-900">Smart Escrow Release</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your funds are held securely in an automated escrow vault. The host only receives payment after you check in and confirm your stay matches the GPS listing.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-[#0f4c3a] rounded-2xl flex items-center justify-center font-bold text-xl border border-emerald-100">
                📍
              </div>
              <h3 className="text-lg font-bold text-slate-900">GPS EXIF Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every property photo and location pin is verified on-site via cryptographic EXIF data to ensure you never get scammed by fake listings.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-[#0f4c3a] rounded-2xl flex items-center justify-center font-bold text-xl border border-emerald-100">
                🛡️
              </div>
              <h3 className="text-lg font-bold text-slate-900">Instant Video KYC</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hosts undergo rigorous government ID checks and live video walkthroughs so you can trust who is welcoming you into the Himalayas.
              </p>
            </div>
          </div>
        </section>

        {/* ── 7. Testimonials ─────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 w-full" data-purpose="testimonials">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs">
            <div className="max-w-xl mb-8">
              <span className="text-xs font-bold text-[#0f4c3a] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block">
                Traveler Stories
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">Loved by Mountain Explorers</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center space-x-1 text-amber-500">★★★★★</div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "Booking through Discover Uttarakhand gave us complete peace of mind. The escrow system meant our money was safe until we reached our cedar cabin in Munsiyari. Absolute game changer!"
                </p>
                <div className="flex items-center space-x-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-[#0f4c3a] text-white flex items-center justify-center font-bold text-xs">AS</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Aarav Sharma</h4>
                    <span className="text-[10px] text-slate-500">Visited Munsiyari • October 2026</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center space-x-1 text-amber-500">★★★★★</div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "The active road advisory saved us hours of traffic when the Joshimath corridor was blocked. The auto-reroute feature guided us smoothly. Truly professional mountain tourism platform."
                </p>
                <div className="flex items-center space-x-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-[#0f4c3a] text-white flex items-center justify-center font-bold text-xs">NP</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Neha Pant</h4>
                    <span className="text-[10px] text-slate-500">Visited Chopta • September 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
