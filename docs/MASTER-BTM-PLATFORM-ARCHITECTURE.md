# BTM Master Platform Architecture
## Best Travel Morocco — Unified Commerce, Operations & CRM System

**Document status:** Living reference — update as phases are completed  
**Last updated:** 2026-08-12  
**Phase current:** Phase 1 deployed to production  
**Owner:** Best Travel Morocco

---

## Part 1 — Platform Vision

BTM is not a simple tour booking website. It is a boutique DMC (Destination Management Company) that must operate as:

- A tour operator (itinerary creation, departure scheduling)
- A CRM (customer history, preferences, communication logs)
- A booking engine (inquiry → confirmed booking → payment)
- A pricing engine (component-based, season-aware, group-size-aware)
- An operations/dispatch system (driver, guide, vehicle assignment)
- A finance platform (deposits, balances, invoices, refunds)
- A customer communication platform (email, WhatsApp, audit trail)

The target system is a single, unified admin where every operation from inquiry to post-tour feedback is traceable, auditable, and connected — with no parallel systems, no duplicate data entry, and no fragmented records.

**Core principle:** One authoritative record per entity. No duplicate bookings, no duplicate tours, no two sources of truth for the same fact.

---

## Part 2 — Current Architecture State (August 2026)

### 2.1 What exists now

#### Admin (besttravelmorocco-admin)
- React 18 + TypeScript + Vite SPA
- Deployed: `admin.besttravelmorocco.com`
- Auth: Supabase Auth (email/password)
- DB: Supabase PostgreSQL (direct client SDK)
- Role system: soft RBAC in `RoleContext.tsx` — server-side enforcement pending
- Legacy Drizzle/tRPC stack: partially unused, not deployed

#### Public Site (besttravelmorocco-seo-v4-6)
- React + Vite SPA
- Deployed: `www.besttravelmorocco.com`
- Reads from `products` table (canonical)
- Booking/inquiry forms → `inquiries` table via Vercel Edge functions
- Email: Resend API

#### Database (Supabase PostgreSQL)
Two parallel tour systems:

| Table | Role | Record count | Status |
|---|---|---|---|
| `tours` | Legacy (original) | 20 records | READ-ONLY — 17 locked |
| `products` | Canonical (v2) | 41 records | Active — admin and public |
| `departures` | Canonical departures | Active | FK → `products.id` |
| `op_bookings` | Active booking record | Active | No FK to `clients` |
| `op_payments` | Active payments | Active | FK → `op_bookings` |
| `inquiries` | Public form leads | Active | Manual conversion required |
| `clients` | Customer records | Active | Not FK-linked to `op_bookings` |
| `btm_pricing_rules` | Pricing matrix | Active | FK → `tours.id` (blocked) |

Hard FK dependencies on `tours.id` (6 tables — NOT yet migrated):
- `btm_pricing_rules`
- `custom_tour_requests`
- `nav_dropdown_tours`
- `tour_accommodation_assignments`
- `tour_days`
- `tour_faqs`

### 2.2 Critical gaps in current architecture

| Gap | Risk | Phase to fix |
|---|---|---|
| `op_bookings` has no FK to `clients` | Customer history is fragmented | Phase 5 |
| `inquiries` → `op_bookings` is manual | Lost conversions, no audit trail | Phase 3 |
| `btm_pricing_rules` FKs to legacy `tours` | Pricing engine blocked from products | Phase 6 |
| No server-side authorization | RBAC bypass possible | Phase 4 |
| No traveler records | Headcount, passport, dietary — not stored | Phase 7 |
| No invoice system | No auditable financial record | Phase 8 |
| No immutable price snapshot | Price at booking time not locked | Phase 7 |
| No event-driven notifications | Manual communication | Phase 9 |
| No audit log | No change history for bookings/payments | Phase 10 |
| Two departure stacks (`departures` + `student_departures`) | Operational confusion | Phase 5 |
| No driver/guide assignment system | Manual coordination | Phase 11 |

---

## Part 3 — Target Architecture

### 3.1 Authoritative booking lifecycle

