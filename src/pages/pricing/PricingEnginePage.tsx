import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tour, Season, PricingRule } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  RefreshCw, AlertCircle, Plus, X, Save, Edit2, Trash2,
  Calendar, TrendingUp, Loader2,
} from 'lucide-react';

const GROUP_BANDS = [
  { label: '1 person',   min: 1,  max: 1  },
  { label: '2 persons',  min: 2,  max: 2  },
  { label: '3 persons',  min: 3,  max: 3  },
  { label: '4–6 pax',   min: 4,  max: 6  },
  { label: '7–9 pax',   min: 7,  max: 9  },
  { label: '10–13 pax', min: 10, max: 13 },
  { label: '14–18 pax', min: 14, max: 18 },
];
const TIERS = ['boutique', 'luxury', 'signature'] as const;
const TIER_LABELS = { boutique: 'Boutique', luxury: 'Luxury', signature: 'Signature' };
const TIER_COLORS = { boutique: '#10B981', luxury: '#C9A96E', signature: '#F59E0B' };

type CellKey = `${number}-${number}-${string}`;
type Matrix = Record<CellKey, { price: string; cost: string; id?: string }>;

interface SeasonForm {
  name: string; color: string; start_date: string; end_date: string;
  multiplier: string; description: string; is_active: boolean;
}
const emptySeason: SeasonForm = { name: '', color: '#C9A96E', start_date: '', end_date: '', multiplier: '1.00', description: '', is_active: true };

function cellKey(min: number, max: number, tier: string): CellKey {
  return `${min}-${max}-${tier}` as CellKey;
}

