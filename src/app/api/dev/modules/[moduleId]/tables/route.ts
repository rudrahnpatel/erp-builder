import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

// GET /api/dev/modules/[moduleId]/tables — list tables scoped to this module
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

    const tables = await db.table.findMany({
      where: { workspaceId: workspace.id, packSource: mod.packId },
      include: {
        fields: { orderBy: { order: "asc" } },
        _count: { select: { records: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      tables: tables.map((t) => ({
        id: t.id,
        name: t.name,
        icon: t.icon,
        packSource: t.packSource,
        packTableKey: t.packTableKey,
        fieldCount: t.fields.length,
        recordCount: t._count.records,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("[DEV_MODULE_TABLES_LIST_ERROR]", error);
    return NextResponse.json({ error: "Failed to list module tables" }, { status: 500 });
  }
}

// POST /api/dev/modules/[moduleId]/tables — create a table scoped to this module
export async function POST(
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

    const { name, icon } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Table name is required" }, { status: 400 });

    const table = await db.table.create({
      data: {
        name: name.trim(),
        icon: icon || null,
        workspaceId: workspace.id,
        packSource: mod.packId,
        packTableKey: name.trim(),
      },
      include: { fields: true },
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error("[DEV_MODULE_TABLES_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to create module table" }, { status: 500 });
  }
}
