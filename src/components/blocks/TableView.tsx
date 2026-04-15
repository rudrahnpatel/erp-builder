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
      <div className="p-8 border border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-secondary/10">
        <Table2 className="h-8 w-8 mb-2 opacity-50" />
        <p>No table configured or table not found.</p>
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
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-secondary text-muted-foreground">
            <Table2 className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold text-foreground">
            {config.tableRef || "Records"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-secondary rounded-lg">
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button 
            className="gap-2 h-9 rounded-lg font-medium shadow-sm active:scale-95 transition-transform"
            onClick={() => {
              setSelectedRecordId(undefined);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add Record
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-xl border border-border/40 bg-surface-1 shadow-sm">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-border/40 bg-secondary/20">
              {headers.map((h: any) => (
                <th
                  key={h.id}
                  className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                >
                  {h.name}
                </th>
              ))}
              <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground min-w-[80px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {records.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 1} className="px-4 py-12 text-center text-muted-foreground">
                  No records found.
                </td>
              </tr>
            ) : (
              records.map((row: any) => (
                <tr key={row.id} className="hover:bg-secondary/20 transition-colors group">
                  {headers.map((h: any) => {
                    const val = row.data[h.name] ?? row.data[h.packFieldKey];
                    return (
                      <td key={h.id} className="px-4 py-3.5 font-medium text-foreground whitespace-nowrap">
                         {h.type === "CHECKBOX" ? (
                           <Badge variant="outline" className={val ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}>
                             {val ? "Yes" : "No"}
                           </Badge>
                         ) : h.type === "CURRENCY" ? (
                           // eslint-disable-next-line indent
                           <span className="tabular-nums">
                              {h.config?.currency === "INR" ? "₹" : "$"} {val || "0"}
                           </span>
                         ) : h.type === "SINGLE_SELECT" ? (
                           <Badge variant="secondary" className="bg-secondary/40 text-foreground font-medium text-xs">
                             {val}
                           </Badge>
                         ) : h.type === "RELATION" ? (
                           <span className="text-primary hover:underline cursor-pointer">{val?.displayValue || val || "—"}</span>
                         ) : (
                           String(val || "—")
                         )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3.5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs font-medium text-primary hover:bg-primary/10"
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
        onSuccess={() => {
          refreshRecords();
          setIsFormOpen(false);
        }}
        fields={fields || []}
      />
    </div>
  );
}
