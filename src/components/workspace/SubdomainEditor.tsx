"use client";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Globe,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { normalizeSlug, slugProblem } from "@/lib/slug";

type SlugState = "idle" | "checking" | "available" | "taken" | "invalid";

export function SubdomainEditor({
  currentSlug,
  onSaved,
}: {
  currentSlug: string;
  onSaved: (newSlug: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentSlug);
  const [slugState, setSlugState] = useState<SlugState>("idle");
  const [slugMsg, setSlugMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkSlug = useCallback(
    async (raw: string) => {
      const problem = slugProblem(raw);
      if (problem) {
        setSlugState("invalid");
        setSlugMsg(problem);
        return;
      }
      if (normalizeSlug(raw) === currentSlug) {
        setSlugState("idle");
        setSlugMsg(null);
        return;
      }
      setSlugState("checking");
      setSlugMsg(null);
      const res = await fetch(
        `/api/workspace/check-slug?slug=${encodeURIComponent(raw)}`,
      );
      const data = await res.json();
      if (data.available) {
        setSlugState("available");
        setSlugMsg("Available!");
      } else {
        setSlugState("taken");
        setSlugMsg(data.reason || "Not available.");
      }
    },
    [currentSlug],
  );

  const handleChange = (raw: string) => {
    const cleaned = raw.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setValue(cleaned);
    setSlugState("idle");
    setSlugMsg(null);
    if (checkTimer.current) clearTimeout(checkTimer.current);
    if (cleaned.length >= 3) {
      checkTimer.current = setTimeout(() => checkSlug(cleaned), 500);
    }
  };

  const handleSave = async () => {
    if (slugState === "invalid" || slugState === "taken" || slugState === "checking") return;
    if (value === currentSlug) {
      setEditing(false);
      return;
    }
    setSaving(true);
    const res = await fetch("/api/workspace", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: value }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      onSaved(data.slug);
      setEditing(false);
    } else {
      setSlugState("taken");
      setSlugMsg(data.error || "Failed to save.");
    }
  };

  const handleCancel = () => {
    setValue(currentSlug);
    setSlugState("idle");
    setSlugMsg(null);
    setEditing(false);
  };

  const stateColor: Record<SlugState, string> = {
    idle: "var(--foreground-dimmed)",
    checking: "var(--foreground-muted)",
    available: "var(--success)",
    taken: "var(--danger)",
    invalid: "var(--danger)",
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2 group">
        <Globe className="h-4 w-4 shrink-0" style={{ color: "var(--foreground-dimmed)" }} />
        <span className="text-sm mono" style={{ color: "var(--foreground-muted)" }}>
          {currentSlug}.erpbuilder.app
        </span>
        <button
          onClick={() => {
            setValue(currentSlug);
            setEditing(true);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover-bg-subtle focus-ring"
          aria-label="Edit subdomain"
          style={{ color: "var(--foreground-dimmed)" }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className="flex items-center rounded-lg overflow-hidden flex-1 max-w-xs focus-within:ring-2"
          style={{
            border: `1px solid ${
              slugState === "invalid" || slugState === "taken"
                ? "var(--danger)"
                : slugState === "available"
                  ? "var(--success)"
                  : "var(--border)"
            }`,
            background: "var(--surface-sunken)",
          }}
        >
          <input
            id="subdomain-input"
            autoFocus
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            className="flex-1 px-3 py-2 text-sm bg-transparent outline-none min-w-0"
            style={{ color: "var(--foreground)" }}
            placeholder="your-erp"
            spellCheck={false}
          />
          <span
            className="px-2 py-2 text-sm border-l shrink-0"
            style={{
              color: "var(--foreground-dimmed)",
              borderColor: "var(--border-subtle)",
              background: "var(--surface-2)",
            }}
          >
            .erpbuilder.app
          </span>
        </div>

        <button
          onClick={handleSave}
          disabled={
            saving || slugState === "invalid" || slugState === "taken" || slugState === "checking"
          }
          className="p-2 rounded-lg transition-all focus-ring disabled:opacity-40"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          aria-label="Save subdomain"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </button>
        <button
          onClick={handleCancel}
          className="p-2 rounded-lg hover-bg-subtle transition-all focus-ring"
          style={{ color: "var(--foreground-muted)" }}
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {slugMsg && (
        <p
          className="text-xs flex items-center gap-1.5"
          style={{ color: stateColor[slugState] }}
        >
          {slugState === "checking" && <Loader2 className="h-3 w-3 animate-spin" />}
          {(slugState === "taken" || slugState === "invalid") && <AlertCircle className="h-3 w-3" />}
          {slugState === "available" && <CheckCircle2 className="h-3 w-3" />}
          {slugMsg}
        </p>
      )}
    </div>
  );
}
