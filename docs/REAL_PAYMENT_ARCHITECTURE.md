# Discovery Uttarakhand — Production Payment Architecture
**Document ID:** `ARCH-M02-PAYMENT-PIPELINE`  
**Date:** September 2026  
**Status:** Approved Specification  

---

## 1. End-to-End Payment Lifecycle

```
[ TOURIST ] ──(Book Now)──► [ FRONTEND: CheckoutPage ]
                                     │
                                     ▼ (POST /api/bookings)
                         [ BACKEND: Booking Engine ]
                                     │
                                     ├─► Validate Listing is 'ACTIVE'
                                     ├─► Validate pricing.provenance === 'VERIFIED'
                                     ├─► Server-side duration & total calculation
                                     ├─► Create Booking (status: 'PENDING_PAYMENT')
                                     └─► Attach immutable pricingSnapshot
                                     │
                                     ▼ (POST /api/payments/create-order)
                         [ BACKEND: Payment Engine ]
                                     │
                                     ├─► Verify Booking belongs to user & is PENDING_PAYMENT
                                     ├─► Check existing payment records (Idempotency)
                                     ├─► Call Razorpay API: rzp.orders.create({ amount, currency, receipt })
                                     ├─► Create Payment record (status: 'CREATED')
                                     └─► Return { paymentId, razorpayOrderId, amount, currency }
                                     │
                                     ▼
                         [ FRONTEND: Razorpay Checkout ]
                                     │
                                     ├─► Launches official Razorpay modal with server `order_id`
                                     ├─► Customer selects: UPI / Card / Netbanking / Wallet / QR
                                     └─► Customer completes transaction at gateway
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
       [ Frontend Success Handler ]        [ Razorpay Webhook Engine ]
                     │                               │
                     ▼ (POST /api/payments/verify)   ▼ (POST /api/payments/webhook/razorpay)
           [ BACKEND: Signature Check ]    [ BACKEND: Webhook Event ]
                     │                               │
                     ├─► HMAC-SHA256 verification    ├─► HMAC-SHA256 signature check
                     ├─► State transition: CAPTURED  ├─► Idempotency check (eventId)
                     └─► Booking status: CONFIRMED   └─► Reconcile Payment & Booking
                     │                               │
                     └───────────────┬───────────────┘
                                     │
                                     ▼
                         [ BOOKING CONFIRMED ]
                                     │
                                     ├─► Generate checkInOtp & bookingReference
                                     ├─► Set escrowStatus: 'HELD_IN_ESCROW'
                                     ├─► Record financial breakdown (Platform Fee, Partner Net)
                                     └─► Emit confirmation to traveler & partner
                                     │
                                     ▼
                         [ USER: My Bookings Page ]
                             (Real Payment Receipt)
```

---

## 2. Server-Side Price Calculation Rule
The frontend **never** dictates or calculates the authoritative payment price.
1. The client submits only duration inputs: `{ startDate, endDate, guests, quantity }`.
2. The server queries the database for the active listing's verified rate.
3. The server computes:
   $$\text{subtotal} = \text{rate} \times \text{days} \times \text{quantity}$$
   $$\text{greenCess} = 50 \times \text{guests}$$
   $$\text{total} = \text{subtotal} + \text{greenCess}$$
4. If the client submits `amount: 1`, the server ignores it and constructs the Razorpay Order for the exact server-calculated total (in paise: $\text{total} \times 100$).

---

## 3. Webhook Idempotency & Re-entrancy Protection
To defend against duplicated gateway webhooks, network retries, or simultaneous client verification:
- Every webhook event is registered in `PaymentWebhookEvent` with unique index on `eventId`.
- Duplicate deliveries of the same `eventId` are acknowledged immediately with HTTP 200 without executing side effects.
- State transitions follow a strict directed acyclic graph:
  $$\text{CREATED} \to \text{AUTHORIZED} \to \text{CAPTURED} \to \text{REFUNDED}$$
- Re-entering `CAPTURED` from `CAPTURED` is a safe, idempotent no-op.
