"use client";

import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { RiDraggable, RiEyeLine, RiEyeOffLine, RiLockLine, RiBuilding4Line, RiFileTextLine, RiUserLine, RiHashtag, RiTableLine, RiCalculatorLine, RiPencilLine, RiLoader4Line } from "react-icons/ri";
import { RiPhoneLine, RiFileListLine, RiRestartLine } from "react-icons/ri";

//  Types 

export type SectionId =
  | "header"
  | "contact"
  | "pan"
  | "meta"
  | "subject"
  | "client"
  | "items"
  | "totals"
  | "terms"
  | "signature";

export interface LayoutSection {
  id: SectionId;
  visible: boolean;
}

export type QuotationLayout = {
  sections: LayoutSection[];
};

export const DEFAULT_LAYOUT: QuotationLayout = {
  sections: [
    { id: "header",    visible: true },
    { id: "contact",   visible: true },
    { id: "pan",       visible: true },
    { id: "meta",      visible: true },
    { id: "subject",   visible: true },
    { id: "client",    visible: true },
    { id: "items",     visible: true },   // locked : always visible
    { id: "totals",    visible: true },
    { id: "terms",     visible: true },
    { id: "signature", visible: true },
  ],
};

const SECTION_META: Record<
  SectionId,
  { label: string; description: string; icon: React.ComponentType<{ className?: string }>; locked?: boolean; zone: "header" | "items" | "tail" }
> = {
  header:    { label: "Company Header",   description: "Logo, name & tagline",          icon: RiBuilding4Line,  zone: "header" },
  contact:   { label: "Contact Info",     description: "Phone, email & website",         icon: RiPhoneLine,      zone: "header" },
  pan:       { label: "PAN / GST No.",    description: "Tax ID shown under contact",     icon: RiHashtag,       zone: "header" },
  meta:      { label: "Document Meta",    description: "Quotation No., Date, Valid Till",icon: RiFileTextLine,   zone: "header" },
  subject:   { label: "Subject Line",     description: "What the quotation is for",      icon: RiFileListLine, zone: "header" },
  client:    { label: "Client Info",      description: "Bill To section",                icon: RiUserLine,       zone: "header" },
  items:     { label: "Items Table",      description: "Products / Services list",       icon: RiTableLine,     zone: "items",  locked: true },
  totals:    { label: "Totals",           description: "Subtotal, GST & Grand Total",    icon: RiCalculatorLine, zone: "tail"   },
  terms:     { label: "Terms & Conditions", description: "Payment terms & clauses",     icon: RiFileListLine, zone: "tail"   },
  signature: { label: "Signature Block",  description: "Authorized signatory",           icon: RiPencilLine,    zone: "tail"   },
};

//  Sortable Section Card 

