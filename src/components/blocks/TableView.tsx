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

  const copyAttendanceLink = async (employeeId: string) => {
    try {
      const res = await fetch("/api/attendance/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });
      const data = await res.json();
      if (data.checkInUrl) {
        await navigator.clipboard.writeText(data.checkInUrl);
        alert("Attendance link copied to clipboard!");
      } else {
        alert(data.error || "Failed to generate link");
      }
    } catch (e) {
      alert("Network error");
    }
  };

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
    <div 
      className="flex flex-col rounded-2xl overflow-hidden border shadow-sm transition-all duration-300"
      style={{ 
        background: "var(--card)", 
        borderColor: "var(--border-subtle)" 
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 gap-4 border-b" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-2)" }}>
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shadow-inner"
            style={{
              background: "color-mix(in oklch, var(--primary), transparent 88%)",
              color: "var(--primary)",
            }}
          >
            <Table2 className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground tracking-tight leading-tight">
              {config.tableRef || "Records"}
            </span>
            <span
              className="text-[11px] font-bold uppercase tracking-widest mt-0.5 opacity-60"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              {records.length} {records.length === 1 ? "entry" : "entries"} total
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            className="gap-2 h-10 px-5 rounded-xl font-bold shadow-lg shadow-primary/20 pressable"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
              color: "var(--primary-foreground)",
            }}
            onClick={() => {
              setSelectedRecordId(undefined);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add Record
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover-bg-subtle border" style={{ borderColor: "var(--border-subtle)" }}>
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr
              className="border-b"
              style={{
                borderColor: "var(--border-subtle)",
                background: "var(--surface-1)",
              }}
            >
              {headers.map((h: any) => (
                <th
                  key={h.id}
                  className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--foreground-dimmed)" }}
                >
                  {h.name}
                </th>
              ))}
              <th
                className="text-right px-6 py-4 text-[10px] font-bold uppercase tracking-widest min-w-[120px]"
                style={{ color: "var(--foreground-dimmed)" }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length + 1}
                  className="px-6 py-20 text-center"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-border/40">
                    <Table2 className="h-7 w-7 opacity-20" />
                  </div>
                  <p className="text-lg font-bold text-foreground">No records yet</p>
                  <p className="text-sm mt-1 max-w-xs mx-auto" style={{ color: "var(--foreground-dimmed)" }}>
                    This table is currently empty. Start by adding a new entry using the button above.
                  </p>
                </td>
              </tr>
            ) : (
              records.map((row: any) => (
                <tr
                  key={row.id}
                  className="table-row-hover group transition-colors duration-150"
                >
                  {headers.map((h: any) => {
                    const val = row.data[h.id] ?? row.data[h.name] ?? row.data[h.packFieldKey];
                    return (
                      <td key={h.id} className="px-6 py-4 whitespace-nowrap">
                         {h.type === "CHECKBOX" ? (
                           <Badge
                             variant="outline"
                             className={`text-[10px] font-bold rounded-lg px-2.5 py-0.5 border-2 ${
                               val ? "status-success" : "opacity-40"
                             }`}
                           >
                             {val ? "YES" : "NO"}
                           </Badge>
                         ) : h.type === "CURRENCY" ? (
                           <span className="tabular-nums font-bold text-base" style={{ color: "var(--foreground)" }}>
                              {h.config?.currency === "INR" ? "₹" : "$"} {val || "0"}
                           </span>
                         ) : h.type === "SINGLE_SELECT" ? (
                           <Badge
                             variant="secondary"
                             className="font-bold text-[10px] uppercase tracking-wider rounded-lg px-2.5 py-1"
                             style={{ background: "var(--surface-3)", color: "var(--foreground)" }}
                           >
                             {val}
                           </Badge>
                         ) : h.type === "RELATION" ? (
                           <span className="font-bold border-b-2 border-primary/20 pb-0.5" style={{ color: "var(--primary)" }}>
                             {val?.displayValue || val || "—"}
                           </span>
                         ) : (
                           <span className="font-medium text-[14px]" style={{ color: "var(--foreground)" }}>
                             {String(val || "—")}
                           </span>
                         )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {config.tableRef === "Employees" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-4 text-xs font-bold rounded-xl border-2 hover:bg-primary hover:text-white transition-all"
                          style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            copyAttendanceLink(row.id);
                          }}
                        >
                          Copy Link
                        </Button>
                      )}
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-9 px-4 text-xs font-bold rounded-xl hover-bg-subtle border"
                        style={{ background: "var(--surface-3)", color: "var(--foreground)" }}
                        onClick={() => {
                          setSelectedRecordId(row.id);
                          setIsFormOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
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
