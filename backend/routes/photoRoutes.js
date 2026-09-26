import express from 'express';
import { searchRealHimalayanPhotos } from '../services/photoService.js';

const router = express.Router();

/**
 * @route GET /api/photos/search
 * @desc Multi-source real photography search (Pexels + Unsplash Fallback)
 * @query query (string)
 * @query count (number)
 */
router.get('/search', async (req, res) => {
  try {
    const { query = 'Uttarakhand mountain valley', count = 6 } = req.query;
    const photos = await searchRealHimalayanPhotos(query.toString(), Math.min(parseInt(count, 10) || 6, 20));

    return res.json({
      success: true,
      query,
      count: photos.length,
      data: photos,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve real photography records',
      error: err.message,
    });
  }
});

export default router;
