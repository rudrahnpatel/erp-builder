import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeSlug, slugProblem } from "@/lib/slug";

/**
 * GET /api/workspace/check-slug?slug=myerp
 *
 * Used by the onboarding flow to tell the user whether their desired
 * subdomain is available before they hit Launch. Replaces the previous
 * hardcoded `["admin","test","demo","app"]` check.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("slug") || "";

  const problem = slugProblem(raw);
  if (problem) {
    return NextResponse.json({
      available: false,
      slug: normalizeSlug(raw),
      reason: problem,
    });
  }

  const slug = normalizeSlug(raw);

  try {
    const existing = await db.workspace.findUnique({ where: { slug } });

    return NextResponse.json({
      available: !existing,
      slug,
      reason: existing ? "Already taken." : null,
    });
  } catch (error) {
    console.error("[CHECK_SLUG_ERROR]", error);
    return NextResponse.json(
      { available: false, slug, reason: "Database unavailable. Please try again later." },
      { status: 503 }
    );
  }
}
