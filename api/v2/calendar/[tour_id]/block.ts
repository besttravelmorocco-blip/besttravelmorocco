import { getPool, ok, err, cors, parseBody } from '../../lib/db';



function getTourId(req: Request): string {
  // path: /api/v2/calendar/:tour_id/block
  const parts = new URL(req.url).pathname.split('/').filter(Boolean);
  return parts[parts.length - 2] ?? '';
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return cors();
  if (req.method !== 'POST') return err('POST only', 405);
  const pool = getPool();
  const tourId = getTourId(req);
  const body = await parseBody(req);
  const { date, reason } = body as Record<string, unknown>;
  if (!date) return err('date required (YYYY-MM-DD)');

  const { rows } = await pool.query(
    `INSERT INTO booking_calendar (tour_id, date, status, max_pax, booked_pax, notes)
     VALUES ($1, $2, 'blocked', 0, 0, $3)
     ON CONFLICT (tour_id, date)
     DO UPDATE SET status = 'blocked', notes = $3, updated_at = NOW()
     RETURNING *`,
    [tourId, date, reason ?? null]
  );
  return ok(rows[0], 201);
}
