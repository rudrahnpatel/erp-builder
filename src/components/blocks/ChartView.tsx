"use client";

import useSWR from "swr";
import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFilter, matchesQuery } from "./FilterContext";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export type ChartKind = "bar" | "pie" | "line";
export type ChartAgg = "count" | "sum" | "avg";

export interface ChartConfig {
  tableRef?: string;
  groupByField?: string;
  valueField?: string;
  aggregation?: ChartAgg;
  chartType?: ChartKind;
  title?: string;
}

const PIE_COLORS = [
  "var(--primary)",
  "var(--accent-amber)",
  "var(--accent-emerald, #10b981)",
  "var(--accent-rose, #f43f5e)",
  "var(--accent-violet, #8b5cf6)",
  "var(--accent-cyan, #06b6d4)",
];

function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="p-10 border-2 border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center bg-secondary/20 text-muted-foreground">
      <BarChart3 className="h-8 w-8 mb-3 opacity-40" />
      <p className="text-sm font-medium">{message}</p>
      {hint && <p className="text-xs mt-1 opacity-70">{hint}</p>}
    </div>
  );
}

export function ChartView({
  config,
  tableId,
}: {
  config: ChartConfig;
  tableId?: string;
}) {
  const { query } = useFilter();
  const { data: fields } = useSWR<any[]>(
    tableId ? `/api/tables/${tableId}/fields` : null,
    fetcher
  );
  const { data: recordsData } = useSWR<{ records: any[] }>(
    tableId ? `/api/tables/${tableId}/records` : null,
    fetcher
  );

  if (!tableId) {
    return (
      <EmptyState
        message="No table connected."
        hint="Pick a table in Configuration → Target Database Table."
      />
    );
  }

  if (!fields) {
    return <EmptyState message="Loading chart data…" />;
  }

  const groupField = fields.find((f) => f.name === config.groupByField);
  if (!groupField) {
    return (
      <EmptyState
        message="Pick a field to group by."
        hint="Configuration → Group By Field."
      />
    );
  }

  const aggregation: ChartAgg = config.aggregation || "count";
  const chartType: ChartKind = config.chartType || "bar";
  const valueField =
    aggregation === "count"
      ? undefined
      : fields.find((f) => f.name === config.valueField);

  if (aggregation !== "count" && !valueField) {
    return (
      <EmptyState
        message="Pick a numeric field to aggregate."
        hint="Configuration → Value Field."
      />
    );
  }

  const allRecords = recordsData?.records || [];
  const records = query
    ? allRecords.filter((r) => matchesQuery(r, query))
    : allRecords;

  // Aggregate by group key
  const buckets = new Map<string, { sum: number; count: number }>();
  for (const r of records) {
    const raw = r.data?.[groupField.id];
    const key = raw == null || raw === "" ? "—" : String(raw);
    let b = buckets.get(key);
    if (!b) {
      b = { sum: 0, count: 0 };
      buckets.set(key, b);
    }
    b.count += 1;
    if (valueField) {
      const v = Number(r.data?.[valueField.id]);
      if (!Number.isNaN(v)) b.sum += v;
    }
  }

  const data = Array.from(buckets.entries()).map(([name, b]) => {
    const value =
      aggregation === "count"
        ? b.count
        : aggregation === "avg" && b.count > 0
          ? b.sum / b.count
          : b.sum;
    return { name, value: Math.round(value * 100) / 100 };
  });

  if (data.length === 0) {
    return (
      <EmptyState
        message="No data yet."
        hint="Add records to the connected table to populate the chart."
      />
    );
  }

  const title =
    config.title ||
    `${aggregation === "count" ? "Count" : `${aggregation} of ${valueField?.name}`} by ${groupField.name}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div
          className="p-1.5 rounded-md"
          style={{
            background: "color-mix(in oklch, var(--primary), transparent 85%)",
            color: "var(--primary)",
          }}
        >
          <BarChart3 className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {records.length} record{records.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "pie" ? (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          ) : chartType === "line" ? (
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
