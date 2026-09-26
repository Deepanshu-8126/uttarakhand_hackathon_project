import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, ArrowRight, Sparkles, 
  ChevronLeft, ChevronRight, Mic
} from 'lucide-react';
import { getDestinations } from '../api/destinationApi';

// Rich, authentic Uttarakhand destinations & occasion-based spotlights
const DYNAMIC_OCCASION_SLIDES = [
  {
    name: 'Kedarnath Temple',
    location: 'Mandakini Valley, Rudraprayag',
    altitude: '3,583m',
    tag: 'Sacred Yatra',
    occasion: 'Char Dham Pilgrimage Spotlight',
    src: '/assets/yatra_sarthi/kedarnath.jpg',
    fallbackSrc: '/assets/kedarnath.jpg',
    slug: 'kedarnath',
    subtitle: 'Ancient Himalayan sanctity at 11,755 ft along sacred river trails.'
  },
  {
    name: 'Valley of Flowers',
    location: 'Bhyundar Valley, Chamoli',
    altitude: '3,658m',
    tag: 'UNESCO Biosphere',
    occasion: 'Alpine Meadow Bloom Season',
    src: '/assets/yatra_sarthi/valley_of_flowers.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1600&q=85',
    slug: 'valley-of-flowers',
    subtitle: 'Vibrant endemic alpine flora surrounded by towering snow-clad peaks.'
  },
  {
    name: 'Auli Ski Meadows',
    location: 'Joshimath, Chamoli',
    altitude: '2,800m',
    tag: 'Panoramic Bugyal',
    occasion: 'Nanda Devi 360° Panorama',
    src: '/assets/yatra_sarthi/auli.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
    slug: 'auli',
    subtitle: 'Asia’s highest ropeway, alpine meadows & pristine snow horizons.'
  },
  {
    name: 'Rishikesh Ganga Ghats',
    location: 'Triveni Ghat, Dehradun',
    altitude: '340m',
    tag: 'Yoga & River Aarti',
    occasion: 'Evening Maha Aarti & Rapids',
    src: '/assets/yatra_sarthi/rishikesh.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1600&q=85',
    slug: 'rishikesh',
    subtitle: 'Golden river reflections, meditative chanting & world-class rapids.'
  },
  {
    name: 'Chopta & Tungnath',
    location: 'Kedarnath Wildlife Sanctuary, Rudraprayag',
    altitude: '3,680m',
    tag: 'Highest Shiva Shrine',
    occasion: 'Mini Switzerland & Chandrashila',
    src: '/assets/yatra_sarthi/chopta.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85',
    slug: 'chopta',
    subtitle: 'Dense rhododendron forests, lush bugyals & 360° summit views.'
  },
  {
    name: 'Nainital Lake City',
    location: 'Naini Lake, Kumaon Hills',
    altitude: '2,084m',
    tag: 'Emerald Lake',
    occasion: 'Kumaoni Lake Promenade',
    src: '/assets/yatra_sarthi/nainital.jpg',
    fallbackSrc: '/assets/nainital.jpg',
    slug: 'nainital',
    subtitle: 'Emerald lake reflections, pine ridges & colonial mountain charm.'
  },
  {
    name: 'Badrinath Dham',
    location: 'Alaknanda Valley, Chamoli',
    altitude: '3,133m',
    tag: 'Maha Vishnu Shrine',
    occasion: 'Neelkanth Peak Darshan',
    src: '/assets/yatra_sarthi/badrinath.jpg',
    fallbackSrc: '/assets/badrinath.jpg',
    slug: 'badrinath',
    subtitle: 'Sacred hot water Tapt Kund springs below dramatic Neelkanth pyramid.'
  },
  {
    name: 'Munsyari Panchachuli',
    location: 'Johar Valley, Pithoragarh',
    altitude: '2,200m',
    tag: 'Alpenglow Peaks',
    occasion: 'Golden Hour 5-Peak Sunset',
    src: '/assets/destinations/munsiyari/cover.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=85',
    slug: 'munsiyari',
    subtitle: 'Panoramic Panchachuli summits, tribal looms & virgin Himalayan trails.'
  },
  {
    name: 'Jim Corbett National Park',
    location: 'Ramnagar, Nainital',
    altitude: '400m',
    tag: 'Tiger Wilderness',
    occasion: 'Wild Tiger Safari & Sal Forests',
    src: '/assets/yatra_sarthi/corbett.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85',
    slug: 'jim-corbett-national-park',
    subtitle: 'India’s oldest tiger sanctuary along the scenic Ramganga river.'
  },
  {
    name: 'Haridwar Har Ki Pauri',
    location: 'Haridwar Ghats',
    altitude: '314m',
    tag: 'Spiritual Gateway',
    occasion: 'Ganga Snan & Sacred Heritage',
    src: '/assets/yatra_sarthi/haridwar.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85',
    slug: 'haridwar',
    subtitle: 'Ancient Vedic gateway where the holy Ganges touches the plains.'
  },
  {
    name: 'Adi Kailash Sacred Peak',
    location: 'Vyás Valley, Pithoragarh',
    altitude: '5,945m',
    tag: 'Sacred Alpenglow',
    occasion: 'Golden Sunrise Darshan',
    src: '/assets/destinations/adi_kailash.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1600&q=85',
    slug: 'adi-kailash',
    subtitle: 'Golden sunrise illuminating the sacred Kumaon pinnacle above Parvati Sarovar.'
  },
  {
    name: 'Om Parvat & Lipulekh Pass',
    location: 'Indo-Tibetan Border, Pithoragarh',
    altitude: '5,590m',
    tag: 'Ancient High Pass',
    occasion: 'Himalayan Ridge & Sacred Trails',
    src: '/assets/destinations/om_parvat.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85',
    slug: 'om-parvat',
    subtitle: 'Breathtaking high-altitude pass adorned with sacred flags overlooking ancient border valleys.'
  },
  {
    name: 'Tungnath Summit & Meadows',
    location: 'Chopta Ridge, Rudraprayag',
    altitude: '3,680m',
    tag: 'Highest Shiva Temple',
    occasion: 'Snow Line & Chandrashila',
    src: '/assets/destinations/tungnath_summit.jpg',
    fallbackSrc: '/assets/yatra_sarthi/chopta.jpg',
    slug: 'chopta',
    subtitle: 'High alpine snow ridges and historic stone shrines rising above cloud inversion layers.'
  },
  {
    name: 'Kedarkantha Winter Bugyal',
    location: 'Govind Wildlife Sanctuary, Uttarkashi',
    altitude: '3,810m',
    tag: 'Summit Camp Panorama',
    occasion: 'White Winter Bugyal Expeditions',
    src: '/assets/destinations/uttarakhand_bugyal_panoramic.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85',
    slug: 'kedarkantha',
    subtitle: 'Vibrant yellow tent campsites perched across snow-dusted ridgelines under majestic Himalayan ranges.'
  },
  {
    name: 'Nanda Devi Alpine Realm',
    location: 'Nanda Devi Biosphere, Chamoli',
    altitude: '7,816m',
    tag: 'Highest Indian Peak',
    occasion: 'Dramatic Cloud Peak Ascents',
    src: '/assets/destinations/nanda_devi_clouds.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=85',
    slug: 'nanda-devi-national-park',
    subtitle: 'Legendary sacred twin summits soaring high above sea of swirling Himalayan cloud cascades.'
  }
];

