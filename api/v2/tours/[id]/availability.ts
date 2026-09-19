import { getPool, ok, err, cors } from '../../lib/db';



function getTourId(req: Request): string {
  const parts = new URL(req.url).pathname.split('/').filter(Boolean);
  const idx = parts.indexOf('tours');
  return parts[idx + 1] ?? '';
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return cors();
  if (req.method !== 'GET') return err('GET only', 405);

  const pool = getPool();
  const tourId = getTourId(req);
  const url = new URL(req.url);
  const year = parseInt(url.searchParams.get('year') ?? String(new Date().getFullYear()));
  const month = url.searchParams.get('month');

  let query = 'SELECT * FROM booking_calendar WHERE tour_id = $1';
  const params: unknown[] = [tourId];

  if (month) {
    query += ` AND date LIKE $2`;
    params.push(`${year}-${String(month).padStart(2, '0')}%`);
  } else {
    query += ` AND date LIKE $2`;
    params.push(`${year}%`);
  }
  query += ' ORDER BY date';

  const { rows } = await pool.query(query, params);
  return ok(rows);
}
