import { getPool, ok, err, cors, parseBody } from '../lib/db';



function getId(req: Request): string {
  return new URL(req.url).pathname.split('/').filter(Boolean).pop() ?? '';
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return cors();
  const pool = getPool();
  const id = getId(req);
  if (!id) return err('Missing tour id');

  if (req.method === 'GET') {
    const { rows } = await pool.query('SELECT * FROM tours_v2 WHERE id = $1', [id]);
    if (!rows.length) return err('Tour not found', 404);
    const [tour] = rows;
    const [{ rows: days }, { rows: highlights }, { rows: faqs }] = await Promise.all([
      pool.query('SELECT * FROM tour_itinerary_days WHERE tour_id = $1 ORDER BY day_number', [id]),
      pool.query('SELECT * FROM tour_highlights WHERE tour_id = $1 ORDER BY sort_order', [id]),
      pool.query('SELECT * FROM tour_faqs WHERE tour_id = $1 ORDER BY sort_order', [id]),
    ]);
    return ok({ ...tour, itinerary: days, highlights, faqs });
  }

  if (req.method === 'PUT') {
    const body = await parseBody(req);
    const allowed = ['slug','title','subtitle','description','type','status','days','from_city','to_city','image','pdf_url','featured','sort_order','meta_title','meta_desc','gallery'];
    const sets: string[] = [];
    const params: unknown[] = [];
    for (const key of allowed) {
      if (key in body) { params.push(body[key]); sets.push(`${key} = $${params.length}`); }
    }
    if (!sets.length) return err('No fields to update');
    params.push(id);
    const { rows } = await pool.query(`UPDATE tours_v2 SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`, params);
    if (!rows.length) return err('Tour not found', 404);
    return ok(rows[0]);
  }

  if (req.method === 'DELETE') {
    const { rowCount } = await pool.query('DELETE FROM tours_v2 WHERE id = $1', [id]);
    if (!rowCount) return err('Tour not found', 404);
    return ok({ deleted: true });
  }

  return err('Method not allowed', 405);
}
