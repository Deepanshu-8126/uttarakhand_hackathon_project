import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Car, 
  Bike, 
  Users, 
  Gauge, 
  Fuel, 
  FileText, 
  Calendar,
  Lock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { getCardImages } from '../../utils/imageHelpers';

export default function RentalDetailModal({
  rental,
  isOpen,
  onClose,
  startDate,
  endDate
}) {
  if (!isOpen || !rental) return null;

  const navigate = useNavigate();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const images = getCardImages(rental);
  const rentalId = rental._id || rental.id || rental.slug;
  const rentalSlug = rental.slug || rental._id || rental.id;
  const isVerified = Boolean(
    rental.isVerified || 
    rental.partnerListingId || 
    rental.isPartnerListing || 
    rental.partnerVerified || 
    rental.partnerId?.isVerified
  );

  const priceVal = rental.pricePerDay || (typeof rental.price === 'object' ? rental.price?.amount : rental.price) || 1200;
  const formattedPrice = typeof priceVal === 'number' ? priceVal.toLocaleString('en-IN') : String(priceVal);

  const isTwoWheeler = rental.type === 'Scooter' || rental.type === 'Motorcycle' || 
    (rental.category && (rental.category.toLowerCase().includes('bike') || rental.category.toLowerCase().includes('scooter')));

  const transmission = rental.transmission || (isTwoWheeler && rental.type !== 'Motorcycle' ? 'Automatic' : 'Manual');
  const seats = rental.seats || (isTwoWheeler ? 2 : (rental.type === 'SUV' ? 5 : 5));
  const fuel = rental.fuelType || (isTwoWheeler ? 'Petrol' : 'Diesel / Petrol');

  const locationText = rental.city 
    ? `${rental.city}${rental.district ? `, ${rental.district}` : ''}`
    : (rental.district || 'Uttarakhand');

  // Checkout URL with preserved dates
  const checkoutUrl = `/checkout/rental/${rentalId}${
    startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : ''
  }`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 my-auto animate-in zoom-in-95 duration-200">
        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md flex items-center justify-center transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="max-h-[85vh] overflow-y-auto">
          {/* ── 1. Photo Showcase ── */}
          <div className="relative aspect-[16/9] sm:aspect-[2/1] bg-stone-900 overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[activePhotoIdx] || images[0]}
                alt={rental.name}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  e.currentTarget.src = '/assets/pickup-1.jpg';
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                {isTwoWheeler ? <Bike size={48} /> : <Car size={48} />}
                <span className="text-xs font-semibold mt-2">Vehicle photo unavailable</span>
              </div>
            )}

            {/* Verification Tag */}
            {isVerified && (
              <div className="absolute top-4 left-4 z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#0f3d2e] text-white shadow-md border border-emerald-400/40">
                  <CheckCircle2 size={14} className="text-emerald-300 shrink-0" />
                  <span>Verified Partner Listing</span>
                </span>
              </div>
            )}

            {/* Thumbnail dots if multiple images */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-stone-950/50 backdrop-blur-xs px-2.5 py-1 rounded-full">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      activePhotoIdx === idx ? 'w-5 bg-emerald-400' : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── 2. Information Section ── */}
          <div className="p-5 sm:p-7 space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                <span>{rental.type || rental.category || 'Rental Vehicle'}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-800">
                  <MapPin size={12} />
                  <span>{locationText}</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                {rental.name}
              </h2>

              {rental.businessName && rental.businessName !== rental.name && (
                <p className="text-xs text-stone-500 font-medium mt-0.5">
                  Operated by <strong className="text-stone-800">{rental.businessName}</strong>
                </p>
              )}
            </div>

            {/* Specification Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs">
              <div className="flex items-center gap-2 text-stone-700 font-semibold">
                <Gauge size={16} className="text-emerald-700 shrink-0" />
                <span>{transmission}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700 font-semibold">
                <Users size={16} className="text-emerald-700 shrink-0" />
                <span>{seats} Seats</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700 font-semibold">
                <Fuel size={16} className="text-emerald-700 shrink-0" />
                <span>{fuel}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700 font-semibold">
                <Star size={16} className="text-amber-500 fill-amber-500 shrink-0" />
                <span>{rental.rating ? `${rental.rating} (Verified)` : 'Highly Rated'}</span>
              </div>
            </div>

            {/* Description / Overview if available */}
            {rental.description && (
              <div>
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Vehicle Overview
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {rental.description}
                </p>
              </div>
            )}

            {/* Pickup & Rental Guidelines */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Rental Guidelines &amp; Policies
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-stone-200">
                  <FileText size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                  <span>Valid Original Driving License and Aadhaar required at pickup.</span>
                </div>
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-stone-200">
                  <ShieldCheck size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                  <span>Refundable security deposit collected by partner upon hand-over.</span>
                </div>
              </div>
            </div>

            {/* Dates preview if selected */}
            {startDate && endDate && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-emerald-800" />
                  <span>Rental Period: <strong>{startDate}</strong> to <strong>{endDate}</strong></span>
                </div>
                <span className="font-bold text-emerald-800">Confirmed on Checkout</span>
              </div>
            )}

            {/* ── 3. Bottom Action Bar ── */}
            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-stone-900">
                    ₹{formattedPrice}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">/ day</span>
                </div>
                <span className="text-[11px] text-stone-500 font-medium block">
                  {isVerified ? '✓ Verified marketplace price' : 'Partner listed price'} • Server validated
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={`/rentals/${rentalSlug}`}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 hover:border-stone-400 bg-white text-stone-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Full Listing Page</span>
                  <ExternalLink size={13} />
                </Link>

                <Link
                  to={checkoutUrl}
                  className="px-6 py-3 rounded-xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white text-xs font-bold tracking-wide uppercase transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Lock size={13} className="text-emerald-300" />
                  <span>Book Vehicle</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
