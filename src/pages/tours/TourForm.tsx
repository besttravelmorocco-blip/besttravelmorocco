import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Tour, TourStatus, ItineraryDay } from '@/lib/supabase';
import { parseTourItinerary, parseTourIncluded, parseTourHighlights } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  ArrowLeft, Save, Globe, Eye, Plus, Trash2,
  GripVertical, AlertCircle, Loader2, Star, Archive
} from 'lucide-react';

const CITIES = ['Marrakech', 'Fes', 'Casablanca', 'Tangier', 'Agadir', 'Errachidia', 'Ouarzazate', 'Essaouira', 'Rabat'];
const TABS = ['Basics', 'Itinerary', 'Inclusions', 'SEO'] as const;
type Tab = typeof TABS[number];

interface FormState {
  title: string;
  subtitle: string;
  description: string;
  days: number;
  from_city: string;
  to_city: string;
  price: string;
  image: string;
  status: TourStatus;
  featured: boolean;
  itinerary: ItineraryDay[];
  included: string[];
  highlights: string[];
  seo_title: string;
  seo_description: string;
}

function emptyForm(): FormState {
  return {
    title: '', subtitle: '', description: '', days: 3,
    from_city: 'Marrakech', to_city: 'Marrakech',
    price: 'From €', image: '', status: 'draft', featured: false,
    itinerary: [], included: [], highlights: [],
    seo_title: '', seo_description: '',
  };
}

