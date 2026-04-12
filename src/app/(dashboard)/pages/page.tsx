"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/use-workspace";
import {
  FileText,
  LayoutDashboard,
  Activity,
  Trash2,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PagesPage() {
  const router = useRouter();
  const { workspace, refetch } = useWorkspace();

  const pages = workspace?.pages || [];

  const handleDeletePage = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    const pending = toast.loading("Deleting page...");
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Page deleted", { id: pending });
        await refetch();
      } else {
        toast.error("Failed to delete page", { id: pending });
      }
    } catch (e) {
      toast.error("Network error", { id: pending });
    }
  };

  if (!workspace) return null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in-up">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p
            className="text-[11px] font-medium uppercase tracking-[0.14em] mb-2 mono"
            style={{ color: "var(--foreground-dimmed)" }}
          >
            / builder · pages
          </p>
          <h1
            className="text-3xl sm:text-4xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Manage Pages
          </h1>
          <p
            className="mt-2 max-w-2xl text-sm sm:text-base leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Create and edit custom dashboard pages for your workers. Drag and drop
            blocks to build views for data entry, reporting, and management.
          </p>
        </div>
      </header>

      {/* Pages Grid */}
      {pages.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 stagger-children">
          {pages.map((page) => (
            <div
              key={page.id}
              className="group relative flex flex-col justify-between rounded-xl transition-all duration-300 card-interactive cursor-pointer overflow-hidden"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border-subtle)",
              }}
              onClick={() => router.push(`/pages/${page.id}/edit`)}
            >
              {/* Subtle top gradient */}
              <div
                className="h-1.5 w-full transition-colors duration-300"
                style={{
                  background: page.packSource 
                    ? "var(--primary-subtle)" 
                    : "var(--accent-amber)",
                }}
              />
              
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: "var(--surface-3)",
                      color: "var(--foreground)",
                    }}
                  >
                    {page.icon ? (
                      <span className="text-xl">{page.icon}</span>
                    ) : (
                      <LayoutDashboard className="h-5 w-5" />
                    )}
                  </div>
                  
                  {/* Actions wrapper (click propagation stopped) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="p-1.5 hover:bg-surface-3 rounded-md text-muted-foreground transition-colors"
                      onClick={() => router.push(`/pages/${page.id}/edit`)}
                      title="Edit Page"
                    >
                      <PenLine className="h-4 w-4" />
                    </button>
                    {!page.packSource && (
                      <button
                        className="p-1.5 hover:bg-danger-subtle text-danger rounded-md transition-colors"
                        onClick={() => handleDeletePage(page.id, page.title)}
                        title="Delete Page"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h3
                  className="text-base font-semibold mb-1 truncate"
                  style={{ color: "var(--foreground)" }}
                >
                  {page.title}
                </h3>
                
                <div className="flex items-center gap-3 mt-4">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    <Activity className="h-3.5 w-3.5" />
                    Active
                  </span>
                  
                  {page.packSource && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
                      style={{ 
                        background: "var(--surface-3)", 
                        color: "var(--foreground-dimmed)",
                        border: "1px solid var(--border-subtle)"
                      }}
                    >
                      Installed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            background: "var(--surface-1)",
            border: "1px dashed var(--border)",
          }}
        >
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "var(--surface-2)",
              color: "var(--foreground-muted)",
            }}
          >
            <FileText className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3
            className="text-base font-semibold mb-1"
            style={{ color: "var(--foreground)" }}
          >
            No pages built yet
          </h3>
          <p
            className="text-sm mb-5 max-w-sm mx-auto"
            style={{ color: "var(--foreground-muted)" }}
          >
            Install modules from the marketplace to get pre-built operational dashboards and pages.
          </p>
          <Button
            onClick={() => router.push('/modules')}
            className="bg-primary text-primary-foreground text-sm"
          >
            Browse Marketplace
          </Button>
        </div>
      )}
    </div>
  );
}
