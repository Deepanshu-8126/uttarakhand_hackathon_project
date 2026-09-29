# Discovery Uttarakhand — Production Payment System Audit
**Document ID:** `AUDIT-M02-PAYMENT-SYSTEM`  
**Date:** September 2026  
**Auditor:** Antigravity Autonomous Agent  
**Environment:** Razorpay Gateway + Express Backend + React Vite Checkout  

---

## Executive Summary
This audit inspects the payment, booking, verification, reconciliation, and settlement pipelines across Discovery Uttarakhand. The backend possesses a verified server-side Razorpay order creation and HMAC-SHA256 signature verification service (`paymentService.js`), an idempotent webhook receiver (`PaymentWebhookEvent`), and an immutable pricing snapshot mechanism in `Booking.js`.

However, the frontend checkout implementation in [`Frontend/src/pages/CheckoutPage.jsx`](file:///c:/Users/Deepanshu/Desktop/discover/Frontend/src/pages/CheckoutPage.jsx) bypassed this backend order flow by opening a client-side Razorpay modal without a server `order_id`, and falling back to auto-confirming bookings on error.

This audit details the gaps and establishes the required architecture for an airtight, zero-fake production payment system.

---

## 1. Current Booking Flow
- **Initiation:** User selects an active listing (Stay, Rental, Guide) with dates and guest count.
- **Backend Validation:** [`backend/controllers/bookingController.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/controllers/bookingController.js):
  1. Validates listing existence and `status === 'ACTIVE'`.
  2. Enforces `pricing.provenance === 'VERIFIED'`.
  3. Server calculates `subtotal` and `total` based on duration and unit rate.
  4. Creates a `Booking` record with `status: 'PENDING_PAYMENT'` (or `'PENDING'`).
  5. Attaches an immutable `pricingSnapshot` (rate, unit, currency, subtotal, total) and `listingSnapshot`.
  6. Generates unique human-readable `bookingReference` (`DU-YYYYMMDD-XXXXXX`) and check-in OTP.

---

## 2. Current Payment Flow & Razorpay Integration
- **Backend Flow:** [`backend/services/paymentService.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/services/paymentService.js):
  - `POST /api/payments/create-order`:
    - Checks booking belongs to authenticated user and has status `PENDING`.
    - Checks for existing payments (`CREATED` / `PENDING` returned idempotently; `CAPTURED` rejected as already paid).
    - Calls `rzp.orders.create({ amount: minorAmount, currency, receipt })`.
    - Creates `Payment` record with status `CREATED`.
    - Returns `{ paymentId, razorpayOrderId, amount, currency }`.
  - `POST /api/payments/verify`:
    - Receives `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`.
    - Validates HMAC-SHA256 signature:
      `crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id).digest('hex')`.
    - Transitions `Payment.status` to `CAPTURED`.
    - Calls `_confirmBookingSecurely(payment)` which verifies amount equality and marks `Booking.status = 'CONFIRMED'`.
- **Frontend Breakdown:** In `CheckoutPage.jsx#L367-L413`:
  - Did **not** call `POST /api/payments/create-order` to obtain a server `order_id` before launching the modal.
  - Opened Razorpay popup with a client-calculated amount and no `order_id`.
  - Included a fallback timer: `setTimeout(() => { finalizeBooking(); }, 600)` that marked the booking confirmed even if Razorpay declined or failed.

---

## 3. Current Payment Model Analysis
- Model: [`backend/models/Payment.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/models/Payment.js).
- Existing Fields:
  - `bookingId`: Ref to `Booking` (required).
  - `userId`: Ref to `User` (required).
  - `razorpayOrderId`: String (unique, required).
  - `razorpayPaymentId`: String (unique, sparse).
  - `amount`: Number in minor units (paise).
  - `currency`: String (default: 'INR').
  - `status`: Enum `['CREATED', 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED']`.
  - `idempotencyKey`: String.
- **Missing Fields for Production:**
  - `method`: (UPI, Card, Netbanking, Wallet, QR).
  - `failureCode`, `failureReason`: Detailed gateway diagnostics.
  - `qrId`: Dedicated reference for UPI dynamic QR collections.
  - `capturedAt`: Gateway capture timestamp.
  - `refundedAmount`: Cumulative refunds processed.
  - `refundStatus`: `['NONE', 'PARTIAL', 'FULL']`.
  - `partnerId`: Direct link to partner for financial reconciliation.
  - `financialBreakdown`: `{ grossAmount, platformFee, taxes, partnerAmount, settlementStatus }`.

---

## 4. Current Booking States
In [`backend/models/Booking.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/models/Booking.js):
- Existing Enum: `['pending', 'confirmed', 'checked_in', 'cancelled', 'completed', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'COMPLETED', 'PENDING_PAYMENT']`.
- Payment status field: `paymentStatus: ['pending', 'paid', 'failed', 'refunded']`.
- Escrow Status field: `escrowStatus: ['HELD_IN_ESCROW', 'RELEASED_TO_PARTNER', 'REFUNDED_TO_TRAVELER', 'DISPUTED']`.

---

## 5. Existing Webhook Support
- Endpoint: `POST /api/payments/webhook/razorpay`.
- Express Middleware: `app.use('/api/payments/webhook/razorpay', express.raw({ type: 'application/json' }))` ensures exact raw byte buffer for cryptographic verification.
- HMAC Verification: Validated with `process.env.RAZORPAY_WEBHOOK_SECRET`.
- Idempotency Store: [`backend/models/PaymentWebhookEvent.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/models/PaymentWebhookEvent.js) stores `eventId`, `eventType`, `processingStatus: ['PENDING', 'PROCESSED', 'FAILED']`.
- Handled Events: `payment.captured`, `payment.failed`, `payment.authorized`.
- **Missing Events:** `refund.processed`, `refund.failed`, `order.paid`.

---

## 6. Existing Refund Support
- In `backend/services/paymentService.js#L28`:
  `CAPTURED: [], // Refunds are out of scope`
- **Gap:** No backend refund endpoint currently exists. Admin and users cannot initiate full or partial refunds through Razorpay API.

---

## 7. Existing QR Payment Support
- In `CheckoutPage.jsx`, QR was merely a client tab option.
- **Gap:** No backend endpoint to generate a real Razorpay UPI QR code via `rzp.qrCode.create()`.

---

## 8. Existing Partner Settlement Support
- Discovery Uttarakhand collects payments centrally on platform credentials.
- `Booking.escrowStatus` tracks `'HELD_IN_ESCROW'` until physical OTP handshake.
- **Gap:** Direct automated vendor bank transfers via Razorpay Route require approved linked merchant accounts. Until on-boarded, platform holds escrow and records partner payout ledgers.

---

## 9. Security Gaps & Identified Flaws
| ID | Area | Severity | Root Cause |
|---|---|---|---|
| SEC-01 | Client-trusted payment | CRITICAL | `CheckoutPage.jsx` executed `finalizeBooking()` on timeout without verifying payment on server. |
| SEC-02 | Missing orderId in popup | HIGH | Client launched Razorpay popup without backend `order_id`, allowing client price manipulation. |
| SEC-03 | Missing Refund Routes | HIGH | No route or controller to handle refunds securely via server. |
| SEC-04 | Missing Payment Details Model | MEDIUM | Payment schema lacks `method`, `failureReason`, and settlement breakdown. |
| SEC-05 | Webhook Secret Fallback | MEDIUM | Webhook throws if `RAZORPAY_WEBHOOK_SECRET` is unset; needs graceful test mode handling. |

---

## 10. Required Production Architecture
1. **Server-Side Order Enforcement:**
   `CheckoutPage` -> `POST /api/payments/create-order` -> receives `razorpayOrderId` -> opens Razorpay Checkout with `order_id`.
2. **Signature Verification Gate:**
   Razorpay success callback -> `POST /api/payments/verify` -> server verifies signature -> marks `Payment.status = 'CAPTURED'` -> marks `Booking.status = 'CONFIRMED'`.
3. **Zero Fallback Confirmation:**
   Remove all `setTimeout` auto-confirmations. If payment is not verified by server, booking remains `PENDING_PAYMENT` or transitions to `PAYMENT_FAILED`.
4. **Refund API:**
   Implement `POST /api/payments/:paymentId/refund` (authorized admin/system only) with Razorpay refund API integration.
5. **Real QR Code API:**
   Implement `POST /api/payments/create-qr` using Razorpay QR API for real dynamic UPI collection.
6. **Financial Breakdown:**
   Record platform fee (e.g. 5%) and net partner settlement amount in each captured payment.
