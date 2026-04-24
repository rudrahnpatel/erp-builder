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
  ChevronRight,
  Zap,
  FileText,
  ExternalLink,
  Database,
} from "lucide-react";
import { useWorkspace } from "@/hooks/use-workspace";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { workspace } = useWorkspace();

  const navSections = [
    {
      label: "Builder",
      items: [
        { href: "/workspace", label: "Dashboard", icon: LayoutDashboard },
        { href: "/modules", label: "Marketplace", icon: Blocks },
        { href: "/pages", label: "Manage Pages", icon: FileText },
        { href: "/tables", label: "Manage Tables", icon: Database },
      ],
    },
  ];

  return (
    <div
      className={`h-full flex flex-col border-r transition-all duration-300 ease-[var(--ease-out-expo)] ${
        collapsed ? "w-[68px]" : "w-[248px]"
      }`}
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
        {!collapsed && (
          <div className="ml-2.5 min-w-0 animate-fade-in-up">
            <span
              className="font-semibold text-[13px] block leading-tight truncate tracking-tight"
              style={{ color: "var(--sidebar-foreground)" }}
            >
              {workspace?.name || "The Ledger"}
            </span>
            <span
              className="text-[10px] tracking-[0.08em] mono block mt-0.5"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              {workspace?.slug
                ? `${workspace.slug}.erpbuilder.app`
                : "workspace"}
            </span>
          </div>
        )}
        {/* Collapse toggle — always visible in header */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`h-7 w-7 rounded-lg flex items-center justify-center hover-bg-subtle focus-ring ${
            collapsed ? "mx-auto" : "ml-auto"
          }`}
          style={{ color: "var(--foreground-dimmed)" }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* ── Navigation ── */}
      <div className="flex-1 overflow-y-auto py-3">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-4" : ""}>
            {/* Section label */}
            {section.label && !collapsed && (
              <p
                className="px-4 text-[10px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--foreground-dimmed)" }}
              >
                {section.label}
              </p>
            )}
            {section.label && collapsed && (
              <div
                className="mx-3 my-2 border-t"
                style={{ borderColor: "var(--sidebar-border)" }}
              />
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
                    title={collapsed ? item.label : undefined}
                    className={`relative flex items-center gap-2.5 px-3 py-2.5 text-[13px] rounded-lg group focus-ring ${
                      collapsed ? "justify-center" : ""
                    } ${
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
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full animate-nav-indicator"
                        style={{ background: "var(--primary)" }}
                      />
                    )}
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
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
            title={collapsed ? "Open my ERP" : undefined}
            className={`w-full flex items-center gap-2 text-[13px] font-semibold rounded-xl px-3 py-2.5 transition-all duration-200 pressable ${
              collapsed ? "justify-center px-0" : ""
            }`}
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--primary-hover))",
              color: "var(--primary-foreground)",
              boxShadow:
                "0 2px 8px color-mix(in oklch, var(--primary), transparent 60%), inset 0 1px 0 oklch(1 0 0 / 0.12)",
            }}
          >
            <Zap className="h-4 w-4" />
            {!collapsed && (
              <>
                Open my ERP
                <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
              </>
            )}
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
          }}
          className={`flex w-full items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg hover-bg-subtle focus-ring ${
            collapsed ? "justify-center" : ""
          }`}
          style={{ color: "var(--foreground-muted)" }}
        >
          <HelpCircle className="h-4 w-4" />
          {!collapsed && "Help & docs"}
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={`flex w-full items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-colors duration-150 focus-ring ${
            collapsed ? "justify-center" : ""
          }`}
          style={{ color: "var(--danger)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--danger-subtle)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}
