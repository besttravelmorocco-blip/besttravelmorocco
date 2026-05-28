import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

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
