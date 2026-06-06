-- 007: booking_calendar — per-tour date availability
CREATE TABLE IF NOT EXISTS booking_calendar (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id     UUID        NOT NULL REFERENCES tours_v2(id) ON DELETE CASCADE,
  date        TEXT        NOT NULL,  -- YYYY-MM-DD
  status      TEXT        NOT NULL DEFAULT 'open', -- open | blocked | full
  max_pax     INTEGER     NOT NULL DEFAULT 12,
  booked_pax  INTEGER     NOT NULL DEFAULT 0,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tour_id, date)
);

CREATE INDEX IF NOT EXISTS idx_booking_calendar_tour ON booking_calendar(tour_id);
CREATE INDEX IF NOT EXISTS idx_booking_calendar_date ON booking_calendar(date);

DROP TRIGGER IF EXISTS booking_calendar_updated_at ON booking_calendar;
CREATE TRIGGER booking_calendar_updated_at
  BEFORE UPDATE ON booking_calendar FOR EACH ROW
  EXECUTE FUNCTION tours_v2_update_updated_at();

ALTER TABLE booking_calendar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_booking_calendar" ON booking_calendar;
CREATE POLICY "auth_booking_calendar" ON booking_calendar FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
DROP POLICY IF EXISTS "anon_booking_calendar_read" ON booking_calendar;
CREATE POLICY "anon_booking_calendar_read" ON booking_calendar FOR SELECT TO anon USING (TRUE);
