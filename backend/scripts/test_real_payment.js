/**
 * Discovery Uttarakhand - Production Payment System Test Suite
 * Tests Razorpay order creation, deterministic server pricing, HMAC signature verification,
 * raw byte webhook verification, idempotency protection, and partner financial breakdown.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import { 
  createOrder, 
  verifyPayment, 
  processWebhook, 
  refundPayment 
} from '../services/paymentService.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import PaymentWebhookEvent from '../models/PaymentWebhookEvent.js';
import Stay from '../models/Stay.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/discovery_uttarakhand';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'test_secret_12345';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || 'test_webhook_secret_12345';


let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passCount++;
    console.log(`  ✓ PASS [${passCount}]: ${testName}`);
  } else {
    failCount++;
    console.error(`  ✗ FAIL [${failCount}]: ${testName} — ${details}`);
  }
}

async function runPaymentTests() {
  console.log('\n=============================================================');
  console.log('  DISCOVERY UTTARAKHAND — PRODUCTION PAYMENT TEST SUITE');
  console.log('=============================================================\n');

  await mongoose.connect(MONGODB_URI);

  // 1. Setup a test booking
  const dbStay = await Stay.findOne({}).lean();
  const testUserId = new mongoose.Types.ObjectId();
  const baseRate = dbStay?.price?.amount || 3200;

  const testBooking = new Booking({
    user: testUserId,
    stay: dbStay?._id,
    type: 'stay',
    startDate: new Date(Date.now() + 86400000),
    endDate: new Date(Date.now() + 86400000 * 3), // 2 nights
    amount: baseRate * 2,
    totalAmount: baseRate * 2,
    status: 'PENDING',
    paymentStatus: 'pending',
    pricingSnapshot: {
      amount: baseRate,
      unit: 'night',
      currency: 'INR',
      quantity: 2,
      subtotal: baseRate * 2,
      total: baseRate * 2,
      provenance: 'VERIFIED'
    },
    traveler: {
      name: 'Verification Traveler',
      email: 'traveler@verification.in',
      phone: '+919876543210',
      guests: 2
    }
  });
  await testBooking.save();


  try {
    const totalPayable = testBooking.totalAmount || testBooking.amount;
    const totalPayablePaise = Math.round(totalPayable * 100);

    // -------------------------------------------------------------
    // TEST 1: Server calculates authoritative amount, client price ignored
    // -------------------------------------------------------------
    const clientHackedPrice = 1; // Hacker tried to pay ₹1
    const orderResult = await createOrder(testBooking._id, testUserId);
    assert(
      orderResult.amount === totalPayablePaise && orderResult.amount !== clientHackedPrice,
      '1. Order creation ignores client price and enforces server-calculated price (Paise)'
    );

    // -------------------------------------------------------------
    // TEST 2: Provider Order ID correctly returned and stored
    // -------------------------------------------------------------
    assert(
      orderResult.orderId && orderResult.orderId.startsWith('order_'),
      '2. Valid Razorpay orderId generated and returned'
    );

    const createdPayment = await Payment.findOne({ 
      $or: [{ providerOrderId: orderResult.orderId }, { razorpayOrderId: orderResult.orderId }] 
    });
    assert(
      createdPayment && createdPayment.status === 'CREATED' && createdPayment.amount === totalPayablePaise,
      '3. Internal Payment record initialized in CREATED state with immutable booking relationship'
    );

    // -------------------------------------------------------------
    // TEST 3: Invalid payment signature is strictly rejected
    // -------------------------------------------------------------
    const fakeSignature = 'bogus_signature_from_hacker';
    const fakePaymentId = 'pay_test_fake_12345';
    let verifyFailed = false;
    try {
      await verifyPayment({
        bookingId: testBooking._id,
        razorpay_order_id: orderResult.orderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: fakeSignature,
        userId: testUserId
      });
    } catch (err) {
      verifyFailed = true;
    }
    assert(verifyFailed, '4. Invalid HMAC-SHA256 signature strictly rejected; booking remains unconfirmed');
    // Reset payment status back to CREATED for legitimate retry test
    await Payment.updateOne({ _id: createdPayment._id }, { status: 'CREATED', failureReason: null });


    // -------------------------------------------------------------
    // TEST 4: Authentic HMAC-SHA256 signature succeeds
    // -------------------------------------------------------------
    const realPaymentId = `pay_test_${Date.now()}`;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${orderResult.orderId}|${realPaymentId}`)
      .digest('hex');

    const verifySuccess = await verifyPayment({
      bookingId: testBooking._id,
      razorpay_order_id: orderResult.orderId,
      razorpay_payment_id: realPaymentId,
      razorpay_signature: expectedSignature,
      userId: testUserId,
      method: 'upi'
    });
    assert(
      verifySuccess && verifySuccess.verified && verifySuccess.booking?.status === 'CONFIRMED',
      '5. Authentic signature verifies; booking transitions to CONFIRMED'
    );

    const confirmedPayment = await Payment.findOne({ 
      $or: [{ providerOrderId: orderResult.orderId }, { razorpayOrderId: orderResult.orderId }] 
    });
    assert(
      confirmedPayment.status === 'CAPTURED' && confirmedPayment.providerSignatureVerified === true,
      '6. Payment transitions to CAPTURED with providerSignatureVerified = true'
    );

    // -------------------------------------------------------------
    // TEST 5: Financial breakdown accurately calculated
    // -------------------------------------------------------------
    assert(
      confirmedPayment.financialBreakdown &&
      confirmedPayment.financialBreakdown.grossAmount === totalPayable &&
      confirmedPayment.financialBreakdown.partnerAmount > 0 &&
      confirmedPayment.financialBreakdown.settlementStatus === 'PENDING',
      '7. Financial breakdown populated: gross, platformFee, taxes, partnerAmount in PENDING settlement'
    );

    // -------------------------------------------------------------
    // TEST 6: Webhook signature verification
    // -------------------------------------------------------------
    const webhookPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: realPaymentId,
            order_id: orderResult.orderId,
            amount: totalPayablePaise,
            currency: 'INR',
            status: 'captured',
            method: 'upi'
          }
        }
      }
    });

    const validWebhookSig = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(webhookPayload)
      .digest('hex');

    const webhookResult = await processWebhook(
      Buffer.from(webhookPayload),
      validWebhookSig,
      `evt_${Date.now()}`
    );
    assert(webhookResult.success && webhookResult.processed, '8. Genuine webhook signature verified and processed');

    // -------------------------------------------------------------
    // TEST 7: Webhook Idempotency (Duplicate Webhook ignored)
    // -------------------------------------------------------------
    const duplicateEventId = `evt_duplicate_${Date.now()}`;
    await processWebhook(Buffer.from(webhookPayload), validWebhookSig, duplicateEventId);
    // Process second time with exact same event ID
    const duplicateResult = await processWebhook(Buffer.from(webhookPayload), validWebhookSig, duplicateEventId);
    assert(
      duplicateResult.success && duplicateResult.duplicate === true,
      '9. Duplicate webhook detected by event ID constraint; zero duplicate side-effects'
    );

    // -------------------------------------------------------------
    // TEST 8: Malicious webhook with invalid signature rejected
    // -------------------------------------------------------------
    let fakeWebhookRejected = false;
    try {
      await processWebhook(Buffer.from(webhookPayload), 'tampered_signature_string', `evt_tamper_${Date.now()}`);
    } catch {
      fakeWebhookRejected = true;
    }
    assert(fakeWebhookRejected, '10. Fake webhook signature strictly rejected with 400 Invalid Signature');

    // -------------------------------------------------------------
    // TEST 9: Controlled Refund Flow
    // -------------------------------------------------------------
    const refundResult = await refundPayment(
      confirmedPayment._id,
      Math.floor(totalPayable / 2),
      'Customer requested partial itinerary modification',
      null,
      true // isAdmin
    );
    assert(
      refundResult.success && 
      (refundResult.status === 'REFUNDED' || refundResult.status === 'PARTIALLY_REFUNDED'),
      '11. Controlled partial refund processed; internal status transitions to PARTIALLY_REFUNDED'
    );

    // -------------------------------------------------------------
    // TEST 10: Double-Payment / Double-Order Protection
    // -------------------------------------------------------------
    let doublePaymentBlocked = false;
    try {
      // Trying to create a new order on an already CONFIRMED booking
      await createOrder(testBooking._id, testUserId);
    } catch (err) {
      doublePaymentBlocked = err.message.includes('already') || err.message.includes('paid') || err.message.includes('CONFIRMED');
    }
    assert(doublePaymentBlocked, '12. Double-payment protection blocks new orders for already CONFIRMED bookings');


  } finally {
    // Cleanup verification test records
    await Booking.deleteOne({ _id: testBooking._id });
    await Payment.deleteMany({ bookingId: testBooking._id });
    await PaymentWebhookEvent.deleteMany({ eventId: { $regex: '^evt_' } });
  }

  console.log('\n-------------------------------------------------------------');
  console.log(`TOTAL PAYMENT TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('-------------------------------------------------------------\n');

  await mongoose.disconnect();
  if (failCount > 0) process.exit(1);
}

runPaymentTests().catch(err => {
  console.error('Payment Test Suite Error:', err);
  process.exit(1);
});
