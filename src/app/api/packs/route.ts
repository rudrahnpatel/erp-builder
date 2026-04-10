import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import { getAllPacks } from "@/lib/packs";

// GET /api/packs — list all available packs + installed status
export async function GET() {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const installed = await db.installedPack.findMany({
    where: { workspaceId: workspace.id },
  });

  const installedIds = new Set(installed.map((p) => p.packId));

  const packs = getAllPacks().map((pack) => ({
    ...pack,
    installed: installedIds.has(pack.id),
  }));

  return NextResponse.json(packs);
}
