import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { OpBooking } from '@/lib/supabase';
import { RefreshCw, AlertCircle, TrendingUp, Users, CalendarDays, DollarSign, Award, Clock } from 'lucide-react';

interface MonthlyData {
  month: string;
  revenue: number;
  count: number;
}

interface TourData {
  name: string;
  count: number;
  revenue: number;
}

export default function ReportsPage() {
  const [bookings, setBookings] = useState<OpBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    const { data, error: e } = await supabase.from('op_bookings').select('*').neq('status', 'cancelled');
    if (e) { setError(e.message); setLoading(false); return; }
    setBookings((data ?? []) as OpBooking[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const totalRevenue = bookings.reduce((s, b) => s + (b.total_price ?? 0), 0);
  const totalDeposits = bookings.filter(b => b.deposit_paid).reduce((s, b) => s + (b.deposit_amount ?? 0), 0);
  const totalPaidFull = bookings.filter(b => b.balance_paid).reduce((s, b) => s + (b.total_price ?? 0), 0);
  const totalPax = bookings.reduce((s, b) => s + b.num_adults + b.num_children, 0);
  const outstanding = bookings
    .filter(b => !b.balance_paid && (b.status === 'confirmed' || b.status === 'active' || b.status === 'deposit_paid'))
    .reduce((s, b) => s + ((b.total_price ?? 0) - (b.deposit_amount ?? 0)), 0);
  const avgBookingValue = bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 0;

  // Monthly breakdown (last 12 months)
  const monthlyMap: Record<string, MonthlyData> = {};
  for (const b of bookings) {
    if (!b.start_date) continue;
    const key = b.start_date.slice(0, 7);
    if (!monthlyMap[key]) monthlyMap[key] = { month: key, revenue: 0, count: 0 };
    monthlyMap[key].revenue += b.total_price ?? 0;
    monthlyMap[key].count += 1;
  }
  const monthly = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
  const maxMonthlyRev = Math.max(...monthly.map(m => m.revenue), 1);

  // Tour performance
  const tourMap: Record<string, TourData> = {};
  for (const b of bookings) {
    const name = b.tour_name || 'Unknown';
    if (!tourMap[name]) tourMap[name] = { name, count: 0, revenue: 0 };
    tourMap[name].count += 1;
    tourMap[name].revenue += b.total_price ?? 0;
  }
  const topTours = Object.values(tourMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const maxTourRev = Math.max(...topTours.map(t => t.revenue), 1);

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  for (const b of bookings) {
    statusCounts[b.status] = (statusCounts[b.status] ?? 0) + 1;
  }

  const fmtCcy = (n: number) => `€${n.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
  const fmtMonth = (m: string) => new Date(m + '-01T12:00:00').toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading reports…</p></div>;
  if (error) return <div className="page-error"><AlertCircle size={24} /><p>{error}</p><button className="btn btn-primary" onClick={load}><RefreshCw size={14} /> Retry</button></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Based on {bookings.length} bookings (excluding cancelled)</p>
        </div>
        <button onClick={load} className="btn btn-outline"><RefreshCw size={14} /></button>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Revenue', value: fmtCcy(totalRevenue), icon: <TrendingUp size={16} />, color: 'var(--sand)' },
          { label: 'Paid in Full', value: fmtCcy(totalPaidFull), icon: <DollarSign size={16} />, color: '#34D399' },
          { label: 'Deposits Collected', value: fmtCcy(totalDeposits), icon: <DollarSign size={16} />, color: '#60A5FA' },
          { label: 'Outstanding Balance', value: fmtCcy(outstanding), icon: <Clock size={16} />, color: outstanding > 0 ? '#F87171' : 'var(--text-3)' },
          { label: 'Total Bookings', value: bookings.length.toString(), icon: <CalendarDays size={16} />, color: '#A78BFA' },
          { label: 'Total Travelers', value: totalPax.toLocaleString(), icon: <Users size={16} />, color: '#FBBF24' },
          { label: 'Avg Booking Value', value: fmtCcy(avgBookingValue), icon: <Award size={16} />, color: 'var(--sand)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ color: stat.color }}>{stat.icon}</div>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-3)' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Monthly Revenue Chart */}
        <div className="card">
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Monthly Revenue (by tour start date)</h3>
          {monthly.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>No data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {monthly.map(m => (
                <div key={m.month}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{fmtMonth(m.month)}</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{fmtCcy(m.revenue)} <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 400 }}>({m.count} bk)</span></span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(m.revenue / maxMonthlyRev) * 100}%`, background: 'var(--sand)', borderRadius: 3, transition: 'width .3s' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Status Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Booking Status Breakdown</h3>
          {Object.entries(statusCounts).length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>No data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(statusCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => {
                  const colors: Record<string, string> = { confirmed: '#60A5FA', deposit_paid: 'var(--sand)', active: '#34D399', completed: '#34D399', enquiry: '#9CA3AF', pending_review: '#FBBF24', rejected: '#F87171' };
                  const pct = Math.round((count / bookings.length) * 100);
                  return (
                    <div key={status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-2)', textTransform: 'capitalize' }}>{status.replace(/_/g, ' ')}</span>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{count} <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 400 }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height: 5, background: 'var(--bg-2)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: colors[status] ?? 'var(--text-3)', borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Top Tours */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700 }}>Tour Performance</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Tour', 'Bookings', 'Revenue', 'Revenue Share', 'Avg Value'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topTours.map((t, i) => (
              <tr key={t.name} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: i < 3 ? 'rgba(201,169,110,.2)' : 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i < 3 ? 'var(--sand)' : 'var(--text-3)', flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{t.count}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: 'var(--sand)' }}>{fmtCcy(t.revenue)}</td>
                <td style={{ padding: '12px 16px', minWidth: 160 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 5, background: 'var(--bg-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(t.revenue / maxTourRev) * 100}%`, background: 'var(--sand)', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{Math.round((t.revenue / totalRevenue) * 100)}%</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-2)' }}>{fmtCcy(Math.round(t.revenue / t.count))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
