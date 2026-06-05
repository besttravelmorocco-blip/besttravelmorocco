import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Tour, Inquiry } from '@/lib/supabase';
import {
  Map, Inbox, Globe, FileText, Star, TrendingUp,
  Plus, ArrowRight, Clock, CheckCircle, AlertCircle
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
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTours, setRecentTours] = useState<Tour[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [
          { data: tours, error: te },
          { data: inquiries, error: ie },
          { count: destCount },
          { count: blogCount },
          { count: testCount },
        ] = await Promise.all([
          supabase.from('tours').select('*').order('created_at', { ascending: false }),
          supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
          supabase.from('destinations').select('*', { count: 'exact', head: true }),
          supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
          supabase.from('testimonials').select('*', { count: 'exact', head: true }),
        ]);

        if (te) throw te;
        if (ie) throw ie;

        const tourList = (tours ?? []) as Tour[];
        const inquiryList = (inquiries ?? []) as Inquiry[];

        setStats({
          tours: tourList.length,
          published: tourList.filter(t => t.status === 'published').length,
          draft: tourList.filter(t => t.status === 'draft').length,
          inquiries: inquiryList.length,
          newInquiries: inquiryList.filter(i => i.status === 'new').length,
          destinations: destCount ?? 0,
          blogPosts: blogCount ?? 0,
          testimonials: testCount ?? 0,
        });

        setRecentTours(tourList.slice(0, 5));
        setRecentInquiries(inquiryList.slice(0, 5));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="page-loading"><div className="spinner" /><p>Loading dashboard…</p></div>
  );

  if (error) return (
    <div className="page-error">
      <AlertCircle size={24} />
      <p>{error}</p>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  const statCards = [
    { label: 'Total Tours', value: stats!.tours, sub: `${stats!.published} published · ${stats!.draft} draft`, icon: <Map size={18} />, color: 'var(--sand)', to: '/tours' },
    { label: 'Inquiries', value: stats!.inquiries, sub: stats!.newInquiries > 0 ? `${stats!.newInquiries} new` : 'All read', icon: <Inbox size={18} />, color: '#60A5FA', to: '/inquiries', alert: stats!.newInquiries > 0 },
    { label: 'Destinations', value: stats!.destinations, sub: 'across Morocco', icon: <Globe size={18} />, color: '#34D399', to: '/destinations' },
    { label: 'Blog Posts', value: stats!.blogPosts, sub: 'articles', icon: <FileText size={18} />, color: '#F472B6', to: '/blog' },
    { label: 'Testimonials', value: stats!.testimonials, sub: 'guest reviews', icon: <Star size={18} />, color: '#FBBF24', to: '/testimonials' },
    { label: 'Published', value: stats!.tours > 0 ? `${Math.round((stats!.published / stats!.tours) * 100)}%` : '0%', sub: 'tours live', icon: <TrendingUp size={18} />, color: 'var(--sand)', to: '/tours' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Best Travel Morocco — Admin Overview</p>
        </div>
        <Link to="/tours/new" className="btn btn-primary"><Plus size={15} /> New Tour</Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statCards.map(card => (
          <Link key={card.label} to={card.to} className="card" style={{ textDecoration: 'none', position: 'relative' }}>
            {(card as { alert?: boolean }).alert && (
              <span style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: '#F472B6' }} />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `${card.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>{card.icon}</div>
              <span className="text-3" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1, marginBottom: 4 }}>{card.value}</div>
            <div className="text-3" style={{ fontSize: 12 }}>{card.sub}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Tours */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="card-title">Recent Tours</h3>
            <Link to="/tours" style={{ fontSize: 12, color: 'var(--sand)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>View all <ArrowRight size={12} /></Link>
          </div>
          {recentTours.length === 0 ? (
            <p className="text-3" style={{ fontSize: 13 }}>No tours yet. <Link to="/tours/new" style={{ color: 'var(--sand)' }}>Create one →</Link></p>
          ) : recentTours.map(tour => (
            <Link key={tour.id} to={`/tours/${tour.id}/edit`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}>
              <div style={{ width: 34, height: 34, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-2)' }}>
                <img src={tour.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tour.title}</div>
                <div className="text-3" style={{ fontSize: 11 }}>{tour.from_city} → {tour.to_city} · {tour.days}d · {tour.price}</div>
              </div>
              <span className={`badge badge-${tour.status === 'published' ? 'success' : tour.status === 'draft' ? 'warning' : 'error'}`}>{tour.status}</span>
            </Link>
          ))}
        </div>

        {/* Recent Inquiries */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="card-title">Recent Inquiries</h3>
            <Link to="/inquiries" style={{ fontSize: 12, color: 'var(--sand)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>View all <ArrowRight size={12} /></Link>
          </div>
          {recentInquiries.length === 0 ? (
            <p className="text-3" style={{ fontSize: 13 }}>No inquiries yet.</p>
          ) : recentInquiries.map(inq => (
            <Link key={inq.id} to="/inquiries" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--sand)', flexShrink: 0 }}>
                {inq.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{inq.name}</div>
                <div className="text-3" style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inq.tour_name ?? inq.email}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {inq.status === 'new'
                  ? <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F472B6', display: 'inline-block' }} />
                  : <CheckCircle size={13} style={{ color: 'var(--text-3)' }} />}
                <span className="text-3" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={11} />{new Date(inq.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3 className="card-title" style={{ marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { label: 'New Tour', to: '/tours/new' },
            { label: 'New Blog Post', to: '/blog/new' },
            { label: 'View Inquiries', to: '/inquiries' },
            { label: 'Manage Destinations', to: '/destinations' },
            { label: 'Testimonials', to: '/testimonials' },
            { label: 'Settings', to: '/settings' },
          ].map(a => <Link key={a.label} to={a.to} className="btn btn-outline" style={{ fontSize: 12 }}>{a.label}</Link>)}
          <a href="https://www.besttravelmorocco.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: 12 }}>
            View Live Site <ArrowRight size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
