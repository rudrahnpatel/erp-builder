"use client";

import { useState } from "react";
import useSWR from "swr";
import { Table2, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecordFormModal } from "./RecordFormModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TableView({ config, tableId }: { config: any; tableId?: string }) {
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
        <Table2 className="h-8 w-8 mb-3 opacity-40" />
        <p className="text-sm font-medium">No table configured or table not found.</p>
      </div>
    );
  }

  const visibleFieldNames = config.visibleFields || [];
  
  // Create an ordered headers list based on `visibleFieldNames`
  const headers = fields
    ? visibleFieldNames
        .map((name: string) => fields.find((f: any) => f.name === name || f.packFieldKey === name))
        .filter(Boolean)
    : [];

  const records = recordsData?.records || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{
              background: "color-mix(in oklch, var(--primary), transparent 85%)",
              color: "var(--primary)",
            }}
          >
            <Table2 className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
            {config.tableRef || "Records"}
          </span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-md"
            style={{
              background: "var(--surface-3)",
              color: "var(--foreground-dimmed)",
            }}
          >
            {records.length} {records.length === 1 ? "record" : "records"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover-bg-subtle">
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button 
            className="gap-2 h-9 rounded-xl font-semibold pressable"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
              color: "var(--primary-foreground)",
              boxShadow: "0 2px 8px color-mix(in oklch, var(--primary), transparent 65%)",
            }}
            onClick={() => {
              setSelectedRecordId(undefined);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add Record
          </Button>
        </div>
      </div>
      
      <div
        className="overflow-x-auto rounded-xl shadow-sm"
        style={{
          border: "1px solid var(--border-subtle)",
          background: "var(--surface-1)",
        }}
      >
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr
              className="border-b"
              style={{
                borderColor: "var(--border-subtle)",
                background: "var(--surface-2)",
              }}
            >
              {headers.map((h: any) => (
                <th
                  key={h.id}
                  className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{ color: "var(--foreground-dimmed)" }}
                >
                  {h.name}
                </th>
              ))}
              <th
                className="text-right px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider min-w-[80px]"
                style={{ color: "var(--foreground-dimmed)" }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length + 1}
                  className="px-5 py-14 text-center"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  <Table2 className="h-6 w-6 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No records found</p>
                  <p className="text-xs mt-1" style={{ color: "var(--foreground-dimmed)" }}>
                    Click "Add Record" to create your first entry.
                  </p>
                </td>
              </tr>
            ) : (
              records.map((row: any, i: number) => (
                <tr
                  key={row.id}
                  className="table-row-hover group"
                  style={{
                    borderBottom: i < records.length - 1 ? "1px solid var(--border-subtle)" : "none"
                  }}
                >
                  {headers.map((h: any) => {
                    const val = row.data[h.id] ?? row.data[h.name] ?? row.data[h.packFieldKey];
                    return (
                      <td key={h.id} className="px-5 py-4 font-medium whitespace-nowrap" style={{ color: "var(--foreground)" }}>
                         {h.type === "CHECKBOX" ? (
                           <Badge
                             variant="outline"
                             className={`text-[10px] font-bold rounded-md px-2 py-0.5 ${
                               val ? "status-success" : ""
                             }`}
                             style={!val ? { background: "var(--surface-3)", color: "var(--foreground-dimmed)" } : undefined}
                           >
                             {val ? "Yes" : "No"}
                           </Badge>
                         ) : h.type === "CURRENCY" ? (
                           <span className="tabular-nums font-semibold">
                              {h.config?.currency === "INR" ? "₹" : "$"} {val || "0"}
                           </span>
                         ) : h.type === "SINGLE_SELECT" ? (
                           <Badge
                             variant="secondary"
                             className="font-medium text-xs rounded-md px-2 py-0.5"
                             style={{ background: "var(--surface-3)", color: "var(--foreground)" }}
                           >
                             {val}
                           </Badge>
                         ) : h.type === "RELATION" ? (
                           <span className="font-medium" style={{ color: "var(--primary)" }}>
                             {val?.displayValue || val || "—"}
                           </span>
                         ) : (
                           String(val || "—")
                         )}
                      </td>
                    );
                  })}
                  <td className="px-5 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs font-semibold rounded-lg hover-bg-subtle"
                      style={{ color: "var(--primary)" }}
                      onClick={() => {
                        setSelectedRecordId(row.id);
                        setIsFormOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
