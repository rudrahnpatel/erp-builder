import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

// PATCH /api/plugins/[id]/config — update plugin config or toggle enabled
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { config, enabled } = await req.json();

  const plugin = await db.installedPlugin.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!plugin) return NextResponse.json({ error: "Plugin not found" }, { status: 404 });

  const updated = await db.installedPlugin.update({
    where: { id },
    data: {
      ...(config !== undefined && { config }),
      ...(enabled !== undefined && { enabled }),
    },
  });

  return NextResponse.json(updated);
}
