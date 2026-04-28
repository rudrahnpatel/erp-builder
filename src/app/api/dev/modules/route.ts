import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/dev/modules — list modules authored by the current dev
export async function GET() {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const modules = await db.moduleDefinition.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      modules: modules.map((m) => ({
        id: m.id,
        packId: m.packId,
        name: m.name,
        description: m.description,
        icon: m.icon,
        category: m.category,
        version: m.version,
        published: m.published,
        tableCount: (m.tables as any[])?.length || 0,
        pageCount: (m.pages as any[])?.length || 0,
        updatedAt: m.updatedAt,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error("[DEV_MODULES_LIST_ERROR]", error);
    return NextResponse.json({ error: "Failed to list modules" }, { status: 500 });
  }
}

// POST /api/dev/modules — create a new module
export async function POST(req: Request) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, description, icon, category } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Module name is required" }, { status: 400 });
    }

    // Generate a URL-safe packId from the name
    const packId = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      || `module-${Date.now()}`;

    // Check uniqueness
    const existing = await db.moduleDefinition.findUnique({ where: { packId } });
    if (existing) {
      return NextResponse.json(
        { error: `A module with ID "${packId}" already exists. Try a different name.` },
        { status: 409 }
      );
    }

    const mod = await db.moduleDefinition.create({
      data: {
        packId,
        name: name.trim(),
        description: description?.trim() || "",
        icon: icon || "package",
        category: category || "Custom",
        authorId: session.user.id,
        workspaceId: workspace.id,
      },
    });

    return NextResponse.json(
      {
        message: `Module "${mod.name}" created`,
        module: {
          id: mod.id,
          packId: mod.packId,
          name: mod.name,
          description: mod.description,
          icon: mod.icon,
          category: mod.category,
          version: mod.version,
          published: mod.published,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[DEV_MODULES_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to create module" }, { status: 500 });
  }
}
