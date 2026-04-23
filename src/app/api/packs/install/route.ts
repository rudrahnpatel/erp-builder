import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import { getPackById } from "@/lib/packs";
import { FieldType, Prisma } from "@prisma/client";

// POST /api/packs/install — install a module pack into the workspace
export async function POST(req: Request) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { packId, selectedTables = {}, selectedFields = {}, selectedPages = {} } = await req.json();
    if (!packId) return NextResponse.json({ error: "packId is required" }, { status: 400 });

    // Check if already installed
    const existing = await db.installedPack.findUnique({
      where: { packId_workspaceId: { packId, workspaceId: workspace.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Pack already installed" }, { status: 409 });
    }

    const pack = getPackById(packId);
    if (!pack) return NextResponse.json({ error: "Pack not found" }, { status: 404 });

    // Install in a transaction: create tables, fields, seed data, pages
    const result = await db.$transaction(async (tx) => {
      // Track created table IDs by name (for RELATION field resolution)
      const tableIdMap: Record<string, string> = {};

      // 1. Create all tables + fields — tagged with pack provenance
      for (let tIdx = 0; tIdx < pack.tables.length; tIdx++) {
        const tableDef = pack.tables[tIdx];
        const isTableRequired = tIdx === 0 || !pack.tables[tIdx].fields.some(f => f.required);
        
        // Let explicit skip occur only if it's not the required primary table
        if (selectedTables[tableDef.name] === false && tIdx !== 0) {
          continue;
        }
        const table = await tx.table.create({
          data: {
            name: tableDef.name,
            icon: tableDef.icon,
            packSource: packId,
            packTableKey: tableDef.name, // canonical key — never changes even if user renames table
            isCustom: false,             // created by pack, not by user
            workspaceId: workspace.id,
          },
        });

        tableIdMap[tableDef.name] = table.id;

        // Create fields — each tagged with its canonical key
        const fieldIdMap: Record<string, string> = {};
        for (let i = 0; i < tableDef.fields.length; i++) {
          const fieldDef = tableDef.fields[i];
          const key = `${tableDef.name}::${fieldDef.name}`;
          
          if (selectedFields[key] === false && !fieldDef.required) continue;

          const config = { ...(fieldDef.config as object || {}) } as Record<string, unknown>;

          // Resolve RELATION fields: linked table name → real DB table ID
          // Note: forward references (table not yet created) will have a null resolvedLinkedTableId.
          // The install order in registry.ts must ensure dependencies come first.
          if (fieldDef.type === "RELATION" && config.linkedTable) {
            const resolvedLinkedTableId = tableIdMap[config.linkedTable as string];
            if (resolvedLinkedTableId) {
              config.linkedTableId = resolvedLinkedTableId;
            }
            // Keep linkedTable name as fallback for display even if ID not resolved yet
          }

          const field = await tx.field.create({
            data: {
              name: fieldDef.name,
              type: fieldDef.type as FieldType,
              config: config as Prisma.InputJsonValue,
              required: fieldDef.required || false,
              order: i,
              tableId: table.id,
              packFieldKey: fieldDef.name, // canonical key — never changes
              isCustom: false,             // created by pack, not by user
              isHidden: false,
            },
          });
          fieldIdMap[fieldDef.name] = field.id;
        }

        // 2. Create seed records (map field names → field IDs in data payload)
        if (tableDef.seedData) {
          for (const row of tableDef.seedData) {
            const data: Record<string, Prisma.InputJsonValue> = {};
            for (const [fieldName, value] of Object.entries(row)) {
              const fieldId = fieldIdMap[fieldName];
              if (fieldId) {
                data[fieldId] = value as Prisma.InputJsonValue;
              }
            }
            await tx.record.create({
              data: { data: data as Prisma.InputJsonValue, tableId: table.id },
            });
          }
        }
      }

      // 3. Create pages from pack page definitions
      // Resolve tableRef names → actual table IDs in block configs
      const createdPages = [];
      for (let i = 0; i < pack.pageDefinitions.length; i++) {
        const pageDef = pack.pageDefinitions[i];

        if (selectedPages[pageDef.key] === false) continue;

        const resolvedBlocks = pageDef.blocks.map((block) => {
          const config: Record<string, Prisma.InputJsonValue> = {};
          for (const [k, v] of Object.entries(block.config)) {
            config[k] = v as Prisma.InputJsonValue;
          }
          if (config.tableRef && typeof config.tableRef === "string") {
            const resolvedTableId = tableIdMap[config.tableRef];
            if (resolvedTableId) {
              config.tableId = resolvedTableId;
            }
          }
          return { type: block.type, config };
        });

        const page = await tx.page.create({
          data: {
            title: pageDef.title,
            icon: pageDef.icon,
            blocks: resolvedBlocks as unknown as Prisma.InputJsonValue,
            packSource: packId,
            packPageKey: pageDef.key, // canonical key — survives renames
            order: i,
            workspaceId: workspace.id,
          },
        });
        createdPages.push(page);
      }

      // 4. Mark as installed — record the canonical pack version at install time
      await tx.installedPack.create({
        data: {
          packId,
          packVersion: "1.0.0", // bump this in registry.ts when schemas change
          workspaceId: workspace.id,
        },
      });

      return {
        tables: Object.entries(tableIdMap).map(([name, id]) => ({ name, id })),
        pages: createdPages.map((p) => ({ title: p.title, id: p.id })),
      };
    },
    {
      maxWait: 10000, // 10 seconds to acquire a connection
      timeout: 30000, // 30 seconds for the full install (7 tables + seed data)
    });

    return NextResponse.json(
      { message: `Pack "${pack.name}" installed successfully`, ...result },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Pack installation failed:", error);
    const message = error instanceof Error ? error.message : "Internal server error during installation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
