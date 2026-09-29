import Guide from '../models/Guide.js';
import { createController } from './factoryController.js';
import { getPublicGuides } from '../services/marketplaceService.js';
import { cacheGet, cacheSet, cacheDelPattern } from '../config/redis.js';

const guideController = createController(Guide, false);

export const getGuides = async (req, res) => {
  try {
    const cacheKey = `guides:v2:${req.query.district || 'all'}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({ ...cached, fromCache: true });
    }

    const combined = await getPublicGuides(req.query);
    const responsePayload = { success: true, count: combined.length, data: combined };

    await cacheSet(cacheKey, responsePayload, 600);
    res.status(200).json(responsePayload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGuideBySlug = guideController.getBySlug;
export const createGuide = async (req, res) => {
  await cacheDelPattern('guides:*');
  return guideController.create(req, res);
};
export const updateGuide = async (req, res) => {
  await cacheDelPattern('guides:*');
  return guideController.update(req, res);
};
export const deleteGuide = async (req, res) => {
  await cacheDelPattern('guides:*');
  return guideController.remove(req, res);
};

