import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Car, 
  Users, 
  Search, 
  LocateFixed, 
  X,
  Sparkles,
  ChevronDown
} from 'lucide-react';

const COMMON_VEHICLE_TYPES = [
  { label: 'All Types', value: 'All' },
  { label: 'Bikes & Cruisers', value: 'Bike' },
  { label: 'Scooters', value: 'Scooter' },
  { label: '4x4 & SUVs', value: 'SUV' },
  { label: 'Cars & Sedans', value: 'Car' },
  { label: 'Tempo Travellers', value: 'Tempo Traveler' },
];

export default function RentalSearchCard({
  searchQuery,
  onSearchQueryChange,
  selectedCity,
  onCityChange,
  cities = [],
  cityCounts = {},
  selectedCategory,
  onCategoryChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  seats,
  onSeatsChange,
  userLocation,
  onDetectLocation,
  isDetectingLocation,
  onSearchSubmit
}) {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Filter cities for search dropdown
  const filteredCities = cities.filter(c => 
    c !== 'All' && 
    (!searchQuery || c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCitySelect = (cityName) => {
    onCityChange(cityName);
    onSearchQueryChange('');
    setShowLocationDropdown(false);
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="w-full">
      {/* ── Main Marketplace Search Card ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-lg p-4 sm:p-6 lg:p-7 relative z-20">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (onSearchSubmit) onSearchSubmit();
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end"
        >
          {/* 1. Location / Pickup Hub (4 cols on lg) */}
          <div className="lg:col-span-4 relative">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="rental-location-input" className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-700 shrink-0" />
                <span>Pick-up Location</span>
              </label>
              {selectedCity !== 'All' && (
                <button
                  type="button"
                  onClick={() => {
                    onCityChange('All');
                    onSearchQueryChange('');
                  }}
                  className="text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold cursor-pointer underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="relative">
              <input
                id="rental-location-input"
                type="text"
                placeholder={selectedCity !== 'All' ? selectedCity : 'City, station or hub (e.g. Haldwani)'}
                value={searchQuery}
                onChange={(e) => {
                  onSearchQueryChange(e.target.value);
                  setShowLocationDropdown(true);
                }}
                onFocus={() => setShowLocationDropdown(true)}
                className="w-full px-3.5 py-3 rounded-xl border border-stone-200 bg-stone-50/60 focus:bg-white focus:outline-none focus:border-emerald-700 text-stone-900 text-sm font-medium transition placeholder:text-stone-400"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchQueryChange('');
                    setShowLocationDropdown(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* City Suggestions Dropdown */}
            {showLocationDropdown && (
              <div 
                className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 max-h-60 overflow-y-auto animate-in fade-in duration-150"
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Popular Uttarakhand Hubs
                </div>
                <button
                  type="button"
                  onClick={() => handleCitySelect('All')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50 flex items-center justify-between transition cursor-pointer"
                >
                  <span>All Uttarakhand Fleets</span>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-bold">
                    {cityCounts['All'] || ''}
                  </span>
                </button>
                {filteredCities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCitySelect(c)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-emerald-50 hover:text-emerald-950 flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-emerald-700">📍</span>
                      <span>{c}</span>
                    </span>
                    <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-bold">
                      {cityCounts[c] ? `${cityCounts[c]} vehicles` : ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Start Date (2 cols on lg) */}
          <div className="lg:col-span-2">
            <label htmlFor="rental-start-date" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-emerald-700 shrink-0" />
              <span>Start Date</span>
            </label>
            <input
              id="rental-start-date"
              type="date"
              min={todayStr}
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-stone-200 bg-stone-50/60 focus:bg-white focus:outline-none focus:border-emerald-700 text-stone-900 text-sm font-medium transition cursor-pointer"
            />
          </div>

          {/* 3. End Date (2 cols on lg) */}
          <div className="lg:col-span-2">
            <label htmlFor="rental-end-date" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-emerald-700 shrink-0" />
              <span>End Date</span>
            </label>
            <input
              id="rental-end-date"
              type="date"
              min={startDate || todayStr}
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-stone-200 bg-stone-50/60 focus:bg-white focus:outline-none focus:border-emerald-700 text-stone-900 text-sm font-medium transition cursor-pointer"
            />
          </div>

          {/* 4. Vehicle Category (2 cols on lg) */}
          <div className="lg:col-span-2">
            <label htmlFor="rental-vehicle-type" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Car size={14} className="text-emerald-700 shrink-0" />
              <span>Vehicle Type</span>
            </label>
            <div className="relative">
              <select
                id="rental-vehicle-type"
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-stone-200 bg-stone-50/60 focus:bg-white focus:outline-none focus:border-emerald-700 text-stone-900 text-sm font-medium transition appearance-none cursor-pointer pr-8"
              >
                {COMMON_VEHICLE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            </div>
          </div>

          {/* 5. Search Action Button (2 cols on lg) */}
          <div className="lg:col-span-2">
            <button
              type="submit"
              className="w-full min-h-[46px] px-5 py-3 rounded-xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Search size={16} className="text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">Search Vehicles</span>
            </button>
          </div>
        </form>

        {/* ── Sub-bar: Truthful Availability Note & Location Status ── */}
        <div className="mt-3.5 pt-3.5 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>
              Real-time vehicle availability confirmed directly upon booking with verified partner.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {userLocation?.city ? (
              <span className="inline-flex items-center gap-1 font-medium text-stone-700">
                <LocateFixed size={12} className="text-emerald-700 shrink-0" />
                <span>Detected near: <strong>{userLocation.city}</strong></span>
              </span>
            ) : (
              <button
                type="button"
                onClick={onDetectLocation}
                disabled={isDetectingLocation}
                className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-semibold cursor-pointer underline disabled:opacity-60"
              >
                <LocateFixed size={12} className="text-emerald-700 shrink-0" />
                <span>{isDetectingLocation ? 'Detecting GPS...' : 'Use my current location'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Secondary Control: Nearby Rental Hubs (Compact Quick Selector) ── */}
      <div className="mt-3.5 flex items-center gap-2 flex-wrap text-xs">
        <span className="font-bold text-stone-500 uppercase tracking-wider shrink-0 mr-1">
          Nearby rental hubs:
        </span>
        {cities.map((city) => {
          const isSelected = selectedCity === city;
          const count = city === 'All' ? cityCounts['All'] : cityCounts[city];

          return (
            <button
              key={city}
              type="button"
              onClick={() => {
                onCityChange(city);
                onSearchQueryChange('');
              }}
              className={`px-3 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 border whitespace-nowrap ${
                isSelected
                  ? 'bg-[#0f3d2e] text-white border-[#0f3d2e] shadow-xs'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200/90'
              }`}
            >
              <span>{city === 'All' ? 'All Hubs' : city}</span>
              {count != null && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-100 text-stone-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
