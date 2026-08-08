/**
 * Stage 5 — Test Batch Import
 * Imports 2 blog posts + 2 tours as DRAFTS only.
 * STOPS after insert and prints IDs for manual review.
 *
 * Safety guarantees:
 *   - status: 'draft' on every record — invisible to public (RLS confirmed)
 *   - never publishes, never overwrites, never deletes
 *   - checks for existing record by id before insert — SKIPS if exists
 *   - uses parameterized Supabase queries (no raw SQL interpolation)
 *   - requires SUPABASE_SERVICE_ROLE_KEY (bypasses RLS for draft inserts)
 *
 * Run: node migration/webflow-cms-import/import-test-batch.js
 * Requires:  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in environment
 *            (copy from Supabase Dashboard → Project Settings → API)
 *
 * Rollback:
 *   DELETE FROM blog_posts WHERE id IN ('the-berber-queen-kahina','what-is-berber-amazigh-jewellery');
 *   DELETE FROM products   WHERE id IN ('zagora-2day-desert-dream','3-day-fes-to-marrakech-via-desert');
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ─────────────────────────────────────────────────────────────────
const SUPABASE_URL           = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MIGRATION_BATCH        = 'webflow-import-2026-08';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment.');
  console.error('Find them at: Supabase Dashboard → Project Settings → API');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function stripSuffix(str) {
  if (!str) return null;
  return str
    .replace(/ - Best Travel Morocco$/i, '')
    .replace(/ \| Best Travel Morocco$/i, '')
    .trim();
}

function calcReadTime(content) {
  const words = (content || '').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function migrationSource(slug, url, extra = {}) {
  return {
    system: 'webflow',
    url,
    batch: MIGRATION_BATCH,
    webflow_slug: slug,
    imported_at: new Date().toISOString(),
    ...extra
  };
}

async function checkExists(table, id) {
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq('id', id)
    .limit(1);
  if (error) throw new Error(`Check exists failed on ${table}: ${error.message}`);
  return data && data.length > 0;
}

async function insertBlog(record) {
  const { error } = await supabase.from('blog_posts').insert([record]);
  if (error) throw new Error(`Blog insert failed [${record.id}]: ${error.message}`);
}

async function insertTour(record) {
  const { error } = await supabase.from('products').insert([record]);
  if (error) throw new Error(`Tour insert failed [${record.id}]: ${error.message}`);
}

// ── Blog Records ─────────────────────────────────────────────────────────────
// Source: webflow-blogs.json (indexes 1 and 5 = Category A posts)

// Blog source data (absolute path — this file lives in the session scratchpad)
const SCRATCHPAD = '/private/tmp/claude-501/-Users-hmad/60d2464d-2549-409e-8db2-0d9d8e24865b/scratchpad';

const blogsRaw = JSON.parse(
  readFileSync(join(SCRATCHPAD, 'webflow-blogs.json'), 'utf8')
);

// Find by slug
const blogBySlug = (slug) => blogsRaw.find(b => b.slug === slug);

const BLOG_TEST_RECORDS = [
  // Test blog 1: shortest, practical guide
  (() => {
    const b = blogBySlug('the-berber-queen-kahina');
    return {
      id:              'the-berber-queen-kahina',
      slug:            'the-berber-queen-kahina',
      title:           stripSuffix(b.seo_title) || b.title,
      excerpt:         b.excerpt,
      content:         b.content,
      image:           null,          // D4: images left empty; CDN URL in migration_source
      category:        'Culture',
      read_time:       calcReadTime(b.content),
      date:            'August 8, 2026',
      status:          'draft',
      featured:        false,
      seo_title:       stripSuffix(b.seo_title),
      seo_description: stripSuffix(b.seo_description),
      robots_index:    false,
      robots_follow:   true,
      migration_source: migrationSource(b.slug, b.url, {
        webflow_image: b.featured_image
      })
    };
  })(),

  // Test blog 2: unique, detailed content
  (() => {
    const b = blogBySlug('what-is-berber-amazigh-jewellery');
    return {
      id:              'what-is-berber-amazigh-jewellery',
      slug:            'what-is-berber-amazigh-jewellery',
      title:           stripSuffix(b.seo_title) || b.title,
      excerpt:         b.excerpt,
      content:         b.content,
      image:           null,
      category:        'Culture',
      read_time:       calcReadTime(b.content),
      date:            'August 8, 2026',
      status:          'draft',
      featured:        false,
      seo_title:       stripSuffix(b.seo_title),
      seo_description: stripSuffix(b.seo_description),
      robots_index:    false,
      robots_follow:   true,
      migration_source: migrationSource(b.slug, b.url, {
        webflow_image: b.featured_image
      })
    };
  })()
];

// ── Tour Records ─────────────────────────────────────────────────────────────
// Source: webflow-tours.json (generated by crawler)
// NOTE: update TOUR_TEST_RECORDS after reviewing crawler output

let toursRaw = [];
try {
  toursRaw = JSON.parse(
    readFileSync(join(SCRATCHPAD, 'webflow-tours.json'), 'utf8')
  );
} catch {
  console.error('ERROR: webflow-tours.json not found. Run the tour crawler first.');
  process.exit(1);
}

const tourBySlug = (slug) => toursRaw.find(t => t.slug === slug);

function buildTourRecord(webflowSlug, cmsId, extra = {}) {
  const t = tourBySlug(webflowSlug);
  if (!t) throw new Error(`Tour not found in crawler output: ${webflowSlug}`);
  if (t.error) throw new Error(`Tour page returned error: ${webflowSlug} → ${t.error}`);

  return {
    id:                  cmsId,
    slug:                cmsId,
    category:            t.category || 'morocco_tour',
    booking_type:        'inquiry',
    title:               t.title,
    subtitle:            null,
    hero_subtitle:       null,
    description:         t.description || null,
    duration_days:       t.duration_days || null,
    duration_nights:     t.duration_nights || (t.duration_days ? t.duration_days - 1 : null),
    from_city:           t.from_city || null,
    to_city:             t.to_city || null,
    departure_city:      t.from_city || null,
    price:               null,
    price_amount:        null,
    starting_price:      null,
    deposit_percentage:  30,
    images:              [],            // D4: CDN URLs stored in migration_source only
    highlights:          t.highlights || [],
    itinerary:           t.itinerary || [],
    included:            t.included || [],
    not_included:        t.not_included || [],
    min_group_size:      null,
    max_group_size:      null,
    capacity:            null,
    accommodation_level: null,
    seo_title:           stripSuffix(t.seo_title) || t.title,
    seo_description:     stripSuffix(t.seo_description) || null,
    seo_keywords:        null,
    focus_keyword:       null,
    canonical_url:       null,
    og_title:            null,
    og_description:      null,
    og_image:            null,
    twitter_image:       null,
    robots_index:        false,
    robots_follow:       true,
    status:              'draft',
    featured:            false,
    popular:             false,
    sort_order:          null,
    migration_source:    migrationSource(webflowSlug, t.url, {
      webflow_images:    t.all_images || [],
      route_summary:     t.route_summary || null
    }),
    ...extra
  };
}

const TOUR_TEST_RECORDS = [
  // Test tour 1: short tour (3 days), Fes → Marrakech route
  buildTourRecord(
    '3-day-fes-to-marrakech-via-desert-tour',
    '3-day-fes-to-marrakech-via-desert'
  ),

  // Test tour 2: Zagora 2-day (distinct product per Decision 3)
  buildTourRecord(
    '2-day-marrakech-desert-trip-sahara-desert-dream',
    'zagora-2day-desert-dream'
  )
];

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n========================================');
  console.log('  STAGE 5 — TEST BATCH IMPORT (DRAFT)');
  console.log('========================================\n');
  console.log('Records to import:');
  console.log('  Blogs:', BLOG_TEST_RECORDS.map(b => b.id));
  console.log('  Tours:', TOUR_TEST_RECORDS.map(t => t.id));
  console.log('\nAll records will be status: draft (invisible to public)\n');

  const results = { inserted: [], skipped: [], errors: [] };

  // Import blogs
  for (const record of BLOG_TEST_RECORDS) {
    try {
      const exists = await checkExists('blog_posts', record.id);
      if (exists) {
        console.log(`  SKIP [blog] ${record.id} — already exists`);
        results.skipped.push(record.id);
        continue;
      }
      await insertBlog(record);
      console.log(`  ✓ INSERTED [blog] ${record.id}`);
      results.inserted.push(record.id);
    } catch (err) {
      console.error(`  ✗ ERROR [blog] ${record.id}: ${err.message}`);
      results.errors.push({ id: record.id, error: err.message });
    }
  }

  // Import tours
  for (const record of TOUR_TEST_RECORDS) {
    try {
      const exists = await checkExists('products', record.id);
      if (exists) {
        console.log(`  SKIP [tour] ${record.id} — already exists`);
        results.skipped.push(record.id);
        continue;
      }
      await insertTour(record);
      console.log(`  ✓ INSERTED [tour] ${record.id}`);
      results.inserted.push(record.id);
    } catch (err) {
      console.error(`  ✗ ERROR [tour] ${record.id}: ${err.message}`);
      results.errors.push({ id: record.id, error: err.message });
    }
  }

  // Summary
  console.log('\n----------------------------------------');
  console.log(`  Inserted: ${results.inserted.length}`);
  console.log(`  Skipped:  ${results.skipped.length}`);
  console.log(`  Errors:   ${results.errors.length}`);
  console.log('----------------------------------------');

  if (results.errors.length > 0) {
    console.error('\nERRORS OCCURRED — review above before proceeding');
    process.exit(1);
  }

  if (results.inserted.length > 0) {
    console.log('\n✓ Test batch complete. STOPPING for manual review.');
    console.log('\nTo inspect in Supabase:');
    console.log("  SELECT id, title, status FROM blog_posts WHERE migration_source->>'system' = 'webflow';");
    console.log("  SELECT id, title, status FROM products   WHERE migration_source->>'system' = 'webflow';");
    console.log('\nTo rollback (undo everything):');
    console.log("  DELETE FROM blog_posts WHERE migration_source->>'system' = 'webflow';");
    console.log("  DELETE FROM products   WHERE migration_source->>'system' = 'webflow';");
    console.log('\nDO NOT run the full import until you have reviewed these 4 records.');
  }

  console.log('');
}

main().catch(err => {
  console.error('\nFATAL:', err.message);
  process.exit(1);
});
