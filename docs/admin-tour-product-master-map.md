# BTM — Legacy-to-Canonical Tour Master Map

**Date:** 2026-08-12  
**Status:** READ-ONLY AUDIT — no changes made  
**Basis:** Live database query (read-only)

---

## Map Legend

| Relationship | Meaning |
|-------------|---------|
| SAME TOUR | Same ID, same title, same status, same metadata in both tables |
| LEGACY ONLY | Exists in `tours` but not in `products` |
| NEW TOUR | Exists in `products` (morocco_tour) but not in `tours` |
| DUPLICATE | Different IDs but same tour content |

| Confidence | Meaning |
|-----------|---------|
| 100% Confirmed | IDs match, titles match, all metadata confirmed identical |
| High | Strong indication based on title/duration/route |
| Needs Manual Review | Uncertain match — human inspection needed |

---

## Part 1 — Records Existing in BOTH Tables

All 19 shared records have: identical status, identical title, identical price, identical from_city, identical days.  
Note: JSONB content differs in format — `tours` stores as string (legacy), `products` stores as proper arrays (canonical).  
**`products` version is canonical for all shared records.**

| Legacy tours.id | Legacy Title | tours Status | Canonical products.id | products Title | products Status | Relationship | Confidence | Canonical Version |
|-----------------|-------------|-------------|-----------------------|----------------|-----------------|-------------|-----------|------------------|
| `iconic-morocco-journey` | Iconic Morocco Journey | published | `iconic-morocco-journey` | Iconic Morocco Journey | published | SAME TOUR | 100% Confirmed | **products** |
| `authentic-morocco-tour` | Authentic Morocco Tour | published | `authentic-morocco-tour` | Authentic Morocco Tour | published | SAME TOUR | 100% Confirmed | **products** |
| `3-days-marrakech-to-fes-desert-tour-via-the-sahara` | 3 Days Marrakech to Fes via Desert Trip | published | `3-days-marrakech-to-fes-desert-tour-via-the-sahara` | 3 Days Marrakech to Fes via Desert Trip | published | SAME TOUR | 100% Confirmed | **products** |
| `vibrant-morocco-and-desert` | Across Authentic Morocco | published | `vibrant-morocco-and-desert` | Across Authentic Morocco | published | SAME TOUR | 100% Confirmed | **products** |
| `morocco-s-great-escape` | Morocco's Great Escape | published | `morocco-s-great-escape` | Morocco's Great Escape | published | SAME TOUR | 100% Confirmed | **products** |
| `morocco-signature-highlights` | Morocco Signature Highlights | published | `morocco-signature-highlights` | Morocco Signature Highlights | published | SAME TOUR | 100% Confirmed | **products** |
| `marrakech-to-fes-through-the-sahara` | Marrakech to Fes through the Sahara | published | `marrakech-to-fes-through-the-sahara` | Marrakech to Fes through the Sahara | published | SAME TOUR | 100% Confirmed | **products** |
| `classic-morocco-tour` | Classic Morocco Tour | published | `classic-morocco-tour` | Classic Morocco Tour | published | SAME TOUR | 100% Confirmed | **products** |
| `colors-of-morocco` | Colors of Morocco | published | `colors-of-morocco` | Colors of Morocco | published | SAME TOUR | 100% Confirmed | **products** |
| `7-day-morocco-desert-coast-tour` | 7-Day Atlas Mountains, Sahara Desert & Atlantic Coast Tour | published | `7-day-morocco-desert-coast-tour` | 7-Day Atlas Mountains, Sahara Desert & Atlantic Coast Tour | published | SAME TOUR | 100% Confirmed | **products** |
| `sahara-desert-dream` | Sahara Desert Dream | published | `sahara-desert-dream` | Sahara Desert Dream | published | SAME TOUR | 100% Confirmed | **products** |
| `sahara-3-days` | The Sahara in 2 Days | published | `sahara-3-days` | The Sahara in 2 Days | published | SAME TOUR | 100% Confirmed | **products** |
| `tea-nomads-desert` | 5 Days Tea with Nomads tour | published | `tea-nomads-desert` | 5 Days Tea with Nomads tour | published | SAME TOUR | 100% Confirmed | **products** |
| `imperial-cities-sahara` | Imperial Cities & The Sahara | published | `imperial-cities-sahara` | Imperial Cities & The Sahara | published | SAME TOUR | 100% Confirmed | **products** |
| `landscapes-morocco` | Landscapes of Morocco | published | `landscapes-morocco` | Landscapes of Morocco | published | SAME TOUR | 100% Confirmed | **products** |
| `best-of-morocco` | The Best of Morocco | published | `best-of-morocco` | The Best of Morocco | published | SAME TOUR | 100% Confirmed | **products** |
| `hidden-treasures` | Morocco's Hidden Treasures | published | `hidden-treasures` | Morocco's Hidden Treasures | published | SAME TOUR | 100% Confirmed | **products** |
| `semester-at-sea` | Semester At Sea Morocco Adventure Tour | archived | `semester-at-sea` | Semester At Sea Morocco Adventure Tour | archived | SAME TOUR | 100% Confirmed | **products** |
| `semester-fall` | Semester At Sea Morocco Tour - Fall 2025 | archived | `semester-fall` | Semester At Sea Morocco Tour - Fall 2025 | archived | SAME TOUR | 100% Confirmed | **products** |

---

## Part 2 — LEGACY ONLY (in `tours`, not in `products`)

