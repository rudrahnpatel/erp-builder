import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

// POST /api/plugins/uninstall — uninstall a plugin
export async function POST(req: Request) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pluginId } = await req.json();
  if (!pluginId) return NextResponse.json({ error: "pluginId is required" }, { status: 400 });

  const existing = await db.installedPlugin.findUnique({
    where: { pluginId_workspaceId: { pluginId, workspaceId: workspace.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Plugin not installed" }, { status: 404 });
  }

  await db.installedPlugin.delete({
    where: { pluginId_workspaceId: { pluginId, workspaceId: workspace.id } },
  });

  return NextResponse.json({ message: "Plugin uninstalled" });
}
