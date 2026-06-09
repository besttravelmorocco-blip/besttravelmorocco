import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { CustomTourRequest } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Plus, RefreshCw, AlertCircle, X, Save, Edit2,
  Search, Users, Mail, Phone, Calendar, MessageSquare, Inbox,
} from 'lucide-react';

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;
const STATUS_LABELS: Record<string, string> = { new: 'New', contacted: 'Contacted', quoted: 'Quoted', won: 'Won', lost: 'Lost' };
const STATUS_COLORS: Record<string, string> = { new: '#60A5FA', contacted: '#FBBF24', quoted: '#A78BFA', won: '#34D399', lost: '#F87171' };
const SOURCES = ['website', 'whatsapp', 'email', 'phone', 'referral'];

interface RequestForm {
  first_name: string; last_name: string; email: string; phone: string;
  group_size: string; preferred_start_date: string; duration_days: string;
  tour_name: string; budget_per_person: string; special_requirements: string;
  source: string; status: string; assigned_to: string;
  follow_up_date: string; quoted_price: string; notes: string;
}
const empty: RequestForm = {
  first_name: '', last_name: '', email: '', phone: '', group_size: '',
  preferred_start_date: '', duration_days: '', tour_name: '', budget_per_person: '',
  special_requirements: '', source: 'website', status: 'new', assigned_to: '',
  follow_up_date: '', quoted_price: '', notes: '',
};

