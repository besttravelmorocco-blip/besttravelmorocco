import { getPool, ok, err, cors, parseBody } from '../../lib/db';



function getParams(req: Request): { tourId: string; date: string } {
  // path: /api/v2/calendar/:tour_id/:date
  const parts = new URL(req.url).pathname.split('/').filter(Boolean);
  return { tourId: parts[parts.length - 2] ?? '', date: parts[parts.length - 1] ?? '' };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return cors();
  const pool = getPool();
  const { tourId, date } = getParams(req);

  if (req.method === 'GET') {
    const { rows } = await pool.query('SELECT * FROM booking_calendar WHERE tour_id = $1 AND date = $2', [tourId, date]);
    if (!rows.length) return err('Not found', 404);
    return ok(rows[0]);
  }

  if (req.method === 'PUT') {
    const body = await parseBody(req);
    const allowed = ['status', 'max_pax', 'booked_pax', 'notes'];
    const sets: string[] = [];
    const params: unknown[] = [];
    for (const key of allowed) {
      if (key in body) { params.push(body[key]); sets.push(`${key} = $${params.length}`); }
    }
    if (!sets.length) return err('No fields to update');
    params.push(tourId, date);
    const { rows } = await pool.query(
      `UPDATE booking_calendar SET ${sets.join(', ')}, updated_at = NOW()
       WHERE tour_id = $${params.length - 1} AND date = $${params.length}
       RETURNING *`,
      params
    );
    if (!rows.length) {
      // Upsert if not exists
      const { rows: ins } = await pool.query(
        `INSERT INTO booking_calendar (tour_id, date, status, max_pax, booked_pax, notes)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [tourId, date, (body as Record<string, unknown>).status ?? 'available', (body as Record<string, unknown>).max_pax ?? 10, (body as Record<string, unknown>).booked_pax ?? 0, (body as Record<string, unknown>).notes ?? null]
      );
      return ok(ins[0]);
    }
    return ok(rows[0]);
  }

  if (req.method === 'DELETE') {
    await pool.query('DELETE FROM booking_calendar WHERE tour_id = $1 AND date = $2', [tourId, date]);
    return ok({ deleted: true });
  }

  return err('Method not allowed', 405);
}
