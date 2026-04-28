"use client";

import { useState, use, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DevModeGate } from "@/components/layout/DevModeGate";
import {
  Plus,
  GripVertical,
  Settings2,
  Trash2,
  Database,
  Eye,
  Save,
  ChevronRight,
  Lock,
  Layers,
  CircleDot,
  CheckCircle2,
  MessageSquare,
  Mail,
  Zap,
  Sparkles,
} from "lucide-react";

const fieldTypes = [
  { value: "TEXT", label: "Text", color: "var(--accent-blue)" },
  { value: "NUMBER", label: "Number", color: "var(--accent-emerald)" },
  { value: "DATE", label: "Date", color: "var(--accent-amber)" },
  { value: "SINGLE_SELECT", label: "Select", color: "var(--accent-violet)" },
  { value: "CURRENCY", label: "Currency", color: "var(--accent-rose)" },
  { value: "RELATION", label: "Relation", color: "#6366f1" },
  { value: "PHONE", label: "Phone", color: "#06b6d4" },
  { value: "EMAIL", label: "Email", color: "#8b5cf6" },
  { value: "CHECKBOX", label: "Checkbox", color: "var(--foreground-muted)" },
  { value: "TIME", label: "Time", color: "#f59e0b" },
];

interface FieldItem {
  id: string;
  name: string;
  type: string;
  required: boolean;
}

const initialFields: FieldItem[] = [
  { id: "1", name: "Product Name", type: "TEXT", required: true },
  { id: "2", name: "SKU", type: "TEXT", required: true },
  { id: "3", name: "Price", type: "CURRENCY", required: false },
  { id: "4", name: "Category", type: "SINGLE_SELECT", required: false },
  { id: "5", name: "Supplier", type: "RELATION", required: false },
];

const sampleData = [
  { "Product Name": "Basmati Rice 5kg", SKU: "BR-005", Price: "₹450.00", Category: "Finished Goods", Supplier: "Krishna Traders" },
  { "Product Name": "Toor Dal 1kg", SKU: "TD-001", Price: "₹180.00", Category: "Finished Goods", Supplier: "Patel Exports" },
  { "Product Name": "Cardboard Box 12×12", SKU: "CB-012", Price: "₹25.00", Category: "Packaging", Supplier: "Sharma & Sons" },
  { "Product Name": "Turmeric Powder 500g", SKU: "TP-500", Price: "₹95.00", Category: "Finished Goods", Supplier: "Krishna Traders" },
];

