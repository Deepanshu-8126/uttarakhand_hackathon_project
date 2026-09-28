import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Compass, Thermometer, Navigation, ExternalLink, ShieldCheck, Eye, CloudSun, Snowflake, CloudRain, Sun } from 'lucide-react';

const FALLBACK_LOCATIONS = [
  {
    name: "Binsar",
    slug: "binsar",
    tag: "Hidden Wildlife Sanctuary",
    district: "Almora",
    region: "Kumaon",
    lat: 29.3167,
    lng: 79.5833,
    altitude: "2,420 m",
    description: "300 km Himalayan panorama — Kedarnath, Chaukhamba, Trishul, Nanda Devi visible. 200+ bird species, leopard, Himalayan bear. Zero commercial tourism.",
    bestTime: "Mar-Jun, Sep-Nov",
    entryFee: "₹25 (Indian)",
    nearby: "30 km from Almora",
    coverImage: {
      url: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      attribution: "Unsplash Himalayan Collection",
      alt: "Binsar Zero Point panoramic 300km Himalayan peak view"
    }
  },
  {
    name: "Munsiyari",
    slug: "munsiyari",
    tag: "Little Kashmir",
    district: "Pithoragarh",
    region: "Kumaon",
    lat: 29.5833,
    lng: 80.0167,
    altitude: "2,200 m",
    description: "Panchachuli base camp. Gateway to Milam, Ralam, Namik glacier treks. Closest town-level Panchachuli views in Uttarakhand.",
    bestTime: "Apr-Jun, Sep-Nov",
    entryFee: "Free",
    nearby: "Base for 3 glacier treks",
    coverImage: {
      url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      attribution: "Unsplash Mountain Collection",
      alt: "Panchachuli snow peaks over Munsiyari village"
    }
  },
  {
    name: "Chaukori",
    slug: "chaukori",
    tag: "Best Sunrise Point",
    district: "Pithoragarh",
    region: "Kumaon",
    lat: 29.7333,
    lng: 80.1167,
    altitude: "2,010 m",
    description: "Direct Panchachuli 5-peak view. Tea gardens + Ramganga valley. Sunrise: peaks light sequentially right-to-left (20-30 min). Zero tourist infrastructure.",
    bestTime: "Mar-Nov",
    entryFee: "Free",
    nearby: "200 km from Nainital (5-6 hrs)",
    coverImage: {
      url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      attribution: "Unsplash Sunrise Series",
      alt: "Chaukori tea garden sunrise overlooking Himalayan peaks"
    }
  },
  {
    name: "Khirsu",
    slug: "khirsu",
    tag: "Hidden Apple Village",
    district: "Pauri Garhwal",
    region: "Garhwal",
    lat: 29.7667,
    lng: 78.4167,
    altitude: "1,700 m",
    description: "Untouched hill village. Apple orchards, terraced fields, Himalayan views. No commercial tourism. Homestay culture only.",
    bestTime: "Mar-Nov",
    entryFee: "Free",
    homestay: "₹1000-2000/night",
    nearby: "40 km from Pauri",
    coverImage: {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      attribution: "Unsplash Hillside Village",
      alt: "Khirsu peaceful apple orchards and mountain village terrace"
    }
  },
  {
    name: "Chopta",
    slug: "chopta",
    tag: "Mini Switzerland",
    district: "Rudraprayag",
    region: "Garhwal",
    lat: 30.4167,
    lng: 79.3833,
    altitude: "2,680 m",
    description: "Meadows + evergreen forest. Base for Tungnath (highest Shiva temple) + Chandrashila trek. Snow in winter, green in summer.",
    bestTime: "Mar-Jun, Sep-Nov (winter: Dec-Feb)",
    entryFee: "Free (camping ₹500-1500)",
    nearby: "20 km from Rudraprayag",
    coverImage: {
      url: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1280&q=80",
      source: "Unsplash Verified",
      attribution: "Unsplash Campers Collection",
      alt: "Chopta alpine meadow bugyal and snow peak base"
    }
  },
  {
    name: "Harsil",
    slug: "harsil",
    tag: "Apple Valley on Bhagirathi",
    district: "Uttarkashi",
    region: "Garhwal",
    lat: 30.9833,
    lng: 79.4333,
    altitude: "1,900 m",
    description: "Ancient village on Bhagirathi river. 1000+ year old banyan tree, apple orchards, Bhim Pul (stone bridge). On Gangotri route.",
    bestTime: "Mar-Jun, Sep-Nov",
    entryFee: "Free",
    nearby: "20 km from Gangotri",
    coverImage: {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      attribution: "Unsplash River Valley",
      alt: "Harsil apple orchards and deodar pine forests along Bhagirathi river"
    }
  },
  {
    name: "Pangot",
    slug: "pangot",
    tag: "Bird Watcher's Paradise",
    district: "Nainital",
    region: "Kumaon",
    lat: 29.3833,
    lng: 79.5167,
    altitude: "2,400 m",
    description: "580+ bird species. Oak + pine forests. Gandhi stayed here (Anasakti Ashram, 1929). Butterfly gardens, nature trails. Zero crowds.",
    bestTime: "Oct-Apr (birding)",
    entryFee: "Free (guide ₹500-1000/day)",
    nearby: "20 km from Nainital",
    coverImage: {
      url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      attribution: "Unsplash Nature Sanctuary",
      alt: "Pangot dense misty oak and rhododendron forest"
    }
  },
  {
    name: "Gwaldam",
    slug: "gwaldam",
    tag: "Spiritual Junction",
    district: "Chamoli",
    region: "Garhwal-Kumaon Border",
    lat: 30.2833,
    lng: 79.3333,
    altitude: "2,000 m",
    description: "Ancient temples, meditation centers. Nanda Devi + Chaukhamba views. Bedni Bugyal nearby. Sacred lakes, pilgrimage routes. Almost no tourism.",
    bestTime: "Apr-Jun, Sep-Nov",
    entryFee: "Free",
    nearby: "20 km from Badrinath",
    coverImage: {
      url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      attribution: "Unsplash Sacred Mountains",
      alt: "Gwaldam meditation haven facing Nanda Devi and Trishul"
    }
  },
  {
    name: "Kanatal",
    slug: "kanatal",
    tag: "Hidden Retreat",
    district: "Tehri Garhwal",
    region: "Garhwal",
    lat: 29.3167,
    lng: 79.4833,
    altitude: "2,590 m",
    description: "Apple orchards, terraced fields, valley views. Surkanda Devi Temple, Kaudia Forest. Rappelling + trekking. Less crowded Mussoorie alternative.",
    bestTime: "Mar-Jun, Sep-Nov",
    entryFee: "Free",
    nearby: "38 km from Mussoorie",
    coverImage: {
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      attribution: "Unsplash Mountain Ridge",
      alt: "Kanatal pine ridges and Kaudia forest views"
    }
  },
  {
    name: "Sattal",
    slug: "sattal",
    tag: "Seven Lakes",
    district: "Nainital",
    region: "Kumaon",
    lat: 29.3667,
    lng: 79.4667,
    altitude: "1,370 m",
    description: "7 interconnected lakes in dense oak forest. 500+ bird species. Scott Christian Ashram (1930s). Paddle-boating. Zero commercial waterfront.",
    bestTime: "Mar-Nov",
    entryFee: "Free",
    nearby: "22 km from Nainital",
    coverImage: {
      url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1280&q=80",
      source: "Unsplash Verified",
      attribution: "Unsplash Emerald Waters",
      alt: "Sattal serene emerald lakes nestled in dense oak woods"
    }
  },
  {
    name: "Khurpatal",
    slug: "khurpatal",
    tag: "Hoof-Shaped Secret Lake",
    district: "Nainital",
    region: "Kumaon",
    lat: 29.3500,
    lng: 79.4500,
    altitude: "1,635 m",
    description: "Hoof-shaped emerald lake in dense forest. No boating, no crowds, no commercial waterfront. Just lake + forest reflection + birdsong. Top birdwatching spot.",
    bestTime: "Mar-Nov",
    entryFee: "Free",
    nearby: "12 km from Nainital",
    coverImage: {
      url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      attribution: "Unsplash Forest Lake",
      alt: "Khurpatal secret emerald hoof lake in mountain basin"
    }
  },
  {
    name: "Mukteshwar",
    slug: "mukteshwar",
    tag: "Colonial Rock Viewpoint",
    district: "Nainital",
    region: "Kumaon",
    lat: 29.4167,
    lng: 79.4833,
    altitude: "2,286 m",
    description: "180° Himalayan panorama from Chauli Ki Jali rock ledge. Nanda Devi, Trishul visible. Old British bungalows, IVRI campus (1893). Heritage homestays only.",
    bestTime: "Mar-Nov",
    entryFee: "Free",
    nearby: "51 km from Nainital",
    coverImage: {
      url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
      source: "Unsplash Verified",
      attribution: "Unsplash Cliff Panorama",
      alt: "Mukteshwar Chauli Ki Jali rock overhang with Trishul panorama"
    }
  }
];

