const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const c = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined },
});

async function run() {
  await c.connect();
  console.log('Connected.\n');

  const sqlFile = path.join(__dirname, '..', 'cms-migration.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  // Split on statement boundaries — handles multi-line DO $$ blocks too
  // Strategy: split on semicolons but keep DO $$ blocks intact
  const statements = [];
  let buf = '';
  let dollarDepth = 0;
  for (const line of sql.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('--')) { continue; }
    // Count $$ delimiters
    const matches = (line.match(/\$\$/g) || []).length;
    dollarDepth += matches;
    buf += line + '\n';
    // A statement ends at ; when we're not inside a $$ block
    if (trimmed.endsWith(';') && dollarDepth % 2 === 0) {
      const s = buf.trim();
      if (s.length > 1) statements.push(s);
      buf = '';
    }
  }

  let ok = 0, skip = 0, fail = 0;
  for (const stmt of statements) {
    const label = stmt.slice(0, 70).replace(/\s+/g, ' ') + '…';
    try {
      await c.query(stmt);
      console.log('✓', label);
      ok++;
    } catch (e) {
      if (e.message.includes('already exists') || e.message.includes('duplicate')) {
        console.log('⚬ skip:', label);
        skip++;
      } else {
        console.error('✗ FAIL:', label);
        console.error('  ', e.message);
        fail++;
      }
    }
  }

  console.log(`\nDone: ${ok} ok, ${skip} skipped, ${fail} failed`);
  await c.end();
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
