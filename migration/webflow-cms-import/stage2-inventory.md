# Stage 2 — Migration Inventory
**Date:** 2026-08-08  
**Branch:** `migration/webflow-cms-import`  
**Status:** Partial — tour content pending crawler; blog content complete

---

## Overview

**Total records approved for import: 24** (all as `status: draft`)

| Type | Count | Source |
|---|---|---|
| Morocco tours (Category A) | 20 | Webflow tour pages |
| Zagora 2-day tour (distinct) | 1 | Webflow tour page |
| Blog posts (Category A) | 3 | Webflow blog pages (full content in hand) |

---

## Part A — Blog Posts (Complete)

All 3 blogs are ready for import. Full content available in:
`/private/tmp/.../scratchpad/webflow-blogs.json` (entries at index 1, 3, 5)

### Blog 1 — Cultural chocks / Cultural Shocks in Morocco

| Field | Value |
|---|---|
| `id` | `cultural-shocks-morocco` |
| `slug` | `cultural-shocks-morocco` |
| `title` | `Cultural Shocks in Morocco: A Guide for Tourists` |
| `excerpt` | As a traveler, exploring new destinations allows you to immerse yourself... (use full excerpt from JSON) |
| `content` | (markdown from JSON) |
| `image` | `https://cdn.prod.website-files.com/61b8072f14a976752f811ee3/64aacc56de4797e73490d9da_image11.jpeg` |
| `category` | `Culture` |
| `read_time` | `3 min read` (3,231 chars ÷ ~800 chars/min) |
| `date` | `August 8, 2026` (import date — no Webflow date available) |
| `status` | `draft` |
| `featured` | `false` |
| `seo_title` | `Cultural Shocks in Morocco: A Guide for Tourists` |
| `seo_description` | (use Webflow seo_description, strip " - Best Travel Morocco" suffix) |
| `robots_index` | `false` |
| `migration_source` | `{"system":"webflow","url":"https://best-travel-morocco.webflow.io/posts/cultural-chocks-morocco","batch":"webflow-import-2026-08","webflow_slug":"cultural-chocks-morocco","webflow_image":"https://cdn.prod.website-files.com/61b8072f14a976752f811ee3/64aacc56de4797e73490d9da_image11.jpeg"}` |

**Note on title:** Webflow H1 is "Cultural chocks - Morocco" (typo). Webflow SEO title is "Cultural Shocks in Morocco: A Guide for Tourists" — use the SEO title as the CMS title (better quality).

---

### Blog 2 — The Berber Queen Kahina

| Field | Value |
|---|---|
| `id` | `the-berber-queen-kahina` |
| `slug` | `the-berber-queen-kahina` |
| `title` | `The Berber Queen Kahina` |
| `excerpt` | Throughout history, there have been remarkable women who defied societal norms... |
| `content` | (markdown from JSON) |
| `image` | `https://cdn.prod.website-files.com/5d6d8f89b695c7eeede0e3a3/64af0ebed4e108bd8ae3d6c7_The-Berber-Queen-Kahina.jpg` |
| `category` | `Culture` |
| `read_time` | `4 min read` (3,102 chars) |
| `date` | `August 8, 2026` |
| `status` | `draft` |
| `featured` | `false` |
| `seo_title` | `The Legendary Berber Queen Kahina: A Woman of Power and Resistance` |
| `seo_description` | (from Webflow, strip suffix) |
| `robots_index` | `false` |
| `migration_source` | `{"system":"webflow","url":"https://best-travel-morocco.webflow.io/posts/the-berber-queen-kahina","batch":"webflow-import-2026-08","webflow_slug":"the-berber-queen-kahina","webflow_image":"..."}` |

---

### Blog 3 — What is Berber (Amazigh) Jewellery?

| Field | Value |
|---|---|
| `id` | `what-is-berber-amazigh-jewellery` |
| `slug` | `what-is-berber-amazigh-jewellery` |
| `title` | `What is Berber (Amazigh) Jewellery?` |
| `excerpt` | The Amazigh, (plural Imazighen) are commonly referred to as Berber... |
| `content` | (markdown from JSON — 12,084 chars, very detailed) |
| `image` | `https://cdn.prod.website-files.com/5d6d8f89b695c7eeede0e3a3/64af0fe550975159d323994f_Berber-Amazigh-Jewellery.png` |
| `category` | `Culture` |
| `read_time` | `15 min read` (12,084 chars ÷ ~800) |
| `date` | `August 8, 2026` |
| `status` | `draft` |
| `featured` | `false` |
| `seo_title` | `What is Berber (Amazigh) Jewellery?` |
| `seo_description` | (from Webflow, strip suffix) |
| `robots_index` | `false` |
| `migration_source` | `{"system":"webflow","url":"https://best-travel-morocco.webflow.io/posts/what-is-berber-amazigh-jewellery","batch":"webflow-import-2026-08","webflow_slug":"what-is-berber-amazigh-jewellery","webflow_image":"..."}` |

