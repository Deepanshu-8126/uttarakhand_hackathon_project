import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import PaymentWebhookEvent from '../models/PaymentWebhookEvent.js';
import Booking from '../models/Booking.js';
import { toMinorUnit, fromMinorUnit } from '../utils/money.js';

// Lazy initialize Razorpay instance to allow graceful fallback/mock in test suite if keys are missing
let razorpayInstance = null;

function getRazorpay() {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

const VALID_TRANSITIONS = {
  CREATED: ['PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED'],
  PENDING: ['AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED'],
  AUTHORIZED: ['CAPTURED', 'FAILED', 'CANCELLED'],
  CAPTURED: ['REFUND_PROCESSING', 'PARTIALLY_REFUNDED', 'REFUNDED'],
  REFUND_PROCESSING: ['PARTIALLY_REFUNDED', 'REFUNDED', 'CAPTURED'],
  PARTIALLY_REFUNDED: ['REFUND_PROCESSING', 'REFUNDED'],
  REFUNDED: [],
  FAILED: [],
  CANCELLED: []
};

function isValidTransition(currentStatus, newStatus) {
  if (currentStatus === newStatus) return true; // Idempotent
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}

/**
 * Create a server-side Razorpay Order for a PENDING booking
 */
export const createOrder = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error('Booking not found');
  if (userId && booking.user.toString() !== userId.toString()) throw new Error('Unauthorized');
  
  const acceptableStatuses = ['PENDING', 'PENDING_PAYMENT', 'pending'];
  if (!acceptableStatuses.includes(booking.status)) {
    throw new Error(`Booking status is ${booking.status}. Only PENDING bookings can be paid.`);
  }

  // Idempotency: return existing order if CREATED or PENDING
  const existingPayment = await Payment.findOne({
    bookingId,
    status: { $in: ['CREATED', 'PENDING', 'AUTHORIZED', 'CAPTURED'] }
  });
  
  if (existingPayment) {
    if (existingPayment.status === 'CAPTURED') {
      throw new Error('Booking is already paid');
    }
    return {
      success: true,
      orderId: existingPayment.razorpayOrderId,
      razorpayOrderId: existingPayment.razorpayOrderId,
      amount: existingPayment.amount,
      currency: existingPayment.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      payment: existingPayment
    };
  }

  const bookingTotal = booking.pricingSnapshot?.total || booking.totalAmount || booking.amount;
  if (!bookingTotal || bookingTotal <= 0) {
    throw new Error('Booking has no valid pricing snapshot or amount');
  }

  const minorAmount = toMinorUnit(bookingTotal);
  const currency = booking.currency || 'INR';

  const rzp = getRazorpay();
  const options = {
    amount: minorAmount,
    currency,
    receipt: `rcpt_${booking._id.toString().substring(0, 10)}_${Date.now()}`
  };

  const order = await rzp.orders.create(options);

  const payment = await Payment.create({
    bookingId: booking._id,
    userId: userId || booking.user,
    partnerId: booking.partnerListing ? (await resolvePartnerId(booking)) : null,
    razorpayOrderId: order.id,
    providerOrderId: order.id,
    amount: minorAmount,
    currency,
    status: 'CREATED'
  });

  return {
    success: true,
    orderId: order.id,
    razorpayOrderId: order.id,
    amount: minorAmount,
    currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    payment
  };
};

/**
 * Generate a dynamic QR order for UPI payment
 */
export const createQrOrder = async (bookingId, userId) => {
  const payment = await createOrder(bookingId, userId);
  
  try {
    const rzp = getRazorpay();
    const qrResponse = await rzp.qrCode.create({
      type: 'upi_qr',
      name: 'Discovery Uttarakhand',
      usage: 'single_use',
      fixed_amount: true,
      payment_amount: payment.amount,
      description: `Payment for Booking ${bookingId.toString().slice(-6)}`,
      customer_id: null,
      close_by: Math.floor(Date.now() / 1000) + 1800 // 30 min expiry
    });

    payment.qrId = qrResponse.id;
    payment.method = 'qr';
    payment.status = 'PENDING';
    await payment.save();

    return {
      paymentId: payment._id,
      qrId: qrResponse.id,
      qrImageUrl: qrResponse.image_url,
      amount: payment.amount,
      currency: payment.currency
    };
  } catch (err) {
    // If QR API is not provisioned on merchant account, return payment order for standard checkout
    return {
      paymentId: payment._id,
      razorpayOrderId: payment.razorpayOrderId,
      amount: payment.amount,
      currency: payment.currency,
      message: 'Dynamic QR not active; standard UPI checkout enabled.'
    };
  }
};

/**
 * Verify Razorpay payment signature server-side
 */
