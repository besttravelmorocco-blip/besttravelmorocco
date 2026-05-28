/* ═══════════════════════════════════════════
   LOCAL tRPC — No Backend Required
   Static object that matches all tRPC calls.
   ═══════════════════════════════════════════ */

import { type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  tourStore, blogStore, inquiryStore,
  settingsStore, getDashboardStats, getSeedStatus,
  testimonialStore, mediaStore,
  bookingStore, departureStore, pricingRuleStore, getAnalyticsOverview,
} from "@/lib/localStore";

const queryClient = new QueryClient();

// ─── Query hooks ───────────────────────────
const queryHooks = {
  tours: {
    list: (opts?: any) => useQuery({
      queryKey: ["tours", "list", opts],
      queryFn: () => {
        let data = tourStore.getAll();
        if (opts?.status) data = data.filter(t => t.status === opts.status);
        if (opts?.search) {
          const q = opts.search.toLowerCase();
          data = data.filter(t => t.title.toLowerCase().includes(q) || t.fromCity.toLowerCase().includes(q));
        }
        return data;
      },
      staleTime: 0,
    }),
    getById: (id: string) => useQuery({ queryKey: ["tours", id], queryFn: () => tourStore.getById(id) ?? null, enabled: !!id, staleTime: 0 }),
  },
  blog: {
    list: (opts?: any) => useQuery({
      queryKey: ["blog", "list", opts],
      queryFn: () => {
        let data = blogStore.getAll();
        if (opts?.status) data = data.filter(b => b.status === opts.status);
        if (opts?.search) {
          const q = opts.search.toLowerCase();
          data = data.filter(b => b.title.toLowerCase().includes(q));
        }
        return data;
      },
      staleTime: 0,
    }),
    getById: (id: string) => useQuery({ queryKey: ["blog", id], queryFn: () => blogStore.getById(id) ?? null, enabled: !!id, staleTime: 0 }),
  },
  inquiries: {
    list: (opts?: any) => useQuery({
      queryKey: ["inquiries", "list", opts],
      queryFn: () => {
        let data = inquiryStore.getAll();
        if (opts?.status) data = data.filter(i => i.status === opts.status);
        return data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },
      staleTime: 0,
    }),
  },
  dashboard: {
    stats: () => useQuery({ queryKey: ["dashboard", "stats"], queryFn: () => getDashboardStats(), staleTime: 0 }),
    recentInquiries: () => useQuery({ queryKey: ["dashboard", "recent"], queryFn: () => inquiryStore.getRecent(5), staleTime: 0 }),
    topTours: () => useQuery({ queryKey: ["dashboard", "top"], queryFn: () => tourStore.getAll().filter(t => t.status === "published").slice(0, 5), staleTime: 0 }),
  },
  settings: {
    get: () => useQuery({ queryKey: ["settings"], queryFn: () => settingsStore.get(), staleTime: 0 }),
  },
  seed: {
    status: () => useQuery({ queryKey: ["seed", "status"], queryFn: () => getSeedStatus(), staleTime: 0 }),
  },
  testimonials: {
    list: () => useQuery({ queryKey: ["testimonials"], queryFn: () => testimonialStore.getAll(), staleTime: 0 }),
  },
  media: {
    list: () => useQuery({ queryKey: ["media"], queryFn: () => mediaStore.getAll(), staleTime: 0 }),
  },
  bookings: {
    list: (opts?: any) => useQuery({
      queryKey: ["bookings", "list", opts],
      queryFn: () => {
        let data = bookingStore.getAll();
        if (opts?.status) data = data.filter((b) => b.status === opts.status);
        if (opts?.search) { const q = opts.search.toLowerCase(); data = data.filter((b) => b.customerName.toLowerCase().includes(q)); }
        return data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },
      staleTime: 0,
    }),
    getById: (id: number) => useQuery({ queryKey: ["bookings", id], queryFn: () => bookingStore.getById(id) ?? null, staleTime: 0 }),
    stats: () => useQuery({ queryKey: ["bookings", "stats"], queryFn: () => bookingStore.stats(), staleTime: 0 }),
  },
  departures: {
    list: (opts?: any) => useQuery({
      queryKey: ["departures", "list", opts],
      queryFn: () => {
        let data = departureStore.getAll();
        if (opts?.tourId) data = data.filter((d) => d.tourId === opts.tourId);
        if (opts?.upcomingOnly) { const today = new Date().toISOString().slice(0, 10); data = data.filter((d) => d.departureDate >= today); }
        return data.sort((a, b) => b.departureDate.localeCompare(a.departureDate));
      },
      staleTime: 0,
    }),
  },
  pricing: {
    list: (opts?: any) => useQuery({
      queryKey: ["pricing", "list", opts],
      queryFn: () => {
        let data = pricingRuleStore.getAll();
        if (opts?.tourId) data = data.filter((r) => !r.tourId || r.tourId === opts.tourId);
        return data;
      },
      staleTime: 0,
    }),
    calculate: (input: any, opts?: { enabled?: boolean }) => useQuery({
      queryKey: ["pricing", "calculate", input],
      queryFn: () => {
        const ACCOM: Record<string, number> = { shared: 1, private: 1.35, luxury: 1.75 };
        const SEASON: Record<string, number> = { peak: 1.25, shoulder: 1.0, low: 0.85 };
        const getSeason = (d: string) => { const m = new Date(d).getMonth() + 1; if ((m >= 3 && m <= 5) || (m >= 9 && m <= 11)) return "peak"; if (m === 12 || m === 1) return "shoulder"; return "low"; };
        let price = input.basePrice * (ACCOM[input.accommodation] ?? 1);
        const season = input.departureDate ? getSeason(input.departureDate) : null;
        if (season) price *= SEASON[season] ?? 1;
        const rules = pricingRuleStore.getAll().filter((r) => r.active && (!r.tourId || r.tourId === input.tourId));
        const appliedRules: { name: string; adjustment: number }[] = [];
        for (const rule of rules) {
          const mod = parseFloat(rule.modifier);
          if (isNaN(mod)) continue;
          const adj = rule.modifierType === "percent" ? price * (mod / 100) : mod;
          price += adj;
          appliedRules.push({ name: rule.name, adjustment: adj });
        }
        const perPerson = Math.round(price);
        const childPrice = Math.round(price * 0.6);
        return { perPerson, childPrice, totalPrice: perPerson * (input.adults ?? 1) + childPrice * (input.children ?? 0), adults: input.adults, children: input.children, accommodation: input.accommodation, season, appliedRules };
      },
      enabled: opts?.enabled !== false && input?.basePrice > 0,
      staleTime: 0,
    }),
  },
  analytics: {
    overview: (opts?: any) => useQuery({ queryKey: ["analytics", "overview", opts], queryFn: () => getAnalyticsOverview(), staleTime: 0 }),
  },
};

