/**
 * Accommodation Redesign Migration
 *
 * Changes:
 * - btm_accommodations: add destination, category (standard|luxury), description,
 *   images, website, contact_person, google_maps_link, seasonal rates, room rates,
 *   extra_bed_rate, child_policy; populate category from old tier values
 * - btm_pricing_rules: migrate accommodation_tier standard→boutique,
 *   superior→luxury, luxury→signature
 * - New tour_accommodation_assignments table
 */
const { Client } = require('pg');

const c = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined },
});

const statements = [
  // ── 1. btm_accommodations — add new columns ──────────────────────────────
  `ALTER TABLE btm_accommodations
    ADD COLUMN IF NOT EXISTS destination       TEXT NOT NULL DEFAULT 'Marrakech',
    ADD COLUMN IF NOT EXISTS category          TEXT NOT NULL DEFAULT 'standard',
    ADD COLUMN IF NOT EXISTS description       TEXT,
    ADD COLUMN IF NOT EXISTS images            TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS website           TEXT,
    ADD COLUMN IF NOT EXISTS contact_person    TEXT,
    ADD COLUMN IF NOT EXISTS google_maps_link  TEXT,
    ADD COLUMN IF NOT EXISTS low_season_rate   DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS mid_season_rate   DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS peak_season_rate  DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS double_room_rate  DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS family_room_rate  DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS extra_bed_rate    DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS child_policy      TEXT`,

  // ── 2. Backfill category from old tier (standard→standard, superior→standard, luxury→luxury)
  `UPDATE btm_accommodations
   SET category = CASE
     WHEN tier IN ('standard', 'superior') THEN 'standard'
     WHEN tier = 'luxury'                  THEN 'luxury'
     ELSE 'standard'
   END`,

  // ── 3. Backfill destination from city where possible
  `UPDATE btm_accommodations SET destination = city WHERE city IS NOT NULL AND city <> ''`,

  // ── 4. Migrate btm_pricing_rules tiers
  `UPDATE btm_pricing_rules SET accommodation_tier = 'boutique'   WHERE accommodation_tier = 'standard'`,
  `UPDATE btm_pricing_rules SET accommodation_tier = 'luxury'     WHERE accommodation_tier = 'superior'`,
  `UPDATE btm_pricing_rules SET accommodation_tier = 'signature'  WHERE accommodation_tier = 'luxury' AND accommodation_tier <> 'boutique'`,

  // ── 5. tour_accommodation_assignments ────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS tour_accommodation_assignments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id          TEXT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    destination      TEXT NOT NULL,
    category         TEXT NOT NULL DEFAULT 'standard',
    accommodation_id UUID REFERENCES btm_accommodations(id) ON DELETE SET NULL,
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tour_id, destination, category)
  )`,

  `ALTER TABLE tour_accommodation_assignments ENABLE ROW LEVEL SECURITY`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tour_accommodation_assignments' AND policyname='auth_all_tour_accom') THEN
      CREATE POLICY "auth_all_tour_accom" ON tour_accommodation_assignments
        FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tour_accommodation_assignments' AND policyname='anon_read_tour_accom') THEN
      CREATE POLICY "anon_read_tour_accom" ON tour_accommodation_assignments
        FOR SELECT TO anon USING (true);
    END IF;
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
      const rows = r.rowCount != null ? ` (${r.rowCount} rows affected)` : '';
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
