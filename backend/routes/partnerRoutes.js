/**
 * Discovery Uttarakhand — Partner API Routes
 * Mounts endpoints for partner onboarding, profiles, listing drafts,
 * verification submissions, availability, bookings, earnings, expenses, and analytics.
 */

import express from 'express';
import fs from 'fs';
import { protect, partnerOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import cloudinary from '../config/cloudinary.js';
import {
  registerPartner,
  getMyPartnerProfile,
  updateMyPartnerProfile,
  createListingDraft,
  getMyListings,
  getMyListingById,
  updateListing,
  deleteListing,
  updateListingPricing,
  submitListingForVerification,
  reopenRejectedListing,
  getPartnerDashboard,
  getPartnerBookings,
  updatePartnerBookingStatus,
  getPartnerAvailability,
  updatePartnerAvailability,
  getPartnerEarnings,
  getPartnerExpenses,
  createPartnerExpense,
  deletePartnerExpense,
  getPartnerAnalytics,
  getPartnerReviews,
  replyToReview,
  uploadListingImages,
  deleteListingImage,
  getPartnerSettlements,
  getPartnerDocuments,
  uploadPartnerDocument,
  deletePartnerDocument,
  getPartnerActionItems
} from '../controllers/partnerController.js';

const router = express.Router();

// ── 1. Onboarding & Profile ─────────────────────────────────────────
router.post('/', protect, registerPartner);
router.get('/me', protect, partnerOnly, getMyPartnerProfile);
router.patch('/me', protect, partnerOnly, updateMyPartnerProfile);
router.get('/profile', protect, partnerOnly, getMyPartnerProfile);
router.patch('/profile', protect, partnerOnly, updateMyPartnerProfile);

// ── 2. Dashboard Overview ───────────────────────────────────────────
router.get('/dashboard', protect, partnerOnly, getPartnerDashboard);
router.get('/me/dashboard', protect, partnerOnly, getPartnerDashboard);

// ── 3. Listings Operations ──────────────────────────────────────────
router.post('/me/listings', protect, partnerOnly, createListingDraft);
router.post('/listings', protect, partnerOnly, createListingDraft);
router.get('/me/listings', protect, partnerOnly, getMyListings);
router.get('/listings', protect, partnerOnly, getMyListings);
router.get('/me/listings/:id', protect, partnerOnly, getMyListingById);
router.get('/listings/:id', protect, partnerOnly, getMyListingById);
router.patch('/me/listings/:id', protect, partnerOnly, updateListing);
router.patch('/listings/:id', protect, partnerOnly, updateListing);
router.put('/me/listings/:id', protect, partnerOnly, updateListing);
router.put('/listings/:id', protect, partnerOnly, updateListing);
router.delete('/me/listings/:id', protect, partnerOnly, deleteListing);
router.delete('/listings/:id', protect, partnerOnly, deleteListing);

// Dedicated pricing (strictly PARTNER_CLAIMED)
router.patch('/me/listings/:id/pricing', protect, partnerOnly, updateListingPricing);
router.patch('/listings/:id/pricing', protect, partnerOnly, updateListingPricing);
router.put('/me/listings/:id/pricing', protect, partnerOnly, updateListingPricing);
router.put('/listings/:id/pricing', protect, partnerOnly, updateListingPricing);

// Verification submissions
router.post('/me/listings/:id/submit', protect, partnerOnly, submitListingForVerification);
router.post('/listings/:id/submit', protect, partnerOnly, submitListingForVerification);
router.post('/me/listings/:id/reopen', protect, partnerOnly, reopenRejectedListing);
router.post('/listings/:id/reopen', protect, partnerOnly, reopenRejectedListing);

// Listing-specific Image Management (Strict Server Ownership)
router.post('/me/listings/:id/images', protect, partnerOnly, upload.array('images', 10), uploadListingImages);
router.post('/listings/:id/images', protect, partnerOnly, upload.array('images', 10), uploadListingImages);
router.delete('/me/listings/:id/images/:imageId', protect, partnerOnly, deleteListingImage);
router.delete('/listings/:id/images/:imageId', protect, partnerOnly, deleteListingImage);

// ── 4. Bookings ─────────────────────────────────────────────────────
router.get('/me/bookings', protect, partnerOnly, getPartnerBookings);
router.get('/bookings', protect, partnerOnly, getPartnerBookings);
router.patch('/me/bookings/:id/status', protect, partnerOnly, updatePartnerBookingStatus);
router.patch('/bookings/:id/status', protect, partnerOnly, updatePartnerBookingStatus);
router.put('/me/bookings/:id/status', protect, partnerOnly, updatePartnerBookingStatus);
router.put('/bookings/:id/status', protect, partnerOnly, updatePartnerBookingStatus);

// ── 5. Availability ─────────────────────────────────────────────────
router.get('/me/availability', protect, partnerOnly, getPartnerAvailability);
router.get('/availability', protect, partnerOnly, getPartnerAvailability);
router.patch('/me/availability/:id', protect, partnerOnly, updatePartnerAvailability);
router.patch('/availability/:id', protect, partnerOnly, updatePartnerAvailability);
router.put('/me/availability/:id', protect, partnerOnly, updatePartnerAvailability);
router.put('/availability/:id', protect, partnerOnly, updatePartnerAvailability);
router.patch('/me/listings/:id/availability', protect, partnerOnly, updatePartnerAvailability);
router.patch('/listings/:id/availability', protect, partnerOnly, updatePartnerAvailability);
router.put('/me/listings/:id/availability', protect, partnerOnly, updatePartnerAvailability);
router.put('/listings/:id/availability', protect, partnerOnly, updatePartnerAvailability);

// ── 6. Financials & P&L ─────────────────────────────────────────────
router.get('/me/earnings', protect, partnerOnly, getPartnerEarnings);
router.get('/earnings', protect, partnerOnly, getPartnerEarnings);

router.get('/me/expenses', protect, partnerOnly, getPartnerExpenses);
router.get('/expenses', protect, partnerOnly, getPartnerExpenses);
router.post('/me/expenses', protect, partnerOnly, createPartnerExpense);
router.post('/expenses', protect, partnerOnly, createPartnerExpense);
router.delete('/me/expenses/:id', protect, partnerOnly, deletePartnerExpense);
router.delete('/expenses/:id', protect, partnerOnly, deletePartnerExpense);

// ── 7. Analytics & Reviews ──────────────────────────────────────────
router.get('/me/analytics', protect, partnerOnly, getPartnerAnalytics);
router.get('/analytics', protect, partnerOnly, getPartnerAnalytics);

router.get('/me/reviews', protect, partnerOnly, getPartnerReviews);
router.get('/reviews', protect, partnerOnly, getPartnerReviews);
router.post('/me/reviews/:id/reply', protect, partnerOnly, replyToReview);
router.post('/reviews/:id/reply', protect, partnerOnly, replyToReview);

// ── 8. Image Upload (Cloudinary Multi-Photo with Partner Provenance) ──

// ── 8a. Settlements ─────────────────────────────────────────────────
router.get('/me/settlements', protect, partnerOnly, getPartnerSettlements);
router.get('/settlements', protect, partnerOnly, getPartnerSettlements);

// ── 8b. Documents ───────────────────────────────────────────────────
router.get('/me/documents', protect, partnerOnly, getPartnerDocuments);
router.get('/documents', protect, partnerOnly, getPartnerDocuments);
router.post('/me/documents', protect, partnerOnly, upload.array('documents', 5), uploadPartnerDocument);
router.post('/documents', protect, partnerOnly, upload.array('documents', 5), uploadPartnerDocument);
router.delete('/me/documents/:id', protect, partnerOnly, deletePartnerDocument);
router.delete('/documents/:id', protect, partnerOnly, deletePartnerDocument);

// ── 8c. Action Items ────────────────────────────────────────────────
router.get('/me/action-items', protect, partnerOnly, getPartnerActionItems);
router.get('/action-items', protect, partnerOnly, getPartnerActionItems);

// ── 9. Image Upload (Cloudinary Multi-Photo with Partner Provenance) ──
const handlePartnerUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files uploaded.' });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      let imageUrl = null;
      let publicId = null;

      // 1. Cloudinary Direct Upload
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: `discovery-uttarakhand/partners/${req.user?._id || 'general'}`,
            public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`
          });
          imageUrl = result.secure_url;
          publicId = result.public_id;
          try { fs.unlinkSync(file.path); } catch (_) {}
        } catch (cErr) {
          console.warn('[Cloudinary] Upload failed, falling back to local:', cErr.message);
        }
      }

      // 2. Local Fallback with canonical public URL
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
        alt: file.originalname || 'Partner Property Photo'
      });
    }

    res.status(200).json({
      success: true,
      data: uploadedImages,
      urls: uploadedImages.map(img => img.url),
      message: `${uploadedImages.length} image(s) uploaded successfully.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.post('/me/upload', protect, partnerOnly, upload.array('images', 10), handlePartnerUpload);
router.post('/upload', protect, partnerOnly, upload.array('images', 10), handlePartnerUpload);

export default router;