// ─── Mutation hooks ────────────────────────
const mutationHooks = {
  tours: {
    create: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: (d: any) => Promise.resolve(tourStore.create(d)), onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); } });
    },
    update: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: ({ id, ...data }: any) => { const r = tourStore.update(id, data); if (!r) throw new Error("Not found"); return Promise.resolve(r); },
        onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); },
      });
    },
    delete: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: (id: any) => Promise.resolve(tourStore.delete(id)), onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); } });
    },
  },
  blog: {
    create: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: (d: any) => Promise.resolve(blogStore.create(d)), onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); } });
    },
    update: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: ({ id, ...data }: any) => { const r = blogStore.update(id, data); if (!r) throw new Error("Not found"); return Promise.resolve(r); },
        onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); },
      });
    },
    delete: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: (id: any) => Promise.resolve(blogStore.delete(id)), onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); } });
    },
  },
  inquiries: {
    update: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: ({ id, ...data }: any) => { const r = inquiryStore.update(id, data); if (!r) throw new Error("Not found"); return Promise.resolve(r); },
        onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); },
      });
    },
    updateStatus: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: ({ id, status }: any) => { const r = inquiryStore.update(id, { status }); if (!r) throw new Error("Not found"); return Promise.resolve(r); },
        onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); },
      });
    },
    delete: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: (id: any) => Promise.resolve(inquiryStore.delete(id)), onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); } });
    },
  },
  settings: {
    update: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: (d: any) => Promise.resolve(settingsStore.update(d)), onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); } });
    },
  },
  seed: {
    run: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: () => Promise.resolve(tourStore.seed()),
        onSuccess: () => { qc.invalidateQueries(); localStorage.setItem("btm_seeded", "true"); opts?.onSuccess?.(); },
      });
    },
  },
  bookings: {
    create: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: (d: any) => Promise.resolve(bookingStore.create(d)), onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); } });
    },
    updateStatus: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: ({ id, ...data }: any) => { const r = bookingStore.update(id, data); if (!r) throw new Error("Not found"); return Promise.resolve(r); },
        onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); },
      });
    },
    delete: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: (id: any) => Promise.resolve(bookingStore.delete(id)), onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); } });
    },
  },
  departures: {
    generateForTour: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: (d: any) => Promise.resolve(departureStore.generate(d)),
        onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); },
      });
    },
    updateSeats: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: ({ id, ...data }: any) => { const r = departureStore.update(id, data); if (!r) throw new Error("Not found"); return Promise.resolve(r); },
        onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); },
      });
    },
    delete: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: (id: any) => Promise.resolve(departureStore.delete(id)), onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); } });
    },
  },
  pricing: {
    create: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: (d: any) => Promise.resolve(pricingRuleStore.create(d)), onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); } });
    },
    update: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: ({ id, ...data }: any) => { const r = pricingRuleStore.update(id, data); if (!r) throw new Error("Not found"); return Promise.resolve(r); },
        onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); },
      });
    },
    delete: (opts?: { onSuccess?: () => void }) => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: (id: any) => Promise.resolve(pricingRuleStore.delete(id)), onSuccess: () => { qc.invalidateQueries(); opts?.onSuccess?.(); } });
    },
  },
  testimonials: {
    create: () => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: (t: any) => Promise.resolve(testimonialStore.create(t)), onSuccess: () => qc.invalidateQueries() });
    },
    update: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: ({ id, ...data }: any) => { const r = testimonialStore.update(id, data); if (!r) throw new Error("Not found"); return Promise.resolve(r); },
        onSuccess: () => qc.invalidateQueries(),
      });
    },
    delete: () => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: (id: string) => Promise.resolve(testimonialStore.delete(id)), onSuccess: () => qc.invalidateQueries() });
    },
  },
  media: {
    create: () => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: (m: any) => Promise.resolve(mediaStore.create(m)), onSuccess: () => qc.invalidateQueries() });
    },
    delete: () => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: (id: string) => Promise.resolve(mediaStore.delete(id)), onSuccess: () => qc.invalidateQueries() });
    },
  },
};

