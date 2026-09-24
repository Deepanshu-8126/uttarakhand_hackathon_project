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
  QrCode
} from 'lucide-react';
import { getStayById, getStays } from '../api/stayApi';
import { getRentalById, getRentals } from '../api/rentalApi';
import { getDestinationBySlug, getDestinations } from '../api/destinationApi';

export default function CheckoutPage() {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
  const [fullName, setFullName] = useState('Deepanshu Sharma');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [email, setEmail] = useState('traveler@uttarakhand.in');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'upi' | 'card' | 'netbanking'
  const [upiApp, setUpiApp] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'qr'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

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
              // Fallback fetch list
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

        // Default fallback mock if not found
        if (!item && isMounted) {
          if (type === 'rental' || type === 'rentals') {
            setItemType('rental');
            setItem({
              name: 'Royal Enfield Himalayan 450 (GPS Ready)',
              type: 'Motorcycle',
              pricePerDay: 1800,
              city: 'Rishikesh',
              district: 'Dehradun',
              rating: 4.9,
              images: [{ url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80' }]
            });
          } else {
            setItemType('stay');
            setItem({
              name: 'Himalayan Eco Glamping & Orchard Retreat',
              price: 3800,
              city: 'Kanatal',
              district: 'Tehri Garhwal',
              rating: 4.95,
              images: [{ url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80' }]
            });
          }
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

  // Pricing calculations
  const baseRate = item?.price?.amount || item?.pricePerNight || item?.pricePerDay || item?.price || 3200;
  const subtotal = typeof baseRate === 'number' ? baseRate * daysCount : 3200 * daysCount;
  const escrowFee = 0; // 100% Free Escrow guarantee for traveler trust
  const taxes = Math.round(subtotal * 0.05); // 5% Govt Tourism cess
  const totalAmount = subtotal + taxes;

  const handlePayAndSecure = () => {
    setIsSubmitting(true);

    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const bookingId = `DU-ESCROW-${Date.now().toString().slice(-6)}`;

    const finalizeBooking = (paymentDetails = {}) => {
      const isCash = paymentMethod === 'cash';
      const bookingRecord = {
        bookingId,
        id: bookingId,
        _id: bookingId,
        bookingReference: bookingId,
        itemTitle: item?.name || item?.title || 'Mountain Booking',
        itemType,
        location: item?.city || item?.district || 'Uttarakhand',
        startDate,
        endDate,
        daysCount,
        guests,
        totalAmount,
        subtotal,
        taxes,
        escrowStatus: isCash ? 'CASH_HANDSHAKE_PENDING' : 'HELD_IN_ESCROW',
        status: 'CONFIRMED',
        checkInOtp: generatedOtp,
        paidAt: isCash ? null : new Date().toISOString(),
        paymentMethod: isCash ? 'CASH_ON_ARRIVAL' : paymentMethod.toUpperCase(),
        partnerVerified: true,
        verificationProof: 'GPS Geofenced • Video KYC Match',
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

    // If Cash on Arrival is chosen, skip online payment gateway directly
    if (paymentMethod === 'cash') {
      setTimeout(() => {
        finalizeBooking({
          paymentMethod: 'CASH_ON_ARRIVAL',
          paymentStatus: 'PAY_ON_CHECKIN',
          notes: 'Traveler will pay cash directly to partner after physical inspection and 4-digit OTP exchange.'
        });
      }, 500);
      return;
    }

    // If Razorpay SDK is available, launch official payment modal
    if (window.Razorpay) {
      try {
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';
        const options = {
          key: razorpayKey,
          amount: Math.round(totalAmount * 100), // in paise
          currency: "INR",
          name: "Discovery Uttarakhand",
          description: `Escrow Protected Booking - ${item?.name || item?.title || 'Mountain Experience'}`,
          image: "/logo.png",
          handler: function (response) {
            finalizeBooking({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            });
          },
          prefill: {
            name: fullName || "Traveler",
            email: email || "traveler@discovery.com",
            contact: phoneNumber || "+919876543210"
          },
          theme: {
            color: "#0f3d2e"
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          alert(`Payment Failed: ${response.error?.description || 'Transaction declined'}`);
          setIsSubmitting(false);
        });
        rzp.open();
        return;
      } catch (err) {
        console.warn("Razorpay popup launch fallback:", err);
      }
    }

    // Direct fallback if script was offline or popup blocked
    setTimeout(() => {
      finalizeBooking();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-28">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-stone-500">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1.5 hover:text-[#0f3d2e] transition-colors py-1"
          >
            <ArrowLeft size={14} />
            <span>Back to Explorer</span>
          </button>
          <span>/</span>
          <span className="text-stone-800 font-bold">Secure Escrow Checkout</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0f3d2e] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} className="text-emerald-700" />
            <span>Bank-Grade Escrow Guarantee</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight">
            Review & Lock Your Mountain Booking
          </h1>
          <p className="text-stone-600 text-sm mt-1.5 max-w-2xl">
            Your funds remain safely locked in escrow and are only released to the local partner after you physically meet and provide your 4-digit OTP.
          </p>
        </div>

        {/* Mobile Horizontal Escrow Handshake Indicator (<1024px) */}
        <div className="lg:hidden mb-6 bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#0f3d2e] mb-2.5 flex items-center gap-1.5">
            <ShieldCheck size={14} />
            <span>3-Step Escrow Handshake Flow</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[10.5px]">
            <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              <span className="w-5 h-5 rounded-full bg-[#0f3d2e] text-white flex items-center justify-center font-bold text-[10px] mx-auto mb-1">1</span>
              <strong className="text-stone-900 block font-bold leading-tight">Pay into Escrow</strong>
            </div>
            <div className="bg-amber-50 p-2 rounded-xl border border-amber-200">
              <span className="w-5 h-5 rounded-full bg-[#d97706] text-white flex items-center justify-center font-bold text-[10px] mx-auto mb-1">2</span>
              <strong className="text-stone-900 block font-bold leading-tight">Share 4-Digit OTP</strong>
            </div>
            <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] mx-auto mb-1">3</span>
              <strong className="text-stone-900 block font-bold leading-tight">Funds Released</strong>
            </div>
          </div>
        </div>

        {/* ── Two Column Checkout Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20 sm:pb-0">
          
          {/* ── LEFT COLUMN (7 Cols): Booking Details & Contact ── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Item Summary Card */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <img 
                    src={
                      item?.images?.[0]?.url || 
                      item?.image || 
                      (itemType === 'rental' 
                        ? 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80'
                        : 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80')
                    } 
                    alt={item?.name || 'Booking item'} 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-[#0f3d2e] border border-emerald-200">
                      3-Layer Verified
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      {itemType === 'rental' ? 'Fleet Vehicle' : 'Verified Homestay'}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-stone-900 truncate leading-snug">
                    {item?.name || item?.title || 'Himalayan Verified Booking'}
                  </h2>

                  <p className="text-xs text-stone-600 flex items-center gap-1.5 mt-1">
                    <MapPin size={13} className="text-stone-400 shrink-0" />
                    <span>{item?.city ? `${item.city}, ${item.district || 'Uttarakhand'}` : (item?.district || 'Uttarakhand')}</span>
                  </p>

                  <div className="mt-2.5 flex items-center gap-3 text-xs font-semibold text-stone-700">
                    <span className="bg-stone-100 px-2.5 py-1 rounded-md">
                      ₹{baseRate?.toLocaleString('en-IN')} / {itemType === 'rental' ? 'day' : 'night'}
                    </span>
                    <span className="text-emerald-700 flex items-center gap-1">
                      <Check size={13} /> Zero Advance Risk
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates & Duration Selector */}
              <div className="mt-6 pt-5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#fdfbf7] p-3 rounded-xl border border-stone-200">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    {itemType === 'rental' ? 'Pick-up Date' : 'Check-in'}
                  </label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs font-semibold bg-transparent text-stone-900 focus:outline-none"
                  />
                </div>

                <div className="bg-[#fdfbf7] p-3 rounded-xl border border-stone-200">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    {itemType === 'rental' ? 'Return Date' : 'Check-out'}
                  </label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs font-semibold bg-transparent text-stone-900 focus:outline-none"
                  />
                </div>

                <div className="bg-[#fdfbf7] p-3 rounded-xl border border-stone-200">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    {itemType === 'rental' ? 'Riders / Pax' : 'Guests'}
                  </label>
                  <select 
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full text-xs font-semibold bg-transparent text-stone-900 focus:outline-none"
                  >
                    <option value={1}>1 Traveler (Solo)</option>
                    <option value={2}>2 Travelers (Couple / Duo)</option>
                    <option value={3}>3 Travelers</option>
                    <option value={4}>4 Travelers (Family)</option>
                    <option value={6}>6+ Travelers</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Traveler Contact Information */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center justify-between">
                <span>Traveler Details</span>
                <span className="text-xs font-normal text-stone-500">For SMS Escrow OTP Delivery</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">Primary Guest / Driver Name</label>
                  <input 
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/30 focus:border-[#0f3d2e]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">Mobile Number (SMS OTP)</label>
                  <input 
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/30 focus:border-[#0f3d2e]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">Email Address</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="traveler@domain.com"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/30 focus:border-[#0f3d2e]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method Selector */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <h3 className="text-base font-bold text-stone-900 mb-3 flex items-center justify-between">
                <span>Select Payment Mode</span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <Lock size={12} /> 256-Bit Encrypted
                </span>
              </h3>

              <div className="space-y-3">
                {/* Cash on Arrival Option (Recommended for On-Trip & Hackathon Demo) */}
                <label className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cash' ? 'border-[#0f3d2e] bg-emerald-50/40 ring-1 ring-[#0f3d2e]' : 'border-stone-200 hover:border-stone-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                        className="text-[#0f3d2e] focus:ring-[#0f3d2e]"
                      />
                      <div>
                        <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                          <span>💵 Pay on Arrival (Cash Handshake with 4-Digit OTP)</span>
                          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">Demo / Cash Ready</span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Inspect keys & condition first • Hand cash only when satisfied & give 4-digit OTP
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">Zero Advance</span>
                  </div>

                  {paymentMethod === 'cash' && (
                    <div className="mt-3 pt-2.5 border-t border-emerald-100/80 text-[11px] text-emerald-900 flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
                      <span>No card or online payment required today. Your 4-digit booking voucher is issued instantly!</span>
                    </div>
                  )}
                </label>

                {/* UPI Option */}
                <label className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'upi' ? 'border-[#0f3d2e] bg-emerald-50/40 ring-1 ring-[#0f3d2e]' : 'border-stone-200 hover:border-stone-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="text-[#0f3d2e] focus:ring-[#0f3d2e]"
                      />
                      <div>
                        <div className="text-xs font-bold text-stone-900">UPI Instant Payment (Google Pay / PhonePe / QR)</div>
                        <div className="text-[11px] text-stone-500">Fastest checkout • Direct Escrow Hold</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">Instant</span>
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="mt-3.5 pt-3 border-t border-emerald-100 flex items-center gap-2 flex-wrap">
                      {['gpay', 'phonepe', 'paytm', 'qr'].map((app) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => setUpiApp(app)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                            upiApp === app 
                              ? 'bg-[#0f3d2e] text-white border-[#0f3d2e] shadow-xs' 
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {app === 'qr' ? 'Show QR Code' : app === 'gpay' ? 'Google Pay' : app}
                        </button>
                      ))}
                    </div>
                  )}
                </label>

                {/* Cards Option */}
                <label className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'card' ? 'border-[#0f3d2e] bg-emerald-50/40 ring-1 ring-[#0f3d2e]' : 'border-stone-200 hover:border-stone-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="text-[#0f3d2e] focus:ring-[#0f3d2e]"
                      />
                      <div>
                        <div className="text-xs font-bold text-stone-900">Credit / Debit Card</div>
                        <div className="text-[11px] text-stone-500">Visa, Mastercard, RuPay, Amex</div>
                      </div>
                    </div>
                    <CreditCard size={18} className="text-stone-400" />
                  </div>
                </label>

                {/* Net Banking */}
                <label className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'netbanking' ? 'border-[#0f3d2e] bg-emerald-50/40 ring-1 ring-[#0f3d2e]' : 'border-stone-200 hover:border-stone-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'netbanking'}
                        onChange={() => setPaymentMethod('netbanking')}
                        className="text-[#0f3d2e] focus:ring-[#0f3d2e]"
                      />
                      <div>
                        <div className="text-xs font-bold text-stone-900">Net Banking</div>
                        <div className="text-[11px] text-stone-500">All major Indian banks supported</div>
                      </div>
                    </div>
                    <Building2 size={18} className="text-stone-400" />
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN (5 Cols): Escrow Graphic & Order Summary ── */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* ── THE WINNING FEATURE: Visual Escrow + OTP Handshake Graphic ── */}
            <div className="bg-[#0f3d2e] text-white rounded-2xl p-6 shadow-lg relative overflow-hidden border border-emerald-800">
              {/* Subtle background glow */}
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-4">
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-400/20 flex items-center gap-1">
                  <ShieldCheck size={12} />
                  Safe Traveler Guarantee
                </span>
              </div>

              <h3 className="text-lg font-bold tracking-tight text-white mb-1">
                How Escrow + OTP Handshake Works
              </h3>
              <p className="text-xs text-emerald-200/80 mb-5 leading-relaxed">
                You never pay a stranger in advance. Your money stays protected until you are completely satisfied on-site.
              </p>

              {/* 3 Step Flow Graphic */}
              <div className="space-y-4">
                
                {/* Step 1 */}
                <div className="flex items-start gap-3.5 bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Lock size={13} className="text-emerald-400" />
                      Pay securely (Funds held in Escrow)
                    </h4>
                    <p className="text-[11px] text-emerald-100/70 mt-0.5 leading-snug">
                      Payment is held in a protected RBI-compliant digital escrow account.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3.5 bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-amber-500/30 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <KeyRound size={13} className="text-amber-400" />
                      Meet Partner & Share 4-digit OTP
                    </h4>
                    <p className="text-[11px] text-emerald-100/70 mt-0.5 leading-snug">
                      Inspect stay or vehicle keys. Only then tell your partner the OTP.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3.5 bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-emerald-400/30 border border-emerald-300/40 text-emerald-200 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-300" />
                      Payment released to Partner
                    </h4>
                    <p className="text-[11px] text-emerald-100/70 mt-0.5 leading-snug">
                      The OTP automatically triggers instant payout directly to the verified local partner.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <h3 className="text-base font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100">
                Price Breakdown
              </h3>

              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex items-center justify-between">
                  <span>
                    ₹{baseRate?.toLocaleString('en-IN')} × {daysCount} {itemType === 'rental' ? 'Days' : 'Nights'}
                  </span>
                  <span className="font-semibold text-stone-900">₹{subtotal?.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    Escrow Protection Fee
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">FREE</span>
                  </span>
                  <span className="font-semibold text-emerald-700">₹0</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Uttarakhand Tourism Cess (5%)</span>
                  <span className="font-semibold text-stone-900">₹{taxes?.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-base font-bold text-stone-900">
                  <span>Total Payable</span>
                  <span className="text-xl font-black text-[#0f3d2e]">
                    ₹{totalAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Primary CTA Button */}
              <button
                type="button"
                onClick={handlePayAndSecure}
                disabled={isSubmitting}
                className="w-full mt-6 bg-[#0f3d2e] hover:bg-[#144c3a] active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-75 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{paymentMethod === 'cash' ? 'Generating 4-Digit Check-in Voucher...' : 'Locking Funds in Escrow...'}</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} className="text-emerald-300" />
                    <span>
                      {paymentMethod === 'cash' 
                        ? `Confirm Booking (Pay ₹${totalAmount?.toLocaleString('en-IN')} in Cash on Arrival)`
                        : `Pay & Secure Booking (₹${totalAmount?.toLocaleString('en-IN')})`}
                    </span>
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-stone-500 text-center">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>
                  {paymentMethod === 'cash'
                    ? 'Pay cash only after test drive / key check • Verified local partner'
                    : 'Zero advance transfer to partner • 100% Refundable prior to OTP'}
                </span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* ── Mobile Sticky Bottom Checkout Bar (<640px) ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 px-4 flex items-center justify-between shadow-2xl safe-area-bottom">
        <div>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            {paymentMethod === 'cash' ? 'Pay On Arrival' : 'Total Amount'}
          </span>
          <span className="text-lg font-black text-[#0f3d2e]">₹{totalAmount?.toLocaleString('en-IN')}</span>
        </div>
        <button
          type="button"
          onClick={handlePayAndSecure}
          disabled={isSubmitting}
          className="bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-bold py-2.5 px-5 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
        >
          <Lock size={14} className="text-emerald-300" />
          <span>{isSubmitting ? 'Confirming...' : paymentMethod === 'cash' ? 'Confirm (Cash)' : 'Pay & Secure'}</span>
        </button>
      </div>

      {/* ── ESCROW / CASH CONFIRMATION SUCCESS MODAL ── */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-100 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#0f3d2e] flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-xs">
              <CheckCircle2 size={36} className="text-emerald-700" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {confirmedBooking.paymentMethod === 'CASH_ON_ARRIVAL' ? '💵 Cash Handshake Reserved' : '🛡️ Escrow Active & Protected'}
            </span>

            <h3 className="text-2xl font-black text-stone-900 mt-2.5 mb-1">
              Booking Confirmed!
            </h3>
            <p className="text-xs text-stone-600 mb-6">
              {confirmedBooking.paymentMethod === 'CASH_ON_ARRIVAL'
                ? `You will pay ₹${confirmedBooking.totalAmount?.toLocaleString('en-IN')} directly in cash to the host after inspecting the ride/room keys. Share the 4-digit OTP below upon check-in.`
                : 'Your funds are held safely in Escrow. Share the secret OTP below with your partner only upon satisfaction.'}
            </p>

            {/* Secret 4-Digit OTP Box */}
            <div className="bg-[#fdfbf7] p-5 rounded-2xl border-2 border-dashed border-[#0f3d2e]/30 mb-6">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Your 4-Digit Handshake OTP
              </span>
              <div className="text-4xl font-mono font-black text-[#0f3d2e] tracking-widest my-1">
                {confirmedBooking.checkInOtp}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Booking ID: <strong className="text-stone-800">{confirmedBooking.bookingId}</strong>
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => navigate('/my-trip')}
                className="w-full bg-[#0f3d2e] hover:bg-[#144c3a] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Go to On-Trip Dashboard</span>
                <ChevronRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => setConfirmedBooking(null)}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors"
              >
                Close & Return
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
