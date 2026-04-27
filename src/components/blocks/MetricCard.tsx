"use client";

import useSWR from "swr";
import { TrendingUp, TrendingDown, Minus, Hash } from "lucide-react";
import type { BlockConfig } from "@/types/block";

const ACCENT_VAR: Record<NonNullable<BlockConfig["metricAccent"]>, string> = {
  blue: "--accent-blue",
  emerald: "--accent-emerald",
  amber: "--accent-amber",
  violet: "--accent-violet",
  rose: "--accent-rose",
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function MetricCard({
  config,
  tableId,
}: {
  config: BlockConfig;
  tableId?: string;
}) {
  const accentVar = ACCENT_VAR[config.metricAccent || "blue"];
  const label = config.metricLabel || "Metric";
  const trend = config.metricTrend;

  // If tableId is bound, render the live record count; otherwise fall back to
  // whatever static value the builder set in config.
  const { data: recordsData } = useSWR(
    tableId ? `/api/tables/${tableId}/records` : null,
    fetcher
  );
  const liveCount = recordsData?.records?.length;
  const value =
    typeof liveCount === "number"
      ? liveCount.toLocaleString("en-IN")
      : config.metricValue || "—";

  const TrendIcon =
    trend && /\+|up|▲/i.test(trend)
      ? TrendingUp
      : trend && /-|down|▼/i.test(trend)
      ? TrendingDown
      : Minus;

  return (
    <div className="relative h-full flex flex-col justify-center">
      <div
        className="absolute -top-5 -left-5 -right-5 h-[3px]"
        style={{ background: `var(${accentVar})` }}
      />
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--foreground-muted)" }}
        >
          {label}
        </span>
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{
            background: `color-mix(in oklch, var(${accentVar}), transparent 88%)`,
            color: `var(${accentVar})`,
            boxShadow: `0 0 12px color-mix(in oklch, var(${accentVar}), transparent 90%)`,
          }}
        >
          <Hash className="h-4 w-4" />
        </div>
      </div>
      <div
        className="text-4xl font-bold tabular-nums leading-tight tracking-tight"
        style={{ color: "var(--foreground)" }}
      >
        {value}
      </div>
      {trend && (
        <div
          className="mt-3 flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: `var(${accentVar})` }}
        >
          <div className="p-0.5 rounded-md" style={{ background: `color-mix(in oklch, var(${accentVar}), transparent 90%)` }}>
            <TrendIcon className="h-3.5 w-3.5" />
          </div>
          {trend}
        </div>
      )}
    </div>
  );
}
