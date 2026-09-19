# BTM — Final Tour Architecture Implementation Plan

**Date:** 2026-08-12  
**Status:** PLANNING DOCUMENT — No changes made. Awaiting explicit per-item approval.  
**Authority:** All changes require explicit approval before execution.

---

## 1. Current Architecture

### Data Storage

| System | DB Table | Record Count | Used By |
|--------|----------|--------------|---------|
| Legacy tour system | `tours` | 20 (17 pub / 1 draft / 2 archived) | Dashboard, ToursPage, TourForm, PricingEngine, PopularToursPage, NavDropdownPage, BookingWizard, all 6 hard FKs |
| Canonical product system | `products` | 41 (20 pub / 19 draft / 2 archived) | ProductsPage, ProductForm, DeparturesPage, public website (production) |
| Pricing pipeline | `tours_v2` | unknown | api/v2/tours/*.ts, api/pricing-router.ts (server-side only) |

### Public Website Data Source (PRODUCTION — confirmed)
```
besttravelmorocco.com (production)
    → fetchTours() reads: products WHERE category='morocco_tour' AND status='published'
    → fetchExperiences() reads: products WHERE category IN (experience categories)
    → fetchPopularTourIds() reads: homepage_popular_tours.tour_id
```

### Local Working Tree (uncommitted — NOT production)
```
src/lib/dataSync.ts (LOCAL ONLY — previous session change, NOT committed, NOT deployed)
    → fetchTours() reads: tours WHERE status='published'
```
**This local change must be DISCARDED. It was never committed or deployed.**

### Admin Data Sources
```
admin.besttravelmorocco.com
    Sidebar tours/products: ProductsPage → products table
    Dashboard stat: reads tours table
    Dashboard "New Tour" button: → /tours/new → TourForm → tours table
    Pricing Engine: reads tours table (not products)
    Popular Tours admin: reads tours table (not products)
    Nav Dropdown admin: reads tours table (not products)
    Booking Wizard: reads tours table (not products)
```

---

## 2. Target Architecture

```
Admin UI (labeled "Tours", table stays named "products")
    ↓ ProductForm (for all tour creation)
    ↓ products table (canonical)
    ↓ status = 'published'
    ↓
besttravelmorocco.com (unchanged data source — products)
```

Admin terminology changes (UI only, no DB changes):
- "All Products" → "All Tours"
- "New Product" → "New Tour"
- "Products" section → "Tours"
- Sidebar Morocco Tours, Student Trips, etc. remain

No database tables renamed. No database tables dropped. No FKs changed yet.

---

## 3. Database Dependency Map

### Hard FK constraints on `tours.id` (6 total)

| Table | Column | FK Target | Current Record Count | Risk if tours.id changes |
|-------|--------|-----------|---------------------|--------------------------|
| `tour_faqs` | `tour_id` | `tours.id` | 17 tours have FAQs (145 FAQ rows) | FAQs become orphaned |
| `btm_pricing_rules` | `tour_id` | `tours.id` | unknown count | Pricing rules become orphaned |
| `nav_dropdown_tours` | `tour_id` | `tours.id` | 4 rows | Navbar tours become broken |
| `tour_accommodation_assignments` | `tour_id` | `tours.id` | unknown count | Accommodation assignments lost |
| `tour_days` | `tour_id` | `tours.id` | unknown count | Tour day data lost |
| `custom_tour_requests` | `tour_id` | `tours.id` | unknown count | Custom requests lose tour link |

### Hard FK on `products.id` (1)

| Table | Column | FK Target | Current Record Count |
|-------|--------|-----------|---------------------|
| `departures` | `product_id` | `products.id` | 1 departure (student trip, 2026-09-03) |

### Soft text references (no FK enforcement)

| Table | Column | Non-null rows | Notes |
|-------|--------|--------------|-------|
| `inquiries` | `tour_id` | 1 / 45 | Text slug, no FK |
| `testimonials` | `tour_id` | 2 / 6 | Text slug, no FK |
| `homepage_popular_tours` | `tour_id` | 10 / 10 | 5 are stale IDs (see §13) |
| `op_bookings` | `tour_id` | 0 / 1 | Text slug, no FK |
| `analytics_events` | `tour_id` | 0 / 0 | Empty table |

---

## 4. Canonical Source Decision

**`products` is the canonical source.** Reasons:

1. All 19 shared records have identical metadata in both tables; the `products` version has properly structured JSONB arrays while `tours` has doubly-encoded strings — `products` is structurally superior
2. The committed production code already reads from `products` (committed 2026-06-14)
3. The admin sidebar routes exclusively to `products`
4. `departures` table FK points to `products`
5. 17 tours exist only in `products` (new tours created after migration)
6. Migration 009 was explicitly designed to make `products` the future system

**`tours` is legacy/compatibility only.** It must remain because 6 hard FKs depend on it.

---

## 5. Legacy Table Strategy

`tours` table: **FROZEN. Read-only. Do not write to it. Do not drop it. Do not change its IDs.**

- The `tours` table will serve as the FK anchor for the 6 dependent tables until each is migrated
- No new records should be created in `tours`
- Existing records in `tours` must not be modified
- The Dashboard "New Tour" button must be redirected to `/products/new` so that all new tours go to `products`
- The `/tours` route and TourForm can remain accessible (as a read-only view) but should not be the primary workflow

---

## 6. Locked-Tour Protection Strategy

All 17 locked tours are confirmed present in `products` with:
- Status: published ✓
- Images: present ✓
- SEO title: present ✓
- SEO description: present ✓

**Protection rule:** Before ANY deployment that touches the public website data source, verify:
- All 17 locked tour IDs return HTTP 200 on their canonical URLs
- All 17 have status = 'published' in `products`
- All 17 price, title, description, SEO fields are unchanged
- No DB query touches these records

Locked tour IDs: colors-of-morocco, classic-morocco-tour, morocco-signature-highlights, morocco-s-great-escape, vibrant-morocco-and-desert, authentic-morocco-tour, iconic-morocco-journey, hidden-treasures, imperial-cities-sahara, landscapes-morocco, best-of-morocco, 7-day-morocco-desert-coast-tour, marrakech-to-fes-through-the-sahara, tea-nomads-desert, 3-days-marrakech-to-fes-desert-tour-via-the-sahara, sahara-desert-dream, sahara-3-days

---

## 7. Admin UI Strategy

**Principle:** Change only user-facing labels. The database table name `products`, all column names, all category values (`morocco_tour`, `student_trip`, etc.) remain unchanged.

### Files to change (UI labels only)

| File | Current label | Target label |
|------|--------------|-------------|
| `src/components/layout/Sidebar.tsx` | "All Products" | "All Tours" |
| `src/components/layout/Sidebar.tsx` | section header | "TOURS" (instead of "PRODUCTS" or "WEBSITE & CONTENT PRODUCTS") |
| `src/pages/products/ProductsPage.tsx` | page title "Products" | "Tours" |
| `src/pages/products/ProductsPage.tsx` | "New Product" button | "New Tour" |
| `src/pages/products/ProductForm.tsx` | breadcrumb / title | "New Tour" / "Edit Tour" |

### Sidebar target structure (unchanged routes, only labels)

```
TOURS
  All Tours          → /products
  Morocco Tours      → /products?category=morocco_tour
  Student Trips      → /products?category=student_trip
  Yoga Retreats      → /products?category=yoga_retreat
  Upcoming Tours     → /products?category=upcoming_tour
  Group Adventures   → /products?category=group_adventure
  Events             → /products?category=event
  Experiences        → /products?category=experience
```

No database changes. No route changes. No component logic changes. Labels only.

---

## 8. New Tour Workflow

**Current state (broken):**
```
Dashboard "New Tour" → /tours/new → TourForm → tours table → NEVER appears on public website
```

**Target state:**
```
Dashboard "New Tour" → /products/new → ProductForm → products table → appears after publish
```

**What to change:** One line in `src/pages/Dashboard.tsx` — the navigation target for the "New Tour" button.

**Prerequisite:** Staging verification that ProductForm correctly creates a draft morocco_tour product with the expected fields.

**Risk:** Very low. One line change. Reversible by changing the route back.

---

## 9. Public Website Protection Strategy

### Current production state (verified)
- `fetchTours()` reads: `products` WHERE `category='morocco_tour'` AND `status='published'`
- This is the committed, deployed code (commit `0799f36`, 2026-06-14, confirmed in HEAD)
- **The local working tree has an uncommitted change (from previous session) that switches to `tours` — this must be discarded, not deployed**

### What to do with the local uncommitted change
The file `src/lib/dataSync.ts` has uncommitted local changes. Before any build or deploy:
1. Run `git diff src/lib/dataSync.ts` to confirm what's changed
2. Run `git checkout src/lib/dataSync.ts` to restore the committed version
3. Verify `fetchTours()` reads from `products` again
4. Do NOT commit the tours-reading version

### No public site deploys until
- Critical Issue A (broken published product) is resolved
- A staging/preview deployment has been verified
- All locked tour URLs confirmed working in preview
- Explicit approval given

---

## 10. FAQ Migration Strategy

### Current state

`tour_faqs.tour_id → tours.id` is a **hard FK constraint**.

All 17 tours that have FAQs have matching `tours` records (confirmed). The 17 new products created 2026-08-08 (which have no `tours` records) cannot receive FAQs via the current schema — any attempt would fail with a FK violation.

### The legacy draft with FAQs

`4-days-marrakech-to-fes-through-the-sahara` has 12 FAQ rows. **Audit finding: these 12 rows are 6 unique questions duplicated twice** (questions at sort_order 0-5 are identical to sort_order 6-11). The duplication is a data quality issue in the FAQ records themselves.

### Options (requires your approval)

**Option A — Do nothing now.** Accept that new products cannot have FAQs until the FK is migrated. The 17 new draft products are not published and not customer-facing. The existing 17 tours with FAQs all have `tours` records and are not affected.

**Option B — Migrate the FK to reference `products.id` instead of `tours.id`.**
Steps:
1. Verify all existing `tour_faqs.tour_id` values exist in `products` (all 17 confirmed — they do)
2. Write migration SQL in a versioned migration file
3. Test in staging
4. Drop old FK constraint
5. Add new FK to `products.id`
6. All existing FAQs continue to work (same slug IDs)
7. New products can now receive FAQs

**Option C — Add stub `tours` records for new products.** Create minimal `tours` records for the 17 new products so the FK is satisfied. High noise, works around the root issue, not recommended.

**Recommendation:** Option B is the correct long-term solution. Option A is safe for now since the new products are not published.

---

## 11. Pricing Dependency Strategy

### Current state

`PricingEnginePage` reads its tour list from `tours` WHERE status='published' (17 tours). The pricing rules are stored in `btm_pricing_rules.tour_id → tours.id` (hard FK).

Since `products.id` uses the same slug values as `tours.id` for all migrated tours (19 shared records), existing pricing rules will continue to work even if the PricingEnginePage switches to querying `products` for its tour picker — the `tour_id` value in `btm_pricing_rules` is just a text slug, and those slugs exist identically in both tables.

### What to change

Change the tour list query in `PricingEnginePage.tsx` from:
```
supabase.from('tours').select('id, title, status').eq('status', 'published')
```
To:
```
supabase.from('products').select('id, title, status').eq('category', 'morocco_tour').eq('status', 'published')
```

This would show 18 published Morocco tours (from products) instead of 17 (from tours), without changing any pricing rule data.

**Do NOT touch `btm_pricing_rules` table.** The `tour_id` column values remain compatible.

---

## 12. Booking and Inquiry Dependency Strategy

### Bookings
- `bookings` table: empty (0 rows) — no active dependency
- `op_bookings` table: 1 row with no tour_id set — no active dependency

### Inquiries
- `inquiries` table: 1 row out of 45 has a tour_id — text slug, no FK
- The inquiry workflow captures tour title as text in the form submission (likely duplicated into the record)
- No FK constraint — changing tour management does not break existing inquiry records

### Testimonials
- `testimonials` table: 2 rows have tour_id — text slug, no FK
- No migration required for testimonials

### Strategy
**Do nothing.** No booking, inquiry, or testimonial data is at risk. Text slug references remain readable regardless of which table is queried. FK migration of these tables can be deferred indefinitely.

---

## 13. Homepage Popular Tours Strategy

### Current state (confirmed)

`homepage_popular_tours` has 10 entries. 5 are valid, 5 are stale (IDs that don't exist in either table).

| Slot | tour_id | Status |
|------|---------|--------|
| 0 | best-of-morocco | ✅ valid, published in products |
| 1 | landscapes-morocco | ✅ valid, published in products |
| **2** | **real-morocco** | ❌ stale — not in tours or products |
| 3 | colors-of-morocco | ✅ valid, published in products |
| 4 | imperial-cities-sahara | ✅ valid, published in products |
| **5** | **hidden-jewels** | ❌ stale — not in tours or products |
| 6 | hidden-treasures | ✅ valid, published in products |
| **7** | **desert-escape-gorges** | ❌ stale — not in tours or products |
| **8** | **fes-marrakech-4day** | ❌ stale — not in tours or products |
| **9** | **ultimate-morocco** | ❌ stale — not in tours or products |

### Effect on live website
The public site's `SiteDataContext` calls `fetchPopularTourIds()`, then matches those IDs against the loaded tour list. The 5 stale IDs produce no matches — those homepage slots are **silently empty** (no error, just missing content). The homepage popular tours section currently shows only 5 tours instead of 10.

### Proposed replacements (requires your approval)

Do NOT apply until approved. Candidate published Morocco tours from `products` that could fill the 5 empty slots:

| Slot | Current stale ID | Candidate replacement | Reason |
|------|------------------|-----------------------|--------|
| 2 | real-morocco | `authentic-morocco-tour` | Strong popular tour, 14d, published |
| 5 | hidden-jewels | `vibrant-morocco-and-desert` | 9d Sahara route, strong content |
| 7 | desert-escape-gorges | `morocco-s-great-escape` | Matches "escape" theme, 9d |
| 8 | fes-marrakech-4day | `marrakech-to-fes-through-the-sahara` | Similar route (4d), published |
| 9 | ultimate-morocco | `iconic-morocco-journey` | 15d flagship tour |

These are suggestions only. You may choose different tours. Replacement requires admin action (PopularToursPage → remove stale + add valid) — no code change required, just admin UI.

---

## 14. Broken Published Product Strategy (Critical Issue A)

### Verified facts about `4-day-marrakech-desert-trip`

| Field | Value |
|-------|-------|
| Status | **PUBLISHED** |
| Created | 2026-08-08 (4 days ago) |
| Price | "From €" (broken — number missing) |
| Images | 0 (none) |
| Description | Has text content (4-day Marrakech→desert route) |
| Itinerary | 4 days of content |
| Highlights | 0 |
| Included | 0 |
| SEO title | "4 Days Marrakech Desert Trip" |
| SEO description | NULL (missing) |
| In nav dropdown | No |
| In popular tours | No |
| In sitemap | **No** |
| In inquiries | 0 rows |

### Current visibility on production website
- **YES — it appears in the tours listing** on besttravelmorocco.com (fetchTours reads published products)
- **YES — it has a routable detail page** at `besttravelmorocco.com/tours/4-day-marrakech-desert-trip`
- The detail page shows: broken price "From €", no image (broken img), partial content
- It is NOT in the sitemap, NOT in navigation, NOT in popular tours

### Assessment
This tour was created on the same day as 16 other draft tours (2026-08-08). It was the only one that was accidentally left as `published`. It is not fully complete (missing price amount, no images, no highlights, no inclusions). The broken price string `"From €"` suggests a form submission error where the price number field was empty.

### Recommendation
Set to `draft` in the admin (Products → find `4-day-marrakech-desert-trip` → unpublish). This removes it from the public listing without deleting any data.

**Do NOT execute this until you confirm this is what you want.**

---

## 15. SEO Separation Strategy

This architecture plan does not touch SEO. SEO is a separate project.

The admin architecture work (this document) covers:
- Which database table the admin reads/writes
- Which database table the public site reads
- Admin UI terminology
- New tour workflow

The SEO migration project (separate) covers:
- Permanent redirects from old Webflow URLs to new URLs
- Sitemap updates
- Canonical tags
- Internal link updates
- Google Search Console submissions

These two projects must not be mixed. No slug changes, no URL changes, no redirect changes are part of this architecture plan.

---

## 16. Staging and Preview Strategy

### For public site changes

1. Create a feature branch from current HEAD: `git checkout -b feat/canonical-products-source`
2. Ensure `fetchTours()` reads from `products` (it already does in HEAD — just discard the local uncommitted change)
3. `npm run build` from `/Users/hmad/Desktop/BTM Work/besttravelmorocco-seo-v4-6/`
4. Deploy to Vercel preview: `npx vercel deploy` (without `--prod`) — produces a preview URL
5. Verify all 17 locked tour detail pages in the preview
6. Verify tours listing shows expected tours
7. Verify `4-day-marrakech-desert-trip` is either absent (if set to draft) or clearly shown as a planned action
8. Only after manual verification: `npx vercel deploy --prod --force`

### For admin changes

1. Create a feature branch: `git checkout -b feat/admin-tour-ui`
2. Make UI label changes only
3. `npm run build` from `/Users/hmad/besttravelmorocco/`
4. Deploy admin preview: `npx vercel deploy` (without `--prod`)
5. Verify admin sidebar, tour listing, new tour workflow
6. Only after verification: `npx vercel deploy --prod --force`

---

## 17. Backup Strategy

Before any production database changes (not applicable to UI changes):

1. **Record current counts** (as established in this audit):
   - `tours`: 20 records (17 pub / 1 draft / 2 archived)
   - `products`: 41 records (20 pub / 19 draft / 2 archived)
2. **Export a backup** via Supabase Dashboard → Database → Backups (or pg_dump if available)
3. **Document current published product IDs** — the 18 published morocco_tour products
4. **Document current published tour URLs** — the 17 locked tour URLs

The existing automated backup system (every 2 days → Google Drive via `/api/backup`) continues to run.

---

## 18. Migration Order

Phases listed in safe execution order. Each requires explicit approval before starting.

| Phase | Description | Type | Risk |
|-------|-------------|------|------|
| 0a | Handle `4-day-marrakech-desert-trip` (set to draft or fix) | Admin action | Very Low |
| 0b | Decide on stale homepage_popular_tours slots | Admin action | Low |
| 0c | Discard uncommitted local change in dataSync.ts | Local only | Zero (git checkout) |
| 1 | Admin UI labels only (Products→Tours, etc.) | Code change, admin build | Very Low |
| 2 | Dashboard "New Tour" route fix (1 line) | Code change, admin build | Very Low |
| 3 | Fix admin component queries (Pricing, Popular, Nav, Bookings, Dashboard count) | Code changes, admin build | Low per component |
| 4 | Fix `tours` RLS (add status filter for public reads) | DB policy change | Very Low |
| 5 | Migrate `tour_faqs` FK from `tours.id` to `products.id` | DB migration | Medium |
| 6 | Migrate remaining FK tables to products | DB migration | High |
| 7 | Retire `/tours` route from admin | Code change | Low |

---

## 19. Rollback Strategy

| Phase | Rollback method |
|-------|----------------|
| 0a (draft the product) | Set back to published in admin |
| 0c (discard local change) | Irreversible (it was never committed) — the local change was wrong |
| 1 (UI labels) | `git revert` the commit + redeploy |
| 2 (Dashboard route) | `git revert` the commit + redeploy |
| 3 (component queries) | `git revert` per component + redeploy |
| 4 (RLS fix) | Drop new policy, restore old policy via SQL |
| 5 (FAQ FK migration) | Run reverse migration SQL (drop new FK, restore old FK) |
| Public site changes | Redeploy previous Vercel deployment (available in Vercel dashboard) |
| Admin changes | Redeploy previous Vercel deployment |
| DB changes | Restore from Supabase backup |

---

## 20. Validation Strategy

### Before any production deployment

**Database:**
- [ ] Count of published morocco_tour products unchanged: 18 (or 17 if 4-day-marrakech is drafted)
- [ ] All 17 locked tour IDs present in `products` with status='published'
- [ ] All 17 locked tour prices unchanged from audit baseline
- [ ] All 17 locked tour SEO titles unchanged from audit baseline

**Public website (verify in preview before production):**
- [ ] All 17 locked tour URLs return HTTP 200
- [ ] Tour titles on detail pages match products records
- [ ] Tour prices display correctly
- [ ] Tour images load
- [ ] Booking inquiry forms work
- [ ] No new 404 errors

**Admin:**
- [ ] Tours listing shows all expected products
- [ ] Publish/unpublish toggles work
- [ ] New Tour workflow creates a draft product in `products`
- [ ] Edit tour opens ProductForm with correct data
- [ ] Pricing page shows correct tour list

---

## 21. Production Deployment Checklist

See `PRODUCTION-SAFETY-CHECKLIST.md` for the full step-by-step checklist.

Summary of gates before each production deploy:

1. **Feature branch created** (never commit direct to main)
2. **Local build succeeds** with zero TypeScript errors
3. **Preview deployment created** (Vercel preview URL)
4. **Preview manually verified** (tours listing, detail pages, admin workflow)
5. **Explicit approval received** via this conversation
6. **Database backup confirmed** (recent backup in Google Drive)
7. **Rollback plan documented** (previous Vercel deployment URL noted)
8. **`npx vercel deploy --prod --force`** executed from correct directory

---

*End of implementation plan. No actions taken. Awaiting approval.*
