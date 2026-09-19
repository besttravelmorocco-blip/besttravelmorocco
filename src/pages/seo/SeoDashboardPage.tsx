import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { calcHealthScore, emptySeoData } from '@/components/SeoPanel';
import type { SeoData, SeoContent } from '@/components/SeoPanel';
import {
  AlertCircle, CheckCircle2, XCircle, RefreshCw, ExternalLink,
  Edit2, ChevronDown, ChevronUp, Loader2, Search, Filter,
} from 'lucide-react';

interface ContentRow {
  id: string;
  title: string;
  ctype: 'tour' | 'product' | 'blog';
  status: string;
  slug: string;
  seo: SeoData;
  content: SeoContent;
  score: number;
  checks: { id: string; pass: boolean; label: string; weight: number }[];
  issues: string[];
}

type IssueFilter =
  | 'all' | 'low_score' | 'missing_title' | 'missing_desc'
  | 'missing_kw' | 'missing_og' | 'noindex';

const ISSUE_LABELS: Record<IssueFilter, string> = {
  all:           'All Content',
  low_score:     'Low Score (<50)',
  missing_title: 'Missing SEO Title',
  missing_desc:  'Missing Meta Description',
  missing_kw:    'Missing Focus Keyword',
  missing_og:    'Missing OG Image',
  noindex:       'Noindex Pages',
};

