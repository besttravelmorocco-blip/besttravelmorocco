import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { TourFaq } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight, RefreshCw, Sparkles,
} from 'lucide-react';

// ─── Default FAQ templates ────────────────────────────────────────────────────

const DEFAULT_FAQS: Omit<TourFaq, 'id' | 'tour_id' | 'created_at'>[] = [
  {
    question: 'Is this tour private or shared?',
    answer: 'This is a private guided tour, dedicated exclusively to your group. You will have a personal English-speaking guide and private transport throughout the entire journey.',
    sort_order: 0, enabled: true,
  },
  {
    question: 'What is included in the price?',
    answer: 'The price includes private transport in a comfortable air-conditioned vehicle, accommodation as specified in the itinerary, daily breakfast, an English-speaking local guide, and all entrance fees mentioned.',
    sort_order: 1, enabled: true,
  },
  {
    question: 'What should I pack?',
    answer: 'We recommend comfortable walking shoes, lightweight and breathable clothing, a warm layer for desert evenings, sunscreen, sunglasses, a hat, and a refillable water bottle. A scarf is useful for desert wind and sun.',
    sort_order: 2, enabled: true,
  },
  {
    question: 'Is the camel trek included?',
    answer: 'Yes — a camel trek at sunset into the Sahara dunes is included in tours that visit Merzouga or Zagora. The duration varies by itinerary. Please check your specific tour details for exact timing.',
    sort_order: 3, enabled: true,
  },
  {
    question: 'Can dietary requirements be accommodated?',
    answer: 'Absolutely. We cater for vegetarian, vegan, gluten-free, halal, and all other dietary needs. Please inform us at booking and all meals will be arranged accordingly at no extra charge.',
    sort_order: 4, enabled: true,
  },
  {
    question: 'What type of accommodation is provided?',
    answer: 'We use carefully selected riads, boutique hotels, and luxury desert camps depending on the itinerary. All properties are comfortable, clean, and locally authentic. Upgrades to premium options are available on request.',
    sort_order: 5, enabled: true,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  tourId: string | undefined;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TourFaqsTab({ tourId }: Props) {
  const [faqs,    setFaqs]    = useState<TourFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Drag state
  const dragId  = useRef<string | null>(null);
  const dragOver = useRef<string | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  async function load() {
    if (!tourId) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('tour_faqs')
      .select('*')
      .eq('tour_id', tourId)
      .order('sort_order');
    if (error) toast.error(error.message);
    setFaqs((data ?? []) as TourFaq[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [tourId]);

  // ── Add ───────────────────────────────────────────────────────────────────
  async function addFaq() {
    if (!tourId) return;
    const maxOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.sort_order)) : -1;
    const { data, error } = await supabase
      .from('tour_faqs')
      .insert({ tour_id: tourId, question: 'New question', answer: '', sort_order: maxOrder + 1, enabled: true })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    const newFaq = data as TourFaq;
    setFaqs(prev => [...prev, newFaq]);
    setExpanded(newFaq.id);
  }

  // ── Update field (auto-save on blur) ──────────────────────────────────────
  async function saveField(faq: TourFaq, field: 'question' | 'answer', val: string) {
    setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, [field]: val } : f));
    setSaving(faq.id);
    const { error } = await supabase.from('tour_faqs').update({ [field]: val }).eq('id', faq.id);
    if (error) toast.error(error.message);
    setSaving(null);
  }

  // ── Toggle enabled ────────────────────────────────────────────────────────
  async function toggleEnabled(faq: TourFaq) {
    const next = !faq.enabled;
    setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, enabled: next } : f));
    const { error } = await supabase.from('tour_faqs').update({ enabled: next }).eq('id', faq.id);
    if (error) { toast.error(error.message); setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, enabled: faq.enabled } : f)); }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function deleteFaq(faq: TourFaq) {
    if (!confirm(`Delete "${faq.question}"?`)) return;
    setFaqs(prev => prev.filter(f => f.id !== faq.id));
    const { error } = await supabase.from('tour_faqs').delete().eq('id', faq.id);
    if (error) { toast.error(error.message); load(); }
  }

  // ── Drag-and-drop reorder ─────────────────────────────────────────────────
  async function onDrop(dropFaqId: string) {
    if (dragId.current === null || dragId.current === dropFaqId) return;
    const sorted = [...faqs].sort((a, b) => a.sort_order - b.sort_order);
    const from = sorted.findIndex(f => f.id === dragId.current);
    const to   = sorted.findIndex(f => f.id === dropFaqId);
    if (from === -1 || to === -1) return;
    const reordered = [...sorted];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const updated = reordered.map((f, i) => ({ ...f, sort_order: i }));
    setFaqs(updated);
    // Persist new sort_orders
    await Promise.all(updated.map(f => supabase.from('tour_faqs').update({ sort_order: f.sort_order }).eq('id', f.id)));
    dragId.current  = null;
    dragOver.current = null;
  }

  // ── Load defaults ─────────────────────────────────────────────────────────
  async function loadDefaults() {
    if (!tourId) return;
    if (!confirm('This will add 6 default FAQ items. Continue?')) return;
    const maxOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.sort_order)) : -1;
    const rows = DEFAULT_FAQS.map((d, i) => ({ ...d, tour_id: tourId, sort_order: maxOrder + 1 + i }));
    const { data, error } = await supabase.from('tour_faqs').insert(rows).select();
    if (error) { toast.error(error.message); return; }
    setFaqs(prev => [...prev, ...(data as TourFaq[])]);
    toast.success('6 default FAQs added');
  }

  // ── No tour yet ───────────────────────────────────────────────────────────
  if (!tourId) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-3)' }}>
        <Sparkles size={28} style={{ margin: '0 auto 12px', color: 'var(--sand)' }} />
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Save the tour first</p>
        <p style={{ fontSize: 13 }}>FAQs can be managed once the tour has been created and saved.</p>
      </div>
    );
  }

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading FAQs…</p></div>;

  const sorted = [...faqs].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 className="card-title">Tour FAQs</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
            {sorted.filter(f => f.enabled).length} active · shown on tour page with FAQ schema markup
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} className="btn btn-outline" style={{ padding: '6px 10px' }}><RefreshCw size={13} /></button>
          {faqs.length === 0 && (
            <button onClick={loadDefaults} className="btn btn-outline" style={{ fontSize: 12 }}>
              <Sparkles size={13} /> Load defaults
            </button>
          )}
          <button onClick={addFaq} className="btn btn-primary" style={{ fontSize: 12 }}>
            <Plus size={13} /> Add FAQ
          </button>
        </div>
      </div>

      {/* Empty state */}
      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-3)' }}>
          <p style={{ fontSize: 13, marginBottom: 12 }}>No FAQs yet.</p>
          <button onClick={loadDefaults} className="btn btn-outline">
            <Sparkles size={13} /> Load 6 default FAQs
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sorted.map((faq) => (
            <FaqCard
              key={faq.id}
              faq={faq}
              expanded={expanded === faq.id}
              saving={saving === faq.id}
              onToggleExpand={() => setExpanded(expanded === faq.id ? null : faq.id)}
              onSaveField={saveField}
              onToggleEnabled={toggleEnabled}
              onDelete={deleteFaq}
              onDragStart={() => { dragId.current = faq.id; }}
              onDragOver={(e) => { e.preventDefault(); dragOver.current = faq.id; }}
              onDrop={() => onDrop(faq.id)}
            />
          ))}
        </div>
      )}

      {faqs.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={loadDefaults} className="btn btn-outline" style={{ fontSize: 11 }}>
            <Sparkles size={11} /> Add defaults
          </button>
          <button onClick={addFaq} className="btn btn-primary" style={{ fontSize: 12 }}>
            <Plus size={13} /> Add FAQ
          </button>
        </div>
      )}
    </div>
  );
}

