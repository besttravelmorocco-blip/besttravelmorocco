import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Destination, DestinationHighlight } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Search, Plus, Edit2, Trash2, Globe, Star, RefreshCw, AlertCircle,
  X, Loader2, Eye, List, ArrowUp, ArrowDown, ImageOff, ToggleLeft, ToggleRight,
} from 'lucide-react';

const CATEGORIES = ['imperial', 'desert', 'coast', 'mountains', 'nature', 'city'];

// ─── Destination form ─────────────────────────────────────────────────────────
interface DestFormState {
  id: string; name: string; tagline: string; description: string;
  image: string; category: string; highlights: string; coords: string; featured: boolean;
}
function emptyDestForm(): DestFormState {
  return { id: '', name: '', tagline: '', description: '', image: '', category: 'city', highlights: '', coords: '', featured: false };
}

// ─── Highlight form ───────────────────────────────────────────────────────────
interface HlFormState {
  category: string; title: string; description: string;
  image: string; image_alt: string; display_order: number; is_active: boolean;
}
function emptyHlForm(order: number): HlFormState {
  return { category: '', title: '', description: '', image: '', image_alt: '', display_order: order, is_active: true };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DestinationsPage() {
  // Destinations list
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Destination CRUD form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DestFormState>(emptyDestForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  // Highlights panel
  const [hlDest, setHlDest] = useState<Destination | null>(null);
  const [hlList, setHlList] = useState<DestinationHighlight[]>([]);
  const [hlLoading, setHlLoading] = useState(false);
  const [hlSaving, setHlSaving] = useState(false);
  const [hlDeleting, setHlDeleting] = useState<string | null>(null);
  const [hlEditingId, setHlEditingId] = useState<string | null>(null); // null = new form hidden, 'new' = new, otherwise id
  const [hlForm, setHlForm] = useState<HlFormState>(emptyHlForm(1));

  // ── Destinations CRUD ──────────────────────────────────────────────────────

  async function fetchDestinations() {
    setLoading(true); setError(null);
    const { data, error: e } = await supabase.from('destinations').select('*').order('sort_order').order('name');
    if (e) { setError(e.message); setLoading(false); return; }
    setDestinations((data ?? []) as Destination[]);
    setLoading(false);
  }

  useEffect(() => { fetchDestinations(); }, []);

  function setField<K extends keyof DestFormState>(k: K, v: DestFormState[K]) {
    setForm(p => ({ ...p, [k]: v }));
  }

  function openNew() { setForm(emptyDestForm()); setEditing(null); setShowForm(true); }
  function openEdit(d: Destination) {
    setForm({
      id: d.id, name: d.name, tagline: d.tagline ?? '', description: d.description ?? '',
      image: d.image ?? '', category: d.category ?? 'city', highlights: d.highlights ?? '',
      coords: d.coords ?? '', featured: d.featured ?? false,
    });
    setEditing(d.id); setShowForm(true);
  }

  async function saveDestination() {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    const slug = form.id || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const payload = {
      name: form.name, tagline: form.tagline, description: form.description,
      image: form.image, category: form.category, highlights: form.highlights,
      coords: form.coords, featured: form.featured, updated_at: new Date().toISOString(),
    };
    const { error: e } = editing
      ? await supabase.from('destinations').update(payload).eq('id', editing)
      : await supabase.from('destinations').insert({ ...payload, id: slug, sort_order: destinations.length + 1, created_at: new Date().toISOString() });
    if (e) { toast.error(e.message); setSaving(false); return; }
    toast.success(editing ? 'Destination updated' : 'Destination created');
    setShowForm(false); fetchDestinations();
    setSaving(false);
  }

  async function deleteDestination(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This will also delete all its highlights.`)) return;
    setDeleting(id);
    const { error: e } = await supabase.from('destinations').delete().eq('id', id);
    if (e) toast.error(e.message);
    else { toast.success('Deleted'); setDestinations(p => p.filter(d => d.id !== id)); }
    setDeleting(null);
  }

  async function toggleFeatured(d: Destination) {
    const { error: e } = await supabase.from('destinations').update({ featured: !d.featured }).eq('id', d.id);
    if (e) { toast.error(e.message); return; }
    setDestinations(p => p.map(x => x.id === d.id ? { ...x, featured: !d.featured } : x));
  }

  // ── Highlights panel ───────────────────────────────────────────────────────

  async function openHighlights(dest: Destination) {
    setHlDest(dest);
    setHlEditingId(null);
    setHlLoading(true);
    const { data, error: e } = await supabase
      .from('destination_highlights')
      .select('*')
      .eq('destination_id', dest.id)
      .order('display_order');
    if (e) toast.error(e.message);
    setHlList((data ?? []) as DestinationHighlight[]);
    setHlLoading(false);
  }

  function closeHighlights() {
    setHlDest(null);
    setHlList([]);
    setHlEditingId(null);
  }

  function setHlField<K extends keyof HlFormState>(k: K, v: HlFormState[K]) {
    setHlForm(p => ({ ...p, [k]: v }));
  }

  function startNewHighlight() {
    const nextOrder = hlList.length > 0 ? Math.max(...hlList.map(h => h.display_order)) + 1 : 1;
    setHlForm(emptyHlForm(nextOrder));
    setHlEditingId('new');
  }

  function startEditHighlight(h: DestinationHighlight) {
    setHlForm({
      category: h.category, title: h.title, description: h.description ?? '',
      image: h.image ?? '', image_alt: h.image_alt ?? '',
      display_order: h.display_order, is_active: h.is_active,
    });
    setHlEditingId(h.id);
  }

  async function saveHighlight() {
    if (!hlDest) return;
    if (!hlForm.title.trim()) { toast.error('Title is required'); return; }
    setHlSaving(true);
    const payload = {
      destination_id: hlDest.id,
      category: hlForm.category.trim().toUpperCase(),
      title: hlForm.title.trim(),
      description: hlForm.description.trim(),
      image: hlForm.image.trim(),
      image_alt: hlForm.image_alt.trim(),
      display_order: Number(hlForm.display_order),
      is_active: hlForm.is_active,
      updated_at: new Date().toISOString(),
    };

    if (hlEditingId === 'new') {
      const { error: e } = await supabase
        .from('destination_highlights')
        .insert({ ...payload, created_at: new Date().toISOString() });
      if (e) { toast.error(e.message); setHlSaving(false); return; }
      toast.success('Highlight added');
    } else {
      const { error: e } = await supabase
        .from('destination_highlights')
        .update(payload)
        .eq('id', hlEditingId!);
      if (e) { toast.error(e.message); setHlSaving(false); return; }
      toast.success('Highlight updated');
    }

    setHlEditingId(null);
    // Refresh list
    const { data } = await supabase
      .from('destination_highlights')
      .select('*')
      .eq('destination_id', hlDest.id)
      .order('display_order');
    setHlList((data ?? []) as DestinationHighlight[]);
    setHlSaving(false);
  }

  async function deleteHighlight(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    setHlDeleting(id);
    const { error: e } = await supabase.from('destination_highlights').delete().eq('id', id);
    if (e) toast.error(e.message);
    else {
      toast.success('Deleted');
      setHlList(p => p.filter(h => h.id !== id));
    }
    setHlDeleting(null);
  }

  async function toggleHighlightActive(h: DestinationHighlight) {
    const { error: e } = await supabase
      .from('destination_highlights')
      .update({ is_active: !h.is_active })
      .eq('id', h.id);
    if (e) { toast.error(e.message); return; }
    setHlList(p => p.map(x => x.id === h.id ? { ...x, is_active: !h.is_active } : x));
  }

  async function moveHighlight(h: DestinationHighlight, dir: 'up' | 'down') {
    const sorted = [...hlList].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex(x => x.id === h.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const other = sorted[swapIdx];
    const aOrder = h.display_order;
    const bOrder = other.display_order;

    await Promise.all([
      supabase.from('destination_highlights').update({ display_order: bOrder }).eq('id', h.id),
      supabase.from('destination_highlights').update({ display_order: aOrder }).eq('id', other.id),
    ]);

    setHlList(p => p.map(x => {
      if (x.id === h.id) return { ...x, display_order: bOrder };
      if (x.id === other.id) return { ...x, display_order: aOrder };
      return x;
    }));
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const filtered = destinations.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.category?.toLowerCase().includes(search.toLowerCase())
  );
  const sortedHlList = [...hlList].sort((a, b) => a.display_order - b.display_order);

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading destinations…</p></div>;
  if (error) return <div className="page-error"><AlertCircle size={24} /><p>{error}</p><button className="btn btn-primary" onClick={fetchDestinations}><RefreshCw size={14} /> Retry</button></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Destinations</h1><p className="page-subtitle">{destinations.length} destinations</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchDestinations} className="btn btn-outline"><RefreshCw size={14} /></button>
          <button onClick={openNew} className="btn btn-primary"><Plus size={15} /> New Destination</button>
        </div>
      </div>

      <div className="search-input-wrap" style={{ marginBottom: 16 }}>
        <Search size={14} />
        <input type="text" placeholder="Search destinations…" value={search}
          onChange={e => setSearch(e.target.value)} className="form-input search-input" />
      </div>

      {/* ── Destination create/edit modal ─────────────────────────────────── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>{editing ? 'Edit Destination' : 'New Destination'}</h2>
              <button onClick={() => setShowForm(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Marrakech" /></div>
              <div className="form-group"><label className="form-label">Tagline</label><input className="form-input" value={form.tagline} onChange={e => setField('tagline', e.target.value)} placeholder="e.g. The Red City" /></div>
              <div className="form-group"><label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setField('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description} onChange={e => setField('description', e.target.value)} style={{ resize: 'vertical' }} /></div>
              <div className="form-group"><label className="form-label">Hero image path</label><input className="form-input" value={form.image} onChange={e => setField('image', e.target.value)} placeholder="/images/dest_marrakech.jpg" /></div>
              <div className="form-group"><label className="form-label">Coordinates</label><input className="form-input" value={form.coords} onChange={e => setField('coords', e.target.value)} placeholder="31.6295° N, 7.9811° W" /></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={form.featured} onChange={e => setField('featured', e.target.checked)} style={{ width: 16, height: 16 }} />
                Featured destination
              </label>
              <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                <button onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button onClick={saveDestination} disabled={saving} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  {saving ? <><Loader2 size={14} className="spin" /> Saving…</> : <><Globe size={14} /> {editing ? 'Save Changes' : 'Create Destination'}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Highlights management panel ───────────────────────────────────── */}
      {hlDest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: 720, background: 'var(--bg-1)', display: 'flex', flexDirection: 'column', height: '100vh', boxShadow: '-4px 0 24px rgba(0,0,0,0.25)' }}>

            {/* Panel header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
              <div>
                <p style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 2 }}>Featured Highlights</p>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>{hlDest.name}</h2>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={startNewHighlight} className="btn btn-primary" style={{ gap: 6 }}><Plus size={14} /> Add Highlight</button>
                <button onClick={closeHighlights} className="btn-icon"><X size={18} /></button>
              </div>
            </div>

            {/* Panel body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>

              {hlLoading && (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)' }}>
                  <Loader2 size={20} className="spin" style={{ display: 'inline-block' }} />
                  <p style={{ marginTop: 8, fontSize: 13 }}>Loading highlights…</p>
                </div>
              )}

              {/* ── New / Edit form ── */}
              {hlEditingId !== null && (
                <div className="card" style={{ marginBottom: 16, padding: 20 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 16 }}>
                    {hlEditingId === 'new' ? 'New Highlight' : 'Edit Highlight'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Category eyebrow *</label>
                        <input className="form-input" value={hlForm.category} onChange={e => setHlField('category', e.target.value)}
                          placeholder="e.g. JARDIN MAJORELLE" style={{ textTransform: 'uppercase' }} />
                        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Displayed in CAPS above the title</p>
                      </div>
                      <div className="form-group" style={{ width: 90 }}>
                        <label className="form-label">Order</label>
                        <input className="form-input" type="number" min={1} value={hlForm.display_order}
                          onChange={e => setHlField('display_order', parseInt(e.target.value) || 1)} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Title *</label>
                      <input className="form-input" value={hlForm.title} onChange={e => setHlField('title', e.target.value)}
                        placeholder="e.g. Discover the Jardin Majorelle" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-input" rows={4} value={hlForm.description}
                        onChange={e => setHlField('description', e.target.value)}
                        placeholder="A few sentences describing this highlight…"
                        style={{ resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Image path or URL</label>
                        <input className="form-input" value={hlForm.image} onChange={e => setHlField('image', e.target.value)}
                          placeholder="/images/dest_marrakech.jpg or https://…" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Image alt text</label>
                      <input className="form-input" value={hlForm.image_alt} onChange={e => setHlField('image_alt', e.target.value)}
                        placeholder="Describe the image for screen readers" />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" checked={hlForm.is_active}
                        onChange={e => setHlField('is_active', e.target.checked)} style={{ width: 15, height: 15 }} />
                      Active (visible on public site)
                    </label>
                    <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                      <button onClick={() => setHlEditingId(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                      <button onClick={saveHighlight} disabled={hlSaving} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                        {hlSaving ? <><Loader2 size={14} className="spin" /> Saving…</> : <>{hlEditingId === 'new' ? 'Add Highlight' : 'Save Changes'}</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Highlights list ── */}
              {!hlLoading && sortedHlList.length === 0 && hlEditingId === null && (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)' }}>
                  <List size={32} style={{ display: 'inline-block', marginBottom: 12, opacity: 0.4 }} />
                  <p style={{ fontSize: 14, marginBottom: 16 }}>No highlights yet for {hlDest.name}</p>
                  <button onClick={startNewHighlight} className="btn btn-primary"><Plus size={14} /> Add First Highlight</button>
                </div>
              )}

              {sortedHlList.map((h, idx) => (
                <div key={h.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                  borderBottom: '1px solid var(--border)', opacity: h.is_active ? 1 : 0.55,
                }}>
                  {/* Order controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                    <button onClick={() => moveHighlight(h, 'up')} disabled={idx === 0} className="btn-icon" style={{ padding: 4 }}><ArrowUp size={12} /></button>
                    <button onClick={() => moveHighlight(h, 'down')} disabled={idx === sortedHlList.length - 1} className="btn-icon" style={{ padding: 4 }}><ArrowDown size={12} /></button>
                  </div>

                  {/* Order badge */}
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', width: 20, textAlign: 'center', flexShrink: 0 }}>{h.display_order}</span>

                  {/* Image thumbnail */}
                  <div style={{ width: 56, height: 40, flexShrink: 0, background: 'var(--bg-2)', overflow: 'hidden', borderRadius: 4 }}>
                    {h.image
                      ? <img src={h.image} alt={h.image_alt || h.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageOff size={14} style={{ color: 'var(--text-3)' }} /></div>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {h.category && <span style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-3)', textTransform: 'uppercase', display: 'block' }}>{h.category}</span>}
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</span>
                  </div>

                  {/* Active toggle */}
                  <button
                    onClick={() => toggleHighlightActive(h)}
                    className="btn-icon"
                    title={h.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                    style={{ color: h.is_active ? '#22c55e' : 'var(--text-3)', flexShrink: 0 }}
                  >
                    {h.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>

                  {/* Edit */}
                  <button onClick={() => startEditHighlight(h)} className="btn-icon" title="Edit" style={{ flexShrink: 0 }}><Edit2 size={14} /></button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteHighlight(h.id, h.title)}
                    disabled={hlDeleting === h.id}
                    className="btn-icon btn-icon-danger"
                    title="Delete"
                    style={{ flexShrink: 0 }}
                  >
                    {hlDeleting === h.id ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              ))}

              {!hlLoading && sortedHlList.length > 0 && (
                <div style={{ paddingTop: 20, color: 'var(--text-3)', fontSize: 12, textAlign: 'center' }}>
                  {sortedHlList.length} highlight{sortedHlList.length !== 1 ? 's' : ''} · Reorder with ↑↓ · Changes save immediately
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Destinations grid ─────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p className="text-2" style={{ marginBottom: 16 }}>No destinations yet</p>
          <button onClick={openNew} className="btn btn-primary"><Plus size={14} /> Add First Destination</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(d => (
            <div key={d.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 140, background: 'var(--bg-2)', position: 'relative' }}>
                {d.image && <img src={d.image} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                  {d.featured && <span className="badge badge-success"><Star size={10} fill="currentColor" /> Featured</span>}
                  <span className="badge badge-default">{d.category}</span>
                </div>
              </div>
              <div style={{ padding: 14 }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 2 }}>{d.name}</h3>
                {d.tagline && <p className="text-3" style={{ fontSize: 12, marginBottom: 8 }}>{d.tagline}</p>}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href={`https://www.besttravelmorocco.com/destinations/${d.id}`} target="_blank" rel="noopener noreferrer" className="btn-icon" title="View on site"><Eye size={14} /></a>
                  <button onClick={() => toggleFeatured(d)} className="btn-icon" title={d.featured ? 'Remove featured' : 'Mark featured'} style={{ color: d.featured ? '#FBBF24' : 'var(--text-3)' }}><Star size={14} fill={d.featured ? '#FBBF24' : 'none'} /></button>
                  <button onClick={() => openHighlights(d)} className="btn-icon" title="Manage highlights" style={{ color: 'var(--text-2)' }}><List size={14} /></button>
                  <button onClick={() => openEdit(d)} className="btn-icon" title="Edit destination"><Edit2 size={14} /></button>
                  <button onClick={() => deleteDestination(d.id, d.name)} disabled={deleting === d.id} className="btn-icon btn-icon-danger" title="Delete">
                    {deleting === d.id ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
