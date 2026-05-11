import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

// PATCH /api/tables/[id]/records/[recordId] : update a record
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

  // Sync with GlobalSearchIndex
  const stringValues = Object.values(mergedData as object).filter(v => typeof v === "string" && v.length > 0);
  const displayTitle = stringValues.length > 0 ? String(stringValues[0]) : "Record";
  const keywords = stringValues.join(" ").substring(0, 1000);
  const searchUrl = `/apps/${workspace.slug}/${id}#record-${recordId}`;

  try {
    const existingIndex = await db.globalSearchIndex.findFirst({
      where: { url: searchUrl, workspaceId: workspace.id }
    });

    if (existingIndex) {
      await db.globalSearchIndex.update({
        where: { id: existingIndex.id },
        data: { title: `${displayTitle} (${table.name})`, keywords }
      });
    } else {
      await db.globalSearchIndex.create({
        data: {
          title: `${displayTitle} (${table.name})`,
          type: "record",
          url: searchUrl,
          keywords,
          category: "Data Records",
          workspaceId: workspace.id,
        }
      });
    }
  } catch (err) {
    console.error("Failed to sync search index", err);
  }

  return NextResponse.json(updated);
}

// DELETE /api/tables/[id]/records/[recordId] : delete a record
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

  try {
    const searchUrl = `/apps/${workspace.slug}/${id}#record-${recordId}`;
    await db.globalSearchIndex.deleteMany({
      where: { url: searchUrl, workspaceId: workspace.id }
    });
  } catch (err) {
    console.error("Failed to delete search index", err);
  }

  return NextResponse.json({ success: true });
}
