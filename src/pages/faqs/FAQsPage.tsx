import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { FAQ } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Plus, Edit2, Trash2, ChevronDown, ChevronRight, Search,
  Loader2, Save, X, GripVertical, Eye, EyeOff,
} from 'lucide-react';

const CATEGORIES = ['All', 'Visas & Entry', 'Planning', 'Safety', 'Booking', 'General'];

export default function FAQsPage() {
  const [faqs, setFaqs]         = useState<FAQ[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<FAQ | null>(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'Planning', page: 'all' });

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('sort_order')
      .order('created_at');
    if (error) { toast.error(error.message); setLoading(false); return; }
    setFaqs((data ?? []) as FAQ[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm(p => ({ ...p, [k]: v }));
  }

  function openNew() {
    setForm({ question: '', answer: '', category: 'Planning', page: 'all' });
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(f: FAQ) {
    setForm({ question: f.question, answer: f.answer, category: f.category, page: f.page });
    setEditing(f);
    setShowForm(true);
  }

  async function save() {
    if (!form.question.trim()) { toast.error('Question is required'); return; }
    if (!form.answer.trim())   { toast.error('Answer is required'); return; }
    setSaving(true);
    const payload = {
      question:   form.question.trim(),
      answer:     form.answer.trim(),
      category:   form.category,
      page:       form.page,
      updated_at: new Date().toISOString(),
    };
    const { error } = editing
      ? await supabase.from('faqs').update(payload).eq('id', editing.id)
      : await supabase.from('faqs').insert({
          ...payload,
          sort_order: faqs.length + 1,
          is_visible: true,
          created_at: new Date().toISOString(),
        });
    if (error) { toast.error(error.message); setSaving(false); return; }
    toast.success(editing ? 'FAQ updated' : 'FAQ added');
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function del(id: string) {
    if (!confirm('Delete this FAQ?')) return;
    setDeleting(id);
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) { toast.error(error.message); setDeleting(null); return; }
    toast.success('Deleted');
    setDeleting(null);
    setFaqs(p => p.filter(f => f.id !== id));
  }

  async function toggleVisible(f: FAQ) {
    const { error } = await supabase.from('faqs').update({ is_visible: !f.is_visible }).eq('id', f.id);
    if (error) { toast.error(error.message); return; }
    setFaqs(p => p.map(x => x.id === f.id ? { ...x, is_visible: !f.is_visible } : x));
  }

  async function move(f: FAQ, dir: 'up' | 'down') {
    const sorted = [...faqs].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex(x => x.id === f.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await Promise.all([
      supabase.from('faqs').update({ sort_order: other.sort_order }).eq('id', f.id),
      supabase.from('faqs').update({ sort_order: f.sort_order }).eq('id', other.id),
    ]);
    load();
  }

  const filtered = faqs.filter(f => {
    const q = search.toLowerCase();
    return (!q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q))
      && (category === 'All' || f.category === category);
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">FAQs</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${faqs.length} question${faqs.length !== 1 ? 's' : ''} — changes save to the live site`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={14} /> Add FAQ
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            placeholder="Search FAQs…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 30, paddingRight: 10, paddingTop: 8, paddingBottom: 8, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`btn ${category === c ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: 12, padding: '6px 12px' }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ list */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: 10, color: 'var(--text-3)' }}>
          <Loader2 size={18} className="animate-spin" />
          <span style={{ fontSize: 13 }}>Loading FAQs…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 12 }}>
            {search || category !== 'All' ? 'No FAQs match your filter' : 'No FAQs yet'}
          </p>
          {!search && category === 'All' && (
            <button className="btn btn-primary" onClick={openNew}><Plus size={14} /> Add First FAQ</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((f, idx) => (
            <div
              key={f.id}
              className="card"
              style={{ opacity: f.is_visible ? 1 : 0.5 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                {/* Reorder grip */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 14, flexShrink: 0 }}>
                  <button
                    onClick={() => move(f, 'up')} disabled={idx === 0}
                    style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: 'var(--text-3)', padding: 2, opacity: idx === 0 ? 0.3 : 1 }}
                    title="Move up"
                  >▲</button>
                  <button
                    onClick={() => move(f, 'down')} disabled={idx === filtered.length - 1}
                    style={{ background: 'none', border: 'none', cursor: idx === filtered.length - 1 ? 'not-allowed' : 'pointer', color: 'var(--text-3)', padding: 2, opacity: idx === filtered.length - 1 ? 0.3 : 1 }}
                    title="Move down"
                  >▼</button>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 0' }}
                    onClick={() => setExpanded(expanded === f.id ? null : f.id)}
                  >
                    {expanded === f.id ? <ChevronDown size={15} style={{ color: 'var(--sand)', flexShrink: 0 }} /> : <ChevronRight size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{f.question}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', flexShrink: 0 }}>
                      {f.category}
                    </span>
                  </div>
                  {expanded === f.id && (
                    <div style={{ paddingLeft: 25, paddingBottom: 12, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                      {f.answer}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 4, flexShrink: 0, paddingTop: 8 }}>
                  <button onClick={() => toggleVisible(f)} className="btn btn-ghost btn-icon" title={f.is_visible ? 'Hide' : 'Show'}>
                    {f.is_visible ? <Eye size={14} /> : <EyeOff size={14} style={{ color: 'var(--text-3)' }} />}
                  </button>
                  <button onClick={() => openEdit(f)} className="btn btn-ghost btn-icon" title="Edit">
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => del(f.id)}
                    disabled={deleting === f.id}
                    className="btn btn-ghost btn-icon"
                    style={{ color: '#EF4444' }}
                    title="Delete"
                  >
                    {deleting === f.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{editing ? 'Edit FAQ' : 'Add FAQ'}</h3>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost btn-icon"><X size={16} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Question *</label>
              <input className="form-input" value={form.question} onChange={e => set('question', e.target.value)} placeholder="e.g. Do I need a visa to visit Morocco?" />
            </div>
            <div className="form-group">
              <label className="form-label">Answer *</label>
              <textarea className="form-input" rows={5} value={form.answer} onChange={e => set('answer', e.target.value)} placeholder="Clear, helpful answer…" style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Show On Page</label>
                <select className="form-input" value={form.page} onChange={e => set('page', e.target.value)}>
                  <option value="all">All pages</option>
                  <option value="homepage">Homepage only</option>
                  <option value="tours">Tours page</option>
                  <option value="contact">Contact page</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} className="btn btn-outline">Cancel</button>
              <button onClick={save} disabled={saving} className="btn btn-primary">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> {editing ? 'Update FAQ' : 'Add FAQ'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
