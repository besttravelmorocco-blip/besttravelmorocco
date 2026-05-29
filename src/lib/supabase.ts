import { createClient } from "@supabase/supabase-js";

// Anon key is public-safe by design (read-only public key)
const SUPABASE_URL = "https://uxkfqxistjvtofskqtwy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4a2ZxeGlzdGp2dG9mc2txdHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NTIyNzEsImV4cCI6MjA5NTAyODI3MX0.iixXusModII-3K-RRGRtUpvukY2V4Zxy3ZYZiyhTXmI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Row types returned by Supabase (snake_case) ───────────────────────────
export interface DbStudentTour {
  id: string;
  title: string;
  days: number;
  nights: number;
  base_price: number;
  private_price: number | null;
  description: string;
  highlights: string[];
  included: string[];
  group_pricing: { minPax: number; maxPax: number; pricePerPerson: number }[];
  image: string;
  active: boolean;
  sort_order: number;
}

export interface DbDeparture {
  id: number;
  tour_id: string | null;
  tour_name: string;
  departure_date: string;
  return_date: string;
  max_seats: number;
  booked_seats: number;
  price_per_person: number | null;
  status: "open" | "filling" | "full" | "cancelled" | "completed";
  notes: string | null;
}

export interface DbPaymentMethod {
  id: string;
  label: string;
  link: string;
  instructions: string;
  enabled: boolean;
  sort_order: number;
}
