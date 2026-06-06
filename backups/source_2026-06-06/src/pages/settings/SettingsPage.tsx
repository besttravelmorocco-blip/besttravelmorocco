import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Save, Globe, Mail, Phone, MapPin, Loader2, AlertCircle } from 'lucide-react';

const TABS = ['General', 'Contact', 'Social', 'Analytics'] as const;
type Tab = typeof TABS[number];

interface Settings {
  site_name: string; site_tagline: string; logo_url: string;
  contact_email: string; contact_phone: string; whatsapp: string; address: string;
  facebook: string; instagram: string; tripadvisor: string;
  ga_id: string; gsc_code: string;
}

const DEFAULT: Settings = {
  site_name: 'Best Travel Morocco', site_tagline: 'Authentic Morocco Tours', logo_url: '',
  contact_email: 'hello@besttravelmorocco.com', contact_phone: '+212 677 365 421',
  whatsapp: '212677365421', address: 'Casablanca, Morocco',
  facebook: 'https://www.facebook.com/besttravelmorocco',
  instagram: 'https://www.instagram.com/besttravelmorocco',
  tripadvisor: '', ga_id: '', gsc_code: '',
};

const ROW_ID = 1; // single-row settings table

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('General');
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.from('seo_settings').select('*').eq('id', ROW_ID).single();
      if (data) setSettings({ ...DEFAULT, ...(data as Partial<Settings>) });
      setLoading(false);
    }
    load();
  }, []);

  function set<K extends keyof Settings>(k: K, v: Settings[K]) { setSettings(p => ({ ...p, [k]: v })); }

  async function save() {
    setSaving(true);
    setError(null);
    // upsert since seo_settings may be empty
    const { error: e } = await supabase.from('seo_settings').upsert({ id: ROW_ID, ...settings, updated_at: new Date().toISOString() });
    if (e) { setError(e.message); toast.error(`Save failed: ${e.message}`); }
    else toast.success('Settings saved');
    setSaving(false);
  }

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading settings…</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Settings</h1><p className="page-subtitle">Site configuration for Best Travel Morocco</p></div>
        <button onClick={save} disabled={saving} className="btn btn-primary">
          {saving ? <><Loader2 size={14} className="spin" /> Saving…</> : <><Save size={14} /> Save Settings</>}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: '#EF4444', fontSize: 13 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

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
            <label className="form-label">Tagline</label>
            <input className="form-input" value={settings.site_tagline} onChange={e => set('site_tagline', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Logo URL</label>
            <input className="form-input" value={settings.logo_url} onChange={e => set('logo_url', e.target.value)} placeholder="https://…" />
          </div>
        </div>
      )}

      {tab === 'Contact' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
          <div className="form-group">
            <label className="form-label"><Mail size={13} /> Email</label>
            <input className="form-input" type="email" value={settings.contact_email} onChange={e => set('contact_email', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label"><Phone size={13} /> Phone</label>
            <input className="form-input" value={settings.contact_phone} onChange={e => set('contact_phone', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp Number (digits only)</label>
            <input className="form-input" value={settings.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="212677365421" />
          </div>
          <div className="form-group">
            <label className="form-label"><MapPin size={13} /> Address</label>
            <textarea className="form-input" rows={3} value={settings.address} onChange={e => set('address', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>
      )}

      {tab === 'Social' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
          <div className="form-group">
            <label className="form-label">Facebook URL</label>
            <input className="form-input" value={settings.facebook} onChange={e => set('facebook', e.target.value)} placeholder="https://facebook.com/…" />
          </div>
          <div className="form-group">
            <label className="form-label">Instagram URL</label>
            <input className="form-input" value={settings.instagram} onChange={e => set('instagram', e.target.value)} placeholder="https://instagram.com/…" />
          </div>
          <div className="form-group">
            <label className="form-label">TripAdvisor URL</label>
            <input className="form-input" value={settings.tripadvisor} onChange={e => set('tripadvisor', e.target.value)} placeholder="https://tripadvisor.com/…" />
          </div>
        </div>
      )}

      {tab === 'Analytics' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
          <div className="form-group">
            <label className="form-label">Google Analytics 4 Measurement ID</label>
            <input className="form-input" value={settings.ga_id} onChange={e => set('ga_id', e.target.value)} placeholder="G-XXXXXXXXXX" />
            <p className="text-3" style={{ fontSize: 12, marginTop: 4 }}>Find this in GA4 → Admin → Data Streams</p>
          </div>
          <div className="form-group">
            <label className="form-label">Google Search Console Verification Code</label>
            <input className="form-input" value={settings.gsc_code} onChange={e => set('gsc_code', e.target.value)} placeholder="verification code" />
          </div>
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
