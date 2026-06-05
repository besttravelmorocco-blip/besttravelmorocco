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
  email: "besttravelmorocco@gmail.com",
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

// ══════════════════════════════════════════════════════════════
// STUDENT TOUR CATALOG  (seeded from besttravelmorocco.com/student-trips)
// ══════════════════════════════════════════════════════════════
const STUDENT_CATALOG_KEY = "btm_student_catalog";
const PAYMENT_METHODS_KEY = "btm_payment_methods";

export interface StudentTour {
  id: string;
  title: string;
  days: number;
  nights: number;
  basePrice: number;          // EUR per person, shared accommodation
  privatePrice?: number;
  description: string;
  highlights: string[];
  included: string[];
  groupPricing: { minPax: number; maxPax: number; pricePerPerson: number }[];
  image: string;
}

export interface PaymentMethod {
  id: "wise" | "paypal" | "card";
  label: string;
  link: string;
  instructions: string;
  enabled: boolean;
}

const DEFAULT_STUDENT_TOURS: StudentTour[] = [
  {
    id: "3-day-students-desert",
    title: "3-Day Students Desert Trip",
    days: 3,
    nights: 2,
    basePrice: 350,
    privatePrice: 420,
    description: "A fun 3-day student trip from Marrakech to Merzouga, discovering the High Atlas Mountains, ancient kasbahs, and a magical night under the stars.",
    highlights: ["Atlas Mountains crossing", "Ait Benhaddou UNESCO site", "Dades Valley", "Todra Gorge", "Erg Chebbi camel trek", "Berber desert camp"],
    included: ["Transport in minivan with A/C", "English-speaking student guide", "1 night in shared Dades hotel (dinner & breakfast)", "1 night in shared Sahara desert camp (dinner & breakfast)", "Sunset & sunrise camel trek", "All entrance fees"],
    groupPricing: [
      { minPax: 2,  maxPax: 5,  pricePerPerson: 380 },
      { minPax: 6,  maxPax: 10, pricePerPerson: 360 },
      { minPax: 11, maxPax: 16, pricePerPerson: 350 },
      { minPax: 17, maxPax: 25, pricePerPerson: 330 },
    ],
    image: "/images/tour_4day-students.jpg",
  },
  {
    id: "4-days-students-desert",
    title: "4-Day Students Desert Trip",
    days: 4,
    nights: 3,
    basePrice: 450,
    privatePrice: 530,
    description: "A fun 4-day student trip from Marrakech to the Sahara Desert, with more time to explore the Dades Valley, Todra Gorge, and the magical Erg Chebbi dunes.",
    highlights: ["Atlas Mountains crossing", "Ait Benhaddou UNESCO site", "Dades Valley hike", "Todra Gorge exploration", "Extended Sahara time", "Berber desert camp"],
    included: ["Transport in minivan with A/C", "English-speaking student guide", "2 nights in shared hotels (dinner & breakfast)", "1 night in shared Sahara desert camp (dinner & breakfast)", "Sunset & sunrise camel trek", "All entrance fees"],
    groupPricing: [
      { minPax: 2,  maxPax: 5,  pricePerPerson: 490 },
      { minPax: 6,  maxPax: 10, pricePerPerson: 465 },
      { minPax: 11, maxPax: 16, pricePerPerson: 450 },
      { minPax: 17, maxPax: 25, pricePerPerson: 420 },
    ],
    image: "/images/tour_4day-students.jpg",
  },
  {
    id: "marrakech-sahara-students-5day",
    title: "5-Day Marrakech & Sahara Discovery (Students)",
    days: 5,
    nights: 4,
    basePrice: 520,
    privatePrice: 620,
    description: "Student-focused adventure combining vibrant Marrakech with magical Sahara Desert, traversing High Atlas Mountains, ancient kasbahs, palm oases, and golden Erg Chebbi dunes.",
    highlights: ["Atlas Mountains Tizi n'Tichka Pass", "Ait Benhaddou UNESCO site", "Ouarzazate 'Hollywood of Morocco'", "Todra Gorge rock walls", "Erg Chebbi camel trekking", "Berber camp stargazing", "Draa Valley palm groves"],
    included: ["Air-conditioned minibus or 4WD", "Qualified multilingual guide", "4 nights shared accommodation (dinners & breakfasts)", "1 night traditional Berber luxury camp", "Camel trekking in Erg Chebbi", "All entrance fees"],
    groupPricing: [
      { minPax: 2,  maxPax: 5,  pricePerPerson: 570 },
      { minPax: 6,  maxPax: 10, pricePerPerson: 545 },
      { minPax: 11, maxPax: 16, pricePerPerson: 520 },
      { minPax: 17, maxPax: 25, pricePerPerson: 490 },
    ],
    image: "/images/tour_4day-students.jpg",
  },
  {
    id: "spring-sahara",
    title: "Spring 2026: Sahara Adventure",
    days: 5,
    nights: 4,
    basePrice: 549,
    privatePrice: 649,
    description: "A special spring edition focused entirely on the Sahara experience. Perfect weather, blooming desert flowers, and the most magical time to visit the dunes.",
    highlights: ["Spring desert blooms", "Extended Sahara time", "Sandboarding", "Star photography workshop", "Berber cultural evening"],
    included: ["4 nights shared accommodation", "Daily breakfast & dinner", "Airport transfers", "Private transport", "English-speaking guide", "Camel trek", "Sandboarding", "Star photography session"],
    groupPricing: [
      { minPax: 2,  maxPax: 5,  pricePerPerson: 599 },
      { minPax: 6,  maxPax: 10, pricePerPerson: 570 },
      { minPax: 11, maxPax: 16, pricePerPerson: 549 },
      { minPax: 17, maxPax: 25, pricePerPerson: 519 },
    ],
    image: "/images/tour_4day-students.jpg",
  },
  {
    id: "summer-grand",
    title: "Summer 2026: Grand Morocco",
    days: 8,
    nights: 7,
    basePrice: 799,
    privatePrice: 949,
    description: "The grand summer adventure covering everything — Marrakech, Sahara, Fes, Chefchaouen, and the coast. The ultimate student summer break destination.",
    highlights: ["All imperial cities", "Sahara desert camp", "Chefchaouen blue city", "Essaouira coast", "Beach time", "Atlas Mountains"],
    included: ["7 nights shared accommodation", "Daily breakfast & dinner", "Airport transfers", "Private transport", "English-speaking guide", "Camel trek", "All entrance fees"],
    groupPricing: [
      { minPax: 2,  maxPax: 5,  pricePerPerson: 860 },
      { minPax: 6,  maxPax: 10, pricePerPerson: 830 },
      { minPax: 11, maxPax: 16, pricePerPerson: 799 },
      { minPax: 17, maxPax: 25, pricePerPerson: 759 },
    ],
    image: "/images/tour_4day-students.jpg",
  },
];

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "wise",
    label: "Wise (Bank Transfer)",
    link: "https://wise.com/pay/r/besttravelmorocco",
    instructions: "Send to Wise account @besttravelmorocco — reference your booking number. 30% deposit to confirm, balance 7 days before departure.",
    enabled: true,
  },
  {
    id: "paypal",
    label: "PayPal",
    link: "https://paypal.me/besttravelmorocco",
    instructions: "Pay via PayPal Friends & Family to avoid fees, or Goods & Services (+3.5% fee). Reference your booking number in the note.",
    enabled: true,
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    link: "https://besttravelmorocco.com/book",
    instructions: "Visa, Mastercard, and Amex accepted via our secure booking form. 3D Secure enabled. No extra fees.",
    enabled: true,
  },
];

