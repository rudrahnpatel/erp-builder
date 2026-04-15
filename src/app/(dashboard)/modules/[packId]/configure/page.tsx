"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  Database,
  GitBranch,
  Shield,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Check,
  Info,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { getPackById } from "@/lib/packs";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useWorkspace } from "@/hooks/use-workspace";
import { toast } from "sonner";

const steps = [
  { label: "Builder", icon: Wrench, description: "Configure fields and rules" },
  { label: "Data Model", icon: Database, description: "Review table schema" },
  { label: "Workflow", icon: GitBranch, description: "Automations" },
  { label: "Access", icon: Shield, description: "Permissions & Roles" },
  { label: "Deploy", icon: Rocket, description: "Publish your module" },
];

// ── Field type badge colours ─────────────────────────────────────────────────
const fieldTypeStyles: Record<string, { bg: string; color: string }> = {
  TEXT:          { bg: "var(--surface-3)",       color: "var(--foreground-muted)" },
  NUMBER:        { bg: "color-mix(in oklch, var(--accent-blue), transparent 85%)",   color: "var(--accent-blue)" },
  CURRENCY:      { bg: "color-mix(in oklch, var(--accent-emerald), transparent 85%)", color: "var(--accent-emerald)" },
  DATE:          { bg: "color-mix(in oklch, var(--accent-amber), transparent 85%)",  color: "var(--accent-amber)" },
  SINGLE_SELECT: { bg: "color-mix(in oklch, var(--accent-violet), transparent 85%)", color: "var(--accent-violet)" },
  MULTI_SELECT:  { bg: "color-mix(in oklch, var(--accent-violet), transparent 82%)", color: "var(--accent-violet)" },
  CHECKBOX:      { bg: "color-mix(in oklch, var(--success), transparent 85%)",       color: "var(--success)" },
  RELATION:      { bg: "color-mix(in oklch, var(--accent-rose), transparent 85%)",   color: "var(--accent-rose)" },
  EMAIL:         { bg: "color-mix(in oklch, var(--accent-blue), transparent 85%)",   color: "var(--accent-blue)" },
  PHONE:         { bg: "color-mix(in oklch, var(--accent-emerald), transparent 85%)", color: "var(--accent-emerald)" },
  TIME:          { bg: "color-mix(in oklch, var(--accent-amber), transparent 85%)",  color: "var(--accent-amber)" },
};

function FieldTypeBadge({ type }: { type: string }) {
  const style = fieldTypeStyles[type] || fieldTypeStyles.TEXT;
  return (
    <span
      className="text-[9px] font-semibold px-1.5 py-0.5 rounded mono uppercase tracking-wider"
      style={{ background: style.bg, color: style.color }}
    >
      {type.replace("_", " ")}
    </span>
  );
}