// ═══════════════════════════════════════════
// STATIC tRPC OBJECT
// ═══════════════════════════════════════════
// ─── Auth hooks ────────────────────────────
const useAuthMe = () => useQuery({
  queryKey: ["auth", "me"],
  queryFn: () => ({
    id: "admin-1",
    name: "Admin",
    email: "admin@btm.com",
    role: "admin",
    avatar: null,
  }),
  staleTime: Infinity,
});

const useAuthLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => Promise.resolve(true),
    onSuccess: () => qc.clear(),
  });
};

// ─── Fixed useUtils with .invalidate() support ──
function useUtilsFixed() {
  const qc = useQueryClient();
  const inv = (key: string) => ({ invalidate: () => qc.invalidateQueries({ queryKey: [key] }) });
  return {
    invalidate: () => qc.invalidateQueries(),
    invalidateQueries: (...keys: string[]) => qc.invalidateQueries({ queryKey: keys }),
    tours: { list: inv("tours") },
    blog: { list: inv("blog") },
    inquiries: { list: inv("inquiries") },
    dashboard: { stats: inv("dashboard") },
    seed: { status: inv("seed") },
    testimonials: { list: inv("testimonials") },
    media: { list: inv("media") },
    bookings: { list: inv("bookings"), stats: inv("bookings") },
    departures: { list: inv("departures") },
    pricing: { list: inv("pricing") },
    analytics: { overview: inv("analytics") },
  };
}

