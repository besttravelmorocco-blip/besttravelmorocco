import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { HomepageSection } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Eye, EyeOff, ChevronUp, ChevronDown, Edit2, Save,
  Loader2, X, ExternalLink, LayoutDashboard, RefreshCw,
} from 'lucide-react';

const SECTION_LABELS: Record<string, string> = {
  hero:           'Hero Banner',
  stats:          'Stats Bar',
  featured_tours: 'Featured Tours',
  destinations:   'Top Destinations',
  about:          'About Section',
  testimonials:   'Testimonials',
  blog_preview:   'Latest Blog Posts',
  cta:            'Contact CTA',
  faq:            'FAQs',
  video:          'Video',
};

const SECTION_DESCRIPTIONS: Record<string, string> = {
  hero:           'Main hero with heading, subheading, background image, and CTA buttons',
  stats:          'Row of statistics (years experience, tours, travelers, etc.)',
  featured_tours: 'Grid of handpicked tours to showcase on the homepage',
  destinations:   'Cards showing top Moroccan destinations',
  about:          'About Best Travel Morocco section with text and image',
  testimonials:   'Carousel of client testimonials from the database',
  blog_preview:   'Latest blog posts from the blog database',
  cta:            'Call-to-action section with WhatsApp and email buttons',
  faq:            'Frequently asked questions accordion',
  video:          'Embedded YouTube video section',
};

// ── Config field editors per section type ────────────────────────────────────

function HeroEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const s = (k: string, v: string) => onChange({ ...config, [k]: v });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="form-group">
        <label className="form-label">Heading</label>
        <input className="form-input" value={(config.heading as string) ?? ''} onChange={e => s('heading', e.target.value)} placeholder="Discover the Magic of Morocco" />
      </div>
      <div className="form-group">
        <label className="form-label">Subheading</label>
        <textarea className="form-input" rows={2} value={(config.subheading as string) ?? ''} onChange={e => s('subheading', e.target.value)} style={{ resize: 'none' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Primary CTA Text</label>
          <input className="form-input" value={(config.cta_text as string) ?? ''} onChange={e => s('cta_text', e.target.value)} placeholder="View All Tours" />
        </div>
        <div className="form-group">
          <label className="form-label">Primary CTA URL</label>
          <input className="form-input" value={(config.cta_url as string) ?? ''} onChange={e => s('cta_url', e.target.value)} placeholder="/tours" />
        </div>
        <div className="form-group">
          <label className="form-label">Secondary CTA Text</label>
          <input className="form-input" value={(config.cta2_text as string) ?? ''} onChange={e => s('cta2_text', e.target.value)} placeholder="Contact Us" />
        </div>
        <div className="form-group">
          <label className="form-label">Secondary CTA URL</label>
          <input className="form-input" value={(config.cta2_url as string) ?? ''} onChange={e => s('cta2_url', e.target.value)} placeholder="/contact" />
        </div>
      </div>
    </div>
  );
}

function StatsEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const items: { value: string; label: string }[] = (config.items as { value: string; label: string }[]) ?? [];
  function updateItem(i: number, field: 'value' | 'label', v: string) {
    const next = items.map((it, idx) => idx === i ? { ...it, [field]: v } : it);
    onChange({ ...config, items: next });
  }
  function addItem() { onChange({ ...config, items: [...items, { value: '', label: '' }] }); }
  function removeItem(i: number) { onChange({ ...config, items: items.filter((_, idx) => idx !== i) }); }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'center' }}>
          <input className="form-input" value={it.value} onChange={e => updateItem(i, 'value', e.target.value)} placeholder="25+" style={{ fontSize: 13 }} />
          <input className="form-input" value={it.label} onChange={e => updateItem(i, 'label', e.target.value)} placeholder="Years Experience" style={{ fontSize: 13 }} />
          <button onClick={() => removeItem(i)} className="btn btn-ghost btn-icon" style={{ color: '#EF4444' }}>✕</button>
        </div>
      ))}
      <button onClick={addItem} className="btn btn-outline" style={{ fontSize: 12, alignSelf: 'flex-start' }}>+ Add Stat</button>
    </div>
  );
}

function GenericHeadingEditor({ config, onChange, placeholder }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; placeholder?: string }) {
  return (
    <div className="form-group">
      <label className="form-label">Section Heading</label>
      <input className="form-input" value={(config.heading as string) ?? ''} onChange={e => onChange({ ...config, heading: e.target.value })} placeholder={placeholder ?? 'Section heading…'} />
    </div>
  );
}

function AboutEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const s = (k: string, v: string) => onChange({ ...config, [k]: v });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="form-group">
        <label className="form-label">Heading</label>
        <input className="form-input" value={(config.heading as string) ?? ''} onChange={e => s('heading', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Text</label>
        <textarea className="form-input" rows={4} value={(config.text as string) ?? ''} onChange={e => s('text', e.target.value)} style={{ resize: 'vertical' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">CTA Text</label>
          <input className="form-input" value={(config.cta_text as string) ?? ''} onChange={e => s('cta_text', e.target.value)} placeholder="Learn More" />
        </div>
        <div className="form-group">
          <label className="form-label">CTA URL</label>
          <input className="form-input" value={(config.cta_url as string) ?? ''} onChange={e => s('cta_url', e.target.value)} placeholder="/about" />
        </div>
      </div>
    </div>
  );
}

function CtaEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const s = (k: string, v: string) => onChange({ ...config, [k]: v });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="form-group">
        <label className="form-label">Heading</label>
        <input className="form-input" value={(config.heading as string) ?? ''} onChange={e => s('heading', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Subtext</label>
        <input className="form-input" value={(config.subtext as string) ?? ''} onChange={e => s('subtext', e.target.value)} placeholder="Get a free quote within 24 hours" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">WhatsApp Button Text</label>
          <input className="form-input" value={(config.whatsapp_text as string) ?? ''} onChange={e => s('whatsapp_text', e.target.value)} placeholder="WhatsApp Us Now" />
        </div>
        <div className="form-group">
          <label className="form-label">Email Button Text</label>
          <input className="form-input" value={(config.email_text as string) ?? ''} onChange={e => s('email_text', e.target.value)} placeholder="Email Us" />
        </div>
      </div>
    </div>
  );
}

function BlogPreviewEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="form-group">
        <label className="form-label">Heading</label>
        <input className="form-input" value={(config.heading as string) ?? ''} onChange={e => onChange({ ...config, heading: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">Number of Posts to Show</label>
        <input type="number" min={1} max={9} className="form-input" style={{ width: 80 }} value={(config.post_count as number) ?? 3} onChange={e => onChange({ ...config, post_count: +e.target.value })} />
      </div>
    </div>
  );
}

function SectionConfigEditor({ section, onChange }: { section: HomepageSection; onChange: (c: Record<string, unknown>) => void }) {
  const t = section.section_type;
  if (t === 'hero')          return <HeroEditor config={section.config} onChange={onChange} />;
  if (t === 'stats')         return <StatsEditor config={section.config} onChange={onChange} />;
  if (t === 'about')         return <AboutEditor config={section.config} onChange={onChange} />;
  if (t === 'cta')           return <CtaEditor config={section.config} onChange={onChange} />;
  if (t === 'blog_preview')  return <BlogPreviewEditor config={section.config} onChange={onChange} />;
  if (t === 'featured_tours' || t === 'testimonials' || t === 'destinations') {
    return <GenericHeadingEditor config={section.config} onChange={onChange} placeholder={`${SECTION_LABELS[t]} heading`} />;
  }
  return <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No configurable options for this section type.</p>;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HomepageBuilderPage() {
  const [sections, setSections]   = useState<HomepageSection[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState<string | null>(null);
  const [editing, setEditing]     = useState<HomepageSection | null>(null);
  const [editConfig, setEditConfig] = useState<Record<string, unknown>>({});

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('sort_order');
    if (error) { toast.error(error.message); setLoading(false); return; }
    setSections((data ?? []) as HomepageSection[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleVisible(s: HomepageSection) {
    setSaving(s.id);
    const { error } = await supabase
      .from('homepage_sections')
      .update({ is_visible: !s.is_visible })
      .eq('id', s.id);
    if (error) { toast.error(error.message); setSaving(null); return; }
    setSections(p => p.map(x => x.id === s.id ? { ...x, is_visible: !s.is_visible } : x));
    toast.success(s.is_visible ? 'Section hidden' : 'Section visible');
    setSaving(null);
  }

  async function move(s: HomepageSection, dir: 'up' | 'down') {
    const sorted = [...sections].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex(x => x.id === s.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    setSaving(s.id);
    await Promise.all([
      supabase.from('homepage_sections').update({ sort_order: other.sort_order }).eq('id', s.id),
      supabase.from('homepage_sections').update({ sort_order: s.sort_order }).eq('id', other.id),
    ]);
    setSaving(null);
    load();
  }

  function openEdit(s: HomepageSection) {
    setEditing(s);
    setEditConfig({ ...s.config });
  }

  async function saveConfig() {
    if (!editing) return;
    setSaving(editing.id);
    const { error } = await supabase
      .from('homepage_sections')
      .update({ config: editConfig, updated_at: new Date().toISOString() })
      .eq('id', editing.id);
    if (error) { toast.error(error.message); setSaving(null); return; }
    toast.success('Section saved');
    setSections(p => p.map(x => x.id === editing.id ? { ...x, config: editConfig } : x));
    setEditing(null);
    setSaving(null);
  }

  const sorted = [...sections].sort((a, b) => a.sort_order - b.sort_order);
  const visible = sorted.filter(s => s.is_visible).length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Homepage Builder</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${sorted.length} sections — ${visible} visible · Changes go live after next deploy`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} className="btn btn-outline" title="Refresh">
            <RefreshCw size={14} />
          </button>
          <a href="https://www.besttravelmorocco.com" target="_blank" rel="noopener" className="btn btn-outline">
            <ExternalLink size={14} /> Preview Site
          </a>
        </div>
      </div>

      {/* Legend */}
      <div className="card" style={{ marginBottom: 20, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <LayoutDashboard size={15} style={{ color: 'var(--sand)' }} />
        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Drag sections up/down to reorder · Toggle eye to show/hide · Click edit to change content</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: 10, color: 'var(--text-3)' }}>
          <Loader2 size={18} className="animate-spin" />
          <span style={{ fontSize: 13 }}>Loading sections…</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map((s, idx) => (
            <div
              key={s.id}
              className="card"
              style={{
                opacity: s.is_visible ? 1 : 0.45,
                borderLeft: `3px solid ${s.is_visible ? 'var(--sand)' : 'var(--border)'}`,
                transition: 'opacity .2s, border-color .2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Order buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                  <button
                    onClick={() => move(s, 'up')} disabled={idx === 0 || saving === s.id}
                    style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: 'var(--text-3)', padding: 2, opacity: idx === 0 ? 0.25 : 1 }}
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    onClick={() => move(s, 'down')} disabled={idx === sorted.length - 1 || saving === s.id}
                    style={{ background: 'none', border: 'none', cursor: idx === sorted.length - 1 ? 'default' : 'pointer', color: 'var(--text-3)', padding: 2, opacity: idx === sorted.length - 1 ? 0.25 : 1 }}
                  >
                    <ChevronDown size={15} />
                  </button>
                </div>

                {/* Order number */}
                <div style={{ width: 28, height: 28, borderRadius: 6, background: s.is_visible ? 'var(--sand)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: s.is_visible ? '#1A0F0A' : 'var(--text-3)', flexShrink: 0 }}>
                  {idx + 1}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{SECTION_DESCRIPTIONS[s.section_type] ?? s.section_type}</div>
                  {/* Config preview */}
                  {typeof s.config.heading === 'string' && s.config.heading && (
                    <div style={{ fontSize: 11, color: 'var(--sand)', marginTop: 4, fontStyle: 'italic' }}>
                      "{s.config.heading}"
                    </div>
                  )}
                </div>

                {/* Type badge */}
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 7px', flexShrink: 0 }}>
                  {s.section_type}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => toggleVisible(s)} disabled={saving === s.id} className="btn btn-ghost btn-icon" title={s.is_visible ? 'Hide section' : 'Show section'}>
                    {saving === s.id ? <Loader2 size={14} className="animate-spin" /> : s.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => openEdit(s)} className="btn btn-ghost btn-icon" title="Edit content">
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{editing.label}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{SECTION_DESCRIPTIONS[editing.section_type]}</p>
              </div>
              <button onClick={() => setEditing(null)} className="btn btn-ghost btn-icon"><X size={16} /></button>
            </div>

            <SectionConfigEditor section={{ ...editing, config: editConfig }} onChange={setEditConfig} />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <button onClick={() => setEditing(null)} className="btn btn-outline">Cancel</button>
              <button onClick={saveConfig} disabled={saving === editing.id} className="btn btn-primary">
                {saving === editing.id ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Section</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
