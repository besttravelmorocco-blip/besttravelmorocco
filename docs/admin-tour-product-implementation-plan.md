# BTM Admin — Architecture Implementation Plan

**Date:** 2026-08-12  
**Status:** PROPOSED — no changes made. Requires explicit approval per phase.  
**Prerequisite:** Review `admin-tour-product-audit.md` and `admin-tour-product-master-map.md` first.

---

## Architectural Target

```
Admin UI (labeled "Tours")
    ↓ ProductForm → products table (canonical)
    ↓ publish/unpublish
Public website
    ↓ fetchTours() → products WHERE category='morocco_tour' AND status='published'
```

The `products` table is the canonical source. The `tours` table remains read-only legacy until all 6 hard FK dependencies are safely migrated. No database table is renamed.

---

## What Must NOT Be Done

- Drop the `tours` table (6 hard FK constraints point to it)
- Copy `tours` content INTO `products` (products has richer, properly structured content)
- Publish any draft tours automatically
- Change any locked tour's content, price, SEO, slug, or image
- Deploy anything to production without explicit per-step approval

---

## Phase 0 — Pre-Approval Items Requiring Manual Decision

These cannot be automated — they require your review and a decision before any code runs.

### Decision 0a: `4-day-marrakech-desert-trip` (PUBLISHED, incomplete)

This tour is published in `products` (category=morocco_tour) but has:
- Price: `"From €"` — broken, missing the amount
- Images: 0

It would appear on the public website once `fetchTours()` reads from `products`. It should not be live in this state.

**Options:**
1. Fix the price and add an image in the admin (Products → edit `4-day-marrakech-desert-trip`) before any deploy
2. Set it to draft in the admin until it's ready
3. Leave it as-is and accept it may show with no image/broken price

→ **Your decision required before any deploy.**

### Decision 0b: `4-days-marrakech-to-fes-through-the-sahara` (LEGACY ONLY, draft, 12 FAQs)

This tour exists only in the `tours` table (draft, created 2026-08-11). It has 12 FAQs linked via hard FK.

**Options:**
1. Create a matching record in `products` with the same ID and keep the FAQs (FAQs will still work since `tour_faqs.tour_id = 'tours.id' = 'products.id'`)
2. Accept it remains in the legacy system indefinitely as a draft
3. Delete it (would lose 12 FAQs — NOT recommended)

→ **Your decision required.**

### Decision 0c: 5 stale IDs in `homepage_popular_tours`

The following tour IDs are in `homepage_popular_tours` but don't exist in either table:
- `real-morocco`, `hidden-jewels`, `desert-escape-gorges`, `fes-marrakech-4day`, `ultimate-morocco`

These silently produce empty slots on the homepage popular tours section.

**Options:**
1. Remove the 5 stale entries via admin (PopularToursPage → delete) and replace with valid published tour IDs
2. Leave them (they silently fail — no crash, just missing slots)

→ **Your decision required.**

---

## Phase 1 — Public Site Fix (1 file change, 1 deploy)

**Prerequisite:** Phase 0a resolved.

**What:** Revert `fetchTours()` in `dataSync.ts` to read from `products` (where it was originally). The previous-session change (reading from `tours`) must NOT be deployed.

**File:** `/Users/hmad/Desktop/BTM Work/besttravelmorocco-seo-v4-6/src/lib/dataSync.ts`

**Change:** Remove the `DbTour` interface and `dbTourToTour` function added in the previous session. Update `fetchTours()` to read from `products` with category filter:

