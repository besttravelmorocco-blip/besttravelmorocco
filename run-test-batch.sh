#!/bin/bash
# Run from: cd /Users/hmad/besttravelmorocco && bash run-test-batch.sh
set -e
cd "$(dirname "$0")"

# Load env vars from .env.local
export $(grep -v '^#' .env.local | grep -v '^$' | xargs)

echo ""
echo "=== STEP 1: Schema Migration ==="
node -e "
const pg = require('pg');
const client = new pg.Client({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: { rejectUnauthorized: false }
});
(async () => {
  await client.connect();
  await client.query('ALTER TABLE products   ADD COLUMN IF NOT EXISTS migration_source JSONB');
  await client.query('ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS migration_source JSONB');
  const r = await client.query(\"SELECT table_name FROM information_schema.columns WHERE column_name='migration_source' AND table_name IN ('products','blog_posts') ORDER BY table_name\");
  r.rows.forEach(row => console.log('  ✓ ' + row.table_name + '.migration_source added'));
  await client.end();
})().catch(e => { console.error('Schema error:', e.message); process.exit(1); });
"

echo ""
echo "=== STEP 2: Test Batch Import (2 blogs + 2 tours as draft) ==="
node migration/webflow-cms-import/import-test-batch.js

echo ""
echo "Done. Check admin.besttravelmorocco.com to review the 4 draft records."
