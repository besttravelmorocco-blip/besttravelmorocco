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

  if (req.method === 'GET') {
    const { rows } = await pool.query('SELECT * FROM tour_faqs WHERE tour_id = $1 ORDER BY sort_order', [tourId]);
    return ok(rows);
  }

  if (req.method === 'POST') {
    const body = await parseBody(req);
    const { question, answer, sort_order } = body as Record<string, unknown>;
    if (!question || !answer) return err('question and answer required');
    const { rows } = await pool.query(
      'INSERT INTO tour_faqs (tour_id, question, answer, sort_order) VALUES ($1,$2,$3,$4) RETURNING *',
      [tourId, question, answer, sort_order ?? 0]
    );
    return ok(rows[0], 201);
  }

  if (req.method === 'PUT') {
    const body = await parseBody(req) as { faqs?: Array<{ id?: string; question: string; answer: string; sort_order?: number }> };
    if (!Array.isArray(body.faqs)) return err('faqs array required');
    await pool.query('DELETE FROM tour_faqs WHERE tour_id = $1', [tourId]);
    for (const [i, f] of body.faqs.entries()) {
      await pool.query(
        'INSERT INTO tour_faqs (tour_id, question, answer, sort_order) VALUES ($1,$2,$3,$4)',
        [tourId, f.question, f.answer, f.sort_order ?? i]
      );
    }
    const { rows } = await pool.query('SELECT * FROM tour_faqs WHERE tour_id = $1 ORDER BY sort_order', [tourId]);
    return ok(rows);
  }

  if (req.method === 'DELETE') {
    await pool.query('DELETE FROM tour_faqs WHERE tour_id = $1', [tourId]);
    return ok({ deleted: true });
  }

  return err('Method not allowed', 405);
}
