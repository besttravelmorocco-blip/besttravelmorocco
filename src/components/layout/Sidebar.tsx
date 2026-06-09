import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Map, Globe, FileText, HelpCircle, Settings,
  ChevronDown, ChevronRight, Star, Image, Users, Mail,
  ExternalLink, Wrench, CalendarDays, Navigation, Car,
  Building2, ShoppingBag, TrendingUp, Tag, Compass, BarChart3,
  type LucideIcon,
} from 'lucide-react';

const CITY_GROUPS = [
  { city: 'Marrakech', path: 'marrakech' },
  { city: 'Fes',       path: 'fes' },
  { city: 'Casablanca', path: 'casablanca' },
  { city: 'Tangier',   path: 'tangier' },
  { city: 'Rabat',     path: 'rabat' },
  { city: 'Agadir',    path: 'agadir' },
];

type NavDef = { label: string; icon: LucideIcon; to: string };

const SALES: NavDef[] = [
  { label: 'Bookings',      icon: CalendarDays, to: '/bookings' },
  { label: 'Custom Tours',  icon: Compass,      to: '/custom-tours' },
  { label: 'Customers',     icon: Users,        to: '/customers' },
  { label: 'Inquiries',     icon: Mail,         to: '/inquiries' },
];

const CONTENT: NavDef[] = [
  { label: 'Destinations', icon: Globe,     to: '/destinations' },
  { label: 'Blog',         icon: FileText,  to: '/blog' },
  { label: 'Testimonials', icon: Star,      to: '/testimonials' },
  { label: 'FAQs',         icon: HelpCircle, to: '/faqs' },
  { label: 'Media',        icon: Image,     to: '/media' },
];

const WEBSITE: NavDef[] = [
  { label: 'Homepage Builder', icon: LayoutDashboard, to: '/homepage-builder' },
  { label: 'Navigation',       icon: Navigation,      to: '/navigation' },
];

const OPERATIONS: NavDef[] = [
  { label: 'Staff & Drivers', icon: Users,      to: '/staff' },
  { label: 'Vehicle Fleet',   icon: Car,        to: '/vehicles' },
  { label: 'Accommodations',  icon: Building2,  to: '/accommodations' },
  { label: 'Suppliers',       icon: ShoppingBag, to: '/suppliers' },
];

const PRICING: NavDef[] = [
  { label: 'Pricing Engine', icon: TrendingUp, to: '/pricing' },
  { label: 'Coupons',        icon: Tag,        to: '/coupons' },
];

const REPORTS: NavDef[] = [
  { label: 'Reports',         icon: BarChart3,  to: '/reports' },
  { label: 'Email Templates', icon: Mail,       to: '/email-templates' },
];

const SYSTEM: NavDef[] = [
  { label: 'Settings',         icon: Settings, to: '/settings' },
  { label: 'Setup & Diagnostics', icon: Wrench, to: '/setup' },
];

function NavItem({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </NavLink>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="sidebar-section-label">{label}</div>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const toursOpen = location.pathname.startsWith('/tours');
  const [cityExpanded, setCityExpanded] = useState<string | null>(null);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="flex items-center gap-2.5">
          <div style={{ width: 32, height: 32, borderRadius: 6, background: 'linear-gradient(135deg, #C9A96E, #A07840)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#1A0F0A', fontWeight: 800, fontSize: 14, fontFamily: 'Georgia' }}>B</span>
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '.02em', lineHeight: 1.2 }}>BTM Admin</div>
            <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 10.5, letterSpacing: '.08em' }}>MANAGEMENT PORTAL</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {/* Overview */}
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />

        {/* Sales & Bookings */}
        <SectionLabel label="Sales & Bookings" />
        {SALES.map(item => <NavItem key={item.to} {...item} />)}

        {/* Tours (with expand) */}
        <SectionLabel label="Content" />
        <div>
          <NavLink
            to="/tours"
            className={({ isActive }) => `sidebar-item${isActive || toursOpen ? ' active' : ''}`}
          >
            <Map size={16} />
            <span style={{ flex: 1 }}>Tours</span>
            {toursOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </NavLink>

          {toursOpen && (
            <div style={{ marginTop: 2 }}>
              <NavLink to="/tours" end className={({ isActive }) => `sidebar-sub-item${isActive ? ' active' : ''}`}>All Tours</NavLink>
              <NavLink to="/tours/new" className={({ isActive }) => `sidebar-sub-item${isActive ? ' active' : ''}`}>+ Add New Tour</NavLink>
              <div style={{ padding: '6px 10px 2px 36px', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)' }}>
                By Departure
              </div>
              {CITY_GROUPS.map(({ city, path }) => (
                <div key={city}>
                  <div
                    className={`city-group-header${cityExpanded === city ? ' active' : ''}`}
                    style={{ paddingLeft: 36, fontSize: 12 }}
                    onClick={() => setCityExpanded(cityExpanded === city ? null : city)}
                  >
                    <span style={{ flex: 1 }}>{city}</span>
                    {cityExpanded === city ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                  </div>
                  {cityExpanded === city && (
                    <NavLink to={`/tours?city=${path}`} className="sidebar-sub-item" style={{ paddingLeft: 52 }}>
                      View {city} Tours
                    </NavLink>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {CONTENT.map(item => <NavItem key={item.to} {...item} />)}

        {/* Website */}
        <SectionLabel label="Website" />
        {WEBSITE.map(item => <NavItem key={item.to} {...item} />)}

        {/* Operations */}
        <SectionLabel label="Operations" />
        {OPERATIONS.map(item => <NavItem key={item.to} {...item} />)}

        {/* Pricing */}
        <SectionLabel label="Pricing" />
        {PRICING.map(item => <NavItem key={item.to} {...item} />)}

        {/* Reports & Automation */}
        <SectionLabel label="Reports & Automation" />
        {REPORTS.map(item => <NavItem key={item.to} {...item} />)}

        {/* System */}
        <SectionLabel label="System" />
        {SYSTEM.map(item => <NavItem key={item.to} {...item} />)}

        {/* View Site */}
        <a href="https://www.besttravelmorocco.com" target="_blank" rel="noopener" className="sidebar-item" style={{ marginTop: 8 }}>
          <ExternalLink size={16} />
          <span>View Live Site</span>
        </a>
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,.06)', fontSize: 11, color: 'rgba(255,255,255,.2)', letterSpacing: '.04em' }}>
        BEST TRAVEL MOROCCO © 2026
      </div>
    </aside>
  );
}
