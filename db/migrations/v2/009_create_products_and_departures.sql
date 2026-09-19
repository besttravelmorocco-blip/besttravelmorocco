-- 009: Unified products table + departures engine
-- Run in Supabase Dashboard → SQL Editor  (or via migration script)
-- Verified against live schema 2026-06-14

-- ─── 1. products ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                 TEXT        PRIMARY KEY,     -- slug for tours, UUID::text for experiences
  slug               TEXT        NOT NULL UNIQUE,

  category           TEXT        NOT NULL DEFAULT 'morocco_tour',
  booking_type       TEXT        NOT NULL DEFAULT 'inquiry',

  title              TEXT        NOT NULL,
  subtitle           TEXT,
  hero_subtitle      TEXT,
  description        TEXT,

  duration_days      INTEGER,
  duration_nights    INTEGER,
  from_city          TEXT,
  to_city            TEXT,
  departure_city     TEXT,

  price              TEXT,
  price_amount       NUMERIC(10,2),
  starting_price     NUMERIC(10,2),
  deposit_percentage NUMERIC(5,2)  NOT NULL DEFAULT 30,

  images             JSONB NOT NULL DEFAULT '[]',
  highlights         JSONB NOT NULL DEFAULT '[]',
  itinerary          JSONB NOT NULL DEFAULT '[]',
  included           JSONB NOT NULL DEFAULT '[]',
  not_included       JSONB NOT NULL DEFAULT '[]',

  min_group_size     INTEGER,
  max_group_size     INTEGER,
  capacity           INTEGER,
  accommodation_level TEXT,

  seo_title          TEXT,
  seo_description    TEXT,
  seo_keywords       TEXT,

  status             TEXT  NOT NULL DEFAULT 'draft',
  featured           BOOLEAN NOT NULL DEFAULT FALSE,
  popular            BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order         INTEGER NOT NULL DEFAULT 0,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT products_category_check    CHECK (category IN (
    'morocco_tour','student_trip','yoga_retreat',
    'upcoming_tour','group_adventure','event','experience')),
  CONSTRAINT products_booking_type_check CHECK (booking_type IN ('inquiry','fixed_departure')),
  CONSTRAINT products_status_check      CHECK (status IN ('draft','published','archived'))
);

CREATE INDEX IF NOT EXISTS idx_products_category     ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_booking_type ON products(booking_type);
CREATE INDEX IF NOT EXISTS idx_products_status       ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured     ON products(featured);

CREATE OR REPLACE FUNCTION products_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION products_set_updated_at();

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_public_read" ON products;
DROP POLICY IF EXISTS "products_auth_all"    ON products;
CREATE POLICY "products_public_read" ON products FOR SELECT USING (status = 'published');
CREATE POLICY "products_auth_all"    ON products FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);


-- ─── 2. departures ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departures (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id           TEXT        NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  departure_date       DATE        NOT NULL,
  return_date          DATE,

  max_seats            INTEGER     NOT NULL DEFAULT 24,
  min_seats            INTEGER     NOT NULL DEFAULT 8,
  available_seats      INTEGER     NOT NULL DEFAULT 24,

  status               TEXT        NOT NULL DEFAULT 'available',

  deposit_amount       NUMERIC(10,2),
  deposit_percentage   NUMERIC(5,2) DEFAULT 30,
  payment_link         TEXT,
  payment_instructions TEXT,

  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT departures_status_check CHECK (status IN
    ('available','guaranteed','limited','sold_out','closed')),
  CONSTRAINT departures_seats_valid  CHECK (available_seats >= 0 AND available_seats <= max_seats)
);

CREATE INDEX IF NOT EXISTS idx_departures_product_id     ON departures(product_id);
CREATE INDEX IF NOT EXISTS idx_departures_departure_date ON departures(departure_date);
CREATE INDEX IF NOT EXISTS idx_departures_status         ON departures(status);

CREATE OR REPLACE FUNCTION departures_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS departures_updated_at ON departures;
CREATE TRIGGER departures_updated_at
  BEFORE UPDATE ON departures FOR EACH ROW EXECUTE FUNCTION departures_set_updated_at();

ALTER TABLE departures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "departures_public_read" ON departures;
DROP POLICY IF EXISTS "departures_auth_all"    ON departures;
CREATE POLICY "departures_public_read" ON departures FOR SELECT USING (TRUE);
CREATE POLICY "departures_auth_all"    ON departures FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);


