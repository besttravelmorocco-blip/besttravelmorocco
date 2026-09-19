import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Inquiry, InquiryStatus, BlockedEmail } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Search, Mail, Phone, MessageSquare, Clock, CheckCircle2,
  Archive, RefreshCw, AlertCircle, Inbox, Trash2, Ban, X,
  Download, ChevronLeft, ChevronRight, ArrowUpDown,
  Users, Globe, Tag, Info, Shield, ShieldOff, SortAsc, SortDesc,
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

const STATUS_META: Record<InquiryStatus | 'all', { label: string; color: string }> = {
  all:      { label: 'All',      color: 'var(--text-3)' },
  new:      { label: 'New',      color: '#F472B6' },
  read:     { label: 'Read',     color: '#60A5FA' },
  replied:  { label: 'Replied',  color: '#34D399' },
  archived: { label: 'Archived', color: 'var(--text-3)' },
};

const BADGE_CLASS: Record<InquiryStatus, string> = {
  new:      'badge-error',
  read:     'badge-info',
  replied:  'badge-success',
  archived: 'badge-default',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateTime(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function exportToCsv(rows: Inquiry[]) {
  const cols: (keyof Inquiry)[] = [
    'id','name','email','phone','country','tour_name','subject','message',
    'travel_date','travelers','adults','children','source','whatsapp_ok',
    'reference_number','status','notes','created_at',
  ];
  const header = cols.join(',');
  const lines = rows.map(r =>
    cols.map(c => {
      const v = r[c];
      if (v == null) return '';
      const s = String(v).replace(/"/g, '""');
      return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s}"` : s;
    }).join(',')
  );
  const blob = new Blob([header + '\n' + lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inquiries_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

interface ConfirmProps {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  extra?: React.ReactNode;
}

function ConfirmModal({ title, message, confirmLabel, danger, onConfirm, onCancel, extra }: ConfirmProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onCancel}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 12, padding: 28, maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.5)' }}
        onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6, marginBottom: extra ? 16 : 24 }}>{message}</p>
        {extra && <div style={{ marginBottom: 20 }}>{extra}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn btn-outline" style={{ fontSize: 13 }}>Cancel</button>
          <button onClick={onConfirm} className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} style={{ fontSize: 13 }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InquiriesPage() {
  const [inquiries, setInquiries]       = useState<Inquiry[]>([]);
  const [blockedEmails, setBlockedEmails] = useState<Set<string>>(new Set());
  const [selected, setSelected]         = useState<Inquiry | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  // Filters & sort
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'all'>('all');
  const [sortDesc, setSortDesc]         = useState(true);
  const [page, setPage]                 = useState(1);

  // Bulk select
  const [checked, setChecked]           = useState<Set<number>>(new Set());

  // Action states
  const [updatingId, setUpdatingId]     = useState<number | null>(null);
  const [notes, setNotes]               = useState('');
  const [savingNotes, setSavingNotes]   = useState(false);

  // Modals
  const [deleteTarget, setDeleteTarget] = useState<'single' | 'bulk' | null>(null);
  const [blockTarget, setBlockTarget]   = useState<Inquiry | null>(null);
  const [blockReason, setBlockReason]   = useState('');
  const [unblockTarget, setUnblockTarget] = useState<string | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [inqRes, blockRes] = await Promise.all([
      supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
      supabase.from('blocked_emails').select('email'),
    ]);
    if (inqRes.error) { setError(inqRes.error.message); setLoading(false); return; }
    setInquiries((inqRes.data ?? []) as Inquiry[]);
    setBlockedEmails(new Set((blockRes.data ?? []).map((r: { email: string }) => r.email.toLowerCase())));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (selected) setNotes(selected.notes ?? '');
  }, [selected?.id]);

  // ── Derived data ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let rows = inquiries.filter(i => {
      const matchQ = !q ||
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        (i.tour_name ?? '').toLowerCase().includes(q) ||
        (i.message ?? '').toLowerCase().includes(q) ||
        (i.subject ?? '').toLowerCase().includes(q) ||
        (i.country ?? '').toLowerCase().includes(q) ||
        (i.reference_number ?? '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || i.status === statusFilter;
      return matchQ && matchStatus;
    });
    rows = [...rows].sort((a, b) => {
      const d = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDesc ? -d : d;
    });
    return rows;
  }, [inquiries, search, statusFilter, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const newCount   = inquiries.filter(i => i.status === 'new').length;
  const allChecked = pageRows.length > 0 && pageRows.every(i => checked.has(i.id));

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [search, statusFilter, sortDesc]);

  // ── Actions ──────────────────────────────────────────────────────────────

  async function updateStatus(id: number, status: InquiryStatus) {
    setUpdatingId(id);
    const { error: e } = await supabase
      .from('inquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (e) { toast.error(`Update failed: ${e.message}`); }
    else {
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
      toast.success(`Marked as ${status}`);
    }
    setUpdatingId(null);
  }

  async function deleteInquiries(ids: number[]) {
    const { error: e } = await supabase.from('inquiries').delete().in('id', ids);
    if (e) { toast.error(`Delete failed: ${e.message}`); return; }
    setInquiries(prev => prev.filter(i => !ids.includes(i.id)));
    if (selected && ids.includes(selected.id)) setSelected(null);
    setChecked(new Set());
    toast.success(`${ids.length} inquiry${ids.length > 1 ? 'ies' : ''} deleted`);
    setDeleteTarget(null);
  }

  async function blockEmail(email: string, reason: string) {
    const { error: e } = await supabase
      .from('blocked_emails')
      .upsert({ email: email.toLowerCase(), reason: reason || null }, { onConflict: 'email' });
    if (e) { toast.error(`Block failed: ${e.message}`); return; }
    setBlockedEmails(prev => new Set([...prev, email.toLowerCase()]));
    // Archive all inquiries from that sender
    const ids = inquiries.filter(i => i.email.toLowerCase() === email.toLowerCase()).map(i => i.id);
    if (ids.length) {
      await supabase.from('inquiries').update({ status: 'archived', updated_at: new Date().toISOString() }).in('id', ids);
      setInquiries(prev => prev.map(i =>
        i.email.toLowerCase() === email.toLowerCase() ? { ...i, status: 'archived' as InquiryStatus } : i
      ));
    }
    toast.success(`${email} blocked`);
    setBlockTarget(null);
    setBlockReason('');
  }

  async function unblockEmail(email: string) {
    const { error: e } = await supabase.from('blocked_emails').delete().eq('email', email.toLowerCase());
    if (e) { toast.error(`Unblock failed: ${e.message}`); return; }
    setBlockedEmails(prev => { const n = new Set(prev); n.delete(email.toLowerCase()); return n; });
    toast.success(`${email} unblocked`);
    setUnblockTarget(null);
  }

  async function saveNotes(id: number) {
    setSavingNotes(true);
    const { error: e } = await supabase
      .from('inquiries')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (e) toast.error(`Save failed: ${e.message}`);
    else {
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, notes } : i));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, notes } : null);
      toast.success('Notes saved');
    }
    setSavingNotes(false);
  }

  function openInquiry(inq: Inquiry) {
    setSelected(inq);
    if (inq.status === 'new') updateStatus(inq.id, 'read');
  }

  // Bulk helpers
  function toggleCheck(id: number) {
    setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleAll() {
    if (allChecked) setChecked(new Set());
    else setChecked(prev => { const n = new Set(prev); pageRows.forEach(i => n.add(i.id)); return n; });
  }
  async function bulkStatus(status: InquiryStatus) {
    const ids = [...checked];
    const { error: e } = await supabase
      .from('inquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', ids);
    if (e) { toast.error(`Bulk update failed: ${e.message}`); return; }
    setInquiries(prev => prev.map(i => ids.includes(i.id) ? { ...i, status } : i));
    if (selected && ids.includes(selected.id)) setSelected(prev => prev ? { ...prev, status } : null);
    setChecked(new Set());
    toast.success(`${ids.length} updated to ${status}`);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading inquiries…</p></div>;
  if (error) return (
    <div className="page-error">
      <AlertCircle size={24} /><p>{error}</p>
      <button className="btn btn-primary" onClick={fetchAll}><RefreshCw size={14} /> Retry</button>
    </div>
  );

  return (
    <div className="page">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            Inquiries
            {newCount > 0 && (
              <span style={{ background: '#F472B6', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                {newCount} new
              </span>
            )}
          </h1>
          <p className="page-subtitle">{inquiries.length} total · {blockedEmails.size} blocked senders</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => exportToCsv(filtered)} className="btn btn-outline" style={{ fontSize: 12 }}>
            <Download size={13} /> Export CSV
          </button>
          <button onClick={fetchAll} className="btn btn-outline"><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* ── Status filter pills ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(Object.keys(STATUS_META) as (InquiryStatus | 'all')[]).map(s => {
          const count = s === 'all' ? inquiries.length : inquiries.filter(i => i.status === s).length;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: 12, gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_META[s].color, flexShrink: 0 }} />
              {STATUS_META[s].label}
              <span style={{ background: statusFilter === s ? 'rgba(255,255,255,.2)' : 'var(--bg-2)', padding: '1px 6px', borderRadius: 10, fontSize: 11 }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: 20, alignItems: 'start' }}>

        {/* ── Left: list ── */}
        <div>
          {/* Search + sort row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div className="search-input-wrap" style={{ flex: 1 }}>
              <Search size={14} />
              <input type="text" placeholder="Search name, email, tour, country, reference…"
                value={search} onChange={e => setSearch(e.target.value)} className="form-input search-input" />
            </div>
            <button onClick={() => setSortDesc(p => !p)} className="btn btn-outline" style={{ fontSize: 12, flexShrink: 0 }}
              title={sortDesc ? 'Newest first' : 'Oldest first'}>
              {sortDesc ? <SortDesc size={14} /> : <SortAsc size={14} />}
              {sortDesc ? 'Newest' : 'Oldest'}
            </button>
          </div>

          {/* ── Bulk toolbar ── */}
          {checked.size > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(201,169,110,.1)', border: '1px solid rgba(201,169,110,.25)', borderRadius: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--sand)', marginRight: 4 }}>
                {checked.size} selected
              </span>
              <button onClick={() => bulkStatus('replied')} className="btn btn-outline" style={{ fontSize: 11, padding: '4px 10px' }}>
                <CheckCircle2 size={12} /> Mark Replied
              </button>
              <button onClick={() => bulkStatus('archived')} className="btn btn-outline" style={{ fontSize: 11, padding: '4px 10px' }}>
                <Archive size={12} /> Archive
              </button>
              <button onClick={() => setDeleteTarget('bulk')} className="btn btn-outline"
                style={{ fontSize: 11, padding: '4px 10px', color: '#EF4444', borderColor: 'rgba(239,68,68,.3)' }}>
                <Trash2 size={12} /> Delete
              </button>
              <button onClick={() => setChecked(new Set())} className="btn btn-ghost"
                style={{ fontSize: 11, padding: '4px 8px', marginLeft: 'auto', color: 'var(--text-3)' }}>
                <X size={12} /> Clear
              </button>
            </div>
          )}

          {/* List */}
          {pageRows.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <Inbox size={32} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
              <p className="text-2">No inquiries found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Select-all row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px', opacity: 0.6 }}>
                <input type="checkbox" checked={allChecked} onChange={toggleAll}
                  style={{ width: 14, height: 14, cursor: 'pointer', flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  Select page ({pageRows.length})
                </span>
              </div>

              {pageRows.map(inq => {
                const isBlocked = blockedEmails.has(inq.email.toLowerCase());
                const isChecked = checked.has(inq.id);
                return (
                  <div key={inq.id}
                    onClick={() => openInquiry(inq)}
                    className="card"
                    style={{
                      cursor: 'pointer', padding: '10px 14px',
                      border: selected?.id === inq.id ? '1px solid var(--sand)' : isBlocked ? '1px solid rgba(239,68,68,.25)' : undefined,
                      opacity: isBlocked ? 0.65 : 1,
                      transition: 'border-color 0.15s, opacity 0.15s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Checkbox */}
                      <input type="checkbox" checked={isChecked}
                        onClick={e => e.stopPropagation()}
                        onChange={() => toggleCheck(inq.id)}
                        style={{ width: 14, height: 14, cursor: 'pointer', flexShrink: 0 }} />

                      {/* Avatar */}
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: inq.status === 'new' ? 'rgba(244,114,182,.15)' : isBlocked ? 'rgba(239,68,68,.1)' : 'var(--bg-2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14,
                        color: inq.status === 'new' ? '#F472B6' : isBlocked ? '#EF4444' : 'var(--sand)',
                      }}>
                        {isBlocked ? <Ban size={14} /> : inq.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                            {inq.name}
                          </span>
                          {inq.status === 'new' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F472B6', flexShrink: 0 }} />}
                          {isBlocked && <span style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,.12)', padding: '1px 5px', borderRadius: 4, flexShrink: 0 }}>BLOCKED</span>}
                          {inq.reference_number && <span style={{ fontSize: 9, color: 'var(--text-3)', flexShrink: 0 }}>#{inq.reference_number}</span>}
                        </div>
                        <div className="text-3" style={{ fontSize: 11, display: 'flex', gap: 6 }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{inq.email}</span>
                          {inq.country && <span>· {inq.country}</span>}
                        </div>
                      </div>

                      {/* Right meta */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span className={`badge ${BADGE_CLASS[inq.status]}`}>{inq.status}</span>
                        <div className="text-3" style={{ fontSize: 10, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                          <Clock size={9} />{fmtDate(inq.created_at)}
                        </div>
                      </div>
                    </div>

                    {/* Tour / subject snippet */}
                    {(inq.tour_name || inq.subject || inq.message) && (
                      <div className="text-3" style={{ fontSize: 11, marginTop: 7, paddingLeft: 58, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inq.tour_name && <span style={{ color: 'var(--sand)', marginRight: 6 }}>{inq.tour_name}</span>}
                        {(inq.subject || inq.message) && <span>{inq.subject ?? inq.message}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, padding: '10px 0' }}>
              <span className="text-3" style={{ fontSize: 12 }}>
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn btn-outline" style={{ padding: '6px 10px' }}>
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`btn ${p === page ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '6px 12px', fontSize: 13 }}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="btn btn-outline" style={{ padding: '6px 10px' }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: detail panel ── */}
        {selected && (
          <div className="card" style={{ position: 'sticky', top: 24, alignSelf: 'start', maxHeight: 'calc(100vh - 110px)', overflowY: 'auto' }}>
            {/* Panel header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>{selected.name}</h3>
                  <span className={`badge ${BADGE_CLASS[selected.status]}`}>{selected.status}</span>
                  {blockedEmails.has(selected.email.toLowerCase()) && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,.12)', padding: '2px 6px', borderRadius: 4 }}>BLOCKED</span>
                  )}
                </div>
                {selected.reference_number && (
                  <span className="text-3" style={{ fontSize: 11 }}>Ref #{selected.reference_number}</span>
                )}
              </div>
              <button onClick={() => setSelected(null)} className="btn-icon" style={{ flexShrink: 0 }}>
                <X size={15} />
              </button>
            </div>

            {/* Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16, padding: 14, background: 'var(--bg-2)', borderRadius: 8 }}>
              <a href={`mailto:${selected.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--sand)', textDecoration: 'none', wordBreak: 'break-all' }}>
                <Mail size={13} style={{ flexShrink: 0 }} />{selected.email}
              </a>
              {selected.phone && (
                <a href={`tel:${selected.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-2)', textDecoration: 'none' }}>
                  <Phone size={13} style={{ flexShrink: 0 }} />{selected.phone}
                </a>
              )}
              {selected.phone && (
                <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#25D366', textDecoration: 'none' }}>
                  <MessageSquare size={13} style={{ flexShrink: 0 }} />
                  WhatsApp {selected.whatsapp_ok && <span style={{ fontSize: 10, color: '#34D399' }}>• OK to contact</span>}
                </a>
              )}
            </div>

            {/* Trip details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 16 }}>
              {([
                ['Tour',         selected.tour_name],
                ['Travel date',  selected.travel_date ? fmtDate(selected.travel_date) : null],
                ['Travelers',    selected.travelers != null ? String(selected.travelers) : null],
                ['Adults',       selected.adults != null ? String(selected.adults) : null],
                ['Children',     selected.children != null ? String(selected.children) : null],
                ['Country',      selected.country],
                ['Source',       selected.source],
                ['Agreed terms', selected.agreed_terms != null ? (selected.agreed_terms ? 'Yes' : 'No') : null],
              ] as [string, string | null][]).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ background: 'var(--bg-2)', borderRadius: 6, padding: '8px 10px' }}>
                  <div className="text-3" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-1)', wordBreak: 'break-word' }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Subject */}
            {selected.subject && (
              <div style={{ marginBottom: 14 }}>
                <p className="text-3" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>
                  <Tag size={10} style={{ display: 'inline', marginRight: 4 }} />Subject
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{selected.subject}</p>
              </div>
            )}

            {/* Message */}
            {selected.message && (
              <div style={{ marginBottom: 14 }}>
                <p className="text-3" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>
                  <Info size={10} style={{ display: 'inline', marginRight: 4 }} />Message
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65, whiteSpace: 'pre-wrap', maxHeight: 160, overflowY: 'auto' }}>{selected.message}</p>
              </div>
            )}

            <div className="text-3" style={{ fontSize: 11, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} />{fmtDateTime(selected.created_at)}
            </div>

            {/* ── Primary actions ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <a href={`mailto:${selected.email}?subject=Re: Your Morocco travel inquiry${selected.tour_name ? ` — ${selected.tour_name}` : ''}`}
                className="btn btn-primary" style={{ justifyContent: 'center', textDecoration: 'none', fontSize: 13 }}>
                <Mail size={13} /> Reply by Email
              </a>

              {selected.phone && (
                <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${selected.name.split(' ')[0]}, thank you for your inquiry about ${selected.tour_name ?? 'our Morocco tours'}! I'd love to help you plan your trip. 🌍`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-outline" style={{ justifyContent: 'center', textDecoration: 'none', fontSize: 13, color: '#25D366', borderColor: 'rgba(37,211,102,.3)' }}>
                  <MessageSquare size={13} /> WhatsApp {selected.name.split(' ')[0]}
                </a>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                {selected.status !== 'replied' && (
                  <button onClick={() => updateStatus(selected.id, 'replied')}
                    disabled={updatingId === selected.id} className="btn btn-outline"
                    style={{ flex: 1, fontSize: 12, justifyContent: 'center' }}>
                    <CheckCircle2 size={12} /> Mark Replied
                  </button>
                )}
                {selected.status !== 'archived' && (
                  <button onClick={() => updateStatus(selected.id, 'archived')}
                    disabled={updatingId === selected.id} className="btn btn-ghost"
                    style={{ flex: 1, fontSize: 12, justifyContent: 'center', color: 'var(--text-3)' }}>
                    <Archive size={12} /> Archive
                  </button>
                )}
                {selected.status === 'archived' && (
                  <button onClick={() => updateStatus(selected.id, 'new')}
                    disabled={updatingId === selected.id} className="btn btn-outline"
                    style={{ flex: 1, fontSize: 12, justifyContent: 'center' }}>
                    <RefreshCw size={12} /> Restore
                  </button>
                )}
              </div>
            </div>

            {/* ── Status selector ── */}
            <div style={{ marginBottom: 16 }}>
              <p className="text-3" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>
                <ArrowUpDown size={10} style={{ display: 'inline', marginRight: 4 }} />Change Status
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['new', 'read', 'replied', 'archived'] as InquiryStatus[]).map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)}
                    disabled={selected.status === s || updatingId === selected.id}
                    className={`btn ${selected.status === s ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: 11, padding: '4px 10px' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Block / Delete ── */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {blockedEmails.has(selected.email.toLowerCase()) ? (
                <button onClick={() => setUnblockTarget(selected.email)}
                  className="btn btn-outline" style={{ flex: 1, fontSize: 12, justifyContent: 'center', color: '#34D399', borderColor: 'rgba(52,211,153,.3)' }}>
                  <ShieldOff size={12} /> Unblock Sender
                </button>
              ) : (
                <button onClick={() => { setBlockTarget(selected); setBlockReason(''); }}
                  className="btn btn-outline" style={{ flex: 1, fontSize: 12, justifyContent: 'center', color: '#F97316', borderColor: 'rgba(249,115,22,.3)' }}>
                  <Shield size={12} /> Block Sender
                </button>
              )}
              <button onClick={() => setDeleteTarget('single')}
                className="btn btn-outline" style={{ flex: 1, fontSize: 12, justifyContent: 'center', color: '#EF4444', borderColor: 'rgba(239,68,68,.3)' }}>
                <Trash2 size={12} /> Delete
              </button>
            </div>

            {/* ── Internal notes ── */}
            <div>
              <p className="text-3" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>Internal Notes</p>
              <textarea className="form-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Private notes about this inquiry…" style={{ resize: 'vertical', marginBottom: 8, fontSize: 13 }} />
              <button onClick={() => saveNotes(selected.id)} disabled={savingNotes || notes === (selected.notes ?? '')}
                className="btn btn-outline" style={{ fontSize: 12, width: '100%', justifyContent: 'center' }}>
                {savingNotes ? 'Saving…' : 'Save Notes'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <ConfirmModal
          title={deleteTarget === 'bulk' ? `Delete ${checked.size} inquiries?` : 'Delete inquiry?'}
          message={deleteTarget === 'bulk'
            ? `This will permanently delete ${checked.size} selected inquiries. This cannot be undone.`
            : `This will permanently delete the inquiry from ${selected?.name}. This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            if (deleteTarget === 'bulk') deleteInquiries([...checked]);
            else if (selected) deleteInquiries([selected.id]);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Block email modal ── */}
      {blockTarget && (
        <ConfirmModal
          title={`Block ${blockTarget.email}?`}
          message={`All current and future inquiries from this address will be archived and marked as blocked. You can unblock them at any time.`}
          confirmLabel="Block Sender"
          danger
          onConfirm={() => blockEmail(blockTarget.email, blockReason)}
          onCancel={() => { setBlockTarget(null); setBlockReason(''); }}
          extra={
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 12 }}>Reason (optional)</label>
              <input className="form-input" value={blockReason} onChange={e => setBlockReason(e.target.value)}
                placeholder="e.g. Spam, repeated unwanted contact…" style={{ fontSize: 13 }} />
            </div>
          }
        />
      )}

      {/* ── Unblock confirmation modal ── */}
      {unblockTarget && (
        <ConfirmModal
          title={`Unblock ${unblockTarget}?`}
          message={`This sender will be removed from your blocked list. Their inquiries will remain archived.`}
          confirmLabel="Unblock"
          onConfirm={() => unblockEmail(unblockTarget)}
          onCancel={() => setUnblockTarget(null)}
        />
      )}
    </div>
  );
}
