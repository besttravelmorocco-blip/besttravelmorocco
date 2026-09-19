import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Tour, TourStatus } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Search, Plus, Edit2, Trash2, Eye, Star, Globe,
  AlertCircle, RefreshCw, ChevronDown, ChevronUp, MapPin
} from 'lucide-react';

const CITIES = ['All Cities', 'Marrakech', 'Fes', 'Casablanca', 'Tangier', 'Agadir', 'Errachidia', 'Ouarzazate', 'Essaouira'];
const STATUSES: { value: TourStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All Cities');
  const [status, setStatus] = useState<TourStatus | 'all'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | null>(null);
  const [groupByCity, setGroupByCity] = useState(false);

  async function fetchTours() {
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase
      .from('tours')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (e) { setError(e.message); setLoading(false); return; }
    setTours((data ?? []) as Tour[]);
    setLoading(false);
  }

  useEffect(() => { fetchTours(); }, []);

  const filtered = useMemo(() => tours.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.from_city.toLowerCase().includes(search.toLowerCase()) || t.to_city.toLowerCase().includes(search.toLowerCase());
    const matchCity = city === 'All Cities' || t.from_city === city;
    const matchStatus = status === 'all' || t.status === status;
    return matchSearch && matchCity && matchStatus;
  }), [tours, search, city, status]);

  async function deleteTour(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    const { error: e } = await supabase.from('tours').delete().eq('id', id);
    if (e) { toast.error(`Delete failed: ${e.message}`); }
    else { toast.success('Tour deleted'); setTours(prev => prev.filter(t => t.id !== id)); }
    setDeleting(null);
  }

  async function toggleStatus(tour: Tour) {
    const next: TourStatus = tour.status === 'published' ? 'draft' : 'published';
    const { error: e } = await supabase.from('tours').update({ status: next, updated_at: new Date().toISOString() }).eq('id', tour.id);
    if (e) { toast.error(`Update failed: ${e.message}`); return; }
    setTours(prev => prev.map(t => t.id === tour.id ? { ...t, status: next } : t));
    toast.success(`Tour ${next}`);
  }

  async function toggleFeatured(tour: Tour) {
    const next = !tour.featured;
    const { error: e } = await supabase.from('tours').update({ featured: next, updated_at: new Date().toISOString() }).eq('id', tour.id);
    if (e) { toast.error(`Update failed: ${e.message}`); return; }
    setTours(prev => prev.map(t => t.id === tour.id ? { ...t, featured: next } : t));
    toast.success(next ? 'Marked as featured' : 'Removed from featured');
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} tours? This cannot be undone.`)) return;
    const ids = [...selected];
    const { error: e } = await supabase.from('tours').delete().in('id', ids);
    if (e) { toast.error(`Bulk delete failed: ${e.message}`); return; }
    setTours(prev => prev.filter(t => !selected.has(t.id)));
    setSelected(new Set());
    toast.success(`${ids.length} tours deleted`);
  }

  async function bulkPublish(pub: boolean) {
    if (selected.size === 0) return;
    const ids = [...selected];
    const status: TourStatus = pub ? 'published' : 'draft';
    const { error: e } = await supabase.from('tours').update({ status, updated_at: new Date().toISOString() }).in('id', ids);
    if (e) { toast.error(`Update failed: ${e.message}`); return; }
    setTours(prev => prev.map(t => selected.has(t.id) ? { ...t, status } : t));
    setSelected(new Set());
    toast.success(`${ids.length} tours ${status}`);
  }

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function selectAll() { setSelected(filtered.length === selected.size ? new Set() : new Set(filtered.map(t => t.id))); }

  const grouped = useMemo(() => {
    if (!groupByCity) return null;
    const map = new Map<string, Tour[]>();
    filtered.forEach(t => { const arr = map.get(t.from_city) ?? []; arr.push(t); map.set(t.from_city, arr); });
    return map;
  }, [filtered, groupByCity]);

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading tours…</p></div>;
  if (error) return (
    <div className="page-error">
      <AlertCircle size={24} /><p>{error}</p>
      <button className="btn btn-primary" onClick={fetchTours}><RefreshCw size={14} /> Retry</button>
    </div>
  );

  const TourRow = ({ tour }: { tour: Tour }) => (
    <tr className={selected.has(tour.id) ? 'selected' : ''}>
      <td style={{ width: 40 }}>
        <input type="checkbox" checked={selected.has(tour.id)} onChange={() => toggleSelect(tour.id)} />
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-2)' }}>
            <img src={tour.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{tour.title}</div>
            <div className="text-3" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={10} />{tour.from_city} → {tour.to_city}
            </div>
          </div>
        </div>
      </td>
      <td><span className="text-3" style={{ fontSize: 12 }}>{tour.days}d · {tour.subtitle}</span></td>
      <td><span style={{ fontWeight: 600, fontSize: 13, color: 'var(--sand)' }}>{tour.price}</span></td>
      <td>
        <button onClick={() => toggleStatus(tour)} className={`badge badge-${tour.status === 'published' ? 'success' : tour.status === 'draft' ? 'warning' : 'error'}`} style={{ cursor: 'pointer', border: 'none', background: 'inherit' }}>
          {tour.status}
        </button>
      </td>
      <td>
        <button onClick={() => toggleFeatured(tour)} title={tour.featured ? 'Remove featured' : 'Mark featured'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tour.featured ? '#FBBF24' : 'var(--text-3)', padding: 4 }}>
          <Star size={15} fill={tour.featured ? '#FBBF24' : 'none'} />
        </button>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <a href={`https://www.besttravelmorocco.com/tours/${tour.id}`} target="_blank" rel="noopener noreferrer" className="btn-icon" title="View on site"><Eye size={14} /></a>
          <Link to={`/tours/${tour.id}/edit`} className="btn-icon" title="Edit"><Edit2 size={14} /></Link>
          <button onClick={() => deleteTour(tour.id, tour.title)} disabled={deleting === tour.id} className="btn-icon btn-icon-danger" title="Delete"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tours</h1>
          <p className="page-subtitle">{tours.length} total · {tours.filter(t => t.status === 'published').length} published</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchTours} className="btn btn-outline" title="Refresh"><RefreshCw size={14} /></button>
          <Link to="/tours/new" className="btn btn-primary"><Plus size={15} /> New Tour</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
            <Search size={14} />
            <input type="text" placeholder="Search tours…" value={search} onChange={e => setSearch(e.target.value)} className="form-input search-input" />
          </div>
          <select value={city} onChange={e => setCity(e.target.value)} className="form-input" style={{ width: 160 }}>
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value as TourStatus | 'all')} className="form-input" style={{ width: 130 }}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={() => setGroupByCity(g => !g)} className={`btn ${groupByCity ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 12 }}>
            {groupByCity ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Group by City
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="card" style={{ marginBottom: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--sand-muted)' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.size} selected</span>
          <button onClick={() => bulkPublish(true)} className="btn btn-outline" style={{ fontSize: 12 }}><Globe size={13} /> Publish</button>
          <button onClick={() => bulkPublish(false)} className="btn btn-outline" style={{ fontSize: 12 }}>Unpublish</button>
          <button onClick={bulkDelete} className="btn btn-outline" style={{ fontSize: 12, color: 'var(--error)' }}><Trash2 size={13} /> Delete</button>
          <button onClick={() => setSelected(new Set())} className="btn btn-ghost" style={{ fontSize: 12, marginLeft: 'auto' }}>Clear</button>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p className="text-2" style={{ marginBottom: 16 }}>No tours found</p>
          <Link to="/tours/new" className="btn btn-primary"><Plus size={14} /> Create your first tour</Link>
        </div>
      ) : groupByCity && grouped ? (
        [...grouped.entries()].map(([cityName, cityTours]) => (
          <div key={cityName} style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sand)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={13} /> From {cityName} <span className="text-3" style={{ fontWeight: 400 }}>({cityTours.length})</span>
            </h3>
            <div className="table-wrap">
              <table className="table">
                <tbody>{cityTours.map(t => <TourRow key={t.id} tour={t} />)}</tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={selectAll} /></th>
                <th>Tour</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{filtered.map(t => <TourRow key={t.id} tour={t} />)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
