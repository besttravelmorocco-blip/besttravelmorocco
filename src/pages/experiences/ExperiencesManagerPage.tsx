import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  ExperienceProduct, ExperienceType, DepartureType, PricingModel,
  ExperienceItineraryBlock,
} from '@/lib/supabase';
import { EXPERIENCE_TYPE_LABELS, EXPERIENCE_TYPE_COLORS } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Plus, RefreshCw, AlertCircle, X, Save, Edit2, Trash2,
  Search, Calendar, DollarSign, Users, ChevronDown, ChevronRight,
  Leaf, Globe, GraduationCap, Eye, EyeOff, Lock,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const ACCOMMODATION_LEVELS = ['Boutique', 'Luxury', 'Signature', 'Budget-friendly', 'Camping'];

// Type enforces pricing_model and departure_type automatically
const TYPE_PRESETS: Record<ExperienceType, { pricing_model: PricingModel; departure_type: DepartureType; booking_cta: string }> = {
  yoga_retreat:  { pricing_model: 'fixed',    departure_type: 'fixed_dates',     booking_cta: 'Book Retreat' },
  upcoming_trip: { pricing_model: 'fixed',    departure_type: 'fixed_dates',     booking_cta: 'Join Departure' },
  student_trip:  { pricing_model: 'flexible', departure_type: 'flexible_window', booking_cta: 'Request Group Offer' },
};

const TYPE_ICONS: Record<ExperienceType, React.FC<{ size?: number; style?: React.CSSProperties }>> = {
  yoga_retreat:  ({ size = 14, style }) => <Leaf size={size} style={style} />,
  upcoming_trip: ({ size = 14, style }) => <Globe size={size} style={style} />,
  student_trip:  ({ size = 14, style }) => <GraduationCap size={size} style={style} />,
};

// ─── Form state ───────────────────────────────────────────────────────────────

type ExpTab = 'core' | 'schedule' | 'pricing' | 'content' | 'media';

interface ExpForm {
  type: ExperienceType;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  description: string;
  duration_days: string;
  duration_nights: string;
  departure_type: DepartureType;
  pricing_model: PricingModel;
  price_per_person: string;
  starting_price: string;
  capacity: string;
  min_group_size: string;
  max_group_size: string;
  accommodation_level: string;
  // Array fields
  highlights: string[];
  included: string[];
  excluded: string[];
  images: string[];
  fixed_departures: string[];
  flexible_months: string[];
  itinerary: ExperienceItineraryBlock[];
  // Temp inputs
  _newHighlight: string;
  _newIncluded: string;
  _newExcluded: string;
  _newImage: string;
  _newDate: string;
}

function emptyForm(): ExpForm {
  return {
    type: 'yoga_retreat',
    title: '', slug: '', status: 'draft', description: '',
    duration_days: '', duration_nights: '',
    departure_type: 'fixed_dates', pricing_model: 'fixed',
    price_per_person: '', starting_price: '',
    capacity: '', min_group_size: '', max_group_size: '',
    accommodation_level: '',
    highlights: [], included: [], excluded: [], images: [],
    fixed_departures: [], flexible_months: [], itinerary: [],
    _newHighlight: '', _newIncluded: '', _newExcluded: '', _newImage: '', _newDate: '',
  };
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-|-$/g, '');
}

function applyTypePreset(form: ExpForm, type: ExperienceType): ExpForm {
  const p = TYPE_PRESETS[type];
  return { ...form, type, pricing_model: p.pricing_model, departure_type: p.departure_type };
}

function productToForm(p: ExperienceProduct): ExpForm {
  return {
    type: p.type, title: p.title, slug: p.slug, status: p.status,
    description: p.description ?? '',
    duration_days: p.duration_days?.toString() ?? '',
    duration_nights: p.duration_nights?.toString() ?? '',
    departure_type: p.departure_type, pricing_model: p.pricing_model,
    price_per_person: p.price_per_person?.toString() ?? '',
    starting_price: p.starting_price?.toString() ?? '',
    capacity: p.capacity?.toString() ?? '',
    min_group_size: p.min_group_size?.toString() ?? '',
    max_group_size: p.max_group_size?.toString() ?? '',
    accommodation_level: p.accommodation_level ?? '',
    highlights: p.highlights ?? [],
    included: p.included ?? [],
    excluded: p.excluded ?? [],
    images: p.images ?? [],
    fixed_departures: (p.fixed_departures ?? []).map(d => d.slice(0, 10)),
    flexible_months: p.flexible_months ?? [],
    itinerary: p.itinerary ?? [],
    _newHighlight: '', _newIncluded: '', _newExcluded: '', _newImage: '', _newDate: '',
  };
}

