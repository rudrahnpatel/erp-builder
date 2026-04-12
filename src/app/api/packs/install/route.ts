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

    const { packId } = await req.json();
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

      // 1. Create all tables + fields
      for (const tableDef of pack.tables) {
        const table = await tx.table.create({
          data: {
            name: tableDef.name,
            icon: tableDef.icon,
            packSource: packId,
            workspaceId: workspace.id,
          },
        });

        tableIdMap[tableDef.name] = table.id;

        // Create fields
        const fieldIdMap: Record<string, string> = {};
        for (let i = 0; i < tableDef.fields.length; i++) {
          const fieldDef = tableDef.fields[i];
          const config = { ...(fieldDef.config as object || {}) } as any;

          // Resolve RELATION fields linked table name to real table ID
          if (fieldDef.type === "RELATION" && config.linkedTable) {
            const resolvedLinkedTableId = tableIdMap[config.linkedTable];
            if (resolvedLinkedTableId) {
              config.linkedTableId = resolvedLinkedTableId;
            }
          }

          const field = await tx.field.create({
            data: {
              name: fieldDef.name,
              type: fieldDef.type as FieldType,
              config: config as Prisma.InputJsonValue,
              required: fieldDef.required || false,
              order: i,
              tableId: table.id,
            },
          });
          fieldIdMap[fieldDef.name] = field.id;
        }

        // 2. Create seed records (map field names to field IDs in data)
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
      // Resolve tableRef names to actual table IDs in block configs
      const createdPages = [];
      for (let i = 0; i < pack.pageDefinitions.length; i++) {
        const pageDef = pack.pageDefinitions[i];

        // Resolve tableRef in block configs to real table IDs
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
            order: i,
            workspaceId: workspace.id,
          },
        });
        createdPages.push(page);
      }

      // 4. Mark as installed
      await tx.installedPack.create({
        data: { packId, workspaceId: workspace.id },
      });

      return {
        tables: Object.entries(tableIdMap).map(([name, id]) => ({ name, id })),
        pages: createdPages.map((p) => ({ title: p.title, id: p.id })),
      };
    },
    {
      maxWait: 10000, // 10 seconds to acquire a connection
      timeout: 30000, // 30 seconds for the operation to complete
    });

    return NextResponse.json(
      { message: `Pack "${pack.name}" installed successfully`, ...result },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Pack installation failed:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during installation" },
      { status: 500 }
    );
  }
}

