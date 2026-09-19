/**
 * Experience Products Migration
 *
 * Creates experience_products table for the three new product types:
 * - yoga_retreat   → fixed pricing, fixed_dates departure
 * - upcoming_trip  → fixed pricing, fixed_dates departure
 * - student_trip   → flexible pricing, flexible_window departure
 *
 * Run from /Users/hmad/besttravelmorocco with:
 * NODE_TLS_REJECT_UNAUTHORIZED=0 DATABASE_URL="postgres://..." node scripts/run-experience-products-migration.cjs
 */
const { Client } = require('pg');

const c = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined },
});

const statements = [
  // ── 1. Main table ──────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS experience_products (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               TEXT NOT NULL,
    slug                TEXT NOT NULL UNIQUE,
    type                TEXT NOT NULL
                          CHECK (type IN ('yoga_retreat', 'student_trip', 'upcoming_trip')),
    description         TEXT,
    highlights          TEXT[]        DEFAULT '{}',
    itinerary           JSONB         DEFAULT '[]',
    duration_days       INTEGER,
    duration_nights     INTEGER,
    departure_type      TEXT NOT NULL DEFAULT 'fixed_dates'
                          CHECK (departure_type IN ('fixed_dates', 'flexible_window')),
    fixed_departures    DATE[]        DEFAULT '{}',
    flexible_months     TEXT[]        DEFAULT '{}',
    pricing_model       TEXT NOT NULL DEFAULT 'fixed'
                          CHECK (pricing_model IN ('fixed', 'flexible')),
    price_per_person    DECIMAL(10,2),
    starting_price      DECIMAL(10,2),
    included            TEXT[]        DEFAULT '{}',
    excluded            TEXT[]        DEFAULT '{}',
    images              TEXT[]        DEFAULT '{}',
    accommodation_level TEXT,
    capacity            INTEGER,
    min_group_size      INTEGER,
    max_group_size      INTEGER,
    status              TEXT NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'published')),
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
  )`,

  // ── 2. Indexes ─────────────────────────────────────────────────────────────
  `CREATE INDEX IF NOT EXISTS exp_products_type_idx   ON experience_products(type)`,
  `CREATE INDEX IF NOT EXISTS exp_products_status_idx ON experience_products(status)`,
  `CREATE INDEX IF NOT EXISTS exp_products_slug_idx   ON experience_products(slug)`,

  // ── 3. RLS ─────────────────────────────────────────────────────────────────
  `ALTER TABLE experience_products ENABLE ROW LEVEL SECURITY`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experience_products' AND policyname='auth_all_experiences') THEN
      CREATE POLICY "auth_all_experiences" ON experience_products
        FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experience_products' AND policyname='anon_read_published_experiences') THEN
      CREATE POLICY "anon_read_published_experiences" ON experience_products
        FOR SELECT TO anon USING (status = 'published');
    END IF;
  END $$`,

  // ── 4. Auto-update updated_at ──────────────────────────────────────────────
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'experience_products_updated_at') THEN
      CREATE TRIGGER experience_products_updated_at
        BEFORE UPDATE ON experience_products
        FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
    END IF;
  EXCEPTION WHEN undefined_function THEN
    NULL; -- moddatetime extension not available; updated_at managed in app
  END $$`,
];

async function run() {
  await c.connect();
  console.log('Connected.\n');

  let ok = 0, skip = 0, fail = 0;
  for (const stmt of statements) {
    const label = stmt.trim().replace(/\s+/g, ' ').slice(0, 80) + '…';
    try {
      const r = await c.query(stmt);
      const rows = r.rowCount != null ? ` (${r.rowCount} rows)` : '';
      console.log(`✓ ${label}${rows}`);
      ok++;
    } catch (e) {
      if (e.message.includes('already exists') || e.message.includes('duplicate')) {
        console.log(`⚬ skip: ${label}`);
        skip++;
      } else {
        console.error(`✗ FAIL: ${label}`);
        console.error(`   ${e.message}`);
        fail++;
      }
    }
  }

  console.log(`\nDone: ${ok} ok, ${skip} skipped, ${fail} failed`);
  await c.end();
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