function formToPayload(f: ExpForm) {
  return {
    type: f.type,
    title: f.title.trim(),
    slug: f.slug.trim(),
    status: f.status,
    description: f.description.trim() || null,
    duration_days: f.duration_days ? Number(f.duration_days) : null,
    duration_nights: f.duration_nights ? Number(f.duration_nights) : null,
    departure_type: f.departure_type,
    pricing_model: f.pricing_model,
    price_per_person: f.price_per_person ? Number(f.price_per_person) : null,
    starting_price: f.starting_price ? Number(f.starting_price) : null,
    capacity: f.capacity ? Number(f.capacity) : null,
    min_group_size: f.min_group_size ? Number(f.min_group_size) : null,
    max_group_size: f.max_group_size ? Number(f.max_group_size) : null,
    accommodation_level: f.accommodation_level || null,
    highlights: f.highlights,
    included: f.included,
    excluded: f.excluded,
    images: f.images,
    fixed_departures: f.fixed_departures.filter(Boolean),
    flexible_months: f.flexible_months,
    itinerary: f.itinerary,
    updated_at: new Date().toISOString(),
  };
}

// ─── Chips component ──────────────────────────────────────────────────────────

function ChipList({
  items, onRemove, emptyText,
}: { items: string[]; onRemove: (i: number) => void; emptyText?: string }) {
  if (items.length === 0 && emptyText) {
    return <p style={{ fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic', margin: '4px 0' }}>{emptyText}</p>;
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px' }}>
          {item}
          <button onClick={() => onRemove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-3)', lineHeight: 1, display: 'flex' }}>
            <X size={10} />
          </button>
        </span>
      ))}
    </div>
  );
}

// ─── Type badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: ExperienceType }) {
  const color = EXPERIENCE_TYPE_COLORS[type];
  const Icon = TYPE_ICONS[type];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color, background: `${color}20`, padding: '2px 7px', borderRadius: 5 }}>
      <Icon size={9} /> {EXPERIENCE_TYPE_LABELS[type]}
    </span>
  );
}

// ─── Itinerary builder ────────────────────────────────────────────────────────

