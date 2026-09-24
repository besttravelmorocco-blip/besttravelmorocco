import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Departure, DepartureStatus, Product, OpBooking, StaffMember } from '@/lib/supabase';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/lib/supabase';
import { DEPARTURE_STATUS_LABELS, DEPARTURE_STATUS_COLORS } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Plus, Calendar, Users, Edit2, Trash2, X, Save, Loader2,
  ChevronDown, ExternalLink, MapPin, AlertTriangle, Car, UserCheck, CalendarDays, List,
} from 'lucide-react';

const STATUSES = ['available', 'guaranteed', 'limited', 'sold_out', 'closed'] as const;

interface DepartureWithProduct extends Departure {
  product?: Product;
}

interface FormState {
  product_id: string;
  departure_date: string;
  return_date: string;
  max_seats: number;
  min_seats: number;
  available_seats: number;
  status: DepartureStatus;
  deposit_amount: string;
  deposit_percentage: number;
  payment_link: string;
  payment_instructions: string;
  notes: string;
}

function emptyForm(productId = ''): FormState {
  return {
    product_id: productId,
    departure_date: '', return_date: '',
    max_seats: 24, min_seats: 8, available_seats: 24,
    status: 'available',
    deposit_amount: '', deposit_percentage: 30,
    payment_link: '', payment_instructions: '', notes: '',
  };
}

