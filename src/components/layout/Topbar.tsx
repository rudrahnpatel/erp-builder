"use client";

import { Bell, Search, UserCircle, Menu, Command, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { data: session } = useSession();

  return (
    <div
      className="h-14 border-b flex items-center justify-between px-4 sm:px-6 shrink-0 glass"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-md transition-colors"
          style={{ color: "var(--foreground-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Command palette trigger */}
        <button
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 max-w-xs w-full"
          style={{
            background: "var(--surface-2)",
            color: "var(--foreground-dimmed)",
            border: "1px solid var(--border-subtle)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.background = "var(--surface-3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
            e.currentTarget.style.background = "var(--surface-2)";
          }}
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left truncate">Search modules, tables, pages...</span>
          <kbd
            className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{
              background: "var(--surface-1)",
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
          className="relative p-2 rounded-lg transition-all duration-200"
          style={{ color: "var(--foreground-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-3)";
            e.currentTarget.style.color = "var(--foreground)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--foreground-muted)";
          }}
        >
          <Bell className="h-4.5 w-4.5" />
          <span
            className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
            style={{
              background: "var(--danger)",
              boxShadow: "0 0 6px var(--danger)",
            }}
          />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Account menu"
              className="h-8 w-8 rounded-[0.625rem] flex items-center justify-center transition-all duration-200 overflow-hidden pressable"
              style={{
                background: "var(--primary)",
                boxShadow:
                  "inset 0 1px 0 oklch(1 0 0 / 0.18), 0 1px 2px oklch(0.08 0.02 260 / 0.4)",
              }}
            >
              <span className="text-xs font-semibold text-white tracking-tight uppercase">
                {session?.user?.name?.[0] || "U"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.user?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email || ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
