import Rental from '../models/Rental.js';
import { createController } from './factoryController.js';
import { cacheGet, cacheSet, cacheDelPattern } from '../config/redis.js';
import { getPublicRentals } from '../services/marketplaceService.js';

const rentalController = createController(Rental, false);

export const getRentals = async (req, res) => {
  try {
    const cacheKey = `rentals:v2:${req.query.district || 'all'}:${req.query.city || 'all'}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({ ...cached, fromCache: true });
    }

    const combined = await getPublicRentals(req.query);
    const responsePayload = { success: true, count: combined.length, data: combined };

    await cacheSet(cacheKey, responsePayload, 600);
    res.status(200).json(responsePayload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRentalBySlug = rentalController.getBySlug;
export const createRental = async (req, res) => {
  await cacheDelPattern('rentals:*');
  return rentalController.create(req, res);
};
export const updateRental = async (req, res) => {
  await cacheDelPattern('rentals:*');
  return rentalController.update(req, res);
};
export const deleteRental = async (req, res) => {
  await cacheDelPattern('rentals:*');
  return rentalController.remove(req, res);
};

