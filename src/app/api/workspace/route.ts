import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

// GET /api/workspace — workspace summary for dashboard
export async function GET() {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if tenantUser model is available (may be missing if Prisma client hasn't been regenerated yet)
    const hasTenantUserModel = typeof (db as any).tenantUser !== "undefined";

    const [tables, pages, installedPacks, installedPlugins, tenantUsers] = await Promise.all([
      db.table.findMany({
        where: { workspaceId: workspace.id },
        select: {
          id: true, name: true, icon: true, packSource: true, createdAt: true,
          _count: { select: { records: true, fields: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.page.findMany({
        where: { workspaceId: workspace.id },
        select: { id: true, title: true, icon: true, packSource: true, packPageKey: true, order: true },
        orderBy: { order: "asc" },
      }),
      db.installedPack.findMany({
        where: { workspaceId: workspace.id },
        select: { packId: true, packVersion: true },
      }),
      db.installedPlugin.findMany({
        where: { workspaceId: workspace.id },
        select: { pluginId: true, enabled: true },
      }),
      hasTenantUserModel
        ? (db as any).tenantUser.findMany({
            where: { workspaceId: workspace.id },
            select: { id: true, role: true },
          }).catch(() => [])
        : Promise.resolve([]),
    ]);

    const tenantUserCount = tenantUsers.length;
    const hasTenantAdmin = tenantUsers.some((u: any) => u.role === "admin");

    return NextResponse.json({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      stats: {
        tables: tables.length,
        totalRecords: tables.reduce((sum, t) => sum + t._count.records, 0),
        pages: pages.length,
        installedPacks: installedPacks.length,
        installedPlugins: installedPlugins.length,
        tenantUsers: tenantUserCount,
      },
      hasTenantAdmin,
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
        packPageKey: p.packPageKey,
      })),
      installedPacks: installedPacks.map((p) => p.packId),
      installedPackDetails: installedPacks.map((p) => ({
        packId: p.packId,
        packVersion: p.packVersion,
      })),
      installedPlugins: installedPlugins.map((p) => ({
        pluginId: p.pluginId,
        enabled: p.enabled,
      })),
    });
  } catch (error) {
    console.error("[WORKSPACE_GET_ERROR]", error);
    return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  }
}
