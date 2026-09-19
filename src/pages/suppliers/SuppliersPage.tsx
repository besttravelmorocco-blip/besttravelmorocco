import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Supplier } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Plus, RefreshCw, AlertCircle, X, Save, Edit2, Trash2,
  Search, ShoppingBag, Phone, Mail, ToggleLeft, ToggleRight, Inbox,
} from 'lucide-react';

const SUPPLIER_TYPES = [
  { value: 'camel_ride', label: 'Camel Ride' },
  { value: 'cooking_class', label: 'Cooking Class' },
  { value: 'hammam', label: 'Hammam' },
  { value: 'transport', label: 'Transport' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'activity', label: 'Activity' },
  { value: 'guide', label: 'Local Guide' },
  { value: 'other', label: 'Other' },
];
const TYPE_MAP = Object.fromEntries(SUPPLIER_TYPES.map(t => [t.value, t.label]));

interface SupplierForm {
  name: string; type: string; city: string;
  contact_name: string; contact_phone: string; contact_email: string;
  service_description: string; contracted_rate: string; currency: string;
  notes: string; is_active: boolean;
}
const empty: SupplierForm = {
  name: '', type: 'other', city: '', contact_name: '',
  contact_phone: '', contact_email: '', service_description: '',
  contracted_rate: '', currency: 'EUR', notes: '', is_active: true,
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierForm>(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    const { data, error: e } = await supabase.from('suppliers').select('*').order('name');
    if (e) { setError(e.message); setLoading(false); return; }
    setSuppliers((data ?? []) as Supplier[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openAdd() { setEditing(null); setForm(empty); setShowModal(true); }
  function openEdit(s: Supplier) {
    setEditing(s);
    setForm({
      name: s.name, type: s.type ?? 'other', city: s.city ?? '',
      contact_name: s.contact_name ?? '', contact_phone: s.contact_phone ?? '',
      contact_email: s.contact_email ?? '', service_description: s.service_description ?? '',
      contracted_rate: s.contracted_rate?.toString() ?? '', currency: s.currency,
      notes: s.notes ?? '', is_active: s.is_active,
    });
    setShowModal(true);
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Supplier name is required'); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(), type: form.type, city: form.city.trim() || null,
      contact_name: form.contact_name.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      contact_email: form.contact_email.trim() || null,
      service_description: form.service_description.trim() || null,
      contracted_rate: form.contracted_rate ? Number(form.contracted_rate) : null,
      currency: form.currency, notes: form.notes.trim() || null,
      is_active: form.is_active, updated_at: new Date().toISOString(),
    };
    if (editing) {
      const { data, error: e } = await supabase.from('suppliers').update(payload).eq('id', editing.id).select().single();
      setSaving(false);
      if (e) { toast.error(e.message); return; }
      setSuppliers(p => p.map(x => x.id === editing.id ? data as Supplier : x));
      toast.success('Supplier updated');
    } else {
      const { data, error: e } = await supabase.from('suppliers').insert(payload).select().single();
      setSaving(false);
      if (e) { toast.error(e.message); return; }
      setSuppliers(p => [...p, data as Supplier].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Supplier added');
    }
    setShowModal(false);
  }

  async function del(s: Supplier) {
    if (!confirm(`Delete "${s.name}"?`)) return;
    const { error: e } = await supabase.from('suppliers').delete().eq('id', s.id);
    if (e) { toast.error(e.message); return; }
    setSuppliers(p => p.filter(x => x.id !== s.id));
    toast.success('Supplier removed');
  }

  const usedTypes = Array.from(new Set(suppliers.map(s => s.type).filter(Boolean)));
  const filtered = suppliers.filter(s => {
    const matchType = typeFilter === 'all' || s.type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || (s.city ?? '').toLowerCase().includes(q) || (s.contact_name ?? '').toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading suppliers…</p></div>;
  if (error) return <div className="page-error"><AlertCircle size={24} /><p>{error}</p><button className="btn btn-primary" onClick={load}><RefreshCw size={14} /> Retry</button></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">{suppliers.length} suppliers · {suppliers.filter(s => s.is_active).length} active</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} className="btn btn-outline"><RefreshCw size={14} /></button>
          <button onClick={openAdd} className="btn btn-primary"><Plus size={15} /> Add Supplier</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setTypeFilter('all')} className={`btn ${typeFilter === 'all' ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 12 }}>All</button>
        {usedTypes.map(t => (
          <button key={t!} onClick={() => setTypeFilter(t!)} className={`btn ${typeFilter === t ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 12 }}>
            {TYPE_MAP[t!] ?? t}
          </button>
        ))}
      </div>

      <div className="search-input-wrap" style={{ marginBottom: 20 }}>
        <Search size={14} />
        <input type="text" placeholder="Search name, city, contact…" value={search} onChange={e => setSearch(e.target.value)} className="form-input search-input" />
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <ShoppingBag size={32} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
          <p className="text-2" style={{ marginBottom: 4 }}>No suppliers yet</p>
          <p className="text-3" style={{ fontSize: 12, marginBottom: 20 }}>Add camel rides, hammams, cooking classes and other service providers.</p>
          <button onClick={openAdd} className="btn btn-primary"><Plus size={14} /> Add Supplier</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map(s => (
            <div key={s.id} className="card" style={{ padding: 16, opacity: s.is_active ? 1 : 0.55 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.name}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--sand)', background: 'rgba(201,169,110,.15)', padding: '2px 7px', borderRadius: 4 }}>
                    {TYPE_MAP[s.type ?? ''] ?? s.type ?? 'Other'}
                  </span>
                </div>
                <button onClick={() => { const is_active = !s.is_active; supabase.from('suppliers').update({ is_active }).eq('id', s.id).then(({ error: e }) => { if (e) { toast.error(e.message); return; } setSuppliers(p => p.map(x => x.id === s.id ? { ...x, is_active } : x)); }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: s.is_active ? '#34D399' : 'var(--text-3)' }}>
                  {s.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
              </div>

              {s.city && <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>📍 {s.city}</div>}

              {s.service_description && <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 10 }}>{s.service_description}</p>}

              {s.contracted_rate && (
                <div style={{ background: 'var(--bg-2)', borderRadius: 6, padding: '6px 10px', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Contracted rate: </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sand)' }}>{s.currency} {s.contracted_rate}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                {s.contact_name && <div style={{ fontSize: 12, fontWeight: 600 }}>{s.contact_name}</div>}
                {s.contact_phone && <a href={`tel:${s.contact_phone}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)', textDecoration: 'none' }}><Phone size={10} />{s.contact_phone}</a>}
                {s.contact_email && <a href={`mailto:${s.contact_email}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)', textDecoration: 'none' }}><Mail size={10} />{s.contact_email}</a>}
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEdit(s)} className="btn btn-outline" style={{ flex: 1, fontSize: 11, justifyContent: 'center' }}><Edit2 size={12} /> Edit</button>
                <button onClick={() => del(s)} className="btn btn-ghost" style={{ fontSize: 11, color: '#F87171', padding: '6px 10px' }}><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 10, width: '100%', maxWidth: 500, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 48px rgba(0,0,0,.5)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{editing ? 'Edit Supplier' : 'Add Supplier'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={16} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Supplier Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Sahara Camel Co." autoFocus />
              </div>
              <div>
                <label className="form-label">Type</label>
                <select className="form-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {SUPPLIER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">City</label>
                <input className="form-input" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Merzouga" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Service Description</label>
                <textarea className="form-input" rows={2} value={form.service_description} onChange={e => setForm(p => ({ ...p, service_description: e.target.value }))} placeholder="2-hour sunset camel trek from Merzouga dunes…" style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label className="form-label">Contracted Rate</label>
                <input className="form-input" type="number" min="0" value={form.contracted_rate} onChange={e => setForm(p => ({ ...p, contracted_rate: e.target.value }))} placeholder="35" />
              </div>
              <div>
                <label className="form-label">Currency</label>
                <select className="form-input" value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
                  <option value="EUR">EUR €</option>
                  <option value="USD">USD $</option>
                  <option value="GBP">GBP £</option>
                  <option value="MAD">MAD</option>
                </select>
              </div>
              <div>
                <label className="form-label">Contact Name</label>
                <input className="form-input" value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} placeholder="Mohammed" />
              </div>
              <div>
                <label className="form-label">Contact Phone</label>
                <input className="form-input" value={form.contact_phone} onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))} placeholder="+212 600 000 000" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Contact Email</label>
                <input className="form-input" type="email" value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} placeholder="camel@sahara.ma" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Booking lead time, availability restrictions…" style={{ resize: 'vertical' }} />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: form.is_active ? '#34D399' : 'var(--text-3)' }}>
                  {form.is_active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{form.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
              <button onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
              <button onClick={save} disabled={saving} className="btn btn-primary">
                <Save size={13} /> {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Supplier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
