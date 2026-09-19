-- 004: accommodations + tour_accommodation_links
CREATE TABLE IF NOT EXISTS accommodations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  city            TEXT        NOT NULL,
  category        TEXT        NOT NULL DEFAULT 'standard', -- budget | standard | comfort | luxury | vip
  price_per_night INTEGER     NOT NULL DEFAULT 0,
  currency        TEXT        NOT NULL DEFAULT 'EUR',
  stars           INTEGER,
  image           TEXT,
  notes           TEXT,
  active          BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accommodations_city     ON accommodations(city);
CREATE INDEX IF NOT EXISTS idx_accommodations_category ON accommodations(category);
CREATE INDEX IF NOT EXISTS idx_accommodations_active   ON accommodations(active);

DROP TRIGGER IF EXISTS accommodations_updated_at ON accommodations;
CREATE TRIGGER accommodations_updated_at
  BEFORE UPDATE ON accommodations FOR EACH ROW
  EXECUTE FUNCTION tours_v2_update_updated_at();

ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_accommodations" ON accommodations;
CREATE POLICY "auth_accommodations" ON accommodations FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
DROP POLICY IF EXISTS "anon_accommodations_read" ON accommodations;
CREATE POLICY "anon_accommodations_read" ON accommodations FOR SELECT TO anon USING (active = TRUE);

-- ─────────────────────────────────────────────────────────────
-- Links a tour to its accommodations per pricing tier and day range
CREATE TABLE IF NOT EXISTS tour_accommodation_links (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id          UUID        NOT NULL REFERENCES tours_v2(id) ON DELETE CASCADE,
  accommodation_id UUID        NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  tier             TEXT        NOT NULL DEFAULT 'standard', -- budget | standard | comfort | luxury | vip
  night_from       INTEGER     NOT NULL DEFAULT 1,
  night_to         INTEGER     NOT NULL DEFAULT 1,
  sort_order       INTEGER     NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accommodation_links_tour ON tour_accommodation_links(tour_id);
CREATE INDEX IF NOT EXISTS idx_accommodation_links_acc  ON tour_accommodation_links(accommodation_id);

ALTER TABLE tour_accommodation_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_accommodation_links" ON tour_accommodation_links;
CREATE POLICY "auth_accommodation_links" ON tour_accommodation_links FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
DROP POLICY IF EXISTS "anon_accommodation_links_read" ON tour_accommodation_links;
CREATE POLICY "anon_accommodation_links_read" ON tour_accommodation_links FOR SELECT TO anon USING (TRUE);
