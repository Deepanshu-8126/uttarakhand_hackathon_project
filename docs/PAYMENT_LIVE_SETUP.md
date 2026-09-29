# Discovery Uttarakhand — Razorpay Production & Test Setup Guide
**Document ID:** `GUIDE-M02-PAYMENT-SETUP`  
**Date:** September 2026  

---

## 1. Environment Configuration

### A. Test Mode (Active for Verification & Testing)
In `backend/.env`:
```env
RAZORPAY_KEY_ID=rzp_test_Tfve5JcWu17bY6
RAZORPAY_KEY_SECRET=YOUR_TEST_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
RAZORPAY_MODE=test
```
In `Frontend/.env`:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_Tfve5JcWu17bY6
```

### B. Live Mode (Production Deployment)
When moving to live production:
```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_MODE=live
```
> **Security Protocol:** Live API secrets must be injected via Render/Vercel Environment Secret Managers and NEVER committed to Git.

---

## 2. Webhook Setup in Razorpay Dashboard
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Navigate to: **Settings → Webhooks → Add New Webhook**.
3. **Webhook URL:** `https://uttarakhand-hackathon-project.onrender.com/api/payments/webhook/razorpay`
4. **Secret:** Set a secure random string and paste into `RAZORPAY_WEBHOOK_SECRET`.
5. **Active Events to Select:**
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
   - `refund.processed`
   - `refund.failed`
6. Click **Save Webhook**.

---

## 3. Merchant Marketplace Reality & Route Settlement Note
Discovery Uttarakhand operates as an escrow platform for Himalayan homestays, vehicle rentals, and trekking guides.
- **Current Phase:** Central collection into platform escrow account, holding funds until physical OTP check-in handshake.
- **Next Phase:** Partner KYC registration with Razorpay Route for automated split settlements directly to local vendor bank accounts.