export const studentCatalogStore = {
  getAll(): StudentTour[] {
    const stored = load<StudentTour[]>(STUDENT_CATALOG_KEY, []);
    if (stored.length === 0) {
      save(STUDENT_CATALOG_KEY, DEFAULT_STUDENT_TOURS);
      return DEFAULT_STUDENT_TOURS;
    }
    return stored;
  },
  update(id: string, updates: Partial<StudentTour>): StudentTour | null {
    const all = this.getAll();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates };
    save(STUDENT_CATALOG_KEY, all);
    return all[idx];
  },
  reset() {
    save(STUDENT_CATALOG_KEY, DEFAULT_STUDENT_TOURS);
    return DEFAULT_STUDENT_TOURS;
  },
};

export const paymentMethodsStore = {
  getAll(): PaymentMethod[] {
    const stored = load<PaymentMethod[]>(PAYMENT_METHODS_KEY, []);
    if (stored.length === 0) {
      save(PAYMENT_METHODS_KEY, DEFAULT_PAYMENT_METHODS);
      return DEFAULT_PAYMENT_METHODS;
    }
    return stored;
  },
  update(id: PaymentMethod["id"], updates: Partial<PaymentMethod>): PaymentMethod[] {
    const all = this.getAll();
    const idx = all.findIndex((m) => m.id === id);
    if (idx !== -1) all[idx] = { ...all[idx], ...updates };
    save(PAYMENT_METHODS_KEY, all);
    return all;
  },
};

