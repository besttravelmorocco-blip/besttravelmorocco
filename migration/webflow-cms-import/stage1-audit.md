# Stage 1 — CMS Audit Report
**Date:** 2026-08-08  
**Branch:** `migration/webflow-cms-import`  
**Status:** READ-ONLY AUDIT — Zero database changes made

---

## 1. CMS Architecture

| Component | Detail |
|---|---|
| Admin CMS | https://admin.besttravelmorocco.com (React SPA, Vite) |
| Database | Supabase (PostgreSQL) — project `uxkfqxistjvtofskqtwy` |
| Auth | Supabase Auth (JWT, Row Level Security) |
| File storage | Supabase Storage — `images` bucket |
| API | Direct Supabase REST via `@supabase/supabase-js` |
| Deployment | Vercel |
| Public site | https://www.besttravelmorocco.com (separate React SPA, static data) |

> **Critical:** The public site (`besttravelmorocco.com`) does NOT read from Supabase for tour pages. It uses hardcoded static data files (`src/data/tours.ts`). The CMS (Supabase) and the public site are decoupled. Importing tours into Supabase as drafts will have **zero effect on the public site.**

---

## 2. Relevant Database Tables

### 2a. `products` table — primary tours store

**All columns (verified live):**
```
id, slug, category, booking_type, title, subtitle, hero_subtitle,
description, duration_days, duration_nights, from_city, to_city,
departure_city, price, price_amount, starting_price, deposit_percentage,
images, highlights, itinerary, included, not_included,
min_group_size, max_group_size, capacity, accommodation_level,
seo_title, seo_description, seo_keywords, focus_keyword,
canonical_url, og_title, og_description, og_image, twitter_image,
robots_index, robots_follow,
status, featured, popular, sort_order, created_at, updated_at
```

**Key schema details:**
- `id` — TEXT PRIMARY KEY — equals the slug for tour records (e.g. `sahara-desert-dream`)
- `slug` — TEXT UNIQUE NOT NULL
- `status` CHECK: `draft | published | archived`
- `category` CHECK: `morocco_tour | student_trip | yoga_retreat | upcoming_tour | group_adventure | event | experience`
- `images`, `highlights`, `itinerary`, `included`, `not_included` — JSONB arrays
- `itinerary` — JSONB array of `{day, title, route, desc}` objects
- **No source tracking columns** (`source_system`, `source_url`, `migration_batch`) — see Section 5

**RLS (Row Level Security):**
- `status = 'published'` → visible to anonymous users (public)
- `status = 'draft'` → **invisible to anonymous users** ✅
- `status = 'archived'` → **invisible to anonymous users** ✅
- Authenticated users can read/write all records

### 2b. `blog_posts` table

**All columns (verified live):**
```
id, title, excerpt, content, image, category, read_time, date,
status, featured, slug, seo_title, seo_description, seo_keywords,
focus_keyword, canonical_url, og_title, og_description, og_image,
twitter_image, robots_index, robots_follow, created_at, updated_at
```

**Key schema details:**
- `id` — TEXT PRIMARY KEY (slug-based IDs observed in practice)
- `slug` — nullable TEXT
- `status` CHECK: `draft | published`
- `content` — TEXT (Markdown supported)
- **No source tracking columns** — see Section 5

**RLS:** Draft blog posts are **invisible to anonymous users** ✅ (verified live)

### 2c. `tours` table (LEGACY)

Still exists in DB. Used by legacy API routes (Drizzle ORM). The admin CMS now uses `products` as primary. Do not write to `tours` table during migration — target `products` only.

---

## 3. Existing Content Inventory

### Products (tours) in CMS — 19 records, all `published`

