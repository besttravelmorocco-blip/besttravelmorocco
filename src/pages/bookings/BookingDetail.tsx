import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { OpBooking, OpPayment, StaffMember, BookingStatus, PaymentMethod, PaymentType } from '@/lib/supabase';
import {
  BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS,
  PAYMENT_METHOD_LABELS, STAFF_ROLE_LABELS,
} from '@/lib/supabase';
import { toast } from 'sonner';
import {
  ArrowLeft, RefreshCw, AlertCircle, Edit2, Save, X,
  Phone, MessageSquare, Mail, DollarSign, Users,
  ChevronDown, Plus, Copy, ExternalLink, Check, Trash2,
} from 'lucide-react';

const STATUS_PIPELINE: BookingStatus[] = ['enquiry', 'pending_review', 'confirmed', 'deposit_paid', 'active', 'completed', 'cancelled'];
const PAYMENT_TYPES: PaymentType[] = ['deposit', 'balance', 'extra', 'refund'];
const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = { deposit: 'Deposit', balance: 'Balance', extra: 'Extra', refund: 'Refund' };

interface PaymentForm {
  amount: string;
  currency: string;
  type: PaymentType;
  method: PaymentMethod;
  reference: string;
  paid_at: string;
  notes: string;
}

const emptyPayment: PaymentForm = {
  amount: '', currency: 'EUR', type: 'deposit', method: 'bank_transfer',
  reference: '', paid_at: new Date().toISOString().slice(0, 10), notes: '',
};

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<OpBooking | null>(null);
  const [payments, setPayments] = useState<OpPayment[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<OpBooking>>({});
  const [saving, setSaving] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payForm, setPayForm] = useState<PaymentForm>(emptyPayment);
  const [savingPayment, setSavingPayment] = useState(false);
  const [showTourSheet, setShowTourSheet] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const [{ data: bk, error: be }, { data: pmts, error: pe }, { data: st }] = await Promise.all([
      supabase.from('op_bookings').select('*').eq('id', id).single(),
      supabase.from('op_payments').select('*').eq('booking_id', id).order('created_at', { ascending: false }),
      supabase.from('staff').select('*').order('name'),
    ]);
    if (be) { setError(be.message); setLoading(false); return; }
    if (pe) { toast.error('Could not load payments'); }
    setBooking(bk as OpBooking);
    setForm(bk as OpBooking);
    setPayments((pmts ?? []) as OpPayment[]);
    setStaff((st ?? []) as StaffMember[]);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const staffName = (sid: string | null) => sid ? (staff.find(s => s.id === sid)?.name ?? '—') : '—';

  async function saveChanges() {
    if (!booking) return;
    setSaving(true);
    const { error: e } = await supabase
      .from('op_bookings')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', booking.id);
    setSaving(false);
    if (e) { toast.error(`Save failed: ${e.message}`); return; }
    setBooking({ ...booking, ...form } as OpBooking);
    setEditing(false);
    toast.success('Booking saved');
  }

  async function updateStatus(status: BookingStatus) {
    if (!booking) return;
    const { error: e } = await supabase.from('op_bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', booking.id);
    if (e) { toast.error(`Status update failed: ${e.message}`); return; }
    setBooking(prev => prev ? { ...prev, status } : prev);
    setForm(prev => ({ ...prev, status }));
    toast.success(`Status → ${BOOKING_STATUS_LABELS[status]}`);
  }

  async function addPayment() {
    if (!booking) return;
    if (!payForm.amount || parseFloat(payForm.amount) <= 0) { toast.error('Enter a valid amount.'); return; }
    setSavingPayment(true);
    const { data, error: e } = await supabase.from('op_payments').insert({
      booking_id: booking.id,
      amount: parseInt(payForm.amount, 10),
      currency: payForm.currency,
      type: payForm.type,
      method: payForm.method,
      reference: payForm.reference.trim() || null,
      paid_at: payForm.paid_at || null,
      notes: payForm.notes.trim() || null,
    }).select().single();
    setSavingPayment(false);
    if (e) { toast.error(`Payment failed: ${e.message}`); return; }
    setPayments(prev => [data as OpPayment, ...prev]);

    // Auto-mark deposit/balance paid flags
    if (payForm.type === 'deposit') {
      await supabase.from('op_bookings').update({ deposit_paid: true, deposit_paid_date: payForm.paid_at, deposit_method: payForm.method }).eq('id', booking.id);
      setBooking(prev => prev ? { ...prev, deposit_paid: true, deposit_paid_date: payForm.paid_at, deposit_method: payForm.method as PaymentMethod } : prev);
    }
    if (payForm.type === 'balance') {
      await supabase.from('op_bookings').update({ balance_paid: true, balance_paid_date: payForm.paid_at }).eq('id', booking.id);
      setBooking(prev => prev ? { ...prev, balance_paid: true, balance_paid_date: payForm.paid_at } : prev);
    }

    setPayForm(emptyPayment);
    setShowPaymentModal(false);
    toast.success('Payment recorded');
  }

  async function deletePayment(pid: string) {
    if (!confirm('Delete this payment record?')) return;
    const { error: e } = await supabase.from('op_payments').delete().eq('id', pid);
    if (e) { toast.error(`Delete failed: ${e.message}`); return; }
    setPayments(prev => prev.filter(p => p.id !== pid));
    toast.success('Payment removed');
  }

  function buildTourSheet(): string {
    if (!booking) return '';
    const b = booking;
    const sym = b.currency === 'EUR' ? '€' : b.currency === 'USD' ? '$' : b.currency === 'GBP' ? '£' : b.currency + ' ';
    const lines: string[] = [
      `🌍 *BEST TRAVEL MOROCCO — TOUR SHEET*`,
      `📋 Ref: ${b.reference}`,
      ``,
      `👤 *CLIENT*`,
      `Name: ${b.client_name}`,
      b.client_phone ? `Phone: ${b.client_phone}` : '',
      b.client_whatsapp ? `WhatsApp: ${b.client_whatsapp}` : '',
      b.client_nationality ? `Nationality: ${b.client_nationality}` : '',
      b.client_hotel ? `Hotel: ${b.client_hotel}` : '',
      ``,
      `🗺️ *TOUR*`,
      `Tour: ${b.tour_name}`,
      b.start_date ? `Start: ${b.start_date}` : '',
      b.end_date ? `End: ${b.end_date}` : '',
      `Pax: ${b.num_adults} adults${b.num_children > 0 ? `, ${b.num_children} children` : ''}`,
      b.pickup_location ? `Pickup: ${b.pickup_location} at ${b.pickup_time ?? '08:00'}` : '',
      ``,
      `👥 *STAFF*`,
      b.driver_id ? `Driver: ${staffName(b.driver_id)}` : '',
      b.guide_fes_id ? `Guide (Fes): ${staffName(b.guide_fes_id)}` : '',
      b.guide_marrakech_id ? `Guide (Marrakech): ${staffName(b.guide_marrakech_id)}` : '',
      b.guide_volubilis_id ? `Guide (Volubilis): ${staffName(b.guide_volubilis_id)}` : '',
      ``,
      `💳 *PAYMENT*`,
      b.total_price ? `Total: ${sym}${b.total_price.toLocaleString()}` : '',
      b.deposit_amount ? `Deposit: ${sym}${b.deposit_amount.toLocaleString()}${b.deposit_paid ? ' ✓' : ' (pending)'}` : '',
      b.total_price && b.deposit_amount ? `Balance: ${sym}${(b.total_price - b.deposit_amount).toLocaleString()}${b.balance_paid ? ' ✓' : ' (due on arrival)'}` : '',
      ``,
      b.special_requirements ? `⚠️ *SPECIAL REQUIREMENTS*\n${b.special_requirements}\n` : '',
      b.internal_notes ? `📝 *NOTES*\n${b.internal_notes}` : '',
      ``,
      `———`,
      `Best Travel Morocco — besttravelmorocco.com`,
    ];
    return lines.filter(l => l !== '').join('\n');
  }

  function copyTourSheet() {
    navigator.clipboard.writeText(buildTourSheet()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Tour sheet copied to clipboard');
    });
  }

  const fmtDate = (d: string | null) =>
    d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const fmtCcy = (amount: number | null, ccy = 'EUR') => {
    if (!amount) return '—';
    const sym = ccy === 'EUR' ? '€' : ccy === 'USD' ? '$' : ccy === 'GBP' ? '£' : ccy + ' ';
    return `${sym}${amount.toLocaleString()}`;
  };

  function fi(key: keyof OpBooking) { return form[key] as string | undefined; }
  function setFi(key: keyof OpBooking, val: string | number | boolean | null) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading booking…</p></div>;
  if (error || !booking) return (
    <div className="page-error">
      <AlertCircle size={24} />
      <p>{error ?? 'Booking not found'}</p>
      <button className="btn btn-primary" onClick={() => navigate('/bookings')}>
        <ArrowLeft size={14} /> Back to Bookings
      </button>
    </div>
  );

  const b = booking;
  const totalPaid = payments.filter(p => p.type !== 'refund').reduce((s, p) => s + p.amount, 0);
  const refunds = payments.filter(p => p.type === 'refund').reduce((s, p) => s + p.amount, 0);
  const netPaid = totalPaid - refunds;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/bookings" className="btn btn-outline" style={{ padding: '6px 10px' }}>
            <ArrowLeft size={14} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="page-title" style={{ fontSize: 20 }}>{b.client_name}</h1>
              <span className={`badge ${BOOKING_STATUS_COLORS[b.status]}`}>{BOOKING_STATUS_LABELS[b.status]}</span>
            </div>
            <p className="text-3" style={{ fontSize: 12, fontFamily: 'monospace', marginTop: 2 }}>{b.reference}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowTourSheet(true)} className="btn btn-outline" style={{ gap: 6 }}>
            <ExternalLink size={14} /> Tour Sheet
          </button>
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setForm(b); }} className="btn btn-outline"><X size={14} /> Cancel</button>
              <button onClick={saveChanges} disabled={saving} className="btn btn-primary">
                <Save size={14} /> {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="btn btn-outline"><Edit2 size={14} /> Edit</button>
          )}
          <button onClick={load} className="btn btn-outline"><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* Status pipeline */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="text-3" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginRight: 4 }}>Status:</span>
          {STATUS_PIPELINE.map(s => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={b.status === s}
              className={`btn ${b.status === s ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: 11, padding: '4px 12px' }}
            >
              {b.status === s && <Check size={11} style={{ marginRight: 4 }} />}
              {BOOKING_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Client info */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>Client Information</h3>
            {editing ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {([
                  ['client_name', 'Full Name', 'text'],
                  ['client_email', 'Email', 'email'],
                  ['client_phone', 'Phone', 'text'],
                  ['client_whatsapp', 'WhatsApp', 'text'],
                  ['client_nationality', 'Nationality', 'text'],
                  ['client_hotel', 'Hotel', 'text'],
                ] as [keyof OpBooking, string, string][]).map(([key, label, type]) => (
                  <div key={key} style={key === 'client_name' || key === 'client_hotel' ? { gridColumn: '1/-1' } : {}}>
                    <label className="form-label">{label}</label>
                    <input className="form-input" type={type} value={(fi(key) ?? '') as string} onChange={e => setFi(key, e.target.value)} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    ['Email', b.client_email],
                    ['Phone', b.client_phone],
                    ['WhatsApp', b.client_whatsapp],
                    ['Nationality', b.client_nationality],
                    ['Hotel', b.client_hotel],
                  ].map(([k, v]) => v && (
                    <div key={k} style={{ background: 'var(--bg-2)', borderRadius: 6, padding: '8px 10px' }}>
                      <div className="text-3" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{k}</div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{v}</div>
                    </div>
                  ))}
                </div>
                {/* Contact buttons */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                  {b.client_email && (
                    <a href={`mailto:${b.client_email}`} className="btn btn-outline" style={{ fontSize: 12 }}>
                      <Mail size={13} /> Email
                    </a>
                  )}
                  {b.client_phone && (
                    <a href={`tel:${b.client_phone}`} className="btn btn-outline" style={{ fontSize: 12 }}>
                      <Phone size={13} /> Call
                    </a>
                  )}
                  {(b.client_whatsapp || b.client_phone) && (
                    <a
                      href={`https://wa.me/${(b.client_whatsapp || b.client_phone || '').replace(/\D/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="btn btn-outline" style={{ fontSize: 12, color: '#25D366' }}
                    >
                      <MessageSquare size={13} /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tour & Dates */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>Tour & Dates</h3>
            {editing ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Tour Name</label>
                  <input className="form-input" value={fi('tour_name') ?? ''} onChange={e => setFi('tour_name', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Start Date</label>
                  <input className="form-input" type="date" value={fi('start_date') ?? ''} onChange={e => setFi('start_date', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">End Date</label>
                  <input className="form-input" type="date" value={fi('end_date') ?? ''} onChange={e => setFi('end_date', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Adults</label>
                  <input className="form-input" type="number" min={1} value={form.num_adults ?? 1} onChange={e => setFi('num_adults', parseInt(e.target.value) || 1)} />
                </div>
                <div>
                  <label className="form-label">Children</label>
                  <input className="form-input" type="number" min={0} value={form.num_children ?? 0} onChange={e => setFi('num_children', parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="form-label">Pickup Location</label>
                  <input className="form-input" value={fi('pickup_location') ?? ''} onChange={e => setFi('pickup_location', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Pickup Time</label>
                  <input className="form-input" type="time" value={fi('pickup_time') ?? '08:00'} onChange={e => setFi('pickup_time', e.target.value)} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['Tour', b.tour_name || '—'],
                  ['Start', fmtDate(b.start_date)],
                  ['End', fmtDate(b.end_date)],
                  ['Pax', `${b.num_adults} adults${b.num_children > 0 ? `, ${b.num_children} children` : ''}`],
                  ['Pickup', b.pickup_location ? `${b.pickup_location}` : '—'],
                  ['Time', b.pickup_time ?? '08:00'],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--bg-2)', borderRadius: 6, padding: '8px 10px' }}>
                    <div className="text-3" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{k}</div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Staff Assignment */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>Staff Assignment</h3>
            {editing ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {([
                  ['driver_id', 'Driver', 'driver'],
                  ['guide_fes_id', 'Guide — Fes', 'guide_fes'],
                  ['guide_marrakech_id', 'Guide — Marrakech', 'guide_marrakech'],
                  ['guide_volubilis_id', 'Guide — Volubilis', 'guide_volubilis'],
                ] as [keyof OpBooking, string, string][]).map(([key, label, role]) => (
                  <div key={key}>
                    <label className="form-label">{label}</label>
                    <select className="form-input" value={(form[key] as string | null) ?? ''} onChange={e => setFi(key, e.target.value || null)}>
                      <option value="">— Not assigned —</option>
                      {staff.filter(s => s.role === role).map(s => (
                        <option key={s.id} value={s.id}>{s.name}{!s.available ? ' (unavailable)' : ''}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['Driver', b.driver_id],
                  ['Guide — Fes', b.guide_fes_id],
                  ['Guide — Marrakech', b.guide_marrakech_id],
                  ['Guide — Volubilis', b.guide_volubilis_id],
                ].map(([label, sid]) => {
                  const member = sid ? staff.find(s => s.id === sid) : null;
                  return (
                    <div key={label} style={{ background: 'var(--bg-2)', borderRadius: 6, padding: '8px 10px' }}>
                      <div className="text-3" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: member ? 'var(--text-1)' : 'var(--text-3)' }}>
                        {member ? member.name : '—'}
                      </div>
                      {member?.phone && (
                        <div className="text-3" style={{ fontSize: 11, marginTop: 2 }}>{member.phone}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>Notes</h3>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label className="form-label">Internal Notes (staff only)</label>
                  <textarea className="form-input" rows={3} value={fi('internal_notes') ?? ''} onChange={e => setFi('internal_notes', e.target.value)} style={{ resize: 'vertical' }} />
                </div>
                <div>
                  <label className="form-label">Client Notes</label>
                  <textarea className="form-input" rows={3} value={fi('client_notes') ?? ''} onChange={e => setFi('client_notes', e.target.value)} style={{ resize: 'vertical' }} />
                </div>
                <div>
                  <label className="form-label">Special Requirements</label>
                  <textarea className="form-input" rows={2} value={fi('special_requirements') ?? ''} onChange={e => setFi('special_requirements', e.target.value)} style={{ resize: 'vertical' }} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['Internal Notes', b.internal_notes],
                  ['Client Notes', b.client_notes],
                  ['Special Requirements', b.special_requirements],
                ].map(([label, val]) => val && (
                  <div key={label}>
                    <div className="text-3" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{label}</div>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{val}</p>
                  </div>
                ))}
                {!b.internal_notes && !b.client_notes && !b.special_requirements && (
                  <p className="text-3" style={{ fontSize: 13 }}>No notes added.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Pricing */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>Pricing</h3>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label className="form-label">Total Price</label>
                    <input className="form-input" type="number" min={0} value={form.total_price ?? ''} onChange={e => setFi('total_price', parseInt(e.target.value) || null)} />
                  </div>
                  <div>
                    <label className="form-label">Currency</label>
                    <select className="form-input" value={fi('currency') ?? 'EUR'} onChange={e => setFi('currency', e.target.value)}>
                      {['EUR', 'USD', 'GBP', 'MAD'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Deposit Amount</label>
                    <input className="form-input" type="number" min={0} value={form.deposit_amount ?? ''} onChange={e => setFi('deposit_amount', parseInt(e.target.value) || null)} />
                  </div>
                  <div>
                    <label className="form-label">Deposit Method</label>
                    <select className="form-input" value={fi('deposit_method') ?? ''} onChange={e => setFi('deposit_method', e.target.value || null)}>
                      <option value="">—</option>
                      {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map(m => (
                        <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="text-3" style={{ fontSize: 12 }}>Total</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)' }}>{fmtCcy(b.total_price, b.currency)}</span>
                </div>
                <div style={{ height: 1, background: 'var(--border)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-3" style={{ fontSize: 12 }}>Deposit</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: b.deposit_paid ? '#34D399' : 'var(--text-1)' }}>{fmtCcy(b.deposit_amount, b.currency)}</span>
                    {b.deposit_paid ? (
                      <div className="text-3" style={{ fontSize: 10 }}>✓ Paid {b.deposit_paid_date ? fmtDate(b.deposit_paid_date) : ''}</div>
                    ) : (
                      <div style={{ fontSize: 10, color: '#F87171' }}>Pending</div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-3" style={{ fontSize: 12 }}>Balance</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: b.balance_paid ? '#34D399' : 'var(--text-1)' }}>
                      {b.total_price && b.deposit_amount ? fmtCcy(b.total_price - b.deposit_amount, b.currency) : '—'}
                    </span>
                    {b.balance_paid ? (
                      <div className="text-3" style={{ fontSize: 10 }}>✓ Paid {b.balance_paid_date ? fmtDate(b.balance_paid_date) : ''}</div>
                    ) : (
                      <div style={{ fontSize: 10, color: '#F87171' }}>Due on arrival</div>
                    )}
                  </div>
                </div>
                <div style={{ height: 1, background: 'var(--border)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-3" style={{ fontSize: 12 }}>Net paid</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sand)' }}>
                    {fmtCcy(netPaid, b.currency)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payments */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="card-title">Payment Records</h3>
              <button onClick={() => setShowPaymentModal(true)} className="btn btn-outline" style={{ fontSize: 11, padding: '4px 10px' }}>
                <Plus size={12} /> Record
              </button>
            </div>

            {payments.length === 0 ? (
              <p className="text-3" style={{ fontSize: 12, textAlign: 'center', padding: '12px 0' }}>No payments recorded.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {payments.map(p => (
                  <div key={p.id} style={{ background: 'var(--bg-2)', borderRadius: 6, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.type === 'refund' ? '#F87171' : 'var(--text-1)' }}>
                          {p.type === 'refund' ? '-' : '+'}{p.currency === 'EUR' ? '€' : p.currency + ' '}{p.amount.toLocaleString()}
                        </span>
                        <span className="badge badge-gray" style={{ fontSize: 10 }}>{PAYMENT_TYPE_LABELS[p.type]}</span>
                      </div>
                      <div className="text-3" style={{ fontSize: 11 }}>
                        {PAYMENT_METHOD_LABELS[p.method]}{p.paid_at ? ` · ${fmtDate(p.paid_at)}` : ''}{p.reference ? ` · ${p.reference}` : ''}
                      </div>
                    </div>
                    <button onClick={() => deletePayment(p.id)} className="btn-icon" style={{ color: 'var(--text-3)', padding: 4 }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick info */}
          <div className="card" style={{ fontSize: 12, color: 'var(--text-3)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Created</span>
                <span style={{ color: 'var(--text-2)' }}>{fmtDate(b.created_at)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Updated</span>
                <span style={{ color: 'var(--text-2)' }}>{fmtDate(b.updated_at)}</span>
              </div>
              {b.deposit_method && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Deposit via</span>
                  <span style={{ color: 'var(--text-2)' }}>{PAYMENT_METHOD_LABELS[b.deposit_method]}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowPaymentModal(false); }}
        >
          <div style={{ background: 'var(--bg-card)', borderRadius: 10, width: '100%', maxWidth: 440, boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Record Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="btn-icon"><X size={16} /></button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="form-label">Amount</label>
                  <input className="form-input" type="number" min={0} placeholder="0" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Currency</label>
                  <select className="form-input" value={payForm.currency} onChange={e => setPayForm(p => ({ ...p, currency: e.target.value }))}>
                    {['EUR', 'USD', 'GBP', 'MAD'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Type</label>
                  <select className="form-input" value={payForm.type} onChange={e => setPayForm(p => ({ ...p, type: e.target.value as PaymentType }))}>
                    {PAYMENT_TYPES.map(t => <option key={t} value={t}>{PAYMENT_TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Method</label>
                  <select className="form-input" value={payForm.method} onChange={e => setPayForm(p => ({ ...p, method: e.target.value as PaymentMethod }))}>
                    {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map(m => (
                      <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Date Paid</label>
                  <input className="form-input" type="date" value={payForm.paid_at} onChange={e => setPayForm(p => ({ ...p, paid_at: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Reference</label>
                  <input className="form-input" placeholder="Transaction ID" value={payForm.reference} onChange={e => setPayForm(p => ({ ...p, reference: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="form-label">Notes</label>
                <input className="form-input" placeholder="Optional notes" value={payForm.notes} onChange={e => setPayForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowPaymentModal(false)} className="btn btn-outline">Cancel</button>
              <button onClick={addPayment} disabled={savingPayment} className="btn btn-primary">
                <DollarSign size={13} /> {savingPayment ? 'Saving…' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tour Sheet modal */}
      {showTourSheet && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowTourSheet(false); }}
        >
          <div style={{ background: 'var(--bg-card)', borderRadius: 10, width: '100%', maxWidth: 560, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>WhatsApp Tour Sheet</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={copyTourSheet} className="btn btn-primary" style={{ fontSize: 12, gap: 6 }}>
                  {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                </button>
                <button onClick={() => setShowTourSheet(false)} className="btn-icon"><X size={16} /></button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              <pre style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.7, color: 'var(--text-2)', whiteSpace: 'pre-wrap', margin: 0 }}>
                {buildTourSheet()}
              </pre>
            </div>
            <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              {(b.client_whatsapp || b.client_phone) && (
                <a
                  href={`https://wa.me/${(b.client_whatsapp || b.client_phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(buildTourSheet())}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-outline" style={{ fontSize: 12, color: '#25D366', width: '100%', justifyContent: 'center' }}
                >
                  <MessageSquare size={13} /> Open in WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
