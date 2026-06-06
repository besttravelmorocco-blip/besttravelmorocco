-- 001: tours_v2 — rich tour schema with slug, type, PDF, status
CREATE TABLE IF NOT EXISTS tours_v2 (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT        NOT NULL UNIQUE,
  title       TEXT        NOT NULL,
  subtitle    TEXT,
  description TEXT,
  type        TEXT        NOT NULL DEFAULT 'private',  -- private | group | student | luxury
  status      TEXT        NOT NULL DEFAULT 'draft',    -- draft | active | archived
  days        INTEGER     NOT NULL DEFAULT 1,
  nights      INTEGER     GENERATED ALWAYS AS (CASE WHEN days > 0 THEN days - 1 ELSE 0 END) STORED,
  from_city   TEXT,
  to_city     TEXT,
  image       TEXT,
  gallery     JSONB       NOT NULL DEFAULT '[]',
  pdf_url     TEXT,
  featured    BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  meta_title  TEXT,
  meta_desc   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tours_v2_slug   ON tours_v2(slug);
CREATE INDEX IF NOT EXISTS idx_tours_v2_status ON tours_v2(status);
CREATE INDEX IF NOT EXISTS idx_tours_v2_type   ON tours_v2(type);

CREATE OR REPLACE FUNCTION tours_v2_update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS tours_v2_updated_at ON tours_v2;
CREATE TRIGGER tours_v2_updated_at
  BEFORE UPDATE ON tours_v2 FOR EACH ROW EXECUTE FUNCTION tours_v2_update_updated_at();

ALTER TABLE tours_v2 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_tours_v2" ON tours_v2;
CREATE POLICY "auth_tours_v2" ON tours_v2 FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
DROP POLICY IF EXISTS "anon_tours_v2_read" ON tours_v2;
CREATE POLICY "anon_tours_v2_read" ON tours_v2 FOR SELECT TO anon USING (status = 'active');
