import { getPool, ok, err, cors, parseBody } from '../lib/db';



export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return cors();
  const pool = getPool();

  if (req.method === 'GET') {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const q: string[] = ['SELECT * FROM tours_v2'];
    const params: unknown[] = [];
    const conds: string[] = [];
    if (status) { params.push(status); conds.push(`status = $${params.length}`); }
    if (type)   { params.push(type);   conds.push(`type = $${params.length}`); }
    if (conds.length) q.push('WHERE ' + conds.join(' AND '));
    q.push('ORDER BY sort_order, created_at DESC');
    const { rows } = await pool.query(q.join(' '), params);
    return ok(rows);
  }

  if (req.method === 'POST') {
    const body = await parseBody(req);
    const { slug, title, subtitle, description, type, status, days, from_city, to_city, image, pdf_url, featured, sort_order, meta_title, meta_desc } = body as Record<string, unknown>;
    if (!slug || !title) return err('slug and title are required');
    const { rows } = await pool.query(
      `INSERT INTO tours_v2 (slug, title, subtitle, description, type, status, days, from_city, to_city, image, pdf_url, featured, sort_order, meta_title, meta_desc)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [slug, title, subtitle ?? null, description ?? null, type ?? 'private', status ?? 'draft', days ?? 1, from_city ?? null, to_city ?? null, image ?? null, pdf_url ?? null, featured ?? false, sort_order ?? 0, meta_title ?? null, meta_desc ?? null]
    );
    return ok(rows[0], 201);
  }

  return err('Method not allowed', 405);
}
