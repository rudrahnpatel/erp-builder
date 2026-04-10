import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

// GET /api/tables/[id] — get single table with fields
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const table = await db.table.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      fields: { orderBy: { order: "asc" } },
      _count: { select: { records: true } },
    },
  });

  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  return NextResponse.json(table);
}

// PATCH /api/tables/[id] — update table name/icon
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, icon } = await req.json();

  const table = await db.table.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const updated = await db.table.update({
    where: { id },
    data: { ...(name && { name }), ...(icon !== undefined && { icon }) },
  });

  return NextResponse.json(updated);
}

// DELETE /api/tables/[id] — delete table + cascade fields/records
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const table = await db.table.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  await db.table.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
