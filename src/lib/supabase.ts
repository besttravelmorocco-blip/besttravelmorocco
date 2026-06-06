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

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING SYSTEM TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type BookingStatus =
  | 'enquiry'
  | 'pending_review'
  | 'confirmed'
  | 'deposit_paid'
  | 'active'
  | 'completed'
  | 'rejected'
  | 'cancelled';
export type PaymentMethod = 'paypal' | 'stripe' | 'wise' | 'cash' | 'bank_transfer';
export type StaffRole = 'driver' | 'guide_fes' | 'guide_marrakech' | 'guide_volubilis' | 'guide_general' | 'manager';
export type PaymentType = 'deposit' | 'balance' | 'extra' | 'refund';

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  nationality: string | null;
  hotel: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  photo_url: string | null;
  languages: string[];
  available: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItineraryDayOverride {
  day: number;
  title: string;
  description: string;
  accommodation?: string;
}

export interface OpBooking {
  id: string;
  reference: string;
  client_id: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_whatsapp: string | null;
  client_nationality: string | null;
  client_hotel: string | null;
  tour_id: string | null;
  tour_name: string;
  start_date: string | null;
  end_date: string | null;
  num_adults: number;
  num_children: number;
  pickup_location: string | null;
  pickup_time: string | null;
  driver_id: string | null;
  guide_fes_id: string | null;
  guide_marrakech_id: string | null;
  guide_volubilis_id: string | null;
  total_price: number | null;
  currency: string;
  deposit_amount: number | null;
  deposit_method: PaymentMethod | null;
  deposit_reference: string | null;
  deposit_paid: boolean;
  deposit_paid_date: string | null;
  balance_paid: boolean;
  balance_paid_date: string | null;
  status: BookingStatus;
  // Confirmation window fields (migration 008)
  submitted_at: string | null;
  review_deadline: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  confirmation_sent_at: string | null;
  rejection_reason: string | null;
  payment_link_sent_at: string | null;
  payment_link_expires_at: string | null;
  itinerary: ItineraryDayOverride[] | null;
  internal_notes: string | null;
  client_notes: string | null;
  special_requirements: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpPayment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  type: PaymentType;
  method: PaymentMethod;
  reference: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

// Helpers
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  enquiry:        'Enquiry',
  pending_review: 'Pending Review',
  confirmed:      'Confirmed',
  deposit_paid:   'Deposit Paid',
  active:         'Active',
  completed:      'Completed',
  rejected:       'Rejected',
  cancelled:      'Cancelled',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  enquiry:        'badge-gray',
  pending_review: 'badge-yellow',
  confirmed:      'badge-blue',
  deposit_paid:   'badge-sand',
  active:         'badge-green',
  completed:      'badge-success',
  rejected:       'badge-red',
  cancelled:      'badge-error',
};

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  driver: 'Driver',
  guide_fes: 'Guide — Fes',
  guide_marrakech: 'Guide — Marrakech',
  guide_volubilis: 'Guide — Volubilis',
  guide_general: 'Guide — General',
  manager: 'Manager',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  paypal: 'PayPal',
  stripe: 'Card (Stripe)',
  wise: 'Wise Transfer',
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
};

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
