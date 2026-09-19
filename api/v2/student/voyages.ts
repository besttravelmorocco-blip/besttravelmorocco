import { getPool, ok, err, cors, parseBody } from '../lib/db';



export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return cors();
  const pool = getPool();

  if (req.method === 'GET') {
    const { rows } = await pool.query('SELECT * FROM student_voyages ORDER BY year DESC, voyage_name');
    return ok(rows);
  }

  if (req.method === 'POST') {
    const body = await parseBody(req);
    const { voyage_name, year, start_date, end_date, port_stops, morocco_port, morocco_arrival, morocco_days, source_url } = body as Record<string, unknown>;
    if (!voyage_name || !year) return err('voyage_name and year required');
    const { rows } = await pool.query(
      `INSERT INTO student_voyages (voyage_name, year, start_date, end_date, port_stops, morocco_port, morocco_arrival, morocco_days, source_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (voyage_name, year)
       DO UPDATE SET start_date=$3, end_date=$4, port_stops=$5, morocco_port=$6, morocco_arrival=$7, morocco_days=$8, source_url=$9, synced_at=NOW(), updated_at=NOW()
       RETURNING *`,
      [voyage_name, year, start_date ?? null, end_date ?? null, JSON.stringify(port_stops ?? []), morocco_port ?? null, morocco_arrival ?? null, morocco_days ?? 0, source_url ?? null]
    );
    return ok(rows[0], 201);
  }

  return err('Method not allowed', 405);
}
