import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

// GET /api/dev/modules/[moduleId]/pages — list pages scoped to this module
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { moduleId } = await params;
    const mod = await db.moduleDefinition.findFirst({
      where: { id: moduleId, workspaceId: workspace.id },
    });
    if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 });

    const pages = await db.page.findMany({
      where: { workspaceId: workspace.id, packSource: mod.packId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("[DEV_MODULE_PAGES_LIST_ERROR]", error);
    return NextResponse.json({ error: "Failed to list module pages" }, { status: 500 });
  }
}

// POST /api/dev/modules/[moduleId]/pages — create a page scoped to this module
export async function POST(
  req: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { moduleId } = await params;
    const mod = await db.moduleDefinition.findFirst({
      where: { id: moduleId, workspaceId: workspace.id },
    });
    if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 });

    const { title, icon, blocks } = await req.json();
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    // Get the last page order within this module's pages
    const lastPage = await db.page.findFirst({
      where: { workspaceId: workspace.id, packSource: mod.packId },
      orderBy: { order: "desc" },
    });

    const page = await db.page.create({
      data: {
        title,
        icon: icon || null,
        blocks: blocks || [],
        order: (lastPage?.order ?? -1) + 1,
        workspaceId: workspace.id,
        packSource: mod.packId,
        packPageKey: title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("[DEV_MODULE_PAGES_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to create module page" }, { status: 500 });
  }
}
