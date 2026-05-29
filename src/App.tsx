import { Routes, Route, Navigate } from "react-router";
import { TRPCProvider } from "@/providers/trpc";
import { AdminLayout } from "@/components/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import ToursPage from "@/pages/admin/ToursPage";
import BlogPage from "@/pages/admin/BlogPage";
import InquiriesPage from "@/pages/admin/InquiriesPage";
import TestimonialsPage from "@/pages/admin/TestimonialsPage";
import MediaPage from "@/pages/admin/MediaPage";
import SettingsPage from "@/pages/admin/SettingsPage";
import PageBuilder from "@/components/PageBuilder";
import LoginPage from "@/pages/admin/LoginPage";
import ResetPasswordPage from "@/pages/admin/ResetPasswordPage";
import BookingsPage from "@/pages/admin/BookingsPage";
import StudentTripsPage from "@/pages/admin/StudentTripsPage";
import PricingPage from "@/pages/admin/PricingPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import { getSession, onAuthStateChange } from "@/lib/authStore";
import { useState, useEffect, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

function AuthGuard({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    getSession().then(setSession);
    const sub = onAuthStateChange(setSession);
    return () => sub.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C19A5B] border-t-transparent" />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoutes() {
  return (
    <AuthGuard>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pages" element={<PageBuilder />} />
          <Route path="/tours" element={<ToursPage />} />
          <Route path="/tours/new" element={<ToursPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/new" element={<BlogPage />} />
          <Route path="/inquiries" element={<InquiriesPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/student-trips" element={<StudentTripsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AdminLayout>
    </AuthGuard>
  );
}

export default function App() {
  return (
    <TRPCProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/*" element={<AdminRoutes />} />
      </Routes>
    </TRPCProvider>
  );
}
