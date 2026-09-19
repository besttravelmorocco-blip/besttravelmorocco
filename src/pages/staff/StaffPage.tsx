import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { StaffMember, StaffRole } from '@/lib/supabase';
import { STAFF_ROLE_LABELS } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Plus, RefreshCw, AlertCircle, X, Save, Edit2, Trash2,
  Phone, MessageSquare, Users, ToggleLeft, ToggleRight,
} from 'lucide-react';

const ALL_ROLES: StaffRole[] = ['driver', 'guide_fes', 'guide_marrakech', 'guide_volubilis', 'guide_general', 'manager'];
const ROLE_FILTERS: { value: StaffRole | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  ...ALL_ROLES.map(r => ({ value: r, label: STAFF_ROLE_LABELS[r] })),
];

interface StaffForm {
  name: string;
  role: StaffRole;
  phone: string;
  whatsapp: string;
  email: string;
  languages: string;
  available: boolean;
  notes: string;
}

const emptyForm: StaffForm = {
  name: '', role: 'driver', phone: '', whatsapp: '',
  email: '', languages: '', available: true, notes: '',
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<StaffRole | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function fetchStaff() {
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase.from('staff').select('*').order('name');
    if (e) { setError(e.message); setLoading(false); return; }
    setStaff((data ?? []) as StaffMember[]);
    setLoading(false);
  }

  useEffect(() => { fetchStaff(); }, []);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(member: StaffMember) {
    setEditing(member);
    setForm({
      name: member.name,
      role: member.role,
      phone: member.phone ?? '',
      whatsapp: member.whatsapp ?? '',
      email: member.email ?? '',
      languages: member.languages.join(', '),
      available: member.available,
      notes: member.notes ?? '',
    });
    setShowModal(true);
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Name is required.'); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      role: form.role,
      phone: form.phone.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      email: form.email.trim() || null,
      languages: form.languages.split(',').map(l => l.trim()).filter(Boolean),
      available: form.available,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      const { data, error: e } = await supabase.from('staff').update(payload).eq('id', editing.id).select().single();
      setSaving(false);
      if (e) { toast.error(`Save failed: ${e.message}`); return; }
      setStaff(prev => prev.map(s => s.id === editing.id ? (data as StaffMember) : s));
      toast.success('Staff member updated');
    } else {
      const { data, error: e } = await supabase.from('staff').insert(payload).select().single();
      setSaving(false);
      if (e) { toast.error(`Create failed: ${e.message}`); return; }
      setStaff(prev => [...prev, data as StaffMember].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Staff member added');
    }
    setShowModal(false);
  }

  async function toggleAvailability(member: StaffMember) {
    const available = !member.available;
    const { error: e } = await supabase.from('staff').update({ available, updated_at: new Date().toISOString() }).eq('id', member.id);
    if (e) { toast.error(`Update failed: ${e.message}`); return; }
    setStaff(prev => prev.map(s => s.id === member.id ? { ...s, available } : s));
    toast.success(`${member.name} marked ${available ? 'available' : 'unavailable'}`);
  }

  async function deleteMember(member: StaffMember) {
    if (!confirm(`Delete ${member.name}? This cannot be undone.`)) return;
    const { error: e } = await supabase.from('staff').delete().eq('id', member.id);
    if (e) { toast.error(`Delete failed: ${e.message}`); return; }
    setStaff(prev => prev.filter(s => s.id !== member.id));
    toast.success(`${member.name} removed`);
  }

  const filtered = roleFilter === 'all' ? staff : staff.filter(s => s.role === roleFilter);

  const roleColor: Record<StaffRole, string> = {
    driver: '#60A5FA',
    guide_fes: '#34D399',
    guide_marrakech: '#FBBF24',
    guide_volubilis: '#F472B6',
    guide_general: '#A78BFA',
    manager: 'var(--sand)',
  };

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading staff…</p></div>;
  if (error) return (
    <div className="page-error">
      <AlertCircle size={24} /><p>{error}</p>
      <button className="btn btn-primary" onClick={fetchStaff}><RefreshCw size={14} /> Retry</button>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff & Drivers</h1>
          <p className="page-subtitle">{staff.length} team members · {staff.filter(s => s.available).length} available</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={fetchStaff} className="btn btn-outline"><RefreshCw size={14} /></button>
          <button onClick={openAdd} className="btn btn-primary"><Plus size={15} /> Add Staff</button>
        </div>
      </div>

      {/* Role filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {ROLE_FILTERS.map(f => {
          const count = f.value === 'all' ? staff.length : staff.filter(s => s.role === f.value).length;
          return (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              className={`btn ${roleFilter === f.value ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: 12, gap: 6 }}
            >
              {f.label}
              <span style={{ background: roleFilter === f.value ? 'rgba(255,255,255,0.2)' : 'var(--bg-2)', padding: '1px 6px', borderRadius: 10, fontSize: 11 }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Users size={32} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
          <p className="text-2" style={{ marginBottom: 4 }}>No staff members yet</p>
          <p className="text-3" style={{ fontSize: 12, marginBottom: 20 }}>Add drivers and guides to assign them to bookings.</p>
          <button onClick={openAdd} className="btn btn-primary"><Plus size={14} /> Add First Staff Member</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map(member => (
            <div key={member.id} className="card" style={{ padding: 16, position: 'relative' }}>
              {/* Availability dot */}
              <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={() => toggleAvailability(member)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: member.available ? '#34D399' : 'var(--text-3)', display: 'flex', alignItems: 'center' }}>
                  {member.available ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
              </div>

              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                  background: `${roleColor[member.role]}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: roleColor[member.role],
                }}>
                  {member.photo_url
                    ? <img src={member.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : member.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingRight: 32 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>{member.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: roleColor[member.role], marginTop: 2 }}>
                    {STAFF_ROLE_LABELS[member.role]}
                  </div>
                </div>
              </div>

              {/* Availability badge */}
              <div style={{ marginBottom: 12 }}>
                <span className={`badge ${member.available ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 11 }}>
                  {member.available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              {/* Contact info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {member.phone && (
                  <a href={`tel:${member.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)', textDecoration: 'none' }}>
                    <Phone size={12} style={{ color: 'var(--text-3)' }} />{member.phone}
                  </a>
                )}
                {(member.whatsapp || member.phone) && (
                  <a
                    href={`https://wa.me/${(member.whatsapp || member.phone || '').replace(/\D/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#25D366', textDecoration: 'none' }}
                  >
                    <MessageSquare size={12} /> WhatsApp
                  </a>
                )}
              </div>

              {/* Languages */}
              {member.languages.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                  {member.languages.map(lang => (
                    <span key={lang} className="badge badge-gray" style={{ fontSize: 10 }}>{lang}</span>
                  ))}
                </div>
              )}

              {member.notes && (
                <p className="text-3" style={{ fontSize: 11, lineHeight: 1.5, marginBottom: 12 }}>{member.notes}</p>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEdit(member)} className="btn btn-outline" style={{ flex: 1, fontSize: 11, justifyContent: 'center' }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => deleteMember(member)} className="btn btn-ghost" style={{ fontSize: 11, color: '#F87171', padding: '6px 10px' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{ background: 'var(--bg-card)', borderRadius: 10, width: '100%', maxWidth: 480, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{editing ? `Edit ${editing.name}` : 'Add Staff Member'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={16} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" placeholder="e.g. Ahmed Benali" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Role *</label>
                  <select className="form-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as StaffRole }))}>
                    {ALL_ROLES.map(r => <option key={r} value={r}>{STAFF_ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input className="form-input" placeholder="+212 600 000 000" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">WhatsApp</label>
                  <input className="form-input" placeholder="+212 600 000 000" value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="staff@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Languages (comma-separated)</label>
                  <input className="form-input" placeholder="English, French, Arabic" value={form.languages} onChange={e => setForm(p => ({ ...p, languages: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" rows={2} placeholder="Vehicle, certifications, notes…" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    onClick={() => setForm(p => ({ ...p, available: !p.available }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: form.available ? '#34D399' : 'var(--text-3)', display: 'flex', alignItems: 'center' }}
                  >
                    {form.available ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                  </button>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                    {form.available ? 'Available for assignment' : 'Currently unavailable'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
              <button onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
              <button onClick={save} disabled={saving} className="btn btn-primary">
                <Save size={13} /> {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Staff Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
