"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/use-workspace";
import { DevModeGate } from "@/components/layout/DevModeGate";
import {
  Database,
  Plus,
  Loader2,
  Package,
  Trash2,
  PenLine,
  Layers,
  Table2,
  Rows3,
  Search,
  ArrowUpRight,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TablesPage() {
  const router = useRouter();
  const { workspace, refetch } = useWorkspace();

  const tables = workspace?.tables || [];

  const [creatingTable, setCreatingTable] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const createInputRef = useRef<HTMLInputElement>(null);

  // Inline rename state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (showCreateInput && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [showCreateInput]);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const filteredTables = tables.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTable = async () => {
    const name = newTableName.trim();
    if (!name) {
      toast.error("Table name cannot be empty");
      return;
    }
    setCreatingTable(true);
    const pending = toast.loading("Creating table...");
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        const table = await res.json();
        toast.success(`"${name}" created`, { id: pending });
        setNewTableName("");
        setShowCreateInput(false);
        await refetch();
        router.push(`/schema/${table.id}`);
      } else {
        toast.error("Failed to create table", { id: pending });
      }
    } catch {
      toast.error("Network error", { id: pending });
    } finally {
      setCreatingTable(false);
    }
  };

  const handleRename = async (id: string) => {
    const name = renameValue.trim();
    if (!name) {
      setRenamingId(null);
      return;
    }
    const pending = toast.loading("Renaming...");
    try {
      const res = await fetch(`/api/tables/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        toast.success("Table renamed", { id: pending });
        await refetch();
      } else {
        toast.error("Failed to rename", { id: pending });
      }
    } catch {
      toast.error("Network error", { id: pending });
    } finally {
      setRenamingId(null);
    }
  };

  const handleDeleteTable = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? All records will be permanently lost.`))
      return;

    const pending = toast.loading("Deleting table...");
    try {
      const res = await fetch(`/api/tables/${id}`, { method: "DELETE" });

      if (res.ok) {
        toast.success("Table deleted", { id: pending });
        await refetch();
      } else {
        toast.error("Failed to delete table", { id: pending });
      }
    } catch {
      toast.error("Network error", { id: pending });
    }
  };

  if (!workspace) return null;

  return (
    <DevModeGate>
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in-up">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            Manage Tables
          </h1>
          <p
            className="mt-2 max-w-2xl text-sm sm:text-base leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Create, edit, and organise your data tables. Each table stores structured
            records that power your pages and dashboards.
          </p>
        </div>
        <Button
          onClick={() => {
            if (showCreateInput) {
              handleCreateTable();
            } else {
              setShowCreateInput(true);
            }
          }}
          disabled={creatingTable}
          className="gap-2 font-semibold shrink-0 rounded-xl pressable"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
            color: "var(--primary-foreground)",
            boxShadow: "0 2px 8px color-mix(in oklch, var(--primary), transparent 65%)",
          }}
        >
          {creatingTable ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
          ) : (
            <><Plus className="h-4 w-4" /> New Table</>
          )}
        </Button>
      </header>

      {/* ── Inline Create Row ── */}
      {showCreateInput && (
        <div
          className="flex items-center gap-3 px-5 py-3.5 rounded-xl animate-fade-in-up"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--primary)",
            boxShadow: "0 0 0 3px var(--primary-glow)",
          }}
        >
          <Database className="h-5 w-5 shrink-0" style={{ color: "var(--primary)" }} />
          <input
            ref={createInputRef}
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateTable();
              if (e.key === "Escape") {
                setShowCreateInput(false);
                setNewTableName("");
              }
            }}
            placeholder="Enter table name…"
            className="flex-1 bg-transparent border-0 text-sm outline-none"
            style={{ color: "var(--foreground)" }}
          />
          <button
            onClick={handleCreateTable}
            disabled={creatingTable}
            className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            {creatingTable ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => {
              setShowCreateInput(false);
              setNewTableName("");
            }}
            className="h-7 w-7 rounded-lg flex items-center justify-center hover-bg-subtle"
            style={{ color: "var(--foreground-muted)" }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Search (shown when tables exist) ── */}
      {tables.length > 0 && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <Search className="h-4 w-4" style={{ color: "var(--foreground-dimmed)" }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tables…"
            className="flex-1 bg-transparent border-0 text-sm outline-none"
            style={{ color: "var(--foreground)" }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="h-6 w-6 rounded-md flex items-center justify-center hover-bg-subtle"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* ── Tables Grid ── */}
      {filteredTables.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className="group relative flex flex-col justify-between rounded-xl transition-all duration-300 card-interactive cursor-pointer overflow-hidden"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border-subtle)",
              }}
              onClick={() => router.push(`/schema/${table.id}`)}
            >
              {/* Top accent bar */}
              <div
                className="h-[3px] w-full"
                style={{
                  background: table.packSource
                    ? "var(--accent-emerald)"
                    : "var(--accent-blue)",
                }}
              />

              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: table.packSource
                        ? "color-mix(in oklch, var(--accent-emerald), transparent 85%)"
                        : "color-mix(in oklch, var(--accent-blue), transparent 85%)",
                      color: table.packSource
                        ? "var(--accent-emerald)"
                        : "var(--accent-blue)",
                    }}
                  >
                    <Database className="h-5 w-5" />
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="p-1.5 rounded-lg hover-bg-subtle focus-ring"
                      style={{ color: "var(--foreground-muted)" }}
                      onClick={() => {
                        setRenamingId(table.id);
                        setRenameValue(table.name);
                      }}
                      title="Rename Table"
                    >
                      <PenLine className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg hover-bg-subtle focus-ring"
                      style={{ color: "var(--foreground-muted)" }}
                      onClick={() => router.push(`/schema/${table.id}`)}
                      title="Edit Schema"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                    {!table.packSource && (
                      <button
                        className="p-1.5 rounded-lg transition-colors focus-ring"
                        style={{ color: "var(--danger)" }}
                        onClick={() => handleDeleteTable(table.id, table.name)}
                        title="Delete Table"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--danger-subtle)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Table name — inline rename */}
                {renamingId === table.id ? (
                  <div
                    className="flex items-center gap-2 mb-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      ref={renameInputRef}
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(table.id);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      onBlur={() => handleRename(table.id)}
                      className="text-[15px] font-semibold bg-transparent border-0 p-0 outline-none flex-1 min-w-0"
                      style={{
                        color: "var(--foreground)",
                        borderBottom: "2px solid var(--primary)",
                      }}
                    />
                  </div>
                ) : (
                  <h3
                    className="text-[15px] font-semibold mb-1 truncate"
                    style={{ color: "var(--foreground)" }}
                  >
                    {table.name}
                  </h3>
                )}

                {/* Stats pills */}
                <div className="flex items-center gap-3 mt-4">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs"
                    style={{ color: "var(--foreground-dimmed)" }}
                  >
                    <Layers className="h-3 w-3" />
                    {table.fieldCount} fields
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 text-xs"
                    style={{ color: "var(--foreground-dimmed)" }}
                  >
                    <Rows3 className="h-3 w-3" />
                    {table.recordCount} records
                  </span>

                  {table.packSource && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ml-auto"
                      style={{
                        background:
                          "color-mix(in oklch, var(--accent-emerald), transparent 88%)",
                        color: "var(--accent-emerald)",
                        border:
                          "1px solid color-mix(in oklch, var(--accent-emerald), transparent 75%)",
                      }}
                    >
                      <Package className="h-2.5 w-2.5" />
                      Module
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tables.length > 0 && filteredTables.length === 0 ? (
        /* No search results state */
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            background: "var(--surface-1)",
            border: "2px dashed var(--border)",
          }}
        >
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "var(--surface-2)",
              color: "var(--foreground-muted)",
            }}
          >
            <Search className="h-6 w-6" />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            No tables found
          </h3>
          <p
            className="text-sm max-w-sm mx-auto leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            No tables match &quot;{searchQuery}&quot;. Try a different search term.
          </p>
        </div>
      ) : (
        /* Empty state */
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            background: "var(--surface-1)",
            border: "2px dashed var(--border)",
          }}
        >
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{
              background: "var(--surface-2)",
              color: "var(--foreground-muted)",
            }}
          >
            <Table2 className="h-7 w-7" aria-hidden="true" />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            No tables yet
          </h3>
          <p
            className="text-sm mb-6 max-w-sm mx-auto leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Create a custom data table from scratch or install modules from the
            marketplace to get pre-built tables with fields and sample data.
          </p>
          <div className="flex items-center gap-3 justify-center">
            <Button
              onClick={() => setShowCreateInput(true)}
              disabled={creatingTable}
              className="gap-2 font-semibold rounded-xl pressable"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                color: "var(--primary-foreground)",
                boxShadow:
                  "0 2px 8px color-mix(in oklch, var(--primary), transparent 65%)",
              }}
            >
              <Plus className="h-4 w-4" /> Create Table
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/modules")}
              className="text-sm rounded-xl"
            >
              Browse Marketplace
            </Button>
          </div>
        </div>
      )}
    </div>
    </DevModeGate>
  );
}
