const { Client } = require('pg');
const c = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined },
});
c.connect()
  .then(() => c.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"))
  .then(r => { console.log('Tables:', r.rows.map(x => x.tablename).join(', ')); return c.end(); })
  .catch(e => { console.error(e.message); c.end(); });
