import { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, GripVertical, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// FAQs are stored in the frontend codebase (no `faqs` table exists in the DB).
// Edits here are local-session only. To make them permanent, update src/components/FAQSchema.tsx
// in the main website project.

interface FAQ { id: string; question: string; answer: string; category: string; }

const INITIAL: FAQ[] = [
  { id: '1', question: 'Do I need a visa to visit Morocco?', answer: 'Most nationalities (US, UK, EU, Canada, Australia, NZ) do not need a visa for stays under 90 days. Check with your embassy for current requirements.', category: 'Visas & Entry' },
  { id: '2', question: 'What is the best time to visit Morocco?', answer: 'Spring (March–May) and Autumn (September–November) offer the best weather. Summers are very hot inland; winters are mild in cities but cold in the desert at night.', category: 'Planning' },
  { id: '3', question: 'Is Morocco safe for tourists?', answer: 'Morocco is generally very safe. Millions of tourists visit each year without issues. Our licensed guides and vetted accommodations ensure a secure experience.', category: 'Safety' },
  { id: '4', question: 'How do I book a tour?', answer: 'Contact us via WhatsApp (+212 677 365 421), email, or the inquiry form. We will create a personalised proposal within 24 hours.', category: 'Booking' },
  { id: '5', question: 'What payment methods do you accept?', answer: 'We accept Wise (no fees), PayPal, bank transfer, and credit cards. A deposit confirms your booking; the balance is due before departure.', category: 'Booking' },
  { id: '6', question: 'Can you create a custom itinerary?', answer: 'Yes — custom trips are our speciality. Tell us your dates, group size, interests, and budget and we will design a unique Morocco experience for you.', category: 'Planning' },
];

const CATEGORIES = ['All', ...Array.from(new Set(INITIAL.map(f => f.category)))];

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>(INITIAL);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', category: 'Planning' });

  const filtered = faqs.filter(f => {
    const q = search.toLowerCase();
    return (!q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q))
      && (category === 'All' || f.category === category);
  });

  function openNew() { setForm({ question: '', answer: '', category: 'Planning' }); setEditing(null); setShowForm(true); }
  function openEdit(f: FAQ) { setForm({ question: f.question, answer: f.answer, category: f.category }); setEditing(f); setShowForm(true); }

  function save() {
    if (!form.question.trim() || !form.answer.trim()) { toast.error('Question and answer are required'); return; }
    if (editing) {
      setFaqs(p => p.map(f => f.id === editing.id ? { ...f, ...form } : f));
      toast.success('FAQ updated (session only — update FAQSchema.tsx to persist)');
    } else {
      setFaqs(p => [...p, { id: Date.now().toString(), ...form }]);
      toast.success('FAQ added (session only — update FAQSchema.tsx to persist)');
    }
    setShowForm(false);
  }

  function del(id: string) {
    setFaqs(p => p.filter(f => f.id !== id));
    toast.success('Removed (session only)');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">FAQs</h1><p className="page-subtitle">{faqs.length} questions</p></div>
        <button onClick={openNew} className="btn btn-primary"><Plus size={15} /> Add FAQ</button>
      </div>

      {/* Note banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 8, marginBottom: 16, fontSize: 12, color: 'var(--text-2)' }}>
        <AlertCircle size={15} style={{ color: '#FBBF24', flexShrink: 0, marginTop: 1 }} />
        FAQs are stored in the website codebase, not the database. Changes here are session-only previews. To make them permanent, update <code style={{ background: 'var(--bg-2)', padding: '1px 5px', borderRadius: 4 }}>src/components/FAQSchema.tsx</code> in the main website project.
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} />
          <input type="text" placeholder="Search FAQs…" value={search} onChange={e => setSearch(e.target.value)} className="form-input search-input" />
        </div>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`btn ${category === c ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 12 }}>{c}</button>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 520 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', marginBottom: 20 }}>{editing ? 'Edit FAQ' : 'New FAQ'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group"><label className="form-label">Category</label>
                <input className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
              </div>
              <div className="form-group"><label className="form-label">Question *</label>
                <input className="form-input" value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} />
              </div>
              <div className="form-group"><label className="form-label">Answer *</label>
                <textarea className="form-input" rows={4} value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button onClick={save} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>{editing ? 'Save Changes' : 'Add FAQ'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(f => (
          <div key={f.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
              onClick={() => setExpanded(expanded === f.id ? null : f.id)}
            >
              <GripVertical size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span className="badge badge-default" style={{ marginBottom: 4, display: 'inline-block' }}>{f.category}</span>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)', lineHeight: 1.4 }}>{f.question}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button onClick={e => { e.stopPropagation(); openEdit(f); }} className="btn-icon"><Edit2 size={13} /></button>
                <button onClick={e => { e.stopPropagation(); del(f.id); }} className="btn-icon btn-icon-danger"><Trash2 size={13} /></button>
                {expanded === f.id ? <ChevronDown size={16} style={{ color: 'var(--text-3)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-3)' }} />}
              </div>
            </div>
            {expanded === f.id && (
              <div style={{ padding: '0 16px 14px 42px', fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65, borderTop: '1px solid var(--border)' }}>
                <div style={{ paddingTop: 12 }}>{f.answer}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
