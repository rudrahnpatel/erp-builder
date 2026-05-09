import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAuditAction } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { published } = body;

    const moduleDef = await db.moduleDefinition.update({
      where: { id },
      data: { published },
    });

    await logAuditAction({
      action: "UPDATE_MODULE_PUBLISH_STATUS",
      actorId: session.user.id,
      actorEmail: session.user.email,
      targetId: id,
      details: { published, moduleName: moduleDef.name, packId: moduleDef.packId },
    });

    return NextResponse.json(moduleDef);
  } catch (error) {
    console.error("Failed to update module:", error);
    return NextResponse.json({ error: "Failed to update module" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;

    const targetModule = await db.moduleDefinition.findUnique({ where: { id } });

    if (!targetModule) {
        return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    await db.moduleDefinition.delete({
      where: { id },
    });

    await logAuditAction({
      action: "DELETE_MODULE",
      actorId: session.user.id,
      actorEmail: session.user.email,
      targetId: id,
      details: { moduleName: targetModule.name, packId: targetModule.packId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete module:", error);
    return NextResponse.json({ error: "Failed to delete module" }, { status: 500 });
  }
}