export default function ConfigurePage({
  params,
}: {
  params: Promise<{ packId: string }>;
}) {
  const { packId } = use(params);
  const router = useRouter();
  const { workspace, refetch } = useWorkspace();

  const pack = getPackById(packId);

  // ── Guard: pack not found ─────────────────────────────────────────────────
  if (!pack) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="h-10 w-10" style={{ color: "var(--danger)" }} />
        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          Module not found
        </h2>
        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
          No pack with id &ldquo;{packId}&rdquo; exists in the registry.
        </p>
        <Link href="/modules">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  // ── Derived state ─────────────────────────────────────────────────────────
  const isAlreadyInstalled = workspace?.installedPacks?.includes(packId) ?? false;

  // All fields from all tables (flattened, for Step 1)
  const allFields = pack.tables.flatMap((t) =>
    t.fields.map((f) => ({ ...f, tableName: t.name }))
  );

  const initialFieldSelection = Object.fromEntries(
    allFields.map((f) => [`${f.tableName}::${f.name}`, true])
  );

  // Primary table for live preview (first table)
  const primaryTable = pack.tables[0];
  const previewSeedRows = primaryTable?.seedData?.slice(0, 5) ?? [];
  const previewFields = primaryTable?.fields.slice(0, 4) ?? []; // Show first 4 cols in preview

  return function ConfigurePageContent() {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>(initialFieldSelection);
    const [deploying, setDeploying] = useState(false);

    const toggleField = (key: string, required: boolean) => {
      if (required) return;
      setSelectedFields((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleDeploy = async () => {
      if (isAlreadyInstalled) return;
      setDeploying(true);
      const pending = toast.loading(`Installing ${pack.name}…`);
      try {
        const res = await fetch("/api/packs/install", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packId }),
        });

        if (res.status === 409) {
          toast.warning("Already installed", {
            id: pending,
            description: `${pack.name} is already set up in your workspace.`,
          });
          await refetch?.();
          router.push("/workspace");
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          toast.error("Installation failed", {
            id: pending,
            description: data.error || "The server rejected the request.",
          });
          return;
        }

        await refetch?.();
        toast.success(`${pack.name} installed!`, {
          id: pending,
          description: "Schemas and pages are ready in your workspace.",
        });
        router.push("/workspace");
      } catch {
        toast.error("Network error", {
          id: pending,
          description: "Check your connection and try again.",
        });
      } finally {
        setDeploying(false);
      }
    };

    return (
      <div className="h-[calc(100vh-3.5rem)] flex flex-col -m-4 sm:-m-6">
        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3 border-b glass shrink-0"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="flex items-center gap-2 text-sm">
            <Link href="/modules">
              <span
                className="hidden sm:inline hover:underline cursor-pointer"
                style={{ color: "var(--foreground-muted)" }}
              >
                Modules
              </span>
            </Link>
            <ChevronRight
              className="hidden sm:block h-3.5 w-3.5"
              style={{ color: "var(--foreground-dimmed)" }}
            />
            <span style={{ color: "var(--foreground-muted)" }}>{pack.name}</span>
            <ChevronRight
              className="h-3.5 w-3.5"
              style={{ color: "var(--foreground-dimmed)" }}
            />
            <span className="font-medium" style={{ color: "var(--foreground)" }}>
              Configure
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAlreadyInstalled && (
              <span
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: "color-mix(in oklch, var(--success), transparent 85%)",
                  color: "var(--success)",
                  border: "1px solid color-mix(in oklch, var(--success), transparent 70%)",
                }}
              >
                <Check className="h-3 w-3" /> Installed
              </span>
            )}
            <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
        </div>

        {/* ── Already-installed banner ──────────────────────────────────── */}
        {isAlreadyInstalled && (
          <div
            className="flex items-center gap-3 px-4 sm:px-6 py-3 text-sm shrink-0"
            style={{
              background: "color-mix(in oklch, var(--success), transparent 88%)",
              borderBottom: "1px solid color-mix(in oklch, var(--success), transparent 70%)",
              color: "var(--success)",
            }}
          >
            <Check className="h-4 w-4 shrink-0" />
            <span>
              <strong>{pack.name}</strong> is already installed in your workspace. You can
              re-configure or{" "}
              <Link href="/workspace" className="underline font-semibold">
                go to your workspace
              </Link>
              .
            </span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* ── Left sidebar: Steps ──────────────────────────────────────── */}
          <div
            className="w-full lg:w-[220px] border-b lg:border-b-0 lg:border-r overflow-y-auto shrink-0"
            style={{ borderColor: "var(--border-subtle)", background: "var(--surface-1)" }}
          >
            <div className="p-3 lg:p-4 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
              {steps.map((step, i) => {
                const done = i < currentStep;
                const active = currentStep === i;
                return (
                  <button
                    key={step.label}
                    onClick={() => setCurrentStep(i)}
                    className="flex items-center gap-2 lg:gap-3 px-3 py-2 lg:py-2.5 text-sm rounded-lg transition-all whitespace-nowrap shrink-0 lg:w-full text-left"
                    style={{
                      background: active ? "var(--primary)" : "transparent",
                      color: active
                        ? "var(--primary-foreground)"
                        : done
                        ? "var(--success)"
                        : "var(--foreground-muted)",
                    }}
                  >
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: active
                          ? "rgba(255,255,255,0.2)"
                          : done
                          ? "color-mix(in oklch, var(--success), transparent 80%)"
                          : "var(--surface-3)",
                      }}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{step.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Center: Config content ────────────────────────────────────── */}
          <div
            className="flex-1 overflow-y-auto p-4 sm:p-6"
            style={{ background: "var(--background)" }}
          >
            {/* STEP 0 — Builder: Field Selection */}
            {currentStep === 0 && (
              <div className="max-w-xl space-y-6">
                <div>
                  <h2
                    className="text-xl font-bold mb-1"
                    style={{ color: "var(--foreground)" }}
                  >
                    {pack.name} — Configure Fields
                  </h2>
                  <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                    Choose which fields to include. Required fields cannot be removed.
                  </p>
                </div>

                {pack.tables.map((table) => (
                  <div key={table.name}>
                    <h3
                      className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
                      style={{ color: "var(--foreground-dimmed)" }}
                    >
                      <Database className="h-3.5 w-3.5" />
                      {table.name}
                    </h3>
                    <div className="space-y-2">
                      {table.fields.map((field) => {
                        const key = `${table.name}::${field.name}`;
                        const selected = selectedFields[key] ?? true;
                        return (
                          <div
                            key={key}
                            onClick={() => toggleField(key, field.required ?? false)}
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-150"
                            style={{
                              border: `1px solid ${selected ? "var(--primary)" : "var(--border-subtle)"}`,
                              background: selected ? "var(--primary-subtle)" : "var(--card)",
                              opacity: field.required ? 0.85 : 1,
                            }}
                          >
                            <div
                              className="h-5 w-5 rounded border-2 flex items-center justify-center transition-all shrink-0"
                              style={{
                                borderColor: selected ? "var(--primary)" : "var(--border-subtle)",
                                background: selected ? "var(--primary)" : "transparent",
                              }}
                            >
                              {selected && (
                                <Check className="h-3 w-3" style={{ color: "var(--primary-foreground)" }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className="text-sm font-medium"
                                  style={{ color: "var(--foreground)" }}
                                >
                                  {field.name}
                                </span>
                                {field.required && (
                                  <Badge
                                    className="text-[9px] border-0 px-1.5 py-0"
                                    style={{ background: "var(--danger-subtle)", color: "var(--danger)" }}
                                  >
                                    Required
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <FieldTypeBadge type={field.type} />
                                {field.config?.linkedTable != null && (
                                  <span
                                    className="text-[10px]"
                                    style={{ color: "var(--foreground-dimmed)" }}
                                  >
                                    → {field.config.linkedTable as string}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 1 — Data Model: ERD-style read-only view */}
            {currentStep === 1 && (
              <div className="max-w-xl space-y-6">
                <div>
                  <h2
                    className="text-xl font-bold mb-1"
                    style={{ color: "var(--foreground)" }}
                  >
                    Data Model
                  </h2>
                  <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                    Read-only entity schema that will be seeded into your workspace.
                  </p>
                </div>

                {pack.tables.map((table, ti) => (
                  <div
                    key={table.name}
                    className="rounded-xl border overflow-hidden"
                    style={{
                      background: "var(--card)",
                      borderColor: "var(--border-subtle)",
                    }}
                  >
                    {/* Table header */}
                    <div
                      className="flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b"
                      style={{
                        background: "var(--surface-2)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--foreground)",
                      }}
                    >
                      <Database className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
                      {table.name}
                      <span
                        className="ml-auto text-[10px] mono"
                        style={{ color: "var(--foreground-dimmed)" }}
                      >
                        {table.fields.length} fields
                      </span>
                    </div>

                    {/* Fields list */}
                    <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                      {table.fields.map((field) => (
                        <div
                          key={field.name}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm"
                        >
                          <span
                            className="flex-1 font-medium"
                            style={{ color: "var(--foreground)" }}
                          >
                            {field.name}
                          </span>
                          <FieldTypeBadge type={field.type} />
                          {field.required && (
                            <Badge
                              className="text-[9px] border-0 px-1.5 py-0"
                              style={{ background: "var(--danger-subtle)", color: "var(--danger)" }}
                            >
                              Required
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Relation links */}
                    {table.fields.some((f) => f.type === "RELATION") && (
                      <div
                        className="px-4 py-2 text-[10px] mono flex flex-wrap gap-x-4 gap-y-1"
                        style={{
                          background: "var(--surface-1)",
                          borderTop: "1px solid var(--border-subtle)",
                          color: "var(--foreground-dimmed)",
                        }}
                      >
                        {table.fields
                          .filter((f) => f.type === "RELATION")
                          .map((f) => (
                            <span key={f.name}>
                              {table.name}.{f.name} →{" "}
                              {(f.config?.linkedTable as string) ?? "?"}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* STEP 2 — Workflow (stub) */}
            {currentStep === 2 && (
              <div className="max-w-xl">
                <h2
                  className="text-xl font-bold mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  Workflow Automations
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--foreground-muted)" }}>
                  Configure triggers and automated actions for this module.
                </p>
                <div
                  className="rounded-xl p-8 text-center border-2 border-dashed"
                  style={{
                    borderColor: "var(--border-subtle)",
                    background: "var(--surface-1)",
                  }}
                >
                  <GitBranch
                    className="h-8 w-8 mx-auto mb-3"
                    style={{ color: "var(--foreground-dimmed)" }}
                  />
                  <h3
                    className="text-sm font-semibold mb-1"
                    style={{ color: "var(--foreground)" }}
                  >
                    Coming in next release
                  </h3>
                  <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                    Visual workflow builder with if-this-then-that rules, scheduled jobs, and
                    webhook triggers.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3 — Access (stub) */}
            {currentStep === 3 && (
              <div className="max-w-xl">
                <h2
                  className="text-xl font-bold mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  Access & Permissions
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--foreground-muted)" }}>
                  Control who can read, write, and manage this module.
                </p>
                <div
                  className="rounded-xl p-8 text-center border-2 border-dashed"
                  style={{
                    borderColor: "var(--border-subtle)",
                    background: "var(--surface-1)",
                  }}
                >
                  <Shield
                    className="h-8 w-8 mx-auto mb-3"
                    style={{ color: "var(--foreground-dimmed)" }}
                  />
                  <h3
                    className="text-sm font-semibold mb-1"
                    style={{ color: "var(--foreground)" }}
                  >
                    Single-owner workspace
                  </h3>
                  <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                    Role-based access control (RBAC) is planned for multi-user workspaces.
                    Currently all data is visible to the workspace owner.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 4 — Deploy */}
            {currentStep === 4 && (
              <div className="max-w-xl space-y-6">
                <div>
                  <h2
                    className="text-xl font-bold mb-1"
                    style={{ color: "var(--foreground)" }}
                  >
                    Deploy {pack.name}
                  </h2>
                  <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                    Review the installation summary before deploying.
                  </p>
                </div>

                {/* Summary card */}
                <div
                  className="rounded-xl border overflow-hidden"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <div
                    className="px-5 py-4 border-b"
                    style={{ borderColor: "var(--border-subtle)", background: "var(--surface-2)" }}
                  >
                    <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      Installation will create
                    </h3>
                  </div>
                  <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                    {[
                      { label: "Tables", value: `${pack.tables.length} tables` },
                      {
                        label: "Fields",
                        value: `${pack.tables.reduce((acc, t) => acc + t.fields.length, 0)} fields`,
                      },
                      { label: "Pages", value: `${pack.pageDefinitions.length} pages` },
                      {
                        label: "Seed records",
                        value: `${pack.tables.reduce((acc, t) => acc + (t.seedData?.length ?? 0), 0)} rows`,
                      },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between px-5 py-3 text-sm">
                        <span style={{ color: "var(--foreground-muted)" }}>{label}</span>
                        <span className="font-medium" style={{ color: "var(--foreground)" }}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Table names */}
                <div className="space-y-2">
                  <p
                    className="text-[11px] uppercase tracking-widest font-semibold mono"
                    style={{ color: "var(--foreground-dimmed)" }}
                  >
                    Tables that will be created
                  </p>
                  {pack.tables.map((t) => (
                    <div
                      key={t.name}
                      className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                      style={{ background: "var(--surface-2)" }}
                    >
                      <Database className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--primary)" }} />
                      <span style={{ color: "var(--foreground)" }}>{t.name}</span>
                      <span
                        className="ml-auto text-[10px] mono"
                        style={{ color: "var(--foreground-dimmed)" }}
                      >
                        {t.fields.length} fields
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pages */}
                <div className="space-y-2">
                  <p
                    className="text-[11px] uppercase tracking-widest font-semibold mono"
                    style={{ color: "var(--foreground-dimmed)" }}
                  >
                    Pages that will be created
                  </p>
                  {pack.pageDefinitions.map((p) => (
                    <div
                      key={p.title}
                      className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                      style={{ background: "var(--surface-2)" }}
                    >
                      <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--success)" }} />
                      <span style={{ color: "var(--foreground)" }}>{p.title}</span>
                    </div>
                  ))}
                </div>

                {/* Info note */}
                <div
                  className="flex items-start gap-3 p-4 rounded-xl text-sm"
                  style={{
                    background: "color-mix(in oklch, var(--accent-blue), transparent 90%)",
                    border: "1px solid color-mix(in oklch, var(--accent-blue), transparent 75%)",
                  }}
                >
                  <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--accent-blue)" }} />
                  <p style={{ color: "var(--foreground-muted)" }}>
                    You can add custom fields or modify the schema after installation from the
                    Schema Designer.
                  </p>
                </div>

                {/* Deploy button */}
                <Button
                  onClick={handleDeploy}
                  disabled={deploying || isAlreadyInstalled}
                  className="w-full gap-2 font-semibold h-11"
                  style={{
                    background: isAlreadyInstalled ? "var(--success)" : "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  {deploying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Installing…
                    </>
                  ) : isAlreadyInstalled ? (
                    <>
                      <Check className="h-4 w-4" />
                      Already Installed
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" />
                      Deploy {pack.name}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* ── Right: Live Preview ─────────────────────────────────────────── */}
          <div
            className="hidden xl:flex xl:flex-col w-[420px] border-l overflow-hidden"
            style={{ borderColor: "var(--border-subtle)", background: "var(--surface-1)" }}
          >
            {/* Preview header */}
            <div
              className="px-4 py-3 border-b shrink-0"
              style={{ borderColor: "var(--border-subtle)", background: "var(--surface-2)" }}
            >
              <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Live Preview — {primaryTable?.name}
              </h3>
              <p className="text-[10px]" style={{ color: "var(--foreground-muted)" }}>
                Sample data that will be seeded on install.
              </p>
            </div>

            {/* Preview table */}
            <div className="flex-1 overflow-auto p-4">
              {previewSeedRows.length > 0 ? (
                <div
                  className="rounded-xl border overflow-hidden"
                  style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}
                >
                  <table className="w-full text-xs">
                    <thead>
                      <tr
                        className="border-b"
                        style={{
                          background: "var(--surface-1)",
                          borderColor: "var(--border-subtle)",
                        }}
                      >
                        {previewFields
                          .filter((f) => {
                            const key = `${primaryTable.name}::${f.name}`;
                            return selectedFields[key] ?? true;
                          })
                          .map((f) => (
                            <th
                              key={f.name}
                              className="text-left px-3 py-2.5 font-semibold uppercase tracking-wider whitespace-nowrap"
                              style={{ color: "var(--foreground-dimmed)" }}
                            >
                              {f.name}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewSeedRows.map((row, ri) => (
                        <tr
                          key={ri}
                          className="border-b last:border-0"
                          style={{
                            borderColor: "var(--border-subtle)",
                            background: ri % 2 === 0 ? "var(--card)" : "var(--surface-1)",
                          }}
                        >
                          {previewFields
                            .filter((f) => {
                              const key = `${primaryTable.name}::${f.name}`;
                              return selectedFields[key] ?? true;
                            })
                            .map((f) => {
                              const val = row[f.name];
                              return (
                                <td
                                  key={f.name}
                                  className="px-3 py-2.5 max-w-[120px] truncate"
                                  style={{ color: "var(--foreground)" }}
                                >
                                  {f.type === "CURRENCY" && typeof val === "number"
                                    ? `₹${val.toLocaleString("en-IN")}`
                                    : String(val ?? "—")}
                                </td>
                              );
                            })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  className="rounded-xl p-8 text-center text-xs"
                  style={{ color: "var(--foreground-muted)", background: "var(--surface-2)", border: "1px dashed var(--border-subtle)" }}
                >
                  No seed data defined for this pack.
                </div>
              )}

              {/* Pack summary info */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Tables", value: pack.tables.length },
                  { label: "Pages", value: pack.pageDefinitions.length },
                  {
                    label: "Fields",
                    value: pack.tables.reduce((acc, t) => acc + t.fields.length, 0),
                  },
                  {
                    label: "Seed rows",
                    value: pack.tables.reduce(
                      (acc, t) => acc + (t.seedData?.length ?? 0),
                      0
                    ),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-lg border p-3 text-center"
                    style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}
                  >
                    <div
                      className="text-lg font-bold tabular-nums"
                      style={{ color: "var(--foreground)" }}
                    >
                      {value}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-widest mono"
                      style={{ color: "var(--foreground-dimmed)" }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom nav ────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3 border-t glass shrink-0"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <Button
            variant="outline"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              className="gap-1.5"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              Next Step <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleDeploy}
              disabled={deploying || isAlreadyInstalled}
              className="gap-1.5"
              style={{
                background: isAlreadyInstalled ? "var(--success)" : "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              {deploying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Installing…
                </>
              ) : isAlreadyInstalled ? (
                <>
                  <Check className="h-4 w-4" /> Already Installed
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" /> Deploy
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }();
}
