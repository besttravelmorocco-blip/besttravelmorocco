import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Globe, Building2, BarChart3, Shield, Search, Settings,
  CheckCircle2, Loader2, Save, AlertCircle,
} from 'lucide-react';

interface SeoSettings {
  id: number;
  site_name: string;
  title_template: string;
  default_description: string;
  default_og_image: string;
  default_robots_index: boolean;
  default_robots_follow: boolean;
  org_name: string;
  org_url: string;
  org_logo: string;
  org_email: string;
  org_phone: string;
  org_address: string;
  org_city: string;
  org_country: string;
  org_facebook: string;
  org_instagram: string;
  org_twitter: string;
  org_youtube: string;
  google_analytics_id: string;
  google_tag_manager_id: string;
  microsoft_clarity_id: string;
  meta_pixel_id: string;
  google_site_verification: string;
  bing_site_verification: string;
  pinterest_site_verification: string;
  yandex_site_verification: string;
  robots_txt_custom: string;
  sitemap_exclude_noindex: boolean;
}

function emptySettings(): SeoSettings {
  return {
    id: 1,
    site_name: 'Best Travel Morocco',
    title_template: '{title} | Best Travel Morocco',
    default_description: '',
    default_og_image: '',
    default_robots_index: true,
    default_robots_follow: true,
    org_name: 'Best Travel Morocco',
    org_url: 'https://besttravelmorocco.com',
    org_logo: '',
    org_email: '',
    org_phone: '',
    org_address: '',
    org_city: 'Marrakech',
    org_country: 'Morocco',
    org_facebook: '',
    org_instagram: '',
    org_twitter: '',
    org_youtube: '',
    google_analytics_id: '',
    google_tag_manager_id: '',
    microsoft_clarity_id: '',
    meta_pixel_id: '',
    google_site_verification: '',
    bing_site_verification: '',
    pinterest_site_verification: '',
    yandex_site_verification: '',
    robots_txt_custom: '',
    sitemap_exclude_noindex: true,
  };
}

type Tab = 'general' | 'analytics' | 'organization' | 'social' | 'verification' | 'technical';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'general',       label: 'General',       icon: <Globe size={14} /> },
  { id: 'analytics',    label: 'Analytics',      icon: <BarChart3 size={14} /> },
  { id: 'organization', label: 'Organization',   icon: <Building2 size={14} /> },
  { id: 'social',       label: 'Social',         icon: <Search size={14} /> },
  { id: 'verification', label: 'Verification',   icon: <Shield size={14} /> },
  { id: 'technical',    label: 'Technical',      icon: <Settings size={14} /> },
];

