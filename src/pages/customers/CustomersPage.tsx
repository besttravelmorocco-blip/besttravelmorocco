import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Client } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Plus, Search, RefreshCw, AlertCircle, X, Save,
  Edit2, Trash2, Inbox, Phone, MessageSquare, Mail, Globe, Users,
} from 'lucide-react';

interface ClientForm {
  name: string; email: string; phone: string;
  whatsapp: string; nationality: string; hotel: string; notes: string;
}
const empty: ClientForm = { name: '', email: '', phone: '', whatsapp: '', nationality: '', hotel: '', notes: '' };

export default function CustomersPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientForm>(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    const { data, error: e } = await supabase.from('clients').select('*').order('name');
    if (e) { setError(e.message); setLoading(false); return; }
    setClients((data ?? []) as Client[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openAdd() { setEditing(null); setForm(empty); setShowModal(true); }
  function openEdit(c: Client) {
    setEditing(c);
    setForm({ name: c.name, email: c.email ?? '', phone: c.phone ?? '', whatsapp: c.whatsapp ?? '', nationality: c.nationality ?? '', hotel: c.hotel ?? '', notes: c.notes ?? '' });
    setShowModal(true);
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      nationality: form.nationality.trim() || null,
      hotel: form.hotel.trim() || null,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };
    if (editing) {
      const { data, error: e } = await supabase.from('clients').update(payload).eq('id', editing.id).select().single();
      setSaving(false);
      if (e) { toast.error(e.message); return; }
      setClients(p => p.map(x => x.id === editing.id ? data as Client : x));
      toast.success('Customer updated');
    } else {
      const { data, error: e } = await supabase.from('clients').insert(payload).select().single();
      setSaving(false);
      if (e) { toast.error(e.message); return; }
      setClients(p => [...p, data as Client].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Customer added');
    }
    setShowModal(false);
  }

  async function del(c: Client) {
    if (!confirm(`Delete ${c.name}? This cannot be undone.`)) return;
    const { error: e } = await supabase.from('clients').delete().eq('id', c.id);
    if (e) { toast.error(e.message); return; }
    setClients(p => p.filter(x => x.id !== c.id));
    toast.success('Customer deleted');
  }

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || (c.email ?? '').toLowerCase().includes(q) || (c.nationality ?? '').toLowerCase().includes(q) || (c.phone ?? '').includes(q);
  });

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading customers…</p></div>;
  if (error) return <div className="page-error"><AlertCircle size={24} /><p>{error}</p><button className="btn btn-primary" onClick={load}><RefreshCw size={14} /> Retry</button></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{clients.length} total</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} className="btn btn-outline"><RefreshCw size={14} /></button>
          <button onClick={openAdd} className="btn btn-primary"><Plus size={15} /> Add Customer</button>
        </div>
      </div>

      <div className="search-input-wrap" style={{ marginBottom: 20 }}>
        <Search size={14} />
        <input type="text" placeholder="Search name, email, nationality…" value={search} onChange={e => setSearch(e.target.value)} className="form-input search-input" />
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Users size={32} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
          <p className="text-2" style={{ marginBottom: 4 }}>No customers found</p>
          <p className="text-3" style={{ fontSize: 12, marginBottom: 20 }}>Customers link automatically to bookings via the booking wizard.</p>
          <button onClick={openAdd} className="btn btn-primary"><Plus size={14} /> Add Customer</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Name', 'Contact', 'Nationality', 'Hotel / Area', 'Notes', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Since {fmtDate(c.created_at)}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {c.email && <a href={`mailto:${c.email}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-2)', textDecoration: 'none' }}><Mail size={11} />{c.email}</a>}
                      {c.phone && <a href={`tel:${c.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-2)', textDecoration: 'none' }}><Phone size={11} />{c.phone}</a>}
                      {(c.whatsapp || c.phone) && (
                        <a href={`https://wa.me/${(c.whatsapp || c.phone || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#25D366', textDecoration: 'none' }}><MessageSquare size={11} /> WhatsApp</a>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {c.nationality ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-2)' }}><Globe size={11} />{c.nationality}</span> : <span style={{ color: 'var(--text-3)', fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-2)' }}>{c.hotel ?? '—'}</td>
                  <td style={{ padding: '12px 16px', maxWidth: 180 }}>
                    {c.notes ? <p style={{ fontSize: 11, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160, margin: 0 }}>{c.notes}</p> : <span style={{ color: 'var(--text-3)', fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => openEdit(c)} className="btn btn-ghost btn-icon"><Edit2 size={13} /></button>
                      <button onClick={() => del(c)} className="btn btn-ghost btn-icon" style={{ color: '#F87171' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 10, width: '100%', maxWidth: 500, boxShadow: '0 16px 48px rgba(0,0,0,.5)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{editing ? 'Edit Customer' : 'Add Customer'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={16} /></button>
            </div>
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Smith" autoFocus />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@example.com" />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+44 7700 000000" />
              </div>
              <div>
                <label className="form-label">WhatsApp</label>
                <input className="form-input" value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="+44 7700 000000" />
              </div>
              <div>
                <label className="form-label">Nationality</label>
                <input className="form-input" value={form.nationality} onChange={e => setForm(p => ({ ...p, nationality: e.target.value }))} placeholder="British" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Hotel / Area in Morocco</label>
                <input className="form-input" value={form.hotel} onChange={e => setForm(p => ({ ...p, hotel: e.target.value }))} placeholder="Riad Zitoun, Medina — Marrakech" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Dietary requirements, preferences…" style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
              <button onClick={save} disabled={saving} className="btn btn-primary">
                <Save size={13} /> {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
