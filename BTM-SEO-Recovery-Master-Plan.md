# Best Travel Morocco - SEO Recovery & Enhancement Master Plan
**Version:** 4.0.0 | **Date:** May 6, 2026
**Prepared by:** KIMI (AI Architect) for Hmad & Gouchti
**Domain:** besttravelmorocco.com

---

## EXECUTIVE SUMMARY

This document is the comprehensive recovery and enhancement plan for besttravelmorocco.com. Due to a system loss, we are rebuilding from source code v3.1.1 (May 3, 2026) and must re-implement 3 major updates that were applied after this version, plus execute the full 90-Day SEO Action Plan. The website is currently LIVE and we must preserve all existing SEO equity while significantly enhancing performance.

**Current Status:**
- Source Code Version: 3.1.1 (May 3, 2026)
- Live Website: https://besttravelmorocco.com/
- Domain Authority: 7+ years
- Current GSC Performance: 1.58K clicks / 154K impressions (6 months)
- Current Average Position: 14.1
- External Links: 116 (from 24+ domains)
- Internal Links: 7,615

---

## PART 1: GOOGLE SEARCH CONSOLE DATA ANALYSIS

### A. Top Performing Pages (Last 6 Months)

| Page | Clicks | Trend | Action Required |
|------|--------|-------|-----------------|
| Homepage (/) | 760 | +21% | Preserve & enhance |
| /posts/what-is-berber-amazigh-jewellery | 176 | Flat | Preserve, add schema |
| /highlights/ziz-valley-morocco | 157 | -22% | Optimize title/content |
| /posts/the-berber-queen-kahina | 56 | -53% | Refresh content |
| /posts/sleep-among-a-million-stars-a-magical-night-in-moroccos-sahara-desert | 50 | -40% | Update & republish |

### B. Top Performing Pages (Last 28 Days)

| Page | Clicks | Trend | Notes |
|------|--------|-------|-------|
| Homepage | 202 | -10% | Main conversion page |
| /highlights/ziz-valley-morocco | 63 | +29% | Rising star - optimize |
| /posts/what-is-berber-amazigh-jewellery | 37 | -18% | Needs refresh |
| /highlights/corniche-of-tangier | 20 | +5% | Stable |
| /posts/the-berber-queen-kahina | 14 | -36% | Declining |

### C. Trending UP (Last 28 Days) - Capitalize On These

| Page | Growth | Clicks Change | Priority Action |
|------|--------|---------------|-----------------|
| /highlights/ziz-valley-morocco | +29% | +14 | Full schema + FAQ |
| /highlights/rainbow-street | +250% | +5 | Content expansion |
| /highlights/organic-argan-oil-cooperatives | +67% | +4 | Add details |
| /highlights/rif-mountains | +200% | +4 | Content refresh |
| /highlights/ait-bouguemez | New | +3 | Brand new - build out |

### D. Top Search Queries (Last 28 Days)

| Query | Clicks | Trend | Notes |
|-------|--------|-------|-------|
| "best travel morocco" | 84 | -2% | Brand term - #1 priority |
| "ziz valley morocco" | 42 | +133% | Big winner - expand |
| "morocco travel" | ~30 | Stable | High volume, compete |
| "best travel" | ~20 | Stable | Generic, hard to rank |
| "corniche tangier" | ~15 | Stable | Local term |

### E. Link Profile Summary

**External Links: 116 total**
- Homepage: 53 links from 24 sites
- /destinations/fes: 28 links from 3 sites
- /posts/the-berber-queen-kahina: 11 links from 2 sites
- /highlights/ziz-valley-morocco: 3 links from 3 sites
- /tours/10-days-landscapes-of-morocco-tour: 3 links from 1 site
- Many other pages: 1-2 links each

**Internal Links: 7,615 total** - Strong internal linking structure

---

## PART 2: SOURCE CODE AUDIT (Current State - v3.1.1)

### A. Technology Stack
- React 19 + TypeScript + Vite
- Tailwind CSS v3
- Lucide React Icons
- React Router DOM (HashRouter for SPA)
- 84+ pages prerendered via prerender.cjs
- Static build output (dist/ folder)

