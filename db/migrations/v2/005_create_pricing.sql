-- 005: pricing_tiers + seasons + pricing_overrides
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT        NOT NULL UNIQUE, -- budget | standard | comfort | luxury | vip
  label       TEXT        NOT NULL,
  multiplier  NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  description TEXT,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO pricing_tiers (slug, label, multiplier, description, sort_order) VALUES
  ('budget',   'Budget',    0.85, 'Shared transport, budget hotels', 1),
  ('standard', 'Standard',  1.00, 'Private transport, 3-star hotels', 2),
  ('comfort',  'Comfort',   1.30, 'Private transport, 4-star hotels', 3),
  ('luxury',   'Luxury',    1.65, 'Premium transport, 5-star hotels', 4),
  ('vip',      'VIP',       2.20, 'Exclusive transport, luxury riads', 5)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_pricing_tiers" ON pricing_tiers;
CREATE POLICY "auth_pricing_tiers" ON pricing_tiers FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
DROP POLICY IF EXISTS "anon_pricing_tiers_read" ON pricing_tiers;
CREATE POLICY "anon_pricing_tiers_read" ON pricing_tiers FOR SELECT TO anon USING (TRUE);

-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seasons (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,  -- Low | Mid | High
  months      INTEGER[]   NOT NULL,  -- [1,2,7,8] etc.
  multiplier  NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO seasons (name, months, multiplier) VALUES
  ('Low Season',  ARRAY[1,2,7,8],    1.00),
  ('Mid Season',  ARRAY[3,6,9,11],   1.20),
  ('High Season', ARRAY[4,5,10,12],  1.50)
ON CONFLICT DO NOTHING;

ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_seasons" ON seasons;
CREATE POLICY "auth_seasons" ON seasons FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
DROP POLICY IF EXISTS "anon_seasons_read" ON seasons;
CREATE POLICY "anon_seasons_read" ON seasons FOR SELECT TO anon USING (TRUE);

-- ─────────────────────────────────────────────────────────────
-- Per-tour base pricing (price before tier/season multipliers)
CREATE TABLE IF NOT EXISTS pricing_overrides (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id     UUID        NOT NULL REFERENCES tours_v2(id) ON DELETE CASCADE,
  season_id   UUID        REFERENCES seasons(id) ON DELETE SET NULL,
  tier_slug   TEXT        NOT NULL DEFAULT 'standard',
  base_price  INTEGER     NOT NULL DEFAULT 0,
  currency    TEXT        NOT NULL DEFAULT 'EUR',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tour_id, season_id, tier_slug)
);

CREATE INDEX IF NOT EXISTS idx_pricing_overrides_tour   ON pricing_overrides(tour_id);
CREATE INDEX IF NOT EXISTS idx_pricing_overrides_season ON pricing_overrides(season_id);

ALTER TABLE pricing_overrides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_pricing_overrides" ON pricing_overrides;
CREATE POLICY "auth_pricing_overrides" ON pricing_overrides FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
DROP POLICY IF EXISTS "anon_pricing_overrides_read" ON pricing_overrides;
CREATE POLICY "anon_pricing_overrides_read" ON pricing_overrides FOR SELECT TO anon USING (TRUE);
