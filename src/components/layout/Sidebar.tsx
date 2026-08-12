import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Globe, FileText, HelpCircle, Settings,
  ChevronDown, ChevronRight, Star, Image, Users, Mail,
  ExternalLink, Wrench, CalendarDays, Navigation, Car,
  Building2, ShoppingBag, TrendingUp, Tag, Compass, BarChart3,
  Shield, PackageOpen, Map, Leaf, GraduationCap, Zap, Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useRole, type AdminRole } from '@/context/RoleContext';

// ── Role groups ──────────────────────────────────────────────────────────────
const WEBSITE_ROLES:  AdminRole[] = ['super_admin', 'website_manager', 'content_editor'];
const SALES_ROLES:    AdminRole[] = ['super_admin', 'sales_agent'];
const BOOKING_ROLES:  AdminRole[] = ['super_admin', 'sales_agent', 'operations_manager', 'finance_manager'];
const OPS_ROLES:      AdminRole[] = ['super_admin', 'operations_manager'];
const FINANCE_ROLES:  AdminRole[] = ['super_admin', 'finance_manager', 'operations_manager'];
const SYSTEM_ROLES:   AdminRole[] = ['super_admin'];

type NavDef = { label: string; icon: LucideIcon; to: string };

// ── Nav items ─────────────────────────────────────────────────────────────────

const PRODUCTS_ITEMS: NavDef[] = [
  { label: 'All Tours',       icon: PackageOpen,   to: '/products' },
  { label: 'Morocco Tours',   icon: Map,           to: '/products?category=morocco_tour' },
  { label: 'Student Trips',   icon: GraduationCap, to: '/products?category=student_trip' },
  { label: 'Yoga Retreats',   icon: Leaf,          to: '/products?category=yoga_retreat' },
  { label: 'Upcoming Tours',  icon: Zap,           to: '/products?category=upcoming_tour' },
];

const CONTENT_ITEMS: NavDef[] = [
  { label: 'Destinations', icon: Globe,      to: '/destinations' },
  { label: 'Blog',         icon: FileText,   to: '/blog' },
  { label: 'Testimonials', icon: Star,       to: '/testimonials' },
  { label: 'FAQs',         icon: HelpCircle, to: '/faqs' },
  { label: 'Media',        icon: Image,      to: '/media' },
];

const WEBSITE_ITEMS: NavDef[] = [
  { label: 'Homepage',     icon: LayoutDashboard, to: '/homepage-builder' },
  { label: 'Popular Tours',icon: Star,            to: '/popular-tours' },
  { label: 'Navigation',   icon: Navigation,      to: '/navigation' },
];

const SALES_ITEMS: NavDef[] = [
  { label: 'Inquiries',    icon: Mail,      to: '/inquiries' },
  { label: 'Custom Tours', icon: Compass,   to: '/custom-tours' },
  { label: 'Customers',    icon: Users,     to: '/customers' },
];

const BOOKING_ITEMS: NavDef[] = [
  { label: 'Reservations', icon: CalendarDays, to: '/bookings' },
];

const OPS_ITEMS: NavDef[] = [
  { label: 'Departures',    icon: CalendarDays, to: '/departures' },
  { label: 'Staff & Guides',icon: Users,        to: '/staff' },
  { label: 'Vehicle Fleet', icon: Car,          to: '/vehicles' },
  { label: 'Hotels & Camps',icon: Building2,    to: '/accommodations' },
  { label: 'Suppliers',     icon: ShoppingBag,  to: '/suppliers' },
];

const FINANCE_ITEMS: NavDef[] = [
  { label: 'Pricing Engine',   icon: TrendingUp, to: '/pricing' },
  { label: 'Coupons',          icon: Tag,        to: '/coupons' },
  { label: 'Reports',          icon: BarChart3,  to: '/reports' },
  { label: 'Email Templates',  icon: Mail,       to: '/email-templates' },
];

