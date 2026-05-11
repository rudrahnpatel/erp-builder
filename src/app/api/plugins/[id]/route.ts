import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import { allPlugins } from "@/lib/plugins/registry";

// GET /api/plugins/[id] — get a single plugin definition + installed config
// Here [id] is the pluginId from registry (e.g. "upi-payment-link"), NOT the DB row id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: pluginId } = await params;

  const plugin = allPlugins.find((p) => p.id === pluginId);
  if (!plugin)
    return NextResponse.json({ error: "Plugin not found" }, { status: 404 });

  const installed = await db.installedPlugin.findUnique({
    where: {
      pluginId_workspaceId: { pluginId, workspaceId: workspace.id },
    },
  });

  return NextResponse.json({
    ...plugin,
    installed: !!installed,
    enabled: installed?.enabled ?? false,
    savedConfig: installed?.config ?? {},
    installedPluginId: installed?.id ?? null,
  });
}
