import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { OpBooking } from '@/lib/supabase';
import { toast } from 'sonner';
import { Check, X, Clock, Users, Calendar, ExternalLink, RefreshCw, Loader2, Inbox } from 'lucide-react';

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d.length === 10 ? d + 'T00:00:00' : d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtMoney(amount: number | null, currency: string) {
  if (amount == null) return '—';
  try { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency || 'EUR', maximumFractionDigits: 0 }).format(amount); }
  catch { return `${amount} ${currency}`; }
}

/** Returns a human countdown and urgency level for the review deadline. */
function deadlineInfo(b: OpBooking): { label: string; color: string } {
  const deadline = b.review_deadline
    ? new Date(b.review_deadline).getTime()
    : new Date(b.submitted_at ?? b.created_at).getTime() + 24 * 3600_000;
  const ms = deadline - Date.now();
  if (ms <= 0) {
    const h = Math.floor(-ms / 3600_000);
    return { label: `Overdue by ${h >= 1 ? `${h}h` : `${Math.floor(-ms / 60_000)}m`}`, color: 'var(--status-error)' };
  }
  const h = Math.floor(ms / 3600_000);
  const m = Math.floor((ms % 3600_000) / 60_000);
  return { label: `${h}h ${m}m left`, color: h < 6 ? 'var(--status-warning)' : 'var(--status-success)' };
}

export default function ReviewPage() {
  const [items, setItems]       = useState<OpBooking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [busyId, setBusyId]     = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<OpBooking | null>(null);
  const [reason, setReason]     = useState('');
  const [, setTick]             = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('op_bookings')
      .select('*')
      .eq('status', 'pending_review')
      .order('review_deadline', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });
    if (error) toast.error(error.message);
    setItems((data as OpBooking[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  // Refresh countdowns every minute
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 60_000); return () => clearInterval(t); }, []);

  async function confirm(b: OpBooking) {
    setBusyId(b.id);
    const now = new Date().toISOString();
    const expires = new Date(Date.now() + 48 * 3600_000).toISOString();
    const { error } = await supabase.from('op_bookings').update({
      status: 'confirmed', reviewed_at: now, payment_link_expires_at: expires, updated_at: now,
    }).eq('id', b.id);
    setBusyId(null);
    if (error) { toast.error(`Confirm failed: ${error.message}`); return; }
    setItems(prev => prev.filter(x => x.id !== b.id));
    toast.success(`${b.reference} confirmed — client has 48h to pay deposit`);
  }

  async function reject() {
    if (!rejecting) return;
    if (!reason.trim()) { toast.error('Rejection reason is required.'); return; }
    setBusyId(rejecting.id);
    const now = new Date().toISOString();
    const { error } = await supabase.from('op_bookings').update({
      status: 'rejected', reviewed_at: now, rejection_reason: reason.trim(), updated_at: now,
    }).eq('id', rejecting.id);
    setBusyId(null);
    if (error) { toast.error(`Reject failed: ${error.message}`); return; }
    setItems(prev => prev.filter(x => x.id !== rejecting.id));
    toast.success(`${rejecting.reference} rejected`);
    setRejecting(null);
    setReason('');
  }

  const overdue = items.filter(b => deadlineInfo(b).label.startsWith('Overdue')).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Review Queue</h1>
          <p className="page-subtitle">
            {items.length} awaiting review{overdue > 0 && <span style={{ color: 'var(--status-error)', fontWeight: 600 }}> · {overdue} overdue</span>}
          </p>
        </div>
        <button onClick={load} className="btn btn-ghost" disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p className="text-3">Loading review queue…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 0' }}>
          <Inbox size={28} style={{ color: 'var(--text-3)', margin: '0 auto 10px' }} />
          <p style={{ fontWeight: 600, color: 'var(--text-1)' }}>All caught up</p>
          <p className="text-3" style={{ fontSize: 13 }}>No bookings are waiting for review.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {items.map(b => {
            const dl = deadlineInfo(b);
            const pax = (b.num_adults ?? 0) + (b.num_children ?? 0);
            return (
              <div key={b.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', flexWrap: 'wrap', borderLeft: `3px solid ${dl.color}` }}>
                <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sand)', letterSpacing: '.04em' }}>{b.reference}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{b.client_name}</span>
                    {b.client_nationality && <span className="text-3" style={{ fontSize: 11 }}>· {b.client_nationality}</span>}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.tour_name}</div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 11.5, color: 'var(--text-3)', flexWrap: 'wrap' }}>
                    <span><Calendar size={11} style={{ display: 'inline', marginRight: 3 }} />{fmtDate(b.start_date)}</span>
                    <span><Users size={11} style={{ display: 'inline', marginRight: 3 }} />{pax} pax ({b.num_adults}A{b.num_children ? ` + ${b.num_children}C` : ''})</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>{fmtMoney(b.total_price, b.currency)}</span>
                    <span>Submitted {fmtDate(b.submitted_at ?? b.created_at)}</span>
                  </div>
                  {b.special_requirements && (
                    <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 6, fontStyle: 'italic' }}>“{b.special_requirements}”</div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: dl.color, flexShrink: 0 }}>
                  <Clock size={13} /> {dl.label}
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Link to={`/bookings/${b.id}`} className="btn btn-ghost" style={{ fontSize: 12 }} title="Open booking">
                    <ExternalLink size={12} /> Details
                  </Link>
                  <button onClick={() => { setRejecting(b); setReason(''); }} disabled={busyId === b.id} className="btn btn-outline" style={{ fontSize: 12, color: 'var(--status-error)' }}>
                    <X size={12} /> Reject
                  </button>
                  <button onClick={() => confirm(b)} disabled={busyId === b.id} className="btn btn-primary" style={{ fontSize: 12 }}>
                    {busyId === b.id ? <Loader2 size={12} className="spin" /> : <Check size={12} />} Confirm
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rejecting && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000080', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card" style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Reject {rejecting.reference}</h2>
              <button onClick={() => setRejecting(null)} className="btn-icon"><X size={16} /></button>
            </div>
            <p className="text-3" style={{ fontSize: 13 }}>{rejecting.client_name} · {rejecting.tour_name}</p>
            <div className="form-group">
              <label className="form-label">Reason *</label>
              <textarea className="form-input" rows={3} style={{ resize: 'none' }} value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. No availability on the requested dates" autoFocus />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setRejecting(null)} className="btn btn-ghost">Cancel</button>
              <button onClick={reject} disabled={busyId === rejecting.id} className="btn btn-primary" style={{ background: 'var(--status-error)', borderColor: 'var(--status-error)' }}>
                {busyId === rejecting.id ? <Loader2 size={14} className="spin" /> : <X size={14} />} Reject booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
