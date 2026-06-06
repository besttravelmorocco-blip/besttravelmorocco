import { Pool } from 'pg';

export interface PricingInput {
  tour_id: string;
  tier: string;
  start_date: string;    // YYYY-MM-DD
  num_nights: number;
  num_pax: number;
}

export interface PricingResult {
  accommodation: number;
  transport: number;
  guides: number;
  margin: number;
  base_price: number;
  total: number;
  per_person: number;
  tier_applied: string;
  season_applied: string | null;
  breakdown: {
    accommodation_per_night: number;
    nights: number;
    tier_multiplier: number;
    season_multiplier: number;
    pax: number;
  };
}

// Tier multipliers aligned with pricing_tiers seed data
const DEFAULT_TIER_MULTIPLIERS: Record<string, number> = {
  budget: 0.85,
  standard: 1.0,
  comfort: 1.2,
  premium: 1.5,
  luxury: 2.0,
};

// Month → season name lookup (applied if no DB season rows)
const MONTH_SEASON: Record<number, string> = {
  1: 'Low Season', 2: 'Low Season',
  3: 'High Season', 4: 'High Season', 5: 'High Season',
  6: 'Mid Season', 7: 'Mid Season', 8: 'Mid Season',
  9: 'High Season', 10: 'High Season', 11: 'High Season',
  12: 'Low Season',
};

const DEFAULT_SEASON_MULTIPLIERS: Record<string, number> = {
  'Low Season': 0.9,
  'Mid Season': 1.0,
  'High Season': 1.15,
};

export async function calculateTourPrice(
  pool: Pool,
  input: PricingInput
): Promise<PricingResult> {
  const { tour_id, tier, start_date, num_nights, num_pax } = input;

  // 1. Get tour base data
  const tourRes = await pool.query('SELECT * FROM tours_v2 WHERE id = $1', [tour_id]);
  if (!tourRes.rows.length) throw new Error(`Tour ${tour_id} not found`);

  // 2. Get accommodation cost for this tier
  // Find link for the first night (night_from <= 1 <= night_to)
  const accRes = await pool.query(
    `SELECT a.price_per_night, a.currency
     FROM tour_accommodation_links tal
     JOIN accommodations a ON a.id = tal.accommodation_id
     WHERE tal.tour_id = $1 AND tal.tier = $2 AND tal.night_from <= 1 AND tal.night_to >= 1
     LIMIT 1`,
    [tour_id, tier]
  );
  const accommodationPerNight = accRes.rows[0]?.price_per_night ?? 50;
  const accommodation = accommodationPerNight * num_nights;

  // 3. Get tier multiplier from DB, fall back to defaults
  const tierRes = await pool.query('SELECT multiplier FROM pricing_tiers WHERE slug = $1', [tier]);
  const tierMultiplier = tierRes.rows[0]?.multiplier
    ? parseFloat(tierRes.rows[0].multiplier)
    : (DEFAULT_TIER_MULTIPLIERS[tier] ?? 1.0);

  // 4. Get season multiplier from DB
  const month = new Date(start_date + 'T00:00:00Z').getUTCMonth() + 1;
  const seasonRes = await pool.query(
    'SELECT name, multiplier FROM seasons WHERE $1 = ANY(months) LIMIT 1',
    [month]
  );
  let seasonName: string | null = null;
  let seasonMultiplier = 1.0;
  if (seasonRes.rows.length) {
    seasonName = seasonRes.rows[0].name;
    seasonMultiplier = parseFloat(seasonRes.rows[0].multiplier);
  } else {
    seasonName = MONTH_SEASON[month] ?? null;
    seasonMultiplier = seasonName ? (DEFAULT_SEASON_MULTIPLIERS[seasonName] ?? 1.0) : 1.0;
  }

  // 5. Check for explicit override (tour + season + tier)
  if (seasonName) {
    const seasonIdRes = await pool.query('SELECT id FROM seasons WHERE name = $1 LIMIT 1', [seasonName]);
    if (seasonIdRes.rows.length) {
      const overrideRes = await pool.query(
        'SELECT base_price FROM pricing_overrides WHERE tour_id=$1 AND season_id=$2 AND tier_slug=$3',
        [tour_id, seasonIdRes.rows[0].id, tier]
      );
      if (overrideRes.rows.length) {
        const flat = parseFloat(overrideRes.rows[0].base_price) * num_pax;
        return {
          accommodation,
          transport: 0,
          guides: 0,
          margin: 0,
          base_price: flat,
          total: flat,
          per_person: flat / num_pax,
          tier_applied: tier,
          season_applied: seasonName,
          breakdown: { accommodation_per_night: accommodationPerNight, nights: num_nights, tier_multiplier: tierMultiplier, season_multiplier: seasonMultiplier, pax: num_pax },
        };
      }
    }
  }

  // 6. Calculate: base = accommodation × tier_multiplier × season_multiplier + transport estimate
  const transport = 80 * num_nights;   // $80/night placeholder (driver + fuel)
  const guides = 40 * num_nights;       // $40/night placeholder (guide share)
  const margin = 0.18;                   // 18% margin

  const operatingCost = (accommodation + transport + guides) * tierMultiplier * seasonMultiplier;
  const base_price = operatingCost / (1 - margin);
  const total = base_price;
  const per_person = total / num_pax;

  return {
    accommodation,
    transport,
    guides,
    margin,
    base_price: Math.round(base_price * 100) / 100,
    total: Math.round(total * 100) / 100,
    per_person: Math.round(per_person * 100) / 100,
    tier_applied: tier,
    season_applied: seasonName,
    breakdown: {
      accommodation_per_night: accommodationPerNight,
      nights: num_nights,
      tier_multiplier: tierMultiplier,
      season_multiplier: seasonMultiplier,
      pax: num_pax,
    },
  };
}
