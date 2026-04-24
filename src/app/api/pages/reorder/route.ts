import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

export async function PATCH(req: Request) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pageIds } = await req.json();
  if (!pageIds || !Array.isArray(pageIds)) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  // Ensure all pages belong to this workspace to prevent tampering
  const pages = await db.page.findMany({
    where: { workspaceId: workspace.id, id: { in: pageIds } },
    select: { id: true }
  });
  
  const validIds = new Set(pages.map(p => p.id));
  
  const updates = pageIds.filter(id => validIds.has(id)).map((id, index) =>
    db.page.update({
      where: { id },
      data: { order: index },
    })
  );

  try {
    await db.$transaction(updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder pages:", error);
    return NextResponse.json({ error: "Failed to reorder pages" }, { status: 500 });
  }
}
