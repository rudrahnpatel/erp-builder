import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

// GET /api/pages/[id] — get a page with its block tree
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const page = await db.page.findFirst({
    where: { id, workspaceId: workspace.id },
  });

  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  return NextResponse.json(page);
}

// PATCH /api/pages/[id] — update page title, icon, or blocks
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { title, icon, blocks, order } = await req.json();

  const page = await db.page.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  const updated = await db.page.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(icon !== undefined && { icon }),
      ...(blocks !== undefined && { blocks }),
      ...(order !== undefined && { order }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/pages/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const page = await db.page.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  await db.page.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
