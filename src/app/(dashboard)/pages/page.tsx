"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/use-workspace";

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import {
  RiFileTextLine,
  RiDashboardLine,
  RiArchiveLine,
  RiBox3Line,
  RiTruckLine,
  RiStore3Line,
  RiArrowLeftRightLine,
  RiFileAddLine,
  RiListUnordered,
  RiNotification3Line,
  RiAlertLine,
  RiGroupLine,
  RiKanbanView,
  RiUserLine,
  RiHandCoinLine,
  RiBriefcaseLine,
  RiTimeLine,
  RiMoneyRupeeCircleLine,
  RiReceiptLine,
  RiStackLine,
  RiPulseLine,
  RiDeleteBinLine,
  RiPencilLine,
  RiAddLine,
  RiLoader4Line,
  RiDraggable,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiFolderOpenLine,
  RiArrowUpDownLine,
  RiEyeLine,
  RiCheckDoubleLine,
} from "react-icons/ri";
import { Button } from "@/components/ui/button";

const IconMap: Record<string, any> = {
  "file-text": RiFileTextLine,
  "layout-dashboard": RiDashboardLine,
  "package": RiArchiveLine,
  "box": RiBox3Line,
  "truck": RiTruckLine,
  "warehouse": RiStore3Line,
  "arrow-left-right": RiArrowLeftRightLine,
  "file-plus": RiFileAddLine,
  "list": RiListUnordered,
  "bell-ring": RiNotification3Line,
  "alert-triangle": RiAlertLine,
  "users": RiGroupLine,
  "kanban": RiKanbanView,
  "user": RiUserLine,
  "handshake": RiHandCoinLine,
  "briefcase": RiBriefcaseLine,
  "clock": RiTimeLine,
  "indian-rupee": RiMoneyRupeeCircleLine,
  "receipt": RiReceiptLine,
  "layers": RiStackLine,
  "activity": RiPulseLine,
};

const SYSTEM_PAGE_KEYS = new Set(["settings", "user_management"]);

type PageItem = NonNullable<ReturnType<typeof useWorkspace>["workspace"]>["pages"][number];

type DisplayNode =
  | { type: "flat"; id: string; page: PageItem; index: number }
  | { type: "group"; id: string; packSource: string; pages: PageItem[]; index: number };

