-- ============================================================================
-- Tourism Operating System — Extended Tables
-- Run once in Supabase Dashboard → SQL Editor
-- Project: uxkfqxistjvtofskqtwy
-- ============================================================================

-- ─── 1. Vehicles ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL DEFAULT 'SUV',
  make          TEXT,
  model         TEXT,
  year          INTEGER,
  license_plate TEXT,
  capacity      INTEGER NOT NULL DEFAULT 4,
  color         TEXT,
  fuel_type     TEXT DEFAULT 'diesel',
  notes         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. Accommodations (Hotels / Riads / Desert Camps) ───────────────────────
CREATE TABLE IF NOT EXISTS accommodations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type                    TEXT NOT NULL DEFAULT 'hotel',
  name                    TEXT NOT NULL,
  city                    TEXT,
  address                 TEXT,
  stars                   INTEGER,
  tier                    TEXT NOT NULL DEFAULT 'standard',
  contact_name            TEXT,
  contact_phone           TEXT,
  contact_email           TEXT,
  contracted_single_rate  DECIMAL(10,2),
  contracted_double_rate  DECIMAL(10,2),
  contracted_triple_rate  DECIMAL(10,2),
  capacity                INTEGER,
  amenities               TEXT[] DEFAULT '{}',
  photo_url               TEXT,
  notes                   TEXT,
  is_active               BOOLEAN NOT NULL DEFAULT true,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. Suppliers ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  type                TEXT DEFAULT 'other',
  city                TEXT,
  contact_name        TEXT,
  contact_phone       TEXT,
  contact_email       TEXT,
  service_description TEXT,
  contracted_rate     DECIMAL(10,2),
  currency            TEXT NOT NULL DEFAULT 'EUR',
  notes               TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. Seasons ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seasons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#C9A96E',
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  multiplier  DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT seasons_dates_check CHECK (end_date >= start_date)
);

-- ─── 5. Pricing Rules ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pricing_rules (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id            UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  season_id          UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  group_size_min     INTEGER NOT NULL DEFAULT 1,
  group_size_max     INTEGER NOT NULL DEFAULT 1,
  accommodation_tier TEXT NOT NULL DEFAULT 'standard',
  price_per_person   DECIMAL(10,2) NOT NULL,
  cost_per_person    DECIMAL(10,2),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pricing_rules_pax_check CHECK (group_size_max >= group_size_min),
  UNIQUE (tour_id, season_id, group_size_min, group_size_max, accommodation_tier)
);