export default function PricingEnginePage() {
  const [tab, setTab] = useState<'seasons' | 'rules'>('rules');
  const [tours, setTours] = useState<Tour[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loadingBase, setLoadingBase] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Seasons tab state
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [seasonForm, setSeasonForm] = useState<SeasonForm>(emptySeason);
  const [savingSeason, setSavingSeason] = useState(false);

  // Pricing tab state
  const [selectedTourId, setSelectedTourId] = useState('');
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [matrix, setMatrix] = useState<Matrix>({});
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [savingMatrix, setSavingMatrix] = useState(false);

  async function loadBase() {
    setLoadingBase(true); setError(null);
    const [{ data: toursData }, { data: seasonsData }] = await Promise.all([
      supabase.from('tours').select('id, title, status').eq('status', 'published').order('title'),
      supabase.from('btm_seasons').select('*').order('start_date'),
    ]);
    const t = (toursData ?? []) as Tour[];
    const s = (seasonsData ?? []) as Season[];
    setTours(t);
    setSeasons(s);
    if (t.length > 0 && !selectedTourId) setSelectedTourId(t[0].id);
    if (s.length > 0 && !selectedSeasonId) setSelectedSeasonId(s[0].id);
    setLoadingBase(false);
  }
  useEffect(() => { loadBase(); }, []); // eslint-disable-line

  const loadMatrix = useCallback(async (tourId: string, seasonId: string) => {
    if (!tourId || !seasonId) return;
    setLoadingMatrix(true);
    const { data } = await supabase
      .from('btm_pricing_rules')
      .select('*')
      .eq('tour_id', tourId)
      .eq('season_id', seasonId);
    const m: Matrix = {};
    for (const rule of (data ?? []) as PricingRule[]) {
      const k = cellKey(rule.group_size_min, rule.group_size_max, rule.accommodation_tier);
      m[k] = { price: rule.price_per_person.toString(), cost: rule.cost_per_person?.toString() ?? '', id: rule.id };
    }
    setMatrix(m);
    setLoadingMatrix(false);
  }, []);

  useEffect(() => {
    if (selectedTourId && selectedSeasonId) loadMatrix(selectedTourId, selectedSeasonId);
  }, [selectedTourId, selectedSeasonId, loadMatrix]);

  function setCell(min: number, max: number, tier: string, field: 'price' | 'cost', value: string) {
    const k = cellKey(min, max, tier);
    setMatrix(prev => ({ ...prev, [k]: { ...prev[k], [field]: value } }));
  }

  async function saveMatrix() {
    if (!selectedTourId || !selectedSeasonId) { toast.error('Select a tour and season first'); return; }
    setSavingMatrix(true);
    const upserts: object[] = [];
    for (const band of GROUP_BANDS) {
      for (const tier of TIERS) {
        const k = cellKey(band.min, band.max, tier);
        const cell = matrix[k];
        if (cell?.price && !isNaN(Number(cell.price))) {
          upserts.push({
            ...(cell.id ? { id: cell.id } : {}),
            tour_id: selectedTourId,
            season_id: selectedSeasonId,
            group_size_min: band.min,
            group_size_max: band.max,
            accommodation_tier: tier,
            price_per_person: Number(cell.price),
            cost_per_person: cell.cost && !isNaN(Number(cell.cost)) ? Number(cell.cost) : null,
          });
        }
      }
    }
    if (upserts.length === 0) { toast.error('Enter at least one price'); setSavingMatrix(false); return; }
    const { error: e } = await supabase.from('btm_pricing_rules').upsert(upserts, { onConflict: 'tour_id,season_id,group_size_min,group_size_max,accommodation_tier' });
    setSavingMatrix(false);
    if (e) { toast.error(e.message); return; }
    toast.success(`${upserts.length} pricing rules saved`);
    loadMatrix(selectedTourId, selectedSeasonId);
  }

  async function clearCell(min: number, max: number, tier: string) {
    const k = cellKey(min, max, tier);
    const id = matrix[k]?.id;
    if (id) {
      const { error: e } = await supabase.from('btm_pricing_rules').delete().eq('id', id);
      if (e) { toast.error(e.message); return; }
    }
    setMatrix(prev => { const next = { ...prev }; delete next[k]; return next; });
    toast.success('Price cleared');
  }

  // Season CRUD
  function openAddSeason() { setEditingSeason(null); setSeasonForm(emptySeason); setShowSeasonModal(true); }
  function openEditSeason(s: Season) {
    setEditingSeason(s);
    setSeasonForm({ name: s.name, color: s.color, start_date: s.start_date, end_date: s.end_date, multiplier: s.multiplier.toString(), description: s.description ?? '', is_active: s.is_active });
    setShowSeasonModal(true);
  }
  async function saveSeason() {
    if (!seasonForm.name.trim()) { toast.error('Name is required'); return; }
    if (!seasonForm.start_date || !seasonForm.end_date) { toast.error('Date range is required'); return; }
    setSavingSeason(true);
    const payload = { name: seasonForm.name.trim(), color: seasonForm.color, start_date: seasonForm.start_date, end_date: seasonForm.end_date, multiplier: Number(seasonForm.multiplier), description: seasonForm.description.trim() || null, is_active: seasonForm.is_active };
    if (editingSeason) {
      const { data, error: e } = await supabase.from('btm_seasons').update(payload).eq('id', editingSeason.id).select().single();
      setSavingSeason(false);
      if (e) { toast.error(e.message); return; }
      setSeasons(p => p.map(x => x.id === editingSeason.id ? data as Season : x));
      toast.success('Season updated');
    } else {
      const { data, error: e } = await supabase.from('btm_seasons').insert(payload).select().single();
      setSavingSeason(false);
      if (e) { toast.error(e.message); return; }
      setSeasons(p => [...p, data as Season]);
      toast.success('Season created');
    }
    setShowSeasonModal(false);
  }
  async function deleteSeason(s: Season) {
    if (!confirm(`Delete "${s.name}"? All pricing rules for this season will be deleted.`)) return;
    const { error: e } = await supabase.from('btm_seasons').delete().eq('id', s.id);
    if (e) { toast.error(e.message); return; }
    setSeasons(p => p.filter(x => x.id !== s.id));
    if (selectedSeasonId === s.id) setSelectedSeasonId('');
    toast.success('Season deleted');
  }

  const fmtDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  if (loadingBase) return <div className="page-loading"><div className="spinner" /><p>Loading pricing engine…</p></div>;
  if (error) return <div className="page-error"><AlertCircle size={24} /><p>{error}</p><button className="btn btn-primary" onClick={loadBase}><RefreshCw size={14} /> Retry</button></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pricing Engine</h1>
          <p className="page-subtitle">Manage seasonal pricing rules per tour, group size & accommodation tier</p>
        </div>
        <button onClick={loadBase} className="btn btn-outline"><RefreshCw size={14} /></button>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        <button className={`tab ${tab === 'rules' ? 'tab-active' : ''}`} onClick={() => setTab('rules')}><TrendingUp size={14} /> Pricing Matrix</button>
        <button className={`tab ${tab === 'seasons' ? 'tab-active' : ''}`} onClick={() => setTab('seasons')}><Calendar size={14} /> Seasons</button>
      </div>

      {/* ── Seasons Tab ── */}
      {tab === 'seasons' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={openAddSeason} className="btn btn-primary"><Plus size={14} /> Add Season</button>
          </div>
          {seasons.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <Calendar size={32} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
              <p className="text-2" style={{ marginBottom: 4 }}>No seasons defined</p>
              <p className="text-3" style={{ fontSize: 12, marginBottom: 20 }}>Create seasons to set different prices by time of year.</p>
              <button onClick={openAddSeason} className="btn btn-primary"><Plus size={14} /> Add Season</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {seasons.map(s => (
                <div key={s.id} className="card" style={{ padding: 16, borderLeft: `3px solid ${s.color}`, opacity: s.is_active ? 1 : 0.55 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{fmtDate(s.start_date)} — {fmtDate(s.end_date)}</div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 16, color: s.color }}>{s.multiplier}×</span>
                  </div>
                  {s.description && <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 12 }}>{s.description}</p>}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEditSeason(s)} className="btn btn-outline" style={{ flex: 1, fontSize: 11, justifyContent: 'center' }}><Edit2 size={12} /> Edit</button>
                    <button onClick={() => deleteSeason(s)} className="btn btn-ghost" style={{ fontSize: 11, color: '#F87171', padding: '6px 10px' }}><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Pricing Matrix Tab ── */}
      {tab === 'rules' && (
        <div>
          {tours.length === 0 || seasons.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <TrendingUp size={32} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
              <p className="text-2" style={{ marginBottom: 4 }}>Setup required</p>
              <p className="text-3" style={{ fontSize: 12 }}>You need at least one published tour and one season to set pricing rules.</p>
            </div>
          ) : (
            <>
              {/* Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                <div>
                  <label className="form-label">Tour</label>
                  <select className="form-input" value={selectedTourId} onChange={e => setSelectedTourId(e.target.value)}>
                    {tours.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Season</label>
                  <select className="form-input" value={selectedSeasonId} onChange={e => setSelectedSeasonId(e.target.value)}>
                    {seasons.map(s => <option key={s.id} value={s.id}>{s.name} ({fmtDate(s.start_date)} – {fmtDate(s.end_date)})</option>)}
                  </select>
                </div>
              </div>

              {/* Matrix */}
              {loadingMatrix ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 10, color: 'var(--text-3)' }}>
                  <Loader2 size={18} className="animate-spin" /><span style={{ fontSize: 13 }}>Loading pricing data…</span>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Enter price per person (€). Cost per person is internal-only for profit calculation.</p>
                    <button onClick={saveMatrix} disabled={savingMatrix} className="btn btn-primary">
                      {savingMatrix ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Save size={13} /> Save All Prices</>}
                    </button>
                  </div>

                  <div className="card" style={{ padding: 0, overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-3)', whiteSpace: 'nowrap', width: 120 }}>Group Size</th>
                          {TIERS.map(tier => (
                            <th key={tier} colSpan={2} style={{ padding: '10px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: TIER_COLORS[tier], borderLeft: '1px solid var(--border)' }}>
                              {TIER_LABELS[tier]}
                            </th>
                          ))}
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
                          <th style={{ padding: '6px 16px', fontSize: 10, color: 'var(--text-3)' }}></th>
                          {TIERS.map(tier => (
                            <>
                              <th key={`${tier}-price`} style={{ padding: '6px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', textAlign: 'center', borderLeft: '1px solid var(--border)', width: 110 }}>Price/pax</th>
                              <th key={`${tier}-cost`} style={{ padding: '6px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', textAlign: 'center', width: 90 }}>Cost/pax</th>
                            </>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {GROUP_BANDS.map(band => (
                          <tr key={band.label} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{band.label}</td>
                            {TIERS.map(tier => {
                              const k = cellKey(band.min, band.max, tier);
                              const cell = matrix[k];
                              return (
                                <>
                                  <td key={`${k}-price`} style={{ padding: '6px 8px', borderLeft: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>€</span>
                                      <input
                                        type="number" min="0" step="1"
                                        value={cell?.price ?? ''}
                                        onChange={e => setCell(band.min, band.max, tier, 'price', e.target.value)}
                                        placeholder="—"
                                        style={{ width: 80, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', fontSize: 13, color: 'var(--text-1)', fontWeight: cell?.price ? 700 : 400 }}
                                      />
                                      {cell?.id && (
                                        <button onClick={() => clearCell(band.min, band.max, tier)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2, opacity: 0.5, flexShrink: 0 }}>
                                          <X size={11} />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                  <td key={`${k}-cost`} style={{ padding: '6px 8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>€</span>
                                      <input
                                        type="number" min="0" step="1"
                                        value={cell?.cost ?? ''}
                                        onChange={e => setCell(band.min, band.max, tier, 'cost', e.target.value)}
                                        placeholder="—"
                                        style={{ width: 70, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', fontSize: 12, color: 'var(--text-3)' }}
                                      />
                                    </div>
                                  </td>
                                </>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10 }}>
                    19+ travelers: instant booking is automatically disabled and a custom tour request is generated.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Season Modal */}
      {showSeasonModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowSeasonModal(false); }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 10, width: '100%', maxWidth: 440, boxShadow: '0 16px 48px rgba(0,0,0,.5)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{editingSeason ? 'Edit Season' : 'Add Season'}</h3>
              <button onClick={() => setShowSeasonModal(false)} className="btn-icon"><X size={16} /></button>
            </div>
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Season Name *</label>
                <input className="form-input" value={seasonForm.name} onChange={e => setSeasonForm(p => ({ ...p, name: e.target.value }))} placeholder="High Season" autoFocus />
              </div>
              <div>
                <label className="form-label">Start Date *</label>
                <input className="form-input" type="date" value={seasonForm.start_date} onChange={e => setSeasonForm(p => ({ ...p, start_date: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">End Date *</label>
                <input className="form-input" type="date" value={seasonForm.end_date} onChange={e => setSeasonForm(p => ({ ...p, end_date: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Price Multiplier</label>
                <input className="form-input" type="number" step="0.05" min="0.5" max="3" value={seasonForm.multiplier} onChange={e => setSeasonForm(p => ({ ...p, multiplier: e.target.value }))} placeholder="1.20" />
                <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>1.0 = base, 1.2 = 20% higher</p>
              </div>
              <div>
                <label className="form-label">Color</label>
                <input className="form-input" type="color" value={seasonForm.color} onChange={e => setSeasonForm(p => ({ ...p, color: e.target.value }))} style={{ height: 38, padding: 4 }} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Description</label>
                <input className="form-input" value={seasonForm.description} onChange={e => setSeasonForm(p => ({ ...p, description: e.target.value }))} placeholder="Spring — peak demand, mild weather" />
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowSeasonModal(false)} className="btn btn-outline">Cancel</button>
              <button onClick={saveSeason} disabled={savingSeason} className="btn btn-primary">
                <Save size={13} /> {savingSeason ? 'Saving…' : editingSeason ? 'Save Changes' : 'Add Season'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
