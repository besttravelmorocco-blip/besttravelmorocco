import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Product, ProductCategory, BookingType, ItineraryDay } from '@/lib/supabase';
import {
  PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS, PRODUCT_CATEGORY_COLORS,
} from '@/lib/supabase';
import { toast } from 'sonner';
import {
  ArrowLeft, Save, Globe, Plus, Trash2, GripVertical,
  AlertCircle, Loader2, Star, Archive, Calendar, Eye,
  Images, X,
} from 'lucide-react';
import MarkdownEditor from '@/components/MarkdownEditor';
import TourFaqsTab from '@/pages/tours/TourFaqsTab';
import SeoPanel, { emptySeoData } from '@/components/SeoPanel';
import type { SeoData, SeoContent } from '@/components/SeoPanel';

const CITIES = ['Marrakech', 'Fes', 'Casablanca', 'Tangier', 'Agadir', 'Errachidia', 'Ouarzazate', 'Essaouira', 'Rabat'];
const TABS = ['Basics', 'Itinerary', 'Inclusions', 'Not Included', 'FAQs', 'SEO'] as const;
type Tab = typeof TABS[number];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface FormState {
  title: string;
  slug: string;
  category: ProductCategory;
  booking_type: BookingType;
  subtitle: string;
  hero_subtitle: string;
  description: string;
  duration_days: number;
  duration_nights: number;
  from_city: string;
  to_city: string;
  price: string;
  price_amount: string;
  deposit_percentage: number;
  images: string[];
  itinerary: ItineraryDay[];
  included: string[];
  not_included: string[];
  highlights: string[];
  min_group_size: string;
  max_group_size: string;
  accommodation_level: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  popular: boolean;
  seo: SeoData;
}

function emptyForm(): FormState {
  return {
    title: '', slug: '', category: 'morocco_tour', booking_type: 'inquiry',
    subtitle: '', hero_subtitle: '', description: '',
    duration_days: 3, duration_nights: 2,
    from_city: 'Marrakech', to_city: 'Marrakech',
    price: 'From €', price_amount: '', deposit_percentage: 30,
    images: [], itinerary: [], included: [], not_included: [], highlights: [],
    min_group_size: '', max_group_size: '', accommodation_level: '',
    status: 'draft', featured: false, popular: false,
    seo: emptySeoData(),
  };
}

