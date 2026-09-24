import express from 'express';
import {
  searchPlaces,
  getNearbyPlaces,
  getPlaceDetails,
  getRouteDirections,
  getPlacesStatus
} from '../controllers/placesController.js';

const router = express.Router();

// Search & Discover
router.get('/status', getPlacesStatus);
router.get('/search', searchPlaces);
router.get('/nearby', getNearbyPlaces);
router.get('/details', getPlaceDetails);
router.get('/route', getRouteDirections);

export default router;
