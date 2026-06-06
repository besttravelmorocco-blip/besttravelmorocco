import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connStr = (process.env.DATABASE_URL ?? '').replace('?sslmode=require', '');
    pool = new Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined },
      max: 3,
    });
  }
  return pool;
}

export function ok(data: unknown, status = 200) {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export function err(message: string, status = 400) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export function cors() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export function parseBody(req: Request): Promise<Record<string, unknown>> {
  return req.json().catch(() => ({}));
}
