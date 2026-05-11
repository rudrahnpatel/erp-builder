"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Building2,
  LayoutDashboard,
  Blocks,
  Puzzle,
  LogOut,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  FileText,
  ExternalLink,
  Database,
  Code2,
  Package,
  Network,
  ShieldCheck,
  Settings2,
} from "lucide-react";
import { useWorkspace } from "@/hooks/use-workspace";
import { useLanguage } from "@/lib/i18n";


export function Sidebar({ 
  onClose,
  isCollapsed = false,
  onToggleCollapse
}: { 
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const { workspace, isLoading } = useWorkspace();
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isDevMode = session?.user?.role === "admin";

  const dashboardItems = [
    { href: "/workspace", label: t("common.dashboard"), icon: LayoutDashboard },
  ];

  // Core nav : categorized
  const navSections = [
    {
      label: null,
      items: dashboardItems,
    },
    {
      label: t("common.marketplace"),
      items: [
        { href: "/modules", label: t("common.browseModules") || "Browse Modules", icon: Blocks },
        { href: "/plugins", label: "Browse Plugins", icon: Puzzle },
      ],
    },
    {
      label: t("common.manageApp") || "Manage App",
      items: [
        { href: "/pages", label: t("common.managePages"), icon: FileText },
        { href: "/tables", label: t("common.manageTables"), icon: Database },
        { href: "/plugins/manage", label: "Manage Plugins", icon: Settings2, installedCount: workspace?.installedPlugins?.length ?? 0 },
      ],
    },
    // Conditionally add dev section
    ...(isDevMode
      ? [
          {
            label: "Admin & Dev Tools",
            isDev: true,
            items: [
              { href: "/admin", label: "Admin Panel", icon: ShieldCheck },
              { href: "/dev/modules", label: "My Modules", icon: Package },
            ],
          },
        ]
      : []),
  ];

  return (
    <div
      className={`h-full flex flex-col border-r transition-all duration-300 ${isCollapsed ? "w-[68px]" : "w-[248px]"}`}
      style={{
        background: "var(--sidebar)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      {/*  Logo / Workspace Identity  */}
      <div
        className="h-[60px] flex items-center px-3 border-b shrink-0 relative"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <div className={`flex items-center min-w-0 flex-1 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="relative shrink-0 flex items-center justify-center h-10 w-10">
            <Image src="/logo/logo.png" alt="Logo" width={40} height={40} className={`${isCollapsed ? "h-8 w-8" : "h-10 w-10"} object-contain transition-all duration-300`} priority />
          </div>
          {!isCollapsed && (
            <div className="ml-2.5 min-w-0 flex-1 animate-fade-in-up">
              {isLoading && !workspace ? (
                <>
                  <span
                    className="skeleton block h-3 w-24 mb-1.5"
                    aria-hidden="true"
                  />
                  <span
                    className="skeleton block h-2 w-32"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Loading workspace…</span>
                </>
              ) : (
                <>
                  <span
                    className="font-semibold text-[16px] block leading-tight truncate tracking-tight"
                    style={{ color: "var(--sidebar-foreground)" }}
                  >
                    {workspace?.name || "Workspace"}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Close toggle (Mobile) */}
        {onClose && (
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center hover-bg-subtle focus-ring ml-auto lg:hidden"
            style={{ color: "var(--foreground-dimmed)", background: "var(--surface-2)" }}
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Minimize button (Desktop only) */}
        {!isCollapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-7 w-7 rounded-lg items-center justify-center hover-bg-subtle focus-ring ml-1"
            style={{ color: "var(--foreground-dimmed)", background: "var(--surface-2)" }}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Expand button (Visible only when collapsed) */}
        {isCollapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-6 w-6 rounded-full items-center justify-center bg-[var(--primary)] text-white shadow-lg absolute -right-3 top-1/2 -translate-y-1/2 z-10 hover:scale-110 transition-transform"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/*  Navigation  */}
      <div className="flex-1 overflow-y-auto py-3">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-4" : ""}>
            {/* Section label */}
            {section.label && !isCollapsed && (
              <div className="px-4 flex items-center gap-2 mb-2">
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--foreground-dimmed)" }}
                >
                  {section.label}
                </p>
                {(section as any).isDev && (
                  <span
                    className="inline-flex items-center gap-0.5 text-[8px] uppercase tracking-wider font-bold px-1.5 py-[1px] rounded-full"
                    style={{
                      background: "linear-gradient(135deg, var(--accent-emerald), color-mix(in oklch, var(--accent-emerald), var(--primary) 40%))",
                      color: "#fff",
                      boxShadow: "0 1px 4px color-mix(in oklch, var(--accent-emerald), transparent 65%)",
                    }}
                  >
                    <Code2 className="h-2 w-2" />
                    DEV
                  </span>
                )}
              </div>
            )}
            
            {/* Collapsed Section Separator */}
            {section.label && isCollapsed && (
              <div className="mx-4 border-t mb-4" style={{ borderColor: "var(--sidebar-border)" }} />
            )}

            <nav className="space-y-1 px-2">
              {section.items.map((item) => {
                const isActive = item.href === "/plugins"
                  ? pathname === "/plugins"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={"queryHref" in item ? (item as any).queryHref : item.href}
                    onClick={() => onClose?.()}
                    title={isCollapsed ? item.label : undefined}
                    className={`relative flex items-center gap-2.5 px-3 py-2.5 text-[13px] rounded-lg group focus-ring ${
                      isActive
                        ? "sidebar-nav-item active"
                        : "sidebar-nav-item"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                    style={
                      isActive
                        ? undefined
                        : { color: "var(--foreground-muted)" }
                    }
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span
                        className="absolute -left-2 top-0 bottom-0 my-auto w-[3px] h-[18px] rounded-full animate-nav-indicator"
                        style={{ background: "var(--primary)" }}
                      />
                    )}
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {!isCollapsed && <span className="flex-1">{item.label}</span>}
                    {"installedCount" in item && (item as any).installedCount > 0 && !isCollapsed && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums"
                        style={{
                          background: isActive
                            ? "color-mix(in oklch, var(--primary), transparent 80%)"
                            : "var(--surface-3)",
                          color: isActive ? "var(--primary)" : "var(--foreground-dimmed)",
                        }}
                      >
                        {(item as any).installedCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/*  Open My ERP (runtime)  */}
      {workspace?.slug && (
        <div className="px-2.5 py-2">
            <Link
              href={`/apps/${workspace.slug}`}
              target="_blank"
              rel="noopener"
              onClick={() => onClose?.()}
              title={isCollapsed ? t("common.openMyErp") : undefined}
              className={`w-full flex items-center gap-2 text-[13px] font-semibold rounded-xl px-3 py-2.5 transition-all duration-200 pressable ${isCollapsed ? "justify-center px-0" : ""}`}
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                color: "var(--primary-foreground)",
                boxShadow:
                  "0 2px 8px color-mix(in oklch, var(--primary), transparent 60%), inset 0 1px 0 oklch(1 0 0 / 0.12)",
              }}
            >
              <Zap className="h-4 w-4" />
              {!isCollapsed && (
                <>
                  {t("common.openMyErp")}
                  <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
                </>
              )}
            </Link>
        </div>
      )}

      {/*  Bottom Section  */}
      <div
        className="px-2.5 py-2.5 border-t space-y-0.5"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <Link
          href="/docs"
          onClick={() => onClose?.()}
          title={isCollapsed ? t("common.helpDocs") : undefined}
          className={`flex w-full items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg hover-bg-subtle focus-ring ${isCollapsed ? "justify-center px-0" : ""}`}
          style={{ color: "var(--foreground-muted)" }}
        >
          <HelpCircle className="h-4 w-4" />
          {!isCollapsed && t("common.helpDocs")}
        </Link>
        <button
          onClick={() => {
            onClose?.();
            signOut({ callbackUrl: "/login" });
          }}
          title={isCollapsed ? t("common.logout") : undefined}
          className={`flex w-full items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-colors duration-150 focus-ring ${isCollapsed ? "justify-center px-0" : ""}`}
          style={{ color: "var(--danger)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--danger-subtle)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && t("common.logout")}
        </button>
      </div>
    </div>
  );
}

