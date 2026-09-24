import express from 'express';
import { 
  createBooking, 
  getMyBookings, 
  getBookingById, 
  cancelBooking,
  getCheckInOtp,
  verifyCheckIn,
  cancelAndReverseRental
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Protect all booking routes

router.route('/')
  .get(getMyBookings)
  .post(createBooking);

router.route('/my')
  .get(getMyBookings);

router.route('/:id')
  .get(getBookingById);

router.route('/:id/cancel')
  .patch(cancelBooking);

// Feature 14: Escrow Protection & Check-In OTP Handshake
router.route('/:id/checkin-otp')
  .get(getCheckInOtp);

router.route('/:id/verify-checkin')
  .post(verifyCheckIn);

// Feature 3: One-Tap Reverse Rental
router.route('/:id/cancel-reverse')
  .post(cancelAndReverseRental);

export default router;
