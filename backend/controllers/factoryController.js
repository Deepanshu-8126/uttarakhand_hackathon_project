import { buildQuery } from '../utils/queryHelper.js';
import { destroyCloudinaryImage, destroyMultipleCloudinaryImages, handleImageUpdates, handleMultipleImageUpdates } from '../utils/cloudinaryHelper.js';
import { cacheGet, cacheSet, cacheDelPattern } from '../config/redis.js';
import PartnerListing from '../models/PartnerListing.js';

export const stripProvenance = (body) => {
  const immutable = ['sourceName', 'sourceUrl', 'sourcePageUrl', 'contentLicense', 'lastVerified', 'slug'];
  const data = { ...body };
  immutable.forEach(key => delete data[key]);
  
  // Safely normalize and strip image provenance
  if (data.coverImage) {
    if (typeof data.coverImage === 'string') {
      data.coverImage = { url: data.coverImage };
    } else if (typeof data.coverImage === 'object') {
      const cleaned = { ...data.coverImage };
      delete cleaned.sourcePage;
      delete cleaned.license;
      delete cleaned.attribution;
      delete cleaned.source;
      data.coverImage = cleaned;
    }
  }

  if (Array.isArray(data.gallery)) {
    data.gallery = data.gallery.map(img => {
      if (typeof img === 'string') return { url: img };
      if (img && typeof img === 'object') {
        const cleaned = { ...img };
        delete cleaned.sourcePage;
        delete cleaned.license;
        delete cleaned.attribution;
        delete cleaned.source;
        return cleaned;
      }
      return img;
    }).filter(Boolean);
  }

  if (Array.isArray(data.images)) {
    data.images = data.images.map(img => {
      if (typeof img === 'string') return { url: img };
      if (img && typeof img === 'object') {
        const cleaned = { ...img };
        delete cleaned.sourcePage;
        delete cleaned.license;
        delete cleaned.attribution;
        delete cleaned.source;
        return cleaned;
      }
      return img;
    }).filter(Boolean);
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
        const identifier = req.params.slug;
        const cacheKey = `${modelName}:slug:${identifier}`;
        
        const cached = await cacheGet(cacheKey);
        if (cached) {
          return res.status(200).json({ ...cached, fromCache: true });
        }

        let doc = await Model.findOne({ slug: identifier });
        if (!doc && identifier && identifier.match(/^[0-9a-fA-F]{24}$/)) {
          doc = await Model.findById(identifier);
        }
        if (!doc) {
          doc = await PartnerListing.findOne({ slug: identifier });
          if (!doc && identifier && identifier.match(/^[0-9a-fA-F]{24}$/)) {
            doc = await PartnerListing.findById(identifier);
          }
        }

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
        const safeData = stripProvenance(req.body);
        let existing = await Model.findById(req.params.id);

        if (!existing) {
          const partnerDoc = await PartnerListing.findById(req.params.id);
          if (partnerDoc) {
            if (safeData.title || safeData.name) partnerDoc.title = safeData.title || safeData.name;
            if (safeData.description) partnerDoc.description = safeData.description;
            if (safeData.district) partnerDoc.district = safeData.district;
            if (safeData.city) partnerDoc.city = safeData.city;
            if (safeData.images) partnerDoc.images = safeData.images;
            if (safeData.coverImage) {
              const cover = typeof safeData.coverImage === 'string' ? { url: safeData.coverImage } : safeData.coverImage;
              partnerDoc.images = [cover, ...(Array.isArray(partnerDoc.images) ? partnerDoc.images.slice(1) : [])];
            }
            if (safeData.price || safeData.pricePerDay || safeData.pricePerNight) {
              const amount = typeof safeData.price === 'object' ? safeData.price.amount : (safeData.price || safeData.pricePerDay || safeData.pricePerNight);
              partnerDoc.pricing = {
                ...(partnerDoc.pricing || {}),
                amount: Number(amount) || partnerDoc.pricing?.amount || 0,
                provenance: 'VERIFIED',
                lastVerifiedAt: new Date()
              };
            }
            await partnerDoc.save();
            await cacheDelPattern(`${modelName}:*`);
            await cacheDelPattern('rentals:*');
            await cacheDelPattern('stays:*');
            return res.status(200).json({ success: true, data: partnerDoc });
          }
          return res.status(404).json({ success: false, message: 'Not found' });
        }

        const doc = await Model.findByIdAndUpdate(req.params.id, safeData, { new: true, runValidators: true });
        
        // Invalidate cache for this model
        await cacheDelPattern(`${modelName}:*`);
        await cacheDelPattern('rentals:*');
        await cacheDelPattern('stays:*');
        
        res.status(200).json({ success: true, data: doc });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
    },

    remove: async (req, res) => {
      try {
        const doc = await Model.findById(req.params.id);
        if (!doc) {
          const partnerDoc = await PartnerListing.findById(req.params.id);
          if (partnerDoc) {
            await PartnerListing.findByIdAndDelete(req.params.id);
            await cacheDelPattern(`${modelName}:*`);
            await cacheDelPattern('rentals:*');
            await cacheDelPattern('stays:*');
            return res.status(200).json({ success: true, message: 'Deleted successfully' });
          }
          return res.status(404).json({ success: false, message: 'Not found' });
        }
        await Model.findByIdAndDelete(req.params.id);
        
        // Invalidate cache
        await cacheDelPattern(`${modelName}:*`);
        await cacheDelPattern('rentals:*');
        await cacheDelPattern('stays:*');
        
        res.status(200).json({ success: true, message: 'Deleted successfully' });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  };
};