| ID / Slug | Title | Category | Duration | Status |
|---|---|---|---|---|
| sahara-desert-dream | Sahara Desert Dream | morocco_tour | 3d | published |
| sahara-3-days | The Sahara in 2 Days | morocco_tour | 2d | published |
| tea-nomads-desert | 5 Days Tea with Nomads tour | morocco_tour | 5d | published |
| imperial-cities-sahara | Imperial Cities & The Sahara | morocco_tour | 8d | published |
| landscapes-morocco | Landscapes of Morocco | morocco_tour | 10d | published |
| best-of-morocco | The Best of Morocco | morocco_tour | 13d | published |
| hidden-treasures | Morocco's Hidden Treasures | morocco_tour | 17d | published |
| 81f4d782-feac-4546-b429-fd6d3893c057 | 3 Days - Sleeping Under the Stars | student_trip | 3d | published |
| 271a46da-2675-49cc-8ddc-57ebdf2e07df | Morocco Student Adventure – Sahara | student_trip | 4d | published |
| iconic-morocco-journey | Iconic Morocco Journey | morocco_tour | 15d | published |
| authentic-morocco-tour | Authentic Morocco Tour | morocco_tour | 14d | published |
| 3-days-marrakech-to-fes-desert-tour-via-the-sahara | 3 Days Marrakech to Fes via Desert | morocco_tour | 3d | published |
| vibrant-morocco-and-desert | Across Authentic Morocco | morocco_tour | 9d | published |
| morocco-s-great-escape | Morocco's Great Escape | morocco_tour | 9d | published |
| morocco-signature-highlights | Morocco Signature Highlights | morocco_tour | 12d | published |
| marrakech-to-fes-through-the-sahara | Marrakech to Fes through the Sahara | morocco_tour | 4d | published |
| classic-morocco-tour | Classic Morocco Tour | morocco_tour | 14d | published |
| colors-of-morocco | Colors of Morocco | morocco_tour | 13d | published |
| 7-day-morocco-desert-coast-tour | 7-Day Atlas Mountains, Sahara & Coast | morocco_tour | 7d | published |

**⚠️ Data anomaly noted:** `sahara-3-days` has `duration_days = 2` in the DB but its title says "The Sahara in 2 Days". The public site shows it as 3 days. Not part of this migration — flagged for your review only.

### Blog Posts in CMS — 10 records, all `published`

| Slug | Title | Date | Category |
|---|---|---|---|
| visit-morocco-2024 | Visit Morocco - All You Need to Know | March 15, 2024 | Travel Guide |
| sahara-desert-night | Sleep Among a Million Stars | February 28, 2024 | Experiences |
| 8-things-to-do | 8 Awesome Things to Do in Morocco | January 20, 2024 | Top Lists |
| moroccan-cuisine | A Food Lover's Guide to Moroccan Cuisine | December 10, 2023 | Food & Culture |
| blue-city-guide | Why is Chefchaouen Blue? | November 5, 2023 | Culture |
| berber-culture | Meeting the Berbers | October 18, 2023 | Culture |
| ziz-valley-morocco-guide | Ziz Valley Morocco: A Complete Guide | May 5, 2026 | Destinations |
| sahara-desert-camping-morocco | Sahara Desert Camping in Morocco | April 28, 2026 | Experiences |
| best-time-visit-morocco | Best Time to Visit Morocco | April 20, 2026 | Travel Guide |
| marrakech-fes-desert-tour | Marrakech to Fes Desert Tour | April 15, 2026 | Tours |

---

## 4. Old Webflow Site Inventory

Source: `https://best-travel-morocco.webflow.io/`  
Tours crawled: **37 tours** (from SEO migration Phase 1)  
Blog posts: **Crawler running — see Stage 2 for complete inventory**

**Note on old site SEO state:**
- `robots.txt: Disallow: /` — entire site blocked from crawlers
- Zero meta descriptions on any page
- Zero canonical URLs
- Zero JSON-LD structured data
- No SEO metadata to migrate (only content)

### Tours Duplicate Classification

#### CATEGORY A — Safe New Records (20 tours)
No matching CMS product found by slug or content.

