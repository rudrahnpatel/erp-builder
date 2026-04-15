/**
 * Schema Resolver — merges a canonical PackDefinition with WorkspaceSchemaOverride deltas
 * to produce the effective schema for a given workspace's installed pack.
 *
 * ARCHITECTURE NOTE:
 * The source of truth for pack schemas is ALWAYS the TypeScript PackDefinition in registry.ts.
 * WorkspaceSchemaOverride rows store ONLY the user's delta (what they changed on top).
 * This file merges the two at runtime. Never mutate a PackDefinition directly.
 *
 * Usage:
 *   const resolved = await resolveTableSchema(workspaceId, "inventory", "Products");
 *   // resolved.fields = canonical fields + user's custom additions, minus hidden ones
 */

import { db } from "@/lib/db";
import { getPackById } from "@/lib/packs";
import { OverrideType } from "@prisma/client";
import type { PackFieldDefinition, PackTableDefinition } from "@/types/pack";

// ─── Output types ────────────────────────────────────────────────────────────

export interface ResolvedFieldDefinition extends PackFieldDefinition {
  /** True if this field originated from the canonical pack definition */
  isFromPack: boolean;
  /** True if this field was added by the workspace user */
  isCustom: boolean;
  /** True if the user has hidden this field from views */
  isHidden: boolean;
  /** The canonical field key (for override targeting) */
  packFieldKey: string;
}

export interface ResolvedTableDefinition {
  /** Canonical table name key from the pack */
  packTableKey: string;
  /** Effective display name (may be overridden) */
  name: string;
  icon: string;
  fields: ResolvedFieldDefinition[];
  /** The materialized DB table ID (for record queries) */
  dbTableId?: string;
}

export interface ResolvedPackSchema {
  packId: string;
  packVersion: string;
  tables: ResolvedTableDefinition[];
}

// ─── ADD_FIELD override payload shape ────────────────────────────────────────
interface AddFieldPayload {
  name: string;
  type: string;
  required?: boolean;
  config?: Record<string, unknown>;
}

// ─── RENAME_FIELD override payload shape ─────────────────────────────────────
interface RenameFieldPayload {
  displayName: string;
}

// ─── CHANGE_FIELD_OPTIONS override payload shape ──────────────────────────────
interface ChangeFieldOptionsPayload {
  options: string[];
}

// ─── RENAME_TABLE override payload shape ─────────────────────────────────────
interface RenameTablePayload {
  displayName: string;
}

// ─── Core resolver ───────────────────────────────────────────────────────────

/**
 * Resolves the full pack schema for a workspace by merging the canonical
 * PackDefinition with all WorkspaceSchemaOverride rows stored for that workspace.
 */
export async function resolvePackSchema(
  workspaceId: string,
  packId: string
): Promise<ResolvedPackSchema | null> {
  const pack = getPackById(packId);
  if (!pack) return null;

  // Fetch the installed pack record + all its overrides in one query
  const installedPack = await db.installedPack.findUnique({
    where: { packId_workspaceId: { packId, workspaceId } },
    include: { customizations: { orderBy: { createdAt: "asc" } } },
  });

  // Pack not installed in this workspace — return canonical as-is (read-only preview)
  const overrides = installedPack?.customizations ?? [];

  // Resolve each canonical table
  const resolvedTables: ResolvedTableDefinition[] = pack.tables.map((canonicalTable) => {
    return resolveTable(canonicalTable, overrides);
  });

  // Apply ADD_TABLE overrides (user-created tables not in canonical pack)
  const addTableOverrides = overrides.filter((o) => o.overrideType === OverrideType.ADD_TABLE);
  for (const override of addTableOverrides) {
    const payload = override.payload as unknown as PackTableDefinition;
    resolvedTables.push({
      packTableKey: override.targetKey,
      name: payload.name,
      icon: payload.icon ?? "table",
      fields: (payload.fields ?? []).map((f) => ({
        ...f,
        isFromPack: false,
        isCustom: true,
        isHidden: false,
        packFieldKey: f.name,
      })),
    });
  }

  return {
    packId,
    packVersion: installedPack?.packVersion ?? "1.0.0",
    tables: resolvedTables,
  };
}

