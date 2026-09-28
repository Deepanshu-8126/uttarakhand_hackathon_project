# Discovery Uttarakhand — Static Data Audit
**Generated:** 2026-09-28

| File Path | Records | Classification | Used By | MongoDB Conflict? | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Frontend/src/data/destinations.json` | 105 | **FALLBACK** | Offline network failover | Mirrors `destinations` collection | Redundant when DB online |
| `Frontend/src/data/stays.json` | 51 | **FALLBACK** | Offline network failover | Mirrors `stays` collection | Redundant when DB online |
| `Frontend/src/data/activities.json` | 28 | **FALLBACK** | Offline network failover | Mirrors `activities` collection | Redundant when DB online |
| `Frontend/src/data/spiritual.json` | 56 | **FALLBACK** | Offline network failover | Mirrors `spiritual` collection | Redundant when DB online |
| `Frontend/src/data/routes.json` | 8 | **CONFIG** | Route maps & corridors | Independent corridor rules | Active |
| `Frontend/src/data/verifiedTransports.js` | 12 | **RUNTIME** | Transit widget & guides | Transport schedule display | Active |
| `backend/seed/destinations.json` | 105 | **SEED** | `backend/scripts/seed.js` | Primary source of truth | Active seed |
| `backend/seed/stays.json` | 51 | **SEED** | `backend/scripts/seed.js` | Primary source of truth | Active seed |
| `backend/seed/rentals.json` | 9 | **SEED** | `backend/scripts/seed.js` | Primary source of truth | Active seed |
| `backend/seed/guides.json` | 190 | **SEED** | `backend/scripts/seed.js` | Primary source of truth | Active seed |
| `backend/seed/spiritual.json` | 56 | **SEED** | `backend/scripts/seed.js` | Primary source of truth | Active seed |
| `backend/seed/culture.json` | 30 | **SEED** | `backend/scripts/seed.js` | Primary source of truth | Active seed |
| `backend/seed/activities.json` | 28 | **SEED** | `backend/scripts/seed.js` | Primary source of truth | Active seed |
| `backend/seed/image-manifest.json` | 116 | **SEED METADATA** | Asset verification scripts | Image provenance verification | Active |
| `backend/seed/planner/gateway-hubs.json` | 6 | **CONFIG** | AI Planner gateway hubs | Used by `aiPlannerService.js` | Active |
| `backend/seed/planner/permit-rules.json` | 4 | **CONFIG** | Inner line permit validation | Used by `advisoryEngine.js` | Active |
| `backend/seed/planner/trek-meta.json` | 12 | **CONFIG** | Trek altitudes and seasons | Used by `altitudeGuardService.js` | Active |