export default function SeoDashboardPage() {
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<IssueFilter>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'title'>('score');
  const [sortAsc, setSortAsc] = useState(true);
  const [expand, setExpand] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true); setError(null);
    const SEO_COLS = 'id,title,status,seo_title,seo_description,focus_keyword,og_image,canonical_url,robots_index,robots_follow,og_title,og_description,twitter_image';
    const [toursRes, productsRes, blogsRes] = await Promise.all([
      supabase.from('tours').select(`${SEO_COLS},days,from_city,price`).order('title'),
      supabase.from('products').select(`${SEO_COLS},duration_days,from_city,price,slug`).order('title'),
      supabase.from('blog_posts').select(`${SEO_COLS},excerpt,slug`).order('title'),
    ]);
    if (toursRes.error || productsRes.error || blogsRes.error) {
      setError((toursRes.error ?? productsRes.error ?? blogsRes.error)!.message);
      setLoading(false); return;
    }

    const built: ContentRow[] = [];

    for (const p of productsRes.data ?? []) {
      const seo = buildSeoData(p);
      const ct: SeoContent = { title: p.title, description: '', slug: p.slug ?? String(p.id), contentType: 'product', days: p.duration_days, fromCity: p.from_city, price: p.price };
      const { score, checks } = calcHealthScore(seo, ct);
      built.push({ id: String(p.id), title: p.title, ctype: 'product', status: p.status, slug: p.slug ?? String(p.id), seo, content: ct, score, checks, issues: getIssues(seo, score) });
    }

    // Only include legacy tour rows whose id is NOT already covered by a product
    const productIds = new Set(built.map(r => r.id));
    for (const t of toursRes.data ?? []) {
      if (productIds.has(String(t.id))) continue;
      const seo = buildSeoData(t);
      const ct: SeoContent = { title: t.title, description: '', slug: String(t.id), contentType: 'tour', days: t.days, fromCity: t.from_city, price: t.price };
      const { score, checks } = calcHealthScore(seo, ct);
      built.push({ id: String(t.id), title: t.title, ctype: 'tour', status: t.status, slug: String(t.id), seo, content: ct, score, checks, issues: getIssues(seo, score) });
    }

    for (const b of blogsRes.data ?? []) {
      const seo = buildSeoData(b);
      const ct: SeoContent = { title: b.title, description: b.excerpt ?? '', slug: b.slug ?? String(b.id), contentType: 'blog' };
      const { score, checks } = calcHealthScore(seo, ct);
      built.push({ id: String(b.id), title: b.title, ctype: 'blog', status: b.status, slug: b.slug ?? String(b.id), seo, content: ct, score, checks, issues: getIssues(seo, score) });
    }

    setRows(built);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    let list = rows;
    if (search) list = list.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
    switch (filter) {
      case 'low_score':     list = list.filter(r => r.score < 50); break;
      case 'missing_title': list = list.filter(r => !r.seo.seo_title); break;
      case 'missing_desc':  list = list.filter(r => !r.seo.seo_description); break;
      case 'missing_kw':    list = list.filter(r => !r.seo.focus_keyword); break;
      case 'missing_og':    list = list.filter(r => !r.seo.og_image && !r.seo.twitter_image); break;
      case 'noindex':       list = list.filter(r => !r.seo.robots_index); break;
    }
    list = [...list].sort((a, b) => {
      const v = sortBy === 'score' ? a.score - b.score : a.title.localeCompare(b.title);
      return sortAsc ? v : -v;
    });
    return list;
  }, [rows, search, filter, sortBy, sortAsc]);

  const stats = useMemo(() => ({
    total:         rows.length,
    low:           rows.filter(r => r.score < 50).length,
    missingTitle:  rows.filter(r => !r.seo.seo_title).length,
    missingDesc:   rows.filter(r => !r.seo.seo_description).length,
    missingKw:     rows.filter(r => !r.seo.focus_keyword).length,
    missingOg:     rows.filter(r => !r.seo.og_image && !r.seo.twitter_image).length,
    noindex:       rows.filter(r => !r.seo.robots_index).length,
    avgScore:      rows.length ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) : 0,
  }), [rows]);

  function toggleSort(by: 'score' | 'title') {
    if (sortBy === by) setSortAsc(a => !a);
    else { setSortBy(by); setSortAsc(by === 'title'); }
  }

  if (loading) return <div className="page-loading"><div className="spinner" /><p>Analysing SEO health…</p></div>;
  if (error) return (
    <div className="page-error">
      <AlertCircle size={24} /><p>{error}</p>
      <button className="btn btn-primary" onClick={load}><RefreshCw size={14} /> Retry</button>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">SEO Dashboard</h1>
          <p className="page-subtitle">{stats.total} pages analysed · average score {stats.avgScore}/100</p>
        </div>
        <button onClick={load} className="btn btn-outline"><RefreshCw size={14} /> Refresh</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Avg Score', value: `${stats.avgScore}/100`, color: stats.avgScore >= 70 ? 'var(--status-success)' : stats.avgScore >= 45 ? 'var(--status-warning)' : 'var(--status-error)', filter: 'all' as IssueFilter },
          { label: 'Low Score', value: stats.low, color: stats.low > 0 ? 'var(--status-error)' : 'var(--status-success)', filter: 'low_score' as IssueFilter },
          { label: 'No SEO Title', value: stats.missingTitle, color: stats.missingTitle > 0 ? 'var(--status-error)' : 'var(--status-success)', filter: 'missing_title' as IssueFilter },
          { label: 'No Description', value: stats.missingDesc, color: stats.missingDesc > 0 ? 'var(--status-warning)' : 'var(--status-success)', filter: 'missing_desc' as IssueFilter },
          { label: 'No Focus KW', value: stats.missingKw, color: stats.missingKw > 0 ? 'var(--status-warning)' : 'var(--status-success)', filter: 'missing_kw' as IssueFilter },
          { label: 'No OG Image', value: stats.missingOg, color: stats.missingOg > 0 ? 'var(--status-warning)' : 'var(--status-success)', filter: 'missing_og' as IssueFilter },
          { label: 'Noindex', value: stats.noindex, color: stats.noindex > 0 ? 'var(--status-error)' : 'var(--status-success)', filter: 'noindex' as IssueFilter },
        ].map(c => (
          <button
            key={c.filter}
            onClick={() => setFilter(c.filter)}
            style={{
              textAlign: 'center', padding: '14px 12px', background: 'var(--bg-card)',
              border: `1px solid ${filter === c.filter ? 'var(--sand)' : 'var(--border)'}`,
              borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{c.label}</div>
          </button>
        ))}
      </div>

      {/* Filters + search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input className="form-input search-input" style={{ paddingLeft: 32 }} placeholder="Search pages…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Filter size={14} style={{ alignSelf: 'center', color: 'var(--text-3)', flexShrink: 0 }} />
          {(Object.keys(ISSUE_LABELS) as IssueFilter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 11, padding: '4px 10px' }}>
              {ISSUE_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <CheckCircle2 size={32} style={{ color: 'var(--status-success)', margin: '0 auto 12px' }} />
          <p className="text-2">No issues found for this filter</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <button type="button" onClick={() => toggleSort('title')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 12 }}>
                      Page {sortBy === 'title' ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                    </button>
                  </th>
                  <th>Type</th>
                  <th>
                    <button type="button" onClick={() => toggleSort('score')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 12 }}>
                      Score {sortBy === 'score' ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                    </button>
                  </th>
                  <th>Issues</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <>
                    <tr key={row.id} style={{ cursor: 'pointer' }} onClick={() => setExpand(expand === row.id ? null : row.id)}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{row.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                          {row.seo.seo_title || <span style={{ color: 'var(--status-error)' }}>⚠ No SEO title</span>}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'capitalize',
                          background: row.ctype === 'blog' ? '#dbeafe' : row.ctype === 'product' ? '#fef3c7' : '#dcfce7',
                          color: row.ctype === 'blog' ? '#1e40af' : row.ctype === 'product' ? '#92400e' : '#166534',
                        }}>
                          {row.ctype}
                        </span>
                      </td>
                      <td><ScorePill score={row.score} /></td>
                      <td>
                        {row.issues.length === 0
                          ? <span style={{ fontSize: 11, color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> All good</span>
                          : <span style={{ fontSize: 11, color: 'var(--status-error)', display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={12} /> {row.issues.length} issue{row.issues.length !== 1 ? 's' : ''}</span>
                        }
                      </td>
                      <td>
                        <span className={`badge badge-${row.status === 'published' ? 'success' : 'warning'}`}>{row.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <a
                            href={`https://besttravelmorocco.com/${row.ctype === 'blog' ? 'blog' : 'tours'}/${row.slug}`}
                            target="_blank" rel="noopener noreferrer"
                            className="btn-icon" title="View live page"
                            onClick={e => e.stopPropagation()}
                          >
                            <ExternalLink size={13} />
                          </a>
                          <Link
                            to={row.ctype === 'blog' ? '/blog' : row.ctype === 'product' ? `/products/${row.id}/edit` : `/tours/${row.id}/edit`}
                            className="btn-icon" title="Edit SEO"
                            onClick={e => e.stopPropagation()}
                          >
                            <Edit2 size={13} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    {expand === row.id && (
                      <tr key={`${row.id}-detail`}>
                        <td colSpan={6} style={{ background: 'var(--bg)', padding: '12px 16px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 6 }}>
                            {row.checks.map(c => (
                              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                {c.pass
                                  ? <CheckCircle2 size={12} style={{ color: 'var(--status-success)', flexShrink: 0 }} />
                                  : <XCircle size={12} style={{ color: 'var(--status-error)', flexShrink: 0 }} />
                                }
                                <span style={{ color: c.pass ? 'var(--text-2)' : 'var(--text)' }}>{c.label}</span>
                                <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 'auto' }}>{c.weight}pt</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-3)' }}>
            Showing {filtered.length} of {rows.length} pages
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSeoData(row: Record<string, unknown>): SeoData {
  return {
    ...emptySeoData(),
    seo_title:         String(row.seo_title ?? ''),
    seo_description:   String(row.seo_description ?? ''),
    focus_keyword:     String(row.focus_keyword ?? ''),
    og_title:          String(row.og_title ?? ''),
    og_description:    String(row.og_description ?? ''),
    og_image:          String(row.og_image ?? ''),
    twitter_image:     String(row.twitter_image ?? ''),
    canonical_url:     String(row.canonical_url ?? ''),
    robots_index:      row.robots_index !== false,
    robots_follow:     row.robots_follow !== false,
  };
}

function getIssues(seo: SeoData, score: number): string[] {
  const issues: string[] = [];
  if (!seo.seo_title)                         issues.push('Missing SEO title');
  if (!seo.seo_description)                   issues.push('Missing meta description');
  if (!seo.focus_keyword)                     issues.push('No focus keyword');
  if (!seo.og_image && !seo.twitter_image)    issues.push('No social image');
  if (!seo.robots_index)                      issues.push('Noindex');
  if (score < 50)                             issues.push('Low SEO score');
  return issues;
}

function ScorePill({ score }: { score: number }) {
  const color = score >= 70 ? 'var(--status-success)' : score >= 40 ? 'var(--status-warning)' : 'var(--status-error)';
  const bg    = score >= 70 ? 'rgba(45,138,94,0.1)' : score >= 40 ? 'rgba(245,158,11,0.1)' : 'rgba(181,74,53,0.1)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 40, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: bg, color }}>{score}</span>
    </div>
  );
}
