# BTM SYSTEM AUDIT
Generated: 2026-06-06

## Stack

| Layer | Technology |
|-------|-----------|
| Admin frontend | React 18 + Vite + TypeScript (src/) |
| Public site | React 18 + Vite + TypeScript + Tailwind (besttravelmorocco-seo-v4-6/) |
| Database | PostgreSQL via Supabase (uxkfqxistjvtofskqtwy) |
| Admin data layer | @supabase/supabase-js client called directly from React |
| Legacy API layer | tRPC + Hono in api/ — NOT currently active or deployed |
| Hosting (admin) | Vercel project: besttravelmorocco-admin |
| Hosting (public) | Vercel project: besttravelmorocco-seo-v4-6 |
| Auth | Supabase Auth (email/password) |
| CSS | Custom CSS variables (dark Moroccan theme, --sand #C9A96E) |

## Existing Database Tables (21 total)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| tours | Public tour listings | id(varchar), title, subtitle, days, from_city, to_city, price, status, itinerary(jsonb) |
| tour_days | Per-day itinerary | id, tour_id, day_number, title, route, description, activities(jsonb) |
| destinations | Destination pages | id, name, description, image, featured |
| blog_posts | Blog content | id, title, content, status, featured |
| testimonials | Reviews | id, name, text, rating, tour_id |
| inquiries | Contact form leads | id, name, email, tour_id, status |
| highlights | Site highlights | id, title, description, image |
| media | Media library metadata | id, filename, mime_type, size |
| seo_settings | Per-page SEO | page_route, title, description, keywords |
| site_settings | KV config store | key, value, category |
| bookings | Old booking system | id, tour_id, customer_name, status, payment_status |
| pricing_rules | Old pricing rules | id, tour_id, rule_type, modifier |
| analytics_events | Event tracking | id, event_type, tour_id, data(jsonb) |
| users | Admin users | id, union_id, name, email, role |
| clients | CRM contacts (new) | id(uuid), name, email, phone, whatsapp, nationality, hotel |
| staff | Staff/drivers (new) | id(uuid), name, role, phone, whatsapp, languages(array), available |
| op_bookings | Operational bookings (new) | id(uuid), reference, client_id, tour_name, status, deposit_paid, balance_paid |
| op_payments | Payment records (new) | id(uuid), booking_id, amount, type, method |
| student_tours | Group/student tours | id, title, days, nights, base_price, group_pricing(jsonb) |
| student_departures | Departure schedule | id, tour_id, departure_date, max_seats, booked_seats, status |
| student_payment_methods | Payment config | id, label, link, instructions, enabled |

## Missing tables (Phase 2 will create)

- tours_v2, tour_itinerary_days, tour_highlights, tour_faqs
- accommodations, tour_accommodation_links
- pricing_tiers, seasons, pricing_overrides
- student_voyages, booking_calendar

## Existing Admin Routes

| Route | Status | Page |
|-------|--------|------|
| / | WORKS | Dashboard |
| /login | WORKS | Login |
| /tours | WORKS | Tours list |
| /tours/new | WORKS | Tour form |
| /tours/:id/edit | WORKS | Tour form edit |
| /destinations | WORKS | Destinations CRUD |
| /blog | WORKS | Blog CRUD |
| /testimonials | WORKS | Testimonials CRUD |
| /faqs | WORKS | FAQs CRUD |
| /inquiries | WORKS | Inquiries inbox |
| /media | WORKS | Media library |
| /settings | WORKS | Settings |
| /bookings | WORKS | Bookings list (new) |
| /bookings/:id | WORKS | Booking detail (new) |
| /staff | WORKS | Staff roster (new) |

## Missing Admin Routes (Phase 6 will add)

- /tours-v2 — v2 tour editor with tabs
- /accommodations — accommodation CRUD
- /student-trips — Semester at Sea + departures
- /pricing — seasons & pricing matrix
- /website-editor — website CMS
- /media (already exists — needs WebP conversion)

## Existing Public Site Pages

| Path | Component |
|------|-----------|
| / | Home |
| /tours | Tours listing (static data) |
| /tours/:id | TourDetail (static data) |
| /destinations | Destinations |
| /destinations/:slug | DestinationDetail |
| /blog | Blog |
| /blog/:slug | BlogDetail |
| /contact | Contact |
| /about | About |
| /tailor-made | TailorMade |
| /booking | Booking form |

## What Works vs Missing

### WORKING
- Full admin CRUD for tours, blog, destinations, testimonials, FAQs, media
- Operational booking system with wizard, detail page, payment records
- Staff/driver roster
- Supabase auth with RLS
- Inquiry inbox with status management
- Media library with Supabase Storage
- Dark theme, responsive admin layout

### MISSING (this upgrade addresses)
- Tours v2 with richer schema (pricing tiers, accommodations, availability calendar)
- Accommodation management
- Semester at Sea sync + student departure management (partially in DB, no UI)
- Seasons & pricing engine
- Public site reads from DB (currently uses static data files)
- /api/v2 REST routes

## Risks & Conflicts

1. **No active backend server** — api/ directory has tRPC code but vercel.json does not include it. Phase 3 routes will be Vercel Serverless Functions (/api/v2/*.ts).
2. **tours table exists** — tours_v2 must be a separate table to avoid breaking existing admin tours page.
3. **student_departures exists** — additive columns only; don't alter.
4. **student_tours exists** — similar to planned table; will create student_voyages as new table for SaS data.
5. **vercel.json rewrites catch all routes** — /api/* Vercel functions are served before the rewrite rule, so they work.
6. **No pg/pg-native in package.json** — Phase 3 functions will use DATABASE_URL with pg package installed at build time.

## Recommended Adaptations

- Phase 3: Use Vercel Serverless Functions (ES module format, export default) rather than trying to wire the tRPC server
- Phase 5: SaS scraping — add cheerio/node-fetch as dependencies, run as serverless function
- Phase 6 Module A: Use existing admin CSS design system, do not redesign shell
- Phase 8: Public site reads from Supabase via anon key REST — no backend required