export default function CustomToursPage() {
  const [requests, setRequests] = useState<CustomTourRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CustomTourRequest | null>(null);
  const [form, setForm] = useState<RequestForm>(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    const { data, error: e } = await supabase.from('custom_tour_requests').select('*').order('created_at', { ascending: false });
    if (e) { setError(e.message); setLoading(false); return; }
    setRequests((data ?? []) as CustomTourRequest[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openAdd() { setEditing(null); setForm(empty); setShowModal(true); }
  function openEdit(r: CustomTourRequest) {
    setEditing(r);
    setForm({
      first_name: r.first_name, last_name: r.last_name, email: r.email, phone: r.phone ?? '',
      group_size: r.group_size.toString(), preferred_start_date: r.preferred_start_date ?? '',
      duration_days: r.duration_days?.toString() ?? '', tour_name: r.tour_name ?? '',
      budget_per_person: r.budget_per_person?.toString() ?? '',
      special_requirements: r.special_requirements ?? '', source: r.source,
      status: r.status, assigned_to: r.assigned_to ?? '', follow_up_date: r.follow_up_date ?? '',
      quoted_price: r.quoted_price?.toString() ?? '', notes: r.notes ?? '',
    });
    setShowModal(true);
  }

  async function save() {
    if (!form.first_name.trim() || !form.last_name.trim()) { toast.error('Full name is required'); return; }
    if (!form.email.trim()) { toast.error('Email is required'); return; }
    if (!form.group_size || isNaN(Number(form.group_size))) { toast.error('Group size is required'); return; }
    setSaving(true);
    const payload = {
      first_name: form.first_name.trim(), last_name: form.last_name.trim(), email: form.email.trim(),
      phone: form.phone.trim() || null, group_size: Number(form.group_size),
      preferred_start_date: form.preferred_start_date || null,
      duration_days: form.duration_days ? Number(form.duration_days) : null,
      tour_name: form.tour_name.trim() || null,
      budget_per_person: form.budget_per_person ? Number(form.budget_per_person) : null,
      special_requirements: form.special_requirements.trim() || null,
      source: form.source, status: form.status,
      assigned_to: form.assigned_to.trim() || null,
      follow_up_date: form.follow_up_date || null,
      quoted_price: form.quoted_price ? Number(form.quoted_price) : null,
      notes: form.notes.trim() || null, updated_at: new Date().toISOString(),
    };
    if (editing) {
      const { data, error: e } = await supabase.from('custom_tour_requests').update(payload).eq('id', editing.id).select().single();
      setSaving(false);
      if (e) { toast.error(e.message); return; }
      setRequests(p => p.map(x => x.id === editing.id ? data as CustomTourRequest : x));
      toast.success('Request updated');
    } else {
      const { data, error: e } = await supabase.from('custom_tour_requests').insert(payload).select().single();
      setSaving(false);
      if (e) { toast.error(e.message); return; }
      setRequests(p => [data as CustomTourRequest, ...p]);
      toast.success('Request created');
    }
    setShowModal(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error: e } = await supabase.from('custom_tour_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (e) { toast.error(e.message); return; }
    setRequests(p => p.map(x => x.id === id ? { ...x, status } : x));
    toast.success(`Status → ${STATUS_LABELS[status]}`);
  }

  const filtered = requests.filter(r => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || `${r.first_name} ${r.last_name}`.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading custom tour requests…</p></div>;
  if (error) return <div className="page-error"><AlertCircle size={24} /><p>{error}</p><button className="btn btn-primary" onClick={load}><RefreshCw size={14} /> Retry</button></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Custom Tour Requests</h1>
          <p className="page-subtitle">{requests.length} total · {requests.filter(r => r.status === 'new').length} new leads</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} className="btn btn-outline"><RefreshCw size={14} /></button>
          <button onClick={openAdd} className="btn btn-primary"><Plus size={15} /> Add Request</button>
        </div>
      </div>

      {/* Status filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['all', ...STATUSES] as string[]).map(s => {
          const count = s === 'all' ? requests.length : requests.filter(r => r.status === s).length;
          return (
            <button key={s} onClick={() => setStatusFilter(s)} className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 12, gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: s === 'all' ? 'var(--text-3)' : STATUS_COLORS[s], display: 'inline-block' }} />
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
              <span style={{ background: statusFilter === s ? 'rgba(255,255,255,.2)' : 'var(--bg-2)', padding: '1px 6px', borderRadius: 10, fontSize: 11 }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="search-input-wrap" style={{ marginBottom: 20 }}>
        <Search size={14} />
        <input type="text" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} className="form-input search-input" />
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Inbox size={32} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
          <p className="text-2" style={{ marginBottom: 4 }}>No custom tour requests</p>
          <p className="text-3" style={{ fontSize: 12, marginBottom: 20 }}>Requests from 19+ traveler groups and custom inquiries appear here.</p>
          <button onClick={openAdd} className="btn btn-primary"><Plus size={14} /> Add Request</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(r => (
            <div key={r.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{r.first_name} {r.last_name}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[r.status], background: `${STATUS_COLORS[r.status]}22`, padding: '2px 8px', borderRadius: 4 }}>{STATUS_LABELS[r.status]}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.source}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <a href={`mailto:${r.email}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-2)', textDecoration: 'none' }}><Mail size={11} />{r.email}</a>
                    {r.phone && <a href={`tel:${r.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-2)', textDecoration: 'none' }}><Phone size={11} />{r.phone}</a>}
                    {r.phone && <a href={`https://wa.me/${r.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#25D366', textDecoration: 'none' }}><MessageSquare size={11} /> WA</a>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-3)' }}>Group</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 700 }}><Users size={13} />{r.group_size} pax</div>
                  </div>
                  {r.preferred_start_date && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-3)' }}>Preferred Date</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}><Calendar size={12} />{fmtDate(r.preferred_start_date)}</div>
                    </div>
                  )}
                  {r.duration_days && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-3)' }}>Duration</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.duration_days} days</div>
                    </div>
                  )}
                  {r.budget_per_person && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-3)' }}>Budget/pax</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sand)' }}>€{r.budget_per_person}</div>
                    </div>
                  )}
                  {r.quoted_price && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-3)' }}>Quoted</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#34D399' }}>€{r.quoted_price}</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto' }}>
                  <select
                    value={r.status}
                    onChange={e => updateStatus(r.id, e.target.value)}
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', fontSize: 11, color: STATUS_COLORS[r.status], fontWeight: 700, cursor: 'pointer' }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                  <button onClick={() => openEdit(r)} className="btn btn-ghost btn-icon"><Edit2 size={13} /></button>
                </div>
              </div>

              {(r.tour_name || r.special_requirements || r.notes) && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {r.tour_name && <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Tour: <strong>{r.tour_name}</strong></div>}
                  {r.special_requirements && <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Requirements: {r.special_requirements}</div>}
                  {r.notes && <div style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>{r.notes}</div>}
                  {r.follow_up_date && <div style={{ fontSize: 12, color: '#FBBF24' }}>Follow-up: {fmtDate(r.follow_up_date)}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 10, width: '100%', maxWidth: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 48px rgba(0,0,0,.5)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{editing ? 'Edit Request' : 'Add Custom Tour Request'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={16} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">First Name *</label>
                <input className="form-input" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} placeholder="John" autoFocus />
              </div>
              <div>
                <label className="form-label">Last Name *</label>
                <input className="form-input" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} placeholder="Smith" />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@example.com" />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+44 7700 000000" />
              </div>
              <div>
                <label className="form-label">Group Size *</label>
                <input className="form-input" type="number" min="1" value={form.group_size} onChange={e => setForm(p => ({ ...p, group_size: e.target.value }))} placeholder="20" />
              </div>
              <div>
                <label className="form-label">Preferred Start Date</label>
                <input className="form-input" type="date" value={form.preferred_start_date} onChange={e => setForm(p => ({ ...p, preferred_start_date: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Duration (days)</label>
                <input className="form-input" type="number" min="1" value={form.duration_days} onChange={e => setForm(p => ({ ...p, duration_days: e.target.value }))} placeholder="7" />
              </div>
              <div>
                <label className="form-label">Budget per Person (€)</label>
                <input className="form-input" type="number" min="0" value={form.budget_per_person} onChange={e => setForm(p => ({ ...p, budget_per_person: e.target.value }))} placeholder="600" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Tour / Destination Interest</label>
                <input className="form-input" value={form.tour_name} onChange={e => setForm(p => ({ ...p, tour_name: e.target.value }))} placeholder="Imperial Cities + Sahara" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Special Requirements</label>
                <textarea className="form-input" rows={2} value={form.special_requirements} onChange={e => setForm(p => ({ ...p, special_requirements: e.target.value }))} placeholder="Vegetarian meals, wheelchair accessible…" style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label className="form-label">Source</label>
                <select className="form-input" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>
                  {SOURCES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Assigned To</label>
                <input className="form-input" value={form.assigned_to} onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))} placeholder="Team member name" />
              </div>
              <div>
                <label className="form-label">Follow-up Date</label>
                <input className="form-input" type="date" value={form.follow_up_date} onChange={e => setForm(p => ({ ...p, follow_up_date: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Quoted Price (€ total)</label>
                <input className="form-input" type="number" min="0" value={form.quoted_price} onChange={e => setForm(p => ({ ...p, quoted_price: e.target.value }))} placeholder="Leave blank until quoted" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Internal Notes</label>
                <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Internal notes only — not visible to client" style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
              <button onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
              <button onClick={save} disabled={saving} className="btn btn-primary">
                <Save size={13} /> {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
