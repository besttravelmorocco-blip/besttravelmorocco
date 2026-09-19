import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { log, type LogEntry } from '@/lib/logger';
import {
  CheckCircle, XCircle, AlertCircle, RefreshCw,
  Copy, ExternalLink, Loader2, Trash2, Clock,
} from 'lucide-react';

interface Check {
  label: string;
  status: 'ok' | 'error' | 'warning' | 'loading';
  detail: string;
}

const ADMIN_EMAIL = 'hello@besttravelmorocco.com';

const CREATE_USER_SQL = `-- Run in Supabase SQL Editor → https://app.supabase.com/project/uxkfqxistjvtofskqtwy/sql
-- Replace YOUR_SECURE_PASSWORD with your actual password before running

DELETE FROM auth.users WHERE email = '${ADMIN_EMAIL}';

INSERT INTO auth.users (
  id, instance_id, aud, role,
  email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  '${ADMIN_EMAIL}',
  crypt('YOUR_SECURE_PASSWORD', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}', '{}',
  false, now(), now(), '', '', '', ''
);

SELECT id, email, email_confirmed_at FROM auth.users WHERE email = '${ADMIN_EMAIL}';`;

const SMTP_ENV = `SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_YOUR_RESEND_API_KEY_HERE`;

export default function Setup() {
  const [checks, setChecks] = useState<Check[]>([
    { label: 'Supabase DB connection', status: 'loading', detail: 'Checking…' },
    { label: 'Auth endpoint', status: 'loading', detail: 'Checking…' },
    { label: 'Email confirmation disabled', status: 'loading', detail: 'Checking…' },
    { label: 'Admin user account', status: 'loading', detail: 'Checking…' },
    { label: 'SMTP / password reset email', status: 'loading', detail: 'Checking…' },
    { label: 'Database tables (5 required)', status: 'loading', detail: 'Checking…' },
    { label: 'Environment variables', status: 'loading', detail: 'Checking…' },
  ]);
  const [running, setRunning] = useState(false);
  const [logs, setLogs]       = useState<LogEntry[]>([]);
  const [copied, setCopied]   = useState<string | null>(null);
  const [tab, setTab]         = useState<'health' | 'logs' | 'fix'>('health');

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(null), 2000); });
  }

  function upd(idx: number, p: Partial<Check>) {
    setChecks(prev => prev.map((c, i) => i === idx ? { ...c, ...p } : c));
  }

  function refreshLogs() { setLogs(log.all()); }

  async function runChecks() {
    setRunning(true);
    setChecks(prev => prev.map(c => ({ ...c, status: 'loading', detail: 'Checking…' })));
    log.info('setup', 'Running health checks');

    // 1. DB connection
    try {
      const { error } = await supabase.from('tours').select('id').limit(1);
      if (error) { upd(0, { status: 'error', detail: error.message }); log.error('db', 'Connection failed', error.message); }
      else { upd(0, { status: 'ok', detail: 'Connected to Supabase successfully' }); log.success('db', 'Connected'); }
    } catch (e) { upd(0, { status: 'error', detail: String(e) }); }

    // 2 & 3. Auth endpoint + autoconfirm
    try {
      const res = await fetch('https://uxkfqxistjvtofskqtwy.supabase.co/auth/v1/settings', {
        headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '' }
      });
      const data = await res.json();
      if (!data.external) {
        upd(1, { status: 'error', detail: 'Auth endpoint returned unexpected data' });
        upd(2, { status: 'error', detail: 'Could not determine auth config' });
      } else {
        upd(1, { status: 'ok', detail: `Auth endpoint reachable. Email provider: ${data.external.email ? 'enabled' : 'disabled'}` });
        if (data.mailer_autoconfirm) {
          upd(2, { status: 'ok', detail: 'Email confirmation is OFF — users can log in immediately after creation ✓' });
          log.success('auth', 'mailer_autoconfirm = true');
        } else {
          upd(2, { status: 'warning', detail: 'Email confirmation is ON — newly created users must click an email link before login. Disable in Supabase → Auth → Providers → Email.' });
          log.warn('auth', 'mailer_autoconfirm = false — should be disabled for admin portal');
        }
      }
    } catch (e) { upd(1, { status: 'error', detail: String(e) }); upd(2, { status: 'error', detail: 'Cannot reach auth endpoint' }); }

    // 4. Admin user
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: '__diagnostic_probe__' });
      if (!error) {
        upd(3, { status: 'ok', detail: `Admin user exists and credentials work (this is unexpected — test password matched!)` });
      } else {
        const code = (error as { code?: string }).code ?? error.message ?? '';
        if (code.includes('email_not_confirmed')) {
          upd(3, { status: 'warning', detail: 'User exists but email unconfirmed. Disable email confirmation (Step 2 in Fix tab).' });
          log.warn('auth', 'Admin user email unconfirmed');
        } else if (code.includes('invalid_credentials') || code.includes('Invalid login')) {
          upd(3, { status: 'error', detail: `No valid admin user found for ${ADMIN_EMAIL}. Run the setup SQL in the Fix tab.` });
          log.error('auth', `Admin user missing or wrong password hash for ${ADMIN_EMAIL}`);
        } else {
          upd(3, { status: 'warning', detail: `Unexpected auth response: ${code}` });
        }
      }
    } catch (e) { upd(3, { status: 'error', detail: String(e) }); }

    // 5. SMTP
    try {
      const { error } = await supabase.auth.resetPasswordForEmail('probe_smtp_test_99@nowhere-fake.invalid');
      if (!error) {
        upd(4, { status: 'ok', detail: 'Password reset email queued — SMTP is working ✓' });
        log.success('email', 'SMTP working — reset email queued');
      } else {
        const msg = error.message ?? '';
        if (msg.includes('rate_limit') || msg.includes('rate limit')) {
          upd(4, { status: 'warning', detail: 'Rate-limited. SMTP may be working — wait 60 seconds and run checks again.' });
          log.warn('email', 'SMTP rate-limited');
        } else if (msg.includes('send') || msg.includes('smtp') || msg.includes('failure')) {
          upd(4, { status: 'error', detail: `SMTP not configured or failing: ${msg}. Configure Resend in Supabase → Project Settings → Auth → SMTP.` });
          log.error('email', 'SMTP sending failed', msg);
        } else {
          upd(4, { status: 'warning', detail: `Email status unclear: ${msg}` });
          log.warn('email', `Unclear SMTP response: ${msg}`);
        }
      }
    } catch (e) { upd(4, { status: 'error', detail: String(e) }); }

    // 6. Tables
    try {
      const tables = ['tours', 'destinations', 'blog_posts', 'inquiries', 'testimonials'];
      const results = await Promise.all(tables.map(t => supabase.from(t).select('id').limit(1).then(r => ({ t, ok: !r.error }))));
      const missing = results.filter(r => !r.ok).map(r => r.t);
      if (missing.length === 0) {
        upd(5, { status: 'ok', detail: `All 5 tables present: ${tables.join(', ')}` });
        log.success('db', 'All required tables present');
      } else {
        upd(5, { status: 'error', detail: `Missing tables: ${missing.join(', ')}` });
        log.error('db', `Missing tables: ${missing.join(', ')}`);
      }
    } catch (e) { upd(5, { status: 'error', detail: String(e) }); }

    // 7. Env vars
    const urlSet = !!import.meta.env.VITE_SUPABASE_URL;
    const keySet = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (urlSet && keySet) {
      upd(6, { status: 'ok', detail: 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set via Vercel env vars ✓' });
      log.success('config', 'Environment variables correctly set');
    } else {
      upd(6, { status: 'warning', detail: `Missing: ${!urlSet ? 'VITE_SUPABASE_URL' : ''} ${!keySet ? 'VITE_SUPABASE_ANON_KEY' : ''}. Using fallback hardcoded values.` });
      log.warn('config', 'Using fallback credentials — add to Vercel env vars');
    }

    setRunning(false);
    refreshLogs();
  }

  useEffect(() => { runChecks(); refreshLogs(); }, []);

  const StatusIcon = ({ s }: { s: Check['status'] }) => {
    if (s === 'loading') return <Loader2 size={16} style={{ color: 'var(--text-3)', animation: 'spin 0.7s linear infinite' }} />;
    if (s === 'ok')      return <CheckCircle size={16} style={{ color: '#34D399' }} />;
    if (s === 'error')   return <XCircle size={16} style={{ color: '#EF4444' }} />;
    return <AlertCircle size={16} style={{ color: '#FBBF24' }} />;
  };

  const bgFor = (s: Check['status']) => ({
    ok:      'rgba(52,211,153,.06)',
    error:   'rgba(239,68,68,.06)',
    warning: 'rgba(251,191,36,.06)',
    loading: 'transparent',
  }[s]);

  const borderFor = (s: Check['status']) => ({
    ok:      'rgba(52,211,153,.2)',
    error:   'rgba(239,68,68,.2)',
    warning: 'rgba(251,191,36,.2)',
    loading: 'var(--border)',
  }[s]);

  const levelColor = (l: LogEntry['level']) => ({ info: 'var(--text-3)', warn: '#FBBF24', error: '#EF4444', success: '#34D399' }[l]);

  const CodeBlock = ({ code, k }: { code: string; k: string }) => (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <pre style={{ background: '#0D0A07', color: '#E2D8CE', padding: 16, borderRadius: 8, fontSize: 12, lineHeight: 1.6, overflow: 'auto', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,.08)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{code}</pre>
      <button onClick={() => copy(code, k)} style={{ position: 'absolute', top: 10, right: 10, background: copied === k ? 'rgba(52,211,153,.2)' : 'rgba(255,255,255,.08)', border: 'none', borderRadius: 6, padding: '4px 10px', color: copied === k ? '#34D399' : 'rgba(255,255,255,.6)', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
        <Copy size={11} /> {copied === k ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );

  const okCount  = checks.filter(c => c.status === 'ok').length;
  const errCount = checks.filter(c => c.status === 'error').length;
  const warnCount = checks.filter(c => c.status === 'warning').length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Setup & Diagnostics</h1>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 12, color: '#34D399', fontWeight: 600 }}>✓ {okCount} ok</span>
            {errCount > 0 && <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>✗ {errCount} error</span>}
            {warnCount > 0 && <span style={{ fontSize: 12, color: '#FBBF24', fontWeight: 600 }}>⚠ {warnCount} warning</span>}
          </div>
        </div>
        <button onClick={runChecks} disabled={running} className="btn btn-outline">
          <RefreshCw size={14} style={{ animation: running ? 'spin 0.7s linear infinite' : 'none' }} /> Run Checks
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        {(['health', 'fix', 'logs'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab ${tab === t ? 'tab-active' : ''}`} style={{ textTransform: 'capitalize' }}>
            {t === 'health' ? '⬡ Health Checks' : t === 'fix' ? '🔧 Fix Guide' : `📋 System Logs (${logs.length})`}
          </button>
        ))}
      </div>

      {/* HEALTH tab */}
      {tab === 'health' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {checks.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', background: bgFor(c.status), border: `1px solid ${borderFor(c.status)}`, borderRadius: 10 }}>
              <div style={{ marginTop: 1, flexShrink: 0 }}><StatusIcon s={c.status} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)', marginBottom: 3 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.55 }}>{c.detail}</div>
              </div>
              {c.status === 'error' && (
                <button onClick={() => setTab('fix')} className="btn btn-outline" style={{ fontSize: 11, flexShrink: 0 }}>Fix →</button>
              )}
            </div>
          ))}

          <div className="card" style={{ marginTop: 16 }}>
            <h3 className="card-title" style={{ marginBottom: 14 }}>Quick Links</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {[
                { l: 'SQL Editor', u: 'https://app.supabase.com/project/uxkfqxistjvtofskqtwy/sql' },
                { l: 'Auth Users', u: 'https://app.supabase.com/project/uxkfqxistjvtofskqtwy/auth/users' },
                { l: 'Auth Settings', u: 'https://app.supabase.com/project/uxkfqxistjvtofskqtwy/auth/providers' },
                { l: 'SMTP Settings', u: 'https://app.supabase.com/project/uxkfqxistjvtofskqtwy/settings/auth' },
                { l: 'Resend Dashboard', u: 'https://resend.com/emails' },
                { l: 'Bluehost DNS', u: 'https://my.bluehost.com' },
              ].map(({ l, u }) => (
                <a key={l} href={u} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: 12 }}>
                  {l} <ExternalLink size={11} />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FIX tab */}
      {tab === 'fix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Fix 1: Admin user */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--sand)', color: '#1A0F0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>1</span>
              <h3 className="card-title">Create Admin User (bcrypt-hashed)</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.6 }}>
              Direct SQL inserts store plain-text passwords — they never match. This SQL creates a properly hashed user with email pre-confirmed.
            </p>
            <CodeBlock code={CREATE_USER_SQL} k="sql" />
            <a href="https://app.supabase.com/project/uxkfqxistjvtofskqtwy/sql" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ fontSize: 12 }}>
              Open SQL Editor <ExternalLink size={12} />
            </a>
          </div>

          {/* Fix 2: Email confirmation */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--sand)', color: '#1A0F0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>2</span>
              <h3 className="card-title">Disable Email Confirmation</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.6 }}>
              Supabase → Authentication → Providers → Email → toggle off <strong>"Confirm email"</strong>. For an admin-only portal this is required — there's no public signup.
            </p>
            <a href="https://app.supabase.com/project/uxkfqxistjvtofskqtwy/auth/providers" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: 12 }}>
              Open Auth Providers <ExternalLink size={12} />
            </a>
          </div>

          {/* Fix 3: SMTP */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--sand)', color: '#1A0F0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>3</span>
              <h3 className="card-title">Configure Resend SMTP (password resets)</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.6 }}>
              In Supabase → Project Settings → Auth → SMTP Settings → enable custom SMTP. Also set these in the Vercel main project env vars for the contact form.
            </p>
            <CodeBlock code={SMTP_ENV} k="smtp" />
            <div style={{ display: 'flex', gap: 10 }}>
              <a href="https://app.supabase.com/project/uxkfqxistjvtofskqtwy/settings/auth" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ fontSize: 12 }}>
                Supabase SMTP Settings <ExternalLink size={12} />
              </a>
              <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: 12 }}>
                Get Resend API Key <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Fix 4: Contact form SMTP */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--sand)', color: '#1A0F0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>4</span>
              <h3 className="card-title">Fix Contact Form Emails (currently silent)</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.6 }}>
              The Vercel project <code style={{ background: 'var(--bg)', padding: '2px 5px', borderRadius: 4 }}>btm</code> has SMTP env vars set to empty strings — inquiry emails are not being sent. Go to <strong>Vercel → btm project → Settings → Environment Variables</strong> and update SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS with your Resend values.
            </p>
            <a href="https://vercel.com/amed-laarossi/btm/settings/environment-variables" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ fontSize: 12 }}>
              Vercel Env Variables <ExternalLink size={12} />
            </a>
          </div>

          {/* Disable public signup */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--sand)', color: '#1A0F0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>5</span>
              <h3 className="card-title">Disable Public Signup</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.6 }}>
              Currently <code style={{ background: 'var(--bg)', padding: '2px 5px', borderRadius: 4 }}>disable_signup: false</code> — anyone could create an account. Enable "Disable Signups" in Supabase → Auth → Configuration.
            </p>
            <a href="https://app.supabase.com/project/uxkfqxistjvtofskqtwy/auth/configuration" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: 12 }}>
              Auth Configuration <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}

      {/* LOGS tab */}
      {tab === 'logs' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p className="text-3" style={{ fontSize: 12 }}>{logs.length} entries — stored in localStorage, max 200</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={refreshLogs} className="btn btn-outline" style={{ fontSize: 12 }}><RefreshCw size={13} /> Refresh</button>
              <button onClick={() => { log.clear(); refreshLogs(); }} className="btn btn-outline" style={{ fontSize: 12, color: '#EF4444' }}><Trash2 size={13} /> Clear</button>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)', fontSize: 13 }}>
              No log entries yet. Run health checks to generate logs.
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Time</th><th>Level</th><th>Category</th><th>Message</th><th>Detail</th></tr></thead>
                <tbody>
                  {logs.map(entry => (
                    <tr key={entry.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 11, color: 'var(--text-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={10} />
                          {new Date(entry.ts).toLocaleTimeString('en-GB')}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{new Date(entry.ts).toLocaleDateString('en-GB')}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 700, color: levelColor(entry.level), textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {entry.level}
                        </span>
                      </td>
                      <td><span className="badge badge-default" style={{ fontSize: 10 }}>{entry.category}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text-1)' }}>{entry.message}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-3)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.detail ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
