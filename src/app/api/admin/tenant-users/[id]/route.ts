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
    const { role } = body;

    const tenantUser = await db.tenantUser.update({
      where: { id },
      data: { role },
      include: { workspace: true },
    });

    await logAuditAction({
      action: "UPDATE_TENANT_USER_ROLE",
      actorId: session.user.id,
      actorEmail: session.user.email,
      targetId: id,
      details: { newRole: role, targetUsername: tenantUser.username, workspaceSlug: tenantUser.workspace.slug },
    });

    return NextResponse.json(tenantUser);
  } catch (error) {
    console.error("Failed to update tenant user role:", error);
    return NextResponse.json({ error: "Failed to update tenant user" }, { status: 500 });
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

    const targetUser = await db.tenantUser.findUnique({ where: { id }, include: { workspace: true } });

    await db.tenantUser.delete({
      where: { id },
    });

    await logAuditAction({
      action: "DELETE_TENANT_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      targetId: id,
      details: { targetUsername: targetUser?.username, workspaceSlug: targetUser?.workspace?.slug },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete tenant user:", error);
    return NextResponse.json({ error: "Failed to delete tenant user" }, { status: 500 });
  }
}
