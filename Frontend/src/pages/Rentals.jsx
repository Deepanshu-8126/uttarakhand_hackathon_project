import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RentalCard from '../components/RentalCard';
import Pagination from '../components/common/Pagination';
import RentalSearchCard from '../components/rentals/RentalSearchCard';
import RentalFiltersSidebar from '../components/rentals/RentalFiltersSidebar';
import RentalDetailModal from '../components/rentals/RentalDetailModal';
import { useRentals } from '../hooks/useRentals';
import { 
  Filter, 
  ArrowUpDown, 
  MapPin, 
  X, 
  Car, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { 
  detectBrowserLocation, 
  findNearestHub, 
  getStoredUserLocation, 
  setStoredUserLocation, 
  calculateDistanceKm, 
  UTTARAKHAND_CITY_COORDINATES 
} from '../utils/geoHelpers';
import GlobalLocationModal from '../components/GlobalLocationModal';

const ITEMS_PER_PAGE = 12;

export default function Rentals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cityParam = searchParams.get('city') || searchParams.get('location') || searchParams.get('q');
  const typeParam = searchParams.get('type') || searchParams.get('vehicle') || searchParams.get('category');
  const budgetParam = searchParams.get('budget') || searchParams.get('max_price') || searchParams.get('price');
  const startParam = searchParams.get('startDate') || searchParams.get('start');
  const endParam = searchParams.get('endDate') || searchParams.get('end');

  const { rentals, loading, error, refetch } = useRentals();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(cityParam || 'All');
  const [selectedCategory, setSelectedCategory] = useState(typeParam || 'All');
  const [transmission, setTransmission] = useState('All');
  const [seats, setSeats] = useState('All');
  const [fuelType, setFuelType] = useState('All');
  const [maxBudget, setMaxBudget] = useState(budgetParam || '');
  const [minRating, setMinRating] = useState('0');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'distance'
  
  // Date States
  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultEndStr = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(startParam || todayStr);
  const [endDate, setEndDate] = useState(endParam || defaultEndStr);

  // Pagination & Modals
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilterModal, setShowMobileFilterModal] = useState(false);
  const [selectedRentalForDetail, setSelectedRentalForDetail] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Geolocation States
  const [userLocation, setUserLocation] = useState(getStoredUserLocation());
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Extract unique cities safely from backend dataset
  const cities = useMemo(() => {
    const set = new Set();
    rentals.forEach(r => {
      if (r.city) set.add(r.city);
    });
    return ['All', ...Array.from(set).sort()];
  }, [rentals]);

  // Count vehicles per city
  const cityCounts = useMemo(() => {
    const counts = { All: rentals.length };
    rentals.forEach(r => {
      if (r.city) counts[r.city] = (counts[r.city] || 0) + 1;
    });
    return counts;
  }, [rentals]);

  // Extract categories dynamically
  const categories = useMemo(() => {
    const set = new Set();
    rentals.forEach(r => {
      const type = r.type || r.category;
      if (type) set.add(type);
    });
    return ['All', ...Array.from(set).sort()];
  }, [rentals]);

  // Listen to global location updates
  useEffect(() => {
    const handleLocationUpdate = (e) => {
      if (e.detail) {
        setUserLocation(e.detail);
      }
    };
    window.addEventListener('discovery_location_updated', handleLocationUpdate);
    return () => window.removeEventListener('discovery_location_updated', handleLocationUpdate);
  }, []);

  // Handle GPS Auto-Detection
  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const res = await detectBrowserLocation();
      if (res.success && res.coordinates) {
        const [lat, lng] = res.coordinates;
        const nearest = findNearestHub(lat, lng, cities);
        
        const locationData = {
          city: nearest?.city || res.name.split(',')[0].trim(),
          detectedName: res.name,
          coordinates: [lat, lng],
          nearestHub: nearest
        };

        setUserLocation(locationData);
        setStoredUserLocation(locationData);

        if (nearest && nearest.city) {
          setSelectedCity(nearest.city);
        }
      } else {
        alert(res.error || 'Could not detect GPS location. You can select your starting city from the hubs.');
      }
    } catch (err) {
      console.warn('GPS detection error:', err);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Sync AI copilot / query params
  useEffect(() => {
    if (cityParam) {
      const matched = cities.find(c => c.toLowerCase() === cityParam.toLowerCase());
      if (matched) {
        setSelectedCity(matched);
      } else {
        setSearchQuery(cityParam);
      }
    }
    if (typeParam) {
      setSelectedCategory(typeParam);
    }
    if (budgetParam) {
      setMaxBudget(budgetParam);
    }
  }, [cityParam, typeParam, budgetParam, cities]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity, selectedCategory, transmission, seats, fuelType, maxBudget, minRating, verifiedOnly, sortBy]);

  // Main Filtering Logic
  const filteredRentals = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    let result = rentals.filter(rental => {
      const name = (rental.name || '').toLowerCase();
      const city = (rental.city || '').toLowerCase();
      const bizName = (rental.businessName || '').toLowerCase();
      const type = (rental.type || rental.category || '').toLowerCase();

      // Search match
      const matchSearch = !q || name.includes(q) || city.includes(q) || bizName.includes(q) || type.includes(q);

      // City match
      const matchCity = selectedCity === 'All' || rental.city?.toLowerCase() === selectedCity.toLowerCase();

      // Category match
      let matchCategory = true;
      if (selectedCategory !== 'All') {
        const catTarget = selectedCategory.toLowerCase();
        matchCategory = type.includes(catTarget) || 
          (rental.category && rental.category.toLowerCase().includes(catTarget));
      }

      // Transmission match
      let matchTransmission = true;
      if (transmission !== 'All') {
        const trans = (rental.transmission || '').toLowerCase();
        if (transmission === 'Automatic') {
          matchTransmission = trans.includes('auto') || type.includes('scooter');
        } else {
          matchTransmission = trans.includes('manual') || !type.includes('scooter');
        }
      }

      // Seats match
      let matchSeats = true;
      if (seats !== 'All') {
        const seatNum = parseInt(seats, 10);
        const rSeats = rental.seats || (type.includes('bike') || type.includes('scooter') ? 2 : 5);
        if (seatNum === 2) matchSeats = rSeats <= 2;
        else if (seatNum === 5) matchSeats = rSeats >= 4 && rSeats <= 5;
        else if (seatNum === 7) matchSeats = rSeats >= 6 && rSeats <= 7;
        else if (seatNum === 8) matchSeats = rSeats >= 8;
      }

      // Fuel Type match
      let matchFuel = true;
      if (fuelType !== 'All') {
        const fuel = (rental.fuelType || '').toLowerCase();
        matchFuel = fuel.includes(fuelType.toLowerCase());
      }

      // Budget match
      const priceVal = rental.pricePerDay || (typeof rental.price === 'object' ? rental.price?.amount : rental.price);
      const matchBudget = maxBudget === '' || (priceVal != null && priceVal <= parseInt(maxBudget, 10));

      // Rating match
      const matchRating = minRating === '0' || (rental.rating != null && rental.rating >= parseFloat(minRating));

      // Verified Only match
      let matchVerified = true;
      if (verifiedOnly) {
        matchVerified = Boolean(
          rental.isVerified || 
          rental.partnerListingId || 
          rental.isPartnerListing || 
          rental.partnerVerified || 
          rental.partnerId?.isVerified
        );
      }

      return matchSearch && matchCity && matchCategory && matchTransmission && matchSeats && matchFuel && matchBudget && matchRating && matchVerified;
    });

    // Sorting Logic
    return [...result].sort((a, b) => {
      const priceA = a.pricePerDay || (typeof a.price === 'object' ? a.price?.amount : a.price) || 0;
      const priceB = b.pricePerDay || (typeof b.price === 'object' ? b.price?.amount : b.price) || 0;

      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);

      if (sortBy === 'distance' && userLocation?.coordinates) {
        const [uLat, uLng] = userLocation.coordinates;
        const getDist = (item) => {
          if (item.location?.coordinates?.length === 2) {
            return calculateDistanceKm(uLat, uLng, item.location.coordinates[1], item.location.coordinates[0]) ?? 9999;
          }
          if (item.city) {
            const coords = UTTARAKHAND_CITY_COORDINATES[item.city.trim().toLowerCase()];
            if (coords) return calculateDistanceKm(uLat, uLng, coords[0], coords[1]) ?? 9999;
          }
          return 9999;
        };
        return getDist(a) - getDist(b);
      }

      // Default: Recommended (Verified listings & highest ratings first)
      const isVerifiedA = a.isVerified || a.isPartnerListing ? 1 : 0;
      const isVerifiedB = b.isVerified || b.isPartnerListing ? 1 : 0;
      if (isVerifiedB !== isVerifiedA) return isVerifiedB - isVerifiedA;
      return (b.rating || 4.5) - (a.rating || 4.5);
    });
  }, [rentals, searchQuery, selectedCity, selectedCategory, transmission, seats, fuelType, maxBudget, minRating, verifiedOnly, sortBy, userLocation]);

  const totalPages = Math.ceil(filteredRentals.length / ITEMS_PER_PAGE);

  const paginatedRentals = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRentals.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRentals, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCity('All');
    setSelectedCategory('All');
    setTransmission('All');
    setSeats('All');
    setFuelType('All');
    setMaxBudget('');
    setMinRating('0');
    setVerifiedOnly(false);
    setSortBy('recommended');
  };

  const hasActiveFilters = selectedCity !== 'All' || 
    selectedCategory !== 'All' || 
    transmission !== 'All' || 
    seats !== 'All' || 
    fuelType !== 'All' || 
    maxBudget !== '' || 
    minRating !== '0' || 
    verifiedOnly || 
    Boolean(searchQuery);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Navbar />

      <main className="flex-grow flex flex-col">
        {/* ── 1. Compact Header Section (Replaces the huge promotional hero) ── */}
        <section className="bg-gradient-to-b from-stone-100/90 to-[#fdfbf7] pt-8 pb-6 px-4 sm:px-6 lg:px-8 border-b border-stone-200/60">
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center sm:text-left mb-6">
              <span className="text-xs font-black tracking-widest uppercase text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300/50 inline-block mb-2">
                Himalayan Vehicle Fleet Marketplace
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight">
                Rent a vehicle for your Uttarakhand journey
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-2xl">
                Cars, 4x4 SUVs, touring bikes and local scooters from verified rental partners near your destination.
              </p>
            </div>

            {/* ── 2. Primary Focal Point Search Card ── */}
            <RentalSearchCard 
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              cities={cities}
              cityCounts={cityCounts}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
              seats={seats}
              onSeatsChange={setSeats}
              userLocation={userLocation}
              onDetectLocation={handleDetectLocation}
              isDetectingLocation={isDetectingLocation}
              onSearchSubmit={() => {
                const el = document.getElementById('marketplace-results');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>
        </section>

        {/* ── 3. Marketplace Body Layout (Filters Left, Results Right) ── */}
        <section id="marketplace-results" className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-grow">
          
          {/* Mobile Filter & Sort Bar (< 1024px) */}
          <div className="lg:hidden mb-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowMobileFilterModal(true)}
              className="flex-1 py-2.5 px-4 bg-white rounded-xl border border-stone-200 shadow-xs flex items-center justify-center gap-2 text-xs font-bold text-stone-800 cursor-pointer active:scale-98"
            >
              <Filter size={14} className="text-emerald-800" />
              <span>Filters {hasActiveFilters && '•'}</span>
            </button>

            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2.5 px-3.5 bg-white rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:outline-none focus:border-emerald-700 cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="distance">Nearest to You</option>
              </select>
            </div>
          </div>

          <div className="flex items-start gap-8">
            
            {/* Desktop Left Sidebar: Collapsible Filters */}
            <aside className="hidden lg:block w-72 shrink-0 sticky top-24">
              <RentalFiltersSidebar 
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                transmission={transmission}
                onTransmissionChange={setTransmission}
                seats={seats}
                onSeatsChange={setSeats}
                fuelType={fuelType}
                onFuelTypeChange={setFuelType}
                maxBudget={maxBudget}
                onMaxBudgetChange={setMaxBudget}
                minRating={minRating}
                onMinRatingChange={setMinRating}
                verifiedOnly={verifiedOnly}
                onVerifiedOnlyChange={setVerifiedOnly}
                onResetFilters={handleResetFilters}
              />
            </aside>

            {/* Main Center Area: Results Header & Grid */}
            <div className="flex-1 w-full min-w-0">
              
              {/* Results Control Bar */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-stone-900 tracking-tight">
                    {loading ? (
                      'Loading verified fleets...'
                    ) : (
                      <>
                        <span className="text-emerald-800">{filteredRentals.length}</span> {filteredRentals.length === 1 ? 'vehicle' : 'vehicles'} available
                        {selectedCity !== 'All' && <span> in {selectedCity}</span>}
                      </>
                    )}
                  </h2>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Verified pricing &amp; doorstep handover from authorized Himalayan partners.
                  </p>
                </div>

                {/* Desktop Sort Dropdown */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                    <ArrowUpDown size={12} />
                    <span>Sort by:</span>
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:outline-none focus:border-emerald-700 cursor-pointer"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                    <option value="rating">Customer Rating</option>
                    <option value="distance">Distance from GPS</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Badges */}
              {hasActiveFilters && (
                <div className="flex items-center gap-1.5 flex-wrap mb-5">
                  <span className="text-xs font-bold text-stone-400 mr-1">Active filters:</span>
                  
                  {selectedCity !== 'All' && (
                    <button
                      onClick={() => setSelectedCity('All')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-800 text-xs font-semibold cursor-pointer"
                    >
                      <span>📍 {selectedCity}</span>
                      <X size={12} />
                    </button>
                  )}

                  {selectedCategory !== 'All' && (
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-800 text-xs font-semibold cursor-pointer"
                    >
                      <span>🚗 {selectedCategory}</span>
                      <X size={12} />
                    </button>
                  )}

                  {transmission !== 'All' && (
                    <button
                      onClick={() => setTransmission('All')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-800 text-xs font-semibold cursor-pointer"
                    >
                      <span>⚙️ {transmission}</span>
                      <X size={12} />
                    </button>
                  )}

                  {maxBudget && (
                    <button
                      onClick={() => setMaxBudget('')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-800 text-xs font-semibold cursor-pointer"
                    >
                      <span>₹ Max {maxBudget}</span>
                      <X size={12} />
                    </button>
                  )}

                  {verifiedOnly && (
                    <button
                      onClick={() => setVerifiedOnly(false)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-semibold cursor-pointer"
                    >
                      <span>✓ Verified Only</span>
                      <X size={12} />
                    </button>
                  )}

                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-emerald-800 hover:text-emerald-950 font-bold underline ml-1 cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* ── 4. Rental Inventory Grid ── */}
              <div id="rentals-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 scroll-mt-24">
                {loading ? (
                  <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-stone-200/80">
                    <div className="w-10 h-10 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-stone-700 font-bold text-sm">Loading verified vehicle inventory...</p>
                    <p className="text-stone-400 text-xs mt-1">Connecting to Uttarakhand partner database</p>
                  </div>
                ) : error ? (
                  <div className="col-span-full text-center py-16 px-4 bg-white rounded-3xl border border-stone-200">
                    <div className="max-w-md mx-auto text-center">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center mx-auto mb-3">
                        <AlertCircle size={24} />
                      </div>
                      <h3 className="text-base font-bold text-stone-900 mb-1">
                        Unable to load rentals right now
                      </h3>
                      <p className="text-xs text-stone-500 mb-4">
                        {error}
                      </p>
                      <button
                        type="button"
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f3d2e] hover:bg-[#144c3a] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        <RotateCcw size={14} />
                        <span>Retry Loading Fleets</span>
                      </button>
                    </div>
                  </div>
                ) : paginatedRentals.length > 0 ? (
                  paginatedRentals.map(rental => (
                    <RentalCard 
                      key={rental.id || rental._id} 
                      rental={rental} 
                      userCoords={userLocation?.coordinates}
                      startDate={startDate}
                      endDate={endDate}
                      onOpenDetail={(r) => setSelectedRentalForDetail(r)}
                    />
                  ))
                ) : (
                  /* ── Empty State (Section 24) ── */
                  <div className="col-span-full py-16 px-4 bg-white rounded-3xl border border-stone-200 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-3">
                        <Car size={24} />
                      </div>
                      <h3 className="text-base font-bold text-stone-900 mb-1">
                        No verified rentals found {selectedCity !== 'All' ? `in ${selectedCity}` : ''}
                      </h3>
                      <p className="text-xs text-stone-500 mb-5 leading-relaxed">
                        Try clearing your filters or select one of the major gateway hubs like Haldwani, Kathgodam or Dehradun.
                      </p>

                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="px-4 py-2 bg-[#0f3d2e] text-white rounded-xl text-xs font-bold transition cursor-pointer hover:bg-[#144c3a]"
                        >
                          Clear All Filters
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCity('Haldwani');
                            setSearchQuery('');
                          }}
                          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Browse Haldwani Fleets
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {!loading && !error && filteredRentals.length > ITEMS_PER_PAGE && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    scrollTargetId="rentals-grid"
                  />
                </div>
              )}

            </div>
          </div>
        </section>
      </main>

      {/* ── Quick Detail Modal (Section 26) ── */}
      <RentalDetailModal
        rental={selectedRentalForDetail}
        isOpen={Boolean(selectedRentalForDetail)}
        onClose={() => setSelectedRentalForDetail(null)}
        startDate={startDate}
        endDate={endDate}
      />

      {/* ── Mobile Filters Bottom Sheet Modal ── */}
      {showMobileFilterModal && (
        <div className="lg:hidden fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-end justify-center p-0 animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowMobileFilterModal(false)} />
          <div className="relative w-full z-10">
            <RentalFiltersSidebar 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              transmission={transmission}
              onTransmissionChange={setTransmission}
              seats={seats}
              onSeatsChange={setSeats}
              fuelType={fuelType}
              onFuelTypeChange={setFuelType}
              maxBudget={maxBudget}
              onMaxBudgetChange={setMaxBudget}
              minRating={minRating}
              onMinRatingChange={setMinRating}
              verifiedOnly={verifiedOnly}
              onVerifiedOnlyChange={setVerifiedOnly}
              onResetFilters={handleResetFilters}
              isMobileModal={true}
              onCloseMobileModal={() => setShowMobileFilterModal(false)}
            />
          </div>
        </div>
      )}

      {/* Global Location Modal */}
      <GlobalLocationModal 
        isOpen={showLocationModal} 
        onClose={() => setShowLocationModal(false)} 
      />

      <Footer />
    </div>
  );
}
