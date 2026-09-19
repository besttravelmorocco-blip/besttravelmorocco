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
    const { rows } = await pool.query(
      `SELECT po.*, s.name as season_name, s.months as season_months
       FROM pricing_overrides po
       LEFT JOIN seasons s ON s.id = po.season_id
       WHERE po.tour_id = $1
       ORDER BY po.tier_slug, s.name`,
      [tourId]
    );
    return ok(rows);
  }

  if (req.method === 'POST') {
    const body = await parseBody(req);
    const { season_id, tier_slug, base_price, currency } = body as Record<string, unknown>;
    if (!tier_slug || !base_price) return err('tier_slug and base_price required');
    const { rows } = await pool.query(
      `INSERT INTO pricing_overrides (tour_id, season_id, tier_slug, base_price, currency)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (tour_id, season_id, tier_slug)
       DO UPDATE SET base_price = EXCLUDED.base_price, updated_at = NOW()
       RETURNING *`,
      [tourId, season_id ?? null, tier_slug, base_price, currency ?? 'EUR']
    );
    return ok(rows[0], 201);
  }

  if (req.method === 'PUT') {
    const body = await parseBody(req) as { overrides: Array<{ season_id?: string; tier_slug: string; base_price: number; currency?: string }> };
    if (!Array.isArray(body.overrides)) return err('overrides array required');
    for (const o of body.overrides) {
      await pool.query(
        `INSERT INTO pricing_overrides (tour_id, season_id, tier_slug, base_price, currency)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (tour_id, season_id, tier_slug)
         DO UPDATE SET base_price = EXCLUDED.base_price, updated_at = NOW()`,
        [tourId, o.season_id ?? null, o.tier_slug, o.base_price, o.currency ?? 'EUR']
      );
    }
    return ok({ updated: body.overrides.length });
  }

  return err('Method not allowed', 405);
}