| Duration | Old Webflow Slug | Old Title |
|---|---|---|
| 3d | 3-day-fes-to-marrakech-via-desert-tour | 3 Day Fes to Marrakech via desert |
| 4d | 4-days-tour-from-fes-to-marrakech | 4 Days Tour from Fes to Marrakech |
| 4d | 4-day-marrakech-desert-trip | 4 Days Marrakech Desert Trip |
| 4d | semester-at-sea-morocco-adventure-tour | Semester At Sea Morocco Adventure Tour |
| 5d | 5-day-exotic-sahara-desert-tour | Exotic Sahara Desert Tour |
| 5d | desert-escape-and-gorges-trekking-tour | Desert Escape and Gorges Trekking Tour |
| 5d | 5-day-marrakech-sahara-discovery-students-round-trip | 5-Day Marrakech Sahara Discovery Students |
| 6d | tangier-to-marrakech-desert-tour | Tangier to Marrakech Desert Tour |
| 6d | semester-at-sea-morocco-tour-fall | Semester At Sea Morocco Tour — Fall 2025 |
| 7d | casablanca-to-marrakech-with-ouzoud | Casablanca to Marrakech + Ouzoud Falls |
| 7d | 7-day-morocco-desert-tour-from-tangier | From Tangier to Desert's Charms |
| 7d | trekking-through-the-atlas-mountains-morocco-tour | Atlas Mountains Morocco Tour |
| 8d | 8-days-enchanting-southern-morocco-tour | Enchanting Southern Morocco |
| 8d | 8-days-the-route-of-caravans-tour | The Route Of Caravans |
| 9d | 9-day-morocco-tour-from-casablanca | Vibrant Morocco and Desert Escapades |
| 9d | 9-days-the-ultimate-morocco-tour | The Ultimate Morocco |
| 10d | 10-days-imperial-cities-and-northern-morocco-tour | Imperial Cities and Northern Morocco |
| 10d | 10-days-imperial-cities-and-coast-morocco-tour | Imperial Cities and Coast |
| 13d | 13-days-real-morocco-uncovered-tour | 13 Day Morocco Tour From Tangier |
| 15d | 15-days-morocco-hidden-jewels-tour | Morocco's Hidden Jewels |

→ **Action:** Import as `draft` after schema change approval and test batch approval.

#### CATEGORY B — Possible Duplicates — DO NOT AUTO-IMPORT (17 tours)
A matching CMS record exists by content/title similarity. Slugs differ.

| Old Webflow Slug | Old Title | Existing CMS Record | Match Reason |
|---|---|---|---|
| 2-day-marrakech-desert-trip-sahara-desert-dream | Sahara Desert Dream (2d, Zagora) | `sahara-desert-dream` (3d, Merzouga) | Same brand name — **DIFFERENT ITINERARY** |
| 3-days-desert-tour-marrakech-return | The Sahara in 3 Days — Marrakech Return | `sahara-3-days` | Same route and title |
| 3-day-marrakech-sahara-to-fes-tour | The Sahara in 3 Days — Marrakech to Fes | `3-days-marrakech-to-fes-desert-tour-via-the-sahara` | Same route |
| 3-day-student-desert-trip | 3 Day Students Desert Trip | `81f4d782...` (3d student) | Same duration/type |
| marakech-to-fes-through-sahara | Marrakech to Fes through the Sahara | `marrakech-to-fes-through-the-sahara` | Same tour, old slug has typo |
| 4-days-students-desert-trip- | 4 Days Students Desert Trip | `271a46da...` (4d student) | Same duration/type |
| 5-day-tea-with-nomads-tour | Tea with Nomads Desert Tour | `tea-nomads-desert` | Exact same tour |
| marrakech-atlas-mountains-desert-beach | Marrakech, Atlas Mountains, desert & beach | `7-day-morocco-desert-coast-tour` | Same 7d route |
| imperial-cities-and-sahara | Imperial Cities & The Sahara | `imperial-cities-sahara` | Exact same tour |
| 9-day-morocco-great-escape-tour | 9 Days Morocco Tour from Casablanca | `morocco-s-great-escape` | Same tour |
| vibrant-morocco-desert-and-the-beach | Vibrant Morocco, Desert and the beach | `vibrant-morocco-and-desert` | Same tour (title changed in CMS) |
| 10-days-landscapes-of-morocco-tour | Landscapes of Morocco | `landscapes-morocco` | Exact same tour |
| the-best-of-morocco | The Best of Morocco | `best-of-morocco` | Exact same tour |
| 13-day-colors-of-morocco-tour | Colors of Morocco | `colors-of-morocco` | Exact same tour |
| 14-day-authentic-morocco-tour | Authentic Morocco tour | `authentic-morocco-tour` | Exact same tour |
| 14-days-classic-morocco-tour | Classic Morocco Tour | `classic-morocco-tour` | Exact same tour |
| 17-days-tour-morocco-hidden-treasures | Morocco's Hidden Treasures | `hidden-treasures` | Exact same tour |

