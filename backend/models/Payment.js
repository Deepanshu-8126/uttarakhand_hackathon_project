import mongoose from 'mongoose';

const financialBreakdownSchema = new mongoose.Schema({
  grossAmount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  taxes: { type: Number, default: 0 },
  partnerAmount: { type: Number, required: true },
  settlementStatus: { 
    type: String, 
    enum: ['PENDING_ESCROW_RELEASE', 'SETTLED_TO_PARTNER', 'REFUNDED_TO_TRAVELER', 'DISPUTED', 'PENDING'],
    default: 'PENDING'
  },
  settlementReference: { type: String, default: null }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', default: null },
  razorpayOrderId: { type: String, unique: true, required: true },
  providerOrderId: { type: String },
  razorpayPaymentId: { type: String, sparse: true, unique: true },
  providerPaymentId: { type: String },
  providerSignatureVerified: { type: Boolean, default: false },
  amount: { type: Number, required: true }, // in minor units (paise)

  currency: { type: String, default: 'INR' },
  method: { type: String, default: 'card' }, // upi, card, netbanking, wallet, qr
  status: { 
    type: String, 
    enum: [
      'CREATED', 
      'PENDING', 
      'AUTHORIZED', 
      'CAPTURED', 
      'FAILED', 
      'CANCELLED',
      'REFUND_PROCESSING',
      'PARTIALLY_REFUNDED', 
      'REFUNDED'
    ],
    default: 'CREATED'
  },
  failureCode: { type: String, default: null },
  failureReason: { type: String, default: null },
  qrId: { type: String, default: null },
  capturedAt: { type: Date, default: null },
  refundedAmount: { type: Number, default: 0 },
  refundStatus: { type: String, enum: ['NONE', 'PARTIAL', 'FULL'], default: 'NONE' },
  refundId: { type: String, default: null },
  refundReason: { type: String, default: null },
  financialBreakdown: financialBreakdownSchema,
  idempotencyKey: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

paymentSchema.index({ bookingId: 1, userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ partnerId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