function SectionCard({
  section,
  onToggle,
}: {
  section: LayoutSection;
  onToggle: () => void;
}) {
  const meta = SECTION_META[section.id];
  const Icon = meta.icon;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, disabled: meta.locked });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const zoneBadgeColor =
    meta.zone === "header"
      ? { background: "color-mix(in oklch, var(--primary), transparent 88%)", color: "var(--primary)" }
      : meta.zone === "items"
      ? { background: "color-mix(in oklch, var(--accent-amber), transparent 85%)", color: "var(--accent-amber)" }
      : { background: "color-mix(in oklch, var(--success, #22c55e), transparent 88%)", color: "var(--success, #16a34a)" };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all group ${
        !section.visible && !meta.locked ? "opacity-50" : ""
      }`}
      {...(isDragging
        ? {}
        : {})}
      data-dragging={isDragging}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className={`p-1 rounded-md cursor-grab active:cursor-grabbing transition-colors ${
          meta.locked ? "opacity-20 cursor-not-allowed" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        }`}
      >
        {meta.locked ? (
          <RiLockLine className="h-4 w-4 text-gray-400" />
        ) : (
          <RiDraggable className="h-4 w-4" />
        )}
      </div>

      {/* Icon */}
      <div
        className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={zoneBadgeColor}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{meta.label}</p>
        <p className="text-xs text-gray-400 truncate">{meta.description}</p>
      </div>

      {/* Locked badge */}
      {meta.locked && (
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
          Required
        </span>
      )}

      {/* Visibility toggle */}
      {!meta.locked && (
        <button
          onClick={onToggle}
          className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
            section.visible
              ? "text-blue-600 hover:bg-blue-50"
              : "text-gray-300 hover:bg-gray-100 hover:text-gray-500"
          }`}
          title={section.visible ? "Click to hide" : "Click to show"}
        >
          {section.visible ? <RiEyeLine className="h-4 w-4" /> : <RiEyeOffLine className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

//  Mini A4 Preview 

function MiniPreview({ sections }: { sections: LayoutSection[] }) {
  const PREVIEW_BLOCKS: Partial<Record<SectionId, { height: number; label: string; color: string }>> = {
    header:    { height: 36, label: " Company Header",   color: "#dbeafe" },
    contact:   { height: 18, label: " Contact Info",      color: "#e0f2fe" },
    pan:       { height: 12, label: "# PAN / GST",          color: "#f0fdf4" },
    meta:      { height: 22, label: " Doc Meta",           color: "#fef9c3" },
    subject:   { height: 14, label: " Subject",            color: "#fce7f3" },
    client:    { height: 28, label: " Client Info",        color: "#ede9fe" },
    items:     { height: 60, label: " Items Table",        color: "#f1f5f9" },
    totals:    { height: 28, label: " Totals",             color: "#dcfce7" },
    terms:     { height: 24, label: " Terms",              color: "#fef3c7" },
    signature: { height: 18, label: "  Signature",          color: "#fce7f3" },
  };

  const visibleSections = sections.filter((s) => s.visible);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live Preview</p>
      <div
        className="w-36 rounded-lg shadow-lg border border-gray-200 overflow-hidden bg-white flex flex-col"
        style={{ minHeight: 200 }}
      >
        {visibleSections.map((s) => {
          const block = PREVIEW_BLOCKS[s.id];
          if (!block) return null;
          return (
            <div
              key={s.id}
              className="flex items-center justify-center border-b border-gray-100 last:border-0 flex-shrink-0"
              style={{
                height: block.height,
                background: block.color,
                fontSize: 7,
                color: "#374151",
                fontWeight: 500,
                letterSpacing: "0.02em",
                padding: "0 4px",
              }}
            >
              {block.label}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-gray-400">Drag to reorder ↑↓</p>
    </div>
  );
}

//  Main Editor Component 

export function QuotationLayoutEditor() {
  const [sections, setSections] = useState<LayoutSection[]>(DEFAULT_LAYOUT.sections);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load saved layout from workspace settings
  useEffect(() => {
    fetch("/api/workspace")
      .then((r) => r.json())
      .then((ws) => {
        if (ws?.settings?.quotationLayout?.sections?.length) {
          // Merge with defaults to handle any newly added sections
          const saved: LayoutSection[] = ws.settings.quotationLayout.sections;
          const merged = DEFAULT_LAYOUT.sections.map((def) => {
            const found = saved.find((s) => s.id === def.id);
            return found ?? def;
          });
          // Reorder to match saved order (for sections that exist in saved)
          const savedIds = saved.map((s) => s.id);
          const orderedKnown = savedIds
            .filter((id) => merged.find((m) => m.id === id))
            .map((id) => merged.find((m) => m.id === id)!);
          const newSections = merged.filter((m) => !savedIds.includes(m.id));
          setSections([...orderedKnown, ...newSections]);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 80, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      setSections(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const toggleVisibility = (id: SectionId) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  const resetToDefault = () => {
    setSections(DEFAULT_LAYOUT.sections);
    toast.info("Reset to default layout. Click Save to apply.");
  };

  const save = async () => {
    setSaving(true);
    const pending = toast.loading("Saving layout…");
    try {
      const wsRes = await fetch("/api/workspace");
      const ws = await wsRes.json();
      const currentSettings = ws?.settings || {};
      const res = await fetch("/api/workspace/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentSettings,
          quotationLayout: { sections },
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Layout saved! It will apply to all quotation previews.", { id: pending });
    } catch {
      toast.error("Failed to save layout.", { id: pending });
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <RiLoader4Line className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-6">
        {/* Left: Section cards */}
        <div className="flex-1 min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm bg-blue-100 border border-blue-200" />
                Header area
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm bg-amber-100 border border-amber-200" />
                Items (locked)
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm bg-green-100 border border-green-200" />
                Footer area
              </span>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1.5">
                {sections.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    onToggle={() => {
                      if (!SECTION_META[section.id].locked) {
                        toggleVisibility(section.id);
                      }
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-70 transition-all"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                color: "var(--primary-foreground)",
                boxShadow: "0 2px 8px color-mix(in oklch, var(--primary), transparent 65%)",
              }}
            >
              {saving ? (
                <><RiLoader4Line className="h-3.5 w-3.5 animate-spin" /> Saving…</>
              ) : (
                "Save Layout"
              )}
            </button>
            <button
              onClick={resetToDefault}
              className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium rounded-xl border transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              style={{ border: "1px solid var(--border-subtle)" }}
            >
              <RiRestartLine className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Right: Mini preview */}
        <div className="flex-shrink-0 pt-6 hidden sm:block">
          <MiniPreview sections={sections} />
        </div>
      </div>
    </div>
  );
}
