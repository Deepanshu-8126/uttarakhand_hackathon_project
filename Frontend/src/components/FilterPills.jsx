import React from 'react';
import { Sun, Mountain, Flame, Compass, Trees } from 'lucide-react';

/**
 * FilterPills — Premium category filter bar.
 * Height 44px, rounded-full, 12px gap, active green glow, bold icons.
 */
const FilterIcons = {
  All: (isActive) => (
    <Sun
      size={18}
      strokeWidth={2.5}
      className={isActive ? 'text-amber-300 fill-amber-300' : 'text-slate-600'}
    />
  ),
  Garhwal: (isActive) => (
    <Mountain
      size={18}
      strokeWidth={2.5}
      className={isActive ? 'text-emerald-300 fill-emerald-400/30' : 'text-slate-600'}
    />
  ),
  Kumaon: (isActive) => (
    <Mountain
      size={18}
      strokeWidth={2.5}
      className={isActive ? 'text-emerald-300 fill-emerald-400/30' : 'text-slate-600'}
    />
  ),
  Spiritual: (isActive) => (
    <Flame
      size={18}
      strokeWidth={2.5}
      className={isActive ? 'text-amber-300 fill-amber-300' : 'text-slate-600'}
    />
  ),
  Adventure: (isActive) => (
    <Compass
      size={18}
      strokeWidth={2.5}
      className={isActive ? 'text-emerald-300' : 'text-slate-600'}
    />
  ),
  Nature: (isActive) => (
    <Trees
      size={18}
      strokeWidth={2.5}
      className={isActive ? 'text-emerald-300' : 'text-slate-600'}
    />
  ),
};

const filters = ['All', 'Garhwal', 'Kumaon', 'Spiritual', 'Adventure', 'Nature'];

const FilterPills = ({ activeFilter, onFilterChange }) => {
  const handleKey = (e, filter) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFilterChange(filter);
    }
  };

  return (
    <div
      role="group"
      aria-label="Filter destinations by category"
      className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth"
    >
      {filters.map((filter) => {
        const renderIcon = FilterIcons[filter];
        const isActive = activeFilter === filter;
        return (
          <button
            key={filter}
            role="radio"
            aria-checked={isActive}
            tabIndex={0}
            onClick={() => onFilterChange(filter)}
            onKeyDown={(e) => handleKey(e, filter)}
            className={`
              h-[44px] px-5 flex-shrink-0 rounded-full flex items-center justify-center gap-2 text-xs font-bold transition-all duration-300 cursor-pointer select-none active:scale-95
              ${
                isActive
                  ? 'bg-[#0F2B1F] text-white shadow-lg shadow-[#0F2B1F]/30 ring-2 ring-emerald-500/40 border border-emerald-600/50'
                  : 'bg-[#F1F5F1] text-[#334155] hover:bg-stone-200/80 border border-stone-200/70 hover:text-slate-900'
              }
            `}
          >
            {renderIcon && renderIcon(isActive)}
            <span>{filter}</span>
          </button>
        );
      })}
    </div>
  );
};

export default FilterPills;
