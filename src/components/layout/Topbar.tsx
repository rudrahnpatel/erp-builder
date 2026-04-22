"use client";

import { Bell, Search, Menu, Command } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Topbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  return (
    <div
      className="h-[56px] border-b flex items-center justify-between px-4 sm:px-6 shrink-0"
      style={{
        background: "color-mix(in oklch, var(--surface-1), transparent 40%)",
        backdropFilter: "blur(16px) saturate(1.2)",
        WebkitBackdropFilter: "blur(16px) saturate(1.2)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-md hover-bg-subtle focus-ring"
          style={{ color: "var(--foreground-muted)" }}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Command palette trigger */}
        <button
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all duration-200 max-w-xs w-full hover-bg-subtle focus-ring"
          style={{
            background: "var(--surface-sunken)",
            color: "var(--foreground-dimmed)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left truncate text-[13px]">
            Search modules, tables, pages...
          </span>
          <kbd
            className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium"
            style={{
              background: "var(--surface-2)",
              color: "var(--foreground-dimmed)",
              border: "1px solid var(--border)",
            }}
          >
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme toggle */}
        <div>
          <ThemeToggle />
        </div>

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg hover-bg-subtle focus-ring"
          style={{ color: "var(--foreground-muted)" }}
        >
          <Bell className="h-[18px] w-[18px]" />
          {/* Badge counter */}
          <span
            className="absolute -top-0.5 -right-0.5 h-4 min-w-4 flex items-center justify-center rounded-full text-[9px] font-bold px-1"
            style={{
              background: "var(--danger)",
              color: "white",
              boxShadow: "0 0 8px color-mix(in oklch, var(--danger), transparent 50%)",
            }}
          >
            3
          </span>
        </button>

        {/* User avatar */}
        <button
          aria-label="Account menu"
          className="h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-200 overflow-hidden pressable focus-ring"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--primary-hover))",
            boxShadow:
              "inset 0 1px 0 oklch(1 0 0 / 0.18), 0 2px 6px oklch(0.08 0.02 260 / 0.4)",
            border: "2px solid color-mix(in oklch, var(--primary), transparent 50%)",
          }}
        >
          <span className="text-xs font-bold text-white tracking-tight">R</span>
        </button>
      </div>
    </div>
  );
}
