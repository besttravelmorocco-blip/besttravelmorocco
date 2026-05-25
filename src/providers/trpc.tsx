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
} from "@/lib/localStore";

const queryClient = new QueryClient();

// ─── Utils factory ─────────────────────────
function useUtils() {
  const qc = useQueryClient();
  return {
    invalidateQueries: (...keys: string[]) => qc.invalidateQueries({ queryKey: keys }),
    tours: { list: { invalidate: () => qc.invalidateQueries({ queryKey: ["tours"] }) } },
    blog: { list: { invalidate: () => qc.invalidateQueries({ queryKey: ["blog"] }) } },
    inquiries: { list: { invalidate: () => qc.invalidateQueries({ queryKey: ["inquiries"] }) } },
    dashboard: { stats: { invalidate: () => qc.invalidateQueries({ queryKey: ["dashboard"] }) } },
    seed: { status: { invalidate: () => qc.invalidateQueries({ queryKey: ["seed"] }) } },
    testimonials: { list: { invalidate: () => qc.invalidateQueries({ queryKey: ["testimonials"] }) } },
    media: { list: { invalidate: () => qc.invalidateQueries({ queryKey: ["media"] }) } },
  };
}

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
};

// ─── Mutation hooks ────────────────────────
const mutationHooks = {
  tours: {
    create: () => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: tourStore.create, onSuccess: () => qc.invalidateQueries() });
    },
    update: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: ({ id, ...data }: any) => { const r = tourStore.update(id, data); if (!r) throw new Error("Not found"); return r; },
        onSuccess: () => qc.invalidateQueries(),
      });
    },
    delete: () => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: tourStore.delete, onSuccess: () => qc.invalidateQueries() });
    },
  },
  blog: {
    create: () => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: blogStore.create, onSuccess: () => qc.invalidateQueries() });
    },
    update: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: ({ id, ...data }: any) => { const r = blogStore.update(id, data); if (!r) throw new Error("Not found"); return r; },
        onSuccess: () => qc.invalidateQueries(),
      });
    },
    delete: () => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: blogStore.delete, onSuccess: () => qc.invalidateQueries() });
    },
  },
  inquiries: {
    update: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: ({ id, ...data }: any) => { const r = inquiryStore.update(id, data); if (!r) throw new Error("Not found"); return r; },
        onSuccess: () => qc.invalidateQueries(),
      });
    },
    updateStatus: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: ({ id, status }: any) => { const r = inquiryStore.update(id, { status }); if (!r) throw new Error("Not found"); return r; },
        onSuccess: () => qc.invalidateQueries(),
      });
    },
    delete: () => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: inquiryStore.delete, onSuccess: () => qc.invalidateQueries() });
    },
  },
  settings: {
    update: () => {
      const qc = useQueryClient();
      return useMutation({ mutationFn: settingsStore.update, onSuccess: () => qc.invalidateQueries() });
    },
  },
  seed: {
    run: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: () => tourStore.seed(),
        onSuccess: () => { qc.invalidateQueries(); localStorage.setItem("btm_seeded", "true"); },
      });
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
  return {
    invalidate: () => qc.invalidateQueries(),
    invalidateQueries: (...keys: string[]) => qc.invalidateQueries({ queryKey: keys }),
    tours: { list: { invalidate: () => qc.invalidateQueries({ queryKey: ["tours"] }) } },
    blog: { list: { invalidate: () => qc.invalidateQueries({ queryKey: ["blog"] }) } },
    inquiries: { list: { invalidate: () => qc.invalidateQueries({ queryKey: ["inquiries"] }) } },
    dashboard: { stats: { invalidate: () => qc.invalidateQueries({ queryKey: ["dashboard"] }) } },
    seed: { status: { invalidate: () => qc.invalidateQueries({ queryKey: ["seed"] }) } },
    testimonials: { list: { invalidate: () => qc.invalidateQueries({ queryKey: ["testimonials"] }) } },
    media: { list: { invalidate: () => qc.invalidateQueries({ queryKey: ["media"] }) } },
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
