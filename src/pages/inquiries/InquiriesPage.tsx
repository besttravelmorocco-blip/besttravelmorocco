import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Inquiry, InquiryStatus } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Search, Mail, Phone, MessageSquare, Clock, CheckCircle2,
  Archive, RefreshCw, AlertCircle, Inbox
} from 'lucide-react';

const STATUSES: { value: InquiryStatus | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: 'var(--text-3)' },
  { value: 'new', label: 'New', color: '#F472B6' },
  { value: 'read', label: 'Read', color: '#60A5FA' },
  { value: 'replied', label: 'Replied', color: '#34D399' },
  { value: 'archived', label: 'Archived', color: 'var(--text-3)' },
];

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'all'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  async function fetchInquiries() {
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (e) { setError(e.message); setLoading(false); return; }
    setInquiries((data ?? []) as Inquiry[]);
    setLoading(false);
  }

  useEffect(() => { fetchInquiries(); }, []);

  useEffect(() => {
    if (selected) setNotes(selected.notes ?? '');
  }, [selected]);

  const filtered = inquiries.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || (i.tour_name ?? '').toLowerCase().includes(q) || (i.message ?? '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function updateStatus(id: string, status: InquiryStatus) {
    setUpdatingId(id);
    const { error: e } = await supabase.from('inquiries').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (e) { toast.error(`Update failed: ${e.message}`); }
    else {
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
      toast.success(`Marked as ${status}`);
    }
    setUpdatingId(null);
  }

  async function saveNotes(id: string) {
    setSavingNotes(true);
    const { error: e } = await supabase.from('inquiries').update({ notes, updated_at: new Date().toISOString() }).eq('id', id);
    if (e) toast.error(`Save failed: ${e.message}`);
    else { setInquiries(prev => prev.map(i => i.id === id ? { ...i, notes } : i)); toast.success('Notes saved'); }
    setSavingNotes(false);
  }

  function openInquiry(inq: Inquiry) {
    setSelected(inq);
    if (inq.status === 'new') updateStatus(inq.id, 'read');
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading inquiries…</p></div>;
  if (error) return <div className="page-error"><AlertCircle size={24} /><p>{error}</p><button className="btn btn-primary" onClick={fetchInquiries}><RefreshCw size={14} /> Retry</button></div>;

  const newCount = inquiries.filter(i => i.status === 'new').length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inquiries</h1>
          <p className="page-subtitle">{inquiries.length} total{newCount > 0 ? ` · ${newCount} new` : ''}</p>
        </div>
        <button onClick={fetchInquiries} className="btn btn-outline"><RefreshCw size={14} /> Refresh</button>
      </div>

      {/* Status pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {STATUSES.map(s => {
          const count = s.value === 'all' ? inquiries.length : inquiries.filter(i => i.status === s.value).length;
          return (
            <button key={s.value} onClick={() => setStatusFilter(s.value)} className={`btn ${statusFilter === s.value ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 12, gap: 6 }}>
              {s.label}
              <span style={{ background: statusFilter === s.value ? 'rgba(255,255,255,0.2)' : 'var(--bg-2)', padding: '1px 6px', borderRadius: 10, fontSize: 11 }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 20 }}>
        {/* List */}
        <div>
          <div className="search-input-wrap" style={{ marginBottom: 12 }}>
            <Search size={14} />
            <input type="text" placeholder="Search name, email, tour…" value={search} onChange={e => setSearch(e.target.value)} className="form-input search-input" />
          </div>

          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <Inbox size={32} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
              <p className="text-2">No inquiries found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map(inq => (
                <div
                  key={inq.id}
                  onClick={() => openInquiry(inq)}
                  className="card"
                  style={{ cursor: 'pointer', padding: '12px 16px', border: selected?.id === inq.id ? '1px solid var(--sand)' : undefined, transition: 'border-color 0.15s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: inq.status === 'new' ? 'rgba(244,114,182,0.15)' : 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: inq.status === 'new' ? '#F472B6' : 'var(--sand)', flexShrink: 0, fontSize: 15 }}>
                      {inq.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{inq.name}</span>
                        {inq.status === 'new' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F472B6', flexShrink: 0 }} />}
                      </div>
                      <div className="text-3" style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inq.tour_name ?? inq.email}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span className={`badge badge-${inq.status === 'new' ? 'error' : inq.status === 'replied' ? 'success' : inq.status === 'read' ? 'info' : 'default'}`}>{inq.status}</span>
                      <div className="text-3" style={{ fontSize: 10, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                        <Clock size={9} />{new Date(inq.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                  {inq.message && (
                    <p className="text-3" style={{ fontSize: 12, marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inq.message}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="card" style={{ position: 'sticky', top: 24, alignSelf: 'start', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-1)', marginBottom: 2 }}>{selected.name}</h3>
                <span className={`badge badge-${selected.status === 'new' ? 'error' : selected.status === 'replied' ? 'success' : selected.status === 'read' ? 'info' : 'default'}`}>{selected.status}</span>
              </div>
              <button onClick={() => setSelected(null)} className="btn-icon" style={{ fontSize: 18, lineHeight: 1 }}>×</button>
            </div>

            {/* Contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, padding: 14, background: 'var(--bg-2)', borderRadius: 8 }}>
              <a href={`mailto:${selected.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--sand)', textDecoration: 'none' }}>
                <Mail size={14} />{selected.email}
              </a>
              {selected.phone && (
                <a href={`tel:${selected.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-2)', textDecoration: 'none' }}>
                  <Phone size={14} />{selected.phone}
                </a>
              )}
              {selected.phone && (
                <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#25D366', textDecoration: 'none' }}>
                  <MessageSquare size={14} /> WhatsApp
                </a>
              )}
            </div>

            {/* Trip details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[
                ['Tour', selected.tour_name],
                ['Travel date', selected.travel_date],
                ['Travelers', selected.travelers ? String(selected.travelers) : null],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ background: 'var(--bg-2)', borderRadius: 6, padding: '8px 10px' }}>
                  <div className="text-3" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Message */}
            {selected.message && (
              <div style={{ marginBottom: 16 }}>
                <p className="text-3" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Message</p>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selected.message}</p>
              </div>
            )}

            <div className="text-3" style={{ fontSize: 11, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} />{fmt(selected.created_at)}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <a href={`mailto:${selected.email}?subject=Re: Your Morocco travel inquiry`} className="btn btn-primary" style={{ justifyContent: 'center', textDecoration: 'none' }}>
                <Mail size={14} /> Reply by Email
              </a>
              <div style={{ display: 'flex', gap: 8 }}>
                {selected.status !== 'replied' && (
                  <button onClick={() => updateStatus(selected.id, 'replied')} disabled={updatingId === selected.id} className="btn btn-outline" style={{ flex: 1, fontSize: 12, justifyContent: 'center' }}>
                    <CheckCircle2 size={13} /> Mark Replied
                  </button>
                )}
                {selected.status !== 'archived' && (
                  <button onClick={() => updateStatus(selected.id, 'archived')} disabled={updatingId === selected.id} className="btn btn-ghost" style={{ flex: 1, fontSize: 12, justifyContent: 'center', color: 'var(--text-3)' }}>
                    <Archive size={13} /> Archive
                  </button>
                )}
              </div>
              {selected.status === 'archived' && (
                <button onClick={() => updateStatus(selected.id, 'new')} disabled={updatingId === selected.id} className="btn btn-outline" style={{ fontSize: 12, justifyContent: 'center' }}>
                  Restore
                </button>
              )}
            </div>

            {/* Status selector */}
            <div style={{ marginBottom: 16 }}>
              <p className="text-3" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Change Status</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['new', 'read', 'replied', 'archived'] as InquiryStatus[]).map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)} disabled={selected.status === s || updatingId === selected.id} className={`btn ${selected.status === s ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 11, padding: '4px 10px' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="text-3" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Internal Notes</p>
              <textarea className="form-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add private notes about this inquiry…" style={{ resize: 'vertical', marginBottom: 8 }} />
              <button onClick={() => saveNotes(selected.id)} disabled={savingNotes} className="btn btn-outline" style={{ fontSize: 12, width: '100%', justifyContent: 'center' }}>
                {savingNotes ? 'Saving…' : 'Save Notes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
