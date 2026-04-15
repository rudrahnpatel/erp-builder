"use client";

import { use, useState, useRef } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  Table2,
  Filter,
  BarChart3,
  Search,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const sampleTableData = [
  { name: "Precision Lathe X-10", sku: "LAT-2023-001", price: "₹4,250.00", stock: "12 Units", status: "In Stock" },
  { name: "Hydraulic Press S0T", sku: "HYD-93-A", price: "₹8,900.00", stock: "3 Units", status: "Low Stock" },
  { name: "Industrial Safety Mask", sku: "SAF-MASK-8", price: "₹75.50", stock: "450 Units", status: "In Stock" },
];

const KANBAN_COLS = ["To Do", "In Progress", "Review", "Done"];

interface KanbanCard {
  id: string;
  title: string;
  tag: string;
  col: string;
}

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

  const [kanbanCards, setKanbanCards] = useState<Record<string, KanbanCard[]>>({});
  const kanbanDragCard = useRef<{ blockId: string; cardId: string } | null>(null);

  const defaultKanbanCards = (blockId: string): KanbanCard[] => [
    { id: `kc_${blockId}_1`, title: "Review Supplier Quotes", tag: "Procurement", col: "To Do" },
    { id: `kc_${blockId}_2`, title: "Update Stock Levels", tag: "Inventory", col: "In Progress" },
    { id: `kc_${blockId}_3`, title: "Quality Check — Batch 12", tag: "QC", col: "Review" },
    { id: `kc_${blockId}_4`, title: "Dispatch Order #9921", tag: "Logistics", col: "Done" },
  ];

  const getKanbanCards = (blockId: string) => kanbanCards[blockId] || defaultKanbanCards(blockId);

  const addKanbanCard = (blockId: string, col: string) => {
    const newCard: KanbanCard = { id: `kc_${Date.now()}`, title: "New Task", tag: "Task", col };
    setKanbanCards(prev => ({ ...prev, [blockId]: [...(prev[blockId] || defaultKanbanCards(blockId)), newCard] }));
  };

  if (!page && !error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const blocks = Array.isArray(page?.blocks) ? page.blocks : [];

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "var(--background)" }}
    >
      <div
        className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b shrink-0 glass"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Link
          href={`/apps/${slug}`}
          className="text-muted-foreground hover:text-foreground transition-colors mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span
          className="font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          {page?.title || "Custom Page"}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
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
              return (
              <div
                key={block.id || `block-${index}`}
                className="rounded-xl overflow-hidden border shadow-sm"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border-subtle)",
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
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative group w-full">
                        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                          type="text"
                          placeholder={`Search ${displayLabel}...`}
                          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-secondary/30 border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                        />
                      </div>
                      <Button variant="outline" className="gap-2 shrink-0 h-10 rounded-xl bg-background border-border/60 hover:bg-secondary/50">
                        <Filter className="h-4 w-4" /> Filter
                      </Button>
                    </div>
                  )}

                  {block.type === "TABLE_VIEW" && (
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-md bg-secondary text-muted-foreground">
                            <Table2 className="h-4 w-4" />
                          </div>
                          <span className="text-base font-semibold text-foreground">
                            {displayLabel}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary rounded-lg">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      
                      <div className="overflow-x-auto rounded-xl border border-border/40 bg-surface-1">
                        <table className="w-full text-sm min-w-[600px]">
                          <thead>
                            <tr className="border-b border-border/40 bg-secondary/20">
                              {["Name", "SKU", "Price", "Stock", "Status"].map((h) => (
                                <th
                                  key={h}
                                  className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/30">
                            {sampleTableData.map((row, i) => (
                              <tr key={i} className="hover:bg-secondary/20 transition-colors">
                                <td className="px-4 py-3.5 font-medium text-foreground whitespace-nowrap">
                                  {row.name}
                                </td>
                                <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                                  <Badge variant="outline" className="font-mono bg-background border-border/60 text-muted-foreground text-[10px]">
                                    {row.sku}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3.5 text-foreground tabular-nums">
                                  {row.price}
                                </td>
                                <td className="px-4 py-3.5 text-foreground">
                                  {row.stock}
                                </td>
                                <td className="px-4 py-3.5">
                                  <Badge
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border-0 ${
                                      row.status === "In Stock"
                                        ? "bg-success/15 text-success hover:bg-success/25"
                                        : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                    }`}
                                  >
                                    {row.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {block.type === "CHART" && (
                    <div className="h-64 rounded-xl flex flex-col items-center justify-center text-sm bg-secondary/20 border border-border/40 text-muted-foreground/80 relative overflow-hidden group/chart">
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover/chart:opacity-100 transition-opacity" />
                      <BarChart3 className="h-10 w-10 mb-3 opacity-50" /> 
                      <span className="font-medium">{displayLabel}</span>
                      <span className="text-xs mt-1 opacity-70">Requires data source connection</span>
                    </div>
                  )}

                  {block.type === "KANBAN_VIEW" && (() => {
                    const cards = getKanbanCards(block.id || `kb_${index}`);
                    const blockId = block.id || `kb_${index}`;
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-base font-semibold text-foreground">{displayLabel}</span>
                          <Button
                            size="sm" variant="outline"
                            className="h-7 text-xs gap-1 rounded-lg"
                            onClick={() => addKanbanCard(blockId, "To Do")}
                          >
                            <Plus className="h-3 w-3" /> Add Card
                          </Button>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {KANBAN_COLS.map((col) => {
                            const colCards = cards.filter(c => c.col === col);
                            return (
                              <div
                                key={col}
                                className="flex-1 min-w-[190px] rounded-xl p-3 bg-secondary/30 border border-border/30"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  if (!kanbanDragCard.current || kanbanDragCard.current.blockId !== blockId) return;
                                  const cardId = kanbanDragCard.current.cardId;
                                  setKanbanCards(prev => ({
                                    ...prev,
                                    [blockId]: (prev[blockId] || defaultKanbanCards(blockId)).map(c =>
                                      c.id === cardId ? { ...c, col } : c
                                    )
                                  }));
                                  kanbanDragCard.current = null;
                                }}
                              >
                                <div className="flex items-center justify-between mb-3 px-1">
                                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{col}</h4>
                                  <span className="text-[10px] font-medium bg-background px-1.5 py-0.5 rounded text-muted-foreground border border-border/50">{colCards.length}</span>
                                </div>
                                <div className="space-y-2 min-h-[60px]">
                                  {colCards.map(card => (
                                    <div
                                      key={card.id}
                                      draggable
                                      onDragStart={() => { kanbanDragCard.current = { blockId, cardId: card.id }; }}
                                      className="rounded-lg p-3 text-sm bg-card border border-border/40 text-foreground shadow-sm hover:border-primary/30 hover:shadow-md transition-all cursor-grab active:cursor-grabbing active:opacity-60 group/card"
                                    >
                                      <p className="font-medium text-[13px] leading-snug">{card.title}</p>
                                      <div className="flex items-center justify-between mt-2">
                                        <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{card.tag}</Badge>
                                        <button
                                          onClick={() => setKanbanCards(prev => ({
                                            ...prev,
                                            [blockId]: (prev[blockId] || defaultKanbanCards(blockId)).filter(c => c.id !== card.id)
                                          }))}
                                          className="opacity-0 group-hover/card:opacity-100 text-muted-foreground hover:text-destructive transition-all p-0.5 rounded"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  onClick={() => addKanbanCard(blockId, col)}
                                  className="mt-2 w-full text-xs text-muted-foreground/60 hover:text-primary transition-colors py-1.5 rounded-lg hover:bg-primary/5 flex items-center justify-center gap-1"
                                >
                                  <Plus className="h-3 w-3" /> Add
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

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
