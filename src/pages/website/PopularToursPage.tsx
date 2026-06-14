import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tour } from '@/lib/supabase';
import { parseTourHighlights } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Search, ChevronUp, ChevronDown, Trash2, Plus,
  RefreshCw, ExternalLink, Star, MapPin, Clock, X,
} from 'lucide-react';

interface PopularSlot {
  id: number;
  tour_id: string;
  sort_order: number;
}

const CITY_COLORS: Record<string, string> = {
  Casablanca: '#60A5FA',
  Marrakech:  '#F97316',
  Fes:        '#A78BFA',
  Tangier:    '#34D399',
  Agadir:     '#FBBF24',
};

function cityTag(city: string) {
  const color = CITY_COLORS[city] ?? 'var(--sand)';
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color, background: color + '18', padding: '2px 7px', borderRadius: 4, letterSpacing: '.04em' }}>
      {city.toUpperCase()}
    </span>
  );
}

export default function PopularToursPage() {
  const [slots, setSlots]   = useState<PopularSlot[]>([]);
  const [tours, setTours]   = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState('');
  const [cityFilter, setCityFilter] = useState('');

  // ── Load ────────────────────────────────────────────────────────────────────

  async function load() {
    setLoading(true);
    const [slotsRes, toursRes] = await Promise.all([
      supabase.from('homepage_popular_tours').select('*').order('sort_order'),
      supabase.from('tours').select('*').eq('status', 'published').order('from_city').order('days', { ascending: false }),
    ]);
    if (slotsRes.error) toast.error(slotsRes.error.message);
    if (toursRes.error) toast.error(toursRes.error.message);
    setSlots((slotsRes.data ?? []) as PopularSlot[]);
    setTours((toursRes.data ?? []) as Tour[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // ── Derived ─────────────────────────────────────────────────────────────────

  const slotTours = useMemo(() =>
    slots
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(s => ({ slot: s, tour: tours.find(t => t.id === s.tour_id) }))
      .filter(x => x.tour),
  [slots, tours]);

  const slotIds = new Set(slots.map(s => s.tour_id));

  const cities = useMemo(() => [...new Set(tours.map(t => t.from_city))].sort(), [tours]);

  const available = useMemo(() => {
    const q = search.toLowerCase();
    return tours.filter(t =>
      !slotIds.has(t.id) &&
      (!cityFilter || t.from_city === cityFilter) &&
      (!q || t.title.toLowerCase().includes(q) || t.from_city.toLowerCase().includes(q))
    );
  }, [tours, slotIds, search, cityFilter]);

  // ── DB helpers ───────────────────────────────────────────────────────────────

  async function addTour(tour: Tour) {
    const maxOrder = slots.length > 0 ? Math.max(...slots.map(s => s.sort_order)) : -1;
    const { data, error } = await supabase
      .from('homepage_popular_tours')
      .insert({ tour_id: tour.id, sort_order: maxOrder + 1 })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    setSlots(prev => [...prev, data as PopularSlot]);
    toast.success(`"${tour.title}" added`);
  }

  async function removeTour(slot: PopularSlot, title: string) {
    const { error } = await supabase.from('homepage_popular_tours').delete().eq('id', slot.id);
    if (error) { toast.error(error.message); return; }
    setSlots(prev => prev.filter(s => s.id !== slot.id));
    toast.success(`"${title}" removed`);
  }

  async function move(slot: PopularSlot, dir: 'up' | 'down') {
    const sorted = [...slots].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex(s => s.id === slot.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    setSaving(true);
    await Promise.all([
      supabase.from('homepage_popular_tours').update({ sort_order: other.sort_order }).eq('id', slot.id),
      supabase.from('homepage_popular_tours').update({ sort_order: slot.sort_order }).eq('id', other.id),
    ]);
    setSlots(prev => prev.map(s => {
      if (s.id === slot.id)  return { ...s, sort_order: other.sort_order };
      if (s.id === other.id) return { ...s, sort_order: slot.sort_order };
      return s;
    }));
    setSaving(false);
  }

  // ── Summary counts ───────────────────────────────────────────────────────────

  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    slotTours.forEach(({ tour }) => {
      if (tour) counts[tour.from_city] = (counts[tour.from_city] ?? 0) + 1;
    });
    return counts;
  }, [slotTours]);

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading…</p></div>;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Most Popular Tours</h1>
          <p className="page-subtitle">
            {slotTours.length} tours curated · displayed on homepage in this order
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} className="btn btn-outline"><RefreshCw size={14} /></button>
          <a href="https://www.besttravelmorocco.com" target="_blank" rel="noopener" className="btn btn-outline">
            <ExternalLink size={14} /> Preview Site
          </a>
        </div>
      </div>

      {/* City breakdown */}
      {Object.keys(cityCounts).length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).map(([city, count]) => (
            <div key={city} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'var(--bg-2)', borderRadius: 20, fontSize: 12 }}>
              {cityTag(city)}
              <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

        {/* ── Left: current curated list ── */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>
            Current List — {slotTours.length} tours
          </h3>

          {slotTours.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-3)' }}>
              <Star size={28} style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: 13 }}>No tours selected yet. Add some from the right panel.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {slotTours.map(({ slot, tour }, idx) => (
                <div key={slot.id} className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Position */}
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#1A0F0A', flexShrink: 0 }}>
                    {idx + 1}
                  </div>

                  {/* Thumbnail */}
                  {tour!.image && (
                    <div style={{ width: 52, height: 40, borderRadius: 4, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-2)' }}>
                      <img src={tour!.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      {cityTag(tour!.from_city)}
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tour!.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-3)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} />{tour!.days}d</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} />{tour!.from_city} → {tour!.to_city}</span>
                      <span>{tour!.price}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                    <button onClick={() => move(slot, 'up')} disabled={saving || idx === 0} className="btn-icon"
                      style={{ opacity: idx === 0 ? 0.2 : 1, padding: 2 }}>
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => move(slot, 'down')} disabled={saving || idx === slotTours.length - 1} className="btn-icon"
                      style={{ opacity: idx === slotTours.length - 1 ? 0.2 : 1, padding: 2 }}>
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <button onClick={() => removeTour(slot, tour!.title)} className="btn-icon"
                    style={{ color: '#EF4444', flexShrink: 0 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: tour picker ── */}
        <div style={{ position: 'sticky', top: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>
            Add a Tour
          </h3>
          <div className="card" style={{ padding: 16 }}>
            {/* Search */}
            <div className="search-input-wrap" style={{ marginBottom: 10 }}>
              <Search size={13} />
              <input type="text" placeholder="Search by title or city…" value={search}
                onChange={e => setSearch(e.target.value)} className="form-input search-input" style={{ fontSize: 13 }} />
              {search && (
                <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2 }}>
                  <X size={12} />
                </button>
              )}
            </div>

            {/* City filter pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              <button onClick={() => setCityFilter('')}
                className={`btn ${!cityFilter ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: 11, padding: '3px 10px' }}>All</button>
              {cities.map(city => (
                <button key={city} onClick={() => setCityFilter(city === cityFilter ? '' : city)}
                  className={`btn ${cityFilter === city ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: 11, padding: '3px 10px' }}>
                  {city}
                </button>
              ))}
            </div>

            {/* Available tours list */}
            <div style={{ maxHeight: 480, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {available.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '16px 0' }}>
                  {slotIds.size === tours.length ? 'All tours are already added.' : 'No matches.'}
                </p>
              ) : available.map(tour => (
                <div key={tour.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--bg-2)', borderRadius: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                      {cityTag(tour.from_city)}
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                        {tour.title}
                      </span>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{tour.days}d · {tour.price}</span>
                  </div>
                  <button onClick={() => addTour(tour)} className="btn btn-outline"
                    style={{ padding: '4px 10px', fontSize: 11, flexShrink: 0 }}>
                    <Plus size={11} /> Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
