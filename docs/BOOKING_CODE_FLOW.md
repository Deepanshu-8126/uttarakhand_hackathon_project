# Discovery Uttarakhand — Booking Engine Code Flow
**Generated:** 2026-09-28

## 1. Complete Booking Lifecycle
```text
User clicks 'Book Now': Frontend/src/components/booking/BookingModal.jsx or CheckoutPage.jsx
 ↓
Client Request: bookingApi.createBooking(payload) (Frontend/src/api/bookingApi.js:6)
 ↓
Route: POST /api/bookings (backend/routes/bookingRoutes.js:17)
 ↓
Middleware: protect (JWT authentication verification)
 ↓
Controller: bookingController.createBooking (backend/controllers/bookingController.js:23)
   ├── 1. Validate check-in / check-out dates (Minimum 1 day duration)
   ├── 2. Resolve database listing:
   │      - If partner listing: PartnerListing.findById(id) (Must be status: 'ACTIVE')
   │      - If stay: Stay.findById(id)
   │      - If rental: Rental.findById(id)
   │      - If guide: Guide.findById(id)
   ├── 3. Server Price Calculation (Server is sole source of truth; client prices ignored)
   │      subtotal = basePrice * days * quantity
   │      greenCess = ₹50 (mandatory mountain preservation fee)
   │      total = subtotal + taxes + greenCess
   ├── 4. Generate unique booking reference: DU-YYYYMMDD-XXXXXX
   ├── 5. Generate Escrow Check-in OTP via escrowService.js (4-digit code)
   └── 6. Booking.create(...) -> MongoDB Atlas
 ↓
Confirmation Modal / My Bookings View (Frontend/src/pages/ProfilePage.jsx)
 ↓
Check-In Handshake:
   ├── Host enters Tourist's 4-digit OTP
   ├── Route: POST /api/bookings/:id/verify-otp
   ├── Controller: bookingController.verifyBookingOtp
   └── Status transitions: PENDING -> CONFIRMED -> COMPLETED (Escrow payout released to host)
```