```
INQUIRY (web form / manual entry)
  └─→ CUSTOMER (clients table — canonical)
       └─→ BOOKING (op_bookings — one record per group)
            ├─→ PRODUCT (products — which tour)
            ├─→ DEPARTURE (departures — which date)
            ├─→ TRAVELERS (travelers — individual pax records)
            ├─→ PRICE SNAPSHOT (locked at confirmation time)
            ├─→ PAYMENT LEDGER (op_payments — deposit, balance, extras)
            ├─→ INVOICE (generated PDF, immutable)
            ├─→ CONFIRMATION (sent to customer)
            ├─→ OPERATIONS ASSIGNMENT
            │    ├─→ DRIVER (staff)
            │    ├─→ GUIDE (staff)
            │    └─→ VEHICLE (vehicles)
            ├─→ NOTIFICATION LOG (email + WhatsApp)
            └─→ AUDIT TRAIL (all changes, who/when/what)
```

### 3.2 Canonical data model

#### `clients` (customers)
```
id                  uuid PK
created_at          timestamptz
full_name           text NOT NULL
email               text UNIQUE NOT NULL
phone               text
whatsapp            text
nationality         text
passport_number     text
date_of_birth       date
dietary_requirements text
notes               text
preferred_language  text DEFAULT 'en'
source              text  -- website / whatsapp / direct / referral
gdpr_consent        boolean DEFAULT false
gdpr_consent_at     timestamptz
```

#### `products` (canonical tours — existing, extend only)
```
id                  uuid PK
created_at          timestamptz
title               text NOT NULL
slug                text UNIQUE NOT NULL
category            product_category NOT NULL
status              text DEFAULT 'draft'
description         text
duration_days       integer
price_from          numeric
currency            text DEFAULT 'EUR'
images              jsonb
itinerary           jsonb
included            jsonb
not_included        jsonb
highlights          jsonb
max_group_size      integer
min_group_size      integer DEFAULT 1
booking_type        booking_type
-- Phase 6 additions (via migration):
base_transport_cost numeric
base_guide_cost     numeric
margin_percent      numeric DEFAULT 20
```

#### `departures` (canonical — existing, extend only)
```
id                  uuid PK
product_id          uuid FK → products.id NOT NULL
departure_date      date NOT NULL
return_date         date
status              text DEFAULT 'open'  -- open / confirmed / cancelled / completed
max_capacity        integer
current_bookings    integer DEFAULT 0
notes               text
-- Phase 11 additions:
lead_guide_id       uuid FK → staff.id
lead_driver_id      uuid FK → staff.id
vehicle_id          uuid FK → vehicles.id
```

#### `op_bookings` (authoritative booking record — extend existing)
```
id                  uuid PK
created_at          timestamptz
booking_ref         text UNIQUE  -- human-readable e.g. BTM-2026-0042
client_id           uuid FK → clients.id  -- Phase 5: add FK
departure_id        uuid FK → departures.id  -- Phase 5: add FK
product_id          uuid FK → products.id  -- Phase 5: add FK
tour_name           text  -- denormalized snapshot at booking time
departure_date      date  -- denormalized snapshot
status              booking_status NOT NULL
pax_adults          integer DEFAULT 1
pax_children        integer DEFAULT 0
accommodation_tier  text  -- budget / standard / premium
special_requests    text
internal_notes      text
source              text  -- web_form / whatsapp / direct / agent
-- price snapshot (locked at confirmation):
price_per_person    numeric
total_price         numeric
currency            text DEFAULT 'EUR'
discount_code       text
discount_amount     numeric DEFAULT 0
-- staff assignment (Phase 11):
guide_id            uuid FK → staff.id
driver_id           uuid FK → staff.id
vehicle_id          uuid FK → vehicles.id
-- audit:
confirmed_at        timestamptz
cancelled_at        timestamptz
cancellation_reason text
```

#### `travelers` (new — Phase 7)
```
id                  uuid PK
booking_id          uuid FK → op_bookings.id NOT NULL
full_name           text NOT NULL
date_of_birth       date
nationality         text
passport_number     text
passport_expiry     date
dietary_requirements text
medical_notes       text
is_lead_traveler    boolean DEFAULT false
```