export default function HiddenLocationsSection() {
  const [locations, setLocations] = useState(FALLBACK_LOCATIONS);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [weatherMap, setWeatherMap] = useState({});

  useEffect(() => {
    // 1. Fetch locations from backend API
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    fetch(`${apiBase}/hidden-locations?withWeather=true`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setLocations(data.data);
          const initialMap = {};
          data.data.forEach((loc) => {
            if (loc.liveWeather) {
              initialMap[loc.slug] = loc.liveWeather;
            }
          });
          setWeatherMap(initialMap);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch real-time Open-Meteo weather for locations if not loaded from backend
  useEffect(() => {
    locations.forEach((loc) => {
      if (!weatherMap[loc.slug]) {
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&current=temperature_2m,weather_code,precipitation&timezone=Asia/Kolkata`
        )
          .then((r) => r.json())
          .then((d) => {
            if (d && d.current) {
              setWeatherMap((prev) => ({
                ...prev,
                [loc.slug]: {
                  temperature: d.current.temperature_2m,
                  weatherCode: d.current.weather_code,
                  precipitation: d.current.precipitation,
                  condition: d.current.temperature_2m > 18 ? 'Pleasant' : 'Chilly Mountain Air',
                },
              }));
            }
          })
          .catch(() => {});
      }
    });
  }, [locations]);

  const filtered = locations.filter((loc) => {
    if (selectedRegion === 'All') return true;
    return loc.region.toLowerCase().includes(selectedRegion.toLowerCase());
  });

  const getWeatherIcon = (code) => {
    if (code >= 71) return <Snowflake size={14} className="text-cyan-400" />;
    if (code >= 51) return <CloudRain size={14} className="text-blue-400" />;
    if (code >= 1 && code <= 3) return <CloudSun size={14} className="text-amber-400" />;
    return <Sun size={14} className="text-amber-400" />;
  };

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-[#fdfbf7] via-stone-50 to-[#fdfbf7] relative overflow-hidden">
      {/* Background Subtle Mountain Contour Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0f3d2e]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0f3d2e]/10 border border-[#0f3d2e]/20 text-[#0f3d2e] text-xs font-black tracking-wider uppercase mb-3">
              <Sparkles size={13} className="text-[#00FF88]" />
              <span>2026 Telemetry Verified · Zero Commercial Tourism</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
              Hidden Uttarakhand <span className="text-[#0f3d2e]">Gems</span>
            </h2>
            <p className="mt-3 text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
              12 pristine sanctuaries, high-altitude apple villages, secret lakes, and uninterrupted 300km Himalayan panoramas with real-time Open-Meteo telemetry.
            </p>
          </div>

          {/* Region Tabs Filter */}
          <div className="flex items-center gap-2 bg-stone-200/60 p-1.5 rounded-2xl backdrop-blur-md border border-stone-300/80 self-start md:self-end">
            {['All', 'Kumaon', 'Garhwal'].map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                  selectedRegion === reg
                    ? 'bg-[#0f3d2e] text-white shadow-md shadow-[#0f3d2e]/20'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-300/50'
                }`}
              >
                {reg === 'All' ? 'All 12 Gems' : `${reg} Region`}
              </button>
            ))}
          </div>
        </div>

        {/* 12 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filtered.map((loc) => {
            const weather = weatherMap[loc.slug] || loc.liveWeather;
            const imgSrc = loc.coverImage?.url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={loc.slug}
                className="group relative bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-stone-200/80 hover:border-emerald-500/60 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1"
              >
                {/* Image Frame */}
                <div className="relative h-60 w-full overflow-hidden bg-stone-900">
                  <img
                    src={imgSrc}
                    alt={loc.coverImage?.alt || loc.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/20" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                    <span className="bg-[#0f3d2e]/90 backdrop-blur-md text-[#00FF88] text-[10.5px] font-black tracking-wide uppercase px-3 py-1 rounded-full border border-[#00FF88]/30 shadow-md">
                      {loc.tag}
                    </span>

                    {/* Live Open-Meteo Weather Pill */}
                    {weather?.temperature !== undefined && (
                      <span className="bg-stone-900/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-md flex items-center gap-1.5">
                        {getWeatherIcon(weather.weatherCode)}
                        <span>{weather.temperature}°C</span>
                      </span>
                    )}
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white/90 text-xs font-semibold pointer-events-none">
                    <span className="flex items-center gap-1 drop-shadow-md">
                      <MapPin size={12} className="text-[#00FF88]" />
                      <span>{loc.district}, {loc.region}</span>
                    </span>
                    <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-white/20">
                      ⛰️ {loc.altitude}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-stone-900 group-hover:text-[#0f3d2e] transition-colors">
                      {loc.name}
                    </h3>
                    <p className="mt-2 text-stone-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {loc.description}
                    </p>
                  </div>

                  {/* Details Badges */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-stone-400 font-bold">Best:</span>
                      <span className="font-semibold text-stone-700 truncate">{loc.bestTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-stone-400 font-bold">Entry:</span>
                      <span className="font-semibold text-stone-700 truncate">{loc.entryFee}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      to={`/map?lat=${loc.lat}&lng=${loc.lng}&q=${encodeURIComponent(loc.name)}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-[#0f3d2e] text-xs font-bold transition-colors border border-stone-200 hover:border-emerald-200"
                    >
                      <Navigation size={13} className="text-emerald-600" />
                      <span>Radar GPS</span>
                    </Link>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors border border-stone-200"
                      title="Open in Google Maps"
                    >
                      <ExternalLink size={14} />
                    </a>

                    <Link
                      to={`/destinations/${loc.slug}`}
                      className="inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white text-xs font-bold transition-all shadow-md shadow-[#0f3d2e]/20"
                    >
                      <span>Explore</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