function FixedDeparturesTab() {
  const [searchParams] = useSearchParams();
  const productFilter  = searchParams.get('product') ?? '';

  const [departures, setDepartures] = useState<DepartureWithProduct[]>([]);
  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [editing, setEditing]       = useState<Departure | null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState<FormState>(emptyForm(productFilter));
  const [saving, setSaving]         = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | DepartureStatus>('all');
  const [filterProduct, setFilterProduct] = useState(productFilter);

  const load = useCallback(async () => {
    setLoading(true);
    const [depsResult, prodsResult] = await Promise.all([
      supabase
        .from('departures')
        .select('*, product:products(id, title, slug, category, booking_type)')
        .order('departure_date', { ascending: true }),
      supabase
        .from('products')
        .select('id, title, slug, category, booking_type')
        .eq('booking_type', 'fixed_departure')
        .eq('status', 'published')
        .order('title'),
    ]);
    if (depsResult.error) { toast.error(depsResult.error.message); }
    if (prodsResult.error) { toast.error(prodsResult.error.message); }
    setDepartures((depsResult.data as DepartureWithProduct[]) ?? []);
    setProducts((prodsResult.data as Product[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm(filterProduct));
    setShowForm(true);
  }

  function openEdit(d: Departure) {
    setEditing(d);
    setForm({
      product_id:           d.product_id,
      departure_date:       d.departure_date,
      return_date:          d.return_date ?? '',
      max_seats:            d.max_seats,
      min_seats:            d.min_seats,
      available_seats:      d.available_seats,
      status:               d.status,
      deposit_amount:       d.deposit_amount?.toString() ?? '',
      deposit_percentage:   d.deposit_percentage,
      payment_link:         d.payment_link ?? '',
      payment_instructions: d.payment_instructions ?? '',
      notes:                d.notes ?? '',
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.product_id) { toast.error('Select a product'); return; }
    if (!form.departure_date) { toast.error('Departure date required'); return; }
    if (form.available_seats > form.max_seats) { toast.error('Available seats cannot exceed max seats'); return; }

    setSaving(true);
    const payload = {
      product_id:           form.product_id,
      departure_date:       form.departure_date,
      return_date:          form.return_date || null,
      max_seats:            form.max_seats,
      min_seats:            form.min_seats,
      available_seats:      form.available_seats,
      status:               form.status,
      deposit_amount:       form.deposit_amount ? Number(form.deposit_amount) : null,
      deposit_percentage:   form.deposit_percentage,
      payment_link:         form.payment_link || null,
      payment_instructions: form.payment_instructions || null,
      notes:                form.notes || null,
      updated_at:           new Date().toISOString(),
    };

    try {
      if (editing) {
        const { data, error } = await supabase.from('departures').update(payload).eq('id', editing.id).select('*, product:products(id,title,slug,category,booking_type)').single();
        if (error) throw error;
        setDepartures(prev => prev.map(d => d.id === editing.id ? data as DepartureWithProduct : d));
        toast.success('Departure updated');
      } else {
        const { data, error } = await supabase.from('departures').insert({ ...payload, created_at: new Date().toISOString() }).select('*, product:products(id,title,slug,category,booking_type)').single();
        if (error) throw error;
        setDepartures(prev => [...prev, data as DepartureWithProduct].sort((a, b) => a.departure_date.localeCompare(b.departure_date)));
        toast.success('Departure created');
      }
      setShowForm(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function del(d: Departure) {
    if (!confirm(`Delete departure on ${d.departure_date}?`)) return;
    const { error } = await supabase.from('departures').delete().eq('id', d.id);
    if (error) { toast.error(error.message); return; }
    setDepartures(prev => prev.filter(x => x.id !== d.id));
    toast.success('Deleted');
  }

  async function quickStatus(d: Departure, status: DepartureStatus) {
    const { error } = await supabase.from('departures').update({ status, updated_at: new Date().toISOString() }).eq('id', d.id);
    if (error) { toast.error(error.message); return; }
    setDepartures(prev => prev.map(x => x.id === d.id ? { ...x, status } : x));
  }

  function setF<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  const filtered = departures.filter(d => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (filterProduct && d.product_id !== filterProduct) return false;
    return true;
  });

  const now = new Date().toISOString().slice(0, 10);
  const upcoming = filtered.filter(d => d.departure_date >= now);
  const past     = filtered.filter(d => d.departure_date < now);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
        <p className="text-3" style={{ fontSize: 13 }}>
          {departures.length} total · {upcoming.length} upcoming
        </p>
        <button onClick={openNew} className="btn btn-primary">
          <Plus size={14} /> New Departure
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <select
            className="form-input"
            value={filterProduct}
            onChange={e => setFilterProduct(e.target.value)}
            style={{ paddingRight: 28, minWidth: 220 }}
          >
            <option value="">All Products</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }} />
        </div>
        <div style={{ position: 'relative' }}>
          <select
            className="form-input"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
            style={{ paddingRight: 28, minWidth: 160 }}
          >
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{DEPARTURE_STATUS_LABELS[s]}</option>)}
          </select>
          <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }} />
        </div>
        {(filterProduct || filterStatus !== 'all') && (
          <button onClick={() => { setFilterProduct(''); setFilterStatus('all'); }} className="btn btn-ghost" style={{ fontSize: 12 }}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p className="text-3">Loading departures…</p>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 10 }}>
                Upcoming ({upcoming.length})
              </h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {upcoming.map(d => (
                  <DepartureRow key={d.id} departure={d} onEdit={openEdit} onDelete={del} onStatusChange={quickStatus} />
                ))}
              </div>
            </section>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 10 }}>
                Past ({past.length})
              </h3>
              <div style={{ display: 'grid', gap: 8, opacity: 0.6 }}>
                {past.slice(0, 20).map(d => (
                  <DepartureRow key={d.id} departure={d} onEdit={openEdit} onDelete={del} onStatusChange={quickStatus} />
                ))}
              </div>
            </section>
          )}

          {filtered.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '48px 0' }}>
              <p className="text-3" style={{ marginBottom: 12 }}>No departures yet.</p>
              <button onClick={openNew} className="btn btn-primary"><Plus size={14} /> Add First Departure</button>
            </div>
          )}
        </>
      )}

      {/* ── Form modal ────────────────────────────────────────────────────── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000080', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card" style={{ width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>
                {editing ? 'Edit Departure' : 'New Departure'}
              </h2>
              <button onClick={() => setShowForm(false)} className="btn-icon"><X size={16} /></button>
            </div>

            {/* Product */}
            <div className="form-group">
              <label className="form-label">Product *</label>
              <select className="form-input" value={form.product_id} onChange={e => setF('product_id', e.target.value)}>
                <option value="">— Select product —</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              {products.length === 0 && (
                <p style={{ fontSize: 11, color: '#F59E0B', marginTop: 4 }}>
                  No published fixed-departure products found. <Link to="/products" style={{ color: '#F59E0B' }}>Create one first.</Link>
                </p>
              )}
            </div>

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Departure Date *</label>
                <input type="date" className="form-input" value={form.departure_date} onChange={e => setF('departure_date', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Return Date</label>
                <input type="date" className="form-input" value={form.return_date} onChange={e => setF('return_date', e.target.value)} />
              </div>
            </div>

            {/* Seats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Max Seats</label>
                <input type="number" min={1} className="form-input" value={form.max_seats} onChange={e => { const v = +e.target.value; setF('max_seats', v); if (form.available_seats > v) setF('available_seats', v); }} />
              </div>
              <div className="form-group">
                <label className="form-label">Min Seats</label>
                <input type="number" min={1} className="form-input" value={form.min_seats} onChange={e => setF('min_seats', +e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Available Seats</label>
                <input type="number" min={0} max={form.max_seats} className="form-input" value={form.available_seats} onChange={e => setF('available_seats', Math.min(+e.target.value, form.max_seats))} />
              </div>
            </div>

            {/* Seat bar */}
            <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3, transition: 'width 0.2s',
                width: `${((form.max_seats - form.available_seats) / form.max_seats) * 100}%`,
                background: form.available_seats === 0 ? '#EF4444' : form.available_seats <= form.min_seats ? '#F59E0B' : '#10B981',
              }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: -8 }}>
              {form.max_seats - form.available_seats} / {form.max_seats} seats booked
            </p>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STATUSES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setF('status', s)}
                    style={{
                      padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: `2px solid ${form.status === s ? DEPARTURE_STATUS_COLORS[s] : 'var(--border)'}`,
                      background: form.status === s ? `${DEPARTURE_STATUS_COLORS[s]}20` : 'var(--bg-2)',
                      color: form.status === s ? DEPARTURE_STATUS_COLORS[s] : 'var(--text-3)',
                    }}
                  >
                    {DEPARTURE_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Deposit & Payment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Deposit Amount (€)</label>
                <input type="number" min={0} className="form-input" value={form.deposit_amount} onChange={e => setF('deposit_amount', e.target.value)} placeholder="e.g. 150" />
              </div>
              <div className="form-group">
                <label className="form-label">Deposit %</label>
                <input type="number" min={0} max={100} className="form-input" value={form.deposit_percentage} onChange={e => setF('deposit_percentage', +e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Link</label>
              <input className="form-input" value={form.payment_link} onChange={e => setF('payment_link', e.target.value)} placeholder="https://buy.stripe.com/… or PayPal link" />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Instructions</label>
              <textarea className="form-input" rows={2} style={{ resize: 'none' }} value={form.payment_instructions} onChange={e => setF('payment_instructions', e.target.value)} placeholder="Transfer to our Wise account, reference: BTMXXXXX" />
            </div>

            <div className="form-group">
              <label className="form-label">Internal Notes</label>
              <textarea className="form-input" rows={2} style={{ resize: 'none' }} value={form.notes} onChange={e => setF('notes', e.target.value)} placeholder="e.g. Guaranteed only if 10+ sign up by Sept 1" />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={save} disabled={saving} className="btn btn-primary">
                {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                {editing ? 'Update' : 'Create'} Departure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DepartureRow({
  departure: d,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  departure: DepartureWithProduct;
  onEdit: (d: Departure) => void;
  onDelete: (d: Departure) => void;
  onStatusChange: (d: Departure, s: DepartureStatus) => void;
}) {
  const statusColor = DEPARTURE_STATUS_COLORS[d.status];
  const seatsUsed   = d.max_seats - d.available_seats;
  const pct         = (seatsUsed / d.max_seats) * 100;

  const dateStr = new Date(d.departure_date + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
  const returnStr = d.return_date
    ? new Date(d.return_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : null;

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px' }}>
      {/* Date */}
      <div style={{ flexShrink: 0, minWidth: 120 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
          <Calendar size={13} style={{ color: statusColor }} />
          {dateStr}
        </div>
        {returnStr && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>↩ {returnStr}</div>}
      </div>

      {/* Product */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {d.product?.title ?? d.product_id}
        </div>
        {/* Seat bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <div style={{ flex: 1, maxWidth: 120, height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: d.available_seats === 0 ? '#EF4444' : d.available_seats <= d.min_seats ? '#F59E0B' : '#10B981', borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
            <Users size={10} style={{ display: 'inline', marginRight: 2 }} />
            {d.available_seats}/{d.max_seats} available
          </span>
        </div>
      </div>

      {/* Deposit */}
      {d.deposit_amount && (
        <div style={{ flexShrink: 0, fontSize: 12, color: 'var(--sand)', fontWeight: 600 }}>
          €{d.deposit_amount} deposit
        </div>
      )}

      {/* Payment link */}
      {d.payment_link && (
        <a href={d.payment_link} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: 11, padding: '4px 8px', flexShrink: 0 }} title="Open payment link">
          <ExternalLink size={11} />
        </a>
      )}

      {/* Status */}
      <div style={{ flexShrink: 0, position: 'relative' }}>
        <select
          className="form-input"
          value={d.status}
          onChange={e => onStatusChange(d, e.target.value as DepartureStatus)}
          style={{ fontSize: 11, padding: '4px 24px 4px 8px', borderColor: `${statusColor}60`, color: statusColor, fontWeight: 700, background: `${statusColor}10`, minWidth: 120 }}
        >
          {STATUSES.map(s => <option key={s} value={s}>{DEPARTURE_STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button onClick={() => onEdit(d)} className="btn-icon" title="Edit">
          <Edit2 size={13} />
        </button>
        <button onClick={() => onDelete(d)} className="btn-icon btn-icon-danger" title="Delete">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Page wrapper with tabs
// ══════════════════════════════════════════════════════════════════════════════

type DepTab = 'upcoming' | 'fixed';

export default function DeparturesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: DepTab = searchParams.get('tab') === 'fixed' || searchParams.get('product') ? 'fixed' : 'upcoming';

  function setTab(t: DepTab) {
    const next = new URLSearchParams(searchParams);
    next.set('tab', t);
    if (t === 'upcoming') next.delete('product');
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Departures</h1>
          <p className="page-subtitle">Who is travelling when, and the fixed-date departures on sale</p>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        <button onClick={() => setTab('upcoming')} className={`tab ${tab === 'upcoming' ? 'tab-active' : ''}`}>
          <CalendarDays size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />Upcoming Bookings
        </button>
        <button onClick={() => setTab('fixed')} className={`tab ${tab === 'fixed' ? 'tab-active' : ''}`}>
          <List size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />Fixed Departures
        </button>
      </div>

      {tab === 'upcoming' ? <UpcomingBookingsTab /> : <FixedDeparturesTab />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Upcoming bookings — operational view
// ══════════════════════════════════════════════════════════════════════════════

const ACTIVE_STATUSES = ['confirmed', 'deposit_paid', 'active'] as const;
const RANGES = [
  { days: 7,  label: 'Next 7 days' },
  { days: 14, label: 'Next 14 days' },
  { days: 30, label: 'Next 30 days' },
  { days: 90, label: 'Next 90 days' },
];

function isoDay(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function UpcomingBookingsTab() {
  const [bookings, setBookings] = useState<OpBooking[]>([]);
  const [staff, setStaff]       = useState<StaffMember[]>([]);
  const [loading, setLoading]   = useState(true);
  const [range, setRange]       = useState(30);
  const [onlyIssues, setOnlyIssues] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [bk, st] = await Promise.all([
      supabase
        .from('op_bookings')
        .select('*')
        .in('status', ACTIVE_STATUSES as unknown as string[])
        .gte('start_date', isoDay(0))
        .lte('start_date', isoDay(range))
        .order('start_date', { ascending: true })
        .order('pickup_time', { ascending: true, nullsFirst: false }),
      supabase.from('staff').select('*').order('name'),
    ]);
    if (bk.error) toast.error(bk.error.message);
    if (st.error) toast.error('Could not load staff');
    setBookings((bk.data as OpBooking[]) ?? []);
    setStaff((st.data as StaffMember[]) ?? []);
    setLoading(false);
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const staffName = (id: string | null) => (id ? staff.find(s => s.id === id)?.name ?? '—' : null);

  const issuesOf = (b: OpBooking) => {
    const out: string[] = [];
    if (!b.driver_id) out.push('No driver');
    if (!b.guide_fes_id && !b.guide_marrakech_id && !b.guide_volubilis_id) out.push('No guide');
    if (!b.pickup_location) out.push('No pickup');
    if (b.status === 'confirmed' && !b.deposit_paid) out.push('Deposit unpaid');
    return out;
  };

  const visible = onlyIssues ? bookings.filter(b => issuesOf(b).length > 0) : bookings;

  const groups = visible.reduce<Record<string, OpBooking[]>>((acc, b) => {
    const k = b.start_date ?? 'unscheduled';
    (acc[k] ||= []).push(b);
    return acc;
  }, {});

  const totalPax    = bookings.reduce((n, b) => n + (b.num_adults ?? 0) + (b.num_children ?? 0), 0);
  const withIssues  = bookings.filter(b => issuesOf(b).length > 0).length;
  const today       = isoDay(0);
  const tomorrow    = isoDay(1);

  const dayLabel = (d: string) => {
    const base = new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    return d === today ? `Today · ${base}` : d === tomorrow ? `Tomorrow · ${base}` : base;
  };

  return (
    <div>
      {/* Summary + filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <select className="form-input" value={range} onChange={e => setRange(+e.target.value)} style={{ paddingRight: 28, minWidth: 160 }}>
            {RANGES.map(r => <option key={r.days} value={r.days}>{r.label}</option>)}
          </select>
          <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>
          <input type="checkbox" checked={onlyIssues} onChange={e => setOnlyIssues(e.target.checked)} />
          Only show bookings needing attention
        </label>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 12.5, color: 'var(--text-3)' }}>
          <span><strong style={{ color: 'var(--text-1)' }}>{bookings.length}</strong> bookings</span>
          <span><strong style={{ color: 'var(--text-1)' }}>{totalPax}</strong> travellers</span>
          <span style={{ color: withIssues ? 'var(--status-warning)' : undefined }}>
            <strong>{withIssues}</strong> need attention
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p className="text-3">Loading upcoming bookings…</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 0' }}>
          <p className="text-3">{onlyIssues ? 'Nothing needs attention in this period.' : 'No confirmed bookings starting in this period.'}</p>
        </div>
      ) : (
        Object.entries(groups).map(([day, list]) => (
          <section key={day} style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: day === today ? 'var(--sand)' : 'var(--text-3)', marginBottom: 10 }}>
              {dayLabel(day)} · {list.length} booking{list.length > 1 ? 's' : ''}
            </h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {list.map(b => {
                const issues = issuesOf(b);
                const pax = (b.num_adults ?? 0) + (b.num_children ?? 0);
                const guides = [staffName(b.guide_fes_id), staffName(b.guide_marrakech_id), staffName(b.guide_volubilis_id)].filter(Boolean);
                return (
                  <Link key={b.id} to={`/bookings/${b.id}`} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', flexWrap: 'wrap', textDecoration: 'none', borderLeft: `3px solid ${issues.length ? 'var(--status-warning)' : 'var(--status-success)'}` }}>
                    <div style={{ flexShrink: 0, minWidth: 64, fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                      {b.pickup_time ? b.pickup_time.slice(0, 5) : '--:--'}
                    </div>
                    <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sand)' }}>{b.reference}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{b.client_name}</span>
                        <span className={`badge ${BOOKING_STATUS_COLORS[b.status]}`}>{BOOKING_STATUS_LABELS[b.status]}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.tour_name}{b.end_date && b.end_date !== b.start_date ? ` · until ${new Date(b.end_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
                      </div>
                      <div style={{ display: 'flex', gap: 14, marginTop: 5, fontSize: 11.5, color: 'var(--text-3)', flexWrap: 'wrap' }}>
                        <span><Users size={11} style={{ display: 'inline', marginRight: 3 }} />{pax} pax</span>
                        {b.pickup_location && <span><MapPin size={11} style={{ display: 'inline', marginRight: 3 }} />{b.pickup_location}</span>}
                        {staffName(b.driver_id) && <span><Car size={11} style={{ display: 'inline', marginRight: 3 }} />{staffName(b.driver_id)}</span>}
                        {guides.length > 0 && <span><UserCheck size={11} style={{ display: 'inline', marginRight: 3 }} />{guides.join(', ')}</span>}
                      </div>
                    </div>
                    {issues.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flexShrink: 0 }}>
                        {issues.map(i => (
                          <span key={i} className="badge badge-yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <AlertTriangle size={10} /> {i}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
