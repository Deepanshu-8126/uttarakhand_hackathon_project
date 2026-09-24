import React, { useState } from 'react';
import { useMapStore } from '../../store/mapStore';
import { useAuth } from '../../context/AuthContext';
import { X, Calendar, Plus, Check, Sparkles, MapPin, ArrowRight, ShieldCheck, Bed, Bike, Car, Compass, Lock, User, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AddToTripModal() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    addToTripModalItem,
    closeAddToTripModal,
    activeTripSession,
    addItemToTripDay
  } = useMapStore();

  const [flowMode, setFlowMode] = useState('existing'); // 'existing' | 'new_trip'
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  if (!addToTripModalItem) return null;

  const item = addToTripModalItem;
  const itemType = (item.type || item.itemType || 'activity').toLowerCase();
  const isStay = itemType === 'stay' || itemType === 'hotel' || itemType === 'homestay';
  const isRental = itemType === 'rental' || itemType === 'car' || itemType === 'bike' || itemType === 'scooty';

  const days = activeTripSession?.dayPlans && activeTripSession.dayPlans.length > 0
    ? activeTripSession.dayPlans
    : [
        { dayNumber: 1, title: 'Day 1: Arrival & Transfer', activities: [], stays: [], rentals: [] },
        { dayNumber: 2, title: 'Day 2: Sightseeing & Experiences', activities: [], stays: [], rentals: [] },
        { dayNumber: 3, title: 'Day 3: Scenic Views & Return', activities: [], stays: [], rentals: [] }
      ];

  const destName = activeTripSession?.destination?.name || activeTripSession?.destination || item.location || item.city || item.district || 'Uttarakhand';
  const activeDuration = activeTripSession?.duration || `${days.length} Days`;

  const handleConfirm = () => {
    if (flowMode === 'new_trip') {
      closeAddToTripModal();
      const params = new URLSearchParams({
        rental_id: item._id || item.id || '',
        rental_name: item.name || '',
        location: item.city || item.location || item.district || 'Haldwani',
        price: String(item.pricePerDay || item.price || 500),
        type: item.type || (isRental ? 'Bike' : 'Stay')
      });
      navigate(`/trip-planner?${params.toString()}`);
    } else {
      addItemToTripDay(selectedDayIdx, item);
      closeAddToTripModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={closeAddToTripModal} />

      <div className="relative w-full max-w-lg bg-[#fdfbf7] rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-2xl z-10 animate-in slide-in-from-bottom-8 duration-200">
        
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-stone-200/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0f3d2e] text-[10px] font-bold uppercase tracking-wider mb-1.5 border border-emerald-200">
              <Sparkles size={12} className="text-emerald-600" />
              <span>Smart Bridge · Context Planner</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
              Add to your journey
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Seamlessly connect this {isRental ? 'ride' : isStay ? 'stay' : 'experience'} into your itinerary
            </p>
          </div>

          <button
            type="button"
            onClick={closeAddToTripModal}
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Item Summary Card */}
        <div className="my-3.5 p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0">
            <img
              src={item.image?.url || (typeof item.image === 'string' ? item.image : null) || (Array.isArray(item.images) && item.images[0]) || '/assets/fallback.svg'}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = '/assets/fallback.svg'; }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-[#0f3d2e] border border-emerald-200">
                {isStay ? 'Mountain Stay' : isRental ? 'Vehicle Rental' : 'Activity & Trail'}
              </span>
              {item.pricePerDay && (
                <span className="text-xs font-black text-slate-800">
                  ₹{item.pricePerDay}/day
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm text-slate-900 truncate mt-0.5">
              {item.name}
            </h4>
            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-emerald-700 shrink-0" />
              <span>{item.location || item.city || item.district || 'Uttarakhand'}</span>
            </p>
          </div>
        </div>

        {/* If user is NOT authenticated, show Login Gate */}
        {!isAuthenticated ? (
          <div className="py-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3 border border-amber-200 shadow-xs">
              <Lock size={22} className="text-amber-700" />
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Sign In Required
            </span>

            <h3 className="text-lg font-black text-stone-900 mt-2 mb-1">
              Sign in to save this to your trip
            </h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto mb-5 leading-relaxed">
              Please sign in to add <strong className="text-stone-900">{item.name}</strong> to your personalized itinerary, sync with live GPS navigation, and unlock AI Copilot optimization.
            </p>

            <div className="space-y-2 max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => {
                  closeAddToTripModal();
                  navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                }}
                className="w-full bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn size={15} />
                <span>Sign In / Create Account</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  closeAddToTripModal();
                  const params = new URLSearchParams({
                    rental_id: item._id || item.id || '',
                    rental_name: item.name || '',
                    location: item.city || item.location || item.district || 'Haldwani',
                    price: String(item.pricePerDay || item.price || 500),
                    type: item.type || (isRental ? 'Bike' : 'Stay')
                  });
                  navigate(`/trip-planner?${params.toString()}`);
                }}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Continue to AI Trip Planner as Guest</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 2 Flow Mode Cards (Smart Bridge) */}
            <div className="space-y-2.5 my-3.5">
              
              {/* Option A: Add to Existing Trip */}
              <div
                onClick={() => setFlowMode('existing')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  flowMode === 'existing'
                    ? 'bg-white border-[#0f3d2e] shadow-xs ring-2 ring-[#0f3d2e]/15'
                    : 'bg-stone-50/80 border-stone-200 hover:bg-white text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="flowMode"
                  checked={flowMode === 'existing'}
                  onChange={() => setFlowMode('existing')}
                  className="mt-1 text-[#0f3d2e] focus:ring-[#0f3d2e] accent-[#0f3d2e]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Add to active trip: <span className="text-[#0f3d2e]">{destName}</span> ({activeDuration})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Attach this item to a specific day in your ongoing itinerary.
                  </p>

                  {/* Collapsible Day Picker if Option A is selected */}
                  {flowMode === 'existing' && (
                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                      {days.map((d, dIdx) => (
                        <button
                          key={dIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDayIdx(dIdx);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            selectedDayIdx === dIdx
                              ? 'bg-[#0f3d2e] text-white shadow-2xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-slate-700'
                          }`}
                        >
                          Day {dIdx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Option B: Create a NEW Trip around this Anchor */}
              <div
                onClick={() => setFlowMode('new_trip')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  flowMode === 'new_trip'
                    ? 'bg-emerald-50/90 border-[#0f3d2e] shadow-xs ring-2 ring-[#0f3d2e]/15'
                    : 'bg-stone-50/80 border-stone-200 hover:bg-white text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="flowMode"
                  checked={flowMode === 'new_trip'}
                  onChange={() => setFlowMode('new_trip')}
                  className="mt-1 text-[#0f3d2e] focus:ring-[#0f3d2e] accent-[#0f3d2e]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-emerald-950">
                      Create a NEW trip around this {isRental ? 'ride' : 'booking'}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800/90 mt-0.5">
                    Trip Planner will automatically lock this {item.name} as the trip anchor and craft the optimal mountain route from {item.city || item.location || 'Haldwani'}.
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Action Buttons */}
            <div className="pt-3 border-t border-stone-200/80 flex items-center gap-3">
              <button
                type="button"
                onClick={closeAddToTripModal}
                className="w-1/3 py-3 rounded-xl border border-stone-300 hover:bg-stone-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleConfirm}
                className="w-2/3 py-3 rounded-xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
              >
                {flowMode === 'new_trip' ? (
                  <>
                    <span>Launch Trip Planner</span>
                    <ArrowRight size={14} className="text-emerald-300" />
                  </>
                ) : (
                  <>
                    <Check size={15} className="text-emerald-300" />
                    <span>Confirm &amp; Add</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
