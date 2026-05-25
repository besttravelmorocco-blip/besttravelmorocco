/* ═══════════════════════════════════════════
   CLIENT-SIDE DATA STORE — localStorage
   No backend required. All CRUD in browser.
   ═══════════════════════════════════════════ */

import { tours as defaultTours, type Tour } from "../../db/tours-data";

// ─── Storage Keys ──────────────────────────
const KEYS = {
  tours: "btm_tours",
  blogPosts: "btm_blog_posts",
  inquiries: "btm_inquiries",
  testimonials: "btm_testimonials",
  media: "btm_media",
  settings: "btm_settings",
  seoSettings: "btm_seo_settings",
  pages: "btm_pages",
  seeded: "btm_seeded",
} as const;

// ─── Generic helpers ───────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Tours ─────────────────────────────────
export interface LocalTour {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  days: number;
  fromCity: string;
  toCity: string;
  price: string;
  image: string;
  itinerary: { day: number; title: string; route: string; desc: string }[];
  included: string[];
  highlights: string[];
  status: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

function tourToLocal(t: Tour): LocalTour {
  const now = new Date().toISOString();
  return {
    id: t.id,
    title: t.title,
    subtitle: t.duration,
    description: t.description,
    days: t.days,
    fromCity: t.from,
    toCity: t.to,
    price: t.price,
    image: t.image,
    itinerary: t.itinerary,
    included: t.included,
    highlights: t.highlights,
    status: t.status === "upcoming" ? "draft" : "published",
    featured: t.featured ?? false,
    createdAt: now,
    updatedAt: now,
  };
}

export const tourStore = {
  getAll(): LocalTour[] {
    return load<LocalTour[]>(KEYS.tours, []);
  },
  getById(id: string): LocalTour | undefined {
    return this.getAll().find((t) => t.id === id);
  },
  create(tour: Omit<LocalTour, "createdAt" | "updatedAt">): LocalTour {
    const all = this.getAll();
    const now = new Date().toISOString();
    const newTour: LocalTour = { ...tour, createdAt: now, updatedAt: now };
    all.push(newTour);
    save(KEYS.tours, all);
    return newTour;
  },
  update(id: string, updates: Partial<LocalTour>): LocalTour | null {
    const all = this.getAll();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    save(KEYS.tours, all);
    return all[idx];
  },
  delete(id: string): boolean {
    const all = this.getAll().filter((t) => t.id !== id);
    save(KEYS.tours, all);
    return true;
  },
  seed(): { seeded: number; updated: number; total: number } {
    const existing = this.getAll();
    let seeded = 0;
    let updated = 0;
    for (const tour of defaultTours) {
      const localTour = tourToLocal(tour);
      const existingIdx = existing.findIndex((t) => t.id === localTour.id);
      if (existingIdx === -1) {
        existing.push(localTour);
        seeded++;
      } else {
        existing[existingIdx] = { ...localTour, createdAt: existing[existingIdx].createdAt, updatedAt: new Date().toISOString() };
        updated++;
      }
    }
    save(KEYS.tours, existing);
    save(KEYS.seeded, "true");
    return { seeded, updated, total: defaultTours.length };
  },
  isSeeded(): boolean {
    return load<string>(KEYS.seeded, "false") === "true";
  },
  reset() {
    localStorage.removeItem(KEYS.tours);
    localStorage.removeItem(KEYS.seeded);
  },
};

// ─── Blog Posts ────────────────────────────
export interface LocalBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  status: "published" | "draft";
  author: string;
  createdAt: string;
  updatedAt: string;
}

export const blogStore = {
  getAll(): LocalBlogPost[] {
    return load<LocalBlogPost[]>(KEYS.blogPosts, []);
  },
  getById(id: string): LocalBlogPost | undefined {
    return this.getAll().find((b) => b.id === id);
  },
  getBySlug(slug: string): LocalBlogPost | undefined {
    return this.getAll().find((b) => b.slug === slug);
  },
  create(post: Omit<LocalBlogPost, "createdAt" | "updatedAt">): LocalBlogPost {
    const all = this.getAll();
    const now = new Date().toISOString();
    const newPost = { ...post, createdAt: now, updatedAt: now };
    all.push(newPost);
    save(KEYS.blogPosts, all);
    return newPost;
  },
  update(id: string, updates: Partial<LocalBlogPost>): LocalBlogPost | null {
    const all = this.getAll();
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    save(KEYS.blogPosts, all);
    return all[idx];
  },
  delete(id: string): boolean {
    const all = this.getAll().filter((b) => b.id !== id);
    save(KEYS.blogPosts, all);
    return true;
  },
};

