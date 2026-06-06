import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { log } from '@/lib/logger';
import { Eye, EyeOff, Sun, Moon, Lock, Mail, ArrowLeft } from 'lucide-react';

type Mode = 'login' | 'reset';

const INPUT_STYLE = {
  background: 'rgba(255,255,255,.07)',
  borderColor: 'rgba(255,255,255,.12)',
  color: '#fff',
  borderRadius: 8,
};

const ERROR_BOX = {
  padding: '10px 12px',
  background: 'rgba(239,68,68,.12)',
  border: '1px solid rgba(239,68,68,.25)',
  borderRadius: 6,
  fontSize: 13,
  color: '#FCA5A5',
};

export default function Login() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      const code = err.message?.toLowerCase() ?? '';
      if (code.includes('invalid_credentials') || code.includes('invalid login')) {
        setError('Incorrect email or password.');
      } else if (code.includes('email_not_confirmed') || code.includes('not confirmed')) {
        setError('Email not confirmed. Go to Supabase → Auth → Users → confirm email.');
      } else if (code.includes('too_many') || code.includes('rate')) {
        setError('Too many attempts. Wait a few minutes and try again.');
      } else {
        setError(err.message);
      }
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError('Enter your email address first.'); return; }
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) { setError(err.message); }
    else { log.success('auth', `Reset email sent to ${email}`); setResetSent(true); }
  }

  const switchMode = (m: Mode) => { setMode(m); setError(''); setResetSent(false); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 20% 50%, rgba(201,169,110,.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(201,169,110,.03) 0%, transparent 40%)`, pointerEvents: 'none' }} />

      <button onClick={toggle} className="btn-icon" style={{ position: 'absolute', top: 20, right: 20, color: 'rgba(255,255,255,.4)', borderColor: 'rgba(255,255,255,.1)' }}>
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      <div style={{ width: '100%', maxWidth: 400, padding: '0 20px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg, #C9A96E, #A07840)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ color: '#1A0F0A', fontWeight: 800, fontSize: 20, fontFamily: 'Georgia' }}>B</span>
          </div>
          <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 24, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Best Travel Morocco</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase' }}>Admin Portal</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 32, backdropFilter: 'blur(10px)' }}>

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
                <Lock size={14} style={{ color: 'var(--sand)' }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>Secure sign-in</span>
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'rgba(255,255,255,.6)' }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.3)', pointerEvents: 'none' }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="hello@besttravelmorocco.com" disabled={loading}
                      className="form-input" style={{ ...INPUT_STYLE, paddingLeft: 36 }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: 'rgba(255,255,255,.6)' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="••••••••" disabled={loading}
                      className="form-input" style={{ ...INPUT_STYLE, paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', padding: 2 }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {error && <div style={ERROR_BOX}>{error}</div>}

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 4, opacity: loading ? .7 : 1 }}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <button onClick={() => switchMode('reset')} style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 16, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,.3)', textDecoration: 'underline' }}>
                Forgot password?
              </button>
            </>
          )}

          {/* ── RESET PASSWORD ── */}
          {mode === 'reset' && (
            <>
              <button onClick={() => switchMode('login')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', fontSize: 13, marginBottom: 20, padding: 0 }}>
                <ArrowLeft size={14} /> Back to sign-in
              </button>

              {resetSent ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(52,211,153,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Mail size={22} style={{ color: '#34D399' }} />
                  </div>
                  <p style={{ color: '#fff', fontWeight: 600, marginBottom: 8 }}>Check your email</p>
                  <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>Reset link sent to <strong style={{ color: 'rgba(255,255,255,.7)' }}>{email}</strong></p>
                </div>
              ) : (
                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, lineHeight: 1.6 }}>Enter your email and we'll send a password reset link.</p>
                  <div className="form-group">
                    <label className="form-label" style={{ color: 'rgba(255,255,255,.6)' }}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="hello@besttravelmorocco.com"
                      className="form-input" style={INPUT_STYLE} />
                  </div>
                  {error && <div style={ERROR_BOX}>{error}</div>}
                  <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent: 'center', opacity: loading ? .7 : 1 }}>
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,.18)' }}>
          Best Travel Morocco — Restricted Access
        </p>
      </div>
    </div>
  );
}
