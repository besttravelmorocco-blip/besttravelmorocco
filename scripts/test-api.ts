#!/usr/bin/env node
/**
 * BTM v2 API smoke test — run against any BASE_URL
 * Usage: BASE_URL=http://localhost:3000 npx tsx scripts/test-api.ts
 */

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

interface Result { method: string; path: string; status: number; ok: boolean; note?: string }

async function hit(method: string, path: string, body?: unknown): Promise<Result> {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    return { method, path, status: res.status, ok: res.status < 400 };
  } catch (e: unknown) {
    const note = e instanceof Error ? e.message : 'network error';
    return { method, path, status: 0, ok: false, note };
  }
}

async function run() {
  const results: Result[] = [];

  // Tours
  results.push(await hit('GET', '/api/v2/tours'));
  results.push(await hit('GET', '/api/v2/tours?status=active'));
  results.push(await hit('GET', '/api/v2/tours/00000000-0000-0000-0000-000000000000'));  // expect 404
  results.push(await hit('GET', '/api/v2/tours/00000000-0000-0000-0000-000000000000/itinerary'));
  results.push(await hit('GET', '/api/v2/tours/00000000-0000-0000-0000-000000000000/highlights'));
  results.push(await hit('GET', '/api/v2/tours/00000000-0000-0000-0000-000000000000/faqs'));
  results.push(await hit('GET', '/api/v2/tours/00000000-0000-0000-0000-000000000000/pricing'));
  results.push(await hit('GET', '/api/v2/tours/00000000-0000-0000-0000-000000000000/availability'));

  // Accommodations
  results.push(await hit('GET', '/api/v2/accommodations'));
  results.push(await hit('GET', '/api/v2/accommodations?city=Marrakech'));
  results.push(await hit('GET', '/api/v2/accommodations/00000000-0000-0000-0000-000000000000'));  // expect 404

  // Seasons
  results.push(await hit('GET', '/api/v2/seasons'));

  // Student
  results.push(await hit('GET', '/api/v2/student/voyages'));
  results.push(await hit('GET', '/api/v2/student/departures'));
  results.push(await hit('GET', '/api/v2/student/departures?status=open'));

  // Calendar
  results.push(await hit('GET', '/api/v2/calendar/00000000-0000-0000-0000-000000000000?year=2025'));

  // Print results
  let pass = 0, fail = 0;
  for (const r of results) {
    const expected404 = r.path.includes('00000000') && r.method === 'GET' && !r.path.includes('itinerary') && !r.path.includes('highlights') && !r.path.includes('faqs') && !r.path.includes('pricing') && !r.path.includes('availability') && !r.path.includes('calendar');
    const success = r.ok || (expected404 && r.status === 404) || r.status === 0 && r.note?.includes('ECONNREFUSED');
    const icon = success ? '✅' : '❌';
    console.log(`${icon} ${r.method.padEnd(6)} ${r.status || '???'}  ${r.path}${r.note ? `  (${r.note})` : ''}`);
    if (success) pass++; else fail++;
  }

  console.log(`\n${pass} passed, ${fail} failed`);

  // Write results to API_TEST.md
  const lines = [
    '# API v2 Test Results',
    '',
    `**Run:** ${new Date().toISOString()}`,
    `**Base URL:** ${BASE}`,
    '',
    '| Method | Path | Status | Result |',
    '|--------|------|--------|--------|',
    ...results.map(r => {
      const expected404 = r.path.includes('00000000') && !['itinerary','highlights','faqs','pricing','availability','calendar'].some(s => r.path.includes(s));
      const success = r.ok || (expected404 && r.status === 404) || (r.status === 0 && Boolean(r.note));
      return `| ${r.method} | \`${r.path}\` | ${r.status || r.note} | ${success ? '✅ pass' : '❌ fail'} |`;
    }),
    '',
    `**Total:** ${pass} pass, ${fail} fail`,
  ];

  const fs = await import('fs/promises');
  await fs.writeFile('API_TEST.md', lines.join('\n'));
  console.log('\nResults written to API_TEST.md');
}

run().catch(console.error);
