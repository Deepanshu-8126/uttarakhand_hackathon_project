import express from 'express';
import {
  searchPlaces,
  getNearbyPlaces,
  getPlaceDetails,
  getPlacesStatus
} from '../controllers/placesController.js';

const router = express.Router();

// Search & Discover
router.get('/status', getPlacesStatus);
router.get('/search', searchPlaces);
router.get('/nearby', getNearbyPlaces);
router.get('/details', getPlaceDetails);

export default router;