// ══════════════════════════════════════════════════════════════
// BOOKING STORE
// ══════════════════════════════════════════════════════════════
const BOOKING_KEY = "btm_bookings";
const DEPARTURE_KEY = "btm_departures";
const PRICING_KEY = "btm_pricing_rules";

function genRef() {
  return "BTM-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

export interface LocalBooking {
  id: number;
  reference: string;
  tourId?: string;
  tourName?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCountry?: string;
  departureDate?: string;
  adults: number;
  children: number;
  accommodation: "shared" | "private" | "luxury";
  totalPrice?: number;
  currency: string;
  status: "pending" | "confirmed" | "paid" | "completed" | "cancelled" | "refunded";
  paymentStatus: "unpaid" | "partial" | "paid" | "refunded";
  depositAmount?: number;
  notes?: string;
  internalNotes?: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export const bookingStore = {
  getAll(): LocalBooking[] {
    return load<LocalBooking[]>(BOOKING_KEY, []);
  },
  getById(id: number): LocalBooking | undefined {
    return this.getAll().find((b) => b.id === id);
  },
  create(data: Omit<LocalBooking, "id" | "reference" | "createdAt" | "updatedAt">): LocalBooking {
    const all = this.getAll();
    const now = new Date().toISOString();
    const maxId = all.reduce((m, b) => Math.max(m, b.id), 0);
    const booking: LocalBooking = {
      ...data,
      id: maxId + 1,
      reference: genRef(),
      currency: data.currency ?? "USD",
      adults: data.adults ?? 1,
      children: data.children ?? 0,
      accommodation: data.accommodation ?? "shared",
      status: "pending",
      paymentStatus: "unpaid",
      source: data.source ?? "admin",
      createdAt: now,
      updatedAt: now,
    };
    all.push(booking);
    save(BOOKING_KEY, all);
    return booking;
  },
  update(id: number, updates: Partial<LocalBooking>): LocalBooking | null {
    const all = this.getAll();
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    save(BOOKING_KEY, all);
    return all[idx];
  },
  delete(id: number): boolean {
    save(BOOKING_KEY, this.getAll().filter((b) => b.id !== id));
    return true;
  },
  stats() {
    const all = this.getAll();
    const revenue = all
      .filter((b) => b.paymentStatus === "paid" && b.totalPrice)
      .reduce((s, b) => s + (b.totalPrice ?? 0), 0);
    return {
      total: all.length,
      confirmed: all.filter((b) => b.status === "confirmed").length,
      revenue,
    };
  },
};

// ══════════════════════════════════════════════════════════════
// DEPARTURE STORE
// ══════════════════════════════════════════════════════════════
export interface LocalDeparture {
  id: number;
  tourId?: string;
  tourName: string;
  departureDate: string;
  returnDate: string;
  maxSeats: number;
  bookedSeats: number;
  pricePerPerson?: number;
  status: "open" | "filling" | "full" | "cancelled" | "completed";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

function nextThursdayDate(from: Date): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const daysUntilThursday = (4 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilThursday);
  return d;
}

function addDaysDate(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

export const departureStore = {
  getAll(): LocalDeparture[] {
    return load<LocalDeparture[]>(DEPARTURE_KEY, []);
  },
  generate(opts: {
    tourId: string;
    tourName: string;
    count: number;
    startWeeks?: number;
    startDate?: string;       // ISO date string, overrides startWeeks
    maxSeats: number;
    pricePerPerson?: number;
  }): number {
    const all = this.getAll();
    const maxId = all.reduce((m, d) => Math.max(m, d.id), 0);
    const now = new Date().toISOString();
    let cursor: Date;
    if (opts.startDate) {
      cursor = new Date(opts.startDate + "T00:00:00");
    } else {
      cursor = addDaysDate(new Date(), (opts.startWeeks ?? 0) * 7);
    }
    let next = nextThursdayDate(cursor);
    // If cursor IS already a Thursday, use it directly
    if (cursor.getDay() === 4) next = cursor;
    const rows: LocalDeparture[] = [];
    for (let i = 0; i < opts.count; i++) {
      rows.push({
        id: maxId + i + 1,
        tourId: opts.tourId,
        tourName: opts.tourName,
        departureDate: fmt(next),
        returnDate: fmt(addDaysDate(next, 3)),
        maxSeats: opts.maxSeats,
        bookedSeats: 0,
        pricePerPerson: opts.pricePerPerson,
        status: "open",
        createdAt: now,
        updatedAt: now,
      });
      next = addDaysDate(next, 7);
    }
    save(DEPARTURE_KEY, [...all, ...rows]);
    return rows.length;
  },
  update(id: number, updates: Partial<LocalDeparture>): LocalDeparture | null {
    const all = this.getAll();
    const idx = all.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    save(DEPARTURE_KEY, all);
    return all[idx];
  },
  delete(id: number): boolean {
    save(DEPARTURE_KEY, this.getAll().filter((d) => d.id !== id));
    return true;
  },
};

// ══════════════════════════════════════════════════════════════
// PRICING RULE STORE
// ══════════════════════════════════════════════════════════════
export interface LocalPricingRule {
  id: number;
  name: string;
  tourId?: string;
  ruleType: "base" | "season" | "group" | "accommodation" | "earlybird" | "lastminute";
  modifier: string;
  modifierType: "percent" | "fixed";
  validFrom?: string;
  validTo?: string;
  priority: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const pricingRuleStore = {
  getAll(): LocalPricingRule[] {
    return load<LocalPricingRule[]>(PRICING_KEY, []);
  },
  create(data: Omit<LocalPricingRule, "id" | "createdAt" | "updatedAt">): LocalPricingRule {
    const all = this.getAll();
    const maxId = all.reduce((m, r) => Math.max(m, r.id), 0);
    const now = new Date().toISOString();
    const rule: LocalPricingRule = { ...data, id: maxId + 1, active: true, createdAt: now, updatedAt: now };
    all.push(rule);
    save(PRICING_KEY, all);
    return rule;
  },
  update(id: number, updates: Partial<LocalPricingRule>): LocalPricingRule | null {
    const all = this.getAll();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    save(PRICING_KEY, all);
    return all[idx];
  },
  delete(id: number): boolean {
    save(PRICING_KEY, this.getAll().filter((r) => r.id !== id));
    return true;
  },
};

// ══════════════════════════════════════════════════════════════
// ANALYTICS AGGREGATION
// ══════════════════════════════════════════════════════════════
export function getAnalyticsOverview() {
  const bookings = bookingStore.getAll();
  const inqs = inquiryStore.getAll();
  const stats = bookingStore.stats();

  const bookingBreakdown = Object.entries(
    bookings.reduce<Record<string, number>>((acc, b) => {
      acc[b.status] = (acc[b.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  const inquiryBreakdown = Object.entries(
    inqs.reduce<Record<string, number>>((acc, i) => {
      acc[i.status] = (acc[i.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  const tourCounts = bookings.reduce<Record<string, number>>((acc, b) => {
    if (b.tourName) acc[b.tourName] = (acc[b.tourName] ?? 0) + 1;
    return acc;
  }, {});
  const topTours = Object.entries(tourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tourName, count]) => ({ tourName, count }));

  const recentBookings = [...bookings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return {
    bookings: { total: stats.total, confirmed: stats.confirmed, breakdown: bookingBreakdown },
    revenue: { total: stats.revenue },
    inquiries: { total: inqs.length, new: inqs.filter((i) => i.status === "new").length, breakdown: inquiryBreakdown },
    recentBookings,
    topTours,
  };
}
