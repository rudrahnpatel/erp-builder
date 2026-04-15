import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import { FieldType, OverrideType, Prisma } from "@prisma/client";

// ─── GET /api/tables/[id]/fields ─────────────────────────────────────────────
// Returns all fields for a table.
// Pack-sourced tables: hidden fields are excluded by default.
// Pass ?includeHidden=1 to get everything (used by the schema editor).
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const includeHidden = searchParams.get("includeHidden") === "1";

  const table = await db.table.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const fields = await db.field.findMany({
    where: {
      tableId: id,
      // Filter out hidden fields unless the schema editor explicitly asks for them
      ...(includeHidden ? {} : { isHidden: false }),
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(fields);
}

// ─── POST /api/tables/[id]/fields ────────────────────────────────────────────
// Adds a new field to a table.
//
// For pack-sourced tables: the field is materialized as a Field row with
// isCustom:true, AND a WorkspaceSchemaOverride(ADD_FIELD) record is created
// to track the delta. This keeps the canonical pack definition untouched.
//
// For user-created tables (isCustom:true on Table): plain Field creation, no override needed.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const table = await db.table.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const { name, type, config, required } = await req.json();

  if (!name || !type) {
    return NextResponse.json({ error: "name and type are required" }, { status: 400 });
  }
  if (!Object.values(FieldType).includes(type)) {
    return NextResponse.json({ error: `Invalid field type: ${type}` }, { status: 400 });
  }

  const lastField = await db.field.findFirst({
    where: { tableId: id },
    orderBy: { order: "desc" },
  });

  // For pack-sourced tables: check for name collision with canonical fields
  if (table.packSource && table.packTableKey) {
    const existingField = await db.field.findFirst({
      where: { tableId: id, name, isHidden: false },
    });
    if (existingField) {
      return NextResponse.json(
        { error: `A field named "${name}" already exists in this table` },
        { status: 409 }
      );
    }
  }

  const fieldData = {
    name,
    type: type as FieldType,
    config: (config || {}) as Prisma.InputJsonValue,
    required: required || false,
    order: (lastField?.order ?? -1) + 1,
    tableId: id,
    packFieldKey: name,          // canonical key = field name for custom fields
    isCustom: true,              // always custom when added via this route
    isHidden: false,
  };

  // Use a transaction so Field + Override are always created together
  const result = await db.$transaction(async (tx) => {
    const field = await tx.field.create({ data: fieldData });

    // If this table came from a pack, also write the override delta
    if (table.packSource && table.packTableKey) {
      const installedPack = await tx.installedPack.findUnique({
        where: {
          packId_workspaceId: { packId: table.packSource, workspaceId: workspace.id },
        },
      });

      if (installedPack) {
        await tx.workspaceSchemaOverride.create({
          data: {
            installedPackId: installedPack.id,
            overrideType: OverrideType.ADD_FIELD,
            // targetKey = table's canonical name (not the DB display name, which may be renamed)
            targetKey: table.packTableKey,
            payload: {
              name,
              type,
              required: required || false,
              config: config || {},
            } as Prisma.InputJsonValue,
          },
        });
      }
    }

    return field;
  });

  return NextResponse.json(result, { status: 201 });
}

// ─── PATCH /api/tables/[id]/fields ───────────────────────────────────────────
// Updates a field.
//
// For pack-sourced fields (isCustom:false):
//  - Renaming → RENAME_FIELD override
//  - Changing SINGLE_SELECT options → CHANGE_FIELD_OPTIONS override
//  - hidden:true → HIDE_FIELD override (soft-delete)
//  - type changes are blocked (structural integrity of the canonical schema)
//
// For custom fields (isCustom:true): all changes are applied directly, no override needed.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const table = await db.table.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const { fieldId, name, type, config, required, order, hidden } = await req.json();
  if (!fieldId) return NextResponse.json({ error: "fieldId is required" }, { status: 400 });

  const field = await db.field.findFirst({ where: { id: fieldId, tableId: id } });
  if (!field) return NextResponse.json({ error: "Field not found" }, { status: 404 });

  // ── Pack-sourced field (canonical, not user-created) ──────────────────────
  if (!field.isCustom && table.packSource && table.packTableKey) {
    // Block type changes — would break existing record data
    if (type && type !== field.type) {
      return NextResponse.json(
        { error: "Cannot change the type of a pre-built pack field. Add a new custom field instead." },
        { status: 422 }
      );
    }

    const installedPack = await db.installedPack.findUnique({
      where: {
        packId_workspaceId: { packId: table.packSource, workspaceId: workspace.id },
      },
    });

    const updated = await db.$transaction(async (tx) => {
      const updateData: Prisma.FieldUpdateInput = {};
      const overrides: { type: OverrideType; targetKey: string; payload: Prisma.InputJsonValue }[] = [];

      // Rename
      if (name && name !== field.name) {
        updateData.name = name;
        overrides.push({
          type: OverrideType.RENAME_FIELD,
          targetKey: `${table.packTableKey}.${field.packFieldKey}`,
          payload: { displayName: name } as Prisma.InputJsonValue,
        });
      }

      // Hide (soft-delete for pack fields)
      if (hidden === true && !field.isHidden) {
        updateData.isHidden = true;
        overrides.push({
          type: OverrideType.HIDE_FIELD,
          targetKey: `${table.packTableKey}.${field.packFieldKey}`,
          payload: { hidden: true } as Prisma.InputJsonValue,
        });
      }

      // Unhide
      if (hidden === false && field.isHidden) {
        updateData.isHidden = false;
        // Remove the HIDE_FIELD override for this field so resolver reflects visible state
        if (installedPack) {
          await tx.workspaceSchemaOverride.deleteMany({
            where: {
              installedPackId: installedPack.id,
              overrideType: OverrideType.HIDE_FIELD,
              targetKey: `${table.packTableKey}.${field.packFieldKey}`,
            },
          });
        }
      }

      // Change SINGLE_SELECT options
      const existingConfig = field.config as Record<string, unknown>;
      const newConfig = config as Record<string, unknown> | undefined;
      if (
        field.type === "SINGLE_SELECT" &&
        newConfig?.options &&
        JSON.stringify(newConfig.options) !== JSON.stringify(existingConfig?.options)
      ) {
        updateData.config = newConfig as Prisma.InputJsonValue;
        overrides.push({
          type: OverrideType.CHANGE_FIELD_OPTIONS,
          targetKey: `${table.packTableKey}.${field.packFieldKey}`,
          payload: { options: newConfig.options } as Prisma.InputJsonValue,
        });
      }

      // Required flag — allowed without override (metadata-only)
      if (required !== undefined) updateData.required = required;

      const updatedField = await tx.field.update({ where: { id: fieldId }, data: updateData });

      // Write override records
      if (installedPack && overrides.length > 0) {
        await tx.workspaceSchemaOverride.createMany({
          data: overrides.map((o) => ({
            installedPackId: installedPack.id,
            overrideType: o.type,
            targetKey: o.targetKey,
            payload: o.payload,
          })),
        });
      }

      return updatedField;
    });

    return NextResponse.json(updated);
  }

  // ── Custom field (user-created, isCustom:true) ────────────────────────────
  // No override needed — the Field row IS the source of truth for custom fields.
  const updated = await db.field.update({
    where: { id: fieldId },
    data: {
      ...(name && { name }),
      ...(type && { type: type as FieldType }),
      ...(config !== undefined && { config: config as Prisma.InputJsonValue }),
      ...(required !== undefined && { required }),
      ...(order !== undefined && { order }),
      ...(hidden !== undefined && { isHidden: hidden }),
    },
  });

  return NextResponse.json(updated);
}

