import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

// GET /api/workspace/tenant-users — list all tenant users for the current workspace
export async function GET() {
  const workspace = await getWorkspace();
  if (!workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await db.tenantUser.findMany({
    where: { workspaceId: workspace.id },
    select: { id: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(users);
}

// POST /api/workspace/tenant-users — create a new tenant user
export async function POST(req: Request) {
  const workspace = await getWorkspace();
  if (!workspace) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username, password, role } = await req.json();

  if (!username || typeof username !== "string" || username.trim().length < 3) {
    return NextResponse.json(
      { error: "Username must be at least 3 characters" },
      { status: 400 }
    );
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const cleanUsername = username.trim();
  const cleanRole =
    typeof role === "string" && role.trim().length > 0 ? role.trim() : "member";

  const existing = await db.tenantUser.findFirst({
    where: { workspaceId: workspace.id, username: cleanUsername },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A user with that username already exists" },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);
  const created = await db.tenantUser.create({
    data: {
      workspaceId: workspace.id,
      username: cleanUsername,
      password: hashed,
      role: cleanRole,
    },
    select: { id: true, username: true, role: true, createdAt: true },
  });

  return NextResponse.json(created, { status: 201 });
}