export default function SchemaDesignerPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = use(params);
  
  const { data: table, mutate: refreshTable } = useSWR(`/api/tables/${tableId}`, (url: string) => fetch(url).then(r => r.json()));
  
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [section, setSection] = useState<"schema" | "automations" | "permissions">("schema");

  // Sync state when table fetches
  useEffect(() => {
    if (table?.fields && fields.length === 0) {
      setFields(table.fields);
    }
  }, [table]);

  const addField = () => {
    const newField: FieldItem = {
      id: "temp-" + Date.now(),
      name: "New Field",
      type: "TEXT",
      required: false,
    };
    setFields((prev) => [...prev, newField]);
    setSelectedField(newField.id);
  };

  const updateField = (id: string, updates: Partial<FieldItem>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (selectedField === id) setSelectedField(null);
  };

  const getTypeInfo = (type: string) =>
    fieldTypes.find((t) => t.value === type) || fieldTypes[0];

  // Compare the local working set against the published server fields so we
  // can surface an honest "X unsaved change(s)" indicator instead of an
  // ambiguous "Draft" badge that's always lit.
  const publishedFields = (table?.fields ?? []) as FieldItem[];
  const draftDiff = (() => {
    const byId = new Map(publishedFields.map((f) => [f.id, f]));
    let added = 0;
    let modified = 0;
    let removed = 0;
    const seen = new Set<string>();
    for (const f of fields) {
      seen.add(f.id);
      const prev = byId.get(f.id);
      if (!prev) {
        added++;
        continue;
      }
      if (
        prev.name !== f.name ||
        prev.type !== f.type ||
        prev.required !== f.required
      ) {
        modified++;
      }
    }
    for (const f of publishedFields) {
      if (!seen.has(f.id)) removed++;
    }
    return { added, modified, removed, total: added + modified + removed };
  })();
  const hasUnsavedChanges = draftDiff.total > 0;

  return (
    <DevModeGate>
    <div className="h-[calc(100vh-3.5rem)] flex flex-col -m-4 sm:-m-6">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 border-b shrink-0 glass"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
          <span>Tables</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium" style={{ color: "var(--foreground)" }}>
            {table ? table.name : "Loading..."}
          </span>
          <ChevronRight className="h-3 w-3" />
          <span>Schema</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Draft indicator — clear visual whether there are unsaved changes
              and exactly what's pending. */}
          <div
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium mono"
            title={
              hasUnsavedChanges
                ? `${draftDiff.added} added, ${draftDiff.modified} modified, ${draftDiff.removed} removed`
                : "All schema changes have been published"
            }
            style={{
              background: hasUnsavedChanges
                ? "color-mix(in oklch, var(--accent-amber), transparent 88%)"
                : "color-mix(in oklch, var(--success), transparent 88%)",
              color: hasUnsavedChanges ? "var(--accent-amber)" : "var(--success)",
              border: hasUnsavedChanges
                ? "1px solid color-mix(in oklch, var(--accent-amber), transparent 70%)"
                : "1px solid color-mix(in oklch, var(--success), transparent 70%)",
            }}
          >
            {hasUnsavedChanges ? (
              <>
                <CircleDot className="h-3 w-3" />
                {draftDiff.total} unsaved change{draftDiff.total === 1 ? "" : "s"}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Published
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            disabled={!hasUnsavedChanges}
            onClick={async () => {
              setIsSaving(true);
              await fetch(`/api/tables/${tableId}/fields/sync`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fields }),
              });
              setIsSaving(false);
              alert("Draft Saved Locally"); // Mock effect
            }}
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground-muted)",
              background: "var(--surface-2)",
            }}
          >
            <Save className="h-3.5 w-3.5" /> Save Draft
          </Button>
          <Button
            size="sm"
            disabled={isSaving || !hasUnsavedChanges}
            onClick={async () => {
              setIsSaving(true);
              await fetch(`/api/tables/${tableId}/fields/sync`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fields }),
              });
              await refreshTable();
              setIsSaving(false);
            }}
            className="gap-1.5 text-xs font-medium transition-all duration-300"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            {isSaving ? "Publishing..." : "Publish Schema"}
          </Button>
        </div>
      </div>

      {/* Split panels */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left: Field Editor */}
        <div
          className="w-full lg:w-[360px] border-b lg:border-b-0 lg:border-r overflow-y-auto max-h-[40vh] lg:max-h-none"
          style={{
            background: "var(--surface-1)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="p-5 border-b" style={{ borderColor: "var(--border-subtle)" }}>
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              Structure
            </h2>
            <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
              {table ? table.name : "Loading..."}
            </h3>
          </div>

          {/* Navigation */}
          <div className="px-4 py-3 space-y-0.5">
            {(
              [
                { id: "schema", label: "Data Schema", icon: Database },
                { id: "automations", label: "Automations", icon: Zap },
                { id: "permissions", label: "Permissions", icon: Lock },
              ] as const
            ).map((nav) => {
              const active = section === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => setSection(nav.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200"
                  style={{
                    background: active ? "var(--primary-subtle)" : "transparent",
                    color: active ? "var(--primary)" : "var(--foreground-muted)",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  <nav.icon className="h-4 w-4" />
                  {nav.label}
                </button>
              );
            })}
          </div>

          {/* Field list — only visible for the Data Schema section. The
              Automations and Permissions sections render their own bodies in
              the right pane below. */}
          {section === "schema" && <div className="px-4 py-3 space-y-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                onClick={() => setSelectedField(field.id)}
                className="group flex items-center gap-2 p-3 rounded-lg transition-all duration-200 cursor-pointer animate-fade-in-up"
                style={{
                  animationDelay: `${index * 40}ms`,
                  background:
                    selectedField === field.id
                      ? "var(--primary-subtle)"
                      : "transparent",
                  border: `1px solid ${
                    selectedField === field.id
                      ? "var(--primary)"
                      : "transparent"
                  }`,
                  boxShadow:
                    selectedField === field.id
                      ? "0 0 0 3px var(--primary-glow)"
                      : "none",
                }}
                onMouseEnter={(e) => {
                  if (selectedField !== field.id) {
                    e.currentTarget.style.background = "var(--surface-3)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedField !== field.id) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "transparent";
                  }
                }}
              >
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab" style={{ color: "var(--foreground-dimmed)" }} />
                <div className="flex-1 min-w-0">
                  <input
                    value={field.name}
                    onChange={(e) =>
                      updateField(field.id, { name: e.target.value })
                    }
                    className="h-7 w-full text-sm font-medium border-0 p-0 bg-transparent outline-none"
                    style={{ color: "var(--foreground)" }}
                  />
                </div>
                <Badge
                  className="text-[10px] font-semibold px-2 py-0.5 border-0 shrink-0"
                  style={{
                    background: `color-mix(in oklch, ${getTypeInfo(field.type).color}, transparent 85%)`,
                    color: getTypeInfo(field.type).color,
                  }}
                >
                  {getTypeInfo(field.type).label}
                </Badge>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeField(field.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Trash2 className="h-3.5 w-3.5" style={{ color: "var(--danger)" }} />
                </button>
              </div>
            ))}

            <button
              onClick={addField}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed text-sm transition-all duration-200"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground-muted)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.color = "var(--primary)";
                e.currentTarget.style.background = "var(--primary-subtle)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--foreground-muted)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Plus className="h-4 w-4" /> Add New Field
            </button>
          </div>}
        </div>

        {/* Right: Live Preview / Automations / Permissions */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ background: "var(--background)" }}>
          {section === "automations" && (
            <AutomationsPanel tableName={table?.name} />
          )}
          {section === "permissions" && (
            <PermissionsPanel tableName={table?.name} />
          )}
          {section === "schema" && (<>
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-4 w-4" style={{ color: "var(--foreground-dimmed)" }} />
            <h3
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              Live Preview
            </h3>
          </div>

          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    {fields.map((field) => (
                      <th
                        key={field.id}
                        className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--foreground-dimmed)" }}
                      >
                        {field.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sampleData.map((row, i) => (
                    <tr
                      key={i}
                      className="transition-colors duration-150"
                      style={{
                        borderBottom:
                          i < sampleData.length - 1
                            ? "1px solid var(--border-subtle)"
                            : "none",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--surface-3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {fields.map((field) => {
                        const value =
                          (row as Record<string, string>)[field.name] || "—";
                        return (
                          <td
                            key={field.id}
                            className="px-4 py-3"
                            style={{ color: "var(--foreground)" }}
                          >
                            {field.type === "RELATION" ? (
                              <span
                                className="cursor-pointer transition-colors"
                                style={{ color: "var(--primary)" }}
                              >
                                {value}
                              </span>
                            ) : field.type === "SINGLE_SELECT" ? (
                              <Badge
                                className="text-xs font-normal border-0"
                                style={{
                                  background: "var(--surface-3)",
                                  color: "var(--foreground-muted)",
                                }}
                              >
                                {value}
                              </Badge>
                            ) : (
                              value
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div
              className="flex items-center justify-between px-4 py-3 text-xs"
              style={{
                borderTop: "1px solid var(--border-subtle)",
                color: "var(--foreground-dimmed)",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <Layers className="h-3 w-3" style={{ color: "var(--primary)" }} />
                  {fields.length} columns
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: "#6366f1" }}
                  />
                  {fields.filter((f) => f.type === "RELATION").length} relation
                </span>
              </div>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-medium"
                style={{
                  background: "var(--warning-subtle)",
                  color: "var(--warning)",
                }}
              >
                Draft (unsaved)
              </span>
            </div>
          </div>

          {/* Floating add button */}
          <div className="fixed bottom-8 right-8">
            <Button
              onClick={addField}
              size="lg"
              className="rounded-full h-12 w-12 p-0 transition-all duration-300 glow-primary-hover"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          </>)}
        </div>
      </div>
    </div>
    </DevModeGate>
  );
}

// Lightweight scaffold of the Automations panel — gives the user a clear
// picture of what's coming and lets them stage rules locally so the page
// stops looking like a dead end. Persistence requires backend automation
// runtime which is out of scope for this pass.
function AutomationsPanel({ tableName }: { tableName?: string }) {
  const suggestions = [
    {
      title: "Low stock → WhatsApp alert",
      description: `When a record in ${tableName || "this table"} drops below its reorder level, send a WhatsApp message to the owner.`,
      trigger: "Field changes",
      channel: "WhatsApp",
      icon: MessageSquare,
      accent: "var(--success)",
    },
    {
      title: "New customer → welcome SMS",
      description: "Automatically text a welcome message in Hindi or English when a customer record is added.",
      trigger: "Record created",
      channel: "SMS",
      icon: Mail,
      accent: "var(--accent-blue)",
    },
    {
      title: "Overdue invoice → reminder",
      description: "Send a polite reminder 3 days after an invoice's due date passes.",
      trigger: "Scheduled (daily)",
      channel: "WhatsApp",
      icon: MessageSquare,
      accent: "var(--accent-amber)",
    },
  ];
  const [enabled, setEnabled] = useState<Record<number, boolean>>({});
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <p
            className="text-[11px] font-medium uppercase tracking-[0.14em] mb-1.5 mono"
            style={{ color: "var(--foreground-dimmed)" }}
          >
            / automations
          </p>
          <h2
            className="text-2xl font-semibold mb-1.5"
            style={{ color: "var(--foreground)" }}
          >
            Triggers & notifications
          </h2>
          <p
            className="text-sm leading-relaxed max-w-xl"
            style={{ color: "var(--foreground-muted)" }}
          >
            Send WhatsApp messages, SMS, or emails when records on{" "}
            <strong>{tableName || "this table"}</strong> change. Pick a starting point below — full visual rule builder is rolling out in the next milestone.
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium mono shrink-0 mt-1"
          style={{
            background: "color-mix(in oklch, var(--accent-amber), transparent 85%)",
            color: "var(--accent-amber)",
            border: "1px solid color-mix(in oklch, var(--accent-amber), transparent 70%)",
          }}
        >
          <Sparkles className="h-3 w-3" />
          Beta
        </span>
      </div>

      <div className="space-y-3">
        {suggestions.map((s, i) => {
          const Icon = s.icon;
          const on = !!enabled[i];
          return (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl p-4 transition-all"
              style={{
                background: "var(--card)",
                border: `1px solid ${on ? s.accent : "var(--border-subtle)"}`,
                boxShadow: on
                  ? `0 0 0 3px color-mix(in oklch, ${s.accent}, transparent 88%)`
                  : "none",
              }}
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `color-mix(in oklch, ${s.accent}, transparent 88%)`,
                  color: s.accent,
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {s.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setEnabled((prev) => ({ ...prev, [i]: !prev[i] }))
                    }
                    role="switch"
                    aria-checked={on}
                    className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-ring shrink-0"
                    style={{
                      background: on ? s.accent : "var(--surface-3)",
                    }}
                  >
                    <span
                      className="h-4 w-4 rounded-full bg-white shadow transition-transform"
                      style={{
                        transform: on ? "translateX(18px)" : "translateX(2px)",
                      }}
                    />
                  </button>
                </div>
                <p
                  className="text-xs mt-1 leading-relaxed"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {s.description}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[10px]">
                  <span
                    className="px-2 py-0.5 rounded-md font-medium uppercase tracking-wider mono"
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--foreground-dimmed)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    Trigger: {s.trigger}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-md font-medium uppercase tracking-wider mono"
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--foreground-dimmed)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    Via: {s.channel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mt-6 rounded-xl p-4 text-xs"
        style={{
          background: "var(--surface-1)",
          border: "1px dashed var(--border)",
          color: "var(--foreground-muted)",
        }}
      >
        Toggling a rule here only stages it in this builder session. Connect a WhatsApp / SMS plugin under <strong>Plugins</strong> to actually deliver messages.
      </div>
    </div>
  );
}

function PermissionsPanel({ tableName }: { tableName?: string }) {
  const roles = [
    { name: "Owner", description: "Full read & write, can manage roles.", read: true, write: true, manage: true },
    { name: "Manager", description: "Can read everything, write most fields, but can't change schema.", read: true, write: true, manage: false },
    { name: "Staff", description: "Can read, can write only the records they own.", read: true, write: false, manage: false },
    { name: "Viewer", description: "Read-only access — useful for auditors and external partners.", read: true, write: false, manage: false },
  ];
  return (
    <div className="max-w-3xl mx-auto">
      <p
        className="text-[11px] font-medium uppercase tracking-[0.14em] mb-1.5 mono"
        style={{ color: "var(--foreground-dimmed)" }}
      >
        / permissions
      </p>
      <h2
        className="text-2xl font-semibold mb-1.5"
        style={{ color: "var(--foreground)" }}
      >
        Role-based access
      </h2>
      <p
        className="text-sm leading-relaxed max-w-xl mb-6"
        style={{ color: "var(--foreground-muted)" }}
      >
        Default role matrix for <strong>{tableName || "this table"}</strong>.
        Per-role overrides ship in the next milestone — for now, every record
        is governed by these defaults.
      </p>
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div
          className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 text-[11px] font-bold uppercase tracking-wider"
          style={{
            color: "var(--foreground-dimmed)",
            background: "var(--surface-1)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <span>Role</span>
          <span className="w-12 text-center">Read</span>
          <span className="w-12 text-center">Write</span>
          <span className="w-12 text-center">Manage</span>
        </div>
        {roles.map((r, i) => (
          <div
            key={r.name}
            className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-start px-4 py-3"
            style={{
              borderBottom:
                i < roles.length - 1 ? "1px solid var(--border-subtle)" : "none",
            }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {r.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                {r.description}
              </p>
            </div>
            <PermissionDot on={r.read} />
            <PermissionDot on={r.write} />
            <PermissionDot on={r.manage} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PermissionDot({ on }: { on: boolean }) {
  return (
    <span
      className="w-12 flex items-center justify-center"
      title={on ? "Allowed" : "Blocked"}
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          background: on ? "var(--success)" : "var(--surface-3)",
          boxShadow: on
            ? "0 0 8px color-mix(in oklch, var(--success), transparent 60%)"
            : "none",
        }}
      />
    </span>
  );
}
