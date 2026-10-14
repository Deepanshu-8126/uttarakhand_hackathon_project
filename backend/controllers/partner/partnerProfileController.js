import Partner from '../../models/Partner.js';
import User from '../../models/User.js';
import { resolveLocationAndDestination, resolvePartnerForUser } from './partnerHelpers.js';

/**
 * Register as a Partner / Create Partner Profile
 * POST /api/partners
 */
export const registerPartner = async (req, res) => {
  try {
    const userId = req.user._id;

    // Security Check: Block any client role injection attempt
    if (req.body.role) {
      if (req.body.role === 'admin' || req.body.role === 'owner') {
        return res.status(403).json({
          success: false,
          message: 'Privilege escalation rejected: Cannot assign administrative roles.'
        });
      }
    }

    // Check if partner profile already exists for this user
    const existing = await Partner.findOne({ user: userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Partner profile already exists for this user.'
      });
    }

    const {
      businessName,
      legalBusinessName,
      partnerType,
      phone,
      email,
      district,
      city,
      locality,
      address,
      location,
      latitude,
      longitude,
      description,
      credentialType,
      credentialReference
    } = req.body;

    if (!businessName || !partnerType || !phone || !email || !district) {
      return res.status(400).json({
        success: false,
        message: 'businessName, partnerType, phone, email, and district are mandatory.'
      });
    }

    const resolved = await resolveLocationAndDestination({
      district,
      city,
      locality,
      location,
      latitude,
      longitude
    });

    // Create partner record
    const partner = await Partner.create({
      user: userId,
      businessName,
      legalBusinessName,
      partnerType,
      phone,
      email,
      district,
      city: city || null,
      locality: locality || null,
      address,
      location: resolved.location,
      description,
      credentialType,
      credentialReference,
      status: 'APPROVED',
      verificationStatus: 'DRAFT'
    });

    // Server-controlled role assignment: Elevate user to 'partner' (preserve 'admin' role if admin)
    if (req.user.role !== 'admin') {
      await User.findByIdAndUpdate(userId, { role: 'partner' });
    }

    res.status(201).json({
      success: true,
      data: partner,
      message: 'Partner profile registered successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get current partner's profile
 * GET /api/partners/me
 */
export const getMyPartnerProfile = async (req, res) => {
  try {
    const partner = await resolvePartnerForUser(req.user);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner profile not found.' });
    }
    res.status(200).json({ success: true, data: partner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update partner's business profile
 * PATCH /api/partners/me
 */
export const updateMyPartnerProfile = async (req, res) => {
  try {
    const partner = await resolvePartnerForUser(req.user);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner profile not found.' });
    }

    const allowedUpdates = [
      'businessName', 'legalBusinessName', 'displayName', 'contactPerson',
      'phone', 'alternatePhone', 'email',
      'district', 'city', 'locality', 'address', 'state', 'pincode',
      'description', 'credentialType', 'credentialReference',
      'operatingAreas', 'serviceCategories', 'languages', 'socialLinks',
      'operatingHours', 'pickupInformation'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        partner[field] = req.body[field];
      }
    });

    if (req.body.location || req.body.latitude || req.body.longitude) {
      const resolved = await resolveLocationAndDestination({
        district: partner.district,
        city: partner.city,
        locality: partner.locality,
        location: req.body.location,
        latitude: req.body.latitude,
        longitude: req.body.longitude
      });
      if (resolved.location) {
        partner.location = resolved.location;
      }
    }

    await partner.save();
    res.status(200).json({ success: true, data: partner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
