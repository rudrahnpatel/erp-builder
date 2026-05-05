"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
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
  Plus,
  Loader2,
  Package,
  Trash2,
  PenLine,
  Layers,
  GripVertical,
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
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type PageItem = {
  id: string;
  title: string;
  icon: string | null;
  packSource: string | null;
  packPageKey: string | null;
  order: number;
};

export default function ModulePagesPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = use(params);
  const router = useRouter();

  const { data, mutate, isLoading } = useSWR(
    `/api/dev/modules/${moduleId}/pages`,
    fetcher
  );
  const allPages: PageItem[] = data?.pages || [];

  const [creatingPage, setCreatingPage] = useState(false);
  const [pages, setPages] = useState<PageItem[]>([]);

  useEffect(() => {
    setPages(allPages);
  }, [allPages]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
      mutate();
    } catch {
      toast.error("Failed to save new page order");
      setPages(allPages);
    }
  };

  const handleCreatePage = async () => {
    setCreatingPage(true);
    const pending = toast.loading("Creating page...");
    try {
      const res = await fetch(`/api/dev/modules/${moduleId}/pages`, {
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
        await mutate();
        router.push(`/dev/modules/${moduleId}/pages/${page.id}/edit`);
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
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    const pending = toast.loading("Deleting page...");
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Page deleted", { id: pending });
        await mutate();
      } else {
        toast.error("Failed to delete page", { id: pending });
      }
    } catch {
      toast.error("Network error", { id: pending });
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Sub-header with create button */}
      <div className="flex items-center justify-between">
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          Design pages for this module. They'll be included in the next
          snapshot.
        </p>
        <Button
          onClick={handleCreatePage}
          disabled={creatingPage}
          className="gap-2 font-semibold shrink-0 rounded-xl pressable"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--primary-hover))",
            color: "var(--primary-foreground)",
            boxShadow:
              "0 2px 8px color-mix(in oklch, var(--primary), transparent 65%)",
          }}
        >
          {creatingPage ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating…
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> New Page
            </>
          )}
        </Button>
      </div>

      {/* Pages Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl p-5 animate-pulse"
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border-subtle)",
                height: "160px",
              }}
            />
          ))}
        </div>
      ) : pages.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pages.map((p) => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
              {pages.map((page) => (
                <SortablePageCard
                  key={page.id}
                  page={page}
                  onOpen={() =>
                    router.push(
                      `/dev/modules/${moduleId}/pages/${page.id}/edit`
                    )
                  }
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
            No pages in this module
          </h3>
          <p
            className="text-sm mb-6 max-w-sm mx-auto leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Create pages to build operational dashboards, data-entry forms, and
            report views for this module.
          </p>
          <Button
            onClick={handleCreatePage}
            disabled={creatingPage}
            className="gap-2 font-semibold rounded-xl pressable"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--primary-hover))",
              color: "var(--primary-foreground)",
              boxShadow:
                "0 2px 8px color-mix(in oklch, var(--primary), transparent 65%)",
            }}
          >
            {creatingPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Create First Page
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Sortable Page Card ───────────────────────────────────────────────────────

function SortablePageCard({
  page,
  onOpen,
  onDelete,
}: {
  page: PageItem;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

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
        style={{ background: "var(--primary)" }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{
              background: "var(--surface-3)",
              color: "var(--foreground)",
            }}
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
        </div>
      </div>
    </div>
  );
}
