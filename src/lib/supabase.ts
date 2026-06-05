import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://uxkfqxistjvtofskqtwy.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4a2ZxeGlzdGp2dG9mc2txdHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NTIyNzEsImV4cCI6MjA5NTAyODI3MX0.iixXusModII-3K-RRGRtUpvukY2V4Zxy3ZYZiyhTXmI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Actual DB types (verified against live schema 2026-06-05) ────────────────

export type TourStatus = 'published' | 'draft' | 'archived';
export type InquiryStatus = 'new' | 'read' | 'replied' | 'archived';
export type ContentStatus = 'published' | 'draft';

export interface ItineraryDay {
  day: number;
  title: string;
  route: string;
  desc: string;
}

// tours table
export interface Tour {
  id: string;
  title: string;
  subtitle: string;         // e.g. "3 DAYS"
  description: string;
  days: number;
  from_city: string;
  to_city: string;
  price: string;            // e.g. "From €490"
  image: string;
  itinerary: string;        // JSON string of ItineraryDay[]
  included: string;         // JSON string of string[]
  highlights: string;       // JSON string of string[]
  status: TourStatus;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// destinations table
export interface Destination {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  category: string;
  highlights: string;
  coords: string;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// blog_posts table
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string | null;
  image: string;
  category: string;
  read_time: string;
  date: string;
  status: ContentStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// inquiries table
export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  tour_id: string | null;
  tour_name: string | null;
  message: string | null;
  travel_date: string | null;
  travelers: number | null;
  status: InquiryStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// testimonials table
export interface Testimonial {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  image: string | null;
  tour_id: string | null;
  featured: boolean;
  created_at: string;
}

// ─── Parse helpers (DB stores arrays as JSON strings) ────────────────────────

export function parseJsonField<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

export function parseTourItinerary(tour: Tour): ItineraryDay[] {
  return parseJsonField<ItineraryDay[]>(tour.itinerary, []);
}

export function parseTourIncluded(tour: Tour): string[] {
  return parseJsonField<string[]>(tour.included, []);
}

export function parseTourHighlights(tour: Tour): string[] {
  return parseJsonField<string[]>(tour.highlights, []);
}
