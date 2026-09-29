# Discovery Uttarakhand — Module 02: Real Production Payment System Final Implementation Report

## 1. Executive Summary
Discovery Uttarakhand now operates an authentic, server-controlled payment pipeline using Razorpay. All bookings created on the marketplace are priced authoritatively on the backend, locked into immutable snapshots, and confirmed exclusively upon cryptographic HMAC-SHA256 signature verification or authenticated webhook reconciliation. Zero mock payments, zero screenshot-based confirmations, and zero client-trusted amounts exist in the application.

---

## 2. Payment Lifecycle & Architecture

```
[Tourist: Book Now]
        ↓
POST /api/bookings (Server creates booking with pricing snapshot, status: PENDING)
        ↓
POST /api/payments/create-order (Backend calculates paise, creates Razorpay Order)
        ↓
[Frontend opens Razorpay Checkout with order_id]
        ↓ (Tourist pays via UPI / Card / Netbanking / Wallet)
[Razorpay handler returns payment_id, order_id, signature]
        ↓
POST /api/payments/verify (Server verifies HMAC-SHA256: order_id + '|' + payment_id)
        ↓ (Cryptographic Match Validated)
Booking status -> CONFIRMED, Payment status -> CAPTURED
        ↓
[Platform Financial Breakdown Stored: Gross, Platform Fee, Taxes, Partner Amount]
        ↓
[Webhook independently confirms event with idempotency lock]
```

---

## 3. Key Components Implemented / Upgraded

### A. Models
- [`backend/models/Payment.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/models/Payment.js):
  Production schema with `providerOrderId`, `providerPaymentId`, `providerSignatureVerified`, `amount` (minor units), `method`, `status` (`CREATED`, `PENDING`, `AUTHORIZED`, `CAPTURED`, `REFUND_PROCESSING`, `PARTIALLY_REFUNDED`, `REFUNDED`), `financialBreakdown` (`grossAmount`, `platformFee`, `taxes`, `partnerAmount`, `settlementStatus`), and `metadata`.
- [`backend/models/PaymentWebhookEvent.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/models/PaymentWebhookEvent.js):
  Idempotency guard tracking `eventId`, `eventType`, `processingStatus`, `processedAt`, `errorMetadata`.
- [`backend/models/Booking.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/models/Booking.js):
  Updated with immutable `pricingSnapshot` (`amount`, `subtotal`, `total`, `provenance`), `checkInOtp`, `escrowStatus`.

### B. Backend Services & Controllers
- [`backend/services/paymentService.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/services/paymentService.js):
  - `createOrder`: Server-side order creation.
  - `createQrOrder`: Dynamic UPI QR code generation.
  - `verifyPayment`: Server-side HMAC-SHA256 signature check.
  - `processWebhook`: Raw-body webhook verification with replay protection.
  - `refundPayment`: Full and partial refund orchestration with gateway call.
  - `reconcilePayment`: Gateway status reconciliation against Razorpay orders API.
- [`backend/controllers/paymentController.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/controllers/paymentController.js) & [`backend/routes/paymentRoutes.js`](file:///c:/Users/Deepanshu/Desktop/discover/backend/routes/paymentRoutes.js):
  Protected endpoints mounted under `/api/payments`.

### C. Frontend Checkout & Modals
- [`Frontend/src/pages/CheckoutPage.jsx`](file:///c:/Users/Deepanshu/Desktop/discover/Frontend/src/pages/CheckoutPage.jsx):
  - Integrated `createBooking` -> `createPaymentOrder` -> Razorpay popup with real `order_id` -> `verifyPaymentSignature`.
  - Removed all mock fallback objects (`Royal Enfield Himalayan 450`) and eliminated the `setTimeout` auto-confirmation bypass.
- [`Frontend/src/components/booking/BookingDetailsModal.jsx`](file:///c:/Users/Deepanshu/Desktop/discover/Frontend/src/components/booking/BookingDetailsModal.jsx):
  - Wired backwards-compatible `createOrder` and `verifyPayment` with error states.
- [`Frontend/src/api/paymentApi.js`](file:///c:/Users/Deepanshu/Desktop/discover/Frontend/src/api/paymentApi.js):
  - Production client wrapper for all payment lifecycle endpoints.

---

## 4. Test Mode vs. Live Mode Status

### Test Mode (Fully Verified & Operational)
- **Status**: **VERIFIED**
- **Credentials**: Razorpay Test Keys (`rzp_test_Tfve5JcWu17bY6`)
- **UPI**: Supported via Razorpay Checkout UPI simulator.
- **Cards**: Supported via standard test Visa/Mastercard cards.
- **Netbanking**: Supported via all simulated bank portals.
- **Refunds**: Simulated via API with state update to `PARTIALLY_REFUNDED` / `REFUNDED`.

### Live Mode Readiness
- **Status**: **READY FOR PRODUCTION CREDENTIAL SWITCH**
- To activate real money payments:
  1. Replace `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in environment variables with live merchant keys (`rzp_live_...`).
  2. Configure public webhook URL in Razorpay Dashboard (`https://<production-domain>/api/payments/webhook/razorpay`) with secret `RAZORPAY_WEBHOOK_SECRET`.
  3. Ensure partner bank details KYC is verified before enabling automated settlements via Razorpay Route.
