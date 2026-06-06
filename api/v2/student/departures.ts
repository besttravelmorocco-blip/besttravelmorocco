import { getPool, ok, err, cors, parseBody } from '../lib/db';



export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return cors();
  const pool = getPool();
  const url = new URL(req.url);
  const id = url.pathname.split('/').filter(Boolean).pop();
  const isCollection = !id || id === 'departures';

  if (req.method === 'GET') {
    if (isCollection) {
      const status = url.searchParams.get('status');
      const q: string[] = ['SELECT * FROM student_departures'];
      const params: unknown[] = [];
      if (status) { params.push(status); q.push(`WHERE status = $1`); }
      q.push('ORDER BY departure_date');
      const { rows } = await pool.query(q.join(' '), params);
      return ok(rows);
    }
    const { rows } = await pool.query('SELECT * FROM student_departures WHERE id = $1', [id]);
    if (!rows.length) return err('Not found', 404);
    return ok(rows[0]);
  }

  if (req.method === 'POST') {
    const body = await parseBody(req);
    const { tour_id, tour_name, departure_date, return_date, max_seats, price_per_person, notes } = body as Record<string, unknown>;
    if (!tour_name || !departure_date || !return_date) return err('tour_name, departure_date, return_date required');
    const { rows } = await pool.query(
      `INSERT INTO student_departures (tour_id, tour_name, departure_date, return_date, max_seats, booked_seats, price_per_person, status, notes)
       VALUES ($1,$2,$3,$4,$5,0,$6,'open',$7) RETURNING *`,
      [tour_id ?? null, tour_name, departure_date, return_date, max_seats ?? 15, price_per_person ?? null, notes ?? null]
    );
    return ok(rows[0], 201);
  }

  if (req.method === 'PUT' && !isCollection) {
    const body = await parseBody(req);
    const allowed = ['tour_id','tour_name','departure_date','return_date','max_seats','booked_seats','price_per_person','status','notes'];
    const sets: string[] = [];
    const params: unknown[] = [];
    for (const key of allowed) {
      if (key in body) { params.push(body[key]); sets.push(`${key} = $${params.length}`); }
    }
    if (!sets.length) return err('No fields');
    params.push(id);
    const { rows } = await pool.query(`UPDATE student_departures SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`, params);
    if (!rows.length) return err('Not found', 404);
    return ok(rows[0]);
  }

  if (req.method === 'DELETE' && !isCollection) {
    await pool.query('DELETE FROM student_departures WHERE id = $1', [id]);
    return ok({ deleted: true });
  }

  return err('Method not allowed', 405);
}
