import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAuditAction } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    const setting = await db.systemSetting.upsert({
      where: { id: "global" },
      update: { data: body },
      create: { id: "global", data: body },
    });

    await logAuditAction({
      action: "UPDATE_GLOBAL_SETTINGS",
      actorId: session.user.id,
      actorEmail: session.user.email,
      details: body,
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Failed to update global settings:", error);
    return NextResponse.json({ error: "Failed to update global settings" }, { status: 500 });
  }
}
