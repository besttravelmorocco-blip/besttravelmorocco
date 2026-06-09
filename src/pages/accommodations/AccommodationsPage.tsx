import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Accommodation, AccomCategory } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Plus, RefreshCw, AlertCircle, X, Save, Edit2, Trash2,
  Building2, Phone, Mail, Star, Search, ChevronDown, ChevronRight,
  MapPin, ExternalLink, Download,
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const PRESET_DESTINATIONS = [
  'Marrakech', 'Casablanca', 'Rabat', 'Fes', 'Chefchaouen', 'Meknes',
  'Essaouira', 'Ouarzazate', 'Aït Ben Haddou', 'Skoura', 'Dades Valley',
  'Todra Gorge', 'Merzouga', 'Midelt', 'Ifrane', 'Errachidia',
  'Agadir', 'Tangier', 'Asilah', 'El Jadida',
];

const TYPES = ['riad', 'hotel', 'kasbah', 'camp', 'villa', 'resort'] as const;
const TYPE_LABELS: Record<string, string> = {
  riad: 'Riad', hotel: 'Hotel', kasbah: 'Kasbah',
  camp: 'Camp', villa: 'Villa', resort: 'Resort',
};
const TYPE_COLORS: Record<string, string> = {
  riad: '#C9A96E', hotel: '#60A5FA', kasbah: '#A78BFA',
  camp: '#F59E0B', villa: '#34D399', resort: '#F472B6',
};
const CAT_LABELS: Record<AccomCategory, string> = { standard: 'Standard', luxury: 'Luxury' };
const CAT_COLORS: Record<AccomCategory, string> = { standard: '#60A5FA', luxury: '#C9A96E' };

// ─── Form state ───────────────────────────────────────────────────────────────

type ModalTab = 'property' | 'contact' | 'pricing' | 'media';

interface AccomForm {
  destination: string;
  customDest: string;
  category: AccomCategory;
  type: string;
  name: string;
  stars: string;
  description: string;
  is_active: boolean;
  contact_person: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  website: string;
  google_maps_link: string;
  low_season_rate: string;
  mid_season_rate: string;
  contracted_single_rate: string;
  peak_season_rate: string;
  contracted_double_rate: string;
  contracted_triple_rate: string;
  double_room_rate: string;
  family_room_rate: string;
  extra_bed_rate: string;
  child_policy: string;
  photo_url: string;
  amenities: string;
  notes: string;
}

const emptyForm = (): AccomForm => ({
  destination: 'Marrakech', customDest: '', category: 'standard', type: 'riad',
  name: '', stars: '', description: '', is_active: true,
  contact_person: '', contact_name: '', contact_phone: '', contact_email: '',
  address: '', website: '', google_maps_link: '',
  low_season_rate: '', mid_season_rate: '', contracted_single_rate: '', peak_season_rate: '',
  contracted_double_rate: '', contracted_triple_rate: '', double_room_rate: '', family_room_rate: '',
  extra_bed_rate: '', child_policy: '',
  photo_url: '', amenities: '', notes: '',
});

