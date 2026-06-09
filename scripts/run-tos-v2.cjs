/**
 * TOS v2 Migration — creates only the tables that don't exist yet.
 * Uses btm_accommodations / btm_seasons / btm_pricing_rules to avoid
 * conflicting with the legacy booking-engine tables of the same names.
 * tour_id is TEXT to match tours.id (varchar).
 */
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined },
});

const statements = [
  // ── Vehicles ────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS vehicles (
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
  )`,

  // ── Suppliers ───────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS suppliers (
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
  )`,

  // ── BTM Accommodations (hotels/riads/camps with contracted rates) ───────
  `CREATE TABLE IF NOT EXISTS btm_accommodations (
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
  )`,

  // ── BTM Seasons (date-range based, for pricing engine) ──────────────────
  `CREATE TABLE IF NOT EXISTS btm_seasons (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    color       TEXT NOT NULL DEFAULT '#C9A96E',
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    multiplier  DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT btm_seasons_dates_check CHECK (end_date >= start_date)
  )`,

  // ── BTM Pricing Rules (per tour × season × group size × accommodation tier)
  `CREATE TABLE IF NOT EXISTS btm_pricing_rules (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id            TEXT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    season_id          UUID NOT NULL REFERENCES btm_seasons(id) ON DELETE CASCADE,
    group_size_min     INTEGER NOT NULL DEFAULT 1,
    group_size_max     INTEGER NOT NULL DEFAULT 1,
    accommodation_tier TEXT NOT NULL DEFAULT 'standard',
    price_per_person   DECIMAL(10,2) NOT NULL,
    cost_per_person    DECIMAL(10,2),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT btm_pricing_pax_check CHECK (group_size_max >= group_size_min),
    UNIQUE (tour_id, season_id, group_size_min, group_size_max, accommodation_tier)
  )`,

  // ── Coupons ─────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS coupons (
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
  )`,

  // ── Custom Tour Requests ─────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS custom_tour_requests (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name           TEXT NOT NULL,
    last_name            TEXT NOT NULL,
    email                TEXT NOT NULL,
    phone                TEXT,
    group_size           INTEGER NOT NULL DEFAULT 1,
    preferred_start_date DATE,
    duration_days        INTEGER,
    tour_id              TEXT REFERENCES tours(id) ON DELETE SET NULL,
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
  )`,

  // ── Email Templates ──────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS email_templates (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    trigger    TEXT NOT NULL UNIQUE,
    subject    TEXT NOT NULL,
    body_html  TEXT NOT NULL,
    variables  TEXT[] DEFAULT '{}',
    is_active  BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  // ── RLS ──────────────────────────────────────────────────────────────────
  `ALTER TABLE vehicles             ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE suppliers            ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE btm_accommodations   ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE btm_seasons          ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE btm_pricing_rules    ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE coupons              ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE custom_tour_requests ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE email_templates      ENABLE ROW LEVEL SECURITY`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='vehicles' AND policyname='auth_all_vehicles') THEN
      CREATE POLICY "auth_all_vehicles" ON vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='suppliers' AND policyname='auth_all_suppliers') THEN
      CREATE POLICY "auth_all_suppliers" ON suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='btm_accommodations' AND policyname='auth_all_btm_accommodations') THEN
      CREATE POLICY "auth_all_btm_accommodations" ON btm_accommodations FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='btm_seasons' AND policyname='auth_all_btm_seasons') THEN
      CREATE POLICY "auth_all_btm_seasons" ON btm_seasons FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='btm_pricing_rules' AND policyname='auth_all_btm_pricing_rules') THEN
      CREATE POLICY "auth_all_btm_pricing_rules" ON btm_pricing_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupons' AND policyname='auth_all_coupons') THEN
      CREATE POLICY "auth_all_coupons" ON coupons FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='custom_tour_requests' AND policyname='auth_all_custom_tour_requests') THEN
      CREATE POLICY "auth_all_custom_tour_requests" ON custom_tour_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='email_templates' AND policyname='auth_all_email_templates') THEN
      CREATE POLICY "auth_all_email_templates" ON email_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='btm_seasons' AND policyname='anon_read_btm_seasons') THEN
      CREATE POLICY "anon_read_btm_seasons" ON btm_seasons FOR SELECT TO anon USING (is_active = true);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='btm_pricing_rules' AND policyname='anon_read_btm_pricing_rules') THEN
      CREATE POLICY "anon_read_btm_pricing_rules" ON btm_pricing_rules FOR SELECT TO anon USING (true);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='custom_tour_requests' AND policyname='anon_insert_custom_tour_requests') THEN
      CREATE POLICY "anon_insert_custom_tour_requests" ON custom_tour_requests FOR INSERT TO anon WITH CHECK (true);
    END IF;
  END $$`,

  // ── Seed: BTM Seasons ────────────────────────────────────────────────────
  `INSERT INTO btm_seasons (name, color, start_date, end_date, multiplier, description) VALUES
    ('High Season',     '#F59E0B', '2026-03-01', '2026-05-31', 1.20, 'Spring — peak demand, mild weather'),
    ('Low Season',      '#6366F1', '2026-06-01', '2026-08-31', 0.85, 'Summer — hot inland, quietest period'),
    ('Shoulder Season', '#10B981', '2026-09-01', '2026-11-30', 1.00, 'Autumn — comfortable temperatures'),
    ('Winter Season',   '#60A5FA', '2026-12-01', '2027-02-28', 1.10, 'Winter — cold desert nights')
  ON CONFLICT DO NOTHING`,

  // ── Seed: Email Templates ────────────────────────────────────────────────
  `INSERT INTO email_templates (name, trigger, subject, body_html, variables) VALUES
  (
    'Booking Confirmation',
    'booking_confirmation',
    'Your Morocco Tour is Confirmed – {{reference}}',
    '<h2>Hi {{client_name}},</h2><p>Your tour <strong>{{tour_name}}</strong> on <strong>{{start_date}}</strong> is confirmed.</p><p>Reference: {{reference}} | Total: {{total_price}} | Deposit due: {{deposit_amount}}</p><p>Best regards,<br>Best Travel Morocco</p>',
    ARRAY['client_name', 'reference', 'tour_name', 'start_date', 'num_adults', 'total_price', 'deposit_amount']
  ),
  (
    'Deposit Received',
    'deposit_receipt',
    'Deposit Received – Booking {{reference}}',
    '<h2>Hi {{client_name}},</h2><p>Deposit of <strong>{{deposit_amount}}</strong> received for booking <strong>{{reference}}</strong>. Balance of <strong>{{balance_due}}</strong> due before {{start_date}}.</p><p>Best Travel Morocco</p>',
    ARRAY['client_name', 'reference', 'deposit_amount', 'balance_due', 'start_date']
  ),
  (
    'Balance Payment Reminder',
    'balance_reminder',
    'Balance Payment Due – Booking {{reference}}',
    '<h2>Hi {{client_name}},</h2><p>Your balance of <strong>{{balance_due}}</strong> for booking {{reference}} (departing {{start_date}}) is now due.</p><p>Best Travel Morocco</p>',
    ARRAY['client_name', 'reference', 'balance_due', 'start_date']
  ),
  (
    'Pre-Tour Information',
    'pre_tour',
    'Your Morocco Tour Starts in {{days_until}} Days',
    '<h2>Hi {{client_name}},</h2><p>Your tour begins in <strong>{{days_until}} days</strong>!</p><p>Pickup: <strong>{{pickup_location}}</strong> at <strong>{{pickup_time}}</strong>.</p><p>Best Travel Morocco</p>',
    ARRAY['client_name', 'days_until', 'pickup_location', 'pickup_time']
  ),
  (
    'Post-Tour Review Request',
    'review_request',
    'How Was Your Morocco Experience?',
    '<h2>Hi {{client_name}},</h2><p>We hope you had an amazing time in Morocco! Your review means the world to us and helps other travellers.</p><p>Best Travel Morocco Team</p>',
    ARRAY['client_name', 'tour_name']
  )
  ON CONFLICT (trigger) DO NOTHING`,
];

async function run() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL\n');

  let passed = 0;
  let skipped = 0;

  for (const sql of statements) {
    const label = sql.trim().slice(0, 60).replace(/\s+/g, ' ') + '…';
    try {
      await client.query(sql);
      console.log(`✓ ${label}`);
      passed++;
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('duplicate key')) {
        console.log(`⚬ (skip) ${label}`);
        skipped++;
      } else {
        console.error(`✗ FAILED: ${label}`);
        console.error(`  ${err.message}`);
      }
    }
  }

  console.log(`\nDone: ${passed} executed, ${skipped} skipped`);
  await client.end();
}

run().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
