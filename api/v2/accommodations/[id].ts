import { getPool, ok, err, cors, parseBody } from '../lib/db';



function getId(req: Request): string {
  return new URL(req.url).pathname.split('/').filter(Boolean).pop() ?? '';
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return cors();
  const pool = getPool();
  const id = getId(req);

  if (req.method === 'GET') {
    const { rows } = await pool.query('SELECT * FROM accommodations WHERE id = $1', [id]);
    if (!rows.length) return err('Not found', 404);
    return ok(rows[0]);
  }

  if (req.method === 'PUT') {
    const body = await parseBody(req);
    const allowed = ['name','city','category','price_per_night','currency','stars','image','notes','active'];
    const sets: string[] = [];
    const params: unknown[] = [];
    for (const key of allowed) {
      if (key in body) { params.push(body[key]); sets.push(`${key} = $${params.length}`); }
    }
    if (!sets.length) return err('No fields to update');
    params.push(id);
    const { rows } = await pool.query(`UPDATE accommodations SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`, params);
    if (!rows.length) return err('Not found', 404);
    return ok(rows[0]);
  }

  if (req.method === 'DELETE') {
    await pool.query('UPDATE accommodations SET active = FALSE, updated_at = NOW() WHERE id = $1', [id]);
    return ok({ deactivated: true });
  }

  return err('Method not allowed', 405);
}
