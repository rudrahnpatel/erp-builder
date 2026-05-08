import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

export async function PATCH(req: Request) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const updated = await db.workspace.update({
      where: { id: workspace.id },
      data: {
        settings: body,
      },
    });

    return NextResponse.json({ settings: updated.settings });
  } catch (error) {
    console.error("[WORKSPACE_SETTINGS_PATCH]", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
