import Stay from '../models/Stay.js';
import { createController } from './factoryController.js';
import { cacheGet, cacheSet, cacheDelPattern } from '../config/redis.js';
import { getPublicStays } from '../services/marketplaceService.js';

const stayController = createController(Stay, false);

export const getStays = async (req, res) => {
  try {
    const cacheKey = `stays:v2:${req.query.district || 'all'}:${req.query.city || 'all'}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({ ...cached, fromCache: true });
    }

    const combined = await getPublicStays(req.query);
    const responsePayload = { success: true, count: combined.length, data: combined };
    
    await cacheSet(cacheKey, responsePayload, 600);
    res.status(200).json(responsePayload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStayBySlug = stayController.getBySlug;
export const createStay = async (req, res) => {
  await cacheDelPattern('stays:*');
  return stayController.create(req, res);
};
export const updateStay = async (req, res) => {
  await cacheDelPattern('stays:*');
  return stayController.update(req, res);
};
export const deleteStay = async (req, res) => {
  await cacheDelPattern('stays:*');
  return stayController.remove(req, res);
};

