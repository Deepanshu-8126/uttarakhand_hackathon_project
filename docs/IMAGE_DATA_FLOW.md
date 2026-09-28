# Discovery Uttarakhand — Image System Data Flow & Audit
**Generated:** 2026-09-28

## 1. Image Resolution Pipeline
```text
Database Record (coverImage.url / images[].url / pl.images[].url)
 ↓
Image Resolver: Frontend/src/utils/imageHelpers.js (DESTINATION_NAMED_IMAGES, getAssetUrl)
 ↓
Pexels / Authentic Dataset: Frontend/src/utils/images.js (AUTHENTIC_LOCAL_PHOTOS, getFreshImage)
 ↓
Hash Stabilizer: getStableIndex(cleanKey, length) (String charCode hash — zero re-render flicker)
 ↓
Component <img> element
 ↓
onError Fallback handler (/assets/fallback.svg or Himalayan static photo)
```

## 2. Image Categories Identified
1. **Entity-Specific Images:** Real photographs for all 106 destinations, e.g. `/assets/kedarnath.jpg`, `/assets/badrinath.jpg`, `/assets/tungnath_summit.jpg`.
2. **Category Images:** Scenic mountain assets in `Frontend/src/utils/imageHelpers.js` for treks, lakes, temples, stays, and rentals.
3. **Shared Images:** `/assets/himalayan_basecamp_village.jpg` shared across high-altitude bugyals and rural homestays.
4. **Cloudinary Images:** Uploaded host photos via `backend/routes/uploadRoutes.js`.
5. **Static Seed Manifest:** `backend/seed/image-manifest.json` (116 entity mappings).

## 3. Math.random() Audit Report
A complete search for `Math.random()` across the codebase was executed:
- **Image Jitter Fixed:** In earlier revisions, `Frontend/src/utils/images.js` used `Math.random()` to pick from Pexels cache arrays. This has been **fixed** with `getStableIndex(cleanKey, len)` deterministic hashing.
- **Current Math.random() usage in Codebase:**
  1. `Frontend/src/pages/CheckoutPage.jsx:254` — Generates a 4-digit numeric escrow OTP check-in code.
  2. `Frontend/src/pages/GuideDashboard.jsx:27` — Generates mock trekker reference ID (`TRK-XXXXX`).
  3. `Frontend/src/pages/TrekkerLivePage.jsx:93,98,103` — Simulates live telemetry sensor fluctuations.
  4. `Frontend/src/pages/VerifiedReviewPage.jsx:285` — Mock NFT token ID generation.
  5. `Frontend/src/store/chatStore.js:12` — Unique message and turn ID generation.
  6. `backend/controllers/sosController.js:68` — Random 5-digit incident number suffix.
  7. `backend/middleware/uploadMiddleware.js:20` — Unique suffix for file storage.
  8. `backend/controllers/safetyController.js:132` — Unique incident ID generation.
*No code modifications were made during this audit.*