→ **Action:** DO NOT import. Existing CMS records take priority. No merge, no overwrite.  
→ The single exception requiring your decision: `2-day-marrakech-desert-trip-sahara-desert-dream` shares the "Sahara Desert Dream" name with the CMS record but has a **completely different itinerary** (2d Zagora vs 3d Merzouga). Decision needed: import it as a separate new draft with a distinct slug, or skip it?

---

## 4b. Old Webflow Blog Inventory — 6 Posts (COMPLETE)

Crawler confirmed: the Webflow blog has **exactly 6 posts** (no pagination).

| # | Webflow Slug | Webflow Title | SEO Title (differs) | Images | Content Length |
|---|---|---|---|---|---|
| 1 | `8-awesome-things-to-do-in-morocco` | 8 Awesome Things to Do in Morocco | (same) | 6 inline | 14,656 chars |
| 2 | `cultural-chocks-morocco` | Cultural chocks - Morocco | Cultural Shocks in Morocco: A Guide for Tourists | 0 | 3,231 chars |
| 3 | `sleep-among-a-million-stars-a-magical-night-in-moroccos-sahara-desert` | Sleep among a million stars: A Magical Night in Morocco's Sahara Desert | (same) | 2 inline | 5,318 chars |
| 4 | `the-berber-queen-kahina` | The Berber Queen Kahina | The Legendary Berber Queen Kahina: A Woman of Power and Resistance | 0 | 3,102 chars |
| 5 | `visit-morocco-morocco-destinations-2024` | Visit Morocco - Morocco Destinations 2024 | Visit Morocco - All you need to know | 5 inline | 4,915 chars |
| 6 | `what-is-berber-amazigh-jewellery` | What is Berber (Amazigh) Jewellery? | (same) | 7 inline | 12,084 chars |

**Notes:**
- No publication dates in Webflow HTML (template does not render them)
- No category/tag taxonomy rendered
- All author = "Best Travel Morocco"
- Images served from `cdn.prod.website-files.com` — may become unavailable; must re-upload to Supabase Storage before use
- SEO title differs from H1 on 3 of 6 posts — Webflow SEO title is the better value; the H1 is what gets stored as `title`

### Blog Duplicate Classification

**CATEGORY A — Safe New (3 blogs) — no CMS equivalent:**

| Webflow Slug | Title | CMS Status |
|---|---|---|
| `cultural-chocks-morocco` | Cultural chocks - Morocco | No CMS match |
| `the-berber-queen-kahina` | The Berber Queen Kahina | No CMS match |
| `what-is-berber-amazigh-jewellery` | What is Berber (Amazigh) Jewellery? | No CMS match |

**CATEGORY B — Possible Duplicate (3 blogs) — matching CMS post exists:**

| Webflow Slug | Webflow Title | Existing CMS Slug | CMS Title | Match Reason |
|---|---|---|---|---|
| `8-awesome-things-to-do-in-morocco` | 8 Awesome Things to Do in Morocco | `8-things-to-do` | 8 Awesome Things to Do in Morocco | **Identical title** — likely same content |
| `sleep-among-a-million-stars-...` | Sleep among a million stars... | `sahara-desert-night` | Sleep Among a Million Stars | **Same topic and title** |
| `visit-morocco-morocco-destinations-2024` | Visit Morocco - Morocco Destinations 2024 | `visit-morocco-2024` | Visit Morocco - All You Need to Know | **Same article**, Webflow version has more cities coverage |

