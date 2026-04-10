import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import { FieldType } from "@prisma/client";

// GET /api/tables/[id]/fields — list fields for a table
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const table = await db.table.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const fields = await db.field.findMany({
    where: { tableId: id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(fields);
}

// POST /api/tables/[id]/fields — add a field
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const table = await db.table.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const { name, type, config, required } = await req.json();

  if (!name || !type) {
    return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
  }

  if (!Object.values(FieldType).includes(type)) {
    return NextResponse.json({ error: `Invalid field type: ${type}` }, { status: 400 });
  }

  // Get the next order value
  const lastField = await db.field.findFirst({
    where: { tableId: id },
    orderBy: { order: "desc" },
  });

  const field = await db.field.create({
    data: {
      name,
      type: type as FieldType,
      config: config || {},
      required: required || false,
      order: (lastField?.order ?? -1) + 1,
      tableId: id,
    },
  });

  return NextResponse.json(field, { status: 201 });
}

// PATCH /api/tables/[id]/fields — update a field (fieldId in body)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const table = await db.table.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const { fieldId, name, type, config, required, order } = await req.json();

  if (!fieldId) return NextResponse.json({ error: "fieldId is required" }, { status: 400 });

  const field = await db.field.findFirst({ where: { id: fieldId, tableId: id } });
  if (!field) return NextResponse.json({ error: "Field not found" }, { status: 404 });

  const updated = await db.field.update({
    where: { id: fieldId },
    data: {
      ...(name && { name }),
      ...(type && { type: type as FieldType }),
      ...(config !== undefined && { config }),
      ...(required !== undefined && { required }),
      ...(order !== undefined && { order }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/tables/[id]/fields — delete a field (fieldId in body)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const table = await db.table.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const { fieldId } = await req.json();
  if (!fieldId) return NextResponse.json({ error: "fieldId is required" }, { status: 400 });

  const field = await db.field.findFirst({ where: { id: fieldId, tableId: id } });
  if (!field) return NextResponse.json({ error: "Field not found" }, { status: 404 });

  await db.field.delete({ where: { id: fieldId } });

  return NextResponse.json({ success: true });
}
