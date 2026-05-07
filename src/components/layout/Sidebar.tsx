"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  Building2,
  LayoutDashboard,
  Blocks,
  Puzzle,
  LogOut,
  HelpCircle,
  ChevronLeft,
  Zap,
  FileText,
  ExternalLink,
  Database,
  Code2,
  Package,
  Network,
} from "lucide-react";
import { useWorkspace } from "@/hooks/use-workspace";
import { useLanguage } from "@/lib/i18n";
import { useDevMode } from "@/hooks/use-dev-mode";

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { workspace, isLoading } = useWorkspace();
  const { t } = useLanguage();
  const { isDevMode } = useDevMode();

  // Core nav — always visible
  const coreItems = [
    { href: "/workspace", label: t("common.dashboard"), icon: LayoutDashboard },
    { href: "/pages", label: "Manage Pages", icon: FileText },
    { href: "/tables", label: "Manage Tables", icon: Database },
    { href: "/schema", label: "Schema Designer", icon: Network },
    { href: "/modules", label: t("common.marketplace"), icon: Blocks },
    { href: "/plugins", label: t("common.plugins"), icon: Puzzle },
  ];

  if (workspace?.installedPacks?.includes("quotation")) {
    coreItems.push(
      { href: "/quotation", label: "Quotations", icon: FileText },
      { href: "/estimated", label: "Estimates", icon: FileText }
    );
  }

  // Dev-only items — shown only in developer mode
  const devItems = [
    { href: "/dev/modules", label: "My Modules", icon: Package },
  ];

  const navSections = [
    {
      label: t("common.builder"),
      items: coreItems,
    },
    // Conditionally add dev section
    ...(isDevMode
      ? [
          {
            label: "Developer Tools",
            isDev: true,
            items: devItems,
          },
        ]
      : []),
  ];

  return (
    <div
      className="h-full flex flex-col border-r w-[248px]"
      style={{
        background: "var(--sidebar)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      {/* ── Logo / Workspace Identity ── */}
      <div
        className="h-[60px] flex items-center px-3 border-b shrink-0"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <div
          className="relative h-9 w-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--primary-hover))",
            boxShadow:
              "inset 0 1px 0 oklch(1 0 0 / 0.18), 0 2px 8px oklch(0.08 0.02 260 / 0.5)",
          }}
        >
          <Building2 className="h-4.5 w-4.5 text-white" />
          {/* Status dot */}
          <span
            className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full border-2"
            style={{
              background: "var(--success)",
              borderColor: "var(--sidebar)",
              boxShadow: "0 0 6px var(--success)",
            }}
            aria-hidden="true"
          />
        </div>
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
                className="font-semibold text-[13px] block leading-tight truncate tracking-tight"
                style={{ color: "var(--sidebar-foreground)" }}
              >
                {workspace?.name || "Workspace"}
              </span>
              <span
                className="text-[10px] tracking-[0.08em] mono block mt-0.5"
                style={{ color: "var(--foreground-dimmed)" }}
              >
                {workspace?.slug
                  ? `${workspace.slug}.erpbuilder.app`
                  : ""}
              </span>
            </>
          )}
        </div>
        
        {/* Close toggle */}
        {onClose && (
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center hover-bg-subtle focus-ring ml-auto"
            style={{ color: "var(--foreground-dimmed)", background: "var(--surface-2)" }}
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="flex-1 overflow-y-auto py-3">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-4" : ""}>
            {/* Section label */}
            {section.label && (
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

            <nav className="space-y-1 px-2">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onClose?.()}
                    className={`relative flex items-center gap-2.5 px-3 py-2.5 text-[13px] rounded-lg group focus-ring ${
                      isActive
                        ? "sidebar-nav-item active"
                        : "sidebar-nav-item"
                    }`}
                    style={
                      isActive
                        ? undefined
                        : { color: "var(--foreground-muted)" }
                    }
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span
                        className="absolute -left-2 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full animate-nav-indicator"
                        style={{ background: "var(--primary)" }}
                      />
                    )}
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* ── Open My ERP (runtime) ── */}
      {workspace?.slug && (
        <div className="px-2.5 py-2">
            <Link
              href={`/apps/${workspace.slug}`}
              target="_blank"
              rel="noopener"
              onClick={() => onClose?.()}
              className="w-full flex items-center gap-2 text-[13px] font-semibold rounded-xl px-3 py-2.5 transition-all duration-200 pressable"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                color: "var(--primary-foreground)",
                boxShadow:
                  "0 2px 8px color-mix(in oklch, var(--primary), transparent 60%), inset 0 1px 0 oklch(1 0 0 / 0.12)",
              }}
            >
              <Zap className="h-4 w-4" />
              {t("common.openMyErp")}
              <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
            </Link>
        </div>
      )}

      {/* ── Bottom Section ── */}
      <div
        className="px-2.5 py-2.5 border-t space-y-0.5"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <button
          type="button"
          onClick={() => {
            window.open(
              "https://github.com/the-ledger/docs",
              "_blank",
              "noopener,noreferrer"
            );
            onClose?.();
          }}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg hover-bg-subtle focus-ring"
          style={{ color: "var(--foreground-muted)" }}
        >
          <HelpCircle className="h-4 w-4" />
          {t("common.helpDocs")}
        </button>
        <button
          onClick={() => {
            onClose?.();
            signOut({ callbackUrl: "/login" });
          }}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-colors duration-150 focus-ring"
          style={{ color: "var(--danger)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--danger-subtle)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut className="h-4 w-4" />
          {t("common.logout")}
        </button>
      </div>
    </div>
  );
}
