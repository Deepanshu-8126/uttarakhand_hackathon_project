/**
 * Discovery Uttarakhand — Booking & Reservation Controller (Phase 4)
 * Connects ACTIVE PartnerListings and static assets to an authenticated reservation lifecycle.
 * Server is the source of truth for pricing, snapshots, and booking references.
 */

import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Listing from '../models/Listing.js';
import PartnerListing from '../models/PartnerListing.js';
import Stay from '../models/Stay.js';
import Rental from '../models/Rental.js';
import Guide from '../models/Guide.js';
import { generateCheckInOtp, getOtpExpiration, verifyOtpToken, releaseEscrowPayout } from '../services/escrowService.js';

// Helper to generate a unique human-readable booking reference
const generateBookingReference = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `DU-${dateStr}-${randomSuffix}`;
};

export const createBooking = async (req, res) => {
  try {
    const { 
      type, 
      bookingType, 
      partnerListing,
      stay, 
      rental, 
      guide, 
      item,
      trip,
      vehicleName, 
      startDate, 
      endDate, 
      checkIn,
      checkOut,
      guests, 
      traveler,
      specialRequest,
      notes, 
      quantity 
    } = req.body;
    
    // 1. Normalize Type
    let normalizedType = type || bookingType;
    if (normalizedType === 'partnerListing' || normalizedType === 'partner_listing') {
      normalizedType = 'partner_listing';
    }

    // 2. Resolve entity references
    const partnerListingRef = partnerListing || (normalizedType === 'partner_listing' ? item : null);
    const stayRef = stay || (normalizedType === 'stay' ? item : null);
    const rentalRef = rental || (normalizedType === 'rental' ? item : null);
    const guideRef = guide || (normalizedType === 'guide' ? item : null);

    if (!normalizedType) {
      return res.status(400).json({ success: false, message: 'Booking type is required' });
    }

    // 3. Resolve and validate dates
    const rawStart = startDate || checkIn || req.body.reservation?.checkIn || req.body.reservation?.startDate;
    const rawEnd = endDate || checkOut || req.body.reservation?.checkOut || req.body.reservation?.endDate;

    if (!rawStart || !rawEnd) {
      return res.status(400).json({ success: false, message: 'Please provide valid start and end dates' });
    }

    const sDate = new Date(rawStart);
    const eDate = new Date(rawEnd);

    if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid reservation date format' });
    }

    if (eDate <= sDate) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    // Same-day check: enforce minimum 1-night stay for stay / partner listings
    const diffTime = eDate.getTime() - sDate.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (days < 1) {
      return res.status(400).json({ success: false, message: 'Reservation must be for at least 1 day/night' });
    }

    const numGuests = Number(guests || traveler?.guests) || 1;
    const qty = Number(quantity) || 1;

    let subtotal = 0;
    let total = 0;
    let currency = 'INR';
    let amountNotes = '';
    let pricingSnapshot = null;
    let listingSnapshot = null;
    let vehicleSnapshot = null;

    // 4. Unified Listing Booking Flow (Audit E-01 Fix)
    if (normalizedType === 'listing' || req.body.listingId) {
      const targetListingId = req.body.listingId || partnerListingRef || item;
      const unifiedListing = await Listing.findOne({ _id: targetListingId, status: 'active' });
      if (unifiedListing) {
        const rate = unifiedListing.pricing.basePrice;
        const unit = unifiedListing.pricing.unit || 'night';
        currency = unifiedListing.pricing.currency || 'INR';

        if (unit === 'night' || unit === 'day') {
          subtotal = rate * days * qty;
        } else if (unit === 'person') {
          subtotal = rate * numGuests;
        } else {
          subtotal = rate * days * qty;
        }
        
        const greenCess = (unifiedListing.pricing.greenCess || 50) * numGuests;
        total = subtotal + greenCess + (unifiedListing.pricing.cleaningFee || 0);

        pricingSnapshot = {
          amount: rate,
          unit,
          currency,
          quantity: qty,
          subtotal,
          greenCess,
          total,
          provenance: 'VERIFIED'
        };

        const bookingRef = generateBookingReference();
        const checkInOtp = generateCheckInOtp();
        const otpExpiresAt = getOtpExpiration();

        const booking = await Booking.create({
          user: req.user._id,
          bookingReference: bookingRef,
          type: unifiedListing.category,
          source: unifiedListing.source,
          partnerListing: unifiedListing._id,
          partner: unifiedListing.partnerId,
          startDate: sDate,
          endDate: eDate,
          guests: numGuests,
          quantity: qty,
          pricing: pricingSnapshot,
          status: 'PENDING_PAYMENT',
          checkInOtp,
          otpExpiresAt,
          escrowStatus: 'HELD'
        });

        return res.status(201).json({
          success: true,
          message: 'Reservation created successfully under unified listing pipeline',
          data: booking
        });
      }
    }

    // 5. Partner Listing Booking Flow (Legacy fallback)
    if (normalizedType === 'partner_listing') {
      if (!partnerListingRef) {
        return res.status(400).json({ success: false, message: 'Partner listing reference is required' });
      }

      const listing = await PartnerListing.findById(partnerListingRef);
      if (!listing) {
        return res.status(404).json({ success: false, message: 'Listing not found' });
      }

      // CRITICAL GATE: Only ACTIVE listings are bookable
      if (listing.status !== 'ACTIVE') {
        return res.status(400).json({ 
          success: false, 
          message: `This listing is not currently bookable. Status: ${listing.status}. Only ACTIVE listings can be booked.` 
        });
      }

      // CRITICAL GATE: Pricing must have VERIFIED provenance
      if (!listing.pricing || listing.pricing.provenance !== 'VERIFIED') {
        return res.status(400).json({ 
          success: false, 
          message: 'Verified pricing is not available for this listing. Only listings with VERIFIED pricing can be booked.' 
        });
      }

      // Capacity validation if defined
      if (listing.capacity && listing.capacity.maxGuests) {
        if (numGuests > listing.capacity.maxGuests) {
          return res.status(400).json({ 
            success: false, 
            message: `Guest count (${numGuests}) exceeds the listed capacity (${listing.capacity.maxGuests}).` 
          });
        }
      }

      const unit = listing.pricing.unit || 'night';
      const rate = listing.pricing.amount;
      currency = listing.pricing.currency || 'INR';

      // Deterministic price calculation based on pricing unit
      if (unit === 'night' || unit === 'day') {
        subtotal = rate * days * qty;
      } else if (unit === 'person') {
        subtotal = rate * numGuests;
      } else if (unit === 'trip' || unit === 'custom') {
        subtotal = rate * qty;
      } else {
        subtotal = rate * days * qty;
      }
      total = subtotal;

      pricingSnapshot = {
        amount: rate,
        unit,
        currency,
        quantity: qty,
        subtotal,
        total,
        provenance: 'VERIFIED'
      };

      listingSnapshot = {
        title: listing.title,
        category: listing.category || listing.listingType,
        district: listing.district,
        listingType: listing.listingType,
        location: listing.city ? `${listing.city}, ${listing.district}` : listing.district
      };

    // 5. Static Verified Stay Flow (Backward Compatibility)
    } else if (normalizedType === 'stay') {
      if (!stayRef) return res.status(400).json({ success: false, message: 'Stay reference required' });
      const stayDoc = await Stay.findById(stayRef);
      if (!stayDoc) return res.status(404).json({ success: false, message: 'Stay not found' });
      
      const rate = stayDoc.price?.amount || 0;
      if (rate > 0) {
        subtotal = rate * days * qty;
        total = subtotal;
        pricingSnapshot = {
          amount: rate,
          unit: 'night',
          currency: 'INR',
          quantity: qty,
          subtotal,
          total,
          provenance: 'VERIFIED'
        };
      } else {
        amountNotes = 'Price on request - negotiate with property';
        pricingSnapshot = {
          amount: 0,
          unit: 'night',
          currency: 'INR',
          quantity: qty,
          subtotal: 0,
          total: 0,
          provenance: 'UNKNOWN'
        };
      }

      listingSnapshot = {
        title: stayDoc.name,
        category: stayDoc.category,
        district: stayDoc.district,
        listingType: 'Stay',
        location: stayDoc.location
      };

    // 6. Static Rental Flow
    } else if (normalizedType === 'rental') {
      if (!rentalRef) return res.status(400).json({ success: false, message: 'Rental reference required' });
      const rentalDoc = await Rental.findById(rentalRef);
      if (!rentalDoc) return res.status(404).json({ success: false, message: 'Rental not found' });
      
      const v = (rentalDoc.vehicles || []).find(veh => veh.name === vehicleName) || (rentalDoc.vehicles && rentalDoc.vehicles[0]);
      if (v) {
        vehicleSnapshot = {
          name: v.name,
          type: v.type,
          pricePerDay: v.pricePerDay
        };
        const rate = v.pricePerDay || 0;
        subtotal = rate * days * qty;
        total = subtotal;
        pricingSnapshot = {
          amount: rate,
          unit: 'day',
          currency: 'INR',
          quantity: qty,
          subtotal,
          total,
          provenance: rate > 0 ? 'VERIFIED' : 'UNKNOWN'
        };
      } else {
        amountNotes = 'Vehicle not specified or not found';
      }

      listingSnapshot = {
        title: rentalDoc.name,
        category: rentalDoc.category || rentalDoc.type || 'Rental',
        district: rentalDoc.district,
        listingType: 'Rental',
        location: rentalDoc.city ? `${rentalDoc.city}, ${rentalDoc.district}` : (rentalDoc.address || rentalDoc.district || 'Uttarakhand')
      };

    // 7. Static Guide Flow
    } else if (normalizedType === 'guide') {
      if (!guideRef) return res.status(400).json({ success: false, message: 'Guide reference required' });
      const guideDoc = await Guide.findById(guideRef);
      if (!guideDoc) return res.status(404).json({ success: false, message: 'Guide not found' });

      amountNotes = 'Negotiate directly';
      pricingSnapshot = {
        amount: 0,
        unit: 'day',
        currency: 'INR',
        quantity: 1,
        subtotal: 0,
        total: 0,
        provenance: 'UNKNOWN'
      };

      listingSnapshot = {
        title: guideDoc.name,
        category: guideDoc.specialty || 'Licensed Guide',
        district: guideDoc.district,
        listingType: 'Guide',
        location: guideDoc.location
      };

    } else {
      return res.status(400).json({ success: false, message: 'Invalid booking type' });
    }

    // 8. Generate unique booking reference
    let bookingReference = generateBookingReference();
    // Safety check to ensure no collision
    let existingRef = await Booking.findOne({ bookingReference });
    while (existingRef) {
      bookingReference = generateBookingReference();
      existingRef = await Booking.findOne({ bookingReference });
    }

    // 9. Prepare traveler contact info
    const travelerData = {
      name: traveler?.name || req.user.name || 'Traveler',
      email: traveler?.email || req.user.email || '',
      phone: traveler?.phone || req.user.phone || '',
      guests: numGuests
    };

    // 10. Persist Booking Record
    // Note: status is strictly set to 'PENDING', client status in req.body is ignored.
    const booking = await Booking.create({
      user: req.user.id || req.user._id,
      type: normalizedType,
      partnerListing: partnerListingRef,
      stay: stayRef,
      rental: rentalRef,
      guide: guideRef,
      trip: trip || null,
      bookingReference,
      vehicle: vehicleSnapshot,
      startDate: sDate,
      endDate: eDate,
      reservation: {
        checkIn: sDate,
        checkOut: eDate,
        startDate: sDate,
        endDate: eDate
      },
      guests: numGuests,
      traveler: travelerData,
      amount: total,
      currency,
      amountNotes,
      pricingSnapshot,
      listingSnapshot,
      specialRequest: specialRequest || notes || null,
      notes,
      status: 'CONFIRMED',
      escrowStatus: 'HELD_IN_ESCROW',
      checkInOtp: generateCheckInOtp(),
      checkInOtpExpiresAt: getOtpExpiration(sDate),
      bookingType: normalizedType,
      totalAmount: total
    });

    res.status(201).json({ 
      success: true, 
      message: 'Reservation created successfully',
      data: booking 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const filter = { user: req.user.id || req.user._id };
    
    // Support status filtering if requested
    if (req.query.status) {
      const qStatus = req.query.status.toUpperCase();
      filter.status = qStatus;
    }

    const bookings = await Booking.find(filter)
      .populate('partnerListing', 'title category district city pricing status images')
      .populate('stay')
      .populate('rental')
      .populate('guide')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('partnerListing', 'title category district city pricing status images')
      .populate('stay')
      .populate('rental')
      .populate('guide');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ownership check: User can only see their own booking (Admin can inspect any)
    const userId = (req.user.id || req.user._id).toString();
    if (booking.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ownership check: Only owner or admin can cancel
    const userId = (req.user.id || req.user._id).toString();
    if (booking.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    // Lifecycle state machine check
    const currentStatus = (booking.status || '').toUpperCase();
    if (currentStatus === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'This booking is already cancelled' });
    }
    if (currentStatus === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Completed bookings cannot be cancelled' });
    }
    if (currentStatus !== 'PENDING' && currentStatus !== 'CONFIRMED') {
      return res.status(400).json({ 
        success: false, 
        message: `This booking cannot be changed from its current status (${currentStatus})` 
      });
    }

    booking.status = 'CANCELLED';
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: req.user.id || req.user._id,
      reason: req.body.reason || 'Cancelled by traveler'
    };

    await booking.save();

    res.json({ 
      success: true, 
      message: 'Booking cancelled successfully.',
      data: booking 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Feature 14: Get Dynamic Check-in OTP for Traveler
 * GET /api/bookings/:id/checkin-otp
 */
export const getCheckInOtp = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const userId = (req.user.id || req.user._id).toString();
    if (booking.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view OTP for this booking' });
    }

    // Ensure OTP exists, generate if legacy
    if (!booking.checkInOtp) {
      booking.checkInOtp = generateCheckInOtp();
      booking.checkInOtpExpiresAt = getOtpExpiration(booking.startDate);
      await booking.save();
    }

    res.json({
      success: true,
      data: {
        bookingId: booking._id,
        bookingReference: booking.bookingReference,
        title: booking.listingSnapshot?.title || 'Mountain Reservation',
        category: booking.type,
        escrowStatus: booking.escrowStatus || 'HELD_IN_ESCROW',
        status: booking.status,
        checkInOtp: booking.checkInOtp,
        expiresAt: booking.checkInOtpExpiresAt,
        amount: booking.amount || booking.totalAmount || 0,
        currency: booking.currency || 'INR',
        instructions: 'Hand this 6-digit OTP to your local partner upon vehicle/room inspection to release escrow.'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Feature 14: Partner Verifies Check-In OTP to Release Escrow Funds
 * POST /api/bookings/:id/verify-checkin
 */
export const verifyCheckIn = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: 'Check-in OTP is required' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if already checked in
    if (booking.status === 'CHECKED_IN' || booking.escrowStatus === 'RELEASED_TO_PARTNER') {
      return res.status(400).json({ 
        success: false, 
        message: 'This booking has already been checked in and escrow payout has already been processed.' 
      });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Cancelled bookings cannot be checked in' });
    }

    // Verify OTP token
    const isValid = verifyOtpToken(otp, booking.checkInOtp, booking.checkInOtpHash);
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP! Please re-verify the 6 digits displayed on traveler voucher.' 
      });
    }

    // Process payout release
    const payoutReceipt = releaseEscrowPayout(booking, req.user?.id);

    booking.status = 'CHECKED_IN';
    booking.escrowStatus = 'RELEASED_TO_PARTNER';
    booking.checkInVerifiedAt = new Date();
    booking.escrowReleasedAt = new Date();
    booking.escrowAudit = {
      transactionId: payoutReceipt.transactionId,
      releasedAmount: payoutReceipt.partnerPayout,
      platformFee: payoutReceipt.platformFee,
      notes: payoutReceipt.message
    };

    await booking.save();

    res.json({
      success: true,
      message: 'Check-In verified successfully! Escrow funds released to partner account.',
      data: {
        bookingId: booking._id,
        bookingReference: booking.bookingReference,
        status: booking.status,
        escrowStatus: booking.escrowStatus,
        receipt: payoutReceipt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Feature 3: One-Tap Reverse Rental / Instant Re-allocation
 * POST /api/bookings/:id/cancel-reverse
 */
export const cancelAndReverseRental = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const userId = (req.user.id || req.user._id).toString();
    if (booking.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this booking' });
    }

    if (booking.status === 'CHECKED_IN' || booking.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an active or completed rental.' });
    }

    booking.status = 'CANCELLED';
    booking.escrowStatus = 'REFUNDED_TO_TRAVELER';
    booking.isReverseRentalAvailable = true; // Auto-suggest to nearby travelers
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: req.user.id || req.user._id,
      reason: req.body.reason || 'One-Tap Reverse Cancellation'
    };

    await booking.save();

    res.json({
      success: true,
      message: 'Reverse Rental activated! 100% Escrow refunded to traveler; vehicle instantly re-listed for nearby travelers.',
      data: {
        bookingId: booking._id,
        status: booking.status,
        escrowStatus: booking.escrowStatus,
        isReverseRentalAvailable: true,
        refundProcessed: true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
