import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import { getPackByIdAsync } from "@/lib/packs";
import { FieldType, Prisma } from "@prisma/client";

// POST /api/packs/update — sync an installed pack to the latest registry version.
// Strictly ADDITIVE: adds missing tables, missing fields on existing tables, and
// missing pages. Never touches user records, renames, or removes data. Fields the
// user hid or renamed are left alone; we only add by `packFieldKey`.
export async function POST(req: Request) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { packId } = await req.json();
    if (!packId) return NextResponse.json({ error: "packId is required" }, { status: 400 });

    const installed = await db.installedPack.findUnique({
      where: { packId_workspaceId: { packId, workspaceId: workspace.id } },
    });
    if (!installed) {
      return NextResponse.json({ error: "Pack not installed" }, { status: 404 });
    }

    const pack = await getPackByIdAsync(packId);
    if (!pack) return NextResponse.json({ error: "Pack not found" }, { status: 404 });

    if (installed.packVersion === pack.version) {
      return NextResponse.json(
        { message: "Pack already up to date", packVersion: pack.version, added: { tables: [], fields: [], pages: [] } },
        { status: 200 }
      );
    }

    const added = await db.$transaction(async (tx) => {
      const addedTables: string[] = [];
      const addedFields: string[] = [];
      const addedPages: string[] = [];

      // Load all workspace tables once so we can cross-resolve RELATION fields
      // that point to tables created inside this same update run.
      const existingTables = await tx.table.findMany({
        where: { workspaceId: workspace.id },
      });
      const tableIdByKey: Record<string, string> = {};
      for (const t of existingTables) {
        if (t.packSource === packId && t.packTableKey) {
          tableIdByKey[t.packTableKey] = t.id;
        }
      }

      // ── 1. Add tables that don't exist yet ───────────────────────────────
      for (const tableDef of pack.tables) {
        if (tableIdByKey[tableDef.name]) continue; // already there

        const table = await tx.table.create({
          data: {
            name: tableDef.name,
            icon: tableDef.icon,
            packSource: packId,
            packTableKey: tableDef.name,
            isCustom: false,
            workspaceId: workspace.id,
          },
        });
        tableIdByKey[tableDef.name] = table.id;
        addedTables.push(tableDef.name);

        const fieldIdMap: Record<string, string> = {};
        for (let i = 0; i < tableDef.fields.length; i++) {
          const fieldDef = tableDef.fields[i];
          const config = { ...(fieldDef.config as object || {}) } as Record<string, unknown>;
          if (fieldDef.type === "RELATION" && config.linkedTable) {
            const linkedId = tableIdByKey[config.linkedTable as string];
            if (linkedId) config.linkedTableId = linkedId;
          }
          const field = await tx.field.create({
            data: {
              name: fieldDef.name,
              type: fieldDef.type as FieldType,
              config: config as Prisma.InputJsonValue,
              required: fieldDef.required || false,
              order: i,
              tableId: table.id,
              packFieldKey: fieldDef.name,
              isCustom: false,
              isHidden: false,
            },
          });
          fieldIdMap[fieldDef.name] = field.id;
        }

        if (tableDef.seedData) {
          for (const row of tableDef.seedData) {
            const data: Record<string, Prisma.InputJsonValue> = {};
            for (const [fieldName, value] of Object.entries(row)) {
              const fieldId = fieldIdMap[fieldName];
              if (fieldId) data[fieldId] = value as Prisma.InputJsonValue;
            }
            await tx.record.create({
              data: { data: data as Prisma.InputJsonValue, tableId: table.id },
            });
          }
        }
      }

      // ── 2. Add missing fields to existing tables ─────────────────────────
      for (const tableDef of pack.tables) {
        const tableId = tableIdByKey[tableDef.name];
        if (!tableId) continue;
        // If we just created this table, all fields are already present.
        if (addedTables.includes(tableDef.name)) continue;

        const existingFields = await tx.field.findMany({
          where: { tableId },
          orderBy: { order: "desc" },
          take: 1,
        });
        let nextOrder = (existingFields[0]?.order ?? -1) + 1;

        const existingKeys = new Set(
          (
            await tx.field.findMany({
              where: { tableId },
              select: { packFieldKey: true },
            })
          )
            .map((f) => f.packFieldKey)
            .filter((k): k is string => !!k)
        );

        for (const fieldDef of tableDef.fields) {
          if (existingKeys.has(fieldDef.name)) continue;

          const config = { ...(fieldDef.config as object || {}) } as Record<string, unknown>;
          if (fieldDef.type === "RELATION" && config.linkedTable) {
            const linkedId = tableIdByKey[config.linkedTable as string];
            if (linkedId) config.linkedTableId = linkedId;
          }

          // Added fields are never marked required so we don't invalidate
          // existing records that haven't been populated yet.
          await tx.field.create({
            data: {
              name: fieldDef.name,
              type: fieldDef.type as FieldType,
              config: config as Prisma.InputJsonValue,
              required: false,
              order: nextOrder++,
              tableId,
              packFieldKey: fieldDef.name,
              isCustom: false,
              isHidden: false,
            },
          });
          addedFields.push(`${tableDef.name} → ${fieldDef.name}`);
        }
      }

      // ── 3. Add missing pages ─────────────────────────────────────────────
      const existingPages = await tx.page.findMany({
        where: { workspaceId: workspace.id, packSource: packId },
        select: { packPageKey: true },
      });
      const existingPageKeys = new Set(
        existingPages.map((p) => p.packPageKey).filter((k): k is string => !!k)
      );

      const lastPage = await tx.page.findFirst({
        where: { workspaceId: workspace.id },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      let nextPageOrder = (lastPage?.order ?? -1) + 1;

      for (const pageDef of pack.pageDefinitions) {
        if (existingPageKeys.has(pageDef.key)) continue;

        const resolvedBlocks = pageDef.blocks.map((block) => {
          const config: Record<string, Prisma.InputJsonValue> = {};
          for (const [k, v] of Object.entries(block.config)) {
            config[k] = v as Prisma.InputJsonValue;
          }
          if (config.tableRef && typeof config.tableRef === "string") {
            const resolvedTableId = tableIdByKey[config.tableRef];
            if (resolvedTableId) config.tableId = resolvedTableId;
          }
          return { type: block.type, config };
        });

        await tx.page.create({
          data: {
            title: pageDef.title,
            icon: pageDef.icon,
            blocks: resolvedBlocks as unknown as Prisma.InputJsonValue,
            packSource: packId,
            packPageKey: pageDef.key,
            order: nextPageOrder++,
            workspaceId: workspace.id,
          },
        });
        addedPages.push(pageDef.title);
      }

      // ── 4. Stamp the new version ─────────────────────────────────────────
      await tx.installedPack.update({
        where: { packId_workspaceId: { packId, workspaceId: workspace.id } },
        data: { packVersion: pack.version },
      });

      return { tables: addedTables, fields: addedFields, pages: addedPages };
    },
    {
      maxWait: 10000,
      timeout: 30000,
    });

    const nothing =
      added.tables.length === 0 &&
      added.fields.length === 0 &&
      added.pages.length === 0;

    return NextResponse.json(
      {
        message: nothing
          ? `Pack "${pack.name}" version stamped to ${pack.version} — no additions needed`
          : `Pack "${pack.name}" updated to ${pack.version}`,
        fromVersion: installed.packVersion,
        toVersion: pack.version,
        added,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Pack update failed:", error);
    const message = error instanceof Error ? error.message : "Internal server error during update";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
