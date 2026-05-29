/**
 * Supabase-backed CRUD for content tables.
 * Translates between snake_case DB columns and the camelCase interfaces
 * the admin components already expect.
 */

import { supabase } from "./supabase";
import type { LocalTour, LocalBlogPost, LocalTestimonial } from "./localStore";

// ─── Tours ─────────────────────────────────────────────────────────────────
type DbTour = {
  id: string; title: string; subtitle: string | null; description: string | null;
  days: number; from_city: string | null; to_city: string | null; price: string | null;
  image: string | null; itinerary: unknown; included: unknown; highlights: unknown;
  status: string; featured: boolean; sort_order: number;
  created_at: string; updated_at: string;
};

function dbTourToLocal(t: DbTour): LocalTour {
  return {
    id: t.id, title: t.title, subtitle: t.subtitle ?? "",
    description: t.description ?? "", days: t.days,
    fromCity: t.from_city ?? "", toCity: t.to_city ?? "",
    price: t.price ?? "", image: t.image ?? "",
    itinerary: (t.itinerary as LocalTour["itinerary"]) ?? [],
    included: (t.included as string[]) ?? [],
    highlights: (t.highlights as string[]) ?? [],
    status: t.status as LocalTour["status"],
    featured: t.featured ?? false,
    createdAt: t.created_at, updatedAt: t.updated_at,
  };
}

function localTourToDb(t: Omit<LocalTour, "createdAt" | "updatedAt">) {
  return {
    id: t.id, title: t.title, subtitle: t.subtitle, description: t.description,
    days: t.days, from_city: t.fromCity, to_city: t.toCity, price: t.price,
    image: t.image, itinerary: t.itinerary, included: t.included, highlights: t.highlights,
    status: t.status, featured: t.featured,
  };
}

export const sbTourStore = {
  async getAll(opts?: { status?: string; search?: string }): Promise<LocalTour[]> {
    let q = supabase.from("tours").select("*").order("sort_order", { ascending: true });
    if (opts?.status) q = q.eq("status", opts.status);
    const { data, error } = await q;
    if (error) throw error;
    let results = (data as DbTour[]).map(dbTourToLocal);
    if (opts?.search) {
      const s = opts.search.toLowerCase();
      results = results.filter(t => t.title.toLowerCase().includes(s) || t.fromCity.toLowerCase().includes(s));
    }
    return results;
  },
  async getById(id: string): Promise<LocalTour | null> {
    const { data, error } = await supabase.from("tours").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? dbTourToLocal(data as DbTour) : null;
  },
  async create(tour: Omit<LocalTour, "createdAt" | "updatedAt">): Promise<LocalTour> {
    const { data, error } = await supabase.from("tours").insert(localTourToDb(tour)).select().single();
    if (error) throw error;
    return dbTourToLocal(data as DbTour);
  },
  async update(id: string, updates: Partial<LocalTour>): Promise<LocalTour> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.days !== undefined) dbUpdates.days = updates.days;
    if (updates.fromCity !== undefined) dbUpdates.from_city = updates.fromCity;
    if (updates.toCity !== undefined) dbUpdates.to_city = updates.toCity;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.itinerary !== undefined) dbUpdates.itinerary = updates.itinerary;
    if (updates.included !== undefined) dbUpdates.included = updates.included;
    if (updates.highlights !== undefined) dbUpdates.highlights = updates.highlights;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
    const { data, error } = await supabase.from("tours").update(dbUpdates).eq("id", id).select().single();
    if (error) throw error;
    return dbTourToLocal(data as DbTour);
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("tours").delete().eq("id", id);
    if (error) throw error;
  },
};

// ─── Blog Posts ───────────────────────────────────────────────────────────
type DbBlogPost = {
  id: string; title: string; excerpt: string | null; content: string | null;
  image: string | null; category: string | null; read_time: string | null;
  date: string | null; status: string; featured: boolean;
  created_at: string; updated_at: string;
};

function dbBlogToLocal(b: DbBlogPost): LocalBlogPost {
  return {
    id: b.id, title: b.title, slug: b.id,
    excerpt: b.excerpt ?? "", content: b.content ?? "",
    coverImage: b.image ?? "",
    tags: b.category ? [b.category] : [],
    status: b.status as "published" | "draft",
    author: "Admin",
    createdAt: b.created_at, updatedAt: b.updated_at,
  };
}

function localBlogToDb(b: Omit<LocalBlogPost, "createdAt" | "updatedAt">) {
  return {
    id: b.id, title: b.title, excerpt: b.excerpt, content: b.content,
    image: b.coverImage,
    category: b.tags?.[0] ?? null,
    status: b.status,
  };
}

