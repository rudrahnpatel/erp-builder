import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

// GET /api/pages — list all pages in workspace
export async function GET() {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pages = await db.page.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(pages);
}

// POST /api/pages — create a page
export async function POST(req: Request) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, icon, blocks } = await req.json();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const lastPage = await db.page.findFirst({
    where: { workspaceId: workspace.id },
    orderBy: { order: "desc" },
  });

  const page = await db.page.create({
    data: {
      title,
      icon: icon || null,
      blocks: blocks || [],
      order: (lastPage?.order ?? -1) + 1,
      workspaceId: workspace.id,
    },
  });

  return NextResponse.json(page, { status: 201 });
}
