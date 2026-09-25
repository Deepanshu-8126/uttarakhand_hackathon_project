import express from 'express';
import {
  searchPlaces,
  getNearbyPlaces,
  getPlaceDetails,
  getRouteDirections,
  getPlacesStatus,
  getLivePhoto
} from '../controllers/placesController.js';

const router = express.Router();

// Search & Discover
router.get('/status', getPlacesStatus);
router.get('/live-photo', getLivePhoto);
router.get('/search', searchPlaces);
router.get('/places', searchPlaces); // Canonical /api/search/places alias
router.get('/', searchPlaces);
router.get('/nearby', getNearbyPlaces);
router.get('/details', getPlaceDetails);
router.get('/route', getRouteDirections);

export default router;

