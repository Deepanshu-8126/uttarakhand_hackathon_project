import React from 'react';
import { 
  Filter, 
  RotateCcw, 
  ShieldCheck, 
  Star, 
  Car, 
  Zap, 
  Gauge, 
  Users,
  X 
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { label: 'All Fleets', value: 'All' },
  { label: 'Bikes & Cruisers', value: 'Bike' },
  { label: 'Scooters', value: 'Scooter' },
  { label: '4x4 & SUVs', value: 'SUV' },
  { label: 'Cars & Sedans', value: 'Car' },
  { label: 'Tempo Travellers', value: 'Tempo Traveler' },
];

const TRANSMISSION_OPTIONS = [
  { label: 'Any', value: 'All' },
  { label: 'Manual', value: 'Manual' },
  { label: 'Automatic', value: 'Automatic' },
];

const SEAT_OPTIONS = [
  { label: 'Any', value: 'All' },
  { label: '2 Seats', value: '2' },
  { label: '4 - 5 Seats', value: '5' },
  { label: '6 - 7 Seats', value: '7' },
  { label: '8+ Seats', value: '8' },
];

const FUEL_OPTIONS = [
  { label: 'Any', value: 'All' },
  { label: 'Petrol', value: 'Petrol' },
  { label: 'Diesel', value: 'Diesel' },
  { label: 'Electric / EV', value: 'Electric' },
];

const BUDGET_PRESETS = [
  { label: 'Any', value: '' },
  { label: '< ₹1,000', value: '1000' },
  { label: '< ₹2,000', value: '2000' },
  { label: '< ₹3,500', value: '3500' },
  { label: '< ₹5,000', value: '5000' },
];

export default function RentalFiltersSidebar({
  selectedCategory,
  onCategoryChange,
  transmission,
  onTransmissionChange,
  seats,
  onSeatsChange,
  fuelType,
  onFuelTypeChange,
  maxBudget,
  onMaxBudgetChange,
  minRating,
  onMinRatingChange,
  verifiedOnly,
  onVerifiedOnlyChange,
  onResetFilters,
  isMobileModal = false,
  onCloseMobileModal
}) {
  return (
    <div className={`bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs ${isMobileModal ? 'w-full max-h-[85vh] overflow-y-auto' : ''}`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-emerald-800" />
          <h3 className="text-sm font-black text-stone-900 tracking-tight">
            Filter Vehicles
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-900 font-bold cursor-pointer transition"
            title="Reset all filters"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>

          {isMobileModal && (
            <button
              type="button"
              onClick={onCloseMobileModal}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* 1. Verified Partners Only Toggle */}
        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-950 block">Verified Partners</span>
              <span className="text-[10px] text-emerald-800">Only verified businesses</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => onVerifiedOnlyChange(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 border-stone-300 cursor-pointer"
          />
        </div>

        {/* 2. Vehicle Category */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Vehicle Type
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {CATEGORY_OPTIONS.map((cat) => {
              const isSelected = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => onCategoryChange(cat.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition border truncate cursor-pointer ${
                    isSelected
                      ? 'bg-[#0f3d2e] text-white border-[#0f3d2e] shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Daily Budget / Price Cap */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Max Daily Tariff
            </label>
            <span className="text-xs font-extrabold text-stone-900">
              {maxBudget ? `₹${Number(maxBudget).toLocaleString('en-IN')}` : 'Any Price'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {BUDGET_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onMaxBudgetChange(preset.value)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition cursor-pointer ${
                  maxBudget === preset.value
                    ? 'bg-emerald-900 text-white border-emerald-900'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <input
            type="range"
            min="500"
            max="12000"
            step="250"
            value={maxBudget || '12000'}
            onChange={(e) => onMaxBudgetChange(e.target.value === '12000' ? '' : e.target.value)}
            className="w-full accent-emerald-700 cursor-pointer"
          />
        </div>

        {/* 4. Transmission */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Gauge size={13} className="text-stone-400" />
            <span>Transmission</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {TRANSMISSION_OPTIONS.map((trans) => {
              const isSelected = transmission === trans.value;
              return (
                <button
                  key={trans.value}
                  type="button"
                  onClick={() => onTransmissionChange(trans.value)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition border cursor-pointer ${
                    isSelected
                      ? 'bg-[#0f3d2e] text-white border-[#0f3d2e]'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {trans.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Seats */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Users size={13} className="text-stone-400" />
            <span>Seating Capacity</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {SEAT_OPTIONS.map((opt) => {
              const isSelected = seats === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onSeatsChange(opt.value)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition border cursor-pointer ${
                    isSelected
                      ? 'bg-[#0f3d2e] text-white border-[#0f3d2e]'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Fuel Type */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Zap size={13} className="text-stone-400" />
            <span>Fuel Type</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {FUEL_OPTIONS.map((fuel) => {
              const isSelected = fuelType === fuel.value;
              return (
                <button
                  key={fuel.value}
                  type="button"
                  onClick={() => onFuelTypeChange(fuel.value)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition border cursor-pointer ${
                    isSelected
                      ? 'bg-[#0f3d2e] text-white border-[#0f3d2e]'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {fuel.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. Minimum Rating */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Star size={13} className="text-amber-500 fill-amber-500" />
            <span>Customer Rating</span>
          </label>
          <select
            value={minRating}
            onChange={(e) => onMinRatingChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-stone-800 focus:outline-none focus:border-emerald-700 cursor-pointer"
          >
            <option value="0">Any Rating</option>
            <option value="4.0">⭐ 4.0 & above</option>
            <option value="4.5">⭐ 4.5 & above</option>
            <option value="4.8">⭐ 4.8 & above</option>
          </select>
        </div>
      </div>

      {isMobileModal && (
        <div className="mt-6 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={onCloseMobileModal}
            className="w-full py-3 bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
}
