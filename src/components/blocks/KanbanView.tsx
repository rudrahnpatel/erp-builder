"use client";

import { useState } from "react";
import useSWR from "swr";
import { Kanban, Plus } from "lucide-react";
import { RecordFormModal } from "./RecordFormModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function KanbanView({ config, tableId }: { config: any; tableId?: string }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | undefined>();

  const { data: fields } = useSWR(tableId ? `/api/tables/${tableId}/fields` : null, fetcher);
  const { data: recordsData, mutate: refreshRecords } = useSWR(tableId ? `/api/tables/${tableId}/records` : null, fetcher);

  if (!tableId) {
    return (
      <div className="p-8 border border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-secondary/10">
        <Kanban className="h-8 w-8 mb-2 opacity-50" />
        <p>No table configured or table not found.</p>
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
    let val = r.data[groupByField];
    if (fieldConfig && fieldConfig.name !== groupByField) {
      val = r.data[fieldConfig.name] ?? val;
    }
    const groupName = val || columns[0];
    if (!grouped[groupName]) {
      grouped[groupName] = [];
    }
    grouped[groupName].push(r);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-secondary text-muted-foreground">
            <Kanban className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold text-foreground">
            {config.tableRef || "Kanban Board"}
          </span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x relative min-h-[400px]">
        {Object.entries(grouped).map(([col, items]) => (
          <div
            key={col}
            className="flex-1 rounded-xl p-3 min-w-[280px] bg-secondary/20 border border-border/30 snap-start flex flex-col max-h-[70vh] overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                {col}
              </h4>
              <span className="text-[10px] font-medium bg-background px-1.5 py-0.5 rounded-md text-muted-foreground border border-border/50">
                {items.length}
              </span>
            </div>
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 pb-2">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="rounded-xl p-4 text-sm bg-card border border-border/40 text-foreground shadow-sm hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedRecordId(item.id);
                    setIsFormOpen(true);
                  }}
                >
                  <div className="font-semibold mb-2 text-[14px]">
                     {/* Show a primary field as title */}
                     {item.data["PO Number"] || item.data["Name"] || item.data["Reference"] || item.id.substring(0,8)}
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-border/50">
                     {/* Show sub-details */}
                     {fields?.filter((f: any) => f.name !== groupByField && f.name !== "PO Number" && f.name !== "Notes" && f.name !== "Status")
                             .slice(0, 2)
                             .map((f: any) => {
                       const val = item.data[f.name];
                       if (!val) return null;
                       return (
                         <div key={f.id} className="flex justify-between text-xs">
                           <span className="text-muted-foreground">{f.name}:</span>
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
                onClick={() => setIsFormOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border/60 text-muted-foreground hover:bg-secondary/40 hover:text-foreground hover:border-border transition-colors text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        ))}
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
