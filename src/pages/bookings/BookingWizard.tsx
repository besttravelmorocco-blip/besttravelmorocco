import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { OpBooking, StaffMember, Tour } from '@/lib/supabase';
import { PAYMENT_METHOD_LABELS, STAFF_ROLE_LABELS } from '@/lib/supabase';
import type { PaymentMethod } from '@/lib/supabase';
import { toast } from 'sonner';
import { X, ChevronRight, ChevronLeft, Check, User, Map, DollarSign, Users, MessageSquare, ClipboardList } from 'lucide-react';

interface WizardProps {
  onClose: () => void;
  onCreated: (booking: OpBooking) => void;
}

interface FormState {
  client_name: string;
  client_email: string;
  client_phone: string;
  client_whatsapp: string;
  client_nationality: string;
  client_hotel: string;
  tour_name: string;
  start_date: string;
  end_date: string;
  num_adults: number;
  num_children: number;
  pickup_location: string;
  pickup_time: string;
  total_price: string;
  currency: string;
  deposit_amount: string;
  deposit_method: PaymentMethod | '';
  driver_id: string;
  guide_fes_id: string;
  guide_marrakech_id: string;
  guide_volubilis_id: string;
  internal_notes: string;
  client_notes: string;
  special_requirements: string;
}

const STEPS = [
  { label: 'Client', icon: User },
  { label: 'Tour & Dates', icon: Map },
  { label: 'Pricing', icon: DollarSign },
  { label: 'Staff', icon: Users },
  { label: 'Notes', icon: MessageSquare },
  { label: 'Review', icon: ClipboardList },
];

const CURRENCIES = ['EUR', 'USD', 'GBP', 'MAD'];

const empty: FormState = {
  client_name: '', client_email: '', client_phone: '', client_whatsapp: '',
  client_nationality: '', client_hotel: '',
  tour_name: '', start_date: '', end_date: '',
  num_adults: 1, num_children: 0,
  pickup_location: '', pickup_time: '08:00',
  total_price: '', currency: 'EUR', deposit_amount: '', deposit_method: '',
  driver_id: '', guide_fes_id: '', guide_marrakech_id: '', guide_volubilis_id: '',
  internal_notes: '', client_notes: '', special_requirements: '',
};