// Curated 4 Category Pillars with distinct verified photos
const CURATED_PILLARS = [
  {
    title: 'Spiritual Yatras',
    subtitle: 'Char Dham, Panch Kedar & ancient Vedic shrines',
    tag: 'Sacred Shrines',
    images: [
      '/assets/destinations/adi_kailash.jpg',
      '/assets/yatra_sarthi/kedarnath.jpg',
      '/assets/yatra_sarthi/badrinath.jpg',
      '/assets/yatra_sarthi/haridwar.jpg'
    ],
    fallbackImg: '/assets/destinations/adi_kailash.jpg',
    link: '/spiritual',
    count: '50+ Shrines',
    places: ['Adi Kailash', 'Kedarnath', 'Badrinath', 'Tungnath']
  },
  {
    title: 'High-Altitude Treks',
    subtitle: 'Glacial passes, alpine bugyals & peak expeditions',
    tag: 'Alpine Trails',
    images: [
      '/assets/destinations/om_parvat.jpg',
      '/assets/destinations/tungnath_summit.jpg',
      '/assets/destinations/chopta_snow_camp.jpg',
      '/assets/yatra_sarthi/valley_of_flowers.jpg'
    ],
    fallbackImg: '/assets/destinations/om_parvat.jpg',
    link: '/activities',
    count: '50+ Trails',
    places: ['Om Parvat Pass', 'Kuari Pass', 'Valley of Flowers', 'Chopta']
  },
  {
    title: 'Alpine Stays & KMVN',
    subtitle: 'Authentic stone homestays, pine cottages & TRH lodges',
    tag: 'Mountain Stays',
    images: [
      '/assets/destinations/chopta_snow_camp.jpg',
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=85'
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
      '/assets/destinations/om_parvat.jpg',
      '/assets/yatra_sarthi/nainital.jpg',
      '/assets/yatra_sarthi/corbett.jpg',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=85'
    ],
    fallbackImg: '/assets/destinations/om_parvat.jpg',
    link: '/culture',
    count: '50+ Traditions',
    places: ['Chholiya Dance', 'Pahadi Architecture', 'Aipan Art', 'Mana Village']
  }
];