### B. SEO Features ALREADY Implemented (Preserve These)

| Feature | Status | Notes |
|---------|--------|-------|
| Basic title tags | Exists | Need optimization per audit |
| Meta descriptions | Exists | Need verification & expansion |
| OG tags (Open Graph) | Exists | Present on all pages |
| Twitter Card tags | Exists | Present on all pages |
| Canonical URLs | Exists | Via react-helmet-async |
| robots.txt | Exists | Needs audit/optimization |
| XML sitemap | Auto-generated | Generated at build time |
| .htaccess redirects | Exists | SPA routing + old URL redirects |
| Old URL redirects | In App.tsx | 301 redirects preserved |
| TravelAgency schema | Basic | Only in index.html |
| Prerendered pages | 84+ | All routes prerendered |
| Image alt attributes | Basic | Need keyword optimization |

### C. SEO Features MISSING (Critical Gaps)

| Feature | Priority | Impact |
|---------|----------|--------|
| Organization Schema | Critical | Brand recognition in SERPs |
| TouristTrip Schema (33+ tours) | Critical | Rich snippets for tours |
| FAQPage Schema | High | "People Also Ask" visibility |
| BreadcrumbList Schema | High | Navigation breadcrumbs in SERPs |
| AggregateRating Schema | High | Star ratings in search results |
| LocalBusiness Schema | Medium | Local pack visibility |
| WebSite Schema with Sitelinks | Medium | Search box in SERPs |
| Article Schema (blog posts) | Medium | Rich article snippets |
| Product Schema | Medium | Price/availability in SERPs |
| HowTo Schema | Low | Step-by-step rich results |
| VideoObject Schema | Low | Video rich snippets |
| ImageObject Schema | Low | Image search visibility |
| hreflang tags | Future | Multilingual support |

### D. Current Title Tag Audit (18 Pages Manually Reviewed)

| Page | Current Title | Grade | Issue |
|------|--------------|-------|-------|
| / | Morocco's Premier Tour Company - Best Travel Morocco | C | Missing keywords: 'Morocco tours', 'Sahara trips' |
| /tours | Best Morocco Tours & Trips 2024 | B | Old year (2024). Missing 'from Marrakech', 'Sahara' |
| /tailor-made | Tailor Made | D | Title too vague |
| /our-blog | Best Travel Morocco - Your Ultimate Morocco Travel Guide | C | Only 3 posts visible |
| /tours/3-day-marrakech-return | The Sahara in 3 Days - Marrakech Return - Best Travel Morocco | B+ | Good. Add 'desert tour' + FAQ schema |
| /tours/2-day-zagora | Sahara Desert Dream - Best Travel Morocco | C | Missing '2 day' and 'from Marrakech' |
| /tours/3-day-marrakech-to-fes | The Sahara in 3 Days - Marrakech to Fes - Best Travel Morocco | B+ | Good route keyword |
| /tours/10-day-landscapes | Landscapes of Morocco - Best Travel Morocco | C | Missing '10 day' and 'from Casablanca' |
| /tours/imperial-cities | Imperial Cities & The Sahara - Best Travel Morocco | C | Missing '8 day' and route |
| /tours/13-day-best-of | The Best of Morocco - Best Travel Morocco | C | Missing '13 day' and 'Casablanca' |
| /tours/17-day-hidden-treasures | Morocco's Hidden Treasures - Best Travel Morocco | C | Missing '17 day' and route |
| /tours/15-day-hidden-jewels | Morocco's hidden Jewels - Best Travel Morocco | C | Missing '15 day' and 'from Fes' |
| /tours/14-day-classic | Classic Morocco Tour - Best Travel Morocco | C | Missing '14 day' and 'from Marrakech' |
| /tours/14-day-authentic | Authentic Morocco Tour - Best Travel Morocco | C | Missing '14 day' and 'from Casablanca' |
| /tours/13-day-real-morocco | Real Morocco Uncovered - Best Travel Morocco | C | Missing '13 day' and route |
| /tours/13-day-colors | Colors of Morocco - Best Travel Morocco | C | Missing '13 day' and route |
| /tours/11-day-colors | Colours of Morocco - Best Travel Morocco | C | Missing '11 day' |
| Student Trips subdomain | Student Trips to Morocco - Best Travel Morocco | A+ | THE GOLDMINE - fully optimized |

