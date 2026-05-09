"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Menu,
  X,
  Settings,
  Home,
  LogOut,
  FileText,
  Package,
  Box,
  Truck,
  Warehouse,
  ArrowLeftRight,
  FilePlus,
  List,
  BellRing,
  AlertTriangle,
  Users,
  Kanban,
  User,
  Handshake,
  Briefcase,
  Clock,
  IndianRupee,
  Receipt,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function NavGroup({ title, icon: Icon, children, defaultOpen = true }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between px-3 py-2 text-[13px] rounded-lg hover-bg-subtle focus-ring text-[var(--foreground-muted)] font-medium"
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="h-[16px] w-[16px]" />}
          <span className="truncate uppercase text-[10px] tracking-wider">{title}</span>
        </div>
        {isOpen ? <ChevronDown className="h-4 w-4 opacity-50" /> : <ChevronRight className="h-4 w-4 opacity-50" />}
      </button>
      {isOpen && (
        <div className="ml-4 pl-2 border-l border-[var(--sidebar-border)] mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}

const IconMap: Record<string, any> = {
  "file-text": FileText,
  "layout-dashboard": LayoutDashboard,
  "package": Package,
  "box": Box,
  "truck": Truck,
  "warehouse": Warehouse,
  "arrow-left-right": ArrowLeftRight,
  "file-plus": FilePlus,
  "list": List,
  "bell-ring": BellRing,
  "alert-triangle": AlertTriangle,
  "users": Users,
  "kanban": Kanban,
  "user": User,
  "handshake": Handshake,
  "briefcase": Briefcase,
  "clock": Clock,
  "indian-rupee": IndianRupee,
  "receipt": Receipt,
  "layers": Layers,
};

/**
 * Clean end-user shell for a tenant's runtime ERP at /apps/<slug>/...
 *
 * Deliberately different from the builder dashboard Sidebar:
 *  : no marketplace/plugin/schema chrome
 *  : nav is driven entirely by the tenant's installed tables + custom pages
 *  : "Back to builder" is the only cross-link, tucked in the corner
 */
export type AppShellWorkspace = {
  name: string;
  slug: string;
  tables: Array<{ id: string; name: string }>;
  pages: Array<{
    id: string;
    title: string;
    icon?: string | null;
    packPageKey?: string | null;
    packSource?: string | null;
  }>;
};

export function AppShell({
  workspace,
  children,
}: {
  workspace: AppShellWorkspace;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const base = `/apps/${workspace.slug}`;

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/tenant/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: workspace.slug }),
    });
    router.push(`/apps/${workspace.slug}/login`);
    router.refresh();
  }

  // System pages: user_management is merged into Settings → Users tab, so it
  // is never linked directly in the tenant nav. Settings is pinned at the
  // bottom with a separator rather than mixed in with custom pages.
  const settingsPage = workspace.pages.find((p) => p.packPageKey === "settings");
  const nonSystemPages = workspace.pages.filter(
    (p) => p.packPageKey !== "settings" && p.packPageKey !== "user_management"
  );

  const navItems = [
    { href: base, label: "Home", icon: Home, exact: true },
    ...nonSystemPages.map((p) => ({
      href: `${base}/pages/${p.id}`,
      label: p.title,
      icon: p.icon ? (IconMap[p.icon] || LayoutDashboard) : LayoutDashboard,
      exact: false,
    })),
  ];

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const isLoginPage = pathname === `${base}/login`;

  if (isLoginPage) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">{children}</div>;
  }

  // Group pages by packSource
  const groupedPages: Record<string, typeof nonSystemPages> = {};
  const flatPages: typeof nonSystemPages = [];

  nonSystemPages.forEach(p => {
    if (p.packSource) {
      if (!groupedPages[p.packSource]) groupedPages[p.packSource] = [];
      groupedPages[p.packSource].push(p);
    } else {
      flatPages.push(p);
    }
  });

  const formatPackName = (slug: string) => {
    if (slug === 'hr') return 'HR';
    if (slug === 'crm') return 'CRM';
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const NavItemRender = ({ item, active }: { item: any, active: boolean }) => (
    <Link
      href={item.href}
      onClick={() => setSidebarOpen(false)}
      className={`relative flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg focus-ring ${
        active ? "sidebar-nav-item active font-medium" : "sidebar-nav-item"
      }`}
      style={active ? undefined : { color: "var(--foreground-muted)" }}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full animate-nav-indicator"
          style={{ background: "var(--primary)" }}
        />
      )}
      <item.icon className="h-[16px] w-[16px] shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Noise overlay : breaks digital flatness */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-300"
          style={{
            background: "oklch(0.08 0.020 260 / 0.55)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar : hidden by default, slide-in on toggle */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[248px] flex flex-col border-r transform transition-transform duration-300 ease-[var(--ease-out-expo)] ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        style={{
          background: "var(--sidebar)",
          borderColor: "var(--sidebar-border)",
        }}
      >
        {/* Brand */}
        <div
          className="h-[60px] flex items-center px-3 border-b shrink-0"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <div className="relative shrink-0 flex items-center">
            <img src="/logo/logo.png" alt="Logo" className="h-12 w-auto" />
          </div>
          <div className="ml-2.5 min-w-0 flex-1">
            <span
              className="font-semibold text-[15px] block leading-tight truncate tracking-tight"
              style={{ color: "var(--sidebar-foreground)" }}
            >
              {workspace.name}
            </span>
            <span
              className="text-[10px] tracking-[0.05em] font-medium opacity-50 uppercase"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              {workspace.slug}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="h-7 w-7 rounded-lg flex items-center justify-center hover-bg-subtle focus-ring ml-auto"
            style={{ color: "var(--foreground-dimmed)", background: "var(--surface-2)" }}
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5 custom-scrollbar">
          {/* Home */}
          <NavItemRender 
            item={{ href: base, label: "Home", icon: Home }} 
            active={isActive(base, true)} 
          />

          {/* Grouped Pages */}
          {Object.entries(groupedPages).map(([packSource, pages]) => {
            const hasActiveChild = pages.some(p => isActive(`${base}/pages/${p.id}`, false));
            return (
              <NavGroup 
                key={packSource} 
                title={formatPackName(packSource)} 
                defaultOpen={hasActiveChild || true}
                icon={Box} // Generic icon for modules
              >
                {pages.map((p) => {
                  const href = `${base}/pages/${p.id}`;
                  return (
                    <NavItemRender
                      key={p.id}
                      item={{
                        href,
                        label: p.title,
                        icon: p.icon ? (IconMap[p.icon] || LayoutDashboard) : LayoutDashboard,
                      }}
                      active={isActive(href, false)}
                    />
                  );
                })}
              </NavGroup>
            );
          })}

          {/* Flat Pages */}
          {flatPages.length > 0 && (
            <div className="pt-2 mt-2 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
              {flatPages.map((p) => {
                const href = `${base}/pages/${p.id}`;
                return (
                  <NavItemRender
                    key={p.id}
                    item={{
                      href,
                      label: p.title,
                      icon: p.icon ? (IconMap[p.icon] || LayoutDashboard) : LayoutDashboard,
                    }}
                    active={isActive(href, false)}
                  />
                );
              })}
            </div>
          )}

          {workspace.tables.length === 0 && nonSystemPages.length === 0 && (
            <div
              className="px-3 py-6 text-xs text-center"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              No tables or pages yet. Head to the builder to install modules.
            </div>
          )}
        </nav>

        {/* Bottom: settings (pinned), theme + logout */}
        <div
          className="px-2.5 py-2.5 border-t space-y-1"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          {settingsPage && (() => {
            const href = `${base}/pages/${settingsPage.id}`;
            const active = isActive(href, false);
            return (
              <Link
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`relative flex items-center gap-2.5 px-3 py-2.5 text-[13px] rounded-lg focus-ring ${
                  active ? "sidebar-nav-item active" : "sidebar-nav-item"
                }`}
                style={active ? undefined : { color: "var(--foreground-muted)" }}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-full animate-nav-indicator"
                    style={{ background: "var(--primary)" }}
                  />
                )}
                <Settings className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{settingsPage.title}</span>
              </Link>
            );
          })()}
          <div className="flex items-center justify-between px-1 pt-1">
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg sidebar-nav-item focus-ring transition-colors"
            style={{ color: "var(--danger)" }}
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar : always visible to allow sidebar toggle */}
        <div
          className="h-[56px] flex items-center px-4 border-b shrink-0 gap-3"
          style={{
            borderColor: "var(--border-subtle)",
            background: "var(--surface-1)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md hover-bg-subtle focus-ring shrink-0"
            style={{ color: "var(--foreground-muted)" }}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span
            className="font-semibold text-sm truncate"
            style={{ color: "var(--foreground)" }}
          >
            {workspace.name}
          </span>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