const formatPackName = (slug: string) => {
  if (slug === "hr") return "HR";
  if (slug === "crm") return "CRM";
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

// ─── Collapsible Group Row (drag handle + collapse) ───────────────────────
function SortableGroupRow({
  node,
  isOpen,
  onToggle,
  children,
}: {
  node: DisplayNode & { type: "group" };
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: node.id });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-1">
      {/* Group header */}
      <div
        className={`group flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
          isDragging ? "bg-[var(--surface-2)] ring-1 ring-[var(--primary)] ring-opacity-40" : "hover:bg-[var(--surface-2)]"
        }`}
      >
        {/* Drag handle for whole group */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded cursor-grab active:cursor-grabbing text-[var(--foreground-dimmed)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors shrink-0"
          onClick={(e) => e.stopPropagation()}
          title="Drag to reorder group"
        >
          <RiDraggable className="h-4 w-4" />
        </button>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          {isOpen ? (
            <RiArrowDownSLine className="h-4 w-4 text-[var(--foreground-dimmed)] shrink-0 transition-transform duration-150" />
          ) : (
            <RiArrowRightSLine className="h-4 w-4 text-[var(--foreground-dimmed)] shrink-0 transition-transform duration-150" />
          )}
          <RiFolderOpenLine className="h-4 w-4 shrink-0" style={{ color: "var(--primary)" }} />
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--foreground-muted)]">
            {formatPackName(node.packSource)}
          </span>
          <span
            className="ml-1 text-[9px] font-semibold px-1.5 py-[1px] rounded-full"
            style={{
              background: "color-mix(in oklch, var(--primary), transparent 88%)",
              color: "var(--primary)",
            }}
          >
            {node.pages.length}
          </span>
        </button>
      </div>

      {/* Children with animated collapse */}
      {isOpen && (
        <div className="ml-8 pl-3 border-l border-[var(--border-subtle)] mt-0.5 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Individual Page Row ──────────────────────────────────────────────────
function SortablePageRow({
  page,
  onOpen,
  onDelete,
}: {
  page: PageItem;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: page.id });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const IconComponent = page.icon ? (IconMap[page.icon] ?? RiDashboardLine) : RiDashboardLine;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isDragging ? "bg-[var(--surface-2)] shadow-sm" : "hover:bg-[var(--surface-2)]"
      }`}
      onClick={onOpen}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded cursor-grab active:cursor-grabbing text-[var(--foreground-dimmed)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <RiDraggable className="h-4 w-4" />
        </button>
        <IconComponent className="h-4 w-4 shrink-0 text-[var(--foreground-muted)]" />
        <span className="text-[13px] font-medium text-[var(--foreground)] truncate">
          {page.title}
        </span>
      </div>

      <div
        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="p-1.5 rounded hover:bg-[var(--surface-3)] text-[var(--foreground-muted)] transition-colors"
          onClick={onOpen}
          title="RiEdit2Line Page"
        >
          <RiPencilLine className="h-4 w-4" />
        </button>
        <button
          className="p-1.5 rounded text-[var(--danger)] hover:bg-[var(--danger-subtle)] transition-colors"
          onClick={onDelete}
          title="Delete Page"
        >
          <RiDeleteBinLine className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function PagesPage() {
  const router = useRouter();
  const { workspace, refetch } = useWorkspace();

  const [creatingPage, setCreatingPage] = useState(false);
  const [pages, setPages] = useState<PageItem[]>([]);
  // Track which groups are collapsed. Default all open.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const visible = (workspace?.pages || []).filter(
      (p) => !p.packPageKey || !SYSTEM_PAGE_KEYS.has(p.packPageKey)
    );
    setPages(visible);
  }, [workspace?.pages]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Build display nodes ─────────────────────────────────────────────────────
  const buildDisplayNodes = (pageList: PageItem[]): DisplayNode[] => {
    const grouped: Record<string, PageItem[]> = {};
    const flat: PageItem[] = [];

    pageList.forEach((p) => {
      if (p.packSource) {
        if (!grouped[p.packSource]) grouped[p.packSource] = [];
        grouped[p.packSource].push(p);
      } else {
        flat.push(p);
      }
    });

    // Flatten single-page groups
    Object.keys(grouped).forEach((src) => {
      if (grouped[src].length === 1) {
        flat.push(grouped[src][0]);
        delete grouped[src];
      }
    });

    const nodes: DisplayNode[] = [];
    flat.forEach((p) => {
      const index = pageList.findIndex((x) => x.id === p.id);
      nodes.push({ type: "flat", id: p.id, page: p, index });
    });
    Object.entries(grouped).forEach(([src, gPages]) => {
      const index = pageList.findIndex((x) => x.id === gPages[0].id);
      nodes.push({ type: "group", id: src, packSource: src, pages: gPages, index });
    });

    return nodes.sort((a, b) => a.index - b.index);
  };

  const displayNodes = buildDisplayNodes(pages);

  // Drag end — works for both flat pages and group tokens ──────────────────
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Resolve the group of IDs that "activeId" represents
    const getPageIds = (nodeId: string): string[] => {
      const node = displayNodes.find((n) => n.id === nodeId);
      if (!node) return [nodeId]; // plain page id
      if (node.type === "group") return node.pages.map((p) => p.id);
      return [node.page.id];
    };

    const activePageIds = getPageIds(activeId);
    const overPageIds = getPageIds(overId);

    // Find the first and last positions in `pages` array
    const activeFirstIdx = pages.findIndex((p) => p.id === activePageIds[0]);
    const overFirstIdx = pages.findIndex((p) => p.id === overPageIds[0]);

    if (activeFirstIdx < 0 || overFirstIdx < 0) return;

    // Pull out the active block from pages
    const activeBlock = activePageIds.map((id) => pages.find((p) => p.id === id)!);
    const remaining = pages.filter((p) => !activePageIds.includes(p.id));

    // Insert at over position
    const insertAt = remaining.findIndex((p) => p.id === overPageIds[0]);
    const finalInsert = insertAt < 0 ? remaining.length : insertAt;

    const next = [
      ...remaining.slice(0, finalInsert),
      ...activeBlock,
      ...remaining.slice(finalInsert),
    ];

    setPages(next);
  };

  // Publish / Discard ───────────────────────────────────────────────────────
  const originalPages = (workspace?.pages || []).filter(
    (p) => !p.packPageKey || !SYSTEM_PAGE_KEYS.has(p.packPageKey)
  );
  const isDirty =
    pages.length > 0 &&
    originalPages.length > 0 &&
    pages.map((p) => p.id).join() !== originalPages.map((p) => p.id).join();

  const handlePublish = async () => {
    const pending = toast.loading("Publishing changes...");
    try {
      const res = await fetch("/api/pages/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageIds: pages.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error("reorder failed");
      toast.success("Changes published", { id: pending });
      await refetch();
    } catch {
      toast.error("Failed to publish changes", { id: pending });
    }
  };

  const handleDiscard = () => setPages(originalPages);

  // Create / Delete ─────────────────────────────────────────────────────────
  const handleCreatePage = async () => {
    setCreatingPage(true);
    const pending = toast.loading("Creating page...");
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Page", blocks: [] }),
      });
      if (res.ok) {
        const page = await res.json();
        toast.success("Page created", { id: pending });
        await refetch();
        router.push(`/pages/${page.id}/edit`);
      } else {
        toast.error("Failed to create page", { id: pending });
      }
    } catch {
      toast.error("Network error", { id: pending });
    } finally {
      setCreatingPage(false);
    }
  };

  const handleDeletePage = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const pending = toast.loading("Deleting page...");
    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Page deleted", { id: pending });
        await refetch();
      } else {
        toast.error("Failed to delete page", { id: pending });
      }
    } catch {
      toast.error("Network error", { id: pending });
    }
  };

  const toggleGroup = (packSource: string) =>
    setCollapsed((prev) => ({ ...prev, [packSource]: !prev[packSource] }));

  if (!workspace) return null;

  // Stats ───────────────────────────────────────────────────────────────────
  const totalPages = pages.length;
  const installedCount = pages.filter((p) => !!p.packSource).length;
  const customCount = totalPages - installedCount;
  const groupCount = displayNodes.filter((n) => n.type === "group").length;

  // All sortable IDs: group IDs + flat page IDs
  const allDraggableIds = displayNodes.map((n) => n.id);

  return (
    <>
      <div className="space-y-6 max-w-3xl mx-auto animate-fade-in-up">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p
              className="text-[11px] font-medium uppercase tracking-[0.14em] mb-2 mono"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              / builder · pages
            </p>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              Manage Pages
            </h1>
            <p
              className="mt-1.5 text-sm leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              Drag pages or entire module groups to reorder. Click a folder to collapse it.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {isDirty && (
              <>
                <Button
                  variant="ghost"
                  onClick={handleDiscard}
                  className="rounded-xl text-sm"
                >
                  Discard
                </Button>
                <Button
                  onClick={handlePublish}
                  className="gap-2 font-semibold rounded-xl pressable text-sm"
                  style={{ background: "var(--success)", color: "#fff" }}
                >
                  <RiCheckDoubleLine className="h-4 w-4" />
                  Publish
                </Button>
              </>
            )}
            <Button
              onClick={handleCreatePage}
              disabled={creatingPage}
              className="gap-2 font-semibold rounded-xl pressable text-sm"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                color: "var(--primary-foreground)",
                boxShadow: "0 2px 8px color-mix(in oklch, var(--primary), transparent 65%)",
              }}
            >
              {creatingPage ? (
                <><RiLoader4Line className="h-4 w-4 animate-spin" /> Creating…</>
              ) : (
                <><RiAddLine className="h-4 w-4" /> New Page</>
              )}
            </Button>
          </div>
        </header>

        {/* ── Stats bar ──────────────────────────────────────────────────── */}
        {totalPages > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: RiStackLine, label: "Total Pages", value: totalPages },
              { icon: RiFolderOpenLine, label: "Modules", value: groupCount, color: "var(--primary)" },
              { icon: RiFileTextLine, label: "Custom", value: customCount, color: "var(--accent-amber)" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
              >
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: color
                      ? `color-mix(in oklch, ${color}, transparent 85%)`
                      : "var(--surface-2)",
                    color: color ?? "var(--foreground-muted)",
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[18px] font-bold leading-none" style={{ color: "var(--foreground)" }}>
                    {value}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--foreground-dimmed)" }}>
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tree view ──────────────────────────────────────────────────── */}
        {pages.length > 0 ? (
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
          >
            {/* Drag hint bar */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 border-b text-[11px]"
              style={{ borderColor: "var(--border-subtle)", color: "var(--foreground-dimmed)", background: "var(--surface-2)" }}
            >
              <RiArrowUpDownLine className="h-3 w-3" />
              Drag <strong>⠿</strong> handles to reorder pages or entire module groups
              {isDirty && (
                <span
                  className="ml-auto inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: "color-mix(in oklch, var(--accent-amber), transparent 80%)", color: "var(--accent-amber)" }}
                >
                  ● Unsaved draft
                </span>
              )}
            </div>

            <div className="p-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={allDraggableIds} strategy={verticalListSortingStrategy}>
                  {displayNodes.map((node) => {
                    if (node.type === "group") {
                      const isOpen = !collapsed[node.packSource];
                      return (
                        <SortableGroupRow
                          key={node.id}
                          node={node}
                          isOpen={isOpen}
                          onToggle={() => toggleGroup(node.packSource)}
                        >
                          {node.pages.map((page) => (
                            <SortablePageRow
                              key={page.id}
                              page={page}
                              onOpen={() => router.push(`/pages/${page.id}/edit`)}
                              onDelete={() => handleDeletePage(page.id, page.title)}
                            />
                          ))}
                        </SortableGroupRow>
                      );
                    } else {
                      return (
                        <SortablePageRow
                          key={node.id}
                          page={node.page}
                          onOpen={() => router.push(`/pages/${node.page.id}/edit`)}
                          onDelete={() => handleDeletePage(node.page.id, node.page.title)}
                        />
                      );
                    }
                  })}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-14 text-center"
            style={{ background: "var(--surface-1)", border: "2px dashed var(--border)" }}
          >
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "var(--surface-2)", color: "var(--foreground-muted)" }}
            >
              <RiStackLine className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--foreground)" }}>
              No pages built yet
            </h3>
            <p
              className="text-sm mb-6 max-w-sm mx-auto leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              Create a custom page from scratch or install modules from the marketplace.
            </p>
            <div className="flex items-center gap-3 justify-center">
              <Button
                onClick={handleCreatePage}
                disabled={creatingPage}
                className="gap-2 font-semibold rounded-xl pressable"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                  color: "var(--primary-foreground)",
                  boxShadow: "0 2px 8px color-mix(in oklch, var(--primary), transparent 65%)",
                }}
              >
                {creatingPage ? (
                  <><RiLoader4Line className="h-4 w-4 animate-spin" /> Creating…</>
                ) : (
                  <><RiAddLine className="h-4 w-4" /> Create Page</>
                )}
              </Button>
              <Button variant="outline" onClick={() => router.push("/modules")} className="text-sm rounded-xl">
                Browse Marketplace
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
