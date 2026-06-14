import { useRef, useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, EyeOff, Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}

// ─── Cursor-aware helpers ─────────────────────────────────────────────────────

function wrapSelection(
  el: HTMLTextAreaElement,
  value: string,
  onChange: (v: string) => void,
  before: string,
  after: string,
  placeholder = 'text'
) {
  const start = el.selectionStart;
  const end   = el.selectionEnd;
  const sel   = value.slice(start, end) || placeholder;
  const next  = value.slice(0, start) + before + sel + after + value.slice(end);
  onChange(next);
  const ns = start + before.length;
  const ne = ns + sel.length;
  requestAnimationFrame(() => { el.focus(); el.setSelectionRange(ns, ne); });
}

function toggleLinePrefix(
  el: HTMLTextAreaElement,
  value: string,
  onChange: (v: string) => void,
  prefix: string
) {
  const pos  = el.selectionStart;
  const ls   = value.lastIndexOf('\n', pos - 1) + 1;
  const hasPrefix = value.slice(ls, ls + prefix.length) === prefix;
  if (hasPrefix) {
    const next = value.slice(0, ls) + value.slice(ls + prefix.length);
    onChange(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(Math.max(ls, pos - prefix.length), Math.max(ls, pos - prefix.length)); });
  } else {
    const next = value.slice(0, ls) + prefix + value.slice(ls);
    onChange(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(pos + prefix.length, pos + prefix.length); });
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MarkdownEditor({ value, onChange, rows = 6, placeholder }: Props) {
  const taRef      = useRef<HTMLTextAreaElement>(null);
  const [preview,  setPreview]  = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [linkUrl,  setLinkUrl]  = useState('');
  const linkSelRef = useRef<{ start: number; end: number; text: string } | null>(null);

  const ta = () => taRef.current!;

  const cmd = useCallback((fn: (el: HTMLTextAreaElement) => void) => {
    if (taRef.current) fn(taRef.current);
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    if (e.key === 'b') { e.preventDefault(); cmd(el => wrapSelection(el, value, onChange, '**', '**', 'bold text')); }
    if (e.key === 'i') { e.preventDefault(); cmd(el => wrapSelection(el, value, onChange, '*', '*', 'italic text')); }
    if (e.key === 'k') { e.preventDefault(); openLinkMode(); }
  }, [value, onChange, cmd]); // eslint-disable-line react-hooks/exhaustive-deps

  function openLinkMode() {
    const el = taRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    linkSelRef.current = { start, end, text: value.slice(start, end) || 'link text' };
    setLinkUrl('');
    setLinkMode(true);
  }

  function confirmLink() {
    const sel = linkSelRef.current;
    if (!sel) return;
    const url  = linkUrl.trim() || 'https://';
    const next = value.slice(0, sel.start) + `[${sel.text}](${url})` + value.slice(sel.end);
    onChange(next);
    setLinkMode(false);
    const el = taRef.current;
    if (el) {
      const ns = sel.start + sel.text.length + url.length + 4;
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(ns, ns); });
    }
  }

  // Auto-focus URL input when link mode opens
  const linkInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (linkMode) linkInputRef.current?.focus(); }, [linkMode]);

  // ── Toolbar button ─────────────────────────────────────────────────────────
  const Btn = ({ title, onClick, children, active }: {
    title: string; onClick: () => void; children: React.ReactNode; active?: boolean;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 4, border: 'none', cursor: 'pointer',
        background: active ? 'rgba(201,169,110,0.22)' : 'transparent',
        color: active ? 'var(--sand)' : 'var(--text-2)',
        transition: 'background 0.15s, color 0.15s',
        fontSize: 11, fontWeight: 700,
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      {children}
    </button>
  );

  const Sep = () => <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 2px' }} />;

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--bg-card)' }}>
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2, padding: '6px 10px',
        borderBottom: '1px solid var(--border)', background: 'var(--bg-2)', flexWrap: 'wrap',
      }}>
        <Btn title="Bold (⌘B)" onClick={() => cmd(el => wrapSelection(el, value, onChange, '**', '**', 'bold text'))}><Bold size={13} /></Btn>
        <Btn title="Italic (⌘I)" onClick={() => cmd(el => wrapSelection(el, value, onChange, '*', '*', 'italic text'))}><Italic size={13} /></Btn>
        <Sep />
        <Btn title="Heading 2" onClick={() => cmd(el => toggleLinePrefix(el, value, onChange, '## '))}><Heading2 size={13} /></Btn>
        <Btn title="Heading 3" onClick={() => cmd(el => toggleLinePrefix(el, value, onChange, '### '))}><Heading3 size={13} /></Btn>
        <Sep />
        <Btn title="Bullet list" onClick={() => cmd(el => toggleLinePrefix(el, value, onChange, '- '))}><List size={13} /></Btn>
        <Btn title="Numbered list" onClick={() => cmd(el => toggleLinePrefix(el, value, onChange, '1. '))}><ListOrdered size={13} /></Btn>
        <Sep />
        <Btn title="Insert link (⌘K)" onClick={openLinkMode} active={linkMode}><Link2 size={13} /></Btn>

        <div style={{ flex: 1 }} />

        <Btn title={preview ? 'Edit' : 'Preview'} onClick={() => setPreview(p => !p)} active={preview}>
          {preview ? <><EyeOff size={12} /><span style={{ marginLeft: 4 }}>Edit</span></> : <><Eye size={12} /><span style={{ marginLeft: 4 }}>Preview</span></>}
        </Btn>
      </div>

      {/* ── Link input bar ────────────────────────────────────────────────── */}
      {linkMode && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
          borderBottom: '1px solid var(--border)', background: 'rgba(201,169,110,0.06)',
        }}>
          <Link2 size={12} style={{ color: 'var(--sand)', flexShrink: 0 }} />
          <input
            ref={linkInputRef}
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirmLink(); if (e.key === 'Escape') setLinkMode(false); }}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 13, fontFamily: 'monospace',
            }}
          />
          <button type="button" onClick={confirmLink}
            style={{ fontSize: 11, fontWeight: 700, color: '#1A0F0A', background: 'var(--sand)', border: 'none', borderRadius: 4, padding: '3px 10px', cursor: 'pointer' }}>
            Insert
          </button>
          <button type="button" onClick={() => setLinkMode(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2 }}>
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Editor / Preview ─────────────────────────────────────────────── */}
      {preview ? (
        <div style={{ padding: '12px 14px', minHeight: rows * 24, color: 'var(--text)', fontSize: 13.5, lineHeight: 1.75 }}
             className="md-preview">
          {value.trim()
            ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sand)', textDecoration: 'underline' }}>{children}</a>, h2: ({ children }) => <h2 style={{ fontSize: 15, fontWeight: 700, margin: '12px 0 4px', color: 'var(--text)' }}>{children}</h2>, h3: ({ children }) => <h3 style={{ fontSize: 13.5, fontWeight: 700, margin: '10px 0 3px', color: 'var(--text)' }}>{children}</h3>, strong: ({ children }) => <strong style={{ fontWeight: 700, color: 'var(--text)' }}>{children}</strong>, ul: ({ children }) => <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0' }}>{children}</ul>, ol: ({ children }) => <ol style={{ listStyle: 'none', padding: 0, margin: '6px 0', counterReset: 'btm-ol' }}>{children}</ol>, li: ({ children }) => <li style={{ paddingLeft: '1.2em', position: 'relative', marginBottom: 3 }}>{children}</li>, p: ({ children }) => <p style={{ marginBottom: '0.6em' }}>{children}</p> }}>{value}</ReactMarkdown>
            : <p style={{ color: 'var(--text-3)', fontStyle: 'italic', fontSize: 12 }}>Nothing to preview yet…</p>
          }
        </div>
      ) : (
        <textarea
          ref={taRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={rows}
          placeholder={placeholder}
          style={{
            display: 'block', width: '100%', padding: '12px 14px', border: 'none', outline: 'none',
            resize: 'vertical', background: 'var(--bg-card)', color: 'var(--text)',
            fontSize: 13.5, lineHeight: 1.7, fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            minHeight: rows * 24,
          }}
        />
      )}

      {/* ── Footer hint ──────────────────────────────────────────────────── */}
      <div style={{ padding: '4px 10px', borderTop: '1px solid var(--border)', background: 'var(--bg-2)', fontSize: 10.5, color: 'var(--text-3)', display: 'flex', gap: 12 }}>
        <span>**bold**</span><span>*italic*</span><span>## H2</span><span>- list</span><span>[text](url)</span>
        <span style={{ marginLeft: 'auto' }}>⌘B · ⌘I · ⌘K</span>
      </div>
    </div>
  );
}
