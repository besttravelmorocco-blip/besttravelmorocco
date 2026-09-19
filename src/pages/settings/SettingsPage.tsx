import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Save, Globe, Mail, Phone, MapPin, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

const TABS = ['General', 'Contact', 'Social', 'Analytics'] as const;
type Tab = typeof TABS[number];

interface Settings {
  site_name: string;
  org_logo: string;
  org_email: string;
  org_phone: string;
  org_address: string;
  org_facebook: string;
  org_instagram: string;
  google_analytics_id: string;
  google_site_verification: string;
}

const DEFAULT: Settings = {
  site_name: 'Best Travel Morocco',
  org_logo: '',
  org_email: 'hello@besttravelmorocco.com',
  org_phone: '+212 677 365 421',
  org_address: 'Casablanca, Morocco',
  org_facebook: 'https://www.facebook.com/besttravelmorocco',
  org_instagram: 'https://www.instagram.com/besttravelmorocco',
  google_analytics_id: '',
  google_site_verification: '',
};

const ROW_ID = 1;

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('General');
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('seo_settings')
        .select('site_name,org_logo,org_email,org_phone,org_address,org_facebook,org_instagram,google_analytics_id,google_site_verification')
        .eq('id', ROW_ID)
        .maybeSingle();
      if (data) setSettings({ ...DEFAULT, ...(data as Partial<Settings>) });
      setLoading(false);
    }
    load();
  }, []);

  function set<K extends keyof Settings>(k: K, v: Settings[K]) {
    setSettings(p => ({ ...p, [k]: v }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    const { error: e } = await supabase
      .from('seo_settings')
      .upsert({ id: ROW_ID, ...settings, updated_at: new Date().toISOString() });
    if (e) { setError(e.message); toast.error(`Save failed: ${e.message}`); }
    else toast.success('Settings saved');
    setSaving(false);
  }

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading settings…</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Site configuration for Best Travel Morocco</p>
        </div>
        <button onClick={save} disabled={saving} className="btn btn-primary">
          {saving ? <><Loader2 size={14} className="spin" /> Saving…</> : <><Save size={14} /> Save Settings</>}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: '#EF4444', fontSize: 13 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Notice linking to comprehensive SEO settings */}
      <div style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-2)' }}>
        <Globe size={14} style={{ color: 'var(--sand)', flexShrink: 0 }} />
        For full SEO configuration (structured data, verification codes, analytics, robots.txt), use{' '}
        <a href="/seo/settings" style={{ color: 'var(--sand)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          SEO Settings <ExternalLink size={11} />
        </a>
      </div>

      <div className="tabs" style={{ marginBottom: 24 }}>
        {TABS.map(t => <button key={t} onClick={() => setTab(t)} className={`tab ${tab === t ? 'tab-active' : ''}`}>{t}</button>)}
      </div>

      {tab === 'General' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
          <div className="form-group">
            <label className="form-label"><Globe size={13} /> Site Name</label>
            <input className="form-input" value={settings.site_name} onChange={e => set('site_name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Logo URL</label>
            <input className="form-input" value={settings.org_logo} onChange={e => set('org_logo', e.target.value)} placeholder="https://…" />
          </div>
        </div>
      )}

      {tab === 'Contact' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
          <div className="form-group">
            <label className="form-label"><Mail size={13} /> Email</label>
            <input className="form-input" type="email" value={settings.org_email} onChange={e => set('org_email', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label"><Phone size={13} /> Phone</label>
            <input className="form-input" value={settings.org_phone} onChange={e => set('org_phone', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label"><MapPin size={13} /> Address</label>
            <textarea className="form-input" rows={3} value={settings.org_address} onChange={e => set('org_address', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>
      )}

      {tab === 'Social' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
          <div className="form-group">
            <label className="form-label">Facebook URL</label>
            <input className="form-input" value={settings.org_facebook} onChange={e => set('org_facebook', e.target.value)} placeholder="https://facebook.com/…" />
          </div>
          <div className="form-group">
            <label className="form-label">Instagram URL</label>
            <input className="form-input" value={settings.org_instagram} onChange={e => set('org_instagram', e.target.value)} placeholder="https://instagram.com/…" />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            For X/Twitter and YouTube, use <a href="/seo/settings" style={{ color: 'var(--sand)' }}>SEO Settings → Social</a>.
          </p>
        </div>
      )}

      {tab === 'Analytics' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
          <div className="form-group">
            <label className="form-label">Google Analytics 4 Measurement ID</label>
            <input className="form-input" value={settings.google_analytics_id} onChange={e => set('google_analytics_id', e.target.value)} placeholder="G-XXXXXXXXXX" />
            <p className="text-3" style={{ fontSize: 12, marginTop: 4 }}>Find this in GA4 → Admin → Data Streams</p>
          </div>
          <div className="form-group">
            <label className="form-label">Google Search Console Verification</label>
            <input className="form-input" value={settings.google_site_verification} onChange={e => set('google_site_verification', e.target.value)} placeholder="google-site-verification=xxxxxxxx" />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            For GTM, Clarity, Meta Pixel, Bing, and Pinterest verification, use <a href="/seo/settings" style={{ color: 'var(--sand)' }}>SEO Settings → Analytics / Verification</a>.
          </p>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button onClick={save} disabled={saving} className="btn btn-primary">
          {saving ? <><Loader2 size={14} className="spin" /> Saving…</> : <><Save size={14} /> Save Settings</>}
        </button>
      </div>
    </div>
  );
}
