"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Database,
  Menu,
  X,
  Settings,
  Home,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * Clean end-user shell for a tenant's runtime ERP at /apps/<slug>/...
 *
 * Deliberately different from the builder dashboard Sidebar:
 *   - no marketplace/plugin/schema chrome
 *   - nav is driven entirely by the tenant's installed tables + custom pages
 *   - "Back to builder" is the only cross-link, tucked in the corner
 */
export type AppShellWorkspace = {
  name: string;
  slug: string;
  tables: Array<{ id: string; name: string }>;
  pages: Array<{ id: string; title: string }>;
};

export function AppShell({
  workspace,
  children,
}: {
  workspace: AppShellWorkspace;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const base = `/apps/${workspace.slug}`;

  const navItems = [
    { href: base, label: "Home", icon: Home, exact: true },
    ...workspace.tables.map((t) => ({
      href: `${base}/${t.id}`,
      label: t.name,
      icon: Database,
      exact: false,
    })),
    ...workspace.pages.map((p) => ({
      href: `${base}/pages/${p.id}`,
      label: p.title,
      icon: LayoutDashboard,
      exact: false,
    })),
  ];

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "oklch(0 0 0 / 0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[240px] flex flex-col border-r transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--sidebar)",
          borderColor: "var(--sidebar-border)",
        }}
      >
        {/* Brand */}
        <div
          className="h-14 flex items-center px-4 border-b shrink-0"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "var(--primary)",
              boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.18)",
            }}
          >
            <Building2 className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="ml-2.5 min-w-0">
            <span
              className="font-semibold text-sm block truncate tracking-tight"
              style={{ color: "var(--sidebar-foreground)" }}
            >
              {workspace.name}
            </span>
            <span
              className="text-[10px] uppercase tracking-[0.12em] mono"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              {workspace.slug}.erpbuilder.app
            </span>
          </div>
          <button
            className="ml-auto lg:hidden p-1 rounded"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" style={{ color: "var(--foreground-muted)" }} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="relative flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors"
                style={{
                  background: active ? "var(--sidebar-accent)" : "transparent",
                  color: active ? "var(--primary)" : "var(--foreground-muted)",
                  fontWeight: active ? 500 : 400,
                }}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full"
                    style={{ background: "var(--primary)" }}
                  />
                )}
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          {workspace.tables.length === 0 && workspace.pages.length === 0 && (
            <div
              className="px-3 py-6 text-xs text-center"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              No tables or pages yet. Head to the builder to install modules.
            </div>
          )}
        </nav>

        {/* Bottom: theme + back to builder */}
        <div
          className="px-2 py-2 border-t space-y-0.5"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <div className="flex items-center justify-between px-1">
            <ThemeToggle />
          </div>
          <Link
            href="/workspace"
            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors"
            style={{ color: "var(--foreground-muted)" }}
          >
            <Settings className="h-4 w-4" />
            Back to builder
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile top bar (only visible < lg) */}
        <div
          className="lg:hidden h-14 flex items-center px-4 border-b shrink-0 gap-3"
          style={{
            borderColor: "var(--border-subtle)",
            background: "var(--surface-1)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" style={{ color: "var(--foreground)" }} />
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
