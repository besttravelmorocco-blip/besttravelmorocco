import { getPool, ok, err, cors, parseBody } from '../lib/db';



export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return cors();
  const pool = getPool();

  if (req.method === 'GET') {
    const { rows } = await pool.query('SELECT * FROM seasons ORDER BY multiplier');
    return ok(rows);
  }

  if (req.method === 'POST') {
    const body = await parseBody(req);
    const { name, months, multiplier } = body as Record<string, unknown>;
    if (!name || !months) return err('name and months required');
    const { rows } = await pool.query(
      'INSERT INTO seasons (name, months, multiplier) VALUES ($1,$2,$3) RETURNING *',
      [name, months, multiplier ?? 1.0]
    );
    return ok(rows[0], 201);
  }

  if (req.method === 'PUT') {
    const body = await parseBody(req) as { seasons: Array<{ id: string; name: string; months: number[]; multiplier: number }> };
    if (!Array.isArray(body.seasons)) return err('seasons array required');
    for (const s of body.seasons) {
      if (!s.id) continue;
      await pool.query('UPDATE seasons SET name=$1, months=$2, multiplier=$3, updated_at=NOW() WHERE id=$4', [s.name, s.months, s.multiplier, s.id]);
    }
    const { rows } = await pool.query('SELECT * FROM seasons ORDER BY multiplier');
    return ok(rows);
  }

  if (req.method === 'DELETE') {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return err('id required');
    await pool.query('DELETE FROM seasons WHERE id = $1', [id]);
    return ok({ deleted: true });
  }

  return err('Method not allowed', 405);
}