```typescript
export async function fetchTours(): Promise<Tour[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'morocco_tour')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error || !data?.length) return [];
  return (data as DbProduct[]).map(dbProductToTour);
}

function dbProductToTour(row: DbProduct): Tour {
  const days = row.duration_days ?? 0;
  return {
    id: row.slug || row.id,
    title: row.title,
    duration: row.subtitle || `${days} DAYS`,
    days,
    from: row.from_city || '',
    to: row.to_city || row.from_city || '',
    price: row.price || '',
    image: parseJson<string[]>(row.images, [])[0] || '',
    description: row.description || '',
    highlights: parseJson<string[]>(row.highlights, []),
    itinerary: parseJson(row.itinerary, []),
    included: parseJson<string[]>(row.included, []),
    notIncluded: parseJson<string[]>(row.not_included, []),
    category: derivedCategory(days),
    featured: row.featured ?? false,
    popular: row.popular ?? false,
    status: row.status === 'archived' ? 'past' : undefined,
    departure_city: row.departure_city || row.from_city || undefined,
    hero_subtitle: row.hero_subtitle ?? undefined,
  };
}
```

**Effect:** All 18 published morocco_tour products will appear on the public website (17 locked tours + `4-day-marrakech-desert-trip`). The decision from Phase 0a must be made first.

**Deploy:** `npx vercel deploy --prod --force` from `/Users/hmad/Desktop/BTM Work/besttravelmorocco-seo-v4-6/`

**Risk:** Low. Reverts to the intended original state. All 17 locked tours are confirmed present and published in `products`.

---

## Phase 2 — Dashboard "New Tour" Route Fix (1 line, admin deploy)

**What:** Change the Dashboard "New Tour" quick-action to point to `/products/new` instead of `/tours/new`.

**File:** `src/pages/Dashboard.tsx` — find the line that navigates to `/tours/new` and change it.

**Effect:** All new tours created from the Dashboard will go through ProductForm → `products` table → appear on the public website after publish.

**Risk:** Very low. No data change, no DB change. Just a route redirect.

---

## Phase 3 — Admin UI Terminology (Labels only, no DB changes)

**What:** Change UI labels from "Products" to "Tours" in the sidebar and page headers. The underlying DB table stays `products`.

**Changes needed:**
- `src/components/layout/Sidebar.tsx` — section label and nav items
- `src/pages/products/ProductsPage.tsx` — page title, "New Product" button → "New Tour"
- `src/pages/products/ProductForm.tsx` — page title, breadcrumb

**The sidebar should become:**

```
WEBSITE & CONTENT
  TOURS
    All Tours
    Morocco Tours
    Student Trips
    Yoga Retreats
    Upcoming Tours
    Group Adventures
    Events
    Experiences
```

**The database `products` table and category values remain unchanged.**

**Risk:** Zero data risk. UI text changes only.

---

## Phase 4 — Fix Remaining Components Reading `tours` (Admin, Medium Term)

These admin components still query the `tours` table for their tour pickers. They should query `products WHERE category='morocco_tour'` instead.

Do each separately. Test after each.

| Component | Change needed | Impact |
|-----------|--------------|--------|
| `PricingEnginePage.tsx` | Change tour list query to `products` WHERE category='morocco_tour' | Pricing matrix will show `products` tours (36 instead of 20) |
| `PopularToursPage.tsx` | Change tour picker to `products` WHERE category='morocco_tour' | Correct tour list for homepage |
| `NavDropdownPage.tsx` | Change tour picker to `products` WHERE category='morocco_tour' | Correct tour list for navigation |
| `BookingWizard.tsx` | Change tour picker to `products` WHERE category='morocco_tour' | Correct tour list for bookings |
| `Dashboard.tsx` stat | Change count query to `products` WHERE category='morocco_tour' | Shows 36 (or current products count) instead of 20 |
| `GlobalSearch.tsx` tours part | Already partially mixed — consolidate to `products` only | Unified search |

**Note:** The `btm_pricing_rules.tour_id` hard FK references `tours.id`. Since `products.id` uses the same slug values, existing pricing rules will continue to match when the pricing UI switches to `products`. No data migration needed here — just a UI query change.

---

## Phase 5 — Fix `tour_faqs` Hard FK (Long Term)

Currently: `tour_faqs.tour_id → tours.id` (hard FK)  
Problem: New products (created after migration) cannot have FAQs if they don't have a matching `tours` record.  
Affects: 17 new products created 2026-08-08 (no tours record → no FAQs possible).

**Options:**

