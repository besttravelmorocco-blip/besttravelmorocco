import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Package, FileText, LayoutDashboard, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Group = 'Products' | 'Blog' | 'Pages';

interface ResultItem {
  id: string;
  label: string;
  meta?: string;
  href: string;
  group: Group;
}

const PAGES: { label: string; href: string }[] = [
  { label: 'Dashboard',             href: '/'                },
  { label: 'Products / Tours',      href: '/products'        },
  { label: 'Blog Posts',            href: '/blog'            },
  { label: 'Inquiries',             href: '/inquiries'       },
  { label: 'Bookings',              href: '/bookings'        },
  { label: 'Customers',             href: '/customers'       },
  { label: 'Custom Tour Requests',  href: '/custom-tours'    },
  { label: 'Destinations',          href: '/destinations'    },
  { label: 'Accommodations',        href: '/accommodations'  },
  { label: 'Staff',                 href: '/staff'           },
  { label: 'Departures',            href: '/departures'      },
  { label: 'Pricing Engine',        href: '/pricing'         },
  { label: 'Reports',               href: '/reports'         },
  { label: 'Testimonials',          href: '/testimonials'    },
  { label: 'FAQs',                  href: '/faqs'            },
  { label: 'Coupons',               href: '/coupons'         },
  { label: 'Suppliers',             href: '/suppliers'       },
  { label: 'Vehicles',              href: '/vehicles'        },
  { label: 'Media',                 href: '/media'           },
  { label: 'Homepage Builder',      href: '/homepage-builder'},
  { label: 'Email Templates',       href: '/email-templates' },
  { label: 'Team & Roles',          href: '/team'            },
  { label: 'Settings',              href: '/settings'        },
];

function statusColor(s: string) {
  if (s === 'published') return 'var(--status-success)';
  if (s === 'archived')  return 'var(--text-3)';
  return 'var(--status-warning)';
}

const KBD: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '1px 5px', borderRadius: 4,
  background: 'var(--bg)', border: '1px solid var(--border)',
  fontSize: 10.5, fontFamily: 'Jost, sans-serif', color: 'var(--text-3)',
  lineHeight: 1.6,
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ open, onClose }: Props) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const quickLinks = useMemo<ResultItem[]>(
    () => PAGES.slice(0, 9).map(p => ({ id: p.href, label: p.label, href: p.href, group: 'Pages' as Group })),
    [],
  );

  // Reset & focus on open
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setResults(quickLinks);
    setActiveIdx(0);
    const t = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [open, quickLinks]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) { setResults(quickLinks); return; }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const [prodRes, blogRes] = await Promise.all([
          supabase.from('products').select('id, title, status').ilike('title', `%${q}%`).limit(5),
          supabase.from('blog_posts').select('id, title, status').ilike('title', `%${q}%`).limit(4),
        ]);
        const items: ResultItem[] = [];
        for (const p of (prodRes.data ?? [])) {
          items.push({ id: `prod-${p.id}`, label: p.title, meta: p.status as string, href: `/products/${p.id}/edit`, group: 'Products' });
        }
        for (const b of (blogRes.data ?? [])) {
          items.push({ id: `blog-${b.id}`, label: b.title, meta: b.status as string, href: '/blog', group: 'Blog' });
        }
        const pageHits = PAGES
          .filter(p => p.label.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 4)
          .map(p => ({ id: p.href, label: p.label, href: p.href, group: 'Pages' as Group }));
        items.push(...pageHits);
        setResults(items);
        setActiveIdx(0);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query, open, quickLinks]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')    { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && results[activeIdx]) {
        navigate(results[activeIdx].href);
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, results, activeIdx, navigate, onClose]);

  // Scroll active item into view
  useEffect(() => {
    (listRef.current?.querySelector(`[data-idx="${activeIdx}"]`) as HTMLElement | null)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  // Group results while preserving flat index
  const grouped = useMemo(() => {
    const map = new Map<Group, (ResultItem & { flatIdx: number })[]>();
    results.forEach((r, i) => {
      if (!map.has(r.group)) map.set(r.group, []);
      map.get(r.group)!.push({ ...r, flatIdx: i });
    });
    return map;
  }, [results]);

  if (!open) return null;

  const hasResults = results.length > 0;
  const isEmpty    = query.trim() && !loading && !hasResults;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '11vh',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 901,
        width: 'min(560px, calc(100vw - 32px))',
        fontFamily: 'Jost, sans-serif',
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}>

          {/* Input row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '13px 16px',
            borderBottom: hasResults || isEmpty ? '1px solid var(--border)' : 'none',
          }}>
            <Search size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, blog posts, pages…"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 14, color: 'var(--text)', fontFamily: 'Jost, sans-serif',
              }}
            />
            {loading && (
              <div style={{
                width: 14, height: 14, borderRadius: '50%',
                border: '2px solid var(--border)', borderTopColor: 'var(--sand)',
                animation: 'gspin .7s linear infinite', flexShrink: 0,
              }} />
            )}
            {query && !loading && (
              <button
                onClick={() => setQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2, display: 'flex', borderRadius: 4 }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Results list */}
          {hasResults && (
            <div ref={listRef} style={{ maxHeight: 380, overflowY: 'auto' }}>
              {Array.from(grouped.entries()).map(([group, items]) => (
                <div key={group}>
                  <div style={{
                    padding: '8px 16px 3px',
                    fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                    color: 'var(--text-3)',
                  }}>
                    {query.trim() ? group : 'Quick Links'}
                  </div>
                  {items.map(item => {
                    const active = item.flatIdx === activeIdx;
                    return (
                      <button
                        key={item.id}
                        data-idx={item.flatIdx}
                        onClick={() => { navigate(item.href); onClose(); }}
                        onMouseEnter={() => setActiveIdx(item.flatIdx)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          width: '100%', padding: '9px 16px',
                          background: active ? 'var(--bg-hover)' : 'transparent',
                          border: 'none', cursor: 'pointer', textAlign: 'left',
                          color: 'var(--text)', fontFamily: 'Jost, sans-serif',
                          transition: 'background .1s',
                        }}
                      >
                        <span style={{ color: 'var(--text-3)', flexShrink: 0, display: 'flex' }}>
                          {group === 'Products'
                            ? <Package size={13} />
                            : group === 'Blog'
                              ? <FileText size={13} />
                              : <LayoutDashboard size={13} />}
                        </span>
                        <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.label}
                        </span>
                        {item.meta && (
                          <span style={{ fontSize: 11, color: statusColor(item.meta), flexShrink: 0 }}>
                            {item.meta}
                          </span>
                        )}
                        <ArrowRight size={12} style={{ color: 'var(--text-3)', flexShrink: 0, opacity: active ? 1 : 0, transition: 'opacity .1s' }} />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {isEmpty && (
            <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              No results for "<span style={{ color: 'var(--text-2)' }}>{query}</span>"
            </div>
          )}

          {/* Footer */}
          <div style={{
            padding: '8px 16px',
            borderTop: hasResults || isEmpty ? '1px solid var(--border)' : 'none',
            display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-3)',
          }}>
            <span><kbd style={KBD}>↑↓</kbd> navigate</span>
            <span><kbd style={KBD}>↵</kbd> open</span>
            <span><kbd style={KBD}>Esc</kbd> close</span>
          </div>
        </div>
      </div>

      <style>{`@keyframes gspin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