→ Category B blogs: **DO NOT auto-import.** Existing CMS records take priority.

**CMS blogs with no Webflow source (7 posts):**
`moroccan-cuisine`, `blue-city-guide`, `berber-culture`, `ziz-valley-morocco-guide`, `sahara-desert-camping-morocco`, `best-time-visit-morocco`, `marrakech-fes-desert-tour` — written fresh for the new CMS; not on Webflow at all.

---

## 5. ⛔ BLOCKER: Source Tracking Requires Schema Change

The brief requires source tracking fields:
```
source_system = "webflow"
source_url    = original Webflow URL
migration_batch = "webflow-import-2026-08"
```

**Neither `products` nor `blog_posts` have these columns.**

Adding them requires:
```sql
ALTER TABLE products   ADD COLUMN IF NOT EXISTS migration_source JSONB;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS migration_source JSONB;
```

This is a **safe, additive, non-destructive** schema change (nullable JSONB column, no constraints, no triggers affected). It does not alter any existing records, constraints, RLS policies, or indexes.

**However, the brief states:** *"If schema changes are required, stop and report them first."*

**I am stopping here and reporting:**

> Do you approve adding a `migration_source JSONB` column to both `products` and `blog_posts`?
>
> This would store: `{"system":"webflow","url":"https://best-travel-morocco.webflow.io/tours/...","batch":"webflow-import-2026-08"}` on every imported record.
>
> Alternative if you decline: imported records will have no programmatic source marker. The only traceability will be their `status = 'draft'` and their slug values.

---

## 6. Field Mapping — Webflow Tour → CMS Product

| Webflow Field | CMS Field | Notes |
|---|---|---|
| Page title (H1) | `title` | Strip " - Best Travel Morocco" suffix |
| URL slug | `slug` (and `id`) | Use Webflow slug as-is |
| Duration (days) | `duration_days` | Parse number from "X days" |
| `duration_days - 1` | `duration_nights` | Calculated |
| Start city | `from_city` | Extracted from route description |
| End city | `to_city` | Extracted from route description |
| H2 headings / itinerary | `itinerary` | Parse into `[{day, title, route, desc}]` |
| Page body / description | `description` | Full HTML→text |
| Webflow images | `images` | See Section 8 — Images |
| — | `category` | Default `morocco_tour` (or `student_trip` for semester/student tours) |
| — | `booking_type` | Default `inquiry` |
| — | `price` | **LEAVE EMPTY** (no price data on old site) |
| — | `price_amount` | **LEAVE EMPTY** |
| — | `seo_title` | **LEAVE EMPTY** (old site has zero SEO metadata) |
| — | `seo_description` | **LEAVE EMPTY** |
| — | `status` | ALWAYS `draft` |
| — | `featured` | `false` |
| — | `popular` | `false` |
| — | `robots_index` | `false` (draft, must not be indexed) |
| — | `robots_follow` | `true` |
| `migration_source` | `migration_source` | Pending schema change approval |

**Fields with no Webflow equivalent — leave null/empty:**
`subtitle`, `hero_subtitle`, `price`, `price_amount`, `starting_price`,
`deposit_percentage` (use default 30), `highlights`, `min_group_size`,
`max_group_size`, `capacity`, `accommodation_level`, all SEO fields

**Webflow data with no CMS field:**
- `cities_destinations` (list of cities visited) — store in `migration_source` JSONB if approved, otherwise discard
- `route_description` — incorporate into `description` text
- `images` (Webflow CDN URLs) — see Section 8

---

## 7. Field Mapping — Webflow Blog → CMS Blog Post

