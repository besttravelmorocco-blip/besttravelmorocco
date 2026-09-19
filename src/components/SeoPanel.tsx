import { useState, useMemo, useEffect } from 'react';
import {
  Sparkles, Search, Globe, Twitter, Linkedin, MessageCircle,
  AlertCircle, CheckCircle2, XCircle, Info, ChevronDown, ChevronUp,
  Loader2, ExternalLink, Eye, Copy,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SeoData {
  seo_title: string;
  seo_description: string;
  focus_keyword: string;
  secondary_keywords: string;    // comma-separated
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_image: string;
  robots_index: boolean;
  robots_follow: boolean;
}

export interface SeoContent {
  title: string;           // the page/post main title
  description: string;     // main body content
  slug: string;            // current URL slug
  contentType: 'tour' | 'product' | 'blog' | 'destination' | 'page';
  hasFaq?: boolean;
  hasImages?: boolean;
  days?: number;
  fromCity?: string;
  price?: string;
}

interface SeoPanelProps {
  value: SeoData;
  onChange: (data: SeoData) => void;
  content: SeoContent;
  siteUrl?: string;
}

export function emptySeoData(): SeoData {
  return {
    seo_title: '', seo_description: '', focus_keyword: '', secondary_keywords: '',
    canonical_url: '', og_title: '', og_description: '', og_image: '',
    twitter_image: '', robots_index: true, robots_follow: true,
  };
}

// ─── SEO Health Score ─────────────────────────────────────────────────────────

interface ScoreCheck {
  id: string;
  label: string;
  pass: boolean;
  weight: number;
  tip?: string;
}

export function calcHealthScore(seo: SeoData, content: SeoContent): { score: number; checks: ScoreCheck[] } {
  const kw = seo.focus_keyword.toLowerCase().trim();
  const title = seo.seo_title.toLowerCase();
  const desc = seo.seo_description.toLowerCase();
  const slug = content.slug.toLowerCase();
  const body = content.description.toLowerCase();
  const wordCount = content.description.split(/\s+/).filter(Boolean).length;

  const checks: ScoreCheck[] = [
    {
      id: 'title_exists', label: 'SEO title is set', weight: 5,
      pass: seo.seo_title.length > 0,
      tip: 'Add an SEO title to tell Google what this page is about.',
    },
    {
      id: 'title_length', label: 'SEO title is 50–60 characters', weight: 5,
      pass: seo.seo_title.length >= 40 && seo.seo_title.length <= 60,
      tip: `Current length: ${seo.seo_title.length}. Keep it between 40–60 characters to avoid truncation in Google.`,
    },
    {
      id: 'desc_exists', label: 'Meta description is set', weight: 5,
      pass: seo.seo_description.length > 0,
      tip: 'A meta description helps Google show a compelling snippet in search results.',
    },
    {
      id: 'desc_length', label: 'Meta description is 120–160 characters', weight: 5,
      pass: seo.seo_description.length >= 100 && seo.seo_description.length <= 160,
      tip: `Current length: ${seo.seo_description.length}. Aim for 120–160 characters.`,
    },
    {
      id: 'kw_exists', label: 'Focus keyword is set', weight: 10,
      pass: kw.length > 0,
      tip: 'Add a focus keyword to measure keyword optimisation across all checks.',
    },
    {
      id: 'kw_in_title', label: 'Focus keyword appears in SEO title', weight: 10,
      pass: kw.length > 0 && title.includes(kw),
      tip: 'Include your focus keyword in the SEO title for stronger relevance signals.',
    },
    {
      id: 'kw_in_desc', label: 'Focus keyword appears in meta description', weight: 5,
      pass: kw.length > 0 && desc.includes(kw),
      tip: 'Including your keyword in the meta description improves click-through rates.',
    },
    {
      id: 'kw_in_slug', label: 'Focus keyword appears in URL slug', weight: 5,
      pass: kw.length > 0 && kw.split(' ').some(w => w.length > 2 && slug.includes(w)),
      tip: 'Keyword-rich URLs help Google understand page relevance.',
    },
    {
      id: 'kw_in_body', label: 'Focus keyword appears in content', weight: 10,
      pass: kw.length > 0 && body.includes(kw),
      tip: 'Your focus keyword should appear naturally in the page content.',
    },
    {
      id: 'og_set', label: 'Open Graph (OG) is configured', weight: 10,
      pass: seo.og_title.length > 0 && seo.og_description.length > 0,
      tip: 'Open Graph data controls how your page looks when shared on Facebook and LinkedIn.',
    },
    {
      id: 'og_image', label: 'OG / social image is set', weight: 5,
      pass: (seo.og_image || seo.twitter_image).length > 0,
      tip: 'Pages with images get far more clicks on social media. Recommended: 1200×630px.',
    },
    {
      id: 'canonical', label: 'Canonical URL is set', weight: 5,
      pass: seo.canonical_url.length > 0,
      tip: 'A canonical URL prevents duplicate content issues and consolidates link equity.',
    },
    {
      id: 'word_count', label: 'Content length is sufficient (300+ words)', weight: 10,
      pass: wordCount >= 300,
      tip: `Current word count: ${wordCount}. Longer content typically ranks better. Aim for 300+ words.`,
    },
    {
      id: 'faq', label: 'FAQ section exists', weight: 5,
      pass: !!content.hasFaq,
      tip: 'FAQs generate FAQ rich snippets in Google and can significantly increase click-through rates.',
    },
    {
      id: 'images', label: 'Images are present', weight: 5,
      pass: !!content.hasImages,
      tip: 'Pages with images have better engagement signals and can appear in Google Image Search.',
    },
  ];

  const earned = checks.filter(c => c.pass).reduce((sum, c) => sum + c.weight, 0);
  const total = checks.reduce((sum, c) => sum + c.weight, 0);
  const score = Math.round((earned / total) * 100);

  return { score, checks };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CharBar({ current, max, warn = 0.8, danger = 0.95 }: { current: number; max: number; warn?: number; danger?: number }) {
  const pct = Math.min((current / max) * 100, 100);
  const color = pct / 100 >= danger ? 'var(--status-error)' : pct / 100 >= warn ? 'var(--status-warning)' : 'var(--sand)';
  return (
    <div style={{ height: 3, borderRadius: 2, marginTop: 5, background: 'var(--border)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 0.2s, background 0.2s', borderRadius: 2 }} />
    </div>
  );
}

function ToggleGroup({ value, onChange, options }: {
  value: boolean;
  onChange: (v: boolean) => void;
  options: [string, boolean, string][];
}) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {options.map(([label, optVal, desc]) => (
        <button
          key={label}
          type="button"
          title={desc}
          onClick={() => onChange(optVal)}
          style={{
            padding: '5px 12px', fontSize: 12, fontWeight: 600, borderRadius: 5,
            border: `1px solid ${value === optVal ? 'var(--sand)' : 'var(--border)'}`,
            background: value === optVal ? 'rgba(201,169,110,0.15)' : 'transparent',
            color: value === optVal ? 'var(--sand)' : 'var(--text-3)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function GooglePreview({ seo, content, siteUrl }: { seo: SeoData; content: SeoContent; siteUrl: string }) {
  const title = seo.seo_title || content.title || 'Page Title';
  const desc = seo.seo_description || content.description.slice(0, 155) || 'Page description will appear here.';
  const url = `${siteUrl}/${content.contentType === 'tour' ? 'tours' : content.contentType === 'product' ? 'tours' : 'blog'}/${content.slug}`;

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        Google Search Preview
      </p>
      <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 10, color: 'white', fontWeight: 700 }}>B</span>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1 }}>Best Travel Morocco</div>
            <div style={{ fontSize: 12, color: '#4d5156', lineHeight: 1.2 }}>{url.length > 50 ? url.slice(0, 50) + '…' : url}</div>
          </div>
        </div>
        <div style={{ color: '#1a0dab', fontSize: 20, lineHeight: 1.3, marginBottom: 3, cursor: 'pointer' }}>
          {title.length > 60 ? title.slice(0, 57) + '...' : title}
        </div>
        <div style={{ color: '#4d5156', fontSize: 14, lineHeight: 1.6 }}>
          {desc.length > 160 ? desc.slice(0, 157) + '...' : desc}
        </div>
      </div>
    </div>
  );
}

type SocialPlatform = 'facebook' | 'linkedin' | 'twitter' | 'whatsapp';

function SocialPreview({ seo, content }: { seo: SeoData; content: SeoContent }) {
  const [platform, setPlatform] = useState<SocialPlatform>('facebook');
  const title = seo.og_title || seo.seo_title || content.title;
  const desc = seo.og_description || seo.seo_description || content.description.slice(0, 100);
  const img = seo.og_image || seo.twitter_image;

  const tabs: { id: SocialPlatform; label: string; icon: React.ReactNode }[] = [
    { id: 'facebook', label: 'Facebook', icon: <Globe size={12} /> },
    { id: 'twitter', label: 'X / Twitter', icon: <Twitter size={12} /> },
    { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={12} /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={12} /> },
  ];

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setPlatform(t.id)}
            style={{
              flex: 1, padding: '8px 4px', fontSize: 11, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              borderBottom: platform === t.id ? '2px solid var(--sand)' : '2px solid transparent',
              color: platform === t.id ? 'var(--sand)' : 'var(--text-3)',
              background: 'transparent', cursor: 'pointer', transition: 'color 0.15s',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div style={{ padding: 16 }}>
        {platform === 'facebook' && (
          <div style={{ border: '1px solid #dddfe2', borderRadius: 4, overflow: 'hidden', fontFamily: 'Helvetica, Arial, sans-serif', maxWidth: 500 }}>
            {img
              ? <img src={img} alt="OG" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: 180, background: '#e4e6ea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8d91', fontSize: 13 }}>No image set — add an OG image (1200×630px)</div>
            }
            <div style={{ padding: '10px 12px', background: '#f2f3f5' }}>
              <div style={{ fontSize: 12, color: '#606770', textTransform: 'uppercase', marginBottom: 3 }}>besttravelmorocco.com</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2129', lineHeight: 1.3, marginBottom: 4 }}>{title || 'Title'}</div>
              <div style={{ fontSize: 14, color: '#606770', lineHeight: 1.4 }}>{(desc || 'Description').slice(0, 90)}{desc.length > 90 ? '...' : ''}</div>
            </div>
          </div>
        )}
        {platform === 'twitter' && (
          <div style={{ border: '1px solid #e1e8ed', borderRadius: 12, overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', maxWidth: 500 }}>
            {img
              ? <img src={img} alt="Twitter card" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: 180, background: '#e1e8ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8899a6', fontSize: 13 }}>No image — add a Twitter image (1200×600px)</div>
            }
            <div style={{ padding: '10px 14px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#14171a', marginBottom: 2 }}>{title || 'Title'}</div>
              <div style={{ fontSize: 14, color: '#657786' }}>{(desc || '').slice(0, 100)}</div>
              <div style={{ fontSize: 13, color: '#657786', marginTop: 4 }}>besttravelmorocco.com</div>
            </div>
          </div>
        )}
        {platform === 'linkedin' && (
          <div style={{ border: '1px solid rgba(0,0,0,.15)', borderRadius: 4, overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', maxWidth: 500 }}>
            {img
              ? <img src={img} alt="LinkedIn preview" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: 180, background: '#eef3f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00000099', fontSize: 13 }}>No image set</div>
            }
            <div style={{ padding: '8px 12px', background: '#fff' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,.9)', lineHeight: 1.4 }}>{title || 'Title'}</div>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,.6)', marginTop: 2 }}>besttravelmorocco.com</div>
            </div>
          </div>
        )}
        {platform === 'whatsapp' && (
          <div style={{ maxWidth: 380 }}>
            <div style={{ background: '#dcf8c6', borderRadius: 8, padding: 12, display: 'flex', gap: 12, boxShadow: '0 1px 2px rgba(0,0,0,.15)' }}>
              {img && <img src={img} alt="WhatsApp thumb" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#075e54', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title || 'Title'}</div>
                <div style={{ fontSize: 13, color: '#333', lineHeight: 1.4 }}>{(desc || '').slice(0, 80)}{desc.length > 80 ? '...' : ''}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>besttravelmorocco.com</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HealthScore({ seo, content }: { seo: SeoData; content: SeoContent }) {
  const [expanded, setExpanded] = useState(false);
  const { score, checks } = useMemo(() => calcHealthScore(seo, content), [seo, content]);

  const color = score >= 80 ? 'var(--status-success)' : score >= 50 ? 'var(--status-warning)' : 'var(--status-error)';
  const label = score >= 80 ? 'Good' : score >= 50 ? 'Needs Work' : 'Poor';
  const passing = checks.filter(c => c.pass).length;

  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      {/* Score header */}
      <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
          <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="5" />
            <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="5"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }} strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{score}</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>SEO Health</div>
          <div style={{ fontWeight: 600, fontSize: 13, color }}>{label}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{passing}/{checks.length} checks passing</div>
        </div>
        <button type="button" onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Checks list */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '8px 16px 16px' }}>
          {checks.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, paddingTop: 8, paddingBottom: 4 }}>
              <div style={{ flexShrink: 0, marginTop: 1 }}>
                {c.pass
                  ? <CheckCircle2 size={14} style={{ color: 'var(--status-success)' }} />
                  : <XCircle size={14} style={{ color: 'var(--status-error)' }} />
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: c.pass ? 'var(--text)' : 'var(--text-2)', fontWeight: c.pass ? 400 : 500 }}>{c.label}</div>
                {!c.pass && c.tip && (
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1, lineHeight: 1.5 }}>{c.tip}</div>
                )}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>{c.weight}pt</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Structured Data ─────────────────────────────────────────────────────────

