import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Tour, Inquiry, OpBooking } from '@/lib/supabase';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from '@/lib/supabase';
import {
  Map, Inbox, Globe, FileText, Star,
  Plus, ArrowRight, Clock, AlertCircle,
  CalendarDays, DollarSign, Users, TrendingUp,
} from 'lucide-react';

interface Stats {
  tours: number;
  published: number;
  draft: number;
  inquiries: number;
  newInquiries: number;
  destinations: number;
  blogPosts: number;
  testimonials: number;
  totalBookings: number;
  confirmedBookings: number;
  activeBookings: number;
  todayTours: number;
  revenue: number;
  outstandingBalance: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [todayBookings, setTodayBookings] = useState<OpBooking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<OpBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const today = new Date().toISOString().slice(0, 10);
        const [
          { data: tours, error: te },
          { data: inquiries, error: ie },
          { count: destCount },
          { count: blogCount },
          { count: testCount },
          { data: bookings, error: be },
        ] = await Promise.all([
          supabase.from('tours').select('*').order('created_at', { ascending: false }),
          supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
          supabase.from('destinations').select('*', { count: 'exact', head: true }),
          supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
          supabase.from('testimonials').select('*', { count: 'exact', head: true }),
          supabase.from('op_bookings').select('*').order('start_date', { ascending: true }),
        ]);

        if (te) throw te;
        if (ie) throw ie;
        if (be) throw be;

        const tourList = (tours ?? []) as Tour[];
        const inquiryList = (inquiries ?? []) as Inquiry[];
        const bookingList = (bookings ?? []) as OpBooking[];

        const active = bookingList.filter(b => b.status === 'active' || b.status === 'confirmed');
        const revenue = bookingList
          .filter(b => b.status !== 'cancelled')
          .reduce((sum, b) => sum + (b.total_price ?? 0), 0);
        const outstanding = bookingList
          .filter(b => !b.balance_paid && (b.status === 'confirmed' || b.status === 'active'))
          .reduce((sum, b) => sum + ((b.total_price ?? 0) - (b.deposit_amount ?? 0)), 0);

        setStats({
          tours: tourList.length,
          published: tourList.filter(t => t.status === 'published').length,
          draft: tourList.filter(t => t.status === 'draft').length,
          inquiries: inquiryList.length,
          newInquiries: inquiryList.filter(i => i.status === 'new').length,
          destinations: destCount ?? 0,
          blogPosts: blogCount ?? 0,
          testimonials: testCount ?? 0,
          totalBookings: bookingList.length,
          confirmedBookings: bookingList.filter(b => b.status === 'confirmed').length,
          activeBookings: bookingList.filter(b => b.status === 'active').length,
          todayTours: bookingList.filter(b => b.start_date === today).length,
          revenue,
          outstandingBalance: outstanding,
        });

