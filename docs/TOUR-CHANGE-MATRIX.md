# BTM — Tour Change Matrix

**Date:** 2026-08-12  
**Status:** PLANNING DOCUMENT — Read-only. No changes made. Awaiting explicit per-row approval.  
**Legend:**

| Symbol | Meaning |
|--------|---------|
| ✅ | Already correct / no change needed |
| ⚠️ | Change required |
| 🚨 | Critical — high risk if wrong |
| 🔒 | Locked — never modify |
| ❌ | Currently wrong / broken |

**Risk levels:** ZERO / VERY LOW / LOW / MEDIUM / HIGH / CRITICAL

---

## Section 1 — Data Sources

| Area | Current Source (production) | Target Source | Change Required? | Risk | Staging Required? | Production Approval Required? | Rollback Method |
|------|-----------------------------|---------------|-----------------|------|------------------|-------------------------------|----------------|
| Public tours listing | `products` WHERE category='morocco_tour' AND status='published' | same | ✅ No change | ZERO | — | — | — |
| Public tour detail pages | `products` by slug | same | ✅ No change | ZERO | — | — | — |
| Admin tour listing (ProductsPage) | `products` all categories | same | ✅ No change | ZERO | — | — | — |
| Admin edit tour (ProductForm) | `products` by id | same | ✅ No change | ZERO | — | — | — |
| Admin new tour workflow | `tours` (via /tours/new → TourForm) | `products` (via /products/new → ProductForm) | ⚠️ Change route target only | VERY LOW | Yes | Yes | Revert 1 line in Dashboard.tsx |
| Dashboard "Tours" stat counter | `tours` WHERE status='published' (shows 17) | `products` WHERE category='morocco_tour' (would show 18) | ⚠️ 1 query change | VERY LOW | Yes | Yes | `git revert` |
| Admin pricing engine tour list | `tours` WHERE status='published' (17 tours) | `products` WHERE category='morocco_tour' (18 tours) | ⚠️ 1 query change | LOW | Yes | Yes | `git revert` |
| Admin popular tours picker | `tours` table | `products` WHERE category='morocco_tour' | ⚠️ 1 query change | LOW | Yes | Yes | `git revert` |
| Admin nav dropdown picker | `tours` table | `products` WHERE category='morocco_tour' | ⚠️ 1 query change | LOW | Yes | Yes | `git revert` |
| Admin booking wizard tour picker | `tours` table | `products` WHERE category='morocco_tour' | ⚠️ 1 query change | LOW | Yes | Yes | `git revert` |
| Admin global search (tours part) | Mixed `tours` + `products` | `products` only | ⚠️ Query consolidation | LOW | Yes | Yes | `git revert` |

---

## Section 2 — Public Website URLs and SEO

| Area | Current State | Target State | Change Required? | Risk | Staging Required? | Production Approval Required? | Rollback Method |
|------|-----------------------------|---------------|-----------------|------|------------------|-------------------------------|----------------|
| Tour URL structure (`/tours/:slug`) | `products.slug` values | same | ✅ No change | ZERO | — | — | — |
| 17 locked tour URLs | All returning HTTP 200, published in `products` | Unchanged | ✅ No change | ZERO | — | — | — |
| `4-day-marrakech-desert-trip` URL | Currently live and routable (broken content) | Set to draft → URL would 404 or redirect | ⚠️ Decision required (see §13 in plan) | LOW | Yes | Yes | Re-publish via admin |
| Sitemap | Does not include `4-day-marrakech-desert-trip` | Unchanged | ✅ No change needed | ZERO | — | — | — |
| SEO titles (17 locked tours) | Correct in `products` | 🔒 Never touch | ✅ No change | ZERO | — | — | — |
| SEO descriptions (17 locked tours) | Correct in `products` | 🔒 Never touch | ✅ No change | ZERO | — | — | — |
| Canonical URLs | Set in TourDetail component | 🔒 Never touch | ✅ No change | ZERO | — | — | — |
| Robots.txt | Unchanged | Unchanged | ✅ No change | ZERO | — | — | — |
| Redirects (vercel.json) | 🔒 Do not touch | Unchanged | ✅ No change | ZERO | — | — | — |

