"use client";

import { useState, use, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

const fieldTypes = [
  { value: "TEXT", label: "Text", color: "var(--accent-blue)" },
  { value: "NUMBER", label: "Number", color: "var(--accent-emerald)" },
  { value: "DATE", label: "Date", color: "var(--accent-amber)" },
  { value: "SINGLE_SELECT", label: "Select", color: "var(--accent-violet)" },
  { value: "CURRENCY", label: "Currency", color: "var(--accent-rose)" },
  { value: "RELATION", label: "Relation", color: "oklch(0.60 0.18 270)" },
  { value: "PHONE", label: "Phone", color: "var(--accent-cyan)" },
  { value: "EMAIL", label: "Email", color: "oklch(0.65 0.15 210)" },
  { value: "CHECKBOX", label: "Checkbox", color: "var(--foreground-muted)" },
  { value: "TIME", label: "Time", color: "oklch(0.72 0.14 55)" },
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

  return (
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
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
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
            disabled={isSaving}
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
            {[
              { label: "Data Schema", icon: Database, active: true },
              { label: "Automations", icon: Settings2, active: false },
              { label: "Permissions", icon: Lock, active: false },
            ].map((nav) => (
              <button
                key={nav.label}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200"
                style={{
                  background: nav.active ? "var(--primary-subtle)" : "transparent",
                  color: nav.active ? "var(--primary)" : "var(--foreground-muted)",
                  fontWeight: nav.active ? 600 : 400,
                }}
              >
                <nav.icon className="h-4 w-4" />
                {nav.label}
              </button>
            ))}
          </div>

          {/* Field list */}
          <div className="px-4 py-3 space-y-2">
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
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ background: "var(--background)" }}>
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
                    style={{ background: "oklch(0.60 0.18 270)" }}
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
        </div>
      </div>
    </div>
  );
}
