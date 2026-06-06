import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { OpBooking, BookingStatus } from '@/lib/supabase';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/lib/supabase';
import {
  Plus, Search, RefreshCw, CalendarDays, Users,
  TrendingUp, AlertCircle, Inbox, ChevronRight,
  Clock, DollarSign,
} from 'lucide-react';
import BookingWizard from './BookingWizard';

const STATUS_FILTERS: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all',            label: 'All' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'enquiry',        label: 'Enquiry' },
  { value: 'confirmed',      label: 'Confirmed' },
  { value: 'deposit_paid',   label: 'Deposit Paid' },
  { value: 'active',         label: 'Active' },
  { value: 'completed',      label: 'Completed' },
  { value: 'rejected',       label: 'Rejected' },
  { value: 'cancelled',      label: 'Cancelled' },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<OpBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [showWizard, setShowWizard] = useState(false);

  async function fetchBookings() {
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase
      .from('op_bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (e) { setError(e.message); setLoading(false); return; }
    setBookings((data ?? []) as OpBooking[]);
    setLoading(false);
  }

  useEffect(() => { fetchBookings(); }, []);

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.client_name.toLowerCase().includes(q) ||
      b.reference.toLowerCase().includes(q) ||
      b.tour_name.toLowerCase().includes(q) ||
      (b.client_email ?? '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = bookings.filter(b => b.start_date === today).length;
  const activeCount = bookings.filter(b => b.status === 'active' || b.status === 'confirmed').length;
  const revenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.total_price ?? 0), 0);
  const outstanding = bookings
    .filter(b => !b.balance_paid && (b.status === 'confirmed' || b.status === 'active'))
    .reduce((sum, b) => sum + ((b.total_price ?? 0) - (b.deposit_amount ?? 0)), 0);

  const fmtDate = (d: string | null) =>
    d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—';

  const fmtCcy = (amount: number | null, ccy = 'EUR') => {
    if (!amount) return '—';
    const sym = ccy === 'EUR' ? '€' : ccy === 'USD' ? '$' : ccy === 'GBP' ? '£' : ccy + ' ';
    return `${sym}${amount.toLocaleString()}`;
  };

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading bookings…</p></div>;
  if (error) return (
    <div className="page-error">
      <AlertCircle size={24} /><p>{error}</p>
      <button className="btn btn-primary" onClick={fetchBookings}><RefreshCw size={14} /> Retry</button>
    </div>
  );

  return (
    <div className="page">
      {showWizard && (
        <BookingWizard
          onClose={() => setShowWizard(false)}
          onCreated={(b) => { setBookings(prev => [b, ...prev]); setShowWizard(false); }}
        />
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-subtitle">{bookings.length} total{activeCount > 0 ? ` · ${activeCount} active` : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={fetchBookings} className="btn btn-outline"><RefreshCw size={14} /></button>
          <button onClick={() => setShowWizard(true)} className="btn btn-primary"><Plus size={15} /> New Booking</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: "Today's Tours", value: todayCount, icon: <CalendarDays size={16} />, color: '#60A5FA' },
          { label: 'Active / Confirmed', value: activeCount, icon: <Users size={16} />, color: '#34D399' },
          { label: 'Total Revenue', value: `€${revenue.toLocaleString()}`, icon: <TrendingUp size={16} />, color: 'var(--sand)' },
          {
            label: 'Outstanding',
            value: outstanding > 0 ? `€${outstanding.toLocaleString()}` : 'None',
            icon: <DollarSign size={16} />,
            color: outstanding > 0 ? '#F87171' : 'var(--text-3)',
          },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ color: s.color }}>{s.icon}</div>
              <span className="text-3" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>
                {s.label}
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Status filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map(f => {
          const count = f.value === 'all' ? bookings.length : bookings.filter(b => b.status === f.value).length;
          return (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`btn ${statusFilter === f.value ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: 12, gap: 6 }}
            >
              {f.label}
              <span style={{ background: statusFilter === f.value ? 'rgba(255,255,255,0.2)' : 'var(--bg-2)', padding: '1px 6px', borderRadius: 10, fontSize: 11 }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="search-input-wrap" style={{ marginBottom: 16 }}>
        <Search size={14} />
        <input
          type="text"
          placeholder="Search name, reference, tour…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input search-input"
        />
      </div>

      {/* Table / Empty */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Inbox size={32} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
          <p className="text-2" style={{ marginBottom: 4 }}>No bookings found</p>
          <p className="text-3" style={{ fontSize: 12, marginBottom: 20 }}>
            {search || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Create your first booking to get started.'}
          </p>
          {!search && statusFilter === 'all' && (
            <button onClick={() => setShowWizard(true)} className="btn btn-primary">
              <Plus size={14} /> Create First Booking
            </button>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Ref', 'Client', 'Tour', 'Dates', 'Pax', 'Total', 'Payment', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const payLabel = b.balance_paid ? 'Paid in full' : b.deposit_paid ? 'Deposit paid' : 'Unpaid';
                const payColor = b.balance_paid ? '#34D399' : b.deposit_paid ? 'var(--sand)' : '#F87171';
                return (
                  <tr
                    key={b.id}
                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td style={{ padding: '11px 14px' }}>
                      <Link to={`/bookings/${b.id}`} style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--sand)', textDecoration: 'none', fontWeight: 700 }}>
                        {b.reference}
                      </Link>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{b.client_name}</div>
                      {b.client_nationality && (
                        <div className="text-3" style={{ fontSize: 11 }}>{b.client_nationality}</div>
                      )}
                    </td>
                    <td style={{ padding: '11px 14px', maxWidth: 200 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                        {b.tour_name || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} />{fmtDate(b.start_date)}
                      </div>
                      {b.end_date && (
                        <div className="text-3" style={{ fontSize: 11 }}>→ {fmtDate(b.end_date)}</div>
                      )}
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                        {b.num_adults + b.num_children}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                        {fmtCcy(b.total_price, b.currency)}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: payColor }}>{payLabel}</span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span className={`badge ${BOOKING_STATUS_COLORS[b.status]}`}>
                        {BOOKING_STATUS_LABELS[b.status]}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <Link to={`/bookings/${b.id}`} style={{ color: 'var(--text-3)', display: 'flex' }}>
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
