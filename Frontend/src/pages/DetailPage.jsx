import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReviewSection from '../components/ReviewSection';
import BookingModal from '../components/booking/BookingModal';
import { ArrowLeft, Star, MapPin, Calendar, Compass, Phone, ShieldCheck, ChevronRight, Mountain, Sparkles, CheckCircle2, AlertCircle, Minus, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../api/bookingApi';
import { useMapStore } from '../store/mapStore';
import api from '../api/api';

import { getRentals, getVehicleImage } from '../api/rentalApi';
import { getStays } from '../api/stayApi';
import { getSpiritualPlaces } from '../api/spiritualApi';
import { getCulturePlaces } from '../api/cultureApi';
import { getHimalayanFallbackImage } from '../utils/imageHelpers';

const categoryNames = {
  rentals: 'Rentals',
  stays: 'Stays',
  spiritual: 'Spiritual',
  culture: 'Culture',
  activities: 'Activities'
};

const normalizeImgUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  let fixed = url;
  if (fixed.includes('upload.wikimedia.org/wikipedia/commons/thumb/')) {
    fixed = fixed.replace('upload.wikimedia.org/wikipedia/commons/thumb/', 'thumb.wikimedia.org/wikipedia/commons/thumb/');
  }
  if (fixed.includes('/1280px-')) {
    fixed = fixed.replace('/1280px-', '/1920px-');
  }
  return fixed;
};

const getImageSrc = (record, cat = '') => {
  if (!record) return getHimalayanFallbackImage(null);
  if (record.coverImage?.url && !record.coverImage.url.includes('Bhatta_fall') && !record.coverImage.url.includes('Lake_Mist')) return normalizeImgUrl(record.coverImage.url);
  if (typeof record.coverImage === 'string' && record.coverImage.length > 0) return normalizeImgUrl(record.coverImage);
  if (record.image?.url) return normalizeImgUrl(record.image.url);
  if (typeof record.image === 'string' && record.image.length > 0) return normalizeImgUrl(record.image);
  if (Array.isArray(record.images) && record.images.length > 0) {
    const first = record.images[0];
    if (first?.url) return normalizeImgUrl(first.url);
    if (typeof first === 'string' && first.length > 0) return normalizeImgUrl(first);
  }
  if (Array.isArray(record.gallery) && record.gallery.length > 0) {
    const first = record.gallery[0];
    if (first?.url) return normalizeImgUrl(first.url);
    if (typeof first === 'string' && first.length > 0) return normalizeImgUrl(first);
  }
  return getHimalayanFallbackImage(record);
};