function formToPayload(f: AccomForm) {
  const dest = f.destination === '__other__' ? f.customDest.trim() : f.destination;
  return {
    destination: dest || 'Unknown',
    category: f.category,
    type: f.type,
    name: f.name.trim(),
    city: dest || null,
    address: f.address.trim() || null,
    stars: f.stars ? Number(f.stars) : null,
    description: f.description.trim() || null,
    is_active: f.is_active,
    contact_person: f.contact_person.trim() || null,
    contact_name: f.contact_name.trim() || null,
    contact_phone: f.contact_phone.trim() || null,
    contact_email: f.contact_email.trim() || null,
    website: f.website.trim() || null,
    google_maps_link: f.google_maps_link.trim() || null,
    low_season_rate: f.low_season_rate ? Number(f.low_season_rate) : null,
    mid_season_rate: f.mid_season_rate ? Number(f.mid_season_rate) : null,
    contracted_single_rate: f.contracted_single_rate ? Number(f.contracted_single_rate) : null,
    peak_season_rate: f.peak_season_rate ? Number(f.peak_season_rate) : null,
    contracted_double_rate: f.contracted_double_rate ? Number(f.contracted_double_rate) : null,
    contracted_triple_rate: f.contracted_triple_rate ? Number(f.contracted_triple_rate) : null,
    double_room_rate: f.double_room_rate ? Number(f.double_room_rate) : null,
    family_room_rate: f.family_room_rate ? Number(f.family_room_rate) : null,
    extra_bed_rate: f.extra_bed_rate ? Number(f.extra_bed_rate) : null,
    child_policy: f.child_policy.trim() || null,
    photo_url: f.photo_url.trim() || null,
    amenities: f.amenities.split(',').map(a => a.trim()).filter(Boolean),
    notes: f.notes.trim() || null,
    updated_at: new Date().toISOString(),
  };
}

