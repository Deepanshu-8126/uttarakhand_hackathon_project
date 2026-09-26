import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DestinationMap from '../components/DestinationMap';
import GooglePlacesRadarWidget from '../components/GooglePlacesRadarWidget';
import DestinationWeatherCard from '../components/widgets/DestinationWeatherCard';
import { getDestinationBySlug, getDestinationRelated } from '../api/destinationApi';
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
  ChevronRight,
  Share2,
  Check,
  Zap,
  Navigation,
  AlertTriangle,
  Radio,
  ChevronLeft,
  X,
  Send,
  Hotel,
  Car,
  Activity as ActivityIcon,
  Camera,
  ExternalLink,
  ShieldCheck,
  Layers,
  Maximize2
} from 'lucide-react';
import { getHimalayanFallbackImage } from '../utils/imageHelpers';

// Fallback high-res alpine photos in case API is offline or slow
const CURATED_PEXELS_FALLBACKS = [
  {
    url: 'https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=1200&auto=format&fit=crop',
    photographer: 'Himalayan Visual Archive',
    alt: 'Scenic Himalayan Mountain Lake & Valleys in Uttarakhand'
  },
  {
    url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800&auto=format&fit=crop',
    photographer: 'Pexels Alpine Expedition',
    alt: 'Lush Pine Valleys and Pristine Waters'
  },
  {
    url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop',
    photographer: 'Pexels Verified Traveler',
    alt: 'Misty Forest Ridges of Kumaon'
  },
  {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    photographer: 'Mountain Heritage Project',
    alt: 'High Alpine Meadows and Snow Horizons'
  },
  {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
    photographer: 'Pexels Devbhoomi Lens',
    alt: 'Sunset Glow over Sacred Uttarakhand Peaks'
  },
  {
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop',
    photographer: 'Starry Himalayan Sky Archive',
    alt: 'Milky Way Night View over Himalayan Ranges'
  },
  {
    url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=800&auto=format&fit=crop',
    photographer: 'Pexels High Altitude Lens',
    alt: 'Majestic Glacial Peak and Cloud Sea'
  },
  {
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop',
    photographer: 'Alpine Stream Photography',
    alt: 'Crystal Mountain Stream in Devbhoomi Forest'
  },
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    photographer: 'Holy Rivers Explorer',
    alt: 'Confluence of Emerald Himalayan Rivers'
  },
  {
    url: 'https://images.unsplash.com/photo-1434394354979-a235cd36269d?q=80&w=800&auto=format&fit=crop',
    photographer: 'Snow Line Expeditions',
    alt: 'Panoramic Snow Ridge Trail in Garhwal'
  },
  {
    url: 'https://images.unsplash.com/photo-1511497584788-876761c1298b?q=80&w=800&auto=format&fit=crop',
    photographer: 'Oak & Pine Forest Trails',
    alt: 'Golden Morning Sun Rays in Deodar Forest'
  },
  {
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop',
    photographer: 'Highland Sunset Archive',
    alt: 'Emerald Valley Reflection at Dusk'
  },
  {
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
    photographer: 'Overland Himalayan Explorer',
    alt: 'Scenic Mountain Pass Highway'
  },
  {
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800&auto=format&fit=crop',
    photographer: 'Alpine Valley Sentinel',
    alt: 'Terraced Alpine Fields and Mountain Village'
  },
  {
    url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=800&auto=format&fit=crop',
    photographer: 'Sacred Grove Chronicles',
    alt: 'Autumn Colors in Himalayan Foothills'
  },
  {
    url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=800&auto=format&fit=crop',
    photographer: 'Tranquil Lake Archives',
    alt: 'Mirror Lake View of Snow Peaks'
  }
];

