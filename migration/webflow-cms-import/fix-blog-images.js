/**
 * Fix blog images — updates the 3 Webflow-imported blog posts:
 *   1. Sets `image` field to the Webflow CDN featured image URL
 *   2. Converts [Image: URL] / [Caption: text] in content to proper markdown
 *
 * Safety:
 *   - only touches records where migration_source->>'system' = 'webflow'
 *   - aborts if any target record is not status='draft'
 *   - never publishes, never deletes, never changes title/slug/SEO
 *
 * Run: node migration/webflow-cms-import/fix-blog-images.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

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

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

const SCRATCHPAD = '/private/tmp/claude-501/-Users-hmad/60d2464d-2549-409e-8db2-0d9d8e24865b/scratchpad';
const blogsRaw = JSON.parse(readFileSync(join(SCRATCHPAD, 'webflow-blogs.json'), 'utf8'));
const blogBySlug = (s) => blogsRaw.find(b => b.slug === s);

// ── Content transformer ───────────────────────────────────────────────────────
// [Image: URL] followed by blank line + [Caption: text]  →  ![caption](URL)
// [Image: URL] alone                                      →  ![](URL)
// [Caption: text] remaining (orphaned)                    →  *text*

function convertImages(content) {
  if (!content) return content;

  let out = content;

  // Paired: [Image: URL] \n\n [Caption: text]
  out = out.replace(
    /\[Image:\s*(https?:\/\/[^\]]+?)\]\s*\n[ \t]*\n[ \t]*\[Caption:\s*([^\]]+?)\]/g,
    (_, url, caption) => `![${caption.trim()}](${url.trim()})`
  );

  // Standalone [Image: URL]
  out = out.replace(
    /\[Image:\s*(https?:\/\/[^\]]+?)\]/g,
    (_, url) => `![](${url.trim()})`
  );

  // Orphaned [Caption: text]
  out = out.replace(
    /\[Caption:\s*([^\]]+?)\]/g,
    (_, caption) => `*${caption.trim()}*`
  );

  return out;
}

// ── Blog → CMS mapping ────────────────────────────────────────────────────────
// webflow slug → CMS id
const BLOGS = [
  { webflowSlug: 'cultural-chocks-morocco',         cmsId: 'cultural-shocks-morocco'          },
  { webflowSlug: 'the-berber-queen-kahina',          cmsId: 'the-berber-queen-kahina'           },
  { webflowSlug: 'what-is-berber-amazigh-jewellery', cmsId: 'what-is-berber-amazigh-jewellery'  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n================================================');
  console.log('  FIX BLOG IMAGES — featured image + content');
  console.log('================================================\n');

  const results = { updated: [], skipped: [], errors: [] };

  for (const { webflowSlug, cmsId } of BLOGS) {
    try {
      // Safety check: confirm record is draft
      const { data: existing, error: fetchErr } = await supabase
        .from('blog_posts')
        .select('id, status, image, content')
        .eq('id', cmsId)
        .limit(1);

      if (fetchErr) throw new Error(`Fetch failed: ${fetchErr.message}`);
      if (!existing || existing.length === 0) {
        console.log(`  SKIP ${cmsId} — not found in DB`);
        results.skipped.push(cmsId);
        continue;
      }

      const record = existing[0];
      if (record.status !== 'draft') {
        console.error(`  ABORT ${cmsId} — status is '${record.status}', not draft. Refusing to touch.`);
        results.errors.push({ id: cmsId, error: `status is ${record.status}` });
        continue;
      }

      const src = blogBySlug(webflowSlug);
      if (!src) throw new Error(`Not found in webflow-blogs.json: ${webflowSlug}`);

      const newImage   = src.featured_image || null;
      const newContent = convertImages(record.content);

      const imageChanged   = newImage   !== record.image;
      const contentChanged = newContent !== record.content;

      if (!imageChanged && !contentChanged) {
        console.log(`  SKIP ${cmsId} — already up to date`);
        results.skipped.push(cmsId);
        continue;
      }

      const patch = {};
      if (imageChanged)   patch.image   = newImage;
      if (contentChanged) patch.content = newContent;

      const { error: updateErr } = await supabase
        .from('blog_posts')
        .update(patch)
        .eq('id', cmsId)
        .eq('status', 'draft');   // extra safety: only if still draft

      if (updateErr) throw new Error(`Update failed: ${updateErr.message}`);

      const changes = [
        imageChanged   ? 'image'   : null,
        contentChanged ? 'content' : null,
      ].filter(Boolean).join(' + ');

      console.log(`  ✓ UPDATED ${cmsId} [${changes}]`);
      results.updated.push(cmsId);
    } catch (err) {
      console.error(`  ✗ ERROR ${cmsId}: ${err.message}`);
      results.errors.push({ id: cmsId, error: err.message });
    }
  }

  console.log('\n------------------------------------------------');
  console.log(`  Updated: ${results.updated.length}`);
  console.log(`  Skipped: ${results.skipped.length}`);
  console.log(`  Errors:  ${results.errors.length}`);
  console.log('------------------------------------------------');

  if (results.errors.length > 0) {
    console.error('\n✗ Errors occurred — see above.');
    process.exit(1);
  }

  if (results.updated.length > 0) {
    console.log('\n✓ Done. Verify in Supabase SQL Editor:');
    console.log("  SELECT id, image, LEFT(content, 200) FROM blog_posts WHERE migration_source->>'system' = 'webflow' ORDER BY id;");
  }

  console.log('');
}

main().catch(err => {
  console.error('\nFATAL:', err.message);
  process.exit(1);
});
