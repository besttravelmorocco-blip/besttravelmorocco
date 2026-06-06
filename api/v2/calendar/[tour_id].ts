import { getPool, ok, err, cors } from '../lib/db';



function getTourId(req: Request): string {
  // path: /api/v2/calendar/:tour_id
  const parts = new URL(req.url).pathname.split('/').filter(Boolean);
  return parts[parts.length - 1] ?? '';
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return cors();
  const pool = getPool();
  const tourId = getTourId(req);
  const url = new URL(req.url);

  if (req.method === 'GET') {
    const year = url.searchParams.get('year') ?? new Date().getFullYear().toString();
    const month = url.searchParams.get('month');
    const q = month
      ? `SELECT * FROM booking_calendar WHERE tour_id = $1 AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(MONTH FROM date) = $3 ORDER BY date`
      : `SELECT * FROM booking_calendar WHERE tour_id = $1 AND EXTRACT(YEAR FROM date) = $2 ORDER BY date`;
    const params = month ? [tourId, year, month] : [tourId, year];
    const { rows } = await pool.query(q, params);
    return ok(rows);
  }

  return err('Method not allowed', 405);
}
