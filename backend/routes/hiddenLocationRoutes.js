import express from 'express';
import {
  getAllHiddenLocations,
  getHiddenLocationBySlug,
  getHiddenLocationWeather,
} from '../controllers/hiddenLocationController.js';

const router = express.Router();

router.get('/', getAllHiddenLocations);
router.get('/weather', getHiddenLocationWeather);
router.get('/:slug', getHiddenLocationBySlug);

export default router;
