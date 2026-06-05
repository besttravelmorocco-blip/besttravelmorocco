// Centralized error/event logger — persists to localStorage, max 200 entries

export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface LogEntry {
  id: string;
  ts: string;           // ISO timestamp
  level: LogLevel;
  category: string;     // 'auth' | 'db' | 'email' | 'api' | 'ui'
  message: string;
  detail?: string;
}

const KEY = 'btm_admin_logs';
const MAX = 200;

function all(): LogEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
}

function write(level: LogLevel, category: string, message: string, detail?: string) {
  const entry: LogEntry = {
    id: Math.random().toString(36).slice(2, 10),
    ts: new Date().toISOString(),
    level, category, message,
    detail: detail ? String(detail).slice(0, 500) : undefined,
  };
  const entries = [entry, ...all()].slice(0, MAX);
  try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch { /* storage full */ }
  if (level === 'error') console.error(`[BTM ${category}]`, message, detail ?? '');
  else if (level === 'warn') console.warn(`[BTM ${category}]`, message, detail ?? '');
  return entry;
}

export const log = {
  info:    (cat: string, msg: string, detail?: string) => write('info',    cat, msg, detail),
  warn:    (cat: string, msg: string, detail?: string) => write('warn',    cat, msg, detail),
  error:   (cat: string, msg: string, detail?: string) => write('error',   cat, msg, detail),
  success: (cat: string, msg: string, detail?: string) => write('success', cat, msg, detail),
  all,
  clear:   () => localStorage.removeItem(KEY),
};
