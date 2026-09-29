/**
 * Discovery Uttarakhand — Partner Document Model
 * Secure document management for partner verification documents.
 * Documents are private by default and require authenticated access.
 * 
 * WHY: Documents need separate lifecycle (upload, verify, expire, reject, re-upload)
 * FIELDS: See schema below
 * INDEXES: partner+documentType, ownerUser, status, expiryDate
 * OWNERSHIP: ownerUser + partner reference
 * SECURITY: Private storage, admin-only verification, ownership checks
 * LIFECYCLE: PENDING → VERIFIED/REJECTED, automatic EXPIRED detection
 */

import mongoose from 'mongoose';

const partnerDocumentSchema = new mongoose.Schema({
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  ownerUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    required: true,
    enum: [
      'identity_proof',
      'business_registration',
      'tourism_registration',
      'vehicle_registration',
      'driving_license',
      'permit',
      'insurance',
      'ownership_proof',
      'gst_document',
      'address_proof',
      'other'
    ]
  },
  documentName: {
    type: String,
    trim: true,
    maxlength: 200,
    default: null
  },
  fileName: {
    type: String,
    trim: true,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    default: null
  },
  mimeType: {
    type: String,
    trim: true,
    default: null
  },
  fileSizeBytes: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'],
    default: 'PENDING'
  },
  expiryDate: {
    type: Date,
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectedReason: {
    type: String,
    trim: true,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  version: {
    type: Number,
    default: 1
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
    default: null
  }
}, {
  timestamps: true
});

partnerDocumentSchema.index({ partner: 1, documentType: 1 });
partnerDocumentSchema.index({ ownerUser: 1 });
partnerDocumentSchema.index({ status: 1 });
partnerDocumentSchema.index({ expiryDate: 1 }, { sparse: true });

const PartnerDocument = mongoose.model('PartnerDocument', partnerDocumentSchema);
export default PartnerDocument;
