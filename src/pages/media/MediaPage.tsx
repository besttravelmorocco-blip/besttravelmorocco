import { useRef, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Image, Upload, Search, Trash2, Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SUPABASE_URL = 'https://uxkfqxistjvtofskqtwy.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4a2ZxeGlzdGp2dG9mc2txdHd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ1MjI3MSwiZXhwIjoyMDk1MDI4MjcxfQ.rxGrWajWcJUt71bHr2fQJ4o9nLpHlhVLhFVl0W3CnGI';
const BUCKET = 'images';
const PUBLIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

const storage = createClient(SUPABASE_URL, SERVICE_KEY).storage;

type MediaFile = { id: string; name: string; url: string; size: number };

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    const { data, error } = await storage.from(BUCKET).list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) { toast.error('Failed to load media'); setLoading(false); return; }
    setMedia(
      (data ?? [])
        .filter(f => f.name && !f.name.endsWith('/'))
        .map(f => ({ id: f.id ?? f.name, name: f.name, url: `${PUBLIC_BASE}/${f.name}`, size: f.metadata?.size ?? 0 }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { loadMedia(); }, [loadMedia]);

  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      await Promise.all(Array.from(files).map(async file => {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const { error } = await storage.from(BUCKET).upload(safeName, file, { upsert: true, contentType: file.type });
        if (error) throw error;
      }));
      await loadMedia();
      toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }, [loadMedia]);

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const { error } = await storage.from(BUCKET).remove([name]);
    if (error) { toast.error('Failed to delete'); return; }
    setMedia(prev => prev.filter(m => m.name !== name));
    toast.success('Image deleted');
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    toast.success('URL copied');
    setTimeout(() => setCopied(null), 1500);
  };

  const filtered = media.filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Media Library</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${media.length} file${media.length !== 1 ? 's' : ''} in Supabase Storage`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={15} />}
          {uploading ? 'Uploading…' : 'Upload Images'}
        </button>
        <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => processFiles(e.target.files)} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total Files', value: loading ? '…' : media.length },
          { label: 'Tour Images', value: loading ? '…' : media.filter(m => m.name.startsWith('tour_')).length },
          { label: 'Destination Images', value: loading ? '…' : media.filter(m => m.name.startsWith('dest_')).length },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image size={16} style={{ color: 'var(--sand)' }} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: '"Playfair Display", serif', color: 'var(--text)' }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div
        className="card"
        style={{
          border: `2px dashed ${dragOver ? 'var(--sand)' : 'var(--border)'}`,
          background: dragOver ? 'rgba(201,169,110,.05)' : undefined,
          cursor: 'pointer', marginBottom: 20, transition: 'all .15s ease',
        }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', gap: 8 }}>
          <Upload size={28} style={{ color: dragOver ? 'var(--sand)' : 'var(--text-3)', transition: 'color .15s' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', margin: 0 }}>Drag & drop images here</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>or click to browse — JPG, PNG, WebP</p>
        </div>
      </div>

      {/* Grid */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>
            Files ({filtered.length}{search && media.length !== filtered.length ? ` of ${media.length}` : ''})
          </h3>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
                color: 'var(--text)', fontSize: 13, outline: 'none', width: 200,
              }}
            />
          </div>
        </div>

        <div style={{ padding: 20 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 10, color: 'var(--text-3)' }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 13 }}>Loading from storage…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', color: 'var(--text-3)' }}>
              <Image size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ fontSize: 13, margin: 0 }}>{search ? 'No images match your search' : 'No images uploaded yet'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {filtered.map(m => (
                <div
                  key={m.id}
                  style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}
                  onMouseEnter={e => { const el = e.currentTarget.querySelector<HTMLElement>('.media-actions'); if (el) el.style.opacity = '1'; }}
                  onMouseLeave={e => { const el = e.currentTarget.querySelector<HTMLElement>('.media-actions'); if (el) el.style.opacity = '0'; }}
                >
                  <div style={{ height: 90, background: 'var(--bg)', overflow: 'hidden' }}>
                    <img src={m.url} alt={m.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '6px 8px' }}>
                    <div style={{ fontSize: 10.5, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.name}>{m.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', opacity: 0.7 }}>{formatSize(m.size)}</div>
                  </div>
                  <div className="media-actions" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', opacity: 0, transition: 'opacity .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <button
                      title="Copy URL"
                      onClick={() => handleCopy(m.url, m.id)}
                      style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                    >
                      {copied === m.id ? <Check size={14} style={{ color: '#4ade80' }} /> : <Copy size={14} />}
                    </button>
                    <button
                      title="Delete"
                      onClick={() => handleDelete(m.name)}
                      style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
