# BTM Admin — Tour & Product Architecture Audit (COMPLETE)

**Date:** 2026-08-12  
**Method:** Read-only database queries + codebase inspection  
**Status:** AWAITING REVIEW — no changes made

---

## 1. Database Record Counts

### `tours` table (legacy)
| Status | Count |
|--------|-------|
| Published | **17** |
| Draft | **1** |
| Archived | **2** |
| **Total** | **20** |

### `products` table (unified v2)
| Category | Status | Count |
|----------|--------|-------|
| morocco_tour | Published | **18** |
| morocco_tour | Draft | **16** |
| morocco_tour | Archived | **2** |
| student_trip | Published | **2** |
| student_trip | Draft | **3** |
| **All** | **All** | **41** |

### Key observation
The Dashboard "Total Tours: 20 (17 published · 1 draft)" reads from `tours`.  
The Products page "41 products · 20 published" reads from `products`.  
These are two entirely separate tables with separate data.

---

## 2. Record Overlap Analysis

### In `tours` but NOT in `products` (morocco_tour)
**Exactly 1 record:**

| tours.id | Title | Status | Days | Price | From | Has FAQs |
|----------|-------|--------|------|-------|------|----------|
| `4-days-marrakech-to-fes-through-the-sahara` | 4 Days Marrakech to Fes through the Sahara | DRAFT | 4 | From €390 | Marrakech | ✅ 12 FAQs |

- Created: 2026-08-11 (yesterday)
- SEO title: "4-Day Marrakech to Fes Tour via Sahara Desert"
- **NOT on the locked tours list**
- Has 12 FAQs in `tour_faqs` (linked via HARD FK to `tours.id`)
- Would lose FAQs if removed from `tours` without migrating `tour_faqs`

### In `products` (morocco_tour) but NOT in `tours`
**17 records:**

| products.id | Title | Status | Days | Price | From | Images |
|-------------|-------|--------|------|-------|------|--------|
| `4-day-marrakech-desert-trip` | Marrakech Desert trip | **PUBLISHED** | 4 | "From €" (⚠️ broken) | Marrakech | 0 |
| `3-day-fes-to-marrakech-via-desert` | 3 Day Morocco Desert Tour From Fes | draft | 3 | none | Fes | 0 |
| `4-days-fes-to-marrakech` | 4 Days Tour from Fes to Marrakech | draft | 4 | none | Fes | 0 |
| `5-day-exotic-sahara-desert` | 5 Day Morocco Desert Exploration Tour From Fes | draft | 5 | none | Fes | 0 |
| `desert-escape-gorges-trekking` | Desert escape and Gorges Trekking Tour | draft | 5 | none | Marrakech | 0 |
| `tangier-to-marrakech-desert` | Tangier to Marrakech Desert Tour | draft | 6 | none | Tangier | 0 |
| `casablanca-marrakech-ouzoud` | Casablanca to Marrakech, Fes & Ouzoud Falls | draft | 7 | none | Casablanca | 0 |
| `7-day-tangier-desert-tour` | From Tangier to Desert's Charms | draft | 7 | none | Tangier | 0 |
| `atlas-mountains-trekking-tour` | Atlas Mountains Morocco Tour | draft | 7 | none | Marrakech | 0 |
| `8-days-enchanting-southern-morocco` | Enchanting Southern Morocco | draft | 8 | none | Fes | 0 |
| `8-days-route-of-caravans` | The Route Of Caravans | draft | 8 | none | Tangier | 0 |
| `9-day-tour-from-casablanca` | Vibrant Morocco and Desert Escapades | draft | 9 | none | Casablanca | 0 |
| `9-days-ultimate-morocco` | The Ultimate Morocco | draft | 9 | none | Tangier | 0 |
| `10-days-imperial-cities-north` | Imperial Cities and Northern Morocco | draft | 10 | none | Tangier | 0 |
| `10-days-imperial-cities-coast` | Imperial Cities and Coast | draft | 10 | none | Fes | 0 |
| `13-days-real-morocco-uncovered` | Real Morocco Uncovered | draft | 13 | none | Tangier | 0 |
| `15-days-morocco-hidden-jewels` | Morocco's hidden Jewels | draft | 15 | none | Fes | 0 |

All 17 products were created on **2026-08-08**. These are NEW tours being built in the products system.

**The one published product with no matching tours record:**  
`4-day-marrakech-desert-trip` is PUBLISHED but has price `"From €"` (missing the amount) and 0 images. It is currently visible on the public website (via `products_public_read` RLS policy). **This tour is live but incomplete.**

