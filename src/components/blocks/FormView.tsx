"use client";

import { useState } from "react";
import useSWR from "swr";
import { CheckCircle2, Loader2, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface FormConfig {
  tableRef?: string;
  title?: string;
  description?: string;
}

// Mirror of RecordFormModal's auto-compute heuristic so pack "Status" fields stay derived.
function isAutoComputeField(field: any, allFields: any[]): boolean {
  if (field?.config?.autoCompute) return true;
  if (
    field.name === "Status" &&
    field.type === "SINGLE_SELECT" &&
    allFields.some((f) => f.name === "Current Stock")
  ) {
    return true;
  }
  return false;
}

function computeFieldValue(
  field: any,
  allFields: any[],
  formData: Record<string, any>
): unknown {
  const kind = field?.config?.autoCompute;
  const isStockStatus =
    kind === "stock_status" ||
    (field.name === "Status" &&
      allFields.some((f) => f.name === "Current Stock"));

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

export function FormView({
  config,
  tableId,
  readOnly = false,
}: {
  config: FormConfig;
  tableId?: string;
  readOnly?: boolean;
}) {
  const { data: fields } = useSWR<any[]>(
    tableId ? `/api/tables/${tableId}/fields` : null,
    fetcher
  );

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!tableId) {
    return (
      <div className="p-10 border-2 border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center bg-secondary/20 text-muted-foreground">
        <FileText className="h-8 w-8 mb-3 opacity-40" />
        <p className="text-sm font-medium">No table connected.</p>
        <p className="text-xs mt-1 opacity-70">
          Pick one in Configuration → Target Database Table.
        </p>
      </div>
    );
  }

  const visibleFields = (fields ?? []).filter(
    (f) => !isAutoComputeField(f, fields ?? [])
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly || !tableId || !fields) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, any> = { ...formData };
      for (const f of fields) {
        if (isAutoComputeField(f, fields)) {
          const computed = computeFieldValue(f, fields, payload);
          if (computed !== null) payload[f.id] = computed;
        }
      }
      const res = await fetch(`/api/tables/${tableId}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save record");
      }
      setFormData({});
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-2xl">
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-foreground">
          {config.title || `New ${config.tableRef || "Record"}`}
        </h3>
        <p className="text-xs text-muted-foreground">
          {config.description ||
            "Fields generated from the selected table schema."}
        </p>
      </div>

      {!fields ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading fields…
        </div>
      ) : visibleFields.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          This table has no editable fields.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleFields.map((f) => {
            const key = f.id;
            const common =
              "w-full text-sm px-3.5 py-2.5 rounded-xl bg-secondary/30 border border-border/60 text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
            return (
              <div key={f.id} className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center justify-between">
                  <span>{f.name}</span>
                  {f.required && (
                    <span className="text-[9px] font-semibold text-destructive">
                      Required
                    </span>
                  )}
                </label>
                {f.type === "SINGLE_SELECT" ? (
                  <select
                    className={common}
                    value={formData[key] ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                    required={f.required}
                    disabled={readOnly || submitting}
                  >
                    <option value="">Select…</option>
                    {(f.config?.options || []).map((o: string) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : f.type === "CHECKBOX" ? (
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border"
                      checked={!!formData[key]}
                      onChange={(e) =>
                        setFormData({ ...formData, [key]: e.target.checked })
                      }
                      disabled={readOnly || submitting}
                    />
                    {formData[key] ? "Enabled" : "Disabled"}
                  </label>
                ) : f.type === "NUMBER" || f.type === "CURRENCY" ? (
                  <input
                    type="number"
                    className={common}
                    value={formData[key] ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [key]:
                          e.target.value === "" ? "" : parseFloat(e.target.value),
                      })
                    }
                    required={f.required}
                    disabled={readOnly || submitting}
                    placeholder={f.type === "CURRENCY" ? "0.00" : "0"}
                  />
                ) : f.type === "DATE" ? (
                  <input
                    type="date"
                    className={common}
                    value={formData[key] ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                    required={f.required}
                    disabled={readOnly || submitting}
                  />
                ) : (
                  <input
                    type={f.type === "EMAIL" ? "email" : f.type === "PHONE" ? "tel" : "text"}
                    className={common}
                    value={formData[key] ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                    required={f.required}
                    disabled={readOnly || submitting}
                    placeholder={`Enter ${f.name.toLowerCase()}…`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <div
          className="text-xs px-3 py-2 rounded-lg border"
          style={{
            color: "var(--danger, #dc2626)",
            background: "color-mix(in oklch, var(--danger, #dc2626), transparent 90%)",
            borderColor: "color-mix(in oklch, var(--danger, #dc2626), transparent 75%)",
          }}
        >
          {error}
        </div>
      )}

      <div className="pt-4 flex justify-end gap-2 border-t border-border/40 items-center">
        {justSaved && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 mr-auto">
            <CheckCircle2 className="h-3.5 w-3.5" /> Record saved
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          className="h-9 rounded-lg"
          onClick={() => setFormData({})}
          disabled={submitting}
        >
          Clear
        </Button>
        <Button
          type="submit"
          className="h-9 rounded-lg px-6 font-medium shadow-sm transition-transform gap-2"
          disabled={submitting || readOnly || !fields || visibleFields.length === 0}
        >
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" /> Submit Record
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
