const { Client } = require('pg');
const c = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined },
});
c.connect().then(async () => {
  const tables = ['accommodations', 'seasons', 'pricing_rules'];
  for (const t of tables) {
    const r = await c.query(`
      SELECT column_name, data_type, udt_name, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [t]);
    console.log(`\n--- ${t} ---`);
    r.rows.forEach(col => console.log(`  ${col.column_name}: ${col.data_type} (${col.udt_name}) nullable=${col.is_nullable}`));
  }
  await c.end();
}).catch(e => { console.error(e.message); c.end(); });
