import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import { allPlugins } from "@/lib/plugins/registry";

// POST /api/plugins/install — install a plugin with default config
export async function POST(req: Request) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pluginId } = await req.json();
  if (!pluginId) return NextResponse.json({ error: "pluginId is required" }, { status: 400 });

  const plugin = allPlugins.find((p) => p.id === pluginId);
  if (!plugin) return NextResponse.json({ error: "Plugin not found" }, { status: 404 });

  const existing = await db.installedPlugin.findUnique({
    where: { pluginId_workspaceId: { pluginId, workspaceId: workspace.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Plugin already installed" }, { status: 409 });
  }

  // Build default config from plugin definition
  const defaultConfig: Record<string, Prisma.InputJsonValue> = {};
  for (const field of plugin.configFields) {
    if (field.defaultValue !== undefined) {
      defaultConfig[field.name] = field.defaultValue as Prisma.InputJsonValue;
    }
  }

  const installed = await db.installedPlugin.create({
    data: {
      pluginId,
      config: defaultConfig as Prisma.InputJsonValue,
      enabled: true,
      workspaceId: workspace.id,
    },
  });

  return NextResponse.json(installed, { status: 201 });
}
