-- Migration: Add source tracking column for Webflow CMS import
-- Branch: migration/webflow-cms-import
-- Date: 2026-08-08
-- Safe: additive only — no existing data modified, no constraints changed, no RLS affected
--
-- To run: Supabase Dashboard → SQL Editor → paste and execute
-- To rollback:
--   ALTER TABLE products   DROP COLUMN IF EXISTS migration_source;
--   ALTER TABLE blog_posts DROP COLUMN IF EXISTS migration_source;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS migration_source JSONB;

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS migration_source JSONB;

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('products', 'blog_posts')
  AND column_name = 'migration_source'
ORDER BY table_name;