function ItineraryBuilder({
  days, onChange,
}: { days: ExperienceItineraryBlock[]; onChange: (d: ExperienceItineraryBlock[]) => void }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  function add() {
    const next = [...days, { day: days.length + 1, title: '', description: '' }];
    onChange(next);
    setExpanded(days.length);
  }

  function remove(i: number) {
    const next = days.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day: idx + 1 }));
    onChange(next);
    setExpanded(null);
  }

  function update(i: number, k: keyof ExperienceItineraryBlock, v: string | number) {
    const next = days.map((d, idx) => idx === i ? { ...d, [k]: v } : d);
    onChange(next);
  }

  return (
    <div>
      {days.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic', marginBottom: 8 }}>
          No itinerary added yet. Click "+ Add Day" to begin.
        </p>
      )}
      {days.map((day, i) => (
        <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, marginBottom: 6, overflow: 'hidden' }}>
          <div
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer', background: 'var(--bg-2)' }}
          >
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--sand)', minWidth: 40 }}>Day {day.day}</span>
            <span style={{ flex: 1, fontSize: 12, color: day.title ? 'var(--text-1)' : 'var(--text-3)', fontStyle: day.title ? 'normal' : 'italic' }}>
              {day.title || 'Untitled day…'}
            </span>
            {expanded === i ? <ChevronDown size={12} style={{ color: 'var(--text-3)' }} /> : <ChevronRight size={12} style={{ color: 'var(--text-3)' }} />}
            <button onClick={e => { e.stopPropagation(); remove(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2, display: 'flex' }}>
              <X size={12} />
            </button>
          </div>
          {expanded === i && (
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                className="form-input"
                style={{ fontSize: 12 }}
                value={day.title}
                onChange={e => update(i, 'title', e.target.value)}
                placeholder="Day title (e.g. Arrival & Welcome Circle)"
              />
              <textarea
                className="form-input"
                style={{ fontSize: 12, resize: 'vertical' }}
                rows={3}
                value={day.description}
                onChange={e => update(i, 'description', e.target.value)}
                placeholder="What happens this day…"
              />
            </div>
          )}
        </div>
      ))}
      <button onClick={add} className="btn btn-outline" style={{ fontSize: 11, marginTop: 4 }}>
        <Plus size={11} /> Add Day
      </button>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function ExperienceModal({
  editing, form, setForm, saving, onSave, onClose,
}: {
  editing: ExperienceProduct | null;
  form: ExpForm;
  setForm: React.Dispatch<React.SetStateAction<ExpForm>>;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<ExpTab>('core');
  const f = form;
  const set = <K extends keyof ExpForm>(k: K, v: ExpForm[K]) => setForm(p => ({ ...p, [k]: v }));

  const typeColor = EXPERIENCE_TYPE_COLORS[f.type];
  const preset   = TYPE_PRESETS[f.type];

  // Auto-set slug when title changes (only for new)
  function handleTitle(v: string) {
    setForm(p => ({ ...p, title: v, slug: editing ? p.slug : slugify(v) }));
  }

  // Auto-lock departure_type and pricing_model when type changes
  function handleType(v: ExperienceType) {
    setForm(p => applyTypePreset(p, v));
  }

  const tabs: { key: ExpTab; label: string }[] = [
    { key: 'core', label: 'Core' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'content', label: 'Content' },
    { key: 'media', label: 'Media' },
  ];

  const tabStyle = (t: ExpTab) => ({
    padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12,
    fontWeight: 700, letterSpacing: '.04em',
    color: tab === t ? typeColor : 'var(--text-3)',
    borderBottom: `2px solid ${tab === t ? typeColor : 'transparent'}`,
    transition: 'all .15s',
  });

  const label = (text: string) => <label className="form-label" style={{ marginBottom: 4 }}>{text}</label>;

  const lockedBadge = (text: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: typeColor, background: `${typeColor}18`, padding: '4px 10px', borderRadius: 6, marginTop: 4 }}>
      <Lock size={10} /> <span style={{ fontWeight: 600 }}>{text}</span> <span style={{ color: 'var(--text-3)' }}>(auto-set by type)</span>
    </div>
  );

  // Array helpers
  function addChip(key: 'highlights' | 'included' | 'excluded' | 'images' | 'fixed_departures', tmpKey: keyof ExpForm) {
    const val = String(f[tmpKey]).trim();
    if (!val) return;
    set(key, [...(f[key] as string[]), val]);
    set(tmpKey, '' as ExpForm[typeof tmpKey]);
  }

  function removeChip(key: 'highlights' | 'included' | 'excluded' | 'images' | 'fixed_departures', i: number) {
    set(key, (f[key] as string[]).filter((_, idx) => idx !== i));
  }

  function toggleMonth(month: string) {
    set('flexible_months', f.flexible_months.includes(month)
      ? f.flexible_months.filter(m => m !== month)
      : [...f.flexible_months, month]);
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, width: '100%', maxWidth: 660, maxHeight: '93vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.55)' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${typeColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {(() => { const Icon = TYPE_ICONS[f.type]; return <Icon size={18} style={{ color: typeColor }} />; })()}
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{editing ? 'Edit Experience' : 'New Experience'}</h3>
              {editing && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{EXPERIENCE_TYPE_LABELS[f.type]} · {f.slug}</p>}
            </div>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0, paddingLeft: 6 }}>
          {tabs.map(t => <button key={t.key} style={tabStyle(t.key)} onClick={() => setTab(t.key)}>{t.label}</button>)}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

          {/* ── CORE ─────────────────────────────────────────────────────────── */}
          {tab === 'core' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Type selector */}
              <div>
                {label('Experience Type *')}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 4 }}>
                  {(['yoga_retreat', 'upcoming_trip', 'student_trip'] as ExperienceType[]).map(t => {
                    const color = EXPERIENCE_TYPE_COLORS[t];
                    const Icon = TYPE_ICONS[t];
                    const active = f.type === t;
                    return (
                      <button
                        key={t}
                        onClick={() => handleType(t)}
                        style={{
                          border: `2px solid ${active ? color : 'var(--border)'}`,
                          borderRadius: 10, padding: '12px 8px', cursor: 'pointer',
                          background: active ? `${color}14` : 'var(--bg-2)',
                          transition: 'all .15s', textAlign: 'center',
                        }}
                      >
                        <Icon size={20} style={{ color: active ? color : 'var(--text-3)', margin: '0 auto 6px' }} />
                        <div style={{ fontSize: 11, fontWeight: 700, color: active ? color : 'var(--text-2)', letterSpacing: '.04em' }}>
                          {EXPERIENCE_TYPE_LABELS[t]}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
                          {t === 'yoga_retreat' && 'Fixed price · Retreat dates'}
                          {t === 'upcoming_trip' && 'Fixed price · Join departure'}
                          {t === 'student_trip' && 'Flexible quote · Group inquiry'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  {label('Title *')}
                  <input className="form-input" value={f.title} onChange={e => handleTitle(e.target.value)} placeholder="e.g. Sahara Sunrise Yoga Retreat" autoFocus />
                </div>
                <div>
                  {label('Slug (URL key) *')}
                  <input className="form-input" style={{ fontFamily: 'monospace', fontSize: 12 }} value={f.slug} onChange={e => set('slug', e.target.value)} placeholder="sahara-sunrise-yoga-retreat" />
                </div>
                <div>
                  {label('Status')}
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    {(['draft', 'published'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => set('status', s)}
                        className={`btn ${f.status === s ? 'btn-primary' : 'btn-outline'}`}
                        style={{ fontSize: 12, flex: 1, gap: 5 }}
                      >
                        {s === 'draft' ? <EyeOff size={12} /> : <Eye size={12} />}
                        {s === 'draft' ? 'Draft' : 'Published'}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  {label('Description')}
                  <textarea className="form-input" rows={4} style={{ resize: 'vertical' }} value={f.description} onChange={e => set('description', e.target.value)} placeholder={
                    f.type === 'yoga_retreat' ? 'Evoke serenity, healing, and transformation…' :
                    f.type === 'upcoming_trip' ? 'Describe this journey, its highlights and unique character…' :
                    'Describe the educational / group experience…'
                  } />
                </div>
              </div>
            </div>
          )}

          {/* ── SCHEDULE ─────────────────────────────────────────────────────── */}
          {tab === 'schedule' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  {label('Duration (Days)')}
                  <input className="form-input" type="number" min="1" value={f.duration_days} onChange={e => set('duration_days', e.target.value)} placeholder="7" />
                </div>
                <div>
                  {label('Duration (Nights)')}
                  <input className="form-input" type="number" min="0" value={f.duration_nights} onChange={e => set('duration_nights', e.target.value)} placeholder="6" />
                </div>
              </div>

              <div>
                {label('Departure Type')}
                {lockedBadge(f.departure_type === 'fixed_dates' ? 'Fixed Dates — specific departure calendar' : 'Flexible Window — month-based availability')}
              </div>

              {/* Fixed dates section (yoga + upcoming) */}
              {f.departure_type === 'fixed_dates' && (
                <div>
                  {label('Departure Dates')}
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <input
                      className="form-input"
                      type="date"
                      style={{ flex: 1 }}
                      value={f._newDate}
                      onChange={e => set('_newDate', e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip('fixed_departures', '_newDate'); } }}
                    />
                    <button
                      className="btn btn-outline"
                      onClick={() => addChip('fixed_departures', '_newDate')}
                      style={{ fontSize: 12, flexShrink: 0 }}
                    >
                      <Plus size={13} /> Add
                    </button>
                  </div>
                  {f.fixed_departures.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                      {[...f.fixed_departures].sort().map((d, i) => (
                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, background: `${typeColor}18`, color: typeColor, border: `1px solid ${typeColor}40`, borderRadius: 6, padding: '3px 9px', fontWeight: 600 }}>
                          <Calendar size={10} />
                          {new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          <button onClick={() => removeChip('fixed_departures', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: typeColor, lineHeight: 1, display: 'flex' }}><X size={9} /></button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, fontStyle: 'italic' }}>No dates added yet.</p>
                  )}
                </div>
              )}

              {/* Flexible months section (student) */}
              {f.departure_type === 'flexible_window' && (
                <div>
                  {label('Available Months (optional)')}
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>Select which months this experience can run.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {ALL_MONTHS.map(month => {
                      const active = f.flexible_months.includes(month);
                      return (
                        <button
                          key={month}
                          onClick={() => toggleMonth(month)}
                          style={{
                            padding: '7px 4px', fontSize: 11, fontWeight: active ? 700 : 400,
                            border: `1px solid ${active ? typeColor : 'var(--border)'}`,
                            background: active ? `${typeColor}18` : 'var(--bg-2)',
                            color: active ? typeColor : 'var(--text-2)',
                            borderRadius: 6, cursor: 'pointer', transition: 'all .1s',
                          }}
                        >
                          {month.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                  {f.flexible_months.length > 0 && (
                    <p style={{ fontSize: 11, color: typeColor, marginTop: 6, fontWeight: 600 }}>
                      {f.flexible_months.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── PRICING ──────────────────────────────────────────────────────── */}
          {tab === 'pricing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                {label('Pricing Model')}
                {lockedBadge(
                  f.pricing_model === 'fixed'
                    ? `Fixed Price — €${f.price_per_person || 'X'} per person, no negotiation`
                    : `Flexible / Quote — starts from €${f.starting_price || 'X'}, inquiry required`
                )}
              </div>

              {/* Fixed pricing (yoga + upcoming) */}
              {f.pricing_model === 'fixed' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    {label('Price Per Person (€) *')}
                    <div style={{ position: 'relative' }}>
                      <DollarSign size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                      <input className="form-input" style={{ paddingLeft: 30 }} type="number" min="0" value={f.price_per_person} onChange={e => set('price_per_person', e.target.value)} placeholder="890" />
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                      CTA on public page: <strong style={{ color: typeColor }}>{TYPE_PRESETS[f.type].booking_cta}</strong> — no "starting from"
                    </p>
                  </div>
                  <div>
                    {label('Max Capacity')}
                    <input className="form-input" type="number" min="1" value={f.capacity} onChange={e => set('capacity', e.target.value)} placeholder="12" />
                  </div>
                  <div>
                    {label('Accommodation Level')}
                    <select className="form-input" value={f.accommodation_level} onChange={e => set('accommodation_level', e.target.value)}>
                      <option value="">— Select —</option>
                      {ACCOMMODATION_LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Flexible pricing (student) */}
              {f.pricing_model === 'flexible' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    {label('Starting From (€) *')}
                    <div style={{ position: 'relative' }}>
                      <DollarSign size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                      <input className="form-input" style={{ paddingLeft: 30 }} type="number" min="0" value={f.starting_price} onChange={e => set('starting_price', e.target.value)} placeholder="299" />
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                      Displayed as <strong>"Starting from €{f.starting_price || 'X'}"</strong> — CTA: <strong style={{ color: typeColor }}>Request Group Offer</strong>
                    </p>
                  </div>
                  <div>
                    {label('Min Group Size')}
                    <div style={{ position: 'relative' }}>
                      <Users size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                      <input className="form-input" style={{ paddingLeft: 30 }} type="number" min="1" value={f.min_group_size} onChange={e => set('min_group_size', e.target.value)} placeholder="10" />
                    </div>
                  </div>
                  <div>
                    {label('Max Group Size')}
                    <div style={{ position: 'relative' }}>
                      <Users size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                      <input className="form-input" style={{ paddingLeft: 30 }} type="number" min="1" value={f.max_group_size} onChange={e => set('max_group_size', e.target.value)} placeholder="40" />
                    </div>
                  </div>
                  <div>
                    {label('Accommodation Level')}
                    <select className="form-input" value={f.accommodation_level} onChange={e => set('accommodation_level', e.target.value)}>
                      <option value="">— Flexible (depends on quote) —</option>
                      {ACCOMMODATION_LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    {label('Max Capacity')}
                    <input className="form-input" type="number" min="1" value={f.capacity} onChange={e => set('capacity', e.target.value)} placeholder="Optional hard cap" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CONTENT ──────────────────────────────────────────────────────── */}
          {tab === 'content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Highlights */}
              <div>
                {label('Highlights')}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" style={{ flex: 1, fontSize: 12 }} value={f._newHighlight} onChange={e => set('_newHighlight', e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip('highlights', '_newHighlight'); } }}
                    placeholder="e.g. Daily sunrise yoga with Sahara views" />
                  <button className="btn btn-outline" onClick={() => addChip('highlights', '_newHighlight')} style={{ fontSize: 12, flexShrink: 0 }}><Plus size={12} /></button>
                </div>
                <ChipList items={f.highlights} onRemove={i => removeChip('highlights', i)} emptyText="No highlights yet — add key selling points." />
              </div>

              {/* Included */}
              <div>
                {label('What\'s Included')}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" style={{ flex: 1, fontSize: 12 }} value={f._newIncluded} onChange={e => set('_newIncluded', e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip('included', '_newIncluded'); } }}
                    placeholder="e.g. All meals · Airport transfers" />
                  <button className="btn btn-outline" onClick={() => addChip('included', '_newIncluded')} style={{ fontSize: 12, flexShrink: 0 }}><Plus size={12} /></button>
                </div>
                <ChipList items={f.included} onRemove={i => removeChip('included', i)} emptyText="Nothing added yet." />
              </div>

              {/* Excluded */}
              <div>
                {label('What\'s Not Included')}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" style={{ flex: 1, fontSize: 12 }} value={f._newExcluded} onChange={e => set('_newExcluded', e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip('excluded', '_newExcluded'); } }}
                    placeholder="e.g. International flights" />
                  <button className="btn btn-outline" onClick={() => addChip('excluded', '_newExcluded')} style={{ fontSize: 12, flexShrink: 0 }}><Plus size={12} /></button>
                </div>
                <ChipList items={f.excluded} onRemove={i => removeChip('excluded', i)} emptyText="Nothing added yet." />
              </div>

              {/* Itinerary */}
              <div>
                {label('Itinerary (optional)')}
                <ItineraryBuilder
                  days={f.itinerary}
                  onChange={d => set('itinerary', d)}
                />
              </div>
            </div>
          )}

          {/* ── MEDIA ────────────────────────────────────────────────────────── */}
          {tab === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                {label('Images (Supabase Storage or external URLs)')}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" style={{ flex: 1, fontSize: 12 }} value={f._newImage} onChange={e => set('_newImage', e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip('images', '_newImage'); } }}
                    placeholder="https://…" />
                  <button className="btn btn-outline" onClick={() => addChip('images', '_newImage')} style={{ fontSize: 12, flexShrink: 0 }}><Plus size={12} /></button>
                </div>
                {f.images.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 10 }}>
                    {f.images.map((url, i) => (
                      <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', height: 80, background: 'var(--bg-2)' }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0.2'; }} />
                        <button
                          onClick={() => removeChip('images', i)}
                          style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.6)', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#fff', padding: 3, display: 'flex' }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, fontStyle: 'italic' }}>No images added yet.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, background: tab === t.key ? typeColor : 'var(--border)', transition: 'background .15s' }}
                aria-label={t.label}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} className="btn btn-outline">Cancel</button>
            <button onClick={onSave} disabled={saving} className="btn btn-primary" style={{ background: typeColor, borderColor: typeColor }}>
              <Save size={13} /> {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Experience'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const TYPE_TABS: { key: 'all' | ExperienceType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'yoga_retreat',  label: 'Yoga Retreats' },
  { key: 'upcoming_trip', label: 'Upcoming Trips' },
  { key: 'student_trip',  label: 'Student Trips' },
];

export default function ExperiencesManagerPage() {
  const [items, setItems] = useState<ExperienceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ExperienceType>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ExperienceProduct | null>(null);
  const [form, setForm] = useState<ExpForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    const { data, error: e } = await supabase
      .from('experience_products')
      .select('*')
      .order('type')
      .order('title');
    if (e) { setError(e.message); setLoading(false); return; }
    setItems((data ?? []) as ExperienceProduct[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openAdd(defaultType?: ExperienceType) {
    const base = emptyForm();
    const t = defaultType ?? 'yoga_retreat';
    setEditing(null);
    setForm(applyTypePreset(base, t));
    setShowModal(true);
  }

  function openEdit(p: ExperienceProduct) {
    setEditing(p);
    setForm(productToForm(p));
    setShowModal(true);
  }

  async function saveForm() {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.slug.trim()) { toast.error('Slug is required'); return; }
    setSaving(true);
    const payload = formToPayload(form);
    if (editing) {
      const { data, error: e } = await supabase.from('experience_products').update(payload).eq('id', editing.id).select().single();
      setSaving(false);
      if (e) { toast.error(e.message); return; }
      setItems(p => p.map(x => x.id === editing.id ? data as ExperienceProduct : x));
      toast.success('Experience updated');
    } else {
      const { data, error: e } = await supabase.from('experience_products').insert(payload).select().single();
      setSaving(false);
      if (e) { toast.error(e.message); return; }
      setItems(p => [...p, data as ExperienceProduct]);
      toast.success('Experience created');
    }
    setShowModal(false);
  }

  async function del(p: ExperienceProduct) {
    if (!confirm(`Delete "${p.title}"?`)) return;
    const { error: e } = await supabase.from('experience_products').delete().eq('id', p.id);
    if (e) { toast.error(e.message); return; }
    setItems(prev => prev.filter(x => x.id !== p.id));
    toast.success('Deleted');
  }

  async function toggleStatus(p: ExperienceProduct) {
    const next = p.status === 'published' ? 'draft' : 'published';
    const { error: e } = await supabase.from('experience_products').update({ status: next, updated_at: new Date().toISOString() }).eq('id', p.id);
    if (e) { toast.error(e.message); return; }
    setItems(prev => prev.map(x => x.id === p.id ? { ...x, status: next } : x));
    toast.success(next === 'published' ? 'Published' : 'Reverted to draft');
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(p => {
      const matchType   = typeFilter === 'all' || p.type === typeFilter;
      const matchSearch = !q || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [items, typeFilter, search]);

  const counts = useMemo(() => ({
    all:           items.length,
    yoga_retreat:  items.filter(p => p.type === 'yoga_retreat').length,
    upcoming_trip: items.filter(p => p.type === 'upcoming_trip').length,
    student_trip:  items.filter(p => p.type === 'student_trip').length,
  }), [items]);

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading experiences…</p></div>;
  if (error)   return <div className="page-error"><AlertCircle size={24} /><p>{error}</p><button className="btn btn-primary" onClick={load}><RefreshCw size={14} /> Retry</button></div>;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Experiences Manager</h1>
          <p className="page-subtitle">
            {counts.all} experience{counts.all !== 1 ? 's' : ''} ·{' '}
            {counts.yoga_retreat} yoga retreat{counts.yoga_retreat !== 1 ? 's' : ''} ·{' '}
            {counts.upcoming_trip} upcoming trip{counts.upcoming_trip !== 1 ? 's' : ''} ·{' '}
            {counts.student_trip} student program{counts.student_trip !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} className="btn btn-outline"><RefreshCw size={14} /></button>
          <button onClick={() => openAdd(typeFilter !== 'all' ? typeFilter : undefined)} className="btn btn-primary">
            <Plus size={15} /> New Experience
          </button>
        </div>
      </div>

      {/* Type stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {(['yoga_retreat', 'upcoming_trip', 'student_trip'] as ExperienceType[]).map(type => {
          const color = EXPERIENCE_TYPE_COLORS[type];
          const Icon = TYPE_ICONS[type];
          const count = counts[type];
          const published = items.filter(p => p.type === type && p.status === 'published').length;
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
              className="stat-card"
              style={{ cursor: 'pointer', textAlign: 'left', borderColor: typeFilter === type ? color : undefined, borderWidth: typeFilter === type ? 2 : 1 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.1 }}>{count}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{EXPERIENCE_TYPE_LABELS[type]}</div>
                  <div style={{ fontSize: 10, color, marginTop: 3, fontWeight: 600 }}>{published} published</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search + type filter row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-input-wrap" style={{ flex: '1 1 220px', minWidth: 180 }}>
          <Search size={14} />
          <input type="text" placeholder="Search title, slug…" value={search} onChange={e => setSearch(e.target.value)} className="form-input search-input" />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {TYPE_TABS.map(t => {
            const color = t.key !== 'all' ? EXPERIENCE_TYPE_COLORS[t.key] : undefined;
            const active = typeFilter === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTypeFilter(t.key)}
                className={active ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ fontSize: 12, ...(color && active ? { background: color, borderColor: color } : {}) }}
              >
                {t.label} <span style={{ fontSize: 10, opacity: .7, marginLeft: 2 }}>({counts[t.key]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 52 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✦</div>
          <p className="text-2" style={{ fontWeight: 600, marginBottom: 6 }}>
            {search ? `No experiences matching "${search}"` : 'No experiences yet'}
          </p>
          <p className="text-3" style={{ fontSize: 12, marginBottom: 20 }}>
            Create yoga retreats, upcoming group trips, and student programs.
          </p>
          {!search && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {(['yoga_retreat', 'upcoming_trip', 'student_trip'] as ExperienceType[]).map(type => {
                const color = EXPERIENCE_TYPE_COLORS[type];
                const Icon = TYPE_ICONS[type];
                return (
                  <button key={type} onClick={() => openAdd(type)} className="btn btn-outline" style={{ fontSize: 12, borderColor: color, color }}>
                    <Icon size={12} /> {EXPERIENCE_TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-1)' }}>
                {['Experience', 'Type', 'Status', 'Pricing', 'Schedule', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const color  = EXPERIENCE_TYPE_COLORS[p.type];
                const Icon   = TYPE_ICONS[p.type];
                const preset = TYPE_PRESETS[p.type];
                const daysLabel = p.duration_days ? `${p.duration_days}D${p.duration_nights ? ` / ${p.duration_nights}N` : ''}` : null;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', opacity: p.status === 'draft' ? .65 : 1 }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace', marginTop: 2 }}>{p.slug}</div>
                      {daysLabel && <div style={{ fontSize: 10, color, marginTop: 2, fontWeight: 600 }}>{daysLabel}</div>}
                    </td>
                    <td style={{ padding: '12px 14px' }}><TypeBadge type={p.type} /></td>
                    <td style={{ padding: '12px 14px' }}>
                      <button
                        onClick={() => toggleStatus(p)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600,
                          color: p.status === 'published' ? '#10B981' : 'var(--text-3)',
                          background: p.status === 'published' ? '#10B98118' : 'var(--bg-2)',
                          border: `1px solid ${p.status === 'published' ? '#10B98140' : 'var(--border)'}`,
                          borderRadius: 5, padding: '3px 8px', cursor: 'pointer'
                        }}
                      >
                        {p.status === 'published' ? <Eye size={10} /> : <EyeOff size={10} />}
                        {p.status === 'published' ? 'Live' : 'Draft'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {p.pricing_model === 'fixed' ? (
                        <div style={{ fontSize: 12 }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-1)' }}>€{p.price_per_person ?? '—'} <span style={{ fontWeight: 400, color: 'var(--text-3)', fontSize: 10 }}>/person</span></div>
                          <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{preset.booking_cta}</div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 12 }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-1)' }}>From €{p.starting_price ?? '—'}</div>
                          <div style={{ fontSize: 10, color, marginTop: 2, fontWeight: 600 }}>
                            {p.min_group_size && p.max_group_size ? `${p.min_group_size}–${p.max_group_size} pax` : 'Group inquiry'}
                          </div>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', maxWidth: 180 }}>
                      {p.departure_type === 'fixed_dates' ? (
                        <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
                          {p.fixed_departures.length > 0 ? (
                            <>
                              {p.fixed_departures.slice(0, 2).map((d, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-3)' }}>
                                  <Calendar size={9} />
                                  {new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                              ))}
                              {p.fixed_departures.length > 2 && (
                                <div style={{ fontSize: 10, color, fontWeight: 600 }}>+{p.fixed_departures.length - 2} more</div>
                              )}
                            </>
                          ) : (
                            <span style={{ color: 'var(--text-3)', fontStyle: 'italic', fontSize: 10 }}>No dates set</span>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                          {p.flexible_months.length > 0
                            ? p.flexible_months.map(m => m.slice(0, 3)).join(' · ')
                            : <span style={{ fontStyle: 'italic' }}>Flexible window</span>}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => openEdit(p)} className="btn-icon" title="Edit"><Edit2 size={13} /></button>
                        <button onClick={() => del(p)} className="btn-icon btn-icon-danger" title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick-add per type buttons (footer) */}
      {items.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {(['yoga_retreat', 'upcoming_trip', 'student_trip'] as ExperienceType[]).map(type => {
            const color = EXPERIENCE_TYPE_COLORS[type];
            const Icon = TYPE_ICONS[type];
            return (
              <button key={type} onClick={() => openAdd(type)} className="btn btn-outline" style={{ fontSize: 11, borderColor: `${color}50`, color }}>
                <Icon size={11} /> New {EXPERIENCE_TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ExperienceModal
          editing={editing}
          form={form}
          setForm={setForm}
          saving={saving}
          onSave={saveForm}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
