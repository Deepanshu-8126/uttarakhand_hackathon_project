# Task Plan: Clean Code, Directory Hygiene & Architecture Modularization

## Objective
Refactor and clean the full-stack codebase (Frontend & Backend, skipping `mobile_app/`), remove loose images/media from the root folder, break down monolithic codefiles into clean, maintainable modules (Anti-Slop), and enforce the Design System lock with zero regressions.

---

## Phases & Tasks

### Phase 1: Directory Hygiene & Asset Cleanup
- [x] 1.1 Relocate loose root media (`copilot_v3_verified.png`, `WhatsApp Video 2026-09-27 at 17.13.25.mp4`, and `UI/` screenshot files) into `docs/assets/archive/`
- [x] 1.2 Clean up temporary root scratch batch/PowerShell scripts (`test3.bat`, `test_backend2.bat`, `trim.ps1`, `trim2.ps1`)
- [x] 1.3 Verify repository root structure is pristine and well-organized

### Phase 2: Backend Clean Code & Monolith Decomposition
- [x] 2.1 Audit and decompose bloated `backend/controllers/partnerController.js` (1679 lines):
  - Extracted `partnerProfileController.js` (Onboarding, profile resolution, admin test auto-provisioning)
  - Extracted `partnerListingController.js` (Drafts, state transitions, attestation preparation, images, pricing)
  - Extracted `partnerOpsController.js` (Bookings, availability, ledger, expenses, analytics, reviews, documents, action items)
  - Re-exported via `partnerController.js` facade for 100% backward route compatibility
- [x] 2.2 Clean repetitive code smells, enforce Single Responsibility Principle, and explicit error boundaries

### Phase 3: Frontend Clean Code & Design System Lock
- [x] 3.1 Audit frontend directory and ensure design system tokens (`#0f3d2e`, `#fdfbf7`, stone borders) are cleanly structured
- [x] 3.2 Ensure zero inline styles, no broken mock references, and clean imports
- [x] 3.3 Verify responsive layouts across partner, admin, and marketplace views

### Phase 4: Verification & Regression Testing
- [x] 4.1 Run production build: `npm run build` in `Frontend/` (Passed: 0 errors in 2.02s)
- [x] 4.2 Verify backend health probe and live routing on port 5000 (Passed: status alive)
- [x] 4.3 Git status inspection and verification