#### `op_payments` (existing — extend)
```
id                  uuid PK
booking_id          uuid FK → op_bookings.id NOT NULL
created_at          timestamptz
amount              numeric NOT NULL
currency            text DEFAULT 'EUR'
payment_type        payment_type  -- deposit / balance / extra / refund
payment_method      payment_method  -- paypal / stripe / wise / cash / bank_transfer
payment_date        date
reference           text  -- external transaction ID
notes               text
recorded_by         uuid FK → auth.users.id
```

#### `invoices` (new — Phase 8)
```
id                  uuid PK
booking_id          uuid FK → op_bookings.id NOT NULL
invoice_number      text UNIQUE  -- BTM-INV-2026-0042
issued_at           timestamptz
due_date            date
status              text  -- draft / issued / paid / overdue / cancelled
line_items          jsonb  -- immutable snapshot
subtotal            numeric
discount_amount     numeric DEFAULT 0
total               numeric
currency            text DEFAULT 'EUR'
notes               text
pdf_url             text  -- Supabase Storage
```

#### `notification_log` (new — Phase 9)
```
id                  uuid PK
created_at          timestamptz
booking_id          uuid FK → op_bookings.id
client_id           uuid FK → clients.id
channel             text  -- email / whatsapp
template            text
status              text  -- queued / sent / delivered / failed / bounced
external_id         text  -- Resend message ID
sent_by             uuid FK → auth.users.id  -- null = system
error_message       text
```

#### `audit_log` (new — Phase 10)
```
id                  uuid PK
created_at          timestamptz
table_name          text NOT NULL
record_id           uuid NOT NULL
action              text NOT NULL  -- INSERT / UPDATE / DELETE
changed_by          uuid FK → auth.users.id
old_values          jsonb
new_values          jsonb
ip_address          inet
```

---

## Part 4 — RBAC Model

### 4.1 Roles (current)

| Role | Scope |
|---|---|
| `super_admin` | Full access — owner only |
| `operations_manager` | Bookings, departures, staff, vehicles, finance view |
| `finance_manager` | Payments, pricing, coupons, reports |
| `sales_agent` | Inquiries, custom tours, customers, bookings view |
| `website_manager` | Products, content, homepage, navigation |
| `content_editor` | Blog, testimonials, FAQs, media |

### 4.2 Authorization principles

- All role checks must be enforced server-side (Supabase RLS or Edge functions)
- Client-side role checks (current `RoleContext.tsx`) are UI-only — not security boundaries
- Identity source: Supabase Auth (`auth.users`)
- Role assignment: `staff` table, column `role` — joined on `auth.users.id`
- Never authorize based solely on email address
- Google Workspace may eventually provide identity via OIDC — role assignment remains in `staff` table, not derived from Google

### 4.3 RLS policies (Phase 4 target)

Every table must have explicit RLS:
- `super_admin`: unrestricted
- Other roles: SELECT/INSERT/UPDATE/DELETE restricted by table and operation
- `clients`, `op_bookings`, `op_payments`: no public access
- `products`, `departures`: public SELECT (published only), authenticated full write
- `notification_log`, `audit_log`: INSERT only for system/admin; no DELETE for anyone

---

## Part 5 — Pricing Engine (Target)

### 5.1 Current state

`btm_pricing_rules` has FK → `tours.id` (legacy). This must be migrated to `products.id`.

### 5.2 Component-based pricing model

```
TOTAL PRICE = (transport_cost + accommodation_cost + guide_cost + fees) × (1 + margin/100)
              ÷ group_size
```

Components:
- **Transport**: daily rate × days (€130–180/day depending on vehicle type)
- **Accommodation**: per-night rate × nights × accommodation_tier
- **Guide**: day rate × days (region-specific)
- **Entry fees**: fixed per-person × adults (+ optional children rate)
- **Margin**: configurable per product (default 20%)

### 5.3 Target schema additions (Phase 6)

