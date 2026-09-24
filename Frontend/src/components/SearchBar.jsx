import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MapPin, Calendar, Users, ChevronDown, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Smart Search Pill for Explore Page (Audit USP Fix):
 * [Icon: MapPin 'Destination'] | [Icon: Calendar 'Dates'] | [Icon: Users 'Travelers'] | [Search CTA]
 */
const SearchBar = ({ value, onChange, destinations = [], onClear }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Quick State for Dates & Travelers
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('Anytime');
  const [travelerModalOpen, setTravelerModalOpen] = useState(false);
  const [travelers, setTravelers] = useState({ adults: 2, children: 0 });

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const dateRef = useRef(null);
  const travelerRef = useRef(null);

  const dateOptions = [
    { label: 'Anytime', desc: 'Flexible mountain dates' },
    { label: 'This Weekend', desc: 'Quick 2-3 day getaway' },
    { label: 'Next 7 Days', desc: 'Upcoming week departure' },
    { label: 'Yatra Season', desc: 'May to October pilgrimages' },
    { label: 'Autumn / Winter', desc: 'Snow peaks & clear views' }
  ];

  // ── Debounced suggestion matching ──────────────────────────────────────────
  const computeSuggestions = useCallback(
    (query) => {
      if (!query || query.trim().length < 1) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }
      const q = query.toLowerCase().trim();
      const matches = destinations
        .filter(
          (d) =>
            d.name?.toLowerCase().includes(q) ||
            d.district?.toLowerCase().includes(q) ||
            d.region?.toLowerCase().includes(q)
        )
        .slice(0, 6);

      setSuggestions(matches);
      setShowDropdown(true);
      setActiveIndex(-1);
    },
    [destinations]
  );

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => computeSuggestions(value), 200);
    return () => clearTimeout(debounceRef.current);
  }, [value, computeSuggestions]);

  // ── Close modals on outside click ──────────────────────────────────────────
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target)) {
        setDateModalOpen(false);
      }
      if (travelerRef.current && !travelerRef.current.contains(e.target)) {
        setTravelerModalOpen(false);
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

  const handleSuggestionClick = () => {
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  const locationLabel = (d) => {
    const parts = [d.district, d.region].filter(Boolean);
    return parts.join(' • ');
  };

  const totalTravelers = travelers.adults + travelers.children;
  const travelerSummary = totalTravelers === 1 ? '1 Traveler' : `${totalTravelers} Travelers`;

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto mb-10">
      
      {/* ── Smart Search Multi-Segment Bar ── */}
      <div className="relative flex flex-col md:flex-row items-center w-full bg-white rounded-3xl md:rounded-full card-shadow border border-border-light p-2 md:p-2.5 shadow-xl hover:shadow-2xl transition-all duration-300 gap-2 md:gap-0">
        
        {/* ── Segment 1: Destination ── */}
        <div 
          onClick={() => inputRef.current?.focus()}
          className="flex-1 w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 md:rounded-full transition-colors cursor-text min-w-0"
        >
          <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-forest-green shrink-0">
            <MapPin size={17} strokeWidth={2.2} />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Destination
            </span>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={onChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (value && suggestions.length > 0) setShowDropdown(true);
                setDateModalOpen(false);
                setTravelerModalOpen(false);
              }}
              placeholder="Where to in Uttarakhand?"
              aria-label="Search destinations"
              className="w-full outline-none text-sm font-semibold text-text-dark placeholder:text-muted-text/70 bg-transparent truncate"
            />
          </div>
          {value && (
            <button
              onClick={handleClear}
              className="h-7 w-7 rounded-full flex items-center justify-center text-muted-text hover:text-text-dark hover:bg-slate-200 transition-colors shrink-0"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px h-8 bg-slate-200 shrink-0 mx-1" />

        {/* ── Segment 2: Dates ── */}
        <div className="relative w-full md:w-auto" ref={dateRef}>
          <button
            type="button"
            onClick={() => {
              setDateModalOpen(!dateModalOpen);
              setTravelerModalOpen(false);
              setShowDropdown(false);
            }}
            className="w-full md:w-44 flex items-center gap-3 px-4 py-2 hover:bg-slate-50 md:rounded-full transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
              <Calendar size={17} strokeWidth={2.2} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Dates
              </span>
              <span className="text-sm font-semibold text-text-dark truncate">
                {selectedDate}
              </span>
            </div>
          </button>

          {/* Date Picker Popover */}
          {dateModalOpen && (
            <div className="absolute top-[calc(100%+10px)] left-0 md:left-1/2 md:-translate-x-1/2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
                Travel Season & Window
              </div>
              <div className="space-y-1">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      setSelectedDate(opt.label);
                      setDateModalOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      selectedDate === opt.label 
                        ? 'bg-emerald-50 text-forest-green font-bold' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[10px] text-slate-400">{opt.desc}</div>
                    </div>
                    {selectedDate === opt.label && <Check size={14} className="text-forest-green" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px h-8 bg-slate-200 shrink-0 mx-1" />

        {/* ── Segment 3: Travelers ── */}
        <div className="relative w-full md:w-auto" ref={travelerRef}>
          <button
            type="button"
            onClick={() => {
              setTravelerModalOpen(!travelerModalOpen);
              setDateModalOpen(false);
              setShowDropdown(false);
            }}
            className="w-full md:w-44 flex items-center gap-3 px-4 py-2 hover:bg-slate-50 md:rounded-full transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 shrink-0">
              <Users size={17} strokeWidth={2.2} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Travelers
              </span>
              <span className="text-sm font-semibold text-text-dark truncate">
                {travelerSummary}
              </span>
            </div>
          </button>

          {/* Traveler Counter Popover */}
          {travelerModalOpen && (
            <div className="absolute top-[calc(100%+10px)] right-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Group Configuration
              </div>
              
              {/* Adults */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <div className="text-xs font-bold text-text-dark">Adults</div>
                  <div className="text-[10px] text-muted-text">Age 13+</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTravelers(t => ({ ...t, adults: Math.max(1, t.adults - 1) }))}
                    className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-text-dark w-4 text-center">{travelers.adults}</span>
                  <button
                    type="button"
                    onClick={() => setTravelers(t => ({ ...t, adults: Math.min(10, t.adults + 1) }))}
                    className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between py-2 mb-3">
                <div>
                  <div className="text-xs font-bold text-text-dark">Children</div>
                  <div className="text-[10px] text-muted-text">Ages 0-12</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTravelers(t => ({ ...t, children: Math.max(0, t.children - 1) }))}
                    className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-text-dark w-4 text-center">{travelers.children}</span>
                  <button
                    type="button"
                    onClick={() => setTravelers(t => ({ ...t, children: Math.min(6, t.children + 1) }))}
                    className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTravelerModalOpen(false)}
                className="w-full py-2 bg-forest-green text-white text-xs font-bold rounded-xl hover:bg-dark-green transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* ── CTA Search Button ── */}
        <button
          type="button"
          onClick={() => {
            if (value && suggestions.length > 0) setShowDropdown(true);
            else inputRef.current?.focus();
          }}
          className="w-full md:w-auto h-12 px-6 rounded-2xl md:rounded-full bg-forest-green hover:bg-dark-green text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-all cursor-pointer shrink-0"
          aria-label="Search"
        >
          <Search size={16} strokeWidth={2.5} />
          <span>Search</span>
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
                return (
                  <li key={dest._id || dest.id} role="option" aria-selected={idx === activeIndex}>
                    <Link
                      to={`/destinations/${dest.slug}`}
                      onClick={handleSuggestionClick}
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
                Try searching for a place name or district like Mussoorie, Nainital, Kedarnath
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