export const trpc = {
  tours: {
    list: { useQuery: queryHooks.tours.list },
    getById: { useQuery: queryHooks.tours.getById },
    create: { useMutation: mutationHooks.tours.create },
    update: { useMutation: mutationHooks.tours.update },
    delete: { useMutation: mutationHooks.tours.delete },
  },
  blog: {
    list: { useQuery: queryHooks.blog.list },
    getById: { useQuery: queryHooks.blog.getById },
    create: { useMutation: mutationHooks.blog.create },
    update: { useMutation: mutationHooks.blog.update },
    delete: { useMutation: mutationHooks.blog.delete },
  },
  inquiries: {
    list: { useQuery: queryHooks.inquiries.list },
    update: { useMutation: mutationHooks.inquiries.update },
    updateStatus: { useMutation: mutationHooks.inquiries.updateStatus },
    delete: { useMutation: mutationHooks.inquiries.delete },
  },
  dashboard: {
    stats: { useQuery: queryHooks.dashboard.stats },
    recentInquiries: { useQuery: queryHooks.dashboard.recentInquiries },
    topTours: { useQuery: queryHooks.dashboard.topTours },
  },
  settings: {
    get: { useQuery: queryHooks.settings.get },
    update: { useMutation: mutationHooks.settings.update },
  },
  seed: {
    status: { useQuery: queryHooks.seed.status },
    run: { useMutation: mutationHooks.seed.run },
  },
  auth: {
    me: { useQuery: useAuthMe },
    logout: { useMutation: useAuthLogout },
  },
  testimonials: {
    list: { useQuery: queryHooks.testimonials.list },
    create: { useMutation: mutationHooks.testimonials.create },
    update: { useMutation: mutationHooks.testimonials.update },
    delete: { useMutation: mutationHooks.testimonials.delete },
  },
  media: {
    list: { useQuery: queryHooks.media.list },
    create: { useMutation: mutationHooks.media.create },
    delete: { useMutation: mutationHooks.media.delete },
  },
  bookings: {
    list: { useQuery: queryHooks.bookings.list },
    getById: { useQuery: queryHooks.bookings.getById },
    stats: { useQuery: queryHooks.bookings.stats },
    create: { useMutation: mutationHooks.bookings.create },
    updateStatus: { useMutation: mutationHooks.bookings.updateStatus },
    delete: { useMutation: mutationHooks.bookings.delete },
  },
  departures: {
    list: { useQuery: queryHooks.departures.list },
    generateForTour: { useMutation: mutationHooks.departures.generateForTour },
    updateSeats: { useMutation: mutationHooks.departures.updateSeats },
    delete: { useMutation: mutationHooks.departures.delete },
  },
  pricing: {
    list: { useQuery: queryHooks.pricing.list },
    calculate: { useQuery: queryHooks.pricing.calculate },
    create: { useMutation: mutationHooks.pricing.create },
    update: { useMutation: mutationHooks.pricing.update },
    delete: { useMutation: mutationHooks.pricing.delete },
  },
  analytics: {
    overview: { useQuery: queryHooks.analytics.overview },
  },
  useContext: useUtilsFixed,
  useUtils: useUtilsFixed,
};

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
