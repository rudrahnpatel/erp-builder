import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adminId, adminPassword, accountPassword } = await req.json();

    if (!adminId || !adminPassword) {
      return NextResponse.json({ error: "Admin ID and Password are required" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Find the existing admin user for this workspace, or create one if none exists.
    const existingAdmin = await db.tenantUser.findFirst({
      where: { workspaceId: workspace.id, role: "admin" },
      orderBy: { createdAt: "asc" }
    });

    if (existingAdmin) {
      if (!accountPassword) {
        return NextResponse.json({ error: "Your account password is required to change existing admin credentials." }, { status: 403 });
      }

      // Verify the builder's account password
      const builderUser = await db.user.findUnique({ where: { id: workspace.userId } });
      if (!builderUser) {
        return NextResponse.json({ error: "Builder account not found." }, { status: 404 });
      }

      const isValid = await bcrypt.compare(accountPassword, builderUser.password);
      if (!isValid) {
        return NextResponse.json({ error: "Incorrect account password." }, { status: 403 });
      }

      // Update existing admin
      await db.tenantUser.update({
        where: { id: existingAdmin.id },
        data: {
          username: adminId,
          password: hashedPassword,
        },
      });
    } else {
      // Create new admin if for some reason it didn't exist
      await db.tenantUser.create({
        data: {
          workspaceId: workspace.id,
          username: adminId,
          password: hashedPassword,
          role: "admin",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[UPDATE_ADMIN_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update admin credentials." },
      { status: 500 }
    );
  }
}
