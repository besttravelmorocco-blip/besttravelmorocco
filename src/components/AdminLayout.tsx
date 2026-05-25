import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Map,
  FileText,
  Image,
  Settings,
  Mail,
  Star,
  Menu,
  Globe,
  LogOut,
  ChevronRight,
  Layers,
} from "lucide-react";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Page Builder",
    href: "/admin/pages",
    icon: Layers,
  },
  {
    title: "Tours",
    href: "/admin/tours",
    icon: Map,
  },
  {
    title: "Blog",
    href: "/admin/blog",
    icon: FileText,
  },
  {
    title: "Inquiries",
    href: "/admin/inquiries",
    icon: Mail,
    badge: "new",
  },
  {
    title: "Media Library",
    href: "/admin/media",
    icon: Image,
  },
  {
    title: "Testimonials",
    href: "/admin/testimonials",
    icon: Star,
  },
  {
    title: "Site Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "View Website",
    href: "https://besttravelmorocco.com",
    icon: Globe,
    external: true,
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-stone-200 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4A574]">
          <span className="font-playfair text-sm font-bold text-white">BTM</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-stone-900">Best Travel Morocco</span>
          <span className="text-xs text-stone-500">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-1 px-3">
          {sidebarNavItems.map((item) => {
            const isActive = !item.external && location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#D4A574]/10 text-[#D4A574]"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                    {item.badge}
                  </span>
                )}
                {item.external && <ChevronRight className="h-4 w-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom: User */}
      <div className="border-t border-stone-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200">
            <span className="text-sm font-medium text-stone-700">
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-stone-900">
              {user?.name ?? "Admin"}
            </p>
            <p className="truncate text-xs text-stone-500">
              {user?.email ?? "admin@btm.com"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-stone-500 hover:text-red-600"
            onClick={logout}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-stone-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-stone-200 bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 h-10 w-10 bg-white shadow-md"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-stone-200 bg-white px-6">
          <div className="flex items-center gap-4 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4A574]">
              <span className="font-playfair text-sm font-bold text-white">BTM</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-stone-900">
              {sidebarNavItems.find((i) => i.href === location.pathname)?.title ?? "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
