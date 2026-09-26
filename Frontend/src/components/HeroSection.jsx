import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, ArrowRight, Sparkles, 
  ChevronLeft, ChevronRight, Mic,
  Compass, Calendar, ShieldCheck, Smartphone, Mountain
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
    name: 'Kedarkantha 360° Summit',
    location: 'Govind Pashu Vihar, Uttarkashi',
    altitude: '3,810m',
    tag: 'Classic Winter Summit',
    occasion: 'Golden Peak Horizon & Snow Slopes',
    src: '/assets/destinations/kedarkantha_summit_view.jpg',
    fallbackSrc: '/assets/destinations/uttarakhand_bugyal_panoramic.jpg',
    slug: 'kedarkantha',
    subtitle: 'Dramatic 360-degree snow-clad panoramic views of Swargarohini, Bandarpoonch & Black Peak.'
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

// Curated Categories Filter Options
const CURATED_CATEGORIES = ['All', 'Trekking', 'Spiritual', 'Offbeat', 'Nature'];

// Curated Experiences featured data matching authentic Uttarakhand locales
const CURATED_EXPERIENCES = [
  {
    id: 'munsiyari',
    title: 'Munsiyari Eco-Retreat',
    category: 'Offbeat',
    badge: 'Offbeat',
    badgeBg: 'bg-amber-600/90 text-white',
    subtitle: 'Experience the untouched beauty of the Panchachuli peaks.',
    src: '/assets/destinations/munsiyari/cover.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85',
    link: '/destinations/munsiyari',
    featured: true
  },
  {
    id: 'jageshwar',
    title: 'Jageshwar Dham',
    category: 'Spiritual',
    badge: 'Spiritual',
    badgeBg: 'bg-emerald-700/90 text-white',
    subtitle: 'Ancient temples amidst dense deodar forests.',
    src: '/assets/jageshwar.jpg',
    fallbackSrc: '/assets/destinations/adi_kailash.jpg',
    link: '/spiritual',
    featured: true
  },
  {
    id: 'valley-of-flowers',
    title: 'Valley of Flowers',
    category: 'Trekking',
    badge: 'Trekking',
    badgeBg: 'bg-teal-700/90 text-white',
    subtitle: 'Vibrant alpine meadows blooming with endemic wildflowers.',
    src: '/assets/yatra_sarthi/valley_of_flowers.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=85',
    link: '/destinations/valley-of-flowers-national-park',
    featured: false
  },
  {
    id: 'deoria-tal',
    title: 'Deoria Tal',
    category: 'Nature',
    badge: 'Nature',
    badgeBg: 'bg-emerald-800/90 text-white',
    subtitle: 'Emerald mountain lake with Chaukhamba mirror reflections.',
    src: '/assets/destinations/chandrashila_sunset_snow.jpg',
    fallbackSrc: '/assets/yatra_sarthi/chopta.jpg',
    link: '/destinations/chopta',
    featured: false
  },
  {
    id: 'kedarkantha',
    title: 'Kedarkantha Summit',
    category: 'Trekking',
    badge: 'Trekking',
    badgeBg: 'bg-teal-700/90 text-white',
    subtitle: '360° snow-clad ridge panoramas in Govind Pashu Vihar.',
    src: '/assets/destinations/kedarkantha_summit_view.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
    link: '/activities',
    featured: false
  },
  {
    id: 'adi-kailash',
    title: 'Adi Kailash & Om Parvat',
    category: 'Spiritual',
    badge: 'Spiritual',
    badgeBg: 'bg-emerald-700/90 text-white',
    subtitle: 'Golden sunrise illuminating sacred Kumaon pinnacles.',
    src: '/assets/destinations/adi_kailash.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=85',
    link: '/spiritual',
    featured: false
  }
];

// 5-Step Seamless Journeys Roadmap
const JOURNEY_STEPS = [
  {
    id: 'discover',
    title: 'Discover',
    desc: 'Find curated experiences that match your travel style.',
    icon: Compass,
    isHighlighted: false
  },
  {
    id: 'plan',
    title: 'Plan',
    desc: 'Customize itineraries with our smart planner.',
    icon: Calendar,
    isHighlighted: false
  },
  {
    id: 'verify',
    title: 'Verify',
    desc: 'Connect with vetted local partners and experts.',
    icon: ShieldCheck,
    isHighlighted: false
  },
  {
    id: 'book',
    title: 'Book',
    desc: 'Secure your stays, transport, and guides instantly.',
    icon: Smartphone,
    isHighlighted: false
  },
  {
    id: 'travel',
    title: 'Travel',
    desc: 'Embark on your unforgettable eco-luxe journey.',
    icon: Mountain,
    isHighlighted: true
  }
];