const DetailPage = () => {
  const { category, slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, requireAuth } = useAuth();
  
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const threeDaysStr = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10);

  const [bookingData, setBookingData] = useState({
    startDate: tomorrowStr,
    endDate: threeDaysStr,
    guests: 1
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMsg, setBookingMsg] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Dynamic nights calculation
  const nights = useMemo(() => {
    if (!bookingData.startDate || !bookingData.endDate) return 1;
    const s = new Date(bookingData.startDate);
    const e = new Date(bookingData.endDate);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [bookingData.startDate, bookingData.endDate]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Direct fetch by slug if possible
        let found = null;
        try {
          const directRes = await api.get(`/${category}/${slug}`);
          if (directRes.data?.success && directRes.data?.data) {
            found = directRes.data.data;
          }
        } catch {
          // fallback to list fetch
        }

        if (!found) {
          let res;
          if (category === 'rentals' || category === 'rental') res = await getRentals();
          else if (category === 'stays' || category === 'stay') res = await getStays();
          else if (category === 'spiritual') res = await getSpiritualPlaces();
          else if (category === 'culture') res = await getCulturePlaces();
          else if (category === 'activities' || category === 'activity') res = await getActivities();

          if (res && res.success && Array.isArray(res.data)) {
            found = res.data.find(i => i.slug === slug || i._id === slug);
          }
        }

        if (found) {
          setItem(found);
        } else {
          setError('Unable to load details. Item not found.');
        }

        // 2. Fetch related items
        try {
          const relRes = await api.get(`/${category}/${slug}/related`);
          if (relRes.data?.success && relRes.data?.data) {
            setRelated(relRes.data.data);
          }
        } catch {
          // related is optional
        }
      } catch (err) {
        setError('Unable to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [category, slug]);

  const handleReserveClick = () => {
    if (!bookingData.startDate || !bookingData.endDate) {
      setBookingMsg('Please select check-in and check-out dates.');
      return;
    }
    if (new Date(bookingData.endDate) <= new Date(bookingData.startDate)) {
      setBookingMsg('Check-out date must be after check-in date.');
      return;
    }
    setBookingMsg('');
    
    // Auth gate with intent preservation (Section 22)
    requireAuth(() => {
      setShowBookingModal(true);
    });
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    if (category === 'rentals') {
      e.target.src = getVehicleImage(item?.name, item?.category || item?.type);
    } else {
      e.target.src = getHimalayanFallbackImage(item);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 border-4 border-beige border-t-forest-green rounded-full animate-spin mb-4"></div>
          <h2 className="text-2xl font-bold text-text-dark">Loading details...</h2>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center py-24">
          <h2 className="text-3xl font-bold text-text-dark mb-4">{error || 'Item Not Found'}</h2>
          <Link to={`/${category}`} className="bg-forest-green text-white px-8 py-3 font-bold rounded-full hover:bg-dark-green transition-all shadow-md">
            Return to {categoryNames[category] || 'Home'}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const resolvedHeroImg = getImageSrc(item, category);
  const locationText = item.district ? `${item.district}${item.region ? `, ${item.region}` : ''}` : (typeof item.location === 'string' ? item.location : (item.city || 'Uttarakhand'));
  const bestTime = item.bestTimeToVisit || item.bestTime;
  const experiences = item.experiences || item.highlights || item.features || item.facilities || item.amenities || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Navbar />
      
      <main className="flex-grow flex flex-col pb-16">
        {/* Back button */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full my-6">
          <Link 
            to={`/${category}`} 
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 hover:text-forest-green font-bold text-xs sm:text-sm border border-slate-200/80 shadow-xs transition-all duration-200 group cursor-pointer"
          >
            <ArrowLeft size={16} className="text-forest-green group-hover:-translate-x-1 transition-transform" /> 
            <span>Back to {categoryNames[category] || 'Explore'}</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-14">
          <div className="relative w-full h-[500px] md:h-[600px] rounded-[2.5rem] overflow-hidden bg-beige shadow-md">
            <img 
              src={resolvedHeroImg} 
              alt={item.name}
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
            {category === 'rentals' && (
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white/95 text-xs font-semibold px-3 py-1 rounded-full shadow-sm tracking-wide">
                Representative photo
              </div>
            )}
            {(item.image?.attribution || item.coverImage?.attribution) && (
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white/80 text-[10px] px-2.5 py-1 rounded">
                Photo: {item.image?.attribution || item.coverImage?.attribution}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-14">
              <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs font-black tracking-widest px-3.5 py-1.5 rounded-full mb-3 uppercase border border-white/20">
                {item.category || item.label || item.type || categoryNames[category]}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-3 drop-shadow-md font-display">
                {item.name}
              </h1>
              <p className="text-lg md:text-xl text-white/90 font-medium flex items-center gap-2 drop-shadow">
                <MapPin size={18} /> {locationText}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="px-4 md:px-8 max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          <div className="lg:col-span-2 flex flex-col gap-10">
            
            <section className="bg-white p-8 md:p-10 rounded-3xl border border-border-light card-shadow">
              <h3 className="text-2xl font-black text-text-dark mb-4 font-display uppercase tracking-wide">
                Overview
              </h3>
              <p className="text-base text-muted-text leading-relaxed mb-6 whitespace-pre-line">
                {item.shortDescription || item.description}
              </p>
              
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border-light">
                {item.rating && item.rating > 0 ? (
                  <div className="flex items-center gap-1.5 bg-[#faf9f6] px-4 py-2 rounded-full font-bold text-xs text-text-dark border border-border-light">
                    <Star size={16} className="text-earth-brown fill-earth-brown" />
                    {item.rating} Rating
                  </div>
                ) : null}
                <div className="flex items-center gap-1.5 bg-[#faf9f6] px-4 py-2 rounded-full font-bold text-xs text-text-dark border border-border-light">
                  <MapPin size={16} className="text-earth-brown" />
                  {locationText}
                </div>
                {bestTime && (
                  <div className="flex items-center gap-1.5 bg-[#faf9f6] px-4 py-2 rounded-full font-bold text-xs text-text-dark border border-border-light">
                    <Calendar size={16} className="text-earth-brown" />
                    Best Time: {bestTime}
                  </div>
                )}
                {item.elevation && (
                  <div className="flex items-center gap-1.5 bg-[#faf9f6] px-4 py-2 rounded-full font-bold text-xs text-text-dark border border-border-light">
                    Elevation: {item.elevation}m
                  </div>
                )}
              </div>
            </section>

            {experiences.length > 0 && (
              <section className="bg-white p-8 rounded-3xl border border-border-light card-shadow">
                <h3 className="text-xl font-black text-text-dark mb-4 font-display uppercase tracking-wide">
                  Highlights & Experiences
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {experiences.map((feat, idx) => (
                    <span key={idx} className="px-4 py-2 bg-[#faf9f6] text-text-dark rounded-full font-bold text-xs border border-border-light shadow-sm">
                      {feat}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {item.significance && (
              <section className="bg-forest-green text-white p-8 rounded-3xl shadow-md">
                <h3 className="text-xl font-black mb-3 font-display uppercase tracking-wide">Significance</h3>
                <p className="text-base text-white/90 leading-relaxed">{item.significance}</p>
              </section>
            )}

          </div>

          {/* Sidebar / Booking Box */}
          <div className="flex flex-col gap-8">
            <div className="bg-white p-7 md:p-8 rounded-3xl border border-border-light card-shadow sticky top-32">
              {(() => {
                const rawPriceVal = item.pricePerDay || item.pricePerNight || (typeof item.price === 'object' && item.price !== null ? item.price.amount : item.price);
                return rawPriceVal ? (
                  <>
                    <div className="flex items-end justify-between gap-2 mb-5 border-b border-border-light pb-5">
                      <div>
                        <span className="text-3xl font-black text-earth-brown">₹{Number(rawPriceVal).toLocaleString('en-IN')}</span>
                        <span className="text-muted-text font-medium text-xs sm:text-sm ml-1">{item.unit || (category === 'rentals' ? '/day' : '/night')}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ✓ Verified Tariff
                      </span>
                    </div>
                    
                    <div className="space-y-4 mb-5">
                      <div>
                        <label className="block text-xs font-bold text-text-dark uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Calendar size={13} className="text-forest-green" />
                          <span>Check-in Date</span>
                        </label>
                        <input 
                          type="date" 
                          min={todayStr}
                          value={bookingData.startDate} 
                          onChange={e => {
                            const newStart = e.target.value;
                            setBookingData(prev => ({
                              ...prev,
                              startDate: newStart,
                              endDate: prev.endDate && new Date(prev.endDate) <= new Date(newStart)
                                ? new Date(new Date(newStart).getTime() + 86400000).toISOString().slice(0, 10)
                                : prev.endDate
                            }));
                          }} 
                          className="w-full p-3 border border-border-light rounded-xl outline-none focus:border-forest-green text-sm bg-stone-50/50" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-dark uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Calendar size={13} className="text-forest-green" />
                          <span>Check-out Date</span>
                        </label>
                        <input 
                          type="date" 
                          min={bookingData.startDate || todayStr}
                          value={bookingData.endDate} 
                          onChange={e => setBookingData({...bookingData, endDate: e.target.value})} 
                          className="w-full p-3 border border-border-light rounded-xl outline-none focus:border-forest-green text-sm bg-stone-50/50" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-dark uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Guests</span>
                          <span className="text-[11px] text-muted-text font-normal">Max capacity on booking</span>
                        </label>
                        <div className="flex items-center border border-border-light rounded-xl overflow-hidden bg-stone-50/50">
                          <button
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, guests: Math.max(1, prev.guests - 1) }))}
                            className="p-3 hover:bg-stone-100 text-stone-600 transition cursor-pointer"
                          >
                            <Minus size={14} />
                          </button>
                          <input 
                            type="number" 
                            min="1" 
                            max="20"
                            value={bookingData.guests} 
                            onChange={e => setBookingData({...bookingData, guests: Math.max(1, parseInt(e.target.value, 10) || 1)})} 
                            className="w-full p-2.5 text-center outline-none bg-transparent text-sm font-bold text-text-dark" 
                          />
                          <button
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, guests: prev.guests + 1 }))}
                            className="p-3 hover:bg-stone-100 text-stone-600 transition cursor-pointer"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Real-Time Price Calculation Card (Section 24 & 25) */}
                    <div className="bg-[#faf9f6] rounded-2xl p-4 border border-border-light mb-5 text-xs text-text-dark space-y-2">
                      <div className="flex items-center justify-between text-muted-text">
                        <span>₹{Number(rawPriceVal).toLocaleString('en-IN')} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                        <span className="font-bold text-text-dark">₹{(Number(rawPriceVal) * nights).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border-light font-black text-sm">
                        <span>Estimated Total</span>
                        <span className="text-forest-green text-base">₹{(Number(rawPriceVal) * nights).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-[10px] text-muted-text pt-1 flex items-center gap-1">
                        <span className="text-forest-green font-bold">✓</span>
                        <span>Server validates final price • Escrow protected</span>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={handleReserveClick} 
                      disabled={bookingLoading} 
                      className="w-full bg-forest-green hover:bg-dark-green text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-wider mb-3 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <CheckCircle2 size={15} />
                      <span>{category === 'rentals' ? 'BOOK RENTAL' : 'RESERVE NOW'}</span>
                    </button>
                    {bookingMsg && (
                      <p className={`text-xs text-center font-bold p-2 rounded-xl flex items-center justify-center gap-1.5 ${
                        bookingMsg.includes('failed') || bookingMsg.includes('select') || bookingMsg.includes('after')
                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        <AlertCircle size={13} />
                        <span>{bookingMsg}</span>
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#0f3d2e] text-[10px] font-bold uppercase tracking-wider mb-2 border border-emerald-200">
                      <Sparkles size={12} className="text-emerald-700" />
                      <span>Context-Aware Trip Scheduler</span>
                    </div>
                    <h3 className="text-xl font-black text-text-dark mb-2 font-display uppercase">Plan Your Visit</h3>
                    <p className="text-muted-text text-xs mb-5 leading-relaxed">
                      Schedule {item.name} into your active itinerary day or build a custom AI plan.
                    </p>

                    <button 
                      type="button"
                      onClick={() => {
                        useMapStore.getState().openAddToTripModal({
                          id: item._id || item.slug,
                          name: item.name,
                          type: category,
                          location: item.district || item.city || 'Uttarakhand',
                          district: item.district,
                          image: getImageSrc(item, category),
                          rating: item.rating || 4.8
                        });
                      }}
                      className="w-full bg-[#0f3d2e] hover:bg-[#144c3a] text-white py-3 rounded-2xl font-bold text-xs mb-2.5 text-center flex items-center justify-center gap-1.5 transition-all shadow-md uppercase tracking-wider cursor-pointer"
                    >
                      <Mountain size={14} className="text-emerald-300" />
                      <span>Add to Itinerary Day</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        useMapStore.getState().setPlannerForm({
                          destination: item.name,
                          destinationId: item._id || item.slug,
                          origin: 'Dehradun, Uttarakhand'
                        });
                        navigate(`/trip-planner?destination=${encodeURIComponent(item.name)}`);
                      }}
                      className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 py-3 rounded-2xl font-black text-xs mb-4 text-center flex items-center justify-center gap-1.5 transition-all shadow-sm uppercase tracking-wider cursor-pointer"
                    >
                      <Sparkles size={14} className="text-slate-950" />
                      <span>Plan Trip for {item.name}</span>
                    </button>

                    {/* Quick Marketplace Links */}
                    <div className="pt-3 border-t border-stone-200 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Quick Actions for {item.name}:
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <Link
                          to={`/stays?location=${encodeURIComponent(item.name)}`}
                          className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-emerald-50 text-slate-700 hover:text-[#0f3d2e] text-xs font-semibold flex items-center justify-between border border-stone-200 transition"
                        >
                          <span>🏨 Find Stays in {item.name}</span>
                          <span className="text-emerald-700">→</span>
                        </Link>
                        <Link
                          to={`/rentals?city=${encodeURIComponent(item.district || item.city || item.name)}`}
                          className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-emerald-50 text-slate-700 hover:text-[#0f3d2e] text-xs font-semibold flex items-center justify-between border border-stone-200 transition"
                        >
                          <span>🚗 Rentals in {item.name}</span>
                          <span className="text-emerald-700">→</span>
                        </Link>
                      </div>
                    </div>
                  </>
                );
              })()}
              <p className="text-[11px] text-center text-muted-text mt-4">Verified Uttarakhand Tourism data</p>
            </div>
          </div>
        </div>

        {/* RELATED SECTIONS */}
        {related && (
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mt-6 space-y-16">
            
            {/* 1. Things to Do nearby */}
            {category !== 'activities' && Array.isArray(related.thingsToDo) && related.thingsToDo.length > 0 && (
              <section>
                <h3 className="text-2xl font-black text-text-dark mb-6 font-display uppercase tracking-wide">
                  Things to Do Nearby
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {related.thingsToDo.slice(0, 3).map((act) => (
                    <Link key={act._id || act.slug} to={`/activities/${act.slug}`} className="bg-white rounded-3xl overflow-hidden card-shadow border border-border-light group flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all">
                      <div className="h-44 bg-beige relative overflow-hidden">
                        <img src={getImageSrc(act)} alt={act.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.src = getHimalayanFallbackImage(act); }} />
                        {act.category && <span className="absolute top-3 left-3 bg-white/90 text-text-dark text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{act.category}</span>}
                      </div>
                      <div className="p-5 flex flex-col flex-grow justify-between">
                        <div>
                          <h4 className="font-black text-base text-text-dark mb-1 font-display group-hover:text-forest-green transition-colors">{act.name}</h4>
                          <p className="text-xs text-muted-text line-clamp-2">{act.shortDescription || act.description}</p>
                        </div>
                        <span className="text-forest-green text-xs font-bold mt-4 uppercase">View Activity →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 2. Places to Visit Nearby */}
            {Array.isArray(related.nearbyDestinations) && related.nearbyDestinations.length > 0 && (
              <section>
                <h3 className="text-2xl font-black text-text-dark mb-6 font-display uppercase tracking-wide">
                  Places to Visit Nearby
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {related.nearbyDestinations.slice(0, 3).map((d) => {
                    const destSlug = typeof d.slug === 'string' ? d.slug : (typeof d._id === 'string' ? d._id : (d.name ? d.name.toLowerCase().replace(/\s+/g, '-') : ''));
                    if (!destSlug) return null;
                    return (
                      <Link key={d._id || destSlug} to={`/destinations/${destSlug}`} className="bg-white rounded-3xl overflow-hidden card-shadow border border-border-light group flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all">
                        <div className="h-40 bg-beige relative overflow-hidden">
                          <img src={getImageSrc(d)} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.src = getHimalayanFallbackImage(d); }} />
                        </div>
                        <div className="p-4 flex flex-col flex-grow justify-between">
                          <div>
                            <h4 className="font-black text-sm text-text-dark mb-1 font-display group-hover:text-forest-green transition-colors">{d.name}</h4>
                            <p className="text-[11px] text-muted-text">{d.district}</p>
                          </div>
                          <span className="text-forest-green text-xs font-bold mt-3 uppercase">Explore →</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 3. Stays Nearby */}
            {category !== 'stays' && Array.isArray(related.stays) && related.stays.length > 0 && (
              <section>
                <h3 className="text-2xl font-black text-text-dark mb-6 font-display uppercase tracking-wide">
                  Where to Stay in {item.district || 'the Area'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {related.stays.slice(0, 3).map((st) => (
                    <Link key={st._id || st.slug} to={`/stays/${st.slug}`} className="bg-white rounded-3xl overflow-hidden card-shadow border border-border-light group flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all">
                      <div className="h-44 bg-beige relative overflow-hidden">
                        <img src={getImageSrc(st)} alt={st.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = getHimalayanFallbackImage(st); }} />
                      </div>
                      <div className="p-5 flex flex-col flex-grow justify-between">
                        <div>
                          <h4 className="font-black text-base text-text-dark mb-1 font-display line-clamp-1">{st.name}</h4>
                          <p className="text-xs text-muted-text mb-2">{st.city || st.district}</p>
                          {st.price?.amount ? (
                            <p className="text-earth-brown font-black text-sm">₹{Number(st.price.amount).toLocaleString('en-IN')} <span className="text-xs text-muted-text font-normal">/ night</span></p>
                          ) : null}
                        </div>
                        <span className="text-forest-green text-xs font-bold mt-3 uppercase">View Stay →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}

        {/* Reviews Section */}
        {item._id && (
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mt-12">
            <ReviewSection targetId={item._id} targetType={category === 'rentals' ? 'rental' : category === 'stays' ? 'stay' : 'destination'} />
          </div>
        )}

      </main>

      {/* Booking Confirmation Modal (Section 23 & 24) */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        item={item}
        defaultStartDate={bookingData.startDate}
        defaultEndDate={bookingData.endDate}
        onSuccess={(booking) => {
          setBookingMsg(`Reservation created! Ref: ${booking.bookingReference || ''}`);
        }}
      />
      
      <Footer />
    </div>
  );
};

export default DetailPage;
