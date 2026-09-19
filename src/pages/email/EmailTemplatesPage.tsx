import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { EmailTemplate } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  RefreshCw, AlertCircle, Save, X, Mail, Eye, EyeOff,
  ChevronRight, Code, Loader2,
} from 'lucide-react';

const TRIGGER_LABELS: Record<string, string> = {
  booking_confirmation: 'Booking Confirmation',
  deposit_receipt: 'Deposit Received',
  balance_reminder: 'Balance Reminder',
  pre_tour: 'Pre-Tour Information',
  review_request: 'Review Request',
};

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [showVariables, setShowVariables] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    const { data, error: e } = await supabase.from('email_templates').select('*').order('name');
    if (e) { setError(e.message); setLoading(false); return; }
    const ts = (data ?? []) as EmailTemplate[];
    setTemplates(ts);
    if (ts.length > 0 && !selected) selectTemplate(ts[0]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []); // eslint-disable-line

  function selectTemplate(t: EmailTemplate) {
    setSelected(t);
    setSubject(t.subject);
    setBodyHtml(t.body_html);
    setPreview(false);
    setShowVariables(false);
  }

  async function save() {
    if (!selected) return;
    if (!subject.trim()) { toast.error('Subject is required'); return; }
    if (!bodyHtml.trim()) { toast.error('Body HTML is required'); return; }
    setSaving(true);
    const { data, error: e } = await supabase
      .from('email_templates')
      .update({ subject: subject.trim(), body_html: bodyHtml, updated_at: new Date().toISOString() })
      .eq('id', selected.id)
      .select().single();
    setSaving(false);
    if (e) { toast.error(e.message); return; }
    const updated = data as EmailTemplate;
    setTemplates(p => p.map(t => t.id === selected.id ? updated : t));
    setSelected(updated);
    toast.success('Template saved');
  }

  async function toggleActive(t: EmailTemplate) {
    const is_active = !t.is_active;
    const { error: e } = await supabase.from('email_templates').update({ is_active, updated_at: new Date().toISOString() }).eq('id', t.id);
    if (e) { toast.error(e.message); return; }
    const updated = { ...t, is_active };
    setTemplates(p => p.map(x => x.id === t.id ? updated : x));
    if (selected?.id === t.id) setSelected(updated);
    toast.success(is_active ? 'Template enabled' : 'Template disabled');
  }

  const hasChanges = selected && (subject !== selected.subject || bodyHtml !== selected.body_html);

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Loading email templates…</p></div>;
  if (error) return <div className="page-error"><AlertCircle size={24} /><p>{error}</p><button className="btn btn-primary" onClick={load}><RefreshCw size={14} /> Retry</button></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Email Templates</h1>
          <p className="page-subtitle">Configure automated email content for each booking milestone</p>
        </div>
        <button onClick={load} className="btn btn-outline"><RefreshCw size={14} /></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Template list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => selectTemplate(t)}
              style={{
                background: selected?.id === t.id ? 'var(--bg-2)' : 'var(--bg-card)',
                border: `1px solid ${selected?.id === t.id ? 'var(--sand)' : 'var(--border)'}`,
                borderRadius: 8, padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <Mail size={14} style={{ color: t.is_active ? 'var(--sand)' : 'var(--text-3)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.name}
                </div>
                <div style={{ fontSize: 10, color: t.is_active ? '#34D399' : 'var(--text-3)', marginTop: 2 }}>
                  {t.is_active ? 'Enabled' : 'Disabled'} · {TRIGGER_LABELS[t.trigger] ?? t.trigger}
                </div>
              </div>
              <ChevronRight size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            </button>
          ))}
        </div>

        {/* Editor */}
        {selected ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>{selected.name}</h3>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Trigger: <code style={{ fontFamily: 'monospace', color: 'var(--sand)' }}>{selected.trigger}</code></div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleActive(selected)} className={`btn ${selected.is_active ? 'btn-outline' : 'btn-primary'}`} style={{ fontSize: 12 }}>
                  {selected.is_active ? <><EyeOff size={13} /> Disable</> : <><Eye size={13} /> Enable</>}
                </button>
                <button onClick={() => setPreview(p => !p)} className={`btn ${preview ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 12 }}>
                  {preview ? <><Code size={13} /> Edit HTML</> : <><Eye size={13} /> Preview</>}
                </button>
                <button onClick={save} disabled={saving || !hasChanges} className="btn btn-primary" style={{ fontSize: 12 }}>
                  {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Save size={13} /> Save</>}
                </button>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="form-label">Email Subject</label>
              <input className="form-input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject line" />
            </div>

            {/* Variables */}
            {selected.variables.length > 0 && (
              <div>
                <button onClick={() => setShowVariables(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)', padding: 0 }}>
                  <Code size={12} />
                  {showVariables ? 'Hide' : 'Show'} available variables ({selected.variables.length})
                </button>
                {showVariables && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {selected.variables.map(v => (
                      <code key={v} style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--sand)', background: 'rgba(201,169,110,.12)', padding: '2px 7px', borderRadius: 4, cursor: 'pointer' }}
                        onClick={() => {
                          const tag = `{{${v}}}`;
                          setBodyHtml(prev => prev + tag);
                          toast.success(`Inserted {{${v}}}`);
                        }}
                        title="Click to insert"
                      >{`{{${v}}}`}</code>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Body */}
            {preview ? (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-3)', marginBottom: 8 }}>HTML Preview</div>
                <div
                  style={{ background: '#fff', borderRadius: 8, padding: 20, minHeight: 300, color: '#1A0F0A', fontSize: 14, lineHeight: 1.7 }}
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>Variables like {'{{client_name}}'} will be replaced with real data when sent.</p>
              </div>
            ) : (
              <div>
                <label className="form-label">Body HTML</label>
                <textarea
                  className="form-input"
                  value={bodyHtml}
                  onChange={e => setBodyHtml(e.target.value)}
                  rows={18}
                  style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6 }}
                  placeholder="<h2>Hi {{client_name}},</h2>..."
                />
              </div>
            )}

            {hasChanges && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(201,169,110,.1)', borderRadius: 7, border: '1px solid rgba(201,169,110,.25)' }}>
                <span style={{ fontSize: 12, color: 'var(--sand)' }}>You have unsaved changes</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setSubject(selected.subject); setBodyHtml(selected.body_html); }} className="btn btn-outline" style={{ fontSize: 12 }}><X size={12} /> Discard</button>
                  <button onClick={save} disabled={saving} className="btn btn-primary" style={{ fontSize: 12 }}>
                    <Save size={12} /> {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <Mail size={32} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
            <p className="text-2">Select a template to edit</p>
          </div>
        )}
      </div>
    </div>
  );
}
