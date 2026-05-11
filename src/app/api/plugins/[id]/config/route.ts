import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import { allPlugins } from "@/lib/plugins/registry";

// PATCH /api/plugins/[id]/config — update installed plugin config
// [id] here is the pluginId from registry (e.g. "upi-payment-link")
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: pluginId } = await params;
  const { config } = await req.json();

  // Verify it's a valid plugin
  const pluginDef = allPlugins.find((p) => p.id === pluginId);
  if (!pluginDef)
    return NextResponse.json({ error: "Plugin not found" }, { status: 404 });

  // Find installed instance
  const installed = await db.installedPlugin.findUnique({
    where: {
      pluginId_workspaceId: { pluginId, workspaceId: workspace.id },
    },
  });

  if (!installed)
    return NextResponse.json(
      { error: "Plugin not installed" },
      { status: 404 }
    );

  const updated = await db.installedPlugin.update({
    where: { id: installed.id },
    data: { config },
  });

  return NextResponse.json(updated);
}
