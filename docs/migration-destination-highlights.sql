-- ═══════════════════════════════════════════════════════════════════════
-- Migration: destination_highlights table
-- Run once in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Create table
CREATE TABLE IF NOT EXISTS destination_highlights (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  category       TEXT NOT NULL DEFAULT '',
  title          TEXT NOT NULL DEFAULT '',
  description    TEXT DEFAULT '',
  image          TEXT DEFAULT '',
  image_alt      TEXT DEFAULT '',
  display_order  INTEGER NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Index for fast per-destination lookups
CREATE INDEX IF NOT EXISTS idx_dest_highlights_dest
  ON destination_highlights(destination_id, display_order);

-- 3. Row Level Security
ALTER TABLE destination_highlights ENABLE ROW LEVEL SECURITY;

-- Public site (anon key) can read active highlights
CREATE POLICY "Public read active destination highlights"
  ON destination_highlights FOR SELECT
  USING (is_active = true);

-- Admin (authenticated users) can do everything
CREATE POLICY "Authenticated manage destination highlights"
  ON destination_highlights FOR ALL
  USING (auth.role() = 'authenticated');

-- 4. Seed Marrakech highlights
-- (Replace image paths with real Supabase Storage URLs as you upload images via admin)
INSERT INTO destination_highlights
  (destination_id, category, title, description, image, image_alt, display_order, is_active)
VALUES
  (
    'marrakech', 'RIADS', 'Relax in a Charming Riad',
    'Step inside a traditional riad and discover the magic of Moroccan architecture at its most intimate. These historic merchant townhouses conceal lush inner courtyards behind their unassuming street facades — mosaic-tiled fountains, orange trees, handcrafted zellij floors and ornate cedar-wood ceilings create a private sanctuary just steps from the medina''s energy.',
    '/images/tour_riad-interior.jpg', 'Beautiful traditional Moroccan riad interior with tiled courtyard fountain',
    1, true
  ),
  (
    'marrakech', 'SOUVENIR SHOPPING', 'Find Hidden Treasures in the Medina',
    'The ancient souks of Marrakech are among the world''s great sensory experiences — each quarter dedicated to a different craft. Wind through lanes fragrant with spice, pause to watch leather tanning in the traditional pits, and bargain for hand-hammered copper lanterns, Berber rugs, argan oil, and hand-stitched babouche slippers that make for the most authentic Moroccan keepsakes.',
    '/images/tour_marrakech-streets.jpg', 'Colourful lanterns and handcrafted goods in the Marrakech medina souks',
    2, true
  ),
  (
    'marrakech', 'BREAKFAST IN A RIAD', 'Start Your Morning the Moroccan Way',
    'There is no better way to begin a day in Marrakech than on a sun-warmed rooftop terrace. Mint tea poured from a height, warm msemen flatbread with amlou (argan oil, honey and almonds), fresh-squeezed orange juice, and the distant call to prayer drifting across a landscape of terracotta rooftops — this is the Morocco that stays with you long after you return home.',
    '/images/tour_marrakech-rooftop.jpg', 'Traditional Moroccan breakfast served on a rooftop terrace in Marrakech',
    3, true
  ),
  (
    'marrakech', 'JARDIN MAJORELLE', 'Discover the Jardin Majorelle',
    'Created by the French Orientalist painter Jacques Majorelle over forty years and later rescued and restored by Yves Saint Laurent and Pierre Bergé, the Jardin Majorelle is one of the most visited sites in Africa. The cobalt-blue Art Deco villa set against a riot of exotic plants — bamboo groves, towering cacti, water lilies and bougainvillea — is a masterpiece of unexpected beauty in the heart of a desert city.',
    '/images/dest_marrakech.jpg', 'Iconic cobalt blue villa and exotic gardens at Jardin Majorelle, Marrakech',
    4, true
  ),
  (
    'marrakech', 'JEMAA EL-FNA', 'Experience the Heart of Marrakech',
    'As the afternoon light turns golden and the Atlas Mountains glow amber on the horizon, Jemaa el-Fna transforms from a quiet square into one of the world''s most extraordinary spectacles. Gnawa musicians, Halqa storytellers, acrobats, fortune-tellers and dozens of food stalls fill the air with smoke, spice, music and colour. Listed as a UNESCO Intangible Cultural Heritage, this is the living soul of Marrakech.',
    '/images/hero_marrakech.jpg', 'Jemaa el-Fna square at dusk with the Koutoubia Mosque minaret in the background',
    5, true
  )
ON CONFLICT DO NOTHING;