/**
 * Resolves a single table's schema: applies all relevant overrides for that table.
 */
function resolveTable(
  canonicalTable: PackTableDefinition,
  allOverrides: { overrideType: OverrideType; targetKey: string; payload: unknown }[]
): ResolvedTableDefinition {
  const tableKey = canonicalTable.name;

  // Start with canonical fields — all marked as pack-sourced, not hidden
  let fields: ResolvedFieldDefinition[] = canonicalTable.fields.map((f) => ({
    ...f,
    isFromPack: true,
    isCustom: false,
    isHidden: false,
    packFieldKey: f.name,
  }));

  // Determine display name (may be overridden)
  let displayName = canonicalTable.name;

  // Apply overrides that target this table (targetKey starts with tableKey)
  for (const override of allOverrides) {
    // Only process overrides scoped to this table
    if (!override.targetKey.startsWith(tableKey)) continue;

    switch (override.overrideType) {
      case OverrideType.RENAME_TABLE: {
        // targetKey = "Products", payload = { displayName: "Items" }
        if (override.targetKey === tableKey) {
          const p = override.payload as RenameTablePayload;
          displayName = p.displayName ?? displayName;
        }
        break;
      }

      case OverrideType.ADD_FIELD: {
        // targetKey = "Products", payload = full PackFieldDefinition
        if (override.targetKey === tableKey) {
          const p = override.payload as AddFieldPayload;
          // Only add if not already present (idempotency)
          if (!fields.find((f) => f.packFieldKey === p.name)) {
            fields.push({
              name: p.name,
              type: p.type,
              required: p.required ?? false,
              config: p.config ?? {},
              isFromPack: false,
              isCustom: true,
              isHidden: false,
              packFieldKey: p.name,
            });
          }
        }
        break;
      }

      case OverrideType.HIDE_FIELD: {
        // targetKey = "Products.Stock Qty"
        const [tKey, fieldKey] = override.targetKey.split(".");
        if (tKey === tableKey && fieldKey) {
          fields = fields.map((f) =>
            f.packFieldKey === fieldKey ? { ...f, isHidden: true } : f
          );
        }
        break;
      }

      case OverrideType.RENAME_FIELD: {
        // targetKey = "Products.Stock Qty", payload = { displayName: "Available Qty" }
        const [tKey, fieldKey] = override.targetKey.split(".");
        if (tKey === tableKey && fieldKey) {
          const p = override.payload as RenameFieldPayload;
          fields = fields.map((f) =>
            f.packFieldKey === fieldKey ? { ...f, name: p.displayName } : f
          );
        }
        break;
      }

      case OverrideType.CHANGE_FIELD_OPTIONS: {
        // targetKey = "Products.Category", payload = { options: [...] }
        const [tKey, fieldKey] = override.targetKey.split(".");
        if (tKey === tableKey && fieldKey) {
          const p = override.payload as ChangeFieldOptionsPayload;
          fields = fields.map((f) =>
            f.packFieldKey === fieldKey
              ? { ...f, config: { ...(f.config as object), options: p.options } }
              : f
          );
        }
        break;
      }

      default:
        break;
    }
  }

  return {
    packTableKey: tableKey,
    name: displayName,
    icon: canonicalTable.icon ?? "table",
    fields,
  };
}

/**
 * Resolves a single table's schema by its canonical key.
 * Convenience wrapper over resolvePackSchema.
 */
export async function resolveTableSchema(
  workspaceId: string,
  packId: string,
  tableKey: string
): Promise<ResolvedTableDefinition | null> {
  const schema = await resolvePackSchema(workspaceId, packId);
  if (!schema) return null;
  return schema.tables.find((t) => t.packTableKey === tableKey) ?? null;
}
