"use client";

import { use } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  Table2,
  Filter,
  BarChart3,
  Search,
  Plus,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableView } from "@/components/blocks/TableView";
import { KanbanView } from "@/components/blocks/KanbanView";
import { MetricCard } from "@/components/blocks/MetricCard";
import { ExportButton } from "@/components/blocks/ExportButton";
import { ImageBlock } from "@/components/blocks/ImageBlock";
import { GstCalculator } from "@/components/blocks/GstCalculator";
import { SettingsPage } from "@/components/app-runtime/SettingsPage";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const blockSizeStyle = (cfg: any): React.CSSProperties => {
  const widthPct = typeof cfg?.widthPct === "number" ? cfg.widthPct : 100;
  const heightPx = typeof cfg?.heightPx === "number" ? cfg.heightPx : undefined;
  const isFull = widthPct >= 99.5;
  return {
    flexBasis: isFull ? "100%" : `calc(${widthPct}% - 12px)`,
    maxWidth: "100%",
    minWidth: isFull ? undefined : "200px",
    height: heightPx ? `${heightPx}px` : undefined,
  };
};

/**
 * Runtime custom-page view. Renders blocks the merchant composed in the
 * builder's page composer. Ported from the old /erp/pages/[pageId] preview.
 */
export default function TenantCustomPage({
  params,
}: {
  params: Promise<{ slug: string; pageId: string }>;
}) {
  const { slug, pageId } = use(params);
  const { data: page, error } = useSWR(`/api/pages/${pageId}`, fetcher);

  if (!page && !error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Settings is a system page rendered with a hardcoded tabs UI (General /
  // Preferences / Users) rather than the block-based composer output. Users
  // tab replaces what used to be a standalone "User Management" page.
  if (page?.packPageKey === "settings") {
    return (
      <SettingsPage
        workspaceName={page.workspace?.name || page.title || "Workspace"}
        workspaceSlug={page.workspace?.slug || slug}
      />
    );
  }

  const blocks = Array.isArray(page?.blocks) ? page.blocks : [];

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "var(--background)" }}
    >
      <div
        className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b shrink-0"
        style={{
          borderColor: "var(--border-subtle)",
          background: "color-mix(in oklch, var(--surface-1), transparent 30%)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Link
          href={`/apps/${slug}`}
          className="p-1.5 rounded-lg hover-bg-subtle focus-ring transition-colors"
          style={{ color: "var(--foreground-muted)" }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span
          className="font-semibold text-[15px]"
          style={{ color: "var(--foreground)" }}
        >
          {page?.title || "Custom Page"}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-8">
        <div className="max-w-4xl mx-auto flex flex-wrap items-start gap-6">
          {blocks.length === 0 ? (
            <div
              className="text-center p-12 text-sm border-2 border-dashed rounded-xl basis-full"
              style={{
                borderColor: "var(--border-subtle)",
                color: "var(--foreground-muted)",
              }}
            >
              This page has no content blocks yet.
              <br />
              <Link
                href={`/pages/${pageId}/edit`}
                className="text-primary hover:underline mt-2 inline-block"
              >
                Edit this page in composer
              </Link>
            </div>
          ) : (
            blocks.map((block: any, index: number) => {
              const displayLabel = block.label || (block.config?.content) || block.type.replace("_", " ");
              return (
              <div
                key={block.id || `block-${index}`}
                className="rounded-xl overflow-hidden shadow-sm"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border-subtle)",
                  ...blockSizeStyle(block.config),
                }}
              >
                <div className="p-5">
                  {block.type === "TEXT" && (
                    <div className="space-y-1">
                      <h1
                        className="text-3xl font-bold tracking-tight"
                        style={{ color: "var(--foreground)" }}
                      >
                        {displayLabel}
                      </h1>
                      {block.config?.description && (
                        <p className="text-base mt-1 whitespace-pre-wrap" style={{ color: "var(--foreground-muted)" }}>
                          {block.config.description}
                        </p>
                      )}
                    </div>
                  )}

                  {block.type === "FILTER_BAR" && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 relative group w-full">
                        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                          type="text"
                          placeholder={`Search ${displayLabel}...`}
                          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-secondary/30 border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                        />
                      </div>
                      {block.config?.includeDateRange && (
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="relative">
                            <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                              type="date"
                              className="pl-8 pr-2 py-2 text-sm rounded-xl bg-secondary/30 border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">to</span>
                          <div className="relative">
                            <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                              type="date"
                              className="pl-8 pr-2 py-2 text-sm rounded-xl bg-secondary/30 border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>
                      )}
                      <Button variant="outline" className="gap-2 shrink-0 h-10 rounded-xl bg-background border-border/60 hover:bg-secondary/50">
                        <Filter className="h-4 w-4" /> Filter
                      </Button>
                    </div>
                  )}

                  {block.type === "METRIC" && (
                    <MetricCard
                      config={{ ...block.config, metricLabel: block.config?.metricLabel || displayLabel }}
                      tableId={block.config?.tableId}
                    />
                  )}

                  {block.type === "EXPORT_BUTTON" && (
                    <ExportButton config={block.config || {}} tableId={block.config?.tableId} />
                  )}

                  {block.type === "IMAGE" && (
                    <ImageBlock config={block.config || {}} />
                  )}

                  {block.type === "GST_CALCULATOR" && (
                    <GstCalculator config={block.config || {}} />
                  )}

                  {block.type === "TABLE_VIEW" && (
                    block.config?.tableId ? (
                      <TableView config={block.config} tableId={block.config.tableId} />
                    ) : (
                      <div className="p-10 border-2 border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-secondary/20">
                        <Table2 className="h-8 w-8 mb-3 opacity-40" />
                        <p className="text-sm font-medium">No table connected to this block.</p>
                      </div>
                    )
                  )}

                  {block.type === "CHART" && (
                    <div className="h-64 rounded-xl flex flex-col items-center justify-center text-sm bg-secondary/20 border border-border/40 text-muted-foreground/80 relative overflow-hidden group/chart">
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover/chart:opacity-100 transition-opacity" />
                      <BarChart3 className="h-10 w-10 mb-3 opacity-50" /> 
                      <span className="font-medium">{displayLabel}</span>
                      <span className="text-xs mt-1 opacity-70">Requires data source connection</span>
                    </div>
                  )}

                  {block.type === "KANBAN_VIEW" && (
                    block.config?.tableId ? (
                      <KanbanView config={block.config} tableId={block.config.tableId} />
                    ) : (
                      <div className="p-10 border-2 border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-secondary/20">
                        <Plus className="h-8 w-8 mb-3 opacity-40" />
                        <p className="text-sm font-medium">No table connected to this Kanban block.</p>
                      </div>
                    )
                  )}

                  {block.type === "FORM" && (
                    <div className="space-y-4 max-w-lg p-2">
                      <div className="space-y-1.5 mb-2">
                        <h3 className="text-lg font-bold text-foreground">{displayLabel || "New Entry Form"}</h3>
                        <p className="text-xs text-muted-foreground">Automatically generated from the selected table schema.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {["Product Name", "SKU Number"].map((label) => (
                          <div key={label} className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                              {label}
                            </label>
                            <input
                              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-secondary/30 border border-border/60 text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              placeholder={`Enter ${label.toLowerCase()}...`}
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-2 flex justify-end gap-2 border-t border-border/40 mt-6 pt-4">
                        <Button variant="ghost" className="h-9 rounded-lg">Cancel</Button>
                        <Button className="h-9 rounded-lg px-6 font-medium shadow-sm transition-transform">
                          Submit Record
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>
    </div>
  );
}
