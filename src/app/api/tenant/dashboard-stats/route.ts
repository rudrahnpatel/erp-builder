import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

export async function GET(request: Request) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [tables, pages, plugins, recordsCount] = await Promise.all([
      db.table.findMany({
        where: { workspaceId: workspace.id },
        include: { _count: { select: { records: true } } },
      }),
      db.page.count({ where: { workspaceId: workspace.id } }),
      db.installedPlugin.count({ where: { workspaceId: workspace.id, enabled: true } }),
      db.record.count({ where: { table: { workspaceId: workspace.id } } }),
    ]);

    const moduleDistribution = tables.reduce((acc: Record<string, number>, table) => {
      const pack = table.packSource || "custom";
      acc[pack] = (acc[pack] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(moduleDistribution).map(([name, value]) => ({
      name: name === "builtin" ? "Core" : name,
      value,
    }));

    const tableStats = tables.map(t => ({
      name: t.name,
      records: t._count.records,
    })).sort((a, b) => b.records - a.records).slice(0, 5); // Top 5 tables

    return NextResponse.json({
      stats: {
        totalTables: tables.length,
        totalPages: pages,
        totalPlugins: plugins,
        totalRecords: recordsCount,
      },
      chartData,
      tableStats,
      workspaceName: workspace.name,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
