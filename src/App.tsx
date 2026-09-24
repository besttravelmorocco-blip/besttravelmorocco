import { Component, Suspense, lazy, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { RoleProvider } from '@/context/RoleContext';
import RoleGuard from '@/components/RoleGuard';
import AdminLayout from '@/components/layout/AdminLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
const ToursPage = lazy(() => import('@/pages/tours/ToursPage'));
const TourForm = lazy(() => import('@/pages/tours/TourForm'));
const DestinationsPage = lazy(() => import('@/pages/destinations/DestinationsPage'));
const BlogPage = lazy(() => import('@/pages/blog/BlogPage'));
const TestimonialsPage = lazy(() => import('@/pages/testimonials/TestimonialsPage'));
const FAQsPage = lazy(() => import('@/pages/faqs/FAQsPage'));
const InquiriesPage = lazy(() => import('@/pages/inquiries/InquiriesPage'));
const MediaPage = lazy(() => import('@/pages/media/MediaPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const Setup = lazy(() => import('@/pages/Setup'));
const BookingsPage = lazy(() => import('@/pages/bookings/BookingsPage'));
const BookingDetail = lazy(() => import('@/pages/bookings/BookingDetail'));
const StaffPage = lazy(() => import('@/pages/staff/StaffPage'));
const HomepageBuilderPage = lazy(() => import('@/pages/website/HomepageBuilderPage'));
const NavigationEditorPage = lazy(() => import('@/pages/website/NavigationEditorPage'));
const PopularToursPage = lazy(() => import('@/pages/website/PopularToursPage'));
const NavDropdownPage = lazy(() => import('@/pages/website/NavDropdownPage'));
const CustomersPage = lazy(() => import('@/pages/customers/CustomersPage'));
const VehiclesPage = lazy(() => import('@/pages/operations/VehiclesPage'));
const AccommodationsPage = lazy(() => import('@/pages/accommodations/AccommodationsPage'));
const SuppliersPage = lazy(() => import('@/pages/suppliers/SuppliersPage'));
const PricingEnginePage = lazy(() => import('@/pages/pricing/PricingEnginePage'));
const CouponsPage = lazy(() => import('@/pages/coupons/CouponsPage'));
const CustomToursPage = lazy(() => import('@/pages/leads/CustomToursPage'));
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'));
const EmailTemplatesPage = lazy(() => import('@/pages/email/EmailTemplatesPage'));
const ExperiencesManagerPage = lazy(() => import('@/pages/experiences/ExperiencesManagerPage'));
const TeamRolesPage = lazy(() => import('@/pages/team/TeamRolesPage'));
const ProductsPage = lazy(() => import('@/pages/products/ProductsPage'));
const ProductForm = lazy(() => import('@/pages/products/ProductForm'));
const DeparturesPage = lazy(() => import('@/pages/departures/DeparturesPage'));
const SeoDashboardPage = lazy(() => import('@/pages/seo/SeoDashboardPage'));
const SeoSettingsPage = lazy(() => import('@/pages/seo/SeoSettingsPage'));
const ReviewPage = lazy(() => import('@/pages/review/ReviewPage'));

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

// ── Auth + role guard ─────────────────────────────────────────────────────────
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
  return <RoleProvider user={user}>{children}</RoleProvider>;
}

function PageFallback() {
  return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '0 auto' }} />
    </div>
  );
}

export default function App() {
  useTheme();
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageFallback />}>
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
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="bookings/:id" element={<BookingDetail />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="homepage-builder" element={<HomepageBuilderPage />} />
          <Route path="popular-tours" element={<PopularToursPage />} />
          <Route path="nav-dropdown" element={<NavDropdownPage />} />
          <Route path="navigation" element={<NavigationEditorPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="accommodations" element={<AccommodationsPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="pricing" element={<PricingEnginePage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="custom-tours" element={<CustomToursPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="email-templates" element={<EmailTemplatesPage />} />
          <Route path="experiences" element={<ExperiencesManagerPage />} />
          {/* ── Unified product system ── */}
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          {/* ── Departures ── */}
          <Route path="departures" element={<DeparturesPage />} />
          {/* ── SEO Command Center ── */}
          <Route path="seo" element={<SeoDashboardPage />} />
          <Route path="seo/settings" element={<RoleGuard allow={['super_admin', 'website_manager']}><SeoSettingsPage /></RoleGuard>} />
          <Route path="settings" element={<RoleGuard allow={['super_admin']}><SettingsPage /></RoleGuard>} />
          <Route path="team" element={<RoleGuard allow={['super_admin']}><TeamRolesPage /></RoleGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      </Suspense>
      <Toaster position="bottom-right" expand={false} richColors toastOptions={{ style: { fontFamily: 'Jost, sans-serif', fontSize: 13 } }} />
    </ErrorBoundary>
  );
}
