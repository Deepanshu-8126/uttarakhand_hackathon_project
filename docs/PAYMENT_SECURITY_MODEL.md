# Discovery Uttarakhand — Payment Security & Threat Model
**Document ID:** `SEC-M02-THREAT-MODEL`  
**Date:** September 2026  
**Status:** Enforced  

---

## 1. Threat Mitigation Matrix

| Vulnerability Vector | Threat Scenario | Architectural Defense Enforced |
|---|---|---|
| **Price Tampering** | Attacker intercepts frontend request and sends `totalAmount: 1`. | Backend recalculates full amount strictly from MongoDB listing rate $\times$ duration. Any client-sent price is discarded. |
| **Fake Success Spoofing** | Attacker calls `/verify` or manipulates client state to simulate payment. | Backend requires cryptographic HMAC-SHA256 signature verification computed over `order_id + '|' + payment_id` with `RAZORPAY_KEY_SECRET`. |
| **Fake QR / Screenshot Fraud** | Attacker uploads fabricated payment screenshot or claims "paid via UPI". | Screenshots and manual UTR numbers are never treated as confirmation. Only Razorpay gateway API or signed webhook can confirm payment. |
| **Secret Leakage** | `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` exposed in frontend bundle. | Secrets reside strictly on backend environment variables. Frontend only receives public `RAZORPAY_KEY_ID`. |
| **Double Payment / Duplicate Charge** | Customer rapidly double-clicks "Pay Now" or refreshes page. | `createOrder` checks for an existing active order for the booking and idempotently returns the existing order. |
| **Webhook Replay Attack** | Attacker captures valid webhook payload and resends repeatedly. | `PaymentWebhookEvent` enforces a unique constraint on `eventId`. Replayed events are discarded. |
| **Cross-Tenant Modification** | Partner attempts to approve own listing or user attempts to pay another user's booking. | Middleware checks `req.user._id === booking.user`. Admin routes require `role === 'admin'`. Partners cannot self-verify. |

---

## 2. Zero-Trust Gateway Principles
1. **Never trust client state:** The frontend is treated as completely untrusted presentation layer.
2. **Never store payment card data:** Raw card details, CVVs, and banking PINs never touch Discovery Uttarakhand servers; they are processed inside Razorpay's PCI-DSS Level 1 compliant vault.
3. **Audit trails on all sensitive events:** Refunds, state transitions, and verifications are permanently recorded in MongoDB with admin/user attribution.
