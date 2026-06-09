import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Accommodation } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Plus, RefreshCw, AlertCircle, X, Save, Edit2, Trash2,
  Building2, Phone, Mail, Star, Inbox, Search,
} from 'lucide-react';

const TYPES = ['hotel', 'riad', 'camp'] as const;
const TIERS = ['standard', 'superior', 'luxury'] as const;
const TYPE_LABELS = { hotel: 'Hotel', riad: 'Riad', camp: 'Desert Camp' };
const TIER_LABELS = { standard: 'Standard', superior: 'Superior', luxury: 'Luxury' };
const TYPE_COLORS = { hotel: '#60A5FA', riad: '#FBBF24', camp: '#F59E0B' };

interface AccomForm {
  type: string; name: string; city: string; address: string;
  stars: string; tier: string; contact_name: string;
  contact_phone: string; contact_email: string;
  contracted_single_rate: string; contracted_double_rate: string; contracted_triple_rate: string;
  capacity: string; amenities: string; notes: string; is_active: boolean;
}
const empty: AccomForm = {
  type: 'hotel', name: '', city: '', address: '', stars: '', tier: 'standard',
  contact_name: '', contact_phone: '', contact_email: '',
  contracted_single_rate: '', contracted_double_rate: '', contracted_triple_rate: '',
  capacity: '', amenities: '', notes: '', is_active: true,
};

