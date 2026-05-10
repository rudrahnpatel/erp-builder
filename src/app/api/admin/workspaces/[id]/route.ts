import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAuditAction } from "@/lib/audit";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const targetWorkspace = await db.workspace.findUnique({ where: { id } });

    if (!targetWorkspace) {
        return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    await db.workspace.delete({
      where: { id },
    });

    await logAuditAction({
      action: "DELETE_WORKSPACE",
      actorId: session.user.id,
      actorEmail: session.user.email,
      targetId: id,
      details: { workspaceSlug: targetWorkspace.slug, workspaceName: targetWorkspace.name },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete workspace:", error);
    return NextResponse.json({ error: "Failed to delete workspace" }, { status: 500 });
  }
}