// ─── FAQ Card ─────────────────────────────────────────────────────────────────

interface CardProps {
  faq: TourFaq;
  expanded: boolean;
  saving: boolean;
  onToggleExpand: () => void;
  onSaveField: (faq: TourFaq, field: 'question' | 'answer', val: string) => void;
  onToggleEnabled: (faq: TourFaq) => void;
  onDelete: (faq: TourFaq) => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}

function FaqCard({ faq, expanded, saving, onToggleExpand, onSaveField, onToggleEnabled, onDelete, onDragStart, onDragOver, onDrop }: CardProps) {
  const [q, setQ] = useState(faq.question);
  const [a, setA] = useState(faq.answer);

  // Sync local state if parent updates (e.g. after load defaults)
  useEffect(() => { setQ(faq.question); setA(faq.answer); }, [faq.question, faq.answer]);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden',
        opacity: faq.enabled ? 1 : 0.5, transition: 'opacity 0.2s',
      }}
    >
      {/* Row header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--bg-2)' }}>
        {/* Drag handle */}
        <span style={{ cursor: 'grab', color: 'var(--text-3)', flexShrink: 0 }}><GripVertical size={14} /></span>

        {/* Toggle enabled */}
        <button
          type="button"
          onClick={() => onToggleEnabled(faq)}
          title={faq.enabled ? 'Disable FAQ' : 'Enable FAQ'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, color: faq.enabled ? 'var(--sand)' : 'var(--text-3)', padding: 0 }}
        >
          {faq.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
        </button>

        {/* Question preview / click to expand */}
        <button
          type="button"
          onClick={onToggleExpand}
          style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text)', padding: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {faq.question || <span style={{ fontStyle: 'italic', color: 'var(--text-3)' }}>Untitled question</span>}
        </button>

        {saving && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>saving…</span>}

        {/* Expand / delete */}
        <button type="button" onClick={onToggleExpand} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2 }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <button type="button" onClick={() => onDelete(faq)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 2 }}>
          <Trash2 size={13} />
        </button>
      </div>

      {/* Expanded edit form */}
      {expanded && (
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: 11 }}>Question</label>
            <input
              className="form-input"
              value={q}
              onChange={e => setQ(e.target.value)}
              onBlur={() => { if (q !== faq.question) onSaveField(faq, 'question', q); }}
              placeholder="Enter question…"
              style={{ fontSize: 13 }}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: 11 }}>Answer</label>
            <textarea
              className="form-input"
              rows={4}
              value={a}
              onChange={e => setA(e.target.value)}
              onBlur={() => { if (a !== faq.answer) onSaveField(faq, 'answer', a); }}
              placeholder="Enter answer…"
              style={{ fontSize: 13, resize: 'vertical' }}
            />
          </div>
          <p style={{ fontSize: 10.5, color: 'var(--text-3)', margin: 0 }}>Changes are saved automatically on field blur.</p>
        </div>
      )}
    </div>
  );
}