### Status disagreements between matching records
**NONE.** All 19 records that exist in both tables have the same status in both.

---

## 3. Content Quality Comparison (Matching Records)

### JSONB storage format — critical finding

**`tours` table:** `itinerary`, `included`, `highlights` are stored as JSONB **strings** (doubly-encoded JSON-in-JSON).  
Example: `jsonb_typeof(itinerary) = 'string'` — the value is a JSON string like `"[{\"day\":1,...}]"`, not a parsed array.

**`products` table:** Same fields are stored as JSONB **arrays** (properly structured).  
Example: `jsonb_typeof(itinerary) = 'array'` — the value is `[{"day":1,...}]`.

This means **every `products` record has richer, properly structured content** compared to its corresponding `tours` record, even where title/price/status are identical. The `products` records are the canonical versions for all shared IDs.

**Content depth for shared records (products side, since tours can't be counted as arrays):**

| ID | Itin days (products) | Inclusions | Highlights |
|----|---------------------|------------|------------|
| authentic-morocco-tour | 14 | 11 | 12 |
| best-of-morocco | 13 | 10 | 10 |
| classic-morocco-tour | 14 | 11 | 12 |
| colors-of-morocco | 13 | 11 | 0 ⚠️ |
| hidden-treasures | 17 | 11 | 14 |
| iconic-morocco-journey | 15 | 11 | 13 |
| imperial-cities-sahara | 8 | 10 | 8 |
| landscapes-morocco | 10 | 10 | 10 |
| marrakech-to-fes-through-the-sahara | 4 | 9 | 10 |
| morocco-s-great-escape | 9 | 11 | 12 |
| morocco-signature-highlights | 12 | 11 | 12 |
| sahara-3-days | 2 | 7 | 10 |
| sahara-desert-dream | 3 | 9 | 8 |
| semester-at-sea | 4 | 5 | 6 |
| semester-fall | 4 | 5 | 6 |
| tea-nomads-desert | 5 | 9 | 10 |
| vibrant-morocco-and-desert | 9 | 10 | 9 |
| 3-days-marrakech-to-fes-desert-tour-via-the-sahara | 3 | 9 | 12 |
| 7-day-morocco-desert-coast-tour | 7 | 11 | 9 |

Note: `colors-of-morocco` has 0 highlights in products — may need manual review.

---

## 4. Locked Tours Verification

All 17 locked tours verified:

| Tour | In products | Status | Has images | Has SEO | In tours | Tours status |
|------|------------|--------|-----------|---------|----------|-------------|
| colors-of-morocco | ✅ | published | ✅ | ✅ | ✅ | published |
| classic-morocco-tour | ✅ | published | ✅ | ✅ | ✅ | published |
| morocco-signature-highlights | ✅ | published | ✅ | ✅ | ✅ | published |
| morocco-s-great-escape | ✅ | published | ✅ | ✅ | ✅ | published |
| vibrant-morocco-and-desert | ✅ | published | ✅ | ✅ | ✅ | published |
| authentic-morocco-tour | ✅ | published | ✅ | ✅ | ✅ | published |
| iconic-morocco-journey | ✅ | published | ✅ | ✅ | ✅ | published |
| hidden-treasures | ✅ | published | ✅ | ✅ | ✅ | published |
| imperial-cities-sahara | ✅ | published | ✅ | ✅ | ✅ | published |
| landscapes-morocco | ✅ | published | ✅ | ✅ | ✅ | published |
| best-of-morocco | ✅ | published | ✅ | ✅ | ✅ | published |
| 7-day-morocco-desert-coast-tour | ✅ | published | ✅ | ✅ | ✅ | published |
| marrakech-to-fes-through-the-sahara | ✅ | published | ✅ | ✅ | ✅ | published |
| tea-nomads-desert | ✅ | published | ✅ | ✅ | ✅ | published |
| 3-days-marrakech-to-fes-desert-tour-via-the-sahara | ✅ | published | ✅ | ✅ | ✅ | published |
| sahara-desert-dream | ✅ | published | ✅ | ✅ | ✅ | published |
| sahara-3-days | ✅ | published | ✅ | ✅ | ✅ | published |

**All 17 locked tours: ✅ Safe in products ✅ Published ✅ Have images ✅ Have SEO**

---

## 5. Dependency Map (Phase 2)

### Formal FK constraints

| Table | Column | References | Type |
|-------|--------|------------|------|
| `btm_pricing_rules` | `tour_id` | `tours.id` | HARD FK |
| `custom_tour_requests` | `tour_id` | `tours.id` | HARD FK |
| `nav_dropdown_tours` | `tour_id` | `tours.id` | HARD FK |
| `tour_accommodation_assignments` | `tour_id` | `tours.id` | HARD FK |
| `tour_days` | `tour_id` | `tours.id` | HARD FK |
| `tour_faqs` | `tour_id` | `tours.id` | HARD FK |
| `departures` | `product_id` | `products.id` | HARD FK |

**6 hard FKs point at `tours.id`. The `tours` table cannot be dropped or have IDs changed without first migrating all 6 dependent tables.**

### Soft text references (no FK enforcement, just text slug matching)

| Table | Column | Non-null rows / Total | Notes |
|-------|--------|----------------------|-------|
| `inquiries` | `tour_id` | 1 / 45 | 44 inquiries have no tour reference |
| `bookings` | `tour_id` | 0 / 0 | Empty table |
| `op_bookings` | `tour_id` | 0 / 1 | 1 booking with no tour |
| `testimonials` | `tour_id` | 2 / 6 | 2 testimonials linked to tours |
| `homepage_popular_tours` | `tour_id` | 10 / 10 | **5 IDs are STALE** (see below) |
| `analytics_events` | `tour_id` | 0 / 0 | Empty table |

### homepage_popular_tours — STALE ENTRIES FOUND

5 out of 10 entries reference tour IDs that do not exist in **either** `tours` or `products`:

| Sort | tour_id | In tours? | In products? |
|------|---------|-----------|-------------|
| 0 | best-of-morocco | ✅ published | ✅ published |
| 1 | landscapes-morocco | ✅ published | ✅ published |
| **2** | **real-morocco** | ❌ | ❌ |
| 3 | colors-of-morocco | ✅ published | ✅ published |
| 4 | imperial-cities-sahara | ✅ published | ✅ published |
| **5** | **hidden-jewels** | ❌ | ❌ |
| 6 | hidden-treasures | ✅ published | ✅ published |
| **7** | **desert-escape-gorges** | ❌ | ❌ |
| **8** | **fes-marrakech-4day** | ❌ | ❌ |
| **9** | **ultimate-morocco** | ❌ | ❌ |

The public site's `fetchPopularTourIds()` returns these stale IDs and then tries to match them to tour records in the context. The 5 stale IDs would silently produce no results — no crash, just missing popular tour slots on the homepage.

### nav_dropdown_tours — All Valid

| Type | Sort | tour_id | In tours | In products |
|------|------|---------|----------|------------|
| featured | 1 | best-of-morocco | ✅ | ✅ |
| featured | 2 | landscapes-morocco | ✅ | ✅ |
| featured | 3 | imperial-cities-sahara | ✅ | ✅ |
| popular | 0 | hidden-treasures | ✅ | ✅ |

All 4 nav dropdown entries are valid references to published tours in both tables.

### Admin components → table mapping

| Component | File | Reads | Writes |
|-----------|------|-------|--------|
| Dashboard | `src/pages/Dashboard.tsx` | `tours` | — |
| GlobalSearch | `src/components/layout/GlobalSearch.tsx` | `tours` (published), `products` (search) | — |
| ToursPage | `src/pages/tours/ToursPage.tsx` | `tours` | `tours` |
| TourForm | `src/pages/tours/TourForm.tsx` | `tours` | `tours` |
| ProductsPage | `src/pages/products/ProductsPage.tsx` | `products` | — |
| ProductForm | `src/pages/products/ProductForm.tsx` | `products` | `products` |
| DeparturesPage | `src/pages/departures/DeparturesPage.tsx` | `departures` (FK→`products`) | `departures` |
| PricingEnginePage | `src/pages/pricing/PricingEnginePage.tsx` | `tours` (published), `btm_pricing_rules`, `btm_seasons` | `btm_pricing_rules` |
| PopularToursPage | `src/pages/website/PopularToursPage.tsx` | `tours` | `homepage_popular_tours` |
| NavDropdownPage | `src/pages/website/NavDropdownPage.tsx` | `tours` | `nav_dropdown_tours` |
| TourFaqsTab | `src/pages/tours/TourFaqsTab.tsx` | `tour_faqs` | `tour_faqs` (FK→`tours.id`) |
| BookingWizard | `src/pages/bookings/BookingWizard.tsx` | `tours` (published) | — |

### API server routes → table mapping

| Route file | Table accessed |
|------------|---------------|
| `api/tours-router.ts` | `tours` (Drizzle ORM) |
| `api/pricing-router.ts` | `tours_v2` (raw SQL) |
| `api/v2/tours/*.ts` | `tours_v2` (raw SQL) |
| `api/v2/tours/[id]/faqs.ts` | `tour_faqs` |
| `api/v2/tours/[id]/itinerary.ts` | `tour_itinerary_days` |
| `api/v2/tours/[id]/highlights.ts` | `tour_highlights` |
| `api/v2/calendar/[tour_id]/*.ts` | `booking_calendar` |

No API endpoints currently read from the `products` table. Products are accessed exclusively through Supabase JS client in the admin frontend.

### Public site (`besttravelmorocco.com`)

| Function | File | Current table (post-last-session change) | Original table |
|----------|------|------------------------------------------|----------------|
| `fetchTours()` | `src/lib/dataSync.ts` | `tours` ⚠️ CHANGED (not deployed) | `products` (morocco_tour) |
| `fetchExperiences()` | `src/lib/dataSync.ts` | `products` (experience categories) | `products` (experience categories) |
| `fetchPopularTourIds()` | `src/lib/dataSync.ts` | `homepage_popular_tours` | `homepage_popular_tours` |

---

## 6. RLS Policy Findings

### `tours` table
- `public_read_tours`: `USING (true)` — **NO STATUS FILTER**
  - Any authenticated or anonymous user can read ALL tours including drafts and archived
  - This is a **security misconfiguration** — drafts and archived tours should not be publicly readable
  - In practice the public site adds `.eq('status','published')` in application code, but the DB-level policy doesn't enforce it
- `auth_write_tours`: `USING (true)` — authenticated users can write anything

### `products` table
- `products_public_read`: `USING (status = 'published')` — **correctly filtered** ✅
- `products_auth_all`: `USING (true)` — authenticated users full access ✅

---

## 7. Student Trips

| ID | Title | Status | Days | Price | Booking |
|----|-------|--------|------|-------|---------|
| `271a46da-2675-49cc-8ddc-57ebdf2e07df` | Morocco Student Adventure – Sahara Desert & Night Under the Stars | published | 4d | From €285 | fixed_departure |
| `81f4d782-feac-4546-b429-fd6d3893c057` | 3 Days - Sleeping Under the Stars | published | 3d | From €275 | inquiry |
| `5-day-sahara-discovery-students` | 5-Day Marrakech & Sahara Discovery (Round Trip) | draft | 5d | none | inquiry |
| `semester-at-sea-fall` | Semester At Sea Morocco Tour - Fall 2025 | draft | 6d | none | inquiry |
| `semester-at-sea-morocco` | Semester At Sea Morocco Adventure Tour | draft | 4d | none | inquiry |

Note: `semester-at-sea` and `semester-fall` exist in the legacy `tours` table (archived) and also as draft student_trip products. These are SEPARATE records for different contexts (the legacy tours ones are morocco_tour archived; the student_trip ones are different products).

Only 1 departure scheduled: the `271a46da-...` student trip departs 2026-09-03.

---

## 8. Issues Found

| # | Finding | Severity |
|---|---------|----------|
| 1 | `4-day-marrakech-desert-trip` is PUBLISHED but has broken price "From €" (missing amount) and 0 images | CRITICAL |
| 2 | 5 stale IDs in `homepage_popular_tours` reference non-existent tour slugs | HIGH |
| 3 | `public_read_tours` RLS has no status filter — drafts/archived tours publicly readable in DB | HIGH |
| 4 | `tour_faqs.tour_id → tours.id` is a HARD FK — new products cannot have FAQs without a matching `tours` record | HIGH |
| 5 | All `tours` JSONB fields are doubly-encoded strings, not arrays — data is degraded vs `products` | HIGH |
| 6 | `fetchTours()` in public site changed (last session) to read from `tours` — NOT DEPLOYED — if deployed, 17 new products-only tours would vanish from public site, including 1 published tour | HIGH |
| 7 | `4-days-marrakech-to-fes-through-the-sahara` exists in `tours` (draft, has 12 FAQs) but not in `products` | MEDIUM |
| 8 | Dashboard "New Tour" quick action → `/tours/new` → writes to legacy `tours` table, not `products` | MEDIUM |
| 9 | PricingEnginePage tour list reads from `tours`, not `products` | MEDIUM |
| 10 | PopularToursPage reads from `tours` to build the picker, should read `products` | MEDIUM |
| 11 | BookingWizard tour picker reads from `tours`, not `products` | MEDIUM |
| 12 | `colors-of-morocco` in products has 0 highlights entries — possible content gap | LOW |
| 13 | 16 draft products created 2026-08-08 have no price, no images — incomplete state | LOW |

---

*See `admin-tour-product-master-map.md` for the legacy-to-canonical tour ID mapping.*
