# Discovery Uttarakhand — Canonical Marketplace Data Architecture
**Document ID:** `ARCH-M01-DATA-FLOW`  
**Date:** September 2026  
**Status:** Approved Specification  

---

## 1. Canonical Marketplace Data Flow

The operational truth for all marketplace entities (Stays, Vehicle Rentals, and Mountain Guides) flows through a deterministic, gated pipeline:

```
[ LOCAL PARTNER / OWNER / VENDOR ]
                │
                ▼ (POST /api/partners)
      [ Partner Registration ]
                │
                ▼ (status: PENDING_APPROVAL -> APPROVED)
     [ Partner Profile in MongoDB ]
                │
                ▼ (POST /api/partners/me/listings)
       [ Create Listing Draft ] ───► status: 'DRAFT'
                │                    pricing: 'PARTNER_CLAIMED'
                ▼ (POST /api/partners/me/listings/:id/submit)
    [ Submit for Verification ] ───► status: 'PENDING_VERIFICATION'
                │
                ▼
   ┌───────────────────────────────┐
   │    ADMIN VERIFICATION QUEUE   │
   │ (GET /api/admin/listings/     │
   │  pending)                     │
   └───────────────┬───────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
    [ REJECT ]          [ APPROVE ]
  status: REJECTED    status: VERIFIED
  (Requires reason;   pricing: VERIFIED
   Partner can edit   Audit log written
   & resubmit)               │
                             ▼ (POST /api/admin/listings/:id/activate)
                      [ ACTIVATE ]
                      status: ACTIVE
                      Audit log written
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │     CANONICAL PUBLIC LISTING GATE     │
         │  getPublicMarketplaceListings(type)   │
         │  Criteria:                            │
         │  - status === 'ACTIVE'                │
         │  - pricing.provenance === 'VERIFIED'  │
         │  - deterministic image resolver       │
         └───────────────────┬───────────────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
     GET /api/stays   GET /api/rentals  GET /api/guides
            │                │                │
            ▼                ▼                ▼
       /stays page     /rentals page    /guides page
            │                │                │
            └────────────────┼────────────────┘
                             │
                             ▼
                    [ REAL TOURIST USER ]
```

---

## 2. Public Listing Eligibility Rules
A listing is publicly accessible **only** when all of the following conditions are met:
1. `status === 'ACTIVE'`
2. `pricing.amount != null` and `pricing.amount > 0`
3. `pricing.provenance === 'VERIFIED'` (or explicitly verified government KMVN rate).
4. No draft, pending, rejected, suspended, or revoked records may be returned to unauthenticated public visitors.
5. Filtering is executed strictly server-side in MongoDB queries.

---

## 3. Image Governance & Deterministic Resolution
Every entity rendered on the marketplace must pass through `resolveEntityImage(entity, entityType)`:

```javascript
resolveEntityImage(entity, entityType)
```

### Deterministic Priority Order:
1. **Entity-Specific Verified Image:**
   Direct URLs from `entity.images[0].url`, `entity.coverImage.url`, or `entity.profileImage`.
2. **Entity-Specific Stored Asset:**
   Exact match in curated directory (e.g. `DESTINATION_NAMED_IMAGES[slug]`).
3. **Documented Source with Provenance:**
   Verified Wikimedia Commons asset with license & attribution preserved.
4. **Category-Specific Brand Placeholder:**
   Brand-compliant SVG data URI dynamically watermarked with the exact entity name and category.

### Strict Governance Rules (Zero Tolerance):
- ❌ **Zero Cross-Category Bleed:** A Stay must never display a vehicle; a Rental must never display a hotel or mountain peak; a Guide must never display a room or bike.
- ❌ **Zero Random Image Pools:** `Math.random()`, array-index modulos, and random Unsplash keywords are strictly prohibited.
- ❌ **Zero AI-Generated Listing Imagery:** Artificial landscapes or fictitious vehicles are prohibited.
- ❌ **Zero Array-Index Synthesized IDs:** Entities must always preserve their native database `_id`.

---

## 4. Pricing Provenance Classification
Every price rendered on the platform carries an immutable provenance indicator:

| Provenance | Meaning | Public Visibility & Booking Gate |
|---|---|---|
| `VERIFIED` | Confirmed by admin review against government registration or official tariff. | ✅ Eligible for public listing and real booking. |
| `PARTNER_CLAIMED` | Submitted by partner but awaiting document verification. | ❌ Hidden from public marketplace until approved. |
| `ESTIMATED` | Statistical benchmark for trip planning tools only. | ⚠️ Displayed with "Estimated" label; cannot be booked directly. |
| `UNKNOWN` | No pricing data provided. | Displays *"Price not verified"*; bookings blocked. |

---

## 5. Security & Authorization Boundary
- **Public Endpoints:** `GET /api/stays`, `GET /api/rentals`, `GET /api/guides`, `GET /api/stays/:id`, etc.
  - Rate-limited and sanitized.
  - Never exposes partner contact credentials, bank details, or internal audit logs.
- **Partner Endpoints:** `POST /api/partners/me/listings`, `PATCH /api/partners/me/listings/:id`, etc.
  - Requires valid JWT + `partnerOnly` middleware.
  - Strictly scopes queries to `ownerUser: req.user._id`.
  - Partner cannot modify another partner's listing.
  - Partner cannot self-verify or self-activate.
- **Admin Endpoints:** `/api/admin/*`
  - Requires valid JWT + `adminOnly` middleware (`role === 'admin'`).
  - Mandatory audit log entry on any state transition.
