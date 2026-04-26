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
    <div
      className="relative overflow-hidden rounded-xl p-5"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `var(${accentVar})` }}
      />
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-xs font-medium"
          style={{ color: "var(--foreground-muted)" }}
        >
          {label}
        </span>
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center"
          style={{
            background: `color-mix(in oklch, var(${accentVar}), transparent 85%)`,
            color: `var(${accentVar})`,
          }}
        >
          <Hash className="h-4 w-4" />
        </div>
      </div>
      <div
        className="text-3xl font-bold tabular-nums leading-none"
        style={{ color: "var(--foreground)" }}
      >
        {value}
      </div>
      {trend && (
        <div
          className="mt-2 flex items-center gap-1 text-xs font-medium"
          style={{ color: `var(${accentVar})` }}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {trend}
        </div>
      )}
    </div>
  );
}
