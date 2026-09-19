import { getPool, ok, err, cors, parseBody } from '../lib/db';



export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return cors();
  const pool = getPool();

  if (req.method === 'GET') {
    const url = new URL(req.url);
    const city = url.searchParams.get('city');
    const category = url.searchParams.get('category');
    const q: string[] = ['SELECT * FROM accommodations'];
    const params: unknown[] = [];
    const conds: string[] = ['active = TRUE'];
    if (city)     { params.push(city);     conds.push(`city = $${params.length}`); }
    if (category) { params.push(category); conds.push(`category = $${params.length}`); }
    q.push('WHERE ' + conds.join(' AND '));
    q.push('ORDER BY city, name');
    const { rows } = await pool.query(q.join(' '), params);
    return ok(rows);
  }

  if (req.method === 'POST') {
    const body = await parseBody(req);
    const { name, city, category, price_per_night, currency, stars, image, notes } = body as Record<string, unknown>;
    if (!name || !city) return err('name and city required');
    const { rows } = await pool.query(
      `INSERT INTO accommodations (name, city, category, price_per_night, currency, stars, image, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, city, category ?? 'standard', price_per_night ?? 0, currency ?? 'EUR', stars ?? null, image ?? null, notes ?? null]
    );
    return ok(rows[0], 201);
  }

  return err('Method not allowed', 405);
}
