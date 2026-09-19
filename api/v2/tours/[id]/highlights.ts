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
    const { rows } = await pool.query('SELECT * FROM tour_highlights WHERE tour_id = $1 ORDER BY sort_order', [tourId]);
    return ok(rows);
  }

  if (req.method === 'POST') {
    const body = await parseBody(req);
    const { text, sort_order } = body as Record<string, unknown>;
    if (!text) return err('text required');
    const { rows } = await pool.query(
      'INSERT INTO tour_highlights (tour_id, text, sort_order) VALUES ($1,$2,$3) RETURNING *',
      [tourId, text, sort_order ?? 0]
    );
    return ok(rows[0], 201);
  }

  if (req.method === 'PUT') {
    const body = await parseBody(req) as { highlights: Array<{ text: string; sort_order: number }> };
    if (!Array.isArray(body.highlights)) return err('highlights array required');
    await pool.query('DELETE FROM tour_highlights WHERE tour_id = $1', [tourId]);
    for (const [i, h] of body.highlights.entries()) {
      await pool.query('INSERT INTO tour_highlights (tour_id, text, sort_order) VALUES ($1,$2,$3)', [tourId, h.text, h.sort_order ?? i]);
    }
    const { rows } = await pool.query('SELECT * FROM tour_highlights WHERE tour_id = $1 ORDER BY sort_order', [tourId]);
    return ok(rows);
  }

  if (req.method === 'DELETE') {
    await pool.query('DELETE FROM tour_highlights WHERE tour_id = $1', [tourId]);
    return ok({ deleted: true });
  }

  return err('Method not allowed', 405);
}