export default function AccommodationsPage() {
  const [items, setItems] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Accommodation | null>(null);
  const [form, setForm] = useState<AccomForm>(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    const { data, error: e } = await supabase.from('accommodations').select('*').order('type').order('name');
    if (e) { setError(e.message); setLoading(false); return; }
    setItems((data ?? []) as Accommodation[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openAdd(defaultType?: string) {
    setEditing(null);
    setForm({ ...empty, type: defaultType ?? 'hotel' });
    setShowModal(true);
  }
  function openEdit(a: Accommodation) {
    setEditing(a);
    setForm({
      type: a.type, name: a.name, city: a.city ?? '', address: a.address ?? '',
      stars: a.stars?.toString() ?? '', tier: a.tier,
      contact_name: a.contact_name ?? '', contact_phone: a.contact_phone ?? '', contact_email: a.contact_email ?? '',
      contracted_single_rate: a.contracted_single_rate?.toString() ?? '',
      contracted_double_rate: a.contracted_double_rate?.toString() ?? '',
      contracted_triple_rate: a.contracted_triple_rate?.toString() ?? '',
      capacity: a.capacity?.toString() ?? '', amenities: (a.amenities ?? []).join(', '),
      notes: a.notes ?? '', is_active: a.is_active,
    });
    setShowModal(true);
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    const payload = {
      type: form.type, name: form.name.trim(), city: form.city.trim() || null, address: form.address.trim() || null,
      stars: form.stars ? Number(form.stars) : null, tier: form.tier,
      contact_name: form.contact_name.trim() || null, contact_phone: form.contact_phone.trim() || null, contact_email: form.contact_email.trim() || null,
      contracted_single_rate: form.contracted_single_rate ? Number(form.contracted_single_rate) : null,
      contracted_double_rate: form.contracted_double_rate ? Number(form.contracted_double_rate) : null,
      contracted_triple_rate: form.contracted_triple_rate ? Number(form.contracted_triple_rate) : null,
      capacity: form.capacity ? Number(form.capacity) : null,
      amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
      notes: form.notes.trim() || null, is_active: form.is_active, updated_at: new Date().toISOString(),
    };
    if (editing) {
      const { data, error: e } = await supabase.from('accommodations').update(payload).eq('id', editing.id).select().single();
      setSaving(false);
      if (e) { toast.error(e.message); return; }
      setItems(p => p.map(x => x.id === editing.id ? data as Accommodation : x));
      toast.success('Accommodation updated');
    } else {
      const { data, error: e } = await supabase.from('accommodations').insert(payload).select().single();
      setSaving(false);
      if (e) { toast.error(e.message); return; }
      setItems(p => [...p, data as Accommodation]);
      toast.success('Accommodation added');
    }
    setShowModal(false);
  }

  async function del(a: Accommodation) {
    if (!confirm(`Delete "${a.name}"?`)) return;
    const { error: e } = await supabase.from('accommodations').delete().eq('id', a.id);
    if (e) { toast.error(e.message); return; }
    setItems(p => p.filter(x => x.id !== a.id));
    toast.success('Removed');
  }

  const filtered = items.filter(a => {
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || (a.city ?? '').toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading accommodations…</p></div>;
  if (error) return <div className="page-error"><AlertCircle size={24} /><p>{error}</p><button className="btn btn-primary" onClick={load}><RefreshCw size={14} /> Retry</button></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Accommodations</h1>
          <p className="page-subtitle">{items.length} properties — hotels, riads & desert camps</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} className="btn btn-outline"><RefreshCw size={14} /></button>
          <button onClick={() => openAdd(typeFilter !== 'all' ? typeFilter : 'hotel')} className="btn btn-primary"><Plus size={15} /> Add Property</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setTypeFilter('all')} className={`btn ${typeFilter === 'all' ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 12 }}>
          All <span style={{ background: typeFilter === 'all' ? 'rgba(255,255,255,.2)' : 'var(--bg-2)', padding: '1px 6px', borderRadius: 10, fontSize: 11, marginLeft: 4 }}>{items.length}</span>
        </button>
        {TYPES.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`btn ${typeFilter === t ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 12 }}>
            {TYPE_LABELS[t]}
            <span style={{ background: typeFilter === t ? 'rgba(255,255,255,.2)' : 'var(--bg-2)', padding: '1px 6px', borderRadius: 10, fontSize: 11, marginLeft: 4 }}>{items.filter(a => a.type === t).length}</span>
          </button>
        ))}
      </div>

      <div className="search-input-wrap" style={{ marginBottom: 20 }}>
        <Search size={14} />
        <input type="text" placeholder="Search name or city…" value={search} onChange={e => setSearch(e.target.value)} className="form-input search-input" />
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Building2 size={32} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
          <p className="text-2" style={{ marginBottom: 4 }}>No accommodations yet</p>
          <p className="text-3" style={{ fontSize: 12, marginBottom: 20 }}>Add hotels, riads, and desert camps with contracted rates.</p>
          <button onClick={() => openAdd()} className="btn btn-primary"><Plus size={14} /> Add Property</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Property', 'Location', 'Tier', 'Contracted Rates (€/night)', 'Contact', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const color = TYPE_COLORS[a.type as keyof typeof TYPE_COLORS] ?? 'var(--sand)';
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border)', opacity: a.is_active ? 1 : 0.5 }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color, background: `${color}22`, padding: '3px 7px', borderRadius: 4 }}>
                          {TYPE_LABELS[a.type as keyof typeof TYPE_LABELS] ?? a.type}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</div>
                          {a.stars && (
                            <div style={{ display: 'flex', gap: 1, marginTop: 2 }}>
                              {Array.from({ length: a.stars }, (_, i) => <Star key={i} size={9} style={{ color: '#F59E0B', fill: '#F59E0B' }} />)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-2)' }}>{a.city ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-gray" style={{ fontSize: 11, textTransform: 'capitalize' }}>{TIER_LABELS[a.tier as keyof typeof TIER_LABELS] ?? a.tier}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                        {[
                          a.contracted_single_rate ? `1: €${a.contracted_single_rate}` : null,
                          a.contracted_double_rate ? `2: €${a.contracted_double_rate}` : null,
                          a.contracted_triple_rate ? `3: €${a.contracted_triple_rate}` : null,
                        ].filter(Boolean).join(' · ') || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {a.contact_name && <div style={{ fontSize: 12, fontWeight: 600 }}>{a.contact_name}</div>}
                        {a.contact_phone && <a href={`tel:${a.contact_phone}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-3)', textDecoration: 'none' }}><Phone size={10} />{a.contact_phone}</a>}
                        {a.contact_email && <a href={`mailto:${a.contact_email}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-3)', textDecoration: 'none' }}><Mail size={10} />{a.contact_email}</a>}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => openEdit(a)} className="btn btn-ghost btn-icon"><Edit2 size={13} /></button>
                        <button onClick={() => del(a)} className="btn btn-ghost btn-icon" style={{ color: '#F87171' }}><Trash2 size={13} /></button>
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
          <div style={{ background: 'var(--bg-card)', borderRadius: 10, width: '100%', maxWidth: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 48px rgba(0,0,0,.5)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{editing ? 'Edit Property' : 'Add Property'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={16} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Type *</label>
                <select className="form-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Tier *</label>
                <select className="form-input" value={form.tier} onChange={e => setForm(p => ({ ...p, tier: e.target.value }))}>
                  {TIERS.map(t => <option key={t} value={t}>{TIER_LABELS[t]}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Riad Maison Bleue" autoFocus />
              </div>
              <div>
                <label className="form-label">City</label>
                <input className="form-input" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Marrakech" />
              </div>
              <div>
                <label className="form-label">Stars</label>
                <input className="form-input" type="number" min="1" max="5" value={form.stars} onChange={e => setForm(p => ({ ...p, stars: e.target.value }))} placeholder="4" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Address</label>
                <input className="form-input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="12 Derb Zitoun, Medina" />
              </div>
              <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-3)', marginBottom: 10 }}>Contracted Rates (€ per room per night)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="form-label">Single</label>
                    <input className="form-input" type="number" min="0" value={form.contracted_single_rate} onChange={e => setForm(p => ({ ...p, contracted_single_rate: e.target.value }))} placeholder="80" />
                  </div>
                  <div>
                    <label className="form-label">Double</label>
                    <input className="form-input" type="number" min="0" value={form.contracted_double_rate} onChange={e => setForm(p => ({ ...p, contracted_double_rate: e.target.value }))} placeholder="100" />
                  </div>
                  <div>
                    <label className="form-label">Triple</label>
                    <input className="form-input" type="number" min="0" value={form.contracted_triple_rate} onChange={e => setForm(p => ({ ...p, contracted_triple_rate: e.target.value }))} placeholder="130" />
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <label className="form-label">Contact Name</label>
                <input className="form-input" value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} placeholder="Karim" />
              </div>
              <div>
                <label className="form-label">Contact Phone</label>
                <input className="form-input" value={form.contact_phone} onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))} placeholder="+212 600 000 000" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Contact Email</label>
                <input className="form-input" type="email" value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} placeholder="reservations@riad.ma" />
              </div>
              <div>
                <label className="form-label">Capacity (rooms)</label>
                <input className="form-input" type="number" min="1" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} placeholder="12" />
              </div>
              <div>
                <label className="form-label">Amenities (comma list)</label>
                <input className="form-input" value={form.amenities} onChange={e => setForm(p => ({ ...p, amenities: e.target.value }))} placeholder="Pool, AC, WiFi" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Booking lead time, cancellation policy…" style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
              <button onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
              <button onClick={save} disabled={saving} className="btn btn-primary">
                <Save size={13} /> {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Property'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