function productToForm(p: Product): FormState {
  return {
    title:             p.title,
    slug:              p.slug,
    category:          p.category,
    booking_type:      p.booking_type,
    subtitle:          p.subtitle ?? '',
    hero_subtitle:     p.hero_subtitle ?? '',
    description:       p.description ?? '',
    duration_days:     p.duration_days ?? 3,
    duration_nights:   p.duration_nights ?? 2,
    from_city:         p.from_city ?? 'Marrakech',
    to_city:           p.to_city ?? 'Marrakech',
    price:             p.price ?? 'From €',
    price_amount:      p.price_amount?.toString() ?? '',
    deposit_percentage: p.deposit_percentage,
    images:            p.images ?? [],
    itinerary:         p.itinerary ?? [],
    included:          p.included ?? [],
    not_included:      p.not_included ?? [],
    highlights:        p.highlights ?? [],
    min_group_size:    p.min_group_size?.toString() ?? '',
    max_group_size:    p.max_group_size?.toString() ?? '',
    accommodation_level: p.accommodation_level ?? '',
    status:            p.status,
    featured:          p.featured,
    popular:           p.popular,
    seo: {
      seo_title:          p.seo_title          ?? '',
      seo_description:    p.seo_description    ?? '',
      focus_keyword:      p.focus_keyword       ?? '',
      secondary_keywords: p.seo_keywords        ?? '',
      canonical_url:      p.canonical_url       ?? '',
      og_title:           p.og_title            ?? '',
      og_description:     p.og_description      ?? '',
      og_image:           p.og_image            ?? '',
      twitter_image:      p.twitter_image       ?? '',
      robots_index:       p.robots_index        ?? true,
      robots_follow:      p.robots_follow       ?? true,
    },
  };
}

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isNew  = !id;
  const navigate = useNavigate();

  const [tab, setTab]     = useState<Tab>('Basics');
  const [form, setForm]   = useState<FormState>(emptyForm());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [newImage, setNewImage]       = useState('');
  const [newIncluded, setNewIncluded] = useState('');
  const [newExcluded, setNewExcluded] = useState('');
  const [newHighlight, setNewHighlight] = useState('');

  useEffect(() => {
    if (isNew) return;
    async function load() {
      setLoading(true);
      const { data, error: e } = await supabase.from('products').select('*').eq('id', id!).single();
      if (e || !data) { setError(e?.message ?? 'Product not found'); setLoading(false); return; }
      setForm(productToForm(data as Product));
      setLoading(false);
    }
    load();
  }, [id, isNew]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(v: string) {
    setForm(prev => ({
      ...prev, title: v,
      slug: isNew && (!prev.slug || prev.slug === slugify(prev.title)) ? slugify(v) : prev.slug,
    }));
  }

  // Itinerary helpers
  function addDay() {
    const next = form.itinerary.length + 1;
    set('itinerary', [...form.itinerary, { day: next, title: `Day ${next}`, route: '', desc: '' }]);
  }
  function removeDay(i: number) {
    set('itinerary', form.itinerary.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day: idx + 1 })));
  }
  function updateDay(i: number, field: keyof ItineraryDay, val: string | number) {
    set('itinerary', form.itinerary.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  }

  async function save(nextStatus?: FormState['status']) {
    if (!form.title.trim()) { toast.error('Title is required'); setTab('Basics'); return; }
    if (!form.slug.trim())  { toast.error('Slug is required'); setTab('Basics'); return; }

    setSaving(true);
    const status = nextStatus ?? form.status;

    const payload: Omit<Product, 'created_at'> & { updated_at: string } = {
      id:                isNew ? form.slug.trim() : id!,
      slug:              form.slug.trim(),
      category:          form.category,
      booking_type:      form.booking_type,
      title:             form.title.trim(),
      subtitle:          form.subtitle.trim() || null,
      hero_subtitle:     form.hero_subtitle.trim() || null,
      description:       form.description.trim() || null,
      duration_days:     form.duration_days || null,
      duration_nights:   form.duration_nights || null,
      from_city:         form.from_city || null,
      to_city:           form.to_city || null,
      departure_city:    form.from_city || null,
      price:             form.price || null,
      price_amount:      form.price_amount ? Number(form.price_amount) : null,
      starting_price:    null,
      deposit_percentage: form.deposit_percentage,
      images:            form.images,
      highlights:        form.highlights,
      itinerary:         form.itinerary,
      included:          form.included,
      not_included:      form.not_included,
      min_group_size:    form.min_group_size ? Number(form.min_group_size) : null,
      max_group_size:    form.max_group_size ? Number(form.max_group_size) : null,
      capacity:          form.max_group_size ? Number(form.max_group_size) : null,
      accommodation_level: form.accommodation_level || null,
      seo_title:         form.seo.seo_title || null,
      seo_description:   form.seo.seo_description || null,
      seo_keywords:      form.seo.secondary_keywords || null,
      focus_keyword:     form.seo.focus_keyword || null,
      canonical_url:     form.seo.canonical_url || null,
      og_title:          form.seo.og_title || null,
      og_description:    form.seo.og_description || null,
      og_image:          form.seo.og_image || null,
      twitter_image:     form.seo.twitter_image || null,
      robots_index:      form.seo.robots_index,
      robots_follow:     form.seo.robots_follow,
      status,
      featured:          form.featured,
      popular:           form.popular,
      sort_order:        0,
      updated_at:        new Date().toISOString(),
    };

    try {
      if (isNew) {
        const { data, error: e } = await supabase
          .from('products')
          .insert({ ...payload, created_at: new Date().toISOString() })
          .select()
          .single();
        if (e) throw e;
        toast.success('Product created');
        navigate(`/products/${(data as Product).id}/edit`);
      } else {
        const { error: e } = await supabase.from('products').update(payload).eq('id', id!);
        if (e) throw e;
        toast.success('Saved');
        set('status', status);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const categoryColor = PRODUCT_CATEGORY_COLORS[form.category];
  const categoryLabel = PRODUCT_CATEGORY_LABELS[form.category];

  if (loading) return (
    <div className="page-loading"><div className="spinner" /><p>Loading product…</p></div>
  );
  if (error) return (
    <div className="page-error">
      <AlertCircle size={24} /><p>{error}</p>
      <Link to="/products" className="btn btn-primary"><ArrowLeft size={14} /> Back</Link>
    </div>
  );

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/products" className="btn btn-ghost btn-icon"><ArrowLeft size={16} /></Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="page-title">{isNew ? 'New Product' : form.title || 'Edit Product'}</h1>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', borderRadius: 4, background: `${categoryColor}20`, color: categoryColor, border: `1px solid ${categoryColor}40` }}>
                {categoryLabel}
              </span>
            </div>
            <p className="page-subtitle">
              {isNew ? 'Create a new product' : `/${form.slug} · ${form.booking_type === 'fixed_departure' ? 'Fixed Departure' : 'Inquiry'}`}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isNew && form.booking_type === 'fixed_departure' && (
            <Link to={`/departures?product=${id}`} className="btn btn-outline" style={{ fontSize: 12 }}>
              <Calendar size={13} /> Departures
            </Link>
          )}
          {!isNew && (
            <a
              href={`https://www.besttravelmorocco.com/${form.category === 'morocco_tour' ? 'tours' : form.category.replace(/_/g, '-')}/${id}`}
              target="_blank" rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <Eye size={14} /> Preview
            </a>
          )}
          <button onClick={() => save('draft')} disabled={saving} className="btn btn-outline">
            {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />} Save Draft
          </button>
          <button onClick={() => save('published')} disabled={saving} className="btn btn-primary">
            {saving ? <Loader2 size={14} className="spin" /> : <Globe size={14} />} Publish
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
        {/* Main form */}
        <div>
          <div className="tabs" style={{ marginBottom: 20 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} className={`tab ${tab === t ? 'tab-active' : ''}`}>{t}</button>
            ))}
          </div>

          {/* ── BASICS ─────────────────────────────────────────────────────── */}
          {tab === 'Basics' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Category + Booking type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" value={form.category} onChange={e => set('category', e.target.value as ProductCategory)}>
                    {PRODUCT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{PRODUCT_CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Booking Type *</label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    {(['inquiry', 'fixed_departure'] as BookingType[]).map(bt => (
                      <button
                        key={bt}
                        type="button"
                        onClick={() => set('booking_type', bt)}
                        style={{
                          flex: 1, padding: '8px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          border: `2px solid ${form.booking_type === bt ? categoryColor : 'var(--border)'}`,
                          background: form.booking_type === bt ? `${categoryColor}15` : 'var(--bg-2)',
                          color: form.booking_type === bt ? categoryColor : 'var(--text-2)',
                          cursor: 'pointer',
                        }}
                      >
                        {bt === 'inquiry' ? 'Inquiry' : 'Fixed Departure'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g. 3-Day Sahara Student Adventure" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Slug *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>/</span>
                    <input
                      className="form-input"
                      style={{ fontFamily: 'monospace', fontSize: 12 }}
                      value={form.slug}
                      onChange={e => set('slug', slugify(e.target.value))}
                      placeholder="3-day-sahara-adventure"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration Label</label>
                  <input className="form-input" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="3 DAYS" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Duration (days)</label>
                  <input type="number" min={1} max={60} className="form-input" value={form.duration_days}
                    onChange={e => { const d = +e.target.value; set('duration_days', d); set('duration_nights', Math.max(d - 1, 0)); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">From City</label>
                  <select className="form-input" value={form.from_city} onChange={e => set('from_city', e.target.value)}>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">To City</label>
                  <select className="form-input" value={form.to_city} onChange={e => set('to_city', e.target.value)}>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Price (display)</label>
                  <input className="form-input" value={form.price} onChange={e => set('price', e.target.value)} placeholder="From €490" />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (numeric €)</label>
                  <input type="number" min={0} className="form-input" value={form.price_amount}
                    onChange={e => set('price_amount', e.target.value)} placeholder="490" />
                </div>
                <div className="form-group">
                  <label className="form-label">Deposit %</label>
                  <input type="number" min={0} max={100} className="form-input" value={form.deposit_percentage}
                    onChange={e => set('deposit_percentage', +e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Min Group Size</label>
                  <input type="number" min={1} className="form-input" value={form.min_group_size}
                    onChange={e => set('min_group_size', e.target.value)} placeholder="8" />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Group Size</label>
                  <input type="number" min={1} className="form-input" value={form.max_group_size}
                    onChange={e => set('max_group_size', e.target.value)} placeholder="24" />
                </div>
                <div className="form-group">
                  <label className="form-label">Accommodation Level</label>
                  <select className="form-input" value={form.accommodation_level} onChange={e => set('accommodation_level', e.target.value)}>
                    <option value="">— not specified —</option>
                    <option value="comfort">Comfort</option>
                    <option value="premium">Premium</option>
                    <option value="signature_luxury">Signature Luxury</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Hero Subtitle <span className="text-3" style={{ fontWeight: 400 }}>({form.hero_subtitle.length}/180)</span></label>
                <input
                  className="form-input"
                  value={form.hero_subtitle}
                  onChange={e => set('hero_subtitle', e.target.value)}
                  maxLength={180}
                  placeholder="Short teaser shown under the title in the hero section"
                />
                <div style={{ height: 3, borderRadius: 2, marginTop: 6, background: form.hero_subtitle.length > 160 ? '#EF4444' : form.hero_subtitle.length > 120 ? '#F59E0B' : categoryColor, width: `${Math.min((form.hero_subtitle.length / 180) * 100, 100)}%`, transition: 'width 0.2s, background 0.2s' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Description <span className="text-3" style={{ fontWeight: 400 }}>— supports Markdown</span></label>
                <MarkdownEditor value={form.description} onChange={v => set('description', v)} rows={6} placeholder="Full description of the product experience…" />
              </div>

              {/* Images */}
              <div className="form-group">
                <label className="form-label"><Images size={13} style={{ display: 'inline', marginRight: 4 }} />Images</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    className="form-input"
                    style={{ flex: 1 }}
                    value={newImage}
                    onChange={e => setNewImage(e.target.value)}
                    placeholder="/images/sahara-tour.jpg or https://…"
                    onKeyDown={e => { if (e.key === 'Enter' && newImage.trim()) { set('images', [...form.images, newImage.trim()]); setNewImage(''); e.preventDefault(); } }}
                  />
                  <button className="btn btn-primary" onClick={() => { if (newImage.trim()) { set('images', [...form.images, newImage.trim()]); setNewImage(''); } }}>
                    <Plus size={14} />
                  </button>
                </div>
                {form.images.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {form.images.map((img, i) => (
                      <div key={i} style={{ position: 'relative', width: 90, height: 64, borderRadius: 6, overflow: 'hidden', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0.2'; }} />
                        <button
                          onClick={() => set('images', form.images.filter((_, idx) => idx !== i))}
                          style={{ position: 'absolute', top: 2, right: 2, background: '#00000099', border: 'none', borderRadius: 4, cursor: 'pointer', padding: 2, color: '#fff', display: 'flex' }}
                        >
                          <X size={10} />
                        </button>
                        {i === 0 && <span style={{ position: 'absolute', bottom: 2, left: 4, fontSize: 9, color: '#fff', background: '#00000099', padding: '1px 4px', borderRadius: 3 }}>Cover</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ITINERARY ───────────────────────────────────────────────────── */}
          {tab === 'Itinerary' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 className="card-title">Day-by-Day Itinerary</h3>
                <button onClick={addDay} className="btn btn-outline" style={{ fontSize: 12 }}>
                  <Plus size={13} /> Add Day
                </button>
              </div>
              {form.itinerary.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p className="text-3" style={{ marginBottom: 12 }}>No itinerary days yet</p>
                  <button onClick={addDay} className="btn btn-primary"><Plus size={14} /> Add First Day</button>
                </div>
              ) : (
                <>
                  {form.itinerary.map((day, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <GripVertical size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, color: categoryColor, fontSize: 13, flexShrink: 0 }}>Day {day.day}</span>
                        <input className="form-input" style={{ flex: 1 }} value={day.title} onChange={e => updateDay(i, 'title', e.target.value)} placeholder="Day title" />
                        <button onClick={() => removeDay(i)} className="btn-icon btn-icon-danger"><Trash2 size={13} /></button>
                      </div>
                      <input className="form-input" style={{ marginBottom: 8 }} value={day.route} onChange={e => updateDay(i, 'route', e.target.value)} placeholder="Route (e.g. Marrakech → Ouarzazate → Merzouga)" />
                      <MarkdownEditor value={day.desc} onChange={v => updateDay(i, 'desc', v)} rows={4} placeholder="Day description — supports Markdown…" />
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
                    <button onClick={addDay} className="btn btn-outline" style={{ fontSize: 12 }}><Plus size={13} /> Add Day</button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── INCLUSIONS ──────────────────────────────────────────────────── */}
          {tab === 'Inclusions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 12 }}>Highlights</h3>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input className="form-input" style={{ flex: 1 }} value={newHighlight} onChange={e => setNewHighlight(e.target.value)} placeholder="e.g. Camel trek in Erg Chebbi" onKeyDown={e => { if (e.key === 'Enter' && newHighlight.trim()) { set('highlights', [...form.highlights, newHighlight.trim()]); setNewHighlight(''); e.preventDefault(); } }} />
                  <button className="btn btn-primary" onClick={() => { if (newHighlight.trim()) { set('highlights', [...form.highlights, newHighlight.trim()]); setNewHighlight(''); } }}><Plus size={14} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {form.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-2)', borderRadius: 6, padding: '6px 10px' }}>
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--text-1)' }}>• {h}</span>
                      <button onClick={() => set('highlights', form.highlights.filter((_, idx) => idx !== i))} className="btn-icon btn-icon-danger" style={{ padding: 2 }}><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 12 }}>What's Included</h3>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input className="form-input" style={{ flex: 1 }} value={newIncluded} onChange={e => setNewIncluded(e.target.value)} placeholder="e.g. Transport in 4x4 with A/C" onKeyDown={e => { if (e.key === 'Enter' && newIncluded.trim()) { set('included', [...form.included, newIncluded.trim()]); setNewIncluded(''); e.preventDefault(); } }} />
                  <button className="btn btn-primary" onClick={() => { if (newIncluded.trim()) { set('included', [...form.included, newIncluded.trim()]); setNewIncluded(''); } }}><Plus size={14} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {form.included.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-2)', borderRadius: 6, padding: '6px 10px' }}>
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--text-1)' }}>✓ {item}</span>
                      <button onClick={() => set('included', form.included.filter((_, idx) => idx !== i))} className="btn-icon btn-icon-danger" style={{ padding: 2 }}><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── NOT INCLUDED ────────────────────────────────────────────────── */}
          {tab === 'Not Included' && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 12 }}>Not Included</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input className="form-input" style={{ flex: 1 }} value={newExcluded} onChange={e => setNewExcluded(e.target.value)} placeholder="e.g. Lunches (allow €8-15 per day)" onKeyDown={e => { if (e.key === 'Enter' && newExcluded.trim()) { set('not_included', [...form.not_included, newExcluded.trim()]); setNewExcluded(''); e.preventDefault(); } }} />
                <button className="btn btn-primary" onClick={() => { if (newExcluded.trim()) { set('not_included', [...form.not_included, newExcluded.trim()]); setNewExcluded(''); } }}><Plus size={14} /></button>
              </div>
              {form.not_included.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '8px 0' }}>No exclusions yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {form.not_included.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-2)', borderRadius: 6, padding: '6px 10px' }}>
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--text-1)' }}>✗ {item}</span>
                      <button onClick={() => set('not_included', form.not_included.filter((_, idx) => idx !== i))} className="btn-icon btn-icon-danger" style={{ padding: 2 }}><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── FAQs ────────────────────────────────────────────────────────── */}
          {tab === 'FAQs' && <TourFaqsTab tourId={id} />}

          {/* ── SEO ─────────────────────────────────────────────────────────── */}
          {tab === 'SEO' && (() => {
            const seoContent: SeoContent = {
              title:       form.title,
              description: form.description,
              slug:        form.slug,
              contentType: 'product',
              days:        form.duration_days,
              fromCity:    form.from_city,
              price:       form.price,
            };
            return (
              <SeoPanel
                value={form.seo}
                onChange={(seo: SeoData) => set('seo', seo)}
                content={seoContent}
              />
            );
          })()}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
          <div className="card">
            <h4 className="card-title" style={{ marginBottom: 12 }}>Publish</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => save('published')} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {saving ? <Loader2 size={14} className="spin" /> : <Globe size={14} />} Publish
              </button>
              <button onClick={() => save('draft')} disabled={saving} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                <Save size={14} /> Save Draft
              </button>
              {!isNew && (
                <button onClick={() => save('archived')} disabled={saving} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12, color: 'var(--text-3)' }}>
                  <Archive size={13} /> Archive
                </button>
              )}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="text-3" style={{ fontSize: 12 }}>Status</span>
                <span className={`badge badge-${form.status === 'published' ? 'success' : form.status === 'draft' ? 'warning' : 'error'}`}>{form.status}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 className="card-title" style={{ marginBottom: 12 }}>Options</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} style={{ width: 16, height: 16 }} />
                <Star size={14} style={{ color: form.featured ? '#FBBF24' : 'var(--text-3)' }} fill={form.featured ? '#FBBF24' : 'none'} />
                Featured
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={form.popular} onChange={e => set('popular', e.target.checked)} style={{ width: 16, height: 16 }} />
                <span style={{ fontSize: 14 }}>🔥</span>
                Popular
              </label>
            </div>
          </div>

          {form.booking_type === 'fixed_departure' && !isNew && (
            <div className="card" style={{ borderColor: '#F9731640' }}>
              <h4 className="card-title" style={{ marginBottom: 8, color: '#F97316' }}><Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />Departures</h4>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>Manage fixed departure dates, seats, and payment links for this product.</p>
              <Link to={`/departures?product=${id}`} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: 12, borderColor: '#F9731640', color: '#F97316' }}>
                <Calendar size={12} /> Manage Departures
              </Link>
            </div>
          )}

          <div className="card">
            <h4 className="card-title" style={{ marginBottom: 10 }}>Summary</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              {[
                ['Category', PRODUCT_CATEGORY_LABELS[form.category]],
                ['Booking', form.booking_type === 'fixed_departure' ? 'Fixed Departure' : 'Inquiry'],
                ['Duration', `${form.duration_days} days`],
                ['Price', form.price || '—'],
                ['Deposit', `${form.deposit_percentage}%`],
                ['Highlights', `${form.highlights.length}`],
                ['Itinerary', `${form.itinerary.length} days`],
                ['Inclusions', `${form.included.length}`],
                ['Exclusions', `${form.not_included.length}`],
                ['Images', `${form.images.length}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-3">{k}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
