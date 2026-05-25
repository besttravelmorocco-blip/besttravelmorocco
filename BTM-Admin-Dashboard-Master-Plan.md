# BEST TRAVEL MOROCCO — ADMIN DASHBOARD MASTER PLAN
**Version:** 1.0 | **Date:** May 16, 2026
**Prepared by:** KIMI for Hmad & Gouchti
**Project:** besttravelmorocco.com Admin CMS

---

## EXECUTIVE SUMMARY

This document outlines the complete plan for building a custom **Visual Admin Dashboard** for Best Travel Morocco. Inspired by Elementor (WordPress) but purpose-built for travel tour management, this dashboard will give you full control over every pixel, every word, and every tour on your website — without writing a single line of code.

**Core Philosophy:** *"What You See Is What You Edit"* — Every change in the admin is instantly reflected on the live website.

---

## TABLE OF CONTENTS

1. [Technology Architecture](#1-technology-architecture)
2. [Dashboard Overview (Home Screen)](#2-dashboard-overview)
3. [Module 1: Page Builder ("The Elementor")](#3-module-1-page-builder)
4. [Module 2: Tour Manager](#4-module-2-tour-manager)
5. [Module 3: Blog Manager](#5-module-3-blog-manager)
6. [Module 4: Destination Manager](#6-module-4-destination-manager)
7. [Module 5: Highlight Manager](#7-module-5-highlight-manager)
8. [Module 6: Media Library](#8-module-6-media-library)
9. [Module 7: SEO Manager](#9-module-7-seo-manager)
10. [Module 8: Inquiry & Booking Manager](#10-module-8-inquiry-booking-manager)
11. [Module 9: Testimonial Manager](#11-module-9-testimonial-manager)
12. [Module 10: Theme & Appearance](#12-module-10-theme-appearance)
13. [Module 11: Settings & Integrations](#13-module-11-settings)
14. [Module 12: Analytics Dashboard](#14-module-12-analytics)
15. [Implementation Roadmap](#15-implementation-roadmap)
16. [Security & Authentication](#16-security)

---

## 1. TECHNOLOGY ARCHITECTURE

### A. Stack Selection

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Frontend** | React 19 + TypeScript + Vite | Same stack as website, consistency |
| **UI Library** | Tailwind CSS + shadcn/ui | 40+ pre-built components, fast styling |
| **State Management** | Zustand | Lightweight, simple, no boilerplate |
| **Icons** | Lucide React | Same icon set as website |
| **Charts** | Recharts | Lightweight React charting |
| **Rich Text** | TipTap Editor | Modern, extensible, HTML output |
| **Drag & Drop** | @dnd-kit | Accessible, modern DnD for page builder |
| **Storage Option A** | JSON files on server | For static hosting (Bluehost) |
| **Storage Option B** | SQLite + tRPC API | Full backend with database |
| **Storage Option C** | Supabase/Firebase | Cloud backend, real-time sync |

### B. Architecture Decision: Recommended Approach

**Option B: SQLite + tRPC Backend (Recommended)**

```
Admin Dashboard (React SPA)
    |
    |--- tRPC API calls ---|
    |
SQLite Database (on server)
    |
    |--- JSON export ---|
    |
Static Website (re-build with new data)
```

**Why this approach:**
- Data is stored in a proper database (SQLite — lightweight, no server config needed)
- Admin dashboard is a separate app at `/admin/` on your domain
- Changes are saved to database instantly
- A "Publish" button exports data to JSON/TypeScript files and rebuilds the static site
- Best of both worlds: easy editing + fast static site performance

### C. Database Schema (SQLite)

```sql
-- Tours table
CREATE TABLE tours (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  days INTEGER NOT NULL,
  from_city TEXT,
  to_city TEXT,
  price TEXT,
  image TEXT,
  itinerary JSON,
  included JSON,
  highlights JSON,
  created_at TEXT,
  updated_at TEXT
);

-- Blog posts table
CREATE TABLE blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  image TEXT,
  category TEXT,
  read_time TEXT,
  date TEXT,
  published INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);

-- Destinations table
CREATE TABLE destinations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  category TEXT,
  featured INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);

-- Highlights table
CREATE TABLE highlights (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  category TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- Inquiries table
CREATE TABLE inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  phone TEXT,
  tour_id TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TEXT
);

-- Testimonials table
CREATE TABLE testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  location TEXT,
  text TEXT,
  rating INTEGER,
  image TEXT,
  featured INTEGER DEFAULT 0
);

-- Media files table
CREATE TABLE media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT,
  original_name TEXT,
  mime_type TEXT,
  size INTEGER,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  folder TEXT DEFAULT 'uploads',
  created_at TEXT
);

-- SEO settings table
CREATE TABLE seo_settings (
  page_route TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  keywords TEXT,
  og_image TEXT,
  og_type TEXT,
  canonical TEXT,
  schema_type TEXT,
  custom_schema JSON,
  updated_at TEXT
);

-- Site settings table
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  category TEXT
);
```

---

## 2. DASHBOARD OVERVIEW (HOME SCREEN)

### Visual Design
- Clean, modern admin interface with dark sidebar + light content area
- Sidebar navigation with icons (similar to WordPress admin)
- Top bar with: Site name, "View Website" link, notifications, user avatar

### Widgets (Drag-to-rearrange)

| Widget | Data | Purpose |
|--------|------|---------|
| **Total Tours** | Count from DB | Quick stat |
| **Total Bookings** | Count from inquiries | Business metric |
| **Unread Inquiries** | `status = 'new'` count | Action needed |
| **Monthly Revenue** | Calculated from bookings | Financial overview |
| **Recent Inquiries** | Last 5 inquiries | Quick view |
| **Top Performing Tours** | Most booked tours | Marketing insight |
| **SEO Health Score** | Automated audit | SEO status |
| **Quick Actions** | Buttons: Add Tour, Add Blog, Edit SEO | Fast navigation |

### Layout
```
+----------------------------------------------------------+
|  [Logo]  Best Travel Morocco Admin    [View Site] [Bell] [User] |
+----------+-----------------------------------------------+
|          |                                               |
| DASHBOARD|  Welcome back, Hmad!                          |
|          |                                               |
| Tours    |  [Tours: 33] [Bookings: 156] [Unread: 3]    |
| Blog     |  [Revenue: EUR 12.4K] [SEO Score: 94/100]   |
| Pages    |                                               |
| Media    |  +-------------------+  +-------------------+ |
| SEO      |  | Recent Inquiries  |  | Top Tours         | |
| Inquiries|  | - John from UK... |  | 1. Sahara 3-Day  | |
| Testim.  |  | - Maria from...   |  | 2. Imperial 8-Day| |
| Theme    |  | - Ahmed from...   |  | 3. Yoga Retreat  | |
| Settings |  +-------------------+  +-------------------+ |
|          |                                               |
| Analytics|  [Quick Actions]                              |
|          |  [+ Add Tour] [+ Add Blog] [Edit Home SEO]  |
+----------+-----------------------------------------------+
```

---

## 3. MODULE 1: PAGE BUILDER ("THE ELEMENTOR")

This is the crown jewel — a visual, drag-and-drop page editor that lets you customize any page on the website without touching code.

### A. Page Selector
- Dropdown to select which page to edit:
  - Homepage
  - Tours Listing
  - About
  - Tailor Made
  - Student Trips
  - Events
  - FAQ
  - Destinations
  - Highlights
  - Custom Pages

### B. Visual Editor Interface

```
+----------------------------------------------------------+
| PAGE: Homepage                       [Save] [Preview] [Publish]|
+----------+-----------------------------------------------+
|          |  VISUAL PREVIEW (Live WYSIWYG)                |
| SECTIONS |                                               |
|          |  +-----------------------------------------+  |
| [Hero]   |  | HERO SECTION                            |  |
| [Tours]  |  | "Discover Morocco's Hidden Treasures"  |  |
| [About]  |  | [Background: /images/hero_sahara.jpg]  |  |
| [Stats]  |  | [Edit Text] [Edit Image] [Edit Style]  |  |
| [Dests]  |  +-----------------------------------------+  |
| [Testim] |                                               |
| [CTA]    |  +-----------------------------------------+  |
| [FAQ]    |  | FEATURED TOURS SECTION                  |  |
|          |  | [Tour Card] [Tour Card] [Tour Card]    |  |
|          |  | [Add Tour] [Remove] [Reorder]          |  |
|          |  +-----------------------------------------+  |
|          |                                               |
|          |  +-----------------------------------------+  |
|          |  | STATS SECTION                           |  |
|          |  | "6,000+ Happy Travelers"               |  |
|          |  | [Edit Number] [Edit Label] [Edit Icon]  |  |
|          |  +-----------------------------------------+  |
+----------+-----------------------------------------------+
```

### C. Section Types (Drag from sidebar to page)

| Section | Description | Editable Fields |
|---------|-------------|-----------------|
| **Hero** | Full-width banner with title, subtitle, CTA button, background image | Title, Subtitle, Button text/link, Background image/video, Overlay opacity, Text color |
| **Text Block** | Rich text paragraph with heading | Heading (H1/H2/H3), Body text (TipTap editor), Alignment, Background color |
| **Tour Cards Grid** | Grid of tour cards | Number of cards, Sort order, Filter by category, Card style (horizontal/vertical) |
| **Image Gallery** | Grid of images with captions | Images (upload/multi-select), Caption text, Columns (2-4), Gap size |
| **Stats Counter** | Animated number counters | Numbers, Labels, Icons, Animation speed |
| **Testimonial Slider** | Carousel of customer reviews | Testimonials (select from DB), Autoplay speed, Style (card/quote) |
| **FAQ Accordion** | Expandable Q&A section | FAQ items (question/answer pairs), Style (bordered/card) |
| **CTA Banner** | Call-to-action strip | Text, Button text/link, Background color/image |
| **Destination Grid** | Grid of destination cards | Destinations (select), Card style, Columns |
| **Map Embed** | Embedded Google Map | Map URL, Height, Zoom level |
| **Contact Form** | Inquiry form | Fields (name/email/phone/message), Submit button text, Recipient email |
| **Video Embed** | YouTube/Vimeo embed | Video URL, Thumbnail, Autoplay, Muted |
| **Spacer/Divider** | Empty space or line | Height (px), Divider style (none/line/dashed) |

### D. Element-Level Editing

When you click any element in the preview:

```
+--------------------------------+
| EDIT: Hero Title               |
|                                |
| Text: [Discover Morocco's      |
|        Hidden Treasures        |
|        ]                       |
|                                |
| Font: [Playfair Display ▼]     |
| Size: [48] px                  |
| Color: [#2D1810 ■]            |
| Weight: [700]                  |
|                                |
| [Cancel]         [Save Change] |
+--------------------------------+
```

### E. Drag & Drop Reordering
- Click and drag any section to reorder
- Visual ghost preview while dragging
- Drop zones highlighted

### F. Save / Preview / Publish Flow
1. **Save** — Saves to database (draft)
2. **Preview** — Opens a preview of the page with changes
3. **Publish** — Saves to database + exports to website + triggers rebuild

---

## 4. MODULE 2: TOUR MANAGER

### A. Tours List View
- Table with columns: Title, Days, From/To, Price, Status, Actions
- Filters: By city, by duration, by price range, by status
- Search bar for quick finding
- Bulk actions: Delete, Duplicate, Change status

### B. Add/Edit Tour Form

**Tab 1: Basic Info**
- Tour Title: [____________________]
- Subtitle: [____________________]
- Description: [Rich text editor______]
- Duration (days): [▼]
- Departure City: [Marrakech ▼]
- Arrival City: [Marrakech ▼]
- Price: [EUR ___________]
- Featured Image: [Upload / Select from Media]
- Status: [Draft / Published ▼]

**Tab 2: Itinerary Builder**
- Day-by-day builder:
```
Day 1:
  Title: [____________________]
  Route: [____________________]
  Description: [Rich text________]
  Activities: [+ Add Activity]
  Meals: [☑ Breakfast] [☑ Lunch] [☑ Dinner]
  Accommodation: [____________________]
  Images: [+ Upload]

[+ Add Day] [Duplicate Day] [Delete Day]
```
- Drag to reorder days
- Visual timeline preview

**Tab 3: What's Included**
- Checklist items:
  - [☑] Private air-conditioned transport
  - [☑] English-speaking driver/guide
  - [☑] Accommodation
  - [☑] Breakfast
  - [☑] Camel trek
  - [☐] Lunch
  - [☐] Dinner
  - [+] Add custom item

**Tab 4: Highlights**
- List of tour highlights (bullet points)
- Rich text for descriptions
- Image per highlight

**Tab 5: SEO**
- Page Title: [auto-generated, editable]
- Meta Description: [____________________]
- Keywords: [____________________]
- OG Image: [Select image]
- Canonical URL: [auto-generated]
- Schema Preview: [Live JSON-LD preview]

### C. Tour Duplicator
- Click "Duplicate" on any tour
- Creates a copy with "(Copy)" suffix
- All itinerary, images, and settings copied
- Edit and save as new tour

---

## 5. MODULE 3: BLOG MANAGER

### A. Blog Posts List
- Table: Title, Category, Date, Status, Views, Actions
- Filters: By category, by date, by status
- Search

### B. Blog Post Editor

**Layout: Split-screen (Medium/WordPress style)**
```
+------------------------------------------+
| Title: [______________________________]  |
| Permalink: /blog/[auto-generated-slug]   |
+------------------------------------------+
|                                          |
|  RICH TEXT EDITOR (TipTap)              |
|  [B] [I] [H1] [H2] [Quote] [Link]     |
|  [Image] [Video] [Embed]               |
|                                          |
|  Your blog content here...              |
|  Full formatting support...             |
|                                          |
+--------------+---------------------------+
| SEO Settings | [Publish] [Save Draft]    |
|              | [Preview] [Schedule]      |
| Category:    |                           |
| [Destinations▼| Schedule: [Now ▼]       |
|              |                           |
| Tags:        | Featured Image:           |
| [#morocco    | [Upload / Select]         |
|  #sahara]    |                           |
|              | Author: [Hmad ▼]          |
| Meta Title:  |                           |
| [__________] | Excerpt:                  |
|              | [Auto / Custom]           |
| Description: |                           |
| [__________] |                           |
|              |                           |
+--------------+---------------------------+
```

### C. Rich Text Editor Features
- Bold, italic, underline, strikethrough
- H1, H2, H3 headings
- Bullet and numbered lists
- Blockquotes
- Links (internal + external)
- Images (upload or media library)
- YouTube video embeds
- Tables
- Text alignment
- Code blocks
- Horizontal rules

---

## 6. MODULE 4: DESTINATION MANAGER

### A. Destinations List
- Card grid view (like the website)
- Quick edit: name, description, image
- Drag to reorder

### B. Add/Edit Destination
- Name: [____________________]
- Description: [Rich text______________]
- Category: [Cities ▼]
- Featured Image: [Upload/Select]
- Gallery Images: [+ Add multiple]
- Related Tours: [Select from list ☑]
- SEO tab (title, meta, schema)

---

## 7. MODULE 5: HIGHLIGHT MANAGER

Same pattern as Destination Manager:
- Grid view of all highlights
- Add/edit with: Title, Description, Image, Category
- Related tours linking
- SEO settings

---

## 8. MODULE 6: MEDIA LIBRARY

### A. Interface
```
+----------------------------------------------------------+
| MEDIA LIBRARY                          [Upload] [New Folder]|
+----------------------------------------------------------+
| Folders: [All] [Tours] [Blog] [Destinations] [Highlights]|
+----------------------------------------------------------+
|                                                         |
| [□] [Search: _________________] [Filter: Images ▼]     |
|                                                         |
| +----------+ +----------+ +----------+ +----------+    |
| | [img]    | | [img]    | | [img]    | | [img]    |    |
| | hero_    | | tour_    | | blog_    | | dest_    |    |
| | sahar..  | | marrak.. | | zizva..  | | fes_0..  |    |
| | 245KB    | | 189KB    | | 156KB    | | 203KB    |    |
| | JPG→WEBP | | JPG      | | JPG→WEBP | | JPG      |    |
| +----------+ +----------+ +----------+ +----------+    |
|                                                         |
| Selected: [img] hero_sahara.jpg                         |
| Alt Text: [Sahara desert camel trek at sunset______]   |
| [Copy URL] [Delete] [Replace]                          |
+----------------------------------------------------------+
```

### B. Features
- **Upload**: Drag & drop or click to upload
- **Auto WebP conversion**: JPG/PNG automatically converted to WebP
- **Image optimization**: Auto-resize to web-friendly sizes
- **Alt text editor**: Add SEO-friendly alt text
- **Folders**: Organize by page/tour
- **Bulk upload**: Upload multiple files at once
- **Bulk delete**: Select multiple, delete
- **Search**: Find by filename or alt text
- **Image preview**: Click to preview full-size
- **Dimensions shown**: Width x Height
- **File size**: Original + optimized size

---

## 9. MODULE 7: SEO MANAGER

### A. SEO Dashboard
```
+----------------------------------------------------------+
| SEO MANAGER                                              |
+----------------------------------------------------------+
|                                                          |
| OVERALL HEALTH: 94/100 [Excellent ■■■■■■■■■□]          |
|                                                          |
| Issues: [2 Warnings] [0 Errors] [0 Critical]            |
|                                                          |
| +-------------------+ +-------------------+ +----------+|
| | Missing Titles    | | Missing Meta Desc | | Schema  ||
| | 0 pages           | | 2 pages           | | 27/27 ||
| | [View]            | | [Fix Now]         | | ✓     ||
| +-------------------+ +-------------------+ +----------+|
|                                                          |
| PAGE LIST (All 146 pages):                               |
| Route              | Title              | Meta  | Schema|
| /                  | Morocco Tours...   | 160ch | ✓     |
| /tours             | All Morocco T...   | 298ch | ✓     |
| /tours/3-day-m...  | 3 Days Sahara...   | 245ch | ✓     |
| ...                                                |
+----------------------------------------------------------+
```

### B. Per-Page SEO Editor
- **Tab 1 — Basic**: Title, Description, Keywords, OG Image
- **Tab 2 — Schema**: Select schema type (TouristTrip, Article, FAQPage, etc.), Edit JSON-LD, Live preview
- **Tab 3 — Advanced**: Canonical URL, Robots meta, Hreflang tags
- **Tab 4 — Preview**: Google SERP preview, Facebook preview, Twitter preview

### C. Bulk SEO Editor
- Select multiple pages
- Bulk edit: titles, descriptions, schema type
- Template variables: `{tour_name}`, `{days}`, `{city}`
- Find & Replace across all pages

---

## 10. MODULE 8: INQUIRY & BOOKING MANAGER

### A. Inquiries List
- Table: Name, Email, Phone, Tour, Date, Status, Actions
- Status badges: New (red), Contacted (yellow), Confirmed (green), Closed (gray)
- Filters: By status, by date range, by tour
- Export to CSV/Excel

### B. Inquiry Detail View
```
+----------------------------------------------------------+
| INQUIRY #1234 — [New]                    [Mark Read] [✕]|
+----------------------------------------------------------+
| From: John Smith <john@email.com>                       |
| Phone: +44 7123 456789                                  |
| Date: May 15, 2026 14:30                                |
|                                                          |
| Interested Tour: 3-Day Sahara Desert from Marrakech     |
| Travel Dates: June 10-15, 2026                          |
| Travelers: 2 adults                                     |
|                                                          |
| Message:                                                 |
| "Hi, we're a couple planning our honeymoon..."          |
|                                                          |
| [Reply via Email] [Send WhatsApp] [Call]               |
| [Convert to Booking] [Archive]                         |
+----------------------------------------------------------+
```

### C. Booking Pipeline
- Kanban board style:
  - **New** → **Contacted** → **Quote Sent** → **Confirmed** → **Completed**
- Drag inquiries between columns
- Notes per inquiry
- Automated email templates

---

## 11. MODULE 9: TESTIMONIAL MANAGER

### A. Testimonials List
- Card view with star ratings
- Filters: By rating, by tour, featured status
- Search

### B. Add/Edit Testimonial
- Customer Name: [____________________]
- Location: [____________________]
- Rating: [★★★★★] (click stars)
- Review Text: [Rich text______________]
- Customer Photo: [Upload/Select]
- Tour Taken: [Select from tours ▼]
- Featured: [☑ Show on homepage]
- Date: [____________________]

---

## 12. MODULE 10: THEME & APPEARANCE

### A. Visual Customizer

```
+----------------------------------------------------------+
| THEME CUSTOMIZER                                         |
+----------------------------------------------------------+
|                                                          |
| COLORS:                                                  |
| Primary:   [#D4A574 ■]  (Brand color)                  |
| Secondary: [#2D1810 ■]  (Dark brown)                   |
| Accent:    [#C8553D ■]  (CTA buttons)                  |
| Background:[#FAFAFA ■]  (Page background)              |
| Text:      [#1A1A1A ■]  (Body text)                   |
|                                                          |
| FONTS:                                                   |
| Heading:  [Playfair Display ▼]                          |
| Body:     [Source Sans 3 ▼]                            |
| UI/Nav:   [Inter ▼]                                    |
|                                                          |
| LAYOUT:                                                  |
| Max Width: [1440] px                                    |
| Section Spacing: [80] px                                |
| Border Radius: [8] px                                   |
|                                                          |
| HEADER:                                                  |
| Style: [Fixed ▼] [Transparent ▼]                       |
| Logo: [Upload / Current Logo]                           |
|                                                          |
| FOOTER:                                                  |
| Columns: [4 ▼]                                          |
| Show Social: [☑]                                       |
| Show Newsletter: [☑]                                   |
| Copyright: [© 2026 Best Travel Morocco]                |
+----------------------------------------------------------+
```

### B. Live Preview
- Right panel shows live preview of changes
- Toggle between: Homepage, Tours, Blog preview

---

## 13. MODULE 11: SETTINGS & INTEGRATIONS

### A. Site Settings
- **General**: Site name, tagline, logo, favicon
- **Contact**: Phone, WhatsApp, email, address, map coordinates
- **Social**: Facebook, Instagram, TripAdvisor, YouTube URLs
- **Business Hours**: Mon-Sun opening hours

### B. Integrations
- **Google Search Console**: Connect, view verification status, submit sitemap
- **Google Analytics 4**: Enter Measurement ID
- **Facebook Pixel**: Enter Pixel ID
- **WhatsApp Business**: Enter phone number for click-to-chat
- **Email (SMTP)**: Configure email sending for inquiries
- **Payment**: Stripe/PayPal integration for online payments

### C. Admin Users
- Add/remove admin users
- Role-based access: Admin, Editor, Viewer
- Activity log (who changed what and when)

### D. Backup & Export
- **Backup**: Download full database backup
- **Export**: Export tours, blogs, etc. as JSON
- **Import**: Import data from JSON/CSV
- **History**: View and revert previous versions

---

## 14. MODULE 12: ANALYTICS DASHBOARD

### A. Overview Charts
- **Visitors**: Line chart (daily/weekly/monthly)
- **Top Pages**: Bar chart of most visited pages
- **Traffic Sources**: Pie chart (Google, Direct, Social, Referral)
- **Device Breakdown**: Desktop vs Mobile vs Tablet
- **Top Countries**: Map + table

### B. Tour Performance
- Most viewed tours
- Most inquired tours
- Conversion rate (views → inquiries)

### C. SEO Performance
- Keyword rankings (manual entry + Google Search Console sync)
- Indexed pages count
- Schema validation status
- Page speed scores

---

## 15. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1)
| Day | Task |
|-----|------|
| 1-2 | Initialize project, database setup, authentication |
| 3-4 | Dashboard layout, sidebar navigation, routing |
| 5 | Dashboard overview widgets |

### Phase 2: Content CRUD (Week 2)
| Day | Task |
|-----|------|
| 1-2 | Tour Manager (list, add, edit, delete) |
| 3 | Blog Manager (list, add, edit, TipTap editor) |
| 4 | Destination + Highlight Managers |
| 5 | Media Library (upload, organize, WebP) |

### Phase 3: Page Builder (Week 3)
| Day | Task |
|-----|------|
| 1-2 | Section components + drag & drop system |
| 3-4 | Element-level editing + style controls |
| 5 | Save/Preview/Publish flow |

### Phase 4: SEO & Advanced (Week 4)
| Day | Task |
|-----|------|
| 1-2 | SEO Manager (per-page + bulk editor) |
| 3 | Schema builder with live preview |
| 4 | Inquiry/Booking Manager |
| 5 | Testimonial Manager |

### Phase 5: Polish & Deploy (Week 5)
| Day | Task |
|-----|------|
| 1-2 | Theme Customizer |
| 3 | Settings + Integrations |
| 4 | Analytics Dashboard |
| 5 | Testing, bug fixes, deploy |

### Total Timeline: **5 weeks** (can be accelerated to 3 weeks with parallel work)

---

## 16. SECURITY & AUTHENTICATION

### A. Login System
```
+--------------------------------+
|   [Logo]                       |
|                                |
|   Best Travel Morocco          |
|   Admin Login                  |
|                                |
|   Username: [____________]     |
|   Password: [____________]     |
|                                |
|   [☑] Remember me            |
|                                |
|   [       Login       ]        |
|                                |
|   [Forgot password?]           |
+--------------------------------+
```

### B. Security Features
- **Password hashing**: bcrypt with salt
- **Session management**: JWT tokens with refresh
- **Rate limiting**: Max 5 login attempts per IP per minute
- **HTTPS only**: All admin traffic encrypted
- **Activity logging**: Every action logged with timestamp + user
- **Data validation**: All inputs sanitized server-side
- **CSRF protection**: Token-based CSRF prevention
- **Role-based access**: Admin/Editor/Viewer roles

---

## APPENDIX A: COMPARISON WITH ELEMENTOR

| Feature | Elementor (WordPress) | BTM Admin (Custom) |
|---------|----------------------|-------------------|
| Visual Page Builder | ✅ | ✅ (Module 1) |
| Drag & Drop Sections | ✅ | ✅ (7+ section types) |
| Live Preview | ✅ | ✅ (Instant preview) |
| Tour Itinerary Builder | ❌ | ✅ (Day-by-day with activities) |
| SEO Per-Page Editor | ❌ (needs plugin) | ✅ (Built-in) |
| Schema Builder | ❌ (needs plugin) | ✅ (Visual JSON-LD editor) |
| Media Library + WebP | ❌ (needs plugin) | ✅ (Auto WebP conversion) |
| Booking/Inquiry Manager | ❌ (needs plugin) | ✅ (Kanban pipeline) |
| Multi-language Ready | ❌ (needs plugin) | ✅ (Built-in i18n support) |
| Speed | Slow (PHP + plugins) | Fast (React + static site) |
| Hosting Cost | High (WP hosting) | Low (static hosting) |
| Customization | Limited by theme | Unlimited (custom-built) |

**Result: BTM Admin has 7+ features that Elementor doesn't have out-of-the-box, and it's faster.**

---

## APPENDIX B: SCREEN SIZE SUPPORT

| Screen | Layout |
|--------|--------|
| Desktop (1280px+) | Full sidebar + content |
| Laptop (1024px) | Collapsible sidebar |
| Tablet (768px) | Icon-only sidebar |
| Mobile (<768px) | Hamburger menu |

---

**Document prepared by KIMI for Best Travel Morocco**
**Ready for your review, Brother. Let me know what to adjust before we start building!**
