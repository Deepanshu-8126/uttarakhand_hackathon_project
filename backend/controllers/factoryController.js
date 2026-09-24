import { buildQuery } from '../utils/queryHelper.js';
import { destroyCloudinaryImage, destroyMultipleCloudinaryImages, handleImageUpdates, handleMultipleImageUpdates } from '../utils/cloudinaryHelper.js';
import { cacheGet, cacheSet, cacheDelPattern } from '../config/redis.js';

export const stripProvenance = (body) => {
  const immutable = ['sourceName', 'sourceUrl', 'sourcePageUrl', 'contentLicense', 'lastVerified', 'slug'];
  const data = { ...body };
  immutable.forEach(key => delete data[key]);
  
  // Strip image provenance
  if (data.coverImage) {
    delete data.coverImage.sourcePage;
    delete data.coverImage.license;
    delete data.coverImage.attribution;
    delete data.coverImage.source;
  }
  if (data.gallery && Array.isArray(data.gallery)) {
    data.gallery.forEach(img => {
      delete img.sourcePage;
      delete img.license;
      delete img.attribution;
      delete img.source;
    });
  }
  if (data.images && Array.isArray(data.images)) {
    data.images.forEach(img => {
      delete img.sourcePage;
      delete img.license;
      delete img.attribution;
      delete img.source;
    });
  }
  return data;
};

export const createController = (Model, isTextIndexed = false) => {
  // Use model collection name as cache prefix e.g. "stays", "rentals"
  const modelName = Model.collection.name;

  return {
    getAll: async (req, res) => {
      try {
        // Build a stable cache key from query params
        const cacheKey = `${modelName}:all:${JSON.stringify(req.query)}`;
        
        // 1️⃣ Try cache first
        const cached = await cacheGet(cacheKey);
        if (cached) {
          return res.status(200).json({ ...cached, fromCache: true });
        }

        const query = buildQuery(req.query, isTextIndexed);
        
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 1000;
        const skip = (page - 1) * limit;

        const docs = await Model.find(query).skip(skip).limit(limit);
        const total = await Model.countDocuments(query);
        
        const responseData = { success: true, count: docs.length, total, data: docs };
        
        // 2️⃣ Store in cache for 10 minutes
        await cacheSet(cacheKey, responseData, 600);
        
        res.status(200).json(responseData);
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    },

    getBySlug: async (req, res) => {
      try {
        const cacheKey = `${modelName}:slug:${req.params.slug}`;
        
        const cached = await cacheGet(cacheKey);
        if (cached) {
          return res.status(200).json({ ...cached, fromCache: true });
        }

        const doc = await Model.findOne({ slug: req.params.slug });
        if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
        
        const responseData = { success: true, data: doc };
        await cacheSet(cacheKey, responseData, 600); // 10 min
        
        res.status(200).json(responseData);
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    },

    // Admin Methods — invalidate cache on write
    create: async (req, res) => {
      try {
        const doc = await Model.create(req.body);
        await cacheDelPattern(`${modelName}:*`); // bust all cached lists
        res.status(201).json({ success: true, data: doc });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
    },

    update: async (req, res) => {
      try {
        const existing = await Model.findById(req.params.id);
        if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
        
        const safeData = stripProvenance(req.body);

        const doc = await Model.findByIdAndUpdate(req.params.id, safeData, { new: true, runValidators: true });
        
        // Invalidate cache for this model
        await cacheDelPattern(`${modelName}:*`);
        
        res.status(200).json({ success: true, data: doc });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
    },

    remove: async (req, res) => {
      try {
        const doc = await Model.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
        await Model.findByIdAndDelete(req.params.id);
        
        // Invalidate cache
        await cacheDelPattern(`${modelName}:*`);
        
        res.status(200).json({ success: true, message: 'Deleted successfully' });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  };
};
