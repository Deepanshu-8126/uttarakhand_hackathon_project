import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MapPin, Sparkles, Navigation, Globe, CheckCircle2, Coins, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { placesApi } from '../api/placesApi';
import UnverifiedPlaceModal from './map/UnverifiedPlaceModal';

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
    isVerified: true,
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
    isVerified: true,
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
    isVerified: true,
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
    isVerified: true,
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
    isVerified: true,
    isLiveRadar: true,
    mapUrl: '/map?q=Kichha',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    tag: '📍 Satellite Radar'
  }
];

/**
 * Focused Destination Search Bar with Dual-Section Results:
 * Section 1: Verified (from our DB) ✅
 * Section 2: AI Discoveries (from OSM/Maps) 🌐 ("Unverified but found via Maps")
 */
const SearchBar = ({ value, onChange, destinations = [], onClear, onSelectPlace }) => {
  const navigate = useNavigate();
  const [verifiedList, setVerifiedList] = useState([]);
  const [aiDiscoveriesList, setAiDiscoveriesList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [selectedUnverified, setSelectedUnverified] = useState(null);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // ── Debounced dual search: Verified DB + OSM AI Discoveries ─────────
  const computeSuggestions = useCallback(
    async (query) => {
      // 1. If empty query, show trending hubs on focus
      if (!query || query.trim().length < 1) {
        setVerifiedList(TRENDING_HUBS);
        setAiDiscoveriesList([]);
        return;
      }

      const raw = query.trim();
      const q = normalizeSearchQuery(raw);
      
      // 2. Local catalog matches (Verified DB)
      const localMatches = destinations
        .filter(
          (d) =>
            d.name?.toLowerCase().includes(q) ||
            d.district?.toLowerCase().includes(q) ||
            d.region?.toLowerCase().includes(q) ||
            d.category?.toLowerCase().includes(q)
        )
        .slice(0, 5)
        .map(d => ({ ...d, isVerified: true }));

      let verified = [...localMatches];
      let discoveries = [];

      // 3. Dynamic Search API (Backend DB + OSM Nominatim Dual Engine)
      if (q.length >= 2) {
        try {
          setIsSearchingApi(true);
          const apiRes = await placesApi.searchPlaces(q);
          
          if (apiRes) {
            // Check if backend returned partitioned arrays
            if (Array.isArray(apiRes.verified) && apiRes.verified.length > 0) {
              const newVerified = apiRes.verified.filter(v => !verified.some(ex => ex.name?.toLowerCase() === v.name?.toLowerCase()));
              verified = [...verified, ...newVerified];
            }

            if (Array.isArray(apiRes.aiDiscoveries) && apiRes.aiDiscoveries.length > 0) {
              discoveries = apiRes.aiDiscoveries;
            } else if (Array.isArray(apiRes.data)) {
              // Extract unverified entries
              const extraDiscoveries = apiRes.data
                .filter(p => !p.isVerified && !verified.some(c => c.name?.toLowerCase() === p.name?.toLowerCase()))
                .map(p => ({
                  ...p,
                  isVerified: false,
                  label: 'Unverified but found via Maps',
                  rewardCoins: 20
                }));
              discoveries = extraDiscoveries.slice(0, 5);
            }
          }
        } catch (err) {
          console.warn('[SearchBar] Places search fallback:', err.message);
        } finally {
          setIsSearchingApi(false);
        }
      }

      setVerifiedList(verified);
      setAiDiscoveriesList(discoveries);
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
    if (!showDropdown) return;
    const totalCount = verifiedList.length + aiDiscoveriesList.length;
    if (totalCount === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, totalCount - 1));
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
    setVerifiedList([]);
    setAiDiscoveriesList([]);
    setShowDropdown(false);
    setActiveIndex(-1);
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (dest) => {
    setShowDropdown(false);
    setActiveIndex(-1);
    if (!dest.isVerified) {
      setSelectedUnverified(dest);
      return;
    }
    if (dest.slug) {
      navigate(`/destinations/${dest.slug}`);
    } else if (dest.mapUrl) {
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
            placeholder="Search destinations, shrines, bugyals..."
            aria-label="Search destinations"
            onFocus={() => {
              if (!value || value.trim().length === 0) {
                setVerifiedList(TRENDING_HUBS);
                setAiDiscoveriesList([]);
                setShowDropdown(true);
              } else {
                computeSuggestions(value);
              }
            }}
            className="w-full outline-none text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 bg-transparent truncate pr-2"
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

      {/* ── Auto-Suggestions Dropdown with Dual Sections ── */}
      {showDropdown && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-3xl shadow-2xl border border-stone-200 z-50 overflow-hidden"
        >
          {verifiedList.length > 0 || aiDiscoveriesList.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {/* Optional Header for Trending Hubs */}
              {verifiedList[0]?.isTrending && (!value || value.trim().length === 0) && (
                <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 text-[#0F2B1F] text-xs font-black uppercase tracking-wider flex items-center justify-between">
                  <span>🔥 Trending Himalayan Destinations</span>
                  <span className="text-[10px] text-emerald-800 font-mono font-bold">106 Verified</span>
                </div>
              )}

              {/* ── SECTION 1: Verified (from our DB) ✅ ── */}
              {verifiedList.length > 0 && (
                <div>
                  {value && value.trim().length > 0 && (
                    <div className="px-4 py-2 bg-[#E8F5E9]/60 border-b border-emerald-100 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#0F2B1F] flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-700" />
                        Verified (From our DB) ✅
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                        {verifiedList.length} verified
                      </span>
                    </div>
                  )}

                  <ul className="divide-y divide-stone-100">
                    {verifiedList.map((dest, idx) => {
                      const loc = locationLabel(dest);
                      const imageUrl = dest.coverImage?.url || dest.coverImage;

                      return (
                        <li key={dest._id || dest.id || `v_${idx}`} role="option" aria-selected={idx === activeIndex}>
                          <button
                            type="button"
                            onClick={() => handleSuggestionClick(dest)}
                            className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-emerald-50/70 transition-colors group cursor-pointer"
                          >
                            <div className="h-11 w-14 rounded-xl overflow-hidden bg-[#E8F5E9] shrink-0 border border-emerald-200/60 relative">
                              <img
                                src={imageUrl || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80'}
                                alt={dest.name}
                                loading="lazy"
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80'; }}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[#0F172A] font-bold text-sm truncate group-hover:text-[#0F2B1F]">
                                  {dest.name}
                                </span>
                                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-[#0F2B1F] border border-emerald-200 shrink-0">
                                  ✅ Verified
                                </span>
                              </div>
                              {loc && <span className="text-[#64748B] text-xs truncate mt-0.5">{loc}</span>}
                            </div>
                            <span className="text-stone-400 group-hover:text-[#0F2B1F] font-bold text-sm shrink-0">
                              →
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* ── SECTION 2: AI Discoveries (from OSM/Maps) 🌐 ── */}
              {aiDiscoveriesList.length > 0 && (
                <div className="border-t-2 border-stone-200">
                  <div className="px-4 py-2 bg-stone-100/90 border-b border-stone-200 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#0F172A] flex items-center gap-1.5">
                      <Globe size={13} className="text-stone-600" />
                      AI Discoveries (from OSM/Maps) 🌐
                    </span>
                    <span className="text-[10px] font-bold text-stone-500 bg-white px-2 py-0.5 rounded-full border border-stone-200">
                      Unverified but found via Maps
                    </span>
                  </div>

                  <ul className="divide-y divide-stone-100">
                    {aiDiscoveriesList.map((place, idx) => (
                      <li key={place.place_id || `ai_${idx}`} role="option">
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick(place)}
                          className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 text-stone-600 group-hover:bg-[#E8F5E9] group-hover:text-[#0F2B1F] transition-colors">
                            <MapPin size={18} />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[#0F172A] font-bold text-sm truncate group-hover:text-[#0F2B1F]">
                                {place.name}
                              </span>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 shrink-0">
                                🌐 OSM Map
                              </span>
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                                +20 Coins
                              </span>
                            </div>
                            <span className="text-[#64748B] text-xs truncate mt-0.5">
                              {place.displayName || place.address || 'Unverified mountain spot discovered via satellite map'}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-[#0F2B1F] bg-[#E8F5E9] px-2.5 py-1 rounded-full group-hover:bg-emerald-200 transition-colors shrink-0">
                            Inspect ↗
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-[#64748B]">
              <p className="font-semibold text-[#0F172A]">No local or map results found</p>
              <p className="text-xs mt-1">Try searching a different mountain pass, village, or dhaba.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Unverified Discovery Modal ── */}
      {selectedUnverified && (
        <UnverifiedPlaceModal
          place={selectedUnverified}
          onClose={() => setSelectedUnverified(null)}
          onAddedToMap={(p) => {
            if (onSelectPlace) onSelectPlace(p);
          }}
        />
      )}
    </div>
  );
};

export default SearchBar;
