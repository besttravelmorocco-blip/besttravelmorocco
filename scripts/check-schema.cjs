const { Client } = require('pg');
const c = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined },
});
c.connect().then(async () => {
  // Check tours.id column type
  const r = await c.query(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tours' AND column_name = 'id'
  `);
  console.log('tours.id:', JSON.stringify(r.rows[0]));

  // Check which of our new tables already exist
  const r2 = await c.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname='public' AND tablename IN ('vehicles','suppliers','coupons','custom_tour_requests','email_templates','accommodations','seasons','pricing_rules')
    ORDER BY tablename
  `);
  console.log('Existing new tables:', r2.rows.map(x => x.tablename).join(', ') || 'none');
  await c.end();
}).catch(e => { console.error(e.message); c.end(); });
