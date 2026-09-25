import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MapPin, Sparkles, Navigation } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { placesApi } from '../api/placesApi';

// ── Hindi / Transliteration & Category Normalizer ──
function normalizeSearchQuery(input) {
  if (!input) return '';
  let q = input.toLowerCase().trim();
  const HINDI_MAP = {
    'केदारनाथ': 'kedarnath',
    'बद्रीनाथ': 'badrinath',
    'औली': 'auli',
    'ऋषिकेश': 'rishikesh',
    'नैनीताल': 'nainital',
    'मसूरी': 'mussoorie',
    'किच्छा': 'kichha',
    'चोपता': 'chopta',
    'होटल': 'hotel',
    'सस्ता होटल': 'budget hotel',
    'ढाबा': 'dhaba restaurant',
    'बाइक': 'bike rental',
    'एटीएम': 'atm',
    'पेट्रोल': 'petrol pump'
  };

  for (const [hindi, english] of Object.entries(HINDI_MAP)) {
    if (q.includes(hindi)) {
      q = q.replace(hindi, english);
    }
  }
  return q;
}

// ── Trending Himalayan Hubs for Empty Search ──
const TRENDING_HUBS = [
  {
    _id: 'trend_kedarnath',
    name: 'Kedarnath Dham',
    district: 'Rudraprayag',
    region: 'Garhwal Himalayas',
    slug: 'kedarnath',
    isTrending: true,
    coverImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80',
    tag: '🔥 #1 Pilgrimage'
  },
  {
    _id: 'trend_auli',
    name: 'Auli Ski Resort',
    district: 'Chamoli',
    region: 'High Altitude Bugyal',
    slug: 'auli',
    isTrending: true,
    coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
    tag: '🎿 Snow & Ski'
  },
  {
    _id: 'trend_rishikesh',
    name: 'Rishikesh Yoga Capital',
    district: 'Dehradun',
    region: 'Ganges Valley',
    slug: 'rishikesh',
    isTrending: true,
    coverImage: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&q=80',
    tag: '🌊 Rafting & Yoga'
  },
  {
    _id: 'trend_vof',
    name: 'Valley of Flowers',
    district: 'Chamoli',
    region: 'UNESCO World Heritage',
    slug: 'valley-of-flowers',
    isTrending: true,
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    tag: '🌸 Alpine Flora'
  },
  {
    _id: 'trend_kichha',
    name: 'Kichha Regional Hub',
    district: 'Udham Singh Nagar',
    region: 'Terai Gateway',
    slug: 'kichha',
    isTrending: true,
    isLiveRadar: true,
    mapUrl: '/map?q=Kichha',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    tag: '📍 Satellite Radar'
  }
];

/**
 * Focused Destination Search Bar for Explore Page:
 * Integrates MongoDB catalog + Live Geoapify Satellite Radar for hidden locations.
 */
