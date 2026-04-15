import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import { getPackById } from "@/lib/packs";
import { Prisma } from "@prisma/client";

// POST /api/packs/reinstall-page — re-add a single missing page from a pack
export async function POST(req: Request) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { packId, pageKey } = await req.json();
    if (!packId || !pageKey) {
      return NextResponse.json({ error: "packId and pageKey are required" }, { status: 400 });
    }

    // Verify pack is installed
    const installed = await db.installedPack.findUnique({
      where: { packId_workspaceId: { packId, workspaceId: workspace.id } },
    });
    if (!installed) {
      return NextResponse.json({ error: "Pack not installed" }, { status: 404 });
    }

    // Find the page definition in the pack
    const pack = getPackById(packId);
    if (!pack) return NextResponse.json({ error: "Pack not found" }, { status: 404 });

    const pageDef = pack.pageDefinitions.find((p) => p.key === pageKey);
    if (!pageDef) {
      return NextResponse.json({ error: `Page key "${pageKey}" not found in pack` }, { status: 404 });
    }

    // Check if page already exists (avoid duplicates)
    const existing = await db.page.findFirst({
      where: { packSource: packId, packPageKey: pageKey, workspaceId: workspace.id },
    });
    if (existing) {
      return NextResponse.json({ error: "Page already exists", page: existing }, { status: 409 });
    }

    // Resolve tableRef names → actual table IDs from workspace
    const workspaceTables = await db.table.findMany({
      where: { packSource: packId, workspaceId: workspace.id },
    });
    const tableIdMap: Record<string, string> = {};
    for (const t of workspaceTables) {
      if (t.packTableKey) tableIdMap[t.packTableKey] = t.id;
    }

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

    // Get next order value
    const lastPage = await db.page.findFirst({
      where: { workspaceId: workspace.id },
      orderBy: { order: "desc" },
    });

    const page = await db.page.create({
      data: {
        title: pageDef.title,
        icon: pageDef.icon,
        blocks: resolvedBlocks as unknown as Prisma.InputJsonValue,
        packSource: packId,
        packPageKey: pageDef.key,
        order: (lastPage?.order ?? -1) + 1,
        workspaceId: workspace.id,
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error: unknown) {
    console.error("Page reinstall failed:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