// Curated Experience Card (Matches screenshot layout)
function CuratedExperienceCard({ item, isLarge = false }) {
  return (
    <Link
      to={item.link}
      className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block bg-stone-900 border border-stone-200/60 ${
        isLarge ? 'h-64 sm:h-80 md:h-84' : 'h-56 sm:h-64 md:h-72'
      }`}
    >
      {/* High-res authentic destination photography */}
      <img
        src={item.src}
        alt={item.title}
        onError={(e) => {
          if (item.fallbackSrc && e.currentTarget.src !== item.fallbackSrc) {
            e.currentTarget.src = item.fallbackSrc;
          }
        }}
        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
      />

      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

      {/* Card Content at Bottom Left */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10">
        <span className={`inline-block text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-md mb-1.5 shadow-xs ${item.badgeBg}`}>
          {item.badge}
        </span>
        <h3 className="text-base sm:text-xl font-black text-white tracking-tight leading-snug drop-shadow-sm group-hover:text-emerald-200 transition-colors">
          {item.title}
        </h3>
        {item.subtitle && (
          <p className="text-[11px] sm:text-xs text-stone-200/90 font-medium mt-0.5 line-clamp-2 drop-shadow-xs max-w-md">
            {item.subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}

// "View All Destinations" Navigation Card
function ViewAllCard() {
  return (
    <Link
      to="/explore"
      className="group relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 bg-stone-100 hover:bg-stone-200/80 border border-stone-200/90 flex flex-col items-center justify-center p-6 text-center h-56 sm:h-64 md:h-72"
    >
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-stone-200/80 group-hover:bg-[#0f3d2e] group-hover:text-white flex items-center justify-center text-stone-800 transition-all duration-300 mb-2.5 shadow-xs">
        <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
      <span className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-emerald-950 transition-colors">
        View All Destinations
      </span>
    </Link>
  );
}

// 5-Step Interconnected Roadmap Section (Matches screenshot)
function SeamlessJourneysSection() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-16 sm:mt-24 mb-6 text-center">
      {/* Header */}
      <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
        Seamless Journeys
      </h2>
      <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1 max-w-lg mx-auto">
        From inspiration to destination, we curate every step of your Himalayan adventure.
      </p>

      {/* 5 Interconnected Steps */}
      <div className="relative mt-10 sm:mt-14">
        {/* Horizontal Connecting Line across step icons on desktop */}
        <div className="hidden md:block absolute top-7 left-14 right-14 h-0.5 bg-stone-200 -z-0" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-4 relative z-10">
          {JOURNEY_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex flex-col items-center text-center group">
                {/* Step Circle Badge */}
                <div
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                    step.isHighlighted
                      ? 'bg-[#0f3d2e] text-emerald-300 shadow-emerald-950/20'
                      : 'bg-white border border-stone-200 text-stone-700 hover:border-emerald-600 hover:text-emerald-700'
                  }`}
                >
                  <Icon size={22} strokeWidth={1.8} />
                </div>

                {/* Step Title */}
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 mt-2.5 sm:mt-3">
                  {step.title}
                </h4>

                {/* Step Subtitle */}
                <p className="text-[11px] sm:text-xs text-stone-500 font-normal leading-relaxed mt-1 max-w-[140px]">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
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

  // Curated Experiences Category Filter State
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredExperiences = useMemo(() => {
    if (activeCategory === 'All') return CURATED_EXPERIENCES;
    return CURATED_EXPERIENCES.filter(item => item.category === activeCategory);
  }, [activeCategory]);

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

      {/* ── 3. Curated Experiences Section (Matches Reference Screenshot) ── */}
      <div className="w-[calc(100%-1.25rem)] sm:w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] max-w-7xl mx-auto mt-14 sm:mt-20">
        
        {/* Header & Category Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 px-1">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 tracking-tight">
              Curated Experiences
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
              Find your perfect escape in the mountains.
            </p>
          </div>

          {/* Category Filter Pills (Matches Screenshot) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            {CURATED_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#0f3d2e] text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200/80 text-stone-600 border border-stone-200/80'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Layout matching exact screenshot proportions */}
        {activeCategory === 'All' ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Top Row: 2 Featured Experiences (Munsiyari Eco-Retreat & Jageshwar Dham) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <CuratedExperienceCard item={CURATED_EXPERIENCES[0]} isLarge={true} />
              <CuratedExperienceCard item={CURATED_EXPERIENCES[1]} isLarge={true} />
            </div>

            {/* Bottom Row: 3 Experiences (Valley of Flowers, Deoria Tal, View All Destinations) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <CuratedExperienceCard item={CURATED_EXPERIENCES[2]} />
              <CuratedExperienceCard item={CURATED_EXPERIENCES[3]} />
              <ViewAllCard />
            </div>
          </div>
        ) : (
          /* Filtered Category Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredExperiences.map((item) => (
              <CuratedExperienceCard key={item.id} item={item} />
            ))}
            <ViewAllCard />
          </div>
        )}
      </div>

      {/* ── 4. Seamless Journeys 5-Step Interconnected Roadmap ── */}
      <SeamlessJourneysSection />

    </section>
  );
}
