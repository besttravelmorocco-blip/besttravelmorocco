-- 002: tour_itinerary_days — per-day itinerary for tours_v2
CREATE TABLE IF NOT EXISTS tour_itinerary_days (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id       UUID        NOT NULL REFERENCES tours_v2(id) ON DELETE CASCADE,
  day_number    INTEGER     NOT NULL,
  title         TEXT        NOT NULL DEFAULT '',
  route         TEXT,
  description   TEXT,
  accommodation TEXT,
  meals         TEXT[],
  images        JSONB       NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tour_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_itinerary_days_tour ON tour_itinerary_days(tour_id);

DROP TRIGGER IF EXISTS itinerary_days_updated_at ON tour_itinerary_days;
CREATE TRIGGER itinerary_days_updated_at
  BEFORE UPDATE ON tour_itinerary_days FOR EACH ROW
  EXECUTE FUNCTION tours_v2_update_updated_at();

ALTER TABLE tour_itinerary_days ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_itinerary_days" ON tour_itinerary_days;
CREATE POLICY "auth_itinerary_days" ON tour_itinerary_days FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
DROP POLICY IF EXISTS "anon_itinerary_days_read" ON tour_itinerary_days;
CREATE POLICY "anon_itinerary_days_read" ON tour_itinerary_days FOR SELECT TO anon USING (TRUE);