---

## Section 3 — Admin UI Labels

| Area | Current Label | Target Label | Change Required? | Risk | Staging Required? | Production Approval Required? | Rollback Method |
|------|-----------------------------|---------------|-----------------|------|------------------|-------------------------------|----------------|
| Sidebar section header | "WEBSITE & CONTENT PRODUCTS" | "TOURS" | ⚠️ Label only | ZERO | Yes (smoke test) | Yes | `git revert` |
| Sidebar nav item "All Products" | "All Products" | "All Tours" | ⚠️ Label only | ZERO | Yes | Yes | `git revert` |
| ProductsPage page title | "Products" | "Tours" | ⚠️ Label only | ZERO | Yes | Yes | `git revert` |
| ProductsPage "New Product" button | "New Product" | "New Tour" | ⚠️ Label only | ZERO | Yes | Yes | `git revert` |
| ProductForm breadcrumb (create) | "New Product" | "New Tour" | ⚠️ Label only | ZERO | Yes | Yes | `git revert` |
| ProductForm breadcrumb (edit) | "Edit Product" | "Edit Tour" | ⚠️ Label only | ZERO | Yes | Yes | `git revert` |
| DB table name `products` | `products` | 🔒 No change | ✅ No change | ZERO | — | — | — |
| DB category values | `morocco_tour`, `student_trip`, etc. | 🔒 No change | ✅ No change | ZERO | — | — | — |
| Admin routes `/products`, `/products/new`, `/products/:id/edit` | Unchanged | Unchanged | ✅ No change | ZERO | — | — | — |

---

## Section 4 — Database Tables

| Area | Current State | Target State | Change Required? | Risk | Staging Required? | Production Approval Required? | Rollback Method |
|------|-----------------------------|---------------|-----------------|------|------------------|-------------------------------|----------------|
| `products` table | 41 records (canonical) | Unchanged | ✅ No change | ZERO | — | — | — |
| `tours` table | 20 records (legacy) | Frozen/read-only (same data) | ✅ No change needed | ZERO | — | — | — |
| `tours` RLS policy `public_read_tours` | `USING (true)` — exposes drafts | `USING (status::text = 'published')` | ⚠️ Security fix | VERY LOW | Yes | Yes | DROP/CREATE policy |
| `tour_faqs` FK | `tour_id → tours.id` | `tour_id → products.id` (long term) | ⚠️ Long-term migration | MEDIUM | Yes | Yes | Reverse migration SQL |
| `btm_pricing_rules` FK | `tour_id → tours.id` | Unchanged (slug IDs are compatible) | ✅ No immediate change | ZERO | — | — | — |
| `nav_dropdown_tours` FK | `tour_id → tours.id` | Unchanged | ✅ No immediate change | ZERO | — | — | — |
| `tour_accommodation_assignments` FK | `tour_id → tours.id` | Unchanged | ✅ No immediate change | ZERO | — | — | — |
| `tour_days` FK | `tour_id → tours.id` | Unchanged | ✅ No immediate change | ZERO | — | — | — |
| `custom_tour_requests` FK | `tour_id → tours.id` | Unchanged | ✅ No immediate change | ZERO | — | — | — |
| `departures` FK | `product_id → products.id` | Unchanged | ✅ No change | ZERO | — | — | — |
| Drop `tours` table | N/A | 🚨 DO NOT DROP — 6 hard FKs still reference it | ❌ BLOCKED — do not do this | CRITICAL | — | — | — |

---

## Section 5 — Specific Tour Records