-- ─── 6. Coupons ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              TEXT NOT NULL UNIQUE,
  description       TEXT,
  type              TEXT NOT NULL DEFAULT 'percentage',
  value             DECIMAL(10,2) NOT NULL,
  min_booking_value DECIMAL(10,2) DEFAULT 0,
  max_uses          INTEGER,
  used_count        INTEGER NOT NULL DEFAULT 0,
  valid_from        DATE,
  valid_until       DATE,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 7. Custom Tour Requests (Leads) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS custom_tour_requests (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name           TEXT NOT NULL,
  last_name            TEXT NOT NULL,
  email                TEXT NOT NULL,
  phone                TEXT,
  group_size           INTEGER NOT NULL DEFAULT 1,
  preferred_start_date DATE,
  duration_days        INTEGER,
  tour_id              UUID REFERENCES tours(id) ON DELETE SET NULL,
  tour_name            TEXT,
  budget_per_person    DECIMAL(10,2),
  special_requirements TEXT,
  source               TEXT NOT NULL DEFAULT 'website',
  status               TEXT NOT NULL DEFAULT 'new',
  assigned_to          TEXT,
  follow_up_date       DATE,
  quoted_price         DECIMAL(10,2),
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 8. Email Templates ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_templates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  trigger    TEXT NOT NULL UNIQUE,
  subject    TEXT NOT NULL,
  body_html  TEXT NOT NULL,
  variables  TEXT[] DEFAULT '{}',
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE vehicles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons              ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules        ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons              ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_tour_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all_vehicles"             ON vehicles             FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_accommodations"       ON accommodations       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_suppliers"            ON suppliers            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_seasons"              ON seasons              FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_pricing_rules"        ON pricing_rules        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_coupons"              ON coupons              FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_custom_tour_requests" ON custom_tour_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_email_templates"      ON email_templates      FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public site can read seasons + pricing (for booking widget)
CREATE POLICY "anon_read_seasons"       ON seasons       FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "anon_read_pricing_rules" ON pricing_rules FOR SELECT TO anon USING (true);
-- Public site can submit custom tour requests
CREATE POLICY "anon_insert_custom_tour_requests" ON custom_tour_requests FOR INSERT TO anon WITH CHECK (true);

-- ─── Seed: Seasons ────────────────────────────────────────────────────────────
INSERT INTO seasons (name, color, start_date, end_date, multiplier, description) VALUES
  ('High Season',     '#F59E0B', '2026-03-01', '2026-05-31', 1.20, 'Spring — peak demand, mild weather, cherry blossoms'),
  ('Low Season',      '#6366F1', '2026-06-01', '2026-08-31', 0.85, 'Summer — hot inland, quieter, best discounts'),
  ('Shoulder Season', '#10B981', '2026-09-01', '2026-11-30', 1.00, 'Autumn — comfortable temperatures, moderate demand'),
  ('Winter Season',   '#60A5FA', '2026-12-01', '2027-02-28', 1.10, 'Winter — cold desert nights, festive demand')
ON CONFLICT DO NOTHING;

-- ─── Seed: Email Templates ───────────────────────────────────────────────────
INSERT INTO email_templates (name, trigger, subject, body_html, variables) VALUES
(
  'Booking Confirmation',
  'booking_confirmation',
  'Your Morocco Tour is Confirmed – {{reference}}',
  '<h2>Hi {{client_name}},</h2>
<p>Great news! Your tour has been confirmed.</p>
<table style="border-collapse:collapse;width:100%;max-width:480px">
  <tr><td style="padding:6px 0"><strong>Reference</strong></td><td>{{reference}}</td></tr>
  <tr><td style="padding:6px 0"><strong>Tour</strong></td><td>{{tour_name}}</td></tr>
  <tr><td style="padding:6px 0"><strong>Start Date</strong></td><td>{{start_date}}</td></tr>
  <tr><td style="padding:6px 0"><strong>Guests</strong></td><td>{{num_adults}} adults</td></tr>
  <tr><td style="padding:6px 0"><strong>Total Price</strong></td><td>{{total_price}}</td></tr>
  <tr><td style="padding:6px 0"><strong>Deposit Due</strong></td><td>{{deposit_amount}}</td></tr>
</table>
<p>Please transfer your deposit to secure your booking. Bank details will follow separately.</p>
<p>We look forward to welcoming you to Morocco!</p>
<p>Best regards,<br><strong>Best Travel Morocco</strong></p>',
  ARRAY['client_name', 'reference', 'tour_name', 'start_date', 'num_adults', 'total_price', 'deposit_amount']
),
(
  'Deposit Received',
  'deposit_receipt',
  'Deposit Received – Booking {{reference}}',
  '<h2>Hi {{client_name}},</h2>
<p>We have received your deposit of <strong>{{deposit_amount}}</strong> for booking <strong>{{reference}}</strong>.</p>
<p>Your tour is now fully confirmed. The remaining balance of <strong>{{balance_due}}</strong> is payable before your departure on <strong>{{start_date}}</strong>.</p>
<p>Best regards,<br><strong>Best Travel Morocco</strong></p>',
  ARRAY['client_name', 'reference', 'deposit_amount', 'balance_due', 'start_date']
),
(
  'Balance Payment Reminder',
  'balance_reminder',
  'Balance Payment Due – Booking {{reference}}',
  '<h2>Hi {{client_name}},</h2>
<p>Your Morocco tour starts soon! This is a reminder that your remaining balance of <strong>{{balance_due}}</strong> for booking <strong>{{reference}}</strong> is now due.</p>
<p>Your tour departs on <strong>{{start_date}}</strong>.</p>
<p>Best regards,<br><strong>Best Travel Morocco</strong></p>',
  ARRAY['client_name', 'reference', 'balance_due', 'start_date']
),
(
  'Pre-Tour Information',
  'pre_tour',
  'Your Morocco Tour Starts in {{days_until}} Days – Important Info',
  '<h2>Hi {{client_name}},</h2>
<p>Your tour begins in <strong>{{days_until}} days</strong>! Here is everything you need to know.</p>
<p><strong>Pickup Location:</strong> {{pickup_location}}<br>
<strong>Pickup Time:</strong> {{pickup_time}}</p>
<h3>What to Bring</h3>
<ul>
  <li>Valid passport</li>
  <li>Travel insurance documents</li>
  <li>Comfortable walking shoes</li>
  <li>Sun protection (hat, sunscreen)</li>
  <li>Light layers for cool evenings</li>
</ul>
<p>Best regards,<br><strong>Best Travel Morocco</strong></p>',
  ARRAY['client_name', 'days_until', 'pickup_location', 'pickup_time']
),
(
  'Post-Tour Review Request',
  'review_request',
  'How Was Your Morocco Experience? Share Your Story',
  '<h2>Hi {{client_name}},</h2>
<p>We hope you had an incredible experience in Morocco!</p>
<p>Your review helps other travellers discover the best of Morocco and means everything to our small team.</p>
<p>It only takes 2 minutes — we''d be so grateful for your feedback.</p>
<p>Warm regards,<br><strong>Best Travel Morocco Team</strong></p>',
  ARRAY['client_name', 'tour_name']
)
ON CONFLICT (trigger) DO NOTHING;
