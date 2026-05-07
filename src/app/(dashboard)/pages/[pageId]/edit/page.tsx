"use client";

import { useState, use, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  DndContext, DragEndEvent, DragStartEvent, DragOverlay,
  useDraggable, useDroppable, KeyboardSensor, PointerSensor,
  closestCenter, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy, rectSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import {
  Table2, Kanban, Type, Filter, BarChart3, FileText, Plus, GripVertical,
  Trash2, Eye, Save, MoreHorizontal, ChevronRight, PenLine, Settings2,
  Code, Search, LayoutTemplate, Layers, Loader2, Hash, Download,
  Image as ImageIcon, Calendar, Calculator, PanelLeftClose, PanelLeftOpen,
  PanelRightClose, PanelRightOpen,
} from "lucide-react";
import Link from "next/link";
import { useModuleComposer } from "@/lib/module-composer-context";
import { TableView } from "@/components/blocks/TableView";
import { KanbanView } from "@/components/blocks/KanbanView";
import { MetricCard } from "@/components/blocks/MetricCard";
import { ExportButton } from "@/components/blocks/ExportButton";
import { ImageBlock } from "@/components/blocks/ImageBlock";
import { GstCalculator } from "@/components/blocks/GstCalculator";

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
  { type: "METRIC", label: "KPI Metric", icon: <Hash className="h-4 w-4" /> },
  { type: "CHART", label: "Chart", icon: <BarChart3 className="h-4 w-4" /> },
  { type: "TEXT", label: "Text/Heading", icon: <Type className="h-4 w-4" /> },
  { type: "IMAGE", label: "Image / Logo", icon: <ImageIcon className="h-4 w-4" /> },
  { type: "FILTER_BAR", label: "Filter Bar", icon: <Filter className="h-4 w-4" /> },
  { type: "FORM", label: "Form", icon: <FileText className="h-4 w-4" /> },
  { type: "EXPORT_BUTTON", label: "Export (CSV)", icon: <Download className="h-4 w-4" /> },
  { type: "GST_CALCULATOR", label: "GST Calculator", icon: <Calculator className="h-4 w-4" /> },
  { type: "SPACE", label: "Empty Space", icon: <LayoutTemplate className="h-4 w-4 opacity-50" /> },
];

const KANBAN_COLS = ["To Do", "In Progress", "Review", "Done"];

/* ── 6-column grid system ── */
const GRID_COLUMNS = 6;

const blockGridStyle = (cfg: any): React.CSSProperties => {
  const colSpan = typeof cfg?.colSpan === "number" ? Math.min(GRID_COLUMNS, Math.max(1, cfg.colSpan)) : GRID_COLUMNS;
  const heightPx = typeof cfg?.heightPx === "number" ? cfg.heightPx : undefined;
  return {
    gridColumn: `span ${colSpan} / span ${colSpan}`,
    height: heightPx ? `${heightPx}px` : undefined,
  };
};

const blockSizeStyle = blockGridStyle;

type ResizeAxis = "left" | "right" | "top" | "bottom";

interface KanbanCard {
  id: string;
  title: string;
  tag: string;
  col: string;
}

