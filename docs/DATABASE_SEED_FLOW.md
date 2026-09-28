# Discovery Uttarakhand — Database Seed Flow
**Generated:** 2026-09-28

## 1. Seed Pipeline Architecture
```text
Source Datasets: backend/seed/*.json (7 Content Files + Planner Meta)
 ↓
Seed Execution: node backend/scripts/seed.js [--fresh]
 ↓
1. Schema & Count Validation (Enforces exact count invariants)
 ↓
2. Orphan Cleanup: col.model.deleteMany({ slug: { $nin: validSlugs } })
 ↓
3. Deterministic Upsert via bulkWrite:
   updateOne: {
     filter: { slug: doc.slug },
     update: { $set: doc },
     upsert: true
   }
 ↓
4. Mongoose Model Layer (models/Destination, Stay, Rental, Guide, etc.)
 ↓
5. MongoDB Atlas (Target Collections Populated & 2dsphere Indexed)
```

## 2. Invariants & Protection
- **Identity Key:** Unique `slug` field.
- **Duplicate Protection:** `bulkWrite` with upsert ensures rerunning the seed script never creates duplicate records.
- **Count Validation:** Expected counts (`destinations: 105`, `spiritual: 56`, `culture: 30`, `activities: 28`, `stays: 51`, `rentals: 9`, `guides: 190`) are strictly verified; mismatches abort the process.