| Area | Current State | Target State | Change Required? | Risk | Staging Required? | Production Approval Required? | Rollback Method |
|------|-----------------------------|---------------|-----------------|------|------------------|-------------------------------|----------------|
| 17 locked tour records in `products` | Status=published, all content present | 🔒 No change | ✅ No change | ZERO | — | — | — |
| 17 locked tour records in `tours` | Status=published, legacy copies | 🔒 No change | ✅ No change | ZERO | — | — | — |
| `4-day-marrakech-desert-trip` (products) | Published, broken price, 0 images | Set to draft OR fix price+images | ⚠️ Decision required | LOW | No (admin action) | Yes | Re-publish via admin |
| `4-days-marrakech-to-fes-through-the-sahara` (tours) | Draft, full content, 12 FAQs (6 unique duplicated 2×) | Hold — awaiting FAQ migration strategy | ✅ No change for now | ZERO | — | — | — |
| 16 new draft products (created 2026-08-08) | Draft, no price, no images | Hold as draft | ✅ No change | ZERO | — | — | — |
| Archived records (`semester-at-sea`, `semester-fall`) | Archived in both tables | 🔒 No change | ✅ No change | ZERO | — | — | — |
| Duplicate FAQs on legacy draft | 12 rows = 6 unique questions × 2 | Remove 6 duplicate rows (admin cleanup) | ⚠️ Admin action only (if FAQ migration proceeds) | VERY LOW | No | Yes | Re-insert the removed rows |

---

## Section 6 — Homepage

| Area | Current State | Target State | Change Required? | Risk | Staging Required? | Production Approval Required? | Rollback Method |
|------|-----------------------------|---------------|-----------------|------|------------------|-------------------------------|----------------|
| `homepage_popular_tours` slot 0 (`best-of-morocco`) | ✅ Valid, published | Unchanged | ✅ No change | ZERO | — | — | — |
| `homepage_popular_tours` slot 1 (`landscapes-morocco`) | ✅ Valid, published | Unchanged | ✅ No change | ZERO | — | — | — |
| `homepage_popular_tours` slot 2 (`real-morocco`) | ❌ Stale ID — empty slot on homepage | Replace with valid published tour | ⚠️ Admin action | LOW | No (admin action) | Yes | Re-insert stale ID (harmless) |
| `homepage_popular_tours` slot 3 (`colors-of-morocco`) | ✅ Valid, published | Unchanged | ✅ No change | ZERO | — | — | — |
| `homepage_popular_tours` slot 4 (`imperial-cities-sahara`) | ✅ Valid, published | Unchanged | ✅ No change | ZERO | — | — | — |
| `homepage_popular_tours` slot 5 (`hidden-jewels`) | ❌ Stale ID — empty slot on homepage | Replace with valid published tour | ⚠️ Admin action | LOW | No | Yes | Re-insert stale ID |
| `homepage_popular_tours` slot 6 (`hidden-treasures`) | ✅ Valid, published | Unchanged | ✅ No change | ZERO | — | — | — |
| `homepage_popular_tours` slot 7 (`desert-escape-gorges`) | ❌ Stale ID — empty slot on homepage | Replace with valid published tour | ⚠️ Admin action | LOW | No | Yes | Re-insert stale ID |
| `homepage_popular_tours` slot 8 (`fes-marrakech-4day`) | ❌ Stale ID — empty slot on homepage | Replace with valid published tour | ⚠️ Admin action | LOW | No | Yes | Re-insert stale ID |
| `homepage_popular_tours` slot 9 (`ultimate-morocco`) | ❌ Stale ID — empty slot on homepage | Replace with valid published tour | ⚠️ Admin action | LOW | No | Yes | Re-insert stale ID |

---

## Section 7 — Uncommitted Local Changes