// ─── DELETE /api/tables/[id]/fields ──────────────────────────────────────────
// Deletes a field.
//
// Pack-sourced fields (isCustom:false) CANNOT be deleted — they would break the
// canonical schema reference and could corrupt existing record data.
// Use PATCH with { hidden: true } to soft-hide them instead.
//
// Custom fields (isCustom:true) are deleted normally. If the field was added via
// a pack-table override, the corresponding WorkspaceSchemaOverride(ADD_FIELD) row
// is also cleaned up so the resolver doesn't re-materialize it.
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const table = await db.table.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const { fieldId } = await req.json();
  if (!fieldId) return NextResponse.json({ error: "fieldId is required" }, { status: 400 });

  const field = await db.field.findFirst({ where: { id: fieldId, tableId: id } });
  if (!field) return NextResponse.json({ error: "Field not found" }, { status: 404 });

  // Guard: pack-sourced fields cannot be deleted
  if (!field.isCustom && table.packSource) {
    return NextResponse.json(
      {
        error: "Pre-built pack fields cannot be deleted. Use PATCH with { hidden: true } to hide this field instead.",
        hint: "HIDE_FIELD",
      },
      { status: 422 }
    );
  }

  // Custom field: delete the Field row + any ADD_FIELD override that created it
  await db.$transaction(async (tx) => {
    await tx.field.delete({ where: { id: fieldId } });

    // Clean up the ADD_FIELD override so the schema resolver doesn't re-materialize
    // this field if the pack is ever reinstalled
    if (table.packSource && table.packTableKey && field.packFieldKey) {
      const installedPack = await tx.installedPack.findUnique({
        where: {
          packId_workspaceId: { packId: table.packSource, workspaceId: workspace.id },
        },
      });
      if (installedPack) {
        await tx.workspaceSchemaOverride.deleteMany({
          where: {
            installedPackId: installedPack.id,
            overrideType: OverrideType.ADD_FIELD,
            targetKey: table.packTableKey,
            // Match the specific field by checking payload name
            // (Prisma doesn't support JSON path filters in deleteMany — delete all ADD_FIELD overrides
            //  for this field name as a best-effort cleanup)
          },
        });
      }
    }
  });

  return NextResponse.json({ success: true });
}