---

## PART 3: THE 3 LOST MAJOR UPDATES (Must Rebuild)

Based on the source code (v3.1.1) vs. what was live on besttravelmorocco.com, these are the 3 major updates that were lost:

### UPDATE 1: SEO-Optimized Title Tags & Meta Descriptions (Phase 2 of 90-Day Plan)
**Status:** LOST - Must Rebuild

All title tags need to be rewritten following this formula:
```
[Tour Name] | [Days] Days [Tour Type] from [City] | 2026 | Best Travel Morocco
```

**Key Pages to Update:**
| Page | Optimized Title |
|------|----------------|
| Homepage | Morocco Tours & Sahara Desert Trips 2026 \| Best Travel Morocco |
| Tours Listing | All Morocco Tours & Trips \| Sahara Desert & Imperial Cities \| 2026 |
| Tailor Made | Custom Morocco Tours \| Tailor Made Private Itineraries \| Best Travel |
| Blog | Morocco Travel Blog \| Tips, Guides & Sahara Desert Tours 2026 |
| 3-Day Marrakech | 3 Day Sahara Desert Tour from Marrakech \| Merzouga Camp \| 2026 |
| 2-Day Zagora | 2 Day Desert Trip from Marrakech to Zagora \| Sahara Camp \| 2026 |
| 3-Day Marrakech-Fes | 3 Day Marrakech to Fes Desert Tour \| Sahara & Atlas Mountains \| 2026 |
| 10-Day Landscapes | 10 Day Morocco Landscapes Tour from Casablanca \| Sahara & Coast \| 2026 |
| 8-Day Imperial | 8 Day Imperial Cities & Sahara Tour \| Casablanca to Marrakech \| 2026 |
| 13-Day Best Of | 13 Day Best of Morocco Tour \| Casablanca, Sahara, Marrakech \| 2026 |
| Student Trips | Student Trips to Morocco \| University & School Tours \| 12+ Years Experience |

### UPDATE 2: Schema.org Structured Data Implementation (Phase 3 of 90-Day Plan)
**Status:** LOST - Must Rebuild

**Schemas Required:**
1. **Organization Schema** - On homepage (company info, logo, contact, social profiles)
2. **TouristTrip Schema** - On all 33+ tour pages (itinerary, duration, price, included items)
3. **FAQPage Schema** - On all tour pages and top blog posts
4. **AggregateRating Schema** - Site-wide (5.0 rating from reviews)
5. **BreadcrumbList Schema** - All pages (navigation path)
6. **LocalBusiness Schema** - Contact page (Marrakech address, phone, hours)
7. **Article Schema** - All 40+ blog posts (author, publish date, modified date)
8. **WebSite Schema** - Homepage (with SearchAction for sitelinks searchbox)

### UPDATE 3: Content Expansion & Technical Enhancements (Phases 4-5 of 90-Day Plan)
**Status:** LOST - Must Rebuild

**Content Expansion:**
- 4 new blog posts targeting high-value keywords
- FAQ sections on top 5 pages
- "People Also Ask" content optimization
- Internal linking strategy (3 links per new post)
- Content refresh on top 5 declining pages

**Technical Enhancements:**
- Image WebP conversion with lazy loading
- Core Web Vitals optimization (target: all "Good")
- Lighthouse audit target: 90+ on all metrics
- Heading hierarchy audit (H1 > H2 > H3)
- Image alt text optimization with keywords
- Canonical tags verification on every page
- 404 error fixes from Search Console

---

## PART 4: 90-DAY SEO ACTION PLAN (Complete Task Breakdown)

### PHASE 1: Foundation & Audit (Weeks 1-2) | 8 Tasks

