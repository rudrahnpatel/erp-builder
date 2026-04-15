"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
        // { href: "/plugins", label: "Plugins", icon: Puzzle },
        { href: "/pages", label: "Manage Pages", icon: FileText },
      ],
    },
  ];

  return (
    <div
      className={`h-full flex flex-col border-r transition-all duration-300 ease-[var(--ease-out-expo)] ${
        collapsed ? "w-[64px]" : "w-[240px]"
      }`}
      style={{
        background: "var(--sidebar)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      {/* ── Logo / Workspace Identity ── */}
      <div
        className="h-14 flex items-center px-3 border-b shrink-0"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <div
          className="relative h-9 w-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
          style={{
            background: "var(--primary)",
            boxShadow:
              "inset 0 1px 0 oklch(1 0 0 / 0.18), 0 1px 2px oklch(0.08 0.02 260 / 0.4)",
          }}
        >
          <Building2 className="h-4.5 w-4.5 text-white" />
          {/* Status dot — calmer, no ping-pong */}
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
              className="font-semibold text-sm block leading-tight truncate px-1 tracking-tight"
              style={{ color: "var(--sidebar-foreground)" }}
            >
              {workspace?.name || "The Ledger"}
            </span>
            <span
              className="text-[10px] uppercase tracking-[0.12em] px-1 mono"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              {workspace ? "workspace" : "the ledger"}
            </span>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="flex-1 overflow-y-auto py-2">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-3" : ""}>
            {/* Section label */}
            {section.label && !collapsed && (
              <p
                className="px-4 text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: "var(--foreground-dimmed)" }}
              >
                {section.label}
              </p>
            )}
            {section.label && collapsed && (
              <div className="mx-3 my-2 border-t" style={{ borderColor: "var(--sidebar-border)" }} />
            )}

            <nav className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`relative flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all duration-200 group ${
                      collapsed ? "justify-center" : ""
                    } ${
                      isActive
                        ? "font-medium"
                        : ""
                    }`}
                    style={{
                      background: isActive
                        ? "var(--sidebar-accent)"
                        : "transparent",
                      color: isActive
                        ? "var(--primary)"
                        : "var(--foreground-muted)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "var(--sidebar-accent)";
                        e.currentTarget.style.color = "var(--sidebar-foreground)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--foreground-muted)";
                      }
                    }}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full animate-nav-indicator"
                        style={{ background: "var(--primary)" }}
                      />
                    )}
                    <item.icon className="h-4 w-4 shrink-0" />
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
        <div className="px-2 py-2">
          <Link
            href={`/apps/${workspace.slug}`}
            target="_blank"
            rel="noopener"
            title={collapsed ? "Open my ERP" : undefined}
            className={`w-full flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2 transition-all ${
              collapsed ? "justify-center px-0" : ""
            }`}
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              boxShadow: "0 1px 2px oklch(0 0 0 / 0.1)",
            }}
          >
            <Zap className="h-4 w-4" />
            {!collapsed && "Open my ERP"}
          </Link>
        </div>
      )}

      {/* ── Bottom Section ── */}
      <div
        className="px-2 py-2 border-t space-y-0.5"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        {/* Collapse toggle */}
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-end"} px-1`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-[var(--sidebar-accent)]"
            style={{ color: "var(--foreground-dimmed)" }}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            // Help drawer hook-up lives in a later phase
            window.open(
              "https://github.com/the-ledger/docs",
              "_blank",
              "noopener,noreferrer"
            );
          }}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all duration-200"
          style={{ color: "var(--foreground-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--sidebar-accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <HelpCircle className="h-4 w-4" />
          {!collapsed && "Help & docs"}
        </button>
        <button
          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all duration-200"
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
