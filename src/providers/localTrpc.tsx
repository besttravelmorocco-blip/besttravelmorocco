/* ═══════════════════════════════════════════
   LOCAL tRPC PROVIDER — No backend needed
   Uses localStorage for all data operations.
   ═══════════════════════════════════════════ */

import { createContext, useContext, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  tourStore,
  blogStore,
  inquiryStore,
  testimonialStore,
  mediaStore,
  settingsStore,
  getDashboardStats,
  getSeedStatus,
  resetAllData,
  type LocalTour,
  type LocalBlogPost,
  type LocalInquiry,
  type LocalTestimonial,
  type LocalMedia,
  type SiteSettings,
} from "@/lib/localStore";

// ═══════════════════════════════════════════
// Context
// ═══════════════════════════════════════════
const LocalTrpcContext = createContext<ReturnType<typeof createLocalTrpc> | null>(null);

// ═══════════════════════════════════════════
// Hook factory
// ═══════════════════════════════════════════
function createLocalTrpc() {
  // ─── Tours ───────────────────────────
  const tours = {
    list: {
      useQuery: () =>
        useQuery({
          queryKey: ["tours", "list"],
          queryFn: () => tourStore.getAll(),
          staleTime: 0,
        }),
    },
    getById: {
      useQuery: (id: string) =>
        useQuery({
          queryKey: ["tours", "getById", id],
          queryFn: () => tourStore.getById(id) ?? null,
          enabled: !!id,
        }),
    },
    create: {
      useMutation: () => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: (data: Omit<LocalTour, "createdAt" | "updatedAt">) => tourStore.create(data),
          onSuccess: () => qc.invalidateQueries({ queryKey: ["tours"] }),
        });
      },
    },
    update: {
      useMutation: () => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: ({ id, ...data }: { id: string } & Partial<LocalTour>) => {
            const result = tourStore.update(id, data);
            if (!result) throw new Error("Tour not found");
            return result;
          },
          onSuccess: () => qc.invalidateQueries({ queryKey: ["tours"] }),
        });
      },
    },
    delete: {
      useMutation: () => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: (id: string) => tourStore.delete(id),
          onSuccess: () => qc.invalidateQueries({ queryKey: ["tours"] }),
        });
      },
    },
  };

  // ─── Blog ────────────────────────────
  const blog = {
    list: {
      useQuery: () =>
        useQuery({
          queryKey: ["blog", "list"],
          queryFn: () => blogStore.getAll(),
          staleTime: 0,
        }),
    },
    getById: {
      useQuery: (id: string) =>
        useQuery({
          queryKey: ["blog", "getById", id],
          queryFn: () => blogStore.getById(id) ?? null,
          enabled: !!id,
        }),
    },
    create: {
      useMutation: () => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: (data: Omit<LocalBlogPost, "createdAt" | "updatedAt">) => blogStore.create(data),
          onSuccess: () => qc.invalidateQueries({ queryKey: ["blog"] }),
        });
      },
    },
    update: {
      useMutation: () => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: ({ id, ...data }: { id: string } & Partial<LocalBlogPost>) => {
            const result = blogStore.update(id, data);
            if (!result) throw new Error("Blog post not found");
            return result;
          },
          onSuccess: () => qc.invalidateQueries({ queryKey: ["blog"] }),
        });
      },
    },
    delete: {
      useMutation: () => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: (id: string) => blogStore.delete(id),
          onSuccess: () => qc.invalidateQueries({ queryKey: ["blog"] }),
        });
      },
    },
  };

  // ─── Inquiries ───────────────────────
  const inquiries = {
    list: {
      useQuery: () =>
        useQuery({
          queryKey: ["inquiries", "list"],
          queryFn: () => inquiryStore.getAll(),
          staleTime: 0,
        }),
    },
    update: {
      useMutation: () => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: ({ id, ...data }: { id: string } & Partial<LocalInquiry>) => {
            const result = inquiryStore.update(id, data);
            if (!result) throw new Error("Inquiry not found");
            return result;
          },
          onSuccess: () => qc.invalidateQueries({ queryKey: ["inquiries"] }),
        });
      },
    },
    delete: {
      useMutation: () => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: (id: string) => inquiryStore.delete(id),
          onSuccess: () => qc.invalidateQueries({ queryKey: ["inquiries"] }),
        });
      },
    },
  };

  // ─── Dashboard ───────────────────────
  const dashboard = {
    stats: {
      useQuery: () =>
        useQuery({
          queryKey: ["dashboard", "stats"],
          queryFn: () => getDashboardStats(),
          staleTime: 0,
        }),
    },
    recentInquiries: {
      useQuery: () =>
        useQuery({
          queryKey: ["dashboard", "recentInquiries"],
          queryFn: () => inquiryStore.getRecent(5),
          staleTime: 0,
        }),
    },
    topTours: {
      useQuery: () =>
        useQuery({
          queryKey: ["dashboard", "topTours"],
          queryFn: () => tourStore.getAll().filter((t) => t.status === "published").slice(0, 5),
          staleTime: 0,
        }),
    },
  };

  // ─── Settings ────────────────────────
  const settings = {
    get: {
      useQuery: () =>
        useQuery({
          queryKey: ["settings", "get"],
          queryFn: () => settingsStore.get(),
          staleTime: 0,
        }),
    },
    update: {
      useMutation: () => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: (data: Partial<SiteSettings>) => settingsStore.update(data),
          onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
        });
      },
    },
  };

  // ─── Seed ────────────────────────────
  const seed = {
    status: {
      useQuery: () =>
        useQuery({
          queryKey: ["seed", "status"],
          queryFn: () => getSeedStatus(),
          staleTime: 0,
        }),
    },
    run: {
      useMutation: () => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: () => tourStore.seed(),
          onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["seed"] });
            qc.invalidateQueries({ queryKey: ["dashboard"] });
            qc.invalidateQueries({ queryKey: ["tours"] });
          },
        });
      },
    },
  };

  return {
    tours,
    blog,
    inquiries,
    dashboard,
    settings,
    seed,
    useContext: () => ({ invalidateQueries: useQueryClient().invalidateQueries }),
  };
}

// ═══════════════════════════════════════════
// Provider Component
// ═══════════════════════════════════════════
export function LocalTrpcProvider({ children }: { children: ReactNode }) {
  const trpcRef = useRef(createLocalTrpc());
  return (
    <LocalTrpcContext.Provider value={trpcRef.current}>
      {children}
    </LocalTrpcContext.Provider>
  );
}

// ═══════════════════════════════════════════
// Hook to access local tRPC
// ═══════════════════════════════════════════
export function useLocalTrpc() {
  const ctx = useContext(LocalTrpcContext);
  if (!ctx) throw new Error("useLocalTrpc must be inside LocalTrpcProvider");
  return ctx;
}
