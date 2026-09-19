-- 003: tour_highlights + tour_faqs for tours_v2
CREATE TABLE IF NOT EXISTS tour_highlights (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id     UUID        NOT NULL REFERENCES tours_v2(id) ON DELETE CASCADE,
  text        TEXT        NOT NULL,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tour_highlights_tour ON tour_highlights(tour_id);

ALTER TABLE tour_highlights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_tour_highlights" ON tour_highlights;
CREATE POLICY "auth_tour_highlights" ON tour_highlights FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
DROP POLICY IF EXISTS "anon_tour_highlights_read" ON tour_highlights;
CREATE POLICY "anon_tour_highlights_read" ON tour_highlights FOR SELECT TO anon USING (TRUE);

-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tour_faqs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id     UUID        NOT NULL REFERENCES tours_v2(id) ON DELETE CASCADE,
  question    TEXT        NOT NULL,
  answer      TEXT        NOT NULL,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tour_faqs_tour ON tour_faqs(tour_id);

DROP TRIGGER IF EXISTS tour_faqs_updated_at ON tour_faqs;
CREATE TRIGGER tour_faqs_updated_at
  BEFORE UPDATE ON tour_faqs FOR EACH ROW
  EXECUTE FUNCTION tours_v2_update_updated_at();

ALTER TABLE tour_faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_tour_faqs" ON tour_faqs;
CREATE POLICY "auth_tour_faqs" ON tour_faqs FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
DROP POLICY IF EXISTS "anon_tour_faqs_read" ON tour_faqs;
CREATE POLICY "anon_tour_faqs_read" ON tour_faqs FOR SELECT TO anon USING (TRUE);
