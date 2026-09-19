-- ═══════════════════════════════════════════════════════════════════════════
-- BEST TRAVEL MOROCCO — CMS MIGRATION
-- Run in: Supabase Dashboard → SQL Editor → New query
-- Project: uxkfqxistjvtofskqtwy
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── TOURS: add missing CMS columns ─────────────────────────────────────────
ALTER TABLE tours ADD COLUMN IF NOT EXISTS not_included    TEXT    NOT NULL DEFAULT '[]';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS seo_title       TEXT    NOT NULL DEFAULT '';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS seo_description TEXT    NOT NULL DEFAULT '';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS category        TEXT    NOT NULL DEFAULT 'medium';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS popular         BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS departure_city  TEXT;

-- ─── HOMEPAGE SECTIONS ───────────────────────────────────────────────────────
-- Each row is one draggable section on the public homepage.
-- section_type controls which React component renders it.
-- config is a JSONB blob; shape varies by type (see seed below).

CREATE TABLE IF NOT EXISTS homepage_sections (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type TEXT        NOT NULL,   -- hero|stats|featured_tours|destinations|about|testimonials|blog_preview|cta|faq
  label        TEXT        NOT NULL,   -- human-readable label in admin UI
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  is_visible   BOOLEAN     NOT NULL DEFAULT TRUE,
  config       JSONB       NOT NULL DEFAULT '{}',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION homepage_sections_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS homepage_sections_ts ON homepage_sections;
CREATE TRIGGER homepage_sections_ts
  BEFORE UPDATE ON homepage_sections FOR EACH ROW
  EXECUTE FUNCTION homepage_sections_updated_at();

ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "auth_homepage_all" ON homepage_sections FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "svc_homepage_all"  ON homepage_sections FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "anon_homepage_read" ON homepage_sections FOR SELECT TO anon USING (TRUE);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── NAVIGATION ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nav_menus (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT UNIQUE NOT NULL,  -- 'main' | 'footer' | 'mobile'
  label  TEXT
);

CREATE TABLE IF NOT EXISTS nav_items (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id       UUID    NOT NULL REFERENCES nav_menus(id) ON DELETE CASCADE,
  parent_id     UUID    REFERENCES nav_items(id),
  label         TEXT    NOT NULL,
  href          TEXT,
  tour_id       TEXT,             -- optional slug link to a tour
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_visible    BOOLEAN NOT NULL DEFAULT TRUE,
  opens_new_tab BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE nav_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "auth_nav_menus_all"  ON nav_menus FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "svc_nav_menus_all"   ON nav_menus FOR ALL TO service_role  USING (TRUE) WITH CHECK (TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "anon_nav_menus_read" ON nav_menus FOR SELECT TO anon USING (TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "auth_nav_items_all"  ON nav_items FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "svc_nav_items_all"   ON nav_items FOR ALL TO service_role  USING (TRUE) WITH CHECK (TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "anon_nav_items_read" ON nav_items FOR SELECT TO anon USING (TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── FAQS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faqs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question   TEXT        NOT NULL,
  answer     TEXT        NOT NULL,
  category   TEXT        NOT NULL DEFAULT 'General',
  page       TEXT        NOT NULL DEFAULT 'all',  -- which page(s) to show on
  sort_order INTEGER     NOT NULL DEFAULT 0,
  is_visible BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION faqs_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS faqs_ts ON faqs;
CREATE TRIGGER faqs_ts
  BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION faqs_updated_at();

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "auth_faqs_all"  ON faqs FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "svc_faqs_all"   ON faqs FOR ALL TO service_role  USING (TRUE) WITH CHECK (TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "anon_faqs_read" ON faqs FOR SELECT TO anon USING (TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── SEED: Homepage Sections ─────────────────────────────────────────────────
INSERT INTO homepage_sections (section_type, label, sort_order, is_visible, config)
SELECT s.section_type, s.label, s.sort_order, s.is_visible, s.config::JSONB
FROM (VALUES
  ('hero',           'Hero Banner',        1, TRUE, '{"heading":"Discover the Magic of Morocco","subheading":"Expert-guided private tours from Marrakech, Fes, Casablanca, Tangier & beyond","cta_text":"View All Tours","cta_url":"/tours","cta2_text":"Contact Us","cta2_url":"/contact"}'),
  ('stats',          'Stats Bar',          2, TRUE, '{"items":[{"value":"25+","label":"Years Experience"},{"value":"33+","label":"Morocco Tours"},{"value":"6,000+","label":"Happy Travelers"},{"value":"24/7","label":"Support"}]}'),
  ('featured_tours', 'Featured Tours',     3, TRUE, '{"heading":"Our Most Popular Tours","tour_ids":[],"layout":"grid"}'),
  ('destinations',   'Top Destinations',   4, TRUE, '{"heading":"Explore Morocco''s Wonders"}'),
  ('about',          'About Section',      5, TRUE, '{"heading":"Why Choose Best Travel Morocco?","text":"With over 25 years of experience, we create authentic Morocco experiences for independent travellers worldwide. Licensed guides, vetted riads, camel treks under real stars."}'),
  ('testimonials',   'Testimonials',       6, TRUE, '{"heading":"What Our Travellers Say"}'),
  ('blog_preview',   'Latest Blog Posts',  7, TRUE, '{"heading":"Morocco Travel Tips & Stories","post_count":3}'),
  ('cta',            'Contact CTA',        8, TRUE, '{"heading":"Ready to Explore Morocco?","subtext":"Get a free personalised quote within 24 hours","whatsapp_text":"WhatsApp Us Now","email_text":"Email Us"}')
) AS s(section_type, label, sort_order, is_visible, config)
WHERE NOT EXISTS (SELECT 1 FROM homepage_sections LIMIT 1);

-- ─── SEED: Nav Menus ─────────────────────────────────────────────────────────
INSERT INTO nav_menus (handle, label)
VALUES ('main', 'Main Navigation'), ('footer', 'Footer Navigation')
ON CONFLICT (handle) DO NOTHING;

-- ─── SEED: Main nav items ─────────────────────────────────────────────────────
DO $$
DECLARE main_id UUID;
BEGIN
  SELECT id INTO main_id FROM nav_menus WHERE handle = 'main';
  IF NOT EXISTS (SELECT 1 FROM nav_items WHERE menu_id = main_id) THEN
    INSERT INTO nav_items (menu_id, label, href, sort_order) VALUES
      (main_id, 'Home',         '/',              1),
      (main_id, 'Tours',        '/tours',         2),
      (main_id, 'Destinations', '/destinations',  3),
      (main_id, 'Blog',         '/blog',          4),
      (main_id, 'About',        '/about',         5),
      (main_id, 'Contact',      '/contact',       6);
  END IF;
END $$;

-- ─── SEED: FAQs ──────────────────────────────────────────────────────────────
INSERT INTO faqs (question, answer, category, sort_order)
SELECT q, a, c, o FROM (VALUES
  ('Do I need a visa to visit Morocco?',
   'Most nationalities (US, UK, EU, Canada, Australia, NZ) do not need a visa for stays under 90 days. Check with your embassy for the latest requirements.',
   'Visas & Entry', 1),
  ('What is the best time to visit Morocco?',
   'Spring (March–May) and Autumn (September–November) offer the best weather. Summers are very hot inland; winters are mild in coastal cities but cold in the desert at night.',
   'Planning', 2),
  ('Is Morocco safe for tourists?',
   'Morocco is generally very safe. Millions of tourists visit each year without issues. Our licensed guides and vetted accommodations ensure a secure experience throughout your journey.',
   'Safety', 3),
  ('How do I book a tour?',
   'Contact us via WhatsApp (+212 677 365 421), email (hello@besttravelmorocco.com), or the inquiry form on this website. We will create a personalised proposal within 24 hours.',
   'Booking', 4),
  ('What payment methods do you accept?',
   'We accept Wise (no fees), PayPal, bank transfer, and credit cards. A 20% deposit confirms your booking; the balance is due before departure.',
   'Booking', 5),
  ('Can you create a custom itinerary?',
   'Yes — custom trips are our speciality. Tell us your dates, group size, interests, and budget and we will design a unique Morocco experience just for you.',
   'Planning', 6),
  ('What is included in the tour price?',
   'All our tours include private transport with A/C, an English-speaking driver/guide, and accommodation with breakfast and dinner where overnight stays are included. Specific inclusions are listed on each tour page.',
   'Booking', 7),
  ('Can I start a tour from a city other than Marrakech?',
   'Absolutely. We offer tours departing from Marrakech, Fes, Casablanca, Tangier, Agadir, Errachidia, and Ouarzazate. We can also arrange transfers to your preferred starting city.',
   'Planning', 8)
) AS t(q, a, c, o)
WHERE NOT EXISTS (SELECT 1 FROM faqs LIMIT 1);
