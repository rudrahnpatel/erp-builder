"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { BlockConfig } from "@/types/block";

function escapeCsv(cell: unknown): string {
  if (cell === null || cell === undefined) return "";
  const s = typeof cell === "string" ? cell : JSON.stringify(cell);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function triggerDownload(filename: string, body: string) {
  const blob = new Blob(["﻿" + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ExportButton({
  config,
  tableId,
}: {
  config: BlockConfig;
  tableId?: string;
}) {
  const [busy, setBusy] = useState(false);
  const label = config.exportLabel || "Export CSV";
  const tableRef = config.tableRef || "records";
  const visibleFields = config.visibleFields || [];

  const handleExport = async () => {
    if (!tableId) {
      toast.error("Connect a table first", {
        description: "Pick a data source in this block's configuration.",
      });
      return;
    }
    setBusy(true);
    try {
      const [fieldsRes, recordsRes] = await Promise.all([
        fetch(`/api/tables/${tableId}/fields`),
        fetch(`/api/tables/${tableId}/records`),
      ]);
      if (!fieldsRes.ok || !recordsRes.ok) throw new Error("fetch failed");
      const fields = await fieldsRes.json();
      const recordsData = await recordsRes.json();
      const records: { data: Record<string, unknown> }[] = recordsData?.records || [];

      const exportedFields: { id: string; name: string }[] = (
        visibleFields.length
          ? visibleFields
              .map((name: string) =>
                fields.find(
                  (f: any) => f.name === name || f.packFieldKey === name
                )
              )
              .filter(Boolean)
          : fields
      ).map((f: any) => ({ id: f.id, name: f.name }));

      const header = exportedFields.map((f) => escapeCsv(f.name)).join(",");
      const rows = records.map((r) =>
        exportedFields.map((f) => escapeCsv(r.data?.[f.id])).join(",")
      );
      const csv = [header, ...rows].join("\r\n");

      const fname = `${tableRef.toString().toLowerCase().replace(/\s+/g, "_")}-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      triggerDownload(fname, csv);
      toast.success(`Exported ${records.length} record${records.length === 1 ? "" : "s"}`, {
        description: fname,
      });
    } catch (err) {
      toast.error("Export failed", {
        description: err instanceof Error ? err.message : "Try again in a moment.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          Download {tableRef}
        </p>
        <p
          className="text-xs mt-0.5 truncate"
          style={{ color: "var(--foreground-dimmed)" }}
        >
          CSV export — opens in Excel, Google Sheets, or any spreadsheet tool.
        </p>
      </div>
      <Button onClick={handleExport} disabled={busy} className="gap-2 shrink-0">
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {busy ? "Exporting…" : label}
      </Button>
    </div>
  );
}
