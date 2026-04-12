import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import { FieldType, Prisma } from "@prisma/client";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const table = await db.table.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const { fields } = await req.json();

  // Delete all current fields and insert new ones to simplify sync (if order/etc changed)
  // Actually, wait, replacing all fields would drop data columns if Prisma was mapping to DB directly.
  // In our ERP, `Record` schema holds `data: Json`. Removing a Field simply removes it from config. 
  // It's perfectly safe to delete and recreate the config fields!
  await db.$transaction(async (tx) => {
    await tx.field.deleteMany({ where: { tableId: id } });
    if (fields && fields.length > 0) {
      await tx.field.createMany({
        data: fields.map((f: any, i: number) => ({
          id: f.id.startsWith("temp-") ? undefined : f.id,
          name: f.name,
          type: f.type as FieldType,
          config: f.config || {},
          required: f.required || false,
          order: i,
          tableId: id,
        })),
      });
    }
  });

  return NextResponse.json({ success: true });
}
