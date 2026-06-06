import { getPool, ok, err, cors, parseBody } from '../../lib/db';



function getTourId(req: Request): string {
  const parts = new URL(req.url).pathname.split('/').filter(Boolean);
  const idx = parts.indexOf('tours');
  return parts[idx + 1] ?? '';
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return cors();
  const pool = getPool();
  const tourId = getTourId(req);
  if (!tourId) return err('Missing tour id');

  if (req.method === 'GET') {
    const { rows } = await pool.query('SELECT * FROM tour_itinerary_days WHERE tour_id = $1 ORDER BY day_number', [tourId]);
    return ok(rows);
  }

  if (req.method === 'POST') {
    const body = await parseBody(req);
    const { day_number, title, route, description, accommodation, meals } = body as Record<string, unknown>;
    if (!day_number || !title) return err('day_number and title required');
    const { rows } = await pool.query(
      `INSERT INTO tour_itinerary_days (tour_id, day_number, title, route, description, accommodation, meals)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (tour_id, day_number) DO UPDATE
       SET title=$3, route=$4, description=$5, accommodation=$6, meals=$7, updated_at=NOW()
       RETURNING *`,
      [tourId, day_number, title, route ?? null, description ?? null, accommodation ?? null, meals ?? null]
    );
    return ok(rows[0], 201);
  }

  if (req.method === 'DELETE') {
    await pool.query('DELETE FROM tour_itinerary_days WHERE tour_id = $1', [tourId]);
    return ok({ deleted: true });
  }

  return err('Method not allowed', 405);
}
