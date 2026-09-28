import Destination from '../models/Destination.js';
import { createController } from './factoryController.js';
import { validateImageBelongsToEntity, getEntityPlaceholderSvg } from '../utils/imageValidator.js';
import { cacheGet, cacheSet } from '../config/redis.js';

const destinationController = createController(Destination, true); // true for isTextIndexed

export const getDestinations = destinationController.getAll;
export const getDestinationBySlug = destinationController.getBySlug;
export const createDestination = destinationController.create;
export const updateDestination = destinationController.update;
export const deleteDestination = destinationController.remove;

/**
 * @desc Get strictly verified images belonging exclusively to the target destination
 * @route GET /api/destinations/:idOrSlug/images
 */
export const getDestinationImages = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const cacheKey = `destination:images:${idOrSlug.toLowerCase()}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({ ...cached, fromCache: true });
    }

    let dest = null;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      dest = await Destination.findById(idOrSlug).lean();
    }
    if (!dest) {
      dest = await Destination.findOne({ slug: idOrSlug.toLowerCase() }).lean();
    }

    if (!dest) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const rawCandidates = [];
    if (dest.coverImage) rawCandidates.push(dest.coverImage);
    if (Array.isArray(dest.gallery)) rawCandidates.push(...dest.gallery);
    if (Array.isArray(dest.images)) rawCandidates.push(...dest.images);

    const validImages = [];
    const seenUrls = new Set();

    for (const raw of rawCandidates) {
      if (!raw) continue;
      const url = typeof raw === 'string' ? raw.trim() : raw.url?.trim();
      if (!url || seenUrls.has(url)) continue;

      const check = validateImageBelongsToEntity(raw, dest);
      if (check.valid) {
        seenUrls.add(url);
        validImages.push({
          url,
          entityId: dest._id.toString(),
          entitySlug: dest.slug,
          entityType: 'destination',
          source: raw.source || 'Discovery Uttarakhand Database',
          sourceUrl: raw.sourcePage || raw.sourceUrl || null,
          license: raw.license || 'Public Record',
          attribution: raw.attribution || 'Verified Uttarakhand Archive',
          alt: raw.alt || dest.name,
          isCover: raw === dest.coverImage || raw.isCover === true,
          verified: true
        });
      }
    }

    const placeholder = getEntityPlaceholderSvg({
      name: dest.name,
      category: 'Destination',
      slug: dest.slug
    });

    const responsePayload = {
      success: true,
      destination: {
        _id: dest._id,
        name: dest.name,
        slug: dest.slug
      },
      count: validImages.length,
      images: validImages,
      placeholder
    };

    await cacheSet(cacheKey, responsePayload, 600);
    return res.status(200).json(responsePayload);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