const SearchBar = ({ value, onChange, destinations = [], onClear, onSelectPlace }) => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // ── Debounced suggestion matching (Local DB + Geoapify Live Radar) ─────────
  const computeSuggestions = useCallback(
    async (query) => {
      // 1. If empty query, show trending hubs on focus
      if (!query || query.trim().length < 1) {
        setSuggestions(TRENDING_HUBS);
        return;
      }

      const raw = query.trim();
      const q = normalizeSearchQuery(raw);
      
      // 2. Local catalog matches
      const localMatches = destinations
        .filter(
          (d) =>
            d.name?.toLowerCase().includes(q) ||
            d.district?.toLowerCase().includes(q) ||
            d.region?.toLowerCase().includes(q) ||
            d.category?.toLowerCase().includes(q)
        )
        .slice(0, 5);

      let combined = [...localMatches];

      // 3. Dynamic Live Radar (Geoapify) for hidden locations & POIs
      if (q.length >= 2) {
        try {
          setIsSearchingApi(true);
          const apiRes = await placesApi.searchPlaces(q);
          if (apiRes?.data && Array.isArray(apiRes.data)) {
            const apiPlaces = apiRes.data
              .filter(p => !combined.some(c => c.name?.toLowerCase() === p.name?.toLowerCase()))
              .slice(0, 4)
              .map(p => ({
                id: p.place_id,
                _id: p.place_id,
                name: p.name,
                district: p.vicinity || 'Uttarakhand',
                region: 'Himalayan Landmark / Radar',
                isLiveRadar: true,
                rating: p.rating || 4.8,
                location: p.location,
                coverImage: p.photo_urls?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
                mapUrl: `/map?q=${encodeURIComponent(p.name)}`
              }));
            combined = [...combined, ...apiPlaces];
          }
        } catch (err) {
          // Gracefully fallback to local matches
        } finally {
          setIsSearchingApi(false);
        }
      }

      // 4. Intelligent AI Fallback if zero results (e.g. gibberish 'asdfghjkl')
      if (combined.length === 0) {
        const fallbackResults = TRENDING_HUBS.slice(0, 3).map(item => ({
          ...item,
          isAiFallback: true,
          originalQuery: raw
        }));
        combined = fallbackResults;
      }

      setSuggestions(combined);
      setShowDropdown(true);
      setActiveIndex(-1);
    },
    [destinations]
  );

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value && value.trim().length > 0) {
        computeSuggestions(value);
      }
    }, 220);
    return () => clearTimeout(debounceRef.current);
  }, [value, computeSuggestions]);

  // ── Close dropdown on outside click ────────────────────────────────────────
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Keyboard navigation ────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSuggestions([]);
    setShowDropdown(false);
    setActiveIndex(-1);
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (dest) => {
    setShowDropdown(false);
    setActiveIndex(-1);
    if (dest.isLiveRadar && dest.mapUrl) {
      navigate(dest.mapUrl);
    }
    if (onSelectPlace) {
      onSelectPlace(dest);
    }
  };

  const locationLabel = (d) => {
    const parts = [d.district, d.region].filter(Boolean);
    return parts.join(' • ');
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto mb-7">
      
      {/* ── Focused Explore Search Bar (56px Height, Rounded-full, Premium Shadow) ── */}
      <div className="relative flex items-center w-full h-[56px] bg-white rounded-full border border-[#E2E8F0] pl-2.5 pr-2 shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300">
        
        <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#0F2B1F] shrink-0 mr-3 shadow-2xs">
          <Search size={18} strokeWidth={2.5} />
        </div>

        <div className="flex-1 min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (value && suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder="Search destinations, shrines, bugyals..."
            aria-label="Search destinations"
            onFocus={() => {
              if (!value || value.trim().length === 0) {
                setSuggestions(TRENDING_HUBS);
                setShowDropdown(true);
              } else {
                computeSuggestions(value);
              }
            }}
            className="w-full outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400 bg-transparent truncate pr-2"
          />
        </div>

        {isSearchingApi && (
          <div className="mr-2 text-[10px] font-bold text-emerald-800 bg-[#E8F5E9] px-2.5 py-0.5 rounded-full animate-pulse border border-emerald-300 shrink-0">
            Radar active
          </div>
        )}

        {value && (
          <button
            onClick={handleClear}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 mr-1.5 cursor-pointer"
            aria-label="Clear search"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            const grid = document.getElementById('explore-grid');
            if (grid) grid.scrollIntoView({ behavior: 'smooth' });
          }}
          className="h-[42px] px-5 sm:px-7 rounded-full bg-[#0F2B1F] hover:bg-[#153e2d] text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#0F2B1F]/20 hover:shadow-lg transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <Sparkles size={14} className="text-emerald-300" />
          <span>Find</span>
        </button>
      </div>

      {/* ── Auto-Suggestions Dropdown ── */}
      {showDropdown && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-3xl shadow-2xl border border-border-light z-50 overflow-hidden"
        >
          {suggestions.length > 0 ? (
            <div>
              {/* Optional Header for AI fallback or Trending */}
              {suggestions[0]?.isAiFallback && (
                <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-600 shrink-0" />
                  <span>No exact match for "{suggestions[0].originalQuery}". Showing top Himalayan suggestions:</span>
                </div>
              )}
              {suggestions[0]?.isTrending && (!value || value.trim().length === 0) && (
                <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 text-emerald-950 text-xs font-black uppercase tracking-wider flex items-center justify-between">
                  <span>🔥 Trending Himalayan Destinations</span>
                  <span className="text-[10px] text-emerald-700 font-mono">Popular</span>
                </div>
              )}

              <ul className="py-2 max-h-80 overflow-y-auto">
              {suggestions.map((dest, idx) => {
                const loc = locationLabel(dest);
                const imageUrl = dest.coverImage?.url || dest.coverImage;
                const isLive = dest.isLiveRadar;

                return (
                  <li key={dest._id || dest.id} role="option" aria-selected={idx === activeIndex}>
                    {isLive ? (
                      <button
                        type="button"
                        onClick={() => handleSuggestionClick(dest)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-emerald-50/70 transition-colors group ${
                          idx === activeIndex ? 'bg-emerald-50/70' : ''
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="h-11 w-14 rounded-xl overflow-hidden bg-emerald-50 flex-shrink-0 border border-emerald-200/60 relative">
                          <img
                            src={imageUrl}
                            alt={dest.name}
                            loading="lazy"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80'; }}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Text */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-text-dark font-bold text-sm truncate group-hover:text-forest-green">
                              {dest.name}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-[#0f3d2e] border border-emerald-300">
                              🛰️ Live Radar
                            </span>
                          </div>
                          {loc && (
                            <span className="text-muted-text text-xs truncate">{loc}</span>
                          )}
                        </div>

                        {/* Action Label */}
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg">
                          <Navigation size={12} />
                          <span>View on Map</span>
                        </div>
                      </button>
                    ) : (
                      <Link
                        to={`/destinations/${dest.slug}`}
                        onClick={() => handleSuggestionClick(dest)}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-emerald-50/70 transition-colors group ${
                          idx === activeIndex ? 'bg-emerald-50/70' : ''
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="h-11 w-14 rounded-xl overflow-hidden bg-beige flex-shrink-0">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={dest.name}
                              loading="lazy"
                              onError={(e) => { e.target.style.display = 'none'; }}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-border-light" />
                          )}
                        </div>
                        {/* Text */}
                        <div className="flex flex-col min-w-0">
                          <span className="text-text-dark font-semibold text-sm truncate group-hover:text-forest-green">
                            {dest.name}
                          </span>
                          {loc && (
                            <span className="text-muted-text text-xs truncate">{loc}</span>
                          )}
                        </div>
                        {/* Arrow */}
                        <span className="ml-auto text-muted-text group-hover:text-forest-green text-sm transition-colors flex-shrink-0 font-bold">
                          →
                        </span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            </div>
          ) : (
            <div className="px-5 py-5 text-center">
              <p className="text-text-dark font-semibold text-sm mb-1">
                No destinations found for &ldquo;{value}&rdquo;
              </p>
              <p className="text-muted-text text-xs">
                Try searching for any place name like Hemkund, Chopta, Mussoorie, Nainital, Kedarnath
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
