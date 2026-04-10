import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

// GET /api/tables — list all tables in workspace
export async function GET() {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tables = await db.table.findMany({
    where: { workspaceId: workspace.id },
    include: { fields: { orderBy: { order: "asc" } }, _count: { select: { records: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(tables);
}

// POST /api/tables — create a new table
export async function POST(req: Request) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, icon } = await req.json();
  if (!name) return NextResponse.json({ error: "Table name is required" }, { status: 400 });

  const table = await db.table.create({
    data: {
      name,
      icon: icon || null,
      workspaceId: workspace.id,
    },
    include: { fields: true },
  });

  return NextResponse.json(table, { status: 201 });
}
