"use client";

import { PackDefinition } from "@/types/pack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Users,
  Briefcase,
  IndianRupee,
  Download,
  Check,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

const iconMap: Record<string, React.ReactNode> = {
  package: <Package className="h-6 w-6" />,
  users: <Users className="h-6 w-6" />,
  briefcase: <Briefcase className="h-6 w-6" />,
  "indian-rupee": <IndianRupee className="h-6 w-6" />,
};

const colorMap: Record<string, { bg: string; text: string; glow: string }> = {
  package: {
    bg: "oklch(0.65 0.20 250 / 0.12)",
    text: "var(--accent-blue)",
    glow: "oklch(0.65 0.20 250 / 0.20)",
  },
  users: {
    bg: "oklch(0.68 0.17 155 / 0.12)",
    text: "var(--accent-emerald)",
    glow: "oklch(0.68 0.17 155 / 0.20)",
  },
  briefcase: {
    bg: "oklch(0.78 0.16 75 / 0.12)",
    text: "var(--accent-amber)",
    glow: "oklch(0.78 0.16 75 / 0.20)",
  },
  "indian-rupee": {
    bg: "oklch(0.60 0.20 290 / 0.12)",
    text: "var(--accent-violet)",
    glow: "oklch(0.60 0.20 290 / 0.20)",
  },
};

export function PackCard({
  pack,
  installed = false,
  onInstall,
}: {
  pack: PackDefinition;
  installed?: boolean;
  onInstall?: (packId: string) => Promise<void> | void;
}) {
  const [loading, setLoading] = useState(false);
  const colors = colorMap[pack.icon] || colorMap.package;

  const handleInstall = async () => {
    if (installed || loading) return;
    setLoading(true);
    try {
      await onInstall?.(pack.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="group relative rounded-xl p-6 flex flex-col transition-all duration-300 card-interactive"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* Icon + Badge */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{
            background: colors.bg,
            color: colors.text,
          }}
        >
          {iconMap[pack.icon] || <Package className="h-6 w-6" />}
        </div>
        <Badge
          className="text-[10px] font-semibold px-2.5 py-0.5 border-0"
          style={{
            background:
              pack.badge === "Pro"
                ? "var(--primary-subtle)"
                : "var(--success-subtle)",
            color:
              pack.badge === "Pro"
                ? "var(--primary)"
                : "var(--success)",
          }}
        >
          {pack.badge}
        </Badge>
      </div>

      {/* Title + Description */}
      <h3
        className="text-base font-semibold mb-1.5"
        style={{ color: "var(--foreground)" }}
      >
        {pack.name}
      </h3>
      <p
        className="text-sm leading-relaxed mb-5 flex-1"
        style={{ color: "var(--foreground-muted)" }}
      >
        {pack.description}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-5">
        {[
          { value: pack.fields, label: "fields" },
          { value: pack.pages, label: "pages" },
        ].map((s) => (
          <div
            key={s.label}
            className="text-[10px]"
            style={{ color: "var(--foreground-dimmed)" }}
          >
            <span
              className="block text-sm font-semibold tabular-nums"
              style={{ color: "var(--foreground)" }}
            >
              {s.value}
            </span>
            <span className="uppercase tracking-[0.14em] mono">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Install Button */}
      <Button
        onClick={handleInstall}
        disabled={installed || loading}
        className="w-full gap-2 font-medium transition-all duration-300"
        style={{
          background: installed
            ? "var(--success)"
            : "var(--primary)",
          color: "var(--primary-foreground)",
          boxShadow: installed ? "none" : undefined,
        }}
      >
        {installed ? (
          <>
            <Check className="h-4 w-4" /> Installed
          </>
        ) : loading ? (
          <>
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Installing...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" /> Install
          </>
        )}
      </Button>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${colors.glow}, transparent 70%)`,
        }}
      />
    </div>
  );
}
