import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

// GET /api/dev/modules/[moduleId] — get full module detail
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { moduleId } = await params;
    const mod = await db.moduleDefinition.findFirst({
      where: { id: moduleId, workspaceId: workspace.id },
    });
    if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 });

    return NextResponse.json({ module: mod });
  } catch (error) {
    console.error("[DEV_MODULE_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to get module" }, { status: 500 });
  }
}

// PATCH /api/dev/modules/[moduleId] — update module metadata
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { moduleId } = await params;
    const mod = await db.moduleDefinition.findFirst({
      where: { id: moduleId, workspaceId: workspace.id },
    });
    if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 });

    const body = await req.json();
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.category !== undefined) updateData.category = body.category;

    const updated = await db.moduleDefinition.update({
      where: { id: moduleId },
      data: updateData,
    });

    return NextResponse.json({ module: updated });
  } catch (error) {
    console.error("[DEV_MODULE_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Failed to update module" }, { status: 500 });
  }
}

// DELETE /api/dev/modules/[moduleId] — delete a module
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { moduleId } = await params;
    const mod = await db.moduleDefinition.findFirst({
      where: { id: moduleId, workspaceId: workspace.id },
    });
    if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 });

    await db.moduleDefinition.delete({ where: { id: moduleId } });
    return NextResponse.json({ message: `Module "${mod.name}" deleted` });
  } catch (error) {
    console.error("[DEV_MODULE_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Failed to delete module" }, { status: 500 });
  }
}
