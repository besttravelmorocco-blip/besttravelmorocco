import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Product, ProductCategory, BookingType } from '@/lib/supabase';
import {
  PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS, PRODUCT_CATEGORY_COLORS,
} from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Plus, Search, Globe, Archive, Star, Calendar, Users,
  Edit2, Trash2, ChevronDown, Filter,
} from 'lucide-react';

const ALL_STATUSES = ['all', 'published', 'draft', 'archived'] as const;
const ALL_BOOKING  = ['all', 'inquiry', 'fixed_departure'] as const;

export default function ProductsPage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [catFilter, setCatFilter] = useState<'all' | ProductCategory>('all');
  const [statusFilter, setStatusFilter] = useState<typeof ALL_STATUSES[number]>('all');
  const [bookingFilter, setBookingFilter] = useState<typeof ALL_BOOKING[number]>('all');
  const [deleting, setDeleting]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) { toast.error(error.message); setLoading(false); return; }
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleStatus(p: Product) {
    const next = p.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase
      .from('products')
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq('id', p.id);
    if (error) { toast.error(error.message); return; }
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: next } : x));
    toast.success(next === 'published' ? 'Published' : 'Set to draft');
  }

  async function del(p: Product) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    setDeleting(p.id);
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) { toast.error(error.message); setDeleting(null); return; }
    setProducts(prev => prev.filter(x => x.id !== p.id));
    toast.success('Product deleted');
    setDeleting(null);
  }

  const filtered = products.filter(p => {
    if (catFilter !== 'all' && p.category !== catFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (bookingFilter !== 'all' && p.booking_type !== bookingFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const counts = PRODUCT_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat).length;
    return acc;
  }, {} as Record<ProductCategory, number>);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">
            {products.length} products · {products.filter(p => p.status === 'published').length} published
          </p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          <Plus size={14} /> New Product
        </Link>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        <button
          onClick={() => setCatFilter('all')}
          className={`tab ${catFilter === 'all' ? 'tab-active' : ''}`}
        >
          All ({products.length})
        </button>
        {PRODUCT_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={`tab ${catFilter === cat ? 'tab-active' : ''}`}
            style={catFilter === cat ? { borderColor: PRODUCT_CATEGORY_COLORS[cat], color: PRODUCT_CATEGORY_COLORS[cat] } : {}}
          >
            {PRODUCT_CATEGORY_LABELS[cat]} ({counts[cat]})
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 32 }}
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} style={{ paddingRight: 28, minWidth: 130 }}>
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }} />
        </div>
        <div style={{ position: 'relative' }}>
          <select className="form-input" value={bookingFilter} onChange={e => setBookingFilter(e.target.value as typeof bookingFilter)} style={{ paddingRight: 28, minWidth: 160 }}>
            <option value="all">All Booking Types</option>
            <option value="inquiry">Inquiry</option>
            <option value="fixed_departure">Fixed Departure</option>
          </select>
          <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }} />
        </div>
        <button onClick={load} className="btn btn-outline" style={{ fontSize: 12 }}>
          <Filter size={13} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p className="text-3">Loading products…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 0' }}>
          <p className="text-3" style={{ marginBottom: 12 }}>
            {search || catFilter !== 'all' || statusFilter !== 'all' ? 'No products match your filters.' : 'No products yet.'}
          </p>
          <Link to="/products/new" className="btn btn-primary"><Plus size={14} /> Create First Product</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {filtered.map(p => (
            <ProductRow
              key={p.id}
              product={p}
              onToggle={toggleStatus}
              onDelete={del}
              deleting={deleting === p.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductRow({
  product: p,
  onToggle,
  onDelete,
  deleting,
}: {
  product: Product;
  onToggle: (p: Product) => void;
  onDelete: (p: Product) => void;
  deleting: boolean;
}) {
  const color  = PRODUCT_CATEGORY_COLORS[p.category];
  const catLabel = PRODUCT_CATEGORY_LABELS[p.category];
  const image  = p.images?.[0] ?? null;

  return (
    <div
      className="card"
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
        opacity: p.status === 'archived' ? 0.55 : 1,
      }}
    >
      {/* Thumbnail */}
      <div style={{ width: 56, height: 40, borderRadius: 6, overflow: 'hidden', background: 'var(--bg-2)', flexShrink: 0 }}>
        {image ? (
          <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 18 }}>✦</div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 300 }}>
            {p.title}
          </span>
          {/* Category badge */}
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 7px', borderRadius: 4, background: `${color}20`, color, border: `1px solid ${color}40`, whiteSpace: 'nowrap' }}>
            {catLabel}
          </span>
          {/* Booking type */}
          {p.booking_type === 'fixed_departure' && (
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 7px', borderRadius: 4, background: '#F9731620', color: '#F97316', border: '1px solid #F9731640', whiteSpace: 'nowrap' }}>
              <Calendar size={9} style={{ display: 'inline', marginRight: 3 }} />Fixed Departure
            </span>
          )}
          {p.featured && <Star size={12} style={{ color: '#FBBF24', flexShrink: 0 }} fill="#FBBF24" />}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 3, fontSize: 11, color: 'var(--text-3)', flexWrap: 'wrap' }}>
          {p.duration_days && <span>{p.duration_days} days</span>}
          {p.from_city && <span>from {p.from_city}</span>}
          {p.price && <span style={{ color: 'var(--sand)' }}>{p.price}</span>}
          {p.max_group_size && <span><Users size={10} style={{ display: 'inline', marginRight: 2 }} />max {p.max_group_size}</span>}
          <span style={{ fontFamily: 'monospace', opacity: 0.6 }}>{p.slug}</span>
        </div>
      </div>

      {/* Status + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span className={`badge badge-${p.status === 'published' ? 'success' : p.status === 'draft' ? 'warning' : 'error'}`} style={{ fontSize: 11 }}>
          {p.status}
        </span>
        <button
          onClick={() => onToggle(p)}
          className="btn btn-outline"
          style={{ fontSize: 11, padding: '4px 10px' }}
          title={p.status === 'published' ? 'Unpublish' : 'Publish'}
        >
          {p.status === 'published' ? <Archive size={11} /> : <Globe size={11} />}
          {p.status === 'published' ? 'Unpublish' : 'Publish'}
        </button>
        <Link
          to={`/products/${p.id}/edit`}
          className="btn btn-outline"
          style={{ fontSize: 11, padding: '4px 10px' }}
        >
          <Edit2 size={11} /> Edit
        </Link>
        <button
          onClick={() => onDelete(p)}
          disabled={deleting}
          className="btn-icon btn-icon-danger"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
