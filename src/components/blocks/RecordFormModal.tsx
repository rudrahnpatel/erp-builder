"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RecordFormModal({ 
  isOpen, 
  onClose, 
  tableId, 
  recordId, 
  onSuccess,
  fields 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  tableId: string; 
  recordId?: string;
  onSuccess: () => void;
  fields: any[];
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // The backend expects keys that might be the field's name or packFieldKey according to seeding conventions.
      // We send formData as is.
      const method = recordId ? "PATCH" : "POST";
      const url = recordId 
        ? `/api/tables/${tableId}/records/${recordId}` 
        : `/api/tables/${tableId}/records`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      onSuccess();
      setFormData({});
    } catch (err) {
      console.error(err);
      alert("Error saving record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md h-full shadow-2xl border-l border-border/50 animate-in slide-in-from-right overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold">{recordId ? "Edit Record" : "Add Record"}</h2>
            <p className="text-xs text-muted-foreground mt-1">Fill out the details below.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-secondary">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {fields.map((f) => {
             const key = f.name;
             return (
               <div key={f.id} className="space-y-1.5">
                 <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center justify-between">
                   {f.name} {f.required && <span className="text-destructive">*</span>}
                 </label>
                 
                 {f.type === "SINGLE_SELECT" ? (
                   <select 
                     className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-secondary/30 border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                     value={formData[key] || ""}
                     onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                     required={f.required}
                   >
                     <option value="">Select...</option>
                     {(f.config?.options || []).map((o: string) => (
                       <option key={o} value={o}>{o}</option>
                     ))}
                   </select>
                 ) : f.type === "CHECKBOX" ? (
                   <input 
                     type="checkbox"
                     className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                     checked={formData[key] || false}
                     onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                   />
                 ) : f.type === "NUMBER" || f.type === "CURRENCY" ? (
                   <input
                     type="number"
                     className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-secondary/30 border border-border/60 text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                     value={formData[key] || ""}
                     onChange={(e) => setFormData({ ...formData, [key]: parseFloat(e.target.value) })}
                     required={f.required}
                   />
                 ) : (
                   <input
                     type="text"
                     className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-secondary/30 border border-border/60 text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                     value={formData[key] || ""}
                     onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                     required={f.required}
                   />
                 )}
               </div>
             )
          })}
        </form>

        <div className="p-6 border-t border-border/50 shrink-0 bg-surface-1">
          <Button 
            className="w-full gap-2 rounded-xl h-11" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Record"}
          </Button>
        </div>
      </div>
    </div>
  );
}
