/**
 * Stage 5 — Full Batch Import
 * Imports all 21 tours + 3 blogs as DRAFTS only.
 * Already-inserted records are skipped (safe to re-run).
 *
 * Safety guarantees:
 *   - status: 'draft' — invisible to public via RLS
 *   - never publishes, never overwrites, never deletes
 *   - checkExists guard before every insert
 *   - parameterized Supabase queries only
 *
 * Run: node migration/webflow-cms-import/import-full-batch.js
 *
 * Rollback (removes ALL webflow-imported records):
 *   DELETE FROM blog_posts WHERE migration_source->>'system' = 'webflow';
 *   DELETE FROM products   WHERE migration_source->>'system' = 'webflow';
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

// ── Env loader ────────────────────────────────────────────────────────────────
function loadEnvLocal() {
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) return {};
  const out = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    out[key] = val;
  }
  return out;
}
const envLocal = loadEnvLocal();
const getVar = (k) => process.env[k] || envLocal[k];

const SUPABASE_URL         = getVar('SUPABASE_URL') || getVar('VITE_SUPABASE_URL');
const SUPABASE_SERVICE_KEY = getVar('SUPABASE_SERVICE_ROLE_KEY') || getVar('VITE_SUPABASE_SERVICE_ROLE_KEY');
const MIGRATION_BATCH      = 'webflow-import-2026-08';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripSuffix(str) {
  if (!str) return null;
  return str
    .replace(/ - Best Travel Morocco$/i, '')
    .replace(/ \| Best Travel Morocco$/i, '')
    .trim();
}

function calcReadTime(content) {
  const words = (content || '').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function migrationSource(webflowSlug, url, extra = {}) {
  return {
    system: 'webflow',
    url,
    batch: MIGRATION_BATCH,
    webflow_slug: webflowSlug,
    imported_at: new Date().toISOString(),
    ...extra
  };
}

async function checkExists(table, id) {
  const { data, error } = await supabase
    .from(table).select('id').eq('id', id).limit(1);
  if (error) throw new Error(`checkExists failed [${table}/${id}]: ${error.message}`);
  return data && data.length > 0;
}

async function insertBlog(record) {
  const { error } = await supabase.from('blog_posts').insert([record]);
  if (error) throw new Error(error.message);
}

async function insertTour(record) {
  const { error } = await supabase.from('products').insert([record]);
  if (error) throw new Error(error.message);
}

// ── Source data ───────────────────────────────────────────────────────────────

const SCRATCHPAD = '/private/tmp/claude-501/-Users-hmad/60d2464d-2549-409e-8db2-0d9d8e24865b/scratchpad';

const blogsRaw = JSON.parse(readFileSync(join(SCRATCHPAD, 'webflow-blogs.json'), 'utf8'));
const toursRaw = JSON.parse(readFileSync(join(SCRATCHPAD, 'webflow-tours.json'), 'utf8'));

const blogBySlug  = (s) => blogsRaw.find(b => b.slug === s);
const tourBySlug  = (s) => toursRaw.find(t => t.slug === s);

// ── Blog records ──────────────────────────────────────────────────────────────
// 3 Category A blogs total; 2 already inserted — all 3 listed here, checkExists skips duplicates.

function buildBlog(webflowSlug, cmsId, category = 'Culture') {
  const b = blogBySlug(webflowSlug);
  if (!b) throw new Error(`Blog not found in JSON: ${webflowSlug}`);
  return {
    id:               cmsId,
    slug:             cmsId,
    title:            stripSuffix(b.seo_title) || b.title,
    excerpt:          b.excerpt,
    content:          b.content,
    image:            null,
    category,
    read_time:        calcReadTime(b.content),
    date:             'August 8, 2026',
    status:           'draft',
    featured:         false,
    seo_title:        stripSuffix(b.seo_title),
    seo_description:  stripSuffix(b.seo_description),
    robots_index:     false,
    robots_follow:    true,
    migration_source: migrationSource(webflowSlug, b.url, { webflow_image: b.featured_image })
  };
}

const BLOG_RECORDS = [
  buildBlog('cultural-chocks-morocco',        'cultural-shocks-morocco'),
  buildBlog('the-berber-queen-kahina',         'the-berber-queen-kahina'),
  buildBlog('what-is-berber-amazigh-jewellery','what-is-berber-amazigh-jewellery'),
];

// ── Tour records ──────────────────────────────────────────────────────────────
// All 21 Category A tours; 2 already inserted — checkExists skips duplicates.

function buildTour(webflowSlug, cmsId) {
  const t = tourBySlug(webflowSlug);
  if (!t) throw new Error(`Tour not found in JSON: ${webflowSlug}`);
  return {
    id:                  cmsId,
    slug:                cmsId,
    category:            t.category || 'morocco_tour',
    booking_type:        'inquiry',
    title:               t.title,
    subtitle:            null,
    hero_subtitle:       null,
    description:         t.description || t.route_summary || null,
    duration_days:       t.duration_days || null,
    duration_nights:     t.duration_nights ?? (t.duration_days ? t.duration_days - 1 : null),
    from_city:           t.from_city || null,
    to_city:             t.to_city   || null,
    departure_city:      t.from_city || null,
    price:               null,
    price_amount:        null,
    starting_price:      null,
    deposit_percentage:  30,
    images:              [],
    highlights:          t.highlights    || [],
    itinerary:           t.itinerary     || [],
    included:            t.included      || [],
    not_included:        t.not_included  || [],
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
    sort_order:          999,
    migration_source:    migrationSource(webflowSlug, t.url, {
      webflow_images: t.all_images   || [],
      route_summary:  t.route_summary || null
    })
  };
}

const TOUR_RECORDS = [
  buildTour('2-day-marrakech-desert-trip-sahara-desert-dream',        'zagora-2day-desert-dream'),
  buildTour('3-day-fes-to-marrakech-via-desert-tour',                 '3-day-fes-to-marrakech-via-desert'),
  buildTour('4-days-tour-from-fes-to-marrakech',                      '4-days-fes-to-marrakech'),
  buildTour('4-day-marrakech-desert-trip',                            '4-day-marrakech-desert-trip'),
  buildTour('semester-at-sea-morocco-adventure-tour',                 'semester-at-sea-morocco'),
  buildTour('5-day-exotic-sahara-desert-tour',                        '5-day-exotic-sahara-desert'),
  buildTour('desert-escape-and-gorges-trekking-tour',                 'desert-escape-gorges-trekking'),
  buildTour('5-day-marrakech-sahara-discovery-students-round-trip',   '5-day-sahara-discovery-students'),
  buildTour('tangier-to-marrakech-desert-tour',                       'tangier-to-marrakech-desert'),
  buildTour('semester-at-sea-morocco-tour-fall',                      'semester-at-sea-fall'),
  buildTour('casablanca-to-marrakech-with-ouzoud',                    'casablanca-marrakech-ouzoud'),
  buildTour('7-day-morocco-desert-tour-from-tangier',                 '7-day-tangier-desert-tour'),
  buildTour('trekking-through-the-atlas-mountains-morocco-tour',      'atlas-mountains-trekking-tour'),
  buildTour('8-days-enchanting-southern-morocco-tour',                '8-days-enchanting-southern-morocco'),
  buildTour('8-days-the-route-of-caravans-tour',                      '8-days-route-of-caravans'),
  buildTour('9-day-morocco-tour-from-casablanca',                     '9-day-tour-from-casablanca'),
  buildTour('9-days-the-ultimate-morocco-tour',                       '9-days-ultimate-morocco'),
  buildTour('10-days-imperial-cities-and-northern-morocco-tour',      '10-days-imperial-cities-north'),
  buildTour('10-days-imperial-cities-and-coast-morocco-tour',         '10-days-imperial-cities-coast'),
  buildTour('13-days-real-morocco-uncovered-tour',                    '13-days-real-morocco-uncovered'),
  buildTour('15-days-morocco-hidden-jewels-tour',                     '15-days-morocco-hidden-jewels'),
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n================================================');
  console.log('  FULL BATCH IMPORT — 21 tours + 3 blogs');
  console.log('  All records: status=draft, invisible to public');
  console.log('================================================\n');

  const results = { inserted: [], skipped: [], errors: [] };

  // Blogs
  for (const record of BLOG_RECORDS) {
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

  // Tours
  for (const record of TOUR_RECORDS) {
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
  console.log('\n------------------------------------------------');
  console.log(`  Inserted: ${results.inserted.length}`);
  console.log(`  Skipped:  ${results.skipped.length}`);
  console.log(`  Errors:   ${results.errors.length}`);
  console.log('------------------------------------------------');

  if (results.errors.length > 0) {
    console.error('\n✗ Errors occurred — see above. Fix and re-run (skips already-inserted).');
    process.exit(1);
  }

  if (results.inserted.length > 0 || results.skipped.length > 0) {
    console.log('\n✓ Full import complete. ALL records are status=draft.');
    console.log('\nVerify in Supabase SQL Editor:');
    console.log("  SELECT id, title, status FROM blog_posts WHERE migration_source->>'system' = 'webflow' ORDER BY id;");
    console.log("  SELECT id, title, status FROM products   WHERE migration_source->>'system' = 'webflow' ORDER BY sort_order, id;");
    console.log('\nRollback if needed:');
    console.log("  DELETE FROM blog_posts WHERE migration_source->>'system' = 'webflow';");
    console.log("  DELETE FROM products   WHERE migration_source->>'system' = 'webflow';");
  }

  console.log('');
}

main().catch(err => {
  console.error('\nFATAL:', err.message);
  process.exit(1);
});
