import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import { allPlugins } from "@/lib/plugins/registry";

// GET /api/plugins — list all plugins + installed status/config
export async function GET() {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const installed = await db.installedPlugin.findMany({
    where: { workspaceId: workspace.id },
  });

  const installedMap = new Map(installed.map((p) => [p.pluginId, p]));

  const plugins = allPlugins.map((plugin) => {
    const inst = installedMap.get(plugin.id);
    return {
      ...plugin,
      installed: !!inst,
      enabled: inst?.enabled ?? false,
      savedConfig: inst?.config ?? null,
    };
  });

  return NextResponse.json(plugins);
}
