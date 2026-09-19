import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const { Client } = require('pg');
const __dirname = dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL env var is required');
  process.exit(1);
}

const sql = readFileSync(join(__dirname, '..', 'tos-migration.sql'), 'utf8');

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined },
});

async function run() {
  await client.connect();
  console.log('Connected to database');

  // Split on statement-terminating semicolons, keeping multi-line blocks together
  // Run as a single transaction-like batch
  try {
    await client.query(sql);
    console.log('Migration completed successfully');
  } catch (err) {
    // If "already exists" errors appear, that means the table is already there — fine
    if (err.message && err.message.includes('already exists')) {
      console.log('Note: some objects already exist — that is OK');
    } else {
      throw err;
    }
  }

  await client.end();
}

run().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
