import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

// POST /api/packs/uninstall — remove a pack and all its tables/pages
export async function POST(req: Request) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { packId } = await req.json();
  if (!packId) return NextResponse.json({ error: "packId is required" }, { status: 400 });

  const installed = await db.installedPack.findUnique({
    where: { packId_workspaceId: { packId, workspaceId: workspace.id } },
  });
  if (!installed) {
    return NextResponse.json({ error: "Pack not installed" }, { status: 404 });
  }

  await db.$transaction(async (tx) => {
    // Delete all tables created by this pack (cascade deletes fields + records)
    await tx.table.deleteMany({
      where: { packSource: packId, workspaceId: workspace.id },
    });

    // Delete all pages created by this pack
    await tx.page.deleteMany({
      where: { packSource: packId, workspaceId: workspace.id },
    });

    // Remove install record
    await tx.installedPack.delete({
      where: { packId_workspaceId: { packId, workspaceId: workspace.id } },
    });
  });

  return NextResponse.json({ message: "Pack uninstalled successfully" });
}
