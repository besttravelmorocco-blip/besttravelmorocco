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
import { isAuthenticated } from "@/lib/authStore";
import { type ReactNode } from "react";

function AuthGuard({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
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
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/*" element={<AdminRoutes />} />
      </Routes>
    </TRPCProvider>
  );
}
