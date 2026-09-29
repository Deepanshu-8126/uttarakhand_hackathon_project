# Discovery Uttarakhand — Module 02: Production Payment Test Report

## 1. Overview
This report documents the verification of the end-to-end production payment lifecycle for Discovery Uttarakhand:
- Server-side Razorpay Order generation
- Server-enforced deterministic price calculations
- Client price-tampering mitigation
- HMAC-SHA256 signature verification
- Raw-body webhook verification & idempotency
- Controlled refund architecture
- Partner financial breakdown & double-payment protection

---

## 2. Test Execution Log (`backend/scripts/test_real_payment.js`)

**Execution Timestamp**: 2026-09-29  
**Target Database**: MongoDB Atlas (`cluster0.fqvhyww.mongodb.net/cityos`)  
**Gateway Configuration**: Razorpay Test Mode (`rzp_test_Tfve5JcWu17bY6`)  

| # | Test Assertion | Expected Behavior | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Server price enforcement | Ignore client `clientPrice: 1` and charge server-calculated amount | Server created order for ₹6,400 (640,000 paise), ignored ₹1 | **PASS** |
| **2** | Provider Order ID generation | Return valid `order_xxx` from Razorpay SDK | Valid `order_` generated and returned | **PASS** |
| **3** | Internal Payment record init | Initialize in `CREATED` state with booking relationship | `Payment` record saved with `status: 'CREATED'` and linked `bookingId` | **PASS** |
| **4** | Tampered signature rejection | Reject invalid HMAC signature with 400 | Bogus signature strictly rejected; booking remains `PENDING` | **PASS** |
| **5** | Authentic signature verification | Transition booking to `CONFIRMED` on valid signature | Genuine HMAC verified; booking transitioned to `CONFIRMED` | **PASS** |
| **6** | Payment state transition | Transition internal payment to `CAPTURED` | Payment transitioned to `CAPTURED` with `providerSignatureVerified: true` | **PASS** |
| **7** | Financial breakdown calculation | Calculate gross, platformFee (5%), tax (5%), partnerAmount | `grossAmount: 6400`, `platformFee: 320`, `taxes: 320`, `partnerAmount: 5760`, `settlementStatus: 'PENDING'` | **PASS** |
| **8** | Webhook signature validation | Verify raw byte body with webhook secret | Genuine webhook verified and processed | **PASS** |
| **9** | Webhook idempotency | Prevent duplicate processing of same event | Duplicate event caught via unique event ID; duplicate flag returned | **PASS** |
| **10** | Fake webhook rejection | Reject tampered webhook signatures | Tampered webhook signature rejected with 400 | **PASS** |
| **11** | Controlled partial refund | Process partial refund and update status | Partial refund of ₹3,200 processed; status became `PARTIALLY_REFUNDED` | **PASS** |
| **12** | Double-payment protection | Block new orders on already `CONFIRMED` bookings | Subsequent order creation strictly blocked | **PASS** |

**Summary**: 12 / 12 Tests Passed (100% Success).

---

## 3. Threat Mitigation Verified

1. **Client Price Tampering**:
   - Attack vector: Sending `amount: 1` in checkout request.
   - Mitigation: Server fetches listing from database, computes `nights * verifiedBaseRate`, and requests Razorpay order for that exact server amount.
2. **Replay Attack / Duplicate Webhook**:
   - Attack vector: Webhook event retried 5 times by network.
   - Mitigation: Handled idempotently via `PaymentWebhookEvent` unique constraint. Second and subsequent arrivals return immediate 200 without duplicate state transitions.
3. **Forged Checkout Success**:
   - Attack vector: Attacker triggering UI success modal directly without bank charge.
   - Mitigation: Booking stays `PENDING` until server verifies HMAC-SHA256 signature (`order_id + '|' + payment_id`).
