"use client";

import { Bell, Search, Menu, Command, LogOut, Settings, ChevronDown, Languages, Code2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/lib/i18n";
import { useDevMode } from "@/hooks/use-dev-mode";
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
  const [isMac, setIsMac] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { isDevMode } = useDevMode();

  useEffect(() => {
    const platform =
      (navigator as any).userAgentData?.platform || navigator.platform || "";
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(platform));
  }, []);

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
        {/* Hamburger menu */}
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-md hover-bg-subtle focus-ring"
          style={{ color: "var(--foreground-muted)" }}
        >
          <Menu className="h-5 w-5" />
        </button>


        {/* Dev mode indicator */}
        {isDevMode && (
          <span
            className="hidden sm:inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-full"
            style={{
              background: "linear-gradient(135deg, var(--accent-emerald), color-mix(in oklch, var(--accent-emerald), var(--primary) 40%))",
              color: "#fff",
              boxShadow: "0 1px 6px color-mix(in oklch, var(--accent-emerald), transparent 55%)",
            }}
          >
            <Code2 className="h-2.5 w-2.5" />
            DEV
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language toggle — flips between English and Hindi. Persisted in
            localStorage; reflected immediately across components via
            window event. */}
        <button
          type="button"
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium hover-bg-subtle focus-ring"
          style={{ color: "var(--foreground-muted)" }}
          title={t("common.language")}
          aria-label={`${t("common.language")}: ${lang === "en" ? t("common.english") : t("common.hindi")}`}
        >
          <Languages className="h-3.5 w-3.5" />
          <span className="mono">{lang === "en" ? "EN" : "हि"}</span>
        </button>

        {/* Theme toggle */}
        <div>
          <ThemeToggle />
        </div>

        {/* Notification bell */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Notifications"
            className="relative p-2 rounded-lg hover-bg-subtle focus-ring"
            style={{ color: "var(--foreground-muted)" }}
          >
            <Bell className="h-[18px] w-[18px]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-80 p-0 overflow-hidden"
          >
            <div
              className="flex items-center justify-between px-3 py-2.5"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {t("common.notifications")}
              </p>
              <span
                className="text-[10px] uppercase tracking-wider font-medium"
                style={{ color: "var(--foreground-dimmed)" }}
              >
                {t("common.allCaughtUp")}
              </span>
            </div>
            <div className="px-4 py-8 text-center">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--foreground-muted)",
                }}
              >
                <Bell className="h-4 w-4" />
              </div>
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "var(--foreground)" }}
              >
                {t("common.noNotifications")}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--foreground-dimmed)" }}
              >
                {t("common.notificationHint")}
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

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
                <span>{t("common.settings")}</span>
              </DropdownMenuItem>
              {isDevMode && (
                <DropdownMenuItem
                  onClick={() => router.push("/settings")}
                  className="gap-2.5 px-2.5 py-2 text-sm cursor-pointer"
                >
                  <Code2 className="h-4 w-4" style={{ color: "var(--accent-emerald)" }} />
                  <span>Developer Mode</span>
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--accent-emerald)", boxShadow: "0 0 6px var(--accent-emerald)" }}
                  />
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                variant="destructive"
                className="gap-2.5 px-2.5 py-2 text-sm cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{t("common.logout")}</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
