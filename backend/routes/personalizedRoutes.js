/**
 * Discovery Uttarakhand — Personalized Location Routes
 * GET /api/personalized/home
 * GET /api/personalized/nearby
 */

import express from 'express';
import { getPersonalizedHome, getPersonalizedNearby } from '../controllers/personalizedController.js';

const router = express.Router();

router.get('/home', getPersonalizedHome);
router.get('/nearby', getPersonalizedNearby);

export default router;