// ─── Inquiries ─────────────────────────────
export interface LocalInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tourName?: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
}

export const inquiryStore = {
  getAll(): LocalInquiry[] {
    return load<LocalInquiry[]>(KEYS.inquiries, []);
  },
  getRecent(limit: number = 5): LocalInquiry[] {
    return this.getAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  },
  getById(id: string): LocalInquiry | undefined {
    return this.getAll().find((i) => i.id === id);
  },
  create(inquiry: Omit<LocalInquiry, "createdAt">): LocalInquiry {
    const all = this.getAll();
    const newInq = { ...inquiry, createdAt: new Date().toISOString() };
    all.push(newInq);
    save(KEYS.inquiries, all);
    return newInq;
  },
  update(id: string, updates: Partial<LocalInquiry>): LocalInquiry | null {
    const all = this.getAll();
    const idx = all.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates };
    save(KEYS.inquiries, all);
    return all[idx];
  },
  delete(id: string): boolean {
    const all = this.getAll().filter((i) => i.id !== id);
    save(KEYS.inquiries, all);
    return true;
  },
};

// ─── Testimonials ──────────────────────────
export interface LocalTestimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar?: string;
  createdAt: string;
}

export const testimonialStore = {
  getAll(): LocalTestimonial[] {
    return load<LocalTestimonial[]>(KEYS.testimonials, []);
  },
  create(t: Omit<LocalTestimonial, "createdAt">): LocalTestimonial {
    const all = this.getAll();
    const newT = { ...t, createdAt: new Date().toISOString() };
    all.push(newT);
    save(KEYS.testimonials, all);
    return newT;
  },
  update(id: string, updates: Partial<LocalTestimonial>): LocalTestimonial | null {
    const all = this.getAll();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates };
    save(KEYS.testimonials, all);
    return all[idx];
  },
  delete(id: string): boolean {
    const all = this.getAll().filter((t) => t.id !== id);
    save(KEYS.testimonials, all);
    return true;
  },
};

// ─── Media ─────────────────────────────────
export interface LocalMedia {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
  size: number;
  createdAt: string;
}

export const mediaStore = {
  getAll(): LocalMedia[] {
    return load<LocalMedia[]>(KEYS.media, []);
  },
  create(m: Omit<LocalMedia, "createdAt">): LocalMedia {
    const all = this.getAll();
    const newM = { ...m, createdAt: new Date().toISOString() };
    all.push(newM);
    save(KEYS.media, all);
    return newM;
  },
  delete(id: string): boolean {
    const all = this.getAll().filter((m) => m.id !== id);
    save(KEYS.media, all);
    return true;
  },
};

// ─── Site Settings ─────────────────────────
export interface SiteSettings {
  siteName: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

const defaultSettings: SiteSettings = {
  siteName: "Best Travel Morocco",
  tagline: "Authentic Morocco Tours & Desert Experiences",
  email: "info@besttravelmorocco.com",
  phone: "+212 600-000000",
  whatsapp: "+212 600-000000",
  address: "Marrakech, Morocco",
  facebook: "https://facebook.com/besttravelmorocco",
  instagram: "https://instagram.com/besttravelmorocco",
};

export const settingsStore = {
  get(): SiteSettings {
    return load<SiteSettings>(KEYS.settings, defaultSettings);
  },
  update(updates: Partial<SiteSettings>): SiteSettings {
    const current = this.get();
    const updated = { ...current, ...updates };
    save(KEYS.settings, updated);
    return updated;
  },
};

// ─── Dashboard Stats ───────────────────────
export function getDashboardStats() {
  const tours = tourStore.getAll();
  const posts = blogStore.getAll();
  const inqs = inquiryStore.getAll();
  const testimonials = testimonialStore.getAll();
  const media = mediaStore.getAll();

  return {
    tours: tours.length,
    publishedTours: tours.filter((t) => t.status === "published").length,
    blogPosts: posts.length,
    totalInquiries: inqs.length,
    newInquiries: inqs.filter((i) => i.status === "new").length,
    testimonials: testimonials.length,
    mediaFiles: media.length,
    seoScore: 94,
  };
}

// ─── Seed Status ───────────────────────────
export function getSeedStatus() {
  const tours = tourStore.getAll();
  return {
    toursCount: tours.length,
    totalTours: defaultTours.length,
    needsSeeding: tours.length === 0,
  };
}

// ─── Reset All Data (Danger) ───────────────
export function resetAllData() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

// ─── Export default tours for reference ────
export { defaultTours };
