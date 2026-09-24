import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DestinationMap from '../components/DestinationMap';
import FloatingTripBasket from '../components/planner/FloatingTripBasket';
import { getDestinationBySlug, getDestinationRelated } from '../api/destinationApi';
import { normalizeDiscoveryCandidate } from '../utils/discoveryAdapter';
import { useAuth } from '../context/AuthContext';
import { useMapStore } from '../store/mapStore';
import api from '../api/api';
import { 
  MapPin, 
  Star, 
  Calendar, 
  ArrowLeft, 
  Heart, 
  Mountain, 
  Compass, 
  Clock, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Share2,
  Check,
  Zap,
  Navigation,
  AlertTriangle,
  Radio,
  Search,
  ChevronLeft,
  X,
  Send,
  Hotel,
  Car,
  Activity as ActivityIcon
} from 'lucide-react';

const normalizeImgUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  let fixed = url;
  if (fixed.includes('upload.wikimedia.org/wikipedia/commons/thumb/')) {
    fixed = fixed.replace('upload.wikimedia.org/wikipedia/commons/thumb/', 'thumb.wikimedia.org/wikipedia/commons/thumb/');
  }
  if (fixed.includes('/1280px-')) {
    fixed = fixed.replace('/1280px-', '/1920px-');
  }
  return fixed;
};

// Fallback image helper
const getImageSrc = (record) => {
  if (!record) return 'https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=1200&auto=format&fit=crop';
  if (record.coverImage?.url) return normalizeImgUrl(record.coverImage.url);
  if (typeof record.coverImage === 'string' && record.coverImage.length > 0) return normalizeImgUrl(record.coverImage);
  if (record.image?.url) return normalizeImgUrl(record.image.url);
  if (typeof record.image === 'string' && record.image.length > 0) return normalizeImgUrl(record.image);
  if (Array.isArray(record.images) && record.images.length > 0) {
    const first = record.images[0];
    if (first?.url) return normalizeImgUrl(first.url);
    if (typeof first === 'string' && first.length > 0) return normalizeImgUrl(first);
  }
  if (Array.isArray(record.gallery) && record.gallery.length > 0) {
    const first = record.gallery[0];
    if (first?.url) return normalizeImgUrl(first.url);
    if (typeof first === 'string' && first.length > 0) return normalizeImgUrl(first);
  }
  return 'https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=1200&auto=format&fit=crop';
};

// High quality curated backup images for the 5-photo grid
const CURATED_HIMALAYAN_GALLERY = [
  'https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
];

