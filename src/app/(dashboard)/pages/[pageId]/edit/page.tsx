"use client";

import { useState, use, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table2,
  Kanban,
  Type,
  Filter,
  BarChart3,
  FileText,
  Plus,
  GripVertical,
  Trash2,
  Eye,
  Save,
  MoreHorizontal,
  ChevronRight,
  PenLine,
  Settings2,
  Code,
  Search,
  LayoutTemplate,
  Layers
} from "lucide-react";
import Link from "next/link";

interface PlacedBlock {
  id: string;
  type: string;
  label: string;
  icon: React.ReactNode;
  config?: any;
}

const blockPalette = [
  { type: "TABLE_VIEW", label: "Table View", icon: <Table2 className="h-4 w-4" /> },
  { type: "KANBAN_VIEW", label: "Kanban Board", icon: <Kanban className="h-4 w-4" /> },
  { type: "TEXT", label: "Text/Heading", icon: <Type className="h-4 w-4" /> },
  { type: "FILTER_BAR", label: "Filter Bar", icon: <Filter className="h-4 w-4" /> },
  { type: "CHART", label: "Chart", icon: <BarChart3 className="h-4 w-4" /> },
  { type: "FORM", label: "Form", icon: <FileText className="h-4 w-4" /> },
];

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

export default function PageComposerPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = use(params);

  const router = useRouter();
  const { data: page, mutate: refreshPage } = useSWR(`/api/pages/${pageId}`, (url: string) => fetch(url).then(r => r.json()));
  const { data: allPages, mutate: refreshAllPages } = useSWR(`/api/pages`, (url: string) => fetch(url).then(r => r.json()));

  const [blocks, setBlocks] = useState<PlacedBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [pageTitle, setPageTitle] = useState("");
  const [rightTab, setRightTab] = useState<"components" | "properties">("components");
  const [loadedPageId, setLoadedPageId] = useState<string | null>(null);
  // kanban state: per-block map of cards
  const [kanbanCards, setKanbanCards] = useState<Record<string, KanbanCard[]>>({});
  const kanbanDragCard = useRef<{ blockId: string; cardId: string } | null>(null);

  // Auto-switch to properties tab when a block is clicked
  useEffect(() => {
    if (selectedBlock && !preview) {
      setRightTab("properties");
    }
  }, [selectedBlock, preview]);

  // Sync state when page fetches (and clean up when pageId changes)
  useEffect(() => {
    if (page && loadedPageId !== pageId) {
      setPageTitle(page.title);
      setSelectedBlock(null);
      setRightTab("components");
      
      if (page.blocks && Array.isArray(page.blocks) && page.blocks.length > 0) {
        const processedBlocks = page.blocks.map((b: any, i: number) => ({
          ...b,
          id: b.id || `pack_block_${Date.now()}_${i}`,
          label: b.label || (b.config?.content) || b.type.replace("_", " "),
        }));
        setBlocks(processedBlocks as PlacedBlock[]);
      } else if (!page.blocks || page.blocks.length === 0) {
        // Default initial state for a new page
        setBlocks([
          { id: `b1_${Date.now()}`, type: "TEXT", label: "Inventory Overview", icon: <Type className="h-4 w-4" />, config: {} },
          { id: `b2_${Date.now()}`, type: "FILTER_BAR", label: "Search & Filter", icon: <Filter className="h-4 w-4" />, config: {} },
          { id: `b3_${Date.now()}`, type: "TABLE_VIEW", label: "Products Master List", icon: <Table2 className="h-4 w-4" />, config: {} },
        ]);
      }
      setLoadedPageId(pageId);
    }
  }, [page, pageId, loadedPageId]);

  const addBlock = (type: string, label: string, icon: React.ReactNode) => {
    const newBlock: PlacedBlock = {
      id: `b${Date.now()}`,
      type,
      label,
      icon,
      config: {},
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlock(newBlock.id);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlock === id) setSelectedBlock(null);
  };

  const deletePage = async () => {
    if (!confirm(`Delete "${pageTitle}"? This cannot be undone.`)) return;
    await fetch(`/api/pages/${pageId}`, { method: "DELETE" });
    await refreshAllPages();
    // Navigate to first remaining page or pages index
    const remaining = allPages?.filter((p: any) => p.id !== pageId);
    if (remaining?.length > 0) {
      router.push(`/pages/${remaining[0].id}/edit`);
    } else {
      router.push("/pages");
    }
  };

  const addKanbanCard = (blockId: string, col: string) => {
    const newCard: KanbanCard = { id: `kc_${Date.now()}`, title: "New Task", tag: "Task", col };
    setKanbanCards(prev => ({ ...prev, [blockId]: [...(prev[blockId] || defaultKanbanCards(blockId)), newCard] }));
  };

  const defaultKanbanCards = (blockId: string): KanbanCard[] => [
    { id: `kc_default_${blockId}_1`, title: "Review Supplier Quotes", tag: "Procurement", col: "To Do" },
    { id: `kc_default_${blockId}_2`, title: "Update Stock Levels", tag: "Inventory", col: "In Progress" },
    { id: `kc_default_${blockId}_3`, title: "Quality Check — Batch 12", tag: "QC", col: "Review" },
    { id: `kc_default_${blockId}_4`, title: "Dispatch Order #9921", tag: "Logistics", col: "Done" },
  ];

  const getKanbanCards = (blockId: string) => kanbanCards[blockId] || defaultKanbanCards(blockId);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col -m-4 sm:-m-6 bg-background text-foreground">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/50 shrink-0 glass shadow-sm z-10 relative">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span className="opacity-80">Builder</span>
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          <span className="text-foreground">ERP Composer</span>
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          <input
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            disabled={preview}
            className="px-2 py-0.5 rounded-md bg-secondary text-foreground max-w-[200px] outline-none font-semibold border border-transparent hover:border-border/60 focus:border-primary/50 transition-colors"
            placeholder="Page Title"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={preview ? "default" : "outline"}
            size="sm"
            className="gap-2 text-xs font-semibold h-8 rounded-lg"
            onClick={() => setPreview(!preview)}
          >
            <Eye className="h-3.5 w-3.5" /> {preview ? "Edit Mode" : "Preview"}
          </Button>
          <Button
            size="sm"
            disabled={isSaving}
            onClick={async () => {
              setIsSaving(true);
              const saveableBlocks = blocks.map(b => ({ ...b, icon: undefined }));
              await fetch(`/api/pages/${pageId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blocks: saveableBlocks, title: pageTitle }),
              });
              await refreshPage();
              setIsSaving(false);
            }}
            className="gap-2 text-xs font-semibold h-8 rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving..." : "Publish Page"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
        {/* Left Side: Page Switcher */}
        {!preview && (
          <div className="hidden lg:flex w-[220px] border-r border-border/40 bg-surface-1 shadow-[inset_-10px_0_20px_-20px_rgba(0,0,0,0.1)] flex-col shrink-0 z-10 transition-all">
            <div className="p-4 border-b border-border/40 shrink-0 flex items-center gap-2 text-muted-foreground">
              <LayoutTemplate className="h-4 w-4" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest">
                Workspace Pages
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {allPages?.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/pages/${p.id}/edit`}
                  className={`group flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl transition-colors ${
                    p.id === pageId
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  <FileText className={`h-4 w-4 shrink-0 ${p.id === pageId ? "text-primary" : "opacity-60"}`} />
                  <span className="truncate flex-1">{p.title}</span>
                  {p.id === pageId && (
                    <button
                      onClick={(e) => { e.preventDefault(); deletePage(); }}
                      title="Delete page"
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </Link>
              ))}
              {allPages?.length === 0 && (
                <div className="text-xs text-muted-foreground/60 text-center py-4">No pages found</div>
              )}
            </div>
            {/* Create new page button */}
            <div className="p-3 border-t border-border/40 shrink-0">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/pages", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ title: "Untitled Page", blocks: [] }),
                    });
                    if (res.ok) {
                      const page = await res.json();
                      await refreshAllPages();
                      router.push(`/pages/${page.id}/edit`);
                    }
                  } catch {}
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl transition-colors text-muted-foreground hover:bg-primary/10 hover:text-primary font-medium"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span>New Page</span>
              </button>
            </div>
          </div>
        )}
        {/* Center: Canvas */}
        <div 
          className="flex-1 overflow-y-auto p-4 sm:p-8 dotted-grid relative bg-background shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] z-0"
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData("application/erp-block-type");
            if (type) {
              const bDef = blockPalette.find((b) => b.type === type);
              if (bDef) addBlock(bDef.type, bDef.label, bDef.icon);
            }
          }}
        >
          <div className="max-w-4xl mx-auto space-y-6 stagger-children pb-20">
            {blocks.map((block, index) => (
              <div
                key={block.id || `block-${index}`}
                onClick={() => !preview && setSelectedBlock(block.id)}
                draggable={!preview}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  setDraggedIdx(index);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); // prevent adding to the bottom canvas drop
                  
                  const newType = e.dataTransfer.getData("application/erp-block-type");
                  if (newType) {
                    const bDef = blockPalette.find((b) => b.type === newType);
                    if (bDef) {
                      const newBlock = { id: `b${Date.now()}`, type: bDef.type, label: bDef.label, icon: bDef.icon, config: {} };
                      setBlocks(prev => {
                        const copy = [...prev];
                        copy.splice(index, 0, newBlock as PlacedBlock);
                        return copy;
                      });
                      setSelectedBlock(newBlock.id);
                    }
                    return;
                  }

                  if (draggedIdx === null || draggedIdx === index) return;
                  setBlocks((prev) => {
                    const copy = [...prev];
                    const [item] = copy.splice(draggedIdx, 1);
                    copy.splice(index, 0, item);
                    return copy;
                  });
                  setDraggedIdx(null);
                }}
                className={`group relative rounded-2xl transition-all duration-300 ${
                  !preview ? "cursor-grab active:cursor-grabbing" : ""
                } bg-card border ${
                  selectedBlock === block.id && !preview
                    ? "border-primary ring-4 ring-primary/10 shadow-lg scale-[1.01]"
                    : "border-border/40 hover:border-border/80 shadow-sm hover:shadow-md"
                } ${draggedIdx === index ? "opacity-50" : ""}`}
              >
                {/* Block toolbar */}
                {!preview && (
                  <div className="absolute -top-3 left-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-border shadow-md backdrop-blur-sm">
                      <GripVertical className="h-3.5 w-3.5 cursor-grab text-muted-foreground hover:text-foreground" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pr-2 border-r border-border/50">
                        {block.type.replace("_", " ")}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBlock(block.id);
                        }}
                        className="pl-1 text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded-md"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Block content */}
                <div className="p-6">
                  {block.type === "TEXT" && (
                    <div className="space-y-1">
                      <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {block.label}
                      </h1>
                      <p className="text-base text-muted-foreground whitespace-pre-wrap">
                        {block.config?.description || "Enter a description..."}
                      </p>
                    </div>
                  )}

                  {block.type === "FILTER_BAR" && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative group w-full">
                        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                          type="text"
                          placeholder={`Search ${block.label}...`}
                          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-secondary/30 border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                          readOnly={!preview}
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
                            {block.label}
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

                  {block.type === "KANBAN_VIEW" && (() => {
                    const cards = getKanbanCards(block.id);
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-base font-semibold text-foreground">{block.label}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1 rounded-lg"
                            onClick={(e) => { e.stopPropagation(); addKanbanCard(block.id, "To Do"); }}
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
                                  e.stopPropagation();
                                  if (!kanbanDragCard.current || kanbanDragCard.current.blockId !== block.id) return;
                                  const cardId = kanbanDragCard.current.cardId;
                                  setKanbanCards(prev => ({
                                    ...prev,
                                    [block.id]: (prev[block.id] || defaultKanbanCards(block.id)).map(c =>
                                      c.id === cardId ? { ...c, col } : c
                                    )
                                  }));
                                  kanbanDragCard.current = null;
                                }}
                              >
                                <div className="flex items-center justify-between mb-3 px-1">
                                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{col}</h4>
                                  <span className="text-[10px] font-medium bg-background px-1.5 py-0.5 rounded text-muted-foreground border border-border/50">
                                    {colCards.length}
                                  </span>
                                </div>
                                <div className="space-y-2 min-h-[60px]">
                                  {colCards.map(card => (
                                    <div
                                      key={card.id}
                                      draggable
                                      onDragStart={(e) => {
                                        e.stopPropagation();
                                        kanbanDragCard.current = { blockId: block.id, cardId: card.id };
                                      }}
                                      className="rounded-lg p-3 text-sm bg-card border border-border/40 text-foreground shadow-sm hover:border-primary/30 hover:shadow-md transition-all cursor-grab active:cursor-grabbing active:opacity-60 group/card"
                                    >
                                      <p className="font-medium text-[13px] leading-snug">{card.title}</p>
                                      <div className="flex items-center justify-between mt-2">
                                        <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{card.tag}</Badge>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setKanbanCards(prev => ({
                                              ...prev,
                                              [block.id]: (prev[block.id] || defaultKanbanCards(block.id)).filter(c => c.id !== card.id)
                                            }));
                                          }}
                                          className="opacity-0 group-hover/card:opacity-100 text-muted-foreground hover:text-destructive transition-all p-0.5 rounded"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); addKanbanCard(block.id, col); }}
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

                  {block.type === "CHART" && (
                    <div className="h-64 rounded-xl flex flex-col items-center justify-center text-sm bg-secondary/20 border border-border/40 text-muted-foreground/80 relative overflow-hidden group/chart cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover/chart:opacity-100 transition-opacity" />
                      <BarChart3 className="h-10 w-10 mb-3 opacity-50" /> 
                      <span className="font-medium">{block.label}</span>
                      <span className="text-xs mt-1 opacity-70">Requires data source connection</span>
                    </div>
                  )}

                  {block.type === "FORM" && (
                    <div className="space-y-4 max-w-lg p-2">
                      <div className="space-y-1.5 mb-2">
                        <h3 className="text-lg font-bold text-foreground">{block.label || "New Entry Form"}</h3>
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
                              readOnly={!preview}
                              placeholder={`Enter ${label.toLowerCase()}...`}
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-2 flex justify-end gap-2 border-t border-border/40 mt-6 pt-4">
                        <Button variant="ghost" className="h-9 rounded-lg">Cancel</Button>
                        <Button className="h-9 rounded-lg px-6 font-medium shadow-sm active:scale-95 transition-transform">
                          Submit Record
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Drop zone */}
            {!preview && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const type = e.dataTransfer.getData("application/erp-block-type");
                  if (type) {
                    const bDef = blockPalette.find((b) => b.type === type);
                    if (bDef) addBlock(bDef.type, bDef.label, bDef.icon);
                  }
                }}
                className="rounded-2xl p-10 text-center transition-all duration-300 border-2 border-dashed border-border/60 bg-transparent text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary cursor-pointer group"
              >
                <div className="bg-secondary/80 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors">
                  <Plus className="h-5 w-5 opacity-70" />
                </div>
                <p className="text-sm font-medium">Drag components here or click to add a new block</p>
                <p className="text-xs opacity-60 mt-1">Supports Tables, Kanban, Forms and visual elements</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Tabbed Panel (Components & Properties) */}
        {!preview && (
          <div className="hidden lg:flex w-[320px] border-l border-border/40 flex-col bg-surface-1 shadow-[inset_10px_0_20px_-20px_rgba(0,0,0,0.1)] shrink-0 z-10">
            {/* Tab Headers */}
            <div className="flex px-5 pt-5 border-b border-border/40 gap-6 shrink-0 bg-surface-1">
              <button
                onClick={() => setRightTab("components")}
                className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  rightTab === "components"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setRightTab("properties")}
                className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  rightTab === "properties"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Configuration
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {/* COMPONENTS TAB */}
              {rightTab === "components" && (
                <div className="p-5 flex flex-col gap-2">
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground/70">
                      Drag components onto the canvas or click to insert at bottom.
                    </p>
                  </div>
                  {blockPalette.map((block) => (
                    <button
                      key={block.type}
                      draggable={!preview}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/erp-block-type", block.type);
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      onClick={() => addBlock(block.type, block.label, block.icon)}
                      className="group flex items-center gap-3 px-3.5 py-3 text-sm rounded-xl transition-all duration-200 whitespace-nowrap w-full shrink-0 border border-transparent hover:border-primary/20 hover:bg-primary/5 hover:text-primary hover:shadow-sm text-foreground/80 font-medium cursor-grab active:cursor-grabbing bg-card shadow-sm"
                    >
                      <div className="p-1.5 rounded-md bg-secondary/80 group-hover:bg-primary/10 group-hover:text-primary transition-colors text-muted-foreground flex items-center justify-center">
                        {block.icon}
                      </div>
                      {block.label}
                      <Plus className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {/* PROPERTIES TAB */}
              {rightTab === "properties" && (
                <div className="p-5 space-y-6">
                  {!selectedBlock ? (
                    <div className="text-center py-12 px-4 space-y-3">
                      <div className="mx-auto w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground/50">
                        <Settings2 className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">No Element Selected</p>
                      <p className="text-xs text-muted-foreground/60">Click on any block in the canvas to edit its properties.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40 border border-border/40">
                        <div className="p-1.5 rounded-md bg-background shadow-sm text-primary border border-border/30">
                          {blocks.find((b) => b.id === selectedBlock)?.icon || <Layers className="h-4 w-4" />}
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {blocks.find((b) => b.id === selectedBlock)?.type.replace("_", " ")} Element
                        </span>
                      </div>

                      {/* Common Label/Title Field */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Display Title
                        </label>
                        <input 
                          type="text"
                          value={blocks.find((b) => b.id === selectedBlock)?.label || ""}
                          onChange={(e) => {
                            setBlocks(prev => prev.map(b => 
                              b.id === selectedBlock ? { ...b, label: e.target.value } : b
                            ));
                          }}
                          className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                        />
                      </div>

                      {blocks.find((b) => b.id === selectedBlock)?.type === "TEXT" && (
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Description Settings
                          </label>
                          <textarea 
                            value={blocks.find((b) => b.id === selectedBlock)?.config?.description || ""}
                            onChange={(e) => {
                              setBlocks(prev => prev.map(b => 
                                b.id === selectedBlock ? { ...b, config: { ...(b.config || {}), description: e.target.value } } : b
                              ));
                            }}
                            className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] shadow-sm resize-none"
                            placeholder="Enter short description or subtitle..."
                          />
                        </div>
                      )}

                      {/* Data Source Field for Table/Kanban */}
                      {(blocks.find((b) => b.id === selectedBlock)?.type === "TABLE_VIEW" || 
                        blocks.find((b) => b.id === selectedBlock)?.type === "KANBAN_VIEW") && (
                        <div className="space-y-2 pt-4 border-t border-border/30">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                            <span>Target Database Table</span>
                          </label>
                          <select className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20 shadow-sm">
                            <option>Products Database</option>
                            <option>Suppliers Database</option>
                            <option>Purchase Orders Database</option>
                          </select>
                          <p className="text-[10px] text-muted-foreground/70 mt-1.5 leading-relaxed">Connect this component to fetch live runtime data from the backend schema.</p>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t border-border/30">
                        <Button
                          variant="destructive"
                          className="w-full gap-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/20"
                          onClick={() => selectedBlock && removeBlock(selectedBlock)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete Block
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
