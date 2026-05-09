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
import { AttendanceLogBlock } from "@/components/blocks/AttendanceLogBlock";
import { SettingsPage } from "@/components/app-runtime/SettingsPage";
import QuotationsPage from "@/app/(dashboard)/quotation/page";
import CreateQuotation from "@/app/(dashboard)/quotation/create/page";
import EstimatedListPage from "@/app/(dashboard)/estimated/page";
import CreateEstimate from "@/app/(dashboard)/estimated/create/page";

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
  const { data: page, error } = useSWR(`/api/pages/${pageId}`, fetcher, {
    keepPreviousData: true,
  });

  if (!page && !error) {
    return (
      <div className="h-full flex flex-col animate-fade-in-up">
        {/* Top Bar Skeleton */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="skeleton h-8 w-8 rounded-lg" />
          <div className="skeleton h-5 w-48 rounded-md" />
        </div>
        
        {/* Blocks Skeleton */}
        <div className="flex-1 p-4 sm:p-8" style={{ background: "var(--background)" }}>
          <div className="max-w-5xl mx-auto space-y-4 stagger-children">
            <div className="skeleton h-10 w-64 rounded-md" />
            <div className="skeleton h-5 w-96 rounded-md" />
            <div className="skeleton h-12 w-full rounded-xl mt-4" />
            <div className="rounded-xl border p-5 h-80 mt-2" style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}>
              <div className="skeleton h-6 w-48 rounded-md mb-4" />
              <div className="skeleton h-4 w-full rounded-md mb-2" />
              <div className="skeleton h-4 w-full rounded-md mb-2" />
              <div className="skeleton h-4 w-2/3 rounded-md" />
            </div>
          </div>
        </div>
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

  // Inject hardcoded Quotation and Estimate pages from the module system
  if (page?.packPageKey === "quotation_list") {
    const createPage = page.workspace?.pages?.find((p: any) => p.packPageKey === "quotation_create");
    const createUrl = createPage ? `/apps/${page.workspace.slug}/pages/${createPage.id}` : undefined;
    return <QuotationsPage createUrl={createUrl} />;
  }

  if (page?.packPageKey === "quotation_create") {
    const listPage = page.workspace?.pages?.find((p: any) => p.packPageKey === "quotation_list");
    const listUrl = listPage ? `/apps/${page.workspace.slug}/pages/${listPage.id}` : undefined;
    return <CreateQuotation listUrl={listUrl} />;
  }

  if (page?.packPageKey === "estimate_list") {
    const createPage = page.workspace?.pages?.find((p: any) => p.packPageKey === "estimate_create");
    const createUrl = createPage ? `/apps/${page.workspace.slug}/pages/${createPage.id}` : undefined;
    return <EstimatedListPage createUrl={createUrl} />;
  }

  if (page?.packPageKey === "estimate_create") {
    const listPage = page.workspace?.pages?.find((p: any) => p.packPageKey === "estimate_list");
    const listUrl = listPage ? `/apps/${page.workspace.slug}/pages/${listPage.id}` : undefined;
    return <CreateEstimate listUrl={listUrl} />;
  }

  const blocks = Array.isArray(page?.blocks) ? page.blocks : [];

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "var(--background)" }}
    >
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto flex flex-wrap items-start gap-4">
          {blocks.length === 0 ? (
            <div
              className="text-center p-12 text-sm border-2 border-dashed rounded-xl"
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
              // For filter bars, use the table reference name instead of the block type
              const searchPlaceholder = block.config?.tableRef
                ? `Search ${block.config.tableRef}...`
                : `Search records...`;
              const isHeaderBlock = block.type === "TEXT";
              const isFullWidthBlock = ["TABLE_VIEW", "ATTENDANCE_LOG", "KANBAN_VIEW", "FILTER_BAR"].includes(block.type);
              
              const blockContent = (
                <div className={isHeaderBlock ? "mb-2" : isFullWidthBlock ? "" : "p-5"}>
                  {block.type === "TEXT" && (
                    <div className="space-y-1">
                      <h1
                        className="text-2xl sm:text-3xl font-bold tracking-tight"
                        style={{ color: "var(--foreground)" }}
                      >
                        {displayLabel}
                      </h1>
                      {block.config?.description && (
                        <p className="text-sm sm:text-base max-w-3xl whitespace-pre-wrap leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                          {block.config.description}
                        </p>
                      )}
                    </div>
                  )}

                  {block.type === "ATTENDANCE_LOG" && (
                    <AttendanceLogBlock config={block.config || {}} />
                  )}

                  {block.type === "FILTER_BAR" && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 relative group w-full">
                        <Search
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors"
                          style={{ color: "var(--foreground-dimmed)" }}
                        />
                        <input
                          type="text"
                          placeholder={searchPlaceholder}
                          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                          style={{
                            background: "var(--surface-2)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--foreground)",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "var(--primary)";
                            e.currentTarget.style.boxShadow = "0 0 0 3px color-mix(in oklch, var(--primary), transparent 85%)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "var(--border-subtle)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                      </div>
                      {block.config?.includeDateRange && (
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="relative">
                            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--foreground-dimmed)" }} />
                            <input
                              type="date"
                              className="pl-8 pr-2 py-2.5 text-sm rounded-xl outline-none"
                              style={{
                                background: "var(--surface-2)",
                                border: "1px solid var(--border-subtle)",
                                color: "var(--foreground)",
                              }}
                            />
                          </div>
                          <span className="text-xs" style={{ color: "var(--foreground-dimmed)" }}>to</span>
                          <div className="relative">
                            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--foreground-dimmed)" }} />
                            <input
                              type="date"
                              className="pl-8 pr-2 py-2.5 text-sm rounded-xl outline-none"
                              style={{
                                background: "var(--surface-2)",
                                border: "1px solid var(--border-subtle)",
                                color: "var(--foreground)",
                              }}
                            />
                          </div>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        className="gap-2 shrink-0 h-10 rounded-xl transition-colors"
                        style={{
                          background: "var(--surface-2)",
                          borderColor: "var(--border-subtle)",
                          color: "var(--foreground-muted)",
                        }}
                      >
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
                      <div
                        className="p-10 border-2 border-dashed rounded-xl flex flex-col items-center justify-center"
                        style={{
                          borderColor: "var(--border-subtle)",
                          color: "var(--foreground-muted)",
                          background: "var(--surface-1)",
                        }}
                      >
                        <Table2 className="h-8 w-8 mb-3 opacity-40" />
                        <p className="text-sm font-medium">No table connected to this block.</p>
                      </div>
                    )
                  )}

                  {block.type === "CHART" && (
                    <div
                      className="h-64 rounded-xl flex flex-col items-center justify-center text-sm relative overflow-hidden group/chart"
                      style={{
                        background: "var(--surface-1)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--foreground-muted)",
                      }}
                    >
                      <BarChart3 className="h-10 w-10 mb-3 opacity-50" /> 
                      <span className="font-medium">{displayLabel}</span>
                      <span className="text-xs mt-1 opacity-70">Requires data source connection</span>
                    </div>
                  )}

                  {block.type === "KANBAN_VIEW" && (
                    block.config?.tableId ? (
                      <KanbanView config={block.config} tableId={block.config.tableId} />
                    ) : (
                      <div
                        className="p-10 border-2 border-dashed rounded-xl flex flex-col items-center justify-center"
                        style={{
                          borderColor: "var(--border-subtle)",
                          color: "var(--foreground-muted)",
                          background: "var(--surface-1)",
                        }}
                      >
                        <Plus className="h-8 w-8 mb-3 opacity-40" />
                        <p className="text-sm font-medium">No table connected to this Kanban block.</p>
                      </div>
                    )
                  )}

                  {block.type === "FORM" && (
                    <div className="space-y-4 max-w-lg p-2">
                      <div className="space-y-1.5 mb-2">
                        <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{displayLabel || "New Entry Form"}</h3>
                        <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>Automatically generated from the selected table schema.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {["Product Name", "SKU Number"].map((label) => (
                          <div key={label} className="space-y-1.5">
                            <label
                              className="text-[11px] font-bold uppercase tracking-wider block"
                              style={{ color: "var(--foreground-dimmed)" }}
                            >
                              {label}
                            </label>
                            <input
                              className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none transition-all"
                              placeholder={`Enter ${label.toLowerCase()}...`}
                              style={{
                                background: "var(--surface-2)",
                                border: "1px solid var(--border-subtle)",
                                color: "var(--foreground)",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <Button
                        className="w-full sm:w-auto h-11 px-8 rounded-xl font-bold pressable"
                        style={{
                          background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                          color: "var(--primary-foreground)",
                          boxShadow: "0 2px 8px color-mix(in oklch, var(--primary), transparent 60%)",
                        }}
                      >
                        Submit Entry
                      </Button>
                    </div>
                  )}

                  {block.type === "custom-route" && (
                    <div className="p-10 border border-border/40 rounded-xl flex flex-col items-center justify-center bg-card text-center shadow-sm">
                      <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "color-mix(in oklch, var(--primary), transparent 85%)", color: "var(--primary)" }}>
                        <ArrowLeft className="h-8 w-8 rotate-135" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{displayLabel}</h3>
                      <p className="text-sm mb-6 max-w-sm text-muted-foreground">
                        This is a fully custom module. Click below to open the dedicated interface.
                      </p>
                      <Link href={(block.config?.route as string) || "#"}>
                        <Button className="h-11 px-8 rounded-xl font-bold pressable" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                          Open {displayLabel}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              );

              if (isHeaderBlock || isFullWidthBlock) {
                return (
                  <div key={block.id || `block-${index}`} className="w-full">
                    {blockContent}
                  </div>
                );
              }

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
                  {blockContent}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