| # | Task | Owner | Priority | Status |
|---|------|-------|----------|--------|
| 1.1 | Run PageSpeed Insights on top 10 pages | KIMI | High | Pending |
| 1.2 | Audit backlink profile with Ahrefs/SEMrush | Gouchti | High | Pending |
| 1.3 | Document every title tag, meta description, H1 | KIMI | High | Pending |
| 1.4 | Verify Google Search Console property | Gouchti | Critical | Pending |
| 1.5 | Verify Google Analytics 4 tracking | Gouchti | Critical | Pending |
| 1.6 | Check Core Web Vitals report | Gouchti | High | Pending |
| 1.7 | Export all indexed pages from Search Console | Gouchti | High | Pending |
| 1.8 | Identify top 20 pages by organic traffic | KIMI | High | Pending |

### PHASE 2: Title Tags & Content Optimization (Weeks 3-4) | 8 Tasks

| # | Task | Owner | Priority | Status |
|---|------|-------|----------|--------|
| 2.1 | Rewrite all tour page titles with formula | KIMI | Critical | Pending |
| 2.2 | Rewrite homepage title tag | KIMI | Critical | Pending |
| 2.3 | Rewrite blog listing page title | KIMI | High | Pending |
| 2.4 | Rewrite tailor-made page title | KIMI | High | Pending |
| 2.5 | Write unique meta descriptions for all 33+ tours | KIMI | Critical | Pending |
| 2.6 | Add keyword-rich H1 tags where missing | KIMI | High | Pending |
| 2.7 | Update content on top 5 declining pages | KIMI | High | Pending |
| 2.8 | Optimize image alt text with descriptive keywords | KIMI | Medium | Pending |

### PHASE 3: Schema.org & Technical SEO (Weeks 5-6) | 8 Tasks

| # | Task | Owner | Priority | Status |
|---|------|-------|----------|--------|
| 3.1 | Implement Organization Schema on homepage | KIMI | Critical | Pending |
| 3.2 | Implement TouristTrip Schema on all 33+ tour pages | KIMI | Critical | Pending |
| 3.3 | Implement FAQPage Schema on tour pages | KIMI | High | Pending |
| 3.4 | Implement AggregateRating Schema site-wide | KIMI | High | Pending |
| 3.5 | Implement BreadcrumbList Schema on all pages | KIMI | High | Pending |
| 3.6 | Implement LocalBusiness Schema on contact page | KIMI | Medium | Pending |
| 3.7 | Create and submit XML sitemap to Search Console | KIMI | High | Pending |
| 3.8 | Set up robots.txt with proper directives | KIMI | High | Pending |

### PHASE 4: Speed & Polish (Weeks 7-8) | 8 Tasks

| # | Task | Owner | Priority | Status |
|---|------|-------|----------|--------|
| 4.1 | Convert all images to WebP format with lazy loading | KIMI | High | Pending |
| 4.2 | Verify Core Web Vitals are 'Good' on all key pages | Gouchti | Critical | Pending |
| 4.3 | Run Lighthouse audit - target 90+ on all metrics | Gouchti | High | Pending |
| 4.4 | Implement proper heading hierarchy (H1 > H2 > H3) site-wide | KIMI | High | Pending |
| 4.5 | Optimize all image alt text with descriptive keywords | KIMI | Medium | Pending |
| 4.6 | Add hreflang tags if multilingual content expands | KIMI | Low | Pending |
| 4.7 | Set up canonical tags on every page | KIMI | High | Pending |
| 4.8 | Fix any 404 errors from Search Console Coverage report | KIMI | High | Pending |

### PHASE 5: Content Scale & Link Building (Weeks 9-12) | 10 Tasks

