import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Destination } from '@/lib/supabase';
import { toast } from 'sonner';
import { Search, Plus, Edit2, Trash2, Globe, Star, RefreshCw, AlertCircle, X, Loader2, Eye } from 'lucide-react';

const CATEGORIES = ['imperial', 'desert', 'coast', 'mountains', 'nature', 'city'];

interface FormState {
  id: string; name: string; tagline: string; description: string;
  image: string; category: string; highlights: string; coords: string; featured: boolean;
}

function emptyForm(): FormState {
  return { id: '', name: '', tagline: '', description: '', image: '', category: 'city', highlights: '', coords: '', featured: false };
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  async function fetch() {
    setLoading(true); setError(null);
    const { data, error: e } = await supabase.from('destinations').select('*').order('sort_order').order('name');
    if (e) { setError(e.message); setLoading(false); return; }
    setDestinations((data ?? []) as Destination[]);
    setLoading(false);
  }

  useEffect(() => { fetch(); }, []);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) { setForm(p => ({ ...p, [k]: v })); }

  function openNew() { setForm(emptyForm()); setEditing(null); setShowForm(true); }
  function openEdit(d: Destination) {
    setForm({ id: d.id, name: d.name, tagline: d.tagline ?? '', description: d.description ?? '', image: d.image ?? '', category: d.category ?? 'city', highlights: d.highlights ?? '', coords: d.coords ?? '', featured: d.featured ?? false });
    setEditing(d.id); setShowForm(true);
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    const slug = form.id || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const payload = { name: form.name, tagline: form.tagline, description: form.description, image: form.image, category: form.category, highlights: form.highlights, coords: form.coords, featured: form.featured, updated_at: new Date().toISOString() };
    const { error: e } = editing
      ? await supabase.from('destinations').update(payload).eq('id', editing)
      : await supabase.from('destinations').insert({ ...payload, id: slug, sort_order: destinations.length + 1, created_at: new Date().toISOString() });
    if (e) { toast.error(e.message); setSaving(false); return; }
    toast.success(editing ? 'Destination updated' : 'Destination created');
    setShowForm(false); fetch();
    setSaving(false);
  }

  async function del(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
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

  const filtered = destinations.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.category?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading destinations…</p></div>;
  if (error) return <div className="page-error"><AlertCircle size={24} /><p>{error}</p><button className="btn btn-primary" onClick={fetch}><RefreshCw size={14} /> Retry</button></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Destinations</h1><p className="page-subtitle">{destinations.length} destinations</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetch} className="btn btn-outline"><RefreshCw size={14} /></button>
          <button onClick={openNew} className="btn btn-primary"><Plus size={15} /> New Destination</button>
        </div>
      </div>

      <div className="search-input-wrap" style={{ marginBottom: 16 }}>
        <Search size={14} />
        <input type="text" placeholder="Search destinations…" value={search} onChange={e => setSearch(e.target.value)} className="form-input search-input" />
      </div>

      {/* Modal Form */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>{editing ? 'Edit Destination' : 'New Destination'}</h2>
              <button onClick={() => setShowForm(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Marrakech" /></div>
              <div className="form-group"><label className="form-label">Tagline</label><input className="form-input" value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="e.g. The Red City" /></div>
              <div className="form-group"><label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} /></div>
              <div className="form-group"><label className="form-label">Image path</label><input className="form-input" value={form.image} onChange={e => set('image', e.target.value)} placeholder="/images/dest_marrakech.jpg" /></div>
              <div className="form-group"><label className="form-label">Coordinates</label><input className="form-input" value={form.coords} onChange={e => set('coords', e.target.value)} placeholder="31.6295° N, 7.9811° W" /></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} style={{ width: 16, height: 16 }} />
                Featured destination
              </label>
              <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                <button onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button onClick={save} disabled={saving} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  {saving ? <><Loader2 size={14} className="spin" /> Saving…</> : <><Globe size={14} /> {editing ? 'Save Changes' : 'Create Destination'}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <div style={{ display: 'flex', gap: 8 }}>
                  <a href={`https://www.besttravelmorocco.com/destinations/${d.id}`} target="_blank" rel="noopener noreferrer" className="btn-icon" title="View on site"><Eye size={14} /></a>
                  <button onClick={() => toggleFeatured(d)} className="btn-icon" title={d.featured ? 'Remove featured' : 'Mark featured'} style={{ color: d.featured ? '#FBBF24' : 'var(--text-3)' }}><Star size={14} fill={d.featured ? '#FBBF24' : 'none'} /></button>
                  <button onClick={() => openEdit(d)} className="btn-icon" title="Edit"><Edit2 size={14} /></button>
                  <button onClick={() => del(d.id, d.name)} disabled={deleting === d.id} className="btn-icon btn-icon-danger" title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
