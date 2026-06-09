import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.'
  );
}

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
  not_included: string;     // JSON string of string[]
  seo_title: string;
  seo_description: string;
  category: string;
  popular: boolean;
  departure_city: string | null;
  status: TourStatus;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// faqs table
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  page: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// homepage_sections table
export interface HomepageSection {
  id: string;
  section_type: string;
  label: string;
  sort_order: number;
  is_visible: boolean;
  config: Record<string, unknown>;
  updated_at: string;
}

// nav_menus table
export interface NavMenu {
  id: string;
  handle: string;
  label: string | null;
}

// nav_items table
export interface NavItem {
  id: string;
  menu_id: string;
  parent_id: string | null;
  label: string;
  href: string | null;
  tour_id: string | null;
  sort_order: number;
  is_visible: boolean;
  opens_new_tab: boolean;
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

// ═══════════════════════════════════════════════════════════════════════════════
// TOURISM OPERATING SYSTEM TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Vehicle {
  id: string;
  type: string;
  make: string | null;
  model: string | null;
  year: number | null;
  license_plate: string | null;
  capacity: number;
  color: string | null;
  fuel_type: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AccomCategory = 'standard' | 'luxury';
export type PricingTier   = 'boutique' | 'luxury' | 'signature';

export interface Accommodation {
  id: string;
  destination: string;
  category: AccomCategory;
  type: string;
  name: string;
  city: string | null;
  address: string | null;
  stars: number | null;
  tier: string;                       // legacy — kept for backward compat
  description: string | null;
  images: string[];
  website: string | null;
  contact_person: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  google_maps_link: string | null;
  low_season_rate: number | null;
  mid_season_rate: number | null;
  contracted_single_rate: number | null;
  peak_season_rate: number | null;
  contracted_double_rate: number | null;
  contracted_triple_rate: number | null;
  double_room_rate: number | null;
  family_room_rate: number | null;
  extra_bed_rate: number | null;
  child_policy: string | null;
  capacity: number | null;
  amenities: string[];
  photo_url: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TourAccommodationAssignment {
  id: string;
  tour_id: string;
  destination: string;
  category: AccomCategory;
  accommodation_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  accommodation?: Accommodation;
}

export interface Supplier {
  id: string;
  name: string;
  type: string | null;
  city: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  service_description: string | null;
  contracted_rate: number | null;
  currency: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: string;
  name: string;
  color: string;
  start_date: string;
  end_date: string;
  multiplier: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PricingRule {
  id: string;
  tour_id: string;
  season_id: string;
  group_size_min: number;
  group_size_max: number;
  accommodation_tier: string;
  price_per_person: number;
  cost_per_person: number | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  min_booking_value: number | null;
  max_uses: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CustomTourRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  group_size: number;
  preferred_start_date: string | null;
  duration_days: number | null;
  tour_id: string | null;
  tour_name: string | null;
  budget_per_person: number | null;
  special_requirements: string | null;
  source: string;
  status: string;
  assigned_to: string | null;
  follow_up_date: string | null;
  quoted_price: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  trigger: string;
  subject: string;
  body_html: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERIENCES / PROGRAMS TYPES  (yoga_retreat | upcoming_trip | student_trip)
// ═══════════════════════════════════════════════════════════════════════════════

export type ExperienceType  = 'yoga_retreat' | 'student_trip' | 'upcoming_trip';
export type DepartureType   = 'fixed_dates'  | 'flexible_window';
export type PricingModel    = 'fixed'        | 'flexible';

export interface ExperienceItineraryBlock {
  day: number;
  title: string;
  description: string;
}

export interface ExperienceProduct {
  id: string;
  title: string;
  slug: string;
  type: ExperienceType;
  description: string | null;
  highlights: string[];
  itinerary: ExperienceItineraryBlock[];
  duration_days: number | null;
  duration_nights: number | null;
  departure_type: DepartureType;
  fixed_departures: string[];
  flexible_months: string[];
  pricing_model: PricingModel;
  price_per_person: number | null;
  starting_price: number | null;
  included: string[];
  excluded: string[];
  images: string[];
  accommodation_level: string | null;
  capacity: number | null;
  min_group_size: number | null;
  max_group_size: number | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export const EXPERIENCE_TYPE_LABELS: Record<ExperienceType, string> = {
  yoga_retreat:  'Yoga Retreat',
  upcoming_trip: 'Upcoming Trip',
  student_trip:  'Student Trip',
};

export const EXPERIENCE_TYPE_COLORS: Record<ExperienceType, string> = {
  yoga_retreat:  '#10B981',
  upcoming_trip: '#60A5FA',
  student_trip:  '#A78BFA',
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

export function parseTourNotIncluded(tour: Tour): string[] {
  return parseJsonField<string[]>(tour.not_included, []);
}
