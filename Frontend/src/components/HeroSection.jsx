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

  // AI Trip Concierge State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  const videoRefs = useRef([]);
  const voiceRecognitionRef = useRef(null);

  // Toggle Voice Search for AI Concierge
  const toggleVoiceSearch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
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
      rec.lang = 'hi-IN'; // Works for Hinglish & English
      rec.interimResults = true;
      rec.continuous = false;

      rec.onstart = () => {
        setIsListeningVoice(true);
      };

      rec.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(r => r[0].transcript)
          .join('');
        setAiPrompt(transcript);
      };

      rec.onerror = (event) => {
        console.warn("[VoiceAI] Error:", event.error);
        setIsListeningVoice(false);
      };

      rec.onend = () => {
        setIsListeningVoice(false);
      };

      voiceRecognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("[VoiceAI] Failed to start:", err);
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

  const handleAiSubmit = (e) => {
    if (e) e.preventDefault();
    const cleanPrompt = aiPrompt.trim();
    if (cleanPrompt) {
      navigate(`/planner?query=${encodeURIComponent(cleanPrompt)}`);
    } else {
      navigate('/planner');
    }
  };

  const handleChipClick = (chipQuery) => {
    setAiPrompt(chipQuery);
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/90 hover:bg-emerald-500 text-slate-950 font-semibold text-xs normal-case tracking-normal backdrop-blur-md shadow-md transition-all active:scale-95"
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

      {/* ── 2. AI TRIP PLANNER CARD ── */}
      <div className="relative z-20 w-[calc(100%-1.5rem)] md:w-[calc(100%-3rem)] max-w-7xl mx-auto mt-4 sm:mt-6">
        <form 
          onSubmit={handleAiSubmit}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl border border-stone-200/90 p-4 sm:p-6 transition-all"
        >
          {/* Top Label */}
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#0F2B1F] border border-emerald-200/80 text-[11px] font-bold tracking-wider uppercase">
              <Sparkles size={13} className="text-[#0F2B1F]" />
              <span>AI Trip Planner</span>
            </div>
            <span className="text-[11px] text-stone-500 font-medium hidden sm:inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Autonomous Itinerary Engine · Instant Mountain Route
            </span>
          </div>

          {/* Large Input Field with Mic */}
          <div className="relative flex items-center bg-stone-50/90 hover:bg-stone-50 focus-within:bg-white border-2 border-stone-200 focus-within:border-[#0F2B1F] rounded-xl sm:rounded-2xl p-1.5 sm:p-2 transition-all shadow-inner mb-3.5">
            <input
              type="text"
              placeholder={isListeningVoice ? "Listening... speak your destination or trip plan" : "Describe your dream journey... e.g. '3-day peaceful mountain retreat in Kumaon with local homestay'"}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 placeholder:text-stone-400 outline-none px-3 py-1.5"
            />
            {/* Mic Icon for Voice */}
            <button
              type="button"
              onClick={toggleVoiceSearch}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                isListeningVoice
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse ring-4 ring-rose-200'
                  : 'bg-white hover:bg-[#E8F5E9] text-slate-600 hover:text-[#0F2B1F] border-stone-200 shadow-xs'
              }`}
              title={isListeningVoice ? "Listening... click to stop" : "Voice Input (Speak your trip idea)"}
              aria-label="Voice search"
            >
              {isListeningVoice ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>

          {/* Bottom Row: 3 Quick Chips + Big Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {/* 3 Quick Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 sm:inline hidden mr-0.5">
                Suggestions:
              </span>
              {[
                { label: 'Snow Trek', icon: '❄️', query: '3-day snow trek near Chopta Tungnath' },
                { label: 'Char Dham', icon: '🛕', query: 'Char Dham sacred pilgrimage itinerary' },
                { label: 'Budget Retreat', icon: '💰', query: 'Affordable mountain homestay trip under 5000' }
              ].map((chip) => {
                const isSelected = aiPrompt === chip.query || (aiPrompt && chip.query.includes(aiPrompt));
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleChipClick(chip.query)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#0F2B1F] text-white border-[#0F2B1F] shadow-sm'
                        : 'bg-stone-100 hover:bg-[#E8F5E9] text-stone-700 hover:text-[#0F2B1F] border-stone-200 hover:border-emerald-300'
                    }`}
                  >
                    <span>{chip.icon}</span>
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Clean Professional Action Button */}
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm text-white bg-[#0F2B1F] hover:bg-[#163f2e] shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98 shrink-0"
            >
              <Sparkles size={15} className="text-emerald-300" />
              <span>Generate Itinerary →</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── 3. Live Safety Strip (Real Safety & Trust Network USP) ── */}
      <div className="relative z-20 w-[calc(100%-1.5rem)] md:w-[calc(100%-3rem)] max-w-7xl mx-auto mt-3 sm:mt-4">
        <div className="bg-[#0F2B1F] border border-emerald-800/40 rounded-2xl px-4 py-3 sm:py-3.5 shadow-lg flex items-center justify-between overflow-x-auto no-scrollbar gap-4 text-xs font-semibold text-emerald-100">
          {/* Item 1: Live Trekkers */}
          <Link
            to="/rescue-ops"
            className="flex items-center gap-2.5 shrink-0 hover:text-white transition-colors group"
            title="View Live SDRF Trekker Ops"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            </span>
            <span className="font-bold text-white">28 Active Trekkers</span>
            <span className="text-[10px] font-medium text-emerald-300/80 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-700/40 hidden md:inline">
              Active Trails
            </span>
          </Link>

          <span className="text-emerald-700/60 shrink-0 font-bold">•</span>

          {/* Item 2: SOS Ready */}
          <Link
            to="/rescue-ops"
            className="flex items-center gap-2.5 shrink-0 hover:text-white transition-colors group"
            title="SDRF Uttarakhand Emergency Operations"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span>
            </span>
            <span className="font-bold text-rose-200 group-hover:text-white transition-colors">SOS Mesh Ready</span>
            <span className="text-[10px] font-medium text-rose-200/80 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/40 hidden md:inline">
              SDRF Standby
            </span>
          </Link>

          <span className="text-emerald-700/60 shrink-0 font-bold">•</span>

          {/* Item 3: Offline Maps */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm">🛰️</span>
            <span className="font-bold text-white">Offline Maps</span>
            <span className="text-[10px] font-medium text-emerald-300/80 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-700/40 hidden md:inline">
              Zero Signal Cache
            </span>
          </div>

          <span className="text-emerald-700/60 shrink-0 font-bold">•</span>

          {/* Item 4: Escrow Safe */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm">🔒</span>
            <span className="font-bold text-white">Escrow Safe</span>
            <span className="text-[10px] font-medium text-emerald-300/80 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-700/40 hidden md:inline">
              Smart Payouts
            </span>
          </div>
        </div>
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
