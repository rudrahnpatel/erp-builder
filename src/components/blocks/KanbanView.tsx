"use client";

import { useState } from "react";
import useSWR from "swr";
import { Kanban, Plus } from "lucide-react";
import { RecordFormModal } from "./RecordFormModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Column accent colours for visual differentiation
const COL_ACCENTS: Record<string, string> = {
  "Draft": "var(--foreground-dimmed)",
  "Sent": "var(--accent-blue)",
  "Received": "var(--success)",
  "Cancelled": "var(--danger)",
  "To Do": "var(--foreground-dimmed)",
  "In Progress": "var(--accent-blue)",
  "Review": "var(--accent-amber)",
  "Done": "var(--success)",
};

export function KanbanView({ config, tableId }: { config: any; tableId?: string }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | undefined>();

  const { data: fields } = useSWR(tableId ? `/api/tables/${tableId}/fields` : null, fetcher);
  const { data: recordsData, mutate: refreshRecords } = useSWR(tableId ? `/api/tables/${tableId}/records` : null, fetcher);

  if (!tableId) {
    return (
      <div
        className="p-10 border-2 border-dashed rounded-xl flex flex-col items-center justify-center"
        style={{
          borderColor: "var(--border)",
          color: "var(--foreground-muted)",
          background: "var(--surface-sunken)",
        }}
      >
        <Kanban className="h-8 w-8 mb-3 opacity-40" />
        <p className="text-sm font-medium">No table configured or table not found.</p>
      </div>
    );
  }

  const records = recordsData?.records || [];
  const groupByField = config.groupByField;

  // Find the options for the group by field to create the columns
  const fieldConfig = fields?.find((f: any) => f.name === groupByField || f.packFieldKey === groupByField);
  const columns: string[] = fieldConfig?.config?.options || ["Draft", "Sent", "Received", "Cancelled"];

  // Group records
  const grouped: Record<string, any[]> = {};
  columns.forEach((col) => { grouped[col] = []; });

  records.forEach((r: any) => {
    const val = (fieldConfig && r.data[fieldConfig.id]) ?? r.data[groupByField];
    const groupName = val || columns[0];
    if (!grouped[groupName]) {
      grouped[groupName] = [];
    }
    grouped[groupName].push(r);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{
              background: "color-mix(in oklch, var(--accent-violet), transparent 85%)",
              color: "var(--accent-violet)",
            }}
          >
            <Kanban className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
            {config.tableRef || "Kanban Board"}
          </span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-md"
            style={{
              background: "var(--surface-3)",
              color: "var(--foreground-dimmed)",
            }}
          >
            {records.length} {records.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x relative min-h-[400px]">
        {Object.entries(grouped).map(([col, items]) => {
          const accent = COL_ACCENTS[col] || "var(--foreground-dimmed)";
          return (
            <div
              key={col}
              className="flex-1 rounded-xl p-3.5 min-w-[280px] snap-start flex flex-col max-h-[70vh] overflow-hidden"
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ background: accent }}
                  />
                  <h4
                    className="text-[12px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {col}
                  </h4>
                </div>
                <span
                  className="text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-md"
                  style={{
                    background: "var(--surface-3)",
                    color: "var(--foreground-dimmed)",
                  }}
                >
                  {items.length}
                </span>
              </div>
              
              <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 pb-2">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="rounded-xl p-4 text-sm shadow-sm transition-all cursor-pointer group card-interactive"
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--foreground)",
                    }}
                    onClick={() => {
                      setSelectedRecordId(item.id);
                      setIsFormOpen(true);
                    }}
                  >
                    <div className="font-semibold text-[14px] leading-snug">
                       {(() => {
                         const titleField = fields?.find((f: any) =>
                           ["PO Number", "Name", "Reference", "Deal Name"].includes(f.name)
                         ) ?? fields?.find((f: any) => f.type === "TEXT");
                         const titleVal = titleField ? item.data[titleField.id] ?? item.data[titleField.name] : null;
                         return titleVal || item.id.substring(0, 8);
                       })()}
                    </div>
                    <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                       {fields?.filter((f: any) => f.name !== groupByField && f.name !== "PO Number" && f.name !== "Notes" && f.name !== "Status")
                               .slice(0, 2)
                               .map((f: any) => {
                         const val = item.data[f.id] ?? item.data[f.name];
                         if (!val) return null;
                         return (
                           <div key={f.id} className="flex justify-between text-xs">
                             <span style={{ color: "var(--foreground-dimmed)" }}>{f.name}</span>
                             <span className="font-medium truncate max-w-[120px]" title={String(val)}>
                               {f.type === "CURRENCY" ? `₹${val}` : String(val)}
                             </span>
                           </div>
                         )
                       })}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setSelectedRecordId(undefined);
                    setIsFormOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed transition-colors text-xs font-semibold"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--foreground-dimmed)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.color = "var(--primary)";
                    e.currentTarget.style.background = "color-mix(in oklch, var(--primary), transparent 95%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--foreground-dimmed)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <RecordFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        tableId={tableId}
        recordId={selectedRecordId}
        recordData={selectedRecordId ? records.find((r: any) => r.id === selectedRecordId)?.data : undefined}
        onSuccess={() => {
          refreshRecords();
          setIsFormOpen(false);
        }}
        fields={fields || []}
      />
    </div>
  );
}
