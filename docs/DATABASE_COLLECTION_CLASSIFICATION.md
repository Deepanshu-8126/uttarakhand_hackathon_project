# Discovery Uttarakhand — Database Collection Classification
**Document ID:** `AUDIT-M01-DB-CLASSIFICATION`  
**Date:** September 2026  
**Database:** MongoDB Atlas (Cluster 0)  
**Total Collections Detected:** 51  

---

## 1. Executive Policy on Database Integrity
In accordance with Rule 24 of the Real Marketplace Data Foundation specification:
- **No collections may be dropped.**
- **No records may be deleted blindly.**
- All collections must be classified into **Active Discovery Domain**, **Legacy**, **Foreign**, or **Unknown**.
- Destructive cleanup is strictly prohibited without explicit administrative instruction.

---

## 2. Classification Matrix

### Category A: Active Discovery Domain Collections (25 Collections)
These collections represent the live operational data of the Discovery Uttarakhand platform, powering the marketplace, auth, itineraries, safety, and community features.

| Collection Name | Document Count | Purpose & Usage in Codebase | Status |
|---|---|---|---|
| `stays` | 116 | Official KMVN rest houses, eco camps & heritage properties. | ACTIVE |
| `rentals` | 11 | Verified bike/scooter/car rental operators in Uttarakhand hubs. | ACTIVE |
| `guides` | 190 | Official Uttarakhand Tourism Development Board registered guides. | ACTIVE |
| `destinations` | 132 | High-altitude shrines, hill stations, lakes, and trekking hubs. | ACTIVE |
| `activities` | 32 | River rafting, paragliding, bungee jumping, and snow trekking. | ACTIVE |
| `spirituals` | 56 | Char Dham, Panch Kedar, Panch Prayag, and sacred temples. | ACTIVE |
| `cultures` | 30 | Pahadi festivals, folk instruments, cuisine, and artisanal crafts. | ACTIVE |
| `hidden_locations` | 12 | Offbeat and crowd-free Himalayan destinations. | ACTIVE |
| `partnerlistings` | 16 | Dynamic partner marketplace listings with verification lifecycle. | ACTIVE |
| `partners` | 4 | Registered tourism vendor profiles and business metadata. | ACTIVE |
| `users` | 22 | Tourist and partner user accounts with JWT auth and RBAC. | ACTIVE |
| `bookings` | 37 | Real booking reservations with immutable pricing snapshots. | ACTIVE |
| `payments` | 3 | Razorpay transaction records and payment statuses. | ACTIVE |
| `paymentwebhookevents`| 3 | Idempotency log for incoming Razorpay gateway webhook events. | ACTIVE |
| `verificationauditlogs`| 13 | Immutable administrative review and approval audit logs. | ACTIVE |
| `savedtrips` | 4 | User-created multi-day itineraries and trip planner saves. | ACTIVE |
| `favorites` | 3 | User wishlist and bookmarked attractions. | ACTIVE |
| `reviews` | 1 | Verified traveler ratings and textual reviews. | ACTIVE |
| `chats` | 13 | Live conversational sessions and travel advisory logs. | ACTIVE |
| `chathistories` | 3 | Historical chat transcripts. | ACTIVE |
| `sosalerts` | 22 | High-altitude and emergency SOS trigger logs. | ACTIVE |
| `sos` | 1 | Real-time safety broadcasts. | ACTIVE |
| `vehiclepermitrecords` | 2 | Green corridor entry and EV mountain permit registry. | ACTIVE |
| `complaints` | 1 | Tourist grievance and dispute records. | ACTIVE |
| `environmentdatas` | 1 | Real-time Himalayan air quality, weather, and AQI telemetry. | ACTIVE |

---

### Category B: Legacy Discovery Collections (6 Collections)
Collections created during previous phases or experiments that are currently empty (0 documents) or retained for backward schema compatibility.

| Collection Name | Document Count | History & Evaluation | Recommendation |
|---|---|---|---|
| `listings` | 0 | Early unified listing prototype; superseded by `partnerlistings`. | RETAIN (Empty, harmless) |
| `transports` | 0 | Old bus/taxi transit model; replaced by dynamic route services. | RETAIN (Empty, harmless) |
| `roadbulletins` | 0 | Precursor to `RoadBulletin.js` model. | RETAIN (Empty, harmless) |
| `notifications` | 0 | User notification queue model. | RETAIN (Empty, harmless) |
| `explorelaters` | 0 | Legacy bookmarking table; replaced by `favorites`. | RETAIN (Empty, harmless) |
| `partnerexpenses` | 0 | Partner P&L expense tracker; ready for active partner use. | RETAIN (Empty, harmless) |

---

### Category C: Foreign / Hackathon Multi-Tenant Boilerplate (20 Collections)
Collections with 0 documents inherited from boilerplate starters or other hackathon workspace templates (e.g. municipal urban planning or municipal resilience templates).

| Collection Name | Document Count | Classification | Safe Action |
|---|---|---|---|
| `adminloads` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `admins` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `trustscores` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `budgetdatas` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `projects` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `ethicsaudits` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `decisionscores` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `urbandnas` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `silentflags` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `resiliencescores` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `feedbackloops` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `disasteralerts` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `halls` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `certificates` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `fatigueindexes` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `communityreports` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `urbanmemories` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `officers` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `properties` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |
| `anomalylogs` | 0 | Foreign / Template Boilerplate | DO NOT TOUCH (0 docs) |

---

## 3. Summary & Conclusion
All 25 Active Discovery Domain collections are preserved and fully operational. Zero data loss will occur. Zero collections will be dropped.