export default function DestinationDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const { addTripDestination, tripDestinations, removeTripDestination } = useMapStore();

  const [destination, setDestination] = useState(null);
  const [related, setRelated] = useState(null);
  const [loadingDest, setLoadingDest] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [destError, setDestError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [activePhotoIdx, setActivePhotoIdx] = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);

  // SubHeader search bar state
  const [subSearch, setSubSearch] = useState('');

  const tripIds = useMemo(
    () => new Set((Array.isArray(tripDestinations) ? tripDestinations : []).map((d) => d._id || d.id || d.slug)),
    [tripDestinations]
  );

  const isInTrip = useMemo(() => {
    if (!destination) return false;
    return tripIds.has(destination._id) || tripIds.has(destination.slug) || tripIds.has(destination.id);
  }, [destination, tripIds]);

  // Parallel Data Fetching
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoadingDest(true);
    setLoadingRelated(true);
    setDestError(null);
    setShowFullAbout(false);
    setActivePhotoIdx(null);

    // 1. Fetch main destination data
    getDestinationBySlug(slug)
      .then((res) => {
        if (res && res.success && res.data) {
          setDestination(res.data);
        } else {
          setDestError('Destination not found');
        }
      })
      .catch((err) => {
        console.error('Error loading destination:', err);
        setDestError('Unable to load destination data');
      })
      .finally(() => {
        setLoadingDest(false);
      });

    // 2. Fetch related items
    getDestinationRelated(slug)
      .then((res) => {
        if (res && res.success && res.data) {
          setRelated(res.data);
        } else {
          setRelated({ thingsToDo: [], placesToVisit: [], stays: [], guides: [] });
        }
      })
      .catch((err) => {
        console.warn('Error fetching related data:', err);
        setRelated({ thingsToDo: [], placesToVisit: [], stays: [], guides: [] });
      })
      .finally(() => {
        setLoadingRelated(false);
      });
  }, [slug]);

  // Toggle Favorite
  const handleFavorite = (e) => {
    e.preventDefault();
    requireAuth(async () => {
      try {
        const destId = destination?._id || destination?.id;
        if (!destId) return;
        const res = await api.post(`/users/favorites/destination/${destId}`);
        if (res.data?.success) {
          setIsFavorite(res.data.action === 'added');
        }
      } catch (err) {
        console.error('Failed to toggle favorite', err);
      }
    });
  };

  // Toggle Add to Trip
  const handleToggleTrip = () => {
    if (!destination) return;
    useMapStore.getState().openAddToTripModal({
      id: destination._id || destination.slug || destination.id,
      name: destination.name,
      type: 'destination',
      location: destination.district || 'Uttarakhand',
      district: destination.district,
      image: getImageSrc(destination),
      rating: destination.rating || 4.8
    });
  };

  // Share link handler
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Submit to Copilot
  const handleCopilotSubmit = (e) => {
    e.preventDefault();
    const prompt = copilotPrompt.trim() || `Plan a high-altitude trip to ${destination?.name || 'Uttarakhand'}`;
    navigate(`/copilot?q=${encodeURIComponent(prompt)}`);
  };

  // Build 5 photos for the gallery grid
  const galleryPhotos = useMemo(() => {
    const list = [];
    if (destination) {
      const cover = getImageSrc(destination);
      if (cover) list.push(cover);

      if (Array.isArray(destination.gallery)) {
        destination.gallery.forEach((g) => {
          const src = typeof g === 'string' ? g : g?.url;
          if (src && !list.includes(src)) list.push(normalizeImgUrl(src));
        });
      }

      if (Array.isArray(destination.images)) {
        destination.images.forEach((img) => {
          const src = typeof img === 'string' ? img : img?.url;
          if (src && !list.includes(src)) list.push(normalizeImgUrl(src));
        });
      }
    }

    // Fill up to 5 items with curated fallbacks
    let fallbackIdx = 0;
    while (list.length < 5 && fallbackIdx < CURATED_HIMALAYAN_GALLERY.length) {
      const fb = CURATED_HIMALAYAN_GALLERY[fallbackIdx];
      if (!list.includes(fb)) list.push(fb);
      fallbackIdx++;
    }

    return list.slice(0, 5);
  }, [destination]);

  if (loadingDest) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6]">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 border-3 border-emerald-200 border-t-[#1b4332] rounded-full animate-spin mb-4" />
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wider">
            Loading {(slug || 'Destination').replace(/-/g, ' ')}…
          </h2>
          <p className="text-slate-500 text-xs mt-1">Connecting to Himalayan database</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (destError || !destination) {
    return (
      <div className="min-h-screen flex flex-col bg-[#faf9f6]">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {destError || 'Destination Not Found'}
          </h2>
          <p className="text-slate-500 text-sm max-w-md mb-6">
            The destination you are looking for might have been moved, renamed, or is currently unavailable.
          </p>
          <Link
            to="/#explore"
            className="bg-[#1b4332] text-white px-6 py-2.5 font-bold rounded-full hover:bg-[#143527] transition shadow-sm text-xs uppercase tracking-wider"
          >
            ← Return to Explore
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const aboutText = destination.description || destination.shortDescription || '';
  const isLongAbout = aboutText.length > 320;
  const bestTime = destination.bestTimeToVisit || 'May – October';
  const durationText = destination.idealDuration || destination.duration || '3 - 5 Days Trek';
  const ratingVal = destination.rating && destination.rating > 0 ? destination.rating : '4.8';
  const reviewCount = destination.reviewCount || 1240;

  const tags = destination.experiences?.length > 0
    ? destination.experiences
    : [destination.category || 'Trekking', 'Pilgrimage', 'Scenic View', 'Wilderness'];

  const thingsToDo = related?.thingsToDo || [];
  const stays = related?.stays || [];
  const guides = related?.guides || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfdfd] text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* ── 1. Top Navbar ───────────────────────────────────────── */}
      <Navbar />

      {/* ── 2. SubHeader Filters & Search Bar ─────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-6 py-2.5 shrink-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center flex-1 min-w-0 gap-2.5 overflow-x-auto no-scrollbar py-0.5">
            {/* Search Input */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (subSearch.trim()) {
                  navigate(`/destinations/${encodeURIComponent(subSearch.trim().toLowerCase())}`);
                }
              }}
              className="relative min-w-[240px] sm:min-w-[300px] shrink-0"
            >
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search places, districts, shrines..."
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                className="w-full pl-9 pr-12 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b4332]/30 focus:border-[#1b4332] transition-all"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
                ⌘K
              </kbd>
            </form>

            {/* Filter Chips with counts */}
            <Link
              to="/map"
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1b4332] text-white text-xs font-semibold shadow-xs"
            >
              <Compass size={12} />
              <span>All</span>
              <span className="bg-[#143527] px-1.5 py-0.2 rounded-full text-[10px] font-medium ml-0.5">206</span>
            </Link>

            <Link
              to="/#explore"
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition"
            >
              <Mountain size={12} className="text-slate-500" />
              <span>Destinations</span>
              <span className="text-slate-400 text-[11px]">93</span>
            </Link>

            <Link
              to="/spiritual"
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition"
            >
              <Sparkles size={12} className="text-amber-500" />
              <span>Spiritual</span>
              <span className="text-slate-400 text-[11px]">44</span>
            </Link>

            <Link
              to="/activities"
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition"
            >
              <ActivityIcon size={12} className="text-blue-500" />
              <span>Adventures</span>
              <span className="text-slate-400 text-[11px]">20</span>
            </Link>

            <Link
              to="/stays"
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition"
            >
              <Hotel size={12} className="text-emerald-600" />
              <span>Stays</span>
              <span className="text-slate-400 text-[11px]">49</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center text-xs font-medium text-slate-500 shrink-0">
            <span>206 of 206 places</span>
          </div>

        </div>
      </div>

      {/* ── 3. Hero Panoramic Header Strip ───────────────────────── */}
      <section className="relative bg-slate-950 text-white overflow-hidden">
        {/* Background Mountain Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={getImageSrc(destination)}
            alt={destination.name}
            className="w-full h-full object-cover object-center opacity-40 blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-3">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <Link to="/#explore" className="hover:text-white transition">Explore</Link>
            <span>/</span>
            <span className="hover:text-white transition">Uttarakhand</span>
            <span>/</span>
            <span>{destination.district || 'Kumaon'}</span>
            <span>/</span>
            <span className="text-slate-200 font-bold">{destination.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              {/* Category & Experience Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold border border-white/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-sm leading-tight">
                {destination.name}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-300 font-medium mt-1 flex items-center gap-2">
                <span>{destination.district} District, Uttarakhand</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">Elevation {destination.altitude || '5,945m'}</span>
              </p>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Favorite Button */}
              <button
                type="button"
                onClick={handleFavorite}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
                title="Save to Wishlist"
              >
                <Heart size={18} className={isFavorite ? 'fill-current text-rose-500' : ''} />
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
                title="Share Destination"
              >
                {copiedShare ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
              </button>

              {/* Add to Trip CTA */}
              <button
                type="button"
                onClick={handleToggleTrip}
                className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/95 hover:bg-white text-slate-900 transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
              >
                <Mountain size={14} className="text-emerald-800" />
                <span>Add to Trip Day</span>
              </button>

              {/* Prominent Plan Trip for [Destination] CTA */}
              <button
                type="button"
                onClick={() => {
                  useMapStore.getState().setPlannerForm({
                    destination: destination.name,
                    destinationId: destination._id || destination.slug,
                    origin: 'Dehradun, Uttarakhand'
                  });
                  navigate(`/trip-planner?destination=${encodeURIComponent(destination.name)}`);
                }}
                className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-all flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
              >
                <Sparkles size={14} className="text-slate-950" />
                <span>Plan Trip for {destination.name}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Context-Aware Quick-Action Marketplace Strip ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0f3d2e] flex items-center justify-center shrink-0 border border-emerald-200">
              <Compass size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                {destination.name} Travel Marketplace
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Context-filtered stays, vehicle rentals &amp; verified guides for {destination.name}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/stays?location=${encodeURIComponent(destination.name)}`}
              className="px-3.5 py-2 rounded-xl bg-stone-50 hover:bg-emerald-50 hover:text-[#0f3d2e] hover:border-emerald-300 border border-stone-200 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shadow-2xs"
            >
              <Hotel size={13} className="text-emerald-700" />
              <span>Find Stays in {destination.name}</span>
            </Link>

            <Link
              to={`/rentals?city=${encodeURIComponent(destination.district || destination.city || destination.name)}`}
              className="px-3.5 py-2 rounded-xl bg-stone-50 hover:bg-emerald-50 hover:text-[#0f3d2e] hover:border-emerald-300 border border-stone-200 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shadow-2xs"
            >
              <Car size={13} className="text-emerald-700" />
              <span>Rentals in {destination.name}</span>
            </Link>

            <Link
              to={`/activities?region=${encodeURIComponent(destination.district || destination.region || destination.name)}`}
              className="px-3.5 py-2 rounded-xl bg-stone-50 hover:bg-emerald-50 hover:text-[#0f3d2e] hover:border-emerald-300 border border-stone-200 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shadow-2xs"
            >
              <ActivityIcon size={13} className="text-emerald-700" />
              <span>Adventures &amp; Trails</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. Photo Gallery Grid (1 Large Left + 4 Right 2x2) ─────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          
          {/* Main Large Hero Image (Left 2 columns on desktop) */}
          <div 
            onClick={() => setActivePhotoIdx(0)}
            className="md:col-span-2 h-[300px] sm:h-[400px] md:h-[430px] rounded-2xl md:rounded-3xl overflow-hidden bg-slate-100 shadow-xs group cursor-pointer relative"
          >
            <img
              src={galleryPhotos[0]}
              alt={`${destination.name} main view`}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              View Fullscreen ↗
            </span>
          </div>

          {/* 4 Small Photos in 2x2 Grid (Right column) */}
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4 h-[300px] sm:h-[400px] md:h-[430px]">
            {galleryPhotos.slice(1, 5).map((photoSrc, idx) => (
              <div
                key={idx}
                onClick={() => setActivePhotoIdx(idx + 1)}
                className="h-[142px] sm:h-[192px] md:h-[207px] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 shadow-xs group cursor-pointer relative"
              >
                <img
                  src={photoSrc}
                  alt={`${destination.name} gallery ${idx + 2}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors" />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Lightbox Modal for Gallery View ── */}
      {activePhotoIdx !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setActivePhotoIdx(null)}
            className="absolute top-6 right-6 text-white hover:text-emerald-400 p-2 rounded-full bg-white/10"
          >
            <X size={24} />
          </button>
          
          <img
            src={galleryPhotos[activePhotoIdx]}
            alt="Fullscreen view"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />

          {/* Navigation Controls */}
          <div className="flex items-center gap-4 mt-4 text-white">
            <button
              onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : galleryPhotos.length - 1))}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-mono font-bold">
              {activePhotoIdx + 1} / {galleryPhotos.length}
            </span>
            <button
              onClick={() => setActivePhotoIdx((prev) => (prev < galleryPhotos.length - 1 ? prev + 1 : 0))}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ── 5. Key Facts Strip (Location, Best Season, Duration, Rating) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-6">
          
          {/* Fact 1: Location */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1b4332] flex items-center justify-center shrink-0 border border-emerald-100">
              <MapPin size={18} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Location
              </span>
              <p className="text-sm font-extrabold text-slate-900 leading-tight">
                {destination.district || 'Uttarakhand'}, India
              </p>
            </div>
          </div>

          {/* Fact 2: Best Season */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1b4332] flex items-center justify-center shrink-0 border border-emerald-100">
              <Calendar size={18} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Best Season
              </span>
              <p className="text-sm font-extrabold text-slate-900 leading-tight">
                {bestTime}
              </p>
            </div>
          </div>

          {/* Fact 3: Duration */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1b4332] flex items-center justify-center shrink-0 border border-emerald-100">
              <Clock size={18} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Duration
              </span>
              <p className="text-sm font-extrabold text-slate-900 leading-tight">
                {durationText}
              </p>
            </div>
          </div>

          {/* Fact 4: Rating */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Star size={18} className="fill-current" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Traveler Rating
              </span>
              <p className="text-sm font-extrabold text-slate-900 leading-tight flex items-center gap-1">
                <span>{ratingVal} / 5</span>
                <span className="text-xs font-normal text-slate-500">({reviewCount.toLocaleString()} reviews)</span>
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── 6. Main 2-Column Content Layout ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* ── Left Column: Overview, Highlights, Stays, Activities, Map ── */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Overview Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4 tracking-tight">
                Overview of {destination.name}
              </h2>
              <div className="text-slate-600 text-sm sm:text-base leading-relaxed space-y-4">
                <p className={`whitespace-pre-line ${!showFullAbout && isLongAbout ? 'line-clamp-6' : ''}`}>
                  {aboutText ||
                    `${destination.name} is one of the most sacred and picturesque destinations in Uttarakhand Himalayas. Surrounded by high-altitude glacial lakes, mystical valleys, and dramatic towering peaks, it offers a deeply spiritual and adventurous experience for travelers worldwide.`}
                </p>
                {isLongAbout && (
                  <button
                    type="button"
                    onClick={() => setShowFullAbout(!showFullAbout)}
                    className="text-[#1b4332] font-bold text-xs uppercase tracking-wider hover:underline pt-1 block cursor-pointer"
                  >
                    {showFullAbout ? 'Show Less ↑' : 'Read Full Overview ↓'}
                  </button>
                )}
              </div>

              {/* Highlights & Experience Badges */}
              {destination.highlights?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Key Highlights &amp; Attractions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {destination.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                      >
                        <Sparkles size={12} className="text-amber-500" />
                        <span>{h}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Geographical Map Section */}
            {destination.location?.coordinates && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      Geographical Location &amp; Terrain
                    </h3>
                    <p className="text-xs text-slate-500">
                      Coordinates: {destination.location.coordinates[1]}° N, {destination.location.coordinates[0]}° E
                    </p>
                  </div>
                  <Link
                    to="/map"
                    className="text-xs font-bold text-[#1b4332] hover:underline flex items-center gap-1"
                  >
                    <span>Full Map</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200 h-64 sm:h-80">
                  <DestinationMap
                    center={[destination.location.coordinates[1], destination.location.coordinates[0]]}
                    items={related}
                  />
                </div>
              </div>
            )}

            {/* Nearby Verified Stays */}
            {stays.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Verified Mountain Stays Nearby
                    </h3>
                    <p className="text-xs text-slate-500">
                      KMVN rest houses, alpine camps, and authentic homestays in {destination.district}
                    </p>
                  </div>
                  <Link
                    to="/stays"
                    className="text-xs font-bold text-[#1b4332] hover:underline"
                  >
                    View All Stays →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stays.slice(0, 4).map((stay) => {
                    const price = stay.price?.amount || stay.pricePerNight || '2,400';
                    return (
                      <div
                        key={stay._id || stay.slug}
                        className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-sm transition-all"
                      >
                        <div>
                          <div className="h-32 rounded-xl overflow-hidden bg-slate-200 mb-2.5">
                            <img
                              src={getImageSrc(stay)}
                              alt={stay.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                            {stay.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            📍 {stay.city || stay.district || destination.district}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Official Tariff</span>
                            <span className="text-sm font-extrabold text-[#1b4332]">₹{Number(price).toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-500"> / night</span></span>
                          </div>
                          <Link
                            to={`/stays/${stay.slug}`}
                            className="px-3 py-1.5 rounded-lg bg-[#1b4332] text-white text-xs font-bold hover:bg-[#143527] transition"
                          >
                            View Stay
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Things to Do & Adventures */}
            {thingsToDo.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Expeditions &amp; Treks Around {destination.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Curated adventures guided by certified mountaineers
                    </p>
                  </div>
                  <Link
                    to="/activities"
                    className="text-xs font-bold text-[#1b4332] hover:underline"
                  >
                    All Activities →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {thingsToDo.slice(0, 4).map((act) => (
                    <Link
                      key={act._id || act.slug}
                      to={`/activities/${act.slug}`}
                      className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center gap-3 hover:border-emerald-500/40 hover:shadow-sm transition-all group"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                        <img
                          src={getImageSrc(act)}
                          alt={act.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-bold text-[#1b4332] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                          {act.category || 'Adventure'}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs truncate mt-1 group-hover:text-[#1b4332] transition-colors">
                          {act.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          📍 {act.district || destination.district}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-[#1b4332] group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ── Right Column: AI Travel Copilot & Safety Cards ─────── */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 1. AI Travel Copilot Widget */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-slate-900 tracking-tight">AI Travel Copilot</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Online
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 leading-tight mb-2">
                Plan your {destination.name} journey
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                Get instant AI-generated itineraries, permit guidance, and weather updates tailored for high-altitude travel.
              </p>

              {/* Copilot Input Form */}
              <form onSubmit={handleCopilotSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`e.g. Best 4-day itinerary for ${destination.name}...`}
                    value={copilotPrompt}
                    onChange={(e) => setCopilotPrompt(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b4332]/30 focus:border-[#1b4332] transition"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-[#1b4332] hover:bg-[#143527] text-white rounded-lg transition-colors cursor-pointer"
                    title="Ask Copilot"
                  >
                    <Send size={12} />
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#1b4332] hover:bg-[#143527] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Zap size={14} className="fill-current text-emerald-300" />
                  <span>Ask AI Copilot for {destination.name}</span>
                </button>
              </form>
            </div>

            {/* 2. Inner Line Permit & Mountain Safety Card */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <ShieldCheck size={18} className="text-[#1b4332]" />
                <h4 className="font-extrabold text-sm text-slate-900">
                  Permit &amp; High-Altitude Safety
                </h4>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Inner Line Permit (ILP) Desk</strong>
                    <span>Required for border routes. E-Pass verified in &lt;24 hours via government portal.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Radio size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">24/7 Mountain SOS Rescue Desk</strong>
                    <span>Emergency satellite connectivity &amp; BRO route clearance desk (Helpline: 112 / 1364).</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">100% Escrow Protection</strong>
                    <span>Funds released only upon safe check-in at verified homestay/camps.</span>
                  </div>
                </div>
              </div>

              <Link
                to="/map"
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition block text-center mt-2"
              >
                <AlertTriangle size={13} className="text-amber-600" />
                <span>View Road &amp; Landslide Radar</span>
              </Link>
            </div>

            {/* 3. Quick Trip Basket CTA */}
            <div className="bg-emerald-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-1">
                  Trip Planning
                </span>
                <h4 className="text-lg font-black leading-tight mb-2">
                  Add {destination.name} to your itinerary
                </h4>
                <p className="text-xs text-emerald-200/80 mb-4 leading-relaxed">
                  Combine stays, permits, and guides into a seamless day-by-day smart schedule.
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleToggleTrip}
                    className="w-full py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs uppercase tracking-wider hover:bg-emerald-50 transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isInTrip ? <Check size={14} className="text-emerald-700" /> : <Mountain size={14} />}
                    <span>{isInTrip ? 'Saved in Itinerary' : 'Add to Trip Planner'}</span>
                  </button>

                  <Link
                    to="/trip-planner"
                    className="w-full py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold text-center transition"
                  >
                    Open Full Planner →
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Floating Trip Basket bottom widget if any destinations added */}
      <FloatingTripBasket />

      {/* Footer */}
      <Footer />

    </div>
  );
}
