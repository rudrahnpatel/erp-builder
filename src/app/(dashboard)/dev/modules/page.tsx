"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Trash2,
  Camera,
  Globe,
  GlobeLock,
  Database,
  FileText,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DevModeGate } from "@/components/layout/DevModeGate";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ModuleItem {
  id: string;
  packId: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  version: string;
  published: boolean;
  tableCount: number;
  pageCount: number;
  updatedAt: string;
  createdAt: string;
}

import { useRouter } from "next/navigation";

export default function MyModulesPage() {
  const router = useRouter();
  const { data, mutate, isLoading } = useSWR("/api/dev/modules", fetcher);
  const modules: ModuleItem[] = data?.modules || [];

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [snapshotting, setSnapshotting] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/dev/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Module "${data.module.name}" created`, {
          description: `Pack ID: ${data.module.packId}`,
        });
        setCreateOpen(false);
        setNewName("");
        setNewDesc("");
        mutate();
      } else {
        toast.error(data.error || "Failed to create module");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setCreating(false);
    }
  };

  const handleSnapshot = async (mod: ModuleItem, publish: boolean) => {
    setSnapshotting(mod.id);
    const pending = toast.loading(
      publish ? `Publishing ${mod.name}…` : `Snapshotting ${mod.name}…`
    );
    try {
      const res = await fetch(`/api/dev/modules/${mod.id}/snapshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message, {
          id: pending,
          description: `${data.snapshot.tables} tables, ${data.snapshot.pages} pages → v${data.version}`,
        });
        mutate();
      } else {
        toast.error(data.error || "Snapshot failed", { id: pending });
      }
    } catch {
      toast.error("Network error", { id: pending });
    } finally {
      setSnapshotting(null);
    }
  };

  const handleDelete = async (mod: ModuleItem) => {
    if (!confirm(`Delete module "${mod.name}"? This only removes the definition, not any installed copies.`)) return;
    const pending = toast.loading(`Deleting ${mod.name}…`);
    try {
      const res = await fetch(`/api/dev/modules/${mod.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Module "${mod.name}" deleted`, { id: pending });
        mutate();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Delete failed", { id: pending });
      }
    } catch {
      toast.error("Network error", { id: pending });
    }
  };

  return (
    <DevModeGate>
      <div className="space-y-8 max-w-6xl mx-auto animate-fade-in-up">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p
              className="text-[11px] font-medium uppercase tracking-[0.14em] mb-2 mono"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              / developer · modules
            </p>
            <h1
              className="text-3xl sm:text-4xl font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              My Modules
            </h1>
            <p
              className="mt-2 max-w-2xl text-sm leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              Create modules, design their pages and tables with the GUI builders,
              then snapshot &amp; publish so other workspaces can install them.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-2 font-semibold shrink-0 pressable"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
              color: "var(--primary-foreground)",
              boxShadow: "0 2px 8px color-mix(in oklch, var(--primary), transparent 60%)",
            }}
          >
            <Plus className="h-4 w-4" /> New Module
          </Button>
        </header>

        {/* Module Grid */}
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl p-5 animate-pulse"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border-subtle)",
                  height: "200px",
                }}
              />
            ))}
          </div>
        ) : modules.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              background: "var(--surface-1)",
              border: "1px dashed var(--border)",
            }}
          >
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--surface-2)", color: "var(--foreground-muted)" }}
            >
              <Package className="h-6 w-6" />
            </div>
            <h3
              className="text-base font-semibold mb-1"
              style={{ color: "var(--foreground)" }}
            >
              No modules yet
            </h3>
            <p
              className="text-sm mb-5 max-w-sm mx-auto"
              style={{ color: "var(--foreground-muted)" }}
            >
              Create your first module, then use the Page Builder and Table
              Designer to add content. When you're ready, snapshot &amp; publish
              to the marketplace.
            </p>
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Create First Module
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 stagger-children">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="rounded-xl p-5 space-y-4 relative overflow-hidden group transition-all duration-200"
                style={{
                  background: "var(--surface-1)",
                  border: `1px solid ${mod.published ? "color-mix(in oklch, var(--accent-emerald), transparent 55%)" : "var(--border-subtle)"}`,
                }}
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: mod.published
                        ? "linear-gradient(135deg, var(--accent-emerald), var(--primary))"
                        : "var(--surface-2)",
                      color: mod.published ? "#fff" : "var(--foreground-muted)",
                      boxShadow: mod.published
                        ? "0 2px 8px color-mix(in oklch, var(--accent-emerald), transparent 60%)"
                        : "none",
                    }}
                  >
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
                        {mod.name}
                      </h3>
                      <span
                        className="text-[9px] font-bold px-1.5 py-[1px] rounded-full mono shrink-0"
                        style={{
                          background: "var(--surface-3)",
                          color: "var(--foreground-dimmed)",
                        }}
                      >
                        v{mod.version}
                      </span>
                    </div>
                    <p className="text-[10px] mono" style={{ color: "var(--foreground-dimmed)" }}>
                      {mod.packId}
                    </p>
                  </div>
                  {/* Published badge */}
                  {mod.published ? (
                    <Globe className="h-4 w-4 shrink-0" style={{ color: "var(--accent-emerald)" }} />
                  ) : (
                    <GlobeLock className="h-4 w-4 shrink-0" style={{ color: "var(--foreground-dimmed)" }} />
                  )}
                </div>

                {mod.description && (
                  <p
                    className="text-xs leading-relaxed line-clamp-2"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {mod.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--foreground-dimmed)" }}>
                  <span className="flex items-center gap-1.5">
                    <Database className="h-3 w-3" style={{ color: "var(--accent-blue)" }} />
                    {mod.tableCount} tables
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3 w-3" style={{ color: "var(--accent-violet)" }} />
                    {mod.pageCount} pages
                  </span>
                  <span className="flex items-center gap-1.5">
                    {mod.published ? (
                      <><span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent-emerald)", boxShadow: "0 0 6px var(--accent-emerald)" }} /> Published</>
                    ) : (
                      <><span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--foreground-dimmed)" }} /> Draft</>
                    )}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={() => router.push(`/dev/modules/${mod.id}/pages`)}
                    >
                      <FileText className="h-3 w-3" /> Pages ({mod.pageCount})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={() => router.push(`/dev/modules/${mod.id}/tables`)}
                    >
                      <Database className="h-3 w-3" /> Tables ({mod.tableCount})
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 text-xs font-medium"
                      disabled={snapshotting === mod.id}
                      onClick={() => handleSnapshot(mod, false)}
                      variant="outline"
                    >
                      {snapshotting === mod.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Camera className="h-3 w-3" />
                      )}
                      Snapshot
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 text-xs font-semibold pressable"
                      disabled={snapshotting === mod.id}
                      onClick={() => handleSnapshot(mod, true)}
                      style={{
                        background: "linear-gradient(135deg, var(--accent-emerald), color-mix(in oklch, var(--accent-emerald), var(--primary) 30%))",
                        color: "#fff",
                        boxShadow: "0 2px 8px color-mix(in oklch, var(--accent-emerald), transparent 60%)",
                      }}
                    >
                      {snapshotting === mod.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      {mod.published ? "Re-publish" : "Publish"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="px-2"
                      onClick={() => handleDelete(mod)}
                    >
                      <Trash2 className="h-3.5 w-3.5" style={{ color: "var(--danger)" }} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How it works */}
        <aside
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "linear-gradient(180deg, var(--surface-2), var(--surface-1))",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <h2
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--foreground)" }}
          >
            How module authoring works
          </h2>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { step: "1", title: "Create module", desc: "Give it a name and description" },
              { step: "2", title: "Design content", desc: "Build pages and tables tagged with this module" },
              { step: "3", title: "Snapshot", desc: "Capture current workspace state into module definition" },
              { step: "4", title: "Publish", desc: "Make it available for all workspaces to install" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <span
                  className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{
                    background: "color-mix(in oklch, var(--primary), transparent 88%)",
                    color: "var(--primary)",
                  }}
                >
                  {s.step}
                </span>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{s.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--foreground-dimmed)" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new module</DialogTitle>
            <DialogDescription>
              Define a module name and description. You'll then use the Page Builder and Table
              Designer to populate it with content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
                Module Name *
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Sales CRM, Fleet Tracker…"
                autoFocus
              />
              {newName.trim() && (
                <p className="text-[10px] mono" style={{ color: "var(--foreground-dimmed)" }}>
                  Pack ID: {newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
                Description
              </label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What does this module do? Who is it for?"
                rows={3}
                className="w-full text-sm px-3 py-2 rounded-lg outline-none resize-none"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--foreground)",
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="gap-2"
            >
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Create Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DevModeGate>
  );
}