| Webflow Field | CMS Field | Notes |
|---|---|---|
| Title | `title` | Preserve exactly |
| URL slug | `slug` (and `id`) | Use Webflow slug as-is |
| Publication date | `date` | Parse into display format (e.g. "March 15, 2024") |
| Author | — | **No author field in CMS blog_posts** — discard or store in migration_source |
| Category/tag | `category` | Map to nearest CMS category |
| Excerpt / meta description | `excerpt` | Use meta description if available |
| Full body content | `content` | HTML → Markdown |
| Featured image | `image` | Webflow CDN URL (see Section 8) |
| SEO title | `seo_title` | Preserve if present |
| SEO description | `seo_description` | Preserve if present |
| — | `status` | ALWAYS `draft` |
| — | `read_time` | Calculate from word count (200 wpm) |
| — | `featured` | `false` |
| — | `robots_index` | `false` |

**CMS blog categories available:** Travel Guide, Experiences, Culture, Food & Drink, Tips, Destinations, News

---

## 8. Images

**Webflow serves images from its CDN:** `uploads-ssl.webflow.com/...`

Before importing any image:
- Compare filename and dimensions against existing images in Supabase Storage
- Do NOT re-upload if the same image already exists
- Webflow CDN URLs may expire or become unavailable — images should be re-uploaded to Supabase Storage
- During the initial import, store the original Webflow CDN URL in the `migration_source` JSONB field
- Leave `images` array on imported records as `[]` initially — you can add images manually after review
- **Exception:** If you want us to download and re-upload images during the test batch, say so explicitly

---

## 9. SEO Safety Assessment

| Item | Status |
|---|---|
| Public site URL structure | ✅ Unchanged — no redirects modified |
| Sitemap (`sitemap.xml`) | ✅ Not modified by CMS draft imports |
| `robots.txt` | ✅ Not touched |
| Canonical URLs on public pages | ✅ Not touched |
| Draft products → public visibility | ✅ RLS confirmed invisible to anon |
| Draft blog posts → public visibility | ✅ RLS confirmed invisible to anon |
| Indexed pages | ✅ Zero risk — drafts are hidden |

---

## 10. Security

No Cloudflare is active on this domain. Traffic terminates at Vercel. Existing WAF rules are in place (from previous session). No changes to security configuration during this migration.

---

## 11. Backup Recommendation

Before any DB write:
- The existing automated backup system runs every 2 days via `/api/backup` → Google Drive
- **Recommend:** Trigger a manual backup before the test batch insert
- Rollback plan: any draft records created can be deleted by `id` — IDs will be recorded before insert

---

## Stage 1 Summary

| Item | Count |
|---|---|
| Existing CMS products | 19 (all published) |
| Existing CMS blog posts | 10 (all published) |
| Webflow tours inventoried | 37 |
| Category A tours — Safe to import | 20 |
| Category B tours — Possible duplicates, DO NOT auto-import | 17 |
| Category C — Definite existing match, SKIP | 0 |
| Webflow blog posts inventoried | 6 |
| Category A blogs — Safe to import | 3 |
| Category B blogs — Possible duplicates, DO NOT auto-import | 3 |
| Schema change required for source tracking | YES — awaiting your approval |
| Public site affected | NO |
| Any DB changes made | NONE |

---

## Decisions Required Before Stage 2

**Decision 1 (blocker):** Approve `ALTER TABLE products ADD COLUMN migration_source JSONB` and `ALTER TABLE blog_posts ADD COLUMN migration_source JSONB`?

**Decision 2:** For the 17 Category B tours — confirm they should all be SKIPPED (existing CMS records take priority)?

**Decision 3:** For `2-day-marrakech-desert-trip-sahara-desert-dream` (2d Zagora) specifically — it shares a name with existing `sahara-desert-dream` (3d Merzouga) but is a **different tour**. Import as a new draft with a distinct slug (e.g. `zagora-2day-sahara-dream-webflow`), or skip it entirely?

**Decision 4:** Images — leave `images: []` on imported drafts for you to add manually, or download and re-upload Webflow CDN images during import?

**Decision 5 (pending blog crawler):** Once blog inventory is complete, how many blog posts exist on the old Webflow site vs the 10 already in the CMS?

---

*Next step after your decisions: Stage 2 — complete migration inventory including blog posts, then Stage 3 test batch (2 tours + 2 blogs).*
