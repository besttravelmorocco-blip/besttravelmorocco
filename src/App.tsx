import { Component, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import AdminLayout from '@/components/layout/AdminLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import ToursPage from '@/pages/tours/ToursPage';
import TourForm from '@/pages/tours/TourForm';
import DestinationsPage from '@/pages/destinations/DestinationsPage';
import BlogPage from '@/pages/blog/BlogPage';
import TestimonialsPage from '@/pages/testimonials/TestimonialsPage';
import FAQsPage from '@/pages/faqs/FAQsPage';
import InquiriesPage from '@/pages/inquiries/InquiriesPage';
import MediaPage from '@/pages/media/MediaPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import Setup from '@/pages/Setup';

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0A07', padding: 24 }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <p style={{ color: '#EF4444', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Something went wrong</p>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, marginBottom: 20 }}>{this.state.error.message}</p>
          <button onClick={() => this.setState({ error: null })} style={{ background: '#C9A96E', color: '#1A0F0A', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

// ── Auth guard ────────────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111318' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(201,169,110,.3)', borderTopColor: '#C9A96E', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>Loading…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  useTheme();
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
        <Route
          path="/"
          element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}
        >
          <Route index element={<Dashboard />} />
          <Route path="tours" element={<ToursPage />} />
          <Route path="tours/new" element={<TourForm />} />
          <Route path="tours/:id/edit" element={<TourForm />} />
          <Route path="destinations" element={<DestinationsPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="faqs" element={<FAQsPage />} />
          <Route path="inquiries" element={<InquiriesPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" expand={false} richColors toastOptions={{ style: { fontFamily: 'Jost, sans-serif', fontSize: 13 } }} />
    </ErrorBoundary>
  );
}