| Area | Current State | Target State | Change Required? | Risk | Staging Required? | Production Approval Required? | Rollback Method |
|------|-----------------------------|---------------|-----------------|------|------------------|-------------------------------|----------------|
| `dataSync.ts` (public site) | Local uncommitted change reads from `tours` | Discard — restore to committed version (reads `products`) | 🚨 Must discard before any build/deploy | CRITICAL if deployed | No staging — just `git checkout` | N/A (local file, not deployed) | Already committed HEAD is correct; `git checkout src/lib/dataSync.ts` |
| `App.tsx` (public site) | Local uncommitted change adds `StudentTripDetail` route | Separate decision — this is new student trips feature in progress | ⚠️ Do not discard without checking if this is intentional work-in-progress | LOW | Separate branch | Yes, when ready | `git checkout src/App.tsx` if unintended |

---

## Section 8 — Navigation

| Area | Current State | Target State | Change Required? | Risk | Staging Required? | Production Approval Required? | Rollback Method |
|------|-----------------------------|---------------|-----------------|------|------------------|-------------------------------|----------------|
| `nav_dropdown_tours` rows | 4 entries reading from `tours` table | Admin picker source changes to `products` (data unchanged) | ⚠️ Admin UI query only | LOW | Yes | Yes | `git revert` |
| Public site navbar tour links | Pull from `nav_dropdown_tours` via existing API | Unchanged | ✅ No change | ZERO | — | — | — |

---

## Section 9 — Pricing and Bookings

| Area | Current State | Target State | Change Required? | Risk | Staging Required? | Production Approval Required? | Rollback Method |
|------|-----------------------------|---------------|-----------------|------|------------------|-------------------------------|----------------|
| `btm_pricing_rules` data | References `tours.id` slug values (hard FK) | Unchanged (slug IDs are identical in both tables) | ✅ No data change | ZERO | — | — | — |
| Pricing engine tour picker (admin) | Reads `tours` (17 tours shown) | Reads `products` WHERE category='morocco_tour' (18 tours shown) | ⚠️ 1 query change | LOW | Yes | Yes | `git revert` |
| Pricing rule write operations | Writes `tour_id` to `btm_pricing_rules` | Unchanged (same slug value) | ✅ No change | ZERO | — | — | — |
| Booking flow | Reads `tours` for tour selection | Reads `products` WHERE category='morocco_tour' | ⚠️ 1 query change | LOW | Yes | Yes | `git revert` |
| Existing booking records | tour_id is text slug (no FK) | Unchanged | ✅ No change | ZERO | — | — | — |
| Existing inquiry records | tour_id is text slug (1 row) | Unchanged | ✅ No change | ZERO | — | — | — |

---

## Summary — Changes by Category

| Category | No Change | Admin Action Only | Code Change | DB Schema Change | Total Changes |
|----------|-----------|------------------|-------------|-----------------|---------------|
| Data sources | 5 | 0 | 6 | 0 | 6 code changes |
| URLs / SEO | 8 | 1 (4-day-marrakech draft) | 0 | 0 | 1 decision needed |
| Admin UI labels | 5 | 0 | 5 | 0 | 5 label-only |
| Database tables | 9 | 0 | 0 | 2 (RLS fix, tour_faqs FK) | 2 DB changes (long term) |
| Tour records | 3 | 2 (4-day-marrakech, FAQ dedup) | 0 | 0 | 2 admin decisions needed |
| Homepage | 5 | 5 (stale slot replacements) | 0 | 0 | 5 admin actions needed |
| Uncommitted changes | 0 | 0 | 2 (discard/handle) | 0 | 1 critical (discard dataSync.ts change) |
| Navigation | 1 | 0 | 1 | 0 | 1 code change |
| Pricing/bookings | 5 | 0 | 2 | 0 | 2 code changes |

**Total items requiring action: ~24**  
**Items that require DB schema changes: 2** (low urgency — can be deferred)  
**Items that require production deployment: ~14** (all non-trivial code changes)  
**Admin-only actions (no deploy needed): ~8** (tour status, homepage popular tours, FAQ cleanup)  
**Zero-risk no-change items: ~36**

---

*End of change matrix. No changes made. Awaiting explicit per-item approval.*
