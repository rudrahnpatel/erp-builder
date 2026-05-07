"use client";

import { use } from "react";
import useSWR from "swr";
import { DevModeGate } from "@/components/layout/DevModeGate";
import { Loader2, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ModuleDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = use(params);
  const pathname = usePathname();
  const { data, isLoading } = useSWR(`/api/dev/modules/${moduleId}`, fetcher);
  const mod = data?.module;

  const tabs = [
    { href: `/dev/modules/${moduleId}/pages`, label: "Pages" },
    { href: `/dev/modules/${moduleId}/tables`, label: "Tables" },
  ];

  return (
    <DevModeGate>
      <div className="space-y-6 max-w-6xl mx-auto animate-fade-in-up">
        {/* Module Breadcrumb Header */}
        <header>
          <p
            className="text-[11px] font-medium uppercase tracking-[0.14em] mb-2 mono"
            style={{ color: "var(--foreground-dimmed)" }}
          >
            <Link
              href="/dev/modules"
              className="hover:underline"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              / developer · modules
            </Link>
            {" · "}
            {isLoading ? "…" : mod?.name || "Module"}
          </p>

          <div className="flex items-center gap-3 mb-1">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: mod?.published
                  ? "linear-gradient(135deg, var(--accent-emerald), var(--primary))"
                  : "var(--surface-2)",
                color: mod?.published ? "#fff" : "var(--foreground-muted)",
                boxShadow: mod?.published
                  ? "0 2px 8px color-mix(in oklch, var(--accent-emerald), transparent 60%)"
                  : "none",
              }}
            >
              <Package className="h-5 w-5" />
            </div>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2
                  className="h-5 w-5 animate-spin"
                  style={{ color: "var(--primary)" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Loading module…
                </span>
              </div>
            ) : (
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {mod?.name}
                </h1>
                {mod?.description && (
                  <p
                    className="text-sm mt-0.5 leading-relaxed"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {mod.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tab Bar */}
          <div
            className="flex gap-1 mt-4 border-b"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {tabs.map((tab) => {
              const isActive =
                pathname === tab.href || pathname.startsWith(tab.href + "/");
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="px-4 py-2.5 text-[13px] font-semibold transition-colors relative"
                  style={{
                    color: isActive
                      ? "var(--primary)"
                      : "var(--foreground-muted)",
                  }}
                >
                  {tab.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                      style={{ background: "var(--primary)" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </header>

        {/* Tab Content */}
        {children}
      </div>
    </DevModeGate>
  );
}
