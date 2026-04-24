"use client";

import { Bell, Search, Menu, Command, LogOut, Settings, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export function Topbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { data: session } = useSession();
  const router = useRouter();

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

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Account menu"
            className="group flex items-center gap-1.5 h-8 pl-0.5 pr-1.5 rounded-[0.625rem] transition-all duration-200 hover-bg-subtle focus-ring"
          >
            <span
              className="h-7 w-7 rounded-[0.5rem] flex items-center justify-center overflow-hidden"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                boxShadow:
                  "inset 0 1px 0 oklch(1 0 0 / 0.18), 0 1px 2px oklch(0.08 0.02 260 / 0.4)",
              }}
            >
              <span className="text-xs font-semibold text-white tracking-tight uppercase">
                {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
              </span>
            </span>
            <ChevronDown
              className="h-3 w-3 transition-transform duration-200 group-data-[popup-open]:rotate-180"
              style={{ color: "var(--foreground-dimmed)" }}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-64 p-0 overflow-hidden"
          >
            {/* Identity header */}
            <div
              className="flex items-center gap-3 px-3 py-3"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in oklch, var(--primary), transparent 92%), transparent)",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <span
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                  boxShadow:
                    "inset 0 1px 0 oklch(1 0 0 / 0.18), 0 2px 8px color-mix(in oklch, var(--primary), transparent 60%)",
                }}
              >
                <span className="text-sm font-semibold text-white tracking-tight uppercase">
                  {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
                </span>
              </span>
              <div className="flex flex-col min-w-0 flex-1">
                <p
                  className="text-sm font-semibold leading-tight truncate"
                  style={{ color: "var(--foreground)" }}
                >
                  {session?.user?.name || "User"}
                </p>
                <p
                  className="text-xs leading-tight truncate mt-0.5"
                  style={{ color: "var(--foreground-dimmed)" }}
                >
                  {session?.user?.email || ""}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="p-1">
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="gap-2.5 px-2.5 py-2 text-sm cursor-pointer"
              >
                <Settings className="h-4 w-4" style={{ color: "var(--foreground-muted)" }} />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                variant="destructive"
                className="gap-2.5 px-2.5 py-2 text-sm cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