| tours.id | Title | Status | Days | Price | Created | Has FAQs | Risk if deleted |
|----------|-------|--------|------|-------|---------|----------|----------------|
| `4-days-marrakech-to-fes-through-the-sahara` | 4 Days Marrakech to Fes through the Sahara | DRAFT | 4d | From €390 | 2026-08-11 | ✅ 12 FAQs (HARD FK) | Loses 12 FAQs |

**Status:** This is a newly created DRAFT tour (yesterday, 2026-08-11), not yet published, not on the public website. It was created through the legacy `/tours/new` route and does not yet exist in `products`. Before this tour can be moved to the `products` system, its FAQs must be accounted for (since `tour_faqs.tour_id → tours.id` is a hard FK).

**Recommendation:** HOLD. Do not migrate until approved. Decide: should this tour be recreated in `products` with the same slug, or should it remain in the legacy system until the migration plan is finalized?

---

## Part 3 — NEW TOURS (in `products`, not in `tours`)

### Published (live on website now if fetchTours reads products)

| products.id | Title | Status | Days | Price | Issues |
|-------------|-------|--------|------|-------|--------|
| `4-day-marrakech-desert-trip` | Marrakech Desert trip | **PUBLISHED** | 4d | "From €" | ⚠️ Broken price, 0 images |

**This tour is currently published in `products` and would appear on the public website IF `fetchTours()` reads from `products` (original config).** With the last-session change (reading from `tours`), it would NOT appear (not in `tours`).

Requires manual review: set a real price and add at least 1 image before it is appropriate to be published.

### Draft (not visible anywhere)

All 16 created 2026-08-08. None are published. None have prices. None have images. Some have itinerary content, others have 0 itinerary days.

| products.id | Title | Days | Itin | Status |
|-------------|-------|------|------|--------|
| `3-day-fes-to-marrakech-via-desert` | 3 Day Morocco Desert Tour From Fes | 3d | 3d itin | draft |
| `4-days-fes-to-marrakech` | 4 Days Tour from Fes to Marrakech | 4d | 4d itin | draft |
| `5-day-exotic-sahara-desert` | 5 Day Morocco Desert Exploration Tour From Fes | 5d | 5d itin | draft |
| `desert-escape-gorges-trekking` | Desert escape and Gorges Trekking Tour | 5d | 5d itin | draft |
| `tangier-to-marrakech-desert` | Tangier to Marrakech Desert Tour | 6d | 6d itin | draft |
| `casablanca-marrakech-ouzoud` | Casablanca to Marrakech, Fes & Ouzoud Falls | 7d | 7d itin | draft |
| `7-day-tangier-desert-tour` | From Tangier to Desert's Charms | 7d | 7d itin | draft |
| `atlas-mountains-trekking-tour` | Atlas Mountains Morocco Tour | 7d | 7d itin | draft |
| `8-days-enchanting-southern-morocco` | Enchanting Southern Morocco | 8d | 0d itin | draft |
| `8-days-route-of-caravans` | The Route Of Caravans | 8d | 0d itin | draft |
| `9-day-tour-from-casablanca` | Vibrant Morocco and Desert Escapades | 9d | 9d itin | draft |
| `9-days-ultimate-morocco` | The Ultimate Morocco | 9d | 0d itin | draft |
| `10-days-imperial-cities-north` | Imperial Cities and Northern Morocco | 10d | 10d itin | draft |
| `10-days-imperial-cities-coast` | Imperial Cities and Coast | 10d | 0d itin | draft |
| `13-days-real-morocco-uncovered` | Real Morocco Uncovered | 13d | 0d itin | draft |
| `15-days-morocco-hidden-jewels` | Morocco's hidden Jewels | 15d | 0d itin | draft |

**These are safely invisible** (draft, no images, no price). They represent new tours in progress.

**Limitation:** These 17 products cannot receive FAQs yet because `tour_faqs.tour_id → tours.id` is a hard FK, and none of these 17 have matching `tours` records. Any attempt to add FAQs to these products via the admin will fail with a FK violation.

---

## Part 4 — Similarity Check: Potential Duplicates or Close Matches

Manual review needed for pairs that may represent the same tour under different slugs/titles:

| tours record | products record | Possible relationship | Confidence |
|-------------|----------------|----------------------|-----------|
| `4-days-marrakech-to-fes-through-the-sahara` (LEGACY ONLY, draft, 4d) | `4-days-fes-to-marrakech` (NEW, draft, 4d, Fes→Marrakech) | Possibly same route, reversed | Needs Manual Review |
| `semester-at-sea` (archived, 4d) | `semester-at-sea-morocco` (student_trip draft, 4d) | Different systems (morocco_tour vs student_trip) | High — different products |
| `semester-fall` (archived, 4d) | `semester-at-sea-fall` (student_trip draft, 6d) | Different systems, different duration | High — different products |

The two semester records in `tours` (archived) are essentially retired versions of what became the student_trip products. They should remain archived in `tours` and the student_trip products are the active versions.

---

## Summary

| Count | Category |
|-------|---------|
| 19 | SAME TOUR (identical in both tables; products is canonical) |
| 1 | LEGACY ONLY (4-days-marrakech-to-fes-through-the-sahara, draft, has 12 FAQs) |
| 1 | NEW PUBLISHED (4-day-marrakech-desert-trip, incomplete — broken price, 0 images) |
| 16 | NEW DRAFT (products only, no price/images, safe to ignore for now) |
| **37** | **Total unique tours across both systems** |
