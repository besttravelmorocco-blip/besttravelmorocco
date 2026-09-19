import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Vehicle } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Plus, RefreshCw, AlertCircle, X, Save, Edit2, Trash2,
  Car, ToggleLeft, ToggleRight, Inbox,
} from 'lucide-react';

const VEHICLE_TYPES = ['SUV', 'Minivan', 'Bus', '4x4', 'Sedan', 'Van'];
const FUEL_TYPES = ['diesel', 'petrol', 'hybrid', 'electric'];

interface VehicleForm {
  type: string; make: string; model: string; year: string;
  license_plate: string; capacity: string; color: string;
  fuel_type: string; notes: string; is_active: boolean;
}
const empty: VehicleForm = { type: 'SUV', make: '', model: '', year: '', license_plate: '', capacity: '4', color: '', fuel_type: 'diesel', notes: '', is_active: true };

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<VehicleForm>(empty);
  const [saving, setSaving] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');

  async function load() {
    setLoading(true); setError(null);
    const { data, error: e } = await supabase.from('vehicles').select('*').order('make').order('model');
    if (e) { setError(e.message); setLoading(false); return; }
    setVehicles((data ?? []) as Vehicle[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openAdd() { setEditing(null); setForm(empty); setShowModal(true); }
  function openEdit(v: Vehicle) {
    setEditing(v);
    setForm({
      type: v.type, make: v.make ?? '', model: v.model ?? '', year: v.year?.toString() ?? '',
      license_plate: v.license_plate ?? '', capacity: v.capacity.toString(), color: v.color ?? '',
      fuel_type: v.fuel_type ?? 'diesel', notes: v.notes ?? '', is_active: v.is_active,
    });
    setShowModal(true);
  }

  async function save() {
    if (!form.type) { toast.error('Vehicle type is required'); return; }
    if (!form.capacity || isNaN(Number(form.capacity))) { toast.error('Valid capacity is required'); return; }
    setSaving(true);
    const payload = {
      type: form.type, make: form.make.trim() || null, model: form.model.trim() || null,
      year: form.year ? Number(form.year) : null, license_plate: form.license_plate.trim() || null,
      capacity: Number(form.capacity), color: form.color.trim() || null,
      fuel_type: form.fuel_type || null, notes: form.notes.trim() || null,
      is_active: form.is_active, updated_at: new Date().toISOString(),
    };
    if (editing) {
      const { data, error: e } = await supabase.from('vehicles').update(payload).eq('id', editing.id).select().single();
      setSaving(false);
      if (e) { toast.error(e.message); return; }
      setVehicles(p => p.map(x => x.id === editing.id ? data as Vehicle : x));
      toast.success('Vehicle updated');
    } else {
      const { data, error: e } = await supabase.from('vehicles').insert(payload).select().single();
      setSaving(false);
      if (e) { toast.error(e.message); return; }
      setVehicles(p => [...p, data as Vehicle]);
      toast.success('Vehicle added');
    }
    setShowModal(false);
  }

  async function toggleActive(v: Vehicle) {
    const is_active = !v.is_active;
    const { error: e } = await supabase.from('vehicles').update({ is_active, updated_at: new Date().toISOString() }).eq('id', v.id);
    if (e) { toast.error(e.message); return; }
    setVehicles(p => p.map(x => x.id === v.id ? { ...x, is_active } : x));
  }

  async function del(v: Vehicle) {
    if (!confirm(`Delete ${v.make} ${v.model ?? ''}? This cannot be undone.`)) return;
    const { error: e } = await supabase.from('vehicles').delete().eq('id', v.id);
    if (e) { toast.error(e.message); return; }
    setVehicles(p => p.filter(x => x.id !== v.id));
    toast.success('Vehicle removed');
  }

  const types = ['all', ...Array.from(new Set(vehicles.map(v => v.type)))];
  const filtered = typeFilter === 'all' ? vehicles : vehicles.filter(v => v.type === typeFilter);
  const typeColor: Record<string, string> = { SUV: '#60A5FA', Minivan: '#34D399', Bus: '#FBBF24', '4x4': '#F472B6', Sedan: '#A78BFA', Van: 'var(--sand)' };

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading vehicles…</p></div>;
  if (error) return <div className="page-error"><AlertCircle size={24} /><p>{error}</p><button className="btn btn-primary" onClick={load}><RefreshCw size={14} /> Retry</button></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicle Fleet</h1>
          <p className="page-subtitle">{vehicles.length} vehicles · {vehicles.filter(v => v.is_active).length} active</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} className="btn btn-outline"><RefreshCw size={14} /></button>
          <button onClick={openAdd} className="btn btn-primary"><Plus size={15} /> Add Vehicle</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {types.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`btn ${typeFilter === t ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 12, textTransform: 'capitalize' }}>
            {t === 'all' ? 'All Types' : t}
            <span style={{ background: typeFilter === t ? 'rgba(255,255,255,.2)' : 'var(--bg-2)', padding: '1px 6px', borderRadius: 10, fontSize: 11, marginLeft: 4 }}>
              {t === 'all' ? vehicles.length : vehicles.filter(v => v.type === t).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Car size={32} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
          <p className="text-2" style={{ marginBottom: 4 }}>No vehicles yet</p>
          <p className="text-3" style={{ fontSize: 12, marginBottom: 20 }}>Add your fleet to assign vehicles to bookings.</p>
          <button onClick={openAdd} className="btn btn-primary"><Plus size={14} /> Add Vehicle</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {filtered.map(v => {
            const color = typeColor[v.type] ?? 'var(--sand)';
            const label = [v.make, v.model].filter(Boolean).join(' ') || v.type;
            return (
              <div key={v.id} className="card" style={{ padding: 16, opacity: v.is_active ? 1 : 0.55 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Car size={18} style={{ color }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
                      <span style={{ fontSize: 11, fontWeight: 600, color }}>{v.type}</span>
                      {v.year && <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 6 }}>{v.year}</span>}
                    </div>
                  </div>
                  <button onClick={() => toggleActive(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: v.is_active ? '#34D399' : 'var(--text-3)' }}>
                    {v.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
                  {[
                    { label: 'Capacity', value: `${v.capacity} pax` },
                    { label: 'Fuel', value: v.fuel_type ?? '—' },
                    { label: 'Plate', value: v.license_plate ?? '—' },
                    { label: 'Color', value: v.color ?? '—' },
                  ].map(row => (
                    <div key={row.label}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-3)' }}>{row.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2, textTransform: 'capitalize' }}>{row.value}</div>
                    </div>
                  ))}
                </div>

                {v.notes && <p style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 12 }}>{v.notes}</p>}

                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(v)} className="btn btn-outline" style={{ flex: 1, fontSize: 11, justifyContent: 'center' }}><Edit2 size={12} /> Edit</button>
                  <button onClick={() => del(v)} className="btn btn-ghost" style={{ fontSize: 11, color: '#F87171', padding: '6px 10px' }}><Trash2 size={12} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 10, width: '100%', maxWidth: 480, boxShadow: '0 16px 48px rgba(0,0,0,.5)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{editing ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={16} /></button>
            </div>
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Type *</label>
                <select className="form-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Capacity (pax) *</label>
                <input className="form-input" type="number" min="1" max="60" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Make</label>
                <input className="form-input" value={form.make} onChange={e => setForm(p => ({ ...p, make: e.target.value }))} placeholder="Toyota" />
              </div>
              <div>
                <label className="form-label">Model</label>
                <input className="form-input" value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} placeholder="Land Cruiser" />
              </div>
              <div>
                <label className="form-label">Year</label>
                <input className="form-input" type="number" min="2000" max="2030" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} placeholder="2022" />
              </div>
              <div>
                <label className="form-label">License Plate</label>
                <input className="form-input" value={form.license_plate} onChange={e => setForm(p => ({ ...p, license_plate: e.target.value }))} placeholder="1234 ABC 5" />
              </div>
              <div>
                <label className="form-label">Color</label>
                <input className="form-input" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} placeholder="White" />
              </div>
              <div>
                <label className="form-label">Fuel Type</label>
                <select className="form-input" value={form.fuel_type} onChange={e => setForm(p => ({ ...p, fuel_type: e.target.value }))}>
                  {FUEL_TYPES.map(f => <option key={f} value={f} style={{ textTransform: 'capitalize' }}>{f}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="AC, roof rack, last service date…" style={{ resize: 'vertical' }} />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: form.is_active ? '#34D399' : 'var(--text-3)' }}>
                  {form.is_active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{form.is_active ? 'Active — available for assignment' : 'Inactive'}</span>
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
              <button onClick={save} disabled={saving} className="btn btn-primary">
                <Save size={13} /> {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