function accomToForm(a: Accommodation): AccomForm {
  const isPreset = PRESET_DESTINATIONS.includes(a.destination);
  return {
    destination: isPreset ? a.destination : '__other__',
    customDest: isPreset ? '' : a.destination,
    category: (a.category as AccomCategory) || 'standard',
    type: a.type,
    name: a.name,
    stars: a.stars?.toString() ?? '',
    description: a.description ?? '',
    is_active: a.is_active,
    contact_person: a.contact_person ?? '',
    contact_name: a.contact_name ?? '',
    contact_phone: a.contact_phone ?? '',
    contact_email: a.contact_email ?? '',
    address: a.address ?? '',
    website: a.website ?? '',
    google_maps_link: a.google_maps_link ?? '',
    low_season_rate: a.low_season_rate?.toString() ?? '',
    mid_season_rate: a.mid_season_rate?.toString() ?? '',
    contracted_single_rate: a.contracted_single_rate?.toString() ?? '',
    peak_season_rate: a.peak_season_rate?.toString() ?? '',
    contracted_double_rate: a.contracted_double_rate?.toString() ?? '',
    contracted_triple_rate: a.contracted_triple_rate?.toString() ?? '',
    double_room_rate: a.double_room_rate?.toString() ?? '',
    family_room_rate: a.family_room_rate?.toString() ?? '',
    extra_bed_rate: a.extra_bed_rate?.toString() ?? '',
    child_policy: a.child_policy ?? '',
    photo_url: a.photo_url ?? '',
    amenities: (a.amenities ?? []).join(', '),
    notes: a.notes ?? '',
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AccomRow({
  a, onEdit, onDelete,
}: { a: Accommodation; onEdit: () => void; onDelete: () => void }) {
  const typeColor = TYPE_COLORS[a.type] ?? 'var(--sand)';
  const contact = a.contact_person || a.contact_name;
  const stdRate = a.contracted_single_rate;
  const dblRate = a.contracted_double_rate ?? a.double_room_rate;

  return (
    <tr style={{ borderBottom: '1px solid var(--border)', opacity: a.is_active ? 1 : 0.45 }}>
      <td style={{ padding: '11px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
            color: typeColor, background: `${typeColor}22`, padding: '2px 6px', borderRadius: 4,
            flexShrink: 0,
          }}>
            {TYPE_LABELS[a.type] ?? a.type}
          </span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{a.name}</div>
            {a.stars ? (
              <div style={{ display: 'flex', gap: 1, marginTop: 2 }}>
                {Array.from({ length: a.stars }, (_, i) => (
                  <Star key={i} size={8} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </td>
      <td style={{ padding: '11px 14px' }}>
        <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
          {[stdRate ? `SGL €${stdRate}` : null, dblRate ? `DBL €${dblRate}` : null].filter(Boolean).join(' · ') || <span style={{ color: 'var(--text-3)' }}>—</span>}
        </div>
        {(a.low_season_rate || a.mid_season_rate || a.peak_season_rate) && (
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
            {[
              a.low_season_rate ? `Low €${a.low_season_rate}` : null,
              a.mid_season_rate ? `Mid €${a.mid_season_rate}` : null,
              a.peak_season_rate ? `Peak €${a.peak_season_rate}` : null,
            ].filter(Boolean).join(' · ')}
          </div>
        )}
      </td>
      <td style={{ padding: '11px 14px' }}>
        {contact || a.contact_phone || a.contact_email ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {contact && <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{contact}</div>}
            {a.contact_phone && (
              <a href={`tel:${a.contact_phone}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-3)', textDecoration: 'none' }}>
                <Phone size={9} />{a.contact_phone}
              </a>
            )}
            {a.contact_email && (
              <a href={`mailto:${a.contact_email}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-3)', textDecoration: 'none' }}>
                <Mail size={9} />{a.contact_email}
              </a>
            )}
          </div>
        ) : <span style={{ color: 'var(--text-3)', fontSize: 12 }}>—</span>}
      </td>
      <td style={{ padding: '11px 14px' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={onEdit} className="btn-icon" title="Edit"><Edit2 size={13} /></button>
          <button onClick={onDelete} className="btn-icon btn-icon-danger" title="Delete"><Trash2 size={13} /></button>
        </div>
      </td>
    </tr>
  );
}

function CategorySection({
  cat, items, onEdit, onDelete, onAddHere,
}: {
  cat: AccomCategory;
  items: Accommodation[];
  onEdit: (a: Accommodation) => void;
  onDelete: (a: Accommodation) => void;
  onAddHere: () => void;
}) {
  const color = CAT_COLORS[cat];
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: `${color}12`, borderLeft: `3px solid ${color}` }}>
        <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color }}>{CAT_LABELS[cat]}</span>
        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>({items.length})</span>
        <button
          onClick={onAddHere}
          style={{ marginLeft: 'auto', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: `1px solid ${color}44`, borderRadius: 4, padding: '2px 8px', cursor: 'pointer', color }}
        >
          <Plus size={10} /> Add {CAT_LABELS[cat]}
        </button>
      </div>
      {items.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {items.map(a => (
              <AccomRow key={a.id} a={a} onEdit={() => onEdit(a)} onDelete={() => onDelete(a)} />
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>
          No {CAT_LABELS[cat].toLowerCase()} accommodations yet. Click "+ Add {CAT_LABELS[cat]}" above.
        </div>
      )}
    </div>
  );
}

function DestinationGroup({
  destination, items, onEdit, onDelete, onAddHere,
}: {
  destination: string;
  items: Accommodation[];
  onEdit: (a: Accommodation) => void;
  onDelete: (a: Accommodation) => void;
  onAddHere: (cat: AccomCategory) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const standard = items.filter(a => a.category === 'standard');
  const luxury = items.filter(a => a.category === 'luxury');

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
      <button
        onClick={() => setCollapsed(p => !p)}
        style={{
          width: '100%', padding: '12px 16px', background: 'var(--bg-2)', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        {collapsed ? <ChevronRight size={14} style={{ color: 'var(--text-3)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-3)' }} />}
        <MapPin size={13} style={{ color: 'var(--sand)', flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', textAlign: 'left' }}>{destination}</span>
        <div style={{ marginLeft: 8, display: 'flex', gap: 6 }}>
          {standard.length > 0 && (
            <span style={{ fontSize: 10, background: '#60A5FA22', color: '#60A5FA', padding: '2px 7px', borderRadius: 10, fontWeight: 600 }}>
              {standard.length} Standard
            </span>
          )}
          {luxury.length > 0 && (
            <span style={{ fontSize: 10, background: '#C9A96E22', color: '#C9A96E', padding: '2px 7px', borderRadius: 10, fontWeight: 600 }}>
              {luxury.length} Luxury
            </span>
          )}
        </div>
      </button>

      {!collapsed && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 200px 80px', padding: '6px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-1)' }}>
            {['Property', 'Rates (€/night)', 'Contact', ''].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-3)' }}>{h}</div>
            ))}
          </div>
          <CategorySection cat="standard" items={standard} onEdit={onEdit} onDelete={onDelete} onAddHere={() => onAddHere('standard')} />
          <CategorySection cat="luxury" items={luxury} onEdit={onEdit} onDelete={onDelete} onAddHere={() => onAddHere('luxury')} />
        </div>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function AccomModal({
  editing, form, setForm, saving, onSave, onClose, allDestinations,
}: {
  editing: Accommodation | null;
  form: AccomForm;
  setForm: React.Dispatch<React.SetStateAction<AccomForm>>;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
  allDestinations: string[];
}) {
  const [tab, setTab] = useState<ModalTab>('property');
  const f = form;
  const set = <K extends keyof AccomForm>(k: K, v: AccomForm[K]) => setForm(p => ({ ...p, [k]: v }));
  const inp = (style?: React.CSSProperties) => ({ className: 'form-input', style });

  const tabStyle = (t: ModalTab) => ({
    padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 700, letterSpacing: '.04em',
    color: tab === t ? 'var(--sand)' : 'var(--text-3)',
    borderBottom: `2px solid ${tab === t ? 'var(--sand)' : 'transparent'}`,
    transition: 'all .15s',
  });

  const label = (text: string) => (
    <label className="form-label" style={{ marginBottom: 4 }}>{text}</label>
  );
  const field = (child: React.ReactNode, col?: '1/-1') => (
    <div style={col ? { gridColumn: col } : {}}>{child}</div>
  );

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, width: '100%', maxWidth: 640, maxHeight: '94vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.55)' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>{editing ? 'Edit Property' : 'Add Property'}</h3>
            {editing && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{editing.destination} · {CAT_LABELS[editing.category as AccomCategory]}</p>}
          </div>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0, paddingLeft: 8 }}>
          {(['property', 'contact', 'pricing', 'media'] as ModalTab[]).map(t => (
            <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

          {/* ── Property tab ── */}
          {tab === 'property' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {field(
                <>
                  {label('Destination *')}
                  <select {...inp()} value={f.destination} onChange={e => set('destination', e.target.value)}>
                    {allDestinations.map(d => <option key={d}>{d}</option>)}
                    <option value="__other__">+ Other (type below)</option>
                  </select>
                </>,
              )}
              {f.destination === '__other__' && field(
                <>
                  {label('Custom Destination')}
                  <input {...inp()} value={f.customDest} onChange={e => set('customDest', e.target.value)} placeholder="e.g. Boumalne Dadès" />
                </>,
              )}
              {field(
                <>
                  {label('Category *')}
                  <select {...inp()} value={f.category} onChange={e => set('category', e.target.value as AccomCategory)}>
                    <option value="standard">Standard</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </>,
              )}
              {field(
                <>
                  {label('Type *')}
                  <select {...inp()} value={f.type} onChange={e => set('type', e.target.value)}>
                    {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                  </select>
                </>,
              )}
              {field(
                <>
                  {label('Name *')}
                  <input {...inp()} value={f.name} onChange={e => set('name', e.target.value)} placeholder="Riad Maison Bleue" autoFocus />
                </>,
                '1/-1',
              )}
              {field(
                <>
                  {label('Stars')}
                  <select {...inp()} value={f.stars} onChange={e => set('stars', e.target.value)}>
                    <option value="">—</option>
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} ★</option>)}
                  </select>
                </>,
              )}
              {field(
                <>
                  {label('Active')}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 8, fontSize: 13 }}>
                    <input type="checkbox" checked={f.is_active} onChange={e => set('is_active', e.target.checked)} style={{ width: 14, height: 14 }} />
                    Visible / available
                  </label>
                </>,
              )}
              {field(
                <>
                  {label('Description')}
                  <textarea {...inp({ resize: 'vertical' })} rows={3} value={f.description} onChange={e => set('description', e.target.value)} placeholder="Brief description of the property…" />
                </>,
                '1/-1',
              )}
            </div>
          )}

          {/* ── Contact tab ── */}
          {tab === 'contact' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {field(<>{label('Contact Person')}<input {...inp()} value={f.contact_person} onChange={e => set('contact_person', e.target.value)} placeholder="Mohamed" /></>)}
              {field(<>{label('Contact Name (alt)')}<input {...inp()} value={f.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Reservation Manager" /></>)}
              {field(<>{label('Phone')}<input {...inp()} value={f.contact_phone} onChange={e => set('contact_phone', e.target.value)} placeholder="+212 524 000 000" /></>)}
              {field(<>{label('Email')}<input {...inp()} type="email" value={f.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="reservations@riad.ma" /></>)}
              {field(<>{label('Address')}<input {...inp()} value={f.address} onChange={e => set('address', e.target.value)} placeholder="12 Derb Zitoun, Medina" /></>, '1/-1')}
              {field(
                <>
                  {label('Website')}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input {...inp({ flex: 1 })} value={f.website} onChange={e => set('website', e.target.value)} placeholder="https://riad-example.com" />
                    {f.website && <a href={f.website} target="_blank" rel="noopener noreferrer" className="btn-icon"><ExternalLink size={13} /></a>}
                  </div>
                </>,
                '1/-1',
              )}
              {field(
                <>
                  {label('Google Maps Link')}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input {...inp({ flex: 1 })} value={f.google_maps_link} onChange={e => set('google_maps_link', e.target.value)} placeholder="https://maps.google.com/…" />
                    {f.google_maps_link && <a href={f.google_maps_link} target="_blank" rel="noopener noreferrer" className="btn-icon"><ExternalLink size={13} /></a>}
                  </div>
                </>,
                '1/-1',
              )}
            </div>
          )}

          {/* ── Pricing tab ── */}
          {tab === 'pricing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--sand)', marginBottom: 10 }}>Seasonal Rates (€ per room per night)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                  {([
                    ['low_season_rate', 'Low Season'],
                    ['mid_season_rate', 'Mid Season'],
                    ['contracted_single_rate', 'High Season'],
                    ['peak_season_rate', 'Peak Season'],
                  ] as const).map(([key, lbl]) => (
                    <div key={key}>
                      {label(lbl)}
                      <input {...inp()} type="number" min="0" value={f[key]} onChange={e => set(key, e.target.value)} placeholder="0" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--sand)', marginBottom: 10 }}>Room Type Rates (€ per night)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                  {([
                    ['contracted_single_rate', 'Single'],
                    ['contracted_double_rate', 'Double'],
                    ['contracted_triple_rate', 'Triple'],
                    ['family_room_rate', 'Family'],
                  ] as const).map(([key, lbl]) => (
                    <div key={key}>
                      {label(lbl)}
                      <input {...inp()} type="number" min="0" value={f[key]} onChange={e => set(key, e.target.value)} placeholder="0" />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  {label('Extra Bed Rate (€/night)')}
                  <input {...inp()} type="number" min="0" value={f.extra_bed_rate} onChange={e => set('extra_bed_rate', e.target.value)} placeholder="0" />
                </div>
                <div>
                  {label('Child Policy')}
                  <input {...inp()} value={f.child_policy} onChange={e => set('child_policy', e.target.value)} placeholder="Under 6 free, 6-12 50%" />
                </div>
              </div>
            </div>
          )}

          {/* ── Media tab ── */}
          {tab === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {field(
                <>
                  {label('Main Photo URL')}
                  {f.photo_url && (
                    <div style={{ marginBottom: 8, borderRadius: 8, overflow: 'hidden', height: 100, background: 'var(--bg-2)' }}>
                      <img src={f.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
                    </div>
                  )}
                  <input {...inp()} value={f.photo_url} onChange={e => set('photo_url', e.target.value)} placeholder="https://… or Supabase Storage URL" />
                </>,
              )}
              {field(
                <>
                  {label('Amenities (comma-separated)')}
                  <input {...inp()} value={f.amenities} onChange={e => set('amenities', e.target.value)} placeholder="Pool, AC, WiFi, Breakfast included" />
                </>,
              )}
              {field(
                <>
                  {label('Internal Notes')}
                  <textarea {...inp({ resize: 'vertical' })} rows={3} value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Booking lead time, cancellation policy, special requirements…" />
                </>,
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['property', 'contact', 'pricing', 'media'] as ModalTab[]).map((t, i) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, background: tab === t ? 'var(--sand)' : 'var(--border)', transition: 'background .15s' }}
                aria-label={`Tab ${i + 1}: ${t}`}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} className="btn btn-outline">Cancel</button>
            <button onClick={onSave} disabled={saving} className="btn btn-primary">
              <Save size={13} /> {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Property'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccommodationsPage() {
  const [items, setItems] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [destFilter, setDestFilter] = useState('all');
  const [catFilter, setCatFilter] = useState<'all' | AccomCategory>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Accommodation | null>(null);
  const [form, setForm] = useState<AccomForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    const { data, error: e } = await supabase
      .from('btm_accommodations')
      .select('*')
      .order('destination')
      .order('category')
      .order('name');
    if (e) { setError(e.message); setLoading(false); return; }
    setItems((data ?? []) as Accommodation[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  // All unique destinations (from DB + presets)
  const allDestinations = useMemo(() => {
    const fromDB = [...new Set(items.map(a => a.destination).filter(Boolean))];
    const combined = [...new Set([...PRESET_DESTINATIONS, ...fromDB])].sort();
    return combined;
  }, [items]);

  function openAdd(defaultDest?: string, defaultCat?: AccomCategory) {
    setEditing(null);
    setForm({ ...emptyForm(), destination: defaultDest ?? 'Marrakech', category: defaultCat ?? 'standard' });
    setShowModal(true);
  }
  function openEdit(a: Accommodation) {
    setEditing(a);
    setForm(accomToForm(a));
    setShowModal(true);
  }

  async function saveForm() {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const dest = form.destination === '__other__' ? form.customDest.trim() : form.destination;
    if (!dest) { toast.error('Destination is required'); return; }
    setSaving(true);
    const payload = formToPayload(form);
    if (editing) {
      const { data, error: e } = await supabase.from('btm_accommodations').update(payload).eq('id', editing.id).select().single();
      setSaving(false);
      if (e) { toast.error(e.message); return; }
      setItems(p => p.map(x => x.id === editing.id ? data as Accommodation : x));
      toast.success('Property updated');
    } else {
      const { data, error: e } = await supabase.from('btm_accommodations').insert(payload).select().single();
      setSaving(false);
      if (e) { toast.error(e.message); return; }
      setItems(p => [...p, data as Accommodation].sort((a, b) => a.destination.localeCompare(b.destination) || a.name.localeCompare(b.name)));
      toast.success('Property added');
    }
    setShowModal(false);
  }

  async function del(a: Accommodation) {
    if (!confirm(`Delete "${a.name}"?`)) return;
    const { error: e } = await supabase.from('btm_accommodations').delete().eq('id', a.id);
    if (e) { toast.error(e.message); return; }
    setItems(p => p.filter(x => x.id !== a.id));
    toast.success('Removed');
  }

  function exportCSV() {
    const header = ['destination', 'category', 'type', 'name', 'stars', 'contact_person', 'contact_phone', 'contact_email', 'low_season_rate', 'mid_season_rate', 'high_season_rate', 'peak_season_rate', 'website'];
    const rows = items.map(a => header.map(k => (a as unknown as Record<string, unknown>)[k] ?? '').join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const el = document.createElement('a');
    el.href = url; el.download = 'accommodations.csv'; el.click();
    URL.revokeObjectURL(url);
  }

  // Filtered items
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(a => {
      const matchDest = destFilter === 'all' || a.destination === destFilter;
      const matchCat  = catFilter === 'all' || a.category === catFilter;
      const matchQ    = !q || a.name.toLowerCase().includes(q) || a.destination.toLowerCase().includes(q) || (a.contact_person ?? '').toLowerCase().includes(q);
      return matchDest && matchCat && matchQ;
    });
  }, [items, destFilter, catFilter, search]);

  // Grouped by destination
  const grouped = useMemo(() => {
    const map = new Map<string, Accommodation[]>();
    for (const a of filtered) {
      if (!map.has(a.destination)) map.set(a.destination, []);
      map.get(a.destination)!.push(a);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading accommodations…</p></div>;
  if (error) return <div className="page-error"><AlertCircle size={24} /><p>{error}</p><button className="btn btn-primary" onClick={load}><RefreshCw size={14} /> Retry</button></div>;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Accommodations</h1>
          <p className="page-subtitle">
            {items.length} properties · {[...new Set(items.map(a => a.destination))].length} destinations ·
            {' '}{items.filter(a => a.category === 'standard').length} Standard ·
            {' '}{items.filter(a => a.category === 'luxury').length} Luxury
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} className="btn btn-outline"><RefreshCw size={14} /></button>
          <button onClick={exportCSV} className="btn btn-outline"><Download size={14} /> Export CSV</button>
          <button onClick={() => openAdd(destFilter !== 'all' ? destFilter : undefined, catFilter !== 'all' ? catFilter : undefined)} className="btn btn-primary">
            <Plus size={15} /> Add Property
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-input-wrap" style={{ flex: '1 1 220px', minWidth: 200 }}>
          <Search size={14} />
          <input type="text" placeholder="Search name, destination…" value={search} onChange={e => setSearch(e.target.value)} className="form-input search-input" />
        </div>
        <select
          value={destFilter}
          onChange={e => setDestFilter(e.target.value)}
          className="form-input"
          style={{ width: 'auto', fontSize: 13, paddingRight: 28 }}
        >
          <option value="all">All Destinations</option>
          {allDestinations.map(d => (
            <option key={d} value={d}>{d} ({items.filter(a => a.destination === d).length})</option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'standard', 'luxury'] as const).map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`btn ${catFilter === c ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: 12 }}
            >
              {c === 'all' ? 'All' : CAT_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {grouped.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 52 }}>
          <Building2 size={36} style={{ color: 'var(--text-3)', margin: '0 auto 14px' }} />
          <p className="text-2" style={{ fontWeight: 600, marginBottom: 6 }}>No properties{search ? ` matching "${search}"` : ' yet'}</p>
          <p className="text-3" style={{ fontSize: 12, marginBottom: 20 }}>
            Organize riads, kasbahs, camps and hotels by destination and category.
          </p>
          {!search && <button onClick={() => openAdd()} className="btn btn-primary"><Plus size={14} /> Add First Property</button>}
        </div>
      ) : (
        grouped.map(([dest, destItems]) => (
          <DestinationGroup
            key={dest}
            destination={dest}
            items={destItems}
            onEdit={openEdit}
            onDelete={del}
            onAddHere={cat => openAdd(dest, cat)}
          />
        ))
      )}

      {/* Legend */}
      {items.length > 0 && (
        <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          {Object.entries(TIER_LEGEND).map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AccomModal
          editing={editing}
          form={form}
          setForm={setForm}
          saving={saving}
          onSave={saveForm}
          onClose={() => setShowModal(false)}
          allDestinations={allDestinations}
        />
      )}
    </div>
  );
}

const TIER_LEGEND: Record<string, string> = {
  'Riad': TYPE_COLORS.riad,
  'Hotel': TYPE_COLORS.hotel,
  'Kasbah': TYPE_COLORS.kasbah,
  'Camp': TYPE_COLORS.camp,
  'Villa': TYPE_COLORS.villa,
  'Resort': TYPE_COLORS.resort,
};
