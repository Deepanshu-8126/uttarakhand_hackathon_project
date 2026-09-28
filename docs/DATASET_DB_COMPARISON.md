# DISCOVERY UTTARAKHAND — DATASET VS DATABASE COMPARISON REPORT
**Document:** `docs/DATASET_DB_COMPARISON.md`  
**Date:** September 28, 2026  
**Auditor:** Senior Data Architecture & Database Debugging Engineer  
**Database Audited:** MongoDB (`discovery_uttarakhand` on `127.0.0.1:27017` & Production Atlas)  

---

## 1. Quantitative Discrepancy Matrix

| Entity | Canonical Seed Dataset | Current Local MongoDB | Live Production Render | Delta (DB vs Seed) | Diagnosis |
|---|---|---|---|---|---|
| **Destinations** | 129 records | 105 records | 129 records | **-24 missing in local DB** | Local DB ran stale `seed.js` with hardcoded 105 limit |
| **Stays** | 86 records (81 seed + 5 budget) | 51 records | 86 records | **-35 missing in local DB** | Local DB ran stale `seed.js` with hardcoded 51 limit |
| **Rentals** | 11 records | 9 records | 11 records | **-2 missing in local DB** | Rudrapur & Haldwani fleets missing in local DB |
| **Transport** | 8 records | 0 records | 8 records | **-8 missing in local DB** | Transports collection was omitted from legacy `seed.js` |
| **Guides** | 190 records | 190 records | 190 records | **0 (MATCH)** | 100% Verified |
| **Spiritual** | 56 records | 56 records | 56 records | **0 (MATCH)** | 100% Verified |
| **Culture** | 30 records | 30 records | 30 records | **0 (MATCH)** | 100% Verified |
| **Activities** | 28 records (+ 10 treks) | 28 records | 32 records | **0 (+4 enriched)** | 100% Verified |

---

## 2. Canonical Identity & Attribute Discrepancy Breakdown

### A. Destinations: 24 Missing from Local Database
The following 24 canonical destination records exist in `backend/seed/destinations.json` but were missing from local MongoDB because `seed.js` was hardcoded to abort if count was not exactly 105:
1. `mansa-devi-temple` (Mansa Devi Temple, Haridwar)
2. `triveni-ghat` (Triveni Ghat, Rishikesh)
3. `laxman-jhula-and-ram-jhula` (Laxman Jhula & Ram Jhula, Rishikesh)
4. `ganga-river-rafting` (Ganga River Rafting, Rishikesh)
5. `bungee-jumping-mohanchatti` (Bungee Jumping, Mohanchatti)
6. `neelkanth-mahadev-temple` (Neelkanth Mahadev Temple, Pauri Garhwal)
7. `vashistha-cave` (Vashistha Cave, Rishikesh)
8. `parmarth-niketan` (Parmarth Niketan Ashram, Rishikesh)
9. `beatles-ashram` (Beatles Ashram / Chaurasi Kutia, Rishikesh)
10. `jumpin-heights` (Jumpin Heights Adventure Zone)
11. `shivpuri` (Shivpuri River Camp, Rishikesh)
12. `kaudiyala` (Kaudiyala Rapid Transit Point)
13. `devprayag-sangam` (Devprayag Alaknanda-Bhagirathi Confluence)
14. `rudraprayag-sangam` (Rudraprayag Sangam)
15. `karanprayag-sangam` (Karnaprayag Sangam)
16. `nandaprayag-sangam` (Nandaprayag Sangam)
17. `vishnuprayag-sangam` (Vishnuprayag Sangam)
18. `joshimath` (Joshimath Gateway Town)
19. `mana-village` (Mana First Indian Village)
20. `vasudhara-falls` (Vasudhara Falls, Badrinath)
21. `pancheshwar-mahadev` (Pancheshwar Mahadev Temple, Champawat)
22. `mayawati-ashram` (Advaita Ashrama / Mayawati Ashram, Lohaghat)
23. `abbott-mount` (Abbott Mount Hill Station, Champawat)
24. `lohaghat` (Lohaghat Historic Valley)

### B. Stays: 35 Missing from Local Database
- 30 Stays from `backend/seed/stays.json` (e.g., GMVN Tourist Rest House Rishikesh, Zostel Rishikesh, Aloha on the Ganges, Shivpuri Adventure Camp, Hotel Ganga Lahari, KMVN Bageshwar, KMVN Chaukori, KMVN Didihat, KMVN Dharchula, etc.)
- 5 Authentic Budget Stays from `seed_famous_treks_and_budget_stays.js`:
  1. `sankri-himalayan-hikers-homestay` (Sankri, ₹600/night)
  2. `ghangaria-flower-eco-lodge` (Ghangaria, ₹550/night)
  3. `chopta-meadows-alpine-camp` (Chopta, ₹750/night)
  4. `raithal-village-heritage-homestay` (Raithal, ₹650/night)
  5. `lohajung-trekker-basecamp` (Lohajung, ₹500/night)

### C. Rentals: 2 Missing from Local Database
- `rudrapur-city-wheels-self-drive` (Rudrapur City Wheels & Self-Drive Hub, Udham Singh Nagar)
- `haldwani-himalayan-riders-self-drive` (Haldwani Himalayan Riders & Self-Drive Fleet, Nainital)

### D. Transports: All 8 Missing from Local Database
- `Kathgodam Shatabdi Express` (12040, New Delhi -> Kathgodam)
- `Dehradun Jan Shatabdi Express` (12055, New Delhi -> Dehradun)
- `UTC Interstate Express` (Delhi Anand Vihar -> Haldwani)
- `UTC Interstate Express` (Delhi Kashmiri Gate -> Dehradun)
- `UTC Highway Service` (Delhi -> Haridwar/Rishikesh)
- `UTC Kumaon Hill Service` (Haldwani -> Almora)
- `UTC Garhwal Hill Service` (Haridwar -> Srinagar Garhwal)
- `High Altitude Border Transit` (Shared 4x4 Mountain Vehicles, Dharchula -> Gunji)

---

## 3. Image & Asset Pipeline Findings

1. **Stays Image Override**: `getCardImages` in `Frontend/src/utils/imageHelpers.js` checked `item.image` and `item.coverImage` but ignored `item.images` array on stays, falling back to cyclic `MOUNTAIN_STAY_IMAGES[seed % 3]`.
2. **Random Photo Shuffling**: `getFreshImage` in `Frontend/src/utils/images.js` used `Math.random()` to pick photos from Pexels/cache on every invocation, causing image flicker and inconsistent UI displays.
3. **Transport Static Dependency**: `transportApi.js` was querying `/api/transports`, but because MongoDB `transports` had 0 records, the backend fell back to static JSON, causing transport responses to be tagged `isFallback: true`.

---

## 4. Operational Collections Safety Proof

The database contains critical operational and user collections:
- `users`: 18 accounts (Admin, Partner, Trekker) — **MUST BE PRESERVED**
- `bookings`: 78 confirmed/pending transactions — **MUST BE PRESERVED**
- `partnerlistings`: 27 verified host listings — **MUST BE PRESERVED**
- `vehiclepermitrecords`: 18 Green Card / Hill Endorsement permits — **MUST BE PRESERVED**
- `verificationauditlogs`: 66 Web3 cryptographic hash logs — **MUST BE PRESERVED**
- `savedtrips`: 4 user travel itineraries — **MUST BE PRESERVED**

**Strict Rule:** No destructive drop operations (`collection.drop()`, `deleteMany({})` on user/partner collections). Only deterministic upsert (`updateOne({ slug }, { $set }, { upsert: true })`) will be applied to content datasets.