export default function BookingWizard({ onClose, onCreated }: WizardProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(empty);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('staff').select('*').order('name').then(({ data }) => {
      if (data) setStaff(data as StaffMember[]);
    });
    supabase.from('tours').select('id,title,days,from_city,to_city').eq('status', 'published').order('title').then(({ data }) => {
      if (data) setTours(data as Tour[]);
    });
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function validateStep(): string | null {
    if (step === 0 && !form.client_name.trim()) return 'Client name is required.';
    if (step === 1 && !form.tour_name.trim()) return 'Tour name is required.';
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) { toast.error(err); return; }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep(s => Math.max(s - 1, 0));
  }

  async function submit() {
    if (!form.client_name.trim()) { toast.error('Client name is required.'); return; }
    if (!form.tour_name.trim()) { toast.error('Tour name is required.'); return; }
    setSaving(true);
    const payload = {
      client_name: form.client_name.trim(),
      client_email: form.client_email.trim() || null,
      client_phone: form.client_phone.trim() || null,
      client_whatsapp: form.client_whatsapp.trim() || null,
      client_nationality: form.client_nationality.trim() || null,
      client_hotel: form.client_hotel.trim() || null,
      tour_name: form.tour_name.trim(),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      num_adults: form.num_adults,
      num_children: form.num_children,
      pickup_location: form.pickup_location.trim() || null,
      pickup_time: form.pickup_time || '08:00',
      total_price: form.total_price ? parseInt(form.total_price, 10) : null,
      currency: form.currency,
      deposit_amount: form.deposit_amount ? parseInt(form.deposit_amount, 10) : null,
      deposit_method: form.deposit_method || null,
      driver_id: form.driver_id || null,
      guide_fes_id: form.guide_fes_id || null,
      guide_marrakech_id: form.guide_marrakech_id || null,
      guide_volubilis_id: form.guide_volubilis_id || null,
      internal_notes: form.internal_notes.trim() || null,
      client_notes: form.client_notes.trim() || null,
      special_requirements: form.special_requirements.trim() || null,
      status: 'enquiry' as const,
    };
    const { data, error } = await supabase.from('op_bookings').insert(payload).select().single();
    setSaving(false);
    if (error) { toast.error(`Failed to create booking: ${error.message}`); return; }
    toast.success(`Booking ${(data as OpBooking).reference} created`);
    onCreated(data as OpBooking);
  }

  const staffByRole = (role: string) => staff.filter(s => s.role === role);
  const drivers = staffByRole('driver');
  const guidesFes = staffByRole('guide_fes');
  const guidesMarrakech = staffByRole('guide_marrakech');
  const guidesVolubilis = staffByRole('guide_volubilis');

  const fmtCcy = (v: string, ccy: string) => {
    if (!v) return '—';
    const sym = ccy === 'EUR' ? '€' : ccy === 'USD' ? '$' : ccy === 'GBP' ? '£' : ccy + ' ';
    return `${sym}${parseInt(v).toLocaleString()}`;
  };

  const staffName = (id: string) => staff.find(s => s.id === id)?.name ?? '—';

  function StaffSelect({ label, role, value, field }: { label: string; role: string; value: string; field: keyof FormState }) {
    const options = staffByRole(role);
    return (
      <div>
        <label className="form-label">{label}</label>
        <select className="form-input" value={value} onChange={e => set(field, e.target.value as FormState[typeof field])}>
          <option value="">— Not assigned —</option>
          {options.map(s => (
            <option key={s.id} value={s.id}>{s.name}{!s.available ? ' (unavailable)' : ''}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, width: '100%', maxWidth: 620, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>New Booking</h2>
            <p className="text-3" style={{ fontSize: 12 }}>Step {step + 1} of {STEPS.length} — {STEPS[step].label}</p>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>

        {/* Step indicators */}
        <div style={{ padding: '14px 24px 0', display: 'flex', gap: 6, flexShrink: 0 }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                <div
                  style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: done ? 'var(--sand)' : active ? 'rgba(201,169,110,0.15)' : 'var(--bg-2)',
                    border: active ? '1.5px solid var(--sand)' : 'none',
                    color: done ? '#1A0F0A' : active ? 'var(--sand)' : 'var(--text-3)',
                    fontSize: 12, fontWeight: 700,
                  }}
                >
                  {done ? <Check size={13} /> : <Icon size={12} />}
                </div>
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? 'var(--text-1)' : 'var(--text-3)', whiteSpace: 'nowrap', display: i === STEPS.length - 1 ? 'none' : undefined }}>
                  {i < STEPS.length - 1 && <span style={{ color: 'var(--border)', marginLeft: 4 }}>·</span>}
                </span>
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Step 0: Client */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" placeholder="e.g. John Smith" value={form.client_name} onChange={e => set('client_name', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="john@example.com" value={form.client_email} onChange={e => set('client_email', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input className="form-input" placeholder="+1 555 000 0000" value={form.client_phone} onChange={e => set('client_phone', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">WhatsApp</label>
                  <input className="form-input" placeholder="+1 555 000 0000" value={form.client_whatsapp} onChange={e => set('client_whatsapp', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Nationality</label>
                  <input className="form-input" placeholder="e.g. British" value={form.client_nationality} onChange={e => set('client_nationality', e.target.value)} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Hotel / Accommodation</label>
                  <input className="form-input" placeholder="Hotel name and city" value={form.client_hotel} onChange={e => set('client_hotel', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Tour & Dates */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">Tour Name *</label>
                {tours.length > 0 ? (
                  <>
                    <select
                      className="form-input"
                      value={tours.find(t => t.title === form.tour_name)?.id ?? ''}
                      onChange={e => {
                        const t = tours.find(t => t.id === e.target.value);
                        if (t) set('tour_name', t.title);
                        else set('tour_name', '');
                      }}
                    >
                      <option value="">— Select a tour —</option>
                      {tours.map(t => (
                        <option key={t.id} value={t.id}>{t.title} ({t.days} days, {t.from_city}→{t.to_city})</option>
                      ))}
                    </select>
                    <p className="text-3" style={{ fontSize: 11, marginTop: 4 }}>Or type a custom name below:</p>
                  </>
                ) : null}
                <input
                  className="form-input"
                  placeholder="Tour name"
                  value={form.tour_name}
                  onChange={e => set('tour_name', e.target.value)}
                  style={{ marginTop: tours.length > 0 ? 6 : 0 }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Start Date</label>
                  <input className="form-input" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">End Date</label>
                  <input className="form-input" type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Adults</label>
                  <input className="form-input" type="number" min={1} value={form.num_adults} onChange={e => set('num_adults', parseInt(e.target.value) || 1)} />
                </div>
                <div>
                  <label className="form-label">Children</label>
                  <input className="form-input" type="number" min={0} value={form.num_children} onChange={e => set('num_children', parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="form-label">Pickup Location</label>
                  <input className="form-input" placeholder="Hotel / address" value={form.pickup_location} onChange={e => set('pickup_location', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Pickup Time</label>
                  <input className="form-input" type="time" value={form.pickup_time} onChange={e => set('pickup_time', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pricing */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Total Price</label>
                  <input className="form-input" type="number" min={0} placeholder="e.g. 1200" value={form.total_price} onChange={e => set('total_price', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Currency</label>
                  <select className="form-input" value={form.currency} onChange={e => set('currency', e.target.value)}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Deposit Amount</label>
                  <input className="form-input" type="number" min={0} placeholder="e.g. 200" value={form.deposit_amount} onChange={e => set('deposit_amount', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Deposit Method</label>
                  <select className="form-input" value={form.deposit_method} onChange={e => set('deposit_method', e.target.value as PaymentMethod | '')}>
                    <option value="">— Not set —</option>
                    {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map(m => (
                      <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
                    ))}
                  </select>
                </div>
              </div>
              {form.total_price && form.deposit_amount && (
                <div style={{ background: 'var(--bg-2)', borderRadius: 8, padding: '10px 14px' }}>
                  <div className="text-3" style={{ fontSize: 11, marginBottom: 4 }}>Balance due</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>
                    {fmtCcy(String(parseInt(form.total_price) - parseInt(form.deposit_amount || '0')), form.currency)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Staff */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {staff.length === 0 ? (
                <div style={{ background: 'var(--bg-2)', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                  <p className="text-3" style={{ fontSize: 13 }}>No staff members added yet. You can assign staff later from the booking detail page.</p>
                </div>
              ) : (
                <>
                  <StaffSelect label="Driver" role="driver" value={form.driver_id} field="driver_id" />
                  <StaffSelect label="Guide — Fes" role="guide_fes" value={form.guide_fes_id} field="guide_fes_id" />
                  <StaffSelect label="Guide — Marrakech" role="guide_marrakech" value={form.guide_marrakech_id} field="guide_marrakech_id" />
                  <StaffSelect label="Guide — Volubilis" role="guide_volubilis" value={form.guide_volubilis_id} field="guide_volubilis_id" />
                </>
              )}
            </div>
          )}

          {/* Step 4: Notes */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">Internal Notes (staff only)</label>
                <textarea className="form-input" rows={3} placeholder="Logistics, special arrangements, driver instructions…" value={form.internal_notes} onChange={e => set('internal_notes', e.target.value)} style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label className="form-label">Client Notes (visible to client)</label>
                <textarea className="form-input" rows={3} placeholder="Confirmation details, what to bring, meeting point…" value={form.client_notes} onChange={e => set('client_notes', e.target.value)} style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label className="form-label">Special Requirements</label>
                <textarea className="form-input" rows={2} placeholder="Dietary, accessibility, allergies…" value={form.special_requirements} onChange={e => set('special_requirements', e.target.value)} style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                {
                  title: 'Client', items: [
                    ['Name', form.client_name || '—'],
                    ['Email', form.client_email || '—'],
                    ['Phone', form.client_phone || '—'],
                    ['WhatsApp', form.client_whatsapp || '—'],
                    ['Nationality', form.client_nationality || '—'],
                    ['Hotel', form.client_hotel || '—'],
                  ],
                },
                {
                  title: 'Tour & Dates', items: [
                    ['Tour', form.tour_name || '—'],
                    ['Start', form.start_date || '—'],
                    ['End', form.end_date || '—'],
                    ['Pax', `${form.num_adults} adults, ${form.num_children} children`],
                    ['Pickup', form.pickup_location ? `${form.pickup_location} at ${form.pickup_time}` : '—'],
                  ],
                },
                {
                  title: 'Pricing', items: [
                    ['Total', fmtCcy(form.total_price, form.currency)],
                    ['Deposit', form.deposit_amount ? `${fmtCcy(form.deposit_amount, form.currency)} via ${form.deposit_method ? PAYMENT_METHOD_LABELS[form.deposit_method as PaymentMethod] : '—'}` : '—'],
                    ['Balance', form.total_price && form.deposit_amount ? fmtCcy(String(parseInt(form.total_price) - parseInt(form.deposit_amount)), form.currency) : '—'],
                  ],
                },
                {
                  title: 'Staff', items: [
                    ['Driver', form.driver_id ? staffName(form.driver_id) : '—'],
                    ['Guide (Fes)', form.guide_fes_id ? staffName(form.guide_fes_id) : '—'],
                    ['Guide (Marrakech)', form.guide_marrakech_id ? staffName(form.guide_marrakech_id) : '—'],
                    ['Guide (Volubilis)', form.guide_volubilis_id ? staffName(form.guide_volubilis_id) : '—'],
                  ],
                },
              ].map(section => (
                <div key={section.title} style={{ background: 'var(--bg-2)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sand)', marginBottom: 10 }}>
                    {section.title}
                  </div>
                  {section.items.map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 13 }}>
                      <span className="text-3">{k}</span>
                      <span style={{ color: 'var(--text-1)', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={step === 0 ? onClose : back} className="btn btn-outline" style={{ gap: 6 }}>
            {step === 0 ? 'Cancel' : <><ChevronLeft size={14} /> Back</>}
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="btn btn-primary" style={{ gap: 6 }}>
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={submit} disabled={saving} className="btn btn-primary" style={{ gap: 6, minWidth: 130 }}>
              {saving ? 'Creating…' : <><Check size={14} /> Create Booking</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
