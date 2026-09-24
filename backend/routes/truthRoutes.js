import express from 'express';
import { inspectListingTruth, submitTruthVerification } from '../controllers/truthController.js';

const router = express.Router();

// Public verification check
router.get('/inspect/:id', inspectListingTruth);

// Submit verification evaluation
router.post('/evaluate', submitTruthVerification);

export default router;