```sql
-- Migrate pricing rules from tours.id to products.id
ALTER TABLE btm_pricing_rules ADD COLUMN product_id uuid REFERENCES products(id);
UPDATE btm_pricing_rules SET product_id = (
  SELECT p.id FROM products p 
  JOIN tours t ON t.title = p.title  -- match by title
  WHERE t.id = btm_pricing_rules.tour_id
);
ALTER TABLE btm_pricing_rules ALTER COLUMN product_id SET NOT NULL;
-- Keep tour_id temporarily for rollback, remove after verification
```

---

## Part 6 — Notification Architecture

### 6.1 Email (existing + extend)

- Provider: **Resend** (`api.resend.com`)
- Current: booking confirmation + admin alert (public booking form only)
- Target: all booking lifecycle events trigger email
- Templates: `email_templates` table (HTML in Supabase, rendered server-side)

Events to cover:
- Inquiry received (customer + admin)
- Booking confirmed
- Deposit received
- Balance payment received / due reminder
- Tour date reminder (7 days before)
- Post-tour thank you + review request
- Cancellation

### 6.2 WhatsApp (Phase 9 — future)

- Current: phone numbers stored in `clients.whatsapp` and `staff.whatsapp`
- No API integration exists
- Target: WhatsApp Business API (Meta Cloud API or approved BSP)
- Requirements before implementation:
  - WhatsApp Business Account verified
  - Message templates pre-approved by Meta
  - Explicit opt-in consent recorded per customer (GDPR)
  - Opt-out handling
  - Per-message delivery/read receipts in `notification_log`
- Do NOT implement WhatsApp without verified business account and legal review

### 6.3 Notification queue

All notifications — email and WhatsApp — must:
1. Be enqueued (not sent inline in API handler)
2. Have idempotency keys (prevent duplicate sends on retry)
3. Log to `notification_log` with external provider ID
4. Be retryable on transient failure (3 attempts max)
5. Surface delivery failures to admin dashboard

---

## Part 7 — SEO & Public Site Architecture

### 7.1 Current state

- `www.besttravelmorocco.com` — React SPA
- Tour data: reads from `products` table (canonical)
- Static rendering: none (CSR only) — SEO risk for tour detail pages
- Booking form: submits to `inquiries` via Vercel Edge function

### 7.2 SEO principles (DO NOT VIOLATE)

- Tour slugs: never change a slug that has indexed traffic
- Tour URLs: `/morocco-tours/[slug]` — never restructure without 301 redirects
- Meta titles/descriptions: managed in `products` table
- Canonical tags: must be present on all indexed pages
- Structured data: JSON-LD for Tour, TouristTrip schema — implement Phase 13
- Sitemap: must be dynamically generated from `products` (published only)

### 7.3 Future: static generation (Phase 13)

Consider migrating public site to Next.js or Astro for SSG/ISR on tour pages. This is a separate project decision — do not start until Phase 12 is complete.

---

## Part 8 — Legacy Migration Strategy

### 8.1 `tours` table

- **17 locked tours**: READ-ONLY permanently. Do not alter, delete, or re-use their IDs.
- **3 non-locked tours**: Review individually. Do not auto-delete.
- FK dependencies (6 tables) must be migrated to `products.id` before `tours` can be deprecated.
- Migration order: pricing rules → faqs → tour_days → tour_accommodation_assignments → nav_dropdown_tours → custom_tour_requests → then `tours` can be marked archived.

### 8.2 Booking system consolidation

Two booking stacks currently exist:
- **Active**: `op_bookings` / `op_payments` (Supabase — used in admin)
- **Legacy**: `bookings` / `studentPaymentMethods` / `studentDepartures` (Drizzle ORM — partially unused)

Decision required before Phase 5:
- Audit which bookings (if any) exist only in the Drizzle/legacy stack
- Migrate any active records to `op_bookings`
- Retire the Drizzle/tRPC stack entirely — do NOT expand it

### 8.3 `inquiries` → `op_bookings` conversion

- Currently: manual process with no audit trail
- Target: admin UI action "Convert to Booking" that creates `op_bookings` + `clients` records atomically
- The original `inquiry` record must be preserved and linked to the created booking