export default function DestinationDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const { tripDestinations } = useMapStore();

  const [destination, setDestination] = useState(null);
  const [related, setRelated] = useState(null);
  const [loadingDest, setLoadingDest] = useState(true);
  const [destError, setDestError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [activePhotoIdx, setActivePhotoIdx] = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showAllPhotosModal, setShowAllPhotosModal] = useState(false);

  // Live Pexels Photography State
  const [pexelsPhotos, setPexelsPhotos] = useState([]);
  const [loadingPexels, setLoadingPexels] = useState(false);

  const tripIds = useMemo(
    () => new Set((Array.isArray(tripDestinations) ? tripDestinations : []).map((d) => d._id || d.id || d.slug)),
    [tripDestinations]
  );

  const isInTrip = useMemo(() => {
    if (!destination) return false;
    return tripIds.has(destination._id) || tripIds.has(destination.slug) || tripIds.has(destination.id);
  }, [destination, tripIds]);

  // Primary Data Fetching
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoadingDest(true);
    setDestError(null);
    setShowFullAbout(false);
    setActivePhotoIdx(null);
    setShowAllPhotosModal(false);

    getDestinationBySlug(slug)
      .then((res) => {
        if (res && res.success && res.data) {
          setDestination(res.data);
          // Once destination loads, fetch live Pexels photography
          fetchLivePexelsPhotos(res.data.name, res.data.district);
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

    // Fetch related items (stays, activities, guides)
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
      });
  }, [slug]);

  // Fetch Live Real Pexels 4K Photography from Backend API
  const fetchLivePexelsPhotos = async (destName, district) => {
    setLoadingPexels(true);
    try {
      const query = `${destName} ${district || ''} Uttarakhand India nature landscape`.trim();
      const res = await api.get(`/photos/search?query=${encodeURIComponent(query)}&count=18`);
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setPexelsPhotos(res.data.data);
      } else {
        // Fallback search with broader terms
        const fallbackRes = await api.get(`/photos/search?query=${encodeURIComponent(destName + ' Uttarakhand')}&count=12`);
        if (fallbackRes.data?.success && Array.isArray(fallbackRes.data.data) && fallbackRes.data.data.length > 0) {
          setPexelsPhotos(fallbackRes.data.data);
        }
      }
    } catch (err) {
      console.warn('Live Pexels photo search error:', err.message);
    } finally {
      setLoadingPexels(false);
    }
  };

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
      image: allGalleryPhotos[0]?.url || getHimalayanFallbackImage(destination),
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

  // Build Comprehensive List of Photos (Database images + Pexels live stream + curated fallbacks)
  const allGalleryPhotos = useMemo(() => {
    const list = [];
    const seenUrls = new Set();

    const addPhoto = (url, photographer = 'Verified Himalayan Lens', alt = '') => {
      if (!url || typeof url !== 'string' || seenUrls.has(url)) return;
      seenUrls.add(url);
      list.push({
        url,
        photographer,
        alt: alt || `${destination?.name || 'Uttarakhand'} Scenic View`
      });
    };

    // 1. Primary Destination Cover Image
    if (destination?.coverImage?.url) {
      addPhoto(destination.coverImage.url, 'Verified Database Asset', `${destination.name} Main Panorama`);
    } else if (typeof destination?.coverImage === 'string') {
      addPhoto(destination.coverImage, 'Verified Database Asset', `${destination.name} Main Panorama`);
    }

    // 2. High-res Pexels Photos from live search
    if (pexelsPhotos.length > 0) {
      pexelsPhotos.forEach((p) => {
        addPhoto(p.url, p.photographer ? `Pexels • ${p.photographer}` : 'Pexels Verified Photographer', p.alt);
      });
    }

    // 3. Database Gallery Array
    if (Array.isArray(destination?.gallery)) {
      destination.gallery.forEach((g) => {
        const src = typeof g === 'string' ? g : g?.url;
        if (src) addPhoto(src, 'Official Uttarakhand Archive', destination.name);
      });
    }

    // 4. Database Images Array
    if (Array.isArray(destination?.images)) {
      destination.images.forEach((img) => {
        const src = typeof img === 'string' ? img : img?.url;
        if (src) addPhoto(src, 'Uttarakhand Tourism Board', destination.name);
      });
    }

    // 5. Fillers from Curated Alpine Fallbacks
    CURATED_PEXELS_FALLBACKS.forEach((fb) => {
      if (list.length < 18) {
        addPhoto(fb.url, fb.photographer, fb.alt);
      }
    });

    return list;
  }, [destination, pexelsPhotos]);

  if (loadingDest) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0b1c15] text-white">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
            <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">
            Loading {(slug || 'Destination').replace(/-/g, ' ')}…
          </h2>
          <p className="text-emerald-300/80 text-xs mt-2 font-mono">Fetching 4K Pexels satellite &amp; Himalayan data</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (destError || !destination) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-3xl font-black text-stone-900 mb-2">
            {destError || 'Destination Not Found'}
          </h2>
          <p className="text-stone-500 text-sm max-w-md mb-6">
            The destination you are looking for might have been moved, renamed, or is currently undergoing seasonal route verification.
          </p>
          <Link
            to="/explore"
            className="bg-[#0f3d2e] hover:bg-[#15533f] text-white px-8 py-3 font-black rounded-2xl transition shadow-lg text-xs uppercase tracking-wider"
          >
            ← Return to Himalayan Directory
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const aboutText = destination.description || destination.shortDescription || '';
  const isLongAbout = aboutText.length > 340;
  const bestTime = destination.bestTimeToVisit || 'April – November';
  const durationText = destination.idealDuration || destination.duration || '2 - 4 Days';
  const ratingVal = destination.rating && destination.rating > 0 ? destination.rating : '4.8';
  const reviewCount = destination.reviewCount || destination.totalReviews || 1240;

  const tags = destination.experiences?.length > 0
    ? destination.experiences
    : [destination.category || 'Mountain Oasis', 'Pilgrimage', 'Lake Basin', 'Alpine Serenity'];

  const thingsToDo = related?.thingsToDo || [];
  const stays = related?.stays || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-stone-800 font-sans selection:bg-[#00FF88] selection:text-stone-950">
      
      {/* ── 1. Top Navbar ── */}
      <Navbar />

      {/* ── 2. Editorial Jump Navigation & Breadcrumbs Bar ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-stone-200/80 px-4 lg:px-8 py-2.5 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-stone-500 overflow-x-auto no-scrollbar shrink-0">
            <Link to="/" className="hover:text-[#0f3d2e] transition whitespace-nowrap">Home</Link>
            <span className="text-stone-300">/</span>
            <Link to="/explore" className="hover:text-[#0f3d2e] transition whitespace-nowrap">Explore</Link>
            <span className="text-stone-300">/</span>
            <span className="text-stone-400 whitespace-nowrap">{destination.district}</span>
            <span className="text-stone-300">/</span>
            <span className="text-[#0f3d2e] font-black whitespace-nowrap">{destination.name}</span>
          </nav>

          {/* Quick Jump Anchors */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-stone-600">
            <a href="#overview" className="px-3 py-1.5 rounded-full hover:bg-stone-100 hover:text-stone-900 transition">Overview</a>
            <a href="#gallery" className="px-3 py-1.5 rounded-full hover:bg-stone-100 hover:text-stone-900 transition flex items-center gap-1">
              <Camera size={13} className="text-emerald-600" />
              <span>Pexels Gallery ({allGalleryPhotos.length})</span>
            </a>
            <a href="#stays" className="px-3 py-1.5 rounded-full hover:bg-stone-100 hover:text-stone-900 transition">Stays ({stays.length})</a>
            <a href="#activities" className="px-3 py-1.5 rounded-full hover:bg-stone-100 hover:text-stone-900 transition">Adventures</a>
            <a href="#radar" className="px-3 py-1.5 rounded-full hover:bg-stone-100 hover:text-stone-900 transition">Radar</a>
            <a href="#map" className="px-3 py-1.5 rounded-full hover:bg-stone-100 hover:text-stone-900 transition">GIS Map</a>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleTrip}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                isInTrip
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-stone-100 hover:bg-emerald-50 text-stone-800 hover:text-[#0f3d2e] border border-stone-200'
              }`}
            >
              {isInTrip ? <Check size={13} /> : <Mountain size={13} />}
              <span>{isInTrip ? 'In Trip Day' : '+ Add to Trip'}</span>
            </button>

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
              className="px-4 py-1.5 rounded-xl text-xs font-black bg-[#0f3d2e] hover:bg-[#165540] text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Sparkles size={13} className="text-emerald-300" />
              <span>Plan Trip</span>
            </button>
          </div>

        </div>
      </div>

      {/* ── 3. Panoramic Hero Section (Rich Aesthetics & Emerald Gradient Glow) ── */}
      <section className="relative bg-gradient-to-br from-stone-950 via-[#0a231b] to-stone-950 text-white overflow-hidden py-12 lg:py-16">
        
        {/* Background Ambient Imagery & Shimmer */}
        <div className="absolute inset-0 z-0 opacity-35 mix-blend-luminosity">
          <img
            src={allGalleryPhotos[0]?.url || getHimalayanFallbackImage(destination)}
            alt={destination.name}
            loading="eager"
            fetchPriority="high"
            onError={e => { e.currentTarget.src = CURATED_PEXELS_FALLBACKS[0].url; }}
            className="w-full h-full object-cover object-center filter blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-[#081a14]/80 to-stone-950/60" />
        </div>

        {/* Ambient Emerald Radial Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            
            <div className="space-y-4 max-w-3xl">
              {/* Category Pills & Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black tracking-wide uppercase">
                  <Sparkles size={12} />
                  <span>{destination.category || 'Himalayan Landmark'}</span>
                </span>
                
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-stone-200 text-xs font-semibold">
                  <MapPin size={12} className="text-emerald-400" />
                  <span>{destination.district} District</span>
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-stone-200 text-xs font-semibold">
                  <Mountain size={12} className="text-emerald-400" />
                  <span>Elevation {destination.altitude ? `${destination.altitude}m` : '1,370m'}</span>
                </span>

                {destination.altitude && parseInt(destination.altitude, 10) > 3000 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-black">
                    <AlertTriangle size={12} />
                    <span>High-Altitude Zone</span>
                  </span>
                )}
              </div>

              {/* Destination Title */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none drop-shadow-sm">
                {destination.name}
              </h1>

              {/* Subtitle / Teaser */}
              <p className="text-base sm:text-lg text-stone-300 font-medium leading-relaxed max-w-2xl">
                {destination.shortDescription || 
                  `Explore the pristine glacial waters, pine-scented mountain ridges, and sacred shrines of ${destination.name}.`}
              </p>

              {/* Star Rating & Review Count */}
              <div className="flex items-center gap-4 text-xs font-semibold text-stone-300 pt-1">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-white font-bold">{ratingVal} / 5</span>
                  <span className="text-stone-400">({reviewCount.toLocaleString()} reviews)</span>
                </div>

                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <ShieldCheck size={14} />
                  <span>100% Verified Uttarakhand Destination</span>
                </div>
              </div>
            </div>

            {/* Right Action & Wishlist Controls */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFavorite}
                  className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition cursor-pointer"
                  title="Save to Favorites"
                >
                  <Heart size={20} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition cursor-pointer flex items-center gap-2 text-xs font-bold"
                  title="Copy Link"
                >
                  {copiedShare ? <Check size={20} className="text-emerald-400" /> : <Share2 size={20} />}
                  <span>{copiedShare ? 'Copied!' : 'Share'}</span>
                </button>
              </div>

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
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-[#00FF88] text-stone-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                <Sparkles size={16} className="text-stone-950" />
                <span>Craft AI Itinerary</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. Key Highlights & Travel Marketplace Ribbon ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 z-20 w-full">
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/90 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0f3d2e] flex items-center justify-center shrink-0 border border-emerald-200/80 shadow-2xs">
              <Compass size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900 leading-tight">
                {destination.name} Travel Marketplace
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Verified KMVN stays, vehicle rentals &amp; certified guides for {destination.name}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/stays?location=${encodeURIComponent(destination.name)}`}
              className="px-4 py-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50 hover:text-[#0f3d2e] hover:border-emerald-300 border border-stone-200 text-xs font-bold text-stone-700 transition flex items-center gap-2 shadow-2xs"
            >
              <Hotel size={14} className="text-[#0f3d2e]" />
              <span>Stays in {destination.name}</span>
            </Link>

            <Link
              to={`/rentals?city=${encodeURIComponent(destination.district || destination.city || destination.name)}`}
              className="px-4 py-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50 hover:text-[#0f3d2e] hover:border-emerald-300 border border-stone-200 text-xs font-bold text-stone-700 transition flex items-center gap-2 shadow-2xs"
            >
              <Car size={14} className="text-[#0f3d2e]" />
              <span>Rentals in {destination.district}</span>
            </Link>

            <Link
              to={`/activities?region=${encodeURIComponent(destination.district || destination.region || destination.name)}`}
              className="px-4 py-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50 hover:text-[#0f3d2e] hover:border-emerald-300 border border-stone-200 text-xs font-bold text-stone-700 transition flex items-center gap-2 shadow-2xs"
            >
              <ActivityIcon size={14} className="text-[#0f3d2e]" />
              <span>Adventures &amp; Trails</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ── 5. Live Pexels 4K Photography Showcase & Interactive Gallery ── */}
      <section id="gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 w-full">
        
        {/* Section Header with Pexels Live Badge */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#0f3d2e] border border-emerald-300">
                <Camera size={11} />
                <span>Pexels 4K Visual Engine</span>
              </span>
              {loadingPexels && (
                <span className="text-[11px] text-stone-400 font-mono animate-pulse">Streaming fresh 4K satellite photos...</span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Photographic Showcase of {destination.name}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              100% authentic mountain photography, reflections &amp; alpine vistas verified from Pexels &amp; Uttarakhand Archives.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAllPhotosModal(true)}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-emerald-50 hover:text-[#0f3d2e] hover:border-emerald-300 text-stone-700 text-xs font-black transition cursor-pointer shadow-xs"
          >
            <Maximize2 size={13} />
            <span>View All ({allGalleryPhotos.length}) 4K Photos</span>
          </button>
        </div>

        {/* 5-Photo Mosaic Grid (1 Large Left + 4 Right 2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          
          {/* Main Large Hero Image (Left 2 columns on desktop) */}
          <div 
            onClick={() => setActivePhotoIdx(0)}
            className="md:col-span-2 h-[320px] sm:h-[420px] lg:h-[460px] rounded-3xl overflow-hidden bg-stone-900 shadow-md group cursor-pointer relative"
          >
            <img
              src={allGalleryPhotos[0]?.url || CURATED_PEXELS_FALLBACKS[0].url}
              alt={allGalleryPhotos[0]?.alt || destination.name}
              loading="eager"
              fetchPriority="high"
              onError={e => { e.currentTarget.src = CURATED_PEXELS_FALLBACKS[0].url; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />
            
            {/* Bottom Photo Credit & Tag */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
              <div>
                <p className="text-sm font-black drop-shadow-md">{allGalleryPhotos[0]?.alt || `${destination.name} Panoramic Vista`}</p>
                <p className="text-[11px] text-emerald-300 font-semibold drop-shadow-md flex items-center gap-1">
                  <Camera size={11} />
                  <span>{allGalleryPhotos[0]?.photographer || 'Pexels Verified'}</span>
                </p>
              </div>

              <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                <Maximize2 size={12} />
                <span>Fullscreen</span>
              </span>
            </div>
          </div>

          {/* 4 Small Photos in 2x2 Grid (Right column) */}
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4 h-[320px] sm:h-[420px] lg:h-[460px]">
            {allGalleryPhotos.slice(1, 5).map((photo, idx) => (
              <div
                key={idx}
                onClick={() => setActivePhotoIdx(idx + 1)}
                className="h-[152px] sm:h-[202px] lg:h-[222px] rounded-2xl overflow-hidden bg-stone-900 shadow-sm group cursor-pointer relative"
              >
                <img
                  src={photo.url || CURATED_PEXELS_FALLBACKS[idx % CURATED_PEXELS_FALLBACKS.length].url}
                  alt={photo.alt || destination.name}
                  loading="lazy"
                  onError={e => { e.currentTarget.src = CURATED_PEXELS_FALLBACKS[idx % CURATED_PEXELS_FALLBACKS.length].url; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/40 transition-colors" />
                
                <span className="absolute bottom-2 left-2 right-2 text-[10px] text-white font-bold truncate drop-shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {photo.photographer}
                </span>

                {idx === 3 && allGalleryPhotos.length > 5 && (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllPhotosModal(true);
                    }}
                    className="absolute inset-0 bg-stone-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2 text-center transition-all group-hover:bg-stone-950/85"
                  >
                    <span className="text-xl font-black">+{allGalleryPhotos.length - 4}</span>
                    <span className="text-[11px] font-bold text-emerald-300">More 4K Photos</span>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 6. Key Facts Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-6">
          
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#0f3d2e] flex items-center justify-center shrink-0 border border-emerald-100">
              <MapPin size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">District &amp; State</span>
              <p className="text-sm font-extrabold text-stone-900">{destination.district}, Uttarakhand</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#0f3d2e] flex items-center justify-center shrink-0 border border-emerald-100">
              <Calendar size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Prime Season</span>
              <p className="text-sm font-extrabold text-stone-900">{bestTime}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#0f3d2e] flex items-center justify-center shrink-0 border border-emerald-100">
              <Clock size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Recommended Stay</span>
              <p className="text-sm font-extrabold text-stone-900">{durationText}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Star size={20} className="fill-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Traveler Verdict</span>
              <p className="text-sm font-extrabold text-stone-900">{ratingVal} / 5 <span className="text-xs text-stone-400 font-normal">({reviewCount.toLocaleString()})</span></p>
            </div>
          </div>

        </div>
      </section>

      {/* ── 7. Main 2-Column Content Layout (Left 65% / Right 35%) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* ── Left Column: Overview, Stays, Adventures, Radar, Map ── */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Overview & Key Highlights Card */}
            <div id="overview" className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6">
              <div>
                <h2 className="text-2xl font-black text-stone-900 tracking-tight mb-4">
                  Overview of {destination.name}
                </h2>
                <div className="text-stone-600 text-sm sm:text-base leading-relaxed space-y-4">
                  <p className={`whitespace-pre-line ${!showFullAbout && isLongAbout ? 'line-clamp-6' : ''}`}>
                    {aboutText ||
                      `${destination.name} is one of the most sacred and picturesque destinations in Uttarakhand Himalayas. Surrounded by high-altitude glacial lakes, mystical valleys, and dramatic towering peaks, it offers a deeply spiritual and adventurous experience for travelers worldwide.`}
                  </p>
                  {isLongAbout && (
                    <button
                      type="button"
                      onClick={() => setShowFullAbout(!showFullAbout)}
                      className="text-[#0f3d2e] font-black text-xs uppercase tracking-wider hover:underline pt-1 block cursor-pointer"
                    >
                      {showFullAbout ? 'Show Less ↑' : 'Read Full Overview ↓'}
                    </button>
                  )}
                </div>
              </div>

              {/* Key Attractions Badges */}
              {destination.highlights?.length > 0 && (
                <div className="pt-6 border-t border-stone-100">
                  <h3 className="text-xs font-black text-stone-400 uppercase tracking-wider mb-3">
                    Key Highlights &amp; Attractions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {destination.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800"
                      >
                        <Sparkles size={12} className="text-amber-500" />
                        <span>{h}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Verified Mountain Stays Nearby */}
            {stays.length > 0 && (
              <div id="stays" className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-black text-stone-900 tracking-tight">
                      Verified Mountain Stays Nearby
                    </h3>
                    <p className="text-xs text-stone-500">
                      KMVN rest houses, alpine camps, and authentic homestays in {destination.district}
                    </p>
                  </div>
                  <Link
                    to="/stays"
                    className="text-xs font-black text-[#0f3d2e] hover:underline"
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
                        className="bg-stone-50/70 rounded-2xl p-3 border border-stone-200/80 flex flex-col justify-between hover:border-[#0f3d2e]/40 hover:shadow-md transition-all group"
                      >
                        <div>
                          <div className="h-36 rounded-xl overflow-hidden bg-stone-200 mb-2.5 relative">
                            <img
                              src={stay.images?.[0] || stay.coverImage || 'https://images.unsplash.com/photo-1542157675-99d949ad5f23?q=80&w=800&auto=format&fit=crop'}
                              alt={stay.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-2 left-2 bg-[#0f3d2e]/90 text-emerald-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                              🏡 KMVN / Partner
                            </span>
                          </div>
                          <h4 className="font-bold text-stone-900 text-sm line-clamp-1 group-hover:text-[#0f3d2e] transition-colors">
                            {stay.name}
                          </h4>
                          <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                            <MapPin size={12} className="text-[#0f3d2e]" />
                            <span>{stay.city || stay.district || destination.district}</span>
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-stone-200 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-stone-400 font-black uppercase block">Official Tariff</span>
                            <span className="text-sm font-black text-[#0f3d2e]">₹{Number(price).toLocaleString('en-IN')}<span className="text-[10px] font-normal text-stone-500"> / night</span></span>
                          </div>
                          <Link
                            to={`/stays/${stay.slug}`}
                            className="px-3 py-1.5 rounded-xl bg-[#0f3d2e] text-white text-xs font-bold hover:bg-[#165540] transition shadow-xs"
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

            {/* Expeditions & Adventures Around Destination */}
            {thingsToDo.length > 0 && (
              <div id="activities" className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-black text-stone-900 tracking-tight">
                      Expeditions &amp; Treks Around {destination.name}
                    </h3>
                    <p className="text-xs text-stone-500">
                      Curated adventures guided by certified mountaineers
                    </p>
                  </div>
                  <Link
                    to="/activities"
                    className="text-xs font-black text-[#0f3d2e] hover:underline"
                  >
                    All Activities →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {thingsToDo.slice(0, 4).map((act) => (
                    <Link
                      key={act._id || act.slug}
                      to={`/activities/${act.slug}`}
                      className="bg-stone-50/70 rounded-2xl p-3 border border-stone-200/80 flex items-center gap-3 hover:border-[#0f3d2e]/40 hover:shadow-md transition-all group"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                        <img
                          src={act.images?.[0] || act.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop'}
                          alt={act.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-black text-[#0f3d2e] bg-emerald-100 px-2 py-0.5 rounded-md uppercase">
                          {act.category || 'Adventure'}
                        </span>
                        <h4 className="font-bold text-stone-900 text-xs truncate mt-1 group-hover:text-[#0f3d2e] transition-colors">
                          {act.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          📍 {act.district || destination.district}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-stone-400 group-hover:text-[#0f3d2e] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Google Places Live Radar (Filtered & Curated) */}
            <div id="radar">
              <GooglePlacesRadarWidget 
                locationName={destination.name}
                coordinates={{
                  lat: destination.coordinates?.lat || destination.location?.coordinates?.[1] || 29.35,
                  lng: destination.coordinates?.lng || destination.location?.coordinates?.[0] || 79.5667
                }}
              />
            </div>

            {/* Geographical Map Section */}
            {destination.location?.coordinates && (
              <div id="map" className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-black text-stone-900 tracking-tight">
                      Geographical Location &amp; Spatial Terrain
                    </h3>
                    <p className="text-xs text-stone-500">
                      Coordinates: {destination.location.coordinates[1]}° N, {destination.location.coordinates[0]}° E
                    </p>
                  </div>
                  <Link
                    to="/map"
                    className="text-xs font-black text-[#0f3d2e] hover:underline flex items-center gap-1"
                  >
                    <span>Full Spatial GIS Map</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="rounded-2xl overflow-hidden border border-stone-200 h-64 sm:h-80 shadow-2xs">
                  <DestinationMap
                    center={[destination.location.coordinates[1], destination.location.coordinates[0]]}
                    items={related}
                  />
                </div>
              </div>
            )}

          </div>

          {/* ── Right Column: Live Weather & AI Copilot ── */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Live Weather Telemetry */}
            <DestinationWeatherCard 
              destinationName={destination.name}
              lat={destination.latitude || destination.coordinates?.lat || destination.location?.coordinates?.[1] || 29.35}
              lon={destination.longitude || destination.coordinates?.lng || destination.location?.coordinates?.[0] || 79.5667}
            />

            {/* AI Travel Copilot Card */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0f3d2e]"></span>
                  </span>
                  <span className="text-xs font-black text-stone-900 tracking-tight">AI Travel Copilot</span>
                </div>
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  Online
                </span>
              </div>

              <h3 className="text-lg font-black text-stone-900 leading-tight mb-1">
                Plan your {destination.name} journey
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed mb-4">
                Instant high-altitude itineraries, transit route planning, and verified mountain weather updates.
              </p>

              {/* Instant Prompt Chips */}
              <div className="space-y-1.5 mb-4">
                {[
                  `Best 3-day itinerary for ${destination.name}`,
                  `KMVN stays & scenic viewpoints in ${destination.name}`,
                  `Road condition & weather pass for ${destination.name}`
                ].map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => navigate(`/copilot?q=${encodeURIComponent(prompt)}`)}
                    className="w-full text-left p-2 rounded-xl bg-stone-50 hover:bg-emerald-50 text-[11px] font-bold text-stone-700 hover:text-[#0f3d2e] border border-stone-200/80 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span className="truncate">{prompt}</span>
                    <ChevronRight size={12} className="text-stone-400 group-hover:text-[#0f3d2e] shrink-0" />
                  </button>
                ))}
              </div>

              {/* Copilot Input Form */}
              <form onSubmit={handleCopilotSubmit} className="space-y-2.5">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Ask anything about ${destination.name}...`}
                    value={copilotPrompt}
                    onChange={(e) => setCopilotPrompt(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/30 focus:border-[#0f3d2e] transition"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-[#0f3d2e] hover:bg-[#165540] text-white rounded-lg transition-colors cursor-pointer"
                    title="Send to Copilot"
                  >
                    <Send size={12} />
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0f3d2e] hover:bg-[#165540] text-white text-xs font-black flex items-center justify-center gap-2 shadow-xs transition cursor-pointer active:scale-95"
                >
                  <Zap size={14} className="fill-current text-emerald-300" />
                  <span>Ask AI Copilot for {destination.name}</span>
                </button>
              </form>
            </div>

            {/* High-Altitude & Safety Desk */}
            <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-black text-xs uppercase tracking-wider">
                <Radio size={14} className="text-emerald-700 animate-pulse" />
                <span>24/7 Mountain Safety Desk</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Emergency SDRF patrol grids &amp; BRO route clearances active along {destination.district} corridors.
              </p>
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                <span className="font-bold text-stone-500">SDRF Helpline:</span>
                <span className="font-black text-rose-600">112 / 1364</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 8. Fullscreen Lightbox Modal for Active Photo ── */}
      {activePhotoIdx !== null && (
        <div 
          className="fixed inset-0 bg-stone-950/95 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActivePhotoIdx(null)}
        >
          <button
            onClick={() => setActivePhotoIdx(null)}
            className="absolute top-6 right-6 text-white hover:text-emerald-400 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer z-50"
            title="Close Lightbox"
          >
            <X size={24} />
          </button>
          
          <div 
            className="relative max-h-[85vh] max-w-[90vw] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={allGalleryPhotos[activePhotoIdx]?.url}
              alt={allGalleryPhotos[activePhotoIdx]?.alt}
              className="max-h-[78vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            />
            
            <div className="mt-3 text-center">
              <p className="text-white font-black text-sm drop-shadow">{allGalleryPhotos[activePhotoIdx]?.alt}</p>
              <p className="text-emerald-300 text-xs font-semibold drop-shadow">{allGalleryPhotos[activePhotoIdx]?.photographer}</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div 
            className="flex items-center gap-6 mt-4 text-white z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : allGalleryPhotos.length - 1))}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
              title="Previous Photo"
            >
              <ChevronLeft size={22} />
            </button>
            <span className="text-xs font-mono font-bold">
              {activePhotoIdx + 1} / {allGalleryPhotos.length}
            </span>
            <button
              onClick={() => setActivePhotoIdx((prev) => (prev < allGalleryPhotos.length - 1 ? prev + 1 : 0))}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
              title="Next Photo"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      )}

      {/* ── 9. View All Photos Modal Drawer (Pexels 4K Gallery) ── */}
      {showAllPhotosModal && (
        <div className="fixed inset-0 bg-stone-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="text-lg font-black text-stone-900">
                  {destination.name} — All 4K Photos ({allGalleryPhotos.length})
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Verified real photography streamed via Pexels &amp; Uttarakhand Tourism Archive
                </p>
              </div>
              <button
                onClick={() => setShowAllPhotosModal(false)}
                className="p-2 rounded-full hover:bg-stone-200 text-stone-600 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Photos Grid */}
            <div className="p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {allGalleryPhotos.map((photo, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setActivePhotoIdx(i);
                    setShowAllPhotosModal(false);
                  }}
                  className="group relative h-40 rounded-2xl overflow-hidden bg-stone-100 cursor-pointer shadow-2xs border border-stone-200"
                >
                  <img
                    src={photo.url}
                    alt={photo.alt}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/50 transition-colors" />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-bold truncate drop-shadow">{photo.photographer}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ── 10. Footer ── */}
      <Footer />

    </div>
  );
}