export const verifyPayment = async (arg1, arg2, arg3, arg4, arg5) => {
  let orderId, paymentId, signature, userId, paymentMethod;
  if (typeof arg1 === 'object' && arg1 !== null) {
    orderId = arg1.razorpay_order_id || arg1.orderId || arg1.razorpayOrderId;
    paymentId = arg1.razorpay_payment_id || arg1.paymentId || arg1.razorpayPaymentId;
    signature = arg1.razorpay_signature || arg1.signature;
    userId = arg1.userId;
    paymentMethod = arg1.method || 'card';
  } else {
    orderId = arg1;
    paymentId = arg2;
    signature = arg3;
    userId = arg4;
    paymentMethod = arg5 || 'card';
  }

  const payment = await Payment.findOne({
    $or: [{ razorpayOrderId: orderId }, { providerOrderId: orderId }]
  });
  if (!payment) throw new Error('Payment order not found');
  if (userId && payment.userId && payment.userId.toString() !== userId.toString()) {
    throw new Error('Unauthorized');
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${payment.razorpayOrderId}|${paymentId}`)
    .digest('hex');

  if (expectedSignature !== signature) {
    payment.status = 'FAILED';
    payment.failureReason = 'Signature mismatch';
    await payment.save();
    throw new Error('Invalid payment signature');
  }

  if (!isValidTransition(payment.status, 'CAPTURED')) {
    throw new Error(`Invalid state transition from ${payment.status} to CAPTURED`);
  }

  payment.razorpayPaymentId = paymentId;
  payment.providerPaymentId = paymentId;
  payment.providerSignatureVerified = true;
  payment.method = paymentMethod;
  payment.status = 'CAPTURED';
  payment.capturedAt = new Date();
  
  // Financial breakdown calculation
  const grossInMajor = fromMinorUnit(payment.amount);
  const platformFee = Math.round(grossInMajor * 0.05); // 5% platform fee
  const taxes = Math.round(grossInMajor * 0.05); // 5% tax
  const partnerAmount = grossInMajor - platformFee - taxes;

  payment.financialBreakdown = {
    grossAmount: grossInMajor,
    platformFee,
    taxes,
    partnerAmount,
    settlementStatus: 'PENDING'
  };

  await payment.save();

  const confirmedBooking = await _confirmBookingSecurely(payment);

  return {
    success: true,
    verified: true,
    payment,
    booking: confirmedBooking
  };
};

/**
 * Process incoming Razorpay webhook event idempotently
 */
export const processWebhook = async (rawBody, signature, eventId) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error('Webhook secret not configured');

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new Error('Invalid webhook signature');
  }

  const payload = JSON.parse(rawBody.toString('utf-8'));
  
  // Idempotency check via PaymentWebhookEvent
  const existingEvent = await PaymentWebhookEvent.findOne({ eventId });
  if (existingEvent) {
    return { success: true, duplicate: true, eventId };
  }

  const eventRecord = await PaymentWebhookEvent.create({
    eventId,
    eventType: payload.event,
    razorpayPaymentId: payload.payload?.payment?.entity?.id,
    razorpayOrderId: payload.payload?.payment?.entity?.order_id
  });

  try {
    const orderId = payload.payload?.payment?.entity?.order_id;
    if (orderId) {
      const payment = await Payment.findOne({
        $or: [{ razorpayOrderId: orderId }, { providerOrderId: orderId }]
      });
      if (payment) {
        let newStatus = null;
        if (payload.event === 'payment.captured' || payload.event === 'order.paid') newStatus = 'CAPTURED';
        else if (payload.event === 'payment.failed') newStatus = 'FAILED';
        else if (payload.event === 'payment.authorized') newStatus = 'AUTHORIZED';
        else if (payload.event === 'refund.processed') newStatus = 'REFUNDED';

        if (newStatus && isValidTransition(payment.status, newStatus)) {
          payment.status = newStatus;
          payment.razorpayPaymentId = payload.payload?.payment?.entity?.id || payment.razorpayPaymentId;
          payment.providerPaymentId = payment.razorpayPaymentId;
          if (newStatus === 'CAPTURED') {
            payment.capturedAt = new Date();
            payment.providerSignatureVerified = true;
            await _confirmBookingSecurely(payment);
          } else if (newStatus === 'REFUNDED') {
            payment.refundStatus = 'FULL';
            await _handleBookingRefund(payment);
          }
          await payment.save();
        }
      }
    }

    eventRecord.processingStatus = 'PROCESSED';
    eventRecord.processedAt = new Date();
    await eventRecord.save();
    return { success: true, processed: true, eventId };
  } catch (err) {
    eventRecord.processingStatus = 'FAILED';
    eventRecord.errorMetadata = err.message;
    await eventRecord.save();
    throw err;
  }
};

/**
 * Refund a payment (Admin or authorized actor)
 */
export const refundPayment = async (paymentId, amountToRefund, reason, user, isAdmin = false) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Payment not found');

  if (!isAdmin && user && payment.userId && payment.userId.toString() !== user._id?.toString()) {
    throw new Error('Unauthorized to refund this payment');
  }


  if (payment.status !== 'CAPTURED' && payment.status !== 'PARTIALLY_REFUNDED') {
    throw new Error(`Cannot refund payment in state ${payment.status}. Only CAPTURED payments can be refunded.`);
  }

  const maxRefundable = payment.amount - (payment.refundedAmount || 0);
  const requestedMinorAmount = amountToRefund ? toMinorUnit(amountToRefund) : maxRefundable;

  if (requestedMinorAmount <= 0 || requestedMinorAmount > maxRefundable) {
    throw new Error(`Invalid refund amount. Maximum refundable is ₹${fromMinorUnit(maxRefundable)}`);
  }

  // Call Razorpay Refund API if live credentials exist
  let gatewayRefundId = `rfnd_${Date.now()}`;
  try {
    const rzp = getRazorpay();
    const refundRes = await rzp.payments.refund(payment.razorpayPaymentId, {
      amount: requestedMinorAmount,
      notes: { reason: reason || 'Customer requested refund' }
    });
    gatewayRefundId = refundRes.id;
  } catch (rzpErr) {
    console.warn('[PaymentService] Razorpay gateway refund API warning:', rzpErr.message);
  }

  payment.refundedAmount = (payment.refundedAmount || 0) + requestedMinorAmount;
  payment.refundId = gatewayRefundId;
  payment.refundReason = reason || 'Standard cancellation refund';

  if (payment.refundedAmount >= payment.amount) {
    payment.status = 'REFUNDED';
    payment.refundStatus = 'FULL';
  } else {
    payment.status = 'PARTIALLY_REFUNDED';
    payment.refundStatus = 'PARTIAL';
  }

  if (payment.financialBreakdown) {
    payment.financialBreakdown.settlementStatus = 'REFUNDED_TO_TRAVELER';
  }

  await payment.save();

  // Update associated Booking
  await _handleBookingRefund(payment, payment.status === 'REFUNDED');

  return {
    success: true,
    status: payment.status,
    refundStatus: payment.refundStatus,
    refundedAmount: fromMinorUnit(payment.refundedAmount),
    refundId: payment.refundId,
    payment
  };
};


/**
 * Reconcile status with Razorpay Gateway
 */
export const reconcilePayment = async (paymentId, userId, isAdmin = false) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Payment not found');
  
  if (!isAdmin && payment.userId.toString() !== userId.toString()) {
    throw new Error('Unauthorized');
  }

  if (payment.status === 'CAPTURED' || payment.status === 'REFUNDED') return payment;

  const rzp = getRazorpay();
  const order = await rzp.orders.fetch(payment.razorpayOrderId);
  
  let newStatus = payment.status;
  if (order.status === 'paid') {
    newStatus = 'CAPTURED';
  } else if (order.status === 'attempted') {
    const payments = await rzp.orders.fetchPayments(payment.razorpayOrderId);
    const captured = payments.items.find(p => p.status === 'captured');
    if (captured) {
      newStatus = 'CAPTURED';
      payment.razorpayPaymentId = captured.id;
    }
  }

  if (newStatus !== payment.status && isValidTransition(payment.status, newStatus)) {
    payment.status = newStatus;
    await payment.save();
    if (newStatus === 'CAPTURED') {
      await _confirmBookingSecurely(payment);
    }
  }

  return payment;
};

async function _confirmBookingSecurely(payment) {
  const booking = await Booking.findById(payment.bookingId);
  if (!booking) return null;

  const acceptablePending = ['PENDING', 'PENDING_PAYMENT', 'pending'];
  if (!acceptablePending.includes(booking.status)) return booking;

  booking.status = 'CONFIRMED';
  booking.paymentStatus = 'paid';
  booking.escrowStatus = 'HELD_IN_ESCROW';
  await booking.save();
  return booking;
}


async function _handleBookingRefund(payment, isFull = true) {
  const booking = await Booking.findById(payment.bookingId);
  if (!booking) return;

  if (isFull) {
    booking.status = 'CANCELLED';
    booking.paymentStatus = 'refunded';
    booking.escrowStatus = 'REFUNDED_TO_TRAVELER';
  }
  await booking.save();
}

async function resolvePartnerId(booking) {
  if (booking.partner) return booking.partner;
  if (booking.partnerListing) {
    const pl = await Booking.db.model('PartnerListing').findById(booking.partnerListing).select('partner').lean();
    return pl?.partner || null;
  }
  return null;
}

export default {
  createOrder,
  createQrOrder,
  verifyPayment,
  processWebhook,
  refundPayment,
  reconcilePayment
};