---

## Part 9 — Phase-by-Phase Roadmap

### Phase 1 — Admin terminology + canonical source (COMPLETE)
- Dashboard reads from `products` (not `tours`)
- "New Tour" routes to `/products/new`
- Sidebar says "Tours" / "All Tours"
- Deployed: `dpl_CCErP7fDRXtvyHjoDcbY1QqFfYm5`

---

### Phase 2 — Inquiry-to-booking conversion flow
**Scope**: Admin UI — no DB schema changes yet

- "Convert to Booking" button on `InquiriesPage.tsx`
- Creates `op_bookings` record pre-filled from inquiry data
- Creates or links `clients` record (match by email)
- Links inquiry to booking via `inquiry_id` column (add via migration)
- Does NOT delete the original inquiry
- Status change: inquiry → `converted`
- Required migration: `ALTER TABLE inquiries ADD COLUMN converted_booking_id uuid REFERENCES op_bookings(id)`

Validation gates:
- Inquiry must have email to create/match client
- Duplicate booking detection (same email + product + departure date)
- Client deduplication: match on email, don't create duplicate client records

---

### Phase 3 — Booking reference numbers
**Scope**: DB + admin

- Add `booking_ref` column: `BTM-YYYY-NNNN` (auto-increment per year)
- Displayed in booking list, detail page, email templates
- Required migration: `ALTER TABLE op_bookings ADD COLUMN booking_ref text UNIQUE`
- Implement via Postgres sequence or trigger

---

### Phase 4 — Server-side authorization (RLS)
**Scope**: Supabase only — no frontend changes

- Enable RLS on all tables that don't have it
- Write explicit policies per table per role
- Test: verify that `sales_agent` cannot access `btm_pricing_rules`
- Test: verify that anonymous cannot read `op_bookings`
- The admin frontend currently relies on Supabase Auth session — RLS will enforce at DB level
- Do NOT change frontend role checks — they are UI convenience only

---

### Phase 5 — Client FK + booking consolidation
**Scope**: DB migration + admin UI updates

- Add `client_id uuid FK → clients.id` to `op_bookings`
- Add `departure_id uuid FK → departures.id` to `op_bookings`  
- Add `product_id uuid FK → products.id` to `op_bookings`
- Backfill existing records where possible (match by tour_name + date)
- Deprecate `student_departures` (after audit for active records)
- Consolidate departure management to single `departures` table
- Required validation: no booking can be created without a valid client and product

---

### Phase 6 — Pricing engine migration to products
**Scope**: DB migration + pricing admin UI

- Migrate `btm_pricing_rules` from `tour_id → tours.id` to `product_id → products.id`
- Verify all 17 locked tour pricing rules are migrated correctly
- Update pricing admin UI to reference `products` not `tours`
- Implement component-based price calculator (transport + accommodation + guide + fees + margin)
- Add price preview in product creation/edit form

---

### Phase 7 — Traveler records + price snapshot
**Scope**: New table + booking UI extension

- Create `travelers` table (individual pax per booking)
- Add traveler management to booking detail view
- Lock price snapshot at booking confirmation time (write to `op_bookings` price fields)
- Prevent price from changing after confirmation without explicit override (audit logged)

---

### Phase 8 — Invoice system
**Scope**: New table + PDF generation

- Create `invoices` table
- Auto-generate invoice on booking confirmation
- Invoice contains immutable line items (product, pax count, dates, price breakdown)
- PDF generation: server-side (Puppeteer on Edge Function or Supabase Edge)
- Store PDF in Supabase Storage
- Admin can download / re-send
- Invoice number sequence: `BTM-INV-YYYY-NNNN`

---

### Phase 9 — Email automation
**Scope**: Resend + notification_log

- Create `notification_log` table
- Trigger emails on booking lifecycle events (confirmed, deposit, balance, reminder, cancellation)
- All emails logged with Resend message IDs
- Idempotent: prevent duplicate sends if event fires twice
- Admin dashboard: notification history per booking
- Admin can manually re-send any notification

---