export default function PageComposerPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = use(params);
  const composerCtx = useModuleComposer();
  const pagesApiUrl = composerCtx?.pagesApiUrl || "/api/pages";
  const basePath = composerCtx?.basePath || "/pages";

  const router = useRouter();
  const { workspace } = useWorkspace();
  const { data: allPagesResponse, mutate: refreshAllPages } = useSWR(pagesApiUrl, (url: string) => fetch(url).then(r => r.json()));
  const allPages = useMemo(() => {
    return Array.isArray(allPagesResponse) ? allPagesResponse : (allPagesResponse?.pages || []);
  }, [allPagesResponse]);

  const pageFromCache = allPages?.find((p: any) => p.id === pageId);
  const { data: page, mutate: refreshPage, isLoading } = useSWR(
    `/api/pages/${pageId}`, 
    (url: string) => fetch(url).then(r => r.json()),
    { fallbackData: pageFromCache }
  );

  const [blocks, setBlocks] = useState<PlacedBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [pageTitle, setPageTitle] = useState("");
  const [rightTab, setRightTab] = useState<"components" | "properties">("components");
  const [loadedPageId, setLoadedPageId] = useState<string | null>(null);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const canvasGridRef = useRef<HTMLDivElement | null>(null);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<any>(null);

  const handleCanvasDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
    setActiveDragData(event.active.data.current);
  };

  const handleCanvasDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    setActiveDragData(null);
    const { active, over } = event;
    if (!over) return;

    if (active.data.current?.type === "canvas-block" && over.data.current?.type === "canvas-block") {
      if (active.id !== over.id) {
        setBlocks((prev) => {
          const oldIdx = prev.findIndex((b) => b.id === active.id);
          const newIdx = prev.findIndex((b) => b.id === over.id);
          return arrayMove(prev, oldIdx, newIdx);
        });
      }
    } else if (active.data.current?.type === "palette-item") {
      const blockType = active.data.current.blockType;
      const bDef = blockPalette.find((b) => b.type === blockType);
      if (bDef) {
        const newBlock = { id: `b${Date.now()}`, type: bDef.type, label: bDef.label, icon: bDef.icon, config: {} };
        
        if (over.id === "canvas-dropzone") {
          setBlocks((prev) => [...prev, newBlock]);
        } else if (over.data.current?.type === "canvas-block") {
          setBlocks((prev) => {
            const newIdx = prev.findIndex((b) => b.id === over.id);
            const copy = [...prev];
            copy.splice(newIdx, 0, newBlock);
            return copy;
          });
        }
        setSelectedBlock(newBlock.id);
      }
    }
  };

  const startResize = (
    e: React.PointerEvent<HTMLDivElement>,
    blockId: string,
    axis: ResizeAxis
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const blockEl = (e.currentTarget as HTMLElement).closest("[data-block-id]") as HTMLElement | null;
    const grid = canvasGridRef.current;
    if (!blockEl || !grid) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startHeightPx = blockEl.getBoundingClientRect().height;
    const gridWidth = grid.getBoundingClientRect().width;
    const colWidth = gridWidth / GRID_COLUMNS;
    const block = blocks.find(b => b.id === blockId);
    const startColSpan = block?.config?.colSpan ?? GRID_COLUMNS;

    setIsResizing(true);
    const cursor = (axis === "left" || axis === "right") ? "ew-resize" : "ns-resize";
    document.body.style.cursor = cursor;
    document.body.style.userSelect = "none";

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId) return b;
          const cfg = { ...(b.config || {}) };
          if (axis === "right") {
            cfg.colSpan = Math.max(1, Math.min(GRID_COLUMNS, startColSpan + Math.round(dx / colWidth)));
          } else if (axis === "left") {
            cfg.colSpan = Math.max(1, Math.min(GRID_COLUMNS, startColSpan + Math.round(-dx / colWidth)));
          } else if (axis === "bottom") {
            cfg.heightPx = Math.max(60, startHeightPx + dy);
          } else if (axis === "top") {
            cfg.heightPx = Math.max(60, startHeightPx - dy);
          }
          return { ...b, config: cfg };
        })
      );
    };

    const onUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Ordered, filtered copy of the workspace pages used to drive the left rail.
  // Kept local so drag-and-drop can reorder optimistically before the PATCH
  // round-trip resolves.
  const [orderedPages, setOrderedPages] = useState<any[]>([]);

  useEffect(() => {
    const visible = (allPages || []).filter(
      (p: any) =>
        p.packPageKey !== "user_management" && p.packPageKey !== "settings"
    );
    setOrderedPages(visible);
  }, [allPages]);

  const pageSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handlePagesDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = orderedPages.findIndex((p) => p.id === active.id);
    const newIdx = orderedPages.findIndex((p) => p.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;

    const next = arrayMove(orderedPages, oldIdx, newIdx);
    setOrderedPages(next);

    try {
      const res = await fetch("/api/pages/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageIds: next.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error("reorder failed");
      refreshAllPages();
    } catch {
      toast.error("Failed to save new page order");
      setOrderedPages(
        (allPages || []).filter(
          (p: any) =>
            p.packPageKey !== "user_management" && p.packPageKey !== "settings"
        )
      );
    }
  };
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
      router.push(`${basePath}/${remaining[0].id}/edit`);
    } else {
      router.push(basePath);
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

  if (isLoading && !page) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center -m-4 sm:-m-6 bg-background text-foreground">
        <div className="flex flex-col items-center gap-3 text-muted-foreground animate-pulse">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading composer...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="h-[calc(100vh-3.5rem)] flex flex-col -m-4 sm:-m-6 bg-background text-foreground">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 border-b shrink-0 z-10 relative"
        style={{
          background: "color-mix(in oklch, var(--surface-1), transparent 30%)",
          backdropFilter: "blur(16px)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-2 text-[13px] font-medium" style={{ color: "var(--foreground-muted)" }}>
          <span>Composer</span>
          <ChevronRight className="h-3.5 w-3.5 opacity-40" />
          <input
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            disabled={preview}
            className="px-2.5 py-1 rounded-lg max-w-[200px] outline-none font-semibold text-sm transition-all focus-ring"
            style={{
              background: "var(--surface-2)",
              color: "var(--foreground)",
              border: "1px solid var(--border-subtle)",
            }}
            placeholder="Page Title"
          />
        </div>
        <div className="flex items-center gap-2">
          {!preview && (
            <div className="hidden md:flex items-center gap-1 mr-1">
              <button
                type="button"
                onClick={() => setLeftCollapsed((c) => !c)}
                title={leftCollapsed ? "Show pages list" : "Hide pages list"}
                aria-label={leftCollapsed ? "Show pages list" : "Hide pages list"}
                className="p-1.5 rounded-lg hover-bg-subtle focus-ring transition-colors"
                style={{ color: "var(--foreground-muted)" }}
              >
                {leftCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setRightCollapsed((c) => !c)}
                title={rightCollapsed ? "Show inspector" : "Hide inspector"}
                aria-label={rightCollapsed ? "Show inspector" : "Hide inspector"}
                className="p-1.5 rounded-lg hover-bg-subtle focus-ring transition-colors"
                style={{ color: "var(--foreground-muted)" }}
              >
                {rightCollapsed ? (
                  <PanelRightOpen className="h-4 w-4" />
                ) : (
                  <PanelRightClose className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
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
            className="gap-2 text-xs font-semibold h-8 rounded-xl pressable"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
              color: "var(--primary-foreground)",
              boxShadow: "0 2px 8px color-mix(in oklch, var(--primary), transparent 65%)",
            }}
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving..." : "Publish Page"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
        {/* Left Side: Page Switcher */}
        {!preview && !leftCollapsed && (
          <div className="hidden lg:flex w-[220px] border-r flex-col shrink-0 z-10 transition-all" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-1)" }}>
            <div className="p-4 border-b border-border/40 shrink-0 flex items-center gap-2 text-muted-foreground">
              <LayoutTemplate className="h-4 w-4" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest">
                Workspace Pages
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <DndContext
                sensors={pageSensors}
                collisionDetection={closestCenter}
                onDragEnd={handlePagesDragEnd}
              >
                <SortableContext
                  items={orderedPages.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {orderedPages.map((p: any) => (
                    <SortablePageLink
                      key={p.id}
                      page={p}
                      active={p.id === pageId}
                      onDelete={deletePage}
                      basePath={basePath}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              {orderedPages.length === 0 && (
                <div className="text-xs text-muted-foreground/60 text-center py-4">No pages found</div>
              )}
            </div>
            {/* Create new page button */}
            <div className="p-3 border-t border-border/40 shrink-0">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(pagesApiUrl, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ title: "Untitled Page", blocks: [] }),
                    });
                    if (res.ok) {
                      const page = await res.json();
                      await refreshAllPages();
                      router.push(`${basePath}/${page.id}/edit`);
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
        {/* Center & Right Area wrapped in DndContext */}
        <DndContext
          sensors={pageSensors}
          collisionDetection={closestCenter}
          onDragStart={handleCanvasDragStart}
          onDragEnd={handleCanvasDragEnd}
        >
        {/* Center: Canvas */}
        <div 
          className="flex-1 overflow-y-auto p-4 sm:p-8 dotted-grid relative bg-background shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] z-0 min-w-0"
        >
          <div ref={canvasGridRef} className="max-w-4xl mx-auto grid grid-cols-6 gap-4 stagger-children pb-20 items-start">
            <SortableContext items={blocks.map(b => b.id)} strategy={rectSortingStrategy}>
            {blocks.map((block, index) => (
              <SortableCanvasBlock
                key={block.id || `block-${index}`}
                block={block}
                preview={preview}
                isResizing={isResizing}
                selectedBlock={selectedBlock}
                setSelectedBlock={setSelectedBlock}
                startResize={startResize}
                removeBlock={removeBlock}
                workspace={workspace}
                getKanbanCards={getKanbanCards}
                addKanbanCard={addKanbanCard}
                setKanbanCards={setKanbanCards}
                kanbanDragCard={kanbanDragCard}
              />
            ))}
            </SortableContext>

            {/* Drop zone */}
            <CanvasDropZone preview={preview} />
          </div>
        </div>

        {/* Right Side: Tabbed Panel (Components & Properties) */}
        {!preview && !rightCollapsed && (
          <div className="hidden lg:flex w-[320px] border-l flex-col shrink-0 z-10" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-1)" }}>
            {/* Tab Headers */}
            <div className="flex px-5 pt-4 pb-0 border-b gap-1 shrink-0" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-1)" }}>
              <button
                onClick={() => setRightTab("components")}
                className={`px-3 pb-3 pt-1 text-[12px] font-semibold border-b-2 transition-colors rounded-t-lg ${
                  rightTab === "components"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-3"
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setRightTab("properties")}
                className={`px-3 pb-3 pt-1 text-[12px] font-semibold border-b-2 transition-colors rounded-t-lg ${
                  rightTab === "properties"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-3"
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
                    <PaletteItem key={block.type} block={block} preview={preview} addBlock={addBlock} />
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

                      {/* Block Size — 6-column grid */}
                      {(() => {
                        const b = blocks.find((x) => x.id === selectedBlock);
                        const colSpan = typeof b?.config?.colSpan === "number" ? b!.config!.colSpan : GRID_COLUMNS;
                        const heightPx = typeof b?.config?.heightPx === "number" ? b!.config!.heightPx : undefined;
                        const heightLabel = heightPx ? `${Math.round(heightPx)}px` : "Auto";
                        const setColSpan = (span: number) =>
                          setBlocks((prev) =>
                            prev.map((x) =>
                              x.id === selectedBlock
                                ? { ...x, config: { ...(x.config || {}), colSpan: span } }
                                : x
                            )
                          );
                        const resetSize = () =>
                          setBlocks((prev) =>
                            prev.map((x) => {
                              if (x.id !== selectedBlock) return x;
                              const cfg = { ...(x.config || {}) };
                              delete cfg.colSpan;
                              delete cfg.heightPx;
                              return { ...x, config: cfg };
                            })
                          );
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                Grid Columns
                              </label>
                              <span className="text-[10px] font-medium text-muted-foreground/70 tabular-nums">
                                {colSpan}/{GRID_COLUMNS} × {heightLabel}
                              </span>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {[1,2,3,4,5,6].map((n) => {
                                const active = colSpan === n;
                                return (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() => setColSpan(n)}
                                    className="px-1.5 py-2 rounded-lg text-xs font-semibold transition-all border"
                                    style={{
                                      background: active ? "color-mix(in oklch, var(--primary), transparent 85%)" : "var(--card)",
                                      borderColor: active ? "var(--primary)" : "var(--border-subtle)",
                                      color: active ? "var(--primary)" : "var(--foreground-muted)",
                                      boxShadow: active ? "0 0 0 1px var(--primary)" : "none",
                                    }}
                                  >
                                    {n}
                                  </button>
                                );
                              })}
                              <button
                                type="button"
                                onClick={resetSize}
                                title="Reset size"
                                className="px-1.5 py-2 rounded-lg text-xs font-semibold transition-colors border"
                                style={{
                                  background: "var(--card)",
                                  borderColor: "var(--border-subtle)",
                                  color: "var(--foreground-muted)",
                                }}
                              >
                                ↺
                              </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                              Drag handles or pick columns. Add Empty Space blocks for gaps.
                            </p>
                          </div>
                        );
                      })()}

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

                      {/* Data Source Field for Table/Kanban/Export/Metric */}
                      {(() => {
                        const b = blocks.find((b) => b.id === selectedBlock);
                        const needsTable =
                          b?.type === "TABLE_VIEW" ||
                          b?.type === "KANBAN_VIEW" ||
                          b?.type === "EXPORT_BUTTON" ||
                          b?.type === "METRIC" ||
                          b?.type === "FILTER_BAR";
                        if (!needsTable) return null;
                        const helperText =
                          b?.type === "METRIC"
                            ? "Optional — bind a table to show a live record count instead of a static value."
                            : b?.type === "EXPORT_BUTTON"
                            ? "Records from this table will be downloaded as CSV."
                            : b?.type === "FILTER_BAR"
                            ? "The table the filters will apply to."
                            : "Connect this component to fetch live runtime data from the backend schema.";
                        return (
                          <div className="space-y-2 pt-4 border-t border-border/30">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                              <span>
                                {b?.type === "METRIC" ? "Live Count From Table" : "Target Database Table"}
                              </span>
                            </label>
                            <select
                              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                              value={b?.config?.tableRef || ""}
                              onChange={(e) => {
                                setBlocks((prev) =>
                                  prev.map((x) =>
                                    x.id === selectedBlock
                                      ? { ...x, config: { ...(x.config || {}), tableRef: e.target.value } }
                                      : x
                                  )
                                );
                              }}
                            >
                              <option value="">{b?.type === "METRIC" ? "None (use static value)" : "Select a table..."}</option>
                              {workspace?.tables?.map((t: any) => (
                                <option key={t.id} value={t.name}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                            <p className="text-[10px] text-muted-foreground/70 mt-1.5 leading-relaxed">{helperText}</p>
                          </div>
                        );
                      })()}

                      {/* METRIC configuration */}
                      {blocks.find((b) => b.id === selectedBlock)?.type === "METRIC" && (() => {
                        const b = blocks.find((b) => b.id === selectedBlock)!;
                        const cfg = b.config || {};
                        const update = (patch: Record<string, unknown>) =>
                          setBlocks((prev) =>
                            prev.map((x) =>
                              x.id === selectedBlock
                                ? { ...x, config: { ...(x.config || {}), ...patch } }
                                : x
                            )
                          );
                        return (
                          <div className="space-y-3 pt-4 border-t border-border/30">
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Metric Label</label>
                              <input
                                type="text"
                                value={cfg.metricLabel || ""}
                                placeholder="e.g. Today's Sales"
                                onChange={(e) => update({ metricLabel: e.target.value })}
                                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Static Value</label>
                              <input
                                type="text"
                                value={cfg.metricValue || ""}
                                placeholder="e.g. ₹50,000"
                                onChange={(e) => update({ metricValue: e.target.value })}
                                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                              />
                              <p className="text-[10px] text-muted-foreground/70">Ignored when a table is bound above — live count takes over.</p>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Trend Caption</label>
                              <input
                                type="text"
                                value={cfg.metricTrend || ""}
                                placeholder="e.g. +12% vs last month"
                                onChange={(e) => update({ metricTrend: e.target.value })}
                                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Accent</label>
                              <select
                                value={cfg.metricAccent || "blue"}
                                onChange={(e) => update({ metricAccent: e.target.value })}
                                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                              >
                                <option value="blue">Blue</option>
                                <option value="emerald">Emerald</option>
                                <option value="amber">Amber</option>
                                <option value="violet">Violet</option>
                                <option value="rose">Rose</option>
                              </select>
                            </div>
                          </div>
                        );
                      })()}

                      {/* EXPORT_BUTTON configuration */}
                      {blocks.find((b) => b.id === selectedBlock)?.type === "EXPORT_BUTTON" && (() => {
                        const b = blocks.find((b) => b.id === selectedBlock)!;
                        const cfg = b.config || {};
                        return (
                          <div className="space-y-1.5 pt-4 border-t border-border/30">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Button Label</label>
                            <input
                              type="text"
                              value={cfg.exportLabel || ""}
                              placeholder="Export CSV"
                              onChange={(e) =>
                                setBlocks((prev) =>
                                  prev.map((x) =>
                                    x.id === selectedBlock
                                      ? { ...x, config: { ...(x.config || {}), exportLabel: e.target.value } }
                                      : x
                                  )
                                )
                              }
                              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        );
                      })()}

                      {/* IMAGE configuration */}
                      {blocks.find((b) => b.id === selectedBlock)?.type === "IMAGE" && (() => {
                        const b = blocks.find((b) => b.id === selectedBlock)!;
                        const cfg = b.config || {};
                        const update = (patch: Record<string, unknown>) =>
                          setBlocks((prev) =>
                            prev.map((x) =>
                              x.id === selectedBlock
                                ? { ...x, config: { ...(x.config || {}), ...patch } }
                                : x
                            )
                          );
                        return (
                          <div className="space-y-3 pt-4 border-t border-border/30">
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Image URL</label>
                              <input
                                type="url"
                                value={cfg.imageUrl || ""}
                                placeholder="https://…/logo.png"
                                onChange={(e) => update({ imageUrl: e.target.value })}
                                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Alt Text</label>
                              <input
                                type="text"
                                value={cfg.imageAlt || ""}
                                placeholder="Company logo"
                                onChange={(e) => update({ imageAlt: e.target.value })}
                                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Width</label>
                                <select
                                  value={cfg.imageWidth || "md"}
                                  onChange={(e) => update({ imageWidth: e.target.value })}
                                  className="w-full text-sm px-3 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                  <option value="sm">Small</option>
                                  <option value="md">Medium</option>
                                  <option value="lg">Large</option>
                                  <option value="full">Full</option>
                                </select>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Align</label>
                                <select
                                  value={cfg.imageAlign || "center"}
                                  onChange={(e) => update({ imageAlign: e.target.value })}
                                  className="w-full text-sm px-3 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                  <option value="left">Left</option>
                                  <option value="center">Center</option>
                                  <option value="right">Right</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* GST_CALCULATOR configuration */}
                      {blocks.find((b) => b.id === selectedBlock)?.type === "GST_CALCULATOR" && (() => {
                        const b = blocks.find((b) => b.id === selectedBlock)!;
                        const cfg = b.config || {};
                        const update = (patch: Record<string, unknown>) =>
                          setBlocks((prev) =>
                            prev.map((x) =>
                              x.id === selectedBlock
                                ? { ...x, config: { ...(x.config || {}), ...patch } }
                                : x
                            )
                          );
                        return (
                          <div className="space-y-3 pt-4 border-t border-border/30">
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Default Amount (₹)</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={cfg.gstDefaultAmount ?? ""}
                                placeholder="1000"
                                onChange={(e) =>
                                  update({
                                    gstDefaultAmount:
                                      e.target.value === "" ? undefined : parseFloat(e.target.value),
                                  })
                                }
                                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Default GST Rate</label>
                              <select
                                value={cfg.gstDefaultRate || "18%"}
                                onChange={(e) => update({ gstDefaultRate: e.target.value })}
                                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                              >
                                <option value="0%">0%</option>
                                <option value="5%">5%</option>
                                <option value="12%">12%</option>
                                <option value="18%">18%</option>
                                <option value="28%">28%</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tax Split</label>
                              <select
                                value={cfg.gstSplit || "intrastate"}
                                onChange={(e) => update({ gstSplit: e.target.value })}
                                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                              >
                                <option value="intrastate">Intrastate (CGST + SGST)</option>
                                <option value="interstate">Interstate (IGST)</option>
                              </select>
                              <p className="text-[10px] text-muted-foreground/70">Intrastate splits GST equally between centre and state. Interstate uses the unified IGST.</p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* FILTER_BAR date range toggle */}
                      {blocks.find((b) => b.id === selectedBlock)?.type === "FILTER_BAR" && (() => {
                        const b = blocks.find((b) => b.id === selectedBlock)!;
                        const cfg = b.config || {};
                        return (
                          <div className="space-y-2 pt-4 border-t border-border/30">
                            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={!!cfg.includeDateRange}
                                onChange={(e) =>
                                  setBlocks((prev) =>
                                    prev.map((x) =>
                                      x.id === selectedBlock
                                        ? { ...x, config: { ...(x.config || {}), includeDateRange: e.target.checked } }
                                        : x
                                    )
                                  )
                                }
                                className="h-4 w-4 rounded border-border/60 focus:ring-primary/30"
                              />
                              <span className="font-medium text-foreground">Include date range picker</span>
                            </label>
                            <p className="text-[10px] text-muted-foreground/70">Adds two date inputs so users can filter records by a start and end date.</p>
                          </div>
                        );
                      })()}
                      
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
        
        {/* Drag Overlay for DnD */}
        <DragOverlay dropAnimation={{ duration: 250, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
          {activeDragId && activeDragData?.type === "palette-item" ? (
            <div
              className="flex items-center gap-3 px-3.5 py-3 text-[13px] rounded-xl font-medium shadow-2xl opacity-90 scale-105"
              style={{ background: "var(--card)", border: "1px solid var(--primary)", color: "var(--foreground)", width: 220 }}
            >
              <div className="p-1.5 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                {blockPalette.find((b) => b.type === activeDragData.blockType)?.icon}
              </div>
              {activeDragData.label}
            </div>
          ) : activeDragId && activeDragData?.type === "canvas-block" ? (
            <div
              className="rounded-2xl border shadow-2xl opacity-90 scale-[1.02]"
              style={{
                background: "var(--card)",
                borderColor: "var(--primary)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 3px color-mix(in oklch, var(--primary), transparent 80%)",
                ...blockSizeStyle(activeDragData.block.config),
                width: document.querySelector(`[data-block-id="${activeDragId}"]`)?.getBoundingClientRect().width,
                height: document.querySelector(`[data-block-id="${activeDragId}"]`)?.getBoundingClientRect().height,
              }}
            >
              <div className="p-6 opacity-60 pointer-events-none">
                <div className="text-xl font-bold">{activeDragData.block.label}</div>
                <div className="text-sm text-muted-foreground mt-2">Moving block...</div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
        </DndContext>
      </div>
    </div>
    </>
  );
}

function SortablePageLink({
  page,
  active,
  onDelete,
  basePath,
}: {
  page: any;
  active: boolean;
  onDelete: () => void;
  basePath: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: page.id });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Link
        href={`${basePath}/${page.id}/edit`}
        className={`group flex items-center gap-2 px-2 py-2.5 text-sm rounded-xl transition-colors ${
          active
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
        }`}
      >
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.preventDefault()}
          title="Drag to reorder"
          className="p-0.5 -ml-0.5 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <FileText
          className={`h-4 w-4 shrink-0 ${active ? "text-primary" : "opacity-60"}`}
        />
        <span className="truncate flex-1">{page.title}</span>
        {active && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            title="Delete page"
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-destructive transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </Link>
    </div>
  );
}

function PaletteItem({ block, preview, addBlock }: { block: any, preview: boolean, addBlock: any }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${block.type}`,
    data: { type: "palette-item", blockType: block.type, label: block.label },
    disabled: preview,
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => addBlock(block.type, block.label, block.icon)}
      className={`group flex items-center gap-3 px-3.5 py-3 text-[13px] rounded-xl transition-all duration-200 whitespace-nowrap w-full shrink-0 font-medium ${!preview ? "cursor-grab active:cursor-grabbing" : ""} card-interactive ${isDragging ? "opacity-40" : ""}`}
      style={{ background: "var(--card)", border: "1px solid var(--border-subtle)", color: "var(--foreground)" }}
    >
      <div className="p-1.5 rounded-md bg-secondary/80 group-hover:bg-primary/10 group-hover:text-primary transition-colors text-muted-foreground flex items-center justify-center">
        {block.icon}
      </div>
      {block.label}
      <Plus className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

function SortableCanvasBlock({ 
  block, preview, isResizing, selectedBlock, setSelectedBlock, 
  startResize, removeBlock, workspace, getKanbanCards, addKanbanCard, setKanbanCards, kanbanDragCard
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { type: "canvas-block", block },
    disabled: preview || isResizing
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 1,
    background: "var(--card)",
    borderColor: selectedBlock === block.id && !preview ? "var(--primary)" : "var(--border-subtle)",
    boxShadow: selectedBlock === block.id && !preview ? "0 0 0 3px color-mix(in oklch, var(--primary), transparent 85%)" : undefined,
    ...blockGridStyle(block.config),
  };

  return (
    <div
      ref={setNodeRef}
      data-block-id={block.id}
      onClick={() => !preview && setSelectedBlock(block.id)}
      className={`group relative rounded-2xl transition-all duration-200 border min-w-0 ${
        selectedBlock === block.id && !preview
          ? "shadow-md"
          : "shadow-sm hover:shadow-md"
      }`}
      style={style}
    >
      {/* Full block drag handle area - behind content to allow interaction with inputs */}
      {!preview && !isResizing && (
        <div {...attributes} {...listeners} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing rounded-2xl" />
      )}

      {/* Resize handles */}
      {!preview && selectedBlock === block.id && (
        <>
          {(["right", "left"] as const).map((side) => (
            <div
              key={side}
              onPointerDown={(e) => startResize(e, block.id, side)}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              title={`Drag to resize width`}
              className={`absolute top-1/2 -translate-y-1/2 ${side === "right" ? "-right-2" : "-left-2"} w-4 h-10 cursor-ew-resize z-30 flex items-center justify-center`}
            >
              <span
                className="block w-3 h-3 rounded-full"
                style={{
                  background: "var(--primary)",
                  border: "2px solid var(--background)",
                  boxShadow: "0 1px 3px color-mix(in oklch, black, transparent 70%)",
                }}
              />
            </div>
          ))}
          {(["bottom", "top"] as const).map((side) => (
            <div
              key={side}
              onPointerDown={(e) => startResize(e, block.id, side)}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              title={`Drag to resize height`}
              className={`absolute left-1/2 -translate-x-1/2 ${side === "bottom" ? "-bottom-2" : "-top-2"} w-10 h-4 cursor-ns-resize z-30 flex items-center justify-center`}
            >
              <span
                className="block w-3 h-3 rounded-full"
                style={{
                  background: "var(--primary)",
                  border: "2px solid var(--background)",
                  boxShadow: "0 1px 3px color-mix(in oklch, black, transparent 70%)",
                }}
              />
            </div>
          ))}
        </>
      )}

      {/* Block toolbar */}
      {!preview && (
        <div className="absolute -top-3 left-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-border shadow-md backdrop-blur-sm">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 rounded hover:bg-secondary">
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </div>
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

      {/* Block content - z-10 so it sits above drag listener */}
      <div className="p-6 relative z-10 pointer-events-auto w-full h-full max-w-full overflow-hidden flex flex-col min-w-0">
        {block.type === "SPACE" && (
          <div className={`w-full h-full min-h-[60px] ${!preview ? "border-2 border-dashed rounded-xl flex items-center justify-center bg-secondary/5" : ""}`}
            style={{ borderColor: !preview ? "var(--border)" : "transparent" }}
          >
            {!preview && <span className="text-xs font-medium uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--foreground-muted)" }}><LayoutTemplate className="h-3 w-3" /> Spacer</span>}
          </div>
        )}

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
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 relative group w-full">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder={`Search ${block.label}...`}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-secondary/30 border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                readOnly={!preview}
              />
            </div>
            {block.config?.includeDateRange && (
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="date"
                    className="pl-8 pr-2 py-2 text-sm rounded-xl bg-secondary/30 border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                    readOnly={!preview}
                  />
                </div>
                <span className="text-xs text-muted-foreground">to</span>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="date"
                    className="pl-8 pr-2 py-2 text-sm rounded-xl bg-secondary/30 border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                    readOnly={!preview}
                  />
                </div>
              </div>
            )}
            <Button variant="outline" className="gap-2 shrink-0 h-10 rounded-xl bg-background border-border/60 hover:bg-secondary/50">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        )}

        {block.type === "TABLE_VIEW" && (() => {
          const tableRef = block.config?.tableRef;
          const resolvedTable = workspace?.tables?.find((t: any) => t.name === tableRef);
          if (!resolvedTable) {
            return (
              <div className="p-10 border-2 border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-secondary/20">
                <Table2 className="h-8 w-8 mb-3 opacity-40" />
                <p className="text-sm font-medium">No table connected.</p>
                <p className="text-xs mt-1 opacity-70">Pick one in Configuration → Target Database Table.</p>
              </div>
            );
          }
          const visibleFields = block.config?.visibleFields ?? [];
          return (
            <TableView
              config={{ tableRef, visibleFields }}
              tableId={resolvedTable.id}
            />
          );
        })()}

        {block.type === "KANBAN_VIEW" && (() => {
          const tableRef = block.config?.tableRef;
          const resolvedTable = workspace?.tables?.find((t: any) => t.name === tableRef);
          if (resolvedTable) {
            return (
              <KanbanView
                config={{
                  tableRef,
                  groupByField: block.config?.groupByField,
                }}
                tableId={resolvedTable.id}
              />
            );
          }
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
                  const colCards = cards.filter((c: any) => c.col === col);
                  return (
                    <div
                      key={col}
                      className="flex-1 min-w-[190px] rounded-xl p-3 bg-secondary/30 border border-border/30"
                    >
                      <div className="flex items-center justify-between mb-3 px-1">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{col}</h4>
                        <span className="text-[10px] font-medium bg-background px-1.5 py-0.5 rounded text-muted-foreground border border-border/50">
                          {colCards.length}
                        </span>
                      </div>
                      <div className="space-y-2 min-h-[60px]">
                        {colCards.map((card: any) => (
                          <div
                            key={card.id}
                            className="rounded-lg p-3 text-sm bg-card border border-border/40 text-foreground shadow-sm hover:border-primary/30 hover:shadow-md transition-all group/card"
                          >
                            <p className="font-medium text-[13px] leading-snug">{card.title}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{card.tag}</Badge>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setKanbanCards((prev: any) => ({
                                    ...prev,
                                    [block.id]: (prev[block.id] || []).filter((c: any) => c.id !== card.id)
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

        {block.type === "METRIC" && (() => {
          const tableRef = block.config?.tableRef;
          const resolvedTable = workspace?.tables?.find((t: any) => t.name === tableRef);
          return (
            <MetricCard
              config={{ ...block.config, metricLabel: block.config?.metricLabel || block.label }}
              tableId={resolvedTable?.id}
            />
          );
        })()}

        {block.type === "EXPORT_BUTTON" && (() => {
          const tableRef = block.config?.tableRef;
          const resolvedTable = workspace?.tables?.find((t: any) => t.name === tableRef);
          return (
            <ExportButton
              config={block.config || {}}
              tableId={resolvedTable?.id}
            />
          );
        })()}

        {block.type === "IMAGE" && (
          <ImageBlock config={block.config || {}} />
        )}

        {block.type === "GST_CALCULATOR" && (
          <GstCalculator config={block.config || {}} />
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
  );
}

function CanvasDropZone({ preview }: { preview: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-dropzone",
    data: { type: "canvas-dropzone" }
  });
  
  if (preview) return null;
  
  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl p-10 text-center transition-all duration-300 border-2 border-dashed ${
        isOver ? "border-primary bg-primary/10 text-primary scale-[1.02]" : "border-border/60 bg-transparent text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
      } cursor-pointer group col-span-full`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${
        isOver ? "bg-primary/20" : "bg-secondary/80 group-hover:bg-primary/10"
      }`}>
        <Plus className="h-5 w-5 opacity-70" />
      </div>
      <p className="text-sm font-medium">Drag components here to add a new block</p>
      <p className="text-xs opacity-60 mt-1">Supports Tables, Kanban, Forms and visual elements</p>
    </div>
  );
}
