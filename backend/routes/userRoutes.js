import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getUserProfile, 
  updateUserProfile,
  getUserReviews,
  getUserTrips,
  getSavedItems,
  createExploreLater,
  deleteExploreLater
} from '../controllers/userController.js';
import { 
  createBooking, 
  getMyBookings 
} from '../controllers/bookingController.js';

const router = express.Router();

router.use(protect); // Protect all routes below

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.patch('/profile', updateUserProfile);
router.get('/bookings', getMyBookings);
router.post('/bookings', createBooking);
router.get('/reviews', getUserReviews);
router.get('/trips', getUserTrips);
router.get('/saved-items', getSavedItems);
router.post('/explore-later', createExploreLater);
router.delete('/explore-later/:id', deleteExploreLater);

export default router;