### Phase 10 — Audit trail
**Scope**: Supabase triggers

- Create `audit_log` table
- Postgres triggers on: `op_bookings`, `op_payments`, `clients`, `invoices`
- Capture: who changed what, old value, new value, timestamp
- Admin UI: audit history per booking (read-only)
- Log retention: minimum 5 years (financial records)

---

### Phase 11 — Operational dispatch
**Scope**: Staff + vehicle assignment

- Add `lead_guide_id`, `lead_driver_id`, `vehicle_id` to `departures`
- Assignment UI on departure detail view
- Availability check: flag conflicts (same guide/driver/vehicle on overlapping dates)
- Staff can view their assigned departures
- Future: driver/guide mobile view (not admin — separate product)

---

### Phase 12 — WhatsApp integration
**Scope**: Meta Business API + notification_log

- Only begin after: verified WhatsApp Business Account, approved message templates, legal review, consent capture in `clients` table
- Channel: Meta Cloud API (no third-party BSP)
- All messages logged to `notification_log`
- Opt-out: stored in `clients.whatsapp_opt_out boolean`
- Admin manual send: from booking detail view
- No automated WhatsApp without confirmed consent

---

### Phase 13 — Public site SEO hardening
**Scope**: Public site only

- Structured data (JSON-LD): TouristTrip per product page
- Dynamic sitemap from `products` (published only)
- Review SSG/ISR feasibility (Next.js/Astro migration decision)
- Core Web Vitals audit
- Image optimization pipeline

---

### Phase 14 — Customer portal (optional)
**Scope**: New public-facing authenticated section

- Customer can view their booking status
- Download invoice
- View itinerary
- Request changes (sends message to admin)
- Requires: Phase 5 (client FK), Phase 8 (invoice), Phase 9 (email)

---

### Phase 15 — Reporting & finance dashboard
**Scope**: Admin finance section

- Revenue by month / product / channel
- Booking conversion funnel (inquiry → converted → confirmed → paid)
- Outstanding balances report
- Departure occupancy report
- Guide/driver utilization report

---

### Phase 16 — Google Workspace identity (optional)
**Scope**: Auth layer

- SSO via Google OIDC for staff who have BTM Google Workspace accounts
- Role assignment still from `staff` table — not derived from Google group membership
- Fallback: email/password auth remains for accounts without Google Workspace
- Do not remove existing auth before Google SSO is verified working

---

## Part 10 — Development Rules (Permanent)

1. **Never modify approved content.** The 17 locked tours and their slugs are immutable.
2. **Extend, never redesign.** Add columns/tables; never drop working data.
3. **Everything must become intelligent and automated.** Manual data entry is a temporary state, not a feature.
4. **One source of truth per entity.** If `products` is canonical for tours, `tours` is read-only legacy. Never create a third parallel system.
5. **Always migrate before removing.** Every FK migration must run, verify, and backfill before the old column is dropped.
6. **Server-side enforcement only.** Client-side role checks are UI convenience. All security is in RLS and Edge functions.
7. **No booking without a client.** A booking is meaningless without a traceable customer record.
8. **Price snapshots are immutable.** The price at confirmation time is a legal record. Overrides must be audit-logged.
9. **Notifications are logged.** Every email and WhatsApp message sent must be in `notification_log`.
10. **Stop at safety boundaries.** If a change touches locked tours, production data, or public SEO, stop and get explicit approval.

---

## Part 11 — Hard Stop Conditions

The following MUST trigger a full stop and owner review before proceeding:

- Any change to a locked tour's `id`, `slug`, `title`, or content
- Any DROP TABLE or DROP COLUMN on a table with live data
- Any change to `products` that removes a published tour from the public site
- Any change to `auth.users` or RLS policies without a tested rollback
- Any production deployment without a validated artifact
- Any WhatsApp or email send to real customers from a test/staging environment
- Any change to `invoice` records (immutable after issue)
- Any migration that affects `btm_pricing_rules` without verifying all 17 locked tours have equivalent pricing rules in `products`

---

*End of document. Update this file as each phase is completed and as architectural decisions are made.*
