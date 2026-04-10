import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

// GET /api/workspace — workspace summary for dashboard
export async function GET() {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [tables, pages, installedPacks, installedPlugins] = await Promise.all([
    db.table.findMany({
      where: { workspaceId: workspace.id },
      include: { _count: { select: { records: true, fields: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.page.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { order: "asc" },
    }),
    db.installedPack.findMany({
      where: { workspaceId: workspace.id },
    }),
    db.installedPlugin.findMany({
      where: { workspaceId: workspace.id },
    }),
  ]);

  return NextResponse.json({
    id: workspace.id,
    name: workspace.name,
    stats: {
      tables: tables.length,
      totalRecords: tables.reduce((sum, t) => sum + t._count.records, 0),
      pages: pages.length,
      installedPacks: installedPacks.length,
      installedPlugins: installedPlugins.length,
    },
    tables: tables.map((t) => ({
      id: t.id,
      name: t.name,
      icon: t.icon,
      packSource: t.packSource,
      fieldCount: t._count.fields,
      recordCount: t._count.records,
    })),
    pages: pages.map((p) => ({
      id: p.id,
      title: p.title,
      icon: p.icon,
      packSource: p.packSource,
    })),
    installedPacks: installedPacks.map((p) => p.packId),
    installedPlugins: installedPlugins.map((p) => ({
      pluginId: p.pluginId,
      enabled: p.enabled,
    })),
  });
}
