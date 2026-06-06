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
  const tier = url.searchParams.get('tier') ?? 'standard';
  const startDate = url.searchParams.get('date') ?? new Date().toISOString().slice(0, 10);
  const numNights = parseInt(url.searchParams.get('nights') ?? '2');
  const numPax = parseInt(url.searchParams.get('pax') ?? '2');

  // Get tour
  const { rows: [tour] } = await pool.query('SELECT * FROM tours_v2 WHERE id = $1', [tourId]);
  if (!tour) return err('Tour not found', 404);

  // Get tier multiplier
  const { rows: [tierRow] } = await pool.query('SELECT * FROM pricing_tiers WHERE slug = $1', [tier]);
  const tierMultiplier = tierRow ? parseFloat(tierRow.multiplier) : 1.0;

  // Get active season from start_date month
  const month = new Date(startDate).getMonth() + 1;
  const { rows: [season] } = await pool.query(
    'SELECT * FROM seasons WHERE $1 = ANY(months)',
    [month]
  );
  const seasonMultiplier = season ? parseFloat(season.multiplier) : 1.0;

  // Get accommodation links for this tour + tier
  const { rows: accomLinks } = await pool.query(
    `SELECT al.*, a.name, a.price_per_night, a.city
     FROM tour_accommodation_links al
     JOIN accommodations a ON a.id = al.accommodation_id
     WHERE al.tour_id = $1 AND al.tier = $2
     ORDER BY al.night_from`,
    [tourId, tier]
  );

  // Calculate accommodation cost
  const accommodationCost = accomLinks.reduce((sum: number, link: Record<string, number>) => {
    const nights = Math.min(link.night_to, numNights) - link.night_from + 1;
    return sum + (nights > 0 ? nights * link.price_per_night : 0);
  }, 0);

  // Check pricing override for this tour + season + tier
  const { rows: [override] } = await pool.query(
    `SELECT base_price FROM pricing_overrides
     WHERE tour_id = $1 AND tier_slug = $2
     AND (season_id = $3 OR season_id IS NULL)
     ORDER BY season_id DESC NULLS LAST
     LIMIT 1`,
    [tourId, tier, season?.id ?? null]
  );

  // Calculate total
  const basePrice = override?.base_price ?? (accommodationCost * 2); // fallback: accom × 2 as rough base
  const transport = Math.round(basePrice * 0.25);
  const guides = Math.round(basePrice * 0.15);
  const margin = Math.round(basePrice * 0.20);
  const subtotal = Math.round((basePrice + transport + guides + margin) * tierMultiplier * seasonMultiplier);
  const total = Math.max(subtotal, 1);
  const perPerson = numPax > 0 ? Math.round(total / numPax) : total;

  return ok({
    tour_id: tourId,
    tour_name: tour.title,
    tier_applied: { slug: tier, multiplier: tierMultiplier, label: tierRow?.label ?? tier },
    season_applied: season ? { name: season.name, multiplier: seasonMultiplier, month } : null,
    accommodation: accommodationCost,
    transport,
    guides,
    margin,
    base_price: basePrice,
    total,
    per_person: perPerson,
    num_pax: numPax,
    num_nights: numNights,
    currency: 'EUR',
  });
}
