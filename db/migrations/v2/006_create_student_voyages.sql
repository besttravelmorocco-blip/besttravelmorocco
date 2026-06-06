-- 006: student_voyages — Semester at Sea voyage data
CREATE TABLE IF NOT EXISTS student_voyages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  voyage_name     TEXT        NOT NULL,
  year            INTEGER     NOT NULL,
  start_date      TEXT,
  end_date        TEXT,
  port_stops      JSONB       NOT NULL DEFAULT '[]',
  morocco_port    TEXT,
  morocco_arrival TEXT,
  morocco_days    INTEGER     NOT NULL DEFAULT 0,
  source_url      TEXT,
  raw_data        JSONB,
  synced_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(voyage_name, year)
);

CREATE INDEX IF NOT EXISTS idx_student_voyages_year ON student_voyages(year);

DROP TRIGGER IF EXISTS student_voyages_updated_at ON student_voyages;
CREATE TRIGGER student_voyages_updated_at
  BEFORE UPDATE ON student_voyages FOR EACH ROW
  EXECUTE FUNCTION tours_v2_update_updated_at();

ALTER TABLE student_voyages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_student_voyages" ON student_voyages;
CREATE POLICY "auth_student_voyages" ON student_voyages FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
DROP POLICY IF EXISTS "anon_student_voyages_read" ON student_voyages;
CREATE POLICY "anon_student_voyages_read" ON student_voyages FOR SELECT TO anon USING (TRUE);
