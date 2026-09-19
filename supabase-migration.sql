-- ═══════════════════════════════════════════════════════════════════════════
-- BEST TRAVEL MOROCCO — BOOKING SYSTEM MIGRATION
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query
-- Project: uxkfqxistjvtofskqtwy
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── CLIENTS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  email       TEXT,
  phone       TEXT,
  whatsapp    TEXT,
  nationality TEXT,
  hotel       TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── STAFF ────────────────────────────────────────────────────────────────────
-- role: driver | guide_fes | guide_marrakech | guide_volubilis | guide_general | manager
CREATE TABLE IF NOT EXISTS staff (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'driver',
  phone       TEXT,
  whatsapp    TEXT,
  email       TEXT,
  photo_url   TEXT,
  languages   TEXT[]      NOT NULL DEFAULT '{}',
  available   BOOLEAN     NOT NULL DEFAULT TRUE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── OPERATIONAL BOOKINGS ─────────────────────────────────────────────────────
-- status pipeline: enquiry → quoted → confirmed → active → completed | cancelled
CREATE TABLE IF NOT EXISTS op_bookings (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reference            TEXT        NOT NULL UNIQUE
                                   DEFAULT 'BTM-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)),

  -- ── Client (denormalised for speed + linked)
  client_id            UUID        REFERENCES clients(id) ON DELETE SET NULL,
  client_name          TEXT        NOT NULL DEFAULT '',
  client_email         TEXT,
  client_phone         TEXT,
  client_whatsapp      TEXT,
  client_nationality   TEXT,
  client_hotel         TEXT,

  -- ── Tour
  tour_id              TEXT,
  tour_name            TEXT        NOT NULL DEFAULT '',
  start_date           TEXT,
  end_date             TEXT,
  num_adults           INTEGER     NOT NULL DEFAULT 1,
  num_children         INTEGER     NOT NULL DEFAULT 0,
  pickup_location      TEXT,
  pickup_time          TEXT        DEFAULT '08:00',

  -- ── Staff assignment
  driver_id            UUID        REFERENCES staff(id) ON DELETE SET NULL,
  guide_fes_id         UUID        REFERENCES staff(id) ON DELETE SET NULL,
  guide_marrakech_id   UUID        REFERENCES staff(id) ON DELETE SET NULL,
  guide_volubilis_id   UUID        REFERENCES staff(id) ON DELETE SET NULL,

  -- ── Pricing (whole currency units, e.g. 490 = €490)
  total_price          INTEGER,
  currency             TEXT        NOT NULL DEFAULT 'EUR',
  deposit_amount       INTEGER,
  deposit_method       TEXT,        -- paypal | stripe | wise | cash | bank_transfer
  deposit_reference    TEXT,
  deposit_paid         BOOLEAN     NOT NULL DEFAULT FALSE,
  deposit_paid_date    TEXT,
  balance_paid         BOOLEAN     NOT NULL DEFAULT FALSE,
  balance_paid_date    TEXT,

  -- ── Status
  status               TEXT        NOT NULL DEFAULT 'enquiry',

  -- ── Itinerary override (day-by-day JSON array)
  itinerary            JSONB,

  -- ── Notes
  internal_notes       TEXT,
  client_notes         TEXT,
  special_requirements TEXT,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PAYMENT RECORDS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS op_payments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID        NOT NULL REFERENCES op_bookings(id) ON DELETE CASCADE,
  amount      INTEGER     NOT NULL,
  currency    TEXT        NOT NULL DEFAULT 'EUR',
  type        TEXT        NOT NULL,  -- deposit | balance | extra | refund
  method      TEXT        NOT NULL,  -- paypal | stripe | wise | cash | bank_transfer
  reference   TEXT,
  paid_at     TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── AUTO-UPDATE updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION btm_update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS clients_updated_at     ON clients;
DROP TRIGGER IF EXISTS staff_updated_at       ON staff;
DROP TRIGGER IF EXISTS op_bookings_updated_at ON op_bookings;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION btm_update_updated_at();
CREATE TRIGGER staff_updated_at
  BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION btm_update_updated_at();
CREATE TRIGGER op_bookings_updated_at
  BEFORE UPDATE ON op_bookings FOR EACH ROW EXECUTE FUNCTION btm_update_updated_at();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
ALTER TABLE clients     ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff       ENABLE ROW LEVEL SECURITY;
ALTER TABLE op_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE op_payments ENABLE ROW LEVEL SECURITY;

-- authenticated (admin users) — full access
CREATE POLICY "auth_clients_all"     ON clients     FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "auth_staff_all"       ON staff       FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "auth_op_bookings_all" ON op_bookings FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "auth_op_payments_all" ON op_payments FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- service_role (API) — full access
CREATE POLICY "svc_clients_all"     ON clients     FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "svc_staff_all"       ON staff       FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "svc_op_bookings_all" ON op_bookings FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "svc_op_payments_all" ON op_payments FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ─── PERFORMANCE INDEXES ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_op_bookings_status     ON op_bookings(status);
CREATE INDEX IF NOT EXISTS idx_op_bookings_start_date ON op_bookings(start_date);
CREATE INDEX IF NOT EXISTS idx_op_bookings_client     ON op_bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_op_payments_booking    ON op_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_staff_role             ON staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_available        ON staff(available);
