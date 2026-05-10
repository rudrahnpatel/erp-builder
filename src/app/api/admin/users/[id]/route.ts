import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAuditAction } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    if (role !== "admin" && role !== "user") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent removing admin from oneself
    if (id === session.user.id && role !== "admin") {
      return NextResponse.json(
        { error: "Cannot remove your own admin access" },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    await logAuditAction({
      action: "UPDATE_USER_ROLE",
      actorId: session.user.id,
      actorEmail: session.user.email,
      targetId: id,
      details: { newRole: role, targetEmail: user.email },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to update user role:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

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

    // Prevent deleting oneself
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const targetUser = await db.user.findUnique({ where: { id }, select: { email: true } });

    await db.user.delete({
      where: { id },
    });

    await logAuditAction({
      action: "DELETE_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      targetId: id,
      details: { targetEmail: targetUser?.email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
