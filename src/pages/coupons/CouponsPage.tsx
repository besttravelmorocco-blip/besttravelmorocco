import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Coupon } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Plus, RefreshCw, AlertCircle, X, Save, Edit2, Trash2,
  Tag, Copy, ToggleLeft, ToggleRight, Search, Inbox,
} from 'lucide-react';

interface CouponForm {
  code: string; description: string; type: 'percentage' | 'fixed';
  value: string; min_booking_value: string; max_uses: string;
  valid_from: string; valid_until: string; is_active: boolean;
}
const empty: CouponForm = { code: '', description: '', type: 'percentage', value: '', min_booking_value: '', max_uses: '', valid_from: '', valid_until: '', is_active: true };

function generateCode() {
  return `BTM-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponForm>(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    const { data, error: e } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (e) { setError(e.message); setLoading(false); return; }
    setCoupons((data ?? []) as Coupon[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openAdd() { setEditing(null); setForm({ ...empty, code: generateCode() }); setShowModal(true); }
  function openEdit(c: Coupon) {
    setEditing(c);
    setForm({ code: c.code, description: c.description ?? '', type: c.type as 'percentage' | 'fixed', value: c.value.toString(), min_booking_value: c.min_booking_value?.toString() ?? '', max_uses: c.max_uses?.toString() ?? '', valid_from: c.valid_from ?? '', valid_until: c.valid_until ?? '', is_active: c.is_active });
    setShowModal(true);
  }

  async function save() {
    if (!form.code.trim()) { toast.error('Coupon code is required'); return; }
    if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0) { toast.error('Valid discount value is required'); return; }
    setSaving(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      type: form.type,
      value: Number(form.value),
      min_booking_value: form.min_booking_value ? Number(form.min_booking_value) : 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      is_active: form.is_active,
    };
    if (editing) {
      const { data, error: e } = await supabase.from('coupons').update(payload).eq('id', editing.id).select().single();
      setSaving(false);
      if (e) { toast.error(e.message); return; }
      setCoupons(p => p.map(x => x.id === editing.id ? data as Coupon : x));
      toast.success('Coupon updated');
    } else {
      const { data, error: e } = await supabase.from('coupons').insert(payload).select().single();
      setSaving(false);
      if (e) { toast.error(e.message); return; }
      setCoupons(p => [data as Coupon, ...p]);
      toast.success('Coupon created');
    }
    setShowModal(false);
  }

  async function toggleActive(c: Coupon) {
    const is_active = !c.is_active;
    const { error: e } = await supabase.from('coupons').update({ is_active }).eq('id', c.id);
    if (e) { toast.error(e.message); return; }
    setCoupons(p => p.map(x => x.id === c.id ? { ...x, is_active } : x));
  }

  async function del(c: Coupon) {
    if (!confirm(`Delete coupon "${c.code}"?`)) return;
    const { error: e } = await supabase.from('coupons').delete().eq('id', c.id);
    if (e) { toast.error(e.message); return; }
    setCoupons(p => p.filter(x => x.id !== c.id));
    toast.success('Coupon deleted');
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => toast.success(`"${code}" copied`));
  }

  function couponStatus(c: Coupon): { label: string; color: string } {
    if (!c.is_active) return { label: 'Inactive', color: 'var(--text-3)' };
    const now = new Date().toISOString().slice(0, 10);
    if (c.valid_until && c.valid_until < now) return { label: 'Expired', color: '#F87171' };
    if (c.valid_from && c.valid_from > now) return { label: 'Upcoming', color: '#60A5FA' };
    if (c.max_uses && c.used_count >= c.max_uses) return { label: 'Exhausted', color: '#FBBF24' };
    return { label: 'Active', color: '#34D399' };
  }

  const filtered = coupons.filter(c => {
    const q = search.toLowerCase();
    return !q || c.code.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q);
  });

  const fmtDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading coupons…</p></div>;
  if (error) return <div className="page-error"><AlertCircle size={24} /><p>{error}</p><button className="btn btn-primary" onClick={load}><RefreshCw size={14} /> Retry</button></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Coupons</h1>
          <p className="page-subtitle">{coupons.length} total · {coupons.filter(c => c.is_active).length} active</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} className="btn btn-outline"><RefreshCw size={14} /></button>
          <button onClick={openAdd} className="btn btn-primary"><Plus size={15} /> Create Coupon</button>
        </div>
      </div>

      <div className="search-input-wrap" style={{ marginBottom: 20 }}>
        <Search size={14} />
        <input type="text" placeholder="Search code or description…" value={search} onChange={e => setSearch(e.target.value)} className="form-input search-input" />
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Tag size={32} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
          <p className="text-2" style={{ marginBottom: 4 }}>No coupons yet</p>
          <p className="text-3" style={{ fontSize: 12, marginBottom: 20 }}>Create discount codes for promotions, repeat customers, or agents.</p>
          <button onClick={openAdd} className="btn btn-primary"><Plus size={14} /> Create Coupon</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Code', 'Discount', 'Validity', 'Usage', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const status = couponStatus(c);
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <code style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--sand)', background: 'rgba(201,169,110,.12)', padding: '3px 8px', borderRadius: 5 }}>{c.code}</code>
                        <button onClick={() => copyCode(c.code)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 3 }} title="Copy code">
                          <Copy size={12} />
                        </button>
                      </div>
                      {c.description && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{c.description}</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>
                        {c.type === 'percentage' ? `${c.value}%` : `€${c.value}`} off
                      </div>
                      {c.min_booking_value && c.min_booking_value > 0 && (
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Min booking: €{c.min_booking_value}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-2)' }}>
                      {c.valid_from || c.valid_until ? (
                        <div>
                          {c.valid_from && <div>From: {fmtDate(c.valid_from)}</div>}
                          {c.valid_until && <div>Until: {fmtDate(c.valid_until)}</div>}
                        </div>
                      ) : <span style={{ color: 'var(--text-3)' }}>No limit</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{c.used_count} used</div>
                      {c.max_uses && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>of {c.max_uses} max</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => toggleActive(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: c.is_active ? '#34D399' : 'var(--text-3)' }}>
                          {c.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                        <span style={{ fontSize: 12, fontWeight: 600, color: status.color }}>{status.label}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => openEdit(c)} className="btn btn-ghost btn-icon"><Edit2 size={13} /></button>
                        <button onClick={() => del(c)} className="btn btn-ghost btn-icon" style={{ color: '#F87171' }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 10, width: '100%', maxWidth: 480, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 48px rgba(0,0,0,.5)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{editing ? 'Edit Coupon' : 'Create Coupon'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={16} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Coupon Code *</label>
                  <input className="form-input" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="BTM-SUMMER-20" style={{ fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '.05em' }} autoFocus />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <button onClick={() => setForm(p => ({ ...p, code: generateCode() }))} className="btn btn-outline" style={{ height: 38, whiteSpace: 'nowrap', fontSize: 11 }}>Generate</button>
                </div>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Description (internal)</label>
                <input className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Summer 2026 promotion" />
              </div>
              <div>
                <label className="form-label">Discount Type *</label>
                <select className="form-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as 'percentage' | 'fixed' }))}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed amount (€)</option>
                </select>
              </div>
              <div>
                <label className="form-label">Value * {form.type === 'percentage' ? '(%)' : '(€)'}</label>
                <input className="form-input" type="number" min="0" max={form.type === 'percentage' ? 100 : undefined} value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder={form.type === 'percentage' ? '20' : '50'} />
              </div>
              <div>
                <label className="form-label">Min Booking Value (€)</label>
                <input className="form-input" type="number" min="0" value={form.min_booking_value} onChange={e => setForm(p => ({ ...p, min_booking_value: e.target.value }))} placeholder="0" />
              </div>
              <div>
                <label className="form-label">Max Uses</label>
                <input className="form-input" type="number" min="1" value={form.max_uses} onChange={e => setForm(p => ({ ...p, max_uses: e.target.value }))} placeholder="Unlimited" />
              </div>
              <div>
                <label className="form-label">Valid From</label>
                <input className="form-input" type="date" value={form.valid_from} onChange={e => setForm(p => ({ ...p, valid_from: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Valid Until</label>
                <input className="form-input" type="date" value={form.valid_until} onChange={e => setForm(p => ({ ...p, valid_until: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: form.is_active ? '#34D399' : 'var(--text-3)' }}>
                  {form.is_active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{form.is_active ? 'Active — usable now' : 'Inactive'}</span>
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
              <button onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
              <button onClick={save} disabled={saving} className="btn btn-primary">
                <Save size={13} /> {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