export default function TourForm() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('Basics');
  const [form, setForm] = useState<FormState>(emptyForm());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Temp input values for array fields
  const [newIncluded, setNewIncluded] = useState('');
  const [newHighlight, setNewHighlight] = useState('');

  useEffect(() => {
    if (isNew) return;
    async function load() {
      setLoading(true);
      const { data, error: e } = await supabase.from('tours').select('*').eq('id', id!).single();
      if (e || !data) { setError(e?.message ?? 'Tour not found'); setLoading(false); return; }
      const t = data as Tour;
      setForm({
        title: t.title, subtitle: t.subtitle, description: t.description,
        days: t.days, from_city: t.from_city, to_city: t.to_city,
        price: t.price, image: t.image, status: t.status, featured: t.featured,
        itinerary: parseTourItinerary(t),
        included: parseTourIncluded(t),
        highlights: parseTourHighlights(t),
        seo_title: '', seo_description: '',
      });
      setLoading(false);
    }
    load();
  }, [id, isNew]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // Itinerary helpers
  function addDay() {
    const next = form.itinerary.length + 1;
    set('itinerary', [...form.itinerary, { day: next, title: `Day ${next}`, route: '', desc: '' }]);
  }
  function removeDay(i: number) { set('itinerary', form.itinerary.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day: idx + 1 }))); }
  function updateDay(i: number, field: keyof ItineraryDay, val: string | number) {
    set('itinerary', form.itinerary.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  }

  async function save(nextStatus?: TourStatus) {
    if (!form.title.trim()) { toast.error('Title is required'); setTab('Basics'); return; }
    if (!form.from_city) { toast.error('Departure city is required'); setTab('Basics'); return; }

    setSaving(true);
    const status = nextStatus ?? form.status;
    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle || `${form.days} DAYS`,
      description: form.description.trim(),
      days: form.days,
      from_city: form.from_city,
      to_city: form.to_city || form.from_city,
      price: form.price,
      image: form.image,
      status,
      featured: form.featured,
      itinerary: JSON.stringify(form.itinerary),
      included: JSON.stringify(form.included),
      highlights: JSON.stringify(form.highlights),
      updated_at: new Date().toISOString(),
    };

    try {
      if (isNew) {
        const { data, error: e } = await supabase.from('tours').insert({ ...payload, id: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), created_at: new Date().toISOString() }).select().single();
        if (e) throw e;
        toast.success('Tour created');
        navigate(`/tours/${(data as Tour).id}/edit`);
      } else {
        const { error: e } = await supabase.from('tours').update(payload).eq('id', id!);
        if (e) throw e;
        toast.success('Tour saved');
        set('status', status);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading tour…</p></div>;
  if (error) return (
    <div className="page-error">
      <AlertCircle size={24} /><p>{error}</p>
      <Link to="/tours" className="btn btn-primary"><ArrowLeft size={14} /> Back</Link>
    </div>
  );

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/tours" className="btn btn-ghost btn-icon"><ArrowLeft size={16} /></Link>
          <div>
            <h1 className="page-title">{isNew ? 'New Tour' : form.title || 'Edit Tour'}</h1>
            <p className="page-subtitle">{isNew ? 'Create a new tour' : `${form.from_city} → ${form.to_city} · ${form.days} days`}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isNew && <a href={`https://www.besttravelmorocco.com/tours/${id}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline"><Eye size={14} /> Preview</a>}
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
          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 20 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} className={`tab ${tab === t ? 'tab-active' : ''}`}>{t}</button>
            ))}
          </div>

          {tab === 'Basics' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Tour Title *</label>
                <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. The Sahara in 3 Days" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Duration (days) *</label>
                  <input type="number" min={1} max={30} className="form-input" value={form.days} onChange={e => set('days', +e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">From City *</label>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Price</label>
                  <input className="form-input" value={form.price} onChange={e => set('price', e.target.value)} placeholder="From €490" />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration Label</label>
                  <input className="form-input" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="3 DAYS" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the tour experience…" style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Featured Image Path</label>
                <input className="form-input" value={form.image} onChange={e => set('image', e.target.value)} placeholder="/images/tour_sahara.jpg" />
                {form.image && (
                  <div style={{ marginTop: 8, height: 120, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-2)' }}>
                    <img src={form.image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'Itinerary' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 className="card-title">Day-by-Day Itinerary</h3>
                <button onClick={addDay} className="btn btn-outline" style={{ fontSize: 12 }}><Plus size={13} /> Add Day</button>
              </div>
              {form.itinerary.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p className="text-3" style={{ marginBottom: 12 }}>No itinerary days yet</p>
                  <button onClick={addDay} className="btn btn-primary"><Plus size={14} /> Add First Day</button>
                </div>
              ) : form.itinerary.map((day, i) => (
                <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <GripVertical size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, color: 'var(--sand)', fontSize: 13, flexShrink: 0 }}>Day {day.day}</span>
                    <input className="form-input" style={{ flex: 1 }} value={day.title} onChange={e => updateDay(i, 'title', e.target.value)} placeholder="Day title" />
                    <button onClick={() => removeDay(i)} className="btn-icon btn-icon-danger"><Trash2 size={13} /></button>
                  </div>
                  <input className="form-input" style={{ marginBottom: 8 }} value={day.route} onChange={e => updateDay(i, 'route', e.target.value)} placeholder="Route (e.g. Marrakech → Ouarzazate → Merzouga)" />
                  <textarea className="form-input" rows={3} value={day.desc} onChange={e => updateDay(i, 'desc', e.target.value)} placeholder="Day description…" style={{ resize: 'vertical' }} />
                </div>
              ))}
            </div>
          )}

          {tab === 'Inclusions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Highlights */}
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 12 }}>Tour Highlights</h3>
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

              {/* Included */}
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

          {tab === 'SEO' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">SEO Title <span className="text-3" style={{ fontWeight: 400 }}>({form.seo_title.length}/60)</span></label>
                <input className="form-input" value={form.seo_title} onChange={e => set('seo_title', e.target.value)} maxLength={60} placeholder={`${form.days} Day ${form.title} from ${form.from_city} | Best Travel Morocco`} />
                <div style={{ height: 3, borderRadius: 2, marginTop: 6, background: form.seo_title.length > 55 ? '#EF4444' : form.seo_title.length > 45 ? '#F59E0B' : 'var(--sand)', width: `${Math.min((form.seo_title.length / 60) * 100, 100)}%`, transition: 'width 0.2s, background 0.2s' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Meta Description <span className="text-3" style={{ fontWeight: 400 }}>({form.seo_description.length}/160)</span></label>
                <textarea className="form-input" rows={3} value={form.seo_description} onChange={e => set('seo_description', e.target.value)} maxLength={160} placeholder={form.description.slice(0, 160)} style={{ resize: 'none' }} />
              </div>
              {/* Google Preview */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
                <p className="text-3" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Google Preview</p>
                <div style={{ color: '#1a0dab', fontSize: 18, marginBottom: 2 }}>{form.seo_title || `${form.days} Day ${form.title} from ${form.from_city} | Best Travel Morocco`}</div>
                <div style={{ color: '#006621', fontSize: 13, marginBottom: 4 }}>besttravelmorocco.com › tours › {id ?? 'new-tour'}</div>
                <div style={{ color: '#545454', fontSize: 14, lineHeight: 1.5 }}>{form.seo_description || form.description.slice(0, 160)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
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
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} style={{ width: 16, height: 16 }} />
              <Star size={14} style={{ color: form.featured ? '#FBBF24' : 'var(--text-3)' }} fill={form.featured ? '#FBBF24' : 'none'} />
              Featured tour
            </label>
          </div>

          <div className="card">
            <h4 className="card-title" style={{ marginBottom: 10 }}>Summary</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              {[
                ['From', form.from_city], ['To', form.to_city],
                ['Duration', `${form.days} days`], ['Price', form.price],
                ['Highlights', `${form.highlights.length}`],
                ['Itinerary days', `${form.itinerary.length}`],
                ['Inclusions', `${form.included.length}`],
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
