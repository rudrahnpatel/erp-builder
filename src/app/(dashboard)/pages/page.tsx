"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/use-workspace";
import { DevModeGate } from "@/components/layout/DevModeGate";
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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import {
  FileText,
  LayoutDashboard,
  Activity,
  Trash2,
  PenLine,
  Plus,
  Loader2,
  Package,
  Box,
  Truck,
  Warehouse,
  ArrowLeftRight,
  FilePlus,
  List,
  BellRing,
  AlertTriangle,
  Users,
  Kanban,
  User,
  Handshake,
  Briefcase,
  Clock,
  IndianRupee,
  Receipt,
  Layers,
  GripVertical,
} from "lucide-react";

const IconMap: Record<string, any> = {
  "file-text": FileText,
  "layout-dashboard": LayoutDashboard,
  "package": Package,
  "box": Box,
  "truck": Truck,
  "warehouse": Warehouse,
  "arrow-left-right": ArrowLeftRight,
  "file-plus": FilePlus,
  "list": List,
  "bell-ring": BellRing,
  "alert-triangle": AlertTriangle,
  "users": Users,
  "kanban": Kanban,
  "user": User,
  "handshake": Handshake,
  "briefcase": Briefcase,
  "clock": Clock,
  "indian-rupee": IndianRupee,
  "receipt": Receipt,
};
import { Button } from "@/components/ui/button";

// System pages are rendered with a hardcoded UI at runtime (Settings has its
// own tabs component; user_management is merged into Settings → Users). Both
// are hidden from this builder grid since there's nothing meaningful to edit
// via the block composer.
const SYSTEM_PAGE_KEYS = new Set(["settings", "user_management"]);

type PageItem = NonNullable<ReturnType<typeof useWorkspace>["workspace"]>["pages"][number];

export default function PagesPage() {
  const router = useRouter();
  const { workspace, refetch } = useWorkspace();

  const [creatingPage, setCreatingPage] = useState(false);
  // Local copy so we can reorder optimistically during DnD without waiting
  // for SWR to round-trip back to this component.
  const [pages, setPages] = useState<PageItem[]>([]);

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pages.findIndex((p) => p.id === active.id);
    const newIndex = pages.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(pages, oldIndex, newIndex);
    setPages(next);

    try {
      const res = await fetch("/api/pages/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageIds: next.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error("reorder failed");
      // Keep SWR cache in sync so sidebars elsewhere pick up the new order.
      refetch();
    } catch {
      toast.error("Failed to save new page order");
      // Roll back to the server's current ordering.
      const visible = (workspace?.pages || []).filter(
        (p) => !p.packPageKey || !SYSTEM_PAGE_KEYS.has(p.packPageKey)
      );
      setPages(visible);
    }
  };

  const handleCreatePage = async () => {
    setCreatingPage(true);
    const pending = toast.loading("Creating page...");
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Page",
          blocks: [],
        }),
      });

      if (res.ok) {
        const page = await res.json();
        toast.success("Page created", { id: pending });
        await refetch();
        router.push(`/pages/${page.id}/edit`);
      } else {
        toast.error("Failed to create page", { id: pending });
      }
    } catch (e) {
      toast.error("Network error", { id: pending });
    } finally {
      setCreatingPage(false);
    }
  };

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
    <DevModeGate>
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in-up">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight"
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
        <Button
          onClick={handleCreatePage}
          disabled={creatingPage}
          className="gap-2 font-semibold shrink-0 rounded-xl pressable"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
            color: "var(--primary-foreground)",
            boxShadow: "0 2px 8px color-mix(in oklch, var(--primary), transparent 65%)",
          }}
        >
          {creatingPage ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
          ) : (
            <><Plus className="h-4 w-4" /> New Page</>
          )}
        </Button>
      </header>

      {/* Pages Grid */}
      {pages.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pages.map((p) => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pages.map((page) => (
                <SortablePageCard
                  key={page.id}
                  page={page}
                  onOpen={() => router.push(`/pages/${page.id}/edit`)}
                  onDelete={() => handleDeletePage(page.id, page.title)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
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
            <Layers className="h-7 w-7" aria-hidden="true" />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            No pages built yet
          </h3>
          <p
            className="text-sm mb-6 max-w-sm mx-auto leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Create a custom page from scratch or install modules from the marketplace
            to get pre-built operational dashboards.
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
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
              ) : (
                <><Plus className="h-4 w-4" /> Create Page</>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/modules')}
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

function SortablePageCard({
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
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
    background: "var(--card)",
    border: "1px solid var(--border-subtle)",
  };

  const IconComponent = page.icon ? IconMap[page.icon] : LayoutDashboard;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex flex-col justify-between rounded-xl transition-all duration-300 card-interactive cursor-pointer overflow-hidden"
      onClick={onOpen}
    >
      <div
        className="h-[3px] w-full"
        style={{
          background: page.packSource ? "var(--primary)" : "var(--accent-amber)",
        }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{ background: "var(--surface-3)", color: "var(--foreground)" }}
          >
            {IconComponent ? (
              <IconComponent className="h-5 w-5" />
            ) : (
              <LayoutDashboard className="h-5 w-5" />
            )}
          </div>

          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              {...attributes}
              {...listeners}
              className="p-1.5 rounded-lg hover-bg-subtle focus-ring cursor-grab active:cursor-grabbing"
              style={{ color: "var(--foreground-muted)" }}
              title="Drag to reorder"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <button
              className="p-1.5 rounded-lg hover-bg-subtle focus-ring"
              style={{ color: "var(--foreground-muted)" }}
              onClick={onOpen}
              title="Edit Page"
            >
              <PenLine className="h-4 w-4" />
            </button>
            <button
              className="p-1.5 rounded-lg transition-colors focus-ring"
              style={{ color: "var(--danger)" }}
              onClick={onDelete}
              title="Delete Page"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--danger-subtle)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h3
          className="text-[15px] font-semibold mb-1 truncate"
          style={{ color: "var(--foreground)" }}
        >
          {page.title}
        </h3>

        <div className="flex items-center gap-3 mt-4">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "var(--success)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--success)" }}
            />
            Active
          </span>

          {page.packSource && (
            <span
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: "color-mix(in oklch, var(--primary), transparent 88%)",
                color: "var(--primary)",
                border: "1px solid color-mix(in oklch, var(--primary), transparent 75%)",
              }}
            >
              <Package className="h-2.5 w-2.5" />
              Installed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
