import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import { normalizeSlug, RESERVED_SLUGS } from "@/lib/slug";
import { ensureBuiltinPages } from "@/lib/default-pages";

export async function POST(req: Request) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { appName, companyName, subdomain, presetId } = await req.json();

    if (!appName) {
      return NextResponse.json({ error: "appName is required" }, { status: 400 });
    }

    const slug = normalizeSlug(subdomain || "");
    if (!slug) {
      return NextResponse.json(
        { error: "A valid subdomain is required" },
        { status: 400 }
      );
    }
    if (RESERVED_SLUGS.has(slug)) {
      return NextResponse.json(
        { error: "This subdomain is reserved" },
        { status: 400 }
      );
    }

    // If the slug is taken by someone else (not this workspace), reject.
    const existing = await db.workspace.findUnique({ where: { slug } });
    if (existing && existing.id !== workspace.id) {
      return NextResponse.json(
        { error: "This subdomain is already taken" },
        { status: 409 }
      );
    }

    const updated = await db.$transaction(async (tx) => {
      const next = await tx.workspace.update({
        where: { id: workspace.id },
        data: { name: appName, slug },
      });
      await ensureBuiltinPages(tx, workspace.id);
      return next;
    });

    // companyName is intentionally unused for now — there's no column for it
    // yet. Presets are still a client-only concept; wiring preset-driven pack
    // installs is a follow-up.
    void companyName;
    void presetId;

    return NextResponse.json({ success: true, workspace: updated });

  } catch (error) {
    console.error("[LAUNCH_ERROR]", error);
    return NextResponse.json(
      { error: "Database unavailable. Please try again later." },
      { status: 503 }
    );
  }
}

