import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquareText,
  NotebookPen,
  Package,
  Star,
  X,
} from "lucide-react";
import { Logo } from "@/components/sv/Logo";

export const ADMIN_NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
  { key: "inquiries", label: "Inquiries", icon: MessageSquareText, group: "Customers", badgeKey: "newInquiries" },
  { key: "reviews", label: "Reviews", icon: Star, group: "Customers", badgeKey: "pendingReviews" },
  { key: "blogs", label: "Blogs", icon: NotebookPen, group: "Content", badgeKey: "pendingBlogs" },
  { key: "packages", label: "Packages", icon: Package, group: "Content" },
  { key: "destinations", label: "Destinations", icon: MapPin, group: "Content" },
];

const PAGE_META = {
  dashboard: { title: "Dashboard", subtitle: "Overview of leads, content and catalog" },
  inquiries: { title: "Inquiries", subtitle: "Customer expedition & package leads" },
  reviews: { title: "Reviews", subtitle: "Moderate guest reviews" },
  blogs: { title: "Blogs", subtitle: "Moderate community field dispatches" },
  packages: { title: "Packages", subtitle: "Create and edit expedition packages" },
  destinations: { title: "Destinations", subtitle: "Manage map destinations" },
};

function SidebarContent({ tab, onSelect, badges, user, onLogout }) {
  const groups = [...new Set(ADMIN_NAV.map((n) => n.group))];
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-ivory/10 px-6 py-5">
        <Logo className="h-12 w-auto" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5" data-lenis-prevent>
        {groups.map((g) => (
          <div key={g} className="mb-6">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-ivory/40">{g}</p>
            <ul className="space-y-1">
              {ADMIN_NAV.filter((n) => n.group === g).map((n) => {
                const Icon = n.icon;
                const active = tab === n.key;
                const badge = n.badgeKey ? badges?.[n.badgeKey] : 0;
                return (
                  <li key={n.key}>
                    <button
                      type="button"
                      onClick={() => onSelect(n.key)}
                      aria-current={active ? "page" : undefined}
                      data-testid={`admin-tab-${n.key}`}
                      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? "bg-gold text-forest shadow-[0_6px_20px_rgba(182,139,80,0.25)]"
                          : "text-ivory/75 hover:bg-ivory/[0.06] hover:text-ivory"
                      }`}
                    >
                      <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-forest" : "text-gold/80 group-hover:text-gold"}`} />
                      <span className="flex-1 text-left font-medium">{n.label}</span>
                      {badge > 0 && (
                        <span
                          className={`min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold ${
                            active ? "bg-forest text-gold" : "bg-gold text-forest"
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-ivory/10 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-ivory/[0.05] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold font-semibold uppercase text-forest">
            {(user?.name || user?.email || "A").charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ivory">{user?.name || "Administrator"}</p>
            <p className="truncate text-[11px] text-ivory/50">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-md p-1.5 text-ivory/60 transition-colors hover:bg-ivory/10 hover:text-gold"
            title="Sign out"
            data-testid="admin-logout-btn"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ tab, onSelect, badges, user, onLogout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const meta = PAGE_META[tab] || PAGE_META.dashboard;
  const select = (k) => {
    onSelect(k);
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="flex min-h-screen bg-[#F4F1EA]" data-testid="admin-page">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-forest lg:block">
        <SidebarContent tab={tab} onSelect={select} badges={badges} user={user} onLogout={onLogout} />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-forest shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1.5 text-ivory/70 hover:bg-ivory/10"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent tab={tab} onSelect={select} badges={badges} user={user} onLogout={onLogout} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-char/10 bg-white/90 px-4 backdrop-blur sm:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-forest hover:bg-mist lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-char/50">
              Admin <span className="mx-1 text-char/30">/</span> <span className="text-forest">{meta.title}</span>
            </p>
            <h1 className="truncate font-serif text-xl leading-tight text-forest">{meta.title}</h1>
          </div>
          <p className="hidden text-xs text-char/55 md:block">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-char/15 px-3.5 py-1.5 text-xs font-medium text-forest transition-colors hover:border-gold"
          >
            <ExternalLink className="h-3.5 w-3.5 text-gold" />
            <span className="hidden sm:inline">View site</span>
          </Link>
        </header>

        <main className="flex-1 px-4 pb-16 pt-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
