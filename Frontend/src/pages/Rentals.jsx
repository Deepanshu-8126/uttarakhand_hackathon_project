import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RentalCard from '../components/RentalCard';
import CategoryHero from '../components/CategoryHero';
import RentalHero from '../components/rentals/RentalHero';
import Pagination from '../components/common/Pagination';
import { useRentals } from '../hooks/useRentals';
import { LocateFixed, X } from 'lucide-react';
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

const Rentals = () => {
  const [searchParams] = useSearchParams();
  const cityParam = searchParams.get('city') || searchParams.get('location') || searchParams.get('q');
  const typeParam = searchParams.get('type') || searchParams.get('vehicle') || searchParams.get('category');
  const budgetParam = searchParams.get('budget') || searchParams.get('max_price') || searchParams.get('price');

  const { rentals, loading, error } = useRentals();
  const [searchQuery, setSearchQuery] = useState(cityParam || '');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxBudget, setMaxBudget] = useState(budgetParam || '');
  const [minRating, setMinRating] = useState('0');
  const [currentPage, setCurrentPage] = useState(1);

  // Global Geolocation States
  const [userLocation, setUserLocation] = useState(getStoredUserLocation());
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Extract unique cities and categories dynamically from data safely
  const cities = useMemo(() => {
    const set = new Set();
    rentals.forEach(r => {
      if (r.city) set.add(r.city);
    });
    return ['All', ...Array.from(set).sort()];
  }, [rentals]);

  // Count vehicles per city for the pills
  const cityCounts = useMemo(() => {
    const counts = {};
    rentals.forEach(r => {
      if (r.city) counts[r.city] = (counts[r.city] || 0) + 1;
    });
    return counts;
  }, [rentals]);

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
          setSearchQuery('');
          if (nearest.isExactMatch) {
            setLocationNotice({
              type: 'exact',
              title: `📍 Verified Fleets in ${nearest.city}`,
              description: `GPS verified your location in ${res.name}. Showing partner fleets ready for immediate pickup in ${nearest.city}!`
            });
          } else {
            setLocationNotice({
              type: 'nearby',
              title: `🚗 Nearest Fleet: ${nearest.city} (~${nearest.distanceKm} km)`,
              description: `You are near ${res.name}. Auto-selected the nearest gateway hub in ${nearest.city} with station & doorstep delivery!`
            });
          }
        } else {
          setLocationNotice({
            type: 'info',
            title: `📍 Location Detected: ${res.name}`,
            description: `Fleets sorted by distance from your current location!`
          });
        }
      } else {
        alert(res.error || 'Could not detect GPS location. You can select your starting city from the pills below.');
      }
    } catch (err) {
      console.warn('GPS detection error:', err);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Sync AI action search params (city, vehicle type, max budget)
  useEffect(() => {
    if (cityParam) {
      setSearchQuery(cityParam);
      const matched = cities.find(c => c.toLowerCase() === cityParam.toLowerCase());
      if (matched) {
        setSelectedCity(matched);
      }
    }
    if (typeParam) {
      const matched = categories.find(c => c.toLowerCase().includes(typeParam.toLowerCase()));
      if (matched) {
        setSelectedCategory(matched);
      } else {
        setSearchQuery(prev => prev ? `${prev} ${typeParam}` : typeParam);
      }
    }
    if (budgetParam) {
      setMaxBudget(budgetParam);
    }
  }, [cityParam, typeParam, budgetParam, cities, categories]);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity, selectedCategory, maxBudget, minRating]);

  const filteredRentals = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let result = rentals.filter(rental => {
      const name = (rental.name || '').toLowerCase();
      const city = (rental.city || '').toLowerCase();
      const bizName = (rental.businessName || '').toLowerCase();
      const type = (rental.type || rental.category || '').toLowerCase();

      const matchSearch = !q || name.includes(q) || city.includes(q) || bizName.includes(q) || type.includes(q);
      const matchCity = selectedCity === 'All' || rental.city === selectedCity;
      const matchCategory = selectedCategory === 'All' || rental.type === selectedCategory || rental.category === selectedCategory;
      const matchBudget = maxBudget === '' || (rental.pricePerDay != null && rental.pricePerDay <= parseInt(maxBudget, 10));
      const matchRating = minRating === '0' || (rental.rating != null && rental.rating >= parseFloat(minRating));

      return matchSearch && matchCity && matchCategory && matchBudget && matchRating;
    });

    // If user coordinates exist, sort by distance
    if (userLocation?.coordinates && Array.isArray(userLocation.coordinates)) {
      const [uLat, uLng] = userLocation.coordinates;
      result = [...result].sort((a, b) => {
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
      });
    }

    return result;
  }, [rentals, searchQuery, selectedCity, selectedCategory, maxBudget, minRating, userLocation]);

  const totalPages = Math.ceil(filteredRentals.length / ITEMS_PER_PAGE);

  const paginatedRentals = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRentals.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRentals, currentPage]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Navbar />
      
      <main className="flex-grow flex flex-col pb-20">
        <RentalHero 
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onDetectLocation={handleDetectLocation}
          isDetectingLocation={isDetectingLocation}
          userLocation={userLocation}
        />
        
        {/* Rent Your Ride Section */}
        <section id="rentals-fleet-grid" className="pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          
          {/* ── SMART GPS & CITY HUBS QUICK SELECTOR ── */}
          <div className="mb-6 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm sm:text-base font-black text-stone-900 tracking-tight">
                    Smart Mountain Fleets & Proximity Hubs
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Select your destination or let GPS instantly match your nearest gateway fleet (e.g. Rudrapur, Haldwani, Dehradun).
                </p>
              </div>

              {/* GPS Auto-Detect & Change City Buttons */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 disabled:opacity-75"
                >
                  {isDetectingLocation ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Detecting GPS Location...</span>
                    </>
                  ) : userLocation ? (
                    <>
                      <LocateFixed size={14} className="text-emerald-400" />
                      <span>📍 GPS: {userLocation.city || userLocation.detectedName?.split(',')[0]} (Refresh)</span>
                    </>
                  ) : (
                    <>
                      <LocateFixed size={14} className="text-emerald-400" />
                      <span>Detect My Location (GPS)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="px-3 py-2.5 rounded-xl border border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition cursor-pointer"
                  title="Search or select any city worldwide"
                >
                  Change City
                </button>
              </div>
            </div>

            {/* Quick City Hub Pills */}
            <div className="pt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1">
                Quick Hubs:
              </span>
              {cities.map((city) => {
                const count = city === 'All' ? rentals.length : (cityCounts[city] || 0);
                const isSelected = selectedCity === city;
                const isUserCity = userLocation?.city?.toLowerCase() === city.toLowerCase();

                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setSelectedCity(city);
                      setSearchQuery('');
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-[#0f3d2e] text-white border-[#0f3d2e] shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {isUserCity && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    <span>{city}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-200/70 text-stone-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Proximity / Nearest Match Banner */}
          {locationNotice && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-3 animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Compass size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                    {locationNotice.title}
                  </h4>
                  <p className="text-xs text-emerald-800/90 mt-0.5 leading-relaxed">
                    {locationNotice.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLocationNotice(null)}
                className="text-emerald-700 hover:text-emerald-950 p-1"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="bg-beige/30 p-6 md:p-8 rounded-[2rem] border border-border-light mb-12 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-bold text-text-dark mb-2">Search</label>
                <input 
                  type="text" 
                  placeholder="Vehicle or city..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="p-3 rounded-xl border border-border-light focus:outline-none focus:border-forest-green"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-text-dark mb-2">City</label>
                <select 
                  value={selectedCity} 
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="p-3 rounded-xl border border-border-light focus:outline-none focus:border-forest-green"
                >
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-text-dark mb-2">Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="p-3 rounded-xl border border-border-light focus:outline-none focus:border-forest-green"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-text-dark mb-2">Max Price/Day</label>
                <input 
                  type="number" 
                  placeholder="e.g. 1500" 
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="p-3 rounded-xl border border-border-light focus:outline-none focus:border-forest-green"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-text-dark mb-2">Min Rating</label>
                <select 
                  value={minRating} 
                  onChange={(e) => setMinRating(e.target.value)}
                  className="p-3 rounded-xl border border-border-light focus:outline-none focus:border-forest-green"
                >
                  <option value="0">Any Rating</option>
                  <option value="4.0">4.0 & above</option>
                  <option value="4.5">4.5 & above</option>
                  <option value="4.8">4.8 & above</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
               <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCity('All');
                    setSelectedCategory('All');
                    setMaxBudget('');
                    setMinRating('0');
                    setLocationNotice(null);
                  }}
                  className="text-sm font-bold text-earth-brown hover:text-text-dark transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
            </div>
          </div>
          
          {/* Results */}
          <div id="rentals-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 scroll-mt-24">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-text text-lg font-bold">Loading rentals...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-red-500 text-lg font-bold">{error}</p>
              </div>
            ) : paginatedRentals.length > 0 ? (
              paginatedRentals.map(rental => (
                <RentalCard 
                  key={rental.id || rental._id} 
                  rental={rental} 
                  userCoords={userLocation?.coordinates}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-text text-lg">No rentals found matching your criteria.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              scrollTargetId="rentals-grid"
            />
          )}
        </section>
      </main>

      {/* Global Location Modal */}
      <GlobalLocationModal 
        isOpen={showLocationModal} 
        onClose={() => setShowLocationModal(false)} 
      />

      <Footer />
    </div>
  );
};

export default Rentals;
