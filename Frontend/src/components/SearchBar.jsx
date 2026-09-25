import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MapPin, Sparkles, Navigation } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { placesApi } from '../api/placesApi';

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
      if (!query || query.trim().length < 1) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }
      const q = query.toLowerCase().trim();
      
      // 1. Local catalog matches
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

      // 2. Dynamic Live Radar (Geoapify) for hidden locations (e.g. Hemkund, Chopta, Binsar)
      if (q.length >= 3) {
        try {
          setIsSearchingApi(true);
          const apiRes = await placesApi.searchPlaces(query);
          if (apiRes?.data && Array.isArray(apiRes.data)) {
            const apiPlaces = apiRes.data
              .filter(p => !combined.some(c => c.name?.toLowerCase() === p.name?.toLowerCase()))
              .slice(0, 3)
              .map(p => ({
                id: p.place_id,
                _id: p.place_id,
                name: p.name,
                district: p.vicinity || 'Uttarakhand',
                region: 'Himalayan Landmark',
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

      setSuggestions(combined);
      setShowDropdown(combined.length > 0);
      setActiveIndex(-1);
    },
    [destinations]
  );

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => computeSuggestions(value), 220);
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
