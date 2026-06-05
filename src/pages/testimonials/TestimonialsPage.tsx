import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Testimonial } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Star, Search, RefreshCw, AlertCircle, X, Loader2 } from 'lucide-react';

interface FormState {
  name: string; location: string; text: string; rating: number;
  image: string; tour_id: string; featured: boolean;
}
function emptyForm(): FormState {
  return { name: '', location: '', text: '', rating: 5, image: '', tour_id: '', featured: false };
}

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function fetch() {
    setLoading(true); setError(null);
    const { data, error: e } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    if (e) { setError(e.message); setLoading(false); return; }
    setItems((data ?? []) as Testimonial[]);
    setLoading(false);
  }

  useEffect(() => { fetch(); }, []);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) { setForm(p => ({ ...p, [k]: v })); }

  function openNew() { setForm(emptyForm()); setEditing(null); setShowForm(true); }
  function openEdit(t: Testimonial) {
    setForm({ name: t.name, location: t.location ?? '', text: t.text, rating: t.rating, image: t.image ?? '', tour_id: t.tour_id ?? '', featured: t.featured ?? false });
    setEditing(t.id); setShowForm(true);
  }

  async function save() {
    if (!form.name.trim() || !form.text.trim()) { toast.error('Name and review text are required'); return; }
    setSaving(true);
    const payload = { name: form.name, location: form.location, text: form.text, rating: form.rating, image: form.image || null, tour_id: form.tour_id || null, featured: form.featured };
    const { error: e } = editing
      ? await supabase.from('testimonials').update(payload).eq('id', editing)
      : await supabase.from('testimonials').insert({ ...payload, created_at: new Date().toISOString() });
    if (e) { toast.error(e.message); setSaving(false); return; }
    toast.success(editing ? 'Testimonial updated' : 'Testimonial created');
    setShowForm(false); fetch(); setSaving(false);
  }

  async function del(id: string, name: string) {
    if (!confirm(`Delete testimonial from "${name}"?`)) return;
    setDeleting(id);
    const { error: e } = await supabase.from('testimonials').delete().eq('id', id);
    if (e) toast.error(e.message);
    else { toast.success('Deleted'); setItems(p => p.filter(x => x.id !== id)); }
    setDeleting(null);
  }

  async function toggleFeatured(t: Testimonial) {
    const { error: e } = await supabase.from('testimonials').update({ featured: !t.featured }).eq('id', t.id);
    if (e) { toast.error(e.message); return; }
    setItems(p => p.map(x => x.id === t.id ? { ...x, featured: !t.featured } : x));
  }

  const filtered = items.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.text.toLowerCase().includes(search.toLowerCase()) || (t.location ?? '').toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading…</p></div>;
  if (error) return <div className="page-error"><AlertCircle size={24} /><p>{error}</p><button className="btn btn-primary" onClick={fetch}><RefreshCw size={14} /> Retry</button></div>;

  const Stars = ({ n }: { n: number }) => (
    <span style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => <Star key={i} size={12} fill={i <= n ? '#FBBF24' : 'none'} style={{ color: i <= n ? '#FBBF24' : 'var(--text-3)' }} />)}
    </span>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Testimonials</h1><p className="page-subtitle">{items.length} reviews · {items.filter(t => t.featured).length} featured</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetch} className="btn btn-outline"><RefreshCw size={14} /></button>
          <button onClick={openNew} className="btn btn-primary"><Plus size={15} /> Add Testimonial</button>
        </div>
      </div>

      <div className="search-input-wrap" style={{ marginBottom: 16 }}>
        <Search size={14} />
        <input type="text" placeholder="Search testimonials…" value={search} onChange={e => setSearch(e.target.value)} className="form-input search-input" />
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>{editing ? 'Edit Testimonial' : 'New Testimonial'}</h2>
              <button onClick={() => setShowForm(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label className="form-label">Guest Name *</label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Location / Country</label><input className="form-input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="USA" /></div>
              </div>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div style={{ display: 'flex', gap: 6, paddingTop: 4 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => set('rating', n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                      <Star size={22} fill={n <= form.rating ? '#FBBF24' : 'none'} style={{ color: n <= form.rating ? '#FBBF24' : 'var(--text-3)' }} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group"><label className="form-label">Review Text *</label><textarea className="form-input" rows={4} value={form.text} onChange={e => set('text', e.target.value)} style={{ resize: 'vertical' }} /></div>
              <div className="form-group"><label className="form-label">Tour ID (optional)</label><input className="form-input" value={form.tour_id} onChange={e => set('tour_id', e.target.value)} placeholder="sahara-3-days" /></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} style={{ width: 16, height: 16 }} />
                Featured on homepage
              </label>
              <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                <button onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button onClick={save} disabled={saving} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  {saving ? <><Loader2 size={14} className="spin" /> Saving…</> : editing ? 'Save Changes' : 'Add Testimonial'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p className="text-2" style={{ marginBottom: 16 }}>No testimonials yet</p>
          <button onClick={openNew} className="btn btn-primary"><Plus size={14} /> Add First Review</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(t => (
            <div key={t.id} className="card" style={{ position: 'relative' }}>
              {t.featured && <span className="badge badge-success" style={{ position: 'absolute', top: 12, right: 12 }}>Featured</span>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--sand)', fontSize: 16, flexShrink: 0 }}>
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>{t.name}</div>
                  {t.location && <div className="text-3" style={{ fontSize: 12 }}>{t.location}</div>}
                </div>
              </div>
              <Stars n={t.rating} />
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: '10px 0 14px', fontStyle: 'italic' }}>"{t.text}"</p>
              {t.tour_id && <div className="text-3" style={{ fontSize: 11, marginBottom: 12 }}>Tour: {t.tour_id}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleFeatured(t)} className={`btn btn-outline`} style={{ fontSize: 11, flex: 1, justifyContent: 'center', color: t.featured ? '#FBBF24' : undefined }}>
                  <Star size={12} fill={t.featured ? '#FBBF24' : 'none'} />{t.featured ? 'Unfeature' : 'Feature'}
                </button>
                <button onClick={() => openEdit(t)} className="btn-icon"><Edit2 size={14} /></button>
                <button onClick={() => del(t.id, t.name)} disabled={deleting === t.id} className="btn-icon btn-icon-danger"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