| # | Task | Owner | Priority | Status |
|---|------|-------|----------|--------|
| 5.1 | Publish 4 new blog posts targeting "Morocco + keyword" | KIMI | High | Pending |
| 5.2 | Reach out to 10 travel bloggers for guest posts | Gouchti | Medium | Pending |
| 5.3 | Fix broken links across site | KIMI | High | Pending |
| 5.4 | Submit site to 5 Morocco travel directories | Gouchti | Medium | Pending |
| 5.5 | Add "People Also Ask" FAQ sections to 5 top pages | KIMI | High | Pending |
| 5.6 | Create video content for top 3 tours | Gouchti | Medium | Pending |
| 5.7 | Build internal link strategy: 3 links per new post | KIMI | High | Pending |
| 5.8 | Refresh top 5 pages with new content & publish date | KIMI | High | Pending |
| 5.9 | Create comparison content: "BTM vs [competitor]" | KIMI | Low | Pending |
| 5.10 | Monitor and analyze results, adjust strategy | KIMI/Gouchti | High | Pending |

---

## PART 5: IMPLEMENTATION PRIORITY MATRIX

### CRITICAL (Do First - Week 1)
| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| 1 | Verify GSC & GA4 are properly connected | High | 30 min |
| 2 | Preserve all existing URL structures & redirects | Critical | 1 hour |
| 3 | Build and deploy current source code | Critical | 2 hours |
| 4 | Audit all 84+ prerendered pages for completeness | High | 2 hours |
| 5 | Ensure XML sitemap is auto-generating correctly | High | 30 min |

### HIGH (Weeks 1-2)
| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| 6 | Rewrite all title tags following optimized formula | Very High | 4 hours |
| 7 | Write meta descriptions for all 33+ tours | High | 6 hours |
| 8 | Implement Organization + TouristTrip Schema | Very High | 4 hours |
| 9 | Implement FAQPage + BreadcrumbList Schema | High | 3 hours |
| 10 | Add AggregateRating Schema site-wide | High | 1 hour |
| 11 | Verify robots.txt and submit sitemap | High | 30 min |
| 12 | Run PageSpeed Insights & Lighthouse audits | High | 1 hour |

### MEDIUM (Weeks 3-4)
| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| 13 | Convert images to WebP with lazy loading | Medium | 3 hours |
| 14 | Optimize heading hierarchy site-wide | Medium | 2 hours |
| 15 | Refresh content on declining pages | Medium | 4 hours |
| 16 | Implement LocalBusiness + Article Schema | Medium | 2 hours |
| 17 | Add "People Also Ask" FAQ sections | Medium | 3 hours |

### ONGOING (Weeks 5-12)
| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| 18 | Publish 4 new blog posts | High | Ongoing |
| 19 | Internal link building strategy | Medium | Ongoing |
| 20 | Guest post outreach (10 bloggers) | Medium | Ongoing |
| 21 | Directory submissions (5 directories) | Low | Ongoing |
| 22 | Weekly performance monitoring | High | Ongoing |

---

## PART 6: TECHNICAL IMPLEMENTATION DETAILS

### A. Title Tag Formula Implementation

```typescript
// Tour page title formula
`${tour.name} | ${tour.duration} ${tour.type} from ${tour.departureCity} | 2026 | Best Travel Morocco`

// Examples:
// "3 Day Sahara Desert Tour from Marrakech | Merzouga Camp | 2026 | Best Travel Morocco"
// "2 Day Desert Trip from Marrakech to Zagora | Sahara Camp | 2026 | Best Travel Morocco"
```

### B. Schema.org Implementation Strategy

```typescript
// 1. Organization Schema - Homepage only
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Best Travel Morocco",
  "url": "https://besttravelmorocco.com",
  "logo": "https://besttravelmorocco.com/logo.png",
  "sameAs": [
    "https://www.facebook.com/besttravelmorocco",
    "https://www.instagram.com/besttravelmorocco",
    "https://www.tripadvisor.com/...",
    "https://www.youtube.com/..."
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+212-XXX-XXXXXX",
    "contactType": "customer service",
    "availableLanguage": ["English", "French", "Spanish", "Arabic"]
  }
}

// 2. TouristTrip Schema - All tour pages
{
  "@context": "https://schema.org",
  "@type": "TouristTrip",
  "name": "3 Day Sahara Desert Tour from Marrakech",
  "description": "...",
  "itinerary": {
    "@type": "ItemList",
    "itemListElement": [...]
  },
  "offers": {
    "@type": "Offer",
    "price": "...",
    "priceCurrency": "EUR"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "6000"
  }
}

// 3. FAQPage Schema - Tour pages with FAQs
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is included in the tour?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "..."
      }
    }
  ]
}

// 4. BreadcrumbList Schema - All pages
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://besttravelmorocco.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Tours",
      "item": "https://besttravelmorocco.com/tours"
    }
  ]
}
```

