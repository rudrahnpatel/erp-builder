"use client";

import { use, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Table2, Plus, Search, Layers, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface FieldItem {
  id: string;
  name: string;
  type: string;
  required: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Runtime record view — shows rows of a single table inside a tenant's ERP.
 * Ported from the old /erp/[tableId] preview that lived under the builder
 * layout. This version lives under /apps/[slug] and is the real end-user view.
 */
export default function TenantTableView({
  params,
}: {
  params: Promise<{ slug: string; tableId: string }>;
}) {
  const { slug, tableId } = use(params);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: table, error: tableError } = useSWR(
    `/api/tables/${tableId}`,
    fetcher,
    { keepPreviousData: true }
  );
  const { data: recordsData, mutate: refreshRecords } = useSWR(
    table
      ? `/api/tables/${tableId}/records?search=${encodeURIComponent(search)}`
      : null,
    fetcher,
    { keepPreviousData: true }
  );

  const fields: FieldItem[] = table?.fields || [];
  const records = recordsData?.records || [];

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await fetch(`/api/tables/${tableId}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: formData }),
    });
    setFormData({});
    setIsAdding(false);
    setIsSaving(false);
    refreshRecords();
  };

  if (!table && !tableError) {
    return (
      <div className="h-full flex flex-col animate-fade-in-up">
        {/* Top Bar Skeleton */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center gap-3">
            <div className="skeleton h-8 w-8 rounded-lg" />
            <div>
              <div className="skeleton h-4 w-32 mb-1" />
              <div className="skeleton h-3 w-16" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="skeleton h-8 w-[200px] rounded-md" />
            <div className="skeleton h-8 w-[100px] rounded-md" />
          </div>
        </div>
        
        {/* Main View Skeleton */}
        <div className="flex-1 p-4 sm:p-6" style={{ background: "var(--background)" }}>
          <div className="rounded-xl overflow-hidden border shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}>
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--surface-1)" }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <th key={i} className="px-4 py-3"><div className="skeleton h-4 w-24 rounded" /></th>
                    ))}
                  </tr>
                </thead>
                <tbody className="stagger-children">
                  {[1, 2, 3, 4, 5, 6].map((row) => (
                    <tr key={row} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      {[1, 2, 3, 4, 5].map((col) => (
                        <td key={col} className="px-4 py-4"><div className="skeleton h-4 w-full max-w-[120px] rounded" /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 border-b shrink-0 glass"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href={`/apps/${slug}`}
            className="text-muted-foreground hover:text-foreground transition-colors mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--primary-subtle)", color: "var(--primary)" }}
          >
            <Table2 className="h-4 w-4" />
          </div>
          <div>
            <h1
              className="font-bold text-sm"
              style={{ color: "var(--foreground)" }}
            >
              {table?.name}
            </h1>
            <p
              className="text-[10px]"
              style={{ color: "var(--foreground-muted)" }}
            >
              {recordsData?.total || 0} records
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2"
              style={{ color: "var(--foreground-muted)" }}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search data..."
              className="h-8 pl-8 text-xs w-[200px]"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border-subtle)",
              }}
            />
          </div>
          <Button
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-1.5 text-xs h-8"
          >
            <Plus className="h-3.5 w-3.5" /> Add Record
          </Button>
        </div>
      </div>

      {/* Main View */}
      <div
        className="flex-1 overflow-auto p-4 sm:p-6"
        style={{ background: "var(--background)" }}
      >
        {isAdding && (
          <form
            onSubmit={handleAddSubmit}
            className="mb-6 p-5 rounded-xl border"
            style={{
              background: "var(--card)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> New Record
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.map((field) => (
                <div key={field.id}>
                  <label
                    className="text-xs font-medium mb-1.5 block"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {field.name}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <Input
                    required={field.required}
                    value={formData[field.id] || ""}
                    placeholder={`Enter ${field.name}`}
                    className="text-sm h-9"
                    onChange={(e) =>
                      setFormData({ ...formData, [field.id]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Record"}
              </Button>
            </div>
          </form>
        )}

        <div
          className="rounded-xl overflow-hidden border shadow-sm"
          style={{
            background: "var(--card)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    background: "var(--surface-1)",
                  }}
                >
                  {fields.map((field) => (
                    <th
                      key={field.id}
                      className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--foreground-dimmed)" }}
                    >
                      {field.name}
                    </th>
                  ))}
                  <th className="px-4 py-3 w-[100px]"></th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={fields.length + 1}
                      className="py-12 text-center text-muted-foreground text-sm"
                    >
                      No records found {search && "matching your search."}
                    </td>
                  </tr>
                ) : (
                  records.map((record: any, idx: number) => (
                    <tr
                      key={record.id}
                      className="transition-colors hover:bg-surface-3"
                      style={{
                        borderBottom:
                          idx < records.length - 1
                            ? "1px solid var(--border-subtle)"
                            : "none",
                      }}
                    >
                      {fields.map((field) => {
                        const val = record.data?.[field.id] || "—";
                        return (
                          <td
                            key={field.id}
                            className="px-4 py-3"
                            style={{ color: "var(--foreground)" }}
                          >
                            {field.type === "SINGLE_SELECT" ? (
                              <Badge
                                className="font-normal border-0 text-xs"
                                style={{ background: "var(--surface-2)" }}
                              >
                                {String(val)}
                              </Badge>
                            ) : field.type === "RELATION" ? (
                              <span className="text-primary hover:underline cursor-pointer">
                                {String(val)}
                              </span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
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

          <div
            className="p-3 border-t flex items-center justify-between text-xs"
            style={{
              borderColor: "var(--border-subtle)",
              color: "var(--foreground-muted)",
            }}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="h-3 w-3 text-primary" /> {fields.length} Columns
            </span>
            <span>Showing {records.length} records</span>
          </div>
        </div>
      </div>
    </div>
  );
}