const SYSTEM_ITEMS: NavDef[] = [
  { label: 'Settings',            icon: Settings,  to: '/settings' },
  { label: 'Team & Roles',        icon: Shield,    to: '/team' },
  { label: 'Setup & Diagnostics', icon: Wrench,    to: '/setup' },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function SidebarNavItem({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
  const location = useLocation();
  const [path, query] = to.split('?');
  const isActive = path === location.pathname && (
    !query || location.search.includes(query.split('=')[1] ?? '')
  );
  return (
    <NavLink
      to={to}
      end={to === '/' || to === '/products'}
      className={() => `sidebar-item${isActive ? ' active' : ''}`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </NavLink>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <div className="sidebar-section-label">{label}</div>;
}

function DeptHeader({ label, deptKey, open, onToggle, color }: {
  label: string; deptKey: string; open: boolean;
  onToggle: (key: string) => void; color: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(deptKey)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
        padding: '14px 16px 5px', background: 'none', border: 'none',
        borderTop: '1px solid rgba(255,255,255,.05)', cursor: 'pointer', marginTop: 8,
      }}
    >
      <span style={{ flex: 1, fontSize: 10, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color, textAlign: 'left' }}>
        {label}
      </span>
      {open
        ? <ChevronDown  size={11} style={{ color, flexShrink: 0, opacity: 0.7 }} />
        : <ChevronRight size={11} style={{ color, flexShrink: 0, opacity: 0.7 }} />
      }
    </button>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { role, hasAccess, loading: roleLoading } = useRole();

  const [deptOpen, setDeptOpen] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('btm-dept-open') ?? '{}'); }
    catch { return {}; }
  });

  function toggleDept(key: string) {
    setDeptOpen(prev => {
      const next = { ...prev, [key]: prev[key] === undefined ? false : !prev[key] };
      localStorage.setItem('btm-dept-open', JSON.stringify(next));
      return next;
    });
  }

  const isOpen = (key: string) => deptOpen[key] !== false;

  // Fail-open: only hide when role confirmed loaded AND confirmed no access.
  const restrict = (allowed: AdminRole[]) => !roleLoading && role !== null && !hasAccess(allowed);

  const canWeb     = !restrict(WEBSITE_ROLES);
  const canSales   = !restrict(SALES_ROLES);
  const canBooking = !restrict(BOOKING_ROLES);
  const canOps     = !restrict(OPS_ROLES);
  const canFinance = !restrict(FINANCE_ROLES);
  const canSystem  = !restrict(SYSTEM_ROLES);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="flex items-center gap-2.5">
          <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
            <img
              src="https://uxkfqxistjvtofskqtwy.supabase.co/storage/v1/object/public/images/Best-Travel-Morocco-Icon.png"
              alt="BTM"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '.02em', lineHeight: 1.2 }}>BTM Admin</div>
            <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 10.5, letterSpacing: '.08em' }}>MANAGEMENT PORTAL</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Dashboard */}
        <NavLink to="/" end className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
          <LayoutDashboard size={16} /><span>Dashboard</span>
        </NavLink>

        {/* ── 1. WEBSITE & CONTENT ──────────────────────────────────── */}
        {canWeb && (
          <>
            <DeptHeader label="Website & Content" deptKey="web" open={isOpen('web')} onToggle={toggleDept} color="#60A5FA" />
            {isOpen('web') && (
              <>
                <SectionLabel label="Tours" />
                {PRODUCTS_ITEMS.map(item => <SidebarNavItem key={item.to} {...item} />)}

                <SectionLabel label="Content" />
                {CONTENT_ITEMS.map(item => <SidebarNavItem key={item.to} {...item} />)}

                <SectionLabel label="Site Builder" />
                {WEBSITE_ITEMS.map(item => <SidebarNavItem key={item.to} {...item} />)}
              </>
            )}
          </>
        )}

        {/* ── 2. SALES ──────────────────────────────────────────────── */}
        {canSales && (
          <>
            <DeptHeader label="Sales" deptKey="sales" open={isOpen('sales')} onToggle={toggleDept} color="#F97316" />
            {isOpen('sales') && SALES_ITEMS.map(item => <SidebarNavItem key={item.to} {...item} />)}
          </>
        )}

        {/* ── 3. BOOKINGS ────────────────────────────────────────────── */}
        {canBooking && (
          <>
            <DeptHeader label="Bookings" deptKey="bookings" open={isOpen('bookings')} onToggle={toggleDept} color="#A78BFA" />
            {isOpen('bookings') && BOOKING_ITEMS.map(item => <SidebarNavItem key={item.to} {...item} />)}
          </>
        )}

        {/* ── 4. OPERATIONS ─────────────────────────────────────────── */}
        {canOps && (
          <>
            <DeptHeader label="Operations" deptKey="ops" open={isOpen('ops')} onToggle={toggleDept} color="#10B981" />
            {isOpen('ops') && OPS_ITEMS.map(item => <SidebarNavItem key={item.to} {...item} />)}
          </>
        )}

        {/* ── 5. FINANCE ────────────────────────────────────────────── */}
        {canFinance && (
          <>
            <DeptHeader label="Finance" deptKey="finance" open={isOpen('finance')} onToggle={toggleDept} color="#C9A96E" />
            {isOpen('finance') && FINANCE_ITEMS.map(item => <SidebarNavItem key={item.to} {...item} />)}
          </>
        )}

        {/* ── 6. SYSTEM ─────────────────────────────────────────────── */}
        {canSystem && (
          <>
            <DeptHeader label="System" deptKey="system" open={isOpen('system')} onToggle={toggleDept} color="#94A3B8" />
            {isOpen('system') && SYSTEM_ITEMS.map(item => <SidebarNavItem key={item.to} {...item} />)}
          </>
        )}

        {/* View live site */}
        <a
          href="https://www.besttravelmorocco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-item"
          style={{ marginTop: 8 }}
        >
          <ExternalLink size={16} /><span>View Live Site</span>
        </a>
      </nav>

      <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,.06)', fontSize: 11, color: 'rgba(255,255,255,.2)', letterSpacing: '.04em' }}>
        BEST TRAVEL MOROCCO © 2026
      </div>
    </aside>
  );
}