### C. robots.txt Configuration

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /thank-you

Sitemap: https://besttravelmorocco.com/sitemap.xml

# Crawl-delay for aggressive bots
User-agent: AhrefsBot
Crawl-delay: 1

User-agent: SemrushBot
Crawl-delay: 1
```

---

## PART 7: KPI TARGETS & SUCCESS METRICS

### 90-Day Targets

| Metric | Current (6mo avg) | 30-Day Target | 60-Day Target | 90-Day Target |
|--------|-------------------|---------------|---------------|---------------|
| Organic Clicks | 1.58K | 1.8K (+14%) | 2.2K (+39%) | 3.0K (+90%) |
| Impressions | 154K | 180K (+17%) | 220K (+43%) | 300K (+95%) |
| Average CTR | 1.0% | 1.1% | 1.2% | 1.5% |
| Average Position | 14.1 | 12.0 | 10.0 | 8.0 |
| Indexed Pages | Verify in GSC | Same + sitemap | +10 new posts | +20 new posts |
| Core Web Vitals | Check GSC | All "Good" | All "Good" | All "Good" |
| Schema Valid | 0 | 10 pages | 40 pages | All 84+ pages |
| Backlinks | 116 | 120 | 130 | 150+ |

### Weekly Monitoring Checklist
- [ ] Check Google Search Console for errors
- [ ] Review Core Web Vitals report
- [ ] Monitor ranking changes for top 10 keywords
- [ ] Check for new 404 errors
- [ ] Review PageSpeed Insights scores
- [ ] Monitor competitor rankings
- [ ] Track backlink growth

---

## PART 8: IMMEDIATE NEXT STEPS (Today)

1. **Build and test the website locally** - Verify all 84+ pages prerender correctly
2. **Deploy to staging environment** - Test before pushing to production
3. **Verify no URLs have changed** - Ensure all existing indexed URLs still work
4. **Confirm redirects are working** - Test all old URL redirects
5. **Submit updated sitemap** - Immediately after deployment
6. **Monitor GSC for 48 hours** - Watch for any crawl errors after update

---

## APPENDIX A: Files Modified in Each Update

### UPDATE 1: Title Tags & Meta (Phase 2)
- `src/pages/TourPage.tsx` - Title formula implementation
- `src/data/tours.ts` - Add SEO fields to tour data
- `src/pages/Home.tsx` - Homepage title optimization
- `src/pages/Tours.tsx` - Tours listing title
- `src/pages/TailorMade.tsx` - Tailor-made page title
- `src/pages/Blog.tsx` - Blog listing title
- `src/components/SEO.tsx` - Enhanced SEO component

### UPDATE 2: Schema.org (Phase 3)
- `src/components/SchemaOrg.tsx` - New schema component
- `src/pages/TourPage.tsx` - Add TouristTrip schema
- `src/pages/Home.tsx` - Add Organization schema
- `src/pages/BlogPost.tsx` - Add Article schema
- `index.html` - Enhanced base schema

### UPDATE 3: Speed & Content (Phases 4-5)
- `vite.config.ts` - Image optimization
- `src/components/LazyImage.tsx` - Lazy loading component
- `src/data/blog.ts` - New blog posts
- Various content files - Updated content

---

## APPENDIX B: Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Ranking drop after deployment | Keep all URLs identical, maintain redirects |
| Schema markup errors | Test with Google's Rich Results Test before deploy |
| Page speed regression | Run Lighthouse before and after, compare scores |
| Content not indexing | Submit sitemap immediately, request indexing in GSC |
| Broken internal links | Run crawler to verify all links before deploy |

---

**Document prepared by KIMI for Best Travel Morocco**
**Mission: Dominate Morocco Travel Search. No limits. Reach the stars.**