**Option A (Safest):** Create matching stub records in `tours` for each new product, with status='draft'. This satisfies the FK without exposing them on the legacy public read (which filters by status='published' in app code anyway — though the RLS has no filter, so they'd technically be publicly readable at DB level).

**Option B:** Change `tour_faqs.tour_id` to reference `products.id` instead of `tours.id`. Requires:
1. Verify all existing `tour_faqs.tour_id` values exist in `products` (they all do — confirmed by audit)
2. Drop the existing FK constraint
3. Add new FK constraint to `products.id`
4. This is a breaking DB migration — requires careful staging

**Option C (Simplest for now):** Accept the limitation — FAQs are only supported for tours that existed before migration. The 17 new products simply won't have FAQ capability until the FK is addressed.

→ **Your decision required** before implementing Phase 5.

---

## Phase 6 — Fix `tours` RLS (Security Fix, Low Risk)

Change `public_read_tours` policy to filter by status='published' to match the `products` policy:

```sql
-- Read-only fix — does not change any data
DROP POLICY IF EXISTS "public_read_tours" ON tours;
CREATE POLICY "public_read_tours" ON tours 
  FOR SELECT USING (status::text = 'published');
```

**Risk:** Near zero. Draft and archived tours would no longer be accessible via the anon key, which is the correct behavior. The admin (authenticated) already has `auth_write_tours` which overrides.

---

## Validation Checklist (Run Before Any Deployment)

### Database
- [ ] All 17 locked tour IDs present in `products` with status='published'
- [ ] All 17 locked tour prices unchanged
- [ ] All 17 locked tour SEO fields unchanged
- [ ] No new records accidentally published
- [ ] No existing records accidentally archived/deleted

### Public website (after Phase 1 deploy)
- [ ] All 17 locked tour URLs still return HTTP 200
- [ ] Tour detail pages load with correct content
- [ ] Tour images load correctly
- [ ] Tour prices display correctly
- [ ] SEO metadata unchanged (use site crawl or manual spot-check)

### Admin
- [ ] ProductsPage shows correct count
- [ ] ProductForm edit for each locked tour shows correct content
- [ ] Status toggle works (publish/unpublish)
- [ ] New Tour workflow creates in `products`

---

## Risk Assessment

| Phase | Risk | Reversibility | Prerequisite |
|-------|------|--------------|-------------|
| 0a (fix 4-day-marrakech price) | Very Low | Easy | None |
| 0b (4-days-fes decision) | Very Low | Easy | None |
| 0c (stale popular tours) | Low | Easy | None |
| 1 (revert fetchTours public site) | Low | Redeploy previous | 0a done |
| 2 (Dashboard route) | Very Low | 1 line revert | None |
| 3 (UI labels only) | Zero data risk | Easy revert | None |
| 4 (admin component queries) | Low per component | Easy revert each | Phase 3 done |
| 5 (tour_faqs FK) | Medium — DB constraint | Reversible SQL | Phase 4 done |
| 6 (tours RLS fix) | Very Low | DROP/CREATE POLICY | Any time |

---

## Items Requiring Your Manual Approval

1. **Phase 0a:** What to do with `4-day-marrakech-desert-trip` (published, broken price, 0 images) before Phase 1 deploy
2. **Phase 0b:** What to do with `4-days-marrakech-to-fes-through-the-sahara` (draft in tours only, has 12 FAQs)
3. **Phase 0c:** What to do with 5 stale IDs in `homepage_popular_tours`
4. **Phase 1:** Explicit approval to deploy public site change (revert fetchTours to products)
5. **Phase 2:** Explicit approval to change Dashboard "New Tour" route
6. **Phase 3:** Explicit approval to change admin UI labels
7. **Phase 4:** Explicit approval for each component query migration (pricing, popular tours, nav, bookings, dashboard count)
8. **Phase 5:** Decision on tour_faqs FK approach (Options A, B, or C)
9. **Phase 6:** Explicit approval to fix tours RLS policy

---

*No changes will be made until each phase is explicitly approved.*