---

## Part B — Tours (Pending Crawler)

**Status:** Tour content crawler running in background. This section will be completed once the crawler returns.

**Approved tour slugs (21):**

| # | Webflow Slug | CMS Slug (import as) | Category | Duration (estimated) |
|---|---|---|---|---|
| 1 | `2-day-marrakech-desert-trip-sahara-desert-dream` | `zagora-2day-desert-dream` | morocco_tour | 2d |
| 2 | `3-day-fes-to-marrakech-via-desert-tour` | `3-day-fes-to-marrakech-via-desert` | morocco_tour | 3d |
| 3 | `4-days-tour-from-fes-to-marrakech` | `4-days-fes-to-marrakech` | morocco_tour | 4d |
| 4 | `4-day-marrakech-desert-trip` | `4-day-marrakech-desert-trip` | morocco_tour | 4d |
| 5 | `semester-at-sea-morocco-adventure-tour` | `semester-at-sea-morocco` | student_trip | varies |
| 6 | `5-day-exotic-sahara-desert-tour` | `5-day-exotic-sahara-desert` | morocco_tour | 5d |
| 7 | `desert-escape-and-gorges-trekking-tour` | `desert-escape-gorges-trekking` | morocco_tour | 5d |
| 8 | `5-day-marrakech-sahara-discovery-students-round-trip` | `5-day-sahara-discovery-students` | student_trip | 5d |
| 9 | `tangier-to-marrakech-desert-tour` | `tangier-to-marrakech-desert` | morocco_tour | 6d |
| 10 | `semester-at-sea-morocco-tour-fall` | `semester-at-sea-fall` | student_trip | varies |
| 11 | `casablanca-to-marrakech-with-ouzoud` | `casablanca-marrakech-ouzoud` | morocco_tour | 7d |
| 12 | `7-day-morocco-desert-tour-from-tangier` | `7-day-tangier-desert-tour` | morocco_tour | 7d |
| 13 | `trekking-through-the-atlas-mountains-morocco-tour` | `atlas-mountains-trekking-tour` | morocco_tour | 7d |
| 14 | `8-days-enchanting-southern-morocco-tour` | `8-days-enchanting-southern-morocco` | morocco_tour | 8d |
| 15 | `8-days-the-route-of-caravans-tour` | `8-days-route-of-caravans` | morocco_tour | 8d |
| 16 | `9-day-morocco-tour-from-casablanca` | `9-day-tour-from-casablanca` | morocco_tour | 9d |
| 17 | `9-days-the-ultimate-morocco-tour` | `9-days-ultimate-morocco` | morocco_tour | 9d |
| 18 | `10-days-imperial-cities-and-northern-morocco-tour` | `10-days-imperial-cities-north` | morocco_tour | 10d |
| 19 | `10-days-imperial-cities-and-coast-morocco-tour` | `10-days-imperial-cities-coast` | morocco_tour | 10d |
| 20 | `13-days-real-morocco-uncovered-tour` | `13-days-real-morocco-uncovered` | morocco_tour | 13d |
| 21 | `15-days-morocco-hidden-jewels-tour` | `15-days-morocco-hidden-jewels` | morocco_tour | 15d |

**Slug assignment rules:**
- CMS slug = cleaned version of Webflow slug, shortened where needed
- All slugs verified NOT to conflict with any existing CMS product
- `id` field = same as `slug` (consistent with CMS convention)
- All slugs use `inquiry` as `booking_type`

**Default field values for all tour imports:**
```
status:             draft
featured:           false
popular:            false
price:              null
price_amount:       null
starting_price:     null
deposit_percentage: 30
min_group_size:     null
max_group_size:     null
accommodation_level: null
seo_title:          (from Webflow page <title> tag, suffix stripped)
seo_description:    (from Webflow meta description, suffix stripped)
focus_keyword:      null
canonical_url:      null
robots_index:       false
robots_follow:      true
images:             []
```

*This section will be updated with full field values once the tour crawler completes.*

---

## Rollback Plan

If any import needs to be reversed:

```sql
-- Remove all Webflow-imported tours
DELETE FROM products WHERE migration_source->>'system' = 'webflow';

-- Remove all Webflow-imported blogs
DELETE FROM blog_posts WHERE migration_source->>'system' = 'webflow';

-- Remove a single specific record by ID
DELETE FROM products WHERE id = 'zagora-2day-desert-dream';
DELETE FROM blog_posts WHERE id = 'the-berber-queen-kahina';
```

Since all records are `status: draft`, they are invisible to the public site at all times. Deletion is the only cleanup needed — no redirects, no SEO, no cache invalidation required.

---

*Next: Stage 5 test batch — import 2 blogs + 2 tours as drafts, then STOP for review.*