function StructuredDataSection({ seo, content, siteUrl }: { seo: SeoData; content: SeoContent; siteUrl: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  const schemas = useMemo(() => {
    const base = siteUrl.replace(/\/$/, '');
    const pageUrl = content.contentType === 'blog'
      ? `${base}/blog/${content.slug}`
      : `${base}/tours/${content.slug}`;

    const list: { type: string; schema: object }[] = [];

    if (content.contentType === 'tour' || content.contentType === 'product') {
      list.push({
        type: 'TouristTrip',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'TouristTrip',
          name: seo.seo_title || content.title,
          description: seo.seo_description || content.description?.slice(0, 200) || '',
          url: pageUrl,
          ...(seo.og_image ? { image: seo.og_image } : {}),
          touristType: ['Cultural', 'Adventure'],
          ...(content.days ? { duration: `P${content.days}D` } : {}),
          ...(content.fromCity ? { departureLocation: { '@type': 'Place', name: `${content.fromCity}, Morocco`, address: { '@type': 'PostalAddress', addressLocality: content.fromCity, addressCountry: 'MA' } } } : {}),
          ...(content.price ? { offers: { '@type': 'Offer', price: content.price.replace(/[^0-9.]/g, '') || '0', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: pageUrl } } : {}),
          provider: { '@type': 'TravelAgency', name: 'Best Travel Morocco', url: base },
        },
      });
    }

    if (content.contentType === 'blog') {
      list.push({
        type: 'BlogPosting',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: seo.seo_title || content.title,
          description: seo.seo_description || content.description?.slice(0, 200) || '',
          url: pageUrl,
          ...(seo.og_image ? { image: { '@type': 'ImageObject', url: seo.og_image } } : {}),
          author: { '@type': 'Organization', name: 'Best Travel Morocco', url: base },
          publisher: { '@type': 'Organization', name: 'Best Travel Morocco', logo: { '@type': 'ImageObject', url: `${base}/logo.png` } },
          mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
        },
      });
    }

    list.push({
      type: 'BreadcrumbList',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: base },
          { '@type': 'ListItem', position: 2, name: content.contentType === 'blog' ? 'Blog' : 'Tours', item: `${base}/${content.contentType === 'blog' ? 'blog' : 'tours'}` },
          { '@type': 'ListItem', position: 3, name: content.title, item: pageUrl },
        ],
      },
    });

    if (content.hasFaq) {
      list.push({
        type: 'FAQPage',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [{ '@type': 'Question', name: 'FAQs from CMS', acceptedAnswer: { '@type': 'Answer', text: 'Add FAQs in the FAQs tab — they populate this schema on the live site.' } }],
        },
      });
    }

    return list;
  }, [seo, content, siteUrl]);

  function copyJson(json: string, id: string) {
    navigator.clipboard.writeText(json).then(() => { setCopied(id); setTimeout(() => setCopied(null), 2000); });
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: 'rgba(74,126,181,0.08)', borderRadius: 6, border: '1px solid rgba(74,126,181,0.2)' }}>
        <Info size={13} style={{ color: '#4a7eb5', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
          Auto-generated from your content. Paste each block inside a{' '}
          <code style={{ fontSize: 11, background: 'var(--bg)', padding: '1px 4px', borderRadius: 3 }}>{'<script type="application/ld+json">'}</code>{' '}
          tag in the public site's <code style={{ fontSize: 11, background: 'var(--bg)', padding: '1px 4px', borderRadius: 3 }}>{'<head>'}</code>.
        </p>
      </div>
      {schemas.map(({ type, schema }) => {
        const json = JSON.stringify(schema, null, 2);
        return (
          <div key={type}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <code style={{ fontSize: 11, background: 'rgba(79,70,229,0.1)', color: '#4f46e5', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{type}</code>
              <button
                type="button"
                onClick={() => copyJson(json, type)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg)', color: copied === type ? 'var(--status-success)' : 'var(--text-3)', cursor: 'pointer' }}
              >
                {copied === type ? <CheckCircle2 size={11} /> : <Copy size={11} />}
                {copied === type ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre style={{ fontSize: 11, background: 'var(--bg)', padding: '10px 12px', borderRadius: 6, overflow: 'auto', maxHeight: 200, border: '1px solid var(--border)', lineHeight: 1.5, color: 'var(--text-2)', margin: 0 }}>
              {json}
            </pre>
          </div>
        );
      })}
    </div>
  );
}

// ─── Internal Linking ─────────────────────────────────────────────────────────

type LinkResult = { id: string; title: string; rtype: 'tour' | 'product' | 'blog' };

function InternalLinksSection({ content }: { content: SeoContent }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LinkResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const seed = content.title.split(' ').slice(0, 2).join(' ');
    if (seed.length > 2) { setQuery(seed); doSearch(seed); }
  }, [content.title]);

  async function doSearch(q: string) {
    if (!q.trim() || q.length < 2) return;
    setSearching(true);
    try {
      const [toursRes, productsRes, blogsRes] = await Promise.all([
        supabase.from('tours').select('id, title').ilike('title', `%${q}%`).eq('status', 'published').limit(4),
        supabase.from('products').select('id, title').ilike('title', `%${q}%`).eq('status', 'published').limit(3),
        supabase.from('blog_posts').select('id, title').ilike('title', `%${q}%`).eq('status', 'published').limit(4),
      ]);
      setResults([
        ...(toursRes.data ?? []).map(t => ({ id: String(t.id), title: t.title, rtype: 'tour' as const })),
        ...(productsRes.data ?? []).map(p => ({ id: String(p.id), title: p.title, rtype: 'product' as const })),
        ...(blogsRes.data ?? []).map(b => ({ id: String(b.id), title: b.title, rtype: 'blog' as const })),
      ]);
    } finally {
      setSearching(false);
    }
  }

  function getUrl(r: LinkResult) {
    return r.rtype === 'blog' ? `https://besttravelmorocco.com/blog/${r.id}` : `https://besttravelmorocco.com/tours/${r.id}`;
  }

  function copyMd(r: LinkResult) {
    navigator.clipboard.writeText(`[${r.title}](${getUrl(r)})`).then(() => {
      setCopied(r.id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const typeStyle: Record<string, [string, string]> = {
    tour:    ['#fef9c3', '#854d0e'],
    product: ['#fef3c7', '#92400e'],
    blog:    ['#dbeafe', '#1e40af'],
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 32 }}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch(query)}
            placeholder="Search for related pages to link to…"
          />
        </div>
        <button type="button" onClick={() => doSearch(query)} disabled={searching} className="btn btn-outline" style={{ flexShrink: 0, fontSize: 12 }}>
          {searching ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : 'Search'}
        </button>
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>
        Click <Copy size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> to copy a Markdown link and paste it into your page content.
      </p>
      {results.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {results.map(r => {
            const [bg, fg] = typeStyle[r.rtype] ?? ['var(--bg)', 'var(--text-3)'];
            return (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 20, background: bg, color: fg, fontWeight: 600, flexShrink: 0, textTransform: 'capitalize' }}>{r.rtype}</span>
                <a href={getUrl(r)} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: 12, color: 'var(--text)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</a>
                <button type="button" title="Copy Markdown link" onClick={() => copyMd(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === r.id ? 'var(--status-success)' : 'var(--text-3)', padding: 4, flexShrink: 0 }}>
                  {copied === r.id ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-3)', fontSize: 12 }}>
          {searching ? 'Searching…' : query ? `No published pages found for "${query}"` : 'Search above to find related pages'}
        </div>
      )}
    </div>
  );
}

// ─── AI Generation ────────────────────────────────────────────────────────────

async function generateSeoWithAI(content: SeoContent): Promise<Partial<SeoData>> {
  const res = await fetch('/api/seo-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: content.title,
      description: content.description,
      contentType: content.contentType,
      slug: content.slug,
      days: content.days,
      fromCity: content.fromCity,
      price: content.price,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─── Main SeoPanel Component ──────────────────────────────────────────────────

export default function SeoPanel({ value, onChange, content, siteUrl = 'https://besttravelmorocco.com' }: SeoPanelProps) {
  const [generating, setGenerating] = useState(false);
  const [section, setSection] = useState<'core' | 'og' | 'robots' | 'schema' | 'links'>('core');

  function set<K extends keyof SeoData>(k: K, v: SeoData[K]) {
    onChange({ ...value, [k]: v });
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const suggestions = await generateSeoWithAI(content);
      onChange({ ...value, ...suggestions });
    } catch (err) {
      console.error('AI SEO generation failed:', err);
    } finally {
      setGenerating(false);
    }
  }

  const previewUrl = seo_url(content, siteUrl);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
      {/* ── LEFT: Input fields ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* AI Generate button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
            Fill in the fields below or let AI generate suggestions.
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white',
              border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600,
              cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.7 : 1,
              boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
            }}
          >
            {generating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
            {generating ? 'Generating…' : '✨ Generate SEO'}
          </button>
        </div>

        {/* Section tabs */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--bg)', borderRadius: 6, padding: 3 }}>
          {([['core', 'Core SEO'], ['og', 'Open Graph'], ['robots', 'Robots'], ['schema', 'Schema'], ['links', 'Links']] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              style={{
                flex: 1, padding: '6px 10px', fontSize: 12, fontWeight: 600, borderRadius: 4,
                background: section === id ? 'var(--bg-card)' : 'transparent',
                color: section === id ? 'var(--text)' : 'var(--text-3)',
                border: 'none', cursor: 'pointer', boxShadow: section === id ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── CORE SEO ────────────────────────────────────────────────────── */}
        {section === 'core' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* SEO Title */}
            <div className="form-group">
              <label className="form-label">
                SEO Title
                <span style={{ fontWeight: 400, color: 'var(--text-3)', marginLeft: 6 }}>
                  {value.seo_title.length}/60
                  {value.seo_title.length >= 40 && value.seo_title.length <= 60 && <span style={{ color: 'var(--status-success)', marginLeft: 4 }}>✓</span>}
                </span>
              </label>
              <input
                className="form-input"
                value={value.seo_title}
                onChange={e => set('seo_title', e.target.value)}
                placeholder={content.title ? `${content.title} | Best Travel Morocco` : 'Enter SEO title…'}
                maxLength={70}
              />
              <CharBar current={value.seo_title.length} max={60} />
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Optimal: 40–60 characters. Appears as the blue link in Google results.</p>
            </div>

            {/* Meta Description */}
            <div className="form-group">
              <label className="form-label">
                Meta Description
                <span style={{ fontWeight: 400, color: 'var(--text-3)', marginLeft: 6 }}>
                  {value.seo_description.length}/160
                  {value.seo_description.length >= 120 && value.seo_description.length <= 160 && <span style={{ color: 'var(--status-success)', marginLeft: 4 }}>✓</span>}
                </span>
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={value.seo_description}
                onChange={e => set('seo_description', e.target.value)}
                placeholder="Compelling summary shown in Google results. Include your focus keyword."
                maxLength={180}
                style={{ resize: 'vertical' }}
              />
              <CharBar current={value.seo_description.length} max={160} />
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Optimal: 120–160 characters. Google may rewrite it, but a good description improves click-through.</p>
            </div>

            {/* Focus Keyword */}
            <div className="form-group">
              <label className="form-label">Focus Keyword</label>
              <input
                className="form-input"
                value={value.focus_keyword}
                onChange={e => set('focus_keyword', e.target.value)}
                placeholder="e.g. sahara desert tour morocco"
              />
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                The main keyword this page should rank for. Used for all health score checks.
              </p>
              {value.focus_keyword && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {[
                    ['In SEO title', value.seo_title.toLowerCase().includes(value.focus_keyword.toLowerCase())],
                    ['In description', value.seo_description.toLowerCase().includes(value.focus_keyword.toLowerCase())],
                    ['In slug', content.slug.toLowerCase().includes(value.focus_keyword.toLowerCase().replace(/\s+/, '-'))],
                    ['In content', content.description.toLowerCase().includes(value.focus_keyword.toLowerCase())],
                  ].map(([label, pass]) => (
                    <span key={label as string} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                      background: pass ? 'rgba(45,138,94,0.1)' : 'rgba(181,74,53,0.1)',
                      color: pass ? 'var(--status-success)' : 'var(--status-error)',
                    }}>
                      {pass ? '✓' : '✗'} {label as string}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Secondary Keywords */}
            <div className="form-group">
              <label className="form-label">Secondary Keywords <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>comma-separated</span></label>
              <input
                className="form-input"
                value={value.secondary_keywords}
                onChange={e => set('secondary_keywords', e.target.value)}
                placeholder="morocco desert tour, sahara camp, camel trekking, merzouga"
              />
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Stored for content optimization guidance. Not rendered as a meta tag.</p>
            </div>
          </div>
        )}

        {/* ── OPEN GRAPH & SOCIAL ──────────────────────────────────────────── */}
        {section === 'og' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: 'rgba(74,126,181,0.08)', borderRadius: 6, border: '1px solid rgba(74,126,181,0.2)' }}>
              <Info size={13} style={{ color: 'var(--status-info)', flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                Open Graph controls how this page appears when shared on Facebook, LinkedIn, and WhatsApp. If left empty, the SEO title and description are used as fallback.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">OG Title <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>optional</span></label>
              <input className="form-input" value={value.og_title} onChange={e => set('og_title', e.target.value)}
                placeholder={value.seo_title || 'Defaults to SEO title'} />
            </div>

            <div className="form-group">
              <label className="form-label">OG Description <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>optional</span></label>
              <textarea className="form-input" rows={3} value={value.og_description} onChange={e => set('og_description', e.target.value)}
                placeholder={value.seo_description || 'Defaults to meta description'} style={{ resize: 'vertical' }} />
            </div>

            <div className="form-group">
              <label className="form-label">
                OG / Facebook Image
                <span style={{ fontWeight: 400, color: 'var(--text-3)', marginLeft: 6 }}>Recommended 1200×630px</span>
              </label>
              <input className="form-input" value={value.og_image} onChange={e => set('og_image', e.target.value)}
                placeholder="https://besttravelmorocco.com/images/og-tour.jpg" />
              {value.og_image && (
                <div style={{ marginTop: 8, borderRadius: 6, overflow: 'hidden', maxWidth: 300 }}>
                  <img src={value.og_image} alt="OG preview" style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                X (Twitter) Card Image
                <span style={{ fontWeight: 400, color: 'var(--text-3)', marginLeft: 6 }}>Recommended 1200×600px</span>
              </label>
              <input className="form-input" value={value.twitter_image} onChange={e => set('twitter_image', e.target.value)}
                placeholder="Defaults to OG image if empty" />
            </div>
          </div>
        )}

        {/* ── ROBOTS & CANONICAL ───────────────────────────────────────────── */}
        {section === 'schema' && (
          <StructuredDataSection seo={value} content={content} siteUrl={siteUrl} />
        )}

        {section === 'links' && (
          <InternalLinksSection content={content} />
        )}

        {section === 'robots' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Canonical URL</label>
              <input
                className="form-input"
                value={value.canonical_url}
                onChange={e => set('canonical_url', e.target.value)}
                placeholder={previewUrl}
              />
              {!value.canonical_url && (
                <button
                  type="button"
                  onClick={() => set('canonical_url', previewUrl)}
                  style={{ marginTop: 6, fontSize: 12, color: 'var(--sand)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  ← Use auto-generated URL
                </button>
              )}
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                Prevents duplicate content. Set this to the preferred URL for this page. Leave empty to use the default.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ marginBottom: 8 }}>Index Setting</label>
              <ToggleGroup
                value={value.robots_index}
                onChange={v => set('robots_index', v)}
                options={[
                  ['Index', true, 'Allow Google to index this page (recommended for published content)'],
                  ['Noindex', false, 'Prevent Google from indexing this page (drafts, private pages)'],
                ]}
              />
              {!value.robots_index && (
                <div style={{ marginTop: 8, display: 'flex', gap: 6, padding: '8px 12px', background: 'rgba(181,74,53,0.08)', borderRadius: 6, border: '1px solid rgba(181,74,53,0.2)' }}>
                  <AlertCircle size={13} style={{ color: 'var(--status-error)', flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: 'var(--status-error)', margin: 0 }}>
                    This page will not appear in Google search results.
                  </p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ marginBottom: 8 }}>Follow Setting</label>
              <ToggleGroup
                value={value.robots_follow}
                onChange={v => set('robots_follow', v)}
                options={[
                  ['Follow', true, 'Allow Google to follow links on this page (recommended)'],
                  ['Nofollow', false, 'Tell Google not to follow links on this page'],
                ]}
              />
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
                Robots meta: <code style={{ fontSize: 11, background: 'var(--bg)', padding: '1px 4px', borderRadius: 3 }}>
                  {value.robots_index ? 'index' : 'noindex'}, {value.robots_follow ? 'follow' : 'nofollow'}
                </code>
              </p>
            </div>

            <div style={{ padding: '12px 14px', background: 'rgba(45,138,94,0.06)', borderRadius: 6, border: '1px solid rgba(45,138,94,0.15)' }}>
              <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>
                The public site reads these settings from the database and renders{' '}
                <code style={{ fontSize: 11, background: 'var(--bg)', padding: '1px 4px', borderRadius: 3 }}>{'<meta name="robots">'}</code>{' '}
                and{' '}
                <code style={{ fontSize: 11, background: 'var(--bg)', padding: '1px 4px', borderRadius: 3 }}>{'<link rel="canonical">'}</code>{' '}
                tags automatically via the <code style={{ fontSize: 11 }}>useSEO</code> hook.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT: Score + Previews ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>
        <HealthScore seo={value} content={content} />
        <GooglePreview seo={value} content={content} siteUrl={siteUrl} />
        <SocialPreview seo={value} content={content} />

        {/* View live page link */}
        {content.slug && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 6,
              fontSize: 12, color: 'var(--text-2)', textDecoration: 'none',
              background: 'var(--bg-card)',
            }}
          >
            <ExternalLink size={12} /> View live page
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function seo_url(content: SeoContent, base: string): string {
  const segment = content.contentType === 'tour' || content.contentType === 'product'
    ? 'tours' : content.contentType === 'blog' ? 'blog' : content.contentType;
  return `${base}/${segment}/${content.slug}`;
}
