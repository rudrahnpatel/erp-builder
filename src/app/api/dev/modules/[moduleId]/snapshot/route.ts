import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import type { PackTableDefinition, PackPageDefinition } from "@/types/pack";

// POST /api/dev/modules/[moduleId]/snapshot
// Snapshots the current workspace tables and pages that are tagged with this
// module's packId into the module definition. Bumps the version. Optionally
// publishes the module to the marketplace.
//
// This is the core "publish" flow for dev mode:
//   1. Dev designs pages/tables in the workspace GUI
//   2. Dev clicks "Snapshot" on their module
//   3. All workspace tables/pages with matching packSource get serialized
//   4. The serialized definition is what other workspaces install
export async function POST(
  req: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { moduleId } = await params;
    const mod = await db.moduleDefinition.findFirst({
      where: { id: moduleId, workspaceId: workspace.id },
    });
    if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const publish = body.publish === true;

    // ── 1. Snapshot tables ────────────────────────────────────────────────
    // Find all workspace tables tagged with this module's packId
    const tables = await db.table.findMany({
      where: { workspaceId: workspace.id, packSource: mod.packId },
      include: {
        fields: { orderBy: { order: "asc" } },
        records: { take: 5 }, // Include up to 5 seed records
      },
    });

    const tableDefs: PackTableDefinition[] = tables.map((table) => {
      const fields = table.fields
        .filter((f) => !f.isHidden)
        .map((field) => {
          const def: any = {
            name: field.packFieldKey || field.name,
            type: field.type,
          };
          if (field.required) def.required = true;
          if (field.config && typeof field.config === "object") {
            const cfg = field.config as Record<string, unknown>;
            // Strip internal IDs from config, keep user-facing settings
            const cleanConfig: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(cfg)) {
              if (k === "linkedTableId") continue; // resolved at install time
              cleanConfig[k] = v;
            }
            // For RELATION fields, ensure linkedTable name is present
            if (field.type === "RELATION" && !cleanConfig.linkedTable) {
              // Try to resolve the table name from the ID
              const linkedId = cfg.linkedTableId as string;
              if (linkedId) {
                const linkedTable = tables.find((t) => t.id === linkedId);
                if (linkedTable) {
                  cleanConfig.linkedTable = linkedTable.packTableKey || linkedTable.name;
                }
              }
            }
            if (Object.keys(cleanConfig).length > 0) def.config = cleanConfig;
          }
          return def;
        });

      // Convert seed records: field IDs → field names
      const fieldIdToName: Record<string, string> = {};
      for (const f of table.fields) {
        fieldIdToName[f.id] = f.packFieldKey || f.name;
      }

      const seedData = table.records.map((record) => {
        const data = record.data as Record<string, unknown>;
        const row: Record<string, unknown> = {};
        for (const [fieldId, value] of Object.entries(data)) {
          const fieldName = fieldIdToName[fieldId];
          if (fieldName) row[fieldName] = value;
        }
        return row;
      });

      return {
        name: table.packTableKey || table.name,
        icon: table.icon || "database",
        fields,
        ...(seedData.length > 0 ? { seedData } : {}),
      };
    });

    // ── 2. Snapshot pages ─────────────────────────────────────────────────
    const pages = await db.page.findMany({
      where: { workspaceId: workspace.id, packSource: mod.packId },
      orderBy: { order: "asc" },
    });

    // Build a map: table ID → table name for resolving tableRef in blocks
    const tableIdToName: Record<string, string> = {};
    for (const t of tables) {
      tableIdToName[t.id] = t.packTableKey || t.name;
    }
    // Also include ALL workspace tables for resolution
    const allTables = await db.table.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, name: true, packTableKey: true },
    });
    for (const t of allTables) {
      if (!tableIdToName[t.id]) {
        tableIdToName[t.id] = t.packTableKey || t.name;
      }
    }

    const pageDefs: PackPageDefinition[] = pages.map((page) => {
      const blocks = ((page.blocks as any[]) || []).map((block) => {
        const config: Record<string, unknown> = { ...block.config };

        // Convert resolved tableId back to tableRef name
        if (config.tableId && typeof config.tableId === "string") {
          const tableName = tableIdToName[config.tableId as string];
          if (tableName) {
            config.tableRef = tableName;
          }
          delete config.tableId; // Remove runtime-resolved ID
        }

        return { type: block.type, config };
      });

      return {
        key: page.packPageKey || page.title.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
        title: page.title,
        icon: page.icon || "layout-dashboard",
        blocks,
      };
    });

    // ── 3. Bump version ───────────────────────────────────────────────────
    const [major, minor, patch] = mod.version.split(".").map(Number);
    const newVersion = `${major}.${minor}.${(patch || 0) + 1}`;

    // ── 4. Update the module definition ───────────────────────────────────
    const updated = await db.moduleDefinition.update({
      where: { id: moduleId },
      data: {
        tables: tableDefs as any,
        pages: pageDefs as any,
        version: newVersion,
        ...(publish ? { published: true } : {}),
      },
    });

    return NextResponse.json({
      message: `Module "${mod.name}" snapshotted to v${newVersion}${publish ? " and published" : ""}`,
      version: newVersion,
      published: updated.published,
      snapshot: {
        tables: tableDefs.length,
        pages: pageDefs.length,
        tableNames: tableDefs.map((t) => t.name),
        pageNames: pageDefs.map((p) => p.title),
      },
    });
  } catch (error) {
    console.error("[DEV_MODULE_SNAPSHOT_ERROR]", error);
    return NextResponse.json({ error: "Failed to snapshot module" }, { status: 500 });
  }
}
