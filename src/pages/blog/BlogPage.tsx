import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { BlogPost, ContentStatus } from '@/lib/supabase';
import { toast } from 'sonner';
import { Search, Plus, Edit2, Trash2, Eye, Star, RefreshCw, AlertCircle, X, Loader2, Globe, FileText, Upload } from 'lucide-react';

const STORAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1`;
const STORAGE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

async function uploadBlogImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const name = `blog_${Date.now()}.${ext}`;
  const res = await fetch(`${STORAGE_URL}/object/images/${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STORAGE_KEY}`,
      apikey: STORAGE_KEY,
      'Content-Type': file.type,
      'x-upsert': 'true',
    },
    body: file,
  });
  if (!res.ok) throw new Error(await res.text());
  return `${STORAGE_URL}/object/public/images/${encodeURIComponent(name)}`;
}

const CATEGORIES = ['Travel Guide', 'Experiences', 'Culture', 'Food & Drink', 'Tips', 'Destinations', 'News'];

interface FormState {
  id: string; title: string; excerpt: string; content: string; image: string;
  category: string; read_time: string; date: string; status: ContentStatus; featured: boolean;
}
function emptyForm(): FormState {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return { id: '', title: '', excerpt: '', content: '', image: '', category: 'Travel Guide', read_time: '5 min read', date: today, status: 'draft', featured: false };
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10 MB'); return; }
    setImgUploading(true);
    try {
      const url = await uploadBlogImage(file);
      set('image', url);
      toast.success('Image uploaded');
    } catch (err: unknown) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setImgUploading(false);
      if (imgInputRef.current) imgInputRef.current.value = '';
    }
  }

  async function fetch() {
    setLoading(true); setError(null);
    const { data, error: e } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (e) { setError(e.message); setLoading(false); return; }
    setPosts((data ?? []) as BlogPost[]);
    setLoading(false);
  }

  useEffect(() => { fetch(); }, []);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) { setForm(p => ({ ...p, [k]: v })); }

  function openNew() { setForm(emptyForm()); setEditing(null); setShowForm(true); }
  function openEdit(p: BlogPost) {
    setForm({ id: p.id, title: p.title, excerpt: p.excerpt ?? '', content: p.content ?? '', image: p.image ?? '', category: p.category ?? 'Travel Guide', read_time: p.read_time ?? '5 min read', date: p.date ?? '', status: p.status, featured: p.featured ?? false });
    setEditing(p.id); setShowForm(true);
  }

  async function save() {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    const slug = form.id || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const payload = { title: form.title, excerpt: form.excerpt, content: form.content || null, image: form.image, category: form.category, read_time: form.read_time, date: form.date, status: form.status, featured: form.featured, updated_at: new Date().toISOString() };
    const { error: e } = editing
      ? await supabase.from('blog_posts').update(payload).eq('id', editing)
      : await supabase.from('blog_posts').insert({ ...payload, id: slug, created_at: new Date().toISOString() });
    if (e) { toast.error(e.message); setSaving(false); return; }
    toast.success(editing ? 'Post updated' : 'Post created');
    setShowForm(false); fetch(); setSaving(false);
  }

  async function del(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    setDeleting(id);
    const { error: e } = await supabase.from('blog_posts').delete().eq('id', id);
    if (e) toast.error(e.message);
    else { toast.success('Deleted'); setPosts(p => p.filter(x => x.id !== id)); }
    setDeleting(null);
  }

  async function toggleFeatured(p: BlogPost) {
    const { error: e } = await supabase.from('blog_posts').update({ featured: !p.featured, updated_at: new Date().toISOString() }).eq('id', p.id);
    if (e) { toast.error(e.message); return; }
    setPosts(prev => prev.map(x => x.id === p.id ? { ...x, featured: !p.featured } : x));
  }

  async function toggleStatus(p: BlogPost) {
    const next: ContentStatus = p.status === 'published' ? 'draft' : 'published';
    const { error: e } = await supabase.from('blog_posts').update({ status: next, updated_at: new Date().toISOString() }).eq('id', p.id);
    if (e) { toast.error(e.message); return; }
    setPosts(prev => prev.map(x => x.id === p.id ? { ...x, status: next } : x));
    toast.success(`Post ${next}`);
  }

  const filtered = posts.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.title.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q))
      && (statusFilter === 'all' || p.status === statusFilter);
  });

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading posts…</p></div>;
  if (error) return <div className="page-error"><AlertCircle size={24} /><p>{error}</p><button className="btn btn-primary" onClick={fetch}><RefreshCw size={14} /> Retry</button></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Blog</h1><p className="page-subtitle">{posts.length} posts · {posts.filter(p => p.status === 'published').length} published</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetch} className="btn btn-outline"><RefreshCw size={14} /></button>
          <button onClick={openNew} className="btn btn-primary"><Plus size={15} /> New Post</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} />
          <input type="text" placeholder="Search posts…" value={search} onChange={e => setSearch(e.target.value)} className="form-input search-input" />
        </div>
        {(['all', 'published', 'draft'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 12 }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>{editing ? 'Edit Post' : 'New Blog Post'}</h2>
              <button onClick={() => setShowForm(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label className="form-label">Category</label>
                  <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Read Time</label><input className="form-input" value={form.read_time} onChange={e => set('read_time', e.target.value)} placeholder="5 min read" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label className="form-label">Date</label><input className="form-input" value={form.date} onChange={e => set('date', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => set('status', e.target.value as ContentStatus)}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Excerpt</label><textarea className="form-input" rows={2} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} style={{ resize: 'vertical' }} /></div>
              <div className="form-group"><label className="form-label">Content (HTML or plain text)</label><textarea className="form-input" rows={6} value={form.content} onChange={e => set('content', e.target.value)} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} /></div>
              <div className="form-group">
                <label className="form-label">Cover Image</label>
                <input ref={imgInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                {form.image && (
                  <div style={{ marginBottom: 8, borderRadius: 8, overflow: 'hidden', height: 120, background: 'var(--bg-2)', position: 'relative' }}>
                    <img src={form.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => imgInputRef.current?.click()} disabled={imgUploading} className="btn btn-outline" style={{ fontSize: 12, gap: 6 }}>
                    {imgUploading ? <><Loader2 size={13} className="spin" /> Uploading…</> : <><Upload size={13} /> Upload Image</>}
                  </button>
                  <input className="form-input" style={{ flex: 1, fontSize: 12 }} value={form.image} onChange={e => set('image', e.target.value)} placeholder="Or paste URL / path" />
                  {form.image && (
                    <button type="button" onClick={() => set('image', '')} className="btn-icon" title="Clear image"><X size={14} /></button>
                  )}
                </div>
                {!form.image && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Upload a JPG/PNG or paste a Supabase Storage URL</p>}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} style={{ width: 16, height: 16 }} />
                Featured post
              </label>
              <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                <button onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button onClick={save} disabled={saving} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  {saving ? <><Loader2 size={14} className="spin" /> Saving…</> : <><Globe size={14} /> {editing ? 'Save Changes' : 'Create Post'}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <FileText size={32} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
          <p className="text-2" style={{ marginBottom: 16 }}>No blog posts yet</p>
          <button onClick={openNew} className="btn btn-primary"><Plus size={14} /> Write First Post</button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Post</th><th>Category</th><th>Date</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 48, height: 34, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-2)' }}>
                        {p.image && <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{p.title}</div>
                        <div className="text-3" style={{ fontSize: 11 }}>{p.read_time}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-default">{p.category}</span></td>
                  <td className="text-3" style={{ fontSize: 12 }}>{p.date}</td>
                  <td>
                    <button onClick={() => toggleStatus(p)} className={`badge badge-${p.status === 'published' ? 'success' : 'warning'}`} style={{ cursor: 'pointer', border: 'none', background: 'inherit' }}>{p.status}</button>
                  </td>
                  <td>
                    <button onClick={() => toggleFeatured(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.featured ? '#FBBF24' : 'var(--text-3)', padding: 4 }}>
                      <Star size={15} fill={p.featured ? '#FBBF24' : 'none'} />
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={`https://www.besttravelmorocco.com/blog/${p.id}`} target="_blank" rel="noopener noreferrer" className="btn-icon"><Eye size={14} /></a>
                      <button onClick={() => openEdit(p)} className="btn-icon"><Edit2 size={14} /></button>
                      <button onClick={() => del(p.id, p.title)} disabled={deleting === p.id} className="btn-icon btn-icon-danger"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
