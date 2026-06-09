import { useRef, useState, useEffect, useCallback } from 'react';
import { Image, Upload, Search, Trash2, Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BASE   = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1`;
const KEY    = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const BUCKET = 'images';
const PUBLIC  = `${BASE}/object/public/${BUCKET}`;
const headers = { Authorization: `Bearer ${KEY}`, apikey: KEY };

type MediaFile = { name: string; url: string; size: number };

function fmt(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

async function listFiles(): Promise<MediaFile[]> {
  const res = await fetch(`${BASE}/object/list/${BUCKET}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: '', limit: 1000, sortBy: { column: 'created_at', order: 'desc' } }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data: any[] = await res.json();
  return data
    .filter(f => f.name && !f.name.endsWith('/'))
    .map(f => ({ name: f.name, url: `${PUBLIC}/${f.name}`, size: f.metadata?.size ?? 0 }));
}

async function uploadFile(file: File): Promise<void> {
  const name = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const res = await fetch(`${BASE}/object/${BUCKET}/${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': file.type, 'x-upsert': 'true' },
    body: file,
  });
  if (!res.ok) throw new Error(await res.text());
}

async function deleteFile(name: string): Promise<void> {
  const res = await fetch(`${BASE}/object/${BUCKET}`, {
    method: 'DELETE',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: [name] }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export default function MediaPage() {
  const [files, setFiles]     = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch]   = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied]   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setFiles(await listFiles());
    } catch (e: any) {
      toast.error(`Failed to load: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const upload = useCallback(async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setUploading(true);
    try {
      await Promise.all(Array.from(fileList).map(uploadFile));
      await reload();
      toast.success(`${fileList.length} image${fileList.length > 1 ? 's' : ''} uploaded`);
    } catch (e: any) {
      toast.error(`Upload failed: ${e.message}`);
    } finally {
      setUploading(false);
    }
  }, [reload]);

  const del = async (name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteFile(name);
      setFiles(p => p.filter(f => f.name !== name));
      toast.success('Deleted');
    } catch (e: any) {
      toast.error(`Delete failed: ${e.message}`);
    }
  };

  const copy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    toast.success('URL copied');
    setTimeout(() => setCopied(null), 1500);
  };

  const filtered = files.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Media Library</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${files.length} file${files.length !== 1 ? 's' : ''} in Supabase Storage`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload size={15} />
          {uploading ? 'Uploading…' : 'Upload Images'}
        </button>
        <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => upload(e.target.files)} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total Files',        value: loading ? '…' : files.length },
          { label: 'Tour Images',        value: loading ? '…' : files.filter(f => f.name.startsWith('tour_')).length },
          { label: 'Destination Images', value: loading ? '…' : files.filter(f => f.name.startsWith('dest_')).length },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image size={16} style={{ color: 'var(--sand)' }} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: '"Playfair Display", serif', color: 'var(--text)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div
        className="card"
        style={{ border: `2px dashed ${dragOver ? 'var(--sand)' : 'var(--border)'}`, background: dragOver ? 'rgba(201,169,110,.05)' : undefined, cursor: 'pointer', marginBottom: 20 }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px', gap: 8 }}>
          <Upload size={28} style={{ color: dragOver ? 'var(--sand)' : 'var(--text-3)' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', margin: 0 }}>Drag & drop images here</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>or click to browse — JPG, PNG, WebP</p>
        </div>
      </div>

      {/* Grid */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>
            Files ({filtered.length}{search && files.length !== filtered.length ? ` of ${files.length}` : ''})
          </h3>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input
              placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none', width: 200 }}
            />
          </div>
        </div>

        <div style={{ padding: 20 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 10, color: 'var(--text-3)' }}>
              <Loader2 size={18} className="animate-spin" />
              <span style={{ fontSize: 13 }}>Loading from storage…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', color: 'var(--text-3)' }}>
              <Image size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ fontSize: 13, margin: 0 }}>{search ? 'No images match' : 'No images yet'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {filtered.map(f => (
                <div
                  key={f.name}
                  style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}
                  onMouseEnter={e => { const el = e.currentTarget.querySelector<HTMLElement>('.ma'); if (el) el.style.opacity = '1'; }}
                  onMouseLeave={e => { const el = e.currentTarget.querySelector<HTMLElement>('.ma'); if (el) el.style.opacity = '0'; }}
                >
                  <div style={{ height: 90, background: 'var(--bg)', overflow: 'hidden' }}>
                    <img src={f.url} alt={f.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '6px 8px' }}>
                    <div style={{ fontSize: 10.5, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.name}>{f.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', opacity: 0.7 }}>{fmt(f.size)}</div>
                  </div>
                  <div className="ma" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', opacity: 0, transition: 'opacity .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <button onClick={() => copy(f.url)} title="Copy URL" style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      {copied === f.url ? <Check size={14} style={{ color: '#4ade80' }} /> : <Copy size={14} />}
                    </button>
                    <button onClick={() => del(f.name)} title="Delete" style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
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