export default function SeoSettingsPage() {
  const [form, setForm]       = useState<SeoSettings>(emptySettings());
  const [tab, setTab]         = useState<Tab>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('seo_settings').select('*').eq('id', 1).maybeSingle();
      if (error) {
        if (error.code === '42P01') { setNotFound(true); setLoading(false); return; }
        toast.error(error.message);
      }
      if (data) setForm({ ...emptySettings(), ...data });
      setLoading(false);
    }
    load();
  }, []);

  function set<K extends keyof SeoSettings>(k: K, v: SeoSettings[K]) {
    setForm(p => ({ ...p, [k]: v }));
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from('seo_settings')
      .upsert({ ...form, id: 1, updated_at: new Date().toISOString() });
    if (error) toast.error(error.message);
    else toast.success('SEO settings saved');
    setSaving(false);
  }

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading SEO settings…</p></div>;

  if (notFound) return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">SEO Settings</h1></div>
      </div>
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <AlertCircle size={32} style={{ color: 'var(--status-warning)', margin: '0 auto 12px' }} />
        <p style={{ fontWeight: 600, marginBottom: 8 }}>Database table not found</p>
        <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 20 }}>
          Run the migration SQL below in Supabase to create the <code>seo_settings</code> table.
        </p>
        <pre style={{ fontSize: 11, background: 'var(--bg)', padding: 16, borderRadius: 6, textAlign: 'left', overflow: 'auto', border: '1px solid var(--border)' }}>{MIGRATION_SQL}</pre>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">SEO Settings</h1>
          <p className="page-subtitle">Global defaults for the entire website's SEO</p>
        </div>
        <button onClick={save} disabled={saving} className="btn btn-primary">
          {saving ? <><Loader2 size={14} className="spin" /> Saving…</> : <><Save size={14} /> Save Settings</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Sidebar tabs */}
        <div className="card" style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
                borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                background: tab === t.id ? 'rgba(201,169,110,0.12)' : 'transparent',
                color: tab === t.id ? 'var(--sand)' : 'var(--text-2)',
                transition: 'all 0.15s',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {tab === 'general' && (<>
            <SectionHeader title="General SEO" desc="Default values used when individual pages don't specify their own SEO settings." />
            <Field label="Site Name" hint="Appended to page titles">
              <input className="form-input" value={form.site_name} onChange={e => set('site_name', e.target.value)} />
            </Field>
            <Field label="Title Template" hint="Use {title} as a placeholder for the page title">
              <input className="form-input" value={form.title_template} onChange={e => set('title_template', e.target.value)} placeholder="{title} | Best Travel Morocco" />
              <Preview>{form.title_template.replace('{title}', 'Sahara Desert Tour')}</Preview>
            </Field>
            <Field label="Default Meta Description" hint="Used when a page has no meta description set">
              <textarea className="form-input" rows={3} value={form.default_description} onChange={e => set('default_description', e.target.value)} placeholder="Morocco's most trusted travel company…" style={{ resize: 'vertical' }} />
            </Field>
            <Field label="Default OG Image" hint="Social sharing image used when pages have no OG image (1200×630px)">
              <input className="form-input" value={form.default_og_image} onChange={e => set('default_og_image', e.target.value)} placeholder="https://besttravelmorocco.com/images/og-default.jpg" />
              {form.default_og_image && <img src={form.default_og_image} alt="" style={{ marginTop: 8, width: '100%', maxWidth: 300, height: 100, objectFit: 'cover', borderRadius: 6 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
            </Field>
            <Field label="Default Robots">
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.default_robots_index} onChange={e => set('default_robots_index', e.target.checked)} />
                  Index by default
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.default_robots_follow} onChange={e => set('default_robots_follow', e.target.checked)} />
                  Follow links by default
                </label>
              </div>
            </Field>
          </>)}

          {tab === 'analytics' && (<>
            <SectionHeader title="Analytics & Tracking" desc="Paste your tracking IDs below. They are output in the public site's &lt;head&gt; automatically." />
            <Field label="Google Analytics 4" hint="Measurement ID — starts with G-">
              <input className="form-input" value={form.google_analytics_id} onChange={e => set('google_analytics_id', e.target.value)} placeholder="G-XXXXXXXXXX" />
            </Field>
            <Field label="Google Tag Manager" hint="Container ID — starts with GTM-">
              <input className="form-input" value={form.google_tag_manager_id} onChange={e => set('google_tag_manager_id', e.target.value)} placeholder="GTM-XXXXXXX" />
            </Field>
            <Field label="Microsoft Clarity" hint="Project ID from clarity.microsoft.com">
              <input className="form-input" value={form.microsoft_clarity_id} onChange={e => set('microsoft_clarity_id', e.target.value)} placeholder="xxxxxxxxxx" />
            </Field>
            <Field label="Meta Pixel" hint="Pixel ID from Meta Events Manager">
              <input className="form-input" value={form.meta_pixel_id} onChange={e => set('meta_pixel_id', e.target.value)} placeholder="XXXXXXXXXXXXXXXXXX" />
            </Field>
          </>)}

          {tab === 'organization' && (<>
            <SectionHeader title="Organization" desc="Used to generate Organization and LocalBusiness structured data (JSON-LD)." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Organization Name"><input className="form-input" value={form.org_name} onChange={e => set('org_name', e.target.value)} /></Field>
              <Field label="Website URL"><input className="form-input" value={form.org_url} onChange={e => set('org_url', e.target.value)} placeholder="https://besttravelmorocco.com" /></Field>
              <Field label="Email"><input className="form-input" type="email" value={form.org_email} onChange={e => set('org_email', e.target.value)} placeholder="hello@besttravelmorocco.com" /></Field>
              <Field label="Phone"><input className="form-input" value={form.org_phone} onChange={e => set('org_phone', e.target.value)} placeholder="+212 677 365 421" /></Field>
              <Field label="City"><input className="form-input" value={form.org_city} onChange={e => set('org_city', e.target.value)} /></Field>
              <Field label="Country"><input className="form-input" value={form.org_country} onChange={e => set('org_country', e.target.value)} /></Field>
            </div>
            <Field label="Street Address"><input className="form-input" value={form.org_address} onChange={e => set('org_address', e.target.value)} placeholder="1 Rue Example, Marrakech, Morocco" /></Field>
            <Field label="Logo URL" hint="Square logo, at least 112×112px">
              <input className="form-input" value={form.org_logo} onChange={e => set('org_logo', e.target.value)} placeholder="https://besttravelmorocco.com/logo.png" />
            </Field>
          </>)}

          {tab === 'social' && (<>
            <SectionHeader title="Social Profiles" desc="Used in Organization structured data and for cross-platform brand consistency." />
            <Field label="Facebook Page URL"><input className="form-input" value={form.org_facebook} onChange={e => set('org_facebook', e.target.value)} placeholder="https://facebook.com/besttravelmorocco" /></Field>
            <Field label="Instagram URL"><input className="form-input" value={form.org_instagram} onChange={e => set('org_instagram', e.target.value)} placeholder="https://instagram.com/besttravelmorocco" /></Field>
            <Field label="X / Twitter URL"><input className="form-input" value={form.org_twitter} onChange={e => set('org_twitter', e.target.value)} placeholder="https://x.com/besttravelmorocco" /></Field>
            <Field label="YouTube Channel URL"><input className="form-input" value={form.org_youtube} onChange={e => set('org_youtube', e.target.value)} placeholder="https://youtube.com/@besttravelmorocco" /></Field>
          </>)}

          {tab === 'verification' && (<>
            <SectionHeader title="Site Verification" desc="Verification meta tags output in the public site &lt;head&gt; for webmaster tools." />
            <Field label="Google Search Console" hint="From Google Search Console → Settings → Ownership verification → HTML tag">
              <input className="form-input" value={form.google_site_verification} onChange={e => set('google_site_verification', e.target.value)} placeholder="google-site-verification=xxxxxxxx" />
            </Field>
            <Field label="Bing Webmaster Tools" hint="From Bing Webmaster → Settings → Verify → Meta tag">
              <input className="form-input" value={form.bing_site_verification} onChange={e => set('bing_site_verification', e.target.value)} placeholder="msvalidate.01=xxxxxxxx" />
            </Field>
            <Field label="Pinterest" hint="From Pinterest Business → Claim → Website → Meta tag">
              <input className="form-input" value={form.pinterest_site_verification} onChange={e => set('pinterest_site_verification', e.target.value)} placeholder="p=xxxxxxxx" />
            </Field>
            <Field label="Yandex Webmaster" hint="From Yandex Webmaster → Settings → Verification → Meta tag">
              <input className="form-input" value={form.yandex_site_verification} onChange={e => set('yandex_site_verification', e.target.value)} placeholder="xxxxxxxx" />
            </Field>
            <div style={{ padding: '12px 14px', background: 'rgba(45,138,94,0.06)', borderRadius: 6, border: '1px solid rgba(45,138,94,0.15)' }}>
              <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                <CheckCircle2 size={12} style={{ color: 'var(--status-success)', display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Paste the full content attribute value (e.g. <code style={{ fontSize: 11 }}>google-site-verification=abc123</code>).
              </p>
            </div>
          </>)}

          {tab === 'technical' && (<>
            <SectionHeader title="Technical SEO" desc="robots.txt and XML sitemap configuration." />
            <Field label="XML Sitemap">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.sitemap_exclude_noindex} onChange={e => set('sitemap_exclude_noindex', e.target.checked)} />
                Automatically exclude <code style={{ fontSize: 12 }}>noindex</code> pages from the XML sitemap
              </label>
            </Field>
            <Field label="Custom robots.txt additions" hint="Added after the auto-generated rules. One directive per line.">
              <textarea
                className="form-input"
                rows={8}
                value={form.robots_txt_custom}
                onChange={e => set('robots_txt_custom', e.target.value)}
                placeholder={'# Example:\nDisallow: /admin\nDisallow: /api\n\nUser-agent: GPTBot\nDisallow: /'}
                style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
              />
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                View live robots.txt:{' '}
                <a href="https://besttravelmorocco.com/robots.txt" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sand)' }}>
                  besttravelmorocco.com/robots.txt
                </a>
              </p>
            </Field>
          </>)}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }} dangerouslySetInnerHTML={{ __html: desc }} />
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {hint && <span style={{ fontWeight: 400, color: 'var(--text-3)', marginLeft: 6, fontSize: 11 }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Preview({ children }: { children: string }) {
  return (
    <div style={{ marginTop: 6, padding: '6px 10px', background: 'var(--bg)', borderRadius: 4, border: '1px solid var(--border)', fontSize: 12, color: '#1a0dab', fontStyle: 'italic' }}>
      Preview: {children}
    </div>
  );
}

const MIGRATION_SQL = `CREATE TABLE IF NOT EXISTS seo_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_name TEXT DEFAULT 'Best Travel Morocco',
  title_template TEXT DEFAULT '{title} | Best Travel Morocco',
  default_description TEXT, default_og_image TEXT,
  default_robots_index BOOLEAN DEFAULT true, default_robots_follow BOOLEAN DEFAULT true,
  org_name TEXT, org_url TEXT, org_logo TEXT, org_email TEXT, org_phone TEXT,
  org_address TEXT, org_city TEXT DEFAULT 'Marrakech', org_country TEXT DEFAULT 'Morocco',
  org_facebook TEXT, org_instagram TEXT, org_twitter TEXT, org_youtube TEXT,
  google_analytics_id TEXT, google_tag_manager_id TEXT, microsoft_clarity_id TEXT,
  meta_pixel_id TEXT, google_site_verification TEXT, bing_site_verification TEXT,
  pinterest_site_verification TEXT, yandex_site_verification TEXT,
  robots_txt_custom TEXT, sitemap_exclude_noindex BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO seo_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;`;
