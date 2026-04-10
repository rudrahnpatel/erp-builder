import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

// PATCH /api/tables/[id]/records/[recordId] — update a record
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, recordId } = await params;

  const table = await db.table.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const record = await db.record.findFirst({ where: { id: recordId, tableId: id } });
  if (!record) return NextResponse.json({ error: "Record not found" }, { status: 404 });

  const { data } = await req.json();

  // Merge new data with existing data
  const existingData = record.data as Record<string, unknown>;
  const mergedData = { ...existingData, ...data };

  const updated = await db.record.update({
    where: { id: recordId },
    data: { data: mergedData },
  });

  return NextResponse.json(updated);
}

// DELETE /api/tables/[id]/records/[recordId] — delete a record
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, recordId } = await params;

  const table = await db.table.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const record = await db.record.findFirst({ where: { id: recordId, tableId: id } });
  if (!record) return NextResponse.json({ error: "Record not found" }, { status: 404 });

  await db.record.delete({ where: { id: recordId } });

  return NextResponse.json({ success: true });
}
