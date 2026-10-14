import PartnerListing from '../../models/PartnerListing.js';
import Booking from '../../models/Booking.js';
import cloudinary from '../../config/cloudinary.js';
import fs from 'fs';
import { generateSlug, resolveLocationAndDestination, resolvePartnerForUser } from './partnerHelpers.js';

/**
 * Create a new listing draft
 * POST /api/partners/me/listings
 */
export const createListingDraft = async (req, res) => {
  try {
    const partner = await resolvePartnerForUser(req.user);
    if (!partner) {
      return res.status(403).json({ success: false, message: 'Partner profile required.' });
    }

    // Security check: Partner cannot inject 'VERIFIED' or 'ACTIVE'
    if (req.body.status && ['VERIFIED', 'ACTIVE'].includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: 'Illegal state transition: Partners cannot directly set status to VERIFIED or ACTIVE.'
      });
    }

    const {
      listingType,
      title,
      category,
      district,
      city,
      locality,
      destination,
      destinationSlug,
      address,
      location,
      latitude,
      longitude,
      description,
      amenities,
      images,
      pricing,
      specifications,
      pricingDetails,
      availabilityDetails
    } = req.body;

    if (!listingType || !title || !district || !pricing || !pricing.amount) {
      return res.status(400).json({
        success: false,
        message: 'listingType, title, district, and pricing with amount are required.'
      });
    }

    const resolved = await resolveLocationAndDestination({
      district,
      city,
      locality,
      destination,
      destinationSlug,
      location,
      latitude,
      longitude
    });

    const normalizedPricing = {
      amount: Number(pricing.amount),
      unit: pricing.unit || 'night',
      currency: 'INR',
      provenance: 'PARTNER_CLAIMED',
      lastVerifiedAt: null
    };

    const listing = await PartnerListing.create({
      partner: partner._id,
      ownerUser: req.user._id,
      listingType,
      title,
      slug: generateSlug(title),
      category,
      district,
      city: city || null,
      locality: locality || null,
      destination: resolved.destination,
      destinationSlug: resolved.destinationSlug,
      address,
      location: resolved.location,
      description,
      amenities: Array.isArray(amenities) ? amenities : [],
      images: Array.isArray(images) ? images : [],
      specifications: specifications || {},
      pricingDetails: pricingDetails || {},
      availabilityDetails: availabilityDetails || {
        totalUnits: 1,
        availableUnits: 1,
        statusReason: 'Available',
        blockedDates: []
      },
      pricing: normalizedPricing,
      isActive: true,
      status: req.body.submitForVerification ? 'PENDING_VERIFICATION' : 'DRAFT',
      submittedAt: req.body.submitForVerification ? new Date() : null,
      verifiedAt: null,
      verificationVersion: 1
    });

    res.status(201).json({
      success: true,
      data: listing,
      message: req.body.submitForVerification
        ? 'Listing created and submitted for platform verification.'
        : 'Listing draft saved successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all listings for current partner
 * GET /api/partners/me/listings
 */
export const getMyListings = async (req, res) => {
  try {
    const partner = await resolvePartnerForUser(req.user);
    if (!partner) {
      return res.status(403).json({ success: false, message: 'Partner profile required.' });
    }

    const listings = await PartnerListing.find({ partner: partner._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get specific listing details
 * GET /api/partners/me/listings/:id
 */
export const getMyListingById = async (req, res) => {
  try {
    const listing = await PartnerListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const isOwner = req.user.role === 'admin' || (listing.ownerUser && listing.ownerUser.equals(req.user._id));
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not own this listing.'
      });
    }

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Edit listing
 * PATCH /api/partners/me/listings/:id
 */
export const updateListing = async (req, res) => {
  try {
    const listing = await PartnerListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const isOwner = req.user.role === 'admin' || (listing.ownerUser && listing.ownerUser.equals(req.user._id));
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this listing.' });
    }

    const editableFields = [
      'title', 'category', 'district', 'city', 'locality', 'address', 'description', 
      'amenities', 'images', 'specifications', 'pricingDetails', 'availabilityDetails'
    ];
    editableFields.forEach(f => {
      if (req.body[f] !== undefined) {
        listing[f] = req.body[f];
      }
    });

    if (req.body.destination || req.body.destinationSlug || req.body.location || req.body.latitude || req.body.longitude || req.body.city || req.body.locality) {
      const resolved = await resolveLocationAndDestination({
        district: listing.district,
        city: listing.city,
        locality: listing.locality,
        destination: req.body.destination || listing.destinationSlug,
        destinationSlug: req.body.destinationSlug,
        location: req.body.location,
        latitude: req.body.latitude,
        longitude: req.body.longitude
      });
      if (resolved.destination) listing.destination = resolved.destination;
      if (resolved.destinationSlug) listing.destinationSlug = resolved.destinationSlug;
      if (resolved.location) listing.location = resolved.location;
    }

    if (req.body.pricing && req.body.pricing.amount) {
      listing.pricing = {
        amount: Number(req.body.pricing.amount),
        unit: req.body.pricing.unit || listing.pricing.unit,
        currency: 'INR',
        provenance: 'PARTNER_CLAIMED',
        lastVerifiedAt: null
      };
    }

    await listing.save();
    res.status(200).json({ success: true, data: listing, message: 'Listing updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Submit listing for admin verification (Idempotent)
 * POST /api/partners/me/listings/:id/submit
 */
export const submitListingForVerification = async (req, res) => {
  try {
    const listing = await PartnerListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const isOwner = req.user.role === 'admin' || (listing.ownerUser && listing.ownerUser.equals(req.user._id));
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this listing.' });
    }

    if (listing.status === 'PENDING_VERIFICATION') {
      return res.status(200).json({
        success: true,
        data: listing,
        message: 'Listing is already submitted and in verification queue.'
      });
    }
    if (!['DRAFT', 'REJECTED'].includes(listing.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot submit listing with status [${listing.status}]. Must be DRAFT or REJECTED.`
      });
    }

    listing.status = 'PENDING_VERIFICATION';
    listing.submittedAt = new Date();
    listing.verificationVersion = (listing.verificationVersion || 1) + 1;
    await listing.save();

    res.status(200).json({
      success: true,
      data: listing,
      message: 'Listing submitted for admin verification.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Reopen rejected listing for correction
 * POST /api/partners/me/listings/:id/reopen
 */
export const reopenRejectedListing = async (req, res) => {
  try {
    const listing = await PartnerListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const isOwner = req.user.role === 'admin' || (listing.ownerUser && listing.ownerUser.equals(req.user._id));
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this listing.' });
    }

    if (listing.status !== 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: `Only REJECTED listings can be reopened to DRAFT. Current status: ${listing.status}`
      });
    }

    listing.status = 'DRAFT';
    await listing.save();

    res.status(200).json({
      success: true,
      data: listing,
      message: 'Listing reopened to DRAFT for editing.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete or safely archive listing
 * DELETE /api/partners/me/listings/:id
 */
export const deleteListing = async (req, res) => {
  try {
    const listing = await PartnerListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const isOwner = req.user.role === 'admin' || (listing.ownerUser && listing.ownerUser.equals(req.user._id));
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this listing.' });
    }

    const hasBookings = await Booking.exists({ partnerListing: listing._id });

    if (hasBookings) {
      listing.isActive = false;
      listing.status = 'SUSPENDED';
      await listing.save();
      return res.status(200).json({
        success: true,
        data: listing,
        message: 'Listing has historical bookings and was safely archived and deactivated.'
      });
    }

    await PartnerListing.findByIdAndDelete(listing._id);
    res.status(200).json({
      success: true,
      message: 'Listing removed successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Dedicated pricing management endpoint
 * PATCH /api/partners/me/listings/:id/pricing
 */
export const updateListingPricing = async (req, res) => {
  try {
    const listing = await PartnerListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const isOwner = req.user.role === 'admin' || (listing.ownerUser && listing.ownerUser.equals(req.user._id));
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this listing.' });
    }

    const finalAmount = req.body.amount || req.body.pricePerDay || req.body.pricingDetails?.pricePerDay;
    const { unit, currency, pricingDetails } = req.body;

    if (!finalAmount || Number(finalAmount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive amount is required.' });
    }

    listing.pricing = {
      amount: Number(finalAmount),
      unit: unit || listing.pricing?.unit || 'day',
      currency: currency || 'INR',
      provenance: 'PARTNER_CLAIMED',
      lastVerifiedAt: null
    };

    if (pricingDetails || req.body.pricePerDay !== undefined || req.body.pricePerHour !== undefined) {
      const existingDetails = listing.pricingDetails ? listing.pricingDetails.toObject() : {};
      listing.pricingDetails = {
        ...existingDetails,
        ...(pricingDetails || {}),
        pricePerDay: Number(finalAmount)
      };
      if (req.body.pricePerHour !== undefined) listing.pricingDetails.pricePerHour = Number(req.body.pricePerHour);
      if (req.body.pricePerWeek !== undefined) listing.pricingDetails.pricePerWeek = Number(req.body.pricePerWeek);
      if (req.body.securityDeposit !== undefined) listing.pricingDetails.securityDeposit = Number(req.body.securityDeposit);
      if (req.body.extraCharges !== undefined) listing.pricingDetails.extraCharges = req.body.extraCharges;
      if (req.body.cancellationPolicy !== undefined) listing.pricingDetails.cancellationPolicy = req.body.cancellationPolicy;
    }

    await listing.save();

    res.status(200).json({
      success: true,
      data: listing,
      message: 'Pricing updated successfully (marked PARTNER_CLAIMED pending admin verification).'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Upload multiple images directly to a partner's own listing
 * POST /api/partners/me/listings/:id/images
 */
export const uploadListingImages = async (req, res) => {
  try {
    const listing = await PartnerListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const isOwner = req.user.role === 'admin' || (listing.ownerUser && listing.ownerUser.equals(req.user._id));
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this listing.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files provided.' });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      let imageUrl = null;
      let publicId = null;

      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: `discovery-uttarakhand/partners/${listing._id}`,
            public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`
          });
          imageUrl = result.secure_url;
          publicId = result.public_id;
          try { fs.unlinkSync(file.path); } catch (e) {}
        } catch (cErr) {
          console.warn('[Cloudinary] Upload failed, falling back to local:', cErr.message);
        }
      }

      if (!imageUrl) {
        const host = req.get('host');
        const protocol = req.protocol;
        imageUrl = `${protocol}://${host}/uploads/${file.filename}`;
        publicId = file.filename;
      }

      uploadedImages.push({
        url: imageUrl,
        publicId,
        source: 'PARTNER_UPLOADED',
        alt: file.originalname || listing.title
      });
    }

    listing.images.push(...uploadedImages);
    await listing.save();

    res.status(200).json({
      success: true,
      data: listing.images,
      message: `${uploadedImages.length} image(s) uploaded to listing successfully.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete an image from a partner's own listing
 * DELETE /api/partners/me/listings/:id/images/:imageId
 */
export const deleteListingImage = async (req, res) => {
  try {
    const listing = await PartnerListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const isOwner = req.user.role === 'admin' || (listing.ownerUser && listing.ownerUser.equals(req.user._id));
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this listing.' });
    }

    const imageIdOrPublicId = req.params.imageId;
    const imageIndex = listing.images.findIndex(img => 
      (img._id && img._id.toString() === imageIdOrPublicId) || 
      (img.publicId && img.publicId === imageIdOrPublicId) ||
      (img.url && img.url.includes(imageIdOrPublicId))
    );

    if (imageIndex === -1) {
      return res.status(404).json({ success: false, message: 'Image not found on this listing.' });
    }

    const [removedImage] = listing.images.splice(imageIndex, 1);

    if (removedImage?.publicId && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        await cloudinary.uploader.destroy(removedImage.publicId);
      } catch (cErr) {
        console.warn('[Cloudinary] Image destroy notice:', cErr.message);
      }
    }

    await listing.save();

    res.status(200).json({
      success: true,
      data: listing.images,
      message: 'Image removed from listing successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