-- ─── 3. Migrate tours → products ─────────────────────────────────────────────
-- Live schema: itinerary=jsonb, included=jsonb, highlights=jsonb, not_included=text
-- Keep same IDs so existing tour_faqs references continue to work.
INSERT INTO products (
  id, slug,
  category, booking_type,
  title, subtitle, hero_subtitle, description,
  duration_days, from_city, to_city, departure_city,
  price,
  images, highlights, itinerary, included, not_included,
  seo_title, seo_description,
  status, featured, popular, sort_order,
  deposit_percentage,
  created_at, updated_at
)
SELECT
  t.id                                    AS id,
  t.id                                    AS slug,
  'morocco_tour'                          AS category,
  'inquiry'                               AS booking_type,
  t.title,
  t.subtitle,
  t.hero_subtitle,
  t.description,
  t.days                                  AS duration_days,
  t.from_city,
  t.to_city,
  t.departure_city,
  t.price,
  -- single image field → first element of JSONB array
  CASE
    WHEN t.image IS NOT NULL AND t.image <> ''
    THEN jsonb_build_array(t.image)
    ELSE '[]'::jsonb
  END                                     AS images,
  COALESCE(t.highlights, '[]'::jsonb)     AS highlights,  -- already jsonb
  COALESCE(t.itinerary,  '[]'::jsonb)     AS itinerary,   -- already jsonb
  COALESCE(t.included,   '[]'::jsonb)     AS included,    -- already jsonb
  -- not_included is TEXT (JSON string) — cast safely
  CASE
    WHEN t.not_included IS NULL OR t.not_included = '' THEN '[]'::jsonb
    ELSE t.not_included::jsonb
  END                                     AS not_included,
  t.seo_title,
  t.seo_description,
  CASE t.status::text
    WHEN 'published' THEN 'published'
    WHEN 'archived'  THEN 'archived'
    ELSE 'draft'
  END                                     AS status,
  t.featured,
  t.popular,
  t.sort_order,
  30                                      AS deposit_percentage,
  t.created_at,
  t.updated_at
FROM tours t
ON CONFLICT (id) DO NOTHING;


-- ─── 4. Migrate experience_products → products ────────────────────────────────
-- Live schema: highlights=text[], itinerary=jsonb, included=text[],
--              excluded=text[], images=text[], fixed_departures=text[]
INSERT INTO products (
  id, slug,
  category, booking_type,
  title, description,
  duration_days, duration_nights,
  price, price_amount, starting_price,
  images, highlights, itinerary, included, not_included,
  capacity, min_group_size, max_group_size,
  accommodation_level,
  status,
  deposit_percentage,
  created_at, updated_at
)
SELECT
  ep.id::text                             AS id,
  ep.slug                                 AS slug,
  CASE ep.type
    WHEN 'yoga_retreat'  THEN 'yoga_retreat'
    WHEN 'student_trip'  THEN 'student_trip'
    WHEN 'upcoming_trip' THEN 'upcoming_tour'
    ELSE 'experience'
  END                                     AS category,
  CASE ep.departure_type
    WHEN 'fixed_dates' THEN 'fixed_departure'
    ELSE 'inquiry'
  END                                     AS booking_type,
  ep.title,
  ep.description,
  ep.duration_days,
  ep.duration_nights,
  CASE WHEN ep.price_per_person IS NOT NULL
       THEN 'From €' || ep.price_per_person::text
       ELSE NULL END                      AS price,
  ep.price_per_person                     AS price_amount,
  ep.starting_price,
  -- text[] arrays → jsonb using to_jsonb()
  COALESCE(to_jsonb(ep.images),     '[]'::jsonb) AS images,
  COALESCE(to_jsonb(ep.highlights), '[]'::jsonb) AS highlights,
  -- itinerary is jsonb; normalize field name "description" → "desc" for consistency
  COALESCE(
    (SELECT jsonb_agg(
       jsonb_build_object(
         'day',   (elem->>'day')::int,
         'title', elem->>'title',
         'route', '',
         'desc',  COALESCE(elem->>'description', elem->>'desc', '')
       ) ORDER BY (elem->>'day')::int
     ) FROM jsonb_array_elements(ep.itinerary) AS elem),
    '[]'::jsonb
  )                                       AS itinerary,
  COALESCE(to_jsonb(ep.included), '[]'::jsonb)   AS included,
  COALESCE(to_jsonb(ep.excluded), '[]'::jsonb)   AS not_included,
  ep.capacity,
  ep.min_group_size,
  ep.max_group_size,
  ep.accommodation_level,
  ep.status,
  30                                      AS deposit_percentage,
  ep.created_at,
  ep.updated_at
FROM experience_products ep
ON CONFLICT (id) DO NOTHING;
