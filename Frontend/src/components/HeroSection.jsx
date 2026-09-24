import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, MapPin, Calendar, Users, ArrowRight, Sparkles, 
  ChevronLeft, ChevronRight, Compass, Mic, MicOff
} from 'lucide-react';
import { getDestinations } from '../api/destinationApi';

// Clean, authentic travel destinations with guaranteed 1MB+ real photo assets
const INITIAL_SLIDES = [
  {
    name: 'Nainital',
    location: 'Naini Lake, Kumaon',
    altitude: '2,084m',
    tag: 'Lake City',
    src: '/assets/nainital.jpg',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-mountain-stream-flowing-down-a-valley-41549-large.mp4',
    type: 'video',
    slug: 'nainital',
    subtitle: 'Emerald lake reflections, pine ridges & colonial mountain charm.'
  },
  {
    name: 'Adi Kailash',
    location: 'Pithoragarh Border Valley',
    altitude: '5,945m',
    tag: 'Sacred Peak',
    src: '/assets/destinations/pithoragarh/gallery-1.jpg',
    videoSrc: null,
    type: 'image',
    slug: 'adi-kailash',
    subtitle: 'Divine Om Parvat peaks & sacred high-altitude Shiva pilgrimage trails.'
  },
  {
    name: 'Munsyari',
    location: 'Johar Valley, Pithoragarh',
    altitude: '2,200m',
    tag: 'Alpine Meadow',
    src: '/assets/destinations/munsiyari/cover.jpg',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-fog-over-the-mountain-forest-41551-large.mp4',
    type: 'video',
    slug: 'munsiyari',
    subtitle: 'Panoramic Panchachuli summits & virgin Himalayan bugyals.'
  },
  {
    name: 'Kedarnath',
    location: 'Mandakini Valley, Rudraprayag',
    altitude: '3,583m',
    tag: 'Sacred Yatra',
    src: '/assets/kedarnath.jpg',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-over-mountain-peaks-41548-large.mp4',
    type: 'video',
    slug: 'kedarnath',
    subtitle: 'Ancient Himalayan sanctity at 11,755 ft along sacred river trails.'
  }
];

const POPULAR_DESTINATIONS = [
  { name: 'Nainital', district: 'Nainital', tag: 'Lake City', slug: 'nainital' },
  { name: 'Adi Kailash & Om Parvat', district: 'Pithoragarh', tag: 'High-Altitude Trek', slug: 'adi-kailash' },
  { name: 'Munsyari', district: 'Pithoragarh', tag: 'Alpine Meadow', slug: 'munsiyari' },
  { name: 'Kedarnath Temple', district: 'Rudraprayag', tag: 'Sacred Yatra', slug: 'kedarnath' },
  { name: 'Auli Ski Meadow', district: 'Chamoli', tag: 'Winter & Panoramic', slug: 'auli' },
  { name: 'Valley of Flowers', district: 'Chamoli', tag: 'UNESCO Biosphere', slug: 'valley-of-flowers' },
];

// Curated 4 Category Pillars with 100% distinct, verified real high-resolution photos
const CURATED_PILLARS = [
  {
    title: 'Spiritual Yatras',
    subtitle: 'Char Dham, Panch Kedar & ancient Vedic shrines',
    tag: 'Sacred Shrines',
    images: [
      '/assets/kedarnath.jpg',
      '/assets/badrinath.jpg',
      '/assets/jageshwar.jpg',
      'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=85'
    ],
    fallbackImg: '/assets/kedarnath.jpg',
    link: '/spiritual',
    count: '50+ Shrines',
    places: ['Kedarnath', 'Badrinath', 'Tungnath', 'Jageshwar']
  },
  {
    title: 'High-Altitude Treks',
    subtitle: 'Glacial passes, alpine bugyals & peak expeditions',
    tag: 'Alpine Trails',
    images: [
      'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85'
    ],
    fallbackImg: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=85',
    link: '/activities',
    count: '50+ Trails',
    places: ['Valley of Flowers', 'Kuari Pass', 'Dayara Bugyal', 'Chopta']
  },
  {
    title: 'Alpine Stays & KMVN',
    subtitle: 'Authentic stone homestays, pine cottages & TRH lodges',
    tag: 'Mountain Stays',
    images: [
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85'
    ],
    fallbackImg: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=85',
    link: '/stays',
    count: '50+ Stays',
    places: ['KMVN TRH', 'Sarmoli Homestay', 'Pine Cottages', 'Wood Cabins']
  },
  {
    title: 'Culture & Living Heritage',
    subtitle: 'Aipan crafts, folklore festivals & ancient high valleys',
    tag: 'Pahadi Heritage',
    images: [
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85'
    ],
    fallbackImg: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=85',
    link: '/culture',
    count: '50+ Traditions',
    places: ['Chholiya Dance', 'Pahadi Architecture', 'Aipan Art', 'Mana Village']
  }
];