        setRecentInquiries(inquiryList.slice(0, 4));
        setTodayBookings(bookingList.filter(b => b.start_date === today));
        setUpcomingBookings(
          bookingList
            .filter(b => b.start_date && b.start_date > today && (b.status === 'confirmed' || b.status === 'active'))
            .slice(0, 4)
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading dashboard…</p></div>;
  if (error) return (
    <div className="page-error">
      <AlertCircle size={24} />
      <p>{error}</p>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  const s = stats!;

  const fmtDate = (d: string | null) =>
    d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Best Travel Morocco — Admin Overview</p>
        </div>
        <Link to="/bookings" className="btn btn-primary"><Plus size={15} /> New Booking</Link>
      </div>

      {/* Booking alert row */}
      {(s.todayTours > 0 || s.outstandingBalance > 0 || s.newInquiries > 0) && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {s.todayTours > 0 && (
            <Link to="/bookings" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 8, padding: '8px 14px', textDecoration: 'none', fontSize: 13, color: '#60A5FA', fontWeight: 600 }}>
              <CalendarDays size={15} />{s.todayTours} tour{s.todayTours > 1 ? 's' : ''} starting today
            </Link>
          )}
          {s.outstandingBalance > 0 && (
            <Link to="/bookings" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '8px 14px', textDecoration: 'none', fontSize: 13, color: '#F87171', fontWeight: 600 }}>
              <DollarSign size={15} />€{s.outstandingBalance.toLocaleString()} outstanding balance
            </Link>
          )}
          {s.newInquiries > 0 && (
            <Link to="/inquiries" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(244,114,182,0.12)', border: '1px solid rgba(244,114,182,0.3)', borderRadius: 8, padding: '8px 14px', textDecoration: 'none', fontSize: 13, color: '#F472B6', fontWeight: 600 }}>
              <Inbox size={15} />{s.newInquiries} new inquiry{s.newInquiries > 1 ? 'ies' : ''}
            </Link>
          )}
        </div>
      )}

      {/* Booking stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: "Today's Tours", value: s.todayTours, icon: <CalendarDays size={16} />, color: '#60A5FA', to: '/bookings' },
          { label: 'Active / Confirmed', value: s.activeBookings + s.confirmedBookings, icon: <Users size={16} />, color: '#34D399', to: '/bookings' },
          { label: 'Total Revenue', value: `€${s.revenue.toLocaleString()}`, icon: <TrendingUp size={16} />, color: 'var(--sand)', to: '/bookings' },
          { label: 'Outstanding', value: s.outstandingBalance > 0 ? `€${s.outstandingBalance.toLocaleString()}` : 'None', icon: <DollarSign size={16} />, color: s.outstandingBalance > 0 ? '#F87171' : 'var(--text-3)', to: '/bookings' },
        ].map(card => (
          <Link key={card.label} to={card.to} className="card" style={{ textDecoration: 'none', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ color: card.color }}>{card.icon}</div>
              <span className="text-3" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1 }}>{card.value}</div>
          </Link>
        ))}
      </div>

      {/* Content stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total Tours', value: s.tours, sub: `${s.published} published · ${s.draft} draft`, icon: <Map size={17} />, color: 'var(--sand)', to: '/tours', alert: false },
          { label: 'Inquiries', value: s.inquiries, sub: s.newInquiries > 0 ? `${s.newInquiries} new` : 'All read', icon: <Inbox size={17} />, color: '#60A5FA', to: '/inquiries', alert: s.newInquiries > 0 },
          { label: 'Destinations', value: s.destinations, sub: 'across Morocco', icon: <Globe size={17} />, color: '#34D399', to: '/destinations', alert: false },
          { label: 'Blog Posts', value: s.blogPosts, sub: 'articles', icon: <FileText size={17} />, color: '#F472B6', to: '/blog', alert: false },
          { label: 'Testimonials', value: s.testimonials, sub: 'guest reviews', icon: <Star size={17} />, color: '#FBBF24', to: '/testimonials', alert: false },
        ].map(card => (
          <Link key={card.label} to={card.to} className="card" style={{ textDecoration: 'none', position: 'relative', padding: '14px 16px' }}>
            {card.alert && (
              <span style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: '#F472B6' }} />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${card.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>{card.icon}</div>
              <span className="text-3" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1, marginBottom: 3 }}>{card.value}</div>
            <div className="text-3" style={{ fontSize: 11 }}>{card.sub}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Today's tours */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 className="card-title">Today's Tours</h3>
            <Link to="/bookings" style={{ fontSize: 12, color: 'var(--sand)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              All bookings <ArrowRight size={12} />
            </Link>
          </div>
          {todayBookings.length === 0 ? (
            <p className="text-3" style={{ fontSize: 13, padding: '8px 0' }}>No tours departing today.</p>
          ) : todayBookings.map(b => (
            <Link key={b.id} to={`/bookings/${b.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#34D399', flexShrink: 0 }}>
                {b.client_name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{b.client_name}</div>
                <div className="text-3" style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {b.tour_name}{b.pickup_time ? ` · ${b.pickup_time}` : ''}
                </div>
              </div>
              <span className={`badge ${BOOKING_STATUS_COLORS[b.status]}`} style={{ fontSize: 10 }}>
                {BOOKING_STATUS_LABELS[b.status]}
              </span>
            </Link>
          ))}
        </div>

        {/* Upcoming confirmed bookings */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 className="card-title">Upcoming</h3>
            <Link to="/bookings" style={{ fontSize: 12, color: 'var(--sand)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {upcomingBookings.length === 0 ? (
            <p className="text-3" style={{ fontSize: 13, padding: '8px 0' }}>No upcoming confirmed bookings.</p>
          ) : upcomingBookings.map(b => (
            <Link key={b.id} to={`/bookings/${b.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}>
              <div style={{ textAlign: 'center', minWidth: 40, flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--sand)', lineHeight: 1 }}>
                  {b.start_date ? new Date(b.start_date + 'T00:00:00').getDate() : '—'}
                </div>
                <div className="text-3" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {b.start_date ? new Date(b.start_date + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short' }) : ''}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{b.client_name}</div>
                <div className="text-3" style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {b.tour_name} · {b.num_adults + b.num_children} pax
                </div>
              </div>
              <span className={`badge ${BOOKING_STATUS_COLORS[b.status]}`} style={{ fontSize: 10 }}>
                {BOOKING_STATUS_LABELS[b.status]}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Inquiries */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 className="card-title">Recent Inquiries</h3>
            <Link to="/inquiries" style={{ fontSize: 12, color: 'var(--sand)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>View all <ArrowRight size={12} /></Link>
          </div>
          {recentInquiries.length === 0 ? (
            <p className="text-3" style={{ fontSize: 13 }}>No inquiries yet.</p>
          ) : recentInquiries.map(inq => (
            <Link key={inq.id} to="/inquiries" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: inq.status === 'new' ? 'rgba(244,114,182,0.12)' : 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: inq.status === 'new' ? '#F472B6' : 'var(--sand)', flexShrink: 0 }}>
                {inq.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{inq.name}</div>
                <div className="text-3" style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inq.tour_name ?? inq.email}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {inq.status === 'new' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F472B6', display: 'inline-block' }} />}
                <span className="text-3" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={10} />{fmtDate(inq.created_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 14 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              { label: 'New Booking', to: '/bookings', primary: true },
              { label: 'New Tour', to: '/tours/new' },
              { label: 'View Inquiries', to: '/inquiries' },
              { label: 'Staff Roster', to: '/staff' },
              { label: 'Manage Destinations', to: '/destinations' },
              { label: 'Testimonials', to: '/testimonials' },
              { label: 'Settings', to: '/settings' },
            ].map(a => (
              <Link key={a.label} to={a.to} className={`btn ${a.primary ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 12 }}>
                {a.label}
              </Link>
            ))}
            <a href="https://www.besttravelmorocco.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: 12 }}>
              View Live Site <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
