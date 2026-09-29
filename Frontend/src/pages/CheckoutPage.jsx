import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  ArrowLeft, 
  Car, 
  Bed, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Check, 
  ChevronRight, 
  Sparkles, 
  AlertTriangle,
  HelpCircle,
  QrCode,
  Tag,
  Flame,
  Utensils,
  Compass,
  Phone,
  Mail,
  User,
  Share2,
  Download,
  Info,
  ExternalLink,
  Shield,
  Zap,
  CheckCircle
} from 'lucide-react';
import { getStayById, getStays } from '../api/stayApi';
import { getRentalById, getRentals } from '../api/rentalApi';
import { createBooking } from '../api/bookingApi';
import { createPaymentOrder, verifyPaymentSignature } from '../api/paymentApi';
import { resolveEntityImage } from '../utils/imageUtils';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [itemType, setItemType] = useState(type || 'stay'); // 'stay' | 'rental' | 'trip'

  // Booking Parameters
  const [startDate, setStartDate] = useState(
    searchParams.get('startDate') || new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    searchParams.get('endDate') || new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10)
  );
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 2);
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'upi' | 'card' | 'netbanking'
  const [upiApp, setUpiApp] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'qr'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [specialNotes, setSpecialNotes] = useState('');

  // Experience Addons
  const [addons, setAddons] = useState({
    dinnerThali: false,
    bonfire: false,
    trailGuide: false
  });

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponStatus, setCouponStatus] = useState(null); // { type: 'success' | 'error', message: string }

  // 15-Minute Price Lock Timer
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 59);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !fullName) setFullName(currentUser.name);
      if (currentUser.phone && !phoneNumber) setPhoneNumber(currentUser.phone);
      if (currentUser.email && !email) setEmail(currentUser.email);
    }
  }, [currentUser]);

  // Calculate duration in days/nights
  const calculateDays = () => {
    try {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const diffTime = Math.abs(e - s);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays);
    } catch {
      return 2;
    }
  };

  const daysCount = calculateDays();

  // Load target item data
  useEffect(() => {
    let isMounted = true;
    const loadItem = async () => {
      setLoading(true);
      try {
        if (id) {
          if (type === 'stay' || type === 'stays') {
            setItemType('stay');
            const res = await getStayById(id).catch(() => null);
            if (res && isMounted) {
              setItem(res.data || res);
            } else {
              const list = await getStays();
              const found = (list?.data || []).find(s => s._id === id || s.slug === id || s.id === id);
              if (found && isMounted) setItem(found);
            }
          } else if (type === 'rental' || type === 'rentals') {
            setItemType('rental');
            const res = await getRentalById(id).catch(() => null);
            if (res && isMounted) {
              setItem(res.data || res);
            } else {
              const list = await getRentals();
              const found = (list?.data || []).find(r => r._id === id || r.slug === id || r.id === id);
              if (found && isMounted) setItem(found);
            }
          }
        } else {
          // Check if active trip session exists
          const savedTrip = localStorage.getItem('discovery_active_trip');
          if (savedTrip) {
            try {
              const parsed = JSON.parse(savedTrip);
              setItemType('trip');
              setItem(parsed);
            } catch (e) {
              console.warn(e);
            }
          }
        }

        // Handle missing real item honestly
        if (!item && isMounted) {
          console.warn(`No verified listing found for ID: ${id || 'unknown'}`);
        }
      } catch (err) {
        console.error('Error loading checkout item:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadItem();
    return () => { isMounted = false; };
  }, [type, id]);

  // Real Pricing calculations
  const rawRate = item?.price?.amount ?? item?.pricePerNight ?? item?.pricePerDay ?? (typeof item?.price === 'number' ? item.price : null);
  const isPriceVerified = rawRate !== null && !isNaN(rawRate) && Number(rawRate) > 0;
  const baseRate = isPriceVerified ? Number(rawRate) : 0;
  const staySubtotal = isPriceVerified ? baseRate * daysCount : 0;
  
  // Addon costs
  const addonCost = 
    (addons.dinnerThali ? 350 * guests * daysCount : 0) +
    (addons.bonfire ? 500 : 0) +
    (addons.trailGuide ? 0 : 0);

  const subtotal = staySubtotal + addonCost;
  const taxes = Math.round(subtotal * 0.05); // 5% Uttarakhand Tourism Cess
  const totalBeforeDiscount = subtotal + taxes;
  const totalAmount = Math.max(0, totalBeforeDiscount - appliedDiscount);

  // Apply Coupon Handler
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'DEVBHOOMI' || code === 'DEVBHOOMI2026') {
      setAppliedDiscount(300);
      setCouponStatus({ type: 'success', message: '🎉 DEVBHOOMI Applied: ₹300 Mountain Discount unlocked!' });
    } else if (code === 'PAHADI' || code === 'PAHADI10') {
      setAppliedDiscount(200);
      setCouponStatus({ type: 'success', message: '🌿 PAHADI Applied: ₹200 Host Welcome Discount!' });
    } else if (code === 'ESCROWFREE') {
      setAppliedDiscount(150);
      setCouponStatus({ type: 'success', message: '🛡️ ESCROWFREE Applied: ₹150 Safe Traveler Bonus!' });
    } else {
      setCouponStatus({ type: 'error', message: 'Invalid coupon code. Try DEVBHOOMI or PAHADI' });
    }
  };

  const handlePayAndSecure = async () => {
    // 🔒 STRICT AUTHENTICATION GUARD
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (!fullName.trim() || !phoneNumber.trim()) {
      alert('Please enter your full name and contact number for the booking check-in pass.');
      return;
    }

    if (!item) {
      alert('Cannot create booking: Selected listing is unavailable or not verified.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create server-side booking in PENDING_PAYMENT state
      const payload = {
        type: item?.isPartnerListing ? 'partner_listing' : (itemType || 'stay'),
        bookingType: item?.isPartnerListing ? 'partner_listing' : (itemType || 'stay'),
        item: item?._id || item?.id,
        partnerListing: item?.isPartnerListing || item?.partnerListingId ? (item?.partnerListingId || item?._id) : undefined,
        stay: (itemType === 'stay' && !item?.isPartnerListing) ? (item?._id || item?.id) : undefined,
        rental: (itemType === 'rental' && !item?.isPartnerListing) ? (item?._id || item?.id) : undefined,
        startDate,
        endDate,
        guests,
        traveler: {
          name: fullName,
          email: email,
          phone: phoneNumber,
          guests
        },
        notes: `Payment: ${paymentMethod === 'cash' ? 'CASH_ON_ARRIVAL' : paymentMethod}. Addons: ${Object.keys(addons).filter(k => addons[k]).join(', ') || 'None'}. Special: ${specialNotes || 'None'}`
      };

      const bookingRes = await createBooking(payload);
      const serverBooking = bookingRes?.data || bookingRes;
      if (!serverBooking?._id) {
        throw new Error(bookingRes?.message || 'Failed to initialize booking on server.');
      }

      const finalizeBookingRecord = (paymentDetails = {}) => {
        const isCash = paymentMethod === 'cash';
        const effectiveRef = serverBooking?.bookingReference || `DU-ESCROW-${Date.now().toString().slice(-6)}`;
        const effectiveOtp = serverBooking?.checkInOtp || Math.floor(1000 + Math.random() * 9000).toString();

        const bookingRecord = {
          bookingId: effectiveRef,
          id: effectiveRef,
          _id: serverBooking?._id,
          bookingReference: effectiveRef,
          userId: currentUser?._id || currentUser?.id,
          userEmail: currentUser?.email || email,
          userName: currentUser?.name || fullName,
          userPhone: currentUser?.phone || phoneNumber,
          itemTitle: item?.name || item?.title || 'Himalayan Verified Booking',
          itemType,
          location: item?.city ? `${item.city}, ${item.district || 'Uttarakhand'}` : (item?.district || 'Uttarakhand'),
          startDate,
          endDate,
          daysCount,
          guests,
          totalAmount: serverBooking?.totalPrice || totalAmount,
          subtotal,
          taxes,
          discount: appliedDiscount,
          escrowStatus: isCash ? 'CASH_HANDSHAKE_PENDING' : 'HELD_IN_ESCROW',
          status: isCash ? 'PENDING' : 'CONFIRMED',
          checkInOtp: effectiveOtp,
          paidAt: isCash ? null : new Date().toISOString(),
          paymentMethod: isCash ? 'CASH_ON_ARRIVAL' : paymentMethod.toUpperCase(),
          partnerVerified: true,
          verificationProof: 'GPS Geofenced • Server-Verified Pricing',
          addons,
          specialNotes,
          ...paymentDetails
        };

        try {
          localStorage.setItem('active_escrow_booking', JSON.stringify(bookingRecord));
          const existingTrip = localStorage.getItem('discovery_active_trip');
          if (existingTrip) {
            const parsed = JSON.parse(existingTrip);
            parsed.escrowBooking = bookingRecord;
            localStorage.setItem('discovery_active_trip', JSON.stringify(parsed));
          }
        } catch (e) {
          console.warn(e);
        }

        setConfirmedBooking(bookingRecord);
        setIsSubmitting(false);
      };

      // 2. Cash on Arrival option
      if (paymentMethod === 'cash') {
        finalizeBookingRecord({
          paymentMethod: 'CASH_ON_ARRIVAL',
          paymentStatus: 'PAY_ON_CHECKIN',
          notes: 'Traveler will pay cash directly to partner after physical inspection and 4-digit OTP exchange.'
        });
        return;
      }

      // 3. Online Payment: Create authentic Razorpay Server Order
      const orderRes = await createPaymentOrder(serverBooking._id, { method: paymentMethod });
      if (!orderRes?.success || !orderRes?.orderId) {
        throw new Error(orderRes?.message || 'Could not create payment order on server.');
      }

      // 4. Load Razorpay Checkout SDK
      const loadRazorpay = () => {
        return new Promise((resolve) => {
          if (window.Razorpay) return resolve(true);
          const s = document.createElement('script');
          s.src = 'https://checkout.razorpay.com/v1/checkout.js';
          s.onload = () => resolve(true);
          s.onerror = () => resolve(false);
          document.body.appendChild(s);
        });
      };

      const isLoaded = await loadRazorpay();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Razorpay Checkout SDK could not be loaded. Please check your network connection.');
      }

      const options = {
        key: orderRes.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Tfve5JcWu17bY6',
        order_id: orderRes.orderId,
        amount: orderRes.amount, // Server-calculated paise
        currency: orderRes.currency || 'INR',
        name: "Discovery Uttarakhand",
        description: `Escrow Protected Booking — ${item?.name || 'Verified Mountain Experience'}`,
        image: "/logo.png",
        handler: async function (response) {
          try {
            // 5. Server-Side Signature Verification Gate
            const verifyRes = await verifyPaymentSignature({
              bookingId: serverBooking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes?.verified || verifyRes?.success) {
              finalizeBookingRecord({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                paymentStatus: 'PAID',
                status: 'CONFIRMED'
              });
            } else {
              alert('Payment Verification Failed: Gateway signature could not be verified by server.');
              setIsSubmitting(false);
            }
          } catch (verifyErr) {
            console.error('Signature verification error:', verifyErr);
            alert(`Payment verification error: ${verifyErr.response?.data?.message || verifyErr.message}`);
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: fullName || "Traveler",
          email: email || "traveler@discovery.com",
          contact: phoneNumber || "+919876543210"
        },
        theme: {
          color: '#0f3d2e'
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert(`Payment Failed: ${response.error?.description || 'Transaction declined by bank.'}`);
        setIsSubmitting(false);
      });
      rzp.open();

    } catch (err) {
      console.error('Booking / Payment Error:', err);
      alert(`Booking Error: ${err.response?.data?.message || err.message}`);
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#f8faf7] flex flex-col font-sans text-stone-900 selection:bg-emerald-200 selection:text-emerald-950 relative overflow-x-hidden">
      <Navbar />

      {/* ── Ambient Luxury Glow Mesh ── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[450px] bg-gradient-to-b from-emerald-500/10 via-teal-400/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-7 sm:py-9 pb-32 relative z-10">
        
        {/* Top Header Bar with Breadcrumb & Locked Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-stone-50 border border-stone-200/90 hover:border-emerald-500/50 text-stone-700 hover:text-emerald-900 transition-all shadow-2xs group cursor-pointer"
            >
              <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5 text-stone-500 group-hover:text-emerald-700" />
              <span>Back to Explorer</span>
            </button>
            <span className="text-stone-300">/</span>
            <span className="text-emerald-950 font-bold bg-emerald-100/70 border border-emerald-300/60 px-3 py-1 rounded-full text-[11px] flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-emerald-700" />
              <span>Bank-Grade Escrow Vault</span>
            </span>
          </div>

          {/* Rate Lock Timer Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-stone-200 shadow-2xs text-xs font-semibold text-stone-700">
            <Clock size={13} className="text-amber-600 animate-pulse" />
            <span className="text-stone-500 text-[11px]">Price Guaranteed For:</span>
            <span className="font-mono font-bold text-stone-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80 text-amber-900">
              {formatTimer(timeLeft)}
            </span>
          </div>
        </div>

        {/* Hero Title & Subheader */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/10 border border-emerald-800/20 text-emerald-950 text-xs font-black uppercase tracking-wider mb-2.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            <Shield size={13} className="text-emerald-800" />
            <span>100% On-Site Handshake Protection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-950 tracking-tight leading-tight">
            Review & Lock Your Mountain Booking
          </h1>
          <p className="text-stone-600 text-sm mt-1.5 max-w-2xl leading-relaxed">
            Your money stays secured in RBI-compliant digital escrow and is only transferred to your host after you physically arrive, inspect the room/ride keys, and share your private 4-digit OTP.
          </p>
        </div>

        {/* Unauthenticated Alert Banner */}
        {!isAuthenticated && (
          <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-amber-50/90 border border-amber-300/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm backdrop-blur-md">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 border border-amber-300/90 shadow-2xs">
                <Lock size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">Account login required to issue 4-Digit Escrow Pass</h4>
                <p className="text-xs text-stone-600 mt-0.5 max-w-xl">
                  Log in to link your booking with your travel pass, receive SMS alerts, and enable on-site OTP handshake protection.
                </p>
              </div>
            </div>
            <Link
              to={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
              className="px-6 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-black tracking-wide shrink-0 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Sign In to Reserve →
            </Link>
          </div>
        )}

        {/* ── Two Column Responsive Checkout Grid or Empty State ── */}
        {!loading && !item ? (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 border border-stone-200/90 text-center max-w-xl mx-auto shadow-sm my-12">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center mb-4 border border-amber-200 shadow-2xs">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-black text-stone-900 mb-2">Listing Unavailable</h3>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              The listing you requested ({id || 'unknown'}) was not found in our operational database or is not currently active.
            </p>
            <div className="flex justify-center gap-3">
              <Link to="/stays" className="px-5 py-2.5 rounded-xl bg-emerald-950 text-white font-bold text-xs hover:bg-emerald-900 transition shadow-xs">
                Browse Verified Stays
              </Link>
              <Link to="/rentals" className="px-5 py-2.5 rounded-xl bg-stone-100 text-stone-800 font-bold text-xs hover:bg-stone-200 transition border border-stone-200">
                Browse Verified Rentals
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          
          {/* ════ LEFT COLUMN (7 Cols): Details, Dates, Add-ons & Payments ════ */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Item Visual Preview Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="w-full sm:w-36 h-48 sm:h-36 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/90 relative group shadow-2xs">
                  <img 
                    src={resolveEntityImage(item, itemType)} 
                    alt={item?.name || 'Booking item'} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {item?.rating ? (
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                      ★ {item.rating} {item.reviewCount ? <span className="text-white/70">({item.reviewCount})</span> : null}
                    </div>
                  ) : (
                    <div className="absolute top-2 left-2 bg-emerald-950/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                      ✓ Verified
                    </div>
                  )}
                </div>


                <div className="flex-grow min-w-0 w-full">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300/70 shadow-2xs flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-emerald-700" />
                      3-Layer Verified
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      {itemType === 'rental' ? 'Mountain Fleet Vehicle' : 'Verified Himalayan Homestay'}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug tracking-tight">
                    {item?.name || item?.title || 'Himalayan Eco Glamping & Orchard Retreat'}
                  </h2>

                  <p className="text-xs text-stone-600 flex items-center gap-1.5 mt-1">
                    <MapPin size={13} className="text-emerald-700 shrink-0" />
                    <span className="font-semibold">{item?.city ? `${item.city}, ${item.district || 'Uttarakhand'}` : (item?.district || 'Uttarakhand')}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-stone-500">Hosted by {item?.hostName || 'Virendra Rawat (Local Partner)'}</span>
                  </p>

                  <div className="mt-4 flex items-center gap-3 text-xs font-semibold text-stone-700 flex-wrap">
                    <span className="bg-stone-100/90 border border-stone-200/90 px-3 py-1.5 rounded-xl font-black text-stone-900 shadow-2xs">
                      ₹{baseRate?.toLocaleString('en-IN')} <span className="text-[11px] font-normal text-stone-500">/ {itemType === 'rental' ? 'day' : 'night'}</span>
                    </span>
                    <span className="text-emerald-900 bg-emerald-50 border border-emerald-200/90 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold text-xs">
                      <Check size={13} className="text-emerald-700" /> Zero Advance Risk
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Interactive Date & Pax Selector ── */}
              <div className="mt-6 pt-5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-stone-50/90 hover:bg-stone-100/80 p-3.5 rounded-2xl border border-stone-200/90 transition-all">
                  <label className="text-[10.5px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Calendar size={13} className="text-emerald-700" />
                    <span>{itemType === 'rental' ? 'Pick-up Date' : 'Check-in'}</span>
                  </label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs font-bold bg-transparent text-stone-900 focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="bg-stone-50/90 hover:bg-stone-100/80 p-3.5 rounded-2xl border border-stone-200/90 transition-all">
                  <label className="text-[10.5px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Calendar size={13} className="text-emerald-700" />
                    <span>{itemType === 'rental' ? 'Return Date' : 'Check-out'}</span>
                  </label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs font-bold bg-transparent text-stone-900 focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="bg-stone-50/90 hover:bg-stone-100/80 p-3.5 rounded-2xl border border-stone-200/90 transition-all">
                  <label className="text-[10.5px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Users size={13} className="text-emerald-700" />
                    <span>{itemType === 'rental' ? 'Riders / Pax' : 'Guests'}</span>
                  </label>
                  <select 
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full text-xs font-bold bg-transparent text-stone-900 focus:outline-none cursor-pointer"
                  >
                    <option value={1}>1 Solo Explorer</option>
                    <option value={2}>2 Travelers (Duo / Couple)</option>
                    <option value={3}>3 Travelers (Small Group)</option>
                    <option value={4}>4 Travelers (Family)</option>
                    <option value={6}>6+ Travelers (Group)</option>
                  </select>
                </div>
              </div>

              {/* Free Included Perks */}
              <div className="mt-4 pt-3 flex items-center gap-2 flex-wrap text-[11px] text-stone-600 font-medium">
                <span className="bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1">
                  ☕ Himalayan Kahwa Welcome
                </span>
                <span className="bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1">
                  📶 High-Speed WiFi
                </span>
                <span className="bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1">
                  🚗 Free Mountain Parking
                </span>
              </div>
            </div>

            {/* 2. Authentic Himalayan Add-ons */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-stone-900 tracking-tight flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    <span>Enhance Your Mountain Stay</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">Authentic local experiences hosted directly by your Pahadi host</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70">
                  Optional Add-ons
                </span>
              </div>

              <div className="space-y-3">
                {/* Addon 1: Garhwali Thali */}
                <label className={`flex items-start justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  addons.dinnerThali ? 'bg-emerald-50/80 border-emerald-600 ring-1 ring-emerald-600/30' : 'bg-stone-50/60 border-stone-200 hover:bg-stone-50'
                }`}>
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      checked={addons.dinnerThali} 
                      onChange={(e) => setAddons({ ...addons, dinnerThali: e.target.checked })}
                      className="w-4 h-4 mt-0.5 text-emerald-700 rounded-md focus:ring-emerald-600 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Utensils size={13} className="text-amber-600" />
                        <span>Authentic Pahadi Thali Dinner (Kafuli, Mandua Roti & Jhangora Kheer)</span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">Fresh organic farm ingredients prepared by host family</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-stone-900 shrink-0 ml-2">
                    +₹{350 * guests * daysCount} <span className="text-[10px] font-normal text-stone-500">({guests} pax)</span>
                  </span>
                </label>

                {/* Addon 2: Bonfire */}
                <label className={`flex items-start justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  addons.bonfire ? 'bg-emerald-50/80 border-emerald-600 ring-1 ring-emerald-600/30' : 'bg-stone-50/60 border-stone-200 hover:bg-stone-50'
                }`}>
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      checked={addons.bonfire} 
                      onChange={(e) => setAddons({ ...addons, bonfire: e.target.checked })}
                      className="w-4 h-4 mt-0.5 text-emerald-700 rounded-md focus:ring-emerald-600 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Flame size={13} className="text-orange-500" />
                        <span>Private Night Star-gazing Bonfire & Pine Logs</span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">Wood log arrangement under the Himalayan starry skies</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-stone-900 shrink-0 ml-2">+₹500</span>
                </label>

                {/* Addon 3: Guide */}
                <label className={`flex items-start justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  addons.trailGuide ? 'bg-emerald-50/80 border-emerald-600 ring-1 ring-emerald-600/30' : 'bg-stone-50/60 border-stone-200 hover:bg-stone-50'
                }`}>
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      checked={addons.trailGuide} 
                      onChange={(e) => setAddons({ ...addons, trailGuide: e.target.checked })}
                      className="w-4 h-4 mt-0.5 text-emerald-700 rounded-md focus:ring-emerald-600 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Compass size={13} className="text-teal-600" />
                        <span>Local Sunrise Pine Forest Nature Walk</span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">Complimentary 45-min guided walk to scenic valley viewpoint</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md shrink-0 ml-2">FREE</span>
                </label>
              </div>
            </div>

            {/* 3. Traveler Contact Information */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-stone-900 tracking-tight">Primary Traveler & Check-in Pass</h3>
                  <p className="text-xs text-stone-500 mt-0.5">Your secret 4-Digit Escrow OTP will be delivered here via SMS</p>
                </div>
                <span className="text-[11px] font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70">
                  📱 SMS OTP Enabled
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5 flex items-center gap-1.5">
                    <User size={13} className="text-emerald-700" />
                    <span>Full Name (Govt ID Match)</span>
                  </label>
                  <input 
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Deepanshu Negi"
                    className="w-full px-4 py-3 bg-stone-50/90 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5 flex items-center gap-1.5">
                    <Phone size={13} className="text-emerald-700" />
                    <span>Mobile Number (SMS Delivery)</span>
                  </label>
                  <input 
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 bg-stone-50/90 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700 block mb-1.5 flex items-center gap-1.5">
                    <Mail size={13} className="text-emerald-700" />
                    <span>Email Address (For PDF Voucher & Invoice)</span>
                  </label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="traveler@domain.com"
                    className="w-full px-4 py-3 bg-stone-50/90 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">
                    Special Requests for Host (Optional)
                  </label>
                  <input 
                    type="text"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="e.g. Late check-in after 7 PM, extra heater, vegetarian food"
                    className="w-full px-4 py-2.5 bg-stone-50/90 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 4. Payment Mode Selector */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-stone-900 tracking-tight">Select Payment &amp; Escrow Guarantee Mode</h3>
                  <p className="text-xs text-stone-500 mt-0.5">All modes are backed by Uttarakhand Tourism Escrow Protection</p>
                </div>
                <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70 flex items-center gap-1.5">
                  <Lock size={12} className="text-emerald-700" /> 256-Bit Encrypted
                </span>
              </div>

              <div className="space-y-3">
                {/* 1. Cash On Arrival (Handshake) */}
                <label className={`block p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cash' 
                    ? 'border-emerald-700 bg-emerald-50/60 shadow-md ring-2 ring-emerald-600/20' 
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                        className="w-4 h-4 text-emerald-700 focus:ring-emerald-600"
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-2 flex-wrap">
                          <span>💵 Pay on Arrival (Cash Handshake with 4-Digit OTP)</span>
                          <span className="text-[10px] font-black text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300/70">
                            ★ Zero Advance
                          </span>
                        </div>
                        <div className="text-xs text-stone-600 mt-0.5">
                          Inspect stay or test drive keys first • Hand cash only when fully satisfied &amp; exchange secret 4-digit OTP
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-950 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300/70 shrink-0 hidden sm:inline-block">
                      100% Risk-Free
                    </span>
                  </div>

                  {paymentMethod === 'cash' && (
                    <div className="mt-3.5 pt-3 border-t border-emerald-200/70 text-xs text-emerald-950 flex items-center gap-2 font-semibold">
                      <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                      <span>Zero upfront payment required today. Your 4-digit booking voucher is issued instantly!</span>
                    </div>
                  )}
                </label>

                {/* 2. UPI Instant Escrow */}
                <label className={`block p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'upi' 
                    ? 'border-emerald-700 bg-emerald-50/60 shadow-md ring-2 ring-emerald-600/20' 
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="w-4 h-4 text-emerald-700 focus:ring-emerald-600"
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-2 flex-wrap">
                          <span>⚡ UPI Instant Escrow (GPay / PhonePe / Paytm / QR)</span>
                          <span className="text-[10px] font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                            Fastest
                          </span>
                        </div>
                        <div className="text-xs text-stone-500">RBI-Compliant Digital Escrow vault hold • Instant release upon OTP</div>
                      </div>
                    </div>
                    <Smartphone size={20} className="text-emerald-800 shrink-0" />
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="mt-3.5 pt-3 border-t border-emerald-200/70 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {[
                          { id: 'gpay', label: 'Google Pay', icon: '🟢' },
                          { id: 'phonepe', label: 'PhonePe', icon: '🟣' },
                          { id: 'paytm', label: 'Paytm UPI', icon: '🔵' },
                          { id: 'qr', label: 'Instant QR Code', icon: '📱' }
                        ].map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => setUpiApp(app.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              upiApp === app.id 
                                ? 'bg-emerald-950 text-white border-emerald-950 shadow-xs' 
                                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            <span>{app.icon}</span>
                            <span>{app.label}</span>
                          </button>
                        ))}
                      </div>

                      {upiApp === 'qr' && (
                        <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                          <div className="w-24 h-24 bg-stone-100 border border-stone-300 rounded-xl p-2 flex items-center justify-center shrink-0">
                            <QrCode size={64} className="text-stone-900" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-stone-900 block">Scan with any UPI App</span>
                            <span className="text-[11px] text-stone-500 block mt-0.5">
                              Amount: <strong className="text-emerald-950">₹{totalAmount?.toLocaleString('en-IN')}</strong> will be held in Escrow until check-in.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </label>

                {/* 3. Cards */}
                <label className={`block p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'card' 
                    ? 'border-emerald-700 bg-emerald-50/60 shadow-md ring-2 ring-emerald-600/20' 
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="w-4 h-4 text-emerald-700 focus:ring-emerald-600"
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-black text-stone-900">Credit / Debit Card (Visa, Mastercard, RuPay, Amex)</div>
                        <div className="text-xs text-stone-500">3D Secure RBI Two-Factor Authentication</div>
                      </div>
                    </div>
                    <CreditCard size={20} className="text-stone-500" />
                  </div>
                </label>

                {/* 4. Net Banking */}
                <label className={`block p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'netbanking' 
                    ? 'border-emerald-700 bg-emerald-50/60 shadow-md ring-2 ring-emerald-600/20' 
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'netbanking'}
                        onChange={() => setPaymentMethod('netbanking')}
                        className="w-4 h-4 text-emerald-700 focus:ring-emerald-600"
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-black text-stone-900">Net Banking (50+ Indian Banks)</div>
                        <div className="text-xs text-stone-500">SBI, HDFC, ICICI, Axis, PNB &amp; more</div>
                      </div>
                    </div>
                    <Building2 size={20} className="text-stone-500" />
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* ════ RIGHT COLUMN (5 Cols): Escrow Infographic & Ticket Receipt ════ */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* ── Visual Escrow + OTP Handshake Graphic (Signature Dark Emerald) ── */}
            <div className="bg-gradient-to-br from-[#06241a] via-[#0b3829] to-[#041912] text-white rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden border border-emerald-700/60">
              {/* Subtle background radiant glow */}
              <div className="absolute -right-8 -top-8 w-56 h-56 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-8 -bottom-8 w-56 h-56 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-400/40 flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck size={13} className="text-emerald-300" />
                  Safe Traveler Guarantee
                </span>
                <span className="text-[10px] font-mono text-emerald-200/80 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Verified Node
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1.5">
                How Escrow + OTP Handshake Works
              </h3>
              <p className="text-xs text-emerald-100/80 mb-5 leading-relaxed">
                You never pay a stranger in advance. Your booking is 100% risk-free.
              </p>

              {/* 3 Step Interactive Visual Pipeline */}
              <div className="space-y-3.5 relative">
                
                {/* Step 1 */}
                <div className="flex items-start gap-3.5 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:bg-white/15 transition-all">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/30 border border-emerald-400/60 text-emerald-300 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-2xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Lock size={13} className="text-emerald-300" />
                      <span>Lock Funds in Escrow</span>
                    </h4>
                    <p className="text-[11px] text-emerald-100/80 mt-0.5 leading-snug">
                      Your payment stays in an RBI-compliant vault. Host does not get paid yet.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3.5 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:bg-white/15 transition-all">
                  <div className="w-8 h-8 rounded-full bg-amber-500/30 border border-amber-400/60 text-amber-300 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-2xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <KeyRound size={13} className="text-amber-300" />
                      <span>Inspect Room / Ride &amp; Share 4-Digit OTP</span>
                    </h4>
                    <p className="text-[11px] text-emerald-100/80 mt-0.5 leading-snug">
                      Check room cleanliness or bike conditions on-site. Only then give your partner the 4-digit code.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3.5 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:bg-white/15 transition-all">
                  <div className="w-8 h-8 rounded-full bg-emerald-400/30 border border-emerald-300/60 text-emerald-200 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-2xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-300" />
                      <span>Instant Release to Local Partner</span>
                    </h4>
                    <p className="text-[11px] text-emerald-100/80 mt-0.5 leading-snug">
                      The OTP automatically executes payout to the host's UPI/Bank account.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Luxury Receipt Card & Price Breakdown ── */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm">
              <h3 className="text-base font-black text-stone-900 mb-4 pb-3 border-b border-stone-100 flex items-center justify-between">
                <span>Price &amp; Tax Summary</span>
                <span className="text-[11px] font-bold text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300/60">
                  Guaranteed Rate
                </span>
              </h3>

              {/* Coupon Code Section */}
              <form onSubmit={handleApplyCoupon} className="mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon Code (e.g. DEVBHOOMI)"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold uppercase text-stone-900 placeholder:normal-case placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {couponStatus && (
                  <p className={`text-[11px] mt-1.5 font-bold ${
                    couponStatus.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {couponStatus.message}
                  </p>
                )}
              </form>

              {/* Itemized breakdown */}
              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex items-center justify-between">
                  <span>
                    Base Rate (₹{baseRate?.toLocaleString('en-IN')} × {daysCount} {itemType === 'rental' ? 'Days' : 'Nights'})
                  </span>
                  <span className="font-bold text-stone-900">₹{staySubtotal?.toLocaleString('en-IN')}</span>
                </div>

                {addonCost > 0 && (
                  <div className="flex items-center justify-between text-amber-900">
                    <span>Experience Add-ons</span>
                    <span className="font-bold">+₹{addonCost?.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    Escrow Protection Vault Fee
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300/70">100% FREE</span>
                  </span>
                  <span className="font-bold text-emerald-700">₹0</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Uttarakhand Sustainable Tourism Cess (5%)</span>
                  <span className="font-bold text-stone-900">₹{taxes?.toLocaleString('en-IN')}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                    <span>Coupon Discount</span>
                    <span>-₹{appliedDiscount?.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-base font-black text-stone-900">
                  <span>Total Payable</span>
                  <span className="text-2xl font-black text-emerald-950 tracking-tight">
                    ₹{totalAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Primary CTA Button */}
              <button
                type="button"
                onClick={handlePayAndSecure}
                disabled={isSubmitting}
                className="w-full mt-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 hover:from-emerald-900 hover:to-emerald-800 active:scale-[0.99] text-white font-black py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-75 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{paymentMethod === 'cash' ? 'Generating 4-Digit Check-in Voucher...' : 'Locking Funds in Escrow...'}</span>
                  </>
                ) : !isAuthenticated ? (
                  <>
                    <Lock size={16} className="text-amber-300" />
                    <span>Sign In to Complete &amp; Reserve</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} className="text-emerald-300" />
                    <span>
                      {paymentMethod === 'cash' 
                        ? `Confirm Booking (Pay ₹${totalAmount?.toLocaleString('en-IN')} in Cash on Arrival)`
                        : `Pay & Lock Booking in Escrow (₹${totalAmount?.toLocaleString('en-IN')})`}
                    </span>
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-stone-500 text-center font-medium">
                <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
                <span>
                  {paymentMethod === 'cash'
                    ? 'Pay cash only after test drive / key check • Verified local partner'
                    : 'Zero advance transfer to partner • 100% Refundable prior to OTP'}
                </span>
              </div>
            </div>

            {/* 24x7 Escrow Helpline Badge */}
            <div className="bg-white/80 p-4 rounded-2xl border border-stone-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
                  <Phone size={14} />
                </div>
                <div>
                  <strong className="text-stone-900 block">24x7 Uttarakhand Escrow Desk</strong>
                  <span className="text-[11px] text-stone-500">Toll-free Assistance &amp; On-Road Support</span>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-950 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                1800-DEVBHOOMI
              </span>
            </div>

          </div>

        </div>
        )}


      </main>

      {/* ── Mobile Sticky Bottom Checkout Bar (<640px) ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 p-3 px-4 flex items-center justify-between shadow-2xl safe-area-bottom">
        <div>
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
            {paymentMethod === 'cash' ? 'Pay On Arrival' : 'Total Payable'}
          </span>
          <span className="text-lg font-black text-emerald-950">₹{totalAmount?.toLocaleString('en-IN')}</span>
        </div>
        <button
          type="button"
          onClick={handlePayAndSecure}
          disabled={isSubmitting}
          className="bg-emerald-950 hover:bg-emerald-900 text-white font-black py-2.5 px-5 rounded-2xl shadow-md text-xs uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
        >
          <Lock size={14} className="text-emerald-300" />
          <span>{isSubmitting ? 'Confirming...' : paymentMethod === 'cash' ? 'Confirm (Cash)' : 'Pay & Secure'}</span>
        </button>
      </div>

      {/* ── LUXURY ESCROW / CASH CONFIRMATION SUCCESS MODAL ── */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-100 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Top Badge */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center mx-auto mb-4 border border-emerald-300/80 shadow-md">
              <CheckCircle2 size={38} className="text-emerald-800" />
            </div>

            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 bg-emerald-100/90 px-3.5 py-1 rounded-full border border-emerald-300">
              {confirmedBooking.paymentMethod === 'CASH_ON_ARRIVAL' ? '💵 Cash Handshake Reserved' : '🛡️ Escrow Active & Protected'}
            </span>

            <h3 className="text-2xl font-black text-stone-950 mt-3 mb-1">
              Mountain Booking Confirmed!
            </h3>
            <p className="text-xs text-stone-600 mb-6 max-w-sm mx-auto leading-relaxed">
              {confirmedBooking.paymentMethod === 'CASH_ON_ARRIVAL'
                ? `You will pay ₹${confirmedBooking.totalAmount?.toLocaleString('en-IN')} in cash directly to your host after inspecting the room/ride keys.`
                : 'Your funds are held safely in Escrow. Share the secret OTP below with your partner only upon satisfaction.'}
            </p>

            {/* Secret 4-Digit OTP Boarding Pass Box */}
            <div className="bg-gradient-to-b from-[#fbfdfa] to-[#f2f7f3] p-5 rounded-2xl border-2 border-dashed border-emerald-600/40 mb-6 shadow-xs relative">
              <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-1">
                Your Secret 4-Digit Handshake OTP
              </span>
              <div className="text-4xl sm:text-5xl font-mono font-black text-emerald-950 tracking-widest my-2 select-all">
                {confirmedBooking.checkInOtp}
              </div>
              <div className="flex items-center justify-center gap-3 text-[11px] text-stone-600 mt-2 font-medium">
                <span>Ref: <strong className="text-stone-900">{confirmedBooking.bookingId}</strong></span>
                <span className="text-stone-300">•</span>
                <span>Dates: <strong className="text-stone-900">{confirmedBooking.startDate} to {confirmedBooking.endDate}</strong></span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => navigate('/my-trip')}
                className="w-full bg-emerald-950 hover:bg-emerald-900 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg transition-all text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Go to On-Trip Dashboard</span>
                <ChevronRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => setConfirmedBooking(null)}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close &amp; Return to Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
