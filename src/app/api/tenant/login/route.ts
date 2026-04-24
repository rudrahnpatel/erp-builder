import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { slug, username, password } = await req.json();

    if (!slug || !username || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const workspace = await db.workspace.findUnique({
      where: { slug },
      include: { tenantUsers: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const user = workspace.tenantUsers.find((u) => u.username === username);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Set a simple cookie for tenant authentication
    // In a real app, this should be a JWT with proper expiration and signing
    // For this prototype, we'll store the workspaceId and tenantUserId
    const cookieStore = await cookies();
    cookieStore.set(`tenant_auth_${slug}`, user.id, {
      path: `/apps/${slug}`,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error("[TENANT_LOGIN_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