// Interactive Category Card with Story-Style Photo Transition
function CategoryCard({ pillar, index }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const images = pillar.images && pillar.images.length > 0 ? pillar.images : [pillar.fallbackImg];

  useEffect(() => {
    const timer = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % images.length);
    }, 3800 + (index % 4) * 400);

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

      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/20 pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 space-y-2.5">
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

      {/* Hover Chevrons */}
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

      {/* Bottom Details */}
      <div className="relative z-10 text-white">
        <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1.5 text-white drop-shadow-md flex items-center justify-between">
          <span className="text-white">{pillar.title}</span>
          <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-all" />
        </h3>
        <p className="text-xs text-white/90 font-medium leading-relaxed mb-3 drop-shadow-xs">
          {pillar.subtitle}
        </p>

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

  // Dynamic slides with occasion intelligence
  const [slides, setSlides] = useState(DYNAMIC_OCCASION_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // AI Trip Concierge State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const voiceRecognitionRef = useRef(null);

  // Determine current occasion / time of day banner
  const timeBasedOccasion = useMemo(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 11) {
      return { title: 'Morning Darshan & Sunrise Aarti', tag: 'Dawn in Devbhoomi' };
    }
    if (currentHour >= 11 && currentHour < 16) {
      return { title: 'Alpine Bugyals & Glacial Treks', tag: 'Daylight Expeditions' };
    }
    if (currentHour >= 16 && currentHour < 20) {
      return { title: 'Golden Hour Alpenglow & Lake Ghats', tag: 'Sunset Spotlight' };
    }
    return { title: 'Himalayan Stargazing & Sacred Shrines', tag: 'Night Sky Panorama' };
  }, []);

  // Fetch real images from database on mount and merge with occasion slides
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

          const merged = DYNAMIC_OCCASION_SLIDES.map(slide => {
            const found = data.find(d => 
              d.slug === slide.slug || 
              d.name?.toLowerCase().includes(slide.slug.replace(/-/g, ' ')) ||
              d.slug?.includes(slide.slug)
            );
            return {
              ...slide,
              src: extractImg(found, slide.src),
              altitude: found?.altitude ? `${found.altitude}m` : slide.altitude
            };
          });

          setSlides(merged);
        }
      } catch (e) {
        console.warn('Using authentic verified local assets for hero slideshow', e);
      }
    };

    fetchDbImages();
    return () => { isMounted = false; };
  }, []);

  // 4.5-Second smooth auto-rotation
  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearTimeout(timer);
  }, [currentIndex, slides.length, isPaused]);

  const handlePrevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

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
      rec.lang = 'hi-IN';
      rec.interimResults = true;
      rec.continuous = false;

      rec.onstart = () => setIsListeningVoice(true);
      rec.onresult = (event) => {
        const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
        setAiPrompt(transcript);
      };
      rec.onerror = () => setIsListeningVoice(false);
      rec.onend = () => setIsListeningVoice(false);

      voiceRecognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("[VoiceAI] Failed to start:", err);
      setIsListeningVoice(false);
    }
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
      <div 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="w-[calc(100%-1.25rem)] sm:w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] max-w-7xl mx-auto h-[390px] sm:h-[480px] md:h-[530px] rounded-2xl sm:rounded-4xl overflow-hidden relative shadow-2xl bg-stone-900 flex flex-col justify-between p-4 sm:p-10 md:p-14 text-white group"
      >
        
        {/* Layered Background Media with Seamless Crossfade & Ken Burns */}
        {slides.map((media, idx) => {
          const isActive = idx === currentIndex;

          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none ${
                isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10'
              }`}
            >
              <img
                src={media.src}
                alt={media.name}
                onError={(e) => { 
                  if (media.fallbackSrc && e.currentTarget.src !== media.fallbackSrc) {
                    e.currentTarget.src = media.fallbackSrc;
                  } else {
                    e.currentTarget.src = '/assets/yatra_sarthi/nainital.jpg';
                  }
                }}
                className="w-full h-full object-cover object-center ken-burns-hero"
              />
            </div>
          );
        })}

        {/* Clean, balanced cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/55 z-1" />

        {/* Top Header: Minimal Occasion & Live Spotlight Tag */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-xs font-medium text-stone-200 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-none text-emerald-300 font-semibold">{currentMedia.occasion || timeBasedOccasion.title}</span>
          </div>

          {/* Slide Indicator Dots / Count */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-xs text-white/80 font-mono">
            <span>{currentIndex + 1}</span>
            <span className="text-white/40">/</span>
            <span>{slides.length}</span>
          </div>
        </div>

        {/* ── Main Hero Typography & Dynamic Destination ── */}
        <div className="relative z-10 max-w-2xl mb-2 sm:mb-6">
          
          {/* Location & Altitude Pill */}
          <Link
            to={`/destinations/${currentMedia.slug}`}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-medium text-white/95 mb-2 sm:mb-3.5 shadow-xs transition-colors group/pill"
          >
            <MapPin size={12} className="text-emerald-300" />
            <span className="truncate max-w-[140px] sm:max-w-none">{currentMedia.location}</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-200 font-semibold">{currentMedia.altitude}</span>
            <ArrowRight size={11} className="text-emerald-300 opacity-0 group-hover/pill:opacity-100 group-hover/pill:translate-x-0.5 transition-all" />
          </Link>

          {/* Clean, Bold White Hero Headline */}
          <Link to={`/destinations/${currentMedia.slug}`} className="block group/head">
            <h1 className="text-2xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] mb-2 sm:mb-3 text-white drop-shadow-md">
              Experience Sacred{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-white underline decoration-emerald-400/40 decoration-wavy decoration-1 underline-offset-4 group-hover/head:decoration-emerald-300 transition-colors">
                {currentMedia.name}
              </span>
            </h1>
          </Link>

          {/* Direct, high-signal description */}
          <p className="text-xs sm:text-base text-white/90 font-medium max-w-xl leading-relaxed drop-shadow-sm line-clamp-2">
            {currentMedia.subtitle}
          </p>
        </div>

        {/* ── Interactive Manual Arrows on Hover ── */}
        <button
          type="button"
          onClick={handlePrevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-95 cursor-pointer shadow-lg"
          aria-label="Previous destination"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          onClick={handleNextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-95 cursor-pointer shadow-lg"
          aria-label="Next destination"
        >
          <ChevronRight size={18} />
        </button>

        {/* ── Bottom Carousel Indicator Bars ── */}
        <div className="relative z-10 flex items-center gap-1.5 w-full max-w-sm pt-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                idx === currentIndex
                  ? 'bg-emerald-400 flex-2 shadow-xs'
                  : 'bg-white/30 hover:bg-white/60 flex-1'
              }`}
              title={`Jump to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>

      {/* ── 2. Unified Intelligent Trip Search Bar ── */}
      <div className="w-[calc(100%-1.25rem)] sm:w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] max-w-5xl mx-auto -mt-6 sm:-mt-9 relative z-20">
        <form 
          onSubmit={handleAiSubmit}
          className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 shadow-2xl border border-stone-200/80 hover:border-emerald-500/40 transition-all duration-200"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            
            {/* Input with Sparkle Indicator */}
            <div className="flex-1 flex items-center gap-3 px-3 py-2 w-full">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Where to? e.g. '3-day Kedarnath trek from Rishikesh under ₹8,000'"
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none"
              />
            </div>

            {/* Voice & Submit Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pr-1">
              <button
                type="button"
                onClick={toggleVoiceSearch}
                title="Voice Search"
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all cursor-pointer ${
                  isListeningVoice 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                <Mic size={16} />
              </button>

              <button
                type="submit"
                className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Plan Trip</span>
                <ArrowRight size={15} />
              </button>
            </div>

          </div>

          {/* Quick Filter Prompt Chips */}
          <div className="flex items-center gap-1.5 pt-2.5 sm:pt-3 px-2 overflow-x-auto no-scrollbar text-[11px] text-stone-500 border-t border-stone-100 mt-2">
            <span className="font-semibold text-stone-400 shrink-0">Popular:</span>
            {[
              "Valley of Flowers 4 Days",
              "Kedarnath Budget Yatra",
              "Auli Ski & Snow",
              "Rishikesh Weekend Stays",
              "Chopta Tungnath Trek"
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-transparent text-stone-600 font-medium transition-colors shrink-0 cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* ── 3. Four Core Experience Pillars (Story Style Rotating Photos) ── */}
      <div className="w-[calc(100%-1.25rem)] sm:w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] max-w-7xl mx-auto mt-12 sm:mt-16">
        <div className="flex items-center justify-between mb-6 px-1">
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Explore Uttarakhand By Experience
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
              Curated Himalayan journeys, high-altitude expeditions & sacred shrines
            </p>
          </div>
          <Link
            to="/explore"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:translate-x-0.5 transition-all"
          >
            <span>View All Destinations</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 snap-x">
          {CURATED_PILLARS.map((pillar, idx) => (
            <CategoryCard key={idx} pillar={pillar} index={idx} />
          ))}
        </div>
      </div>

    </section>
  );
}
