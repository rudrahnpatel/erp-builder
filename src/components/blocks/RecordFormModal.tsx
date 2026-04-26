"use client";

import { useEffect, useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Indian mobile numbers: 10 digits after the optional +91 / 91 / 0 country prefix.
// First digit must be 6, 7, 8, or 9 per TRAI numbering.
function normalizeIndianPhone(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

function validateIndianPhone(raw: string): string | null {
  if (!raw) return null;
  const digits = normalizeIndianPhone(raw);
  // Strip leading 91 / 0 prefix, then require 10-digit subscriber number.
  const subscriber = digits.replace(/^(91|0)/, "");
  if (subscriber.length !== 10) {
    return "Enter a 10-digit Indian mobile number";
  }
  if (!/^[6-9]/.test(subscriber)) {
    return "Indian mobile numbers start with 6, 7, 8, or 9";
  }
  return null;
}

function validateEmail(raw: string): string | null {
  if (!raw) return null;
  // Lightweight check — server is the real authority. Only block obvious junk.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
    return "Enter a valid email address";
  }
  return null;
}

function isAutoComputeField(field: any, allFields: any[]): boolean {
  if (field?.config?.autoCompute) return true;
  // Heuristic for already-installed packs that pre-date the autoCompute config:
  // a "Status" SINGLE_SELECT alongside a "Current Stock" field is an inventory status.
  if (
    field.name === "Status" &&
    field.type === "SINGLE_SELECT" &&
    allFields.some((f) => f.name === "Current Stock")
  ) {
    return true;
  }
  return false;
}

function computeFieldValue(field: any, allFields: any[], formData: Record<string, any>): unknown {
  const kind = field?.config?.autoCompute;
  const isStockStatus =
    kind === "stock_status" ||
    (field.name === "Status" && allFields.some((f) => f.name === "Current Stock"));

  if (isStockStatus) {
    const stockField = allFields.find((f) => f.name === "Current Stock");
    if (!stockField) return null;
    const raw = formData[stockField.id];
    const qty = typeof raw === "number" ? raw : parseFloat(raw);
    if (!qty || qty <= 0 || Number.isNaN(qty)) return "OUT OF STOCK";
    if (qty < 100) return "LOW STOCK";
    return "IN STOCK";
  }

  return null;
}

export function RecordFormModal({
  isOpen,
  onClose,
  tableId,
  recordId,
  recordData,
  onSuccess,
  fields,
}: {
  isOpen: boolean;
  onClose: () => void;
  tableId: string;
  recordId?: string;
  recordData?: Record<string, any>;
  onSuccess: () => void;
  fields: any[];
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (recordId && recordData) {
      setFormData({ ...recordData });
    } else {
      setFormData({});
    }
    setFieldErrors({});
  }, [isOpen, recordId, recordData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Re-run validators on submit so users can't bypass an inline error by
    // submitting before the onChange handler stores the message.
    const errors: Record<string, string> = {};
    for (const f of fields) {
      const raw = formData[f.id];
      if (typeof raw !== "string") continue;
      if (f.type === "PHONE") {
        const msg = validateIndianPhone(raw);
        if (msg) errors[f.id] = msg;
      } else if (f.type === "EMAIL") {
        const msg = validateEmail(raw);
        if (msg) errors[f.id] = msg;
      }
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      // Inject auto-computed values before submitting
      const payload: Record<string, any> = { ...formData };
      for (const f of fields) {
        if (isAutoComputeField(f, fields)) {
          const computed = computeFieldValue(f, fields, payload);
          if (computed !== null) payload[f.id] = computed;
        }
      }

      const method = recordId ? "PATCH" : "POST";
      const url = recordId
        ? `/api/tables/${tableId}/records/${recordId}`
        : `/api/tables/${tableId}/records`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-end"
      style={{
        background: "oklch(0 0 0 / 0.5)",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md h-full shadow-2xl border-l overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300"
        style={{
          background: "var(--card)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-5 border-b shrink-0"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div>
            <h2
              className="text-xl font-bold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              {recordId ? "Edit Record" : "Add Record"}
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--foreground-dimmed)" }}>
              Fill out the details below.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-xl hover-bg-subtle focus-ring h-9 w-9"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {fields.filter((f) => !isAutoComputeField(f, fields)).map((f) => {
             const key = f.id;
             return (
               <div key={f.id} className="space-y-2">
                 <label
                   className="text-[11px] font-bold uppercase tracking-wider block flex items-center justify-between"
                   style={{ color: "var(--foreground-muted)" }}
                 >
                   {f.name}
                   {f.required && (
                     <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: "var(--danger)", background: "var(--danger-subtle)" }}>
                       Required
                     </span>
                   )}
                 </label>

                 {f.type === "SINGLE_SELECT" ? (
                   <select
                     className="w-full text-sm px-4 py-3 rounded-xl outline-none transition-all focus-ring"
                     style={{
                       background: "var(--surface-sunken)",
                       border: "1px solid var(--border)",
                       color: "var(--foreground)",
                     }}
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
                   <label className="flex items-center gap-3 cursor-pointer py-1">
                     <input
                       type="checkbox"
                       className="w-5 h-5 rounded-md border-2 text-primary focus:ring-primary cursor-pointer"
                       style={{ borderColor: "var(--border)" }}
                       checked={formData[key] || false}
                       onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                     />
                     <span className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                       {formData[key] ? "Enabled" : "Disabled"}
                     </span>
                   </label>
                 ) : f.type === "NUMBER" || f.type === "CURRENCY" ? (
                   <input
                     type="number"
                     className="w-full text-sm px-4 py-3 rounded-xl outline-none transition-all focus-ring"
                     style={{
                       background: "var(--surface-sunken)",
                       border: "1px solid var(--border)",
                       color: "var(--foreground)",
                     }}
                     value={formData[key] ?? ""}
                     onChange={(e) => setFormData({ ...formData, [key]: e.target.value === "" ? "" : parseFloat(e.target.value) })}
                     required={f.required}
                     placeholder={f.type === "CURRENCY" ? "0.00" : "0"}
                   />
                 ) : f.type === "PHONE" ? (
                   <>
                     <div className="flex items-stretch rounded-xl overflow-hidden" style={{ border: `1px solid ${fieldErrors[key] ? "var(--danger)" : "var(--border)"}` }}>
                       <span
                         className="px-3 flex items-center text-sm font-medium mono shrink-0"
                         style={{
                           background: "var(--surface-2)",
                           color: "var(--foreground-muted)",
                           borderRight: "1px solid var(--border)",
                         }}
                         aria-hidden="true"
                       >
                         +91
                       </span>
                       <input
                         type="tel"
                         inputMode="numeric"
                         maxLength={14}
                         className="flex-1 text-sm px-3 py-3 outline-none transition-all"
                         style={{
                           background: "var(--surface-sunken)",
                           color: "var(--foreground)",
                         }}
                         value={formData[key] || ""}
                         onChange={(e) => {
                           const v = e.target.value;
                           setFormData({ ...formData, [key]: v });
                           const msg = validateIndianPhone(v);
                           setFieldErrors((prev) => {
                             const next = { ...prev };
                             if (msg) next[key] = msg;
                             else delete next[key];
                             return next;
                           });
                         }}
                         required={f.required}
                         placeholder="98765 43210"
                       />
                     </div>
                     {fieldErrors[key] ? (
                       <p className="text-[11px] mt-1" style={{ color: "var(--danger)" }}>
                         {fieldErrors[key]}
                       </p>
                     ) : (
                       <p className="text-[11px] mt-1" style={{ color: "var(--foreground-dimmed)" }}>
                         10-digit Indian mobile number
                       </p>
                     )}
                   </>
                 ) : f.type === "EMAIL" ? (
                   <>
                     <input
                       type="email"
                       className="w-full text-sm px-4 py-3 rounded-xl outline-none transition-all focus-ring"
                       style={{
                         background: "var(--surface-sunken)",
                         border: `1px solid ${fieldErrors[key] ? "var(--danger)" : "var(--border)"}`,
                         color: "var(--foreground)",
                       }}
                       value={formData[key] || ""}
                       onChange={(e) => {
                         const v = e.target.value;
                         setFormData({ ...formData, [key]: v });
                         const msg = validateEmail(v);
                         setFieldErrors((prev) => {
                           const next = { ...prev };
                           if (msg) next[key] = msg;
                           else delete next[key];
                           return next;
                         });
                       }}
                       required={f.required}
                       placeholder="name@example.com"
                     />
                     {fieldErrors[key] && (
                       <p className="text-[11px] mt-1" style={{ color: "var(--danger)" }}>
                         {fieldErrors[key]}
                       </p>
                     )}
                   </>
                 ) : (
                   <input
                     type="text"
                     className="w-full text-sm px-4 py-3 rounded-xl outline-none transition-all focus-ring"
                     style={{
                       background: "var(--surface-sunken)",
                       border: "1px solid var(--border)",
                       color: "var(--foreground)",
                     }}
                     value={formData[key] || ""}
                     onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                     required={f.required}
                     placeholder={`Enter ${f.name.toLowerCase()}...`}
                   />
                 )}
               </div>
             )
          })}
        </form>

        <div
          className="p-6 border-t shrink-0"
          style={{
            borderColor: "var(--border-subtle)",
            background: "var(--surface-1)",
          }}
        >
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-11"
              onClick={onClose}
              type="button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2 rounded-xl h-11 font-semibold pressable"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                color: "var(--primary-foreground)",
                boxShadow: "0 2px 8px color-mix(in oklch, var(--primary), transparent 65%)",
              }}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4" /> Save Record</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