export const sbBlogStore = {
  async getAll(opts?: { status?: string; search?: string }): Promise<LocalBlogPost[]> {
    let q = supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (opts?.status) q = q.eq("status", opts.status);
    const { data, error } = await q;
    if (error) throw error;
    let results = (data as DbBlogPost[]).map(dbBlogToLocal);
    if (opts?.search) {
      const s = opts.search.toLowerCase();
      results = results.filter(b => b.title.toLowerCase().includes(s));
    }
    return results;
  },
  async getById(id: string): Promise<LocalBlogPost | null> {
    const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? dbBlogToLocal(data as DbBlogPost) : null;
  },
  async create(post: Omit<LocalBlogPost, "createdAt" | "updatedAt">): Promise<LocalBlogPost> {
    const { data, error } = await supabase.from("blog_posts").insert(localBlogToDb(post)).select().single();
    if (error) throw error;
    return dbBlogToLocal(data as DbBlogPost);
  },
  async update(id: string, updates: Partial<LocalBlogPost>): Promise<LocalBlogPost> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.excerpt !== undefined) dbUpdates.excerpt = updates.excerpt;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.coverImage !== undefined) dbUpdates.image = updates.coverImage;
    if (updates.tags !== undefined) dbUpdates.category = updates.tags?.[0] ?? null;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    const { data, error } = await supabase.from("blog_posts").update(dbUpdates).eq("id", id).select().single();
    if (error) throw error;
    return dbBlogToLocal(data as DbBlogPost);
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) throw error;
  },
};

// ─── Testimonials ─────────────────────────────────────────────────────────
type DbTestimonial = {
  id: number; name: string; location: string | null; text: string;
  rating: number; image: string | null; tour_id: string | null;
  featured: boolean; created_at: string;
};

function dbTestimonialToLocal(t: DbTestimonial): LocalTestimonial {
  return {
    id: String(t.id), name: t.name, location: t.location ?? "",
    text: t.text, rating: t.rating, avatar: t.image ?? undefined,
    createdAt: t.created_at,
  };
}

export const sbTestimonialStore = {
  async getAll(): Promise<LocalTestimonial[]> {
    const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data as DbTestimonial[]).map(dbTestimonialToLocal);
  },
  async create(t: Omit<LocalTestimonial, "id" | "createdAt">): Promise<LocalTestimonial> {
    const { data, error } = await supabase.from("testimonials").insert({
      name: t.name, location: t.location, text: t.text, rating: t.rating,
      image: t.avatar ?? null,
    }).select().single();
    if (error) throw error;
    return dbTestimonialToLocal(data as DbTestimonial);
  },
  async update(id: string, updates: Partial<LocalTestimonial>): Promise<LocalTestimonial> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.text !== undefined) dbUpdates.text = updates.text;
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates.avatar !== undefined) dbUpdates.image = updates.avatar;
    const { data, error } = await supabase.from("testimonials").update(dbUpdates).eq("id", parseInt(id)).select().single();
    if (error) throw error;
    return dbTestimonialToLocal(data as DbTestimonial);
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("testimonials").delete().eq("id", parseInt(id));
    if (error) throw error;
  },
};

// ─── Destinations ──────────────────────────────────────────────────────────
export interface SbDestination {
  id: string; name: string; tagline: string; description: string;
  image: string; category: string; highlights: string[]; coords: string;
  featured: boolean; sort_order: number;
}

export const sbDestinationStore = {
  async getAll(): Promise<SbDestination[]> {
    const { data, error } = await supabase.from("destinations").select("*").order("sort_order", { ascending: true });
    if (error) throw error;
    return (data as SbDestination[]).map(d => ({
      id: d.id, name: d.name, tagline: d.tagline ?? "", description: d.description ?? "",
      image: d.image ?? "", category: d.category ?? "", highlights: (d.highlights as string[]) ?? [],
      coords: d.coords ?? "", featured: d.featured ?? false, sort_order: d.sort_order ?? 0,
    }));
  },
  async create(d: Omit<SbDestination, "sort_order">): Promise<SbDestination> {
    const { data, error } = await supabase.from("destinations").insert(d).select().single();
    if (error) throw error;
    return data as SbDestination;
  },
  async update(id: string, updates: Partial<SbDestination>): Promise<SbDestination> {
    const { data, error } = await supabase.from("destinations").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data as SbDestination;
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("destinations").delete().eq("id", id);
    if (error) throw error;
  },
};
