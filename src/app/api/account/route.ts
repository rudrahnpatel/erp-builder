import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { compare } from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// DELETE /api/account — permanently delete the signed-in user, their workspace,
// and all workspace-scoped data (cascades through Table/Page/InstalledPack/
// InstalledPlugin via Prisma onDelete: Cascade).
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password, confirm } = (await req.json().catch(() => ({}))) as {
      password?: string;
      confirm?: string;
    };

    if (confirm !== "DELETE") {
      return NextResponse.json(
        { error: "Type DELETE to confirm." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { workspace: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (!password || !(await compare(password, user.password))) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    await db.$transaction(async (tx) => {
      if (user.workspace) {
        await tx.workspace.delete({ where: { id: user.workspace.id } });
      }
      await tx.user.delete({ where: { id: user.id } });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[ACCOUNT_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Couldn't delete account." }, { status: 500 });
  }
}
