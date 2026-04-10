"use client";

import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  GripVertical,
  Settings2,
  Trash2,
  ChevronDown,
  Database,
  Eye,
  Save,
} from "lucide-react";

const fieldTypes = [
  { value: "TEXT", label: "Text", color: "bg-blue-100 text-blue-700" },
  { value: "NUMBER", label: "Number", color: "bg-emerald-100 text-emerald-700" },
  { value: "DATE", label: "Date", color: "bg-amber-100 text-amber-700" },
  { value: "SINGLE_SELECT", label: "Select", color: "bg-purple-100 text-purple-700" },
  { value: "CURRENCY", label: "Currency", color: "bg-rose-100 text-rose-700" },
  { value: "RELATION", label: "Relation", color: "bg-indigo-100 text-indigo-700" },
  { value: "PHONE", label: "Phone", color: "bg-teal-100 text-teal-700" },
  { value: "EMAIL", label: "Email", color: "bg-cyan-100 text-cyan-700" },
  { value: "CHECKBOX", label: "Checkbox", color: "bg-gray-100 text-gray-700" },
  { value: "TIME", label: "Time", color: "bg-orange-100 text-orange-700" },
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
  { "Product Name": "Cardboard Box 12x12", SKU: "CB-012", Price: "₹25.00", Category: "Packaging", Supplier: "Sharma & Sons" },
  { "Product Name": "Turmeric Powder 500g", SKU: "TP-500", Price: "₹95.00", Category: "Finished Goods", Supplier: "Krishna Traders" },
];

export default function SchemaDesignerPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = use(params);
  const [fields, setFields] = useState<FieldItem[]>(initialFields);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const addField = () => {
    const newField: FieldItem = {
      id: String(Date.now()),
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
  };

  const getTypeInfo = (type: string) =>
    fieldTypes.find((t) => t.value === type) || fieldTypes[0];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col -m-4 sm:-m-6">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#e2e8f0] bg-white">
        <div className="flex items-center gap-3">
          <p className="text-xs text-[#64748b]">
            Modules &gt; <span className="text-[#2b3437] font-medium">Product Table</span> &gt; Schema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" /> Save Draft
          </Button>
          <Button size="sm" className="gap-1.5 text-xs">
            Publish Schema
          </Button>
        </div>
      </div>

      {/* Split panels */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left: Field Editor */}
        <div className="w-full lg:w-[360px] border-b lg:border-b-0 lg:border-r border-[#e2e8f0] bg-white overflow-y-auto max-h-[40vh] lg:max-h-none">
          <div className="p-5 border-b border-[#f1f4f6]">
            <h2 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1">
              Structure
            </h2>
            <h3 className="text-lg font-bold text-[#2b3437]">Product Table</h3>
          </div>

          {/* Navigation */}
          <div className="px-4 py-3 space-y-0.5">
            {[
              { label: "Data Schema", icon: Database, active: true },
              { label: "Automations", icon: Settings2, active: false },
              { label: "Permissions", icon: Eye, active: false },
            ].map((nav) => (
              <button
                key={nav.label}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all ${
                  nav.active
                    ? "bg-primary text-white font-medium"
                    : "text-[#64748b] hover:bg-[#f1f4f6]"
                }`}
              >
                <nav.icon className="h-4 w-4" />
                {nav.label}
              </button>
            ))}
          </div>

          {/* Field list */}
          <div className="px-4 py-3 space-y-2">
            {fields.map((field) => (
              <div
                key={field.id}
                onClick={() => setSelectedField(field.id)}
                className={`group flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedField === field.id
                    ? "border-primary/30 bg-primary/5 shadow-sm"
                    : "border-transparent hover:border-[#e2e8f0] hover:bg-[#f8f9fa]"
                }`}
              >
                <GripVertical className="h-4 w-4 text-[#cbd5e1] shrink-0" />
                <div className="flex-1 min-w-0">
                  <Input
                    value={field.name}
                    onChange={(e) =>
                      updateField(field.id, { name: e.target.value })
                    }
                    className="h-7 text-sm font-medium border-0 p-0 shadow-none focus-visible:ring-0 bg-transparent"
                  />
                </div>
                <Badge
                  className={`text-[10px] font-medium px-2 py-0.5 ${
                    getTypeInfo(field.type).color
                  } border-0`}
                >
                  {getTypeInfo(field.type).label}
                </Badge>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeField(field.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5 text-[#ef4444]" />
                </button>
              </div>
            ))}

            <button
              onClick={addField}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-[#cbd5e1] text-sm text-[#64748b] hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
            >
              <Plus className="h-4 w-4" /> Add New Field
            </button>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="flex-1 bg-[#f8f9fa] overflow-y-auto p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-4 w-4 text-[#64748b]" />
            <h3 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider">
              Live Preview
            </h3>
          </div>

          <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-[#f1f4f6]">
                  {fields.map((field) => (
                    <th
                      key={field.id}
                      className="text-left px-4 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider"
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
                    className="border-b last:border-0 border-[#f1f4f6] hover:bg-[#f8f9fa] transition-colors"
                  >
                    {fields.map((field) => {
                      const value =
                        (row as Record<string, string>)[field.name] || "—";
                      return (
                        <td
                          key={field.id}
                          className="px-4 py-3 text-[#2b3437]"
                        >
                          {field.type === "RELATION" ? (
                            <span className="text-primary hover:underline cursor-pointer">
                              {value}
                            </span>
                          ) : field.type === "SINGLE_SELECT" ? (
                            <Badge
                              variant="secondary"
                              className="text-xs font-normal"
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

            {/* Table footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#f1f4f6] text-xs text-[#64748b]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {fields.length} columns
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  {fields.filter((f) => f.type === "RELATION").length} relation
                </span>
              </div>
              <span className="text-[#94a3b8]">Draft (unsaved)</span>
            </div>
          </div>

          {/* Floating add button */}
          <div className="fixed bottom-8 right-8">
            <Button
              onClick={addField}
              size="lg"
              className="rounded-full h-12 w-12 p-0 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