// Interactive Category Card with Story-Style (- - -) Photo Transition
function CategoryCard({ pillar, index }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const images = pillar.images && pillar.images.length > 0 ? pillar.images : [pillar.fallbackImg];

  // Auto-advance photos inside the card with offset delay
  useEffect(() => {
    const timer = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % images.length);
    }, 3200 + (index % 4) * 400);

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

  return (
    <Link
      to={pillar.link}
      className="w-[78vw] sm:w-auto shrink-0 snap-center group relative h-76 sm:h-84 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between p-5 bg-slate-950 border border-stone-200/80"
    >
      {/* Multiple Photos with Seamless Crossfade */}
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={pillar.title}
          onError={(e) => {
            if (pillar.fallbackImg && e.currentTarget.src !== pillar.fallbackImg) {
              e.currentTarget.src = pillar.fallbackImg;
            }
          }}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${
            idx === photoIndex ? 'opacity-100 scale-100 group-hover:scale-105 transition-transform duration-700' : 'opacity-0'
          }`}
        />
      ))}

      {/* Strong Multi-tier Cinematic Gradient Overlay for 100% Crisp White Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/20 pointer-events-none" />

      {/* Top Header: Story-style Dash Indicators (- - -) & Badges */}
      <div className="relative z-10 space-y-2.5">
        {/* Story Dash Indicators (- - - -) */}
        <div className="flex items-center gap-1.5 w-full">
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
                idx === photoIndex
                  ? 'bg-white shadow-xs'
                  : 'bg-white/30 hover:bg-white/60'
              }`}
              title={`Photo ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/25 shadow-xs">
            {pillar.tag}
          </span>
          <span className="text-xs font-semibold text-white bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/25">
            {pillar.count}
          </span>
        </div>
      </div>

      {/* Hover Chevrons for Manual Photo Switching */}
      <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <button
          type="button"
          onClick={handlePrev}
          className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white flex items-center justify-center pointer-events-auto transition-transform active:scale-95 cursor-pointer"
          aria-label="Previous photo"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white flex items-center justify-center pointer-events-auto transition-transform active:scale-95 cursor-pointer"
          aria-label="Next photo"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Bottom Details & Real Destination Chips */}
      <div className="relative z-10 text-white">
        <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1.5 text-white drop-shadow-md flex items-center justify-between">
          <span className="text-white">{pillar.title}</span>
          <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-all" />
        </h3>
        <p className="text-xs text-white/90 font-medium leading-relaxed mb-3 drop-shadow-xs">
          {pillar.subtitle}
        </p>

        {/* Authentic Place Chips */}
        {pillar.places && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/20">
            {pillar.places.map((place) => (
              <span
                key={place}
                className="text-[10px] font-semibold text-white bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/15 shadow-2xs"
              >
                {place}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function HeroSection() {
  const navigate = useNavigate();

  // Dynamic slides
  const [slides, setSlides] = useState(INITIAL_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoErrors, setVideoErrors] = useState({});

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [season, setSeason] = useState('May – Oct (Peak Season)');
  const [travelers, setTravelers] = useState('2 Travelers');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  const videoRefs = useRef([]);
  const voiceRecognitionRef = useRef(null);

  // Toggle Voice Search
  const toggleVoiceSearch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListeningVoice) {
      if (voiceRecognitionRef.current) {
        try { voiceRecognitionRef.current.stop(); } catch (err) {}
      }
      setIsListeningVoice(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'en-IN';
      rec.interimResults = true;
      rec.continuous = false;

      rec.onstart = () => {
        setIsListeningVoice(true);
      };

      rec.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(r => r[0].transcript)
          .join('');
        setSearchQuery(transcript);
        setIsDropdownOpen(true);
      };

      rec.onerror = (event) => {
        console.warn("[VoiceSearch] Error:", event.error);
        setIsListeningVoice(false);
      };

      rec.onend = () => {
        setIsListeningVoice(false);
      };

      voiceRecognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("[VoiceSearch] Failed to start:", err);
      setIsListeningVoice(false);
    }
  };

  // Fetch real images from database on mount with rock-solid fallbacks
  useEffect(() => {
    let isMounted = true;
    const fetchDbImages = async () => {
      try {
        const res = await getDestinations();
        const data = res?.data || (Array.isArray(res) ? res : []);
        if (data && data.length > 0 && isMounted) {
          const extractImg = (dest, fallback) => {
            if (!dest) return fallback;
            const img = dest.coverImage?.url || dest.coverImage || dest.gallery?.[0]?.url || dest.gallery?.[0] || dest.images?.[0]?.url || dest.images?.[0];
            return typeof img === 'string' && img.length > 5 && !img.includes('placeholder') ? img : fallback;
          };

          const dbNainital = data.find(d => d.slug?.includes('nainital') || d.name?.toLowerCase().includes('nainital'));
          const dbAdiKailash = data.find(d => d.slug?.includes('adi-kailash') || d.name?.toLowerCase().includes('kailash') || d.slug?.includes('pithoragarh'));
          const dbMunsyari = data.find(d => d.slug?.includes('muns') || d.name?.toLowerCase().includes('muns'));
          const dbKedarnath = data.find(d => d.slug?.includes('kedarnath') || d.name?.toLowerCase().includes('kedarnath'));

          setSlides([
            {
              name: 'Nainital',
              location: 'Naini Lake, Kumaon',
              altitude: '2,084m',
              tag: 'Lake City',
              src: extractImg(dbNainital, '/assets/nainital.jpg'),
              videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-mountain-stream-flowing-down-a-valley-41549-large.mp4',
              type: 'video',
              slug: dbNainital?.slug || 'nainital',
              subtitle: 'Emerald lake reflections, pine ridges & colonial mountain charm.'
            },
            {
              name: 'Adi Kailash',
              location: 'Pithoragarh Border Valley',
              altitude: '5,945m',
              tag: 'Sacred Peak',
              src: extractImg(dbAdiKailash, '/assets/destinations/pithoragarh/gallery-1.jpg'),
              videoSrc: null,
              type: 'image',
              slug: dbAdiKailash?.slug || 'adi-kailash',
              subtitle: 'Divine Om Parvat peaks & sacred high-altitude Shiva pilgrimage trails.'
            },
            {
              name: 'Munsyari',
              location: 'Johar Valley, Pithoragarh',
              altitude: '2,200m',
              tag: 'Alpine Meadow',
              src: extractImg(dbMunsyari, '/assets/destinations/munsiyari/cover.jpg'),
              videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-fog-over-the-mountain-forest-41551-large.mp4',
              type: 'video',
              slug: dbMunsyari?.slug || 'munsiyari',
              subtitle: 'Panoramic Panchachuli summits & virgin Himalayan bugyals.'
            },
            {
              name: 'Kedarnath',
              location: 'Mandakini Valley, Rudraprayag',
              altitude: '3,583m',
              tag: 'Sacred Yatra',
              src: extractImg(dbKedarnath, '/assets/kedarnath.jpg'),
              videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-over-mountain-peaks-41548-large.mp4',
              type: 'video',
              slug: dbKedarnath?.slug || 'kedarnath',
              subtitle: 'Ancient Himalayan sanctity at 11,755 ft along sacred river trails.'
            }
          ]);
        }
      } catch (e) {
        console.warn('Using authentic local asset fallback for hero slideshow', e);
      }
    };

    fetchDbImages();
    return () => { isMounted = false; };
  }, []);

  // 3.5-Second interval auto-advance slideshow
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearTimeout(timer);
  }, [currentIndex, slides.length]);

  const handleVideoError = (index) => {
    setVideoErrors((prev) => ({ ...prev, [index]: true }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const match = POPULAR_DESTINATIONS.find(
        (d) => d.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      );
      if (match) {
        navigate(`/destinations/${match.slug}`);
      } else {
        navigate(`/destinations/${encodeURIComponent(searchQuery.trim().toLowerCase().replace(/\s+/g, '-'))}`);
      }
    } else {
      navigate('/#explore');
    }
  };

  const currentMedia = slides[currentIndex] || slides[0];

  return (
    <section className="w-full font-sans pt-3 sm:pt-5 pb-16">
      
      {/* ── 1. Hero Visual Cinematic Slideshow Banner ── */}
      <div className="w-[calc(100%-1.5rem)] md:w-[calc(100%-3rem)] max-w-7xl mx-auto h-[440px] sm:h-[490px] md:h-[530px] rounded-3xl sm:rounded-4xl overflow-hidden relative shadow-2xl bg-stone-900 flex flex-col justify-between p-6 sm:p-10 md:p-14 text-white group">
        
        {/* Layered Background Media with Seamless Crossfade */}
        {slides.map((media, idx) => {
          const isActive = idx === currentIndex;
          const hasError = videoErrors[idx];

          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none ${
                isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10'
              }`}
            >
              {media.type === 'video' && media.videoSrc && !hasError ? (
                <video
                  ref={(el) => (videoRefs.current[idx] = el)}
                  src={media.videoSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  onError={() => handleVideoError(idx)}
                  className="w-full h-full object-cover object-center scale-102"
                />
              ) : (
                <img
                  src={media.src}
                  alt={media.name}
                  onError={(e) => { e.currentTarget.src = '/assets/nainital.jpg'; }}
                  className="w-full h-full object-cover object-center ken-burns-hero"
                />
              )}
            </div>
          );
        })}

        {/* Clean, balanced cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/55 z-1" />

        {/* Top Spacer */}
        <div className="relative z-10" />

        {/* ── Main Hero Typography & Dynamic Destination (Clickable) ── */}
        <div className="relative z-10 max-w-2xl mb-4 sm:mb-6">
          
          {/* Location & Altitude Pill */}
          <Link
            to={`/destinations/${currentMedia.slug}`}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-xs font-medium text-white/95 mb-3.5 shadow-xs transition-colors group/pill"
          >
            <MapPin size={13} className="text-emerald-300" />
            <span>{typeof currentMedia.location === 'string' ? currentMedia.location : (currentMedia.location?.name || currentMedia.district || 'Uttarakhand')}</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-200 font-semibold">{currentMedia.altitude}</span>
            <ArrowRight size={11} className="text-emerald-300 opacity-0 group-hover/pill:opacity-100 group-hover/pill:translate-x-0.5 transition-all" />
          </Link>

          {/* Clean, Bold White Hero Headline */}
          <Link to={`/destinations/${currentMedia.slug}`} className="block group/head">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-3 text-white drop-shadow-md">
              Experience Sacred{' '}
              <span 
                key={currentMedia.name}
                className="text-emerald-300 group-hover/head:underline decoration-emerald-400 underline-offset-8 transition-colors duration-500 inline-block hero-content-animate"
              >
                {currentMedia.name}.
              </span>
            </h1>
          </Link>

          {/* Clean 1-Line Subtitle */}
          <p 
            key={currentMedia.subtitle}
            className="text-sm sm:text-base text-white/90 font-medium leading-relaxed max-w-lg drop-shadow-xs hero-content-animate mb-3.5"
          >
            {currentMedia.subtitle}
          </p>

          {/* Direct Explore Destination Action Pill */}
          <Link
            to={`/destinations/${currentMedia.slug}`}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/90 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-md transition-all active:scale-95"
          >
            <span>Explore {currentMedia.name}</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* ── Slideshow Indicator Dots ── */}
        <div className="relative z-10 flex items-center gap-2">
          {slides.map((media, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                idx === currentIndex
                  ? 'w-8 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]'
                  : 'w-2 bg-white/40 hover:bg-white/75'
              }`}
              title={media.name}
            />
          ))}
        </div>

      </div>

      {/* ── 2. Standalone Search Bar (Cleanly Placed Below Hero Animation Card) ── */}
      <div className="relative z-20 w-[calc(100%-1.5rem)] md:w-[calc(100%-3rem)] max-w-7xl mx-auto mt-4 sm:mt-6">
        <form 
          onSubmit={handleSearchSubmit}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md border border-stone-200/90 p-2.5 sm:p-3.5 grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 text-slate-800 transition-shadow"
        >
          {/* Input 1: Destination Search (5 cols) */}
          <div className="sm:col-span-5 relative flex items-center px-3.5 py-2.5 rounded-xl hover:bg-stone-50 transition-colors">
            <MapPin size={18} className="text-[#0f3d2e] shrink-0 mr-3" />
            <div className="w-full min-w-0 pr-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
                Destination
              </label>
              <input
                type="text"
                placeholder={isListeningVoice ? "Listening... speak place name..." : "Where do you want to explore?"}
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>

            {/* Voice Search Button */}
            <button
              type="button"
              onClick={toggleVoiceSearch}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                isListeningVoice
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse ring-2 ring-rose-300'
                  : 'bg-stone-100 hover:bg-emerald-50 text-slate-500 hover:text-[#0f3d2e] border-stone-200/80'
              }`}
              title={isListeningVoice ? "Listening... click to stop" : "Voice Search (Speak place name)"}
              aria-label="Voice search"
            >
              {isListeningVoice ? <MicOff size={15} /> : <Mic size={15} />}
            </button>

            {/* Suggestions Dropdown */}
            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 p-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400">
                  Trending Mountain Destinations
                </div>
                {POPULAR_DESTINATIONS.map((pop) => (
                  <button
                    key={pop.slug}
                    type="button"
                    onClick={() => {
                      setSearchQuery(pop.name);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{pop.name}</div>
                      <div className="text-[11px] text-slate-400">{pop.district}</div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {pop.tag}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input 2: Dates / Season (3 cols) */}
          <div className="sm:col-span-3 flex items-center px-3 py-2 rounded-xl hover:bg-stone-50 transition-colors border-t sm:border-t-0 sm:border-l border-stone-200">
            <Calendar size={18} className="text-[#0f3d2e] shrink-0 mr-2.5" />
            <div className="w-full">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
                When
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
              >
                <option value="May – Oct (Peak Season)">May – Oct (Peak Yatra)</option>
                <option value="Autumn (Sep – Nov)">Autumn (Clear Skies)</option>
                <option value="Winter Snow (Dec – Feb)">Winter (Snow &amp; Ski)</option>
                <option value="Spring (Mar – Apr)">Spring (Rhododendrons)</option>
              </select>
            </div>
          </div>

          {/* Input 3: Travelers (2 cols) */}
          <div className="sm:col-span-2 flex items-center px-3 py-2 rounded-xl hover:bg-stone-50 transition-colors border-t sm:border-t-0 sm:border-l border-stone-200">
            <Users size={18} className="text-[#0f3d2e] shrink-0 mr-2.5" />
            <div className="w-full">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">
                Travelers
              </label>
              <select
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
              >
                <option value="1 Explorer">1 Explorer</option>
                <option value="2 Travelers">2 Travelers</option>
                <option value="Family (3-4)">Family (3-4)</option>
                <option value="Group (5+)">Group (5+)</option>
              </select>
            </div>
          </div>

          {/* Search Button (2 cols) */}
          <div className="sm:col-span-2 flex items-center">
            <button
              type="submit"
              className="w-full h-full min-h-[46px] bg-[#0f3d2e] hover:bg-[#09261c] text-white rounded-xl sm:rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-98"
            >
              <Search size={15} />
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── 3. Below Hero: Curated Categories Strip ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0f3d2e] block mb-1">
              Curated Himalayan Experiences
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Start Your Journey by Category
            </h2>
          </div>
          <Link
            to="/trip-planner"
            className="text-xs font-bold text-[#0f3d2e] hover:underline flex items-center gap-1"
          >
            <span>Custom AI Trip Planner</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Categories: Horizontal Swipeable Carousel on Mobile, 4-Column Grid on Tablet/Desktop */}
        <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4.5">
          {CURATED_PILLARS.map((pillar, idx) => (
            <CategoryCard key={pillar.title} pillar={pillar} index={idx} />
          ))}
        </div>
      </div>

    </section>
  );
}
