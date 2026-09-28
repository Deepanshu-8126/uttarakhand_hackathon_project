# Discovery Uttarakhand — Entity Identity & Image Governance Contract

**Version:** 2.0 (Strict Identity Architecture)  
**Status:** Enforced Across Backend (Express), Web (React/Vite), and Mobile (Flutter)

---

## 1. Core Rule & Architecture
```
USER CONTEXT (Destination / Coordinates)
           ↓
RECOMMENDATION ENGINE / PLACES RADAR
           ↓
REAL MONGODB ENTITY (Stay, Destination, Rental, Activity, Spiritual)
           ↓
STABLE ENTITY IDENTITY (entityId + entityType)
           ↓
CANONICAL IMAGE RESOLVER (normalizeEntityImage / resolveEntityImage)
           ↓
FRONTEND CARD / CLIENT VIEW
```

---

## 2. Priority Order of Image Resolution
When resolving an image for any entity, the resolver follows this strict sequence:
1. `entity.coverImage.url` (or verified `coverImage` string)
2. `entity.images[]` where `isCover === true`
3. First valid image within `entity.images[]` or `entity.gallery[]` belonging to the **SAME** entity
4. Verified landmark photographic asset (e.g. Wikimedia Commons archive for Raj Bhavan Nainital)
5. **Entity-Specific SVG Placeholder** (`getEntityPlaceholderSvg`) with exact entity name and category

> 🚫 **Zero Cross-Entity Substitution:** If an entity has no authentic image, it will **NEVER** fall back to another entity's image, a nearby lake, or a generic Unsplash photo. It displays an honest, brand-compliant SVG entity placeholder.

---

## 3. Normalized Image Schema Contract
Every recommendation and places response adheres to the following data shape:
```json
{
  "entityId": "65b...",
  "entityType": "stay",
  "name": "Prashant's Homestay Nainital",
  "image": {
    "url": "https://...",
    "source": "Database Record",
    "entityId": "65b...",
    "entityType": "stay",
    "verified": true,
    "isPlaceholder": false
  },
  "location": { "lat": 29.38, "lng": 79.46 },
  "distanceKm": 3.4,
  "rating": 4.8,
  "user_ratings_total": 42
}
```

---

## 4. Banned Practices
- ❌ **No Random Unsplash / Pexels arrays:** Removed all `idx % PHOTO_POOLS.length`.
- ❌ **No Foreign Photos:** Removed tropical beach resort, Ulun Danu Beratan Bali temple, and South Indian food photos.
- ❌ **No Fake Distances:** Distance is calculated strictly via Haversine from real entity coordinates; displays `null` if coordinates are missing.
- ❌ **No Fabricated Ratings:** Only real ratings from the database are rendered.

---

## 5. Web and Mobile Parity
Both the React web application and the Flutter mobile client consume the exact same backend endpoints (`/api/places/nearby`, `/api/recommendations`) and share the same image normalization rules.
