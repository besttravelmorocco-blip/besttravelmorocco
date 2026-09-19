import { getPool, ok, err, cors } from '../lib/db';



const MOROCCO_PORTS = ['casablanca', 'agadir', 'tangier', 'tanger', 'safi'];

function isMoroccoPort(text: string): boolean {
  return MOROCCO_PORTS.some(p => text.toLowerCase().includes(p));
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return cors();
  if (req.method !== 'POST') return err('POST only', 405);

  const pool = getPool();
  const log: string[] = [`Sync started: ${new Date().toISOString()}`];

  try {
    // Fetch Semester at Sea voyages page
    const res = await fetch('https://www.semesteratsea.org/voyages/', {
      headers: { 'User-Agent': 'BTM-Admin/2.0' },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      log.push(`Fetch failed: HTTP ${res.status}`);
      await saveSyncLog(pool, log);
      return ok({ synced: 0, log });
    }

    const html = await res.text();
    log.push(`Fetched SaS page: ${html.length} bytes`);

    // Parse voyage listings from HTML
    const voyages = parseVoyages(html);
    log.push(`Parsed ${voyages.length} voyages`);

    const moroccoVoyages = voyages.filter(v => v.moroccoPort);
    log.push(`Morocco stops found: ${moroccoVoyages.length}`);

    let upserted = 0;
    for (const v of voyages) {
      await pool.query(
        `INSERT INTO student_voyages (voyage_name, year, start_date, end_date, port_stops, morocco_port, morocco_arrival, morocco_days, source_url, raw_data)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (voyage_name, year)
         DO UPDATE SET start_date=$3, end_date=$4, port_stops=$5, morocco_port=$6, morocco_arrival=$7, morocco_days=$8, source_url=$9, raw_data=$10, synced_at=NOW(), updated_at=NOW()`,
        [v.name, v.year, v.startDate ?? null, v.endDate ?? null, JSON.stringify(v.ports), v.moroccoPort ?? null, v.moroccoArrival ?? null, v.moroccoDays, 'https://www.semesteratsea.org/voyages/', JSON.stringify(v)]
      );
      upserted++;
    }

    log.push(`Upserted: ${upserted} rows`);
    await saveSyncLog(pool, log);
    return ok({ synced: upserted, morocco_stops: moroccoVoyages.length, log });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    log.push(`ERROR: ${msg}`);
    await saveSyncLog(pool, log);
    return ok({ synced: 0, warning: msg, log });
  }
}

function parseVoyages(html: string) {
  const voyages: Array<{
    name: string; year: number; startDate: string | null; endDate: string | null;
    ports: string[]; moroccoPort: string | null; moroccoArrival: string | null; moroccoDays: number;
  }> = [];

  // Extract voyage cards/items from HTML
  // Pattern: look for voyage names containing year + season
  const yearPattern = /20[23]\d/g;
  const voyagePattern = /(?:Spring|Fall|Summer|Winter)\s+20[23]\d/gi;
  const matches = html.match(voyagePattern) ?? [];
  const seen = new Set<string>();

  for (const match of matches) {
    const yearM = match.match(/20[23]\d/);
    const year = yearM ? parseInt(yearM[0]) : new Date().getFullYear();
    const name = match.trim();
    const key = `${name}-${year}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // Look for port cities in surrounding HTML context
    const idx = html.indexOf(match);
    const context = html.slice(Math.max(0, idx - 500), idx + 1000).toLowerCase();
    const ports: string[] = [];
    const cities = ['casablanca', 'agadir', 'tangier', 'safi', 'rabat', 'barcelona', 'cadiz', 'lisbon', 'ghana', 'senegal', 'south africa', 'india', 'japan', 'china', 'vietnam', 'singapore', 'mauritius'];
    for (const city of cities) {
      if (context.includes(city)) ports.push(city);
    }

    const moroccoPort = ports.find(p => isMoroccoPort(p)) ?? null;

    voyages.push({ name, year, startDate: null, endDate: null, ports, moroccoPort, moroccoArrival: null, moroccoDays: moroccoPort ? 2 : 0 });
  }

  return voyages;
}

async function saveSyncLog(pool: ReturnType<typeof getPool>, log: string[]) {
  const content = log.join('\n');
  try {
    await pool.query(
      `INSERT INTO site_settings (key, value, category) VALUES ('sas_last_sync_log', $1, 'sync')
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
      [content]
    );
    await pool.query(
      `INSERT INTO site_settings (key, value, category) VALUES ('sas_last_sync_at', $1, 'sync')
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
      [new Date().toISOString()]
    );
  } catch (_) { /* log save failure is non-fatal */ }
}
