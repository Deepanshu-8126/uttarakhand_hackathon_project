# AI Trip Planner & Budget Engine Audit Report

## 1. CURRENT FLOW
- **User Prompt**: User types in natural language (e.g. `"Mujhe Kedarnath jana hai, 5 din, 2 log, Rs 15,000 budget"`).
- **Frontend Layer**: `TripPlanner.jsx` uses a client-side regex `extractEntitiesFromText` and sends POST to `/api/chat/stream` or `/api/agent/chat`.
- **Backend Layer**: `agentController.js` / `agentRouter.js` / `ConversationMemory` extracts entities from message text and stores them in session context (`contextEntities`).
- **Response Flow**: Server streams SSE events (`data: { entities, message, suggestions }`) or JSON.
- **UI State**: `TripPlanner.jsx` manages `tripBrief` state for the right-side panel ("Trip Brief").
- **Budget Calculation**: `TripPlanner.jsx` had a client-side `calcBudget` fallback function multiplying hardcoded numbers (`stayPN = 2600`, `foodPD = 800`).

---

## 2. BROKEN POINTS & ROOT CAUSES

### A. Missing / Disconnected Property Name Mapping
- **Root Cause**: Backend returns entity fields named `duration` (number or string like `"5 Days"`), `durationDays` (number `5`), `travelers` (number `2`), `budget` (number `15000`), `destination` (`"Kedarnath"`).
- **Frontend Defect**: `TripPlanner.jsx` checked `parsed.entities.numDays` instead of normalizing `duration` / `durationDays` / `numDays`. Because `numDays` was `undefined` in server response, `tripBrief.numDays` remained `null`, resulting in **DURATION: Not set** and **0/5 filled**!

### B. Narrow / Flawed Natural Language Budget Extraction Regex
- **Root Cause**:
  - `TripPlanner.jsx` regex required the word `budget`, `rs`, or `rupay` immediately after/before numbers, failing on:
    - `"Rs 15,000"` (with comma and space)
    - `"15k"` / `"15k mein"` (without `budget` keyword)
    - `"15 hazar"` / `"15 hazaar"`
    - `"5000 ke andar"`
    - `"mera budget 15k hai"`
    - `"20k tak"`
- **Fix**: Implement unified, robust extraction parser across backend and frontend supporting all Hindi/Hinglish/English variations (15k -> 15000, 15 hazar -> 15000, Rs 15,000 -> 15000).

### C. Defective Context Merging (Loss & Sticky States)
- **Root Cause**: `mergeEntities` in `TripPlanner.jsx` checked `if (extracted.budget && !prev.budget)`.
  - This prevented users from updating an existing field (e.g. `"isko 12k karo"` ignored because `prev.budget` was already 15000!).
  - Furthermore, partial context updates overwrote missing fields if context object replaced `prev` state completely.
- **Fix**: Always merge non-null new values into previous state while allowing explicit field updates/overrides.

### D. Duplicate / Fake Frontend Budget Calculation
- **Root Cause**: `TripPlanner.jsx` contained a client-side `calcBudget` function that estimated budget with hardcoded formulas instead of calling server-side `POST /api/budget/calculate`.
- **Fix**: Remove client-side hardcoded budget calculator and wire `tripBrief` changes directly to `POST /api/budget/calculate` powered by `BudgetEngine.js`.

---

## 3. COMPREHENSIVE FIX PLAN

1. **Unified Entity Extractor (`utils/entityExtractor.js` & `backend/services/entityExtractor.js`)**:
   - Extract `destination`, `duration` / `numDays`, `travelers`, `budget`, `origin`, `startDate`, `transport`.
   - Support `15k`, `15 hazar`, `₹15,000`, `Rs 15000`, `5000 ke andar`, `budget 20k`, `2 log`, `5 din`.

2. **Canonical State Alignment (`tripBrief` & `useMapStore`)**:
   - Standardize properties: `{ destination, numDays, durationDays, budget, travelers, origin, transport, vibes, startingLocation, pace }`.
   - Ensure reactive update to `Trip Brief` UI component (showing `4/5 filled` immediately on single multi-entity prompt).

3. **Context Memory Preservation**:
   - Merging rules: New valid values overwrite old ones (allowing modification like `"budget 12k karo"`), while unmentioned previous fields are retained.

4. **Integration with `BudgetEngine.js` via `POST /api/budget/calculate`**:
   - Call server-side `BudgetEngine.calculateBudget` whenever `tripBrief` changes (or when generate is clicked).
   - Display real database tariffs (KMVN, UTC, verified Stays, Rentals, Guides) with `VERIFIED`, `ESTIMATED`, and `UNKNOWN` classification.
   - Detect `OVER_BUDGET` status when `totalMinCost > targetBudgetCap`.

5. **E2E Testing & Verification**:
   - Create `backend/scripts/test_budget_engine_e2e.js`.
   - Run `npm run build` on `Frontend/`.
   - Produce `docs/BUDGET_SYSTEM_FINAL_REPORT.md`.
